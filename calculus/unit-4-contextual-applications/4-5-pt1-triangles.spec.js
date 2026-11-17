/* SPEC (calculus 4.5 part 1): solving related rates on right triangles: ladders, two cars, a level plane. Visual tutorial, no huddle.
   Test data (tests/unit/related-rates-triangles.test.js recomputes each answer by stepping time):
     missing  data.kind ('ladder'|'cars'|'plane'), the two known sides and the wanted side.
     ladder   data.mode ('foot'|'top'), x, y, L and the given rate.
     cars     data.mode ('leave'|'mixed'|'plane'), numbers and the sign of each rate.
     signs    data.dir and data.q. */
(function (root) {
  'use strict';
  var INT = function (r, a, b) { return a + Math.floor(r() * (b - a + 1)); };
  var pick = function (r, arr) { return arr[Math.floor(r() * arr.length)]; };
  var shuffle = function (r, arr) { var a = arr.slice(), i, j, t; for (i = a.length - 1; i > 0; i--) { j = Math.floor(r() * (i + 1)); t = a[i]; a[i] = a[j]; a[j] = t; } return a; };
  function mix(r, opts, msgs) { var order = shuffle(r, opts.map(function (_, i) { return i; })); return { options: order.map(function (i) { return opts[i]; }), answer: order.indexOf(0), why: order.map(function (i) { return msgs && msgs[i] ? msgs[i] : ''; }) }; }
  var round2 = function (x) { return Math.round(x * 100) / 100; };
  var TRI = [[3, 4, 5], [5, 12, 13], [8, 15, 17], [6, 8, 10], [9, 12, 15], [7, 24, 25]];
  var fmt = function (n) { return String(round2(n)); };

  var SPEC = {
    id: '4-5-pt1-triangles', course: 'calc', unit: 'Unit 4 · Contextual Applications of Differentiation', title: '4.5 Part 1 · Solving Related Rates: Ladders and Distances',
    selfPaced: true,
    question: 'How do I solve a related-rates problem when the link is a right triangle?',
    targets: ['I can find the missing side of the triangle at the moment.', 'I can solve a ladder problem for the wanted rate.', 'I can solve a two-moving-objects distance problem, with the sign of each rate.'],
    tabs: ['Warm-up', 'Predict', 'Concept (pictures)', 'I do (watch)', 'You do', 'Practice', 'Check', 'Wrap-up'],
    buildTarget: 'I can solve a related-rates problem built on a right triangle.',
    concepts: [
      { title: 'The triangle link', points: ['$x^2+y^2=z^2$ ties the three sides.', 'Differentiate in $t$: $2x\\,x\'+2y\\,y\'=2z\\,z\'$.'], eq: 'x² + y² = z²' },
      { title: 'Missing side', points: ['At the moment you know two sides.', 'Get the third from the link before plugging in rates.'], eq: 'find z first' },
      { title: 'Toward and away', points: ['Moving toward a point: the distance shrinks, so the rate is negative.', 'Moving away: positive.'], eq: '± sign' }
    ],
    review: [
      { id: 'R1', title: 'Review 1', prompt: 'In $x^2+y^2=13^2$, if $x=5$ then $y=$…', options: ['12', '8', '144', '18'], answer: 0, why: '$y^2=169-25=144$, so $y=12$.' },
      { id: 'R2', title: 'Review 2', prompt: '$\\dfrac{d}{dt}(x^2)$ equals…', options: ['$2x\\dfrac{dx}{dt}$', '$2x$', '$x^2\\dfrac{dx}{dt}$', '$2\\dfrac{dx}{dt}$'], answer: 0, why: 'Power rule, then the chain factor.' },
      { id: 'R3', title: 'Review 3', prompt: 'A car is driving toward an intersection. Its distance to the intersection has a rate that is…', options: ['negative', 'positive', 'zero', 'impossible to tell'], answer: 0, why: 'The distance is getting smaller, so its rate is negative.' }
    ],
    predicts: [
      { id: 'P1', title: 'The ladder', prompt: 'A ladder’s foot is pulled away from a wall at a steady speed. The top of the ladder slides down…', options: ['slowly at first, then faster and faster', 'at the same steady speed', 'fast at first, then slower', 'not at all'], answer: 0, why: 'When the foot is close to the wall, the ladder is almost straight up, so the top barely moves. Near the end it drops fast.' },
      { id: 'P2', title: 'Two cars', prompt: 'One car drives east at 30 mph and another drives north at 40 mph from the same corner. The distance between them grows at…', options: ['50 mph', '70 mph', '10 mph', '35 mph'], answer: 0, why: 'The distance is the long side of a triangle, so it grows slower than $30+40=70$. The tutorial shows it is 50 mph.' }
    ],

    tutorial: {
      moves: ['Draw and name', 'List what you know and want', 'Link with one equation', 'Differentiate in t', 'Plug in last'],
      concept: { title: 'Right triangles that change shape', target: 'I can say how the sides of a changing right triangle depend on each other.', frames: [
        { head: 'The sides trade off', show: 'ladder', st: { L: 5, x: 3 }, guide: 'A 5 ft ladder. $x$ is the foot, $y$ is the top. Slide $x$ and watch $y$. The ladder length never changes.',
          say: 'As the foot slides out, the top comes down. The ladder length stays 5 ft.',
          ask: { type: 'num', prompt: 'The foot is $x=4$ ft from the wall on the 5 ft ladder. How high is the top?', answer: 3, unit: 'ft', tol: 0, abs: 0.001, hint: '$4^2+y^2=5^2$, so $y^2=9$.', why: '$y^2=25-16=9$, so $y=3$ ft.' } },
        { head: 'The top barely moves at first', show: 'ladder', st: { L: 5, x: 1, rates: true }, guide: 'Slide $x$ from 1 to 4 and compare how far $y$ drops for each 1 ft of $x$.',
          say: 'When $x$ is small, a 1 ft move of the foot drops the top only a little. Near the end the same move drops it far.',
          ask: { type: 'choice', prompt: 'With the foot moving at a steady speed, the top falls…', options: ['slowly at first and faster later', 'at a steady speed', 'fast at first and slower later', 'not at all'], answer: 0, why: 'For $x$ from 1 to 2, $y$ drops 0.1. From 3 to 4, $y$ drops 1.' } },
        { head: 'The rates are tied by the link', show: 'ladder', st: { L: 5, x: 3, snap: true, rates: true }, guide: 'Foot $x=3$, top $y=4$. Red arrows: the foot goes out, the top goes down.',
          say: 'Differentiate $x^2+y^2=25$ in time: $2x\\dfrac{dx}{dt}+2y\\dfrac{dy}{dt}=0$. So $\\dfrac{dy}{dt}=-\\dfrac{x}{y}\\dfrac{dx}{dt}$.',
          ask: { type: 'choice', prompt: 'Why does $\\dfrac{dy}{dt}$ come out negative when $\\dfrac{dx}{dt}$ is positive?', options: ['The foot goes out while the top comes down.', 'Because $y$ is bigger than $x$.', 'Because the ladder is 5 ft.', 'It is a coincidence.'], answer: 0, why: 'The minus sign says $y$ shrinks while $x$ grows.', traps: { 1: 'The sign comes from the equation: the two terms must add to 0.' } } },
        { head: 'Which side is bigger changes the speed', show: 'ladder', st: { L: 5, x: 4, snap: true, rates: true }, guide: 'Now the foot is $x=4$ and the top is $y=3$.',
          say: 'The ratio $\\dfrac{x}{y}$ is the speed ratio. Here $\\dfrac43$ means the top falls faster than the foot moves.',
          ask: { type: 'num', prompt: 'At $x=4$, $y=3$ with $\\dfrac{dx}{dt}=3$ ft/s, find $\\dfrac{dy}{dt}=-\\dfrac{x}{y}\\dfrac{dx}{dt}$.', answer: -4, unit: 'ft/s', tol: 0, abs: 0.001, hint: 'Multiply $\\dfrac{4}{3}$ by 3, then add the minus sign.', why: '$-\\dfrac43\\times3=-4$ ft/s.' } },
        { head: 'Two cars from one corner', show: 'cars', st: { a: 30, b: 40, t: 1 }, guide: 'The blue car goes east. The orange car goes north. The dashed red line $z$ is the distance between them. Slide the time.',
          say: 'The two roads meet at a right angle, so $x$, $y$ and $z$ form a right triangle.',
          ask: { type: 'choice', prompt: 'Which equation links $x$, $y$ and $z$?', options: ['$x^2+y^2=z^2$', '$x+y=z$', '$x^2+y^2=z$', '$x^2-y^2=z^2$'], answer: 0, why: '$z$ is the long side of the triangle.', traps: { 1: 'The straight line is shorter than the two roads added together.', 2: 'The $z$ is missing its square.' } } },
        { head: 'Both rates add in', show: 'cars', st: { a: 30, b: 40, t: 1, rates: true }, guide: 'Arrows show both cars moving away from the corner.',
          say: 'Differentiating gives $2x\\dfrac{dx}{dt}+2y\\dfrac{dy}{dt}=2z\\dfrac{dz}{dt}$. So $\\dfrac{dz}{dt}=\\dfrac{x\\dfrac{dx}{dt}+y\\dfrac{dy}{dt}}{z}$.',
          ask: { type: 'num', prompt: 'At $x=30$, $y=40$, $z=50$ with $\\dfrac{dx}{dt}=30$ and $\\dfrac{dy}{dt}=40$ mph, find $\\dfrac{dz}{dt}$.', answer: 50, unit: 'mph', tol: 0, abs: 0.001, hint: 'Top: $30\\cdot30+40\\cdot40$. Then divide by $z=50$.', why: '$(900+1600)/50=50$ mph.' } },
        { head: 'Toward is negative', show: 'cars', st: { a: 30, b: 40, t: 1 }, guide: 'Imagine the blue car turning around and driving back toward the corner.',
          say: 'If a car drives toward the corner, its distance $x$ shrinks, so $\\dfrac{dx}{dt}$ is negative.',
          ask: { type: 'choice', prompt: 'A car is 30 mi east of the corner and drives toward it at 20 mph. What is $\\dfrac{dx}{dt}$?', options: ['$-20$ mph', '$20$ mph', '$30$ mph', '$-30$ mph'], answer: 0, why: 'Toward means $x$ shrinks, so the rate is $-20$. The 30 is where the car is, not a rate.', traps: { 2: '30 is where the car is, not how fast it moves.' } } }
      ] },
      ido: { target: 'I can watch a ladder and a two-car problem solved in five moves and spot the common slip.',
        problem: 'A 10 ft ladder leans on a wall. The top slides down at 1.5 ft/s. How fast is the foot moving out when the top is 6 ft above the floor?',
        frames: [
          { head: 'Name and list', move: 'Moves 1 and 2 · Name and list', show: 'ladder', st: { L: 10, x: 8, snap: true, lab: { x: 'x', y: 'y', L: '10 ft' }, say: 'x and y change. The ladder stays 10 ft.' }, guide: 'A 10 ft ladder. $x$ is the foot, $y$ is the top.',
            say: 'The top is falling, so $\\dfrac{dy}{dt}$ is negative. We want the foot’s rate $\\dfrac{dx}{dt}$.', work: ['Given: $\\dfrac{dy}{dt}=-1.5$ ft/s', 'Want: $\\dfrac{dx}{dt}$ when $y=6$ ft'],
            ask: { type: 'choice', prompt: 'The top slides DOWN at 1.5 ft/s. How is that written?', options: ['$\\dfrac{dy}{dt}=-1.5$', '$\\dfrac{dy}{dt}=1.5$', '$y=-1.5$', '$\\dfrac{dx}{dt}=-1.5$'], answer: 0, why: 'Down means $y$ shrinks, so the rate is negative.', traps: { 1: 'The top is falling, so the sign is negative.', 3: 'The foot is the wanted rate. The top is given.' } } },
          { head: 'Link and differentiate', move: 'Moves 3 and 4 · Link and differentiate', show: 'ladder', st: { L: 10, x: 8, snap: true, rates: true, lab: { x: 'x', y: 'y', L: '10 ft' }, say: 'x grows, y shrinks.' }, guide: 'The red arrows show the foot moving out and the top moving down.',
            say: 'The link is the right triangle. The 10 is fixed, so its rate is 0.', work: ['Link: $x^2+y^2=10^2$', '$2x\\dfrac{dx}{dt}+2y\\dfrac{dy}{dt}=0$'],
            ask: { type: 'choice', prompt: 'Which line is the derivative in time?', options: ['$2x\\dfrac{dx}{dt}+2y\\dfrac{dy}{dt}=0$', '$2x+2y=0$', '$2x\\dfrac{dx}{dt}+2y\\dfrac{dy}{dt}=20$', '$x\\dfrac{dx}{dt}+y\\dfrac{dy}{dt}=0$'], answer: 0, why: 'Each square brings a 2 and its own rate. The 10 is fixed, so the right side is 0.', traps: { 1: 'Both chain factors are missing.', 2: 'The right side is a fixed number, so its rate is 0.', 3: 'Each square brings down a 2.' } } },
          { head: 'Find the missing side', move: 'Move 5 · Plug in last', show: 'ladder', st: { L: 10, x: 8, snap: true, lab: { x: 'x = ?', y: '6', L: '10 ft' }, say: 'At this moment y = 6.' }, guide: 'The moment: the top is 6 ft up. The foot distance is missing.',
            say: 'We need $x$ at this moment. Put $y=6$ in the link: $x^2+36=100$.', work: ['At $y=6$: $x^2=100-36=64$, so $x=8$'],
            ask: { type: 'num', prompt: 'When $y=6$ on the 10 ft ladder, find $x$.', answer: 8, unit: 'ft', tol: 0, abs: 0.001, hint: '$x^2+6^2=10^2$, so $x^2=64$.', why: '$x^2=100-36=64$, so $x=8$ ft.' } },
          { head: 'Plug in and solve', move: 'Move 5 · Plug in last', show: 'ladder', st: { L: 10, x: 8, snap: true, rates: true, lab: { x: '8', y: '6', L: '10 ft' }, say: 'x = 8, y = 6, dy/dt = -1.5' }, guide: 'All the moment’s numbers are in.',
            say: 'Put in $x=8$, $y=6$ and $\\dfrac{dy}{dt}=-1.5$. Solve for $\\dfrac{dx}{dt}$.', work: ['$2(8)\\dfrac{dx}{dt}+2(6)(-1.5)=0$', '$16\\dfrac{dx}{dt}=18$', '$\\dfrac{dx}{dt}=1.125$ ft/s'],
            ask: { type: 'num', prompt: 'Solve $16\\dfrac{dx}{dt}-18=0$ for $\\dfrac{dx}{dt}$.', answer: 1.125, unit: 'ft/s', tol: 0, abs: 0.001, hint: 'Add 18 to both sides, then divide by 16.', why: '$16\\dfrac{dx}{dt}=18$, so $\\dfrac{dx}{dt}=1.125$ ft/s. Positive: the foot is moving out.' } },
          { head: 'Problem 2: two cars', move: 'Moves 1 to 3 · Name, list, link', workClear: true, show: 'cars', st: { a: 30, b: 40, t: 2, rates: true }, guide: 'Two cars leave a corner: blue east, orange north. $z$ is the distance between them.',
            problem: 'One car drives east at 30 mph and another drives north at 40 mph from the same corner. How fast is the distance between them growing after 2 hours?',
            say: 'Both cars move away from the corner. We want $\\dfrac{dz}{dt}$.', work: ['Given: $\\dfrac{dx}{dt}=30$, $\\dfrac{dy}{dt}=40$ mph', 'Want: $\\dfrac{dz}{dt}$ at $t=2$ h', 'Link: $x^2+y^2=z^2$'],
            ask: { type: 'choice', prompt: 'After 2 hours, how far from the corner is each car?', options: ['$x=60$ mi, $y=80$ mi', '$x=30$ mi, $y=40$ mi', '$x=2$ mi, $y=2$ mi', '$x=60$ mi, $y=40$ mi'], answer: 0, why: 'Distance is speed times time: $30\\times2=60$ and $40\\times2=80$.' } },
          { head: 'Find z, then differentiate', move: 'Moves 4 and 5', show: 'cars', st: { a: 30, b: 40, t: 2 }, guide: 'At $t=2$: $x=60$, $y=80$ and $z$ is the long side.',
            say: 'First find $z$: $60^2+80^2=z^2$. Then differentiate: $x\\dfrac{dx}{dt}+y\\dfrac{dy}{dt}=z\\dfrac{dz}{dt}$.', work: ['$z^2=3600+6400=10000$, so $z=100$', '$60(30)+80(40)=100\\dfrac{dz}{dt}$', '$\\dfrac{dz}{dt}=\\dfrac{5000}{100}=50$ mph'],
            ask: { type: 'num', prompt: 'Find $z$ when $x=60$ and $y=80$.', answer: 100, unit: 'mi', tol: 0, abs: 0.001, hint: '$60^2+80^2=3600+6400$.', why: '$z^2=10000$, so $z=100$ mi.' } },
          { head: 'The common slip', slip: true, show: 'cars', st: { a: 30, b: 40, t: 2 }, guide: 'The red dashed line is shorter than the two roads added: $60+80=140$ is not 100.',
            say: 'Slip: finding $z$ by adding, $z=60+80=140$. The straight line is the long side of a triangle, so use $x^2+y^2=z^2$.', work: ['Wrong: $z=60+80=140$', 'Right: $z=\\sqrt{60^2+80^2}=100$'],
            ask: { type: 'choice', prompt: 'Which line should we use to find $z$?', options: ['$z=\\sqrt{x^2+y^2}$', '$z=x+y$', '$z=x^2+y^2$', '$z=xy$'], answer: 0, why: '$z$ is the long side, so take the square root of the sum of squares.', traps: { 1: 'The straight line is shorter than the two roads together.', 2: 'The square root is missing.' } } }
        ] },
      summary: ['The triangle link is $x^2+y^2=z^2$. Differentiating gives $2x\\,x\'+2y\\,y\'=2z\\,z\'$.', 'Find the third side from the link before plugging in the rates.', 'Toward means a negative rate. Away means a positive rate.', 'Ladders: the foot and top rates have opposite signs.']
    },

    skills: [
      { id: 'missing', title: 'Find the missing side', gen: function (b, r) {
        b = Math.min(b, 3);
        var T = pick(r, TRI), k = b === 1 ? 1 : INT(r, 1, 2), a = T[0] * k, c = T[1] * k, h = T[2] * k;
        if (b === 3 && r() < 0.5) { var hh = pick(r, [3, 4, 5, 6, 8]), xx = INT(r, 3, 12), ss = round2(Math.sqrt(hh * hh + xx * xx));
          return { type: 'num', tol: 0.005, data: { kind: 'plane', h: hh, x: xx, s: ss }, prompt: 'A plane flies level ' + hh + ' miles above the ground. It is ' + xx + ' miles along the ground from a station. Find its straight-line distance $s$ from the station. Give it to 2 decimal places.', answer: ss, unit: 'mi',
            hint: 'Step card: (1) the height and the ground distance are the two shorter sides, (2) square both and add, (3) take the square root. First step: ' + hh + '² + ' + xx + '². Same move: sides 3 and 4 give $\\sqrt{9+16}=5$.', worked: '$s^2=' + hh + '^2+' + xx + '^2=' + (hh * hh + xx * xx) + '$, so $s=' + ss + '$ mi.' }; }
        if (r() < 0.5) return { type: 'num', tol: 0, abs: 0.001, data: { kind: 'ladder', L: h, x: a, y: c }, prompt: 'A ' + h + ' ft ladder leans on a wall. The foot is ' + a + ' ft from the wall. How high is the top?', answer: c, unit: 'ft',
          hint: 'Step card: (1) the ladder is the long side, (2) subtract the squares, (3) take the square root. First step: ' + h + '² − ' + a + '². Same move: a 5 ft ladder with foot 3 ft gives $\\sqrt{25-9}=4$.', worked: '$y^2=' + h + '^2-' + a + '^2=' + (h * h - a * a) + '$, so $y=' + c + '$ ft.' };
        return { type: 'num', tol: 0, abs: 0.001, data: { kind: 'cars', x: a, y: c, z: h }, prompt: 'Two cars leave a corner, one east and one north. They are now ' + a + ' miles and ' + c + ' miles from the corner. How far apart are they?', answer: h, unit: 'mi',
          hint: 'Step card: (1) the cars’ distances are the two short sides, (2) add the squares, (3) take the square root. First step: ' + a + '² + ' + c + '². Same move: 3 and 4 give $\\sqrt{25}=5$.', worked: '$z^2=' + a + '^2+' + c + '^2=' + (a * a + c * c) + '$, so $z=' + h + '$ mi.' };
      } },

      { id: 'ladder', title: 'Solve a ladder problem', gen: function (b, r) {
        b = Math.min(b, 3);
        var T = pick(r, TRI), k = b === 1 ? 1 : INT(r, 1, 2), x = T[0] * k, y = T[1] * k, L = T[2] * k, v = INT(r, 1, 4), ans;
        if (b === 3) { L = pick(r, [10, 12, 15, 20]); x = INT(r, 3, Math.floor(L * 0.7)); y = round2(Math.sqrt(L * L - x * x)); var ys = Math.sqrt(L * L - x * x); ans = round2(-x * v / ys);
          return { type: 'num', tol: 0.005, data: { mode: 'foot', x: x, y: ys, L: L, v: v }, prompt: 'A ' + L + ' ft ladder slides away from a wall. The foot moves out at ' + v + ' ft/s. How fast is the top falling when the foot is ' + x + ' ft from the wall? Give $\\dfrac{dy}{dt}$ to 2 decimal places.', answer: ans, unit: 'ft/s',
            hint: 'Step card: (1) find $y$ from $x^2+y^2=' + L + '^2$, (2) differentiate: $2x\\dfrac{dx}{dt}+2y\\dfrac{dy}{dt}=0$, (3) solve for $\\dfrac{dy}{dt}$. First step: $y=\\sqrt{' + (L * L) + '-' + (x * x) + '}\\approx' + y + '$. Same move: $x=3$, $y=4$, $\\dfrac{dx}{dt}=1$ gives $-0.75$.',
            worked: '$y=\\sqrt{' + (L * L - x * x) + '}\\approx' + y + '$. Then $\\dfrac{dy}{dt}=-\\dfrac{x}{y}\\dfrac{dx}{dt}=-\\dfrac{' + x + '}{' + y + '}(' + v + ')=' + ans + '$ ft/s.' }; }
        if (b === 1) { ans = round2(-x * v / y);
          return { type: 'num', tol: 0.005, data: { mode: 'foot', x: x, y: y, L: L, v: v }, prompt: 'A ' + L + ' ft ladder slides away from a wall. The foot moves out at ' + v + ' ft/s. How fast is the top falling when the foot is ' + x + ' ft from the wall and the top is ' + y + ' ft up? Give $\\dfrac{dy}{dt}$ to 2 decimal places.', answer: ans, unit: 'ft/s',
            hint: 'Step card: (1) differentiate: $2x\\dfrac{dx}{dt}+2y\\dfrac{dy}{dt}=0$, (2) put in $x=' + x + '$, $y=' + y + '$, $\\dfrac{dx}{dt}=' + v + '$, (3) solve for $\\dfrac{dy}{dt}$. First step: $2(' + x + ')(' + v + ')+2(' + y + ')\\dfrac{dy}{dt}=0$. Same move: $2(3)(1)+2(4)\\dfrac{dy}{dt}=0$ gives $-0.75$.',
            worked: '$' + (2 * x * v) + '+' + (2 * y) + '\\dfrac{dy}{dt}=0$, so $\\dfrac{dy}{dt}=-' + (2 * x * v) + '/' + (2 * y) + '=' + ans + '$ ft/s.' }; }
        ans = round2(y * v / x);
        return { type: 'num', tol: 0.005, data: { mode: 'top', x: x, y: y, L: L, v: v }, prompt: 'A ' + L + ' ft ladder leans on a wall. The top slides down at ' + v + ' ft/s. How fast is the foot moving out when the top is ' + y + ' ft up and the foot is ' + x + ' ft from the wall? Give $\\dfrac{dx}{dt}$ to 2 decimal places.', answer: ans, unit: 'ft/s',
          hint: 'Step card: (1) the top slides DOWN, so $\\dfrac{dy}{dt}=-' + v + '$, (2) differentiate: $2x\\dfrac{dx}{dt}+2y\\dfrac{dy}{dt}=0$, (3) solve for $\\dfrac{dx}{dt}$. First step: $2(' + x + ')\\dfrac{dx}{dt}+2(' + y + ')(-' + v + ')=0$. Same move: $2(4)\\dfrac{dx}{dt}+2(3)(-1)=0$ gives $0.75$.',
          worked: '$' + (2 * x) + '\\dfrac{dx}{dt}-' + (2 * y * v) + '=0$, so $\\dfrac{dx}{dt}=' + ans + '$ ft/s. Positive: the foot is moving out.' };
      } },

      { id: 'cars', title: 'Solve a distance problem', gen: function (b, r) {
        b = Math.min(b, 3);
        if (b === 1) { var a = pick(r, [30, 40, 50, 60]), c = pick(r, [30, 40, 50, 60]), t = INT(r, 1, 3), x = a * t, y = c * t, z = Math.sqrt(x * x + y * y), ans = round2((x * a + y * c) / z);
          return { type: 'num', tol: 0.005, data: { mode: 'leave', a: a, c: c, t: t }, prompt: 'Two cars leave a corner, one east at ' + a + ' mph and one north at ' + c + ' mph. How fast is the distance between them growing after ' + t + ' hour' + (t > 1 ? 's' : '') + '? Give it to 2 decimal places.', answer: ans, unit: 'mph',
            hint: 'Step card: (1) find $x$ and $y$ after ' + t + ' h, (2) find $z$ from $x^2+y^2=z^2$, (3) use $z\\dfrac{dz}{dt}=x\\dfrac{dx}{dt}+y\\dfrac{dy}{dt}$. First step: $x=' + a + '\\times' + t + '=' + x + '$ and $y=' + c + '\\times' + t + '=' + y + '$. Same move: speeds 3 and 4 after 1 h give $z=5$ and $\\dfrac{dz}{dt}=(9+16)/5=5$.',
            worked: '$x=' + x + '$, $y=' + y + '$, $z=' + round2(z) + '$. $\\dfrac{dz}{dt}=\\dfrac{' + x + '(' + a + ')+' + y + '(' + c + ')}{' + round2(z) + '}=' + ans + '$ mph.' }; }
        if (b === 2) { var T = pick(r, [[3, 4, 5], [6, 8, 10], [9, 12, 15]]), xs = INT(r, 20, 60), ys = INT(r, 20, 60), ans2 = round2((T[0] * -xs + T[1] * ys) / T[2]);
          return { type: 'num', tol: 0.005, data: { mode: 'mixed', x: T[0], y: T[1], z: T[2], xs: -xs, ys: ys }, prompt: 'A car is ' + T[0] + ' miles east of a corner and drives toward it at ' + xs + ' mph. A second car is ' + T[1] + ' miles north of the corner and drives away from it at ' + ys + ' mph. How fast is the distance between them changing? Give $\\dfrac{dz}{dt}$ to 2 decimal places.', answer: ans2, unit: 'mph',
            hint: 'Step card: (1) toward means $\\dfrac{dx}{dt}=-' + xs + '$, (2) away means $\\dfrac{dy}{dt}=+' + ys + '$, (3) $z\\dfrac{dz}{dt}=x\\dfrac{dx}{dt}+y\\dfrac{dy}{dt}$ with $z=' + T[2] + '$. First step: write the sign of each rate. Same move: $x=3$ toward at 10 gives $\\dfrac{dx}{dt}=-10$.',
            worked: '$' + T[2] + '\\dfrac{dz}{dt}=' + T[0] + '(-' + xs + ')+' + T[1] + '(' + ys + ')$, so $\\dfrac{dz}{dt}=' + ans2 + '$ mph' + (ans2 < 0 ? ' (the cars are getting closer).' : ' (the cars are getting farther apart).') }; }
        var P = pick(r, [[3, 4, 5], [5, 12, 13], [4, 3, 5], [8, 6, 10]]), hh = P[0], xx = P[1], ss = P[2], sp = INT(r, 2, 5) * 100, ans3 = round2(xx * sp / ss);
        return { type: 'num', tol: 0.005, data: { mode: 'plane', h: hh, x: xx, s: ss, v: sp }, prompt: 'A plane flies level ' + hh + ' miles up at ' + sp + ' mph, moving away from a station. When it is ' + xx + ' miles along the ground, how fast is its distance $s$ from the station growing? Give it to 2 decimal places.', answer: ans3, unit: 'mph',
          hint: 'Step card: (1) the link is $x^2+' + hh + '^2=s^2$ and the ' + hh + ' is fixed, (2) differentiate: $2x\\dfrac{dx}{dt}=2s\\dfrac{ds}{dt}$, (3) the missing side is $s=' + ss + '$. First step: put in $x=' + xx + '$, $s=' + ss + '$ and $\\dfrac{dx}{dt}=' + sp + '$. Same move: $x=4$, $s=5$, $\\dfrac{dx}{dt}=10$ gives 8.',
          worked: '$' + (2 * xx) + '(' + sp + ')=' + (2 * ss) + '\\dfrac{ds}{dt}$, so $\\dfrac{ds}{dt}=' + ans3 + '$ mph. It is less than the plane’s speed because part of the motion is not along the line to the station.' };
      } },

      { id: 'signs', title: 'Toward or away', gen: function (b, r) {
        b = Math.min(b, 3);
        var v = INT(r, 2, 9), C = [
          { b: 1, s: 'A car is driving toward an intersection at {v} mph. Its distance $x$ from the intersection changes at…', q: 'x', d: -1 },
          { b: 1, s: 'A runner moves away from a bus stop at {v} mph. Her distance $x$ from it changes at…', q: 'x', d: 1 },
          { b: 2, s: 'The top of a ladder slides down a wall at {v} ft/s. The height $y$ of the top changes at…', q: 'y', d: -1 },
          { b: 2, s: 'The foot of a ladder is pulled away from a wall at {v} ft/s. Its distance $x$ from the wall changes at…', q: 'x', d: 1 },
          { b: 3, s: 'Two ships sail toward each other. The distance $z$ between them shrinks by {v} km each hour. It changes at…', q: 'z', d: -1 },
          { b: 3, s: 'A plane flies away from a station. The distance $s$ between them grows {v} mph. It changes at…', q: 's', d: 1 }
        ], pool = C.filter(function (c) { return c.b === b; }), c = pick(r, pool), sv = c.d * v, rate = function (n) { return '$\\dfrac{d' + c.q + '}{dt}=' + n + '$'; };
        var mx = mix(r, [rate(sv), rate(-sv), '$' + c.q + '=' + sv + '$', '$' + c.q + '=' + (-sv) + '$'], ['', 'Check the sign. ' + (c.d > 0 ? 'Away makes it positive.' : 'Toward makes the distance shrink, so negative.'), 'That says the distance IS ' + sv + '. We need its rate.', 'That says the distance IS ' + (-sv) + '. We need its rate, and a distance is never negative.']);
        return { type: 'choice', data: { dir: c.d, q: c.q, v: v, right: mx.answer }, prompt: c.s.replace('{v}', v), options: mx.options, answer: mx.answer, why: mx.why,
          hint: 'Step card: (1) which distance is it, (2) does it get bigger or smaller, (3) bigger is positive, smaller is negative. First step: the distance is $' + c.q + '$ and it ' + (c.d > 0 ? 'gets bigger' : 'gets smaller') + '. Same move: driving away at 5 mph gives $\\dfrac{dx}{dt}=5$.',
          worked: 'The distance $' + c.q + '$ ' + (c.d > 0 ? 'grows, so its rate is positive' : 'shrinks, so its rate is negative') + ': ' + rate(sv) + '.' };
      } }
    ],

    misconceptions: [
      { say: 'z = x + y (adding the two legs).', fix: 'The straight line is the long side: z = √(x² + y²).' },
      { say: 'Use x = 5 in the link equation before differentiating.', fix: 'Differentiate first. Then put in 5.' },
      { say: 'The top of the ladder falls at the same speed the foot moves out.', fix: 'The speeds are tied by x/y. They are equal only when x = y.' },
      { say: 'A car driving toward the corner has a positive rate.', fix: 'Toward means the distance shrinks, so the rate is negative.' },
      { say: 'Forgetting to find the missing side before plugging in.', fix: 'Get the third side from x² + y² = z² first.' }
    ]
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = SPEC; else (root.SPECS = root.SPECS || {})[SPEC.id] = SPEC;
})(typeof window !== 'undefined' ? window : globalThis);
