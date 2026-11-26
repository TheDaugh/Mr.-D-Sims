/* Lesson board for Physics Unit 3 (Forces), last block, day 5 (honors): springs and Hooke's law (3.14).
   Hybrid board, same style as physics-friction.js: preset are a ceiling with a spring at its natural length and the same spring
   stretched, F-against-x axes with the three measured points, the Day 4 carts with a spring in the rope; the stretch, the line, the
   slope triangle and the numbers are drawn live. Word list top right; checks and warm-up covered.
   Pens: blue = objects, axes and motion; red = forces; green = new words; purple = components; black = everything else.
   Numbers match the notes: k 80 N/m and 0.15 m (12 N); 3 N per 0.025 m (k 120 N/m); 0.60 kg on it (x 0.049 m); the carts with a
   200 N/m spring (T 4.0 N, x 0.020 m). None is a test number (the test uses 50 N/m, 1.5 kg, and 200 and 400 N/m with 10 N). */

import { INK, BLUE, RED, GREEN, GRAY, rect, text, line, arrow, labeled } from '../draw.js';
import { ctext } from '../stats.js';

var PURPLE = '#7048e8';
var FW = 1500, FH = 1080, GAP = 480;
var FRAMES = ['0 Question', '1 Hooke’s law', '2 k from a graph', '3 A hanging mass', '4 A spring in a system', '5 Exit check'];
var SHELVES = ['Free-body diagrams', 'Inclines and systems'];

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
/* a spring as a zigzag from (x, y) down (or across) a length L */
function spring(x, y, L, across) {
  var pts = [[0, 0]], n = 12, w = 22;
  for (var i = 1; i < n; i++) pts.push(across ? [L * i / n, i % 2 ? -w : w] : [i % 2 ? -w : w, L * i / n]);
  pts.push(across ? [L, 0] : [0, L]);
  return line(x, y, pts, { strokeWidth: 2, strokeColor: INK });
}
function ceiling(x, y, w) { return line(x, y, [[0, 0], [w, 0]], { strokeWidth: 5 }); }
/* F (N) against x (m): 0 to 0.10 m across, 0 to 12 N up, with the measured points */
function fx(x, y, w, h, pts) {
  var out = [arrow(x, y + h, [[0, 0], [w + 30, 0]], { strokeColor: BLUE, strokeWidth: 2 }), arrow(x, y + h, [[0, 0], [0, -h - 30]], { strokeColor: BLUE, strokeWidth: 2 })];
  [0, 0.025, 0.05, 0.075, 0.1].forEach(function (v) { out.push(ctext(x + v / 0.1 * w, y + h + 10, String(v), 18, { strokeColor: GRAY })); });
  [3, 6, 9, 12].forEach(function (v) { out.push(note(x - 40, y + h - v / 12 * h - 11, String(v), 18, { strokeColor: GRAY })); });
  out.push(ctext(x + w / 2, y + h + 40, 'stretch x (m)', 20, { strokeColor: GRAY })); out.push(note(x - 10, y - 70, 'force F (N)', 20, { strokeColor: GRAY }));
  pts.forEach(function (p) { out.push(rect(x + p[0] / 0.1 * w - 7, y + h - p[1] / 12 * h - 7, 14, 14, { strokeColor: BLUE, backgroundColor: BLUE, fillStyle: 'solid' })); });
  return out;
}

function build(convert) {
  var E = [], x0, y0 = 0, F = function (k) { return k * (FW + GAP); };

  /* ---- 0 question, warm-up, pen colors ---- */
  x0 = F(0); E = E.concat(title(x0, y0, 0, 'Springs'));
  E.push(rect(x0 + 40, 100, 1420, 130, { strokeWidth: 2, backgroundColor: '#e7f5ff' }));
  E.push(note(x0 + 60, 115, 'Essential question', 26, { strokeWidth: 2, strokeColor: BLUE }));
  E.push(note(x0 + 60, 160, 'How does a spring tell us how big a force is?', 28));
  E.push(note(x0 + 40, 280, 'Warm-up', 30, { strokeWidth: 2 }));
  E.push(note(x0 + 40, 330, '1  Weight of a 0.60 kg mass?', 26)); E = E.concat(answer(x0 + 680, 322, 180, 48, '5.9 N'));
  E.push(note(x0 + 40, 400, '2  Slope of a line through (0, 0) and (4, 12)?', 26)); E = E.concat(answer(x0 + 680, 392, 180, 48, '3'));
  E.push(note(x0 + 40, 470, '3  A mass hangs at rest. Net force on it?', 26)); E = E.concat(answer(x0 + 680, 462, 180, 48, 'zero'));
  E.push(note(x0 + 900, 280, 'Colors', 30, { strokeWidth: 2 }));
  E = E.concat(swatch(x0 + 900, 340, BLUE, 'objects, axes, motion'));
  E = E.concat(swatch(x0 + 900, 400, RED, 'forces'));
  E = E.concat(swatch(x0 + 900, 460, GREEN, 'new words'));
  E = E.concat(swatch(x0 + 900, 520, PURPLE, 'components'));

  /* ---- 1 Hooke's law: natural length and stretched ---- */
  x0 = F(1); E = E.concat(title(x0, y0, 1, 'Hooke’s law'));
  E = E.concat(words(x0, ['stretch', 'kx', 'double', 'natural', 'bigger', '12 N']));
  E.push(ceiling(x0 + 120, 110, 520));
  E.push(spring(x0 + 230, 110, 260)); E.push(note(x0 + 190, 390, 'natural length', 20, { strokeColor: GRAY }));
  E.push(spring(x0 + 520, 110, 400)); E.push(crate(x0 + 470, 510, 100, 90, ''));
  E.push(line(x0 + 140, 370, [[0, 0], [500, 0]], { strokeColor: GRAY, strokeWidth: 1, strokeStyle: 'dashed' }));
  E.push(note(x0 + 760, 250, 'Work it here', 20, { strokeColor: GRAY }));
  E = E.concat(check(x0, 1, 'k = 100 N/m, 20 cm long, stretched to 26 cm. A student says F = 100 × 0.26 = 26 N. What is wrong?', 'x is the stretch, 0.06 m, not the length: F = 100 × 0.06 = 6 N.'));

  /* ---- 2 k from a graph ---- */
  x0 = F(2); E = E.concat(title(x0, y0, 2, 'k from a graph'));
  E = E.concat(words(x0, ['straight line', 'slope', '120 N/m']));
  E = E.concat(fx(x0 + 140, 160, 620, 400, [[0.025, 3], [0.05, 6], [0.075, 9]]));
  E = E.concat(grid(x0 + 830, 300, 120, 56, [['F (N)', '0', '3', '6', '9'], ['x (m)', '0', '0.025', '0.050', '0.075']], 90).slice(0));
  E = E.concat(check(x0, 2, 'Two springs on the same F against x axes: line A is steeper than line B. Which is stiffer? How do you know?', 'A. Its slope, k, is bigger: more force for each meter of stretch.'));

  /* ---- 3 a hanging mass ---- */
  x0 = F(3); E = E.concat(title(x0, y0, 3, 'A hanging mass'));
  E = E.concat(words(x0, ['zero', 'mg', 'spring scale', '0.049 m']));
  E.push(ceiling(x0 + 120, 110, 360));
  E.push(spring(x0 + 300, 110, 330)); E.push(crate(x0 + 245, 440, 110, 100, '0.60 kg'));
  E.push(note(x0 + 600, 140, 'k = 120 N/m', 28, { strokeColor: INK }));
  E.push(note(x0 + 600, 260, 'Work it here', 20, { strokeColor: GRAY }));
  E = E.concat(check(x0, 3, 'The mass on a spring is doubled. What happens to the stretch?', 'It doubles: kx = mg, so x grows in step with m.'));

  /* ---- 4 a spring in a system: the Day 4 carts ---- */
  x0 = F(4); E = E.concat(title(x0, y0, 4, 'A spring in a system'));
  E = E.concat(words(x0, ['tension', '4.0 N', '0.020 m']));
  E = E.concat(floor(x0 + 60, 400, 1000));
  E.push(crate(x0 + 120, 280, 160, 120, '2.0 kg')); E.push(crate(x0 + 520, 280, 220, 120, '4.0 kg'));
  E.push(spring(x0 + 280, 340, 240, true));
  E.push(arrow(x0 + 740, 340, [[0, 0], [240, 0]], { strokeColor: BLUE, strokeWidth: 3 })); E.push(note(x0 + 810, 295, '12 N', 26, { strokeColor: BLUE }));
  E.push(note(x0 + 300, 230, 'k = 200 N/m', 24, { strokeColor: INK }));
  E.push(note(x0 + 60, 470, 'Frictionless floor. Work it here', 20, { strokeColor: GRAY }));
  E = E.concat(check(x0, 4, 'The carts are pulled with 24 N instead. How far does the spring stretch now?', 'a = 4.0 m/s², T = 8.0 N, x = 8.0 ÷ 200 = 0.040 m.'));

  /* ---- 5 exit check and summary ---- */
  x0 = F(5); E = E.concat(title(x0, y0, 5, 'Exit check'));
  E.push(note(x0 + 40, 110, 'a.  k = 250 N/m, stretched 0.040 m. How hard does it pull?', 28)); E = E.concat(answer(x0 + 40, 160, 1080, 56, 'F = 250 × 0.040 = 10 N'));
  E.push(note(x0 + 40, 260, 'b.  0.050 m under 4.0 N, 0.100 m under 8.0 N. Find k.', 28)); E = E.concat(answer(x0 + 40, 310, 1080, 56, 'k = 4.0 ÷ 0.050 = 80 N/m'));
  E.push(note(x0 + 40, 410, 'c.  0.50 kg hangs at rest on that spring. The stretch?', 28)); E = E.concat(answer(x0 + 40, 460, 1080, 56, 'mg = 4.9 N; x = 4.9 ÷ 80 = 0.061 m'));
  E.push(rect(x0 + 40, 580, 1420, 200, { strokeWidth: 2, backgroundColor: '#e7f5ff' }));
  E.push(note(x0 + 60, 595, 'Summary', 28, { strokeWidth: 2, strokeColor: BLUE }));
  E.push(note(x0 + 60, 645, 'Answer the essential question in two or three sentences. Use “stretch” and “spring constant.”', 26));

  var els = convert(E, { regenerateIds: false });
  els.forEach(function (e) { if (e.type === 'text') e.width = Math.ceil(e.width * 1.3); });
  return els;
}

export { build, FRAMES, SHELVES };
export var ID = 'springs';
export var TITLE = 'Physics Unit 3 · Day 5 · Springs';
