/* Newton's First Law: Day 1 online lesson. Registers itself with the engine; the page calls LE.start(cfg). */
(function () {
  'use strict';
  var LE = window.LE, NFL = window.NFL, el = LE.el, ID = 'newtons-first-law', G = 9.8;
  var L = 'ABCDEFG';
  function plain(h) { var d = document.createElement('div'); d.innerHTML = String(h == null ? '' : h); return d.textContent.replace(/\s+/g, ' ').trim(); }
  function optText(o) { return typeof o === 'string' ? plain(o) : plain((o.label || o.html || '') + (o.desc ? ' (' + o.desc + ')' : '')); }
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
      var S = c.S; card.appendChild(el('h2', null, 'Newton’s First Law'));
      var p = el('div', 'prose'); p.innerHTML = '<p>Today’s question is one that fooled people for two thousand years: <b>does an object need a force to keep moving?</b> You will predict, test it in a simulator, state the rule yourself, and then work problems that adjust to how you are doing. Your own notes build as you go, and you can print them at the end.</p><p>The questions adapt. Some people will see harder problems than others, and everyone ends on the same final check. If something feels easy or hard, that is the lesson doing its job. There is always another question waiting at your level, so keep going until Mr. D calls time.</p>';
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
      var list = NFL.warm.map(function (q) { return { id: q.id, type: 'choice', prompt: q.prompt, options: q.options, answer: q.answer, maxMiss: 1, head: 'Warm-up ' + q.id.slice(1) }; });
      function fin() {
        if (!NFL.allDone(list) || S.band0) return;
        var ok = list.filter(function (q) { var s = LE.qs(q.id); return s && s.ok && s.misses === 0; }).length;
        S.warm = ok; S.band0 = NFL.bandFromWarm(ok); S.band = S.band0; S.bandLog.push('start:' + S.band0); LE.save();
        var m = el('p', 'msg ok', 'Warm-up saved. Let’s go.'); host.appendChild(m); LE.gate();
      }
      NFL.asks(host, list, fin);
      if (S.band0) host.appendChild(el('p', 'msg ok', 'Warm-up saved. Let’s go.'));
    },
    canLeave: function (c) { return !!c.S.band0 || NFL.warm.every(function (q) { return qdone(q.id); }); },
    teacher: function (c) { return '<p>Placement is silent. Correct on the first try: 0–1 → band 1, 2–3 → band 2, 4 → band 3, 5 → band 4. Band 1 = foundation, 2 = core, 3 = honors, 4 = advanced (AP/college). The band then moves up or down by performance in Try it. Use <b>Preview band</b> in the red bar to see any band. Answers: W1 0 N, W2 force, W3 10 N east, W4 10 N, W5 40 m and 0 m/s². About 3 minutes.</p><p>This student’s band right now: <b>' + c.band + '</b>.</p>'; } });

  steps.push({ id: 'predict', label: 'Predict',
    render: function (card, c) {
      var S = c.S; S.d.pred = S.d.pred || []; card.appendChild(el('h2', null, '2 · Predict'));
      card.appendChild(el('p', null, 'Commit to an answer before you test anything. For each one choose an answer, say how sure you are, and give a reason of at least six words. Nothing is graded here. Wrong predictions are the most useful thing you will write today.'));
      NFL.preds.forEach(function (P, i) {
        var st = S.d.pred[i] || (S.d.pred[i] = { pick: null, conf: null, why: '', locked: false });
        var box = el('div', 'q'); card.appendChild(box); box.appendChild(el('p', 'qhead', 'Prediction ' + (i + 1) + ' of 3 · ' + P.title)); var qt = el('p', 'qtext'); qt.innerHTML = P.prompt; box.appendChild(qt);
        var list = el('div', 'opts' + (P.grid ? ' grid' : '')); box.appendChild(list);
        var order = LE.shuffle(P.options.map(function (_, k) { return k; }), LE.seedRng('pred:' + i));
        if (P.grid) order = P.options.map(function (_, k) { return k; });
        order.forEach(function (k, pos) {
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
    teacher: function () { return '<p>Correct: P1 first option (only a force changes velocity), P2 Graph 1 (flat line), P3 none. Gold outline marks them here. Notice who is <b>Certain and wrong</b>; they are the best voices at Huddle 1. The confidence scores and reasons go into the student’s report code. About 5 minutes.</p>'; } });

  steps.push({ id: 'investigate', label: 'Investigate',
    render: function (card, c) { NFL.investigate(card, c); },
    canLeave: function (c) { var I = c.S.d.inv; return !!(I && I.A.done && I.B.done && I.C.done && I.D.done); },
    teacher: function (c) {
      var P = NFL.cParams(), A = NFL.vA(), D = NFL.dParams(c.band);
      return '<p><b>Four parts, each with a job; tasks depend on band.</b> About 15 minutes.</p><ul><li><b>A, six surfaces.</b> Student v₀ = ' + A.toFixed(1) + ' m/s. d = v₀²/(2μg). Band 1 ranks and completes sentences; 2 computes speed lost per second (= μg); 3 computes a = v₀²/2d and m·a; 4 finds μd = v₀²/2g, predicts d at μ = 0.001, tests it.</li><li><b>B, mass.</b> Distance does not depend on mass (a = μg). Surprise for most students. Friction on 1.00 kg at μ = 0.15 is 1.47 N.</li><li><b>C, cruising.</b> This student: μ = ' + P.mu + ', m = ' + P.m + ' kg, cruise push F = μmg = <b>' + (P.mu * P.m * G).toFixed(2) + ' N</b>. On ideal ice F = 0. Bands 3–4 must predict F first.</li><li><b>D, balance.</b> This student’s new force: <b>' + D.sol.F.toFixed(2) + ' N' + (c.band >= 3 ? ' at ' + D.sol.ang.toFixed(1) + '°' : ' to the left') + '</b>.</li></ul><p>The red <b>Key</b> buttons in each part fill the answers so you can move through quickly.</p>'; } });

  steps.push({ id: 'huddle', label: 'Huddle',
    render: function (card, c) {
      var S = c.S; S.d.pred = S.d.pred || []; card.appendChild(el('h2', null, '4 · Huddle'));
      codeBox(card, c, 'h1', 'Class code');
      if (!S.huddle.h1) return;
      card.appendChild(el('h3', null, 'Your predictions against the evidence'));
      var t = el('table', 'data'); t.innerHTML = '<thead><tr><th>Prediction</th><th>You chose</th><th>Sure?</th><th>The evidence says</th><th></th></tr></thead>'; var tb = el('tbody');
      NFL.preds.forEach(function (P, i) { var st = S.d.pred[i] || { pick: null, conf: 0 }, tr = el('tr'); var ok = st.pick === P.correct; tr.innerHTML = '<td>' + P.title + '</td><td>' + (st.pick == null ? '(no prediction yet)' : optText(P.options[st.pick])) + '</td><td>' + ['', 'Guess', 'Fairly sure', 'Certain'][st.conf || 0] + '</td><td>' + optText(P.options[P.correct]) + '</td><td class="' + (ok ? 'ok' : '') + '">' + (ok ? '✓' : '✗') + '</td>'; tb.appendChild(tr); });
      t.appendChild(tb); var sc = el('div', 'scroll'); sc.appendChild(t); card.appendChild(sc);
      card.appendChild(el('h3', null, 'State the rule'));
      var host = el('div'); card.appendChild(host);
      LE.ask(host, { id: 'rule', type: 'text', minWords: 14, rows: 4, prompt: 'Using what you saw in Parts A to D, write the rule in your own words. When does the velocity of an object change, and when does it not?', label: 'My rule' });
    },
    canLeave: function (c) { return !!c.S.huddle.h1 && qdone('rule'); },
    teacher: function () {
      return '<p><b>Huddle 1 code: ' + LE.codeFor(ID, 'h1') + '</b> (changes daily). Give it at about minute 20. About 4 minutes.</p><ul><li>Fingers up: 1 = Prediction 1 option A as shown, and so on. Or ask for a show of hands on “stops by itself.”</li><li>Ask the Certain-and-wrong students, kindly, what they saw in Part A.</li><li>Ask: Part C found F = friction. What does that say about the net force on a cruising puck?</li><li>Let the class state the rule before you do. Their own wording goes into their notes.</li></ul>'; } });

  steps.push({ id: 'name', label: 'Name it',
    render: function (card, c) {
      var S = c.S, d = S.d; if (!d.nameBand) { d.nameBand = c.band; LE.save(); } var b = d.nameBand;
      card.appendChild(el('h2', null, '5 · Name it'));
      card.appendChild(el('p', null, 'You found the rule by experiment. Now it gets its formal name. Read the explanation, then build your notes.'));
      var reg = d.reg || NFL.regForBand(b); var regs = el('div', 'regs'); regs.appendChild(el('span', 'hint', 'Explain it in: '));
      ['simple', 'standard', 'college'].forEach(function (k) { var bt = el('button', 'btn small', NFL.regName[k]); bt.type = 'button'; bt.setAttribute('aria-pressed', String(k === reg)); bt.onclick = function () { d.reg = k; (d.regSwitch = d.regSwitch || []).push(k); LE.save(); LE.render(); }; regs.appendChild(bt); }); card.appendChild(regs);
      var ex = el('div', 'prose'); NFL.explain[reg].forEach(function (t) { var p = el('p'); p.innerHTML = t; ex.appendChild(p); }); card.appendChild(ex);
      card.appendChild(el('h3', null, 'The law, in your hands'));
      var hc = el('div'); card.appendChild(hc); var cz = NFL.cloze[b];
      LE.ask(hc, { id: 'name.cloze.' + b, type: 'cloze', text: cz.text, blanks: cz.blanks, bank: cz.bank, hint: 'Reread the explanation above.' });
      card.appendChild(el('h3', null, 'Draw the forces (free-body diagrams)'));
      card.appendChild(el('p', 'hint', 'For each situation, check every force that is really acting on the puck.'));
      var fb = el('div', 'fbdbox'); card.appendChild(fb); d.fbd = d.fbd || {};
      NFL.fbdScenes.forEach(function (sc) {
        var cell = el('div', 'cell'); fb.appendChild(cell); cell.appendChild(el('p', 'qtext', sc.title));
        if (d.fbd[sc.id]) { var dv = el('div'); dv.innerHTML = LE.fbdSVG({ forces: sc.forces, title: sc.title }); cell.appendChild(dv); cell.appendChild(el('p', 'msg ok', sc.note)); return; }
        var ch = el('div', 'checks'); var inputs = {};
        NFL.fbdForces.forEach(function (f) { var lb = el('label'); var cb = document.createElement('input'); cb.type = 'checkbox'; inputs[f.k] = cb; lb.appendChild(cb); lb.appendChild(document.createTextNode(f.t)); if (c.key && sc.need.indexOf(f.k) >= 0) lb.style.outline = '2px solid #b7791f'; ch.appendChild(lb); });
        cell.appendChild(ch); var bt = el('button', 'btn small', 'Check'); bt.type = 'button'; cell.appendChild(bt); var m = el('p', 'msg'); cell.appendChild(m);
        bt.onclick = function () {
          var got = Object.keys(inputs).filter(function (k) { return inputs[k].checked; }), need = sc.need;
          var extra = got.filter(function (k) { return need.indexOf(k) < 0; }), miss = need.filter(function (k) { return got.indexOf(k) < 0; });
          if (!extra.length && !miss.length) { d.fbd[sc.id] = true; LE.save(); LE.render(); return; }
          d.fbdMiss = (d.fbdMiss || 0) + 1; LE.save(); m.className = 'msg bad';
          if (extra.indexOf('M') >= 0) m.textContent = 'No object is pushing the puck forward. A “force of motion” is not a force. Ask: what is touching or pulling it?';
          else if (extra.length) m.textContent = 'One of the forces you checked is not acting. Ask what object exerts each one.';
          else m.textContent = 'You are missing a force. Think: what pulls it down, what holds it up, what opposes sliding, and what pushes?';
        };
      });
      card.appendChild(el('h3', null, 'Vocabulary in your own words'));
      card.appendChild(el('p', 'hint', 'Write each definition yourself (at least six words). Then you will see the textbook version to compare.'));
      var vh = el('div'); card.appendChild(vh);
      NFL.vocab.filter(function (v) { return v.bands.indexOf(b) >= 0; }).forEach(function (v) { LE.ask(vh, { id: 'vocab.' + v.id, type: 'text', minWords: 6, rows: 2, head: v.term, prompt: b === 1 && v.starter ? v.starter : 'Define: ' + v.term, label: v.term, worked: '<b>Textbook:</b> ' + v.model }); });
      card.appendChild(el('h3', null, 'The big misconception'));
      var mh = el('div'); card.appendChild(mh); LE.ask(mh, { id: 'name.misc', type: 'cloze', text: NFL.misc.text, blanks: NFL.misc.blanks, hint: 'Think about Parts A to D.' });
    },
    canLeave: function (c) {
      var d = c.S.d, b = d.nameBand || c.band;
      return qdone('name.cloze.' + b) && NFL.fbdScenes.every(function (s) { return d.fbd && d.fbd[s.id]; }) && NFL.vocab.filter(function (v) { return v.bands.indexOf(b) >= 0; }).every(function (v) { return qdone('vocab.' + v.id); }) && qdone('name.misc');
    },
    teacher: function () { return '<p>Three registers of the same explanation (plain / standard / college); students can switch, and the engine logs which they used. The sentence-completion item differs by band (word bank at band 1, vector form and “inertial frame” at band 4). The FBD checker targets the “force of motion” misconception. The student’s own definitions, then the textbook version, go into their notes. About 8 minutes.</p>'; } });

  steps.push({ id: 'try', label: 'Try it',
    render: function (card, c) {
      var S = c.S, T = S.d.try = S.d.try || { i: 0, log: [], bands: {} }; card.appendChild(el('h2', null, '6 · Try it'));
      card.appendChild(el('p', 'hint', 'Six questions, one on each idea. The questions adjust to how you are doing. A hint appears after a miss, and a full explanation appears when you finish each one.'));
      var host = el('div'); card.appendChild(host);
      if (T.i >= NFL.skills.length) { host.appendChild(el('p', 'msg ok', 'All six done. Continue to the final check.')); return; }
      var sk = NFL.skills[T.i], b = T.bands[T.i] || (T.bands[T.i] = LE.band()); LE.save();
      var q = sk.gen(b, LE.seedRng('try:' + sk.id + ':' + b)); q.id = 'try.' + sk.id + '.' + b; q.head = 'Question ' + (T.i + 1) + ' of ' + NFL.skills.length + ' · ' + sk.title;
      function nextBtn() {
        if (host.querySelector('.nextq')) return; var row = el('div', 'row nextq'); var nb = el('button', 'btn primary', T.i + 1 < NFL.skills.length ? 'Next question' : 'Finish'); nb.type = 'button'; row.appendChild(nb); host.appendChild(row);
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
    canLeave: function (c) { var T = c.S.d.try; return !!T && T.i >= NFL.skills.length; },
    teacher: function (c) {
      var T = c.S.d.try, rows = NFL.skills.map(function (s) { return '<li><b>' + s.title + '</b>: ' + NFL.skillTeacher[s.id] + '</li>'; }).join('');
      return '<p><b>Hidden ladder.</b> First try right → next question one band up (cap 4). One miss → same band. Two misses or a reveal → one band down. Students are never shown a band. The explanation appears after every question, so a drop always arrives with a worked answer. About 8 minutes.</p><ul>' + rows + '</ul><p>Band path so far for this device: ' + (c.S.bandLog.join(' → ') || '—') + '.</p>'; } });

  steps.push({ id: 'check', label: 'Check',
    render: function (card, c) {
      var S = c.S; card.appendChild(el('h2', null, '7 · Check')); S.d.conf = S.d.conf || {};
      if (!S.huddle.h2) { card.appendChild(el('p', null, 'Huddle 2. Mr. D will give you the second code when the class is ready.')); codeBox(card, c, 'h2', 'Second class code'); return; }
      card.appendChild(el('p', 'hint', 'The same three questions for everyone. You get one try on each of the first two. Tell us how sure you were; honest answers help the most.'));
      [['C1', NFL.check.c1], ['C2', NFL.check.c2]].forEach(function (pair) {
        var host = el('div'); card.appendChild(host); var q = {}; for (var k in pair[1]) q[k] = pair[1][k]; q.head = 'Check ' + pair[0].slice(1);
        q.onDone = function () { LE.gate(); }; LE.ask(host, q);
        var cr = el('div', 'row'); cr.appendChild(el('span', null, 'How sure were you?'));
        [['1', 'Guess'], ['2', 'Fairly sure'], ['3', 'Certain']].forEach(function (cc) { var lb = el('label'); var rd = document.createElement('input'); rd.type = 'radio'; rd.name = 'cf' + pair[0]; rd.checked = String(S.d.conf[pair[0]]) === cc[0]; rd.onchange = function () { S.d.conf[pair[0]] = +cc[0]; LE.save(); LE.gate(); }; lb.appendChild(rd); lb.appendChild(document.createTextNode(' ' + cc[1])); cr.appendChild(lb); }); host.appendChild(cr);
      });
      var h3 = el('div'); card.appendChild(h3); var q3 = {}; for (var k3 in NFL.check.c3) q3[k3] = NFL.check.c3[k3]; q3.head = 'Check 3'; LE.ask(h3, q3);
      var h4 = el('div'); card.appendChild(h4);
      LE.ask(h4, { id: 'C.reflect', type: 'text', minWords: 15, rows: 4, head: 'What I got wrong at first', prompt: 'Look back at your three predictions. Which did you get wrong, and what changed your mind? If you got them all right, write what you would say to a friend who thinks a moving puck needs a continuing push.', label: 'What I got wrong at first' });
    },
    canLeave: function (c) { var S = c.S; return !!S.huddle.h2 && qdone('C1') && qdone('C2') && qdone('C3') && qdone('C.reflect') && !!(S.d.conf && S.d.conf.C1 && S.d.conf.C2); },
    teacher: function () { return '<p><b>Huddle 2 code: ' + LE.codeFor(ID, 'h2') + '</b>. Give it at about minute 40, then read the class: C1 is the diagram check, C2 is the statement check, C3 is a written explanation with a keyword rubric (names friction, names net/unbalanced force, says it does not contradict the law). The same questions for every student, so the distribution compares like with like. About 5 minutes.</p><p>Answers: C1 Diagram 1, C2 the first statement, C3 friction is an unbalanced external force; the first law is not violated.</p>'; } });

  function reportFields(S) {
    var T = (S.d.try && S.d.try.log) || [], P = S.d.pred || [], sec = ['start', 'warmup', 'predict', 'investigate', 'huddle', 'name', 'try', 'check', 'notes'].map(function (k) { return S.t[k] || 0; });
    var c1 = LE.qs('C1'), c2 = LE.qs('C2'), c3 = LE.qs('C3'), rub = (c3 && c3.rubric) || [];
    var conf = S.d.conf || {};
    return ['v2', S.first, S.period, S.band0, T.map(function (x) { return x.band; }).join('-'), T.map(function (x) { return x.misses; }).join('-'), S.warm == null ? '' : S.warm,
      P.map(function (p) { return p && p.pick != null ? L[p.pick] : '-'; }).join(''), P.map(function (p) { return p && p.conf || 0; }).join('-'),
      (c1 && c1.ok && c1.misses === 0 ? 1 : 0) + '-' + (c2 && c2.ok && c2.misses === 0 ? 1 : 0) + '-' + rub.join('') + '-' + (conf.C1 || 0) + (conf.C2 || 0),
      sec.join('-'), T.map(function (x) { return x.secs; }).join('-'), LE.today(),
      LE.reached().idx + 1, S.ended ? 't' : 'f', (S.d.more && S.d.more.log ? S.d.more.log.length : 0) + '-' + (S.d.more && S.d.more.log ? S.d.more.log.filter(function (x) { return x.misses === 0; }).length : 0)];
  }
  NFL.reportFields = reportFields;
  /* One record for the review portal (shared/profile.js): every question the student worked, by skill. */
  NFL.profileRecord = function (S) {
    var all = ((S.d.try && S.d.try.log) || []).concat((S.d.more && S.d.more.log) || []), items = all.map(function (x) { return { skill: x.skill, title: x.title, band: x.band, firstTry: x.misses === 0, ok: !!x.ok }; });
    var P = S.d.pred || [];
    NFL.preds.forEach(function (pr, i) { var st = P[i]; if (st && st.pick != null) items.push({ skill: 'predict-' + (i + 1), band: S.band0 || 2, firstTry: st.pick === pr.correct, ok: st.pick === pr.correct }); });
    ['C1', 'C2'].forEach(function (k) { var q = LE.qs(k); if (q && q.done) items.push({ skill: 'check-' + k.toLowerCase(), band: 2, firstTry: q.ok && q.misses === 0, ok: !!q.ok }); });
    return { course: 'physics', lesson: ID, title: 'Newton’s First Law', first: S.first, period: S.period, day: LE.today(), reached: LE.reached().idx + 1, of: LE.reached().of, items: items };
  };
  NFL.stamp = function (S) { return 'NFL-' + MrD.codes.stamp(ID, S.first, S.period); };

  /* Practice that never runs out. It shows on the last step until guided-notes time ends, so finishing early does not end the lesson.
     Each question is one of the six skills at the student's current hidden level, with fresh numbers. */
  function morePractice(host, c) {
    var S = c.S, M = S.d.more = S.d.more || { n: 0, log: [] };
    var n = M.n, sk = NFL.skills[n % NFL.skills.length], b = LE.band();
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
      var p = el('p'); var sp = el('span', 'stamp', NFL.stamp(S)); p.appendChild(sp); card.appendChild(p);
      card.appendChild(el('p', 'hint', 'Name: ' + S.first + ' · Period ' + S.period + ' · You got to step ' + (rc.idx + 1) + ' of ' + rc.of + ' (' + rc.label + ')' + (S.d.more && S.d.more.log.length ? ' · ' + S.d.more.log.length + ' practice questions' : '')));
      var code = LE.encodeReport(ID, reportFields(S));
      card.appendChild(el('h3', null, 'Report code (paste into Classroom if Mr. D asks)'));
      var lc = el('div', 'longcode', code); card.appendChild(lc);
      var cp = el('button', 'btn small', 'Copy report code'); cp.type = 'button'; cp.onclick = function () { try { navigator.clipboard.writeText(code); cp.textContent = 'Copied'; } catch (e) { var r = document.createRange(); r.selectNodeContents(lc); var s = window.getSelection(); s.removeAllRanges(); s.addRange(r); cp.textContent = 'Selected: press Ctrl+C'; } }; card.appendChild(el('div', 'row')).appendChild(cp);
      if (window.MrD && MrD.profile) MrD.profile.record(NFL.profileRecord(S));
    },
    canLeave: function () { return true; },
    teacher: function (c) { return '<p>The stamp is a 4-digit code from name + period + today’s date. Check it on the Teacher page (type the name and period). Stamp for this device: <b>' + NFL.stamp(c.S) + '</b>.</p><p><b>End rule.</b> Mon–Thu guided notes end at the 42-minute mark (9:42 for first-period physics); the red “End my guided notes” bar appears then. On Friday classes are 40 minutes, so there is no early end: the stamp is available at the bell. A student who finishes every step early lands here and keeps getting practice at their level until the end mark; the stamp appears at the end mark. After 3:00 PM (home) the stamp appears as soon as a student gets here. The stamp and report code record how far each student got.</p><p>The long report code carries each student’s starting band, band at each question, misses, predictions and confidence, check results, seconds per step, the step reached and practice counts; paste any number into the Teacher page to see them in a table.</p>'; } });

  /* ================= notes document ================= */
  function notesDoc(c) {
    var S = c.S, d = S.d, secs = [], b = d.nameBand || c.band, A = (d.inv && d.inv.A.runs) || {}, v0 = NFL.vA(), SURF = window.IceSim.SURF;
    function txt(id) { var s = LE.qs(id); return s && s.text ? s.text : ''; }
    function para(text, emptyLines) { return text ? [{ type: 'box', text: text }] : (new Array(emptyLines || 2)).fill({ type: 'blank' }); }
    // 1 predictions
    var pb = [{ type: 'p', text: 'Question for today: does an object need a force to keep moving at constant velocity?', em: true }], preds = d.pred || [];
    NFL.preds.forEach(function (P, i) { var st = preds[i]; if (st && st.locked) pb.push({ type: 'box', label: 'Prediction ' + (i + 1) + ' (' + P.title + '):', text: optText(P.options[st.pick]) + ' · ' + ['', 'Guess', 'Fairly sure', 'Certain'][st.conf] + ' · Because ' + st.why }); else pb.push({ type: 'blank' }); });
    secs.push({ title: 'What I thought at first', blocks: pb });
    // 2 data
    var rowsA = SURF.map(function (s) { var r = A[s.id]; return [s.name, String(s.mu), r ? (r.d == null ? 'never stops' : r.d.toFixed(2)) : '', r ? (r.t == null ? 'never stops' : r.t.toFixed(2)) : '', r && r.d ? (v0 * v0 / (2 * r.d)).toFixed(2) : (r ? '0' : '')]; });
    var db = [{ type: 'p', text: 'Part A. Puck launched at ' + v0.toFixed(1) + ' m/s, mass 0.50 kg.' }, { type: 'table', head: ['Surface', '\u03bc', 'Stopping distance d (m)', 'Time to stop t (s)', 'Deceleration a = v\u2080\u00b2/2d (m/s\u00b2)'], rows: rowsA }];
    if (txt('A.concl')) db.push({ type: 'box', label: 'My conclusion:', text: txt('A.concl') });
    var B = (d.inv && d.inv.B.runs) || {};
    if (B['0.25'] && B['1.00']) db.push({ type: 'table', head: ['Part B. Mass (kg), waxed floor', 'Stopping distance (m)'], rows: [['0.25', B['0.25'].d.toFixed(2)], ['1.00', B['1.00'].d.toFixed(2)]] }, { type: 'p', text: 'Mass did not change the stopping distance, because friction and inertia both scale with mass.', em: true });
    var Cc = d.inv && d.inv.C; if (Cc && Cc.cruise != null) { var cp = NFL.cParams(); db.push({ type: 'p', text: 'Part C. Rough floor, \u03bc = ' + cp.mu + ', m = ' + cp.m + ' kg. Push that kept it cruising: F = ' + Cc.cruise.toFixed(2) + ' N, equal to the friction force ' + (cp.mu * cp.m * G).toFixed(2) + ' N. On ideal ice: F = 0 N.' }); if (txt('C.words')) db.push({ type: 'box', label: 'My conclusion:', text: txt('C.words') }); }
    if (d.inv && d.inv.D.done) { var DP = NFL.dParams(d.nameBand || S.band0 || c.band); db.push({ type: 'p', text: 'Part D. Balanced forces on a puck moving at 2.0 m/s: given ' + DP.givens.map(function (g) { return g.F + ' N at ' + g.ang + ' degrees'; }).join(' and ') + '; the extra force that balanced them was ' + DP.sol.F.toFixed(2) + ' N at ' + DP.sol.ang.toFixed(0) + ' degrees. Result: straight-line motion at constant speed.' }); }
    secs.push({ title: 'Data I collected', blocks: db });
    secs.push({ title: 'My rule', blocks: para(txt('rule'), 3) });
    secs.push({ title: 'Newton’s first law', blocks: qdone('name.cloze.' + b) ? [{ type: 'box', text: NFL.cloze[b].full }] : [{ type: 'blank' }, { type: 'blank' }] });
    var vrows = NFL.vocab.filter(function (v) { return v.bands.indexOf(b) >= 0; }).map(function (v) { return [v.term, txt('vocab.' + v.id), v.model]; });
    secs.push({ title: 'Vocabulary', blocks: [{ type: 'table', head: ['Term', 'In my words', 'Textbook'], rows: vrows }] });
    var fb = NFL.fbdScenes.filter(function (s) { return d.fbd && d.fbd[s.id]; }).map(function (s) { return { forces: s.forces, title: s.title }; });
    secs.push({ title: 'Free-body diagrams', blocks: fb.length ? [{ type: 'fbds', items: fb }] : [{ type: 'blank' }, { type: 'blank' }] });
    secs.push({ title: 'The big misconception', blocks: qdone('name.misc') ? [{ type: 'box', text: NFL.misc.full }] : [{ type: 'blank' }] });
    var log = ((d.try && d.try.log) || []).concat((d.more && d.more.log) || []), pbk = [];
    if (!log.length) pbk.push({ type: 'blank' });
    log.forEach(function (x, i) { pbk.push({ type: 'p', text: (i + 1) + '. ' + x.title + ' (' + (x.misses === 0 ? 'solved on the first try' : (x.ok ? 'solved with a hint' : 'needed the explanation')) + ')' }, { type: 'p', text: x.p }, { type: 'box', label: 'Answer:', text: x.a + '. ' + x.w }); });
    secs.push({ title: 'Problems I worked', blocks: pbk });
    secs.push({ title: 'What I got wrong at first, and what changed', blocks: para(txt('C.reflect'), 3) });
    if (txt('C3')) secs.push({ title: 'My explanation: the sliding book', blocks: [{ type: 'box', text: txt('C3') }] });
    return { title: 'Newton’s First Law: My Notes', sections: secs };
  }

  var cfg = { id: ID, course: 'physics', version: 3, title: 'Newton’s First Law', subtitle: 'Online lesson · questions adjust to you', steps: steps, notes: notesDoc,
    gates: [{ key: 'h1', label: 'Huddle 1' }, { key: 'h2', label: 'Huddle 2' }] };
  (window.LESSONS_REG = window.LESSONS_REG || {})[ID] = cfg;
})();
