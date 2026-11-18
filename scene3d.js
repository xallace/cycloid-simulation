/* ==========================================================================
   scene3d.js — Three.js 1967 Book-Plate 3D Cycloid & Planetary Dioramas
   Supports Wankel 1:3 Rotary Bore, N/(N+1) Cycloidal Reducers,
   Epitrochoid & Hypotrochoid Rolling Pinions, 6-Plate Gallery & Kinetic Loop
   ========================================================================== */
(function (global) {
  'use strict';

  const THREE = global.THREE;
  const M = global.CycloidMath;

  const INK_DARK = 0x181715;
  const INK_CHARCOAL = 0x2b2823;
  const PAPER_BG = 0xefe6d3;
  const PAPER_CARD = 0xf6efe0;
  const PAPER_PLATE = 0xfaf5e8;
  const PAPER_ALT = 0xe2d7c1;
  const VERMILION = 0xd94426;
  const AMBER_WARM = 0xb45309;
  const OK_GREEN = 0x047857;
  const SLATE_INK = 0x355c7d;

  const PLATE_W = 4.40;
  const PLATE_D = 2.86;
  const PLATE_THICK = 0.08;
  const PLATE_TOP_Y = -0.14;
  const TARGET_MECH_R = 1.06;

  function computeMechanismScale(cfg) {
    if (cfg.mode === 'wankel') {
      const ext = (cfg.wankelR || 140) + (cfg.wankelE || 20) + (cfg.wankelA || 6) + 22;
      return TARGET_MECH_R / Math.max(40, ext);
    }
    if (cfg.mode === 'cycloid_drive') {
      const ext = (cfg.cycloRpinCircle || 150) + (cfg.cycloRpin || 10) + 18;
      return TARGET_MECH_R / Math.max(40, ext);
    }
    const R = cfg.R || 120;
    const r = cfg.r || 40;
    const d = cfg.d || 40;
    const ext = cfg.curveType === 'hypo' ? Math.max(R + 10, Math.abs(R - r) + d + 10) : R + r + Math.max(r, d) + 10;
    return TARGET_MECH_R / Math.max(40, ext);
  }

  function clearGroup(group) {
    while (group.children.length > 0) {
      const child = group.children[0];
      group.remove(child);
      if (child.geometry) child.geometry.dispose();
      if (child.material) {
        if (Array.isArray(child.material)) {
          child.material.forEach((m) => {
            if (m.map && !(m.map.userData && m.map.userData.cached)) m.map.dispose();
            m.dispose();
          });
        } else {
          if (child.material.map && !(child.material.map.userData && child.material.map.userData.cached)) {
            child.material.map.dispose();
          }
          child.material.dispose();
        }
      }
      if (child.children && child.children.length > 0) clearGroup(child);
    }
  }

  function addInkEdges(mesh, threshold = 24, color = INK_DARK, opacity = 0.85) {
    const edges = new THREE.EdgesGeometry(mesh.geometry, threshold);
    const lines = new THREE.LineSegments(
      edges,
      new THREE.LineBasicMaterial({ color, transparent: opacity < 1, opacity })
    );
    mesh.add(lines);
    return lines;
  }

  const SPRITE_TEX_CACHE = new Map();

  function makeTextSprite(text, fg = '#181715', bg = 'rgba(250, 245, 232, 0.94)', border = '#181715', wScale = 0.54, hScale = 0.16) {
    if (typeof document === 'undefined') return null;
    const key = `cyc|${text}|${fg}|${bg}|${border}`;
    let tex = SPRITE_TEX_CACHE.get(key);
    if (!tex) {
      if (SPRITE_TEX_CACHE.size > 200) {
        const oldest = SPRITE_TEX_CACHE.keys().next().value;
        const oldTex = SPRITE_TEX_CACHE.get(oldest);
        if (oldTex) oldTex.dispose();
        SPRITE_TEX_CACHE.delete(oldest);
      }
      const canvas = document.createElement('canvas');
      canvas.width = 512;
      canvas.height = 76;
      const ctx = canvas.getContext('2d');
      ctx.font = 'bold 26px "JetBrains Mono", Consolas, monospace';
      const tw = ctx.measureText(text).width;
      const boxW = Math.min(504, Math.max(160, tw + 44));
      const boxX = (512 - boxW) * 0.5;
      if (bg) {
        ctx.fillStyle = bg;
        ctx.beginPath();
        ctx.roundRect(boxX, 4, boxW, 68, 12);
        ctx.fill();
      }
      if (border) {
        ctx.strokeStyle = border;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.roundRect(boxX, 4, boxW, 68, 12);
        ctx.stroke();
      }
      ctx.fillStyle = fg;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(text, 256, 39, 488);
      tex = new THREE.CanvasTexture(canvas);
      if (THREE.sRGBEncoding) tex.encoding = THREE.sRGBEncoding;
      tex.userData = { cached: true };
      SPRITE_TEX_CACHE.set(key, tex);
    }
    const spr = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false }));
    spr.scale.set(wScale, hScale, 1);
    spr.renderOrder = 25;
    return spr;
  }

  // Convert 2D shape vertices (CCW) into 3D XZ-plane geometry extruded upward along +Y
  function extrude2DPointsXZ(pts, height, holes = []) {
    const shape = new THREE.Shape();
    pts.forEach((p, i) => (i === 0 ? shape.moveTo(p.x, p.y) : shape.lineTo(p.x, p.y)));
    shape.closePath();

    holes.forEach((hPts) => {
      const path = new THREE.Path();
      hPts.forEach((p, i) => (i === 0 ? path.moveTo(p.x, p.y) : path.lineTo(p.x, p.y)));
      path.closePath();
      shape.holes.push(path);
    });

    const geo = new THREE.ExtrudeGeometry(shape, {
      depth: height,
      bevelEnabled: false,
      curveSegments: 24,
    });
    // rotateX(+PI/2) maps (X, Y_shape, Z_extr in [0, h]) -> (X, -Z_extr, +Y_shape)
    // Shift Y by +height so bottom sits at Y = 0 and top sits at Y = +height
    geo.rotateX(Math.PI * 0.5);
    geo.translate(0, height, 0);
    geo.computeVertexNormals();
    return geo;
  }

  function buildCirclePts(radius, steps = 64, reverse = false) {
    const pts = [];
    for (let i = 0; i < steps; i++) {
      const a = (reverse ? -1 : 1) * ((i / steps) * 2 * Math.PI);
      pts.push({ x: radius * Math.cos(a), y: radius * Math.sin(a) });
    }
    return pts;
  }

  function makeLineLoopXZ(pts, yPos, color, opacity = 1.0) {
    const vecs = pts.map((p) => new THREE.Vector3(p.x, yPos, p.y));
    if (pts.length > 1) vecs.push(new THREE.Vector3(pts[0].x, yPos, pts[0].y));
    return new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(vecs),
      new THREE.LineBasicMaterial({ color, transparent: opacity < 1, opacity })
    );
  }

  function buildCycloidGeometry(cfg, opts = {}, anchorOut = []) {
    const root = new THREE.Group();
    const isWire = opts.displayMode === 'wireframe';
    const isExploded = opts.displayMode === 'exploded';
    const isPlate2d = opts.displayMode === 'plate2d';
    const showLabels = opts.showLabels !== false;
    const showPitch = opts.showPitch !== false;
    const s = computeMechanismScale(cfg);

    // 1. Base 1967 Drafting Plate
    const plateGroup = new THREE.Group();
    const pThick = isPlate2d ? 0.02 : PLATE_THICK;
    const plateMesh = new THREE.Mesh(
      new THREE.BoxGeometry(PLATE_W, pThick, PLATE_D),
      new THREE.MeshStandardMaterial({
        color: PAPER_CARD,
        roughness: 0.92,
        metalness: 0.02,
        wireframe: isWire,
        transparent: isWire,
        opacity: isWire ? 0.25 : 1.0,
      })
    );
    plateMesh.position.y = PLATE_TOP_Y - pThick * 0.5 + (isExploded ? -0.26 : 0);
    plateMesh.userData.isPlate = true;
    addInkEdges(plateMesh, 20, INK_DARK, 0.72);
    plateGroup.add(plateMesh);

    // Technical grid + polar reference axes
    const yG = plateMesh.position.y + pThick * 0.5 + 0.002;
    const gridPts = [];
    for (let gx = -1.95; gx <= 1.96; gx += 0.39) {
      gridPts.push(new THREE.Vector3(gx, yG, -1.24), new THREE.Vector3(gx, yG, 1.24));
    }
    for (let gz = -1.16; gz <= 1.17; gz += 0.39) {
      gridPts.push(new THREE.Vector3(-2.02, yG, gz), new THREE.Vector3(2.02, yG, gz));
    }
    plateGroup.add(
      new THREE.LineSegments(
        new THREE.BufferGeometry().setFromPoints(gridPts),
        new THREE.LineBasicMaterial({ color: INK_DARK, transparent: true, opacity: 0.12 })
      )
    );
    const axisPts = [
      new THREE.Vector3(-2.05, yG + 0.001, 0),
      new THREE.Vector3(2.05, yG + 0.001, 0),
      new THREE.Vector3(0, yG + 0.001, -1.26),
      new THREE.Vector3(0, yG + 0.001, 1.26),
    ];
    plateGroup.add(
      new THREE.LineSegments(
        new THREE.BufferGeometry().setFromPoints(axisPts),
        new THREE.LineBasicMaterial({ color: SLATE_INK, transparent: true, opacity: 0.32 })
      )
    );
    root.add(plateGroup);

    // 2. Mechanism Group
    const mechGroup = new THREE.Group();
    const baseY = PLATE_TOP_Y + 0.015;
    const yLayer1 = baseY;
    const yLayer2 = baseY + (isExploded ? 0.38 : 0.03);
    const yLayer3 = baseY + (isExploded ? 0.72 : 0.05);
    const hSolid = isPlate2d ? 0.012 : 0.14;

    const animHandles = { mode: cfg.mode, scale: s, yRotor: yLayer2 };

    if (cfg.mode === 'wankel') {
      const e = cfg.wankelE || 20;
      const R = cfg.wankelR || 140;
      const a = cfg.wankelA || 6;

      const boreRaw = M.getWankelHousingPoints(e, R, a, 160).map((p) => ({ x: p.x * s, y: p.y * s }));
      const outerR = (R + e + a + 18) * s;
      const outerRaw = buildCirclePts(outerR, 96, false);
      const boreReversed = boreRaw.slice().reverse();

      // Machined Housing Block
      const housingMesh = new THREE.Mesh(
        extrude2DPointsXZ(outerRaw, hSolid * 1.15, [boreReversed]),
        new THREE.MeshStandardMaterial({
          color: PAPER_ALT,
          roughness: 0.85,
          metalness: 0.06,
          wireframe: isWire,
        })
      );
      housingMesh.position.y = yLayer1;
      addInkEdges(housingMesh, 28, INK_DARK, 0.88);
      mechGroup.add(housingMesh);

      // Vermilion inner trochoid bore ink line
      mechGroup.add(makeLineLoopXZ(boreRaw, yLayer1 + hSolid * 1.16, VERMILION, 0.95));

      // Spark plug ignition pin at (-outerR, 0)
      const plug = new THREE.Mesh(
        new THREE.CylinderGeometry(0.032, 0.032, hSolid * 0.9, 14),
        new THREE.MeshStandardMaterial({ color: VERMILION, roughness: 0.5, wireframe: isWire })
      );
      plug.position.set(-(R + e + a + 5) * s, yLayer1 + hSolid * 0.65, 0);
      addInkEdges(plug, 25, INK_DARK, 0.7);
      mechGroup.add(plug);

      // Triangular Rotor group (dynamic position + rotation)
      const rotorProto = M.getWankelRotor(e, R, 0);
      const localFlanks = rotorProto.flankPoints.map((p) => ({
        x: (p.x - rotorProto.center.x) * s,
        y: (p.y - rotorProto.center.y) * s,
      }));
      const centerHole = buildCirclePts(18 * s, 28, true);

      const rotorGroup = new THREE.Group();
      rotorGroup.position.y = yLayer2;

      const rotorMesh = new THREE.Mesh(
        extrude2DPointsXZ(localFlanks, hSolid * 0.92, [centerHole]),
        new THREE.MeshStandardMaterial({
          color: SLATE_INK,
          roughness: 0.55,
          metalness: 0.14,
          wireframe: isWire,
        })
      );
      addInkEdges(rotorMesh, 25, INK_DARK, 0.9);
      rotorGroup.add(rotorMesh);

      // 3 Vermilion apex seals
      rotorProto.apexes.forEach((ap) => {
        const seal = new THREE.Mesh(
          new THREE.CylinderGeometry(0.028, 0.028, hSolid * 1.08, 12),
          new THREE.MeshStandardMaterial({ color: VERMILION, roughness: 0.45, wireframe: isWire })
        );
        seal.position.set((ap.x - rotorProto.center.x) * s, hSolid * 0.52, (ap.y - rotorProto.center.y) * s);
        addInkEdges(seal, 24, INK_DARK, 0.8);
        rotorGroup.add(seal);
      });

      // Central stationary shaft post & crank arm
      const mainShaft = new THREE.Mesh(
        new THREE.CylinderGeometry(0.042, 0.042, hSolid * 1.5, 16),
        new THREE.MeshStandardMaterial({ color: INK_CHARCOAL, roughness: 0.45, wireframe: isWire })
      );
      mainShaft.position.y = yLayer1 + hSolid * 0.75;
      addInkEdges(mainShaft, 25, INK_DARK, 0.7);
      mechGroup.add(mainShaft);

      const crankArm = new THREE.Mesh(
        new THREE.BoxGeometry(e * s, 0.028, 0.042),
        new THREE.MeshStandardMaterial({ color: AMBER_WARM, roughness: 0.45, wireframe: isWire })
      );
      crankArm.geometry.translate(e * s * 0.5, 0, 0);
      crankArm.position.y = yLayer3 + hSolid * 0.6;
      addInkEdges(crankArm, 24, INK_DARK, 0.85);
      mechGroup.add(crankArm);
      mechGroup.add(rotorGroup);

      animHandles.rotorGroup = rotorGroup;
      animHandles.crankArm = crankArm;
      animHandles.wankelE = e;
    } else if (cfg.mode === 'cycloid_drive') {
      const N = Math.max(4, Math.min(24, Math.round(cfg.cycloN || 10)));
      const Rp = cfg.cycloRpinCircle || 150;
      const rp = cfg.cycloRpin || 10;
      const e = cfg.cycloE || 6;
      const pins = N + 1;

      // Outer housing ring plate around pins
      const outerH = buildCirclePts((Rp + rp + 12) * s, 96, false);
      const innerH = buildCirclePts((Rp - 2) * s, 96, true);
      const statorRing = new THREE.Mesh(
        extrude2DPointsXZ(outerH, hSolid * 0.8, [innerH]),
        new THREE.MeshStandardMaterial({ color: PAPER_ALT, roughness: 0.85, wireframe: isWire })
      );
      statorRing.position.y = yLayer1;
      addInkEdges(statorRing, 28, INK_DARK, 0.75);
      mechGroup.add(statorRing);

      // Pitch circle dashed guide
      if (showPitch) {
        mechGroup.add(makeLineLoopXZ(buildCirclePts(Rp * s, 96), yLayer1 + hSolid * 0.84, SLATE_INK, 0.65));
      }

      // N+1 Stationary Steel/Vermilion Roller Pins
      const pinGeo = new THREE.CylinderGeometry(rp * s, rp * s, hSolid * 1.12, 16);
      const pinMat = new THREE.MeshStandardMaterial({
        color: AMBER_WARM,
        roughness: 0.42,
        metalness: 0.2,
        wireframe: isWire,
      });
      for (let i = 0; i < pins; i++) {
        const ang = (i / pins) * 2 * Math.PI;
        const pMesh = new THREE.Mesh(pinGeo, pinMat);
        pMesh.position.set(Rp * s * Math.cos(ang), yLayer1 + hSolid * 0.56, Rp * s * Math.sin(ang));
        addInkEdges(pMesh, 28, INK_DARK, 0.75);
        mechGroup.add(pMesh);
      }

      // Cycloidal Disc with 6 torque bores + central eccentric bore
      const discPts = M.getCycloidDiscProfile(N, Rp, rp, e, 360).map((p) => ({ x: p.x * s, y: p.y * s }));
      const holes = [buildCirclePts(22 * s, 28, true)];
      const holeRing = Rp * 0.43 * s;
      const holeR = Rp * 0.095 * s;
      for (let h = 0; h < 6; h++) {
        const ha = (h / 6) * 2 * Math.PI;
        const hx = holeRing * Math.cos(ha);
        const hy = holeRing * Math.sin(ha);
        const cPts = buildCirclePts(holeR, 20, true).map((p) => ({ x: p.x + hx, y: p.y + hy }));
        holes.push(cPts);
      }

      const discGroup = new THREE.Group();
      discGroup.position.y = yLayer2;

      const discMesh = new THREE.Mesh(
        extrude2DPointsXZ(discPts, hSolid * 0.85, holes),
        new THREE.MeshStandardMaterial({
          color: SLATE_INK,
          roughness: 0.58,
          metalness: 0.14,
          wireframe: isWire,
        })
      );
      addInkEdges(discMesh, 26, INK_DARK, 0.92);
      discGroup.add(discMesh);
      discGroup.add(makeLineLoopXZ(discPts, hSolid * 0.87, VERMILION, 0.92));

      const shaft = new THREE.Mesh(
        new THREE.CylinderGeometry(0.042, 0.042, hSolid * 1.5, 16),
        new THREE.MeshStandardMaterial({ color: INK_CHARCOAL, roughness: 0.4, wireframe: isWire })
      );
      shaft.position.y = yLayer1 + hSolid * 0.75;
      mechGroup.add(shaft);
      mechGroup.add(discGroup);

      animHandles.discGroup = discGroup;
      animHandles.cycloN = N;
      animHandles.cycloE = e;
    } else {
      // TROCHOID MODE ('hypo' | 'epi')
      const R = cfg.R || 120;
      const r = cfg.r || 40;
      const d = cfg.d || 40;
      const isHypo = cfg.curveType === 'hypo';

      // Base Fixed Pitch Ring
      const basePts = buildCirclePts(R * s, 96, false);
      const baseRing = new THREE.Mesh(
        new THREE.TorusGeometry(R * s, 0.022, 12, 96),
        new THREE.MeshStandardMaterial({
          color: INK_CHARCOAL,
          roughness: 0.6,
          wireframe: isWire,
        })
      );
      baseRing.rotation.x = Math.PI * 0.5;
      baseRing.position.y = yLayer1 + 0.025;
      mechGroup.add(baseRing);

      if (showPitch) {
        mechGroup.add(makeLineLoopXZ(basePts, yLayer1 + 0.005, SLATE_INK, 0.45));
      }

      // Full Closed Mathematical Ghost Curve on Drafting Plate
      const ghostPts = M.generateCurve(isHypo ? 'hypo' : 'epi', R, r, d, 900).map((p) => ({ x: p.x * s, y: p.y * s }));
      mechGroup.add(makeLineLoopXZ(ghostPts, yLayer1 + 0.014, SLATE_INK, 0.42));

      // Live Vermilion Locus Trail Line (pre-allocated Float32Array updated dynamically)
      const maxPts = 1400;
      const trailPositions = new Float32Array(maxPts * 3);
      const trailGeo = new THREE.BufferGeometry();
      trailGeo.setAttribute('position', new THREE.BufferAttribute(trailPositions, 3));
      trailGeo.setDrawRange(0, 0);
      const trailLine = new THREE.Line(
        trailGeo,
        new THREE.LineBasicMaterial({ color: VERMILION })
      );
      trailLine.frustumCulled = false;
      mechGroup.add(trailLine);

      // Moving Rolling Planet Disc
      const planetGroup = new THREE.Group();
      planetGroup.position.y = yLayer2;

      const planetMesh = new THREE.Mesh(
        new THREE.CylinderGeometry(r * s, r * s, hSolid * 0.42, 48),
        new THREE.MeshStandardMaterial({
          color: PAPER_PLATE,
          roughness: 0.78,
          transparent: true,
          opacity: isWire ? 0.25 : 0.85,
          wireframe: isWire,
        })
      );
      planetMesh.position.y = hSolid * 0.22;
      addInkEdges(planetMesh, 24, SLATE_INK, 0.9);
      planetGroup.add(planetMesh);

      const planetRim = new THREE.Mesh(
        new THREE.TorusGeometry(r * s, 0.018, 10, 56),
        new THREE.MeshStandardMaterial({ color: SLATE_INK, roughness: 0.5, wireframe: isWire })
      );
      planetRim.rotation.x = Math.PI * 0.5;
      planetRim.position.y = hSolid * 0.44;
      planetGroup.add(planetRim);

      // Carrier Arm (center to planet center) + Tracing Arm (planet center to pen d)
      const armLen = isHypo ? Math.max(0.01, Math.abs(R - r) * s) : (R + r) * s;
      const carrierArm = new THREE.Mesh(
        new THREE.BoxGeometry(armLen, 0.022, 0.032),
        new THREE.MeshStandardMaterial({ color: INK_CHARCOAL, roughness: 0.55, wireframe: isWire })
      );
      carrierArm.geometry.translate(armLen * 0.5, 0, 0);
      carrierArm.position.y = yLayer3;
      addInkEdges(carrierArm, 24, INK_DARK, 0.7);
      mechGroup.add(carrierArm);

      const traceLen = Math.max(0.02, d * s);
      const traceArm = new THREE.Mesh(
        new THREE.BoxGeometry(traceLen, 0.020, 0.026),
        new THREE.MeshStandardMaterial({ color: AMBER_WARM, roughness: 0.45, wireframe: isWire })
      );
      traceArm.geometry.translate(traceLen * 0.5, 0, 0);
      traceArm.position.y = hSolid * 0.5;
      addInkEdges(traceArm, 24, INK_DARK, 0.7);
      planetGroup.add(traceArm);

      // Stylus Pen Cone at trace tip
      const stylus = new THREE.Mesh(
        new THREE.CylinderGeometry(0.024, 0.008, hSolid * 0.9, 14),
        new THREE.MeshStandardMaterial({ color: VERMILION, roughness: 0.4, wireframe: isWire })
      );
      stylus.position.set(traceLen, hSolid * 0.45, 0);
      planetGroup.add(stylus);

      mechGroup.add(planetGroup);

      animHandles.planetGroup = planetGroup;
      animHandles.carrierArm = carrierArm;
      animHandles.traceArm = traceArm;
      animHandles.trailGeo = trailGeo;
      animHandles.trailPositions = trailPositions;
      animHandles.maxPts = maxPts;
      animHandles.trailY = yLayer1 + 0.018;
      animHandles.R = R;
      animHandles.r = r;
      animHandles.d = d;
      animHandles.isHypo = isHypo;
    }

    root.add(mechGroup);

    // 3. Dimensional / Parameter Sprites
    if (showLabels && !opts.compact) {
      let badgeText = '';
      if (cfg.mode === 'wankel') {
        badgeText = `R=${cfg.wankelR} e=${cfg.wankelE} a=${cfg.wankelA}`;
      } else if (cfg.mode === 'cycloid_drive') {
        badgeText = `N=${cfg.cycloN} (${cfg.cycloN + 1} PINS) 1:${cfg.cycloN}`;
      } else {
        const info = M.getHarmonicInfo(cfg.R, cfg.r);
        badgeText = `${cfg.curveType === 'hypo' ? 'HYPO' : 'EPI'} R=${cfg.R} r=${cfg.r} d=${cfg.d} (${info.cusps}:${info.turns})`;
      }
      const lbl = makeTextSprite(badgeText, '#181715', 'rgba(250, 245, 232, 0.95)', '#181715', 2.40, 0.24);
      if (lbl) {
        lbl.position.set(0, baseY + 0.25, -1.26);
        root.add(lbl);
      }
    }

    // 4. Call-Out Anchors
    if (Array.isArray(opts.callouts)) {
      opts.callouts.forEach((c) => {
        const aObj = new THREE.Object3D();
        aObj.position.set(c.anchor[0], c.anchor[1] + (isExploded ? 0.22 : 0), c.anchor[2]);
        root.add(aObj);
        anchorOut.push({ id: c.id, obj: aObj });
      });
    }

    // Apply initial pose
    const built = { root, plateGroup, mechGroup, animHandles };
    applyMechanismMotion(built, cfg.theta ?? 0.65);
    return built;
  }

  function applyMechanismMotion(built, theta, externalTrail = null) {
    if (!built || !built.animHandles) return;
    const h = built.animHandles;
    const s = h.scale;

    if (h.mode === 'wankel' && h.rotorGroup) {
      const cx = h.wankelE * Math.cos(theta) * s;
      const cz = h.wankelE * Math.sin(theta) * s;
      h.rotorGroup.position.x = cx;
      h.rotorGroup.position.z = cz;
      // Exact 2D rotation +theta/3 mapped to right-handed +Y axis => -theta/3
      h.rotorGroup.rotation.y = -theta / 3;
      if (h.crankArm) h.crankArm.rotation.y = -theta;
      return;
    }

    if (h.mode === 'cycloid_drive' && h.discGroup) {
      const cx = h.cycloE * Math.cos(theta) * s;
      const cz = h.cycloE * Math.sin(theta) * s;
      h.discGroup.position.x = cx;
      h.discGroup.position.z = cz;
      // Disc rotates backwards at -theta/N => +theta/N around +Y
      h.discGroup.rotation.y = theta / h.cycloN;
      return;
    }

    if (h.mode === 'trochoid' && h.planetGroup) {
      const { R, r, isHypo } = h;
      const rollR = (isHypo ? R - r : R + r) * s;
      const rx = rollR * Math.cos(theta);
      const rz = rollR * Math.sin(theta);

      h.planetGroup.position.x = rx;
      h.planetGroup.position.z = rz;
      if (h.carrierArm) {
        // Arm points toward angle theta in (X, +Z) => rotation.y = -theta
        h.carrierArm.rotation.y = rollR >= 0 ? -theta : -theta + Math.PI;
      }

      if (h.traceArm) {
        // Match exact epitrochoid / hypotrochoid tracing vector!
        // Epi: center + (-d cos(k*theta), -d sin(k*theta)) => angle k*theta + PI
        // Hypo: center + (+d cos(k*theta), -d sin(k*theta)) => angle -k*theta
        const k = (isHypo ? R - r : R + r) / r;
        const armAng = isHypo ? -k * theta : k * theta + Math.PI;
        h.planetGroup.rotation.y = -armAng;
      }

      if (h.trailGeo && h.trailPositions) {
        let pts = externalTrail;
        if (!pts) {
          pts = M.generateCurve(isHypo ? 'hypo' : 'epi', R, r, h.d, 640);
        }
        const count = Math.min(pts.length, h.maxPts);
        const startIdx = Math.max(0, pts.length - count);
        for (let i = 0; i < count; i++) {
          const p = pts[startIdx + i];
          h.trailPositions[i * 3] = p.x * s;
          h.trailPositions[i * 3 + 1] = h.trailY;
          h.trailPositions[i * 3 + 2] = p.y * s;
        }
        h.trailGeo.attributes.position.needsUpdate = true;
        h.trailGeo.setDrawRange(0, count);
      }
    }
  }

  // --------------------------------------------------------------------------
  // Interactive Scene Manager
  // --------------------------------------------------------------------------
  class CycloidSceneManager {
    constructor(container, onCalloutsProjected, onOverviewPlateClick) {
      this.container = container;
      this.onCalloutsProjected = onCalloutsProjected;
      this.onOverviewPlateClick = onOverviewPlateClick;

      this.scene = new THREE.Scene();
      this.scene.background = new THREE.Color(PAPER_BG);

      const w = container.clientWidth || 800;
      const h = container.clientHeight || 520;
      this.camera = new THREE.PerspectiveCamera(42, w / h, 0.1, 100);
      this.camera.position.set(0.0, 3.05, 3.45);

      this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      this.renderer.setSize(w, h);
      if (THREE.sRGBEncoding) this.renderer.outputEncoding = THREE.sRGBEncoding;
      container.appendChild(this.renderer.domElement);

      this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
      this.controls.enableDamping = true;
      this.controls.dampingFactor = 0.08;
      this.controls.minDistance = 1.6;
      this.controls.maxDistance = 18;
      this.controls.maxPolarAngle = Math.PI * 0.48;

      this.scene.add(new THREE.AmbientLight(0xfffaf0, 0.88));
      const keyLight = new THREE.DirectionalLight(0xfff6e5, 0.58);
      keyLight.position.set(3, 7, 5);
      this.scene.add(keyLight);
      const fillLight = new THREE.DirectionalLight(0xf6efe0, 0.28);
      fillLight.position.set(-4, 4, -3);
      this.scene.add(fillLight);

      this.stageGroup = new THREE.Group();
      this.scene.add(this.stageGroup);

      this.displayMode = 'solid3d';
      this.showCallouts = true;
      this.showLabels = true;
      this.showPitch = true;

      this.mode = 'single'; // 'overview' | 'single' | 'live'
      this.built = null;
      this.overviewBuilds = [];
      this.calloutAnchors = [];
      this.overviewHitTargets = [];
      this.flyState = null;
      this.raycaster = new THREE.Raycaster();

      let downPos = null;
      this.renderer.domElement.addEventListener('pointerdown', (e) => {
        downPos = { x: e.clientX, y: e.clientY };
      });
      this.renderer.domElement.addEventListener('pointerup', (e) => {
        if (!downPos || this.mode !== 'overview') return;
        const dist = Math.hypot(e.clientX - downPos.x, e.clientY - downPos.y);
        if (dist > 6) return;
        const rect = this.renderer.domElement.getBoundingClientRect();
        const ndc = new THREE.Vector2(
          ((e.clientX - rect.left) / rect.width) * 2 - 1,
          -((e.clientY - rect.top) / rect.height) * 2 + 1
        );
        this.raycaster.setFromCamera(ndc, this.camera);
        const hits = this.raycaster.intersectObjects(this.overviewHitTargets, true);
        if (hits.length > 0) {
          let obj = hits[0].object;
          while (obj && !obj.userData.figId) obj = obj.parent;
          if (obj && obj.userData.figId && this.onOverviewPlateClick) {
            this.onOverviewPlateClick(obj.userData.figId);
          }
        }
      });

      this.resizeObserver = new ResizeObserver(() => this.resize());
      this.resizeObserver.observe(container);
    }

    resize() {
      const w = Math.max(200, this.container.clientWidth);
      const h = Math.max(160, this.container.clientHeight);
      this.camera.aspect = w / h;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(w, h);
    }

    flyTo(pos, target, durationMs = 600) {
      this.flyState = {
        fromPos: this.camera.position.clone(),
        toPos: new THREE.Vector3(pos[0], pos[1], pos[2]),
        fromTarget: this.controls.target.clone(),
        toTarget: new THREE.Vector3(target[0], target[1], target[2]),
        start: performance.now(),
        duration: durationMs,
      };
    }

    showOverview(figuresObj, overviewIds) {
      this.mode = 'overview';
      this.built = null;
      this.overviewBuilds = [];
      this.calloutAnchors = [];
      this.overviewHitTargets = [];
      clearGroup(this.stageGroup);

      const floor = new THREE.Mesh(
        new THREE.BoxGeometry(10.8, 0.06, 5.2),
        new THREE.MeshStandardMaterial({ color: PAPER_ALT, roughness: 0.95 })
      );
      floor.position.set(0, PLATE_TOP_Y - 0.14, 0);
      addInkEdges(floor, 20, INK_DARK, 0.35);
      this.stageGroup.add(floor);

      const cols = 3;
      const spacingX = 3.40;
      const spacingZ = 2.25;
      const scale = 0.66;

      overviewIds.forEach((fid, idx) => {
        const fig = figuresObj[fid];
        if (!fig) return;
        const col = idx % cols;
        const row = Math.floor(idx / cols);
        const ox = (col - 1) * spacingX;
        const oz = (row - 0.5) * spacingZ;

        const built = buildCycloidGeometry(fig.config, {
          displayMode: this.displayMode,
          showLabels: false,
          showPitch: this.showPitch,
          compact: true,
        });
        built.root.scale.setScalar(scale);
        built.root.position.set(ox, 0, oz);
        built.root.userData.figId = fid;
        built.plateGroup.traverse((c) => {
          c.userData.figId = fid;
        });
        this.stageGroup.add(built.root);
        this.overviewBuilds.push({ fid, fig, built });
        this.overviewHitTargets.push(built.root);

        const anchor = new THREE.Object3D();
        anchor.position.set(ox, 0.34, oz);
        this.stageGroup.add(anchor);
        this.calloutAnchors.push({ id: fid, obj: anchor });
      });
    }

    showSingleFigure(fig, showCallouts = this.showCallouts) {
      this.mode = 'single';
      this.showCallouts = showCallouts;
      this.overviewBuilds = [];
      this.calloutAnchors = [];
      this.overviewHitTargets = [];
      clearGroup(this.stageGroup);

      this.built = buildCycloidGeometry(
        fig.config,
        {
          displayMode: this.displayMode,
          showLabels: this.showLabels,
          showPitch: this.showPitch,
          callouts: this.showCallouts ? fig.callouts : [],
        },
        this.calloutAnchors
      );
      this.stageGroup.add(this.built.root);
    }

    rebuildLiveMechanism(cfg) {
      this.mode = 'live';
      this.overviewBuilds = [];
      this.calloutAnchors = [];
      this.overviewHitTargets = [];
      clearGroup(this.stageGroup);

      this.built = buildCycloidGeometry(cfg, {
        displayMode: this.displayMode,
        showLabels: this.showLabels,
        showPitch: this.showPitch,
      });
      this.stageGroup.add(this.built.root);
    }

    updateLiveMotion(theta, trailPoints) {
      if (this.mode === 'live' && this.built) {
        applyMechanismMotion(this.built, theta, trailPoints);
      }
    }

    projectCallouts() {
      if (!this.onCalloutsProjected) return;
      if (this.calloutAnchors.length === 0) {
        this.onCalloutsProjected([]);
        return;
      }
      const w = this.container.clientWidth;
      const h = this.container.clientHeight;
      const items = this.calloutAnchors.map((a) => {
        const v = new THREE.Vector3();
        a.obj.getWorldPosition(v);
        v.project(this.camera);
        return {
          id: a.id,
          x: (v.x * 0.5 + 0.5) * w,
          y: (-v.y * 0.5 + 0.5) * h,
          visible: v.z >= -1 && v.z <= 1,
        };
      });
      this.onCalloutsProjected(items);
    }

    stepAndRender(idleTheta) {
      if (this.flyState) {
        const now = performance.now();
        const t = Math.min(1, (now - this.flyState.start) / this.flyState.duration);
        const ease = 1 - Math.pow(1 - t, 3);
        this.camera.position.lerpVectors(this.flyState.fromPos, this.flyState.toPos, ease);
        this.controls.target.lerpVectors(this.flyState.fromTarget, this.flyState.toTarget, ease);
        if (t >= 1) this.flyState = null;
      }

      if (this.mode === 'single' && this.built && idleTheta !== undefined) {
        const animT = idleTheta;
        applyMechanismMotion(this.built, animT);
      } else if (this.mode === 'overview' && this.overviewBuilds.length && idleTheta !== undefined) {
        this.overviewBuilds.forEach((b) => {
          if (b.fig.config.mode !== 'trochoid') {
            applyMechanismMotion(b.built, idleTheta * 0.85);
          }
        });
      }

      this.controls.update();
      this.renderer.render(this.scene, this.camera);
      this.projectCallouts();
    }
  }

  global.CYCLOID_SCENE3D = {
    PLATE_W,
    PLATE_D,
    PLATE_TOP_Y,
    computeMechanismScale,
    buildCycloidGeometry,
    applyMechanismMotion,
    CycloidSceneManager,
  };
})(window);
