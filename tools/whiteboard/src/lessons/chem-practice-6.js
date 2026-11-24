/* Lesson board for Chem Unit 4, day 6 (college prep) practice: warm-up, the Trends Lab (one of each, the dish), whiteboard rounds on ions, ionic bonds and formulas, exit check.
   Hybrid board like chem-ionic.js: the empty charge table, the subscript table and the naming table are preset; the subscripts, formulas
   and names are written live and ticked off the green Words box. Covers only on the warm-up, the checks and the exit.
   Pens as all unit: blue shells, red protons, green new words, purple shared (not today), black the rest. */

import { INK, BLUE, RED, GREEN, GRAY, rect, ellipse, text, line, arrow, labeled } from '../draw.js';
import { ctext } from '../stats.js';

var PURPLE = '#7048e8';
var FW = 1500, FH = 1080, GAP = 480;
var FRAMES = ['0 Warm-up', '1 Trends Lab', '2 Whiteboard rounds', '3 Exit check'];
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

  x0 = F(0); E = E.concat(title(x0, y0, 0, 'Practice: ions, ionic bonds, formulas and names'));
  E.push(note(x0 + 40, 100, 'Warm-up', 30, { strokeWidth: 2 }));
  E.push(note(x0 + 40, 160, '1  What ion does aluminum form?', 26)); E = E.concat(answer(x0 + 700, 152, 200, 52, 'Al³⁺'));
  E.push(note(x0 + 40, 240, '2  What ion does selenium form?', 26)); E = E.concat(answer(x0 + 700, 232, 200, 52, 'Se²⁻'));
  E.push(note(x0 + 40, 320, '3  Name the ion iodine forms.', 26)); E = E.concat(answer(x0 + 700, 312, 200, 52, 'iodide'));
  E.push(note(x0 + 40, 500, 'Today', 30, { strokeWidth: 2 }));
  E.push(note(x0 + 40, 550, 'Lab: one of each, then the dish. Whiteboards. Practice sheet. Exit check.', 26));

  x0 = F(1); E = E.concat(title(x0, y0, 1, 'Trends Lab'));
  E.push(note(x0 + 40, 110, 'Open trends-explorer.html. Stage 2, then stage 3.', 28));
  E.push(note(x0 + 40, 200, 'For each pair, record:', 28, { strokeWidth: 2 }));
  E = E.concat(grid(x0 + 40, 260, [260, 260, 260, 260, 300], 70, [['Pair', 'Who gives', 'How many', 'Formula', 'Surprise?'], ['', '', '', '', ''], ['', '', '', '', ''], ['', '', '', '', '']]));
  E.push(note(x0 + 40, 610, 'The dish: which atoms, how many of each, what formula?', 26));

  x0 = F(2); E = E.concat(title(x0, y0, 2, 'Whiteboard rounds'));
  E.push(note(x0 + 40, 110, 'Draw it, hold it up. Covers come off after each round.', 26));
  E.push(note(x0 + 40, 180, 'A  Ion for gallium', 26)); E = E.concat(answer(x0 + 600, 172, 200, 50, 'Ga³⁺'));
  E.push(note(x0 + 40, 250, 'B  Ionic bond with dots: Mg and Se', 26)); E = E.concat(answer(x0 + 600, 242, 760, 50, '[Mg]²⁺ with no dots; [Se]²⁻ with 8 dots'));
  E.push(note(x0 + 40, 320, 'C  Formula: strontium and fluorine', 26)); E = E.concat(answer(x0 + 600, 312, 200, 50, 'SrF₂'));
  E.push(note(x0 + 40, 390, 'D  Name: Mg₃P₂', 26)); E = E.concat(answer(x0 + 600, 382, 400, 50, 'magnesium phosphide'));
  E.push(note(x0 + 40, 460, 'E  Formula: aluminum and selenium', 26)); E = E.concat(answer(x0 + 600, 452, 200, 50, 'Al₂Se₃'));
  E.push(note(x0 + 40, 540, 'F  A student writes SrP for strontium phosphide. Fix it.', 26)); E = E.concat(answer(x0 + 600, 532, 760, 50, 'Sr²⁺ and P³⁻: three Sr²⁺, two P³⁻: Sr₃P₂'));

  x0 = F(3); E = E.concat(title(x0, y0, 3, 'Exit check'));
  E.push(note(x0 + 40, 110, '1.  Formula: strontium and chlorine', 28)); E = E.concat(answer(x0 + 760, 100, 400, 56, 'SrCl₂'));
  E.push(note(x0 + 40, 220, '2.  Name: Rb₃N', 28)); E = E.concat(answer(x0 + 760, 210, 400, 56, 'rubidium nitride'));
  E.push(note(x0 + 40, 330, '3.  Why does beryllium form Be²⁺ and not Be⁺?', 28)); E = E.concat(answer(x0 + 40, 380, 1300, 90, 'Group 2: 2 valence electrons, both lost to reach a full outer level.'));
  E.push(note(x0 + 40, 560, 'Alone. Silent. Slips on paper.', 28, { strokeWidth: 2 }));

  var els = convert(E, { regenerateIds: false });
  els.forEach(function (e) { if (e.type === 'text') e.width = Math.ceil(e.width * 1.3); });
  return els;
}

export { build, FRAMES, SHELVES };
export var ID = 'practice6';
export var TITLE = 'Chem Unit 4 · Day 6 · Practice: ionic bonds, formulas and names';
