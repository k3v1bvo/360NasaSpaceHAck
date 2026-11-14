"""
Local Fourier Neural Operator (3D) — ``local_fno.py``
=====================================================

Implements a patch-based 3D Fourier Neural Operator (FNO) for predicting
urban microclimate fields (u, v, w, θ) from enriched inputs that include
velocity components, potential temperature, SDF, LST, NDVI, and elevation.

Architecture
------------
Each Fourier layer computes:

    v_ℓ₊₁(x) = σ( W_ℓ · v_ℓ(x) + F⁻¹[ R_θ(k) · F[v_ℓ](k) ](x) + b_ℓ(x) )

where F / F⁻¹ are the 3-D (r)FFT, R_θ(k) is a learnable complex-valued
spectral weight tensor truncated at ``n_modes`` frequencies per axis, W_ℓ is
a pointwise linear transform, and σ is the activation.

The domain is divided into overlapping 3-D patches by ``PatchExtractor``.
After inference each patch is reassembled by ``PatchAssembler`` using smooth
cosine blending in the overlap zones so that the reconstructed global field
is continuous.

Autoregressive rollout: the operator maps two consecutive snapshots
(t − Δt, t) → t + Δt, and can be rolled out for multiple steps.

References
----------
*  Li et al., "Fourier Neural Operator for Parametric Partial Differential
   Equations", ICLR 2021.
*  Wen et al., "U-FNO — An enhanced Fourier neural operator with U-Net for
   multiphase flow", 2022.
"""

from __future__ import annotations

import math
from pathlib import Path
from typing import Dict, List, Optional, Tuple, Union

import torch
import torch.nn as nn
import torch.nn.functional as F
from torch.optim import AdamW
from torch.optim.lr_scheduler import CosineAnnealingLR

# ---------------------------------------------------------------------------
# Patch helpers
# ---------------------------------------------------------------------------

class PatchExtractor:
    """Divide a 3-D domain tensor into overlapping cubic patches.

    Parameters
    ----------
    patch_size : tuple[int, int, int]
        (Px, Py, Pz) — size of each patch.
    overlap_ratio : float
        Fraction of ``patch_size`` used as overlap on each side (default 0.2).
    """

    def __init__(
        self,
        patch_size: Tuple[int, int, int] = (64, 64, 32),
        overlap_ratio: float = 0.2,
    ) -> None:
        self.patch_size = patch_size
        self.overlap_ratio = overlap_ratio
        self._stride = tuple(
            max(1, int(p * (1.0 - overlap_ratio))) for p in patch_size
        )

    # ---- public API -------------------------------------------------------

    def extract(
        self, field: torch.Tensor
    ) -> Tuple[torch.Tensor, List[Tuple[int, int, int]]]:
        """Extract patches from *field*.

        Parameters
        ----------
        field : Tensor
            Shape ``(B, C, X, Y, Z)``.

        Returns
        -------
        patches : Tensor
            Shape ``(B, N_patches, C, Px, Py, Pz)``.
        origins : list[tuple[int, int, int]]
            Starting ``(x, y, z)`` index of each patch inside the field.
        """
        B, C, X, Y, Z = field.shape
        Px, Py, Pz = self.patch_size
        sx, sy, sz = self._stride

        origins: List[Tuple[int, int, int]] = []
        patches: List[torch.Tensor] = []

        for ix in range(0, max(X - Px, 0) + 1, sx):
            for iy in range(0, max(Y - Py, 0) + 1, sy):
                for iz in range(0, max(Z - Pz, 0) + 1, sz):
                    # Clamp so the last patch stays within bounds
                    ix_c = min(ix, X - Px)
                    iy_c = min(iy, Y - Py)
                    iz_c = min(iz, Z - Pz)
                    origins.append((ix_c, iy_c, iz_c))
                    patches.append(
                        field[
                            :, :,
                            ix_c: ix_c + Px,
                            iy_c: iy_c + Py,
                            iz_c: iz_c + Pz,
                        ]
                    )

        # Remove duplicate origins from clamping
        seen = set()
        unique_patches: List[torch.Tensor] = []
        unique_origins: List[Tuple[int, int, int]] = []
        for o, p in zip(origins, patches):
            if o not in seen:
                seen.add(o)
                unique_patches.append(p)
                unique_origins.append(o)

        patches_tensor = torch.stack(unique_patches, dim=1)  # (B, N, C, Px, Py, Pz)
        return patches_tensor, unique_origins


class PatchAssembler:
    """Reassemble overlapping patches into a full domain using cosine blending.

    Parameters
    ----------
    domain_size : tuple[int, int, int]
        Full (X, Y, Z) spatial dimensions of the target field.
    patch_size : tuple[int, int, int]
        (Px, Py, Pz) — size of each patch.
    """

    def __init__(
        self,
        domain_size: Tuple[int, int, int],
        patch_size: Tuple[int, int, int] = (64, 64, 32),
    ) -> None:
        self.domain_size = domain_size
        self.patch_size = patch_size

    # ---- internal ---------------------------------------------------------

    @staticmethod
    def _cosine_window_1d(length: int, device: torch.device) -> torch.Tensor:
        """Create a 1-D cosine blending window ∈ (0, 1]."""
        if length <= 1:
            return torch.ones(length, device=device)
        t = torch.linspace(0, 1, length, device=device)
        # Tukey-like: ramp from 0→1 in first quarter, 1 in middle, 1→0 in last quarter
        ramp = length // 4 or 1
        window = torch.ones(length, device=device)
        # Ramp up
        window[:ramp] = 0.5 * (1.0 - torch.cos(math.pi * t[:ramp] / t[ramp - 1]))
        # Ramp down
        window[-ramp:] = 0.5 * (1.0 - torch.cos(math.pi * (1.0 - t[-ramp:]) / (1.0 - t[-ramp])))
        return window.clamp(min=1e-6)

    def _build_3d_window(self, device: torch.device) -> torch.Tensor:
        """Outer product of three 1-D cosine windows → (Px, Py, Pz)."""
        wx = self._cosine_window_1d(self.patch_size[0], device)
        wy = self._cosine_window_1d(self.patch_size[1], device)
        wz = self._cosine_window_1d(self.patch_size[2], device)
        return wx[:, None, None] * wy[None, :, None] * wz[None, None, :]

    # ---- public API -------------------------------------------------------

    def assemble(
        self,
        patches: torch.Tensor,
        origins: List[Tuple[int, int, int]],
    ) -> torch.Tensor:
        """Blend overlapping patches back into the full domain.

        Parameters
        ----------
        patches : Tensor
            Shape ``(B, N_patches, C, Px, Py, Pz)``.
        origins : list[tuple[int, int, int]]
            Patch origins returned by :class:`PatchExtractor`.

        Returns
        -------
        field : Tensor
            Reassembled field of shape ``(B, C, X, Y, Z)``.
        """
        B, N, C, Px, Py, Pz = patches.shape
        X, Y, Z = self.domain_size
        device = patches.device

        accum = torch.zeros(B, C, X, Y, Z, device=device)
        weight = torch.zeros(B, 1, X, Y, Z, device=device)
        window = self._build_3d_window(device)  # (Px, Py, Pz)

        for idx, (ox, oy, oz) in enumerate(origins):
            accum[:, :, ox: ox + Px, oy: oy + Py, oz: oz + Pz] += (
                patches[:, idx] * window[None, None, :, :, :]
            )
            weight[:, :, ox: ox + Px, oy: oy + Py, oz: oz + Pz] += window[
                None, None, :, :, :
            ]

        return accum / weight.clamp(min=1e-8)


# ---------------------------------------------------------------------------
# Spectral convolution layer
# ---------------------------------------------------------------------------

class SpectralConv3d(nn.Module):
    """Fourier layer with learnable complex spectral weights R_θ(k).

    Multiplies the truncated Fourier coefficients of the input by a
    complex weight tensor and transforms back.

    Parameters
    ----------
    in_channels : int
        Number of input feature channels.
    out_channels : int
        Number of output feature channels.
    n_modes : tuple[int, int, int]
        Number of Fourier modes to keep per spatial axis (kx, ky, kz).
    """

    def __init__(
        self,
        in_channels: int,
        out_channels: int,
        n_modes: Tuple[int, int, int] = (16, 16, 8),
    ) -> None:
        super().__init__()
        self.in_channels = in_channels
        self.out_channels = out_channels
        self.n_modes = n_modes

        scale = 1.0 / (in_channels * out_channels)

        # We need 4 sets of weights for the 4 quadrants of the real-FFT output
        self.weights1 = nn.Parameter(
            scale * torch.randn(in_channels, out_channels, *n_modes, dtype=torch.cfloat)
        )
        self.weights2 = nn.Parameter(
            scale * torch.randn(in_channels, out_channels, *n_modes, dtype=torch.cfloat)
        )
        self.weights3 = nn.Parameter(
            scale * torch.randn(in_channels, out_channels, *n_modes, dtype=torch.cfloat)
        )
        self.weights4 = nn.Parameter(
            scale * torch.randn(in_channels, out_channels, *n_modes, dtype=torch.cfloat)
        )

    @staticmethod
    def _compl_mul3d(
        input_tensor: torch.Tensor, weights: torch.Tensor
    ) -> torch.Tensor:
        """Complex multiplication and summation over the input channel dim.

        input_tensor : (B, Cin, kx, ky, kz) complex
        weights      : (Cin, Cout, kx, ky, kz) complex
        returns      : (B, Cout, kx, ky, kz) complex
        """
        return torch.einsum("bixyz,ioxyz->boxyz", input_tensor, weights)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        """Forward pass.

        Parameters
        ----------
        x : Tensor
            Real-valued tensor of shape ``(B, C_in, X, Y, Z)``.

        Returns
        -------
        Tensor
            Real-valued tensor of shape ``(B, C_out, X, Y, Z)``.
        """
        B, C, X, Y, Z = x.shape
        mx, my, mz = self.n_modes

        # 3-D real FFT
        x_ft = torch.fft.rfftn(x, dim=[-3, -2, -1])

        # Allocate output spectrum
        out_ft = torch.zeros(
            B,
            self.out_channels,
            X,
            Y,
            Z // 2 + 1,
            dtype=torch.cfloat,
            device=x.device,
        )

        # Multiply the 4 corners of the spectrum by learnable weights
        out_ft[:, :, :mx, :my, :mz] = self._compl_mul3d(
            x_ft[:, :, :mx, :my, :mz], self.weights1
        )
        out_ft[:, :, -mx:, :my, :mz] = self._compl_mul3d(
            x_ft[:, :, -mx:, :my, :mz], self.weights2
        )
        out_ft[:, :, :mx, -my:, :mz] = self._compl_mul3d(
            x_ft[:, :, :mx, -my:, :mz], self.weights3
        )
        out_ft[:, :, -mx:, -my:, :mz] = self._compl_mul3d(
            x_ft[:, :, -mx:, -my:, :mz], self.weights4
        )

        # Inverse FFT back to physical space
        return torch.fft.irfftn(out_ft, s=(X, Y, Z), dim=[-3, -2, -1])


# ---------------------------------------------------------------------------
# Fourier layer (spectral conv + pointwise linear + bias)
# ---------------------------------------------------------------------------

class FourierLayer3d(nn.Module):
    """One complete Fourier layer.

    v_ℓ₊₁(x) = σ( W_ℓ · v_ℓ(x) + F⁻¹[R_θ(k)·F[v_ℓ](k)](x) + b_ℓ(x) )

    Parameters
    ----------
    channels : int
        Width of the lifted representation.
    n_modes : tuple[int, int, int]
        Number of retained Fourier modes.
    activation : str
        Name of the activation function (``"gelu"`` | ``"relu"`` | ``"silu"``).
    """

    def __init__(
        self,
        channels: int,
        n_modes: Tuple[int, int, int],
        activation: str = "gelu",
    ) -> None:
        super().__init__()
        self.spectral_conv = SpectralConv3d(channels, channels, n_modes)
        self.pointwise = nn.Conv3d(channels, channels, kernel_size=1)
        self.bias = nn.Parameter(torch.zeros(1, channels, 1, 1, 1))

        act_map = {"gelu": nn.GELU, "relu": nn.ReLU, "silu": nn.SiLU}
        self.activation = act_map.get(activation, nn.GELU)()

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        """Apply one Fourier layer."""
        return self.activation(self.spectral_conv(x) + self.pointwise(x) + self.bias)


# ---------------------------------------------------------------------------
# LocalFNO3D — main model
# ---------------------------------------------------------------------------

class LocalFNO3D(nn.Module):
    """Patch-based Local Fourier Neural Operator for 3-D microclimate fields.

    The model takes two consecutive time snapshots of an enriched field
    (u, v, w, θ, SDF, LST, NDVI, elevation) and predicts the next snapshot
    (u, v, w, θ).

    Parameters
    ----------
    in_channels : int
        Number of input channels per time step (default 8).
    out_channels : int
        Number of predicted channels (default 4: u, v, w, θ).
    n_modes : tuple[int, int, int]
        Fourier mode truncation per axis (default ``(16, 16, 8)``).
    hidden_channels : int
        Width of the lifted representation (default 64).
    n_layers : int
        Number of Fourier layers (default 4).
    activation : str
        Activation function name (default ``"gelu"``).
    patch_size : tuple[int, int, int]
        Spatial patch size (default ``(64, 64, 32)``).
    overlap_ratio : float
        Fraction of overlap between neighbouring patches (default 0.2).
    autoregressive_steps : int
        Number of autoregressive rollout steps at training time (default 1).
    """

    def __init__(
        self,
        in_channels: int = 8,
        out_channels: int = 4,
        n_modes: Tuple[int, int, int] = (16, 16, 8),
        hidden_channels: int = 64,
        n_layers: int = 4,
        activation: str = "gelu",
        patch_size: Tuple[int, int, int] = (64, 64, 32),
        overlap_ratio: float = 0.2,
        autoregressive_steps: int = 1,
    ) -> None:
        super().__init__()
        self.in_channels = in_channels
        self.out_channels = out_channels
        self.hidden_channels = hidden_channels
        self.n_layers = n_layers
        self.patch_size = patch_size
        self.overlap_ratio = overlap_ratio
        self.autoregressive_steps = autoregressive_steps

        # Two time steps concatenated along channel dim
        self.lifting = nn.Conv3d(in_channels * 2, hidden_channels, kernel_size=1)

        self.fourier_layers = nn.ModuleList(
            [FourierLayer3d(hidden_channels, n_modes, activation) for _ in range(n_layers)]
        )

        # Projection back to physical channels
        self.projection = nn.Sequential(
            nn.Conv3d(hidden_channels, hidden_channels, kernel_size=1),
            nn.GELU(),
            nn.Conv3d(hidden_channels, out_channels, kernel_size=1),
        )

        self.patch_extractor = PatchExtractor(patch_size, overlap_ratio)

    def _forward_single_step(self, x: torch.Tensor) -> torch.Tensor:
        """One FNO forward pass on already-concatenated input.

        Parameters
        ----------
        x : Tensor
            ``(B, 2·in_channels, Px, Py, Pz)`` — concatenation of two time
            frames over the channel axis.

        Returns
        -------
        Tensor
            ``(B, out_channels, Px, Py, Pz)`` — predicted next time frame.
        """
        h = self.lifting(x)
        for layer in self.fourier_layers:
            h = layer(h) + h  # residual connection
        return self.projection(h)

    def forward(
        self,
        field_prev: torch.Tensor,
        field_curr: torch.Tensor,
    ) -> torch.Tensor:
        """Predict the next time step from two consecutive snapshots.

        Uses patch-based processing: the domain is split into overlapping
        patches, the FNO is applied to each patch independently, and results
        are reassembled with cosine blending.

        Parameters
        ----------
        field_prev : Tensor
            ``(B, C_in, X, Y, Z)`` — field at *t − Δt*.
        field_curr : Tensor
            ``(B, C_in, X, Y, Z)`` — field at *t*.

        Returns
        -------
        Tensor
            ``(B, C_out, X, Y, Z)`` — predicted field at *t + Δt*.
        """
        B, C, X, Y, Z = field_curr.shape

        # Extract patches from both time steps
        patches_prev, origins = self.patch_extractor.extract(field_prev)
        patches_curr, _ = self.patch_extractor.extract(field_curr)

        N = patches_prev.shape[1]
        Px, Py, Pz = self.patch_size

        # Reshape for batch-parallel inference: (B*N, 2C, Px, Py, Pz)
        pp = patches_prev.reshape(B * N, C, Px, Py, Pz)
        pc = patches_curr.reshape(B * N, C, Px, Py, Pz)
        combined = torch.cat([pp, pc], dim=1)

        out_patches = self._forward_single_step(combined)  # (B*N, C_out, Px, Py, Pz)
        out_patches = out_patches.reshape(B, N, self.out_channels, Px, Py, Pz)

        # Assemble
        assembler = PatchAssembler((X, Y, Z), self.patch_size)
        return assembler.assemble(out_patches, origins)

    def autoregressive_predict(
        self,
        field_prev: torch.Tensor,
        field_curr: torch.Tensor,
        steps: int = 1,
        static_channels: Optional[torch.Tensor] = None,
    ) -> List[torch.Tensor]:
        """Autoregressively roll out the model for multiple time steps.

        At each step, the predicted (u, v, w, θ) replaces the dynamic part of
        ``field_curr`` while static channels (SDF, LST, NDVI, elevation) remain
        fixed.

        Parameters
        ----------
        field_prev, field_curr : Tensor
            ``(B, 8, X, Y, Z)`` inputs at *t − Δt* and *t*.
        steps : int
            Number of autoregressive steps.
        static_channels : Tensor, optional
            ``(B, 4, X, Y, Z)`` for SDF, LST, NDVI, elevation.  If ``None``,
            taken from ``field_curr[:, 4:]``.

        Returns
        -------
        list[Tensor]
            List of predicted fields, each ``(B, 4, X, Y, Z)``.
        """
        if static_channels is None:
            static_channels = field_curr[:, 4:]  # last 4 channels are static

        predictions: List[torch.Tensor] = []
        f_prev = field_prev
        f_curr = field_curr

        for _ in range(steps):
            pred = self.forward(f_prev, f_curr)  # (B, 4, X, Y, Z)
            predictions.append(pred)

            # Shift windows: curr → prev, pred+static → curr
            f_prev = f_curr
            f_curr = torch.cat([pred, static_channels], dim=1)

        return predictions

    # ------------------------------------------------------------------
    # Training utilities
    # ------------------------------------------------------------------

    @staticmethod
    def train_model(
        model: "LocalFNO3D",
        train_loader: torch.utils.data.DataLoader,
        val_loader: Optional[torch.utils.data.DataLoader] = None,
        epochs: int = 100,
        lr: float = 1e-3,
        weight_decay: float = 1e-4,
        device: Union[str, torch.device] = "cpu",
        checkpoint_dir: Optional[Union[str, Path]] = None,
        autoregressive_steps: int = 1,
    ) -> Dict[str, List[float]]:
        """Full training loop with AdamW and cosine annealing scheduler.

        Parameters
        ----------
        model : LocalFNO3D
            The model to train.
        train_loader : DataLoader
            Each batch yields ``(field_prev, field_curr, field_target)`` all
            of shape ``(B, C, X, Y, Z)``.
        val_loader : DataLoader, optional
            Validation data in the same format.
        epochs : int
            Number of training epochs.
        lr : float
            Peak learning rate.
        weight_decay : float
            Weight decay coefficient for AdamW.
        device : str | torch.device
            Target device.
        checkpoint_dir : str | Path, optional
            If given, best model checkpoint is saved here.
        autoregressive_steps : int
            Number of autoregressive unrolling steps during training.

        Returns
        -------
        dict
            Keys ``"train_loss"`` and ``"val_loss"`` mapping to per-epoch
            loss lists.
        """
        model = model.to(device)
        optimizer = AdamW(model.parameters(), lr=lr, weight_decay=weight_decay)
        scheduler = CosineAnnealingLR(optimizer, T_max=epochs, eta_min=lr * 0.01)
        criterion = nn.MSELoss()

        history: Dict[str, List[float]] = {"train_loss": [], "val_loss": []}
        best_val = float("inf")

        for epoch in range(1, epochs + 1):
            # --- train ---------------------------------------------------
            model.train()
            epoch_loss = 0.0
            n_batches = 0

            for batch in train_loader:
                field_prev, field_curr, *targets = [t.to(device) for t in batch]
                optimizer.zero_grad()

                # Autoregressive unrolling
                preds = model.autoregressive_predict(
                    field_prev, field_curr, steps=autoregressive_steps
                )

                loss = torch.tensor(0.0, device=device)
                for step_idx, pred in enumerate(preds):
                    target = targets[step_idx] if step_idx < len(targets) else targets[-1]
                    # Only compare dynamic channels (first 4)
                    loss += criterion(pred, target[:, :4])
                loss /= len(preds)

                loss.backward()
                torch.nn.utils.clip_grad_norm_(model.parameters(), max_norm=1.0)
                optimizer.step()

                epoch_loss += loss.item()
                n_batches += 1

            avg_train = epoch_loss / max(n_batches, 1)
            history["train_loss"].append(avg_train)
            scheduler.step()

            # --- validate ------------------------------------------------
            if val_loader is not None:
                model.eval()
                val_loss = 0.0
                val_n = 0
                with torch.no_grad():
                    for batch in val_loader:
                        field_prev, field_curr, *targets = [t.to(device) for t in batch]
                        preds = model.autoregressive_predict(
                            field_prev, field_curr, steps=autoregressive_steps
                        )
                        loss = torch.tensor(0.0, device=device)
                        for step_idx, pred in enumerate(preds):
                            target = targets[step_idx] if step_idx < len(targets) else targets[-1]
                            loss += criterion(pred, target[:, :4])
                        loss /= len(preds)
                        val_loss += loss.item()
                        val_n += 1
                avg_val = val_loss / max(val_n, 1)
                history["val_loss"].append(avg_val)

                # Checkpoint best
                if checkpoint_dir and avg_val < best_val:
                    best_val = avg_val
                    model.save_checkpoint(
                        Path(checkpoint_dir) / "best_model.pt", epoch=epoch
                    )

        return history

    # ------------------------------------------------------------------
    # Checkpoint I/O
    # ------------------------------------------------------------------

    def save_checkpoint(
        self, path: Union[str, Path], epoch: int = 0, **extra_metadata
    ) -> None:
        """Save model weights and metadata to a checkpoint file.

        Parameters
        ----------
        path : str | Path
            Destination file path.
        epoch : int
            Current training epoch (stored in checkpoint metadata).
        **extra_metadata
            Arbitrary additional key-value pairs to store alongside the
            model state.
        """
        path = Path(path)
        path.parent.mkdir(parents=True, exist_ok=True)
        state = {
            "model_state_dict": self.state_dict(),
            "epoch": epoch,
            "config": {
                "in_channels": self.in_channels,
                "out_channels": self.out_channels,
                "hidden_channels": self.hidden_channels,
                "n_layers": self.n_layers,
                "patch_size": self.patch_size,
                "overlap_ratio": self.overlap_ratio,
            },
            **extra_metadata,
        }
        torch.save(state, str(path))

    @classmethod
    def load_checkpoint(
        cls,
        path: Union[str, Path],
        device: Union[str, torch.device] = "cpu",
        **override_config,
    ) -> "LocalFNO3D":
        """Restore a model from a checkpoint file.

        Parameters
        ----------
        path : str | Path
            Path to the saved checkpoint.
        device : str | torch.device
            Target device for the loaded model.
        **override_config
            Any constructor arguments to override from the saved config.

        Returns
        -------
        LocalFNO3D
            Restored model with loaded weights.
        """
        ckpt = torch.load(str(path), map_location=device, weights_only=False)
        config = {**ckpt.get("config", {}), **override_config}
        model = cls(**config)
        model.load_state_dict(ckpt["model_state_dict"])
        model.to(device)
        model.eval()
        return model
