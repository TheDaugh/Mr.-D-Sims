/* Newton's Second Law: online lesson. Registers itself with the engine; the page calls LE.start(cfg). */
(function () {
  'use strict';
  var LE = window.LE, N2L = window.N2L, el = LE.el, ID = 'newtons-second-law', G = 9.8;
  var L = 'ABCDEFG';
  function plain(h) { var d = document.createElement('div'); d.innerHTML = String(h == null ? '' : h); return d.textContent.replace(/\s+/g, ' ').trim(); }
  function optText(o) { return typeof o === 'string' ? plain(o) : plain((o.label || o.html || '') + (o.desc ? ' (' + o.desc + ')' : '')); }
  function f2(x) { return Number(x).toFixed(2); }
  function codeBox(card, c, key, label) {
    var S = c.S, wrap = el('div');
    if (!S.huddle[key] && !LE.gatesOn()) { S.huddle[key] = LE.isKey() ? 'key' : 'open'; LE.save(); }   // 3 PM to 7 AM, weekends, and #key: no code
    if (S.huddle[key]) { if (S.huddle[key] === true) wrap.appendChild(el('p', 'msg ok', 'Code accepted.')); card.appendChild(wrap); return; }
    wrap.appendChild(el('p', null, 'Look up. Mr. D has the code. Enter it to continue.'));
    var row = el('div', 'row'), inp = el('input'); inp.type = 'text'; inp.inputMode = 'numeric'; inp.maxLength = 4; inp.setAttribute('aria-label', label); inp.style.width = '6em';
    var btn = el('button', 'btn', 'Enter code'); btn.type = 'button'; row.appendChild(inp); row.appendChild(btn); wrap.appendChild(row);
    var msg = el('p', 'msg bad', 'That code is not right. Ask Mr. D to check it.'); msg.hidden = true; wrap.appendChild(msg); card.appendChild(wrap);
    btn.onclick = function () { if (inp.value.trim() === LE.codeFor(ID, key)) { S.huddle[key] = true; LE.save(); LE.render(); } else msg.hidden = false; };
  }
  function qdone(id) { var s = LE.qs(id); return !!(s && s.done); }

  /* ================= steps ================= */
  var steps = [];

  steps.push({ id: 'start', label: 'Start',
    render: function (card, c) {
      var S = c.S; card.appendChild(el('h2', null, 'Newton’s Second Law'));
      var p = el('div', 'prose'); p.innerHTML = '<p>Today’s question: <b>what decides how quickly something speeds up?</b> A fan pushes a cart, a rope pulls a crate, gravity pulls a falling ball. You will predict what happens, test it on a cart track, write the rule yourself, and then work problems that adjust to how you are doing. Your own notes build as you go, and you can print them at the end.</p><p>The questions adapt. Some people will see harder problems than others, and everyone ends on the same final check. If something feels easy or hard, that is the lesson doing its job. There is always another question waiting at your level, so keep going until Mr. D calls time.</p>';
      card.appendChild(p);
      var ol = el('ol'); ['Warm-up', 'Predict', 'Investigate', 'Huddle with Mr. D', 'Name it and build your notes', 'Try it', 'Check'].forEach(function (t) { ol.appendChild(el('li', null, t)); }); card.appendChild(ol);
      var row = el('div', 'row'); var f = el('input'); f.type = 'text'; f.maxLength = 20; f.value = S.first; f.setAttribute('aria-label', 'First name'); var pe = el('input'); pe.type = 'text'; pe.maxLength = 4; pe.value = S.period; pe.setAttribute('aria-label', 'Class period'); pe.style.width = '5em';
      var l1 = el('label', null, 'First name '); l1.appendChild(f); var l2 = el('label', null, 'Period '); l2.appendChild(pe); row.appendChild(l1); row.appendChild(l2); card.appendChild(row);
      card.appendChild(el('p', 'hint', 'First name and period only. No accounts. Your progress saves in this browser.'));
      function upd() { S.first = f.value; S.period = pe.value; LE.save(); LE.gate(); }
      f.addEventListener('input', upd); pe.addEventListener('input', upd);
    },
    canLeave: function (c) { return c.S.first.trim().length > 0 && c.S.period.trim().length > 0; },
    teacher: function () { return '<p>Name and period only. Every number in the lesson is seeded from name + period, so neighbors see different values and a student gets the same numbers on any device. About 1 minute.</p>'; } });

  steps.push({ id: 'warmup', label: 'Warm-up',
    render: function (card, c) {
      var S = c.S; card.appendChild(el('h2', null, '1 · Warm-up'));
      card.appendChild(el('p', null, 'Five quick questions on what you already know. One try each. This is not graded; it tells the lesson where to start you.'));
      var host = el('div'); card.appendChild(host);
      var list = N2L.warm.map(function (q) { return { id: q.id, type: 'choice', prompt: q.prompt, options: q.options, answer: q.answer, maxMiss: 1, head: 'Warm-up ' + q.id.slice(1) }; });
      function fin() {
        if (!N2L.allDone(list) || S.band0) return;
        var ok = list.filter(function (q) { var s = LE.qs(q.id); return s && s.ok && s.misses === 0; }).length;
        S.warm = ok; S.band0 = N2L.bandFromWarm(ok); S.band = S.band0; S.bandLog.push('start:' + S.band0); LE.save();
        host.appendChild(el('p', 'msg ok', 'Warm-up saved. Let’s go.')); LE.gate();
      }
      N2L.asks(host, list, fin);
      if (S.band0) host.appendChild(el('p', 'msg ok', 'Warm-up saved. Let’s go.'));
    },
    canLeave: function (c) { return !!c.S.band0 || N2L.warm.every(function (q) { return qdone(q.id); }); },
    teacher: function (c) { return '<p>Placement is silent. Correct on the first try: 0–1 → band 1, 2–3 → band 2, 4 → band 3, 5 → band 4. Band 1 = foundation, 2 = core, 3 = honors, 4 = advanced (AP/college). The band then moves up or down by performance in Try it. Use <b>Preview level</b> in the red bar to see any band. The warm-up checks the prerequisites: net force, acceleration from a velocity change, the first law, a v–t graph (slope and area) and proportional reasoning. Answers: W1 18 N east, W2 2 m/s², W3 0 N, W4 4 m/s² and 18 m, W5 5 cm.</p><p>This student’s band right now: <b>' + c.band + '</b>.</p>'; } });

  steps.push({ id: 'predict', label: 'Predict',
    render: function (card, c) {
      var S = c.S; S.d.pred = S.d.pred || []; card.appendChild(el('h2', null, '2 · Predict'));
      card.appendChild(el('p', null, 'Commit to an answer before you test anything. For each one choose an answer, say how sure you are, and give a reason of at least six words. Nothing is graded here. Wrong predictions are the most useful thing you will write today.'));
      N2L.preds.forEach(function (P, i) {
        var st = S.d.pred[i] || (S.d.pred[i] = { pick: null, conf: null, why: '', locked: false });
        var box = el('div', 'q'); card.appendChild(box); box.appendChild(el('p', 'qhead', 'Prediction ' + (i + 1) + ' of 3 · ' + P.title)); var qt = el('p', 'qtext'); qt.innerHTML = P.prompt; box.appendChild(qt);
        var list = el('div', 'opts' + (P.grid ? ' grid' : '')); box.appendChild(list);
        var order = LE.shuffle(P.options.map(function (_, k) { return k; }), LE.seedRng('pred:' + i));
        order.forEach(function (k) {
          var lb = el('label', 'opt'); lb.style.display = 'flex'; lb.style.gap = '8px'; lb.style.alignItems = 'flex-start';
          var rd = document.createElement('input'); rd.type = 'radio'; rd.name = 'p' + i; rd.value = String(k); rd.checked = st.pick === k; rd.disabled = st.locked; lb.appendChild(rd);
          var sp = el('span'); sp.innerHTML = (typeof P.options[k] === 'string' ? P.options[k] : P.options[k].svg + '<span>' + P.options[k].label + '</span>'); lb.appendChild(sp);
          if (c.key && k === P.correct) lb.classList.add('keyans');
          rd.onchange = function () { st.pick = k; LE.save(); upd(); }; list.appendChild(lb);
        });
        var cr = el('div', 'row'); cr.appendChild(el('span', null, 'How sure are you?'));
        [['1', 'Guess'], ['2', 'Fairly sure'], ['3', 'Certain']].forEach(function (cc) { var lb = el('label'); var rd = document.createElement('input'); rd.type = 'radio'; rd.name = 'c' + i; rd.value = cc[0]; rd.checked = String(st.conf) === cc[0]; rd.disabled = st.locked; rd.onchange = function () { st.conf = +cc[0]; LE.save(); upd(); }; lb.appendChild(rd); lb.appendChild(document.createTextNode(' ' + cc[1])); cr.appendChild(lb); });
        box.appendChild(cr);
        var ta = el('textarea'); ta.rows = 2; ta.value = st.why; ta.disabled = st.locked; ta.placeholder = 'Because…'; ta.setAttribute('aria-label', 'Reason for prediction ' + (i + 1)); box.appendChild(ta);
        var row = el('div', 'row'); var lock = el('button', 'btn', st.locked ? 'Locked' : 'Lock this prediction'); lock.type = 'button'; var cnt = el('span', 'hint', ''); row.appendChild(lock); row.appendChild(cnt); box.appendChild(row);
        function upd() { var n = LE.words(ta.value); cnt.textContent = st.locked ? '' : n + ' of 6 words'; lock.disabled = st.locked || st.pick == null || !st.conf || n < 6; }
        ta.addEventListener('input', function () { st.why = ta.value; LE.save(); upd(); });
        lock.onclick = function () { st.why = ta.value; st.locked = true; LE.save(); LE.render(); };
        upd();
      });
    },
    canLeave: function (c) { var p = c.S.d.pred || []; return p.length === 3 && p.every(function (x) { return x && x.locked; }); },
    teacher: function () { return '<p>Correct: ' + N2L.teacherInfo.predAnswers + '. Gold outline marks them here. The options are shuffled per student. The classic wrong ideas: Graph B or C (“force sets the speed”, a jump to a top speed), and for P2 the 0.50 m/s² (“force doesn’t change anything”). Notice who is <b>Certain and wrong</b>; they are the best voices at Huddle 1. Confidence scores and reasons go into the report code.</p>'; } });

  steps.push({ id: 'investigate', label: 'Investigate',
    render: function (card, c) { N2L.investigate(card, c); },
    canLeave: function (c) { var I = c.S.d.inv; return !!(I && I.A.done && I.B.done && I.C.done && I.D.done); },
    teacher: function (c) {
      var A = N2L.pA(), B = N2L.pB(), C = N2L.pC(c.band), Dd = N2L.pD();
      return '<p><b>Four parts on one cart track, each with a job; the tasks depend on band.</b></p><ul>' +
        '<li><b>A, push harder.</b> This student’s cart: <b>' + A.m + ' kg</b>, smooth track, five fan forces, 4.0 s runs. a = F/m, so the a–F graph is a line through the origin with slope 1/m = ' + (1 / A.m).toFixed(3) + '. Band 1 reads the pattern; 2 finds F ÷ a = mass; 3 finds the slope; 4 gives the units of a newton and predicts a 6.0 N test.</li>' +
        '<li><b>B, load it up.</b> Fixed force <b>' + B.F + ' N</b>, five masses. Locked prediction first. a = F/m; a against 1/m is a line with slope F (bands 3–4). Band 4 tests two changes at once (2F, 3.0 kg: a = 2F/3).</li>' +
        '<li><b>C, the force that counts.</b> Rough track: μ = ' + C.mu + ', m = ' + C.m + ' kg, friction <b>' + f2(C.f) + ' N</b>. Target a = ' + C.at.toFixed(3) + ' m/s² (band ' + c.band + '). Fan force needed: <b>' + f2(C.Fneed) + ' N</b> (= μmg + ma). Passing: |a − target| ≤ 0.04. Band 4 states the target as a distance in 4.0 s.</li>' +
        '<li><b>D, a hanging mass.</b> Cart <b>' + Dd.M.toFixed(2) + ' kg</b>. a = m<sub>h</sub>g/(M + m<sub>h</sub>): 0.05 kg → ' + f2(N2L.aHang(Dd.M, 0.05)) + ', 0.10 → ' + f2(N2L.aHang(Dd.M, 0.1)) + ', 0.20 → ' + f2(N2L.aHang(Dd.M, 0.2)) + ', 0.40 → ' + f2(N2L.aHang(Dd.M, 0.4)) + ' m/s². Band 3 predicts 0.30 kg; band 4 predicts 2.00 kg (' + f2(N2L.aHang(Dd.M, 2)) + ' m/s²).</li></ul><p>The red <b>Key</b> buttons in each part fill the table or set the answer so you can move through quickly.</p>'; } });

  steps.push({ id: 'huddle', label: 'Huddle',
    render: function (card, c) {
      var S = c.S; S.d.pred = S.d.pred || []; card.appendChild(el('h2', null, '4 · Huddle'));
      codeBox(card, c, 'h1', 'Class code');
      if (!S.huddle.h1) return;
      card.appendChild(el('h3', null, 'Your predictions against the evidence'));
      var t = el('table', 'data'); t.innerHTML = '<thead><tr><th>Prediction</th><th>You chose</th><th>Sure?</th><th>The evidence says</th><th></th></tr></thead>'; var tb = el('tbody');
      N2L.preds.forEach(function (P, i) { var st = S.d.pred[i] || { pick: null, conf: 0 }, tr = el('tr'); var ok = st.pick === P.correct; tr.innerHTML = '<td>' + P.title + '</td><td>' + (st.pick == null ? '(no prediction yet)' : optText(P.options[st.pick])) + '</td><td>' + ['', 'Guess', 'Fairly sure', 'Certain'][st.conf || 0] + '</td><td>' + optText(P.options[P.correct]) + '</td><td class="' + (ok ? 'ok' : '') + '">' + (ok ? '✓' : '✗') + '</td>'; tb.appendChild(tr); });
      t.appendChild(tb); var sc = el('div', 'scroll'); sc.appendChild(t); card.appendChild(sc);
      card.appendChild(el('h3', null, 'State the rule'));
      var host = el('div'); card.appendChild(host);
      LE.ask(host, { id: 'rule', type: 'text', minWords: 14, rows: 4, prompt: 'Using what you found in Parts A to D, write the rule that connects acceleration, net force and mass. Say what happens to the acceleration when the net force changes and when the mass changes.', label: 'My rule' });
    },
    canLeave: function (c) { return !!c.S.huddle.h1 && qdone('rule'); },
    teacher: function () {
      return '<p><b>Huddle 1 code: ' + LE.codeFor(ID, 'h1') + '</b> (changes each school day at 7:00 AM; asked for only on weekdays 7:00 AM to 3:00 PM). Give it once most of the class has finished Part C.</p><ul><li>Ask the Certain-and-wrong students, kindly, which graph they chose for P1 and what the track showed.</li><li>Part C found the fan force was <i>more</i> than m × a. Ask: where did the rest of the force go? (Friction took it back. The net force is what m × a measures.)</li><li>Part D: a 0.10 kg mass falls at 9.8 m/s² alone, but only a fraction of that when it drags a cart. Which mass is accelerating?</li><li>Let the class state the rule before you do. Their own wording goes into their notes.</li></ul>'; } });

  steps.push({ id: 'name', label: 'Name it',
    render: function (card, c) {
      var S = c.S, d = S.d; if (!d.nameBand) { d.nameBand = c.band; LE.save(); } var b = d.nameBand;
      card.appendChild(el('h2', null, '5 · Name it'));
      card.appendChild(el('p', null, 'You found the rule by experiment. Now it gets its formal name. Read the explanation, then build your notes.'));
      var reg = d.reg || N2L.regForBand(b); var regs = el('div', 'regs'); regs.appendChild(el('span', 'hint', 'Explain it in: '));
      ['simple', 'standard', 'college'].forEach(function (k) { var bt = el('button', 'btn small', N2L.regName[k]); bt.type = 'button'; bt.setAttribute('aria-pressed', String(k === reg)); bt.onclick = function () { d.reg = k; (d.regSwitch = d.regSwitch || []).push(k); LE.save(); LE.render(); }; regs.appendChild(bt); }); card.appendChild(regs);
      var ex = el('div', 'prose'); N2L.explain[reg].forEach(function (t) { var p = el('p'); p.innerHTML = t; ex.appendChild(p); }); card.appendChild(ex);
      card.appendChild(el('h3', null, 'The law, in your hands'));
      var hc = el('div'); card.appendChild(hc); var cz = N2L.cloze[b];
      LE.ask(hc, { id: 'name.cloze.' + b, type: 'cloze', text: cz.text, blanks: cz.blanks, bank: cz.bank, hint: 'Reread the explanation above.' });
      card.appendChild(el('h3', null, 'Draw the forces, then find the net force'));
      card.appendChild(el('p', 'hint', 'For each situation, check every force that is really acting. Then say which way the net force points.'));
      var fb = el('div', 'fbdbox'); card.appendChild(fb); d.fbd = d.fbd || {};
      N2L.fbdScenes.forEach(function (sc) {
        var cell = el('div', 'cell'); fb.appendChild(cell); cell.appendChild(el('p', 'qtext', sc.title));
        if (d.fbd[sc.id]) {
          var dv = el('div'); dv.innerHTML = LE.fbdSVG({ forces: sc.forces, title: sc.title }); cell.appendChild(dv);
          var lab = N2L.netOptions.filter(function (o) { return o.k === sc.net; })[0].t, others = N2L.netOptions.filter(function (o) { return o.k !== sc.net; }).map(function (o) { return o.t; });
          LE.ask(cell, { id: 'fbd.net.' + sc.id, type: 'choice', prompt: 'The net force on it points:', options: [lab].concat(others), answer: 0, hint: 'Compare the lengths of the arrows along the line of motion (or the only arrow, if there is just one).', worked: sc.note });
          return;
        }
        var ch = el('div', 'checks'); var inputs = {};
        N2L.fbdForces.forEach(function (f) { var lb = el('label'); var cb = document.createElement('input'); cb.type = 'checkbox'; inputs[f.k] = cb; lb.appendChild(cb); lb.appendChild(document.createTextNode(f.t)); if (c.key && sc.need.indexOf(f.k) >= 0) lb.style.outline = '2px solid #b7791f'; ch.appendChild(lb); });
        cell.appendChild(ch); var bt = el('button', 'btn small', 'Check'); bt.type = 'button'; cell.appendChild(bt); var m = el('p', 'msg'); cell.appendChild(m);
        bt.onclick = function () {
          var got = Object.keys(inputs).filter(function (k) { return inputs[k].checked; }), need = sc.need;
          var extra = got.filter(function (k) { return need.indexOf(k) < 0; }), miss = need.filter(function (k) { return got.indexOf(k) < 0; });
          if (!extra.length && !miss.length) { d.fbd[sc.id] = true; LE.save(); LE.render(); return; }
          d.fbdMiss = (d.fbdMiss || 0) + 1; LE.save(); m.className = 'msg bad';
          if (extra.indexOf('M') >= 0) m.textContent = 'No object is pushing it forward. A “force of motion” is not a force. Ask: what is touching or pulling it?';
          else if (extra.length) m.textContent = 'One of the forces you checked is not acting here. Ask what object exerts each one.';
          else m.textContent = 'You are missing a force. Think: what pulls it down, what holds it up, what opposes sliding, and what pushes?';
        };
      });
      card.appendChild(el('h3', null, 'Vocabulary in your own words'));
      card.appendChild(el('p', 'hint', 'Write each definition yourself (at least six words). Then you will see the textbook version to compare.'));
      var vh = el('div'); card.appendChild(vh);
      N2L.vocab.filter(function (v) { return v.bands.indexOf(b) >= 0; }).forEach(function (v) { LE.ask(vh, { id: 'vocab.' + v.id, type: 'text', minWords: 6, rows: 2, head: v.term, prompt: b === 1 && v.starter ? v.starter : 'Define: ' + v.term, label: v.term, worked: '<b>Textbook:</b> ' + v.model }); });
      card.appendChild(el('h3', null, 'The big misconception'));
      var mh = el('div'); card.appendChild(mh); LE.ask(mh, { id: 'name.misc', type: 'cloze', text: N2L.misc.text, blanks: N2L.misc.blanks, hint: 'Think about the v–t graph in Prediction 1 and Part A.' });
    },
    canLeave: function (c) {
      var d = c.S.d, b = d.nameBand || c.band;
      return qdone('name.cloze.' + b) && N2L.fbdScenes.every(function (s) { return d.fbd && d.fbd[s.id] && qdone('fbd.net.' + s.id); }) && N2L.vocab.filter(function (v) { return v.bands.indexOf(b) >= 0; }).every(function (v) { return qdone('vocab.' + v.id); }) && qdone('name.misc');
    },
    teacher: function () { return '<p>Three registers of the same explanation (plain / standard / college); students can switch, and the engine logs which they used. The sentence-completion item differs by band (word bank at band 1, vector form and the link to the first law at band 4). The free-body diagrams go one step past lesson 1: after choosing the forces, students say which way the <b>net</b> force points. Scene 2 (cart still moving right, fan off) targets the idea that velocity and net force can point opposite ways. The student’s own definitions, then the textbook version, go into their notes.</p>'; } });

  steps.push({ id: 'try', label: 'Try it',
    render: function (card, c) {
      var S = c.S, T = S.d.try = S.d.try || { i: 0, log: [], bands: {} }; card.appendChild(el('h2', null, '6 · Try it'));
      card.appendChild(el('p', 'hint', 'Six questions, one on each idea. The questions adjust to how you are doing. A hint appears after a miss, and a full explanation appears when you finish each one.'));
      var host = el('div'); card.appendChild(host);
      if (T.i >= N2L.skills.length) { host.appendChild(el('p', 'msg ok', 'All six done. Continue to the final check.')); return; }
      var sk = N2L.skills[T.i], b = T.bands[T.i] || (T.bands[T.i] = LE.band()); LE.save();
      var q = sk.gen(b, LE.seedRng('try:' + sk.id + ':' + b)); q.id = 'try.' + sk.id + '.' + b; q.head = 'Question ' + (T.i + 1) + ' of ' + N2L.skills.length + ' · ' + sk.title;
      function nextBtn() {
        if (host.querySelector('.nextq')) return; var row = el('div', 'row nextq'); var nb = el('button', 'btn primary', T.i + 1 < N2L.skills.length ? 'Next question' : 'Finish'); nb.type = 'button'; row.appendChild(nb); host.appendChild(row);
        nb.onclick = function () {
          var st = LE.qs(q.id), m = st.misses, nbd = m === 0 ? b + 1 : (m === 1 ? b : b - 1);
          var ans = q.type === 'choice' ? optText(q.options[q.answer]) : (LE.fmtN(q.answer) + (q.unit ? ' ' + q.unit : ''));
          T.log.push({ i: T.i, skill: sk.id, title: sk.title, band: b, misses: m, ok: !!st.ok, secs: st.secs || 0, p: plain(q.prompt), a: ans, w: plain(q.worked) });
          LE.setBand(nbd, sk.id); T.i++; LE.save(); LE.render();
        };
      }
      q.onDone = function () { nextBtn(); };
      LE.ask(host, q);
      if (qdone(q.id)) nextBtn();
    },
    canLeave: function (c) { var T = c.S.d.try; return !!T && T.i >= N2L.skills.length; },
    teacher: function (c) {
      var T = c.S.d.try, rows = N2L.skills.map(function (s) { return '<li><b>' + s.title + '</b>: ' + N2L.skillTeacher[s.id] + '</li>'; }).join('');
      return '<p><b>Hidden ladder.</b> First try right → next question one band up (cap 4). One miss → same band. Two misses or a reveal → one band down. Students are never shown a band. The explanation appears after every question, so a drop always arrives with a worked answer.</p><ul>' + rows + '</ul><p>Band path so far for this device: ' + (c.S.bandLog.join(' → ') || '—') + '.</p>'; } });

  steps.push({ id: 'check', label: 'Check',
    render: function (card, c) {
      var S = c.S; card.appendChild(el('h2', null, '7 · Check')); S.d.conf = S.d.conf || {};
      if (!S.huddle.h2 && !LE.gatesOn()) { S.huddle.h2 = LE.isKey() ? 'key' : 'open'; LE.save(); }
      if (!S.huddle.h2) { card.appendChild(el('p', null, 'Huddle 2. Mr. D will give you the second code when the class is ready.')); codeBox(card, c, 'h2', 'Second class code'); return; }
      card.appendChild(el('p', 'hint', 'The same three questions for everyone. You get one try on each of the first two. Tell us how sure you were; honest answers help the most.'));
      [['C1', N2L.check.c1], ['C2', N2L.check.c2]].forEach(function (pair) {
        var host = el('div'); card.appendChild(host); var q = {}; for (var k in pair[1]) q[k] = pair[1][k]; q.head = 'Check ' + pair[0].slice(1);
        q.onDone = function () { LE.gate(); }; LE.ask(host, q);
        var cr = el('div', 'row'); cr.appendChild(el('span', null, 'How sure were you?'));
        [['1', 'Guess'], ['2', 'Fairly sure'], ['3', 'Certain']].forEach(function (cc) { var lb = el('label'); var rd = document.createElement('input'); rd.type = 'radio'; rd.name = 'cf' + pair[0]; rd.checked = String(S.d.conf[pair[0]]) === cc[0]; rd.onchange = function () { S.d.conf[pair[0]] = +cc[0]; LE.save(); LE.gate(); }; lb.appendChild(rd); lb.appendChild(document.createTextNode(' ' + cc[1])); cr.appendChild(lb); }); host.appendChild(cr);
      });
      var h3 = el('div'); card.appendChild(h3); var q3 = {}; for (var k3 in N2L.check.c3) q3[k3] = N2L.check.c3[k3]; q3.head = 'Check 3'; LE.ask(h3, q3);
      var h4 = el('div'); card.appendChild(h4);
      LE.ask(h4, { id: 'C.reflect', type: 'text', minWords: 15, rows: 4, head: 'What I got wrong at first', prompt: 'Look back at your three predictions. Which did you get wrong, and what changed your mind? If you got them all right, write what you would say to a friend who thinks a bigger force means a bigger speed.', label: 'What I got wrong at first' });
    },
    canLeave: function (c) { var S = c.S; return !!S.huddle.h2 && qdone('C1') && qdone('C2') && qdone('C3') && qdone('C.reflect') && !!(S.d.conf && S.d.conf.C1 && S.d.conf.C2); },
    teacher: function () { return '<p><b>Huddle 2 code: ' + LE.codeFor(ID, 'h2') + '</b>. Give it once most of the class is through Try it, then read the class: C1 is the diagram check (speeding up means the push beats friction), C2 is a two-change ratio (force ×3, mass ×2: a = 4.5 m/s²), C3 is a written explanation with a keyword rubric (' + N2L.teacherInfo.c3Note + '). The same questions for every student, so the distribution compares like with like.</p><p>Answers: C1 Diagram 1, C2 4.5 m/s², C3 a constant net force gives a constant acceleration, so the speed keeps changing.</p>'; } });

  function reportFields(S) {
    var T = (S.d.try && S.d.try.log) || [], P = S.d.pred || [], sec = ['start', 'warmup', 'predict', 'investigate', 'huddle', 'name', 'try', 'check', 'notes'].map(function (k) { return S.t[k] || 0; });
    var c1 = LE.qs('C1'), c2 = LE.qs('C2'), c3 = LE.qs('C3'), rub = (c3 && c3.rubric) || [];
    var conf = S.d.conf || {}, mlog = (S.d.more && S.d.more.log) || [];
    return ['v1', S.first, S.period, S.band0, T.map(function (x) { return x.band; }).join('-'), T.map(function (x) { return x.misses; }).join('-'), S.warm == null ? '' : S.warm,
      P.map(function (p) { return p && p.pick != null ? L[p.pick] : '-'; }).join(''), P.map(function (p) { return p && p.conf || 0; }).join('-'),
      (c1 && c1.ok && c1.misses === 0 ? 1 : 0) + '-' + (c2 && c2.ok && c2.misses === 0 ? 1 : 0) + '-' + rub.join('') + '-' + (conf.C1 || 0) + (conf.C2 || 0),
      sec.join('-'), T.map(function (x) { return x.secs; }).join('-'), LE.today(),
      LE.reached().idx + 1, S.ended ? 't' : 'f', mlog.length + '-' + mlog.filter(function (x) { return x.misses === 0; }).length];
  }
  N2L.reportFields = reportFields;
  /* One record for the review portal (shared/profile.js): every question the student worked, by skill. */
  N2L.profileRecord = function (S) {
    var all = ((S.d.try && S.d.try.log) || []).concat((S.d.more && S.d.more.log) || []), items = all.map(function (x) { return { skill: x.skill, title: x.title, band: x.band, firstTry: x.misses === 0, ok: !!x.ok }; });
    var P = S.d.pred || [];
    N2L.preds.forEach(function (pr, i) { var st = P[i]; if (st && st.pick != null) items.push({ skill: 'predict-' + (i + 1), band: S.band0 || 2, firstTry: st.pick === pr.correct, ok: st.pick === pr.correct }); });
    ['C1', 'C2'].forEach(function (k) { var q = LE.qs(k); if (q && q.done) items.push({ skill: 'check-' + k.toLowerCase(), band: 2, firstTry: q.ok && q.misses === 0, ok: !!q.ok }); });
    return { course: 'physics', lesson: ID, title: 'Newton’s Second Law', first: S.first, period: S.period, day: LE.today(), reached: LE.reached().idx + 1, of: LE.reached().of, items: items };
  };
  N2L.stamp = function (S) { return 'N2L-' + MrD.codes.stamp(ID, S.first, S.period); };

  /* Practice that never runs out. It shows on the last step until guided-notes time ends, so finishing early does not end the lesson.
     Each question is one of the six skills at the student's current hidden level, with fresh numbers. */
  function morePractice(host, c) {
    var S = c.S, M = S.d.more = S.d.more || { n: 0, log: [] };
    var n = M.n, sk = N2L.skills[n % N2L.skills.length], b = LE.band();
    var q = sk.gen(b, LE.seedRng('more:' + n + ':' + b)); q.id = 'more.' + n + '.' + b; q.head = 'Practice ' + (n + 1) + ' · ' + sk.title;
    var box = el('div'); host.appendChild(box);
    function nextBtn() {
      if (box.querySelector('.nextq')) return;
      var row = el('div', 'row nextq'), nb = el('button', 'btn primary', 'Next question'); nb.type = 'button'; row.appendChild(nb); box.appendChild(row);
      nb.onclick = function () {
        var st = LE.qs(q.id), m = st.misses, nbd = m === 0 ? b + 1 : (m === 1 ? b : b - 1);
        var ans = q.type === 'choice' ? optText(q.options[q.answer]) : (LE.fmtN(q.answer) + (q.unit ? ' ' + q.unit : ''));
        M.log.push({ skill: sk.id, title: sk.title, band: b, misses: m, ok: !!st.ok, secs: st.secs || 0, p: plain(q.prompt), a: ans, w: plain(q.worked) });
        LE.setBand(nbd, 'more'); M.n++; LE.save(); LE.render();
      };
    }
    q.onDone = nextBtn; LE.ask(box, q); if (qdone(q.id)) nextBtn();
  }

  steps.push({ id: 'notes', label: 'Notes',
    render: function (card, c) {
      var S = c.S; card.appendChild(el('h2', null, 'Notes and stamp'));
      var ex = el('div', 'prose');
      ex.innerHTML = '<p><b>My notes</b> is a study sheet the page writes from your own work today: your predictions, your data, your rule, your definitions and the problems you solved. It fills in as you go, so it is never blank. Print it or save it as a PDF to study from.</p>' +
        '<p><b>The stamp</b> is your proof for Mr. D that you did today’s lesson. It is a four-digit code built from your name, your period and today’s date, so nobody else’s stamp matches yours.</p>';
      card.appendChild(ex);
      var row = el('div', 'row'); var v = el('button', 'btn primary', 'View my notes'); v.type = 'button'; v.onclick = function () { LE.setViewNotes(true); LE.render(); window.scrollTo(0, 0); };
      var pr = el('button', 'btn', 'Print or save as PDF'); pr.type = 'button'; pr.onclick = function () { LE.print(); };
      var tx = el('button', 'btn', 'Download LaTeX (.tex)'); tx.type = 'button'; tx.onclick = function () { LE.downloadTex(); }; row.appendChild(v); row.appendChild(pr); row.appendChild(tx); card.appendChild(row);

      if (!LE.canEnd()) {
        card.appendChild(el('h3', null, 'Keep practicing'));
        card.appendChild(el('p', 'hint', 'You have done every step. Your stamp appears when time for guided notes ends. Until then the questions keep coming at your level, and each one goes into your notes.'));
        morePractice(card, c);
        return;
      }

      var rc = LE.reached();
      card.appendChild(el('h3', null, 'Show this to Mr. D'));
      var p = el('p'); var sp = el('span', 'stamp', N2L.stamp(S)); p.appendChild(sp); card.appendChild(p);
      card.appendChild(el('p', 'hint', 'Name: ' + S.first + ' · Period ' + S.period + ' · You got to step ' + (rc.idx + 1) + ' of ' + rc.of + ' (' + rc.label + ')' + (S.d.more && S.d.more.log.length ? ' · ' + S.d.more.log.length + ' practice questions' : '')));
      var code = LE.encodeReport(ID, reportFields(S));
      card.appendChild(el('h3', null, 'Report code (paste into Classroom if Mr. D asks)'));
      var lc = el('div', 'longcode', code); card.appendChild(lc);
      var cp = el('button', 'btn small', 'Copy report code'); cp.type = 'button'; cp.onclick = function () { try { navigator.clipboard.writeText(code); cp.textContent = 'Copied'; } catch (e) { var r = document.createRange(); r.selectNodeContents(lc); var s = window.getSelection(); s.removeAllRanges(); s.addRange(r); cp.textContent = 'Selected: press Ctrl+C'; } }; card.appendChild(el('div', 'row')).appendChild(cp);
      if (window.MrD && MrD.profile) MrD.profile.record(N2L.profileRecord(S));
    },
    canLeave: function () { return true; },
    teacher: function (c) { return '<p>The stamp is a 4-digit code from name + period + today’s date. Check it on the Teacher page (type the name and period). Stamp for this device: <b>' + N2L.stamp(c.S) + '</b>.</p><p><b>End rule.</b> Mon–Thu guided notes end at the 42-minute mark (9:42 for first-period physics); the red “End my guided notes” bar appears then. On Friday classes are 40 minutes, so there is no early end: the stamp is available at the bell. A student who finishes every step early lands here and keeps getting practice at their level until the end mark; the stamp appears at the end mark. After 3:00 PM (home) the stamp appears as soon as a student gets here. The stamp and report code record how far each student got.</p><p>The long report code carries each student’s starting band, band at each question, misses, predictions and confidence, check results, seconds per step, the step reached and practice counts; paste any number into the Teacher page to see them in a table.</p>'; } });

  /* ================= notes document ================= */
  function notesDoc(c) {
    var S = c.S, d = S.d, secs = [], b = d.nameBand || c.band, inv = d.inv || {};
    function txt(id) { var s = LE.qs(id); return s && s.text ? s.text : ''; }
    function para(text, emptyLines) { return text ? [{ type: 'box', text: text }] : (new Array(emptyLines || 2)).fill({ type: 'blank' }); }
    // 1 predictions
    var pb = [{ type: 'p', text: 'Question for today: what decides how quickly something speeds up?', em: true }], preds = d.pred || [];
    N2L.preds.forEach(function (P, i) { var st = preds[i]; if (st && st.locked) pb.push({ type: 'box', label: 'Prediction ' + (i + 1) + ' (' + P.title + '):', text: optText(P.options[st.pick]) + ' · ' + ['', 'Guess', 'Fairly sure', 'Certain'][st.conf] + ' · Because ' + st.why }); else pb.push({ type: 'blank' }); });
    secs.push({ title: 'What I thought at first', blocks: pb });
    // 2 data
    var db = [], PA = N2L.pA(), PB = N2L.pB(), PC = N2L.pC(d.nameBand || S.band0 || c.band), PD = N2L.pD();
    var ra = (inv.A && inv.A.runs) || {}, rowsA = PA.Fs.filter(function (F) { return ra[F.toFixed(1)]; }).map(function (F) { var r = ra[F.toFixed(1)]; return [F.toFixed(1), f2(r.v), f2(r.a), f2(F / r.a)]; });
    if (rowsA.length) { db.push({ type: 'p', text: 'Part A. Fan pushes a ' + PA.m + ' kg cart from rest on a smooth track for 4.0 s.' }, { type: 'table', head: ['Fan force F (N)', 'Speed after 4.0 s (m/s)', 'a (m/s²)', 'F ÷ a (kg)'], rows: rowsA }); if (txt('A.concl')) db.push({ type: 'box', label: 'My conclusion:', text: txt('A.concl') }); }
    var rb = (inv.B && inv.B.runs) || {}, rowsB = PB.ms.filter(function (m) { return rb[m.toFixed(1)]; }).map(function (m) { var r = rb[m.toFixed(1)]; return [m.toFixed(1), f2(r.a), f2(m * r.a)]; });
    if (rowsB.length) { db.push({ type: 'p', text: 'Part B. Fixed fan force of ' + PB.F + ' N; the cart mass changes.' }, { type: 'table', head: ['Cart mass m (kg)', 'a (m/s²)', 'm × a (N)'], rows: rowsB }); if (rowsB.length === PB.ms.length) db.push({ type: 'p', text: 'm × a is the same in every row, and it equals the fan force: a = F/m.', em: true }); if (txt('B.concl')) db.push({ type: 'box', label: 'My conclusion:', text: txt('B.concl') }); }
    var Cc = inv.C; if (Cc && Cc.ok) { db.push({ type: 'p', text: 'Part C. Rough track, μ = ' + PC.mu + ', m = ' + PC.m + ' kg. Target acceleration ' + PC.at.toFixed(2) + ' m/s². Fan force used: ' + Cc.F.toFixed(2) + ' N. Friction: ' + f2(PC.f) + ' N. Net force F − f = ' + f2(Cc.F - PC.f) + ' N, about m × a = ' + f2(PC.m * PC.at) + ' N.' }); if (txt('C.concl')) db.push({ type: 'box', label: 'My conclusion:', text: txt('C.concl') }); }
    var rd = (inv.D && inv.D.runs) || {}, rowsD = PD.mhs.filter(function (m) { return rd[m.toFixed(2)]; }).map(function (m) { var r = rd[m.toFixed(2)]; return [m.toFixed(2), f2(m * G), f2(PD.M + m), f2(r.a)]; });
    if (rowsD.length) { db.push({ type: 'p', text: 'Part D. Cart of mass ' + PD.M.toFixed(2) + ' kg pulled over a pulley by a hanging mass.' }, { type: 'table', head: ['Hanging mass (kg)', 'Pull of gravity (N)', 'Mass that moves (kg)', 'a (m/s²)'], rows: rowsD }); if (txt('D.concl')) db.push({ type: 'box', label: 'My conclusion:', text: txt('D.concl') }); }
    if (!db.length) db.push({ type: 'blank' }, { type: 'blank' });
    secs.push({ title: 'Data I collected', blocks: db });
    secs.push({ title: 'My rule', blocks: para(txt('rule'), 3) });
    secs.push({ title: 'Newton’s second law', blocks: qdone('name.cloze.' + b) ? [{ type: 'box', text: N2L.cloze[b].full }] : [{ type: 'blank' }, { type: 'blank' }] });
    var vrows = N2L.vocab.filter(function (v) { return v.bands.indexOf(b) >= 0; }).map(function (v) { return [v.term, txt('vocab.' + v.id), v.model]; });
    secs.push({ title: 'Vocabulary', blocks: [{ type: 'table', head: ['Term', 'In my words', 'Textbook'], rows: vrows }] });
    var scenes = N2L.fbdScenes.filter(function (s) { return d.fbd && d.fbd[s.id]; }), fbb = [];
    if (scenes.length) { fbb.push({ type: 'fbds', items: scenes.map(function (s) { return { forces: s.forces, title: s.title }; }) }); fbb.push({ type: 'list', items: scenes.map(function (s) { return s.title + ': ' + s.note; }) }); } else fbb.push({ type: 'blank' }, { type: 'blank' });
    secs.push({ title: 'Free-body diagrams and net force', blocks: fbb });
    secs.push({ title: 'The big misconception', blocks: qdone('name.misc') ? [{ type: 'box', text: N2L.misc.full }] : [{ type: 'blank' }] });
    var log = ((d.try && d.try.log) || []).concat((d.more && d.more.log) || []), pbk = [];
    if (!log.length) pbk.push({ type: 'blank' });
    log.forEach(function (x, i) { pbk.push({ type: 'p', text: (i + 1) + '. ' + x.title + ' (' + (x.misses === 0 ? 'solved on the first try' : (x.ok ? 'solved with a hint' : 'needed the explanation')) + ')' }, { type: 'p', text: x.p }, { type: 'box', label: 'Answer:', text: x.a + '. ' + x.w }); });
    secs.push({ title: 'Problems I worked', blocks: pbk });
    secs.push({ title: 'What I got wrong at first, and what changed', blocks: para(txt('C.reflect'), 3) });
    if (txt('C3')) secs.push({ title: 'My explanation: constant net force', blocks: [{ type: 'box', text: txt('C3') }] });
    return { title: 'Newton’s Second Law: My Notes', sections: secs };
  }

  var cfg = { id: ID, course: 'physics', version: 1, title: 'Newton’s Second Law', subtitle: 'Online lesson · questions adjust to you', steps: steps, notes: notesDoc,
    gates: [{ key: 'h1', label: 'Huddle 1' }, { key: 'h2', label: 'Huddle 2' }] };
  (window.LESSONS_REG = window.LESSONS_REG || {})[ID] = cfg;
})();
