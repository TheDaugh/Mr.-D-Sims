// The lab record: which table a run fills, the gates, the dots of each graph, and the count check on the CER. Pure logic, no DOM.
import { massOf, forceOf, round, lsq } from "./fancart.js";

// Part 1 keeps the bars the data file gives it (m = 1.00 kg); Part 2 keeps the fan on the setting its force belongs to (0.45 N).
export const part1Bars = (D) => Math.round((D.part1[0].m_kg - D.cart.mass_kg.value) / D.cart.bar_mass_kg.value);
export const part2Setting = (D) => D.fan.settings.find((s) => s.F_N === D.part2[0].F_N).setting;
export const part1Settings = (D) => D.part1.map((r) => D.fan.settings.find((s) => s.F_N === r.F_N).setting);
export const part2Bars = (D) => D.part2.map((r) => r.bars);

export const emptyRows = () => ({ p1: {}, p2: {}, test: null });
export const rowCount = (rows, part) => Object.keys(part === "1" ? rows.p1 : rows.p2).length;

// Which table would this run fill? "1", "2", "test" or null. The one run that fits both Part 1 and Part 2
// (2 bars on setting 3) fills Part 1 first and Part 2 the next time.
export function partOf(D, rows, run) {
  const { setting, bars } = run;
  if (bars === D.test.bars) return setting === part2Setting(D) ? "test" : null;
  const in1 = bars === part1Bars(D), in2 = setting === part2Setting(D) && part2Bars(D).includes(bars);
  if (in1 && in2) return rows.p1[setting] ? "2" : "1";
  return in1 ? "1" : in2 ? "2" : null;
}

// Gates on the Run button for the loaded cart. null = open.
//   "predict": Part 2 (any bars other than Part 1's) waits for the mass prediction; the test waits for a typed prediction.
//   "after":   the test run waits for code 2.
export function runBlock(D, st, bars) {
  if (bars === D.test.bars) return !st.huddle2 ? "after" : !st.pred.test ? "predict" : null;
  if (bars !== part1Bars(D) && !st.pred.mass) return "predict";
  return null;
}

// The typed mass is checked within 0.01 kg of the cart plus its bars.
export const massOk = (D, typed, bars) => Number.isFinite(typed) && Math.abs(typed - massOf(D, bars)) <= 0.01 + 1e-9;

export function addRow(D, rows, part, run, typedMass, a) {
  const row = { part, setting: run.setting, bars: run.bars, F: forceOf(D, run.setting), m: round(typedMass, 2), a };
  if (part === "1") rows.p1[run.setting] = row; else if (part === "2") rows.p2[run.bars] = row; else rows.test = row;
  return row;
}

// Dots of the graph builder. Fan force uses the Part 1 rows; mass and 1/m use the Part 2 rows. Each recorded row is one dot.
export function dots(rows, x) {
  if (x === "F") return Object.values(rows.p1).sort((p, q) => p.F - q.F).map((r) => ({ x: r.F, y: r.a }));
  return Object.values(rows.p2).map((r) => ({ x: x === "m" ? r.m : round(1 / r.m, 2), y: r.a })).sort((p, q) => p.x - q.x);
}
export const testDot = (rows) => (rows.test ? { x: round(1 / rows.test.m, 2), y: rows.test.a } : null);
export const guideLine = (pts) => (pts.length >= 3 ? lsq(pts.map((p) => p.x), pts.map((p) => p.y)) : null);

// Numbers a student typed that are in one of their own tables. Numbers under 0.1 are ignored (they match by luck).
export function numbersIn(text) { return [...String(text).replace(/\bparts?\s*\d+/gi, " ").matchAll(/(?<![\d.])(\d+\.?\d*|\.\d+)(?![\d])/g)].map((m) => parseFloat(m[1])).filter((n) => Number.isFinite(n) && n >= 0.1); }
export function cited(text, rows) {
  const vals = (list) => list.flatMap((r) => [r.F, r.m, r.a]), p1 = vals(Object.values(rows.p1)), p2 = vals(Object.values(rows.p2));
  const hit = (list) => new Set(numbersIn(text).filter((n) => list.some((v) => Math.abs(v - n) <= 0.005)).map((n) => n.toFixed(2)));
  const a = hit(p1), b = hit(p2);
  return { part1: a.size, part2: b.size, ok: a.size >= 2 && b.size >= 2 };
}
export const tablesDone = (D, rows) => rowCount(rows, "1") >= D.part1.length && rowCount(rows, "2") >= D.part2.length;
