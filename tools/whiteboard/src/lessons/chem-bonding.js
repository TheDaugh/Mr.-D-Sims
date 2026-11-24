/* Lesson board for Chem Unit 4, day 2 (college prep): why atoms bond (valence electrons, the octet rule) and Lewis dot symbols.
   Hybrid board, same style as chem-trends.js: only the slow or exact pictures are preset (the bare periodic table, the three shell
   pictures, empty Lewis boxes, the empty unpaired-electron grid); the dots and labels are drawn live in the empty space, and the key
   words are written as labels on the drawing. Each frame has a word list (top right) to tick off. Only the check questions and the
   warm-up have covered answers (select the cover, press Delete).
   Pens are the same all unit: blue = shells and distance, red = protons and the nucleus's pull, green = new words, purple = shared
   electrons, black = everything else (valence dots are black). Dots follow the unit test: one on each side (top, right, bottom,
   left), then pair up starting at the top. No energy-level language and no formal charge: this is the college-prep course. */

import { INK, BLUE, RED, GREEN, GRAY, rect, ellipse, text, labeled } from '../draw.js';
import { ctext } from '../stats.js';

var PURPLE = '#7048e8';
var FW = 1500, FH = 1080, GAP = 480;
var FRAMES = ['0 Question', '1 Valence electrons', '2 The octet rule', '3 Lewis dot symbols', '4 Unpaired electrons', '5 Exit check'];
var SHELVES = ['Periodic table', 'Atom pictures'];
var ROWS = [['H', '', '', '', '', '', '', 'He'], ['Li', 'Be', 'B', 'C', 'N', 'O', 'F', 'Ne'], ['Na', 'Mg', 'Al', 'Si', 'P', 'S', 'Cl', 'Ar'],
  ['K', 'Ca', 'Ga', 'Ge', 'As', 'Se', 'Br', 'Kr']];
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
/* shells to scale of the sheet: rings 46 apart, electrons spaced evenly on each ring, the first at the top */
function bohr(cx, cy, shells, sym, z) {
  var out = [];
  shells.forEach(function (n, k) {
    var r = 46 * (k + 1);
    out.push(ellipse(cx - r, cy - r, 2 * r, 2 * r, { strokeColor: BLUE, strokeWidth: 2 }));
    for (var i = 0; i < n; i++) {
      var a = Math.PI / 2 + 2 * Math.PI * i / n;
      out.push(ellipse(cx + r * Math.cos(a) - 6, cy - r * Math.sin(a) - 6, 12, 12, { strokeColor: INK, backgroundColor: INK, strokeWidth: 1 }));
    }
  });
  out.push(ellipse(cx - 22, cy - 22, 44, 44, { strokeColor: RED, backgroundColor: '#ffe3e3', strokeWidth: 2 }));
  out.push(ctext(cx, cy - 11, '+' + z, 18, { strokeColor: RED }));
  out.push(ctext(cx, cy + 46 * shells.length + 24, sym, 30, { strokeWidth: 2 }));
  return out;
}
/* a row of eight empty boxes under group numbers; `syms` puts a symbol in each box (the Lewis boxes), '' leaves it empty */
function boxes(x, y, w, h, syms, size, labelText) {
  var out = [];
  GROUPS.forEach(function (g, i) {
    out.push(ctext(x + i * w + w / 2, y - 30, i ? g : 'Group 1', 18, { strokeColor: GRAY }));
    out.push(syms ? labeled(x + i * w, y, w, h, syms[i], size || 40, { strokeWidth: 1 }) : rect(x + i * w, y, w, h, { strokeWidth: 1 }));
  });
  if (labelText) out.push(note(x - 40, y - 60, labelText, 22, { strokeColor: GRAY }));
  return out;
}
function swatch(x, y, col, label) { return [rect(x, y, 60, 30, { strokeColor: col, backgroundColor: col }), note(x + 80, y - 2, label, 28)]; }

function build(convert) {
  var E = [], x0, y0 = 0, F = function (k) { return k * (FW + GAP); };

  /* ---- 0 question, warm-up, pen colors ---- */
  x0 = F(0); E = E.concat(title(x0, y0, 0, 'Why atoms bond'));
  E.push(rect(x0 + 40, 100, 1420, 130, { strokeWidth: 2, backgroundColor: '#e7f5ff' }));
  E.push(note(x0 + 60, 115, 'Essential question', 26, { strokeWidth: 2, strokeColor: BLUE }));
  E.push(note(x0 + 60, 160, 'Why do atoms bond, and what do the dots in a Lewis symbol show?', 28));
  E.push(note(x0 + 40, 280, 'Warm-up', 30, { strokeWidth: 2 }));
  E.push(note(x0 + 40, 330, '1  How many shells does a sulfur atom have?', 26)); E = E.concat(answer(x0 + 700, 322, 160, 48, '3'));
  E.push(note(x0 + 40, 400, '2  Sodium or potassium: which is more reactive?', 26)); E = E.concat(answer(x0 + 700, 392, 160, 48, 'Potassium'));
  E.push(note(x0 + 40, 470, '3  Why are noble gases the exception to reactivity?', 26)); E = E.concat(answer(x0 + 40, 520, 820, 56, 'Their outer shell is already full.'));
  E.push(note(x0 + 900, 280, 'Colors today', 30, { strokeWidth: 2 }));
  E = E.concat(swatch(x0 + 900, 340, BLUE, 'shells, distance'));
  E = E.concat(swatch(x0 + 900, 400, RED, 'protons, pull'));
  E = E.concat(swatch(x0 + 900, 460, GREEN, 'new words'));
  E = E.concat(swatch(x0 + 900, 520, PURPLE, 'shared electrons'));

  /* ---- 1 valence electrons ---- */
  x0 = F(1); E = E.concat(title(x0, y0, 1, 'Valence electrons'));
  E = E.concat(words(x0, ['valence', 'group', '10', '2 (helium)', 'shells']));
  E = E.concat(table(x0 + 80, 150, 72));
  E.push(note(x0 + 700, 190, 'Draw here: sodium, shells and electrons', 20, { strokeColor: GRAY }));
  E = E.concat(boxes(x0 + 80, 530, 72, 60, null, 0, 'Valence electrons'));
  E = E.concat(check(x0, 1, 'A student says sulfur has 3 valence electrons because it is in period 3. What is wrong?', 'Period 3 means 3 shells. Sulfur is in group 16, so it has 6 valence electrons.'));

  /* ---- 2 the octet rule ---- */
  x0 = F(2); E = E.concat(title(x0, y0, 2, 'The octet rule'));
  E = E.concat(words(x0, ['full', 'stable', 'octet', 'loses', 'gains']));
  E = E.concat(bohr(x0 + 200, 300, [2, 8], 'Ne', 10));
  E = E.concat(bohr(x0 + 580, 300, [2, 8, 1], 'Na', 11));
  E = E.concat(bohr(x0 + 1000, 300, [2, 8, 7], 'Cl', 17));
  E.push(note(x0 + 150, 560, 'Draw here: what each atom does', 20, { strokeColor: GRAY }));
  E = E.concat(check(x0, 2, 'Neon has 8 valence electrons and fluorine has 7. Why does fluorine bond but neon does not?', 'Neon: outer level already full. Fluorine: one electron short of an octet.'));

  /* ---- 3 Lewis dot symbols ---- */
  x0 = F(3); E = E.concat(title(x0, y0, 3, 'Lewis dot symbols'));
  E = E.concat(words(x0, ['valence', 'pair', '5', 'top']));
  E = E.concat(boxes(x0 + 90, 290, 150, 150, ROWS[1], 44, 'Period 2'));
  E.push(note(x0 + 90, 500, 'Draw here: nitrogen, one dot at a time', 22, { strokeColor: GRAY }));
  E = E.concat(check(x0, 3, 'A student draws carbon with two pairs of dots, one on top and one on the right. Which rule did they break?', 'One dot on each side before any pair forms. Carbon has four single dots.'));

  /* ---- 4 unpaired electrons ---- */
  x0 = F(4); E = E.concat(title(x0, y0, 4, 'Unpaired electrons'));
  E = E.concat(words(x0, ['unpaired', '8', '0']));
  E = E.concat(boxes(x0 + 90, 250, 150, 110, null, 0, 'Unpaired electrons'));
  E.push(note(x0 + 90, 440, 'Worked: nitrogen', 22, { strokeColor: GRAY }));
  E.push(note(x0 + 700, 440, 'Noble gases', 22, { strokeColor: GRAY }));
  E = E.concat(check(x0, 4, 'Oxygen is in group 16. How many unpaired electrons does it have? Show how you know.', '6 valence electrons, so 8 − 6 = 2 unpaired electrons.'));

  /* ---- 5 exit check and summary ---- */
  x0 = F(5); E = E.concat(title(x0, y0, 5, 'Exit check'));
  E.push(note(x0 + 40, 110, 'a.  Lewis dot symbols for magnesium and chlorine', 28)); E = E.concat(answer(x0 + 40, 160, 1080, 56, 'Mg: single dots on top and right. Cl: pairs top, right, bottom; one dot left.'));
  E.push(note(x0 + 40, 260, 'b.  Unpaired electrons in silicon?', 28)); E = E.concat(answer(x0 + 760, 252, 520, 56, '4'));
  E.push(note(x0 + 40, 350, 'c.  Why does argon not form bonds?', 28)); E = E.concat(answer(x0 + 40, 400, 1080, 56, 'Full outer level of 8; no unpaired electrons.'));
  E.push(rect(x0 + 40, 560, 1420, 200, { strokeWidth: 2, backgroundColor: '#e7f5ff' }));
  E.push(note(x0 + 60, 575, 'Summary', 28, { strokeWidth: 2, strokeColor: BLUE }));
  E.push(note(x0 + 60, 625, 'Answer the essential question in two or three sentences. Use the words “octet” and “valence.”', 26));

  var els = convert(E, { regenerateIds: false });
  els.forEach(function (e) { if (e.type === 'text') e.width = Math.ceil(e.width * 1.3); });
  return els;
}

export { build, FRAMES, SHELVES };
export var ID = 'bonding';
export var TITLE = 'Chem Unit 4 · Day 2 · Why atoms bond';
