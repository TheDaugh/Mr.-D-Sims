// The word rule over every student string the lab can show (sheet rule 1 and 13), plus the scope fence: no equation, no newton, no strings,
// pulleys, inclines or components, and nothing labeled extension, challenge or optional. The browser walk-through runs the same rule over the DOM.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { wordProblems, flat, LEXICON, FORBIDDEN } from "./fancart-words.js";
import * as K from "../src/engine/checks.js";

const J = (f) => JSON.parse(readFileSync(new URL("../content/" + f, import.meta.url), "utf8"));
const lab = J("labs/05-fan-cart.json"), L = J("slot-07-lab-content.json"), I = J("slot-07-items.json"), D = J("slot-07-data.json"), U = lab.ui;
const PRE_UI = ["preTitle", "preHint", "preQuestions", "prePrediction", "preProgress", "preDone", "preNot", "right", "notQuite", "enterLab"];
const AFTER_UI = ["invmHead", "xInvm", "axisInvm"];                                  // the three strings that say 1/m
const TEACHER_UI = ["bandWord", ...Object.keys(U).filter((k) => /^key[A-Z]/.test(k))];   // shown in the teacher key only
const H = L.huddle2Tab, held = (s) => /1\/m|per kg/.test(s);

// what a student sees, by where
const prelab = flat([L.prelab.questions.map((q) => [q.q, q.options, q.explain]), L.prelab.prediction.q, L.prelab.prediction.options, L.prelab.prediction.afterTry, L.predictions[0].q, PRE_UI.map((k) => U[k]), lab.title, lab.intro, lab.introSteps, lab.keyRows]);
const after = flat([L.stepCard.afterCode2, L.quests.filter((q) => q.phase === "after").map((q) => [q.text, q.hint]), L.figures.filter((g) => g.afterCode2).map((g) => [g.title, g.axes, g.oneMark, g.lookFirst, g.wrongReading]), L.predictions[2].q, AFTER_UI.map((k) => U[k]),
  H.blanks.filter((b) => held(b.text)).map((b) => b.text), H.worked.filter((w) => held(w.problem)).map((w) => [w.problem, w.steps]), H.crux.map((c) => c.answer), H.worked.filter((w) => !held(w.problem)).map((w) => w.steps), H.blanks.map((b) => b.answer), L.exit.prompt]);
const generated = []; for (const band of [1, 2, 3]) for (let s = 0; s < 200; s++) { const it = K.genItem(I, D, "seed" + s, band, s % 5); generated.push(it.prompt, it.hints); }
const labText = flat([L.quests.filter((q) => q.phase !== "after").map((q) => [q.text, q.hint]), L.stepCard.steps, L.stepCard.title, Object.values(L.tutorials).map((x) => [x.name, x.captions]), L.figures.filter((g) => !g.afterCode2).map((g) => [g.title, g.axes, g.oneMark, g.lookFirst, g.wrongReading]),
  L.messages, L.postlab.prompt, L.postlab.starters, L.postlab.wordBank, L.postlab.checklist, L.predictions[1].q, L.predictions[1].options, L.record.part1Columns, L.record.part2Columns, Object.values(L.room.legend).map((l) => [l.label, l.name, l.text, l.group]),
  I.items.map((i) => [i.prompt, i.options, i.hints]), I.generators.samples, generated, H.tested, H.blanks.filter((b) => !held(b.text)).map((b) => b.text), H.worked.filter((w) => !held(w.problem)).map((w) => w.problem), H.crux.map((c) => c.q),
  Object.entries(U).filter(([k]) => !PRE_UI.includes(k) && !AFTER_UI.includes(k) && !TEACHER_UI.includes(k)).map(([, v]) => v)]);
const S = { prelab, lab: labText, after };

test("the detector catches an unlisted word, a held word, a later-slot word, an unmet term in the pre-lab and an equation", () => {
  assert.equal(wordProblems(L, "Pull the pulley.", "lab").length, 1); assert.ok(wordProblems(L, "Graph acceleration against 1/m.", "lab").some((p) => /code 2/.test(p)));
  assert.equal(wordProblems(L, "Graph acceleration against 1/m.", "after").length, 0); assert.ok(wordProblems(L, "The fan force doubles.", "prelab").some((p) => /huddle 1/.test(p)));
  assert.equal(wordProblems(L, "Which way does the net force point?", "prelab").length, 0); assert.equal(wordProblems(L, "Which way does the net force point?", "lab").length, 1);
  for (const bad of ["The newton is the unit.", "Use the second law.", "a = (F − f) / m", "The incline is steep.", "A string pulls the cart.", "This is an extension.", "Optional: try more.", "Find the slope."]) assert.ok(wordProblems(L, bad, "after").length >= 1, bad);
  assert.equal(wordProblems(L, "Take a mass bar to the balance. Press Run. Drag the markers on the speed graph.", "lab").length, 0);
});
test("every student string passes the word rule (pre-lab, lab, and after code 2)", () => {
  const bad = []; for (const [where, list] of Object.entries(S)) for (const s of list) for (const p of wordProblems(L, s, where)) bad.push(`[${where}] ${p}: ${s.slice(0, 70)}`);
  assert.equal(bad.join("\n"), "");
  assert.ok(prelab.length > 20 && labText.length > 300 && after.length > 15);
});
test("1/m and per kg appear only in the after-code-2 strings, and nowhere in the before-code-2 UI", () => {
  for (const s of [...prelab, ...labText]) assert.ok(!held(s), "held word before code 2: " + s);
  for (const k of Object.keys(U)) if (!AFTER_UI.includes(k)) assert.ok(!held(U[k]), "ui." + k);
  assert.ok(after.filter(held).length >= 6);
  assert.deepEqual(H.blanks.filter((b) => held(b.text)).map((b) => b.id), ["h3"]); assert.deepEqual(H.worked.filter((w) => held(w.problem)).map((w) => w.id), ["W3"]);
});
test("the scope fence: no equation, newton, string, pulley, incline, slope or component on any student string, and no tier labels", () => {
  const all = [...prelab, ...labText, ...after];
  for (const w of ["newton", "string", "pulley", "incline", "slope", "component", "second law", "equation", "formula", "extension", "challenge", "optional", "stars"]) assert.ok(!all.some((s) => new RegExp("(^|[^a-z])" + w + "(?![a-z])", "i").test(s)), w);
  assert.ok(!all.some((s) => /[=]\s*\(|F\s*=\s*m|ΣF/.test(s)), "no equation");
  assert.ok(FORBIDDEN.includes("newton") && LEXICON.includes("1/m"));
  assert.ok(!all.some((s) => /★|☆|⭐/.test(s)), "no star symbol");
});
test("ratio wording is about double and about half, never exactly (the data carry noise and a tiny drag)", () => {
  const all = [...prelab, ...labText, ...after].filter((s) => !/exactly/.test(s) || /not exactly/.test(s)); assert.equal(all.length, [...prelab, ...labText, ...after].length, "'exactly' only in the sheet's own 'not exactly'");
  assert.ok(L.postlab.wordBank.includes("about double") && L.postlab.wordBank.includes("about half"));
});
test("the formula lives only in the engine and its test: no other source file, page or student-facing file holds it", () => {
  const files = []; const walk = (d) => { for (const f of readdirSync(d)) { const p = d + "/" + f; if (statSync(p).isDirectory()) { if (f !== "node_modules") walk(p); } else files.push(p); } };
  walk(new URL("..", import.meta.url).pathname.replace(/\/$/, ""));
  const FORM = /\(F\s*[-−]\s*f\)|F_fan|friction_N\s*\)|a\s*=\s*\(F/;
  const holders = files.filter((f) => /\.(js|html|css)$/.test(f) && FORM.test(readFileSync(f, "utf8"))).map((f) => f.split("/virtual-lab/")[1]);
  assert.deepEqual(holders.filter((f) => !/^test\//.test(f)).sort(), ["src/engine/fancart.js"]);
  assert.ok(!files.some((f) => /\.(js|html)$/.test(f) && /model\.formula|\.formula\b/.test(readFileSync(f, "utf8")) && !/^test\//.test(f.split("/virtual-lab/")[1])), "nothing renders the data file's formula");
  const cards = readFileSync(new URL("../fan-cart-paper.html", import.meta.url), "utf8"); assert.ok(!FORM.test(cards) && /divided by 2\.0 s/.test(cards) && !/a\s*=\s*\(v|v_\{2/.test(cards), "the paper page says the reading rule in words");
});
