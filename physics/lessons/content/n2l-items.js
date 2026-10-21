/* Newton's Second Law: question bank. Pure data and generators.
   Band 1 = foundation (middle-school register), 2 = core, 3 = honors, 4 = advanced (AP / first-year college).
   Numbers are seeded per student, so neighbors see different values. The correct option is always listed first;
   the engine shuffles the display order per student. Numeric items carry `chk`, an independent recomputation used by the
   machine check, never shown to students. */
(function () {
  'use strict';
  var G = 9.8;
  var N2L = window.N2L = window.N2L || {};
  function n(x, d) { return String(+Number(x).toFixed(d == null ? 2 : d)); }
  function pick(r, a) { return a[Math.floor(r() * a.length)]; }
  N2L.G = G;

  /* ---------- small drawings ---------- */
  function svgOpen(w, h) { return '<svg viewBox="0 0 ' + w + ' ' + h + '" xmlns="http://www.w3.org/2000/svg" role="img">'; }
  N2L.vtGraph = function (kind) {
    var p = { lin: 'M20,100 L150,30', jump: 'M20,100 L24,40 L150,40', level: 'M20,100 Q55,36 150,32', steep: 'M20,100 Q105,98 150,26' }[kind];
    return svgOpen(160, 112) + '<path d="M20,8 L20,100 L152,100" fill="none" stroke="#566878" stroke-width="1.5"/><path d="' + p + '" fill="none" stroke="#2b4fd9" stroke-width="3"/><text x="6" y="14" font-size="11" fill="#566878">v</text><text x="146" y="110" font-size="11" fill="#566878">t</text></svg>';
  };
  function fbd(forces, title) { return window.LE.fbdSVG({ forces: forces, title: title }); }
  N2L.fbd = fbd;

  /* ---------- warm-up (sets the starting band) ---------- */
  N2L.warm = [
    { id: 'W1', prompt: 'Two people push a crate on a level floor: one pushes 30 N east and the other pushes 12 N west. What is the net force on the crate?', options: ['18 N east', '42 N east', '18 N west', '360 N east'], answer: 0 },
    { id: 'W2', prompt: 'A cart’s velocity changes from 2 m/s to 10 m/s in 4 s. What is its acceleration?', options: ['2 m/s²', '8 m/s²', '3 m/s²', '32 m/s²'], answer: 0 },
    { id: 'W3', prompt: 'A puck slides at a constant 3 m/s on frictionless ice. What is the net force on it?', options: ['0 N', '3 N', 'It depends on the puck’s mass', 'Equal to its weight'], answer: 0 },
    { id: 'W4', prompt: 'On a velocity–time graph, a straight line rises from 0 m/s at t = 0 to 12 m/s at t = 3 s. What are the acceleration and the distance traveled in those 3 s?', options: ['4 m/s² and 18 m', '4 m/s² and 36 m', '12 m/s² and 18 m', '4 m/s² and 12 m'], answer: 0 },
    { id: 'W5', prompt: 'A spring stretches 3 cm when a 6 N force pulls on it. The stretch is proportional to the force. How far does it stretch under 10 N?', options: ['5 cm', '4 cm', '1.8 cm', '18 cm'], answer: 0 }
  ];
  N2L.bandFromWarm = function (correct) { return [1, 1, 2, 2, 3, 4][Math.max(0, Math.min(5, correct))]; };

  /* ---------- predictions (not graded until the huddle). The correct option is listed first. ---------- */
  N2L.preds = [
    { id: 'P1', title: 'A steady fan push',
      prompt: 'A fan pushes a cart from rest along a nearly frictionless track with a steady force. Which velocity–time graph shows the cart’s motion?',
      options: [{ svg: N2L.vtGraph('lin'), label: 'Graph A', desc: 'straight line rising from zero: steady acceleration' }, { svg: N2L.vtGraph('jump'), label: 'Graph B', desc: 'jumps to a speed, then flat' }, { svg: N2L.vtGraph('level'), label: 'Graph C', desc: 'rises, then levels off' }, { svg: N2L.vtGraph('steep'), label: 'Graph D', desc: 'rises faster and faster' }],
      correct: 0, grid: true },
    { id: 'P2', title: 'Double the force',
      prompt: 'Fan A pushes a 1.0 kg cart and gives it an acceleration of 0.50 m/s². Fan B pushes the same cart with twice the force. What acceleration does the cart get with fan B?',
      options: ['1.0 m/s²', '0.50 m/s²', '0.25 m/s²', '2.0 m/s²'], correct: 0 },
    { id: 'P3', title: 'Triple the mass',
      prompt: 'Fan A (acceleration 0.50 m/s² on a 1.0 kg cart) now pushes the same cart loaded up to a total mass of 3.0 kg. What is the acceleration?',
      options: ['0.17 m/s²', '0.50 m/s²', '1.5 m/s²', '0.25 m/s²'], correct: 0 }
  ];

  /* ---------- Name It: three registers ---------- */
  N2L.explain = {
    simple: [
      'The lab showed one pattern again and again. A bigger net force gives a bigger acceleration. A heavier object gets a smaller acceleration from the same push. And the acceleration points the same way as the net force.',
      '<b>Newton’s Second Law.</b> The acceleration of an object equals the net force on it divided by its mass: a = F ÷ m. Turned around, F = m × a. If you know two of the three numbers, you can find the third.',
      'A <b>newton</b> (N) is the force that gives a 1 kg object an acceleration of 1 m/s². <b>Weight</b> is the pull of gravity on an object: W = m × g, and on Earth g = 9.8 N for every kilogram. That is why every falling object speeds up by 9.8 m/s each second, whatever its mass.'],
    standard: [
      'The investigation changed one variable at a time. With the mass fixed, acceleration was proportional to the net force: double F, double a. With the force fixed, acceleration was inversely proportional to the mass: triple m, a third of the acceleration. Part C showed that the force that counts is the <i>net</i> force, the push minus friction. Part D showed that a connected system accelerates as one object, so every moving mass belongs in m.',
      '<b>Newton’s Second Law.</b> ΣF = ma. The net force on an object equals its mass times its acceleration, and the acceleration points in the direction of the net force. Solved for the acceleration, a = ΣF/m. The unit follows from the law: 1 N = 1 kg·m/s².',
      '<b>A constant net force produces a constant acceleration</b>, so the velocity changes steadily. It does not produce a constant speed. <b>Weight</b> is the gravitational force, W = mg. Mass is different: it measures how much the object resists acceleration, and it does not change from place to place. Because W is proportional to m, a free-falling object has a = W/m = g, whatever its mass. The first law is the special case ΣF = 0, a = 0.'],
    college: [
      'The general form of the law is ΣF = dp/dt with p = mv. For constant mass this reduces to ΣF = m dv/dt = ma. It is a vector equation, so it holds along each axis separately: ΣFx = max and ΣFy = may. The two proportionalities you measured, a ∝ F and a ∝ 1/m, together say ΣF = kma. The newton is defined so that k = 1.',
      'In ΣF = ma the mass is the <i>inertial</i> mass, the constant that connects net force to acceleration. The mass in W = mg is the <i>gravitational</i> mass. Experiments find them proportional to better than one part in 10¹³, which is why g does not depend on the falling body. In Part D the string tension was T = Mm<sub>h</sub>g/(M + m<sub>h</sub>), always less than the hanging weight m<sub>h</sub>g: the string can pull the cart only because the hanging mass is itself accelerating downward.',
      'The law holds as written only in an inertial frame, with ΣF made of real interactions. An elevator scale reading N = m(g + a) is the second law in the ground frame. In the elevator’s own accelerating frame the same reading is described as an effective gravity g + a. Setting ΣF = 0 recovers the first law and with it the definition of an inertial frame.']
  };
  N2L.regName = { simple: 'Plain words', standard: 'Standard', college: 'College level' };
  N2L.regForBand = function (b) { return b <= 1 ? 'simple' : (b >= 4 ? 'college' : 'standard'); };

  N2L.cloze = {
    1: { text: 'The {1} of an object depends on the net force and on the mass. A bigger net force gives a {2} acceleration. A bigger mass gives a {3} acceleration.',
      blanks: [['acceleration'], ['bigger', 'larger', 'greater', 'higher'], ['smaller', 'less', 'lower', 'slower']], bank: ['acceleration', 'bigger', 'smaller', 'velocity'],
      full: 'The acceleration of an object depends on the net force and on the mass. A bigger net force gives a bigger acceleration. A bigger mass gives a smaller acceleration.' },
    2: { text: 'Newton’s second law: ΣF = {1}. The acceleration points in the same direction as the {2} force. A force of 1 newton gives a 1 kg object an acceleration of {3} m/s².',
      blanks: [['ma', 'm a', 'm*a', 'm × a', 'mass times acceleration', 'mass × acceleration'], ['net', 'unbalanced', 'total'], ['1', 'one']],
      full: 'Newton’s second law: ΣF = ma. The acceleration points in the same direction as the net force. A force of 1 newton gives a 1 kg object an acceleration of 1 m/s².' },
    3: { text: 'The acceleration is a = ΣF / {1}. Doubling the net force {2} the acceleration. Doubling the mass {3} the acceleration.',
      blanks: [['m', 'mass'], ['doubles', 'double', 'multiplies by 2', 'makes it twice as big'], ['halves', 'halve', 'cuts in half', 'divides by 2', 'makes it half as big']],
      full: 'The acceleration is a = ΣF / m. Doubling the net force doubles the acceleration. Doubling the mass halves the acceleration.' },
    4: { text: 'In vector form ΣF = {1}. Along each axis, ΣFx = {2} and ΣFy = may. If ΣF = 0, this reduces to Newton’s {3} law.',
      blanks: [['ma', 'm a', 'm*a', 'dp/dt'], ['max', 'm ax', 'm*ax'], ['first', '1st', 'one']],
      full: 'In vector form ΣF = ma. Along each axis, ΣFx = max and ΣFy = may. If ΣF = 0, this reduces to Newton’s first law.' }
  };
  N2L.misc = {
    text: 'Many people think a bigger force gives a bigger {1}. In fact a net force produces an {2}, a change in velocity. A constant net force on a constant mass produces a constant acceleration, so the speed keeps {3}.',
    blanks: [['speed', 'velocity'], ['acceleration'], ['changing', 'increasing', 'growing', 'rising', 'speeding up', 'going up']],
    full: 'Many people think a bigger force gives a bigger speed. In fact a net force produces an acceleration, a change in velocity. A constant net force on a constant mass produces a constant acceleration, so the speed keeps increasing.'
  };

  N2L.vocab = [
    { id: 'accel', term: 'Acceleration', model: 'The rate at which velocity changes, a = Δv/Δt. It has a size and a direction.', bands: [1, 2, 3, 4], starter: 'Start with: “Acceleration is…”' },
    { id: 'net', term: 'Net force', model: 'The vector sum of all the forces on an object. It is the force that accelerates the object.', bands: [1, 2, 3, 4], starter: 'Start with: “The net force is…”' },
    { id: 'mass', term: 'Mass', model: 'The amount of matter in an object, and the measure of its inertia: how strongly it resists acceleration. It is measured in kilograms and does not change with location.', bands: [1, 2, 3, 4], starter: 'Start with: “Mass is…”' },
    { id: 'weight', term: 'Weight', model: 'The gravitational force on an object, W = mg. It is measured in newtons and changes with location.', bands: [2, 3, 4] },
    { id: 'newton', term: 'Newton (unit)', model: 'The SI unit of force: 1 N = 1 kg·m/s², the net force that gives a 1 kg mass an acceleration of 1 m/s².', bands: [2, 3, 4] },
    { id: 'inertialmass', term: 'Inertial mass', model: 'The constant m in ΣF = ma. As far as any experiment can tell, it equals the gravitational mass in W = mg.', bands: [4] }
  ];

  /* free-body diagrams: check the forces, then say which way the net force points */
  N2L.fbdScenes = [
    { id: 'F1', title: 'The fan cart speeding up to the right on a rough track', need: ['W', 'N', 'f', 'F'], net: 'right',
      forces: [{ dir: 'down', len: 46, label: 'W' }, { dir: 'up', len: 46, label: 'N' }, { dir: 'left', len: 20, label: 'f' }, { dir: 'right', len: 44, label: 'F' }],
      note: 'The push is bigger than friction, so ΣF = F − f points right and the cart speeds up.' },
    { id: 'F2', title: 'The same cart still moving right, after the fan is switched off', need: ['W', 'N', 'f'], net: 'left',
      forces: [{ dir: 'down', len: 46, label: 'W' }, { dir: 'up', len: 46, label: 'N' }, { dir: 'left', len: 30, label: 'f' }],
      note: 'Friction is the only horizontal force, and it points left. The net force points left while the cart still moves right, so the cart slows. Velocity and net force can point in opposite directions.' },
    { id: 'F3', title: 'A ball in free fall (ignore air)', need: ['W'], net: 'down',
      forces: [{ dir: 'down', len: 46, label: 'W' }],
      note: 'Weight is the only force, so the net force is W = mg, straight down, and a = W/m = g.' }
  ];
  N2L.fbdForces = [
    { k: 'W', t: 'Weight (gravity), pulling down' },
    { k: 'N', t: 'Normal force from the surface, pushing up' },
    { k: 'f', t: 'Friction, opposing the sliding' },
    { k: 'F', t: 'A forward push from a fan or hand' },
    { k: 'M', t: '“Force of motion,” pushing it forward' }
  ];
  N2L.netOptions = [
    { k: 'right', t: 'To the right (→)' }, { k: 'left', t: 'To the left (←)' }, { k: 'down', t: 'Downward (↓)' }, { k: 'zero', t: 'Zero: the forces cancel' }
  ];

  /* ---------- Try it: six skills, four difficulty bands each ---------- */
  function C(prompt, correct, others, hint, worked) { return { type: 'choice', prompt: prompt, options: [correct].concat(others), answer: 0, hint: hint, worked: worked }; }
  function NUM(prompt, answer, unit, hint, worked, tol, chk) { return { type: 'num', prompt: prompt, answer: answer, unit: unit, hint: hint, worked: worked, tol: tol == null ? 0.02 : tol, chk: chk }; }

  N2L.skills = [
    { id: 'N2-calc', title: 'Using F = ma', gen: function (b, r) {
      if (b === 1) { var a0 = pick(r, [2, 3, 4, 5, 6]), k0 = pick(r, [2, 3, 4]), kw = { 2: 'doubled', 3: 'tripled', 4: 'quadrupled' }[k0]; return C('A fan cart speeds up at ' + a0 + ' m/s². The fan force is now ' + kw + ' (same cart, same track). The new acceleration is:', (k0 * a0) + ' m/s²', [a0 + ' m/s²', n(a0 / k0) + ' m/s²', (k0 * k0 * a0) + ' m/s²'], 'Acceleration is proportional to the net force. What happens to a when F is multiplied by ' + k0 + '?', 'a = F/m. With m fixed, multiplying F by ' + k0 + ' multiplies a by ' + k0 + ': ' + k0 + ' × ' + a0 + ' = ' + (k0 * a0) + ' m/s².'); }
      if (b === 2) { var a2 = pick(r, [1.5, 2, 2.5, 3, 4]), m2 = pick(r, [2, 4, 6, 8, 10]), F2 = a2 * m2; return NUM('A net force of ' + n(F2) + ' N acts on a ' + m2 + ' kg crate on a smooth floor. What is the crate’s acceleration?', a2, 'm/s²', 'a = F ÷ m.', 'a = ΣF/m = ' + n(F2) + ' ÷ ' + m2 + ' = ' + n(a2) + ' m/s².', 0.02, F2 / m2); }
      if (b === 3) { var mg = pick(r, [200, 250, 400, 500]), F3 = pick(r, [0.4, 0.5, 0.8, 1.0, 1.2]), a3 = F3 / (mg / 1000); return NUM('A ' + mg + ' g puck is hit by a net force of ' + F3 + ' N. What is its acceleration?', a3, 'm/s²', 'Convert the mass to kilograms first.', mg + ' g = ' + n(mg / 1000, 3) + ' kg. a = ' + F3 + ' ÷ ' + n(mg / 1000, 3) + ' = ' + n(a3) + ' m/s².', 0.02, F3 * 1000 / mg); }
      var tr = pick(r, [[3, 4, 5], [5, 12, 13], [6, 8, 10], [8, 15, 17], [9, 12, 15]]), k = pick(r, [1, 2]), m4 = pick(r, [2.0, 2.5, 4.0, 5.0]), fe = tr[0] * k, fn = tr[1] * k, fr = tr[2] * k, a4 = fr / m4;
      return NUM('A ' + n(m4, 1) + ' kg puck on frictionless ice is pulled by two forces at once: ' + fe + ' N east and ' + fn + ' N north. How large is its acceleration?', a4, 'm/s²', 'Combine the perpendicular forces into one net force first, then divide by the mass.', 'ΣF = √(' + fe + '² + ' + fn + '²) = ' + fr + ' N. a = ΣF/m = ' + fr + ' ÷ ' + n(m4, 1) + ' = ' + n(a4) + ' m/s², in the direction of the net force.', 0.02, Math.sqrt(fe * fe + fn * fn) / m4);
    } },
    { id: 'N2-solve', title: 'Solving for force or mass', gen: function (b, r) {
      if (b === 1) { var mA = pick(r, [1, 2, 3, 4, 5]), q1 = pick(r, [2, 3, 4]), qw = { 2: 'twice', 3: 'three times', 4: 'four times' }[q1]; return C('Cart A has a mass of ' + mA + ' kg and cart B has a mass of ' + (q1 * mA) + ' kg. The same steady fan force pushes each from rest. Which statement is true?', 'Cart A accelerates ' + qw + ' as much as cart B.', ['Cart B accelerates ' + qw + ' as much as cart A.', 'They accelerate equally, because the force is the same.', 'Cart A accelerates ' + { 2: 'four times', 3: 'nine times', 4: 'sixteen times' }[q1] + ' as much as cart B.'], 'For a fixed force, a = F/m. Which cart has the smaller mass?', 'For the same F, a ∝ 1/m. Cart B has ' + qw + ' the mass, so it gets 1/' + q1 + ' the acceleration of cart A.'); }
      if (b === 2) { var m2 = pick(r, [3, 4, 5, 6, 8]), a2 = pick(r, [1.5, 2, 2.5, 3]), F2 = m2 * a2; return NUM('What net force gives a ' + m2 + ' kg cart an acceleration of ' + a2 + ' m/s²?', F2, 'N', 'F = m × a.', 'ΣF = ma = ' + m2 + ' × ' + a2 + ' = ' + n(F2) + ' N.', 0.02, a2 * m2); }
      if (b === 3) { var F3 = pick(r, [24, 30, 45, 60]), a3 = pick(r, [1.5, 2, 3, 4, 5]), m3 = F3 / a3; return NUM('A net force of ' + F3 + ' N gives a crate an acceleration of ' + a3 + ' m/s². What is the crate’s mass?', m3, 'kg', 'Rearrange ΣF = ma to solve for m.', 'm = ΣF/a = ' + F3 + ' ÷ ' + a3 + ' = ' + n(m3) + ' kg.', 0.02, F3 / a3); }
      var m1 = pick(r, [2, 3, 4]), mL = pick(r, [2, 3, 4, 6]), a1 = pick(r, [3, 4, 5, 6]), F = m1 * a1, a4 = F / (m1 + mL);
      return NUM('A steady push gives a ' + m1 + ' kg cart an acceleration of ' + a1 + ' m/s². A ' + mL + ' kg load is added to the cart. With the same push, what is the new acceleration?', a4, 'm/s²', 'You are not given the force. Find it from the first run, then use it with the new total mass.', 'F = m₁a₁ = ' + m1 + ' × ' + a1 + ' = ' + n(F) + ' N. New total mass ' + (m1 + mL) + ' kg, so a = F/m = ' + n(F) + ' ÷ ' + (m1 + mL) + ' = ' + n(a4) + ' m/s².', 0.02, a1 * m1 / (m1 + mL));
    } },
    { id: 'N2-weight', title: 'Mass and weight', gen: function (b, r) {
      if (b === 1) { var mm = pick(r, [50, 60, 70, 80, 90]), world = pick(r, ['the Moon', 'Mars', 'Mercury']); return C('An astronaut with a mass of ' + mm + ' kg walks on ' + world + ', where gravity is weaker than on Earth. Compared with Earth, her mass and her weight there are:', 'mass: ' + mm + ' kg (the same); weight: smaller', ['mass: smaller; weight: smaller', 'mass: ' + mm + ' kg (the same); weight: the same', 'mass: smaller; weight: the same'], 'Mass is the amount of matter. Weight is the pull of gravity. Which one depends on where you are?', 'Mass is the amount of matter, so it is ' + mm + ' kg everywhere. Weight is the gravitational force W = mg, and g is smaller on ' + world + '.'); }
      if (b === 2) { var m2 = pick(r, [3, 4, 5, 6, 7, 8, 9, 10, 12, 15, 18, 20, 25]); return NUM('What is the weight, in newtons, of a ' + m2 + ' kg backpack on Earth? Use g = 9.8 N/kg.', G * m2, 'N', 'W = m × g.', 'W = mg = ' + m2 + ' × 9.8 = ' + n(G * m2, 1) + ' N.', 0.015, m2 * 9.8); }
      if (b === 3) { var m3 = pick(r, [120, 150, 180, 200, 220, 250, 280, 300, 350, 400]), WE = G * m3; return NUM('A rover weighs ' + n(WE, 0) + ' N on Earth. The Moon’s gravity is 1.6 N/kg. What does the rover weigh on the Moon?', 1.6 * m3, 'N', 'Mass is the same everywhere. Find it from the Earth weight, then multiply by the Moon’s g.', 'm = W/g = ' + n(WE, 0) + ' ÷ 9.8 = ' + m3 + ' kg. On the Moon W = 1.6 × ' + m3 + ' = ' + n(1.6 * m3, 0) + ' N.', 0.015, WE / G * 1.6); }
      var m4 = pick(r, [50, 60, 70, 80]), a4 = pick(r, [1.0, 1.5, 2.0]), N4 = m4 * (G + a4);
      return NUM('A ' + m4 + ' kg student stands on a bathroom scale in an elevator that is speeding up upward at ' + n(a4, 1) + ' m/s². What force does the scale read? (The scale reads the normal force on her.)', N4, 'N', 'Two forces act: N up and mg down. Their difference is ma, and the acceleration is upward.', 'Take up as positive: N − mg = ma, so N = m(g + a) = ' + m4 + ' × (9.8 + ' + n(a4, 1) + ') = ' + n(N4, 0) + ' N. She feels heavier than her ' + n(m4 * G, 0) + ' N weight.', 0.015, m4 * G + m4 * a4);
    } },
    { id: 'N2-motion', title: 'From motion to force', gen: function (b, r) {
      if (b === 1) { var s = pick(r, [2, 3, 4, 5, 6]), thing = pick(r, ['cart', 'skateboard', 'toy train']); return C('A ' + thing + '’s speed increases by ' + s + ' m/s every second, steadily, along a straight track. What can you say about the net force on it?', 'It is constant and points forward.', ['It is zero, because the ' + thing + ' is already moving.', 'It keeps growing as the ' + thing + ' speeds up.', 'It points backward.'], 'The same change every second means a constant acceleration. What does ΣF = ma say about the force?', 'Steady speeding-up is a constant acceleration, so ΣF = ma is constant, and it points the way the velocity is increasing: forward.'); }
      if (b === 2) { var a2 = pick(r, [1.5, 2, 2.5, 3, 4]), t2 = pick(r, [2, 3, 4, 5]), m2 = pick(r, [2, 3, 4, 5]), v2 = a2 * t2; return NUM('A ' + m2 + ' kg cart starts from rest and reaches ' + n(v2) + ' m/s after ' + t2 + ' s of a steady push. What net force did it feel?', m2 * a2, 'N', 'Find the acceleration first: a = Δv/Δt. Then ΣF = ma.', 'a = ' + n(v2) + ' ÷ ' + t2 + ' = ' + n(a2) + ' m/s². ΣF = ma = ' + m2 + ' × ' + n(a2) + ' = ' + n(m2 * a2) + ' N.', 0.02, m2 * v2 / t2); }
      if (b === 3) { var a3 = pick(r, [0.5, 1, 1.5, 2, 2.5]), m3 = pick(r, [2, 4, 5, 8]), t3 = pick(r, [3, 4, 5, 6]), F3 = m3 * a3, x3 = 0.5 * a3 * t3 * t3; return NUM('A ' + m3 + ' kg sled at rest is pushed by a constant net force of ' + n(F3) + ' N. How far does it move in ' + t3 + ' s?', x3, 'm', 'Find a from ΣF = ma. Then use x = ½at² for motion from rest.', 'a = ' + n(F3) + ' ÷ ' + m3 + ' = ' + n(a3) + ' m/s². x = ½at² = ½ × ' + n(a3) + ' × ' + t3 + '² = ' + n(x3) + ' m.', 0.02, (a3 * t3) / 2 * t3); }
      var m4 = pick(r, [900, 1000, 1200, 1500]), v4 = pick(r, [15, 20, 25]), d4 = pick(r, [30, 40, 50, 60]), a4 = v4 * v4 / (2 * d4), F4 = m4 * a4;
      return NUM('A ' + m4 + ' kg car moving at ' + v4 + ' m/s brakes steadily to a stop in ' + d4 + ' m. How large is the braking force?', F4, 'N', 'Use v² = 2ad to find the deceleration, then ΣF = ma.', 'v² = 2ad gives a = ' + v4 + '² ÷ (2 × ' + d4 + ') = ' + n(a4, 3) + ' m/s². F = ma = ' + m4 + ' × ' + n(a4, 3) + ' = ' + n(F4, 0) + ' N.', 0.02, 0.5 * m4 * v4 * v4 / d4);
    } },
    { id: 'N2-friction', title: 'Push, friction and net force', gen: function (b, r) {
      if (b === 1) { var F = pick(r, [12, 15, 18, 20, 24, 25, 30, 35, 40, 45]); return C('A crate is pushed across a floor with a steady ' + F + ' N force and slides at a constant speed. How big is the friction force on it?', F + ' N', ['0 N', (2 * F) + ' N', n(F / 2) + ' N'], 'Constant speed means the acceleration is zero. What does that say about the net force?', 'Constant velocity means a = 0, so ΣF = ma = 0. Friction cancels the push: ' + F + ' N. (The first law is the second law with a = 0.)'); }
      if (b === 2) { var F2 = pick(r, [30, 40, 50]), f2 = pick(r, [10, 12, 15]), m2 = pick(r, [4, 5, 8]), a2 = (F2 - f2) / m2; return NUM('A ' + m2 + ' kg crate is pushed across a floor with a ' + F2 + ' N force. Friction on it is ' + f2 + ' N. What is its acceleration?', a2, 'm/s²', 'Find the net force first: push minus friction. Then divide by the mass.', 'ΣF = ' + F2 + ' − ' + f2 + ' = ' + (F2 - f2) + ' N. a = ΣF/m = ' + (F2 - f2) + ' ÷ ' + m2 + ' = ' + n(a2) + ' m/s².', 0.02, (F2 - f2) / m2); }
      if (b === 3) { var m3 = pick(r, [4, 5, 10]), a3 = pick(r, [1, 1.5, 2]), mu3 = pick(r, [0.1, 0.2, 0.25, 0.3]), F3 = Math.round((m3 * a3 + mu3 * m3 * G) * 10) / 10, f3 = F3 - m3 * a3, mu = f3 / (m3 * G); return NUM('A ' + m3 + ' kg crate is pulled along a floor by a horizontal force of ' + n(F3, 1) + ' N and speeds up at ' + a3 + ' m/s². Find the coefficient of kinetic friction μ. (g = 9.8 m/s²)', mu, '', 'The net force is ma. Friction is the difference between the pull and ma. Then μ = f/N, and N = mg on a level floor.', 'ΣF = ma = ' + n(m3 * a3) + ' N, so f = ' + n(F3, 1) + ' − ' + n(m3 * a3) + ' = ' + n(f3) + ' N. N = mg = ' + n(m3 * G, 1) + ' N, so μ = ' + n(f3) + ' ÷ ' + n(m3 * G, 1) + ' = ' + n(mu, 3) + '.', 0.03, (F3 - m3 * a3) / (m3 * 9.8)); }
      var th = pick(r, [20, 25, 30, 35, 40]), m4 = pick(r, [2, 3, 5]), a4 = G * Math.sin(th * Math.PI / 180);
      return NUM('A ' + m4 + ' kg block slides down a frictionless ramp tilted ' + th + '° above the horizontal. Find its acceleration along the ramp. (g = 9.8 m/s²)', a4, 'm/s²', 'Two forces act: weight and the normal force. Resolve along the ramp. Which part of the weight points down the ramp?', 'Along the ramp the only force is the component of weight, mg sin θ. ΣF = ma gives a = g sin θ = 9.8 × sin ' + th + '° = ' + n(a4, 2) + ' m/s². The ' + m4 + ' kg cancels.', 0.02, 9.8 * Math.cos((90 - th) * Math.PI / 180));
    } },
    { id: 'N2-fall', title: 'Why everything falls together', gen: function (b, r) {
      if (b === 1) { var m2 = pick(r, [2, 3, 4, 5, 8, 10]); return C('Ignoring air, a 1.0 kg ball and a ' + m2 + '.0 kg ball are dropped together from the same height. Which statement is true?', 'They land at the same time.', ['The heavier ball lands first.', 'The lighter ball lands first.', 'The heavier ball lands at twice the speed.'], 'Compare the two accelerations, a = W/m = mg/m.', 'The weight W = mg grows with mass, but so does the inertia. a = mg/m = g for both, so they fall together.'); }
      if (b === 2) { var t2 = pick(r, [1.2, 1.5, 1.8, 2, 2.2, 2.5, 2.8, 3, 3.5, 4]); return NUM('Ignoring air, a ball is dropped from rest. How fast is it moving after ' + t2 + ' s? (g = 9.8 m/s²)', G * t2, 'm/s', 'The acceleration is g, so v = gt.', 'a = g = 9.8 m/s², so v = gt = 9.8 × ' + t2 + ' = ' + n(G * t2) + ' m/s.', 0.02, 9.8 * t2); }
      if (b === 3) { var t3 = pick(r, [1.2, 1.5, 1.8, 2, 2.2, 2.5, 2.8, 3, 3.2, 3.5, 4]), h3 = 0.5 * G * t3 * t3; return NUM('A stone dropped from a bridge hits the water ' + t3 + ' s later. How high is the bridge above the water? Ignore air; g = 9.8 m/s².', h3, 'm', 'Free fall from rest: h = ½gt².', 'h = ½gt² = ½ × 9.8 × ' + t3 + '² = ' + n(h3, 1) + ' m.', 0.02, 4.9 * t3 * t3); }
      var m4 = pick(r, [0.05, 0.08, 0.10, 0.20]), a4 = pick(r, [7.8, 8.2, 8.6, 9.0]), D = m4 * (G - a4);
      return NUM('A ' + n(m4, 2) + ' kg ball is falling and, at one instant, is accelerating downward at only ' + a4 + ' m/s² because of air drag. How large is the drag force on it at that instant? (g = 9.8 m/s²)', D, 'N', 'Take down as positive: mg − drag = ma. Solve for the drag.', 'mg − D = ma, so D = m(g − a) = ' + n(m4, 2) + ' × (9.8 − ' + a4 + ') = ' + n(D, 3) + ' N.', 0.03, m4 * 9.8 - m4 * a4);
    } }
  ];

  N2L.skillTeacher = {
    'N2-calc': 'a = ΣF/m. L1 doubling the force; L2 direct division; L3 grams to kilograms; L4 two perpendicular forces combined first (3-4-5 family), then divided by the mass.',
    'N2-solve': 'Rearranging the law. L1 half the mass or twice? (proportional reasoning); L2 F = ma; L3 m = F/a; L4 the force is hidden: find it from the first run, then reuse it with the loaded cart.',
    'N2-weight': 'Weight versus mass. L1 the Moon, mass stays and weight drops; L2 W = mg; L3 mass from an Earth weight then Moon weight; L4 an accelerating elevator, N = m(g + a).',
    'N2-motion': 'Kinematics to force. L1 steady speed gain is a constant net force; L2 a = Δv/Δt then ma; L3 ma then x = ½at²; L4 braking force from v² = 2ad. Treat 2 d.p. rounding as acceptable.',
    'N2-friction': 'Net force from push and friction. L1 constant speed means friction equals the push (first law as a special case); L2 net force then a; L3 the unknown is μ; L4 frictionless ramp, a = g sin θ (the mass cancels).',
    'N2-fall': 'Free fall. L1 the “heavy falls faster” misconception; L2 v = gt; L3 h = ½gt²; L4 drag from m(g − a). Connects to Part D, where the hanging mass approaches g only when it dwarfs the cart.'
  };

  /* ---------- Check: the same three questions for everyone ---------- */
  N2L.check = {
    c1: { id: 'C1', type: 'choice', grid: true, prompt: 'A cart on a rough track speeds up steadily to the right. Friction acts on it. Which free-body diagram is correct?',
      options: [
        { svg: fbd([{ dir: 'down', len: 46, label: 'W' }, { dir: 'up', len: 46, label: 'N' }, { dir: 'right', len: 44, label: 'F' }, { dir: 'left', len: 20, label: 'f' }], 'FBD 1'), label: 'Diagram 1' },
        { svg: fbd([{ dir: 'down', len: 46, label: 'W' }, { dir: 'up', len: 46, label: 'N' }, { dir: 'right', len: 32, label: 'F' }, { dir: 'left', len: 32, label: 'f' }], 'FBD 2'), label: 'Diagram 2' },
        { svg: fbd([{ dir: 'down', len: 46, label: 'W' }, { dir: 'up', len: 46, label: 'N' }, { dir: 'right', len: 20, label: 'F' }, { dir: 'left', len: 44, label: 'f' }], 'FBD 3'), label: 'Diagram 3' },
        { svg: fbd([{ dir: 'down', len: 46, label: 'W' }, { dir: 'up', len: 46, label: 'N' }, { dir: 'right', len: 44, label: 'F' }], 'FBD 4'), label: 'Diagram 4' }],
      answer: 0, noHint: true, maxMiss: 1,
      worked: 'Speeding up to the right needs a net force to the right: the push is longer than friction. Diagram 2 has equal arrows (constant velocity), Diagram 3 has friction winning (slowing down), and Diagram 4 leaves out the friction the question says is there.' },
    c2: { id: 'C2', type: 'choice', prompt: 'A cart’s acceleration is 3.0 m/s². The net force on it is then multiplied by 3 and its mass is multiplied by 2. What is the new acceleration?',
      options: ['4.5 m/s²', '18 m/s²', '2.0 m/s²', '9.0 m/s²'],
      answer: 0, maxMiss: 1,
      worked: 'a = ΣF/m. Tripling the force multiplies a by 3, doubling the mass multiplies it by ½: 3.0 × 3 ÷ 2 = 4.5 m/s².' },
    c3: { id: 'C3', type: 'text', minWords: 20, rows: 4, prompt: 'A student says: “The net force on the cart is constant, so the cart’s speed must be constant.” Use the second law to explain what is wrong with that statement.',
      rubric: [{ name: 'names acceleration', re: /accelerat/i }, { name: 'speed/velocity keeps changing', re: /(speed|velocity)[^.]{0,40}(chang|increas|grow|rise|gain|faster|steadily)|speeds? up|gets? faster|getting faster/i }, { name: 'links force to a = F/m', re: /net force|F\s*=\s*ma|ΣF|\ba\s*=\s*F|force[^.]{0,50}accelerat|accelerat[^.]{0,50}force|F\s*\/\s*m/i }] }
  };

  N2L.teacherInfo = {
    predNames: ['P1 steady fan push (graph)', 'P2 double the force', 'P3 triple the mass'],
    predAnswers: 'P1 Graph A (straight line from zero), P2 1.0 m/s², P3 0.17 m/s²',
    c3Note: 'names acceleration, says the speed/velocity keeps changing, and links a constant net force to a constant acceleration (a = F/m).',
    investKey: '<p><b>Part A.</b> a = F/m on a smooth track; slope of a–F is 1/m. <b>Part B.</b> a = F/m; a–1/m is a line through the origin with slope F. <b>Part C.</b> F needed = μmg + m·a_target; with the push exactly f the cart cruises (a = 0). Pass: |a − a_target| ≤ 0.04 m/s². <b>Part D.</b> a = m<sub>h</sub>g/(M + m<sub>h</sub>); tension T = M·a; a approaches g only for m<sub>h</sub> ≫ M.</p>'
  };
})();
