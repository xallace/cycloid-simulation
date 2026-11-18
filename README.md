# Cycloid & Planetary Kinematics Laboratory — 1967 Book Plate 3D Edition

[![Live Demo](https://img.shields.io/badge/Live_Demo-GitHub_Pages-d94426?style=for-the-badge&logo=github)](https://xallace.github.io/cycloid-simulation/)
[![License: MIT](https://img.shields.io/badge/License-MIT-047857?style=for-the-badge)](LICENSE)
[![CAD Export](https://img.shields.io/badge/CAD_Export-AC1009_DXF_%2B_SVG-355c7d?style=for-the-badge)](#cad-export-workflow)
[![Three.js + KaTeX](https://img.shields.io/badge/Three.js_%2B_KaTeX-Offline_Local-181715?style=for-the-badge)](#)

Interactive **1967 Technical Book Plate** 3D & 2D kinematics laboratory covering the **Wankel 1:3 Rotary Engine**, **Robotics Cycloidal Speed Reducers (`10:1` / `15:1`)**, classical **Epitrochoids & Hypotrochoids** (Cardioid, Nephroid, Deltoid, Astroid, Spirograph), and direct **CAD DXF / Vector SVG** export — rebuilt in monochrome archival parchment and vermilion ink as a tribute to **Walter Fendt**’s roulette applet ([walter-fendt.de](https://www.walter-fendt.de/html5/men/epihypotrochoids_en.htm)).

## Workspace Tabs

1. **3D Plate Atlas & Tour** — 6-plate 3D drafting gallery (`Plate I`–`Plate VI`, 9 `a/b` comparison variants) with callout pins, camera orbit/presets, 4 display styles (`3D Book Plate`, `Exploded Tiers`, `Flat Plate Top`, `Ink Wireframe`), and a 6-stop Guided Book Tour.
2. **Interactive Kinematics Lab** — Real-time 3D extruded & kinetic mechanisms paired with a high-DPI 2D Pan/Zoom blueprint canvas (`1967 Book Plate Ink` or `Prussian Blueprint CAD`), live speed/contour plot, LaTeX equation panel, interactive sliders (`R, r, d`, Wankel `R, e, a`, Cyclo `N, Rp, rp, e`), and 1-click **DXF / SVG export**. Supports `?embed=1` iframe mode.
3. **Concepts & Book Notes** — 6 KaTeX-typeset theorems (epitrochoid/hypotrochoid vector kinematics, $\gcd(R, r)$ period closure, Wankel outward equidistant bore, inward roller-pin envelope $K_1 > 1$, cusp velocity criterion) alongside historical essays with 3D jump links.
4. **Further Reading** — Reuleaux, Braren, DXF AC1009 specification notes, and Walter Fendt links.

## CAD Export Workflow

1. Switch to **Interactive Kinematics Lab** and select a preset (`Wankel 1:3`, `Cyclo 10:1`, `Astroid 4:1`, etc.) or tune geometry sliders.
2. Click **DXF Export (CAD)** for closed AC1009 polylines (`WANKEL_HOUSING`, `WANKEL_ROTOR`, `CYCLOID_DISC`, or `TROCHOID_CURVE`) ready for Inventor, SolidWorks, FreeCAD, or CNC milling, or **SVG Vector** for scaled vector graphics.

## Verification

Run the analytical math/CAD and headless 3D geometry checks from this directory:

```bash
node tests/verify.mjs
node tests/geometry.mjs
```

No build step or CDN dependency is required; local `vendor/three/` and `vendor/katex/` assets load directly over `file://` or HTTP.

## Credits & License

- Engineering kinematics & CAD export by **Walter (@xallace)**.
- Historical roulette pedagogy inspired by **Walter Fendt** — [Epicycloids & Hypocycloids](https://www.walter-fendt.de/html5/men/epihypotrochoids_en.htm).
- Licensed under the **MIT License** ([LICENSE](LICENSE)).
