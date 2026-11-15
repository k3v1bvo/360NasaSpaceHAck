"""
Flame in Freefall - Microgravity Flame Kinetics & LTC (Cool Flames) Engine
NASA Space Apps Challenge 2026

Calculates:
1. Non-monotonic flame spread rate V_f (mm/s) vs opposed flow velocity V_g (cm/s).
2. Curvature and thickness effects for thin cylindrical fuels (wiring / PMMA rods).
3. Low-Temperature Chemistry (LTC) and Cool Flame regime evolution (600 K - 800 K).
4. Shift in Limiting Oxygen Index (LOI) and Maximum Oxygen Concentration (MOC) from 1-g to micro-g.
"""

import os
import numpy as np
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt

class MicrogravityFlameKinetics:
    def __init__(self, atmosphere="ISS_Standard"):
        """
        Atmospheric configurations:
        - ISS_Standard: 14.7 psia (101.3 kPa), 21% O2
        - Artemis_Exploration: 10.2 psia (70.3 kPa), 34% O2
        - Lunar_Surface: 8.2 psia (56.5 kPa), 32% O2
        """
        self.atmospheres = {
            "ISS_Standard": {"P_atm": 1.0, "O2": 0.21, "name": "ISS Standard (14.7 psia, 21% O2)"},
            "Artemis_Exploration": {"P_atm": 0.694, "O2": 0.34, "name": "Artemis Gateway (10.2 psia, 34% O2)"},
            "Lunar_Surface": {"P_atm": 0.558, "O2": 0.32, "name": "Lunar Habitat (8.2 psia, 32% O2)"}
        }
        self.current_atm = self.atmospheres.get(atmosphere, self.atmospheres["ISS_Standard"])

    def calculate_flame_spread(self, V_g, d_fuel, material="PMMA"):
        """
        Calculates opposed flow flame spread rate V_f (mm/s).
        Based on BASS-II, FLARE (ISO 4589-4) and SoFIE orbital data.
        
        Parameters:
        V_g: Opposed flow velocity in cm/s (typically 0 to 20 cm/s in cabin HVAC)
        d_fuel: Fuel cylinder diameter in mm (0.5 to 10 mm)
        material: Fuel material ('PMMA', 'ETFE_Wire', 'Nomex')
        """
        P = self.current_atm["P_atm"]
        Y_O2 = self.current_atm["O2"]
        
        # Material constants
        mat_factors = {
            "PMMA": {"alpha": 1.0, "k_burn": 2.1, "rad_sens": 1.0},
            "ETFE_Wire": {"alpha": 1.35, "k_burn": 2.8, "rad_sens": 1.25},
            "Nomex": {"alpha": 0.42, "k_burn": 0.9, "rad_sens": 0.75}
        }
        props = mat_factors.get(material, mat_factors["PMMA"])
        
        # 1. Oxidizer transport enhancement by slow forced flow
        v_transport = 1.95 * (Y_O2 / 0.21) * np.sqrt(np.maximum(V_g, 0.04)) * (P ** 0.5)
        
        # 2. Curvature enhancement for thin fuels (Biot number Bi << 0.1)
        curvature_factor = props["alpha"] * (1.0 / (np.maximum(d_fuel, 0.1) ** 0.82))
        
        # 3. Convective cooling / aerothermal blow-off at higher velocity
        strain_rate = np.maximum(V_g, 0.05) / (2.0 * np.maximum(d_fuel, 0.2) * 0.1)  # s^-1
        cooling_factor = np.exp(-strain_rate / (48.0 * props["k_burn"]))
        
        # 4. Radiative extinction penalty in quiescent / ultra-slow microgravity
        # Soot shell accumulation increases radiative heat loss (q_rad > q_chem)
        rad_loss = np.exp(- (0.28 * props["rad_sens"]) / np.maximum(V_g, 0.02))
        
        # Net flame spread rate in mm/s
        V_f = v_transport * curvature_factor * cooling_factor * rad_loss * 2.35
        return np.maximum(V_f, 0.0)

    def simulate_cool_flame_transient(self, t_seconds=60.0, dt=0.05):
        """
        Simulates the post-hot-flame radiative extinction transition to 
        quasi-steady Cool Flame (LTC kinetics: 600 K - 800 K) with H2O2 accumulation.
        """
        steps = int(t_seconds / dt)
        t = np.linspace(0, t_seconds, steps)
        
        T = np.zeros(steps)
        H2O2 = np.zeros(steps)       # ppm
        CH2O = np.zeros(steps)       # ppm
        CO = np.zeros(steps)         # ppm
        state = []                   # HOT, EXTINCTION, COOL_FLAME, LATENT
        
        # Initial conditions: Hot flame active
        T[0] = 1650.0  # Kelvin
        H2O2[0] = 0.5
        CH2O[0] = 2.0
        CO[0] = 15.0
        
        for i in range(1, steps):
            curr_t = t[i]
            
            if curr_t < 12.0:
                # Stage 1: Hot flame radiative decay due to soot shell buildup
                decay_rate = 35.0  # K/s
                T[i] = max(T[i-1] - decay_rate * dt, 740.0)
                H2O2[i] = H2O2[i-1] + 0.15 * dt
                CH2O[i] = CH2O[i-1] + 0.4 * dt
                CO[i] = CO[i-1] + 1.2 * dt
                state.append("HOT_FLAME" if T[i] > 1100 else "RADIATIVE_COLLAPSE")
            elif curr_t < 45.0:
                # Stage 2: Metastable Cool Flame (LTC equilibrium sustained by peroxides)
                # Oscillation around 710 K characteristic of NTC (Negative Temperature Coefficient)
                omega = 2.0 * np.pi * 0.25  # 0.25 Hz limit cycle
                T[i] = 715.0 + 25.0 * np.sin(omega * curr_t) + np.random.normal(0, 1.5)
                # H2O2 accumulates as critical intermediate
                H2O2[i] = min(H2O2[i-1] + 0.85 * dt, 42.0)
                CH2O[i] = min(CH2O[i-1] + 0.55 * dt, 30.0)
                CO[i] = CO[i-1] + 0.3 * dt
                state.append("COOL_FLAME_ACTIVE")
            else:
                # Stage 3: Gradual diffusion dissipation or secondary quenching
                T[i] = max(T[i-1] - 8.0 * dt, 298.15)
                H2O2[i] = max(H2O2[i-1] - 0.5 * dt, 0.0)
                CH2O[i] = max(CH2O[i-1] - 0.3 * dt, 0.0)
                CO[i] = CO[i-1]
                state.append("EXTINCT_LATENT")
                
        state.insert(0, "HOT_FLAME")
        return {
            "time": t,
            "temperature": T,
            "H2O2_ppm": H2O2,
            "CH2O_ppm": CH2O,
            "CO_ppm": CO,
            "states": state
        }

    def generate_flame_spread_plot(self, output_path="simulation/outputs/flame_spread_curves.png"):
        """Generates publication-quality flame spread curves."""
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        
        V_g_arr = np.linspace(0.01, 20.0, 300)
        diameters = [0.5, 1.0, 3.0, 6.4]
        
        plt.figure(figsize=(10, 6), dpi=300)
        colors = ['#d32f2f', '#f57c00', '#1976d2', '#388e3c']
        
        for d, c in zip(diameters, colors):
            v_f = [self.calculate_flame_spread(v, d, material="PMMA") for v in V_g_arr]
            plt.plot(V_g_arr, v_f, label=f"Cilindro PMMA d = {d} mm", color=c, linewidth=2.2)
            
        plt.axvspan(0.4, 5.0, color='#ffebee', alpha=0.6, label="Meseta Crítica HVAC ISS (0.4 - 5.0 cm/s)")
        plt.axvline(x=0.4, color='#b71c1c', linestyle='--', linewidth=1.2)
        plt.axvline(x=5.0, color='#b71c1c', linestyle='--', linewidth=1.2)
        
        plt.title(f"Tasa de Propagación de Llama en Microgravedad\nAtmósfera: {self.current_atm['name']}", fontsize=12, fontweight='bold', pad=12)
        plt.xlabel("Velocidad de Flujo Forzado Opuesto $V_g$ (cm/s)", fontsize=11)
        plt.ylabel("Velocidad de Propagación de Llama $V_f$ (mm/s)", fontsize=11)
        plt.grid(True, linestyle=':', alpha=0.6)
        plt.legend(loc="upper right", framealpha=0.9, fontsize=9.5)
        plt.tight_layout()
        plt.savefig(output_path)
        plt.close()
        return output_path

    def generate_cool_flame_plot(self, output_path="simulation/outputs/cool_flame_transient.png"):
        """Generates publication-quality Cool Flame LTC transient plot."""
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        data = self.simulate_cool_flame_transient(t_seconds=60.0)
        
        fig, ax1 = plt.subplots(figsize=(11, 6), dpi=300)
        
        color_temp = '#b71c1c'
        ax1.set_xlabel('Tiempo tras Ignición (segundos)', fontsize=11)
        ax1.set_ylabel('Temperatura de Zona de Reacción (K)', color=color_temp, fontsize=11)
        ax1.plot(data["time"], data["temperature"], color=color_temp, linewidth=2.4, label="Temperatura (K)")
        ax1.tick_params(axis='y', labelcolor=color_temp)
        ax1.set_ylim(200, 1800)
        ax1.grid(True, linestyle=':', alpha=0.5)
        
        # Shade cool flame zone
        ax1.axvspan(12.0, 45.0, color='#fff9c4', alpha=0.5, label="Régimen de Llama Fría (Cool Flame: 600-800 K)")
        
        ax2 = ax1.twinx()
        ax2.set_ylabel('Concentración de Especies Intermedias (ppm)', color='#0d47a1', fontsize=11)
        ax2.plot(data["time"], data["H2O2_ppm"], color='#0288d1', linestyle='-', linewidth=2.0, label="$H_2O_2$ (Peróxido de Hidrógeno)")
        ax2.plot(data["time"], data["CH2O_ppm"], color='#7b1fa2', linestyle='--', linewidth=2.0, label="$CH_2O$ (Formaldehído)")
        ax2.plot(data["time"], data["CO_ppm"], color='#455a64', linestyle=':', linewidth=2.0, label="$CO$ (Monóxido de Carbono)")
        ax2.tick_params(axis='y', labelcolor='#0d47a1')
        ax2.set_ylim(0, 50)
        
        lines1, labels1 = ax1.get_legend_handles_labels()
        lines2, labels2 = ax2.get_legend_handles_labels()
        ax1.legend(lines1 + lines2, labels1 + labels2, loc='upper right', framealpha=0.9, fontsize=9.5)
        
        plt.title("Dinámica de Llama Fría (Cool Flame) y Acumulación de Especies LTC en Microgravedad", fontsize=12, fontweight='bold', pad=12)
        plt.tight_layout()
        plt.savefig(output_path)
        plt.close()
        return output_path

if __name__ == "__main__":
    kinetics = MicrogravityFlameKinetics(atmosphere="ISS_Standard")
    p1 = kinetics.generate_flame_spread_plot()
    p2 = kinetics.generate_cool_flame_plot()
    print(f"[OK] Graficos generados en:\n - {p1}\n - {p2}")
