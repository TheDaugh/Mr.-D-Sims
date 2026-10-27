/* SPEC (calculus 2.8): the lesson page, the key PDFs and the unit tests all read this one file.
   Math is written the way qkit writes it: $x^2$ in prompts, and answers in mathcheck syntax. Huddle text is plain text (no $ math). */
(function (root) {
  'use strict';
  var INT = function (r, a, b) { return a + Math.floor(r() * (b - a + 1)); };
  var pick = function (r, arr) { return arr[Math.floor(r() * arr.length)]; };
  var tc = function (a, s) { return a === 1 ? s : a + s; };
  var sg = function (n) { return n < 0 ? '-' + (-n) : '+' + n; };            // sign + number, for text

  var SPEC = {
    id: '2-8-quotient-rule', course: 'calc', unit: 'Unit 2 · Differentiation', title: '2.8 The Quotient Rule',
    question: 'How do you differentiate one function divided by another?',
    targets: ['I can state the quotient rule.', 'I can differentiate a quotient and find its slope at a point.', 'I can use a table of values with the rule.'],
    tabs: ['Warm-up', 'Predict', 'Explore', 'Huddle', 'Build', 'Practice', 'Check'],
    huddleTarget: 'I can state the quotient rule and use it.',

    concepts: [
      { title: 'The quotient rule', points: ['Bottom times top′, minus top times bottom′.', 'All over the bottom squared.'], eq: 'h′ = (g f′ − f g′) / g²' },
      { title: 'A false rule', points: ['The derivative of a quotient is not f′/g′.', 'Check it against the tangent slope.'], eq: 'h′ ≠ f′ / g′' },
      { title: 'Choosing a method', points: ['Simplify first when the bottom is one term.', 'Check with a calculator derivative.'], eq: '(3x² + 2√x)/x = 3x + 2x⁻¹ᐟ²' }
    ],

    huddle: {
      defs: [
        { term: 'Quotient rule', text: 'If h = f/g, then h′ = ([[g f′]] − [[f g′]]) / [[g²]].' },
        { term: 'Order', text: 'The [[bottom]] times the derivative of the [[top]] comes first.' },
        { term: 'Shortcut', text: 'If the bottom is one term, [[simplify]] first and use the power rule.' }
      ],
      example: { prompt: 'Find h′(5) for h(x) = (x² + 1)/(x − 3).',
        steps: ['g f′ − f g′ = (x − 3)(2x) − (x² + 1)(1)', 'At x = 5: 2 · 10 − [[26]] = [[−6]]', 'Divide by g² = [[4]]: h′(5) = [[−3/2]]'] },
      label: { title: 'Label the rule',
        html: '<svg viewBox="0 0 330 130" role="img" aria-label="The quotient rule with three parts marked"><text x="14" y="38" font-size="20" fill="#142230">h′ =</text><text x="86" y="26" font-size="20" fill="#2b4fd9">g · f′ − f · g′</text><line x1="84" y1="40" x2="236" y2="40" stroke="#142230" stroke-width="2"/><text x="146" y="66" font-size="20" fill="#b3412e">g²</text><text x="86" y="108" font-size="15" fill="#142230">1 = top of the fraction   2 = bottom   3 = squared</text><circle cx="78" cy="20" r="9" fill="none" stroke="#142230"/><text x="74" y="25" font-size="12">1</text><circle cx="246" cy="22" r="9" fill="none" stroke="#142230"/><text x="242" y="27" font-size="12">2</text><circle cx="170" cy="82" r="9" fill="none" stroke="#142230"/><text x="166" y="87" font-size="12">3</text></svg>',
        tags: [{ n: 1, text: 'The numerator is [[bottom times top′]] minus top times bottom′.' }, { n: 2, text: 'Order matters: [[subtraction]] is not commutative.' }, { n: 3, text: 'The denominator is the bottom [[squared]].' }] }
    },

    predicts: [
      { id: 'P1', title: 'A tempting guess', prompt: 'A student guesses that for $h=\\dfrac{\\sin x}{x^{2}}$ the derivative is $\\dfrac{\\cos x}{2x}$. At $x=1$ that gives $+0.27$, but the graph of $h$ is falling there. The guess is…',
        options: ['right', 'wrong: the sign disagrees with the graph', 'right but needs simplifying'], answer: 1, why: 'The graph falls at x = 1, so the slope is negative. A positive value cannot be right.' },
      { id: 'P2', title: 'The sign', prompt: 'The curve $y=\\dfrac{1}{x}$ for $x>0$ falls as $x$ increases. Its slope at $x=2$ is…',
        options: ['positive', 'negative', 'zero'], answer: 1, why: 'The curve is falling, so the slope is negative.' }
    ],
    observe: [
      { id: 'O1', prompt: 'At $x=1$ the tangent slope of $h=\\dfrac{\\sin x}{x^{2}}$ is…', options: ['positive', 'negative', 'zero'], answer: 1 },
      { id: 'O2', prompt: 'The rule value $\\dfrac{gf\'-fg\'}{g^{2}}$ matches the measured slope…', options: ['at every x you tried', 'only at x = 1', 'never'], answer: 0 }
    ],

    skills: [
      { id: 'quot', title: 'Differentiate a quotient', gen: function (b, r) {
        var a, k, n, s, kk;
        if (b <= 1) { a = INT(r, 1, 5); k = INT(r, 1, 5);
          return { type: 'expr', prompt: 'Differentiate with the quotient rule.', label: '$\\dfrac{d}{dx}\\left(\\dfrac{x+' + a + '}{x-' + k + '}\\right)=$', answer: '-' + (a + k) + '/(x-' + k + ')^2', vars: ['x'],
            hints: ['f = x + ' + a + ', g = x − ' + k + '. Both have derivative 1.', 'Bottom · f′ − top · g′ = (x − ' + k + ')(1) − (x + ' + a + ')(1).', 'Divide by g² = (x − ' + k + ')².'],
            traps: [{ expr: '1', msg: 'That is f′/g′. The derivative of a quotient is not the quotient of derivatives.' }, { expr: (a + k) + '/(x-' + k + ')^2', msg: 'Order matters: it is bottom·f′ − top·g′, so the numerator here is −(' + (a + k) + ').' }],
            worked: 'Numerator: $(x-' + k + ')(1)-(x+' + a + ')(1)=-' + (a + k) + '$. So $\\dfrac{-' + (a + k) + '}{(x-' + k + ')^{2}}$.' }; }
        if (b === 2) { a = INT(r, 1, 5);
          return { type: 'expr', prompt: 'Differentiate with the quotient rule.', label: '$\\dfrac{d}{dx}\\left(\\dfrac{x^{2}}{x+' + a + '}\\right)=$', answer: '(x^2+' + (2 * a) + 'x)/(x+' + a + ')^2', vars: ['x'],
            hints: ['f = x², g = x + ' + a + '. So f′ = 2x and g′ = 1.', 'Numerator: (x + ' + a + ')(2x) − (x²)(1).'], traps: [{ expr: '2x', msg: 'That is f′/g′. Use bottom·f′ − top·g′ over bottom².' }, { expr: '(-x^2-' + (2 * a) + 'x)/(x+' + a + ')^2', msg: 'The subtraction is reversed. It starts with bottom·f′.' }],
            worked: '$\\dfrac{(x+' + a + ')(2x)-x^{2}}{(x+' + a + ')^{2}}=\\dfrac{x^{2}+' + (2 * a) + 'x}{(x+' + a + ')^{2}}$.' }; }
        if (b === 3) {
          if (r() < 0.5) { k = INT(r, 1, 6); a = INT(r, 1, 5); return { type: 'expr', prompt: 'Differentiate. Name f and g first.', label: '$\\dfrac{d}{dx}\\left(\\dfrac{x^{2}+' + k + '}{x-' + a + '}\\right)=$', answer: '(2x(x-' + a + ')-(x^2+' + k + '))/(x-' + a + ')^2', vars: ['x'],
            hints: ['f = x² + ' + k + ', g = x − ' + a + '; f′ = 2x, g′ = 1.', 'Bottom · f′ − top · g′, over bottom².'], traps: [{ expr: '2x', msg: 'That is f′/g′, not the quotient rule.' }], worked: '$\\dfrac{(x-' + a + ')(2x)-(x^{2}+' + k + ')(1)}{(x-' + a + ')^{2}}$.' }; }
          n = INT(r, 2, 4); return { type: 'expr', prompt: 'Differentiate. Name f and g first.', label: '$\\dfrac{d}{dx}\\left(\\dfrac{e^{x}}{x^{' + n + '}}\\right)=$', answer: '(x^' + n + 'e^x-' + n + 'x^' + (n - 1) + 'e^x)/x^' + (2 * n), vars: ['x'],
            hints: ['f = eˣ, g = x^' + n + '; f′ = eˣ, g′ = ' + n + 'x^' + (n - 1) + '.', 'Bottom · f′ − top · g′, over bottom².'], traps: [{ expr: 'e^x/(' + n + 'x^' + (n - 1) + ')', msg: 'That is f′/g′, not the quotient rule.' }],
            worked: '$\\dfrac{x^{' + n + '}e^{x}-e^{x}\\cdot' + n + 'x^{' + (n - 1) + '}}{x^{' + (2 * n) + '}}$.' }; }
        kk = INT(r, 2, 5); s = r();
        if (s < 0.34) return { type: 'expr', prompt: 'Differentiate. You do not have to simplify.', label: '$\\dfrac{d}{dx}\\left(\\dfrac{' + kk + 'x^{2}}{\\ln x}\\right)=$', answer: '(' + (2 * kk) + 'x ln(x)-' + kk + 'x)/(ln(x))^2', vars: ['x'],
          hints: ['f = ' + kk + 'x², g = ln x; f′ = ' + (2 * kk) + 'x, g′ = 1/x.', 'Bottom · f′ − top · g′: (ln x)(' + (2 * kk) + 'x) − ' + kk + 'x²·(1/x).'], worked: '$\\dfrac{(\\ln x)(' + (2 * kk) + 'x)-' + kk + 'x^{2}\\cdot\\frac1x}{(\\ln x)^{2}}=\\dfrac{' + (2 * kk) + 'x\\ln x-' + kk + 'x}{(\\ln x)^{2}}$.' };
        if (s < 0.67) return { type: 'expr', prompt: 'Differentiate. You do not have to simplify.', label: '$\\dfrac{d}{dx}\\left(\\dfrac{\\cos x}{' + kk + '\\ln x}\\right)=$', answer: '(' + kk + 'ln(x)(-sin(x))-cos(x)(' + kk + '/x))/(' + kk + 'ln(x))^2', vars: ['x'],
          hints: ['f = cos x, g = ' + kk + ' ln x; f′ = −sin x, g′ = ' + kk + '/x.', 'Bottom · f′ − top · g′, over bottom².'], worked: '$\\dfrac{(' + kk + '\\ln x)(-\\sin x)-\\cos x\\cdot\\frac{' + kk + '}{x}}{(' + kk + '\\ln x)^{2}}$.' };
        return { type: 'expr', prompt: 'Differentiate. You do not have to simplify.', label: '$\\dfrac{d}{dx}\\left(\\dfrac{\\sin x}{x^{' + kk + '}}\\right)=$', answer: '(x^' + kk + 'cos(x)-' + kk + 'x^' + (kk - 1) + 'sin(x))/x^' + (2 * kk), vars: ['x'],
          hints: ['f = sin x, g = x^' + kk + '; f′ = cos x, g′ = ' + kk + 'x^' + (kk - 1) + '.'], worked: '$\\dfrac{x^{' + kk + '}\\cos x-' + kk + 'x^{' + (kk - 1) + '}\\sin x}{x^{' + (2 * kk) + '}}$.' };
      } },
      { id: 'val', title: 'Slope at a point', gen: function (b, r) {
        var s, c, k, p, q, g, gp, f, fp, m, a, flip, num, ans;
        if (b <= 1) { s = pick(r, [2, 4, 5]); c = INT(r, 1, s - 1); k = s - c;
          return { type: 'num', prompt: 'Let $h(x)=\\dfrac{x}{x+' + k + '}$. Find $h\'(' + c + ')$.', answer: k / (s * s), hint: 'f = x, g = x + ' + k + ', f′ = g′ = 1. Then (g·1 − f·1)/g² = ' + k + '/g².', worked: '$h\'(x)=\\dfrac{(x+' + k + ')-x}{(x+' + k + ')^{2}}=\\dfrac{' + k + '}{(x+' + k + ')^{2}}$, so $h\'(' + c + ')=\\dfrac{' + k + '}{' + (s * s) + '}=' + (k / (s * s)) + '$.' }; }
        if (b === 2) { a = INT(r, 1, 4); c = a + pick(r, [1, 2]); m = INT(r, 1, 5);
          ans = (2 * c * (c - a) - (c * c + m)) / ((c - a) * (c - a));
          return { type: 'num', prompt: 'Let $h(x)=\\dfrac{x^{2}+' + m + '}{x-' + a + '}$. Find $h\'(' + c + ')$.', answer: ans, hint: 'h′(x) = ((x − ' + a + ')(2x) − (x² + ' + m + ')(1)) / (x − ' + a + ')². Put in x = ' + c + '.',
            worked: '$h\'(' + c + ')=\\dfrac{(' + (c - a) + ')(' + (2 * c) + ')-(' + (c * c + m) + ')(1)}{' + ((c - a) * (c - a)) + '}=' + ans + '$.' }; }
        g = pick(r, [1, 2, 4, 5, 10]); f = INT(r, -5, 9); fp = INT(r, -6, 6); gp = INT(r, -6, 6); if (!f) f = 3;
        flip = b >= 4 && r() < 0.5; a = INT(r, 1, 4);
        if (!flip) { ans = (g * fp - f * gp) / (g * g);
          return { type: 'num', prompt: 'A table gives $f(' + a + ')=' + f + '$, $f\'(' + a + ')=' + fp + '$, $g(' + a + ')=' + g + '$ and $g\'(' + a + ')=' + gp + '$. Let $h=\\dfrac{f}{g}$. Find $h\'(' + a + ')$.', answer: ans,
            hint: 'Use (g·f′ − f·g′)/g² with the four values.', worked: '$h\'(' + a + ')=\\dfrac{(' + g + ')(' + fp + ')-(' + f + ')(' + gp + ')}{(' + g + ')^{2}}=' + ans + '$.' }; }
        ans = (f * gp - g * fp) / (f * f);
        return { type: 'num', prompt: 'A table gives $f(' + a + ')=' + f + '$, $f\'(' + a + ')=' + fp + '$, $g(' + a + ')=' + g + '$ and $g\'(' + a + ')=' + gp + '$. Let $h=\\dfrac{g}{f}$. Find $h\'(' + a + ')$.', answer: ans,
          hint: 'Now the top is g and the bottom is f: (f·g′ − g·f′)/f².', worked: '$h\'(' + a + ')=\\dfrac{(' + f + ')(' + gp + ')-(' + g + ')(' + fp + ')}{(' + f + ')^{2}}=' + ans + '$.' };
      } },
      { id: 'simp', title: 'Simplify first', gen: function (b, r) {
        var a, k, c;
        if (b <= 1) { a = INT(r, 2, 7); k = INT(r, 2, 7); return { type: 'expr', prompt: 'Divide first, then differentiate.', label: '$\\dfrac{d}{dx}\\left(\\dfrac{' + a + 'x^{2}+' + k + 'x}{x}\\right)=$', answer: String(a), vars: ['x'],
          hints: ['Divide each term by x: ' + a + 'x + ' + k + '.'], traps: [{ expr: '(' + (2 * a) + 'x+' + k + ')/1', msg: 'You differentiated the top only. Simplify the fraction first.' }], worked: '$\\dfrac{' + a + 'x^{2}+' + k + 'x}{x}=' + a + 'x+' + k + '$, whose derivative is $' + a + '$.' }; }
        if (b === 2) { a = INT(r, 2, 5); k = INT(r, 2, 7); return { type: 'expr', prompt: 'Divide first, then differentiate.', label: '$\\dfrac{d}{dx}\\left(\\dfrac{' + a + 'x^{3}+' + k + 'x}{x}\\right)=$', answer: (2 * a) + 'x', vars: ['x'],
          hints: ['Divide each term by x: ' + a + 'x² + ' + k + '.'], worked: '$' + a + 'x^{2}+' + k + '$ has derivative $' + (2 * a) + 'x$.' }; }
        if (b === 3) { a = INT(r, 2, 5); k = INT(r, 2, 6); return { type: 'expr', prompt: 'Divide first, then differentiate.', label: '$\\dfrac{d}{dx}\\left(\\dfrac{' + a + 'x^{2}+' + k + '\\sqrt{x}}{x}\\right)=$', answer: a + '-' + k + '/(2x^(3/2))', vars: ['x'],
          hints: ['Divide each term by x: ' + a + 'x + ' + k + 'x^(−1/2).', 'Power rule on each.'], traps: [{ expr: a + '+' + k + '/(2x^(3/2))', msg: 'The exponent −1/2 comes down as a negative: the term is −(' + k + '/2)x^(−3/2).' }], worked: '$' + a + 'x+' + k + 'x^{-1/2}$ has derivative $' + a + '-\\tfrac{' + k + '}{2}x^{-3/2}$.' }; }
        a = INT(r, 2, 5); k = INT(r, 1, 5); c = INT(r, 1, 6);
        return { type: 'expr', prompt: 'Divide first, then differentiate.', label: '$\\dfrac{d}{dx}\\left(\\dfrac{' + a + 'x^{3}+' + k + 'x^{2}-' + c + '}{x^{2}}\\right)=$', answer: a + '+' + (2 * c) + '/x^3', vars: ['x'],
          hints: ['Divide each term by x²: ' + a + 'x + ' + k + ' − ' + c + 'x⁻².', 'Differentiate each term.'], worked: '$' + a + 'x+' + k + '-' + c + 'x^{-2}$ has derivative $' + a + '+\\dfrac{' + (2 * c) + '}{x^{3}}$.' };
      } },
      { id: 'flat', title: 'Horizontal tangents', gen: function (b, r) {
        var a, n;
        if (b <= 1) { a = pick(r, [1, 4, 9]); return { type: 'num', prompt: 'Let $h(x)=\\dfrac{x}{x^{2}+' + a + '}$ for $x>0$. At which $x$ is the tangent horizontal?', answer: Math.sqrt(a), hint: 'h′(x) = (a − x²)/(x² + a)². The fraction is 0 when its numerator is 0.', worked: '$h\'(x)=\\dfrac{(x^{2}+' + a + ')-x(2x)}{(x^{2}+' + a + ')^{2}}=\\dfrac{' + a + '-x^{2}}{(x^{2}+' + a + ')^{2}}$, which is 0 at $x=' + Math.sqrt(a) + '$.' }; }
        if (b === 2) { a = pick(r, [4, 9, 16]); return { type: 'num', prompt: 'Let $h(x)=\\dfrac{x}{x^{2}+' + a + '}$ for $x>0$. At which $x$ is the tangent horizontal?', answer: Math.sqrt(a), hint: 'Set the numerator of h′ to 0: (x² + ' + a + ') − x(2x) = 0.', worked: 'The numerator is $' + a + '-x^{2}$, which is 0 at $x=' + Math.sqrt(a) + '$.' }; }
        if (b === 3) { a = pick(r, [4, 9, 16, 25]); return { type: 'num', prompt: 'Let $h(x)=\\dfrac{x^{2}+' + a + '}{x}$ for $x>0$. At which $x$ is the tangent horizontal?', answer: Math.sqrt(a), hint: 'h′(x) = (x · 2x − (x² + ' + a + ')(1))/x². Set the numerator to 0.', worked: 'The numerator is $x^{2}-' + a + '$, which is 0 at $x=' + Math.sqrt(a) + '$.' }; }
        n = INT(r, 2, 6); return { type: 'num', prompt: 'Let $h(x)=\\dfrac{e^{x}}{x^{' + n + '}}$ for $x>0$. At which $x$ is the tangent horizontal?', answer: n, hint: 'h′(x) = (x^' + n + 'eˣ − ' + n + 'x^' + (n - 1) + 'eˣ)/x^' + (2 * n) + '. Factor out eˣx^' + (n - 1) + '.', worked: '$h\'(x)=\\dfrac{e^{x}x^{' + (n - 1) + '}(x-' + n + ')}{x^{' + (2 * n) + '}}$, which is 0 at $x=' + n + '$ (eˣ is never 0).' };
      } }
    ],

    misconceptions: [
      { say: 'The derivative of f/g is f′/g′.', fix: 'Test it: for sin x / x² at x = 1 the guess has the wrong sign. Use (g f′ − f g′)/g².' },
      { say: 'Writing top·g′ − bottom·f′.', fix: 'Order matters. Start with bottom times the derivative of the top.' },
      { say: 'Forgetting to square the bottom.', fix: 'The denominator is g², not g.' },
      { say: 'Using the quotient rule when the bottom is one term.', fix: 'Divide first and use the power rule; it is shorter and safer.' }
    ],

    pacing: { budgetMin: 42,
      steps: [
        { id: 'start', prio: 1, min: 2 }, { id: 'warmup', prio: 1, min: 4 }, { id: 'predict', prio: 1, min: 3 },
        { id: 'explore', prio: 3, min: 8 }, { id: 'build', prio: 2, min: 8, minItems: 2, parts: 4 },
        { id: 'practice', prio: 1, min: 8 }, { id: 'check', prio: 1, min: 4 }
      ],
      huddles: [{ key: 'h1', atMin: 10 }] }
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = SPEC; else (root.SPECS = root.SPECS || {})[SPEC.id] = SPEC;
})(typeof window !== 'undefined' ? window : globalThis);
