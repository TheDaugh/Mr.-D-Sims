/* LK.assessment(A): a review day followed by a scored check, with a pass mark. Load after lesson-kit.js (and qkit.js for calculus), and after the
   specs of the lessons being reviewed. It reuses those specs' skill generators, so no new question bank exists to go out of date.
     A = { id, course:'calc', title, kind:'Quiz'|'Test', prefix:'U3Q', sources:['3-1-chain-rule', ...] (ids in window.SPECS, in order),
           count: 15 (scored items, a multiple of sources.length), pass: 0.85,
           next: { label, href } (shown only on a pass), dir: '' (folder of the source lesson pages, for the "redo this lesson" links) }
   Tabs: Start, Review (two worked-with-hints items per lesson, band 2 then band 3), Quiz/Test (scored, one try each, no hints, band 3),
   Result (score by lesson; on a pass the link to the next lesson; otherwise a retake with fresh questions). Progress saves per device.
   plan() and need() are pure and are what tests/unit/assessment.test.js checks. */
(function (root) {
  'use strict';
  var BAND = 3;
  /* the scored items for attempt `att`: lessons interleaved, and the skill rotates with the attempt so a retake is not the same questions */
  function plan(A, specs, att) {
    var per = A.count / specs.length, out = [], j, l;
    for (j = 0; j < per; j++) for (l = 0; l < specs.length; l++) {
      var sk = specs[l].skills[(j + att) % specs[l].skills.length];
      out.push({ lesson: l, sk: sk, id: 'q' + att + '.' + out.length, tag: 'as:' + A.id + ':' + att + ':' + l + ':' + j });
    }
    return out;
  }
  function need(count, pass) { return Math.ceil(count * pass - 1e-9); }
  function reviewPlan(specs) {
    var out = [];
    specs.forEach(function (sp, l) { [0, 1].forEach(function (j) { out.push({ lesson: l, sk: sp.skills[j % sp.skills.length], band: j ? 3 : 2, id: 'rv.' + l + '.' + j, tag: 'rv:' + sp.id + ':' + j }); }); });
    return out;
  }
  if (typeof window === 'undefined') { root.exports = { plan: plan, need: need, reviewPlan: reviewPlan }; return; }

  var LE = window.LE, el = LE.el;
  window.LK.assessment = function (A) {
    var specs = A.sources.map(function (id) { return window.SPECS[id]; }), PASS = A.pass || 0.85, N = A.count, NEED = need(N, PASS), KIND = A.kind || 'Quiz', pct = function (x) { return Math.round(100 * x) + '%'; };
    var K = LK.for({ id: A.id, course: A.course, prefix: A.prefix || 'ASM', identity: 'id', title: A.title, lib: { skills: [], preds: [] } }), qdone = LK.qdone;
    var MATH = !!window.QKIT;
    function build(p, band, quiz) {
      var q = p.sk.gen(band, LE.seedRng(p.tag)); q.id = p.id; q.type = q.type || 'num'; q.math = MATH; q.head = p.sk.title; q.keypad = true;
      if (quiz) { q.noHints = true; q.maxMiss = 1; delete q.remember; }
      return q;
    }
    function att(S) { return S.d.att || 0; }
    function allDone(ids) { return ids.every(qdone); }
    function ids(list) { return list.map(function (p) { return p.id; }); }
    function score(S) {
      var P = plan(A, specs, att(S)), by = specs.map(function () { return { ok: 0, of: 0 }; }), got = 0;
      P.forEach(function (p) { var s = LE.qs(p.id), ok = !!(s && s.done && s.ok && s.misses === 0); by[p.lesson].of++; if (ok) { by[p.lesson].ok++; got++; } });
      return { P: P, by: by, got: got };
    }
    var steps = [];
    steps.push(K.startStep({ title: A.title, question: 'Review what you know, then show it. You need ' + pct(PASS) + ' to go on to the next lesson.',
      targets: specs.map(function (sp) { return sp.title; }),
      tabs: ['Review: two problems from each lesson, with hints', KIND + ': ' + N + ' problems, one try each, no hints', 'Result: your score, and what to do next'] }));

    steps.push({ id: 'review', label: 'Review',
      render: function (card) {
        K.head(card, 'Review', 'I can remember how each rule works.', 'Up next: the ' + KIND.toLowerCase() + '.');
        card.appendChild(el('p', 'hint', 'Read each reminder, then do its two problems. Hints are on here. Nothing on this tab counts toward your score.'));
        var R = reviewPlan(specs);
        specs.forEach(function (sp, l) {
          card.appendChild(el('h3', null, sp.title));
          var ul = el('ul'); (sp.concepts || []).forEach(function (c) { ul.appendChild(el('li', null, c.title + (c.eq ? ': ' + c.eq : ''))); }); card.appendChild(ul);
          R.filter(function (p) { return p.lesson === l; }).forEach(function (p) { LE.ask(card, build(p, p.band, false)); });
        });
      },
      canLeave: function () { return allDone(ids(reviewPlan(specs))); },
      teacher: function () { return '<p>Two problems per lesson with the usual hint ladder, then the scored part. The reminders are each lesson’s own concept lines.</p>'; } });

    steps.push({ id: 'quiz', label: KIND,
      render: function (card, c) {
        var S = c.S, a = att(S);
        K.head(card, KIND + (a ? ' (try ' + (a + 1) + ')' : ''), 'I can do it without help.', 'Up next: your result.');
        card.appendChild(el('p', 'hint', N + ' problems, one try each, no hints. You need ' + NEED + ' right (' + pct(PASS) + '). Wrong answers show the reasoning after you answer. Your result comes next.'));
        plan(A, specs, a).forEach(function (p) { LE.ask(card, build(p, BAND, true)); });
      },
      canLeave: function (c) { return allDone(ids(plan(A, specs, att(c.S)))); },
      teacher: function () { return '<p>' + N + ' problems at band ' + BAND + ' (the regular standard), lessons mixed, one try each. Pass mark ' + NEED + ' of ' + N + '. A retake draws different skills and numbers.</p>'; } });

    steps.push({ id: 'result', label: 'Result',
      render: function (card, c) {
        var S = c.S, sc = score(S), a = att(S), done = allDone(ids(sc.P)), pass = sc.got >= NEED;
        card.appendChild(el('h2', null, 'Result'));
        if (!done) { card.appendChild(el('p', 'qtext', 'Finish the ' + KIND.toLowerCase() + ' first.')); return; }
        var big = el('p', 'qtext'); big.appendChild(el('b', null, sc.got + ' of ' + N + ' (' + pct(sc.got / N) + ')')); big.appendChild(document.createTextNode(pass ? ' · Passed. You are ready for the next lesson.' : ' · Not yet. You need ' + NEED + ' of ' + N + ' (' + pct(PASS) + ').')); card.appendChild(big);
        var tb = el('table', 'qtab'), tr = el('tr'); ['Lesson', 'Right'].forEach(function (h) { tr.appendChild(el('th', null, h)); }); tb.appendChild(tr);
        specs.forEach(function (sp, l) { var r = el('tr'); r.appendChild(el('td', null, sp.title)); r.appendChild(el('td', null, sc.by[l].ok + ' of ' + sc.by[l].of)); tb.appendChild(r); }); card.appendChild(tb);
        S.d.hist = S.d.hist || []; if (!S.d.hist.some(function (h) { return h.att === a; })) {
          S.d.hist.push({ att: a, got: sc.got, of: N, pass: pass });
          if (window.MrD && MrD.profile) MrD.profile.record({ course: A.course, lesson: A.id, title: A.title, first: S.first, period: S.period, day: LE.today(), reached: 4, of: 4,
            items: sc.P.map(function (p) { var s = LE.qs(p.id); return { skill: specs[p.lesson].id + '.' + p.sk.id, title: p.sk.title, band: BAND, firstTry: !!(s && s.ok && s.misses === 0), ok: !!(s && s.ok) }; }) });
          LE.save();
        }
        if (pass) {
          card.appendChild(el('h3', null, 'Next'));
          var go = el('a', 'btn primary', A.next.label); go.href = A.next.href; card.appendChild(el('p')).appendChild(go);
          card.appendChild(el('p', 'hint', 'Your score is saved on this device. Show Mr. D this page if he asks.'));
        } else {
          var weak = specs.filter(function (sp, l) { return sc.by[l].ok < sc.by[l].of; });
          card.appendChild(el('h3', null, 'What to do'));
          card.appendChild(el('p', null, 'Redo the lesson' + (weak.length > 1 ? 's' : '') + ' where you missed problems, then take the ' + KIND.toLowerCase() + ' again with new questions.'));
          var ul = el('ul'); weak.forEach(function (sp) { var li = el('li'), l = el('a', null, sp.title); l.href = (A.dir || '') + sp.id + '.html'; li.appendChild(l); ul.appendChild(li); }); card.appendChild(ul);
          var re = el('button', 'btn primary', 'Retake with new questions'); re.type = 'button';
          re.onclick = function () { S.d.att = a + 1; LE.save(); LE.forceGoto('quiz'); }; card.appendChild(el('p')).appendChild(re);
        }
      },
      canLeave: function () { return true; },
      teacher: function (c) { return '<p>Pass mark ' + NEED + ' of ' + N + ' (' + pct(PASS) + '), first try only. The next-lesson link appears only on a pass; a retake gives new questions. Scores are saved on this device (<code>MrD.profile.record</code>).</p>'; } });

    var cfg = { id: A.id, course: A.course, version: 1, title: A.title, subtitle: 'Online ' + KIND.toLowerCase() + ' · go at your own pace', identity: 'id', keypad: true, lock: true, selfPaced: true, maxBand: 3,
      steps: steps, concepts: null, conceptTabs: null, gates: [],
      notes: function (c) { var s = c.S.d.hist || []; return { title: A.title, sections: [{ title: 'My results', blocks: [{ type: 'list', items: s.length ? s.map(function (h) { return 'Try ' + (h.att + 1) + ': ' + h.got + ' of ' + h.of + (h.pass ? ' (passed)' : ''); }) : ['Your results appear here.'] }] }] }; } };
    (window.LESSONS_REG = window.LESSONS_REG || {})[A.id] = cfg;
    return cfg;
  };
})(typeof window !== 'undefined' ? window : module);
