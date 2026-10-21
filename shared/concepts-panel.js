/* MrD.concepts: the "Concepts" button every lesson has, a short reference students can open any time.

   MrD.concepts.mount(host, list, opts)
     host   element to put the button in (topbar)
     list   [{ title:"Net force", points:["Add all the forces.", "Signs show direction."], eq:"a = F / m" }]   points are one short line each
     opts.course  "physics" | "chem" | "calc"  (colors only)
   Opens a side panel; Esc or the Close button shuts it. Keep every point to one sentence. No paragraphs. */
(function () {
  "use strict";
  var root = typeof window !== "undefined" ? window : globalThis;
  var MrD = (root.MrD = root.MrD || {});
  var css = ".cp-btn{font:600 .95rem system-ui,sans-serif;padding:8px 15px;border-radius:6px;border:1px solid #cbd6e0;background:#fff;color:#142230;cursor:pointer}" +
    ".cp-panel{position:fixed;top:0;right:0;bottom:0;width:min(360px,92vw);z-index:90;background:#fff;color:#142230;border-left:2px solid #2b4fd9;box-shadow:-8px 0 24px rgba(0,0,0,.2);padding:14px 16px;overflow:auto;font:16px/1.45 system-ui,sans-serif}" +
    ".cp-panel[hidden]{display:none}.cp-panel h2{margin:0 0 8px;font-size:1.15rem}.cp-panel h3{margin:14px 0 2px;font-size:1rem}.cp-panel ul{margin:2px 0 2px 1.1rem;padding:0}" +
    ".cp-panel .eq{font:600 1rem ui-monospace,Menlo,Consolas,monospace;background:#eef2f6;border-radius:5px;padding:2px 8px;display:inline-block;margin-top:2px}";
  function mount(host, list, o) {
    if (!host || !list || !list.length) return null;
    if (!document.getElementById("cp-style")) { var s = document.createElement("style"); s.id = "cp-style"; s.textContent = css; document.head.appendChild(s); }
    var b = document.createElement("button"); b.type = "button"; b.className = "cp-btn"; b.textContent = "Concepts"; b.setAttribute("aria-haspopup", "dialog");
    var p = document.createElement("aside"); p.className = "cp-panel"; p.hidden = true; p.setAttribute("role", "dialog"); p.setAttribute("aria-label", "Concepts");
    var h = document.createElement("h2"); h.textContent = "Concepts"; p.appendChild(h);
    list.forEach(function (c) {
      var t = document.createElement("h3"); t.textContent = c.title; p.appendChild(t);
      if (c.points && c.points.length) { var ul = document.createElement("ul"); c.points.forEach(function (x) { var li = document.createElement("li"); li.textContent = x; ul.appendChild(li); }); p.appendChild(ul); }
      if (c.eq) { var e = document.createElement("span"); e.className = "eq"; e.textContent = c.eq; p.appendChild(e); }
    });
    var x = document.createElement("button"); x.type = "button"; x.className = "cp-btn"; x.textContent = "Close"; x.style.marginTop = "14px"; p.appendChild(x);
    function set(v) { p.hidden = !v; b.setAttribute("aria-expanded", String(v)); if (v) x.focus(); else b.focus(); }
    b.onclick = function () { set(p.hidden); }; x.onclick = function () { set(false); };
    document.addEventListener("keydown", function (ev) { if (ev.key === "Escape" && !p.hidden) set(false); });
    host.appendChild(b); document.body.appendChild(p);
    return { button: b, panel: p, open: function () { set(true); }, close: function () { set(false); } };
  }
  MrD.concepts = { mount: mount };
  if (typeof module !== "undefined" && module.exports) module.exports = MrD.concepts;
})();
