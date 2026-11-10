/* Lesson board for Chem slot 15 (Effective nuclear charge and shielding): the notes huddle at minute 21.
   Students are on their computers all lesson; at the one huddle they look up and copy what Mr. D writes here. The pictures are already
   drawn. Mr. D writes the words and numbers into the blanks, in the same order as the Huddle tab on the page. Every blank has its answer
   under an orange cover: select the cover and press Delete to reveal it. Numbers come from chemistry/shared/zeff.js (the page's own model).
   build(convert) -> Excalidraw elements. FRAMES lists the frame names for the buttons along the top. */

import { INK, BLUE, RED, GRAY, rect, text, line, arrow, labeled } from '../draw.js';
import { ctext } from '../stats.js';
import { zatom } from '../chem.js';
import Zeff from '../../../../chemistry/shared/zeff.js';

var FW = 1500, FH = 1080, GAP = 480;
var FRAMES = ['1 Core and shielding', '2 Sodium, worked', '3 Label the atom', '4 What is tested'];
var SHELVES = ['Z_eff', 'Atom pictures', 'Electron configuration'];

function sh(els, dx, dy) { return els.map(function (e) { return Object.assign({}, e, { x: e.x + dx, y: e.y + dy }); }); }
function cover(x, y, w, h) { return labeled(x, y, w, h, '?', 22, { strokeWidth: 2, strokeColor: '#e8590c', backgroundColor: '#ffd8a8' }); }
/* a blank the students fill: an outlined box, the answer in red, and the cover over it */
function blank(x, y, w, a, size) {
  var h = 52, s = size || 28;
  return [rect(x, y, w, h, { strokeWidth: 2, backgroundColor: '#ffffff' }), ctext(x + w / 2, y + h / 2 - s * 0.6, String(a), s, { strokeColor: RED }), cover(x, y, w, h)];
}
function title(x0, y0, i, t) { return [rect(x0, y0, FW, FH, { strokeWidth: 1, strokeColor: '#adb5bd', id: 'lesson-frame-' + i }), text(x0 + 24, y0 + 16, t, 34, { strokeWidth: 2 })]; }
function note(x, y, t, size, o) { return text(x, y, t, size || 28, o || {}); }
function keep(x, y, w, t) { return [rect(x, y, w, 56, { strokeWidth: 2, backgroundColor: '#fff9db' }), note(x + 16, y + 10, 'KEEP   ' + t, 26, { strokeWidth: 2 })]; }
function badge(x, y, n) { return [labeled(x, y, 40, 40, String(n), 22, { strokeWidth: 2, backgroundColor: '#ffffff' })]; }

function build(convert) {
  var E = [], x0, y0 = 0, i, na = Zeff.atom(11), F = function (k) { return k * (FW + GAP); };
  var rings = na.rings.join(' + ');
  /* the sodium numbers, from the model, so the board and the page agree */
  var coreSum = na.rings.slice(0, -1).join(' + ');

  /* ---- 1 core and shielding ---- */
  x0 = F(0); E = E.concat(title(x0, y0, 0, 'Core and shielding'));
  E.push(note(x0 + 40, 90, 'Copy these three. Fill each blank as I write it.', 26, { strokeColor: GRAY }));
  E.push(note(x0 + 40, 150, '1  Core electrons:', 30, { strokeWidth: 2 })); E.push(note(x0 + 70, 206, 'the electrons', 26)); E = E.concat(blank(x0 + 250, 194, 170, 'inside', 26)); E.push(note(x0 + 440, 206, 'the outer ring.', 26));
  E.push(note(x0 + 40, 300, '2  Shielding:', 30, { strokeWidth: 2 })); E.push(note(x0 + 70, 356, 'core electrons', 26)); E = E.concat(blank(x0 + 270, 344, 150, 'cancel', 26)); E.push(note(x0 + 440, 356, 'part of the nucleus’s pull.', 26));
  E.push(note(x0 + 40, 450, '3  Z_eff:', 30, { strokeWidth: 2 })); E.push(note(x0 + 70, 506, 'Z_eff = Z minus the', 26)); E = E.concat(blank(x0 + 340, 494, 150, 'core', 26)); E.push(note(x0 + 510, 506, 'electrons.', 26));
  E = E.concat(keep(x0 + 40, 640, 760, 'Z_eff is the pull an outer electron really feels.'));
  E.push(note(x0 + 40, 940, 'Reading guide: core = inside the outer ring. Next: sodium, worked, then you label the atom.', 22, { strokeColor: GRAY }));

  /* ---- 2 sodium worked ---- */
  x0 = F(1); E = E.concat(title(x0, y0, 1, 'Sodium (Z = ' + na.Z + '): how hard is its outer electron held?'));
  E = E.concat(sh(zatom(11, { shade: true }), x0 + 40, 110));
  E.push(note(x0 + 460, 130, 'Rings:  ' + rings + '.   Total', 30)); E = E.concat(blank(x0 + 1010, 120, 120, na.Z));
  E.push(note(x0 + 460, 250, 'Core  =  ' + coreSum + '  =', 30)); E = E.concat(blank(x0 + 850, 240, 120, na.core));
  E.push(note(x0 + 460, 370, 'Z_eff  =  ' + na.Z + ' − ' + na.core + '  =', 30)); E = E.concat(blank(x0 + 850, 360, 120, na.zeff));
  E.push(note(x0 + 460, 490, 'Pull  =  Z_eff ÷ n²  =  ' + na.zeff + ' ÷ ' + na.n + '²  =', 30)); E = E.concat(blank(x0 + 1160, 480, 140, Zeff.frac(na)));
  E = E.concat(keep(x0 + 460, 620, 880, 'Z_eff = Z − core.   Sodium has +11 but feels only +1.'));
  E.push(note(x0 + 460, 700, 'n is the number of the outer ring (sodium: ring 3).  Pull is a classroom model number, not a measurement.', 22, { strokeColor: GRAY }));
  E.push(note(x0 + 40, 700, 'Watch for:', 26, { strokeWidth: 2, strokeColor: RED }));
  E.push(note(x0 + 40, 740, 'Using +11 as the pull.', 24)); E.push(note(x0 + 40, 775, 'Counting the outer electron as core.', 24));

  /* ---- 3 label the atom ---- */
  x0 = F(2); E = E.concat(title(x0, y0, 2, 'Label the sodium atom'));
  var AX = x0 + 420, AY = 80, R = 128;
  E.push(note(AX, AY, 'Sodium, Z = ' + na.Z, 28, { strokeWidth: 2 }));
  E = E.concat(sh(zatom(11, { shade: true }), AX + 20, AY + 50));
  var cx = AX + 20 + R, cy = AY + 50 + R, bx = AX + 20 + 2 * R + 60;
  [[22, -110, 1], [82, 0, 2], [118, 110, 3]].forEach(function (c) {
    E.push(line(cx + c[0], cy, [[0, 0], [bx - (cx + c[0]), c[1]]], { strokeColor: GRAY }));
    E = E.concat(badge(bx, cy + c[1] - 20, c[2]));
  });
  E.push(note(AX, AY + 400, '1  The nucleus has charge +', 24)); E = E.concat(blank(AX + 360, AY + 392, 110, na.Z, 24));
  E.push(note(AX, AY + 470, '2  The', 24)); E = E.concat(blank(AX + 90, AY + 462, 120, 'core', 24)); E.push(note(AX + 225, AY + 470, 'rings hold', 24)); E = E.concat(blank(AX + 370, AY + 462, 80, na.core, 24)); E.push(note(AX + 465, AY + 470, 'electrons.', 24));
  E.push(note(AX, AY + 540, '3  The', 24)); E = E.concat(blank(AX + 90, AY + 532, 130, 'outer', 24)); E.push(note(AX + 235, AY + 540, 'ring holds', 24)); E = E.concat(blank(AX + 380, AY + 532, 70, na.valence, 24)); E.push(note(AX + 465, AY + 540, 'electron.', 24));
  E.push(note(x0 + 40, 940, 'Amber rings = core.  Blue ring = outer.  The red circle is the nucleus.  Reading guide: count the dots on each ring first.', 22, { strokeColor: GRAY }));


  /* ---- 4 what is tested ---- */
  x0 = F(3); E = E.concat(title(x0, y0, 3, 'What is tested'));
  E.push(note(x0 + 40, 90, 'Same three moves, three atoms. I will not write these; you do them on your screen.', 26, { strokeColor: GRAY }));
  [[3, 0], [11, 1], [19, 2]].forEach(function (p) {
    var a = Zeff.atom(p[0]), ox = x0 + 40 + p[1] * 460;
    E = E.concat(sh(zatom(p[0], { shade: true }), ox, 150));
    E.push(note(ox, 150 + (RING_H(a.n)) + 12, a.name + ':  ' + a.rings.join(', '), 26, { strokeWidth: 2 }));
    E.push(note(ox, 150 + (RING_H(a.n)) + 52, 'Z_eff = ' + a.Z + ' − ' + a.core + ' = ' + a.zeff + '   pull ' + Zeff.frac(a), 26));
  });
  E.push(rect(x0 + 40, 640, 1380, 250, { strokeWidth: 2, backgroundColor: '#fff9db' }));
  E.push(note(x0 + 60, 655, 'You will be asked to:', 28, { strokeWidth: 2 }));
  E.push(note(x0 + 60, 705, '1  Estimate Z_eff for an atom from lithium to calcium (rings, core, Z − core).', 26));
  E.push(note(x0 + 60, 755, '2  Count the core electrons of an atom.', 26));
  E.push(note(x0 + 60, 805, '3  Say which of two atoms holds its outer electron harder, using Z_eff and the ring number.', 26));
  E.push(note(x0 + 40, 940, 'Back to your screens. Three short questions come next; the code ends this huddle.', 24, { strokeColor: GRAY }));
  /* text is measured before Nunito loads, so widen every box 30% (as the stencils do) or the last letters clip */
  var els = convert(E, { regenerateIds: false });
  els.forEach(function (e) { if (e.type === 'text') e.width = Math.ceil(e.width * 1.3); });
  return els;
}
function RING_H(n) { return 2 * ([46, 82, 118, 154][n - 1] + 10); }

export { build, FRAMES, SHELVES };
export var ID = 'zeff';
export var TITLE = 'Chem slot 15 · Effective nuclear charge and shielding';
