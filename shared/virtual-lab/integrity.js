// A short check code over the facts a teacher compares. It deters casual edits to a record; it is not security.
const SALT = "usp-vlab-2026";
export function fnv(str) { let h = 0x811c9dc5; for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; } return h >>> 0; }
export function checkCode(r) {
  const s = [r.student || "", r.lab, r.seed, Math.round(r.activeSec || 0), r.events || 0, r.cerDone ? 1 : 0, SALT].join("|");
  return "VL-" + fnv(s).toString(16).toUpperCase().padStart(8, "0");
}
