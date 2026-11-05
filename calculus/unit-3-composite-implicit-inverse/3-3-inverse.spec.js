/* SPEC (calculus 3.3): the lesson page, the key PDFs and the unit tests all read this one file.
   Self-paced (selfPaced: true): no clock, no trimming, no skipping, no end mark, no stamp. Progress saves on the device, so a student can stop and finish the next day.
   Math is written the way qkit writes it: $x^2$ in prompts, and answers in mathcheck syntax. Huddle text is plain text (no $ math).
   Choice options are plain text and unicode.
   Every skill item carries the data its test needs, so tests/unit/inverse.test.js can check it without the inverse-derivative formula:
     fx   the function f in mathcheck syntax, a its input, b = f(a). The true answer is 1 / f′(a), with f′ taken numerically. */
(function (root) {
  'use strict';
  var INT = function (r, a, b) { return a + Math.floor(r() * (b - a + 1)); };
  var pick = function (r, arr) { return arr[Math.floor(r() * arr.length)]; };
  var shuffle = function (r, arr) { var a = arr.slice(), i, j, t; for (i = a.length - 1; i > 0; i--) { j = Math.floor(r() * (i + 1)); t = a[i]; a[i] = a[j]; a[j] = t; } return a; };

  /* Functions whose inverse slope at the chosen point is a clean decimal (the keypad has no fraction key).
     tex is the function as the student reads it; fx is the same in mathcheck syntax; a is the input, b = f(a), d = f′(a). */
  var LIN = [2, 4, 5, 8, 10];
  var CUBE = [[1, 1], [2, 1], [5, 1], [7, 1]].map(function (p) { return { tex: 'x^{3}+' + (p[0] === 1 ? '' : p[0]) + 'x', fx: 'x^3+' + p[0] + '*x', a: 1, b: 1 + p[0], d: 3 + p[0] }; });
  CUBE.push({ tex: 'x^{3}+x', fx: 'x^3+x', a: -1, b: -2, d: 4 });
  var MORE = [
    { tex: 'e^{x}+x', fx: 'e^x+x', a: 0, b: 1, d: 2 },
    { tex: 'e^{x}+3x', fx: 'e^x+3*x', a: 0, b: 1, d: 4 },
    { tex: '\\sin x+x', fx: 'sin(x)+x', a: 0, b: 0, d: 2 },
    { tex: 'x+\\ln x', fx: 'x+ln(x)', a: 1, b: 1, d: 2 },
    { tex: 'x^{3}+\\ln x', fx: 'x^3+ln(x)', a: 1, b: 1, d: 4 },
    { tex: 'x^{5}+3x', fx: 'x^5+3*x', a: 1, b: 4, d: 8 },
    { tex: 'e^{3x}+x', fx: 'e^(3*x)+x', a: 0, b: 1, d: 4 }
  ];
  var inv = function (d) { return 1 / d; };
  var xs = function (v) { return v < 0 ? '(x+' + (-v) + ')' : '(x-' + v + ')'; };                  // mathcheck text of x - v
  var fmt = function (v) { return String(+v.toFixed(4)); };
  var ptTex = function (x, y) { return '(' + x + ',' + y + ')'; };

  var SPEC = {
    id: '3-3-inverse', course: 'calc', unit: 'Unit 3 · Composite, Implicit and Inverse', title: '3.3 Derivatives of Inverse Functions',
    selfPaced: true,
    question: 'If you mirror a curve across y = x, what happens to its slope?',
    targets: ['I can say how the points and slopes of f and its inverse are linked.', 'I can find the slope of the inverse at a point using the derivative of f.', 'I can write the tangent line to an inverse at a point.'],
    tabs: ['Warm-up', 'Predict', 'Explore', 'Notes', 'Build', 'Practice', 'Check'],
    exploreTarget: 'I can see what happens to a slope when a curve is mirrored.',
    huddleTarget: 'I can find the slope of the inverse at a point.',
    buildTarget: 'I can find the slope of an inverse function at a point.',

    concepts: [
      { title: 'Inverse points', points: ['An inverse swaps inputs and outputs.', 'If f(a) = b, then f⁻¹(b) = a.'], eq: '(a, b) on f  →  (b, a) on f⁻¹' },
      { title: 'The mirror', points: ['The graph of f⁻¹ is the graph of f mirrored across y = x.', 'Mirroring swaps rise and run.'], eq: 'rise ↔ run' },
      { title: 'Reciprocal slopes', points: ['Slopes at mirrored points are reciprocals.', 'Flat becomes vertical.'], eq: '(f⁻¹)′(b) = 1 / f′(a)' },
      { title: 'Where to evaluate', points: ['Find a first: solve f(a) = b.', 'Put a into f′, not b.'], eq: 'f(a) = b  →  f′(a)' },
      { title: 'Tangent to the inverse', points: ['The point is (b, a).', 'The slope is 1 / f′(a).'], eq: 'y − a = (1 / f′(a))(x − b)' }
    ],

    huddle: {
      defs: [
        { term: 'Inverse', text: 'An inverse reverses [[inputs]] and outputs: if f(a) = b then f⁻¹(b) = [[a]].' },
        { term: 'Mirror', text: 'The graph of f⁻¹ is the graph of f reflected across [[y = x]].' },
        { term: 'Slopes', text: 'A reflection swaps rise and run, so the two slopes are [[reciprocals]].' }
      ],
      example: { prompt: 'f(x) = x³ + x. Find (f⁻¹)′(2).',
        steps: ['Solve f(a) = 2. By inspection a = [[1]]', 'The derivative is 3x² + 1, so at x = 1 it is [[4]]', 'Flip it: (f⁻¹)′(2) = [[1/4]]'] },
      label: { title: 'Label the mirror',
        html: '<svg viewBox="0 0 330 200" role="img" aria-label="The curve y equals x cubed plus x, its mirror across the line y equals x, and the points 1, 2 and 2, 1"><line x1="20" y1="180" x2="200" y2="0" stroke="#7a8a99" stroke-dasharray="5 4"/><path d="M62 156 L110 100 L150 20" fill="none" stroke="#2b4fd9" stroke-width="3"/><path d="M62 156 L110 100 L190 60" fill="none" stroke="#1c7d4a" stroke-width="3"/><circle cx="150" cy="20" r="5" fill="#2b4fd9"/><circle cx="190" cy="60" r="5" fill="#1c7d4a"/><text x="200" y="26" font-size="14" fill="#142230">(1, 2)</text><text x="200" y="66" font-size="14" fill="#142230">(2, 1)</text><circle cx="40" cy="40" r="9" fill="none" stroke="#142230"/><text x="36" y="45" font-size="12">1</text><circle cx="40" cy="80" r="9" fill="none" stroke="#142230"/><text x="36" y="85" font-size="12">2</text><circle cx="40" cy="120" r="9" fill="none" stroke="#142230"/><text x="36" y="125" font-size="12">3</text></svg>',
        tags: [{ n: 1, text: 'The curve through (1, 2) is the graph of [[f]].' }, { n: 2, text: 'Its mirror through (2, 1) is the graph of [[f⁻¹]].' }, { n: 3, text: 'f has slope 4 at (1, 2), so f⁻¹ has slope [[1/4]] at (2, 1).' }] }
    },

    /* three easy review items (the placement warm-up is retired) */
    review: [
      { id: 'R1', title: 'Review 1', prompt: 'If $f(2)=7$, then $f^{-1}(7)$ equals…', options: ['2', '7', '1/7', '1/2'], answer: 0, why: 'An inverse reverses inputs and outputs. $f$ sent 2 to 7, so $f^{-1}$ sends 7 back to 2.' },
      { id: 'R2', title: 'Review 2', prompt: 'The derivative of $y=\\sin(2x)$ is…', options: ['2cos(2x)', 'cos(2x)', '2sin(2x)', '−2cos(2x)'], answer: 0, why: 'Chain rule: the outside gives $\\cos(2x)$, and the inside $2x$ brings a factor 2.' },
      { id: 'R3', title: 'Review 3', prompt: 'The reciprocal of 4 is…', options: ['1/4', '−4', '−1/4', '4'], answer: 0, why: 'To take a reciprocal, flip the number over: $4=\\tfrac41$ becomes $\\tfrac14$.' }
    ],

    predicts: [
      { id: 'P1', title: 'Mirror a line', prompt: 'The line $y=2x$ has slope 2. Mirror it across $y=x$. The new line has slope…',
        options: ['2', '1/2', '−2', '−1/2'], answer: 1, why: 'The mirror swaps $x$ and $y$: $x=2y$, so $y=\\tfrac12x$. Rise and run trade places.' },
      { id: 'P2', title: 'A flat tangent', prompt: '$f(x)=x^3$ has a flat tangent at the origin. After mirroring across $y=x$, that tangent becomes…',
        options: ['flat', 'vertical', 'a line with slope 1', 'gone'], answer: 1, why: 'Rise and run swap. A run with no rise (flat) becomes a rise with no run (vertical).' }
    ],
    observe: [
      { id: 'O1', prompt: 'In Station 2, when $f$ had slope 4, the mirror curve had slope…', options: ['4', '1/4', '−4', '−1/4'], answer: 1, why: 'Rise and run swapped: the slope 4 over 1 became 1 over 4.' },
      { id: 'O2', prompt: 'Where $f$ has a flat tangent, its mirror has a…', options: ['flat tangent', 'vertical tangent', 'tangent with slope 1'], answer: 1, why: 'Flat means run with no rise. The mirror swaps them: rise with no run is vertical.' }
    ],
    exploreIds: ['X1', 'X2', 'X3', 'X4'],

    /* the mid-lesson check: after the notes, before the problems */
    mid: [
      { id: 'M1', title: 'Check 1', prompt: '$f(x)=x^3+x$ and $f(1)=2$. To find $(f^{-1})\'(2)$, you put into $f\'$ the number…', options: ['1', '2', '1/2', '3'], answer: 0, why: '$f^{\\prime}$ is read at the input of $f$. Here $f(1)=2$, so the input is $a=1$, never the output 2.' },
      { id: 'M2', title: 'Check 2', prompt: 'At some point $f\'(a)=0$. Then the inverse at the matching point has…', options: ['a vertical tangent', 'slope 0', 'slope 1', 'a slope equal to f(a)'], answer: 0, why: 'Slope $0$ flips to $\\tfrac10$, which is undefined: the mirror tangent is vertical.' }
    ],

    skills: [
      /* swap: find (f⁻¹)′ from f(a) = b and f′(a). Band 3 reads a table and ignores the decoy row. */
      { id: 'swap', title: 'Flip the slope', gen: function (b, r) {
        var m, a, v, rows, k, sgn = r() < 0.5 ? -1 : 1, ans;
        if (b <= 1) { m = pick(r, LIN); a = INT(r, 1, 4); v = INT(r, 5, 30);
          return { type: 'num', data: { a: a, b: v, d: m }, prompt: '$f(' + a + ')=' + v + '$ and $f\'(' + a + ')=' + m + '$. Find $(f^{-1})\'(' + v + ')$.', answer: inv(m),
            hint: 'Step card: flip the slope. Rise and run trade places, so you take the reciprocal. For example, a slope of 5 becomes $\\tfrac15=0.2$.',
            worked: 'The inverse slope is the reciprocal: $\\dfrac1{' + m + '}=' + fmt(inv(m)) + '$.' }; }
        if (b === 2) { m = sgn * pick(r, LIN); a = INT(r, 1, 4); v = INT(r, 5, 30) * sgn;
          return { type: 'num', data: { a: a, b: v, d: m }, prompt: '$f(' + a + ')=' + v + '$ and $f\'(' + a + ')=' + m + '$. Find $(f^{-1})\'(' + v + ')$.', answer: inv(m),
            hint: 'Step card: flip the slope, keep the sign. Take the reciprocal of $' + m + '$. For example, $-5$ becomes $-\\tfrac15=-0.2$.',
            worked: 'The reciprocal keeps the sign: $\\dfrac1{' + m + '}=' + fmt(inv(m)) + '$.' }; }
        rows = shuffle(r, [1, 2, 3]); var xsv = [1, 2, 3], fv = [INT(r, 4, 9), INT(r, 10, 19), INT(r, 20, 40)], dv = [pick(r, LIN), pick(r, [2, 4, 5, 8]), pick(r, [4, 5, 8, 10])];
        k = INT(r, 0, 2); ans = dv[k];
        var tab = '<table class="qtab"><tr><th>x</th><th>f(x)</th><th>f′(x)</th></tr>' + xsv.map(function (x, i) { return '<tr><td>' + x + '</td><td>' + fv[i] + '</td><td>' + dv[i] + '</td></tr>'; }).join('') + '</table>';
        return { type: 'num', pic: tab, data: { a: xsv[k], b: fv[k], d: ans, table: { x: xsv, f: fv, d: dv } }, prompt: 'The table gives selected values of a one-to-one function $f$ and its derivative. Find $(f^{-1})\'(' + fv[k] + ')$.', answer: inv(ans),
          hint: 'Step card: find the row where $f(x)=' + fv[k] + '$, read $x$, then flip $f\'$ in that same row. Example: if $f(x)=9$ happens in the row with $f\'=5$, the answer is $\\tfrac15$.',
          worked: '$f(' + xsv[k] + ')=' + fv[k] + '$, so use $f\'(' + xsv[k] + ')=' + ans + '$. The answer is $\\dfrac1{' + ans + '}=' + fmt(inv(ans)) + '$.' };
      } },

      /* which: where do I put the input of f′? */
      { id: 'which', title: 'Where does f′ go', gen: function (b, r) {
        var it = b <= 1 ? pick(r, CUBE.slice(0, 4)) : pick(r, CUBE.concat(MORE.slice(0, 2))), opts, order, right = 'x = ' + it.a;
        opts = [right, 'x = ' + it.b, 'x = ' + (it.a === 0 ? '1' : it.a + 1), 'x = ' + (it.b === 0 ? '1' : '1/' + it.b)].filter(function (o, i, arr) { return arr.indexOf(o) === i; });
        if (opts.length < 4) opts.push('x = ' + (it.b + it.a + 7));
        order = shuffle(r, opts);
        return { type: 'choice', data: { fx: it.fx, a: it.a, b: it.b }, prompt: '$f(x)=' + it.tex + '$ and $f(' + it.a + ')=' + it.b + '$. To find $(f^{-1})\'(' + it.b + ')$ you evaluate $f\'$ at…', options: order, answer: order.indexOf(right),
          hint: 'Step card: $f\'$ is read at the input of $f$. Find the input that makes $f$ give ' + it.b + '. Example: if $f(3)=20$, you would use $f\'(3)$ to answer for 20.',
          worked: '$f(' + it.a + ')=' + it.b + '$, so the input is ' + it.a + '. Evaluate $f\'(' + it.a + ')$, then flip it.' };
      } },

      /* compute: the whole job, f given */
      { id: 'compute', title: 'Slope of the inverse', gen: function (b, r) {
        var k, p, it, c;
        if (b <= 1) { k = pick(r, LIN); c = INT(r, 1, 9); p = INT(r, 2, 6);
          return { type: 'num', data: { fx: k + '*x+' + c, a: p, b: k * p + c, d: k }, prompt: '$f(x)=' + k + 'x+' + c + '$. Find $(f^{-1})\'(' + (k * p + c) + ')$.', answer: inv(k),
            hint: 'Step card: a line has the same slope everywhere. Find $f\'$ first, then flip it. For example, $f(x)=5x+1$ has $f\'=5$, so the inverse has slope $0.2$.',
            worked: '$f\'(x)=' + k + '$ everywhere, so $(f^{-1})\'=\\dfrac1{' + k + '}=' + fmt(inv(k)) + '$.' }; }
        if (b === 2) { it = pick(r, CUBE);
          return { type: 'num', data: { fx: it.fx, a: it.a, b: it.b, d: it.d }, prompt: '$f(x)=' + it.tex + '$. Find $(f^{-1})\'(' + it.b + ')$.', answer: inv(it.d),
            hint: 'Step card: (1) find $a$ with $f(a)=' + it.b + '$, (2) compute $f\'(a)$, (3) flip it. Step 1: try $x=' + it.a + '$.',
            worked: '$f(' + it.a + ')=' + it.b + '$. $f\'(' + it.a + ')=' + it.d + '$. So $(f^{-1})\'(' + it.b + ')=\\dfrac1{' + it.d + '}=' + fmt(inv(it.d)) + '$.' }; }
        it = pick(r, MORE);
        return { type: 'num', data: { fx: it.fx, a: it.a, b: it.b, d: it.d }, prompt: '$f(x)=' + it.tex + '$. Find $(f^{-1})\'(' + it.b + ')$.', answer: inv(it.d),
          hint: 'Step card: (1) find $a$ with $f(a)=' + it.b + '$, (2) compute $f\'(a)$, (3) flip it. Step 1: try $x=' + it.a + '$.',
          worked: '$f(' + it.a + ')=' + it.b + '$. $f\'(' + it.a + ')=' + it.d + '$. So $(f^{-1})\'(' + it.b + ')=\\dfrac1{' + it.d + '}=' + fmt(inv(it.d)) + '$.' };
      } },

      /* tangent: the tangent line to the inverse at (b, a) */
      { id: 'tangent', title: 'Tangent to the inverse', gen: function (b, r) {
        var it = b <= 1 ? pick(r, CUBE.slice(0, 4)) : (b === 2 ? pick(r, CUBE) : pick(r, MORE)), m = '(1/' + it.d + ')';
        return { type: 'expr', data: { fx: it.fx, a: it.a, b: it.b, d: it.d }, prompt: 'Write the tangent line to $f^{-1}$ at the point $' + ptTex(it.b, it.a) + '$.', label: '$f(x)=' + it.tex + ',\\quad y=$', answer: m + '*' + xs(it.b) + '+(' + it.a + ')', vars: ['x'],
          hints: ['Step card: the point is $(b,a)=' + ptTex(it.b, it.a) + '$. The slope is $1/f\'(a)$ with $a=' + it.a + '$.', 'First step: compute $f\'(' + it.a + ')$.', 'Same move on another example: $f(x)=x^3+x$ has $f\'(1)=4$, so its inverse at $(2,1)$ has slope $\\tfrac14$ and line $y=\\tfrac14(x-2)+1$.'],
          traps: [{ expr: it.d + '*' + xs(it.b) + '+(' + it.a + ')', msg: 'That slope is $f\'(a)$. The inverse slope is its reciprocal.' }, { expr: m + '*' + xs(it.a) + '+(' + it.b + ')', msg: 'The point of $f^{-1}$ is $(b,a)$: the output of $f$ comes first.' }].filter(function (t, i) { return i === 0 || it.a !== it.b; }),   /* a swapped point is no trap when a = b */
          worked: 'The point is $' + ptTex(it.b, it.a) + '$ and the slope is $\\dfrac1{' + it.d + '}$. So $y=\\dfrac1{' + it.d + '}(x-(' + it.b + '))+(' + it.a + ')$.' };
      } }
    ],

    misconceptions: [
      { say: '(f⁻¹)′ means 1 / f′(x), so put the same x in.', fix: 'Find a with f(a) = b first. Put a into f′.' },
      { say: 'f⁻¹ means 1 / f.', fix: 'It means the inverse function, not the reciprocal. Only the slopes are reciprocals.' },
      { say: 'The tangent to f⁻¹ at (b, a) uses the point (a, b).', fix: 'The inverse point has the output first: (b, a).' },
      { say: 'A flat tangent on f gives a flat tangent on f⁻¹.', fix: 'Flat becomes vertical: 1/0 is undefined.' }
    ]
    /* no pacing: the lesson has no clock, no trim, no skip and no end mark */
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = SPEC; else (root.SPECS = root.SPECS || {})[SPEC.id] = SPEC;
})(typeof window !== 'undefined' ? window : globalThis);
