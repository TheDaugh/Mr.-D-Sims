/* TEMPLATE LESSON (physics). The tabs are built from spec.js; this file is only the wiring. Read it top to bottom once, then edit spec.js.
   Standard tabs, in this order: Start, Warm-up, Predict, Explore, Huddle, Build, Practice, Check, Wrap-up.
   Every tab: a one-line Target and a one-line "Up next". No paragraph longer than a sentence. */
(function () {
  'use strict';
  var LE = window.LE, el = LE.el, SPEC = window.SPECS['tpl-physics'], ID = SPEC.id;
  var K = LK.for({ id: ID, prefix: 'TPL', identity: 'id', title: SPEC.title, lib: { skills: SPEC.skills.map(function (sk) { return { id: sk.id, title: sk.title, gen: function (b, r) { var q = sk.gen(b, r); q.type = 'num'; q.keypad = true; return q; } }; }), preds: SPEC.predicts } }), qdone = LK.qdone;
  var T = K.TABS, steps = [];

  function skillQ(sk, band, tag, n) { var q = sk.gen(band, LE.seedRng(tag + ':' + n + ':' + band)); q.id = tag + '.' + n; q.type = 'num'; q.head = sk.title; q.keypad = true; return q; }

  /* Start: ID card, targets, the day's tabs. */
  steps.push(K.startStep({ title: SPEC.title, question: SPEC.question, targets: SPEC.targets, tabs: SPEC.tabs }));

  /* Warm-up doubles as placement: start at band 1, climb on first-try rights, stop at two misses (MrD.place). */
  steps.push({ id: 'warmup', label: T.warmup,
    render: function (card, c) {
      var S = c.S; K.head(card, T.warmup, 'I can show what I already know.', 'Up next: you make three predictions.');
      var P = S.d.place || (S.d.place = MrD.place.start({ maxBand: 4, seedBand: seedBand(S) }));
      if (P.done) { card.appendChild(el('p', 'msg ok', 'Warm-up saved. Let’s go.')); return; }
      var sk = SPEC.skills[P.asked % SPEC.skills.length], q = skillQ(sk, P.band, 'w', P.asked);
      q.maxMiss = 1; q.head = 'Warm-up ' + (P.asked + 1);
      q.onDone = function () {
        var st = LE.qs(q.id), ok = !!(st && st.ok && st.misses === 0);
        S.d.place = MrD.place.next(P, ok);
        if (S.d.place.done) { S.band0 = S.d.place.placed; S.band = S.band0; S.warm = S.d.place.log.filter(function (x) { return x.ok; }).length; S.bandLog.push('start:' + S.band0); }
        LE.save(); setTimeout(LE.render, 700);
      };
      LE.ask(card, q);
    },
    canLeave: function (c) { return !!(c.S.d.place && c.S.d.place.done); },
    teacher: function () { return '<p>Placement is silent. It starts at band 1, moves up on a first-try right, and stops at two misses (at most 8 items). The student is placed at the highest band cleared. Last lesson’s band seeds the start one band lower.</p>'; } });

  function seedBand(S) {
    try { var rec = MrD.profile.all().filter(function (r) { return r.first === S.first && r.course === 'physics'; }).pop(); if (!rec) return 0;
      return rec.items.reduce(function (m, x) { return x.ok && x.firstTry ? Math.max(m, x.band || 0) : m; }, 0); } catch (e) { return 0; }
  }

  /* Predict: one try each, no hint ladder (the ladder stops here on purpose). */
  steps.push({ id: 'predict', label: T.predict,
    render: function (card, c) {
      K.head(card, T.predict, 'I can predict before I test.', 'Up next: you play with a cart and check your predictions.');
      SPEC.predicts.forEach(function (p) {
        var q = { id: p.id, type: 'choice', head: p.title, prompt: p.prompt, options: p.options, answer: p.answer, maxMiss: 1, worked: p.why };
        LE.ask(card, q);
      });
    },
    canLeave: function () { return SPEC.predicts.every(function (p) { return qdone(p.id); }); },
    teacher: function () { return '<p>Correct: ' + SPEC.predicts.map(function (p) { return p.id + ' = ' + p.options[p.answer]; }).join('; ') + '. One try each; the answer is explained after.</p>'; } });

  /* Explore: a small honest sim. Optional and lowest priority: pacing skips it first. */
  steps.push({ id: 'explore', label: T.explore, optional: true,
    render: function (card, c) {
      K.head(card, T.explore, 'I can see how force and mass change acceleration.', 'Up next: Mr. D huddles with the class.');
      var box = el('div', 'sim'); card.appendChild(box);
      box.innerHTML = '<svg id="tpl-sim" viewBox="0 0 520 140" role="img" aria-label="Cart on a track" style="width:100%;max-width:640px;background:var(--stage);border:1px solid var(--line);border-radius:8px"><line x1="10" y1="112" x2="510" y2="112" stroke="#7a8a99" stroke-width="2"/><g id="tpl-cart"><rect x="20" y="62" width="70" height="38" rx="6" fill="#dbe6ff" stroke="#2b4fd9" stroke-width="2"/><circle cx="36" cy="106" r="7" fill="#142230"/><circle cx="74" cy="106" r="7" fill="#142230"/><line x1="90" y1="80" x2="120" y2="80" stroke="#1c7d4a" stroke-width="4" id="tpl-arrow"/></g></svg>';
      var row = el('div', 'row'); card.appendChild(row);
      function slider(label, min, max, val) { var l = el('label', null, label + ' '); var i = el('input'); i.type = 'range'; i.min = min; i.max = max; i.value = val; var o = el('b', null, String(val)); i.oninput = function () { o.textContent = i.value; upd(); }; l.appendChild(i); l.appendChild(o); row.appendChild(l); return i; }
      var F = slider('Force (N)', 1, 10, 4), M = slider('Mass (kg)', 1, 5, 2);
      var go = el('button', 'btn primary', 'Push'); go.type = 'button'; row.appendChild(go);
      var out = el('p', 'qtext'); card.appendChild(out);
      function upd() { var a = F.value / M.value; out.textContent = 'a = ' + F.value + ' / ' + M.value + ' = ' + LE.fmt(a, 2) + ' m/s²'; var ar = box.querySelector('#tpl-arrow'); ar.setAttribute('x2', 90 + 8 * F.value); }
      var raf = 0;
      go.onclick = function () {
        cancelAnimationFrame(raf); var cart = box.querySelector('#tpl-cart'), a = F.value / M.value, t0 = performance.now();
        (function step(now) { var t = (now - t0) / 1000, x = Math.min(380, 0.5 * a * 18 * t * t); cart.setAttribute('transform', 'translate(' + x + ',0)'); if (x < 380 && t < 4) raf = requestAnimationFrame(step); })(t0);
      };
      upd();
      SPEC.observe.forEach(function (o) { LE.ask(card, { id: o.id, type: 'choice', head: 'What did you see?', prompt: o.prompt, options: o.options, answer: o.answer, maxMiss: 1 }); });
    },
    canLeave: function () { return true; },
    teacher: function () { return '<p>Optional and lowest priority. The pace plan skips it first when the class is behind.</p>'; } });

  /* Huddle: timed by the clock (spec.pacing.huddles), written on by the student, never blocks. */
  steps.push(K.huddleStep({ target: 'I can define net force and use a = F / m.', spec: SPEC.huddle, gateKey: 'h1',
    teacher: function () { return '<p>Pulled in at minute ' + SPEC.pacing.huddles[0].atMin + ' by the clock. Walk the definitions, work the example on the board, then name the two arrows. Students fill the blanks as you write them. The answers are in the make-up key PDF.</p>'; } }));

  /* Build: the rule in the student's own words, as short items. LE.items() shrinks the count when the class runs behind. */
  steps.push({ id: 'build', label: T.build,
    render: function (card, c) {
      K.head(card, T.build, 'I can use a = F / m on a new problem.', 'Up next: endless practice at your level.');
      var n = LE.items('build', 4), b = LE.band();
      for (var i = 0; i < n; i++) LE.ask(card, skillQ(SPEC.skills[i % SPEC.skills.length], b, 'b', i));
    },
    canLeave: function () { var n = LE.items('build', 4); for (var i = 0; i < n; i++) if (!qdone('b.' + i)) return false; return true; },
    teacher: function () { return '<p>Four problems at the student’s band; two when the class is behind. Hints appear one at a time and stop early: practice is where the ladder is full.</p>'; } });

  /* Practice: never runs out; each answer lands in the notes. */
  steps.push({ id: 'practice', label: T.practice,
    render: function (card, c) {
      K.head(card, T.practice, 'I can solve problems at my level.', 'Up next: a two-question check.');
      K.morePractice(card, c);
    },
    canLeave: function (c) { return (c.S.d.more && c.S.d.more.n || 0) >= LE.items('practice', 4); },
    teacher: function () { return '<p>Practice is endless. Everyone does at least four; the level moves up or down with each answer.</p>'; } });

  steps.push({ id: 'check', label: T.check,
    render: function (card, c) {
      K.head(card, T.check, 'I can do it without help.', 'Up next: your notes and stamp.');
      var b = LE.band(); ['C1', 'C2'].forEach(function (id, i) { var q = skillQ(SPEC.skills[i], b, 'chk', i); q.id = id; q.maxMiss = 2; LE.ask(card, q); });
    },
    canLeave: function () { return qdone('C1') && qdone('C2'); },
    teacher: function () { return '<p>Two questions at the student’s level, two tries each.</p>'; } });

  function reportFields(S) {
    var mlog = (S.d.more && S.d.more.log) || [], c1 = LE.qs('C1'), c2 = LE.qs('C2');
    return ['v1', S.first, S.period, S.band0, S.band, S.warm == null ? '' : S.warm,
      (c1 && c1.ok && c1.misses === 0 ? 1 : 0) + '-' + (c2 && c2.ok && c2.misses === 0 ? 1 : 0), LE.today(), LE.reached().idx + 1, S.ended ? 't' : 'f',
      mlog.length + '-' + mlog.filter(function (x) { return x.misses === 0; }).length, Object.keys(S.skip || {}).join('+')];
  }
  steps.push(K.notesStep({ reportFields: reportFields, teacher: function (c) { return '<p>Stamp for this device: <b>' + K.stamp(c.S) + '</b>. The report code lists the ID, the placement band, the check result, and any tabs the pace plan skipped.</p>'; } }));

  /* Notes fill in as the student works: their predictions, their huddle blanks, the problems they solved. */
  function notesDoc(c) {
    var S = c.S, secs = [], pl = MrD.huddle.plain(SPEC.huddle, false);
    secs.push({ title: 'My targets', blocks: [{ type: 'list', items: SPEC.targets }] });
    secs.push({ title: 'My predictions', blocks: SPEC.predicts.map(function (p) { var s = LE.qs(p.id); return { type: 'box', label: p.title + ':', text: s && s.pick != null ? LK.plain(p.options[s.pick]) + (s.ok ? ' (right)' : ' (answer: ' + LK.plain(p.options[p.answer]) + ')') : '' }; }) });
    var hud = S.d.hud || {}, hb = [], i = 0;
    pl.defs.concat(pl.example, pl.tags).forEach(function (line) { hb.push({ type: 'p', text: line }); });
    var filled = Object.keys(hud).filter(function (k) { return hud[k]; }).map(function (k) { return hud[k]; });
    if (filled.length) hb.push({ type: 'box', label: 'My filled-in blanks:', text: filled.join(' · ') });
    secs.push({ title: 'Huddle notes', blocks: hb });
    var log = ((S.d.more && S.d.more.log) || []).map(function (x) { return { type: 'box', label: x.title + ':', text: x.p + ' → ' + x.a + '. ' + x.w }; });
    secs.push({ title: 'Problems I solved', blocks: log.length ? log : [{ type: 'p', text: 'Your solved problems appear here.' }] });
    var sk = Object.keys(S.skip || {}); if (sk.length) secs.push({ title: 'Do at home', blocks: [{ type: 'list', items: sk.map(function (k) { return 'Finish the ' + k + ' tab.'; }) }] });
    return { title: SPEC.title, sections: secs };
  }

  (window.LESSONS_REG = window.LESSONS_REG || {})[ID] = { id: ID, course: 'physics', version: 1, title: SPEC.title, subtitle: 'Online lesson', identity: 'id', keypad: true,
    steps: steps, notes: notesDoc, concepts: SPEC.concepts, pacing: SPEC.pacing, gates: [{ key: 'h1', label: 'Huddle' }] };
})();
