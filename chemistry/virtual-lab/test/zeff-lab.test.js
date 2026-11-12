import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import * as L from "../src/engine/zeff-lab.js";
import { validateQuests } from "../../../shared/virtual-lab/quests.js";
import { huddleTimes, huddleDue } from "../../../shared/virtual-lab/clock.js";
const Z = createRequire(import.meta.url)("../../shared/zeff.js");
const lab = JSON.parse(readFileSync(new URL("../content/labs/06-effective-nuclear-charge.json", import.meta.url)));

test("the model: sodium is 2, 8, 1 with core 10, Z_eff 1, pull 1/9; magnesium holds harder than sodium", () => {
  const na = Z.atom(11); assert.deepEqual(na.rings, [2, 8, 1]); assert.equal(na.core, 10); assert.equal(na.zeff, 1); assert.equal(Z.frac(na), "1/9");
  assert.equal(L.predictAnswer(Z), "mg"); assert.equal(Z.frac(Z.atom(12)), "2/9");
  const rep = (z) => Z.atom(z).rings.reduce((a, b) => a + b, 0); for (const z of L.ZS) assert.equal(rep(z), z);   // rings always add up to Z
});
test("the huddle blanks come from the model and accept the usual wordings", () => {
  const B = L.BLANKS(Z); assert.equal(B.length, 7);
  assert.ok(L.blankOk(B[0], "Inside")); assert.ok(L.blankOk(B[1], " cancel ")); assert.ok(L.blankOk(B[2], "core"));
  assert.deepEqual(B.slice(3).map((b) => b.ans[0]), ["11", "10", "1", "1/9"]); assert.ok(!L.blankOk(B[3], "10"));
});
test("the mystery atom is seeded by the student, is in the lab's range and is never Li, Na or K", () => {
  const seen = new Set(); for (let i = 0; i < 200; i++) { const z = L.mysteryZ("s" + i); seen.add(z); assert.ok(L.ZS.includes(z)); assert.ok(![3, 11, 19].includes(z)); }
  assert.ok(seen.size > 5); assert.equal(L.mysteryZ("same"), L.mysteryZ("same"));
});
test("length is Ian's call: the lab's lengthMin, overridden by ?min, with the one huddle in the middle", () => {
  assert.equal(L.lengthOf(lab, ""), lab.lengthMin); assert.equal(L.lengthOf(lab, "?lab=zeff&min=30"), 30); assert.equal(L.lengthOf(lab, "?min=2"), lab.lengthMin); assert.equal(L.lengthOf(lab, "?min=99"), lab.lengthMin);
  assert.equal(L.huddleAt(20), 10); assert.equal(L.huddleAt(30), 15);
  const at = huddleTimes({ clock: { huddle1AtMin: 999, huddle2AtMin: 10 } });   // huddle 1 never fires; the single huddle is the shared h2 slot, in the lab stage
  assert.equal(huddleDue({ minutesIn: 3, stage: "lab", done: {}, forced: { 1: true }, at }), null);
  assert.equal(huddleDue({ minutesIn: 10, stage: "lab", done: {}, forced: { 1: true }, at }), 2);
});
test("the lab JSON: quests are valid, rules exist, and the demo text matches the demo's caption count", () => {
  assert.equal(lab.kind, "zeff"); assert.equal(lab.demo.length, 10); assert.ok(lab.lock); assert.ok(lab.lengthMin >= 8);
  assert.deepEqual(validateQuests(lab.quests, ["flame", "entered_lab"]), []); const ids = lab.quests.map((q) => q.id); assert.equal(new Set(ids).size, ids.length);
  for (const w of ["extension", "challenge", "optional", "stars"]) assert.ok(!JSON.stringify(lab.quests).toLowerCase().includes(w), w);
});

test("marking step: only the full set of inner rings matches the meter, for every atom in the lab", () => {
  for (const z of L.ZS) {
    const a = Z.atom(z), inner = a.rings.slice(0, a.n - 1), N = inner.length;
    for (let mask = 0; mask < 1 << N; mask++) {
      const marks = inner.map((_, i) => !!(mask & (1 << i)));
      assert.equal(L.estimateMatches(a, marks), mask === (1 << N) - 1, `${a.sym} mask ${mask}`);
    }
    assert.equal(L.markedElectrons(a, [...inner.map(() => true), true]), a.core, "the outer ring never counts");
  }
});
test("the pull bench room: parses, has the windows and rug, and every object can be reached", async () => {
  const { parseRoom, reachable, tileAt } = await import("../../../shared/virtual-lab/room.js");
  const room = parseRoom(JSON.parse(readFileSync(new URL("../content/rooms/pull-bench.json", import.meta.url)))), geared = { goggles: true, apron: true };
  assert.ok(room.windows && room.windows.back.length && room.windows.left.length);
  assert.ok(!tileAt(room, room.start.x, room.start.y).solid && room.start.y > room.doorRow);
  const objs = []; room.rows.forEach((r, y) => [...r].forEach((ch, x) => { const t = room.legend[ch]; if (t.id && t.type !== "door") objs.push({ t, x, y }); }));
  assert.ok(objs.length >= 8 && objs.some((o) => o.t.id === "pull_rig"));
  for (const o of objs) assert.ok(reachable(room, room.start, o, geared), o.t.id);
  assert.ok(room.rows.join("").includes("r") && Object.values(room.legend).some((t) => t.rug));
});

test("checkpoint questions: seeded, never the same atom twice in a row, graded from the model, and the hint points at the student's slip", () => {
  for (const type of L.CK_TYPES) for (const seed of ["a", "b", "Test Student|zeff-pull"]) {
    let prev = 0; for (let n = 0; n < 40; n++) { const q = L.question(type, n, seed, Z); assert.notEqual(q.Z, prev); prev = q.Z; assert.deepEqual(q, L.question(type, n, seed, Z)); assert.ok(L.ZS.includes(q.Z)); }
  }
  const q = L.question("zeff", 0, "x", Z), a = Z.atom(q.Z);
  assert.equal(q.ans, a.zeff); assert.ok(L.gradeAnswer(q, String(a.zeff))); assert.ok(!L.gradeAnswer(q, "")); assert.ok(!L.gradeAnswer(q, String(a.zeff + 1)));
  assert.equal(L.diagnose(q, String(a.Z), Z), "protons"); assert.equal(L.diagnose(q, String(a.core), Z), "core"); assert.equal(L.diagnose(q, "abc", Z), "num");
  const m = L.question("name", 0, "x", Z); assert.ok(L.gradeAnswer(m, m.Z)); assert.ok(!L.gradeAnswer(m, m.Z + 1));
  const other = Z.atom(m.Z).n === 2 ? 11 : 3; assert.equal(L.diagnose(m, other, Z), "rings");
  for (const k of ["num", "protons", "core", "count", "rings", "pull"]) assert.ok(lab.ui["cpHint_" + k], "hint text for " + k);
});
