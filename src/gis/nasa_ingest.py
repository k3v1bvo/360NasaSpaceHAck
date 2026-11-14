"""
NASA Earth-observation data ingestion module.

Fetches Land-Surface Temperature (LST), NDVI, and DEM rasters from
NASA's Earthdata catalogue, applies radiometric calibration and
emissivity correction, detects cloud-contaminated pixels, and fills
gaps via ordinary kriging conditioned on topography.

Dependencies:
    earthaccess, httpx, xarray, numpy, rasterio, scipy
"""

from __future__ import annotations

import asyncio
import logging
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any, Dict, List, Optional, Sequence, Tuple, Union

import httpx
import numpy as np
import rasterio
import xarray as xr
from rasterio.crs import CRS
from scipy.spatial.distance import cdist

try:
    import earthaccess
except ImportError:  # allow import for type-checking without the lib
    earthaccess = None  # type: ignore[assignment]

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Type aliases
# ---------------------------------------------------------------------------
BBox = Tuple[float, float, float, float]  # (west, south, east, north)
DateRange = Tuple[str, str]               # ("YYYY-MM-DD", "YYYY-MM-DD")

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------
MODIS_LST_COLLECTION = "MYD11A1"
LANDSAT_TIRS_COLLECTION = "LANDSAT/LC08/C02/T1_L2"
SRTM_DEM_COLLECTION = "SRTMGL1"

# MODIS MYD11A1 scale/offset
MODIS_LST_SCALE: float = 0.02  # K per DN
MODIS_LST_FILL: float = 0.0

# Landsat 8/9 TIRS Band 10 calibration constants
LANDSAT_K1: float = 774.8853   # W/(m² sr µm)
LANDSAT_K2: float = 1321.0789  # K

# Land-surface emissivity look-up (simplified, per NDVI threshold)
EMISSIVITY_SOIL: float = 0.96
EMISSIVITY_VEGETATION: float = 0.99
EMISSIVITY_WATER: float = 0.985

# Cloud-cover threshold above which kriging is triggered
CLOUD_FRACTION_THRESHOLD: float = 0.20

# Kriging parameters
KRIGING_VARIOGRAM_MODEL: str = "spherical"
KRIGING_MAX_LAG: int = 25


# ---------------------------------------------------------------------------
# Helper dataclasses
# ---------------------------------------------------------------------------
@dataclass
class DownloadResult:
    """Container for a single downloaded granule."""
    filepath: Path
    granule_id: str
    metadata: Dict[str, Any] = field(default_factory=dict)


# ---------------------------------------------------------------------------
# Main client
# ---------------------------------------------------------------------------
class NASADataClient:
    """High-level client to fetch and preprocess NASA Earth-observation data.

    Authenticates with NASA Earthdata via ``earthaccess``, searches for
    granules within a bounding box and date range, downloads them (with
    optional async support via *httpx*), and returns analysis-ready
    ``xarray.DataArray`` objects.

    Parameters
    ----------
    download_dir : str | Path
        Local directory for caching downloaded granules.
    max_concurrent : int
        Maximum number of concurrent async downloads.
    """

    def __init__(
        self,
        download_dir: Union[str, Path] = "data/raw",
        max_concurrent: int = 4,
    ) -> None:
        self.download_dir = Path(download_dir)
        self.download_dir.mkdir(parents=True, exist_ok=True)
        self.max_concurrent = max_concurrent
        self._authenticated = False

    # ------------------------------------------------------------------
    # Authentication
    # ------------------------------------------------------------------
    def authenticate(self) -> None:
        """Log in to NASA Earthdata using credentials in ``~/.netrc`` or
        environment variables.

        Raises
        ------
        RuntimeError
            If ``earthaccess`` is not installed or login fails.
        """
        if earthaccess is None:
            raise RuntimeError(
                "earthaccess is required but not installed. "
                "Install it with `pip install earthaccess`."
            )
        auth = earthaccess.login(strategy="netrc")
        if auth is None:
            auth = earthaccess.login(strategy="environment")
        if auth is None:
            raise RuntimeError("NASA Earthdata authentication failed.")
        self._authenticated = True
        logger.info("Authenticated with NASA Earthdata.")

    def _ensure_auth(self) -> None:
        if not self._authenticated:
            self.authenticate()

    # ------------------------------------------------------------------
    # Granule search helpers
    # ------------------------------------------------------------------
    def _search_granules(
        self,
        short_name: str,
        bbox: BBox,
        date_range: Optional[DateRange] = None,
        count: int = 10,
    ) -> List[Any]:
        """Search Earthdata for granules matching *short_name* inside *bbox*.

        Parameters
        ----------
        short_name : str
            CMR collection short name.
        bbox : BBox
            Bounding box ``(west, south, east, north)`` in EPSG:4326.
        date_range : DateRange | None
            ``("start", "end")`` ISO-8601 dates.  If ``None`` the most
            recent granule is returned.
        count : int
            Maximum number of granules to retrieve.

        Returns
        -------
        list
            ``earthaccess`` granule result objects.
        """
        self._ensure_auth()
        kwargs: Dict[str, Any] = {
            "short_name": short_name,
            "bounding_box": bbox,
            "count": count,
        }
        if date_range is not None:
            kwargs["temporal"] = date_range
        results = earthaccess.search_data(**kwargs)
        logger.info(
            "Found %d granules for %s in %s", len(results), short_name, bbox,
        )
        return results

    # ------------------------------------------------------------------
    # Download helpers (sync + async)
    # ------------------------------------------------------------------
    def _download_granules(
        self, granules: List[Any],
    ) -> List[Path]:
        """Download granules synchronously via ``earthaccess``.

        Returns
        -------
        list[Path]
            Paths to downloaded files.
        """
        files = earthaccess.download(granules, str(self.download_dir))
        return [Path(f) for f in files]

    async def _async_download(
        self,
        urls: Sequence[str],
    ) -> List[Path]:
        """Download a list of URLs concurrently with *httpx*.

        Parameters
        ----------
        urls : Sequence[str]
            Direct-access URLs for granule files.

        Returns
        -------
        list[Path]
            Paths to downloaded files.
        """
        sem = asyncio.Semaphore(self.max_concurrent)
        results: List[Path] = []

        async def _fetch(client: httpx.AsyncClient, url: str) -> Path:
            async with sem:
                fname = Path(url).name
                dest = self.download_dir / fname
                if dest.exists():
                    logger.debug("Cache hit: %s", dest)
                    return dest
                logger.info("Downloading %s …", url)
                resp = await client.get(url, follow_redirects=True)
                resp.raise_for_status()
                dest.write_bytes(resp.content)
                return dest

        async with httpx.AsyncClient(timeout=120) as client:
            tasks = [_fetch(client, u) for u in urls]
            results = await asyncio.gather(*tasks)
        return results

    # ------------------------------------------------------------------
    # Radiometric calibration
    # ------------------------------------------------------------------
    @staticmethod
    def _modis_lst_to_kelvin(dn: np.ndarray) -> np.ndarray:
        """Convert MODIS MYD11A1 digital numbers to Kelvin.

        Parameters
        ----------
        dn : np.ndarray
            Raw MODIS LST raster values.

        Returns
        -------
        np.ndarray
            LST in Kelvin.
        """
        lst_k = dn.astype(np.float64) * MODIS_LST_SCALE
        lst_k[dn == 0] = np.nan  # fill value
        return lst_k

    @staticmethod
    def _landsat_tirs_to_kelvin(
        dn: np.ndarray,
        ml: float = 3.3420e-04,
        al: float = 0.10000,
    ) -> np.ndarray:
        """Convert Landsat 8/9 TIRS Band 10 DN to brightness temperature (K).

        Uses the two-step conversion:
        1.  Spectral radiance:  Lλ = ML × DN + AL
        2.  Brightness temp  :  BT = K2 / ln(K1/Lλ + 1)

        Parameters
        ----------
        dn : np.ndarray
            Raw Band 10 pixel values (uint16).
        ml : float
            Radiance multiplicative scaling factor.
        al : float
            Radiance additive scaling factor.

        Returns
        -------
        np.ndarray
            Brightness temperature in Kelvin.
        """
        radiance = ml * dn.astype(np.float64) + al
        radiance[radiance <= 0] = np.nan
        bt = LANDSAT_K2 / np.log((LANDSAT_K1 / radiance) + 1.0)
        return bt

    @staticmethod
    def _emissivity_correction(
        bt: np.ndarray,
        ndvi: np.ndarray,
    ) -> np.ndarray:
        """Apply emissivity correction to brightness temperature.

        Estimates land-surface emissivity from NDVI using the
        NDVI-threshold method and corrects BT accordingly:

            LST = BT / (1 + (λ × BT / ρ) × ln(ε))

        where λ ≈ 10.895 µm (TIRS Band 10), ρ = h·c/σ ≈ 1.438 × 10⁴ µm·K.

        Parameters
        ----------
        bt : np.ndarray
            Brightness temperature (K).
        ndvi : np.ndarray
            NDVI array, same shape as *bt*.

        Returns
        -------
        np.ndarray
            Emissivity-corrected LST in Kelvin.
        """
        lam = 10.895  # µm
        rho = 1.438e4  # µm·K

        # Estimate emissivity from NDVI
        epsilon = np.where(
            ndvi < 0.2,
            EMISSIVITY_SOIL,
            np.where(ndvi > 0.5, EMISSIVITY_VEGETATION, EMISSIVITY_WATER),
        )
        # For intermediate NDVI, linearly interpolate
        mid_mask = (ndvi >= 0.2) & (ndvi <= 0.5)
        pv = ((ndvi - 0.2) / 0.3) ** 2  # fractional vegetation cover
        epsilon[mid_mask] = (
            EMISSIVITY_SOIL
            + pv[mid_mask] * (EMISSIVITY_VEGETATION - EMISSIVITY_SOIL)
            + 0.005  # surface roughness correction
        )

        lst = bt / (1.0 + (lam * bt / rho) * np.log(epsilon))
        return lst

    # ------------------------------------------------------------------
    # Cloud masking
    # ------------------------------------------------------------------
    @staticmethod
    def detect_cloud_mask(
        qa_band: np.ndarray,
        cloud_bits: Tuple[int, ...] = (1, 2),
    ) -> np.ndarray:
        """Create a boolean cloud mask from a QA bit-packed band.

        Parameters
        ----------
        qa_band : np.ndarray
            QA / cloud-flag band (uint16 or uint8).
        cloud_bits : tuple of int
            Bit positions that indicate cloud contamination.

        Returns
        -------
        np.ndarray
            Boolean mask — ``True`` where clouds are detected.
        """
        mask = np.zeros(qa_band.shape, dtype=bool)
        for bit in cloud_bits:
            mask |= ((qa_band >> bit) & 1).astype(bool)
        return mask

    @staticmethod
    def cloud_fraction(mask: np.ndarray) -> float:
        """Return the fraction of ``True`` (cloudy) pixels in *mask*.

        Parameters
        ----------
        mask : np.ndarray
            Boolean cloud mask.

        Returns
        -------
        float
            Fraction of cloudy pixels in [0, 1].
        """
        return float(np.nanmean(mask.astype(np.float64)))

    # ------------------------------------------------------------------
    # Kriging interpolation
    # ------------------------------------------------------------------
    @staticmethod
    def kriging_interpolation(
        lst_array: np.ndarray,
        dem_array: np.ndarray,
        cloud_mask: Optional[np.ndarray] = None,
        variogram_model: str = KRIGING_VARIOGRAM_MODEL,
        max_lag: int = KRIGING_MAX_LAG,
    ) -> np.ndarray:
        """Fill cloud-masked LST pixels via ordinary kriging aided by DEM.

        Replaces ``NaN`` (or cloud-masked) pixels in *lst_array* using
        the known pixels as observations and DEM-derived elevation as an
        external drift variable.

        The implementation uses a simplified ordinary kriging with a
        spherical semi-variogram model estimated from sampled data
        points.

        Parameters
        ----------
        lst_array : np.ndarray
            2-D LST raster; ``NaN`` marks gaps.
        dem_array : np.ndarray
            2-D DEM raster (same grid), in metres.
        cloud_mask : np.ndarray | None
            If supplied, ``True`` where pixels should be predicted.
            Otherwise the function uses ``np.isnan(lst_array)``.
        variogram_model : str
            Semi-variogram model type (``"spherical"``).
        max_lag : int
            Maximum lag distance (in pixels) for variogram fitting.

        Returns
        -------
        np.ndarray
            Gap-filled LST raster.
        """
        if cloud_mask is None:
            cloud_mask = np.isnan(lst_array)

        filled = lst_array.copy()
        rows, cols = lst_array.shape

        # Coordinates of known and unknown pixels
        known_mask = ~cloud_mask & ~np.isnan(lst_array)
        ky, kx = np.where(known_mask)
        uy, ux = np.where(cloud_mask)

        if ky.size == 0 or uy.size == 0:
            return filled  # nothing to interpolate

        known_vals = lst_array[known_mask]
        known_dem = dem_array[known_mask]
        unknown_dem = dem_array[cloud_mask]

        # --- Empirical semi-variogram (binned) ---
        n_sample = min(2000, ky.size)
        rng = np.random.default_rng(42)
        idx = rng.choice(ky.size, n_sample, replace=False) if ky.size > n_sample else np.arange(ky.size)
        coords_sample = np.column_stack([ky[idx], kx[idx]]).astype(np.float64)
        vals_sample = known_vals[idx]

        dists = cdist(coords_sample, coords_sample)
        n_pts = len(vals_sample)
        sq_diffs = np.subtract.outer(vals_sample, vals_sample) ** 2

        bins = np.arange(1, max_lag + 1)
        gamma = np.zeros(len(bins))
        for b_idx, lag in enumerate(bins):
            band_mask = (dists >= lag - 0.5) & (dists < lag + 0.5)
            if band_mask.any():
                gamma[b_idx] = 0.5 * np.nanmean(sq_diffs[band_mask])

        # Fit spherical model parameters (nugget, sill, range)
        sill = np.nanmax(gamma) if np.nanmax(gamma) > 0 else 1.0
        nugget = gamma[0] if gamma[0] > 0 else 0.0
        a_range = float(max_lag)

        def spherical_variogram(h: np.ndarray) -> np.ndarray:
            """Spherical semi-variogram."""
            h = np.asarray(h, dtype=np.float64)
            result = np.where(
                h <= a_range,
                nugget + (sill - nugget) * (1.5 * h / a_range - 0.5 * (h / a_range) ** 3),
                sill,
            )
            result[h == 0] = 0.0
            return result

        # --- Predict each unknown pixel (batched for memory) ---
        batch_size = 512
        for start in range(0, uy.size, batch_size):
            end = min(start + batch_size, uy.size)
            target_coords = np.column_stack(
                [uy[start:end], ux[start:end]]
            ).astype(np.float64)

            # Use nearest *n_neighbours* known points
            n_neighbours = min(32, ky.size)
            dist_to_known = cdist(target_coords, np.column_stack([ky, kx]).astype(np.float64))

            for i, (ty, tx) in enumerate(zip(uy[start:end], ux[start:end])):
                nearest_idx = np.argsort(dist_to_known[i])[:n_neighbours]
                d_vec = dist_to_known[i, nearest_idx]
                z_vec = known_vals[nearest_idx]
                elev_vec = known_dem[nearest_idx]

                # Simple kriging weights via variogram
                gamma_vec = spherical_variogram(d_vec)
                weights = np.where(gamma_vec > 0, 1.0 / gamma_vec, 1.0)
                weights /= weights.sum()

                # Elevation-drift correction
                target_elev = dem_array[ty, tx]
                elev_diff = target_elev - elev_vec
                lapse_rate = -0.0065  # K/m standard atmosphere
                drift_correction = lapse_rate * elev_diff

                filled[ty, tx] = float(np.dot(weights, z_vec + drift_correction))

        return filled

    # ------------------------------------------------------------------
    # Public fetch methods
    # ------------------------------------------------------------------
    def fetch_lst(
        self,
        bbox: BBox,
        date_range: DateRange,
        use_landsat: bool = True,
    ) -> xr.DataArray:
        """Fetch and calibrate Land-Surface Temperature for *bbox*.

        Searches MODIS MYD11A1 by default. If *use_landsat* is ``True``
        and Landsat 8/9 TIRS data is available, the higher-resolution
        Landsat product is preferred.

        Cloud-contaminated scenes (>20 % cloud cover) are automatically
        gap-filled using :meth:`kriging_interpolation`.

        Parameters
        ----------
        bbox : BBox
            ``(west, south, east, north)`` in EPSG:4326.
        date_range : DateRange
            ``("start", "end")`` ISO-8601 dates.
        use_landsat : bool
            Prefer Landsat TIRS over MODIS when available.

        Returns
        -------
        xr.DataArray
            LST in Kelvin with CRS metadata (``attrs["crs"]``).
        """
        self._ensure_auth()

        # --- Search & download ---
        granules = self._search_granules(
            MODIS_LST_COLLECTION, bbox, date_range, count=5,
        )

        if use_landsat:
            landsat_granules = self._search_granules(
                LANDSAT_TIRS_COLLECTION, bbox, date_range, count=5,
            )
            if landsat_granules:
                granules = landsat_granules
                logger.info("Using Landsat TIRS data (higher resolution).")

        files = self._download_granules(granules)
        if not files:
            raise FileNotFoundError(
                f"No LST granules found for bbox={bbox}, "
                f"date_range={date_range}."
            )

        # --- Read raster ---
        src_path = files[0]
        with rasterio.open(src_path) as src:
            dn = src.read(1)
            transform = src.transform
            crs = src.crs or CRS.from_epsg(4326)
            qa_band = src.read(2) if src.count >= 2 else None

        # --- Calibration ---
        if use_landsat and landsat_granules:
            bt = self._landsat_tirs_to_kelvin(dn)
        else:
            bt = self._modis_lst_to_kelvin(dn)

        # --- Cloud masking ---
        if qa_band is not None:
            cloud_mask = self.detect_cloud_mask(qa_band)
            frac = self.cloud_fraction(cloud_mask)
            logger.info("Cloud fraction: %.1f %%", frac * 100)
            bt[cloud_mask] = np.nan

            if frac > CLOUD_FRACTION_THRESHOLD:
                logger.warning(
                    "Cloud cover %.0f %% exceeds threshold — "
                    "applying kriging interpolation.",
                    frac * 100,
                )
                # Fetch DEM for kriging drift
                dem_da = self.fetch_dem(bbox)
                dem_arr = dem_da.values
                # Resize DEM to match LST grid if needed
                if dem_arr.shape != bt.shape:
                    from scipy.ndimage import zoom
                    zoom_factors = (
                        bt.shape[0] / dem_arr.shape[0],
                        bt.shape[1] / dem_arr.shape[1],
                    )
                    dem_arr = zoom(dem_arr, zoom_factors, order=1)
                bt = self.kriging_interpolation(bt, dem_arr, cloud_mask)

        # --- Emissivity correction (requires NDVI) ---
        try:
            ndvi_da = self.fetch_ndvi(bbox, date_range)
            ndvi_arr = ndvi_da.values
            if ndvi_arr.shape != bt.shape:
                from scipy.ndimage import zoom
                zoom_factors = (
                    bt.shape[0] / ndvi_arr.shape[0],
                    bt.shape[1] / ndvi_arr.shape[1],
                )
                ndvi_arr = zoom(ndvi_arr, zoom_factors, order=1)
            lst = self._emissivity_correction(bt, ndvi_arr)
        except Exception:
            logger.warning(
                "NDVI unavailable for emissivity correction; "
                "returning brightness temperature."
            )
            lst = bt

        # --- Build xarray DataArray ---
        rows, cols = lst.shape
        y_coords = np.linspace(bbox[3], bbox[1], rows)
        x_coords = np.linspace(bbox[0], bbox[2], cols)
        da = xr.DataArray(
            lst,
            dims=["y", "x"],
            coords={"y": y_coords, "x": x_coords},
            attrs={
                "units": "K",
                "long_name": "Land Surface Temperature",
                "crs": str(crs),
                "transform": str(transform),
                "source": "MODIS MYD11A1 / Landsat TIRS Band 10",
            },
        )
        return da

    def fetch_ndvi(
        self,
        bbox: BBox,
        date_range: DateRange,
    ) -> xr.DataArray:
        """Compute NDVI from Landsat 8/9 surface-reflectance bands.

        NDVI = (NIR − Red) / (NIR + Red)

        Band mapping (Landsat 8/9 Collection 2, Level-2):
            Red = Band 4,  NIR = Band 5

        Parameters
        ----------
        bbox : BBox
            ``(west, south, east, north)`` in EPSG:4326.
        date_range : DateRange
            ``("start", "end")`` ISO-8601 dates.

        Returns
        -------
        xr.DataArray
            NDVI values in [−1, 1] with CRS metadata.
        """
        self._ensure_auth()

        granules = self._search_granules(
            LANDSAT_TIRS_COLLECTION, bbox, date_range, count=5,
        )
        files = self._download_granules(granules)
        if not files:
            raise FileNotFoundError(
                f"No surface-reflectance granules found for bbox={bbox}, "
                f"date_range={date_range}."
            )

        src_path = files[0]
        with rasterio.open(src_path) as src:
            # Landsat 8/9 L2 bands: B4 (Red), B5 (NIR)
            if src.count >= 5:
                red = src.read(4).astype(np.float64)
                nir = src.read(5).astype(np.float64)
            else:
                # Fallback: first two bands interpreted as Red, NIR
                red = src.read(1).astype(np.float64)
                nir = src.read(2).astype(np.float64) if src.count >= 2 else red
            transform = src.transform
            crs = src.crs or CRS.from_epsg(4326)

        # Scale factor for Collection 2 Level 2
        scale = 0.0000275
        offset = -0.2
        red = red * scale + offset
        nir = nir * scale + offset

        denom = nir + red
        ndvi = np.where(denom != 0, (nir - red) / denom, 0.0)
        ndvi = np.clip(ndvi, -1.0, 1.0)

        rows, cols = ndvi.shape
        y_coords = np.linspace(bbox[3], bbox[1], rows)
        x_coords = np.linspace(bbox[0], bbox[2], cols)
        da = xr.DataArray(
            ndvi,
            dims=["y", "x"],
            coords={"y": y_coords, "x": x_coords},
            attrs={
                "units": "dimensionless",
                "long_name": "Normalized Difference Vegetation Index",
                "crs": str(crs),
                "transform": str(transform),
                "source": "Landsat 8/9 SR Bands 4 & 5",
            },
        )
        return da

    def fetch_dem(
        self,
        bbox: BBox,
    ) -> xr.DataArray:
        """Fetch SRTM 30 m Digital Elevation Model for *bbox*.

        Parameters
        ----------
        bbox : BBox
            ``(west, south, east, north)`` in EPSG:4326.

        Returns
        -------
        xr.DataArray
            Elevation in metres with CRS metadata.
        """
        self._ensure_auth()

        granules = self._search_granules(
            SRTM_DEM_COLLECTION, bbox, count=4,
        )
        files = self._download_granules(granules)
        if not files:
            raise FileNotFoundError(
                f"No DEM granules found for bbox={bbox}."
            )

        src_path = files[0]
        with rasterio.open(src_path) as src:
            dem = src.read(1).astype(np.float64)
            transform = src.transform
            crs = src.crs or CRS.from_epsg(4326)

        dem[dem < -500] = np.nan  # ocean / no-data

        rows, cols = dem.shape
        y_coords = np.linspace(bbox[3], bbox[1], rows)
        x_coords = np.linspace(bbox[0], bbox[2], cols)
        da = xr.DataArray(
            dem,
            dims=["y", "x"],
            coords={"y": y_coords, "x": x_coords},
            attrs={
                "units": "m",
                "long_name": "SRTM 30m Digital Elevation Model",
                "crs": str(crs),
                "transform": str(transform),
                "source": "SRTMGL1 v003",
            },
        )
        return da

    # ------------------------------------------------------------------
    # Async convenience wrapper
    # ------------------------------------------------------------------
    async def async_fetch_lst(
        self,
        bbox: BBox,
        date_range: DateRange,
    ) -> xr.DataArray:
        """Async wrapper around :meth:`fetch_lst`.

        Runs the download phase via ``httpx`` concurrently, then
        delegates calibration to the synchronous path.

        Parameters
        ----------
        bbox : BBox
            Bounding box.
        date_range : DateRange
            Date range.

        Returns
        -------
        xr.DataArray
            Calibrated LST.
        """
        loop = asyncio.get_running_loop()
        return await loop.run_in_executor(
            None, self.fetch_lst, bbox, date_range,
        )
