/* ==========================================================================
   app.js — Cycloid & Planetary Kinematics Lab (1967 Book Plate 3D & 2D Edition)
   Connects CycloidMath, CYCLOID_DATA, CYCLOID_SCENE3D, CYCLOID_2D & KinematicsAudio
   ========================================================================== */
(function (global) {
  'use strict';

  const M = global.CycloidMath;
  const D = global.CYCLOID_DATA;
  const S3D = global.CYCLOID_SCENE3D;
  const C2D = global.CYCLOID_2D;
  const A = global.KinematicsAudio;

  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => Array.from(document.querySelectorAll(sel));

  const state = {
    lang: localStorage.getItem('agy_cycloid_lang') || 'en',
    activeTab: 'atlas', // 'atlas' | 'lab' | 'concepts' | 'reading'
    atlasFigure: 'overview',
    variantAB: 'b',
    selectedCalloutId: null,
    displayMode: 'solid3d',
    showCallouts: true,
    showLabels: true,
    showPitch: true,
    tourActive: false,
    tourIndex: 0,
    tourAuto: false,
    tourTimer: null,
    isEmbedded: false,

    // Live simulation state
    isRunning: true,
    activePresetId: 'wankel',
    mode: 'wankel', // 'wankel' | 'cycloid_drive' | 'trochoid'
    draftStyle: 'paper', // 'paper' | 'blueprint'
    theta: 0.72,
    idleTheta: 0.72,
    speed: 0.8,

    // Wankel parameters
    wankelR: 140,
    wankelE: 20,
    wankelA: 6,

    // Cycloid drive parameters
    cycloN: 10,
    cycloRpinCircle: 150,
    cycloRpin: 10,
    cycloE: 6,

    // Trochoid parameters
    curveType: 'hypo',
    R: 120,
    r: 40,
    d: 50,
    trailPoints: [],
    maxTrail: 1400,

    // 2D Sketch viewport transform (offset from center)
    panX: 0,
    panY: 0,
    zoom: 1.0,
  };

  let sceneMgr = null;
  let audio = null;
  const calloutDomMap = new Map();
  let lastFormulaStr = '';

  function txt() {
    return D.UI_TEXT[state.lang] || D.UI_TEXT.en;
  }

  function loc(field) {
    if (field === null || field === undefined) return '';
    if (typeof field === 'string') return field;
    return field[state.lang] ?? field.en ?? '';
  }

  function getActiveFigureId() {
    if (state.atlasFigure === 'overview') return 'overview';
    return D.resolveVariantId(state.atlasFigure, state.variantAB);
  }

  function isPairedFigure(figKey) {
    return D.PAIRED_FIGURES.includes(figKey);
  }

  function getLiveConfigSnapshot() {
    return {
      mode: state.mode,
      wankelR: state.wankelR,
      wankelE: state.wankelE,
      wankelA: state.wankelA,
      cycloN: state.cycloN,
      cycloRpinCircle: state.cycloRpinCircle,
      cycloRpin: state.cycloRpin,
      cycloE: state.cycloE,
      curveType: state.curveType,
      R: state.R,
      r: state.r,
      d: state.d,
      theta: state.theta,
    };
  }

  // --------------------------------------------------------------------------
  // Localization
  // --------------------------------------------------------------------------
  function applyLanguage(lang) {
    state.lang = lang === 'de' ? 'de' : 'en';
    localStorage.setItem('agy_cycloid_lang', state.lang);
    document.documentElement.lang = state.lang;

    $$('#lang-toggle-group .mini-btn').forEach((b) => {
      b.classList.toggle('active', b.dataset.lang === state.lang);
    });

    const t = txt();
    $('#ui-brand-title').textContent = t.brandTitle;
    $('#ui-brand-sub').textContent = t.brandSub;
    $('#ui-source-ref').textContent = t.sourceRef;
    $('#tab-btn-atlas').textContent = t.tabAtlas;
    $('#tab-btn-lab').textContent = t.tabLab;
    $('#tab-btn-concepts').textContent = t.tabConcepts;
    $('#tab-btn-reading').textContent = t.tabReading;
    $('#ui-btn-tour').textContent = t.btnTour;
    $('#btn-overview').textContent = t.btnOverview;
    $('#btn-var-a').textContent = t.varA;
    $('#btn-var-b').textContent = t.varB;
    $('#opt-solid').textContent = t.modeSolid;
    $('#opt-exploded').textContent = t.modeExploded;
    $('#opt-plate2d').textContent = t.modePlate2d;
    $('#opt-wire').textContent = t.modeWire;
    $('#btn-toggle-callouts').textContent = t.togCallouts;
    $('#btn-toggle-labels').textContent = t.togLabels;
    $('#btn-toggle-pitch').textContent = t.togGrid;
    $('#btn-reset-cam').textContent = t.btnResetCam;
    $('#cam-persp').textContent = t.camPersp;
    $('#cam-top').textContent = t.camTop;
    $('#cam-front').textContent = t.camFront;
    $('#cam-side').textContent = t.camSide;
    $('#leg-fixed').textContent = t.legFixed;
    $('#leg-moving').textContent = t.legMoving;
    $('#leg-trace').textContent = t.legTrace;
    $('#leg-pin').textContent = t.legPin;
    $('#atlas-snapshot-heading').textContent = t.snapshotHeading;

    $('#ui-lab-kicker').textContent = t.labKicker;
    $('#ui-lab-title').textContent = t.labTitle;
    $('#btn-play-pause').textContent = state.isRunning ? t.btnPlayPauseRun : t.btnPlayPauseStop;
    $('#btn-reset').textContent = t.btnStepReset;
    $('#btn-recenter').textContent = t.btnRecenter;
    $('#ui-grp-pres').textContent = t.grpPres;
    $('#ui-grp-motion').textContent = t.grpMotion;
    $('#ui-lbl-speed').textContent = t.lblSpeed;
    $('#ui-lbl-style').textContent = t.lblStyle;
    const stOpts = $('#style-select').options;
    if (stOpts.length >= 2) {
      stOpts[0].textContent = t.stylePaper;
      stOpts[1].textContent = t.styleBlueprint;
    }
    $('#ui-grp-params').textContent = t.grpParams;
    $('#ui-lbl-curvetype').textContent = t.lblCurveType;
    const ctOpts = $('#curve-type-select').options;
    if (ctOpts.length >= 2) {
      ctOpts[0].textContent = t.curveHypo;
      ctOpts[1].textContent = t.curveEpi;
    }
    $('#ui-lbl-R').textContent = t.lblR;
    $('#ui-lbl-r').textContent = t.lblr;
    $('#ui-lbl-d').textContent = t.lbld;
    $('#ui-lbl-wR').textContent = t.lblWankelR;
    $('#ui-lbl-we').textContent = t.lblWankelE;
    $('#ui-lbl-wa').textContent = t.lblWankelA;
    $('#ui-lbl-cN').textContent = t.lblCycloN;
    $('#ui-lbl-cR').textContent = t.lblCycloR;
    $('#ui-lbl-crp').textContent = t.lblCycloRp;
    $('#ui-lbl-ce').textContent = t.lblCycloE;
    $('#ui-grp-formula').textContent = t.grpFormula;
    $('#ui-btn-dxf').textContent = t.btnDxf;
    $('#ui-btn-svg').textContent = t.btnSvg;

    $('#ui-concepts-kicker').textContent = t.conceptsKicker;
    $('#ui-concepts-title').textContent = t.conceptsTitle;
    $('#ui-concepts-intro').textContent = t.conceptsIntro;
    $('#ui-laws-heading').textContent = t.lawsHeading;
    $('#ui-book-head-l').textContent = t.bookHeaderLeft;
    $('#ui-book-head-r').textContent = t.bookHeaderRight;
    $('#ui-book-title').textContent = t.bookTitle;
    $('#ui-book-note').textContent = t.bookNote;

    $('#ui-reading-kicker').textContent = t.readingKicker;
    $('#ui-reading-title').textContent = t.readingTitle;
    $('#ui-reading-intro').textContent = t.readingIntro;
    $('#ui-read-col1').textContent = t.readCol1;
    $('#ui-read-col2').textContent = t.readCol2;

    populateFigureDropdown();
    buildLabPresetButtons();
    buildEditorialViews();
    syncCalloutDom();
    updateAtlasInspector();
    if (state.tourActive) renderTourCard();
    lastFormulaStr = '';
    updateTelemetry();
  }

  // --------------------------------------------------------------------------
  // Tab Navigation
  // --------------------------------------------------------------------------
  function setActiveTab(tab) {
    state.activeTab = tab;
    $$('.tab-btn').forEach((btn) => {
      const on = btn.dataset.tab === tab;
      btn.classList.toggle('active', on);
      btn.setAttribute('aria-selected', String(on));
    });

    const isInteractive = tab === 'atlas' || tab === 'lab';
    $('#interactive-shell').classList.toggle('hidden', !isInteractive);
    $('#concepts-view').classList.toggle('hidden', tab !== 'concepts');
    $('#reading-view').classList.toggle('hidden', tab !== 'reading');

    if (isInteractive) {
      const isLab = tab === 'lab';
      $('#atlas-figure-bar').classList.toggle('hidden', isLab);
      $('#lab-status-bar').classList.toggle('hidden', !isLab);
      $('#btn-toggle-callouts').classList.toggle('hidden', isLab);
      $('#flow2d-strip').classList.toggle('hidden', !isLab || state.isEmbedded);
      $('#atlas-panel').classList.toggle('hidden', isLab);
      $('#lab-panel').classList.toggle('hidden', !isLab);

      if (isLab && state.tourActive) stopTour();
      if (!isLab && audio) audio.stopEngine();

      refresh3DScene(true);
      setTimeout(() => {
        sceneMgr.resize();
        render2DCanvases();
      }, 30);
    } else if (audio) {
      audio.stopEngine();
    }
  }

  // --------------------------------------------------------------------------
  // 3D Scene & Call-Out Synchronization
  // --------------------------------------------------------------------------
  function refresh3DScene(resetCam) {
    if (!sceneMgr) return;
    sceneMgr.displayMode = state.displayMode;
    sceneMgr.showCallouts = state.showCallouts;
    sceneMgr.showLabels = state.showLabels;
    sceneMgr.showPitch = state.showPitch;

    if (state.activeTab === 'lab') {
      sceneMgr.rebuildLiveMechanism(getLiveConfigSnapshot());
      syncCalloutDom();
      lastFormulaStr = '';
      updateTelemetry();
      if (resetCam) {
        sceneMgr.flyTo([0.0, 3.05, 3.45], [0.0, 0.0, 0.0], 550);
      }
      return;
    }

    const activeId = getActiveFigureId();
    if (activeId === 'overview') {
      sceneMgr.showOverview(D.FIGURES, D.OVERVIEW_IDS);
      syncCalloutDom();
      if (resetCam) {
        sceneMgr.flyTo([0.0, 6.9, 8.6], [0.0, -0.05, 0.0], 650);
      }
    } else {
      const fig = D.FIGURES[activeId];
      sceneMgr.showSingleFigure(fig, state.showCallouts);
      syncCalloutDom();
      if (resetCam) {
        sceneMgr.flyTo(fig.cameraFocus.pos, fig.cameraFocus.target, 650);
      }
    }
    updateAtlasInspector();
  }

  function syncCalloutDom() {
    const svg = $('#callout-svg');
    const layer = $('#callout-layer');
    svg.innerHTML = '';
    layer.innerHTML = '';
    calloutDomMap.clear();

    if (!state.showCallouts || state.activeTab !== 'atlas') return;

    const activeId = getActiveFigureId();
    if (activeId === 'overview') {
      D.OVERVIEW_IDS.forEach((fid) => {
        const fig = D.FIGURES[fid];
        const btn = document.createElement('button');
        btn.className = 'callout-pin overview-pin';
        btn.innerHTML = `<span class="pin-num">${fig.code}</span> ${loc(fig.category)}`;
        btn.addEventListener('click', () => selectAtlasFigure(fid));
        layer.appendChild(btn);
        calloutDomMap.set(fid, { btn, line: null, dot: null, offsetY: 0 });
      });
      return;
    }

    const fig = D.FIGURES[activeId];
    fig.callouts.forEach((c, idx) => {
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('stroke', '#ff7d61');
      line.setAttribute('stroke-width', '1.4');
      line.setAttribute('stroke-dasharray', '3 2');
      svg.appendChild(line);

      const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      dot.setAttribute('r', '3.5');
      dot.setAttribute('fill', '#ff7d61');
      svg.appendChild(dot);

      const btn = document.createElement('button');
      btn.className = 'callout-pin' + (state.selectedCalloutId === c.id ? ' selected' : '');
      btn.innerHTML = `<span class="pin-num">${idx + 1}</span> ${loc(c.title)}`;
      btn.addEventListener('click', () => selectCallout(c.id));
      layer.appendChild(btn);

      const offsetY = idx % 2 === 0 ? -40 : 40;
      calloutDomMap.set(c.id, { btn, line, dot, offsetY });
    });
  }

  function handleProjectedCallouts(items) {
    if (!state.showCallouts || state.activeTab !== 'atlas') return;
    const w = $('#viewport-wrap').clientWidth;
    const h = $('#viewport-wrap').clientHeight;

    const shown = [];
    items.forEach((item) => {
      const entry = calloutDomMap.get(item.id);
      if (!entry) return;
      const inBounds = item.visible && item.x > -40 && item.x < w + 40 && item.y > -40 && item.y < h + 40;
      entry.btn.style.display = inBounds ? 'inline-flex' : 'none';
      if (entry.line) entry.line.style.display = inBounds ? 'block' : 'none';
      if (entry.dot) entry.dot.style.display = inBounds ? 'block' : 'none';
      if (inBounds) shown.push({ item, entry });
    });
    if (!shown.length) return;

    const pinned = shown.filter((s) => s.entry.line);
    const cx = pinned.reduce((a, s) => a + s.item.x, 0) / Math.max(1, pinned.length);
    const cy = pinned.reduce((a, s) => a + s.item.y, 0) / Math.max(1, pinned.length);
    const reach = Math.max(66, Math.min(w, h) * 0.16);
    const placed = [];

    shown.forEach(({ item, entry }) => {
      const bw = entry.btn.offsetWidth || 160;
      const bh = entry.btn.offsetHeight || 26;
      const clampX = (v) => Math.max(bw / 2 + 8, Math.min(w - bw / 2 - 8, v));
      const clampY = (v) => Math.max(58, Math.min(h - 54, v));
      let labelX = item.x;
      let labelY = item.y + entry.offsetY;

      if (entry.line) {
        let dx = item.x - cx;
        let dy = item.y - cy;
        const d = Math.hypot(dx, dy);
        if (d < 12) { dx = 0; dy = -1; } else { dx /= d; dy /= d; }
        labelX = clampX(item.x + dx * reach);
        labelY = clampY(item.y + dy * reach * 0.85);
        for (let k = 0; k < 12; k++) {
          const hit = placed.find((p) => Math.abs(p.x - labelX) < (p.w + bw) / 2 + 6 && Math.abs(p.y - labelY) < (p.h + bh) / 2 + 4);
          if (!hit) break;
          const ny = clampY(labelY + (labelY >= hit.y ? 1 : -1) * ((hit.h + bh) / 2 + 5 - Math.abs(hit.y - labelY)));
          if (Math.abs(ny - labelY) < 1) {
            labelX = clampX(labelX + (labelX >= hit.x ? 1 : -1) * ((hit.w + bw) / 2 + 7 - Math.abs(hit.x - labelX)));
          } else {
            labelY = ny;
          }
        }
        placed.push({ x: labelX, y: labelY, w: bw, h: bh });
      } else {
        labelX = clampX(item.x);
        labelY = clampY(labelY);
      }

      entry.btn.style.left = `${labelX.toFixed(1)}px`;
      entry.btn.style.top = `${labelY.toFixed(1)}px`;

      if (entry.line && entry.dot) {
        entry.dot.setAttribute('cx', item.x.toFixed(1));
        entry.dot.setAttribute('cy', item.y.toFixed(1));
        entry.line.setAttribute('x1', item.x.toFixed(1));
        entry.line.setAttribute('y1', item.y.toFixed(1));
        entry.line.setAttribute('x2', labelX.toFixed(1));
        entry.line.setAttribute('y2', labelY.toFixed(1));
      }
    });
  }

  // --------------------------------------------------------------------------
  // Atlas Selection & Inspector
  // --------------------------------------------------------------------------
  function populateFigureDropdown() {
    const sel = $('#select-figure');
    const prev = state.atlasFigure;
    sel.innerHTML = '';
    D.FIGURE_ORDER.forEach((fkey) => {
      const fid = D.resolveVariantId(fkey, 'b');
      const f = D.FIGURES[fid];
      const opt = document.createElement('option');
      opt.value = fkey;
      opt.textContent = isPairedFigure(fkey)
        ? `Fig. ${fkey.replace('fig', '')}a/b · ${loc(f.name)}`
        : `Fig. ${fkey.replace('fig', '')} · ${loc(f.name)}`;
      sel.appendChild(opt);
    });
    if (prev !== 'overview') sel.value = prev;
  }

  function selectAtlasFigure(targetId) {
    state.selectedCalloutId = null;

    if (targetId === 'overview') {
      state.atlasFigure = 'overview';
      $('#btn-overview').classList.add('active');
      $('#variant-ab-group').classList.add('hidden');
    } else {
      const figObj = D.FIGURES[targetId];
      if (figObj && figObj.pairId) {
        state.atlasFigure = figObj.pairId;
        state.variantAB = figObj.variant;
      } else {
        state.atlasFigure = targetId;
      }
      $('#btn-overview').classList.remove('active');
      $('#select-figure').value = state.atlasFigure;

      const paired = isPairedFigure(state.atlasFigure);
      $('#variant-ab-group').classList.toggle('hidden', !paired);
      if (paired) {
        $$('#variant-ab-group .mini-btn').forEach((b) => {
          b.classList.toggle('active', b.dataset.ab === state.variantAB);
        });
      }
    }

    refresh3DScene(true);
  }

  function selectCallout(cid) {
    state.selectedCalloutId = state.selectedCalloutId === cid ? null : cid;
    calloutDomMap.forEach((entry, id) => {
      entry.btn.classList.toggle('selected', id === state.selectedCalloutId);
    });
    updateAtlasInspector();
  }

  function setBookNote(page, text) {
    const el = $('#atlas-quote');
    el.innerHTML = '';
    const tag = document.createElement('span');
    tag.className = 'book-note-tag';
    tag.textContent = page;
    el.appendChild(tag);
    el.appendChild(document.createTextNode(text));
  }

  function updateAtlasInspector() {
    const t = txt();
    const isDe = state.lang === 'de';
    const activeId = getActiveFigureId();

    if (activeId === 'overview') {
      $('#atlas-code').textContent = t.overviewKicker;
      $('#atlas-title').textContent = t.overviewTitle;
      $('#atlas-cat-tag').textContent = t.overviewTag;
      $('#atlas-summary').textContent = t.overviewSummary;
      setBookNote(t.overviewBookPage, t.overviewBookNote);
      $('#atlas-list-heading').textContent = t.overviewListHeading;

      const list = $('#callout-detail-list');
      list.innerHTML = '';
      D.FIGURE_ORDER.forEach((fkey) => {
        const fid = D.resolveVariantId(fkey, state.variantAB);
        const f = D.FIGURES[fid];
        const card = document.createElement('div');
        card.className = 'callout-item';
        card.innerHTML = `<div class="callout-item-head"><span>${loc(f.plate)} · ${f.code} — ${loc(f.name)}</span><span class="callout-badge">${loc(f.category)}</span></div><div class="callout-item-body">${loc(f.subtitle)}</div>`;
        card.addEventListener('click', () => selectAtlasFigure(fid));
        list.appendChild(card);
      });

      $('#atlas-metrics').innerHTML = `
        <div class="kpi-card"><div class="kpi-label">${isDe ? 'Tafeln' : 'Plates'}</div><div class="kpi-val accent">6 (9 a/b)</div></div>
        <div class="kpi-card"><div class="kpi-label">${isDe ? 'Modi' : 'Mechanisms'}</div><div class="kpi-val">3</div></div>
        <div class="kpi-card"><div class="kpi-label">${isDe ? 'Export' : 'CAD Export'}</div><div class="kpi-val good">DXF + SVG</div></div>
      `;
      $('#btn-open-in-lab').textContent = t.ctaOpenOverview;
      return;
    }

    const fig = D.FIGURES[activeId];
    const cfg = fig.config;

    $('#atlas-code').textContent = `${loc(fig.plate).toUpperCase()} · ${fig.code}`;
    $('#atlas-title').textContent = loc(fig.name);
    $('#atlas-cat-tag').textContent = loc(fig.category);
    $('#atlas-summary').textContent = loc(fig.summary);
    setBookNote(loc(fig.bookPage), loc(fig.bookNote));
    $('#atlas-list-heading').textContent = t.plateCalloutsHeading;

    const list = $('#callout-detail-list');
    list.innerHTML = '';
    fig.callouts.forEach((c, idx) => {
      const item = document.createElement('div');
      item.className = 'callout-item' + (state.selectedCalloutId === c.id ? ' selected' : '');
      item.innerHTML = `
        <div class="callout-item-head">
          <span>${idx + 1}. ${loc(c.title)}</span>
          <span class="callout-badge">${loc(c.badge)}</span>
        </div>
        <div class="callout-item-body">${loc(c.body)}</div>
      `;
      item.addEventListener('click', () => selectCallout(c.id));
      list.appendChild(item);
    });

    if (cfg.mode === 'wankel') {
      $('#atlas-metrics').innerHTML = `
        <div class="kpi-card"><div class="kpi-label">R_gen</div><div class="kpi-val accent">${cfg.wankelR}</div></div>
        <div class="kpi-card"><div class="kpi-label">${isDe ? 'Exzentr. e' : 'Eccentr. e'}</div><div class="kpi-val slate">${cfg.wankelE}</div></div>
        <div class="kpi-card"><div class="kpi-label">${isDe ? 'Ratio' : 'Ratio'}</div><div class="kpi-val good">1 : 3</div></div>
        <div class="kpi-card"><div class="kpi-label">${isDe ? 'Spalt a' : 'Offset a'}</div><div class="kpi-val">${cfg.wankelA}</div></div>
        <div class="kpi-card"><div class="kpi-label">R/e</div><div class="kpi-val">${(cfg.wankelR / cfg.wankelE).toFixed(1)}</div></div>
        <div class="kpi-card"><div class="kpi-label">CAD</div><div class="kpi-val">AC1009</div></div>
      `;
    } else if (cfg.mode === 'cycloid_drive') {
      const K1 = cfg.cycloRpinCircle / (cfg.cycloE * (cfg.cycloN + 1));
      $('#atlas-metrics').innerHTML = `
        <div class="kpi-card"><div class="kpi-label">${isDe ? 'Nocken N' : 'Lobes N'}</div><div class="kpi-val accent">${cfg.cycloN}</div></div>
        <div class="kpi-card"><div class="kpi-label">${isDe ? 'Bolzen' : 'Pins'}</div><div class="kpi-val slate">${cfg.cycloN + 1}</div></div>
        <div class="kpi-card"><div class="kpi-label">Ratio</div><div class="kpi-val good">1 : ${cfg.cycloN}</div></div>
        <div class="kpi-card"><div class="kpi-label">Rp</div><div class="kpi-val">${cfg.cycloRpinCircle}</div></div>
        <div class="kpi-card"><div class="kpi-label">e / rp</div><div class="kpi-val">${cfg.cycloE} / ${cfg.cycloRpin}</div></div>
        <div class="kpi-card"><div class="kpi-label">K₁ &gt; 1</div><div class="kpi-val">${K1.toFixed(2)}</div></div>
      `;
    } else {
      const info = M.getHarmonicInfo(cfg.R, cfg.r);
      $('#atlas-metrics').innerHTML = `
        <div class="kpi-card"><div class="kpi-label">R / r</div><div class="kpi-val accent">${cfg.R} / ${cfg.r}</div></div>
        <div class="kpi-card"><div class="kpi-label">Arm d</div><div class="kpi-val slate">${cfg.d}</div></div>
        <div class="kpi-card"><div class="kpi-label">${isDe ? 'Bögen' : 'Lobes'}</div><div class="kpi-val good">${info.cusps}</div></div>
        <div class="kpi-card"><div class="kpi-label">${isDe ? 'Umläufe' : 'Turns'}</div><div class="kpi-val">${info.turns}</div></div>
        <div class="kpi-card"><div class="kpi-label">${isDe ? 'Typ' : 'Roll'}</div><div class="kpi-val">${cfg.curveType.toUpperCase()}</div></div>
        <div class="kpi-card"><div class="kpi-label">d / r</div><div class="kpi-val">${(cfg.d / cfg.r).toFixed(2)}</div></div>
      `;
    }
    $('#btn-open-in-lab').textContent = t.ctaOpenFig.replace('{code}', fig.code);
  }

  // --------------------------------------------------------------------------
  // Guided Tour
  // --------------------------------------------------------------------------
  function startTour(index) {
    if (state.activeTab !== 'atlas') setActiveTab('atlas');
    state.tourActive = true;
    $('#tour-card').classList.remove('hidden');
    goToTourStop(index ?? 0);
  }

  function stopTour() {
    state.tourActive = false;
    state.tourAuto = false;
    clearInterval(state.tourTimer);
    state.tourTimer = null;
    $('#btn-tour-auto').textContent = txt().autoBtn;
    $('#tour-card').classList.add('hidden');
  }

  function renderTourCard() {
    const t = txt();
    const stops = D.TOUR_STOPS;
    const stop = stops[state.tourIndex];
    $('#tour-badge').textContent = `Stop ${stop.step} / ${stops.length} · ${loc(stop.badge)}`;
    $('#tour-title').textContent = loc(stop.title);
    $('#tour-summary').textContent = loc(stop.summary);
    $('#tour-takeaway').textContent = loc(stop.takeaway);
    $('#btn-tour-prev').textContent = t.prevBtn;
    $('#btn-tour-next').textContent = state.tourIndex === stops.length - 1 ? t.openLabEnd : t.nextBtn;
    $('#btn-tour-auto').textContent = state.tourAuto ? t.pauseAutoBtn : t.autoBtn;

    const dots = $('#tour-dots');
    dots.innerHTML = '';
    stops.forEach((s, i) => {
      const dot = document.createElement('div');
      dot.className = 'tour-dot' + (i === state.tourIndex ? ' active' : '');
      dot.addEventListener('click', () => goToTourStop(i));
      dots.appendChild(dot);
    });
  }

  function goToTourStop(idx) {
    const stops = D.TOUR_STOPS;
    state.tourIndex = Math.max(0, Math.min(stops.length - 1, idx));
    const stop = stops[state.tourIndex];
    selectAtlasFigure(stop.targetView);
    if (stop.camera && sceneMgr) {
      sceneMgr.flyTo(stop.camera.pos, stop.camera.target, 700);
    }
    renderTourCard();
  }

  function toggleTourAuto() {
    state.tourAuto = !state.tourAuto;
    $('#btn-tour-auto').textContent = state.tourAuto ? txt().pauseAutoBtn : txt().autoBtn;
    clearInterval(state.tourTimer);
    if (state.tourAuto) {
      state.tourTimer = setInterval(() => {
        if (state.tourIndex < D.TOUR_STOPS.length - 1) goToTourStop(state.tourIndex + 1);
        else toggleTourAuto();
      }, 5200);
    }
  }

  // --------------------------------------------------------------------------
  // Interactive Kinematics Lab
  // --------------------------------------------------------------------------
  function buildLabPresetButtons() {
    const wrap = $('#lab-presets');
    wrap.innerHTML = '';
    Object.values(D.LAB_PRESETS).forEach((preset) => {
      const btn = document.createElement('button');
      btn.className = 'preset-btn' + (state.activePresetId === preset.id ? ' active' : '');
      btn.dataset.preset = preset.id;
      btn.textContent = loc(preset.code);
      btn.addEventListener('click', () => loadPreset(preset.id));
      wrap.appendChild(btn);
    });
  }

  function syncSlidersToState() {
    $('#speed-slider').value = state.speed;
    $('#speed-val').textContent = `${state.speed.toFixed(1)}x`;

    $('#slider-wR').value = state.wankelR;
    $('#val-wR').textContent = state.wankelR;
    $('#slider-we').value = state.wankelE;
    $('#val-we').textContent = state.wankelE;
    $('#slider-wa').value = state.wankelA;
    $('#val-wa').textContent = state.wankelA;

    $('#slider-cN').value = state.cycloN;
    $('#val-cN').textContent = state.cycloN;
    $('#slider-cR').value = state.cycloRpinCircle;
    $('#val-cR').textContent = state.cycloRpinCircle;
    $('#slider-crp').value = state.cycloRpin;
    $('#val-crp').textContent = state.cycloRpin;
    $('#slider-ce').value = state.cycloE;
    $('#val-ce').textContent = state.cycloE.toFixed(1);

    $('#curve-type-select').value = state.curveType;
    $('#slider-R').value = state.R;
    $('#val-R').textContent = state.R;
    $('#slider-r').value = state.r;
    $('#val-r').textContent = state.r;
    $('#slider-d').value = state.d;
    $('#val-d').textContent = state.d;

    $$('.mode-params').forEach((el) => el.classList.add('hidden'));
    const activeParams = $(`#params-${state.mode}`);
    if (activeParams) activeParams.classList.remove('hidden');
  }

  function loadConfig(cfg, presetId = null) {
    state.activePresetId = presetId;
    state.mode = cfg.mode || 'wankel';
    state.speed = cfg.speed ?? state.speed;

    if (cfg.wankelR !== undefined) state.wankelR = cfg.wankelR;
    if (cfg.wankelE !== undefined) state.wankelE = cfg.wankelE;
    if (cfg.wankelA !== undefined) state.wankelA = cfg.wankelA;

    if (cfg.cycloN !== undefined) state.cycloN = cfg.cycloN;
    if (cfg.cycloRpinCircle !== undefined) state.cycloRpinCircle = cfg.cycloRpinCircle;
    if (cfg.cycloRpin !== undefined) state.cycloRpin = cfg.cycloRpin;
    if (cfg.cycloE !== undefined) state.cycloE = cfg.cycloE;

    if (cfg.R !== undefined) state.R = cfg.R;
    if (cfg.r !== undefined) state.r = cfg.r;
    if (cfg.d !== undefined) state.d = cfg.d;
    if (cfg.curveType !== undefined) state.curveType = cfg.curveType;

    state.theta = cfg.theta ?? 0;
    state.trailPoints = [];

    if (presetId && $('#preset-select option[value="' + presetId + '"]')) {
      $('#preset-select').value = presetId;
    }

    syncSlidersToState();
    buildLabPresetButtons();

    if (audio) audio.playGearTick(1.0);
    if (state.activeTab === 'lab' && sceneMgr) {
      sceneMgr.rebuildLiveMechanism(getLiveConfigSnapshot());
    }
    lastFormulaStr = '';
    updateTelemetry();
    render2DCanvases();
  }

  function loadPreset(presetId) {
    const p = D.LAB_PRESETS[presetId];
    if (!p) return;
    loadConfig(p.config, presetId);
  }

  function updateTelemetry() {
    const isDe = state.lang === 'de';
    const deg = ((state.theta * 180) / Math.PI) % 360;
    $('#badge-angle').textContent = `θ = ${deg.toFixed(1)}°`;

    let badgeMode = '';
    let badgeRatio = '';
    let formulaLatex = '';
    let kpiHtml = '';

    if (state.mode === 'wankel') {
      badgeMode = 'WANKEL 1:3';
      badgeRatio = isDe ? 'Drehzahl 1 : 3' : 'Rotor Ratio 1 : 3';
      formulaLatex = `x(\\alpha) = ${state.wankelE}\\cos(3\\alpha) + ${state.wankelR}\\cos(\\alpha) \\quad (a=${state.wankelA})`;
      const rRotDeg = ((state.theta / 3) * (180 / Math.PI)) % 360;
      const boreSpan = (state.wankelR + state.wankelE + state.wankelA) * 2;
      kpiHtml = `
        <div class="kpi-card"><div class="kpi-label">${isDe ? 'Welle θ' : 'Shaft θ'}</div><div class="kpi-val accent">${deg.toFixed(1)}°</div></div>
        <div class="kpi-card"><div class="kpi-label">${isDe ? 'Rotor θ/3' : 'Rotor θ/3'}</div><div class="kpi-val slate">${rRotDeg.toFixed(1)}°</div></div>
        <div class="kpi-card"><div class="kpi-label">${isDe ? 'Ratio' : 'Ratio'}</div><div class="kpi-val good">1 : 3</div></div>
        <div class="kpi-card"><div class="kpi-label">R / e</div><div class="kpi-val">${(state.wankelR / state.wankelE).toFixed(2)}</div></div>
        <div class="kpi-card"><div class="kpi-label">${isDe ? 'Achslänge' : 'Major Bore'}</div><div class="kpi-val">${boreSpan.toFixed(0)}</div></div>
        <div class="kpi-card"><div class="kpi-label">${isDe ? 'Spalt a' : 'Seal Gap a'}</div><div class="kpi-val">${state.wankelA}</div></div>
      `;
    } else if (state.mode === 'cycloid_drive') {
      badgeMode = isDe ? `ZYKLOID 1:${state.cycloN}` : `CYCLOID 1:${state.cycloN}`;
      badgeRatio = `i = 1 / ${state.cycloN}`;
      const K1 = state.cycloRpinCircle / (state.cycloE * (state.cycloN + 1));
      formulaLatex = `\\mathbf{c}(\\phi) = ${state.cycloRpinCircle}\\mathbf{e}_r - ${state.cycloE}\\mathbf{e}_{${state.cycloN + 1}\\phi} + ${state.cycloRpin}\\,\\hat{\\mathbf{n}}_{\\text{in}}`;
      const discDeg = ((-(state.theta / state.cycloN) * 180) / Math.PI + 360) % 360;
      kpiHtml = `
        <div class="kpi-card"><div class="kpi-label">${isDe ? 'Exzenter θ' : 'Cam θ'}</div><div class="kpi-val accent">${deg.toFixed(1)}°</div></div>
        <div class="kpi-card"><div class="kpi-label">${isDe ? 'Scheibe −θ/N' : 'Disc −θ/N'}</div><div class="kpi-val slate">${discDeg.toFixed(1)}°</div></div>
        <div class="kpi-card"><div class="kpi-label">${isDe ? 'Übersetzung' : 'Reduction'}</div><div class="kpi-val good">1 : ${state.cycloN}</div></div>
        <div class="kpi-card"><div class="kpi-label">${isDe ? 'Bolzen' : 'Pins'}</div><div class="kpi-val">${state.cycloN + 1}</div></div>
        <div class="kpi-card"><div class="kpi-label">K₁ &gt; 1</div><div class="kpi-val ${K1 > 1 ? 'good' : 'warn'}">${K1.toFixed(2)}</div></div>
        <div class="kpi-card"><div class="kpi-label">e / rp</div><div class="kpi-val">${state.cycloE} / ${state.cycloRpin}</div></div>
      `;
    } else {
      const info = M.getHarmonicInfo(state.R, state.r);
      const isHypo = state.curveType === 'hypo';
      badgeMode = isHypo ? 'HYPOTROCHOID' : 'EPITROCHOID';
      badgeRatio = `${info.cusps} : ${info.turns} (${isHypo ? 'HYPO' : 'EPI'})`;
      formulaLatex = isHypo
        ? `x = (${state.R}-${state.r})\\cos\\theta + ${state.d}\\cos\\!\\left(\\tfrac{${state.R - state.r}}{${state.r}}\\theta\\right)`
        : `x = (${state.R}+${state.r})\\cos\\theta - ${state.d}\\cos\\!\\left(\\tfrac{${state.R + state.r}}{${state.r}}\\theta\\right)`;
      const spd = M.getCurveSpeed(state.curveType, state.R, state.r, state.d, state.theta);
      kpiHtml = `
        <div class="kpi-card"><div class="kpi-label">${isDe ? 'Winkel θ' : 'Angle θ'}</div><div class="kpi-val accent">${deg.toFixed(1)}°</div></div>
        <div class="kpi-card"><div class="kpi-label">${isDe ? 'Bögen' : 'Lobes'}</div><div class="kpi-val slate">${info.cusps}</div></div>
        <div class="kpi-card"><div class="kpi-label">${isDe ? 'Umläufe' : 'Period Turns'}</div><div class="kpi-val good">${info.turns}</div></div>
        <div class="kpi-card"><div class="kpi-label">|dr/dθ|</div><div class="kpi-val">${spd.toFixed(0)}</div></div>
        <div class="kpi-card"><div class="kpi-label">d / r</div><div class="kpi-val">${(state.d / state.r).toFixed(2)}</div></div>
        <div class="kpi-card"><div class="kpi-label">${isDe ? 'Punkte' : 'Trail Pts'}</div><div class="kpi-val">${state.trailPoints.length}</div></div>
      `;
    }

    $('#badge-mode').textContent = badgeMode;
    $('#badge-ratio').textContent = badgeRatio;
    if (state.activeTab === 'lab') {
      $('#lab-kpis').innerHTML = kpiHtml;
    }

    if (formulaLatex !== lastFormulaStr) {
      lastFormulaStr = formulaLatex;
      const el = $('#telemetry-formula');
      if (global.katex) {
        try {
          global.katex.render(formulaLatex, el, { displayMode: false, throwOnError: false });
        } catch {
          el.textContent = formulaLatex;
        }
      } else {
        el.textContent = formulaLatex;
      }
    }
  }

  function render2DCanvases() {
    if (state.activeTab !== 'lab' || state.isEmbedded) return;
    C2D.renderKinematicsCanvas($('#canvas-slice'), state, state.trailPoints, state.lang);
    C2D.renderTelemetryPlotCanvas($('#canvas-plots'), state, state.lang);
  }

  // --------------------------------------------------------------------------
  // CAD DXF & SVG Export
  // --------------------------------------------------------------------------
  function getExportPointArrays() {
    if (state.mode === 'wankel') {
      const housing = M.getWankelHousingPoints(state.wankelE, state.wankelR, state.wankelA, 720);
      const rotor = M.getWankelRotor(state.wankelE, state.wankelR, 0);
      return {
        pointArrays: [housing, rotor.flankPoints],
        layerNames: ['WANKEL_HOUSING', 'WANKEL_ROTOR'],
      };
    }
    if (state.mode === 'cycloid_drive') {
      const disc = M.getCycloidDiscProfile(state.cycloN, state.cycloRpinCircle, state.cycloRpin, state.cycloE, 720);
      return {
        pointArrays: [disc],
        layerNames: ['CYCLOID_DISC'],
      };
    }
    const curve = M.generateCurve(state.curveType, state.R, state.r, state.d, 1440);
    return {
      pointArrays: [curve],
      layerNames: ['TROCHOID_CURVE'],
    };
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

  function handleExportDXF() {
    const { pointArrays, layerNames } = getExportPointArrays();
    const dxf = M.generateDXF(pointArrays, layerNames);
    if (audio) audio.playGearTick(1.3);
    downloadFile(dxf, `${state.mode}_profile.dxf`, 'application/dxf');
  }

  function handleExportSVG() {
    const { pointArrays } = getExportPointArrays();
    const isBlue = state.draftStyle === 'blueprint';
    const svg = M.generateSVG(
      pointArrays,
      isBlue ? ['#facc15', '#60a5fa'] : ['#d94426', '#181715'],
      600,
      600,
      isBlue ? '#0c2340' : '#faf5e8'
    );
    if (audio) audio.playGearTick(1.2);
    downloadFile(svg, `${state.mode}_vector.svg`, 'image/svg+xml');
  }

  // --------------------------------------------------------------------------
  // Editorial Views
  // --------------------------------------------------------------------------
  function buildEditorialViews() {
    const t = txt();
    const cGrid = $('#concepts-grid');
    cGrid.innerHTML = '';

    D.CONCEPTS.forEach((c) => {
      const card = document.createElement('article');
      card.className = 'concept-card';
      card.innerHTML = `
        <span class="kicker">${loc(c.tag)}</span>
        <h4>${loc(c.title)}</h4>
        <p>${loc(c.summary)}</p>
        <div class="concept-math"></div>
        <p>${loc(c.details)}</p>
        <button class="try-btn">${t.tryLabBtn}</button>
      `;
      const mathEl = card.querySelector('.concept-math');
      if (global.katex) {
        try {
          global.katex.render(c.latex, mathEl, { displayMode: true, throwOnError: false });
        } catch {
          mathEl.textContent = c.latex;
        }
      } else {
        mathEl.textContent = c.latex;
      }
      card.querySelector('.try-btn').addEventListener('click', () => {
        loadPreset(c.tryPreset);
        setActiveTab('lab');
      });
      cGrid.appendChild(card);
    });

    const bWrap = $('#book-paragraphs');
    bWrap.innerHTML = '';
    D.BOOK_PARAGRAPHS.forEach((p) => {
      const div = document.createElement('div');
      div.className = 'book-para';
      div.innerHTML = `
        <div class="book-para-head">
          <span class="book-para-tag">${p.page} · ${loc(p.label)}</span>
          <button class="book-jump-btn">${t.inspectBtn.replace('{code}', p.figureLink.toUpperCase())}</button>
        </div>
        <p>${loc(p.text)}</p>
      `;
      div.querySelector('.book-jump-btn').addEventListener('click', () => {
        setActiveTab('atlas');
        selectAtlasFigure(p.figureLink);
      });
      bWrap.appendChild(div);
    });

    const rbWrap = $('#reading-book-list');
    rbWrap.innerHTML = '';
    D.FURTHER_READING.bookLinks.forEach((item) => {
      const el = document.createElement('div');
      el.className = 'reading-card';
      el.innerHTML = `<div class="reading-meta">${loc(item.vol)}</div><h4>${loc(item.title)}</h4><p>${loc(item.note)}</p>`;
      rbWrap.appendChild(el);
    });

    const reWrap = $('#reading-external-list');
    reWrap.innerHTML = '';
    D.FURTHER_READING.externalLinks.forEach((item) => {
      const el = document.createElement('a');
      el.className = 'reading-card';
      el.href = item.url;
      el.target = '_blank';
      el.rel = 'noopener noreferrer';
      el.innerHTML = `<div class="reading-meta">${item.source} ↗</div><h4>${loc(item.title)}</h4><p>${loc(item.desc)}</p>`;
      reWrap.appendChild(el);
    });
  }

  // --------------------------------------------------------------------------
  // UI Bindings & 2D Pan/Zoom
  // --------------------------------------------------------------------------
  function setup2DCanvasInteraction() {
    const c2d = $('#canvas-slice');
    let panning = false;
    let startX = 0;
    let startY = 0;

    c2d.addEventListener('pointerdown', (e) => {
      panning = true;
      startX = e.clientX - state.panX;
      startY = e.clientY - state.panY;
      try { c2d.setPointerCapture(e.pointerId); } catch {}
    });

    c2d.addEventListener('pointermove', (e) => {
      if (!panning) return;
      state.panX = e.clientX - startX;
      state.panY = e.clientY - startY;
      render2DCanvases();
    });

    const endPan = (e) => {
      if (!panning) return;
      panning = false;
      try { c2d.releasePointerCapture(e.pointerId); } catch {}
    };
    c2d.addEventListener('pointerup', endPan);
    c2d.addEventListener('pointercancel', endPan);

    c2d.addEventListener('wheel', (e) => {
      e.preventDefault();
      const factor = e.deltaY < 0 ? 1.12 : 0.89;
      state.zoom = Math.max(0.35, Math.min(4.0, state.zoom * factor));
      render2DCanvases();
    }, { passive: false });
  }

  function bindUI() {
    $$('.tab-btn').forEach((btn) => {
      btn.addEventListener('click', () => setActiveTab(btn.dataset.tab));
    });

    $$('#lang-toggle-group .mini-btn').forEach((btn) => {
      btn.addEventListener('click', () => applyLanguage(btn.dataset.lang));
    });

    $('#btn-sound-toggle').addEventListener('click', (e) => {
      const on = audio.toggle();
      e.currentTarget.textContent = on ? '🔊' : '🔇';
      e.currentTarget.classList.toggle('muted', !on);
      if (on) audio.playGearTick(1.1);
    });

    $('#btn-overview').addEventListener('click', () => selectAtlasFigure('overview'));
    $('#select-figure').addEventListener('change', (e) => selectAtlasFigure(e.target.value));

    $('#btn-prev-fig').addEventListener('click', () => {
      if (state.atlasFigure === 'overview') {
        selectAtlasFigure('fig6');
      } else {
        const idx = D.FIGURE_ORDER.indexOf(state.atlasFigure);
        if (idx <= 0) selectAtlasFigure('overview');
        else selectAtlasFigure(D.FIGURE_ORDER[idx - 1]);
      }
    });

    $('#btn-next-fig').addEventListener('click', () => {
      if (state.atlasFigure === 'overview') {
        selectAtlasFigure('fig1');
      } else {
        const idx = D.FIGURE_ORDER.indexOf(state.atlasFigure);
        if (idx >= D.FIGURE_ORDER.length - 1) selectAtlasFigure('overview');
        else selectAtlasFigure(D.FIGURE_ORDER[idx + 1]);
      }
    });

    $$('#variant-ab-group .mini-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        state.variantAB = btn.dataset.ab;
        $$('#variant-ab-group .mini-btn').forEach((b) => b.classList.toggle('active', b === btn));
        refresh3DScene(true);
      });
    });

    $('#btn-start-tour').addEventListener('click', () => startTour(0));
    $('#btn-tour-close').addEventListener('click', stopTour);
    $('#btn-tour-prev').addEventListener('click', () => goToTourStop(state.tourIndex - 1));
    $('#btn-tour-next').addEventListener('click', () => {
      if (state.tourIndex === D.TOUR_STOPS.length - 1) {
        stopTour();
        loadPreset('wankel');
        setActiveTab('lab');
      } else {
        goToTourStop(state.tourIndex + 1);
      }
    });
    $('#btn-tour-auto').addEventListener('click', toggleTourAuto);

    $('#select-display-mode').addEventListener('change', (e) => {
      state.displayMode = e.target.value;
      refresh3DScene(false);
    });

    $('#btn-toggle-callouts').addEventListener('click', (e) => {
      state.showCallouts = !state.showCallouts;
      e.currentTarget.classList.toggle('active', state.showCallouts);
      refresh3DScene(false);
    });

    $('#btn-toggle-labels').addEventListener('click', (e) => {
      state.showLabels = !state.showLabels;
      e.currentTarget.classList.toggle('active', state.showLabels);
      refresh3DScene(false);
    });

    $('#btn-toggle-pitch').addEventListener('click', (e) => {
      state.showPitch = !state.showPitch;
      e.currentTarget.classList.toggle('active', state.showPitch);
      refresh3DScene(false);
    });

    $('#btn-reset-cam').addEventListener('click', () => {
      if (state.activeTab === 'lab') {
        sceneMgr.flyTo([0.0, 3.05, 3.45], [0.0, 0.0, 0.0], 550);
      } else if (state.atlasFigure === 'overview') {
        sceneMgr.flyTo([0.0, 6.9, 8.6], [0.0, -0.05, 0.0], 600);
      } else {
        const f = D.FIGURES[getActiveFigureId()];
        sceneMgr.flyTo(f.cameraFocus.pos, f.cameraFocus.target, 600);
      }
    });

    $$('#cam-presets-bar .cam-chip').forEach((btn) => {
      btn.addEventListener('click', () => {
        const isOverview = state.activeTab === 'atlas' && state.atlasFigure === 'overview';
        const dist = isOverview ? 9.2 : 4.2;
        const target = isOverview ? [0.0, -0.05, 0.0] : [0.0, 0.0, 0.0];
        const m = btn.dataset.cam;
        if (m === 'top') sceneMgr.flyTo([0.0, dist * 1.05, 0.12], target, 550);
        else if (m === 'front') sceneMgr.flyTo([0.0, 0.95, dist], target, 550);
        else if (m === 'side') sceneMgr.flyTo([dist * 0.55, dist * 0.65, dist * 0.72], target, 550);
        else sceneMgr.flyTo(isOverview ? [0.0, 6.9, 8.6] : [0.0, 3.05, 3.45], target, 550);
      });
    });

    $('#btn-open-in-lab').addEventListener('click', () => {
      const aid = getActiveFigureId();
      if (aid === 'overview') {
        loadPreset('wankel');
      } else {
        loadConfig(D.FIGURES[aid].config, null);
      }
      setActiveTab('lab');
    });

    // Lab Controls
    $('#preset-select').addEventListener('change', (e) => loadPreset(e.target.value));

    $('#btn-play-pause').addEventListener('click', (e) => {
      state.isRunning = !state.isRunning;
      const t = txt();
      e.currentTarget.textContent = state.isRunning ? t.btnPlayPauseRun : t.btnPlayPauseStop;
      e.currentTarget.classList.toggle('active', !state.isRunning);
      if (!state.isRunning && audio) audio.stopEngine();
    });

    $('#btn-reset').addEventListener('click', () => {
      state.theta = 0;
      state.trailPoints = [];
      if (sceneMgr) sceneMgr.updateLiveMotion(state.theta, state.trailPoints);
      updateTelemetry();
      render2DCanvases();
    });

    $('#btn-recenter').addEventListener('click', () => {
      state.panX = 0;
      state.panY = 0;
      state.zoom = 1.0;
      render2DCanvases();
    });

    $('#speed-slider').addEventListener('input', (e) => {
      state.speed = parseFloat(e.target.value);
      $('#speed-val').textContent = `${state.speed.toFixed(1)}x`;
    });

    $('#style-select').addEventListener('change', (e) => {
      state.draftStyle = e.target.value;
      render2DCanvases();
    });

    // Trochoid Sliders
    $('#curve-type-select').addEventListener('change', (e) => {
      state.curveType = e.target.value;
      state.trailPoints = [];
      state.activePresetId = null;
      buildLabPresetButtons();
      refresh3DScene(false);
    });

    $('#slider-R').addEventListener('input', (e) => {
      state.R = parseFloat(e.target.value);
      $('#val-R').textContent = state.R;
      state.trailPoints = [];
      state.activePresetId = null;
      buildLabPresetButtons();
      refresh3DScene(false);
    });

    $('#slider-r').addEventListener('input', (e) => {
      state.r = parseFloat(e.target.value);
      $('#val-r').textContent = state.r;
      state.trailPoints = [];
      state.activePresetId = null;
      buildLabPresetButtons();
      refresh3DScene(false);
    });

    $('#slider-d').addEventListener('input', (e) => {
      state.d = parseFloat(e.target.value);
      $('#val-d').textContent = state.d;
      state.trailPoints = [];
      state.activePresetId = null;
      buildLabPresetButtons();
      refresh3DScene(false);
    });

    // Wankel Sliders
    $('#slider-wR').addEventListener('input', (e) => {
      state.wankelR = parseFloat(e.target.value);
      $('#val-wR').textContent = state.wankelR;
      state.activePresetId = null;
      buildLabPresetButtons();
      refresh3DScene(false);
    });

    $('#slider-we').addEventListener('input', (e) => {
      state.wankelE = parseFloat(e.target.value);
      $('#val-we').textContent = state.wankelE;
      state.activePresetId = null;
      buildLabPresetButtons();
      refresh3DScene(false);
    });

    $('#slider-wa').addEventListener('input', (e) => {
      state.wankelA = parseFloat(e.target.value);
      $('#val-wa').textContent = state.wankelA;
      state.activePresetId = null;
      buildLabPresetButtons();
      refresh3DScene(false);
    });

    // Cycloid Drive Sliders
    $('#slider-cN').addEventListener('input', (e) => {
      state.cycloN = parseInt(e.target.value, 10);
      $('#val-cN').textContent = state.cycloN;
      state.activePresetId = null;
      buildLabPresetButtons();
      refresh3DScene(false);
    });

    $('#slider-cR').addEventListener('input', (e) => {
      state.cycloRpinCircle = parseFloat(e.target.value);
      $('#val-cR').textContent = state.cycloRpinCircle;
      state.activePresetId = null;
      buildLabPresetButtons();
      refresh3DScene(false);
    });

    $('#slider-crp').addEventListener('input', (e) => {
      state.cycloRpin = parseFloat(e.target.value);
      $('#val-crp').textContent = state.cycloRpin;
      state.activePresetId = null;
      buildLabPresetButtons();
      refresh3DScene(false);
    });

    $('#slider-ce').addEventListener('input', (e) => {
      state.cycloE = parseFloat(e.target.value);
      $('#val-ce').textContent = state.cycloE.toFixed(1);
      state.activePresetId = null;
      buildLabPresetButtons();
      refresh3DScene(false);
    });

    // CAD Exports
    $('#btn-export-dxf').addEventListener('click', handleExportDXF);
    $('#btn-export-svg').addEventListener('click', handleExportSVG);

    window.addEventListener('keydown', (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;
      if (state.tourActive && e.key === 'ArrowRight') {
        goToTourStop(state.tourIndex + 1);
      } else if (state.tourActive && e.key === 'ArrowLeft') {
        goToTourStop(state.tourIndex - 1);
      }
    });
  }

  function startLoop() {
    let lastTs = performance.now();
    function tick(now) {
      const dt = Math.max(0, Math.min(((now || performance.now()) - lastTs) / 1000, 0.05));
      lastTs = now || performance.now();

      if (state.activeTab === 'atlas') {
        state.idleTheta += dt * 0.72;
        sceneMgr.stepAndRender(state.idleTheta);
      } else if (state.activeTab === 'lab') {
        if (state.isRunning) {
          state.theta += dt * 1.5 * state.speed;
          if (state.theta > 1000 * Math.PI) state.theta = 0;

          if (state.mode === 'trochoid') {
            const pt = state.curveType === 'hypo'
              ? M.getHypotrochoidPoint(state.R, state.r, state.d, state.theta)
              : M.getEpitrochoidPoint(state.R, state.r, state.d, state.theta);
            state.trailPoints.push(pt);
            if (state.trailPoints.length > state.maxTrail) state.trailPoints.shift();
          }

          if (audio && audio.enabled && state.mode === 'wankel') {
            audio.setEngineSpeed(state.speed * 180);
          } else if (audio && state.mode !== 'wankel') {
            audio.stopEngine();
          }
        }

        sceneMgr.updateLiveMotion(state.theta, state.trailPoints);
        sceneMgr.stepAndRender();
        updateTelemetry();
        render2DCanvases();
      }
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  function init() {
    if (window.self !== window.top || window.location.search.includes('embed') || window.location.hash.includes('embed')) {
      state.isEmbedded = true;
      document.body.classList.add('is-embedded');
    }

    audio = new A();
    sceneMgr = new S3D.CycloidSceneManager(
      $('#three-container'),
      handleProjectedCallouts,
      (fid) => {
        if (state.activeTab === 'atlas' && D.FIGURES[fid]) {
          selectAtlasFigure(fid);
        }
      }
    );

    setup2DCanvasInteraction();
    bindUI();
    loadPreset('wankel');
    applyLanguage(state.lang);

    if (state.isEmbedded) {
      setActiveTab('lab');
    } else {
      refresh3DScene(true);
    }
    startLoop();
  }

  window.addEventListener('DOMContentLoaded', init);
})(window);
