/* Lesson board for Chem Unit 4, day 4 (college prep): ions, ion charges, the ionic bond (electrons move from a metal to a nonmetal),
   naming ions. Hybrid board, same style as chem-trends.js and chem-bonding.js: only the slow or exact pictures are preset (the empty
   particle table, the group-to-charge grid, the two atom pairs drawn as Lewis symbols with empty brackets, the empty naming table);
   the arrows, ions and labels are drawn live, and the key words are written as labels. Each frame has a word list top right to tick off.
   Covers (select the cover, press Delete) are only on the warm-up, the checks and the exit. Pens as all unit: blue shells, red protons,
   green new words, purple shared electrons (not today), black the rest. Dots follow the unit test: one on each side (top, right,
   bottom, left), then pair up starting at the top. */

import { INK, BLUE, RED, GREEN, GRAY, rect, ellipse, text, line, arrow, labeled } from '../draw.js';
import { ctext } from '../stats.js';

var PURPLE = '#7048e8';
var FW = 1500, FH = 1080, GAP = 480;
var FRAMES = ['0 Question', '1 Ions', '2 Ion charges', '3 The ionic bond', '4 Naming ions', '5 Exit check'];
var SHELVES = ['Periodic table', 'Atom pictures'];
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

  /* ---- 0 question, warm-up, pen colors ---- */
  x0 = F(0); E = E.concat(title(x0, y0, 0, 'Ionic bonds and ion charges'));
  E.push(rect(x0 + 40, 100, 1420, 130, { strokeWidth: 2, backgroundColor: '#e7f5ff' }));
  E.push(note(x0 + 60, 115, 'Essential question', 26, { strokeWidth: 2, strokeColor: BLUE }));
  E.push(note(x0 + 60, 160, 'When a metal meets a nonmetal, what happens to their electrons, and what holds the atoms together afterward?', 26));
  E.push(note(x0 + 40, 280, 'Warm-up', 30, { strokeWidth: 2 }));
  E.push(note(x0 + 40, 330, '1  Sodium has 1 valence electron and chlorine has 7. What happens when they meet?', 24)); E = E.concat(answer(x0 + 40, 380, 880, 56, 'Sodium gives its electron to chlorine.'));
  E.push(note(x0 + 40, 470, '2  How many valence electrons does magnesium have?', 24)); E = E.concat(answer(x0 + 700, 462, 160, 48, '2'));
  E.push(note(x0 + 40, 540, '3  How many protons are in a neutral oxygen atom?', 24)); E = E.concat(answer(x0 + 700, 532, 160, 48, '8'));
  E.push(note(x0 + 940, 280, 'Colors today', 30, { strokeWidth: 2 }));
  E = E.concat(swatch(x0 + 940, 340, BLUE, 'shells'));
  E = E.concat(swatch(x0 + 940, 400, RED, 'protons'));
  E = E.concat(swatch(x0 + 940, 460, GREEN, 'new words'));
  E = E.concat(swatch(x0 + 940, 520, PURPLE, 'shared (not today)'));

  /* ---- 1 ions ---- */
  x0 = F(1); E = E.concat(title(x0, y0, 1, 'Ions'));
  E = E.concat(words(x0, ['ion', 'electrons', 'loses', 'cation', 'gains', 'anion']));
  E = E.concat(grid(x0 + 60, 110, [200, 160, 180, 160], 62, [['', 'Protons', 'Electrons', 'Charge'], ['Mg atom', '12', '12', '0'], ['Mg ion', '', '', ''], ['O atom', '8', '8', '0'], ['O ion', '', '', '']]));
  E.push(note(x0 + 800, 330, 'Draw here: the Mg atom, then its ion', 20, { strokeColor: GRAY }));
  E = E.concat(check(x0, 1, 'Sodium loses one electron. A student says it now has 10 protons. What is wrong?', 'Protons never change. Sodium still has 11 protons and now 10 electrons: the ion is 1+.'));

  /* ---- 2 ion charges ---- */
  x0 = F(2); E = E.concat(title(x0, y0, 2, 'Ion charges'));
  E = E.concat(words(x0, ['octet', 'negative', 'loses', 'gains', '2+', '2−']));
  var cw = [260, 120, 120, 120, 120, 120, 120, 120];
  E = E.concat(grid(x0 + 60, 130, cw, 70, [['Group'].concat(GROUPS.filter(function (g) { return g !== '14'; })).concat([]), ['Valence electrons', '1', '2', '3', '5', '6', '7', '8'], ['Gains or loses?', '', '', '', '', '', '', ''], ['Ion charge', '', '', '', '', '', '', '']].map(function (r) { return r.slice(0, 8); })));
  E.push(note(x0 + 60, 450, 'Worked: magnesium, then oxygen', 22, { strokeColor: GRAY }));
  E = E.concat(check(x0, 2, 'A student writes the oxygen ion as O²⁺. What is wrong with that?', 'Oxygen gains electrons, so there are more electrons than protons: the charge is negative, O²⁻.'));

  /* ---- 3 the ionic bond ---- */
  x0 = F(3); E = E.concat(title(x0, y0, 3, 'The ionic bond'));
  E = E.concat(words(x0, ['metal', 'nonmetal', 'attract', 'no', '8']));
  E = E.concat(pair(x0, 360, 'Li', 1, 'F', 7));
  E = E.concat(pair(x0, 590, 'Mg', 2, 'O', 6));
  E = E.concat(check(x0, 3, 'A student draws the electron moving from fluorine to lithium. Which way should it move, and why?', 'From lithium to fluorine: lithium has 1 valence electron to give, and fluorine is one electron short of an octet.'));

  /* ---- 4 naming ions ---- */
  x0 = F(4); E = E.concat(title(x0, y0, 4, 'Naming ions'));
  E = E.concat(words(x0, ['magnesium', '-ide']));
  E = E.concat(grid(x0 + 60, 160, [180, 200, 200, 200, 200, 200], 90, [['Atom', 'oxygen', 'nitrogen', 'sulfur', 'bromine', 'fluorine'], ['Anion', '', '', '', '', '']]));
  E.push(note(x0 + 60, 400, 'Mg²⁺ is the ______ ion.    Cl⁻ is the chloride ion.', 24, { strokeColor: GRAY }));
  E = E.concat(check(x0, 4, 'A student calls the ion made from iodine “iodine ion.” What is the correct name, and why?', 'Iodide: an anion’s name ends in -ide.'));

  /* ---- 5 exit check and summary ---- */
  x0 = F(5); E = E.concat(title(x0, y0, 5, 'Exit check'));
  E.push(note(x0 + 40, 110, 'a.  Ion symbols: lithium, aluminum, chlorine', 28)); E = E.concat(answer(x0 + 760, 100, 520, 56, 'Li⁺, Al³⁺, Cl⁻'));
  E.push(note(x0 + 40, 220, 'b.  Lewis dots: calcium and oxygen forming ions. Label the cation and anion.', 28)); E = E.concat(answer(x0 + 40, 270, 1300, 90, 'Ca gives its 2 electrons to O. [Ca]²⁺ is the cation; [O with 8 dots]²⁻ is the anion.'));
  E.push(note(x0 + 40, 410, 'c.  Why does aluminum form Al³⁺ and not Al⁺?', 28)); E = E.concat(answer(x0 + 40, 460, 1300, 56, 'It has 3 valence electrons and loses all 3 to reach a full outer level.'));
  E.push(rect(x0 + 40, 600, 1420, 200, { strokeWidth: 2, backgroundColor: '#e7f5ff' }));
  E.push(note(x0 + 60, 615, 'Summary', 28, { strokeWidth: 2, strokeColor: BLUE }));
  E.push(note(x0 + 60, 665, 'Answer the essential question in two or three sentences. Use the words “electrons” and “opposite.”', 26));

  var els = convert(E, { regenerateIds: false });
  els.forEach(function (e) { if (e.type === 'text') e.width = Math.ceil(e.width * 1.3); });
  return els;
}

export { build, FRAMES, SHELVES };
export var ID = 'ionic';
export var TITLE = 'Chem Unit 4 · Day 4 · Ionic bonds and ion charges';
