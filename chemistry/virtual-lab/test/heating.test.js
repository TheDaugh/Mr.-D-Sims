import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { profile, stateAt, reading, assign, checkData } from "../src/engine/heating.js";
const lab = JSON.parse(readFileSync(new URL("../content/labs/02-heating-curves.json", import.meta.url)));
const sub = (id) => lab.substances.find((s) => s.id === id);
test("every substance plateaus at its melting point and (if reached) boiling point", () => {
  for (const s of lab.substances.filter((x) => !x.sub)) {
    const p = profile(s, s.mass), melt = p.segs.find((g) => g.kind === "melt"), before = p.segs[0].J;
    for (const f of [0.2, 0.5, 0.8]) { const st = stateAt(p, before + melt.J * f); assert.equal(st.T, s.mp); assert.equal(st.phase, "melting"); }
    const boil = p.segs.find((g) => g.kind === "boil");
    if (boil) { const e = before + melt.J + p.segs[2].J + boil.J * 0.5; assert.equal(stateAt(p, e).T, s.bp); assert.equal(stateAt(p, e).phase, "boiling"); }
    assert.equal(stateAt(p, 0).T, s.T0); assert.equal(stateAt(p, p.total).T, s.Tend);
  }
});
test("run lengths suit a class period and give enough rows", () => {
  for (const s of lab.substances) { const sec = profile(s, s.mass).total / s.power; assert.ok(sec > (s.sub ? 100 : 180) && sec < 420, s.id + " " + sec); }
});
test("q = mcΔT: naphthalene liquid piece takes m·c·ΔT", () => {
  const n = sub("naphthalene"), p = profile(n, n.mass); assert.ok(Math.abs(p.segs[2].J - 10 * 1.7 * (218 - 80)) < 1);
});
test("reading wobble is small and repeatable", () => {
  assert.equal(reading(50, 7, 30), reading(50, 7, 30)); assert.ok(Math.abs(reading(50, 7, 30) - 50) <= 0.3);
});
test("assign gives distinct substances and depends on seed", () => {
  const ids = lab.substances.map((s) => s.id), a = assign(ids, 5, 2); assert.equal(new Set(a).size, 2);
  assert.deepEqual(assign(ids, 5, 2), a);
});
test("reference table never contains a duplicate melting and boiling pair", () => {
  const keys = lab.reference.map((r) => r.mp + "/" + r.bp); assert.equal(new Set(keys).size, keys.length);
  for (const s of lab.substances) { const r = lab.reference.find((x) => x.id === s.id); assert.ok(r && r.mp === s.mp && r.bp === s.bp, s.id); }
});
test("checkData flags a wrong temperature", () => {
  const w = sub("lauric"), t = 100; const truth = stateAt(profile(w, w.mass), t * w.power).T;
  const r = checkData(w, w.mass, w.power, [{ t, T: truth }, { t, T: truth + 20 }]); assert.deepEqual(r, { good: 1, bad: 1 });
});

test("sublimation: one plateau, no liquid, vapor fraction rises while temperature holds", async () => {
  const { profile, stateAt } = await import("../src/engine/heating.js");
  const s = { id: "i", T0: 20, sub: 114, mp: 114, bp: 184, Tend: 140, cs: 0.214, cg: 0.145, Ls: 130, power: 12 };
  const p = profile(s, 10);
  assert.deepEqual(p.segs.map((g) => g.kind), ["solid", "sublime", "gas"]);
  const mid = stateAt(p, p.segs[0].J + p.segs[1].J / 2);
  assert.equal(mid.T, 114); assert.equal(mid.phase, "subliming"); assert.equal(mid.fm, 0); assert.ok(Math.abs(mid.fv - 0.5) < 1e-9);
  assert.equal(stateAt(p, p.total).phase, "gas");
});
