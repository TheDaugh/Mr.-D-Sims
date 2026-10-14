// Tutorial pointer: a bouncing arrow over a DOM element or a room tile, positioned in stage (1280x720) coordinates.
import { h } from "./dom.js";
export function createGuide(stage) {
  const el = h("div", { id: "guide", hidden: true }, h("div", { class: "gtext" }), h("div", { class: "garrow" }, "▼"));
  stage.append(el);
  const k = () => stage.getBoundingClientRect().width / 1280;
  return {
    onEl(target, text) { if (!target) return this.hide(); const r = target.getBoundingClientRect(), sr = stage.getBoundingClientRect(), s = k(); this.at((r.left + r.width / 2 - sr.left) / s, (r.top - sr.top) / s, text); },
    onTile(canvas, pt, text) { const r = canvas.getBoundingClientRect(), sr = stage.getBoundingClientRect(), s = k(), q = r.width / canvas.width; this.at((r.left - sr.left + pt[0] * 2 * q) / s, (r.top - sr.top + pt[1] * 2 * q) / s, text); },
    at(x, y, text) { el.hidden = false; el.style.left = Math.round(x) + "px"; el.style.top = Math.round(y) + "px"; if (el.firstChild.textContent !== text) el.firstChild.textContent = text; },
    hide() { el.hidden = true; }
  };
}
