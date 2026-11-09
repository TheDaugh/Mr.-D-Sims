/* SPEC (calculus 4.3): the lesson page, the key PDFs and the unit tests all read this one file.
   Self-paced (selfPaced: true), the same shape as 3.3 to 3.5: no clock, no trimming, no skipping, no end mark, no stamp. Progress saves on the device.
   Math is written the way qkit writes it: $x^2$ in prompts. Huddle text is plain text (no $ math).
   Every skill item carries the data its test needs, so tests/unit/rates-other.test.js can check it without using the lesson's rules:
     avg    data.x/y and i, j (a table), or data.f0 .. (two values), or data.js with a and b (a formula): the answer is (f(b) − f(a)) / (b − a).
     inst   data.js and a: the answer is a numeric derivative.
     shape  data.fp and data.fpp (the signs, or the numbers they come from): the right option is recomputed from the two signs.
     say    data.say or data.write: the right option is recomputed from the context, the endpoints and the average rate. */
(function (root) {
  'use strict';
  var INT = function (r, a, b) { return a + Math.floor(r() * (b - a + 1)); };
  var pick = function (r, arr) { return arr[Math.floor(r() * arr.length)]; };
  var shuffle = function (r, arr) { var a = arr.slice(), i, j, t; for (i = a.length - 1; i > 0; i--) { j = Math.floor(r() * (i + 1)); t = a[i]; a[i] = a[j]; a[j] = t; } return a; };
  var rnd = function (v, d) { return +v.toFixed(d == null ? 6 : d); };
  function mix(r, opts) { var order = shuffle(r, opts.map(function (_, i) { return i; })); return { options: order.map(function (i) { return opts[i]; }), answer: order.indexOf(0) }; }

  /* contexts other than motion. f the function letter, x the variable, line the defining sentence, y the units of f, xu/xs the units of x (plural, singular),
     noun what f measures, up/down the verbs for an increase and a decrease, y0 a sensible starting value, falls true when the quantity usually decreases */
  var CTX = [
    { f: 'N', x: 't', line: '$N(t)$ is the number of bacteria, in thousands, in a dish $t$ hours after noon.', y: 'thousand bacteria', xu: 'hours', xs: 'hour', noun: 'the number of bacteria', up: 'rose', down: 'fell', y0: [20, 80] },
    { f: 'B', x: 't', line: '$B(t)$ is the balance, in dollars, of a savings account $t$ years after it was opened.', y: 'dollars', xu: 'years', xs: 'year', noun: 'the balance', up: 'rose', down: 'fell', y0: [200, 900] },
    { f: 'P', x: 't', line: '$P(t)$ is the population of a city, in thousands, $t$ years after 2000.', y: 'thousand people', xu: 'years', xs: 'year', noun: 'the population', up: 'grew', down: 'shrank', y0: [100, 400] },
    { f: 'E', x: 't', line: '$E(t)$ is the percent charge of a phone battery $t$ hours after it is unplugged.', y: 'percent', xu: 'hours', xs: 'hour', noun: 'the charge', up: 'rose', down: 'fell', y0: [60, 100], falls: true },
    { f: 'S', x: 'd', line: '$S(d)$ is the depth, in inches, of the snow on the ground $d$ days after a storm.', y: 'inches', xu: 'days', xs: 'day', noun: 'the snow depth', up: 'rose', down: 'fell', y0: [20, 40], falls: true }
  ];

  function polyIn(c, v, tex) {
    var out = '', i, k, a, t;
    for (i = c.length - 1; i >= 0; i--) { k = c[i]; if (!k) continue; a = Math.abs(k);
      t = i === 0 ? String(a) : (a === 1 ? '' : String(a)) + (i === 1 ? v : (tex ? v + '^{' + i + '}' : v + '^' + i));
      out += (out ? (k < 0 ? '-' : '+') : (k < 0 ? '-' : '')) + t; }
    return out || '0';
  }
  var dpoly = function (c) { return c.slice(1).map(function (k, i) { return k * (i + 1); }); };
  var evalPoly = function (c, x) { var s = 0, i; for (i = c.length - 1; i >= 0; i--) s = s * x + c[i]; return s; };
  var jsPoly = function (c) { return c.map(function (k, i) { return k ? k + '*Math.pow(x,' + i + ')' : null; }).filter(Boolean).join('+') || '0'; };
  var sgn = function (v) { return v > 0 ? 1 : v < 0 ? -1 : 0; };
  var base = function (r, c) { return c.y0[0] >= 100 || c.y0[1] >= 100 ? INT(r, c.y0[0] / 10, c.y0[1] / 10) * 10 : INT(r, c.y0[0], c.y0[1]); };
  var SHAPE = ['increasing, and the rate is getting bigger', 'increasing, but the rate is getting smaller', 'decreasing, and it is falling faster and faster', 'decreasing, but it is falling more and more slowly'];
  var shapeIndex = function (fp, fpp) { return fp > 0 ? (fpp > 0 ? 0 : 1) : (fpp < 0 ? 2 : 3); };

  var SPEC = {
    id: '4-3-rates-other', course: 'calc', unit: 'Unit 4 · Contextual Applications of Differentiation', title: '4.3 Rates of Change in Other Contexts',
    selfPaced: true,
    question: 'How do average rates and instant rates work for things that are not moving objects?',
    targets: ['I can find an average rate of change from a table or a formula.', 'I can tell an average rate from a rate at one moment.', 'I can use f′ and f″ to say how a quantity is changing.'],
    tabs: ['Warm-up', 'Predict', 'Explore', 'Notes', 'Build', 'Practice', 'Check'],
    exploreTarget: 'I can compare average rates with the rate right now.',
    huddleTarget: 'I can write what each kind of rate means.',
    buildTarget: 'I can find rates and say what they mean.',

    concepts: [
      { title: 'Average rate of change', points: ['Change in f divided by change in x over an interval.', 'It is the slope of the secant line through the two ends.'], eq: '(f(b) − f(a)) / (b − a)' },
      { title: 'Rate at one moment', points: ['The derivative f′(a) is the rate at one instant.', 'It is the slope of the tangent line at x = a.'], eq: 'f′(a)' },
      { title: 'Units', points: ['Both kinds of rate have units of f per unit of x.', 'Say "per hour", "per year" and so on.'], eq: 'units of f per unit of x' },
      { title: 'The rate of the rate', points: ['f″ says whether the rate f′ is getting bigger or smaller.', 'f′ > 0 and f″ < 0: still rising, but more and more slowly.'], eq: 'f″ = (f′)′' }
    ],

    huddle: {
      defs: [
        { term: 'Average rate of change', text: 'From x = a to x = b: [[change in f]] divided by [[change in x]]. It is the slope of the secant line.' },
        { term: 'Rate at one moment', text: 'f′(a) is the rate at one [[instant]]. It is the slope of the [[tangent]] line.' },
        { term: 'Units', text: 'Both rates have units of f [[per]] unit of x, like "thousand bacteria per hour".' },
        { term: 'The rate of the rate', text: 'If f″ > 0 the rate is getting [[bigger]]. If f″ < 0 the rate is getting [[smaller]].' }
      ],
      example: { prompt: 'N(t) = −t² + 12t + 20 thousand bacteria, t in hours. Find the average rate from t = 2 to t = 6, and the rate at t = 2.',
        steps: ['N(2) = 40 and N(6) = [[56]]', 'Average rate = (56 − 40) / 4 = [[4]] thousand per hour', 'N′(t) = −2t + [[12]]', 'Rate at t = 2: N′(2) = [[8]] thousand per hour'] },
      label: { title: 'Label the picture', html: null,
        tags: [{ n: 1, text: 'The red tangent line: its slope is the [[instantaneous]] rate.' }, { n: 2, text: 'The orange secant line: its slope is the [[average]] rate.' }, { n: 3, text: 'The two points mark the [[ends]] of the interval.' }] }
    },

    /* three easy review items from earlier lessons */
    review: [
      { id: 'R1', title: 'Review 1', prompt: 'The slope of the line through $(2,5)$ and $(6,13)$ is…', options: ['2', '8', '4', '1/2'], answer: 0, why: 'Rise over run: $\\dfrac{13-5}{6-2}=2$.' },
      { id: 'R2', title: 'Review 2', prompt: 'The derivative of $2x^2+5x$ is…', options: ['4x + 5', '2x + 5', '4x² + 5', '4x'], answer: 0, why: 'Power rule: $2x^2$ gives $4x$, and $5x$ gives $5$.' },
      { id: 'R3', title: 'Review 3', prompt: 'The second derivative of $x^3$ is…', options: ['6x', '3x²', '6', 'x'], answer: 0, why: 'First $3x^2$, then $6x$.' }
    ],

    predicts: [
      { id: 'P1', title: 'An average rate', prompt: 'A savings account holds $200 after 2 years and $260 after 5 years. On average, it grew by…', options: ['20 dollars per year', '60 dollars per year', '52 dollars per year', '30 dollars per year'], answer: 0, why: 'Change over time: $\\dfrac{260-200}{5-2}=20$ dollars per year.' },
      { id: 'P2', title: 'Average and instant', prompt: 'Is the average rate of change over an interval always the same as the rate at one moment inside it?', options: ['No: the rate can change inside the interval', 'Yes, always', 'Yes, but only for money', 'No: they are never equal'], answer: 0, why: 'On a straight line they match. On a curve the rate changes, so an average can differ from the rate at one moment.' }
    ],
    observe: [
      { id: 'O1', prompt: 'In Station 1, as the width of the interval got smaller, the average rate got…', options: ['closer to the rate at the start', 'farther from the rate at the start', 'smaller than zero', 'bigger every time'], answer: 0, why: 'A tiny interval is almost one moment, so the secant almost matches the tangent.' },
      { id: 'O2', prompt: 'In Station 2, when the growth rate was at its biggest, the number of bacteria was about…', options: ['50 thousand', '0', '100 thousand', '25 thousand'], answer: 0, why: 'The growth is fastest at the halfway point, near 50 thousand.' }
    ],
    exploreIds: ['X1', 'X2', 'X3', 'X4'],

    /* the mid-lesson check: after the notes, before the problems */
    mid: [
      { id: 'M1', title: 'Check 1', prompt: 'A phone battery has $E\'(3)=-12$ and $E\'\'(3)=4$ at 3 hours. The charge is…', options: ['falling, but more and more slowly', 'rising faster and faster', 'falling faster and faster', 'rising more and more slowly'], answer: 0, why: '$E\'<0$ means falling. $E\'\'>0$ means $E\'$ is getting bigger (closer to zero), so the fall slows.' },
      { id: 'M2', title: 'Check 2', prompt: '$N(2)=10$ and $N(6)=30$. The average rate of change from 2 to 6 is…', options: ['5', '20', '4', '10'], answer: 0, why: '$\\dfrac{30-10}{6-2}=5$.' }
    ],

    skills: [
      /* avg: an average rate of change, a number. Band 1 two values, band 2 a table, band 3 a formula. */
      { id: 'avg', title: 'Average rate of change', gen: function (b, r) {
        b = Math.min(b, 3);
        var c = pick(r, CTX), x1, dx, y1, slope, y2, x, y, i, k, cf, A, Bb, ans, t, tab, pic, tries, sign = c.falls ? -1 : (c.y0[0] >= 100 && r() < 0.3 ? -1 : 1);
        if (b <= 1) { x1 = INT(r, 0, 4); dx = pick(r, [2, 3, 4, 5]); y1 = base(r, c); slope = c.falls ? -INT(r, 1, 3) : INT(r, 2, 9); y2 = y1 + slope * dx;
          return { type: 'num', tol: 0, abs: 0.001, data: { x1: x1, x2: x1 + dx, y1: y1, y2: y2 }, prompt: c.line + ' You know $' + c.f + '(' + x1 + ')=' + y1 + '$ and $' + c.f + '(' + (x1 + dx) + ')=' + y2 + '$. Find the average rate of change of $' + c.f + '$ from $' + c.x + '=' + x1 + '$ to $' + c.x + '=' + (x1 + dx) + '$.', answer: slope, unit: c.y + ' per ' + c.xs,
            hint: 'Step card: average rate = change in output ÷ change in input. Step 1: the change in $' + c.f + '$. Step 2: the change in $' + c.x + '$. Step 3: divide. First step: the change in $' + c.f + '$ is $' + y2 + '-' + y1 + '=' + (y2 - y1) + '$. Same move: from 10 to 30 over 4 hours is $\\dfrac{30-10}{4}=5$ per hour.',
            worked: '$\\dfrac{' + y2 + '-' + y1 + '}{' + (x1 + dx) + '-' + x1 + '}=\\dfrac{' + (y2 - y1) + '}{' + dx + '}=' + slope + '$ ' + c.y + ' per ' + c.xs + '.' }; }
        if (b === 2) { x1 = INT(r, 0, 3); dx = pick(r, [1, 2]); x = [x1, x1 + dx, x1 + 2 * dx, x1 + 3 * dx]; y = [base(r, c)];
          for (i = 1; i < 4; i++) y.push(y[i - 1] + sign * (c.falls ? INT(r, 1, 3) : INT(r, 2, 9)) * dx);
          i = pick(r, [0, 1]); k = i + 2; ans = rnd((y[k] - y[i]) / (x[k] - x[i]));
          tab = '<table class="qtab"><tr><th>' + c.x + '</th><td>' + x.join('</td><td>') + '</td></tr><tr><th>' + c.f + '(' + c.x + ')</th><td>' + y.join('</td><td>') + '</td></tr></table>';
          return { type: 'num', tol: 0, abs: 0.001, pic: tab, data: { x: x, y: y, i: i, j: k }, prompt: c.line + ' The table gives some values. Find the average rate of change of $' + c.f + '$ from $' + c.x + '=' + x[i] + '$ to $' + c.x + '=' + x[k] + '$.', answer: ans, unit: c.y + ' per ' + c.xs,
            hint: 'Step card: use only the two ends of the interval, not the value in the middle. Step 1: read $' + c.f + '(' + x[i] + ')$ and $' + c.f + '(' + x[k] + ')$ from the table. Step 2: divide the change by the width. First step: $' + c.f + '(' + x[i] + ')=' + y[i] + '$ and $' + c.f + '(' + x[k] + ')=' + y[k] + '$. Same move: from $(1, 10)$ to $(5, 30)$ is $\\dfrac{20}{4}=5$.',
            worked: '$\\dfrac{' + y[k] + '-' + y[i] + '}{' + x[k] + '-' + x[i] + '}=\\dfrac{' + (y[k] - y[i]) + '}{' + (x[k] - x[i]) + '}=' + ans + '$.' }; }
        for (tries = 0; tries < 60; tries++) {
          cf = [INT(r, 10, 60), INT(r, 2, 15), INT(r, -2, 2), INT(r, -1, 1)]; A = INT(r, 0, 3); Bb = A + pick(r, [2, 3, 4]);
          ans = (evalPoly(cf, Bb) - evalPoly(cf, A)) / (Bb - A); if (Math.abs(ans - Math.round(ans * 2) / 2) < 1e-9 && evalPoly(cf, A) > 0 && evalPoly(cf, Bb) > 0) break; }
        return { type: 'num', tol: 0, abs: 0.001, data: { js: jsPoly(cf), a: A, b: Bb }, prompt: '$' + c.f + '(' + c.x + ')=' + polyIn(cf, c.x, true) + '$ is ' + c.line.replace(/^\$[^$]+\$ is /, '') + ' Find the average rate of change of $' + c.f + '$ from $' + c.x + '=' + A + '$ to $' + c.x + '=' + Bb + '$.', answer: ans, unit: c.y + ' per ' + c.xs,
          hint: 'Step card: (1) find $' + c.f + '(' + A + ')$, (2) find $' + c.f + '(' + Bb + ')$, (3) divide the change by ' + (Bb - A) + '. This is NOT a derivative. First step: $' + c.f + '(' + A + ')=' + evalPoly(cf, A) + '$. Same move: if $f(1)=12$ and $f(4)=30$, the average rate is $\\dfrac{18}{3}=6$.',
          worked: '$' + c.f + '(' + A + ')=' + evalPoly(cf, A) + '$ and $' + c.f + '(' + Bb + ')=' + evalPoly(cf, Bb) + '$. So $\\dfrac{' + evalPoly(cf, Bb) + '-' + evalPoly(cf, A) + '}{' + (Bb - A) + '}=' + ans + '$.' };
      } },

      /* inst: the rate at one moment, a number. Band 1 cube and square, band 2 circle and sphere (π), band 3 decay and cooling. */
      { id: 'inst', title: 'Rate at one moment', gen: function (b, r) {
        b = Math.min(b, 3);
        var a, ans, js, line, label, unit, d1, ex = 'for the area $A=\\pi r^2$ of a circle: $A\'(r)=2\\pi r$, so $A\'(1)\\approx6.28$.', K, T0, tt;
        if (b <= 1) {
          if (r() < 0.5) { a = INT(r, 2, 8); ans = 3 * a * a; js = 'x*x*x'; line = 'A cube has side $s$ inches. Its volume is $V(s)=s^3$ cubic inches.'; label = 'V\'(' + a + ')'; unit = 'cubic inches per inch'; d1 = 'V\'(s)=3s^2'; ex = 'for a square, $A(s)=s^2$ has $A\'(s)=2s$, so $A\'(5)=10$.'; }
          else { a = INT(r, 3, 12); ans = 2 * a; js = 'x*x'; line = 'A square has side $s$ inches. Its area is $A(s)=s^2$ square inches.'; label = 'A\'(' + a + ')'; unit = 'square inches per inch'; d1 = 'A\'(s)=2s'; ex = 'for a cube, $V(s)=s^3$ has $V\'(s)=3s^2$, so $V\'(2)=12$.'; }
          return { type: 'num', tol: 0, abs: 0.001, data: { js: js, a: a }, prompt: line + ' Find $' + label + '$: how fast does it change per inch of side when the side is ' + a + ' inches?', answer: ans, unit: unit,
            hint: 'Step card: differentiate first, write the new function in full, then put in the side. First step: $' + d1 + '$. Same move on another example: ' + ex, worked: '$' + d1 + '$. Putting in ' + a + ' gives $' + ans + '$ ' + unit + '.' };
        }
        if (b === 2) {
          if (r() < 0.5) { a = INT(r, 1, 6); ans = rnd(2 * Math.PI * a, 2); js = 'Math.PI*x*x'; line = 'A circle has radius $r$ inches. Its area is $A(r)=\\pi r^2$ square inches.'; label = 'A\'(' + a + ')'; unit = 'square inches per inch'; d1 = 'A\'(r)=2\\pi r'; ex = 'for a sphere, $V(r)=\\tfrac43\\pi r^3$ has $V\'(r)=4\\pi r^2$, so $V\'(1)\\approx12.57$.'; }
          else { a = INT(r, 1, 5); ans = rnd(4 * Math.PI * a * a, 2); js = '(4/3)*Math.PI*x*x*x'; line = 'A sphere has radius $r$ inches. Its volume is $V(r)=\\tfrac43\\pi r^3$ cubic inches.'; label = 'V\'(' + a + ')'; unit = 'cubic inches per inch'; d1 = 'V\'(r)=4\\pi r^2'; ex = 'for a circle, $A(r)=\\pi r^2$ has $A\'(r)=2\\pi r$, so $A\'(1)\\approx6.28$.'; }
          return { type: 'num', tol: 0.005, data: { js: js, a: a }, prompt: line + ' Find $' + label + '$ and give your answer to 2 decimal places.', answer: ans, unit: unit,
            hint: 'Step card: differentiate first (the $\\pi$ stays), then put in the radius and use a calculator. First step: $' + d1 + '$. Same move on another example: ' + ex, worked: '$' + d1 + '$. At ' + a + ' inches this is about $' + ans + '$ ' + unit + '.' };
        }
        if (r() < 0.5) { K = pick(r, [1, 2]) / 10; T0 = pick(r, [60, 80, 90]); tt = pick(r, [0, 5, 10, 20]); ans = rnd(-T0 * K * Math.exp(-K * tt), 3); js = '20+' + T0 + '*Math.exp(-' + K + '*x)'; line = 'A cup of hot water cools in a room. Its temperature is $T(t)=20+' + T0 + 'e^{-' + K + 't}$ degrees Celsius after $t$ minutes.'; label = 'T\'(' + tt + ')'; unit = 'degrees per minute'; d1 = 'T\'(t)=-' + rnd(T0 * K, 3) + 'e^{-' + K + 't}'; a = tt; ex = 'for $T=20+50e^{-0.1t}$: $T\'=-5e^{-0.1t}$, so $T\'(0)=-5$.'; }
        else { K = pick(r, [1, 2, 3]) / 10; T0 = pick(r, [40, 50, 100]); tt = pick(r, [0, 5, 10]); ans = rnd(-T0 * K * Math.exp(-K * tt), 3); js = T0 + '*Math.exp(-' + K + '*x)'; line = 'The amount of a medicine in the blood is $C(t)=' + T0 + 'e^{-' + K + 't}$ milligrams after $t$ hours.'; label = 'C\'(' + tt + ')'; unit = 'milligrams per hour'; d1 = 'C\'(t)=-' + rnd(T0 * K, 3) + 'e^{-' + K + 't}'; a = tt; ex = 'for $C=30e^{-0.1t}$: $C\'=-3e^{-0.1t}$, so $C\'(0)=-3$.'; }
        return { type: 'num', tol: 0.01, data: { js: js, a: a }, prompt: line + ' Find $' + label + '$ to 2 decimal places. The answer is negative: the quantity is falling.', answer: ans, unit: unit,
          hint: 'Step card: the chain rule brings down the number in the exponent. Differentiate, then put in the time. First step: $' + d1 + '$. Same move on another example: ' + ex, worked: '$' + d1 + '$. At that time it is about $' + ans + '$ ' + unit + '.' };
      } },

      /* shape: what f′ and f″ say together. Band 1 gives the two numbers, band 2 a formula, band 3 two values of f′. */
      { id: 'shape', title: 'How is it changing?', gen: function (b, r) {
        b = Math.min(b, 3);
        var c = pick(r, CTX), fp, fpp, k, cf, p, ans, data, lead, hint, worked, t, v1, v2, t1, t2;
        if (b <= 1) { fp = pick(r, [-9, -6, -4, 3, 5, 8]); fpp = pick(r, [-5, -3, -2, 2, 4]); ans = shapeIndex(fp, fpp); data = { fp: fp, fpp: fpp }; p = INT(r, 2, 8);
          lead = c.line + ' At $' + c.x + '=' + p + '$ we know $' + c.f + '\'(' + p + ')=' + fp + '$ and $' + c.f + '\'\'(' + p + ')=' + fpp + '$. What is happening to ' + c.noun + '?';
          hint = 'Step card: two signs tell the story. The sign of $' + c.f + '\'$ says increasing or decreasing. The sign of $' + c.f + '\'\'$ says whether that rate is getting bigger (positive) or smaller (negative). First step: $' + c.f + '\'$ is ' + (fp > 0 ? 'positive' : 'negative') + ' and $' + c.f + '\'\'$ is ' + (fpp > 0 ? 'positive' : 'negative') + '. Same move: $f\'=-4$ and $f\'\'=-1$ means decreasing, and falling faster and faster.';
          worked = '$' + c.f + '\'$ is ' + (fp > 0 ? 'positive' : 'negative') + ', so ' + c.noun + ' is ' + (fp > 0 ? 'increasing' : 'decreasing') + '. $' + c.f + '\'\'$ is ' + (fpp > 0 ? 'positive' : 'negative') + ', so the rate is getting ' + (fpp > 0 ? 'bigger' : 'smaller') + '.'; }
        else if (b === 2) { for (k = 0; k < 80; k++) { cf = [INT(r, 10, 60), INT(r, -12, 12), INT(r, -4, 4), INT(r, -2, 2)]; p = INT(r, 1, 5); fp = evalPoly(dpoly(cf), p); fpp = evalPoly(dpoly(dpoly(cf)), p); if (fp !== 0 && fpp !== 0) break; }
          ans = shapeIndex(fp, fpp); data = { js: jsPoly(cf), a: p };
          lead = '$' + c.f + '(' + c.x + ')=' + polyIn(cf, c.x, true) + '$ is ' + c.line.replace(/^\$[^$]+\$ is /, '') + ' At $' + c.x + '=' + p + '$, what is happening to ' + c.noun + '?';
          hint = 'Step card: (1) find $' + c.f + '\'$ and $' + c.f + '\'\'$ in full, (2) put in $' + c.x + '=' + p + '$, (3) read the two signs. First step: $' + c.f + '\'(' + c.x + ')=' + polyIn(dpoly(cf), c.x, true) + '$ and $' + c.f + '\'\'(' + c.x + ')=' + polyIn(dpoly(dpoly(cf)), c.x, true) + '$. Same move: $f=t^3-6t$ gives $f\'=3t^2-6$ and $f\'\'=6t$; at $t=3$ both are positive.';
          worked = '$' + c.f + '\'(' + p + ')=' + fp + '$ and $' + c.f + '\'\'(' + p + ')=' + fpp + '$. ' + SHAPE[ans].charAt(0).toUpperCase() + SHAPE[ans].slice(1) + '.'; }
        else { t1 = INT(r, 1, 4); t2 = t1 + pick(r, [2, 4]); v1 = pick(r, [-9, -6, 4, 6, 10, 12]); v2 = v1 + pick(r, [-4, -3, 3, 4]); if (sgn(v1) !== sgn(v2) || v1 === v2) v2 = v1 + (v1 > 0 ? -2 : 2); fp = v1; fpp = v2 - v1; ans = shapeIndex(fp, fpp); data = { t1: t1, t2: t2, v1: v1, v2: v2 };
          lead = c.line + ' The rate $' + c.f + '\'$ is ' + v1 + ' at $' + c.x + '=' + t1 + '$ and ' + v2 + ' at $' + c.x + '=' + t2 + '$ (' + c.y + ' per ' + c.xs + '), and it changes steadily in between. At $' + c.x + '=' + t1 + '$, what is happening to ' + c.noun + '?';
          hint = 'Step card: the rate $' + c.f + '\'$ itself is changing. Compare the two values to see if the rate is getting bigger or smaller. First step: $' + c.f + '\'$ goes from ' + v1 + ' to ' + v2 + ', so it is ' + (v2 > v1 ? 'getting bigger' : 'getting smaller') + '. Same move: if $f\'$ goes from 8 to 5, then $f\'\'<0$ and $f\'>0$: increasing, but more slowly.';
          worked = 'The sign of $' + c.f + '\'$ is ' + (v1 > 0 ? 'positive' : 'negative') + '. The rate goes from ' + v1 + ' to ' + v2 + ', so it is getting ' + (v2 > v1 ? 'bigger' : 'smaller') + ' ($' + c.f + '\'\'' + (v2 > v1 ? '>' : '<') + '0$). So ' + SHAPE[ans] + '.'; }
        data.ans = ans;
        var m = mix(r, [SHAPE[ans]].concat(SHAPE.filter(function (_, i) { return i !== ans; })));
        return { type: 'choice', data: data, prompt: lead, options: m.options, answer: m.answer, hint: hint, worked: worked };
      } },

      /* say: what an average rate means (bands 1-2), or the equation for it (band 3). */
      { id: 'say', title: 'Say what the average means', gen: function (b, r) {
        b = Math.min(b, 3);
        var c = pick(r, CTX), a = INT(r, 1, 5), w = pick(r, [2, 3, 4]), e = a + w, v = INT(r, 2, 9), neg = b >= 2 && r() < 0.5, sv = neg ? -v : v, F = c.f, X = c.x, up = neg ? c.down : c.up, opts, m;
        if (b <= 2) {
          opts = ['On average, ' + c.noun + ' ' + up + ' by ' + v + ' ' + c.y + ' per ' + c.xs + ' from ' + X + ' = ' + a + ' to ' + X + ' = ' + e + '.',
                  'At exactly ' + X + ' = ' + a + ', ' + c.noun + ' is ' + (neg ? 'falling' : 'rising') + ' at ' + v + ' ' + c.y + ' per ' + c.xs + '.',
                  c.noun.charAt(0).toUpperCase() + c.noun.slice(1) + ' ' + up + ' by a total of ' + v + ' ' + c.y + ' from ' + X + ' = ' + a + ' to ' + X + ' = ' + e + '.',
                  'At ' + X + ' = ' + e + ', ' + c.noun + ' is ' + v + ' ' + c.y + '.'];
          m = mix(r, opts);
          return { type: 'choice', data: { say: { sign: sv, v: v, a: a, b: e, right: opts[0] } }, prompt: c.line + ' The average rate of change of $' + F + '$ from $' + X + '=' + a + '$ to $' + X + '=' + e + '$ is $' + sv + '$ ' + c.y + ' per ' + c.xs + '. What does this say?', options: m.options, answer: m.answer,
            hint: 'Step card: an average rate talks about a whole interval and says "on average, per ' + c.xs + '". A wrong sentence talks about one moment, or gives a total, or gives an amount. First step: the interval is from ' + a + ' to ' + e + '. Same move: "the average rate from 1 to 5 is 4 per hour" means on average it rose 4 for each hour between 1 and 5.',
            worked: 'The sentence must name the interval (' + a + ' to ' + e + '), say "on average", and give the rate per ' + c.xs + ': ' + opts[0] };
        }
        opts = ['$\\dfrac{' + F + '(' + e + ')-' + F + '(' + a + ')}{' + e + '-' + a + '}=' + v + '$', '$' + F + '\'(' + a + ')=' + v + '$', '$' + F + '(' + e + ')-' + F + '(' + a + ')=' + v + '$', '$\\dfrac{' + F + '(' + e + ')-' + F + '(' + a + ')}{' + a + '}=' + v + '$'];
        m = mix(r, opts);
        return { type: 'choice', data: { write: { v: v, a: a, b: e, right: opts[0] } }, prompt: c.line + ' Which equation says: "the average rate of change of $' + F + '$ from $' + X + '=' + a + '$ to $' + X + '=' + e + '$ is ' + v + ' ' + c.y + ' per ' + c.xs + '"?', options: m.options, answer: m.answer,
          hint: 'Step card: an average rate is change in output over change in input, with the two ends of the interval. First step: the change in input is $' + e + '-' + a + '$. Same move: "average rate from 2 to 6 is 3" is $\\dfrac{f(6)-f(2)}{6-2}=3$.',
          worked: 'Average rate = change in $' + F + '$ ÷ change in $' + X + '$ = $\\dfrac{' + F + '(' + e + ')-' + F + '(' + a + ')}{' + e + '-' + a + '}$.' };
      } }
    ],

    misconceptions: [
      { say: 'The average rate from a to b is f′(a).', fix: 'f′(a) is the rate at one moment. The average rate is (f(b) − f(a)) / (b − a).' },
      { say: 'Average rate = f(b) − f(a).', fix: 'That is the total change. Divide by b − a to get the rate per unit.' },
      { say: 'Dividing by b instead of b − a.', fix: 'Divide by the width of the interval, b − a.' },
      { say: 'f″ < 0 means the quantity is decreasing.', fix: 'It means the rate f′ is getting smaller. The quantity can still be increasing.' },
      { say: 'Leaving the units off a rate.', fix: 'Say "thousand bacteria per hour": output units per input unit.' }
    ]
    /* no pacing: the lesson has no clock, no trim, no skip and no end mark */
  };

  /* the picture for the notes: a curve f(x) = x(10 − x)/2, its tangent at x = 2 (red) and its secant from x = 2 to x = 7 (orange) */
  (function () {
    var f = function (x) { return x * (10 - x) / 2; }, X = function (x) { return 20 + 28 * x; }, Y = function (v) { return 135 - 10 * v; }, p = [], i, s;
    for (i = 0; i <= 40; i++) p.push(X(i / 4).toFixed(1) + ',' + Y(f(i / 4)).toFixed(1));
    var a = 2, b = 7, ms = (f(b) - f(a)) / (b - a), mt = (10 - 2 * a) / 2;
    s = '<svg viewBox="0 0 330 160" role="img" aria-label="A curve with a red tangent line at one point and an orange secant line through two points, marked 1, 2 and 3"><line x1="20" y1="135" x2="310" y2="135" stroke="#7a8a99" stroke-width="1.5"/>' +
      '<polyline points="' + p.join(' ') + '" fill="none" stroke="#2b4fd9" stroke-width="3"/>' +
      '<line x1="' + X(0.5) + '" y1="' + Y(f(a) + mt * -1.5).toFixed(1) + '" x2="' + X(3.8) + '" y2="' + Y(f(a) + mt * 1.8).toFixed(1) + '" stroke="#b3412e" stroke-width="2.5"/>' +
      '<line x1="' + X(0.5) + '" y1="' + Y(f(a) + ms * -1.5).toFixed(1) + '" x2="' + X(8.5) + '" y2="' + Y(f(a) + ms * 6.5).toFixed(1) + '" stroke="#c26a00" stroke-width="2.5"/>' +
      '<circle cx="' + X(a) + '" cy="' + Y(f(a)) + '" r="5" fill="#142230"/><circle cx="' + X(b) + '" cy="' + Y(f(b)) + '" r="5" fill="#142230"/>' +
      '<circle cx="' + (X(3.8) + 12) + '" cy="' + (Y(f(a) + mt * 1.8) - 4).toFixed(1) + '" r="10" fill="none" stroke="#142230"/><text x="' + (X(3.8) + 8) + '" y="' + (Y(f(a) + mt * 1.8)).toFixed(1) + '" font-size="13">1</text>' +
      '<circle cx="' + (X(8.5) + 4) + '" cy="' + (Y(f(a) + ms * 6.5) - 14).toFixed(1) + '" r="10" fill="none" stroke="#142230"/><text x="' + X(8.5) + '" y="' + (Y(f(a) + ms * 6.5) - 9).toFixed(1) + '" font-size="13">2</text>' +
      '<circle cx="' + ((X(a) + X(b)) / 2) + '" cy="152" r="8" fill="none" stroke="#142230"/><text x="' + (((X(a) + X(b)) / 2) - 4) + '" y="157" font-size="13">3</text>' +
      '<line x1="' + X(a) + '" y1="135" x2="' + X(a) + '" y2="' + Y(f(a)) + '" stroke="#7a8a99" stroke-dasharray="3 3"/><line x1="' + X(b) + '" y1="135" x2="' + X(b) + '" y2="' + Y(f(b)) + '" stroke="#7a8a99" stroke-dasharray="3 3"/></svg>';
    SPEC.huddle.label.html = s;
  })();

  if (typeof module !== 'undefined' && module.exports) module.exports = SPEC; else (root.SPECS = root.SPECS || {})[SPEC.id] = SPEC;
})(typeof window !== 'undefined' ? window : globalThis);
