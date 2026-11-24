/* Lesson board for Chem Unit 4, day 3 (college prep): practice for trends (4.0), the octet rule (4.1) and Lewis dot symbols (4.2).
   Half online, half paper. Frame 0 is the warm-up, frame 1 sends students to the Trends Lab (trends-explorer.html), frame 2 is the
   whiteboard rounds (draw it, hold it up, take off the cover), frame 3 is the exit check for the paper slips. Answers sit under
   orange covers (select the cover, press Delete). Dots follow the unit test: one on each side (top, right, bottom, left), then pair
   up starting at the top. Pen colors as all unit: blue shells, red protons, green new words, purple shared electrons, black the rest. */

import { INK, BLUE, RED, GREEN, GRAY, rect, ellipse, text, labeled } from '../draw.js';
import { ctext } from '../stats.js';

var FW = 1500, FH = 1080, GAP = 480;
var FRAMES = ['0 Warm-up', '1 Trends Lab', '2 Whiteboard rounds', '3 Exit check'];
var SHELVES = ['Periodic table', 'Atom pictures'];

function cover(x, y, w, h) { return labeled(x, y, w, h, '?', 22, { strokeWidth: 2, strokeColor: '#e8590c', backgroundColor: '#ffd8a8' }); }
function answer(x, y, w, h, a) { return [rect(x, y, w, h, { strokeWidth: 1, strokeColor: GRAY }), text(x + 14, y + 12, a, 24, { strokeColor: INK }), cover(x, y, w, h)]; }
function title(x0, y0, i, t) { return [rect(x0, y0, FW, FH, { strokeWidth: 1, strokeColor: '#adb5bd', id: 'lesson-frame-' + i }), text(x0 + 24, y0 + 16, t, 34, { strokeWidth: 2 })]; }
function note(x, y, t, size, o) { return text(x, y, t, size || 28, o || {}); }

/* the unit's dot rule: one on each side first (t, r, b, l), then pair up from the top */
function sides(n) {
  var c = { t: 0, r: 0, b: 0, l: 0 }, order = ['t', 'r', 'b', 'l'], i;
  for (i = 0; i < Math.min(n, 4); i++) c[order[i]]++;
  for (i = 0; i < Math.max(n - 4, 0); i++) c[order[i]]++;
  return c;
}
/* a Lewis box with its dots, then an orange cover on top */
function lewis(x, y, w, sym, n) {
  var out = [rect(x, y, w, w, { strokeWidth: 1, strokeColor: GRAY }), ctext(x + w / 2, y + w / 2 - 14, sym, 30)], c = sides(n), cx = x + w / 2, cy = y + w / 2, k = w * 0.36;
  var off = { t: [0, -k], r: [k, 0], b: [0, k], l: [-k, 0] };
  Object.keys(c).forEach(function (s) {
    for (var j = 0; j < c[s]; j++) {
      var sh = c[s] === 1 ? 0 : (j === 0 ? -9 : 9), px = cx + off[s][0] + (s === 't' || s === 'b' ? sh : 0), py = cy + off[s][1] + (s === 'l' || s === 'r' ? sh : 0);
      out.push(ellipse(px - 6, py - 6, 12, 12, { strokeColor: INK, backgroundColor: INK, strokeWidth: 1 }));
    }
  });
  return out;
}
function boxAnswer(x, y, w, sym, n) { return lewis(x, y, w, sym, n).concat([cover(x, y, w, w)]); }
/* shells: rings 46 apart, electrons spaced evenly, the first at the top */
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

  /* ---- 0 warm-up ---- */
  x0 = F(0); E = E.concat(title(x0, y0, 0, 'Warm-up'));
  E.push(note(x0 + 40, 120, '1  How many valence electrons does this atom have?', 28));
  E = E.concat(bohr(x0 + 300, 400, [2, 8, 2], 'Mg', 12));
  E = E.concat(answer(x0 + 560, 330, 160, 56, '2'));
  E.push(note(x0 + 800, 120, '2  Which is larger, Na or Mg?', 28));
  E = E.concat(answer(x0 + 800, 190, 520, 56, 'Na: same shells, Mg has more protons'));
  E.push(note(x0 + 800, 420, '3  Which ion does magnesium form?', 28));
  E = E.concat(answer(x0 + 800, 490, 260, 56, 'Mg²⁺'));

  /* ---- 1 Trends Lab ---- */
  x0 = F(1); E = E.concat(title(x0, y0, 1, 'Trends Lab'));
  E.push(rect(x0 + 40, 110, 1420, 150, { strokeWidth: 2, backgroundColor: '#e7f5ff' }));
  E.push(note(x0 + 60, 125, 'Find the pattern', 28, { strokeWidth: 2, strokeColor: BLUE }));
  E.push(note(x0 + 60, 175, 'Size and electronegativity: across a row, then down a column. Then say why.', 28));
  E.push(note(x0 + 40, 320, 'Ionization energy', 28, { strokeWidth: 2, strokeColor: GREEN }));
  E.push(note(x0 + 40, 365, 'how hard it is to pull an outer electron off an atom', 26));
  E.push(note(x0 + 40, 470, 'Stage 1: measure atoms', 26));
  E.push(note(x0 + 40, 520, 'Stage 2 opens after 3 ionization energies', 26));
  E.push(note(x0 + 40, 570, 'Stage 3 opens after 3 pairs', 26));
  E.push(note(x0 + 40, 700, 'Reasons use one of two ideas: more shells, or more protons on the same shell.', 26, { strokeColor: RED }));

  /* ---- 2 whiteboard rounds ---- */
  x0 = F(2); E = E.concat(title(x0, y0, 2, 'Whiteboard rounds'));
  var R = [
    ['Draw sodium', 'Na', 1], ['Draw magnesium', 'Mg', 2], ['Draw nitrogen', 'N', 5],
    ['Draw sulfur', 'S', 6], null, ['A student draws carbon with two pairs of dots. Draw it correctly.', 'C', 4]];
  R.forEach(function (r, i) {
    var cx = x0 + 40 + (i % 3) * 480, cy = 110 + Math.floor(i / 3) * 360;
    E.push(rect(cx, cy, 440, 330, { strokeWidth: 1, strokeColor: '#adb5bd' }));
    E.push(note(cx + 16, cy + 12, 'Round ' + (i + 1), 22, { strokeWidth: 2, strokeColor: GREEN }));
    if (r === null) {
      E.push(note(cx + 16, cy + 56, 'Unpaired electrons in chlorine?', 24));
      E = E.concat(answer(cx + 16, cy + 120, 200, 56, '1'));
    } else {
      E.push(note(cx + 16, cy + 56, r[0], 24));
      E = E.concat(boxAnswer(cx + 140, cy + 130, 170, r[1], r[2]));
    }
  });

  /* ---- 3 exit check ---- */
  x0 = F(3); E = E.concat(title(x0, y0, 3, 'Exit check'));
  E.push(note(x0 + 40, 110, '1.  Circle the more electronegative atom:  Se   Br', 28)); E = E.concat(answer(x0 + 900, 100, 420, 56, 'Br'));
  E.push(note(x0 + 40, 230, '2.  Draw the Lewis dot symbol for arsenic. Circle its unpaired electrons.', 28));
  E = E.concat(boxAnswer(x0 + 900, 200, 170, 'As', 5));
  E.push(note(x0 + 1100, 270, '3 unpaired', 24, { strokeColor: GRAY }));
  E.push(note(x0 + 40, 520, '3.  Why does fluorine bond but xenon does not?', 28));
  E = E.concat(answer(x0 + 40, 580, 1300, 90, 'Fluorine has 7 valence electrons, one short of an octet. Xenon already has 8: a full outer level.'));

  var els = convert(E, { regenerateIds: false });
  els.forEach(function (e) { if (e.type === 'text') e.width = Math.ceil(e.width * 1.3); });
  return els;
}

export { build, FRAMES, SHELVES };
export var ID = 'practice3';
export var TITLE = 'Chem Unit 4 · Day 3 · Practice';
