// The engine against the formula and the data file: the model, the 20 Hz run with its noise, the marker reading (600 seeds inside the
// tolerance), the paper cards, the gates, the record logic, and the Checks bands, hint ladder and generators.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import * as E from "../src/engine/fancart.js";
import * as R from "../src/engine/record.js";
import * as K from "../src/engine/checks.js";

const J = (f) => JSON.parse(readFileSync(new URL("../content/" + f, import.meta.url), "utf8"));
const D = J("slot-07-data.json"), I = J("slot-07-items.json");
const r2 = (x) => Math.round(x * 100) / 100;
const mean = (a) => a.reduce((x, y) => x + y, 0) / a.length, sd = (a) => { const m = mean(a); return Math.sqrt(mean(a.map((x) => (x - m) ** 2))); };

test("the model: a = (F - f) / m reproduces the data file's expected accelerations", () => {
  for (const r of D.part1) assert.equal(r2(E.accelOf(D, r.F_N, r.m_kg)), r.a_expected);
  for (const r of D.part2) assert.equal(r2(E.accelOf(D, r.F_N, r.m_kg)), r.a_expected);
  assert.equal(r2(E.accelOf(D, D.test.F_N, D.test.m_kg)), D.test.a_expected);
  assert.equal(E.forceOf(D, 3), 0.45); assert.equal(E.massOf(D, 0), 0.5); assert.equal(E.massOf(D, 4), 1.5); assert.equal(E.massOf(D, 3), 1.25);
});
test("the cart takes 0 to 4 bars and the longest run stays on the 2 m track", () => {
  assert.equal(E.MAX_BARS(D), 4);
  const longest = Math.max(...[1, 2, 3, 4].flatMap((s) => [0, 1, 2, 3, 4].map((b) => E.xAt(D, E.forceOf(D, s), E.massOf(D, b), D.run.duration_s.value))));
  assert.ok(longest > D.track.length_m.value, "an unlisted run (no bars, setting 4) would roll past the rail, so the picture stops the cart at the sensor");
  const nine = [...D.part1.map((r) => [r.F_N, r.m_kg]), ...D.part2.map((r) => [r.F_N, r.m_kg]), [D.test.F_N, D.test.m_kg]].map(([F, m]) => E.xAt(D, F, m, 2));
  assert.ok(Math.max(...nine) < D.track.length_m.value, "the nine runs of the sheet stay on the track");
});
test("a run is 41 dots, 20 a second for 2.0 s, starting at rest; the same seed repeats and a new seed changes the noise", () => {
  const a = E.run(D, { setting: 2, bars: 2, seed: 5 }), b = E.run(D, { setting: 2, bars: 2, seed: 5 }), c = E.run(D, { setting: 2, bars: 2, seed: 6 });
  assert.equal(a.t.length, 41); assert.equal(a.t[0], 0); assert.equal(a.t[40], 2); assert.equal(a.v[0], 0); assert.equal(a.t[1], 0.05);
  assert.deepEqual(a.v, b.v); assert.notDeepEqual(a.v, c.v);
  assert.equal(new Set(Array.from({ length: 50 }, () => E.freshSeed())).size, 50, "a fresh seed each run");
  a.v.forEach((v) => assert.equal(v, r2(v), "sensor shows two decimals"));
});
test("noise: about 0.008 m/s on every dot (Box-Muller), none on the dot at 0 s", () => {
  const res = []; for (let s = 1; s <= 300; s++) { const rn = E.run(D, { setting: 3, bars: 2, seed: s }); rn.t.forEach((t, i) => { if (t > 0) res.push(rn.v[i] - E.accelOf(D, rn.F, rn.m) * t); }); }
  assert.ok(Math.abs(mean(res)) < 0.002, "mean " + mean(res));
  assert.ok(sd(res) > 0.007 && sd(res) < 0.011, "sd " + sd(res));
  const g = (() => { const rng = E.mulberry32(9), xs = Array.from({ length: 20000 }, () => E.gauss(rng)); return [mean(xs), sd(xs)]; })();
  assert.ok(Math.abs(g[0]) < 0.03 && Math.abs(g[1] - 1) < 0.03, "standard normal " + g);
});
test("paper cards regenerate exactly from seeds 700 to 708, and the card reading is inside the tolerance", () => {
  D.paperRuns.cards.forEach((c, i) => {
    assert.deepEqual(E.sample(D, c.F_N, c.m_kg, 700 + i, c.t_s), c.v_mps, c.id);
    assert.ok(E.within(D, r2((c.v_mps[4] - c.v_mps[0]) / 2.0), c.a_true), c.id);
  });
});
test("the marker reading is the least-squares slope between the markers; markers closer than 0.5 s give no number", () => {
  const exact = { t: E.runTimes(D), v: E.runTimes(D).map((t) => 0.44 * t) };
  assert.equal(E.read(D, exact, 0.2, 1.8).a, 0.44); assert.equal(E.read(D, exact, 1.8, 0.2).a, 0.44, "order does not matter");
  const near = E.read(D, exact, 0.9, 1.1); assert.equal(near.ok, false); assert.equal(near.short, true); assert.equal(near.a, undefined, "no number");
  assert.equal(E.read(D, exact, 0.9, 1.35).ok, false); assert.equal(E.read(D, exact, 0.9, 1.4).ok, true, "0.5 s apart is allowed");
  assert.equal(E.read(D, exact, 1, 1.4).ok, false);
  const bent = { t: exact.t, v: exact.t.map((t) => 0.1 * t * t) }, fit = E.lsq(bent.t, bent.v); assert.ok(fit.r2 < 1);
  assert.equal(E.read(D, bent, 0, 2).a, r2(fit.slope), "the reading is the fit, not the end point");
});
test("600 seeds: every table run reads inside the tolerance with the markers far apart", () => {
  const rows = [...D.part1.map((r) => [r.F_N, r.m_kg, r.a_expected]), ...D.part2.map((r) => [r.F_N, r.m_kg, r.a_expected]), [D.test.F_N, D.test.m_kg, D.test.a_expected]];
  assert.equal(rows.length, 9);
  for (const [F, m, want] of rows) for (let seed = 0; seed < 600; seed++) {
    const setting = D.fan.settings.find((s) => s.F_N === F).setting, bars = Math.round((m - 0.5) / 0.25), rn = E.run(D, { setting, bars, seed });
    for (const [a, b] of [[0, 2], [0.2, 1.8], [0.5, 1.5]]) { const got = E.read(D, rn, a, b); assert.ok(got.ok && E.within(D, got.a, want), `F ${F} m ${m} seed ${seed} markers ${a}-${b}: ${got.a} vs ${want}`); }
  }
});
test("a short stretch is shakier than a long one (why the markers have to be spread)", () => {
  const long = [], short = []; for (let s = 0; s < 400; s++) { const rn = E.run(D, { setting: 2, bars: 2, seed: s }); long.push(E.read(D, rn, 0.2, 1.8).a); short.push(E.read(D, rn, 1.0, 1.5).a); }
  assert.ok(sd(short) > 3 * sd(long), `short ${sd(short)} long ${sd(long)}`);
});
test("the patterns of the data: doubling the fan force is about x2 (2.07 and 2.03 with the drag), doubling the mass is x0.5", () => {
  const a = (F, m) => E.accelOf(D, F, m);
  assert.ok(Math.abs(a(0.3, 1) / a(0.15, 1) - 2.07) < 0.01 && Math.abs(a(0.6, 1) / a(0.3, 1) - 2.03) < 0.01);
  assert.ok(Math.abs(a(0.45, 1) / a(0.45, 0.5) - 0.5) < 1e-12 && Math.abs(a(0.45, 1.5) / a(0.45, 0.75) - 0.5) < 1e-12);
  const f = E.lsq(D.part1.map((r) => r.F_N), D.part1.map((r) => E.accelOf(D, r.F_N, 1))); assert.ok(Math.abs(f.slope - D.derived.a_vs_F.slope_expected) < 1e-9 && Math.abs(f.intercept - D.derived.a_vs_F.intercept_expected) < 1e-9);
  const g = E.lsq(D.part2.map((r) => 1 / r.m_kg), D.part2.map((r) => E.accelOf(D, r.F_N, r.m_kg))); assert.ok(Math.abs(g.slope - D.derived.a_vs_invm.slope_expected) < 1e-9 && Math.abs(g.intercept) < 1e-9);
});

// ---------- the record ----------
test("Part 1 keeps 2 bars, Part 2 keeps setting 3; the run that fits both fills Part 1 first, then Part 2", () => {
  assert.equal(R.part1Bars(D), 2); assert.equal(R.part2Setting(D), 3); assert.deepEqual(R.part1Settings(D), [1, 2, 3, 4]); assert.deepEqual(R.part2Bars(D), [0, 1, 2, 4]);
  const rows = R.emptyRows();
  assert.equal(R.partOf(D, rows, { setting: 1, bars: 2 }), "1"); assert.equal(R.partOf(D, rows, { setting: 3, bars: 0 }), "2"); assert.equal(R.partOf(D, rows, { setting: 1, bars: 0 }), null);
  assert.equal(R.partOf(D, rows, { setting: 3, bars: 2 }), "1"); R.addRow(D, rows, "1", { setting: 3, bars: 2 }, 1.0, 0.44);
  assert.equal(R.partOf(D, rows, { setting: 3, bars: 2 }), "2", "the second 2-bar run on setting 3 goes in Part 2");
  assert.equal(R.partOf(D, rows, { setting: 3, bars: 3 }), "test"); assert.equal(R.partOf(D, rows, { setting: 2, bars: 3 }), null);
});
test("gates: Part 2 waits for the mass prediction; the test run waits for code 2 and a typed prediction", () => {
  const st = { huddle2: false, pred: { mass: null, test: null } };
  assert.equal(R.runBlock(D, st, 2), null, "Part 1 is open");
  for (const b of [0, 1, 4]) assert.equal(R.runBlock(D, st, b), "predict");
  assert.equal(R.runBlock(D, st, 3), "after");
  st.pred.mass = { i: 0 }; for (const b of [0, 1, 4]) assert.equal(R.runBlock(D, st, b), null);
  assert.equal(R.runBlock(D, st, 3), "after", "a prediction does not open the test");
  st.huddle2 = true; assert.equal(R.runBlock(D, st, 3), "predict"); st.pred.test = { value: 0.35 }; assert.equal(R.runBlock(D, st, 3), null);
});
test("the typed mass is checked within 0.01 kg of the cart plus its bars", () => {
  assert.ok(R.massOk(D, 1.0, 2) && R.massOk(D, 1.01, 2) && R.massOk(D, 0.99, 2)); assert.ok(!R.massOk(D, 1.02, 2) && !R.massOk(D, 0.5, 2) && !R.massOk(D, NaN, 2) && R.massOk(D, 1.25, 3) && R.massOk(D, 0.5, 0));
});
test("graph dots: Part 1 rows for fan force, Part 2 rows for mass and 1/m; the guide line needs three dots", () => {
  const rows = R.emptyRows(); D.part1.forEach((r, i) => R.addRow(D, rows, "1", { setting: i + 1, bars: 2 }, 1, r.a_expected)); D.part2.forEach((r) => R.addRow(D, rows, "2", { setting: 3, bars: r.bars }, r.m_kg, r.a_expected));
  assert.deepEqual(R.dots(rows, "F").map((p) => [p.x, p.y]), D.part1.map((r) => [r.F_N, r.a_expected]));
  assert.deepEqual(R.dots(rows, "m").map((p) => [p.x, p.y]), D.part2.map((r) => [r.m_kg, r.a_expected]).sort((a, b) => a[0] - b[0]));
  assert.deepEqual(R.dots(rows, "invm").map((p) => p.x), [0.67, 1, 1.33, 2], "1/m from the typed masses");
  assert.equal(R.guideLine(R.dots(rows, "F").slice(0, 2)), null); const line = R.guideLine(R.dots(rows, "invm")); assert.ok(Math.abs(line.intercept) < 0.02 && Math.abs(line.slope - 0.44) < 0.02, "through the corner");
  assert.ok(R.guideLine(R.dots(rows, "m")).r2 < 0.97, "mass against acceleration is not a line");
});
test("the CER count check: two numbers from each of the student's own tables; numbers under 0.1 are ignored", () => {
  const rows = R.emptyRows(); D.part1.forEach((r, i) => R.addRow(D, rows, "1", { setting: i + 1, bars: 2 }, 1, r.a_expected)); D.part2.forEach((r) => R.addRow(D, rows, "2", { setting: 3, bars: r.bars }, r.m_kg, r.a_expected));
  assert.deepEqual(R.numbersIn("a was 0.14 then 0.29, about 2 times; 0.05 N and .59"), [0.14, 0.29, 2, 0.59]);
  const c = R.cited("At 0.15 N the acceleration was 0.14 and at 0.30 N it was 0.29. At 0.50 kg it was 0.88 and at 1.50 kg it was 0.29.", rows); assert.equal(c.ok, true);
  const lucky = R.cited("It was 0.05 and 0.08 and 0.02 so it doubled.", rows); assert.equal(lucky.ok, false); assert.equal(lucky.part1 + lucky.part2, 0);
  assert.equal(R.cited("Only 0.14 and 0.29 from Part 1.", rows).ok, false);
  assert.equal(R.tablesDone(D, rows), true); assert.equal(R.tablesDone(D, R.emptyRows()), false);
});

// ---------- Checks: bands, hints, generators ----------
test("generators regenerate the sheet's samples from the sheet's seeds, and every answer is inside the tolerance of the model", () => {
  ["g1", "g2", "g3"].forEach((k, i) => { const rng = E.mulberry32(11 * 10 + i), want = I.generators.samples[k]; want.forEach((s, j) => assert.equal(JSON.stringify(K.GEN[k](D, rng)), JSON.stringify(s), k + " sample " + j)); });
  for (let s = 0; s < 600; s++) { const rng = E.mulberry32(s), a = K.GEN.g2(D, rng), b = K.GEN.g3(D, rng); assert.ok(Math.abs(a.answer - a.model) <= a.tol && Math.abs(b.answer - b.model) <= b.tol, "seed " + s); }
});
test("Checks starts at band 1, rises on clean first tries only, and holds more items than the time allows", () => {
  const st = K.newChecks(); assert.equal(st.band, 1);
  let it = K.nextItem(I, D, st, "Sam"); assert.equal(it.band, 1); assert.ok(it.id.startsWith("b1-"));
  assert.equal(K.answerItem(I, st, it, 1).state, "hint"); assert.equal(st.band, 1, "a miss does not raise the band");
  assert.equal(K.answerItem(I, st, it, it.type === "num" ? it.answer : it.answer).state, "right"); assert.equal(st.band, 1, "right after a hint does not raise it");
  it = K.nextItem(I, D, st, "Sam"); assert.equal(it.band, 1); K.answerItem(I, st, it, it.type === "num" ? it.answer : it.answer); assert.equal(st.band, 2, "a clean first try raises it");
  for (let n = 0; n < 40; n++) { const x = K.nextItem(I, D, st, "Sam"); assert.ok(x, "never runs out"); K.answerItem(I, st, x, x.type === "num" ? x.answer : x.answer); }
  assert.equal(st.band, 3, "three bands, the top is the standard"); assert.ok(st.done.length >= 40);
  assert.ok(Object.keys(st.res).some((id) => id.includes("#")), "generated problems follow the bank");
});
test("the hint ladder: each hint costs the try, hint 1 is the step card, no hint gives the answer, and the item closes after the third", () => {
  const st = K.newChecks(), it = I.items.find((i) => i.id === "b1-2");
  const wrong = it.answer + 1; let r;
  for (let k = 1; k <= 3; k++) { r = K.answerItem(I, st, it, wrong); assert.equal(r.state, "hint"); assert.equal(r.hint, it.hints[k - 1]); assert.equal(r.hints, k); }
  assert.match(it.hints[0], /step card/i);
  r = K.answerItem(I, st, it, wrong); assert.equal(r.state, "closed"); assert.ok(st.done.includes("b1-2"));
  assert.equal(K.answerItem(I, st, it, it.answer).state, "closed", "a closed item stays closed");
  const tol = K.answerItem(I, K.newChecks(), it, it.answer + 0.029); assert.equal(tol.state, "right", "within the item's own tolerance");
  assert.equal(K.answerItem(I, K.newChecks(), it, it.answer + 0.04).state, "hint");
});
test("generated problems carry the three hints and none of them gives the answer (600 seeds, every band)", () => {
  for (const band of [1, 2, 3]) for (let s = 0; s < 600; s++) {
    const it = K.genItem(I, D, "seed" + s, band, s % 7);
    assert.equal(it.hints.length, 3); assert.match(it.hints[0], /step card/i); assert.equal(K.leaks(it), false, it.prompt);
    assert.equal(it.type, "num"); assert.ok(it.tol >= 0.03);
  }
  const g1 = K.genItem(I, D, "x", 1, 0); assert.equal(g1.hints[0], I.items.find((i) => i.id === "b1-2").hints[0]); assert.equal(g1.hints[2], I.items.find((i) => i.id === "b1-2").hints[2]);
  assert.deepEqual(K.genItem(I, D, "x", 2, 3), K.genItem(I, D, "x", 2, 3), "seeded by the student");
});
