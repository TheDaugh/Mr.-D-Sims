// The word rule for lab 4. A chemistry word may appear on a student screen only if the sheet's term list (flame-lab-content.json "terms")
// has it, and a word the sheet teaches in huddle 2 may not appear before the lab ends. Used by the unit test and the browser walk-through.
//
// Three families of words, kept apart on purpose:
//   LEXICON  the words this lab introduces or holds back. The sheet's own watch list, plus words a careless screen would let slip.
//   ASSUMED  review words from slot 7 that the sheet's pre-lab shows (electron, shell, charge...). Allowed in the pre-lab only.
//   (not checked)  the names of the seven salts and their parts (sodium, chlorine, nitrate, Li, Na...) and the units the sheet's items use.
//            They are on the sheet's own item screens, they identify the samples, and none of them is a term the sheet teaches.
export const LEXICON = ["flame test", "known", "unknown", "salt", "splint", "spectroscope", "spectrum", "energy level", "emission", "claim", "evidence", "reasoning", "crimson", "lilac", "brightness",
  "photon", "quantum", "orbital", "excited state", "ground state", "excited", "bohr", "ionization", "atomic emission", "electromagnetic", "frequency", "joule", "ev"];
export const ASSUMED = ["electron", "electrons", "nucleus", "shell", "charge", "charges", "force", "attract", "repel", "atom", "atoms"];

const re = (w) => new RegExp("(^|[^a-z0-9])" + w.replace(/ /g, "\\s+") + "(?:s|es)?(?![a-z0-9])", "i");

// terms: [{term, introducedBy}], text: one screen's visible text, where: "prelab" | "lab" | "after" (after huddle 2)
export function wordProblems(terms, text, where = "lab") {
  const tagged = new Map(terms.map((t) => [t.term, t.introducedBy])), out = [];
  for (const w of LEXICON) {
    if (!re(w).test(text)) continue;
    if (!tagged.has(w)) { out.push(`"${w}" is on a student screen but is not in the sheet's term list`); continue; }
    if (/huddle2/.test(tagged.get(w)) && where !== "after") out.push(`"${w}" is taught in huddle 2 but shows before it`);
  }
  if (where === "lab") for (const w of ASSUMED) if (re(w).test(text)) out.push(`"${w}" is a slot 7 review word and may only show in the pre-lab`);
  return out;
}

// Every student-facing string the lab can show without a browser: the wiring file's ui, step card, tutorial captions, guides; the sheet's prelab,
// quests, tests, post-lab, exit ticket and the items. The pre-lab is checked as "prelab", the exit ticket as "after", the rest as "lab".
export function allStrings(lab, content, items) {
  const flat = (o) => (o == null ? [] : typeof o === "string" ? [o] : Array.isArray(o) ? o.flatMap(flat) : typeof o === "object" ? Object.values(o).flatMap(flat) : []);
  const ui = flat(lab.ui), card = flat(lab.stepCard), t2 = flat(lab.tutorial2), rest = flat([lab.intro, lab.introSteps, lab.keyRows, lab.cerUi, lab.specGuide, lab.swatchGuide, lab.title]);
  const prelab = flat([content.prelab.questions.map((q) => [q.q, q.options, q.explain]), content.prelab.prediction.q, content.prelab.prediction.options, content.prelab.prediction.afterTry]);
  const labText = flat([content.quests.map((q) => [q.text, q.hint]), content.tests.map((t) => [t.name, t.how, (t.options || []).map((o) => o[1])]), content.postlab.prompt, content.postlab.starters, content.postlab.wordBank, content.postlab.checklist,
    items.items.map((i) => [i.prompt, i.options, i.hints])]);
  return { prelab, lab: [...ui, ...card, ...t2, ...rest, ...labText], after: flat(content.exit.prompt) };
}
