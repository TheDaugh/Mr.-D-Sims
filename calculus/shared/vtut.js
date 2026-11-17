/* VT: the visual tutorial. A lesson tab that teaches by a short slide show instead of a teacher huddle.
   Each frame = one picture (a scene from scenes.js), one or two sentences, an optional "board" line that stays on screen as the work builds, and an optional question.
   The student moves with Next and Back. Next unlocks when the frame's question is answered (two misses reveal the answer, so nobody is stuck).
   In #key every frame is open and every answer is marked.
   Frame: { head, move, show, st, guide, say, work:[...], workClear, ask:{type:'choice'|'num'|'expr'|'custom', ...}, slip }
   Loaded after the lesson engine, qkit and xkit; scenes.js adds the pictures. */
(function () {
  'use strict';
  var LE = window.LE, el = LE.el;
  var VT = window.VT = { scenes: {}, customs: {} };
  var inline = function (s) { return window.QKIT ? QKIT.inline(String(s == null ? '' : s)) : String(s == null ? '' : s); };
  VT.inline = inline;

  /* The question a frame carries, in the shape LE.ask wants. */
  VT.question = function (id, a, head) {
    var q = { id: id, type: a.type || 'choice', math: true, head: head || 'Your turn', prompt: a.prompt, maxMiss: a.maxMiss || (a.type === 'num' || a.type === 'expr' ? 3 : 2), keypad: true };
    if (q.type === 'choice') {
      q.options = a.options.map(inline); q.answer = a.answer; q.worked = inline(a.why || ''); if (a.fixed) q.fixed = true; if (a.hint) q.hint = inline(a.hint);
      if (a.traps) { q.why = {}; Object.keys(a.traps).forEach(function (k) { q.why[k] = inline(a.traps[k]); }); }
    } else if (q.type === 'num') {
      q.answer = a.answer; q.unit = a.unit; q.tol = a.tol == null ? 0.01 : a.tol; q.abs = a.abs; q.hint = inline(a.hint || ''); q.worked = inline(a.why || '');
    } else if (q.type === 'expr') {
      q.answer = a.answer; q.vars = a.vars || ['x']; q.label = a.label; q.hints = a.hints || []; q.traps = a.traps; q.worked = a.why || ''; q.domain = a.domain;
    } else if (q.type === 'custom') {
      var c = VT.customs[a.custom](a); for (var k in c) q[k] = c[k]; q.prompt = a.prompt;
    }
    return q;
  };

  /* Show frames as a slide show inside host. o = { tab, S, key, prefix }.  Progress (current frame, furthest frame) lives in S.d.vt[tab]. */
  VT.show = function (host, frames, o) {
    var S = o.S, key = !!o.key, store = (S.d.vt = S.d.vt || {}), P = (store[o.tab] = store[o.tab] || { i: 0, max: 0 });
    var root = el('div', 'vt'); host.appendChild(root);
    var qid = function (i) { return o.prefix + '.' + o.tab + i; };
    var done = function (i) { var f = frames[i]; if (!f.ask || key) return true; var s = LE.qs(qid(i)); return !!(s && s.done); };
    function go(i) { P.i = Math.max(0, Math.min(frames.length - 1, i)); P.max = Math.max(P.max, P.i); LE.save(); draw(); LE.gate(); }
    function draw() {
      root.textContent = '';
      var i = P.i, f = frames[i], n = frames.length;
      var dots = el('div', 'vt-dots'); dots.setAttribute('role', 'tablist');
      frames.forEach(function (fr, k) {
        var b = el('button', 'vt-dot' + (k === i ? ' on' : '') + (done(k) && k <= P.max ? ' ok' : '')); b.type = 'button'; b.textContent = String(k + 1); b.setAttribute('aria-label', 'Part ' + (k + 1) + ' of ' + n); if (k === i) b.setAttribute('aria-current', 'step');
        b.disabled = !(key || k <= P.max); b.onclick = function () { go(k); }; dots.appendChild(b);
      });
      root.appendChild(dots);
      if (f.move) root.appendChild(el('p', 'vt-move', f.move));
      var h = el('h3', 'vt-head'); h.innerHTML = inline(f.head || ''); root.appendChild(h);
      var grid = el('div', 'vt-grid'); root.appendChild(grid);
      var fig = el('div', 'vt-fig'); grid.appendChild(fig);
      if (f.show) {
        if (!VT.scenes[f.show]) fig.appendChild(el('p', 'msg bad', 'Missing picture: ' + f.show)); else VT.scenes[f.show](fig, f.st || {}, { key: key });
        if (f.guide) { var g = el('p', 'hint vt-guide'); g.appendChild(el('b', null, 'How to read it: ')); var gs = el('span'); gs.innerHTML = inline(f.guide); g.appendChild(gs); fig.appendChild(g); }
      }
      var side = el('div', 'vt-side'); grid.appendChild(side);
      if (f.problem) { var pb = el('div', 'vt-problem'); pb.innerHTML = inline(f.problem); side.appendChild(pb); }
      if (f.say) { var say = el('p', 'vt-say'); say.innerHTML = inline(f.say); side.appendChild(say); }
      var lines = [], j;
      for (j = 0; j <= i; j++) { if (frames[j].workClear) lines = []; (frames[j].work || []).forEach(function (w) { lines.push({ t: w, fresh: j === i }); }); }
      if (lines.length) {
        var wb = el('div', 'vt-work'); wb.appendChild(el('p', 'vt-work-h', o.boardTitle || 'On the board'));
        lines.forEach(function (ln) { var d = el('div', 'vt-line' + (ln.fresh ? ' new' : '')); d.innerHTML = inline(ln.t); wb.appendChild(d); });
        side.appendChild(wb);
      }
      if (f.slip) side.classList.add('vt-slip');
      if (f.ask) {
        var q = VT.question(qid(i), f.ask, f.askHead); q.onDone = function () { upd(); };
        LE.ask(side, q);
      }
      var nav = el('div', 'row vt-nav'); root.appendChild(nav);
      var back = el('button', 'btn', 'Back'); back.type = 'button'; back.disabled = i === 0; back.onclick = function () { go(i - 1); }; nav.appendChild(back);
      var nx = el('button', 'btn primary vt-next', i + 1 < n ? 'Next' : 'End of this part'); nx.type = 'button'; nx.disabled = i + 1 >= n || !done(i); nx.onclick = function () { go(i + 1); }; nav.appendChild(nx);
      if (i + 1 >= n) nav.appendChild(el('span', 'hint', done(i) ? 'Use Continue below to go on.' : 'Answer the question, then use Continue below.'));
      else if (!done(i)) nav.appendChild(el('span', 'hint', 'Answer the question to unlock Next.'));
      function upd() { nx.disabled = i + 1 >= n || !done(i); LE.gate(); var d = dots.children[i]; if (d && done(i)) d.classList.add('ok'); }
      root._upd = upd;
    }
    draw();
    return root;
  };

  /* Done when every question is answered and the student has seen the last frame. */
  VT.complete = function (frames, tab, prefix, S) {
    var P = S.d.vt && S.d.vt[tab]; if (!P || P.max < frames.length - 1) return false;
    return frames.every(function (f, i) { if (!f.ask) return true; var s = LE.qs(prefix + '.' + tab + i); return !!(s && s.done); });
  };

  /* Every line of a frame list as plain teacher text with the answers (for the #key panel and the make-up notes). */
  VT.script = function (frames) {
    return frames.map(function (f, i) {
      var a = f.ask, ans = '';
      if (a) ans = a.type === 'choice' ? a.options[a.answer] : (a.type === 'num' ? a.answer + (a.unit ? ' ' + a.unit : '') : (a.type === 'expr' ? a.answer : a.keyText || ''));
      return { n: i + 1, head: f.head, move: f.move, say: f.say, work: f.work || [], ask: a ? a.prompt : '', answer: ans, why: a ? (a.why || '') : '' };
    });
  };
})();
