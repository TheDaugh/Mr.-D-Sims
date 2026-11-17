/* SPEC (calculus 4.6 part 1): local linearity and the tangent-line formula. Visual tutorial, no huddle.
   Test data (tests/unit/linearization.test.js recomputes each answer from the function, not from this file's numbers):
     point/slope  data.f (key), data.a.      line  data.f, data.a (the test compares the answer to f(a)+f'(a)(x-a) at sample x).
     meaning  data.id (which stem), data.right. */
(function (root) {
  'use strict';
  var INT = function (r, a, b) { return a + Math.floor(r() * (b - a + 1)); };
  var pick = function (r, arr) { return arr[Math.floor(r() * arr.length)]; };
  var shuffle = function (r, arr) { var a = arr.slice(), i, j, t; for (i = a.length - 1; i > 0; i--) { j = Math.floor(r() * (i + 1)); t = a[i]; a[i] = a[j]; a[j] = t; } return a; };
  function mix(r, opts, msgs) { var order = shuffle(r, opts.map(function (_, i) { return i; })); return { options: order.map(function (i) { return opts[i]; }), answer: order.indexOf(0), why: order.map(function (i) { return msgs && msgs[i] ? msgs[i] : ''; }) }; }
  var round2 = function (x) { return Math.round(x * 100) / 100; };
  var fr = function (p) { return p[0] / p[1]; };
  var ftex = function (p) { var n = p[0], d = p[1]; if (d === 1) return String(n); return (n < 0 ? '-' : '') + '\\tfrac{' + Math.abs(n) + '}{' + d + '}'; };
  var fstr = function (p) { return p[1] === 1 ? '(' + p[0] + ')' : '(' + p[0] + '/' + p[1] + ')'; };

  /* every entry: the function (as the student reads it), the point a, f(a) and f'(a) as [num, den] fractions. The tests recompute both from `key`. */
  var FN = [
    { b: 1, key: 'sq', tex: 'x^2', a: 1, fa: [1, 1], d: [2, 1] }, { b: 1, key: 'sq', tex: 'x^2', a: 2, fa: [4, 1], d: [4, 1] }, { b: 1, key: 'sq', tex: 'x^2', a: 3, fa: [9, 1], d: [6, 1] }, { b: 1, key: 'sq', tex: 'x^2', a: 4, fa: [16, 1], d: [8, 1] },
    { b: 1, key: 'cube', tex: 'x^3', a: 1, fa: [1, 1], d: [3, 1] }, { b: 1, key: 'cube', tex: 'x^3', a: 2, fa: [8, 1], d: [12, 1] },
    { b: 2, key: 'sqrt', tex: '\\sqrt{x}', a: 1, fa: [1, 1], d: [1, 2] }, { b: 2, key: 'sqrt', tex: '\\sqrt{x}', a: 4, fa: [2, 1], d: [1, 4] }, { b: 2, key: 'sqrt', tex: '\\sqrt{x}', a: 9, fa: [3, 1], d: [1, 6] }, { b: 2, key: 'sqrt', tex: '\\sqrt{x}', a: 16, fa: [4, 1], d: [1, 8] },
    { b: 2, key: 'inv', tex: '\\dfrac1x', a: 1, fa: [1, 1], d: [-1, 1] }, { b: 2, key: 'inv', tex: '\\dfrac1x', a: 2, fa: [1, 2], d: [-1, 4] }, { b: 2, key: 'inv', tex: '\\dfrac1x', a: 4, fa: [1, 4], d: [-1, 16] },
    { b: 3, key: 'cbrt', tex: '\\sqrt[3]{x}', a: 8, fa: [2, 1], d: [1, 12] }, { b: 3, key: 'cbrt', tex: '\\sqrt[3]{x}', a: 27, fa: [3, 1], d: [1, 27] },
    { b: 3, key: 'root2x1', tex: '\\sqrt{2x+1}', a: 4, fa: [3, 1], d: [1, 3] }, { b: 3, key: 'root2x1', tex: '\\sqrt{2x+1}', a: 12, fa: [5, 1], d: [1, 5] },
    { b: 3, key: 'poly3', tex: 'x^3-3x', a: 2, fa: [2, 1], d: [9, 1] }, { b: 3, key: 'poly3', tex: 'x^3-3x', a: 1, fa: [-2, 1], d: [0, 1] },
    { b: 3, key: 'ln', tex: '\\ln x', a: 1, fa: [0, 1], d: [1, 1] }, { b: 3, key: 'exp', tex: 'e^x', a: 0, fa: [1, 1], d: [1, 1] }, { b: 3, key: 'exp2', tex: 'e^{2x}', a: 0, fa: [1, 1], d: [2, 1] }
  ];
  function poolFor(b) { var p = FN.filter(function (f) { return f.b === b; }); return p.length ? p : FN; }

  var MEAN = [
    { b: 1, id: 'zoom', q: 'You zoom in a great deal on a smooth curve at one point. It looks more and more like…', right: 'a straight line', wrong: [['a parabola', 'A parabola is curved. Zooming in on a smooth curve straightens it.'], ['a circle', 'Zooming in makes curves look flatter, not rounder.'], ['a corner', 'A smooth curve has no corner. A corner stays a corner at every zoom.']] },
    { b: 1, id: 'slope', q: 'The slope of the tangent line to $f$ at $x=a$ is…', right: '$f\'(a)$', wrong: [['$f(a)$', '$f(a)$ is the height of the curve, not its slope.'], ['$a$', 'The $a$ is where we stand on the $x$-axis.'], ['$f\'\'(a)$', 'The second derivative says how the slope changes. The slope itself is $f\'(a)$.']] },
    { b: 2, id: 'near', q: 'The tangent line gives a good estimate of $f(x)$ when $x$ is…', right: 'close to $a$', wrong: [['far from $a$', 'The farther from $a$, the more the curve bends away from the line.'], ['very large', 'Size does not matter. Closeness to $a$ does.'], ['negative', 'The sign of $x$ does not matter. Closeness to $a$ does.']] },
    { b: 2, id: 'atA', q: 'For $L(x)=f(a)+f\'(a)(x-a)$, the value $L(a)$ equals…', right: '$f(a)$', wrong: [['$f\'(a)$', 'Put $x=a$ in: the term $(x-a)$ becomes 0, so only $f(a)$ is left.'], ['$0$', 'The $f(a)$ part stays when $x=a$.'], ['$a$', 'The line touches the curve at height $f(a)$, not $a$.']] },
    { b: 3, id: 'corner', q: 'Which graph does NOT straighten out when you zoom in at $x=0$?', right: '$f(x)=|x|$', wrong: [['$f(x)=x^2$', 'It is smooth, so it straightens out.'], ['$f(x)=e^x$', 'It is smooth, so it straightens out.'], ['$f(x)=\\sin x$', 'It is smooth, so it straightens out.']] },
    { b: 3, id: 'flat', q: 'If $f\'(a)=0$, the linearization at $a$ is…', right: 'the horizontal line $y=f(a)$', wrong: [['the vertical line $x=a$', 'A vertical line has no slope. A slope of 0 is horizontal.'], ['the line $y=0$', 'The line is flat but passes through the height $f(a)$.'], ['undefined', 'It is defined: $L(x)=f(a)+0\\cdot(x-a)=f(a)$.']] }
  ];

  var SPEC = {
    id: '4-6-pt1-local-linearity', course: 'calc', unit: 'Unit 4 · Contextual Applications of Differentiation', title: '4.6 Part 1 · Local Linearity: Zoom In and Write the Line',
    selfPaced: true,
    question: 'Why does a smooth curve look like its tangent line up close, and how do I write that line?',
    targets: ['I can say what a smooth curve looks like when I zoom in on it.', 'I can find the point and the slope of the tangent line at x = a.', 'I can write the linearization L(x) = f(a) + f′(a)(x − a).'],
    tabs: ['Warm-up', 'Predict', 'Concept (pictures)', 'I do (watch)', 'You do', 'Practice', 'Check', 'Wrap-up'],
    buildTarget: 'I can write the tangent line of a function at a point.',
    concepts: [
      { title: 'Local linearity', points: ['Zoom in on a smooth curve and it looks like a line.', 'That line is the tangent line.'], eq: 'curve ≈ line' },
      { title: 'The tangent line', points: ['It passes through $(a, f(a))$.', 'Its slope is $f\'(a)$.'], eq: 'L(x) = f(a) + f′(a)(x − a)' },
      { title: 'Near the point only', points: ['The line is a good estimate close to $a$.', 'It gets worse farther away.'], eq: 'x near a' }
    ],
    review: [
      { id: 'R1', title: 'Review 1', prompt: 'The derivative of $x^2$ at $x=3$ is…', options: ['6', '9', '3', '2'], answer: 0, why: '$\\dfrac{d}{dx}x^2=2x$, and $2(3)=6$.' },
      { id: 'R2', title: 'Review 2', prompt: 'A line has slope 4 and passes through $(2, 5)$. Its equation is…', options: ['$y=5+4(x-2)$', '$y=4+5(x-2)$', '$y=5+4x$', '$y=2+4(x-5)$'], answer: 0, why: 'Point-slope form: height of the point, plus slope times $(x-\\text{its }x)$.' },
      { id: 'R3', title: 'Review 3', prompt: 'The derivative of $\\sqrt{x}$ is…', options: ['$\\dfrac{1}{2\\sqrt{x}}$', '$2\\sqrt{x}$', '$\\dfrac{1}{\\sqrt{x}}$', '$\\dfrac12\\sqrt{x}$'], answer: 0, why: '$\\sqrt{x}=x^{1/2}$, so the power rule gives $\\tfrac12x^{-1/2}$.' }
    ],
    predicts: [
      { id: 'P1', title: 'Zoom in', prompt: 'You zoom in a great deal on the parabola $y=x^2$ near $x=1$. What does it look like?', options: ['almost a straight line', 'still a clear parabola', 'a circle', 'a sharp corner'], answer: 0, why: 'A smooth curve is nearly straight on a tiny piece. The tutorial lets you zoom to see it.' },
      { id: 'P2', title: 'How far does it work?', prompt: 'The tangent line to a curve at $x=4$ is used to estimate the curve’s height at $x=4.1$ and at $x=9$. Which estimate is better?', options: ['the one at 4.1', 'the one at 9', 'both are equally good', 'neither'], answer: 0, why: 'The tangent line follows the curve closely only near the point of tangency.' }
    ],

    tutorial: {
      moves: ['Find the point', 'Find the slope', 'Build the line', 'Use the line near the point'],
      concept: { title: 'Zoom in on a smooth curve', target: 'I can say what a smooth curve becomes when I zoom in, and why that line matters.', frames: [
        { head: 'A curve and its tangent line', show: 'zoom', st: { fn: 'x2', zoom: 0 }, guide: 'The blue curve is $y=x^2$. The thick red line is its tangent line at the black dot. Use the slider to zoom in on the dot.',
          say: 'Right now you can see the curve bending away from the red line.',
          ask: { type: 'choice', prompt: 'At this zoom, the curve and the red line…', options: ['are clearly different', 'look identical', 'cross at two points', 'are both horizontal'], answer: 0, why: 'At this zoom the curve bends away from the line. Next we zoom in.' } },
        { head: 'Zoom in a little', show: 'zoom', st: { fn: 'x2', zoom: 12 }, guide: 'The window is now about 10 times smaller around the dot. The readout shows the gap at the edge in pixels.',
          say: 'The window shrank to a small piece around the dot. The curve has straightened out a lot.',
          ask: { type: 'choice', prompt: 'As the window shrinks, the gap between curve and red line…', options: ['gets smaller', 'gets larger', 'stays the same', 'turns into a corner'], answer: 0, why: 'The readout shows the gap in pixels getting smaller as you zoom in.' } },
        { head: 'Zoom in a lot', show: 'zoom', st: { fn: 'x2', zoom: 28 }, guide: 'The window is now very tiny. You may only see one blue-and-red line.',
          say: 'Zoomed in a lot, the curve and the tangent line look like one line. This is called local linearity.',
          ask: { type: 'choice', prompt: 'A smooth curve zoomed in very close looks like…', options: ['its tangent line', 'a parabola', 'a corner', 'a circle'], answer: 0, why: 'The curve and its tangent line become the same line up close.' } },
        { head: 'Other functions too', show: 'zoom', st: { fn: 'sqrt', zoom: 24 }, guide: 'Now the curve is $\\sqrt{x}$ near $x=4$. Slide the zoom up and down.',
          say: 'It works for $\\sqrt{x}$ and for any smooth curve. Each point has its own tangent line.',
          ask: { type: 'choice', prompt: 'What does the tangent line share with the curve at the black dot?', options: ['the point and the slope', 'only the point', 'only the slope', 'nothing'], answer: 0, why: 'The line passes through the point and has the curve’s slope there, $f\'(a)$.', traps: { 1: 'It also matches the slope. That is why the two look alike up close.' } } },
        { head: 'Write the line', show: 'approx', st: { fn: 'sqrt', fixed: true, x0: 4 }, guide: 'The curve is $\\sqrt{x}$. The red line touches it at $x=4$. The black dot is the point $(4,2)$.',
          say: 'The tangent line at $x=a$ starts at height $f(a)$ and goes up with slope $f\'(a)$. So $L(x)=f(a)+f\'(a)(x-a)$.',
          ask: { type: 'choice', prompt: 'For $\\sqrt{x}$ at $a=4$ we have $f(4)=2$ and $f\'(4)=\\tfrac14$. Which is $L(x)$?', options: ['$2+\\tfrac14(x-4)$', '$\\tfrac14+2(x-4)$', '$2+\\tfrac14x$', '$\\tfrac14(x-4)$'], answer: 0, why: 'Start at the height 2, then add slope times $(x-4)$.', traps: { 1: 'The height and the slope are swapped.', 2: 'The step away from $a$ must be $(x-4)$, not $x$.', 3: 'The starting height 2 is missing.' } } },
        { head: 'It works near the point', show: 'approx', st: { fn: 'sqrt', x0: 4.2 }, guide: 'Slide $x$. The orange segment is the gap between the line and the curve. The readout says which is above.',
          say: 'Near $x=4$ the line and the curve are almost the same height.',
          ask: { type: 'choice', prompt: 'Close to $x=4$, the estimate $L(x)$ for $\\sqrt{x}$ is…', options: ['very close to the true value', 'far from the true value', 'always exact', 'always zero'], answer: 0, why: 'The gap is tiny near $x=4$.', traps: { 2: 'It is exact only at $x=4$ itself.' } } },
        { head: 'It gets worse far away', show: 'approx', st: { fn: 'sqrt', x0: 8 }, guide: 'Same picture, but $x$ is now 8. The orange gap is bigger.',
          say: 'Far from $x=4$ the line and the curve separate. The estimate gets worse.',
          ask: { type: 'choice', prompt: 'The farther $x$ is from 4, the estimate from the line is…', options: ['worse', 'better', 'the same', 'exact'], answer: 0, why: 'The curve bends away from the line, so the gap grows.' } }
      ] },
      ido: { target: 'I can watch the tangent line written in three moves on two functions and spot the common slip.',
        problem: 'Write the tangent line (the linearization) to $f(x)=\\sqrt{x}$ at $x=4$.',
        frames: [
          { head: 'Find the point', move: 'Move 1 · Find the point', show: 'approx', st: { fn: 'sqrt', fixed: true, x0: 4 }, guide: 'The curve $\\sqrt{x}$ with its tangent line at $x=4$. The black dot is the point.',
            say: 'The line touches the curve where $x=4$. Its height is $f(4)=\\sqrt4$.', work: ['$a=4$', '$f(4)=\\sqrt4=2$'],
            ask: { type: 'num', prompt: 'What is $f(4)$ for $f(x)=\\sqrt{x}$?', answer: 2, tol: 0, abs: 0.001, hint: 'What number times itself is 4?', why: '$\\sqrt4=2$, so the point is $(4,2)$.' } },
          { head: 'Find the slope', move: 'Move 2 · Find the slope', show: 'zoom', st: { fn: 'sqrt', zoom: 16 }, guide: 'Zoomed in on $\\sqrt{x}$ at $x=4$: the curve is almost the tangent line.',
            say: 'The slope is the derivative. Differentiate first, then put in $x=4$.', work: ['$f\'(x)=\\dfrac{1}{2\\sqrt{x}}$', '$f\'(4)=\\dfrac{1}{2\\cdot2}=\\dfrac14$'],
            ask: { type: 'choice', prompt: 'What is $f\'(4)$?', options: ['$\\dfrac14$', '$\\dfrac12$', '$2$', '$4$'], answer: 0, why: '$\\dfrac{1}{2\\sqrt4}=\\dfrac{1}{4}$.', traps: { 1: 'The 2 in the denominator multiplies $\\sqrt4=2$, giving 4.', 2: 'That is $f(4)$, the height, not the slope.' } } },
          { head: 'Build the line', move: 'Move 3 · Build the line', show: 'approx', st: { fn: 'sqrt', fixed: true, x0: 4 }, guide: 'The red line is $L(x)$.',
            say: 'Start at the height 2 and add the slope times $(x-4)$.', work: ['$L(x)=f(a)+f\'(a)(x-a)$', '$L(x)=2+\\tfrac14(x-4)$'],
            ask: { type: 'choice', prompt: 'Which line is the tangent line?', options: ['$L(x)=2+\\tfrac14(x-4)$', '$L(x)=\\tfrac14+2(x-4)$', '$L(x)=2+\\tfrac14x$', '$L(x)=2(x-4)$'], answer: 0, why: 'Height 2, slope $\\tfrac14$, step $(x-4)$.', traps: { 1: 'The height and the slope are swapped.', 2: 'The step must be $(x-4)$.', 3: 'The slope $\\tfrac14$ is missing.' } } },
          { head: 'Use it near the point', move: 'Move 4 · Use the line near the point', show: 'approx', st: { fn: 'sqrt', x0: 4.2 }, guide: 'Slide $x$ near 4 and read the two values in the readout.',
            say: 'At $x=4.2$: $L(4.2)=2+\\tfrac14(0.2)=2.05$. The true $\\sqrt{4.2}$ is about $2.0494$.', work: ['$L(4.2)=2+\\tfrac14(0.2)=2.05$'],
            ask: { type: 'num', prompt: 'Find $L(4.2)=2+\\tfrac14(4.2-4)$.', answer: 2.05, tol: 0.005, hint: '$\\tfrac14$ of 0.2 is 0.05.', why: '$2+0.05=2.05$.' } },
          { head: 'Problem 2: $x^2$ at $x=1$', move: 'Moves 1 to 3 · Point, slope, line', workClear: true, show: 'zoom', st: { fn: 'x2', zoom: 20 }, guide: 'Zoomed in on $y=x^2$ at $x=1$.',
            problem: 'Write the linearization of $f(x)=x^2$ at $a=1$.',
            say: 'Point: $f(1)=1$. Slope: $f\'(x)=2x$, so $f\'(1)=2$.', work: ['$f(1)=1$', '$f\'(1)=2$', '$L(x)=1+2(x-1)$'],
            ask: { type: 'choice', prompt: 'Which is $L(x)$ for $x^2$ at $a=1$?', options: ['$1+2(x-1)$', '$2+1(x-1)$', '$1+2x$', '$2(x-1)$'], answer: 0, why: 'Height $f(1)=1$, slope $f\'(1)=2$.', traps: { 1: 'Height and slope are swapped.', 2: 'The step must be $(x-1)$.', 3: 'The starting height 1 is missing.' } } },
          { head: 'The common slip', slip: true, show: 'zoom', st: { fn: 'x2', zoom: 20 }, guide: 'The red tangent line has slope 2 at the dot, not slope $2x$.',
            say: 'Slip: leaving the slope as $2x$, like $L(x)=1+2x(x-1)$. The slope must be a NUMBER: put $a$ into $f\'$ first.', work: ['Wrong: $L(x)=1+2x(x-1)$', 'Right: $L(x)=1+2(x-1)$'],
            ask: { type: 'choice', prompt: 'Why must the slope be a number?', options: ['A line has one slope. $f\'(a)$ is a single number.', 'Because $x$ is not allowed in a line.', 'Because 2x is too big.', 'It does not have to be.'], answer: 0, why: '$f\'(x)$ is a formula for slopes. The line uses one slope, at $x=a$.', traps: { 1: 'A line has $x$ in it. The slope is the part that must be a number.' } } }
        ] },
      summary: ['A smooth curve zoomed in very close looks like its tangent line (local linearity).', 'The tangent line at $x=a$ is $L(x)=f(a)+f\'(a)(x-a)$.', 'Find $f(a)$ and $f\'(a)$ as numbers first, then build the line.', 'The line is a good estimate only near $a$.']
    },

    skills: [
      { id: 'point', title: 'Find the point f(a)', gen: function (b, r) {
        b = Math.min(b, 3); var c = pick(r, poolFor(b)), ans = round2(fr(c.fa));
        return { type: 'num', tol: 0.005, data: { f: c.key, a: c.a }, prompt: 'For $f(x)=' + c.tex + '$, find $f(' + c.a + ')$. Give it to 2 decimal places if needed.', answer: ans,
          hint: 'Step card: (1) write the function, (2) put in $x=' + c.a + '$, (3) simplify. First step: replace every $x$ with ' + c.a + '. Same move: $f(x)=x^2$ at $x=3$ gives 9.', worked: '$f(' + c.a + ')=' + ftex(c.fa) + '$.' };
      } },

      { id: 'slope', title: 'Find the slope f′(a)', gen: function (b, r) {
        b = Math.min(b, 3); var c = pick(r, poolFor(b)), ans = round2(fr(c.d));
        return { type: 'num', tol: 0.005, data: { f: c.key, a: c.a }, prompt: 'For $f(x)=' + c.tex + '$, find $f\'(' + c.a + ')$. Give it to 2 decimal places if needed.', answer: ans,
          hint: 'Step card: (1) differentiate $f$, (2) put in $x=' + c.a + '$, (3) simplify. First step: write $f\'(x)$ before putting in any number. Same move: $f(x)=x^2$ gives $f\'(x)=2x$, and $f\'(3)=6$.', worked: 'Differentiate, then put in $x=' + c.a + '$: $f\'(' + c.a + ')=' + ftex(c.d) + '$.' };
      } },

      { id: 'line', title: 'Write the linearization', gen: function (b, r) {
        b = Math.min(b, 3); var c = pick(r, poolFor(b)), A = c.a, f = fstr(c.fa), d = fstr(c.d), ans = f + '+' + d + '*(x-' + A + ')';
        return { type: 'expr', prompt: 'Write the linearization of $f(x)=' + c.tex + '$ at $a=' + A + '$. Here $f(' + A + ')=' + ftex(c.fa) + '$ and $f\'(' + A + ')=' + ftex(c.d) + '$.', label: '$L(x)=$', answer: ans, vars: ['x'], data: { f: c.key, a: A },
          hints: ['Use $L(x)=f(a)+f\'(a)(x-a)$.', 'The starting height is $' + ftex(c.fa) + '$ and the slope is $' + ftex(c.d) + '$.', 'Write $(x-' + A + ')$, not just $x$.'],
          traps: [c.fa[0] !== 0 ? { expr: d + '*(x-' + A + ')', msg: 'The starting height $f(a)$ is missing. The line passes through $(a, f(a))$.' } : null, (A !== 0 && c.d[0] !== 0) ? { expr: f + '+' + d + '*x', msg: 'The step must be $(x-' + A + ')$, not $x$.' } : null, fr(c.fa) !== fr(c.d) ? { expr: d + '+' + f + '*(x-' + A + ')', msg: 'The height and the slope are swapped.' } : null, fr(c.fa) !== fr(c.d) ? { expr: f + '+' + f + '*(x-' + A + ')', msg: 'The slope is $f\'(a)$, not $f(a)$.' } : null].filter(Boolean),
          worked: '$L(x)=' + ftex(c.fa) + '+' + (c.d[0] < 0 ? '(' + ftex(c.d) + ')' : ftex(c.d)) + '(x-' + A + ')$.' };
      } },

      { id: 'meaning', title: 'What the line says', gen: function (b, r) {
        b = Math.min(b, 3); var pool = MEAN.filter(function (m) { return m.b === b || (b === 3 && m.b === 2 && r() < 0.3); }), c = pick(r, pool.length ? pool : MEAN), opts = [c.right], msgs = [''];
        c.wrong.forEach(function (w) { opts.push(w[0]); msgs.push(w[1]); });
        var mx = mix(r, opts, msgs);
        return { type: 'choice', data: { id: c.id, right: mx.answer }, prompt: c.q, options: mx.options, answer: mx.answer, why: mx.why,
          hint: 'Step card: (1) picture the curve zoomed in at the point, (2) ask what the tangent line shares with the curve, (3) the line is built from $f(a)$ and $f\'(a)$. First step: think of the red line touching the curve at one point. Same move: the tangent line to $x^2$ at 1 has slope 2 and height 1.',
          worked: 'The answer is ' + c.right + '. ' + (c.id === 'zoom' ? 'This is local linearity.' : c.id === 'near' ? 'The line is only a good estimate close to $a$.' : 'This follows from $L(x)=f(a)+f\'(a)(x-a)$.') };
      } }
    ],

    misconceptions: [
      { say: 'The slope in the line is 2x (the derivative formula).', fix: 'A line needs one slope: put x = a into f′ first.' },
      { say: 'L(x) = f′(a)(x − a) (no starting height).', fix: 'The line passes through (a, f(a)), so add f(a).' },
      { say: 'Write x instead of (x − a).', fix: '(x − a) measures how far x is from the point.' },
      { say: 'The tangent line is a good estimate everywhere.', fix: 'Only near x = a. It gets worse farther away.' },
      { say: 'Swap the height and the slope.', fix: 'f(a) is the height. f′(a) is the slope.' }
    ]
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = SPEC; else (root.SPECS = root.SPECS || {})[SPEC.id] = SPEC;
})(typeof window !== 'undefined' ? window : globalThis);
