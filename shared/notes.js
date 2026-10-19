/* MrD.notes: the printable notes every guided lesson ends with (print, save as PDF, or download as LaTeX).
   Physics and calculus build their own notes pages. Chemistry, and any new lesson, can describe its notes as a small
   model and let this file draw it, so a lesson never needs its own print code.

   model = { title, unit, name, period, date, sections:[ section, ... ] }
   section = { h:"Heading",
               rows:  [["Label","Student's text"], ...]        a two-column table, label on the left
               table: { head:["A","B"], rows:[["1","2"], ...] }  a data table (an empty table prints three blank rows)
               text:  "Paragraph in a ruled box"
               lines: ["first item", ...]                        a numbered list }
   An empty value prints as a blank line to write on, so a notes page printed early is still a usable worksheet.

   MrD.notes.html(model)             the notes as HTML
   MrD.notes.tex(model)              the notes as a LaTeX document (compiles with pdflatex or in Overleaf)
   MrD.notes.print(model)            open the print window (choose "Save as PDF" as the destination)
   MrD.notes.download(name, text)    save a text file
   MrD.notes.open(getModel, fname)   a "My notes" window with Print and .tex buttons; getModel() is called each time it opens */
(function () {
  "use strict";
  var MrD = (window.MrD = window.MrD || {});

  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  var SUB = { "₀": 0, "₁": 1, "₂": 2, "₃": 3, "₄": 4, "₅": 5, "₆": 6, "₇": 7, "₈": 8, "₉": 9 }, SUP = { "⁰": 0, "¹": 1, "²": 2, "³": 3, "⁴": 4, "⁵": 5, "⁶": 6, "⁷": 7, "⁸": 8, "⁹": 9, "⁻": "-" };
  function tex(s) {
    s = String(s == null ? "" : s).replace(/[₀-₉]+/g, function (m) { return "\u0001sub{" + m.split("").map(function (c) { return SUB[c]; }).join("") + "}\u0002"; })
      .replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹⁻]+/g, function (m) { return "\u0001sup{" + m.split("").map(function (c) { return SUP[c]; }).join("") + "}\u0002"; });
    var map = { "\\": "\\textbackslash{}", "{": "\\{", "}": "\\}", "$": "\\$", "&": "\\&", "#": "\\#", "_": "\\_", "%": "\\%", "^": "\\^{}", "~": "\\~{}" };
    s = s.replace(/[\\{}$&#_%^~]/g, function (c) { return map[c]; });
    s = s.replace(/\u0001sub\\\{([^\u0002]*?)\\\}\u0002/g, "\\textsubscript{$1}").replace(/\u0001sup\\\{([^\u0002]*?)\\\}\u0002/g, "\\textsuperscript{$1}");
    return s.replace(/÷/g, "$\\div$").replace(/×/g, "$\\times$").replace(/[’‘]/g, "'").replace(/[“”]/g, '"').replace(/→/g, "$\\to$").replace(/[✔✓★]/g, "").replace(/\n/g, "\\\\ ");
  }
  function has(v) { return v != null && String(v).trim() !== ""; }

  var CSS = ".mn-doc{font:14px/1.45 Georgia,serif;color:#000;background:#fff;padding:6px 4px}.mn-doc h1{font-size:20px;margin:0}.mn-doc .mn-meta{margin:2px 0 10px;font-size:13px}" +
    ".mn-doc h2{font-size:15px;margin:14px 0 4px;border-bottom:1px solid #000}.mn-doc table{border-collapse:collapse;width:100%;margin:4px 0}" +
    ".mn-doc td,.mn-doc th{border:1px solid #000;padding:4px 8px;text-align:left;vertical-align:top}.mn-doc th{background:#eee;font-weight:700;width:30%}.mn-doc .mn-tbl th{width:auto}" +
    ".mn-doc .mn-blank{display:inline-block;min-width:140px;border-bottom:1px solid #000;height:1em}.mn-doc .mn-box{border:1px solid #000;min-height:44px;padding:6px 8px;white-space:pre-wrap}" +
    ".mn-doc tr{break-inside:avoid}.mn-doc h2{break-after:avoid}" +
    "@media screen{#print-root{display:none}}@media print{body>*:not(#print-root){display:none!important}#print-root{display:block!important}}" +
    "#mn-ov{position:fixed;inset:0;z-index:100;background:rgba(10,18,26,.6);display:flex;justify-content:center}#mn-ov .mn-panel{background:#fff;color:#000;width:min(860px,100%);overflow:auto;padding:14px 18px}" +
    "#mn-ov .mn-bar{display:flex;gap:8px;flex-wrap:wrap;margin:0 0 10px}#mn-ov button{font:600 14px system-ui,sans-serif;padding:8px 14px;border:1px solid #444;border-radius:6px;background:#f3f3f3;color:#000;cursor:pointer}";
  var st = document.createElement("style"); st.textContent = CSS; document.head.append(st);

  function html(m) {
    var o = '<div class="mn-doc"><h1>' + esc(m.title) + "</h1><div class=\"mn-meta\">" + esc([m.unit, m.name, m.period ? "Period " + m.period : "", m.date].filter(has).join(" · ")) + "</div>";
    (m.sections || []).forEach(function (s) {
      o += "<h2>" + esc(s.h) + "</h2>";
      if (s.rows) o += "<table>" + s.rows.map(function (r) { return "<tr><th>" + esc(r[0]) + "</th><td>" + (has(r[1]) ? esc(r[1]) : '<span class="mn-blank"></span>') + "</td></tr>"; }).join("") + "</table>";
      if (s.table) {
        var rows = s.table.rows && s.table.rows.length ? s.table.rows : [0, 1, 2].map(function () { return s.table.head.map(function () { return ""; }); });
        o += '<table class="mn-tbl"><tr>' + s.table.head.map(function (c) { return "<th>" + esc(c) + "</th>"; }).join("") + "</tr>" +
          rows.map(function (r) { return "<tr>" + r.map(function (c) { return "<td>" + (has(c) ? esc(c) : "&nbsp;") + "</td>"; }).join("") + "</tr>"; }).join("") + "</table>";
      }
      if (s.text !== undefined) o += '<div class="mn-box">' + esc(s.text) + "</div>";
      if (s.lines) o += "<ol>" + s.lines.map(function (l) { return "<li>" + (has(l) ? esc(l) : '<span class="mn-blank"></span>') + "</li>"; }).join("") + "</ol>";
    });
    return o + "</div>";
  }

  function texDoc(m) {
    var o = "% " + tex(m.title) + ", guided notes. Compile with pdflatex (or paste into Overleaf).\n\\documentclass[11pt]{article}\n\\usepackage[utf8]{inputenc}\n\\usepackage[margin=0.8in]{geometry}\n\\usepackage{array,amssymb}\n\\setlength{\\parindent}{0pt}\n\\renewcommand{\\arraystretch}{1.3}\n\\begin{document}\n" +
      "{\\large\\textbf{" + tex(m.title) + "}}\\par " + tex([m.unit, m.name, m.period ? "Period " + m.period : "", m.date].filter(has).join(" -- ")) + "\\par\\medskip\n";
    (m.sections || []).forEach(function (s) {
      o += "\\subsection*{" + tex(s.h) + "}\n";
      if (s.rows) o += "\\begin{tabular}{|>{\\raggedright\\arraybackslash}p{1.9in}|>{\\raggedright\\arraybackslash}p{4.6in}|}\\hline\n" + s.rows.map(function (r) { return "\\textbf{" + tex(r[0]) + "} & " + (has(r[1]) ? tex(r[1]) : "\\rule{0pt}{1.2em}") + " \\\\ \\hline\n"; }).join("") + "\\end{tabular}\\par\\smallskip\n";
      if (s.table) {
        var rows = s.table.rows && s.table.rows.length ? s.table.rows : [0, 1, 2].map(function () { return s.table.head.map(function () { return ""; }); }), n = s.table.head.length;
        o += "\\begin{tabular}{|" + new Array(n + 1).join("l|") + "}\\hline\n" + s.table.head.map(function (c) { return "\\textbf{" + tex(c) + "}"; }).join(" & ") + " \\\\ \\hline\n" +
          rows.map(function (r) { return r.map(function (c) { return has(c) ? tex(c) : "\\rule{0pt}{1.2em}"; }).join(" & ") + " \\\\ \\hline\n"; }).join("") + "\\end{tabular}\\par\\smallskip\n";
      }
      if (s.text !== undefined) o += "\\fbox{\\parbox{6.4in}{" + (has(s.text) ? tex(s.text) : "\\rule{0pt}{3em}") + "}}\\par\\smallskip\n";
      if (s.lines) o += "\\begin{enumerate}\n" + s.lines.map(function (l) { return "\\item " + (has(l) ? tex(l) : "\\rule{0pt}{1.2em}"); }).join("\n") + "\n\\end{enumerate}\n";
    });
    return o + "\\end{document}\n";
  }

  function download(name, text, type) {
    var blob = new Blob([text], { type: type || "text/plain" }), a = document.createElement("a");
    a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  }
  function print(m) {
    var r = document.getElementById("print-root");
    if (!r) { r = document.createElement("div"); r.id = "print-root"; r.setAttribute("aria-hidden", "true"); document.body.append(r); }
    r.innerHTML = html(m);
    var go = function () { setTimeout(function () { window.print(); }, 150); };
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(go); else go();
  }
  function open(getModel, fname) {
    var old = document.getElementById("mn-ov"); if (old) old.remove();
    var m = getModel(), ov = document.createElement("div"); ov.id = "mn-ov"; ov.setAttribute("role", "dialog"); ov.setAttribute("aria-label", "My notes");
    var panel = document.createElement("div"); panel.className = "mn-panel";
    var bar = document.createElement("div"); bar.className = "mn-bar";
    function btn(t, f) { var b = document.createElement("button"); b.type = "button"; b.textContent = t; b.onclick = f; bar.append(b); }
    btn("Print or save as PDF", function () { print(getModel()); });
    btn("Download as LaTeX (.tex)", function () { download((fname || "notes") + ".tex", texDoc(getModel()), "application/x-tex"); });
    btn("Close", function () { ov.remove(); });
    var intro = document.createElement("p"); intro.style.cssText = "margin:0 0 8px;font:14px system-ui,sans-serif";
    intro.textContent = "These are your notes for this lesson. They fill in as you work. Print them (choose \u201CSave as PDF\u201D as the destination) and keep them in your binder.";
    var body = document.createElement("div"); body.innerHTML = html(m);
    panel.append(bar, intro, body); ov.append(panel); document.body.append(ov);
  }

  MrD.notes = { html: html, tex: texDoc, print: print, download: download, open: open, esc: esc };
})();
