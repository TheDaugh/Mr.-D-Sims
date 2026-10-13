// The screens around the lab: intro, pre-lab, theory, and the CER write-up. Content comes from the lab JSON.
import { h, mulberry32, wordCount } from "./dom.js";

export function theoryNodes(lab) {
  return lab.theory.map((s, i) => h("details", { open: i === 0 }, h("summary", {}, h("b", {}, s.title)), s.body.map((p) => h("p", {}, p))));
}

const DEFAULT_STEPS = ["Watch the demo to see the controls in action (about a minute).", "Do the pre-lab: read the theory, answer six questions, and write a prediction. The lab door stays locked until you finish.", "Suit up, collect your jars, and run the five tests at your bench.", "Record only what you observe in your notebook, then submit.", "Write a Claim, Evidence, Reasoning to finish."];

export function renderIntro(box, ctx) {
  const { lab } = ctx;
  const key = (k, t) => h("tr", {}, h("td", {}, h("kbd", {}, k)), h("td", {}, t));
  const name = h("input", { id: "student", type: "text", autocomplete: "name", style: "width:18em", placeholder: "First and last name" });
  const go = h("button", { class: "primary", disabled: true, onclick: () => ctx.onIntroDone(name.value.trim()) }, "Start the pre-lab →");
  name.addEventListener("input", () => { go.disabled = name.value.trim().length < 3; });
  if (ctx.S.student) { name.value = ctx.S.student; go.disabled = name.value.trim().length < 3; }
  box.replaceChildren(
    h("h2", {}, lab.title), h("p", {}, lab.intro),
    h("h3", {}, "How this lab works"),
    h("ol", {}, (lab.introSteps || DEFAULT_STEPS).map((t) => h("li", {}, t))),
    h("h3", {}, "Controls"),
    h("table", { class: "keys" },
      key("← ↑ → ↓ or W A S D", "Walk. On screen you move along the floor diagonals."), key("E", "Use what you are facing (locker, shelf, bench, sink…)."), key("N / T / M", "Notebook, Theory, Microscope."),
      key("Esc", "Step away from the bench, or close a window."), key("Hover", "Point at anything to see its name and picture."), ...(lab.introKeys || []).map(([k, t]) => key(k, t))),
    h("p", { class: "hint" }, "The bar along the bottom is your log. It tells you what happened and why. Read it."),
    h("label", { style: "display:block;margin:12px 0" }, "Your name ", name),
    h("div", { class: "controls foot" }, h("button", { onclick: ctx.onDemo }, "▶ Watch the demo"), go));
}

export function renderPrelab(box, ctx) {
  const { lab, S } = ctx, pre = lab.prelab, total = pre.questions.length;
  const btn = h("button", { class: "primary", disabled: true, onclick: () => ctx.onPrelabDone() }, "Enter the lab →");
  const progress = h("p", { class: "hint", role: "status" });
  const pred = h("textarea", { rows: 6, style: "width:100%", "aria-label": "Prediction", placeholder: "Write your prediction here…" });
  pred.value = S.prelab.prediction || "";
  const words = h("span", { class: "hint" });
  function update() {
    const done = Object.keys(S.prelab.answers).length, n = wordCount(pred.value);
    words.textContent = `${n} words (at least ${pre.prediction.minWords})`;
    progress.textContent = `${done} of ${total} questions answered. Prediction: ${n >= pre.prediction.minWords ? "done" : "not yet long enough"}.`;
    btn.disabled = !(done === total && n >= pre.prediction.minWords);
  }
  pred.addEventListener("input", () => { S.prelab.prediction = pred.value; update(); });
  const qs = pre.questions.map((q, qi) => {
    const rng = mulberry32(ctx.seed * 31 + qi + 1), order = q.options.map((_, i) => i).sort(() => rng() - 0.5);
    const fb = h("div", { class: "fb", role: "status" }), opts = h("div", { class: "opts" });
    const lock = (picked) => {
      opts.querySelectorAll("button").forEach((b) => { b.disabled = true; if (+b.dataset.i === q.correct) b.classList.add("right"); else if (+b.dataset.i === picked) b.classList.add("wrong"); });
      fb.className = "fb show " + (picked === q.correct ? "ok" : "no"); fb.textContent = (picked === q.correct ? "Correct. " : "Not quite. ") + q.explain;
    };
    for (const i of order) opts.append(h("button", { "data-i": i, onclick: () => { S.prelab.answers[q.id] = i; ctx.onAnswer(q.id, i, i === q.correct); lock(i); update(); } }, q.options[i]));
    if (q.id in S.prelab.answers) lock(S.prelab.answers[q.id]);
    return h("div", { class: "pq" }, h("p", {}, h("b", {}, `${qi + 1}. `), q.q), opts, fb);
  });
  box.replaceChildren(
    h("h2", {}, "Pre-lab"), h("p", { class: "hint" }, "One attempt per question. You will see the explanation after you answer. The theory stays open in the 📖 button once you are in the lab."),
    h("h3", {}, "1. Read the theory"), ...theoryNodes(lab),
    h("h3", {}, "2. Concept questions"), ...qs,
    h("h3", {}, "3. Your prediction"), h("p", {}, pre.prediction.prompt), pred, words, progress, h("div", { class: "controls foot" }, btn));
  update();
}

export const insertAt = (ta, text) => { const s = ta.selectionStart ?? ta.value.length; ta.value = ta.value.slice(0, s) + text + ta.value.slice(ta.selectionEnd ?? s); ta.focus(); ta.selectionStart = ta.selectionEnd = s + text.length; ta.dispatchEvent(new Event("input")); };

export function renderCER(box, ctx) {
  const { lab, S } = ctx, post = lab.postlab, nb = ctx.getNotebook(), C = S.cer;
  const unk = h("select", { "aria-label": "Which unknown" }, ctx.unknowns.map((u) => h("option", { value: u.label }, "Unknown " + u.label)));
  unk.value = C.unknown || ctx.unknowns[0].label;
  const claim = h("textarea", { rows: 2, style: "width:100%", "aria-label": "Claim" }), reasoning = h("textarea", { rows: 6, style: "width:100%", "aria-label": "Reasoning" }), note = h("textarea", { rows: 2, style: "width:100%", "aria-label": "Extra evidence", placeholder: "Anything else you observed that supports your claim (optional)" });
  claim.value = C.claim || ""; reasoning.value = C.reasoning || ""; note.value = C.note || "";
  const evBox = h("div", { class: "ev" }), checks = h("div", {}), cc = h("span", { class: "hint" }), rc = h("span", { class: "hint" }), status = h("p", { class: "hint", role: "status" });
  const submit = h("button", { class: "primary", disabled: true, onclick: () => ctx.onCerDone({ unknown: unk.value, claim: claim.value.trim(), evidence: [...evBox.querySelectorAll("input:checked")].map((i) => i.value), note: note.value.trim(), reasoning: reasoning.value.trim() }) }, "Submit CER");
  const picks = new Set(C.evidence || []);
  function evidence() {
    const row = nb[unk.value] || {};
    const items = lab.tests.filter((t) => row[t.key]).map((t) => `Unknown ${unk.value}, ${t.name}: ${(t.options.find((o) => o[0] === row[t.key]) || [])[1] || row[t.key]}`);
    evBox.replaceChildren(...(items.length ? items.map((txt) => h("label", { class: "ck" }, h("input", { type: "checkbox", value: txt, checked: picks.has(txt) ? "" : null, onchange: (e) => { e.target.checked ? picks.add(txt) : picks.delete(txt); update(); } }), txt)) : [h("p", { class: "hint" }, "You have no recorded observations for this unknown. Open the notebook.")]));
    update();
  }
  function update() {
    const nc = wordCount(claim.value), nr = wordCount(reasoning.value), ne = evBox.querySelectorAll("input:checked").length + (wordCount(note.value) >= post.minWords.evidence ? 1 : 0);
    cc.textContent = `${nc} words`; rc.textContent = `${nr} words (at least ${post.minWords.reasoning})`;
    const all = [...checks.querySelectorAll("input")].every((i) => i.checked);
    const ok = nc >= post.minWords.claim && ne >= 2 && nr >= post.minWords.reasoning && all;
    submit.disabled = !ok;
    status.textContent = ok ? "Ready to submit." : `Needed: a claim, at least two pieces of evidence, ${post.minWords.reasoning} words of reasoning, and every box ticked.`;
    Object.assign(C, { unknown: unk.value, claim: claim.value, reasoning: reasoning.value, note: note.value, evidence: [...picks] });
  }
  for (const el of [claim, reasoning, note]) el.addEventListener("input", update);
  unk.addEventListener("change", () => { picks.clear(); evidence(); });
  checks.replaceChildren(...post.checklist.map((t) => h("label", { class: "ck" }, h("input", { type: "checkbox", onchange: update }), t)));
  const chips = (list, ta) => h("div", { class: "chips" }, list.map((t) => h("button", { class: "chip", type: "button", onclick: () => insertAt(ta, t) }, t)));
  box.replaceChildren(
    h("h2", {}, "Claim, Evidence, Reasoning"), h("p", {}, post.prompt),
    h("label", {}, "Which unknown? ", unk),
    h("h3", {}, "Claim"), h("p", { class: "hint" }, "One sentence that answers the question."), chips(post.starters.claim, claim), claim, cc,
    h("h3", {}, "Evidence"), h("p", { class: "hint" }, "Tick the observations from your own data that support the claim. Pick at least two."), evBox, note,
    h("h3", {}, "Reasoning"), h("p", { class: "hint" }, "Explain why that evidence means that substance. Use particles. Evidence says what happened; reasoning says why it matters."), chips(post.starters.reasoning, reasoning), h("p", { class: "hint" }, "Word bank (click to insert):"), chips(post.wordBank, reasoning), reasoning, rc,
    h("h3", {}, "Check yourself"), checks, status, h("div", { class: "controls foot" }, h("button", { onclick: () => ctx.onCerClose() }, "Back to the lab"), submit));
  evidence();
}

// CER for the heating lab: name both samples from the reference table, cite readings from your own table.
export function renderCERHeat(box, ctx) {
  const { lab, S } = ctx, post = lab.postlab, C = S.cer, rowsOf = ctx.getRows();
  const opts = () => [h("option", { value: "" }, "— choose —"), ...lab.reference.map((r) => h("option", { value: r.id }, r.name))];
  const selX = h("select", {}, ...opts()), selY = h("select", {}, ...opts()); selX.value = C.X || ""; selY.value = C.Y || "";
  const claim = h("textarea", { rows: 2, style: "width:100%", "aria-label": "Claim" }), reasoning = h("textarea", { rows: 6, style: "width:100%", "aria-label": "Reasoning" }), note = h("textarea", { rows: 2, style: "width:100%", placeholder: "Anything else from your data (optional)" });
  claim.value = C.claim || ""; reasoning.value = C.reasoning || ""; note.value = C.note || "";
  const evBox = h("div", { class: "ev" }), checks = h("div", {}), st = h("p", { class: "hint", role: "status" }), picks = new Set(C.evidence || []);
  const items = []; for (const k of Object.keys(rowsOf)) for (const r of rowsOf[k]) items.push(`Sample ${k}, ${r.t} s: ${r.T} °C${r.s ? ", " + r.s : ""}`);
  evBox.replaceChildren(...(items.length ? items.map((t) => h("label", { class: "ck" }, h("input", { type: "checkbox", value: t, checked: picks.has(t) ? "" : null, onchange: (e) => { e.target.checked ? picks.add(t) : picks.delete(t); update(); } }), t)) : [h("p", { class: "hint" }, "Your table is empty. Close this window and record some readings first.")]));
  const submit = h("button", { class: "primary", disabled: true, onclick: () => ctx.onCerDone({ ...C }) }, "Submit CER");
  function update() {
    const nc = wordCount(claim.value), nr = wordCount(reasoning.value), ne = picks.size + (wordCount(note.value) >= post.minWords.evidence ? 1 : 0), all = [...checks.querySelectorAll("input")].every((i) => i.checked);
    const ok = selX.value && selY.value && nc >= post.minWords.claim && ne >= 2 && nr >= post.minWords.reasoning && all; submit.disabled = !ok;
    st.textContent = ok ? "Ready to submit." : `Needed: both substances chosen, a claim (${post.minWords.claim} words), two pieces of evidence, ${post.minWords.reasoning} words of reasoning (you have ${nr}), and every box ticked.`;
    Object.assign(C, { X: selX.value, Y: selY.value, claim: claim.value, reasoning: reasoning.value, note: note.value, evidence: [...picks] });
  }
  for (const el of [claim, reasoning, note, selX, selY]) el.addEventListener("input", update);
  checks.replaceChildren(...post.checklist.map((t) => h("label", { class: "ck" }, h("input", { type: "checkbox", onchange: update }), t)));
  const chips = (list, ta) => h("div", { class: "chips" }, list.map((t) => h("button", { class: "chip", type: "button", onclick: () => { insertAt(ta, t); update(); } }, t)));
  box.replaceChildren(h("h2", {}, "Claim, Evidence, Reasoning"), h("p", {}, post.prompt),
    h("h3", {}, "Reference table"), h("table", { class: "keys" }, h("tbody", {}, lab.reference.map((r) => h("tr", {}, h("td", {}, r.name), h("td", {}, `melts ${r.mp} °C`), h("td", {}, `boils ${r.bp} °C`))))),
    h("p", {}, "Sample X is ", selX, "  Sample Y is ", selY),
    h("h3", {}, "Claim"), h("p", { class: "hint" }, "One or two sentences that answer the question."), chips(post.starters.claim, claim), claim,
    h("h3", {}, "Evidence"), h("p", { class: "hint" }, "Tick readings from your own table that support the claim. Plateau readings are the strongest."), evBox, note,
    h("h3", {}, "Reasoning"), h("p", { class: "hint" }, "Explain why that evidence points to that substance. Say where the energy goes during a plateau. Evidence says what happened; reasoning says why it matters."), chips(post.starters.reasoning, reasoning), h("div", { class: "chips" }, post.wordBank.map((t) => h("button", { class: "chip", type: "button", onclick: () => { insertAt(reasoning, t + " "); update(); } }, t))), reasoning,
    h("h3", {}, "Check yourself"), checks, st, h("div", { class: "controls foot" }, h("button", { onclick: () => ctx.onCerClose() }, "Back to the lab"), submit));
  update();
}
