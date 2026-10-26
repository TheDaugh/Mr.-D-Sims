/* MrD.concepts: the "Concepts" button every lesson has, a short reference students can open any time.

   MrD.concepts.mount(host, list, opts)
     host   element to put the button in (topbar)
     list   [{ title:"Net force", points:["Add all the forces.", "Signs show direction."], eq:"a = F / m" }]   points are one short line each
     opts.course  "physics" | "chem" | "calc" | "stats"  (colors only)
     opts.tabs    [{ title, build(container) }]  extra tabs after the concept list (stats uses Table, Routine, Example). build runs the first time the tab opens.
   Opens a side panel; Esc or the Close button shuts it. Keep every point to one sentence. No paragraphs. */
(function () {
  "use strict";
  var root = typeof window !== "undefined" ? window : globalThis;
  var MrD = (root.MrD = root.MrD || {});
  var css = ".cp-btn{font:600 .95rem system-ui,sans-serif;padding:8px 15px;border-radius:6px;border:1px solid #cbd6e0;background:#fff;color:#142230;cursor:pointer}" +
    ".cp-panel{position:fixed;top:0;right:0;bottom:0;width:min(360px,92vw);z-index:90;background:#fff;color:#142230;border-left:2px solid #2b4fd9;box-shadow:-8px 0 24px rgba(0,0,0,.2);padding:14px 16px;overflow:auto;font:16px/1.45 system-ui,sans-serif}" +
    ".cp-panel[hidden]{display:none}.cp-panel h2{margin:0 0 8px;font-size:1.15rem}.cp-panel h3{margin:14px 0 2px;font-size:1rem}.cp-panel ul{margin:2px 0 2px 1.1rem;padding:0}" +
    ".cp-panel.cp-wide{width:min(560px,96vw)}.cp-tabs{display:flex;gap:4px;margin:0 0 10px;flex-wrap:wrap}.cp-tab{font:600 .9rem system-ui,sans-serif;padding:6px 12px;border-radius:999px;border:1px solid #cbd6e0;background:#fff;color:#142230;cursor:pointer}.cp-tab[aria-selected=true]{background:#2b4fd9;border-color:#2b4fd9;color:#fff}" +
    ".cp-panel .eq{font:600 1rem ui-monospace,Menlo,Consolas,monospace;background:#eef2f6;border-radius:5px;padding:2px 8px;display:inline-block;margin-top:2px}";
  function mount(host, list, o) {
    if (!host || !list || !list.length) return null;
    if (!document.getElementById("cp-style")) { var s = document.createElement("style"); s.id = "cp-style"; s.textContent = css; document.head.appendChild(s); }
    var b = document.createElement("button"); b.type = "button"; b.className = "cp-btn"; b.textContent = "Concepts"; b.setAttribute("aria-haspopup", "dialog");
    var p = document.createElement("aside"); p.className = "cp-panel"; p.hidden = true; p.setAttribute("role", "dialog"); p.setAttribute("aria-label", "Concepts");
    var h = document.createElement("h2"); h.textContent = "Concepts"; p.appendChild(h);
    var tabs = (o && o.tabs) || [], bar = null, views = [], body = p;
    if (tabs.length) {
      p.className += " cp-wide"; bar = document.createElement("div"); bar.className = "cp-tabs"; bar.setAttribute("role", "tablist"); p.appendChild(bar);
      body = document.createElement("div"); views.push(body); p.appendChild(body);
    }
    list.forEach(function (c) {
      var t = document.createElement("h3"); t.textContent = c.title; p.appendChild(t);
      if (c.points && c.points.length) { var ul = document.createElement("ul"); c.points.forEach(function (x) { var li = document.createElement("li"); li.textContent = x; ul.appendChild(li); }); p.appendChild(ul); }
      if (c.eq) { var e = document.createElement("span"); e.className = "eq"; e.textContent = c.eq; p.appendChild(e); }
    });
    if (tabs.length) {   // the concept list above was appended to the panel; move it into the first view
      Array.prototype.slice.call(p.children).forEach(function (n) { if (n !== bar && n !== body && n !== h) body.appendChild(n); });
      var btns = [], all = [{ title: "Concepts" }].concat(tabs);
      tabs.forEach(function () { var v = document.createElement("div"); v.hidden = true; views.push(v); p.appendChild(v); });
      all.forEach(function (t, i) {
        var tb = document.createElement("button"); tb.type = "button"; tb.setAttribute("role", "tab"); tb.className = "cp-tab"; tb.textContent = t.title; btns.push(tb); bar.appendChild(tb);
        tb.onclick = function () {
          views.forEach(function (v, j) { v.hidden = j !== i; btns[j].setAttribute("aria-selected", String(j === i)); });
          if (i > 0 && !views[i].dataset.built) { views[i].dataset.built = "1"; tabs[i - 1].build(views[i]); }
        };
      });
      btns[0].setAttribute("aria-selected", "true");
    }
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
