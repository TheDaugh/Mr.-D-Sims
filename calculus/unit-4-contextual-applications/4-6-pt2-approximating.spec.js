/* SPEC (calculus 4.6 part 2): use the linearization to estimate, then judge the estimate (too big or too small) from concavity. Visual tutorial, no huddle.
   Test data (tests/unit/linearization-estimate.test.js recomputes each answer from the function itself):
     estimate  data.f (key), data.a, data.x.        direction  data.kind ('over'|'under'), data.f or data.sign.
     context   data.fa, data.d, data.dx.            error      data.a, data.x1, data.x2, data.right (index of the closer x). */
(function (root) {
  'use strict';
  var INT = function (r, a, b) { return a + Math.floor(r() * (b - a + 1)); };
  var pick = function (r, arr) { return arr[Math.floor(r() * arr.length)]; };
  var shuffle = function (r, arr) { var a = arr.slice(), i, j, t; for (i = a.length - 1; i > 0; i--) { j = Math.floor(r() * (i + 1)); t = a[i]; a[i] = a[j]; a[j] = t; } return a; };
  function mix(r, opts, msgs) { var order = shuffle(r, opts.map(function (_, i) { return i; })); return { options: order.map(function (i) { return opts[i]; }), answer: order.indexOf(0), why: order.map(function (i) { return msgs && msgs[i] ? msgs[i] : ''; }) }; }
  var round3 = function (x) { return Math.round(x * 1000) / 1000; };
  var round2 = function (x) { return Math.round(x * 100) / 100; };
  var fr = function (p) { return p[0] / p[1]; };
  var ftex = function (p) { var n = p[0], d = p[1]; if (d === 1) return String(n); return (n < 0 ? '-' : '') + '\\tfrac{' + Math.abs(n) + '}{' + d + '}'; };

  /* estimate: f(a) and f'(a) as [num, den]; the test recomputes both from the key */
  var EST = [
    { b: 1, key: 'sq', tex: 'x^2', a: 2, fa: [4, 1], d: [4, 1], xs: [2.1, 2.2, 1.9, 2.5] }, { b: 1, key: 'sq', tex: 'x^2', a: 3, fa: [9, 1], d: [6, 1], xs: [3.1, 3.2, 2.9] }, { b: 1, key: 'cube', tex: 'x^3', a: 1, fa: [1, 1], d: [3, 1], xs: [1.1, 1.2, 0.9] },
    { b: 2, key: 'sqrt', tex: '\\sqrt{x}', a: 4, fa: [2, 1], d: [1, 4], xs: [4.2, 4.4, 3.8, 4.8] }, { b: 2, key: 'sqrt', tex: '\\sqrt{x}', a: 9, fa: [3, 1], d: [1, 6], xs: [9.3, 9.6, 8.7] }, { b: 2, key: 'sqrt', tex: '\\sqrt{x}', a: 25, fa: [5, 1], d: [1, 10], xs: [26, 25.5, 24, 27] }, { b: 2, key: 'sqrt', tex: '\\sqrt{x}', a: 16, fa: [4, 1], d: [1, 8], xs: [17, 16.8, 15] },
    { b: 3, key: 'cbrt', tex: '\\sqrt[3]{x}', a: 8, fa: [2, 1], d: [1, 12], xs: [8.3, 8.6, 7.5] }, { b: 3, key: 'inv', tex: '\\dfrac1x', a: 2, fa: [1, 2], d: [-1, 4], xs: [2.1, 2.2, 1.9] }, { b: 3, key: 'ln', tex: '\\ln x', a: 1, fa: [0, 1], d: [1, 1], xs: [1.1, 1.05, 0.9] }, { b: 3, key: 'exp', tex: 'e^x', a: 0, fa: [1, 1], d: [1, 1], xs: [0.1, 0.2, -0.1] }
  ];
  var DIR = [
    { b: 3, key: 'sqrt', tex: '\\sqrt{x}', a: 4, kind: 'over', why: '$f\'\'(x)=-\\tfrac14x^{-3/2}$ is negative, so the curve bends down.' },
    { b: 3, key: 'sq', tex: 'x^2', a: 3, kind: 'under', why: '$f\'\'(x)=2$ is positive, so the curve bends up.' },
    { b: 3, key: 'exp', tex: 'e^x', a: 0, kind: 'under', why: '$f\'\'(x)=e^x$ is positive, so the curve bends up.' },
    { b: 3, key: 'ln', tex: '\\ln x', a: 1, kind: 'over', why: '$f\'\'(x)=-\\dfrac{1}{x^2}$ is negative, so the curve bends down.' },
    { b: 3, key: 'inv', tex: '\\dfrac1x', a: 2, kind: 'under', why: '$f\'\'(x)=\\dfrac{2}{x^3}$ is positive for $x>0$, so the curve bends up.' },
    { b: 3, key: 'cbrt', tex: '\\sqrt[3]{x}', a: 8, kind: 'over', why: '$f\'\'(x)=-\\tfrac29x^{-5/3}$ is negative, so the curve bends down.' }
  ];
  var CTX = [
    { b: 1, s: 'A plant is {fa} cm tall at day 5 and growing {d} cm per day.', q: 'its height {dx} day{p} later', u: 'cm', sign: 1 },
    { b: 1, s: 'A tank holds {fa} gallons at minute 10 and is filling at {d} gallons per minute.', q: 'the amount {dx} minute{p} later', u: 'gallons', sign: 1 },
    { b: 2, s: 'A pond’s water level is {fa} ft and is falling at {d} ft per day.', q: 'the level {dx} day{p} later', u: 'ft', sign: -1 },
    { b: 2, s: 'A hot drink is {fa} °F and cooling at {d} °F per minute.', q: 'its temperature {dx} minute{p} later', u: '°F', sign: -1 },
    { b: 3, s: 'A car is {fa} miles from home and approaching at {d} miles per minute.', q: 'its distance {dx} minute{p} from now', u: 'miles', sign: -1 }
  ];

  var SPEC = {
    id: '4-6-pt2-approximating', course: 'calc', unit: 'Unit 4 · Contextual Applications of Differentiation', title: '4.6 Part 2 · Linearization: Estimate and Judge the Estimate',
    selfPaced: true,
    question: 'How do I use the tangent line to estimate, and how do I know if the estimate is too big or too small?',
    targets: ['I can estimate f(x) near a using L(x).', 'I can say whether the estimate is too big or too small, using concavity.', 'I can use a rate from a story to estimate a nearby value.'],
    tabs: ['Warm-up', 'Predict', 'Concept (pictures)', 'I do (watch)', 'You do', 'Practice', 'Check', 'Wrap-up'],
    buildTarget: 'I can estimate with the tangent line and say if it is too big or too small.',
    concepts: [
      { title: 'Estimate with L(x)', points: ['Write $L(x)=f(a)+f\'(a)(x-a)$.', 'Put in a nearby $x$. The result is the estimate.'], eq: 'f(x) ≈ L(x)' },
      { title: 'Concave up', points: ['The curve bends up ($f\'\'>0$).', 'The tangent line sits BELOW it: the estimate is too small.'], eq: 'f″ > 0 → under' },
      { title: 'Concave down', points: ['The curve bends down ($f\'\'<0$).', 'The tangent line sits ABOVE it: the estimate is too big.'], eq: 'f″ < 0 → over' }
    ],
    review: [
      { id: 'R1', title: 'Review 1', prompt: 'The tangent line to $f$ at $a=4$ is $L(x)=2+\\tfrac14(x-4)$. $L(4.4)$ is…', options: ['2.1', '2.4', '0.1', '2.25'], answer: 0, why: '$2+\\tfrac14(0.4)=2.1$.' },
      { id: 'R2', title: 'Review 2', prompt: 'If $f\'\'(x)>0$ on an interval, the graph there is…', options: ['concave up (bends upward)', 'concave down', 'decreasing', 'a straight line'], answer: 0, why: 'A positive second derivative means the slope is increasing, so the curve bends up.' },
      { id: 'R3', title: 'Review 3', prompt: 'The slope $f\'(a)$ in the linearization is…', options: ['a number', 'a function of $x$', 'always 1', 'always 0'], answer: 0, why: 'It is $f\'$ evaluated at $a$, so one number.' }
    ],
    predicts: [
      { id: 'P1', title: 'Which side?', prompt: 'The curve $y=x^2$ bends upward. A tangent line to it touches at one point. Everywhere else the curve is…', options: ['above the tangent line', 'below the tangent line', 'on the tangent line', 'on both sides of it'], answer: 0, why: 'A curve that bends upward lies above its tangent lines, so the tangent-line estimate is too small.' },
      { id: 'P2', title: 'Square root', prompt: 'The tangent line to $y=\\sqrt{x}$ at $x=4$ is used to estimate $\\sqrt{4.4}$. The estimate will be…', options: ['a little too big', 'a little too small', 'exactly right', 'zero'], answer: 0, why: '$\\sqrt{x}$ bends downward, so its tangent lines lie above it.' }
    ],

    tutorial: {
      moves: ['Write L(x)', 'Put in x to estimate', 'Judge: over or under', 'Say it with units'],
      concept: { title: 'Estimating, and checking the estimate', target: 'I can say whether a tangent-line estimate is too big or too small, from the shape of the curve.', frames: [
        { head: 'Use the line as an estimate', show: 'approx', st: { fn: 'sq', x0: 2.5 }, guide: 'The curve is $y=x^2$. The red tangent line touches it at $x=2$. Slide $x$ and read $L(x)$ and $f(x)$ in the readout.',
          say: 'The red line is $L(x)=4+4(x-2)$. To estimate $f(2.1)$, put $x=2.1$ into the line.',
          ask: { type: 'num', prompt: 'Find $L(2.1)=4+4(2.1-2)$.', answer: 4.4, tol: 0.005, hint: '$4\\times0.1=0.4$.', why: '$4+0.4=4.4$. The true $f(2.1)=4.41$.' } },
        { head: 'The line is below the curve', show: 'approx', st: { fn: 'sq', x0: 3 }, guide: 'The orange segment shows the gap at the chosen $x$. The readout says which one is on top.',
          say: 'For $x^2$ the red line is below the blue curve. A line below the curve gives an estimate that is too small.',
          ask: { type: 'choice', prompt: 'For $x^2$ the tangent-line estimate is…', options: ['too small', 'too big', 'exact', 'cannot tell'], answer: 0, why: 'The line is below the curve, so $L(x)<f(x)$.' } },
        { head: 'Sometimes the line is above', show: 'approx', st: { fn: 'sqrt', x0: 6 }, guide: 'The curve is $\\sqrt{x}$ and the tangent line is at $x=4$.',
          say: 'For $\\sqrt{x}$ the red line is above the blue curve. That makes the estimate too big.',
          ask: { type: 'choice', prompt: 'For $\\sqrt{x}$ the tangent-line estimate is…', options: ['too big', 'too small', 'exact', 'cannot tell'], answer: 0, why: 'The line is above the curve, so $L(x)>f(x)$.' } },
        { head: 'Why? The bend of the curve', show: 'approx', st: { fn: 'sq', x0: 3.5 }, guide: 'The curve $x^2$ bends up (concave up). Its slope keeps increasing.',
          say: 'A curve that bends UP ($f\'\'>0$) climbs away from its tangent line, so it ends above it. The estimate is too small.',
          ask: { type: 'choice', prompt: 'If $f\'\'>0$ near $a$ (concave up), the tangent-line estimate is…', options: ['too small', 'too big', 'exact', 'always zero'], answer: 0, why: 'The curve lies above its tangent line, so the line estimates too small.' } },
        { head: 'Bending down', show: 'approx', st: { fn: 'sqrt', x0: 7 }, guide: 'The curve $\\sqrt{x}$ bends down (concave down). Its slope keeps decreasing.',
          say: 'A curve that bends DOWN ($f\'\'<0$) falls away from its tangent line, so it ends below it. The estimate is too big.',
          ask: { type: 'choice', prompt: 'If $f\'\'<0$ near $a$ (concave down), the tangent-line estimate is…', options: ['too big', 'too small', 'exact', 'always zero'], answer: 0, why: 'The curve lies below its tangent line, so the line estimates too big.' } },
        { head: 'Closer is better', show: 'approx', st: { fn: 'sqrt', x0: 4.1 }, guide: 'Slide $x$ toward 4 and watch the orange gap shrink.',
          say: 'Whichever way the curve bends, the gap is smaller when $x$ is closer to $a$.',
          ask: { type: 'choice', prompt: 'Which estimate of $\\sqrt{x}$ from the tangent line at $x=4$ is better?', options: ['the one at $x=4.1$', 'the one at $x=7$', 'the same', 'neither'], answer: 0, why: '4.1 is closer to 4 than 7 is.' } },
        { head: 'A story with a rate', show: 'approx', st: { fn: 'temp', x0: 3.5 }, guide: 'The curve is the temperature $T(t)$ in °F against the hour $t$. The red line is the tangent line at $t=3$, where $T(3)=70$ and $T\'(3)=4$ °F per hour.',
          say: 'The rate says 4 °F per hour, so half an hour later it is about $70+4(0.5)=72$ °F.',
          ask: { type: 'num', prompt: '$T(3)=70$ °F and $T\'(3)=4$ °F/hr. Estimate $T(3.5)$.', answer: 72, unit: '°F', tol: 0, abs: 0.001, hint: '$70+4\\times0.5$.', why: '$70+2=72$ °F. The curve bends down, so the true value is a little less.' } }
      ] },
      ido: { target: 'I can watch an estimate made and judged on two problems and spot the common slip.',
        problem: 'Use the tangent line to $f(x)=\\sqrt{x}$ at $a=4$ to estimate $\\sqrt{4.4}$. Is the estimate too big or too small?',
        frames: [
          { head: 'Write the line', move: 'Move 1 · Write L(x)', show: 'approx', st: { fn: 'sqrt', fixed: true, x0: 4 }, guide: 'The tangent line to $\\sqrt{x}$ at $x=4$.',
            say: 'We found it in Part 1: $f(4)=2$ and $f\'(4)=\\tfrac14$.', work: ['$L(x)=2+\\tfrac14(x-4)$'],
            ask: { type: 'choice', prompt: 'Why is the point $a=4$ a good choice for estimating $\\sqrt{4.4}$?', options: ['4 is close to 4.4 and $\\sqrt4$ is easy.', '4 is the biggest number.', '4.4 is a whole number.', 'It is not a good choice.'], answer: 0, why: 'We want $a$ near our $x$, with an easy $f(a)$ and $f\'(a)$.' } },
          { head: 'Put in x', move: 'Move 2 · Put in x to estimate', show: 'approx', st: { fn: 'sqrt', x0: 4.4 }, guide: 'The orange gap at $x=4.4$ is tiny. Read the two values in the readout.',
            say: 'Put $x=4.4$ into $L$. Then $4.4-4=0.4$.', work: ['$L(4.4)=2+\\tfrac14(0.4)=2.1$'],
            ask: { type: 'num', prompt: 'Find $L(4.4)$.', answer: 2.1, tol: 0.005, hint: '$\\tfrac14\\times0.4=0.1$.', why: '$2+0.1=2.1$.' } },
          { head: 'Judge the estimate', move: 'Move 3 · Judge: over or under', show: 'approx', st: { fn: 'sqrt', x0: 4.4 }, guide: 'The red line is above the blue curve, as the readout says.',
            say: '$f(x)=\\sqrt{x}$ bends down, so $f\'\'<0$. The tangent line is above the curve, so 2.1 is too big.', work: ['$f\'\'<0$: concave down', 'So $L(4.4)=2.1$ is too big'],
            ask: { type: 'choice', prompt: 'Because $f\'\'<0$ (concave down), the estimate is…', options: ['too big', 'too small', 'exact', 'cannot tell'], answer: 0, why: 'A curve that bends down lies below its tangent line.', traps: { 1: 'Concave down puts the curve BELOW the line, so the line is above: too big.' } } },
          { head: 'Say it', move: 'Move 4 · Say it with units', show: 'approx', st: { fn: 'sqrt', x0: 4.4 }, guide: 'The true value is $\\sqrt{4.4}\\approx2.0976$.',
            say: 'Check: the true $\\sqrt{4.4}\\approx2.0976$ is a bit smaller than 2.1. That agrees with "too big".', work: ['$\\sqrt{4.4}\\approx2.1$ (a little too big)'],
            ask: { type: 'choice', prompt: 'The true value is 2.0976 and the estimate is 2.1. The estimate is…', options: ['a bit too big', 'a bit too small', 'exactly right', 'far off'], answer: 0, why: '2.1 is slightly bigger than 2.0976.' } },
          { head: 'Problem 2: a temperature', move: 'Moves 1 to 3 · Estimate and judge', workClear: true, show: 'approx', st: { fn: 'temp', x0: 3.5 }, guide: 'Temperature $T(t)$ in °F against hours. The red line is the tangent line at $t=3$.',
            problem: 'At 3 pm the temperature is 70 °F and rising 4 °F per hour. The temperature curve bends down. Estimate the temperature at 3:30 pm, and say if the estimate is too big or too small.',
            say: 'Half an hour is $0.5$ hr, so the estimate is $70+4(0.5)=72$ °F. The curve bends down, so 72 is too big.', work: ['$T(3.5)\\approx70+4(0.5)=72$ °F', 'Concave down: too big'],
            ask: { type: 'choice', prompt: 'The temperature curve bends down. The estimate of 72 °F is…', options: ['too big', 'too small', 'exact', 'cannot tell'], answer: 0, why: 'Bending down means the curve is below its tangent line.' } },
          { head: 'The common slip', slip: true, show: 'approx', st: { fn: 'temp', x0: 3.5 }, guide: 'The temperature is RISING (positive slope) but the curve is bending DOWN (negative $f\'\'$).',
            say: 'Slip: saying “the temperature is rising, so the estimate is too small.” Rising is the slope. Too big or small depends on the bend, $f\'\'$.', work: ['Wrong: rising so too small', 'Right: bends down so too big'],
            ask: { type: 'choice', prompt: 'What decides “too big or too small”?', options: ['whether the curve bends up or down ($f\'\'$)', 'whether the curve is rising ($f\'$)', 'the size of $x$', 'the units'], answer: 0, why: 'The slope is already in the line. The bend decides which side the curve is on.', traps: { 1: 'The slope is already used in the tangent line. The bend decides the side.' } } }
        ] },
      summary: ['To estimate, write $L(x)=f(a)+f\'(a)(x-a)$ and put in the nearby $x$.', 'Concave up ($f\'\'>0$): the line is below the curve, so the estimate is too small.', 'Concave down ($f\'\'<0$): the line is above the curve, so the estimate is too big.', 'The closer $x$ is to $a$, the better the estimate.']
    },

    skills: [
      { id: 'estimate', title: 'Estimate with L(x)', gen: function (b, r) {
        b = Math.min(b, 3); var pool = EST.filter(function (e) { return e.b === b; }), c = pick(r, pool.length ? pool : EST), x = pick(r, c.xs), ans = round3(fr(c.fa) + fr(c.d) * (x - c.a));
        return { type: 'num', tol: 0.005, data: { f: c.key, a: c.a, x: x }, prompt: 'Use the tangent line to $f(x)=' + c.tex + '$ at $a=' + c.a + '$ to estimate $f(' + x + ')$. You are given $f(' + c.a + ')=' + ftex(c.fa) + '$ and $f\'(' + c.a + ')=' + ftex(c.d) + '$. Give it to 2 decimal places.', answer: round2(ans),
          hint: 'Step card: (1) write $L(x)=f(a)+f\'(a)(x-a)$, (2) put in $x=' + x + '$, (3) find $x-a=' + round3(x - c.a) + '$ first. First step: $L(' + x + ')=' + ftex(c.fa) + '+(' + ftex(c.d) + ')(' + round3(x - c.a) + ')$. Same move: $f(2)=4$, $f\'(2)=4$, $x=2.1$ gives $4+4(0.1)=4.4$.',
          worked: '$L(' + x + ')=' + ftex(c.fa) + '+(' + ftex(c.d) + ')(' + round3(x - c.a) + ')\\approx' + round2(ans) + '$.' };
      } },

      { id: 'direction', title: 'Too big or too small?', gen: function (b, r) {
        b = Math.min(b, 3); var kind, line, why, key = null, sign = 0;
        if (b === 1) { kind = r() < 0.5 ? 'under' : 'over'; line = 'Near $a$, the graph of $f$ bends ' + (kind === 'under' ? 'upward (concave up)' : 'downward (concave down)') + '.'; why = (kind === 'under' ? 'Bending up puts the curve above its tangent line.' : 'Bending down puts the curve below its tangent line.'); }
        else if (b === 2) { sign = (r() < 0.5 ? 1 : -1) * INT(r, 1, 6); kind = sign > 0 ? 'under' : 'over'; line = 'Near $a$, $f\'\'(a)=' + sign + '$.'; why = '$f\'\'' + (sign > 0 ? '>0' : '<0') + '$ means the curve bends ' + (sign > 0 ? 'up, above' : 'down, below') + ' its tangent line.'; }
        else { var c = pick(r, DIR); kind = c.kind; key = c.key; line = 'Use the tangent line to $f(x)=' + c.tex + '$ at $a=' + c.a + '$ to estimate a value near $a$. ' ; why = c.why; }
        var right = kind === 'over' ? 'too big (an overestimate)' : 'too small (an underestimate)', wrongSide = kind === 'over' ? 'too small (an underestimate)' : 'too big (an overestimate)';
        var mx = mix(r, [right, wrongSide, 'exactly right', 'impossible to tell'], ['', 'Check the bend. ' + (kind === 'over' ? 'Bending down puts the curve BELOW the line, so the line estimates too big.' : 'Bending up puts the curve ABOVE the line, so the line estimates too small.'), 'The line touches the curve at only one point. Everywhere else it is off.', 'The bend of the curve tells you which side the line is on.']);
        return { type: 'choice', data: { kind: kind, f: key, sign: sign, right: mx.answer }, prompt: line + (b === 3 ? ' Is the estimate…' : ' The tangent-line estimate is…'), options: mx.options, answer: mx.answer, why: mx.why,
          hint: 'Step card: (1) decide if the curve bends up or down (sign of $f\'\'$), (2) bends up: curve above the line, bends down: curve below the line, (3) the line is then below or above the curve. First step: work out the sign of $f\'\'$. Same move: $x^2$ has $f\'\'=2>0$, bends up, estimate too small.',
          worked: why + ' So the estimate is ' + right + '.' };
      } },

      { id: 'context', title: 'Estimate from a story', gen: function (b, r) {
        b = Math.min(b, 3); var pool = CTX.filter(function (c) { return c.b === b; }), c = pick(r, pool.length ? pool : CTX), fa = INT(r, 20, 90), d = INT(r, 2, 9), dx = b === 1 ? INT(r, 1, 3) : pick(r, [0.5, 1.5, 2]), rate = c.sign * d, ans = round2(fa + rate * dx);
        var line = c.s.replace('{fa}', fa).replace('{d}', d), q = c.q.replace('{dx}', dx).replace('{p}', dx === 1 ? '' : 's');
        return { type: 'num', tol: 0.005, data: { fa: fa, d: rate, dx: dx }, prompt: line + ' Use the tangent line to estimate ' + q + '. Give it to 2 decimal places if needed.', answer: ans, unit: c.u,
          hint: 'Step card: (1) the start value is $f(a)=' + fa + '$, (2) the rate is $f\'(a)=' + (rate < 0 ? '-' : '') + d + '$ (' + (rate < 0 ? 'falling, so negative' : 'rising, so positive') + '), (3) add rate times the time. First step: the time step is ' + dx + '. Same move: start 50, rate 2 per day, 3 days later gives $50+2(3)=56$.',
          worked: '$L=' + fa + '+(' + rate + ')(' + dx + ')=' + ans + '$ ' + c.u + '.' };
      } },

      { id: 'error', title: 'Which estimate is better?', gen: function (b, r) {
        b = Math.min(b, 3); var a = INT(r, 2, 9), x1, x2;
        if (b === 1) { x1 = round2(a + INT(r, 1, 3) / 10); x2 = round2(a + INT(r, 6, 9) / 10); }
        else if (b === 2) { x1 = round2(a - INT(r, 1, 3) / 10); x2 = round2(a + INT(r, 5, 9) / 10); }
        else { var m = INT(r, 2, 4), n = m + INT(r, 1, 2); x1 = round2(a + (r() < 0.5 ? m : -m) / 10); x2 = round2(a + (r() < 0.5 ? n : -n) / 10); }
        var close1 = Math.abs(x1 - a) < Math.abs(x2 - a), mx = mix(r, [close1 ? '$x=' + x1 + '$' : '$x=' + x2 + '$', close1 ? '$x=' + x2 + '$' : '$x=' + x1 + '$', 'both are equally good', 'neither is useful'], ['', 'That one is farther from $a=' + a + '$. Distance from $a$ is what matters, not the size of $x$.', 'They are different distances from $a$.', 'Both are useful. The closer one is better.']);
        return { type: 'choice', data: { a: a, x1: x1, x2: x2, right: mx.answer, close1: close1 }, prompt: 'The tangent line at $a=' + a + '$ is used to estimate $f(' + x1 + ')$ and $f(' + x2 + ')$. Which estimate is expected to be better?', options: mx.options, answer: mx.answer, why: mx.why,
          hint: 'Step card: (1) find the distance of each $x$ from $a=' + a + '$, (2) the smaller distance is the better estimate, (3) ignore the direction. First step: $|' + x1 + '-' + a + '|=' + round2(Math.abs(x1 - a)) + '$. Same move: from $a=4$, $x=4.1$ (distance 0.1) beats $x=4.5$ (distance 0.5).',
          worked: 'Distances from $a=' + a + '$: $' + round2(Math.abs(x1 - a)) + '$ and $' + round2(Math.abs(x2 - a)) + '$. The smaller distance, $x=' + (close1 ? x1 : x2) + '$, gives the better estimate.' };
      } }
    ],

    misconceptions: [
      { say: 'The curve is rising, so the estimate is too small.', fix: 'Rising is the slope. Too big or too small depends on the bend (f″).' },
      { say: 'Concave down means the estimate is too small.', fix: 'Concave down puts the curve below the line, so the estimate is too big.' },
      { say: 'The tangent line gives the exact value.', fix: 'Only at x = a. Everywhere else it is an estimate.' },
      { say: 'A bigger x gives a worse estimate.', fix: 'Distance from a matters, not the size of x.' },
      { say: 'Use x instead of (x − a) in the estimate.', fix: 'The step from a is (x − a).' }
    ]
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = SPEC; else (root.SPECS = root.SPECS || {})[SPEC.id] = SPEC;
})(typeof window !== 'undefined' ? window : globalThis);
