/* LESSON (calculus 4.3): the wiring is LK.standard (physics/lessons/engine/standard.js, selfPaced branch). Edit spec.js for the teaching.
   This file draws the Explore tab: four hands-on stations (X1 to X4), solved in order. Every picture has a "How to read it" line.
   The running example is bacteria in a dish: B(t) thousand bacteria after t hours, B(t) = 100 / (1 + e^(5 − t)), with rate B′ = B(100 − B)/100. */
(function () {
  'use strict';
  var LE = window.LE, el = LE.el, XK = window.XK, fm = XK.fm, S = XK.sv;
  var B = function (t) { return 100 / (1 + Math.exp(5 - t)); }, Bp = function (t) { var b = B(t); return b * (100 - b) / 100; };
  var UNIT = ' thousand bacteria per hour';

  LK.standard(window.SPECS['4-3-rates-other'], { prefix: 'ROC', explore: function (card) {
    card.appendChild(el('p', 'qtext', 'Four stations, in order. Move things with the sliders and buttons. There is no clock: take your time, and if you stop, your work is saved on this device for tomorrow.'));

    /* ---- Station 1: average rate or rate right now ---- */
    LE.ask(card, { id: 'X1', type: 'custom', head: 'Station 1 · Average rate or rate right now?', maxMiss: 9, answer: 3,
      prompt: 'B(t) is the number of bacteria, in thousands, in a dish after t hours. Pick a start time and a width. Compare the average rate over the interval with the rate at the start. Do the jobs.',
      keyText: 'Job 1: width 4 and a start near 3 (the interval 3 to 7 has the greatest average rate). Job 2: a start where the rate is above 5, then shrink the width until the two numbers differ by less than 0.5.',
      worked: 'The orange secant gives the average rate over the interval. The red tangent gives the rate at the start. As the interval shrinks, the secant turns into the tangent, so the two numbers come together.',
      build: function (w, ctl, api) {
        if (api.done) { w.appendChild(el('p', 'hint', 'Station done: the secant slope is the average rate over an interval. The tangent slope is the rate at one instant. Shrinking the interval turns one into the other.')); return; }
        XK.guide(w, 'The blue curve is the bacteria in the dish. The two black dots are the ends of your interval. The orange line through them is the secant: its slope is the average rate over the interval. The red line touches the curve at the start: its slope is the rate at that instant. Both numbers are in the sentence under the graph.');
        var G = XK.plot(w, { xmin: 0, xmax: 10, ymin: 0, ymax: 100, xstep: 2, ystep: 20, xlabel: 'hours', ylabel: 'thousand bacteria', label: 'Bacteria in a dish over ten hours: slow at first, fast in the middle, then slow again' });
        XK.curve(G, B, 0, 10, XK.BLUE); var sec = XK.line(G, XK.ORANGE), tan = XK.line(G, XK.RED), d1 = XK.dot(G, XK.INK), d2 = XK.dot(G, XK.INK);
        var head = el('p', 'qtext'), row = el('div', 'row'), out = el('p', 'qtext'), tail = el('div'), a = 3, wd = 4, k = 0;
        w.appendChild(head); w.appendChild(row); w.appendChild(out); w.appendChild(tail);
        var jobs = ['Job 1 of 2: set the width to 4, then slide the start until the average rate is as big as you can make it.', 'Job 2 of 2: pick a start where the rate (red) is above 5, then shrink the width until the average and the rate differ by less than 0.5.'];
        function avg() { return (B(a + wd) - B(a)) / wd; }
        function upd() {
          a = +sa.value / 10; wd = +sw.value / 10;
          if (a + wd > 10) { wd = Math.max(0.1, Math.round((10 - a) * 10) / 10); if (a + wd > 10) a = 10 - wd; sw.value = Math.round(wd * 10); swo.textContent = sw.value; }
          var m = avg(); XK.setDot(G, d1, a, B(a)); XK.setDot(G, d2, a + wd, B(a + wd));
          XK.setLine(G, sec, a - 0.8, B(a) - 0.8 * m, a + wd + 0.8, B(a + wd) + 0.8 * m); XK.through(G, tan, a, B(a), Bp(a), 1.2);
          out.textContent = 'interval from t = ' + fm(a, 1) + ' to t = ' + fm(a + wd, 1) + '   ·   average rate (orange): ' + fm(m) + UNIT + '   ·   rate at t = ' + fm(a, 1) + ' (red): ' + fm(Bp(a)) + UNIT;
        }
        var sa = XK.slider(row, 'Start time', 0, 99, 1, 10, upd), sw = XK.slider(row, 'Width of the interval', 1, 60, 1, 40, upd), swo = sw.parentNode.querySelector('b');
        XK.checkBtn(ctl, 'Check: this job is done', function () {
          var ok = k === 0 ? (Math.abs(wd - 4) < 0.01 && Math.abs(a - 3) <= 0.5) : (Bp(a) > 5 && Math.abs(avg() - Bp(a)) < 0.5);
          if (ok) { k++; if (k === 2) { ask(); return; } head.textContent = jobs[k]; }
          else api.miss(k === 0 ? (Math.abs(wd - 4) >= 0.01 ? 'The width must be exactly 4.' : 'The average rate is ' + fm(avg()) + ' here. Slide the start time to make it bigger. The steepest part of the curve is near the middle.') :
            (Bp(a) <= 5 ? 'The rate at the start is only ' + fm(Bp(a)) + '. Move the start to a steeper part of the curve.' : 'The two numbers are ' + fm(avg()) + ' and ' + fm(Bp(a)) + '. Make the width smaller.'));
        });
        function ask() { tail.innerHTML = ''; head.textContent = 'Last question.'; tail.appendChild(el('p', 'qtext', 'Which sentence is true?'));
          XK.choices(tail, ['The tangent slope is the rate at one instant. The secant slope is the average rate over an interval.', 'The tangent slope is the average rate. The secant slope is the rate at one instant.', 'Both slopes always give the same number.', 'Neither slope is a rate.'], 'x1:q', function (i, b) { if (i === 0) { b.classList.add('good'); tail.innerHTML = ''; api.solve(); } else api.miss('Look at the picture again. Which line touches the curve at one point, and which line cuts across an interval?'); }); }
        head.textContent = jobs[0]; upd();
      } });

    /* ---- Station 2: fast, then slow ---- */
    LE.ask(card, { id: 'X2', type: 'custom', head: 'Station 2 · Growing, but not always at the same speed', maxMiss: 9, answer: 4,
      prompt: 'Top: the bacteria. Bottom: the growth rate B′. Slide the time and watch both. Do the jobs and answer two questions.',
      keyText: 'Job 1: t = 5 (the greatest rate, 25). Job 2: a time after 7 when there are more than 50 thousand bacteria and the rate is below 5 (t = 8 or later). Then: the rate starts to get smaller; the bacteria are still increasing, but more and more slowly.',
      worked: 'The growth rate B′ peaks at t = 5, halfway up, where B″ = 0. After that B′ gets smaller (B″ < 0) while still positive, so B keeps rising but more and more slowly.',
      build: function (w, ctl, api) {
        if (api.done) { w.appendChild(el('p', 'hint', 'Station done: the rate B′ can rise and fall. Where B′ is biggest, B″ = 0. After that B is still increasing, but more and more slowly.')); return; }
        XK.guide(w, 'The top graph is the number of bacteria B (blue). The bottom graph is the growth rate B′ (green), the slope of the top graph. The red dot on top and the orange dot on the bottom are at the same time. The sentence under the graphs gives the numbers.');
        var box = el('div', 'row'); w.appendChild(box);
        var G1 = XK.plot(box, { xmin: 0, xmax: 10, ymin: 0, ymax: 100, xstep: 2, ystep: 20, w: 300, h: 240, max: 340, xlabel: 'hours', ylabel: 'thousand bacteria', label: 'The number of bacteria over time, an S shape' }), G2 = XK.plot(box, { xmin: 0, xmax: 10, ymin: 0, ymax: 30, xstep: 2, ystep: 10, w: 300, h: 240, max: 340, xlabel: 'hours', ylabel: 'thousand per hour', label: 'The growth rate over time, a hill that peaks at five hours' });
        XK.curve(G1, B, 0, 10, XK.BLUE); XK.curve(G2, Bp, 0, 10, XK.GREEN); var tan = XK.line(G1, XK.RED), d1 = XK.dot(G1, XK.RED), d2 = XK.dot(G2, XK.ORANGE);
        var head = el('p', 'qtext'), row = el('div', 'row'), out = el('p', 'qtext'), tail = el('div'), t = 2, k = 0;
        w.appendChild(head); w.appendChild(row); w.appendChild(out); w.appendChild(tail);
        var jobs = ['Job 1 of 2: put the time where the bacteria are growing FASTEST.', 'Job 2 of 2: find a time when there are more than 50 thousand bacteria but the growth rate is below 5.'];
        function upd() { t = +sl.value / 2; XK.setDot(G1, d1, t, B(t)); XK.through(G1, tan, t, B(t), Bp(t), 1.4); XK.setDot(G2, d2, t, Bp(t));
          out.textContent = 't = ' + fm(t, 1) + ' hours   ·   bacteria: ' + fm(B(t)) + ' thousand   ·   growth rate B′: ' + fm(Bp(t)) + UNIT; }
        var sl = XK.slider(row, 'Slide the time', 0, 20, 1, 4, upd);
        XK.checkBtn(ctl, 'Check: this job is done', function () {
          var ok = k === 0 ? Math.abs(t - 5) < 0.3 : (B(t) > 50 && Bp(t) < 5);
          if (ok) { k++; if (k === 2) { q1(); return; } head.textContent = jobs[k]; }
          else api.miss(k === 0 ? 'The rate is ' + fm(Bp(t)) + ' here. Look at the bottom graph for its highest point.' : (B(t) <= 50 ? 'There are only ' + fm(B(t)) + ' thousand bacteria here. You want more than 50.' : 'The rate is ' + fm(Bp(t)) + ', still above 5. Try a later time.'));
        });
        function q1() { tail.innerHTML = ''; head.textContent = 'Two questions.'; tail.appendChild(el('p', 'qtext', 'Question 1 of 2: right after the fastest moment (t = 5), the growth rate…'));
          XK.choices(tail, ['starts to get smaller', 'keeps getting bigger', 'drops to zero at once', 'stays exactly the same'], 'x2:q1', function (i, b) { if (i === 0) { b.classList.add('good'); q2(); } else api.miss('Look at the bottom graph just after t = 5. Is the green curve going up or down?'); }); }
        function q2() { tail.innerHTML = ''; tail.appendChild(el('p', 'qtext', 'Question 2 of 2: after t = 5, the number of bacteria is…'));
          XK.choices(tail, ['still increasing, but more and more slowly', 'decreasing', 'staying exactly the same', 'increasing faster and faster'], 'x2:q2', function (i, b) { if (i === 0) { b.classList.add('good'); tail.innerHTML = ''; api.solve(); } else api.miss('The rate B′ is still above zero after t = 5, so the bacteria are still increasing. But B′ is getting smaller.'); }); }
        head.textContent = jobs[0]; upd();
      } });

    /* ---- Station 3: match the story ---- */
    LE.ask(card, { id: 'X3', type: 'custom', head: 'Station 3 · Match the story', maxMiss: 9, answer: 3,
      prompt: 'Three graphs of the amount of water in a tank are mixed up and have letters. For each story, pick the graph that fits.',
      keyText: 'Story 1 (increasing faster and faster) is the curve that bends up. Story 2 (increasing more and more slowly) is the curve that bends over. Story 3 (decreasing) is the falling line. (The letters are shuffled for each student.)',
      worked: 'The slope tells the direction. How the slope changes tells whether the rate is getting bigger (the curve bends up) or smaller (the curve bends over).',
      build: function (w, ctl, api) {
        if (api.done) { w.appendChild(el('p', 'hint', 'Station done: the sign of the slope gives rising or falling. How the slope changes gives faster or slower.')); return; }
        XK.guide(w, 'Time runs along the bottom, and the height is the amount of water. Look at the steepness of each graph as you go from left to right: does it get steeper, flatter, or stay the same?');
        var F = [function (t) { return t * t / 2; }, function (t) { return 4 * Math.sqrt(t); }, function (t) { return 8 - 2 * t; }], desc = ['rising faster and faster', 'rising more and more slowly', 'falling'], col = [XK.BLUE, XK.GREEN, XK.ORANGE];
        var order = LE.shuffle([0, 1, 2], LE.seedRng('roc-x3')), box = el('div', 'row'), letters = ['A', 'B', 'C'], j = 0; w.appendChild(box);
        order.forEach(function (fi, i) { var wrap = el('div'); wrap.style.cssText = 'flex:1 1 200px;max-width:240px;min-width:0'; box.appendChild(wrap);
          var G = XK.plot(wrap, { xmin: 0, xmax: 4, ymin: 0, ymax: 8, xstep: 1, ystep: 2, w: 220, h: 190, max: 230, xlabel: 'time', label: 'Graph ' + letters[i] }); XK.curve(G, F[fi], 0, 4, col[fi]);
          S('text', { x: 62, y: 28, 'font-size': 20, 'font-weight': 700, fill: XK.INK }, G.svg).textContent = letters[i]; });
        var stories = ['Story 1 of 3: the amount is increasing, and it is increasing faster and faster.', 'Story 2 of 3: the amount is increasing, but it is increasing more and more slowly.', 'Story 3 of 3: the amount is decreasing.'], head = el('p', 'qtext'), tail = el('div'); w.appendChild(head); w.appendChild(tail);
        function ask() { tail.innerHTML = ''; head.textContent = stories[j]; var row = el('div', 'row'); tail.appendChild(row);
          letters.forEach(function (L, i) { var b = el('button', 'btn', 'Graph ' + L); b.type = 'button'; b.onclick = function () {
            if (order[i] === j) { b.classList.add('good'); j++; if (j === 3) { tail.innerHTML = ''; head.textContent = 'All three matched.'; api.solve(); } else ask(); }
            else api.miss('Not that one. That graph is ' + desc[order[i]] + '. Check the sign of the slope first, then how the steepness changes.'); };
            row.appendChild(b); }); }
        ask();
      } });

    /* ---- Station 4: which interval is fastest? ---- */
    LE.ask(card, { id: 'X4', type: 'custom', head: 'Station 4 · Which interval is fastest?', maxMiss: 9, answer: 4,
      prompt: 'A table gives the bacteria at six times. Find the average rate on each interval, then say which is greatest and what it means.',
      keyText: 'The five average rates are 3.5, 8.5, 16, 11 and 5.5 thousand per hour. The greatest is on [4, 6]. It means: on average the bacteria grew by 16 thousand per hour between 4 and 6 hours.',
      worked: 'Average rate = change in B divided by the width. For [4, 6]: (61 − 29) / (6 − 4) = 16.',
      build: function (w, ctl, api) {
        if (api.done) { w.appendChild(el('p', 'hint', 'Station done: average rate = change in output ÷ width of the interval, and it says "on average, per hour".')); return; }
        XK.guide(w, 'Each button picks one interval. Press it to see the change in bacteria, the width of the interval, and the average rate. Press all five, then decide.');
        var T = [0, 2, 4, 6, 8, 10], Y = [5, 12, 29, 61, 83, 94], tbl = el('table', 'qtab'), tr1 = el('tr'), tr2 = el('tr'), i;
        tr1.appendChild(el('th', null, 't (hours)')); tr2.appendChild(el('th', null, 'B (thousand)')); T.forEach(function (x, n) { tr1.appendChild(el('td', null, String(x))); tr2.appendChild(el('td', null, String(Y[n]))); }); tbl.appendChild(tr1); tbl.appendChild(tr2); w.appendChild(tbl);
        var row = el('div', 'row'), out = el('p', 'qtext'), tail = el('div'), seen = {}, count = 0; w.appendChild(row); w.appendChild(out); w.appendChild(tail);
        function show(n) { var d = Y[n + 1] - Y[n], wd = T[n + 1] - T[n]; out.textContent = 'Interval [' + T[n] + ', ' + T[n + 1] + ']: (' + Y[n + 1] + ' − ' + Y[n] + ') ÷ (' + T[n + 1] + ' − ' + T[n] + ') = ' + fm(d / wd) + UNIT; if (!seen[n]) { seen[n] = 1; count++; } if (count === 5 && !tail.firstChild) q1(); }
        for (i = 0; i < 5; i++) (function (n) { var b = el('button', 'btn', 'Interval [' + T[n] + ', ' + T[n + 1] + ']'); b.type = 'button'; b.onclick = function () { show(n); }; row.appendChild(b); })(i);
        function q1() { tail.appendChild(el('p', 'qtext', 'Question 1 of 2: which interval has the greatest average rate?'));
          XK.choices(tail, ['[4, 6]', '[0, 2]', '[2, 4]', '[6, 8]', '[8, 10]'], 'x4:q1', function (n, b) { if (n === 0) { b.classList.add('good'); q2(); } else api.miss('Compare the five average rates you found. Which number is biggest?'); }); }
        function q2() { tail.innerHTML = ''; tail.appendChild(el('p', 'qtext', 'Question 2 of 2: what does the average rate of 16 on [4, 6] mean?'));
          XK.choices(tail, ['On average, the bacteria grew by 16 thousand per hour from 4 to 6 hours.', 'At exactly 4 hours, the bacteria grow by 16 thousand per hour.', 'The dish holds 16 thousand bacteria at 6 hours.', 'The bacteria grew by a total of 16 thousand between 4 and 6 hours.'], 'x4:q2', function (n, b) { if (n === 0) { b.classList.add('good'); tail.innerHTML = ''; api.solve(); } else api.miss('An average rate talks about the whole interval, says "on average", and gives a rate per hour, not a total or an amount.'); }); }
      } });
  } });
})();
