/* Lesson board for Chem Unit 4, day 1 (college prep): periodic trends — size, reactivity, electronegativity.
   Matches the Unit 4 Day 1 Cornell notes blank for blank, in the same order. The teacher writes into the blanks; every blank has
   its answer under an orange cover (select it, press Delete). The periodic tables are left bare so the trend arrows are drawn live.
   No numbers and no Z_eff: this is the college-prep course. build(convert) -> Excalidraw elements. */

import { INK, BLUE, RED, GRAY, rect, ellipse, text, labeled } from '../draw.js';
import { ctext } from '../stats.js';

var FW = 1500, FH = 1080, GAP = 480;
var FRAMES = ['0 Question', '1 Two big ideas', '2 Atomic size', '3 Reactivity', '4 Electronegativity', '5 Practice'];
var SHELVES = ['Periodic table', 'Atom pictures'];
var ROWS = [['H', '', '', '', '', '', '', 'He'], ['Li', 'Be', 'B', 'C', 'N', 'O', 'F', 'Ne'], ['Na', 'Mg', 'Al', 'Si', 'P', 'S', 'Cl', 'Ar'],
  ['K', 'Ca', 'Ga', 'Ge', 'As', 'Se', 'Br', 'Kr'], ['Rb', 'Sr', 'In', 'Sn', 'Sb', 'Te', 'I', 'Xe']];
var GROUPS = ['1', '2', '13', '14', '15', '16', '17', '18'];

function cover(x, y, w, h) { return labeled(x, y, w, h, '?', 22, { strokeWidth: 2, strokeColor: '#e8590c', backgroundColor: '#ffd8a8' }); }
function blank(x, y, w, a, size) {
  var h = 52, s = size || 28;
  return [rect(x, y, w, h, { strokeWidth: 2, backgroundColor: '#ffffff' }), ctext(x + w / 2, y + h / 2 - s * 0.6, String(a), s, { strokeColor: RED }), cover(x, y, w, h)];
}
function title(x0, y0, i, t) { return [rect(x0, y0, FW, FH, { strokeWidth: 1, strokeColor: '#adb5bd', id: 'lesson-frame-' + i }), text(x0 + 24, y0 + 16, t, 34, { strokeWidth: 2 })]; }
function note(x, y, t, size, o) { return text(x, y, t, size || 28, o || {}); }
function keep(x, y, w, t) { return [rect(x, y, w, 56, { strokeWidth: 2, backgroundColor: '#fff9db' }), note(x + 16, y + 10, 'KEEP   ' + t, 26, { strokeWidth: 2 })]; }
/* a sentence with blanks: parts are strings or [answer, width]; laid out left to right */
function say(x, y, parts, size) {
  var s = size || 28, out = [], cx = x;
  parts.forEach(function (p) {
    if (typeof p === 'string') { out.push(note(cx, y + 10, p, s)); cx += p.length * s * 0.5 + 12; }
    else { out = out.concat(blank(cx, y, p[1], p[0], s - 2)); cx += p[1] + 14; }
  });
  return out;
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
/* atoms to scale, radius in pm */
function atom(cx, cy, sym, pm, col, fill) { var r = pm * 0.42; return [ellipse(cx - r, cy - r, 2 * r, 2 * r, { strokeColor: col, backgroundColor: fill }), ctext(cx, cy - 13, sym, 22)]; }

function build(convert) {
  var E = [], x0, y0 = 0, F = function (k) { return k * (FW + GAP); };

  /* ---- 0 question and warm-up ---- */
  x0 = F(0); E = E.concat(title(x0, y0, 0, 'Periodic trends'));
  E.push(rect(x0 + 40, 100, 1420, 130, { strokeWidth: 2, backgroundColor: '#e7f5ff' }));
  E.push(note(x0 + 60, 115, 'Essential question', 26, { strokeWidth: 2, strokeColor: BLUE }));
  E.push(note(x0 + 60, 160, 'Why are atoms at the bottom left big and reactive, and atoms at the top right small and grabby?', 28));
  E.push(note(x0 + 40, 290, 'Warm-up: from the last unit', 30, { strokeWidth: 2 }));
  E = E.concat(say(x0 + 40, 350, ['1  How many shells does a sodium atom have?', ['3', 90]]));
  E = E.concat(say(x0 + 40, 440, ['2  Chlorine is in group', ['17', 90]]));
  E = E.concat(say(x0 + 40, 530, ['3  Potassium forms the ion', ['K⁺', 100]]));

  /* ---- 1 two big ideas ---- */
  x0 = F(1); E = E.concat(title(x0, y0, 1, 'Two ideas behind every trend'));
  E = E.concat(table(x0 + 80, 150, 72));
  var bx = x0 + 740;
  E = E.concat(say(bx, 140, ['A trend changes across a', ['period', 140]], 26));
  E = E.concat(say(bx, 210, ['or down a', ['group', 130]], 26));
  E.push(note(bx, 320, 'Idea 1: down a group', 28, { strokeWidth: 2, strokeColor: BLUE }));
  E = E.concat(say(bx, 370, ['each atom adds a new', ['shell', 120]], 26));
  E = E.concat(say(bx, 440, ['so outer electrons are', ['farther', 140]], 26));
  E.push(note(bx, 550, 'Idea 2: across a period', 28, { strokeWidth: 2, strokeColor: RED }));
  E = E.concat(say(bx, 600, ['one more', ['proton', 140], 'each step,'], 26));
  E = E.concat(say(bx, 670, ['same ', ['shell', 120], 'so the pull is'], 26));
  E = E.concat(say(bx, 740, [['harder', 140]], 26));
  E = E.concat(keep(x0 + 40, 900, 1100, 'Down = more shells.   Across = more protons, same shell.'));

  /* ---- 2 atomic size ---- */
  x0 = F(2); E = E.concat(title(x0, y0, 2, 'Atomic size'));
  [['Li', 152], ['Na', 186], ['K', 227]].forEach(function (a, i) { E = E.concat(atom(x0 + 140, 190 + i * 215, a[0], a[1], BLUE, '#dbe8f5')); });
  E.push(note(x0 + 100, 730, 'Group 1', 22, { strokeColor: GRAY }));
  [['Na', 186], ['Mg', 160], ['Al', 143], ['Si', 118], ['P', 110], ['S', 103], ['Cl', 99]].forEach(function (a, i) { E = E.concat(atom(x0 + 420 + i * 158, 190, a[0], a[1], '#c55a11', '#fbe5d6')); });
  E.push(note(x0 + 820, 290, 'Period 3', 22, { strokeColor: GRAY }));
  E = E.concat(say(x0 + 420, 400, ['Down a group atoms get', ['bigger', 130], ': more', ['shells', 130]], 26));
  E = E.concat(say(x0 + 420, 480, ['Across a period they get', ['smaller', 140], ': more', ['protons', 150]], 26));
  E.push(note(x0 + 420, 580, 'Worked: potassium or bromine, which is larger?', 26, { strokeWidth: 2 }));
  E.push(note(x0 + 420, 625, 'Both period 4: same shells. Bromine has more protons pulling in.', 24));
  E = E.concat(say(x0 + 420, 670, ['Larger:', ['potassium', 190]], 26));
  E = E.concat(keep(x0 + 40, 900, 1000, 'Biggest atoms: bottom left.   Smallest: top right.'));

  /* ---- 3 reactivity ---- */
  x0 = F(3); E = E.concat(title(x0, y0, 3, 'Reactivity'));
  var tx = x0 + 60, ty = 110, c0 = 420, c1 = 330, rh = 80;
  [['', 'Metals', 'Nonmetals'], ['React by…', 'losing', 'gaining'], ['Easier when the outer electron is…', 'far from nucleus', 'close to nucleus'],
   ['Most reactive corner', 'bottom left', 'top right'], ['Most reactive (of these)', 'cesium', 'fluorine']].forEach(function (r, i) {
    E.push(rect(tx, ty + i * rh, c0, rh, { strokeWidth: 1 })); E.push(note(tx + 10, ty + i * rh + 24, r[0], 22, { strokeWidth: i ? 1 : 2 }));
    [1, 2].forEach(function (k) {
      var x = tx + c0 + (k - 1) * c1;
      E.push(rect(x, ty + i * rh, c1, rh, { strokeWidth: 1 }));
      if (i === 0) E.push(ctext(x + c1 / 2, ty + 22, r[k], 24, { strokeWidth: 2 }));
      else E = E.concat(blank(x + 14, ty + i * rh + 14, c1 - 28, r[k], 22));
    });
  });
  E = E.concat(say(x0 + 60, 560, ['Noble gases: outer shell already', ['full', 100], ', so they hardly react.'], 26));
  E.push(note(x0 + 60, 660, 'Worked: sodium or potassium, which is more reactive?', 26, { strokeWidth: 2 }));
  E = E.concat(say(x0 + 60, 710, ['K\'s outer electron is one shell', ['farther', 140], 'out, so:', ['potassium', 190]], 26));
  E = E.concat(keep(x0 + 40, 900, 1200, 'Metals: most reactive bottom left.   Nonmetals: top right (not the noble gases).'));

  /* ---- 4 electronegativity ---- */
  x0 = F(4); E = E.concat(title(x0, y0, 4, 'Electronegativity'));
  E = E.concat(say(x0 + 40, 100, ['Electronegativity: how strongly an atom', ['pulls', 120], 'shared electrons in a bond'], 26));
  E = E.concat(table(x0 + 80, 230, 62));
  bx = x0 + 680;
  E = E.concat(say(bx, 220, [['increases', 180], 'across a period'], 26));
  E = E.concat(say(bx, 300, [['decreases', 180], 'down a group'], 26));
  E = E.concat(say(bx, 380, ['Most electronegative:', ['fluorine', 170]], 26));
  E = E.concat(say(bx, 460, ['Noble gases left out: they rarely', ['bond', 110]], 26));
  E.push(note(bx, 560, 'Why it matters (next lesson):', 26, { strokeWidth: 2 }));
  E = E.concat(say(bx, 610, ['big difference: one atom', ['takes', 120], 'the electron'], 24));
  E = E.concat(say(bx, 680, ['small difference: the atoms', ['share', 120], 'it'], 24));
  E = E.concat(say(x0 + 40, 600, ['Rank Cl, Na, P (least to most):', ['Na, P, Cl', 170]], 24));
  E = E.concat(keep(x0 + 40, 900, 1000, 'Electronegativity grows toward fluorine, top right.'));

  /* ---- 5 practice and summary ---- */
  x0 = F(5); E = E.concat(title(x0, y0, 5, 'Try these'));
  E = E.concat(say(x0 + 40, 120, ['1  Larger:  (a) Mg or Ba', ['Ba', 90], '   (b) N or Li', ['Li', 90]], 28));
  E = E.concat(say(x0 + 40, 230, ['2  Least to most electronegative: O, Li, C', ['Li, C, O', 160]], 28));
  E = E.concat(say(x0 + 40, 340, ['3  More reactive: calcium or magnesium?', ['calcium', 160]], 28));
  E.push(note(x0 + 90, 410, 'Why: its outer electrons are one shell farther out.', 24, { strokeColor: GRAY }));
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
