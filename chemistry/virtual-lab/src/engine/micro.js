// What a container looks like at the particle level. Counts are qualitative (log scale), never exact moles.
import { molarMass } from "./formula.js";
import { dissolvedGrams } from "./sim.js";

const count = (grams, formula, per = 1, cap = 22) => {
  const mol = grams / molarMass(formula);
  return Math.max(1, Math.min(cap, Math.round(Math.log10(1 + mol * 2000) * 5 * per)));
};

const REAGENT = new Set(["CH3COOH", "I2", "H2O", "CO2"]);
// While a container may hold an unknown, hide which substance it is: neutral colors and generic names.
function anonymize(m) {
  if (m.kind === "ionic") return { kind: "ionic", label: "ionic crystal", ions: [{ label: "+ ion", color: "#4f8de0", per: m.ions[0].per || 1 }, { label: "− ion", color: "#e0605a", per: m.ions[1] ? m.ions[1].per || 1 : 1 }] };
  if (m.kind === "polymer") return { kind: "polymer", label: "long-chain molecule", color: "#b08fd0" };
  return { kind: "molecular", label: "molecule", color: "#7fb069" };
}
export function microModel(world, c, microTable, opts = {}) {
  const lattice = [], dissolved = [], gas = [];
  const micro = new Proxy(microTable, { get: (t, f) => (opts.anon && t[f] && !REAGENT.has(f) && typeof f === "string" ? anonymize(t[f]) : t[f]) });
  const addDissolved = (formula, grams) => {
    const m = micro[formula]; if (!m || !(grams > 0.005)) return;
    if (m.kind === "ionic") for (const ion of m.ions) dissolved.push({ formula, label: ion.label, color: ion.color, shape: "ion", count: Math.min(26, count(grams, formula) * (ion.per || 1)) });
    else if (m.kind !== "water" && m.kind !== "gas") dissolved.push({ formula, label: m.label, color: m.color, shape: m.kind === "polymer" ? "chain" : "molecule", count: count(grams, formula) });
  };
  for (const id in c.solids) {
    const g = c.solids[id]; if (!(g > 0)) continue;
    const sp = world.species.get(id), m = micro[sp.formula]; if (!m) continue;
    const diss = dissolvedGrams(world, c, id), und = g - diss;
    if (und > 0.02) lattice.push({ formula: sp.formula, label: m.label, kind: m.kind, color: m.kind === "ionic" ? null : m.color, ions: m.ions || null, size: Math.max(2, Math.min(9, Math.round(Math.sqrt(und) * 2))) });
    addDissolved(sp.formula, diss);
  }
  for (const f in c.precip) if (c.precip[f] > 0.02 && micro[f]) lattice.push({ formula: f, label: micro[f].label, kind: "ionic", color: null, ions: micro[f].ions, size: Math.max(2, Math.min(6, Math.round(Math.sqrt(c.precip[f]) * 2))) });
  for (const f in c.solution.comps) { if (f === "H2O") continue; addDissolved(f, c.solution.comps[f]); }
  if ((opts.fizz || 0) > 0.02 && micro.CO2) gas.push({ formula: "CO2", label: micro.CO2.label, color: micro.CO2.color, count: Math.max(2, Math.ceil(opts.fizz * 10)) });
  return { T: c.T, liquidMl: c.solution.mL, water: c.solution.mL > 0, lattice, dissolved, gas };
}

// Plain-language key for the microscope window.
export function legend(model) {
  const out = [];
  for (const l of model.lattice) out.push({ color: l.color || (l.ions ? l.ions[0].color : "#999"), text: l.kind === "ionic" ? `${l.label} (not dissolved): ions locked in a repeating lattice, only vibrating` : l.kind === "polymer" ? `${l.label} (not dissolved): tangled chains packed together` : `${l.label} (not dissolved): molecules packed together` });
  const seen = new Set();
  for (const d of model.dissolved) { const k = d.label; if (seen.has(k)) continue; seen.add(k); out.push({ color: d.color, text: d.shape === "ion" ? `${d.label}: dissolved ion, charged and free to move` : d.shape === "chain" ? `${d.label}: dissolved chain, neutral` : `${d.label}: dissolved molecule, neutral, no charge` }); }
  for (const g of model.gas) out.push({ color: g.color, text: `${g.label}: gas bubbling out` });
  if (model.water) out.push({ color: "#78b9eb", text: "Water molecules (only a few of the billions are drawn)" });
  return out;
}
