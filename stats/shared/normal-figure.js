/* NormalFigure: a normal curve drawn on the DATA axis (minutes, points, cm), as an SVG string. No DOM, so a spec, a unit test and a page can all use it.
     NormalFigure.svg(desc)   the picture. desc:
         mean, sd      a number, or '?' for an unknown
         units         shown at the right end of the axis
         shade         'left' | 'right' | 'between' | null (null draws the bare curve)
         area          the SHADED area as a fraction (0.05 for "the slowest 5%"); labeled in percent. For 'between' it is the middle area.
         boundary      a number, or '?' (an unknown), or null (no boundary line). 'between' draws two.
         areaLabel     false hides the percent label (default true)
         tags          [{ n:1, at:'mean'|'boundary'|'area' }]  numbered dots for a labeling task
         interactive   false: a static picture (the board page). Dragging lives in NK.boundary (boundary-kit.js), which shares this geometry.
     NormalFigure.geom   the layout constants and the x / y maps, used by NK.boundary
     NormalFigure.ppf / cdf   the normal math, own implementation (checked against scipy in tests/unit/stats-11-wiring.test.js)
   The boundary sits where the area says it does (from `area` and `shade`), never from the label, so a '?' picture does not give the value away. */
(function (root) {
  'use strict';
  var MINUS = '−';
  function erf(x) { var s = x < 0 ? -1 : 1, a = Math.abs(x), t = a, sum = a, n = 0; while (Math.abs(t) > 1e-17 * Math.abs(sum) && n < 400) { n++; t *= -a * a / n; sum += t / (2 * n + 1); } return s * 2 / Math.sqrt(Math.PI) * sum; }
  function cdf(z) { return 0.5 * (1 + erf(z / Math.SQRT2)); }
  function ppf(p) { var lo = -8, hi = 8; for (var i = 0; i < 100; i++) { var m = (lo + hi) / 2; if (cdf(m) < p) lo = m; else hi = m; } return (lo + hi) / 2; }
  function pdf(z) { return Math.exp(-z * z / 2) / Math.sqrt(2 * Math.PI); }

  var G = { W: 560, H: 250, X0: 24, X1: 536, TOP: 36, BASE: 188, ZMIN: -3.5, ZMAX: 3.5 };
  G.X = function (z) { return G.X0 + (z - G.ZMIN) / (G.ZMAX - G.ZMIN) * (G.X1 - G.X0); };
  G.Y = function (z) { return G.BASE - pdf(z) / 0.4 * (G.BASE - G.TOP); };
  G.curve = function (a, b) { var d = ''; for (var z = a; z <= b + 1e-9; z += 0.05) d += (d ? 'L' : 'M') + G.X(z).toFixed(1) + ' ' + G.Y(z).toFixed(1); return d; };
  G.region = function (a, b) { return G.curve(a, b) + 'L' + G.X(b).toFixed(1) + ' ' + G.BASE + 'L' + G.X(a).toFixed(1) + ' ' + G.BASE + 'Z'; };

  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  function fmt(v) { if (typeof v !== 'number') return String(v); var s = String(+v.toFixed(2)); return s.replace('-', MINUS); }
  function num(v) { return typeof v === 'number' && isFinite(v); }

  /* z positions of the shaded region's edges, from the shaded area */
  function edges(d) {
    var a = d.area, lo = G.ZMIN, hi = G.ZMAX;
    if (d.shade === 'left') return { shade: [lo, ppf(a)], marks: [ppf(a)] };
    if (d.shade === 'right') return { shade: [ppf(1 - a), hi], marks: [ppf(1 - a)] };
    if (d.shade === 'between') { var u = ppf(0.5 + a / 2); return { shade: [-u, u], marks: [-u, u] }; }
    return { shade: null, marks: [] };
  }

  function svg(d) {
    d = d || {}; var E = edges(d), X = G.X, Y = G.Y, B = G.BASE, T = G.TOP, o = [];
    var known = num(d.mean) && num(d.sd), unit = d.units ? esc(d.units) : '';
    var what = 'Normal curve, mean ' + (num(d.mean) ? d.mean : 'unknown') + (unit ? ' ' + unit : '') + ', SD ' + (num(d.sd) ? d.sd : 'unknown') + '.' +
      (d.shade ? ' The ' + (d.shade === 'between' ? 'middle ' : d.shade + ' ') + (d.areaLabel === false ? '' : Math.round(d.area * 1000) / 10 + '% ') + 'is shaded.' : '');
    o.push('<svg class="nfig" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + G.W + ' ' + G.H + '" role="img" aria-label="' + esc(what) + '" style="width:100%;max-width:' + G.W + 'px;height:auto;display:block">');
    if (E.shade) o.push('<path d="' + G.region(E.shade[0], E.shade[1]) + '" fill="#cfe0ff" stroke="none"/>');
    o.push('<path d="' + G.curve(G.ZMIN, G.ZMAX) + '" fill="none" stroke="#2b4fd9" stroke-width="3"/>');
    o.push('<line x1="' + G.X0 + '" x2="' + G.X1 + '" y1="' + B + '" y2="' + B + '" stroke="#7a8a99" stroke-width="1.5"/>');
    o.push('<line x1="' + X(0) + '" x2="' + X(0) + '" y1="' + Y(0).toFixed(1) + '" y2="' + B + '" stroke="#142230" stroke-width="2"/>');
    for (var k = -3; k <= 3; k++) {
      if (!known && k !== 0) continue;
      o.push('<line x1="' + X(k) + '" x2="' + X(k) + '" y1="' + B + '" y2="' + (B + 5) + '" stroke="#7a8a99" stroke-width="1.5"/>');
      var label = k === 0 ? (num(d.mean) ? fmt(d.mean) : '?') : fmt(d.mean + k * d.sd);
      o.push('<text x="' + X(k) + '" y="' + (B + 20) + '" text-anchor="middle" font-size="13" font-weight="600" fill="#142230">' + esc(label) + '</text>');
    }
    var unk = (d.mean === '?' ? ['mean = ?'] : []).concat(d.sd === '?' ? ['SD = ?'] : []);   // say which quantity is unknown
    if (unk.length) o.push('<text x="' + (G.X0 + 4) + '" y="22" font-size="15" font-weight="700" fill="#142230">' + unk.join(', ') + '</text>');
    if (d.units) o.push('<text x="' + G.X1 + '" y="' + (B - 6) + '" text-anchor="end" font-size="12" fill="#566170">' + unit + '</text>');
    var bs = d.boundary == null ? null : (Array.isArray(d.boundary) ? d.boundary : [d.boundary]);
    E.marks.forEach(function (z, i) {
      if (!bs) return;
      var lab = bs[Math.min(i, bs.length - 1)];
      o.push('<line x1="' + X(z).toFixed(1) + '" x2="' + X(z).toFixed(1) + '" y1="' + (T - 8) + '" y2="' + B + '" stroke="#b3412e" stroke-width="2.5" stroke-dasharray="6 4"/>');
      o.push('<text x="' + X(z).toFixed(1) + '" y="' + (T - 14) + '" text-anchor="middle" font-size="16" font-weight="700" fill="#b3412e">' + esc(fmt(lab)) + '</text>');
    });
    var mid = null;
    if (E.shade) {
      var a = Math.max(E.shade[0], G.ZMIN), b = Math.min(E.shade[1], G.ZMAX); mid = (a + b) / 2;
      if (d.areaLabel !== false) {
        var wide = (X(b) - X(a)) >= 70, ty = wide ? B - 14 : Math.max(14, Math.min(B - 14, Y(mid) - 8));
        o.push('<text x="' + X(mid).toFixed(1) + '" y="' + ty.toFixed(1) + '" text-anchor="middle" font-size="16" font-weight="700" fill="#142230">' + Math.round(d.area * 1000) / 10 + '%</text>');
      }
    }
    (d.tags || []).forEach(function (t) {
      var x, y;
      if (t.at === 'mean') { x = X(0); y = B + 40; }
      else if (t.at === 'boundary') { x = E.marks.length ? X(E.marks[E.marks.length - 1]) : X(1); y = B + 40; }
      else { x = mid == null ? X(-1) : X(mid); y = B - 48; }
      o.push('<circle cx="' + x.toFixed(1) + '" cy="' + y + '" r="11" fill="#fff" stroke="#142230" stroke-width="2"/><text x="' + x.toFixed(1) + '" y="' + (y + 5) + '" text-anchor="middle" font-size="14" font-weight="700" fill="#142230">' + t.n + '</text>');
    });
    o.push('</svg>');
    return o.join('');
  }

  var NF = { svg: svg, geom: G, edges: edges, ppf: ppf, cdf: cdf, pdf: pdf, fmt: fmt };
  root.NormalFigure = NF; if (typeof module !== 'undefined' && module.exports) module.exports = NF;
})(typeof window !== 'undefined' ? window : globalThis);
