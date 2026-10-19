/* Newton's First Law: the Investigate step (four parts, each with a job).
   The sim is the same for every student; the tasks that follow it depend on the student's band. */
(function () {
  'use strict';
  var NFL = window.NFL = window.NFL || {};
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

  NFL.asks = asks; NFL.allDone = allDone;
  NFL.vA = function () { return pick(LE.seedRng('A'), [3.0, 3.5, 4.0, 4.5, 5.0]); };
  NFL.cParams = function () { var r = LE.seedRng('C'); return { mu: pick(r, [0.20, 0.25, 0.30, 0.35, 0.40]), m: pick(r, [0.4, 0.6, 0.8, 1.0, 1.2]) }; };
  NFL.dParams = function (b) {
    var r = LE.seedRng('D'), P = { m: 0.5, v0: 2.0, T: 5 };
    if (b === 1) { var f1 = pick(r, [4, 5, 6, 7, 8]); P.givens = [{ F: f1, ang: 0, name: 'F₁ (right)' }]; P.sol = { F: f1, ang: 180 }; }
    else if (b === 2) { var g1 = pick(r, [8, 10, 12]), g3 = pick(r, [3, 4, 5]); P.givens = [{ F: g1, ang: 0, name: 'F₁ (right)' }, { F: g3, ang: 180, name: 'F₃ (left)' }]; P.sol = { F: g1 - g3, ang: 180 }; }
    else if (b === 3) { var h1 = pick(r, [8, 10, 12]), a1 = pick(r, [20, 30, 40, 50]); P.givens = [{ F: h1, ang: a1, name: 'F₁' }]; P.sol = { F: h1, ang: a1 + 180 }; }
    else {
      var k1 = pick(r, [10, 12, 14]), b1 = pick(r, [15, 20, 25]), k2 = pick(r, [7, 8, 9]), b2 = pick(r, [130, 140, 150]);
      P.givens = [{ F: k1, ang: b1, name: 'F₁' }, { F: k2, ang: b2, name: 'F₂' }];
      var sx = k1 * Math.cos(b1 * Math.PI / 180) + k2 * Math.cos(b2 * Math.PI / 180), sy = k1 * Math.sin(b1 * Math.PI / 180) + k2 * Math.sin(b2 * Math.PI / 180);
      P.sx = sx; P.sy = sy; P.sol = { F: Math.hypot(sx, sy), ang: (Math.atan2(-sy, -sx) * 180 / Math.PI + 360) % 360 };
    }
    return P;
  };

  NFL.investigate = function (card, c) {
    var S = c.S, band = c.band, SURF = window.IceSim.SURF;
    S.d.inv = S.d.inv || { A: { runs: {} }, B: { runs: {} }, C: {}, D: {} };
    var D = S.d.inv;
    var h = el('h2', null, '3 · Investigate'); card.appendChild(h);
    card.appendChild(el('p', null, 'Four short investigations, each with a job. Finish one to open the next. Your numbers are your own: the people around you have slightly different ones.'));
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

    /* ---------------- Part A: the surface ladder ---------------- */
    var pa = mkPart('A', 'Part A · Six surfaces', function (inner) {
      var v0 = NFL.vA(), m = 0.5;
      var job = el('p', 'job'); job.innerHTML = '<b>Your job:</b> Launch the puck at <b>' + v0.toFixed(1) + ' m/s</b> on each of the six surfaces. Your table fills itself. Then use the numbers in it to answer the questions under the table.';
      inner.appendChild(job);
      var controls = el('div', 'controls'); inner.appendChild(controls);
      var sel = el('select'); SURF.forEach(function (s, i) { var o = el('option', null, s.name + '  (μ = ' + s.mu + ')'); o.value = String(i); sel.appendChild(o); });
      var runBtn = el('button', 'btn primary', 'Run'); runBtn.type = 'button';
      controls.appendChild(lab('Surface', sel)); controls.appendChild(runBtn);
      var host = el('div'); inner.appendChild(host);
      var sim = window.IceSim.create(host); sim.idle({ mu: 0.3, m: m, v0: v0, F: 0 }, 'Choose a surface and press Run.');
      var readout = el('div', 'readout'); inner.appendChild(readout);
      var tblHost = el('div', 'scroll'); inner.appendChild(tblHost);
      var tasks = el('div'); inner.appendChild(tasks);
      function renderTable() {
        tblHost.textContent = ''; var t = el('table', 'data'); t.innerHTML = '<thead><tr><th>Surface</th><th>μ</th><th>Stopping distance d (m)</th><th>Time to stop t (s)</th></tr></thead>';
        var tb = el('tbody'); SURF.forEach(function (s) { var r = D.A.runs[s.id], tr = el('tr'); tr.innerHTML = '<td>' + s.name + '</td><td>' + s.mu + '</td><td>' + (r ? (r.d == null ? 'never stops' : r.d.toFixed(2)) : '—') + '</td><td>' + (r ? (r.t == null ? 'never stops' : r.t.toFixed(2)) : '—') + '</td>'; tb.appendChild(tr); });
        t.appendChild(tb); tblHost.appendChild(t);
      }
      function allRan() { return SURF.every(function (s) { return D.A.runs[s.id]; }); }
      function record(s, r) {
        D.A.runs[s.id] = { d: r.stops ? +r.dist.toFixed(4) : null, t: r.stops ? +r.tStop.toFixed(4) : null, mu: s.mu }; LE.save();
        readout.innerHTML = r.stops ? '<span><b>' + s.name + '</b> stopped after <b>' + r.dist.toFixed(2) + ' m</b> in <b>' + r.tStop.toFixed(2) + ' s</b> (time-lapse)</span>' : '<span><b>' + s.name + '</b> never stopped. Speed after 20 s: <b>' + r.vEnd.toFixed(2) + ' m/s</b></span>';
        renderTable(); renderTasks();
      }
      runBtn.onclick = function () { var s = SURF[+sel.value]; runBtn.disabled = true; sim.run({ mu: s.mu, m: m, v0: v0, F: 0 }).then(function (r) { runBtn.disabled = false; if (r) record(s, r); }); };
      if (c.key) { var kb = el('button', 'btn small', 'Key: fill the table'); kb.type = 'button'; kb.onclick = function () { SURF.forEach(function (s) { var r = window.IceSim.solve({ mu: s.mu, m: m, v0: v0, F: 0 }); D.A.runs[s.id] = { d: r.stops ? +r.dist.toFixed(4) : null, t: r.stops ? +r.tStop.toFixed(4) : null, mu: s.mu }; }); LE.save(); renderTable(); renderTasks(); }; controls.appendChild(kb); }
      function R(id) { return D.A.runs[id]; }
      function renderTasks() {
        tasks.textContent = '';
        if (!allRan()) { var done = SURF.filter(function (s) { return D.A.runs[s.id]; }).length; tasks.appendChild(el('p', 'hint', 'Surfaces run so far: ' + done + ' of 6. The questions unlock when all six are in the table.')); return; }
        var b = c.band, list = [];
        var S0 = 'A.' + b + '.';
        list.push({ id: S0 + 'pattern', type: 'choice', head: 'Pattern', prompt: 'Look at your table. As μ gets smaller, what happens to the stopping distance?', options: ['The puck slides farther, and with no friction at all it never stops.', 'The puck stops sooner.', 'The distance stays about the same.', 'The puck slides farther, but there is a maximum distance it can reach.'], answer: 0, hint: 'Compare the Sandpaper row with the Air-hockey row, then look at the ideal surface.', worked: 'Less friction means a smaller backward force, so the speed drops more slowly and the puck travels farther. On the ideal surface there is nothing to slow it.' });
        if (b === 1) {
          list.push({ id: S0 + 'far', type: 'choice', head: 'Check the table', prompt: 'Which surface let the puck slide the farthest and still stop?', options: ['Air-hockey table', 'Sandpaper', 'Ice', 'Wood table'], answer: 0, hint: 'Look for the biggest number in the distance column.', worked: 'The air-hockey table has the smallest friction of the five surfaces that stop the puck, so it travels farthest.' });
          list.push({ id: S0 + 'cl', type: 'cloze', head: 'Finish the sentences', text: 'The less friction there is, the {1} the puck slides. With no friction at all, the puck {2}.', blanks: [['farther', 'further', 'longer', 'more'], ['never stops', 'keeps going', 'keeps moving', 'does not stop', 'doesnt stop']], bank: ['farther', 'shorter', 'never stops', 'stops quickly'], hint: 'Use the pattern in the table.' });
        } else if (b === 2) {
          var aw = v0 / R('wood').t, ai = v0 / R('ice').t;
          list.push({ id: S0 + 'aw', type: 'num', head: 'Speed lost each second', prompt: 'The puck lost its whole starting speed (' + v0.toFixed(1) + ' m/s) in the time shown in the table. Divide the starting speed by the time to stop on the <b>Wood table</b>. Answer in m/s².', answer: aw, unit: 'm/s²', tol: 0.03, hint: 'a = v₀ ÷ t. Use the wood row of your table.', worked: 'a = ' + v0.toFixed(1) + ' ÷ ' + R('wood').t.toFixed(2) + ' = ' + aw.toFixed(2) + ' m/s².' });
          list.push({ id: S0 + 'ai', type: 'num', prompt: 'Do the same for the <b>Ice</b> row (m/s²).', answer: ai, unit: 'm/s²', tol: 0.03, hint: 'a = v₀ ÷ t, with the ice row.', worked: 'a = ' + v0.toFixed(1) + ' ÷ ' + R('ice').t.toFixed(2) + ' = ' + ai.toFixed(3) + ' m/s².' });
          list.push({ id: S0 + 'ratio', type: 'num', prompt: 'Divide your Wood-table answer by 9.8. What number do you get? Compare it with the μ column.', answer: aw / G, unit: '', tol: 0.03, hint: 'Take the Wood-table acceleration and divide by 9.8.', worked: aw.toFixed(2) + ' ÷ 9.8 = ' + (aw / G).toFixed(2) + ', the same as μ for wood. So a = μg: friction sets how fast the puck slows.' });
          list.push({ id: S0 + 'zero', type: 'num', prompt: 'Following that pattern, how fast would the frictionless surface slow the puck? (m/s²)', answer: 0, abs: 0.01, unit: 'm/s²', hint: 'a = μg and μ = 0.', worked: 'a = 0 × 9.8 = 0 m/s². Its speed never changes.' });
        } else if (b === 3) {
          function accel(id) { return v0 * v0 / (2 * R(id).d); }
          [['sand', 'Sandpaper'], ['wax', 'Waxed floor'], ['air', 'Air-hockey table']].forEach(function (p) { list.push({ id: S0 + 'a_' + p[0], type: 'num', head: p[0] === 'sand' ? 'Compute the deceleration' : null, prompt: 'Use v² = 2ad with a final speed of 0 and the distance in your table. What is the puck’s deceleration on <b>' + p[1] + '</b>? (m/s²)', answer: accel(p[0]), unit: 'm/s²', tol: 0.03, hint: 'a = v₀² ÷ (2d). The starting speed is ' + v0.toFixed(1) + ' m/s.', worked: 'a = ' + v0.toFixed(1) + '² ÷ (2 × ' + R(p[0]).d.toFixed(2) + ') = ' + accel(p[0]).toFixed(3) + ' m/s².' }); });
          list.push({ id: S0 + 'rel', type: 'choice', prompt: 'Compare each deceleration with μ×9.8. What do you find?', options: ['a = μg on every surface.', 'a is twice μg.', 'a does not depend on μ.', 'a = μ ÷ g.'], answer: 0, hint: 'Compute μ×9.8 for Sandpaper (0.50) and compare it with your a.', worked: 'Sandpaper: 0.50 × 9.8 = 4.9 m/s², matching your a. The deceleration is μg.' });
          list.push({ id: S0 + 'F', type: 'num', head: 'The force behind it', prompt: 'The puck has mass 0.50 kg. Using your Wood-table deceleration, find m·a, the net force that slowed it. (N)', answer: m * accel('wood'), unit: 'N', tol: 0.03, hint: 'Multiply 0.50 kg by the Wood-table deceleration.', worked: 'm·a = 0.50 × ' + accel('wood').toFixed(2) + ' = ' + (m * accel('wood')).toFixed(2) + ' N.' });
          list.push({ id: S0 + 'F2', type: 'choice', prompt: 'Friction on the wood run is μmg = 0.30 × 0.50 × 9.8 = 1.47 N. It matches m·a. What does that tell you?', options: ['Friction alone accounts for the slowing. No other horizontal force acted.', 'A forward force also acted on the puck.', 'Mass has no effect on the motion.', 'The puck had no inertia.'], answer: 0, hint: 'If friction equals the net force, how much force is left over?', worked: 'Friction equals the net force, so no other horizontal force was involved. Nothing pushed the puck forward after the launch.' });
        } else {
          [['sand', 'Sandpaper'], ['ice', 'Ice'], ['air', 'Air-hockey table']].forEach(function (p) { list.push({ id: S0 + 'p_' + p[0], type: 'num', head: p[0] === 'sand' ? 'Find the hidden constant' : null, prompt: 'Multiply μ by the stopping distance for <b>' + p[1] + '</b>. (m)', answer: R(p[0]).mu * R(p[0]).d, unit: 'm', tol: 0.03, hint: 'Use the μ and d from the table.', worked: R(p[0]).mu + ' × ' + R(p[0]).d.toFixed(2) + ' = ' + (R(p[0]).mu * R(p[0]).d).toFixed(3) + ' m. It is the same for every surface: ' + (v0 * v0 / (2 * G)).toFixed(3) + '.' }); });
          list.push({ id: S0 + 'formula', type: 'choice', prompt: 'μ·d is the same on every surface. Which equation fits?', options: ['d = v₀² ÷ (2μg)', 'd = v₀ ÷ (μg)', 'd = μv₀² ÷ (2g)', 'd = 2μg ÷ v₀²'], answer: 0, hint: 'μ·d = a constant means d is proportional to 1/μ. The constant here is v₀²/(2g).', worked: 'From v² = 2ad with a = μg: d = v₀²/(2μg). Then μd = v₀²/(2g), constant at fixed v₀.' });
          var pred = v0 * v0 / (2 * 0.001 * G);
          list.push({ id: S0 + 'pred', type: 'num', head: 'Predict, then test', prompt: 'Use your equation to predict the stopping distance for μ = 0.001 at ' + v0.toFixed(1) + ' m/s. (m)', answer: pred, unit: 'm', tol: 0.02, hint: 'd = v₀² ÷ (2 × 0.001 × 9.8).', worked: 'd = ' + v0.toFixed(1) + '² ÷ 0.0196 = ' + pred.toFixed(0) + ' m.' });
        }
        var host2 = el('div'); tasks.appendChild(host2);
        var core = list.slice();
        function conclQ() { return { id: 'A.concl', type: 'text', minWords: 10, rows: 3, head: 'In your own words', prompt: 'What slows a sliding puck, and what would happen if nothing slowed it?', label: 'Part A conclusion' }; }
        function concl() { if (host2.querySelector('.concl')) return; var cd = el('div', 'concl'); host2.appendChild(cd); asks(cd, [conclQ()], function () { markDone('A'); }); }
        function testBox() {
          if (host2.querySelector('.testbox')) return;
          var tw = el('div', 'testbox'); host2.appendChild(tw);
          tw.appendChild(el('p', 'qtext', 'Now test your prediction in the simulator.'));
          var tr = el('div', 'row'); var tb = el('button', 'btn primary', 'Test μ = 0.001'); tb.type = 'button'; tr.appendChild(tb); tw.appendChild(tr);
          var ro = el('p', 'msg'); tw.appendChild(ro); var after = el('div'); tw.appendChild(after);
          var meas = { id: S0 + 'meas', type: 'num', prompt: 'Enter the stopping distance the simulation gave you for μ = 0.001. (m)', answer: window.IceSim.solve({ mu: 0.001, m: m, v0: v0, F: 0 }).dist, unit: 'm', tol: 0.02, hint: 'Run the test first, then read the distance.', worked: 'The sim and your equation agree: the same physics, a = μg, works down to tiny friction.' };
          var limit = { id: S0 + 'limit', type: 'choice', prompt: 'As μ approaches zero, the stopping distance:', options: ['grows without limit. The ideal puck never stops.', 'approaches zero.', 'approaches v₀.', 'stays constant.'], answer: 0, hint: 'd = v₀²/(2μg). What happens when the denominator shrinks?', worked: 'd ∝ 1/μ, so d → ∞ as μ → 0. A real puck needs a force to stop; with none, it never stops.' };
          function showAfter() { if (after.dataset.set) return; after.dataset.set = '1'; asks(after, [meas, limit], concl); }
          tb.onclick = function () { tb.disabled = true; sim.run({ mu: 0.001, m: m, v0: v0, F: 0 }).then(function (r) { tb.disabled = false; if (!r) return; D.A.custom = +r.dist.toFixed(2); LE.save(); ro.textContent = 'Stopped after ' + r.dist.toFixed(1) + ' m in ' + r.tStop.toFixed(0) + ' s (time-lapse).'; showAfter(); }); };
          if (D.A.custom != null) { ro.textContent = 'Your earlier test run: ' + D.A.custom + ' m.'; showAfter(); }
        }
        if (b === 4) asks(host2, core, testBox); else asks(host2, core, concl);
        if (LE.qs('A.concl') && LE.qs('A.concl').done) markDone('A');
      }
      renderTable(); renderTasks();
    });

    /* ---------------- Part B: does mass matter? ---------------- */
    var pb = mkPart('B', 'Part B · Does a heavier puck go farther?', function (inner) {
      var v0 = NFL.vA(), mu = 0.15;
      var job = el('p', 'job'); job.innerHTML = '<b>Your job:</b> On the waxed floor (μ = 0.15) launch a light puck and a heavy puck at the same speed (' + v0.toFixed(1) + ' m/s). Predict first, then compare the two stopping distances.';
      inner.appendChild(job);
      var predBox = el('div'); inner.appendChild(predBox);
      var rest = el('div'); inner.appendChild(rest);
      function renderPred() {
        predBox.textContent = '';
        predBox.appendChild(el('p', 'qtext', 'The heavy puck has 4 times the mass of the light one (1.00 kg versus 0.25 kg). Its stopping distance will be:'));
        var opts = ['shorter than the light puck’s', 'about the same as the light puck’s', 'longer than the light puck’s'], list = el('div', 'opts');
        opts.forEach(function (t, i) { var lb = el('label'); lb.style.display = 'flex'; lb.style.gap = '8px'; var rd = document.createElement('input'); rd.type = 'radio'; rd.name = 'bpred'; rd.value = String(i); rd.checked = D.B.pred === i; rd.disabled = D.B.pred != null; lb.appendChild(rd); lb.appendChild(document.createTextNode(t)); list.appendChild(lb); });
        predBox.appendChild(list);
        var lock = el('button', 'btn', 'Lock my prediction'); lock.type = 'button'; lock.disabled = D.B.pred != null; predBox.appendChild(lock);
        lock.onclick = function () { var sel = predBox.querySelector('input:checked'); if (!sel) return; D.B.pred = +sel.value; LE.save(); renderPred(); renderRest(); };
      }
      function renderRest() {
        rest.textContent = ''; if (D.B.pred == null) { rest.appendChild(el('p', 'hint', 'Lock a prediction to open the runs.')); return; }
        var controls = el('div', 'controls'); rest.appendChild(controls);
        var b1 = el('button', 'btn primary', 'Run the 0.25 kg puck'), b2 = el('button', 'btn primary', 'Run the 1.00 kg puck'); b1.type = b2.type = 'button'; controls.appendChild(b1); controls.appendChild(b2);
        var host = el('div'); rest.appendChild(host); var sim = window.IceSim.create(host); sim.idle({ mu: mu, m: 0.25, v0: v0, F: 0 }, 'Run both pucks.');
        var ro = el('div', 'readout'); rest.appendChild(ro);
        var tasks = el('div'); rest.appendChild(tasks);
        function upd() { ro.innerHTML = ['0.25', '1.00'].map(function (k) { var r = D.B.runs[k]; return '<span>' + k + ' kg: <b>' + (r ? r.d.toFixed(2) + ' m' : '—') + '</b></span>'; }).join(''); }
        function go(k) { var mm = +k; (k === '0.25' ? b1 : b2).disabled = true; sim.run({ mu: mu, m: mm, v0: v0, F: 0 }).then(function (r) { b1.disabled = b2.disabled = false; if (!r) return; D.B.runs[k] = { d: +r.dist.toFixed(4), t: +r.tStop.toFixed(4) }; LE.save(); upd(); showTasks(); }); }
        b1.onclick = function () { go('0.25'); }; b2.onclick = function () { go('1.00'); };
        if (c.key) { var kb = el('button', 'btn small', 'Key: fill runs'); kb.type = 'button'; kb.onclick = function () { ['0.25', '1.00'].forEach(function (k) { var r = window.IceSim.solve({ mu: mu, m: +k, v0: v0, F: 0 }); D.B.runs[k] = { d: +r.dist.toFixed(4), t: +r.tStop.toFixed(4) }; }); LE.save(); upd(); showTasks(); }; controls.appendChild(kb); }
        function showTasks() {
          tasks.textContent = ''; if (!(D.B.runs['0.25'] && D.B.runs['1.00'])) return;
          var names = ['shorter', 'about the same', 'longer'];
          tasks.appendChild(el('p', 'msg ok', 'You predicted “' + names[D.B.pred] + '.” Both pucks stopped after about ' + D.B.runs['1.00'].d.toFixed(2) + ' m. The mass made no difference.'));
          var b = c.band, S0 = 'B.' + b + '.', list = [];
          list.push({ id: S0 + 'why', type: 'choice', head: 'Why?', prompt: 'The heavier puck did not slide farther. Which explanation is best?', options: ['Friction on the heavy puck is bigger by the same factor that its inertia is bigger, so it slows at the same rate.', 'Mass has no effect on motion.', 'Heavy objects do not feel friction.', 'The heavier puck started with a lower speed.'], answer: 0, hint: 'Both the friction force and the inertia depend on mass. What happens when you divide one by the other?', worked: 'Friction is μmg, so it scales with m. Inertia scales with m too. Dividing, the slowing a = μg is independent of m. You will see this again with Newton’s second law.' });
          if (b <= 2) list.push({ id: S0 + 'fr', type: 'choice', prompt: 'On which puck was the friction force larger?', options: ['The heavy puck.', 'The light puck.', 'They were equal.', 'Neither, since there was no friction.'], answer: 0, hint: 'A heavier puck presses harder on the floor.', worked: 'Friction depends on how hard the surfaces press together. The heavy puck presses harder, so its friction is bigger.' });
          else {
            list.push({ id: S0 + 'f', type: 'num', prompt: 'Find the friction force on the 1.00 kg puck, f = μmg. (N)', answer: mu * 1.0 * G, unit: 'N', tol: 0.02, hint: 'μ = 0.15, m = 1.00 kg, g = 9.8 m/s².', worked: 'f = 0.15 × 1.00 × 9.8 = 1.47 N.' });
            if (b === 4) list.push({ id: S0 + 'a', type: 'num', prompt: 'Find the deceleration of the 0.25 kg puck. (m/s²) Is it the same for the 1.00 kg puck?', answer: mu * G, unit: 'm/s²', tol: 0.02, hint: 'a = f/m = μg.', worked: 'a = μg = 0.15 × 9.8 = 1.47 m/s² for either puck.' });
          }
          asks(tasks, list, function () { markDone('B'); });
        }
        upd(); showTasks();
      }
      renderPred(); renderRest();
    });

    /* ---------------- Part C: cruising ---------------- */
    var pc = mkPart('C', 'Part C · What keeps it cruising?', function (inner) {
      var P = NFL.cParams(), mu = P.mu, m = P.m, v0 = 3.0, TW = 6, f = mu * m * G;
      var job = el('p', 'job'); job.innerHTML = '<b>Your job:</b> The puck (mass ' + m + ' kg) is launched at 3.0 m/s. Find the forward push <b>F</b> that keeps its speed constant for 6 s on a rough floor (μ = ' + mu + '). Then find the push that cruises on ideal ice.';
      inner.appendChild(job);
      var b = c.band, S0 = 'C.' + b + '.';
      var gate = el('div'); inner.appendChild(gate);
      var controls = el('div', 'controls'); inner.appendChild(controls);
      var sel = el('select'); [['rough', 'Rough floor (μ = ' + mu + ')'], ['ideal', 'Ideal ice (μ = 0)']].forEach(function (p) { var o = el('option', null, p[1]); o.value = p[0]; sel.appendChild(o); });
      var Fin = el('input'); Fin.type = 'number'; Fin.step = '0.01'; Fin.min = '0'; Fin.max = '15'; Fin.value = '0'; Fin.setAttribute('aria-label', 'Forward push F in newtons');
      var run = el('button', 'btn primary', 'Run 6 s'); run.type = 'button';
      controls.appendChild(lab('Surface', sel)); controls.appendChild(lab('Push F (N)', Fin)); controls.appendChild(run);
      var host = el('div'); inner.appendChild(host); var sim = window.IceSim.create(host); sim.idle({ mu: mu, m: m, v0: v0, F: 0, TW: TW }, 'Set a push and press Run.');
      var ro = el('div', 'readout'); inner.appendChild(ro); var msg = el('p', 'msg'); inner.appendChild(msg);
      var tasks = el('div'); inner.appendChild(tasks);
      function muNow() { return sel.value === 'rough' ? mu : 0; }
      function showFr() { ro.innerHTML = '<span>Friction force on the sliding puck: <b>' + (muNow() * m * G).toFixed(2) + ' N</b></span><span>Mass: <b>' + m + ' kg</b></span>'; }
      sel.onchange = function () { showFr(); sim.idle({ mu: muNow(), m: m, v0: v0, F: 0, TW: TW }, 'Set a push and press Run.'); };
      showFr();
      var predQ = { id: S0 + 'pred', type: 'num', head: 'Predict first', prompt: 'Before you run it: what push F do you predict will keep the puck cruising on the rough floor? (N) You know μ, the mass and g.', answer: f, unit: 'N', tol: 0.03, hint: 'Cruising means zero net force, so F must cancel the friction force μmg.', worked: 'F = f = μmg = ' + mu + ' × ' + m + ' × 9.8 = ' + f.toFixed(2) + ' N.' };
      function predOK() { if (b < 3) return true; var s = LE.qs(predQ.id); return !!(s && s.done); }
      function setRun() { run.disabled = !predOK(); }
      if (b >= 3) { asks(gate, [predQ], function () { setRun(); }); }
      setRun();
      run.onclick = function () {
        var Fv = parseFloat(Fin.value); if (!isFinite(Fv) || Fv < 0) { msg.textContent = 'Enter a push of 0 N or more.'; msg.className = 'msg bad'; return; }
        run.disabled = true; var which = sel.value;
        sim.run({ mu: muNow(), m: m, v0: v0, F: Fv, TW: TW }).then(function (r) {
          setRun(); if (!r) return; var a = r.a;
          ro.innerHTML = '<span>Friction: <b>' + (muNow() * m * G).toFixed(2) + ' N</b></span><span>Your push: <b>' + Fv.toFixed(2) + ' N</b></span><span>Speed after ' + r.tEnd.toFixed(0) + ' s: <b>' + r.vEnd.toFixed(2) + ' m/s</b></span>';
          if (Math.abs(a) <= 0.03) { msg.className = 'msg ok'; msg.textContent = 'Cruising. The speed stayed at 3.0 m/s.'; if (which === 'rough') { D.C.cruise = +Fv.toFixed(3); } else { D.C.zero = true; } LE.save(); showTasks(); }
          else if (a > 0) { msg.className = 'msg bad'; msg.textContent = which === 'ideal' ? 'Speeding up. With nothing to oppose it, any push at all speeds the puck up.' : 'Speeding up: the push is bigger than friction. Try a smaller push.'; }
          else { msg.className = 'msg bad'; msg.textContent = 'Slowing down: the push is smaller than friction. Try a larger push.'; }
        });
      };
      if (c.key) { var kb = el('button', 'btn small', 'Key: set the answer'); kb.type = 'button'; kb.onclick = function () { Fin.value = sel.value === 'rough' ? f.toFixed(2) : '0'; }; controls.appendChild(kb); }
      function showTasks() {
        tasks.textContent = ''; var list1 = [], list2 = [];
        if (D.C.cruise != null) {
          list1.push({ id: S0 + 'net', type: 'choice', head: 'What you found', prompt: 'While the puck was cruising on the rough floor, the net force on it was:', options: ['0 N. The push and the friction were equal and opposite.', 'The size of the push.', 'The size of the friction force.', 'Greater than 0 N, pointing forward.'], answer: 0, hint: 'The speed did not change. What does the first law say about the net force?', worked: 'Constant velocity means zero net force. The push was cancelling friction, not creating motion.' });
          list1.push({ id: S0 + 'fr', type: 'num', prompt: 'You found F ≈ ' + D.C.cruise.toFixed(2) + ' N. What is the friction force on the puck? (N)', answer: f, unit: 'N', tol: 0.04, hint: 'Read it from the force readout under the sim.', worked: 'f = μmg = ' + f.toFixed(2) + ' N, matching the push.' });
        }
        host2(tasks, list1, function () {
          if (D.C.cruise == null) return;
          tasks.appendChild(el('p', 'hint', 'Now switch to <b>Ideal ice</b> and find the push that cruises there.')); tasks.lastChild.innerHTML = 'Now switch the surface to <b>Ideal ice</b> and find the push that keeps it cruising there.';
          if (D.C.zero) {
            list2.push({ id: S0 + 'zero', type: 'choice', head: 'The big idea', prompt: 'On ideal ice, what push is needed to keep the puck moving at constant velocity?', options: ['None. 0 N.', 'A small steady push.', 'As much as the original hit.', 'Its weight.'], answer: 0, hint: 'You just found it with the sim.', worked: 'With nothing opposing the motion, no force is needed. A force is needed to change velocity, not to keep it.' });
            list2.push({ id: 'C.words', type: 'text', minWords: 12, rows: 3, prompt: 'In your own words: why does the puck on the rough floor need a push to cruise, but the puck on ideal ice does not?', label: 'Part C conclusion' });
            var h2 = el('div'); tasks.appendChild(h2); asks(h2, list2, function () { markDone('C'); });
          }
        });
        function host2(parent, list, done) { var d = el('div'); parent.appendChild(d); if (list.length) asks(d, list, done); else done(); }
      }
      showTasks();
    });

    /* ---------------- Part D: balancing forces ---------------- */
    var pd = mkPart('D', 'Part D · Balancing several forces', function (inner) {
      var b = c.band, P = NFL.dParams(b), S0 = 'D.' + b + '.', SIM_TOL = b <= 2 ? 0.12 : (b === 3 ? 0.25 : 0.3);
      var job = el('p', 'job'); job.innerHTML = '<b>Your job:</b> This puck (mass 0.5 kg) glides on ideal ice at 2.0 m/s, viewed from above. ' + (b <= 2 ? 'One or two forces are already acting. Choose a new force that leaves the puck moving in a straight line at constant speed.' : 'Forces are acting on it. Find the one more force that makes the puck move in a straight line at constant speed. Calculate first, then test.');
      inner.appendChild(job);
      var givenTxt = P.givens.map(function (g) { return g.name + ' = ' + g.F + ' N at ' + g.ang + '°'; }).join(' · ');
      var gp = el('p'); gp.innerHTML = '<b>Given:</b> ' + givenTxt + (b >= 3 ? ' (angles measured counterclockwise from the direction the puck moves, east)' : ''); inner.appendChild(gp);
      var pre = el('div'); inner.appendChild(pre);
      var controls = el('div', 'controls'); inner.appendChild(controls);
      var mag = el('input'); mag.type = 'number'; mag.step = '0.01'; mag.min = '0'; mag.setAttribute('aria-label', 'Magnitude of the new force in newtons');
      var test = el('button', 'btn primary', 'Test my force'); test.type = 'button';
      controls.appendChild(lab('New force (N)', mag));
      var dir = null, ang = null;
      if (b <= 2) { dir = el('select'); [['right', 'toward the right'], ['left', 'toward the left']].forEach(function (p) { var o = el('option', null, p[1]); o.value = p[0]; dir.appendChild(o); }); controls.appendChild(lab('Direction', dir)); }
      else { ang = el('input'); ang.type = 'number'; ang.step = '0.1'; ang.min = '0'; ang.max = '360'; ang.setAttribute('aria-label', 'Angle of the new force in degrees'); controls.appendChild(lab('Angle (°)', ang)); }
      controls.appendChild(test);
      var host = el('div'); inner.appendChild(host); var sim = window.IceSim.create(host);
      sim.idleTop({ m: P.m, v0: P.v0, T: P.T, forces: P.givens });
      var msg = el('p', 'msg'); inner.appendChild(msg); var tasks = el('div'); inner.appendChild(tasks);
      var preList = [];
      if (b === 3) { var a1 = P.givens[0].ang * Math.PI / 180; preList = [{ id: S0 + 'x', type: 'num', head: 'Components first', prompt: 'Find the x-component of F₁ (N).', answer: P.givens[0].F * Math.cos(a1), unit: 'N', tol: 0.02, hint: 'F₁x = F₁ cos θ.', worked: 'F₁x = ' + P.givens[0].F + ' cos ' + P.givens[0].ang + '° = ' + (P.givens[0].F * Math.cos(a1)).toFixed(2) + ' N.' }, { id: S0 + 'y', type: 'num', prompt: 'Find the y-component of F₁ (N).', answer: P.givens[0].F * Math.sin(a1), unit: 'N', tol: 0.02, hint: 'F₁y = F₁ sin θ.', worked: 'F₁y = ' + P.givens[0].F + ' sin ' + P.givens[0].ang + '° = ' + (P.givens[0].F * Math.sin(a1)).toFixed(2) + ' N.' }]; }
      if (b === 4) { preList = [{ id: S0 + 'sx', type: 'num', head: 'Add the components first', prompt: 'Find ΣFx of F₁ and F₂ together (N).', answer: P.sx, unit: 'N', tol: 0.02, hint: 'Add F cos θ for each force. F₂ points in the second quadrant, so its x-component is negative.', worked: 'ΣFx = ' + P.sx.toFixed(2) + ' N.' }, { id: S0 + 'sy', type: 'num', prompt: 'Find ΣFy of F₁ and F₂ together (N).', answer: P.sy, unit: 'N', tol: 0.02, hint: 'Add F sin θ for each force.', worked: 'ΣFy = ' + P.sy.toFixed(2) + ' N.' }]; }
      function preOK() { return !preList.length || allDone(preList); }
      function setTest() { test.disabled = !preOK(); }
      if (preList.length) asks(pre, preList, setTest);
      setTest();
      if (c.key) { var kb = el('button', 'btn small', 'Key: set the answer'); kb.type = 'button'; kb.onclick = function () { mag.value = P.sol.F.toFixed(2); if (dir) dir.value = 'left'; if (ang) ang.value = P.sol.ang.toFixed(1); }; controls.appendChild(kb); inner.appendChild(el('p', 'keyline', 'KEY: new force = ' + P.sol.F.toFixed(2) + ' N' + (b >= 3 ? ' at ' + P.sol.ang.toFixed(1) + '°' : ' toward the left'))); }
      test.onclick = function () {
        var M = parseFloat(mag.value); if (!isFinite(M) || M < 0) { msg.className = 'msg bad'; msg.textContent = 'Enter the size of the force in newtons.'; return; }
        var A = dir ? (dir.value === 'right' ? 0 : 180) : parseFloat(ang.value); if (!isFinite(A)) { msg.className = 'msg bad'; msg.textContent = 'Enter the angle in degrees.'; return; }
        var forces = P.givens.map(function (g) { return { F: g.F, ang: g.ang }; }); forces.push({ F: M, ang: A });
        test.disabled = true; D.D.tests = (D.D.tests || 0) + 1;
        sim.runTop({ m: P.m, v0: P.v0, T: P.T, forces: forces }).then(function (r) {
          setTest(); if (!r) return;
          if (r.net <= SIM_TOL) { msg.className = 'msg ok'; msg.textContent = 'Balanced. The net force is ' + r.net.toFixed(2) + ' N, so the puck keeps going straight at 2.0 m/s.'; D.D.ok = true; LE.save(); after(); }
          else { msg.className = 'msg bad'; var dirn = (Math.atan2(r.fy, r.fx) * 180 / Math.PI + 360) % 360; msg.textContent = 'Not balanced yet. The net force is ' + r.net.toFixed(2) + ' N at ' + dirn.toFixed(0) + '°, so the puck curved off its straight path. Your new force must cancel that.'; LE.save(); }
        });
      };
      function after() {
        tasks.textContent = '';
        var list = [{ id: S0 + 'path', type: 'choice', head: 'What you saw', prompt: 'While the forces were balanced, the puck’s path and speed were:', options: ['A straight line at constant speed.', 'A curve at constant speed.', 'A straight line, speeding up.', 'It stopped.'], answer: 0, hint: 'Look at the path in the sim and the speed graph.', worked: 'Balanced forces gave zero net force, so the velocity (speed and direction) did not change.' },
          { id: S0 + 'rest', type: 'choice', prompt: 'Could the same balanced forces keep a puck at rest instead of moving?', options: ['Yes. Balanced forces mean zero net force, which allows rest or constant velocity.', 'No. Balanced forces always keep things moving.', 'No. Balanced forces always bring things to rest.', 'Only on a frictionless surface.'], answer: 0, hint: 'Zero net force describes what about the velocity?', worked: 'Zero net force means the velocity does not change. If it was zero, it stays zero. If not, it stays the same.' }];
        asks(tasks, list, function () { markDone('D'); });
      }
      if (D.D.ok) after();
    });

    parts.forEach(wireToggle);
    refresh();
  };
})();
