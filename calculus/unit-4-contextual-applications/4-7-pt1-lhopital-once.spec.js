/* SPEC (calculus 4.7 part 1): indeterminate form 0/0 and L'Hopital's Rule used once. Visual tutorial, no huddle.
   Test data (tests/unit/lhopital.test.js recomputes each answer numerically from the JS strings in data):
     form   data.nj, data.dj (JS in x), data.a (number or Infinity), data.kind ('zz'|'ii'|'num'|'kz').
     step   data.nj, data.dj, data.npj, data.dpj: the test checks both derivatives by finite differences.
     once   data.nj, data.dj, data.a: the test measures the quotient next to a and compares with the answer.
     slip   data.kind and data.right. */
(function (root) {
  'use strict';
  var INT = function (r, a, b) { return a + Math.floor(r() * (b - a + 1)); };
  var pick = function (r, arr) { return arr[Math.floor(r() * arr.length)]; };
  var shuffle = function (r, arr) { var a = arr.slice(), i, j, t; for (i = a.length - 1; i > 0; i--) { j = Math.floor(r() * (i + 1)); t = a[i]; a[i] = a[j]; a[j] = t; } return a; };
  function mix(r, opts, msgs) { var order = shuffle(r, opts.map(function (_, i) { return i; })); return { options: order.map(function (i) { return opts[i]; }), answer: order.indexOf(0), why: order.map(function (i) { return msgs && msgs[i] ? msgs[i] : ''; }) }; }
  var round2 = function (x) { return Math.round(x * 100) / 100; };
  var DF = function (n, d) { return '\\dfrac{' + n + '}{' + d + '}'; };

  var FORMS = {
    zz: ['It gives $\\frac00$, so L’Hôpital’s Rule may be used.', 'Both the top and the bottom go to 0. That form tells us nothing yet.'],
    ii: ['It gives $\\frac{\\infty}{\\infty}$, so L’Hôpital’s Rule may be used.', 'Both the top and the bottom grow without bound. That form tells us nothing yet.'],
    num: ['It gives a plain number, so just plug in.', 'The bottom is not 0, so plugging in works. No rule is needed.'],
    kz: ['It gives a number over 0, so the rule does not apply.', 'The top is not 0 while the bottom is 0, so this is not a 0/0 form.']
  };
  var FORMSET = [
    { b: 1, kind: 'zz', tex: DF('x^2-9', 'x-3'), a: 3, nj: 'x*x-9', dj: 'x-3' }, { b: 1, kind: 'zz', tex: DF('x^2-25', 'x-5'), a: 5, nj: 'x*x-25', dj: 'x-5' }, { b: 1, kind: 'zz', tex: DF('x^2-1', 'x-1'), a: 1, nj: 'x*x-1', dj: 'x-1' },
    { b: 1, kind: 'num', tex: DF('x+4', 'x+1'), a: 2, nj: 'x+4', dj: 'x+1' }, { b: 1, kind: 'num', tex: DF('x^2+1', 'x+1'), a: 1, nj: 'x*x+1', dj: 'x+1' }, { b: 1, kind: 'kz', tex: DF('x^2+1', 'x-1'), a: 1, nj: 'x*x+1', dj: 'x-1' }, { b: 1, kind: 'kz', tex: DF('x+5', 'x-2'), a: 2, nj: 'x+5', dj: 'x-2' },
    { b: 2, kind: 'zz', tex: DF('e^x-1', 'x'), a: 0, nj: 'Math.exp(x)-1', dj: 'x' }, { b: 2, kind: 'zz', tex: DF('\\sin x', 'x'), a: 0, nj: 'Math.sin(x)', dj: 'x' }, { b: 2, kind: 'zz', tex: DF('\\ln x', 'x-1'), a: 1, nj: 'Math.log(x)', dj: 'x-1' }, { b: 2, kind: 'zz', tex: DF('x^3-8', 'x-2'), a: 2, nj: 'x*x*x-8', dj: 'x-2' },
    { b: 2, kind: 'num', tex: DF('e^x+1', 'x+1'), a: 0, nj: 'Math.exp(x)+1', dj: 'x+1' }, { b: 2, kind: 'num', tex: DF('\\cos x', 'x+1'), a: 0, nj: 'Math.cos(x)', dj: 'x+1' }, { b: 2, kind: 'kz', tex: DF('e^x', 'x'), a: 0, nj: 'Math.exp(x)', dj: 'x' }, { b: 2, kind: 'kz', tex: DF('\\cos x', 'x'), a: 0, nj: 'Math.cos(x)', dj: 'x' },
    { b: 3, kind: 'ii', tex: DF('x^2', 'e^x'), a: Infinity, nj: 'x*x', dj: 'Math.exp(x)', inf: true }, { b: 3, kind: 'ii', tex: DF('\\ln x', 'x'), a: Infinity, nj: 'Math.log(x)', dj: 'x', inf: true }, { b: 3, kind: 'ii', tex: DF('3x^2+1', 'x^2-4'), a: Infinity, nj: '3*x*x+1', dj: 'x*x-4', inf: true },
    { b: 3, kind: 'num', tex: DF('x^2-4', 'x+3'), a: 2, nj: 'x*x-4', dj: 'x+3' }, { b: 3, kind: 'num', tex: DF('x^2-4', 'x-2'), a: -2, nj: 'x*x-4', dj: 'x-2' }, { b: 3, kind: 'kz', tex: DF('x+1', 'x^2-4'), a: 2, nj: 'x+1', dj: 'x*x-4' }, { b: 3, kind: 'zz', tex: DF('1-\\cos x', 'x^2'), a: 0, nj: '1-Math.cos(x)', dj: 'x*x' }
  ];

  /* step: the derivative line. np/dp are the derivatives as tex; npj/dpj the same in JS for the test. */
  var STEP = [
    { b: 1, N: 'x^2-4', D: 'x-2', np: '2x', dp: '1', nj: 'x*x-4', dj: 'x-2', npj: '2*x', dpj: '1' }, { b: 1, N: 'x^2-9', D: 'x-3', np: '2x', dp: '1', nj: 'x*x-9', dj: 'x-3', npj: '2*x', dpj: '1' }, { b: 1, N: 'x^3-1', D: 'x-1', np: '3x^2', dp: '1', nj: 'x*x*x-1', dj: 'x-1', npj: '3*x*x', dpj: '1' },
    { b: 2, N: 'e^x-1', D: 'x', np: 'e^x', dp: '1', nj: 'Math.exp(x)-1', dj: 'x', npj: 'Math.exp(x)', dpj: '1' }, { b: 2, N: '\\sin x', D: 'x', np: '\\cos x', dp: '1', nj: 'Math.sin(x)', dj: 'x', npj: 'Math.cos(x)', dpj: '1' }, { b: 2, N: 'e^{2x}-1', D: 'x', np: '2e^{2x}', dp: '1', nj: 'Math.exp(2*x)-1', dj: 'x', npj: '2*Math.exp(2*x)', dpj: '1' }, { b: 2, N: '\\sin 3x', D: 'x', np: '3\\cos 3x', dp: '1', nj: 'Math.sin(3*x)', dj: 'x', npj: '3*Math.cos(3*x)', dpj: '1' },
    { b: 3, N: '\\ln x', D: 'x-1', np: '\\tfrac1x', dp: '1', nj: 'Math.log(x)', dj: 'x-1', npj: '1/x', dpj: '1' }, { b: 3, N: 'x^2-1', D: '\\ln x', np: '2x', dp: '\\tfrac1x', nj: 'x*x-1', dj: 'Math.log(x)', npj: '2*x', dpj: '1/x' }, { b: 3, N: 'e^x-1', D: 'x^2', np: 'e^x', dp: '2x', nj: 'Math.exp(x)-1', dj: 'x*x', npj: 'Math.exp(x)', dpj: '2*x' }, { b: 3, N: '\\sin 2x', D: '\\sin 5x', np: '2\\cos 2x', dp: '5\\cos 5x', nj: 'Math.sin(2*x)', dj: 'Math.sin(5*x)', npj: '2*Math.cos(2*x)', dpj: '5*Math.cos(5*x)' }
  ];

  function onceItem(b, r) {
    var a, k, m, n, p;
    if (b === 1) { a = INT(r, 1, 6); return { tex: DF('x^2-' + a * a, 'x-' + a), at: a, nj: 'x*x-' + a * a, dj: 'x-' + a, L: 2 * a, step: '2x', work: '$\\dfrac{2x}{1}$ at $x=' + a + '$ gives $' + 2 * a + '$.' }; }
    if (b === 2) { var t = INT(r, 0, 3);
      if (t === 0) { k = INT(r, 2, 6); return { tex: DF('e^{' + k + 'x}-1', 'x'), at: 0, nj: 'Math.exp(' + k + '*x)-1', dj: 'x', L: k, work: '$\\dfrac{' + k + 'e^{' + k + 'x}}{1}$ at $x=0$ gives $' + k + '$.' }; }
      if (t === 1) { k = INT(r, 2, 6); return { tex: DF('\\sin ' + k + 'x', 'x'), at: 0, nj: 'Math.sin(' + k + '*x)', dj: 'x', L: k, work: '$\\dfrac{' + k + '\\cos ' + k + 'x}{1}$ at $x=0$ gives $' + k + '$.' }; }
      if (t === 2) { a = INT(r, 1, 4); return { tex: DF('x^3-' + a * a * a, 'x-' + a), at: a, nj: 'x*x*x-' + a * a * a, dj: 'x-' + a, L: 3 * a * a, work: '$\\dfrac{3x^2}{1}$ at $x=' + a + '$ gives $' + 3 * a * a + '$.' }; }
      return { tex: DF('\\ln x', 'x-1'), at: 1, nj: 'Math.log(x)', dj: 'x-1', L: 1, work: '$\\dfrac{1/x}{1}$ at $x=1$ gives $1$.' }; }
    var u = INT(r, 0, 3);
    if (u === 0) { k = INT(r, 2, 5); m = INT(r, 2, 5); if (m === k) m = k + 1; return { tex: DF('\\sin ' + k + 'x', '\\sin ' + m + 'x'), at: 0, nj: 'Math.sin(' + k + '*x)', dj: 'Math.sin(' + m + '*x)', L: round2(k / m), work: '$\\dfrac{' + k + '\\cos ' + k + 'x}{' + m + '\\cos ' + m + 'x}$ at $x=0$ gives $\\dfrac{' + k + '}{' + m + '}$.' }; }
    if (u === 1) { n = INT(r, 2, 5); m = INT(r, 2, 5); if (m === n) m = n + 1; return { tex: DF('x^{' + n + '}-1', 'x^{' + m + '}-1'), at: 1, nj: 'Math.pow(x,' + n + ')-1', dj: 'Math.pow(x,' + m + ')-1', L: round2(n / m), work: '$\\dfrac{' + n + 'x^{' + (n - 1) + '}}{' + m + 'x^{' + (m - 1) + '}}$ at $x=1$ gives $\\dfrac{' + n + '}{' + m + '}$.' }; }
    if (u === 2) { k = INT(r, 3, 7); m = INT(r, 1, k - 1); return { tex: DF('e^{' + k + 'x}-e^{' + m + 'x}', 'x'), at: 0, nj: 'Math.exp(' + k + '*x)-Math.exp(' + m + '*x)', dj: 'x', L: k - m, work: '$\\dfrac{' + k + 'e^{' + k + 'x}-' + m + 'e^{' + m + 'x}}{1}$ at $x=0$ gives $' + k + '-' + m + '=' + (k - m) + '$.' }; }
    a = INT(r, 1, 3); return { tex: DF('x^2-' + a * a, 'x^3-' + a * a * a), at: a, nj: 'x*x-' + a * a, dj: 'x*x*x-' + a * a * a, L: round2(2 / (3 * a)), work: '$\\dfrac{2x}{3x^2}$ at $x=' + a + '$ gives $\\dfrac{2}{' + 3 * a + '}$.' };
  }

  var SPEC = {
    id: '4-7-pt1-lhopital-once', course: 'calc', unit: 'Unit 4 · Contextual Applications of Differentiation', title: '4.7 Part 1 · L’Hôpital’s Rule: Spot 0/0 and Use It Once',
    selfPaced: true,
    question: 'What do I do when plugging in gives 0/0?',
    targets: ['I can tell when plugging in gives 0/0, ∞/∞, a number, or a number over 0.', 'I can use L’Hôpital’s Rule once, taking the top and bottom derivatives separately.', 'I can say when the rule does not apply.'],
    tabs: ['Warm-up', 'Predict', 'Concept (pictures)', 'I do (watch)', 'You do', 'Practice', 'Check', 'Wrap-up'],
    buildTarget: 'I can find a 0/0 limit with L’Hôpital’s Rule used once.',
    concepts: [
      { title: 'Plug in first', points: ['Put $x=a$ into the top and bottom.', 'A plain number means you are done.'], eq: 'plug in' },
      { title: 'Indeterminate form', points: ['$\\frac00$ and $\\frac{\\infty}{\\infty}$ tell you nothing yet.', 'They need another way.'], eq: '0/0' },
      { title: 'L’Hôpital’s Rule', points: ['For $\\frac00$ or $\\frac{\\infty}{\\infty}$: $\\lim\\dfrac fg=\\lim\\dfrac{f\'}{g\'}$.', 'Differentiate top and bottom SEPARATELY.'], eq: 'lim f/g = lim f′/g′' }
    ],
    review: [
      { id: 'R1', title: 'Review 1', prompt: 'The derivative of $e^{2x}$ is…', options: ['$2e^{2x}$', '$e^{2x}$', '$2xe^{2x}$', '$\\tfrac12e^{2x}$'], answer: 0, why: 'Chain rule: the derivative of the inside, 2, rides along.' },
      { id: 'R2', title: 'Review 2', prompt: '$\\displaystyle\\lim_{x\\to3}(x^2+1)$ is…', options: ['10', '9', '3', '0'], answer: 0, why: 'The function is smooth, so plug in: $9+1=10$.' },
      { id: 'R3', title: 'Review 3', prompt: 'The derivative of $\\sin 3x$ is…', options: ['$3\\cos 3x$', '$\\cos 3x$', '$-3\\cos 3x$', '$3\\sin 3x$'], answer: 0, why: 'The derivative of $\\sin$ is $\\cos$, and the 3 rides along.' }
    ],
    predicts: [
      { id: 'P1', title: 'Two lines', prompt: 'Near $x=1$, $f(x)=6(x-1)$ and $g(x)=3(x-1)$ both go to 0. The ratio $f(x)/g(x)$ goes to…', options: ['2', '0', '1', 'it does not exist'], answer: 0, why: 'The factors $(x-1)$ cancel, leaving $6/3=2$. The slopes 6 and 3 give the ratio.' },
      { id: 'P2', title: 'A mystery limit', prompt: '$\\displaystyle\\lim_{x\\to0}\\dfrac{\\sin x}{x}$ plugs in to $\\dfrac00$. The limit is…', options: ['1', '0', 'it does not exist', '$\\infty$'], answer: 0, why: 'Near 0, $\\sin x$ looks like $x$, so the ratio is about 1. The tutorial shows the rule that proves it.' }
    ],

    tutorial: {
      moves: ['Plug in', 'Name the form', 'Differentiate top and bottom', 'Plug in again'],
      concept: { title: 'When plugging in fails', target: 'I can say what each plug-in result means for a limit.', frames: [
        { head: 'Plug in first', show: 'forms', st: { hi: 0 }, guide: 'The table has three rows: what plugging in gives, what it means, and what to do next. The gold row is the one we are on.',
          say: 'To find a limit as $x\\to a$, first put $x=a$ into the top and the bottom.',
          ask: { type: 'num', prompt: 'Plug $x=2$ into $\\dfrac{x+4}{x+1}$. What number is the limit?', answer: 2, tol: 0, abs: 0.001, hint: 'The top is 6 and the bottom is 3.', why: '$\\dfrac{6}{3}=2$. A plain number means we are done.' } },
        { head: 'The form 0/0', show: 'forms', st: { hi: 1 }, guide: 'The second row is the form $\\frac00$.',
          say: 'Plugging $x=2$ into $\\dfrac{x^2-4}{x-2}$ gives $\\dfrac00$. That tells us nothing yet.',
          ask: { type: 'choice', prompt: 'What does $\\dfrac00$ tell us about the limit?', options: ['nothing yet: it needs another method', 'the limit is 0', 'the limit does not exist', 'the limit is 1'], answer: 0, why: 'Zero over zero could be any number. We need to look closer.', traps: { 1: 'Top 0 and bottom 0 can give any value, not just 0.', 2: 'It might exist. We just cannot tell yet.' } } },
        { head: 'Watch a ratio settle', show: 'ratio', st: { fn: 'poly', k: 0 }, guide: 'Blue is $f(x)=x^2-4$ and orange is $g(x)=x-2$. Both reach 0 at $x=2$. The table lists $f\\div g$ as $x$ moves toward 2. Slide $x$ along the steps.',
          say: 'Both go to 0, but their ratio does not: slide $x$ toward 2 and watch $f\\div g$.',
          ask: { type: 'num', prompt: 'Slide to step 5 ($x=2.01$). The ratio $f\\div g$ is close to what?', answer: 4, tol: 0, abs: 0.05, hint: 'Read the last row of the table.', why: 'The ratio settles at about 4, so the limit is 4.' } },
        { head: 'Slopes decide the ratio', show: 'ratio', st: { fn: 'lines', k: 2 }, guide: 'Two straight lines through $x=1$: $f$ has slope 6 and $g$ has slope 3. The ratio column is the same at every step.',
          say: 'Near the point each function looks like a line. The ratio of the lines is the ratio of their slopes.',
          ask: { type: 'num', prompt: '$f$ has slope 6 and $g$ has slope 3. What does $f\\div g$ settle at?', answer: 2, tol: 0, abs: 0.001, hint: 'Slope of $f$ divided by slope of $g$.', why: '$6\\div3=2$. The ratio of slopes is the ratio of the functions near the point.' } },
        { head: 'Slopes are derivatives', show: 'ratio', st: { fn: 'exp', k: 3 }, guide: 'Blue is $f(x)=e^{2x}-1$ and orange is $g(x)=x$. Both are 0 at $x=0$. The ratio column settles near 2.',
          say: 'The slope of $f$ at 0 is $f\'(0)=2$ and the slope of $g$ is $g\'(0)=1$. So the ratio settles at $\\dfrac{f\'(0)}{g\'(0)}=2$.',
          ask: { type: 'num', prompt: '$f(x)=e^{2x}-1$ has $f\'(0)=2$ and $g(x)=x$ has $g\'(0)=1$. Find $\\dfrac{f\'(0)}{g\'(0)}$.', answer: 2, tol: 0, abs: 0.001, hint: '$2\\div1$.', why: '$2$. This matches the table.' } },
        { head: 'L’Hôpital’s Rule', show: 'ratio', st: { fn: 'sin', k: 3 }, guide: 'Blue is $\\sin 3x$ and orange is $x$. The ratio settles at 3.',
          say: 'This is L’Hôpital’s Rule: for $\\frac00$, the limit of $\\dfrac fg$ equals the limit of $\\dfrac{f\'}{g\'}$.',
          ask: { type: 'num', prompt: 'For $\\dfrac{\\sin3x}{x}$ at 0, $f\'=3\\cos3x$ and $g\'=1$. Find $\\dfrac{f\'(0)}{g\'(0)}$.', answer: 3, tol: 0, abs: 0.001, hint: '$\\cos0=1$.', why: '$\\dfrac{3\\cdot1}{1}=3$. This matches the table.' } },
        { head: 'Top and bottom SEPARATELY', show: 'forms', st: { hi: 1 }, guide: 'The $\\frac00$ row. The rule says to take the derivative of the top and of the bottom on their own.',
          say: 'Differentiate the top and the bottom each on its own. Do NOT use the quotient rule on the whole fraction.',
          ask: { type: 'choice', prompt: 'For $\\dfrac{x^2-4}{x-2}$, which is the L’Hôpital step?', options: ['$\\dfrac{2x}{1}$', '$\\dfrac{2x(x-2)-(x^2-4)}{(x-2)^2}$', '$\\dfrac{2x}{x-2}$', '$\\dfrac{x^2-4}{1}$'], answer: 0, why: 'Derivative of the top over derivative of the bottom.', traps: { 1: 'That is the quotient rule. L’Hôpital takes the two derivatives separately.', 2: 'The bottom must be differentiated too.', 3: 'The top must be differentiated too.' } } },
        { head: 'When the rule does NOT apply', show: 'forms', st: { hi: 2 }, guide: 'The third row: a number over 0.',
          say: 'The rule works only for $\\frac00$ or $\\frac{\\infty}{\\infty}$. For $\\dfrac30$ the limit is not a finite number, and the rule does not apply.',
          ask: { type: 'choice', prompt: 'Plugging $x=1$ into $\\dfrac{x+2}{x-1}$ gives $\\dfrac30$. Can we use the rule?', options: ['No: it is not 0/0 or ∞/∞', 'Yes: it is always allowed', 'Yes: the answer is 3', 'Yes: the answer is 0'], answer: 0, why: 'The top is 3, not 0. The rule needs 0/0 or ∞/∞.', traps: { 1: 'It applies only to 0/0 and ∞/∞.' } } }
      ] },
      ido: { target: 'I can watch two 0/0 limits solved with the rule used once, and spot the common slip.',
        problem: 'Find $\\displaystyle\\lim_{x\\to0}\\dfrac{e^{2x}-1}{x}$.',
        frames: [
          { head: 'Plug in', move: 'Move 1 · Plug in', show: 'ratio', st: { fn: 'exp', k: 0 }, guide: 'Blue is $e^{2x}-1$ and orange is $x$. At $x=0$ both are 0.',
            say: 'Put $x=0$ into the top and the bottom.', work: ['Top: $e^0-1=0$', 'Bottom: $0$'],
            ask: { type: 'num', prompt: 'What is the top, $e^{2x}-1$, at $x=0$?', answer: 0, tol: 0, abs: 0.001, hint: '$e^0=1$.', why: '$e^0-1=0$.' } },
          { head: 'Name the form', move: 'Move 2 · Name the form', show: 'forms', st: { hi: 1 }, guide: 'The gold row of the table is the form $\\frac00$.',
            say: 'Top 0 and bottom 0 is the form $\\frac00$. The rule may be used.', work: ['Form: $\\dfrac00$'],
            ask: { type: 'choice', prompt: 'Which form is it?', options: ['$\\dfrac00$', '$\\dfrac{\\infty}{\\infty}$', 'a plain number', 'number over 0'], answer: 0, why: 'Both the top and the bottom are 0.' } },
          { head: 'Differentiate top and bottom', move: 'Move 3 · Differentiate top and bottom', show: 'ratio', st: { fn: 'exp', k: 3 }, guide: 'The ratio of slopes: $f\'=2e^{2x}$ and $g\'=1$.',
            say: 'Differentiate the top on its own and the bottom on its own.', work: ['$\\dfrac{(e^{2x}-1)\'}{(x)\'}=\\dfrac{2e^{2x}}{1}$'],
            ask: { type: 'choice', prompt: 'Which line is the L’Hôpital step?', options: ['$\\dfrac{2e^{2x}}{1}$', '$\\dfrac{e^{2x}}{1}$', '$\\dfrac{2e^{2x}}{x}$', '$\\dfrac{2xe^{2x}-(e^{2x}-1)}{x^2}$'], answer: 0, why: 'The derivative of $e^{2x}$ is $2e^{2x}$, and of $x$ is 1.', traps: { 1: 'The chain rule factor 2 is missing.', 2: 'The bottom must be differentiated too.', 3: 'That is the quotient rule.' } } },
          { head: 'Plug in again', move: 'Move 4 · Plug in again', show: 'ratio', st: { fn: 'exp', k: 4 }, guide: 'The ratio is near 2 at the last step.',
            say: 'Now put $x=0$ into the new fraction.', work: ['$\\dfrac{2e^0}{1}=2$', 'So the limit is $2$'],
            ask: { type: 'num', prompt: 'Find $\\dfrac{2e^{0}}{1}$.', answer: 2, tol: 0, abs: 0.001, hint: '$e^0=1$.', why: '$2\\times1=2$.' } },
          { head: 'Problem 2: a polynomial', move: 'Moves 1 and 2 · Plug in and name', workClear: true, show: 'forms', st: { hi: 1 }, guide: 'The table row to check: is the form $\\frac00$?',
            problem: 'Find $\\displaystyle\\lim_{x\\to1}\\dfrac{x^3-1}{x^2-1}$.',
            say: 'Put $x=1$ into both: $1-1=0$ on top and $1-1=0$ on the bottom.', work: ['Top: $1^3-1=0$', 'Bottom: $1^2-1=0$', 'Form: $\\dfrac00$'],
            ask: { type: 'choice', prompt: 'Which form does $x=1$ give?', options: ['$\\dfrac00$', 'a number over 0', 'a plain number', '$\\dfrac{\\infty}{\\infty}$'], answer: 0, why: 'Top 0 and bottom 0.' } },
          { head: 'Differentiate and plug in', move: 'Moves 3 and 4', show: 'forms', st: { hi: 1 }, guide: 'The rule: top and bottom separately.',
            say: 'The top becomes $3x^2$ and the bottom becomes $2x$. Then put $x=1$.', work: ['$\\dfrac{3x^2}{2x}$', 'at $x=1$: $\\dfrac32$'],
            ask: { type: 'num', prompt: 'Find $\\dfrac{3x^2}{2x}$ at $x=1$.', answer: 1.5, tol: 0, abs: 0.001, hint: '$\\dfrac{3}{2}$.', why: '$\\dfrac{3}{2}=1.5$.' } },
          { head: 'The common slip', slip: true, show: 'forms', st: { hi: 1 }, guide: 'The quotient rule is for the derivative of a fraction. L’Hôpital is a different tool.',
            say: 'Slip: using the quotient rule on the whole fraction. The rule takes the derivative of the top and of the bottom on their own.', work: ['Wrong: $\\dfrac{3x^2(x^2-1)-(x^3-1)2x}{(x^2-1)^2}$', 'Right: $\\dfrac{3x^2}{2x}$'],
            ask: { type: 'choice', prompt: 'What is wrong with the first line?', options: ['It uses the quotient rule. The rule needs top and bottom derivatives separately.', 'It has too many $x$ values.', 'Nothing is wrong.', 'The top should be zero.'], answer: 0, why: 'L’Hôpital says $\\lim\\dfrac fg=\\lim\\dfrac{f\'}{g\'}$, with no quotient rule.', traps: { 2: 'The first line puts $0/0$ again, so it never settles.' } } }
        ] },
      summary: ['Always plug in first. A plain number means you are done.', '$\\frac00$ and $\\frac{\\infty}{\\infty}$ are indeterminate: the rule may be used.', 'L’Hôpital: $\\lim\\dfrac fg=\\lim\\dfrac{f\'}{g\'}$, with top and bottom differentiated separately.', 'A number over 0 is not indeterminate. The rule does not apply.']
    },

    skills: [
      { id: 'form', title: 'Name the form', gen: function (b, r) {
        b = Math.min(b, 3); var pool = FORMSET.filter(function (f) { return f.b === b; }), c = pick(r, pool), at = c.inf ? '\\infty' : String(c.a);
        var mx = mix(r, [FORMS[c.kind][0], FORMS.zz[0] === FORMS[c.kind][0] ? FORMS.ii[0] : FORMS.zz[0], FORMS.num[0] === FORMS[c.kind][0] ? FORMS.kz[0] : FORMS.num[0], FORMS.kz[0] === FORMS[c.kind][0] ? FORMS.ii[0] : FORMS.kz[0]], ['', 'Plug in again carefully. Find the top and the bottom separately.', 'Plug in again carefully. Find the top and the bottom separately.', 'Plug in again carefully. Find the top and the bottom separately.']);
        var seen = {}; mx.options = mx.options.map(function (o, i) { if (seen[o]) { var rest = [FORMS.zz[0], FORMS.ii[0], FORMS.num[0], FORMS.kz[0]].filter(function (x) { return !seen[x] && mx.options.indexOf(x) < 0; }); o = rest[0] || o; } seen[o] = 1; return o; });
        mx.options[mx.answer] = FORMS[c.kind][0];
        return { type: 'choice', data: { nj: c.nj, dj: c.dj, a: c.a, kind: c.kind, right: mx.answer }, prompt: 'Find $\\displaystyle\\lim_{x\\to' + at + '}' + c.tex + '$. Put $x=' + at + '$ into the top and bottom. What happens?', options: mx.options, answer: mx.answer, why: mx.why,
          hint: 'Step card: (1) put $x=' + at + '$ into the top, (2) put it into the bottom, (3) compare: both 0, both huge, a plain number, or a number over 0. First step: find the top by itself. Same move: $\\dfrac{x^2-4}{x-2}$ at $x=2$ gives top 0 and bottom 0.',
          worked: FORMS[c.kind][1] + ' ' + FORMS[c.kind][0] };
      } },

      { id: 'step', title: 'The L’Hôpital step', gen: function (b, r) {
        b = Math.min(b, 3); var pool = STEP.filter(function (s) { return s.b === b; }), c = pick(r, pool), right = '$' + DF(c.np, c.dp) + '$',
          quot = '$' + DF('(' + c.np + ')(' + c.D + ')-(' + c.N + ')(' + c.dp + ')', '(' + c.D + ')^2') + '$', onlyTop = '$' + DF(c.np, c.D) + '$', onlyBot = '$' + DF(c.N, c.dp) + '$';
        var mx = mix(r, [right, quot, onlyTop, onlyBot], ['', 'That is the quotient rule. L’Hôpital differentiates the top and the bottom separately.', 'The bottom also needs its derivative.', 'The top also needs its derivative.']);
        return { type: 'choice', data: { nj: c.nj, dj: c.dj, npj: c.npj, dpj: c.dpj, right: mx.answer }, prompt: '$\\dfrac{' + c.N + '}{' + c.D + '}$ gives $\\frac00$. Which line is the L’Hôpital step?', options: mx.options, answer: mx.answer, why: mx.why,
          hint: 'Step card: (1) differentiate the top by itself, (2) differentiate the bottom by itself, (3) put the new top over the new bottom. First step: the derivative of $' + c.N + '$ is $' + c.np + '$. Same move: $\\dfrac{x^2-4}{x-2}$ becomes $\\dfrac{2x}{1}$.',
          worked: 'Top: $(' + c.N + ')\'=' + c.np + '$. Bottom: $(' + c.D + ')\'=' + c.dp + '$. The step is ' + right + '.' };
      } },

      { id: 'once', title: 'Find the limit', gen: function (b, r) {
        b = Math.min(b, 3); var c = onceItem(b, r), ans = Math.round(c.L * 100) / 100, A = c.at;
        return { type: 'num', tol: 0.005, data: { nj: c.nj, dj: c.dj, a: A }, prompt: 'Find $\\displaystyle\\lim_{x\\to' + A + '}' + c.tex + '$. Give it to 2 decimal places if needed.', answer: ans,
          hint: 'Step card: (1) plug in $x=' + A + '$ and check for $\\frac00$, (2) differentiate the top and the bottom separately, (3) plug in again. First step: the top and bottom are both 0 at $x=' + A + '$. Same move: $\\dfrac{x^2-4}{x-2}$ becomes $\\dfrac{2x}{1}$, and at $x=2$ it is 4.',
          worked: 'Both go to 0, so use the rule. ' + c.work };
      } },

      { id: 'slip', title: 'Spot the slip', gen: function (b, r) {
        b = Math.min(b, 3); var kinds = b === 1 ? ['quot'] : (b === 2 ? ['quot', 'top'] : ['quot', 'top', 'misuse']), kind = pick(r, kinds), a = INT(r, 2, 6), N = 'x^2-' + a * a, D = 'x-' + a, line, right, why;
        if (kind === 'quot') { line = '$\\dfrac{2x(x-' + a + ')-(x^2-' + a * a + ')}{(x-' + a + ')^2}$'; right = 'It used the quotient rule instead of separate derivatives.'; why = 'L’Hôpital takes the derivative of the top and of the bottom on their own: $\\dfrac{2x}{1}$.'; }
        else if (kind === 'top') { line = '$\\dfrac{2x}{x-' + a + '}$'; right = 'It differentiated only the top.'; why = 'The bottom needs its own derivative too, which is 1.'; }
        else { var m = INT(r, 2, 5); line = 'The limit of $\\dfrac{x+' + m + '}{x+1}$ as $x\\to' + a + '$: “this is a limit, so use the rule: $\\dfrac11=1$.”'; right = 'The form was not $\\frac00$, so the rule was not allowed. Plug in instead.'; why = 'At $x=' + a + '$ the top is ' + (a + m) + ' and the bottom is ' + (a + 1) + ', a plain number. Just plug in: $\\dfrac{' + (a + m) + '}{' + (a + 1) + '}$.'; }
        var mx = mix(r, [right, 'It used the right method but made an arithmetic error.', 'It should have differentiated the top twice.', 'There is no error.'], ['', 'The method itself is the problem, not the arithmetic.', 'The rule uses one derivative of the top and one of the bottom.', 'Look again: something is off.']);
        return { type: 'choice', data: { kind: kind, right: mx.answer }, prompt: kind === 'misuse' ? 'A student writes: ' + line + ' What is wrong?' : 'A student uses L’Hôpital’s Rule on $\\dfrac{' + N + '}{' + D + '}$ at $x=' + a + '$ and writes ' + line + '. What is wrong?', options: mx.options, answer: mx.answer, why: mx.why,
          hint: 'Step card: (1) was the form 0/0 or ∞/∞, (2) did the student take one derivative of the top and one of the bottom, (3) did anything else get mixed in. First step: check the form first. Same move: $\\dfrac{x^2-4}{x-2}$ should become $\\dfrac{2x}{1}$.',
          worked: right + ' ' + why };
      } }
    ],

    misconceptions: [
      { say: 'Use the quotient rule on the fraction.', fix: 'L’Hôpital: derivative of the top and derivative of the bottom, separately.' },
      { say: '0/0 means the limit is 0 (or 1, or does not exist).', fix: '0/0 tells you nothing yet. It needs another method.' },
      { say: 'Use the rule on any limit.', fix: 'Only for 0/0 or ∞/∞. Plug in first.' },
      { say: 'A number over 0 can use the rule.', fix: 'It is not indeterminate. The limit is not a finite number.' },
      { say: 'Forget to plug in again after differentiating.', fix: 'The answer is the limit of the new fraction, so plug in again.' }
    ]
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = SPEC; else (root.SPECS = root.SPECS || {})[SPEC.id] = SPEC;
})(typeof window !== 'undefined' ? window : globalThis);
