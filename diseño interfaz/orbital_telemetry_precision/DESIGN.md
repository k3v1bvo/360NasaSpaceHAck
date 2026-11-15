---
name: Orbital Telemetry Precision
colors:
  surface: '#0f131d'
  surface-dim: '#0f131d'
  surface-bright: '#353944'
  surface-container-lowest: '#0a0e17'
  surface-container-low: '#181b25'
  surface-container: '#1c1f29'
  surface-container-high: '#262a34'
  surface-container-highest: '#31353f'
  on-surface: '#dfe2f0'
  on-surface-variant: '#bdc8d1'
  inverse-surface: '#dfe2f0'
  inverse-on-surface: '#2d303b'
  outline: '#87929a'
  outline-variant: '#3e484f'
  surface-tint: '#7bd0ff'
  primary: '#8ed5ff'
  on-primary: '#00354a'
  primary-container: '#38bdf8'
  on-primary-container: '#004965'
  inverse-primary: '#00668a'
  secondary: '#4edea3'
  on-secondary: '#003824'
  secondary-container: '#00a572'
  on-secondary-container: '#00311f'
  tertiary: '#ffc174'
  on-tertiary: '#472a00'
  tertiary-container: '#f59e0b'
  on-tertiary-container: '#613b00'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#c4e7ff'
  primary-fixed-dim: '#7bd0ff'
  on-primary-fixed: '#001e2c'
  on-primary-fixed-variant: '#004c69'
  secondary-fixed: '#6ffbbe'
  secondary-fixed-dim: '#4edea3'
  on-secondary-fixed: '#002113'
  on-secondary-fixed-variant: '#005236'
  tertiary-fixed: '#ffddb8'
  tertiary-fixed-dim: '#ffb95f'
  on-tertiary-fixed: '#2a1700'
  on-tertiary-fixed-variant: '#653e00'
  background: '#0f131d'
  on-background: '#dfe2f0'
  surface-variant: '#31353f'
typography:
  headline-xl:
    fontFamily: Space Grotesk
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-xl-mobile:
    fontFamily: Space Grotesk
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-lg:
    fontFamily: Space Grotesk
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Space Grotesk
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: 0em
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
    letterSpacing: 0em
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
    letterSpacing: 0em
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
    letterSpacing: 0.01em
  telemetry-data-lg:
    fontFamily: JetBrains Mono
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 26px
    letterSpacing: -0.02em
  telemetry-data-md:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 18px
    letterSpacing: 0em
  label-caps:
    fontFamily: JetBrains Mono
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 14px
    letterSpacing: 0.08em
  label-sm:
    fontFamily: JetBrains Mono
    fontSize: 10px
    fontWeight: '500'
    lineHeight: 12px
    letterSpacing: 0.05em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  gutter: 0.75rem
  gutter-desktop: 1rem
  margin: 1rem
  margin-desktop: 1.5rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 0.75rem
  space-lg: 1.25rem
  space-xl: 2rem
---

## Brand & Style

This design system establishes an ultra-high-reliability mission operations environment synthesizing NASA Mission Control rigor, SpaceX Dragon avionics touchscreen legibility, and Linear/Figma tool density. It is engineered for operators, flight dynamics officers, and payload engineers who require zero-latency visual parsing under high cognitive load.

The design movement combines **Technical Glassmorphism** with **Engineered Precision Minimalism**:
- Deep vacuum backgrounds eliminate optical fatigue during prolonged darkroom cycles.
- Layered slate-translucent surfaces provide structural separation without breaking spatial situational awareness.
- Accent channels function strictly as functional state indicators—never decorative flourishes.
- Dense, aligned readouts mirror avionics flight director panels: information is predictable, deterministic, and modular.

## Colors

The palette operates on strict chromatic governance calibrated against pitch-black dark-room conditions:

- **Primary (`#38bdf8` / Cyan):** Active telemetry, vectorized vectors, primary system status, and focused target tracks. Secondary shade `#0284c7` serves for hover and focused boundaries.
- **Secondary (`#10b981` / Emerald):** Nominal trajectory, confirmed lock, verified telemetry packets, life-support green.
- **Tertiary (`#f59e0b` / Amber):** Aerothermal thresholds, sensor divergence, non-blocking telemetry frame drop, elevated delta-V delta.
- **Critical Alert (`#f43f5e` / Flame Red):** Trajectory abort, pressure breach, thruster shutdown, safety lock trigger.
- **Neutral Surface Hierarchy:**
  - Base Space Canvas: `#050811` (Deep vacuum void)
  - Surface Glass Low: `rgba(11, 17, 32, 0.72)` with 16px backdrop-filter blur.
  - Surface Glass High (Hover/Active module): `rgba(17, 26, 48, 0.85)` with 20px blur.
  - Structural Reticle Borders: `#1e293b` (Subtle boundary) and `#334155` (Active panel perimeter).

## Typography

The typographic system utilizes a tri-family architectural schema:

1. **Space Grotesk (Structural Headings & Section Demarcation):** Geometric, mechanical, and authoritative. Used for stage labels, vehicle states, and orbital mission phase banners.
2. **Inter (Narrative & Instructional Body):** Maximum neutral legibility at compact body scales for system logs, incident reporting, and procedural checklists.
3. **JetBrains Mono (Numerical Telemetry & Labels):** Tabular numerals by default ensure jitter-free real-time telemetry streaming (altitude, velocity, pitch/yaw/roll, oxidizer pressures). Uppercase tracking on micro-labels ensures zero ambiguity between alphanumeric callouts (e.g., `O2-PRSS-01` vs `02-PBSS-01`).

## Layout & Spacing

The spatial architecture is a modular, high-density 12-column grid designed for rapid dock-and-rearrange operations across dual-widescreen flight bridges and ruggedized cockpit tablets.

- **Grid Dynamics:** Elements adhere strictly to a 4px/8px incremental rhythm. Gutters remain tightly locked (`0.75rem` mobile, `1rem` desktop) to maintain cohesive visual proximity across telemetry pairings (e.g., Target vs. Actual Delta-V).
- **Responsive Adaptations:**
  - **Desktop/Console (>=1280px):** Multi-dock modular pane setup. Primary telemetry vectors take 8 columns; fault tree and subsystem diagnostics take 4 columns.
  - **Cockpit Tablet (768px - 1279px):** 2-column stacked operational flow. Retains persistent 56px status banner at bottom for quick thumb reach.
  - **Handheld Tactical (<768px):** Single-column stacked telemetry stream. Micro-metrics shift into horizontal swipeable ribbon strips with 44px minimum interactive touch boundaries.

## Elevation & Depth

Visual hierarchy uses slate-translucent glass stratification and hairline reticle boundaries rather than cast shadows, ensuring visual clarity without muddying low-light operations:

- **Level 0 (Deep Base):** Solid `#050811`. Background orbital vector map, starry canvas, and trajectory canvas.
- **Level 1 (Subsystem Matrix Panels):** `rgba(11, 17, 32, 0.72)` background, `1px solid #1e293b`, `backdrop-filter: blur(16px)`. Houses continuous telemetry instruments.
- **Level 2 (Active Module / Flyout):** `rgba(17, 26, 48, 0.88)` background, `1px solid #334155`, `backdrop-filter: blur(24px)`. Elevated focus panels, manual override controls, and command execution dialogs.
- **Level 3 (Mission-Critical Overlays & Abort Shields):** `rgba(15, 23, 42, 0.95)` with high-contrast active perimeter illumination:
  - Nominal: `0 0 0 1px #38bdf8, 0 0 24px rgba(56, 189, 248, 0.15)`
  - Emergency/Abort: `0 0 0 1px #f43f5e, 0 0 32px rgba(244, 63, 94, 0.35)`

## Shapes

The interface embraces a low-radius, industrial-cut silhouette (`roundedness: 1`). 

- Default elements utilize subtle `0.25rem` (4px) corner radii, mimicking machined cockpit multi-function displays (MFDs).
- Containers and modal telemetry clusters cap at `0.5rem` (8px). 
- Avoid pill or bubble geometries; circular shapes are reserved solely for radial directional attitude indicators, compass heading bugs, and status LED pips.

## Components

### Buttons & Arming Switches
- **Primary Avionics Action:** Solid cyan (`#38bdf8`) fill with dark ink (`#050811`) text, uppercase `label-caps`. Minimum height `40px` (desktop), `48px` (touch consoles).
- **Secondary / Confirm:** Translucent slate (`rgba(30, 41, 59, 0.6)`) with `1px solid #334155` border, text `#38bdf8`.
- **Arm / Abort Actions:** Dual-state physical-feel component. State 1: "ARM" with amber hatch pattern. State 2: "DISCHARGE/FIRE" in solid `#f43f5e` with pulsing safety border. Requires 1.5s press-and-hold confirmation.

### Telemetry Value Strips & Cards
- Stacked configuration: Metric designation on top (`label-sm`, `#64748b`), instantaneous readout centered (`telemetry-data-lg`, `#f8fafc`), rate-of-change and delta units anchored below (`label-caps`).
- Borders transition to warning amber or fault red instantly when telemetry exceeds safe operating parameters.

### Form Inputs & Hex Encoders
- Background `rgba(15, 23, 42, 0.8)`, border `1px solid #1e293b`.
- Typography set in `JetBrains Mono`. Integrated unit tags (e.g., `kN`, `kPa`, `km/s`) affixed to the right boundary in `#64748b`.
- Focus state activates cyan border (`#38bdf8`) with zero offset.

### Subsystem Status Chips
- Height `22px`, horizontal padding `8px`.
- Composed of an 6px status LED pip (solid green, blinking amber, or rapid flashing red) alongside mono text.
- Border-radius `2px`, background `rgba(15, 23, 42, 0.9)`.

### Avionics Checklists & Fault Trees
- Left-aligned mono sequence numbers (`010`, `020`, `030`).
- Checkboxes are square, 16px, with crisp 1px borders. Checked state features a high-visibility check with a faint emerald backlight glow (`#10b981`).
- Multi-tier fault rows collapse with crisp right/down chevron carats, highlighting degraded downstream components automatically.