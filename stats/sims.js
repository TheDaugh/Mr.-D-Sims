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
    { id: "3-6-percentiles",    title: "3.6 From a Percentile Back to a Value", blurb: "Work the table backward: start with a percent, end with a value." },
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
  window.UNITS = [{ id: "unit-3", title: "Unit 3 · The Normal Distribution", blurb: "Guided lessons with hints and a concept sheet at every step. Practice days sit between lessons.", entries: entries }];
})();
