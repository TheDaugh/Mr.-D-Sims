// Teacher view: read student lab records, regrade them against the engine, show who did what.
import { buildWorld } from "./engine/sim.js";
import { fingerprint } from "./engine/lab1.js";
import { buildReport } from "./report.js";
import { downloadJSON } from "./log.js";
import { profile, stateAt, checkData } from "./engine/heating.js";
import { checkCode } from "./engine/integrity.js";
import "../../../portal/adapters.js";   // sets window.PortalAdapters (also used by the review portal)
// Active minutes and whether the record's check code still matches its facts.
const activeTag = (rec) => rec.code ? `${Math.round((rec.activeSec || 0) / 60)} min active ${checkCode({ student: rec.student, lab: rec.lab, seed: rec.seed, activeSec: rec.activeSec, events: rec.codeEvents, cerDone: !!rec.cer }) === rec.code ? "✔" : "✘ edited?"}` : "no timer";

const $ = (s) => document.querySelector(s);
function h(tag, props = {}, ...kids) {
  const e = document.createElement(tag);
  for (const k in props) { if (k === "class") e.className = props[k]; else if (k.startsWith("on")) e.addEventListener(k.slice(2), props[k]); else if (props[k] != null && props[k] !== false) e.setAttribute(k, props[k]); }
  for (const kid of kids.flat()) if (kid != null) e.append(kid.nodeType ? kid : document.createTextNode(kid));
  return e;
}

const J = (u) => fetch(u).then((r) => { if (!r.ok) throw new Error(u); return r.json(); });
const [species, reactions, lab, hazardData] = await Promise.all(["content/species.json", "content/reactions.json", "content/labs/01-unknown-solids.json", "content/hazards.json"].map(J)).catch((e) => {
  $("#boot").textContent = "This page has to be opened from the web (GitHub Pages) or a local server. " + e.message; throw e;
});
const lab2 = await J("content/labs/02-heating-curves.json").catch(() => null);
const lab3 = await J("content/labs/03-rutherford-gold-foil.json").catch(() => null);
const world = buildWorld(species, reactions), H = Object.fromEntries(hazardData.hazards.map((x) => [x.id, x]));
const truth = {}; for (const s of species.species) if (s.phase === "s") truth[s.id] = fingerprint(world, species.electrolytes, s.id, lab.standard);
$("#boot").hidden = true; $("#app").hidden = false;

const GB = window.MrD.gradebook;   // shared/gradebook.js: saved records, scale scores, names, feedback text

// Student ID (what they typed in the lab) with a name box you can fill in; the name is kept in this browser.
function idCell(id) {
  return h("td", {}, h("b", {}, id || "(no ID)"),
    h("input", { type: "text", value: GB.nameOf(id), placeholder: "name", "aria-label": "Name for " + (id || "this student"), class: "nameBox", onchange: (e) => GB.setName(id, e.target.value) }));
}

// Proficiency scale for one record: click a level per criterion. The student sees that level's descriptor
// and what the next level asks for, straight from the lab's own rubric. Nothing here calls an AI.
function scalePanel(x, labDef, redraw) {
  const R = labDef.postlab.rubric, box = h("div", { class: "scales" });
  const cur = (k) => (x.scores[k] === undefined || x.scores[k] === null || x.scores[k] === "" ? null : +x.scores[k]);
  const paint = () => {
    const fb = GB.feedback(labDef, x.scores), text = GB.feedbackText(labDef, fb), sig = GB.signals(labDef, x.rec.cer);
    box.replaceChildren(...[
      sig.length ? h("p", { class: "hint" }, "Automatic checks (length, numbers, vocabulary; they cannot judge whether the science is right): " + sig.join(" · ")) : null,
      ...R.map((c) => h("div", { class: "scale" }, h("div", {}, h("b", {}, c.name), h("span", { class: "hint" }, cur(c.key) === null ? " not scored" : "")),
        h("div", { class: "lvls" }, c.levels.map((d, n) => h("button", { type: "button", class: "lvl" + (cur(c.key) === n ? " on" : ""), "aria-pressed": cur(c.key) === n ? "true" : "false",
          onclick: () => { x.scores[c.key] = n; GB.setScores(x.rec, x.scores); paint(); redraw(); } }, h("b", {}, String(n)), h("span", {}, d)))))),
      h("p", { class: "hint" }, `${fb.total} of ${fb.max}` + (fb.complete ? "" : ` · ${fb.scored} of ${fb.of} scored`) + (fb.need.length ? " · needs another go: " + fb.need.join(", ") : fb.complete ? " · every scale at level " + GB.SATISFACTORY + " or higher" : "")),
      h("details", {}, h("summary", {}, "What the student will read"), h("pre", { class: "fbtext" }, text),
        h("button", { type: "button", onclick: () => { if (navigator.clipboard) navigator.clipboard.writeText(text); } }, "Copy feedback"))].filter(Boolean));
  };
  paint(); return box;
}

let rows = [];
const mmss =(s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
function summarize(e) {
  switch (e.type) {
    case "add": return `added ${e.amount} ${e.unit} of ${e.shown_as} to ${e.container}`;
    case "move": return `moved ${e.container} to the ${e.to}`;
    case "hazard": return `${e.outcome} hazard: ${e.id}`;
    case "incident": return `incident report: ${e.id}, treated ${e.treated}, quiz ${e.quiz_correct ? "right" : "wrong"}`;
    case "ppe": return `${e.item} ${e.on ? "on" : "off"}`;
    case "take": case "return": return `${e.type} jar ${e.shown_as || e.jar}`;
    case "visit": return `visited ${e.object}`;
    case "conductivity": return `conductivity test on ${e.container}: bulb ${e.bulb}`;
    case "observe": return `observed ${e.reaction || e.heat} in ${e.container}`;
    case "check": return `checked answers: ${e.identified_correct} identified, ${e.wrong_cells} wrong cells`;
    default: return e.type + (e.id ? " " + e.id : "") + (e.outcome ? " " + e.outcome : "");
  }
}
let heat = [], foil = [];
// Loading the same student's record again (same lab, same start) replaces it instead of adding a second row.
function addRecord(rec, file) {
  const k = GB.keyOf(rec), other = (x) => GB.keyOf(x.rec) !== k;
  rows = rows.filter(other); heat = heat.filter(other); foil = foil.filter(other);
  return addRecord0(rec, file);
}
function addRecord0(rec, file) {
  if (lab3&& rec.lab === lab3.id && rec.scat) { const x = { rec, file, scores: {} }; try { x.scores = JSON.parse(localStorage.getItem(`vlab-rubric:${lab3.id}:${rec.student}:${rec.started}`)) || {}; } catch (e) {} foil.push(x); return null; }
  if (lab2 && rec.lab === lab2.id && rec.samples) { const x = { rec, file, scores: {} }; try { x.scores = JSON.parse(localStorage.getItem(hkey(x))) || {}; } catch (e) {} heat.push(x); return null; }
  if (rec.cont) return `${file}: that is a save file, not a turned-in record.`;
  if (!rec.events || !rec.unknowns || rec.lab !== lab.id) return `${file}: not a record from this lab.`;
  const r = buildReport(rec, truth, H);
  const x = { rec, r, file, scores: {} }; loadScores(x); rows.push(x);
  return null;
}
const rubric = lab.postlab.rubric, RK = "vlab-rubric:";
const key = (x) => RK + lab.id + ":" + x.r.student + ":" + x.rec.started;
function loadScores(x) { try { x.scores = JSON.parse(localStorage.getItem(key(x))) || {}; } catch (e) { x.scores = {}; } }
const cerTotal = (x) => rubric.reduce((a, c) => a + (+x.scores[c.key] || 0), 0);
const hkey = (x) => `vlab-rubric:${lab2.id}:${x.rec.student}:${x.rec.started}`;
const hTotal = (x) => lab2.postlab.rubric.reduce((a, c) => a + (+x.scores[c.key] || 0), 0);
function hStats(x, k) { const m = x.rec.samples[k]; if (!m) return null; const sub = lab2.substances.find((q) => q.id === m.substance); return { sub, m, ...checkData(sub, sub.mass, sub.power, m.rows, 3) }; }
function renderFoil() {
  $("#foilCard").hidden = !foil.length; if (!foil.length) { $("#foilRoster").replaceChildren(); $("#foilDetail").replaceChildren(); return; }
  foil.sort((a, b) => a.rec.student.localeCompare(b.rec.student));
  const z = lab3.prelab.placement.zones, tot = (x) => lab3.postlab.rubric.reduce((a, c) => a + (+x.scores[c.key] || 0), 0);
  $("#foilRoster").replaceChildren(h("thead", {}, h("tr", {}, ["Student", "Submitted", "Pre-lab", "Prediction (A/B/C/D/E of 100)", "Real run: straight / deflected / rebound", "Data tries", "Match tries", "Challenge", "Active time", "Rubric /" + lab3.postlab.rubric.length * 3, ""].map((t) => h("th", {}, t)))),
    h("tbody", {}, foil.map((x) => { const r = x.rec, s = r.scat, rr = s.runs.real, pl = r.prelab.placement || {};
      return h("tr", {}, idCell(r.student), h("td", {}, r.submitted ? "yes" : "no"), h("td", {}, `${r.prelab.correct}/${r.prelab.total}`), h("td", {}, z.map((q) => pl[q.id] ?? 0).join(" / ")),
        h("td", {}, rr ? `${rr.n}: ${rr.straight} / ${rr.deflected} / ${rr.rebound}` : "—"), h("td", {}, lab3.data.map((q) => (s.answers[q.id] || {}).tries ?? "—").join(" / ")), h("td", {}, lab3.match.rows.map((q) => (s.match[q.id] || {}).tries ?? "—").join(" / ")),
        h("td", {}, s.challenge && s.challenge.result ? `${s.challenge.key}: predicted ${s.challenge.pred}, got ${s.challenge.result.actual}` : "—"), h("td", {}, activeTag(r)), h("td", {}, String(tot(x))), h("td", {}, h("button", { onclick: () => foilDetail(x) }, "Open"))); })));
}
function foilDetail(x) {
  const r = x.rec, cer = r.cer || {}, z = lab3.prelab.placement.zones, pl = r.prelab.placement || {};
  $("#foilDetail").replaceChildren(h("h3", {}, `${r.student}: gold foil`),
    h("p", {}, h("b", {}, "Prediction: "), z.map((q) => `${q.label} ${pl[q.id] ?? 0}`).join("; ")), h("p", {}, h("b", {}, "Reason: "), r.prelab.prediction || "(none)"),
    h("p", {}, h("b", {}, "Claim: "), cer.claim || "(not submitted)"), h("p", {}, h("b", {}, "Evidence:")), h("ul", {}, (cer.evidence || []).map((e) => h("li", {}, e)), cer.note ? h("li", {}, cer.note) : null),
    h("p", {}, h("b", {}, "Reasoning: "), cer.reasoning || ""), h("p", { class: "hint" }, cer.cites ? "The text quotes a count from the student's own runs." : "No count from the student's runs found in the text."),
    scalePanel(x, lab3, renderFoil));
}
function renderHeat() {
  $("#heatCard").hidden = !heat.length; heat.sort((a, b) => a.rec.student.localeCompare(b.rec.student));
  const ref = (id) => (lab2.reference.find((r) => r.id === id) || {}).name || "—";
  $("#heatRoster").replaceChildren(h("thead", {}, h("tr", {}, ["Student", "Submitted", "Pre-lab", "X: rows / points / lines", "Y: rows / points / lines", "Data X (ok/bad)", "Data Y (ok/bad)", "CER answer", "Z (challenge)", "Active time", "Rubric /" + lab2.postlab.rubric.length * 3, ""].map((t) => h("th", {}, t)))),
    h("tbody", {}, heat.map((x) => {
      const r = x.rec, cnt = (k) => { const m = r.samples[k]; return m ? `${m.rows.filter((q) => q.t !== "" && q.T !== "").length} / ${m.items.filter((i) => i.k === "p").length} / ${m.items.filter((i) => i.k === "l").length}` : "—"; };
      const ds = (k) => { const s = hStats(x, k); return s ? `${s.good}/${s.bad}` : "—"; };
      const right = (k) => r.cer && r.cer[k] ? (r.cer[k] === (r.samples[k] || {}).substance ? "✔" : "✘ " + ref(r.cer[k])) : "—";
      return h("tr", {}, idCell(r.student), h("td", {}, r.submitted ? "yes" : "no"), h("td", {}, r.prelab ? `${r.prelab.correct}/${r.prelab.total}` : "—"), h("td", {}, cnt("X")), h("td", {}, cnt("Y")), h("td", {}, ds("X")), h("td", {}, ds("Y")), h("td", {}, `X ${right("X")}, Y ${right("Y")}`), h("td", {}, r.samples.Z && r.samples.Z.rows.length ? `${cnt("Z")} ${right("Z")}` : "—"), h("td", {}, activeTag(r)), h("td", {}, String(hTotal(x))), h("td", {}, h("button", { onclick: () => heatDetail(x) }, "Open")));
    })));
}
function heatDetail(x) {
  const r = x.rec, C = r.cer, words = (t) => (String(t || "").trim().match(/\S+/g) || []).length;
  $("#heatDetail").replaceChildren(h("h3", {}, `${r.student}: heating curves`),
    h("p", {}, h("b", {}, "Pre-lab prediction: "), r.prelab && r.prelab.prediction || "—"),
    h("div", { class: "controls" }, Object.keys(r.samples).map((k) => h("figure", { style: "margin:0" }, h("img", { src: r.samples[k].plotPng, style: "max-width:420px;width:100%;border:1px solid #ccc" }), h("figcaption", { class: "hint" }, `Sample ${k}: true substance ${(hStats(x, k).sub || {}).name}`)))),
    Object.keys(r.samples).map((k) => h("details", {}, h("summary", {}, `Sample ${k} data table (${r.samples[k].rows.length} rows)`), h("p", {}, r.samples[k].rows.map((q) => `${q.t} s, ${q.T} °C, ${q.s || "no state"}`).join(" | ")), h("p", { class: "hint" }, `Axis labels: title "${r.samples[k].axes.title}", x "${r.samples[k].axes.x}", y "${r.samples[k].axes.y}"`))),
    !C ? h("p", { class: "hint" }, "No CER yet.") : h("div", {}, h("h3", {}, "CER"), h("p", {}, h("b", {}, "Claim: "), `X is ${C.X}, Y is ${C.Y}. ${C.claim}`), h("p", {}, h("b", {}, "Evidence: "), (C.evidence || []).join("; ") + (C.note ? ` | ${C.note}` : "")), h("p", {}, h("b", {}, `Reasoning (${words(C.reasoning)} words): `), C.reasoning)),
    scalePanel(x, lab2, renderHeat),
    h("div", { class: "tl" }, r.events.map((e) => h("div", {}, `${mmss(Math.round(e.t))}  ${e.type}${e.sample ? " " + e.sample : ""}${e.to != null ? " to " + e.to : ""}`))));
}
$("#csvH").addEventListener("click", () => {
  const q = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`, lines = [["student", "submitted", "prelab_correct", "prelab_total", "X_substance", "X_claimed", "Y_substance", "Y_claimed", "X_rows_ok", "X_rows_bad", "Y_rows_ok", "Y_rows_bad", "cer_claim", "cer_evidence", "cer_reasoning", ...lab2.postlab.rubric.map((c) => "rubric_" + c.key)].join(",")];
  for (const x of heat) { const r = x.rec, a = hStats(x, "X") || {}, b = hStats(x, "Y") || {}; lines.push([r.student, r.submitted, r.prelab?.correct, r.prelab?.total, a.m?.substance, r.cer?.X, b.m?.substance, r.cer?.Y, a.good, a.bad, b.good, b.bad, r.cer?.claim, (r.cer?.evidence || []).join("; "), r.cer?.reasoning, ...lab2.postlab.rubric.map((c) => x.scores[c.key] ?? "")].map(q).join(",")); }
  const a = h("a", { href: URL.createObjectURL(new Blob([lines.join("\n")], { type: "text/csv" })), download: "heating-records.csv" }); document.body.append(a); a.click(); a.remove();
});
const ok = (v) => v === null ? h("span", { class: "dim" }, "—") : v ? h("span", { class: "good" }, "✔") : h("span", { class: "badc" }, "✘");
function render() {
  rows.sort((a, b) => a.r.student.localeCompare(b.r.student));
  $("#rosterCard").hidden = !rows.length;
  $("#roster").replaceChildren(
    h("thead", {}, h("tr", {}, ["Student", "Mode", "Identified", "Wrong cells", "Goggles", "Apron", "Pre-lab", "CER", "Incidents", "Safety pts", "Time", ""].map((t) => h("th", {}, t)))),
    h("tbody", {}, rows.map((x) => {
      const r = x.r, g = r.setup;
      return h("tr", {}, idCell(x.rec.student), h("td", {}, r.mode), h("td", {}, `${r.grade.identified} / ${r.grade.total}`), h("td", {}, String(r.grade.wrong)),
        h("td", {}, ok(g[0].ok)), h("td", {}, ok(g[1].ok)), h("td", {}, r.prelab ? `${r.prelab.correct}/${r.prelab.total}` : "—"), h("td", {}, r.cer ? String(cerTotal(x)) : h("span", { class: "dim" }, "—")),
        h("td", {}, r.incidents.length ? h("span", { class: "badc" }, String(r.incidents.length)) : "0"),
        h("td", {}, r.mode === "consequences" && r.points !== null ? String(r.points) : "—"), h("td", {}, `${mmss(r.seconds)} · ${activeTag(x.rec)}`), h("td", {}, h("button", { onclick: () => detail(x) }, "Timeline")));
    })));
}
function detail(x) {
  const r = x.r;
  const C = x.rec.cer, words = (t) => (String(t || "").trim().match(/\S+/g) || []).length;
  const cerBox = !C ? h("p", { class: "hint" }, "No CER submitted.") : h("div", {}, h("h3", {}, "CER"),
    h("p", {}, h("b", {}, "Pre-lab prediction: "), r.prelab && r.prelab.prediction || "—"),
    h("p", {}, h("b", {}, "Identified: "), `Unknown ${C.unknown}`), h("p", {}, h("b", {}, "Claim: "), C.claim),
    h("p", {}, h("b", {}, "Evidence: "), (C.evidence || []).join("; ") + (C.note ? ` | Note: ${C.note}` : "")),
    h("p", {}, h("b", {}, `Reasoning (${words(C.reasoning)} words): `), C.reasoning),
    scalePanel(x, lab, render));
  $("#detail").replaceChildren(h("h3", {}, `${r.student}: timeline`), cerBox,
    h("p", { class: "hint" }, `Scouted: ${r.scouted.join(", ") || "nothing"}. Tests run: ${r.tests.filter((t) => t.done).map((t) => t.label).join(", ") || "none"}.`),
    r.incidents.map((i) => h("p", {}, h("b", {}, i.title), `: ${i.why} Treated: ${i.treated}. Review question: ${i.quizCorrect ? "right" : "wrong"}.`)),
    h("div", { class: "tl" }, x.rec.events.map((e) => h("div", { class: e.type === "incident" || (e.type === "hazard" && e.outcome !== "blocked") ? "inc" : "" }, `${mmss(Math.round(e.t))}  ${summarize(e)}`))));
  $("#detail").scrollIntoView({ behavior: "smooth", block: "nearest" });
}
async function load(files) {
  const msgs = [];
  for (const f of files) {
    try { const rec = JSON.parse(await f.text()), m = addRecord(rec, f.name); if (m) msgs.push(m); else await GB.put(rec, f.name); }
    catch (e) { msgs.push(`${f.name}: could not be read.`); }
  }
  $("#msg").textContent = msgs.join(" ");
  render(); renderHeat(); renderFoil(); savedNote();
}
const savedNote = () => GB.all().then((a) => { $("#saved").textContent = a.length ? `${a.length} record${a.length === 1 ? "" : "s"} saved in this browser. They are here next time you open this page.` : "Nothing saved yet. Records you load are kept in this browser."; });
const saveFile = (name, text, type) => { const a = h("a", { href: URL.createObjectURL(new Blob([text], { type })), download: name }); document.body.append(a); a.click(); a.remove(); };
$("#files").addEventListener("change", (e) => load([...e.target.files]));
const drop = $("#drop");
drop.addEventListener("dragover", (e) => { e.preventDefault(); drop.classList.add("over"); });
drop.addEventListener("dragleave", () => drop.classList.remove("over"));
drop.addEventListener("drop", (e) => { e.preventDefault(); drop.classList.remove("over"); load([...e.dataTransfer.files]); });
const clearView = () => { rows = []; heat = []; foil = []; renderFoil(); $("#heatDetail").replaceChildren(); renderHeat(); $("#detail").replaceChildren(); $("#foilDetail").replaceChildren(); render(); };
$("#clear").addEventListener("click", clearView);   // empties the screen only; the saved records come back on reload
$("#wipe").addEventListener("click", async () => {
  if (!confirm("Delete every saved record from this browser? The scale scores and names you entered are kept.")) return;
  await GB.clearAll(); clearView(); savedNote();
});
// A small file for student computers: who, which lab, which levels. No student writing, no plots.
$("#fbexport").addEventListener("click", async () => {
  const e = GB.slimFromRecords(await GB.all());
  if (!e.length) { $("#msg").textContent = "Nothing is scored yet. Click a level on a student's scale first."; return; }
  saveFile("lab-feedback.json", GB.slimExport(e), "application/json");
});
// Everything again from the saved records the moment the page opens.
(async () => {
  const saved = await GB.all(), msgs = [];
  for (const e of saved) { const m = addRecord(e.rec, e.file); if (m) msgs.push(m); }
  render(); renderHeat(); renderFoil(); savedNote();
})();
$("#csv").addEventListener("click", () => {
  const q = (v) => `"${String(v).replace(/"/g, '""')}"`;
  const lines = [["student", "mode", "identified", "wrong_cells", "goggles_before_chemicals", "apron_before_chemicals", "incidents", "prelab_correct", "prelab_total", "cer_claim", "cer_evidence", "cer_reasoning", "rubric_claim", "rubric_evidence", "rubric_reasoning", "safety_points", "seconds"].join(",")];
  for (const { r, rec, scores } of rows) lines.push([r.student, r.mode, r.grade.identified, r.grade.wrong, r.setup[0].ok, r.setup[1].ok, r.incidents.length, r.prelab ? r.prelab.correct : "", r.prelab ? r.prelab.total : "", rec.cer ? rec.cer.claim : "", rec.cer ? (rec.cer.evidence || []).join("; ") : "", rec.cer ? rec.cer.reasoning : "", ...rubric.map((c) => scores[c.key] ?? ""), r.points ?? "", r.seconds].map(q).join(","));
  const a = h("a", { href: URL.createObjectURL(new Blob([lines.join("\n")], { type: "text/csv" })), download: "class-records.csv" }); document.body.append(a); a.click(); a.remove();
});
$("#portal").addEventListener("click", () => {
  const records = rows.map(({ r }) => window.PortalAdapters.vlabRecord(r, ""));
  const a = h("a", { href: URL.createObjectURL(new Blob([window.PortalAdapters.bundle(records)], { type: "application/json" })), download: "virtual-lab-scores.json" }); document.body.append(a); a.click(); a.remove();
});
window.__teacher = { load, rows: () => rows, heat: () => heat, foil: () => foil };
