// Chest-style cabinet screen: a grid of picture slots in the middle of the stage.
// Arrows or WASD move, Enter or a click uses the slot, Q takes everything, Esc or E closes.
import { h } from "./dom.js";
import { drawIcon } from "./icons.js";
export function createChest({ dlg, onClose }) {
  let st = null, cur = 0;
  const body = dlg.querySelector("#chestBody");
  const cols = () => Math.min(6, st.items.length || 1);
  function render() {
    if (!st) return;
    const cells = st.items.map((it, i) => {
      const cv = h("canvas", { width: 48, height: 48 }); drawIcon(cv, it.icon, it.color);
      return h("button", { class: "slot" + (it.has ? " has" : "") + (i === cur ? " cur" : ""), "data-i": i, title: it.label, onclick: () => { cur = i; use(); } }, cv, h("span", {}, it.short || it.label), it.has ? h("i", { class: "ck" }, "✔") : null);
    });
    body.replaceChildren(h("h2", {}, st.title), st.items.length ? h("div", { class: "grid", style: `grid-template-columns:repeat(${cols()},84px)` }, cells) : h("p", { class: "hint" }, "Nothing here is needed for today's lab."),
      h("div", { class: "controls" }, st.onAll ? h("button", { id: "chestAll", class: "primary", onclick: () => st.onAll() }, "Take all (Q)") : null, h("button", { onclick: close }, "Close (Esc)")),
      h("p", { class: "hint" }, st.items[cur] ? st.items[cur].label + (st.items[cur].blurb ? ". " + st.items[cur].blurb : "") : ""), h("p", { class: "hint" }, "Arrows to move, Enter to " + (st.verb || "take") + ", Esc to close."));
  }
  function use() { const it = st && st.items[cur]; if (it) st.onUse(it); }
  function move(dx, dy) { const n = st.items.length, c = cols(); let i = cur + dx + dy * c; if (dx && Math.floor(i / c) !== Math.floor(cur / c)) return; if (i < 0 || i >= n) return; cur = i; render(); }
  function open(state) { st = state; cur = Math.min(cur, Math.max(0, st.items.length - 1)); if (!st.keep) cur = 0; render(); if (!dlg.open) dlg.show(); onClose && onClose("open"); }
  function refresh(state) { st = { ...state }; if (cur >= st.items.length) cur = 0; render(); }
  function close() { st = null; if (dlg.open) dlg.close(); }
  addEventListener("keydown", (e) => {
    if (!dlg.open || !st) return;
    const k = e.key.toLowerCase(), D = { arrowleft: [-1, 0], a: [-1, 0], arrowright: [1, 0], d: [1, 0], arrowup: [0, -1], w: [0, -1], arrowdown: [0, 1], s: [0, 1] };
    if (D[k]) { e.preventDefault(); e.stopPropagation(); move(...D[k]); }
    else if (k === "enter" || k === " ") { e.preventDefault(); e.stopPropagation(); use(); }
    else if (k === "q" && st.onAll) { e.preventDefault(); e.stopPropagation(); st.onAll(); }
    else if (k === "e") { e.preventDefault(); e.stopPropagation(); close(); }
  }, true);
  return { open, refresh, close, get isOpen() { return dlg.open; } };
}
