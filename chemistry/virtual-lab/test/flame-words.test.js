import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { wordProblems, allStrings, LEXICON } from "./flame-words.js";

const J = (p) => JSON.parse(readFileSync(new URL(p, import.meta.url)));
const lab = J("../content/labs/04-flame-tests.json"), content = J("../content/flame-lab-content.json"), items = J("../content/flame-items.json"), S = allStrings(lab, content, items);

test("the detector catches a chemistry word that the sheet's term list lacks", () => {
  const terms = content.terms;
  assert.deepEqual(wordProblems(terms, "Look at the splint and the salt.", "lab"), []);
  assert.match(wordProblems(terms, "Each photon carries energy.", "lab").join(), /"photon".*not in the sheet's term list/);
  assert.match(wordProblems(terms.filter((t) => t.term !== "splint"), "Take a splint.", "lab").join(), /"splint".*not in the sheet's term list/);
  assert.match(wordProblems(terms, "Energy levels and emission.", "lab").join(), /"energy level".*shows before/);
  assert.deepEqual(wordProblems(terms, "Draw three energy levels.", "after"), []);
  assert.match(wordProblems(terms, "Which electron is held more tightly?", "lab").join(), /"electron".*pre-lab/);
  assert.deepEqual(wordProblems(terms, "Which electron is held more tightly?", "prelab"), []);
  assert.match(wordProblems(terms, "The spectrum of sodium.", "lab").join(), /"spectrum"/);   // the sheet never tags it: say "line" instead
});
test("every lexicon word the sheet tags is a term in its list, and the list has no word twice", () => {
  const terms = content.terms.map((t) => t.term); assert.equal(new Set(terms).size, terms.length);
  for (const w of ["flame test", "known", "unknown", "salt", "splint", "spectroscope", "crimson", "lilac", "brightness", "claim", "evidence", "reasoning", "energy level", "emission"]) assert.ok(terms.includes(w) && LEXICON.includes(w), w);
});
test("every student string in the lab content passes the word rule (pre-lab, lab, and the exit ticket after huddle 2)", () => {
  const bad = [];
  for (const [where, list] of Object.entries(S)) for (const str of list) for (const p of wordProblems(content.terms, str, where)) bad.push(`[${where}] ${p}: ${str.slice(0, 60)}`);
  assert.deepEqual(bad, []);
});
test("huddle 2 words are held back from the post-lab word bank and the starters", () => {
  const text = JSON.stringify([content.postlab.wordBank, content.postlab.starters, content.postlab.checklist, content.postlab.prompt]).toLowerCase();
  for (const w of content.postlab.wordsHeldForHuddle2) assert.ok(!text.includes(w), w);
});
test("every UI string key the code uses exists in the wiring file", () => {
  const src = readFileSync(new URL("../src/ui/flame.js", import.meta.url), "utf8") + readFileSync(new URL("../src/ui/app.js", import.meta.url), "utf8");
  const used = new Set([...src.matchAll(/\bU\.([A-Za-z0-9]+)/g)].map((m) => m[1]).concat([...src.matchAll(/lab\.ui\.([A-Za-z0-9]+)/g)].map((m) => m[1])));
  const missing = [...used].filter((k) => !(k in lab.ui)); assert.deepEqual(missing, []);
  const unused = Object.keys(lab.ui).filter((k) => !used.has(k)); assert.deepEqual(unused, [], "strings nobody shows");
});
