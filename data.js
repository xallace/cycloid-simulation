/* ==========================================================================
   data.js — Curated Cycloid & Planetary Kinematics Book Plates (Figs. 1–6),
             Call-Outs, 6-Stop Tour, KaTeX Concepts, Book Notes & EN/DE
   ========================================================================== */
(function (global) {
  'use strict';

  const FIGURE_ORDER = ['fig1', 'fig2', 'fig3', 'fig4', 'fig5', 'fig6'];
  const OVERVIEW_IDS = ['fig1', 'fig2b', 'fig3b', 'fig4b', 'fig5', 'fig6'];
  const PAIRED_FIGURES = ['fig2', 'fig3', 'fig4'];

  function resolveVariantId(figKey, variantAB) {
    if (FIGURES[figKey]) return figKey;
    return `${figKey}${variantAB === 'a' ? 'a' : 'b'}`;
  }

  const FIGURES = {
    fig1: {
      id: 'fig1',
      plate: { en: 'Plate I', de: 'Tafel I' },
      code: 'FIG. 1',
      category: { en: 'Wankel 1:3 Trochoid', de: 'Wankel-Trochoide 1:3' },
      name: {
        en: 'Wankel Rotary Engine (2-Lobed Epitrochoid & 1:3 Rotor)',
        de: 'Wankel-Kreiskolbenmotor (Epitrochoide & 1:3-Rotor)',
      },
      subtitle: {
        en: 'x(α) = e cos(3α) + R cos(α) · Generating Radius R=140, e=20, Seal Offset a=6',
        de: 'x(α) = e cos(3α) + R cos(α) · Erzeugender Radius R=140, e=20, Spalt a=6',
      },
      summary: {
        en: 'Felix Wankel’s rotary piston housing follows an outward parallel envelope of a two-lobed epitrochoid. As the eccentric crank sweeps angle θ, the triangular Reuleaux rotor turns at θ/3 so all three apex seals stay continuously tangent to the bore.',
        de: 'Das Gehäuse des Wankelmotors bildet die Äquidistante einer zweibogigen Epitrochoide. Während der Exzenter den Winkel θ überstreicht, dreht der Kreiskolben mit θ/3, sodass alle drei Dichtleisten stets an der Laufbahn anliegen.',
      },
      bookPage: { en: 'Peritrochoid Bore', de: 'Trochoiden-Laufbahn' },
      bookNote: {
        en: 'Because the housing waist pinches gently toward a two-lobed epitrochoid while the 3-flank rotor orbits eccentrically, three sealed variable-volume chambers execute intake, compression, ignition, and exhaust in every shaft revolution.',
        de: 'Durch die leichte Einschnürung der Zweibogentrochoide bildet der exzentrisch laufende Dreikantläufer drei veränderliche Arbeitskammern für Ansaugen, Verdichten, Zünden und Ausstoßen.',
      },
      config: { mode: 'wankel', wankelR: 140, wankelE: 20, wankelA: 6, theta: 0.72, speed: 0.8 },
      cameraFocus: { pos: [0.0, 3.05, 3.45], target: [0.0, 0.0, 0.0] },
      callouts: [
        {
          id: 'f1_housing',
          anchor: [0.0, 0.16, -0.82],
          badge: { en: 'Parallel Envelope', de: 'Äquidistante' },
          title: { en: 'Epitrochoid Bore (+a Offset)', de: 'Trochoiden-Gehäuse (+a)' },
          body: {
            en: 'Generated via outward normal offset a = 6 mm around x = e cos(3α) + R cos(α) for apex nose curvature.',
            de: 'Nach außen um den Dichtleistenradius a = 6 mm versetzte Äquidistante für korrekte Spitzengeometrie.',
          },
        },
        {
          id: 'f1_rotor',
          anchor: [0.68, 0.18, 0.12],
          badge: { en: 'ω = ω_shaft / 3', de: 'ω = ω_Welle / 3' },
          title: { en: '1:3 Triangular Rotor & Apex Seal', de: 'Dreikantläufer & Dichtleiste' },
          body: {
            en: 'Three circular Reuleaux flanks join apex seals spaced 120° apart around the eccentric crankpin.',
            de: 'Drei kreisbogenförmige Flanken verbinden die drei um 120° versetzten Dichtleisten.',
          },
        },
        {
          id: 'f1_spark',
          anchor: [-1.14, 0.16, 0.0],
          badge: { en: 'Ignition Waist', de: 'Zündkerze (Brennraum)' },
          title: { en: 'Pinch Waist Ignition Port', de: 'Brennraum-Einschnürung' },
          body: {
            en: 'Spark plug fires at the narrow minor-axis pinch where chamber volume reaches its minimum.',
            de: 'Zündung an der Gehäuse-Einschnürung bei minimalem Kammervolumen.',
          },
        },
      ],
    },

    fig2a: {
      id: 'fig2a',
      pairId: 'fig2',
      variant: 'a',
      plate: { en: 'Plate II', de: 'Tafel II' },
      code: 'FIG. 2a',
      category: { en: 'Cyclo Drive · 10:1', de: 'Zykloidgetriebe 10:1' },
      name: {
        en: 'Robotics Cycloid Reducer (N = 10 Lobes · 11 Pins)',
        de: 'Roboter-Zykloidgetriebe (N = 10 Nocken · 11 Bolzen)',
      },
      subtitle: {
        en: 'Single-Stage Reduction i = 1/N = 1:10 · Zero-Backlash Roller Engagement',
        de: 'Einstufige Übersetzung i = 1:10 · Spielfreier Rolleneingriff',
      },
      summary: {
        en: 'An eccentric cam drives a 10-lobed cycloidal disc inside 11 stationary ring rollers. Each full turn of the input eccentric advances the disc backward by exactly one lobe—giving a 10:1 reduction with multi-tooth load sharing.',
        de: 'Ein Exzenter bewegt eine 10-bogige Kurvenscheibe innerhalb von 11 gehäusefesten Ringbolzen. Jede volle Exzenterumdrehung dreht die Scheibe um exakt einen Bogen zurück – Untersetzung 10:1.',
      },
      bookPage: { en: 'Braren Cyclo Principle', de: 'Braren-Zykloidenprinzip' },
      bookNote: {
        en: 'Lorenz Braren invented the Cyclo drive in 1925: replacing sliding involute teeth with rolling contact against circular pins slashes wear and torsional backlash in robot joints.',
        de: 'Das 1925 von Lorenz Braren patentierte Prinzip ersetzt gleitende Evolventenzähne durch rollenden Bolzenkontakt und eliminiert Umkehrspiel.',
      },
      config: { mode: 'cycloid_drive', cycloN: 10, cycloRpinCircle: 150, cycloRpin: 10, cycloE: 6, theta: 0.9, speed: 0.6 },
      cameraFocus: { pos: [0.0, 3.05, 3.45], target: [0.0, 0.0, 0.0] },
      callouts: [
        {
          id: 'f2a_pins',
          anchor: [1.06, 0.16, 0.0],
          badge: { en: 'N + 1 = 11 Pins', de: 'N + 1 = 11 Bolzen' },
          title: { en: 'Stationary Roller Ring', de: 'Feststehender Bolzenring' },
          body: {
            en: 'Eleven hardened outer rollers engage nearly half of the 10-lobed disc simultaneously.',
            de: 'Elf Außenbolzen greifen stets gleichzeitig auf etwa der halben Scheibenseite.',
          },
        },
      ],
    },

    fig2b: {
      id: 'fig2b',
      pairId: 'fig2',
      variant: 'b',
      plate: { en: 'Plate II', de: 'Tafel II' },
      code: 'FIG. 2b',
      category: { en: 'Cyclo Drive · 15:1', de: 'Zykloidgetriebe 15:1' },
      name: {
        en: 'High-Reduction Robotics Cycloid Drive (N = 15 Lobes · 16 Pins)',
        de: 'Hochuntersetztes Zykloidgetriebe (N = 15 Nocken · 16 Bolzen)',
      },
      subtitle: {
        en: 'Reduction i = 1:15 · Inward Equidistant Roller Envelope',
        de: 'Untersetzung 1:15 · Einwärts versetzte Äquidistante',
      },
      summary: {
        en: 'Increasing the lobe count from N=10 to N=15 with 16 outer rollers increases single-stage torque multiplication to 15:1 while maintaining strict non-undercutting margin K₁ = R / [e(N+1)] > 1.',
        de: 'Die Erhöhung auf N=15 Nocken und 16 Außenbolzen steigert die einstufige Untersetzung auf 15:1 unter Einhaltung der Unterschnittgrenze K₁ = R / [e(N+1)] > 1.',
      },
      bookPage: { en: 'Equidistant Disc Profile', de: 'Äquidistanten-Profil' },
      bookNote: {
        en: 'In disc coordinates, every stationary roller traces x₀ = R cos φ − e cos((N+1)φ). Offsetting inward along the curve normal by r_pin produces exact tangent contact across all 360°.',
        de: 'Im Scheibensystem beschreibt jeder Bolzen x₀ = R cos φ − e cos((N+1)φ). Der Normalenversatz um −r_pin liefert berührgenaue Kurvenscheiben.',
      },
      config: { mode: 'cycloid_drive', cycloN: 15, cycloRpinCircle: 160, cycloRpin: 8, cycloE: 4.5, theta: 0.9, speed: 0.5 },
      cameraFocus: { pos: [0.0, 3.05, 3.45], target: [0.0, 0.0, 0.0] },
      callouts: [
        {
          id: 'f2b_disc',
          anchor: [0.55, 0.17, -0.58],
          badge: { en: 'i = −1 / 15', de: 'i = −1 / 15' },
          title: { en: '15-Lobe Cycloidal Cam Disc', de: '15-bogige Kurvenscheibe' },
          body: {
            en: 'Exports directly as a closed AC1009 DXF polyline (CYCLOID_DISC) for CNC machining or 3D printing.',
            de: 'Direkt als geschlossene DXF-Polylinie (CYCLOID_DISC) für CNC-Fertigung exportierbar.',
          },
        },
        {
          id: 'f2b_holes',
          anchor: [-0.42, 0.16, 0.0],
          badge: { en: '6 Output Bores', de: '6 Abtriebs-Bohrungen' },
          title: { en: 'Slow-Shaft Torque Pin Ring', de: 'Abtriebs-Mitnehmerlöcher' },
          body: {
            en: 'Internal circular bores transmit pure −θ/15 slow rotation out while cancelling the radial eccentric wobble.',
            de: 'Innenbohrungen leiten die langsame −θ/15-Drehung ab und entkoppeln die Exzenter-Taumelbewegung.',
          },
        },
      ],
    },

    fig3a: {
      id: 'fig3a',
      pairId: 'fig3',
      variant: 'a',
      plate: { en: 'Plate III', de: 'Tafel III' },
      code: 'FIG. 3a',
      category: { en: 'Cardioid · 1:1 Epi', de: 'Kardioide · 1:1 Epi' },
      name: {
        en: 'Cardioid (Heart Curve · 1:1 Epicycloid)',
        de: 'Kardioide (Herzkurve · 1:1 Epizykloide)',
      },
      subtitle: {
        en: 'R = 60, r = 60, d = 60 · One Sharp Cusp at θ = 0',
        de: 'R = 60, r = 60, d = 60 · Eine scharfe Spitze bei θ = 0',
      },
      summary: {
        en: 'When a rolling circle rotates around an equal fixed circle (R = r) with tracing radius d = r, a rim point pauses momentarily with zero velocity at θ = 0—tracing the classic heart-shaped Cardioid.',
        de: 'Rollt ein Kreis außen auf einem gleich großen Grundkreis (R = r, d = r), kommt der Punkt bei θ = 0 momentan zur Ruhe und zeichnet die klassische Herzkurve (Kardioide).',
      },
      bookPage: { en: '1:1 Caustic Reflection', de: '1:1-Brennlinie' },
      bookNote: {
        en: 'The Cardioid also appears optically as the bright coffee-cup caustic formed by rays reflecting inside a circular mirror.',
        de: 'Die Kardioide erscheint auch als helle Kaustik-Linie bei Lichtreflexion in einer zylindrischen Tasse.',
      },
      config: { mode: 'trochoid', curveType: 'epi', R: 60, r: 60, d: 60, theta: 4.5, speed: 1.0 },
      cameraFocus: { pos: [0.0, 3.05, 3.45], target: [0.0, 0.0, 0.0] },
      callouts: [
        {
          id: 'f3a_cusp',
          anchor: [0.35, 0.14, 0.0],
          badge: { en: 'v(0) = 0 Cusp', de: 'v(0) = 0 Spitze' },
          title: { en: 'Singular Instantaneous Center', de: 'Momentanpol-Umkehrspitze' },
          body: {
            en: 'Because d = r, the tracing stylus touches the pitch contact point once per turn and reverses direction sharply.',
            de: 'Für d = r berührt der Stift den Wälzpunkt genau einmal je Umlauf mit Geschwindigkeits-Nullstelle.',
          },
        },
      ],
    },

    fig3b: {
      id: 'fig3b',
      pairId: 'fig3',
      variant: 'b',
      plate: { en: 'Plate III', de: 'Tafel III' },
      code: 'FIG. 3b',
      category: { en: 'Nephroid · 2:1 Epi', de: 'Nephroide · 2:1 Epi' },
      name: {
        en: 'Nephroid (Two-Cusped Epicycloid · R : r = 2 : 1)',
        de: 'Nephroide (Nierenkurve · R : r = 2 : 1)',
      },
      subtitle: {
        en: 'R = 80, r = 40, d = 40 · Two Symmetric Cusps (Opposite Poles)',
        de: 'R = 80, r = 40, d = 40 · Zwei symmetrische Umkehrspitzen',
      },
      summary: {
        en: 'Rolling a half-radius circle (r = R/2) outside a base circle generates two diametrically opposed cusps per closed loop—named Nephroid ("kidney-shaped") by Proctor in 1878.',
        de: 'Ein halb so großer Außenrollkreis (r = R/2) erzeugt zwei gegenüberliegende Spitzen je geschlossener Bahn – 1878 als Nephroide („nierenförmig“) benannt.',
      },
      bookPage: { en: 'Frequency Ratio k = R/r', de: 'Frequenzverhältnis R/r' },
      bookNote: {
        en: 'With R = 2r, the rolling planet makes R/r + 1 = 3 inertial turns per orbital circuit, carving exactly R/gcd(R,r) = 2 cusps.',
        de: 'Bei R = 2r dreht sich das Umlaufrad (R+r)/r = 3-mal je Vollkreis und bildet exakt 2 Spitzen.',
      },
      config: { mode: 'trochoid', curveType: 'epi', R: 80, r: 40, d: 40, theta: 4.8, speed: 1.0 },
      cameraFocus: { pos: [0.0, 3.05, 3.45], target: [0.0, 0.0, 0.0] },
      callouts: [
        {
          id: 'f3b_lobe',
          anchor: [0.0, 0.14, -0.82],
          badge: { en: '2 Cusps · R=2r', de: '2 Spitzen · R=2r' },
          title: { en: 'External Twin Epitrochoid Lobes', de: 'Äußere Epizykloiden-Bögen' },
          body: {
            en: 'Maximum radius reaches R + 2r = 160 while cusps dip down to base circle R = 80.',
            de: 'Maximalradius erreicht R + 2r = 160; die Spitzen berühren den Grundkreis bei R = 80.',
          },
        },
        {
          id: 'f3b_arm',
          anchor: [0.64, 0.14, 0.25],
          badge: { en: 'r = 40 · d = 40', de: 'r = 40 · d = 40' },
          title: { en: 'Rolling Planet & Trace Stylus', de: 'Rollender Planet & Zeichenstift' },
          body: {
            en: 'Rolling without slipping matches arc R·θ = r·φ along the base circumference.',
            de: 'Schlupffreies Abrollen erzwingt Bogenlängengleichheit R·θ = r·φ.',
          },
        },
      ],
    },

    fig4a: {
      id: 'fig4a',
      pairId: 'fig4',
      variant: 'a',
      plate: { en: 'Plate IV', de: 'Tafel IV' },
      code: 'FIG. 4a',
      category: { en: 'Deltoid · 3:1 Hypo', de: 'Deltoide · 3:1 Hypo' },
      name: {
        en: 'Deltoid (Tricuspoid Hypocycloid · R : r = 3 : 1)',
        de: 'Deltoide (Dreieck-Hypozykloide · R : r = 3 : 1)',
      },
      subtitle: {
        en: 'R = 120, r = 40, d = 40 · Three Inward Cusps inside Fixed Circle',
        de: 'R = 120, r = 40, d = 40 · Drei Spitzen im Innern des Grundkreises',
      },
      summary: {
        en: 'Rolling a circle of radius r = R/3 inside a stationary ring traces the 3-cusped Deltoid—whose tangent segments always have constant length (the envelope of Simson lines of a triangle).',
        de: 'Rollt ein Kreis mit r = R/3 innen im Grundkreis ab, entsteht die dreispitzige Deltoide (Steiner-Hypozykloide) – Hüllkurve der Simson-Geraden.',
      },
      bookPage: { en: 'Steiner’s Hypocycloid', de: 'Steiner-Kurve (1856)' },
      bookNote: {
        en: 'A rod of length 4r whose endpoints slide along a Deltoid rotates smoothly inside—related to Kakeya’s famous needle-turning problem.',
        de: 'Alle Tangentenabschnitte zwischen zwei Ästen der Deltoide haben konstante Länge 4r.',
      },
      config: { mode: 'trochoid', curveType: 'hypo', R: 120, r: 40, d: 40, theta: 5.4, speed: 1.0 },
      cameraFocus: { pos: [0.0, 3.05, 3.45], target: [0.0, 0.0, 0.0] },
      callouts: [
        {
          id: 'f4a_cusp',
          anchor: [0.88, 0.14, 0.0],
          badge: { en: '3 Cusps (120°)', de: '3 Spitzen (120°)' },
          title: { en: 'Internal Rolling Tricuspoid', de: 'Dreispitzige Hypozykloide' },
          body: {
            en: 'Because rolling happens inside R, the pinion spins opposite (-2θ) to its orbital center.',
            de: 'Durch Innenabrollen dreht der Planet entgegengesetzt (-2θ) zur Bahndrehung.',
          },
        },
      ],
    },

    fig4b: {
      id: 'fig4b',
      pairId: 'fig4',
      variant: 'b',
      plate: { en: 'Plate IV', de: 'Tafel IV' },
      code: 'FIG. 4b',
      category: { en: 'Astroid · 4:1 Hypo', de: 'Astroide · 4:1 Hypo' },
      name: {
        en: 'Astroid (Four-Cusped Star · R : r = 4 : 1)',
        de: 'Astroide (Sternkurve · R : r = 4 : 1)',
      },
      subtitle: {
        en: 'R = 120, r = 30, d = 30 · x^(2/3) + y^(2/3) = R^(2/3)',
        de: 'R = 120, r = 30, d = 30 · x^(2/3) + y^(2/3) = R^(2/3)',
      },
      summary: {
        en: 'Setting r = R/4 and d = r reduces the hypotrochoid equations to x = R cos³θ, y = R sin³θ—the classical Astroid, also famously formed as the envelope of a sliding ladder of fixed length R against two perpendicular walls.',
        de: 'Für r = R/4 und d = r vereinfacht sich die Hypotrochoiden-Formel zu x = R cos³θ, y = R sin³θ – der klassischen Sternkurve (Astroide) einer abrutschenden Leiter.',
      },
      bookPage: { en: 'Sliding Ladder Envelope', de: 'Leiter-Hüllkurve' },
      bookNote: {
        en: 'By Double Generation (Euler), the same Astroid arises from rolling a circle of radius r = R/4 OR a circle of radius 3R/4 inside the base circle R.',
        de: 'Nach dem Satz der doppelten Erzeugung liefert sowohl r = R/4 als auch r = 3R/4 exakt dieselbe Astroide.',
      },
      config: { mode: 'trochoid', curveType: 'hypo', R: 120, r: 30, d: 30, theta: 5.7, speed: 1.0 },
      cameraFocus: { pos: [0.0, 3.05, 3.45], target: [0.0, 0.0, 0.0] },
      callouts: [
        {
          id: 'f4b_star',
          anchor: [0.95, 0.14, 0.0],
          badge: { en: '4 Axis Cusps', de: '4 Achsenspitzen' },
          title: { en: 'Cos³θ / Sin³θ Superellipse', de: 'Cos³θ / Sin³θ-Spitze' },
          body: {
            en: 'Total enclosed area equals (3/8)πR² and total arc length equals exactly 6R.',
            de: 'Die Gesamtfläche beträgt exakt (3/8)πR² und die geschlossene Bogenlänge exakt 6R.',
          },
        },
        {
          id: 'f4b_ring',
          anchor: [-0.62, 0.14, -0.62],
          badge: { en: 'R = 4r', de: 'R = 4r' },
          title: { en: '4:1 Planetary Ring Gear Pitch', de: '4:1-Hohlrad-Verhältnis' },
          body: {
            en: 'Planetary pinion (r=30) orbits inside stationary outer ring (R=120) without slip.',
            de: 'Das Planetenrad (r=30) wälzt schlupffrei im Innern des 4-mal größeren Hohlrads ab.',
          },
        },
      ],
    },

    fig5: {
      id: 'fig5',
      plate: { en: 'Plate V', de: 'Tafel V' },
      code: 'FIG. 5',
      category: { en: 'Spirograph · GCD Period', de: 'Spirograph · ggT-Periode' },
      name: {
        en: 'Spirograph Harmonic Rosette (R=140, r=52, d=85)',
        de: 'Spirograph-Harmonierose (R=140, r=52, d=85)',
      },
      subtitle: {
        en: 'gcd(140, 52) = 4 → 35 Lobes over 13 Orbital Circuits (Prolate d > r)',
        de: 'ggT(140, 52) = 4 → 35 Bögen in 13 Umläufen (Verlängert d > r)',
      },
      summary: {
        en: 'Non-integer gear ratios R/r = 35/13 weave intricate harmonic rosettes that close only after denominator 13 full revolutions of the rolling carrier.',
        de: 'Nicht-ganzzahlige Radienverhältnisse R/r = 35/13 erzeugen geschlossene Rosetten, die sich erst nach exakt 13 Vollumläufen schließen.',
      },
      bookPage: { en: 'Closure via gcd(R, r)', de: 'Periodenschluss per ggT' },
      bookNote: {
        en: 'Closure requires θ_max = 2π · [r / gcd(R, r)]. Here gcd(140, 52) = 4 yields 13 carrier revolutions and 35 radial symmetry axes.',
        de: 'Geschlossenheit gilt nach θ_max = 2π · [r / ggT(R, r)]: Bei ggT(140,52)=4 ergeben sich 13 Umläufe und 35 Symmetrieachsen.',
      },
      config: { mode: 'trochoid', curveType: 'hypo', R: 140, r: 52, d: 85, theta: 81.6, speed: 1.4 },
      cameraFocus: { pos: [0.0, 3.05, 3.45], target: [0.0, 0.0, 0.0] },
      callouts: [
        {
          id: 'f5_outer',
          anchor: [0.95, 0.14, 0.0],
          badge: { en: '35 Petals', de: '35 Blütenbögen' },
          title: { en: 'Rational Coprime Harmonics', de: 'Teilerfremdes Radienverhältnis' },
          body: {
            en: 'Radial envelope spans from |R − r − d| = 3 inner core up to (R − r) + d = 173 outer tips.',
            de: 'Die Einhüllende spannt vom inneren Kernradius |R − r − d| bis zur äußeren Spitze (R − r) + d.',
          },
        },
        {
          id: 'f5_inner',
          anchor: [-0.32, 0.14, 0.25],
          badge: { en: '13 Turns', de: '13 Umläufe' },
          title: { en: 'Exact Multi-Turn Closure', de: 'Exakter Periodenschluss' },
          body: {
            en: 'Prolate trace arm d = 85 > r = 52 reaches outside the rolling wheel circumference to create dense inner weaving.',
            de: 'Der verlängerte Hebel d = 85 > r = 52 greift über das Rollrad hinaus und flicht dichte Innenschlaufen.',
          },
        },
      ],
    },

    fig6: {
      id: 'fig6',
      plate: { en: 'Plate VI', de: 'Tafel VI' },
      code: 'FIG. 6',
      category: { en: 'Prolate Loops (d > r)', de: 'Verschlungene Schleifen' },
      name: {
        en: 'Prolate Hypotrochoid Cross-Over Loops (d > r)',
        de: 'Verlängerte Hypotrochoide mit Innenschleifen (d > r)',
      },
      subtitle: {
        en: 'R = 100, r = 25, d = 42 · Extending Trace Radius Beyond Rim',
        de: 'R = 100, r = 25, d = 42 · Schreibarm länger als Rollradius',
      },
      summary: {
        en: 'Contrasting with the sharp cusps of d = r (Astroid), choosing d > r makes the stylus move backward momentarily near the base circle—turning every sharp cusp into an open loop.',
        de: 'Im Gegensatz zur scharfen Spitze bei d = r führt d > r zu rückläufigen Momentangeschwindigkeiten – jede Spitze öffnet sich zu einer Schleife.',
      },
      bookPage: { en: 'Curtate vs. Prolate', de: 'Gestreckt vs. Verschlungen' },
      bookNote: {
        en: 'Curtate (d < r) stays strictly smooth without self-intersection; Common (d = r) forms cusps; Prolate (d > r) forms self-intersecting loops used in orbital pump cams.',
        de: 'Gestreckt (d < r) bleibt glatt ohne Überschneidung; gewöhnlich (d = r) bildet Spitzen; verschlungen (d > r) bildet Schleifen.',
      },
      config: { mode: 'trochoid', curveType: 'hypo', R: 100, r: 25, d: 42, theta: 6.28, speed: 1.0 },
      cameraFocus: { pos: [0.0, 3.05, 3.45], target: [0.0, 0.0, 0.0] },
      callouts: [
        {
          id: 'f6_loop',
          anchor: [0.92, 0.14, 0.0],
          badge: { en: 'd > r Loop', de: 'Schleife (d > r)' },
          title: { en: 'Retrograde Velocity Loop', de: 'Rückläufige Schleife' },
          body: {
            en: 'Because trace distance d=42 exceeds pinion radius r=25, tangent speed reverses past radius R.',
            de: 'Weil der Hebel d=42 größer als r=25 ist, kehrt die Bahngeschwindigkeit am Scheitel um.',
          },
        },
        {
          id: 'f6_arm',
          anchor: [-0.55, 0.14, 0.45],
          badge: { en: 'v(0) > 0', de: 'v(0) > 0' },
          title: { en: 'No Cusp Singularity', de: 'Keine Spitzensingularität' },
          body: {
            en: 'Curve velocity never hits zero for d ≠ r, eliminating infinite curvature spikes in cam synthesis.',
            de: 'Für d ≠ r wird v(θ) nie null, was unendliche Krümmungsspitzen vermeidet.',
          },
        },
      ],
    },
  };

  const LAB_PRESETS = {
    wankel: {
      id: 'wankel',
      code: { en: 'Wankel 1:3', de: 'Wankel 1:3' },
      config: { mode: 'wankel', wankelR: 140, wankelE: 20, wankelA: 6, speed: 0.8 },
    },
    cycloid_10: {
      id: 'cycloid_10',
      code: { en: 'Cyclo 10:1', de: 'Zykloid 10:1' },
      config: { mode: 'cycloid_drive', cycloN: 10, cycloRpinCircle: 150, cycloRpin: 10, cycloE: 6, speed: 0.6 },
    },
    cycloid_15: {
      id: 'cycloid_15',
      code: { en: 'Cyclo 15:1', de: 'Zykloid 15:1' },
      config: { mode: 'cycloid_drive', cycloN: 15, cycloRpinCircle: 160, cycloRpin: 8, cycloE: 4.5, speed: 0.5 },
    },
    cardioid: {
      id: 'cardioid',
      code: { en: 'Cardioid 1:1', de: 'Kardioide 1:1' },
      config: { mode: 'trochoid', curveType: 'epi', R: 60, r: 60, d: 60, speed: 1.0 },
    },
    nephroid: {
      id: 'nephroid',
      code: { en: 'Nephroid 2:1', de: 'Nephroide 2:1' },
      config: { mode: 'trochoid', curveType: 'epi', R: 80, r: 40, d: 40, speed: 1.0 },
    },
    astroid: {
      id: 'astroid',
      code: { en: 'Astroid 4:1', de: 'Astroide 4:1' },
      config: { mode: 'trochoid', curveType: 'hypo', R: 120, r: 30, d: 30, speed: 1.0 },
    },
    deltoid: {
      id: 'deltoid',
      code: { en: 'Deltoid 3:1', de: 'Deltoide 3:1' },
      config: { mode: 'trochoid', curveType: 'hypo', R: 120, r: 40, d: 40, speed: 1.0 },
    },
    spirograph_art: {
      id: 'spirograph_art',
      code: { en: 'Spirograph', de: 'Spirograph' },
      config: { mode: 'trochoid', curveType: 'hypo', R: 140, r: 52, d: 85, speed: 1.4 },
    },
  };

  const TOUR_STOPS = [
    {
      id: 't1',
      step: 1,
      targetView: 'overview',
      badge: { en: 'Plates I–VI Overview', de: 'Tafeln I–VI Übersicht' },
      title: {
        en: 'Plates I–VI — Cycloidal & Planetary Kinematics Atlas',
        de: 'Tafeln I–VI — Atlas der Zykloiden- & Planetenkinematik',
      },
      summary: {
        en: 'Six 1967 mechanical drafting plates connecting abstract rolling circles to Wankel rotary housings, robotics cycloidal speed reducers, Cardioids, Astroids, and harmonic Spirographs.',
        de: 'Sechs Konstruktionstafeln verknüpfen klassische Rollkurven mit Wankel-Motoren, Roboter-Zykloidgetrieben, Kardioiden, Astroiden und Spirographen.',
      },
      takeaway: {
        en: 'Click any 3D mechanism on the gallery table or step through each machine plate.',
        de: 'Klicke auf eine beliebige Tafel oder gehe schrittweise durch die Konstruktionen.',
      },
      camera: { pos: [0.0, 6.9, 8.6], target: [0.0, -0.05, 0.0] },
    },
    {
      id: 't2',
      step: 2,
      targetView: 'fig1',
      badge: { en: 'Plate I · Wankel Bore', de: 'Tafel I · Wankelmotor' },
      title: {
        en: 'Fig. 1 — Wankel Rotary Engine Epitrochoid (1:3)',
        de: 'Fig. 1 — Wankel-Kreiskolbenmotor (Epitrochoide 1:3)',
      },
      summary: {
        en: 'An outward equidistant epitrochoid bore houses a triangular Reuleaux rotor spinning at 1/3 shaft speed, sealing three chambers without valves.',
        de: 'Eine nach außen versetzte Epitrochoide bildet die Laufbahn des im Verhältnis 1:3 umlaufenden Dreikantläufers.',
      },
      takeaway: {
        en: 'Export WANKEL_HOUSING & WANKEL_ROTOR straight to DXF or SVG in the Lab tab.',
        de: 'Im Labor lassen sich WANKEL_HOUSING & WANKEL_ROTOR direkt als DXF/SVG exportieren.',
      },
      camera: { pos: [0.0, 3.05, 3.45], target: [0.0, 0.0, 0.0] },
    },
    {
      id: 't3',
      step: 3,
      targetView: 'fig2b',
      badge: { en: 'Plate II · Cyclo Drive', de: 'Tafel II · Zykloidgetriebe' },
      title: {
        en: 'Figs. 2a → 2b — Zero-Backlash Cycloidal Reducers (10:1 → 15:1)',
        de: 'Fig. 2a → 2b — Spielfreie Zykloidgetriebe (10:1 → 15:1)',
      },
      summary: {
        en: 'An N-lobed epitrochoidal disc rolls inside N+1 hardened stationary pins. Multiplying lobes raises single-stage reduction from 10:1 to 15:1 with full rolling contact.',
        de: 'Eine N-bogige Kurvenscheibe wälzt in N+1 Außenbolzen ab – mehr Nocken steigern die Untersetzung einstufig auf 15:1.',
      },
      takeaway: {
        en: 'Toggle "a / b" in the HUD to compare 10-lobe and 15-lobe industrial profiles.',
        de: 'Nutze „a / b“ oben für den direkten Vergleich von 10:1 und 15:1.',
      },
      camera: { pos: [0.0, 3.05, 3.45], target: [0.0, 0.0, 0.0] },
    },
    {
      id: 't4',
      step: 4,
      targetView: 'fig3b',
      badge: { en: 'Plate III · Epicycloids', de: 'Tafel III · Epizykloiden' },
      title: {
        en: 'Figs. 3a → 3b — External Rolling: Cardioid (1:1) & Nephroid (2:1)',
        de: 'Fig. 3a → 3b — Außenabrollen: Kardioide (1:1) & Nephroide (2:1)',
      },
      summary: {
        en: 'Rolling circle r around the outside of fixed circle R multiplies petal lobes as R/r: one cusp for 1:1 Cardioid, two symmetric cusps for 2:1 Nephroid.',
        de: 'Das Außenabrollen erzeugt genau R/ggT(R,r) Spitzen: eine bei der 1:1-Kardioide, zwei bei der 2:1-Nephroide.',
      },
      takeaway: {
        en: 'Flip "a / b" above to contrast Cardioid vs. Nephroid.',
        de: 'Wechsle oben über „a / b“ zwischen Kardioide und Nephroide.',
      },
      camera: { pos: [0.0, 3.05, 3.45], target: [0.0, 0.0, 0.0] },
    },
    {
      id: 't5',
      step: 5,
      targetView: 'fig4b',
      badge: { en: 'Plate IV · Hypocycloids', de: 'Tafel IV · Hypozykloiden' },
      title: {
        en: 'Figs. 4a → 4b — Internal Rolling: Deltoid (3:1) & Astroid (4:1)',
        de: 'Fig. 4a → 4b — Innenabrollen: Deltoide (3:1) & Astroide (4:1)',
      },
      summary: {
        en: 'Inside a fixed base ring, a planet circle traces inward cusps—Deltoid at 3:1 and the classical ladder-envelope Astroid (cos³θ, sin³θ) at 4:1.',
        de: 'Im Innern eines festen Hohlrads entstehen nach innen gerichtete Spitzen – Deltoide (3:1) und Astroide (4:1).',
      },
      takeaway: {
        en: 'Compare 3-cusped Deltoid against 4-cusped Astroid with the a/b toggle.',
        de: 'Vergleiche über „a / b“ Deltoide (3 Spitzen) und Astroide (4 Spitzen).',
      },
      camera: { pos: [0.0, 3.05, 3.45], target: [0.0, 0.0, 0.0] },
    },
    {
      id: 't6',
      step: 6,
      targetView: 'fig5',
      badge: { en: 'Plate V · GCD Closure & CAD', de: 'Tafel V · ggT & CAD-Export' },
      title: {
        en: 'Fig. 5 — Multi-Turn Harmonic Rosettes & Real-Time CAD Lab',
        de: 'Fig. 5 — Mehrfach-Harmonische & Interaktives CAD-Labor',
      },
      summary: {
        en: 'Coprime ratios such as R=140, r=52 close in 13 orbits forming 35 woven lobes. Open the Lab to vary R, r, d, N, a live in 3D & 2D Pan/Zoom and download DXF/SVG.',
        de: 'Teilerfremde Radien wie 140/52 schließen nach 13 Umläufen zu 35 Blütenbögen. Im Labor stehen Echtzeit-Slider sowie DXF/SVG-Export bereit.',
      },
      takeaway: {
        en: 'Click "Open Kinematics Lab →" to animate mechanisms live and export CAD sketches!',
        de: 'Öffne nun das Kinematik-Labor für Live-Animation, Pan/Zoom und CAD-Export!',
      },
      camera: { pos: [0.0, 3.05, 3.45], target: [0.0, 0.0, 0.0] },
    },
  ];

  const CONCEPTS = [
    {
      id: 'c_epi',
      tag: { en: '01 · EPITROCHOID KINEMATICS', de: '01 · EPITROCHOIDEN-KINEMATIK' },
      title: {
        en: 'External No-Slip Rolling Point Trajectory',
        de: 'Bahnkurve beim äußeren Abrollen ohne Schlupf',
      },
      summary: {
        en: 'When a planet circle of radius r rolls outside fixed base circle R, matching arc lengths rotates the tracing arm by (R + r)/r · θ.',
        de: 'Rollt Kreis r außen ohne Schlupf auf Grundkreis R ab, dreht der Zeichenarm mit Faktor (R + r)/r.',
      },
      latex: '\\begin{aligned} x(\\theta) &= (R + r)\\cos\\theta - d\\cos\\!\\left(\\tfrac{R+r}{r}\\theta\\right) \\\\ y(\\theta) &= (R + r)\\sin\\theta - d\\sin\\!\\left(\\tfrac{R+r}{r}\\theta\\right) \\end{aligned}',
      details: {
        en: 'Setting d = r places the pen on the rim, creating sharp cusps (Cardioid for R=r, Nephroid for R=2r).',
        de: 'Für d = r liegt der Stift am Umfang und erzeugt Spitzen (Kardioide bei R=r, Nephroide bei R=2r).',
      },
      tryPreset: 'nephroid',
    },
    {
      id: 'c_hypo',
      tag: { en: '02 · HYPOTROCHOID KINEMATICS', de: '02 · HYPOTROCHOIDEN-KINEMATIK' },
      title: {
        en: 'Internal No-Slip Rolling & Inverse Spin',
        de: 'Innenabrollen & gegenläufige Eigendrehung',
      },
      summary: {
        en: 'Rolling inside base ring R shifts the center to R − r and reverses carrier spin with frequency ratio (R − r)/r.',
        de: 'Beim Abrollen im Inneren von R verkürzt sich der Achsabstand auf R − r bei gegenläufiger Drehzahl (R − r)/r.',
      },
      latex: '\\begin{aligned} x(\\theta) &= (R - r)\\cos\\theta + d\\cos\\!\\left(\\tfrac{R-r}{r}\\theta\\right) \\\\ y(\\theta) &= (R - r)\\sin\\theta - d\\sin\\!\\left(\\tfrac{R-r}{r}\\theta\\right) \\end{aligned}',
      details: {
        en: 'Special case R = 4r, d = r reduces identically to x = R cos³θ, y = R sin³θ (Astroid).',
        de: 'Für R = 4r, d = r folgt exakt die Sternkurve (Astroide): x = R cos³θ, y = R sin³θ.',
      },
      tryPreset: 'astroid',
    },
    {
      id: 'c_closure',
      tag: { en: '03 · GCD PERIODIC CLOSURE', de: '03 · PERIODENSCHLUSS PER GGT' },
      title: {
        en: 'Exact Closure Period via Greatest Common Divisor',
        de: 'Exakter Periodenschluss über den ggT',
      },
      summary: {
        en: 'A rational radius ratio R/r closes cleanly once the carrier completes r / gcd(R, r) revolutions.',
        de: 'Bei rationalem Radienverhältnis R/r schließt sich die Kurve nach r / ggT(R, r) Trägerumläufen.',
      },
      latex: '\\theta_{\\max} = 2\\pi \\cdot \\frac{r}{\\gcd(R, r)}, \\qquad N_{\\text{lobes}} = \\frac{R}{\\gcd(R, r)}',
      details: {
        en: 'Spirograph preset (140, 52) yields gcd = 4 → 13 orbital revolutions forming 35 distinct petals.',
        de: 'Das Spirograph-Beispiel (140, 52) ergibt ggT = 4 → 13 Vollumläufe und 35 symmetrische Bögen.',
      },
      tryPreset: 'spirograph_art',
    },
    {
      id: 'c_wankel',
      tag: { en: '04 · WANKEL EQUIDISTANT TROCHOID', de: '04 · WANKEL-GEHÄUSE & 1:3-ROTOR' },
      title: {
        en: 'Peritrochoid Bore & Continuous Apex Tangency',
        de: 'Peritrochoiden-Laufbahn & stetige Spitzenberührung',
      },
      summary: {
        en: 'At crank angle θ, rotor angle θ/3 satisfies 3α ≡ θ (mod 2π) for all 3 apexes separated by 2π/3, locking every corner on the epitrochoid.',
        de: 'Bei Exzenterwinkel θ und Läuferwinkel θ/3 erfüllen alle drei Ecken exakt 3α ≡ θ (mod 2π) auf der Epitrochoide.',
      },
      latex: '\\mathbf{r}_0(\\alpha) = e\\begin{pmatrix}\\cos 3\\alpha\\\\ \\sin 3\\alpha\\end{pmatrix} + R\\begin{pmatrix}\\cos \\alpha\\\\ \\sin \\alpha\\end{pmatrix}, \\quad \\mathbf{r}_a = \\mathbf{r}_0 + a\\,\\hat{\\mathbf{n}}_{\\text{out}}',
      details: {
        en: 'Outward equidistant offset a > 0 accommodates rounded apex seals without losing sealed compression contact.',
        de: 'Der Außen-Parallelversatz a > 0 berücksichtigt den Rundungsradius der Dichtleisten.',
      },
      tryPreset: 'wankel',
    },
    {
      id: 'c_cyclo_drive',
      tag: { en: '05 · ROBOTICS CYCLOIDAL REDUCER', de: '05 · ZYKLOID-GETRIEBESCHEIBE' },
      title: {
        en: 'Zero-Backlash Roller Envelope & 1 : N Reduction',
        de: 'Spielfreie Rollen-Äquidistante & Untersetzung 1 : N',
      },
      summary: {
        en: 'Stationary pin #k at angle k·2π/(N+1) moves on one common epitrochoid in the −θ/N rotating disc frame, giving inward roller-radius envelope r_p.',
        de: 'Jeder Festbolzen bewegt sich im rotierenden (−θ/N)-Scheibensystem auf derselben Epitrochoide im Abstand r_p.',
      },
      latex: '\\mathbf{c}(\\phi) = R_p\\begin{pmatrix}\\cos\\phi\\\\\\sin\\phi\\end{pmatrix} - e\\begin{pmatrix}\\cos((N+1)\\phi)\\\\\\sin((N+1)\\phi)\\end{pmatrix} + r_p\\,\\hat{\\mathbf{n}}_{\\text{in}}',
      details: {
        en: 'Avoids lobe undercutting whenever K₁ = R_p / [e(N + 1)] > 1 (single-stage ratio i = −1/N).',
        de: 'Unterschnittfreiheit gilt für den Profilfaktor K₁ = R_p / [e(N + 1)] > 1 (Übersetzung i = −1/N).',
      },
      tryPreset: 'cycloid_10',
    },
    {
      id: 'c_velocity',
      tag: { en: '06 · CUSP VELOCITY CRITERION', de: '06 · SPITZEN- & SCHLEIFENKRITERIUM' },
      title: {
        en: 'Curtate (d < r), Common Cusp (d = r) & Prolate Loop (d > r)',
        de: 'Gestreckt (d < r), Spitze (d = r) & Schleife (d > r)',
      },
      summary: {
        en: 'Parametric tracing speed drops to zero—producing a geometric cusp—iff tracing arm d equals rolling radius r at contact cos(Rθ/r) = 1.',
        de: 'Die Kurvengeschwindigkeit erreicht exakt dann Null (echte Spitze), wenn Zeichenarm d gleich Rollradius r gilt.',
      },
      latex: '\\left\\|\\frac{d\\mathbf{r}}{d\\theta}\\right\\| = |R \\pm r|\\sqrt{1 + \\left(\\frac{d}{r}\\right)^2 - 2\\frac{d}{r}\\cos\\!\\left(\\frac{R}{r}\\theta\\right)}',
      details: {
        en: 'Smooth curtate (d < r) and prolate loop (d > r) trajectories remain strictly C¹ regular for CNC cam milling.',
        de: 'Für d ≠ r bleibt die Bahngeschwindigkeit stets größer Null – ideal für stoßfreie Nockenprofile.',
      },
      tryPreset: 'cardioid',
    },
  ];

  const BOOK_PARAGRAPHS = [
    {
      page: '1706 · La Hire',
      label: { en: 'Origins of Epicycloidal Gear Teeth', de: 'Ursprung der Zykloidenverzahnung' },
      figureLink: 'fig3a',
      text: {
        en: 'Following Olaf Rømer’s 1674 gear tooth study, Philippe de La Hire published systematic geometric proofs showing that epicycloids and hypocycloids transmit constant angular velocity between meshing shafts.',
        de: 'Aufbauend auf Olaf Rømers Überlegungen (1674) bewies Philippe de La Hire systematisch, dass Epizykloiden und Hypozykloiden konstante Winkelgeschwindigkeit zwischen Zahnrädern übertragen.',
      },
    },
    {
      page: '1925 · Braren',
      label: { en: 'CYCLO Speed Reducer Invention', de: 'Erfindung des Zykloidgetriebes' },
      figureLink: 'fig2a',
      text: {
        en: 'German engineer Lorenz Braren patented the CYCLO speed reducer in 1925, combining an N-lobed epitrochoid disc with N+1 roller pins so shear forces distribute simultaneously over ~50% of all lobes.',
        de: 'Lorenz Braren patentierte 1925 das Zykloidgetriebe: Durch eine N-bogige Kurvenscheibe in N+1 Rollenbolzen tragen rund die Hälfte aller Zähne gleichzeitig.',
      },
    },
    {
      page: '1954 · Wankel',
      label: { en: 'Four-Stroke Epitrochoid Engine', de: 'Wankel-Kreiskolbenmotor' },
      figureLink: 'fig1',
      text: {
        en: 'Felix Wankel coupled a 1:3 internal gearset with a two-lobed epitrochoid chamber, turning sliding reciprocating pistons into compact rotary combustion without poppet valves or crankshaft con-rods.',
        de: 'Felix Wankel kombinierte ein 1:3-Innengetriebe mit einer Zweibogentrochoide und verwirklichte so den ventillosen Viertakt-Kreiskolbenmotor.',
      },
    },
    {
      page: '1856 · Steiner',
      label: { en: 'Deltoid, Astroid & Envelopes', de: 'Deltoide, Astroide & Hüllkurven' },
      figureLink: 'fig4b',
      text: {
        en: 'Jakob Steiner discovered the three-cusped Deltoid in 1856 while studying Simpson pedal envelopes; its four-cusped sibling—the Astroid—appears across robotics linkages and ladder-sliding envelopes.',
        de: 'Jakob Steiner untersuchte 1856 die dreispitzige Deltoide; ihre vierspitzige Verwandte – die Astroide – tritt klassisch als Hüllkurve einer gleitenden Leiter auf.',
      },
    },
    {
      page: '1965 · Fisher',
      label: { en: 'Spirograph Rational Harmonics', de: 'Spirograph & rationale Verhältnisse' },
      figureLink: 'fig5',
      text: {
        en: 'Denys Fisher’s 1965 mechanical drawing toy popularized rational gcd(R, r) curve closure worldwide, turning number-theoretic divisibility directly into visual geometric petals.',
        de: 'Denys Fishers Spirograph von 1965 machte rationale ggT-Schließperioden als harmonische Rosettenmuster weltberühmt.',
      },
    },
    {
      page: '1997–2024',
      label: { en: 'From Walter Fendt to 3D CAD', de: 'Von Walter Fendt zum CAD-Export' },
      figureLink: 'fig6',
      text: {
        en: 'Extending Walter Fendt’s classic roulette curves applet with 1967 plate plates, WebGL extrusion, rotary mechanisms, velocity diagnostics, and closed AC1009 DXF / SVG vector download.',
        de: 'Erweiterung von Walter Fendts klassischem Rollkurven-Applet um WebGL-3D-Modelle, industrielle Getriebe, Geschwindigkeitsdiagramme und DXF/SVG-CAD-Export.',
      },
    },
  ];

  const FURTHER_READING = {
    bookLinks: [
      {
        vol: { en: 'Kinematics Classical Text', de: 'Klassiker der Getriebelehre' },
        title: { en: 'Franz Reuleaux — The Kinematics of Machinery (1875)', de: 'Franz Reuleaux — Theoretische Kinematik (1875)' },
        note: {
          en: 'Introduced centrodes and Reuleaux triangles—the direct polygonal basis of the 3-apex Wankel rotary piston.',
          de: 'Prägte den Begriff der Polbahnen und des Reuleaux-Dreiecks – geometrische Basis des Wankel-Rotors.',
        },
      },
      {
        vol: { en: 'Patent Literature', de: 'Patentgeschichte' },
        title: { en: 'Lorenz Braren — Cycloid Speed Reducer (DE Patent 1925)', de: 'Lorenz Braren — Cyclo-Getriebe (Patent 1925)' },
        note: {
          en: 'Established N vs N+1 pin-wheel epitrochoid drives now ubiquitous in CNC rotary tables and 6-axis robot wrists.',
          de: 'Begründete die heute in Industrierobotern und CNC-Rundtischen dominierende N/(N+1)-Kurvenscheibentechnik.',
        },
      },
      {
        vol: { en: 'CAD Interchange Spec', de: 'CAD-Austauschformat' },
        title: { en: 'Autodesk DXF AC1009 Closed Polyline Specification', de: 'Autodesk DXF AC1009 (Polylinien-Standard)' },
        note: {
          en: 'Used natively by our exporter to import Wankel housings, cycloid discs, and trochoid curves directly into Inventor, SolidWorks, and FreeCAD.',
          de: 'Genutztes Austauschformat unseres Exporters für den direkten Import nach Autodesk Inventor, SolidWorks und FreeCAD.',
        },
      },
    ],
    externalLinks: [
      {
        source: 'Walter Fendt',
        title: { en: 'Epicycloids & Hypocycloids Applet (Original Inspiration)', de: 'Epizykloiden & Hypozykloiden Applet (Original)' },
        url: 'https://www.walter-fendt.de/html5/men/epihypotrochoids_en.htm',
        desc: {
          en: 'Original interactive Java/HTML5 roulette curve demonstration by retired educator Walter Fendt.',
          de: 'Originale interaktive Rollkurven-Simulation von Studiendirektor i.R. Walter Fendt.',
        },
      },
      {
        source: 'Live Portfolio',
        title: { en: 'Cycloid Lab GitHub Repository & Portfolio', de: 'GitHub Repository & Portfolio Hub' },
        url: 'https://xallace.github.io/cycloid-simulation/',
        desc: {
          en: 'Published interactive kinematics project hosted on xallace.github.io.',
          de: 'Veröffentlichtes interaktives Kinematik-Projekt auf xallace.github.io.',
        },
      },
      {
        source: 'MathWorld',
        title: { en: 'Wolfram MathWorld — Epitrochoid & Hypotrochoid', de: 'Wolfram MathWorld — Epitrochoide & Hypotrochoide' },
        url: 'https://mathworld.wolfram.com/Hypotrochoid.html',
        desc: {
          en: 'Analytical derivations, curvature radii, and double-generation theorems.',
          de: 'Analytische Herleitungen, Krümmungsradien und Sätze der doppelten Erzeugung.',
        },
      },
    ],
  };

  const UI_TEXT = {
    en: {
      brandTitle: 'CYCLOID LAB',
      brandSub: 'Wankel, Cyclo & Roulettes',
      sourceRef: '1967 Drafting Plates · Tribute to Walter Fendt · CAD DXF/SVG',
      tabAtlas: '3D Plate Atlas & Tour',
      tabLab: 'Interactive Kinematics Lab',
      tabConcepts: 'Concepts & Book Notes',
      tabReading: 'Further Reading',
      btnTour: 'Guided Tour',
      btnOverview: 'Overview (6 Plates)',
      varA: 'a · Variant A',
      varB: 'b · Variant B',
      modeSolid: '3D Book Plate',
      modeExploded: 'Exploded Tiers',
      modePlate2d: 'Flat Plate Top',
      modeWire: 'Ink Wireframe',
      togCallouts: 'Call-Outs',
      togLabels: 'Dimensions',
      togGrid: 'Pitch Rings',
      btnResetCam: 'Reset Cam',
      camPersp: '3D Perspective',
      camTop: 'Top Plan Plate',
      camFront: 'Front Edge',
      camSide: 'Oblique Bench',
      legFixed: 'Fixed Ring R',
      legMoving: 'Rotor / Disc',
      legTrace: 'Locus Trace',
      legPin: 'Seal / Pin',
      overviewKicker: 'PLATES I–VI · 3D GALLERY',
      overviewTitle: 'Evolution of Cycloidal Kinematics',
      overviewTag: 'Figs. 1 – 6',
      overviewSummary: 'Click any 3D drafting plate on the table or pick Figs. 1–6 above to inspect Wankel trochoids, 10:1/15:1 Cycloid speed reducers, Cardioid/Nephroid, Deltoid/Astroid, and harmonic Spirographs.',
      overviewBookPage: 'Rolling Without Slip',
      overviewBookNote: 'Every planetary curve reduces to a single vector sum: orbital carrier center plus spinning arm (R±r)e^(iθ) − d·e^(i·kθ). Switching d relative to r shifts smoothly from smooth curtate to cusps and open loops.',
      overviewListHeading: 'All 6 Kinematics Plates (Click to Inspect)',
      plateCalloutsHeading: 'Plate Call-Outs & Features',
      snapshotHeading: 'Computed Mechanism Parameters',
      ctaOpenOverview: 'Open Interactive Kinematics Lab →',
      ctaOpenFig: 'Load {code} in Kinematics Lab →',
      labKicker: 'INTERACTIVE MECHANISM & CAD STUDIO',
      labTitle: 'Interactive Kinematics Lab',
      btnPlayPauseRun: '⏸ Pause',
      btnPlayPauseStop: '▶ Resume',
      btnStepReset: '↺ Reset θ',
      btnRecenter: '⌖ Recenter 2D',
      grpPres: 'Mechanism / Kinematics Mode',
      grpMotion: 'Motion & Drafting Style',
      lblSpeed: 'Angular Speed',
      lblStyle: '2D Drafting Finish',
      stylePaper: 'Ink & Vermilion',
      styleBlueprint: 'Prussian Blueprint CAD',
      grpParams: 'Parametric Geometry',
      lblR: 'Fixed Pitch Circle R',
      lblr: 'Rolling Circle r',
      lbld: 'Tracing Arm Offset d',
      lblCurveType: 'Rolling Placement',
      curveHypo: 'Hypotrochoid (Inside R)',
      curveEpi: 'Epitrochoid (Outside R)',
      lblWankelR: 'Generating Radius R',
      lblWankelE: 'Eccentricity e',
      lblWankelA: 'Seal Clearance Offset a',
      lblCycloN: 'Disc Lobes N (Pins N+1)',
      lblCycloR: 'Pin Circle Radius Rp',
      lblCycloRp: 'Roller Pin Radius rp',
      lblCycloE: 'Eccentricity e',
      grpFormula: 'Analytical Locus & CAD Export',
      lblFormula: 'Active Equation:',
      btnDxf: 'DXF Export (CAD)',
      btnSvg: 'SVG Vector',
      conceptsKicker: 'PLANETARY GEOMETRY & MECHANISM LAWS',
      conceptsTitle: 'Kinematic Principles & Book Notes',
      conceptsIntro: 'Closed-form rolling circle equations, gcd period closure, Wankel 1:3 lock, and Cyclo roller envelopes beside engineering notes on La Hire, Braren, Wankel, and Walter Fendt.',
      lawsHeading: 'Interactive Kinematic Laws',
      bookHeaderLeft: 'MECHANICAL KINEMATICS · 1967 PLATE EDITION',
      bookHeaderRight: 'PLATES I–VI',
      bookTitle: 'ROULETTES, WANKEL & CYCLO DRIVES',
      bookNote: 'Summary notes with direct jump links to each 3D plate model.',
      tryLabBtn: 'Load & Simulate in Lab →',
      inspectBtn: 'Inspect {code} in 3D →',
      readingKicker: 'ENGINEERING LITERATURE & SOURCES',
      readingTitle: 'Further Reading & Primary Sources',
      readingIntro: 'Classical mechanism treatises, patent archives, CAD DXF specifications, and Walter Fendt’s original roulette applet.',
      readCol1: 'Textbooks & Patent Archives',
      readCol2: 'References & Original Applet',
      prevBtn: '← Prev',
      nextBtn: 'Next →',
      openLabEnd: 'Open Kinematics Lab →',
      autoBtn: '▶ Auto',
      pauseAutoBtn: '⏸ Auto',
    },
    de: {
      brandTitle: 'ZYKLOIDEN-LABOR',
      brandSub: 'Wankel & Getriebe',
      sourceRef: 'Konstruktionstafeln 1967 · Hommage an Walter Fendt · DXF/SVG',
      tabAtlas: '3D-Tafelatlas & Tour',
      tabLab: 'Interaktives Kinematik-Labor',
      tabConcepts: 'Konzepte & Buchnotizen',
      tabReading: 'Weiterführende Literatur',
      btnTour: 'Geführte Tour',
      btnOverview: 'Übersicht (6 Tafeln)',
      varA: 'a · Variante A',
      varB: 'b · Variante B',
      modeSolid: '3D-Buchtafel',
      modeExploded: 'Explosionsansicht',
      modePlate2d: 'Flache Tafel (Oben)',
      modeWire: 'Tusche-Drahtgitter',
      togCallouts: 'Hinweise',
      togLabels: 'Maße & Achsen',
      togGrid: 'Wälzkreise',
      btnResetCam: 'Kamera Reset',
      camPersp: '3D-Perspektive',
      camTop: 'Draufsicht',
      camFront: 'Vorderkante',
      camSide: 'Schrägansicht',
      legFixed: 'Grundkreis R',
      legMoving: 'Rotor / Scheibe',
      legTrace: 'Bahnkurve',
      legPin: 'Dichtleiste / Bolzen',
      overviewKicker: 'TAFELN I–VI · 3D-GALERIE',
      overviewTitle: 'Entwicklung der Zykloiden-Kinematik',
      overviewTag: 'Fig. 1 – 6',
      overviewSummary: 'Klicke eine 3D-Tafel auf dem Zeichenbrett an oder wähle Fig. 1–6: Wankelmotor, 10:1/15:1-Zykloidgetriebe, Kardioide/Nephroide, Deltoide/Astroide und harmonische Spirographen.',
      overviewBookPage: 'Schlupffreies Abrollen',
      overviewBookNote: 'Jede Planetenkurve folgt der Vektorsumme aus Stegmittelpunkt und umlaufendem Zeichenarm. Das Verhältnis d/r entscheidet glatt zwischen gestreckt, Spitze und Schleife.',
      overviewListHeading: 'Alle 6 Kinematik-Tafeln (zum Prüfen klicken)',
      plateCalloutsHeading: 'Tafel-Hinweise & Merkmale',
      snapshotHeading: 'Berechnete Mechanismus-Kennwerte',
      ctaOpenOverview: 'Interaktives Kinematik-Labor öffnen →',
      ctaOpenFig: '{code} im Kinematik-Labor laden →',
      labKicker: 'INTERAKTIVES GETRIEBE- & CAD-STUDIO',
      labTitle: 'Interaktives Kinematik-Labor',
      btnPlayPauseRun: '⏸ Pause',
      btnPlayPauseStop: '▶ Weiter',
      btnStepReset: '↺ Reset θ',
      btnRecenter: '⌖ Zentrieren 2D',
      grpPres: 'Mechanismus / Kinematik-Modus',
      grpMotion: 'Bewegung & Zeichenstil',
      lblSpeed: 'Winkelgeschwindigkeit',
      lblStyle: '2D-Tafeldarstellung',
      stylePaper: '1967 Buchtafel (Tusche & Zinnober)',
      styleBlueprint: 'Blaupause / Blueprint CAD',
      grpParams: 'Parametrische Geometrie',
      lblR: 'Fester Grundkreis R',
      lblr: 'Rollkreis r',
      lbld: 'Stiftabstand d',
      lblCurveType: 'Abroll-Anordnung',
      curveHypo: 'Hypotrochoide (Innen in R)',
      curveEpi: 'Epitrochoide (Außen auf R)',
      lblWankelR: 'Erzeugender Radius R',
      lblWankelE: 'Exzentrizität e',
      lblWankelA: 'Äquidistanten-Spalt a',
      lblCycloN: 'Scheiben-Nocken N (Bolzen N+1)',
      lblCycloR: 'Bolzenkreis-Radius Rp',
      lblCycloRp: 'Bolzenradius rp',
      lblCycloE: 'Exzentrizität e',
      grpFormula: 'Analytische Gleichung & CAD-Export',
      lblFormula: 'Aktive Bahnformel:',
      btnDxf: 'DXF Export (CAD)',
      btnSvg: 'SVG Vektor',
      conceptsKicker: 'PLANETENGEOMETRIE & GETRIEBELEHRE',
      conceptsTitle: 'Grundprinzipien & Historische Notizen',
      conceptsIntro: 'Rollkurven-Gleichungen, ggT-Periodenschluss, 1:3-Wankelkinematik und Rollenbolzen-Äquidistanten neben historischen Notizen zu La Hire, Braren, Wankel und Walter Fendt.',
      lawsHeading: 'Interaktive Kinematik-Gesetze',
      bookHeaderLeft: 'GETRIEBEKINEMATIK · 1967 TAFEL-EDITION',
      bookHeaderRight: 'TAFELN I–VI',
      bookTitle: 'ROLLKURVEN, WANKEL & ZYKLOIDEN',
      bookNote: 'Kompakte Notizen mit direktem Sprung zum 3D-Tafelmodell.',
      tryLabBtn: 'Im Kinematik-Labor testen →',
      inspectBtn: '{code} in 3D prüfen →',
      readingKicker: 'FACHLITERATUR & PRIMÄRQUELLEN',
      readingTitle: 'Weiterführende Literatur & Quellen',
      readingIntro: 'Klassische Getriebelehre, Patentarchive, DXF-Spezifikation und das originale Rollkurven-Applet von Walter Fendt.',
      readCol1: 'Fachbücher & Patente',
      readCol2: 'Nachschlagewerke & Original-Applet',
      prevBtn: '← Zurück',
      nextBtn: 'Weiter →',
      openLabEnd: 'Kinematik-Labor öffnen →',
      autoBtn: '▶ Auto',
      pauseAutoBtn: '⏸ Auto',
    },
  };

  global.CYCLOID_DATA = {
    FIGURE_ORDER,
    OVERVIEW_IDS,
    PAIRED_FIGURES,
    resolveVariantId,
    FIGURES,
    LAB_PRESETS,
    TOUR_STOPS,
    CONCEPTS,
    BOOK_PARAGRAPHS,
    FURTHER_READING,
    UI_TEXT,
  };
})(window);
