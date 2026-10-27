/* LESSON (statistics): Unit 3, Slot 11. 3.6 Finding Boundary Values. The wiring is LK.standard (physics/lessons/engine/standard.js) with five steps replaced, each copied
   from standard.js and edited, and the Models tab inserted: Warm-up (the card's six questions place the student), Build (the card's four parts in order, T14 last),
   Check (the card's exit), Wrap-up (the report code carries the exit result), Huddle (the card's talk line). The teaching is in 3-6-boundary-values.spec.js and the Day Card.
   The Explore sim, Slide the boundary, is below (NK.boundary, stats/shared/boundary-kit.js). The Models tab is 3-6-boundary-values.models.js. */
(function () {
  'use strict';
  var LE = window.LE, el = LE.el, qdone = LK.qdone, SP = window.SPECS['3-6-boundary-values'], ID = SP.id, C = SP.content, UI = window.BV_UI;
  var pct = function (a) { return Math.round(a * 100); };

  /* ---------- Explore: Slide the boundary ----------
     Four targets in order (0.50, 0.90, 0.20, 0.95). The student drags one boundary on a minutes axis until the shaded area on the left matches the target.
     The area stays hidden until Commit. Each run is logged: target, boundary dragged to, committed area, tries. */
  function explore(card, c, K) {
    var S = c.S, E = SP.explore, bd = S.d.bnd = S.d.bnd || { runs: [], tries: 0 }, n = bd.runs.length;
    if (n) {
      var tb = el('table', 'data'); tb.innerHTML = '<thead><tr><th>Area to the left</th><th>My boundary (' + E.units + ')</th><th>Exact (' + E.units + ')</th></tr></thead>';
      var body = el('tbody'); bd.runs.forEach(function (r, i) { var tr = el('tr'); tr.innerHTML = '<td>' + pct(r.target) + '%</td><td>' + r.boundary + '</td><td>' + E.answers[i].value + '</td>'; body.appendChild(tr); });
      tb.appendChild(body); var sc = el('div', 'scroll'); sc.appendChild(tb); card.appendChild(sc);
    }
    if (n >= E.targets.length) { card.appendChild(el('p', 'msg ok', 'All four boundaries found. Each one is a value with a chosen area to its left.')); return; }
    var a = E.targets[n];
    card.appendChild(el('h3', null, 'Boundary ' + (n + 1) + ' of ' + E.targets.length));
    card.appendChild(el('p', 'qtext', 'Pretend delivery times are normal, mean ' + E.mean + ' ' + E.units + ', SD ' + E.sd + '. Slide the boundary until the shaded area on its left is ' + a.toFixed(2) + ' (' + pct(a) + '% of deliveries). Then press Commit.'));
    var host = el('div', 'sim'); card.appendChild(host);
    var b = NK.boundary(host, { mean: E.mean, sd: E.sd, units: E.units, target: a, tol: 0.01 });
    var fb = el('p', 'msg', ''); fb.setAttribute('aria-live', 'polite'); card.appendChild(fb);
    if (c.key) card.appendChild(el('p', 'keyline', 'KEY: ' + E.answers[n].value + ' ' + E.units + ' (area ' + a.toFixed(2) + ')'));
    b.on('commit', function (r) {
      bd.tries++;
      if (!r.ok) { fb.className = 'msg bad'; fb.textContent = 'The target is ' + a.toFixed(2) + '. Move the boundary to the ' + r.direction + ' and commit again.'; LE.save(); return; }
      bd.runs.push({ target: a, boundary: r.value, area: r.area, tries: bd.tries }); bd.tries = 0; LE.save();
      fb.className = 'msg ok'; fb.textContent = 'That matches. ' + pct(a) + '% of deliveries are below ' + r.value + ' ' + E.units + '. The exact boundary is ' + E.answers[n].value + ' ' + E.units + '.';
      var nx = el('button', 'btn primary', n + 1 < E.targets.length ? 'Next boundary' : 'Done'); nx.type = 'button'; nx.onclick = function () { LE.render(); }; var row = el('div', 'row'); row.appendChild(nx); card.appendChild(row);
    });
  }

  var cfg = LK.standard(SP, { prefix: 'BOU', explore: explore });
  cfg.conceptTabs = NK.boundaryTabs().concat(NK.conceptTabs());   // the Calculator and Table backward tabs come first: students have invNorm and normalcdf here, and the table as a back-up
  var K = LK.for({ id: ID, course: SP.course, prefix: 'BOU', identity: 'id', title: SP.title, lib: { preds: SP.predicts,
    skills: SP.skills.map(function (sk) { return { id: sk.id, title: sk.title, gen: function (b, r) { var q = sk.gen(b, r); q.type = q.type || 'num'; q.keypad = true; return q; } }; }) } }), T = K.TABS;
  function stepIdx(id) { for (var i = 0; i < cfg.steps.length; i++) if (cfg.steps[i].id === id) return i; return -1; }
  var firstTry = function (id) { var s = LE.qs(id); return !!(s && s.done && s.ok && s.misses === 0); };

  /* ---------- Warm-up: the card's six questions (bands 1 and 2), one try each. Band 1 is cleared by W1 to W4 first try; band 2 by W5 and W6 as well. ---------- */
  var WUNIT = { W2: '%', W4: '%', W5: '%', W6: '%' };
  function warmQ(w, i) {
    var q = { id: w.id, type: 'num', answer: w.answer, unit: WUNIT[w.id] || '', keypad: true };
    q.head = 'Warm-up ' + (i + 1) + ' of ' + SP.warmup.length; q.prompt = w.prompt; q.maxMiss = 1; return q;
  }
  function place(S) {
    if (!SP.warmup.every(function (w) { return qdone(w.id); })) return;
    var band1 = SP.warmup.filter(function (w) { return w.band === 1; }).every(function (w) { return firstTry(w.id); });
    var band2 = band1 && SP.warmup.filter(function (w) { return w.band === 2; }).every(function (w) { return firstTry(w.id); });
    var placed = band2 ? 2 : 1, log = SP.warmup.map(function (w) { return { band: w.band, ok: firstTry(w.id) }; });
    S.d.place = { done: true, placed: placed, log: log, asked: log.length, band: placed, misses: 0, cleared: band2 ? 2 : band1 ? 1 : 0, maxBand: 4, maxItems: 8 };
    if (!S.band0) { S.band0 = placed; S.band = placed; S.warm = log.filter(function (x) { return x.ok; }).length; S.bandLog.push('start:' + placed); }
  }
  cfg.steps[stepIdx('warmup')] = { id: 'warmup', label: T.warmup,
    render: function (card, c) {
      var S = c.S; K.head(card, T.warmup, 'I can show what I already know.', 'Up next: you make three predictions.');
      SP.warmup.forEach(function (w, i) { var q = warmQ(w, i); q.onDone = function () { place(S); LE.save(); setTimeout(LE.render, 700); }; LE.ask(card, q); });
      if (S.d.place && S.d.place.done) card.appendChild(el('p', 'msg ok', 'Warm-up saved. Let’s go.'));
    },
    canLeave: function (c) { return SP.warmup.every(function (w) { return qdone(w.id); }); },
    teacher: function () {
      return '<p>Six questions, one try each; the first four are the plainest. The student starts at band 1, or band 2 when W1 to W4 are all right first try and W5 and W6 are too. Answers: ' +
        SP.warmup.map(function (w) { return w.id + ' = ' + w.answer + ' (' + LK.plain(w.pattern) + ')'; }).join('; ') + '.</p>';
    } };

  /* ---------- Huddle: the card's talk line goes in front of the writable huddle; the gate is the standard huddle code (the clear/hold rule is pending). ---------- */
  var hs = cfg.steps[stepIdx('huddle')], hRender = hs.render;
  hs.render = function (card, c) {
    hRender(card, c);
    var first = card.querySelector('.hd-sec'), p = el('p', 'qtext', SP.talk[0]); if (first) first.parentNode.insertBefore(p, first); else card.appendChild(p);
  };
  var gateStatus = function (id) {
    if (/^explore-/.test(id)) { var t = parseFloat(id.slice(8)), r = ((LE.S().d.bnd || {}).runs || []).filter(function (x) { return x.target === t; })[0]; return r ? (r.tries === 1 ? ' (first try)' : ' (missed)') : ' (not reached)'; }
    return LE.qs(id) && LE.qs(id).done ? (firstTry(id) ? ' (first try)' : ' (missed)') : ' (not reached)';
  };
  hs.teacher = function (c) {
    var items = SP.gate.items.map(function (id) { return id + gateStatus(id); }).join(', ');
    return '<p><b>Huddle code: ' + LE.codeFor(ID, 'h1') + '.</b> Pulled in at minute ' + SP.pacing.huddles[0].atMin + ' by the clock. Open with: “' + LK.plain(SP.talk[0]) + '” Then walk the three definitions, work model M1 (the 90th percentile) on the board, and label the curve. Students fill the blanks as you write them. The board page (3-6-boundary-values-board.html) runs the same lines on the projector.</p>' +
      '<p>Items that count toward the gate: ' + items + '. The clear/hold rule is pending your decision; until then this is the standard huddle code, one per day for every class.</p>';
  };

  /* ---------- Models tab (after the huddle) ---------- */
  cfg.steps.splice(stepIdx('huddle') + 1, 0, UI.modelsStep(K));

  /* ---------- Build: the card's four parts in order (direction, upper-tail boundary, lower-tail boundary, missing mean or SD).
     Item i is part i, so when the pace plan shrinks Build to two items the missing-mean-or-SD part is the one cut first. ---------- */
  var BYID = {}; SP.skills.forEach(function (sk) { BYID[sk.id] = sk; });
  var PART = { 'direction': 'direction', 'boundary-upper-tail': 'boundary', 'boundary-lower-tail': 'boundary', 'missing-mean-or-sd': 'missing' };
  function tailOK(q, part) {
    var A = q.meta && q.meta.leftAreas; if (part.indexOf('boundary-') !== 0 || !A || A.length !== 1) return true;
    return (A[0] > 0.5) === (part === 'boundary-upper-tail');
  }
  function buildQ(i, band) {
    var part = SP.pacing.buildParts[i % SP.pacing.buildParts.length], sk = BYID[PART[part]], q;
    for (var a = 0; a < 40; a++) { q = sk.gen(band, LE.seedRng('b:' + i + ':' + band + ':' + a)); if (tailOK(q, part)) break; }
    q.id = 'b.' + i; q.type = q.type || 'num'; q.head = sk.title; q.keypad = true; return q;
  }
  cfg.steps[stepIdx('build')] = { id: 'build', label: T.build,
    render: function (card, c) {
      K.head(card, T.build, SP.buildTarget, 'Up next: endless practice at your level.');
      card.appendChild(el('p', 'hint', 'Need a calculator? Open Concepts, then Calculator.'));
      var n = LE.items('build', 4), b = LE.band();
      for (var i = 0; i < n; i++) LE.ask(card, buildQ(i, b));
    },
    canLeave: function () { var n = LE.items('build', 4); for (var i = 0; i < n; i++) if (!qdone('b.' + i)) return false; return true; },
    teacher: function () { return '<p>Four problems at the student’s band, in the card’s order: ' + SP.pacing.buildParts.join(', ') + '. Two when the class is behind, which cuts the missing mean or SD first. Hints appear one at a time and stop early: practice is where the ladder is full.</p>'; } };

  /* ---------- Check: the card's exit. One point each for a first-try right: 3 secure, 2 developing, 0 to 1 not yet. ---------- */
  function exitQ(x) {
    var q = x.type === 'choice' ? { id: x.id, type: 'choice', options: x.options, answer: x.answer, maxMiss: 1 } : { id: x.id, type: 'num', answer: x.answer, unit: x.unit || '', abs: x.tol + 1e-9, tol: 0, keypad: true, maxMiss: 2 };
    q.head = 'Check ' + x.id.slice(1); q.prompt = x.prompt; return q;
  }
  function exitScore() { return SP.exit.filter(function (x) { return firstTry(x.id); }).length; }
  function exitLabel(n) { return n >= SP.scoring.secure ? 'secure' : n >= SP.scoring.developing ? 'developing' : 'not yet'; }
  cfg.steps[stepIdx('check')] = { id: 'check', label: T.check,
    render: function (card, c) { K.head(card, T.check, 'I can do it without help.', 'Up next: your notes and stamp.'); SP.exit.forEach(function (x) { LE.ask(card, exitQ(x)); }); },
    canLeave: function () { return SP.exit.every(function (x) { return qdone(x.id); }); },
    teacher: function (c) {
      var n = exitScore();
      return '<p>Three questions, one point each for a first-try right. Answers: ' + SP.exit.map(function (x) { return x.id + ' = ' + LK.plain(x.type === 'choice' ? x.options[x.answer] : x.answer); }).join('; ') +
        '. Scoring: ' + SP.scoring.secure + ' secure, ' + SP.scoring.developing + ' developing, ' + SP.scoring.notYet + ' not yet. The missing mean or SD is not on the exit. This student: ' + n + ' (' + exitLabel(n) + ').</p>';
    } };

  /* ---------- Wrap-up: the report code carries the exit result (x1-x2-x3) in place of the two-question check ---------- */
  K.profileRecord = function (S) {
    var rec = function (skill, band, id) { var s = LE.qs(id); return s && s.done ? { skill: skill, band: band, firstTry: firstTry(id), ok: !!s.ok } : null; };
    var items = ((S.d.more && S.d.more.log) || []).map(function (x) { return { skill: x.skill, title: x.title, band: x.band, firstTry: x.misses === 0, ok: !!x.ok }; });
    SP.predicts.forEach(function (p, i) { var r = rec('predict-' + (i + 1), S.band0 || 1, p.id); if (r) items.push(r); });
    ((S.d.bnd || {}).runs || []).forEach(function (r) { items.push({ skill: 'explore-boundary', band: 1, firstTry: r.tries === 1, ok: true }); });
    SP.exit.forEach(function (x) { var r = rec('check-' + x.id.toLowerCase(), 2, x.id); if (r) items.push(r); });
    return { course: SP.course, lesson: ID, title: SP.title, first: S.first, period: S.period, day: LE.today(), reached: LE.reached().idx + 1, of: LE.reached().of, items: items };
  };
  function reportFields(S) {
    var mlog = (S.d.more && S.d.more.log) || [];
    return ['v1', S.first, S.period, S.band0, S.band, S.warm == null ? '' : S.warm, SP.exit.map(function (x) { return firstTry(x.id) ? 1 : 0; }).join('-'), LE.today(), LE.reached().idx + 1, S.ended ? 't' : 'f',
      mlog.length + '-' + mlog.filter(function (x) { return x.misses === 0; }).length, Object.keys(S.skip || {}).join('+')];
  }
  cfg.steps[stepIdx('notes')] = K.notesStep({ reportFields: reportFields, teacher: function (c) {
    return '<p>Stamp for this device: <b>' + K.stamp(c.S) + '</b>. The report code lists the ID, the placement band, the check result (three first-try bits, X1 to X3), and any tabs the pace plan skipped.</p>'; } });

  /* ---------- Notes: the boundaries found in Explore and the models finished ---------- */
  var baseNotes = cfg.notes;
  cfg.notes = function (c) {
    var doc = baseNotes(c), at = -1, extra = [], runs = (c.S.d.bnd || {}).runs || [];
    doc.sections.forEach(function (s, i) { if (s.title === 'Problems I solved') at = i; });
    if (runs.length) extra.push({ title: 'Slide the boundary', blocks: [{ type: 'table', head: ['Area to the left', 'My boundary (' + SP.explore.units + ')', 'Exact (' + SP.explore.units + ')'], rows: runs.map(function (r, i) { return [pct(r.target) + '%', String(r.boundary), String(SP.explore.answers[i].value)]; }) }] });
    var ms = UI.notesSection(); if (ms) extra.push(ms);
    doc.sections.splice.apply(doc.sections, [at < 0 ? doc.sections.length : at, 0].concat(extra));
    return doc;
  };
})();
