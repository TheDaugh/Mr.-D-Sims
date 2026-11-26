/* Lesson board for Physics Unit 3 (Forces), day 6: practice for connected objects and springs (3.13, 3.14), with the day's real things,
   the Hyatt Regency skywalks and a hanging chain. The online part is Virtual Lab 6, the Spring Scale Bench (25 minutes from the bell),
   whose one huddle falls at minute 13: frame 1 is that huddle. Four frames: open the lab, the huddle, whiteboard rounds, the exit check.
   Pens: blue = objects and motion; red = forces; green = new words; black = everything else. */

import { INK, BLUE, RED, GREEN, GRAY, rect, text, line, arrow, labeled } from '../draw.js';

var FW = 1500, FH = 1080, GAP = 480;
var FRAMES = ['0 Open the lab', '1 Huddle', '2 Whiteboard rounds', '3 Exit check'];
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
function ceiling(x, y, w) {
  var out = [line(x, y, [[0, 0], [w, 0]], { strokeWidth: 3 })];
  for (var i = 10; i < w; i += 24) out.push(line(x + i, y - 4, [[0, 0], [14, -18]], { strokeWidth: 1, strokeColor: GRAY }));
  return out;
}
/* two walkways on rods. design 'one': one long rod, a nut under each walkway; 'two': an upper rod to the upper beam, a lower rod hanging from that beam */
function skywalks(x, y, design, label) {
  var out = ceiling(x, y, 300), up = y + 160, low = y + 330, rx = x + 150;
  out.push(note(x, y - 50, label, 24, { strokeWidth: 2 }));
  [up, low].forEach(function (yy) { out.push(rect(x + 20, yy, 260, 34, { strokeWidth: 2, strokeColor: BLUE, backgroundColor: '#e7f5ff' })); });
  var nut = function (nx, ny) { return rect(nx - 12, ny, 24, 14, { strokeWidth: 1, strokeColor: INK, backgroundColor: '#495057', fillStyle: 'solid' }); };
  if (design === 'one') { out.push(line(rx, y, [[0, 0], [0, low + 34 - y + 14]], { strokeWidth: 4 })); out.push(nut(rx, up + 34)); out.push(nut(rx, low + 34)); }
  else { out.push(line(rx - 14, y, [[0, 0], [0, up + 34 - y + 14]], { strokeWidth: 4 })); out.push(nut(rx - 14, up + 34)); out.push(line(rx + 14, up - 14, [[0, 0], [0, low + 34 - up + 28]], { strokeWidth: 4 })); out.push(nut(rx + 14, up - 14)); out.push(nut(rx + 14, low + 34)); }
  return out;
}
/* a vertical chain of n links from (x, y) down, each h tall */
function chain(x, y, n, h) {
  var out = ceiling(x - 60, y, 120);
  for (var i = 0; i < n; i++) out.push(rect(x - 14, y + 6 + i * h, 28, h - 10, { strokeWidth: 3, strokeColor: GRAY, roundness: { type: 3 } }));
  return out;
}

function build(convert) {
  var E = [], x0, y0 = 0, F = function (k) { return k * (FW + GAP); };

  /* ---- 0 open the lab, and the hook ---- */
  x0 = F(0); E = E.concat(title(x0, y0, 0, 'Practice: strings, springs and what hangs below'));
  E.push(rect(x0 + 40, 100, 720, 380, { strokeWidth: 2, backgroundColor: '#e7f5ff' }));
  E.push(note(x0 + 60, 115, 'Virtual Lab 6: the Spring Scale Bench', 28, { strokeWidth: 2, strokeColor: BLUE }));
  E.push(note(x0 + 60, 170, 'A  Calibrate the scale: find k.', 26));
  E.push(note(x0 + 60, 215, 'B  The scale in the string: held, then released.', 26));
  E.push(note(x0 + 60, 260, 'C  The walkway model: two designs.', 26));
  E.push(note(x0 + 60, 305, 'D  A chain with mass: link by link.', 26));
  E.push(note(x0 + 60, 360, 'A check after A, B and D. Huddle halfway.', 26));
  E.push(note(x0 + 60, 420, 'physics/virtual-lab/index.html?lab=06-spring-scales', 20, { strokeColor: GRAY }));
  E.push(note(x0 + 820, 110, 'Which nut holds the most?', 28, { strokeWidth: 2 }));
  E = E.concat(skywalks(x0 + 820, 230, 'one', 'On paper'));
  E = E.concat(skywalks(x0 + 1160, 230, 'two', 'As built'));
  E = E.concat(answer(x0 + 820, 640, 640, 56, 'As built: the upper nut holds both walkways.'));
  E.push(note(x0 + 40, 540, 'Kansas City, 1981. Hold your guess until Part C.', 24, { strokeColor: GRAY }));

  /* ---- 1 the huddle (minute 13 from the bell) ---- */
  x0 = F(1); E = E.concat(title(x0, y0, 1, 'Huddle: copy the blanks'));
  E = E.concat(words(x0, ['tension', 'equilibrium', 'spring constant']));
  var B = [['1  A spring scale reads F = k ___', 'x'], ['2  Held still: T = ___', 'mg'], ['3  Released: T is ___ than mg', 'less'], ['4  A rope, rod or link holds everything ___ it', 'below'], ['5  T above = T below + the ___ of that piece', 'weight']];
  B.forEach(function (b, i) { E.push(note(x0 + 40, 110 + i * 70, b[0], 28)); E = E.concat(answer(x0 + 760, 104 + i * 70, 200, 48, b[1])); });
  /* the hanging mass, held and released: the drawing the teacher adds arrows to */
  E.push(note(x0 + 40, 500, 'The hanging mass', 24, { strokeWidth: 2, strokeColor: BLUE }));
  E.push(labeled(x0 + 80, 580, 110, 90, 'held', 22, { strokeWidth: 2, strokeColor: BLUE, backgroundColor: '#e7f5ff' }));
  E.push(labeled(x0 + 330, 580, 110, 90, 'released', 22, { strokeWidth: 2, strokeColor: BLUE, backgroundColor: '#e7f5ff' }));
  E.push(arrow(x0 + 520, 580, [[0, 0], [0, 90]], { strokeColor: BLUE, strokeWidth: 3 })); E.push(note(x0 + 535, 600, 'a', 24, { strokeColor: BLUE }));
  E.push(note(x0 + 40, 820, 'Draw T and mg on each. Which arrow is longer?', 22, { strokeColor: GRAY }));
  /* the chain, cut above link 2 */
  E.push(note(x0 + 820, 500, 'A chain with mass', 24, { strokeWidth: 2, strokeColor: BLUE }));
  E = E.concat(chain(x0 + 900, 560, 6, 50));
  E.push(line(x0 + 850, 560 + 6 + 4 * 50 - 4, [[0, 0], [100, 0]], { strokeWidth: 2, strokeColor: RED, strokeStyle: 'dashed' }));
  E.push(note(x0 + 970, 750, 'cut here: what hangs below?', 22, { strokeColor: GRAY }));

  /* ---- 2 whiteboard rounds ---- */
  x0 = F(2); E = E.concat(title(x0, y0, 2, 'Whiteboard rounds'));
  E.push(note(x0 + 40, 110, '1  A spring scale with k = 75 N/m stretches 8.0 cm. What does it read?', 28)); E = E.concat(answer(x0 + 40, 160, 900, 56, 'F = 75 × 0.080 = 6.0 N'));
  E.push(note(x0 + 40, 270, '2  A 1.2 kg cart, a 0.40 kg hanging mass, no friction. T held? T released?', 28)); E = E.concat(answer(x0 + 40, 320, 1100, 56, 'Held: 3.9 N.  Released: a = 3.92 ÷ 1.6 = 2.45 m/s², T = 1.2 × 2.45 = 2.9 N'));
  E.push(note(x0 + 40, 430, '3  Two walkways put 30 kN each on a rod. The upper nut: on paper? as built?', 28)); E = E.concat(answer(x0 + 40, 480, 900, 56, 'On paper 30 kN; as built 60 kN'));
  E.push(note(x0 + 40, 590, '4  Eight links of 0.50 kg hang from a hook. T just above link 3? At the hook?', 28)); E = E.concat(answer(x0 + 40, 640, 900, 56, '3 × 4.9 = 14.7 N;  8 × 4.9 = 39.2 N'));
  E.push(note(x0 + 1200, 110, 'Draw here', 20, { strokeColor: GRAY }));

  /* ---- 3 exit check ---- */
  x0 = F(3); E = E.concat(title(x0, y0, 3, 'Exit check'));
  E.push(note(x0 + 40, 110, '1  A spring scale stretches 4.0 cm with a 0.30 kg mass hanging still. Find k.', 28)); E = E.concat(answer(x0 + 40, 160, 1080, 56, 'k = 2.94 ÷ 0.040 = 74 N/m'));
  E.push(note(x0 + 40, 270, '2  A 3.5 kg cart, a 0.70 kg hanging mass, no friction. Released: T?', 28)); E = E.concat(answer(x0 + 40, 320, 1080, 56, 'a = 6.86 ÷ 4.2 = 1.63 m/s², T = 3.5 × 1.63 = 5.7 N'));
  E.push(note(x0 + 40, 430, '3  Five links of 0.20 kg and a 1.0 kg lamp at the bottom. T above link 2? At the top?', 28)); E = E.concat(answer(x0 + 40, 480, 1080, 56, '(0.40 + 1.0) × 9.8 = 13.7 N;  (1.0 + 1.0) × 9.8 = 19.6 N'));
  E.push(rect(x0 + 40, 620, 1420, 120, { strokeWidth: 2, backgroundColor: '#e7f5ff' }));
  E.push(note(x0 + 60, 640, 'On paper, alone. The slips decide tomorrow.', 26, { strokeColor: BLUE }));

  var els = convert(E, { regenerateIds: false });
  els.forEach(function (e) { if (e.type === 'text') e.width = Math.ceil(e.width * 1.3); });
  return els;
}

export { build, FRAMES, SHELVES };
export var ID = 'practice6';
export var TITLE = 'Physics Unit 3 · Day 6 · Practice: strings, springs and what hangs below';
