import { test } from "node:test";
import assert from "node:assert/strict";
import { gradeNotebook, buildReport } from "../src/report.js";

const unknowns = [{ label: "A", id: "NaCl" }, { label: "B", id: "starch" }];
const truth = { NaCl: { sol: "yes", cond: "bright" }, starch: { sol: "no", cond: "off" } };
test("grading marks right and wrong cells and counts identifications", () => {
  const g = gradeNotebook(unknowns, { A: { sol: "yes", cond: "dim", id: "NaCl" }, B: { sol: "no", cond: "", id: "sucrose" } }, truth);
  assert.equal(g.identified, 1); assert.equal(g.wrong, 2); assert.equal(g.filled, 5);
  assert.deepEqual(g.cells.find((c) => c.unknown === "A" && c.test === "cond"), { unknown: "A", test: "cond", answer: "dim", correct: "bright", ok: false });
});
test("report: PPE state is read at the moment of the first chemical", () => {
  const rec = { unknowns, notebook: {}, student: "Sam", mode: "consequences", safety: { points: 75 }, events: [
    { t: 1, type: "ppe", item: "goggles", on: true }, { t: 2, type: "door", outcome: "entered_without_ppe" },
    { t: 5, type: "add", substance: "water" }, { t: 9, type: "ppe", item: "apron", on: true },
    { t: 12, type: "hazard", id: "overflow", outcome: "incident" }, { t: 20, type: "incident", id: "overflow", treated: false, escalated: false, quiz_correct: true, points_lost: 5 }
  ] };
  const r = buildReport(rec, truth, { overflow: { title: "Spill on the bench", why: "w" } });
  const get = (s) => r.setup.find((x) => x.label.startsWith(s)).ok;
  assert.equal(get("Goggles"), true); assert.equal(get("Apron on"), false); assert.equal(get("Entered"), false);
  assert.equal(get("No containers"), false); assert.equal(get("No safety"), false); assert.equal(r.seconds, 20);
  assert.equal(r.incidents[0].title, "Spill on the bench"); assert.equal(r.points, 75);
  assert.equal(r.tests.find((t) => t.label.startsWith("Solubility")).done, true);
});
test("report with no chemicals handled shows PPE as not reached", () => {
  const r = buildReport({ unknowns, notebook: {}, events: [] }, truth);
  assert.equal(r.setup[0].ok, null); assert.equal(r.seconds, 0);
});
