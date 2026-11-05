/* Lesson board for Stats 3.6 (Finding boundary values): the day's pictures already drawn, in teaching order.
   Mr. D writes, scrolls and explains; he does not draw. Answers sit under an orange cover: select the cover and press Delete.
   Numbers match the 3.6 thinking notes and board script (pizza delivery N(30, 6)). Part 3 is the Could-tier segment (T14). */

import { INK, BLUE, RED, GREEN, GRAY, CBLUE, CYEL, CORG, FW, FH, F, sh, ans, given, title, note, keep, rect, line, arrow, ctext, graph, normal,
  PIZZA, pizza, px, bar, finish } from './stats-kit.js';

var FRAMES = ['Launcher and story', 'Part 1: area or boundary', 'Part 2: invNorm', 'Part 3: hops, lost number', 'Practice, exit, transfer'];
var W = 360;

/* shade between a and b on the pizza curve; the cut line sits at each cut, labelled only when the value is known */
function sd(a, b, c) { return [{ d: PIZZA, from: a, to: b, color: c }]; }
function panel(x0, cx, y, t, shade, cuts, labels, segs) {
  var E = [];
  E.push(note(x0 + cx + 20, y, t, 28, { strokeWidth: 2 }));
  E = E.concat(sh(pizza(W, 190, shade, cuts, false), x0 + cx, y + 45));
  cuts.forEach(function (c, i) { if (labels[i]) E.push(ctext(x0 + cx + px(W, c), y + 45 + 34 + 190 + 10, labels[i], 26)); });
  return E.concat(bar(x0 + cx + 40, y + 340, W - 40, segs));
}

function build(convert) {
  var E = [], x0, y0 = 0;

  /* 0 Launcher and story */
  x0 = F(0);
  E = E.concat(title(x0, y0, 0, 'Launcher (boards, flip on 3) and story'));
  E.push(note(x0 + 40, 90, 'Pizza delivery times are normal: mean 30, SD 6.  Use the calculator.', 30));
  E.push(note(x0 + 40, 160, '1.  Percent that take less than 30 minutes:', 30)); E = E.concat(ans(x0 + 860, 150, 110, 56, '50%'));
  E.push(note(x0 + 40, 240, '2.  Percent that take less than 24 minutes:', 30)); E = E.concat(ans(x0 + 860, 230, 110, 56, '15.9%'));
  E.push(note(x0 + 40, 320, '3.  Percent that take more than 33 minutes:', 30)); E = E.concat(ans(x0 + 860, 310, 110, 56, '30.9%'));
  E.push(note(x0 + 40, 400, '4.  Undo it.   1.5 = (x − 30) ÷ 6.   Undo the ÷ 6 first, then the − 30.', 30));
  var bx = x0 + 120, by = 470;
  E = E.concat(ans(bx, by, 130, 80, 39, 36), ans(bx + 330, by, 130, 80, 9, 36), given(bx + 660, by, 130, 80, 1.5, 36));
  E.push(arrow(bx + 130, by + 100, [[0, 0], [200, 0]], { strokeWidth: 3, strokeColor: RED, strokeStyle: 'dashed' }));
  E.push(note(bx + 175, by + 108, '+ 30', 24, { strokeColor: RED }));
  E.push(arrow(bx + 460, by + 100, [[0, 0], [200, 0]], { strokeWidth: 3, strokeColor: RED, strokeStyle: 'dashed' }));
  E.push(note(bx + 515, by + 108, '× 6', 24, { strokeColor: RED }));
  E.push(note(x0 + 40, 640, 'Percent to the left of 39:', 28)); E = E.concat(ans(x0 + 460, 630, 110, 50, '93.3%'));
  E.push(rect(x0 + 40, 740, FW - 80, 150, { strokeWidth: 3, backgroundColor: '#fff9db' }));
  E.push(note(x0 + 64, 756, 'STORY   Name something you would like to be in the top 10% at.\nIf delivery takes a long time, how long is a delivery in the slowest 10%?   We find out today.', 30, { strokeWidth: 2 }));

  /* 1 Part 1: area or boundary */
  x0 = F(1);
  E = E.concat(title(x0, y0, 1, 'Part 1   Area or boundary?'));
  E.push(note(x0 + 40, 70, 'Area: value known, percent unknown.   Boundary: percent known, value (the line) unknown.   Percentile = percent below.', 26));
  E = E.concat(panel(x0, 40, 130, 'Ex 1: top 10% (worked)', sd(37.7, 99, CORG), [37.7], [null],
    [[90, '#ffffff', '90 below', null], [10, CORG, '10', null]]));
  E = E.concat(panel(x0, 520, 130, 'Ex 2: fastest 20%', sd(-99, 25, CBLUE), [25], [null],
    [[20, CBLUE, null, '20'], [80, '#ffffff', '80', null]]));
  E = E.concat(panel(x0, 1000, 130, 'Ex 3: slowest 5%', sd(39.9, 99, CORG), [39.9], [null],
    [[95, '#ffffff', null, '95'], [5, CORG, '5', null]]));
  E.push(note(x0 + 40, 600, 'Sort A (area) or B (boundary):   1. below 33?   2. slowest 10% take more than how long?   3. 90th percentile?', 26));
  E.push(note(x0 + 40, 645, '                                                4. between 25 and 35?   5. fastest 20% take less than how long?   6. free pizza after 40?', 26));
  E = E.concat(ans(x0 + 40, 690, 480, 50, 'A   B   B   A   B   A', 28));
  E.push(note(x0 + 600, 700, 'The calculator wants the percent BELOW the line.', 28, { strokeWidth: 2 }));
  E = E.concat(keep(x0 + 40, 790, 900, 'KEEP   Turn the question into "percent below".   Top 10% = 90 below.'));
  E.push(note(x0 + 40, 880, 'CHECK 1   Middle 90%: each tail =', 26, { strokeWidth: 2 })); E = E.concat(ans(x0 + 520, 870, 100, 56, 5));
  E.push(note(x0 + 660, 880, 'Percent below at the lines:', 26, { strokeWidth: 2 })); E = E.concat(ans(x0 + 1080, 870, 100, 56, 5), ans(x0 + 1210, 870, 100, 56, 95));

  /* 2 Part 2: invNorm */
  x0 = F(2);
  E = E.concat(title(x0, y0, 2, 'Part 2   Find the boundary with invNorm'));
  E.push(note(x0 + 40, 70, 'invNorm(percent below as a decimal, mean, SD).   Guess first: above the mean is more than 30.', 28));
  E = E.concat(panel(x0, 40, 130, 'Ex 1: 90th percentile (worked)', sd(-99, 37.7, CBLUE), [37.7], ['37.7'],
    [[90, CBLUE, '90', null], [10, '#ffffff', '10', null]]));
  E = E.concat(panel(x0, 520, 130, 'Ex 2: fastest 20%', sd(-99, 25, CBLUE), [25], [null],
    [[20, CBLUE, '20', null], [80, '#ffffff', '80', null]]));
  E = E.concat(panel(x0, 1000, 130, 'Ex 3: slowest 5%', sd(-99, 39.9, CBLUE), [39.9], [null],
    [[95, CBLUE, '95', null], [5, CORG, '5', null]]));
  E.push(note(x0 + 40, 600, 'Ex 1:  invNorm(0.90, 30, 6) = 37.7.   The 90th percentile is 37.7 minutes.', 28));
  E.push(note(x0 + 40, 650, 'Ex 2:  guess below 30.   invNorm(0.20, 30, 6) =', 28)); E = E.concat(ans(x0 + 760, 640, 110, 50, 25.0, 28));
  E.push(note(x0 + 40, 700, 'Ex 3:  guess above 30.   invNorm(0.95, 30, 6) =', 28)); E = E.concat(ans(x0 + 760, 690, 110, 50, 39.9, 28));
  E = E.concat(keep(x0 + 40, 790, 900, 'KEEP   0.90, not 90.   Percent below, then invNorm.'));
  E.push(note(x0 + 40, 880, 'CHECK 2   Fastest 10%: guess above or below 30, then compute.', 26, { strokeWidth: 2 })); E = E.concat(ans(x0 + 880, 870, 110, 56, 22.3));

  /* 3 Part 3: hops and lost number (Could tier) */
  x0 = F(3);
  E = E.concat(title(x0, y0, 3, 'Part 3   Hops: check a boundary, find a lost number  (drop if Part 2 boards are not secure)'));
  E.push(note(x0 + 40, 80, 'value = mean + hops × SD.   Below the mean, subtract.   To find a lost number, undo backward.', 28));
  E.push(note(x0 + 40, 150, 'Ex 1 (worked)  invNorm(0.90, 0, 1) = 1.28 hops.   30 + 1.28 × 6 = 37.7.   Same as invNorm(0.90, 30, 6).', 28, { strokeWidth: 2 }));
  var sn = normal(0, 1, -3.6, 3.6);
  E.push(note(x0 + 40, 220, 'Ex 2  Palace C lost its mean.  SD 4.  Slowest 10% take more than 38.', 28, { strokeWidth: 2 }));
  E.push(note(x0 + 40, 270, '38 is 1.28 hops above the mean.   1.28 × 4 = 5.12.   mean = 38 − 5.12 =', 28)); E = E.concat(ans(x0 + 1060, 260, 110, 50, 32.9, 28));
  E.push(note(x0 + 40, 350, 'Ex 3  Palace D lost its SD.  Mean 30.  80 of 100 take less than 36.', 28, { strokeWidth: 2 }));
  E.push(note(x0 + 40, 400, 'invNorm(0.80, 0, 1) = 0.84 hops.   36 is above 30 by', 28)); E = E.concat(ans(x0 + 800, 390, 90, 50, 6, 28));
  E.push(note(x0 + 40, 450, '0.84 × SD = 6, so SD = 6 ÷ 0.84 =', 28)); E = E.concat(ans(x0 + 620, 440, 110, 50, 7.1, 28));
  E = E.concat(sh(graph({ w: 560, h: 230, lo: -3.6, hi: 3.6, ymax: 0.42, yaxis: false, tickSize: 22, ticks: [[-2, '-2'], [-1, '-1'], [0, '0'], [1, '1'], [2, '2']], curves: [{ d: sn }],
    shade: [{ d: sn, from: -99, to: 1.28, color: CBLUE }], vlines: [{ x: 1.28, dash: true }] }), x0 + 800, 500));
  E = E.concat(keep(x0 + 40, 800, 900, 'KEEP   Lost mean: line − hops × SD (above).   Lost SD: distance ÷ hops.'));
  E.push(note(x0 + 40, 890, 'CHECK 3   Palace E: fastest 20% under 24, SD 5.  Hops −0.84.  Mean =', 26, { strokeWidth: 2 })); E = E.concat(ans(x0 + 940, 880, 110, 56, 28.2));

  /* 4 Practice, exit, transfer */
  x0 = F(4);
  E = E.concat(title(x0, y0, 4, 'Feedback key, exit slip (E13), transfer'));
  E.push(note(x0 + 40, 90, 'Practice answers (P1–P3):', 30, { strokeWidth: 2 }));
  E = E.concat(ans(x0 + 460, 80, 120, 56, 34.0), ans(x0 + 620, 80, 120, 56, 22.3), ans(x0 + 780, 80, 280, 56, '20.1 and 39.9'));
  E.push(note(x0 + 40, 190, 'Exit E13: (a) Sort  "percent below 450" and "90th percentile".', 30));
  E = E.concat(ans(x0 + 940, 180, 80, 56, 'A'), ans(x0 + 1040, 180, 80, 56, 'B'));
  E.push(note(x0 + 40, 270, '(b) Scores are N(500, 100).  The top 15% start at:   invNorm(0.85, 500, 100) =', 30)); E = E.concat(ans(x0 + 1100, 260, 120, 56, 604));
  E.push(note(x0 + 40, 340, '"Students who score above 604 are in the top 15%."', 26, { strokeColor: GRAY }));
  E.push(note(x0 + 40, 420, 'Transfer: phone charging N(90, 15).  Fastest 10% charge in less than how many minutes?', 30));
  E.push(note(x0 + 40, 480, 'invNorm(0.10, 90, 15) =', 30)); E = E.concat(ans(x0 + 480, 470, 120, 56, 70.8));
  E.push(rect(x0 + 40, 700, FW - 80, 130, { strokeWidth: 3, backgroundColor: '#e7f5ff' }));
  E.push(note(x0 + 64, 716, 'UP NEXT   We can now find the percent from a value, and the value from a percent.', 30, { strokeWidth: 2 }));

  return finish(convert, E);
}

var SHELVES = ['Normal curve', 'Routines', 'Graph tools'];
export { build, FRAMES, SHELVES };
export var ID = '3.6';
export var TITLE = 'Stats 3.6 · Finding boundary values';
