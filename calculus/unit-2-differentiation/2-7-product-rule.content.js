/* 2.7 The Product Rule: content for the student lesson and the teacher key.
   Every answer here is checked by a sympy script before release (see verify notes in the PR).
   Expressions use the mathcheck syntax: x^2, 3x, e^x, ln(x), sqrt(x), sin(x), implicit multiplication.
   Levels: 1 Build (support), 2 Apply (core), 3 Stretch, 4 Extend. Students never see the level numbers. */
(function (root) {
  'use strict';
  var MC = root.MC;

  function L(s, vars) { return MC.toLatex(s, vars || ['x']); }
  function E(id, label, answer, o) { var f = { id: id, type: 'expr', label: label, answer: answer }; for (var k in (o || {})) f[k] = o[k]; return f; }
  function N(id, label, answer, o) { var f = { id: id, type: 'num', label: label, answer: answer }; for (var k in (o || {})) f[k] = o[k]; return f; }
  function M(id, label, choices, ans) { return { id: id, type: 'mc', label: label, choices: choices, ans: ans }; }
  function T(id, label, min, o) { var f = { id: id, type: 'text', label: label, min: min || 20 }; for (var k in (o || {})) f[k] = o[k]; return f; }
  function Q(id, prompt, fields, o) { var q = { id: id, prompt: prompt, fields: fields }; for (var k in (o || {})) q[k] = o[k]; return q; }

  var ABFG = ['a', 'b', 'f', 'g'];
  var WRONG_FPGP = 'That is $f\' \\cdot g\'$, each derivative multiplied. The rectangle showed the rate uses one derivative and one original function in each strip.';

  /* ---------- Warm-up: places the student, hidden ---------- */
  var READY = [
    Q('r1', 'Differentiate.', [E('a', '$\\dfrac{d}{dx}\\,x^5=$', '5x^4')],
      { skill: 'power rule', worked: '$\\dfrac{d}{dx}x^n=nx^{n-1}$, so $\\dfrac{d}{dx}x^5=5x^4$.' }),
    Q('r2', 'Differentiate.', [E('a', '$\\dfrac{d}{dx}\\,(3x^2-4x+7)=$', '6x-4')],
      { skill: 'polynomial', worked: 'Differentiate term by term: $6x-4+0$. The constant 7 disappears.' }),
    Q('r3', 'Differentiate. Rewrite the root as a power first if that helps.', [E('a', '$\\dfrac{d}{dx}\\,\\sqrt{x}=$', '1/(2sqrt(x))')],
      { skill: 'radicals', worked: '$\\sqrt{x}=x^{1/2}$, so the derivative is $\\tfrac12x^{-1/2}=\\dfrac{1}{2\\sqrt{x}}$.' }),
    Q('r4', 'Differentiate.', [E('a', '$\\dfrac{d}{dx}\\,(2\\sin x+e^x)=$', '2cos(x)+e^x')],
      { skill: 'trig and exponential', worked: '$\\sin x$ becomes $\\cos x$ and $e^x$ is its own derivative: $2\\cos x+e^x$.' }),
    Q('r5', 'Let $f(x)=x^3$. Find the number $f\'(2)$.', [N('a', '$f\'(2)=$', 12)],
      { skill: 'evaluate a derivative', worked: '$f\'(x)=3x^2$, so $f\'(2)=3\\cdot4=12$.' }),
    Q('r6', 'Multiply out first, then differentiate.', [E('a', '$\\dfrac{d}{dx}\\,\\big[(x+2)(x+5)\\big]=$', '2x+7')],
      { skill: 'expand then differentiate', worked: '$(x+2)(x+5)=x^2+7x+10$, and its derivative is $2x+7$.' })
  ];

  /* ---------- Prediction and the one-line test ---------- */
  var PREDICT = {
    choices: [
      '$(fg)\' = f\' \\cdot g\'$: differentiate each factor, then multiply.',
      'There is more to it. The answer has to involve $f$ and $g$ themselves, not only their derivatives.',
      'No idea yet.'
    ],
    test: Q('p-test',
      'Test the guess on one pair. Let $f(x)=x^2$ and $g(x)=x^3$, so $f(x)g(x)=x^5$. Evaluate both sides at $x=1$.',
      [N('a', '$(fg)\'(1)$, from differentiating $x^5$:', 5),
       N('b', '$f\'(1)\\cdot g\'(1)$:', 6),
       M('c', 'So the guess $(fg)\'=f\'g\'$ is', ['true for every pair of functions', 'false, because one counterexample is enough', 'true only at $x=1$'], 1)],
      { hints: ['$x^2\\cdot x^3=x^5$ and the power rule gives $5x^4$.', 'For the second number: $f\'=2x$ and $g\'=3x^2$. Evaluate each at 1, then multiply.'],
        worked: '$(x^5)\'=5x^4$, which is 5 at $x=1$. Separately $f\'(1)=2$ and $g\'(1)=3$, and $2\\cdot3=6$. The two sides disagree (5 vs 6), so the guess fails.' })
  };

  /* ---------- Sim missions ---------- */
  var RECT_A = { f: 4, g: 3, fp: 2, gp: 1 };
  var MISSIONS = {
    rectA: RECT_A,
    m1: [
      Q('m1a', 'The green strip is $f\'\\Delta t$ wide and $g$ tall. With $\\Delta t=0.5$, what is its area?', [N('a', 'Green strip area:', 3)],
        { hints: ['Width is $f\'\\Delta t=2\\cdot0.5$. Height is $g=3$.'], worked: 'Width $2(0.5)=1$, height 3, so area 3.' }),
      Q('m1b', 'The orange strip is $f$ wide and $g\'\\Delta t$ tall. Same $\\Delta t=0.5$. What is its area?', [N('a', 'Orange strip area:', 2)],
        { hints: ['Width is $f=4$. Height is $g\'\\Delta t=1\\cdot0.5$.'], worked: 'Width 4, height $1(0.5)=0.5$, so area 2.' }),
      Q('m1c', 'The strips total $3+2=5$. The sim says the whole rectangle grew by $\\Delta A=5.5$. The missing 0.5 must be which region?',
        [M('a', 'Missing area:', ['the red corner, $f\'\\Delta t$ by $g\'\\Delta t$', 'the starting rectangle', 'a rounding error in the sim'], 0)],
        { worked: 'The region that is in neither strip is the corner where the two strips meet.' }),
      Q('m1d', 'Check it with a formula. Find the corner\'s area, $(f\'\\Delta t)(g\'\\Delta t)$.', [N('a', 'Corner area:', 0.5)],
        { good: 'Strips plus corner account for every bit of the growth: $3+2+0.5=5.5$.' })
    ],
    m2: [
      Q('m2a', 'Now $\\Delta t=0.1$. Before you grow it, predict the corner\'s area.', [N('a', 'Corner area:', 0.02, { tol: 0.0005 })],
        { hints: ['Corner is $f\'g\'\\Delta t^2=2\\cdot1\\cdot(0.1)^2$.'], worked: '$2\\cdot1\\cdot0.01=0.02$.' }),
      Q('m2b', 'Predict the average rate of area growth $\\Delta A/\\Delta t$ at $\\Delta t=0.1$.',
        [N('a', '$\\Delta A/\\Delta t=$', 10.2, { tol: 0.005 })],
        { hints: ['Strips: $0.6+0.4=1.0$. Add the corner $0.02$ to get $\\Delta A$.', 'Divide $\\Delta A$ by $\\Delta t=0.1$.'], worked: '$\\Delta A=0.6+0.4+0.02=1.02$, and $1.02/0.1=10.2$.' }),
      Q('m2c', 'You grew it at $\\Delta t=0.1$ and at $0.01$. The rate $\\Delta A/\\Delta t$ went 11, 10.2, 10.02. What number is it approaching as $\\Delta t\\to0$?',
        [N('a', 'Limit of $\\Delta A/\\Delta t$:', 10)], { worked: 'The corner part of the rate is $f\'g\'\\Delta t$, which goes to 0. What remains is the strips\' rate, 10.' }),
      Q('m2d', 'Split that 10 into the two strip rates, using $f=4,\\ g=3,\\ f\'=2,\\ g\'=1$.',
        [N('a', '$f\'g=$', 6), N('b', '$fg\'=$', 4)], { good: 'So the limit is $f\'g+fg\'=6+4=10$.' }),
      Q('m2e', 'When $\\Delta t$ is cut in half, each strip halves but the corner drops to a quarter. In your own words, why does the corner stop mattering as $\\Delta t\\to0$?',
        [T('a', '', 30, { placeholder: 'Because the corner shrinks like ... while the strips shrink like ...', sample: 'The corner depends on delta t squared so it shrinks much faster than the strips, which only depend on delta t.' })])
    ],
    m3: {
      guided: { f: 2, g: 5, fp: 3, gp: -1 },
      guidedQ: Q('m3n', 'Set the sliders to $f=2,\\ g=5,\\ f\'=3,\\ g\'=-1$. Predict the rate $\\Delta A/\\Delta t$ as $\\Delta t\\to0$, then check with the sim.',
        [N('a', 'Predicted limiting rate:', 13)],
        { hints: ['Rate is $f\'g+fg\'$. Plug in the four numbers; mind the minus sign on $g\'$.'], worked: '$f\'g+fg\'=3\\cdot5+2\\cdot(-1)=15-2=13$.' }),
      freezeQ: Q('m3why', 'Both strips are large, yet $\\Delta A$ is almost zero. Which statement explains it?',
        [M('a', 'Because', ['one strip adds area while the other removes the same amount, so one of $f\'$, $g\'$ is negative', 'the corner is huge and cancels everything', 'the sim glitches when $\\Delta t$ is small'], 0)],
        { worked: 'The strips are $f\'g\\,\\Delta t$ and $fg\'\\Delta t$. They cancel exactly when $f\'g=-fg\'$, which needs opposite signs.' }),
      accidentQ: Q('m3acc', 'You found a rectangle where the false rule works: $f\'g\'$ equals the true rate. Does one such rectangle rescue the rule $(fg)\'=f\'g\'$?',
        [M('a', 'Verdict:', ['No. A rule must work for every pair, and you already saw it fail', 'Yes. It works sometimes, so it is a rule', 'Yes, but only for positive $f$ and $g$'], 0)],
        { worked: 'A rule has to hold for all functions. One matching example is coincidence; one failing example (like $x^2$ and $x^3$) is enough to reject it.' })
    },
    m4: {
      steps: Q('m4s', 'Strip by strip, per unit time, with $a=f\'$ and $b=g\'$. The green strip grows at $a\\cdot g$ per second.',
        [E('s2', 'Orange strip rate (width $f$, height growth $b$):', 'f*b', { vars: ABFG }),
         E('tot', 'Total rate of area growth, the limit as $\\Delta t\\to0$:', 'a*g+f*b', { vars: ABFG, traps: [{ expr: 'a*b', msg: WRONG_FPGP }, { expr: 'a*g', msg: 'That is only the green strip. Add the orange strip.' }] })],
        { hints: ['The orange strip is $f$ wide and grows $b$ tall per second.', 'Add the two strip rates; the corner vanishes in the limit.'], worked: 'Green strip rate $ag$, orange strip rate $fb$. Total $ag+fb$.' }),
      single: Q('m4t', 'Let $a=f\'$ and $b=g\'$. In the limit $\\Delta t\\to0$ the corner vanishes. Write the rate of change of the area $fg$ in terms of $f,g,a,b$.',
        [E('tot', '$(fg)\'=$', 'a*g+f*b', { vars: ABFG, traps: [{ expr: 'a*b', msg: WRONG_FPGP }, { expr: 'a*g', msg: 'Only the green strip. The orange one grows too.' }, { expr: 'a*g-f*b', msg: 'A minus sign crept in. Both strips add (a negative derivative handles shrinking by itself).' }] })],
        { hints: ['Two strips contribute. Each is one derivative times the other function.'], worked: '$(fg)\'=f\'g+fg\'$, which in these letters is $ag+fb$.' })
    }
  };

  /* ---------- Build: assembled from a spec at a scaffold level ---------- */
  function buildQ(spec, level) {
    var f = spec.f, g = spec.g, fp = spec.fp, gp = spec.gp;
    var res = '(' + fp + ')*(' + g + ')+(' + f + ')*(' + gp + ')';
    var h = spec.name || 'h';
    var fnTex = spec.tex || L(spec.fn);
    var traps = [
      { expr: '(' + fp + ')*(' + gp + ')', msg: WRONG_FPGP },
      { expr: '(' + fp + ')*(' + g + ')', msg: 'That is one strip only, $f\'g$. The strip $fg\'$ is missing.' },
      { expr: '(' + f + ')*(' + gp + ')', msg: 'That is one strip only, $fg\'$. The strip $f\'g$ is missing.' },
      { expr: '(' + fp + ')*(' + g + ')-(' + f + ')*(' + gp + ')', msg: 'That minus sign belongs to the quotient rule. For a product both strips add.' }
    ];
    var fields = [];
    var head = 'Differentiate $' + h + '(x)=' + fnTex + '$.';
    if (level <= 2) {
      head += ' Let $f$ be the first factor and $g$ the second.';
      fields.push(E('f', '$f(x)=$', f), E('g', '$g(x)=$', g), E('fp', '$f\'(x)=$', fp), E('gp', '$g\'(x)=$', gp));
    } else if (level === 3) {
      head += ' Here $f(x)=' + L(f) + '$ and $g(x)=' + L(g) + '$.';
      fields.push(E('fp', '$f\'(x)=$', fp), E('gp', '$g\'(x)=$', gp));
    }
    fields.push(E('res', '$' + h + '\'(x)=$', res, { traps: traps, pad: ['^', '(', ')', '*', '/', 'sqrt', 'e', 'ln', 'sin', 'cos'] }));
    var hints = level <= 2
      ? ['Two factors are multiplied. Name the first $f$ and the second $g$.',
         'Differentiate each one on its own. The rule needs all four: $f$, $g$, $f\'$, $g\'$.',
         'Assemble $f\'g+fg\'$ with your four pieces dropped in. Simplifying is optional.']
      : ['Split the product into $f$ and $g$ and differentiate each.', 'Assemble $f\'g+fg\'$. Check you used one derivative and one original in each term.'];
    if (level === 1 && spec.expd) {
      fields.push(E('exp', 'Check a second way. Multiply $' + h + '$ out first: $' + h + '(x)=$', spec.expd),
                  E('expd', 'Now differentiate that: $' + h + '\'(x)=$', spec.res));
      head += '\n\nThen verify the same answer by multiplying out first.';
    }
    var worked = 'Let $f=' + L(f) + '$ and $g=' + L(g) + '$. Then $f\'=' + L(fp) + '$ and $g\'=' + L(gp) + '$.\n\n' +
      '$' + h + '\'=f\'g+fg\'=\\left(' + L(fp) + '\\right)\\left(' + L(g) + '\\right)+\\left(' + L(f) + '\\right)\\left(' + L(gp) + '\\right)=' + L(spec.res) + '$.';
    if (spec.expd) worked += '\n\nMultiplying out first gives $' + L(spec.expd) + '$, whose derivative is $' + L(spec.res) + '$. Same answer, two routes.';
    return {
      id: spec.id, prompt: head, fields: fields, hints: hints, worked: worked, spec: spec,
      good: 'Yes. ' + (level === 1 && spec.expd ? 'Both routes agree. Multiplying out works here because the polynomials are small; the rule is for when it is not.' : ''),
      done: { fn: fnTex, f: L(f), g: L(g), fp: L(fp), gp: L(gp), res: L(spec.res), name: h }
    };
  }

  var BUILD = {
    1: [
      { id: 'b1a', fn: 'x^2(3x+1)', f: 'x^2', g: '3x+1', fp: '2x', gp: '3', res: '9x^2+2x', expd: '3x^3+x^2' },
      { id: 'b1b', fn: '(x+2)(x-5)', f: 'x+2', g: 'x-5', fp: '1', gp: '1', res: '2x-3', expd: 'x^2-3x-10' },
      { id: 'b1c', fn: '4x^3(x^2-1)', f: '4x^3', g: 'x^2-1', fp: '12x^2', gp: '2x', res: '20x^4-12x^2', expd: '4x^5-4x^3' }
    ],
    2: [
      { id: 'b2a', fn: 'x^4(3x+2)', f: 'x^4', g: '3x+2', fp: '4x^3', gp: '3', res: '15x^4+8x^3' },
      { id: 'b2b', fn: '(x^2-5)e^x', f: 'x^2-5', g: 'e^x', fp: '2x', gp: 'e^x', res: 'e^x(x^2+2x-5)' },
      { id: 'b2c', fn: 'x sin(x)', f: 'x', g: 'sin(x)', fp: '1', gp: 'cos(x)', res: 'sin(x)+x cos(x)' }
    ],
    3: [
      { id: 'b3a', fn: 'x^3 ln(x)', f: 'x^3', g: 'ln(x)', fp: '3x^2', gp: '1/x', res: '3x^2 ln(x)+x^2' },
      { id: 'b3b', fn: 'e^x cos(x)', f: 'e^x', g: 'cos(x)', fp: 'e^x', gp: '-sin(x)', res: 'e^x(cos(x)-sin(x))' },
      { id: 'b3c', fn: 'sqrt(x)(x^2+1)', f: 'sqrt(x)', g: 'x^2+1', fp: '1/(2sqrt(x))', gp: '2x', res: '(x^2+1)/(2sqrt(x))+2x sqrt(x)' }
    ],
    4: [
      { id: 'b4a', fn: '(x^2+3x)(e^x+ln(x))', f: 'x^2+3x', g: 'e^x+ln(x)', fp: '2x+3', gp: 'e^x+1/x', res: '(2x+3)(e^x+ln(x))+(x^2+3x)(e^x+1/x)' },
      { id: 'b4b', fn: 'x^3(sin(x)+cos(x))', f: 'x^3', g: 'sin(x)+cos(x)', fp: '3x^2', gp: 'cos(x)-sin(x)', res: '3x^2(sin(x)+cos(x))+x^3(cos(x)-sin(x))' }
    ]
  };

  /* ---------- Practice pools (adaptive). entry = {spec} built at the pool level, or {q} ---------- */
  var PRACTICE = {
    1: [
      { spec: { id: 'p1a', fn: 'x^3(x+4)', f: 'x^3', g: 'x+4', fp: '3x^2', gp: '1', res: '4x^3+12x^2', expd: 'x^4+4x^3' } },
      { spec: { id: 'p1b', fn: '(3x+1)(2x-7)', f: '3x+1', g: '2x-7', fp: '3', gp: '2', res: '12x-19', expd: '6x^2-19x-7' } },
      { q: Q('p1c', 'A ticket seller\'s weekly revenue is $R=N\\cdot P$. Now $N=200$ tickets and $N\'=10$ per week. The price is $P=8$ dollars and $P\'=-0.1$ dollars per week. How fast is revenue changing right now, in dollars per week?',
          [N('a', '$R\'=$', 60, { unit: 'dollars/week', traps: [{ value: -1, msg: 'That is $N\'P\'$, the product of the two rates. Units give it away: it is not dollars per week. Use $N\'P+NP\'$.' }, { value: 80, msg: 'That is only the first strip, $N\'P$. Price falling also changes revenue: add $NP\'$.' }] })],
          { hints: ['Revenue is a product, so $R\'=N\'P+NP\'$.', '$N\'P=10\\cdot8$ and $NP\'=200\\cdot(-0.1)$.'], worked: '$R\'=N\'P+NP\'=10(8)+200(-0.1)=80-20=60$. Revenue is rising by 60 dollars per week: more tickets help, the falling price hurts.' }) },
      { q: Q('p1d', 'A table gives $f(3)=2,\\ f\'(3)=5,\\ g(3)=4,\\ g\'(3)=-1$. Let $k(x)=f(x)g(x)$. Find $k\'(3)$.',
          [N('a', '$k\'(3)=$', 18, { traps: [{ value: -5, msg: 'That is $f\'(3)g\'(3)$. The product rule needs one derivative and one original value in each term.' }] })],
          { hints: ['$k\'=f\'g+fg\'$ evaluated at $x=3$.', '$f\'(3)g(3)=5\\cdot4$ and $f(3)g\'(3)=2\\cdot(-1)$.'], worked: '$k\'(3)=f\'(3)g(3)+f(3)g\'(3)=5\\cdot4+2\\cdot(-1)=20-2=18$.' }) },
      { spec: { id: 'p1e', fn: 'x^2 sin(x)', f: 'x^2', g: 'sin(x)', fp: '2x', gp: 'cos(x)', res: '2x sin(x)+x^2 cos(x)' } },
      { q: Q('p1f', 'A student differentiates $x^2\\cdot x^3$ as $2x\\cdot3x^2=6x^3$. Her classmate multiplies first to get $x^5$ and differentiates to $5x^4$. Who is right?',
          [M('a', 'Right answer:', ['The classmate. The derivative of a product is not the product of the derivatives.', 'The student. Derivatives multiply.', 'Both. $6x^3$ and $5x^4$ are equal.', 'Neither.'], 0)],
          { worked: '$x^2\\cdot x^3=x^5$ and $(x^5)\'=5x^4$. The product of derivatives, $6x^3$, is a different function. The product rule gives $2x\\cdot x^3+x^2\\cdot3x^2=5x^4$, matching the classmate.' }) }
    ],
    2: [
      { spec: { id: 'p2a', fn: '(x^2+1)e^x', f: 'x^2+1', g: 'e^x', fp: '2x', gp: 'e^x', res: 'e^x(x^2+2x+1)' } },
      { spec: { id: 'p2b', fn: 'x^2 cos(x)', f: 'x^2', g: 'cos(x)', fp: '2x', gp: '-sin(x)', res: '2x cos(x)-x^2 sin(x)' } },
      { spec: { id: 'p2c', fn: '(2x+3)(x^2-x)', f: '2x+3', g: 'x^2-x', fp: '2', gp: '2x-1', res: '6x^2+2x-3' } },
      { q: Q('p2d', 'Let $k(x)=f(x)g(x)$ where $f(2)=3,\\ f\'(2)=-2,\\ g(2)=5,\\ g\'(2)=4$. Find $k\'(2)$, then write the tangent line to $k$ at $x=2$.',
          [N('a', '$k\'(2)=$', 2), E('b', 'Tangent line $y=$', '15+2(x-2)')],
          { hints: ['$k\'(2)=f\'(2)g(2)+f(2)g\'(2)$.', 'The tangent needs a point: $k(2)=f(2)g(2)=15$. Then $y=k(2)+k\'(2)(x-2)$.'],
            worked: '$k\'(2)=(-2)(5)+(3)(4)=-10+12=2$. Also $k(2)=3\\cdot5=15$. Tangent: $y=15+2(x-2)$.' }) },
      { q: Q('p2e', 'Revenue is $R=N\\cdot P$. A shop has $N=1200$ customers, growing by 50 per month, and a price of $P=20$ dollars, falling by 0.50 dollars per month. How fast is revenue changing now, in dollars per month?',
          [N('a', '$R\'=$', 400, { unit: 'dollars/month', traps: [{ value: -25, msg: 'That is $N\'P\'$. It has the wrong units. Use $N\'P+NP\'$.' }] })],
          { hints: ['Revenue is a product, so $R\'=N\'P+NP\'$.'], worked: '$R\'=50(20)+1200(-0.5)=1000-600=400$ dollars per month.' }) },
      { q: Q('p2f', 'The graph of $h(x)=x^2e^x$ has a horizontal tangent at two values of $x$. Find the nonzero one.',
          [N('a', 'Nonzero $x$:', -2)],
          { hints: ['Find $h\'(x)$ with the product rule, then set it equal to 0.', 'Factor $e^x$ out of $h\'$. Since $e^x$ is never 0, the other factor must be 0.'],
            worked: '$h\'=2xe^x+x^2e^x=e^x\\,x(x+2)$. This is 0 when $x=0$ or $x=-2$. Nonzero: $-2$.' }) }
    ],
    3: [
      { spec: { id: 'p3a', fn: 'x^3 ln(x)', f: 'x^3', g: 'ln(x)', fp: '3x^2', gp: '1/x', res: '3x^2 ln(x)+x^2' } },
      { spec: { id: 'p3b', fn: 'e^x cos(x)', f: 'e^x', g: 'cos(x)', fp: 'e^x', gp: '-sin(x)', res: 'e^x(cos(x)-sin(x))' } },
      { spec: { id: 'p3c', fn: 'x^(1/2)(x^2+1)', f: 'x^(1/2)', g: 'x^2+1', fp: '1/(2sqrt(x))', gp: '2x', res: '(5/2)x^(3/2)+(1/2)x^(-1/2)' } },
      { q: Q('p3d', 'Let $p(x)=x\\cdot f(x)$, with $f(3)=-2$ and $f\'(3)=4$. Find $p\'(3)$.',
          [N('a', '$p\'(3)=$', 10, { traps: [{ value: 4, msg: 'That is $f\'(3)$ alone. The first factor is $x$, whose derivative is 1, so there are two strips.' }] })],
          { hints: ['The two factors are $x$ and $f(x)$. What is the derivative of $x$?'], worked: '$p\'=1\\cdot f+x\\cdot f\'$. At 3: $(-2)+3\\cdot4=10$.' }) },
      { q: Q('p3e', 'Let $g(x)=(x^2+1)f(x)$ with $f(1)=3$ and $f\'(1)=-1$. Find $g\'(1)$.',
          [N('a', '$g\'(1)=$', 4)],
          { hints: ['The first factor is $x^2+1$; its derivative is $2x$.'], worked: '$g\'=2x\\,f+(x^2+1)f\'$. At 1: $2\\cdot3+2\\cdot(-1)=4$.' }) },
      { q: Q('p3g', 'Rewrite $h(x)=\\dfrac{e^x}{x^2}$ as the product $e^x\\cdot x^{-2}$, then differentiate it with the product rule.',
          [E('a', '$h\'(x)=$', 'e^x*x^(-2)-2e^x*x^(-3)', { pad: ['^', '(', ')', '*', '/', 'e'] })],
          { hints: ['Take $f=e^x$ and $g=x^{-2}$. What is $g\'$ by the power rule?', 'Assemble $f\'g+fg\'$ with $g\'=-2x^{-3}$.'],
            worked: '$f=e^x$, $g=x^{-2}$, $f\'=e^x$, $g\'=-2x^{-3}$. So $h\'=e^x x^{-2}-2e^x x^{-3}=\\dfrac{e^x(x-2)}{x^3}$. Rewriting a quotient as a product is a legitimate alternative to the quotient rule.' }) },
      { q: Q('p3f', 'Let $R=N\\cdot P$ where $N$ is customers, $P$ is dollars per customer, and $t$ is in months. Only one expression for $R\'$ has units of dollars per month. Which?',
          [M('a', 'Units check:', ['$N\'P+NP\'$', '$N\'P\'$', '$N\'+P\'$', '$NP$'], 0)],
          { worked: '$N\'P$: (customers/month)(dollars/customer) = dollars/month. $NP\'$: (customers)(dollars/customer/month) = dollars/month. $N\'P\'$ gives dollars per customer per month squared times customers, which is not dollars per month, so multiplying the derivatives cannot be right.' }) }
    ],
    4: [
      { q: Q('p4a', 'Differentiate $h(x)=x\\,e^x\\sin x$. Treat $x e^x$ as one factor first.',
          [E('u', 'Derivative of $u=xe^x$:', 'e^x+x e^x', { pad: ['^', '(', ')', '*', 'e'] }),
           E('res', '$h\'(x)=$', 'e^x sin(x)+x e^x sin(x)+x e^x cos(x)', { pad: ['^', '(', ')', '*', 'e', 'sin', 'cos'] })],
          { hints: ['Write $h=u\\cdot\\sin x$ with $u=xe^x$. First find $u\'$ with the product rule.', 'Then $h\'=u\'\\sin x+u\\cos x$.'],
            worked: '$u\'=e^x+xe^x$. Then $h\'=(e^x+xe^x)\\sin x+xe^x\\cos x$. Three terms, each with one factor differentiated.' }) },
      { q: Q('p4b', 'Let $a=f\'$, $b=g\'$, $c=f\'\'$, $d=g\'\'$. Find the second derivative of the product, $(fg)\'\'$, in terms of $f,g,a,b,c,d$.',
          [E('a', '$(fg)\'\'=$', 'c*g+2*a*b+f*d', { vars: ['a', 'b', 'c', 'd', 'f', 'g'] })],
          { hints: ['$(fg)\'=ag+fb$. Differentiate that, using the product rule on each of the two terms.', 'Notice what shows up in the middle: $a\\cdot b$, the product of derivatives, after all.'],
            worked: '$(ag)\'=cg+ab$ and $(fb)\'=ab+fd$. Add: $cg+2ab+fd$. The tempting product of derivatives appears, but only as a cross term.' }) },
      { q: Q('p4c', 'Derive the quotient rule from the product rule. Write $f/g=f\\cdot g^{-1}$, and use $(g^{-1})\'=-g^{-2}g\'$. With $a=f\'$ and $b=g\'$, find $(f/g)\'$ as a single fraction.',
          [E('a', '$(f/g)\'=$', '(a*g-f*b)/g^2', { vars: ABFG })],
          { hints: ['$(f\\cdot g^{-1})\'=f\'g^{-1}+f\\cdot(g^{-1})\'$.', 'Put both terms over $g^2$.'],
            worked: '$(f g^{-1})\'=a g^{-1}-f g^{-2}b=\\dfrac{ag}{g^2}-\\dfrac{fb}{g^2}=\\dfrac{ag-fb}{g^2}$.' }) },
      { q: Q('p4d', 'Why the rule is true. By definition $(fg)\'(x)=\\lim_{h\\to0}\\dfrac{f(x+h)g(x+h)-f(x)g(x)}{h}$. Write $p=f(x+h)$ and $q=g(x+h)$, so the numerator is $pq-fg$. We want it to split as $q(p-f)+f(q-g)$.',
          [E('x1', 'Which term is added and subtracted? (Use $f$ and $q$.)', 'f*q', { vars: ['p', 'q', 'f', 'g'] }),
           M('x2', 'As $h\\to0$, $q=g(x+h)$ approaches', ['$g(x)$, because $g$ is differentiable, hence continuous', '0', '$g\'(x)$'], 0),
           E('x3', 'The limit of the split quotient is (with $a=f\'$, $b=g\'$):', 'a*g+f*b', { vars: ABFG })],
          { hints: ['$pq-fg+fq-fq$ is the same number. Group $pq-fq$ and $fq-fg$.', 'Divide each group by $h$: $q\\,\\dfrac{p-f}{h}$ and $f\\,\\dfrac{q-g}{h}$.'],
            worked: '$pq-fg=(pq-fq)+(fq-fg)=q(p-f)+f(q-g)$. Divide by $h$ and take the limit: $q\\to g$, $\\dfrac{p-f}{h}\\to f\'$, $\\dfrac{q-g}{h}\\to g\'$. So $(fg)\'=g f\'+f g\'$.' }) },
      { q: Q('p4e', 'A can has radius $r=3$ cm growing at 0.5 cm/s and height $h=10$ cm shrinking at 1 cm/s. Its volume is $V=\\pi r^2h$. Find $dV/dt$ in cm³/s.',
          [N('a', '$dV/dt=$', 65.9734, { tol: 0.05, unit: 'cm³/s' })],
          { keyNote: '$21\\pi\\approx65.97$ cm³/s (accepts 65.97 within 0.05, or 21pi typed)', hints: ['Treat $V=(\\pi r^2)\\cdot h$ as a product. Both factors change with time.', 'The chain rule on $\\pi r^2$ gives $2\\pi r\\,r\'$.'],
            worked: '$V\'=(2\\pi r\\,r\')h+\\pi r^2h\'=(2\\pi\\cdot3\\cdot0.5)(10)+\\pi\\cdot9\\cdot(-1)=30\\pi-9\\pi=21\\pi\\approx65.97$.' }) },
      { q: Q('p4f', 'Where does $h(x)=(x^2-4)e^x$ have a horizontal tangent? Find the positive $x$ (give a decimal).',
          [N('a', 'Positive $x$:', 1.2360679775, { tol: 0.002 })],
          { keyNote: '$\\sqrt5-1\\approx1.236$ (accepts within 0.002)', hints: ['$h\'=e^x\\,(\\dots)$. Factor $e^x$ out and set the rest to 0.', 'You will get a quadratic that does not factor. Use the quadratic formula.'],
            worked: '$h\'=2xe^x+(x^2-4)e^x=e^x(x^2+2x-4)$. Set $x^2+2x-4=0$: $x=-1\\pm\\sqrt5$. Positive: $\\sqrt5-1\\approx1.236$.' }) }
    ]
  };

  /* ---------- Mastery gate (two parallel forms) and the recovery set ---------- */
  var MASTERY = {
    A: [
      Q('mA1', 'Which expression equals $\\dfrac{d}{dx}\\big[x^2\\sin x\\big]$?',
        [M('a', 'Choose:', ['$2x\\sin x+x^2\\cos x$', '$2x\\cos x$', '$2x\\sin x$', '$2x\\cos x+x^2\\sin x$'], 0)], { concept: true, worked: 'Strip 1: $2x\\cdot\\sin x$. Strip 2: $x^2\\cdot\\cos x$. Add them.' }),
      { spec: { id: 'mA2', fn: '(x^3-2x)e^x', f: 'x^3-2x', g: 'e^x', fp: '3x^2-2', gp: 'e^x', res: 'e^x(x^3+3x^2-2x-2)' } },
      { q: Q('mA3', 'A table gives $f(1)=-3,\\ f\'(1)=2,\\ g(1)=4,\\ g\'(1)=5$. Find $(fg)\'(1)$.', [N('a', '$(fg)\'(1)=$', -7)], { worked: '$f\'g+fg\'=2\\cdot4+(-3)(5)=8-15=-7$.' }) },
      { q: Q('mA4', 'Revenue is $R=N\\cdot P$ with $N=500$, $N\'=-20$ per month, $P=12$ dollars, $P\'=0.75$ dollars per month. Find $R\'$ in dollars per month.', [N('a', '$R\'=$', 135)], { worked: '$N\'P+NP\'=(-20)(12)+(500)(0.75)=-240+375=135$.' }) }
    ],
    B: [
      Q('mB1', 'A student writes $\\dfrac{d}{dx}[x^3\\ln x]=3x^2\\cdot\\dfrac1x=3x$. What went wrong?',
        [M('a', 'Choose:', ['They multiplied the two derivatives. The rule needs $f\'g+fg\'$.', 'They should have added the derivatives: $3x^2+\\frac1x$.', 'Nothing. $\\ln x$ has no derivative.', 'The rule applies only when one factor is a constant.'], 0)], { concept: true, worked: 'The correct result is $3x^2\\ln x+x^2$. Multiplying the derivatives is the tempting wrong move from the rectangle.' }),
      { spec: { id: 'mB2', fn: '(x^2+3x)cos(x)', f: 'x^2+3x', g: 'cos(x)', fp: '2x+3', gp: '-sin(x)', res: '(2x+3)cos(x)-(x^2+3x)sin(x)' } },
      { q: Q('mB3', 'A table gives $f(4)=5,\\ f\'(4)=-1,\\ g(4)=-2,\\ g\'(4)=3$. Find $(fg)\'(4)$.', [N('a', '$(fg)\'(4)=$', 17)], { worked: '$f\'g+fg\'=(-1)(-2)+5\\cdot3=2+15=17$.' }) },
      { q: Q('mB4', 'Revenue is $R=N\\cdot P$ with $N=800$, $N\'=40$ per month, $P=15$ dollars, $P\'=-0.50$ dollars per month. Find $R\'$ in dollars per month.', [N('a', '$R\'=$', 200)], { worked: '$N\'P+NP\'=40(15)+800(-0.5)=600-400=200$.' }) }
    ]
  };
  var RECOVERY = [
    { spec: { id: 'v1', fn: 'x^2(x+5)', f: 'x^2', g: 'x+5', fp: '2x', gp: '1', res: '3x^2+10x', expd: 'x^3+5x^2' } },
    { spec: { id: 'v2', fn: '(x+1)(x+4)', f: 'x+1', g: 'x+4', fp: '1', gp: '1', res: '2x+5', expd: 'x^2+5x+4' } },
    { q: Q('v3', 'A table gives $f(2)=3,\\ f\'(2)=1,\\ g(2)=2,\\ g\'(2)=6$. Find $(fg)\'(2)$.', [N('a', '$(fg)\'(2)=$', 20)], { hints: ['$(fg)\'=f\'g+fg\'$.'], worked: '$1\\cdot2+3\\cdot6=2+18=20$.' }) }
  ];

  function hashStr(s) { var x = 5381; for (var i = 0; i < s.length; i++) x = ((x * 33) + s.charCodeAt(i)) % 1000000; return String(x % 10000).padStart(4, '0'); }
  function today() { return new Date().toLocaleDateString('en-CA'); }
  var LESSON_ID = 'product-rule-v2';

  /* Hand-in code: numbers in base 36 plus a checksum that depends on the student's name. */
  var CODE_FIELDS = ['version', 'start level', 'peak level', 'warm-up misses (bitmask)', 'check items right (of 4)', 'concept item right', 'check attempts',
    'assisted items', 'hints used', 'active minutes', 'flags (1 solo huddle, 2 needs conference)', 'clean items', 'items answered'];
  function codeChk(name, payload) {
    var s = String(name || '').toLowerCase().replace(/[^a-z0-9]/g, '') + '|' + payload, h = 7;
    for (var i = 0; i < s.length; i++) h = (h * 131 + s.charCodeAt(i)) % 46656;
    return h.toString(36).toUpperCase().padStart(3, '0');
  }
  function encodeHandIn(name, nums) {
    var payload = nums.map(function (n) { return Math.max(0, Math.round(n)).toString(36); }).join('.');
    return 'PR2-' + payload.toUpperCase() + '-' + codeChk(name, payload.toUpperCase());
  }
  function decodeHandIn(name, code) {
    var m = /^PR2-([0-9A-Z.]+)-([0-9A-Z]{3})$/.exec(String(code || '').trim().toUpperCase());
    if (!m) return { ok: false, why: 'That is not a PR2 code.' };
    if (codeChk(name, m[1]) !== m[2]) return { ok: false, why: 'The checksum does not match that name. Check the spelling, or the code was edited.' };
    var nums = m[1].split('.').map(function (t) { return parseInt(t, 36); });
    return { ok: true, nums: nums, rows: CODE_FIELDS.map(function (l, i) { return [l, nums[i]]; }) };
  }

  root.PR2 = {
    LESSON: LESSON_ID, hashStr: hashStr, today: today,
    codeFor: function (kind) { return hashStr(LESSON_ID + '|' + kind + '|' + today()); },
    encodeHandIn: encodeHandIn, decodeHandIn: decodeHandIn, CODE_FIELDS: CODE_FIELDS,
    TITLE: '2.7 The Product Rule',
    READY: READY, PREDICT: PREDICT, MISSIONS: MISSIONS, BUILD: BUILD, PRACTICE: PRACTICE, MASTERY: MASTERY, RECOVERY: RECOVERY,
    buildQ: buildQ,
    make: function (entry, level) { return entry.spec ? buildQ(entry.spec, level) : entry.q ? entry.q : entry.fields ? entry : buildQ(entry, level); },
    L: L
  };
})(typeof window !== 'undefined' ? window : globalThis);
