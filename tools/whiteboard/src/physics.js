/* Physics stencils for the Forces and Newton's Laws unit: free-body diagrams, force arrows, net force, motion maps,
   graphs, Newton's-law cards, third-law pairs, inclines, connected systems and springs. Angles, curves and arrow
   components are computed, so a 25-degree ramp really is 25 degrees and the drag curve really levels off.

   buildLibrary(convert) -> Excalidraw library items. Each item is one group; ungroup (Ctrl+Shift+G) to edit parts. */

import { INK, BLUE, RED, GREEN, GRAY, rect, ellipse, text, line, arrow, makeItem } from './draw.js';

function item(convert, name, skeletons) { return makeItem(convert, 'physics', name, skeletons); }

/* One colour per kind of force, so a pasted arrow tells the class what it is. The key is the "Force colours" card. */
var ORANGE = '#e8590c', PURPLE = '#9c36b5', TEAL = '#0c8599', MAGENTA = '#c2255c';
var COL = { g: BLUE, N: GREEN, f: RED, T: ORANGE, app: INK, drag: PURPLE, sp: TEAL, net: MAGENTA };
var FILL = '#e9ecef';

function ctext(cx, y, t, size, o) {
  var lines = String(t).split('\n'), n = 0;
  lines.forEach(function (l) { n = Math.max(n, l.length); });
  return text(cx - n * (size || 16) * 0.55 / 2, y, t, size, o);
}
function wrap(s, n) {
  var words = s.split(' '), out = [], cur = '';
  words.forEach(function (w) {
    if (cur && (cur + ' ' + w).length > n) { out.push(cur); cur = w; } else cur = cur ? cur + ' ' + w : w;
  });
  if (cur) out.push(cur);
  return out.join('\n');
}
function deg(a) { return a * Math.PI / 180; }

/* An arrow from (x, y) by (dx, dy) with its label just past the tip. dy is positive downward (screen). */
function force(x, y, dx, dy, label, color, o) {
  var len = Math.sqrt(dx * dx + dy * dy), ux = dx / len, uy = dy / len, size = (o && o.size) || 20;
  var w = label.length * size * 0.55, h = size * 1.3, lx = x + dx + ux * 12, ly = y + dy + uy * 12, out = [];
  out.push(arrow(x, y, [[0, 0], [dx, dy]], { strokeColor: color, strokeWidth: (o && o.width) || 3, strokeStyle: (o && o.dash) ? 'dashed' : 'solid' }));
  if (label) out.push(text(lx - w / 2 + ux * w / 2, ly - h / 2 + uy * h / 2, label, size, { strokeColor: color }));
  return out;
}
function dot(cx, cy, r) { return ellipse(cx - (r || 9), cy - (r || 9), 2 * (r || 9), 2 * (r || 9), { backgroundColor: INK }); }

/* A card: title, then entries (each wrapped to `chars` letters). Used for rules, routines and tables. */
function card(title, entries, o) {
  o = o || {};
  var w = o.w || 400, chars = o.chars || Math.floor((w - 40) / 9.8), size = 18, out = [], y = 56, i, block, n;
  var body = [];
  entries.forEach(function (e) {
    block = wrap(e, chars); n = block.split('\n').length;
    body.push(text(20, y, block, size));
    y += n * size * 1.3 + 12;
  });
  out.push(rect(0, 0, w, y + 8, { strokeWidth: 2, backgroundColor: o.fill || '#fff9db' }));
  out.push(text(20, 14, title, 26));
  return out.concat(body);
}

/* ================= free-body diagrams (a dot, the forces on it, and what the net force is) ================= */

function fbd(o) {
  var cx = 170, cy = 170, out = [ctext(cx, 4, o.caption, 22), dot(cx, cy)];
  (o.forces || []).forEach(function (f) { out = out.concat(force(cx, cy, f[0], f[1], f[2], f[3])); });
  if (o.v) out = out.concat(force(cx - o.v[0] / 2, 48, o.v[0], o.v[1], 'v', GRAY, { width: 2 }));
  if (o.net) {
    if (o.netArrow) out = out.concat(force(cx - o.netArrow[0] / 2, 296, o.netArrow[0], o.netArrow[1], '', MAGENTA, { width: 4 }));
    out.push(ctext(cx, o.netArrow ? 308 : 296, o.net, 20, { strokeColor: MAGENTA }));
  }
  return out;
}

var FBDS = [
  ['FBD · dot, blank (draw every force)', { caption: 'Draw every force on the object', forces: [] }],
  ['FBD · at rest on a table', { caption: 'At rest on a table', forces: [[0, 60, 'Fg', COL.g], [0, -60, 'FN', COL.N]], net: 'ΣF = 0' }],
  ['FBD · steady slide (constant velocity)', { caption: 'Sliding at a steady speed', v: [60, 0],
    forces: [[0, 60, 'Fg', COL.g], [0, -60, 'FN', COL.N], [85, 0, 'Fapp', COL.app], [-85, 0, 'Ff', COL.f]], net: 'ΣF = 0' }],
  ['FBD · speeding up', { caption: 'Speeding up', v: [60, 0],
    forces: [[0, 60, 'Fg', COL.g], [0, -60, 'FN', COL.N], [110, 0, 'Fapp', COL.app], [-55, 0, 'Ff', COL.f]], net: 'ΣF points right', netArrow: [55, 0] }],
  ['FBD · slowing down (pull let go)', { caption: 'Slowing down', v: [60, 0],
    forces: [[0, 60, 'Fg', COL.g], [0, -60, 'FN', COL.N], [-75, 0, 'Ff', COL.f]], net: 'ΣF points left', netArrow: [-75, 0] }],
  ['FBD · free fall (gravity only)', { caption: 'Free fall', forces: [[0, 75, 'Fg', COL.g]], net: 'ΣF points down' }],
  ['FBD · falling with drag, speeding up', { caption: 'Falling, drag still small', forces: [[0, 85, 'Fg', COL.g], [0, -40, 'Fdrag', COL.drag]], net: 'ΣF points down' }],
  ['FBD · terminal velocity (drag = weight)', { caption: 'Terminal velocity', forces: [[0, 85, 'Fg', COL.g], [0, -85, 'Fdrag', COL.drag]], net: 'ΣF = 0' }],
  ['FBD · hanging from a rope', { caption: 'Hanging at rest', forces: [[0, 60, 'Fg', COL.g], [0, -60, 'FT', COL.T]], net: 'ΣF = 0' }]
];

/* ================= net force ================= */

function netThree() {
  var out = [], cases = [
    ['balanced', 3, 3, 'ΣF = 0'], ['more to the right', 5, 2, 'ΣF = 3 N right'], ['more to the left', 1, 4, 'ΣF = 3 N left']
  ], u = 20;
  cases.forEach(function (c, i) {
    var cx = 150 + i * 330, cy = 70;
    out.push(ctext(cx, 0, c[0], 20), dot(cx, cy));
    out = out.concat(force(cx, cy, c[1] * u, 0, c[1] + ' N', COL.app));
    out = out.concat(force(cx, cy, -c[2] * u, 0, c[2] + ' N', COL.app));
    out.push(ctext(cx, 120, c[3], 20, { strokeColor: MAGENTA }));
  });
  return out;
}

function forceStrip() {
  /* a row of unit squares: count forces in squares, then net them. The object sits in the middle. */
  var out = [], n = 14, s = 40, i;
  for (i = 0; i < n; i++) out.push(rect(i * s, 40, s, s, { strokeWidth: 1, strokeColor: GRAY }));
  out.push(dot(n * s / 2, 20, 9), text(0, 100, '1 square = 1 N', 18, { strokeColor: GRAY }));
  out.push(line(n * s / 2, 30, [[0, 0], [0, 64]], { strokeStyle: 'dashed', strokeColor: GRAY, strokeWidth: 1 }));
  return out;
}

function tipToTail() {
  var u = 28, out = [], x0 = 40, y0 = 150;
  out = out.concat(force(x0, y0, 3 * u, 0, '3 N', COL.app));
  out = out.concat(force(x0 + 3 * u, y0, 0, -4 * u, '', COL.app));
  out.push(text(x0 + 3 * u + 12, y0 - 2 * u - 12, '4 N', 20));
  out = out.concat(force(x0, y0, 3 * u, -4 * u, 'ΣF = 5 N', COL.net, { width: 4 }));
  out.push(text(x0 + 140, y0 - 30, 'tail to tip, then draw the\nsingle arrow from the first\ntail to the last tip', 16, { strokeColor: GRAY }));
  return out;
}

function components() {
  var a = 30, L = 150, x0 = 40, y0 = 150, fx = L * Math.cos(deg(a)), fy = L * Math.sin(deg(a)), out = [], arc = [], i;
  out = out.concat(force(x0, y0, fx, -fy, 'F', COL.app));
  out.push(line(x0, y0, [[0, 0], [fx, 0]], { strokeColor: COL.net, strokeStyle: 'dashed', strokeWidth: 3 }));
  out.push(line(x0 + fx, y0, [[0, 0], [0, -fy]], { strokeColor: COL.net, strokeStyle: 'dashed', strokeWidth: 3 }));
  out.push(text(x0 + fx / 2 - 60, y0 + 10, 'Fx = F cos θ', 18, { strokeColor: COL.net }));
  out.push(text(x0 + fx + 14, y0 - fy / 2 - 10, 'Fy = F sin θ', 18, { strokeColor: COL.net }));
  for (i = 0; i <= 12; i++) arc.push([50 * Math.cos(deg(a * i / 12)), -50 * Math.sin(deg(a * i / 12))]);
  out.push(line(x0, y0, arc, { strokeWidth: 2 }), text(x0 + 56, y0 - 26, 'θ', 20));
  return out;
}

/* ================= motion maps: a dot for each equal tick of time, a velocity arrow on each ================= */

function motionMap(gaps, arrows, note) {
  var out = [], xs = [20], y = 70, i;
  gaps.forEach(function (g) { xs.push(xs[xs.length - 1] + g); });
  xs.forEach(function (x) { out.push(dot(x, y, 8)); });
  /* a velocity arrow from each dot, as long as the step that follows it */
  if (arrows) for (i = 0; i < gaps.length; i++) out = out.concat(force(xs[i], y - 28, gaps[i] * 0.8, 0, '', GRAY, { width: 2 }));
  out.push(text(20, 112, note, 20, { strokeColor: MAGENTA }));
  return out;
}

/* ================= graphs ================= */

/* Axes with the origin at (0, h). Returns skeletons; callers add curves in pixel coordinates. */
function axes(w, h, xl, yl, o) {
  var out = [arrow(-10, h, [[0, 0], [w + 14, 0]], { strokeWidth: 2 }), arrow(0, h + 10, [[0, 0], [0, -(h + 14)]], { strokeWidth: 2 })];
  out.push(text(w - xl.length * 9, h + 10, xl, 18), text(8, -30, yl, 18));
  if (o && o.zero) out.push(text(-16, h + 6, '0', 16, { strokeColor: GRAY }));
  return out;
}
function pts(w, h, list, color) {
  return list.map(function (p) { return ellipse(p[0] - 5, h - p[1] - 5, 10, 10, { backgroundColor: color || BLUE, strokeColor: color || BLUE, strokeWidth: 1 }); });
}

function graphBlank(xl, yl) { return axes(260, 180, xl, yl, { zero: true }); }

function graphPair() {
  /* v–t over a–t on a shared time axis, for the cart runs */
  var out = axes(260, 110, '', 'v', { zero: true });
  out = out.concat(axes(260, 110, 't', 'a', { zero: true }).map(function (e) { return Object.assign({}, e, { y: e.y + 190 }); }));
  return out;
}

function graphSlope(kind) {
  var w = 280, h = 200, out, list, k;
  if (kind === 'F') {           /* a against F: a straight line through the origin, slope 1/m */
    out = axes(w, h, 'F (N)', 'a (m/s²)', { zero: true });
    out.push(line(0, h, [[0, 0], [w - 20, -(h - 30)]], { strokeColor: BLUE, strokeWidth: 3 }));
    out = out.concat(pts(w, h, [[50, 40], [100, 72], [150, 108], [200, 140], [240, 168]], INK));
    out.push(text(150, 150, 'slope = 1/m', 20, { strokeColor: BLUE }));
  } else if (kind === 'm') {    /* a against 1/m */
    out = axes(w, h, '1/m (1/kg)', 'a (m/s²)', { zero: true });
    out.push(line(0, h, [[0, 0], [w - 20, -(h - 30)]], { strokeColor: BLUE, strokeWidth: 3 }));
    out = out.concat(pts(w, h, [[40, 34], [90, 66], [140, 104], [190, 138], [235, 162]], INK));
    out.push(text(110, 150, 'slope = F (the net force)', 20, { strokeColor: BLUE }));
  } else {                      /* friction bends the data: nothing moves until F passes Ff, then the same slope */
    out = axes(w, h, 'F applied (N)', 'a (m/s²)', { zero: true });
    k = 0.8; list = [[110, 0], [150, 32], [190, 64], [230, 96], [265, 124]];
    out.push(line(0, h, [[0, 0], [110, 0]], { strokeColor: BLUE, strokeWidth: 3 }));
    out.push(line(110, h, [[0, 0], [165, -(h - 76) * 0.7]], { strokeColor: BLUE, strokeWidth: 3 }));
    out.push(line(110, h, [[0, 0], [-80, 64]], { strokeColor: GRAY, strokeStyle: 'dashed', strokeWidth: 2 }));
    out = out.concat(pts(w, h, list, INK));
    out.push(text(60, h + 32, 'Ff', 18, { strokeColor: RED }), line(110, h - 8, [[0, 0], [0, 16]], { strokeColor: RED, strokeWidth: 3 }));
    out.push(text(120, 20, 'the line misses the origin by Ff', 18, { strokeColor: BLUE }));
  }
  return out;
}

function graphHooke() {
  var w = 280, h = 200, out = axes(w, h, 'stretch x (m)', 'F (N)', { zero: true });
  out.push(line(0, h, [[0, 0], [w - 30, -(h - 40)]], { strokeColor: TEAL, strokeWidth: 3 }));
  out = out.concat(pts(w, h, [[50, 36], [100, 72], [150, 108], [200, 144], [245, 176]], INK));
  out.push(text(130, 150, 'slope = k  (N/m)', 20, { strokeColor: TEAL }));
  return out;
}

function graphDrag() {
  /* v(t) = vt (1 - e^(-t/tau)): speeds up, then levels off at vt. The slope is the acceleration, and it shrinks to zero. */
  var w = 300, h = 190, out = axes(w, h, 't (s)', 'v (m/s)', { zero: true }), vt = 150, tau = 70, p = [], i, t;
  for (i = 0; i <= 40; i++) { t = i * 7; p.push([t, -vt * (1 - Math.exp(-t / tau))]); }
  out.push(line(0, h, [[0, 0]].concat(p), { strokeColor: PURPLE, strokeWidth: 3 }));
  out.push(line(0, h - vt, [[0, 0], [w, 0]], { strokeStyle: 'dashed', strokeColor: GRAY, strokeWidth: 2 }));
  out.push(text(w - 110, h - vt - 28, 'terminal speed', 18, { strokeColor: GRAY }));
  return out;
}

/* ================= Newton's laws: word cards, third-law pairs, routines ================= */

function lawCard(title, sentence, picture) {
  var out = [rect(0, 0, 440, 330, { strokeWidth: 2, backgroundColor: '#fff9db' }), text(20, 14, title, 28), text(20, 60, wrap(sentence, 44), 18)];
  return out.concat(picture);
}
function firstLawPic() {
  var out = [], i, x, y = 245;
  out.push(text(20, 176, 'no net force: same velocity every tick', 16, { strokeColor: GRAY }));
  for (i = 0; i < 5; i++) {
    x = 50 + i * 85; out.push(dot(x, y, 10));
    if (i < 4) out = out.concat(force(x + 14, y, 52, 0, '', GRAY, { width: 2 }));
  }
  out.push(text(20, 285, 'at rest: stays at rest.   moving: keeps going, straight, same speed.', 14, { strokeColor: GRAY }));
  return out;
}
function secondLawPic() {
  var out = [], row = [['m', 90, 80], ['2m', 130, 40]], y;
  row.forEach(function (r, i) {
    y = 200 + i * 60;
    out.push(rect(30, y, r[1] - 30, 40, { backgroundColor: FILL }), ctext(30 + (r[1] - 30) / 2, y + 8, r[0], 20));
    out = out.concat(force(r[1], y + 20, 70, 0, 'F', COL.app, { size: 18 }));
    out = out.concat(force(250, y + 20, r[2], 0, 'a', COL.net, { size: 18, width: 4 }));
  });
  out.push(text(250, 172, 'acceleration', 14, { strokeColor: GRAY }));
  return out;
}
function thirdLawPic() {
  var out = [];
  out.push(rect(100, 200, 100, 64, { backgroundColor: FILL }), ctext(150, 220, 'A', 28), rect(200, 200, 100, 64, { backgroundColor: FILL }), ctext(250, 220, 'B', 28));
  out = out.concat(force(300, 232, 80, 0, '', COL.app), force(100, 232, -80, 0, '', COL.net));
  out.push(ctext(340, 200, 'A on B', 16), ctext(60, 200, 'B on A', 16, { strokeColor: COL.net }));
  return out;
}

function pairTemplate() {
  var out = [rect(0, 60, 120, 70, { backgroundColor: FILL }), ctext(60, 82, 'A', 28), rect(120, 60, 120, 70, { backgroundColor: FILL }), ctext(180, 82, 'B', 28)];
  out = out.concat(force(240, 95, 90, 0, 'A on B', COL.app));
  out = out.concat(force(0, 95, -90, 0, 'B on A', COL.net));
  out.push(ctext(120, 150, 'equal size, opposite direction, on different objects', 16, { strokeColor: GRAY }));
  return out;
}

function noCancel() {
  /* the usual trap: the pair do not cancel because each one is in a different free-body diagram */
  var out = [ctext(110, 0, 'Forces on A', 20), ctext(400, 0, 'Forces on B', 20), dot(110, 90), dot(400, 90)];
  out = out.concat(force(110, 90, -80, 0, 'B on A', COL.net));
  out = out.concat(force(400, 90, 80, 0, 'A on B', COL.app));
  out.push(line(255, 20, [[0, 0], [0, 110]], { strokeStyle: 'dashed', strokeColor: GRAY, strokeWidth: 2 }));
  out.push(ctext(255, 150, 'a pair acts on two objects,\nso it never cancels inside one diagram', 16, { strokeColor: GRAY }));
  return out;
}

function bookTable() {
  /* Fg and FN are NOT a pair (both act on the book). The partner of each is on a different object. */
  var out = [rect(130, 90, 120, 50, { backgroundColor: FILL }), rect(90, 140, 200, 50, { backgroundColor: '#dee2e6' }), rect(90, 290, 250, 36, { backgroundColor: '#c0eb75' })];
  out.push(text(20, 105, 'book', 18, { strokeColor: GRAY }), text(20, 155, 'table', 18, { strokeColor: GRAY }), text(20, 300, 'Earth', 18, { strokeColor: GRAY }));
  out = out.concat(force(165, 115, 0, -75, 'FN: table on book', COL.N, { size: 16 }));
  out = out.concat(force(215, 115, 0, 55, '', COL.g));
  out.push(text(262, 96, 'Fg: Earth on book', 16, { strokeColor: COL.g }));
  out = out.concat(force(150, 140, 0, 40, '', COL.N, { dash: true, width: 2 }));
  out.push(text(100, 196, 'book on table', 16, { strokeColor: COL.N }));
  out = out.concat(force(215, 290, 0, -45, '', COL.g, { dash: true, width: 2 }));
  out.push(text(226, 262, 'book on Earth', 16, { strokeColor: COL.g }));
  out.push(text(350, 190, 'FN and Fg both act on\nthe book: not a pair.\nEach partner (dashed)\nacts on another object.', 15, { strokeColor: GRAY }));
  return out;
}

function twoScales() {
  var out = [];
  out.push(rect(40, 40, 120, 44, { backgroundColor: FILL }), ctext(100, 50, 'scale A', 20), rect(230, 40, 120, 44, { backgroundColor: FILL }), ctext(290, 50, 'scale B', 20));
  out.push(line(160, 62, [[0, 0], [70, 0]], { strokeWidth: 3 }));
  out = out.concat(force(40, 62, -70, 0, '', COL.app), force(350, 62, 70, 0, '', COL.app));
  out.push(rect(52, 108, 96, 40, { strokeWidth: 2 }), rect(242, 108, 96, 40, { strokeWidth: 2 }), text(154, 114, 'N', 20, { strokeColor: GRAY }), text(344, 114, 'N', 20, { strokeColor: GRAY }));
  out.push(ctext(195, 170, 'predict both readings, then pull', 16, { strokeColor: GRAY }));
  return out;
}

var CATALOG = [
  'Gravity, Fg: Earth pulls every object toward its center. Fg = mg.',
  'Normal, FN: a surface pushes on the object, straight out of the surface.',
  'Tension, FT: a rope pulls on the object, along the rope.',
  'Friction, Ff: a surface drags on the object, along the surface, against the sliding (or the push).',
  'Applied, Fapp: a push or pull from a person or another object.',
  'Drag, Fdrag: air or water resists the motion, against the velocity.',
  'Spring, Fsp: a spring pulls or pushes the object back toward its relaxed length.'
];

/* ================= inclines: a ramp is computed from its angle ================= */

/* The ramp rises to the right. Returns the triangle plus the helpers the FBDs need. (0, 0) is the top right corner. */
function ramp(a, L) {
  var ca = Math.cos(deg(a)), sa = Math.sin(deg(a)), B = L * ca, H = L * sa;
  return { a: a, ca: ca, sa: sa, B: B, H: H, L: L,
    sketch: [line(-B, H, [[0, 0], [B, -H], [B, 0], [0, 0]], { strokeWidth: 3, backgroundColor: '#dee2e6' })],
    onSurface: function (t) { return [-B + t * ca, H - t * sa]; }, /* a point t along the surface from the bottom left */
    up: [ca, -sa], out: [-sa, -ca] };
}
function angleMark(r, label) {
  var out = [], arc = [], i;
  for (i = 0; i <= 12; i++) arc.push([70 * Math.cos(deg(r.a * i / 12)), -70 * Math.sin(deg(r.a * i / 12))]);
  out.push(line(-r.B, r.H, arc, { strokeWidth: 2 }), text(-r.B + 78, r.H - 28, label || 'θ', 20));
  return out;
}
function crate(r, t, w, h) {
  var p = r.onSurface(t), cx = p[0] + r.out[0] * h / 2, cy = p[1] + r.out[1] * h / 2;
  return { cx: cx, cy: cy, el: rect(cx - w / 2, cy - h / 2, w, h, { angle: -deg(r.a), backgroundColor: FILL }) };
}

function rampBlank(a) { var r = ramp(a, 330); return r.sketch.concat(angleMark(r, 'θ = ' + a + '°')); }

function rampAxes() {
  var r = ramp(25, 330), c = crate(r, 270, 70, 46), out = r.sketch.concat(angleMark(r), [c.el, dot(c.cx, c.cy, 5)]);
  out = out.concat(force(c.cx, c.cy, r.up[0] * 120, r.up[1] * 120, '+x', GRAY, { size: 18, width: 2 }));
  out = out.concat(force(c.cx, c.cy, r.out[0] * 110, r.out[1] * 110, '+y', GRAY, { size: 18, width: 2 }));
  return out;
}

/* o.friction: length of friction up the slope (0 = none) */
function rampFbd(o) {
  var r = ramp(25, 330), c = crate(r, 270, 70, 46), W = 95, out = r.sketch.concat(angleMark(r), [c.el]), cx = c.cx, cy = c.cy;
  var sa = r.sa, ca = r.ca;
  out = out.concat(force(cx, cy, 0, W, 'Fg = mg', COL.g));
  out = out.concat(force(cx, cy, r.out[0] * W * ca, r.out[1] * W * ca, 'FN', COL.N));
  out = out.concat(force(cx, cy, -r.up[0] * W * sa, -r.up[1] * W * sa, 'mg sin θ', COL.g, { dash: true, width: 2, size: 16 }));
  out = out.concat(force(cx, cy, -r.out[0] * W * ca, -r.out[1] * W * ca, 'mg cos θ', COL.g, { dash: true, width: 2, size: 16 }));
  if (o.friction) out = out.concat(force(cx, cy, r.up[0] * o.friction, r.up[1] * o.friction, 'Ff', COL.f));
  out.push(dot(cx, cy, 5));
  return out;
}

/* ================= connected systems ================= */

function weightTable() {
  var out = [rect(0, 0, 440, 292, { strokeWidth: 2, backgroundColor: '#fff9db' }), text(20, 14, 'Weight on other worlds: Fg = mg', 26)];
  var rows = [['world', 'g (N/kg)', 'Fg on 10 kg'], ['Earth', '9.8', ''], ['Moon', '1.6', ''], ['Mars', '3.7', ''], ['Jupiter', '24.8', '']], y0 = 62, cw = [130, 130, 140], rh = 38;
  rows.forEach(function (r, i) {
    var x = 20;
    r.forEach(function (c, j) {
      out.push(rect(x, y0 + i * rh, cw[j], rh, { strokeWidth: 1, strokeColor: GRAY, backgroundColor: i === 0 ? '#ffec99' : '#fff9db' }));
      if (c) out.push(text(x + 10, y0 + i * rh + 8, c, 20));
      x += cw[j];
    });
  });
  out.push(text(20, 262, 'mass stays 10 kg everywhere; only the weight changes', 16, { strokeColor: GRAY }));
  return out;
}

function pulley(cx, cy, r) { return [ellipse(cx - r, cy - r, 2 * r, 2 * r, { strokeWidth: 3, backgroundColor: '#fff' }), dot(cx, cy, 3)]; }

function cartHanging(withFbds) {
  var out = [rect(0, 80, 260, 14, { backgroundColor: '#dee2e6' }), rect(260, 80, 14, 160, { strokeWidth: 0, backgroundColor: '#dee2e6' })];
  out.push(rect(90, 34, 80, 46, { backgroundColor: FILL }), ctext(130, 44, 'M', 22));
  out.push(ellipse(100, 74, 14, 14, { backgroundColor: '#fff' }), ellipse(146, 74, 14, 14, { backgroundColor: '#fff' }));
  out = out.concat(pulley(272, 70, 14));
  out.push(line(170, 57, [[0, 0], [102, 0]], { strokeWidth: 2 }), line(286, 70, [[0, 0], [0, 80]], { strokeWidth: 2 }));
  out.push(rect(260, 150, 52, 44, { backgroundColor: FILL }), ctext(286, 158, 'm', 22));
  if (withFbds) {
    out.push(ctext(430, -26, 'cart', 18, { strokeColor: GRAY }), ctext(580, -26, 'hanging mass', 18, { strokeColor: GRAY }), dot(430, 110), dot(580, 110));
    out = out.concat(force(430, 110, 0, -60, 'FN', COL.N), force(430, 110, 0, 60, 'Mg', COL.g), force(430, 110, 80, 0, 'FT', COL.T), force(430, 110, -50, 0, 'Ff', COL.f));
    out = out.concat(force(580, 110, 0, -60, 'FT', COL.T), force(580, 110, 0, 80, 'mg', COL.g));
    out.push(text(330, 250, 'one string: the same FT on both, and the same size of a', 16, { strokeColor: GRAY }));
  }
  return out;
}

function atwood(withFbds) {
  var out = [line(60, -6, [[0, 0], [130, 0]], { strokeWidth: 6 }), line(125, -6, [[0, 0], [0, 28]], { strokeWidth: 3 })], r = 28;
  out = out.concat(pulley(125, 50, r));
  out.push(line(97, 50, [[0, 0], [0, 110]], { strokeWidth: 2 }), line(153, 50, [[0, 0], [0, 70]], { strokeWidth: 2 }));
  out.push(rect(72, 160, 50, 48, { backgroundColor: FILL }), ctext(97, 170, 'm1', 20), rect(128, 120, 50, 38, { backgroundColor: FILL }), ctext(153, 126, 'm2', 20));
  if (withFbds) {
    out.push(ctext(340, -24, 'object view', 18, { strokeColor: GRAY }));
    out.push(dot(280, 90), dot(400, 90));
    out = out.concat(force(280, 90, 0, -50, 'FT', COL.T), force(280, 90, 0, 80, 'm1g', COL.g));
    out = out.concat(force(400, 90, 0, -80, 'FT', COL.T), force(400, 90, 0, 50, 'm2g', COL.g));
    out.push(ctext(280, 218, 'm1', 18, { strokeColor: GRAY }), ctext(400, 218, 'm2', 18, { strokeColor: GRAY }));
  }
  return out;
}

function rampPulley() {
  var r = ramp(30, 300), c = crate(r, 130, 64, 42), out = r.sketch.concat(angleMark(r), [c.el]);
  var front = r.onSurface(130 + 32), start = [front[0] + r.out[0] * 6, front[1] + r.out[1] * 6], end = [16 + r.out[0] * 14, r.out[1] * 14];
  out = out.concat(pulley(16, 0, 14));
  out.push(line(start[0], start[1], [[0, 0], [end[0] - start[0], end[1] - start[1]]], { strokeWidth: 2 }));
  out.push(line(30, 0, [[0, 0], [0, 110]], { strokeWidth: 2 }), rect(2, 104, 56, 44, { backgroundColor: FILL }), ctext(30, 112, 'm', 22));
  out.push(ctext(c.cx + r.out[0] * 40, c.cy + r.out[1] * 40, 'M', 20));
  return out;
}
function twoBlocks() {
  var out = [rect(-20, 90, 380, 12, { backgroundColor: '#dee2e6' })];
  out.push(rect(40, 40, 90, 50, { backgroundColor: FILL }), ctext(85, 50, 'A', 24), rect(130, 40, 90, 50, { backgroundColor: FILL }), ctext(175, 50, 'B', 24));
  out = out.concat(force(40, 65, -60, 0, 'push', COL.app));
  out.push(rect(30, 24, 200, 72, { strokeStyle: 'dashed', strokeColor: GRAY, strokeWidth: 2 }), text(30, 112, 'system view: A and B together', 16, { strokeColor: GRAY }));
  out.push(text(30, 134, 'object view: draw A alone, then B alone', 16, { strokeColor: GRAY }));
  return out;
}

function zigzag(x, y, len, n, amp) {
  var p = [[0, 0], [0, len * 0.1]], d = len * 0.8 / (n * 2), i;
  for (i = 0; i < n * 2; i++) p.push([(i % 2 ? -amp : amp), len * 0.1 + d * (i + 0.5)]);
  p.push([0, len * 0.9], [0, len]);
  return line(x, y, p, { strokeWidth: 3, strokeColor: TEAL });
}
function springHang() {
  var out = [rect(20, 0, 200, 12, { backgroundColor: '#dee2e6' })];
  out.push(zigzag(100, 12, 120, 5, 16), rect(70, 132, 60, 46, { backgroundColor: FILL }), ctext(100, 142, 'm', 22));
  out.push(line(40, 72, [[0, 0], [150, 0]], { strokeStyle: 'dashed', strokeColor: GRAY, strokeWidth: 1 }), text(194, 62, 'relaxed length', 14, { strokeColor: GRAY }));
  out = out.concat(force(160, 72, 0, 60, '', GRAY, { width: 2 }));
  out.push(text(170, 96, 'x', 20, { strokeColor: GRAY }));
  out.push(ctext(330, 20, 'object view', 18, { strokeColor: GRAY }), dot(330, 150));
  out = out.concat(force(330, 150, 0, -60, 'Fsp', COL.sp), force(330, 150, 0, 60, 'Fg', COL.g));
  out.push(text(20, 200, 'at rest: Fsp = Fg, so kx = mg', 18, { strokeColor: GRAY }));
  return out;
}

/* ================= the library ================= */

function buildLibrary(convert) {
  var items = [];
  function add(name, sk) { items.push(item(convert, name, sk)); }

  /* Free-body diagrams (slots 4, 6, 7) */
  FBDS.forEach(function (f) { add(f[0], fbd(f[1])); });
  add('Force arrows · weight Fg (down)', force(0, 0, 0, 90, 'Fg', COL.g));
  add('Force arrows · normal FN (up)', force(0, 90, 0, -90, 'FN', COL.N));
  add('Force arrows · friction Ff (left)', force(100, 0, -100, 0, 'Ff', COL.f));
  add('Force arrows · tension FT (right)', force(0, 0, 100, 0, 'FT', COL.T));
  add('Force arrows · applied Fapp (right)', force(0, 0, 100, 0, 'Fapp', COL.app));
  add('Force arrows · drag Fdrag (up)', force(0, 90, 0, -90, 'Fdrag', COL.drag));
  add('Force arrows · spring Fsp (up)', force(0, 90, 0, -90, 'Fsp', COL.sp));
  add('Force arrows · net force ΣF (right)', force(0, 0, 100, 0, 'ΣF', COL.net, { width: 4 }));
  add('Force arrows · the force colours', card('Force colours', ['blue  gravity, Fg', 'green  normal, FN', 'red  friction, Ff', 'orange  tension, FT', 'black  applied, Fapp', 'purple  drag, Fdrag', 'teal  spring, Fsp', 'magenta  net force, ΣF'], { w: 300 }));

  /* Net force and motion (slots 4, 11, 13) */
  add('Net force · three cases (balanced, right, left)', netThree());
  add('Net force · force strip (1 square = 1 N)', forceStrip());
  add('Net force · two forces at right angles, tip to tail', tipToTail());
  add('Net force · one force split into x and y', components());
  add('Net force · net force and motion', card('Net force and motion', ['ΣF = 0: velocity does not change (at rest, or a steady speed in a straight line).', 'ΣF ≠ 0: velocity changes, and the acceleration points the way ΣF points.', 'Speeding up: ΣF points the way it moves.   Slowing down: ΣF points against it.'], { w: 420 }));
  add('Motion map · steady speed', motionMap([50, 50, 50, 50, 50, 50], true, 'equal gaps, equal arrows: a = 0'));
  add('Motion map · speeding up', motionMap([26, 36, 46, 56, 66, 76], true, 'gaps grow: a points the way it moves'));
  add('Motion map · slowing down', motionMap([76, 66, 56, 46, 36, 26], true, 'gaps shrink: a points against the motion'));
  add('Motion map · blank (draw the arrows)', motionMap([50, 50, 50, 50, 50, 50], false, 'draw the velocity arrows and the net force'));

  /* Graphs (slots 8 to 11, 14, 27) */
  add('Graph · v–t, blank', graphBlank('t (s)', 'v (m/s)'));
  add('Graph · a–t, blank', graphBlank('t (s)', 'a (m/s²)'));
  add('Graph · x–t, blank', graphBlank('t (s)', 'x (m)'));
  add('Graph · v–t over a–t (cart run)', graphPair());
  add('Graph · a vs F, slope = 1/m', graphSlope('F'));
  add('Graph · a vs 1/m, slope = F', graphSlope('m'));
  add('Graph · a vs F bent by friction', graphSlope('f'));
  add('Graph · v–t falling with drag (levels off)', graphDrag());
  add('Graph · F vs x, Hooke slope = k', graphHooke());

  /* Newton's laws (slots 11, 17, 18, 24) */
  add('Laws · first law card', lawCard('Newton’s first law', 'If the net force on an object is zero, its velocity does not change.', firstLawPic()));
  add('Laws · second law card', lawCard('Newton’s second law', 'The acceleration points the way the net force points, and a = ΣF / m. More mass, less acceleration.', secondLawPic()));
  add('Laws · third law card', lawCard('Newton’s third law', 'Forces come in pairs between two objects. A pushes on B, and B pushes on A, equally hard in the opposite direction.', thirdLawPic()));
  add('Laws · ΣF = ma, five moves', card('ΣF = ma, five moves', ['1  Sketch it and pick + directions.', '2  FBD for each object, every force with a source.', '3  Write ΣF = ma along each axis.', '4  Predict in words first (which way, bigger or smaller).', '5  Solve, then check units, sign and the prediction.'], { w: 430 }));
  add('Laws · weight on other worlds', weightTable());
  add('Third law · pair template (A on B, B on A)', pairTemplate());
  add('Third law · they never cancel (two diagrams)', noCancel());
  add('Third law · book on a table (Fg and FN are not a pair)', bookTable());
  add('Third law · two spring scales (predict both readings)', twoScales());
  add('Third law · name the pair (sentence frame)', card('Name the pair', ['The ______ pushes (pulls) on the ______,', 'so the ______ pushes (pulls) on the ______', 'equally hard in the opposite direction.'], { w: 470 }));

  /* FBD routines (slots 4, 6, 7, 24) */
  add('Routine · FBD in five moves', card('FBD in five moves', ['1  Dot for the object.', '2  List what touches it, then add gravity.', '3  One arrow per force, tail on the dot, with its source.', '4  Length shows size. Equal arrows if balanced.', '5  Add them: does ΣF match the motion?'], { w: 400 }));
  add('Routine · FBD check (find the error)', card('Check the diagram', ['Does every arrow have a source?', 'Is every arrow a force ON this object?', 'Is every tail on the dot?', 'Is there a “force of motion”? Delete it.', 'Does ΣF match what the object does?'], { w: 400 }));
  add('Routine · the force catalog', card('The force catalog', CATALOG, { w: 460 }));

  /* Inclines (slots 21, 26) */
  add('Incline · ramp 15°', rampBlank(15));
  add('Incline · ramp 25°', rampBlank(25));
  add('Incline · ramp 35°', rampBlank(35));
  add('Incline · crate with tilted axes (x along the slope)', rampAxes());
  add('Incline · FBD with weight components, no friction', rampFbd({ friction: 0 }));
  add('Incline · FBD with friction up the slope', rampFbd({ friction: 50 }));

  /* Systems and springs (slots 17, 18, 19, 25, 26, 27, 28, 29) */
  add('System · cart and hanging mass', cartHanging(false));
  add('System · cart and hanging mass, both FBDs', cartHanging(true));
  add('System · Atwood machine', atwood(false));
  add('System · Atwood machine, object view', atwood(true));
  add('System · crate on a ramp, counterweight over a pulley', rampPulley());
  add('System · two blocks pushed (system view, object view)', twoBlocks());
  add('Spring · hanging mass at rest', springHang());

  return items;
}

/* Which shelf each built-in stencil sits on, by the word before the dot in its name. */
var SHELVES = [
  { name: 'Free-body diagrams', prefixes: ['FBD', 'Force arrows', 'Routine'] },
  { name: 'Net force and motion', prefixes: ['Net force', 'Motion map'] },
  { name: 'Graphs', prefixes: ['Graph'] },
  { name: 'Newton’s laws', prefixes: ['Laws', 'Third law'] },
  { name: 'Inclines and systems', prefixes: ['Incline', 'System', 'Spring'] }
];

export { buildLibrary, SHELVES };
