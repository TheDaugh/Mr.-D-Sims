/* Statistics stencils for the whiteboard: density curves, normal curves with SD marks, shaded areas, graph frames,
   word cards (a term, a plain sentence, and pictures of two examples and one non-example), and the lesson routines.
   Every curve is computed from a formula below, so the mean and median lines sit where they really are.

   buildLibrary(convert) -> Excalidraw library items. Each item is one group; ungroup (Ctrl+Shift+G) to edit parts. */

import { INK, BLUE, RED, GREEN, GRAY, rect, ellipse, text, line, arrow, labeled, makeItem } from './draw.js';

function item(convert, name, skeletons) { return makeItem(convert, 'stats', name, skeletons); }

var ORANGE = '#e8590c';
var FILL = '#ced4da';
var SHADE = '#a5d8ff';

/* ---------- distributions: each is { lo, hi, f(x) } on its own domain ---------- */

function uniform(a, b) { return { kind: 'uniform', lo: a, hi: b, f: function (x) { return x >= a && x <= b ? 1 / (b - a) : 0; } }; }
function normal(mu, sd, lo, hi) {
  return { kind: 'normal', lo: lo === undefined ? mu - 4 * sd : lo, hi: hi === undefined ? mu + 4 * sd : hi,
    f: function (x) { return Math.exp(-0.5 * Math.pow((x - mu) / sd, 2)) / (sd * Math.sqrt(2 * Math.PI)); } };
}
/* gamma shape k, scale t: skewed right. Shape only needs the unnormalised form; we normalise numerically below. */
function skewRight(k, t, hi) {
  var d = { kind: 'skew', lo: 0, hi: hi, f: function (x) { return x <= 0 ? 0 : Math.pow(x, k - 1) * Math.exp(-x / t); } };
  return normalise(d);
}
function skewLeft(k, t, lo, hi) {
  var r = skewRight(k, t, hi - lo);
  return { kind: 'skew', lo: lo, hi: hi, f: function (x) { return r.f(hi - x + 0); } /* mirror: tail points left */ };
}
function normalise(d) {
  var n = 4000, s = 0, i, dx = (d.hi - d.lo) / n;
  for (i = 0; i < n; i++) s += d.f(d.lo + (i + 0.5) * dx) * dx;
  var g = d.f; d.f = function (x) { return g(x) / s; };
  return d;
}
/* numeric mean and median of a density on its domain */
function stats(d) {
  var n = 6000, dx = (d.hi - d.lo) / n, tot = 0, m = 0, acc = 0, med = null, i, x, p;
  for (i = 0; i < n; i++) { x = d.lo + (i + 0.5) * dx; p = d.f(x) * dx; tot += p; m += x * p; }
  for (i = 0; i < n; i++) { x = d.lo + (i + 0.5) * dx; acc += d.f(x) * dx; if (med === null && acc >= tot / 2) med = x; }
  return { mean: m / tot, median: med, area: tot };
}

/* ---------- a graph: axis, ticks, curves, vertical lines, shading ---------- */

function ctext(cx, y, t, size, o) {
  var w = String(t).length * (size || 16) * 0.55;
  return text(cx - w / 2, y, t, size, o);
}

/* spec: { w, h (plot area size), lo, hi (x range), ymax, ticks: [[value,label]], xlabel, ylabel, curves: [{d, stroke, fill, width}],
   vlines: [{x, label, dash, color, side}], shade: [{d, from, to, color}], yTicks: [[value,label]], bars: [...], pad } */
function graph(spec) {
  var out = [], w = spec.w, h = spec.h, L = 46, T = 34, i, k, c, pts, x, y, sx = function (v) { return L + (v - spec.lo) / (spec.hi - spec.lo) * w; };
  var ymax = spec.ymax, sy = function (v) { return T + h - (v / ymax) * h; };
  (spec.shade || []).forEach(function (s) {
    var a = Math.max(s.from, s.d.lo), b = Math.min(s.to, s.d.hi), n = 50;
    pts = [[sx(a) - L, h]];
    for (i = 0; i <= n; i++) { x = a + (b - a) * i / n; pts.push([sx(x) - L, sy(s.d.f(x)) - T]); }
    pts.push([sx(b) - L, h], [sx(a) - L, h]);
    out.push(line(L, T, pts, { strokeWidth: 1, strokeColor: s.color || SHADE, backgroundColor: s.color || SHADE, opacity: 100 }));
  });
  (spec.bars || []).forEach(function (b) {
    out.push(rect(sx(b.x0), sy(b.h), sx(b.x1) - sx(b.x0), T + h - sy(b.h), { strokeWidth: 1, backgroundColor: b.fill || '#e9ecef', strokeColor: GRAY }));
  });
  /* baseline and ticks */
  out.push(line(L - 8, T + h, [[0, 0], [w + 16, 0]], { strokeWidth: 2 }));
  (spec.ticks || []).forEach(function (t) {
    out.push(line(sx(t[0]), T + h, [[0, 0], [0, 7]], { strokeWidth: 2 }));
    if (t[1] !== '') out.push(ctext(sx(t[0]), T + h + 10, t[1], spec.tickSize || 16));
  });
  if (spec.xlabel) out.push(ctext(L + w / 2, T + h + (spec.tickSize || 16) + 18, spec.xlabel, 16, { strokeColor: GRAY }));
  /* y axis */
  if (spec.yaxis !== false) {
    out.push(arrow(L - 8, T + h, [[0, 0], [0, -(h + 12)]], { strokeWidth: 2 }));
    out.push(text(L - 30, 2, spec.ylabel || 'density', 16, { strokeColor: GRAY }));
    (spec.yTicks || []).forEach(function (t) {
      out.push(line(L - 14, sy(t[0]), [[0, 0], [12, 0]], { strokeWidth: 2 }));
      out.push(text(L - 14 - String(t[1]).length * 9.5 - 4, sy(t[0]) - 9, t[1], 16));
    });
  }
  (spec.curves || []).forEach(function (cv) {
    var d = cv.d;
    if (d.kind === 'uniform') {
      out.push(line(0, 0, [[sx(d.lo), T + h], [sx(d.lo), sy(d.f(d.lo + 1e-6))], [sx(d.hi), sy(d.f(d.lo + 1e-6))], [sx(d.hi), T + h]].map(function (p) { return p; }), { strokeWidth: cv.width || 3, strokeColor: cv.stroke || INK }));
      return;
    }
    pts = [];
    for (i = 0; i <= 90; i++) { x = d.lo + (d.hi - d.lo) * i / 90; pts.push([sx(x), sy(d.f(x))]); }
    out.push(line(pts[0][0], pts[0][1], pts.map(function (p) { return [p[0] - pts[0][0], p[1] - pts[0][1]]; }), { strokeWidth: cv.width || 3, strokeColor: cv.stroke || INK }));
  });
  (spec.vlines || []).forEach(function (v) {
    var top = T - 2;
    out.push(line(sx(v.x), top, [[0, 0], [0, h + 2]], { strokeWidth: 2, strokeColor: v.color || INK, strokeStyle: v.dash ? 'dashed' : 'solid' }));
    if (v.label) {
      var wd = v.label.length * 9;
      out.push(text(v.side === 'left' ? sx(v.x) - wd - 6 : sx(v.x) + 6, top - 22 + (v.dy || 0), v.label, 16, { strokeColor: v.color || INK }));
    }
  });
  return out;
}

/* ---------- small marks ---------- */

function tick(x, y, c) { return line(x, y, [[0, 6], [6, 14], [20, -4]], { strokeColor: c || GREEN, strokeWidth: 4 }); }
function cross(x, y, c) { return [line(x, y, [[0, 0], [16, 16]], { strokeColor: c || RED, strokeWidth: 4 }), line(x + 16, y, [[0, 0], [-16, 16]], { strokeColor: c || RED, strokeWidth: 4 })]; }

/* ---------- a mini picture for a word card: curve outline in a w x h box with a baseline ---------- */

function mini(x, y, w, h, d, o) {
  o = o || {};
  var out = [], i, xx, pts = [], ymax = 0, lo = d.lo, hi = d.hi, st = stats(d);
  for (i = 0; i <= 90; i++) { xx = lo + (hi - lo) * i / 90; ymax = Math.max(ymax, d.f(xx)); }
  var sx = function (v) { return (v - lo) / (hi - lo) * w; }, sy = function (v) { return h - (v / ymax) * (h - 6); };
  if (o.fill) {
    var fp = [[0, h]];
    if (d.kind === 'uniform') fp = [[0, h], [0, sy(d.f(lo + 1e-6))], [w, sy(d.f(lo + 1e-6))], [w, h], [0, h]];
    else { for (i = 0; i <= 60; i++) { xx = lo + (hi - lo) * i / 60; fp.push([sx(xx), sy(d.f(xx))]); } fp.push([w, h], [0, h]); }
    out.push(line(x, y, fp, { strokeWidth: 1, strokeColor: o.fill, backgroundColor: o.fill }));
  }
  out.push(line(x - 4, y + h, [[0, 0], [w + 8, 0]], { strokeWidth: 2 }));
  if (d.kind === 'uniform') out.push(line(x, y, [[0, h], [0, sy(d.f(lo + 1e-6))], [w, sy(d.f(lo + 1e-6))], [w, h]], { strokeWidth: 3 }));
  else {
    for (i = 0; i <= 90; i++) { xx = lo + (hi - lo) * i / 90; pts.push([sx(xx), sy(d.f(xx))]); }
    out.push(line(x + pts[0][0], y + pts[0][1], pts.map(function (p) { return [p[0] - pts[0][0], p[1] - pts[0][1]]; }), { strokeWidth: 3 }));
  }
  if (o.lines) {
    out.push(line(x + sx(st.median), y - 2, [[0, 0], [0, h + 2]], { strokeWidth: 2 }));
    out.push(line(x + sx(st.mean), y - 2, [[0, 0], [0, h + 2]], { strokeWidth: 2, strokeStyle: 'dashed', strokeColor: RED }));
  }
  if (o.center) out.push(line(x + w / 2, y - 2, [[0, 0], [0, h + 2]], { strokeWidth: 2, strokeStyle: 'dashed' }));
  return out;
}

/* the distributions the word cards draw */
var DIST = {
  bell: normal(0, 1, -3.6, 3.6),
  bellNarrow: normal(0, 0.6, -2, 2),
  bellWide: normal(0, 1.6, -4, 4),
  flat: uniform(0, 1),
  right: skewRight(2.4, 1, 9),
  right2: skewRight(1.6, 1, 8),
  left: skewLeft(2.4, 1, 0, 9),
  left2: skewLeft(1.6, 1, 0, 8),
  bus: uniform(0, 20)
};

/* ---------- word cards ---------- */

var CARD_W = 560, PIC_W = 150, PIC_H = 84;

function wrap(s, n) {
  var words = s.split(' '), lines = [], cur = '';
  words.forEach(function (w) {
    if ((cur + ' ' + w).trim().length > n) { lines.push(cur); cur = w; } else cur = (cur + ' ' + w).trim();
  });
  if (cur) lines.push(cur);
  return lines.join('\n');
}

/* card: term, one plain sentence, three pictures, each with a check or a cross and a short caption */
function card(term, sentence, pics) {
  var out = [], sentenceText = wrap(sentence, 44), nLines = sentenceText.split('\n').length, FR_H = PIC_H + 76;
  var y = 20, ph = 20 + 52 + nLines * 28 + 16 + FR_H + 24;
  out.push(rect(0, 0, CARD_W, ph, { strokeWidth: 2, backgroundColor: '#fff9db' }));
  out.push(text(22, y, term, 34, { strokeWidth: 2 }));
  y += 52;
  out.push(text(22, y, sentenceText, 22));
  y += nLines * 28 + 16;
  var gap = (CARD_W - 3 * (PIC_W + 20)) / 4;
  pics.forEach(function (p, i) {
    var fx = gap + i * (PIC_W + 20 + gap), px = fx + 10;
    out.push(rect(fx, y, PIC_W + 20, FR_H, { strokeWidth: 1, strokeColor: p.ok ? GREEN : RED, backgroundColor: '#ffffff' }));
    out = out.concat(p.draw(px, y + 12));
    out = out.concat(p.ok ? [tick(fx + 8, y + PIC_H + 24, GREEN)] : cross(fx + 8, y + PIC_H + 24));
    out.push(text(fx + 36, y + PIC_H + 22, wrap(p.cap, 18), 15, { strokeColor: p.ok ? '#2b8a3e' : '#c92a2a' }));
  });
  return out;
}
function pic(d, cap, ok, o) { return { draw: function (x, y) { return mini(x, y, PIC_W, PIC_H, d, o); }, cap: cap, ok: ok }; }

/* ---------- graph frames ---------- */

function tk(lo, hi, step, fmt) { var t = [], v; for (v = lo; v <= hi + 1e-9; v += step) t.push([v, fmt ? fmt(v) : String(Math.round(v * 100) / 100)]); return t; }
function blanks(lo, hi, step) { var t = [], v; for (v = lo; v <= hi + 1e-9; v += step) t.push([v, '']); return t; }

function sdTicks(mu, sd, symbols) {
  var t = [], k;
  for (k = -3; k <= 3; k++) {
    t.push([mu + k * sd, symbols ? (k === 0 ? 'μ' : (k < 0 ? 'μ − ' : 'μ + ') + (Math.abs(k) === 1 ? '' : Math.abs(k)) + 'σ') : '']);
  }
  return t;
}

/* ---------- the library ---------- */

function buildLibrary(convert) {
  var items = [];
  function add(name, sk) { items.push(item(convert, name, sk)); }

  var W = 380, H = 190;
  var bell = normal(50, 10, 10, 90), nar = normal(0, 1, -4, 4), wid = normal(0, 2, -8, 8);
  var rs = skewRight(2.5, 2, 20), ls = skewLeft(2.5, 7, 40, 100);
  var rsS = stats(rs), lsS = stats(ls);
  var bus = uniform(0, 20), bus40 = uniform(0, 40);
  var bellS = stats(bell);

  /* ===== Density curves ===== */
  add('Curves · blank axes', graph({ w: W, h: H, lo: 0, hi: 20, ymax: 1, ticks: blanks(0, 20, 5), xlabel: '' }));
  add('Curves · uniform 0 to 20 (bus wait)', graph({ w: W, h: H, lo: -1.5, hi: 21.5, ymax: 0.08, ticks: tk(0, 20, 5), xlabel: 'wait (minutes)', curves: [{ d: bus }], yTicks: [[0.05, '0.05']] }));
  add('Curves · uniform, shade over 15', graph({ w: W, h: H, lo: -1.5, hi: 21.5, ymax: 0.08, ticks: tk(0, 20, 5), xlabel: 'wait (minutes)', shade: [{ d: bus, from: 15, to: 20 }], curves: [{ d: bus }], yTicks: [[0.05, '0.05']] }));
  add('Curves · uniform 0 to 40', graph({ w: W, h: H, lo: -3, hi: 43, ymax: 0.04, ticks: tk(0, 40, 10), xlabel: 'minutes', curves: [{ d: bus40 }], yTicks: [[0.025, '0.025']] }));
  add('Curves · uniform, height and base to fill in', graph({ w: W, h: H, lo: -1.5, hi: 21.5, ymax: 0.08, ticks: blanks(0, 20, 5), curves: [{ d: bus }] }).concat([
    text(120, 140, 'height = 1 ÷ base', 20, { strokeColor: BLUE }), text(120, 172, 'area = base × height', 20, { strokeColor: BLUE })]));
  add('Curves · normal, mean = median', graph({ w: W, h: H, lo: 10, hi: 90, ymax: 0.045, ticks: blanks(10, 90, 20), curves: [{ d: bell }], vlines: [{ x: 50, label: 'mean = median', dash: true }] }));
  add('Curves · narrow and wide (both area 1)', graph({ w: W, h: H, lo: -8, hi: 8, ymax: 0.42, ticks: blanks(-8, 8, 4), curves: [{ d: nar, stroke: BLUE }, { d: wid, stroke: RED }] }).concat([
    text(250, 38, 'narrow and tall', 18, { strokeColor: BLUE }), text(290, 128, 'wide and low', 18, { strokeColor: RED })]));
  add('Curves · skewed right, mean and median', graph({ w: W, h: H, lo: 0, hi: 20, ymax: rs.f(2.6) * 1.12, ticks: blanks(0, 20, 5), curves: [{ d: rs }],
    vlines: [{ x: rsS.median, label: 'median', side: 'left' }, { x: rsS.mean, label: 'mean', dash: true, color: RED }] }));
  add('Curves · skewed left, mean and median', graph({ w: W, h: H, lo: 40, hi: 100, ymax: ls.f(100 - 1.5 * 7) * 1.12, ticks: blanks(40, 100, 20), curves: [{ d: ls }],
    vlines: [{ x: lsS.mean, label: 'mean', dash: true, color: RED, side: 'left' }, { x: lsS.median, label: 'median' }] }));
  add('Curves · histogram turning into a curve', graph({ w: W, h: H, lo: 10, hi: 90, ymax: 0.045, ticks: blanks(10, 90, 20), curves: [{ d: bell, stroke: BLUE }],
    bars: [[10, 20, 0.002], [20, 30, 0.009], [30, 40, 0.020], [40, 50, 0.034], [50, 60, 0.034], [60, 70, 0.020], [70, 80, 0.009], [80, 90, 0.002]].map(function (b) { return { x0: b[0], x1: b[1], h: b[2] }; }) }));

  /* ===== Normal curve ===== */
  var nb = normal(0, 1, -4, 4);
  function normalFrame(symbols, extra) {
    return graph({ w: 440, h: 200, lo: -4, hi: 4, ymax: 0.43, ticks: sdTicks(0, 1, symbols), curves: [{ d: nb }], shade: extra && extra.shade, vlines: extra && extra.vlines, yaxis: false });
  }
  add('Normal · SD marks, blanks to fill', normalFrame(false, { vlines: [{ x: 0, dash: true }] }));
  add('Normal · SD marks labeled μ ± σ', normalFrame(true, { vlines: [{ x: 0, dash: true }] }));
  add('Normal · middle 68 shaded', normalFrame(false, { shade: [{ d: nb, from: -1, to: 1 }] }).concat([ctext(0 + 46 + 220, 120, '68%', 28, { strokeColor: BLUE })]));
  add('Normal · middle 95 shaded', normalFrame(false, { shade: [{ d: nb, from: -2, to: 2 }] }).concat([ctext(46 + 220, 120, '95%', 28, { strokeColor: BLUE })]));
  add('Normal · middle 99.7 shaded', normalFrame(false, { shade: [{ d: nb, from: -3, to: 3 }] }).concat([ctext(46 + 220, 120, '99.7%', 28, { strokeColor: BLUE })]));
  add('Normal · tails (2.5% each, outside 2 SD)', normalFrame(false, { shade: [{ d: nb, from: -4, to: -2, color: '#ffc9c9' }, { d: nb, from: 2, to: 4, color: '#ffc9c9' }] }).concat([
    text(60, 168, '2.5%', 18, { strokeColor: RED }), text(436, 168, '2.5%', 18, { strokeColor: RED })]));
  add('Normal · shade left of a value', graph({ w: 440, h: 200, lo: -4, hi: 4, ymax: 0.43, ticks: [[0, '']], curves: [{ d: nb }], shade: [{ d: nb, from: -4, to: 1 }], vlines: [{ x: 1, label: 'x' }], yaxis: false }));
  add('Normal · shade right of a value', graph({ w: 440, h: 200, lo: -4, hi: 4, ymax: 0.43, ticks: [[0, '']], curves: [{ d: nb }], shade: [{ d: nb, from: 1, to: 4 }], vlines: [{ x: 1, label: 'x' }], yaxis: false }));
  add('Normal · shade between two values', graph({ w: 440, h: 200, lo: -4, hi: 4, ymax: 0.43, ticks: [[0, '']], curves: [{ d: nb }], shade: [{ d: nb, from: -0.8, to: 1.2 }], vlines: [{ x: -0.8, label: 'a', side: 'left' }, { x: 1.2, label: 'b' }], yaxis: false }));
  add('Normal · same SD, different means', graph({ w: 440, h: 190, lo: -3, hi: 9, ymax: 0.43, ticks: blanks(-3, 9, 3), curves: [{ d: normal(0, 1, -3, 9), stroke: BLUE }, { d: normal(5, 1, -3, 9), stroke: RED }], yaxis: false }));
  add('Normal · same mean, different SDs', graph({ w: 440, h: 190, lo: -6, hi: 6, ymax: 0.43, ticks: blanks(-6, 6, 3), curves: [{ d: normal(0, 1, -6, 6), stroke: BLUE }, { d: normal(0, 2, -6, 6), stroke: RED }], yaxis: false }));

  /* ===== Graph tools ===== */
  var nl = [], v;
  nl.push(line(0, 40, [[0, 0], [440, 0]], { strokeWidth: 3 }));
  for (v = 0; v <= 10; v++) { nl.push(line(20 + v * 40, 40, [[0, 0], [0, 10]], { strokeWidth: 2 })); nl.push(ctext(20 + v * 40, 56, String(v), 18)); }
  add('Tools · number line 0 to 10', nl);
  var nlb = []; for (v = 0; v <= 10; v++) nlb.push(line(20 + v * 40, 40, [[0, 0], [0, 10]], { strokeWidth: 2 }));
  add('Tools · number line, blank ticks', [line(0, 40, [[0, 0], [440, 0]], { strokeWidth: 3 })].concat(nlb));
  add('Tools · dot (stamp)', [ellipse(0, 0, 22, 22, { backgroundColor: INK })]);
  var stack = []; for (v = 0; v < 5; v++) stack.push(ellipse(0, -v * 26, 22, 22, { backgroundColor: INK }));
  add('Tools · stack of 5 dots', stack);
  add('Tools · histogram frame (seven bars)', graph({ w: 380, h: 140, lo: 0, hi: 7, ymax: 1, ticks: blanks(0, 7, 1), ylabel: 'frequency',
    bars: [0.25, 0.5, 0.75, 1, 0.75, 0.5, 0.25].map(function (h, i) { return { x0: i, x1: i + 1, h: h }; }) }));
  var bx = [], by = 30;
  bx.push(line(0, by + 30, [[0, 0], [440, 0]], { strokeWidth: 3 }));
  [[20, 'min'], [120, 'Q1'], [220, 'median'], [320, 'Q3'], [420, 'max']].forEach(function (p) { bx.push(line(p[0], by + 20, [[0, 0], [0, 20]], { strokeWidth: 3 })); bx.push(ctext(p[0], by + 62, p[1], 16, { strokeColor: GRAY })); });
  bx.push(rect(120, by, 200, 40, { strokeWidth: 3 }), line(20, by + 20, [[0, 0], [100, 0]], { strokeWidth: 3 }), line(320, by + 20, [[0, 0], [100, 0]], { strokeWidth: 3 }));
  bx.push(line(220, by, [[0, 0], [0, 40]], { strokeWidth: 4 }));
  add('Tools · boxplot frame', bx);

  /* ===== Word cards ===== */
  add('Words · density curve', card('density curve', 'A smooth curve laid over the data. The total area under it is 1, and the area over any stretch is the proportion of data there.',
    [pic(DIST.bell, 'a smooth bell: area 1', true, { fill: SHADE }), pic(DIST.flat, 'a flat top: area 1', true, { fill: SHADE }),
     { draw: function (x, y) { var s = []; var i, pts = []; for (i = 0; i <= 60; i++) pts.push([i * PIC_W / 60, PIC_H / 2 - 28 * Math.sin(i / 60 * 6.28)]); s.push(line(x - 4, y + PIC_H / 2, [[0, 0], [PIC_W + 8, 0]], { strokeWidth: 2 })); s.push(line(x, y + pts[0][1], pts.map(function (p) { return [p[0], p[1] - pts[0][1]]; }), { strokeWidth: 3 })); return s; }, cap: 'dips below the axis', ok: false }]));
  add('Words · uniform distribution', card('uniform distribution', 'Every value is equally likely, so the curve is a flat rectangle. Its height is 1 divided by its width.',
    [pic(DIST.flat, 'bus wait 0 to 20', true, { fill: SHADE }), pic(uniform(0, 4), 'any flat rectangle', true, { fill: SHADE }), pic(DIST.bell, 'a bell is not flat', false)]));
  add('Words · skewed right', card('skewed right', 'The long tail points right. A few big values pull the mean above the median. (Solid line: median. Red dashed line: mean.)',
    [pic(DIST.right, 'pizza tips: tail right', true, { lines: true }), pic(DIST.right2, 'tail right', true, { lines: true }), pic(DIST.left, 'tail LEFT = skewed left', false)]));
  add('Words · skewed left', card('skewed left', 'The long tail points left. A few small values pull the mean below the median. (Solid line: median. Red dashed line: mean.)',
    [pic(DIST.left, 'easy quiz: tail left', true, { lines: true }), pic(DIST.left2, 'tail left', true, { lines: true }), pic(DIST.right, 'tail RIGHT = skewed right', false)]));
  add('Words · symmetric', card('symmetric', 'The left half is a mirror of the right half. The mean and the median are the same.',
    [pic(DIST.bell, 'a bell', true, { center: true }), pic(DIST.flat, 'a flat rectangle', true, { center: true }), pic(DIST.right, 'one long tail: not mirror', false)]));
  add('Words · normal distribution', card('normal distribution', 'Symmetric, one peak, bell-shaped. The mean and the median sit at the center.',
    [pic(DIST.bellNarrow, 'tall and narrow bell', true, { center: true }), pic(DIST.bellWide, 'low and wide bell', true, { center: true }), pic(DIST.flat, 'symmetric but no bell', false)]));
  add('Words · the mean follows the tail', card('the mean follows the tail', 'A few extreme values drag the mean toward them. The median stays in the middle. (Solid line: median. Red dashed line: mean.)',
    [pic(DIST.right, 'tail right: mean pulled right', true, { lines: true }), pic(DIST.left, 'tail left: mean pulled left', true, { lines: true }), pic(DIST.bell, 'no tail: no pull', true, { center: true })],
    ));
  add('Words · area is proportion', card('area = proportion', 'The shaded area under a density curve is the proportion of the data in that stretch. Height is not a percent.',
    [pic(DIST.bus, 'shade 15 to 20: area 0.25', true, { fill: SHADE }), pic(DIST.bell, 'area = share of data', true, { fill: SHADE }),
     { draw: function (x, y) { return mini(x, y, PIC_W, PIC_H, DIST.bell); }, cap: 'height is NOT a percent', ok: false }]));

  /* ===== Routines ===== */
  function routine(title, steps, colors) {
    var out = [], bw = 150, bh = 150, i;
    out.push(text(0, 0, title, 26, { strokeWidth: 2 }));
    steps.forEach(function (s, k) {
      out.push(rect(k * (bw + 16), 44, bw, bh, { strokeWidth: 2, backgroundColor: colors[k] }));
      out.push(text(k * (bw + 16) + 12, 52, s[0], 26, { strokeWidth: 2 }));
      out.push(text(k * (bw + 16) + 12, 92, s[1], 16));
    });
    return out;
  }
  var pal = ['#d0ebff', '#d3f9d8', '#fff3bf', '#ffe3e3'];
  add('Routines · Look, Mark, Number, Say', routine('Any graph', [['Look', 'What is the\nhorizontal axis?\nThe vertical?'], ['Mark', 'Put marks on\nthe key spots.'], ['Number', 'Put a number\non each mark.'], ['Say', 'Say it in a\nsentence with\nunits.']], pal));
  add('Routines · Sketch, Mark, Compute, Say', routine('Any normal-curve problem', [['Sketch', 'Draw the curve.\nMark the known\nvalue.'], ['Mark', 'Shade the part\nthe question\nasks about.'], ['Compute', 'Use technology\nfor the area.'], ['Say', 'Answer in a\nsentence with\nunits.']], pal));
  add('Routines · three forms of the z equation', [
    text(0, 0, 'The same equation, three ways. Pick the one with your blank.', 20),
    rect(0, 40, 520, 56, { strokeWidth: 2, backgroundColor: '#d0ebff' }), text(20, 54, 'z = (x − μ) ÷ σ        find z', 24),
    rect(0, 106, 520, 56, { strokeWidth: 2, backgroundColor: '#d3f9d8' }), text(20, 120, 'x = μ + z × σ        find the value', 24),
    rect(0, 172, 520, 56, { strokeWidth: 2, backgroundColor: '#fff3bf' }), text(20, 186, 'σ = (x − μ) ÷ z        find the SD', 24)]);
  add('Routines · undo it (work backward)', [
    text(0, 0, 'Undo it: the last thing done is the first thing undone.', 22),
    rect(0, 40, 130, 70, { strokeWidth: 2 }), text(22, 64, 'start', 22), arrow(130, 75, [[0, 0], [60, 0]], { strokeWidth: 3 }),
    rect(190, 40, 130, 70, { strokeWidth: 2 }), text(206, 56, 'after\nstep 1', 18), arrow(320, 75, [[0, 0], [60, 0]], { strokeWidth: 3 }),
    rect(380, 40, 130, 70, { strokeWidth: 2 }), text(396, 56, 'after\nstep 2', 18),
    arrow(380, 130, [[0, 0], [-60, 0]], { strokeWidth: 3, strokeColor: RED }), arrow(190, 130, [[0, 0], [-60, 0]], { strokeWidth: 3, strokeColor: RED }),
    text(120, 142, 'undo step 2, then undo step 1', 18, { strokeColor: RED })]);

  return items;
}

var SHELVES = [
  { name: 'Word cards', prefixes: ['Words'] },
  { name: 'Density curves', prefixes: ['Curves'] },
  { name: 'Normal curve', prefixes: ['Normal'] },
  { name: 'Graph tools', prefixes: ['Tools'] },
  { name: 'Routines', prefixes: ['Routines'] }
];

export { buildLibrary, SHELVES, graph, normal, ctext };
