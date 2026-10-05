/**
 * Cycloid & Planetary Kinematics Mathematical Engine
 * Computes:
 * - Analytical Epitrochoids & Hypotrochoids
 * - Wankel Rotary Engine (Trochoid housing, rotor kinematics, chamber volumes)
 * - Industrial Cycloid Speed Reducer (Robotics Cyclo Drive profile with pin offsets)
 * - CAD Exporters (ASCII DXF format & Vector SVG)
 */

class CycloidMath {
  // Greatest Common Divisor
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

  // Calculate full closure parameter range: thetaMax = 2 * PI * (r / gcd(R, r))
  static getPeriod(R, r) {
    const scale = 1000;
    const g = this.gcd(Math.round(R * scale), Math.round(r * scale));
    const denom = Math.round(r * scale) / g;
    return 2 * Math.PI * denom;
  }

  // Epitrochoid: Circle (r) rolling on outside of fixed circle (R)
  static getEpitrochoidPoint(R, r, d, theta) {
    const k = (R + r) / r;
    const x = (R + r) * Math.cos(theta) - d * Math.cos(k * theta);
    const y = (R + r) * Math.sin(theta) - d * Math.sin(k * theta);
    return { x, y };
  }

  // Hypotrochoid: Circle (r) rolling inside fixed circle (R)
  static getHypotrochoidPoint(R, r, d, theta) {
    const k = (R - r) / r;
    const x = (R - r) * Math.cos(theta) + d * Math.cos(k * theta);
    const y = (R - r) * Math.sin(theta) - d * Math.sin(k * theta);
    return { x, y };
  }

  // Generate full curve array
  static generateCurve(type, R, r, d, steps = 1200) {
    const period = Math.min(this.getPeriod(R, r), 30 * Math.PI); // Cap at 15 loops
    const points = [];
    const stepSize = period / steps;

    for (let i = 0; i <= steps; i++) {
      const theta = i * stepSize;
      const pt = type === 'hypo'
        ? this.getHypotrochoidPoint(R, r, d, theta)
        : this.getEpitrochoidPoint(R, r, d, theta);
      points.push(pt);
    }
    return points;
  }

  // Wankel Rotary Engine Trochoid Housing & Rotor
  // e = eccentricity, R = generating radius, a = apex seal equidistant offset
  static getWankelHousingPoints(e, R, a = 0, steps = 360) {
    const points = [];
    for (let i = 0; i <= steps; i++) {
      const alpha = (i / steps) * 2 * Math.PI;
      // Peritrochoid equations of Wankel housing
      const x0 = e * Math.cos(3 * alpha) + R * Math.cos(alpha);
      const y0 = e * Math.sin(3 * alpha) + R * Math.sin(alpha);

      if (a === 0) {
        points.push({ x: x0, y: y0 });
      } else {
        // Equidistant parallel curve offset
        const dx = -3 * e * Math.sin(3 * alpha) - R * Math.sin(alpha);
        const dy = 3 * e * Math.cos(3 * alpha) + R * Math.cos(alpha);
        const len = Math.hypot(dx, dy);
        const nx = -dy / len;
        const ny = dx / len;
        points.push({ x: x0 + a * nx, y: y0 + a * ny });
      }
    }
    return points;
  }

  // Wankel Triangular Rotor geometry at eccentric shaft angle theta
  static getWankelRotor(e, R, theta) {
    // Eccentric shaft center
    const cx = e * Math.cos(theta);
    const cy = e * Math.sin(theta);
    // Rotor angle turns at theta / 3 (1:3 gear ratio)
    const rotorAngle = theta / 3;

    // 3 Apex corners
    const apexes = [];
    for (let i = 0; i < 3; i++) {
      const phi = rotorAngle + (i * 2 * Math.PI) / 3;
      apexes.push({
        x: cx + R * Math.cos(phi),
        y: cy + R * Math.sin(phi)
      });
    }

    // Outer curved flanks (Reuleaux circular arcs connecting apexes)
    const flankPoints = [];
    const pointsPerFlank = 40;
    const arcRadius = Math.sqrt(3) * R; // Radius of circular arc connecting adjacent apexes

    for (let i = 0; i < 3; i++) {
      const p1 = apexes[i];
      const p2 = apexes[(i + 1) % 3];
      const pOpposite = apexes[(i + 2) % 3];

      for (let j = 0; j <= pointsPerFlank; j++) {
        const t = j / pointsPerFlank;
        // Linear interpolation angle from opposite apex
        const ang1 = Math.atan2(p1.y - pOpposite.y, p1.x - pOpposite.x);
        const ang2 = Math.atan2(p2.y - pOpposite.y, p2.x - pOpposite.x);
        let dAng = ang2 - ang1;
        while (dAng > Math.PI) dAng -= 2 * Math.PI;
        while (dAng < -Math.PI) dAng += 2 * Math.PI;

        const ang = ang1 + t * dAng;
        flankPoints.push({
          x: pOpposite.x + arcRadius * Math.cos(ang),
          y: pOpposite.y + arcRadius * Math.sin(ang)
        });
      }
    }

    return { center: { x: cx, y: cy }, apexes, flankPoints };
  }

  // Cycloidal Drive (Robotics Speed Reducer)
  // N = number of lobes on disk (pins = N + 1), R_pin_circle = radius of pin centers, r_pin = roller pin radius, e = eccentricity
  static getCycloidDiscProfile(N, R_pin_circle, r_pin, e, steps = 720) {
    const points = [];
    const R = R_pin_circle;
    const r = r_pin;

    for (let i = 0; i <= steps; i++) {
      const phi = (i / steps) * 2 * Math.PI;
      // Formula for epitrochoidal disk with equidistant roller offset
      const psi = Math.atan2(
        Math.sin((1 - N) * phi),
        (R / (e * (N + 1))) - Math.cos((1 - N) * phi)
      );

      const x = (R / (N + 1)) * Math.cos(phi) + e * Math.cos(N * phi) - r * Math.cos(phi + psi);
      const y = (R / (N + 1)) * Math.sin(phi) - e * Math.sin(N * phi) - r * Math.sin(phi + psi);

      points.push({ x, y });
    }
    return points;
  }

  // CAD EXPORT 1: Clean AutoCAD Release 12 / 2000 ASCII DXF file
  static generateDXF(pointArrays, layerNames = ['CYCLOID_PROFILE']) {
    let dxf = '';
    // Header
    dxf += '0\nSECTION\n2\nHEADER\n9\n$ACADVER\n1\nAC1009\n0\nENDSEC\n';
    // Entities
    dxf += '0\nSECTION\n2\nENTITIES\n';

    pointArrays.forEach((pts, idx) => {
      const layer = layerNames[idx] || `PROFILE_${idx + 1}`;
      if (pts.length < 2) return;

      dxf += '0\nPOLYLINE\n';
      dxf += `8\n${layer}\n`;
      dxf += '66\n1\n'; // Vertices follow
      dxf += '70\n1\n'; // 1 = Closed polyline

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
  static generateSVG(pointArrays, strokeColors = ['#38bdf8'], width = 600, height = 600) {
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    pointArrays.flat().forEach(p => {
      if (p.x < minX) minX = p.x;
      if (p.x > maxX) maxX = p.x;
      if (p.y < minY) minY = p.y;
      if (p.y > maxY) maxY = p.y;
    });

    const pad = 20;
    const viewW = (maxX - minX) + pad * 2 || 100;
    const viewH = (maxY - minY) + pad * 2 || 100;
    const vMinX = minX - pad;
    const vMinY = minY - pad;

    let svg = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    svg += `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vMinX} ${vMinY} ${viewW} ${viewH}" width="${width}" height="${height}">\n`;
    svg += `  <rect x="${vMinX}" y="${vMinY}" width="${viewW}" height="${viewH}" fill="#0d1117" />\n`;

    pointArrays.forEach((pts, idx) => {
      if (pts.length < 2) return;
      const col = strokeColors[idx] || '#38bdf8';
      const d = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(3)} ${p.y.toFixed(3)}`).join(' ') + ' Z';
      svg += `  <path d="${d}" fill="none" stroke="${col}" stroke-width="1.5" stroke-linejoin="round" />\n`;
    });

    svg += `</svg>\n`;
    return svg;
  }
}
