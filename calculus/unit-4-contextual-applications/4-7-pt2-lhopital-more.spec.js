/* SPEC (calculus 4.7 part 2): L'Hopital's Rule again, as x goes to infinity, and when NOT to use it. Visual tutorial, no huddle.
   Test data (tests/unit/lhopital-more.test.js recomputes each answer numerically from the JS strings in data):
     twice   data.nj, data.dj, data.a (0): the test measures the quotient next to a.
     infty   data.nj, data.dj, data.kind ('zero'|'inf'|'const'), data.value.     again   data.nj, data.dj, data.a, data.kind ('again'|'stop').
     notuse  data.opts (each {nj, dj, a}) and data.right: exactly the right one is NOT indeterminate. */
(function (root) {
  'use strict';
  var INT = function (r, a, b) { return a + Math.floor(r() * (b - a + 1)); };
  var pick = function (r, arr) { return arr[Math.floor(r() * arr.length)]; };
  var shuffle = function (r, arr) { var a = arr.slice(), i, j, t; for (i = a.length - 1; i > 0; i--) { j = Math.floor(r() * (i + 1)); t = a[i]; a[i] = a[j]; a[j] = t; } return a; };
  function mix(r, opts, msgs) { var order = shuffle(r, opts.map(function (_, i) { return i; })); return { options: order.map(function (i) { return opts[i]; }), answer: order.indexOf(0), why: order.map(function (i) { return msgs && msgs[i] ? msgs[i] : ''; }) }; }
  var round2 = function (x) { return Math.round(x * 100) / 100; };
  var DF = function (n, d) { return '\\dfrac{' + n + '}{' + d + '}'; };
  var kx = function (k) { return k === 1 ? 'x' : k + 'x'; };

  function twiceItem(b, r) {
    var k;
    if (b === 1) { k = INT(r, 1, 3); return { tex: DF('1-\\cos ' + kx(k), 'x^2'), nj: '1-Math.cos(' + k + '*x)', dj: 'x*x', L: k * k / 2, work: 'First use: $\\dfrac{' + (k === 1 ? '' : k) + '\\sin ' + kx(k) + '}{2x}$, still $\\frac00$. Second use: $\\dfrac{' + k * k + '\\cos ' + kx(k) + '}{2}$, and at $x=0$ that is $\\dfrac{' + k * k + '}{2}$.', first: '\\dfrac{' + (k === 1 ? '' : k) + '\\sin ' + kx(k) + '}{2x}' }; }
    if (b === 2) { k = INT(r, 1, 3); return { tex: DF('e^{' + kx(k) + '}-1-' + kx(k), 'x^2'), nj: 'Math.exp(' + k + '*x)-1-' + k + '*x', dj: 'x*x', L: k * k / 2, work: 'First use: $\\dfrac{' + (k === 1 ? '' : k) + 'e^{' + kx(k) + '}-' + k + '}{2x}$, still $\\frac00$. Second use: $\\dfrac{' + k * k + 'e^{' + kx(k) + '}}{2}$, and at $x=0$ that is $\\dfrac{' + k * k + '}{2}$.', first: '\\dfrac{' + (k === 1 ? '' : k) + 'e^{' + kx(k) + '}-' + k + '}{2x}' }; }
    k = INT(r, 1, 3); return { tex: DF(kx(k) + '-\\sin ' + kx(k), 'x^3'), nj: k + '*x-Math.sin(' + k + '*x)', dj: 'x*x*x', L: k * k * k / 6, work: 'The rule is needed three times: $\\dfrac{' + k + '-' + k + '\\cos ' + kx(k) + '}{3x^2}$, then $\\dfrac{' + k * k + '\\sin ' + kx(k) + '}{6x}$, then $\\dfrac{' + k * k * k + '\\cos ' + kx(k) + '}{6}$. At $x=0$ that is $\\dfrac{' + k * k * k + '}{6}$.', first: '\\dfrac{' + k + '-' + k + '\\cos ' + kx(k) + '}{3x^2}' };
  }

  var INFTY = [
    { b: 1, tex: DF('\\ln x', 'x'), nj: 'Math.log(x)', dj: 'x', kind: 'zero', v: 0, why: 'The bottom grows much faster than $\\ln x$. By the rule: $\\dfrac{1/x}{1}\\to0$.' },
    { b: 1, tex: DF('x', 'e^x'), nj: 'x', dj: 'Math.exp(x)', kind: 'zero', v: 0, why: '$e^x$ beats $x$. By the rule: $\\dfrac{1}{e^x}\\to0$.' },
    { b: 1, tex: DF('x^2', 'x'), nj: 'x*x', dj: 'x', kind: 'inf', v: Infinity, why: '$\\dfrac{x^2}{x}=x$, which grows without bound.' },
    { b: 2, tex: DF('x^3', 'e^x'), nj: 'x*x*x', dj: 'Math.exp(x)', kind: 'zero', v: 0, why: 'The rule three times gives $\\dfrac{6}{e^x}\\to0$.' },
    { b: 2, tex: DF('e^x', 'x^2'), nj: 'Math.exp(x)', dj: 'x*x', kind: 'inf', v: Infinity, why: '$e^x$ grows much faster than $x^2$.' },
    { b: 2, tex: DF('3x^2+1', 'x^2-4'), nj: '3*x*x+1', dj: 'x*x-4', kind: 'const', v: 3, why: 'The rule: $\\dfrac{6x}{2x}=3$.' },
    { b: 2, tex: DF('5x^2', 'x^2+7x'), nj: '5*x*x', dj: 'x*x+7*x', kind: 'const', v: 5, why: 'The rule twice: $\\dfrac{10x}{2x+7}$, then $\\dfrac{10}{2}=5$.' },
    { b: 3, tex: DF('\\ln x', '\\sqrt{x}'), nj: 'Math.log(x)', dj: 'Math.sqrt(x)', kind: 'zero', v: 0, why: 'The rule: $\\dfrac{1/x}{1/(2\\sqrt x)}=\\dfrac{2}{\\sqrt x}\\to0$.' },
    { b: 3, tex: DF('x^5', '2^x'), nj: 'Math.pow(x,5)', dj: 'Math.pow(2,x)', kind: 'zero', v: 0, why: 'An exponential beats any power of $x$.' },
    { b: 3, tex: DF('e^{2x}', 'e^x'), nj: 'Math.exp(2*x)', dj: 'Math.exp(x)', kind: 'inf', v: Infinity, why: '$\\dfrac{e^{2x}}{e^x}=e^x\\to\\infty$.' },
    { b: 3, tex: DF('4x^3-x', '2x^3+5'), nj: '4*x*x*x-x', dj: '2*x*x*x+5', kind: 'const', v: 2, why: 'The rule three times: $\\dfrac{24}{12}=2$.' }
  ];

  var AGAIN = [
    { b: 1, tex: DF('\\sin x', '2x'), a: '0', nj: 'Math.sin(x)', dj: '2*x', a_: 0, kind: 'again', why: 'At $x=0$ the top is 0 and the bottom is 0: $\\frac00$ again.' },
    { b: 1, tex: DF('\\cos x', '2'), a: '0', nj: 'Math.cos(x)', dj: '2', a_: 0, kind: 'stop', val: '\\tfrac12', why: 'At $x=0$ it is $\\dfrac12$, a plain number.' },
    { b: 2, tex: DF('e^x', '2x+1'), a: '0', nj: 'Math.exp(x)', dj: '2*x+1', a_: 0, kind: 'stop', val: '1', why: 'At $x=0$ it is $\\dfrac11=1$, a plain number.' },
    { b: 2, tex: DF('2x', 'e^x'), a: '\\infty', nj: '2*x', dj: 'Math.exp(x)', a_: Infinity, kind: 'again', why: 'As $x\\to\\infty$ it is $\\frac{\\infty}{\\infty}$ again.' },
    { b: 2, tex: DF('e^x-1', '2x'), a: '0', nj: 'Math.exp(x)-1', dj: '2*x', a_: 0, kind: 'again', why: 'At $x=0$ the top is 0 and the bottom is 0: $\\frac00$ again.' },
    { b: 3, tex: DF('2', 'e^x'), a: '\\infty', nj: '2', dj: 'Math.exp(x)', a_: Infinity, kind: 'stop', val: '0', why: 'The top stays 2 while the bottom grows without bound, so the fraction goes to 0.' },
    { b: 3, tex: DF('6x', '6'), a: '0', nj: '6*x', dj: '6', a_: 0, kind: 'stop', val: '0', why: 'At $x=0$ it is $\\dfrac06=0$, a plain number.' },
    { b: 3, tex: DF('2\\cos 2x', '1+\\cos x'), a: '\\pi', nj: '2*Math.cos(2*x)', dj: '1+Math.cos(x)', a_: Math.PI, kind: 'stop-kz', why: 'At $x=\\pi$ the top is 2 and the bottom is 0: a number over 0. The rule does not apply.' }
  ];

  var IND = [
    { tex: DF('x^2-9', 'x-3'), a: 3, nj: 'x*x-9', dj: 'x-3' }, { tex: DF('e^x-1', 'x'), a: 0, nj: 'Math.exp(x)-1', dj: 'x' }, { tex: DF('\\sin x', 'x'), a: 0, nj: 'Math.sin(x)', dj: 'x' }, { tex: DF('\\ln x', 'x-1'), a: 1, nj: 'Math.log(x)', dj: 'x-1' }, { tex: DF('x^3-8', 'x-2'), a: 2, nj: 'x*x*x-8', dj: 'x-2' }
  ], NOTIND = [
    { tex: DF('x+4', 'x+1'), a: 2, nj: 'x+4', dj: 'x+1', why: 'Plugging in gives $\\dfrac63=2$, a plain number.' }, { tex: DF('\\cos x', 'x+1'), a: 0, nj: 'Math.cos(x)', dj: 'x+1', why: 'Plugging in gives $\\dfrac11=1$, a plain number.' },
    { tex: DF('x^2+1', 'x-1'), a: 1, nj: 'x*x+1', dj: 'x-1', why: 'Plugging in gives $\\dfrac20$, a number over 0.' }, { tex: DF('e^x', 'x'), a: 0, nj: 'Math.exp(x)', dj: 'x', why: 'Plugging in gives $\\dfrac10$, a number over 0.' }, { tex: DF('x^2-4', 'x+3'), a: 2, nj: 'x*x-4', dj: 'x+3', why: 'Plugging in gives $\\dfrac05=0$, a plain number.' }
  ];

  var SPEC = {
    id: '4-7-pt2-lhopital-more', course: 'calc', unit: 'Unit 4 · Contextual Applications of Differentiation', title: '4.7 Part 2 · L’Hôpital’s Rule: Again, Infinity and When Not to Use It',
    selfPaced: true,
    question: 'When is the rule needed twice, how does it work at infinity, and when must I not use it?',
    targets: ['I can use L’Hôpital’s Rule again when the new fraction is still 0/0.', 'I can use the rule for limits as x goes to infinity.', 'I can decide when to stop and when the rule does not apply.'],
    tabs: ['Warm-up', 'Predict', 'Concept (pictures)', 'I do (watch)', 'You do', 'Practice', 'Check', 'Wrap-up'],
    buildTarget: 'I can use L’Hôpital’s Rule more than once and know when to stop.',
    concepts: [
      { title: 'Check after each use', points: ['After one use, plug in again.', 'Still $\\frac00$ or $\\frac{\\infty}{\\infty}$: use the rule again.'], eq: 'repeat until not 0/0' },
      { title: 'At infinity', points: ['$\\frac{\\infty}{\\infty}$ is also indeterminate.', 'The rule works the same way.'], eq: 'x → ∞' },
      { title: 'Who grows faster', points: ['$e^x$ beats every power of $x$.', 'Every power of $x$ beats $\\ln x$.'], eq: 'ln x ≪ xⁿ ≪ eˣ' },
      { title: 'Stop when it is not indeterminate', points: ['A plain number: the limit is that number.', 'A number over 0: the rule does not apply.'], eq: 'stop!' }
    ],
    review: [
      { id: 'R1', title: 'Review 1', prompt: 'The derivative of $1-\\cos x$ is…', options: ['$\\sin x$', '$-\\sin x$', '$\\cos x$', '$1+\\sin x$'], answer: 0, why: 'The derivative of $-\\cos x$ is $+\\sin x$.' },
      { id: 'R2', title: 'Review 2', prompt: '$\\dfrac{\\sin x}{2x}$ at $x=0$ gives…', options: ['$\\dfrac00$', '$\\dfrac12$', '$0$', '$\\dfrac{1}{0}$'], answer: 0, why: '$\\sin 0=0$ and $2\\cdot0=0$.' },
      { id: 'R3', title: 'Review 3', prompt: '$\\dfrac{2}{e^x}$ as $x\\to\\infty$ is…', options: ['0', '2', '$\\infty$', '1'], answer: 0, why: 'The bottom grows without bound while the top stays 2.' }
    ],
    predicts: [
      { id: 'P1', title: 'Who wins?', prompt: 'As $x$ gets very big, which grows faster, $x^2$ or $e^x$?', options: ['$e^x$', '$x^2$', 'they grow at the same rate', 'neither grows'], answer: 0, why: 'An exponential beats any power. The tutorial shows the table.' },
      { id: 'P2', title: 'Twice', prompt: 'Plugging $x=0$ into $\\dfrac{1-\\cos x}{x^2}$ gives $\\dfrac00$. The limit is…', options: ['$\\dfrac12$', '$0$', '$1$', 'it does not exist'], answer: 0, why: 'It takes the rule twice and gives $\\dfrac{\\cos x}{2}\\to\\dfrac12$.' }
    ],

    tutorial: {
      moves: ['Plug in', 'Use the rule', 'Plug in again', 'Repeat or stop'],
      concept: { title: 'More than once, and at infinity', target: 'I can say when to use the rule again, and who wins as x grows.', frames: [
        { head: 'Still 0/0? Go again', show: 'forms', st: { hi: 1 }, guide: 'The $\\frac00$ row of the table.',
          say: 'After one use of the rule, plug in again. If it is still $\\frac00$, use the rule again.',
          ask: { type: 'choice', prompt: 'For $\\dfrac{1-\\cos x}{x^2}$ at 0, one use gives $\\dfrac{\\sin x}{2x}$. At $x=0$ that is…', options: ['$\\dfrac00$, so use the rule again', 'a plain number', '$\\dfrac10$', '$\\infty$'], answer: 0, why: '$\\sin0=0$ and $2\\cdot0=0$, so it is $\\frac00$ again.' } },
        { head: 'The second use', show: 'forms', st: { hi: 1 }, guide: 'Same table row: the form $\\frac00$ is highlighted.',
          say: 'Use the rule on $\\dfrac{\\sin x}{2x}$: the top gives $\\cos x$ and the bottom gives 2. At $x=0$: $\\dfrac{\\cos0}{2}=\\dfrac12$.',
          ask: { type: 'num', prompt: 'Find $\\dfrac{\\cos x}{2}$ at $x=0$.', answer: 0.5, tol: 0, abs: 0.001, hint: '$\\cos0=1$.', why: '$\\dfrac{1}{2}=0.5$. This is the limit.' } },
        { head: 'The form ∞/∞', show: 'growth', st: { fn: 'xex', k: 1 }, guide: 'Two bars on a log scale: $x$ in blue and $e^x$ in orange. The table lists both values at bigger and bigger $x$. Slide the steps.',
          say: 'As $x\\to\\infty$, both $x$ and $e^x$ get huge. That is the form $\\frac{\\infty}{\\infty}$, and the rule applies.',
          ask: { type: 'choice', prompt: 'In the table, which grows faster: $x$ or $e^x$?', options: ['$e^x$', '$x$', 'they are equal', 'neither'], answer: 0, why: 'The orange values explode while the blue values barely grow.' } },
        { head: 'The ratio shrinks to 0', show: 'growth', st: { fn: 'xex', k: 4 }, guide: 'The last column is $x\\div e^x$. Watch it at $x=40$.',
          say: 'At $x=40$ the ratio $x\\div e^x$ is almost 0. By the rule: $\\dfrac{1}{e^x}\\to0$.',
          ask: { type: 'choice', prompt: '$\\displaystyle\\lim_{x\\to\\infty}\\dfrac{x}{e^x}$ is…', options: ['0', '1', '$\\infty$', 'it does not exist'], answer: 0, why: 'The bottom grows without bound and the top barely moves, so the ratio goes to 0.' } },
        { head: 'A bigger power needs more uses', show: 'growth', st: { fn: 'x2ex', k: 3 }, guide: 'Now $x^2$ in blue and $e^x$ in orange.',
          say: 'For $\\dfrac{x^2}{e^x}$: $\\dfrac{2x}{e^x}$ is still $\\frac{\\infty}{\\infty}$, then $\\dfrac{2}{e^x}\\to0$. Two uses.',
          ask: { type: 'choice', prompt: '$\\displaystyle\\lim_{x\\to\\infty}\\dfrac{x^2}{e^x}$ is…', options: ['0', '2', '$\\infty$', '1'], answer: 0, why: 'After two uses: $\\dfrac{2}{e^x}\\to0$.', traps: { 1: 'The 2 stays on top, and the bottom grows without bound.' } } },
        { head: 'Logs lose to powers', show: 'growth', st: { fn: 'lnx', k: 3 }, guide: '$\\ln x$ in blue and $x$ in orange.',
          say: 'The log grows very slowly. $\\dfrac{\\ln x}{x}$ becomes $\\dfrac{1/x}{1}\\to0$.',
          ask: { type: 'choice', prompt: '$\\displaystyle\\lim_{x\\to\\infty}\\dfrac{\\ln x}{x}$ is…', options: ['0', '1', '$\\infty$', '$e$'], answer: 0, why: 'The log is far slower than $x$, so the ratio goes to 0.' } },
        { head: 'Two powers', show: 'growth', st: { fn: 'x2x3', k: 3 }, guide: '$x^2$ in blue and $x^3$ in orange.',
          say: 'A higher power wins. $\\dfrac{x^2}{x^3}\\to0$, and $\\dfrac{x^3}{x^2}\\to\\infty$.',
          ask: { type: 'choice', prompt: '$\\displaystyle\\lim_{x\\to\\infty}\\dfrac{x^2}{x^3}$ is…', options: ['0', '1', '$\\infty$', '$\\dfrac23$'], answer: 0, why: 'The bottom is the bigger power, so the ratio goes to 0.' } },
        { head: 'Stop when it is not indeterminate', show: 'forms', st: { hi: 0 }, guide: 'The first row: a plain number.',
          say: 'Plug in after each use. When you get a plain number, stop: that is the limit, and using the rule again gives a wrong answer.',
          ask: { type: 'choice', prompt: 'You use the rule once and get $\\dfrac{e^x}{2x+1}$ at $x=0$. What now?', options: ['Plug in: $\\dfrac11=1$, and stop.', 'Use the rule again.', 'The limit does not exist.', 'The limit is 0.'], answer: 0, why: 'The result is a plain number, so we are done.', traps: { 1: 'Using the rule again here changes the answer. It is only for 0/0 or ∞/∞.' } } }
      ] },
      ido: { target: 'I can watch the rule used twice and at infinity, and spot the common slip.',
        problem: 'Find $\\displaystyle\\lim_{x\\to0}\\dfrac{1-\\cos x}{x^2}$.',
        frames: [
          { head: 'Plug in', move: 'Move 1 · Plug in', show: 'forms', st: { hi: 1 }, guide: 'The table row for the form $\\frac00$ is highlighted.',
            say: 'Put $x=0$ into the top and the bottom.', work: ['Top: $1-\\cos0=0$', 'Bottom: $0^2=0$', 'Form: $\\dfrac00$'],
            ask: { type: 'num', prompt: 'What is $1-\\cos0$?', answer: 0, tol: 0, abs: 0.001, hint: '$\\cos0=1$.', why: '$1-1=0$.' } },
          { head: 'Use the rule', move: 'Move 2 · Use the rule', show: 'forms', st: { hi: 1 }, guide: 'The $\\frac00$ row again: take the top and bottom derivatives separately.',
            say: 'The top becomes $\\sin x$ and the bottom becomes $2x$.', work: ['$\\dfrac{\\sin x}{2x}$'],
            ask: { type: 'choice', prompt: 'Which is the first use of the rule?', options: ['$\\dfrac{\\sin x}{2x}$', '$\\dfrac{-\\sin x}{2x}$', '$\\dfrac{\\sin x}{x^2}$', '$\\dfrac{\\cos x}{2x}$'], answer: 0, why: 'The derivative of $1-\\cos x$ is $\\sin x$. The derivative of $x^2$ is $2x$.', traps: { 1: 'The two minus signs cancel: $-(-\\sin x)=\\sin x$.', 2: 'The bottom also needs its derivative.', 3: 'The derivative of $-\\cos x$ is $\\sin x$.' } } },
          { head: 'Plug in again', move: 'Move 3 · Plug in again', show: 'forms', st: { hi: 1 }, guide: 'Same table row: the new fraction is $\\frac00$ again.',
            say: 'Put $x=0$ into $\\dfrac{\\sin x}{2x}$: $\\dfrac00$ again.', work: ['$\\dfrac{\\sin0}{2\\cdot0}=\\dfrac00$ again'],
            ask: { type: 'choice', prompt: '$\\dfrac{\\sin x}{2x}$ at $x=0$ is…', options: ['$\\dfrac00$ again', 'a plain number', '$\\dfrac10$', '$\\dfrac{\\infty}{\\infty}$'], answer: 0, why: 'Both are 0 again, so use the rule again.' } },
          { head: 'Repeat the rule', move: 'Move 4 · Repeat or stop', show: 'forms', st: { hi: 0 }, guide: 'Now a plain number appears.',
            say: 'Second use: the top gives $\\cos x$ and the bottom gives 2, so at $x=0$ it is $\\dfrac12$. A plain number: stop.', work: ['$\\dfrac{\\cos x}{2}\\to\\dfrac{1}{2}$', 'The limit is $\\dfrac12$'],
            ask: { type: 'num', prompt: 'Find $\\dfrac{\\cos0}{2}$.', answer: 0.5, tol: 0, abs: 0.001, hint: '$\\cos0=1$.', why: '$\\dfrac12=0.5$.' } },
          { head: 'Problem 2: infinity', move: 'Moves 1 and 2 · Plug in, use the rule', workClear: true, show: 'growth', st: { fn: 'x2ex', k: 3 }, guide: 'Blue is $x^2$ and orange is $e^x$. Both explode as $x$ grows.',
            problem: 'Find $\\displaystyle\\lim_{x\\to\\infty}\\dfrac{x^2}{e^x}$.',
            say: 'Both the top and the bottom go to $\\infty$: the form is $\\frac{\\infty}{\\infty}$. Use the rule.', work: ['Form: $\\dfrac{\\infty}{\\infty}$', '$\\dfrac{2x}{e^x}$'],
            ask: { type: 'choice', prompt: 'After one use, $\\dfrac{2x}{e^x}$ as $x\\to\\infty$ is…', options: ['$\\dfrac{\\infty}{\\infty}$ again', 'a plain number', '0', 'a number over 0'], answer: 0, why: '$2x$ and $e^x$ both grow without bound.' } },
          { head: 'Again, then stop', move: 'Moves 3 and 4', show: 'growth', st: { fn: 'x2ex', k: 4 }, guide: 'At $x=40$, $x^2\\div e^x$ is nearly 0.',
            say: 'Second use: $\\dfrac{2}{e^x}$. The top stays 2 and the bottom grows, so it goes to 0.', work: ['$\\dfrac{2}{e^x}\\to0$', 'The limit is $0$'],
            ask: { type: 'choice', prompt: '$\\dfrac{2}{e^x}$ as $x\\to\\infty$ is…', options: ['0', '2', '$\\infty$', '1'], answer: 0, why: 'A fixed top over a huge bottom goes to 0.' } },
          { head: 'The common slip', slip: true, show: 'forms', st: { hi: 0 }, guide: 'The first row says: a plain number means stop.',
            say: 'Slip: $\\displaystyle\\lim_{x\\to0}\\dfrac{e^x-1}{x^2+x}$ gives $\\frac00$, then $\\dfrac{e^x}{2x+1}=\\dfrac11=1$: STOP, because another use gives the wrong $\\dfrac12$.', work: ['Right: $\\dfrac{e^0}{2(0)+1}=1$', 'Wrong: another use gives $\\dfrac12$'],
            ask: { type: 'choice', prompt: 'Why is a second use wrong here?', options: ['The new fraction is not 0/0 or ∞/∞, so the rule no longer applies.', 'The rule can only be used once.', 'The second derivative of $e^x$ is 0.', 'It is not wrong.'], answer: 0, why: 'Plug in after each use. A plain number means stop.', traps: { 1: 'It can be used again, but only while the form is still 0/0 or ∞/∞.' } } }
        ] },
      summary: ['After each use, plug in. Still $\\frac00$ or $\\frac{\\infty}{\\infty}$: use the rule again.', 'As $x\\to\\infty$: $\\ln x$ is slower than $x^n$, which is slower than $e^x$.', 'A plain number means stop: that number is the limit.', 'A number over 0 is not indeterminate. The rule does not apply.']
    },

    skills: [
      { id: 'twice', title: 'Use the rule more than once', gen: function (b, r) {
        b = Math.min(b, 3); var c = twiceItem(b, r), ans = round2(c.L);
        return { type: 'num', tol: 0.005, data: { nj: c.nj, dj: c.dj, a: 0 }, prompt: 'Find $\\displaystyle\\lim_{x\\to0}' + c.tex + '$. Give it to 2 decimal places if needed.', answer: ans,
          hint: 'Step card: (1) plug in $x=0$ and check for $\\frac00$, (2) use the rule, and plug in again, (3) if it is still $\\frac00$, use the rule again. First step: after the first use you get $' + c.first + '$. Same move: $\\dfrac{1-\\cos x}{x^2}$ gives $\\dfrac{\\sin x}{2x}$, still $\\frac00$, then $\\dfrac{\\cos x}{2}\\to\\dfrac12$.',
          worked: c.work };
      } },

      { id: 'infty', title: 'Limits at infinity', gen: function (b, r) {
        b = Math.min(b, 3); var pool = INFTY.filter(function (c) { return c.b === b; }), c = pick(r, pool), opts, msgs;
        if (c.kind === 'const') { var v = c.v, alt = v + 1; opts = ['$' + v + '$', '$0$', '$\\infty$', '$' + alt + '$']; msgs = ['', 'The top and the bottom grow at the same rate, so the ratio does not go to 0.', 'The top and the bottom grow at the same rate, so the ratio does not blow up.', 'Use the rule until the form is not indeterminate.']; }
        else { var right = c.kind === 'zero' ? '$0$' : '$\\infty$', other = c.kind === 'zero' ? '$\\infty$' : '$0$'; opts = [right, other, '$1$', 'it does not exist']; msgs = ['', c.kind === 'zero' ? 'The bottom grows faster, so the ratio shrinks.' : 'The top grows faster, so the ratio grows.', 'Different growth rates never give a ratio of 1.', 'It is $\\infty$ or 0. Compare how fast the top and the bottom grow.']; }
        var mx = mix(r, opts, msgs);
        return { type: 'choice', data: { nj: c.nj, dj: c.dj, kind: c.kind, value: c.v, right: mx.answer }, prompt: 'Find $\\displaystyle\\lim_{x\\to\\infty}' + c.tex + '$.', options: mx.options, answer: mx.answer, why: mx.why,
          hint: 'Step card: (1) the form is $\\frac{\\infty}{\\infty}$, (2) use the rule, or compare who grows faster, (3) a faster bottom gives 0, a faster top gives $\\infty$. First step: say which of the top and bottom grows faster. Same move: $\\dfrac{x}{e^x}\\to0$ because $e^x$ wins.',
          worked: c.why };
      } },

      { id: 'again', title: 'Again, or stop?', gen: function (b, r) {
        b = Math.min(b, 3); var pool = AGAIN.filter(function (c) { return c.b === b; }), c = pick(r, pool), kind = c.kind === 'stop-kz' ? 'stop-kz' : c.kind, opts = ['Use the rule again.', 'Stop: plug in, and the limit is the number you get.', 'Stop: it is a number over 0, so the rule does not apply.', 'Stop: the limit is 0 because the top is 0.'], right = kind === 'again' ? 0 : (kind === 'stop-kz' ? 2 : 1);
        var order = [opts[right]].concat(opts.filter(function (o, i) { return i !== right; })), msgs = ['', 'Check the form again after plugging in.', 'Check the form again after plugging in.', 'Check the form again after plugging in.'], mx = mix(r, order, msgs);
        return { type: 'choice', data: { nj: c.nj, dj: c.dj, a: c.a_, kind: c.kind, right: mx.answer }, prompt: 'After one use of the rule you have $\\displaystyle\\lim_{x\\to' + c.a + '}' + c.tex + '$. What do you do next?', options: mx.options, answer: mx.answer, why: mx.why,
          hint: 'Step card: (1) plug in $x=' + c.a + '$ to the top, (2) plug in to the bottom, (3) $\\frac00$ or $\\frac{\\infty}{\\infty}$ means again; anything else means stop. First step: find the top and the bottom values. Same move: $\\dfrac{\\cos x}{2}$ at 0 is $\\dfrac12$: stop.',
          worked: c.why + (c.kind === 'again' ? ' So use the rule again.' : ' So stop.') };
      } },

      { id: 'notuse', title: 'Which one is NOT for the rule?', gen: function (b, r) {
        b = Math.min(b, 3); var ni = pick(r, NOTIND), others = shuffle(r, IND).slice(0, 3), opts = [ni].concat(others), strs = opts.map(function (o) { return '$\\displaystyle\\lim_{x\\to' + o.a + '}' + o.tex + '$'; }),
          mx = mix(r, strs, ['', 'Plug in: this one gives $\\frac00$, so the rule may be used.', 'Plug in: this one gives $\\frac00$, so the rule may be used.', 'Plug in: this one gives $\\frac00$, so the rule may be used.']), perm = mx.options.map(function (s) { return strs.indexOf(s); });
        return { type: 'choice', data: { opts: perm.map(function (i) { return { nj: opts[i].nj, dj: opts[i].dj, a: opts[i].a }; }), right: mx.answer }, prompt: 'Plug in for each limit. Which one is NOT a form where L’Hôpital’s Rule applies?', options: mx.options, answer: mx.answer, why: mx.why,
          hint: 'Step card: (1) plug in the value for each limit, (2) the rule applies only if the top and the bottom are both 0 (or both infinite), (3) pick the one that is not. First step: check the top and bottom of the first one. Same move: $\\dfrac{x+4}{x+1}$ at 2 gives $\\dfrac63$, a plain number.',
          worked: ni.why + ' So the rule is not for this limit.' };
      } }
    ],

    misconceptions: [
      { say: 'Use the rule again even when the form is a plain number.', fix: 'Plug in after each use. A plain number means stop.' },
      { say: '∞/∞ means the limit is 1.', fix: '∞/∞ is indeterminate. The growth rates decide: 0, ∞ or a number.' },
      { say: 'A number over 0 can use the rule.', fix: 'It is not 0/0 or ∞/∞. The rule does not apply.' },
      { say: 'The quotient rule is part of the rule.', fix: 'Differentiate the top and the bottom separately.' },
      { say: 'xⁿ beats eˣ as x grows.', fix: 'eˣ beats every power of x. Every power of x beats ln x.' }
    ]
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = SPEC; else (root.SPECS = root.SPECS || {})[SPEC.id] = SPEC;
})(typeof window !== 'undefined' ? window : globalThis);
