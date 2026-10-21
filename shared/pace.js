/* MrD.pace: the pacing brain for guided lessons. Pure logic, no DOM, so it is unit-tested in node.

   A lesson declares its plan once:
     pacing = { budgetMin: 42,
                steps:   [{ id:"warm", prio:1, min:5, minItems:3, parts:5 }, ...],   // in lesson order
                huddles: [{ key:"h1", atMin:18 }, { key:"h2", atMin:32 }] }          // clock-driven, not progress-driven
   prio 1  never trimmed.   prio 2  shrinks to minItems of parts.   prio 3  skipped first.
   Rules the validator enforces: prio-1 minutes are at most 60% of the budget, and every huddle sits inside the budget.

   MrD.pace.validate(pacing)            [error strings], empty when fine
   MrD.pace.decide(pacing, {minutesIn, stepId, doneIds})
        -> { behind, behindMin, trigger, skip:[ids], items:{id:n}, needMin, leftMin }
        Trimming starts once the class is 20% of the budget behind the plan. Then prio 3 steps go (latest first),
        then prio 2 steps shrink (latest first), until what is left fits the time that remains.
   MrD.pace.huddleDue(pacing, minutesIn, firedKeys)   the first huddle whose time has come and has not run, or null */
(function () {
  "use strict";
  var root = typeof window !== "undefined" ? window : globalThis;
  var MrD = (root.MrD = root.MrD || {});
  var TRIGGER = 0.2, CORE_MAX = 0.6;

  function cost(s, shrunk) { return shrunk && s.minItems && s.parts ? s.min * s.minItems / s.parts : s.min; }

  function validate(p) {
    var e = [];
    if (!p || !p.budgetMin || !p.steps || !p.steps.length) return ["pacing needs budgetMin and steps"];
    var seen = {}, core = 0;
    p.steps.forEach(function (s) {
      if (!s.id) e.push("a step has no id");
      if (seen[s.id]) e.push("duplicate step id " + s.id); seen[s.id] = 1;
      if ([1, 2, 3].indexOf(s.prio) < 0) e.push(s.id + ": prio must be 1, 2 or 3");
      if (!(s.min > 0)) e.push(s.id + ": min must be positive");
      if (s.prio === 2 && !(s.minItems > 0 && s.parts > s.minItems)) e.push(s.id + ": a prio 2 step needs minItems below parts");
      if (s.prio === 1) core += s.min;
    });
    if (core > CORE_MAX * p.budgetMin) e.push("prio 1 steps total " + core + " min, over 60% of the " + p.budgetMin + " min budget");
    (p.huddles || []).forEach(function (h) { if (!(h.atMin > 0 && h.atMin < p.budgetMin)) e.push("huddle " + h.key + " is outside the budget"); });
    return e;
  }

  function decide(p, st) {
    var steps = p.steps, done = {}, i, cur = -1, planned = 0;
    (st.doneIds || []).forEach(function (id) { done[id] = 1; });
    for (i = 0; i < steps.length; i++) { if (steps[i].id === st.stepId) cur = i; }
    if (cur < 0) cur = steps.findIndex(function (s) { return !done[s.id]; });
    if (cur < 0) return { behind: false, behindMin: 0, trigger: false, skip: [], items: {}, needMin: 0, leftMin: Math.max(0, p.budgetMin - st.minutesIn) };
    for (i = 0; i < cur; i++) planned += steps[i].min;
    var behindMin = st.minutesIn - planned, trigger = behindMin >= TRIGGER * p.budgetMin;
    var left = Math.max(0, p.budgetMin - st.minutesIn), rest = steps.slice(cur);
    var skip = {}, items = {};
    function need() { return rest.reduce(function (t, s) { return t + (skip[s.id] ? 0 : cost(s, items[s.id] != null)); }, 0); }
    if (trigger) {
      for (i = rest.length - 1; i >= 0 && need() > left; i--) if (rest[i].prio === 3) skip[rest[i].id] = 1;
      for (i = rest.length - 1; i >= 0 && need() > left; i--) if (rest[i].prio === 2 && !skip[rest[i].id]) items[rest[i].id] = rest[i].minItems;
      for (i = rest.length - 1; i >= 0 && need() > left; i--) if (rest[i].prio === 2 && !skip[rest[i].id]) { skip[rest[i].id] = 1; delete items[rest[i].id]; }
    }
    return { behind: behindMin > 0, behindMin: behindMin, trigger: trigger, skip: Object.keys(skip), items: items, needMin: need(), leftMin: left };
  }

  function huddleDue(p, minutesIn, fired) {
    fired = fired || [];
    var hs = (p.huddles || []).slice().sort(function (a, b) { return a.atMin - b.atMin; });
    for (var i = 0; i < hs.length; i++) if (minutesIn >= hs[i].atMin && fired.indexOf(hs[i].key) < 0) return hs[i];
    return null;
  }

  MrD.pace = { TRIGGER: TRIGGER, CORE_MAX: CORE_MAX, validate: validate, decide: decide, huddleDue: huddleDue };
  if (typeof module !== "undefined" && module.exports) module.exports = MrD.pace;
})();
