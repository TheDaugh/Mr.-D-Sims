/* Atom clouds: every subshell drawn as a cloud of glowing dots in its real shape, one color per subshell.
   Used by the Unit 4 trailer and the Trends Lab, so what students see in the video is what they work with.
   AtomCloud.draw(ctx, sym, cx, cy, R, t, opts)  -> projector;  AtomCloud.proj(cx, cy, t, opts);  AtomCloud.config(Z);  AtomCloud.SUBC;  AtomCloud.subKey(c)
   opts: q detail (1 = full, 0.2 = tiny), spin, tilt, phase, alpha, ghostA (the open spot in a p subshell), outerA, outerS (outer-shell alpha, scale),
         outerLo/outerHi (draw only that fraction of the outer-shell points), only (one subshell key), hide (skip one key), noNuc.
   Needs window.TrendsData for each atom's Z and period. */
(function (root) {
  "use strict";
  var D = root.TrendsData;
  function clamp(x, a, b) { return Math.max(a, Math.min(b, x)); }
  function rng(seed) { return function () { seed |= 0; seed = seed + 0x6D2B79F5 | 0; var t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  var ORDER = [[1, 0], [2, 0], [2, 1], [3, 0], [3, 1], [4, 0], [3, 2], [4, 1], [5, 0], [4, 2], [5, 1], [6, 0]];
  function config(Z) { var left = Z, out = [], i; for (i = 0; i < ORDER.length && left > 0; i++) { var cap = 2 * (2 * ORDER[i][1] + 1), e = Math.min(cap, left); left -= e; out.push({ n: ORDER[i][0], l: ORDER[i][1], e: e }); } return out; }
  var ANG = {
    1: [function (u) { return u[0] * u[0]; }, function (u) { return u[1] * u[1]; }, function (u) { return u[2] * u[2]; }],
    2: [function (u) { return 4 * u[0] * u[0] * u[1] * u[1]; }, function (u) { return 4 * u[0] * u[0] * u[2] * u[2]; }, function (u) { return 4 * u[1] * u[1] * u[2] * u[2]; }, function (u) { var q = u[0] * u[0] - u[1] * u[1]; return q * q; }, function (u) { var q = (3 * u[2] * u[2] - 1) / 2; return q * q; }]
  };
  function randU(r) { var z = 2 * r() - 1, ph = 6.2832 * r(), s = Math.sqrt(1 - z * z); return [s * Math.cos(ph), s * Math.sin(ph), z]; }
  function sampleOrb(l, o, count, fr, r) {
    var pts = [], tries = 0, u, rad; while (pts.length < count * 3 && tries++ < count * 80) { u = randU(r); if (r() < Math.pow(ANG[l][o](u), l === 1 ? 3.5 : 1.5)) { rad = fr * (0.4 + 0.6 * Math.pow(r(), 0.6)); pts.push(u[0] * rad, u[1] * rad, u[2] * rad); } } return pts;
  }
  /* One color per subshell, the same in every scene and in the Explore. s clouds are spheres, p clouds are dumbbells. */
  var SUBC = { "1s": "#5aa9ff", "2s": "#2ee6d6", "2p": "#ff5fb8", "3s": "#b6f23c", "3p": "#ffa030", "4s": "#ffe25a", "3d": "#a98bff", "4p": "#ff6a4a", "5s": "#7affc8", "4d": "#d9b8ff", "5p": "#ff8fb0", "6s": "#e8f2ff" };
  function subKey(c) { return c.n + "spdf"[c.l]; }
  function buildTop(sym, q) {
    var el = D.BY[sym], cfg = config(el.Z), N = el.period, r = rng(el.Z * 131 + 7), subs = [];
    cfg.forEach(function (c) {
      var outer = c.n === N, key = subKey(c), col = SUBC[key] || "#ffffff", fr = Math.pow(c.n / N, 1.25) * (c.l === 0 ? 0.8 : c.l === 1 ? (outer ? 0.95 : 1.25) : 0.92), i, o;
      if (c.l === 0) { var cnt = Math.max(8, Math.round((120 + 90 * c.e) * q)), pts = []; for (i = 0; i < cnt; i++) { var u = randU(r), rad = fr * (0.9 + 0.2 * r()); pts.push(u[0] * rad, u[1] * rad, u[2] * rad); } subs.push({ pts: pts, col: col, key: key, outer: outer, tag: "orb", a: outer ? 0.95 : 0.34 }); }
      else {
        var nOrb = c.l === 1 ? 3 : 5, per = c.l === 1 ? 200 : 110;
        for (o = 0; o < nOrb; o++) {
          var ej = c.e <= nOrb ? (o < c.e ? 1 : 0) : (o < c.e - nOrb ? 2 : 1);
          if (ej > 0) subs.push({ pts: sampleOrb(c.l, o, Math.max(6, Math.round(per * ej * q)), fr, r), col: col, key: key, outer: outer, tag: "orb", a: outer ? 0.8 : 0.42 });
          if (c.l === 1 && ej === 1 && c.e > nOrb) subs.push({ pts: sampleOrb(c.l, o, Math.max(6, Math.round(per * q)), fr, r), col: col, key: key, outer: outer, tag: "ghost", a: 0.6 });
        }
      }
    });
    return { subs: subs, N: N, Z: el.Z, cfg: cfg };
  }
  var SPR = {};
  function sprite(col) { if (SPR[col]) return SPR[col]; var c = document.createElement("canvas"); c.width = c.height = 32; var x = c.getContext("2d"), gr = x.createRadialGradient(16, 16, 0, 16, 16, 16); gr.addColorStop(0, "rgba(255,255,255,.95)"); gr.addColorStop(0.22, col); gr.addColorStop(1, "rgba(0,0,0,0)"); x.fillStyle = gr; x.fillRect(0, 0, 32, 32); return (SPR[col] = c); }
  var TOPC = {}; function getTop(sym, q) { var k = sym + "|" + q; return TOPC[k] || (TOPC[k] = buildTop(sym, q)); }
  function proj(cx, cy, t, o) {
    var spin = (o.spin == null ? 1.6 : o.spin) * t + (o.phase || 0), tilt = (o.tilt == null ? 0.62 : o.tilt) + 0.07 * Math.sin(t * 2.3 + (o.phase || 0)), cs = Math.cos(spin), sn = Math.sin(spin), ct = Math.cos(tilt), st = Math.sin(tilt);
    return function (x, y, z) { var x1 = x * cs + z * sn, z1 = -x * sn + z * cs, y2 = y * ct - z1 * st, z2 = y * st + z1 * ct, f = 900 / (900 + z2); return [cx + x1 * f, cy + y2 * f, f, z2]; };
  }
  /* o: q detail, spin, tilt, phase, alpha, ghostA, outerA, outerS, only (draw just this subshell key), hide (skip this key), noNuc */
  function draw(g, sym, cx, cy, Ro, t, o) {
    o = o || {}; var T = getTop(sym, o.q || 1), pj = proj(cx, cy, t, o), al = o.alpha == null ? 1 : o.alpha, nr = Math.max(5, Ro * 0.045), i, gr;
    if (al <= 0.01) return pj;
    if (!o.noNuc && !o.only) { gr = g.createRadialGradient(cx, cy, 0, cx, cy, nr * 2.4); gr.addColorStop(0, "rgba(255,248,215," + al + ")"); gr.addColorStop(0.3, "rgba(255,200,80," + 0.9 * al + ")"); gr.addColorStop(1, "rgba(255,150,40,0)"); g.fillStyle = gr; g.beginPath(); g.arc(cx, cy, nr * 2.4, 0, 7); g.fill(); }
    g.globalCompositeOperation = "lighter"; var base = Math.max(4, Ro / 24);
    T.subs.forEach(function (s) {
      if (o.only && s.key !== o.only) return; if (o.hide && s.key === o.hide) return;
      var am = s.tag === "ghost" ? (o.ghostA == null ? 0 : o.ghostA) : s.outer ? (o.outerA == null ? 1 : o.outerA) : 1;
      if (am <= 0.01) return; var sc = Ro * (s.outer ? (o.outerS == null ? 1 : o.outerS) : 1), p = s.pts, sz = base * (s.outer ? 1.25 : 0.9), spr = sprite(s.col);
      var n3 = p.length / 3, lo = s.outer && o.outerLo != null ? o.outerLo : 0, hi = s.outer && o.outerHi != null ? o.outerHi : 1;
      for (i = Math.floor(lo * n3) * 3; i < Math.floor(hi * n3) * 3; i += 3) {
        var x = p[i] * sc, y = p[i + 1] * sc, z = p[i + 2] * sc, q = pj(x, y, z), b = clamp(0.8 - q[3] / (Ro * 2.6), 0.25, 1.15);
        g.globalAlpha = clamp(am * al * s.a * b, 0, 1); g.drawImage(spr, q[0] - sz * q[2] / 2, q[1] - sz * q[2] / 2, sz * q[2], sz * q[2]);
      }
    });
    g.globalCompositeOperation = "source-over"; g.globalAlpha = 1; return pj;
  }
  root.AtomCloud = { SUBC: SUBC, subKey: subKey, config: config, proj: proj, draw: draw, sprite: sprite, ORDER: ORDER };
})(typeof window !== "undefined" ? window : globalThis);
