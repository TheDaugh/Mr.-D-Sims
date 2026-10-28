// The word rule for lab 5, the same rule the sheet's content test uses, as a module the unit test and the browser walk-through share.
// A content word may be on a student screen only if the sheet's term list tags it. A word tagged huddle2 (1/m, per kg) shows only after
// code 2. Words that belong to a later slot, and every label (extension, challenge, optional...), never show.
// where: "prelab" (before Mr. D's huddle 1: earlier-lesson words only), "lab", or "after" (after code 2).
export const LEXICON = ["fan cart", "fan force", "fan setting", "force sensor", "track", "mass bar", "balance", "motion sensor", "run", "speed graph", "marker", "graph builder", "guide line", "acceleration", "claim", "evidence", "reasoning", "net force", "free-body", "friction", "1/m", "per kg"];
export const HELD = ["1/m", "per kg"];
// The scope fence of the build prompt on top of the sheet's list: no equation, no newton, no strings, pulleys, inclines or components.
export const FORBIDDEN = ["newton", "second law", "ΣF", "F = ma", "F=ma", "inverse", "proportional", "slope", "pulley", "tension", "incline", "ramp", "component", "string", "elevator", "terminal", "momentum", "third law", "weight", "extension", "challenge", "optional", "bonus", "tier", "AP ", "a = (", "(F − f)", "(F - f)", "equation", "formula", "star"];

const esc = (w) => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const re = (w) => new RegExp("(^|[^a-z0-9])" + esc(w).replace(/ /g, "\\s+") + "(?:s|es)?(?![a-z0-9])", "i");

export function wordProblems(L, text, where = "lab") {
  const terms = Object.fromEntries(L.terms.map((x) => [x.term, x.introducedBy])), out = [];
  for (const w of LEXICON) {
    if (!re(w).test(text)) continue;
    if (!(w in terms)) { out.push(`"${w}" is on a student screen but not in the term list`); continue; }
    if (HELD.includes(w) && where !== "after") out.push(`"${w}" is taught in huddle 2 but shows before code 2`);
    if (where === "prelab" && !/^earlier lesson/.test(terms[w])) out.push(`"${w}" is not an earlier-lesson term and shows before Mr. D's huddle 1`);
    if (where === "lab" && /pre-lab only/.test((L.terms.find((x) => x.term === w) || {}).say || "")) out.push(`"${w}" is a pre-lab review word`);
  }
  for (const w of FORBIDDEN) if (new RegExp("(^|[^A-Za-z])" + esc(w) + "(?![A-Za-z])", w === "AP " ? "" : "i").test(text)) out.push(`"${w}" belongs to a later slot or breaks the no-labels rule`);
  return out;
}
export const flat = (o) => (o == null ? [] : typeof o === "string" ? [o] : Array.isArray(o) ? o.flatMap(flat) : typeof o === "object" ? Object.values(o).flatMap(flat) : []);
