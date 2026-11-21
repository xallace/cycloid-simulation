/* ==========================================================================
   cycloid2d.js — Synchronized 2D Drafting Blueprint & Velocity Telemetry Plots
   Supports 1967 Book-Plate Paper Ink & Prussian Blueprint CAD Styles + Pan/Zoom
   ========================================================================== */
(function (global) {
  'use strict';

  const M = global.CycloidMath;

  const STYLES = {
    paper: {
      bg: '#0a101a',
      headerBg: '#101520',
      grid: 'rgba(233, 237, 245, 0.08)',
      axis: 'rgba(122, 163, 200, 0.40)',
      ink: '#e9edf5',
      muted: '#9ca7ba',
      primary: '#ff7d61',
      secondary: '#7aa3c8',
      fill: 'rgba(122, 163, 200, 0.14)',
      accent: '#ed864b',
      good: '#58b691',
    },
    blueprint: {
      bg: '#0c2340',
      headerBg: '#091b33',
      grid: 'rgba(255, 255, 255, 0.09)',
      axis: 'rgba(147, 197, 253, 0.35)',
      ink: '#f8fafc',
      muted: '#93c5fd',
      primary: '#facc15',
      secondary: '#60a5fa',
      fill: 'rgba(96, 165, 250, 0.18)',
      accent: '#fbbf24',
      good: '#34d399',
    },
  };

  function setupCanvas(canvas) {
    const rect = canvas.parentElement.getBoundingClientRect();
    const w = Math.max(240, Math.round(rect.width));
    const h = Math.max(150, Math.round(rect.height));
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) {
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
    }
    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { ctx, w, h };
  }

  function renderKinematicsCanvas(canvas, simState, trailPoints, lang = 'en') {
    const { ctx, w, h } = setupCanvas(canvas);
    const pal = STYLES[simState.draftStyle] || STYLES.paper;
    const isDe = lang === 'de';

    ctx.fillStyle = pal.bg;
    ctx.fillRect(0, 0, w, h);

    // Header strip
    ctx.fillStyle = pal.headerBg;
    ctx.fillRect(0, 0, w, 24);
    ctx.strokeStyle = pal.grid;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, 24);
    ctx.lineTo(w, 24);
    ctx.stroke();

    ctx.fillStyle = pal.ink;
    ctx.font = 'bold 10px "JetBrains Mono", Consolas, monospace';
    ctx.textAlign = 'left';
    const modeLabel = simState.mode === 'wankel'
      ? (isDe ? 'WANKEL 1:3 SCHNITT' : 'WANKEL 1:3 CUTAWAY')
      : simState.mode === 'cycloid_drive'
        ? (isDe ? `ZYKLOIDGETRIEBE 1:${simState.cycloN}` : `CYCLOID DRIVE 1:${simState.cycloN}`)
        : (isDe ? '2D-ROLLKURVEN-SKIZZE (PAN/ZOOM)' : '2D ROULETTE SKETCH (PAN/ZOOM)');
    ctx.fillText(modeLabel, 10, 15);
    ctx.textAlign = 'right';
    ctx.fillStyle = pal.muted;
    ctx.fillText(`${(simState.zoom * 100).toFixed(0)}%`, w - 10, 15);
    ctx.textAlign = 'left';

    // Clip below header
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 24, w, h - 24);
    ctx.clip();

    // Base extent fitting inside canvas height
    let maxExt = 175;
    if (simState.mode === 'wankel') {
      maxExt = simState.wankelR + simState.wankelE + simState.wankelA + 28;
    } else if (simState.mode === 'cycloid_drive') {
      maxExt = simState.cycloRpinCircle + simState.cycloRpin + 20;
    } else {
      maxExt = simState.curveType === 'hypo'
        ? Math.max(simState.R + 12, Math.abs(simState.R - simState.r) + simState.d + 12)
        : simState.R + simState.r + Math.max(simState.r, simState.d) + 12;
    }
    const baseFit = (Math.min(w, h - 28) * 0.44) / Math.max(40, maxExt);
    const pxScale = baseFit * simState.zoom;
    const cx = w * 0.5 + simState.panX;
    const cy = 24 + (h - 24) * 0.5 + simState.panY;

    // Grid
    const step = 35 * simState.zoom;
    ctx.strokeStyle = pal.grid;
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let x = ((cx % step) + step) % step; x < w; x += step) {
      ctx.moveTo(x, 24);
      ctx.lineTo(x, h);
    }
    for (let y = 24 + (((cy - 24) % step) + step) % step; y < h; y += step) {
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
    }
    ctx.stroke();

    // Axes
    ctx.strokeStyle = pal.axis;
    ctx.lineWidth = 1.2;
    ctx.setLineDash([4, 3]);
    ctx.beginPath();
    ctx.moveTo(0, cy);
    ctx.lineTo(w, cy);
    ctx.moveTo(cx, 24);
    ctx.lineTo(cx, h);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.translate(cx, cy);
    ctx.scale(pxScale, pxScale);

    if (simState.mode === 'wankel') {
      const { wankelE: e, wankelR: R, wankelA: a, theta } = simState;
      const housing = M.getWankelHousingPoints(e, R, a, 240);
      ctx.strokeStyle = pal.ink;
      ctx.lineWidth = 2.4 / pxScale;
      ctx.beginPath();
      housing.forEach((p, i) => (i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)));
      ctx.closePath();
      ctx.stroke();

      ctx.strokeStyle = pal.muted;
      ctx.lineWidth = 1 / pxScale;
      ctx.beginPath();
      ctx.arc(0, 0, R + e + a + 16, 0, 2 * Math.PI);
      ctx.stroke();

      // Ignition plug
      ctx.fillStyle = pal.primary;
      ctx.beginPath();
      ctx.arc(-(R + e + a + 4), 0, 4.5 / pxScale, 0, 2 * Math.PI);
      ctx.fill();

      const rotor = M.getWankelRotor(e, R, theta);
      ctx.fillStyle = pal.fill;
      ctx.strokeStyle = pal.secondary;
      ctx.lineWidth = 2.2 / pxScale;
      ctx.beginPath();
      rotor.flankPoints.forEach((p, i) => (i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)));
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      rotor.apexes.forEach((ap) => {
        ctx.fillStyle = pal.primary;
        ctx.beginPath();
        ctx.arc(ap.x, ap.y, 4 / pxScale, 0, 2 * Math.PI);
        ctx.fill();
      });

      ctx.strokeStyle = pal.accent;
      ctx.lineWidth = 2 / pxScale;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(rotor.center.x, rotor.center.y);
      ctx.stroke();

      ctx.fillStyle = pal.accent;
      ctx.beginPath();
      ctx.arc(0, 0, 4.5 / pxScale, 0, 2 * Math.PI);
      ctx.fill();
    } else if (simState.mode === 'cycloid_drive') {
      const { cycloN: N, cycloRpinCircle: Rp, cycloRpin: rp, cycloE: e, theta } = simState;
      const pins = N + 1;

      ctx.strokeStyle = pal.secondary;
      ctx.setLineDash([4 / pxScale, 4 / pxScale]);
      ctx.lineWidth = 1.2 / pxScale;
      ctx.beginPath();
      ctx.arc(0, 0, Rp, 0, 2 * Math.PI);
      ctx.stroke();
      ctx.setLineDash([]);

      for (let i = 0; i < pins; i++) {
        const ang = (i / pins) * 2 * Math.PI;
        const px = Rp * Math.cos(ang);
        const py = Rp * Math.sin(ang);
        ctx.fillStyle = pal.accent;
        ctx.strokeStyle = pal.ink;
        ctx.lineWidth = 1.2 / pxScale;
        ctx.beginPath();
        ctx.arc(px, py, rp, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
      }

      const disc = M.getCycloidDiscProfile(N, Rp, rp, e, 480);
      ctx.save();
      ctx.translate(e * Math.cos(theta), e * Math.sin(theta));
      ctx.rotate(-theta / N);

      ctx.fillStyle = pal.fill;
      ctx.strokeStyle = pal.primary;
      ctx.lineWidth = 2 / pxScale;
      ctx.beginPath();
      disc.forEach((p, i) => (i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)));
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      for (let hIdx = 0; hIdx < 6; hIdx++) {
        const ha = (hIdx / 6) * 2 * Math.PI;
        ctx.fillStyle = pal.bg;
        ctx.beginPath();
        ctx.arc(Rp * 0.43 * Math.cos(ha), Rp * 0.43 * Math.sin(ha), Rp * 0.095, 0, 2 * Math.PI);
        ctx.fill();
        ctx.strokeStyle = pal.secondary;
        ctx.lineWidth = 1.4 / pxScale;
        ctx.stroke();
      }
      ctx.restore();
    } else {
      const { curveType, R, r, d, theta } = simState;
      const isHypo = curveType === 'hypo';

      // Base ring
      ctx.strokeStyle = pal.ink;
      ctx.lineWidth = 1.8 / pxScale;
      ctx.beginPath();
      ctx.arc(0, 0, R, 0, 2 * Math.PI);
      ctx.stroke();

      // Ghost closed curve
      const ghost = M.generateCurve(isHypo ? 'hypo' : 'epi', R, r, d, 720);
      ctx.strokeStyle = pal.axis;
      ctx.lineWidth = 1.1 / pxScale;
      ctx.beginPath();
      ghost.forEach((p, i) => (i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)));
      ctx.stroke();

      // Active accumulated trace
      if (trailPoints && trailPoints.length > 1) {
        ctx.strokeStyle = pal.primary;
        ctx.lineWidth = 2.2 / pxScale;
        ctx.beginPath();
        trailPoints.forEach((p, i) => (i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)));
        ctx.stroke();
      }

      const rollDist = isHypo ? R - r : R + r;
      const rx = rollDist * Math.cos(theta);
      const ry = rollDist * Math.sin(theta);
      const tracePt = isHypo ? M.getHypotrochoidPoint(R, r, d, theta) : M.getEpitrochoidPoint(R, r, d, theta);

      // Carrier line
      ctx.strokeStyle = pal.muted;
      ctx.lineWidth = 1.4 / pxScale;
      ctx.setLineDash([4 / pxScale, 3 / pxScale]);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(rx, ry);
      ctx.stroke();
      ctx.setLineDash([]);

      // Rolling circle
      ctx.strokeStyle = pal.secondary;
      ctx.lineWidth = 1.6 / pxScale;
      ctx.beginPath();
      ctx.arc(rx, ry, r, 0, 2 * Math.PI);
      ctx.stroke();

      // Tracing arm & nib
      ctx.strokeStyle = pal.accent;
      ctx.lineWidth = 1.8 / pxScale;
      ctx.beginPath();
      ctx.moveTo(rx, ry);
      ctx.lineTo(tracePt.x, tracePt.y);
      ctx.stroke();

      ctx.fillStyle = pal.primary;
      ctx.beginPath();
      ctx.arc(tracePt.x, tracePt.y, 4.5 / pxScale, 0, 2 * Math.PI);
      ctx.fill();
    }

    ctx.restore();
  }

  function renderTelemetryPlotCanvas(canvas, simState, lang = 'en') {
    const { ctx, w, h } = setupCanvas(canvas);
    const pal = STYLES[simState.draftStyle] || STYLES.paper;
    const isDe = lang === 'de';

    ctx.fillStyle = pal.bg;
    ctx.fillRect(0, 0, w, h);

    ctx.fillStyle = pal.headerBg;
    ctx.fillRect(0, 0, w, 24);
    ctx.strokeStyle = pal.grid;
    ctx.beginPath();
    ctx.moveTo(0, 24);
    ctx.lineTo(w, 24);
    ctx.stroke();

    const plotLeft = 40;
    const plotRight = w - 16;
    const plotTop = 36;
    const plotBottom = h - 24;
    const plotW = Math.max(80, plotRight - plotLeft);
    const plotH = Math.max(60, plotBottom - plotTop);

    // Sample diagnostic curve over [0, 2PI]
    const samples = 180;
    const yVals = [];
    let title = '';
    let maxY = 1;

    if (simState.mode === 'wankel') {
      title = isDe ? 'ROTORSPITZEN-ABSTAND r(θ) & PHASE 1:3' : 'ROTOR APEX RADIUS r(θ) & 1:3 SWEEP';
      for (let i = 0; i <= samples; i++) {
        const th = (i / samples) * 6 * Math.PI;
        const rotor = M.getWankelRotor(simState.wankelE, simState.wankelR, th);
        const rad = Math.hypot(rotor.apexes[0].x, rotor.apexes[0].y);
        yVals.push(rad);
        if (rad > maxY) maxY = rad;
      }
      maxY *= 1.1;
    } else if (simState.mode === 'cycloid_drive') {
      const N = simState.cycloN;
      title = isDe ? `KURVENSCHEIBEN-RADIUS r(φ) · K₁ = ${(simState.cycloRpinCircle / (simState.cycloE * (N + 1))).toFixed(2)}` : `DISC CONTOUR r(φ) · FACTOR K₁ = ${(simState.cycloRpinCircle / (simState.cycloE * (N + 1))).toFixed(2)}`;
      const prof = M.getCycloidDiscProfile(N, simState.cycloRpinCircle, simState.cycloRpin, simState.cycloE, samples);
      prof.forEach((p) => {
        const rad = Math.hypot(p.x, p.y);
        yVals.push(rad);
        if (rad > maxY) maxY = rad;
      });
      maxY *= 1.08;
    } else {
      const reg = simState.d === simState.r
        ? (isDe ? 'SPITZE (d=r)' : 'CUSP (d=r)')
        : simState.d > simState.r
          ? (isDe ? 'SCHLEIFE (d>r)' : 'PROLATE (d>r)')
          : (isDe ? 'GESTRECKT (d<r)' : 'CURTATE (d<r)');
      title = isDe ? `BAHN-GESCHWINDIGKEIT |dr/dθ| · ${reg}` : `TRACING SPEED |dr/dθ| · ${reg}`;
      const period = Math.min(2 * Math.PI, M.getPeriod(simState.R, simState.r));
      for (let i = 0; i <= samples; i++) {
        const th = (i / samples) * period;
        const spd = M.getCurveSpeed(simState.curveType, simState.R, simState.r, simState.d, th);
        yVals.push(spd);
        if (spd > maxY) maxY = spd;
      }
      maxY = Math.max(10, maxY * 1.12);
    }

    ctx.fillStyle = pal.ink;
    ctx.font = 'bold 10px "JetBrains Mono", Consolas, monospace';
    ctx.textAlign = 'left';
    ctx.fillText(title, 10, 15);

    // Axes box & grid
    ctx.strokeStyle = pal.grid;
    ctx.lineWidth = 1;
    for (let g = 0; g <= 4; g++) {
      const gy = plotTop + (g / 4) * plotH;
      ctx.beginPath();
      ctx.moveTo(plotLeft, gy);
      ctx.lineTo(plotRight, gy);
      ctx.stroke();
    }
    ctx.strokeStyle = pal.axis;
    ctx.strokeRect(plotLeft, plotTop, plotW, plotH);

    // Labels
    ctx.fillStyle = pal.muted;
    ctx.font = '9px "JetBrains Mono", Consolas, monospace';
    ctx.textAlign = 'right';
    ctx.fillText(maxY.toFixed(0), plotLeft - 5, plotTop + 8);
    ctx.fillText('0', plotLeft - 5, plotBottom);
    ctx.textAlign = 'center';
    ctx.fillText('0', plotLeft, plotBottom + 13);
    ctx.fillText(simState.mode === 'wankel' ? '3π' : 'π', plotLeft + plotW * 0.5, plotBottom + 13);
    ctx.fillText(simState.mode === 'wankel' ? '6π' : '2π', plotRight, plotBottom + 13);

    // Plot curve + shaded area
    ctx.beginPath();
    yVals.forEach((v, i) => {
      const x = plotLeft + (i / (yVals.length - 1)) * plotW;
      const y = plotBottom - (v / maxY) * plotH;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.strokeStyle = pal.secondary;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Live cursor marker
    const span = simState.mode === 'wankel' ? 6 * Math.PI : 2 * Math.PI;
    const normT = (((simState.theta % span) + span) % span) / span;
    const cx = plotLeft + normT * plotW;
    const idx = Math.min(yVals.length - 1, Math.round(normT * (yVals.length - 1)));
    const cy = plotBottom - (yVals[idx] / maxY) * plotH;

    ctx.strokeStyle = pal.primary;
    ctx.lineWidth = 1.2;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(cx, plotTop);
    ctx.lineTo(cx, plotBottom);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = pal.primary;
    ctx.beginPath();
    ctx.arc(cx, cy, 4, 0, 2 * Math.PI);
    ctx.fill();
  }

  global.CYCLOID_2D = {
    renderKinematicsCanvas,
    renderTelemetryPlotCanvas,
  };
})(window);
