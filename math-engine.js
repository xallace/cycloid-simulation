/* ==========================================================================
   math-engine.js — Cycloid & Planetary Kinematics Mathematical Engine
   - Analytical Epitrochoids & Hypotrochoids + Parametric Speed ds/dθ
   - Wankel Rotary Engine (Equidistant Outward Epitrochoid Housing + 1:3 Rotor)
   - Industrial Cycloidal Speed Reducer (Zero-Backlash N-Lobe Envelope Profile)
   - CAD Exporters (AutoCAD AC1009 ASCII DXF & Vector SVG)
   ========================================================================== */
(function (global) {
  'use strict';

  class CycloidMath {
    static gcd(a, b) {
      a = Math.abs(Math.round(a));
      b = Math.abs(Math.round(b));
      while (b) {
        const t = b;
        b = a % b;
        a = t;
      }
      return a || 1;
    }

    // Full closure parameter range: thetaMax = 2 * PI * (r / gcd(R, r))
    static getPeriod(R, r) {
      const scale = 1000;
      const g = this.gcd(Math.round(R * scale), Math.round(r * scale));
      const denom = Math.round(r * scale) / g;
      return 2 * Math.PI * denom;
    }

    // Number of petals / cusps (reduced R / gcd(R, r)) and rolling turns (r / gcd(R, r))
    static getHarmonicInfo(R, r) {
      const scale = 1000;
      const Ri = Math.round(R * scale);
      const ri = Math.round(r * scale);
      const g = this.gcd(Ri, ri);
      return {
        cusps: Math.max(1, Math.round(Ri / g)),
        turns: Math.max(1, Math.round(ri / g)),
      };
    }

    // Epitrochoid: Circle (r) rolling outside fixed circle (R)
    static getEpitrochoidPoint(R, r, d, theta) {
      const k = (R + r) / r;
      return {
        x: (R + r) * Math.cos(theta) - d * Math.cos(k * theta),
        y: (R + r) * Math.sin(theta) - d * Math.sin(k * theta),
      };
    }

    // Hypotrochoid: Circle (r) rolling inside fixed circle (R)
    static getHypotrochoidPoint(R, r, d, theta) {
      const k = (R - r) / r;
      return {
        x: (R - r) * Math.cos(theta) + d * Math.cos(k * theta),
        y: (R - r) * Math.sin(theta) - d * Math.sin(k * theta),
      };
    }

    // Parametric instantaneous tracing speed |dr/dθ|
    static getCurveSpeed(type, R, r, d, theta) {
      if (r <= 0) return 0;
      const ratio = d / r;
      const u = (R / r) * theta;
      if (type === 'hypo') {
        const base = Math.abs(R - r);
        return base * Math.sqrt(Math.max(0, 1 + ratio * ratio - 2 * ratio * Math.cos(u)));
      }
      const base = R + r;
      return base * Math.sqrt(Math.max(0, 1 + ratio * ratio - 2 * ratio * Math.cos(u)));
    }

    static generateCurve(type, R, r, d, steps = 1200) {
      const period = Math.min(this.getPeriod(R, r), 30 * Math.PI);
      const points = [];
      const stepSize = period / steps;
      for (let i = 0; i <= steps; i++) {
        const theta = i * stepSize;
        const pt =
          type === 'hypo'
            ? this.getHypotrochoidPoint(R, r, d, theta)
            : this.getEpitrochoidPoint(R, r, d, theta);
        points.push(pt);
      }
      return points;
    }

    // Wankel Rotary Engine Trochoid Housing
    // e = eccentricity, R = generating radius, a = outward apex seal equidistant offset
    static getWankelHousingPoints(e, R, a = 0, steps = 360) {
      const points = [];
      for (let i = 0; i <= steps; i++) {
        const alpha = (i / steps) * 2 * Math.PI;
        const x0 = e * Math.cos(3 * alpha) + R * Math.cos(alpha);
        const y0 = e * Math.sin(3 * alpha) + R * Math.sin(alpha);

        if (a === 0) {
          points.push({ x: x0, y: y0 });
        } else {
          const dx = -3 * e * Math.sin(3 * alpha) - R * Math.sin(alpha);
          const dy = 3 * e * Math.cos(3 * alpha) + R * Math.cos(alpha);
          const len = Math.hypot(dx, dy) || 1;
          // Outward normal for CCW curve: (+dy, -dx) / len
          const nx = dy / len;
          const ny = -dx / len;
          points.push({ x: x0 + a * nx, y: y0 + a * ny });
        }
      }
      return points;
    }

    // Wankel Triangular Rotor geometry at eccentric shaft angle theta
    static getWankelRotor(e, R, theta) {
      const cx = e * Math.cos(theta);
      const cy = e * Math.sin(theta);
      const rotorAngle = theta / 3;

      const apexes = [];
      for (let i = 0; i < 3; i++) {
        const phi = rotorAngle + (i * 2 * Math.PI) / 3;
        apexes.push({
          x: cx + R * Math.cos(phi),
          y: cy + R * Math.sin(phi),
        });
      }

      const flankPoints = [];
      const pointsPerFlank = 40;
      const arcRadius = Math.sqrt(3) * R;

      for (let i = 0; i < 3; i++) {
        const p1 = apexes[i];
        const p2 = apexes[(i + 1) % 3];
        const pOpposite = apexes[(i + 2) % 3];

        for (let j = 0; j <= pointsPerFlank; j++) {
          const t = j / pointsPerFlank;
          const ang1 = Math.atan2(p1.y - pOpposite.y, p1.x - pOpposite.x);
          const ang2 = Math.atan2(p2.y - pOpposite.y, p2.x - pOpposite.x);
          let dAng = ang2 - ang1;
          while (dAng > Math.PI) dAng -= 2 * Math.PI;
          while (dAng < -Math.PI) dAng += 2 * Math.PI;

          const ang = ang1 + t * dAng;
          flankPoints.push({
            x: pOpposite.x + arcRadius * Math.cos(ang),
            y: pOpposite.y + arcRadius * Math.sin(ang),
          });
        }
      }

      return { center: { x: cx, y: cy }, apexes, flankPoints };
    }

    // Industrial Cycloidal Speed Reducer Disc Profile (N lobes, N+1 stationary pins on circle R_pin_circle)
    // Exact inward equidistant envelope of roller pins of radius r_pin under eccentricity e
    static getCycloidDiscProfile(N, R_pin_circle, r_pin, e, steps = 720) {
      const points = [];
      const R = R_pin_circle;
      const r = r_pin;

      for (let i = 0; i <= steps; i++) {
        const phi = (i / steps) * 2 * Math.PI;
        const n1 = N + 1;

        // Generating epitrochoid of stationary pin center in rotating disc coordinates
        const x0 = R * Math.cos(phi) - e * Math.cos(n1 * phi);
        const y0 = R * Math.sin(phi) - e * Math.sin(n1 * phi);

        // Derivatives dx0/dphi, dy0/dphi
        const dx0 = -R * Math.sin(phi) + e * n1 * Math.sin(n1 * phi);
        const dy0 = R * Math.cos(phi) - e * n1 * Math.cos(n1 * phi);
        const len = Math.hypot(dx0, dy0) || 1;

        // Inward normal (-dy0, +dx0) / len offsets profile inside roller radius r
        const nx = -dy0 / len;
        const ny = dx0 / len;

        points.push({
          x: x0 + r * nx,
          y: y0 + r * ny,
        });
      }
      return points;
    }

    // CAD EXPORT 1: Clean AutoCAD Release 12 / 2000 ASCII DXF file
    static generateDXF(pointArrays, layerNames = ['CYCLOID_PROFILE']) {
      let dxf = '';
      dxf += '0\nSECTION\n2\nHEADER\n9\n$ACADVER\n1\nAC1009\n0\nENDSEC\n';
      dxf += '0\nSECTION\n2\nENTITIES\n';

      pointArrays.forEach((pts, idx) => {
        const layer = layerNames[idx] || `PROFILE_${idx + 1}`;
        if (!pts || pts.length < 2) return;

        dxf += '0\nPOLYLINE\n';
        dxf += `8\n${layer}\n`;
        dxf += '66\n1\n';
        dxf += '70\n1\n';

        for (const p of pts) {
          dxf += '0\nVERTEX\n';
          dxf += `8\n${layer}\n`;
          dxf += `10\n${p.x.toFixed(4)}\n`;
          dxf += `20\n${p.y.toFixed(4)}\n`;
          dxf += '30\n0.0\n';
        }
        dxf += '0\nSEQEND\n';
      });

      dxf += '0\nENDSEC\n0\nEOF\n';
      return dxf;
    }

    // CAD EXPORT 2: Standard Vector SVG
    static generateSVG(pointArrays, strokeColors = ['#d94426', '#181715'], width = 600, height = 600, bgColor = '#faf5e8') {
      let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
      pointArrays.flat().forEach((p) => {
        if (p.x < minX) minX = p.x;
        if (p.x > maxX) maxX = p.x;
        if (p.y < minY) minY = p.y;
        if (p.y > maxY) maxY = p.y;
      });

      const pad = 20;
      const viewW = maxX - minX + pad * 2 || 100;
      const viewH = maxY - minY + pad * 2 || 100;
      const vMinX = minX - pad;
      const vMinY = minY - pad;

      let svg = '<?xml version="1.0" encoding="UTF-8"?>\n';
      svg += `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vMinX} ${vMinY} ${viewW} ${viewH}" width="${width}" height="${height}">\n`;
      if (bgColor && bgColor !== 'none') {
        svg += `  <rect x="${vMinX}" y="${vMinY}" width="${viewW}" height="${viewH}" fill="${bgColor}" />\n`;
      }

      pointArrays.forEach((pts, idx) => {
        if (!pts || pts.length < 2) return;
        const col = strokeColors[idx] || '#181715';
        const d = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(3)} ${p.y.toFixed(3)}`).join(' ') + ' Z';
        svg += `  <path d="${d}" fill="none" stroke="${col}" stroke-width="1.5" stroke-linejoin="round" />\n`;
      });

      svg += '</svg>\n';
      return svg;
    }
  }

  global.CycloidMath = CycloidMath;
})(window);
