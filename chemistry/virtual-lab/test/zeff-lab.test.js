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
  assert.equal(lab.kind, "zeff"); assert.equal(lab.demo.length, 9); assert.ok(lab.lock); assert.ok(lab.lengthMin >= 8);
  assert.deepEqual(validateQuests(lab.quests, ["flame", "entered_lab"]), []); const ids = lab.quests.map((q) => q.id); assert.equal(new Set(ids).size, ids.length);
  for (const w of ["extension", "challenge", "optional", "stars"]) assert.ok(!JSON.stringify(lab.quests).toLowerCase().includes(w), w);
});
