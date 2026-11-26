/* Lesson board for Physics Unit 3 (Forces), last block, day 2 (honors): inclines.
   Hybrid board, same style as physics-friction.js: only the slow or exact pictures are preset (a 20 degree ramp drawn to the angle
   with the 5.0 kg block on it, the component table); the force arrows, the purple components and the numbers are drawn live.
   Each frame has a word list (top right) to tick off; check questions and the warm-up have covered answers.
   Pens: blue = objects, axes and motion; red = forces; green = new words; purple = components; black = everything else.
   Numbers match the Cornell notes: 5.0 kg block, 20 degrees, mg 49 N, along 16.8 N, N 46 N, a 3.4 m/s^2 (no friction);
   mu_k 0.20 gives f_k 9.2 N and a 1.5 m/s^2. None of them is a test number (the test uses 10 kg at 30 and 40 degrees). */

import { INK, BLUE, RED, GREEN, GRAY, rect, text, line, arrow, labeled } from '../draw.js';
import { ctext } from '../stats.js';

var PURPLE = '#7048e8';
var FW = 1500, FH = 1080, GAP = 480;
var FRAMES = ['0 Question', '1 Tilted axes', '2 Splitting the weight', '3 N and a', '4 Friction on a ramp', '5 Exit check'];
var SHELVES = ['Inclines and systems', 'Free-body diagrams'];

function cover(x, y, w, h) { return labeled(x, y, w, h, '?', 22, { strokeWidth: 2, strokeColor: '#e8590c', backgroundColor: '#ffd8a8' }); }
function answer(x, y, w, h, a) { return [rect(x, y, w, h, { strokeWidth: 1, strokeColor: GRAY }), text(x + 14, y + 12, a, 24, { strokeColor: INK }), cover(x, y, w, h)]; }
function title(x0, y0, i, t) { return [rect(x0, y0, FW, FH, { strokeWidth: 1, strokeColor: '#adb5bd', id: 'lesson-frame-' + i }), text(x0 + 24, y0 + 16, t, 34, { strokeWidth: 2 })]; }
function note(x, y, t, size, o) { return text(x, y, t, size || 28, o || {}); }
function words(x0, list) {
  var x = x0 + FW - 320, y = 20, out = [rect(x, y, 300, 56 + list.length * 40, { strokeWidth: 2, strokeColor: GREEN, backgroundColor: '#ebfbee' }), note(x + 14, y + 10, 'Words', 24, { strokeWidth: 2, strokeColor: GREEN })];
  list.forEach(function (w, i) { out.push(rect(x + 16, y + 56 + i * 40, 22, 22, { strokeWidth: 1, strokeColor: GREEN })); out.push(note(x + 50, y + 50 + i * 40, w, 24, { strokeColor: GREEN })); });
  return out;
}
function check(x0, n, q, a) {
  return [rect(x0 + 40, 700, FW - 80, 190, { strokeWidth: 2, strokeColor: INK, backgroundColor: '#f8f9fa' }), note(x0 + 60, 715, n + '.  ' + q, 26, { strokeWidth: 2 })].concat(answer(x0 + 60, 770, FW - 120, 100, a));
}
function swatch(x, y, col, label) { return [rect(x, y, 60, 30, { strokeColor: col, backgroundColor: col }), note(x + 80, y - 2, label, 28)]; }
/* a floor: a line with short hatch marks under it */
function floor(x, y, w) {
  var out = [line(x, y, [[0, 0], [w, 0]], { strokeWidth: 3 })];
  for (var i = 10; i < w; i += 24) out.push(line(x + i, y + 4, [[0, 0], [-14, 18]], { strokeWidth: 1, strokeColor: GRAY }));
  return out;
}
function crate(x, y, w, h, label) { return labeled(x, y, w, h, label, 26, { strokeWidth: 2, strokeColor: BLUE, backgroundColor: '#e7f5ff' }); }
function push(x, y, len) { return [arrow(x, y, [[0, 0], [len, 0]], { strokeColor: BLUE, strokeWidth: 3 }), note(x + 10, y - 40, 'push', 24, { strokeColor: BLUE })]; }
/* a table of cells; rows of strings, '' leaves a cell empty to write in */
function grid(x, y, cw, ch, rows, first) {
  var out = [];
  rows.forEach(function (r, ri) {
    r.forEach(function (c, ci) {
      var w = ci === 0 ? (first || cw) : cw, cx = ci === 0 ? x : x + (first || cw) + (ci - 1) * cw;
      out.push(c ? labeled(cx, y + ri * ch, w, ch, c, 22, { strokeWidth: 1, backgroundColor: ri === 0 ? '#f1f3f5' : 'transparent' }) : rect(cx, y + ri * ch, w, ch, { strokeWidth: 1 }));
    });
  });
  return out;
}
/* friction (N) against push (N): 0 to 80 across, 0 to 60 up, with the mu_s N and mu_k N levels dashed */
function graph(x, y, w, h) {
  var sx = w / 80, sy = h / 60, out = [];
  out.push(arrow(x, y + h, [[0, 0], [w + 30, 0]], { strokeColor: BLUE, strokeWidth: 2 }));
  out.push(arrow(x, y + h, [[0, 0], [0, -h - 30]], { strokeColor: BLUE, strokeWidth: 2 }));
  [0, 20, 40, 60, 80].forEach(function (v) { out.push(ctext(x + v * sx, y + h + 10, String(v), 18, { strokeColor: GRAY })); });
  [20, 40, 60].forEach(function (v) { out.push(note(x - 40, y + h - v * sy - 11, String(v), 18, { strokeColor: GRAY })); });
  out.push(ctext(x + w / 2, y + h + 40, 'push (N)', 20, { strokeColor: GRAY }));
  out.push(note(x - 10, y - 70, 'friction (N)', 20, { strokeColor: GRAY }));
  [[47, 'μsN = 47 N'], [29.4, 'μkN = 29 N']].forEach(function (p) {
    out.push(line(x, y + h - p[0] * sy, [[0, 0], [w, 0]], { strokeColor: GRAY, strokeWidth: 1, strokeStyle: 'dashed' }));
    out.push(note(x + w + 12, y + h - p[0] * sy - 14, p[1], 20, { strokeColor: GRAY }));
  });
  return out;
}

/* a ramp drawn to its angle: bottom-left corner (x, y), length L, angle th in degrees; the block sits s along the slope */
function ramp(x, y, L, th, s, label) {
  var t = th * Math.PI / 180, h = L * Math.tan(t), out = [];
  out.push(line(x, y, [[0, 0], [L, 0], [L, -h], [0, 0]], { strokeWidth: 3, backgroundColor: '#f1f3f5', fillStyle: 'solid' }));
  out.push(note(x + 110, y - 42, th + '°', 26));
  var w = 150, hh = 100, ux = Math.cos(t), uy = -Math.sin(t), nx = -Math.sin(t), ny = -Math.cos(t);
  var cx = x + s * ux + w / 2 * ux + hh / 2 * nx, cy = y + s * uy + w / 2 * uy + hh / 2 * ny;
  out.push(labeled(cx - w / 2, cy - hh / 2, w, hh, label || '5.0 kg', 24, { strokeWidth: 2, strokeColor: BLUE, backgroundColor: '#e7f5ff', angle: 2 * Math.PI - t }));
  return out;
}

function build(convert) {
  var E = [], x0, y0 = 0, F = function (k) { return k * (FW + GAP); };

  /* ---- 0 question, warm-up, pen colors ---- */
  x0 = F(0); E = E.concat(title(x0, y0, 0, 'Inclines'));
  E.push(rect(x0 + 40, 100, 1420, 130, { strokeWidth: 2, backgroundColor: '#e7f5ff' }));
  E.push(note(x0 + 60, 115, 'Essential question', 26, { strokeWidth: 2, strokeColor: BLUE }));
  E.push(note(x0 + 60, 160, 'What part of an object’s weight pulls it down a ramp, and how hard does the ramp push back?', 28));
  E.push(note(x0 + 40, 280, 'Warm-up', 30, { strokeWidth: 2 }));
  E.push(note(x0 + 40, 330, '1  10 kg box sliding, μk = 0.20. Kinetic friction?', 26)); E = E.concat(answer(x0 + 720, 322, 150, 48, '20 N'));
  E.push(note(x0 + 40, 400, '2  On your calculator: sin 30° = ?', 26)); E = E.concat(answer(x0 + 720, 392, 150, 48, '0.50'));
  E.push(note(x0 + 40, 470, '3  A box slides to the left. Which way does friction point?', 26)); E = E.concat(answer(x0 + 40, 520, 820, 56, 'To the right, against the sliding.'));
  E.push(note(x0 + 900, 280, 'Colors', 30, { strokeWidth: 2 }));
  E = E.concat(swatch(x0 + 900, 340, BLUE, 'objects, axes, motion'));
  E = E.concat(swatch(x0 + 900, 400, RED, 'forces'));
  E = E.concat(swatch(x0 + 900, 460, GREEN, 'new words'));
  E = E.concat(swatch(x0 + 900, 520, PURPLE, 'components (new today)'));

  /* ---- 1 tilted axes ---- */
  x0 = F(1); E = E.concat(title(x0, y0, 1, 'Tilted axes'));
  E = E.concat(words(x0, ['perpendicular', 'down', 'along']));
  E = E.concat(ramp(x0 + 100, 620, 900, 20, 420));
  E.push(note(x0 + 100, 120, 'Draw here: W, N, then the tilted axes', 20, { strokeColor: GRAY }));
  E = E.concat(check(x0, 1, 'A student draws the normal force on a block on a ramp pointing straight up. What is wrong?', 'The ramp pushes perpendicular to its own surface, so N tilts with the ramp.'));

  /* ---- 2 splitting the weight ---- */
  x0 = F(2); E = E.concat(title(x0, y0, 2, 'Splitting the weight'));
  E = E.concat(words(x0, ['components', 'mg sin θ', 'mg cos θ', '0 and mg', '16.8 N', '46 N']));
  E = E.concat(ramp(x0 + 60, 560, 640, 20, 280));
  E = E.concat(grid(x0 + 740, 380, 200, 56, [['', 'Along (down)', 'Into'], ['Part of mg', '', ''], ['θ = 0°', '', ''], ['θ = 90°', '', '']], 170));
  E.push(note(x0 + 760, 610, '5.0 kg, 20°: mg = 49 N', 24, { strokeColor: INK }));
  E = E.concat(check(x0, 2, 'On a 10° ramp, which part of the weight is bigger: along or into? How can you tell without a calculator?', 'Into. 10° is almost flat, and on a flat floor all the weight is into the floor.'));

  /* ---- 3 normal force and acceleration ---- */
  x0 = F(3); E = E.concat(title(x0, y0, 3, 'Normal force and acceleration'));
  E = E.concat(words(x0, ['mg cos θ', 'less', 'g sin θ', 'cancels', '46 N', '3.4 m/s²']));
  E = E.concat(ramp(x0 + 60, 600, 640, 20, 280));
  E.push(note(x0 + 780, 140, 'No friction', 26, { strokeColor: INK }));
  E.push(note(x0 + 780, 420, 'Work it here', 20, { strokeColor: GRAY }));
  E = E.concat(check(x0, 3, 'A student says a heavy crate slides down a frictionless ramp faster than a light one. What is wrong?', 'a = g sin θ. The mass cancels, so both have the same acceleration.'));

  /* ---- 4 friction on a ramp ---- */
  x0 = F(4); E = E.concat(title(x0, y0, 4, 'Friction on a ramp'));
  E = E.concat(words(x0, ['down', 'up', '16.8 N', '9.2 N', '1.5 m/s²']));
  E = E.concat(ramp(x0 + 60, 600, 640, 20, 280));
  E.push(note(x0 + 780, 140, 'At rest:', 26, { strokeColor: INK }));
  E.push(note(x0 + 780, 380, 'Sliding, μk = 0.20:', 26, { strokeColor: INK }));
  E = E.concat(check(x0, 4, 'A box sits still on a 15° ramp. Which way does friction point, and how big is it compared with mg sin 15°?', 'Up the ramp, and the same size as mg sin 15°.'));

  /* ---- 5 exit check and summary ---- */
  x0 = F(5); E = E.concat(title(x0, y0, 5, 'Exit check'));
  E.push(note(x0 + 40, 110, 'a.  4.0 kg on a frictionless 35° ramp. Weight along the ramp? Normal force?', 28)); E = E.concat(answer(x0 + 40, 160, 1080, 56, 'mg = 39.2 N. Along: 22 N. N = 32 N.'));
  E.push(note(x0 + 40, 260, 'b.  The block’s acceleration?', 28)); E = E.concat(answer(x0 + 40, 310, 1080, 56, 'a = 9.8 sin 35° = 5.6 m/s² down the ramp'));
  E.push(note(x0 + 40, 410, 'c.  Why does the acceleration not depend on the mass?', 28)); E = E.concat(answer(x0 + 40, 460, 1080, 56, 'mg sin θ grows with m, so a = mg sin θ ÷ m = g sin θ.'));
  E.push(rect(x0 + 40, 580, 1420, 200, { strokeWidth: 2, backgroundColor: '#e7f5ff' }));
  E.push(note(x0 + 60, 595, 'Summary', 28, { strokeWidth: 2, strokeColor: BLUE }));
  E.push(note(x0 + 60, 645, 'Answer the essential question in two or three sentences. Use “mg sin θ” and “mg cos θ.”', 26));

  var els = convert(E, { regenerateIds: false });
  els.forEach(function (e) { if (e.type === 'text') e.width = Math.ceil(e.width * 1.3); });
  return els;
}

export { build, FRAMES, SHELVES };
export var ID = 'inclines';
export var TITLE = 'Physics Unit 3 · Day 2 · Inclines';
