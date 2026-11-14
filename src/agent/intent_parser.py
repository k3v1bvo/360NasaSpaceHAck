"""
Intent Parser — Natural Language → Structured Simulation Intent
================================================================

Extracts spatial domains, temporal windows, material interventions, and
scenario types from free-text user queries using regex-based structured
extraction.  Provides hooks for optional LLM-enhanced parsing when
available, but the core pipeline is deterministic and has no LLM
dependency.

Example
-------
>>> parser = IntentParser()
>>> intent = parser.parse_query(
...     "Simulate a heatwave in manzanas 101-105 on 2025-01-15 "
...     "with cool roofs (albedo +0.3) and green corridors"
... )
>>> intent.scenario_type
'heatwave'
"""

from __future__ import annotations

import re
from dataclasses import dataclass, field
from datetime import datetime, timedelta
from typing import Callable, List, Optional, Tuple


# ---------------------------------------------------------------------------
# Data classes
# ---------------------------------------------------------------------------

@dataclass
class MaterialIntervention:
    """A single material / vegetation change to apply during simulation.

    Attributes
    ----------
    surface_type : str
        Type of surface being modified (e.g. ``"roof"``, ``"pavement"``,
        ``"green_corridor"``).
    albedo_delta : float
        Change in surface albedo (dimensionless, typically 0 – 1).
    emissivity_delta : float
        Change in surface emissivity (dimensionless).
    vegetation_fraction_delta : float
        Change in vegetation fraction (0 – 1).
    target_zone : str | None
        Optional identifier of the target zone (manzana ID, zone name, etc.).
    """

    surface_type: str
    albedo_delta: float = 0.0
    emissivity_delta: float = 0.0
    vegetation_fraction_delta: float = 0.0
    target_zone: Optional[str] = None


@dataclass
class SimulationIntent:
    """Structured representation of a user's simulation request.

    Attributes
    ----------
    spatial_domain : dict
        Either ``{"type": "bbox", "bbox": (west, south, east, north)}`` or
        ``{"type": "manzana_ids", "ids": [101, 102, ...]}``.
    temporal_window : dict
        ``{"start": datetime, "end": datetime}`` — simulation time span.
    interventions : list[MaterialIntervention]
        Material / vegetation changes requested by the user.
    scenario_type : str
        One of ``"baseline"``, ``"heatwave"``, ``"intervention"``.
    raw_query : str
        The original natural-language query for audit purposes.
    """

    spatial_domain: dict = field(default_factory=dict)
    temporal_window: dict = field(default_factory=dict)
    interventions: List[MaterialIntervention] = field(default_factory=list)
    scenario_type: str = "baseline"
    raw_query: str = ""


# ---------------------------------------------------------------------------
# Regex pattern library
# ---------------------------------------------------------------------------

# Bounding-box literals: "bbox -74.1, 4.5, -74.0, 4.7" or similar
_BBOX_PATTERN = re.compile(
    r"bbox\s*[:\s]*"
    r"(-?\d+\.?\d*)\s*[,\s]\s*"
    r"(-?\d+\.?\d*)\s*[,\s]\s*"
    r"(-?\d+\.?\d*)\s*[,\s]\s*"
    r"(-?\d+\.?\d*)",
    re.IGNORECASE,
)

# Manzana references: "manzanas 101-105", "manzana 42", "blocks 1, 3, 7"
_MANZANA_RANGE_PATTERN = re.compile(
    r"(?:manzanas?|blocks?)\s*(\d+)\s*[-–]\s*(\d+)",
    re.IGNORECASE,
)
_MANZANA_LIST_PATTERN = re.compile(
    r"(?:manzanas?|blocks?)\s*((?:\d+\s*[,\s]\s*)*\d+)",
    re.IGNORECASE,
)

# ISO-style dates: 2025-01-15, 15/01/2025, January 15 2025, etc.
_ISO_DATE = re.compile(r"\d{4}-\d{2}-\d{2}")
_SLASH_DATE = re.compile(r"\d{2}/\d{2}/\d{4}")
_NAMED_MONTH = re.compile(
    r"(?:January|February|March|April|May|June|July|August|September|"
    r"October|November|December)\s+\d{1,2}[,]?\s*\d{4}",
    re.IGNORECASE,
)

# Duration: "for 3 hours", "next 48 hours", "2 days"
_DURATION_PATTERN = re.compile(
    r"(?:for|next)\s+(\d+)\s*(hours?|days?|minutes?)", re.IGNORECASE
)

# Scenario keywords
_HEATWAVE_KEYWORDS = re.compile(
    r"\b(heatwave|heat\s*wave|ola\s*de\s*calor|extreme\s*heat)\b",
    re.IGNORECASE,
)
_INTERVENTION_KEYWORDS = re.compile(
    r"\b(cool\s*roof|green\s*roof|green\s*corridor|albedo|paint|"
    r"vegetation|reflective|permeable|intervenci[oó]n)\b",
    re.IGNORECASE,
)

# Interventions: "cool roofs (albedo +0.3)", "green corridors", etc.
_ALBEDO_PATTERN = re.compile(
    r"albedo\s*[+]?\s*([+-]?\d+\.?\d*)", re.IGNORECASE
)
_EMISSIVITY_PATTERN = re.compile(
    r"emissivity\s*[+]?\s*([+-]?\d+\.?\d*)", re.IGNORECASE
)
_VEGETATION_PATTERN = re.compile(
    r"vegetation(?:\s*fraction)?\s*[+]?\s*([+-]?\d+\.?\d*)", re.IGNORECASE
)

_COOL_ROOF_PATTERN = re.compile(r"\bcool\s*roofs?\b", re.IGNORECASE)
_GREEN_ROOF_PATTERN = re.compile(r"\bgreen\s*roofs?\b", re.IGNORECASE)
_GREEN_CORRIDOR_PATTERN = re.compile(
    r"\bgreen\s*corridors?\b", re.IGNORECASE
)
_PERMEABLE_PAVEMENT_PATTERN = re.compile(
    r"\bpermeable\s*pavements?\b", re.IGNORECASE
)
_REFLECTIVE_PAVEMENT_PATTERN = re.compile(
    r"\breflective\s*pavements?\b", re.IGNORECASE
)

# Zone targeting inside interventions: "in zone A", "on manzana 42"
_TARGET_ZONE_PATTERN = re.compile(
    r"(?:in|on|at|for)\s+(?:zone|zona|manzana|block)\s*(\w+)",
    re.IGNORECASE,
)


# ---------------------------------------------------------------------------
# IntentParser
# ---------------------------------------------------------------------------

class IntentParser:
    """Parse natural-language simulation queries into :class:`SimulationIntent`.

    The parser relies exclusively on regex patterns for the core pipeline so
    it has **no external LLM dependency**.  An optional ``llm_hook`` callback
    can be registered to augment or override the regex-based extraction when
    a language model is available.

    Parameters
    ----------
    default_duration_hours : int
        Default simulation duration when no temporal window is specified.
    llm_hook : callable, optional
        ``(query: str, partial_intent: SimulationIntent) -> SimulationIntent``
        Called after regex extraction to refine the intent.
    """

    def __init__(
        self,
        default_duration_hours: int = 24,
        llm_hook: Optional[
            Callable[[str, SimulationIntent], SimulationIntent]
        ] = None,
    ) -> None:
        self.default_duration_hours = default_duration_hours
        self.llm_hook = llm_hook

    # -- public API --------------------------------------------------------

    def parse_query(self, query: str) -> SimulationIntent:
        """Parse a natural-language query into a structured intent.

        Parameters
        ----------
        query : str
            Free-text user query describing the desired simulation.

        Returns
        -------
        SimulationIntent
            Fully populated intent with spatial domain, temporal window,
            interventions, and scenario type.
        """
        intent = SimulationIntent(raw_query=query)

        intent.spatial_domain = self.extract_spatial_domain(query)
        intent.temporal_window = self.extract_temporal_window(query)
        intent.interventions = self.extract_interventions(query)
        intent.scenario_type = self._classify_scenario(query, intent)

        # Optional LLM refinement
        if self.llm_hook is not None:
            intent = self.llm_hook(query, intent)

        return intent

    # -- spatial extraction ------------------------------------------------

    def extract_spatial_domain(self, query: str) -> dict:
        """Extract geographic references from the query.

        Supports explicit bounding boxes (``bbox W,S,E,N``) and manzana /
        block identifiers (ranges like ``101-105`` or comma-separated lists).

        Parameters
        ----------
        query : str
            Natural-language query.

        Returns
        -------
        dict
            ``{"type": "bbox", "bbox": (W, S, E, N)}`` **or**
            ``{"type": "manzana_ids", "ids": [...]}`` **or**
            ``{"type": "full_domain"}`` when no spatial reference is found.
        """
        # Try bounding box first
        bbox_match = _BBOX_PATTERN.search(query)
        if bbox_match:
            coords = tuple(float(bbox_match.group(i)) for i in range(1, 5))
            return {"type": "bbox", "bbox": coords}

        # Try manzana range
        range_match = _MANZANA_RANGE_PATTERN.search(query)
        if range_match:
            start, end = int(range_match.group(1)), int(range_match.group(2))
            ids = list(range(start, end + 1))
            return {"type": "manzana_ids", "ids": ids}

        # Try manzana list
        list_match = _MANZANA_LIST_PATTERN.search(query)
        if list_match:
            raw = list_match.group(1)
            ids = [int(x.strip()) for x in re.split(r"[,\s]+", raw) if x.strip()]
            return {"type": "manzana_ids", "ids": ids}

        # Default: entire domain
        return {"type": "full_domain"}

    # -- temporal extraction -----------------------------------------------

    def extract_temporal_window(self, query: str) -> dict:
        """Extract the simulation time window from the query.

        Recognises ISO dates (``2025-01-15``), slash dates (``15/01/2025``),
        named months (``January 15, 2025``), and relative durations
        (``next 3 hours``).

        Parameters
        ----------
        query : str
            Natural-language query.

        Returns
        -------
        dict
            ``{"start": datetime, "end": datetime}`` with the resolved
            simulation window.  Falls back to *now + default_duration_hours*
            if no temporal reference is found.
        """
        dates: list[datetime] = []

        # ISO dates
        for m in _ISO_DATE.finditer(query):
            try:
                dates.append(datetime.fromisoformat(m.group()))
            except ValueError:
                pass

        # Slash dates (DD/MM/YYYY)
        for m in _SLASH_DATE.finditer(query):
            try:
                dates.append(datetime.strptime(m.group(), "%d/%m/%Y"))
            except ValueError:
                pass

        # Named month dates
        for m in _NAMED_MONTH.finditer(query):
            text = m.group().replace(",", "")
            try:
                dates.append(datetime.strptime(text, "%B %d %Y"))
            except ValueError:
                pass

        # Duration references
        dur_match = _DURATION_PATTERN.search(query)
        duration_delta: Optional[timedelta] = None
        if dur_match:
            amount = int(dur_match.group(1))
            unit = dur_match.group(2).lower().rstrip("s")
            if unit == "hour":
                duration_delta = timedelta(hours=amount)
            elif unit == "day":
                duration_delta = timedelta(days=amount)
            elif unit == "minute":
                duration_delta = timedelta(minutes=amount)

        # Build window
        if len(dates) >= 2:
            dates.sort()
            return {"start": dates[0], "end": dates[-1]}
        elif len(dates) == 1:
            start = dates[0]
            delta = duration_delta or timedelta(hours=self.default_duration_hours)
            return {"start": start, "end": start + delta}
        elif duration_delta is not None:
            start = datetime.utcnow()
            return {"start": start, "end": start + duration_delta}

        # Fallback
        now = datetime.utcnow()
        return {
            "start": now,
            "end": now + timedelta(hours=self.default_duration_hours),
        }

    # -- intervention extraction -------------------------------------------

    def extract_interventions(self, query: str) -> List[MaterialIntervention]:
        """Extract material / vegetation interventions from the query.

        Recognises cool roofs, green roofs, green corridors, permeable and
        reflective pavements, and explicit albedo / emissivity / vegetation
        delta values.

        Parameters
        ----------
        query : str
            Natural-language query.

        Returns
        -------
        list[MaterialIntervention]
            Zero or more interventions extracted from the query.
        """
        interventions: List[MaterialIntervention] = []

        # Global explicit deltas (may refine below)
        global_albedo = self._extract_float(_ALBEDO_PATTERN, query)
        global_emissivity = self._extract_float(_EMISSIVITY_PATTERN, query)
        global_vegetation = self._extract_float(_VEGETATION_PATTERN, query)
        target_zone = self._extract_target_zone(query)

        # Named intervention archetypes
        if _COOL_ROOF_PATTERN.search(query):
            interventions.append(MaterialIntervention(
                surface_type="cool_roof",
                albedo_delta=global_albedo if global_albedo != 0.0 else 0.30,
                emissivity_delta=global_emissivity if global_emissivity != 0.0 else 0.05,
                vegetation_fraction_delta=0.0,
                target_zone=target_zone,
            ))

        if _GREEN_ROOF_PATTERN.search(query):
            interventions.append(MaterialIntervention(
                surface_type="green_roof",
                albedo_delta=global_albedo if global_albedo != 0.0 else 0.05,
                emissivity_delta=0.0,
                vegetation_fraction_delta=global_vegetation if global_vegetation != 0.0 else 0.60,
                target_zone=target_zone,
            ))

        if _GREEN_CORRIDOR_PATTERN.search(query):
            interventions.append(MaterialIntervention(
                surface_type="green_corridor",
                albedo_delta=0.0,
                emissivity_delta=0.0,
                vegetation_fraction_delta=global_vegetation if global_vegetation != 0.0 else 0.70,
                target_zone=target_zone,
            ))

        if _PERMEABLE_PAVEMENT_PATTERN.search(query):
            interventions.append(MaterialIntervention(
                surface_type="permeable_pavement",
                albedo_delta=global_albedo if global_albedo != 0.0 else 0.10,
                emissivity_delta=0.0,
                vegetation_fraction_delta=0.0,
                target_zone=target_zone,
            ))

        if _REFLECTIVE_PAVEMENT_PATTERN.search(query):
            interventions.append(MaterialIntervention(
                surface_type="reflective_pavement",
                albedo_delta=global_albedo if global_albedo != 0.0 else 0.25,
                emissivity_delta=global_emissivity if global_emissivity != 0.0 else 0.05,
                vegetation_fraction_delta=0.0,
                target_zone=target_zone,
            ))

        # If no named archetype matched but explicit deltas were found,
        # create a generic intervention.
        if (
            not interventions
            and (global_albedo or global_emissivity or global_vegetation)
        ):
            interventions.append(MaterialIntervention(
                surface_type="custom",
                albedo_delta=global_albedo,
                emissivity_delta=global_emissivity,
                vegetation_fraction_delta=global_vegetation,
                target_zone=target_zone,
            ))

        return interventions

    # -- scenario classification -------------------------------------------

    def _classify_scenario(
        self, query: str, intent: SimulationIntent
    ) -> str:
        """Determine the scenario type from keywords and interventions.

        Returns ``"heatwave"`` when heat-wave keywords are found,
        ``"intervention"`` when material interventions exist, and
        ``"baseline"`` otherwise.
        """
        if _HEATWAVE_KEYWORDS.search(query):
            return "heatwave"
        if intent.interventions:
            return "intervention"
        return "baseline"

    # -- helpers -----------------------------------------------------------

    @staticmethod
    def _extract_float(pattern: re.Pattern, text: str) -> float:
        """Return the first captured float from *pattern* or 0.0."""
        m = pattern.search(text)
        return float(m.group(1)) if m else 0.0

    @staticmethod
    def _extract_target_zone(text: str) -> Optional[str]:
        """Return the first target-zone reference or ``None``."""
        m = _TARGET_ZONE_PATTERN.search(text)
        return m.group(1) if m else None
