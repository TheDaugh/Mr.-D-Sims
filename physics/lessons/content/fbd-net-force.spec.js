/* SPEC (physics): Slot 4, Free-body diagrams and net force.
   Everything this lesson teaches is plain data here. Three things read this file:
     1. the lesson page (fbd-net-force.js builds the tabs from it),
     2. the projector page (fbd-net-force-projector.html draws the six situations and the vocabulary from it),
     3. the node tests and tools/build-keys.mjs (make-up key and teacher key PDFs).
   No DOM in this file. Scope fence: one dimension only, surface weight W = mg, no drag, no components (slot 20), no momentum or energy. */
(function (root) {
  'use strict';
  var G = 9.8;
  var INT = function (r, a, b) { return a + Math.floor(r() * (b - a + 1)); };
  var pick = function (r, arr) { return arr[Math.floor(r() * arr.length)]; };
  function shuffle(r, arr) { var a = arr.slice(), i, j, t; for (i = a.length - 1; i > 0; i--) { j = Math.floor(r() * (i + 1)); t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  /* a choice item: correct first in the data, the engine shuffles the display. why[i] explains the specific mistake in option i (index 0 is the right one). */
  function ch(prompt, correct, others, hint, worked, misc, whys) {
    var o = { type: 'choice', prompt: prompt, options: [correct].concat(others), answer: 0, hint: hint, worked: worked, misc: misc };
    if (whys) o.why = whys[0] === '' ? whys : [''].concat(whys); return o;
  }
  var f1 = function (x) { return String(+Number(x).toFixed(2)); };

  /* ---------- free-body diagram pictures, drawn in code ----------
     forces: [{ dir:'up|down|left|right', len:px, label:'N', mag:'40 N' (optional), type:'ok|missing|extra|size' }]
     Lengths are proportional to the force. Page colors come from the lesson tokens, with hex fallbacks for print. */
  var VEC = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };
  function fbd(forces, o) {
    o = o || {}; var W = 300, H = 210, cx = 150, cy = 105, bw = 62, bh = 38, out = '';
    out += '<svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="' + (o.alt || 'Free-body diagram').replace(/"/g, '') + '" style="width:100%;height:auto;max-width:340px">';
    out += '<rect x="' + (cx - bw / 2) + '" y="' + (cy - bh / 2) + '" width="' + bw + '" height="' + bh + '" rx="5" fill="#dbe6ff" stroke="#2b4fd9" stroke-width="2.4" style="fill:var(--stage,#dbe6ff);stroke:var(--accent,#2b4fd9)"/>';
    (forces || []).forEach(function (f) {
      var d = VEC[f.dir], x1 = cx + d[0] * (d[0] ? bw / 2 : 0) + (d[1] ? (f.off || 0) : 0), y1 = cy + d[1] * (d[1] ? bh / 2 : 0) + (d[0] ? (f.off || 0) : 0), L = f.len, x2 = x1 + d[0] * L, y2 = y1 + d[1] * L, hx, hy;
      var col = f.col || '#142230';
      out += '<line x1="' + x1 + '" y1="' + y1 + '" x2="' + (x2 - d[0] * 8) + '" y2="' + (y2 - d[1] * 8) + '" stroke="' + col + '" stroke-width="4.5" stroke-linecap="round" style="stroke:' + (f.col ? f.col : 'var(--ink,#142230)') + '"/>';
      hx = d[0] ? 0 : 8; hy = d[1] ? 0 : 8;
      out += '<polygon points="' + x2 + ',' + y2 + ' ' + (x2 - d[0] * 14 + (d[1] ? 8 : 0)) + ',' + (y2 - d[1] * 14 + (d[0] ? 8 : 0)) + ' ' + (x2 - d[0] * 14 - (d[1] ? 8 : 0)) + ',' + (y2 - d[1] * 14 - (d[0] ? 8 : 0)) + '" fill="' + col + '" style="fill:' + (f.col ? f.col : 'var(--ink,#142230)') + '"/>';
      var mx = (x1 + x2) / 2, my = (y1 + y2) / 2, tx = d[0] ? mx : mx + 12, ty = d[0] ? my - 12 : my + 5, anchor = d[0] ? 'middle' : 'start';
      out += '<text x="' + tx + '" y="' + ty + '" font-size="19" font-weight="700" font-family="Source Sans 3,Arial,sans-serif" text-anchor="' + anchor + '" fill="#142230" style="fill:var(--ink,#142230)">' + f.label + (f.mag ? ' = ' + f.mag : '') + '</text>';
    });
    return out + '</svg>';
  }
  var LN = { dir: { up: 'up', down: 'down', left: 'left', right: 'right' } };
  function alt(forces) {
    var t = forces.map(function (f) { return f.label + ' ' + f.dir + (f.mag ? ' (' + f.mag + ')' : ''); }), by = {}, cmp = [];
    forces.forEach(function (f) { by[f.dir + f.label] = f; });
    var pairs = [['N', 'up', 'W', 'down'], ['T', 'up', 'W', 'down']];
    pairs.forEach(function (p) { var a = by[p[1] + p[0]], b = by[p[3] + p[2]]; if (a && b) cmp.push(a.len === b.len ? p[0] + ' equals ' + p[2] : p[0] + (a.len < b.len ? ' shorter than ' : ' longer than ') + p[2]); });
    ['F', 'T'].forEach(function (pl) { ['right', 'left'].forEach(function (dr) { var a = by[dr + pl], b = by[(dr === 'right' ? 'left' : 'right') + 'f']; if (a && b) cmp.push(a.len === b.len ? pl + ' equals f' : pl + (a.len < b.len ? ' shorter than f' : ' longer than f')); }); });
    return (t.join(', ') || 'no arrows') + (cmp.length ? '; ' + cmp.join('; ') : '');
  }
  function opt(forces, type) { return { svg: fbd(forces, { alt: alt(forces) }), label: '', alt: alt(forces), type: type || 'ok' }; }
  /* the standard force set for the scenes */
  function F(dir, len, label, mag) { return { dir: dir, len: len, label: label, mag: mag }; }

  /* the six situations of the whiteboard hold-up check (also the projector page). Each lists the right diagram and the mistakes students make. */
  var SITUATIONS = [
    { id: 'S1', title: 'A book rests on a table', say: 'Draw the forces on the book.', kind: 'rest',
      forces: [F('down', 62, 'W'), F('up', 62, 'N')], net: 'Zero. The table’s push up cancels gravity down.',
      errors: [{ id: 'E1a', type: 'missing', say: 'Leaves out the normal force (nothing is “pushing back”).', fix: 'The table touches the book and pushes up. The book is at rest, so N must equal W.' }, { id: 'E1b', type: 'extra', say: 'Draws the book’s push on the table as a force on the book.', fix: 'Each arrow is a force ON the book. Ask: what object exerts this?' }] },
    { id: 'S2', title: 'A crate slides at constant speed, pushed right', say: 'Draw the forces on the crate.', kind: 'steady',
      forces: [F('down', 62, 'W'), F('up', 62, 'N'), F('right', 80, 'F'), F('left', 80, 'f')], net: 'Zero. Push equals friction, so the speed stays constant.',
      errors: [{ id: 'E2a', type: 'extra', say: 'Adds a forward “force of motion” arrow.', fix: 'Motion is not a force. Only name forces you can trace to an object.' }, { id: 'E2b', type: 'size', say: 'Draws the push longer than friction.', fix: 'Constant speed means zero net force: equal arrows.' }, { id: 'E2c', type: 'missing', say: 'Leaves out friction.', fix: 'The floor touches the crate and opposes the slide.' }] },
    { id: 'S3', title: 'A crate speeds up to the right under a push', say: 'Draw the forces on the crate.', kind: 'speed',
      forces: [F('down', 62, 'W'), F('up', 62, 'N'), F('right', 95, 'F'), F('left', 45, 'f')], net: 'To the right. The push is longer than friction.',
      errors: [{ id: 'E3a', type: 'size', say: 'Draws push and friction equal.', fix: 'Speeding up means the arrows are unequal: the net force points the way it speeds up.' }, { id: 'E3b', type: 'size', say: 'Makes the up and down arrows unequal.', fix: 'Nothing moves vertically, so N = W.' }] },
    { id: 'S4', title: 'A lamp hangs at rest from a chain', say: 'Draw the forces on the lamp.', kind: 'hang',
      forces: [F('down', 62, 'W'), F('up', 62, 'T')], net: 'Zero. The chain’s pull up cancels gravity down.',
      errors: [{ id: 'E4a', type: 'extra', say: 'Also draws a force from the ceiling on the lamp.', fix: 'The ceiling touches the chain, not the lamp. Only the chain and the Earth act on the lamp.' }, { id: 'E4b', type: 'size', say: 'Labels the upward arrow N.', fix: 'A rope or chain pulls: that force is tension, T.' }] },
    { id: 'S5', title: 'A box is pushed but does not move', say: 'Draw the forces on the box.', kind: 'static',
      forces: [F('down', 62, 'W'), F('up', 62, 'N'), F('right', 60, 'F'), F('left', 60, 'f')], net: 'Zero. Friction grows until it matches the push.',
      errors: [{ id: 'E5a', type: 'missing', say: 'Says there is no friction because nothing slides.', fix: 'Friction is what holds the box still. It matches the push.' }, { id: 'E5b', type: 'size', say: 'Draws the push bigger than friction “because someone is pushing”.', fix: 'The box is at rest, so the net force is zero.' }] },
    { id: 'S6', title: 'A ball falls (ignore air)', say: 'Draw the forces on the ball.', kind: 'fall',
      forces: [F('down', 62, 'W')], net: 'Down. Gravity is the only force, so the ball speeds up downward.',
      errors: [{ id: 'E6a', type: 'extra', say: 'Adds an upward arrow for the motion.', fix: 'The ball moves down. An upward force would slow it.' }, { id: 'E6b', type: 'extra', say: 'Draws two arrows because “weight” and “gravity” are different.', fix: 'Weight is the gravity force on the ball: one arrow.' }] }
  ];

  /* ---------- the Vectors and Proportions Check: six items, three parts, one try each. Opens the lesson (this is the Warm-up). ---------- */
  var VP = [
    { id: 'V1', part: 'arith', title: 'Add forces on a line', gen: function (r) { var a = INT(r, 3, 9), b = INT(r, 2, 8);
      return { type: 'num', prompt: 'Two pushes act on a box in the same direction: ' + a + ' N and ' + b + ' N. What is the total force?', answer: a + b, unit: 'N', hint: 'Same direction: add.', worked: a + ' + ' + b + ' = ' + (a + b) + ' N.', misc: 'Students subtract whenever they see two forces.' }; } },
    { id: 'V2', part: 'arith', title: 'Add forces on a line', gen: function (r) { var b = INT(r, 2, 7), a = b + INT(r, 2, 8);
      return { type: 'num', prompt: a + ' N pushes right and ' + b + ' N pushes left. How big is the net force?', answer: a - b, unit: 'N', hint: 'Opposite directions: subtract.', worked: a + ' − ' + b + ' = ' + (a - b) + ' N.', misc: 'Students add forces that point opposite ways.' }; } },
    { id: 'V3', part: 'dir', title: 'Direction of the net force', gen: function (r) { var big = pick(r, ['right', 'left']), small = big === 'right' ? 'left' : 'right', a = INT(r, 6, 12), b = INT(r, 2, 5), cap = function (s) { return s.charAt(0).toUpperCase() + s.slice(1); };
      return ch(a + ' N pulls ' + big + ' and ' + b + ' N pulls ' + small + '. Which way does the net force point?', cap(big), [cap(small), 'It is zero'], 'The bigger pull wins.', 'The ' + a + ' N pull is bigger, so the net force points ' + big + ' with ' + (a - b) + ' N.', 'Students pick the side with more arrows, or the side they read first.', ['', 'The smaller force does not win.', 'The forces are not equal, so the net force is not zero.']); } },
    { id: 'V4', part: 'dir', title: 'Direction of the net force', gen: function (r) { var eq = r() < 0.5, a = INT(r, 10, 30), b = eq ? a : a + pick(r, [-5, 5]), big = b > a ? 'down' : 'up';
      return eq ? ch('A bucket hangs still. The rope pulls up with ' + a + ' N and gravity pulls down with ' + b + ' N. What is the net force?', 'Zero', ['Up', 'Down'], 'Equal and opposite forces cancel.', 'Up ' + a + ' N and down ' + b + ' N cancel: the net force is zero.', 'Students think a still object has no forces, or that something must “win”.', ['', 'Equal forces cancel. Neither side wins.', 'Equal forces cancel. Neither side wins.'])
        : ch('A bucket is pulled up with ' + a + ' N while gravity pulls down with ' + b + ' N. Which way does the net force point?', big === 'up' ? 'Up' : 'Down', [big === 'up' ? 'Down' : 'Up', 'It is zero'], 'The bigger force wins.', 'The bigger force is ' + (big === 'up' ? a : b) + ' N, ' + big + '. The net force points ' + big + '.', 'Students pick the first force they read.', ['', 'That is the smaller force.', 'The forces are not equal.']); } },
    { id: 'V5', part: 'prop', title: 'Ratio reasoning', gen: function (r) { var k = pick(r, [2, 3]), which = pick(r, ['mass', 'force']);
      return which === 'mass' ? ch('The same push acts on two carts. Cart B has ' + (k === 2 ? 'twice' : 'three times') + ' the mass of cart A. How does the acceleration of B compare with A?', k === 2 ? 'Half as big' : 'One third as big', [k === 2 ? 'Twice as big' : 'Three times as big', 'The same', k === 2 ? 'Four times as big' : 'Nine times as big'], 'More mass, harder to speed up.', 'Acceleration = force ÷ mass. Same force, ' + k + ' times the mass: ' + (k === 2 ? 'half' : 'one third') + ' the acceleration.', 'Students think heavier objects speed up more.', ['', 'More mass means less acceleration, not more.', 'Mass changes the acceleration.', 'Dividing by mass is not squaring it.'])
        : ch('The same cart gets ' + (k === 2 ? 'twice' : 'three times') + ' the push. How does its acceleration change?', k === 2 ? 'Twice as big' : 'Three times as big', [k === 2 ? 'Half as big' : 'One third as big', 'The same', k === 2 ? 'Four times as big' : 'Nine times as big'], 'More force, more acceleration.', 'Acceleration = force ÷ mass. ' + k + ' times the force, same mass: ' + k + ' times the acceleration.', 'Students think force sets speed rather than change in speed.', ['', 'More force means more acceleration.', 'The force changed, so the acceleration changes.', 'It scales by ' + k + ', not by ' + k + ' squared.']); } },
    { id: 'V6', part: 'prop', title: 'Ratio reasoning', gen: function (r) { var m = pick(r, [2, 3, 4]), a = pick(r, [2, 4, 6]), F0 = m * a;
      return { type: 'num', prompt: 'Table: force ' + F0 + ' N on ' + m + ' kg gives ' + a + ' m/s². Now the same ' + F0 + ' N pushes ' + (2 * m) + ' kg. What acceleration?', answer: a / 2, unit: 'm/s²', hint: 'Double the mass, same force.', worked: 'Double the mass halves the acceleration: ' + a + ' ÷ 2 = ' + (a / 2) + ' m/s².', misc: 'Students double the acceleration along with the mass.' }; } }
  ];

  /* ---------- the mid-lesson formative gate: three fixed diagram checks, so the class split compares like with like ---------- */
  function gateItem(id, title, prompt, correct, wrongs, worked, hint) {
    var options = [opt(correct, 'ok')].concat(wrongs.map(function (w) { return opt(w[0], w[1]); }));
    return { id: id, title: title, type: 'choice', grid: true, prompt: prompt, options: options, answer: 0, worked: worked, hint: hint,
      why: [''].concat(wrongs.map(function (w) { return w[2]; })) };
  }
  var GATE = [
    gateItem('G1', 'Rest', 'A book rests on a table. Which diagram shows the forces on the book?', [F('down', 62, 'W'), F('up', 62, 'N')],
      [[[F('down', 62, 'W')], 'missing', 'The table touches the book. It pushes up, so there is a second arrow.'], [[F('down', 62, 'W'), F('up', 62, 'N'), F('right', 55, 'F')], 'extra', 'Nothing pushes the book sideways. Only draw forces you can trace to an object.'], [[F('down', 62, 'W'), F('up', 36, 'N')], 'size', 'The book is at rest, so the up and down arrows must be equal.']],
      'Gravity pulls down, the table pushes up, and the arrows are equal because the book stays at rest.', 'Which objects touch the book, and which pulls it from a distance?'),
    gateItem('G2', 'Steady motion', 'A crate slides to the right at constant speed. A person pushes it. Which diagram is right?', [F('down', 62, 'W'), F('up', 62, 'N'), F('right', 80, 'F'), F('left', 80, 'f')],
      [[[F('down', 62, 'W'), F('up', 62, 'N'), F('right', 80, 'F')], 'missing', 'The floor touches the crate and rubs against the slide. Friction is a force.'], [[F('down', 62, 'W'), F('up', 62, 'N'), F('right', 80, 'F'), F('left', 80, 'f'), F('right', 55, 'M')], 'extra', 'Motion is not a force. Nothing exerts an extra forward force.'], [[F('down', 62, 'W'), F('up', 62, 'N'), F('right', 100, 'F'), F('left', 50, 'f')], 'size', 'Constant speed means zero net force, so push and friction are equal.']],
      'Constant speed means the net force is zero: the push equals friction, and N equals W.', 'Constant speed: should the net force be zero or not?'),
    gateItem('G3', 'Speeding up', 'A crate speeds up to the right. A person pushes it. Which diagram is right?', [F('down', 62, 'W'), F('up', 62, 'N'), F('right', 95, 'F'), F('left', 45, 'f')],
      [[[F('down', 62, 'W'), F('up', 62, 'N'), F('right', 70, 'F'), F('left', 70, 'f')], 'size', 'Equal arrows give constant speed. Speeding up needs a longer push than friction.'], [[F('down', 62, 'W'), F('up', 62, 'N'), F('right', 95, 'F'), F('left', 45, 'f'), F('right', 55, 'M')], 'extra', 'Do not add a force for the motion itself.'], [[F('down', 62, 'W'), F('up', 62, 'N'), F('right', 95, 'F')], 'missing', 'Friction is still there. It is shorter than the push, but it is not zero.']],
      'Speeding up means the net force points the way it speeds up: the push arrow is longer than friction.', 'Which way is the net force when the speed grows?')
  ];

  /* ---------- skills: bands 1 to 4, hidden. Band 1 is the plainest version. Every item has a hint, a worked answer and the misconception it targets. ---------- */
  var SRC1 = [
    { s: 'A book rests on a table. Which object pushes UP on the book?', a: 'The table', o: ['The book', 'The air', 'Nothing'], w: 'The table touches the book and pushes up.', y: ['', 'An object cannot exert a force on itself.', 'Air is not what holds the book up.', 'Something must hold the book up.'] },
    { s: 'A ball is falling. Which object pulls DOWN on the ball?', a: 'The Earth', o: ['The ball', 'The air', 'Its speed'], w: 'The Earth pulls every object toward its center: that is gravity.', y: ['', 'An object cannot pull on itself.', 'Air is not what causes gravity.', 'Speed is not an object, so it cannot exert a force.'] },
    { s: 'A rope pulls a sled forward. Which object exerts that pull on the sled?', a: 'The rope', o: ['The sled', 'The snow', 'Its motion'], w: 'The rope touches the sled and pulls it.', y: ['', 'The sled cannot pull itself.', 'The snow is not pulling it forward.', 'Motion is not an object, so it cannot exert a force.'] },
    { s: 'A box slides across a floor and slows down. Which object exerts the friction force on the box?', a: 'The floor', o: ['The box', 'The air', 'Gravity'], w: 'The floor touches the box and rubs against the slide.', y: ['', 'An object cannot exert friction on itself.', 'The floor is what rubs the box.', 'Gravity is a force, not an object. The object is the Earth.'] },
    { s: 'A person pushes a wall. Which object exerts the push on the wall?', a: 'The person', o: ['The wall', 'The floor', 'The air'], w: 'The person’s hands touch the wall and push it.', y: ['', 'The wall cannot push on itself.', 'The floor is not in contact with the wall for this push.', 'Air is not what pushes the wall.'] },
    { s: 'A lamp hangs from a chain. Which object pulls UP on the lamp?', a: 'The chain', o: ['The ceiling', 'The lamp', 'The air'], w: 'The chain touches the lamp and pulls up. The ceiling touches the chain, not the lamp.', y: ['', 'The ceiling is not touching the lamp. Only the chain is.', 'The lamp cannot pull on itself.', 'Air is not holding the lamp up.'] },
    { s: 'A cart is pushed forward by a student. Which object exerts the push on the cart?', a: 'The student', o: ['The cart', 'The floor', 'The wheels’ motion'], w: 'The student’s hands touch the cart and push it.', y: ['', 'The cart cannot push itself.', 'The floor holds the cart up; it is not the pusher here.', 'Motion is not an object, so it cannot exert a force.'] },
    { s: 'A cup sits on a desk. Which object pushes UP on the cup?', a: 'The desk', o: ['The cup', 'The Earth', 'The air'], w: 'The desk touches the cup and pushes up. The Earth pulls down.', y: ['', 'The cup cannot push itself.', 'The Earth pulls the cup down, not up.', 'Air does not hold the cup up.'] },
    { s: 'A sign hangs from a rope. Which object pulls UP on the sign?', a: 'The rope', o: ['The sign', 'The Earth', 'The wall'], w: 'The rope touches the sign and pulls up. The Earth pulls down.', y: ['', 'The sign cannot pull itself.', 'The Earth pulls the sign down, not up.', 'The wall touches the rope, not the sign.'] },
    { s: 'A skater glides and slows. Which object exerts the friction force on the skater?', a: 'The ice', o: ['The skater', 'The air above', 'Gravity'], w: 'The ice touches the skates and rubs against the glide.', y: ['', 'The skater cannot rub against themselves.', 'Friction needs surfaces that touch.', 'Gravity is not an object. The object is the Earth.'] }
  ];
  var SRC2 = [
    { s: 'A ball falls toward the ground. Which two objects interact through gravity?', a: 'The ball and the Earth', o: ['The ball and the air', 'The ball only', 'The Earth only'], w: 'Every force is an interaction between two objects: here the ball and the Earth.' },
    { s: 'A book rests on a table. Which two objects interact through the normal force?', a: 'The book and the table', o: ['The book and the floor', 'The book and the air', 'The table and the floor'], w: 'The normal force is a push between two surfaces that touch: the book and the table.' },
    { s: 'A rope pulls a crate. Which two objects interact through the tension force?', a: 'The rope and the crate', o: ['The crate and the floor', 'The rope and the person only', 'The crate and the Earth'], w: 'Tension is the pull between the rope and the crate it is attached to.' },
    { s: 'A crate slides on the floor. Which two objects interact through friction?', a: 'The crate and the floor', o: ['The crate and the rope', 'The crate and the Earth', 'The floor and the Earth'], w: 'Friction is the rubbing force between two surfaces that touch: the crate and the floor.' },
    { s: 'A student pushes a cart. Which two objects interact through the applied force?', a: 'The student and the cart', o: ['The cart and the floor', 'The student and the floor', 'The cart and the Earth'], w: 'The push is an interaction between the hands that push and the cart that is pushed.' },
    { s: 'A lamp hangs from a chain. Which two objects interact through tension?', a: 'The chain and the lamp', o: ['The lamp and the ceiling', 'The lamp and the floor', 'The chain and the Earth'], w: 'Tension is the pull between the chain and the lamp it holds.' },
    { s: 'An apple falls from a tree. Which two objects interact through gravity?', a: 'The apple and the Earth', o: ['The apple and the tree', 'The apple and the air', 'The tree and the Earth only'], w: 'The Earth and the apple pull on each other across the gap: gravity.' },
    { s: 'A cup sits on a desk. Which two objects interact through the normal force?', a: 'The cup and the desk', o: ['The cup and the Earth', 'The desk and the wall', 'The cup and the air'], w: 'The normal force is the push between the touching surfaces of the cup and the desk.' },
    { s: 'A skater glides on ice. Which two objects interact through friction?', a: 'The skates and the ice', o: ['The skater and the air', 'The ice and the Earth', 'The skater and gravity'], w: 'Friction acts between two touching surfaces: the skates and the ice.' }
  ];
  var CAT1 = [
    { s: 'A table pushes up on a book. This force is called the…', a: 'Normal force', o: ['Gravity', 'Tension', 'Friction'], w: 'A surface pushes perpendicular to itself: that is the normal force.' },
    { s: 'The Earth pulls a ball toward its center. This force is called…', a: 'Gravity (weight)', o: ['Normal force', 'Tension', 'Friction'], w: 'The Earth’s pull on an object is gravity. On the surface we call it weight.' },
    { s: 'A rope pulls a crate. This force is called…', a: 'Tension', o: ['Normal force', 'Gravity', 'Friction'], w: 'A pull along a rope or chain is tension.' },
    { s: 'A rough floor opposes a sliding box. This force is called…', a: 'Friction', o: ['Normal force', 'Gravity', 'Tension'], w: 'A force that opposes sliding between two surfaces is friction.' },
    { s: 'A person pushes a cart forward. This force is called the…', a: 'Applied force', o: ['Normal force', 'Friction', 'Gravity'], w: 'A push or pull you apply directly is the applied force.' },
    { s: 'A chain pulls a lamp up. This force is called…', a: 'Tension', o: ['Normal force', 'Gravity', 'Applied force'], w: 'A pull along a chain or rope is tension.' },
    { s: 'The floor pushes up on a standing student. This force is called the…', a: 'Normal force', o: ['Gravity', 'Tension', 'Friction'], w: 'The floor is a surface pushing perpendicular to itself: normal force.' },
    { s: 'The Earth pulls an apple toward the ground. This force is called…', a: 'Gravity (weight)', o: ['Normal force', 'Applied force', 'Friction'], w: 'The Earth’s pull is gravity, and on the surface it is the weight.' }
  ];
  var CAT2 = [
    { s: 'A book rests on a flat table. Which way does the normal force on the book point?', a: 'Up', o: ['Down', 'Left', 'Right'], w: 'The normal force is perpendicular to the surface and pushes away from it: up.' },
    { s: 'A box slides to the right. Which way does friction on the box point?', a: 'Left', o: ['Right', 'Up', 'Down'], w: 'Friction opposes the sliding, so it points opposite the motion.' },
    { s: 'A lamp hangs from a chain. Which way does gravity on the lamp point?', a: 'Down', o: ['Up', 'Left', 'Right'], w: 'Gravity always pulls toward the center of the Earth: down.' },
    { s: 'A rope pulls a crate to the right. Which way does the tension on the crate point?', a: 'Right', o: ['Left', 'Up', 'Down'], w: 'Tension pulls along the rope, away from the object the rope is pulling.' },
    { s: 'A ball is thrown upward. Which way does gravity on the ball point while it rises?', a: 'Down', o: ['Up', 'Left', 'It is zero at the top'], w: 'Gravity points down the whole time. It never switches off.' },
    { s: 'A cart rolls left and slows. Which way does friction on the cart point?', a: 'Right', o: ['Left', 'Up', 'Down'], w: 'Friction opposes the motion. The cart moves left, so friction points right.' },
    { s: 'A crate sits on the floor. Which way does the normal force on the crate point?', a: 'Up', o: ['Down', 'Left', 'Right'], w: 'The floor pushes the crate away from itself: up.' },
    { s: 'A rope pulls a sled to the left. Which way is the tension on the sled?', a: 'Left', o: ['Right', 'Up', 'Down'], w: 'The rope pulls the sled toward the rope: left.' }
  ];
  var FORCES = ['gravity', 'normal force', 'tension', 'friction', 'applied force'], FIELD = { 'gravity': true };

  function sceneFor(b, r) {
    /* returns { prompt, correct forces, wrong options [forces, type, why], worked, hint, misc } for the pick-the-diagram skill */
    var k, L, mW, mF, mf, wr = [];
    if (b <= 1) { var thing = pick(r, [['A book rests on a table.', 'book'], ['A lamp hangs from a chain.', 'lamp'], ['A cup sits on a desk.', 'cup'], ['A phone lies on a shelf.', 'phone'], ['A sign hangs from a rope.', 'sign'], ['A plant sits on a windowsill.', 'plant'], ['A picture hangs from a wire.', 'picture'], ['A ball rests on the floor.', 'ball']]), up = /lamp|sign|picture/.test(thing[1]) ? 'T' : 'N', cor = [F('down', 62, 'W'), F('up', 62, up)];
      wr = [[[F('down', 62, 'W')], 'missing', 'Something holds the ' + thing[1] + ' up. That is a force too.'], [[F('down', 62, 'W'), F('up', 62, up), F('right', 55, 'F')], 'extra', 'Nothing pushes it sideways.'], [[F('down', 62, 'W'), F('up', 34, up)], 'size', 'It is at rest, so up and down must be equal.']];
      return { prompt: thing[0] + ' Which diagram shows the forces on the ' + thing[1] + '?', cor: cor, wr: wr, hint: 'It is at rest: what touches it, and what pulls it from a distance?', worked: 'Gravity pulls down and the ' + (up === 'T' ? 'chain' : 'surface') + ' pulls or pushes up with an equal arrow, so the net force is zero.', misc: 'Students draw only gravity on a still object, or add a force for “staying there”.' }; }
    if (b === 2) { var obj2 = pick(r, ['crate', 'sled', 'box', 'cart', 'wagon', 'trunk']), dir = pick(r, ['right', 'left']), opp = dir === 'right' ? 'left' : 'right', len = pick(r, [70, 80, 90]), cor2 = [F('down', 62, 'W'), F('up', 62, 'N'), F(dir, len, 'F'), F(opp, len, 'f')];
      wr = [[[F('down', 62, 'W'), F('up', 62, 'N'), F(dir, len, 'F')], 'missing', 'The floor rubs against the slide. Friction is a force.'], [[F('down', 62, 'W'), F('up', 62, 'N'), F(dir, len, 'F'), F(opp, len, 'f'), F(dir, 50, 'M')], 'extra', 'Motion is not a force. Nothing exerts an extra forward force.'], [[F('down', 62, 'W'), F('up', 62, 'N'), F(dir, len + 25, 'F'), F(opp, len - 30, 'f')], 'size', 'Constant speed means zero net force. The arrows must match.']];
      return { prompt: 'A ' + obj2 + ' slides ' + dir + ' at constant speed. A person pushes it ' + dir + '. Which diagram is right?', cor: cor2, wr: wr, hint: 'Constant speed: should the net force be zero?', worked: 'Constant speed means net force zero: push equals friction, and N equals W.', misc: 'Students believe motion needs a bigger forward force than friction, or draw a “force of motion”.' }; }
    if (b === 3) { var obj3 = pick(r, ['crate', 'sled', 'box', 'cart', 'wagon', 'trunk']), d3 = pick(r, ['right', 'left']), o3 = d3 === 'right' ? 'left' : 'right', big = pick(r, [90, 95, 100]), small = pick(r, [40, 45, 50]), cor3 = [F('down', 62, 'W'), F('up', 62, 'N'), F(d3, big, 'F'), F(o3, small, 'f')];
      wr = [[[F('down', 62, 'W'), F('up', 62, 'N'), F(d3, 70, 'F'), F(o3, 70, 'f')], 'size', 'Equal arrows give constant speed. Speeding up needs the push longer than friction.'], [[F('down', 62, 'W'), F('up', 62, 'N'), F(d3, big, 'F'), F(o3, small, 'f'), F(d3, 50, 'M')], 'extra', 'No extra force for the motion itself.'], [[F('down', 62, 'W'), F('up', 62, 'N'), F(d3, big, 'F')], 'missing', 'Friction is still there. It is shorter than the push, not zero.']];
      return { prompt: 'A ' + obj3 + ' speeds up to the ' + d3 + '. A person pushes it ' + d3 + '. Which diagram is right?', cor: cor3, wr: wr, hint: 'The net force points the way the crate speeds up.', worked: 'Speeding up means the net force points ' + d3 + ': the push arrow is longer than friction. N still equals W.', misc: 'Students draw push and friction equal for any motion.' }; }
    mW = pick(r, [30, 35, 40]); mF = pick(r, [25, 30, 35]); mf = pick(r, [10, 15]); k = 1.7; var tl = pick(r, ['T', 'F']);
    var cor4 = [F('down', Math.round(mW * k), 'W', mW + ' N'), F('up', Math.round(mW * k), 'N', mW + ' N'), F('right', Math.round(mF * k), tl, mF + ' N'), F('left', Math.round(mf * k), 'f', mf + ' N')];
    wr = [[[F('down', Math.round(mW * k), 'W', mW + ' N'), F('up', Math.round((mW - 10) * k), 'N', (mW - 10) + ' N'), F('right', Math.round(mF * k), tl, mF + ' N'), F('left', Math.round(mf * k), 'f', mf + ' N')], 'size', 'The crate does not move up or down, so N equals W.'], [[F('down', Math.round(mW * k), 'W', mW + ' N'), F('up', Math.round(mW * k), 'N', mW + ' N'), F('right', Math.round(mf * k), tl, mf + ' N'), F('left', Math.round(mF * k), 'f', mF + ' N')], 'size', 'Pull and friction are swapped: the crate would slow down.'], [[F('down', Math.round(mW * k), 'W', mW + ' N'), F('up', Math.round(mW * k), 'N', mW + ' N'), F('right', Math.round(mF * k), tl, mF + ' N')], 'missing', 'Friction acts on the crate. Include it, with its own size.']];
    return { prompt: 'A ' + (tl === 'T' ? 'rope pulls' : 'person pushes') + ' a crate right with ' + mF + ' N. Friction is ' + mf + ' N and the crate weighs ' + mW + ' N. It speeds up. Which diagram has arrows drawn to scale?', cor: cor4, wr: wr, hint: 'Arrow length matches the size of the force. Does the crate move up or down?', worked: 'N equals W (' + mW + ' N). The right arrow (' + mF + ' N) is longer than the left (' + mf + ' N), so the net force is ' + (mF - mf) + ' N to the right.', misc: 'Students draw lengths that do not match the numbers, or let N differ from W.' };
  }

  var SKILLS = [
    { id: 'source', title: 'Name the objects in an interaction', gen: function (b, r) {
      if (b <= 1) { var t = pick(r, SRC1); return ch(t.s, t.a, t.o, 'Name an object that touches it, or the Earth. It cannot be the object itself.', t.w, 'Students let an object exert a force on itself, or name “motion” as the source.', t.y); }
      if (b === 2) { var u = pick(r, SRC2); return ch(u.s, u.a, u.o, 'A force is an interaction between two objects.', u.w, 'Students name one object, or a pair that does not touch.'); }
      if (b === 3) { var q3 = pick(r, [
        ['Which force acts on an object WITHOUT any object touching it?', 'Gravity', ['Normal force', 'Tension', 'Friction'], 'Three of these need contact. One works across a distance.'],
        ['Which of these is NOT a contact force?', 'Gravity', ['Friction', 'Tension', 'Normal force'], 'Which one works across a distance?'],
        ['A ball flies through the air with nothing touching it. Which force still acts on it?', 'Gravity', ['Normal force', 'Tension', 'Friction'], 'What force needs no touching?'],
        ['A skydiver’s jump is far above any surface. Which force from the Earth still acts?', 'Gravity', ['Normal force', 'Friction', 'Tension'], 'What force reaches across empty space?'],
        ['Which force needs the two objects to touch?', 'Friction', ['Gravity', 'Weight', 'The Earth’s pull'], 'Weight is another name for the Earth’s pull.'],
        ['Which force on a hanging lamp needs no contact?', 'Gravity', ['Tension in the chain', 'The chain’s pull', 'The normal force'], 'The chain touches the lamp. What does not need to?'],
        ['A magnet-free ball sits in the air above the table. Which force acts on it right now?', 'Gravity', ['Normal force', 'Tension', 'Friction'], 'Nothing touches it. Which force does not need touching?'],
        ['Which force would still act on a satellite-free rock in empty space near the Earth?', 'Gravity', ['Normal force', 'Friction', 'Tension'], 'Only one of these does not need a surface or a rope.']]);
      return ch(q3[0], q3[1], q3[2], q3[3], q3[1] === 'Gravity' ? 'Gravity is a field force: the Earth pulls without touching. Normal force, tension and friction need contact.' : 'Friction needs two surfaces in contact. Gravity and weight act at a distance.', 'Students call gravity a contact force because it “touches the ground”.'); }
      var kind = pick(r, ['lamp', 'sign', 'picture', 'plant pot', 'mirror', 'flag', 'clock', 'banner', 'lantern']), hold = pick(r, ['chain', 'rope']); return ch('A ' + kind + ' hangs from a ' + hold + ' fixed to the ceiling. Which list names every object that exerts a force ON the ' + kind + '?', 'The ' + hold + ' and the Earth', ['The ' + hold + ', the Earth and the ceiling', 'The ' + hold + ' only', 'The ceiling and the Earth'], 'Which objects touch the ' + kind + '? Which pulls from a distance?', 'The ' + hold + ' touches the ' + kind + ' and pulls up. The Earth pulls down at a distance. The ceiling touches the ' + hold + ', not the ' + kind + '.', 'Students include every object in the scene, not just those acting on this object.', ['', 'The ceiling touches the chain, not the ' + kind + '.', 'The Earth also pulls on the ' + kind + '.', 'The ceiling does not touch the ' + kind + '.']); } },
    { id: 'catalog', title: 'Sort and name the forces', gen: function (b, r) {
      if (b <= 1) { var t = pick(r, CAT1); return ch(t.s, t.a, t.o, 'Match the description to the force name in the catalog.', t.w, 'Students mix up normal force and gravity because both are vertical.'); }
      if (b === 2) { var u = pick(r, CAT2); return ch(u.s, u.a, u.o, 'Think about what the force does to the object.', u.w, 'Students think friction points the way the object moves, or that gravity stops at the top of a throw.'); }
      if (b === 3) { var f = pick(r, FORCES), field = !!FIELD[f], ph = pick(r, ['Is ' + f + ' a contact force or a field force?', 'Sort this force: ' + f + '. Contact or field?', 'What kind of force is ' + f + '?']); return ch(ph, field ? 'Field force' : 'Contact force', [field ? 'Contact force' : 'Field force', 'Neither'], 'Does the source object have to touch?', field ? 'Gravity acts across a distance: a field force.' : f.charAt(0).toUpperCase() + f.slice(1) + ' needs the two objects to touch: a contact force.', 'Students call gravity a contact force, or call normal force a field force.'); }
      var sc4 = pick(r, [['box', 'right', 'pulled', 'rope', 'T'], ['sled', 'left', 'pulled', 'rope', 'T'], ['crate', 'right', 'pushed', 'person', 'F'], ['cart', 'left', 'pushed', 'person', 'F'], ['trunk', 'right', 'pulled', 'strap', 'T'], ['wagon', 'left', 'pushed', 'person', 'F'], ['carton', 'right', 'pulled', 'cord', 'T'], ['cart', 'right', 'pushed', 'student', 'F'], ['barrel', 'left', 'pulled', 'rope', 'T']]);
      var scene = ['A ' + sc4[0] + ' is ' + sc4[2] + ' ' + sc4[1] + ' across a rough floor' + (sc4[2] === 'pulled' ? ' by a ' + sc4[3] : '') + '.', 'W, N, ' + sc4[4] + ', f', ['W, N, ' + sc4[4], 'W, N, ' + sc4[4] + ', f, force of motion', sc4[4] + ', f']];
      return ch(scene[0] + ' Which list names every force on it?', scene[1], scene[2], 'Start with gravity, then ask what touches the object.', 'Gravity (W) and the floor’s normal force (N) act on it, plus the pull or push and friction from the rough floor. Nothing else touches it.', 'Students add a “force of motion”, or forget the normal force and friction.', ['', 'This list leaves out a force.', 'Motion is not a force.', 'This list leaves out forces.']); } },
    { id: 'fbd', title: 'Pick the free-body diagram', gen: function (b, r) {
      var s = sceneFor(b, r), opts = [opt(s.cor, 'ok')].concat(s.wr.map(function (w) { return opt(w[0], w[1]); }));
      return { type: 'choice', grid: true, prompt: s.prompt, options: opts, answer: 0, hint: s.hint, worked: s.worked, misc: s.misc, why: [''].concat(s.wr.map(function (w) { return w[2]; })) }; } },
    { id: 'netdir', title: 'Which way is the net force?', gen: function (b, r) {
      var a, c, d;
      if (b <= 1) { a = INT(r, 4, 9); c = pick(r, ['right', 'left']); var one = r() < 0.5;
        return one ? ch('Only one force acts on a ball: ' + a + ' N down. Which way is the net force?', 'Down', ['Up', 'It is zero'], 'One force and nothing to oppose it.', 'With one force, the net force is that force: ' + a + ' N down.', 'Students think a net force needs two forces.', ['', 'Gravity pulls down, not up.', 'Nothing cancels it.'])
          : ch('A box has ' + a + ' N pushing right and ' + a + ' N pushing left. Which way is the net force?', 'It is zero', ['Right', 'Left'], 'Equal and opposite forces cancel.', 'Equal arrows in opposite directions cancel: the net force is zero.', 'Students think equal forces still “push” the box one way.', ['', 'The two pushes are equal.', 'The two pushes are equal.']); }
      if (b === 2) { var big = INT(r, 9, 14), sm = INT(r, 3, 7), dir = pick(r, ['right', 'left']), opp = dir === 'right' ? 'left' : 'right', cp = function (s) { return s.charAt(0).toUpperCase() + s.slice(1); };
        return ch('A crate has ' + big + ' N pulling ' + dir + ' and ' + sm + ' N of friction pulling ' + opp + '. Which way is the net force?', cp(dir), [cp(opp), 'It is zero'], 'Compare the sizes.', 'The bigger force is ' + big + ' N, ' + dir + '. The net force is ' + (big - sm) + ' N ' + dir + '.', 'Students take the net force along the motion, or call friction the “smaller force” and ignore it.', ['', 'That is the smaller force.', 'The forces are not equal.']); }
      if (b === 3) { var w3 = INT(r, 2, 6) * 10, push = INT(r, 8, 20), fr = push - pick(r, [0, 0, 4, 6]);
        var nd = push > fr ? 'Right' : 'It is zero';
        return ch('A crate weighs ' + w3 + ' N, the floor pushes up ' + w3 + ' N, a person pushes right ' + push + ' N, and friction is ' + fr + ' N left. Which way is the net force?', nd, push > fr ? ['It is zero', 'Left', 'Up'] : ['Right', 'Left', 'Up'], 'Cancel the up and down first. Then compare right and left.', 'Up and down cancel (' + w3 + ' N each). Right ' + push + ' N and left ' + fr + ' N: net ' + (push - fr) + ' N' + (push > fr ? ' right' : ', zero') + '.', 'Students try to add vertical and horizontal forces into one number.', push > fr ? ['', 'The push and friction are not equal.', 'Friction is smaller than the push.', 'The vertical forces cancel.'] : ['', 'Push and friction are equal.', 'Push and friction are equal.', 'The vertical forces cancel.']); }
      var T = INT(r, 12, 18), m4 = pick(r, [2, 2.5, 3]), W = m4 * G;
      return ch('A ' + m4 + ' kg lamp (weight ' + f1(W) + ' N) hangs from a chain pulling up ' + T + ' N. Which way is the net force?', T > W ? 'Up' : 'Down', [T > W ? 'Down' : 'Up', 'It is zero'], 'Find the weight first: W = m g with g = 9.8 N/kg.', 'W = ' + m4 + ' × 9.8 = ' + f1(W) + ' N. The chain pulls ' + T + ' N. The ' + (T > W ? 'chain' : 'weight') + ' is bigger, so the net force points ' + (T > W ? 'up' : 'down') + '.', 'Students assume a hanging object is always balanced.'); } },
    { id: 'net', title: 'Find the net force', gen: function (b, r) {
      var a, c, d, m;
      if (b <= 1) { a = INT(r, 5, 15); c = INT(r, 2, a - 1); return { type: 'num', prompt: 'A cart is pushed right with ' + a + ' N and friction pulls left with ' + c + ' N. How big is the net force?', answer: a - c, unit: 'N', hint: 'Opposite directions: subtract.', worked: a + ' − ' + c + ' = ' + (a - c) + ' N, to the right.', misc: 'Students add forces that point opposite ways.' }; }
      if (b === 2) { a = pick(r, [12.5, 14.5, 16.5, 18.5, 22.5, 24.5]); c = pick(r, [3.5, 4.5, 6.5, 8.5]); var o2 = pick(r, ['sled', 'cart', 'wagon', 'crate']); return { type: 'num', prompt: 'A ' + o2 + ' is pulled right with ' + a + ' N. Friction is ' + c + ' N left. How big is the net force?', answer: a - c, unit: 'N', hint: 'Subtract the smaller force from the larger.', worked: a + ' − ' + c + ' = ' + f1(a - c) + ' N.', misc: 'Students drop the decimal or add the forces.' }; }
      if (b === 3) { m = pick(r, [2, 3, 5]); a = INT(r, 15, 30); c = INT(r, 4, 12); var Wt = m * G; return { type: 'num', prompt: 'A ' + m + ' kg box (weight ' + f1(Wt) + ' N, floor pushes up ' + f1(Wt) + ' N) is pushed right with ' + a + ' N. Friction is ' + c + ' N. What is the net force?', answer: a - c, unit: 'N', hint: 'Up and down cancel. Only the right and left forces count.', worked: 'Up and down cancel. Net = ' + a + ' − ' + c + ' = ' + (a - c) + ' N, to the right.', misc: 'Students include weight in a horizontal net force.' }; }
      var p1 = INT(r, 14, 24), p2 = INT(r, 8, 14), fr = INT(r, 4, 12); return { type: 'num', prompt: 'Two people push a crate right with ' + p1 + ' N and ' + p2 + ' N while friction pulls left with ' + (fr + p2 - 4) + ' N. What is the net force?', answer: p1 + p2 - (fr + p2 - 4), unit: 'N', hint: 'Add the forces in each direction first, then subtract.', worked: 'Right: ' + p1 + ' + ' + p2 + ' = ' + (p1 + p2) + ' N. Left: ' + (fr + p2 - 4) + ' N. Net = ' + (p1 + p2) + ' − ' + (fr + p2 - 4) + ' = ' + (p1 - fr + 4) + ' N right.', misc: 'Students subtract in the order they read the numbers.' }; } },
    { id: 'pair', title: 'Two objects, one diagram', gen: function (b, r) {
      var mA, mB;
      if (b <= 1) { var o1 = pick(r, ['box', 'book', 'bag', 'cup', 'toy', 'jar', 'bucket', 'phone']), s1 = pick(r, ['table', 'desk', 'shelf', 'bench']); return ch('A ' + o1 + ' sits on a ' + s1 + '. Which force does NOT act ON the ' + o1 + '?', 'The ' + o1 + '’s push on the ' + s1, ['Gravity on the ' + o1, 'The ' + s1 + '’s push up on the ' + o1], 'A free-body diagram only has forces ON the ' + o1 + '.', 'The ' + o1 + ' pushes on the ' + s1 + ', so that force acts on the ' + s1 + '. A diagram of the ' + o1 + ' shows only forces on the ' + o1 + '.', 'Students draw the object’s force on the table as a force on the object.', ['', 'Gravity acts on the ' + o1 + '.', 'The ' + s1 + '’s push up acts on the ' + o1 + '.']); }
      if (b === 2) { var tp = pick(r, ['box', 'book', 'crate', 'brick', 'case', 'tray', 'carton', 'suitcase', 'plank']); return ch('A ' + tp + ' A sits on a ' + tp + ' B, and B sits on a table. Which list names the forces on ' + tp + ' A?', 'Gravity on A, and B’s push up', ['Gravity on A, B’s push up, and the table’s push up', 'Gravity on A and on B', 'Gravity on A only'], 'Only objects touching A, and the Earth, act on A.', 'A is touched only by B, so B pushes up on it. The table touches B, not A.', 'Students list every force in the picture on every object.', ['', 'The table touches B, not A.', 'Gravity on B acts on B.', 'B also pushes up on A.']); }
      if (b === 3) { mA = pick(r, [1, 2, 3, 4]); mB = pick(r, [1, 2, 3, 4, 5]); var Nn = (mA + mB) * G; return { type: 'num', prompt: 'Box A (' + mA + ' kg) sits on box B (' + mB + ' kg). The table pushes up on B. How hard does the table push, in newtons? (g = 9.8 N/kg)', answer: Nn, unit: 'N', hint: 'Treat A and B as one object. What does the table hold up?', worked: 'The table holds up both: N = (' + mA + ' + ' + mB + ') × 9.8 = ' + f1(Nn) + ' N.', misc: 'Students count only the lower box’s weight.' }; }
      var pull = INT(r, 20, 35), fr = INT(r, 6, 12); return { type: 'num', prompt: 'Boxes of 2 kg and 3 kg are tied together and pulled right with ' + pull + ' N. Friction on the pair totals ' + fr + ' N. What is the net force on the pair?', answer: pull - fr, unit: 'N', hint: 'Treat the two boxes as one system and subtract.', worked: pull + ' − ' + fr + ' = ' + (pull - fr) + ' N to the right. The tension between the boxes is inside the system and does not count.', misc: 'Students add the tension between the boxes into the net force.' }; } }
  ];

  var SPEC = {
    id: 'fbd-net-force', course: 'physics', unit: 'Forces and Newton’s Laws', title: 'Free-Body Diagrams and Net Force', slot: 4,
    question: 'Which forces act on an object, and which way do they add up?',
    /* one sentence each, "I can ..." */
    targets: ['I can name the two objects in any force interaction.', 'I can sort forces as contact or field forces.', 'I can draw a free-body diagram and find the net force.'],
    tabs: ['Warm-up', 'Predict', 'Explore', 'Huddle', 'Build', 'Practice', 'Check'],
    huddleTarget: 'I can label forces on a free-body diagram and add them.',
    exploreTarget: 'I can sort each force as contact or field.',

    concepts: [
      { title: 'A force is an interaction', points: ['A force is a push or pull by one object on another.', 'Name both objects. An object cannot push itself.'], eq: 'F on A by B' },
      { title: 'The force catalog', points: ['Gravity (weight) pulls down. It is a field force.', 'Normal force pushes away from a touching surface.', 'Tension pulls along a rope. Friction opposes sliding.', 'Applied force is a direct push or pull.'], eq: 'W = m g' },
      { title: 'Free-body diagram', points: ['One object, one arrow per force on it.', 'Arrow length shows the size of the force.', 'Motion is not a force. Never draw one.'], eq: 'arrows on ONE object' },
      { title: 'Net force', points: ['Add forces that point the same way. Subtract opposite ones.', 'The net force points the way the object speeds up.', 'Zero net force: still, or constant velocity.'], eq: 'F_net = ΣF' }
    ],

    /* [[blank]] = a write-on blank. Short answers only. */
    huddle: {
      defs: [
        { term: 'Free-body diagram', text: 'A [[picture]] of one object with an [[arrow]] for each force on it.' },
        { term: 'Normal force', text: 'The push of a [[surface]] on an object, [[perpendicular]] to the surface.' },
        { term: 'Net force', text: 'The [[sum]] of all the forces on an object, with [[direction]].' }
      ],
      example: { prompt: 'A crate has W = 40 N down, N = 40 N up, a push of 20 N right, and friction of 8 N left. Find the net force.',
        steps: ['Up and down: 40 N and 40 N [[cancel]].', 'Right and left: 20 − 8 = [[12]] N.', 'Net force: 12 N to the [[right]].', 'The crate [[speeds up]] to the right.'] },
      label: { title: 'Label the crate', html: fbd([F('down', 62, 'W'), F('up', 62, 'N'), F('right', 95, 'F'), F('left', 45, 'f')]).replace('</svg>', '<circle cx="262" cy="134" r="12" fill="#b3412e"/><text x="262" y="141" font-size="18" font-weight="700" fill="#fff" text-anchor="middle">1</text><circle cx="86" cy="134" r="12" fill="#b3412e"/><text x="86" y="141" font-size="18" font-weight="700" fill="#fff" text-anchor="middle">2</text><circle cx="120" cy="170" r="12" fill="#b3412e"/><text x="120" y="177" font-size="18" font-weight="700" fill="#fff" text-anchor="middle">3</text><circle cx="120" cy="52" r="12" fill="#b3412e"/><text x="120" y="59" font-size="18" font-weight="700" fill="#fff" text-anchor="middle">4</text></svg>'),
        tags: [{ n: 1, text: 'The [[applied force]] pushes right.' }, { n: 2, text: '[[Friction]] opposes the slide.' }, { n: 3, text: '[[Gravity]] pulls down.' }, { n: 4, text: 'The [[normal force]] pushes up.' }] }
    },

    predicts: [
      { id: 'P1', title: 'A book on a table', prompt: 'A book rests on a table. How many forces act on the book?',
        options: ['Two: gravity down and the table’s push up', 'None: it is not moving', 'One: gravity', 'Three: gravity, the table and the book’s “weight force”'], answer: 0, why: 'Gravity pulls down and the table pushes up. They are equal, so the net force is zero.' },
      { id: 'P2', title: 'A crate at steady speed', prompt: 'A crate slides to the right at constant speed. A person pushes it. How does the push compare with friction?',
        options: ['The push equals friction', 'The push is bigger than friction', 'The push is smaller than friction', 'There is no friction'], answer: 0, why: 'Constant speed means zero net force, so the push and friction are equal.' },
      { id: 'P3', title: 'A crate speeding up', prompt: 'The same crate now speeds up to the right. Which way does the net force point?',
        options: ['To the right', 'To the left', 'There is no net force', 'Up'], answer: 0, why: 'The net force points the way the crate speeds up: the push beats friction.' }
    ],

    /* the Explore tab: the force catalog picture, then these after the student has clicked through it */
    observe: [
      { id: 'O1', prompt: 'Which force acts without touching?', options: ['Gravity', 'Normal force', 'Friction'], answer: 0 },
      { id: 'O2', prompt: 'Which force always pushes away from a surface?', options: ['Normal force', 'Gravity', 'Tension'], answer: 0 }
    ],
    catalogRows: [
      { f: 'Gravity (weight)', sym: 'W', source: 'The Earth', kind: 'Field', dir: 'Down', note: 'W = m g. Always there.' },
      { f: 'Normal force', sym: 'N', source: 'A surface', kind: 'Contact', dir: 'Away from the surface', note: 'Perpendicular to the surface.' },
      { f: 'Tension', sym: 'T', source: 'A rope or chain', kind: 'Contact', dir: 'Along the rope, away from the object', note: 'Ropes pull, never push.' },
      { f: 'Friction', sym: 'f', source: 'A rough surface', kind: 'Contact', dir: 'Opposite the sliding', note: 'Grows to match a push until it slips.' },
      { f: 'Applied force', sym: 'F', source: 'A person or object', kind: 'Contact', dir: 'The way it pushes or pulls', note: 'A direct push or pull.' }
    ],

    vp: VP, gate: GATE, situations: SITUATIONS, skills: SKILLS,
    fbd: fbd, fbdOption: opt, FORCE: F,

    /* Teacher key: what students get wrong, and the one-line fix. */
    misconceptions: [
      { say: 'The crate needs a force of motion pushing it forward.', fix: 'Motion is not a force. Name the object that exerts every arrow. At constant speed the net force is zero.' },
      { say: 'A book at rest has no forces on it, or only gravity.', fix: 'The table pushes up. At rest the forces balance: N equals W.' },
      { say: 'The ceiling pulls on the hanging lamp.', fix: 'Only objects touching the lamp (the chain) and the Earth act on it.' },
      { say: 'Gravity is a contact force.', fix: 'Gravity is a field force. It acts without touching.' },
      { say: 'Friction points the way the object moves.', fix: 'Friction opposes the sliding between surfaces.' },
      { say: 'Add all the numbers to get the net force.', fix: 'Add forces that point the same way. Subtract opposite ones. Vertical and horizontal do not mix.' }
    ],

    /* Pacing: core (prio 1) is at most 60% of the budget. The huddle comes from the clock, not from progress. */
    pacing: { budgetMin: 42,
      steps: [
        { id: 'start', prio: 1, min: 2 }, { id: 'warmup', prio: 1, min: 6 }, { id: 'predict', prio: 1, min: 3 },
        { id: 'explore', prio: 3, min: 4 }, { id: 'build', prio: 2, min: 10, minItems: 6, parts: 12 },
        { id: 'practice', prio: 1, min: 5 }, { id: 'check', prio: 1, min: 3 }
      ],
      huddles: [{ key: 'h1', atMin: 16 }] }
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = SPEC; else (root.SPECS = root.SPECS || {})[SPEC.id] = SPEC;
})(typeof window !== 'undefined' ? window : globalThis);
