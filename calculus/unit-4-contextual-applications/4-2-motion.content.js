/* LESSON (calculus 4.2): the wiring is LK.standard (physics/lessons/engine/standard.js, selfPaced branch). Edit spec.js for the teaching.
   This file draws the Explore tab: four hands-on stations (X1 to X4), solved in order. Every picture has a "How to read it" line.
   One particle moves on a line with position s(t) = t³ − 6t² + 9t meters, for t from 0 to 4 seconds. v = 3t² − 12t + 9 and a = 6t − 12. */
(function () {
  'use strict';
  var LE = window.LE, el = LE.el, XK = window.XK, fm = XK.fm, S = XK.sv;
  var s = function (t) { return t * t * t - 6 * t * t + 9 * t; }, v = function (t) { return 3 * t * t - 12 * t + 9; }, a = function (t) { return 6 * t - 12; };
  var name = function (x) { return x > 0.001 ? 'moving right' : x < -0.001 ? 'moving left' : 'at rest right now'; };

  /* A number line from -1 to 5 meters with the particle, a green velocity arrow and an orange acceleration arrow.
     opts.showA false hides the acceleration arrow. Returns {set(t)}. */
  function track(host, opts) {
    var svg = S('svg', { viewBox: '0 0 420 156', role: 'img', 'aria-label': 'A number line from minus one to five meters with the particle as a dot, a green arrow for velocity and an orange arrow for acceleration', style: 'width:100%;max-width:460px;background:var(--stage);border:1px solid var(--line);border-radius:8px;display:block' }, host), i;
    var X = function (m) { return 30 + (m + 1) * 60; };
    S('line', { x1: X(-1), y1: 118, x2: X(5), y2: 118, stroke: '#7a8a99', 'stroke-width': 2 }, svg);
    for (i = -1; i <= 5; i++) { S('line', { x1: X(i), y1: 113, x2: X(i), y2: 123, stroke: '#7a8a99' }, svg); S('text', { x: X(i), y: 138, 'font-size': 11, 'text-anchor': 'middle', fill: XK.INK }, svg).textContent = i; }
    S('text', { x: 415, y: 148, 'font-size': 11, 'text-anchor': 'end', fill: XK.INK }, svg).textContent = 'meters';
    var dot = S('circle', { r: 8, fill: XK.INK }, svg), vl = S('line', { stroke: XK.GREEN, 'stroke-width': 4 }, svg), vh = S('polygon', { fill: XK.GREEN }, svg), vt = S('text', { 'font-size': 12, fill: XK.GREEN, 'font-weight': 700 }, svg);
    var al = S('line', { stroke: XK.ORANGE, 'stroke-width': 4 }, svg), ah = S('polygon', { fill: XK.ORANGE }, svg), at = S('text', { 'font-size': 12, fill: XK.ORANGE, 'font-weight': 700 }, svg);
    function arrow(line, head, label, x0, y, val, scale, text) {
      var d = val * scale, dir = d >= 0 ? 1 : -1, x1 = x0 + d;
      if (Math.abs(d) < 2) { line.setAttribute('x1', x0); line.setAttribute('x2', x0); line.setAttribute('y1', y); line.setAttribute('y2', y); head.setAttribute('points', ''); }
      else { line.setAttribute('x1', x0); line.setAttribute('x2', x1 - dir * 4); line.setAttribute('y1', y); line.setAttribute('y2', y); head.setAttribute('points', (x1 - dir * 12) + ',' + (y - 8) + ' ' + x1 + ',' + y + ' ' + (x1 - dir * 12) + ',' + (y + 8)); }
      label.setAttribute('x', Math.max(30, Math.min(390, x0 + d / 2))); label.setAttribute('y', y - 12); label.setAttribute('text-anchor', 'middle'); label.textContent = text;
    }
    host.appendChild(svg);
    return { set: function (t) {
      var x0 = X(s(t)); dot.setAttribute('cx', x0); dot.setAttribute('cy', 118);
      arrow(vl, vh, vt, x0, 80, v(t), 5, 'v = ' + fm(v(t)));
      if (opts && opts.showA === false) { al.setAttribute('x2', al.getAttribute('x1') || 0); ah.setAttribute('points', ''); at.textContent = ''; }
      else arrow(al, ah, at, x0, 42, a(t), 5, 'a = ' + fm(a(t)));
    } };
  }
  /* a small graph of one of s, v, a for t from 0 to 4 */
  function mini(host, fn, y0, y1, ys, color, label) { var G = XK.plot(host, { xmin: 0, xmax: 4, ymin: y0, ymax: y1, xstep: 1, ystep: ys, w: 220, h: 200, max: 230, label: label }); XK.curve(G, fn, 0, 4, color); return G; }

  LK.standard(window.SPECS['4-2-motion'], { prefix: 'MOT', explore: function (card) {
    card.appendChild(el('p', 'qtext', 'Four stations, in order. Move things with the sliders and buttons. There is no clock: take your time, and if you stop, your work is saved on this device for tomorrow.'));

    /* ---- Station 1: watch the particle ---- */
    LE.ask(card, { id: 'X1', type: 'custom', head: 'Station 1 · Watch the particle', maxMiss: 8, answer: 3,
      prompt: 'A particle moves along a line. Slide the time and watch the dot and the two arrows. Do the three jobs.',
      keyText: 'Job 1: moving right (t below 1, or t above 3). Job 2: moving left (t between 1 and 3). Job 3: at rest (t = 1 or t = 3).',
      worked: 'v(t) = 3t² − 12t + 9 = 3(t − 1)(t − 3). It is positive for t < 1 and t > 3, negative between 1 and 3, and 0 at t = 1 and t = 3.',
      build: function (w, ctl, api) {
        if (api.done) { w.appendChild(el('p', 'hint', 'Station done: the sign of the velocity (green arrow) gives the direction. Zero velocity means at rest for an instant.')); return; }
        XK.guide(w, 'The black dot is the particle on a line measured in meters. Right is positive. The green arrow is its velocity: it points the way the particle is moving, and a longer arrow means faster. The orange arrow is its acceleration. The numbers are in the sentence under the picture.');
        var T = track(w), head = el('p', 'qtext'), row = el('div', 'row'), out = el('p', 'qtext'), k = 0, t = 0;
        w.appendChild(head); w.appendChild(row); w.appendChild(out);
        var jobs = ['Job 1 of 3: put the time where the particle is MOVING RIGHT.', 'Job 2 of 3: put the time where the particle is MOVING LEFT.', 'Job 3 of 3: put the time where the particle is AT REST.'];
        function upd() { t = +sl.value / 10; T.set(t); out.textContent = 't = ' + fm(t, 1) + ' s   ·   position s = ' + fm(s(t)) + ' m   ·   velocity v = ' + fm(v(t)) + ' m/s (' + name(v(t)) + ')   ·   acceleration a = ' + fm(a(t)) + ' m/s²'; }
        var sl = XK.slider(row, 'Slide the time', 0, 40, 1, 20, upd);
        XK.checkBtn(ctl, 'Check: this job is done', function () {
          var ok = k === 0 ? v(t) > 0.01 : k === 1 ? v(t) < -0.01 : Math.abs(v(t)) < 0.01;
          if (ok) { k++; if (k === 3) { api.solve(); return; } head.textContent = jobs[k]; }
          else api.miss('The velocity is ' + fm(v(t)) + ' here, so the particle is ' + name(v(t)) + '. ' + (k === 2 ? 'At rest needs a velocity of exactly 0: look for where the green arrow disappears.' : 'Try another time.'));
        });
        head.textContent = jobs[0]; upd();
      } });

    /* ---- Station 2: speeding up or slowing down ---- */
    LE.ask(card, { id: 'X2', type: 'custom', head: 'Station 2 · Speeding up or slowing down?', maxMiss: 10, answer: 5,
      prompt: 'Four moments in the particle\'s trip. For each, look at the two arrows and say whether it is speeding up or slowing down. Then say the rule.',
      keyText: 't = 0.5 slowing down, t = 1.5 speeding up, t = 2.5 slowing down, t = 4 speeding up. Rule: same direction speeds up, opposite directions slows down.',
      worked: 'Speeding up means the acceleration pushes the same way the particle moves (v and a have the same sign). Slowing down means they point opposite ways.',
      build: function (w, ctl, api) {
        if (api.done) { w.appendChild(el('p', 'hint', 'Station done: v and a pointing the same way means speeding up. Opposite ways means slowing down.')); return; }
        XK.guide(w, 'The green arrow is the velocity and the orange arrow is the acceleration at one moment. Compare which way they point. Do not worry about the length for now.');
        var T = track(w), TS = [0.5, 1.5, 2.5, 4], right = [1, 0, 1, 0], j = 0, head = el('p', 'qtext'), tail = el('div'); w.appendChild(head); w.appendChild(tail);
        function ask() { tail.innerHTML = ''; var t = TS[j]; T.set(t); head.textContent = 'Moment ' + (j + 1) + ' of 4: t = ' + t + ' seconds. v = ' + fm(v(t)) + ' and a = ' + fm(a(t)) + '. Is the particle speeding up or slowing down?';
          XK.choices(tail, ['speeding up', 'slowing down'], 'x2:' + j, function (i, b) {
            if (i === right[j]) { b.classList.add('good'); j++; if (j === 4) rule(); else ask(); }
            else api.miss('Look at the two arrows at t = ' + t + '. They point ' + (Math.sign(v(t)) === Math.sign(a(t)) ? 'the same way, which means the particle speeds up.' : 'opposite ways, which means the particle slows down.')); }); }
        function rule() { tail.innerHTML = ''; head.textContent = 'The rule. When the velocity and the acceleration point the SAME way, the particle is…';
          XK.choices(tail, ['speeding up', 'slowing down', 'at rest', 'turning around'], 'x2:rule', function (i, b) { if (i === 0) { b.classList.add('good'); tail.innerHTML = ''; head.textContent = 'Rule found. Opposite ways means slowing down.'; api.solve(); } else api.miss('Compare moments 2 and 4: the arrows pointed the same way both times. What was the particle doing?'); }); }
        ask();
      } });

    /* ---- Station 3: match the three graphs ---- */
    LE.ask(card, { id: 'X3', type: 'custom', head: 'Station 3 · Match the three graphs', maxMiss: 9, answer: 3,
      prompt: 'Three graphs of the same trip are mixed up and have letters. They are the position s, the velocity v and the acceleration a. Say which letter is which.',
      keyText: 's is the cubic, v is the parabola, a is the straight line. (The letters are shuffled for each student.)',
      worked: 'v is the slope of s, so v is 0 where s has a flat tangent (t = 1 and t = 3). a is the slope of v, so a is 0 where v has a flat tangent (t = 2).',
      build: function (w, ctl, api) {
        if (api.done) { w.appendChild(el('p', 'hint', 'Station done: each graph in the chain is the slope of the one before it.')); return; }
        XK.guide(w, 'Three graphs of one trip, time across the bottom from 0 to 4 seconds. The height of each graph is its own thing (meters, meters per second, meters per second squared). Look at where one graph has a flat tangent and where the next graph crosses zero.');
        var fns = [s, v, a], cfg = [[-1, 5, 1, XK.BLUE], [-4, 10, 2, XK.GREEN], [-12, 12, 6, XK.ORANGE]], names = ['s (position)', 'v (velocity)', 'a (acceleration)'], order = LE.shuffle([0, 1, 2], LE.seedRng('mot-x3')), box = el('div', 'row'), letters = ['A', 'B', 'C'], k = 0;
        w.appendChild(box);
        order.forEach(function (fi, i) { var wrap = el('div'); wrap.style.cssText = 'flex:1 1 200px;max-width:240px;min-width:0'; box.appendChild(wrap);
          var G = mini(wrap, fns[fi], cfg[fi][0], cfg[fi][1], cfg[fi][2], cfg[fi][3], 'Graph ' + letters[i]); S('text', { x: 60, y: 28, 'font-size': 20, 'font-weight': 700, fill: XK.INK }, G.svg).textContent = letters[i]; });
        var head = el('p', 'qtext'), tail = el('div'); w.appendChild(head); w.appendChild(tail);
        var hints = ['Which graph is the position s? Hint: s has flat tangents at t = 1 and t = 3, and the velocity graph is zero at those same times.', 'Which graph is the velocity v? Hint: v is the slope of s, so it is 0 at t = 1 and t = 3, and it has a flat tangent at t = 2.', 'Which graph is the acceleration a? Hint: a is the slope of v, so it is 0 where v has its flat tangent.'];
        function ask() { tail.innerHTML = ''; head.textContent = hints[k]; var row = el('div', 'row'); tail.appendChild(row);
          letters.forEach(function (L, i) { var b = el('button', 'btn', 'Graph ' + L); b.type = 'button'; b.onclick = function () {
            if (order[i] === k) { b.classList.add('good'); k++; if (k === 3) { tail.innerHTML = ''; head.textContent = 'All three matched.'; api.solve(); } else ask(); }
            else api.miss('Not that one. This graph is ' + names[order[i]] + ', not ' + names[k] + '. ' + (k === 0 ? 'Find the graph with two flat spots.' : 'Line up flat tangents with where the next graph crosses zero.')); };
            row.appendChild(b); }); }
        ask();
      } });

    /* ---- Station 4: speed is the size of velocity ---- */
    LE.ask(card, { id: 'X4', type: 'custom', head: 'Station 4 · Speed is the size of the velocity', maxMiss: 8, answer: 3,
      prompt: 'Three moments with a negative velocity. Say the particle\'s speed each time.',
      keyText: 'v = −3 gives speed 3. v = −2.25 gives speed 2.25. v = −1.08 gives speed 1.08.',
      worked: 'Speed is how fast, with no direction, so it is the absolute value of the velocity: |−3| = 3.',
      build: function (w, ctl, api) {
        if (api.done) { w.appendChild(el('p', 'hint', 'Station done: speed = |v|. It is never negative.')); return; }
        XK.guide(w, 'The green arrow is the velocity: a negative number means it points left. Speed has no direction, so the speed is just how long the arrow is, as a positive number.');
        var T = track(w, { showA: false }), TS = [2, 1.5, 1.2], j = 0, head = el('p', 'qtext'), tail = el('div'); w.appendChild(head); w.appendChild(tail);
        function ask() { tail.innerHTML = ''; var t = TS[j], sp = Math.abs(v(t)); T.set(t); head.textContent = 'Moment ' + (j + 1) + ' of 3: t = ' + t + ' seconds, and the velocity is ' + fm(v(t)) + ' meters per second. What is the speed?';
          XK.choices(tail, [fm(sp) + ' m/s', fm(-sp) + ' m/s', '0 m/s', fm(2 * sp) + ' m/s'], 'x4:' + j, function (i, b) {
            if (i === 0) { b.classList.add('good'); j++; if (j === 3) { tail.innerHTML = ''; head.textContent = 'All three right.'; api.solve(); } else ask(); }
            else api.miss(i === 1 ? 'A speed cannot be negative. Speed is the size of the velocity, without the direction.' : 'Speed is the size of the velocity. Drop the minus sign and keep the number.'); }); }
        ask();
      } });
  } });
})();
