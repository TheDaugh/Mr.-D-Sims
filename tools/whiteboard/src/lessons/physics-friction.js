/* Lesson board for Physics Unit 3 (Forces), last block, day 1 (honors): friction, static and kinetic.
   Hybrid board, same style as the chem lesson boards (chem-bonding.js): only the slow or exact pictures are preset (the floor and
   crate, the push-friction table, the graph axes with the two friction levels, the static/kinetic table); the force arrows, the graph
   line and the worked numbers are drawn live in the empty space, and the key words are written as labels on the drawing. Each frame
   has a word list (top right) to tick off. Only the check questions and the warm-up have covered answers (select the cover, press Delete).
   Pens, fixed for every physics lesson board: blue = objects, axes and motion; red = forces; green = new words; purple = components
   (from day 2); black = everything else. The numbers match the Cornell notes: a 12 kg crate, mu_s 0.40, mu_k 0.25, N 118 N,
   mu_s N 47 N, mu_k N 29 N, a 55 N push. None of them is a test number. */

import { INK, BLUE, RED, GREEN, GRAY, rect, text, line, arrow, labeled } from '../draw.js';
import { ctext } from '../stats.js';

var PURPLE = '#7048e8';
var FW = 1500, FH = 1080, GAP = 480;
var FRAMES = ['0 Question', '1 What friction is', '2 Static friction', '3 Kinetic friction', '4 Solving', '5 Exit check'];
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

function build(convert) {
  var E = [], x0, y0 = 0, F = function (k) { return k * (FW + GAP); };

  /* ---- 0 question, warm-up, pen colors ---- */
  x0 = F(0); E = E.concat(title(x0, y0, 0, 'Friction'));
  E.push(rect(x0 + 40, 100, 1420, 130, { strokeWidth: 2, backgroundColor: '#e7f5ff' }));
  E.push(note(x0 + 60, 115, 'Essential question', 26, { strokeWidth: 2, strokeColor: BLUE }));
  E.push(note(x0 + 60, 160, 'How big is the friction force, and why is starting a slide harder than keeping it going?', 28));
  E.push(note(x0 + 40, 280, 'Warm-up', 30, { strokeWidth: 2 }));
  E.push(note(x0 + 40, 330, '1  A 6.0 kg bag rests on a table. Normal force?', 26)); E = E.concat(answer(x0 + 680, 322, 180, 48, '59 N'));
  E.push(note(x0 + 40, 400, '2  A net force of 12 N acts on 4.0 kg. Acceleration?', 26)); E = E.concat(answer(x0 + 680, 392, 180, 48, '3.0 m/s²'));
  E.push(note(x0 + 40, 470, '3  The floor pushes up on a crate. Its third-law partner?', 26)); E = E.concat(answer(x0 + 40, 520, 820, 56, 'The crate pushes down on the floor.'));
  E.push(note(x0 + 900, 280, 'Colors', 30, { strokeWidth: 2 }));
  E = E.concat(swatch(x0 + 900, 340, BLUE, 'objects, axes, motion'));
  E = E.concat(swatch(x0 + 900, 400, RED, 'forces'));
  E = E.concat(swatch(x0 + 900, 460, GREEN, 'new words'));
  E = E.concat(swatch(x0 + 900, 520, PURPLE, 'components (day 2)'));

  /* ---- 1 what friction is: the crate on the floor, room for the FBD ---- */
  x0 = F(1); E = E.concat(title(x0, y0, 1, 'What friction is'));
  E = E.concat(words(x0, ['contact', 'along', 'sliding', 'mg', '118 N']));
  E = E.concat(floor(x0 + 100, 470, 900));
  E.push(crate(x0 + 470, 320, 180, 150, '12 kg'));
  E = E.concat(push(x0 + 200, 395, 260));
  E.push(note(x0 + 100, 560, 'Draw here: N, W and friction, each with its source', 20, { strokeColor: GRAY }));
  E = E.concat(check(x0, 1, 'A box is pushed to the right but does not move. Which way does friction point? Why?', 'To the left: without friction the box would slide right.'));

  /* ---- 2 static friction: the table to fill as the push grows ---- */
  x0 = F(2); E = E.concat(title(x0, y0, 2, 'Static friction'));
  E = E.concat(words(x0, ['matches', 'zero', 'slide', '47 N']));
  E = E.concat(floor(x0 + 100, 300, 560));
  E.push(crate(x0 + 330, 190, 140, 110, '12 kg'));
  E = E.concat(push(x0 + 140, 245, 180));
  E.push(note(x0 + 700, 150, 'μs = 0.40', 28, { strokeColor: INK }));
  E.push(note(x0 + 700, 200, 'Largest static friction:', 24, { strokeColor: GRAY }));
  E = E.concat(grid(x0 + 100, 420, 180, 70, [['Push (N)', '0', '10', '30', '50'], ['Friction (N)', '', '', '', '']], 200));
  E = E.concat(check(x0, 2, 'A 10 kg box has μs = 0.60. Pushed with 20 N, it does not move. A student says friction is 58.8 N. What is wrong?', '58.8 N is only the limit. Static friction matches the push: 20 N.'));

  /* ---- 3 kinetic friction: the graph axes and the static/kinetic table ---- */
  x0 = F(3); E = E.concat(title(x0, y0, 3, 'Kinetic friction'));
  E = E.concat(words(x0, ['same', 'smaller', 'drops', '29 N']));
  E = E.concat(graph(x0 + 120, 170, 560, 380));
  E = E.concat(grid(x0 + 900, 300, 240, 70, [['', 'Static', 'Kinetic'], ['When', '', ''], ['Size', '', '']], 110).map(function (e) { return e; }));
  E.push(note(x0 + 900, 540, 'μk = 0.25', 28, { strokeColor: INK }));
  E = E.concat(check(x0, 3, 'A student says pushing a sliding box harder makes kinetic friction bigger. What is wrong?', 'fk = μkN depends only on the surfaces and N, not on the push or the speed.'));

  /* ---- 4 solving: the three steps, room to work the 55 N push ---- */
  x0 = F(4); E = E.concat(title(x0, y0, 4, 'Solving friction problems'));
  E = E.concat(words(x0, ['0', 'slides', 'ΣF = ma', '26 N', '2.1 m/s²']));
  E.push(note(x0 + 60, 110, 'Step 1  Find N.', 28));
  E.push(note(x0 + 60, 170, 'Step 2  Compare the push with μsN.', 28));
  E.push(note(x0 + 60, 230, 'Step 3  If it slides, fk = μkN and ΣF = ma.', 28));
  E = E.concat(floor(x0 + 100, 470, 560));
  E.push(crate(x0 + 330, 360, 140, 110, '12 kg'));
  E = E.concat(push(x0 + 140, 415, 180));
  E.push(note(x0 + 190, 425, '55 N', 24, { strokeColor: BLUE }));
  E.push(note(x0 + 720, 330, 'Work it here', 20, { strokeColor: GRAY }));
  E = E.concat(check(x0, 4, 'An 8.0 kg box has μs = 0.55. It is pushed with 40 N. Does it move? Show how you know.', 'μsN = 0.55 × 78.4 = 43 N. 40 N is less: it stays put, friction = 40 N.'));

  /* ---- 5 exit check and summary ---- */
  x0 = F(5); E = E.concat(title(x0, y0, 5, 'Exit check'));
  E.push(note(x0 + 40, 110, 'a.  A 15 kg toolbox slides on a floor, μk = 0.15. Kinetic friction?', 28)); E = E.concat(answer(x0 + 40, 160, 1080, 56, 'N = 147 N, fk = 0.15 × 147 = 22 N'));
  E.push(note(x0 + 40, 260, 'b.  Pulled sideways with 50 N while it slides. Acceleration?', 28)); E = E.concat(answer(x0 + 40, 310, 1080, 56, 'ΣF = 50 − 22 = 28 N, a = 28 ÷ 15 = 1.9 m/s²'));
  E.push(note(x0 + 40, 410, 'c.  A hockey puck slides to the left. Which way does friction point?', 28)); E = E.concat(answer(x0 + 40, 460, 1080, 56, 'To the right, against the sliding.'));
  E.push(rect(x0 + 40, 580, 1420, 200, { strokeWidth: 2, backgroundColor: '#e7f5ff' }));
  E.push(note(x0 + 60, 595, 'Summary', 28, { strokeWidth: 2, strokeColor: BLUE }));
  E.push(note(x0 + 60, 645, 'Answer the essential question in two or three sentences. Use the words “static” and “kinetic.”', 26));

  var els = convert(E, { regenerateIds: false });
  els.forEach(function (e) { if (e.type === 'text') e.width = Math.ceil(e.width * 1.3); });
  return els;
}

export { build, FRAMES, SHELVES };
export var ID = 'friction';
export var TITLE = 'Physics Unit 3 · Friction';
