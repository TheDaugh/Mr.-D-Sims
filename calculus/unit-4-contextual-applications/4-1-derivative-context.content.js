/* LESSON (calculus 4.1): the wiring is LK.standard (physics/lessons/engine/standard.js, selfPaced branch). Edit spec.js for the teaching.
   This file draws the Explore tab: four hands-on stations (X1 to X4), solved in order. Every picture has a "How to read it" line.
   The student moves things and reads what the picture says; the only arithmetic is reading a number off the screen. */
(function () {
  'use strict';
  var LE = window.LE, el = LE.el, XK = window.XK, fm = XK.fm;
  var V = function (t) { return 40 + 12 * t - t * t; }, Vp = function (t) { return 12 - 2 * t; };

  LK.standard(window.SPECS['4-1-derivative-context'], { prefix: 'DCX', explore: function (card) {
    card.appendChild(el('p', 'qtext', 'Four stations, in order. Move things with the sliders and buttons. There is no clock: take your time, and if you stop, your work is saved on this device for tomorrow.'));

    /* ---- Station 1: read the rate ---- */
    LE.ask(card, { id: 'X1', type: 'custom', head: 'Station 1 · Read the rate', maxMiss: 8, answer: 3,
      prompt: 'A tank holds V(t) gallons of water, t minutes after noon. Slide the time and read the rate. Do the three jobs.',
      keyText: 'Job 1: t = 2 (filling at 8). Job 2: t = 6 (neither filling nor emptying, rate 0). Job 3: t = 8 (emptying at 4).',
      worked: 'V′(t) = 12 − 2t. It equals 8 at t = 2, 0 at t = 6 and −4 at t = 8.',
      build: function (w, ctl, api) {
        if (api.done) { w.appendChild(el('p', 'hint', 'Station done: the rate is the slope of the tangent. Positive slope is filling, zero slope is steady, negative slope is emptying.')); return; }
        XK.guide(w, 'The blue curve is the gallons in the tank. The red dot is the tank at the time you choose, and the red line is the tangent there. The sentence under the graph gives the rate: the slope of the red line, in gallons per minute.');
        var G = XK.plot(w, { xmin: 0, xmax: 10, ymin: 0, ymax: 80, xstep: 2, ystep: 20, xlabel: 'minutes after noon', ylabel: 'gallons', label: 'Gallons of water in the tank over ten minutes: it rises, peaks near six minutes, then falls' });
        XK.curve(G, V, 0, 10, XK.BLUE);
        var tan = XK.line(G, XK.RED), dot = XK.dot(G, XK.RED), head = el('p', 'qtext'), row = el('div', 'row'), out = el('p', 'qtext'), k = 0, t = 3;
        w.appendChild(head); w.appendChild(row); w.appendChild(out);
        var jobs = ['Job 1 of 3: put the time where the tank is FILLING at 8 gallons per minute.', 'Job 2 of 3: put the time where the tank is neither filling nor emptying.', 'Job 3 of 3: put the time where the tank is EMPTYING at 4 gallons per minute.'], want = [8, 0, -4];
        function upd() { t = +sl.value / 2; XK.setDot(G, dot, t, V(t)); XK.through(G, tan, t, V(t), Vp(t), 1.4);
          var r = Vp(t); out.textContent = 't = ' + fm(t) + ' minutes   ·   water: ' + fm(V(t)) + ' gallons   ·   rate V′(t): ' + fm(r) + ' gallons per minute (' + (r > 0 ? 'filling' : r < 0 ? 'emptying' : 'not changing right now') + ')'; }
        var sl = XK.slider(row, 'Slide the time', 0, 20, 1, 6, upd);
        XK.checkBtn(ctl, 'Check: this job is done', function () {
          if (Math.abs(Vp(t) - want[k]) < 0.01) { k++; if (k === 3) { api.solve(); return; } head.textContent = jobs[k]; }
          else api.miss('The rate is ' + fm(Vp(t)) + ' gallons per minute here. You want ' + fm(want[k]) + '. ' + (Vp(t) > want[k] ? 'The tank is filling too fast: try a later time.' : 'The rate is too low: try an earlier time.'));
        });
        head.textContent = jobs[0]; upd();
      } });

    /* ---- Station 2: say it with units ---- */
    LE.ask(card, { id: 'X2', type: 'custom', head: 'Station 2 · Say it with units', maxMiss: 9, answer: 3,
      prompt: 'Each round gives you a derivative fact. Pick the sentence that says what it means, with direction and units.',
      keyText: 'Round 1: filling at 6 gallons per minute. Round 2: cooling at 2 degrees per minute. Round 3: each extra shirt adds about 5 dollars. (The order of the buttons is shuffled for each student.)',
      worked: 'A derivative is a rate: units of the output per unit of the input. The sign gives the direction.',
      build: function (w, ctl, api) {
        if (api.done) { w.appendChild(el('p', 'hint', 'Station done: direction from the sign, size from the number, units "output per input".')); return; }
        XK.guide(w, 'The fact is the line in blue. The right sentence names the direction (from the sign), the size, and the units written as "output per input". A wrong sentence swaps the units, forgets that it is a rate, or flips the direction.');
        var R = [{ fact: 'V′(3) = 6, where V is gallons of water in a tank and t is minutes.', right: 'At 3 minutes, the tank is filling at 6 gallons per minute.', wrong: ['At 3 minutes, the tank holds 6 gallons.', 'At 3 minutes, the tank is filling at 6 minutes per gallon.', 'At 3 minutes, the tank is emptying at 6 gallons per minute.'] },
                 { fact: 'T′(10) = −2, where T is the coffee temperature in degrees and t is minutes.', right: 'At 10 minutes, the coffee is cooling at 2 degrees per minute.', wrong: ['At 10 minutes, the coffee is warming at 2 degrees per minute.', 'At 10 minutes, the coffee is 2 degrees.', 'At 10 minutes, the coffee is cooling at 10 degrees per minute.'] },
                 { fact: 'C′(40) = 5, where C is the cost in dollars of making x shirts.', right: 'After 40 shirts, each extra shirt adds about 5 dollars to the cost.', wrong: ['Making 40 shirts costs 5 dollars.', 'After 40 shirts, each extra dollar adds 5 shirts.', 'Making 5 shirts costs 40 dollars.'] }], j = 0, head = el('p', 'qtext'), tail = el('div');
        w.appendChild(head); w.appendChild(tail);
        function ask() { tail.innerHTML = ''; head.textContent = 'Round ' + (j + 1) + ' of 3. Fact: ' + R[j].fact;
          XK.choices(tail, [R[j].right].concat(R[j].wrong), 'x2:' + j, function (i, b) {
            if (i === 0) { b.classList.add('good'); j++; if (j === 3) { tail.innerHTML = ''; head.textContent = 'All three said right.'; api.solve(); } else ask(); }
            else api.miss('Not that one. Check three things: is the sign right, is the number a rate (not an amount), and are the units "output per input"?'); }); }
        ask();
      } });

    /* ---- Station 3: how far can you trust a rate ---- */
    LE.ask(card, { id: 'X3', type: 'custom', head: 'Station 3 · How far can you trust a rate?', maxMiss: 8, answer: 3,
      prompt: 'At t = 3 minutes the tank holds 67 gallons and fills at 6 gallons per minute. Use that rate to guess the water h minutes later, and see how good the guess is.',
      keyText: 'Job 1: h about 0.5 (gap under 0.5). Job 2: h above 2 (gap over 4). Answer: the estimate is best when h is small.',
      worked: 'The tangent estimate is 67 + 6h. The true amount is V(3 + h). The gap between them is h², so it is tiny for small h and grows fast.',
      build: function (w, ctl, api) {
        if (api.done) { w.appendChild(el('p', 'hint', 'Station done: f(a + h) ≈ f(a) + h f′(a). The estimate is best when h is small.')); return; }
        XK.guide(w, 'The blue curve is the true amount of water. The red line is the tangent at t = 3, which is the "keep filling at 6 the whole time" guess. The red dot is the estimate on that line, and the orange dot is the true amount at the same time. The gap between the dots is the error.');
        var G = XK.plot(w, { xmin: 0, xmax: 10, ymin: 0, ymax: 80, xstep: 2, ystep: 20, xlabel: 'minutes after noon', ylabel: 'gallons', label: 'The tank curve with its tangent line at three minutes and two dots h minutes later' });
        XK.curve(G, V, 0, 10, XK.BLUE); var tan = XK.line(G, XK.RED); XK.through(G, tan, 3, V(3), Vp(3), 3.6);
        XK.setDot(G, XK.dot(G, XK.INK), 3, V(3)); var de = XK.dot(G, XK.RED), da = XK.dot(G, XK.ORANGE), gap = XK.line(G, '#7a8a99', 1.5);
        var head = el('p', 'qtext'), row = el('div', 'row'), out = el('p', 'qtext'), tail = el('div'), h = 1, k = 0;
        w.appendChild(head); w.appendChild(row); w.appendChild(out); w.appendChild(tail);
        function upd() { h = +sl.value / 10; var est = 67 + 6 * h, act = V(3 + h); XK.setDot(G, de, 3 + h, est); XK.setDot(G, da, 3 + h, act); XK.setLine(G, gap, 3 + h, est, 3 + h, act);
          out.textContent = 'h = ' + fm(h, 1) + ' minutes   ·   estimate: ' + fm(est, 2) + ' gallons   ·   actual: ' + fm(act, 2) + ' gallons   ·   gap: ' + fm(Math.abs(est - act), 2); }
        var sl = XK.slider(row, 'Slide h', 0, 60, 1, 10, upd), jobs = ['Job 1 of 2: slide h until the gap is under 0.5, but keep h above 0.2.', 'Job 2 of 2: slide h until the gap is more than 4.'];
        XK.checkBtn(ctl, 'Check: this job is done', function () {
          var gp = Math.abs(67 + 6 * h - V(3 + h)), ok = k === 0 ? (gp < 0.5 && h > 0.2) : gp > 4;
          if (ok) { k++; if (k === 2) { ask(); return; } head.textContent = jobs[k]; }
          else api.miss(k === 0 ? 'The gap is ' + fm(gp, 2) + (gp >= 0.5 ? '. Slide h closer to 0, but not all the way.' : '. Slide h up a little, above 0.2.') : 'The gap is only ' + fm(gp, 2) + '. Slide h further from 0.');
        });
        function ask() { tail.innerHTML = ''; head.textContent = 'Last question.'; tail.appendChild(el('p', 'qtext', 'The tangent-line estimate is best when the step h is…'));
          XK.choices(tail, ['small', 'large', 'exactly 3', 'negative'], 'x3:q', function (i, b) { if (i === 0) { b.classList.add('good'); tail.innerHTML = ''; api.solve(); } else api.miss('Look at the gap in jobs 1 and 2. When was it small?'); }); }
        head.textContent = jobs[0]; upd();
      } });

    /* ---- Station 4: rising, falling or steady ---- */
    LE.ask(card, { id: 'X4', type: 'custom', head: 'Station 4 · Rising, falling or steady?', maxMiss: 8, answer: 5,
      prompt: 'Five derivative facts. For each, say what the quantity is doing at that moment.',
      keyText: 'Increasing, decreasing, not changing, decreasing, increasing.',
      worked: 'Only the sign of the derivative matters for direction: positive is increasing, negative is decreasing, zero is not changing at that moment.',
      build: function (w, ctl, api) {
        if (api.done) { w.appendChild(el('p', 'hint', 'Station done: the sign of f′ tells the direction. The size tells how fast.')); return; }
        XK.guide(w, 'Read the sign of the number first. Ignore the units for this one. The size of the number says how fast, but not which way.');
        var C = [['A pond has V′(2) = +3 gallons per hour.', 0], ['An oven has T′(5) = −2 degrees per minute.', 1], ['A tree has H′(4) = 0 feet per year.', 2], ['A bank balance has B′(9) = −0.5 dollars per day.', 1], ['A town has P′(6) = +40 people per year.', 0]], j = 0, head = el('p', 'qtext'), tail = el('div');
        w.appendChild(head); w.appendChild(tail);
        function ask() { tail.innerHTML = ''; head.textContent = 'Fact ' + (j + 1) + ' of 5: ' + C[j][0];
          XK.choices(tail, ['increasing', 'decreasing', 'not changing at that moment'], 'x4:' + j, function (i, b) {
            if (i === C[j][1]) { b.classList.add('good'); j++; if (j === 5) { tail.innerHTML = ''; head.textContent = 'All five right.'; api.solve(); } else ask(); }
            else api.miss('Look at the sign of the number. Positive means increasing, negative means decreasing, zero means not changing right now.'); }); }
        ask();
      } });
  } });
})();
