import test from "node:test";
import assert from "node:assert/strict";
import { world, speciesData, reactionData } from "../src/engine/load.js";
import { molarMass, parseFormula, isBalanced } from "../src/engine/formula.js";
import { newContainer, add, advance, dissolvedGrams, gasVolumeL, gasMolarVolumeL, massAccounting, allPairs, resolvePair } from "../src/engine/sim.js";

const close = (a, b, rel, msg) => assert.ok(Math.abs(a - b) <= Math.abs(b) * rel, `${msg || ""} got ${a}, expected ${b} (±${rel * 100}%)`);

test("formula parser handles nested groups", () => {
  assert.deepEqual(parseFormula("Ca3(C6H5O7)2"), { Ca: 3, C: 12, H: 10, O: 14 });
  close(molarMass("Ca3(C6H5O7)2"), 498.432, 1e-4);
  close(molarMass("H2O"), 18.015, 1e-4);
  assert.throws(() => parseFormula("Xx2"));
  assert.throws(() => parseFormula("Ca(OH"));
});

test("every species molar mass matches its formula", () => {
  for (const s of speciesData.species.filter((s) => s.phase === "s")) {
    assert.ok(Math.abs(molarMass(s.formula) - s.molarMass) < 0.05, `${s.id}: table ${s.molarMass} vs formula ${molarMass(s.formula).toFixed(3)}`);
  }
});

test("every liquid's components add up to its density", () => {
  for (const s of speciesData.species.filter((s) => s.phase === "l")) {
    const sum = Object.values(s.components).reduce((a, b) => a + b, 0);
    assert.ok(Math.abs(sum - s.density) < 0.002, `${s.id}: components ${sum} vs density ${s.density}`);
  }
});

test("every reaction is balanced and its products are defined", () => {
  for (const r of reactionData.reactions.filter((r) => r.kind !== "observation")) {
    assert.ok(isBalanced(r), `${r.id} is not balanced`);
    for (const f of Object.keys(r.products)) assert.ok(world.products.has(f), `${r.id}: product ${f} missing from products list`);
    for (const f of Object.keys(r.reactants)) parseFormula(f);
  }
});

test("solubility limits dissolving", () => {
  let c = newContainer("beaker", 250);
  add(world, c, "NaCl", 50); add(world, c, "water", 100);
  close(dissolvedGrams(world, c, "NaCl"), 35.9, 1e-9);
  c = newContainer("beaker", 250); add(world, c, "sucrose", 100); add(world, c, "water", 100);
  close(dissolvedGrams(world, c, "sucrose"), 100, 1e-9);
  c = newContainer("beaker", 250); add(world, c, "CaCO3", 1); add(world, c, "water", 100);
  assert.ok(dissolvedGrams(world, c, "CaCO3") < 0.002, "chalk should be essentially insoluble");
  c = newContainer("beaker", 250); add(world, c, "NaCl", 5);
  assert.equal(dissolvedGrams(world, c, "NaCl"), 0, "nothing dissolves without a liquid");
});

test("baking soda + vinegar: acetic acid limits the CO2", () => {
  const c = newContainer("beaker", 250);
  add(world, c, "NaHCO3", 5.0); add(world, c, "vinegar", 50);
  advance(world, c, 120);
  const molAcOH = (50 * 0.050) / molarMass("CH3COOH");
  close(c.gasLostMol.CO2, molAcOH, 0.005, "CO2 moles");
  close(gasVolumeL(c), molAcOH * gasMolarVolumeL(22), 0.005, "CO2 liters");
  assert.ok(c.solids.NaHCO3 > 0, "excess baking soda should be left over");
});

test("mass is conserved, counting gas that left the container", () => {
  const c = newContainer("beaker", 250);
  add(world, c, "NaHCO3", 5); add(world, c, "citric", 3); add(world, c, "CaCO3", 4);
  add(world, c, "vinegar", 30); add(world, c, "water", 20);
  const before = massAccounting(world, c).total;
  advance(world, c, 500);
  const after = massAccounting(world, c);
  close(after.total, before, 1e-9, "total mass");
  assert.ok(after.escaped > 0);
});

test("fast reactions finish before slow ones", () => {
  const fast = newContainer("a", 250), slow = newContainer("b", 250);
  add(world, fast, "NaHCO3", 1); add(world, fast, "vinegar", 50);
  add(world, slow, "CaCO3", 1); add(world, slow, "vinegar", 50);
  advance(world, fast, 60); advance(world, slow, 60);
  const fastDone = 1 - fast.solids.NaHCO3 / 1, slowDone = 1 - slow.solids.CaCO3 / 1;
  assert.ok(fastDone > 0.99, `baking soda should be gone in a minute (${fastDone})`);
  assert.ok(slowDone < 0.25, `chalk should still be mostly there (${slowDone})`);
});

test("baking soda + citric acid: nothing dry, fizz when water is added", () => {
  const c = newContainer("beaker", 250);
  add(world, c, "NaHCO3", 5); add(world, c, "citric", 3);
  advance(world, c, 1000);
  assert.equal(c.gasLostMol.CO2 || 0, 0, "dry powders must not react");
  add(world, c, "water", 20);
  advance(world, c, 600);
  const citricMol = 3 / molarMass("C6H8O7");
  close(c.gasLostMol.CO2, 3 * citricMol, 0.02, "CO2 from citric acid limiting");
});

test("chalk + citric acid makes a precipitate", () => {
  const c = newContainer("beaker", 250);
  add(world, c, "CaCO3", 3); add(world, c, "citric", 2); add(world, c, "water", 50);
  advance(world, c, 3000);
  assert.ok((c.precip["Ca3(C6H5O7)2"] || 0) > 0, "calcium citrate should form");
});

test("starch-iodine test reports blue-black only with both and a liquid", () => {
  const ok = newContainer("a", 100); add(world, ok, "starch", 1); add(world, ok, "iodine", 10);
  const ev = advance(world, ok, 1);
  assert.ok(ev.some((e) => e.id === "starch_iodine" && /blue-black/.test(e.observations[0])));
  const none = newContainer("b", 100); add(world, none, "starch", 1); add(world, none, "vinegar", 10);
  assert.equal(advance(world, none, 5).filter((e) => e.id === "starch_iodine").length, 0);
  const dry = newContainer("c", 100); add(world, dry, "starch", 1);
  assert.equal(advance(world, dry, 5).length, 0);
});

test("overflow is reported, not silently allowed", () => {
  const c = newContainer("small", 100); add(world, c, "water", 90);
  assert.throws(() => add(world, c, "water", 20), (e) => e.code === "OVERFLOW");
});

test("all 36 stock pairs resolve to a stated behavior", () => {
  const pairs = allPairs(world);
  assert.equal(pairs.length, 36);
  for (const [a, b] of pairs) assert.ok(resolvePair(world, a, b).text.length > 0, `${a}+${b}`);
  assert.equal(resolvePair(world, "NaHCO3", "vinegar").kind, "reaction");
  assert.match(resolvePair(world, "NaHCO3", "citric").text, /no reaction while dry/);
  assert.equal(resolvePair(world, "NaCl", "water").kind, "dissolves");
  assert.equal(resolvePair(world, "CaCO3", "water").kind, "insoluble");
  assert.equal(resolvePair(world, "starch", "iodine").kind, "reaction");
  assert.equal(resolvePair(world, "vinegar", "water").kind, "none");
});
