// The lab engine: containers, dissolution, reactions over time, mass accounting.
// Pure functions over plain data. The UI never contains chemistry facts.
import { molarMass } from "./formula.js";

const R = 0.082057; // L·atm/(mol·K)
export const gasMolarVolumeL = (T_C) => R * (T_C + 273.15); // at 1 atm

export function buildWorld(speciesData, reactionData) {
  const species = new Map(speciesData.species.map((s) => [s.id, s]));
  const products = new Map(speciesData.products.map((p) => [p.formula, p]));
  return { species, products, reactions: reactionData.reactions };
}

export function newContainer(name, capacity_mL) {
  return {
    name, capacity_mL, T: 22, t: 0,
    solids: {},                 // speciesId -> grams (undissolved + dissolved; see dissolvedGrams)
    solution: { mL: 0, comps: {} }, // formula -> grams in the liquid
    precip: {},                 // formula -> grams of new solid formed
    gasLostMol: {},             // formula -> mol that escaped (open container)
    seen: {}                    // reaction id -> true once its observations were reported
  };
}

// Add `amount` of a stock species: grams for solids, mL for liquids.
export function add(world, c, speciesId, amount) {
  const s = world.species.get(speciesId);
  if (!s) throw new Error(`Unknown substance ${speciesId}`);
  if (!(amount > 0)) throw new Error("Amount must be positive");
  if (s.phase === "s") {
    c.solids[speciesId] = (c.solids[speciesId] || 0) + amount;
  } else {
    if (c.solution.mL + amount > c.capacity_mL + 1e-9) {
      const e = new Error(`${c.name} overflows`); e.code = "OVERFLOW"; throw e;
    }
    c.solution.mL += amount;
    for (const f in s.components) c.solution.comps[f] = (c.solution.comps[f] || 0) + s.components[f] * amount;
  }
}

// Grams of a solid species that can be dissolved at this moment (solubility x liquid volume).
export function dissolvedGrams(world, c, speciesId) {
  const s = world.species.get(speciesId), g = c.solids[speciesId] || 0;
  if (!g || c.solution.mL <= 0) return 0;
  return Math.min(g, (s.solubility * c.solution.mL) / 100);
}

// Grams of a component (by formula) available to react right now.
function available(world, c, formula) {
  let g = c.solution.comps[formula] || 0;
  for (const id in c.solids) if (world.species.get(id).formula === formula) g += c.solids[id];
  return g;
}
function draw(world, c, formula, grams) {
  let left = grams;
  const fromSol = Math.min(left, c.solution.comps[formula] || 0);
  if (fromSol) { c.solution.comps[formula] -= fromSol; left -= fromSol; }
  for (const id in c.solids) {
    if (left <= 0) break;
    if (world.species.get(id).formula !== formula) continue;
    const take = Math.min(left, c.solids[id]);
    c.solids[id] -= take; left -= take;
  }
}
// How fast a solid reactant can meet the others: only the dissolved part reacts at full rate.
function contactFactor(world, c, formula) {
  for (const id in c.solids) {
    const s = world.species.get(id);
    if (s.formula !== formula || !(c.solids[id] > 0)) continue;
    if (s.solubility >= 1) return Math.min(1, dissolvedGrams(world, c, id) / c.solids[id]);
    return 1; // insoluble powder reacts at its surface; k already reflects that
  }
  return 1;
}

// Advance time by dt seconds. Returns the events that happened.
export function advance(world, c, dt) {
  const events = [];
  const STEP = 0.25;
  let remaining = dt;
  while (remaining > 1e-12) {
    const h = Math.min(STEP, remaining);
    remaining -= h;
    for (const r of world.reactions) {
      if (r.needsMedium && !(c.solution.mL > 0)) continue;
      const formulas = Object.keys(r.reactants);
      const avail = formulas.map((f) => available(world, c, f));
      if (avail.some((g) => g <= 1e-12)) continue;
      if (r.kind === "observation") {
        if (!c.seen[r.id]) { c.seen[r.id] = true; events.push({ type: "observation", id: r.id, t: c.t, observations: r.observations }); }
        continue;
      }
      const molesAvail = formulas.map((f, i) => avail[i] / molarMass(f) / r.reactants[f]);
      const xiMax = Math.min(...molesAvail);
      const contact = Math.min(...formulas.map((f) => contactFactor(world, c, f)));
      const xi = xiMax * (1 - Math.exp(-r.k * contact * h));
      if (xi < 1e-12) continue;
      for (const f of formulas) draw(world, c, f, xi * r.reactants[f] * molarMass(f));
      for (const f in r.products) {
        const mol = xi * r.products[f], g = mol * molarMass(f), phase = world.products.get(f).phase;
        if (phase === "g") c.gasLostMol[f] = (c.gasLostMol[f] || 0) + mol;
        else if (phase === "s") c.precip[f] = (c.precip[f] || 0) + g;
        else c.solution.comps[f] = (c.solution.comps[f] || 0) + g;
      }
      if (!c.seen[r.id] && xi > 1e-6) {
        c.seen[r.id] = true;
        events.push({ type: "reaction", id: r.id, t: c.t, observations: r.observations });
      }
    }
    c.t += h;
  }
  return events;
}

export function gasVolumeL(c, formula = "CO2") {
  return (c.gasLostMol[formula] || 0) * gasMolarVolumeL(c.T);
}

// Mass accounting: everything must add up, including gas that left the container.
export function massAccounting(world, c) {
  const sum = (o) => Object.values(o).reduce((a, b) => a + b, 0);
  const inside = sum(c.solids) + sum(c.solution.comps) + sum(c.precip);
  let escaped = 0;
  for (const f in c.gasLostMol) escaped += c.gasLostMol[f] * molarMass(f);
  return { inside, escaped, total: inside + escaped };
}

// ---- Pair review: what does the sim say happens when two stock substances meet? ----
const compsOf = (s) => (s.phase === "s" ? [s.formula] : Object.keys(s.components));

export function resolvePair(world, aId, bId) {
  const a = world.species.get(aId), b = world.species.get(bId);
  const union = new Set([...compsOf(a), ...compsOf(b)]);
  for (const r of world.reactions) {
    const fs = Object.keys(r.reactants);
    const touchesA = fs.some((f) => compsOf(a).includes(f)), touchesB = fs.some((f) => compsOf(b).includes(f));
    if (fs.every((f) => union.has(f)) && touchesA && touchesB) {
      const dry = a.phase === "s" && b.phase === "s" && r.needsMedium;
      return { kind: "reaction", reaction: r.id, text: dry ? `no reaction while dry; reacts once a liquid is added (${r.id})` : `reacts (${r.id}): ${r.observations.join("; ")}` };
    }
  }
  if (a.phase === "s" && b.phase === "s") return { kind: "none", text: "no reaction (dry solids at bench temperature)" };
  if (a.phase === "l" && b.phase === "l") return { kind: "none", text: "mix completely, no reaction" };
  const solid = a.phase === "s" ? a : b;
  return solid.solubility >= 1
    ? { kind: "dissolves", text: `${solid.name} dissolves (up to ${solid.solubility} g per 100 mL at 20 C), no reaction` }
    : { kind: "insoluble", text: `${solid.name} does not dissolve (${solid.solubility} g per 100 mL), no reaction` };
}

export function pairKey(a, b) { return [a, b].sort().join("+"); }
export function allPairs(world) {
  const ids = [...world.species.keys()], out = [];
  for (let i = 0; i < ids.length; i++) for (let j = i + 1; j < ids.length; j++) out.push([ids[i], ids[j]]);
  return out;
}

// ---- Conductivity: what a conductivity tester bulb would show ----
export function conductivity(world, c, electrolytes) {
  const V = c.solution.mL / 1000; // L
  if (!(V > 0)) return { kappa: 0, bulb: "off" };
  let kappa = 0;
  const term = (formula, grams) => {
    const e = electrolytes[formula];
    if (!e || !(grams > 0)) return;
    const conc = grams / molarMass(formula) / V;
    kappa += e.type === "strong" ? e.lambda * conc : e.lambdaIons * Math.sqrt(e.Ka * conc);
  };
  for (const id in c.solids) { const s = world.species.get(id); term(s.formula, dissolvedGrams(world, c, id)); }
  for (const f in c.solution.comps) term(f, c.solution.comps[f]);
  const b = electrolytes.bulb;
  return { kappa, bulb: kappa > b.brightAbove_mS_per_cm ? "bright" : kappa > b.dimAbove_mS_per_cm ? "dim" : "off" };
}

// ---- Heating: temperature follows the hot plate; solids show what happens at each temperature ----
export function heat(world, c, targetC, dt) {
  const events = [];
  const boiling = c.solution.mL > 0;
  const target = boiling ? Math.min(targetC, 100) : targetC;
  const tau = target > c.T ? 20 : 90; // heats quickly in the sim, cools slowly
  c.T += (target - c.T) * (1 - Math.exp(-dt / tau));
  for (const id in c.solids) {
    if (!(c.solids[id] > 0)) continue;
    for (const ev of world.species.get(id).heatEvents || []) {
      const key = `${id}@${ev.aboveC}`;
      if (c.T >= ev.aboveC && !c.seen[key]) { c.seen[key] = true; events.push({ type: "heat", id, aboveC: ev.aboveC, text: ev.text }); }
    }
  }
  if (boiling && c.T >= 99.5 && !c.seen.boiling) { c.seen.boiling = true; events.push({ type: "heat", id: "liquid", aboveC: 100, text: "The liquid is boiling." }); }
  return events;
}

// Qualitative description of what a student can see (never exact grams of what dissolved).
export function describe(world, c) {
  const out = { undissolvedG: 0, solidIds: [], liquidMl: c.solution.mL, tint: null };
  for (const id in c.solids) {
    const g = c.solids[id]; if (!(g > 0)) continue;
    const und = Math.max(0, g - dissolvedGrams(world, c, id));
    if (und > 0.02) { out.undissolvedG += und; out.solidIds.push(id); }
  }
  return out;
}
