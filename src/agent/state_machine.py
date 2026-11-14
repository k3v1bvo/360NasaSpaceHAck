"""
State Machine — LangGraph Workflow for GeoThermo-Twin AI
=========================================================

Implements a 5-stage state graph that orchestrates the full simulation
pipeline from natural-language query to final report:

1. **IntentAnalysis** — parse user query → ``SimulationIntent``
2. **GeometryProcessing** — spatial joins, SDF encoding, zonal stats
3. **SolverOrchestration** — dispatch to Local-FNO or PINNs
4. **MaterialStrategy** — baseline vs intervention comparison, albedo
   penalty detection with automatic green-infrastructure loop-back
5. **IntegrationReport** — synthesise metrics, validate physical limits,
   produce final ``SimulationResult``

Conditional edges
-----------------
* If ``should_use_pinns`` detects OOD conditions → route to PINNs branch.
* If ``albedo_penalty_detected`` → loop back to SolverOrchestration with
  a green-infrastructure constraint injected.

Example
-------
>>> workflow = GeoThermoWorkflow()
>>> result = workflow.run(
...     "Simulate heat island in manzanas 10-15 for 2025-01-20 "
...     "with cool roofs"
... )
>>> result.metrics["mean_temperature_delta"]
-1.42
"""

from __future__ import annotations

import logging
from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Any, Dict, List, Literal, Optional, TypedDict

try:
    from langgraph.graph import END, StateGraph
except ImportError:  # allow import without langgraph for type-checking
    StateGraph = None  # type: ignore[misc,assignment]
    END = "__end__"

from .intent_parser import IntentParser, MaterialIntervention, SimulationIntent
from .governance import ParameterGovernor, ResolvedParameters

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Result data class
# ---------------------------------------------------------------------------

@dataclass
class SimulationResult:
    """Final output of the GeoThermo workflow.

    Attributes
    ----------
    geojson : dict
        GeoJSON FeatureCollection with per-manzana results and
        thermal-comfort metrics attached as properties.
    metrics : dict
        Aggregated scalar metrics (e.g. mean PET delta, peak UTCI,
        area-weighted albedo change).
    provenance : dict
        Full parameter-provenance snapshot from the governance module.
    warnings : list[str]
        Any validation or physical-limit warnings generated during the run.
    timestamp : str
        ISO 8601 timestamp of result generation.
    scenario_type : str
        The scenario type that was executed.
    """

    geojson: Dict[str, Any] = field(default_factory=dict)
    metrics: Dict[str, Any] = field(default_factory=dict)
    provenance: Dict[str, Any] = field(default_factory=dict)
    warnings: List[str] = field(default_factory=list)
    timestamp: str = ""
    scenario_type: str = "baseline"


# ---------------------------------------------------------------------------
# Workflow state
# ---------------------------------------------------------------------------

class WorkflowState(TypedDict, total=False):
    """All intermediate state carried through the workflow graph.

    Every node reads from and writes to this shared dictionary.
    """

    # Stage 1 — IntentAnalysis
    raw_query: str
    intent: SimulationIntent
    scenario_type: str

    # Stage 2 — GeometryProcessing
    manzanas_gdf: Any  # GeoDataFrame
    sdf_field: Any  # np.ndarray
    spatial_features: Dict[str, Any]

    # Stage 3 — SolverOrchestration
    solver_type: Literal["fno", "pinns"]
    solver_input: Dict[str, Any]
    predicted_fields: Dict[str, Any]  # u, v, w, theta arrays
    resolved_params: ResolvedParameters

    # Stage 4 — MaterialStrategy
    baseline_metrics: Dict[str, float]
    intervention_metrics: Dict[str, float]
    albedo_penalty_detected: bool
    green_infra_constraint: bool
    solver_iterations: int

    # Stage 5 — IntegrationReport
    result: SimulationResult
    validation_passed: bool
    geojson_output: Dict[str, Any]


# ---------------------------------------------------------------------------
# Node functions
# ---------------------------------------------------------------------------

# Maximum loop-back iterations for albedo-penalty correction.
_MAX_SOLVER_ITERATIONS = 3

# OOD thresholds for deciding when to use PINNs.
_OOD_WIND_SPEED_THRESHOLD = 25.0  # m/s — extreme wind
_OOD_TEMPERATURE_THRESHOLD = 50.0  # °C — extreme heat
_MIN_TRAINING_MANZANAS = 5  # minimum manzanas seen during FNO training


def intent_analysis_node(state: WorkflowState) -> WorkflowState:
    """Stage 1: Parse the raw query into a ``SimulationIntent``.

    Calls :class:`IntentParser` and stores the structured intent and
    scenario type in the workflow state.
    """
    query = state.get("raw_query", "")
    parser = IntentParser()
    intent = parser.parse_query(query)

    logger.info(
        "IntentAnalysis: scenario=%s, spatial=%s, interventions=%d",
        intent.scenario_type,
        intent.spatial_domain.get("type", "unknown"),
        len(intent.interventions),
    )

    return {
        **state,
        "intent": intent,
        "scenario_type": intent.scenario_type,
        "albedo_penalty_detected": False,
        "green_infra_constraint": False,
        "solver_iterations": 0,
    }


def geometry_processing_node(state: WorkflowState) -> WorkflowState:
    """Stage 2: Prepare geometry — spatial joins, SDF, zonal statistics.

    In a full deployment this node calls ``SpatialProcessor`` and
    ``SDFEncoder`` from sibling packages.  Here we build the interface
    contract and pass through placeholder structures so that the graph
    can be assembled and tested end-to-end.
    """
    intent: SimulationIntent = state["intent"]
    spatial = intent.spatial_domain

    logger.info(
        "GeometryProcessing: domain_type=%s",
        spatial.get("type", "full_domain"),
    )

    # --- Placeholder: invoke SpatialProcessor & SDFEncoder ----------------
    # In production, replace with:
    #   from src.gis.spatial_join import SpatialProcessor
    #   from src.models.sdf_encoder import SDFEncoder
    #   processor = SpatialProcessor()
    #   manzanas = processor.load_vector_layers(...)
    #   sdf = SDFEncoder().encode(mesh)
    spatial_features: Dict[str, Any] = {
        "domain": spatial,
        "n_manzanas": len(spatial.get("ids", [])) or 0,
        "crs": "EPSG:4326",
    }

    return {
        **state,
        "spatial_features": spatial_features,
        "manzanas_gdf": None,  # GeoDataFrame placeholder
        "sdf_field": None,     # SDF np.ndarray placeholder
    }


def solver_orchestration_node(state: WorkflowState) -> WorkflowState:
    """Stage 3: Dispatch simulation to Local-FNO or PINNs.

    The solver choice depends on :func:`should_use_pinns`.  If a
    green-infrastructure constraint was flagged by the MaterialStrategy
    loop-back, the constraint is injected into the solver input.

    Parameter resolution is performed via :class:`ParameterGovernor`.
    """
    governor = ParameterGovernor()
    resolved = governor.resolve_parameters(
        defaults={
            "temperature": 20.0,
            "wind_speed": 3.0,
            "humidity": 60.0,
            "solar_radiation": 800.0,
        }
    )

    solver_type: Literal["fno", "pinns"] = (
        "pinns" if should_use_pinns(state) else "fno"
    )

    solver_input: Dict[str, Any] = {
        "temperature": resolved.temperature,
        "wind_speed": resolved.wind_speed,
        "humidity": resolved.humidity,
        "solar_radiation": resolved.solar_radiation,
        "spatial_features": state.get("spatial_features", {}),
    }

    # Inject green-infra constraint if looping back
    if state.get("green_infra_constraint"):
        solver_input["green_infra_constraint"] = True
        logger.info("SolverOrchestration: green_infra_constraint injected")

    # Apply interventions to solver input
    intent: SimulationIntent = state["intent"]
    if intent.interventions:
        solver_input["interventions"] = [
            {
                "surface_type": iv.surface_type,
                "albedo_delta": iv.albedo_delta,
                "emissivity_delta": iv.emissivity_delta,
                "vegetation_fraction_delta": iv.vegetation_fraction_delta,
                "target_zone": iv.target_zone,
            }
            for iv in intent.interventions
        ]

    iterations = state.get("solver_iterations", 0) + 1

    logger.info(
        "SolverOrchestration: solver=%s, iteration=%d",
        solver_type, iterations,
    )

    # --- Placeholder: invoke LocalFNO3D or PINNSolver --------------------
    # In production, replace with:
    #   from src.models.local_fno import LocalFNO3D
    #   from src.models.pinns_solver import PINNSolver
    #   model = LocalFNO3D(...) if solver_type == "fno" else PINNSolver(...)
    #   predicted = model.predict(solver_input)
    predicted_fields: Dict[str, Any] = {
        "u": None,      # velocity-x field
        "v": None,      # velocity-y field
        "w": None,      # velocity-z field
        "theta": None,  # potential temperature field
    }

    return {
        **state,
        "solver_type": solver_type,
        "solver_input": solver_input,
        "predicted_fields": predicted_fields,
        "resolved_params": resolved,
        "solver_iterations": iterations,
    }


def material_strategy_node(state: WorkflowState) -> WorkflowState:
    """Stage 4: Compare baseline vs intervention and detect albedo penalties.

    If the intervention *worsens* pedestrian thermal comfort (albedo
    penalty), the node sets ``albedo_penalty_detected = True`` so the
    conditional edge loops back to the solver with a green-infrastructure
    constraint.  The loop is bounded by ``_MAX_SOLVER_ITERATIONS``.
    """
    intent: SimulationIntent = state["intent"]
    iterations = state.get("solver_iterations", 1)

    # --- Placeholder metrics computation ----------------------------------
    # In production, compute PET / UTCI from predicted_fields via
    # ThermalComfortCalculator.
    baseline_metrics: Dict[str, float] = state.get(
        "baseline_metrics",
        {"mean_pet": 35.0, "peak_utci": 38.0, "mean_albedo": 0.20},
    )

    intervention_metrics: Dict[str, float] = dict(baseline_metrics)
    albedo_penalty = False

    if intent.interventions:
        total_albedo_delta = sum(
            iv.albedo_delta for iv in intent.interventions
        )
        total_veg_delta = sum(
            iv.vegetation_fraction_delta for iv in intent.interventions
        )

        intervention_metrics["mean_albedo"] = (
            baseline_metrics["mean_albedo"] + total_albedo_delta
        )
        intervention_metrics["mean_pet"] = (
            baseline_metrics["mean_pet"]
            - total_albedo_delta * 5.0    # rough PET reduction per albedo
            - total_veg_delta * 3.0       # PET reduction per veg fraction
        )
        intervention_metrics["peak_utci"] = (
            baseline_metrics["peak_utci"]
            - total_albedo_delta * 4.0
            - total_veg_delta * 2.5
        )

        # Albedo penalty: if high albedo increases reflected shortwave
        # radiation enough to *raise* pedestrian MRT, flag it.
        if (
            total_albedo_delta > 0.4
            and total_veg_delta < 0.2
            and intervention_metrics["mean_pet"] > baseline_metrics["mean_pet"] - 0.5
        ):
            albedo_penalty = True
            logger.warning(
                "MaterialStrategy: albedo penalty detected "
                "(albedo_delta=%.2f, veg_delta=%.2f, iteration=%d)",
                total_albedo_delta, total_veg_delta, iterations,
            )

    # Prevent infinite loops
    if iterations >= _MAX_SOLVER_ITERATIONS:
        albedo_penalty = False
        logger.info(
            "MaterialStrategy: max iterations (%d) reached, "
            "proceeding without loop-back",
            _MAX_SOLVER_ITERATIONS,
        )

    return {
        **state,
        "baseline_metrics": baseline_metrics,
        "intervention_metrics": intervention_metrics,
        "albedo_penalty_detected": albedo_penalty,
        "green_infra_constraint": albedo_penalty,
    }


def integration_report_node(state: WorkflowState) -> WorkflowState:
    """Stage 5: Synthesise metrics, validate physical limits, build output.

    Produces the final :class:`SimulationResult` with GeoJSON, aggregated
    metrics, and the provenance snapshot.
    """
    intent: SimulationIntent = state["intent"]
    resolved: Optional[ResolvedParameters] = state.get("resolved_params")

    # --- Metrics aggregation ----------------------------------------------
    baseline = state.get("baseline_metrics", {})
    intervention = state.get("intervention_metrics", {})

    metrics: Dict[str, Any] = {
        "baseline": baseline,
        "intervention": intervention,
        "mean_temperature_delta": (
            intervention.get("mean_pet", 0) - baseline.get("mean_pet", 0)
        ),
        "peak_utci_delta": (
            intervention.get("peak_utci", 0) - baseline.get("peak_utci", 0)
        ),
        "solver_type": state.get("solver_type", "fno"),
        "solver_iterations": state.get("solver_iterations", 1),
    }

    # --- Physical-limit validation ----------------------------------------
    warnings: List[str] = []
    if resolved:
        warnings.extend(resolved.validation_warnings)

    pet_val = intervention.get("mean_pet", baseline.get("mean_pet"))
    if pet_val is not None and pet_val > 50.0:
        warnings.append(
            f"Mean PET ({pet_val:.1f}°C) exceeds extreme heat threshold"
        )
    utci_val = intervention.get("peak_utci", baseline.get("peak_utci"))
    if utci_val is not None and utci_val > 46.0:
        warnings.append(
            f"Peak UTCI ({utci_val:.1f}°C) exceeds extreme heat stress"
        )

    # --- Provenance -------------------------------------------------------
    provenance: Dict[str, Any] = {}
    if resolved:
        governor = ParameterGovernor()
        provenance = governor.generate_provenance_snapshot(
            resolved,
            sources_used={
                "solver": state.get("solver_type", "fno"),
                "query": intent.raw_query,
                "spatial_domain": intent.spatial_domain,
            },
        )

    # --- GeoJSON stub (populated by GIS layer in production) --------------
    geojson: Dict[str, Any] = {
        "type": "FeatureCollection",
        "features": [],
        "metadata": {
            "scenario": intent.scenario_type,
            "spatial_domain": intent.spatial_domain,
            "temporal_window": {
                k: v.isoformat() if isinstance(v, datetime) else v
                for k, v in intent.temporal_window.items()
            },
            "interventions_applied": len(intent.interventions),
        },
    }

    result = SimulationResult(
        geojson=geojson,
        metrics=metrics,
        provenance=provenance,
        warnings=warnings,
        timestamp=datetime.now(timezone.utc).isoformat(),
        scenario_type=intent.scenario_type,
    )

    logger.info(
        "IntegrationReport: scenario=%s, warnings=%d, "
        "mean_temp_delta=%.2f",
        result.scenario_type,
        len(warnings),
        metrics.get("mean_temperature_delta", 0.0),
    )

    return {
        **state,
        "result": result,
        "validation_passed": len(warnings) == 0,
        "geojson_output": geojson,
    }


# ---------------------------------------------------------------------------
# Conditional-edge functions
# ---------------------------------------------------------------------------

def should_use_pinns(state: WorkflowState) -> bool:
    """Decide whether to use PINNs instead of Local-FNO.

    Returns ``True`` when the simulation conditions are likely
    **out-of-distribution** for the FNO model:

    * Extreme wind speed (> 25 m/s)
    * Extreme temperature (> 50 °C)
    * Fewer manzanas than the training set minimum (< 5)
    * Explicit heatwave scenario requested
    """
    intent: Optional[SimulationIntent] = state.get("intent")
    resolved: Optional[ResolvedParameters] = state.get("resolved_params")
    spatial = state.get("spatial_features", {})

    # Heatwave scenarios often exceed training distribution
    if intent and intent.scenario_type == "heatwave":
        return True

    # Extreme weather
    if resolved:
        if (resolved.wind_speed or 0) > _OOD_WIND_SPEED_THRESHOLD:
            return True
        if (resolved.temperature or 0) > _OOD_TEMPERATURE_THRESHOLD:
            return True

    # Very small domain — PINNs generalise better with few points
    n_manzanas = spatial.get("n_manzanas", 0)
    if 0 < n_manzanas < _MIN_TRAINING_MANZANAS:
        return True

    return False


def _route_after_material(
    state: WorkflowState,
) -> Literal["solver_orchestration", "integration_report"]:
    """Conditional routing after MaterialStrategy.

    Loops back to the solver when an albedo penalty is detected;
    otherwise proceeds to the integration report.
    """
    if state.get("albedo_penalty_detected", False):
        return "solver_orchestration"
    return "integration_report"


# ---------------------------------------------------------------------------
# Workflow class
# ---------------------------------------------------------------------------

class GeoThermoWorkflow:
    """LangGraph-based 5-stage workflow for GeoThermo-Twin simulations.

    Builds and compiles a :class:`StateGraph` with five nodes and one
    conditional loop-back edge for albedo-penalty correction.

    Parameters
    ----------
    intent_parser : IntentParser, optional
        Custom intent parser.  If ``None``, a default instance is used.
    parameter_governor : ParameterGovernor, optional
        Custom parameter governor.
    """

    def __init__(
        self,
        intent_parser: Optional[IntentParser] = None,
        parameter_governor: Optional[ParameterGovernor] = None,
    ) -> None:
        self.intent_parser = intent_parser or IntentParser()
        self.parameter_governor = parameter_governor or ParameterGovernor()
        self._graph = self._build_graph()

    # -- graph construction ------------------------------------------------

    def _build_graph(self) -> Any:
        """Construct and compile the LangGraph state graph.

        Returns the compiled graph, or ``None`` if LangGraph is not
        installed (allows import-time and unit-test usage without the
        dependency).
        """
        if StateGraph is None:
            logger.warning(
                "langgraph is not installed; workflow will run in "
                "sequential fallback mode"
            )
            return None

        graph = StateGraph(WorkflowState)

        # Add nodes
        graph.add_node("intent_analysis", intent_analysis_node)
        graph.add_node("geometry_processing", geometry_processing_node)
        graph.add_node("solver_orchestration", solver_orchestration_node)
        graph.add_node("material_strategy", material_strategy_node)
        graph.add_node("integration_report", integration_report_node)

        # Linear edges
        graph.add_edge("intent_analysis", "geometry_processing")
        graph.add_edge("geometry_processing", "solver_orchestration")
        graph.add_edge("solver_orchestration", "material_strategy")

        # Conditional edge: albedo penalty loop-back
        graph.add_conditional_edges(
            "material_strategy",
            _route_after_material,
            {
                "solver_orchestration": "solver_orchestration",
                "integration_report": "integration_report",
            },
        )

        graph.add_edge("integration_report", END)

        # Entry point
        graph.set_entry_point("intent_analysis")

        return graph.compile()

    # -- public API --------------------------------------------------------

    def run(self, query: str) -> SimulationResult:
        """Execute the full GeoThermo simulation pipeline.

        Parameters
        ----------
        query : str
            Natural-language query describing the simulation.

        Returns
        -------
        SimulationResult
            Complete result with GeoJSON, metrics, and provenance.
        """
        initial_state: WorkflowState = {
            "raw_query": query,
            "solver_iterations": 0,
            "albedo_penalty_detected": False,
            "green_infra_constraint": False,
        }

        if self._graph is not None:
            # Run via LangGraph compiled graph
            final_state = self._graph.invoke(initial_state)
        else:
            # Sequential fallback when LangGraph is not available
            final_state = self._run_sequential(initial_state)

        result: SimulationResult = final_state.get(
            "result",
            SimulationResult(
                warnings=["Pipeline did not produce a result"],
                timestamp=datetime.now(timezone.utc).isoformat(),
            ),
        )
        return result

    # -- sequential fallback -----------------------------------------------

    def _run_sequential(
        self, state: WorkflowState
    ) -> WorkflowState:
        """Run the pipeline sequentially without LangGraph.

        Reproduces the same stage order and conditional loop-back as the
        graph version, used when LangGraph is not installed.
        """
        state = intent_analysis_node(state)
        state = geometry_processing_node(state)

        for _ in range(_MAX_SOLVER_ITERATIONS):
            state = solver_orchestration_node(state)
            state = material_strategy_node(state)
            if not state.get("albedo_penalty_detected", False):
                break

        state = integration_report_node(state)
        return state
