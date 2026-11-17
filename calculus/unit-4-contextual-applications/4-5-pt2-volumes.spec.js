/* SPEC (calculus 4.5 part 2): related rates with volumes (cylinder, cone) and shadows (similar triangles). Visual tutorial, no huddle.
   Key idea: when two changing letters appear, use similar triangles to write one in terms of the other BEFORE differentiating.
   Test data (tests/unit/related-rates-volumes.test.js recomputes each answer by stepping time):
     similar  data.R, data.H, data.h.        relate  data.R, data.H, data.right.
     cone     data.kind ('cone'|'cyl'|'conefill'), R, H, h, dV or dh.      shadow  data.H, data.h, data.v, data.mode ('shadow'|'tip'). */
(function (root) {
  'use strict';
  var INT = function (r, a, b) { return a + Math.floor(r() * (b - a + 1)); };
  var pick = function (r, arr) { return arr[Math.floor(r() * arr.length)]; };
  var shuffle = function (r, arr) { var a = arr.slice(), i, j, t; for (i = a.length - 1; i > 0; i--) { j = Math.floor(r() * (i + 1)); t = a[i]; a[i] = a[j]; a[j] = t; } return a; };
  function mix(r, opts, msgs) { var order = shuffle(r, opts.map(function (_, i) { return i; })); return { options: order.map(function (i) { return opts[i]; }), answer: order.indexOf(0), why: order.map(function (i) { return msgs && msgs[i] ? msgs[i] : ''; }) }; }
  var round2 = function (x) { return Math.round(x * 100) / 100; };
  var gcd = function (a, b) { return b ? gcd(b, a % b) : a; };
  var frac = function (n, d) { var g = gcd(n, d); n /= g; d /= g; return d === 1 ? String(n) : '\\tfrac{' + n + '}{' + d + '}'; };
  var CONES = [[4, 8], [3, 6], [2, 6], [3, 9], [5, 10], [3, 12], [6, 12]];

  var SPEC = {
    id: '4-5-pt2-volumes', course: 'calc', unit: 'Unit 4 · Contextual Applications of Differentiation', title: '4.5 Part 2 · Solving Related Rates: Volumes, Cones and Shadows',
    selfPaced: true,
    question: 'What do I do when the link equation has two changing letters I need to reduce to one?',
    targets: ['I can use similar triangles to write one changing letter in terms of another.', 'I can solve a cone or cylinder volume problem for the wanted rate.', 'I can solve a shadow problem with similar triangles.'],
    tabs: ['Warm-up', 'Predict', 'Concept (pictures)', 'I do (watch)', 'You do', 'Practice', 'Check', 'Wrap-up'],
    buildTarget: 'I can reduce a link to one changing letter, then solve for the wanted rate.',
    concepts: [
      { title: 'Similar triangles', points: ['Matching sides of similar triangles have equal ratios.', 'For a cone tank, $r/h$ never changes.'], eq: 'r/h = R/H' },
      { title: 'Reduce to one letter', points: ['Use the ratio to write $r$ in terms of $h$.', 'Do this BEFORE you differentiate.'], eq: 'V(h)' },
      { title: 'A relationship vs a moment', points: ['$r=h/2$ is true all the time, so use it early.', '$r=2$ is true for one moment, so wait.'], eq: 'always vs now' }
    ],
    review: [
      { id: 'R1', title: 'Review 1', prompt: 'A cone has radius 4 and height 8. When it is filled to depth 6, the surface radius is…', options: ['3', '4', '2', '6'], answer: 0, why: 'The ratio $r/h=4/8=1/2$ never changes, so $r=6/2=3$.' },
      { id: 'R2', title: 'Review 2', prompt: '$\\dfrac{d}{dt}\\bigl(h^3\\bigr)$ equals…', options: ['$3h^2\\dfrac{dh}{dt}$', '$3h^2$', '$h^3\\dfrac{dh}{dt}$', '$3h\\dfrac{dh}{dt}$'], answer: 0, why: 'Power rule, then the chain factor.' },
      { id: 'R3', title: 'Review 3', prompt: 'A rate of $-4$ ft³/min for the volume of water in a tank means the water is…', options: ['draining', 'filling', 'standing still', 'frozen'], answer: 0, why: 'Negative means the volume is shrinking.' }
    ],
    predicts: [
      { id: 'P1', title: 'The cone tank', prompt: 'Water is poured into a cone-shaped funnel (point down) at a steady rate. The water level rises…', options: ['fast at first, then slower and slower', 'at the same steady speed', 'slowly at first, then faster', 'not at all'], answer: 0, why: 'The cone gets wider at the top, so the same volume has to cover a wider circle and raises the level less each time.' },
      { id: 'P2', title: 'The shadow', prompt: 'A person walks away from a street lamp at a steady speed. Her shadow gets longer at…', options: ['a steady speed that is slower than hers', 'a steady speed faster than hers', 'a speed that keeps increasing', 'a speed that keeps decreasing'], answer: 0, why: 'The shadow grows in proportion to how far she is, so its speed is steady. It is slower than hers because the lamp is taller than she is.' }
    ],

    tutorial: {
      moves: ['Draw and name', 'List what you know and want', 'Link with one equation', 'Differentiate in t', 'Plug in last'],
      concept: { title: 'Two changing letters, one relationship', target: 'I can write one changing letter in terms of another with a similar triangle.', frames: [
        { head: 'The cone keeps its shape', show: 'cone', st: { R: 4, H: 8, h: 4 }, guide: 'A cone-shaped tank, point down. The blue-green $r$ is the radius of the water surface. The red $h$ is the water depth. Slide $h$.',
          say: 'As $h$ grows, $r$ grows with it. The ratio $r/h$ never changes: it is $4/8=\\dfrac12$.',
          ask: { type: 'num', prompt: 'The water is $h=6$ ft deep. What is the surface radius $r$?', answer: 3, unit: 'ft', tol: 0, abs: 0.001, hint: '$r=\\dfrac12h$.', why: '$r=\\dfrac12(6)=3$ ft. The readout under the picture shows the same.' } },
        { head: 'Two changing letters is too many', show: 'cone', st: { R: 4, H: 8, h: 4, v: true }, guide: 'The readout also shows the volume $V=\\tfrac13\\pi r^2h$.',
          say: 'Both $r$ and $h$ change, so $V=\\tfrac13\\pi r^2h$ would need a product rule. We can make it simpler.',
          ask: { type: 'choice', prompt: 'We know $r=\\dfrac h2$. Write $V=\\tfrac13\\pi r^2h$ with only $h$.', options: ['$V=\\dfrac{\\pi}{12}h^3$', '$V=\\dfrac{\\pi}{6}h^3$', '$V=\\dfrac{\\pi}{3}h^3$', '$V=\\dfrac{\\pi}{12}h^2$'], answer: 0, why: '$\\tfrac13\\pi\\left(\\dfrac h2\\right)^2h=\\tfrac13\\pi\\cdot\\dfrac{h^2}{4}\\cdot h=\\dfrac{\\pi}{12}h^3$.', traps: { 1: 'The radius $\\frac h2$ must be squared, so the 2 becomes 4.', 2: 'The $\\frac12$ was dropped.', 3: 'The $h$ in the formula gives a third power: $h^2\\cdot h$.' } } },
        { head: 'Now it is one letter', show: 'cone', st: { R: 4, H: 8, h: 4, v: true }, guide: 'With $V$ written in $h$ only, the rate of $V$ needs only the rate of $h$.',
          say: 'From $V=\\dfrac{\\pi}{12}h^3$ we get $\\dfrac{dV}{dt}=\\dfrac{\\pi}{4}h^2\\dfrac{dh}{dt}$.',
          ask: { type: 'num', prompt: 'With $h=4$ and $\\dfrac{dh}{dt}=1$, find $\\dfrac{dV}{dt}=\\dfrac{\\pi}{4}h^2\\dfrac{dh}{dt}$. Give it to 2 decimal places.', answer: 12.57, unit: 'ft³/min', tol: 0.005, hint: '$\\dfrac{\\pi}{4}\\times16\\times1=4\\pi$.', why: '$4\\pi\\approx12.57$.' } },
        { head: 'A relationship vs a moment', show: 'cone', st: { R: 4, H: 8, h: 4, fixed: true }, guide: 'A frozen moment: $h=4$ and $r=2$.',
          say: '$r=\\dfrac h2$ is true at all times. $h=4$ and $r=2$ are true only now.',
          ask: { type: 'choice', prompt: 'Before differentiating, which may we put into $V=\\tfrac13\\pi r^2h$?', options: ['$r=\\dfrac h2$', '$r=2$', '$h=4$', 'Both $r=2$ and $h=4$'], answer: 0, why: 'A relationship that is always true can go in early. A number for one moment must wait.', traps: { 1: 'That is true only now. Putting it in makes $r$ a constant with no rate.', 2: 'That is true only now.', 3: 'Both are true only at one moment.' } } },
        { head: 'The cylinder needs no help', show: 'cylinder', st: { flow: 'in', h: 4, R: 3 }, guide: 'A cylinder tank. The radius never changes.',
          say: 'In a cylinder the radius is fixed, so there is only one changing letter: $V=\\pi R^2h$.',
          ask: { type: 'choice', prompt: 'For a cylinder tank, we need a similar-triangle step because…', options: ['we do not: only $h$ changes', 'both $R$ and $h$ change', 'the volume is a cone', 'the radius is the same as $h$'], answer: 0, why: 'A fixed radius is a number, so there is no second changing letter to remove.' } },
        { head: 'A lamp and a shadow', show: 'shadow', st: { H: 15, h: 6, x: 6 }, guide: 'A 15 ft lamp. A 6 ft person stands $x$ from it. The red line from the lamp to the ground touches the top of her head. $s$ is the shadow. Slide $x$.',
          say: 'The big triangle (lamp to the tip of the shadow) and the small triangle (her to the tip) are similar.',
          ask: { type: 'choice', prompt: 'Which proportion matches the two triangles?', options: ['$\\dfrac{6}{s}=\\dfrac{15}{x+s}$', '$\\dfrac{6}{15}=\\dfrac{x}{s}$', '$\\dfrac{6}{x}=\\dfrac{15}{s}$', '$\\dfrac{6}{s}=\\dfrac{15}{x}$'], answer: 0, why: 'Height over base is the same for both: the small triangle has base $s$, the big one has base $x+s$.', traps: { 1: 'Match each height with its own base. The small base is $s$.', 2: 'The base of the big triangle is $x+s$, not $s$.', 3: 'The big triangle’s base is $x+s$.' } } },
        { head: 'Solve for the shadow', show: 'shadow', st: { H: 15, h: 6, x: 9 }, guide: 'Slide $x$ to 9. Compare the shadow to $x$.',
          say: 'Cross-multiply $\\dfrac{6}{s}=\\dfrac{15}{x+s}$: $15s=6x+6s$, so $9s=6x$ and $s=\\dfrac23x$.',
          ask: { type: 'num', prompt: 'Using $s=\\dfrac23x$, find $s$ when $x=9$.', answer: 6, unit: 'ft', tol: 0, abs: 0.001, hint: '$\\dfrac23\\times9$.', why: '$\\dfrac23(9)=6$ ft. The readout shows the same.' } },
        { head: 'The rate of the shadow', show: 'shadow', st: { H: 15, h: 6, x: 9 }, guide: 'The shadow grows in proportion to $x$.',
          say: 'Since $s=\\dfrac23x$, we get $\\dfrac{ds}{dt}=\\dfrac23\\dfrac{dx}{dt}$. The shadow grows slower than she walks.',
          ask: { type: 'num', prompt: 'She walks at $\\dfrac{dx}{dt}=6$ ft/s. Find $\\dfrac{ds}{dt}$.', answer: 4, unit: 'ft/s', tol: 0, abs: 0.001, hint: '$\\dfrac23\\times6$.', why: '$\\dfrac23(6)=4$ ft/s.' } }
      ] },
      ido: { target: 'I can watch a cone-tank problem and a shadow problem solved in five moves and spot the common slip.',
        problem: 'Water is pumped into a cone-shaped tank (point down) at 6 ft³ per minute. The tank is 8 ft tall and 4 ft across the top radius. How fast is the water level rising when the water is 4 ft deep?',
        frames: [
          { head: 'Name and list', move: 'Moves 1 and 2 · Name and list', show: 'cone', st: { R: 4, H: 8, h: 4, v: true }, guide: 'The tank is 8 ft tall with top radius 4 ft. The water has radius $r$ and depth $h$.',
            say: 'Water is going in, so $\\dfrac{dV}{dt}$ is positive. We want the level’s speed $\\dfrac{dh}{dt}$.', work: ['Given: $\\dfrac{dV}{dt}=6$ ft³/min', 'Want: $\\dfrac{dh}{dt}$ when $h=4$ ft'],
            ask: { type: 'choice', prompt: 'Which rate do we WANT?', options: ['$\\dfrac{dh}{dt}$', '$\\dfrac{dV}{dt}$', '$\\dfrac{dr}{dt}$', '$h$'], answer: 0, why: 'We are asked how fast the level rises, which is the rate of $h$.', traps: { 1: 'That is given: 6 ft³/min.' } } },
          { head: 'Link, then reduce to one letter', move: 'Move 3 · Link with one equation', show: 'cone', st: { R: 4, H: 8, h: 4 }, guide: 'The ratio $r/h=4/8$ holds for the water at all times.',
            say: 'Start with $V=\\tfrac13\\pi r^2h$. Use $r=\\dfrac h2$ to write it with $h$ only.', work: ['Link: $V=\\tfrac13\\pi r^2h$', 'Similar triangles: $r=\\dfrac h2$', '$V=\\dfrac{\\pi}{12}h^3$'],
            ask: { type: 'choice', prompt: 'Why can we use $r=\\dfrac h2$ BEFORE differentiating?', options: ['It is true at all times, not just one moment.', 'Because $h=4$ right now.', 'Because we like it.', 'Because $r$ is fixed.'], answer: 0, why: 'The ratio of the tank never changes, so the relationship holds at all times.', traps: { 3: '$r$ changes as the water rises. What is fixed is the ratio $\\dfrac rh$.' } } },
          { head: 'Differentiate', move: 'Move 4 · Differentiate in t', show: 'chain', st: { names: ['t', 'h', 'V'], d1: 'dh/dt', d2: 'dV/dh', d3: 'dV/dt', reveal: 3 }, guide: 'Time leads to $h$, and $h$ leads to $V$. The rates multiply.',
            say: 'Differentiate $V=\\dfrac{\\pi}{12}h^3$ in $t$. The 3 comes down, and $\\dfrac{dh}{dt}$ rides along.', work: ['$\\dfrac{dV}{dt}=\\dfrac{\\pi}{12}\\cdot3h^2\\dfrac{dh}{dt}=\\dfrac{\\pi}{4}h^2\\dfrac{dh}{dt}$'],
            ask: { type: 'choice', prompt: 'Which is $\\dfrac{d}{dt}\\left(\\dfrac{\\pi}{12}h^3\\right)$?', options: ['$\\dfrac{\\pi}{4}h^2\\dfrac{dh}{dt}$', '$\\dfrac{\\pi}{4}h^2$', '$\\dfrac{\\pi}{12}h^2\\dfrac{dh}{dt}$', '$\\dfrac{\\pi}{36}h^4$'], answer: 0, why: '$\\dfrac{\\pi}{12}\\times3=\\dfrac{\\pi}{4}$, and the factor $\\dfrac{dh}{dt}$ rides along.', traps: { 1: 'The chain factor $\\dfrac{dh}{dt}$ is missing.', 2: 'The 3 from the power must multiply the coefficient.', 3: 'That is an antiderivative, not a derivative.' } } },
          { head: 'Plug in last', move: 'Move 5 · Plug in last', show: 'cone', st: { R: 4, H: 8, h: 4, fixed: true }, guide: 'The cone at the moment we are asked about: the water is $h=4$ ft deep.',
            say: 'Put in $\\dfrac{dV}{dt}=6$ and $h=4$. Then solve for $\\dfrac{dh}{dt}$.', work: ['$6=\\dfrac{\\pi}{4}(16)\\dfrac{dh}{dt}$', '$6=4\\pi\\dfrac{dh}{dt}$', '$\\dfrac{dh}{dt}=\\dfrac{6}{4\\pi}\\approx0.48$ ft/min'],
            ask: { type: 'num', prompt: 'Solve $6=4\\pi\\dfrac{dh}{dt}$. Give it to 2 decimal places.', answer: 0.48, unit: 'ft/min', tol: 0.005, hint: 'Divide 6 by $4\\pi\\approx12.57$.', why: '$6/12.57\\approx0.48$ ft/min. Positive: the level is rising.' } },
          { head: 'The common slip', slip: true, show: 'cone', st: { R: 4, H: 8, h: 4, fixed: true }, guide: 'At this moment $r=2$ and $h=4$, but the tank is still filling.',
            say: 'Slip: putting $r=2$ into $V=\\tfrac13\\pi r^2h$ first. That makes $r$ a fixed number, so $\\dfrac{dr}{dt}$ is lost and the answer is wrong.', work: ['Wrong: $V=\\tfrac13\\pi(2)^2h=\\tfrac{4\\pi}{3}h$, so $6=\\tfrac{4\\pi}{3}\\dfrac{dh}{dt}$', 'That gives $\\dfrac{dh}{dt}\\approx1.43$. Too big.'],
            ask: { type: 'choice', prompt: 'Why is 1.43 wrong?', options: ['The radius grows as the water rises, but this made it fixed at 2.', 'The volume is not a cone.', 'The pump is too slow.', 'It is right: the radius is 2.'], answer: 0, why: 'The radius changes with $h$. Use the relationship $r=\\dfrac h2$ early, and the moment’s numbers last.', traps: { 3: 'The radius is 2 only at this moment. Fixing it removes its change.' } } },
          { head: 'Problem 2: a shadow', move: 'Moves 1 to 3 · Name, list, link', workClear: true, show: 'shadow', st: { H: 15, h: 6, x: 6 }, guide: 'A 15 ft lamp. A 6 ft person is $x$ from it. $s$ is her shadow.',
            problem: 'A 6 ft person walks away from a 15 ft lamp at 5 ft/s. How fast is her shadow growing?',
            say: 'We are given $\\dfrac{dx}{dt}=5$ and want $\\dfrac{ds}{dt}$, and similar triangles link $x$ and $s$.', work: ['Given: $\\dfrac{dx}{dt}=5$ ft/s', 'Want: $\\dfrac{ds}{dt}$', 'Link: $\\dfrac{6}{s}=\\dfrac{15}{x+s}$'],
            ask: { type: 'choice', prompt: 'The two triangles are similar. Why?', options: ['They share the lamp’s angle and each has a right angle.', 'They have the same size.', 'They have the same area.', 'The person is the same height as the lamp.'], answer: 0, why: 'Two matching angles make triangles similar, so matching sides have equal ratios.' } },
          { head: 'Solve for s, then differentiate', move: 'Moves 3 and 4', show: 'shadow', st: { H: 15, h: 6, x: 9 }, guide: 'The shadow is proportional to $x$.',
            say: 'Cross-multiply: $15s=6x+6s$, so $s=\\dfrac23x$. Then $\\dfrac{ds}{dt}=\\dfrac23\\dfrac{dx}{dt}$.', work: ['$15s=6(x+s)$, so $9s=6x$', '$s=\\dfrac23x$', '$\\dfrac{ds}{dt}=\\dfrac23\\dfrac{dx}{dt}$'],
            ask: { type: 'choice', prompt: 'Why is the answer the same at every moment?', options: ['$\\dfrac{ds}{dt}=\\dfrac23\\dfrac{dx}{dt}$ has no $x$ or $s$ in it.', 'Because the lamp is tall.', 'Because she walks in a straight line.', 'It is not the same.'], answer: 0, why: 'There is no moment-dependent letter in the rate, so no plugging in is needed.' } },
          { head: 'Plug in', move: 'Move 5 · Plug in last', show: 'shadow', st: { H: 15, h: 6, x: 9 }, guide: 'Her speed is 5 ft/s.',
            say: 'Put in $\\dfrac{dx}{dt}=5$.', work: ['$\\dfrac{ds}{dt}=\\dfrac23(5)=\\dfrac{10}{3}\\approx3.33$ ft/s'],
            ask: { type: 'num', prompt: 'Find $\\dfrac{ds}{dt}=\\dfrac23\\cdot5$. Give it to 2 decimal places.', answer: 3.33, unit: 'ft/s', tol: 0.005, hint: '$\\dfrac23\\times5=\\dfrac{10}{3}$.', why: '$10/3\\approx3.33$ ft/s. It is slower than her 5 ft/s.' } }
        ] },
      summary: ['Similar triangles give a relationship that is true at all times, like $r=\\dfrac h2$. Use it before differentiating.', 'A cylinder has a fixed radius, so only $h$ changes.', 'A number true for one moment (like $h=4$) waits until the last move.', 'For a shadow, the rate is the same at every moment: $\\dfrac{ds}{dt}=\\dfrac{h}{H-h}\\dfrac{dx}{dt}$.']
    },

    skills: [
      { id: 'similar', title: 'Use similar triangles', gen: function (b, r) {
        b = Math.min(b, 3);
        var C = pick(r, b === 1 ? [[4, 8], [3, 6]] : CONES), R = C[0], H = C[1], h = b === 1 ? INT(r, 1, 4) * 2 : (b === 2 ? INT(r, 2, H - 1) : H * INT(r, 3, 9) / 10), ans = round2(R * h / H);
        if (b === 3) { h = round2(h); ans = round2(R * h / H); }
        return { type: 'num', tol: 0.005, data: { R: R, H: H, h: h }, prompt: 'A cone-shaped tank (point down) is ' + H + ' ft tall and ' + R + ' ft in radius at the top. When the water is ' + h + ' ft deep, what is the radius of the water surface? Give it to 2 decimal places.', answer: ans, unit: 'ft',
          hint: 'Step card: (1) the ratio $r/h$ equals $R/H=' + R + '/' + H + '$, (2) write $r=\\dfrac{' + R + '}{' + H + '}h$, (3) put in $h=' + h + '$. First step: the ratio is ' + round2(R / H) + '. Same move: a tank 6 tall and 3 wide gives $r=\\dfrac12h$.',
          worked: '$r=\\dfrac{' + R + '}{' + H + '}(' + h + ')=' + ans + '$ ft.' };
      } },

      { id: 'relate', title: 'Write V in one letter', gen: function (b, r) {
        b = Math.min(b, 3);
        var C = pick(r, b === 1 ? [[4, 8], [3, 6]] : (b === 2 ? [[3, 9], [2, 6], [5, 10]] : [[3, 12], [6, 12], [3, 4]])), R = C[0], H = C[1], num = R * R, den = 3 * H * H, g = gcd(num, den), right = '$V=\\dfrac{' + (num / g) + '\\pi}{' + (den / g) + '}h^3$', fix = function (n, d) { var gg = gcd(n, d); return '$V=\\dfrac{' + (n / gg) + '\\pi}{' + (d / gg) + '}h^3$'; };
        var wrong1 = fix(R, 3 * H), wrong2 = fix(R * R, H * H), wrong3 = fix(R * R * 3, H * H), opts = [right], msgs = [''];
        [[wrong1, 'The ratio $\\dfrac RH$ must be squared, because $r$ is squared in the volume.'], [wrong2, 'The $\\tfrac13$ from the cone formula is missing.'], [wrong3, 'The $\\tfrac13$ is multiplied the wrong way. It divides.']].forEach(function (w) { if (opts.indexOf(w[0]) < 0) { opts.push(w[0]); msgs.push(w[1]); } });
        while (opts.length < 4) { var extra = '$V=\\dfrac{' + (num / g + opts.length) + '\\pi}{' + (den / g) + '}h^3$'; opts.push(extra); msgs.push('Check the coefficient: square the ratio and multiply by $\\tfrac13$.'); }
        var mx = mix(r, opts, msgs);
        return { type: 'choice', data: { R: R, H: H, right: mx.answer }, prompt: 'A cone-shaped tank (point down) is ' + H + ' ft tall and ' + R + ' ft in radius at the top. Water of depth $h$ has radius $r$ and volume $V=\\tfrac13\\pi r^2h$. Which line writes $V$ with $h$ only?', options: mx.options, answer: mx.answer, why: mx.why,
          hint: 'Step card: (1) find the ratio $r=\\dfrac{' + R + '}{' + H + '}h$, (2) put it in for $r$, (3) square the ratio and multiply by $\\tfrac13$. First step: write $r$ in terms of $h$. Same move: $r=\\dfrac h2$ gives $V=\\dfrac{\\pi}{12}h^3$.',
          worked: '$r=\\dfrac{' + R + '}{' + H + '}h$. Then $V=\\tfrac13\\pi\\left(\\dfrac{' + R + '}{' + H + '}h\\right)^2h=\\dfrac{' + (num / g) + '\\pi}{' + (den / g) + '}h^3$.' };
      } },

      { id: 'cone', title: 'Solve a volume problem', gen: function (b, r) {
        b = Math.min(b, 3);
        if (b === 1 && r() < 0.5) { var Rc = INT(r, 2, 5), hc = INT(r, 3, 9), dv = INT(r, 4, 20), ansc = round2(dv / (Math.PI * Rc * Rc));
          return { type: 'num', tol: 0.005, data: { kind: 'cyl', R: Rc, h: hc, dV: dv }, prompt: 'Water is pumped into a cylinder tank of radius ' + Rc + ' ft at ' + dv + ' ft³/min. How fast is the depth rising? Give $\\dfrac{dh}{dt}$ to 2 decimal places.', answer: ansc, unit: 'ft/min',
            hint: 'Step card: (1) the radius is fixed, so $V=\\pi R^2h$ gives $\\dfrac{dV}{dt}=\\pi R^2\\dfrac{dh}{dt}$, (2) put in $R=' + Rc + '$ and $\\dfrac{dV}{dt}=' + dv + '$, (3) divide. First step: $\\pi R^2=' + round2(Math.PI * Rc * Rc) + '$. Same move: $R=1$ and $\\dfrac{dV}{dt}=\\pi$ gives 1.', worked: '$' + dv + '=\\pi(' + Rc + ')^2\\dfrac{dh}{dt}$, so $\\dfrac{dh}{dt}=' + ansc + '$ ft/min.' }; }
        var C = pick(r, b === 1 ? [[4, 8], [3, 6]] : CONES), R = C[0], H = C[1], h = INT(r, 2, H - 1), dV = INT(r, 2, 12), sign = 1, ans;
        if (b === 3) { if (r() < 0.5) { sign = -1; dV = INT(r, 2, 12); ans = round2(-dV * H * H / (Math.PI * R * R * h * h));
            return { type: 'num', tol: 0.005, data: { kind: 'cone', R: R, H: H, h: h, dV: -dV }, prompt: 'Water drains from a cone-shaped tank (point down, ' + H + ' ft tall, top radius ' + R + ' ft) at ' + dV + ' ft³/min. How fast is the depth changing when the water is ' + h + ' ft deep? Give $\\dfrac{dh}{dt}$ to 2 decimal places.', answer: ans, unit: 'ft/min',
              hint: 'Step card: (1) draining means $\\dfrac{dV}{dt}=-' + dV + '$, (2) $r=\\dfrac{' + R + '}{' + H + '}h$ makes $V=\\dfrac{' + R * R + '\\pi}{' + 3 * H * H + '}h^3$, so $\\dfrac{dV}{dt}=\\dfrac{' + R * R + '\\pi}{' + H * H + '}h^2\\dfrac{dh}{dt}$, (3) put in $h=' + h + '$ and solve. First step: write $\\dfrac{dV}{dt}=-' + dV + '$. Same move: $R=H$ gives $\\dfrac{dV}{dt}=\\pi h^2\\dfrac{dh}{dt}$.',
              worked: '$-' + dV + '=\\dfrac{' + R * R + '\\pi}{' + H * H + '}(' + h + ')^2\\dfrac{dh}{dt}$, so $\\dfrac{dh}{dt}=' + ans + '$ ft/min. Negative: the level falls.' }; }
          var dh = round2(INT(r, 1, 5) / 10), ansV = round2(Math.PI * R * R * h * h * dh / (H * H));
          return { type: 'num', tol: 0.005, data: { kind: 'conefill', R: R, H: H, h: h, dh: dh }, prompt: 'A cone-shaped tank (point down, ' + H + ' ft tall, top radius ' + R + ' ft) is filling. The depth rises ' + dh + ' ft/min when the water is ' + h + ' ft deep. How fast is the volume growing? Give $\\dfrac{dV}{dt}$ to 2 decimal places.', answer: ansV, unit: 'ft³/min',
            hint: 'Step card: (1) $r=\\dfrac{' + R + '}{' + H + '}h$ makes $\\dfrac{dV}{dt}=\\dfrac{' + R * R + '\\pi}{' + H * H + '}h^2\\dfrac{dh}{dt}$, (2) put in $h=' + h + '$ and $\\dfrac{dh}{dt}=' + dh + '$, (3) multiply. First step: $h^2=' + h * h + '$. Same move: $\\dfrac{\\pi}{4}h^2\\dfrac{dh}{dt}$ with $h=2$, $\\dfrac{dh}{dt}=1$ gives $\\pi$.', worked: '$\\dfrac{dV}{dt}=\\dfrac{' + R * R + '\\pi}{' + H * H + '}(' + h + ')^2(' + dh + ')=' + ansV + '$ ft³/min.' }; }
        ans = round2(dV * H * H / (Math.PI * R * R * h * h));
        return { type: 'num', tol: 0.005, data: { kind: 'cone', R: R, H: H, h: h, dV: dV }, prompt: 'Water is pumped into a cone-shaped tank (point down, ' + H + ' ft tall, top radius ' + R + ' ft) at ' + dV + ' ft³/min. How fast is the depth rising when the water is ' + h + ' ft deep? Give $\\dfrac{dh}{dt}$ to 2 decimal places.', answer: ans, unit: 'ft/min',
          hint: 'Step card: (1) $r=\\dfrac{' + R + '}{' + H + '}h$ makes $V=\\dfrac{' + R * R + '\\pi}{' + 3 * H * H + '}h^3$, (2) differentiate: $\\dfrac{dV}{dt}=\\dfrac{' + R * R + '\\pi}{' + H * H + '}h^2\\dfrac{dh}{dt}$, (3) put in $h=' + h + '$ and $\\dfrac{dV}{dt}=' + dV + '$ and solve. First step: $h^2=' + h * h + '$. Same move: $\\dfrac{\\pi}{4}h^2\\dfrac{dh}{dt}=6$ with $h=4$ gives $0.48$.',
          worked: '$' + dV + '=\\dfrac{' + R * R + '\\pi}{' + H * H + '}(' + h + ')^2\\dfrac{dh}{dt}$, so $\\dfrac{dh}{dt}=' + ans + '$ ft/min.' };
      } },

      { id: 'shadow', title: 'Solve a shadow problem', gen: function (b, r) {
        b = Math.min(b, 3);
        var P = pick(r, b === 1 ? [[12, 4], [15, 5], [18, 6]] : [[10, 4], [15, 6], [20, 5], [12, 3], [18, 9]]), H = P[0], h = P[1], v = INT(r, 2, 6), tip = b === 3, ans = round2((tip ? H : h) * v / (H - h));
        return { type: 'num', tol: 0.005, data: { H: H, h: h, v: v, mode: tip ? 'tip' : 'shadow' }, prompt: 'A ' + h + ' ft person walks away from a ' + H + ' ft lamp at ' + v + ' ft/s. How fast is ' + (tip ? 'the TIP of her shadow moving along the ground (measured from the lamp)' : 'the LENGTH of her shadow growing') + '? Give it to 2 decimal places.', answer: ans, unit: 'ft/s',
          hint: 'Step card: (1) similar triangles: $\\dfrac{' + h + '}{s}=\\dfrac{' + H + '}{x+s}$, (2) solve: $s=\\dfrac{' + h + '}{' + (H - h) + '}x$, (3) ' + (tip ? 'the tip is at $x+s=\\dfrac{' + H + '}{' + (H - h) + '}x$, so multiply the speed by $\\dfrac{' + H + '}{' + (H - h) + '}$' : 'multiply the speed by $\\dfrac{' + h + '}{' + (H - h) + '}$') + '. First step: the ratio is ' + frac(tip ? H : h, H - h) + '. Same move: $H=15$, $h=6$ gives $s=\\dfrac23x$.',
          worked: (tip ? 'The tip is at $x+s=\\dfrac{' + H + '}{' + (H - h) + '}x$, so its speed is $\\dfrac{' + H + '}{' + (H - h) + '}(' + v + ')=' + ans + '$ ft/s.' : '$s=\\dfrac{' + h + '}{' + (H - h) + '}x$, so $\\dfrac{ds}{dt}=\\dfrac{' + h + '}{' + (H - h) + '}(' + v + ')=' + ans + '$ ft/s.') };
      } }
    ],

    misconceptions: [
      { say: 'Put r = 2 into the cone volume first.', fix: 'r changes as the water rises. Use r = h/2 (always true) early, and r = 2 (true now) last.' },
      { say: 'Two changing letters in V = ⅓πr²h: differentiate and leave both.', fix: 'Use similar triangles to write r in terms of h first.' },
      { say: 'The shadow grows at the same speed as the person.', fix: 'The shadow’s rate is h/(H−h) times her speed.' },
      { say: 'Mixing up which side of the similar triangles goes where.', fix: 'Height over base for both: 6/s = 15/(x+s).' },
      { say: 'The cylinder needs similar triangles.', fix: 'A cylinder’s radius is fixed, so only h changes.' }
    ]
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = SPEC; else (root.SPECS = root.SPECS || {})[SPEC.id] = SPEC;
})(typeof window !== 'undefined' ? window : globalThis);
