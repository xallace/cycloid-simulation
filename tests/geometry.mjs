/* ==========================================================================
   tests/geometry.mjs — Headless Three.js Plate Bounds & Kinematics Check
   ========================================================================== */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
globalThis.window = globalThis;

(0, eval)(fs.readFileSync(path.join(ROOT, 'vendor', 'three', 'three.min.js'), 'utf8'));
(0, eval)(fs.readFileSync(path.join(ROOT, 'math-engine.js'), 'utf8'));
(0, eval)(fs.readFileSync(path.join(ROOT, 'data.js'), 'utf8'));
(0, eval)(fs.readFileSync(path.join(ROOT, 'scene3d.js'), 'utf8'));

const { THREE, CYCLOID_DATA, CYCLOID_SCENE3D } = globalThis;

let passed = 0;
function check(name, fn) {
  fn();
  passed++;
}

function assertFiniteBox(box, label) {
  for (const v of [box.min.x, box.min.y, box.min.z, box.max.x, box.max.y, box.max.z]) {
    assert.ok(Number.isFinite(v), `${label}: non-finite bound ${v}`);
  }
}

// 1. All 9 figure variants build within the 4.40 x 2.86 base plate
check('All 9 figure variants fit strictly inside base plate bounds', () => {
  for (const [id, fig] of Object.entries(CYCLOID_DATA.FIGURES)) {
    const anchors = [];
    const built = CYCLOID_SCENE3D.buildCycloidGeometry(
      fig.config,
      { displayMode: 'solid3d', showLabels: false, callouts: fig.callouts },
      anchors
    );
    assert.equal(anchors.length, fig.callouts.length, `${id} anchor count`);
    for (const c of fig.callouts) {
      assert.ok(Math.abs(c.anchor[0]) <= 2.2 && Math.abs(c.anchor[2]) <= 1.43, `${id} callout off-plate`);
    }

    built.root.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(built.root);
    assertFiniteBox(box, id);
    assert.ok(box.min.x >= -2.25 && box.max.x <= 2.25, `${id} X bounds: [${box.min.x}, ${box.max.x}]`);
    assert.ok(box.min.z >= -1.48 && box.max.z <= 1.48, `${id} Z bounds: [${box.min.z}, ${box.max.z}]`);
  }
});

// 2. All 8 presets x all 4 display modes build & step motion smoothly without NaN
check('All 8 presets x 4 display modes animate with finite transforms', () => {
  const modes = ['solid3d', 'exploded', 'plate2d', 'wireframe'];
  for (const [pid, preset] of Object.entries(CYCLOID_DATA.LAB_PRESETS)) {
    for (const displayMode of modes) {
      const built = CYCLOID_SCENE3D.buildCycloidGeometry(preset.config, { displayMode, showLabels: false });
      for (const th of [0.0, 1.25, 3.8, 6.2]) {
        CYCLOID_SCENE3D.applyMechanismMotion(built, th);
        built.root.updateMatrixWorld(true);
        const box = new THREE.Box3().setFromObject(built.root);
        assertFiniteBox(box, `${pid}-${displayMode}@${th}`);
      }
    }
  }
});

// 3. Extreme trochoid/cycloid slider ranges remain bounded within plate
check('Extreme slider configurations stay inside plate width and depth', () => {
  const extremes = [
    { mode: 'wankel', wankelR: 190, wankelE: 32, wankelA: 16, theta: 1.0 },
    { mode: 'cycloid_drive', cycloN: 20, cycloRpinCircle: 200, cycloRpin: 16, cycloE: 8, theta: 1.0 },
    { mode: 'trochoid', curveType: 'epi', R: 240, r: 120, d: 150, theta: 1.0 },
    { mode: 'trochoid', curveType: 'hypo', R: 40, r: 120, d: 150, theta: 1.0 },
  ];
  for (const cfg of extremes) {
    const built = CYCLOID_SCENE3D.buildCycloidGeometry(cfg, { displayMode: 'solid3d', showLabels: false });
    built.root.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(built.root);
    assertFiniteBox(box, cfg.mode);
    assert.ok(box.min.x >= -2.25 && box.max.x <= 2.25, `Extreme ${cfg.mode} X overflow`);
    assert.ok(box.min.z >= -1.48 && box.max.z <= 1.48, `Extreme ${cfg.mode} Z overflow`);
  }
});

console.log(`PASS geometry.mjs — ${passed} check groups passed.`);
