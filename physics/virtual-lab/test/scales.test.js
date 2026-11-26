// Lab 6 (the Spring Scale Bench): the model and the checkpoint generators.
import { test } from "node:test";
import assert from "node:assert/strict";
import * as E from "../src/engine/scales.js";

const close = (a, b, tol = 1e-9) => Math.abs(a - b) <= tol;

test("Part A: the scale's spring is seeded, never a test spring, and the softest scale stays on the 30 cm ruler", () => {
  for (const k of E.K_POOL) assert.ok(![50, 200, 400].includes(k), k);
  const seen = new Set(); for (let i = 0; i < 200; i++) seen.add(E.scaleK("s" + i)); assert.ok(seen.size >= 5, "students get different scales");
  assert.equal(E.scaleK("same"), E.scaleK("same"));
  const soft = Math.min(...E.K_POOL), big = Math.max(...E.CAL_MASSES); assert.ok(E.stretchCm(soft, big) <= 30);
  assert.equal(E.stretchCm(40, 0.2), 4.9);
});
test("Part A: k counts within 4 percent; the hint names cm, mass for weight, or the rows", () => {
  assert.ok(E.kOk(36, "36")); assert.ok(E.kOk(36, "35 N/m")); assert.ok(!E.kOk(36, "33")); assert.ok(!E.kOk(36, ""));
  assert.equal(E.kHint(36, [], "0.36"), "cm"); assert.equal(E.kHint(36, [], String(36 / 9.8)), "mass"); assert.equal(E.kHint(36, [], "abc"), "num"); assert.equal(E.kHint(36, [], "70"), "rows");
});
test("Part B: held, the scale reads mg; released it reads less, and the cart never uses the test's 3.0 kg with 1.0 kg", () => {
  assert.ok(close(E.heldT(2, 0.5), 4.9)); assert.ok(close(E.releasedT(2, 0.5), 2 * 0.5 * 9.8 / 2.5));
  for (const M of E.CARTS) for (const m of E.HANGS) { assert.ok(E.releasedT(M, m) < E.heldT(M, m)); assert.ok(close(E.releasedT(M, m), M * E.accel(M, m))); }
  assert.ok(!E.CARTS.includes(3));
});
test("Part C: the rods read the same in both designs; only the upper nut doubles in the as-built design", () => {
  const a = E.hyatt("one", 1, 1), b = E.hyatt("two", 1, 1);
  assert.equal(a.upperRod, b.upperRod); assert.equal(a.lowerRod, b.lowerRod);
  assert.equal(a.nut, a.up); assert.ok(close(b.nut, a.up + a.low, 1e-6)); assert.ok(close(b.nut, 2 * a.nut, 1e-6));
});
test("Part D: each gap holds the links below it and the bucket; the top holds the whole chain", () => {
  assert.ok(close(E.chainT(1, 0.2, 0.5), 0.7 * 9.8, 0.01)); assert.ok(close(E.chainT(E.LINKS, 0.2, 0), 1.2 * 9.8, 0.01));
  for (let j = 1; j < E.LINKS; j++) assert.ok(E.chainT(j + 1, 0.15, 0.5) > E.chainT(j, 0.15, 0.5));
});
test("checkpoints: three types, the generated answer is graded right, and no question repeats the one before it", () => {
  for (const t of E.CK_TYPES) for (let s = 0; s < 30; s++) {
    let prev = null; for (let n = 0; n < 12; n++) { const q = E.question(t, n, "seed" + s); assert.ok(E.grade(q, String(q.ans)), t + " " + JSON.stringify(q)); assert.ok(!E.grade(q, String(q.ans * 1.2 + 1)), "a wrong answer fails"); if (prev) assert.notEqual(q.key, prev.key); prev = q; }
  }
});
test("checkpoints never use the test's numbers", () => {
  for (let s = 0; s < 40; s++) for (let n = 0; n < 12; n++) {
    const a = E.question("spring", n, "t" + s); assert.ok(![50, 200, 400].includes(a.k)); assert.ok(!(a.m === 1.5));
    const b = E.question("string", n, "t" + s); assert.ok(!(b.M === 3 && b.m === 1)); assert.ok(b.m !== 5);
  }
});
test("the hint names what the student did, and never contains the answer", () => {
  const f = E.question("spring", 1, "h"); assert.equal(E.diagnose(f, String(f.k * f.x)), "cm");
  const k = E.question("spring", 0, "h"); assert.equal(E.diagnose(k, String(k.m / (k.x / 100))), "mass");
  let r; for (let n = 0; n < 9 && !r; n++) { const q = E.question("string", n, "h"); if (!q.held) r = q; }
  assert.equal(E.diagnose(r, String(r.m * 9.8)), "held"); assert.equal(E.diagnose(r, String(E.accel(r.M, r.m))), "accel");
  let c; for (let n = 0; n < 20 && !c; n += 2) { const q = E.question("hang", n, "h" + n); if (q.B) c = q; }
  assert.equal(E.diagnose(c, String((c.N * c.mL + c.B) * 9.8)), "whole"); assert.equal(E.diagnose(c, String(c.j * c.mL * 9.8)), "bucket"); assert.equal(E.diagnose(c, String(c.ans / 9.8)), "mass");
  let w; for (let n = 1; n < 40 && !w; n += 2) { const q = E.question("hang", n, "w"); if (q.at === "nut2") w = q; }
  assert.equal(E.diagnose(w, String(w.up)), "own");
});
test("the huddle blanks take the board's words, any case or spacing", () => {
  const b = E.BLANKS; assert.equal(b.length, 5); assert.ok(E.blankOk(b[0], " X ")); assert.ok(E.blankOk(b[2], "Less")); assert.ok(E.blankOk(b[3], "below")); assert.ok(!E.blankOk(b[3], "above"));
  assert.equal(E.lengthOf({ lengthMin: 25 }, ""), 25); assert.equal(E.lengthOf({ lengthMin: 25 }, "?min=30"), 30); assert.equal(E.huddleAt(25), 13);
});
