/* SPEC (calculus 4.4 part 2): visual-tutorial lesson, no huddle. Moves 4 and 5 of related rates: differentiate the link in t, then plug in the moment.
   Test data (tests/unit/related-rates-differentiate.test.js recomputes every answer by a different route):
     dstep  data.link (key into the test's own table) and data.right (index of the one true line).
     solve  data.kind, plus the numbers; the test steps the quantities a tiny bit in time and measures the rate.
     read   data.val (signed rate), data.dir; the test rebuilds the sentence.
     fixed  data.link and data.right. */
(function (root) {
  'use strict';
  var INT = function (r, a, b) { return a + Math.floor(r() * (b - a + 1)); };
  var pick = function (r, arr) { return arr[Math.floor(r() * arr.length)]; };
  var shuffle = function (r, arr) { var a = arr.slice(), i, j, t; for (i = a.length - 1; i > 0; i--) { j = Math.floor(r() * (i + 1)); t = a[i]; a[i] = a[j]; a[j] = t; } return a; };
  function mix(r, opts, msgs) { var order = shuffle(r, opts.map(function (_, i) { return i; })); return { options: order.map(function (i) { return opts[i]; }), answer: order.indexOf(0), why: order.map(function (i) { return msgs && msgs[i] ? msgs[i] : ''; }) }; }
  var round2 = function (x) { return Math.round(x * 100) / 100; };
  var F = function (a, b) { return '\\dfrac{d' + a + '}{d' + b + '}'; };
  var DROP = 'The chain factor is missing. Every changing letter brings its own rate with it.';

  /* each link: what we differentiate, the true line, and three wrong ones with a message each */
  var DLINK = [
    { b: 1, key: 'circle', link: '$A=\\pi r^2$', right: '$' + F('A', 't') + '=2\\pi r\\,' + F('r', 't') + '$', wrong: [['$' + F('A', 't') + '=2\\pi r$', DROP], ['$' + F('A', 't') + '=\\pi r^2\\,' + F('r', 't') + '$', 'The power rule was skipped. $r^2$ becomes $2r$.'], ['$' + F('A', 't') + '=2\\pi\\,' + F('r', 't') + '$', 'The $r$ was lost. The power rule gives $2r$, not $2$.']] },
    { b: 1, key: 'cube', link: '$V=s^3$', right: '$' + F('V', 't') + '=3s^2\\,' + F('s', 't') + '$', wrong: [['$' + F('V', 't') + '=3s^2$', DROP], ['$' + F('V', 't') + '=3s\\,' + F('s', 't') + '$', 'The power drops by one: $s^3$ becomes $3s^2$.'], ['$' + F('V', 't') + '=s^3\\,' + F('s', 't') + '$', 'The power rule was skipped.']] },
    { b: 2, key: 'sphere', link: '$V=\\tfrac43\\pi r^3$', right: '$' + F('V', 't') + '=4\\pi r^2\\,' + F('r', 't') + '$', wrong: [['$' + F('V', 't') + '=4\\pi r^2$', DROP], ['$' + F('V', 't') + '=\\tfrac43\\pi r^2\\,' + F('r', 't') + '$', 'The 3 from the power must multiply the $\\tfrac43$.'], ['$' + F('V', 't') + '=4\\pi r\\,' + F('r', 't') + '$', 'The power drops by one only: $r^3$ becomes $3r^2$.']] },
    { b: 2, key: 'pyth', link: '$x^2+y^2=z^2$', right: '$2x\\,' + F('x', 't') + '+2y\\,' + F('y', 't') + '=2z\\,' + F('z', 't') + '$', wrong: [['$2x+2y=2z$', DROP], ['$2x\\,' + F('x', 't') + '+2y\\,' + F('y', 't') + '=2z$', 'The right side also changes, so it needs its own rate.'], ['$x\\,' + F('x', 't') + '+y\\,' + F('y', 't') + '=z\\,' + F('z', 't') + '$', 'Each square brings down a 2.']] },
    { b: 3, key: 'rect', link: '$A=lw$', right: '$' + F('A', 't') + '=l\\,' + F('w', 't') + '+w\\,' + F('l', 't') + '$', wrong: [['$' + F('A', 't') + '=' + F('l', 't') + '\\cdot' + F('w', 't') + '$', 'Both $l$ and $w$ change, so this needs the product rule. Do not multiply the two rates.'], ['$' + F('A', 't') + '=' + F('l', 't') + '+' + F('w', 't') + '$', 'Area is a product, so its rate uses the product rule.'], ['$' + F('A', 't') + '=l\\,' + F('l', 't') + '+w\\,' + F('w', 't') + '$', 'Each term pairs a length with the rate of the OTHER length.']] },
    { b: 3, key: 'cyl2', link: '$V=\\pi r^2h$ (both $r$ and $h$ change)', right: '$' + F('V', 't') + '=2\\pi rh\\,' + F('r', 't') + '+\\pi r^2\\,' + F('h', 't') + '$', wrong: [['$' + F('V', 't') + '=2\\pi rh\\,' + F('r', 't') + '$', 'The $h$ also changes. Use the product rule.'], ['$' + F('V', 't') + '=\\pi r^2\\,' + F('h', 't') + '$', 'The $r$ also changes. Use the product rule.'], ['$' + F('V', 't') + '=2\\pi r\\,' + F('r', 't') + '+\\pi\\,' + F('h', 't') + '$', 'Differentiate $r^2h$ as a product: one term for each changing letter.']] }
  ];
  var FIXED = [
    { b: 1, key: 'fcyl', line: 'A can has a FIXED radius of 4 cm. Its water depth $h$ changes.', link: '$V=\\pi r^2h$', right: '$' + F('V', 't') + '=\\pi r^2\\,' + F('h', 't') + '$', wrong: [['$' + F('V', 't') + '=2\\pi rh\\,' + F('r', 't') + '$', 'The radius is fixed, so it has no rate. Only $h$ changes.'], ['$' + F('V', 't') + '=0$', 'Water depth changes, so $V$ changes.'], ['$' + F('V', 't') + '=\\pi r^2$', 'The rate of $h$ is missing.']] },
    { b: 2, key: 'fbox', line: 'A box has a FIXED length 5 and width 3. Its height $h$ changes.', link: '$V=lwh$', right: '$' + F('V', 't') + '=lw\\,' + F('h', 't') + '$', wrong: [['$' + F('V', 't') + '=w h\\,' + F('l', 't') + '+l h\\,' + F('w', 't') + '$', 'The length and width are fixed, so they have no rates.'], ['$' + F('V', 't') + '=lw$', 'The rate of $h$ is missing.'], ['$' + F('V', 't') + '=0$', 'The height changes, so $V$ changes.']] },
    { b: 3, key: 'fplane', line: 'A plane flies level at a FIXED height of 3 miles. Its distance along the ground is $x$ and its distance from a station is $s$.', link: '$x^2+3^2=s^2$', right: '$2x\\,' + F('x', 't') + '=2s\\,' + F('s', 't') + '$', wrong: [['$2x\\,' + F('x', 't') + '+6=2s\\,' + F('s', 't') + '$', 'The 3 is a fixed number, so $3^2$ is a constant and its rate is 0.'], ['$2x=2s$', DROP], ['$2x\\,' + F('x', 't') + '+2\\cdot3\\,' + F('y', 't') + '=2s\\,' + F('s', 't') + '$', 'The height never changes, so it has no rate.']] }
  ];
  var READ = [
    { b: 1, q: 'A', name: 'area', u: 'cm²', ul: 'cm', up: 'square centimeters per second' },
    { b: 2, q: 'V', name: 'volume', u: 'cm³', ul: 'cm', up: 'cubic centimeters per second' },
    { b: 3, q: 'A', name: 'area', u: 'ft²', ul: 'ft', up: 'square feet per second' }
  ];

  var SPEC = {
    id: '4-4-pt2-differentiate', course: 'calc', unit: 'Unit 4 · Contextual Applications of Differentiation', title: '4.4 Part 2 · Related Rates: Differentiate in Time',
    selfPaced: true,
    question: 'How do I turn a link equation into an equation about rates?',
    targets: ['I can differentiate a link equation with respect to time.', 'I can put the moment’s numbers in last and solve for the wanted rate.', 'I can say what the answer means, with its sign and units.'],
    tabs: ['Warm-up', 'Predict', 'Concept (pictures)', 'I do (watch)', 'You do', 'Practice', 'Check', 'Wrap-up'],
    buildTarget: 'I can differentiate a link equation in time and solve for the wanted rate.',
    concepts: [
      { title: 'Differentiate in t', points: ['Take $d/dt$ of both sides of the link equation.', 'Every changing letter brings its rate along.'], eq: 'd/dt' },
      { title: 'Chain factor', points: ['$\\dfrac{d}{dt}(r^2)=2r\\cdot\\dfrac{dr}{dt}$.', 'The rate $\\dfrac{dr}{dt}$ rides along like a passenger.'], eq: '2r · dr/dt' },
      { title: 'Fixed numbers have no rate', points: ['A fixed number like 3 or $\\pi$ stays put.', 'Its rate is zero, so it adds no term.'], eq: 'd/dt(3) = 0' },
      { title: 'Plug in last', points: ['After differentiating, put in the moment’s numbers.', 'Then solve for the wanted rate.'], eq: 'solve for it' }
    ],
    review: [
      { id: 'R1', title: 'Review 1', prompt: 'The derivative of $x^2$ with respect to $x$ is…', options: ['$2x$', '$x$', '$2$', '$x^3/3$'], answer: 0, why: 'Power rule: bring the 2 down and lower the power by one.' },
      { id: 'R2', title: 'Review 2', prompt: '$\\dfrac{d}{dt}\\bigl(r^3\\bigr)$, where $r$ depends on $t$, equals…', options: ['$3r^2\\dfrac{dr}{dt}$', '$3r^2$', '$r^3\\dfrac{dr}{dt}$', '$3r\\dfrac{dr}{dt}$'], answer: 0, why: 'Chain rule: differentiate the power, then multiply by the rate of $r$.' },
      { id: 'R3', title: 'Review 3', prompt: 'The link is $A=\\pi r^2$. The number that should be put in last is…', options: ['$r=10$ (true for one moment)', '$\\pi$', 'the 2 from the power', 'the letter $A$'], answer: 0, why: 'Numbers true for one moment wait until the last move.' }
    ],
    predicts: [
      { id: 'P1', title: 'A puddle', prompt: 'A puddle’s radius grows 2 cm every second. When the radius is 10 cm, the area grows faster than when the radius is 5 cm.', options: ['True: a bigger circle gains more area each second', 'False: the area grows at the same speed', 'False: the area grows slower when the radius is bigger', 'It cannot be known'], answer: 0, why: 'The area’s rate depends on $r$ itself. A longer edge adds more area each second.' },
      { id: 'P2', title: 'The chain', prompt: 'The radius grows 3 cm/s. The area grows $\\dfrac{dA}{dr}=20$ cm² per cm of radius. The area grows…', options: ['60 cm² per second', '23 cm² per second', '20 cm² per second', '6.7 cm² per second'], answer: 0, why: 'Rates multiply along the chain: $20\\times3=60$.' }
    ],

    tutorial: {
      moves: ['Draw and name', 'List what you know and want', 'Link with one equation', 'Differentiate in t', 'Plug in last'],
      concept: { title: 'Rates travel along a chain', target: 'I can say why a rate rides along when I differentiate in time.', frames: [
        { head: 'Time leads to the radius', show: 'chain', st: { names: ['t', 'r', 'A'], reveal: 1 }, guide: 'Three boxes: time $t$, radius $r$ and area $A$. The first red arrow says how fast $r$ changes as time passes.',
          say: 'As time $t$ passes, the radius $r$ changes. That speed is $\\dfrac{dr}{dt}$.',
          ask: { type: 'choice', prompt: 'Which symbol is the speed of the radius?', options: ['$\\dfrac{dr}{dt}$', '$\\dfrac{dA}{dr}$', '$\\dfrac{dA}{dt}$', '$r$'], answer: 0, why: 'The speed of $r$ in time is $\\dfrac{dr}{dt}$.', traps: { 1: 'That says how fast the area changes per unit of radius, which is the second arrow.', 2: 'That is the area’s speed in time, the one we want at the end.' } } },
        { head: 'The radius leads to the area', show: 'chain', st: { names: ['t', 'r', 'A'], reveal: 2 }, guide: 'The second red arrow says how fast $A$ changes per unit of $r$.',
          say: 'A change in $r$ makes $A$ change too. How much $A$ changes per unit of $r$ is $\\dfrac{dA}{dr}$.',
          ask: { type: 'choice', prompt: 'What does $\\dfrac{dA}{dr}=12$ cm²/cm say?', options: ['Each extra cm of radius adds about 12 cm² of area.', 'The area is 12 cm².', 'The radius grows 12 cm per second.', 'The area grows 12 cm² per second.'], answer: 0, why: 'It compares area to radius, with no time in it.', traps: { 3: 'Per second would need time. This rate is per cm of radius.' } } },
        { head: 'Multiply along the chain', show: 'chain', st: { names: ['t', 'r', 'A'], reveal: 3 }, guide: 'The green path goes from $t$ to $A$ the long way. The rates on the way are multiplied.',
          say: 'Going from $t$ all the way to $A$, we multiply the rates on the way.',
          ask: { type: 'num', prompt: '$\\dfrac{dA}{dr}=12$ cm²/cm and $\\dfrac{dr}{dt}=0.5$ cm/s. Find $\\dfrac{dA}{dt}$.', answer: 6, unit: 'cm²/s', tol: 0, abs: 0.001, hint: 'Multiply the two rates: $\\dfrac{dA}{dt}=\\dfrac{dA}{dr}\\cdot\\dfrac{dr}{dt}$.', why: '$12\\times0.5=6$ cm²/s.' } },
        { head: 'A squared quantity is steeper', show: 'chaingraph', st: { power: 2, t: 2 }, guide: 'Left graph: $r$ against time, a straight line of slope $0.5$. Right graph: $r^2$ against time. The red lines are slopes. Slide the time.',
          say: 'The line $r$ has the same slope all the time. The curve $r^2$ gets steeper as $r$ gets bigger.',
          ask: { type: 'num', prompt: 'At $r=2$ with $\\dfrac{dr}{dt}=0.5$, the slope of $r^2$ is $2r\\cdot\\dfrac{dr}{dt}$. What is it?', answer: 2, tol: 0, abs: 0.001, hint: 'Put in $r=2$ and $\\dfrac{dr}{dt}=0.5$: $2\\cdot2\\cdot0.5$.', why: '$2\\times2\\times0.5=2$. Look at the readout when $t=2$.' } },
        { head: 'The chain factor', show: 'chaingraph', st: { power: 3, t: 2 }, guide: 'The right graph is now $r^3$. Its slope at each time is shown in the readout line.',
          say: 'For $r^3$ the slope is $3r^2\\cdot\\dfrac{dr}{dt}$. The factor $\\dfrac{dr}{dt}$ always rides along.',
          ask: { type: 'choice', prompt: 'Which is $\\dfrac{d}{dt}(r^3)$?', options: ['$3r^2\\dfrac{dr}{dt}$', '$3r^2$', '$r^3\\dfrac{dr}{dt}$', '$3r\\dfrac{dr}{dt}$'], answer: 0, why: 'Power rule gives $3r^2$, then multiply by the rate of $r$.', traps: { 1: 'The rate $\\dfrac{dr}{dt}$ is missing. It rides along.', 2: 'The power rule was skipped.', 3: 'The power drops by one, so $r^3$ gives $r^2$.' } } },
        { head: 'Fixed numbers have no rate', show: 'cylinder', st: { flow: 'in', h: 4 }, guide: 'A tank with a fixed radius $R$. Only the depth $h$ changes. The slider moves $h$.',
          say: 'The radius $R$ is a fixed number, so it has no rate. Only $h$ brings a rate.',
          ask: { type: 'choice', prompt: 'For $V=\\pi R^2h$ with $R$ fixed, $\\dfrac{dV}{dt}$ is…', options: ['$\\pi R^2\\dfrac{dh}{dt}$', '$2\\pi Rh\\dfrac{dR}{dt}$', '$\\pi R^2$', '$0$'], answer: 0, why: '$\\pi R^2$ is a fixed number multiplying $h$, so only $\\dfrac{dh}{dt}$ appears.', traps: { 1: 'The radius is fixed. It has no rate.', 3: 'Water depth changes, so the volume changes.' } } },
        { head: 'Now put the moment in', show: 'balloon', st: { kind: 'disk', r: 10, k: 10, fixed: true, unit: 'cm' }, guide: 'The puddle at the moment $r=10$ cm.',
          say: 'After differentiating, we put the moment’s numbers in. Here $\\dfrac{dA}{dt}=2\\pi r\\dfrac{dr}{dt}$ with $r=10$ and $\\dfrac{dr}{dt}=2$.',
          ask: { type: 'num', prompt: 'Find $\\dfrac{dA}{dt}=2\\pi r\\dfrac{dr}{dt}$ when $r=10$ and $\\dfrac{dr}{dt}=2$. Give it to 2 decimal places.', answer: 125.66, unit: 'cm²/s', tol: 0.005, hint: 'Multiply $2\\times\\pi\\times10\\times2$, which is $40\\pi$.', why: '$2\\pi(10)(2)=40\\pi\\approx125.66$ cm²/s.' } }
      ] },
      ido: { target: 'I can watch moves 4 and 5 done on two problems and spot the common slip.',
        problem: 'Water spreads on a floor in a circle. The radius grows 2 cm every second. How fast is the area growing when the radius is 10 cm?',
        frames: [
          { head: 'Moves 1 to 3 are done', move: 'Moves 1 to 3 · Name, list, link', show: 'balloon', st: { kind: 'disk', r: 3, rates: true, unit: 'cm' }, guide: 'The puddle from above. The red arrows show the radius growing.',
            say: 'We did these in Part 1. Here is what we have.', work: ['Given: $\\dfrac{dr}{dt}=2$ cm/s', 'Want: $\\dfrac{dA}{dt}$ when $r=10$ cm', 'Link: $A=\\pi r^2$'],
            ask: { type: 'choice', prompt: 'Which number is saved for the LAST move?', options: ['$r=10$', '$\\pi$', '$\\dfrac{dr}{dt}=2$', 'the 2 in $r^2$'], answer: 0, why: '$r=10$ is true for one moment only, so it waits.', traps: { 1: '$\\pi$ never changes, so it stays in the equation.', 2: 'This is a given rate. It comes in when we plug in, but it is not “the moment”.' } } },
          { head: 'Differentiate both sides', move: 'Move 4 · Differentiate in t', show: 'chain', st: { names: ['t', 'r', 'A'], reveal: 3 }, guide: 'The chain from $t$ to $r$ to $A$. Rates are multiplied along it.',
            say: 'Take $d/dt$ of both sides: $A$ gives $\\dfrac{dA}{dt}$, and $\\pi r^2$ gives $2\\pi r\\dfrac{dr}{dt}$.', work: ['$\\dfrac{dA}{dt}=2\\pi r\\,\\dfrac{dr}{dt}$'],
            ask: { type: 'choice', prompt: 'Which line is the derivative in time?', options: ['$\\dfrac{dA}{dt}=2\\pi r\\dfrac{dr}{dt}$', '$\\dfrac{dA}{dt}=2\\pi r$', '$\\dfrac{dA}{dt}=\\pi r^2\\dfrac{dr}{dt}$', '$\\dfrac{dA}{dt}=2\\pi\\dfrac{dr}{dt}$'], answer: 0, why: 'Power rule gives $2\\pi r$, and the chain factor $\\dfrac{dr}{dt}$ rides along.', traps: { 1: 'The factor $\\dfrac{dr}{dt}$ is missing.', 2: 'The power rule was skipped.', 3: 'The $r$ from the power rule is lost.' } } },
          { head: 'Plug in the moment', move: 'Move 5 · Plug in last', show: 'balloon', st: { kind: 'disk', r: 10, k: 10, fixed: true, unit: 'cm' }, guide: 'The puddle at the moment $r=10$ cm.',
            say: 'Now put in $r=10$ and $\\dfrac{dr}{dt}=2$. Then multiply.', work: ['$\\dfrac{dA}{dt}=2\\pi(10)(2)$', '$\\dfrac{dA}{dt}=40\\pi\\approx125.7$ cm²/s'],
            ask: { type: 'choice', prompt: 'What does 125.7 cm²/s tell us?', options: ['The area is growing 125.7 cm² each second at that moment.', 'The area is 125.7 cm².', 'The radius is growing 125.7 cm each second.', 'The area is shrinking.'], answer: 0, why: 'Positive means growing, and cm²/s is area per second.', traps: { 1: 'That is an amount of area. We found a rate.', 3: 'The sign is positive, so it is growing.' } } },
          { head: 'Problem 2: the sliding ladder', move: 'Moves 1 to 3 · Name, list, link', workClear: true, show: 'ladder', st: { L: 13, x: 5, snap: true, lab: { x: 'x', y: 'y', L: '13 ft' }, say: 'x and y change. The ladder stays 13 ft.' }, guide: 'A 13 ft ladder against a wall. $x$ is the foot, $y$ is the top.',
            problem: 'A 13 ft ladder slides away from a wall. The foot moves out at 2 ft/s. How fast is the top falling when the foot is 5 ft from the wall?',
            say: 'We name, list and link as before. The 13 stays because the ladder never changes length.', work: ['Given: $\\dfrac{dx}{dt}=2$ ft/s', 'Want: $\\dfrac{dy}{dt}$ when $x=5$', 'Link: $x^2+y^2=13^2$'],
            ask: { type: 'choice', prompt: 'Which number of the 13 ft ladder problem is a FIXED number?', options: ['13, the ladder length', '5, the foot distance now', '2, the foot speed', '12, the height now'], answer: 0, why: 'Only the ladder length never changes.' } },
          { head: 'Differentiate both sides', move: 'Move 4 · Differentiate in t', show: 'ladder', st: { L: 13, x: 5, snap: true, rates: true, lab: { x: 'x', y: 'y', L: '13 ft' }, say: 'x grows, y shrinks.' }, guide: 'The red arrows show $x$ growing and $y$ shrinking.',
            say: 'The 13 is fixed, so $13^2$ has rate 0. Each of $x^2$ and $y^2$ brings its own rate.', work: ['$2x\\dfrac{dx}{dt}+2y\\dfrac{dy}{dt}=0$'],
            ask: { type: 'choice', prompt: 'Why is the right side $0$?', options: ['$13^2$ is a fixed number, so its rate is 0.', 'Because $x$ and $y$ are 0.', 'Because the ladder is falling.', 'Because $\\dfrac{dx}{dt}=0$.'], answer: 0, why: 'A fixed number has no rate.', traps: { 1: 'Neither is 0. The right side is 0 because 169 never changes.', 3: 'The foot moves at 2 ft/s, so $\\dfrac{dx}{dt}$ is not 0.' } } },
          { head: 'Find the missing height first', move: 'Move 5 · Plug in last', show: 'ladder', st: { L: 13, x: 5, snap: true, lab: { x: '5', y: 'y = ?', L: '13 ft' }, say: 'At this moment x = 5.' }, guide: 'The ladder at the moment $x=5$. The top height $y$ is not given.',
            say: 'We need $y$ at this moment. Use the link equation with $x=5$: $25+y^2=169$.', work: ['At $x=5$: $y^2=169-25=144$, so $y=12$'],
            ask: { type: 'num', prompt: 'At $x=5$ on the 13 ft ladder, how high is the top?', answer: 12, unit: 'ft', tol: 0, abs: 0.001, hint: '$5^2+y^2=13^2$, so $y^2=144$.', why: '$y^2=169-25=144$, so $y=12$ ft.' } },
          { head: 'Plug in and solve', move: 'Move 5 · Plug in last', show: 'ladder', st: { L: 13, x: 5, snap: true, rates: true, lab: { x: '5', y: '12', L: '13 ft' }, say: 'x = 5, y = 12, dx/dt = 2.' }, guide: 'All the moment’s numbers are now filled in.',
            say: 'Put in $x=5$, $y=12$ and $\\dfrac{dx}{dt}=2$. Solve for $\\dfrac{dy}{dt}$.', work: ['$2(5)(2)+2(12)\\dfrac{dy}{dt}=0$', '$20+24\\dfrac{dy}{dt}=0$', '$\\dfrac{dy}{dt}=-\\dfrac{20}{24}=-\\dfrac56\\approx-0.83$ ft/s'],
            ask: { type: 'num', prompt: 'Solve $20+24\\dfrac{dy}{dt}=0$ for $\\dfrac{dy}{dt}$. Give it to 2 decimal places.', answer: -0.83, unit: 'ft/s', tol: 0.005, hint: 'Subtract 20, then divide by 24.', why: '$24\\dfrac{dy}{dt}=-20$, so $\\dfrac{dy}{dt}=-0.83$ ft/s. The top is falling, so the rate is negative.' } },
          { head: 'The common slip', slip: true, show: 'chain', st: { names: ['t', 'r', 'A'], reveal: 2 }, guide: 'The chain is missing its third step, which is the green path that multiplies by $\\dfrac{dr}{dt}$.',
            say: 'Slip: writing $\\dfrac{dA}{dt}=2\\pi r$ and stopping. The chain factor $\\dfrac{dr}{dt}$ was dropped, so the answer would have the wrong units.', work: ['Wrong: $\\dfrac{dA}{dt}=2\\pi r$', 'Right: $\\dfrac{dA}{dt}=2\\pi r\\dfrac{dr}{dt}$'],
            ask: { type: 'choice', prompt: 'How can you tell the slip from the units?', options: ['$2\\pi r$ is in cm, but $\\dfrac{dA}{dt}$ must be cm² per second.', '$2\\pi r$ has no units.', 'There is no way to tell.', '$2\\pi r$ is always wrong.'], answer: 0, why: 'cm is a length. A rate of area needs cm²/s. The missing $\\dfrac{dr}{dt}$ brings the “per second”.', traps: { 3: 'It is the right power-rule part. Only the chain factor is missing.' } } }
        ] },
      summary: ['Differentiate both sides of the link with respect to $t$. Every changing letter brings its own rate.', 'Fixed numbers have no rate and add no term.', 'Put the moment’s numbers in last. Find any missing quantity from the link equation.', 'Say the answer with its sign and units: positive grows, negative shrinks.']
    },

    skills: [
      { id: 'dstep', title: 'Differentiate the link', gen: function (b, r) {
        b = Math.min(b, 3);
        var pool = DLINK.filter(function (c) { return c.b === b || (b === 3 && c.b === 2 && r() < 0.3) || (b === 2 && c.b === 1 && r() < 0.3); }), c = pick(r, pool.length ? pool : DLINK);
        var opts = [c.right].concat(c.wrong.map(function (w) { return w[0]; })), msgs = [''].concat(c.wrong.map(function (w) { return w[1]; })), mx = mix(r, opts, msgs);
        return { type: 'choice', data: { link: c.key, right: mx.answer }, prompt: 'The link is ' + c.link + '. All the letters change with time $t$. Which line is the result of differentiating both sides with respect to $t$?', options: mx.options, answer: mx.answer, why: mx.why,
          hint: 'Step card: (1) go term by term, (2) apply the power or product rule, (3) multiply each changing letter by its own rate. First step: look at the left side and write its rate. Same move: $\\dfrac{d}{dt}(r^2)=2r\\dfrac{dr}{dt}$.',
          worked: 'Differentiate each side in time. Each changing letter brings its own rate with it, so the answer is ' + c.right + '.' };
      } },

      { id: 'solve', title: 'Solve for the wanted rate', gen: function (b, r) {
        b = Math.min(b, 3);
        if (b === 1) { var rr = INT(r, 3, 12), rp = INT(r, 2, 5), ans = round2(2 * Math.PI * rr * rp);
          return { type: 'num', tol: 0.005, data: { kind: 'circle', r: rr, rp: rp }, prompt: 'A circular puddle’s radius grows ' + rp + ' cm every second. Using $\\dfrac{dA}{dt}=2\\pi r\\dfrac{dr}{dt}$, find how fast the area grows when $r=' + rr + '$ cm. Give it to 2 decimal places.', answer: ans, unit: 'cm²/s',
            hint: 'Step card: (1) write the derivative line, (2) put in $r$ and $\\dfrac{dr}{dt}$, (3) multiply. First step: put in $r=' + rr + '$ and $\\dfrac{dr}{dt}=' + rp + '$. Same move: with $r=1$ and $\\dfrac{dr}{dt}=1$, $2\\pi(1)(1)=6.28$.',
            worked: '$\\dfrac{dA}{dt}=2\\pi(' + rr + ')(' + rp + ')=' + ans + '$ cm²/s.' }; }
        if (b === 2) { var sph = r() < 0.5;
          if (sph) { var rd = INT(r, 2, 8), rt = INT(r, 1, 4), a2 = round2(4 * Math.PI * rd * rd * rt);
            return { type: 'num', tol: 0.005, data: { kind: 'sphere', r: rd, rp: rt }, prompt: 'A balloon’s radius grows ' + rt + ' cm every second. Using $\\dfrac{dV}{dt}=4\\pi r^2\\dfrac{dr}{dt}$, find how fast the volume grows when $r=' + rd + '$ cm. Give it to 2 decimal places.', answer: a2, unit: 'cm³/s',
              hint: 'Step card: (1) write the derivative line, (2) put in $r$ and $\\dfrac{dr}{dt}$, (3) square $r$ before multiplying. First step: $r^2=' + rd * rd + '$. Same move: with $r=2$ and $\\dfrac{dr}{dt}=1$, $4\\pi(4)(1)=50.27$.',
              worked: '$\\dfrac{dV}{dt}=4\\pi(' + rd + ')^2(' + rt + ')=' + a2 + '$ cm³/s.' }; }
          var s = INT(r, 3, 9), sp = INT(r, 1, 4), a3 = 3 * s * s * sp;
          return { type: 'num', tol: 0, abs: 0.001, data: { kind: 'cube', s: s, sp: sp }, prompt: 'An ice cube melts so that its edge grows ' + sp + ' cm each minute. Using $\\dfrac{dV}{dt}=3s^2\\dfrac{ds}{dt}$, find how fast the volume grows when $s=' + s + '$ cm.', answer: a3, unit: 'cm³/min',
            hint: 'Step card: (1) write the derivative line, (2) put in $s$ and $\\dfrac{ds}{dt}$, (3) square $s$ first. First step: $s^2=' + s * s + '$. Same move: with $s=2$ and $\\dfrac{ds}{dt}=1$, $3(4)(1)=12$.',
            worked: '$\\dfrac{dV}{dt}=3(' + s + ')^2(' + sp + ')=' + a3 + '$ cm³/min.' }; }
        var rect = r() < 0.5;
        if (rect) { var l = INT(r, 6, 12), w = INT(r, 3, 9), lp = INT(r, 1, 4), wp = -INT(r, 1, 3), a4 = lp * w + l * wp;
          return { type: 'num', tol: 0, abs: 0.001, data: { kind: 'rect', l: l, w: w, lp: lp, wp: wp }, prompt: 'A rectangle’s length grows ' + lp + ' cm/s and its width shrinks ' + (-wp) + ' cm/s. Using $\\dfrac{dA}{dt}=l\\dfrac{dw}{dt}+w\\dfrac{dl}{dt}$, find $\\dfrac{dA}{dt}$ when $l=' + l + '$ cm and $w=' + w + '$ cm.', answer: a4, unit: 'cm²/s',
            hint: 'Step card: (1) shrinking means a negative rate, (2) put in all four numbers, (3) add the two terms. First step: $\\dfrac{dw}{dt}=' + wp + '$ because the width shrinks. Same move: $l=2$, $w=1$, $\\dfrac{dl}{dt}=1$, $\\dfrac{dw}{dt}=-1$ gives $2(-1)+1(1)=-1$.',
            worked: '$\\dfrac{dA}{dt}=(' + l + ')(' + wp + ')+(' + w + ')(' + lp + ')=' + a4 + '$ cm²/s.' }; }
        var T = pick(r, [[3, 4, 5], [5, 12, 13], [8, 15, 17], [6, 8, 10]]), x = T[0], y = T[1], L = T[2], xp = INT(r, 1, 3), ans5 = round2(-x * xp / y);
        return { type: 'num', tol: 0.005, data: { kind: 'ladder', x: x, y: y, L: L, xp: xp }, prompt: 'A ' + L + ' ft ladder slides away from a wall. The foot moves out at ' + xp + ' ft/s. Using $2x\\dfrac{dx}{dt}+2y\\dfrac{dy}{dt}=0$, find $\\dfrac{dy}{dt}$ when the foot is ' + x + ' ft from the wall and the top is ' + y + ' ft up. Give it to 2 decimal places.', answer: ans5, unit: 'ft/s',
          hint: 'Step card: (1) put in $x$, $y$ and $\\dfrac{dx}{dt}$, (2) get $\\dfrac{dy}{dt}$ alone, (3) check the sign. First step: the equation becomes $2(' + x + ')(' + xp + ')+2(' + y + ')\\dfrac{dy}{dt}=0$. Same move: if $2(3)(1)+2(4)\\dfrac{dy}{dt}=0$ then $\\dfrac{dy}{dt}=-0.75$.',
          worked: '$' + 2 * x * xp + '+' + 2 * y + '\\dfrac{dy}{dt}=0$, so $\\dfrac{dy}{dt}=-\\dfrac{' + 2 * x * xp + '}{' + 2 * y + '}=' + ans5 + '$ ft/s. The top is falling, so it is negative.' };
      } },

      { id: 'read', title: 'Say what the rate means', gen: function (b, r) {
        b = Math.min(b, 3);
        var c = READ[b - 1], mag = round2(INT(r, 10, 99) / 10), dir = b === 1 ? 1 : (r() < 0.5 ? 1 : -1), val = dir * mag, word = dir > 0 ? 'growing' : 'shrinking', other = dir > 0 ? 'shrinking' : 'growing', num = mag.toFixed(1);
        var right = 'The ' + c.name + ' is ' + word + ' ' + num + ' ' + c.up + ' at that moment.', mx = mix(r, [right, 'The ' + c.name + ' is ' + other + ' ' + num + ' ' + c.up + ' at that moment.', 'The ' + c.name + ' is ' + word + ' ' + num + ' ' + c.ul + ' per second at that moment.', 'The ' + c.name + ' is ' + num + ' ' + c.u + ' at that moment.'],
          ['', 'Check the sign. ' + (dir > 0 ? 'Positive means growing.' : 'Negative means shrinking.'), 'That unit is a length. A rate of ' + c.name + ' is ' + c.u + ' per second.', 'That is an amount, not a rate. A rate says “per second”.']);
        return { type: 'choice', data: { val: val, dir: dir, q: c.q }, prompt: 'You solve a related-rates problem and get $\\dfrac{d' + c.q + '}{dt}=' + val.toFixed(1) + '$ ' + c.u + '/s. What does that say?', options: mx.options, answer: mx.answer, why: mx.why,
          hint: 'Step card: (1) read the sign: positive grows, negative shrinks, (2) read the unit: ' + c.u + ' per second, (3) say both. First step: the sign is ' + (dir > 0 ? 'positive' : 'negative') + '. Same move: $\\dfrac{dy}{dt}=-2$ ft/s says the top is falling 2 feet each second.',
          worked: 'The sign is ' + (dir > 0 ? 'positive, so growing' : 'negative, so shrinking') + ', and ' + c.u + '/s is ' + c.up + '. ' + right };
      } },

      { id: 'fixed', title: 'Fixed numbers have no rate', gen: function (b, r) {
        b = Math.min(b, 3);
        var c = FIXED.filter(function (f) { return f.b === b; })[0] || FIXED[0], opts = [c.right].concat(c.wrong.map(function (w) { return w[0]; })), msgs = [''].concat(c.wrong.map(function (w) { return w[1]; })), mx = mix(r, opts, msgs);
        return { type: 'choice', data: { link: c.key, right: mx.answer }, prompt: c.line + ' The link is ' + c.link + '. Which line differentiates it in time?', options: mx.options, answer: mx.answer, why: mx.why,
          hint: 'Step card: (1) mark which letters change and which are fixed, (2) a fixed letter adds no rate term, (3) write one term per changing letter. First step: circle the changing letter(s) in the story. Same move: if only $h$ changes in $V=5h$, then $\\dfrac{dV}{dt}=5\\dfrac{dh}{dt}$.',
          worked: 'Fixed numbers have rate 0, so they add no term. Only the changing letters bring rates: ' + c.right + '.' };
      } }
    ],

    misconceptions: [
      { say: 'dA/dt = 2πr (stop there).', fix: 'The chain factor dr/dt rides along: dA/dt = 2πr·dr/dt.' },
      { say: 'Put r = 10 in first, then differentiate.', fix: 'A fixed 10 has rate 0, so everything vanishes. Differentiate first, plug in after.' },
      { say: 'A fixed number like 13 or the radius of a fixed can needs a rate.', fix: 'Fixed numbers have rate 0 and add no term.' },
      { say: 'A shrinking quantity has a positive answer.', fix: 'Shrinking means the rate is negative.' },
      { say: 'Product rule: multiply the two rates.', fix: 'Each term pairs one quantity with the rate of the other.' }
    ]
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = SPEC; else (root.SPECS = root.SPECS || {})[SPEC.id] = SPEC;
})(typeof window !== 'undefined' ? window : globalThis);
