// What the standard tests of Lab 1 show for each solid, computed by the engine itself.
// Used for grading a student's recorded observations, and by tests to prove the lab is solvable.
import { newContainer, add, advance, heat, conductivity, dissolvedGrams, gasVolumeL } from "./sim.js";

export const OBS = {
  solubility: ["full", "partial", "none"],
  conductivity: ["bright", "dim", "off"],
  vinegar: ["fast", "slow", "none"],
  iodine: ["blue-black", "no change"],
  heating: ["none", "melts", "browns", "bubbles"]
};

export function fingerprint(world, electrolytes, speciesId, std) {
  const fp = {};
  // solubility
  let c = newContainer("t", 250); add(world, c, speciesId, std.solubility.g); add(world, c, "water", std.solubility.mL);
  const frac = dissolvedGrams(world, c, speciesId) / std.solubility.g;
  fp.solubility = frac > 0.98 ? "full" : frac < 0.02 ? "none" : "partial";
  // conductivity
  c = newContainer("t", 250); add(world, c, speciesId, std.conductivity.g); add(world, c, "water", std.conductivity.mL);
  fp.conductivity = conductivity(world, c, electrolytes).bulb;
  // vinegar
  c = newContainer("t", 250); add(world, c, speciesId, std.vinegar.g); add(world, c, "vinegar", std.vinegar.mL);
  advance(world, c, 5); const fast = gasVolumeL(c);
  advance(world, c, std.vinegar.seconds - 5); const total = gasVolumeL(c);
  fp.vinegar = total <= 1e-6 ? "none" : fast > 0.5 * total && total > 0.1 ? "fast" : "slow";
  // iodine
  c = newContainer("t", 250); add(world, c, speciesId, std.iodine.g); add(world, c, "iodine", std.iodine.mL);
  fp.iodine = advance(world, c, 1).some((e) => e.id === "starch_iodine") ? "blue-black" : "no change";
  // heating (dry, on a watch glass)
  c = newContainer("t", 0); add(world, c, speciesId, std.heat.g);
  for (let t = 0; t < std.heat.seconds; t += 1) heat(world, c, std.heat.plateC, 1);
  fp.heating = world.species.get(speciesId).heatClass;
  return fp;
}
