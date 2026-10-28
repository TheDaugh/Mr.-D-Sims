// Fit the fixed-size stage to the window, then apply the browser zoom on top, so Ctrl +/- really does
// make everything bigger or smaller (and scrolls when it no longer fits). The first zoom level a
// device loads at is remembered as "normal size"; the menu can reset it.
const KEY = "vlab:dpr0";
const get = () => { try { return parseFloat(localStorage.getItem(KEY)) || 0; } catch (e) { return 0; } };
const put = (v) => { try { localStorage.setItem(KEY, String(v)); } catch (e) { /* ignore */ } };
export function stageScale(winW, winH, dpr, base, W = 1280, H = 720) {
  const rel = Math.min(4, Math.max(0.25, dpr / (base || dpr)));
  return Math.min(winW / W, winH / H) * rel;
}
export function fitStage(stage, W = 1280, H = 720) {
  const box = document.createElement("div"); box.id = "stagebox"; stage.before(box); box.append(stage);
  let base = get(); if (!base) { base = devicePixelRatio; put(base); }
  const f = () => { const s = stageScale(innerWidth, innerHeight, devicePixelRatio, base, W, H); box.style.width = Math.round(W * s) + "px"; box.style.height = Math.round(H * s) + "px"; stage.style.transform = `scale(${s})`; };
  addEventListener("resize", f); f();
  return { rebase() { base = devicePixelRatio; put(base); f(); } };
}
