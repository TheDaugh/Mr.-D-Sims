/* qkit.js: question kit for the guided calculus lessons.
   Needs MC (mathcheck.js) and katex. Renders one question card, grades typed math by numeric
   equivalence, shows a live KaTeX preview, names common wrong answers ("traps"), and reports a
   result the lesson uses to adjust difficulty. No dependencies beyond those two. */
(function (root) {
  'use strict';
  var MC = root.MC, KX = root.katex;

  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  function tex(m, display) {
    try { return KX.renderToString(m, { throwOnError: false, displayMode: !!display, output: 'html' }); }
    catch (e) { return esc(m); }
  }
  /* rich("text with $x^2$ math and **bold**") -> safe HTML. \$ is a literal dollar sign. */
  function rich(s) {
    s = String(s == null ? '' : s).replace(/\\\$/g, '\u0001');
    var out = '', last = 0, re = /\$\$([\s\S]+?)\$\$|\$([^$]+?)\$/g, m;
    function text(t) {
      t = esc(t).replace(/\u0001/g, '$').replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>');
      return t.replace(/\n\n/g, '</p><p>').replace(/\n/g, '<br>');
    }
    while ((m = re.exec(s))) {
      out += text(s.slice(last, m.index));
      out += m[1] != null ? tex(m[1].replace(/\u0001/g, '\\$'), true) : tex(m[2].replace(/\u0001/g, '\\$'), false);
      last = re.lastIndex;
    }
    out += text(s.slice(last));
    return '<p>' + out + '</p>';
  }
  /* inline version: no wrapping paragraph */
  function inline(s) { return rich(s).replace(/^<p>/, '').replace(/<\/p>$/, ''); }

  function mix(s) {
    var h = 2166136261;
    for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
    h ^= h >>> 16; h = Math.imul(h, 2246822507); h ^= h >>> 13; h = Math.imul(h, 3266489909); h ^= h >>> 16;
    return h >>> 0;
  }
  function perm(n, seed) {
    var a = [];
    for (var i = 0; i < n; i++) a.push({ i: i, k: mix(seed + '#' + i) });
    a.sort(function (x, y) { return (x.k - y.k) || (x.i - y.i); });
    return a.map(function (o) { return o.i; });
  }
  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }

  var PADS = {
    '^': { t: 'xⁿ', ins: '^' }, '(': { t: '(', ins: '(' }, ')': { t: ')', ins: ')' }, '/': { t: '÷', ins: '/' },
    '*': { t: '×', ins: '*' }, sqrt: { t: '√', ins: 'sqrt(' }, e: { t: 'eˣ', ins: 'e^(' }, ln: { t: 'ln', ins: 'ln(' },
    sin: { t: 'sin', ins: 'sin(' }, cos: { t: 'cos', ins: 'cos(' }, pi: { t: 'π', ins: 'pi' }
  };
  var DEFAULT_PAD = ['^', '(', ')', '*', '/'];

  function gradeField(f, val) {
    val = val == null ? '' : String(val);
    if (f.type === 'text') return { ok: val.trim().length >= (f.min || 15), err: null };
    if (f.type === 'mc') return { ok: val !== '' && +val === f.ans, err: val === '' ? 'Choose one.' : null };
    try {
      if (f.type === 'num') {
        var v = MC.numberValue(val);
        return { ok: MC.numberClose(v, f.answer, f.tol), err: null, value: v };
      }
      var r = MC.equivalent(val, f.answer, { vars: f.vars || ['x'], domain: f.domain, scale: f.scale });
      return { ok: r.ok, err: null };
    } catch (e) {
      return { ok: false, err: e && e.message ? e.message : 'I could not read that.' };
    }
  }
  function trapMessage(f, val) {
    if (!f.traps) return null;
    for (var i = 0; i < f.traps.length; i++) {
      var t = f.traps[i];
      try {
        if (f.type === 'num') {
          if (MC.numberClose(MC.numberValue(val), t.value, f.tol)) return t.msg;
        } else if (MC.equivalent(val, t.expr, { vars: f.vars || ['x'], domain: f.domain }).ok) return t.msg;
      } catch (e) { /* not comparable */ }
    }
    return null;
  }

  /* render(host, q, opt) -> controller
     q: { prompt, figure, fields:[{id,label,type,answer|ans+choices,vars,domain,scale,tol,unit,min,pad,traps}],
          hints:[...], worked, good, why }
     opt: { seed, noHints, maxTries, onDone(result), locked }
     result: { misses, hints, assisted, clean, traps:[msgs], answers:{id:value}, gaveUp } */
  function render(host, q, opt) {
    opt = opt || {};
    var misses = 0, hintsShown = 0, finished = false, assisted = false, trapsHit = [];
    var card = el('div', 'q-card');
    card.appendChild(el('div', 'q-prompt', rich(q.prompt || '')));
    if (q.figure) card.appendChild(el('div', 'figure', q.figure));
    var body = el('div', 'q-body'), grid = el('div', 'q-fields');
    body.appendChild(grid); card.appendChild(body);
    var ctl = { el: card, q: q, fields: {} };

    q.fields.forEach(function (f, fi) {
      var wrap = el('div', 'q-field'), uid = 'qf' + Math.random().toString(36).slice(2, 8);
      if (f.label) { var lb = el('label', null, inline(f.label)); lb.setAttribute('for', uid); if (f.type === 'mc') lb.removeAttribute('for'); wrap.appendChild(lb); }
      var rec = { f: f, get: null, set: null, lock: null, markEl: null };
      if (f.type === 'mc') {
        var order = perm(f.choices.length, (opt.seed || q.id || 'q') + '|' + f.id), ch = el('div', 'choices'), sel = '';
        ch.setAttribute('role', 'radiogroup');
        order.forEach(function (oi) {
          var lab = el('label', 'choice'), inp = document.createElement('input');
          inp.type = 'radio'; inp.name = uid; inp.value = String(oi);
          inp.onchange = function () { sel = String(oi); Array.prototype.forEach.call(ch.children, function (c) { c.classList.remove('sel'); }); lab.classList.add('sel'); };
          lab.appendChild(inp); lab.appendChild(el('span', null, inline(f.choices[oi])));
          ch.appendChild(lab);
        });
        wrap.appendChild(ch);
        rec.get = function () { return sel; };
        rec.set = function (v) { var inp = ch.querySelector('input[value="' + v + '"]'); if (inp) { inp.checked = true; inp.onchange(); } };
        rec.lock = function (ok) {
          Array.prototype.forEach.call(ch.children, function (c) {
            var inp = c.querySelector('input'); inp.disabled = true;
            if (+inp.value === f.ans) c.classList.add('right');
            else if (inp.checked && !ok) c.classList.add('wrong');
          });
        };
      } else if (f.type === 'text') {
        var ta = document.createElement('textarea'); ta.id = uid; ta.rows = f.rows || 3;
        if (f.placeholder) ta.placeholder = f.placeholder;
        wrap.appendChild(ta);
        rec.get = function () { return ta.value; };
        rec.set = function (v) { ta.value = v; ta.dispatchEvent(new Event('input')); };
        rec.lock = function () { ta.disabled = true; };
        ta.addEventListener('input', function () { if (opt.onText) opt.onText(f.id, ta.value); });
        if (opt.initial && opt.initial[f.id]) ta.value = opt.initial[f.id];
        rec.input = ta;
      } else {
        var inp = document.createElement('input'); inp.type = 'text'; inp.id = uid; inp.autocomplete = 'off'; inp.spellcheck = false;
        inp.setAttribute('autocapitalize', 'off');
        if (f.type === 'expr') inp.className = 'wide';
        if (f.placeholder) inp.placeholder = f.placeholder;
        var line = el('div', null);
        line.appendChild(inp);
        if (f.unit) line.appendChild(el('span', 'unit', inline(f.unit)));
        var mark = el('span', 'mark'); line.appendChild(mark); rec.markEl = mark;
        wrap.appendChild(line);
        if (f.type === 'expr') {
          var pad = el('div', 'pad'), keys = f.pad || DEFAULT_PAD;
          keys.forEach(function (k) {
            var d = PADS[k]; if (!d) return;
            var b = el('button', null, esc(d.t)); b.type = 'button'; b.setAttribute('aria-label', 'insert ' + d.ins);
            b.onclick = function () {
              var s = inp.selectionStart == null ? inp.value.length : inp.selectionStart, e2 = inp.selectionEnd == null ? s : inp.selectionEnd;
              inp.value = inp.value.slice(0, s) + d.ins + inp.value.slice(e2);
              var p = s + d.ins.length; inp.focus(); try { inp.setSelectionRange(p, p); } catch (er) {}
              upd();
            };
            pad.appendChild(b);
          });
          wrap.appendChild(pad);
          var pv = el('div', 'preview'); pv.setAttribute('aria-live', 'polite'); wrap.appendChild(pv);
          var upd = function () {
            var v = inp.value;
            if (!v.trim()) { pv.innerHTML = '<span class="none">preview</span>'; return; }
            try { pv.innerHTML = tex(MC.toLatex(v, f.vars || ['x']), false); }
            catch (e) { pv.innerHTML = '<span class="err">' + esc(e.message || 'Keep typing...') + '</span>'; }
          };
          inp.addEventListener('input', upd); upd();
        }
        inp.addEventListener('keydown', function (ev) { if (ev.key === 'Enter') { ev.preventDefault(); check(); } });
        inp.addEventListener('input', function () { inp.classList.remove('bad', 'ok'); if (rec.markEl) { rec.markEl.textContent = ''; rec.markEl.className = 'mark'; } });
        rec.get = function () { return inp.value; };
        rec.set = function (v) { inp.value = v; inp.dispatchEvent(new Event('input')); };
        rec.lock = function () { inp.disabled = true; };
        rec.input = inp;
      }
      rec.wrap = wrap; rec.done = false;
      ctl.fields[f.id] = rec;
      grid.appendChild(wrap);
    });

    var row = el('div', 'row'), btnCheck = el('button', 'btn primary', 'Check'), btnHint = null, btnWorked = null;
    btnCheck.type = 'button'; row.appendChild(btnCheck);
    if (q.hints && q.hints.length && !opt.noHints) {
      btnHint = el('button', 'btn', 'Hint'); btnHint.type = 'button'; row.appendChild(btnHint);
    }
    btnWorked = el('button', 'btn', 'Show the worked solution'); btnWorked.type = 'button'; btnWorked.hidden = true; row.appendChild(btnWorked);
    card.appendChild(row);
    var fb = el('div', 'fb'); fb.hidden = true; card.appendChild(fb);
    var hintBox = el('div', 'fb info'); hintBox.hidden = true; card.appendChild(hintBox);
    var workedBox = el('div', 'worked'); workedBox.hidden = true; card.appendChild(workedBox);

    function showFb(kind, html) { fb.className = 'fb ' + kind; fb.innerHTML = html; fb.hidden = !html; }
    function showHints() {
      if (!hintsShown) { hintBox.hidden = true; return; }
      hintBox.hidden = false;
      hintBox.innerHTML = q.hints.slice(0, hintsShown).map(function (h, i) { return '<p><b>Hint ' + (i + 1) + '.</b> ' + inline(h) + '</p>'; }).join('');
    }
    function nextHint() {
      if (!q.hints || opt.noHints || hintsShown >= q.hints.length) return false;
      hintsShown++; showHints(); return true;
    }
    function answers() { var o = {}; Object.keys(ctl.fields).forEach(function (k) { o[k] = ctl.fields[k].get(); }); return o; }
    function finish(gaveUp) {
      if (finished) return;
      finished = true; assisted = !!gaveUp;
      btnCheck.disabled = true; if (btnHint) btnHint.disabled = true; btnWorked.hidden = true;
      card.classList.add('done');
      var res = { misses: misses, hints: hintsShown, assisted: assisted, clean: !assisted && misses === 0 && hintsShown === 0, traps: trapsHit.slice(), answers: answers(), gaveUp: !!gaveUp };
      ctl.result = res;
      if (opt.onDone) opt.onDone(res);
    }
    function showWorked() {
      if (!q.worked) return;
      workedBox.hidden = false;
      workedBox.innerHTML = '<p class="qlabel">Worked solution</p>' + rich(q.worked);
    }
    function check() {
      if (finished) return;
      var allOk = true, errMsg = null, wrongIds = [], trap = null;
      q.fields.forEach(function (f) {
        var rec = ctl.fields[f.id];
        if (rec.done) return;
        var val = rec.get(), g = gradeField(f, val);
        if (g.err && f.type !== 'mc') { errMsg = errMsg || g.err; allOk = false; if (rec.input) rec.input.classList.add('bad'); return; }
        if (g.err) { errMsg = errMsg || g.err; allOk = false; return; }
        if (g.ok) {
          rec.done = true; rec.lock(true);
          if (rec.input) rec.input.classList.add('ok');
          if (rec.markEl) { rec.markEl.textContent = '✓'; rec.markEl.className = 'mark ok'; }
        } else {
          allOk = false; wrongIds.push(f.id);
          if (rec.input) rec.input.classList.add('bad');
          if (rec.markEl) { rec.markEl.textContent = '✗'; rec.markEl.className = 'mark bad'; }
          trap = trap || trapMessage(f, val);
        }
      });
      if (errMsg && !wrongIds.length) { showFb('bad', '<p>' + esc(errMsg) + '</p><p class="muted">That is a format problem, so it does not count as a miss.</p>'); return; }
      if (allOk) {
        showFb('ok', rich((q.good || 'Correct.') + (q.why ? '\n\n' + q.why : '')));
        finish(false); return;
      }
      misses++;
      if (trap) trapsHit.push(trap);
      var msg = trap ? '<p>' + inline(trap) + '</p>' : '<p>Not yet. The marked fields are off.</p>';
      if (errMsg) msg += '<p>' + esc(errMsg) + '</p>';
      if (opt.maxTries && misses >= opt.maxTries) {
        showFb('bad', msg + '<p>That is two tries. Here is the solution so you can see the path.</p>');
        showWorked(); finish(true); return;
      }
      showFb('bad', msg);
      if (!opt.noHints) nextHint();
      if (misses >= 3 && q.worked && !opt.noWorked) btnWorked.hidden = false;
    }
    btnCheck.onclick = check;
    if (btnHint) btnHint.onclick = function () { if (!nextHint()) showFb('info', '<p>That is every hint. Try the worked solution if you are stuck.</p>'); if (q.worked && !opt.noWorked) btnWorked.hidden = misses < 1 && hintsShown < (q.hints || []).length; };
    btnWorked.onclick = function () { showWorked(); showFb('info', '<p>Read it, then keep going. This one counts as assisted.</p>'); finish(true); };

    ctl.autofill = function (correct) {
      q.fields.forEach(function (f) {
        var rec = ctl.fields[f.id];
        if (rec.done) return;
        if (f.type === 'mc') rec.set(correct === false ? String((f.ans + 1) % f.choices.length) : String(f.ans));
        else if (f.type === 'text') rec.set(f.sample || 'Because the corner area shrinks with the square of the time step.');
        else rec.set(correct === false ? '0' : String(f.answer));
      });
    };
    ctl.check = check;
    host.appendChild(card);
    return ctl;
  }

  root.QKIT = { rich: rich, inline: inline, tex: tex, esc: esc, mix: mix, perm: perm, render: render, gradeField: gradeField, el: el };
})(typeof window !== 'undefined' ? window : globalThis);
