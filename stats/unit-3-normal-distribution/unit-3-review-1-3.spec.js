/* SPEC: Review 3.1 to 3.3 (mixed review). Plain data and pure functions, no DOM: the lesson page and the unit tests read this one file.
   No new content. One generator per target, T1 to T9, and the skill id IS the target id, so scores and the report code read by target.
   Every generator returns { pic, prompt, answer, hint, nudge, remember, worked, tag } (numbers) or the same with { type:'choice', options, answer } (choices).
     pic       an SVG string, shown BEFORE the question
     remember  the concept line shown up front at band 1 only
     hint      the full hint; nudge: a one-line push. SPEC.fade(q, band) decides what a student sees at each band: hints fade as first-try answers climb.
   Every number is invented and the prompt says "pretend". No z-table or empirical-rule items (those come in 3.4 and later).
   Blocks: A = 3.1 and 3.2 (T1 to T6), B = 3.3 (T7 to T9). The warm-up draws three from each (see WARM). */
(function (root) {
  'use strict';
  var INT = function (r, a, b) { return a + Math.floor(r() * (b - a + 1)); };
  var pick = function (r, arr) { return arr[Math.floor(r() * arr.length)]; };
  var r2 = function (x) { return Math.round(x * 100) / 100; };
  var NAMES = ['Ana', 'Ben', 'Cy', 'Dee', 'Eli', 'Fay', 'Gus', 'Hana'];
  var MINUS = '−';
  var num = function (x) { return (x < 0 ? MINUS : '') + String(Math.abs(r2(x))); };

  /* ---------- pictures (SVG strings) ---------- */
  var INK = '#142230', BLUE = '#2b4fd9', RED = '#b3412e', GREY = '#9db0c2';
  function svg(w, h, inner, label) { return '<svg viewBox="0 0 ' + w + ' ' + h + '" role="img" aria-label="' + label + '" style="width:100%;max-width:' + w + 'px;background:#f6f9fd;border:1px solid #cbd6e0;border-radius:8px">' + inner + '</svg>'; }
  function txt(x, y, s, o) { o = o || {}; return '<text x="' + x + '" y="' + y + '" font-size="' + (o.size || 13) + '" font-family="system-ui,sans-serif" fill="' + (o.fill || INK) + '" text-anchor="' + (o.anchor || 'middle') + '"' + (o.bold ? ' font-weight="700"' : '') + '>' + s + '</text>'; }
  function line(x1, y1, x2, y2, c, w, dash) { return '<line x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '" stroke="' + (c || INK) + '" stroke-width="' + (w || 1.5) + '"' + (dash ? ' stroke-dasharray="6 4"' : '') + '/>'; }
  /* a ruler: ticks at mean +/- k SD (labeled with values), an optional dot at x. Returns inner svg for a panel whose axis sits at y. */
  function ruler(mean, sd, x, y, o) {
    o = o || {}; var X = function (v) { return 40 + (v - (mean - 3 * sd)) / (6 * sd) * 440; }, s = line(40, y, 480, y, INK, 2);
    for (var k = -3; k <= 3; k++) { s += line(X(mean + k * sd), y - 7, X(mean + k * sd), y + 7, INK, 2) + txt(X(mean + k * sd), y + 24, String(mean + k * sd)); }
    s += txt(X(mean), y - 14, 'mean', { size: 12, fill: '#566170' });
    if (x != null) s += line(X(x), y - 30, X(x), y, RED, 2) + '<circle cx="' + X(x) + '" cy="' + (y - 34) + '" r="8" fill="' + RED + '"/>' + (o.label ? txt(X(x), y - 50, o.label, { bold: true }) : '');
    return s;
  }
  /* bars: heights array, drawn on a baseline; axis ticks supplied by the caller */
  function bars(h, x0, x1, base, top, color, gap) {
    var m = Math.max.apply(null, h) || 1, w = (x1 - x0) / h.length, s = '';
    h.forEach(function (v, i) { var bh = v / m * (base - top); if (v > 0) s += '<rect x="' + (x0 + i * w + (gap == null ? 2 : gap)) + '" y="' + (base - bh) + '" width="' + (w - 2 * (gap == null ? 2 : gap)) + '" height="' + bh + '" fill="' + (color || '#9db6ec') + '" stroke="' + BLUE + '"/>'; });
    return s;
  }
  var SHAPE = [1, 3, 6, 9, 11, 9, 6, 3, 1];
  var SKEW = [3, 9, 12, 10, 7, 4, 2, 1, 1];
  /* the same bars drawn on an axis for (mean, sd): the bars have exactly that mean and SD (bar spacing = sd / the bars' own SD) */
  var SBINS = (function () { var N = 0, v = 0; SHAPE.forEach(function (c) { N += c; }); SHAPE.forEach(function (c, i) { v += c * (i - 4) * (i - 4); }); return Math.sqrt(v / N); })();   // the bars' own SD, in bar widths
  function barsOn(shape, mean, sd, lo, hi, base, top, color) {
    var X = function (v) { return 40 + (v - lo) / (hi - lo) * 440; }, m = Math.max.apply(null, shape), s = '', sp = sd / SBINS;
    shape.forEach(function (v, i) { var c = mean + (i - Math.floor(shape.length / 2)) * sp, bh = v / m * (base - top), w = sp / (hi - lo) * 440; s += '<rect x="' + (X(c) - w / 2 + 1) + '" y="' + (base - bh) + '" width="' + (w - 2) + '" height="' + bh + '" fill="' + (color || '#9db6ec') + '" stroke="' + BLUE + '"/>'; });
    return s;
  }
  function axisNums(lo, hi, step, y, fmt) { var X = function (v) { return 40 + (v - lo) / (hi - lo) * 440; }, s = line(40, y, 480, y, INK, 1.5); for (var v = Math.ceil(lo / step) * step; v <= hi + 1e-9; v += step) s += line(X(v), y, X(v), y + 5, INK, 1.5) + txt(X(v), y + 19, fmt ? fmt(v) : String(r2(v)), { size: 12 }); return s; }

  /* ---------- T1: percentile ---------- */
  function t1(b, r) {
    var who = pick(r, NAMES);
    if (b >= 4 && r() < 0.7) {
      var p = INT(r, 55, 95), W = 400, inner = line(60, 70, 460, 70, INK, 2) + '<rect x="60" y="45" width="' + (W * p / 100) + '" height="50" fill="#cfe0ff" stroke="' + BLUE + '"/>' + '<rect x="' + (60 + W * p / 100) + '" y="45" width="' + (W * (100 - p) / 100) + '" height="50" fill="#fff" stroke="' + GREY + '"/>'
        + line(60 + W * p / 100, 35, 60 + W * p / 100, 105, RED, 3) + txt(60 + W * p / 200, 76, 'scores below', { size: 14 }) + txt(60 + W * p / 100, 28, who + '’s score', { fill: RED, bold: true }) + txt(60, 124, '0%', { size: 12 }) + txt(460, 124, '100%', { size: 12 });
      return { tag: 'T1', type: 'choice', pic: svg(520, 135, inner, 'A bar of all scores. The part to the left of ' + who + '’s score is shaded.'),
        prompt: 'Pretend quiz: ' + who + ' scored at the ' + p + 'th percentile. What does that mean?',
        options: [p + '% of the scores were below ' + who + '’s.', who + ' got ' + p + '% of the questions right.', p + '% of the scores were above ' + who + '’s.', who + ' ranked number ' + p + ' in the class.'], answer: 0,
        remember: 'A percentile is the percent of values below.', hint: 'A percentile counts other scores below yours. It is not points earned and not a rank.', nudge: 'Percentile is about the other students, not about points.',
        worked: 'The ' + p + 'th percentile means ' + p + '% of the scores were below ' + who + '’s.' };
    }
    var n = b <= 1 ? 10 : b === 2 ? 20 : 25, k = INT(r, 1, n - 2), vals = [], v = 40, i;
    for (i = 0; i < n; i++) { v += 1 + INT(r, 0, b <= 1 ? 3 : 1); vals.push(v); }
    var lo = vals[0] - 2, hi = vals[n - 1] + 2, X = function (q) { return 40 + (q - lo) / (hi - lo) * 440; }, inner2 = axisNums(lo, hi, 5, 90, null).replace(/<text[^>]*>[^<]*<\/text>/g, function (t) { return t; });
    vals.forEach(function (q, j) { inner2 += '<circle cx="' + X(q) + '" cy="68" r="' + (b <= 1 ? 7 : 4.5) + '" fill="' + (j === k ? RED : '#9db6ec') + '" stroke="' + INK + '"/>'; });
    inner2 += txt(X(vals[k]), 40, who, { fill: RED, bold: true });
    var pct = 100 * k / n;
    return { tag: 'T1', pic: svg(520, 120, inner2, n + ' quiz scores as dots on a number line, one dot is red'),
      prompt: 'Pretend quiz scores for ' + n + ' students are shown. ' + who + '’s score is the red dot. What percentile is ' + who + '’s score?', answer: pct, unit: '%',
      remember: 'A percentile is the percent of values below.', hint: 'Count the dots to the left of the red dot, then divide by ' + n + ' and multiply by 100.', nudge: 'Count the dots below the red dot first.',
      worked: k + ' of ' + n + ' dots are below ' + who + '’s. ' + k + ' ÷ ' + n + ' × 100 = ' + r2(pct) + ', so about the ' + r2(pct) + 'th percentile.' };
  }

  /* ---------- T2: z-score ---------- */
  function t2(b, r) {
    var who = pick(r, NAMES), mean, sd, z, x, id;
    if (b >= 4 && r() < 0.5) {
      z = pick(r, [-2.5, -1.5, -0.5, 0.5, 1.5, 2.5]); var a = Math.abs(z), d = z < 0 ? 'below' : 'above', opp = z < 0 ? 'above' : 'below';
      mean = pick(r, [60, 70, 80]); sd = pick(r, [4, 10]); x = mean + z * sd;
      return { tag: 'T2', type: 'choice', pic: svg(520, 120, ruler(mean, sd, x, 80, { label: 'z = ' + num(z) }), 'A ruler in standard deviations with a red dot at z = ' + num(z)),
        prompt: 'Pretend test: mean ' + mean + ', SD ' + sd + '. A score has z = ' + num(z) + '. What does that say?',
        options: ['It is ' + a + ' standard deviations ' + d + ' the mean.', 'It is ' + a + ' standard deviations ' + opp + ' the mean.', 'It is ' + a + ' points ' + d + ' the mean.', 'It is ' + Math.abs(r2(x)) + ' standard deviations from the mean.'], answer: 0,
        remember: 'z counts SD steps from the mean.', hint: 'The size of z is the number of SD steps. The sign is the direction: negative is below.', nudge: 'Read the size and the sign of z separately.',
        worked: 'The size ' + a + ' is the number of SDs. The sign ' + (z < 0 ? 'minus means below' : 'plus means above') + ' the mean.' };
    }
    if (b <= 1) { sd = pick(r, [5, 10]); mean = pick(r, [50, 60, 70]); z = pick(r, [-2, -1, 1, 2, 3]); }
    else if (b === 2) { sd = pick(r, [4, 6, 8, 10]); mean = pick(r, [60, 70, 80]); z = pick(r, [0.5, 1.5, 2.5, -0.5, 1, 2]); }
    else if (b === 3) { sd = pick(r, [4, 6, 8, 10]); mean = pick(r, [50, 70, 100]); z = pick(r, [-2.5, -1.5, -0.5, -1, -2, 1.5]); }
    else { sd = pick(r, [4, 8]); mean = pick(r, [60, 100]); z = pick(r, [-2.25, -1.75, -1.25, 1.25, 1.75, 2.25]); }
    x = mean + z * sd;
    return { tag: 'T2', pic: svg(520, 120, ruler(mean, sd, x, 80, { label: who }), 'A ruler with ticks one SD apart and a red dot for ' + who + '’s score'),
      prompt: 'Pretend test: mean ' + mean + ', SD ' + sd + '. ' + who + ' scored ' + r2(x) + '. What is ' + who + '’s z-score?', answer: z,
      remember: 'z = (value − mean) ÷ SD. It counts SD steps from the mean.', hint: 'Find how far the score is from the mean, then divide by the SD of ' + sd + '.', nudge: 'Subtract the mean first. Then divide.',
      worked: '(' + r2(x) + ' − ' + mean + ') ÷ ' + sd + ' = ' + num(z) + '.' };
  }

  /* ---------- T3: which value is more unusual ---------- */
  var PAIRS = [['Chem test', 'Bio test'], ['Quiz A', 'Quiz B'], ['Unit 1 test', 'Unit 2 test'], ['Spring survey', 'Fall survey']];
  function t3(b, r) {
    var who = pick(r, NAMES), pr = pick(r, PAIRS), A = {}, B = {}, za, zb, tries = 0;
    do {
      A.sd = pick(r, [4, 5, 8, 10]); B.sd = pick(r, [4, 5, 8, 10]); A.mean = pick(r, [60, 70, 80]); B.mean = pick(r, [50, 65, 75]);
      za = pick(r, b <= 2 ? [0.5, 1, 1.5, 2, 2.5] : [-2.5, -2, -1.5, -1, 1, 1.5, 2, 2.5]); zb = pick(r, b <= 2 ? [0.5, 1, 1.5, 2, 2.5] : [-2.5, -2, -1.5, -1, 1, 1.5, 2, 2.5]); tries++;
    } while (Math.abs(Math.abs(za) - Math.abs(zb)) < 0.4 && tries < 50);
    A.x = A.mean + za * A.sd; B.x = B.mean + zb * B.sd;
    var inner = ruler(A.mean, A.sd, A.x, 70, { label: pr[0] }) + ruler(B.mean, B.sd, B.x, 170, { label: pr[1] });
    return { tag: 'T3', type: 'choice', pic: svg(520, 215, inner, 'Two rulers, one for each test, each with a red dot for ' + who + '’s score'),
      prompt: 'Pretend: ' + who + ' scored ' + r2(A.x) + ' on the ' + pr[0] + ' (mean ' + A.mean + ', SD ' + A.sd + ') and ' + r2(B.x) + ' on the ' + pr[1] + ' (mean ' + B.mean + ', SD ' + B.sd + '). Which score is more unusual?',
      options: [pr[0] + ' score', pr[1] + ' score', 'Equally unusual', 'Cannot tell without more data'], answer: Math.abs(za) > Math.abs(zb) ? 0 : 1,
      remember: 'Compare z-scores. The farther from 0, the more unusual.', hint: 'Find a z-score for each score. The one farther from 0, in either direction, is more unusual.', nudge: 'Do not compare the raw scores. Compare their z-scores.',
      worked: pr[0] + ': z = ' + num(za) + '. ' + pr[1] + ': z = ' + num(zb) + '. ' + (Math.abs(za) > Math.abs(zb) ? pr[0] : pr[1]) + ' is farther from 0, so it is more unusual.' };
  }

  /* ---------- T4 and T5: shift and stretch ---------- */
  function twoPanel(shape, m1, s1, m2, s2, lab1, lab2, lo, hi, lo2, hi2) {
    var inner = barsOn(shape, m1, s1, lo, hi, 90, 20) + axisNums(lo, hi, s1, 90) + line(40 + (m1 - lo) / (hi - lo) * 440, 14, 40 + (m1 - lo) / (hi - lo) * 440, 90, RED, 2, true) + txt(40, 12, lab1, { anchor: 'start', bold: true, size: 12 }) +
      barsOn(shape, m2, s2, lo2, hi2, 210, 140, '#cfe8d6') + axisNums(lo2, hi2, s2, 210) + line(40 + (m2 - lo2) / (hi2 - lo2) * 440, 134, 40 + (m2 - lo2) / (hi2 - lo2) * 440, 210, RED, 2, true) + txt(40, 132, lab2, { anchor: 'start', bold: true, size: 12 });
    return svg(520, 245, inner, 'Two dot-free histograms: the data before the change above, after the change below. The shape looks the same.');
  }
  function t4(b, r) {
    var mean = pick(r, [60, 65, 70, 75, 80]), sd = pick(r, [4, 5, 6, 8, 10]), c = pick(r, [5, 10, 15, -5, -10, 3]), shape = b >= 4 ? SKEW : SHAPE, med = mean - (b >= 4 ? 2 : 0), unit = 'pretend points';
    var lo = Math.min(mean, mean + c) - 4 * sd, hi = Math.max(mean, mean + c) + 4 * sd, pic = twoPanel(shape, mean, sd, mean + c, sd, 'Before', 'After ' + (c > 0 ? 'adding ' : 'subtracting ') + Math.abs(c), lo, hi, lo, hi);
    var add = (c > 0 ? 'adds ' + c + ' to' : 'subtracts ' + Math.abs(c) + ' from') + ' every value';
    if (b <= 1) return { tag: 'T4', pic: pic, prompt: 'Pretend scores have mean ' + mean + ' and SD ' + sd + '. A teacher ' + add + '. What is the new mean?', answer: mean + c,
      remember: 'Adding a constant moves the center by that constant. The spread stays the same.', hint: 'Every value moves by ' + num(c) + ', so the mean moves by ' + num(c) + ' too.', nudge: 'The whole picture slides. Where does the mean land?', worked: mean + ' ' + (c > 0 ? '+' : MINUS) + ' ' + Math.abs(c) + ' = ' + (mean + c) + '.' };
    if (b === 2) return { tag: 'T4', pic: pic, prompt: 'Pretend scores have mean ' + mean + ' and SD ' + sd + '. A teacher ' + add + '. What is the new SD?', answer: sd,
      remember: 'Adding a constant moves the center. The spread does not change.', hint: 'The picture slides but does not get wider or narrower. Spread stays the same.', nudge: 'Did the picture get wider, or did it only slide?', worked: 'Sliding every value by the same amount keeps the spread. The SD is still ' + sd + '.' };
    if (b === 3) return { tag: 'T4', type: 'choice', pic: pic, prompt: 'Pretend scores (mean ' + mean + ', SD ' + sd + ') ' + (c > 0 ? 'all go up by ' : 'all go down by ') + Math.abs(c) + '. What happens to shape, center and spread?',
      options: ['Only the center changes.', 'Center and spread both change.', 'Only the spread changes.', 'Shape, center and spread all change.'], answer: 0,
      remember: 'Adding a constant changes only the center.', hint: 'The whole picture slides along the number line. Its shape and width stay the same.', nudge: 'Look at the two pictures. What stayed the same?', worked: 'The data slides. Center moves; shape and spread stay.' };
    return { tag: 'T4', type: 'choice', pic: pic, prompt: 'Pretend scores are skewed right with median ' + med + '. Every score ' + (c > 0 ? 'goes up by ' : 'goes down by ') + Math.abs(c) + '. What is true afterward?',
      options: ['The distribution is still skewed right, and the median is ' + (med + c) + '.', 'The distribution becomes symmetric, and the median is ' + (med + c) + '.', 'The distribution is still skewed right, and the median is still ' + med + '.', 'The distribution is skewed left, and the median is ' + (med + c) + '.'], answer: 0,
      remember: 'Adding a constant changes only the center.', hint: 'Shape does not change. The median moves by the same constant as every value.', nudge: 'Shape stays. Where does the median go?', worked: 'Shape and spread stay. The median moves by ' + num(c) + ' to ' + (med + c) + '.' };
  }
  function t5(b, r) {
    var k = pick(r, [2, 3, 4, 10, 12, 60, 100]), mean = pick(r, [3, 5, 6, 8, 10]), sd = pick(r, [1, 2, 4]), unit = { 12: 'feet to inches', 60: 'minutes to seconds', 100: 'meters to centimeters' }[k] || 'times ' + k, shape = SHAPE;
    var lo = mean - 3.5 * sd, hi = mean + 3.5 * sd, nm = mean * k, ns = sd * k, pic = twoPanel(shape, mean, sd, nm, ns, 'Before', 'After multiplying by ' + k, lo, hi, nm - 3.5 * ns, nm + 3.5 * ns), c = pick(r, [5, 10, 20]);
    var how = 'Every value is multiplied by ' + k;
    if (b <= 1) return { tag: 'T5', pic: pic, prompt: 'Pretend data have mean ' + mean + ' and SD ' + sd + '. ' + how + '. What is the new mean?', answer: nm,
      remember: 'Multiplying by k multiplies the center and the spread by k. Shape stays.', hint: 'The mean is a value, so it is multiplied too: ' + mean + ' × ' + k + '.', nudge: 'Multiply the mean by ' + k + '.', worked: mean + ' × ' + k + ' = ' + nm + '.' };
    if (b === 2) return { tag: 'T5', pic: pic, prompt: 'Pretend data have mean ' + mean + ' and SD ' + sd + '. ' + how + '. What is the new SD?', answer: ns,
      remember: 'Multiplying by k multiplies the center and the spread by k.', hint: 'The spread stretches by the same factor: ' + sd + ' × ' + k + '.', nudge: 'The picture stretches by ' + k + '. What happens to the SD?', worked: sd + ' × ' + k + ' = ' + ns + '.' };
    if (b === 3) return { tag: 'T5', type: 'choice', pic: pic, prompt: 'Pretend data have mean ' + mean + ' and SD ' + sd + '. ' + how + '. What happens to shape, center and spread?',
      options: ['Center and spread both get multiplied by ' + k + '. Shape stays.', 'Only the center is multiplied.', 'The spread stays the same.', 'The shape changes.'], answer: 0,
      remember: 'Multiplying by k multiplies the center and the spread by k.', hint: 'Multiplying stretches the whole picture from 0. The center and the width both grow by the factor.', nudge: 'Look at the axis labels in the bottom picture. What grew?', worked: 'Center ' + mean + ' → ' + nm + '. Spread ' + sd + ' → ' + ns + '. The shape is the same.' };
    return { tag: 'T5', pic: pic, prompt: 'Pretend data have mean ' + mean + ' and SD ' + sd + '. Every value is multiplied by ' + k + ', then ' + c + ' is added. What is the new SD?', answer: ns,
      remember: 'Multiplying changes center and spread. Adding changes only the center.', hint: 'Multiplying by ' + k + ' stretches the SD to ' + ns + '. Adding ' + c + ' only slides the picture.', nudge: 'Which step changes the spread: multiplying or adding?', worked: 'Multiplying makes the SD ' + sd + ' × ' + k + ' = ' + ns + '. Adding ' + c + ' does not change spread.' };
  }

  /* ---------- T6: z-scores have mean 0 and SD 1 ---------- */
  function t6(b, r) {
    var mean = pick(r, [60, 70, 80, 100]), sd = pick(r, [4, 5, 8, 10]), lo = mean - 3.5 * sd, hi = mean + 3.5 * sd;
    var inner = barsOn(SHAPE, mean, sd, lo, hi, 90, 20) + axisNums(lo, hi, sd, 90, null) + txt(40, 12, 'Pretend scores', { anchor: 'start', bold: true, size: 12 }) +
      barsOn(SHAPE, 0, 1, -3.5, 3.5, 210, 140, '#cfe8d6') + axisNums(-3.5, 3.5, 1, 210, function (v) { return num(v); }) + txt(40, 132, 'The same data as z-scores', { anchor: 'start', bold: true, size: 12 });
    var pic = svg(520, 245, inner, 'Pretend scores above; the same data turned into z-scores below, centered at 0');
    if (b <= 1) return { tag: 'T6', pic: pic, prompt: 'Pretend scores have mean ' + mean + ' and SD ' + sd + '. Every score is turned into a z-score. What is the mean of the z-scores?', answer: 0,
      remember: 'A set of z-scores always has mean 0 and SD 1.', hint: 'Look at the bottom picture. Where is the center of the z-scores?', nudge: 'Find the center of the bottom picture.', worked: 'Subtracting the mean centers the data at 0. The mean of z-scores is 0.' };
    if (b === 2) return { tag: 'T6', pic: pic, prompt: 'Pretend scores have mean ' + mean + ' and SD ' + sd + '. Every score is turned into a z-score. What is the SD of the z-scores?', answer: 1,
      remember: 'A set of z-scores always has mean 0 and SD 1.', hint: 'z-scores count in SD steps, so one step is 1.', nudge: 'z-scores are measured in SD steps. How big is one step?', worked: 'Dividing by the SD makes one SD equal 1. The SD of z-scores is 1.' };
    if (b === 3) return { tag: 'T6', type: 'choice', pic: pic, prompt: 'Pretend scores have mean ' + mean + ' and SD ' + sd + '. Why is the mean of their z-scores 0?',
      options: ['Subtracting the mean moves the center of the data to 0.', 'Dividing by the SD moves the center to 0.', 'z-scores are never negative.', 'The highest value is removed.'], answer: 0,
      remember: 'Subtract the mean to center. Divide by the SD to rescale.', hint: 'Each z-score starts by subtracting the mean from the value. What does that do to the center?', nudge: 'Which step of the z-score formula moves the center?', worked: 'Subtracting the mean slides the data so its center sits at 0.' };
    return { tag: 'T6', type: 'choice', pic: pic, prompt: 'Pretend scores have mean ' + mean + ' and SD ' + sd + '. Why is the SD of their z-scores 1?',
      options: ['Dividing by the SD makes one SD the new unit.', 'Subtracting the mean makes the spread 1.', 'Every data set has an SD of 1.', 'Only because the mean is 0.'], answer: 0,
      remember: 'Subtract the mean to center. Divide by the SD to rescale.', hint: 'Dividing every distance by the SD turns "one SD" into "one unit".', nudge: 'Which step of the z-score formula changes the spread?', worked: 'Dividing by the SD changes the unit to SDs, so one SD becomes 1.' };
  }

  /* ---------- T7: density curve, area is a proportion ---------- */
  function curveSvg(f, x0, x1, ymax, shadeA, shadeB, label, w, h) {
    w = w || 520; h = h || 170; var X = function (v) { return 40 + (v - x0) / (x1 - x0) * (w - 80); }, base = h - 40, top = 16, Y = function (v) { return base - v / ymax * (base - top); }, d = '', sh = '';
    for (var v = x0; v <= x1 + 1e-9; v += (x1 - x0) / 200) d += (d ? 'L' : 'M') + X(v).toFixed(1) + ' ' + Y(f(v)).toFixed(1);
    if (shadeA != null) { sh = 'M' + X(shadeA) + ' ' + base; for (v = shadeA; v <= shadeB + 1e-9; v += (shadeB - shadeA) / 100) sh += 'L' + X(v).toFixed(1) + ' ' + Y(f(v)).toFixed(1); sh += 'L' + X(shadeB) + ' ' + base + 'Z'; }
    var ax = line(40, base, w - 40, base, INK, 1.5); for (var t = Math.ceil(x0); t <= x1 + 1e-9; t += Math.max(1, Math.round((x1 - x0) / 6))) ax += line(X(t), base, X(t), base + 5, INK, 1.5) + txt(X(t), base + 20, String(t), { size: 12 });
    return svg(w, h, (sh ? '<path d="' + sh + '" fill="#cfe0ff" stroke="none"/>' : '') + '<path d="' + d + '" fill="none" stroke="' + BLUE + '" stroke-width="3"/>' + ax, label);
  }
  /* numeric area under f from a to b (trapezoids), used by the tests and by the validity items */
  function area(f, a, b, n) { n = n || 4000; var s = 0, dx = (b - a) / n; for (var i = 0; i < n; i++) s += (f(a + i * dx) + f(a + (i + 1) * dx)) / 2 * dx; return s; }
  var DENS = {
    rect: function (L) { return function (x) { return x >= 0 && x <= L ? 1 / L : 0; }; },
    tri: function (x) { return x >= 0 && x <= 2 ? x / 2 : 0; }
  };
  function t7(b, r) {
    if (b >= 4 && r() < 0.6) {
      var good = pick(r, ['rect', 'tri']), opts = [], bad = [
        { k: 'tall', f: function (x) { return x >= 0 && x <= 4 ? 0.5 : 0; }, why: 'The area is 2, not 1.' },
        { k: 'short', f: function (x) { return x >= 0 && x <= 4 ? 0.125 : 0; }, why: 'The area is 0.5, not 1.' },
        { k: 'neg', f: function (x) { return x >= 0 && x <= 4 ? 0.5 * Math.sin(Math.PI * x / 2) * 0.785 : 0; }, why: 'The curve dips below the axis.' }
      ], g = good === 'rect' ? DENS.rect(4) : function (x) { return x >= 0 && x <= 4 ? x / 8 : 0; };
      var A = [{ f: g, ok: true }].concat(bad.slice(0, 3).map(function (q) { return { f: q.f, ok: false, why: q.why }; }));
      var mini = function (f, lab) { return { svg: curveSvg(f, 0, 4, 0.56, null, null, lab, 200, 120).replace('max-width:200px', 'max-width:200px;display:block') }; };
      return { tag: 'T7', type: 'choice', pic: svg(520, 70, txt(260, 28, 'A density curve is a curve that stays on or above the axis', { size: 14 }) + txt(260, 52, 'and has a total area of 1.', { size: 14 }), 'The two rules for a density curve'),
        prompt: 'Pretend: which of these could be a density curve?', options: A.map(function (q, i) { return mini(q.f, 'Option ' + (i + 1)); }), answer: 0, grid: true,
        remember: 'A density curve stays on or above the axis. Its total area is 1.', hint: 'Check two things for each curve: is it always above the axis, and is the total area 1?', nudge: 'Which curve follows both rules: above the axis, and total area 1?',
        worked: 'The right curve is above the axis and has total area ' + r2(area(g, 0, 4)) + '. The others break a rule.' };
    }
    var f, x0, x1, ymax, a, c, ans, desc, how;
    if (b <= 1) { var L = pick(r, [5, 10]); f = DENS.rect(L); x0 = 0; x1 = L; ymax = 1.3 / L; a = INT(r, 0, L - 3); c = a + INT(r, 2, L - a - 1); ans = (c - a) / L; how = 'The curve is flat from 0 to ' + L + '. Its height is 1 ÷ ' + L + ' = ' + r2(1 / L) + '.';
      desc = 'a flat density curve from 0 to ' + L; }
    else if (b === 2) { var L2 = pick(r, [4, 8]); f = DENS.rect(L2); x0 = 0; x1 = L2; ymax = 1.3 / L2; a = INT(r, 0, L2 - 2); c = INT(r, a + 1, L2); ans = (c - a) / L2; how = 'Height ' + r2(1 / L2) + ', width ' + (c - a) + ': area = ' + r2(1 / L2) + ' × ' + (c - a) + '.'; desc = 'a flat density curve from 0 to ' + L2; }
    else { f = DENS.tri; x0 = 0; x1 = 2; ymax = 1.2; var cc = pick(r, [0.5, 1, 1.5]), left = r() < 0.5; a = left ? 0 : cc; c = left ? cc : 2; ans = left ? cc * cc / 4 : 1 - cc * cc / 4; how = 'The curve is a triangle with height 1 at x = 2. ' + (left ? 'Area on the left of ' + cc + ': ½ × ' + cc + ' × ' + cc / 2 + '.' : 'The whole area is 1. Subtract the left part: 1 − ' + cc * cc / 4 + '.'); desc = 'a triangle-shaped density curve from 0 to 2'; }
    return { tag: 'T7', pic: curveSvg(f, x0, x1, ymax, a, c, 'A density curve with the part from ' + a + ' to ' + c + ' shaded'),
      prompt: 'Pretend: this is ' + desc + '. What proportion of the values fall in the shaded part, from ' + a + ' to ' + c + '?', answer: ans,
      remember: 'Area under a density curve is a proportion. The total area is 1.', hint: 'Proportion = area of the shaded part. ' + how, nudge: 'The shaded area is the proportion. Find its width and height.',
      worked: how + ' Proportion = ' + r2(ans) + '.' };
  }

  /* ---------- T8: mean versus median from the shape ---------- */
  var T8SHAPES = {
    right: function (x) { return x > 0 ? (x / 1.5) * Math.exp(-x / 1.5) : 0; },
    left: function (x) { return x < 10 ? ((10 - x) / 1.5) * Math.exp(-(10 - x) / 1.5) : 0; },
    sym: function (x) { return Math.exp(-(x - 5) * (x - 5) / (2 * 1.3 * 1.3)); }
  };
  /* mean and median of a density on [0,10], computed numerically */
  function meanMedian(f) {
    var n = 2000, dx = 10 / n, tot = 0, m = 0, i, x; for (i = 0; i <= n; i++) { x = i * dx; tot += f(x) * dx; m += x * f(x) * dx; }
    var cum = 0, med = 0; for (i = 0; i <= n; i++) { x = i * dx; cum += f(x) * dx; if (cum >= tot / 2) { med = x; break; } }
    return { mean: m / tot, median: med };
  }
  function t8(b, r) {
    var kinds = b <= 1 ? ['right', 'sym'] : ['right', 'left', 'sym'], kind = pick(r, kinds), f = T8SHAPES[kind], mm = meanMedian(f), d = mm.mean - mm.median;
    var ans = Math.abs(d) < 0.01 ? 1 : d < 0 ? 0 : 2, X = function (v) { return 40 + v / 10 * 440; };
    var ctx = { right: 'a long tail on the right', left: 'a long tail on the left', sym: 'a tail on neither side' }[kind], what = pick(r, ['house prices', 'wait times', 'quiz scores', 'package weights']);
    var pic = curveSvg(f, 0, 10, kind === 'sym' ? 1.2 : 0.6, null, null, 'A density curve with ' + ctx);
    if (b <= 2) pic = pic.replace('</svg>', line(X(mm.median), 14, X(mm.median), 130, RED, 2.5, true) + txt(X(mm.median), 11, 'median', { fill: RED, bold: true, size: 12 }) + '</svg>');
    var ex = { 0: 'The tail pulls the mean toward the left, below the median.', 1: 'The curve is symmetric, so the mean and the median are equal.', 2: 'The tail pulls the mean toward the right, above the median.' }[ans];
    return { tag: 'T8', type: 'choice', pic: pic, prompt: 'Pretend ' + what + ' follow the density curve shown' + (b <= 2 ? '. The dashed line marks the median.' : '.') + ' How do the mean and the median compare?',
      options: ['The mean is less than the median.', 'The mean equals the median.', 'The mean is greater than the median.', 'Cannot tell from the shape.'], answer: ans,
      remember: 'The mean is pulled toward the long tail. The median is not.', hint: 'Find the long tail. The mean is pulled toward it. If there is no long tail, they match.', nudge: 'Which side has the long tail? The mean moves that way.', worked: ex };
  }

  /* ---------- T9: is a normal model reasonable? ---------- */
  var T9SHAPES = {
    normal: [[1, 3, 7, 12, 16, 12, 7, 3, 1], [2, 5, 9, 13, 15, 13, 9, 5, 2]],
    right: [[18, 22, 16, 10, 6, 4, 2, 1, 1], [20, 24, 14, 8, 5, 3, 2, 1, 1]],
    left: [[1, 1, 2, 4, 6, 10, 16, 22, 18], [1, 1, 2, 3, 5, 8, 14, 24, 20]],
    bimodal: [[3, 10, 14, 8, 3, 8, 14, 10, 3], [2, 9, 15, 7, 2, 7, 15, 9, 2]],
    outlier: [[1, 4, 9, 14, 16, 14, 9, 4, 1, 0, 0, 0, 1], [2, 5, 9, 13, 15, 13, 9, 5, 2, 0, 0, 0, 1]]
  };
  /* what a student should see: features computed from the bars */
  function classify(h) {
    var N = 0, m = 0, i; h.forEach(function (c, j) { N += c; m += c * j; }); m /= N;
    var v = 0, s3 = 0; h.forEach(function (c, j) { v += c * (j - m) * (j - m); }); v /= N; var sd = Math.sqrt(v); h.forEach(function (c, j) { s3 += c * Math.pow((j - m) / sd, 3); }); var skew = s3 / N;
    var run = 0, gap = false; for (i = 0; i < h.length; i++) { if (h[i] === 0) run++; else { if (run >= 2 && i > 0 && h.slice(0, i).some(function (x) { return x > 0; })) gap = true; run = 0; } }
    var peaks = 0, mx = Math.max.apply(null, h); for (i = 1; i < h.length - 1; i++) if (h[i] > h[i - 1] && h[i] >= h[i + 1] && h[i] >= 0.4 * mx) peaks++;
    if (gap) return 'outlier'; if (peaks >= 2) return 'bimodal'; if (skew > 0.5) return 'right'; if (skew < -0.5) return 'left'; return 'normal';
  }
  var T9OPT = { normal: 'Reasonable: one peak and roughly symmetric.', right: 'Shaky: skewed right.', left: 'Shaky: skewed left.', bimodal: 'Shaky: two peaks.', outlier: 'Shaky: an outlier far from the rest.' };
  var T9ORDER = ['normal', 'right', 'left', 'bimodal', 'outlier'];
  function t9(b, r) {
    var kinds = b <= 1 ? ['normal', 'right'] : b === 2 ? ['normal', 'right', 'bimodal'] : b === 3 ? ['normal', 'left', 'bimodal', 'outlier', 'right'] : ['right', 'left', 'bimodal', 'outlier'];
    var kind = pick(r, kinds), h = pick(r, T9SHAPES[kind]), got = classify(h), what = pick(r, ['heights in cm', 'commute times in minutes', 'test scores', 'reaction times']), n = h.length, w = 5, s0 = pick(r, [20, 40, 60]);
    var lo = s0, inner = bars(h, 40, 480, 120, 18, '#9db6ec', 3) + line(40, 120, 480, 120, INK, 1.5), cw = 440 / n;
    for (var i = 0; i < n; i += 2) inner += txt(40 + cw * i + cw / 2, 138, String(lo + i * w), { size: 11 });
    var pic = svg(520, 150, inner, 'A histogram of pretend ' + what), idx = T9ORDER.indexOf(got);
    var why = { normal: 'It has one peak and is roughly symmetric, so a normal model is reasonable.', right: 'It has a long tail on the right, so a normal model is shaky.', left: 'It has a long tail on the left, so a normal model is shaky.', bimodal: 'It has two peaks, so a normal model is shaky.', outlier: 'One bar sits far from the rest, an outlier, so a normal model is shaky.' }[got];
    if (b >= 4) return { tag: 'T9', type: 'choice', pic: pic, prompt: 'A normal model is shaky for these pretend ' + what + '. What makes it shaky?',
      options: ['Skewed right.', 'Skewed left.', 'Two peaks.', 'An outlier far from the rest.'], answer: ['right', 'left', 'bimodal', 'outlier'].indexOf(got),
      remember: 'A normal model needs one peak and symmetry, and no far outliers.', hint: 'Look for a long tail, two peaks, or a lonely bar far from the rest.', nudge: 'Is the shape lopsided, double-humped, or is one bar alone?', worked: why };
    return { tag: 'T9', type: 'choice', pic: pic, prompt: 'Is a normal model a reasonable fit for these pretend ' + what + '?',
      options: T9ORDER.map(function (k) { return T9OPT[k]; }), answer: idx,
      remember: 'A normal model needs one peak and symmetry, and no far outliers.', hint: 'Look for one peak, symmetry, and no bar far from the rest. If something is off, name it.', nudge: 'Check the peaks, the tails and any lonely bar.', worked: why };
  }


  /* ---------- interactive checkers (sims): one per target ----------
     Each returns { type:'custom', sim, params, prompt, answer, check(state, pick), solution, wrongState, follow, keyText, hint, nudge, remember, worked }.
     check() is pure: the page hands it the widget's state (and the follow-up pick) and shows its message on a miss. */
  function shuf(r, arr) { var a = arr.slice(), i, j, t; for (i = a.length - 1; i > 0; i--) { j = Math.floor(r() * (i + 1)); t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function follow(r, prompt, right, wrongs) { var all = shuf(r, [right].concat(wrongs)); return { prompt: prompt, options: all, answer: all.indexOf(right) }; }
  function both(chk, fol) { return function (st, pick) {
    var a = chk(st); if (!a.ok) return a;
    if (fol) { if (pick == null) return { ok: false, msg: 'That part is right. Now answer the question under the picture.' }; if (pick !== fol.answer) return { ok: false, msg: 'The picture part is right. Check the question under it again.' }; }
    return { ok: true, msg: '' }; }; }

  function s1(b, r) {   /* T1: drag the marker to a percentile */
    var n = b <= 1 ? 10 : b === 2 ? 20 : 25, k = INT(r, 2, n - 2), vals = [], v = 40, i, P;
    for (i = 0; i < n; i++) { v += 1 + INT(r, 0, 2); vals.push(v); }
    P = 100 * k / n;
    return { tag: 'T1', type: 'custom', sim: 'dotplot', params: { data: vals, start: vals[Math.floor(n / 2)] },
      prompt: 'Pretend quiz scores for ' + n + ' students are dots. Drag the marker so it is at the ' + P + 'th percentile, then press Check.', answer: P, unit: '%',
      check: function (st) { var pct = 100 * st.below / st.n; return Math.abs(pct - P) < 1e-9 ? { ok: true, msg: '' } : { ok: false, msg: 'Your marker has ' + st.below + ' of ' + st.n + ' dots below it: the ' + r2(pct) + 'th percentile. You need the ' + P + 'th.' }; },
      solution: { marker: vals[k] }, wrongState: { marker: vals[0] - 0.5 }, keyText: 'marker with ' + k + ' dots below it (' + P + 'th percentile)',
      remember: 'A percentile is the percent of values below.', hint: 'The ' + P + 'th percentile has ' + P + '% of the dots below it. ' + P + '% of ' + n + ' is ' + k + ', so put ' + k + ' dots below the marker.', nudge: 'Turn the percent into a number of dots out of ' + n + '.',
      worked: P + '% of ' + n + ' dots is ' + k + ' dots. With ' + k + ' dots below the marker, it sits at the ' + P + 'th percentile.' };
  }
  function s2(b, r) {   /* T2: slide the dot to a z-score */
    var sd = pick(r, b <= 1 ? [5, 10] : [4, 8]), mean = pick(r, [50, 60, 70, 80]), z = b <= 1 ? pick(r, [-2, -1, 1, 2]) : b === 2 ? pick(r, [0.5, 1.5, 2.5, -0.5]) : b === 3 ? pick(r, [-2.5, -1.5, -0.5, 1.5]) : pick(r, [-2.25, -1.75, -1.25, 1.25, 1.75, 2.25]), x = mean + z * sd;
    return { tag: 'T2', type: 'custom', sim: 'ruler', params: { mean: mean, sd: sd, start: mean, step: sd / 4 },
      prompt: 'Pretend test: mean ' + mean + ', SD ' + sd + '. Slide the dot to the score that has a z-score of ' + num(z) + ', then press Check.', answer: x,
      check: function (st) { return Math.abs(st.value - x) < 1e-9 ? { ok: true, msg: '' } : { ok: false, msg: 'Your dot is at ' + r2(st.value) + ', which is z = ' + num(r2(st.z)) + '. You need z = ' + num(z) + '.' }; },
      solution: { value: x }, wrongState: { value: mean }, keyText: 'dot at ' + r2(x),
      remember: 'z = (value − mean) ÷ SD. It counts SD steps from the mean.', hint: 'z = ' + num(z) + ' means ' + Math.abs(z) + ' SD ' + (z < 0 ? 'below' : 'above') + ' the mean. One SD is ' + sd + ' points.', nudge: 'Count SD steps from the mean. Which side?',
      worked: Math.abs(z) + ' SD × ' + sd + ' = ' + r2(Math.abs(z) * sd) + ' points ' + (z < 0 ? 'below' : 'above') + ' ' + mean + ' is ' + r2(x) + '.' };
  }
  function s3(b, r) {   /* T3: make test B exactly as unusual as test A */
    var pr = pick(r, PAIRS), A = { mean: pick(r, [60, 70, 80]), sd: pick(r, [5, 10]) }, B = { mean: pick(r, [50, 65, 75]), sd: pick(r, [4, 8]) }, za = pick(r, b <= 2 ? [1, 1.5, 2] : [-2, -1.5, -1, 1, 1.5, 2]);
    A.x = A.mean + za * A.sd; var zb = -za * (b >= 3 ? 1 : -1) * 0, target = Math.abs(za);
    return { tag: 'T3', type: 'custom', sim: 'ruler2', params: { A: A, B: B, nameA: pr[0], nameB: pr[1], start: B.mean, step: B.sd / 4 },
      prompt: 'Pretend scores: the ' + pr[0] + ' dot is fixed (mean ' + A.mean + ', SD ' + A.sd + '). Slide the ' + pr[1] + ' dot (mean ' + B.mean + ', SD ' + B.sd + ') so it is exactly as unusual, then press Check.', answer: target, unit: 'SD',
      check: function (st) { var z = Math.abs(st.value - B.mean) / B.sd; return Math.abs(z - target) < 1e-9 ? { ok: true, msg: '' } : { ok: false, msg: 'Your ' + pr[1] + ' dot is ' + r2(z) + ' SD from its mean. The ' + pr[0] + ' dot is ' + target + ' SD from its mean. They must match.' }; },
      solution: { value: B.mean + target * B.sd }, wrongState: { value: B.mean }, keyText: pr[1] + ' dot ' + target + ' SD from its mean (either side)',
      remember: 'Compare z-scores. The farther from 0, the more unusual.', hint: 'The ' + pr[0] + ' dot is ' + target + ' SD from its mean. Put the ' + pr[1] + ' dot ' + target + ' SD from its mean too, on either side.', nudge: 'Find how many SDs from its mean the fixed dot is.',
      worked: 'The ' + pr[0] + ' dot is ' + target + ' SD out, so the ' + pr[1] + ' dot goes ' + target + ' × ' + B.sd + ' = ' + r2(target * B.sd) + ' from ' + B.mean + '.' };
  }
  function s4(b, r) {   /* T4: slide a constant */
    var mean = pick(r, [60, 65, 70, 75]), sd = pick(r, [5, 8, 10]), c = pick(r, [-15, -10, -5, 5, 10, 15]), m2 = mean + c, fol = follow(r, 'After sliding, what happened to the SD?', 'It stayed ' + sd + '.', ['It went up by ' + Math.abs(c) + '.', 'It doubled.', 'It went down.']);
    return { tag: 'T4', type: 'custom', sim: 'transform', params: { mode: 'add', mean: mean, sd: sd, cMax: 20 }, follow: fol,
      prompt: 'Pretend scores have mean ' + mean + ' and SD ' + sd + '. Slide the constant to add so the new mean is ' + m2 + '. Then answer the question and press Check.', answer: c,
      check: both(function (st) { return st.c === c ? { ok: true } : { ok: false, msg: 'Your new mean is ' + st.mean + '. You need ' + m2 + '.' }; }, fol),
      solution: { c: c }, wrongState: { c: 0 }, keyText: 'constant ' + num(c) + '; SD stays ' + sd,
      remember: 'Adding a constant moves the center by that constant. The spread stays the same.', hint: 'The mean moves by the constant. To go from ' + mean + ' to ' + m2 + ', add ' + num(c) + '.', nudge: 'How far is it from ' + mean + ' to ' + m2 + '?',
      worked: mean + ' + ' + num(c) + ' = ' + m2 + '. Sliding the data does not change its spread: the SD is still ' + sd + '.' };
  }
  function s5(b, r) {   /* T5: slide a factor */
    var mean = pick(r, [4, 6, 8, 10]), sd = pick(r, [2, 4]), k = pick(r, [0.5, 1.5, 2, 3, 4]), sd2 = sd * k, fol = follow(r, 'After sliding, what happened to the mean?', 'It was multiplied by ' + k + ' too.', ['It stayed the same.', 'It went up by ' + k + '.', 'Cannot tell.']);
    return { tag: 'T5', type: 'custom', sim: 'transform', params: { mode: 'mul', mean: mean, sd: sd }, follow: fol,
      prompt: 'Pretend data have mean ' + mean + ' and SD ' + sd + '. Slide the factor to multiply by so the new SD is ' + sd2 + '. Then answer the question and press Check.', answer: k,
      check: both(function (st) { return st.k === k ? { ok: true } : { ok: false, msg: 'Your new SD is ' + r2(st.sd) + '. You need ' + sd2 + '.' }; }, fol),
      solution: { k: k }, wrongState: { k: 1 }, keyText: 'factor ' + k + '; mean becomes ' + mean * k,
      remember: 'Multiplying by k multiplies the center and the spread by k.', hint: 'The SD is multiplied by the factor. ' + sd + ' × ? = ' + sd2 + '.', nudge: 'What do you multiply ' + sd + ' by to get ' + sd2 + '?',
      worked: sd + ' × ' + k + ' = ' + sd2 + '. The mean is multiplied too: ' + mean + ' × ' + k + ' = ' + mean * k + '.' };
  }
  function s6(b, r) {   /* T6: standardize in two steps */
    var mean = pick(r, [60, 70, 80, 100]), sd = pick(r, [5, 8, 10]), fol = follow(r, 'The z-scores have…', 'mean 0 and SD 1.', ['mean 1 and SD 0.', 'mean 0 and the old SD of ' + sd + '.', 'the old mean of ' + mean + ' and SD 1.']);
    return { tag: 'T6', type: 'custom', sim: 'transform', params: { mode: 'z', mean: mean, sd: sd }, follow: fol,
      prompt: 'Pretend scores have mean ' + mean + ' and SD ' + sd + '. Turn them into z-scores: press "Subtract the mean", then "Divide by the SD". Then answer the question and press Check.', answer: 0,
      check: both(function (st) { return st.stage === 2 ? { ok: true } : { ok: false, msg: st.stage === 0 ? 'Press "Subtract the mean" first.' : 'Now press "Divide by the SD".' }; }, fol),
      solution: { stage: 2 }, wrongState: { stage: 0 }, keyText: 'press both buttons; z-scores have mean 0, SD 1',
      remember: 'Subtract the mean to center. Divide by the SD to rescale.', hint: 'A z-score is (value − mean) ÷ SD. Do the subtraction first, then the division. Watch the mean and SD in the readout.', nudge: 'Do the two steps of the z-score formula in order.',
      worked: 'Subtracting ' + mean + ' moves the center to 0. Dividing by ' + sd + ' makes the SD 1.' };
  }
  function s7(b, r) {   /* T7: shade a proportion on a density curve */
    var kind = b <= 2 ? 'rect' : pick(r, ['rect', 'tri']), D, a, c, T, params, pairs = [], x, y, L = pick(r, [5, 10]);
    D = kind === 'rect' ? NKDENS.rect(L) : NKDENS.tri();
    for (x = D.x0; x <= D.x1 + 1e-9; x += D.step) for (y = x + D.step; y <= D.x1 + 1e-9; y += D.step) { var ar = areaOf(D.f, x, y); if (ar >= 0.1 && ar <= 0.9) pairs.push([x, y, ar]); }
    var ch = pick(r, pairs); a = ch[0]; c = ch[1]; T = r4(ch[2]); params = { kind: kind, L: L };
    var fol = b >= 3 ? follow(r, 'What is the total area under the whole density curve?', '1', ['100', 'The height of the curve', 'It depends on the curve']) : null;
    return { tag: 'T7', type: 'custom', sim: 'density', params: params, follow: fol,
      prompt: 'Pretend values follow ' + (kind === 'rect' ? 'a flat density curve from 0 to ' + L : 'a triangle-shaped density curve from 0 to 2') + '. Drag the two edges so the shaded proportion is ' + T + (fol ? '. Then answer the question' : '') + ' and press Check.', answer: T,
      check: both(function (st) { return Math.abs(st.area - T) <= 0.004 ? { ok: true } : { ok: false, msg: 'Your shaded area is ' + r4(st.area) + '. You need ' + T + '.' }; }, fol),
      solution: { a: a, b: c }, wrongState: { a: D.x0, b: D.x0 }, keyText: 'edges at ' + a + ' and ' + c + ' (area ' + T + ')',
      remember: 'Area under a density curve is a proportion. The total area is 1.', hint: 'Watch the area readout as you drag. You need ' + T + '. ' + (kind === 'rect' ? 'The curve is flat, so area = width × ' + r2(1 / L) + '.' : 'Area on the left of x is x × x ÷ 4.'), nudge: 'Drag an edge and watch the area readout change.',
      worked: 'Shading from ' + a + ' to ' + c + ' gives an area of ' + T + ', so the proportion is ' + T + '.' };
  }
  function s8(b, r) {   /* T8: slide the tail until the mean is greater than, less than, or equal to the median */
    var want = pick(r, b <= 1 ? ['>', '<'] : ['>', '<', '=']), words = { '>': 'greater than', '<': 'less than', '=': 'equal to' }, sol = { '>': 1, '<': -1, '=': 0 }[want], fol = follow(r, 'Which way does the mean move compared with the median?', 'Toward the long tail.', ['Toward the peak.', 'It never moves.', 'Away from the long tail.']);
    return { tag: 'T8', type: 'custom', sim: 'skew', params: { s: 0.5 * (sol === 0 ? 1 : -sol) }, follow: fol,
      prompt: 'Pretend data follow the density curve shown. Slide the tail until the mean is ' + words[want] + ' the median. Then answer the question and press Check.', answer: sol,
      check: both(function (st) { return st.rel === want ? { ok: true } : { ok: false, msg: 'Right now the mean is ' + ({ '>': 'greater than', '<': 'less than', '=': 'equal to' })[st.rel] + ' the median. You need it ' + words[want] + '.' }; }, fol),
      solution: { s: sol }, wrongState: { s: sol === 0 ? 1 : 0 }, keyText: 'tail ' + (sol > 0 ? 'right' : sol < 0 ? 'left' : 'none') + ' (mean ' + want + ' median)',
      remember: 'The mean is pulled toward the long tail. The median is not.', hint: want === '=' ? 'With no long tail the curve is symmetric, so the mean and median match.' : 'The mean is pulled toward the long tail. For the mean ' + words[want] + ' the median, put the tail on the ' + (want === '>' ? 'right' : 'left') + '.', nudge: 'Which side must the tail be on?',
      worked: want === '=' ? 'No long tail: symmetric, so the mean equals the median.' : 'A long tail on the ' + (want === '>' ? 'right' : 'left') + ' pulls the mean ' + (want === '>' ? 'above' : 'below') + ' the median.' };
  }
  function s9(b, r) {   /* T9: switch on a normal curve, then say whether it fits */
    var kinds = b <= 1 ? ['normal', 'right'] : b === 2 ? ['normal', 'right', 'bimodal'] : ['normal', 'left', 'bimodal', 'outlier', 'right'], kind = pick(r, kinds), h = pick(r, T9SHAPES[kind]), got = classify(h), idx = T9ORDER.indexOf(got), what = pick(r, ['heights in cm', 'commute times in minutes', 'test scores', 'reaction times']);
    var fol = { prompt: 'Is a normal model a reasonable fit for these pretend ' + what + '?', options: T9ORDER.map(function (k) { return T9OPT[k]; }), answer: idx };
    return { tag: 'T9', type: 'custom', sim: 'fit', params: { bars: h, start: pick(r, [20, 40, 60]), width: 5, label: what }, follow: fol,
      prompt: 'Pretend ' + what + ' are shown. Press the button to lay a normal curve with the same mean and SD over the bars, look, then answer the question and press Check.', answer: idx,
      check: function (st, pick_) { if (!st.ever) return { ok: false, msg: 'Press the button to show the normal curve first.' }; if (pick_ == null) return { ok: false, msg: 'Now answer the question under the picture.' }; return pick_ === idx ? { ok: true } : { ok: false, msg: 'Look at where the bars leave the curve: peaks, tails, and any lonely bar.' }; },
      solution: { ever: true }, wrongState: { ever: false }, keyText: T9OPT[got],
      remember: 'A normal model needs one peak and symmetry, and no far outliers.', hint: 'Where do the bars and the curve disagree? A long tail, two peaks, or a far bar means a normal model is shaky.', nudge: 'Compare the bars to the curve. Where do they disagree?',
      worked: { normal: 'The bars follow the curve: one peak, symmetric.', right: 'The bars have a long right tail the curve does not.', left: 'The bars have a long left tail the curve does not.', bimodal: 'The bars have two peaks; the curve has one.', outlier: 'One bar sits far from the rest; the curve misses it.' }[got] };
  }
  var NKDENS = {
    rect: function (L) { return { f: function (x) { return x >= 0 && x <= L ? 1 / L : 0; }, x0: 0, x1: L, step: L <= 5 ? 0.5 : 1 }; },
    tri: function () { return { f: function (x) { return x >= 0 && x <= 2 ? x / 2 : 0; }, x0: 0, x1: 2, step: 0.25 }; }
  };
  var areaOf = function (f, a, b) { return area(f, a, b, 2000); };
  var r4 = function (x) { return Math.round(x * 10000) / 10000; };

  /* ---------- fading hints ---------- */
  /* The page asks for the full question; fade() decides what help comes with it.
       band 1  a "Remember" line up front, full hint after a miss
       band 2  full hint after a miss
       band 3  a one-line nudge after the first miss, the full hint after the second
       band 4  nothing after the first miss, the full hint after the second */
  function fade(q, band) {
    var full = q.hint, nudge = q.nudge || 'Look at the picture again.', root_ = typeof window !== 'undefined' ? window : null;
    if (band >= 2) q.remember = '';
    if (q.type === 'custom') { q.fadeBand = band; q.fullHint = full; return q; }   // a sim shows its own state; the content file fades the hint by miss count
    if (q.type === 'choice') { if (band === 3) q.hint = nudge; if (band >= 4) q.noHint = true; }
    else if (band >= 3) {
      q.hint = '';
      q.near = function () { var st = root_ && root_.LE && root_.LE.qs(q.id), m = st ? st.misses : 1; return m >= 2 ? full : (band === 3 ? nudge : ''); };
    }
    q.fadeBand = band; q.fullHint = full; return q;
  }

  /* a skill generator: gen(band, rng) is the static item; gen(band, rng, { sim: true }) is the interactive checker */
  function V(stat, sim) { return function (b, r, o) { return o && o.sim ? sim(b, r) : stat(b, r); }; }
  var SKILLS = [
    { id: 'T1', title: 'T1 Percentiles', gen: V(t1, s1) }, { id: 'T2', title: 'T2 z-scores', gen: V(t2, s2) }, { id: 'T3', title: 'T3 Compare two values', gen: V(t3, s3) },
    { id: 'T4', title: 'T4 Add a constant', gen: V(t4, s4) }, { id: 'T5', title: 'T5 Multiply by a constant', gen: V(t5, s5) }, { id: 'T6', title: 'T6 z-scores: mean 0, SD 1', gen: V(t6, s6) },
    { id: 'T7', title: 'T7 Density curve area', gen: V(t7, s7) }, { id: 'T8', title: 'T8 Mean versus median', gen: V(t8, s8) }, { id: 'T9', title: 'T9 Is a normal model reasonable?', gen: V(t9, s9) }
  ];

  var SPEC = {
    id: 'unit-3-review-1-3', course: 'stats', unit: 'Unit 3 · The Normal Distribution', title: 'Review: 3.1 to 3.3',
    question: 'What do you already know from 3.1 to 3.3?',
    targets: [
      'I can find a value’s percentile and say what it means in context.',
      'I can calculate a z-score and say how many SDs a value is from the mean, and in which direction.',
      'I can use z-scores to decide which of two values is more unusual.',
      'I can say what happens to shape, center and spread when a constant is added.',
      'I can say what happens to shape, center and spread when values are multiplied or divided.',
      'I can state the mean and SD of a distribution of z-scores, and why.',
      'I can draw a density curve and find a proportion as an area.',
      'I can use the shape of a density curve to compare the mean and the median.',
      'I can say whether a normal model is a reasonable fit, and name what makes it shaky.'
    ],
    tabs: ['Warm-up', 'Practice', 'Wrap-up'],
    /* the six warm-up items: three from block A (3.1 and 3.2), three from block B (3.3) */
    warm: ['T1', 'T2', 'T4', 'T7', 'T8', 'T9'],
    blocks: { A: ['T1', 'T2', 'T3', 'T4', 'T5', 'T6'], B: ['T7', 'T8', 'T9'] },
    concepts: [
      { title: 'Percentile', points: ['The percent of values below it.', 'It says where a value stands in the group.'], eq: '(values below ÷ total) × 100' },
      { title: 'z-score', points: ['Counts SD steps from the mean.', 'Positive is above the mean. Negative is below.'], eq: 'z = (value − mean) / SD' },
      { title: 'More unusual', points: ['Compare z-scores, not raw scores.', 'The farther z is from 0, the more unusual.'], eq: 'bigger |z| = more unusual' },
      { title: 'Add a constant', points: ['The center moves by the constant.', 'Spread and shape do not change.'], eq: 'new mean = mean + c · SD same' },
      { title: 'Multiply by a constant', points: ['Center and spread both multiply.', 'Shape does not change.'], eq: 'new mean = k · mean · new SD = |k| · SD' },
      { title: 'z-scores of a data set', points: ['Subtract the mean to center at 0.', 'Divide by the SD to make the spread 1.'], eq: 'mean 0 · SD 1' },
      { title: 'Density curve', points: ['Stays on or above the axis.', 'Total area is 1. Area is a proportion.'], eq: 'area = proportion' },
      { title: 'Mean and median', points: ['The mean is pulled toward the long tail.', 'Symmetric: they match.'], eq: 'skewed right: mean > median' },
      { title: 'Is a normal model reasonable?', points: ['One peak and symmetric: yes.', 'Skew, two peaks or an outlier: shaky.'], eq: 'peak · symmetry · no outliers' }
    ],
    misconceptions: [
      { say: 'A percentile is the points you earned.', fix: 'It is the percent of values below yours.' },
      { say: 'A negative z-score is a mistake.', fix: 'Negative means below the mean.' },
      { say: 'The higher raw score is more unusual.', fix: 'Compare z-scores: the one farther from 0 is more unusual.' },
      { say: 'Adding 5 to every score makes the SD bigger.', fix: 'Adding slides the picture. Spread does not change.' },
      { say: 'The mean of z-scores depends on the data.', fix: 'It is always 0, with SD 1.' },
      { say: 'The mean is always at the peak.', fix: 'A long tail pulls the mean toward it.' }
    ],
    skills: SKILLS,
    fade: fade,
    /* pacing: the whole period is practice; start, warm-up and wrap-up never trim, practice shrinks to 8 of 12 items when the class runs behind */
    pacing: { budgetMin: 42,
      steps: [{ id: 'start', prio: 1, min: 2 }, { id: 'warmup', prio: 1, min: 6 }, { id: 'practice', prio: 2, min: 30, minItems: 8, parts: 12 }, { id: 'notes', prio: 1, min: 4 }],
      huddles: [] },
    helpers: { NKDENS: NKDENS, area: area, meanMedian: meanMedian, classify: classify, T9SHAPES: T9SHAPES, T8SHAPES: T8SHAPES, DENS: DENS }
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = SPEC; else (root.SPECS = root.SPECS || {})[SPEC.id] = SPEC;
})(typeof window !== 'undefined' ? window : globalThis);
