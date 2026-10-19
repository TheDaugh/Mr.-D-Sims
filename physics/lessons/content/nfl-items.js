/* Newton's First Law: question bank. Pure data and generators.
   Band 1 = foundation (middle-school register), 2 = core, 3 = honors, 4 = advanced (AP / first-year college).
   Numbers are seeded per student, so neighbors see different values. Correct option is always listed first;
   the engine shuffles the display order per student. */
(function () {
  'use strict';
  var G = 9.8;
  var NFL = window.NFL = window.NFL || {};
  function n(x, d) { return String(+Number(x).toFixed(d == null ? 2 : d)); }
  function pick(r, a) { return a[Math.floor(r() * a.length)]; }
  NFL.G = G;

  /* ---------- small drawings ---------- */
  function svgOpen(w, h) { return '<svg viewBox="0 0 ' + w + ' ' + h + '" xmlns="http://www.w3.org/2000/svg" role="img">'; }
  NFL.vtGraph = function (kind) {
    var p = { flat: 'M22,38 L148,38', down: 'M22,34 L148,92', up: 'M22,92 L148,34', curve: 'M22,32 Q60,80 148,94' }[kind];
    return svgOpen(160, 112) + '<path d="M20,8 L20,100 L152,100" fill="none" stroke="#566878" stroke-width="1.5"/><path d="' + p + '" fill="none" stroke="#2b4fd9" stroke-width="3"/><text x="6" y="14" font-size="11" fill="#566878">v</text><text x="146" y="110" font-size="11" fill="#566878">t</text></svg>';
  };
  NFL.strobe = function (kind) {
    var xs, ys = null;
    if (kind === 'equal') xs = [15, 55, 95, 135, 175, 215];
    else if (kind === 'speedup') xs = [15, 30, 55, 90, 135, 190];
    else if (kind === 'slowdown') xs = [15, 75, 125, 160, 185, 200];
    else { xs = [15, 55, 95, 135, 175, 215]; ys = [48, 36, 28, 28, 36, 48]; }
    var o = svgOpen(230, 70);
    xs.forEach(function (x, i) { o += '<circle cx="' + x + '" cy="' + (ys ? ys[i] : 36) + '" r="5" fill="#243447"/>'; });
    return o + '<path d="M8,64 L222,64" stroke="#cbd6e0"/></svg>';
  };
  function fbd(forces, title) { return window.LE.fbdSVG({ forces: forces, title: title }); }
  NFL.fbd = fbd;

  /* ---------- warm-up (sets the starting band) ---------- */
  NFL.warm = [
    { id: 'W1', prompt: 'Two people push a crate on a level floor. One pushes 20 N east and the other pushes 20 N west. What is the net force on the crate?', options: ['0 N', '40 N east', '20 N east', '20 N west'], answer: 0 },
    { id: 'W2', prompt: 'Which of these quantities is a vector (it has a direction as well as a size)?', options: ['Force', 'Mass', 'Temperature', 'Time'], answer: 0 },
    { id: 'W3', prompt: 'Three horizontal forces act on a sled: 30 N east, 12 N west and 8 N west. What is the net force?', options: ['10 N east', '50 N east', '10 N west', '26 N east'], answer: 0 },
    { id: 'W4', prompt: 'A 6 N force pulls a puck east and an 8 N force pulls it north at the same time. How large is the net force?', options: ['10 N', '14 N', '2 N', '48 N'], answer: 0 },
    { id: 'W5', prompt: 'A cart moves at a steady 5 m/s for 8 s. How far does it go, and what is its acceleration?', options: ['40 m and 0 m/s²', '40 m and 5 m/s²', '1.6 m and 0 m/s²', '13 m and 0.6 m/s²'], answer: 0 }
  ];
  NFL.bandFromWarm = function (correct) { return [1, 1, 2, 2, 3, 4][Math.max(0, Math.min(5, correct))]; };

  /* ---------- predictions (not graded until the huddle) ---------- */
  NFL.preds = [
    { id: 'P1', title: 'The puck on a long sheet of ice',
      prompt: 'A 0.16 kg hockey puck is struck once and slides along a long, level sheet of ice. The stick is no longer touching it. Which statement do you think is true?',
      options: [
        'Only a force can change its velocity. With very little friction it keeps sliding at nearly the same speed.',
        'The push wears off, so the puck stops by itself no matter what surface it is on.',
        'Moving things naturally slow down and come to rest. Friction only helps it along.',
        'The smooth ice lets it speed up a little before it settles into steady motion.'],
      correct: 0 },
    { id: 'P2', title: 'The ideal frictionless puck',
      prompt: 'Now imagine the ice is perfectly frictionless and the puck leaves the stick at 3 m/s. Which velocity-versus-time graph shows its motion?',
      options: [{ svg: NFL.vtGraph('flat'), label: 'Graph 1', desc: 'flat line: constant velocity' }, { svg: NFL.vtGraph('down'), label: 'Graph 2', desc: 'straight line falling to zero' }, { svg: NFL.vtGraph('up'), label: 'Graph 3', desc: 'straight line rising' }, { svg: NFL.vtGraph('curve'), label: 'Graph 4', desc: 'curve falling toward zero' }],
      correct: 0, grid: true },
    { id: 'P3', title: 'The helper who keeps pushing',
      prompt: 'To keep that same puck gliding at a steady 3 m/s along the frictionless ice, how much forward force must a helper keep applying?',
      options: ['None. 0 N.', 'A small steady force, a few tenths of a newton.', 'About as much as the original hit.', 'Its weight, 1.6 N.'],
      correct: 0 }
  ];

  /* ---------- Name It: three registers ---------- */
  NFL.explain = {
    simple: [
      'Everything you tested in the lab tells one story. A sliding puck keeps going until something pushes or pulls against its motion. On rough surfaces, friction does that quickly. On slick ice friction is small, so the puck travels much farther. With no friction at all, nothing slows it, and it keeps going at the same speed in a straight line.',
      '<b>Newton’s First Law.</b> If the forces on an object are balanced (they cancel), the object keeps doing what it was already doing. Sitting still, it stays still. Moving, it keeps moving at the same speed in the same direction. Only an unbalanced force can change that.',
      '<b>Inertia</b> is the name for this “keep doing what you are doing” habit. A heavier object has more of it. Inertia is not a force. It is a property that every object with mass has.'],
    standard: [
      'The investigation pulled apart two ideas that daily life blends together. <i>Motion</i> does not need a force. <i>Changing</i> motion does. The puck on sandpaper stopped quickly because friction was large and unbalanced. On ice, friction was small, so the velocity changed slowly. On the ideal surface the net force was zero and the velocity did not change at all.',
      '<b>Newton’s First Law.</b> The velocity of an object (its speed and its direction) stays constant unless a net external force acts on it. Equivalently, if ΣF = 0 then the acceleration is zero. That covers two cases: an object at rest stays at rest, and a moving object keeps its velocity along a straight line.',
      '<b>Balanced forces are not absent forces.</b> A book on a desk has weight and a normal force, equal and opposite, so the net force is zero. <b>Inertia</b> is an object’s resistance to changes in its velocity, and mass measures it. Inertia is a property, not a force, and speed does not use it up.'],
    college: [
      'Written as a vector relation, the first law says that if ΣF = 0 then dv/dt = 0, in an inertial reference frame. The frame clause is not decoration. The law cannot be tested without a frame in which free bodies move uniformly, and that is how inertial frames are identified: a frame is inertial if a body with no net force moves at constant velocity in it. The second law then extends the statement to the case ΣF ≠ 0.',
      '<b>Equilibrium</b> means ΣF = 0, which requires ΣFx = 0 and ΣFy = 0 for the vector sum. A body in equilibrium may be at rest (static) or moving uniformly (dynamic). Dynamics alone cannot tell the two apart. That is Galileo’s principle of relativity, and it is why a smooth flight feels the same as sitting still.',
      'The “forward force” a braking-bus passenger seems to feel is a pseudo-force, an artifact of describing motion in an accelerating, non-inertial frame. In the ground frame nothing pushes the passenger forward. She simply keeps her velocity while the bus loses its own. Inertia here is not a force and not a cause; it is the statement that velocity needs no cause.']
  };
  NFL.regName = { simple: 'Plain words', standard: 'Standard', college: 'College level' };
  NFL.regForBand = function (b) { return b <= 1 ? 'simple' : (b >= 4 ? 'college' : 'standard'); };

  NFL.cloze = {
    1: { text: 'An object at {1} stays at rest. An object that is moving keeps moving at the same {2} in a straight line. Both are true unless an {3} force acts on the object.',
      blanks: [['rest'], ['velocity', 'speed'], ['unbalanced', 'net', 'outside', 'external']], bank: ['rest', 'velocity', 'unbalanced', 'friction'],
      full: 'An object at rest stays at rest. An object that is moving keeps moving at the same velocity in a straight line. Both are true unless an unbalanced force acts on the object.' },
    2: { text: 'If the net force on an object is {1}, its velocity does not {2}. An object at rest stays at {3}, and a moving object keeps its {4} along a straight line.',
      blanks: [['zero', '0'], ['change', 'changes', 'vary'], ['rest'], ['velocity', 'speed', 'speed and direction', 'constant velocity']],
      full: 'If the net force on an object is zero, its velocity does not change. An object at rest stays at rest, and a moving object keeps its velocity along a straight line.' },
    3: { text: 'If ΣF = {1}, then the acceleration is {2}, so the velocity vector {3}. Equilibrium means ΣF = 0 for an object that is at rest or moving at constant {4}.',
      blanks: [['0', 'zero'], ['0', 'zero'], ['stays constant', 'is constant', 'remains constant', 'does not change', 'constant', 'unchanged'], ['velocity']],
      full: 'If ΣF = 0, then the acceleration is 0, so the velocity vector stays constant. Equilibrium means ΣF = 0 for an object that is at rest or moving at constant velocity.' },
    4: { text: 'In an {1} reference frame, an object with ΣF = 0 moves with constant {2}; that is how such frames are recognized. In an accelerating frame such as a braking bus, a free object appears to accelerate even though {3} acts on it.',
      blanks: [['inertial'], ['velocity'], ['no net force', 'no force', 'zero net force', 'no real force', 'nothing', 'no unbalanced force']],
      full: 'In an inertial reference frame, an object with ΣF = 0 moves with constant velocity; that is how such frames are recognized. In an accelerating frame such as a braking bus, a free object appears to accelerate even though no net force acts on it.' }
  };
  NFL.misc = {
    text: 'Many people think a {1} is needed to keep an object moving. In fact, {2} is needed to keep it moving at constant velocity. A force is needed only to {3} its velocity.',
    blanks: [['force', 'push'], ['no force', 'no net force', 'nothing', 'zero force', 'no push'], ['change', 'alter', 'change its motion']],
    full: 'Many people think a force is needed to keep an object moving. In fact, no net force is needed to keep it moving at constant velocity. A force is needed only to change its velocity.'
  };

  NFL.vocab = [
    { id: 'inertia', term: 'Inertia', model: 'The property of matter that resists changes in velocity. Mass measures it. It is not a force.', bands: [1, 2, 3, 4], starter: 'Start with: “Inertia is…”' },
    { id: 'net', term: 'Net force', model: 'The vector sum of all the forces acting on an object.', bands: [1, 2, 3, 4], starter: 'Start with: “The net force is what you get when…”' },
    { id: 'balanced', term: 'Balanced forces', model: 'Forces whose vector sum is zero. They cancel, so the velocity does not change.', bands: [1, 2, 3, 4], starter: 'Start with: “Balanced forces are…”' },
    { id: 'equil', term: 'Equilibrium', model: 'A state in which the net force on an object is zero. The object is at rest or moves at constant velocity.', bands: [2, 3, 4] },
    { id: 'inertial', term: 'Inertial reference frame', model: 'A frame of reference in which an object with no net force moves at constant velocity, so the first law holds.', bands: [4] }
  ];

  NFL.fbdScenes = [
    { id: 'F1', title: 'The puck sliding on rough wood after the stick has left it', need: ['W', 'N', 'f'], forces: [{ dir: 'down', len: 46, label: 'W' }, { dir: 'up', len: 46, label: 'N' }, { dir: 'left', len: 26, label: 'f' }],
      note: 'Friction is the only horizontal force, so the net force points backward and the puck slows. Nothing pushes it forward.' },
    { id: 'F2', title: 'The puck cruising at constant velocity on rough wood, with a steady fan push', need: ['W', 'N', 'f', 'F'], forces: [{ dir: 'down', len: 46, label: 'W' }, { dir: 'up', len: 46, label: 'N' }, { dir: 'left', len: 30, label: 'f' }, { dir: 'right', len: 30, label: 'F' }],
      note: 'Friction and the push are equal and opposite, so the net force is zero. Constant velocity does not mean no forces. It means balanced forces.' },
    { id: 'F3', title: 'The puck gliding at constant velocity on ideal ice', need: ['W', 'N'], forces: [{ dir: 'down', len: 46, label: 'W' }, { dir: 'up', len: 46, label: 'N' }],
      note: 'Only weight and the normal force act, and they cancel. There is no horizontal arrow because nothing pushes or pulls it sideways.' }
  ];
  NFL.fbdForces = [
    { k: 'W', t: 'Weight (gravity), pulling down' },
    { k: 'N', t: 'Normal force from the surface, pushing up' },
    { k: 'f', t: 'Friction, opposing the sliding' },
    { k: 'F', t: 'A forward push from a fan or hand' },
    { k: 'M', t: '“Force of motion,” pushing it forward' }
  ];

  /* ---------- Try it: six skills, four difficulty bands each ---------- */
  function C(prompt, correct, others, hint, worked, why) { return { type: 'choice', prompt: prompt, options: [correct].concat(others), answer: 0, hint: hint, worked: worked, why: why }; }
  function N(prompt, answer, unit, hint, worked, tol) { return { type: 'num', prompt: prompt, answer: answer, unit: unit, hint: hint, worked: worked, tol: tol == null ? 0.02 : tol }; }

  NFL.skills = [
    { id: 'S1', title: 'Balanced forces', gen: function (b, r) {
      if (b === 1) { var W = pick(r, [10, 20, 30, 40, 50]); return C('A box rests on a floor. Gravity pulls down on it with ' + W + ' N. How hard does the floor push up on it?', W + ' N', [(W / 2) + ' N', (2 * W) + ' N', '0 N'], 'The box is at rest, so the forces on it cancel. What upward push cancels the weight?', 'At rest means the net force is zero, so the floor pushes up with ' + W + ' N (the normal force).'); }
      if (b === 2) { var R = pick(r, [30, 40, 50]), A = pick(r, [10, 12, 15]), B2 = pick(r, [6, 8, 9]), net = R - A - B2; return N('A sled on level ice feels three horizontal forces: ' + R + ' N to the right from a rope, ' + A + ' N to the left from friction, and ' + B2 + ' N to the left from the wind. What is the net force? Count right as positive and enter a number in newtons.', net, 'N', 'Forces in the same direction add. Forces in opposite directions subtract.', R + ' − ' + A + ' − ' + B2 + ' = ' + net + ' N, to the right. The net force is not zero, so the sled’s velocity changes.'); }
      if (b === 3) { var T = pick(r, [6, 8, 10, 12]); return N('A 3.0 kg block slides across a table at constant velocity while a rope pulls it to the right with ' + T + ' N. What is the size of the friction force on the block, in newtons?', T, 'N', 'Constant velocity is the balanced case of the first law. The mass does not matter here.', 'Constant velocity means ΣF = 0, so friction equals the rope’s ' + T + ' N and points left. The 3.0 kg is a distractor.'); }
      var m = pick(r, [3.0, 3.5, 4.0]), Tn = pick(r, [12, 14, 16]), th = pick(r, [25, 30, 35]), rad = th * Math.PI / 180;
      var f = Tn * Math.cos(rad), Nn = m * G - Tn * Math.sin(rad), mu = f / Nn;
      return N('A ' + n(m, 1) + ' kg crate slides at constant velocity when a rope pulls it with ' + Tn + ' N at ' + th + '° above the horizontal. Take g = 9.8 m/s². Find the coefficient of kinetic friction μ. (Three decimal places is plenty.)', mu, '', 'Constant velocity: ΣFx = 0 and ΣFy = 0. The upward part of the rope’s pull lightens the normal force.', 'Horizontal: f = ' + Tn + ' cos ' + th + '° = ' + n(f) + ' N. Vertical: N = mg − ' + Tn + ' sin ' + th + '° = ' + n(Nn) + ' N. So μ = f/N = ' + n(mu, 3) + '.', 0.025);
    } },
    { id: 'S2', title: 'Cruising at constant velocity', gen: function (b, r) {
      if (b === 1) { var f1 = pick(r, [6, 8, 10, 12]); return C('You push a cart along a hallway at a steady speed. Friction pulls back on the cart with ' + f1 + ' N. How hard are you pushing?', f1 + ' N', ['0 N', (2 * f1) + ' N', (f1 / 2) + ' N'], 'Steady speed means the forces balance. What push balances the friction?', 'Steady speed means zero net force, so the push equals friction: ' + f1 + ' N.'); }
      if (b === 2) { var E = pick(r, [800, 900, 1000, 1100]); return C('A car cruises at a constant 25 m/s on a level highway. Its engine pushes forward with ' + E + ' N. What is the total backward force from air drag and the road?', E + ' N', ['0 N', (E / 2) + ' N', (2 * E) + ' N'], 'Constant velocity means the net force is zero. So how do the forward and backward forces compare?', 'Zero net force at constant speed means the resistance equals the engine’s push: ' + E + ' N. It is the resistance, not inertia, that makes you keep burning fuel.'); }
      if (b === 3) { var m = pick(r, [60, 65, 70, 75, 80]); return N('A ' + m + ' kg skydiver falls at a constant speed (terminal velocity). What is the upward air-drag force on the skydiver, in newtons? Use g = 9.8 m/s².', m * G, 'N', 'Constant velocity means zero net force. What other force acts, and how big is it?', 'Weight = ' + m + ' × 9.8 = ' + n(m * G, 0) + ' N down. Constant speed means the drag is equal and opposite: ' + n(m * G, 0) + ' N up.', 0.015); }
      var vt = pick(r, [48, 52, 56, 60]), vn = vt / Math.sqrt(20);
      return N('Air drag on a skydiver is F = kv². At terminal speed of ' + vt + ' m/s she is in equilibrium. When the parachute opens, k becomes 20 times larger. What is her new terminal speed, in m/s?', vn, 'm/s', 'At terminal speed drag equals weight, so kv² = mg and v = √(mg/k). What happens to v when k grows by a factor of 20?', 'v ∝ 1/√k. With k × 20, v becomes ' + vt + '/√20 = ' + n(vn, 1) + ' m/s. The equilibrium is the same; only the speed that balances the weight changed.', 0.02);
    } },
    { id: 'S3', title: 'Inertia on the road', gen: function (b, r) {
      if (b === 1) return C('A bus brakes hard and a standing passenger lurches forward. Which explanation fits the first law?', 'Her body keeps moving forward while the bus slows down. Nothing pushed her forward.', ['A forward force pushes her toward the front.', 'The bus pulls her forward as it stops.', 'Gravity gets stronger when a bus brakes.'], 'Before the brakes, how fast was she moving compared with the bus? What changed for the bus but not for her?', 'She was moving with the bus. The brakes act on the bus. Nothing slows her at once, so she keeps her forward velocity.');
      if (b === 2) return C('A coin sits on a car’s dashboard. The car brakes hard and the coin slides forward. A student says, “A forward force pushed the coin.” Which reply is best?', 'No forward force acts. The coin keeps its velocity while the car slows beneath it.', ['Inertia is a force that pushes the coin forward.', 'The brakes pushed the coin forward.', 'The coin is lighter than the car, so it moves ahead.'], 'Name the forward force and the object that exerts it. Can you?', 'There is no object pushing the coin forward. Friction with the dashboard is too small to slow the coin as fast as the car slows, so the coin keeps moving.');
      if (b === 3) { var v = pick(r, [15, 20, 25]); return C('A train moves at a steady ' + v + ' m/s. A passenger tosses a ball straight up (relative to the train) and catches it. Ignoring air, where does the ball land relative to the passenger?', 'In her hand.', ['Behind her, since the train moved forward.', 'In front of her, since the ball keeps moving.', 'It depends on how high she tosses it.'], 'During the flight, what horizontal force acts on the ball? What happens to its horizontal velocity?', 'No horizontal force acts, so the ball keeps the train’s ' + v + ' m/s horizontally. The passenger travels the same horizontal distance, so the ball comes back to her hand.'); }
      var a = pick(r, [0.8, 1.0, 1.2]), t = pick(r, [1.0, 1.2, 1.4]);
      return N('Same train, same toss, but the instant the ball leaves her hand the train starts braking steadily at ' + a + ' m/s². The ball is in the air for ' + t + ' s. How far ahead of her hand (measured along the train) does the ball land, in meters? (Hint: ignore air.)', 0.5 * a * t * t, 'm', 'The ball keeps its horizontal velocity. The train does not. Compare how far each moves in t seconds.', 'The ball keeps its original horizontal velocity v. In time t the train falls behind by ½at² = ½(' + a + ')(' + t + ')² = ' + n(0.5 * a * t * t, 3) + ' m, so the ball lands that far ahead of her hand.', 0.025);
    } },
    { id: 'S4', title: 'Reading motion for forces', gen: function (b, r) {
      if (b === 1) return C('An astronaut far from any planet gives a wrench a gentle push, then lets go. Over the next hour the wrench will:', 'Keep moving in a straight line at a constant speed.', ['Slow down gradually and stop.', 'Curve back toward the astronaut.', 'Speed up as it drifts.'], 'After the push ends, what forces act on the wrench? What does the first law say about that case?', 'With no force on it after the push, the wrench keeps its velocity: straight line, constant speed.');
      if (b === 2) { var v = pick(r, [12, 15, 17]); return N('A probe far from every planet coasts at ' + v + ' km/s with its engine off. How far does it travel in one day (86 400 s)? Give your answer in millions of kilometers.', v * 86400 / 1e6, 'million km', 'Constant velocity: distance = speed × time. Convert carefully.', 'Distance = ' + v + ' km/s × 86 400 s = ' + n(v * 86400, 0) + ' km ≈ ' + n(v * 86400 / 1e6, 3) + ' million km, with no engine needed.', 0.015); }
      if (b === 3) { return { type: 'choice', grid: true, prompt: 'Each picture shows a puck photographed at equal time intervals (dots), moving left to right. Which one shows a puck with zero net force?', options: [{ svg: NFL.strobe('equal'), label: 'Picture 1' }, { svg: NFL.strobe('speedup'), label: 'Picture 2' }, { svg: NFL.strobe('slowdown'), label: 'Picture 3' }, { svg: NFL.strobe('curved'), label: 'Picture 4' }], answer: 0, hint: 'Zero net force means the velocity does not change. What does that mean for the spacing of dots and for their path?', worked: 'Equal spacing along a straight line means constant velocity, so zero net force. Growing spacing means speeding up, shrinking spacing means slowing down, and a curved path means the direction changes.' }; }
      var mu = pick(r, [0.05, 0.08, 0.10, 0.12, 0.15]), v0 = pick(r, [6, 7, 8]), xs = [];
      for (var i = 0; i <= 5; i++) xs.push(+(v0 * i - 0.5 * mu * G * i * i).toFixed(2));
      var tab = '<table class="data"><thead><tr><th>t (s)</th>' + xs.map(function (_, i) { return '<th>' + i + '</th>'; }).join('') + '</tr></thead><tbody><tr><td>x (m)</td>' + xs.map(function (x) { return '<td>' + x.toFixed(2) + '</td>'; }).join('') + '</tr></tbody></table>';
      return N('A strobe photo of a puck sliding on a table gives these positions once every second.' + tab + 'Friction is the only horizontal force, so the puck’s slowing is constant. Use the data to estimate the coefficient of friction μ between puck and table. (g = 9.8 m/s². Hint: how much does the gap between dots shrink each second?)', mu, '', 'The gaps are x₁−x₀, x₂−x₁, and so on. They shrink by the same amount each second, and that amount is aΔt² with a = μg.', 'The gaps shrink by ' + n(mu * G, 3) + ' m each second. With Δt = 1 s, a = ' + n(mu * G, 3) + ' m/s², and μ = a/g = ' + n(mu, 2) + '.', 0.1);
    } },
    { id: 'S5', title: 'Forces in equilibrium', gen: function (b, r) {
      if (b === 1) { var W = pick(r, [20, 30, 40, 50]); return C('A sign hangs motionless from a rope. Gravity pulls it down with ' + W + ' N. How hard does the rope pull up?', W + ' N', [(W / 2) + ' N', (2 * W) + ' N', '0 N'], 'It is not moving, so the forces cancel.', 'At rest, so ΣF = 0. The rope pulls up with ' + W + ' N to cancel the weight.'); }
      if (b === 2) { var A = pick(r, [30, 35, 40]), B = pick(r, [10, 12, 15]); return N('Two ropes pull a crate on frictionless ice: ' + A + ' N east and ' + B + ' N west. A third rope, pulling west, must hold the crate at rest. How hard must it pull, in newtons?', A - B, 'N', 'At rest means zero net force. How much westward pull is still needed after the ' + B + ' N?', 'East: ' + A + ' N. West so far: ' + B + ' N. The third rope supplies the missing ' + (A - B) + ' N west so that ΣF = 0.'); }
      if (b === 3) { var pr = pick(r, [[6, 8, 10], [5, 12, 13], [9, 12, 15], [8, 15, 17]]); return N('A puck on frictionless ice is pulled ' + pr[0] + ' N east and ' + pr[1] + ' N north. A third force makes the net force zero. How large is that third force, in newtons?', pr[2], 'N', 'The east and north forces are perpendicular. The third force must cancel their resultant.', 'The resultant of the two forces is √(' + pr[0] + '² + ' + pr[1] + '²) = ' + pr[2] + ' N. The third force is equal and opposite: ' + pr[2] + ' N, pointing south-west.', 0.015); }
      var Wt = pick(r, [60, 80, 100, 120]), th = pick(r, [20, 30, 40]), T = Wt / (2 * Math.sin(th * Math.PI / 180));
      return N('A ' + Wt + ' N sign hangs from two identical cables, each making an angle of ' + th + '° with the horizontal, as in a shallow V. The sign is at rest. What is the tension in each cable, in newtons?', T, 'N', 'Equilibrium: ΣFy = 0. Only the vertical parts of the tensions support the weight. Two cables share it.', '2T sin ' + th + '° = ' + Wt + ', so T = ' + Wt + '/(2 sin ' + th + '°) = ' + n(T, 1) + ' N. The flatter the cables, the larger the tension, and it can exceed the sign’s weight.', 0.02);
    } },
    { id: 'S6', title: 'A package from a plane', gen: function (b, r) {
      if (b === 1) return C('A plane flies level at a steady speed and drops a package. Ignoring air, where is the plane when the package lands?', 'Directly above the package.', ['Far ahead of the package.', 'Far behind the package.', 'Directly above the spot where the package was released.'], 'What horizontal force acts on the package after release? What happens to its horizontal speed?', 'No horizontal force acts, so the package keeps the plane’s horizontal speed. Both move forward together, and the plane stays right above it.');
      if (b === 2) { var v = pick(r, [50, 60, 70]), t = pick(r, [4, 5, 6]); return N('A package is released from a plane flying level at ' + v + ' m/s. It falls for ' + t + ' s before it lands. How far does it move horizontally during the fall, in meters? Ignore air.', v * t, 'm', 'Horizontally there is no force, so the horizontal velocity is constant.', 'Constant horizontal velocity: x = vt = ' + v + ' × ' + t + ' = ' + (v * t) + ' m.', 0.015); }
      if (b === 3) { var h = pick(r, [320, 405, 500]), v3 = pick(r, [60, 70, 80]), tf = Math.sqrt(2 * h / G);
        return N('A plane flying level at ' + v3 + ' m/s at an altitude of ' + h + ' m releases a package. How far horizontally from the release point does it land, in meters? Ignore air and use g = 9.8 m/s².', v3 * tf, 'm', 'Vertical motion sets the fall time. Horizontally the velocity stays constant.', 'Fall time: t = √(2h/g) = √(2 × ' + h + '/9.8) = ' + n(tf, 2) + ' s. Horizontal: x = ' + v3 + ' × ' + n(tf, 2) + ' = ' + n(v3 * tf, 0) + ' m.', 0.02); }
      return C('Ignoring air, a package is dropped from a plane flying level at constant velocity. How would the path look to the pilot, and to a person watching from the ground?', 'Pilot: straight down. Ground observer: a parabola.', ['Pilot: a parabola. Ground observer: straight down.', 'Both see a straight vertical line.', 'Both see the same parabola.'], 'In the pilot’s frame, which direction does the package have no velocity in? In the ground frame, add the plane’s velocity.', 'The package has the plane’s horizontal velocity, so relative to the plane it has none. The pilot sees straight-down fall. The ground observer adds the plane’s forward velocity and sees a parabola. Both frames are inertial, so the first law holds in both.');
    } }
  ];

  NFL.skillTeacher = {
    S1: 'Equilibrium arithmetic. L1 equal and opposite; L2 three collinear forces; L3 friction equals pull at constant v (mass is a distractor); L4 2D equilibrium for μ (note μ comes out near 0.6).',
    S2: 'Cruising. The target misconception is “constant speed needs an unbalanced forward force.” L3 terminal velocity; L4 scaling of terminal speed with drag coefficient.',
    S3: 'Inertia and frames. L1/L2 the lurch and the coin; L3 the toss on a train; L4 braking mid-flight gives ½at² (a quick bridge to non-inertial frames).',
    S4: 'Reading motion. L3 uses strobe pictures; L4 gets μ from position data (second differences), tolerance 10% for rounding.',
    S5: 'Missing-force equilibrium. L4 sign on two cables, tension exceeds weight for angles below 30°.',
    S6: 'Horizontal velocity persists. L4 asks for the frame statement rather than a number.'
  };

  /* ---------- Check: the same three questions for everyone ---------- */
  NFL.check = {
    c1: { id: 'C1', type: 'choice', grid: true, prompt: 'A puck slides at constant velocity in a straight line on frictionless ice. Which free-body diagram is correct?',
      options: [
        { svg: fbd([{ dir: 'down', len: 46, label: 'W' }, { dir: 'up', len: 46, label: 'N' }], 'FBD 1'), label: 'Diagram 1' },
        { svg: fbd([{ dir: 'down', len: 46, label: 'W' }, { dir: 'up', len: 46, label: 'N' }, { dir: 'right', len: 40, label: 'F' }], 'FBD 2'), label: 'Diagram 2' },
        { svg: fbd([{ dir: 'down', len: 46, label: 'W' }, { dir: 'up', len: 46, label: 'N' }, { dir: 'left', len: 30, label: 'f' }], 'FBD 3'), label: 'Diagram 3' },
        { svg: fbd([{ dir: 'down', len: 46, label: 'W' }], 'FBD 4'), label: 'Diagram 4' }],
      answer: 0, noHint: true, maxMiss: 1,
      worked: 'Weight and the normal force cancel, and nothing pushes or pulls it sideways. Diagram 2 has the “force of motion” misconception, Diagram 3 adds friction that is not there, and Diagram 4 leaves out the surface.' },
    c2: { id: 'C2', type: 'choice', prompt: 'Which statement is correct?',
      options: ['An object moving at constant velocity has zero net force, although individual forces may still act on it.', 'An object moving at constant velocity has no forces acting on it at all.', 'A force is needed to keep any object moving.', 'On a frictionless surface a heavier object needs more force to keep moving at the same speed.'],
      answer: 0, maxMiss: 1,
      worked: 'The first law is about the net force. Weight and the normal force still act on a puck in constant-velocity motion; they cancel.' },
    c3: { id: 'C3', type: 'text', minWords: 20, rows: 4, prompt: 'A book slides across a table and comes to rest. Does this contradict Newton’s first law? Explain using forces.',
      rubric: [{ name: 'names friction', re: /friction|rub|drag/i }, { name: 'net force / unbalanced', re: /net force|unbalanced|not balanced|isn.?t balanced|no longer balanced|opposes|against/i }, { name: 'says no contradiction', re: /not (contradict|violate|break)|doesn.?t (contradict|violate|break)|does not (contradict|violate|break)|no contradiction|consistent|\bno\b/i }] }
  };

  NFL.beyond = [
    { id: 'X1', level: 'Honors', title: 'Stopping distance on ice',
      q: [{ id: 'X1a', type: 'num', prompt: 'A 0.17 kg puck slides on ice with μ = 0.02 and starts at 12 m/s. Taking friction as the only horizontal force, how far does it slide before stopping, in meters? (g = 9.8 m/s²)', answer: 144 / (2 * 0.02 * G), unit: 'm', tol: 0.02, hint: 'Find a = μg. Then use v² = 2ad.', worked: 'a = μg = 0.196 m/s². d = v²/(2a) = 144/0.392 = 367 m. Mass cancels.' },
        { id: 'X1b', type: 'num', prompt: 'How long does that take, in seconds?', answer: 12 / (0.02 * G), unit: 's', tol: 0.02, hint: 't = v/a.', worked: 't = 12/0.196 = 61 s.' }] },
    { id: 'X2', level: 'College', title: 'The puck that never quite stops',
      q: [{ id: 'X2a', type: 'num', prompt: 'On an air table the drag on a 0.50 kg puck is not friction but air drag, F = −bv with b = 0.020 kg/s. Newton’s law gives m dv/dt = −bv, so v = v₀e^(−t/τ). What is the time constant τ = m/b, in seconds?', answer: 25, unit: 's', tol: 0.02, hint: 'τ = m/b.', worked: 'τ = 0.50/0.020 = 25 s.' },
        { id: 'X2b', type: 'num', prompt: 'If v₀ = 3.0 m/s, how far does the puck travel in total (as t → ∞), in meters? Integrate v dt from 0 to ∞.', answer: 75, unit: 'm', tol: 0.02, hint: 'The integral of v₀e^(−t/τ) is v₀τ.', worked: 'x = ∫ v₀e^(−t/τ) dt = v₀τ = 3.0 × 25 = 75 m. In this model the puck approaches that distance but never fully stops in finite time.' }] },
    { id: 'X3', level: 'Any level', title: 'Galileo’s ship', text: { id: 'X3a', type: 'text', minWords: 15, rows: 4, prompt: 'Inside a closed, windowless cabin on a ship gliding at constant velocity on calm water, could any mechanical experiment (tossing a ball, a swinging pendulum, a rolling marble) tell you the ship is moving? Argue your answer from the first law.' } }
  ];
})();
