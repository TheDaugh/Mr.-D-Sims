/* DAY CARD CONTENT: Stats Unit 3, Slot 11. 3.6 Finding boundary values (T13 Core, T14 Rigor).
   Plain data plus pure generators, no DOM. The coder wires this into the stats spec (tools/new-lesson.mjs stats);
   the coder does not rewrite, shorten or re-derive anything here. Verified by stats-11-content.test.js against scipy.
   Technology for every boundary: invNorm(area to the left, mean, SD). No z-table anywhere (Stage 1 course note).
   Every number is invented, so every prompt says "pretend". Answers carry a tolerance `tol` so a student who rounds z to 2 decimals is still right. */
(function (root) {
  'use strict';
  /* ---------- the math (own implementation; the test checks it against scipy) ---------- */
  function erf(x) { var s = x < 0 ? -1 : 1, a = Math.abs(x), t = a, sum = a, n = 0; while (Math.abs(t) > 1e-17 * Math.abs(sum) && n < 400) { n++; t *= -a * a / n; sum += t / (2 * n + 1); } return s * 2 / Math.sqrt(Math.PI) * sum; }
  function cdf(z) { return 0.5 * (1 + erf(z / Math.SQRT2)); }   /* all-term series: fine for |z| < 6 */
  function ppf(p) { var lo = -8, hi = 8; for (var i = 0; i < 100; i++) { var m = (lo + hi) / 2; if (cdf(m) < p) lo = m; else hi = m; } return (lo + hi) / 2; }
  var r1 = function (x) { return Math.round(x * 10 + 1e-9) / 10; };
  var r2 = function (x) { return Math.round(x * 100 + 1e-9) / 100; };
  var INT = function (r, a, b) { return a + Math.floor(r() * (b - a + 1)); };
  var pick = function (r, arr) { return arr[Math.floor(r() * arr.length)]; };
  function shuffle(r, arr) { var a = arr.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(r() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function choice(r, correct, wrongs) { var o = shuffle(r, [correct].concat(wrongs)); return { options: o, answer: o.indexOf(correct) }; }
  var cl = function (b) { return Math.max(1, Math.min(4, b || 1)); };
  var tolFor = function (ans) { return Math.max(0.1, r2(0.012 * Math.abs(ans))); };
  var f2 = function (x) { return x.toFixed(2); };
  var NAN = '−';
  var th = function (p) { return p + 'th'; };

  var CTX = [
    { id: 'delivery', thing: 'pizza deliveries', noun: 'delivery time', unit: 'minutes', lo: 'fastest', hi: 'slowest', ms: [[30, 6], [28, 4], [35, 5]] },
    { id: 'quiz', thing: 'quiz scores', noun: 'score', unit: 'points', lo: 'lowest', hi: 'highest', ms: [[70, 8], [75, 10], [80, 6]] },
    { id: 'bike', thing: 'bike trips', noun: 'trip time', unit: 'minutes', lo: 'fastest', hi: 'slowest', ms: [[20, 3], [25, 5]] },
    { id: 'seed', thing: 'seedlings', noun: 'height', unit: 'cm', lo: 'shortest', hi: 'tallest', ms: [[40, 5], [32, 4]] }
  ];
  function ctx(r) { var c = pick(r, CTX), m = pick(r, c.ms); return { c: c, mean: m[0], sd: m[1] }; }
  function setup(x) { return 'Pretend ' + x.c.thing + ' follow a normal curve with mean ' + x.mean + ' and SD ' + x.sd + ' (' + x.c.unit + ').'; }
  function bnd(x, area) { var z = ppf(area); return { z: z, value: x.mean + z * x.sd }; }
  function fig(x, shade, area, boundary) { return { kind: 'normal', mean: x.mean, sd: x.sd, units: x.c.unit, shade: shade, area: area, boundary: boundary }; }

  /* ---------- skill 1: Area or boundary?  (the sort that decides the tool) ---------- */
  function stemArea(x, r, form) {
    var k = pick(r, [-1, -0.5, 0.5, 1, 1.5]), v = x.mean + k * x.sd, v2 = x.mean + pick(r, [1, 1.5, 2]) * x.sd;
    if (form === 0) return 'What percent of ' + x.c.thing + ' have a ' + x.c.noun + ' below ' + v + ' ' + x.c.unit + '?';
    if (form === 1) return 'What fraction of ' + x.c.thing + ' have a ' + x.c.noun + ' above ' + v + ' ' + x.c.unit + '?';
    return 'What percent of ' + x.c.thing + ' fall between ' + v + ' and ' + v2 + ' ' + x.c.unit + '?';
  }
  function stemBound(x, r, form) {
    var p = pick(r, [80, 90, 95]), q = pick(r, [5, 10, 20]);
    if (form === 0) return 'Find the ' + x.c.noun + ' that ' + p + '% of ' + x.c.thing + ' fall below.';
    if (form === 1) return 'What ' + x.c.noun + ' marks the ' + x.c.hi + ' ' + q + '% of ' + x.c.thing + '?';
    if (form === 2) return 'What is the ' + th(p) + ' percentile of the ' + x.c.noun + '?';
    return 'Find the cutoff for the ' + x.c.lo + ' ' + q + '% of ' + x.c.thing + '.';
  }
  var DIR = { area: 'Area: the answer is a percent', boundary: 'Boundary: the answer is a value' };
  var directionSkill = { id: 'direction', title: 'Area or boundary?', gen: function (b, r) {
    b = cl(b); var x = ctx(r), kind = r() < 0.5 ? 'area' : 'boundary', stem, p, c;
    if (b === 1) stem = kind === 'area' ? stemArea(x, r, 0) : stemBound(x, r, 0);
    else if (b === 2) stem = kind === 'area' ? stemArea(x, r, INT(r, 0, 2)) : stemBound(x, r, INT(r, 0, 3));
    else if (b === 3) {
      if (kind === 'area') { var v = x.mean + pick(r, [1, 1.5]) * x.sd; stem = 'A coach calls any ' + x.c.noun + ' over ' + v + ' ' + x.c.unit + ' "late." The coach wants to know how many ' + x.c.thing + ' are late.'; }
      else { p = pick(r, [5, 10]); stem = 'A shop refunds the ' + x.c.hi + ' ' + p + '% of ' + x.c.thing + '. The owner wants to know where the refund starts.'; }
    } else {
      stem = kind === 'area' ? stemArea(x, r, INT(r, 0, 2)) : stemBound(x, r, INT(r, 0, 3));
      c = choice(r, kind === 'area' ? 'normalcdf: a value goes in, an area comes out' : 'invNorm: an area goes in, a value comes out',
        [kind === 'area' ? 'invNorm: an area goes in, a value comes out' : 'normalcdf: a value goes in, an area comes out', 'Neither: just use the mean']);
      return { tag: 'T13', type: 'choice', itemType: 'tool-choice', kind: kind, prompt: setup(x) + ' ' + stem + ' Which calculator command do you use?', options: c.options, answer: c.answer,
        hint: 'Is the answer a percent, or a value like minutes? A value from a percent is invNorm.', nudge: 'Ask what you are given and what you want.',
        worked: kind === 'area' ? 'You are given a value and want a percent, so use normalcdf.' : 'You are given a percent and want a value, so use invNorm.' };
    }
    c = choice(r, DIR[kind], [DIR[kind === 'area' ? 'boundary' : 'area']]);
    return { tag: 'T13', type: 'choice', itemType: 'sort', kind: kind, prompt: setup(x) + ' ' + stem + ' Is this an area question or a boundary question?', options: c.options, answer: c.answer,
      hint: 'Area: you know a value and want a percent. Boundary: you know a percent and want a value.', nudge: 'What is given, and what is asked?',
      worked: kind === 'area' ? 'A value is given and a percent is asked: an area question.' : 'A percent is given and a value is asked: a boundary question.' };
  } };

  /* ---------- skill 2: T13, find the boundary ---------- */
  function boundaryItem(x, areas, shade, prompt, hint, extra) {
    var vals = areas.map(function (a) { return r1(bnd(x, a).value); });
    var worked = areas.map(function (a, i) { return 'Area to the left ' + a + '. invNorm(' + a + ', ' + x.mean + ', ' + x.sd + ') = ' + f2(bnd(x, a).value) + '.'; }).join(' ') + ' About ' + vals.join(' and ') + ' ' + x.c.unit + '.';
    var it = { tag: 'T13', type: 'num', itemType: extra.itemType, meta: { mean: x.mean, sd: x.sd, leftAreas: areas }, prompt: prompt, answer: vals[0], answer2: vals.length > 1 ? vals[1] : null, unit: x.c.unit,
      tol: tolFor(vals[0]), hint: hint, nudge: extra.nudge, worked: worked, figure: extra.figure };
    return it;
  }
  var boundarySkill = { id: 'boundary', title: 'Find the boundary value', gen: function (b, r) {
    b = cl(b); var x = ctx(r), p, q, a, side, c, ans;
    if (b === 1) { p = pick(r, [10, 20, 25, 75, 80, 90]); a = p / 100;
      return boundaryItem(x, [a], 'left', setup(x) + ' Find the ' + th(p) + ' percentile of the ' + x.c.noun + '.', 'A percentile has that percent to its left. Use invNorm(' + a + ', ' + x.mean + ', ' + x.sd + ').',
        { itemType: 'picture', nudge: 'Area to the left is the percentile as a decimal.', figure: fig(x, 'left', a, '?') }); }
    if (b === 2) { q = pick(r, [5, 10, 15, 20, 25]); side = r() < 0.5 ? 'hi' : 'lo'; a = side === 'hi' ? 1 - q / 100 : q / 100; a = Math.round(a * 1000) / 1000;
      return boundaryItem(x, [a], side === 'hi' ? 'right' : 'left', setup(x) + ' What ' + x.c.noun + ' marks the ' + x.c[side] + ' ' + q + '% of ' + x.c.thing + '?',
        side === 'hi' ? 'The calculator wants the area to the LEFT. The top ' + q + '% leaves ' + a + ' on the left.' : 'The lowest ' + q + '% is already the area to the left: ' + a + '.',
        { itemType: 'word', nudge: 'Sketch it. Which tail is shaded? What is on the left?', figure: fig(x, side === 'hi' ? 'right' : 'left', q / 100, '?') }); }
    if (b === 3) { q = pick(r, [50, 80, 90, 95]); var t = (100 - q) / 2 / 100; t = Math.round(t * 10000) / 10000;
      return boundaryItem(x, [t, Math.round((1 - t) * 10000) / 10000], 'between', setup(x) + ' Find the two ' + x.c.noun + 's that bound the middle ' + q + '% of ' + x.c.thing + '. Give the lower, then the upper.',
        'The middle ' + q + '% leaves ' + (100 - q) + '% in the two tails, ' + (100 - q) / 2 + '% each. Use invNorm twice.', { itemType: 'two-answer', nudge: 'Split what is left over into two equal tails.', figure: fig(x, 'between', q / 100, '?') }); }
    /* band 4: read a calculator screen, or find the wrong-tail mistake */
    if (r() < 0.5) { p = pick(r, [75, 80, 90, 95]); a = p / 100; ans = bnd(x, a).value;
      c = choice(r, p + '% of ' + x.c.thing + ' are below ' + f2(ans) + ' ' + x.c.unit + '.', [p + '% of ' + x.c.thing + ' are above ' + f2(ans) + ' ' + x.c.unit + '.', f2(ans) + ' is the z-score.', f2(ans) + ' is ' + p + '% of the mean.']);
      return { tag: 'T13', type: 'choice', itemType: 'screen-read', meta: { mean: x.mean, sd: x.sd, leftAreas: [a] }, prompt: setup(x) + ' The calculator shows: invNorm(' + a + ', ' + x.mean + ', ' + x.sd + ') = ' + f2(ans) + '. What does that mean?',
        options: c.options, answer: c.answer, hint: 'invNorm returns a value, with the area you typed to its left.', nudge: 'Area first, then value. The area is on the left.',
        worked: 'invNorm gives the value with ' + p + '% of the data below it: ' + f2(ans) + ' ' + x.c.unit + '.', figure: fig(x, 'left', a, f2(ans)) }; }
    q = pick(r, [5, 10, 15]); a = q / 100; ans = bnd(x, a).value;
    c = choice(r, 'She used the area below. The ' + x.c.hi + ' ' + q + '% needs ' + (1 - a).toFixed(2) + ' on the left.', ['She should have used normalcdf.', 'She typed the mean and SD in the wrong order.', 'Nothing is wrong.']);
    return { tag: 'T13', type: 'choice', itemType: 'error-find', meta: { mean: x.mean, sd: x.sd, leftAreas: [a, 1 - a] }, prompt: setup(x) + ' A student wants the cutoff for the ' + x.c.hi + ' ' + q + '% of ' + x.c.thing + '. She types invNorm(' + a + ', ' + x.mean + ', ' + x.sd + ') and gets ' + f2(ans) + '. What went wrong?',
      options: c.options, answer: c.answer, hint: 'The ' + x.c.hi + ' ones are in the right tail. Is her answer above or below the mean?', nudge: 'Does her answer make sense next to the mean?',
      worked: 'Her answer sits below the mean, but the ' + x.c.hi + ' ' + q + '% are above it. Use ' + (1 - a).toFixed(2) + ': invNorm(' + (1 - a).toFixed(2) + ', ' + x.mean + ', ' + x.sd + ') = ' + f2(bnd(x, 1 - a).value) + '.' };
  } };

  /* ---------- skill 3: T14, find a missing mean or SD ---------- */
  var missingSkill = { id: 'missing', title: 'Find a missing mean or SD', gen: function (b, r) {
    b = cl(b); var c = pick(r, CTX), sd = pick(r, [4, 5, 6, 8, 10]), mu = pick(r, c.ms)[0], p, a, z, X, zg, which, ans, it, dir;
    function mk(kind, area, giveZ) {
      var zz = ppf(area), Xv = r1(mu + zz * sd), zshown = r2(zz);
      var givenZ = giveZ ? ' For the ' + th(Math.round(area * 100)) + ' percentile, z = ' + (zshown < 0 ? NAN : '') + Math.abs(zshown) + '.' : '';
      var calcZ = giveZ ? zshown : zz;
      var res = kind === 'mean' ? Xv - calcZ * sd : (Xv - mu) / calcZ;
      var pre = 'Pretend ' + c.thing + ' follow a normal curve (' + c.unit + ').';
      var prompt = kind === 'mean'
        ? pre + ' The SD is ' + sd + '. The ' + th(Math.round(area * 100)) + ' percentile of the ' + c.noun + ' is ' + Xv + ' ' + c.unit + '.' + givenZ + ' Find the mean.'
        : pre + ' The mean is ' + mu + '. The ' + th(Math.round(area * 100)) + ' percentile of the ' + c.noun + ' is ' + Xv + ' ' + c.unit + '.' + givenZ + ' Find the SD.';
      var steps = kind === 'mean'
        ? 'z = ' + f2(calcZ) + '. ' + Xv + ' = mean + (' + f2(calcZ) + ')(' + sd + '). mean = ' + Xv + ' ' + (calcZ < 0 ? '+' : '−') + ' ' + f2(Math.abs(calcZ * sd)) + ' = ' + f2(res) + '.'
        : 'z = ' + f2(calcZ) + '. ' + Xv + ' = ' + mu + ' + (' + f2(calcZ) + ')(SD). SD = (' + Xv + ' − ' + mu + ') ÷ ' + f2(calcZ) + ' = ' + f2(res) + '.';
      return { tag: 'T14', type: 'num', itemType: giveZ ? 'word' : (kind === 'mean' ? 'backward' : 'solve'), meta: { kind: kind, area: area, X: Xv, mean: kind === 'mean' ? null : mu, sd: kind === 'mean' ? sd : null, zGiven: giveZ ? zshown : null },
        prompt: prompt, answer: r1(res), unit: c.unit, tol: tolFor(res), hint: kind === 'mean' ? 'Put the boundary value, z and the SD into value = mean + z × SD, then solve for the mean.' : 'Put the boundary value, the mean and z into value = mean + z × SD, then solve for the SD.',
        nudge: 'The boundary value is mean + z SDs. Which piece is missing?', worked: steps,
        figure: { kind: 'normal', mean: kind === 'mean' ? '?' : mu, sd: kind === 'mean' ? sd : '?', units: c.unit, shade: 'left', area: area, boundary: Xv } };
    }
    if (b === 1) return mk('mean', pick(r, [0.9, 0.95, 0.8]), true);
    if (b === 2) return mk('mean', pick(r, [0.75, 0.8, 0.9, 0.95]), false);
    if (b === 3) return mk('sd', pick(r, [0.75, 0.8, 0.9, 0.95]), false);
    return mk(r() < 0.5 ? 'mean' : 'sd', pick(r, [0.1, 0.2, 0.25]), false);
  } };

  var skills = [directionSkill, boundarySkill, missingSkill];

  /* ---------- Warm-up: retrieval for 3.5 and the words 3.6 needs (bands 1 and 2) ---------- */
  var warmup = [
    { id: 'W1', band: 1, prompt: 'Pretend the area to the left of a value is 0.82. What is the area to the right?', answer: 0.18, pattern: 'Area above = 1 − area below' },
    { id: 'W2', band: 1, prompt: 'Pretend delivery times follow a normal curve with mean 30. What percent of deliveries take longer than 30 minutes?', answer: 50, pattern: 'Symmetric: half above the mean' },
    { id: 'W3', band: 1, prompt: 'Pretend delivery times have mean 30 and SD 6. What is the z-score of 36 minutes?', answer: 1, pattern: 'z = (value − mean) ÷ SD' },
    { id: 'W4', band: 1, prompt: 'A value is at the 90th percentile. What percent of values are below it?', answer: 90, pattern: 'Percentile = percent below' },
    { id: 'W5', band: 2, prompt: 'About 68% of a normal curve is within 1 SD of the mean. About what percent is below 1 SD above the mean?', answer: 84, pattern: '50 + 34' },
    { id: 'W6', band: 2, prompt: 'Technology gives area to the LEFT. The area to the left of a cutoff is 0.35. What percent of values are above it?', answer: 65, pattern: 'Technology reports left; subtract for right' }
  ];
  var talk = ['Which is the same question backwards: "what percent is below 35?" or "what time has 80% below it?"'];

  var predicts = [
    { id: 'P1', title: 'Above or below?', prompt: 'Pretend delivery times are normal with mean 30 minutes. Is the 90th percentile above 30 or below 30?', options: ['Above 30', 'Below 30', 'Exactly 30'], answer: 0, why: '90% are below it, so it sits well to the right of the mean.' },
    { id: 'P2', title: 'Estimate first', prompt: 'Same deliveries: mean 30, SD 6. One SD above the mean is 36 (the 84th percentile). Two SDs above is 42 (about the 97.5th). The 90th percentile is…', options: ['Below 36', 'Between 36 and 42', 'Above 42'], answer: 1, why: '90 is bigger than 84 and smaller than 97.5, so the value sits between 36 and 42.' },
    { id: 'P3', added: true, title: 'The fastest 20%', prompt: 'Same deliveries. The cutoff for the fastest 20% is…', options: ['Above 30', 'Below 30'], answer: 1, why: 'Fastest means the small times, on the left of the mean.' }
  ];

  /* ---------- Explore: "Slide the boundary" (target given, student finds the value) ---------- */
  var explore = { id: 'slide-boundary', mean: 30, sd: 6, units: 'minutes', targets: [0.5, 0.9, 0.2, 0.95],
    note: 'Student drags one boundary until the shaded area on the left matches the target. Area readout is hidden until Commit. After Commit, the value shows in minutes.',
    answers: [0.5, 0.9, 0.2, 0.95].map(function (a) { return { area: a, value: r1(30 + 6 * ppf(a)) }; }) };

  /* ---------- Models: M1 watch, M2 with me, M3 you do (T13); M4 watch, M5 with me (T14, first cut) ---------- */
  var MOVES = ['Sketch and shade', 'Area to the left', 'Enter invNorm', 'Sense-check', 'Say it in a sentence'];
  function boundModel(id, mode, area, phrase, shadeSide, sentence) {
    var mean = 30, sd = 6, z = ppf(area), v = mean + z * sd, arg = '(' + area + ', ' + mean + ', ' + sd + ')';
    var cmp = v > mean ? 'above' : 'below';
    var near = area > 0.5 ? 'It must sit above 30. It lands between 36 (84th percentile) and 42 (about 97.5th).' : 'It must sit below 30. It lands between 24 (16th percentile) and 30.';
    return { id: id, mode: mode, tag: 'T13', problem: 'Pretend delivery times are normal, mean 30 minutes, SD 6. Find ' + phrase + '.', area: area, answer: r1(v), answer2dp: r2(v),
      steps: [
        { move: 1, text: 'Sketch the curve centered at 30. Shade the ' + shadeSide + '.' },
        { move: 2, text: 'Area to the left = ' + area + '.' },
        { move: 3, text: 'invNorm' + arg + ' = ' + f2(v) + '.' },
        { move: 4, text: 'The value is ' + cmp + ' 30, as the sketch says. ' + (area > 0.5 ? (area > 0.84 ? 'It is between 36 and 42.' : 'It is above 30.') : (area > 0.16 ? 'It is between 24 and 30.' : 'It is below 24.')) },
        { move: 5, text: sentence.replace('{v}', String(r1(v))) }
      ], slip: area > 0.5 && id === 'M3' ? 'Typing invNorm(0.05, 30, 6). The slowest 5% need 0.95 on the left.' : id === 'M2' ? 'Typing 0.80 for the fastest 20%. Fastest is the left tail, so 0.20.' : 'Typing the mean and SD before the area.' };
  }
  function missModel(id, mode, kind) {
    var area = 0.9, z = ppf(area), X = 40, sd = 6, mean = 30;
    if (kind === 'mean') { var m = X - z * sd;
      return { id: id, mode: mode, tag: 'T14', problem: 'Pretend delivery times are normal with SD 6 minutes. The 90th percentile is 40 minutes. Find the mean.', answer: r1(m),
        steps: [{ move: 1, text: 'Sketch: shade the left 90%. The boundary 40 is known; the center is unknown.' }, { move: 2, text: 'Area to the left = 0.90, so z = invNorm(0.90, 0, 1) = ' + f2(z) + '.' },
          { move: 3, text: 'value = mean + z × SD, so 40 = mean + (' + f2(z) + ')(6).' }, { move: 4, text: 'mean = 40 − ' + f2(z * sd) + ' = ' + f2(m) + '. It is below 40, as the sketch says.' }, { move: 5, text: 'The mean delivery time is about ' + r1(m) + ' minutes.' }], slip: 'Adding z × SD to 40 instead of subtracting it.' }; }
    var s = (X - mean) / z;
    return { id: id, mode: mode, tag: 'T14', problem: 'Pretend delivery times are normal with mean 30 minutes. The 90th percentile is 40 minutes. Find the SD.', answer: r1(s),
      steps: [{ move: 1, text: 'Sketch: shade the left 90%. The center 30 and the boundary 40 are known; the spread is unknown.' }, { move: 2, text: 'Area to the left = 0.90, so z = ' + f2(z) + '.' },
        { move: 3, text: '40 = 30 + (' + f2(z) + ')(SD).' }, { move: 4, text: 'SD = (40 − 30) ÷ ' + f2(z) + ' = ' + f2(s) + '. Positive, and 40 is 1.28 SDs above 30.' }, { move: 5, text: 'The SD is about ' + r1(s) + ' minutes.' }], slip: 'Multiplying by z instead of dividing.' };
  }
  var models = [
    boundModel('M1', 'watch', 0.9, 'the 90th percentile of delivery time', 'left 90%', 'About 90% of deliveries take less than {v} minutes.'),
    boundModel('M2', 'with-me', 0.2, 'the cutoff for the fastest 20% of deliveries', 'left 20%', 'The fastest 20% of deliveries take less than {v} minutes.'),
    boundModel('M3', 'you-do', 0.95, 'the cutoff for the slowest 5% of deliveries', 'right 5%, which leaves 95% on the left', 'The slowest 5% of deliveries take more than {v} minutes.'),
    missModel('M4', 'watch', 'mean'), missModel('M5', 'with-me', 'sd')
  ];
  models[1].typedMoves = [2, 3]; models[4].typedMoves = [3, 4];
  models.forEach(function (m) { m.rigor = m.tag === 'T14'; });

  var board = {
    figure: { kind: 'normal', mean: 30, sd: 6, units: 'minutes', interactive: false },
    reveal: [
      { say: 'Percentile', write: 'The percent of values [[below]] a value.' },
      { say: 'Two commands', write: 'normalcdf: value in, [[area]] out. invNorm: area in, [[value]] out.' },
      { say: 'The rule for invNorm', write: 'invNorm(area to the [[left]], mean, SD)' },
      { say: 'Worked example M1', write: 'Walk the five moves for the 90th percentile; the answer is a time, not a z-score.' }
    ]
  };
  var gate = { items: ['P1', 'P2', 'P3', 'explore-0.9', 'explore-0.2'], rule: 'PENDING', until: 'Use the standard huddle (rule 17) until Ian decides.' };
  var exit = [
    { id: 'X1', added: true, prompt: 'Pretend quiz scores are normal. "Find the score that only 5% of students beat." Area question or boundary question?', type: 'choice', options: [DIR.area, DIR.boundary], answer: 1 },
    { id: 'X2', added: true, prompt: 'Pretend quiz scores are normal with mean 70 and SD 8. What score is the 75th percentile? (Round to 0.1.)', type: 'num', answer: r1(70 + 8 * ppf(0.75)), tol: 0.1, unit: 'points' },
    { id: 'X3', added: true, prompt: 'Same quiz. The lowest 10% get tutoring. What is the cutoff score? (Round to 0.1.)', type: 'num', answer: r1(70 + 8 * ppf(0.10)), tol: 0.1, unit: 'points' }
  ];
  var scoring = { perItem: 1, firstTry: true, secure: 3, developing: 2, notYet: '0-1', note: 'Taken from the chem UBD rule; the stats Stage 1 doc does not say. Confirm.' };
  var misconceptions = [
    { say: 'For the 90th percentile, type invNorm(0.10, ...).', fix: 'A percentile is the area to the LEFT. Always type the left area.', added: true },
    { say: 'The slowest 5% means invNorm(0.05, ...).', fix: 'The slowest are on the right. Left area = 1 − 0.05 = 0.95.', added: true },
    { say: 'The answer is the number the calculator showed in the z step (1.28 minutes).', fix: 'A z-score is a step. The answer is a value with units.', added: true },
    { say: 'invNorm(mean, SD, area).', fix: 'Area first: invNorm(area, mean, SD).', added: true },
    { say: 'SD = (value − mean) × z.', fix: 'Divide by z. Multiplying gives the wrong size.', added: true }
  ];
  var pacing = { budgetMin: 42, steps: [
    { id: 'start', prio: 1, min: 2 }, { id: 'warmup', prio: 1, min: 4 }, { id: 'predict', prio: 1, min: 4 },
    { id: 'explore', prio: 3, min: 8 }, { id: 'build', prio: 2, min: 8, minItems: 2, parts: 4 },
    { id: 'practice', prio: 1, min: 8 }, { id: 'check', prio: 1, min: 4 }], huddles: [{ key: 'h1', atMin: 10 }],
    buildParts: ['direction', 'boundary-upper-tail', 'boundary-lower-tail', 'missing-mean-or-sd'], note: 'The last build part (T14) is cut first when the class is behind. Stage 1 trim option 4 holds T14 for a later review day.' };

  var CONTENT = { id: 'stats-unit3-slot11', ppf: ppf, cdf: cdf, CTX: CTX, skills: skills, warmup: warmup, talk: talk, predicts: predicts, explore: explore, MOVES: MOVES, models: models,
    board: board, gate: gate, exit: exit, scoring: scoring, misconceptions: misconceptions, pacing: pacing, DIR: DIR };
  if (typeof module !== 'undefined' && module.exports) module.exports = CONTENT; else (root.DAYCARDS = root.DAYCARDS || {})[CONTENT.id] = CONTENT;
})(typeof window !== 'undefined' ? window : globalThis);
