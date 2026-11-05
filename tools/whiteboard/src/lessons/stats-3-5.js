/* Lesson board for Stats 3.5 (Percent under a normal curve): the day's pictures already drawn, in teaching order.
   Mr. D writes, scrolls and explains; he does not draw. Answers sit under an orange cover: select the cover and press Delete.
   Numbers match the 3.5 thinking notes and board script (pizza delivery N(30, 6)). */

import { INK, BLUE, RED, GREEN, GRAY, CBLUE, CYEL, CORG, FW, FH, F, sh, ans, given, title, note, keep, rect, line, arrow, ctext, graph, normal,
  PIZZA, pizza, px, bar, finish } from './stats-kit.js';

var FRAMES = ['Launcher and story', 'Part 1: below', 'Part 2: above, between', 'Part 3: hops', 'Practice, exit, transfer'];
var W = 360;

/* one example panel: title, curve with shading and cut labels, 100-bar */
function panel(x0, cx, y, t, shade, cuts, segs, ticks) {
  var E = [];
  E.push(note(x0 + cx + 20, y, t, 28, { strokeWidth: 2 }));
  E = E.concat(sh(pizza(W, 190, shade, cuts, false), x0 + cx, y + 45));
  cuts.forEach(function (c) { E.push(ctext(x0 + cx + px(W, c), y + 45 + 34 + 190 + 10, String(c), 26)); });
  return E.concat(bar(x0 + cx + 40, y + 340, W - 40, segs));
}
var BELOW = function (v) { return [{ d: PIZZA, from: -99, to: v, color: CBLUE }]; };
var ABOVE = function (v) { return [{ d: PIZZA, from: v, to: 99, color: CORG }]; };

function build(convert) {
  var E = [], x0, y0 = 0;

  /* 0 Launcher and story */
  x0 = F(0);
  E = E.concat(title(x0, y0, 0, 'Launcher (boards, flip on 3) and story'));
  E.push(note(x0 + 40, 90, 'Hot-dog weights are normal: mean 50 g, SD 2 g.', 30));
  E.push(note(x0 + 40, 160, '1.  The weight 1 hop above the mean:', 30)); E = E.concat(ans(x0 + 760, 150, 100, 56, 52));
  E.push(note(x0 + 40, 240, '2.  Percent between 48 and 52:', 30)); E = E.concat(ans(x0 + 760, 230, 100, 56, '68%'));
  E.push(note(x0 + 40, 320, '3.  Percent above 54:', 30)); E = E.concat(ans(x0 + 760, 310, 100, 56, '2.5%'));
  E.push(note(x0 + 40, 400, '4.  Undo it.   (x − 40) ÷ 5 = 2.   Undo the ÷ 5 first, then the − 40.', 30));
  var bx = x0 + 120, by = 470;
  E = E.concat(ans(bx, by, 130, 80, 50, 36), ans(bx + 330, by, 130, 80, 10, 36), given(bx + 660, by, 130, 80, 2, 36));
  E.push(arrow(bx + 130, by + 100, [[0, 0], [200, 0]], { strokeWidth: 3, strokeColor: RED, strokeStyle: 'dashed' }));
  E.push(note(bx + 175, by + 108, '+ 40', 24, { strokeColor: RED }));
  E.push(arrow(bx + 460, by + 100, [[0, 0], [200, 0]], { strokeWidth: 3, strokeColor: RED, strokeStyle: 'dashed' }));
  E.push(note(bx + 515, by + 108, '× 5', 24, { strokeColor: RED }));
  E.push(rect(x0 + 40, 700, FW - 80, 200, { strokeWidth: 3, backgroundColor: '#fff9db' }));
  E.push(note(x0 + 64, 716, 'STORY   A pizza place gives a free pizza if delivery takes more than 40 minutes.\nTimes are normal: mean 30, SD 6.\nGuess on boards: out of 100 deliveries, how many are free?   (Do not reveal. Answer in Part 2.)', 30, { strokeWidth: 2 }));

  /* 1 Part 1: percent below */
  x0 = F(1);
  E = E.concat(title(x0, y0, 1, 'Part 1   Percent below a value'));
  E.push(note(x0 + 40, 70, 'Pizza delivery: mean 30, SD 6.  The whole curve is 100 boxes.  Shaded boxes = the percent.', 28));
  E = E.concat(panel(x0, 40, 130, 'Ex 1: below 24 (worked)', BELOW(24), [24], [[15.9, CBLUE, '15.9', null], [84.1, '#ffffff', '84.1', null]]));
  E = E.concat(panel(x0, 520, 130, 'Ex 2: below 33', BELOW(33), [33], [[69.1, CBLUE, null, '69.1'], [30.9, '#ffffff', '30.9', null]]));
  E = E.concat(panel(x0, 1000, 130, 'Ex 3: below 27', BELOW(27), [27], [[30.9, CBLUE, null, '30.9'], [69.1, '#ffffff', '69.1', null]]));
  E.push(note(x0 + 40, 600, 'Sketch · Mark · Compute · Say', 28, { strokeWidth: 2 }));
  E.push(note(x0 + 40, 650, 'normalcdf(−1E99, 24, 30, 6) = 15.9    (the rule said about 16)', 28));
  E.push(note(x0 + 40, 700, 'Out of 100 deliveries, about 15.9 take less than 24 minutes.', 28));
  E = E.concat(keep(x0 + 40, 790, 900, 'KEEP   normalcdf(−1E99, value, mean, SD)  =  percent below'));
  E.push(note(x0 + 40, 880, 'CHECK 1   Below 21 minutes?', 26, { strokeWidth: 2 })); E = E.concat(ans(x0 + 460, 870, 110, 56, '6.7%'));

  /* 2 Part 2: above and between */
  x0 = F(2);
  E = E.concat(title(x0, y0, 2, 'Part 2   Percent above and between'));
  E.push(note(x0 + 40, 70, 'Below + above = 100.   Guess first: the mean (30) splits the curve 50 and 50.', 28));
  E = E.concat(panel(x0, 40, 130, 'Ex 1: above 33 (worked)', ABOVE(33), [33], [[69.1, '#ffffff', '69.1', null], [30.9, CORG, '30.9', null]]));
  E = E.concat(panel(x0, 520, 130, 'Ex 2: above 40', ABOVE(40), [40], [[95.2, '#ffffff', '95.2', null], [4.8, CORG, null, '4.8']]));
  E = E.concat(panel(x0, 1000, 130, 'Ex 3: between 25 and 35', [{ d: PIZZA, from: 25, to: 35, color: CYEL }], [25, 35], [[20.2, '#ffffff', '20.2', null], [59.5, CYEL, null, '59.5'], [20.3, '#ffffff', '20.3', null]]));
  E.push(note(x0 + 40, 600, 'Ex 2:  normalcdf(40, 1E99, 30, 6).   About 5 of 100 deliveries are free.', 28));
  E.push(note(x0 + 40, 650, 'Ex 3 guess: 24 and 36 are the 68 marks, 25 and 35 sit inside, so more or less than 68?', 28));
  E = E.concat(ans(x0 + 1200, 640, 120, 50, 'less', 28));
  E.push(note(x0 + 40, 700, 'Ex 3:  normalcdf(25, 35, 30, 6)   (lower value first)', 28));
  E = E.concat(keep(x0 + 40, 790, 900, 'KEEP   above = 100 − below.   Between: lower value first.'));
  E.push(note(x0 + 40, 880, 'CHECK 2   More than 27 minutes?  Guess first.', 26, { strokeWidth: 2 })); E = E.concat(ans(x0 + 700, 870, 130, 56, '69.1%'));

  /* 3 Part 3: hops */
  x0 = F(3);
  E = E.concat(title(x0, y0, 3, 'Part 3   Every normal curve is the same in hops'));
  var sn = normal(0, 1, -3.6, 3.6), sc = { d: sn, from: 1.5, to: 99, color: CORG }, pc = { d: PIZZA, from: 39, to: 99, color: CORG };
  E.push(note(x0 + 60, 80, 'Pizza minutes: mean 30, SD 6', 28, { strokeWidth: 2 }));
  E = E.concat(sh(pizza(560, 230, [pc], [39], true, 22), x0 + 40, 130));
  E.push(note(x0 + 760, 80, 'Standard normal: mean 0, SD 1 (hops)', 28, { strokeWidth: 2 }));
  E = E.concat(sh(graph({ w: 560, h: 230, lo: -3.6, hi: 3.6, ymax: 0.42, yaxis: false, tickSize: 22, ticks: [[-3, '-3'], [-2, '-2'], [-1, '-1'], [0, '0'], [1, '1'], [2, '2'], [3, '3']], curves: [{ d: sn }], shade: [sc], vlines: [{ x: 1.5, dash: true }] }), x0 + 760, 130));
  E.push(note(x0 + 40, 440, 'Hops z = (value − mean) ÷ SD.   (39 − 30) ÷ 6 = 1.5', 30, { strokeWidth: 2 }));
  E.push(note(x0 + 40, 500, 'Minutes:  normalcdf(39, 1E99, 30, 6) =', 28)); E = E.concat(ans(x0 + 700, 490, 110, 50, 6.7, 28));
  E.push(note(x0 + 40, 560, 'Hops:       normalcdf(1.5, 1E99, 0, 1) =', 28)); E = E.concat(ans(x0 + 700, 550, 110, 50, 6.7, 28));
  E.push(note(x0 + 880, 520, 'Same shape, same percent.', 28, { strokeWidth: 2 }));
  E.push(note(x0 + 40, 650, 'Ex 2: below 36 → 1 hop → both lines give', 28)); E = E.concat(ans(x0 + 700, 640, 110, 50, 84.1, 28));
  E.push(note(x0 + 40, 710, 'Ex 3: above 45 → 2.5 hops → both lines give', 28)); E = E.concat(ans(x0 + 700, 700, 110, 50, 0.6, 28));
  E = E.concat(keep(x0 + 40, 800, 900, 'KEEP   hops = (value − mean) ÷ SD.   Same hops, same percent.'));
  E.push(note(x0 + 40, 890, 'CHECK 3   18 minutes: hops?  percent below?', 26, { strokeWidth: 2 })); E = E.concat(ans(x0 + 620, 880, 100, 56, -2), ans(x0 + 760, 880, 110, 56, '2.3%'));

  /* 4 Practice, exit, transfer */
  x0 = F(4);
  E = E.concat(title(x0, y0, 4, 'Feedback key, exit slip (E11), transfer'));
  E.push(note(x0 + 40, 90, 'Practice answers (P1–P3):', 30, { strokeWidth: 2 }));
  E = E.concat(ans(x0 + 460, 80, 120, 56, 25.2), ans(x0 + 620, 80, 120, 56, 93.3), ans(x0 + 780, 80, 120, 56, 86.1));
  E.push(note(x0 + 40, 190, 'Exit E11: coffee shop customers N(60, 10).   (a) below 75   (b) between 50 and 75', 30));
  E = E.concat(ans(x0 + 100, 250, 120, 56, '93.3%'), ans(x0 + 300, 250, 120, 56, '77.5%'));
  E.push(note(x0 + 460, 260, '"Out of 100 days, about 77.5 have between 50 and 75 customers."', 26));
  E.push(note(x0 + 40, 380, 'Transfer: ride-share waits N(8, 2).  More than 11 minutes?   (11 − 8) ÷ 2 =', 30));
  E = E.concat(ans(x0 + 1000, 450, 100, 56, 1.5), ans(x0 + 1140, 450, 110, 56, '6.7%'));
  E.push(note(x0 + 40, 530, 'What do you notice about the 39-minute delivery?  Both are 1.5 hops above the mean, so the percent is the same.', 26, { strokeColor: GRAY }));
  E.push(rect(x0 + 40, 700, FW - 80, 130, { strokeWidth: 3, backgroundColor: '#e7f5ff' }));
  E.push(note(x0 + 64, 716, 'UP NEXT   We know the value and want the percent.\nWhat if we know the percent (top 10%) and want the value?', 30, { strokeWidth: 2 }));

  return finish(convert, E);
}

var SHELVES = ['Normal curve', 'Routines', 'Graph tools'];
export { build, FRAMES, SHELVES };
export var ID = '3.5';
export var TITLE = 'Stats 3.5 · Percent under a normal curve';
