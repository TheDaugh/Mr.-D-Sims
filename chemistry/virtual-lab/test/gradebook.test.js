// shared/gradebook.js: the feedback a student reads comes only from the lab's own level descriptors and the levels you click.
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

const win = {}; vm.runInNewContext(fs.readFileSync(new URL("../../../shared/gradebook.js", import.meta.url), "utf8"), { window: win });
const GB = win.MrD.gradebook;
const lab = JSON.parse(fs.readFileSync(new URL("../content/labs/01-unknown-solids.json", import.meta.url), "utf8"));
const lab2 = JSON.parse(fs.readFileSync(new URL("../content/labs/02-heating-curves.json", import.meta.url), "utf8"));

test("IDs match ignoring case and spaces", () => {
  assert.equal(GB.norm(" S-1001 "), GB.norm("s-1001"));
  assert.equal(GB.norm("A B"), GB.norm("ab"));
});

test("feedback totals, flags levels under the bar, and names the next level", () => {
  const fb = GB.feedback(lab, { claim: 3, evidence: 1, reasoning: 2 });
  assert.equal(fb.total, 6); assert.equal(fb.max, 9); assert.equal(fb.complete, true);
  assert.deepEqual([...fb.need], ["Evidence"]); assert.equal(fb.ok, false);
  const ev = fb.criteria.find((c) => c.key === "evidence");
  assert.equal(ev.now, lab.postlab.rubric[1].levels[1]); assert.equal(ev.next, lab.postlab.rubric[1].levels[2]);
  assert.equal(fb.criteria.find((c) => c.key === "claim").next, "", "top level has no next level");
});

test("an unscored part is not a zero and does not trigger remediation", () => {
  const fb = GB.feedback(lab, { claim: 3 });
  assert.equal(fb.scored, 1); assert.equal(fb.complete, false); assert.deepEqual([...fb.need], []); assert.equal(fb.ok, false);
  assert.match(GB.feedbackText(lab, fb), /Evidence: not scored yet/);
});

test("a scored 0 is a real score", () => {
  const fb = GB.feedback(lab, { claim: 0, evidence: 3, reasoning: 3 });
  assert.deepEqual([...fb.need], ["Claim"]); assert.equal(fb.total, 6);
});

test("all at level 2 or better is satisfactory", () => {
  assert.equal(GB.feedback(lab, { claim: 2, evidence: 2, reasoning: 2 }).ok, true);
});

test("works for a lab with four scales", () => {
  const fb = GB.feedback(lab2, { claim: 3, evidence: 3, reasoning: 3, graph: 1 });
  assert.equal(fb.of, 4); assert.deepEqual([...fb.need], ["Graph"]);
});

test("automatic checks report length, numbers and vocabulary, and never a level", () => {
  const s = GB.signals(lab, { unknown: "A", claim: "Unknown A is NaCl", evidence: ["It melted at 801 C", "bulb lit"], note: "", reasoning: "Ions dissolve and the mobile charges conduct." });
  const t = s.join(" | ");
  assert.match(t, /1 number quoted/); assert.match(t, /ions/); assert.ok(!/level/i.test(t));
  assert.equal(GB.signals(lab, null).length, 0);
});
