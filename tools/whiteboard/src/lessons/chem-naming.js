/* Lesson board for Chem Unit 4, day 8 (college prep): prefixes, molecular names and formulas, the three kinds of bond, the sea of electrons.
   Hybrid board like chem-ionic.js: the prefix table, the name and formula tables, the bond table and a lattice of metal ions are preset;
   the names, formulas and the sea of electrons are written live and ticked off the green Words box. Covers only on the warm-up, the checks and the exit.
   Pens as all unit: blue shells, red protons, green new words, purple shared (not today), black the rest. */

import { INK, BLUE, RED, GREEN, GRAY, rect, ellipse, text, line, arrow, labeled } from '../draw.js';
import { ctext } from '../stats.js';

var PURPLE = '#7048e8';
var FW = 1500, FH = 1080, GAP = 480;
var FRAMES = ['0 Question', '1 Prefixes', '2 Name and formula', '3 Three kinds of bonds', '4 Sea of electrons', '5 Exit check'];
var SHELVES = ['Periodic table', 'Ion cards'];
var GROUPS = ['1', '2', '13', '14', '15', '16', '17', '18'];

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
/* a grid of empty cells: first column is the row label, the rest are boxes; `given` puts text in cells */
function grid(x, y, colW, rowH, rows) {
  var out = [];
  rows.forEach(function (r, ri) {
    var cx = x;
    r.forEach(function (c, ci) {
      var w = colW[ci];
      out.push(rect(cx, y + ri * rowH, w, rowH, { strokeWidth: ri === 0 || ci === 0 ? 2 : 1, backgroundColor: ri === 0 ? '#f1f3f5' : 'transparent' }));
      if (c) out.push(ctext(cx + w / 2, y + ri * rowH + rowH / 2 - 11, c, 22, { strokeWidth: ri === 0 || ci === 0 ? 2 : 1 }));
      cx += w;
    });
  });
  return out;
}
/* Lewis symbol with its dots (no box): the unit's dot rule */
function sides(n) {
  var c = { t: 0, r: 0, b: 0, l: 0 }, order = ['t', 'r', 'b', 'l'], i;
  for (i = 0; i < Math.min(n, 4); i++) c[order[i]]++;
  for (i = 0; i < Math.max(n - 4, 0); i++) c[order[i]]++;
  return c;
}
function lewisAtom(cx, cy, sym, n) {
  var out = [ctext(cx, cy - 20, sym, 40)], c = sides(n), k = 52, off = { t: [0, -k], r: [k, 0], b: [0, k], l: [-k, 0] };
  Object.keys(c).forEach(function (s) {
    for (var j = 0; j < c[s]; j++) {
      var sh = c[s] === 1 ? 0 : (j === 0 ? -11 : 11), px = cx + off[s][0] + (s === 't' || s === 'b' ? sh : 0), py = cy + off[s][1] + (s === 'l' || s === 'r' ? sh : 0);
      out.push(ellipse(px - 7, py - 7, 14, 14, { strokeColor: INK, backgroundColor: INK, strokeWidth: 1 }));
    }
  });
  return out;
}
/* an empty bracket pair with the symbol inside, room for dots and a charge */
function bracketPair(cx, cy, sym) {
  var hw = 85, hh = 80, out = [];
  out.push(line(cx - hw, cy - hh, [[14, 0], [0, 0], [0, 2 * hh], [14, 2 * hh]], { strokeWidth: 3 }));
  out.push(line(cx + hw, cy - hh, [[-14, 0], [0, 0], [0, 2 * hh], [-14, 2 * hh]], { strokeWidth: 3 }));
  out.push(ctext(cx, cy - 20, sym, 40));
  return out;
}
function pair(x0, cy, m, mn, n, nn) {
  var out = [];
  out = out.concat(lewisAtom(x0 + 120, cy, m, mn));
  out.push(ctext(x0 + 255, cy - 20, '+', 40));
  out = out.concat(lewisAtom(x0 + 400, cy, n, nn));
  out.push(arrow(x0 + 520, cy, [[0, 0], [140, 0]], { strokeWidth: 3 }));
  out = out.concat(bracketPair(x0 + 790, cy, m));
  out = out.concat(bracketPair(x0 + 1030, cy, n));
  return out;
}
function bohr(cx, cy, shells, sym, z) {
  var out = [];
  shells.forEach(function (n, k) {
    var r = 46 * (k + 1);
    out.push(ellipse(cx - r, cy - r, 2 * r, 2 * r, { strokeColor: BLUE, strokeWidth: 2 }));
    for (var i = 0; i < n; i++) { var a = Math.PI / 2 + 2 * Math.PI * i / n; out.push(ellipse(cx + r * Math.cos(a) - 6, cy - r * Math.sin(a) - 6, 12, 12, { strokeColor: INK, backgroundColor: INK, strokeWidth: 1 })); }
  });
  out.push(ellipse(cx - 22, cy - 22, 44, 44, { strokeColor: RED, backgroundColor: '#ffe3e3', strokeWidth: 2 }));
  out.push(ctext(cx, cy - 11, '+' + z, 18, { strokeColor: RED }));
  return out;
}

function build(convert) {
  var E = [], x0, y0 = 0, F = function (k) { return k * (FW + GAP); };

  x0 = F(0); E = E.concat(title(x0, y0, 0, 'Naming molecules and bond types'));
  E.push(rect(x0 + 40, 100, 1420, 130, { strokeWidth: 2, backgroundColor: '#e7f5ff' }));
  E.push(note(x0 + 60, 115, 'Essential question', 26, { strokeWidth: 2, strokeColor: BLUE }));
  E.push(note(x0 + 60, 160, 'How do we name a molecular compound, and how do the elements in a substance tell us which kind of bond holds it together?', 26));
  E.push(note(x0 + 40, 280, 'Warm-up', 30, { strokeWidth: 2 }));
  E.push(note(x0 + 40, 330, '1  How many pairs do two nitrogen atoms share?', 24)); E = E.concat(answer(x0 + 700, 322, 300, 48, '3: a triple bond'));
  E.push(note(x0 + 40, 400, '2  Lone pairs on oxygen in water?', 24)); E = E.concat(answer(x0 + 700, 392, 160, 48, '2'));
  E.push(note(x0 + 40, 470, '3  Name: Rb₂O', 24)); E = E.concat(answer(x0 + 700, 462, 300, 48, 'rubidium oxide'));
  E.push(note(x0 + 940, 280, 'Colors today', 30, { strokeWidth: 2 }));
  E = E.concat(swatch(x0 + 940, 340, BLUE, 'shells'));
  E = E.concat(swatch(x0 + 940, 400, RED, 'protons'));
  E = E.concat(swatch(x0 + 940, 460, GREEN, 'new words'));
  E = E.concat(swatch(x0 + 940, 520, PURPLE, 'shared electrons'));

  x0 = F(1); E = E.concat(title(x0, y0, 1, 'Prefixes'));
  E = E.concat(words(x0, ['molecular compound', 'prefix', '-ide', 'mono-', 'first']));
  E = E.concat(grid(x0 + 60, 110, [200, 150, 150, 150, 150, 150], 70, [['Prefix', 'mono-', 'di-', 'tri-', 'tetra-', 'penta-'], ['Atoms', '', '', '', '', '']]));
  E.push(note(x0 + 60, 300, 'NF₃     N₂O', 30, { strokeWidth: 2 }));
  E = E.concat(check(x0, 1, 'A student names SO₃ “monosulfur trioxide.” What is wrong?', 'Mono- is never used on the first element: sulfur trioxide.'));

  x0 = F(2); E = E.concat(title(x0, y0, 2, 'Name and formula'));
  E = E.concat(words(x0, ['subscript', '1']));
  E = E.concat(grid(x0 + 60, 110, [180, 250, 280, 330, 300], 80, [['Formula', 'CS₂', 'Cl₂O', 'PCl₅', 'SiF₄'], ['Name', '', '', '', '']]));
  E = E.concat(grid(x0 + 60, 330, [180, 450, 450], 80, [['Name', 'dinitrogen trioxide', 'sulfur dichloride'], ['Formula', '', '']]));
  E = E.concat(check(x0, 2, 'A student writes N₃O₂ for dinitrogen trioxide. What is wrong?', 'The prefix goes with the element after it: di- on N (N₂), tri- on O (O₃).'));

  x0 = F(3); E = E.concat(title(x0, y0, 3, 'Three kinds of bonds'));
  E = E.concat(words(x0, ['ionic', 'covalent', 'metallic', 'metallic bond']));
  E = E.concat(grid(x0 + 60, 110, [320, 260, 260], 60, [['Made of', 'Bond', 'Electrons'], ['metal + nonmetal', '', ''], ['nonmetal + nonmetal', '', ''], ['metal only', '', '']]));
  E = E.concat(grid(x0 + 60, 400, [200, 170, 170, 170, 170, 170], 70, [['Substance', 'LiBr', 'NH₃', 'Zn', 'SrCl₂', 'Al'], ['Bond', '', '', '', '', '']]));
  E = E.concat(check(x0, 3, 'A student says H₂S is ionic because it contains sulfur. What is wrong?', 'Hydrogen and sulfur are both nonmetals, so the bond is covalent.'));

  x0 = F(4); E = E.concat(title(x0, y0, 4, 'Sea of electrons'));
  E = E.concat(words(x0, ['sea of electrons', 'move', 'bends']));
  [0, 1, 2].forEach(function (r) {
    for (var i = 0; i < 6; i++) {
      var cx = x0 + 140 + i * 130 + (r % 2 ? 65 : 0), cy = 200 + r * 120;
      E.push(ellipse(cx - 35, cy - 35, 70, 70, { strokeWidth: 2, backgroundColor: '#f1f3f5' })); E.push(ctext(cx, cy - 14, '+', 28));
    }
  });
  E.push(note(x0 + 60, 520, 'Draw the sea of electrons between the ions', 22, { strokeColor: GRAY }));
  E = E.concat(check(x0, 4, 'A student says aluminum foil carries current because its atoms flow along the foil. What is wrong?', 'The atoms stay put. The free electrons in the sea move.'));

  x0 = F(5); E = E.concat(title(x0, y0, 5, 'Exit check'));
  E.push(note(x0 + 40, 110, 'a.  Name NI₃.  Formula: oxygen difluoride', 28)); E = E.concat(answer(x0 + 40, 160, 1000, 56, 'nitrogen triiodide;  OF₂'));
  E.push(note(x0 + 40, 260, 'b.  Bond type: Mg, HI, KF', 28)); E = E.concat(answer(x0 + 40, 310, 1000, 56, 'metallic;  covalent;  ionic'));
  E.push(note(x0 + 40, 410, 'c.  Why can a metal be bent without breaking?', 28)); E = E.concat(answer(x0 + 40, 460, 1300, 90, 'The ions slide past each other and the sea of electrons stays around them.'));
  E.push(rect(x0 + 40, 650, 1420, 200, { strokeWidth: 2, backgroundColor: '#e7f5ff' }));
  E.push(note(x0 + 60, 665, 'Summary', 28, { strokeWidth: 2, strokeColor: BLUE }));
  E.push(note(x0 + 60, 715, 'Answer the essential question in two or three sentences. Use the words “prefix” and “sea.”', 26));

  var els = convert(E, { regenerateIds: false });
  els.forEach(function (e) { if (e.type === 'text') e.width = Math.ceil(e.width * 1.3); });
  return els;
}

export { build, FRAMES, SHELVES };
export var ID = 'naming';
export var TITLE = 'Chem Unit 4 · Day 8 · Naming molecules and bond types';
