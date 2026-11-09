/* SPEC (calculus 4.1): the lesson page, the key PDFs and the unit tests all read this one file.
   Self-paced (selfPaced: true), the same shape as 3.3 to 3.5: no clock, no trimming, no skipping, no end mark, no stamp. Progress saves on the device.
   Math is written the way qkit writes it: $x^2$ in prompts, typed answers in mathcheck syntax. Huddle text is plain text (no $ math).
   Every skill item carries the data its test needs, so tests/unit/derivative-context.test.js can check it without using the lesson's rules:
     meaning   data.say or data.write: the sign, the number, the units and the words are recomputed from the context.
     units     data.kind (first or second) and the context: the right option is rebuilt from the units.
     estimate  data.f0, rate, h (bands 1-2) or data.js and a, h (band 3): the answer is f(a) + h f′(a), with f′ from a numeric derivative.
     rate      data.js and a: the answer is a numeric derivative. */
(function (root) {
  'use strict';
  var INT = function (r, a, b) { return a + Math.floor(r() * (b - a + 1)); };
  var pick = function (r, arr) { return arr[Math.floor(r() * arr.length)]; };
  var shuffle = function (r, arr) { var a = arr.slice(), i, j, t; for (i = a.length - 1; i > 0; i--) { j = Math.floor(r() * (i + 1)); t = a[i]; a[i] = a[j]; a[j] = t; } return a; };
  var rnd = function (v) { return +v.toFixed(6); };

  /* contexts: f the function letter, x the variable letter, line the sentence that defines it, y/xu the units, xs the singular of xu,
     noun what f measures, rise/fall the words for f′ > 0 and f′ < 0, a and f0 the sensible ranges for a point and a value there */
  var CTX = [
    { f: 'C', x: 'x', line: '$C(x)$ is the cost, in dollars, of making $x$ shirts.', y: 'dollars', ys: 'dollar', xu: 'shirts', xs: 'shirt', noun: 'the cost', rise: 'rising', fall: 'falling', a: [20, 80], f0: [200, 900] },
    { f: 'V', x: 't', line: '$V(t)$ is the number of gallons of water in a tank $t$ minutes after noon.', y: 'gallons', ys: 'gallon', xu: 'minutes', xs: 'minute', noun: 'the amount of water', rise: 'increasing', fall: 'decreasing', a: [2, 20], f0: [40, 300] },
    { f: 'T', x: 't', line: '$T(t)$ is the temperature, in degrees Fahrenheit, of an oven $t$ minutes after it is turned on.', y: 'degrees', ys: 'degree', xu: 'minutes', xs: 'minute', noun: 'the temperature', rise: 'rising', fall: 'falling', a: [2, 15], f0: [100, 400] },
    { f: 'P', x: 't', line: '$P(t)$ is the number of people in a town $t$ years after 2020.', y: 'people', ys: 'person', xu: 'years', xs: 'year', noun: 'the population', rise: 'growing', fall: 'shrinking', a: [1, 9], f0: [1000, 9000] },
    { f: 'H', x: 't', line: '$H(t)$ is the height, in feet, of a tree $t$ years after it was planted.', y: 'feet', ys: 'foot', xu: 'years', xs: 'year', noun: 'the height', rise: 'growing', fall: 'shrinking', a: [1, 12], f0: [5, 40] }
  ];
  /* contexts whose units are compound (square or cubic units), used from band 2 on */
  var CTX2 = [
    { f: 'A', x: 'r', line: '$A(r)$ is the area, in square inches, of a pizza with radius $r$ inches.', y: 'square inches', xu: 'inches', xs: 'inch' },
    { f: 'M', x: 't', line: '$M(t)$ is the mass, in grams, of a sample of ice $t$ minutes after it is taken out of a freezer.', y: 'grams', xu: 'minutes', xs: 'minute' },
    { f: 'W', x: 'h', line: '$W(h)$ is the volume, in cubic feet, of water in a rain barrel after $h$ hours of rain.', y: 'cubic feet', xu: 'hours', xs: 'hour' }
  ];

  /* a polynomial in the variable v, c[i] the coefficient of v^i */
  function polyIn(c, v, tex) {
    var out = '', i, k, a, t;
    for (i = c.length - 1; i >= 0; i--) { k = c[i]; if (!k) continue; a = Math.abs(k);
      t = i === 0 ? String(a) : (a === 1 ? '' : String(a)) + (i === 1 ? v : (tex ? v + '^{' + i + '}' : v + '^' + i));
      out += (out ? (k < 0 ? '-' : '+') : (k < 0 ? '-' : '')) + t; }
    return out || '0';
  }
  var dpoly = function (c) { return c.slice(1).map(function (k, i) { return k * (i + 1); }); };
  var evalPoly = function (c, x) { var s = 0, i; for (i = c.length - 1; i >= 0; i--) s = s * x + c[i]; return s; };
  var jsPoly = function (c, v) { return c.map(function (k, i) { return k ? k + '*Math.pow(' + v + ',' + i + ')' : null; }).filter(Boolean).join('+') || '0'; };
  /* put the right option first, shuffle, return {options, answer} */
  function mix(r, opts) { var order = shuffle(r, opts.map(function (_, i) { return i; })); return { options: order.map(function (i) { return opts[i]; }), answer: order.indexOf(0) }; }

  var SPEC = {
    id: '4-1-derivative-context', course: 'calc', unit: 'Unit 4 · Contextual Applications of Differentiation', title: '4.1 Interpreting Derivatives in Context',
    selfPaced: true,
    question: 'What does a derivative tell you when the function is a real quantity, like water in a tank?',
    targets: ['I can say what f′(a) means in a story, with units.', 'I can tell if a quantity is rising or falling from the sign of f′.', 'I can use f(a) and f′(a) to estimate a nearby value.'],
    tabs: ['Warm-up', 'Predict', 'Explore', 'Notes', 'Build', 'Practice', 'Check'],
    exploreTarget: 'I can read a rate off a graph and say what it means.',
    huddleTarget: 'I can write what a derivative means, with units.',
    buildTarget: 'I can say what a rate means and use it to estimate.',

    concepts: [
      { title: 'A derivative is a rate', points: ['f′(a) is how fast f is changing at x = a.', 'On the graph it is the slope of the tangent line.'], eq: 'f′(a) = rate of change at a' },
      { title: 'Units', points: ['Units of f′ are the units of f per the units of x.', 'Gallons of water over minutes gives gallons per minute.'], eq: 'units of f′ = (units of f) / (units of x)' },
      { title: 'Say it in a sentence', points: ['At x = a, the quantity is rising or falling at |f′(a)| units per unit.', 'A positive rate means rising. A negative rate means falling.'], eq: 'f′(a) > 0 rising, f′(a) < 0 falling' },
      { title: 'Estimate a nearby value', points: ['Over a short step h, the rate stays about the same.', 'So the change is about the rate times h.'], eq: 'f(a + h) ≈ f(a) + h · f′(a)' }
    ],

    huddle: {
      defs: [
        { term: 'Derivative as a rate', text: 'f′(a) is the [[rate]] of change of f at x = a. It is the [[slope]] of the tangent line.' },
        { term: 'Units', text: 'The units of f′ are the units of f [[per]] the units of x.' },
        { term: 'Reading the sign', text: 'If f′(a) > 0, then f is [[increasing]]. If f′(a) < 0, then f is [[decreasing]].' },
        { term: 'Estimating', text: 'f(a + h) ≈ f(a) + [[h]] · f′(a). It works best when h is [[small]].' }
      ],
      example: { prompt: 'A tank holds V(t) = 40 + 12t − t² gallons, t in minutes. Find V′(3) and say what it means.',
        steps: ['Differentiate: V′(t) = 12 − [[2t]]', 'Put in t = 3: V′(3) = 12 − 6 = [[6]]', 'The units are gallons [[per minute]]', 'At t = 3 minutes, the tank is [[filling]] at 6 gallons per minute.'] },
      label: { title: 'Label the picture',
        html: '<svg viewBox="0 0 330 160" role="img" aria-label="A curve that rises and falls with a tangent line at one point, marked 1, 2 and 3"><line x1="20" y1="125" x2="310" y2="125" stroke="#7a8a99" stroke-width="1.5"/><path d="M20 115 Q 160 -55 300 115" fill="none" stroke="#2b4fd9" stroke-width="3"/><line x1="30" y1="88" x2="150" y2="15" stroke="#b3412e" stroke-width="2.5"/><circle cx="90" cy="51" r="5" fill="#142230"/><circle cx="246" cy="38" r="10" fill="none" stroke="#142230"/><text x="242" y="43" font-size="13">1</text><circle cx="168" cy="12" r="10" fill="none" stroke="#142230"/><text x="164" y="17" font-size="13">2</text><circle cx="165" cy="146" r="10" fill="none" stroke="#142230"/><text x="161" y="151" font-size="13">3</text></svg>',
        tags: [{ n: 1, text: 'The curve: its height is the [[amount]].' }, { n: 2, text: 'The tangent line: its slope is the [[rate]].' }, { n: 3, text: 'The horizontal axis: the [[time]] or input.' }] }
    },

    /* three easy review items from earlier lessons */
    review: [
      { id: 'R1', title: 'Review 1', prompt: 'The derivative of $5x^2-3x$ is…', options: ['10x − 3', '5x − 3', '10x', '5x² − 3'], answer: 0, why: 'Power rule on each term: $5x^2$ gives $10x$, and $-3x$ gives $-3$.' },
      { id: 'R2', title: 'Review 2', prompt: 'A line passes through $(1,2)$ and $(3,8)$. Its slope is…', options: ['3', '6', '2', '1/3'], answer: 0, why: 'Rise over run: $\\dfrac{8-2}{3-1}=3$.' },
      { id: 'R3', title: 'Review 3', prompt: 'If $f\'(x)<0$ on an interval, then $f$ is…', options: ['decreasing', 'increasing', 'constant', 'undefined'], answer: 0, why: 'A negative slope means the graph of $f$ goes down.' }
    ],

    predicts: [
      { id: 'P1', title: 'A tank is changing', prompt: 'A tank holds $V(t)$ gallons after $t$ minutes, and $V\'(5)=-3$. At $t=5$ the tank is…', options: ['losing water', 'gaining water', 'holding steady', 'holding 5 gallons'], answer: 0, why: 'A negative derivative means the amount is going down.' },
      { id: 'P2', title: 'The units', prompt: 'For the same tank, $V(t)$ is in gallons and $t$ is in minutes. The derivative $V\'(t)$ is measured in…', options: ['gallons per minute', 'gallons', 'minutes per gallon', 'minutes'], answer: 0, why: 'A rate is the amount that changes divided by the time it takes: gallons per minute.' }
    ],
    observe: [
      { id: 'O1', prompt: 'In Station 1, at the moment the tank was neither filling nor emptying, the rate reading was…', options: ['0', '1', '12', '−1'], answer: 0, why: 'A flat tangent has slope 0, and the slope is the rate.' },
      { id: 'O2', prompt: 'In Station 3, when the step $h$ was small, the tangent-line estimate was…', options: ['very close to the actual value', 'far from the actual value', 'always too big', 'always exact'], answer: 0, why: 'For a small step the curve stays close to its tangent line, so the estimate is good.' }
    ],
    exploreIds: ['X1', 'X2', 'X3', 'X4'],

    /* the mid-lesson check: after the notes, before the problems */
    mid: [
      { id: 'M1', title: 'Check 1', prompt: '$V\'(2)=8$ gallons per minute. About how many gallons come in during the next half minute?', options: ['4', '8', '16', '2'], answer: 0, why: 'Change is about rate times time: $8\\times0.5=4$ gallons.' },
      { id: 'M2', title: 'Check 2', prompt: 'If $C\'(a)<0$, then at $x=a$ the cost is…', options: ['going down', 'going up', 'zero', 'at its smallest'], answer: 0, why: 'A negative rate means the quantity is falling at that point.' }
    ],

    skills: [
      /* meaning: choose the sentence that says what a derivative fact means. Band 1 positive rates, band 2 also negative rates,
         band 3 goes the other way: from the sentence to the notation. */
      { id: 'meaning', title: 'Say what it means', gen: function (b, r) {
        b = Math.min(b, 3);
        var c = pick(r, CTX), a = INT(r, c.a[0], c.a[1]), v = INT(r, 2, 9), neg = b >= 2 && r() < 0.5, F = c.f, X = c.x, sv = neg ? -v : v, dir = neg ? c.fall : c.rise, opp = neg ? c.rise : c.fall, rt, opts, m;
        if (v === a) v = v === 9 ? 8 : v + 1;
        sv = neg ? -v : v;
        rt = v + ' ' + c.y + ' per ' + c.xs;
        if (b <= 2) {
          opts = ['When ' + X + ' = ' + a + ', ' + c.noun + ' is ' + dir + ' at ' + rt + '.',
                  'When ' + X + ' = ' + a + ', ' + c.noun + ' is ' + dir + ' at ' + v + ' ' + c.xu + ' per ' + c.ys + '.',
                  c.noun.charAt(0).toUpperCase() + c.noun.slice(1) + ' is ' + v + ' ' + c.y + ' when ' + X + ' = ' + a + '.',
                  'When ' + X + ' = ' + a + ', ' + c.noun + ' is ' + opp + ' at ' + rt + '.'];
          m = mix(r, opts);
          return { type: 'choice', data: { say: { sign: sv, v: v, a: a, dir: dir, rate: rt, right: opts[0] } }, prompt: c.line + ' Also $' + F + '\'(' + a + ')=' + sv + '$. What does this say?', options: m.options, answer: m.answer,
            hint: 'Step card: a derivative is a rate, so the sentence needs three things: the direction (the sign), the size, and the units "' + c.y + ' per ' + c.xs + '". First step: the number is ' + (neg ? 'negative' : 'positive') + ', so ' + c.noun + ' is ' + dir + '. Same move: if $D\'(4)=-3$ for a pond\'s depth in inches at $t$ days, then at 4 days the depth is falling at 3 inches per day.',
            worked: 'The sign is ' + (neg ? 'negative' : 'positive') + ', so ' + c.noun + ' is ' + dir + '. The size is ' + v + ' and the units are ' + c.y + ' per ' + c.xs + '.' };
        }
        opts = ['$' + F + '\'(' + a + ')=' + v + '$', '$' + F + '(' + a + ')=' + v + '$', '$' + F + '\'(' + v + ')=' + a + '$', '$' + F + '(' + v + ')=' + a + '$'];
        m = mix(r, opts);
        return { type: 'choice', data: { write: { v: v, a: a, right: opts[0] } }, prompt: c.line + ' Which equation says: "When ' + X + ' = ' + a + ', ' + c.noun + ' is ' + c.rise + ' at ' + rt + '"?', options: m.options, answer: m.answer,
          hint: 'Step card: "at a rate of" means a derivative, so there is a prime. The number after the equals sign is the rate. The number inside the brackets is the input. First step: the input is ' + a + '. Same move: "the tank is filling at 5 gallons per minute at 2 minutes" is $V\'(2)=5$.',
          worked: 'A rate is a derivative, so use $' + F + '\'$. The input is ' + a + ' and the rate is ' + v + ': $' + F + '\'(' + a + ')=' + v + '$.' };
      } },

      /* units: the units of f′ (bands 1 and 3) or f″ (band 2). Options are shuffled. */
      { id: 'units', title: 'Units of a rate', gen: function (b, r) {
        b = Math.min(b, 3);
        var c = b === 1 ? pick(r, CTX) : pick(r, CTX.concat(CTX2)), second = b === 2, prime = second ? '\'\'' : '\'', right, opts, m;
        right = second ? c.y + ' per ' + c.xs + ' per ' + c.xs : c.y + ' per ' + c.xs;
        opts = [right, c.xu + ' per ' + c.y, c.y, c.y + ' ' + c.xu];
        if (second) opts = [right, c.y + ' per ' + c.xs, c.y + ' per ' + c.xs + ' squared times ' + c.xs, c.y];
        m = mix(r, opts);
        return { type: 'choice', data: { kind: second ? 'second' : 'first', y: c.y, xs: c.xs, xu: c.xu, right: right }, prompt: c.line + ' What are the units of $' + c.f + prime + '(' + c.x + ')$?', options: m.options, answer: m.answer,
          hint: 'Step card: a rate is "units of the output per units of the input". ' + (second ? 'The second derivative is a rate of a rate, so "per" shows up twice. ' : '') + 'First step: the output is measured in ' + c.y + ' and the input in ' + c.xu + '. Same move: for a car, miles over hours gives miles per hour.',
          worked: 'The output is in ' + c.y + ' and the input is in ' + c.xu + ', so ' + (second ? 'the second derivative is in ' + right + '.' : 'the derivative is in ' + right + '.') };
      } },

      /* estimate: f(a + h) ≈ f(a) + h f′(a), a number. Bands 1-2 give f(a) and f′(a); band 3 gives a formula. */
      { id: 'estimate', title: 'Estimate a nearby value', gen: function (b, r) {
        b = Math.min(b, 3);
        var c = pick(r, CTX), a, f0, rate, h, ans, cf, sgn;
        if (b <= 2) {
          a = INT(r, c.a[0] + 3, c.a[1] + 3); f0 = INT(r, c.f0[0] / 10, c.f0[1] / 10) * 10; rate = INT(r, 2, 9) * (b === 2 && r() < 0.5 ? -1 : 1);
          h = b === 1 ? INT(r, 1, 4) : pick(r, [-3, -2, -1, 2, 3, 5]); ans = f0 + rate * h;
          return { type: 'num', tol: 0, abs: 0.001, data: { f0: f0, rate: rate, h: h, a: a }, prompt: c.line + ' Right now $' + c.x + '=' + a + '$, with $' + c.f + '(' + a + ')=' + f0 + '$ and $' + c.f + '\'(' + a + ')=' + rate + '$ ' + c.y + ' per ' + c.xs + '. Estimate $' + c.f + '(' + (a + h) + ')$.', answer: ans, unit: c.y,
            hint: 'Step card: change is about rate × step. Step 1: the step is $h=' + h + '$. Step 2: add rate × h to the starting value. First step: rate × h = ' + rate + ' × ' + h + ' = ' + (rate * h) + '. Same move: start at 100, rate 3 per minute, step 2 minutes gives $100+3\\cdot2=106$.',
            worked: 'The step is ' + h + ' ' + c.xs + (Math.abs(h) === 1 ? '' : 's') + '. Change ≈ ' + rate + ' × ' + h + ' = ' + (rate * h) + '. So $' + c.f + '(' + (a + h) + ')\\approx' + f0 + (rate * h < 0 ? '-' : '+') + Math.abs(rate * h) + '=' + ans + '$.' };
        }
        a = INT(r, 1, 6); h = pick(r, [1, 2, 3]); cf = [INT(r, 10, 60), INT(r, 2, 15), INT(r, 1, 4) * (r() < 0.5 ? -1 : 1)]; if (r() < 0.5) cf.push(INT(r, 1, 2) * (r() < 0.5 ? -1 : 1));
        f0 = evalPoly(cf, a); rate = evalPoly(dpoly(cf), a); ans = f0 + h * rate;
        return { type: 'num', tol: 0, abs: 0.001, data: { js: jsPoly(cf, 'x'), a: a, h: h }, prompt: '$' + c.f + '(' + c.x + ')=' + polyIn(cf, c.x, true) + '$ is ' + c.line.replace(/^\$[^$]+\$ is /, '') + ' Use $' + c.f + '(' + a + ')$ and $' + c.f + '\'(' + a + ')$ to estimate $' + c.f + '(' + (a + h) + ')$.', answer: ans, unit: c.y,
          hint: 'Step card: (1) find $' + c.f + '(' + a + ')$, (2) differentiate and find $' + c.f + '\'(' + a + ')$, (3) add rate × step. First step: $' + c.f + '(' + a + ')=' + f0 + '$. Same move: if $f(2)=10$ and $f\'(2)=4$, then $f(3)\\approx10+4\\cdot1=14$.',
          worked: '$' + c.f + '(' + a + ')=' + f0 + '$ and $' + c.f + '\'(' + a + ')=' + rate + '$. The estimate is $' + f0 + '+' + h + '\\cdot(' + rate + ')=' + ans + '$.' };
      } },

      /* rate: find f′(a) for a formula, a number with units. Band 1 quadratics, band 2 cubics and square roots, band 3 chain and exponential. */
      { id: 'rate', title: 'Find the rate', gen: function (b, r) {
        b = Math.min(b, 3);
        var c = pick(r, CTX), a, cf, ans, k, A, n, m, js, formula, d1, ex = 'for $g(t)=t^2+5t$, $g\'(t)=2t+5$, so $g\'(2)=9$.';
        if (b <= 1) { a = INT(r, 1, 6); cf = [INT(r, 10, 60), INT(r, 2, 15), INT(r, 1, 3) * (r() < 0.5 ? -1 : 1)];
          ans = evalPoly(dpoly(cf), a); js = jsPoly(cf, 'x'); formula = polyIn(cf, c.x, true); d1 = polyIn(dpoly(cf), c.x, true); }
        else if (b === 2) {
          if (r() < 0.5) { a = INT(r, 1, 5); cf = [INT(r, 10, 60), INT(r, 2, 12), INT(r, -4, 4), INT(r, 1, 2)]; ans = evalPoly(dpoly(cf), a); js = jsPoly(cf, 'x'); formula = polyIn(cf, c.x, true); d1 = polyIn(dpoly(cf), c.x, true); }
          else { a = pick(r, [1, 4, 9, 16]); k = pick(r, [2, 4, 6, 8]); ans = rnd(k / (2 * Math.sqrt(a))); js = k + '*Math.sqrt(x)'; formula = k + '\\sqrt{' + c.x + '}'; d1 = '\\dfrac{' + k + '}{2\\sqrt{' + c.x + '}}'; ex = 'for $g(t)=6\\sqrt t$, $g\'(t)=\\dfrac{3}{\\sqrt t}$, so $g\'(9)=1$.'; }
        } else {
          if (r() < 0.5) { A = INT(r, 2, 9) * 10; k = pick(r, [2, 3, 5]) / 10; a = 0; ans = rnd(A * k); js = A + '*Math.exp(' + k + '*x)'; formula = A + 'e^{' + k + c.x + '}'; d1 = A + '\\cdot' + k + 'e^{' + k + c.x + '}'; ex = 'for $g(t)=30e^{0.1t}$, $g\'(t)=3e^{0.1t}$, so $g\'(0)=3$.'; }
          else { m = INT(r, 1, 3); n = pick(r, [2, 3]); a = 1; ans = n * Math.pow(1 + m, n - 1) * 2; js = 'Math.pow(x*x+' + m + ',' + n + ')'; formula = '(' + c.x + '^{2}+' + m + ')^{' + n + '}'; d1 = n + '(' + c.x + '^2+' + m + ')^{' + (n - 1) + '}\\cdot2' + c.x; ex = 'for $g(t)=(t^2+2)^2$, $g\'(t)=2(t^2+2)\\cdot2t$, so $g\'(1)=12$.'; }
        }
        return { type: 'num', tol: 0, abs: 0.001, data: { js: js, a: a }, prompt: '$' + c.f + '(' + c.x + ')=' + formula + '$ is ' + c.line.replace(/^\$[^$]+\$ is /, '') + ' Find $' + c.f + '\'(' + a + ')$.', answer: ans, unit: c.y + ' per ' + c.xs,
          hint: 'Step card: differentiate first, write $' + c.f + '\'(' + c.x + ')$ in full, then put in $' + c.x + '=' + a + '$. First step: $' + c.f + '\'(' + c.x + ')=' + d1 + '$. Same move on another example: ' + ex,
          worked: '$' + c.f + '\'(' + c.x + ')=' + d1 + '$. Putting in $' + c.x + '=' + a + '$ gives $' + ans + '$ ' + c.y + ' per ' + c.xs + '.' };
      } }
    ],

    misconceptions: [
      { say: 'V′(3) = 6 means the tank holds 6 gallons at 3 minutes.', fix: 'V(3) is the amount. V′(3) is the rate: 6 gallons per minute.' },
      { say: 'The units of V′ are gallons.', fix: 'A rate has units of the output per units of the input: gallons per minute.' },
      { say: 'A negative derivative means the quantity is negative.', fix: 'It means the quantity is going down. The quantity itself can still be large.' },
      { say: 'The estimate f(a) + h f′(a) is exact.', fix: 'It is an estimate. It is best for small h and gets worse as h grows.' },
      { say: 'Forgetting the units or the direction when writing what f′ means.', fix: 'Write rising or falling, then the size, then "units per unit".' }
    ]
    /* no pacing: the lesson has no clock, no trim, no skip and no end mark */
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = SPEC; else (root.SPECS = root.SPECS || {})[SPEC.id] = SPEC;
})(typeof window !== 'undefined' ? window : globalThis);
