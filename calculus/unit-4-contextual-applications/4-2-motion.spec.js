/* SPEC (calculus 4.2): the lesson page, the key PDFs and the unit tests all read this one file.
   Self-paced (selfPaced: true), the same shape as 3.3 to 3.5: no clock, no trimming, no skipping, no end mark, no stamp. Progress saves on the device.
   Math is written the way qkit writes it: $t^2$ in prompts, typed answers in mathcheck syntax (variable t). Huddle text is plain text (no $ math).
   Every skill item carries the data its test needs, so tests/unit/motion.test.js can check it without using the lesson's rules:
     vel     data.js, the position s(t) in plain JavaScript; the answer is checked against a numeric derivative.
     accel   data.js, the position s(t); the answer is checked against a second difference.
     dir     data.v (the velocity value) or data.js and a (position or velocity as a function); the direction is recomputed from the sign.
     speed   data.v and data.acc, or data.js and a; speeding up or slowing down is recomputed from the signs. */
(function (root) {
  'use strict';
  var INT = function (r, a, b) { return a + Math.floor(r() * (b - a + 1)); };
  var pick = function (r, arr) { return arr[Math.floor(r() * arr.length)]; };
  var shuffle = function (r, arr) { var a = arr.slice(), i, j, t; for (i = a.length - 1; i > 0; i--) { j = Math.floor(r() * (i + 1)); t = a[i]; a[i] = a[j]; a[j] = t; } return a; };
  function mix(r, opts) { var order = shuffle(r, opts.map(function (_, i) { return i; })); return { options: order.map(function (i) { return opts[i]; }), answer: order.indexOf(0) }; }

  /* polynomials in t: c[i] is the coefficient of t^i */
  function polyIn(c, tex) {
    var out = '', i, k, a, t;
    for (i = c.length - 1; i >= 0; i--) { k = c[i]; if (!k) continue; a = Math.abs(k);
      t = i === 0 ? String(a) : (a === 1 ? '' : String(a)) + (i === 1 ? 't' : (tex ? 't^{' + i + '}' : 't^' + i));
      out += (out ? (k < 0 ? '-' : '+') : (k < 0 ? '-' : '')) + t; }
    return out || '0';
  }
  var dpoly = function (c) { return c.slice(1).map(function (k, i) { return k * (i + 1); }); };
  var evalPoly = function (c, x) { var s = 0, i; for (i = c.length - 1; i >= 0; i--) s = s * x + c[i]; return s; };
  var jsPoly = function (c) { return c.map(function (k, i) { return k ? k + '*Math.pow(x,' + i + ')' : null; }).filter(Boolean).join('+') || '0'; };
  var sgn = function (v) { return v > 0 ? 1 : v < 0 ? -1 : 0; };

  /* Position families s(t) for the typed skills. Each has tex (the position), js (in x), v and a (the first and second derivative in mathcheck syntax),
     vtex (v in TeX, shown in the first hint), vtraps/atraps (named wrong answers), exv/exa (a different example for the third hint). */
  var FAM = {
    sin: function (k, m) { return { tex: k + '\\sin(' + m + 't)', js: k + '*Math.sin(' + m + '*x)', v: (k * m) + '*cos(' + m + '*t)', a: '-(' + (k * m * m) + ')*sin(' + m + '*t)', vtex: k * m + '\\cos(' + m + 't)',
      vtraps: [{ expr: (k * m) + '*sin(' + m + '*t)', msg: 'The derivative of sine is cosine.' }, { expr: k + '*cos(' + m + '*t)', msg: 'The chain rule brings down a factor of ' + m + ' too.' }], atraps: [{ expr: (k * m * m) + '*sin(' + m + '*t)', msg: 'Check the sign: sin goes to cos, then to $-\\sin$.' }, { expr: (k * m) + '*cos(' + m + '*t)', msg: 'That is $v$. Differentiate once more.' }],
      exv: 'for $s=4\\sin(5t)$: $v=20\\cos(5t)$.', exa: 'for $s=4\\sin(5t)$: $v=20\\cos(5t)$, so $a=-100\\sin(5t)$.' }; },
    cos: function (k, m) { return { tex: k + '\\cos(' + m + 't)', js: k + '*Math.cos(' + m + '*x)', v: '-(' + (k * m) + ')*sin(' + m + '*t)', a: '-(' + (k * m * m) + ')*cos(' + m + '*t)', vtex: '-' + k * m + '\\sin(' + m + 't)',
      vtraps: [{ expr: (k * m) + '*sin(' + m + '*t)', msg: 'Check the sign: the derivative of cosine is $-\\sin$.' }, { expr: '-(' + k + ')*sin(' + m + '*t)', msg: 'The chain rule brings down a factor of ' + m + ' too.' }], atraps: [{ expr: (k * m * m) + '*cos(' + m + '*t)', msg: 'Check the sign: cos goes to $-\\sin$, then to $-\\cos$.' }, { expr: '-(' + (k * m) + ')*sin(' + m + '*t)', msg: 'That is $v$. Differentiate once more.' }],
      exv: 'for $s=4\\cos(5t)$: $v=-20\\sin(5t)$.', exa: 'for $s=4\\cos(5t)$: $v=-20\\sin(5t)$, so $a=-100\\cos(5t)$.' }; },
    exp: function (A, k) { return { tex: A + 'e^{' + k + 't}', js: A + '*Math.exp(' + k + '*x)', v: (A * k) + '*e^(' + k + '*t)', a: (A * k * k) + '*e^(' + k + '*t)', vtex: A * k + 'e^{' + k + 't}',
      vtraps: [{ expr: A + '*e^(' + k + '*t)', msg: 'The chain rule brings down a factor of ' + k + '.' }], atraps: [{ expr: (A * k) + '*e^(' + k + '*t)', msg: 'That is $v$. Differentiate once more.' }, { expr: (A * k) + '*e^(' + k + '*t)', msg: 'Each derivative brings down a factor of ' + k + '. You need it twice.' }],
      exv: 'for $s=3e^{5t}$: $v=15e^{5t}$.', exa: 'for $s=3e^{5t}$: $v=15e^{5t}$, so $a=75e^{5t}$.' }; },
    tex: function (k) { return { tex: 't\\,e^{' + k + 't}', js: 'x*Math.exp(' + k + '*x)', v: '(1+' + k + '*t)*e^(' + k + '*t)', a: '(' + (2 * k) + '+' + (k * k) + '*t)*e^(' + k + '*t)', vtex: '(1+' + k + 't)e^{' + k + 't}',
      vtraps: [{ expr: 'e^(' + k + '*t)', msg: 'This is a product. Use the product rule: both factors change.' }, { expr: k + '*t*e^(' + k + '*t)', msg: 'The product rule gives two terms. You kept only one.' }], atraps: [{ expr: '(1+' + k + '*t)*e^(' + k + '*t)', msg: 'That is $v$. Differentiate once more.' }, { expr: (k * k) + '*t*e^(' + k + '*t)', msg: 'The product rule gives two terms each time. One is missing.' }],
      exv: 'for $s=t\\,e^{2t}$: $v=(1+2t)e^{2t}$.', exa: 'for $s=t\\,e^{2t}$: $v=(1+2t)e^{2t}$, so $a=(4+4t)e^{2t}$.' }; },
    tsin: function () { return { tex: 't\\sin t', js: 'x*Math.sin(x)', v: 'sin(t)+t*cos(t)', a: '2*cos(t)-t*sin(t)', vtex: '\\sin t+t\\cos t',
      vtraps: [{ expr: 'cos(t)', msg: 'This is a product. Use the product rule: both factors change.' }, { expr: 'sin(t)+cos(t)', msg: 'In the second term, $t$ stays and the derivative of sine is cosine: $t\\cos t$.' }], atraps: [{ expr: 'sin(t)+t*cos(t)', msg: 'That is $v$. Differentiate once more.' }, { expr: 'cos(t)-t*sin(t)', msg: 'The product rule gives $\\cos t$ twice: once from each term of $v$.' }],
      exv: 'for $s=t\\cos t$: $v=\\cos t-t\\sin t$.', exa: 'for $s=t\\cos t$: $v=\\cos t-t\\sin t$, so $a=-2\\sin t-t\\cos t$.' }; },
    sq: function (c) { return { tex: '(t^{2}+' + c + ')^{2}', js: 'Math.pow(x*x+' + c + ',2)', v: '4*t*(t^2+' + c + ')', a: '12*t^2+' + (4 * c), vtex: '4t(t^{2}+' + c + ')',
      vtraps: [{ expr: '2*(t^2+' + c + ')', msg: 'The chain rule: the inside $t^2+' + c + '$ also has a derivative, $2t$.' }], atraps: [{ expr: '4*t*(t^2+' + c + ')', msg: 'That is $v$. Differentiate once more.' }, { expr: '12*t^2', msg: 'Use the product rule on $4t(t^2+' + c + ')$ and keep both terms.' }],
      exv: 'for $s=(t^2+1)^2$: $v=2(t^2+1)\\cdot2t=4t(t^2+1)$.', exa: 'for $s=(t^2+1)^2$: $v=4t(t^2+1)$, so $a=12t^2+4$.' }; },
    e2: function () { return { tex: 'e^{t^{2}}', js: 'Math.exp(x*x)', v: '2*t*e^(t^2)', a: '(2+4*t^2)*e^(t^2)', vtex: '2t\\,e^{t^{2}}',
      vtraps: [{ expr: 'e^(t^2)', msg: 'The chain rule: the inside $t^2$ has a derivative, $2t$.' }], atraps: [{ expr: '2*t*e^(t^2)', msg: 'That is $v$. Differentiate once more.' }, { expr: '2*e^(t^2)', msg: 'Differentiate BOTH factors of $2t\\,e^{t^2}$: the product rule.' }],
      exv: 'for $s=e^{3t^2}$: $v=6t\\,e^{3t^2}$.', exa: 'for $s=e^{3t^2}$: $v=6t\\,e^{3t^2}$, so $a=(6+36t^2)e^{3t^2}$.' }; }
  };
  /* a polynomial position (bands 1 and 2 for accel, band 1 for vel): returns the same shape of item */
  function polyFam(r, deg) {
    var c = [INT(r, -4, 12), INT(r, 1, 9) * (r() < 0.3 ? -1 : 1), INT(r, -6, 6), INT(r, 1, 4)]; if (deg === 4) c.push(INT(r, 1, 2) * (r() < 0.5 ? -1 : 1));
    var d1 = dpoly(c), d2 = dpoly(d1), txt = function (p) { return polyIn(p, false); };
    return { tex: polyIn(c, true), js: jsPoly(c), v: txt(d1), a: txt(d2), vtex: polyIn(d1, true), vtraps: [{ expr: txt(c), msg: 'That is $s$, the position. Differentiate it.' }], atraps: [{ expr: txt(d1), msg: 'That is $v$. Differentiate once more.' }],
      exv: 'for $s=2t^3+4t$: $v=6t^2+4$.', exa: 'for $s=2t^3+4t$: $v=6t^2+4$, so $a=12t$.', c: c };
  }

  var SPEC = {
    id: '4-2-motion', course: 'calc', unit: 'Unit 4 · Contextual Applications of Differentiation', title: '4.2 Position, Velocity and Acceleration',
    selfPaced: true,
    question: 'How do position, velocity and acceleration come from one another?',
    targets: ['I can find velocity and acceleration from a position function.', 'I can say which way a particle moves from the sign of v.', 'I can tell if a particle speeds up or slows down.'],
    tabs: ['Warm-up', 'Predict', 'Explore', 'Notes', 'Build', 'Practice', 'Check'],
    exploreTarget: 'I can read velocity and acceleration off a moving particle.',
    huddleTarget: 'I can write the motion rules and use them.',
    buildTarget: 'I can find v and a and say how the particle is moving.',

    concepts: [
      { title: 'Position, velocity, acceleration', points: ['Velocity is the derivative of position.', 'Acceleration is the derivative of velocity.'], eq: 'v = s′,  a = v′ = s″' },
      { title: 'Direction', points: ['v > 0: moving in the positive direction (right).', 'v < 0: moving in the negative direction (left). v = 0: at rest for an instant.'], eq: 'sign of v = direction' },
      { title: 'Speed', points: ['Speed is how fast, with no direction.', 'It is the absolute value of velocity.'], eq: 'speed = |v|' },
      { title: 'Speeding up or slowing down', points: ['Same sign for v and a: speeding up.', 'Opposite signs: slowing down.'], eq: 'v·a > 0 speeding up,  v·a < 0 slowing down' }
    ],

    huddle: {
      defs: [
        { term: 'Velocity and acceleration', text: 'v(t) = s′(t). a(t) = [[v′(t)]], the derivative of velocity, so a(t) = s″(t).' },
        { term: 'Direction', text: 'If v > 0 the particle moves [[right]]. If v < 0 it moves [[left]]. If v = 0 it is [[at rest]].' },
        { term: 'Speed', text: 'Speed is the [[absolute value]] of velocity: speed = |v|.' },
        { term: 'Speeding up or slowing down', text: 'v and a with the [[same]] sign: speeding up. With [[opposite]] signs: slowing down.' }
      ],
      example: { prompt: 'A particle has position s(t) = t³ − 6t² + 9t. Find v and a, then describe t = 2 and t = 4.',
        steps: ['Velocity: v(t) = 3t² − 12t + [[9]]', 'Acceleration: a(t) = [[6t − 12]]', 'At t = 2: v = −3 and a = [[0]], so it moves left at steady speed for an instant.', 'At t = 4: v = 9 and a = 12, both [[positive]], so it is speeding up.'] },
      label: { title: 'Label the picture',
        html: '<svg viewBox="0 0 330 150" role="img" aria-label="A number line with a dot, a green arrow pointing right and an orange arrow pointing left, marked 1, 2 and 3"><line x1="20" y1="110" x2="310" y2="110" stroke="#7a8a99" stroke-width="2"/><circle cx="150" cy="110" r="8" fill="#142230"/><line x1="150" y1="70" x2="235" y2="70" stroke="#1c7d4a" stroke-width="4"/><polygon points="235,62 250,70 235,78" fill="#1c7d4a"/><line x1="150" y1="35" x2="100" y2="35" stroke="#c26a00" stroke-width="4"/><polygon points="100,27 85,35 100,43" fill="#c26a00"/><circle cx="150" cy="136" r="10" fill="none" stroke="#142230"/><text x="146" y="141" font-size="13">1</text><circle cx="270" cy="70" r="10" fill="none" stroke="#142230"/><text x="266" y="75" font-size="13">2</text><circle cx="70" cy="35" r="10" fill="none" stroke="#142230"/><text x="66" y="40" font-size="13">3</text></svg>',
        tags: [{ n: 1, text: 'The dot: the particle at position [[s]].' }, { n: 2, text: 'The green arrow: the [[velocity]].' }, { n: 3, text: 'The orange arrow: the [[acceleration]].' }] }
    },

    /* three easy review items from earlier lessons */
    review: [
      { id: 'R1', title: 'Review 1', prompt: 'The derivative of $3t^2-12t$ is…', options: ['6t − 12', '3t − 12', '6t', '3t² − 12'], answer: 0, why: 'Power rule: $3t^2$ gives $6t$, and $-12t$ gives $-12$.' },
      { id: 'R2', title: 'Review 2', prompt: 'The derivative of $\\sin t$ is…', options: ['cos t', '−cos t', '−sin t', 'sin t'], answer: 0, why: 'The derivative of sine is cosine.' },
      { id: 'R3', title: 'Review 3', prompt: 'A line with a negative slope is…', options: ['going down from left to right', 'going up from left to right', 'flat', 'vertical'], answer: 0, why: 'Negative slope means the line falls as you move right.' }
    ],

    predicts: [
      { id: 'P1', title: 'Position and velocity', prompt: 'A particle has position $s(t)$ meters at $t$ seconds. Its velocity is…', options: ['the derivative $s\'(t)$', 'the same as $s(t)$', 'the integral of $s(t)$', 'the second derivative $s\'\'(t)$'], answer: 0, why: 'Velocity is how fast the position changes: the derivative of position.' },
      { id: 'P2', title: 'A negative velocity', prompt: 'A particle moves on a horizontal line, with right as the positive direction. Its velocity is $-4$ meters per second. It is moving…', options: ['left', 'right', 'nowhere', 'we cannot tell'], answer: 0, why: 'Negative velocity means moving in the negative direction: left.' }
    ],
    observe: [
      { id: 'O1', prompt: 'In Station 1, at the moment the particle was at rest, the velocity reading was…', options: ['0', '1', '9', '−3'], answer: 0, why: 'At rest means not moving, so the velocity is 0.' },
      { id: 'O2', prompt: 'In Station 2, the particle slowed down whenever the green arrow (velocity) and the orange arrow (acceleration) pointed…', options: ['opposite ways', 'the same way', 'up', 'to zero'], answer: 0, why: 'Opposite signs for $v$ and $a$ means the particle slows down.' }
    ],
    exploreIds: ['X1', 'X2', 'X3', 'X4'],

    /* the mid-lesson check: after the notes, before the problems */
    mid: [
      { id: 'M1', title: 'Check 1', prompt: '$v(t)=-5$ and $a(t)=-2$ at the same moment. The particle is…', options: ['speeding up', 'slowing down', 'at rest', 'turning around at rest'], answer: 0, why: 'Both are negative, the same sign, so it is speeding up (in the negative direction).' },
      { id: 'M2', title: 'Check 2', prompt: 'Acceleration $a(t)$ is the derivative of…', options: ['the velocity', 'the position only', 'the speed only', 'nothing'], answer: 0, why: 'Acceleration is the derivative of velocity, which is the second derivative of position.' }
    ],

    skills: [
      /* vel: typed v(t) from s(t). Band 1 polynomials, band 2 sine, cosine and exponentials, band 3 products and chains. */
      { id: 'vel', title: 'Find the velocity', gen: function (b, r) {
        b = Math.min(b, 3);
        var e = b <= 1 ? polyFam(r, 3) : b === 2 ? pick(r, [FAM.sin(INT(r, 2, 6), INT(r, 2, 4)), FAM.cos(INT(r, 2, 6), INT(r, 2, 4)), FAM.exp(INT(r, 2, 6), INT(r, 2, 4))]) : pick(r, [FAM.tex(INT(r, 2, 3)), FAM.tsin(), FAM.sq(INT(r, 1, 3)), FAM.e2()]);
        return { type: 'expr', data: { js: e.js }, prompt: 'A particle moves along a line with position $s$ in meters at time $t$ seconds. Find its velocity.', label: '$s(t)=' + e.tex + '\\quad v(t)=$', answer: e.v, vars: ['t'], traps: e.vtraps,
          hints: ['Step card: velocity is the derivative of position. Differentiate with the rule the function needs.', 'First step: the answer starts with $' + e.vtex + '$.', 'Same move on another example: ' + e.exv],
          worked: '$v(t)=s\'(t)=' + e.vtex + '$.' };
      } },

      /* accel: typed a(t) from s(t), the second derivative. Same families as vel. */
      { id: 'accel', title: 'Find the acceleration', gen: function (b, r) {
        b = Math.min(b, 3);
        var e = b <= 1 ? polyFam(r, r() < 0.5 ? 3 : 4) : b === 2 ? pick(r, [FAM.sin(INT(r, 2, 6), INT(r, 2, 4)), FAM.cos(INT(r, 2, 6), INT(r, 2, 4)), FAM.exp(INT(r, 2, 6), INT(r, 2, 4)), FAM.tex(INT(r, 2, 3))]) : pick(r, [FAM.tsin(), FAM.sq(INT(r, 1, 3)), FAM.e2(), FAM.tex(INT(r, 2, 3))]);
        return { type: 'expr', data: { js: e.js }, prompt: 'A particle moves along a line with position $s$ in meters at time $t$ seconds. Find its acceleration.', label: '$s(t)=' + e.tex + '\\quad a(t)=$', answer: e.a, vars: ['t'], traps: e.atraps,
          hints: ['Step card: acceleration is the second derivative. Find $v$ first and write it in full, then differentiate $v$.', 'First step: $v(t)=' + e.vtex + '$.', 'Same move on another example: ' + e.exa],
          worked: '$v(t)=' + e.vtex + '$. Differentiating $v$ gives the acceleration, the answer above.' };
      } },

      /* dir: which way is the particle moving. Band 1 gives the velocity number, band 2 gives v(t) and a time, band 3 gives s(t) and a time. */
      { id: 'dir', title: 'Which way is it moving?', gen: function (b, r) {
        b = Math.min(b, 3);
        var OPTS = ['to the right', 'to the left', 'at rest for an instant', 'cannot tell'], v, a, c, p, ans, data, lead, hint, worked;
        if (b <= 1) { v = pick(r, [-9, -6, -4, -2, 0, 3, 5, 8]); ans = v > 0 ? 0 : v < 0 ? 1 : 2; data = { v: v };
          lead = 'A particle moves on a horizontal line, with right as the positive direction. At $t=' + INT(r, 1, 6) + '$ seconds its velocity is $' + v + '$ meters per second. Which way is it moving?';
          hint = 'Step card: the sign of the velocity gives the direction. Positive is right, negative is left, zero is at rest. First step: the velocity is ' + (v > 0 ? 'positive' : v < 0 ? 'negative' : 'zero') + '. Same move: $v=-7$ is negative, so the particle moves left.'; worked = 'The velocity is ' + v + ', so the particle is ' + OPTS[ans] + '.'; }
        else if (b === 2) { c = [INT(r, -2, 8), INT(r, -10, 4), INT(r, 1, 3)]; var roots = [], t; for (t = 0; t <= 6; t++) if (evalPoly(c, t) === 0) roots.push(t); p = r() < 0.4 && roots.length ? pick(r, roots) : INT(r, 0, 6); v = evalPoly(c, p); ans = v > 0 ? 0 : v < 0 ? 1 : 2; data = { js: jsPoly(c), a: p, kind: 'v' };
          lead = 'A particle moves on a horizontal line, with right as the positive direction. Its velocity is $v(t)=' + polyIn(c, true) + '$ meters per second. At $t=' + p + '$ which way is it moving?';
          hint = 'Step card: put the time into $v(t)$, then read the sign. First step: $v(' + p + ')=' + v + '$. Same move: if $v(t)=t-4$, then $v(2)=-2$ is negative, so it moves left.'; worked = '$v(' + p + ')=' + v + '$, so the particle is ' + OPTS[ans] + '.'; }
        else { c = [INT(r, 0, 5), INT(r, -4, 12), INT(r, -9, -2), INT(r, 1, 3)]; var rts = []; for (t = 0; t <= 6; t++) if (evalPoly(dpoly(c), t) === 0) rts.push(t); p = r() < 0.3 && rts.length ? pick(r, rts) : INT(r, 0, 6); v = evalPoly(dpoly(c), p); ans = v > 0 ? 0 : v < 0 ? 1 : 2; data = { js: jsPoly(c), a: p, kind: 's' };
          lead = 'A particle moves on a horizontal line, with right as the positive direction. Its position is $s(t)=' + polyIn(c, true) + '$ meters. At $t=' + p + '$ which way is it moving?';
          hint = 'Step card: velocity is the derivative, so (1) find $v(t)=s\'(t)$, (2) put in the time, (3) read the sign. First step: $v(t)=' + polyIn(dpoly(c), true) + '$. Same move: $s=t^2-4t$ gives $v=2t-4$, and $v(1)=-2$ means left.'; worked = '$v(t)=' + polyIn(dpoly(c), true) + '$ and $v(' + p + ')=' + v + '$, so the particle is ' + OPTS[ans] + '.'; }
        var m = mix(r, [OPTS[ans]].concat(OPTS.filter(function (_, i) { return i !== ans; })));
        data.ans = ans;
        return { type: 'choice', data: data, prompt: lead, options: m.options, answer: m.answer, hint: hint, worked: worked };
      } },

      /* speed: speeding up or slowing down, from the signs of v and a. Band 1 gives both numbers, band 2 gives v(t) and finds a, band 3 gives s(t). */
      { id: 'speed', title: 'Speeding up or slowing down?', gen: function (b, r) {
        b = Math.min(b, 3);
        var OPTS = ['speeding up', 'slowing down', 'neither: its speed is not changing at that moment'], v, a, c, p, prod, ans, data, lead, hint, worked, t;
        if (b <= 1) { v = pick(r, [-8, -5, -3, 2, 4, 7]); a = pick(r, [-6, -4, -2, 3, 5]); prod = sgn(v) * sgn(a); ans = prod > 0 ? 0 : 1; data = { v: v, acc: a };
          lead = 'At one moment a particle has velocity $v=' + v + '$ and acceleration $a=' + a + '$ (meters per second, and meters per second squared). Is it speeding up or slowing down?';
          hint = 'Step card: compare the signs of $v$ and $a$. The same sign means speeding up. Opposite signs mean slowing down. First step: $v$ is ' + (v > 0 ? 'positive' : 'negative') + ' and $a$ is ' + (a > 0 ? 'positive' : 'negative') + '. Same move: $v=-4$ and $a=-1$ have the same sign, so it speeds up.'; worked = '$v=' + v + '$ and $a=' + a + '$ have ' + (prod > 0 ? 'the same sign, so it is speeding up.' : 'opposite signs, so it is slowing down.'); }
        else if (b === 2) { c = [INT(r, -2, 8), INT(r, -10, 2), INT(r, 1, 3)]; var ok = []; for (t = 0; t <= 6; t++) if (evalPoly(c, t) !== 0) ok.push(t); p = pick(r, ok); v = evalPoly(c, p); a = evalPoly(dpoly(c), p); ans = a === 0 ? 2 : (sgn(v) * sgn(a) > 0 ? 0 : 1); data = { js: jsPoly(c), a: p, kind: 'v' };
          lead = 'A particle has velocity $v(t)=' + polyIn(c, true) + '$ meters per second. At $t=' + p + '$ is it speeding up or slowing down?';
          hint = 'Step card: you need both $v$ and $a$ at the time. $a$ is the derivative of $v$. First step: $a(t)=' + polyIn(dpoly(c), true) + '$, so $v(' + p + ')=' + v + '$ and $a(' + p + ')=' + a + '$. Same move: $v=t^2-4$ gives $a=2t$; at $t=1$, $v=-3$ and $a=2$ have opposite signs, so it slows down.'; worked = '$v(' + p + ')=' + v + '$ and $a(' + p + ')=' + a + '$. ' + (a === 0 ? 'The acceleration is 0, so the speed is not changing at that moment.' : sgn(v) * sgn(a) > 0 ? 'Same sign: speeding up.' : 'Opposite signs: slowing down.'); }
        else { c = [INT(r, 0, 5), INT(r, -4, 12), INT(r, -9, -2), INT(r, 1, 3)]; var ok2 = []; for (t = 0; t <= 6; t++) if (evalPoly(dpoly(c), t) !== 0) ok2.push(t); p = pick(r, ok2); v = evalPoly(dpoly(c), p); a = evalPoly(dpoly(dpoly(c)), p); ans = a === 0 ? 2 : (sgn(v) * sgn(a) > 0 ? 0 : 1); data = { js: jsPoly(c), a: p, kind: 's' };
          lead = 'A particle has position $s(t)=' + polyIn(c, true) + '$ meters. At $t=' + p + '$ is it speeding up or slowing down?';
          hint = 'Step card: (1) find $v=s\'$ and $a=s\'\'$, (2) put in the time, (3) compare the signs. First step: $v(t)=' + polyIn(dpoly(c), true) + '$ and $a(t)=' + polyIn(dpoly(dpoly(c)), true) + '$. Same move: $s=t^3-3t$ gives $v=3t^2-3$ and $a=6t$; at $t=2$, both are positive, so it speeds up.'; worked = '$v(' + p + ')=' + v + '$ and $a(' + p + ')=' + a + '$. ' + (a === 0 ? 'The acceleration is 0, so the speed is not changing at that moment.' : sgn(v) * sgn(a) > 0 ? 'Same sign: speeding up.' : 'Opposite signs: slowing down.'); }
        data.ans = ans;
        var m = mix(r, [OPTS[ans]].concat(OPTS.filter(function (_, i) { return i !== ans; })));
        return { type: 'choice', data: data, prompt: lead, options: m.options, answer: m.answer, hint: hint, worked: worked };
      } }
    ],

    misconceptions: [
      { say: 'Negative acceleration means the particle is slowing down.', fix: 'It depends on v. Negative a slows a particle moving right, but speeds one moving left.' },
      { say: 'Velocity and speed are the same.', fix: 'Speed is |v|. A particle moving left at 3 has velocity −3 and speed 3.' },
      { say: 'If v = 0, the particle stops for good.', fix: 'It may only be at rest for an instant, then turn around.' },
      { say: 'If v = 0, then a = 0.', fix: 'Not so. A ball at the top of its path has v = 0 but a is not 0.' },
      { say: 'a(t) = s′(t).', fix: 'v = s′ and a = v′ = s″. Acceleration takes two derivatives of position.' }
    ]
    /* no pacing: the lesson has no clock, no trim, no skip and no end mark */
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = SPEC; else (root.SPECS = root.SPECS || {})[SPEC.id] = SPEC;
})(typeof window !== 'undefined' ? window : globalThis);
