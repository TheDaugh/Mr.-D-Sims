/* Lesson board for Physics Unit 3 (Forces), last block, day 3: practice for friction and inclines (3.11, 3.12).
   Four frames, as the chem practice boards: warm-up with covered answers, the two sandboxes, whiteboard rounds (each answer under a
   cover, room to draw), and the exit check. The real thing on the sheet is Canton Avenue (37% grade); the board shows it in frame 1.
   Pens: blue = objects, axes and motion; red = forces; green = new words; purple = components; black = everything else. */

import { INK, BLUE, RED, GREEN, GRAY, rect, text, line, arrow, labeled } from '../draw.js';
import { ctext } from '../stats.js';

var PURPLE = '#7048e8';
var FW = 1500, FH = 1080, GAP = 480;
var FRAMES = ['0 Warm-up', '1 Sandboxes', '2 Whiteboard rounds', '3 Exit check'];
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

  /* ---- 0 warm-up ---- */
  x0 = F(0); E = E.concat(title(x0, y0, 0, 'Practice: friction and inclines'));
  E.push(note(x0 + 40, 110, 'Warm-up', 30, { strokeWidth: 2 }));
  E.push(note(x0 + 40, 170, '1  A 12 kg crate has μs = 0.40. Largest static friction on a floor?', 26)); E = E.concat(answer(x0 + 980, 162, 200, 48, '47 N'));
  E.push(note(x0 + 40, 250, '2  On a ramp, which part of mg points along the ramp?', 26)); E = E.concat(answer(x0 + 980, 242, 200, 48, 'mg sin θ'));
  E.push(note(x0 + 40, 330, '3  A box rests on a ramp. Which way does friction point?', 26)); E = E.concat(answer(x0 + 980, 322, 200, 48, 'up the ramp'));
  E = E.concat(ramp(x0 + 120, 760, 700, 20, 300, 'box'));
  E.push(note(x0 + 900, 520, 'Draw here', 20, { strokeColor: GRAY }));

  /* ---- 1 the two sandboxes, then Canton Avenue ---- */
  x0 = F(1); E = E.concat(title(x0, y0, 1, 'Two sandboxes'));
  E.push(rect(x0 + 40, 100, 680, 330, { strokeWidth: 2, backgroundColor: '#e7f5ff' }));
  E.push(note(x0 + 60, 115, 'Friction Sandbox', 28, { strokeWidth: 2, strokeColor: BLUE }));
  E.push(note(x0 + 60, 170, '1  Free play.', 26));
  E.push(note(x0 + 60, 215, '2  Friction graph on. Grow the push.', 26));
  E.push(note(x0 + 60, 260, '   What are the climb, the top, the drop?', 26));
  E.push(note(x0 + 60, 305, '3  Checkpoints 1 and 3.', 26));
  E.push(note(x0 + 60, 360, 'physics/sandbox/friction-push.html', 20, { strokeColor: GRAY }));
  E.push(rect(x0 + 760, 100, 700, 330, { strokeWidth: 2, backgroundColor: '#fff9db' }));
  E.push(note(x0 + 780, 115, 'Ramp and Pulley Sandbox', 28, { strokeWidth: 2, strokeColor: '#e67700' }));
  E.push(note(x0 + 780, 170, 'Counterweight off.', 26));
  E.push(note(x0 + 780, 215, 'μs = 0.37: raise the ramp until it slips.', 26));
  E.push(note(x0 + 780, 260, 'Angle?', 26)); E = E.concat(answer(x0 + 900, 252, 200, 48, 'about 20°'));
  E.push(note(x0 + 780, 305, 'μs = 0.70: angle?', 26)); E = E.concat(answer(x0 + 1040, 297, 200, 48, 'about 35°'));
  E.push(note(x0 + 780, 360, 'physics/sandbox/ramp-pulley.html', 20, { strokeColor: GRAY }));
  E.push(note(x0 + 40, 480, 'Canton Avenue, Pittsburgh: 37 m up for every 100 m across.', 28, { strokeWidth: 2 }));
  E.push(line(x0 + 100, 960, [[0, 0], [1000, 0], [1000, -370], [0, 0]], { strokeWidth: 3, backgroundColor: '#f1f3f5', fillStyle: 'solid' }));
  E.push(note(x0 + 560, 975, '100 m across', 22, { strokeColor: GRAY })); E.push(note(x0 + 1120, 760, '37 m up', 22, { strokeColor: GRAY }));
  E.push(note(x0 + 210, 920, 'θ', 28));

  /* ---- 2 whiteboard rounds ---- */
  x0 = F(2); E = E.concat(title(x0, y0, 2, 'Whiteboard rounds'));
  E.push(note(x0 + 40, 110, '1  A 10 kg crate, μs = 0.30, pushed with 20 N. Friction?', 28)); E = E.concat(answer(x0 + 40, 160, 900, 56, 'μsN = 29.4 N; 20 N is less, so it holds: friction = 20 N.'));
  E.push(note(x0 + 40, 280, '2  Same crate, μk = 0.20, pushed with 40 N. Acceleration?', 28)); E = E.concat(answer(x0 + 40, 330, 900, 56, '40 > 29.4: slides. fk = 19.6 N, a = (40 − 19.6) ÷ 10 = 2.0 m/s²'));
  E.push(note(x0 + 40, 450, '3  A 2.0 kg block on a frictionless 45° ramp. Acceleration?', 28)); E = E.concat(answer(x0 + 40, 500, 900, 56, 'a = 9.8 sin 45° = 6.9 m/s² (the mass cancels)'));
  E.push(note(x0 + 1000, 110, 'Draw here', 20, { strokeColor: GRAY }));

  /* ---- 3 exit check ---- */
  x0 = F(3); E = E.concat(title(x0, y0, 3, 'Exit check'));
  E.push(note(x0 + 40, 110, 'A 15 kg crate on a floor. μs = 0.40, μk = 0.20.', 28, { strokeWidth: 2 }));
  E.push(note(x0 + 40, 180, '1  Pushed with 50 N. How big is the friction?', 28)); E = E.concat(answer(x0 + 40, 230, 1080, 56, '50 N (μsN = 58.8 N, so it holds)'));
  E.push(note(x0 + 40, 330, '2  Pushed with 70 N instead. Acceleration?', 28)); E = E.concat(answer(x0 + 40, 380, 1080, 56, 'fk = 29.4 N, a = (70 − 29.4) ÷ 15 = 2.7 m/s²'));
  E.push(note(x0 + 40, 480, '3  A 3.0 kg block on a frictionless 22° ramp. Normal force and acceleration?', 28)); E = E.concat(answer(x0 + 40, 530, 1080, 56, 'N = 27.3 N, a = 9.8 sin 22° = 3.7 m/s²'));
  E.push(rect(x0 + 40, 660, 1420, 120, { strokeWidth: 2, backgroundColor: '#e7f5ff' }));
  E.push(note(x0 + 60, 680, 'On paper, alone. The slips decide tomorrow.', 26, { strokeColor: BLUE }));

  var els = convert(E, { regenerateIds: false });
  els.forEach(function (e) { if (e.type === 'text') e.width = Math.ceil(e.width * 1.3); });
  return els;
}

export { build, FRAMES, SHELVES };
export var ID = 'practice3';
export var TITLE = 'Physics Unit 3 · Day 3 · Practice: friction and inclines';
