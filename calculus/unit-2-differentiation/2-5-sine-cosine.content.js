/* 2.5 Derivatives of Sine and Cosine: content for the student lesson and the teacher key.
   Every answer here is checked by a sympy script before release.
   Expressions use the mathcheck syntax: sin(x), cos(x), sqrt(3)/2, pi/3, implicit multiplication.
   Paths: 1 Build (support), 2 Apply (core), 3 Stretch, 4 Extend. Students never see the path numbers. */
(function (root) {
  'use strict';
  var MC = root.MC, LCI = root.LC.forLesson('sin-cos-v2', 'SC2');

  function L(s, vars) { return MC.toLatex(s, vars || ['x']); }
  function V(s) { return MC.numberValue(s); }
  function evalAt(expr, a) { return MC.evaluate(MC.parse(expr, ['x']), { x: V(a) }); }
  function pt(n) { return String(Math.round(n * 1e12) / 1e12); }
  function E(id, label, answer, o) { var f = { id: id, type: 'expr', label: label, answer: answer }; for (var k in (o || {})) f[k] = o[k]; return f; }
  function N(id, label, answer, o) { var f = { id: id, type: 'num', label: label, answer: answer }; for (var k in (o || {})) f[k] = o[k]; return f; }
  function M(id, label, choices, ans) { return { id: id, type: 'mc', label: label, choices: choices, ans: ans }; }
  function T(id, label, min, o) { var f = { id: id, type: 'text', label: label, min: min || 20 }; for (var k in (o || {})) f[k] = o[k]; return f; }
  function Q(id, prompt, fields, o) { var q = { id: id, prompt: prompt, fields: fields }; for (var k in (o || {})) q[k] = o[k]; return q; }

  var TRIG_PAD = ['^', '(', ')', '*', '/', 'sqrt', 'sin', 'cos', 'pi'];
  var SIGN_COS = 'Sign error. The derivative of $\\cos x$ is $-\\sin x$. Cosine is falling just right of $x=0$, so its slope there is negative.';
  var SWAP = 'That is the same curve you started with. Differentiating turns sine into cosine and cosine into negative sine.';

  /* ---------- Warm-up: places the student, hidden ---------- */
  var READY = [
    Q('r1', 'Differentiate.', [E('a', '$\\dfrac{d}{dx}\\,(x^4-3x)=$', '4x^3-3')],
      { skill: 'power rule', worked: '$\\dfrac{d}{dx}x^n=nx^{n-1}$, so $\\dfrac{d}{dx}(x^4-3x)=4x^3-3$.' }),
    Q('r2', 'Give the exact value (or a decimal to 3 places).', [N('a', '$\\sin\\!\\left(\\dfrac{\\pi}{6}\\right)=$', 0.5, { tol: 0.002 })],
      { skill: 'unit circle', worked: 'At $30^\\circ$ the point on the unit circle is $(\\tfrac{\\sqrt3}{2},\\tfrac12)$, so $\\sin(\\pi/6)=\\tfrac12$.' }),
    Q('r3', 'Give the exact value (or a decimal to 3 places).', [N('a', '$\\cos\\!\\left(\\dfrac{4\\pi}{3}\\right)=$', -0.5, { tol: 0.002 })],
      { skill: 'unit circle', worked: '$4\\pi/3$ is $240^\\circ$, in quadrant III with reference angle $60^\\circ$. Cosine is negative there: $-\\tfrac12$.' }),
    Q('r4', 'Give the exact value (or a decimal to 3 places).', [N('a', '$\\sin\\!\\left(\\dfrac{4\\pi}{3}\\right)=$', -Math.sqrt(3) / 2, { tol: 0.002 })],
      { skill: 'unit circle', worked: 'Reference angle $60^\\circ$, quadrant III, sine negative: $-\\tfrac{\\sqrt3}{2}\\approx-0.866$.' }),
    Q('r5', 'A line has slope 3 and passes through $(2,\\,5)$. Write its equation.', [E('a', '$y=$', '3x-1')],
      { skill: 'tangent line', worked: 'Point-slope form: $y-5=3(x-2)$, so $y=3x-1$.' }),
    Q('r6', 'The expression $\\displaystyle\\lim_{h\\to0}\\frac{f(a+h)-f(a)}{h}$ represents which of these?',
      [M('a', 'It is', ['$f\'(a)$, the slope of the tangent line at $x=a$', '$f(a)$, the height of the curve at $x=a$', 'the area under $f$ near $a$', 'the average of $f$ on $[a,a+h]$'], 0)],
      { skill: 'limit definition', worked: 'It is the definition of the derivative at $a$: the limit of secant slopes, which is the tangent slope.' })
  ];

  /* ---------- Prediction and the one-minute test ---------- */
  var PREDICT = {
    choices: [
      'The slope graph of $\\sin x$ is the same wave as $\\sin x$ itself.',
      'The slope graph is a similar wave, but shifted: positive where sine rises, zero at the peaks, negative where sine falls.',
      'No idea yet.'
    ],
    test: Q('p-test',
      'Test it with two slopes of $y=\\sin x$. At the peak $x=\\pi/2$ the tangent line is horizontal. Near $x=0$ use your calculator: type the difference quotient $\\dfrac{\\sin(0.001)-\\sin(0)}{0.001}$ as an expression.',
      [N('a', 'Slope of $\\sin x$ at its peak, $x=\\pi/2$:', 0),
       N('b', 'Slope near $x=0$ (type the expression, e.g. (sin(0.001)-sin(0))/0.001):', 1, { tol: 0.01 }),
       M('c', 'The value of $\\sin x$ itself at $x=\\pi/2$ is 1, but its slope there is 0. So the slope graph', ['is the same curve as $\\sin x$', 'is a different curve: it is 0 where $\\sin x$ is 1', 'cannot be drawn'], 1)],
      { hints: ['A peak has a horizontal tangent line. What is the slope of a horizontal line?', 'For the second number, enter (sin(0.001)-sin(0))/0.001 exactly. The calculator must be in radians.'],
        worked: 'A horizontal tangent has slope 0. The difference quotient is $\\sin(0.001)/0.001\\approx0.9999998\\approx1$. At $\\pi/2$, $\\sin$ is 1 but its slope is 0, so the two graphs differ.' })
  };

  /* ---------- Slope tracer missions ----------
     Each beat: {kind:'q'|'explore', q, at (in multiples of pi), fn:'sin'|'cos', plot, reveal, secant (h), text} */
  var MISSIONS = {
    m1: [
      { kind: 'q', fn: 'sin', q: Q('m1a', 'Before you place a toothpick: where is the sine curve flattest, meaning its tangent has slope 0?',
          [M('a', 'Flattest at', ['the peaks and valleys, $x=\\tfrac{\\pi}{2},\\tfrac{3\\pi}{2},\\dots$', 'the places it crosses the $x$-axis', 'only at $x=0$', 'it is never flat'], 0)],
          { worked: 'At a peak or valley the curve stops rising and starts falling (or the reverse), so the tangent is horizontal.' }) },
      { kind: 'q', fn: 'sin', q: Q('m1b', 'And where is it steepest?',
          [M('a', 'Steepest at', ['the places it crosses the $x$-axis', 'the peaks', 'the valleys', 'only at $x=\\pi$'], 0)],
          { worked: 'The curve climbs or falls fastest as it crosses the axis, halfway between a valley and a peak.' }) },
      { kind: 'q', fn: 'sin', at: 0, plot: true, q: Q('m1c', 'The tangent at $x=0$ is drawn. The dashed triangle runs 1 unit to the right. Read off the rise to estimate the slope.',
          [N('a', 'Slope at $x=0$ (estimate):', 1, { tol: 0.12 })],
          { hints: ['Slope is rise over run, and the run is 1. So the slope equals the rise.', 'Count the vertical gridlines (0.25 apart) between the point and the top of the triangle.'], worked: 'The rise over a run of 1 is about 1, so the slope is about 1.' }) },
      { kind: 'q', fn: 'sin', at: 0.25, plot: true, q: Q('m1d', 'Now $x=\\pi/4$. Estimate the slope.', [N('a', 'Slope at $x=\\pi/4$:', Math.SQRT1_2, { tol: 0.12 })],
          { hints: ['The curve is still rising but less steeply than at 0.'], worked: 'The slope is about 0.7.' }) },
      { kind: 'q', fn: 'sin', at: 0.5, plot: true, q: Q('m1e', 'At the peak, $x=\\pi/2$. Estimate the slope.', [N('a', 'Slope at $x=\\pi/2$:', 0, { tol: 0.1 })], { worked: 'Horizontal tangent: slope 0.' }) },
      { kind: 'q', fn: 'sin', at: 1, plot: true, q: Q('m1f', 'Now $x=\\pi$. Estimate the slope.', [N('a', 'Slope at $x=\\pi$:', -1, { tol: 0.12 })],
          { hints: ['The curve is falling here. A falling curve has a negative slope.'], worked: 'The curve crosses the axis heading down, as steeply as it ever does: about $-1$.' }) },
      { kind: 'q', fn: 'sin', at: 1.5, plot: true, q: Q('m1g', 'At the valley, $x=3\\pi/2$. Estimate the slope.', [N('a', 'Slope at $x=3\\pi/2$:', 0, { tol: 0.1 })], { worked: 'A valley has a horizontal tangent: slope 0.' }) },
      { kind: 'q', fn: 'sin', reveal: 'cos', q: Q('m1h', 'Your five dots (and the symmetry of the wave) trace out a curve. Write its equation.',
          [E('a', 'Slope graph: $y=$', 'cos(x)', { pad: TRIG_PAD, traps: [
            { expr: 'sin(x)', msg: 'That is the sine curve itself. Your dot at $x=\\pi/2$ is 0, but $\\sin(\\pi/2)=1$.' },
            { expr: '-sin(x)', msg: 'Check $x=0$: your dot is at $+1$, but $-\\sin 0=0$.' },
            { expr: '-cos(x)', msg: 'Check $x=0$: your dot is at $+1$, but $-\\cos 0=-1$.' }] })],
          { hints: ['Which basic wave equals 1 at $x=0$, 0 at $x=\\pi/2$, and $-1$ at $x=\\pi$?'], worked: 'The dots are $(0,1),\\ (\\pi/4,0.7),\\ (\\pi/2,0),\\ (\\pi,-1),\\ (3\\pi/2,0)$, which are the points of $\\cos x$. The slope graph of $\\sin x$ is $\\cos x$.' }) },
      { kind: 'explore', fn: 'sin', min: 8, text: 'Slide the toothpick along the curve and watch the red dot follow its slope on the lower graph. Visit at least eight positions.' },
      { kind: 'q', fn: 'sin', at: 1 / 3, q: Q('m1i', 'Using your equation, find the exact slope of $y=\\sin x$ at $x=\\pi/3$.',
          [N('a', 'Slope at $x=\\pi/3$ (exact like 1/2, or a decimal):', 0.5, { tol: 0.002 })],
          { hints: ['The slope at $x$ is $\\cos x$.'], worked: 'The slope is $\\cos(\\pi/3)=\\tfrac12$.' }) }
    ],
    m2: [
      { kind: 'q', fn: 'cos', at: 0, plot: true, q: Q('m2a', 'Cosine now. The curve peaks at $x=0$. Estimate the slope of $y=\\cos x$ there.', [N('a', 'Slope at $x=0$:', 0, { tol: 0.1 })],
          { worked: 'A peak, so the tangent is horizontal.' }) },
      { kind: 'q', fn: 'cos', at: 0.5, plot: true, q: Q('m2b', 'At $x=\\pi/2$ the cosine curve is crossing the axis heading down. Estimate the slope.', [N('a', 'Slope at $x=\\pi/2$:', -1, { tol: 0.12 })],
          { hints: ['Heading down means negative.'], worked: 'About $-1$: steep and falling.' }) },
      { kind: 'q', fn: 'cos', at: 1, plot: true, q: Q('m2c', 'At $x=\\pi$ the curve reaches its valley. Slope?', [N('a', 'Slope at $x=\\pi$:', 0, { tol: 0.1 })], { worked: 'A valley: horizontal tangent.' }) },
      { kind: 'q', fn: 'cos', at: 1.5, plot: true, q: Q('m2d', 'At $x=3\\pi/2$ the curve is crossing the axis heading up. Slope?', [N('a', 'Slope at $x=3\\pi/2$:', 1, { tol: 0.12 })], { worked: 'Rising steeply: about $+1$.' }) },
      { kind: 'q', fn: 'cos', at: 0.25, plot: true, q: Q('m2e', 'One more: $x=\\pi/4$.', [N('a', 'Slope at $x=\\pi/4$:', -Math.SQRT1_2, { tol: 0.12 })],
          { hints: ['Cosine is falling here, but not as steeply as at $\\pi/2$.'], worked: 'About $-0.7$.' }) },
      { kind: 'q', fn: 'cos', reveal: 'negsin', q: Q('m2f', 'Write the equation of the slope graph for $y=\\cos x$.',
          [E('a', 'Slope graph: $y=$', '-sin(x)', { pad: TRIG_PAD, traps: [
            { expr: 'sin(x)', msg: 'Check $x=\\pi/2$: your dot is at $-1$, but $\\sin(\\pi/2)=+1$. The sign is off.' },
            { expr: 'cos(x)', msg: 'That is the cosine curve itself. Your dot at $x=0$ is 0, but $\\cos 0=1$.' },
            { expr: '-cos(x)', msg: 'Check $x=0$: your dot is 0, but $-\\cos 0=-1$.' }] })],
          { hints: ['Which wave is 0 at $x=0$, $-1$ at $x=\\pi/2$, 0 at $\\pi$, and $+1$ at $3\\pi/2$?'], worked: 'Those dots are $-\\sin x$. The slope graph of $\\cos x$ is $-\\sin x$.' }) },
      { kind: 'q', fn: 'cos', at: 0.75, q: Q('m2g', 'Using your equation, find the exact slope of $y=\\cos x$ at $x=3\\pi/4$.',
          [N('a', 'Slope at $x=3\\pi/4$:', -Math.SQRT1_2, { tol: 0.002 })],
          { hints: ['The slope at $x$ is $-\\sin x$. What is $\\sin(3\\pi/4)$?'], worked: '$-\\sin(3\\pi/4)=-\\tfrac{\\sqrt2}{2}\\approx-0.707$.' }) }
    ],
    m3: [
      { kind: 'q', fn: 'sin', at: 1 / 3, secant: 0.1, q: Q('m3a', 'Why is the slope graph exactly $\\cos x$? Zoom in at $x=\\pi/3$. The sim draws a <b>secant</b> through $x=\\pi/3$ and $x=\\pi/3+0.1$. Find its slope: $\\dfrac{\\sin(\\pi/3+0.1)-\\sin(\\pi/3)}{0.1}$.',
          [N('a', 'Secant slope, $h=0.1$ (type the expression):', 0.4559, { tol: 0.001 })],
          { hints: ['Enter (sin(pi/3+0.1)-sin(pi/3))/0.1 in the box. Radians.'], worked: '$\\dfrac{\\sin(1.1472)-\\sin(1.0472)}{0.1}\\approx0.4559$.' }) },
      { kind: 'q', fn: 'sin', at: 1 / 3, secant: 0.01, q: Q('m3b', 'Shrink the gap to $h=0.01$.', [N('a', 'Secant slope, $h=0.01$:', 0.4957, { tol: 0.001 })],
          { hints: ['(sin(pi/3+0.01)-sin(pi/3))/0.01'], worked: 'About 0.4957.' }) },
      { kind: 'q', fn: 'sin', at: 1 / 3, secant: 0.001, q: Q('m3c', 'And $h=0.001$.', [N('a', 'Secant slope, $h=0.001$:', 0.49957, { tol: 0.0005 })],
          { hints: ['(sin(pi/3+0.001)-sin(pi/3))/0.001'], worked: 'About 0.4996.' }) },
      { kind: 'q', fn: 'sin', at: 1 / 3, secant: 0.001, q: Q('m3d', 'The secant slopes 0.456, 0.496, 0.4996 are closing in on a number. Which?',
          [N('a', 'The limit as $h\\to0$:', 0.5, { tol: 0.001 }),
           M('b', 'That number equals', ['$\\cos(\\pi/3)$, the value the derivative rule predicts', '$\\sin(\\pi/3)$', '$-\\sin(\\pi/3)$'], 0)],
          { worked: 'The limit of the secant slopes is the derivative, $\\tfrac12=\\cos(\\pi/3)$. This is the limit definition doing exactly what the derivative rule says.' }) },
      { kind: 'q', fn: 'sin', at: 1 / 3, secant: 0.001, note: 'why', q: Q('m3e', 'In your own words: the sim shows a secant line turning into the tangent line as $h$ shrinks. Why does the limit of secant slopes give the slope of the tangent, and why does that match $\\cos x$?',
          [T('a', '', 30, { placeholder: 'As h shrinks, the two points ... so the secant ...', sample: 'As h shrinks the second point slides toward the first so the secant line turns into the tangent line and its slope approaches the derivative which is cos x.' })]) }
    ],
    m4: {
      rules: Q('m4r', 'Write the two rules you discovered. Type each derivative.',
        [E('s', '$\\dfrac{d}{dx}\\sin x=$', 'cos(x)', { pad: TRIG_PAD, traps: [{ expr: '-cos(x)', msg: 'Sine differentiates to $+\\cos x$, no minus sign.' }, { expr: 'sin(x)', msg: 'That is the original function.' }] }),
         E('c', '$\\dfrac{d}{dx}\\cos x=$', '-sin(x)', { pad: TRIG_PAD, traps: [{ expr: 'sin(x)', msg: SIGN_COS }, { expr: 'cos(x)', msg: SWAP }] })],
        { hints: ['Look at your two slope graphs: sine\'s dots traced $\\cos x$; cosine\'s dots traced a negative sine.'], worked: '$\\dfrac{d}{dx}\\sin x=\\cos x$ and $\\dfrac{d}{dx}\\cos x=-\\sin x$.' }),
      cycle: Q('m4c', 'Differentiate again and again. Follow the cycle.',
        [E('a', '$\\dfrac{d^2}{dx^2}\\sin x=$', '-sin(x)', { pad: TRIG_PAD }), E('b', '$\\dfrac{d^4}{dx^4}\\sin x=$', 'sin(x)', { pad: TRIG_PAD }),
         E('c', '$\\dfrac{d^{10}}{dx^{10}}\\sin x=$', '-sin(x)', { pad: TRIG_PAD })],
        { hints: ['$\\sin\\to\\cos\\to-\\sin\\to-\\cos\\to\\sin$: the cycle repeats every 4 derivatives.', 'For the tenth, divide by 4 and use the remainder.'], worked: 'First derivative $\\cos x$, second $-\\sin x$, third $-\\cos x$, fourth $\\sin x$. After four, the pattern restarts. $10=2\\cdot4+2$, so the tenth derivative equals the second: $-\\sin x$.' })
    }
  };

  /* ---------- Build: assembled from a spec at a scaffold level ---------- */
  function buildQ(spec, level) {
    var name = spec.name || 'f';
    var a = spec.a, fnTex = L(spec.fn), aTex = L(a);
    var fpa = evalAt(spec.d, a), fa = evalAt(spec.fn, a);
    var fields = [], hints, head;
    var exactNote = ' An exact value like $-\\tfrac{3\\sqrt3}{2}-2$ is best; a decimal to 3 places is accepted here.';
    head = 'Let $' + name + '(x)=' + fnTex + '$. ' + (spec.tan && level >= 3 ? 'Find $' + name + '\'(' + aTex + ')$ and the tangent line at $x=' + aTex + '$.' : 'Find $' + name + '\'(' + aTex + ')$.') + exactNote;
    var wrongV = (spec.wrong || []).map(function (w) { return { value: evalAt(w.e, a), msg: w.m }; });
    var wrongD = (spec.wrong || []).map(function (w) { return { expr: w.e, msg: w.m }; });
    if (level <= 2) fields.push(E('fp', '$' + name + '\'(x)=$', spec.d, { pad: TRIG_PAD, traps: wrongD }));
    if (level === 1 && spec.vals) spec.vals.forEach(function (v, i) { fields.push(N('v' + i, v.label, V(v.ans), { tol: 0.002 })); });
    fields.push(N('fpa', '$' + name + '\'(' + aTex + ')=$', fpa, { tol: 0.002, traps: wrongV.filter(function (w) { return Math.abs(w.value - fpa) > 0.01; }) }));
    if (spec.tan && level >= 3) fields.push(E('tan', 'Tangent line at $x=' + aTex + '$: $y=$', pt(fa) + '+(' + pt(fpa) + ')*(x-(' + a + '))', { pad: TRIG_PAD }));
    hints = level <= 2
      ? ['Differentiate term by term: $\\sin x\\to\\cos x$, $\\cos x\\to-\\sin x$, and constants stay as multipliers.', 'Then substitute $x=' + aTex + '$ and use the unit circle for the sine or cosine value.', 'Watch the signs: a negative coefficient times the $-$ from the cosine rule.']
      : ['Differentiate first, then substitute $x=' + aTex + '$.', 'Use the unit circle for the exact sine or cosine value.'];
    var worked = '$' + name + '\'(x)=' + L(spec.d) + '$. At $x=' + aTex + '$ this is $' + L(spec.dval || String(pt(fpa))) + '\\approx' + (Math.round(fpa * 1000) / 1000) + '$.';
    if (spec.tan) worked += '\n\nThe point is $(' + aTex + ',\\ ' + (Math.round(fa * 1000) / 1000) + ')$ and the slope is ' + (Math.round(fpa * 1000) / 1000) + ', so $y=' + (Math.round(fa * 1000) / 1000) + '+' + (Math.round(fpa * 1000) / 1000) + '\\left(x-' + aTex + '\\right)$.';
    return {
      id: spec.id, prompt: head, fields: fields, hints: hints, worked: worked, spec: spec,
      keyNote: spec.exact ? 'Exact: $' + spec.exact + '$' : '',
      good: 'Yes.',
      done: { fn: fnTex, d: L(spec.d), a: aTex, val: String(Math.round(fpa * 1000) / 1000), exact: spec.exact || '', name: name }
    };
  }

  var BUILD = {
    1: [
      { id: 'b1a', fn: '3cos(x)-2x', d: '-3sin(x)-2', a: 'pi/3', vals: [{ label: '$\\sin(\\pi/3)=$', ans: 'sqrt(3)/2' }], exact: '-\\tfrac{3\\sqrt3}{2}-2',
        wrong: [{ e: '3sin(x)-2', m: SIGN_COS }, { e: '-3cos(x)-2', m: 'Cosine does not stay cosine. Its derivative is $-\\sin x$.' }] },
      { id: 'b1b', fn: '2sin(x)+x^2', d: '2cos(x)+2x', a: 'pi/6', vals: [{ label: '$\\cos(\\pi/6)=$', ans: 'sqrt(3)/2' }], exact: '\\sqrt3+\\tfrac{\\pi}{3}',
        wrong: [{ e: '-2cos(x)+2x', m: 'The derivative of $\\sin x$ is $+\\cos x$, with no minus sign.' }, { e: '2sin(x)+2x', m: 'Sine turns into cosine when you differentiate.' }] },
      { id: 'b1c', fn: '5-4cos(x)', d: '4sin(x)', a: 'pi/2', vals: [{ label: '$\\sin(\\pi/2)=$', ans: '1' }], exact: '4',
        wrong: [{ e: '-4sin(x)', m: 'Two minus signs: the $-4$ in front and the $-$ in the cosine rule multiply to $+$.' }] }
    ],
    2: [
      { id: 'b2a', fn: 'sin(x)-cos(x)', d: 'cos(x)+sin(x)', a: 'pi/4', vals: [{ label: '$\\sin(\\pi/4)=$', ans: 'sqrt(2)/2' }], exact: '\\sqrt2',
        wrong: [{ e: 'cos(x)-sin(x)', m: SIGN_COS }] },
      { id: 'b2b', fn: 'x^3-6sin(x)', d: '3x^2-6cos(x)', a: 'pi/2', vals: [{ label: '$\\cos(\\pi/2)=$', ans: '0' }], exact: '\\tfrac{3\\pi^2}{4}',
        wrong: [{ e: '3x^2+6cos(x)', m: 'The $-6$ stays: the derivative of $-6\\sin x$ is $-6\\cos x$.' }] },
      { id: 'b2c', fn: '4sin(x)+3cos(x)', d: '4cos(x)-3sin(x)', a: 'pi', vals: [{ label: '$\\cos\\pi=$', ans: '-1' }], exact: '-4',
        wrong: [{ e: '4cos(x)+3sin(x)', m: SIGN_COS }] }
    ],
    3: [
      { id: 'b3a', name: 'y', fn: '-2sin(x)+5', d: '-2cos(x)', a: '4*pi/3', tan: true, vals: [{ label: '$\\cos(4\\pi/3)=$', ans: '-1/2' }], exact: '1',
        wrong: [{ e: '2cos(x)', m: 'The $-2$ stays when you differentiate $-2\\sin x$.' }] },
      { id: 'b3b', fn: '3sin(x)-2x', d: '3cos(x)-2', a: 'pi', tan: true, vals: [{ label: '$\\cos\\pi=$', ans: '-1' }], exact: '-5',
        wrong: [{ e: '-3cos(x)-2', m: 'Sine differentiates to $+\\cos x$, no minus sign.' }] },
      { id: 'b3c', fn: '6cos(x)+x', d: '-6sin(x)+1', a: '2*pi/3', tan: true, vals: [{ label: '$\\sin(2\\pi/3)=$', ans: 'sqrt(3)/2' }], exact: '1-3\\sqrt3',
        wrong: [{ e: '6sin(x)+1', m: SIGN_COS }] }
    ],
    4: [
      { id: 'b4a', fn: '-4sin(x)+cos(x)-7x', d: '-4cos(x)-sin(x)-7', a: '5*pi/6', exact: '2\\sqrt3-\\tfrac{15}{2}',
        wrong: [{ e: '-4cos(x)+sin(x)-7', m: SIGN_COS }] },
      { id: 'b4b', fn: '2cos(x)-x^3/3', d: '-2sin(x)-x^2', a: 'pi/4', exact: '-\\sqrt2-\\tfrac{\\pi^2}{16}',
        wrong: [{ e: '2sin(x)-x^2', m: SIGN_COS }] }
    ]
  };

  /* ---------- Practice pools (adaptive) ---------- */
  var PRACTICE = {
    1: [
      { spec: { id: 'p1a', fn: '4sin(x)+2x', d: '4cos(x)+2', a: 'pi/3', vals: [{ label: '$\\cos(\\pi/3)=$', ans: '1/2' }], exact: '4',
          wrong: [{ e: '-4cos(x)+2', m: 'The derivative of $\\sin x$ is $+\\cos x$.' }] } },
      { q: Q('p1b', 'Which is the derivative of $\\cos x$?',
          [M('a', 'Choose:', ['$-\\sin x$', '$\\sin x$', '$-\\cos x$', '$\\cos x$'], 0)],
          { worked: 'The slope graph of cosine traced $-\\sin x$ in the lesson: negative where cosine falls, zero at its peaks.' }) },
      { q: Q('p1c', 'The cosine curve is at a peak at $x=0$. What is the slope of $y=\\cos x$ there?',
          [N('a', 'Slope:', 0, { tol: 0.01 })], { hints: ['A peak has a horizontal tangent.'], worked: 'Horizontal tangent, slope 0. This matches $-\\sin 0=0$.' }) },
      { q: Q('p1d', 'A mass on a spring has position $x(t)=5\\cos t$ centimeters at $t$ seconds. Its velocity is $x\'(t)$. Find the velocity at $t=\\pi/6$.',
          [N('a', 'Velocity:', -2.5, { tol: 0.01, unit: 'cm/s' })],
          { hints: ['Differentiate: $x\'(t)=-5\\sin t$.', '$\\sin(\\pi/6)=\\tfrac12$.'], worked: '$x\'(t)=-5\\sin t$, so $x\'(\\pi/6)=-5\\cdot\\tfrac12=-2.5$ cm/s. The mass is moving toward the equilibrium point (negative direction).' }) },
      { q: Q('p1e', 'Evaluate $\\displaystyle\\lim_{x\\to\\pi/2}\\frac{\\sin x-1}{x-\\pi/2}$. Hint: this is a derivative in disguise.',
          [N('a', 'Limit:', 0, { tol: 0.002 })],
          { hints: ['Compare with $\\dfrac{f(x)-f(a)}{x-a}$. Which $f$ and which $a$ make $f(a)=1$?', 'Take $f(x)=\\sin x$ and $a=\\pi/2$. The limit is $f\'(a)=\\cos(\\pi/2)$.'], worked: 'It is $f\'(\\pi/2)$ for $f(x)=\\sin x$, since $f(\\pi/2)=1$. $f\'(x)=\\cos x$, so the limit is $\\cos(\\pi/2)=0$.' }) },
      { spec: { id: 'p1f', fn: 'cos(x)+3x', d: '-sin(x)+3', a: 'pi/6', vals: [{ label: '$\\sin(\\pi/6)=$', ans: '1/2' }], exact: '\\tfrac52',
          wrong: [{ e: 'sin(x)+3', m: SIGN_COS }] } }
    ],
    2: [
      { spec: { id: 'p2a', fn: '2cos(x)-3sin(x)', d: '-2sin(x)-3cos(x)', a: 'pi/6', vals: [{ label: '$\\cos(\\pi/6)=$', ans: 'sqrt(3)/2' }], exact: '-1-\\tfrac{3\\sqrt3}{2}',
          wrong: [{ e: '2sin(x)-3cos(x)', m: SIGN_COS }] } },
      { q: Q('p2b', 'Evaluate $\\displaystyle\\lim_{x\\to\\pi}\\frac{\\cos x+1}{x-\\pi}$.',
          [N('a', 'Limit:', 0, { tol: 0.002 })],
          { hints: ['Write $\\cos x+1$ as $\\cos x-\\cos\\pi$. Now it matches $\\dfrac{f(x)-f(a)}{x-a}$.', 'The limit is $f\'(\\pi)=-\\sin\\pi$.'], worked: '$\\cos\\pi=-1$, so $\\cos x+1=\\cos x-\\cos\\pi$ and the limit is $f\'(\\pi)$ for $f=\\cos$: $-\\sin\\pi=0$.' }) },
      { q: Q('p2c', 'Evaluate $\\displaystyle\\lim_{h\\to0}\\frac{\\sin(\\pi/3+h)-\\frac{\\sqrt3}{2}}{h}$.',
          [N('a', 'Limit:', 0.5, { tol: 0.002 })],
          { hints: ['$\\sin(\\pi/3)=\\tfrac{\\sqrt3}{2}$, so this is $\\dfrac{f(a+h)-f(a)}{h}$ with $f=\\sin$, $a=\\pi/3$.'], worked: 'It is $f\'(\\pi/3)$ for $f=\\sin$: $\\cos(\\pi/3)=\\tfrac12$.' }) },
      { q: Q('p2d', 'Let $g(x)=8\\cos x$. Which interval has $g\'(x)>0$ throughout?',
          [M('a', 'Choose:', ['$(\\pi,\\,2\\pi)$', '$(0,\\,\\pi)$', '$(\\pi/2,\\,3\\pi/2)$', '$(-\\pi/2,\\,\\pi/2)$'], 0)],
          { hints: ['$g\'(x)=-8\\sin x$. When is that positive? When $\\sin x$ is negative.'], worked: '$g\'(x)=-8\\sin x>0$ exactly when $\\sin x<0$: on $(\\pi,2\\pi)$. On $(0,\\pi)$ sine is positive, so $g\'<0$. The other two intervals mix signs.' }) },
      { q: Q('p2e', 'Find the tangent line to $y=3\\sin x$ at $x=\\pi/3$.',
          [E('a', '$y=$', '3sqrt(3)/2+(3/2)(x-pi/3)', { pad: TRIG_PAD })],
          { hints: ['Point: $\\bigl(\\tfrac{\\pi}{3},\\,3\\sin\\tfrac{\\pi}{3}\\bigr)$. Slope: $3\\cos\\tfrac{\\pi}{3}$.'], worked: 'Point $(\\pi/3,\\ 3\\sqrt3/2)$, slope $3\\cos(\\pi/3)=\\tfrac32$. So $y=\\tfrac{3\\sqrt3}{2}+\\tfrac32\\left(x-\\tfrac{\\pi}{3}\\right)$.' }) },
      { q: Q('p2f', 'The mass has position $x(t)=5\\cos t$ cm. Find the first time $t>0$ at which its velocity is 0.',
          [N('a', '$t=$', Math.PI, { tol: 0.002, unit: 's' })],
          { hints: ['$v(t)=-5\\sin t$. Set it to 0.'], worked: '$-5\\sin t=0$ when $t=0,\\pi,2\\pi,\\dots$. First positive: $t=\\pi\\approx3.142$ s, the far end of the swing.' }) },
      { q: Q('p2g', 'Let $f(x)=x+2\\cos x$. Find the smallest positive $x$ where the tangent line is horizontal.',
          [N('a', '$x=$', Math.PI / 6, { tol: 0.002 })],
          { hints: ['$f\'(x)=1-2\\sin x$. Set it to 0.'], worked: '$1-2\\sin x=0$, so $\\sin x=\\tfrac12$, and the smallest positive solution is $x=\\pi/6\\approx0.524$.' }) }
    ],
    3: [
      { q: Q('p3a', 'Evaluate $\\displaystyle\\lim_{h\\to0}\\frac{\\cos(\\pi/6+h)-\\cos(\\pi/6)}{h}$.', [N('a', 'Limit:', -0.5, { tol: 0.002 })],
          { hints: ['$f=\\cos$, $a=\\pi/6$.'], worked: 'It equals $-\\sin(\\pi/6)=-\\tfrac12$.' }) },
      { q: Q('p3b', 'Evaluate $\\displaystyle\\lim_{x\\to\\pi/4}\\frac{\\sin x-\\cos x}{x-\\pi/4}$.', [N('a', 'Limit:', Math.SQRT2, { tol: 0.002 })],
          { hints: ['Let $f(x)=\\sin x-\\cos x$. What is $f(\\pi/4)$?'], keyNote: 'Exact: $\\sqrt2$',
            worked: '$f(\\pi/4)=\\tfrac{\\sqrt2}{2}-\\tfrac{\\sqrt2}{2}=0$, so the limit is $f\'(\\pi/4)$. $f\'(x)=\\cos x+\\sin x$, which is $\\sqrt2$ at $\\pi/4$.' }) },
      { q: Q('p3c', 'Let $f(x)=\\sin x+\\cos x$. Find the smallest positive $x$ where $f\'(x)=0$.', [N('a', '$x=$', Math.PI / 4, { tol: 0.002 })],
          { hints: ['$f\'(x)=\\cos x-\\sin x$. When are sine and cosine equal?'], worked: '$\\cos x=\\sin x$ at $x=\\pi/4$ (where $\\tan x=1$).' }) },
      { q: Q('p3d', 'Let $f(x)=x-2\\sin x$. Find the value of $x$ in $(0,\\pi)$ where $f\'(x)=0$.', [N('a', '$x=$', Math.PI / 3, { tol: 0.002 })],
          { hints: ['$f\'(x)=1-2\\cos x$.'], worked: '$1-2\\cos x=0$ gives $\\cos x=\\tfrac12$, so $x=\\pi/3\\approx1.047$.' }) },
      { q: Q('p3e', 'Position $x(t)=5\\cos t$ cm. Find the velocity at $t=7\\pi/6$. Is the mass moving in the positive or negative direction?',
          [N('a', 'Velocity:', 2.5, { tol: 0.01, unit: 'cm/s' }), M('b', 'Direction:', ['positive', 'negative'], 0)],
          { hints: ['$v(t)=-5\\sin t$ and $\\sin(7\\pi/6)=-\\tfrac12$.'], worked: '$v(7\\pi/6)=-5\\cdot(-\\tfrac12)=2.5$ cm/s. Positive: the mass is on its way back up.' }) },
      { q: Q('p3f', 'Without differentiating, why must the slope graph of $y=\\sin x$ be 0 at $x=\\pi/2$?',
          [M('a', 'Because', ['$\\sin x$ has a horizontal tangent at its peak', '$\\sin(\\pi/2)=1$ and $1-1=0$', '$\\cos x$ is always 0', 'slopes are always 0 at $\\pi/2$'], 0)],
          { worked: 'At the top of the wave the curve stops rising and starts falling, so the tangent is horizontal. That is why $\\cos(\\pi/2)=0$ is the slope.' }) },
      { spec: { id: 'p3g', fn: '2sin(x)+cos(x)', d: '2cos(x)-sin(x)', a: 'pi/2', tan: true, exact: '-1', wrong: [{ e: '2cos(x)+sin(x)', m: SIGN_COS }] } }
    ],
    4: [
      { q: Q('p4a', 'What is the 27th derivative of $\\sin x$?', [E('a', '$\\dfrac{d^{27}}{dx^{27}}\\sin x=$', '-cos(x)', { pad: TRIG_PAD })],
          { hints: ['The cycle repeats every 4. $27=6\\cdot4+3$.'], worked: 'After 24 derivatives you are back at $\\sin x$. Three more: $\\cos x$, $-\\sin x$, $-\\cos x$. So the answer is $-\\cos x$.' }) },
      { q: Q('p4b', 'Let $f(x)=3\\sin x-\\cos x$. Find $f\'\'(x)$ and then $f\'\'(x)+f(x)$.',
          [E('a', '$f\'\'(x)=$', '-3sin(x)+cos(x)', { pad: TRIG_PAD }), E('b', '$f\'\'(x)+f(x)=$', '0', { pad: TRIG_PAD })],
          { hints: ['$f\'(x)=3\\cos x+\\sin x$. Differentiate again.'], worked: '$f\'=3\\cos x+\\sin x$ and $f\'\'=-3\\sin x+\\cos x=-f(x)$. So $f\'\'+f=0$: every $A\\sin x+B\\cos x$ satisfies this, which is the equation of simple harmonic motion.' }) },
      { q: Q('p4c', 'Why $\\frac{d}{dx}\\sin x=\\cos x$. The difference quotient is $\\dfrac{\\sin(x+h)-\\sin x}{h}$. Use $\\sin(x+h)=\\sin x\\cos h+\\cos x\\sin h$ to write it as $\\sin x\\cdot A+\\cos x\\cdot B$.',
          [E('a', '$A=$ (in terms of $h$):', '(cos(h)-1)/h', { vars: ['x', 'h'], pad: TRIG_PAD }), E('b', '$B=$ (in terms of $h$):', 'sin(h)/h', { vars: ['x', 'h'], pad: TRIG_PAD }),
           N('c', 'Given that $\\displaystyle\\lim_{h\\to0}\\frac{\\cos h-1}{h}=0$, what is $\\displaystyle\\lim_{h\\to0}\\frac{\\sin h}{h}$?', 1),
           E('d', 'So the limit of the whole quotient is', 'cos(x)', { pad: TRIG_PAD })],
          { hints: ['$\\sin x\\cos h+\\cos x\\sin h-\\sin x=\\sin x(\\cos h-1)+\\cos x\\sin h$. Divide by $h$.', 'The second limit is the famous $\\sin h/h\\to1$ from Unit 1.'],
            worked: '$\\dfrac{\\sin(x+h)-\\sin x}{h}=\\sin x\\cdot\\dfrac{\\cos h-1}{h}+\\cos x\\cdot\\dfrac{\\sin h}{h}\\to\\sin x\\cdot0+\\cos x\\cdot1=\\cos x$. The limit from Unit 1 is the derivative rule of Unit 2.' }) },
      { q: Q('p4d', 'Evaluate $\\displaystyle\\lim_{x\\to\\pi/6}\\frac{2\\cos x-\\sqrt3}{x-\\pi/6}$.', [N('a', 'Limit:', -1, { tol: 0.002 })],
          { hints: ['$f(x)=2\\cos x$ and $a=\\pi/6$. Check $f(a)=2\\cdot\\tfrac{\\sqrt3}{2}=\\sqrt3$.'], worked: '$f(\\pi/6)=\\sqrt3$, so the limit is $f\'(\\pi/6)=-2\\sin(\\pi/6)=-1$.' }) },
      { q: Q('p4e', 'A mass has position $x(t)=5\\cos t$ cm for $0\\le t\\le2\\pi$. Find the first time its <i>speed</i> is greatest, that speed, and its acceleration $a(t)=v\'(t)$.',
          [N('a', 'First time of greatest speed:', Math.PI / 2, { tol: 0.002, unit: 's' }), N('b', 'Greatest speed:', 5, { tol: 0.01, unit: 'cm/s' }),
           E('c', '$a(t)=$', '-5cos(t)', { vars: ['t'], pad: TRIG_PAD })],
          { hints: ['$v(t)=-5\\sin t$. Speed is $|v|$, largest when $|\\sin t|=1$.', 'Differentiate $v$ to get $a$. Compare it with $x(t)$.'],
            worked: '$v=-5\\sin t$, with $|v|=5$ first at $t=\\pi/2$. $a=v\'=-5\\cos t=-x(t)$: the acceleration points back toward the center and is proportional to the displacement, which is simple harmonic motion.' }) },
      { q: Q('p4f', 'Use the tangent line to $y=\\sin x$ at $x=0$ to estimate $\\sin(0.1)$. Then find how far the estimate is from the true value $0.0998334$.',
          [N('a', 'Estimate of $\\sin(0.1)$:', 0.1, { tol: 0.0003 }), N('b', 'Estimate minus true value:', 0.0001666, { tol: 0.00003 })],
          { hints: ['The tangent at 0 is $y=\\sin0+\\cos0\\,(x-0)$. Evaluate it at $0.1$.'], worked: 'Tangent: $y=x$, so the estimate is 0.1. The true value is $0.0998334$, so the estimate is high by about $0.000167$. This is why $\\sin x\\approx x$ for small angles, a staple of physics.' }) }
    ]
  };

  /* ---------- Mastery gate (two parallel forms) and recovery ---------- */
  var MASTERY = {
    A: [
      Q('mA1', 'Which statement about the slope graph of $y=\\cos x$ is correct?',
        [M('a', 'Choose:', ['It is the graph of $y=-\\sin x$', 'It is the graph of $y=\\sin x$', 'It is the graph of $y=\\cos x$ shifted $\\pi$ left', 'It is the graph of $y=-\\cos x$'], 0)],
        { concept: true, worked: 'Cosine peaks at 0 (slope 0), falls steepest at $\\pi/2$ (slope $-1$): the slope graph is $-\\sin x$.' }),
      { spec: { id: 'mA2', fn: '5sin(x)-4x', d: '5cos(x)-4', a: 'pi/3', exact: '-\\tfrac32', wrong: [{ e: '-5cos(x)-4', m: 'The derivative of $\\sin x$ is $+\\cos x$.' }] } },
      { q: Q('mA3', 'Evaluate $\\displaystyle\\lim_{h\\to0}\\frac{\\cos(\\pi/4+h)-\\cos(\\pi/4)}{h}$.', [N('a', 'Limit:', -Math.SQRT1_2, { tol: 0.002 })], { worked: 'It is the derivative of $\\cos x$ at $\\pi/4$: $-\\sin(\\pi/4)=-\\tfrac{\\sqrt2}{2}$.' }) },
      { q: Q('mA4', 'Find the tangent line to $y=2\\cos x$ at $x=\\pi/3$.', [E('a', '$y=$', '1-sqrt(3)(x-pi/3)', { pad: TRIG_PAD })],
          { worked: 'Point: $(\\pi/3,\\ 2\\cos(\\pi/3))=(\\pi/3,\\ 1)$. Slope: $-2\\sin(\\pi/3)=-\\sqrt3$. So $y=1-\\sqrt3\\left(x-\\tfrac{\\pi}{3}\\right)$.' }) }
    ],
    B: [
      Q('mB1', 'A student claims $\\dfrac{d}{dx}\\cos x=\\sin x$. A quick check at $x=\\pi/2$ tests the claim. What does it show?',
        [M('a', 'The check shows', ['$\\cos x$ is falling at $\\pi/2$, so its slope is negative, but $\\sin(\\pi/2)=+1$. The sign is wrong.', 'The claim is right, since $\\sin 0=0$ and the slope at 0 is 0.', 'Nothing can be tested without a calculator.', '$\\cos x$ has no derivative at $\\pi/2$.'], 0)],
        { concept: true, worked: 'At $x=\\pi/2$ the cosine curve is heading down, so the slope is negative ($-1$). $\\sin(\\pi/2)=+1$, which has the wrong sign. The correct derivative is $-\\sin x$.' }),
      { spec: { id: 'mB2', fn: '6cos(x)+2x', d: '-6sin(x)+2', a: 'pi/6', exact: '-1', wrong: [{ e: '6sin(x)+2', m: SIGN_COS }] } },
      { q: Q('mB3', 'Evaluate $\\displaystyle\\lim_{x\\to\\pi/3}\\frac{\\sin x-\\frac{\\sqrt3}{2}}{x-\\pi/3}$.', [N('a', 'Limit:', 0.5, { tol: 0.002 })], { worked: 'It is $f\'(\\pi/3)$ for $f=\\sin$: $\\cos(\\pi/3)=\\tfrac12$.' }) },
      { q: Q('mB4', 'Find the tangent line to $y=4\\sin x$ at $x=\\pi/6$.', [E('a', '$y=$', '2+2sqrt(3)(x-pi/6)', { pad: TRIG_PAD })],
          { worked: 'Point: $(\\pi/6,\\ 4\\sin(\\pi/6))=(\\pi/6,\\ 2)$. Slope: $4\\cos(\\pi/6)=2\\sqrt3$. So $y=2+2\\sqrt3\\left(x-\\tfrac{\\pi}{6}\\right)$.' }) }
    ]
  };
  var RECOVERY = [
    { spec: { id: 'v1', fn: '2sin(x)+3x', d: '2cos(x)+3', a: 'pi/2', vals: [{ label: '$\\cos(\\pi/2)=$', ans: '0' }], exact: '3', wrong: [{ e: '-2cos(x)+3', m: 'The derivative of $\\sin x$ is $+\\cos x$.' }] } },
    { spec: { id: 'v2', fn: '4cos(x)', d: '-4sin(x)', a: 'pi/6', vals: [{ label: '$\\sin(\\pi/6)=$', ans: '1/2' }], exact: '-2', wrong: [{ e: '4sin(x)', m: SIGN_COS }] } },
    { q: Q('v3', 'Which is the derivative of $\\sin x$?', [M('a', 'Choose:', ['$\\cos x$', '$-\\cos x$', '$\\sin x$', '$-\\sin x$'], 0)], { hints: ['Look back at the dots you plotted: they traced a cosine wave.'], worked: 'The slope graph of sine is cosine.' }) }
  ];

  root.SC = Object.assign({
    TITLE: '2.5 Derivatives of Sine and Cosine',
    READY: READY, PREDICT: PREDICT, MISSIONS: MISSIONS, BUILD: BUILD, PRACTICE: PRACTICE, MASTERY: MASTERY, RECOVERY: RECOVERY,
    buildQ: buildQ,
    make: function (entry, level) { return entry.spec ? buildQ(entry.spec, level) : entry.q ? entry.q : entry.fields ? entry : buildQ(entry, level); },
    L: L
  }, LCI);
})(typeof window !== 'undefined' ? window : globalThis);
