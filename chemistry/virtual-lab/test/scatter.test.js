import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import * as FM from "../src/engine/foil.js";
import { newScat, newRun, checkData, groupSum, citesCount, evidenceItems, tallyDone, matchDone, per100 } from "../src/ui/scatter.js";
import { validateQuests, questDone } from "../src/engine/quests.js";
const lab = JSON.parse(readFileSync(new URL("../content/labs/03-rutherford-gold-foil.json", import.meta.url)));
const shared = createRequire(import.meta.url)("../../shared/foil-model.js");

test("ES copy of the foil model agrees with the shared one", () => {
  for (const [m, t, th] of [["plum", "Au", 1], ["nuc", "Au", 1], ["nuc", "Al", 1], ["nuc", "Au", 2]]) {
    const a = FM.fire({ i: 0, r1: 0.2, r2: 0.6 }, 5000, m, t, th), b = shared.fire({ i: 0, r1: 0.2, r2: 0.6 }, 5000, m, t, th);
    assert.deepEqual(a.hist, b.hist);
  }
});
function realRun(seed) { const r = newRun(seed, "real", {}); const o = FM.fire(r.stream, 20000, r.model, r.target, r.thick); o.hist.forEach((c, i) => { r.hist[i] += c; }); r.n = 20000; r.done = true; return r; }
test("real foil: nearly all straight, a few deflected, very few rebound, for every seed", () => {
  for (let seed = 1; seed < 200; seed += 7) {
    const r = realRun(seed), s = groupSum(r, "straight") / r.n, d = groupSum(r, "deflected") / r.n, rb = groupSum(r, "rebound");
    assert.ok(s > 0.955 && s < 0.975, "straight " + s); assert.ok(d > 0.02 && d < 0.045, "deflected " + d); assert.ok(rb >= 1 && rb <= 14, "rebound " + rb);
  }
});
test("plum model: everything within 10 degrees", () => {
  const r = newRun(3, "plum", {}); const o = FM.fire(r.stream, 10000, r.model, r.target, r.thick); assert.equal(o.hist[0], 10000);
});
test("challenge changes move deflections the way the key says", () => {
  const big = (t, th) => { const o = FM.fire({ i: 0, r1: 0.3, r2: 0.7 }, 20000, "nuc", t, th); return FM.sum(o.hist, "deflected") + FM.sum(o.hist, "rebound"); };
  assert.ok(big("Au", 2) / big("Au", 1) > 1.3); assert.ok(big("Al", 1) / big("Au", 1) < 0.7);
});
test("data answers: right, wrong and format-tolerant", () => {
  const r = realRun(11), [qs, qd, qr] = lab.data, ps = (100 * groupSum(r, "straight")) / r.n;
  assert.ok(checkData(qs, ps.toFixed(1), r).ok); assert.ok(checkData(qs, ps.toFixed(1) + "%", r).ok); assert.equal(checkData(qs, "50", r).ok, false); assert.equal(checkData(qs, "abc", r).ok, false);
  assert.ok(checkData(qd, ((100 * groupSum(r, "deflected")) / r.n).toFixed(2), r).ok); assert.equal(checkData(qd, ps.toFixed(1), r).ok, false);
  const n = Math.round(r.n / groupSum(r, "rebound")); assert.ok(checkData(qr, String(n), r).ok); assert.ok(checkData(qr, "1 in " + n.toLocaleString("en-US"), r).ok); assert.equal(checkData(qr, String(groupSum(r, "rebound")), r).ok, false);
});
test("CER must cite a real count; an invented number fails", () => {
  const sc = newScat(); sc.runs.real = realRun(5); const h0 = sc.runs.real.hist[0];
  assert.ok(citesCount(`${h0.toLocaleString("en-US")} went straight`, sc)); assert.ok(citesCount(`${groupSum(sc.runs.real, "rebound")} rebounded`, sc));
  assert.equal(citesCount("about 7 million went straight, 123456 rebounded", sc), false); assert.equal(citesCount("no numbers", sc), false);
  assert.ok(evidenceItems(sc).length >= 3);
});
test("tally and match checks read stored answers; quests validate", () => {
  const sc = newScat(); assert.equal(tallyDone(sc, lab), false); lab.data.forEach((q) => { sc.answers[q.id] = { ok: true }; }); assert.ok(tallyDone(sc, lab));
  lab.match.rows.forEach((r) => { sc.match[r.id] = { ok: true }; }); assert.ok(matchDone(sc, lab));
  assert.deepEqual(validateQuests(lab.quests), []);
  const q = lab.quests.find((x) => x.id === "tally"); assert.ok(questDone(q, [], { scat: { tally: true } })); assert.equal(questDone(q, [], { scat: { tally: false } }), false);
  const real = lab.quests.find((x) => x.id === "real"); assert.ok(questDone(real, [{ type: "scat_done", model: "real", target: "Au", thick: "1" }], {})); assert.equal(questDone(real, [{ type: "scat_done", model: "plum", target: "Au", thick: "1" }], {}), false);
});
test("match rows point to real meanings; prelab questions are well formed; prediction zones sum to 5", () => {
  for (const r of lab.match.rows) assert.ok(lab.match.meanings.some((m) => m.id === r.answer));
  for (const q of lab.prelab.questions) assert.ok(q.options.length >= 3 && q.options[q.correct] && q.explain);
  assert.equal(lab.prelab.placement.zones.length, 5);
  const p = per100(realRun(2)); assert.ok(p.A > 95 && p.A < 99 && p.D < 0.1);
});
