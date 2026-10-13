// Chemical formula parsing and molar mass. No DOM, no I/O.
export const ATOMIC_MASS = {
  H: 1.008, C: 12.011, N: 14.007, O: 15.999, Na: 22.990, Cl: 35.45, Ca: 40.078, I: 126.904
};

// "Ca3(C6H5O7)2" -> { Ca: 3, C: 12, H: 10, O: 14 }
export function parseFormula(formula) {
  let i = 0;
  function readNumber() {
    const m = /^\d+/.exec(formula.slice(i));
    if (!m) return 1;
    i += m[0].length;
    return parseInt(m[0], 10);
  }
  function parseGroup(depth) {
    const counts = {};
    while (i < formula.length) {
      const ch = formula[i];
      if (ch === "(") {
        i++;
        const inner = parseGroup(depth + 1);
        const n = readNumber();
        for (const el in inner) counts[el] = (counts[el] || 0) + inner[el] * n;
      } else if (ch === ")") {
        if (depth === 0) throw new Error(`Unmatched ")" in formula ${formula}`);
        i++;
        return counts;
      } else {
        const m = /^[A-Z][a-z]?/.exec(formula.slice(i));
        if (!m) throw new Error(`Cannot read "${formula.slice(i)}" in formula ${formula}`);
        if (!(m[0] in ATOMIC_MASS)) throw new Error(`Unknown element ${m[0]} in formula ${formula}`);
        i += m[0].length;
        counts[m[0]] = (counts[m[0]] || 0) + readNumber();
      }
    }
    if (depth > 0) throw new Error(`Missing ")" in formula ${formula}`);
    return counts;
  }
  return parseGroup(0);
}

export function molarMass(formula) {
  const atoms = parseFormula(formula);
  let m = 0;
  for (const el in atoms) m += atoms[el] * ATOMIC_MASS[el];
  return m;
}

// { NaHCO3: 3, C6H8O7: 1 } -> total atom counts of one "unit" of the side
export function sideAtoms(coeffs) {
  const total = {};
  for (const f in coeffs) {
    const atoms = parseFormula(f);
    for (const el in atoms) total[el] = (total[el] || 0) + atoms[el] * coeffs[f];
  }
  return total;
}

export function isBalanced(reaction) {
  const a = sideAtoms(reaction.reactants), b = sideAtoms(reaction.products);
  const els = new Set([...Object.keys(a), ...Object.keys(b)]);
  for (const el of els) if ((a[el] || 0) !== (b[el] || 0)) return false;
  return true;
}
