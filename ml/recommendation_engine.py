"""
Flame in Freefall — Safety Recommendation Engine
NASA Space Apps Challenge 2026

Takes a combustion scenario and returns ranked safety recommendations
with confidence scores and NASA source citations.
"""

from __future__ import annotations
import numpy as np
from dataclasses import dataclass, field
from typing import List


# ── Data structures ─────────────────────────────────────────────────────────

@dataclass
class Recommendation:
    category: str
    text: str
    confidence: float
    source: str
    priority: int = 0  # lower = higher priority


@dataclass
class Scenario:
    material: str = "PMMA"
    O2_concentration: float = 0.21
    pressure_atm: float = 1.0
    flow_velocity_cm_s: float = 5.0
    fuel_diameter_mm: float = 3.0
    material_thickness_mm: float = 1.0
    atmosphere: str = "ISS_Standard"


# ── PSI Investigation Reference Database ────────────────────────────────────

PSI_INVESTIGATIONS = [
    {"id": "BASS-II", "name": "Burning and Suppression of Solids – II",
     "materials": ["PMMA", "Cotton", "SIBAL"],
     "focus": "flame spread over thin flat samples, extinction limits",
     "platform": "ISS",
     "citation": "Bhattacharjee et al., Proc. Combust. Inst. 36, 2017"},
    {"id": "FLEX", "name": "Flame Extinguishment Experiment",
     "materials": ["Heptane", "Methanol"],
     "focus": "droplet combustion, cool flames, radiative extinction",
     "platform": "ISS",
     "citation": "Nayagam et al., Combust. Flame 159(12), 2012"},
    {"id": "FLEX-2", "name": "Flame Extinguishment Experiment – 2",
     "materials": ["Heptane", "Decane", "Dodecane"],
     "focus": "cool flame (LTC) transition, peroxide intermediates",
     "platform": "ISS",
     "citation": "Farouk et al., Proc. Combust. Inst. 35, 2015"},
    {"id": "SoFIE", "name": "Solid Fuel Ignition and Extinction",
     "materials": ["PMMA", "Composite_Fabric"],
     "focus": "concurrent and opposed-flow spread, thick fuel quenching",
     "platform": "ISS",
     "citation": "NASA Glenn SoFIE Science Requirements, 2019"},
    {"id": "Saffire", "name": "Spacecraft Fire Experiment",
     "materials": ["Cotton-Fibreglass", "PMMA_Sheet"],
     "focus": "large-scale flame growth in sealed vehicle volume",
     "platform": "Cygnus (post-ISS departure)",
     "citation": "Urban et al., npj Microgravity 5(1), 2019"},
    {"id": "FLARE", "name": "Flammability Limits at Reduced-gravity Experiment",
     "materials": ["PMMA", "ETFE_Wire", "Nomex", "Polyethylene"],
     "focus": "LOI/MOC shift from 1-g to micro-g per ISO 4589-4",
     "platform": "ISS / Parabolic",
     "citation": "Olson & T'ien, Combust. Flame 213, 2020"},
    {"id": "SPICE", "name": "Smoke Point In Co-flow Experiment",
     "materials": ["Ethylene", "Propane"],
     "focus": "soot inception, smoke point reduction in micro-g",
     "platform": "ISS",
     "citation": "Dotson et al., Combust. Flame 203, 2019"},
    {"id": "ACME", "name": "Advanced Combustion via Microgravity Experiments",
     "materials": ["Methane", "Ethylene"],
     "focus": "edge flames, flame balls, cool diffusion flames",
     "platform": "ISS",
     "citation": "Maruta et al., Combust. Flame 214, 2020"},
]

# ── Sensor recommendations database ────────────────────────────────────────

SENSOR_CONFIGS = {
    "hot_luminous": {
        "sensors": ["UV/IR flame detector", "K-type thermocouple array",
                     "CMOS visible camera 30 fps"],
        "rationale": "Hot luminous flames emit in UV-visible-IR; standard detection sufficient.",
        "source": "NASA-STD-6001B § 5.3, ISS Smoke Detector heritage",
    },
    "cool_flame": {
        "sensors": ["Mid-IR spectrometer (3.5-4.5 μm CH₂O band)",
                     "FTIR CO / H₂O₂ channel",
                     "RTD temperature grid (600-900 K range)",
                     "UV camera (OH* chemiluminescence absent → confirms cool flame)"],
        "rationale": "Cool flames are invisible to human eye and UV detectors; "
                     "mid-IR formaldehyde emission is the primary signature.",
        "source": "Nayagam et al., FLEX-2 results; SoFIE sensor package design",
    },
    "smouldering": {
        "sensors": ["CO electrochemical sensor (threshold 50 ppm)",
                     "Photoelectric smoke detector (particle < 1 μm)",
                     "Thermal imaging camera"],
        "rationale": "Smouldering produces CO and fine aerosol before visible flame.",
        "source": "Ruff et al., ISS smoke detector evaluation, 2014",
    },
}

# ── Suppression strategy database ──────────────────────────────────────────

SUPPRESSION_DB = {
    "water_mist": {
        "best_for": ["PMMA", "Cotton", "Polyethylene"],
        "pressure_psi": 100,
        "discharge_time_s": 10,
        "additive": "None",
        "notes": "Fine mist (d₅₀ < 50 μm) effective for solid fuel fires; "
                 "droplet residence time extended in micro-g.",
        "source": "McKinnon et al., Fire Safety J. 91, 2017; "
                  "FPE microgravity mist studies",
    },
    "co2_flooding": {
        "best_for": ["ETFE_Wire", "Electronics"],
        "pressure_psi": 850,
        "discharge_time_s": 5,
        "additive": "None",
        "notes": "ISS portable fire extinguisher (PFE) baseline; displaces O₂. "
                 "May not suppress cool flames due to LTC kinetics.",
        "source": "ISS PFE design spec; Friedman & Ross, Micro-g Fire Safety, 2001",
    },
    "nitrogen_dilution": {
        "best_for": ["all"],
        "pressure_psi": None,
        "discharge_time_s": 30,
        "additive": "N₂ to reduce O₂ below MOC",
        "notes": "Atmosphere-level response for sealed modules; target O₂ < MOC. "
                 "Requires crew O₂ mask protocol.",
        "source": "NASA-STD-6001B atmosphere management; Saffire-IV results",
    },
    "water_mist_additive": {
        "best_for": ["Nomex", "Cotton", "Composite_Fabric"],
        "pressure_psi": 120,
        "discharge_time_s": 15,
        "additive": "Potassium acetate 5% (aditivo)",
        "notes": "Salt additive enhances suppressant effectiveness on fabric fires; "
                 "NASA WSTF tests show 30% reduction in extinction time.",
        "source": "WSTF mist+additive tests; Takahashi, Fire Technol. 50, 2014",
    },
}


class SafetyRecommendationEngine:
    """
    Given a combustion scenario, generates ranked safety recommendations
    with confidence scores and NASA source citations.
    """

    def __init__(self, model_dir=None):
        self.model_dir = model_dir

    # ── main entry ──────────────────────────────────────────────────────

    def recommend(self, scenario) -> List[Recommendation]:
        """Return a ranked list of all recommendations for the given scenario."""
        if isinstance(scenario, dict):
            s = Scenario(
                material=scenario.get("material", "PMMA"),
                O2_concentration=scenario.get("O2_concentration", 0.21),
                pressure_atm=scenario.get("pressure_atm", 1.0),
                flow_velocity_cm_s=scenario.get("flow_velocity_cm_s", 5.0),
                fuel_diameter_mm=scenario.get("fuel_diameter_mm", 3.0),
                material_thickness_mm=scenario.get("material_thickness_mm", 1.0),
                atmosphere=scenario.get("atmosphere", "ISS_Standard"),
            )
        else:
            s = scenario

        recs: List[Recommendation] = []
        recs.extend(self._psi_recommendations(s))
        recs.extend(self._sensor_recommendations(s))
        recs.extend(self._suppression_recommendations(s))
        recs.extend(self._general_safety_recommendations(s))

        # Sort by priority (lower = more important) then confidence desc
        recs.sort(key=lambda r: (r.priority, -r.confidence))
        return recs

    def recommend_structured(self, scenario) -> dict:
        """Returns structured dictionary for dashboard integration."""
        raw_recs = self.recommend(scenario)
        if isinstance(scenario, dict):
            mat = scenario.get("material", "PMMA")
        else:
            mat = scenario.material

        psi_list = []
        for r in raw_recs:
            if r.category == "PSI Investigation":
                psi_list.append({
                    "id": r.text.split(":")[0].replace("Review ", ""),
                    "name": r.text,
                    "relevance_score": r.confidence,
                    "source": r.source
                })

        return {
            "relevant_psi_investigations": psi_list[:3] if psi_list else [
                {"id": "BASS-II", "name": "BASS-II Polymer Flammability", "relevance_score": 0.95, "source": "NASA GRC"}
            ],
            "detection_sensor_configuration": {
                "primary_detector": "Brunswick Dual-Stage (10-100 nm sub-micron counter)",
                "tdlas_channels": ["H2O2 (7.5 µm)", "CO (4.6 µm)", "CH2O (3.6 µm)"],
                "alarm_threshold": "Densidad numérica > 10^5 partículas/cm³ en banda 10-100 nm"
            },
            "suppression_strategy": {
                "agent": "Niebla Fina de Agua a Alta Presión (NFPA 750)",
                "operating_pressure_bar": 35,
                "droplet_dv050_um": 35,
                "additive": "F-500 Encapsulator Agent (1.0% v/v)",
                "discharge_duration_sec": 60
            },
            "all_recommendations": raw_recs
        }

    # ── PSI investigation relevance ─────────────────────────────────────

    def _psi_recommendations(self, s: Scenario) -> List[Recommendation]:
        recs = []
        for psi in PSI_INVESTIGATIONS:
            score = 0.0
            reasons = []

            # Material match
            if s.material in psi["materials"] or any(
                s.material.lower() in m.lower() for m in psi["materials"]
            ):
                score += 0.45
                reasons.append(f"material {s.material} tested in {psi['id']}")

            # Focus area match
            focus = psi["focus"].lower()
            if s.O2_concentration < 0.19 and "extinction" in focus:
                score += 0.2
                reasons.append("near-extinction O₂ level relevant")
            if s.O2_concentration > 0.25 and "loi" in focus:
                score += 0.2
                reasons.append("enriched O₂ matches FLARE scope")
            if s.flow_velocity_cm_s < 2.0 and ("cool" in focus or "ltc" in focus):
                score += 0.25
                reasons.append("low flow → cool flame regime likely")
            if "saffire" in psi["id"].lower() and s.fuel_diameter_mm > 5:
                score += 0.15
                reasons.append("large-scale sample matches Saffire scope")
            if "soot" in focus or "smoke" in focus:
                score += 0.1
                reasons.append("soot/smoke characterisation relevant")

            if score >= 0.15:
                recs.append(Recommendation(
                    category="PSI Investigation",
                    text=f"Review {psi['id']} ({psi['name']}): {'; '.join(reasons)}.",
                    confidence=round(min(score, 1.0), 3),
                    source=psi["citation"],
                    priority=1,
                ))
        return recs

    # ── sensor configuration ────────────────────────────────────────────

    def _sensor_recommendations(self, s: Scenario) -> List[Recommendation]:
        recs = []

        # Determine expected regime
        cool_flame_likely = (s.flow_velocity_cm_s < 2.0 and
                             s.O2_concentration < 0.25 and
                             s.material in ["PMMA", "Heptane", "Methanol"])

        if cool_flame_likely:
            cfg = SENSOR_CONFIGS["cool_flame"]
            recs.append(Recommendation(
                category="Sensor Configuration",
                text=(f"Deploy cool-flame sensor suite: {', '.join(cfg['sensors'])}. "
                      f"Rationale: {cfg['rationale']}"),
                confidence=0.85,
                source=cfg["source"],
                priority=2,
            ))
        else:
            cfg = SENSOR_CONFIGS["hot_luminous"]
            recs.append(Recommendation(
                category="Sensor Configuration",
                text=(f"Standard hot-flame detection package: {', '.join(cfg['sensors'])}. "
                      f"Rationale: {cfg['rationale']}"),
                confidence=0.90,
                source=cfg["source"],
                priority=2,
            ))

        # Always recommend CO detector for smouldering prelude
        cfg_smol = SENSOR_CONFIGS["smouldering"]
        recs.append(Recommendation(
            category="Sensor Configuration",
            text=(f"Add smouldering pre-fire sensors: {', '.join(cfg_smol['sensors'])}. "
                  f"Rationale: {cfg_smol['rationale']}"),
            confidence=0.75,
            source=cfg_smol["source"],
            priority=3,
        ))

        return recs

    # ── suppression strategy ────────────────────────────────────────────

    def _suppression_recommendations(self, s: Scenario) -> List[Recommendation]:
        recs = []

        for key, sup in SUPPRESSION_DB.items():
            score = 0.0
            if s.material in sup["best_for"] or "all" in sup["best_for"]:
                score += 0.5

            # Environment bonuses
            if key == "co2_flooding" and s.material in ["ETFE_Wire"]:
                score += 0.3
            if key == "nitrogen_dilution" and s.O2_concentration > 0.30:
                score += 0.25
            if key == "water_mist" and s.fuel_diameter_mm < 5:
                score += 0.2
            if key == "water_mist_additive" and s.material in ["Nomex", "Cotton"]:
                score += 0.3

            if score >= 0.3:
                pressure_str = f"Pressure: {sup['pressure_psi']} psi" if sup["pressure_psi"] else "Atmosphere-level"
                recs.append(Recommendation(
                    category="Suppression Strategy",
                    text=(f"{key.replace('_', ' ').title()}: {pressure_str}, "
                          f"discharge {sup['discharge_time_s']}s, "
                          f"additive: {sup['additive']}. {sup['notes']}"),
                    confidence=round(min(score, 1.0), 3),
                    source=sup["source"],
                    priority=2,
                ))

        return recs

    # ── general safety ──────────────────────────────────────────────────

    def _general_safety_recommendations(self, s: Scenario) -> List[Recommendation]:
        recs = []

        # LOI warning
        if s.O2_concentration > 0.30:
            recs.append(Recommendation(
                category="General Safety",
                text=(f"Enriched atmosphere ({s.O2_concentration*100:.0f}% O₂) significantly "
                      f"increases flammability. LOI margins reduced. Ensure all materials "
                      f"meet NASA-STD-6001B Test 1 at operating O₂."),
                confidence=0.95,
                source="NASA-STD-6001B § 4.1; FLARE project findings",
                priority=1,
            ))

        # Micro-g LOI shift warning
        recs.append(Recommendation(
            category="General Safety",
            text=("In microgravity, LOI can decrease 2-5 pp compared to 1-g. "
                  "Materials that barely pass NASA-STD-6001B in 1-g may be flammable "
                  "in orbit. Use the FLARE LOI predictor for microgravity LOI estimate."),
            confidence=0.90,
            source="Olson & T'ien, Combust. Flame 213, 2020; FLARE ISO 4589-4",
            priority=1,
        ))

        # Cool flame warning for low flow
        if s.flow_velocity_cm_s < 3.0:
            recs.append(Recommendation(
                category="General Safety",
                text=("Low ventilation (< 3 cm/s) increases risk of undetectable cool-flame "
                      "regime. Standard UV/IR detectors will NOT trigger. Deploy formaldehyde "
                      "(CH₂O) mid-IR sensor and CO monitor."),
                confidence=0.85,
                source="FLEX-2 cool flame observations; Nayagam et al. 2012",
                priority=1,
            ))

        # Thin fuel warning
        if s.fuel_diameter_mm < 1.5:
            recs.append(Recommendation(
                category="General Safety",
                text=(f"Thin fuel (d={s.fuel_diameter_mm} mm) exhibits curvature-enhanced "
                      f"spread rates significantly faster than flat samples. Wire insulation "
                      f"at this diameter is a high-risk geometry."),
                confidence=0.80,
                source="BASS-II thin-fuel data; Bhattacharjee et al. 2017",
                priority=2,
            ))

        return recs

    # ── convenience methods ─────────────────────────────────────────────

    def get_psi_recommendations(self, scenario: Scenario) -> List[Recommendation]:
        """Return only PSI investigation recommendations."""
        return self._psi_recommendations(scenario)

    def get_sensor_config(self, scenario: Scenario) -> List[Recommendation]:
        """Return only sensor configuration recommendations."""
        return self._sensor_recommendations(scenario)

    def get_suppression_strategy(self, scenario: Scenario) -> List[Recommendation]:
        """Return only suppression strategy recommendations."""
        return self._suppression_recommendations(scenario)

    def format_report(self, scenario: Scenario) -> str:
        """Return a human-readable markdown report."""
        recs = self.recommend(scenario)
        lines = [
            f"# 🔥 Safety Recommendation Report",
            f"**Material:** {scenario.material}  |  "
            f"**O₂:** {scenario.O2_concentration*100:.1f}%  |  "
            f"**Pressure:** {scenario.pressure_atm:.2f} atm  |  "
            f"**Flow:** {scenario.flow_velocity_cm_s:.1f} cm/s",
            "",
        ]
        current_cat = ""
        for r in recs:
            if r.category != current_cat:
                current_cat = r.category
                lines.append(f"\n## {current_cat}")
            conf_bar = "█" * int(r.confidence * 10) + "░" * (10 - int(r.confidence * 10))
            lines.append(f"- [{conf_bar}] **{r.confidence:.0%}** — {r.text}")
            lines.append(f"  _Source: {r.source}_")
        return "\n".join(lines)
