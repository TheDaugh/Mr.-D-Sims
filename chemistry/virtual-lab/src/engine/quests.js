// Quests are declared in the lab JSON. This decides which are done from the event log and a few state facts.
const test = (want, got) => (String(want).startsWith("^") ? new RegExp(want).test(String(got)) : String(got) === String(want));
const STATE = {
  ppe: (s) => !!(s.ppe && s.ppe.goggles && s.ppe.apron),
  entered_lab: (s, q, ev) => ev.some((e) => e.type === "door" && String(e.outcome).startsWith("entered")),
  notebook: (s, q) => (s.notebookFilled || 0) >= (q.count || 1),
  submitted: (s) => !!s.submitted,
  cer_done: (s) => !!s.cerDone,
  heat_rows: (s, q) => ((s.heat || {}).rows || {})[q.sample] >= q.count,
  heat_plot: (s, q) => ((s.heat || {}).plot || {})[q.sample] >= q.count,
  heat_lines: (s, q) => ((s.heat || {}).lines || {})[q.sample] >= q.count
};
export function questDone(q, events, state) {
  if (q.state) return !!STATE[q.state](state, q, events);
  const hits = events.filter((e) => e.type === q.event && Object.entries(q.where || {}).every(([k, v]) => test(v, e[k])));
  const n = q.distinct ? new Set(hits.map((e) => e[q.distinct])).size : hits.length;
  return n >= (q.count || 1);
}
export function questProgress(q, events, state) {
  if (q.state === "notebook") return Math.min(state.notebookFilled || 0, q.count);
  if (q.state && q.state.startsWith("heat_")) return Math.min((((state.heat || {})[{ heat_rows: "rows", heat_plot: "plot", heat_lines: "lines" }[q.state]] || {})[q.sample]) || 0, q.count);
  if (q.event) { const hits = events.filter((e) => e.type === q.event && Object.entries(q.where || {}).every(([k, v]) => test(v, e[k]))); return Math.min(q.distinct ? new Set(hits.map((e) => e[q.distinct])).size : hits.length, q.count || 1); }
  return null;
}
export function validateQuests(quests, stateNames = Object.keys(STATE)) {
  const bad = [], seen = new Set();
  for (const q of quests) {
    if (seen.has(q.id)) bad.push(`duplicate quest ${q.id}`); seen.add(q.id);
    if (!q.text || !q.hint) bad.push(`${q.id}: needs text and hint`);
    if (!q.state && !q.event) bad.push(`${q.id}: needs state or event`);
    if (q.state && !stateNames.includes(q.state)) bad.push(`${q.id}: unknown state ${q.state}`);
  }
  return bad;
}
