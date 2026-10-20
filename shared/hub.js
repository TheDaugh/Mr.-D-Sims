/* MrD.hub: draws a course hub. Full screen, one row per unit, tabs for Lessons / Virtual labs / Sims.

   Each course's data file (sims.js, labs.js) sets window.UNITS = [ { id, title, blurb, entries:[...] } ].
   An entry is { title, href, blurb, tags, type, icon, teacher:[{label,href}] }.
     type   "lesson" (a guided lesson), "lab" (a virtual lab) or "sim" (a free-play simulation). Missing means "sim".
   (A unit may call its list sims or labs instead of entries; both work.)

   To add something: build the page in its unit folder, add one entry to the data file. Nothing else changes.

   MrD.hub({ course:"physics", title:"Physics", tagline:"...", accent:"#4f8cff", units:window.UNITS,
             teacher:"lessons/teacher.html", root:"../" })       root = path from this page back to the repo root */
(function () {
  "use strict";
  var MrD = (window.MrD = window.MrD || {});
  var TABS = [["lesson", "Lessons", "📘"], ["lab", "Virtual labs", "🧪"], ["sim", "Sims", "🎛️"]];
  var KIND = { lesson: "GUIDED LESSON", lab: "VIRTUAL LAB", sim: "SIM" };

  function e(tag, cls, text) { var x = document.createElement(tag); if (cls) x.className = cls; if (text != null) x.textContent = text; return x; }
  function hue(s) { var h = 0; for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 360; return h; }

  function normalize(units) {
    return units.map(function (u) {
      var list = u.entries || u.sims || u.labs || [];
      return { id: u.id, title: u.title, blurb: u.blurb, entries: list.map(function (x) { var y = {}; for (var k in x) y[k] = x[k]; y.type = y.type || u.type || "sim"; return y; }) };
    });
  }

  MrD.hub = function (o) {
    var root = o.root || "", units = normalize(o.units || []);
    var host = document.getElementById("hub"), tab = (location.hash.slice(1).split("&")[0] || "");
    try { if (!tab) tab = localStorage.getItem("mrd.hubtab." + o.course) || ""; } catch (err) { }
    var counts = { lesson: 0, lab: 0, sim: 0 };
    units.forEach(function (u) { u.entries.forEach(function (x) { counts[x.type] = (counts[x.type] || 0) + 1; }); });
    if (!counts[tab]) tab = counts.lesson ? "lesson" : (counts.lab ? "lab" : "sim");
    var q = "";

    document.documentElement.style.setProperty("--hub-accent", o.accent || "#4f8cff");
    document.body.classList.add("hub");
    document.title = o.title + " · Mr. D's Sims";

    function topbar() {
      var t = e("nav", "hub-top"), a = e("a", null, "← All classes"); a.href = root + "index.html"; t.append(a, e("span", "sp"));
      var p = e("a", null, "Review portal"); p.href = root + "portal/index.html"; t.append(p);
      var th = e("a", "tonly", "Teacher page"); th.href = o.teacher || (root + "teacher/index.html"); t.append(th);
      return t;
    }
    function hero() {
      var h = e("header", "hero"); h.append(e("h1", null, o.title)); if (o.tagline) h.append(e("p", null, o.tagline));
      if (MrD.bell) {
        var c = MrD.bell.clock(o.course), n = e("span", "now" + (c.mode === "class" ? "" : " off")), i = e("i");
        n.append(i, c.mode === "class"
          ? o.title + " is in session until " + MrD.bell.fmtTime(c.session.end) + (c.friday ? " (Friday: locked to the bell)" : " · guided notes end at " + MrD.bell.fmtTime(c.session.endMark))
          : (c.gates ? "Huddle codes are on until 3:00 PM" : "Home mode: no huddle codes right now"));
        h.append(n);
      }
      return h;
    }
    function card(x) {
      var c = e("div", "card"), a = e("a", "cardlink"); a.href = x.href;
      var h1 = hue(x.title), art = e("div", "art"); art.style.setProperty("--c1", "hsl(" + h1 + " 55% 32%)"); art.style.setProperty("--c2", "hsl(" + ((h1 + 40) % 360) + " 60% 20%)");
      art.textContent = x.icon || (TABS.filter(function (t) { return t[0] === x.type; })[0] || TABS[2])[2]; art.setAttribute("aria-hidden", "true");
      var b = e("div", "body"); b.append(e("span", "kind", KIND[x.type] || "SIM"), e("h3", null, x.title));
      if (x.blurb) b.append(e("p", null, x.blurb));
      if (x.tags && x.tags.length) { var pl = e("div", "pills"); x.tags.forEach(function (t) { pl.append(e("span", "pill", t)); }); b.append(pl); }
      a.append(art, b); c.append(a);
      if (x.teacher && x.teacher.length) {
        var ex = e("div", "extras tonly"); x.teacher.forEach(function (l) { var la = e("a", null, l.label); la.href = l.href; ex.append(la); });
        c.append(ex);
      }
      return c;
    }
    function render() {
      host.textContent = ""; host.append(topbar(), hero());
      var tabs = e("div", "tabs"); tabs.setAttribute("role", "tablist");
      TABS.forEach(function (t) {
        var b = e("button"); b.type = "button"; b.setAttribute("role", "tab"); b.setAttribute("aria-selected", String(t[0] === tab));
        b.append(t[2] + " " + t[1], e("small", null, String(counts[t[0]] || 0)));
        b.onclick = function () { tab = t[0]; try { localStorage.setItem("mrd.hubtab." + o.course, tab); } catch (err) { } history.replaceState(null, "", "#" + tab); render(); };
        tabs.append(b);
      });
      var s = e("input"); s.type = "search"; s.placeholder = "Search this class"; s.value = q; s.setAttribute("aria-label", "Search this class");
      s.oninput = function () { q = s.value; drawRows(); }; tabs.append(s); host.append(tabs);
      var jump = e("div", "jump"); host.append(jump);
      var rows = e("main"); host.append(rows);
      var foot = e("footer", "hubfoot", "Mr. D's Sims · every page runs in the browser, nothing to install."); host.append(foot);

      function drawRows() {
        rows.textContent = ""; jump.textContent = "";
        var any = false, term = q.trim().toLowerCase();
        units.forEach(function (u, ui) {
          var list = u.entries.filter(function (x) {
            if (x.type !== tab) return false;
            return !term || (x.title + " " + (x.blurb || "") + " " + (x.tags || []).join(" ") + " " + u.title).toLowerCase().indexOf(term) >= 0;
          });
          if (!list.length) return;
          any = true;
          var sec = e("section", "unit"); sec.id = "u-" + (u.id || ui);
          sec.append(e("h2", null, u.title)); if (u.blurb) sec.append(e("p", "blurb", u.blurb));
          var tw = e("div", "track-wrap"), tr = e("div", "track");
          list.forEach(function (x) { tr.append(card(x)); });
          var L = e("button", "arrow l", "‹"), R = e("button", "arrow r", "›"); L.type = R.type = "button"; L.setAttribute("aria-label", "Scroll left"); R.setAttribute("aria-label", "Scroll right");
          L.onclick = function () { tr.scrollBy({ left: -tr.clientWidth * .8, behavior: "smooth" }); };
          R.onclick = function () { tr.scrollBy({ left: tr.clientWidth * .8, behavior: "smooth" }); };
          tw.append(L, tr, R); sec.append(tw); rows.append(sec);
          var ja = e("a", null, u.title); ja.href = "#u-" + (u.id || ui); ja.onclick = function (ev) { ev.preventDefault(); sec.scrollIntoView({ behavior: "smooth", block: "start" }); }; jump.append(ja);
        });
        if (!any) rows.append(e("p", "empty", term ? "Nothing matches “" + q + "”." : "Nothing in " + (TABS.filter(function (t) { return t[0] === tab; })[0][1]).toLowerCase() + " yet for this class."));
      }
      drawRows();
    }
    render();
  };
})();
