/* Lesson board for Chem Unit 4, day 1 (college prep): periodic trends — size, reactivity, electronegativity.
   Hybrid board (2026-11-24): the slow or exact pictures are preset (bare periodic tables, atoms to scale, the reactivity grid);
   the explanation is drawn live in the empty space, and the key words are written as labels on the drawing. Each frame has a
   word list (top right) to tick off as each word is said, so every blank on the student sheet has a label to come from.
   Only the check questions have covered answers (select the cover, press Delete).
   Pen colors mean the same thing all lesson (legend on frame 0): blue = shells and distance, red = protons and the nucleus's
   pull, green = new words, purple = shared electrons. No numbers and no Z_eff: this is the college-prep course. */

import { INK, BLUE, RED, GREEN, GRAY, rect, ellipse, text, labeled } from '../draw.js';
import { ctext } from '../stats.js';

var PURPLE = '#7048e8';
var FW = 1500, FH = 1080, GAP = 480;
var FRAMES = ['0 Question', '1 Two big ideas', '2 Atomic size', '3 Reactivity', '4 Electronegativity', '5 Exit check'];
var SHELVES = ['Periodic table', 'Atom pictures'];
var ROWS = [['H', '', '', '', '', '', '', 'He'], ['Li', 'Be', 'B', 'C', 'N', 'O', 'F', 'Ne'], ['Na', 'Mg', 'Al', 'Si', 'P', 'S', 'Cl', 'Ar'],
  ['K', 'Ca', 'Ga', 'Ge', 'As', 'Se', 'Br', 'Kr'], ['Rb', 'Sr', 'In', 'Sn', 'Sb', 'Te', 'I', 'Xe']];
var GROUPS = ['1', '2', '13', '14', '15', '16', '17', '18'];

function cover(x, y, w, h) { return labeled(x, y, w, h, '?', 22, { strokeWidth: 2, strokeColor: '#e8590c', backgroundColor: '#ffd8a8' }); }
function answer(x, y, w, h, a) { return [rect(x, y, w, h, { strokeWidth: 1, strokeColor: GRAY }), text(x + 14, y + 12, a, 24, { strokeColor: INK }), cover(x, y, w, h)]; }
function title(x0, y0, i, t) { return [rect(x0, y0, FW, FH, { strokeWidth: 1, strokeColor: '#adb5bd', id: 'lesson-frame-' + i }), text(x0 + 24, y0 + 16, t, 34, { strokeWidth: 2 })]; }
function note(x, y, t, size, o) { return text(x, y, t, size || 28, o || {}); }
/* the word list: a box top right, one line per word with a tick square */
function words(x0, list) {
  var x = x0 + FW - 320, y = 20, out = [rect(x, y, 300, 56 + list.length * 40, { strokeWidth: 2, strokeColor: GREEN, backgroundColor: '#ebfbee' }), note(x + 14, y + 10, 'Words', 24, { strokeWidth: 2, strokeColor: GREEN })];
  list.forEach(function (w, i) { out.push(rect(x + 16, y + 56 + i * 40, 22, 22, { strokeWidth: 1, strokeColor: GREEN })); out.push(note(x + 50, y + 50 + i * 40, w, 24, { strokeColor: GREEN })); });
  return out;
}
/* a check question at the foot of a frame, its answer under a cover */
function check(x0, n, q, a) {
  return [rect(x0 + 40, 700, FW - 80, 190, { strokeWidth: 2, strokeColor: INK, backgroundColor: '#f8f9fa' }), note(x0 + 60, 715, n + '.  ' + q, 26, { strokeWidth: 2 })].concat(answer(x0 + 60, 770, FW - 120, 100, a));
}
function table(x, y, c) {
  var out = [], cell = c || 70;
  GROUPS.forEach(function (g, i) { out.push(ctext(x + i * cell + cell / 2, y - 30, g, 18, { strokeColor: GRAY })); });
  ROWS.forEach(function (row, r) {
    out.push(ctext(x - 22, y + r * cell + cell / 2 - 11, String(r + 1), 18, { strokeColor: GRAY }));
    row.forEach(function (s, i) { if (s) out.push(labeled(x + i * cell, y + r * cell, cell, cell, s, 20, { strokeWidth: 1 })); });
  });
  return out;
}
function atom(cx, cy, sym, pm) { var r = pm * 0.34; return [ellipse(cx - r, cy - r, 2 * r, 2 * r, { strokeColor: GRAY, backgroundColor: '#f1f3f5' }), ctext(cx, cy - 13, sym, 22)]; }
function swatch(x, y, col, label) { return [rect(x, y, 60, 30, { strokeColor: col, backgroundColor: col }), note(x + 80, y - 2, label, 28)]; }

function build(convert) {
  var E = [], x0, y0 = 0, F = function (k) { return k * (FW + GAP); };

  /* ---- 0 question, warm-up, pen colors ---- */
  x0 = F(0); E = E.concat(title(x0, y0, 0, 'Periodic trends'));
  E.push(rect(x0 + 40, 100, 1420, 130, { strokeWidth: 2, backgroundColor: '#e7f5ff' }));
  E.push(note(x0 + 60, 115, 'Essential question', 26, { strokeWidth: 2, strokeColor: BLUE }));
  E.push(note(x0 + 60, 160, 'Why are atoms at the bottom left big and reactive, and atoms at the top right small and grabby?', 28));
  E.push(note(x0 + 40, 280, 'Warm-up', 30, { strokeWidth: 2 }));
  E.push(note(x0 + 40, 330, '1  How many shells does a sodium atom have?', 26)); E = E.concat(answer(x0 + 640, 322, 160, 48, '3'));
  E.push(note(x0 + 40, 400, '2  Which group is chlorine in?', 26)); E = E.concat(answer(x0 + 640, 392, 160, 48, '17'));
  E.push(note(x0 + 40, 470, '3  Which ion does potassium form?', 26)); E = E.concat(answer(x0 + 640, 462, 160, 48, 'K⁺'));
  E.push(note(x0 + 900, 280, 'Colors today', 30, { strokeWidth: 2 }));
  E = E.concat(swatch(x0 + 900, 340, BLUE, 'shells, distance'));
  E = E.concat(swatch(x0 + 900, 400, RED, 'protons, pull'));
  E = E.concat(swatch(x0 + 900, 460, GREEN, 'new words'));
  E = E.concat(swatch(x0 + 900, 520, PURPLE, 'shared electrons'));

  /* ---- 1 two big ideas ---- */
  x0 = F(1); E = E.concat(title(x0, y0, 1, 'Two ideas behind every trend'));
  E = E.concat(words(x0, ['period', 'group', 'shell', 'farther', 'proton', 'harder']));
  E = E.concat(table(x0 + 80, 150, 72));
  E.push(note(x0 + 700, 520, 'Draw here: Na and Cl side by side', 20, { strokeColor: GRAY }));
  E = E.concat(check(x0, 1, 'Sodium and chlorine are both in period 3. Which has more protons pulling on its outer shell?', 'Chlorine: 17 protons to 11, on the same shell.'));

  /* ---- 2 atomic size ---- */
  x0 = F(2); E = E.concat(title(x0, y0, 2, 'Atomic size'));
  E = E.concat(words(x0, ['bigger', 'shells', 'smaller', 'protons', 'potassium']));
  [['Li', 152], ['Na', 186], ['K', 227]].forEach(function (a, i) { E = E.concat(atom(x0 + 140, 170 + i * 175, a[0], a[1])); });
  E.push(note(x0 + 100, 640, 'Group 1', 22, { strokeColor: GRAY }));
  [['Na', 186], ['Mg', 160], ['Al', 143], ['Si', 118], ['P', 110], ['S', 103], ['Cl', 99]].forEach(function (a, i) { E = E.concat(atom(x0 + 340 + i * 112, 170, a[0], a[1])); });
  E.push(note(x0 + 640, 260, 'Period 3', 22, { strokeColor: GRAY }));
  E.push(note(x0 + 420, 380, 'Worked: potassium or bromine?', 24, { strokeColor: GRAY }));
  E = E.concat(check(x0, 2, 'A student says chlorine is bigger than sodium because it has more electrons. What is wrong?', 'The extra electrons are on the same shell, and the extra protons pull that shell in: chlorine is smaller.'));

  /* ---- 3 reactivity ---- */
  x0 = F(3); E = E.concat(title(x0, y0, 3, 'Reactivity'));
  E = E.concat(words(x0, ['losing', 'gaining', 'far from', 'close to', 'bottom left', 'top right', 'cesium', 'fluorine', 'full']));
  var tx = x0 + 40, ty = 110, c0 = 360, c1 = 300, rh = 74;
  [['', 'Metals', 'Nonmetals'], ['React by…', '', ''], ['Easier when the outer electron is…', '', ''], ['Most reactive corner', '', ''], ['Most reactive (of these)', '', '']].forEach(function (r, i) {
    E.push(rect(tx, ty + i * rh, c0, rh, { strokeWidth: 1 })); E.push(note(tx + 10, ty + i * rh + 22, r[0], 20, { strokeWidth: i ? 1 : 2 }));
    [1, 2].forEach(function (k) { var x = tx + c0 + (k - 1) * c1; E.push(rect(x, ty + i * rh, c1, rh, { strokeWidth: 1 })); if (i === 0) E.push(ctext(x + c1 / 2, ty + 20, r[k], 24, { strokeWidth: 2 })); });
  });
  E.push(note(x0 + 40, 520, 'Noble gases: outer shell already ______', 24, { strokeColor: GRAY }));
  E.push(note(x0 + 40, 580, 'Worked: sodium or potassium?', 24, { strokeColor: GRAY }));
  E = E.concat(check(x0, 3, 'Neon is at the top right. Why is it not the most reactive nonmetal?', 'Its outer shell is already full, so it has no reason to gain an electron.'));

  /* ---- 4 electronegativity ---- */
  x0 = F(4); E = E.concat(title(x0, y0, 4, 'Electronegativity'));
  E = E.concat(words(x0, ['pulls', 'increases', 'decreases', 'fluorine', 'bond', 'takes', 'share']));
  E = E.concat(table(x0 + 80, 150, 62));
  E.push(note(x0 + 640, 480, 'Draw here: two atoms sharing a pair', 20, { strokeColor: GRAY }));
  E.push(note(x0 + 80, 520, 'Worked: rank Cl, Na, P', 24, { strokeColor: GRAY }));
  E = E.concat(check(x0, 4, 'Which pulls harder on shared electrons, bromine or fluorine? Why?', 'Fluorine: same group, fewer shells, so its nucleus is closer to the shared electrons.'));

  /* ---- 5 exit check and summary ---- */
  x0 = F(5); E = E.concat(title(x0, y0, 5, 'Exit check'));
  E.push(note(x0 + 40, 110, 'a.  Larger atom:  Mg or Ba?    N or Li?', 28)); E = E.concat(answer(x0 + 760, 100, 520, 56, 'Ba (more shells); Li (fewer protons)'));
  E.push(note(x0 + 40, 220, 'b.  Least to most electronegative: O, Li, C', 28)); E = E.concat(answer(x0 + 760, 210, 520, 56, 'Li, C, O'));
  E.push(note(x0 + 40, 330, 'c.  More reactive: calcium or magnesium? Why?', 28)); E = E.concat(answer(x0 + 760, 320, 680, 90, 'Calcium: outer electrons one shell farther out'));
  E.push(rect(x0 + 40, 560, 1420, 200, { strokeWidth: 2, backgroundColor: '#e7f5ff' }));
  E.push(note(x0 + 60, 575, 'Summary', 28, { strokeWidth: 2, strokeColor: BLUE }));
  E.push(note(x0 + 60, 625, 'Answer the essential question in two or three sentences. Use the words shell and proton.', 26));

  var els = convert(E, { regenerateIds: false });
  els.forEach(function (e) { if (e.type === 'text') e.width = Math.ceil(e.width * 1.3); });
  return els;
}

export { build, FRAMES, SHELVES };
export var ID = 'trends';
export var TITLE = 'Chem Unit 4 · Day 1 · Periodic trends';
