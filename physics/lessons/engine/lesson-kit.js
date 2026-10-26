/* Lesson kit: the pieces every guided physics lesson repeats, so a new lesson only writes its own content.
   Load after engine/lesson.js. A lesson calls  var K = LK.for({ id, prefix, title, lib })  where
     id      the lesson id (same string used for codes and the report checksum)
     prefix  stamp prefix, e.g. 'N2L'
     title   shown in the notes step and the portal record
     lib     the content namespace, with .skills [{id,title,gen}] and .preds [{correct}]
   cfg.identity === 'id' switches the Start tab and the stamp line to the student ID (no names).
   K gives: codeBox, morePractice, notesStep, stamp, profileRecord, plus the plain helpers (plain, optText, qdone, f2).
   The lesson still supplies reportFields(S) (field positions are fixed by portal/adapters.js: see docs/LESSON-STANDARD.md). */
(function () {
  'use strict';
  var LE = window.LE, el = LE.el, LK = window.LK = {};
  /* $TeX$ in a prompt becomes readable plain text for notes and reports: \dfrac{a}{b} -> (a)/(b), x^{2} -> x^2, \sqrt{x} -> sqrt(x). */
  function plainMath(t) {
    return t.replace(/\$([^$]+)\$/g, function (_, m) {
      var r = m.replace(/\\[dt]?frac\{([^{}]*)\}\{([^{}]*)\}/g, '($1)/($2)').replace(/\\sqrt\{([^{}]*)\}/g, 'sqrt($1)').replace(/\^\{([^{}]*)\}/g, '^$1')
        .replace(/\\(cdot|times)/g, '*').replace(/\\(Delta)/g, 'Δ').replace(/\\(to)/g, '->').replace(/\\[,;! ]/g, ' ').replace(/\\(left|right|big|Big)/g, '').replace(/[{}]/g, '');
      return r.replace(/\s+/g, ' ').trim();
    });
  }
  function plain(h) { var d = document.createElement('div'); d.innerHTML = String(h == null ? '' : h); var t = d.textContent.replace(/\s+/g, ' ').trim(); return t.indexOf('$') >= 0 ? plainMath(t) : t; }
  function optText(o) { return typeof o === 'string' ? plain(o) : plain((o.label || o.html || '') + (o.desc ? ' (' + o.desc + ')' : '')); }
  function f2(x) { return Number(x).toFixed(2); }
  function qdone(id) { var s = LE.qs(id); return !!(s && s.done); }
  LK.plain = plain; LK.optText = optText; LK.f2 = f2; LK.qdone = qdone;

  /* the standard report-field helpers, shared so every lesson orders them the same way */
  LK.answerText = function (q) { return q.type === 'choice' ? optText(q.options[q.answer]) : (LE.fmtN(q.answer) + (q.unit ? ' ' + q.unit : '')); };

  LK.for = function (cfg) {
    var ID = cfg.id, lib = cfg.lib, K = {};

    /* A huddle code box. Outside 7 AM to 3 PM weekdays, and in #key, the gate opens by itself. */
    K.codeBox = function (card, c, key, label) {
      var S = c.S, wrap = el('div');
      if (!S.huddle[key] && !LE.gatesOn()) { S.huddle[key] = LE.isKey() ? 'key' : 'open'; LE.save(); }
      if (S.huddle[key]) { if (S.huddle[key] === true) wrap.appendChild(el('p', 'msg ok', 'Code accepted.')); card.appendChild(wrap); return; }
      wrap.appendChild(el('p', null, 'Look up. Mr. D has the code. Enter it to continue.'));
      var row = el('div', 'row'), inp = el('input'); inp.type = 'text'; inp.inputMode = 'numeric'; inp.maxLength = 4; inp.setAttribute('aria-label', label); inp.style.width = '6em';
      var btn = el('button', 'btn', 'Enter code'); btn.type = 'button'; row.appendChild(inp); row.appendChild(btn); wrap.appendChild(row);
      var msg = el('p', 'msg bad', 'That code is not right. Ask Mr. D to check it.'); msg.hidden = true; wrap.appendChild(msg); card.appendChild(wrap);
      btn.onclick = function () { if (inp.value.trim() === LE.codeFor(ID, key)) { S.huddle[key] = true; LE.save(); LE.render(); } else msg.hidden = false; };
    };

    K.stamp = function (S) { return cfg.prefix + '-' + MrD.codes.stamp(ID, S.first, S.period); };

    /* The record the review portal reads (shared/profile.js): every question worked, by skill. */
    K.profileRecord = function (S) {
      var all = ((S.d.try && S.d.try.log) || []).concat((S.d.more && S.d.more.log) || []);
      var items = all.map(function (x) { return { skill: x.skill, title: x.title, band: x.band, firstTry: x.misses === 0, ok: !!x.ok }; }), P = S.d.pred || [];
      (lib.preds || []).forEach(function (pr, i) { var st = P[i]; if (st && st.pick != null) items.push({ skill: 'predict-' + (i + 1), band: S.band0 || 2, firstTry: st.pick === pr.correct, ok: st.pick === pr.correct }); });
      ['C1', 'C2'].forEach(function (k) { var q = LE.qs(k); if (q && q.done) items.push({ skill: 'check-' + k.toLowerCase(), band: 2, firstTry: q.ok && q.misses === 0, ok: !!q.ok }); });
      return { course: cfg.course || 'physics', lesson: ID, title: cfg.title, first: S.first, period: S.period, day: LE.today(), reached: LE.reached().idx + 1, of: LE.reached().of, items: items };
    };

    /* Practice that never runs out: the next skill at the student's hidden level, fresh numbers each time. */
    K.morePractice = function (host, c) {
      var S = c.S, M = S.d.more = S.d.more || { n: 0, log: [] }, n = M.n, sk = lib.skills[n % lib.skills.length], b = LE.band();
      var q = sk.gen(b, LE.seedRng('more:' + n + ':' + b)); q.id = 'more.' + n + '.' + b; q.head = 'Practice ' + (n + 1) + ' · ' + sk.title;
      var box = el('div'); host.appendChild(box);
      function nextBtn() {
        if (box.querySelector('.nextq')) return;
        var row = el('div', 'row nextq'), nb = el('button', 'btn primary', 'Next question'); nb.type = 'button'; row.appendChild(nb); box.appendChild(row);
        nb.onclick = function () {
          var st = LE.qs(q.id), m = st.misses, nbd = m === 0 ? b + 1 : (m === 1 ? b : b - 1);
          M.log.push({ skill: sk.id, title: sk.title, band: b, misses: m, ok: !!st.ok, secs: st.secs || 0, p: plain(q.prompt), a: LK.answerText(q), w: plain(q.worked) });
          LE.setBand(nbd, 'more'); M.n++; LE.save(); LE.render();
        };
      }
      q.onDone = nextBtn; LE.ask(box, q); if (qdone(q.id)) nextBtn();
    };

    /* The last step: explains notes and the stamp, keeps practice going until the end mark, then shows stamp + report code.
       opts.reportFields(S) returns the field array; opts.teacher(c) is the teacher-panel HTML. */
    K.notesStep = function (opts) {
      return { id: 'notes', label: 'Notes',
        render: function (card, c) {
          var S = c.S; card.appendChild(el('h2', null, 'Notes and stamp'));
          var ex = el('div', 'prose');
          ex.innerHTML = '<p><b>My notes</b> is a study sheet the page writes from your own work today: your predictions, your data, your rule, your definitions and the problems you solved. It fills in as you go, so it is never blank. Print it or save it as a PDF to study from.</p><p><b>The stamp</b> is your proof for Mr. D that you did today’s lesson. It is a four-digit code built from your name, your period and today’s date, so nobody else’s stamp matches yours.</p>';
          card.appendChild(ex);
          var row = el('div', 'row'), v = el('button', 'btn primary', 'View my notes'); v.type = 'button'; v.onclick = function () { LE.setViewNotes(true); LE.render(); window.scrollTo(0, 0); };
          var pr = el('button', 'btn', 'Print or save as PDF'); pr.type = 'button'; pr.onclick = function () { LE.print(); };
          var tx = el('button', 'btn', 'Download LaTeX (.tex)'); tx.type = 'button'; tx.onclick = function () { LE.downloadTex(); };
          row.appendChild(v); row.appendChild(pr); row.appendChild(tx); card.appendChild(row);
          if (!LE.canEnd()) {
            card.appendChild(el('h3', null, 'Keep practicing'));
            card.appendChild(el('p', 'hint', 'You have done every step. Your stamp appears when time for guided notes ends. Until then the questions keep coming at your level, and each one goes into your notes.'));
            K.morePractice(card, c); return;
          }
          var rc = LE.reached();
          card.appendChild(el('h3', null, 'Show this to Mr. D'));
          var p = el('p'); p.appendChild(el('span', 'stamp', K.stamp(S))); card.appendChild(p);
          card.appendChild(el('p', 'hint', (cfg.identity === 'id' ? 'ID: ' : 'Name: ') + S.first + ' · Period ' + S.period + ' · You got to step ' + (rc.idx + 1) + ' of ' + rc.of + ' (' + rc.label + ')' + (S.d.more && S.d.more.log.length ? ' · ' + S.d.more.log.length + ' practice questions' : '')));
          var code = LE.encodeReport(ID, opts.reportFields(S));
          card.appendChild(el('h3', null, 'Report code (paste into Classroom if Mr. D asks)'));
          var lc = el('div', 'longcode', code); card.appendChild(lc);
          var cp = el('button', 'btn small', 'Copy report code'); cp.type = 'button';
          cp.onclick = function () { try { navigator.clipboard.writeText(code); cp.textContent = 'Copied'; } catch (e) { var r = document.createRange(); r.selectNodeContents(lc); var s = window.getSelection(); s.removeAllRanges(); s.addRange(r); cp.textContent = 'Selected: press Ctrl+C'; } };
          card.appendChild(el('div', 'row')).appendChild(cp);
          if (window.MrD && MrD.profile) MrD.profile.record(K.profileRecord(S));
        },
        canLeave: function () { return true; },
        teacher: opts.teacher };
    };

    /* ---- standard tab names, so every lesson reads the same ---- */
    K.TABS = { start: 'Start', warmup: 'Warm-up', predict: 'Predict', explore: 'Explore', huddle: 'Huddle', build: 'Build', practice: 'Practice', check: 'Check', notes: 'Wrap-up' };

    /* Every tab opens with the same two lines: what you will be able to do, and what happens next.
       target: "I can ..." (one sentence). preview: one short line, e.g. "Next: push the cart three times and watch." */
    K.head = function (card, title, target, preview) {
      card.appendChild(el('h2', null, title));
      var t = el('p', 'target'); t.appendChild(el('b', null, 'Target: ')); t.appendChild(document.createTextNode(target)); card.appendChild(t);
      if (preview) { var p = el('p', 'hint'); p.appendChild(el('b', null, 'Up next: ')); p.appendChild(document.createTextNode(String(preview).replace(/^Up next:\s*/i, ''))); card.appendChild(p); }
    };

    /* The Start tab. In identity:'id' mode the student types the ID card Mr. D handed out (no name anywhere).
       opts: { title, question, targets:[...], tabs:[...] } — one-sentence lines only. */
    K.startStep = function (opts) {
      return { id: 'start', label: K.TABS.start,
        render: function (card, c) {
          var S = c.S; card.appendChild(el('h2', null, opts.title));
          card.appendChild(el('p', 'qtext', opts.question));
          card.appendChild(el('h3', null, 'By the end you can'));
          var ul = el('ul'); (opts.targets || []).forEach(function (t) { ul.appendChild(el('li', null, t)); }); card.appendChild(ul);
          card.appendChild(el('h3', null, 'Today'));
          var ol = el('ol'); (opts.tabs || []).forEach(function (t) { ol.appendChild(el('li', null, t)); }); card.appendChild(ol);
          if (cfg.identity === 'id' && window.MrD && MrD.ids) {
            var host = el('div'); card.appendChild(host);
            MrD.ids.ask(host, { id: S.first, period: S.period, onChange: function (r) { if (r.valid) { S.first = r.id; S.period = r.period; } else { S.first = ''; S.period = r.period; } LE.save(); LE.gate(); } });
            card.appendChild(el('p', 'hint', 'Use the ID on your card. No names on this page.'));
          } else {
            var row = el('div', 'row'), f = el('input'); f.type = 'text'; f.maxLength = 20; f.value = S.first; f.setAttribute('aria-label', 'First name');
            var pe = el('input'); pe.type = 'text'; pe.maxLength = 4; pe.value = S.period; pe.setAttribute('aria-label', 'Period');
            var l1 = el('label', null, 'First name '); l1.appendChild(f); var l2 = el('label', null, 'Period '); l2.appendChild(pe); row.appendChild(l1); row.appendChild(l2); card.appendChild(row);
            function upd() { S.first = f.value; S.period = pe.value; LE.save(); LE.gate(); }
            f.addEventListener('input', upd); pe.addEventListener('input', upd);
          }
        },
        canLeave: function (c) { return c.S.first.trim().length > 0 && c.S.period.trim().length > 0; },
        teacher: function () { return '<p>' + (cfg.identity === 'id' ? 'Students type the ID from their card; a typo is caught on the page. Numbers are seeded from the ID, so a student gets the same values on any device.' : 'First name and period only.') + '</p>'; } };
    };

    /* The Huddle tab: Mr. D teaches, the student writes. Timed (cfg.pacing.huddles pulls everyone here at atMin), optional (never blocks),
       and closed by the huddle code in school hours. spec is the MrD.huddle spec. */
    K.huddleStep = function (opts) {
      return { id: 'huddle', label: K.TABS.huddle, optional: true, timed: true,
        render: function (card, c) {
          var S = c.S; K.head(card, opts.title || 'Huddle with Mr. D', opts.target, 'Listen, then fill in the blanks as Mr. D writes them.');
          S.d.hud = S.d.hud || {};
          var host = el('div'); card.appendChild(host);
          MrD.huddle.render(host, opts.spec, S.d.hud, { key: c.key, onChange: function () { LE.save(); } });
          K.codeBox(card, c, opts.gateKey || 'h1', 'Huddle code');
        },
        canLeave: function (c) { return true; },
        teacher: opts.teacher };
    };
    return K;
  };
})();
