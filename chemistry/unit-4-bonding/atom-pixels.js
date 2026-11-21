/* Atom pixels: flat, blocky atoms in the style of the lab room. Every subshell is a patch of square cells in its real 2-D shape
   (s = a ring, p = three dumbbells, d = a four-leaf clover), one color per subshell. No 3-D, no rotation.
   Used by the Unit 4 trailer and the Trends Lab so the video and the sim match.
   AtomPixels.draw(ctx, sym, cx, cy, R, t, opts)   R = radius of the outer shell in pixels
   AtomPixels.tip(sym, cx, cy, R, opts)            -> [x, y] of the open spot facing opts.ghostDir (radians, default pi = pointing left)
   AtomPixels.config(Z), .SUBC, .subKey(c)
   opts: alpha, phase, cell (px per cell, default R/13 between 3 and 18), ghostA (the open spot), ghostDir, outerA, outerS (outer-shell alpha, scale),
         outerLo/outerHi (draw only that share of the outer-shell cells: electrons leaving or arriving), outerOnly, only (one subshell key), hide, noNuc.
   Needs window.TrendsData for each atom's Z and period. */
(function (root) {
  "use strict";
  var D = root.TrendsData;
  function clamp(x, a, b) { return Math.max(a, Math.min(b, x)); }
  var ORDER = [[1, 0], [2, 0], [2, 1], [3, 0], [3, 1], [4, 0], [3, 2], [4, 1], [5, 0], [4, 2], [5, 1], [6, 0]];
  function config(Z) { var left = Z, out = [], i; for (i = 0; i < ORDER.length && left > 0; i++) { var cap = 2 * (2 * ORDER[i][1] + 1), e = Math.min(cap, left); left -= e; out.push({ n: ORDER[i][0], l: ORDER[i][1], e: e }); } return out; }
  var SUBC = { "1s": "#5aa9ff", "2s": "#2ee6d6", "2p": "#ff5fb8", "3s": "#b6f23c", "3p": "#ffa030", "4s": "#ffe25a", "3d": "#a98bff", "4p": "#ff6a4a", "5s": "#7affc8", "4d": "#d9b8ff", "5p": "#ff8fb0", "6s": "#e8f2ff" };
  function subKey(c) { return c.n + "spdf"[c.l]; }
  function hash(a, b, c) { var x = Math.sin(a * 127.1 + b * 311.7 + c * 74.7) * 43758.5453; return x - Math.floor(x); }
  function lighten(hex, k) { var n = parseInt(hex.slice(1), 16), r = n >> 16 & 255, g = n >> 8 & 255, b = n & 255; r = Math.round(r + (255 - r) * k); g = Math.round(g + (255 - g) * k); b = Math.round(b + (255 - b) * k); return "rgb(" + r + "," + g + "," + b + ")"; }
  var LIGHT = {}; function light(col) { return LIGHT[col] || (LIGHT[col] = lighten(col, 0.38)); }

  /* shapes in unit coordinates (outer shell radius = 1); cu = one cell in those units, so thin shapes never fall between cells */
  function ring(x, y, fr, th, cu) { var r = Math.sqrt(x * x + y * y), w = Math.max(th, cu * 0.8); if (fr < 0.3) return r < Math.max(fr * 1.15, cu * 0.9) ? 1 : 0; var d = Math.abs(r - fr) / w; return d < 1 ? 1 : 0; }
  function lobe(x, y, ang, c0, a, b, cu) { var ca = Math.cos(ang), sa = Math.sin(ang), u = (x * ca + y * sa - c0) / a, v = (-x * sa + y * ca) / Math.max(b, cu * 0.9); return u * u + v * v <= 1 ? 1 : 0; }
  function dumbbell(x, y, ang, fr, cu) { return Math.max(lobe(x, y, ang, 0.57 * fr, 0.43 * fr, 0.17 * fr, cu), lobe(x, y, ang + Math.PI, 0.57 * fr, 0.43 * fr, 0.17 * fr, cu)); }
  function clover(x, y, fr, cu) { var k, m = 0; for (k = 0; k < 4; k++) m = Math.max(m, lobe(x, y, Math.PI / 4 + k * Math.PI / 2, 0.55 * fr, 0.4 * fr, 0.2 * fr, cu)); return m; }

  var CACHE = {};
  function build(sym) {
    if (CACHE[sym]) return CACHE[sym];
    var el = D.BY[sym], cfg = config(el.Z), N = el.period, subs = [];
    cfg.forEach(function (c) {
      var outer = c.n === N, key = subKey(c), col = SUBC[key] || "#ffffff", sh, sh = Math.pow(c.n / N, 1.1), fr = sh * (c.l === 0 ? (outer ? 0.95 : 0.78) : c.l === 1 ? 0.95 : 0.85), o, off = 0;
      if (c.l === 0) subs.push({ key: key, col: col, outer: outer, kind: "s", fr: fr, prob: c.e >= 2 ? 1 : 0.72, salt: subs.length + 1 });
      else if (c.l === 1) {
        for (o = 0; o < 3; o++) {
          var ej = c.e <= 3 ? (o < c.e ? 1 : 0) : (o < c.e - 3 ? 2 : 1), single = c.e > 3 && ej === 1;
          if (ej > 0) subs.push({ key: key, col: col, outer: outer, kind: "p", fr: fr, prob: ej === 2 ? 1 : 0.8, single: single, idx: o, salt: subs.length + 1 });
        }
      } else subs.push({ key: key, col: col, outer: outer, kind: "d", fr: fr, prob: c.e >= 8 ? 1 : 0.8, salt: subs.length + 1 });
    });
    // axes: a singly filled p orbital points at the open spot; the others sit 60 and 120 degrees from it
    var k = 1; subs.forEach(function (s) { if (s.kind !== "p") return; if (s.single) s.off = 0; else { s.off = k * Math.PI / 3; k++; } });
    subs.forEach(function (s) { if (s.kind === "p" && s.outer === false) s.off = (s.idx || 0) * Math.PI / 3; });   // inner p shells: plain 0, 60, 120
    return (CACHE[sym] = { subs: subs, N: N, Z: el.Z, hasGhost: subs.some(function (s) { return s.single && s.outer; }) });
  }

  function draw(g, sym, cx, cy, R, t, o) {
    o = o || {}; var T = build(sym), al = o.alpha == null ? 1 : o.alpha; if (al <= 0.01) return;
    var c = o.cell || clamp(Math.round(R / 16), 3, 14), cu = c / R, gap = c >= 7 ? 1 : 0, gx = Math.round(cx / c), gy = Math.round(cy / c), ph = o.phase || 0, dir = o.ghostDir == null ? Math.PI : o.ghostDir;
    function cellRect(i, j, col, a) { g.globalAlpha = clamp(a, 0, 1); g.fillStyle = col; g.fillRect((gx + i) * c, (gy + j) * c, c - gap, c - gap); }
    T.subs.forEach(function (s) {
      if (o.only && s.key !== o.only) return; if (o.hide && s.key === o.hide) return; if (o.outerOnly && !s.outer) return;
      var am = s.outer ? (o.outerA == null ? 1 : o.outerA) : 1, sc = s.outer ? (o.outerS == null ? 1 : o.outerS) : 1; if (am <= 0.01) return;
      var fr = s.fr * sc, lim = Math.ceil(fr * 1.15 / cu) + 1, lo = s.outer && o.outerLo != null ? o.outerLo : 0, hi = s.outer && o.outerHi != null ? o.outerHi : 1, i, j, base = s.col, lt = light(s.col);
      var ang = (dir + (s.off || 0));
      for (i = -lim; i <= lim; i++) for (j = -lim; j <= lim; j++) {
        // the cell's centre, measured from the atom's centre, in unit coordinates
        var x = ((gx + i + 0.5) * c - cx) / R, y = ((gy + j + 0.5) * c - cy) / R, d;
        d = s.kind === "s" ? ring(x, y, fr, 0.1 * sc, cu) : s.kind === "p" ? dumbbell(x, y, ang, fr, cu) : clover(x, y, fr, cu);
        if (!d) continue;
        var h = hash(i, j, s.salt), u = hash(i + 17, j + 5, s.salt + 3);
        if (u < lo || u >= hi) continue;
        if (s.prob < 1 && h > s.prob) continue;
        cellRect(i, j, h < 0.28 ? lt : base, al * am);
      }
    });
    // the open spot: a flickering lobe pointing at whoever is coming
    if (o.ghostA > 0.01 && T.hasGhost && !o.only && !o.outerOnly) {
      var gs = T.subs.filter(function (s) { return s.single && s.outer; })[0], fr2 = gs.fr * (o.outerS == null ? 1 : o.outerS), lim2 = Math.ceil(fr2 * 1.15 / cu) + 1, i2, j2;
      for (i2 = -lim2; i2 <= lim2; i2++) for (j2 = -lim2; j2 <= lim2; j2++) {
        var x2 = ((gx + i2 + 0.5) * c - cx) / R, y2 = ((gy + j2 + 0.5) * c - cy) / R;
        if (!lobe(x2, y2, dir, 0.57 * fr2, 0.43 * fr2, 0.17 * fr2, cu)) continue;
        var h2 = hash(i2, j2, 99); if (h2 > 0.8) continue; cellRect(i2, j2, gs.col, al * o.ghostA * 0.75);
      }
    }
    // the nucleus: a gold block
    if (!o.noNuc && !o.only && !o.outerOnly) { var n = Math.max(2, Math.round(R * 0.09 / c)); if (n % 2) n++; var nx = Math.round(cx / c) * c - n / 2 * c, ny = Math.round(cy / c) * c - n / 2 * c; g.globalAlpha = al; g.fillStyle = "#ff9d2e"; g.fillRect(nx, ny, n * c - gap, n * c - gap); g.fillStyle = "#ffe08a"; g.fillRect(nx + c * 0.5, ny + c * 0.5, (n - 1) * c - gap, (n - 1) * c - gap); }
    g.globalAlpha = 1;
  }
  function tip(sym, cx, cy, R, o) { var dir = o && o.ghostDir != null ? o.ghostDir : Math.PI, sc = o && o.outerS ? o.outerS : 1; return [cx + Math.cos(dir) * 0.6 * 0.95 * R * sc, cy + Math.sin(dir) * 0.6 * 0.95 * R * sc]; }

  root.AtomPixels = { SUBC: SUBC, subKey: subKey, config: config, draw: draw, tip: tip, ORDER: ORDER };
})(typeof window !== "undefined" ? window : globalThis);
