// The hub reads this list. Unit 3 shows the planned lessons. A lesson that is not registered in shared/lessons.js shows as "coming soon".
// To make one live: node tools/new-lesson.mjs stats <id below> "<title>" --unit unit-3-normal   (the id must match PLAN, and it registers itself).
// TODO(Ian): the titles below are my guess at lessons 1 to 7 and the review. Rename them to match your plan; keep each id in step with its title.
(function () {
  var PLAN = [
    { id: "3-1-normal-curve",   title: "3.1 The Normal Curve",                  blurb: "What a bell curve is, and what the 68-95-99.7 rule says about it." },
    { id: "3-2-z-scores",       title: "3.2 z-Scores",                          blurb: "How many standard deviations a value sits from the mean." },
    { id: "3-3-z-table",        title: "3.3 Reading the z-Table",               blurb: "Find a z-score in the table and read the area to its left." },
    { id: "unit-3-review-1-3", title: "Review: 3.1 to 3.3", blurb: "Mixed review of percentiles, z-scores, shifting and stretching data, density curves, and normal fit." },
    { id: "3-4-area-below",     title: "3.4 Area Below and Above",              blurb: "Percent of data below a value, and above it." },
    { id: "3-5-area-between",   title: "3.5 Area Between Two Values",           blurb: "Subtract two table areas to get the percent between." },
    { id: "3-6-boundary-values", title: "3.6 Finding Boundary Values",         blurb: "Start with a percent, end with a value: find the cutoff for a percentile." },
    { id: "3-7-normal-context", title: "3.7 Normal Models in Context",          blurb: "Use the normal curve to answer questions about real situations." },
    { id: "3-8-unit-review",    title: "Unit 3 Review",                         blurb: "Mixed practice on every skill in the unit." }
  ];
  var reg = {};
  ((window.MrD && window.MrD.lessons) || []).forEach(function (l) { if (l.course === "stats") reg[l.id] = l; });
  var entries = PLAN.map(function (p) {
    var l = reg[p.id];
    if (!l) return { type: "lesson", icon: "🔔", title: p.title, blurb: p.blurb, soon: true };
    return { type: "lesson", icon: "🔔", title: p.title, href: l.href.replace(/^stats\//, ""), blurb: p.blurb, tags: ["adaptive", "online notes + PDF"],
      teacher: [{ label: "Teacher view (#key)", href: l.href.replace(/^stats\//, "") + "#key" }] };
  });
  var unit3practice = [
    { type: "lesson", icon: "✅", title: "Practice: 3.1 and 3.2", href: "unit-3-normal-distribution/practice-3-1-3-2.html",
      blurb: "Concept checker: percentiles from a dotplot, z-scores and what they say, hop to a value, adding and multiplying every value.",
      tags: ["practice day", "locked mode"], teacher: [{ label: "Teacher view (#key)", href: "unit-3-normal-distribution/practice-3-1-3-2.html#key" }] }
  ];
  var unit4 = [
    { type: "lesson", icon: "📖", title: "Textbook: Chapter 4, Two-Variable Data", href: "textbook/Unit4_Two-Variable_Data.pdf",
      blurb: "The whole unit to reread at home: sections 4.1 to 4.6 with pictures, worked examples, Say it frames, exercises and answers at the back.",
      tags: ["textbook", "PDF"] },
    { type: "lesson", icon: "✅", title: "Practice: 4.1 and 4.2", href: "unit-4-two-variable/practice-4-1-4-2.html",
      blurb: "Concept checker: two-way tables, the out-of, percents, segmented bar graphs and association. Three right in a row per part.",
      tags: ["practice day", "locked mode"], teacher: [{ label: "Teacher view (#key)", href: "unit-4-two-variable/practice-4-1-4-2.html#key" }] }
,
    { type: "lesson", icon: "✅", title: "Practice: 4.3 and 4.4", href: "unit-4-two-variable/practice-4-3-4-4.html",
      blurb: "Concept checker: read points, explanatory and response, describe a scatterplot, make one, estimate r, correlation vs. causation.",
      tags: ["practice day", "locked mode"], teacher: [{ label: "Teacher view (#key)", href: "unit-4-two-variable/practice-4-3-4-4.html#key" }] },
    { type: "lesson", icon: "✅", title: "Practice: 4.5 and 4.6", href: "unit-4-two-variable/practice-4-5-4-6.html",
      blurb: "Concept checker: predict with a line, residuals, fit a line, say the slope, extrapolation and residual plots.",
      tags: ["practice day", "locked mode"], teacher: [{ label: "Teacher view (#key)", href: "unit-4-two-variable/practice-4-5-4-6.html#key" }] }
  ];
  window.UNITS = [{ id: "unit-3", title: "Unit 3 · The Normal Distribution", blurb: "Guided lessons with hints and a concept sheet at every step. Practice days sit between lessons.", entries: entries }, { id: "unit-3-practice", title: "Unit 3 · Practice days", blurb: "Concept checkers for the days between notes lessons.", entries: unit3practice }, { id: "unit-4", title: "Unit 4 · Two-Variable Data", blurb: "Notes days are on paper. Practice days are concept checkers here.", entries: unit4 }];
})();
