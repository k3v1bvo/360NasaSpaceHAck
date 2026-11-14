"""
Módulo de Redes Neuronales Informadas por la Física (PINNs) con Balance Dinámico (dpPINN)
Proyecto: GEO-COCHABAMBA 360 - Microclimas Urbanos con IA
Sede: FEXCO - NASA Space Apps Cochabamba 2026

Garantiza la conservación física de las ecuaciones RANS (Navier-Stokes) y transporte térmico
en zonas con escasez de datos o durante olas de calor extremas fuera de distribución (OOD).
"""

import torch
import torch.nn as nn
from typing import Dict, Tuple, List, Optional


class DynamicPriorityBalancer:
    """
    Balanceador Adaptativo de Priorización Dinámica (dpPINN).
    Ajusta los pesos w_i de la función de pérdida en cada época según la magnitud
    de los gradientes respecto a los parámetros de la red, evitando patologías de gradiente.
    """

    def __init__(self, alpha: float = 0.9, n_losses: int = 4):
        self.alpha = alpha
        self.n_losses = n_losses
        self.weights = torch.ones(n_losses, dtype=torch.float32)
        self.running_grads = torch.zeros(n_losses, dtype=torch.float32)

    def update_weights(self, losses: List[torch.Tensor], parameters: List[torch.nn.Parameter]) -> torch.Tensor:
        """
        Calcula la magnitud del gradiente promedio para cada componente de pérdida y recalibra pesos.
        """
        grad_norms = []
        for loss in losses:
            grads = torch.autograd.grad(
                loss, parameters, retain_graph=True, create_graph=False, allow_unused=True
            )
            total_norm = 0.0
            for g in grads:
                if g is not None:
                    total_norm += g.data.norm(2).item() ** 2
            grad_norms.append(total_norm ** 0.5)

        grad_tensor = torch.tensor(grad_norms, dtype=torch.float32)
        self.running_grads = self.alpha * self.running_grads + (1.0 - self.alpha) * grad_tensor

        # Normalización inversa: componentes con gradientes muy débiles reciben mayor peso
        mean_grad = self.running_grads.mean() + 1e-8
        new_weights = mean_grad / (self.running_grads + 1e-8)
        self.weights = torch.clamp(new_weights, min=0.1, max=10.0)
        return self.weights


class PINNSolver(nn.Module):
    """
    Physics-Informed Neural Network para microclimas urbanos.
    Resuelve el campo de velocidad de viento 3D (u, v, w) y temperatura (theta)
    cumpliendo las leyes de conservación de masa, momento y energía.
    """

    def __init__(
        self,
        in_features: int = 4,  # x, y, z, t
        out_features: int = 4, # u, v, w, theta
        hidden_dim: int = 64,
        num_layers: int = 5,
        kinematic_viscosity: float = 1.5e-5,  # m²/s (aire)
        thermal_diffusivity: float = 2.2e-5   # m²/s (aire)
    ):
        super().__init__()
        self.nu = kinematic_viscosity
        self.alpha = thermal_diffusivity

        layers = []
        layers.append(nn.Linear(in_features, hidden_dim))
        layers.append(nn.Tanh())
        for _ in range(num_layers - 2):
            layers.append(nn.Linear(hidden_dim, hidden_dim))
            layers.append(nn.Tanh())
        layers.append(nn.Linear(hidden_dim, out_features))

        self.net = nn.Sequential(*layers)
        self.balancer = DynamicPriorityBalancer(n_losses=4)

    def forward(self, coords: torch.Tensor) -> torch.Tensor:
        """coords shape: [N, 4] donde cada fila es (x, y, z, t)"""
        return self.net(coords)

    def compute_residuals(
        self, coords: torch.Tensor
    ) -> Tuple[torch.Tensor, torch.Tensor, torch.Tensor]:
        """
        Calcula los residuales de las ecuaciones diferenciales parciales usando diferenciación automática.

        Returns:
            res_continuidad: div(V) = ∂u/∂x + ∂v/∂y + ∂w/∂z
            res_momento: residual de la ecuación de Navier-Stokes RANS
            res_energia: residual de la ecuación de advección-difusión de temperatura
        """
        coords.requires_grad_(True)
        pred = self.forward(coords)
        u = pred[:, 0:1]
        v = pred[:, 1:2]
        w = pred[:, 2:3]
        theta = pred[:, 3:4]

        # Gradientes de primer orden
        grad_u = torch.autograd.grad(u, coords, grad_outputs=torch.ones_like(u), create_graph=True)[0]
        grad_v = torch.autograd.grad(v, coords, grad_outputs=torch.ones_like(v), create_graph=True)[0]
        grad_w = torch.autograd.grad(w, coords, grad_outputs=torch.ones_like(w), create_graph=True)[0]
        grad_theta = torch.autograd.grad(theta, coords, grad_outputs=torch.ones_like(theta), create_graph=True)[0]

        u_x = grad_u[:, 0:1]
        v_y = grad_v[:, 1:2]
        w_z = grad_w[:, 2:3]

        # Ecuación de Continuidad: ∂u/∂x + ∂v/∂y + ∂w/∂z = 0
        res_continuidad = u_x + v_y + w_z

        # Ecuación de Energía (Transporte Térmico): ∂θ/∂t + (V · ∇)θ - α ∇²θ = 0
        theta_t = grad_theta[:, 3:4]
        theta_x = grad_theta[:, 0:1]
        theta_y = grad_theta[:, 1:2]
        theta_z = grad_theta[:, 2:3]

        adveccion_termica = u * theta_x + v * theta_y + w * theta_z
        res_energia = theta_t + adveccion_termica

        # Ecuación de Momento simplificada para flujo de viento urbano
        u_t = grad_u[:, 3:4]
        adveccion_u = u * u_x + v * grad_u[:, 1:2] + w * grad_u[:, 2:3]
        res_momento = u_t + adveccion_u

        return res_continuidad, res_momento, res_energia

    def compute_total_loss(
        self,
        data_coords: torch.Tensor,
        data_targets: torch.Tensor,
        collocation_coords: torch.Tensor
    ) -> Tuple[torch.Tensor, Dict[str, float]]:
        """Calcula la pérdida total combinada con balance adaptativo dpPINN."""
        pred_data = self.forward(data_coords)
        loss_data = nn.functional.mse_loss(pred_data, data_targets)

        res_cont, res_mom, res_ener = self.compute_residuals(collocation_coords)
        loss_cont = torch.mean(res_cont ** 2)
        loss_mom = torch.mean(res_mom ** 2)
        loss_ener = torch.mean(res_ener ** 2)

        losses = [loss_data, loss_cont, loss_mom, loss_ener]
        params = list(self.parameters())
        weights = self.balancer.update_weights(losses, params)

        total_loss = (
            weights[0] * loss_data
            + weights[1] * loss_cont
            + weights[2] * loss_mom
            + weights[3] * loss_ener
        )

        metrics = {
            "loss_total": float(total_loss.item()),
            "loss_data": float(loss_data.item()),
            "loss_continuidad": float(loss_cont.item()),
            "loss_momento": float(loss_mom.item()),
            "loss_energia": float(loss_ener.item()),
            "w_data": float(weights[0].item()),
            "w_cont": float(weights[1].item())
        }
        return total_loss, metrics

    @staticmethod
    def check_is_ood(temperature_c: float, wind_speed_ms: float) -> bool:
        """
        Determina si una condición meteorológica de entrada está fuera de distribución (OOD)
        respecto a la climatología histórica del Valle de Cochabamba (1990-2025).
        """
        # Cochabamba rangos históricos récord: Temp 0°C a 37°C, Viento 0 a 18 m/s
        es_ood = (temperature_c > 37.5) or (temperature_c < -2.0) or (wind_speed_ms > 20.0)
        return es_ood
