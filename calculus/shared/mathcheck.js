/* mathcheck.js
   Typed-answer checking for the calculus lessons.
   - parse(): student text -> syntax tree (implicit multiplication, ^, sin cos tan ln exp sqrt abs, e, pi)
   - evaluate(): tree + variable values -> number
   - equivalent(): does the typed expression equal the target at many sample points?
   - toLatex(): tree -> LaTeX, so the page can show what the computer read
   Nothing here uses eval. Loaded by the lesson pages and the teacher page. */
(function (root) {
  'use strict';

  var FUNCS = { sin: Math.sin, cos: Math.cos, tan: Math.tan, ln: Math.log, exp: Math.exp, sqrt: Math.sqrt, abs: Math.abs };
  var FUNC_NAMES = ['sqrt', 'sin', 'cos', 'tan', 'exp', 'abs', 'ln'];

  function MathError(code, message, extra) {
    this.code = code; this.message = message; this.extra = extra || null;
  }
  MathError.prototype = Object.create(Error.prototype);

  /* ---------- tokenizer ---------- */
  var SUP = { '⁰': '0', '¹': '1', '²': '2', '³': '3', '⁴': '4', '⁵': '5', '⁶': '6', '⁷': '7', '⁸': '8', '⁹': '9' };

  function normalizeText(src) {
    var s = String(src == null ? '' : src);
    s = s.replace(/[−–—]/g, '-')
         .replace(/[·×∗⋅]/g, '*')
         .replace(/÷/g, '/')
         .replace(/π/g, 'pi')
         .replace(/√/g, 'sqrt')
         .replace(/−/g, '-')
         .replace(/[   ]/g, ' ')
         .replace(/\[/g, '(').replace(/\]/g, ')')
         .replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹]+/g, function (m) { return '^' + m.split('').map(function (c) { return SUP[c]; }).join(''); });
    return s;
  }

  function tokenize(src, vars) {
    var s = normalizeText(src).toLowerCase();
    var allowed = {};
    (vars || []).forEach(function (v) { allowed[String(v).toLowerCase()] = true; });
    var toks = [], i = 0, m;
    while (i < s.length) {
      var c = s.charAt(i);
      if (c === ' ' || c === '\t' || c === '\n') { i++; continue; }
      if ((m = /^(\d+(\.\d*)?|\.\d+)/.exec(s.slice(i)))) {
        toks.push({ k: 'num', v: parseFloat(m[1]) }); i += m[1].length; continue;
      }
      if (/[a-z]/.test(c)) {
        var rest = s.slice(i), hit = null;
        for (var j = 0; j < FUNC_NAMES.length; j++) {
          if (rest.indexOf(FUNC_NAMES[j]) === 0) { hit = FUNC_NAMES[j]; break; }
        }
        if (hit) { toks.push({ k: 'fn', v: hit }); i += hit.length; continue; }
        if (rest.indexOf('pi') === 0 && !allowed.p) { toks.push({ k: 'const', v: 'pi' }); i += 2; continue; }
        if (rest.indexOf('log') === 0) throw new MathError('log', 'Write ln for the natural logarithm.');
        if (c === 'e' && !allowed.e) { toks.push({ k: 'const', v: 'e' }); i++; continue; }
        if (allowed[c]) { toks.push({ k: 'var', v: c }); i++; continue; }
        throw new MathError('unknown', 'I do not recognize the symbol "' + c + '".', c);
      }
      if ('+-*/^'.indexOf(c) >= 0) { toks.push({ k: 'op', v: c }); i++; continue; }
      if (c === '(') { toks.push({ k: 'lp' }); i++; continue; }
      if (c === ')') { toks.push({ k: 'rp' }); i++; continue; }
      if (c === '=' || c === ',' || c === "'" || c === '′') throw new MathError('badchar', 'Type just the expression. Leave out "' + c + '".', c);
      throw new MathError('badchar', 'I do not recognize the character "' + c + '".', c);
    }
    return toks;
  }

  /* ---------- parser ---------- */
  function parse(src, vars) {
    var toks = tokenize(src, vars), i = 0;
    if (!toks.length) throw new MathError('empty', 'Type an answer first.');
    function peek() { return toks[i]; }
    function next() { return toks[i++]; }
    function startsPrimary(t) { return !!t && (t.k === 'num' || t.k === 'var' || t.k === 'const' || t.k === 'fn' || t.k === 'lp'); }

    function parseExpr() {
      var a = parseTerm();
      while (peek() && peek().k === 'op' && (peek().v === '+' || peek().v === '-')) {
        var op = next().v, b = parseTerm();
        a = { t: 'bin', op: op, a: a, b: b };
      }
      return a;
    }
    function parseTerm() {
      var a = parseUnary();
      for (;;) {
        var p = peek();
        if (p && p.k === 'op' && (p.v === '*' || p.v === '/')) {
          next();
          var b = parseUnary();
          a = { t: 'bin', op: p.v, a: a, b: b };
        } else if (startsPrimary(p)) {
          if (p.k === 'num' && a.t === 'num') throw new MathError('numnum', 'Put an operator between the two numbers.');
          var b2 = parsePower();
          a = { t: 'bin', op: '*', a: a, b: b2, implicit: true };
        } else break;
      }
      return a;
    }
    function parseUnary() {
      var p = peek();
      if (p && p.k === 'op' && p.v === '-') { next(); return { t: 'neg', a: parseUnary() }; }
      if (p && p.k === 'op' && p.v === '+') { next(); return parseUnary(); }
      return parsePower();
    }
    function parsePower() {
      var base = parsePrimary();
      var p = peek();
      if (p && p.k === 'op' && p.v === '^') {
        next();
        return { t: 'bin', op: '^', a: base, b: parsePowerRHS() };
      }
      return base;
    }
    function parsePowerRHS() {
      var p = peek();
      if (p && p.k === 'op' && p.v === '-') { next(); return { t: 'neg', a: parsePowerRHS() }; }
      if (p && p.k === 'op' && p.v === '+') { next(); return parsePowerRHS(); }
      return parsePower();
    }
    function parsePrimary() {
      var t = next();
      if (!t) throw new MathError('incomplete', 'The expression ends too soon. Something is missing at the end.');
      if (t.k === 'num') return { t: 'num', v: t.v };
      if (t.k === 'const') return { t: 'const', n: t.v };
      if (t.k === 'var') return { t: 'var', n: t.v };
      if (t.k === 'lp') {
        var e = parseExpr();
        var r = next();
        if (!r || r.k !== 'rp') throw new MathError('paren', 'A parenthesis is not closed.');
        return e;
      }
      if (t.k === 'fn') {
        var nx = peek(), arg;
        if (nx && nx.k === 'lp') {
          next(); arg = parseExpr();
          var rp = next();
          if (!rp || rp.k !== 'rp') throw new MathError('paren', 'A parenthesis is not closed.');
        } else if (startsPrimary(nx) && nx.k !== 'fn') {
          arg = parsePower();
        } else if (nx && nx.k === 'fn') {
          arg = parsePrimary();
        } else {
          throw new MathError('fnarg', t.v + ' needs an input, like ' + t.v + '(x).');
        }
        return { t: 'fn', n: t.v, a: arg };
      }
      if (t.k === 'rp') throw new MathError('paren', 'There is a closing parenthesis with no opening one.');
      throw new MathError('syntax', 'I cannot read "' + (t.v === undefined ? '' : t.v) + '" there.');
    }

    var tree = parseExpr();
    if (i < toks.length) {
      var bad = toks[i];
      if (bad.k === 'rp') throw new MathError('paren', 'There is a closing parenthesis with no opening one.');
      throw new MathError('syntax', 'I cannot read the end of the expression.');
    }
    return tree;
  }

  /* ---------- evaluation ---------- */
  function evaluate(n, env) {
    switch (n.t) {
      case 'num': return n.v;
      case 'const': return n.n === 'e' ? Math.E : Math.PI;
      case 'var':
        if (env[n.n] === undefined) throw new MathError('noval', 'No value for ' + n.n);
        return env[n.n];
      case 'neg': return -evaluate(n.a, env);
      case 'bin': {
        var a = evaluate(n.a, env), b = evaluate(n.b, env);
        switch (n.op) {
          case '+': return a + b;
          case '-': return a - b;
          case '*': return a * b;
          case '/': return a / b;
          default: return Math.pow(a, b);
        }
      }
      default: return FUNCS[n.n](evaluate(n.a, env));
    }
  }

  /* ---------- sampling and equivalence ---------- */
  function rng(seed) {
    var a = seed >>> 0;
    return function () {
      a = (a + 0x6D2B79F5) >>> 0;
      var t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function samplePoints(vars, domain, n) {
    var r = rng(20261019), pts = [];
    for (var k = 0; k < n; k++) {
      var env = {};
      vars.forEach(function (v) {
        var d = (domain && domain[v]) || [0.6, 3.2];
        env[v] = d[0] + (d[1] - d[0]) * r();
      });
      pts.push(env);
    }
    return pts;
  }
  function close(a, b) { return isFinite(a) && isFinite(b) && Math.abs(a - b) <= 1e-6 * (1 + Math.abs(b)); }

  /* Compare a typed expression with a target expression. opts: { vars, domain, scale } */
  function equivalent(studentSrc, targetSrc, opts) {
    opts = opts || {};
    var vars = opts.vars || ['x'];
    var sTree = parse(studentSrc, vars);
    var tTree = parse(targetSrc, vars);
    var pts = samplePoints(vars, opts.domain, 9), good = 0, ratio = null, scaled = true;
    for (var i = 0; i < pts.length; i++) {
      var t = evaluate(tTree, pts[i]);
      if (!isFinite(t)) continue;
      var s = evaluate(sTree, pts[i]);
      if (!close(s, t)) { if (!opts.scale) return { ok: false, tree: sTree }; }
      if (opts.scale) {
        if (!isFinite(s) || Math.abs(t) < 1e-9) { scaled = false; continue; }
        var q = s / t;
        if (ratio === null) ratio = q; else if (Math.abs(q - ratio) > 1e-6 * (1 + Math.abs(ratio))) scaled = false;
      }
      good++;
    }
    if (good < 4) throw new MathError('domain', 'This expression cannot be tested at the sample values.');
    if (opts.scale) return { ok: scaled && ratio !== null && Math.abs(ratio) > 1e-9, tree: sTree };
    return { ok: true, tree: sTree };
  }

  /* Number entry. Accepts 12, -4.5, 3/2, 2e, 3e+1/e, -pi^2, 25%. Returns a number. */
  function numberValue(src) {
    var s = String(src == null ? '' : src).replace(/[$,]/g, '').replace(/%\s*$/, '');
    var tree = parse(s, []);
    var v = evaluate(tree, {});
    if (!isFinite(v)) throw new MathError('domain', 'That is not a number I can use.');
    return v;
  }
  function numberClose(value, target, tol) {
    var t = tol === undefined ? Math.max(1e-6, Math.abs(target) * 1e-6) : tol;
    return Math.abs(value - target) <= t;
  }

  /* ---------- LaTeX ---------- */
  function numTex(v) {
    if (Math.abs(v) >= 1e15 || (Math.abs(v) < 1e-6 && v !== 0)) return String(v);
    var s = String(+v.toFixed(10));
    return s;
  }
  function needsParensInProduct(n) {
    return n.t === 'neg' || (n.t === 'bin' && (n.op === '+' || n.op === '-'));
  }
  function tex(n) {
    switch (n.t) {
      case 'num': return numTex(n.v);
      case 'const': return n.n === 'e' ? 'e' : '\\pi';
      case 'var': return n.n;
      case 'neg': {
        var inner = tex(n.a);
        if (n.a.t === 'bin' && (n.a.op === '+' || n.a.op === '-')) inner = '\\left(' + inner + '\\right)';
        return '-' + inner;
      }
      case 'fn':
        if (n.n === 'sqrt') return '\\sqrt{' + tex(n.a) + '}';
        if (n.n === 'exp') return 'e^{' + tex(n.a) + '}';
        if (n.n === 'abs') return '\\left|' + tex(n.a) + '\\right|';
        return '\\' + n.n + '\\left(' + tex(n.a) + '\\right)';
      case 'bin': {
        var a = n.a, b = n.b;
        if (n.op === '/') return '\\frac{' + tex(a) + '}{' + tex(b) + '}';
        if (n.op === '^') {
          var base = tex(a);
          if (a.t === 'bin' || a.t === 'neg' || a.t === 'fn' || (a.t === 'num' && a.v < 0)) base = '\\left(' + base + '\\right)';
          return base + '^{' + tex(b) + '}';
        }
        if (n.op === '+') {
          if (b.t === 'neg') {
            var nb = tex(b.a);
            if (b.a.t === 'bin' && (b.a.op === '+' || b.a.op === '-')) nb = '\\left(' + nb + '\\right)';
            return tex(a) + ' - ' + nb;
          }
          return tex(a) + ' + ' + tex(b);
        }
        if (n.op === '-') {
          var rb = tex(b);
          if (b.t === 'bin' && (b.op === '+' || b.op === '-')) rb = '\\left(' + rb + '\\right)';
          if (b.t === 'neg') rb = '\\left(' + rb + '\\right)';
          return tex(a) + ' - ' + rb;
        }
        // product
        var la = tex(a), lb = tex(b);
        var pa = needsParensInProduct(a), pb = needsParensInProduct(b);
        if (pa) la = '\\left(' + la + '\\right)';
        if (pb) lb = '\\left(' + lb + '\\right)';
        var juxtapose = (a.t === 'num' && b.t !== 'num') || b.t === 'fn' || pa || pb;
        if (a.t === 'num' && b.t === 'num') juxtapose = false;
        if (b.t === 'bin' && b.op === '^' && b.a.t === 'num') juxtapose = false;
        if (a.t === 'num' && b.t === 'bin' && b.op === '/') juxtapose = true;
        return la + (juxtapose ? ' ' : ' \\cdot ') + lb;
      }
    }
    return '';
  }
  function toLatex(src, vars) {
    var tree = typeof src === 'string' ? parse(src, vars || ['x']) : src;
    return tex(tree);
  }

  /* ---------- LaTeX text escaping (for the .tex export) ---------- */
  function texEscape(s) {
    return String(s == null ? '' : s)
      .replace(/\\/g, '\\textbackslash{}')
      .replace(/([&%$#_{}])/g, '\\$1')
      .replace(/~/g, '\\textasciitilde{}')
      .replace(/\^/g, '\\textasciicircum{}')
      .replace(/′/g, "'")
      .replace(/[‘’]/g, "'")
      .replace(/[“”]/g, '"')
      .replace(/−/g, '-')
      .replace(/·/g, '\\textperiodcentered{}')
      .replace(/Δ/g, '$\\Delta$')
      .replace(/[^\x00-\x7e]/g, '?')
      .replace(/\r?\n/g, '\\\\\n');
  }

  root.MC = {
    MathError: MathError, parse: parse, evaluate: evaluate, equivalent: equivalent,
    numberValue: numberValue, numberClose: numberClose, toLatex: toLatex, texEscape: texEscape,
    rng: rng, samplePoints: samplePoints
  };
})(typeof window !== 'undefined' ? window : globalThis);
