/* MrD.keypad: a small, restrained on-screen keypad under an answer box (think NumWorks, not a full calculator).
   It only types into the box the student can also type into; there is no calculator mode to learn.

   MrD.keypad.attach(input, opts) -> { el, destroy }
     opts.mode    "number"  digits, decimal point, minus, back (default)
                  "math"    a short row for expressions: fraction, power, root, pi, parentheses, times, divide, back
                  "text"    nothing is drawn (a plain box)
     opts.keys    override the math row: names from MrD.keypad.KEYS
     opts.after   node to draw the keypad after (default: the input itself)
     opts.onInput(value)  called after every key press, so a preview can redraw
   Insert logic is exported as MrD.keypad.insert(value, start, end, key) for unit tests: { value, caret }. */
(function () {
  "use strict";
  var root = typeof window !== "undefined" ? window : globalThis;
  var MrD = (root.MrD = root.MrD || {});

  var KEYS = {
    frac: { t: "a⁄b", label: "fraction", ins: "()/()", caret: 1 },        // caret lands inside the first ()
    pow: { t: "xⁿ", label: "power", ins: "^()", caret: 2 },
    sqrt: { t: "√", label: "square root", ins: "sqrt()", caret: 5 },
    pi: { t: "π", label: "pi", ins: "pi" },
    lp: { t: "(", label: "open parenthesis", ins: "(" }, rp: { t: ")", label: "close parenthesis", ins: ")" },
    mul: { t: "×", label: "times", ins: "*" }, div: { t: "÷", label: "divide", ins: "/" },
    plus: { t: "+", label: "plus", ins: "+" }, minus: { t: "−", label: "minus", ins: "-" },
    dot: { t: ".", label: "decimal point", ins: "." }, back: { t: "⌫", label: "delete", back: true }
  };
  for (var d = 0; d < 10; d++) KEYS["d" + d] = { t: String(d), label: String(d), ins: String(d) };
  var NUMBER = [["d7", "d8", "d9"], ["d4", "d5", "d6"], ["d1", "d2", "d3"], ["minus", "d0", "dot"], ["back"]];
  var MATH = [["frac", "pow", "sqrt", "pi", "lp", "rp", "mul", "div", "back"]];

  function insert(value, start, end, key) {
    var k = typeof key === "string" ? KEYS[key] : key, s = start == null ? value.length : start, e = end == null ? s : end;
    if (!k) return { value: value, caret: s };
    if (k.back) {
      if (s !== e) return { value: value.slice(0, s) + value.slice(e), caret: s };
      return s > 0 ? { value: value.slice(0, s - 1) + value.slice(e), caret: s - 1 } : { value: value, caret: 0 };
    }
    return { value: value.slice(0, s) + k.ins + value.slice(e), caret: s + (k.caret != null ? k.caret : k.ins.length) };
  }

  var css = ".mrd-kp{display:inline-flex;flex-direction:column;gap:4px;margin:6px 0;user-select:none}" +
    ".mrd-kp .r{display:flex;gap:4px;flex-wrap:wrap}" +
    ".mrd-kp button{min-width:42px;height:38px;padding:0 8px;font:600 16px system-ui,sans-serif;color:#1c2530;background:#eef1f5;border:1px solid #c5ccd6;border-radius:7px;cursor:pointer}" +
    ".mrd-kp button:hover{background:#e1e6ed}.mrd-kp button:active{background:#d3dae4}.mrd-kp button.back{color:#7a1f12}" +
    ".mrd-kp.num .r{max-width:150px}";
  var styled = false;
  function addCss() { if (styled || typeof document === "undefined") return; var s = document.createElement("style"); s.textContent = css; document.head.appendChild(s); styled = true; }

  function attach(input, o) {
    o = o || {};
    var mode = o.mode || "number";
    if (mode === "number") { input.setAttribute("inputmode", "decimal"); }
    if (mode === "text") return { el: null, destroy: function () {} };
    addCss();
    var rows = mode === "math" ? (o.keys ? [o.keys] : MATH) : NUMBER;
    var box = document.createElement("div"); box.className = "mrd-kp " + (mode === "math" ? "math" : "num"); box.setAttribute("role", "group"); box.setAttribute("aria-label", "answer keypad");
    rows.forEach(function (row) {
      var r = document.createElement("div"); r.className = "r";
      row.forEach(function (name) {
        var k = KEYS[name]; if (!k) return;
        var b = document.createElement("button"); b.type = "button"; b.textContent = k.t; b.setAttribute("aria-label", k.label);
        if (k.back) b.className = "back";
        b.addEventListener("mousedown", function (ev) { ev.preventDefault(); });      // keep focus and caret in the box
        b.addEventListener("click", function () {
          var res = insert(input.value, input.selectionStart, input.selectionEnd, name);
          input.value = res.value; input.focus(); try { input.setSelectionRange(res.caret, res.caret); } catch (e) {}
          input.dispatchEvent(new Event("input", { bubbles: true }));
          if (o.onInput) o.onInput(input.value);
        });
        r.appendChild(b);
      });
      box.appendChild(r);
    });
    var ref = o.after || input; if (ref.parentNode) ref.parentNode.insertBefore(box, ref.nextSibling);
    return { el: box, destroy: function () { if (box.parentNode) box.parentNode.removeChild(box); } };
  }

  MrD.keypad = { KEYS: KEYS, NUMBER: NUMBER, MATH: MATH, insert: insert, attach: attach };
  if (typeof module !== "undefined" && module.exports) module.exports = MrD.keypad;
})();
