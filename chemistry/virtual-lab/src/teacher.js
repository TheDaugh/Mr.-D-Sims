// Teacher view: read student lab records, regrade them against the engine, show who did what.
import { buildWorld } from "./engine/sim.js";
import { fingerprint } from "./engine/lab1.js";
import { buildReport } from "./report.js";
import { downloadJSON } from "./log.js";

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
const world = buildWorld(species, reactions), H = Object.fromEntries(hazardData.hazards.map((x) => [x.id, x]));
const truth = {}; for (const s of species.species) if (s.phase === "s") truth[s.id] = fingerprint(world, species.electrolytes, s.id, lab.standard);
$("#boot").hidden = true; $("#app").hidden = false;

let rows = [];
const mmss = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
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
function addRecord(rec, file) {
  if (rec.cont) return `${file}: that is a save file, not a turned-in record.`;
  if (!rec.events || !rec.unknowns || rec.lab !== lab.id) return `${file}: not a record from this lab.`;
  const r = buildReport(rec, truth, H);
  rows.push({ rec, r, file });
  return null;
}
const ok = (v) => v === null ? h("span", { class: "dim" }, "—") : v ? h("span", { class: "good" }, "✔") : h("span", { class: "badc" }, "✘");
function render() {
  rows.sort((a, b) => a.r.student.localeCompare(b.r.student));
  $("#rosterCard").hidden = !rows.length;
  $("#roster").replaceChildren(
    h("thead", {}, h("tr", {}, ["Student", "Mode", "Identified", "Wrong cells", "Goggles", "Apron", "Incidents", "Safety pts", "Time", ""].map((t) => h("th", {}, t)))),
    h("tbody", {}, rows.map((x) => {
      const r = x.r, g = r.setup;
      return h("tr", {}, h("td", {}, r.student), h("td", {}, r.mode), h("td", {}, `${r.grade.identified} / ${r.grade.total}`), h("td", {}, String(r.grade.wrong)),
        h("td", {}, ok(g[0].ok)), h("td", {}, ok(g[1].ok)), h("td", {}, r.incidents.length ? h("span", { class: "badc" }, String(r.incidents.length)) : "0"),
        h("td", {}, r.mode === "consequences" && r.points !== null ? String(r.points) : "—"), h("td", {}, mmss(r.seconds)), h("td", {}, h("button", { onclick: () => detail(x) }, "Timeline")));
    })));
}
function detail(x) {
  const r = x.r;
  $("#detail").replaceChildren(h("h3", {}, `${r.student}: timeline`),
    h("p", { class: "hint" }, `Scouted: ${r.scouted.join(", ") || "nothing"}. Tests run: ${r.tests.filter((t) => t.done).map((t) => t.label).join(", ") || "none"}.`),
    r.incidents.map((i) => h("p", {}, h("b", {}, i.title), `: ${i.why} Treated: ${i.treated}. Review question: ${i.quizCorrect ? "right" : "wrong"}.`)),
    h("div", { class: "tl" }, x.rec.events.map((e) => h("div", { class: e.type === "incident" || (e.type === "hazard" && e.outcome !== "blocked") ? "inc" : "" }, `${mmss(Math.round(e.t))}  ${summarize(e)}`))));
  $("#detail").scrollIntoView({ behavior: "smooth", block: "nearest" });
}
async function load(files) {
  const msgs = [];
  for (const f of files) { try { const m = addRecord(JSON.parse(await f.text()), f.name); if (m) msgs.push(m); } catch (e) { msgs.push(`${f.name}: could not be read.`); } }
  $("#msg").textContent = msgs.join(" ");
  render();
}
$("#files").addEventListener("change", (e) => load([...e.target.files]));
const drop = $("#drop");
drop.addEventListener("dragover", (e) => { e.preventDefault(); drop.classList.add("over"); });
drop.addEventListener("dragleave", () => drop.classList.remove("over"));
drop.addEventListener("drop", (e) => { e.preventDefault(); drop.classList.remove("over"); load([...e.dataTransfer.files]); });
$("#clear").addEventListener("click", () => { rows = []; $("#detail").replaceChildren(); render(); });
$("#csv").addEventListener("click", () => {
  const q = (v) => `"${String(v).replace(/"/g, '""')}"`;
  const lines = [["student", "mode", "identified", "wrong_cells", "goggles_before_chemicals", "apron_before_chemicals", "incidents", "safety_points", "seconds"].join(",")];
  for (const { r } of rows) lines.push([r.student, r.mode, r.grade.identified, r.grade.wrong, r.setup[0].ok, r.setup[1].ok, r.incidents.length, r.points ?? "", r.seconds].map(q).join(","));
  const a = h("a", { href: URL.createObjectURL(new Blob([lines.join("\n")], { type: "text/csv" })), download: "class-records.csv" }); document.body.append(a); a.click(); a.remove();
});
window.__teacher = { load, rows: () => rows };
