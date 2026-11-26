// The word rule for lab 6 (STANDARD item 7): a physics word on a student screen must be in the lab's term list, and every term there was taught
// before Day 6 (the Newton's Laws unit, or Forces Days 1 to 5). No tier labels, no later-unit words, and the teacher is never named.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import * as E from "../src/engine/scales.js";

const J = (f) => JSON.parse(readFileSync(new URL("../content/" + f, import.meta.url), "utf8"));
const lab = J("labs/06-spring-scales.json"), room = J("rooms/physics-scales.json"), U = lab.ui;
const flat = (o) => (o == null ? [] : typeof o === "string" ? [o] : Array.isArray(o) ? o.flatMap(flat) : typeof o === "object" ? Object.values(o).flatMap(flat) : []);
const fmt = (s, o) => String(s).replace(/\{(\w+)\}/g, (_, k) => (o[k] === undefined ? "" : o[k]));
const TEACHER_ONLY = ["coachKey", "keyShows", "keyLock"];
const LEXICON = ["newton", "mass", "weight", "acceleration", "net force", "free-body diagram", "equilibrium", "frictionless", "friction", "tension", "pulley", "spring scale", "spring constant", "stretch", "normal force", "incline", "component", "coefficient", "Hooke"];
const FORBIDDEN = ["torque", "moment", "stress", "strain", "shear", "momentum", "energy", "work done", "power", "centripetal", "elastic limit", "extension", "challenge", "optional", "bonus", "tier", "stars?", "★", "AP", "Mr\\. D", "Ian"];
const esc = (w) => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), re = (w) => new RegExp("(^|[^a-z0-9-])" + esc(w).replace(/ /g, "\\s+") + "(?:s|es)?(?![a-z0-9])", "i");

const generated = [];
for (let s = 0; s < 40; s++) for (const t of E.CK_TYPES) for (let n = 0; n < 6; n++) {
  const q = E.question(t, n, "w" + s);
  generated.push(t === "spring" ? fmt(q.form === "findK" ? U.cpQ_findK : U.cpQ_findF, q) : t === "string" ? fmt(q.held ? U.cpQ_held : U.cpQ_released, q) : q.form === "chain" ? fmt(q.B ? U.cpQ_chain : U.cpQ_chain0, q) : fmt(U.cpQ_walk, { ...q, where: U["cpWhere_" + q.at] }));
}
const student = flat([lab.title, lab.intro, lab.introSteps, lab.keyRows, lab.hook, lab.goal, lab.cards.map((c) => [c.term, c.body]), lab.steps, lab.hyatt, lab.arrows, lab.demo, lab.quests.map((q) => [q.text, q.hint]),
  Object.entries(U).filter(([k]) => !TEACHER_ONLY.includes(k)).map(([, v]) => v), Object.values(room.legend).map((l) => [l.label, l.name, l.text]), E.BLANKS.map((b) => [b.pre, b.post]), generated]);

test("the detector catches an unlisted word, a later-unit word, a tier label and the teacher's name", () => {
  const terms = new Set(lab.terms.map((t) => t.term));
  const problems = (s) => [...LEXICON.filter((w) => re(w).test(s) && !terms.has(w)), ...FORBIDDEN.filter((w) => new RegExp("(^|[^A-Za-z])" + w + "(?![A-Za-z])", w === "AP" ? "" : "i").test(s))];
  for (const bad of ["Find the normal force.", "The torque on the beam.", "This is a challenge.", "Ask Mr. D.", "Stress in the rod."]) assert.ok(problems(bad).length >= 1, bad);
  assert.equal(problems("The tension in the string equals the weight below it.").length, 0);
});
test("every student string passes the word rule", () => {
  const terms = new Set(lab.terms.map((t) => t.term)), bad = [];
  for (const s of student) {
    for (const w of LEXICON) if (re(w).test(s) && !terms.has(w)) bad.push(`"${w}" not in the term list: ${s.slice(0, 70)}`);
    for (const w of FORBIDDEN) if (new RegExp("(^|[^A-Za-z])" + w + "(?![A-Za-z])", w === "AP" ? "" : "i").test(s)) bad.push(`"${w}" is not allowed: ${s.slice(0, 70)}`);
  }
  assert.equal(bad.join("\n"), ""); assert.ok(student.length > 300);
});
test("every term in the list was taught before Day 6 and is used somewhere", () => {
  const all = student.join(" ");
  for (const t of lab.terms) { assert.match(t.from, /^(Newton's Laws unit|Forces Day [1-5])$/, t.term); assert.ok(re(t.term).test(all), t.term + " is listed but never shown"); }
});
test("every string the code asks for is in the lab file, and none is unused", () => {
  const own = readFileSync(new URL("../src/ui/scales.js", import.meta.url), "utf8"), app = readFileSync(new URL("../../../chemistry/virtual-lab/src/ui/app.js", import.meta.url), "utf8");
  const used = new Set([...own.matchAll(/\bU\.([A-Za-z0-9_]+)/g)].map((m) => m[1]));
  for (const [, pre] of own.matchAll(/U\["([A-Za-z_]+)" \+/g)) for (const k of Object.keys(U)) if (k.startsWith(pre)) used.add(k);
  for (const m of app.matchAll(/fl\.text\("([A-Za-z0-9]+)"\)/g)) used.add(m[1]); for (const k of ["doneInfo", "exitHead", "coachKey"]) if (app.includes("lab.ui." + k)) used.add(k);
  assert.deepEqual([...used].filter((k) => !(k in U) && !["coachHuddle1"].includes(k)).filter((k) => !app.includes(`fl.text("${k}")`) || !(k in U)).filter((k) => own.includes("U." + k)), [], "keys the code uses but the lab file lacks");
  assert.deepEqual(Object.keys(U).filter((k) => !used.has(k)), [], "strings nobody shows");
  for (const [p] of [["cpHint_"], ["kHint_"]]) for (const code of p === "cpHint_" ? ["num", "cm", "mass", "springK", "springF", "held", "still", "accel", "cart", "string", "whole", "bucket", "count", "below", "own"] : ["num", "cm", "mass", "flip", "rows"]) assert.ok(U[p + code], p + code);
});
