"""
Spatial joining and zonal-statistics module.

Loads urban vector layers (manzanas, *cota 2 750*, green areas, population),
classifies altitude zones, performs spatial joins, computes per-manzana
NDVI / LST zonal statistics, and exports results as GeoJSON
FeatureCollections.

Dependencies:
    geopandas, rasterio, rasterstats, shapely, numpy
"""

from __future__ import annotations

import json
import logging
from pathlib import Path
from typing import Any, Dict, List, Optional, Sequence, Tuple, Union

import geopandas as gpd
import numpy as np
import rasterio
from rasterio.features import geometry_mask
from shapely.geometry import mapping
from shapely import strtree

logger = logging.getLogger(__name__)


class SpatialProcessor:
    """Perform spatial operations on urban vector/raster layers.

    Designed around the Bogotá *manzanas* workflow: classify elevation
    zones, join thematic layers, compute per-polygon raster statistics,
    and export enriched GeoJSON.

    Parameters
    ----------
    crs : str
        Target coordinate reference system (e.g. ``"EPSG:4326"``).
        All loaded layers are reprojected to this CRS.
    """

    def __init__(self, crs: str = "EPSG:4326") -> None:
        self.crs = crs

    # ------------------------------------------------------------------
    # Vector I/O
    # ------------------------------------------------------------------
    def load_vector_layers(
        self,
        paths_dict: Dict[str, Union[str, Path]],
    ) -> Dict[str, gpd.GeoDataFrame]:
        """Load multiple vector layers from file paths.

        Accepts Shapefiles (``.shp``), GeoJSON, GeoPackage, and any
        format supported by *fiona*.

        Parameters
        ----------
        paths_dict : dict[str, str | Path]
            Mapping of layer name → file path.  Example::

                {"manzanas": "data/manzanas.shp",
                 "green_areas": "data/green.geojson"}

        Returns
        -------
        dict[str, GeoDataFrame]
            Loaded and CRS-reprojected GeoDataFrames keyed by layer
            name.

        Raises
        ------
        FileNotFoundError
            If a path does not exist.
        """
        layers: Dict[str, gpd.GeoDataFrame] = {}
        for name, path in paths_dict.items():
            p = Path(path)
            if not p.exists():
                raise FileNotFoundError(f"Vector layer '{name}' not found: {p}")
            gdf = gpd.read_file(p)
            if gdf.crs is None:
                logger.warning(
                    "Layer '%s' has no CRS — assuming %s.", name, self.crs,
                )
                gdf = gdf.set_crs(self.crs)
            else:
                gdf = gdf.to_crs(self.crs)
            layers[name] = gdf
            logger.info(
                "Loaded '%s': %d features, CRS=%s", name, len(gdf), gdf.crs,
            )
        return layers

    # ------------------------------------------------------------------
    # Altitude classification
    # ------------------------------------------------------------------
    @staticmethod
    def classify_cota_2750(
        gdf: gpd.GeoDataFrame,
        dem_raster: Union[str, Path, np.ndarray],
        dem_transform: Optional[rasterio.Affine] = None,
        threshold: float = 2750.0,
    ) -> gpd.GeoDataFrame:
        """Classify each polygon as Zona A (< 2 750 m) or Zona B (≥ 2 750 m).

        The classification is based on the *mean* elevation of the DEM
        pixels falling inside each polygon.

        Parameters
        ----------
        gdf : GeoDataFrame
            Polygons to classify (must be in the same CRS as the DEM).
        dem_raster : str | Path | np.ndarray
            Path to a DEM raster file, or a pre-loaded 2-D NumPy array
            (in which case *dem_transform* is required).
        dem_transform : rasterio.Affine | None
            Affine transform when *dem_raster* is a NumPy array.
        threshold : float
            Elevation threshold in metres (default 2 750).

        Returns
        -------
        GeoDataFrame
            Input with new columns ``mean_elevation`` and ``zona_cota``.
        """
        if isinstance(dem_raster, (str, Path)):
            with rasterio.open(dem_raster) as src:
                dem_data = src.read(1).astype(np.float64)
                transform = src.transform
        else:
            dem_data = dem_raster
            if dem_transform is None:
                raise ValueError(
                    "dem_transform is required when dem_raster is an array."
                )
            transform = dem_transform

        mean_elevs: List[float] = []
        for geom in gdf.geometry:
            try:
                mask = geometry_mask(
                    [mapping(geom)],
                    out_shape=dem_data.shape,
                    transform=transform,
                    invert=True,
                )
                vals = dem_data[mask]
                vals = vals[~np.isnan(vals)]
                mean_elevs.append(float(np.mean(vals)) if vals.size > 0 else np.nan)
            except Exception:
                mean_elevs.append(np.nan)

        gdf = gdf.copy()
        gdf["mean_elevation"] = mean_elevs
        gdf["zona_cota"] = np.where(
            np.array(mean_elevs) < threshold, "Zona A", "Zona B",
        )
        logger.info(
            "Classified %d features: %d Zona A, %d Zona B",
            len(gdf),
            (gdf["zona_cota"] == "Zona A").sum(),
            (gdf["zona_cota"] == "Zona B").sum(),
        )
        return gdf

    # ------------------------------------------------------------------
    # Spatial joins
    # ------------------------------------------------------------------
    @staticmethod
    def join_manzanas_with_layers(
        manzanas_gdf: gpd.GeoDataFrame,
        cota_gdf: gpd.GeoDataFrame,
        green_areas_gdf: gpd.GeoDataFrame,
        population_gdf: gpd.GeoDataFrame,
    ) -> gpd.GeoDataFrame:
        """Join thematic vector layers onto the *manzanas* base layer.

        Performs sequential spatial joins:

        1. **Cota 2 750** — transfers ``zona_cota`` via intersection.
        2. **Green areas** — computes the fraction of each manzana
           overlapping green zones (``green_fraction``).
        3. **Population** — sums ``Poblacion`` values within each manzana.

        Parameters
        ----------
        manzanas_gdf : GeoDataFrame
            Base urban-block polygons.
        cota_gdf : GeoDataFrame
            Output of :meth:`classify_cota_2750` (must have ``zona_cota``).
        green_areas_gdf : GeoDataFrame
            Green-area polygons.
        population_gdf : GeoDataFrame
            Point or polygon layer with a ``Poblacion`` column.

        Returns
        -------
        GeoDataFrame
            Enriched manzanas with ``zona_cota``, ``green_fraction``,
            ``Poblacion``, and ``area_m2``.
        """
        result = manzanas_gdf.copy()

        # --- 1.  Cota 2750 ---
        if "zona_cota" in cota_gdf.columns:
            joined = gpd.sjoin(
                result, cota_gdf[["geometry", "zona_cota"]],
                how="left", predicate="intersects",
            )
            # Deduplicate (keep first match)
            joined = joined[~joined.index.duplicated(keep="first")]
            result["zona_cota"] = joined["zona_cota"].values
        else:
            result["zona_cota"] = "Unknown"

        # --- 2.  Green-area fraction ---
        green_fractions: List[float] = []
        for geom in result.geometry:
            if geom is None or geom.is_empty:
                green_fractions.append(0.0)
                continue
            inter = green_areas_gdf.intersection(geom)
            green_area = inter.area.sum()
            green_fractions.append(
                float(green_area / geom.area) if geom.area > 0 else 0.0
            )
        result["green_fraction"] = green_fractions

        # --- 3.  Population ---
        pop_col = "Poblacion"
        if pop_col not in population_gdf.columns:
            # try common alternatives
            for alt in ("poblacion", "POBLACION", "population", "POP"):
                if alt in population_gdf.columns:
                    pop_col = alt
                    break

        if pop_col in population_gdf.columns:
            pop_join = gpd.sjoin(
                result, population_gdf[["geometry", pop_col]],
                how="left", predicate="intersects",
            )
            pop_sum = (
                pop_join.groupby(pop_join.index)[pop_col]
                .sum()
                .reindex(result.index, fill_value=0)
            )
            result["Poblacion"] = pop_sum.values
        else:
            logger.warning(
                "No population column found in population_gdf; "
                "setting Poblacion = 0."
            )
            result["Poblacion"] = 0

        # --- Area (m²) ---
        # Use a projected CRS for accurate area
        projected = result.to_crs("EPSG:3857")
        result["area_m2"] = projected.geometry.area.values

        logger.info("Spatial join complete — %d manzanas enriched.", len(result))
        return result

    # ------------------------------------------------------------------
    # Zonal statistics
    # ------------------------------------------------------------------
    @staticmethod
    def _zonal_stats(
        gdf: gpd.GeoDataFrame,
        raster: Union[str, Path, np.ndarray],
        raster_transform: Optional[rasterio.Affine] = None,
        stat: str = "mean",
    ) -> List[float]:
        """Compute a single zonal statistic per polygon.

        Parameters
        ----------
        gdf : GeoDataFrame
            Polygons for zonal aggregation.
        raster : str | Path | np.ndarray
            Path to raster file, or 2-D array (requires *raster_transform*).
        raster_transform : rasterio.Affine | None
            Affine transform when *raster* is a NumPy array.
        stat : str
            Statistic to compute: ``"mean"``, ``"max"``, ``"min"``,
            ``"median"``, ``"std"``.

        Returns
        -------
        list[float]
            One value per polygon.
        """
        if isinstance(raster, (str, Path)):
            with rasterio.open(raster) as src:
                data = src.read(1).astype(np.float64)
                transform = src.transform
        else:
            data = raster.astype(np.float64)
            if raster_transform is None:
                raise ValueError(
                    "raster_transform is required when raster is an array."
                )
            transform = raster_transform

        stat_fn = {
            "mean": np.nanmean,
            "max": np.nanmax,
            "min": np.nanmin,
            "median": np.nanmedian,
            "std": np.nanstd,
        }.get(stat, np.nanmean)

        values: List[float] = []
        for geom in gdf.geometry:
            try:
                mask = geometry_mask(
                    [mapping(geom)],
                    out_shape=data.shape,
                    transform=transform,
                    invert=True,
                )
                px = data[mask]
                px = px[~np.isnan(px)]
                values.append(float(stat_fn(px)) if px.size > 0 else np.nan)
            except Exception:
                values.append(np.nan)
        return values

    def compute_ndvi_per_manzana(
        self,
        manzanas_gdf: gpd.GeoDataFrame,
        ndvi_raster: Union[str, Path, np.ndarray],
        ndvi_transform: Optional[rasterio.Affine] = None,
    ) -> gpd.GeoDataFrame:
        """Compute mean NDVI per manzana polygon.

        Parameters
        ----------
        manzanas_gdf : GeoDataFrame
            Urban-block polygons.
        ndvi_raster : str | Path | np.ndarray
            NDVI raster (file path or array).
        ndvi_transform : rasterio.Affine | None
            Required when *ndvi_raster* is an array.

        Returns
        -------
        GeoDataFrame
            Input with new column ``ndvi_mean``.
        """
        result = manzanas_gdf.copy()
        result["ndvi_mean"] = self._zonal_stats(
            result, ndvi_raster, ndvi_transform, stat="mean",
        )
        logger.info("NDVI zonal stats computed for %d manzanas.", len(result))
        return result

    def compute_lst_per_manzana(
        self,
        manzanas_gdf: gpd.GeoDataFrame,
        lst_raster: Union[str, Path, np.ndarray],
        lst_transform: Optional[rasterio.Affine] = None,
    ) -> gpd.GeoDataFrame:
        """Compute mean LST per manzana polygon.

        Parameters
        ----------
        manzanas_gdf : GeoDataFrame
            Urban-block polygons.
        lst_raster : str | Path | np.ndarray
            LST raster in Kelvin (file path or array).
        lst_transform : rasterio.Affine | None
            Required when *lst_raster* is an array.

        Returns
        -------
        GeoDataFrame
            Input with new columns ``lst_mean_K`` and ``lst_mean_C``.
        """
        result = manzanas_gdf.copy()
        lst_vals = self._zonal_stats(
            result, lst_raster, lst_transform, stat="mean",
        )
        result["lst_mean_K"] = lst_vals
        result["lst_mean_C"] = [v - 273.15 if not np.isnan(v) else np.nan for v in lst_vals]
        logger.info("LST zonal stats computed for %d manzanas.", len(result))
        return result

    # ------------------------------------------------------------------
    # Spatial indexing
    # ------------------------------------------------------------------
    @staticmethod
    def generate_spatial_index(
        gdf: gpd.GeoDataFrame,
    ) -> strtree.STRtree:
        """Build an R-tree spatial index for fast geometric queries.

        Uses Shapely's ``STRtree`` (Sort-Tile-Recursive) which provides
        efficient nearest-neighbour and intersection queries.

        Parameters
        ----------
        gdf : GeoDataFrame
            GeoDataFrame whose geometries should be indexed.

        Returns
        -------
        shapely.strtree.STRtree
            Spatial index over the geometries.
        """
        tree = strtree.STRtree(gdf.geometry.values)
        logger.info("Spatial index built for %d geometries.", len(gdf))
        return tree

    # ------------------------------------------------------------------
    # Export
    # ------------------------------------------------------------------
    @staticmethod
    def to_geojson_featurecollection(
        gdf: gpd.GeoDataFrame,
        output_path: Optional[Union[str, Path]] = None,
        properties: Optional[List[str]] = None,
    ) -> Dict[str, Any]:
        """Export a GeoDataFrame as a GeoJSON FeatureCollection.

        Parameters
        ----------
        gdf : GeoDataFrame
            Data to export.
        output_path : str | Path | None
            If given, writes the GeoJSON to this file.
        properties : list[str] | None
            Subset of columns to include as Feature properties.
            ``None`` includes all non-geometry columns.

        Returns
        -------
        dict
            GeoJSON FeatureCollection dictionary.
        """
        if properties is not None:
            cols = [c for c in properties if c in gdf.columns]
            export_gdf = gdf[cols + ["geometry"]]
        else:
            export_gdf = gdf

        fc: Dict[str, Any] = json.loads(export_gdf.to_json())

        if output_path is not None:
            p = Path(output_path)
            p.parent.mkdir(parents=True, exist_ok=True)
            p.write_text(json.dumps(fc, ensure_ascii=False, indent=2), encoding="utf-8")
            logger.info("GeoJSON written to %s", p)

        return fc
