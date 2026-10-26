/* REVIEW 3.1 to 3.3 (mixed review). Same engine as every standard lesson (LK.for), but its own steps: Start, Warm-up (six items), Practice (interleaved), Wrap-up.
   The teaching lives in the spec. This file wires the steps: placement, per-target bands, interleaving, fading hints, the wrap-up sentence, notes and the report code. */
(function () {
  'use strict';
  var LE = window.LE, el = LE.el, SPEC = window.SPECS['unit-3-review-1-3'], ID = SPEC.id, TARGET = {};
  SPEC.skills.forEach(function (sk, i) { TARGET[sk.id] = { sk: sk, text: SPEC.targets[i] }; });
  var K = LK.for({ id: ID, course: 'stats', prefix: 'RV3', identity: 'id', title: SPEC.title, lib: { skills: SPEC.skills, preds: [] } }), T = K.TABS, qdone = LK.qdone, steps = [];
  var LABEL = { picture: '' };

  /* one question for a target at a band: picture first, hints faded to the band */
  function build(tid, band, tag) {
    var sk = TARGET[tid].sk, q = sk.gen(band, LE.seedRng(tag + ':' + band));
    q.id = tag + '.' + band; q.type = q.type || 'num'; q.keypad = true; q.math = false; q.head = sk.title;
    return SPEC.fade(q, band);
  }
  function rv() { var S = LE.S(); return S.d.rv || (S.d.rv = { tb: {}, queue: [], last: '', round: 0 }); }
  function tband(tid) { var S = LE.S(), R = rv(); return R.tb[tid] || S.band0 || 1; }

  steps.push(K.startStep({ title: SPEC.title, question: SPEC.question, targets: SPEC.targets, tabs: SPEC.tabs }));

  /* Warm-up: six items, three from block A (3.1, 3.2) and three from block B (3.3). The band climbs on a first-try right and stays after a miss.
     The placed band is the highest one cleared. Always six items, so every target in the warm-up gets a fair look. */
  steps.push({ id: 'warmup', label: T.warmup,
    render: function (card, c) {
      var S = c.S; K.head(card, T.warmup, 'I can show what I already know from 3.1 to 3.3.', 'Up next: mixed practice on all nine targets.');
      var P = S.d.place || (S.d.place = { band: 1, asked: 0, cleared: 0, done: false, log: [] });
      S.d.try = S.d.try || { log: [] };
      if (P.done) { card.appendChild(el('p', 'msg ok', 'Warm-up saved. Six items done. Let’s go.')); return; }
      var tid = SPEC.warm[P.asked], q = build(tid, P.band, 'w' + P.asked);
      q.head = 'Warm-up ' + (P.asked + 1) + ' of ' + SPEC.warm.length + ' · ' + TARGET[tid].sk.title; q.maxMiss = 1;
      q.onDone = function () {
        var st = LE.qs(q.id), ok = !!(st && st.ok && st.misses === 0);
        S.d.try.log.push({ skill: tid, title: TARGET[tid].sk.title, band: P.band, misses: st.misses, ok: !!st.ok });
        P.log.push({ band: P.band, ok: ok, t: tid }); P.asked++;
        if (ok) { P.cleared = Math.max(P.cleared, P.band); P.band = Math.min(4, P.band + 1); }
        if (P.asked >= SPEC.warm.length) { P.done = true; S.band0 = Math.max(1, P.cleared); S.band = S.band0; S.warm = P.log.filter(function (x) { return x.ok; }).length; S.bandLog.push('start:' + S.band0); }
        LE.save(); setTimeout(LE.render, 700);
      };
      LE.ask(card, q);
    },
    canLeave: function (c) { return !!(c.S.d.place && c.S.d.place.done); },
    teacher: function () { return '<p>Six items: three from block A (T1, T2, T4) and three from block B (T7, T8, T9). The level starts at 1, climbs on a first-try right, and stays after a miss. The student is placed at the highest level cleared. One try each; the reasoning shows after.</p>'; } });

  /* Practice: interleaved. A shuffled bag of all nine targets (never the same target twice in a row); a missed target comes back within a few items.
     Each target keeps its own level: first-try right moves it up, one miss holds it, two misses move it down. The hint fades as the level climbs. */
  function nextTarget() {
    var R = rv(), ids = SPEC.skills.map(function (s) { return s.id; });
    if (R.queue.length < 2) {
      var bag = ids.slice(), rng = LE.seedRng('bag:' + R.round++), i, j, t;
      for (i = bag.length - 1; i > 0; i--) { j = Math.floor(rng() * (i + 1)); t = bag[i]; bag[i] = bag[j]; bag[j] = t; }
      if (R.queue.length === 0 && bag[0] === R.last) { t = bag[0]; bag[0] = bag[1]; bag[1] = t; }
      R.queue = R.queue.concat(bag);
    }
    return R.queue.shift();
  }
  function practice(host, c) {
    var S = c.S, M = S.d.more = S.d.more || { n: 0, log: [] }, R = rv(), n = M.n;
    if (!R.cur || R.cur.n !== n) { R.cur = { n: n, tid: nextTarget() }; LE.save(); }
    var tid = R.cur.tid, b = tband(tid), q = build(tid, b, 'p' + n), box = el('div'); host.appendChild(box);
    q.head = 'Practice ' + (n + 1) + ' · ' + TARGET[tid].sk.title;
    function nextBtn() {
      if (box.querySelector('.nextq')) return;
      var row = el('div', 'row nextq'), nb = el('button', 'btn primary', 'Next question'); nb.type = 'button'; row.appendChild(nb); box.appendChild(row);
      nb.onclick = function () {
        var st = LE.qs(q.id), m = st.misses, nbd = m === 0 ? b + 1 : (m === 1 ? b : b - 1); nbd = Math.max(1, Math.min(4, nbd));
        M.log.push({ skill: tid, title: TARGET[tid].sk.title, band: b, misses: m, ok: !!st.ok, secs: st.secs || 0, p: LK.plain(q.prompt), a: LK.answerText(q), w: LK.plain(q.worked) });
        R.tb[tid] = nbd; R.last = tid;
        if (m >= 1) R.queue.splice(Math.min(3, R.queue.length), 0, tid);   // a missed target comes back soon
        var all = Object.keys(R.tb).map(function (k) { return R.tb[k]; }); if (all.length) LE.setBand(Math.round(all.reduce(function (a, x) { return a + x; }, 0) / all.length), 'review');
        M.n++; R.cur = null; LE.save(); LE.render();
      };
    }
    q.onDone = nextBtn; LE.ask(box, q); if (qdone(q.id)) nextBtn();
  }
  steps.push({ id: 'practice', label: T.practice,
    render: function (card, c) { K.head(card, T.practice, 'I can mix all nine ideas and still get them right.', 'Up next: one sentence about what still feels shaky.'); practice(card, c); },
    canLeave: function (c) { return (c.S.d.more && c.S.d.more.n || 0) >= LE.items('practice', 12); },
    teacher: function () { return '<p>Interleaved: the nine targets are shuffled, never the same twice in a row, and a missed target returns within a few items. Each target keeps its own level. The picture comes first. Hints fade as the level climbs: a Remember line at level 1, the full hint after a miss at level 2, a nudge then the hint at level 3, and the hint only after the second miss at level 4. At least 12 items (8 when the class runs behind); practice then continues in the Wrap-up until the end mark.</p>'; } });

  /* Wrap-up: one sentence, then the standard stamp, notes and report code (practice keeps going until the end mark). */
  var SHAKY = [['percentile', /percentile/i], ['z-score', /\bz\b|z-?score/i], ['curve area', /area|curve|density/i]];
  function shakyWord(S) { var st = LE.qs('wrap'); if (!st || !st.text) return ''; for (var i = 0; i < SHAKY.length; i++) if (SHAKY[i][1].test(st.text)) return SHAKY[i][0].replace(' ', '_'); return 'other'; }
  /* skills by target ID: "T1:2/3" is two first-try rights out of three items (warm-up and practice together) */
  function skillsField(S) {
    var all = ((S.d.try && S.d.try.log) || []).concat((S.d.more && S.d.more.log) || []), by = {};
    all.forEach(function (x) { var o = by[x.skill] || (by[x.skill] = { a: 0, r: 0 }); o.a++; if (x.misses === 0 && x.ok) o.r++; });
    return SPEC.skills.map(function (s) { return by[s.id] ? s.id + ':' + by[s.id].r + '/' + by[s.id].a : ''; }).filter(Boolean).join(',');
  }
  function reportFields(S) {
    var mlog = (S.d.more && S.d.more.log) || [];
    return ['v1', S.first, S.period, S.band0, S.band, S.warm == null ? '' : S.warm, '', LE.today(), LE.reached().idx + 1, S.ended ? 't' : 'f',
      mlog.length + '-' + mlog.filter(function (x) { return x.misses === 0; }).length, Object.keys(S.skip || {}).join('+'), skillsField(S), shakyWord(S)];
  }
  var wrap = K.notesStep({ reportFields: reportFields, teacher: function (c) { return '<p>Stamp for this device: <b>' + K.stamp(c.S) + '</b>. The report code lists the ID, the placement band, the practice count, any tabs the pace plan skipped, the skills by target ID (T1:2/3 means two first-try rights out of three), and which idea the student named as shaky.</p>'; } });
  var baseRender = wrap.render;
  wrap.render = function (card, c) {
    K.head(card, T.notes, 'I can name the idea I should review next.', 'Up next: your notes and stamp.');
    LE.ask(card, { id: 'wrap', type: 'text', head: 'One sentence', prompt: 'Which idea still feels shaky: percentile, z-score or curve area? Write one sentence.', rows: 2, minWords: 4,
      worked: 'Thanks. That sentence goes into your notes.' });
    baseRender(card, c);
  };
  wrap.label = T.notes; steps.push(wrap);

  /* Notes fill in as the student works: targets, the problems solved by target, the shaky sentence, the concept sheet. */
  function notesDoc(c) {
    var S = c.S, secs = [], log = ((S.d.try && S.d.try.log) || []).map(function (x) { return { skill: x.skill, line: x.ok && x.misses === 0 ? 'right the first time' : 'review' }; }), more = (S.d.more && S.d.more.log) || [];
    secs.push({ title: 'My targets', blocks: [{ type: 'list', items: SPEC.targets }] });
    var ws = LE.qs('wrap'); secs.push({ title: 'The idea I want to review', blocks: [{ type: 'box', label: 'My sentence:', text: ws && ws.text ? ws.text : '' }] });
    var sum = SPEC.skills.map(function (s) { var xs = more.filter(function (x) { return x.skill === s.id; }), r = xs.filter(function (x) { return x.misses === 0; }).length; return s.title + ': ' + (xs.length ? r + ' of ' + xs.length + ' right the first time' : 'not practiced yet'); });
    secs.push({ title: 'How I did, by target', blocks: [{ type: 'list', items: sum }] });
    secs.push({ title: 'Problems I solved', blocks: more.length ? more.map(function (x) { return { type: 'box', label: x.title + ':', text: x.p + ' → ' + x.a + '. ' + x.w }; }) : [{ type: 'p', text: 'Your solved problems appear here.' }] });
    secs.push({ title: 'Concept sheet', blocks: SPEC.concepts.map(function (k) { return { type: 'p', text: k.title + ': ' + k.points.join(' ') + ' ' + k.eq }; }) });
    var sk = Object.keys(S.skip || {}); if (sk.length) secs.push({ title: 'Do at home', blocks: [{ type: 'list', items: sk.map(function (k) { return 'Finish the ' + k + ' tab.'; }) }] });
    return { title: SPEC.title, sections: secs };
  }

  var cfg = { id: ID, course: 'stats', version: 1, title: SPEC.title, subtitle: 'Mixed review', identity: 'id', keypad: true, steps: steps, notes: notesDoc, concepts: SPEC.concepts, pacing: SPEC.pacing, gates: [] };
  (window.LESSONS_REG = window.LESSONS_REG || {})[ID] = cfg;
})();
