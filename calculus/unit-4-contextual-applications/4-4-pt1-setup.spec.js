/* SPEC (calculus 4.4 part 1): the lesson page, the key PDFs and the unit tests all read this one file.
   A fully independent visual-tutorial lesson (SPEC.tutorial): no huddle, no teacher talk. Tabs: Warm-up, Predict, Concept (pictures + questions),
   I do (one problem worked on a board, move by move), You do (generated problems), Practice, Check, Wrap-up.
   Math is written the way qkit writes it: $x^2$ in prompts. Every skill item carries the data its test needs (tests/unit/related-rates-setup.test.js):
     link   data.right is the index of the one true equation; data.kinds lists what each option is (true, plug, other).
     given  data.g (given rate), data.w (wanted rate) and data.opts say what each option claims.
     sign   data.dir (+1 grows, -1 shrinks) and data.sym; the right option is recomputed from them.
     hold   data.keep says which numbers may go into the link equation now. */
(function (root) {
  'use strict';
  var INT = function (r, a, b) { return a + Math.floor(r() * (b - a + 1)); };
  var pick = function (r, arr) { return arr[Math.floor(r() * arr.length)]; };
  var shuffle = function (r, arr) { var a = arr.slice(), i, j, t; for (i = a.length - 1; i > 0; i--) { j = Math.floor(r() * (i + 1)); t = a[i]; a[i] = a[j]; a[j] = t; } return a; };
  /* mix: options (the first is right) and one message per option; returns the shuffled options, the right index and the messages in the new order */
  function mix(r, opts, msgs) { var order = shuffle(r, opts.map(function (_, i) { return i; })); return { options: order.map(function (i) { return opts[i]; }), answer: order.indexOf(0), why: order.map(function (i) { return msgs && msgs[i] ? msgs[i] : ''; }) }; }
  var D = function (a, b) { return '\\dfrac{d' + a + '}{d' + b + '}'; };

  /* link contexts: the true equation, three wrong ones (the first wrong one is always "a different shape's equation"), and a function that puts the moment in too early */
  var LINK = [
    { b: 1, line: 'A circular oil slick has radius $r$ and area $A$.', right: '$A=\\pi r^2$', wrong: ['$A=2\\pi r$', '$A=\\pi r$', '$A=r^2$'], plug: function (m) { return '$A=\\pi(' + m + ')^2$'; }, mv: 'r', mu: 'ft', note: 'The area of a circle is $\\pi r^2$. The $2\\pi r$ is the distance around the edge.' },
    { b: 1, line: 'A spherical balloon has radius $r$ and volume $V$.', right: '$V=\\tfrac43\\pi r^3$', wrong: ['$V=4\\pi r^2$', '$V=\\tfrac13\\pi r^3$', '$V=\\pi r^2$'], plug: function (m) { return '$V=\\tfrac43\\pi(' + m + ')^3$'; }, mv: 'r', mu: 'cm', note: 'The volume of a sphere is $\\tfrac43\\pi r^3$. The $4\\pi r^2$ is its surface area.' },
    { b: 1, line: 'A cube of ice has edge $s$ and volume $V$.', right: '$V=s^3$', wrong: ['$V=s^2$', '$V=3s$', '$V=6s^2$'], plug: function (m) { return '$V=' + m + '^3$'; }, mv: 's', mu: 'cm', note: 'A cube’s volume is edge times edge times edge.' },
    { b: 1, line: 'A square window has side $s$ and area $A$.', right: '$A=s^2$', wrong: ['$A=4s$', '$A=2s$', '$A=s^3$'], plug: function (m) { return '$A=' + m + '^2$'; }, mv: 's', mu: 'in', note: 'A square’s area is side times side. The $4s$ is the distance around it.' },
    { b: 2, line: 'A can has a fixed radius $r$ and a water depth $h$ that changes. Its volume is $V$.', right: '$V=\\pi r^2h$', wrong: ['$V=2\\pi rh$', '$V=\\tfrac13\\pi r^2h$', '$V=\\pi rh$'], plug: function (m) { return '$V=\\pi r^2(' + m + ')$'; }, mv: 'h', mu: 'cm', note: 'A cylinder is a circle $\\pi r^2$ stacked $h$ high.' },
    { b: 2, line: 'A rectangle has length $l$ and width $w$. Its area is $A$.', right: '$A=lw$', wrong: ['$A=l+w$', '$A=2l+2w$', '$A=l^2w$'], plug: function (m) { return '$A=(' + m + ')w$'; }, mv: 'l', mu: 'cm', note: 'Area is length times width. Adding gives a distance, not an area.' },
    { b: 2, line: 'A 10 ft ladder leans on a wall. Its foot is $x$ from the wall and its top is $y$ up the wall.', right: '$x^2+y^2=10^2$', wrong: ['$x+y=10$', '$x^2+y^2=10$', '$x^2-y^2=10^2$'], plug: function (m) { return '$' + m + '^2+y^2=10^2$'; }, mv: 'x', mu: 'ft', note: 'The ladder is the long side of a right triangle: $x^2+y^2=10^2$.' },
    { b: 3, line: 'One car drives east and one drives north from the same corner. They are $x$ and $y$ miles from it and $z$ miles apart.', right: '$x^2+y^2=z^2$', wrong: ['$x+y=z$', '$x^2+y^2=z$', '$z^2=x^2-y^2$'], plug: function (m) { return '$' + m + '^2+y^2=z^2$'; }, mv: 'x', mu: 'mi', note: 'The straight line between the cars is the long side of a right triangle.' },
    { b: 3, line: 'A plane flies level 3 miles up. It is $x$ miles along the ground from a station and $s$ miles from it in a straight line.', right: '$x^2+3^2=s^2$', wrong: ['$x+3=s$', '$x^2+s^2=3^2$', '$x^2+y^2=s^2$'], plug: function (m) { return '$' + m + '^2+3^2=s^2$'; }, mv: 'x', mu: 'mi', note: 'The height 3 never changes, so it may stay in the equation as a number.' }
  ];
  var PLUGMSG = 'That puts the number for one moment into the equation too early. Keep changing quantities as letters.';

  var SPEC = {
    id: '4-4-pt1-setup', course: 'calc', unit: 'Unit 4 · Contextual Applications of Differentiation', title: '4.4 Part 1 · Related Rates: Set It Up',
    selfPaced: true,
    question: 'When two things change together, how do I name them and link them?',
    targets: ['I can name the quantities that change together in a story.', 'I can list the rates I know and the rate I want, with signs.', 'I can pick the equation that links the quantities.'],
    tabs: ['Warm-up', 'Predict', 'Concept (pictures)', 'I do (watch)', 'You do', 'Practice', 'Check', 'Wrap-up'],
    buildTarget: 'I can set up a related-rates problem: name, list and link.',

    concepts: [
      { title: 'Related quantities', points: ['Two quantities in one story change together.', 'Each one is a function of time $t$.'], eq: 'r(t), A(t)' },
      { title: 'A rate', points: ['$dr/dt$ says how fast $r$ changes per unit of time.', 'Growing: positive. Shrinking: negative.'], eq: 'dr/dt' },
      { title: 'The link equation', points: ['One equation joins the changing quantities.', 'Only numbers that never change may go in it.'], eq: 'A = πr²' },
      { title: 'Wait for the moment', points: ['A number true at one moment (like r = 10) waits until the last move.'], eq: 'plug in last' }
    ],

    review: [
      { id: 'R1', title: 'Review 1', prompt: 'The derivative of $x^3$ is…', options: ['$3x^2$', '$\\tfrac14x^4$', '$3x$', '$x^2$'], answer: 0, why: 'Power rule: bring down the 3 and lower the power by one.' },
      { id: 'R2', title: 'Review 2', prompt: 'If $y$ depends on $x$, then $\\dfrac{d}{dx}(y^2)$ is…', options: ['$2y\\dfrac{dy}{dx}$', '$2y$', '$y^2$', '$2\\dfrac{dy}{dx}$'], answer: 0, why: 'Chain rule: differentiate $y^2$ to get $2y$, then multiply by $\\dfrac{dy}{dx}$.' },
      { id: 'R3', title: 'Review 3', prompt: 'A particle has velocity $v(t)=-3$ at one moment. It is moving…', options: ['in the negative direction', 'in the positive direction', 'not at all', 'faster and faster'], answer: 0, why: 'A negative velocity means the position is getting smaller.' }
    ],

    predicts: [
      { id: 'P1', title: 'A balloon', prompt: 'A balloon is blown up so its radius grows by the same amount every second. Its volume grows…', options: ['by more and more each second', 'by the same amount each second', 'by less and less each second', 'not at all'], answer: 0, why: 'Volume depends on $r^3$, so the bigger the balloon, the faster its volume grows. The tutorial shows why.' },
      { id: 'P2', title: 'A ladder', prompt: 'A ladder’s foot is pulled away from a wall at a steady speed. The top of the ladder slides down…', options: ['slowly at first, then faster and faster', 'at the same steady speed', 'fast at first, then slower', 'not at all'], answer: 0, why: 'The top barely moves at first and drops quickly at the end. You will see the reason in 4.5.' }
    ],

    tutorial: {
      moves: ['Draw and name', 'List what you know and want', 'Link with one equation', 'Differentiate in t', 'Plug in last'],
      concept: { title: 'Two things change together', target: 'I can say which quantities change, what a rate is, and which equation links them.', frames: [
        { head: 'Two things change at once', show: 'balloon', st: { kind: 'sphere', r: 2 }, guide: 'A balloon from the side. The line from the center to the edge is the radius $r$. Slide $r$ and read $V$ under the picture.',
          say: 'As air goes in, the radius $r$ and the volume $V$ both change. They change together.',
          ask: { type: 'choice', prompt: 'Which quantities change as the balloon fills?', options: ['Both $r$ and $V$', 'Only $r$', 'Only $V$', 'Neither: they are constants'], answer: 0, why: 'Both change. When one changes, the other is forced to change with it.' } },
        { head: 'Not at the same speed', show: 'balloon', st: { kind: 'sphere', r: 2, table: [1, 2, 3, 4] }, guide: 'The table lists some radii and the volume for each. The gold row follows the slider. Compare how much $V$ grows each time $r$ goes up by 1.',
          say: 'Each time $r$ goes up by 1 cm, $V$ grows by a bigger amount than the time before.',
          ask: { type: 'choice', prompt: 'If the radius grows at a steady pace, the volume grows…', options: ['faster and faster', 'at the same steady pace', 'slower and slower', 'not at all'], answer: 0, why: 'V goes 4.2, 33.5, 113.1, 268.1. The jumps are 29, 80, 155: bigger each time.' } },
        { head: 'A ladder ties two lengths together', show: 'ladder', st: { L: 5, x: 3 }, guide: 'The brown line is a ladder 5 ft long. $x$ is how far the foot is from the wall. $y$ is how high the top is. Slide $x$ and watch $y$.',
          say: 'The foot slides out and the top slides down. The ladder never gets longer, so $x$ and $y$ are tied together.',
          ask: { type: 'num', prompt: 'When the foot is $x=3$ ft from the wall, how high is the top?', answer: 4, unit: 'ft', tol: 0.001, hint: 'The ladder, the wall and the floor make a right triangle: $x^2+y^2=5^2$.', why: '$3^2+y^2=25$, so $y^2=16$ and $y=4$ ft.' } },
        { head: 'A rate says how fast', show: 'ladder', st: { L: 5, x: 3, rates: true }, guide: 'The red arrows show which way each length is moving. $\\dfrac{dx}{dt}$ is how fast $x$ changes as time $t$ passes.',
          say: 'The symbol $\\dfrac{dx}{dt}$ means how fast $x$ changes each second. Its units are feet per second.',
          ask: { type: 'choice', prompt: '$\\dfrac{dy}{dt}=-2$ ft/s. What does that say?', options: ['The top is sliding down 2 feet each second.', 'The top is 2 feet above the floor.', 'The top is sliding up 2 feet each second.', 'The ladder is 2 feet long.'], answer: 0, why: 'The 2 is how fast. The minus sign says $y$ is getting smaller.', traps: { 1: 'A rate is a speed, not a height. Heights are $y$.', 3: 'The ladder length is $L$. It is not a rate.' } } },
        { head: 'Growing is positive. Shrinking is negative.', show: 'cylinder', st: { flow: 'out', h: 6 }, guide: 'A tank with water draining out. The red label says the volume is getting smaller. The slider sets the depth $h$.',
          say: 'If a quantity is growing, its rate is positive. If it is shrinking, its rate is negative.',
          ask: { type: 'choice', prompt: 'Water drains out of the tank. The rate $\\dfrac{dV}{dt}$ is…', options: ['negative, because $V$ is shrinking', 'positive, because water moves', 'zero, because the tank is full', 'impossible to tell'], answer: 0, why: 'Water leaving means $V$ is getting smaller, so $\\dfrac{dV}{dt}<0$.' } },
        { head: 'One equation links them', show: 'formulas', st: { hi: ['circle'] }, guide: 'Six shapes and the equation for each. The blue card is the circle: area $A$ and radius $r$.',
          say: 'A link equation joins the changing quantities, like $A=\\pi r^2$. A number like $\\pi$ never changes, so it stays.',
          ask: { type: 'choice', prompt: 'A circular puddle has area $A$ and radius $r$. Which equation links them?', options: ['$A=\\pi r^2$', '$A=2\\pi r$', '$A=\\pi r$', '$A=r^2$'], answer: 0, why: 'The area of a circle is $\\pi r^2$.', traps: { 1: 'That is the distance around the circle (circumference), not the area.', 2: 'The radius is squared in the area formula.', 3: 'The $\\pi$ is missing. A circle is not a square.' } } },
        { head: 'Given and wanted', show: 'balloon', st: { kind: 'disk', r: 2, rates: true, unit: 'ft' }, guide: 'A puddle seen from above. The red arrows show its radius growing.',
          say: '“The radius grows 3 ft per minute” gives $\\dfrac{dr}{dt}=3$. “How fast is the area growing?” asks for $\\dfrac{dA}{dt}$.',
          ask: { type: 'choice', prompt: 'The radius grows 3 ft/min. We are asked how fast the area grows. Which rate do we WANT?', options: ['$\\dfrac{dA}{dt}$', '$\\dfrac{dr}{dt}$', '$r$', '$A$'], answer: 0, why: 'We are given $\\dfrac{dr}{dt}=3$. The thing we want is $\\dfrac{dA}{dt}$.' } },
        { head: 'Which numbers go in the equation?', show: 'ladder', st: { L: 13, x: 5, snap: true, lab: { x: 'x', y: 'y', L: 'L = 13 ft' }, say: 'The foot is x, the top is y. Both are changing. The ladder is always 13 ft.' }, guide: 'A 13 ft ladder. The foot $x$ and the top $y$ change as it slides. The 13 ft never changes.',
          say: 'Only numbers that never change may go into the link equation. Changing quantities stay as letters.',
          ask: { type: 'choice', prompt: 'The link is $x^2+y^2=13^2$. Why is 13 allowed, but “$x=5$” is not?', options: ['13 never changes. $x$ changes as the ladder slides.', '13 is bigger than 5.', '$x$ is not a number.', 'The equation only works with big numbers.'], answer: 0, why: 'The ladder length stays 13 ft. The foot distance $x=5$ is true only at one moment.' } }
      ] },
      ido: { target: 'I can watch the first three moves done on two problems and spot the common slip.',
        problem: 'Water spreads on a floor in a circle. The radius grows 2 cm every second. How fast is the area growing when the radius is 10 cm?',
        frames: [
          { head: 'Name what changes', move: 'Move 1 · Draw and name', show: 'balloon', st: { kind: 'disk', r: 3, rates: true, unit: 'cm' }, guide: 'The puddle from above. The red arrows show the radius growing.',
            say: 'Name every quantity that changes: the radius $r$ (cm), the area $A$ (cm²) and time $t$ (s).', work: ['Changing: $r$ (cm), $A$ (cm²), $t$ (s)'],
            ask: { type: 'choice', prompt: 'Which of these changes while the puddle spreads?', options: ['$r$ and $A$', 'Only $r$', '$\\pi$', 'The 10 cm'], answer: 0, why: '$r$ and $A$ both change. $\\pi$ never changes, and 10 cm is the radius at just one moment.' } },
          { head: 'Write what we know and what we want', move: 'Move 2 · List what you know and want', show: 'balloon', st: { kind: 'disk', r: 3, rates: true, unit: 'cm' }, guide: 'Same puddle. Growing means a positive rate.',
            say: 'Write each rate with its symbol. “Grows 2 cm every second” is a rate.', work: ['Given: $\\dfrac{dr}{dt}=2$ cm/s', 'Want: $\\dfrac{dA}{dt}$ when $r=10$ cm'],
            ask: { type: 'choice', prompt: 'How do we write “the radius grows 2 cm every second”?', options: ['$\\dfrac{dr}{dt}=2$', '$r=2$', '$\\dfrac{dr}{dt}=-2$', '$\\dfrac{dA}{dt}=2$'], answer: 0, why: 'A rate of change in $r$, and growing makes it positive.', traps: { 1: 'That says the radius IS 2, not that it grows 2 per second.', 2: 'The radius is growing, so the sign is positive.', 3: 'That is the area’s rate, which is what we are asked to find.' } } },
          { head: 'The moment waits', move: 'Move 2 · List what you know and want', show: 'balloon', st: { kind: 'disk', r: 10, k: 10, fixed: true, unit: 'cm' }, guide: 'The puddle at the moment we are asked about: $r=10$ cm. This is one frozen moment.',
            say: 'The 10 cm is true only at this one moment. We keep it on the side until the last move.', work: ['Save for the end: $r=10$'],
            ask: { type: 'choice', prompt: 'Should we put $r=10$ into the equation now?', options: ['No. The radius keeps changing, so 10 is true for one moment only.', 'Yes. Always put the numbers in first.', 'Yes, because 10 is given.', 'It makes no difference.'], answer: 0, why: 'Numbers for one moment wait. Only numbers that never change may go in early.' } },
          { head: 'Link with one equation', move: 'Move 3 · Link with one equation', show: 'formulas', st: { hi: ['circle'] }, guide: 'The circle card is highlighted: area and radius.',
            say: 'The equation that joins $A$ and $r$ is the area of a circle, and we keep $r$ as a letter.', work: ['Link: $A=\\pi r^2$'],
            ask: { type: 'choice', prompt: 'Which link equation do we write now?', options: ['$A=\\pi r^2$', '$A=\\pi(10)^2$', '$A=100\\pi$', '$A=2\\pi r$'], answer: 0, why: 'Keep $r$ as a letter. We will use 10 in the last move.', traps: { 1: 'That puts the moment (10) in too early. Keep $r$ as a letter.', 2: 'That is one fixed number. A fixed number cannot change, so it has no rate.', 3: 'That is the distance around the circle, not its area.' } } },
          { head: 'Problem 2: a sliding ladder', move: 'Move 1 · Draw and name', workClear: true, show: 'ladder', st: { L: 13, x: 5, snap: true, lab: { x: 'x', y: 'y', L: '13 ft' }, say: 'x and y change. The ladder stays 13 ft.' }, guide: 'A 13 ft ladder against a wall. $x$ is the foot, $y$ is the top.',
            problem: 'A 13 ft ladder slides away from a wall. The foot moves out at 2 ft/s. How fast is the top falling when the foot is 5 ft from the wall?',
            say: 'Name what changes: the foot $x$ and the top $y$. The ladder $L=13$ ft does not change.', work: ['Changing: $x$ (ft), $y$ (ft)', 'Never changes: $L=13$ ft'],
            ask: { type: 'choice', prompt: 'Which quantities change as the ladder slides?', options: ['$x$ and $y$', 'Only $x$', '$x$, $y$ and $L$', 'Only $y$'], answer: 0, why: 'The foot and the top both move. The ladder itself keeps its length.' } },
          { head: 'Write what we know and what we want', move: 'Move 2 · List what you know and want', show: 'ladder', st: { L: 13, x: 5, snap: true, rates: true, lab: { x: 'x', y: 'y', L: '13 ft' }, say: 'The foot moves out. The top moves down.' }, guide: 'The red arrows show the foot moving out and the top moving down.',
            say: 'The foot moves out at 2 ft/s. We want the rate of the top, which is falling.', work: ['Given: $\\dfrac{dx}{dt}=2$ ft/s', 'Want: $\\dfrac{dy}{dt}$ when $x=5$ ft'],
            ask: { type: 'choice', prompt: 'The top is FALLING. What sign should $\\dfrac{dy}{dt}$ have?', options: ['negative', 'positive', 'zero', 'no sign'], answer: 0, why: '$y$ is getting smaller, so its rate is negative.' } },
          { head: 'Link with one equation', move: 'Move 3 · Link with one equation', show: 'ladder', st: { L: 13, x: 5, snap: true, lab: { x: 'x', y: 'y', L: '13 ft' }, say: 'x² + y² = 13²' }, guide: 'The ladder is the long side of a right triangle.',
            say: 'The ladder, the wall and the floor make a right triangle. The 13 may stay, because it never changes.', work: ['Link: $x^2+y^2=13^2$'],
            ask: { type: 'choice', prompt: 'Which number may go into the link equation now?', options: ['13, the ladder length', '5, the foot distance right now', '12, the height right now', '2, the speed of the foot'], answer: 0, why: '13 never changes. The 5 and 12 are for one moment, and 2 is a rate, not part of the link.' } },
          { head: 'The common slip', slip: true, show: 'ladder', st: { L: 13, x: 5, snap: true, lab: { x: '5', y: 'y', L: '13' }, say: 'A fixed 5 cannot change.' }, guide: 'The foot is labeled with the fixed number 5. A number that is fixed cannot have a rate.',
            say: 'Slip: writing $5^2+y^2=13^2$. A fixed 5 cannot change, so $\\dfrac{dx}{dt}$ has nothing to belong to.', work: ['Wrong: $5^2+y^2=13^2$', 'Right: $x^2+y^2=13^2$'],
            ask: { type: 'choice', prompt: 'Which equation should we carry into the next part?', options: ['$x^2+y^2=13^2$', '$5^2+y^2=13^2$', '$x^2+12^2=13^2$', '$5^2+12^2=13^2$'], answer: 0, why: 'Keep $x$ and $y$ as letters. Next time we differentiate, then use 5 and 12.', traps: { 1: 'x is fixed at 5 there, so it can no longer change.', 2: 'y is fixed at 12 there, so it can no longer change.', 3: 'Everything is a number: nothing changes, so nothing has a rate.' } } }
        ] },
      summary: ['Quantities in a story change with time, so each one has a rate, like $\\dfrac{dr}{dt}$.', 'Growing means a positive rate. Shrinking means a negative rate.', 'One link equation joins the changing quantities. Only numbers that never change go in it.', 'Numbers true at one moment (like $r=10$) wait until the last move.']
    },

    skills: [
      /* link: pick the true equation. Band 1 one shape; band 2 adds a can, a rectangle and a ladder, with the moment in the story; band 3 cars and a plane. */
      { id: 'link', title: 'Pick the link equation', gen: function (b, r) {
        b = Math.min(b, 3);
        var pool = LINK.filter(function (c) { return c.b === b || (b === 3 && c.b >= 2) || (b === 2 && c.b <= 2 && c.b >= 1 && r() < 0.5); }); if (!pool.length) pool = LINK;
        var c = pick(r, pool), m = INT(r, 3, 9), moment = b >= 2, line = c.line + (moment ? ' At one moment $' + c.mv + '=' + m + '$ ' + c.mu + '.' : ''), opts = [c.right], msgs = [''];
        if (moment) { opts.push(c.plug(m)); msgs.push(PLUGMSG); }
        c.wrong.forEach(function (w, i) { if (opts.length < 4) { opts.push(w); msgs.push(i === 0 ? 'That is a different formula. Check which shape the story describes.' : 'Not this one. Check which shape the story describes, and what each letter means.'); } });
        var mx = mix(r, opts, msgs), kinds = mx.options.map(function (o) { return o === c.right ? 'true' : (moment && o === c.plug(m) ? 'plug' : 'other'); });
        return { type: 'choice', data: { right: mx.answer, kinds: kinds, ctx: c.right, moment: moment }, prompt: line + ' Which equation links the changing quantities?', options: mx.options, answer: mx.answer, why: mx.why,
          hint: 'Step card: (1) name the shape, (2) write its equation, (3) keep every changing quantity as a letter. First step: the story is about ' + (c.right.indexOf('x^2') >= 0 ? 'a right triangle' : 'one shape') + '. Same move: for a circle’s area the equation is $A=\\pi r^2$.',
          worked: c.note + ' So the link is ' + c.right + (moment ? ', and the ' + m + ' waits for the last move.' : '.') };
      } },

      /* given: which rate is given and which is wanted. */
      { id: 'given', title: 'Given and wanted', gen: function (b, r) {
        b = Math.min(b, 3);
        var C1 = [
          { line: 'A circular puddle’s radius grows {v} cm every second. How fast is its area growing when the radius is {m} cm?', g: ['r', 't', 'dr/dt', 1], w: ['A', 't'], mv: 'r' },
          { line: 'A balloon is being filled so that its volume grows {v} cm³ every second. How fast is its radius growing when the radius is {m} cm?', g: ['V', 't', 'dV/dt', 1], w: ['r', 't'], mv: 'r' },
          { line: 'An ice cube’s edge shrinks {v} mm every minute as it melts. How fast is its volume changing when the edge is {m} mm?', g: ['s', 't', 'ds/dt', -1], w: ['V', 't'], mv: 's' }
        ], C2 = [
          { line: 'A ladder’s foot slides away from a wall at {v} ft/s. How fast is the top falling when the foot is {m} ft from the wall?', g: ['x', 't', 'dx/dt', 1], w: ['y', 't'], mv: 'x' },
          { line: 'Sand pours onto a pile so that its volume grows {v} ft³ each minute. How fast is the height growing when the height is {m} ft?', g: ['V', 't', 'dV/dt', 1], w: ['h', 't'], mv: 'h' }
        ], C3 = [
          { line: 'Water drains from a tank at {v} gallons per minute. How fast is the depth falling when the depth is {m} ft?', g: ['V', 't', 'dV/dt', -1], w: ['h', 't'], mv: 'h' },
          { line: 'The top of a ladder slides down a wall at {v} ft/s. How fast is the foot moving out when the foot is {m} ft from the wall?', g: ['y', 't', 'dy/dt', -1], w: ['x', 't'], mv: 'x' }
        ], c = pick(r, b === 1 ? C1 : b === 2 ? C2 : C3), v = INT(r, 2, 6), m = INT(r, 3, 12), gsym = c.g[2], wsym = 'd' + c.w[0] + '/dt', sign = c.g[3], gv = sign * v;
        if (m === v) m += 1;
        var fmt = function (s) { var p = s.split('/'); return '\\dfrac{' + p[0] + '}{' + p[1] + '}'; };
        var right = 'Given $' + fmt(gsym) + '=' + gv + '$. Want $' + fmt(wsym) + '$.', swap = 'Given $' + fmt(wsym) + '=' + gv + '$. Want $' + fmt(gsym) + '$.', mom = 'Given $' + fmt(gsym) + '=' + m + '$. Want $' + fmt(wsym) + '$.', sgn = 'Given $' + fmt(gsym) + '=' + (-gv) + '$. Want $' + fmt(wsym) + '$.';
        var mx = mix(r, [right, swap, mom, sgn], ['', 'You swapped them. The rate in the story is given, and the other is wanted.', 'The ' + m + ' is the value of $' + c.mv + '$ at one moment. It is not a rate.', 'Check the sign. Growing is positive and shrinking is negative.']);
        return { type: 'choice', data: { g: gsym, w: wsym, gv: gv, m: m, sign: sign, right: mx.answer }, prompt: c.line.replace('{v}', v).replace('{m}', m) + ' Which line sets it up?', options: mx.options, answer: mx.answer, why: mx.why,
          hint: 'Step card: (1) underline the rate you are TOLD, (2) underline what you are ASKED, (3) check the sign. First step: the rate you are told has a speed word like “grows” or “falls” and a number per unit of time. Same move: “radius grows 2 ft/s” gives $\\dfrac{dr}{dt}=2$.',
          worked: 'The rate we are told is $' + fmt(gsym) + '=' + gv + '$ (' + (sign > 0 ? 'growing, so positive' : 'shrinking, so negative') + '). The rate we are asked for is $' + fmt(wsym) + '$. The ' + m + ' is only for the last move.' };
      } },

      /* sign: write the rate with the right sign. */
      { id: 'sign', title: 'Sign of a rate', gen: function (b, r) {
        b = Math.min(b, 3);
        var C1 = [['The water in a pool is rising {v} cm each minute.', 'h', 1], ['A snowman’s height is shrinking {v} cm each hour.', 'h', -1], ['A puddle’s area is growing {v} square feet each minute.', 'A', 1], ['A balloon is losing {v} cubic inches of air each second.', 'V', -1]],
          C2 = [['A tank is being drained at {v} gallons per minute.', 'V', -1], ['A tree is growing {v} inches each year.', 'h', 1], ['A candle is burning down {v} cm each hour.', 'h', -1], ['A battery’s charge is falling {v} percent each hour.', 'E', -1]],
          C3 = [['The top of a ladder slides down the wall at {v} ft/s.', 'y', -1], ['The foot of a ladder slides away from a wall at {v} ft/s.', 'x', 1], ['A car is getting closer to an intersection at {v} mph. Its distance $d$ to it is…', 'd', -1], ['A shadow is getting longer by {v} ft each second.', 's', 1]],
          c = pick(r, b === 1 ? C1 : b === 2 ? C2 : C3), v = INT(r, 2, 8), q = c[1], dir = c[2], sv = dir * v, rate = function (n) { return '$\\dfrac{d' + q + '}{dt}=' + n + '$'; };
        var mx = mix(r, [rate(sv), rate(-sv), '$' + q + '=' + sv + '$', '$\\dfrac{dt}{d' + q + '}=' + sv + '$'], ['', 'Check the sign. ' + (dir > 0 ? 'Growing' : 'Shrinking') + ' makes the rate ' + (dir > 0 ? 'positive' : 'negative') + '.', 'That says the quantity IS ' + sv + '. A rate has the form $\\dfrac{d' + q + '}{dt}$.', 'That is upside down. A rate of $' + q + '$ is $\\dfrac{d' + q + '}{dt}$.']);
        return { type: 'choice', data: { sym: q, dir: dir, v: v, right: mx.answer }, prompt: c[0].replace('{v}', v) + ' Which line writes its rate?', options: mx.options, answer: mx.answer, why: mx.why,
          hint: 'Step card: (1) which quantity is it, (2) is it growing or shrinking, (3) growing is positive, shrinking is negative. First step: the quantity is $' + q + '$, and it is ' + (dir > 0 ? 'growing' : 'shrinking') + '. Same move: “a puddle shrinks 3 ft² per minute” gives $\\dfrac{dA}{dt}=-3$.',
          worked: 'The quantity is $' + q + '$ and it is ' + (dir > 0 ? 'growing, so the rate is positive' : 'shrinking, so the rate is negative') + ': ' + rate(sv) + '.' };
      } },

      /* hold: which numbers may go into the link equation now. */
      { id: 'hold', title: 'What goes in the equation now?', gen: function (b, r) {
        b = Math.min(b, 3);
        var m = INT(r, 4, 9), M = [
          { b: 1, link: '$A=\\pi r^2$', line: 'A puddle’s radius is growing. Right now $r=' + m + '$ cm.', keep: 'Only $\\pi$ (it never changes). Not $r=' + m + '$.', vary: 'r' },
          { b: 1, link: '$V=\\tfrac43\\pi r^3$', line: 'A balloon is being filled. Right now $r=' + m + '$ cm.', keep: 'Only $\\tfrac43$ and $\\pi$. Not $r=' + m + '$.', vary: 'r' },
          { b: 2, link: '$x^2+y^2=13^2$', line: 'A 13 ft ladder is sliding. Right now $x=5$ ft and $y=12$ ft.', keep: 'Only the 13. Not $x=5$ and not $y=12$.', vary: 'x and y' },
          { b: 2, link: '$V=\\pi r^2h$', line: 'A can has a fixed radius 4 cm and water of changing depth. Right now $h=' + m + '$ cm.', keep: 'The fixed radius and $\\pi$. Not $h=' + m + '$.', vary: 'h' },
          { b: 3, link: '$x^2+3^2=s^2$', line: 'A plane flies level at 3 miles. Right now $x=4$ miles and $s=5$ miles.', keep: 'Only the height 3. Not $x=4$ and not $s=5$.', vary: 'x and s' },
          { b: 3, link: '$z^2=x^2+y^2$', line: 'Two cars leave a corner, one east and one north. Right now $x=30$ and $y=40$ miles.', keep: 'Nothing here is fixed. Not $x=30$, not $y=40$, not $z=50$.', vary: 'x, y and z' }
        ], pool = M.filter(function (c) { return c.b <= b && c.b >= Math.max(1, b - 1); }), c = pick(r, pool);
        var mx = mix(r, [c.keep, 'Every number in the story, including the one for this moment.', 'Nothing at all, not even $\\pi$ or the 13.', 'The rates too, like $\\dfrac{dr}{dt}$.'], ['', 'The number for this moment is true only now. Putting it in early removes a quantity that is supposed to change.', 'Numbers that never change (like $\\pi$ or a fixed length) are fine in the equation.', 'Rates come in after we differentiate, not in the link equation.']);
        return { type: 'choice', data: { keep: c.keep, right: mx.answer, vary: c.vary }, prompt: c.line + ' The link is ' + c.link + '. What may go into this equation BEFORE we differentiate?', options: mx.options, answer: mx.answer, why: mx.why,
          hint: 'Step card: ask of each number, “does it ever change in this story?” If it never changes, it may stay as a number. If it changes, keep the letter. First step: here ' + c.vary + ' change(s). Same move: a 13 ft ladder’s 13 never changes, but its foot distance does.',
          worked: 'Changing quantities stay as letters until the last move. ' + c.keep };
      } }
    ],

    misconceptions: [
      { say: 'Put r = 10 into A = πr² first.', fix: 'Keep r as a letter. 10 is true only at one moment, so it waits for the last move.' },
      { say: 'The rate is the same as the quantity (r = 2 means dr/dt = 2).', fix: 'dr/dt says how fast r changes. r is how big it is.' },
      { say: 'A shrinking quantity has a positive rate.', fix: 'Shrinking means the rate is negative.' },
      { say: 'Using the area of a circle for the circumference (or the reverse).', fix: 'Area is πr². The distance around is 2πr.' },
      { say: 'Putting a changing number (like the foot distance) into the link equation.', fix: 'Only numbers that never change (like the ladder length) may go in.' }
    ]
    /* no pacing: the lesson has no clock, no trim, no skip and no end mark */
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = SPEC; else (root.SPECS = root.SPECS || {})[SPEC.id] = SPEC;
})(typeof window !== 'undefined' ? window : globalThis);
