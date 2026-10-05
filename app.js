/**
 * Cycloid & Planetary Kinematics Laboratory — Main Application
 * High-DPI Canvas 2D, Interactive Pan/Zoom, CAD Export & Physical Animation
 */

(function () {
  'use strict';

  // Canvas & Context
  let canvas, ctx;
  let width, height;
  let dpr = window.devicePixelRatio || 1;

  // Viewport Transform (Pan & Zoom)
  let panX = 0, panY = 0;
  let scale = 1.0;
  let isPanning = false;
  let startPanX = 0, startPanY = 0;

  // Simulation State
  let mode = 'wankel'; // 'wankel', 'cycloid_drive', 'trochoid'
  let isRunning = true;
  let theta = 0;
  let speed = 1.0;
  let audio;
  let lang = 'de';
  let theme = 'slate'; // 'slate', 'blueprint'

  // Parameters
  // Trochoid mode
  let R = 120, r = 40, d = 50;
  let curveType = 'hypo'; // 'epi' or 'hypo'
  let trailPoints = [];
  let maxTrail = 1800;

  // Wankel mode
  let wankelR = 140; // Generating radius
  let wankelE = 20;  // Eccentricity
  let wankelA = 6;   // Apex offset

  // Cycloid Drive mode
  let cycloN = 10;   // Number of lobes (pins = N + 1 = 11)
  let cycloRpinCircle = 150;
  let cycloRpin = 10;
  let cycloE = 6;

  // Presets
  const presets = {
    wankel: { mode: 'wankel', wankelR: 140, wankelE: 20, wankelA: 6, speed: 0.8 },
    cycloid_10: { mode: 'cycloid_drive', cycloN: 10, cycloRpinCircle: 150, cycloRpin: 10, cycloE: 6, speed: 0.6 },
    cycloid_15: { mode: 'cycloid_drive', cycloN: 15, cycloRpinCircle: 160, cycloRpin: 8, cycloE: 4.5, speed: 0.5 },
    astroid: { mode: 'trochoid', curveType: 'hypo', R: 120, r: 30, d: 30, speed: 1.0 },
    cardioid: { mode: 'trochoid', curveType: 'epi', R: 60, r: 60, d: 60, speed: 1.0 },
    nephroid: { mode: 'trochoid', curveType: 'epi', R: 80, r: 40, d: 40, speed: 1.0 },
    deltoid: { mode: 'trochoid', curveType: 'hypo', R: 120, r: 40, d: 40, speed: 1.0 },
    spirograph_art: { mode: 'trochoid', curveType: 'hypo', R: 140, r: 52, d: 85, speed: 1.4 }
  };

  const themes = {
    slate: {
      bg: '#080c14',
      grid: 'rgba(255, 255, 255, 0.04)',
      axis: 'rgba(56, 189, 248, 0.2)',
      primary: '#38bdf8',
      secondary: '#2dd4bf',
      accent: '#f59e0b',
      rotor: 'rgba(56, 189, 248, 0.15)',
      housing: '#38bdf8',
      gearFixed: '#334155',
      gearMoving: '#38bdf8',
      pin: '#f59e0b',
      text: '#f1f5f9',
      textMuted: '#64748b'
    },
    blueprint: {
      bg: '#0c2340',
      grid: 'rgba(255, 255, 255, 0.08)',
      axis: 'rgba(255, 255, 255, 0.25)',
      primary: '#ffffff',
      secondary: '#93c5fd',
      accent: '#facc15',
      rotor: 'rgba(255, 255, 255, 0.12)',
      housing: '#ffffff',
      gearFixed: '#1e3a8a',
      gearMoving: '#60a5fa',
      pin: '#fbbf24',
      text: '#ffffff',
      textMuted: '#93c5fd'
    }
  };

  function init() {
    canvas = document.getElementById('kinematics-canvas');
    ctx = canvas.getContext('2d');
    audio = new KinematicsAudio();

    window.addEventListener('resize', handleResize);
    handleResize();

    setupInteractions();
    setupControls();
    loadPreset('wankel');

    requestAnimationFrame(animationLoop);
  }

  function handleResize() {
    const container = canvas.parentElement;
    width = container.clientWidth;
    height = Math.max(480, Math.min(680, window.innerHeight * 0.65));

    dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';

    ctx.scale(dpr, dpr);
    panX = width / 2;
    panY = height / 2;
  }

  function setupInteractions() {
    canvas.addEventListener('pointerdown', (e) => {
      isPanning = true;
      startPanX = e.clientX - panX;
      startPanY = e.clientY - panY;
      canvas.setPointerCapture(e.pointerId);
    });

    canvas.addEventListener('pointermove', (e) => {
      if (isPanning) {
        panX = e.clientX - startPanX;
        panY = e.clientY - startPanY;
      }
    });

    const stopPan = (e) => {
      if (isPanning) {
        isPanning = false;
        try { canvas.releasePointerCapture(e.pointerId); } catch (_) {}
      }
    };
    canvas.addEventListener('pointerup', stopPan);
    canvas.addEventListener('pointercancel', stopPan);

    canvas.addEventListener('wheel', (e) => {
      e.preventDefault();
      const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
      const mouseX = e.clientX - canvas.getBoundingClientRect().left;
      const mouseY = e.clientY - canvas.getBoundingClientRect().top;

      panX = mouseX - (mouseX - panX) * zoomFactor;
      panY = mouseY - (mouseY - panY) * zoomFactor;
      scale *= zoomFactor;
      scale = Math.max(0.3, Math.min(4.0, scale));
    }, { passive: false });
  }

  function setupControls() {
    document.getElementById('preset-select').addEventListener('change', (e) => {
      loadPreset(e.target.value);
    });

    document.getElementById('btn-play-pause').addEventListener('click', (e) => {
      isRunning = !isRunning;
      e.currentTarget.textContent = isRunning ? '⏸ Pause' : '▶ Weiter';
    });

    document.getElementById('btn-reset').addEventListener('click', () => {
      theta = 0;
      trailPoints = [];
    });

    document.getElementById('btn-recenter').addEventListener('click', () => {
      panX = width / 2;
      panY = height / 2;
      scale = 1.0;
    });

    document.getElementById('speed-slider').addEventListener('input', (e) => {
      speed = parseFloat(e.target.value);
      document.getElementById('speed-val').textContent = speed.toFixed(1) + 'x';
    });

    // CAD Export Buttons
    document.getElementById('btn-export-dxf').addEventListener('click', handleExportDXF);
    document.getElementById('btn-export-svg').addEventListener('click', handleExportSVG);

    // Audio & Theme
    document.getElementById('btn-sound-toggle').addEventListener('click', (e) => {
      const active = audio.toggle();
      e.currentTarget.classList.toggle('active', active);
    });

    document.getElementById('theme-select').addEventListener('change', (e) => {
      theme = e.target.value;
      document.body.className = `theme-${theme}`;
    });

    // Dynamic sliders
    setupDynamicSliders();
  }

  function setupDynamicSliders() {
    const rBigSlider = document.getElementById('slider-R');
    const rSmallSlider = document.getElementById('slider-r');
    const dSlider = document.getElementById('slider-d');

    if (rBigSlider) {
      rBigSlider.addEventListener('input', (e) => {
        R = parseFloat(e.target.value);
        document.getElementById('val-R').textContent = R;
        trailPoints = [];
      });
    }
    if (rSmallSlider) {
      rSmallSlider.addEventListener('input', (e) => {
        r = parseFloat(e.target.value);
        document.getElementById('val-r').textContent = r;
        trailPoints = [];
      });
    }
    if (dSlider) {
      dSlider.addEventListener('input', (e) => {
        d = parseFloat(e.target.value);
        document.getElementById('val-d').textContent = d;
        trailPoints = [];
      });
    }
  }

  function loadPreset(name) {
    const p = presets[name];
    if (!p) return;

    mode = p.mode;
    speed = p.speed || 1.0;
    document.getElementById('speed-slider').value = speed;
    document.getElementById('speed-val').textContent = speed.toFixed(1) + 'x';

    if (p.wankelR) {
      wankelR = p.wankelR;
      wankelE = p.wankelE;
      wankelA = p.wankelA;
    }
    if (p.cycloN) {
      cycloN = p.cycloN;
      cycloRpinCircle = p.cycloRpinCircle;
      cycloRpin = p.cycloRpin;
      cycloE = p.cycloE;
    }
    if (p.R) {
      R = p.R;
      r = p.r;
      d = p.d;
      curveType = p.curveType || 'hypo';
      if (document.getElementById('slider-R')) document.getElementById('slider-R').value = R;
      if (document.getElementById('slider-r')) document.getElementById('slider-r').value = r;
      if (document.getElementById('slider-d')) document.getElementById('slider-d').value = d;
      if (document.getElementById('val-R')) document.getElementById('val-R').textContent = R;
      if (document.getElementById('val-r')) document.getElementById('val-r').textContent = r;
      if (document.getElementById('val-d')) document.getElementById('val-d').textContent = d;
    }

    trailPoints = [];
    theta = 0;
    updateTelemetry();

    // Toggle slider visibility depending on mode
    document.querySelectorAll('.mode-params').forEach(el => el.classList.add('hidden'));
    const activeParams = document.getElementById(`params-${mode}`);
    if (activeParams) activeParams.classList.remove('hidden');
  }

  function animationLoop() {
    if (isRunning) {
      theta += 0.025 * speed;
      if (theta > 1000 * Math.PI) theta = 0;
    }

    draw();
    updateTelemetry();
    requestAnimationFrame(animationLoop);
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);
    const pal = themes[theme];

    // Background Grid
    drawGrid(pal);

    ctx.save();
    ctx.translate(panX, panY);
    ctx.scale(scale, scale);

    switch (mode) {
      case 'wankel':
        drawWankel(pal);
        break;
      case 'cycloid_drive':
        drawCycloidDrive(pal);
        break;
      case 'trochoid':
      default:
        drawTrochoid(pal);
        break;
    }

    ctx.restore();
  }

  function drawGrid(pal) {
    ctx.save();
    ctx.fillStyle = pal.bg;
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = pal.grid;
    ctx.lineWidth = 1;

    const gridSize = 40 * scale;
    const startX = panX % gridSize;
    const startY = panY % gridSize;

    ctx.beginPath();
    for (let x = startX; x < width; x += gridSize) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
    }
    for (let y = startY; y < height; y += gridSize) {
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
    }
    ctx.stroke();

    // Axes
    ctx.strokeStyle = pal.axis;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, panY);
    ctx.lineTo(width, panY);
    ctx.moveTo(panX, 0);
    ctx.lineTo(panX, height);
    ctx.stroke();
    ctx.restore();
  }

  // 1. WANKEL ROTARY ENGINE
  function drawWankel(pal) {
    // 1. Trochoid Housing
    const housing = CycloidMath.getWankelHousingPoints(wankelE, wankelR, wankelA, 360);
    ctx.strokeStyle = pal.housing;
    ctx.lineWidth = 3;
    ctx.beginPath();
    housing.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y));
    ctx.closePath();
    ctx.stroke();

    // Housing outer decorative ring
    ctx.strokeStyle = pal.gearFixed;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(0, 0, wankelR + wankelE + 24, 0, 2 * Math.PI);
    ctx.stroke();

    // Spark plug position at left
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(-wankelR - wankelE - 2, 0, 4, 0, 2 * Math.PI);
    ctx.fill();

    // 2. Triangular Rotor
    const rotor = CycloidMath.getWankelRotor(wankelE, wankelR, theta);
    
    // Rotor Body fill
    ctx.fillStyle = pal.rotor;
    ctx.beginPath();
    rotor.flankPoints.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y));
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = pal.secondary;
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // 3. Apex Seals (Corners)
    rotor.apexes.forEach((apex, idx) => {
      ctx.fillStyle = pal.accent;
      ctx.beginPath();
      ctx.arc(apex.x, apex.y, 4, 0, 2 * Math.PI);
      ctx.fill();
    });

    // 4. Central Eccentric Shaft & Bearing
    ctx.strokeStyle = pal.accent;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(rotor.center.x, rotor.center.y);
    ctx.stroke();

    ctx.fillStyle = pal.accent;
    ctx.beginPath();
    ctx.arc(0, 0, 6, 0, 2 * Math.PI);
    ctx.fill();

    ctx.fillStyle = pal.secondary;
    ctx.beginPath();
    ctx.arc(rotor.center.x, rotor.center.y, 8, 0, 2 * Math.PI);
    ctx.fill();
  }

  // 2. CYCLOIDAL SPEED REDUCER (Robotics Drive)
  function drawCycloidDrive(pal) {
    const pins = cycloN + 1;
    // 1. Outer Ring with Roller Pins
    ctx.strokeStyle = pal.gearFixed;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(0, 0, cycloRpinCircle, 0, 2 * Math.PI);
    ctx.stroke();

    for (let i = 0; i < pins; i++) {
      const ang = (i / pins) * 2 * Math.PI;
      const px = cycloRpinCircle * Math.cos(ang);
      const py = cycloRpinCircle * Math.sin(ang);

      ctx.fillStyle = pal.pin;
      ctx.beginPath();
      ctx.arc(px, py, cycloRpin, 0, 2 * Math.PI);
      ctx.fill();

      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // 2. Wobbling Cycloid Disc
    // Eccentric shaft turns at theta, disc rotates backward at theta / N
    const discCenter = {
      x: cycloE * Math.cos(theta),
      y: cycloE * Math.sin(theta)
    };
    const discAngle = -theta / cycloN;

    const baseProfile = CycloidMath.getCycloidDiscProfile(cycloN, cycloRpinCircle, cycloRpin, cycloE, 720);

    ctx.save();
    ctx.translate(discCenter.x, discCenter.y);
    ctx.rotate(discAngle);

    ctx.fillStyle = 'rgba(56, 189, 248, 0.18)';
    ctx.strokeStyle = pal.primary;
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    baseProfile.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y));
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Internal torque transmission drive holes
    const holeRadius = 14;
    const holeCircle = 65;
    const holeCount = 6;
    for (let h = 0; h < holeCount; h++) {
      const hAng = (h / holeCount) * 2 * Math.PI;
      const hx = holeCircle * Math.cos(hAng);
      const hy = holeCircle * Math.sin(hAng);

      ctx.fillStyle = pal.bg;
      ctx.beginPath();
      ctx.arc(hx, hy, holeRadius, 0, 2 * Math.PI);
      ctx.fill();
      ctx.strokeStyle = pal.primary;
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    ctx.restore();
  }

  // 3. CLASSICAL TROCHOID & SPIROGRAPH
  function drawTrochoid(pal) {
    // Fixed Base Circle
    ctx.strokeStyle = pal.gearFixed;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, R, 0, 2 * Math.PI);
    ctx.stroke();

    // Rolling Circle Center & Angle
    let rollingX, rollingY, tracePoint;
    if (curveType === 'hypo') {
      const rollingR = R - r;
      rollingX = rollingR * Math.cos(theta);
      rollingY = rollingR * Math.sin(theta);
      tracePoint = CycloidMath.getHypotrochoidPoint(R, r, d, theta);
    } else {
      const rollingR = R + r;
      rollingX = rollingR * Math.cos(theta);
      rollingY = rollingR * Math.sin(theta);
      tracePoint = CycloidMath.getEpitrochoidPoint(R, r, d, theta);
    }

    // Record trail
    trailPoints.push(tracePoint);
    if (trailPoints.length > maxTrail) trailPoints.shift();

    // Draw Trail
    ctx.strokeStyle = pal.primary;
    ctx.lineWidth = 2;
    ctx.beginPath();
    trailPoints.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y));
    ctx.stroke();

    // Draw Rolling Circle
    ctx.strokeStyle = pal.secondary;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(rollingX, rollingY, r, 0, 2 * Math.PI);
    ctx.stroke();

    // Trace Arm & Pen
    ctx.strokeStyle = pal.accent;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(rollingX, rollingY);
    ctx.lineTo(tracePoint.x, tracePoint.y);
    ctx.stroke();

    ctx.fillStyle = pal.accent;
    ctx.beginPath();
    ctx.arc(tracePoint.x, tracePoint.y, 5, 0, 2 * Math.PI);
    ctx.fill();
  }

  function updateTelemetry() {
    const elAngle = document.getElementById('telemetry-angle');
    const elRatio = document.getElementById('telemetry-ratio');
    const elFormula = document.getElementById('telemetry-formula');

    if (elAngle) elAngle.textContent = `${((theta * 180 / Math.PI) % 360).toFixed(1)}°`;

    if (mode === 'wankel') {
      if (elRatio) elRatio.textContent = '1 : 3 (Rotor zu Exzenterwelle)';
      if (elFormula) elFormula.innerHTML = 'x(\\alpha) = e \\cos(3\\alpha) + R \\cos(\\alpha)';
    } else if (mode === 'cycloid_drive') {
      if (elRatio) elRatio.textContent = `1 : ${cycloN} (Spielfreie Untersetzung)`;
      if (elFormula) elFormula.innerHTML = `i = \\frac{1}{N} = \\frac{1}{${cycloN}}`;
    } else {
      const gcdVal = CycloidMath.gcd(R, r);
      if (elRatio) elRatio.textContent = `${R/gcdVal} : ${r/gcdVal} (Zähne / Wälzverhältnis)`;
      if (elFormula) elFormula.innerHTML = curveType === 'hypo' 
        ? 'x = (R-r)\\cos\\theta + d\\cos(\\frac{R-r}{r}\\theta)'
        : 'x = (R+r)\\cos\\theta - d\\cos(\\frac{R+r}{r}\\theta)';
    }
  }

  // CAD EXPORTS
  function handleExportDXF() {
    let pointArrays = [];
    let layerNames = [];

    if (mode === 'wankel') {
      const housing = CycloidMath.getWankelHousingPoints(wankelE, wankelR, wankelA, 720);
      const rotor = CycloidMath.getWankelRotor(wankelE, wankelR, 0);
      pointArrays = [housing, rotor.flankPoints];
      layerNames = ['WANKEL_HOUSING', 'WANKEL_ROTOR'];
    } else if (mode === 'cycloid_drive') {
      const disc = CycloidMath.getCycloidDiscProfile(cycloN, cycloRpinCircle, cycloRpin, cycloE, 720);
      pointArrays = [disc];
      layerNames = ['CYCLOID_DISC'];
    } else {
      const curve = CycloidMath.generateCurve(curveType, R, r, d, 1440);
      pointArrays = [curve];
      layerNames = ['TROCHOID_CURVE'];
    }

    const dxfContent = CycloidMath.generateDXF(pointArrays, layerNames);
    downloadFile(dxfContent, `${mode}_profile.dxf`, 'application/dxf');
  }

  function handleExportSVG() {
    let pointArrays = [];
    if (mode === 'wankel') {
      const housing = CycloidMath.getWankelHousingPoints(wankelE, wankelR, wankelA, 720);
      const rotor = CycloidMath.getWankelRotor(wankelE, wankelR, 0);
      pointArrays = [housing, rotor.flankPoints];
    } else if (mode === 'cycloid_drive') {
      pointArrays = [CycloidMath.getCycloidDiscProfile(cycloN, cycloRpinCircle, cycloRpin, cycloE, 720)];
    } else {
      pointArrays = [CycloidMath.generateCurve(curveType, R, r, d, 1440)];
    }

    const svgContent = CycloidMath.generateSVG(pointArrays, ['#38bdf8', '#2dd4bf']);
    downloadFile(svgContent, `${mode}_vector.svg`, 'image/svg+xml');
  }

  function downloadFile(content, fileName, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  document.addEventListener('DOMContentLoaded', init);
})();
