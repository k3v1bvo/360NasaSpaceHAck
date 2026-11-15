"""
Flame in Freefall — Physics-Informed Synthetic Data Generator
NASA Space Apps Challenge 2026

Generates realistic training datasets based on published
BASS-II, FLARE, SoFIE parameter ranges.
"""

import os
import numpy as np
import pandas as pd
from pathlib import Path

# ── Published parameter ranges from PSI investigations ──────────────────────

MATERIALS = ["PMMA", "ETFE_Wire", "Nomex", "Cotton", "Polyethylene"]

MATERIAL_PROPERTIES = {
    "PMMA":         {"LOI_1g": 17.3, "alpha": 1.00, "k_burn": 2.1, "rad_sens": 1.00, "thermal_k": 0.19},
    "ETFE_Wire":    {"LOI_1g": 30.0, "alpha": 1.35, "k_burn": 2.8, "rad_sens": 1.25, "thermal_k": 0.24},
    "Nomex":        {"LOI_1g": 28.5, "alpha": 0.42, "k_burn": 0.9, "rad_sens": 0.75, "thermal_k": 0.13},
    "Cotton":       {"LOI_1g": 18.0, "alpha": 0.90, "k_burn": 1.6, "rad_sens": 0.95, "thermal_k": 0.07},
    "Polyethylene": {"LOI_1g": 17.4, "alpha": 1.10, "k_burn": 2.4, "rad_sens": 1.10, "thermal_k": 0.46},
}

ATMOSPHERE_CONFIGS = {
    "ISS_Standard":         {"P_atm": 1.000, "O2": 0.21},
    "Artemis_Exploration":  {"P_atm": 0.694, "O2": 0.34},
    "Lunar_Surface":        {"P_atm": 0.558, "O2": 0.32},
}

# Ranges from BASS-II & SoFIE publications
O2_RANGE        = (0.15, 0.40)   # mol fraction
PRESSURE_RANGE  = (0.40, 1.10)   # atm
FLOW_VEL_RANGE  = (0.01, 20.0)   # cm/s
FUEL_DIAM_RANGE = (0.3, 10.0)    # mm
THICKNESS_RANGE = (0.1, 5.0)     # mm


# ── Physics equations (mirror simulation/flame_kinetics.py) ─────────────────

def _flame_spread_rate(O2, P, V_g, d_fuel, alpha, k_burn, rad_sens):
    """Compute V_f (mm/s) matching MicrogravityFlameKinetics.calculate_flame_spread."""
    v_transport = 1.95 * (O2 / 0.21) * np.sqrt(max(V_g, 0.04)) * (P ** 0.5)
    curvature   = alpha * (1.0 / (max(d_fuel, 0.1) ** 0.82))
    strain      = max(V_g, 0.05) / (2.0 * max(d_fuel, 0.2) * 0.1)
    cooling     = np.exp(-strain / (48.0 * k_burn))
    rad_loss    = np.exp(-0.28 * rad_sens / max(V_g, 0.02))
    return max(v_transport * curvature * cooling * rad_loss * 2.35, 0.0)


def _loi_microgravity(LOI_1g, thickness, O2, P, material_k):
    """
    Empirical LOI shift model (FLARE ISO 4589-4 correlation).

    In microgravity the absence of buoyancy lowers the LOI by 2-5 pp,
    modulated by thickness (thinner → bigger shift) and atmosphere.
    """
    base_shift   = -3.5                      # pp (Olson & T'ien correlation)
    thick_effect = -0.6 / max(thickness, 0.1)  # thinner fuel → larger reduction
    o2_effect    = 2.8 * (O2 - 0.21)         # higher O2 partially compensates
    p_effect     = 1.2 * (P - 1.0)           # lower pressure slightly increases
    k_effect     = -1.5 * material_k         # higher thermal conductivity → lower LOI
    loi_microg   = LOI_1g + base_shift + thick_effect + o2_effect + p_effect + k_effect
    return max(loi_microg, 5.0)


def _risk_label(V_f, loi_micro, O2):
    """Assign risk class based on physics outputs."""
    danger_score = 0.0
    danger_score += 1.5 * min(V_f / 15.0, 1.0)          # fast spread → danger
    danger_score += 1.5 * max(0, 1.0 - loi_micro / 21.0) # low LOI → danger
    danger_score += 1.0 * (O2 / 0.40)                    # high O2 → danger
    if danger_score > 2.5:
        return "Danger"
    elif danger_score > 1.4:
        return "Caution"
    return "Safe"


# ── Public generator functions ──────────────────────────────────────────────

def generate_flame_spread_dataset(n_samples: int = 5000, seed: int = 42) -> pd.DataFrame:
    """Generate labelled flame-spread data with controlled noise."""
    rng = np.random.default_rng(seed)

    rows = []
    for _ in range(n_samples):
        mat = rng.choice(MATERIALS)
        props = MATERIAL_PROPERTIES[mat]
        O2      = rng.uniform(*O2_RANGE)
        P       = rng.uniform(*PRESSURE_RANGE)
        V_g     = rng.uniform(*FLOW_VEL_RANGE)
        d_fuel  = rng.uniform(*FUEL_DIAM_RANGE)

        V_f = _flame_spread_rate(O2, P, V_g, d_fuel,
                                 props["alpha"], props["k_burn"], props["rad_sens"])
        # Add ±8 % multiplicative Gaussian noise + small additive noise
        V_f_noisy = V_f * (1 + rng.normal(0, 0.08)) + rng.normal(0, 0.05)
        V_f_noisy = max(V_f_noisy, 0.0)

        rows.append({
            "O2_concentration": round(O2, 4),
            "pressure_atm": round(P, 4),
            "flow_velocity_cm_s": round(V_g, 3),
            "fuel_diameter_mm": round(d_fuel, 2),
            "material_type": mat,
            "flame_spread_rate_mm_s": round(V_f_noisy, 4),
        })

    return pd.DataFrame(rows)


def generate_loi_dataset(n_samples: int = 3000, seed: int = 123) -> pd.DataFrame:
    """Generate labelled LOI-shift data (FLARE correlation)."""
    rng = np.random.default_rng(seed)

    rows = []
    for _ in range(n_samples):
        mat = rng.choice(MATERIALS)
        props = MATERIAL_PROPERTIES[mat]
        O2        = rng.uniform(*O2_RANGE)
        P         = rng.uniform(*PRESSURE_RANGE)
        thickness = rng.uniform(*THICKNESS_RANGE)

        loi_micro = _loi_microgravity(props["LOI_1g"], thickness, O2, P, props["thermal_k"])
        loi_micro_noisy = loi_micro * (1 + rng.normal(0, 0.05)) + rng.normal(0, 0.15)
        loi_micro_noisy = max(loi_micro_noisy, 5.0)

        rows.append({
            "material_type": mat,
            "LOI_1g": props["LOI_1g"],
            "material_thickness_mm": round(thickness, 2),
            "O2_concentration": round(O2, 4),
            "pressure_atm": round(P, 4),
            "LOI_microgravity": round(loi_micro_noisy, 3),
        })

    return pd.DataFrame(rows)


def generate_risk_dataset(n_samples: int = 4000, seed: int = 77) -> pd.DataFrame:
    """Generate multi-class risk classification data."""
    rng = np.random.default_rng(seed)

    rows = []
    for _ in range(n_samples):
        mat = rng.choice(MATERIALS)
        props = MATERIAL_PROPERTIES[mat]
        O2      = rng.uniform(*O2_RANGE)
        P       = rng.uniform(*PRESSURE_RANGE)
        V_g     = rng.uniform(*FLOW_VEL_RANGE)
        d_fuel  = rng.uniform(*FUEL_DIAM_RANGE)
        thickness = rng.uniform(*THICKNESS_RANGE)

        V_f = _flame_spread_rate(O2, P, V_g, d_fuel,
                                 props["alpha"], props["k_burn"], props["rad_sens"])
        loi_micro = _loi_microgravity(props["LOI_1g"], thickness, O2, P, props["thermal_k"])
        label = _risk_label(V_f, loi_micro, O2)

        rows.append({
            "O2_concentration": round(O2, 4),
            "pressure_atm": round(P, 4),
            "flow_velocity_cm_s": round(V_g, 3),
            "fuel_diameter_mm": round(d_fuel, 2),
            "material_thickness_mm": round(thickness, 2),
            "material_type": mat,
            "flame_spread_rate_mm_s": round(V_f, 4),
            "LOI_microgravity": round(loi_micro, 3),
            "risk_label": label,
        })

    return pd.DataFrame(rows)


def generate_combustion_telemetry(n_normal: int = 2000, n_cool: int = 400,
                                   seed: int = 55) -> pd.DataFrame:
    """Generate normal-vs-cool-flame telemetry signatures for anomaly detection."""
    rng = np.random.default_rng(seed)

    rows = []
    # Normal hot combustion
    for _ in range(n_normal):
        T_mean = rng.uniform(1100, 1700)
        T_std  = rng.uniform(15, 60)
        H2O2   = rng.uniform(0.0, 3.0)
        CH2O   = rng.uniform(0.5, 5.0)
        CO     = rng.uniform(5, 30)
        rows.append({"T_mean_K": T_mean, "T_std_K": T_std,
                      "H2O2_ppm": H2O2, "CH2O_ppm": CH2O, "CO_ppm": CO,
                      "regime": "normal"})

    # Cool flame regime
    for _ in range(n_cool):
        T_mean = rng.uniform(600, 820)
        T_std  = rng.uniform(10, 35)
        H2O2   = rng.uniform(15, 45)
        CH2O   = rng.uniform(10, 35)
        CO     = rng.uniform(20, 55)
        rows.append({"T_mean_K": T_mean, "T_std_K": T_std,
                      "H2O2_ppm": H2O2, "CH2O_ppm": CH2O, "CO_ppm": CO,
                      "regime": "cool_flame"})

    return pd.DataFrame(rows)


# ── Save helpers ────────────────────────────────────────────────────────────

def save_all_datasets(out_dir: str = "ml/data"):
    """Generate and persist every dataset as CSV."""
    Path(out_dir).mkdir(parents=True, exist_ok=True)

    flame = generate_flame_spread_dataset()
    flame.to_csv(os.path.join(out_dir, "flame_spread_data.csv"), index=False)

    loi = generate_loi_dataset()
    loi.to_csv(os.path.join(out_dir, "loi_shift_data.csv"), index=False)

    risk = generate_risk_dataset()
    risk.to_csv(os.path.join(out_dir, "risk_classification_data.csv"), index=False)

    telem = generate_combustion_telemetry()
    telem.to_csv(os.path.join(out_dir, "combustion_telemetry.csv"), index=False)

    print(f"[OK] Datasets saved to {out_dir}/")
    print(f"     flame_spread_data.csv      : {len(flame):,} rows")
    print(f"     loi_shift_data.csv         : {len(loi):,} rows")
    print(f"     risk_classification_data.csv: {len(risk):,} rows")
    print(f"     combustion_telemetry.csv    : {len(telem):,} rows")
    return {"flame": flame, "loi": loi, "risk": risk, "telemetry": telem}


if __name__ == "__main__":
    save_all_datasets()
