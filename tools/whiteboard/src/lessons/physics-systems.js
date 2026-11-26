/* Lesson board for Physics Unit 3 (Forces), last block, day 4 (honors): connected objects (3.13).
   Hybrid board, same style as physics-friction.js: preset are the slow pictures (two carts and a rope, a table with a pulley and a
   hanging mass, an Atwood machine); the tension arrows, the system box and the numbers are drawn live. Each frame has a word list
   (top right) to tick off; checks and the warm-up have covered answers.
   Pens: blue = objects, axes and motion; red = forces; green = new words; purple = components; black = everything else.
   Numbers match the notes: 2.0 + 4.0 kg pulled with 12 N (a 2.0, T 4.0 N); 5.0 kg cart and 2.0 kg hanging (a 2.8, T 14 N);
   Atwood 4.0 and 6.0 kg (a 1.96, T 47 N); the cart with mu_k 0.20 (fk 9.8 N, a 1.4, T 16.8 N). None is a test number. */

import { INK, BLUE, RED, GREEN, GRAY, rect, text, line, arrow, labeled, ellipse } from '../draw.js';
import { ctext } from '../stats.js';

var PURPLE = '#7048e8', ROPE = '#6d4b2a';
var FW = 1500, FH = 1080, GAP = 480;
var FRAMES = ['0 Question', '1 Systems', '2 Table and hanging mass', '3 Atwood machine', '4 Friction on the table', '5 Exit check'];
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
/* a table top from x to xe at height y, its edge going down, a pulley at the corner, a cart and a hanging mass */
function tableRig(x, y, xe, cartLabel, hangLabel) {
  var out = [line(x, y, [[0, 0], [xe - x, 0], [xe - x, 330]], { strokeWidth: 3 })];
  out.push(ellipse(xe + 6, y - 44, 48, 48, { strokeWidth: 2, backgroundColor: '#ced4da', fillStyle: 'solid' }));
  out.push(crate(x + 120, y - 110, 190, 110, cartLabel));
  out.push(line(x + 310, y - 44, [[0, 0], [xe + 30 - (x + 310), 0]], { strokeColor: ROPE, strokeWidth: 3 }));
  out.push(line(xe + 54, y - 20, [[0, 0], [0, 200]], { strokeColor: ROPE, strokeWidth: 3 }));
  out.push(crate(xe + 4, y + 180, 100, 100, hangLabel));
  return out;
}
function atwoodRig(cx, y, l1, l2) {
  var out = [line(cx - 200, y, [[0, 0], [400, 0]], { strokeWidth: 4 }), line(cx, y, [[0, 0], [0, 50]], { strokeWidth: 2 })];
  out.push(ellipse(cx - 75, y + 50, 150, 150, { strokeWidth: 2, backgroundColor: '#ced4da', fillStyle: 'solid' }));
  out.push(line(cx - 75, y + 125, [[0, 0], [0, 230]], { strokeColor: ROPE, strokeWidth: 3 }));
  out.push(line(cx + 75, y + 125, [[0, 0], [0, 330]], { strokeColor: ROPE, strokeWidth: 3 }));
  out.push(crate(cx - 130, y + 355, 110, 100, l1)); out.push(crate(cx + 20, y + 455, 110, 110, l2));
  return out;
}

function build(convert) {
  var E = [], x0, y0 = 0, F = function (k) { return k * (FW + GAP); };

  /* ---- 0 question, warm-up, pen colors ---- */
  x0 = F(0); E = E.concat(title(x0, y0, 0, 'Connected objects'));
  E.push(rect(x0 + 40, 100, 1420, 130, { strokeWidth: 2, backgroundColor: '#e7f5ff' }));
  E.push(note(x0 + 60, 115, 'Essential question', 26, { strokeWidth: 2, strokeColor: BLUE }));
  E.push(note(x0 + 60, 160, 'When objects are tied together, how do we find how fast they speed up and how hard the string pulls?', 26));
  E.push(note(x0 + 40, 280, 'Warm-up', 30, { strokeWidth: 2 }));
  E.push(note(x0 + 40, 330, '1  12 N of net force on 3.0 kg. Acceleration?', 26)); E = E.concat(answer(x0 + 680, 322, 180, 48, '4.0 m/s²'));
  E.push(note(x0 + 40, 400, '2  Weight of a 2.0 kg mass?', 26)); E = E.concat(answer(x0 + 680, 392, 180, 48, '19.6 N'));
  E.push(note(x0 + 40, 470, '3  A rope pulls a box. Its third-law partner?', 26)); E = E.concat(answer(x0 + 40, 520, 820, 56, 'The box pulls back on the rope.'));
  E.push(note(x0 + 900, 280, 'Colors', 30, { strokeWidth: 2 }));
  E = E.concat(swatch(x0 + 900, 340, BLUE, 'objects, axes, motion'));
  E = E.concat(swatch(x0 + 900, 400, RED, 'forces'));
  E = E.concat(swatch(x0 + 900, 460, GREEN, 'new words'));
  E = E.concat(swatch(x0 + 900, 520, PURPLE, 'components'));

  /* ---- 1 systems: two carts and a rope ---- */
  x0 = F(1); E = E.concat(title(x0, y0, 1, 'Systems'));
  E = E.concat(words(x0, ['system', 'opposite', 'internal', 'external', 'one', '2.0 m/s²', '4.0 N']));
  E = E.concat(floor(x0 + 60, 460, 1000));
  E.push(crate(x0 + 130, 340, 160, 120, '2.0 kg')); E.push(crate(x0 + 500, 340, 220, 120, '4.0 kg'));
  E.push(line(x0 + 290, 400, [[0, 0], [210, 0]], { strokeColor: ROPE, strokeWidth: 3 }));
  E.push(arrow(x0 + 720, 400, [[0, 0], [240, 0]], { strokeColor: BLUE, strokeWidth: 3 })); E.push(note(x0 + 790, 355, '12 N', 26, { strokeColor: BLUE }));
  E.push(note(x0 + 60, 540, 'Frictionless floor. Work it here', 20, { strokeColor: GRAY }));
  E = E.concat(check(x0, 1, 'A student says the rope between the carts pulls with 12 N, because that is the pull. What is wrong?', 'The rope only speeds up the 2.0 kg cart: T = 2.0 × 2.0 = 4.0 N.'));

  /* ---- 2 table and hanging mass ---- */
  x0 = F(2); E = E.concat(title(x0, y0, 2, 'A table and a hanging mass'));
  E = E.concat(words(x0, ['weight', 'both', '2.8 m/s²', '14 N', 'less']));
  E = E.concat(tableRig(x0 + 60, 260, x0 + 640, '5.0 kg', '2.0 kg'));
  E.push(note(x0 + 820, 380, 'Frictionless table. Work it here', 20, { strokeColor: GRAY }));
  E = E.concat(check(x0, 2, 'A student says the hanging mass falls with a = g = 9.8 m/s². What is wrong?', 'Its weight must speed up the cart too, so a is less than g: 2.8 m/s².'));

  /* ---- 3 Atwood machine ---- */
  x0 = F(3); E = E.concat(title(x0, y0, 3, 'The Atwood machine'));
  E = E.concat(words(x0, ['heavier', 'difference', 'total', '1.96 m/s²', '47 N']));
  E = E.concat(atwoodRig(x0 + 300, 90, '4.0 kg', '6.0 kg'));
  E.push(note(x0 + 640, 380, 'Work it here', 20, { strokeColor: GRAY }));
  E = E.concat(check(x0, 3, 'Two 3.0 kg masses hang over a pulley. Find a and T.', 'Equal weights: a = 0, and T = 3.0 × 9.8 = 29.4 N.'));

  /* ---- 4 friction on the table ---- */
  x0 = F(4); E = E.concat(title(x0, y0, 4, 'Friction on the table'));
  E = E.concat(words(x0, ['against', 'that mass’s N', '9.8 N', '1.4 m/s²', '16.8 N']));
  E = E.concat(tableRig(x0 + 60, 260, x0 + 640, '5.0 kg', '2.0 kg'));
  E.push(note(x0 + 820, 380, 'μk = 0.20 on the table. Work it here', 20, { strokeColor: GRAY }));
  E = E.concat(check(x0, 4, 'A student finds the friction with N = (5.0 + 2.0) × 9.8. What is wrong?', 'Only the cart presses on the table: N = 5.0 × 9.8 = 49 N.'));

  /* ---- 5 exit check and summary ---- */
  x0 = F(5); E = E.concat(title(x0, y0, 5, 'Exit check'));
  E.push(note(x0 + 40, 110, 'a.  3.0 kg on a frictionless table, tied to 1.5 kg hanging. Acceleration?', 28)); E = E.concat(answer(x0 + 40, 160, 1080, 56, 'a = 14.7 ÷ 4.5 = 3.3 m/s²'));
  E.push(note(x0 + 40, 260, 'b.  The tension in the string?', 28)); E = E.concat(answer(x0 + 40, 310, 1080, 56, 'T = 3.0 × 3.27 = 9.8 N'));
  E.push(note(x0 + 40, 410, 'c.  Atwood machine, 2.0 kg and 8.0 kg. Which side goes down? How fast does it speed up?', 28)); E = E.concat(answer(x0 + 40, 460, 1080, 56, 'The 8.0 kg side; a = (78.4 − 19.6) ÷ 10 = 5.9 m/s²'));
  E.push(rect(x0 + 40, 580, 1420, 200, { strokeWidth: 2, backgroundColor: '#e7f5ff' }));
  E.push(note(x0 + 60, 595, 'Summary', 28, { strokeWidth: 2, strokeColor: BLUE }));
  E.push(note(x0 + 60, 645, 'Answer the essential question in two or three sentences. Use the words “system” and “tension.”', 26));

  var els = convert(E, { regenerateIds: false });
  els.forEach(function (e) { if (e.type === 'text') e.width = Math.ceil(e.width * 1.3); });
  return els;
}

export { build, FRAMES, SHELVES };
export var ID = 'systems';
export var TITLE = 'Physics Unit 3 · Day 4 · Connected objects';
