<div align="center">

# ⚙️ Cycloid & Planetary Kinematics Laboratory
### Modern Interactive Epicycloids, Hypotrochoids, Wankel Rotary Engine & Robotics Cyclo Drives with Direct CAD DXF/SVG Export

[![GitHub Pages](https://img.shields.io/badge/Live_Demo-GitHub_Pages-00f2fe?style=for-the-badge&logo=github)](https://xallace.github.io/cycloid-simulation/)
[![License: MIT](https://img.shields.io/badge/License-MIT-10b981?style=for-the-badge)](LICENSE)
[![Platform: Web](https://img.shields.io/badge/Platform-HTML5_Canvas_2D-3b82f6?style=for-the-badge)](https://developer.mozilla.org)
[![CAD Export](https://img.shields.io/badge/CAD_Export-AutoCAD_DXF_%2B_SVG-f59e0b?style=for-the-badge)](#cad-export-workflow)
[![Vanilla JS](https://img.shields.io/badge/Dependencies-Zero_Vanilla_ES6-10b981?style=for-the-badge)](https://developer.mozilla.org)

*A high-fidelity mechanical engineering modernization and pedagogical tribute to Walter Fendt’s classic roulette curves applet (2024).*

[**🚀 Launch Live Simulator**](https://xallace.github.io/cycloid-simulation/) • [**📐 Kinematic Derivations**](#kinematic-derivations) • [**🛠️ CAD Export Workflow**](#cad-export-workflow) • [**✨ New Features**](#modern-features--enhancements)

</div>

---

## 🌟 Overview

Trochoids and cycloidal curves form the mathematical backbone of advanced mechanical engineering mechanisms: from **cycloidal tooth profiles** in clockwork gears to the combustion chambers of **Wankel rotary engines** and the zero-backlash **cycloidal speed reducers (Cyclo Drives)** used in modern 6-axis industrial robots (KUKA, Fanuc, ABB).

While Walter Fendt's original 2024 applet (`epihypotrochoids.js`) presented the classical geometric roll curves on a static 2D canvas, this modernized laboratory transforms the concept into an **applied mechanical engineering simulation and design tool**.

It models real mechatronic machines, calculates analytical equidistant offset curves, and provides direct **ASCII DXF & Vector SVG export** for mechanical CAD software (Autodesk Inventor, SolidWorks, FreeCAD, Fusion 360).

---

## ✨ Modern Features & Enhancements

| Feature | Original Applet (Walter Fendt, 2024) | Modernized Laboratory (2026) |
| :--- | :--- | :--- |
| **Engineering Models** | Abstract rolling circles only | **Wankel Rotary Engine**, **Robotics Cycloid Drive**, Spirograph & Classical Roulettes |
| **CAD Integration** | None | **Direct 1-Click DXF & SVG Export** of valid CAD profile geometry |
| **Viewport & Navigation** | Static centered box | High-DPI Canvas with smooth **Pan & Zoom** (drag to pan, scroll to zoom) |
| **Parametric Presets** | Radio buttons | Presets for Cardioid, Nephroid, Astroid, Deltoid, Wankel & 10:1/15:1 Cyclo Drives |
| **Aesthetics & Theme** | Flat primary colors on yellow | **Slate Dark Mode** and technical **Blueprint CAD Mode** |
| **Acoustics** | Silent | Procedural Web Audio API synthesis (gear tooth meshing clicks & Wankel shaft hum) |
| **Dependencies** | None | **Zero external dependencies** (Vanilla ES6, HTML5 Canvas 2D, Web Audio API) |

---

## 📐 Kinematic Derivations

### 1. Classical Trochoids
When a circle of radius $r$ rolls without slipping along the circumference of a fixed circle of radius $R$, a tracing point located at radial distance $d$ from the rolling circle center describes:

* **Epitrochoid (external rolling):**
  $$x(\theta) = (R + r)\cos\theta - d\cos\left(\frac{R + r}{r}\theta\right)$$
  $$y(\theta) = (R + r)\sin\theta - d\sin\left(\frac{R + r}{r}\theta\right)$$

* **Hypotrochoid (internal rolling):**
  $$x(\theta) = (R - r)\cos\theta + d\cos\left(\frac{R - r}{r}\theta\right)$$
  $$y(\theta) = (R - r)\sin\theta - d\sin\left(\frac{R - r}{r}\theta\right)$$

The curve closes precisely after $k = \frac{r}{\gcd(R, r)}$ revolutions of the rolling center.

### 2. Wankel Rotary Engine Geometry
The housing of a Wankel engine is an epitrochoid parallel envelope with eccentricity $e$, generating radius $R$, and apex seal offset $a$:

$$x(\alpha) = e \cos(3\alpha) + R \cos\alpha$$
$$y(\alpha) = e \sin(3\alpha) + R \sin\alpha$$

The triangular rotor turns on an eccentric crank at exactly $\frac{1}{3}$ of the shaft's rotational frequency ($\omega_{\text{rotor}} = \frac{1}{3} \omega_{\text{shaft}}$), ensuring that all 3 apex seals maintain continuous tangential contact with the trochoidal housing.

### 3. Robotics Cycloidal Speed Reducer (Cyclo Drive)
A cycloidal disc with $N$ lobes rolling inside an outer ring of $N+1$ stationary roller pins of radius $R_p$ achieves a single-stage reduction ratio of:

$$i = \frac{1}{N}$$

The equidistant profile curve of the cycloidal disc accounting for the roller pin offset $r_p$ is analytically solved via the normal contact angle $\psi$:

$$\psi = \arctan\left( \frac{\sin((1-N)\phi)}{\frac{R_{\text{pin}}}{e(N+1)} - \cos((1-N)\phi)} \right)$$

---

## 🛠️ CAD Export Workflow

To use the generated curves directly in your mechanical CAD workflows:

1. Select your desired kinematics mode (e.g., *Wankelmotor* or *Roboter-Zykloidgetriebe*).
2. Adjust the geometric sliders ($R, r, d$, eccentricity $e$, or lobe count $N$).
3. Click **„DXF Export (CAD)“**.
4. In **Autodesk Inventor** or **SolidWorks**:
   * Open / Insert $\rightarrow$ **Import DXF as 2D Sketch**.
   * Select the imported `WANKEL_HOUSING` or `CYCLOID_DISC` polyline.
   * Apply an **Extrude** feature to generate your 3D solid for CNC milling or 3D printing!

---

## 📜 Credits & License

* Modern engineering implementation, CAD export engine, and mechatronic models by **Walter (@xallace)** (2026).
* Pedagogical tribute to **Walter Fendt** (Studiendirektor a.D., [www.walter-fendt.de](https://www.walter-fendt.de)).
* Released under the **MIT License**.
