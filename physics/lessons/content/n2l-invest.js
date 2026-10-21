/* Newton's Second Law: the Investigate step (four parts, each with a job).
   The lab is the same for every student; the tasks that follow it depend on the student's hidden band. */
(function () {
  'use strict';
  var N2L = window.N2L = window.N2L || {};
  var LE = window.LE, el = LE.el, G = 9.8;
  function pick(r, a) { return a[Math.floor(r() * a.length)]; }
  function ids(list) { return list.map(function (q) { return q.id; }); }
  function allDone(list) { return ids(list).every(function (id) { var s = LE.qs(id); return s && s.done; }); }
  function asks(host, list, onAll) {
    list.forEach(function (q) {
      var q2 = {}; for (var k in q) q2[k] = q[k];
      q2.onDone = function () { if (allDone(list) && onAll) onAll(); };
      LE.ask(host, q2);
    });
    if (allDone(list) && onAll) onAll();
  }
  function lab(text, input) { var l = el('label'); l.appendChild(document.createTextNode(text + ' ')); l.appendChild(input); return l; }
  function f2(x) { return Number(x).toFixed(2); }
  N2L.asks = asks; N2L.allDone = allDone;

  /* ---------- per-student parameters ---------- */
  N2L.pA = function () { var r = LE.seedRng('A'); return { m: pick(r, [1.0, 1.5, 2.0, 2.5, 4.0]), Fs: [0.5, 1.0, 1.5, 2.0, 2.5], T: 4 }; };
  N2L.pB = function () { var r = LE.seedRng('B'); return { F: pick(r, [1.2, 1.5, 1.8, 2.4, 3.0]), ms: [0.5, 1.0, 1.5, 2.0, 3.0], T: 4 }; };
  N2L.pC = function (b) {
    var r = LE.seedRng('C'), P = { mu: pick(r, [0.10, 0.15, 0.20, 0.25]), m: pick(r, [1.0, 1.5, 2.0]), T: 4 };
    if (b >= 4) { P.d = pick(r, [4.0, 6.0, 8.0]); P.at = 2 * P.d / (P.T * P.T); } else P.at = [0.5, 0.5, 0.8, 1.0][b - 1];
    P.f = P.mu * P.m * G; P.Fneed = P.f + P.m * P.at; return P;
  };
  N2L.pD = function () { var r = LE.seedRng('D'); return { M: pick(r, [0.50, 0.75, 1.00]), mhs: [0.05, 0.10, 0.20, 0.40], T: 4 }; };
  function aHang(M, mh) { return mh * G / (M + mh); }
  N2L.aHang = aHang;

  N2L.investigate = function (card, c) {
    var S = c.S, band = c.band, CS = window.CartSim;
    S.d.inv = S.d.inv || { A: { runs: {} }, B: { runs: {} }, C: {}, D: { runs: {} } };
    var D = S.d.inv; if (!D.A.runs) D.A.runs = {}; if (!D.B.runs) D.B.runs = {}; if (!D.D.runs) D.D.runs = {};
    card.appendChild(el('h2', null, '3 · Investigate'));
    card.appendChild(el('p', null, 'Four investigations on the same cart track, each with a job. Finish one to open the next. Your numbers are your own: the people around you have slightly different ones.'));
    var parts = [];
    function partDone(k) { return !!D[k].done; }
    function markDone(k) { if (D[k].done) return; D[k].done = true; LE.save(); refresh(); LE.gate(); }
    function mkPart(key, title, build) {
      var det = el('details', 'part'), sum = el('summary'); sum.appendChild(el('span', null, title)); var st = el('span', 'st', ''); sum.appendChild(st); det.appendChild(sum);
      var inner = el('div', 'inner'); det.appendChild(inner); card.appendChild(det);
      var p = { key: key, det: det, inner: inner, st: st, build: build, built: false }; parts.push(p); return p;
    }
    function refresh() {
      var opened = false;
      parts.forEach(function (p, i) {
        var unlocked = c.key || i === 0 || partDone(parts[i - 1].key);
        p.det.classList.toggle('locked', !unlocked);
        if (unlocked && !p.built) { p.built = true; p.build(p.inner); }
        p.st.textContent = partDone(p.key) ? 'done' : (unlocked ? 'in progress' : 'locked'); p.st.className = 'st' + (partDone(p.key) ? ' done' : '');
        if (unlocked && !partDone(p.key) && !opened) { opened = true; if (!p.det.dataset.touched) p.det.open = true; }
        else if (!unlocked) p.det.open = false;
        else if (partDone(p.key) && !p.det.dataset.touched) p.det.open = false;
      });
    }
    function wireToggle(p) { p.det.addEventListener('toggle', function () { p.det.dataset.touched = '1'; }); p.det.querySelector('summary').addEventListener('click', function (e) { if (p.det.classList.contains('locked')) e.preventDefault(); }); }
    function lsq0(pts) { var sxy = 0, sxx = 0; pts.forEach(function (q) { sxy += q[0] * q[1]; sxx += q[0] * q[0]; }); return sxx ? sxy / sxx : 0; }
    function conclQ(id, prompt, label) { return { id: id, type: 'text', minWords: 12, rows: 3, head: 'In your own words', prompt: prompt, label: label }; }

    /* ======================= Part A: push harder ======================= */
    mkPart('A', 'Part A · Push harder', function (inner) {
      var P = N2L.pA(), b = c.band, S0 = 'A.' + b + '.', key = function (F) { return F.toFixed(1); };
      var job = el('p', 'job'); job.innerHTML = '<b>Your job:</b> A fan pushes a cart of mass <b>' + P.m + ' kg</b> from rest on a smooth track. Run it at each of the five fan forces. Every run lasts <b>4.0 s</b>. Your table and graph fill themselves. Then use them to work out how the acceleration depends on the force.';
      inner.appendChild(job);
      var controls = el('div', 'controls'); inner.appendChild(controls);
      var sel = el('select'); P.Fs.forEach(function (F) { var o = el('option', null, F.toFixed(1) + ' N'); o.value = String(F); sel.appendChild(o); });
      var runBtn = el('button', 'btn primary', 'Run'); runBtn.type = 'button'; controls.appendChild(lab('Fan force', sel)); controls.appendChild(runBtn);
      var amax = 2.5 / P.m, XM = 0.5 * amax * P.T * P.T * 1.06, VM = amax * P.T * 1.1;
      function pp(F) { return { m: P.m, F: F, T: P.T, xmax: XM, vmax: VM }; }
      var host = el('div'); inner.appendChild(host); var sim = CS.create(host); sim.idle(pp(0), 'Choose a fan force and press Run.');
      var readout = el('div', 'readout'); inner.appendChild(readout);
      var tblHost = el('div', 'scroll'); inner.appendChild(tblHost);
      var plotHost = el('div'); inner.appendChild(plotHost); var pl = CS.plot(plotHost, { title: 'Your data: acceleration against fan force', xlab: 'fan force F (N)', ylab: 'a (m/s²)', xmax: 3, ymax: 2.75 / P.m });
      var tasks = el('div'); inner.appendChild(tasks);
      function R(F) { return D.A.runs[key(F)]; }
      function renderTable() {
        tblHost.textContent = ''; var t = el('table', 'data'); t.innerHTML = '<thead><tr><th>Fan force F (N)</th><th>Speed after 4.0 s (m/s)</th><th>Acceleration a = Δv/Δt (m/s²)</th><th>Distance (m)</th></tr></thead>';
        var tb = el('tbody'); P.Fs.forEach(function (F) { var r = R(F), tr = el('tr'); tr.innerHTML = '<td>' + F.toFixed(1) + '</td><td>' + (r ? f2(r.v) : '—') + '</td><td>' + (r ? f2(r.a) : '—') + '</td><td>' + (r ? f2(r.x) : '—') + '</td>'; tb.appendChild(tr); });
        t.appendChild(tb); tblHost.appendChild(t);
        var pts = P.Fs.filter(R).map(function (F) { return [F, R(F).a]; }); pl.draw(pts, pts.length > 1 ? { m: lsq0(pts), b: 0 } : null);
      }
      function allRan() { return P.Fs.every(function (F) { return R(F); }); }
      function record(F, r) { D.A.runs[key(F)] = { v: +r.vEnd.toFixed(4), a: +r.a.toFixed(4), x: +r.xEnd.toFixed(4) }; LE.save(); }
      function after(F) { var r = R(F); readout.innerHTML = '<span>F = <b>' + F.toFixed(1) + ' N</b></span><span>speed after 4.0 s = <b>' + f2(r.v) + ' m/s</b></span><span>a = <b>' + f2(r.a) + ' m/s²</b></span>'; renderTable(); renderTasks(); }
      runBtn.onclick = function () { var F = +sel.value; runBtn.disabled = true; sim.run(pp(F)).then(function (r) { runBtn.disabled = false; if (r) { record(F, r); after(F); } }); };
      if (c.key) { var kb = el('button', 'btn small', 'Key: fill the table'); kb.type = 'button'; kb.onclick = function () { P.Fs.forEach(function (F) { var r = CS.solve(pp(F)); record(F, { vEnd: r.vEnd, a: r.a, xEnd: r.xEnd }); }); renderTable(); renderTasks(); }; controls.appendChild(kb); }
      function renderTasks() {
        tasks.textContent = '';
        if (!allRan()) { var n = P.Fs.filter(R).length; tasks.appendChild(el('p', 'hint', 'Runs so far: ' + n + ' of 5. The questions unlock when all five are in the table.')); return; }
        var list = [], m = P.m, a05 = R(0.5).a, a25 = R(2.5).a, a15 = R(1.5).a;
        list.push({ id: S0 + 'pattern', type: 'choice', head: 'Pattern', prompt: 'Compare the 1.0 N row with the 2.0 N row of your table. When the force doubled, the acceleration:', options: ['doubled', 'stayed the same', 'was cut in half', 'went up, but by less than double'], answer: 0, hint: 'Divide the 2.0 N acceleration by the 1.0 N acceleration.', worked: 'a(2.0 N) ÷ a(1.0 N) = ' + f2(R(2.0).a) + ' ÷ ' + f2(R(1.0).a) + ' = 2. Doubling the force doubles the acceleration.' });
        if (b === 1) {
          list.push({ id: S0 + 'shape', type: 'choice', prompt: 'Look at the graph of acceleration against force. What does it look like?', options: ['A straight line through the origin: twice the force, twice the acceleration.', 'A curve that bends upward.', 'A flat line.', 'A straight line that starts above zero.'], answer: 0, hint: 'The points line up. Does the line pass through zero force and zero acceleration?', worked: 'The points fall on a straight line through the origin: no force, no acceleration, and the acceleration grows in step with the force.' });
          list.push({ id: S0 + 'cl', type: 'cloze', head: 'Finish the sentences', text: 'A bigger force gives a {1} acceleration. A force three times as big gives an acceleration {2} as big.', blanks: [['bigger', 'larger', 'greater', 'higher'], ['three times', '3 times', 'triple']], bank: ['bigger', 'smaller', 'three times', 'one third'], hint: 'Use the pattern in the table.' });
        } else if (b === 2) {
          list.push({ id: S0 + 'shape', type: 'choice', prompt: 'Look at the graph of acceleration against force. What does it look like?', options: ['A straight line through the origin: acceleration is proportional to force.', 'A curve that bends upward.', 'A flat line.', 'A straight line that starts above zero.'], answer: 0, hint: 'The points line up. Does the line pass through zero force and zero acceleration?', worked: 'A straight line through the origin means a ∝ F.' });
          list.push({ id: S0 + 'ratio', type: 'num', head: 'The ratio F ÷ a', prompt: 'Divide the force by the acceleration for the <b>1.5 N</b> run. (kg)', answer: 1.5 / a15, unit: 'kg', tol: 0.02, hint: 'F ÷ a with the 1.5 N row.', worked: '1.5 ÷ ' + f2(a15) + ' = ' + f2(1.5 / a15) + ' kg.' });
          list.push({ id: S0 + 'ratioq', type: 'choice', prompt: 'The number F ÷ a is the same for every row. What is it?', options: ['The mass of the cart.', 'The cart’s weight.', 'The cart’s speed.', 'The time of the run.'], answer: 0, hint: 'Compare it with the mass in the instructions at the top of this part.', worked: 'F ÷ a = ' + m + ' kg, the mass of the cart. This is why a = F ÷ m.' });
          list.push({ id: S0 + 'pred', type: 'num', prompt: 'Predict: what acceleration would a <b>4.0 N</b> fan force give this cart? (m/s²)', answer: 4 / m, unit: 'm/s²', tol: 0.02, hint: 'Use a = F ÷ m with the cart’s mass.', worked: 'a = 4.0 ÷ ' + m + ' = ' + f2(4 / m) + ' m/s².' });
        } else {
          var slope = (a25 - a05) / 2.0;
          list.push({ id: S0 + 'slope', type: 'num', head: 'The slope of your line', prompt: 'Use the 0.5 N and 2.5 N rows to find the slope of the graph, Δa ÷ ΔF. (m/s² per N)', answer: slope, unit: 'm/s² per N', tol: 0.03, hint: '(a at 2.5 N − a at 0.5 N) ÷ (2.5 − 0.5).', worked: '(' + f2(a25) + ' − ' + f2(a05) + ') ÷ 2.0 = ' + n3(slope) + ' (m/s²)/N.' });
          list.push({ id: S0 + 'inv', type: 'num', prompt: 'Take 1 ÷ slope. What number do you get? (kg)', answer: 1 / slope, unit: 'kg', tol: 0.03, hint: 'Divide 1 by your slope.', worked: '1 ÷ ' + n3(slope) + ' = ' + f2(1 / slope) + ' kg, the mass of the cart. The slope of the a–F graph is 1/m.' });
          if (b === 3) {
            list.push({ id: S0 + 'units', type: 'choice', prompt: 'The units of the slope, (m/s²) per N, are the same as:', options: ['1/kg', 'kg', 'N·s', 'm/s'], answer: 0, hint: 'You found that slope = 1/m.', worked: 'slope = 1/m, so its units are 1/kg. That also means 1 N = 1 kg·m/s².' });
            list.push({ id: S0 + 'need', type: 'num', prompt: 'What fan force would give this cart an acceleration of <b>3.0 m/s²</b>? (N)', answer: 3 * m, unit: 'N', tol: 0.02, hint: 'F = m × a.', worked: 'F = ma = ' + m + ' × 3.0 = ' + f2(3 * m) + ' N.' });
          } else {
            list.push({ id: S0 + 'newton', type: 'choice', prompt: 'From a = F/m, the unit 1 newton is the same as:', options: ['1 kg·m/s²', '1 kg·m/s', '1 kg/(m·s²)', '1 kg·s²/m'], answer: 0, hint: 'F = m × a. What are the units of m and of a?', worked: '1 N = 1 kg × 1 m/s² = 1 kg·m/s².' });
            list.push({ id: S0 + 'pred', type: 'num', head: 'Predict, then test', prompt: 'Use your result to predict the acceleration for a <b>6.0 N</b> fan force. (m/s²)', answer: 6 / m, unit: 'm/s²', tol: 0.02, hint: 'a = F ÷ m.', worked: 'a = 6.0 ÷ ' + m + ' = ' + f2(6 / m) + ' m/s².' });
          }
        }
        var host2 = el('div'); tasks.appendChild(host2); var core = list.slice();
        function concl() { if (host2.querySelector('.concl')) return; var cd = el('div', 'concl'); host2.appendChild(cd); asks(cd, [conclQ('A.concl', 'How does the acceleration of a cart depend on the force that pushes it? Use numbers from your table.', 'Part A conclusion')], function () { markDone('A'); }); }
        function testBox() {
          if (host2.querySelector('.testbox')) return;
          var tw = el('div', 'testbox'); host2.appendChild(tw); tw.appendChild(el('p', 'qtext', 'Now test your prediction on the track.'));
          var tr = el('div', 'row'), tb = el('button', 'btn primary', 'Test 6.0 N'); tb.type = 'button'; tr.appendChild(tb); tw.appendChild(tr);
          var ro = el('p', 'msg'); tw.appendChild(ro); var after2 = el('div'); tw.appendChild(after2);
          var meas = { id: S0 + 'meas', type: 'num', prompt: 'Enter the acceleration the test gave you. (m/s²)', answer: 6 / m, unit: 'm/s²', tol: 0.02, hint: 'Run the test first, then read a from the force box on the right of the track.', worked: 'The test agrees with a = F/m. Your line from 0.5 N to 2.5 N predicted a force it never saw.' };
          var fric = { id: S0 + 'fric', type: 'choice', prompt: 'Suppose this track had friction. Compared with your graph, the a–F line would:', options: ['cross the force axis at the friction force instead of the origin.', 'pass through the origin but be steeper.', 'be unchanged.', 'become a curve.'], answer: 0, hint: 'With friction, a small fan force cannot move the cart at all. Where does the line start?', worked: 'The net force is F − f, so a = (F − f)/m. The line has the same slope 1/m but meets a = 0 at F = f. You will test this in Part C.' };
          function showAfter() { if (after2.dataset.set) return; after2.dataset.set = '1'; asks(after2, [meas, fric], concl); }
          tb.onclick = function () { tb.disabled = true; sim.run({ m: P.m, F: 6.0, T: P.T }).then(function (r) { tb.disabled = false; if (!r) return; D.A.custom = +r.a.toFixed(3); LE.save(); ro.textContent = 'Test run finished: speed after 4.0 s was ' + f2(r.vEnd) + ' m/s.'; showAfter(); }); };
          if (D.A.custom != null) { ro.textContent = 'Your earlier test run: a = ' + D.A.custom + ' m/s².'; showAfter(); }
        }
        if (b === 4) asks(host2, core, testBox); else asks(host2, core, concl);
        if (LE.qs('A.concl') && LE.qs('A.concl').done) markDone('A');
      }
      function n3(x) { return String(+Number(x).toFixed(3)); }
      renderTable(); renderTasks();
    });

    /* ======================= Part B: load it up ======================= */
    mkPart('B', 'Part B · Load it up', function (inner) {
      var P = N2L.pB(), b = c.band, S0 = 'B.' + b + '.', key = function (m) { return m.toFixed(1); };
      var job = el('p', 'job'); job.innerHTML = '<b>Your job:</b> Now the fan force stays fixed at <b>' + P.F + ' N</b> and you change the mass of the cart by adding blocks. Predict first, then run all five loads (each run lasts 4.0 s) and find how the acceleration depends on the mass.';
      inner.appendChild(job);
      var predBox = el('div'); inner.appendChild(predBox); var rest = el('div'); inner.appendChild(rest);
      function renderPred() {
        predBox.textContent = '';
        predBox.appendChild(el('p', 'qtext', 'The 2.0 kg cart has twice the mass of the 1.0 kg cart, and the same fan pushes both. The 2.0 kg cart’s acceleration will be:'));
        var opts = ['half as big as the 1.0 kg cart’s', 'the same as the 1.0 kg cart’s', 'twice as big as the 1.0 kg cart’s', 'one quarter as big as the 1.0 kg cart’s'], list = el('div', 'opts');
        opts.forEach(function (t, i) { var lb = el('label'); lb.style.display = 'flex'; lb.style.gap = '8px'; var rd = document.createElement('input'); rd.type = 'radio'; rd.name = 'bpred'; rd.value = String(i); rd.checked = D.B.pred === i; rd.disabled = D.B.pred != null; lb.appendChild(rd); lb.appendChild(document.createTextNode(t)); list.appendChild(lb); });
        predBox.appendChild(list);
        var lock = el('button', 'btn', 'Lock my prediction'); lock.type = 'button'; lock.disabled = D.B.pred != null; predBox.appendChild(lock);
        lock.onclick = function () { var s = predBox.querySelector('input:checked'); if (!s) return; D.B.pred = +s.value; LE.save(); renderPred(); renderRest(); };
      }
      function renderRest() {
        rest.textContent = ''; if (D.B.pred == null) { rest.appendChild(el('p', 'hint', 'Lock a prediction to open the runs.')); return; }
        var controls = el('div', 'controls'); rest.appendChild(controls);
        var sel = el('select'); P.ms.forEach(function (m) { var o = el('option', null, m.toFixed(1) + ' kg'); o.value = String(m); sel.appendChild(o); });
        var runBtn = el('button', 'btn primary', 'Run'); runBtn.type = 'button'; controls.appendChild(lab('Cart mass', sel)); controls.appendChild(runBtn);
        var amax = P.F / 0.5, XM = 0.5 * amax * P.T * P.T * 1.06, VM = amax * P.T * 1.1;
        function pp(m, F) { return { m: m, F: F == null ? P.F : F, T: P.T, xmax: XM, vmax: VM }; }
        var host = el('div'); rest.appendChild(host); var sim = CS.create(host); sim.idle(pp(1.0, 0), 'Choose a cart mass and press Run.');
        var readout = el('div', 'readout'); rest.appendChild(readout);
        var tblHost = el('div', 'scroll'); rest.appendChild(tblHost);
        var p1 = el('div'); rest.appendChild(p1); var pl1 = CS.plot(p1, { title: 'Your data: acceleration against mass', xlab: 'cart mass m (kg)', ylab: 'a (m/s²)', xmax: 3.2, ymax: amax * 1.1 });
        var pl2 = null; if (b >= 3) { var p2 = el('div'); rest.appendChild(p2); pl2 = CS.plot(p2, { title: 'Same data: acceleration against 1/m', xlab: '1/m (1/kg)', ylab: 'a (m/s²)', xmax: 2.2, ymax: amax * 1.1 }); }
        var tasks = el('div'); rest.appendChild(tasks);
        function R(m) { return D.B.runs[key(m)]; }
        function renderTable() {
          tblHost.textContent = ''; var t = el('table', 'data'); t.innerHTML = '<thead><tr><th>Cart mass m (kg)</th><th>Acceleration a (m/s²)</th><th>1/m (1/kg)</th></tr></thead>';
          var tb = el('tbody'); P.ms.forEach(function (m) { var r = R(m), tr = el('tr'); tr.innerHTML = '<td>' + m.toFixed(1) + '</td><td>' + (r ? f2(r.a) : '—') + '</td><td>' + (r ? f2(1 / m) : '—') + '</td>'; tb.appendChild(tr); });
          t.appendChild(tb); tblHost.appendChild(t);
          var done = P.ms.filter(R); pl1.draw(done.map(function (m) { return [m, R(m).a]; }), null);
          if (pl2) { var q = done.map(function (m) { return [1 / m, R(m).a]; }); pl2.draw(q, q.length > 1 ? { m: lsq0(q), b: 0 } : null); }
        }
        function record(m, r) { D.B.runs[key(m)] = { a: +r.a.toFixed(4), v: +r.vEnd.toFixed(4) }; LE.save(); }
        runBtn.onclick = function () { var m = +sel.value; runBtn.disabled = true; sim.run(pp(m)).then(function (r) { runBtn.disabled = false; if (!r) return; record(m, r); readout.innerHTML = '<span>m = <b>' + m.toFixed(1) + ' kg</b></span><span>F = <b>' + P.F + ' N</b></span><span>a = <b>' + f2(r.a) + ' m/s²</b></span>'; renderTable(); showTasks(); }); };
        if (c.key) { var kb = el('button', 'btn small', 'Key: fill the table'); kb.type = 'button'; kb.onclick = function () { P.ms.forEach(function (m) { var r = CS.solve(pp(m)); record(m, { a: r.a, vEnd: r.vEnd }); }); renderTable(); showTasks(); }; controls.appendChild(kb); }
        function showTasks() {
          tasks.textContent = ''; if (!P.ms.every(R)) { tasks.appendChild(el('p', 'hint', 'Runs so far: ' + P.ms.filter(R).length + ' of 5. The questions unlock when all five are in the table.')); return; }
          var names = ['half as big', 'the same', 'twice as big', 'one quarter as big'];
          tasks.appendChild(el('p', 'msg ok', 'You predicted “' + names[D.B.pred] + '” for the 2.0 kg cart. Measured: a(1.0 kg) = ' + f2(R(1.0).a) + ' m/s² and a(2.0 kg) = ' + f2(R(2.0).a) + ' m/s², so the 2.0 kg cart’s acceleration was half as big.'));
          var list = [], F = P.F;
          list.push({ id: S0 + 'pattern', type: 'choice', head: 'Pattern', prompt: 'As the mass of the cart increased (same fan force), the acceleration:', options: ['decreased', 'increased', 'stayed the same', 'changed with no clear pattern'], answer: 0, hint: 'Compare the 0.5 kg row with the 3.0 kg row.', worked: 'More mass, less acceleration: a heavier cart is harder to speed up with the same push.' });
          if (b === 1) {
            list.push({ id: S0 + 'most', type: 'choice', prompt: 'Which cart accelerated the most?', options: ['The lightest cart (0.5 kg)', 'The heaviest cart (3.0 kg)', 'They all accelerated equally', 'The 1.5 kg cart'], answer: 0, hint: 'Look for the biggest acceleration in the table.', worked: 'The 0.5 kg cart: ' + f2(R(0.5).a) + ' m/s², the largest. Less mass means more acceleration for the same push.' });
            list.push({ id: S0 + 'cl', type: 'cloze', text: 'The more mass a cart has, the {1} it accelerates for the same push. Twice the mass gives {2} the acceleration.', blanks: [['less', 'slower', 'lower'], ['half', 'one half', '1/2', 'half of']], bank: ['less', 'more', 'half', 'twice'], hint: 'Use the pattern in your table.' });
          } else if (b === 2) {
            list.push({ id: S0 + 'ma', type: 'num', prompt: 'Multiply the mass by the acceleration for the <b>2.0 kg</b> run. (kg·m/s², which is N)', answer: 2.0 * R(2.0).a, unit: 'N', tol: 0.02, hint: 'm × a with the 2.0 kg row.', worked: '2.0 × ' + f2(R(2.0).a) + ' = ' + f2(2 * R(2.0).a) + ' N.' });
            list.push({ id: S0 + 'maq', type: 'choice', prompt: 'The product m × a is the same in every row. What is it equal to?', options: ['The fan force.', 'The cart’s weight.', 'The cart’s speed.', 'Zero.'], answer: 0, hint: 'Compare it with the fan force at the top of this part.', worked: 'm × a = ' + F + ' N, the fan force. This is ΣF = ma.' });
            list.push({ id: S0 + 'pred', type: 'num', prompt: 'Predict: what acceleration would the fan give a <b>5.0 kg</b> cart? (m/s²)', answer: F / 5, unit: 'm/s²', tol: 0.02, hint: 'a = F ÷ m.', worked: 'a = ' + F + ' ÷ 5.0 = ' + f2(F / 5) + ' m/s².' });
          } else {
            list.push({ id: S0 + 'inv', type: 'num', head: 'Linearize it', prompt: 'The graph of a against m is a curve, but a against 1/m is a straight line. Find the slope of that line using the 0.5 kg and 3.0 kg rows: Δa ÷ Δ(1/m). (N)', answer: (R(0.5).a - R(3.0).a) / (2 - 1 / 3), unit: 'N', tol: 0.03, hint: '(a at 0.5 kg − a at 3.0 kg) ÷ (2.0 − 0.33).', worked: '(' + f2(R(0.5).a) + ' − ' + f2(R(3.0).a) + ') ÷ 1.67 = ' + f2(F) + ' N, the fan force.' });
            list.push({ id: S0 + 'law', type: 'choice', prompt: 'A straight line through the origin on the a against 1/m graph means:', options: ['a is inversely proportional to m (a ∝ 1/m).', 'a is directly proportional to m.', 'a does not depend on m.', 'a is proportional to m².'], answer: 0, hint: 'a is proportional to 1/m. What does that say about a and m?', worked: 'a ∝ 1/m: doubling the mass halves the acceleration. The slope is the fan force, so a = F/m.' });
            if (b === 3) list.push({ id: S0 + 'mass', type: 'num', prompt: 'What cart mass would give an acceleration of <b>0.60 m/s²</b> with this fan? (kg)', answer: F / 0.6, unit: 'kg', tol: 0.02, hint: 'm = F ÷ a.', worked: 'm = ' + F + ' ÷ 0.60 = ' + f2(F / 0.6) + ' kg.' });
            else {
              list.push({ id: S0 + 'units', type: 'choice', prompt: 'The slope of the a against 1/m line has units (m/s²) ÷ (1/kg) = kg·m/s². That unit is:', options: ['the newton, and the slope equals the fan force.', 'the kilogram.', 'm/s².', '1/kg.'], answer: 0, hint: '1 N = 1 kg·m/s².', worked: 'kg·m/s² is the newton, so the slope is a force: the fan force.' });
              list.push({ id: S0 + 'pred', type: 'num', head: 'Predict, then test', prompt: 'The fan force is now doubled to ' + (2 * F).toFixed(1) + ' N and the cart is loaded to 3.0 kg. Predict the acceleration. (m/s²)', answer: 2 * F / 3, unit: 'm/s²', tol: 0.02, hint: 'Use a = F ÷ m with the new force and the new mass. Or scale the old result: ×2 for the force, ÷3 for the mass.', worked: 'a = ' + (2 * F).toFixed(1) + ' ÷ 3.0 = ' + f2(2 * F / 3) + ' m/s². Both changes together: the first scales a by 2, the second by 1/3.' });
            }
          }
          var host2 = el('div'); tasks.appendChild(host2);
          function concl() { if (host2.querySelector('.concl')) return; var cd = el('div', 'concl'); host2.appendChild(cd); asks(cd, [conclQ('B.concl', 'How does the acceleration depend on the mass when the force stays the same? Put it in a sentence and back it up with two rows of your table.', 'Part B conclusion')], function () { markDone('B'); }); }
          function testBox() {
            if (host2.querySelector('.testbox')) return;
            var tw = el('div', 'testbox'); host2.appendChild(tw); tw.appendChild(el('p', 'qtext', 'Now test your prediction: both changes at once.'));
            var tr = el('div', 'row'), tb = el('button', 'btn primary', 'Test ' + (2 * F).toFixed(1) + ' N on 3.0 kg'); tb.type = 'button'; tr.appendChild(tb); tw.appendChild(tr);
            var ro = el('p', 'msg'); tw.appendChild(ro); var a2 = el('div'); tw.appendChild(a2);
            var meas = { id: S0 + 'meas', type: 'num', prompt: 'Enter the acceleration the test gave you. (m/s²)', answer: 2 * F / 3, unit: 'm/s²', tol: 0.02, hint: 'Run the test first, then read a from the box on the right of the track.', worked: 'The test matches ΣF = ma. Force and mass work together in one law.' };
            function showAfter() { if (a2.dataset.set) return; a2.dataset.set = '1'; asks(a2, [meas], concl); }
            tb.onclick = function () { tb.disabled = true; sim.run(pp(3.0, 2 * F)).then(function (r) { tb.disabled = false; if (!r) return; D.B.custom = +r.a.toFixed(3); LE.save(); ro.textContent = 'Test run finished: speed after 4.0 s was ' + f2(r.vEnd) + ' m/s.'; showAfter(); }); };
            if (D.B.custom != null) { ro.textContent = 'Your earlier test run: a = ' + D.B.custom + ' m/s².'; showAfter(); }
          }
          if (b === 4) asks(host2, list, testBox); else asks(host2, list, concl);
          if (LE.qs('B.concl') && LE.qs('B.concl').done) markDone('B');
        }
        renderTable(); showTasks();
      }
      renderPred(); renderRest();
    });

    /* ======================= Part C: the force that counts ======================= */
    mkPart('C', 'Part C · The force that counts', function (inner) {
      var b = c.band, S0 = 'C.' + b + '.', P = N2L.pC(b), tol = 0.04;
      var job = el('p', 'job');
      var tgt = b >= 4 ? 'make the cart travel <b>' + P.d.toFixed(1) + ' m in 4.0 s</b> from rest' : 'make the cart accelerate at exactly <b>' + P.at.toFixed(2) + ' m/s²</b>';
      job.innerHTML = '<b>Your job:</b> This track is rough. The cart has a mass of <b>' + P.m + ' kg</b> and μ = <b>' + P.mu + '</b>. Find the fan force that will ' + tgt + '. The cart accelerates because of the net force, so the fan force alone is not the answer.' + (b <= 2 ? ' Friction on the sliding cart is <b>' + f2(P.f) + ' N</b>.' : '');
      inner.appendChild(job);
      var gate = el('div'); inner.appendChild(gate);
      var controls = el('div', 'controls'); inner.appendChild(controls);
      var Fin = el('input'); Fin.type = 'number'; Fin.step = '0.01'; Fin.min = '0'; Fin.max = '30'; Fin.value = '0'; Fin.setAttribute('aria-label', 'Fan force in newtons');
      var run = el('button', 'btn primary', 'Run 4.0 s'); run.type = 'button'; controls.appendChild(lab('Fan force F (N)', Fin)); controls.appendChild(run);
      var XM = 0.5 * P.at * 1.7 * P.T * P.T, VM = P.at * 1.7 * P.T * 1.1;
      function pp(F) { return { m: P.m, F: F, mu: P.mu, T: P.T, xmax: XM, vmax: VM }; }
      var host = el('div'); inner.appendChild(host); var sim = CS.create(host); sim.idle(pp(0), 'Set a fan force and press Run.');
      var ro = el('div', 'readout'); inner.appendChild(ro); var msg = el('p', 'msg'); inner.appendChild(msg); var tasks = el('div'); inner.appendChild(tasks);
      var predQ = { id: S0 + 'pred', type: 'num', head: 'Predict first', answer: P.Fneed, unit: 'N', tol: 0.04,
        prompt: b === 1 ? 'The cart needs a net force of m × a = ' + P.m + ' × ' + P.at.toFixed(2) + ' = ' + f2(P.m * P.at) + ' N, and friction (' + f2(P.f) + ' N) pulls backward. What fan force F will you try? (N)'
          : b === 2 ? 'Friction on the cart is ' + f2(P.f) + ' N. What fan force F do you predict will give an acceleration of ' + P.at.toFixed(2) + ' m/s²? (N)'
          : b === 3 ? 'The track has μ = ' + P.mu + ' and the cart has a mass of ' + P.m + ' kg. What fan force F do you predict will give an acceleration of ' + P.at.toFixed(2) + ' m/s²? (N, g = 9.8 m/s²)'
          : 'You want the cart to cover ' + P.d.toFixed(1) + ' m in 4.0 s from rest. What fan force F do you predict you need? (N, g = 9.8 m/s²)',
        hint: b === 4 ? 'First find the acceleration from x = ½at². Then ΣF = F − μmg = ma.' : 'The fan must cancel friction and also supply the net force m × a: F = f + ma.',
        worked: (b === 4 ? 'x = ½at² gives a = 2 × ' + P.d.toFixed(1) + ' ÷ 16 = ' + P.at.toFixed(3) + ' m/s². ' : '') + 'F − μmg = ma, so F = ' + f2(P.f) + ' + ' + P.m + ' × ' + P.at.toFixed(3).replace(/0+$/, '').replace(/\.$/, '') + ' = ' + f2(P.Fneed) + ' N.' };
      function predOK() { var s = LE.qs(predQ.id); return !!(s && s.done); }
      function setRun() { run.disabled = !predOK(); }
      asks(gate, [predQ], setRun); setRun();
      function showFr() { ro.innerHTML = '<span>Mass: <b>' + P.m + ' kg</b></span><span>μ = <b>' + P.mu + '</b></span>' + (b <= 2 ? '<span>Friction when sliding: <b>' + f2(P.f) + ' N</b></span>' : ''); }
      showFr();
      run.onclick = function () {
        var Fv = parseFloat(Fin.value); if (!isFinite(Fv) || Fv < 0) { msg.className = 'msg bad'; msg.textContent = 'Enter a fan force of 0 N or more.'; return; }
        run.disabled = true; D.C.tries = (D.C.tries || 0) + 1;
        sim.run(pp(Fv)).then(function (r) {
          setRun(); if (!r) return;
          ro.innerHTML = '<span>Fan force: <b>' + f2(Fv) + ' N</b></span><span>Friction: <b>' + f2(r.f) + ' N</b></span><span>Net force: <b>' + f2(r.Fnet) + ' N</b></span><span>a = <b>' + f2(r.a) + ' m/s²</b></span>' + (b >= 4 ? '<span>Distance in 4.0 s: <b>' + f2(r.xEnd) + ' m</b></span>' : '');
          if (r.stuck) { msg.className = 'msg bad'; msg.textContent = 'The cart did not move. The fan force is no bigger than the friction force, so the net force is zero.'; }
          else if (Math.abs(r.a - P.at) <= tol) { msg.className = 'msg ok'; msg.textContent = 'On target. Fan force ' + f2(Fv) + ' N, friction ' + f2(r.f) + ' N, net force ' + f2(r.Fnet) + ' N, acceleration ' + f2(r.a) + ' m/s².'; D.C.F = +Fv.toFixed(3); D.C.ok = true; LE.save(); showTasks(); }
          else if (r.a < P.at) { msg.className = 'msg bad'; msg.textContent = 'Acceleration was ' + f2(r.a) + ' m/s², under the target of ' + P.at.toFixed(2) + '. The net force is too small. Raise the fan force.'; }
          else { msg.className = 'msg bad'; msg.textContent = 'Acceleration was ' + f2(r.a) + ' m/s², over the target of ' + P.at.toFixed(2) + '. The net force is too large. Lower the fan force.'; }
        });
      };
      if (c.key) { var kb = el('button', 'btn small', 'Key: set the answer'); kb.type = 'button'; kb.onclick = function () { Fin.value = P.Fneed.toFixed(2); }; controls.appendChild(kb); inner.appendChild(el('p', 'keyline', 'KEY: fan force = ' + f2(P.Fneed) + ' N (friction ' + f2(P.f) + ' N, target a = ' + P.at.toFixed(3) + ' m/s²)')); }
      function showTasks() {
        tasks.textContent = ''; if (!D.C.ok) return;
        var list = [];
        list.push({ id: S0 + 'net', type: 'choice', head: 'What you found', prompt: 'While the cart was accelerating, the net force on it was:', options: ['the fan force minus the friction force.', 'the fan force.', 'the friction force.', 'the cart’s weight.'], answer: 0, hint: 'Which forces act along the track? Which way does each point?', worked: 'Two horizontal forces act: the fan pushes forward and friction pulls back. ΣF = F − f.' });
        if (b === 1) list.push({ id: S0 + 'nf', type: 'num', prompt: 'You used a fan force of about ' + D.C.F.toFixed(2) + ' N. Subtract the friction force (' + f2(P.f) + ' N) to get the net force. (N)', answer: D.C.F - P.f, unit: 'N', tol: 0.08, abs: 0.05, hint: 'Net force = fan force − friction.', worked: D.C.F.toFixed(2) + ' − ' + f2(P.f) + ' = ' + f2(D.C.F - P.f) + ' N, about m × a = ' + f2(P.m * P.at) + ' N.' });
        else list.push({ id: S0 + 'nf', type: 'num', prompt: 'Compute m × a for your target. What net force does the cart need? (N)', answer: P.m * P.at, unit: 'N', tol: 0.03, hint: 'm × a with the cart’s mass and the target acceleration.', worked: 'ΣF = ma = ' + P.m + ' × ' + P.at.toFixed(3).replace(/0+$/, '').replace(/\.$/, '') + ' = ' + f2(P.m * P.at) + ' N. The fan supplied that plus the ' + f2(P.f) + ' N that friction took back.' });
        list.push({ id: S0 + 'zero', type: 'choice', prompt: 'Suppose the fan force had been exactly equal to the friction force. The cart’s acceleration would be:', options: ['zero. The net force would be zero, so the velocity would not change.', 'the same as your target.', 'half the target.', 'equal to g.'], answer: 0, hint: 'F − f = 0. What does ΣF = ma say then?', worked: 'ΣF = 0 gives a = 0: the first law again, as a special case of the second.' });
        if (b >= 3) list.push({ id: S0 + 'dbl', type: 'num', head: 'Twice the acceleration', prompt: 'How big a fan force would you need for <b>twice</b> your target acceleration? (N)', answer: P.f + 2 * P.m * P.at, unit: 'N', tol: 0.03, hint: 'Friction does not change. Only the net force doubles.', worked: 'F = f + m(2a) = ' + f2(P.f) + ' + ' + f2(2 * P.m * P.at) + ' = ' + f2(P.f + 2 * P.m * P.at) + ' N. This is less than double your first answer (' + f2(2 * P.Fneed) + ' N) because friction is not doubled.' });
        var h2 = el('div'); tasks.appendChild(h2); list.push(conclQ('C.concl', 'Why does the cart’s acceleration depend on the net force and not on the fan force alone? Use the friction in this part to explain.', 'Part C conclusion'));
        asks(h2, list, function () { markDone('C'); });
      }
      showTasks();
    });

    /* ======================= Part D: hanging mass ======================= */
    mkPart('D', 'Part D · A hanging mass', function (inner) {
      var P = N2L.pD(), b = c.band, S0 = 'D.' + b + '.', key = function (m) { return m.toFixed(2); };
      var job = el('p', 'job'); job.innerHTML = '<b>Your job:</b> No fan this time. A string runs over a pulley to a hanging mass, and gravity pulls the hanging mass down. The cart has a mass of <b>' + P.M.toFixed(2) + ' kg</b> on a smooth track. Run four different hanging masses (each run lasts 4.0 s) and explain what sets the acceleration.';
      inner.appendChild(job);
      var controls = el('div', 'controls'); inner.appendChild(controls);
      var sel = el('select'); P.mhs.forEach(function (m) { var o = el('option', null, m.toFixed(2) + ' kg'); o.value = String(m); sel.appendChild(o); });
      var runBtn = el('button', 'btn primary', 'Run'); runBtn.type = 'button'; controls.appendChild(lab('Hanging mass', sel)); controls.appendChild(runBtn);
      var amax = aHang(P.M, 0.40), XM = 0.5 * amax * P.T * P.T * 1.06, VM = amax * P.T * 1.1;
      function pp(mh, free) { var o = { m: P.M, mh: mh, T: P.T }; if (!free) { o.xmax = XM; o.vmax = VM; } return o; }
      var host = el('div'); inner.appendChild(host); var sim = CS.create(host); sim.idle(pp(0.1), 'Choose a hanging mass and press Run.');
      var readout = el('div', 'readout'); inner.appendChild(readout);
      var tblHost = el('div', 'scroll'); inner.appendChild(tblHost); var tasks = el('div'); inner.appendChild(tasks);
      function R(m) { return D.D.runs[key(m)]; }
      function renderTable() {
        tblHost.textContent = ''; var t = el('table', 'data'); t.innerHTML = '<thead><tr><th>Hanging mass (kg)</th><th>Pull of gravity m<sub>h</sub>g (N)</th><th>Mass that moves, M + m<sub>h</sub> (kg)</th><th>Acceleration a (m/s²)</th></tr></thead>';
        var tb = el('tbody'); P.mhs.forEach(function (m) { var r = R(m), tr = el('tr'); tr.innerHTML = '<td>' + m.toFixed(2) + '</td><td>' + (r ? f2(m * G) : '—') + '</td><td>' + (r ? f2(P.M + m) : '—') + '</td><td>' + (r ? f2(r.a) : '—') + '</td>'; tb.appendChild(tr); });
        t.appendChild(tb); tblHost.appendChild(t);
      }
      function record(m, r) { D.D.runs[key(m)] = { a: +r.a.toFixed(4), T: +r.tension.toFixed(4) }; LE.save(); }
      runBtn.onclick = function () { var m = +sel.value; runBtn.disabled = true; sim.run(pp(m)).then(function (r) { runBtn.disabled = false; if (!r) return; record(m, r); readout.innerHTML = '<span>m<sub>h</sub> = <b>' + m.toFixed(2) + ' kg</b></span><span>a = <b>' + f2(r.a) + ' m/s²</b></span><span>string tension = <b>' + f2(r.tension) + ' N</b></span>'; renderTable(); showTasks(); }); };
      if (c.key) { var kb = el('button', 'btn small', 'Key: fill the table'); kb.type = 'button'; kb.onclick = function () { P.mhs.forEach(function (m) { var r = CS.solve(pp(m)); record(m, r); }); renderTable(); showTasks(); }; controls.appendChild(kb); }
      function showTasks() {
        tasks.textContent = ''; if (!P.mhs.every(R)) { tasks.appendChild(el('p', 'hint', 'Runs so far: ' + P.mhs.filter(R).length + ' of 4. The questions unlock when all four are in the table.')); return; }
        var list = [], M = P.M;
        list.push({ id: S0 + 'pattern', type: 'choice', head: 'Pattern', prompt: 'As the hanging mass increased, the cart’s acceleration:', options: ['increased, but always stayed below 9.8 m/s².', 'increased without any limit.', 'stayed the same.', 'decreased.'], answer: 0, hint: 'Look at the last column. Is any value close to 9.8?', worked: 'The hanging mass pulls harder each time, so a grows. But every value stays well below 9.8 m/s². The next questions say why.' });
        var ahg = function (m) { return aHang(M, m); };
        if (b === 1) {
          list.push({ id: S0 + 'why', type: 'choice', prompt: 'Why does the acceleration stay below 9.8 m/s², the acceleration of a freely falling object?', options: ['The hanging mass also has to pull the cart, so more mass is being accelerated than the hanging mass alone.', 'Gravity gets weaker when there is a string.', 'The string is too heavy.', 'The pulley stops it.'], answer: 0, hint: 'Both the cart and the hanging mass speed up together. Which mass does the pull of gravity have to accelerate?', worked: 'Gravity pulls only the hanging mass, but the string makes the cart move along with it. The pull accelerates cart plus hanging mass, a bigger mass than the hanging mass alone, so a is less than g.' });
          list.push({ id: S0 + 'cl', type: 'cloze', text: 'The hanging mass and the cart move {1}. The mass being accelerated is {2} than the hanging mass alone.', blanks: [['together', 'at the same rate', 'as one', 'as one object'], ['larger', 'bigger', 'greater', 'more']], bank: ['together', 'apart', 'larger', 'smaller'], hint: 'The string connects them.' });
        } else if (b === 2) {
          list.push({ id: S0 + 'pull', type: 'num', head: 'Use the 0.20 kg run', prompt: 'The force that pulls the system is the weight of the hanging mass, m<sub>h</sub>g. For m<sub>h</sub> = 0.20 kg, what is it? (N)', answer: 0.2 * G, unit: 'N', tol: 0.02, hint: 'W = m × 9.8.', worked: '0.20 × 9.8 = 1.96 N.' });
          list.push({ id: S0 + 'tot', type: 'num', prompt: 'What is the total mass that moves in that run, cart plus hanging mass? (kg)', answer: M + 0.2, unit: 'kg', tol: 0.02, hint: 'The cart is ' + M.toFixed(2) + ' kg. Add the 0.20 kg.', worked: M.toFixed(2) + ' + 0.20 = ' + f2(M + 0.2) + ' kg.' });
          list.push({ id: S0 + 'a', type: 'num', prompt: 'Divide the pull by the total mass. What acceleration does ΣF = ma give? (m/s²) Compare it with your table.', answer: ahg(0.2), unit: 'm/s²', tol: 0.02, hint: 'a = ΣF ÷ total mass = 1.96 ÷ (cart + 0.20).', worked: '1.96 ÷ ' + f2(M + 0.2) + ' = ' + f2(ahg(0.2)) + ' m/s², matching the 0.20 kg row of your table.' });
          list.push({ id: S0 + 'which', type: 'choice', prompt: 'Which mass belongs in ΣF = ma for this system?', options: ['The cart plus the hanging mass.', 'The cart only.', 'The hanging mass only.', 'Neither: the string cancels the forces.'], answer: 0, hint: 'Both move with the same acceleration.', worked: 'The pull accelerates everything that moves: the cart and the hanging mass together.' });
        } else if (b === 3) {
          list.push({ id: S0 + 'pred', type: 'num', head: 'Predict, then test', prompt: 'Predict the acceleration for a hanging mass of <b>0.30 kg</b>, which is not in your table. (m/s²)', answer: ahg(0.3), unit: 'm/s²', tol: 0.02, hint: 'a = (m<sub>h</sub>g) ÷ (M + m<sub>h</sub>), with M = ' + M.toFixed(2) + ' kg.', worked: 'a = 0.30 × 9.8 ÷ (' + M.toFixed(2) + ' + 0.30) = ' + f2(0.3 * G) + ' ÷ ' + f2(M + 0.3) + ' = ' + f2(ahg(0.3)) + ' m/s².' });
          list.push({ id: S0 + 'ten', type: 'num', prompt: 'The string pulls the cart with a tension T. Only T acts on the cart horizontally. Using your predicted acceleration, find T = M × a. (N)', answer: M * ahg(0.3), unit: 'N', tol: 0.03, hint: 'Apply ΣF = ma to the cart alone.', worked: 'T = M·a = ' + M.toFixed(2) + ' × ' + f2(ahg(0.3)) + ' = ' + f2(M * ahg(0.3)) + ' N, less than the hanging weight ' + f2(0.3 * G) + ' N.' });
          list.push({ id: S0 + 'less', type: 'choice', prompt: 'Why is the tension less than the weight of the hanging mass?', options: ['The hanging mass is accelerating downward, so the net force on it points down: m<sub>h</sub>g − T = m<sub>h</sub>a.', 'The string stretches and loses force.', 'The pulley takes part of the force.', 'It is not less. They are equal.'], answer: 0, hint: 'Apply ΣF = ma to the hanging mass. If T equaled its weight, what would its acceleration be?', worked: 'If T = m<sub>h</sub>g the net force on the hanging mass would be zero, so it could not accelerate. Since it speeds up, T < m<sub>h</sub>g.' });
        } else {
          list.push({ id: S0 + 'form', type: 'choice', head: 'The general result', prompt: 'Applying ΣF = ma to the whole system gives which expression for the acceleration?', options: ['a = m<sub>h</sub>g ÷ (M + m<sub>h</sub>)', 'a = m<sub>h</sub>g ÷ M', 'a = g', 'a = (M + m<sub>h</sub>)g ÷ m<sub>h</sub>'], answer: 0, hint: 'Net force on the system: m<sub>h</sub>g. Total mass: M + m<sub>h</sub>.', worked: 'ΣF = m<sub>h</sub>g and the mass that moves is M + m<sub>h</sub>, so a = m<sub>h</sub>g/(M + m<sub>h</sub>).' });
          list.push({ id: S0 + 'tri', type: 'num', prompt: 'The hanging mass is three times the cart’s mass (m<sub>h</sub> = 3M). Find the acceleration. (m/s²)', answer: 3 * G / 4, unit: 'm/s²', tol: 0.02, hint: 'a = 3Mg ÷ (M + 3M).', worked: 'a = 3Mg/(4M) = ¾g = ' + f2(3 * G / 4) + ' m/s². M cancels.' });
          list.push({ id: S0 + 'lim', type: 'choice', prompt: 'What does the acceleration approach as the hanging mass becomes much greater than the cart’s mass?', options: ['g, as if the hanging mass were in free fall.', 'Zero.', 'Infinity.', '2g.'], answer: 0, hint: 'a = m<sub>h</sub>g/(M + m<sub>h</sub>). Let m<sub>h</sub> be huge.', worked: 'When m<sub>h</sub> ≫ M the denominator is about m<sub>h</sub>, so a → g. The cart then hardly matters, and the hanging mass falls almost freely.' });
          list.push({ id: S0 + 'pred', type: 'num', head: 'Predict, then test', prompt: 'Predict the acceleration for a hanging mass of <b>2.00 kg</b>. (m/s²)', answer: ahg(2.0), unit: 'm/s²', tol: 0.02, hint: 'a = m<sub>h</sub>g ÷ (M + m<sub>h</sub>), M = ' + M.toFixed(2) + ' kg.', worked: 'a = 2.00 × 9.8 ÷ (' + M.toFixed(2) + ' + 2.00) = ' + f2(ahg(2.0)) + ' m/s².' });
        }
        var host2 = el('div'); tasks.appendChild(host2);
        function concl() { if (host2.querySelector('.concl')) return; var cd = el('div', 'concl'); host2.appendChild(cd); asks(cd, [conclQ('D.concl', 'A 0.10 kg mass falls freely at 9.8 m/s². Hung from a string attached to a cart, it moves much more slowly. Explain why, using the idea of the mass being accelerated.', 'Part D conclusion')], function () { markDone('D'); }); }
        function testBox(mh, getAns, label) {
          return function () {
            if (host2.querySelector('.testbox')) return;
            var tw = el('div', 'testbox'); host2.appendChild(tw); tw.appendChild(el('p', 'qtext', 'Now test your prediction.'));
            var tr = el('div', 'row'), tb = el('button', 'btn primary', label); tb.type = 'button'; tr.appendChild(tb); tw.appendChild(tr);
            var ro = el('p', 'msg'); tw.appendChild(ro); var a2 = el('div'); tw.appendChild(a2);
            var meas = { id: S0 + 'meas', type: 'num', prompt: 'Enter the acceleration the test gave you. (m/s²)', answer: ahg(mh), unit: 'm/s²', tol: 0.02, hint: 'Run the test first, then read a from the readout.', worked: 'The measurement matches a = m<sub>h</sub>g/(M + m<sub>h</sub>).' };
            function showAfter() { if (a2.dataset.set) return; a2.dataset.set = '1'; asks(a2, [meas], concl); }
            tb.onclick = function () { tb.disabled = true; sim.run(pp(mh, mh > 0.4)).then(function (r) { tb.disabled = false; if (!r) return; D.D.custom = +r.a.toFixed(3); LE.save(); ro.textContent = 'Test run finished: a = ' + f2(r.a) + ' m/s² (tension ' + f2(r.tension) + ' N).'; showAfter(); }); };
            if (D.D.custom != null) { ro.textContent = 'Your earlier test run: a = ' + D.D.custom + ' m/s².'; showAfter(); }
          };
        }
        if (b === 3) asks(host2, list, testBox(0.3, null, 'Test 0.30 kg'));
        else if (b === 4) asks(host2, list, testBox(2.0, null, 'Test 2.00 kg'));
        else asks(host2, list, concl);
        if (LE.qs('D.concl') && LE.qs('D.concl').done) markDone('D');
      }
      renderTable(); showTasks();
    });

    parts.forEach(wireToggle);
    refresh();
  };
})();
