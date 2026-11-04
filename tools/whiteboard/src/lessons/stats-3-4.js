/* Lesson board for Stats 3.4 (Using the Empirical Rule): the whole day's pictures already drawn, in teaching order.
   Mr. D writes, scrolls and explains; he does not draw. Each frame is one screen. Answers sit under an orange cover:
   select the cover and press Delete to reveal what is under it. The numbers match the 3.4 thinking notes and board script.

   build(convert) -> Excalidraw elements. FRAMES lists the frame names for the buttons along the top. */

import { INK, BLUE, RED, GREEN, GRAY, rect, text, line, arrow, labeled } from '../draw.js';
import { graph, normal, ctext } from '../stats.js';

/* FH leaves a free band at the bottom of every frame for the buttons that sit over the canvas. */
var FW = 1500, FH = 1080, GAP = 480;
var CBLUE = '#bcd3ee', CYEL = '#f6e7a8', CORG = '#f4c7a1', Z1 = '#d6ecec', Z2 = '#9fd3d3', Z3 = '#52b3b3';
var HOP = '#1971c2';

var FRAMES = ['Warm-up', 'Part 1: out of 100', 'Part 2: hops', 'Part 3: predict', 'Part 3: the rule', 'Part 3: examples', 'Exit and up next'];

function sh(els, dx, dy) { return els.map(function (e) { return Object.assign({}, e, { x: e.x + dx, y: e.y + dy }); }); }
function cover(x, y, w, h) { return labeled(x, y, w, h, '?', 22, { strokeWidth: 2, strokeColor: '#e8590c', backgroundColor: '#ffd8a8' }); }
/* an answer box: outline, the answer, and the cover that hides it */
function ans(x, y, w, h, a, size) {
  return [rect(x, y, w, h, { strokeWidth: 2, backgroundColor: '#ffffff' }), ctext(x + w / 2, y + h / 2 - (size || 26) * 0.6, String(a), size || 26, { strokeColor: RED }), cover(x, y, w, h)];
}
function given(x, y, w, h, t, size) {
  return [rect(x, y, w, h, { strokeWidth: 2, backgroundColor: '#ffffff' }), ctext(x + w / 2, y + h / 2 - (size || 26) * 0.6, String(t), size || 26)];
}
function title(x0, y0, i, t) {
  return [rect(x0, y0, FW, FH, { strokeWidth: 1, strokeColor: '#adb5bd', id: 'lesson-frame-' + i }), text(x0 + 24, y0 + 16, t, 34, { strokeWidth: 2 })];
}
function note(x, y, t, size, o) { return text(x, y, t, size || 28, o || {}); }

/* The bus curve (mean 30, SD 4) with optional shading and cut lines. Plot is w wide, h tall; returns elements and the x mapper. */
var BUS = normal(30, 4, 14, 46);
function bus(w, h, shade, cuts, ticksOn, tickSize) {
  var ticks = [], v;
  for (v = 18; v <= 42; v += 4) ticks.push([v, ticksOn === false ? '' : String(v)]);
  var spec = { w: w, h: h, lo: 14, hi: 46, ymax: 0.112, yaxis: false, tickSize: tickSize || 20, ticks: ticks, curves: [{ d: BUS }], shade: shade || [],
    vlines: (cuts || []).map(function (c) { return { x: c, dash: true }; }) };
  return graph(spec);
}
function sx(w, v) { return 46 + (v - 14) / 32 * w; }

/* The 100 bar: segments sized by percent. segs: [[percent, fill, text or null, answer or null]] */
function bar(x, y, w, segs) {
  var out = [], left = 0;
  segs.forEach(function (s) {
    var sw = w * s[0] / 100;
    out.push(rect(x + left, y, sw, 56, { strokeWidth: 2, backgroundColor: s[1] }));
    if (s[2] !== null) out.push(ctext(x + left + sw / 2, y + 14, s[2], 28, { strokeWidth: 2 }));
    else out.push.apply(out, ans(x + left + sw / 2 - 40, y + 6, 80, 44, s[3], 28));
    left += sw;
  });
  out.push(ctext(x + w / 2, y + 64, 'out of every 100 rides', 20, { strokeColor: GRAY }));
  return out;
}

/* hops picture: a normal curve with marks, arcs below the axis, and a box under every mark. ks = hop positions, shown = which print their number. */
function hops(x0, y0, mu, sd, w, ks, shown, sign) {
  var h = 150, lo = mu - 3.6 * sd, hi = mu + 3.6 * sd, L = 46, T = 34, out = [], i;
  var d = normal(mu, sd, lo, hi), m = function (v) { return L + (v - lo) / (hi - lo) * w; };
  var base = graph({ w: w, h: h, lo: lo, hi: hi, ymax: 1 / (sd * 2.35), yaxis: false, curves: [{ d: d }],
    ticks: ks.map(function (k) { return [mu + k * sd, '']; }) });
  out = out.concat(sh(base, x0, y0));
  var ty = y0 + T + h;
  var seq = ks.slice().sort(function (a, b) { return sign > 0 ? a - b : b - a; });
  for (i = 0; i < seq.length - 1; i++) {
    var a = m(mu + seq[i] * sd), b = m(mu + seq[i + 1] * sd);
    out.push(arrow(x0 + a, ty + 16, [[0, 0], [(b - a) / 2, 34], [b - a, 0]], { strokeColor: HOP, strokeWidth: 3, roundness: { type: 2 } }));
    out.push(ctext(x0 + (a + b) / 2, ty + 56, (b > a ? '+' : '−') + sd, 24, { strokeColor: HOP }));
  }
  ks.forEach(function (k) {
    var v = mu + k * sd, bx = x0 + m(v) - 40;
    out = out.concat(shown.indexOf(k) >= 0 ? given(bx, ty + 96, 80, 54, v, 28) : ans(bx, ty + 96, 80, 54, v, 28));
  });
  return out;
}

function build(convert) {
  var E = [], f, x0, y0 = 0, i;
  var F = function (k) { return k * (FW + GAP); };

  /* ---- 0 Warm-up and big question ---- */
  x0 = F(0);
  E = E.concat(title(x0, y0, 0, 'Warm-up (no talking)'));
  E.push(note(x0 + 40, 90, '1.  Stopwatch: stop it at 5.0 seconds. Put your dot on the line.', 30));
  E = E.concat(sh(graph({ w: 640, h: 40, lo: 4, hi: 6, ymax: 1, yaxis: false, tickSize: 22, xlabel: 'stopwatch time (seconds)',
    ticks: [[4, '4'], [4.5, '4.5'], [5, '5'], [5.5, '5.5'], [6, '6']] }), x0 + 80, 140));
  E.push(note(x0 + 40, 330, '2.  100 − 68 =', 30), note(x0 + 460, 330, 'Half of that =', 30));
  E = E.concat(ans(x0 + 270, 320, 100, 56, 32), ans(x0 + 710, 320, 100, 56, 16));
  E.push(note(x0 + 40, 410, '3.  Mean 30.  Hop up 4, hop up 4 again.  You land on', 30));
  E = E.concat(ans(x0 + 900, 400, 100, 56, 38));
  E.push(note(x0 + 40, 490, '4.  Undo it.  I picked a number, multiplied by 4, then added 30.  I got 42.', 30));
  var bx = x0 + 120, by = 560;
  E = E.concat(ans(bx, by, 130, 80, 3, 36), ans(bx + 330, by, 130, 80, 12, 36), given(bx + 660, by, 130, 80, 42, 36));
  E.push(arrow(bx + 130, by + 40, [[0, 0], [200, 0]], { strokeWidth: 3 }), note(bx + 200, by - 14, '× 4', 26, {}));
  E.push(arrow(bx + 460, by + 40, [[0, 0], [200, 0]], { strokeWidth: 3 }), note(bx + 530, by - 14, '+ 30', 26, {}));
  E.push(arrow(bx + 660, by + 100, [[0, 0], [-200, 0]], { strokeWidth: 3, strokeColor: RED, strokeStyle: 'dashed' }), note(bx + 540, by + 108, 'undo', 24, { strokeColor: RED }));
  E.push(arrow(bx + 330, by + 100, [[0, 0], [-200, 0]], { strokeWidth: 3, strokeColor: RED, strokeStyle: 'dashed' }), note(bx + 210, by + 108, 'undo', 24, { strokeColor: RED }));
  E.push(rect(x0 + 40, y0 + 770, FW - 80, 110, { strokeWidth: 3, backgroundColor: '#fff9db' }));
  E.push(note(x0 + 64, y0 + 782, 'BIG QUESTION   If I know only the mean and the SD of a bell-shaped set of data,\nwhat percent of the values can I say are in any chunk of it?', 30, { strokeWidth: 2 }));

  /* ---- 1 Part 1: percent is out of 100 ---- */
  x0 = F(1);
  E = E.concat(title(x0, y0, 1, 'Part 1   Percent is out of 100'));
  E.push(note(x0 + 40, 70, 'The whole curve is 100%.  100 bus rides.  Cut it anywhere and the pieces add to 100.', 30));
  var W = 360, panels = [
    { cx: 40, t: 'Cut at 34 minutes', sh: [{ d: BUS, from: -99, to: 34, color: CBLUE }, { d: BUS, from: 34, to: 99, color: CORG }], cuts: [34],
      segs: [[84, CBLUE, '84', null], [16, CORG, '16', null]] },
    { cx: 520, t: 'Cut at the mean, 30', sh: [{ d: BUS, from: -99, to: 30, color: CBLUE }, { d: BUS, from: 30, to: 99, color: CORG }], cuts: [30],
      segs: [[50, CBLUE, '50', null], [50, CORG, null, 50]] },
    { cx: 1000, t: 'Cut at 26 and 34', sh: [{ d: BUS, from: -99, to: 26, color: CBLUE }, { d: BUS, from: 26, to: 34, color: CYEL }, { d: BUS, from: 34, to: 99, color: CORG }], cuts: [26, 34],
      segs: [[16, CBLUE, '16', null], [68, CYEL, null, 68], [16, CORG, '16', null]] }
  ];
  panels.forEach(function (p) {
    E.push(note(x0 + p.cx + 60, 130, p.t, 28, { strokeWidth: 2 }));
    E = E.concat(sh(bus(W, 190, p.sh, p.cuts, false), x0 + p.cx, 175));
    p.cuts.forEach(function (c) { E.push(ctext(x0 + p.cx + sx(W, c), 175 + 34 + 190 + 10, String(c), 26)); });
    E = E.concat(bar(x0 + p.cx + 40, 520, W - 40, p.segs));
  });
  E.push(note(x0 + 40, 650, 'Example 1 (worked):  84 are shorter than 34.  The rest:  100 − 84 = 16.', 28));
  E.push(note(x0 + 40, 700, 'Example 2:  half on each side.  Right piece = 100 − 50 = 50.', 28));
  E.push(note(x0 + 40, 750, 'Example 3:  middle = 100 − 16 − 16 = 68.   (Remember the 68.)', 28));
  E.push(rect(x0 + 40, 810, 700, 56, { strokeWidth: 2, backgroundColor: '#fff9db' }), note(x0 + 56, 820, 'KEEP   The pieces of the curve always add to 100.', 26, { strokeWidth: 2 }));
  E.push(note(x0 + 800, 820, 'CHECK 1   Left piece 5, right piece 3.  Middle =', 26, { strokeWidth: 2 }));
  E = E.concat(ans(x0 + 1360, 808, 100, 56, 92));

  /* ---- 2 Part 2: hops ---- */
  x0 = F(2);
  E = E.concat(title(x0, y0, 2, 'Part 2   Hops from the mean'));
  E.push(note(x0 + 40, 70, 'SD (standard deviation) is the size of one HOP away from the mean.   Bus rides: mean 30, SD 4, one hop = 4.', 28));
  E.push(note(x0 + 40, 125, 'Example 1 (worked): up from 30, add 4.', 26, { strokeWidth: 2 }));
  E = E.concat(hops(x0 + 20, 160, 30, 4, 600, [0, 1, 2, 3], [0, 1, 2, 3], 1));
  E.push(note(x0 + 760, 125, 'Example 2: down from 30, subtract 4.', 26, { strokeWidth: 2 }));
  E = E.concat(hops(x0 + 740, 160, 30, 4, 600, [0, -1, -2, -3], [0, -1], -1));
  E.push(note(x0 + 40, 510, 'Example 3: test scores, mean 20, SD 3.  One hop = 3.', 26, { strokeWidth: 2 }));
  E = E.concat(hops(x0 + 200, 545, 20, 3, 1000, [-3, -2, -1, 0, 1, 2, 3], [0], 1));
  E.push(note(x0 + 40, 910, 'Between hops?  30 + 1.5 \u00d7 4 = 30 + 6 = 36', 26));
  E.push(rect(x0 + 780, 901, 460, 50, { strokeWidth: 2, backgroundColor: '#fff9db' }), note(x0 + 794, 909, 'KEEP  value = mean + (hops \u00d7 SD)', 24, { strokeWidth: 2 }));
  E.push(note(x0 + 40, 968, 'CHECK 2   mean 60, SD 10: write all seven marks', 26, { strokeWidth: 2 }));
  E = E.concat(ans(x0 + 780, 960, 460, 48, '30  40  50  60  70  80  90', 24));

  /* ---- 3 Part 3: predict ---- */
  x0 = F(3);
  E = E.concat(title(x0, y0, 3, 'Part 3   Predict first'));
  E.push(note(x0 + 40, 70, 'Both bells are normal with mean 50.  The middle (1 hop each way) is shaded.\nWhich has more of its values shaded?     A       B       same', 26));
  var A = normal(50, 5, 2, 98), B = normal(50, 15, 2, 98);
  var tk = [[5, '5'], [20, '20'], [35, '35'], [50, '50'], [65, '65'], [80, '80'], [95, '95']];
  E.push(note(x0 + 60, 150, 'Curve A:  mean 50, SD 5', 28, { strokeWidth: 2 }));
  E = E.concat(sh(graph({ w: 1200, h: 250, lo: 0, hi: 100, ymax: 0.085, yaxis: false, tickSize: 22, ticks: [], curves: [{ d: A }], shade: [{ d: A, from: 45, to: 55, color: CYEL }], vlines: [{ x: 45, dash: true }, { x: 55, dash: true }] }), x0 + 100, 175));
  E.push(note(x0 + 60, 470, 'Curve B:  mean 50, SD 15', 28, { strokeWidth: 2 }));
  E = E.concat(sh(graph({ w: 1200, h: 250, lo: 0, hi: 100, ymax: 0.085, yaxis: false, tickSize: 22, ticks: tk, curves: [{ d: B }], shade: [{ d: B, from: 35, to: 65, color: CYEL }], vlines: [{ x: 35, dash: true }, { x: 65, dash: true }] }), x0 + 100, 500));
  E.push(note(x0 + 1100, 130, 'Answer after the rule:', 24, { strokeColor: GRAY }));
  E = E.concat(ans(x0 + 1140, 170, 260, 56, 'same: 68%', 26));

  /* ---- 4 Part 3: the rule and tails ---- */
  x0 = F(4);
  E = E.concat(title(x0, y0, 4, 'Part 3   The Empirical Rule (68–95–99.7)'));
  var rw = 840, rs = [{ d: BUS, from: 18, to: 42, color: Z1 }, { d: BUS, from: 22, to: 38, color: Z2 }, { d: BUS, from: 26, to: 34, color: Z3 }];
  E = E.concat(sh(bus(rw, 270, rs, [30], true, 24), x0 + 60, 250));
  [[1, 'within 1 hop: about 68%', 230], [2, 'within 2 hops: about 95%', 180], [3, 'within 3 hops: about 99.7%', 130]].forEach(function (b) {
    var a = x0 + 60 + sx(rw, 30 - 4 * b[0]), c = x0 + 60 + sx(rw, 30 + 4 * b[0]);
    E.push(line(a, b[2] + 30, [[0, 0], [0, -14], [c - a, -14], [c - a, 0]], { strokeWidth: 3 }));
    E.push(ctext((a + c) / 2, b[2] - 18, b[1], 26, { strokeWidth: 2 }));
  });
  [18, 22, 26, 30, 34, 38, 42].forEach(function (v) {
    var k = Math.abs(v - 30) / 4;
    E.push(ctext(x0 + 60 + sx(rw, v), 250 + 34 + 270 + 44, v === 30 ? 'mean' : k + (k === 1 ? ' hop' : ' hops'), 20, { strokeColor: GRAY }));
  });
  E.push(note(x0 + 1000, 200, 'Tails', 34, { strokeWidth: 2 }));
  E.push(note(x0 + 1000, 250, 'The thin ends, past a mark.\nThe two tails are equal.\nTail = (100 − middle) ÷ 2', 26));
  E.push(rect(x0 + 1000, 400, 440, 190, { strokeWidth: 2, backgroundColor: '#f8f9fa' }));
  E.push(note(x0 + 1016, 410, 'hops   middle   each tail', 24, { strokeWidth: 2 }));
  E.push(note(x0 + 1016, 450, '  1        68%          16%\n  2        95%         2.5%\n  3       99.7%       0.15%', 26));
  /* tail card: two tails (green check) and the middle (red cross) */
  var tc = [[0, 'right tail', true, 1.5, 9], [1, 'left tail', true, -9, -1], [2, 'NOT a tail', false, -1, 1]];
  tc.forEach(function (t) {
    var cx = x0 + 60 + t[0] * 330, d = normal(0, 1, -3.6, 3.6);
    E.push(note(cx + 40, 640, (t[2] ? '✓ ' : '✗ ') + t[1], 26, { strokeWidth: 2, strokeColor: t[2] ? GREEN : RED }));
    E = E.concat(sh(graph({ w: 250, h: 110, lo: -3.6, hi: 3.6, ymax: 0.42, yaxis: false, ticks: [[-2, ''], [0, ''], [2, '']], curves: [{ d: d }], shade: [{ d: d, from: t[3], to: t[4], color: CORG }] }), cx, 680));
  });

  /* ---- 5 Part 3: examples ---- */
  x0 = F(5);
  E = E.concat(title(x0, y0, 5, 'Part 3   Examples: bus rides, mean 30, SD 4'));
  E.push(note(x0 + 40, 90, 'Example 1 (worked):  rides between 26 and 34 minutes', 30, { strokeWidth: 2 }));
  E = E.concat(sh(bus(560, 230, [{ d: BUS, from: 26, to: 34, color: CYEL }], [], true, 24), x0 + 40, 140));
  E.push(note(x0 + 700, 190, 'Both are 1 hop from 30.\nThe middle for 1 hop: about 68%.', 30));
  E = E.concat(ans(x0 + 1160, 190, 200, 70, '68%', 36));
  E.push(note(x0 + 40, 470, 'Example 2:  rides longer than 38 minutes', 30, { strokeWidth: 2 }));
  E = E.concat(sh(bus(560, 210, [{ d: BUS, from: 38, to: 99, color: CORG }], [], true, 24), x0 + 40, 515));
  E.push(note(x0 + 700, 540, '38 is', 28)); E = E.concat(ans(x0 + 790, 528, 70, 50, 2, 28)); E.push(note(x0 + 880, 540, 'hops above 30.', 28));
  E.push(note(x0 + 700, 600, 'Outside 2 hops:  100 − 95 =', 28)); E = E.concat(ans(x0 + 1080, 592, 70, 50, 5, 28));
  E.push(note(x0 + 700, 660, 'Two tails, so one tail:  5 ÷ 2 =', 28)); E = E.concat(ans(x0 + 1110, 652, 90, 50, 2.5, 28));
  E.push(note(x0 + 700, 720, 'About 2.5% of rides take more than 38 minutes.', 28, { strokeWidth: 2 }));
  E.push(rect(x0 + 40, 830, 760, 56, { strokeWidth: 2, backgroundColor: '#fff9db' }), note(x0 + 56, 840, 'KEEP  Middle: read it from the rule.   Tail: (100 − middle) ÷ 2', 24, { strokeWidth: 2 }));
  E.push(note(x0 + 840, 840, 'CHECK 3   Rides shorter than 22 minutes?', 26, { strokeWidth: 2 })); E = E.concat(ans(x0 + 1360, 828, 100, 56, '2.5%', 26));

  /* ---- 6 Exit and up next ---- */
  x0 = F(6);
  E = E.concat(title(x0, y0, 6, 'Exit ticket (E8) and Up next'));
  E.push(note(x0 + 40, 90, 'Hot-dog weights are normal: mean 50 g, SD 2 g.  Draw the curve.\nLabel the center and the marks 1, 2 and 3 hops on each side.', 30));
  E.push(line(x0 + 120, 420, [[0, 0], [1100, 0]], { strokeWidth: 3 }));
  E.push(note(x0 + 40, 470, 'Feedback key (reveal after they draw):', 24, { strokeColor: GRAY }));
  E = E.concat(ans(x0 + 40, 510, 1000, 56, '44    46    48    50    52    54    56', 30));
  E.push(note(x0 + 40, 620, 'Transfer:   46 to 54 grams?', 30)); E = E.concat(ans(x0 + 460, 610, 120, 56, '95%'));
  E.push(note(x0 + 640, 620, 'Under 48 grams?', 30)); E = E.concat(ans(x0 + 940, 610, 120, 56, '16%'));
  E.push(rect(x0 + 40, 740, FW - 80, 130, { strokeWidth: 3, backgroundColor: '#e7f5ff' }));
  E.push(note(x0 + 64, 756, 'UP NEXT   The rule only works at whole hops.\nWhat about 36 minutes, which is 1.5 hops out?  We will need a tool for that.', 30, { strokeWidth: 2 }));

  /* Text is measured before the Nunito font has loaded, with a narrower fallback, so the last letters were clipped.
     Give every text box 30% more room (same fix as the library stencils). */
  var els = convert(E, { regenerateIds: false });
  els.forEach(function (e) { if (e.type === 'text') e.width = Math.ceil(e.width * 1.3); });
  return els;
}

var SHELVES = ['Normal curve', 'Routines', 'Graph tools'];
export { build, FRAMES, SHELVES };
export var ID = '3.4';
export var TITLE = 'Stats 3.4 · Using the Empirical Rule';
