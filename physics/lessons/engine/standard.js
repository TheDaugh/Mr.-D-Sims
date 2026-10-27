/* LK.standard(SPEC, opts): the whole standard lesson built from one spec. Load after lesson-kit.js (and qkit.js for calculus).
     SPEC   the neutral spec (templates/<course>/spec.js): targets, concepts, huddle, predicts, skills, pacing, misconceptions
     opts   { prefix: 'TPL',                         stamp prefix (3 letters)
              explore: function (card, c, K) {...}   draws this lesson's picture or sim into the Explore tab }
   It returns and registers the lesson config; the page then calls LE.start(window.LESSONS_REG[SPEC.id]).
   Tabs (standard names, in order): Start, Warm-up, Predict, Explore, Huddle, Build, Practice, Check, Wrap-up.
   Behaviours it wires: student IDs, placement warm-up, no-hint-ladder predictions, timed writable huddle, pace trimming, endless practice,
   notes that fill in, concepts button, keypad, stamp and report code. To change behaviour for one lesson, copy this file's step and edit it. */
(function () {
  'use strict';
  var LE = window.LE, el = LE.el;

  LK.standard = function (SPEC, opts) {
  opts = opts || {};
  var ID = SPEC.id, MATH = !!window.QKIT && (SPEC.course === 'calc' || SPEC.math), opt = function (o) { return MATH ? QKIT.inline(o) : o; };
  var K = LK.for({ id: ID, course: SPEC.course, prefix: opts.prefix || 'TPL', identity: 'id', title: SPEC.title, lib: { skills: SPEC.skills.map(function (sk) { return { id: sk.id, title: sk.title, gen: function (b, r) { var q = sk.gen(b, r); q.type = q.type || 'num'; q.math = MATH; q.keypad = true; return q; } }; }), preds: SPEC.predicts } }), qdone = LK.qdone;
  var T = K.TABS, steps = [];

  function skillQ(sk, band, tag, n) { var q = sk.gen(band, LE.seedRng(tag + ':' + n + ':' + band)); q.id = tag + '.' + n; q.type = q.type || 'num'; q.math = MATH; q.head = sk.title; q.keypad = true; return q; }

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
    try { var rec = MrD.profile.all().filter(function (r) { return r.first === S.first && r.course === SPEC.course; }).pop(); if (!rec) return 0;
      return rec.items.reduce(function (m, x) { return x.ok && x.firstTry ? Math.max(m, x.band || 0) : m; }, 0); } catch (e) { return 0; }
  }

  /* Predict: one try each, no hint ladder (the ladder stops here on purpose). */
  steps.push({ id: 'predict', label: T.predict,
    render: function (card, c) {
      K.head(card, T.predict, 'I can predict before I test.', 'Up next: you explore and check your predictions.');
      SPEC.predicts.forEach(function (p) {
        var q = { id: p.id, type: 'choice', math: MATH, head: p.title, prompt: p.prompt, options: p.options.map(opt), answer: p.answer, maxMiss: 1, worked: opt(p.why) };
        LE.ask(card, q);
      });
    },
    canLeave: function () { return SPEC.predicts.every(function (p) { return qdone(p.id); }); },
    teacher: function () { return '<p>Correct: ' + SPEC.predicts.map(function (p) { return p.id + ' = ' + p.options[p.answer]; }).join('; ') + '. One try each; the answer is explained after.</p>'; } });

  /* Explore: the lesson's own picture or sim (opts.explore). Optional and lowest priority: pacing skips it first. */
  steps.push({ id: 'explore', label: T.explore, optional: true,
    render: function (card, c) {
      K.head(card, T.explore, SPEC.exploreTarget || SPEC.targets[0], 'Up next: Mr. D huddles with the class.');
      if (opts.explore) opts.explore(card, c, K);
      (SPEC.observe || []).forEach(function (o) { LE.ask(card, { id: o.id, type: 'choice', math: MATH, head: 'What did you see?', prompt: o.prompt, options: o.options.map(opt), answer: o.answer, maxMiss: 1 }); });
    },
    canLeave: function () { return true; },
    teacher: function () { return '<p>Optional and lowest priority. The pace plan skips it first when the class is behind.' + (SPEC.exploreTeacher ? ' ' + SPEC.exploreTeacher : '') + '</p>'; } });

  /* Huddle: timed by the clock (spec.pacing.huddles), written on by the student, never blocks. */
  steps.push(K.huddleStep({ target: SPEC.huddleTarget || SPEC.targets[0], spec: SPEC.huddle, gateKey: 'h1',
    teacher: function () { return '<p>Pulled in at minute ' + SPEC.pacing.huddles[0].atMin + ' by the clock. Walk the definitions, work the example on the board, then label the figure. Students fill the blanks as you write them. The answers are in the make-up key PDF.</p>'; } }));

  /* Build: the rule in the student's own words, as short items. LE.items() shrinks the count when the class runs behind. */
  steps.push({ id: 'build', label: T.build,
    render: function (card, c) {
      K.head(card, T.build, SPEC.buildTarget || 'I can use a = F / m on a new problem.', 'Up next: endless practice at your level.');   /* buildTarget is optional; the old default is kept so existing lessons do not change */
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

  var cfg = { id: ID, course: SPEC.course, version: 1, title: SPEC.title, subtitle: 'Online lesson', identity: 'id', keypad: true, lock: true,
    steps: steps, notes: notesDoc, concepts: SPEC.concepts, conceptTabs: (SPEC.course === 'stats' && window.NK) ? NK.conceptTabs() : null, pacing: SPEC.pacing, gates: (SPEC.pacing.huddles || []).map(function (h) { return { key: h.key, label: 'Huddle' }; }) };
  (window.LESSONS_REG = window.LESSONS_REG || {})[ID] = cfg;
  return cfg;
  };
})();
