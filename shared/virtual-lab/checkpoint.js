// Checkpoints and the lock, shared by every virtual lab that asks questions (Ian's rule, 2026-11-12: no click-through).
// The rule: a checkpoint needs NEED right in a row. A miss resets the streak and the lab shows a hint that points at the student's own data,
// then a freshly generated question. MISS_LOCK misses in a row, or the "I need Mr. D" button, lock the screen. Mr. D unlocks it by typing
// today's unlock code (MrD.codes.override(): the "Unlock any locked student" code on the teacher page). Only that question type resets and
// the student then needs REDO_NEED fresh ones right in a row. The lock survives a reload. Every attempt, lock and unlock is logged by the lab.
// This file holds the rules and the lock screen; the lab supplies the question generator and grader for each type (see pes.js, zeff.js).
import { h } from "./dom.js";

export const NEED = 3, REDO_NEED = 2, MISS_LOCK = 3;

// One tracker per question type. n counts questions served, so a lab can seed a new variant from it.
export const track = () => ({ n: 0, streak: 0, miss: 0, passed: false, need: NEED, redo: false, atCp: false, att: [], unlocks: 0, helps: 0 });

// Grade one answer. Returns "right", "pass", "miss" or "lock". The caller pushes the attempt into t.att first.
export function grade(t, ok) {
  t.n++;
  if (ok) {
    t.streak++; t.miss = 0;
    if (t.streak >= t.need) { if (!t.redo || t.atCp || t.passed) t.passed = true; t.redo = false; t.need = NEED; t.streak = 0; return "pass"; }
    return "right";
  }
  t.streak = 0; t.miss++;
  return t.miss >= MISS_LOCK ? "lock" : "miss";
}

export const lockInfo = (type, reason, step) => ({ type, reason, step, at: new Date().toISOString() });
export function unlockTrack(t) { t.unlocks++; t.streak = 0; t.miss = 0; t.need = REDO_NEED; t.redo = true; }   // only this type is reset

// Today's unlock code. It is the same code the teacher page shows as "Unlock any locked student".
export const todayCode = () => (window.MrD && window.MrD.codes ? window.MrD.codes.override() : "");
export const codeOk = (s) => { const c = todayCode(); return !!c && String(s).trim() === c; };

// The lock must survive a reload, and "Start over" must not wipe it: a lab keeps a mirror in localStorage.
const key = (id) => "vlab:" + id + ":lock";
export function mirrorSet(id, L, student) { try { localStorage.setItem(key(id), JSON.stringify({ type: L.type, reason: L.reason, at: L.at, student })); } catch (e) { /* the saved lab keeps it too */ } }
export function mirrorClear(id) { try { localStorage.removeItem(key(id)); } catch (e) { /* ignore */ } }
export function mirrorGet(id) { try { const m = JSON.parse(localStorage.getItem(key(id)) || "null"); return m && m.type ? m : null; } catch (e) { return null; } }

// The lock screen's contents. text = { head, miss, help, body, word, wrong, go }. ids = { pin, go, msg } (the lab's own ids, for its tests).
export function lockScreen(L, text, ids, onUnlock) {
  const pin = h("input", { id: ids.pin, class: "pin", type: "password", inputmode: "numeric", autocomplete: "off", "aria-label": text.word });
  const msg = h("p", { id: ids.msg, class: "pesMsg no", role: "status" });
  const go = h("button", { id: ids.go, class: "primary", onclick: () => { if (codeOk(pin.value)) onUnlock(); else { msg.textContent = text.wrong; pin.value = ""; } } }, text.go || "Unlock");
  pin.addEventListener("keydown", (e) => { if (e.key === "Enter") go.click(); });
  return [h("h2", {}, text.head), h("p", {}, L.reason === "help" ? text.help : text.miss), h("p", {}, text.body), h("div", { class: "row" }, h("b", {}, text.word), pin, go), msg];
}
