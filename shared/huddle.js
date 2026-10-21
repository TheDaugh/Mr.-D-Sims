/* MrD.huddle: the formalizing tab. Mr. D talks, the student writes on the page, the key and PDF come from the same spec.

   One spec, same shape in every course:
     { defs:    [{ term:"net force", text:"The [[vector sum]] of all forces on an object." }],
       example: { prompt:"A 2 kg cart is pushed with 6 N.", steps:["a = F / m", "a = 6 / 2 = [[3]] m/s²"] },
       label:   { title:"Label what you saw", html:"<svg>…</svg>", tags:[{ n:1, text:"[[force from the fan]]" }] } }
   Text between [[ ]] becomes a blank the student fills in while Mr. D teaches. Short blanks only (a word, a number, a unit).
   Nothing here is graded and nothing blocks. Press "Check mine" to see which blanks match; a student can always type their own.

   MrD.huddle.render(host, spec, store, opts)   draw it. store is a plain object the caller saves; opts.key shows the answers
   MrD.huddle.parse(text)                       [{ t:"text" } | { b:"answer" }, ...]   (unit tested)
   MrD.huddle.plain(spec, withAnswers)          { defs:[string], example:[string], tags:[string] } for notes and keys */
(function () {
  "use strict";
  var root = typeof window !== "undefined" ? window : globalThis;
  var MrD = (root.MrD = root.MrD || {});

  function parse(text) {
    var out = [], re = /\[\[(.+?)\]\]/g, last = 0, m, s = String(text == null ? "" : text);
    while ((m = re.exec(s))) { if (m.index > last) out.push({ t: s.slice(last, m.index) }); out.push({ b: m[1] }); last = re.lastIndex; }
    if (last < s.length) out.push({ t: s.slice(last) });
    return out;
  }
  function norm(s) { return String(s).toLowerCase().replace(/[−–]/g, "-").replace(/\s+/g, " ").trim().replace(/[.,]$/, ""); }
  function plainLine(text, withAnswers) { return parse(text).map(function (p) { return p.t != null ? p.t : (withAnswers ? p.b : "________"); }).join(""); }
  function plain(spec, withAnswers) {
    var tags = (spec.label && spec.label.tags) || [];
    return {
      defs: (spec.defs || []).map(function (d) { return (d.term ? d.term + ": " : "") + plainLine(d.text, withAnswers); }),
      example: spec.example ? [spec.example.prompt].concat((spec.example.steps || []).map(function (s) { return plainLine(s, withAnswers); })) : [],
      tags: tags.map(function (t) { return t.n + ". " + plainLine(t.text, withAnswers); })
    };
  }

  var css = ".hd-sec{margin:14px 0 0}.hd-sec h3{margin:0 0 6px}.hd-line{margin:.45rem 0;line-height:2.1}" +
    ".hd-line input{font:600 1rem inherit;border:0;border-bottom:2px solid #7a8a99;background:transparent;color:inherit;text-align:center;padding:0 4px;margin:0 3px;min-width:3.5em}" +
    ".hd-line input:focus{outline:0;border-bottom-color:#2b4fd9}.hd-line input.ok{border-bottom-color:#1c7d4a;color:#1c7d4a}.hd-line input.no{border-bottom-color:#b3412e}" +
    ".hd-line input.keyed{background:rgba(183,121,31,.18)}.hd-fig{max-width:520px}.hd-fig svg{width:100%;height:auto}" +
    ".hd-ex{border-left:4px solid #2b4fd9;padding:2px 0 2px 12px}.hd-tag b{display:inline-block;min-width:1.6em}";
  var styled = false;
  function addCss() { if (styled || typeof document === "undefined") return; var s = document.createElement("style"); s.textContent = css; document.head.appendChild(s); styled = true; }

  function render(host, spec, store, o) {
    o = o || {}; addCss(); store = store || {};
    var inputs = [], keyOn = !!o.key;
    function line(text, id0, cls, lead) {
      var p = document.createElement("p"); p.className = "hd-line " + (cls || "");
      if (lead) p.appendChild(document.createTextNode(lead));
      parse(text).forEach(function (part, i) {
        if (part.t != null) { p.appendChild(document.createTextNode(part.t)); return; }
        var id = id0 + "." + i, inp = document.createElement("input");
        inp.type = "text"; inp.autocomplete = "off"; inp.spellcheck = false; inp.setAttribute("aria-label", "blank"); inp.value = store[id] || "";
        inp.size = Math.max(5, Math.min(18, part.b.length + 2));
        if (keyOn) { inp.placeholder = part.b; inp.classList.add("keyed"); }
        inp.addEventListener("input", function () { store[id] = inp.value; inp.classList.remove("ok", "no"); if (o.onChange) o.onChange(store); });
        inputs.push({ el: inp, ans: part.b }); p.appendChild(inp);
      });
      return p;
    }
    function section(title) { var s = document.createElement("div"); s.className = "hd-sec"; var h = document.createElement("h3"); h.textContent = title; s.appendChild(h); host.appendChild(s); return s; }

    if (spec.defs && spec.defs.length) {
      var sd = section("Definitions");
      spec.defs.forEach(function (d, i) { sd.appendChild(line(d.text, "d" + i, "", d.term ? d.term + ": " : "")); });
    }
    if (spec.example) {
      var se = section("Worked example"), ex = document.createElement("div"); ex.className = "hd-ex"; se.appendChild(ex);
      var pr = document.createElement("p"); pr.innerHTML = spec.example.prompt; ex.appendChild(pr);
      (spec.example.steps || []).forEach(function (s, i) { ex.appendChild(line(s, "e" + i)); });
    }
    if (spec.label) {
      var sl = section(spec.label.title || "Label it");
      if (spec.label.html) { var f = document.createElement("div"); f.className = "hd-fig"; f.innerHTML = spec.label.html; sl.appendChild(f); }
      (spec.label.tags || []).forEach(function (t, i) { sl.appendChild(line(t.text, "t" + i, "hd-tag", t.n + ". ")); });
    }
    var row = document.createElement("div"); row.className = "row";
    var chk = document.createElement("button"); chk.type = "button"; chk.className = "btn small"; chk.textContent = "Check mine";
    chk.onclick = function () { inputs.forEach(function (x) { if (!x.el.value.trim()) { x.el.classList.remove("ok", "no"); return; } var good = norm(x.el.value) === norm(x.ans); x.el.classList.toggle("ok", good); x.el.classList.toggle("no", !good); }); };
    row.appendChild(chk); host.appendChild(row);
    return { inputs: inputs };
  }

  MrD.huddle = { parse: parse, plain: plain, render: render, norm: norm };
  if (typeof module !== "undefined" && module.exports) module.exports = MrD.huddle;
})();
