import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { world, speciesData } from "../src/engine/load.js";
import { newContainer, add, advance, heat, conductivity } from "../src/engine/sim.js";
import { fingerprint, OBS } from "../src/engine/lab1.js";

const lab = JSON.parse(readFileSync(new URL("../content/labs/01-unknown-solids.json", import.meta.url), "utf8"));
const el = speciesData.electrolytes;
const solids = speciesData.species.filter((s) => s.phase === "s").map((s) => s.id);

test("each solid has a unique result fingerprint, so the lab is solvable", () => {
  const seen = new Map();
  for (const id of solids) {
    const fp = fingerprint(world, el, id, lab.standard);
    const key = JSON.stringify(fp);
    assert.ok(!seen.has(key), `${id} has the same results as ${seen.get(key)}: ${key}`);
    seen.set(key, id);
    for (const k in fp) assert.ok(OBS[k].includes(fp[k]), `${id}.${k}=${fp[k]} not an allowed option`);
  }
});

test("the fingerprints match the chemistry we expect", () => {
  const f = (id) => fingerprint(world, el, id, lab.standard);
  assert.deepEqual(f("NaCl"), { solubility: "full", conductivity: "bright", vinegar: "none", iodine: "no change", heating: "none" });
  assert.deepEqual(f("sucrose"), { solubility: "full", conductivity: "off", vinegar: "none", iodine: "no change", heating: "browns" });
  assert.deepEqual(f("NaHCO3"), { solubility: "partial", conductivity: "bright", vinegar: "fast", iodine: "no change", heating: "bubbles" });
  assert.deepEqual(f("CaCO3"), { solubility: "none", conductivity: "off", vinegar: "slow", iodine: "no change", heating: "none" });
  assert.deepEqual(f("starch"), { solubility: "none", conductivity: "off", vinegar: "none", iodine: "blue-black", heating: "browns" });
  assert.deepEqual(f("citric"), { solubility: "full", conductivity: "dim", vinegar: "none", iodine: "no change", heating: "melts" });
});

test("conductivity: salt solution ~ lambda x c, pure water off, vinegar dim", () => {
  let c = newContainer("a", 2000); add(world, c, "NaCl", 5.844); add(world, c, "water", 1000);
  const r = conductivity(world, c, el);
  assert.ok(Math.abs(r.kappa - 10.7) < 0.1, `0.1 M NaCl should be ~10.7 mS/cm, got ${r.kappa}`);
  c = newContainer("b", 250); add(world, c, "water", 100);
  assert.equal(conductivity(world, c, el).bulb, "off");
  c = newContainer("c", 250); add(world, c, "vinegar", 50);
  assert.equal(conductivity(world, c, el).bulb, "dim");
  assert.equal(conductivity(world, newContainer("d", 250), el).bulb, "off", "no liquid, no reading");
});

test("heating: temperature follows the plate, liquids cap at 100 C, events fire once", () => {
  let c = newContainer("w", 0); add(world, c, "sucrose", 1);
  let events = [];
  for (let t = 0; t < 300; t++) events.push(...heat(world, c, 250, 1));
  assert.ok(c.T > 240, `should approach the plate setting, got ${c.T}`);
  assert.equal(events.filter((e) => e.aboveC === 160).length, 1);
  assert.equal(events.filter((e) => e.aboveC === 186).length, 1);
  c = newContainer("b", 250); add(world, c, "water", 50);
  for (let t = 0; t < 600; t++) heat(world, c, 250, 1);
  assert.ok(c.T <= 100.001, `water cannot exceed 100 C, got ${c.T}`);
  assert.ok(c.seen.boiling);
});
