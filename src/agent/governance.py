"""
Parameter Governance — 5-Level Priority Hierarchy with Provenance
==================================================================

Implements a deterministic parameter resolution pipeline where every
weather / environmental parameter is sourced from one of five priority
levels.  The governor validates physical bounds, records full provenance,
and serialises an audit-ready snapshot to JSON.

Priority levels (highest → lowest)
-----------------------------------
5. **User explicit overrides**
4. **LLM contextual suggestions**
3. **Live API weather data** (e.g. OpenWeatherMap)
2. **IWEC standardised weather files**
1. **Default config values**

Example
-------
>>> gov = ParameterGovernor()
>>> resolved = gov.resolve_parameters(
...     user_overrides={"temperature": 35.0},
...     defaults={"temperature": 20.0, "wind_speed": 3.0},
... )
>>> resolved.temperature
35.0
>>> resolved.source_map["temperature"]
'user_override'
"""

from __future__ import annotations

import json
import logging
from dataclasses import asdict, dataclass, field
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Physical validation bounds
# ---------------------------------------------------------------------------

PHYSICAL_BOUNDS: Dict[str, Dict[str, float]] = {
    "temperature": {"min": -40.0, "max": 60.0, "unit_label": "°C"},
    "wind_speed": {"min": 0.0, "max": 50.0, "unit_label": "m/s"},
    "humidity": {"min": 0.0, "max": 100.0, "unit_label": "%"},
    "solar_radiation": {"min": 0.0, "max": 1400.0, "unit_label": "W/m²"},
}

# The canonical parameter names managed by the governor.
GOVERNED_PARAMS: List[str] = list(PHYSICAL_BOUNDS.keys())


# ---------------------------------------------------------------------------
# Data classes
# ---------------------------------------------------------------------------

@dataclass
class ResolvedParameters:
    """Fully resolved set of environmental parameters with source attribution.

    Each weather field stores a ``float | None`` value.  The ``source_map``
    records which priority level provided each parameter, and
    ``confidence_map`` optionally stores confidence scores.

    Attributes
    ----------
    temperature : float | None
        Ambient air temperature (°C).
    wind_speed : float | None
        Wind speed (m/s).
    humidity : float | None
        Relative humidity (%).
    solar_radiation : float | None
        Incoming solar radiation (W/m²).
    wind_direction : float | None
        Wind direction (degrees, 0-360).
    pressure : float | None
        Atmospheric pressure (hPa).
    cloud_cover : float | None
        Cloud cover fraction (0-1).
    source_map : dict[str, str]
        ``{param_name: source_label}`` for every resolved parameter.
    confidence_map : dict[str, float]
        ``{param_name: 0.0..1.0}`` confidence of each resolved value.
    validation_warnings : list[str]
        Warnings emitted during physical-bound validation.
    """

    temperature: Optional[float] = None
    wind_speed: Optional[float] = None
    humidity: Optional[float] = None
    solar_radiation: Optional[float] = None
    wind_direction: Optional[float] = None
    pressure: Optional[float] = None
    cloud_cover: Optional[float] = None

    source_map: Dict[str, str] = field(default_factory=dict)
    confidence_map: Dict[str, float] = field(default_factory=dict)
    validation_warnings: List[str] = field(default_factory=list)


# ---------------------------------------------------------------------------
# Priority level labels
# ---------------------------------------------------------------------------

_SOURCE_LABELS: Dict[int, str] = {
    5: "user_override",
    4: "llm_suggestion",
    3: "live_api",
    2: "iwec_file",
    1: "default_config",
}


# ---------------------------------------------------------------------------
# ParameterGovernor
# ---------------------------------------------------------------------------

class ParameterGovernor:
    """Resolve environmental parameters using a 5-level priority hierarchy.

    The governor iterates from the **highest** priority source (user
    overrides, level 5) down to the **lowest** (defaults, level 1) and
    takes the first non-``None`` value for each parameter.  Values are then
    clamped/validated against physical bounds before the result is returned.

    Parameters
    ----------
    custom_bounds : dict, optional
        Override the default :data:`PHYSICAL_BOUNDS`.  Keys are parameter
        names; values are ``{"min": float, "max": float}``.
    strict : bool
        When ``True``, raise :class:`ValueError` instead of clamping values
        that fall outside physical bounds.  Default ``False``.
    """

    def __init__(
        self,
        custom_bounds: Optional[Dict[str, Dict[str, float]]] = None,
        strict: bool = False,
    ) -> None:
        self.bounds = {**PHYSICAL_BOUNDS, **(custom_bounds or {})}
        self.strict = strict

    # -- public API --------------------------------------------------------

    def resolve_parameters(
        self,
        user_overrides: Optional[Dict[str, float]] = None,
        llm_suggestions: Optional[Dict[str, float]] = None,
        live_data: Optional[Dict[str, float]] = None,
        iwec_data: Optional[Dict[str, float]] = None,
        defaults: Optional[Dict[str, float]] = None,
    ) -> ResolvedParameters:
        """Resolve each parameter from the highest-priority available source.

        Parameters
        ----------
        user_overrides : dict, optional
            Level 5 — explicit values provided by the user.
        llm_suggestions : dict, optional
            Level 4 — contextual values suggested by an LLM.
        live_data : dict, optional
            Level 3 — real-time data from a weather API.
        iwec_data : dict, optional
            Level 2 — values from IWEC standardised weather files.
        defaults : dict, optional
            Level 1 — fallback values from configuration.

        Returns
        -------
        ResolvedParameters
            Validated, source-attributed parameter set.
        """
        # Build the priority stack (highest first)
        sources: List[tuple[int, Dict[str, float]]] = [
            (5, user_overrides or {}),
            (4, llm_suggestions or {}),
            (3, live_data or {}),
            (2, iwec_data or {}),
            (1, defaults or {}),
        ]

        resolved_values: Dict[str, Optional[float]] = {}
        source_map: Dict[str, str] = {}
        confidence_map: Dict[str, float] = {}

        # All candidate parameter names across all sources
        all_params: set[str] = set()
        for _, src in sources:
            all_params.update(src.keys())
        # Ensure governed params are always considered
        all_params.update(GOVERNED_PARAMS)

        for param in all_params:
            for level, src in sources:
                val = src.get(param)
                if val is not None:
                    resolved_values[param] = val
                    source_map[param] = _SOURCE_LABELS.get(level, f"level_{level}")
                    # Higher-priority sources get higher confidence
                    confidence_map[param] = min(1.0, 0.5 + level * 0.1)
                    break
            else:
                resolved_values[param] = None

        # Build result
        result = ResolvedParameters(
            temperature=resolved_values.get("temperature"),
            wind_speed=resolved_values.get("wind_speed"),
            humidity=resolved_values.get("humidity"),
            solar_radiation=resolved_values.get("solar_radiation"),
            wind_direction=resolved_values.get("wind_direction"),
            pressure=resolved_values.get("pressure"),
            cloud_cover=resolved_values.get("cloud_cover"),
            source_map=source_map,
            confidence_map=confidence_map,
        )

        # Validate
        result = self.validate_physical_bounds(result)
        return result

    # -- validation --------------------------------------------------------

    def validate_physical_bounds(
        self, params: ResolvedParameters
    ) -> ResolvedParameters:
        """Enforce physical bounds on all governed parameters.

        Values outside the valid range are **clamped** (or raise
        ``ValueError`` when ``self.strict`` is ``True``).  Warnings are
        appended to ``params.validation_warnings``.

        Parameters
        ----------
        params : ResolvedParameters
            The parameter set to validate (modified **in-place**).

        Returns
        -------
        ResolvedParameters
            The same object, with values clamped and warnings added.

        Raises
        ------
        ValueError
            If ``self.strict`` is ``True`` and a value is out of bounds.
        """
        warnings: List[str] = list(params.validation_warnings)

        for param_name, bounds in self.bounds.items():
            value = getattr(params, param_name, None)
            if value is None:
                continue

            lo, hi = bounds["min"], bounds["max"]
            unit = bounds.get("unit_label", "")

            if value < lo or value > hi:
                msg = (
                    f"{param_name} = {value}{unit} is outside physical "
                    f"bounds [{lo}, {hi}]{unit}"
                )
                if self.strict:
                    raise ValueError(msg)
                clamped = max(lo, min(hi, value))
                warnings.append(
                    f"{msg}; clamped to {clamped}{unit} "
                    f"(source: {params.source_map.get(param_name, 'unknown')})"
                )
                setattr(params, param_name, clamped)
                logger.warning(msg)

        params.validation_warnings = warnings
        return params

    # -- provenance --------------------------------------------------------

    def generate_provenance_snapshot(
        self,
        resolved_params: ResolvedParameters,
        sources_used: Dict[str, Any],
    ) -> dict:
        """Generate a complete provenance audit trail.

        Parameters
        ----------
        resolved_params : ResolvedParameters
            The resolved parameter set.
        sources_used : dict
            Metadata about each data source that was queried during
            resolution (e.g. API endpoint, file path, timestamps).

        Returns
        -------
        dict
            A JSON-serialisable provenance snapshot.
        """
        snapshot: Dict[str, Any] = {
            "provenance_version": "1.0",
            "generated_at": datetime.now(timezone.utc).isoformat(),
            "governance_hierarchy": [
                {"level": lvl, "label": lbl}
                for lvl, lbl in sorted(
                    _SOURCE_LABELS.items(), reverse=True
                )
            ],
            "resolved_parameters": {
                k: v
                for k, v in asdict(resolved_params).items()
                if k not in ("source_map", "confidence_map", "validation_warnings")
                and v is not None
            },
            "source_attribution": resolved_params.source_map,
            "confidence_scores": resolved_params.confidence_map,
            "validation_warnings": resolved_params.validation_warnings,
            "sources_metadata": sources_used,
        }
        return snapshot

    @staticmethod
    def save_provenance(snapshot: dict, output_path: str | Path) -> Path:
        """Serialise a provenance snapshot to a JSON file.

        Parameters
        ----------
        snapshot : dict
            As returned by :meth:`generate_provenance_snapshot`.
        output_path : str | Path
            Destination file path (typically ``provenance_snapshot.json``).

        Returns
        -------
        Path
            The resolved output path.
        """
        out = Path(output_path)
        out.parent.mkdir(parents=True, exist_ok=True)
        with open(out, "w", encoding="utf-8") as f:
            json.dump(snapshot, f, indent=2, ensure_ascii=False, default=str)
        logger.info("Provenance snapshot saved to %s", out)
        return out
