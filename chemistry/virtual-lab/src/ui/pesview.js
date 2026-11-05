// Pictures for the spectrometer (Lab 5): the spectrum on AP axes, the zoom view of one atom, the periodic table and the draw bench.
// Everything is drawn in code. The numbers come from engine/pes.js and chemistry/shared/pes-data.js; nothing here knows a chemistry fact
// except the layout of the table (period and group of each element, read from the same Aufbau code as the data).
import { h } from "../../../../shared/virtual-lab/dom.js";
import * as E from "../engine/pes.js";

const D = window.PESData;
export const SUBS = ["1s", "2s", "2p", "3s", "3p", "4s"];
const INK = "#dfe8f2", DIM = "#8fa1b3", BAR = "#4f9bd9", HOT = "#ffd23f", BG = "#0f1620";
export const BIN = 0.05, SIG = 1.2, HALF = 4;   // one histogram bin is 5% of the energy; a peak spreads over 9 bins

// ---------- spectrum ----------
// peaks: [{ sub, MJ, count, bins?: number[9] (estimated electrons per bin), h?: estimated apex height }]
// opts: { ymax, selected, labels, overlay: { student:[{sub,count}], model: 0..1 (share drawn), A: bool }, fade }
export function drawSpectrum(cv, peaks, opts = {}) {
  const ctx = cv.getContext("2d"), W = cv.width, H = cv.height, L = 52, R = 14, T = 12, B = 58, pw = W - L - R, ph = H - T - B;
  const ax = E.axis(E.AXIS_MIN, E.AXIS_MAX, pw), ymax = opts.ymax || 7, yy = (v) => T + ph - (Math.min(v, ymax + 0.4) / ymax) * ph;
  ctx.fillStyle = BG; ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = "#233246"; ctx.lineWidth = 1; ctx.font = "11px system-ui, sans-serif";
  for (let v = 0; v <= ymax; v++) { ctx.beginPath(); ctx.moveTo(L, yy(v)); ctx.lineTo(L + pw, yy(v)); ctx.stroke(); ctx.fillStyle = DIM; ctx.textAlign = "right"; ctx.fillText(String(v), L - 6, yy(v) + 4); }
  ctx.save(); ctx.translate(13, T + ph / 2); ctx.rotate(-Math.PI / 2); ctx.textAlign = "center"; ctx.fillStyle = INK; ctx.fillText("electrons", 0, 0); ctx.restore();
  // bottom axis: decades, decreasing to the right
  ctx.textAlign = "center";
  for (const d of [0.3, 1, 3, 10, 30, 100, 300]) { const x = L + ax.x(d); ctx.strokeStyle = "#2c3d52"; ctx.beginPath(); ctx.moveTo(x, T + ph); ctx.lineTo(x, T + ph + 5); ctx.stroke(); ctx.fillStyle = DIM; ctx.fillText(String(d), x, T + ph + 17); }
  ctx.textAlign = "center";
  ctx.fillStyle = INK; ctx.fillText("Binding energy (MJ/mol, log scale)", L + pw / 2, H - 5);
  ctx.fillStyle = DIM; ctx.textAlign = "left"; ctx.fillText("← held harder", L + 2, H - 22); ctx.textAlign = "right"; ctx.fillText("easier to knock loose →", L + pw - 2, H - 22);
  // bars
  for (const p of peaks) {
    const cx = L + ax.x(p.MJ), sel = opts.selected === p.sub, bw = Math.max(2, ax.x(p.MJ / (1 + BIN)) - ax.x(p.MJ));
    ctx.fillStyle = sel ? HOT : BAR;
    if (p.bins) p.bins.forEach((v, i) => { const k = i - HALF, x = L + ax.x(p.MJ * Math.pow(1 + BIN, k)); const hh = T + ph - yy(v); if (hh > 0.3) ctx.fillRect(x - bw / 2, yy(v), Math.max(2, bw - 0.4), hh); });
    else for (let k = -HALF; k <= HALF; k++) { const v = p.count * Math.exp(-(k * k) / (2 * SIG * SIG)), x = L + ax.x(p.MJ * Math.pow(1 + BIN, k)); ctx.fillRect(x - bw / 2, yy(v), Math.max(2, bw - 0.4), T + ph - yy(v)); }
    if (opts.labels) { ctx.fillStyle = INK; ctx.textAlign = "center"; ctx.fillText(p.sub, cx, yy(p.count) - 5); }
    else if (sel) { ctx.fillStyle = HOT; ctx.textAlign = "center"; ctx.fillText(p.sub, cx, Math.max(T + 10, yy(p.h != null ? p.h : p.count) - 6)); }
  }
  const ov = opts.overlay || {};
  if (ov.student) {   // the student's bars at the real peak positions: i-th bar over the i-th peak, outlined
    ctx.lineWidth = 2; ov.student.forEach((b, i) => { const p = peaks[i]; if (!p) return; const cx = L + ax.x(p.MJ), top = yy(b.count), x0 = cx - 11;
      ctx.strokeStyle = b.ok ? "#58d68d" : "#ff7a6b"; ctx.strokeRect(x0, top, 22, T + ph - top); ctx.fillStyle = b.ok ? "#58d68d" : "#ff7a6b"; ctx.textAlign = "center"; ctx.fillText(b.sub || "?", cx, top - 5); });
  }
  if (ov.modelBars) {   // Model A (or any model): outlined bars at given energies and heights
    ctx.lineWidth = 2; ctx.strokeStyle = "#ffb454"; ctx.fillStyle = "#ffb454"; ctx.textAlign = "center";
    for (const b of ov.modelBars) { const cx = L + ax.x(b.MJ), top = yy(b.count * (ov.model == null ? 1 : ov.model)); ctx.strokeRect(cx - 14, top, 28, T + ph - top); ctx.fillText(b.label, cx, top - 5); }
  } else if (ov.model != null) {   // the rebuilt model: one diamond on every peak at the height the electron count gives
    ctx.fillStyle = "#58d68d"; for (const p of peaks) { const cx = L + ax.x(p.MJ), y = yy(p.count * ov.model); ctx.beginPath(); ctx.moveTo(cx, y - 7); ctx.lineTo(cx + 7, y); ctx.lineTo(cx, y + 7); ctx.lineTo(cx - 7, y); ctx.closePath(); ctx.fill(); }
  }
  return { L, pw, ax, yy, T, ph };
}
// which peak is under pixel x (canvas coordinates)? Returns the sub or null.
export function peakAt(cv, peaks, x) {
  const L = 52, R = 14, pw = cv.width - L - R, ax = E.axis(E.AXIS_MIN, E.AXIS_MAX, pw); let best = null, bd = 16;
  for (const p of peaks) { const d = Math.abs(L + ax.x(p.MJ) - x); if (d < bd) { bd = d; best = p.sub; } }
  return best;
}

// ---------- zoom view ----------
// st: { Z, spec, hit: { sub, keMJ, speed, photonMJ } | null, none: boolean, t (seconds since this hit), photonMJ }
export function drawZoom(cv, st) {
  const ctx = cv.getContext("2d"), W = cv.width, H = cv.height, cx = W * 0.56, cy = H * 0.46, spec = st.spec;
  ctx.fillStyle = BG; ctx.fillRect(0, 0, W, H);
  if (!spec) { ctx.fillStyle = DIM; ctx.font = "13px system-ui"; ctx.textAlign = "center"; ctx.fillText("Pick a sample to see its atom", W / 2, H / 2); return; }
  const shells = [...new Set(spec.map((o) => +o.sub[0]))], rad = (n) => 10 + n * 16;
  ctx.strokeStyle = "#2c3d52"; ctx.lineWidth = 1; for (const n of shells) { ctx.beginPath(); ctx.arc(cx, cy, rad(n), 0, 7); ctx.stroke(); }
  ctx.fillStyle = "#e0472c"; ctx.beginPath(); ctx.arc(cx, cy, 7, 0, 7); ctx.fill(); ctx.fillStyle = "#fff"; ctx.font = "bold 9px system-ui"; ctx.textAlign = "center"; ctx.fillText(st.Z + "+", cx, cy + 3);
  // electrons: each subshell sits on its shell's circle; s a little inside, p a little outside, so the subshells read as separate rings
  const pos = {}; for (const o of spec) { const n = +o.sub[0], r = rad(n) + (o.sub[1] === "p" ? 4 : -3); pos[o.sub] = []; for (let i = 0; i < o.count; i++) { const a = (i / o.count) * 6.2832 + n * 0.7 + (o.sub[1] === "p" ? 0.5 : 0); pos[o.sub].push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]); } }
  const hit = st.hit && pos[st.hit.sub] ? st.hit : null, gone = hit ? hit.sub : null;
  for (const o of spec) pos[o.sub].forEach(([x, y], i) => { if (o.sub === gone && i === 0 && st.t < 1.6) return; ctx.fillStyle = o.sub[1] === "p" ? "#7fd1ff" : "#9ad07a"; ctx.beginPath(); ctx.arc(x, y, 3.2, 0, 7); ctx.fill(); });
  ctx.font = "10px system-ui"; ctx.fillStyle = DIM; for (const n of shells) ctx.fillText(String(n), cx + rad(n) + 9, cy - 2);
  if (hit) {   // photon in from the left, electron out at the computed speed
    const [ex, ey] = pos[hit.sub][0], t = st.t;
    if (t < 0.5) { const px = 8 + (ex - 8) * (t / 0.5); ctx.strokeStyle = "#ffe08a"; ctx.lineWidth = 2; ctx.beginPath(); for (let i = 0; i < 28; i++) { const x = px - 28 + i; if (x < 8) continue; const y = ey + Math.sin(i * 0.9) * 4; i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.stroke(); }
    else { const v = Math.log10(Math.max(hit.speed, 1e5)) - 4.8, dist = (t - 0.5) * (30 + v * 38), ang = -0.5; ctx.fillStyle = "#7fd1ff"; const x = ex + Math.cos(ang) * dist + Math.max(0, 0), y = ey + Math.sin(ang) * dist; if (x < W && y > 0) { ctx.beginPath(); ctx.arc(x, y, 4, 0, 7); ctx.fill(); ctx.strokeStyle = "rgba(127,209,255,.4)"; ctx.beginPath(); ctx.moveTo(ex, ey); ctx.lineTo(x, y); ctx.stroke(); } }
    ctx.fillStyle = INK; ctx.font = "11px system-ui"; ctx.textAlign = "left";
    const sp = hit.speed, spTxt = sp >= 1e6 ? (sp / 1e6).toFixed(1) + " million m/s" : Math.round(sp / 1e3) + " thousand m/s";
    ctx.fillText(`${hit.photonMJ.toFixed(2)} in, ${hit.bindMJ.toFixed(2)} to break free, ${hit.keMJ.toFixed(2)} left (MJ/mol)`, 8, H - 22); ctx.fillText(`Electron leaves at ${spTxt}`, 8, H - 8);
  } else if (st.none) { ctx.fillStyle = "#ffb454"; ctx.font = "12px system-ui"; ctx.textAlign = "left"; ctx.fillText("Light too weak: the photon passes through.", 8, H - 8); }
}

// ---------- periodic table, built from code ----------
// rows of [Z, column]; columns follow the groups (1, 2, then 13 to 18)
const GRID = (() => { const rows = [[[1, 1], [2, 18]], [], [], [[19, 1], [20, 2]]];
  for (let Z = 3; Z <= 18; Z++) { const per = Z <= 10 ? 1 : 2, off = per === 1 ? 2 : 10, i = Z - off; rows[per].push([Z, i <= 2 ? i : i + 10]); } return rows; })();
export function periodicTable({ id = "pesTable", picked = 0, hilite = 0, onPick = null, flagged = {} } = {}) {
  const t = h("div", { id, class: "pesTable", role: "group", "aria-label": "Periodic table, hydrogen to calcium" });
  GRID.forEach((row, r) => row.forEach(([Z, c]) => t.append(h("button", { type: "button", class: "pesEl" + (picked === Z ? " on" : "") + (hilite === Z ? " hi" : ""), "data-z": Z, style: `grid-column:${c};grid-row:${r + 1}`, title: D.SYMBOLS[Z - 1], disabled: onPick ? null : "", onclick: () => onPick && onPick(Z) }, h("small", {}, String(Z)), D.SYMBOLS[Z - 1]))));
  return t;
}

// ---------- draw bench ----------
// state: array of 6 slots { sub:"", count:0 }; the leftmost slot is held hardest. onChange fires after every edit.
export function newBars() { return Array.from({ length: 6 }, () => ({ sub: "", count: 0 })); }
export function barsOf(slots) { return slots.filter((s) => s.count > 0 || s.sub).map((s) => ({ sub: s.sub, count: s.count })); }
export function bench(slots, onChange, { id = "pesDraw", marks = null } = {}) {
  const root = h("div", { id, class: "pesBench" });
  const draw = () => { root.replaceChildren(h("div", { class: "pesBenchRow" }, slots.map((s, i) => {
    const sel = h("select", { "aria-label": `Bar ${i + 1} subshell`, onchange: (e) => { s.sub = e.target.value; onChange(); draw(); } }, h("option", { value: "" }, "label"), SUBS.map((x) => h("option", { value: x, selected: s.sub === x ? "" : null }, x)));
    const col = h("div", { class: "pesSlot" + (marks && marks[i] ? (marks[i].ok ? " ok" : " bad") : ""), "data-i": i },
      h("div", { class: "pesBarBox" }, h("div", { class: "pesBar", style: `height:${s.count * 10}px` }), h("b", {}, s.count ? String(s.count) : "")),
      h("div", { class: "pesPM" }, h("button", { type: "button", "aria-label": `Bar ${i + 1} shorter`, onclick: () => { s.count = Math.max(0, s.count - 1); onChange(); draw(); } }, "−"), h("button", { type: "button", "aria-label": `Bar ${i + 1} taller`, onclick: () => { s.count = Math.min(6, s.count + 1); onChange(); draw(); } }, "+")), sel);
    return col; })), h("div", { class: "pesBenchAx" }, h("span", {}, "← held harder (left)"), h("span", {}, "easier to knock loose (right) →"))); };
  draw(); return root;
}
