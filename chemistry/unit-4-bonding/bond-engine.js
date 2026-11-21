/* Bond engine for the Trends Lab (trends-explorer.html): what happens when atoms are put together.
   Pure model, no DOM, unit tested (tests/unit/bond-engine.test.js). Works in the browser (window.BondEngine) and in node.

   The rules are the day's rules and nothing more:
     - An atom wants a full outer shell. A metal (groups 1, 2, 13) gets there by giving up its outer electrons.
       A nonmetal gets there by taking or sharing electrons: it has "open spots" (need) = 8 minus its outer electrons (hydrogen: 1).
     - A metal and a nonmetal whose electronegativities differ by 1.0 or more: the metal GIVES, the nonmetal TAKES.
     - Two nonmetals: they SHARE electron pairs. The pair sits nearer the atom with the higher electronegativity.
     - Two metals, or any noble gas: nothing happens (noble gases already have a full shell).
   Atoms combine in the smallest whole-number ratio that uses every given electron and fills every open spot (NaCl, MgCl2, Na2O, H2O, CO2, NH3, CH4).
   Words on purpose: gives, takes, shares. "Ionic" and "covalent" are tomorrow's words and are not used. */
(function (root) {
  "use strict";
  var D = root.TrendsData || (typeof require === "function" ? require("./trends-data.js") : null);
  var GIVE_GAP = 1.0, DIATOMIC = { H: 1, N: 1, O: 1, F: 1, Cl: 1, Br: 1, I: 1 };
  var SUB = "₀₁₂₃₄₅₆₇₈₉";
  function sub(n) { return n === 1 ? "" : String(n).split("").map(function (c) { return SUB[+c]; }).join(""); }
  function gcd(a, b) { return b ? gcd(b, a % b) : a; }

  /* role of one atom: metal (gives `give`), nonmetal (needs `need`), or noble (nothing) */
  function role(sym) {
    var e = D.BY[sym], g = e.group;
    if (g === 18) return { kind: "noble", give: 0, need: 0 };
    if (sym !== "H" && sym !== "B" && (g === 1 || g === 2 || g === 13)) return { kind: "metal", give: g === 13 ? 3 : g, need: 0 };
    return { kind: "nonmetal", give: 0, need: sym === "H" ? 1 : sym === "B" ? 3 : 8 - e.valence };
  }

  /* one atom with one atom: what the pair does, and what is left over. Used by "one of each". */
  function pair(a, b) {
    var A = D.BY[a], B = D.BY[b], ra = role(a), rb = role(b), diff = (A.en != null && B.en != null) ? Math.abs(A.en - B.en) : 0, out = { a: a, b: b, diff: diff };
    if (ra.kind === "noble" || rb.kind === "noble") { var nb = ra.kind === "noble" ? a : b; return Object.assign(out, { mode: "none", why: D.BY[nb].name + " already has a full outer shell, so it does not take part.", left: { a: ra.give || ra.need, b: rb.give || rb.need } }); }
    if (ra.kind === "metal" && rb.kind === "metal") return Object.assign(out, { mode: "none", why: "Both atoms let go of electrons. Neither one takes any.", left: { a: ra.give, b: rb.give } });
    var m = ra.kind === "metal" ? a : rb.kind === "metal" ? b : null;
    if (m && diff >= GIVE_GAP) {
      var t = m === a ? b : a, rm = role(m), rt = role(t), moved = Math.min(rm.give, rt.need);
      return Object.assign(out, { mode: "gives", donor: m, taker: t, moved: moved, winner: t, leftDonor: rm.give - moved, leftTaker: rt.need - moved });
    }
    if (a === b && !DIATOMIC[a]) return Object.assign(out, { mode: "none", why: "A lone " + A.name.toLowerCase() + " atom with another one: nothing new forms at this level.", left: { a: rb.need, b: ra.need } });
    if (m) return Object.assign(out, { mode: "none", why: "Their pull is too close for an electron to be handed over, and the metal has no open spots to share.", left: { a: ra.give, b: rb.need } });
    var na = role(a).need, nb2 = role(b).need, pairs = Math.min(na, nb2), winner = diff < 0.005 ? null : (A.en > B.en ? a : b);
    return Object.assign(out, { mode: "shares", pairs: pairs, winner: winner, even: diff < 0.4, leftA: na - pairs, leftB: nb2 - pairs });
  }

  /* the smallest whole-number mix that finishes both atoms: counts per unit */
  function ratio(a, b, mode) {
    var ra = role(a), rb = role(b), ga, gb, g;
    if (mode === "gives") { var m = ra.kind === "metal" ? a : b, t = m === a ? b : a, rm = role(m), rt = role(t); g = gcd(rm.give, rt.need); var o = {}; o[m] = rt.need / g; o[t] = rm.give / g; return o; }
    ga = ra.need; gb = rb.need; g = gcd(ga, gb); var q = {}; q[a] = gb / g; q[b] = ga / g; return q;
  }
  function formula(members) {
    var syms = Object.keys(members);
    if (syms.length === 1) return syms[0] + sub(members[syms[0]]);
    var r0 = role(syms[0]), r1 = role(syms[1]), first, second;
    if (r0.kind === "metal" || r1.kind === "metal") { first = r0.kind === "metal" ? syms[0] : syms[1]; second = first === syms[0] ? syms[1] : syms[0]; }
    else if (syms.indexOf("H") >= 0) { var other = syms[0] === "H" ? syms[1] : syms[0], og = D.BY[other].group; if (og >= 16) { first = "H"; second = other; } else { first = other; second = "H"; } }
    else { first = D.BY[syms[0]].en <= D.BY[syms[1]].en ? syms[0] : syms[1]; second = first === syms[0] ? syms[1] : syms[0]; }
    return first + sub(members[first]) + second + sub(members[second]);
  }
  var COMMON = { NaCl: "table salt", "H₂O": "water", "CO₂": "carbon dioxide", "NH₃": "ammonia", "CH₄": "methane", HCl: "hydrogen chloride", MgO: "magnesium oxide", "H₂": "hydrogen gas", "O₂": "oxygen gas", "N₂": "nitrogen gas", "Cl₂": "chlorine gas", KCl: "potassium chloride", CaO: "lime", LiF: "lithium fluoride", "MgCl₂": "magnesium chloride", "CaCl₂": "calcium chloride", "Na₂O": "sodium oxide", HF: "hydrogen fluoride", "H₂S": "hydrogen sulfide", "CCl₄": "carbon tetrachloride", "SiO₂": "silicon dioxide (sand)" };

  /* a whole dish. counts = { Na: 2, Cl: 2, ... }. Returns { units:[{formula, mode, members, count, name}], left:{sym:n}, near:{...}|null } */
  function react(counts) {
    var c = {}, units = [], guard = 0;
    Object.keys(counts).forEach(function (k) { if (counts[k] > 0) c[k] = counts[k]; });
    function candidates() {
      var syms = Object.keys(c).filter(function (s) { return c[s] > 0; }), out = [], i, j;
      for (i = 0; i < syms.length; i++) for (j = i + 1; j < syms.length; j++) {
        var p = pair(syms[i], syms[j]); if (p.mode === "none") continue;
        var r = ratio(syms[i], syms[j], p.mode), feasible = c[syms[i]] >= r[syms[i]] && c[syms[j]] >= r[syms[j]];
        out.push({ p: p, r: r, feasible: feasible, a: syms[i], b: syms[j] });
      }
      return out;
    }
    while (guard++ < 40) {
      var cand = candidates().filter(function (x) { return x.feasible; });
      if (!cand.length) break;
      cand.sort(function (x, y) { return (y.p.diff - x.p.diff) || (x.a + x.b < y.a + y.b ? -1 : 1); });
      var best = cand[0], k = Math.min(Math.floor(c[best.a] / best.r[best.a]), Math.floor(c[best.b] / best.r[best.b])), f = formula(best.r);
      c[best.a] -= k * best.r[best.a]; c[best.b] -= k * best.r[best.b];
      units.push({ formula: f, mode: best.p.mode, members: best.r, count: k, name: COMMON[f] || "", donor: best.p.donor || null, taker: best.p.taker || null, winner: best.p.winner || null, diff: best.p.diff });
    }
    // lone diatomic elements: two of the same nonmetal share
    Object.keys(c).forEach(function (s) {
      if (DIATOMIC[s] && c[s] >= 2) { var k = Math.floor(c[s] / 2), m = {}; m[s] = 2; c[s] -= 2 * k; units.push({ formula: formula(m), mode: "shares", members: m, count: k, name: COMMON[formula(m)] || "", donor: null, taker: null, winner: null, diff: 0 }); }
    });
    var left = {}; Object.keys(c).forEach(function (s) { if (c[s] > 0) left[s] = c[s]; });
    // what would finish the closest pair that is not complete?
    var near = null, open = candidates().filter(function (x) { return !x.feasible; }).sort(function (x, y) { return y.p.diff - x.p.diff; })[0];
    if (open) {
      var add = {}, ra = open.r[open.a] - (c[open.a] || 0), rb = open.r[open.b] - (c[open.b] || 0); if (ra > 0) add[open.a] = ra; if (rb > 0) add[open.b] = rb;
      near = { formula: formula(open.r), add: add, name: COMMON[formula(open.r)] || "" };
    }
    return { units: units, left: left, near: near };
  }
  function total(counts) { return Object.keys(counts).reduce(function (n, k) { return n + (counts[k] || 0); }, 0); }

  root.BondEngine = { role: role, pair: pair, ratio: ratio, formula: formula, react: react, total: total, COMMON: COMMON, GIVE_GAP: GIVE_GAP };
  if (typeof module !== "undefined" && module.exports) module.exports = root.BondEngine;
})(typeof window !== "undefined" ? window : globalThis);
