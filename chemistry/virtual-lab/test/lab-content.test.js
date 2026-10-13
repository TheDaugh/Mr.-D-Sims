import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { buildWorld, newContainer, add, advance } from "../src/engine/sim.js";
import { microModel } from "../src/engine/micro.js";
import { questDone, validateQuests } from "../src/engine/quests.js";

const J = (p) => JSON.parse(readFileSync(new URL(p, import.meta.url)));
const species = J("../content/species.json"), reactions = J("../content/reactions.json"), lab = J("../content/labs/01-unknown-solids.json");
const world = buildWorld(species, reactions);

test("every formula a student can see has a particle picture", () => {
  const formulas = new Set([...species.species.filter((s) => s.phase === "s").map((s) => s.formula), ...species.products.map((p) => p.formula), "CH3COOH", "I2", "H2O"]);
  for (const f of formulas) assert.ok(species.micro[f], f);
});
test("micro: dissolved salt gives ions, sugar gives molecules, chalk stays a lattice", () => {
  const a = newContainer("a", 250); add(world, a, "water", 20); add(world, a, "NaCl", 3);
  let m = microModel(world, a, species.micro);
  assert.deepEqual(m.dissolved.map((d) => d.label).sort(), ["Cl⁻", "Na⁺"]); assert.equal(m.lattice.length, 0);
  add(world, a, "NaCl", 10); m = microModel(world, a, species.micro); assert.equal(m.lattice.length, 1);
  const s = newContainer("s", 250); add(world, s, "water", 20); add(world, s, "sucrose", 3);
  m = microModel(world, s, species.micro); assert.equal(m.dissolved[0].shape, "molecule"); assert.equal(m.dissolved.some((d) => d.shape === "ion"), false);
  const c = newContainer("c", 250); add(world, c, "water", 20); add(world, c, "CaCO3", 1);
  m = microModel(world, c, species.micro); assert.equal(m.dissolved.length, 0); assert.equal(m.lattice[0].kind, "ionic");
});
test("micro: fizzing shows CO2 and the acetic acid is visible in vinegar", () => {
  const c = newContainer("c", 250); add(world, c, "NaHCO3", 1); add(world, c, "vinegar", 20);
  advance(world, c, 1);
  const m = microModel(world, c, species.micro, { fizz: 0.8 });
  assert.ok(m.gas.length === 1 && m.gas[0].count >= 2); assert.ok(m.dissolved.some((d) => d.label === "acetic acid" || d.label === "sodium acetate"));
});
test("lab content: prelab questions have one correct answer, quests are well formed", () => {
  for (const q of lab.prelab.questions) { assert.ok(q.options.length >= 3 && q.options[q.correct] && q.explain, q.id); }
  assert.ok(lab.prelab.prediction.minWords > 0 && lab.postlab.rubric.length === 3 && lab.theory.length >= 5);
  assert.deepEqual(validateQuests(lab.quests), []);
});
test("quests read the event log", () => {
  const ev = [{ type: "take", jar: "uA" }, { type: "take", jar: "uA" }, { type: "take", jar: "uB" }, { type: "add", substance: "water", unit: "mL", shown_as: "distilled water" }, { type: "add", substance: "NaCl", unit: "g", shown_as: "sodium chloride (known)" }, { type: "hotplate", on: true }, { type: "door", outcome: "entered" }];
  const q = (id) => lab.quests.find((x) => x.id === id), st = { ppe: { goggles: true, apron: true }, notebookFilled: 10 };
  assert.equal(questDone(q("jars"), ev, st), false);
  ev.push({ type: "take", jar: "uC" }, { type: "take", jar: "uD" });
  assert.equal(questDone(q("jars"), ev, st), true); assert.equal(questDone(q("weigh"), ev, st), true);
  assert.equal(questDone(q("gear"), ev, st), true); assert.equal(questDone(q("door"), ev, st), true);
  assert.equal(questDone(q("heat"), ev, st), true); assert.equal(questDone(q("sol"), ev, st), false);
  assert.equal(questDone(q("notebook"), ev, st), false); assert.equal(questDone(q("known"), ev, st), false);
});

test("micro: an unknown's identity is hidden, reagents stay named", async () => {
  const { legend } = await import("../src/engine/micro.js");
  const c = newContainer("c", 250); add(world, c, "water", 20); add(world, c, "NaCl", 3); add(world, c, "vinegar", 10);
  const m = microModel(world, c, species.micro, { anon: true });
  const labels = m.dissolved.map((d) => d.label);
  assert.ok(labels.includes("+ ion") && labels.includes("− ion") && labels.includes("acetic acid"));
  assert.equal(labels.some((l) => /Na|Cl/.test(l)), false);
  assert.ok(legend(m).length >= 3);
});
