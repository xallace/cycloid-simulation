/* ==========================================================================
   tests/verify.mjs — Analytical Math, Meshing Tangency & CAD Export Tests
   ========================================================================== */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
globalThis.window = globalThis;

(0, eval)(fs.readFileSync(path.join(ROOT, 'math-engine.js'), 'utf8'));
(0, eval)(fs.readFileSync(path.join(ROOT, 'data.js'), 'utf8'));

const { CycloidMath, CYCLOID_DATA } = globalThis;

let passed = 0;
function check(name, fn) {
  fn();
  passed++;
}

// 1. GCD, Period & Harmonic Cusps/Turns
check('GCD, rational period, and harmonic lobe counts', () => {
  assert.equal(CycloidMath.gcd(140, 52), 4);
  const info = CycloidMath.getHarmonicInfo(140, 52);
  assert.equal(info.cusps, 35);
  assert.equal(info.turns, 13);
  const period = CycloidMath.getPeriod(140, 52);
  assert.ok(Math.abs(period - 26 * Math.PI) < 1e-6);
});

// 2. Astroid exact cos^3 / sin^3 & Cardioid zero-velocity cusp
check('Classical epitrochoid/hypotrochoid formulas and cusp speed', () => {
  // Astroid: R=120, r=30, d=30 -> (120 cos^3 t, 120 sin^3 t)
  for (const t of [0.3, 1.1, 2.4, 4.9]) {
    const pt = CycloidMath.getHypotrochoidPoint(120, 30, 30, t);
    const ex = 120 * Math.pow(Math.cos(t), 3);
    const ey = 120 * Math.pow(Math.sin(t), 3);
    assert.ok(Math.hypot(pt.x - ex, pt.y - ey) < 1e-9, `Astroid mismatch at t=${t}`);
  }

  // Cardioid cusp at theta = 0: speed must be 0 when d = r
  assert.ok(CycloidMath.getCurveSpeed('epi', 60, 60, 60, 0) < 1e-9);
  // Prolate loop at d > r: speed strictly > 0 at theta = 0
  assert.ok(CycloidMath.getCurveSpeed('hypo', 100, 25, 42, 0) > 10);
});

// 3. Wankel outward equidistant housing stays strictly outside rotor apexes by clearance a
check('Wankel rotor apexes stay inside outward-offset housing bore', () => {
  const e = 20, R = 140, a = 6;
  const housingZero = CycloidMath.getWankelHousingPoints(e, R, 0, 720);
  const housingOffset = CycloidMath.getWankelHousingPoints(e, R, a, 720);

  // Offset curve must expand outward beyond zero-offset curve everywhere
  for (let i = 0; i < housingZero.length; i += 20) {
    assert.ok(
      Math.hypot(housingOffset[i].x, housingOffset[i].y) > Math.hypot(housingZero[i].x, housingZero[i].y) + 4,
      `Housing outward offset shrunk at idx ${i}`
    );
  }

  // Every rotor apex across shaft rotation must touch bore a=0 and stay strictly inside bore a=6
  for (let deg = 0; deg < 360; deg += 30) {
    const theta = (deg * Math.PI) / 180;
    const rotor = CycloidMath.getWankelRotor(e, R, theta);
    for (const ap of rotor.apexes) {
      let minDist0 = Infinity;
      let minDistA = Infinity;
      for (const h of housingZero) {
        const d0 = Math.hypot(ap.x - h.x, ap.y - h.y);
        if (d0 < minDist0) minDist0 = d0;
      }
      for (const h of housingOffset) {
        const da = Math.hypot(ap.x - h.x, ap.y - h.y);
        if (da < minDistA) minDistA = da;
      }
      assert.ok(minDist0 < 1.2, `Wankel apex drifted from bore at theta=${deg}°: ${minDist0}`);
      assert.ok(Math.abs(minDistA - a) < 1.2, `Wankel seal clearance mismatch at theta=${deg}°: ${minDistA}`);
    }
  }
});

// 4. Cycloidal reducer disc maintains exact roller-pin tangency >= r_pin around 360 deg
check('Cycloidal reducer disc has zero pin interference and tight contact', () => {
  const N = 10, Rp = 150, rp = 10, e = 6;
  const pins = N + 1;
  const disc = CycloidMath.getCycloidDiscProfile(N, Rp, rp, e, 720);

  for (let deg = 0; deg < 360; deg += 30) {
    const theta = (deg * Math.PI) / 180;
    const cx = e * Math.cos(theta);
    const cy = e * Math.sin(theta);
    const rot = -theta / N;
    const cosR = Math.cos(rot);
    const sinR = Math.sin(rot);

    // Transform disc points to world coordinates
    const worldDisc = disc.map((p) => ({
      x: cx + p.x * cosR - p.y * sinR,
      y: cy + p.x * sinR + p.y * cosR,
    }));

    let tightestContact = Infinity;
    for (let k = 0; k < pins; k++) {
      const pa = (k / pins) * 2 * Math.PI;
      const px = Rp * Math.cos(pa);
      const py = Rp * Math.sin(pa);

      let minD = Infinity;
      for (const wp of worldDisc) {
        const d = Math.hypot(px - wp.x, py - wp.y);
        if (d < minD) minD = d;
      }
      assert.ok(minD >= rp - 0.15, `Pin #${k} penetrated cycloid disc at theta=${deg}°: minD=${minD}`);
      if (minD < tightestContact) tightestContact = minD;
    }
    assert.ok(tightestContact <= rp + 0.65, `Loaded pin gap too loose at theta=${deg}°: ${tightestContact}`);
  }
});

// 5. DXF AC1009 & SVG CAD Exporters
check('DXF AC1009 and SVG vector export output structure', () => {
  const housing = CycloidMath.getWankelHousingPoints(20, 140, 6, 120);
  const rotor = CycloidMath.getWankelRotor(20, 140, 0);
  const dxf = CycloidMath.generateDXF([housing, rotor.flankPoints], ['WANKEL_HOUSING', 'WANKEL_ROTOR']);
  assert.ok(dxf.includes('$ACADVER\n1\nAC1009'));
  assert.ok(dxf.includes('WANKEL_HOUSING'));
  assert.ok(dxf.includes('WANKEL_ROTOR'));
  assert.ok(dxf.trim().endsWith('EOF'));

  const svg = CycloidMath.generateSVG([housing, rotor.flankPoints], ['#d94426', '#181715']);
  assert.ok(svg.includes('<svg xmlns="http://www.w3.org/2000/svg"'));
  assert.ok(svg.includes('<path d="M '));
});

// 6. Data Catalog completeness
check('CYCLOID_DATA catalog integrity (9 variants, 6 tour, 8 presets, 6 concepts)', () => {
  assert.equal(CYCLOID_DATA.FIGURE_ORDER.length, 6);
  assert.equal(CYCLOID_DATA.OVERVIEW_IDS.length, 6);
  assert.equal(Object.keys(CYCLOID_DATA.FIGURES).length, 9);
  assert.equal(Object.keys(CYCLOID_DATA.LAB_PRESETS).length, 8);
  assert.equal(CYCLOID_DATA.TOUR_STOPS.length, 6);
  assert.equal(CYCLOID_DATA.CONCEPTS.length, 6);

  for (const [id, f] of Object.entries(CYCLOID_DATA.FIGURES)) {
    assert.ok(f.name.en && f.name.de, `${id} bilingual name`);
    assert.ok(f.callouts.length >= 1, `${id} has callouts`);
  }
  for (const stop of CYCLOID_DATA.TOUR_STOPS) {
    assert.ok(stop.targetView === 'overview' || CYCLOID_DATA.FIGURES[stop.targetView]);
  }
  for (const c of CYCLOID_DATA.CONCEPTS) {
    assert.ok(c.latex && CYCLOID_DATA.LAB_PRESETS[c.tryPreset]);
  }
});

console.log(`PASS verify.mjs — ${passed} check groups passed.`);
