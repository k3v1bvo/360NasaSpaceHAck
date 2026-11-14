"""
Heat Vulnerability Risk (HVR) index computation module.

Implements the HVR formula for Bogotá's *manzanas*:

    HVR_i = ((PET_pred_i − PET_min) / (PET_max − PET_min))
            × (Poblacion_i / Area_i)
            × (1 − NDVI_efectivo_i)
            × β_Cota2750

Classifies each manzana into alert levels (BAJO, MODERADO, ALTO, CRITICO)
and exports the result as a GeoJSON FeatureCollection.

Dependencies:
    geopandas, numpy
"""

from __future__ import annotations

import json
import logging
from enum import Enum
from pathlib import Path
from typing import Any, Dict, List, Optional, Sequence, Tuple, Union

import geopandas as gpd
import numpy as np

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Alert-level enumeration
# ---------------------------------------------------------------------------
class AlertLevel(str, Enum):
    """Heat-vulnerability alert level."""

    BAJO = "BAJO"
    MODERADO = "MODERADO"
    ALTO = "ALTO"
    CRITICO = "CRITICO"


# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------
# Default temperature lapse rate (K per metre of elevation gain)
DEFAULT_LAPSE_RATE: float = -0.0065  # standard atmosphere


# ---------------------------------------------------------------------------
# Main calculator
# ---------------------------------------------------------------------------
class HeatVulnerabilityCalculator:
    """Compute and classify Heat Vulnerability Risk for urban blocks.

    The calculator is stateless — all data is passed through method
    arguments and returned as enriched GeoDataFrames or GeoJSON dicts.

    Parameters
    ----------
    pet_min : float | None
        Minimum PET across the study area.  If ``None`` it is inferred
        from the supplied PET predictions.
    pet_max : float | None
        Maximum PET across the study area.
    """

    def __init__(
        self,
        pet_min: Optional[float] = None,
        pet_max: Optional[float] = None,
    ) -> None:
        self.pet_min = pet_min
        self.pet_max = pet_max

    # ------------------------------------------------------------------
    # β_Cota topographic weighting
    # ------------------------------------------------------------------
    @staticmethod
    def compute_beta_cota(
        elevation: Union[float, np.ndarray],
        temperature_gradient: float = DEFAULT_LAPSE_RATE,
        reference_elevation: float = 2750.0,
    ) -> Union[float, np.ndarray]:
        """Compute the topographic weighting factor β_Cota2750.

        The factor captures how elevation-dependent temperature
        differences amplify or attenuate heat vulnerability.  Values
        above the reference elevation receive ``β < 1`` (cooler, less
        vulnerable), while values below receive ``β > 1`` (warmer, more
        vulnerable).

        Formula::

            ΔT = lapse_rate × (elevation − reference_elevation)
            β   = 1 − ΔT / |lapse_rate × reference_elevation|

        The result is clipped to [0.5, 2.0] for numerical stability.

        Parameters
        ----------
        elevation : float | np.ndarray
            Mean elevation of the manzana(s) in metres.
        temperature_gradient : float
            Temperature lapse rate (K m⁻¹). Default is the standard
            atmosphere value (−0.0065 K m⁻¹).
        reference_elevation : float
            Reference altitude for the *cota 2 750* classification (m).

        Returns
        -------
        float | np.ndarray
            Topographic weighting factor β_Cota2750.
        """
        elev = np.asarray(elevation, dtype=np.float64)
        delta_t = temperature_gradient * (elev - reference_elevation)
        normaliser = abs(temperature_gradient * reference_elevation)
        if normaliser == 0:
            return np.ones_like(elev)
        beta = 1.0 - delta_t / normaliser
        beta = np.clip(beta, 0.5, 2.0)
        return float(beta) if np.ndim(beta) == 0 else beta

    # ------------------------------------------------------------------
    # HVR computation
    # ------------------------------------------------------------------
    def compute_hvr(
        self,
        manzanas_gdf: gpd.GeoDataFrame,
        pet_predictions: Union[np.ndarray, Sequence[float]],
        ndvi_effective: Union[np.ndarray, Sequence[float]],
        beta_cota: Union[float, np.ndarray, Sequence[float]],
    ) -> gpd.GeoDataFrame:
        """Compute the Heat Vulnerability Risk index per manzana.

        .. math::

            HVR_i = \\frac{PET_{pred,i} - PET_{min}}{PET_{max} - PET_{min}}
                    \\times \\frac{Poblacion_i}{Area_i}
                    \\times (1 - NDVI_{efectivo,i})
                    \\times \\beta_{Cota2750}

        The resulting ``HVR`` column is min-max normalised to [0, 1].

        Parameters
        ----------
        manzanas_gdf : GeoDataFrame
            Must contain columns ``Poblacion`` and ``area_m2``.
        pet_predictions : array-like
            Predicted Physiological Equivalent Temperature (°C) per
            manzana — same length as *manzanas_gdf*.
        ndvi_effective : array-like
            Effective NDVI per manzana, range [0, 1].
        beta_cota : float | array-like
            Topographic weighting factor(s).  A scalar applies the same
            weight to every manzana.

        Returns
        -------
        GeoDataFrame
            Input with new columns: ``PET_pred``, ``NDVI_efectivo``,
            ``beta_cota``, ``HVR``, ``alert_level``.

        Raises
        ------
        ValueError
            If required columns are missing from *manzanas_gdf*.
        """
        gdf = manzanas_gdf.copy()

        # Validate required columns
        for col in ("Poblacion", "area_m2"):
            if col not in gdf.columns:
                raise ValueError(
                    f"Column '{col}' is required in manzanas_gdf."
                )

        pet = np.asarray(pet_predictions, dtype=np.float64)
        ndvi = np.asarray(ndvi_effective, dtype=np.float64)
        beta = np.broadcast_to(
            np.asarray(beta_cota, dtype=np.float64), pet.shape,
        )

        # PET normalisation
        pet_min = self.pet_min if self.pet_min is not None else float(np.nanmin(pet))
        pet_max = self.pet_max if self.pet_max is not None else float(np.nanmax(pet))
        pet_range = pet_max - pet_min
        if pet_range == 0:
            logger.warning("PET range is zero; setting normalised PET to 0.5.")
            pet_norm = np.full_like(pet, 0.5)
        else:
            pet_norm = (pet - pet_min) / pet_range

        # Population density
        area = gdf["area_m2"].values.astype(np.float64)
        area = np.where(area > 0, area, 1.0)  # avoid division by zero
        pop = gdf["Poblacion"].values.astype(np.float64)
        pop_density = pop / area

        # Normalise population density to [0, 1]
        pd_min, pd_max = float(np.nanmin(pop_density)), float(np.nanmax(pop_density))
        pd_range = pd_max - pd_min
        if pd_range == 0:
            pop_density_norm = np.full_like(pop_density, 0.5)
        else:
            pop_density_norm = (pop_density - pd_min) / pd_range

        # Vegetation deficit
        veg_deficit = 1.0 - np.clip(ndvi, 0.0, 1.0)

        # HVR
        hvr_raw = pet_norm * pop_density_norm * veg_deficit * beta

        # Final min-max normalisation to [0, 1]
        hvr_min, hvr_max = float(np.nanmin(hvr_raw)), float(np.nanmax(hvr_raw))
        hvr_range = hvr_max - hvr_min
        if hvr_range == 0:
            hvr = np.full_like(hvr_raw, 0.0)
        else:
            hvr = (hvr_raw - hvr_min) / hvr_range

        # Assign columns
        gdf["PET_pred"] = pet
        gdf["NDVI_efectivo"] = ndvi
        gdf["beta_cota"] = beta
        gdf["HVR"] = hvr
        gdf["alert_level"] = [self.classify_alert_level(v) for v in hvr]

        logger.info(
            "HVR computed for %d manzanas. "
            "Distribution: BAJO=%d, MODERADO=%d, ALTO=%d, CRITICO=%d",
            len(gdf),
            (gdf["alert_level"] == AlertLevel.BAJO).sum(),
            (gdf["alert_level"] == AlertLevel.MODERADO).sum(),
            (gdf["alert_level"] == AlertLevel.ALTO).sum(),
            (gdf["alert_level"] == AlertLevel.CRITICO).sum(),
        )
        return gdf

    # ------------------------------------------------------------------
    # Alert classification
    # ------------------------------------------------------------------
    @staticmethod
    def classify_alert_level(hvr: float) -> str:
        """Classify a single HVR value into an alert level.

        Thresholds:

        +-----------+-------------------+
        | Level     | HVR range         |
        +===========+===================+
        | BAJO      | [0.00, 0.25)      |
        | MODERADO  | [0.25, 0.50)      |
        | ALTO      | [0.50, 0.75)      |
        | CRITICO   | [0.75, 1.00]      |
        +-----------+-------------------+

        Parameters
        ----------
        hvr : float
            Heat Vulnerability Risk value in [0, 1].

        Returns
        -------
        str
            One of ``"BAJO"``, ``"MODERADO"``, ``"ALTO"``, ``"CRITICO"``.
        """
        if np.isnan(hvr):
            return AlertLevel.BAJO
        if hvr < 0.25:
            return AlertLevel.BAJO
        if hvr < 0.50:
            return AlertLevel.MODERADO
        if hvr < 0.75:
            return AlertLevel.ALTO
        return AlertLevel.CRITICO

    # ------------------------------------------------------------------
    # GeoJSON export
    # ------------------------------------------------------------------
    @staticmethod
    def generate_risk_geojson(
        manzanas_gdf: gpd.GeoDataFrame,
        output_path: Optional[Union[str, Path]] = None,
        extra_properties: Optional[List[str]] = None,
    ) -> Dict[str, Any]:
        """Export HVR-enriched manzanas as a GeoJSON FeatureCollection.

        Each Feature's ``properties`` include at minimum:

        - ``HVR`` — normalised heat-vulnerability risk [0, 1]
        - ``alert_level`` — categorical alert string
        - ``PET_pred`` — predicted PET (°C)
        - ``NDVI_efectivo`` — effective NDVI
        - ``beta_cota`` — topographic weight
        - ``Poblacion`` — population count
        - ``area_m2`` — polygon area in m²

        Parameters
        ----------
        manzanas_gdf : GeoDataFrame
            Output of :meth:`compute_hvr`.
        output_path : str | Path | None
            If given, writes the GeoJSON to this file.
        extra_properties : list[str] | None
            Additional columns to include in each Feature's properties.

        Returns
        -------
        dict
            GeoJSON FeatureCollection dictionary.
        """
        core_props = [
            "HVR",
            "alert_level",
            "PET_pred",
            "NDVI_efectivo",
            "beta_cota",
            "Poblacion",
            "area_m2",
        ]
        if extra_properties:
            core_props.extend(
                [p for p in extra_properties if p not in core_props],
            )

        cols = [c for c in core_props if c in manzanas_gdf.columns]
        export_gdf = manzanas_gdf[cols + ["geometry"]]

        # Ensure alert_level is serialised as plain string
        if "alert_level" in export_gdf.columns:
            export_gdf = export_gdf.copy()
            export_gdf["alert_level"] = export_gdf["alert_level"].astype(str)

        fc: Dict[str, Any] = json.loads(export_gdf.to_json())

        if output_path is not None:
            p = Path(output_path)
            p.parent.mkdir(parents=True, exist_ok=True)
            p.write_text(
                json.dumps(fc, ensure_ascii=False, indent=2),
                encoding="utf-8",
            )
            logger.info("Risk GeoJSON written to %s", p)

        return fc
