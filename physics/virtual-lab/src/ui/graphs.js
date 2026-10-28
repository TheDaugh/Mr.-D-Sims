// Canvas painters for the notebook: the track picture (Figure 1), the speed graph with its two markers (Figure 2) and the graph builder.
// Drawn in code, no images. Pure drawing: no state of their own.
const INK = "#1c2530", GRID = "#e3e7eb", AXIS = "#3a4452", ROSE = "#b3412e", BLUE = "#2f6fb3";

const font = (cx, px, bold) => { cx.font = `${bold ? "bold " : ""}${px}px system-ui, sans-serif`; };
function text(cx, s, x, y, o = {}) { font(cx, o.px || 12, o.bold); cx.fillStyle = o.color || INK; cx.textAlign = o.align || "center"; cx.textBaseline = o.base || "alphabetic"; cx.fillText(s, x, y); }

// ---------- Figure 1: the fan cart on the track ----------
export const TRACK = { W: 560, H: 128, x0: 36, pxPerM: 190, cartW: 92 };
export function paintTrack(cx, st) {
  const { W, H } = TRACK; cx.clearRect(0, 0, W, H);
  cx.fillStyle = "#f4f6f8"; cx.fillRect(0, 0, W, H);
  const railY = H - 38;
  cx.fillStyle = "#9aa4ae"; cx.fillRect(14, railY, 532, 9); cx.fillStyle = "#6b7480"; cx.fillRect(14, railY + 9, 532, 3);
  for (const x of [30, 150, 270, 390, 510]) { cx.fillStyle = "#6b7480"; cx.fillRect(x, railY + 12, 8, 14); }
  text(cx, st.labels.track, 40, railY + 26, { px: 11, color: "#566170" });
  // motion sensor at the far end
  cx.fillStyle = "#2f9e5a"; cx.fillRect(508, railY - 50, 34, 50); cx.fillStyle = "#1f6b3c"; cx.fillRect(508, railY - 50, 34, 6); cx.fillStyle = "#cfeedd"; cx.fillRect(514, railY - 34, 10, 14);
  text(cx, st.labels.sensor, 518, railY + 26, { px: 11, color: "#1f6b3c", bold: true });
  // the cart
  const cartX = TRACK.x0 + st.x * TRACK.pxPerM, w = TRACK.cartW, top = railY - 28;
  cx.fillStyle = "#5aa0d8"; cx.fillRect(cartX, top, w, 24); cx.fillStyle = "#3c7fb8"; cx.fillRect(cartX, top + 18, w, 6);
  for (const wx of [cartX + 18, cartX + w - 18]) { cx.fillStyle = "#2b2f36"; cx.beginPath(); cx.arc(wx, railY - 1, 8, 0, 7); cx.fill(); cx.fillStyle = "#9aa4ae"; cx.beginPath(); cx.arc(wx, railY - 1, 3, 0, 7); cx.fill(); }
  // mass bars stacked on the cart, two to a stack
  for (let i = 0; i < st.bars; i++) { const sx = cartX + 40 + Math.floor(i / 2) * 26, sy = top - 12 - (i % 2) * 12; cx.fillStyle = "#2b2f36"; cx.fillRect(sx, sy, 24, 11); cx.fillStyle = "#4a4f58"; cx.fillRect(sx, sy, 24, 2); }
  if (st.bars) text(cx, st.labels.bars, cartX + 40 + 26 * Math.ceil(st.bars / 2) + 4, top - 15, { px: 11, color: "#2b2f36", bold: true, align: "left" });
  // the fan on its stand at the back of the cart, with the force sensor on it
  cx.fillStyle = "#8a909a"; cx.fillRect(cartX + 8, top - 18, 6, 18);
  cx.fillStyle = "#e8943a"; cx.fillRect(cartX + 2, top - 44, 20, 28);
  const ang = st.spin || 0; cx.save(); cx.translate(cartX + 12, top - 30); cx.rotate(ang); cx.fillStyle = "#fff4e0";
  for (let b = 0; b < 3; b++) { cx.rotate((Math.PI * 2) / 3); cx.fillRect(-2, 0, 4, 11); } cx.restore();
  cx.fillStyle = "#cfeedd"; cx.fillRect(cartX + 22, top - 30, 10, 10); cx.strokeStyle = "#1f6b3c"; cx.strokeRect(cartX + 22.5, top - 29.5, 9, 9);
  text(cx, st.labels.fan, cartX + 12, top - 48, { px: 11, color: "#a8551a", bold: true });
  text(cx, st.labels.forceSensor, cartX + 36, top - 36, { px: 10, color: "#1f6b3c", align: "left" });
  text(cx, st.labels.cart, cartX + w / 2, top + 39, { px: 11, color: "#2a5f8f", bold: true });
  // the push: an arrow from the fan end of the cart toward the sensor, longer for a stronger setting
  if (st.push) { const len = 14 + st.push * 36, ax = cartX + w + 4; cx.strokeStyle = ROSE; cx.fillStyle = ROSE; cx.lineWidth = 4; cx.beginPath(); cx.moveTo(ax, top + 12); cx.lineTo(ax + len, top + 12); cx.stroke(); cx.beginPath(); cx.moveTo(ax + len + 9, top + 12); cx.lineTo(ax + len - 2, top + 5); cx.lineTo(ax + len - 2, top + 19); cx.fill(); cx.lineWidth = 1; text(cx, st.labels.force, ax + len / 2, top + 2, { px: 11, color: ROSE, bold: true }); }
}

// ---------- Figure 2: the speed graph with two draggable markers ----------
export const SPEED = { W: 560, H: 190, L: 50, R: 14, T: 22, B: 34, tmax: 2.0, vmax: 2.0 };
export const speedGeom = () => { const g = SPEED; return { ...g, pw: g.W - g.L - g.R, ph: g.H - g.T - g.B }; };
export const tToX = (t) => { const g = speedGeom(); return g.L + (t / g.tmax) * g.pw; };
export const xToT = (x) => { const g = speedGeom(); return ((x - g.L) / g.pw) * g.tmax; };
export function paintSpeed(cx, st) {
  const g = speedGeom(), { W, H } = g; cx.clearRect(0, 0, W, H); cx.fillStyle = "#fff"; cx.fillRect(0, 0, W, H);
  const vy = (v) => g.T + g.ph - (v / g.vmax) * g.ph;
  cx.lineWidth = 1;
  for (let t = 0; t <= 2.0001; t += 0.5) { const x = tToX(t); cx.strokeStyle = GRID; cx.beginPath(); cx.moveTo(x, g.T); cx.lineTo(x, g.T + g.ph); cx.stroke(); text(cx, t.toFixed(1), x, g.T + g.ph + 15, { px: 11 }); }
  for (let v = 0; v <= 2.0001; v += 0.5) { const y = vy(v); cx.strokeStyle = GRID; cx.beginPath(); cx.moveTo(g.L, y); cx.lineTo(g.L + g.pw, y); cx.stroke(); text(cx, v.toFixed(1), g.L - 6, y + 4, { px: 11, align: "right" }); }
  cx.strokeStyle = AXIS; cx.lineWidth = 1.5; cx.beginPath(); cx.moveTo(g.L, g.T); cx.lineTo(g.L, g.T + g.ph); cx.lineTo(g.L + g.pw, g.T + g.ph); cx.stroke();
  text(cx, st.labels.x, g.L + g.pw / 2, H - 5, { px: 12, bold: true }); cx.save(); cx.translate(12, g.T + g.ph / 2); cx.rotate(-Math.PI / 2); text(cx, st.labels.y, 0, 0, { px: 12, bold: true }); cx.restore();
  const lo = Math.min(...st.mk), hi = Math.max(...st.mk);
  if (st.run) {
    st.run.t.forEach((t, i) => { const inside = t >= lo - 1e-9 && t <= hi + 1e-9 && st.reading && st.reading.ok; cx.fillStyle = inside ? ROSE : BLUE; cx.beginPath(); cx.arc(tToX(t), vy(st.run.v[i]), inside ? 3.2 : 2.6, 0, 7); cx.fill(); });
  } else text(cx, st.labels.empty, g.L + g.pw / 2, g.T + g.ph / 2, { px: 13, color: "#566170" });
  // markers: dashed lines with a numbered handle on top
  st.mk.forEach((t, i) => {
    const x = tToX(t); cx.strokeStyle = ROSE; cx.lineWidth = 2; cx.setLineDash([5, 4]); cx.beginPath(); cx.moveTo(x, g.T); cx.lineTo(x, g.T + g.ph); cx.stroke(); cx.setLineDash([]);
    cx.fillStyle = st.active === i ? "#ffd23f" : ROSE; cx.beginPath(); cx.arc(x, g.T - 8, 9, 0, 7); cx.fill(); cx.strokeStyle = "#fff"; cx.lineWidth = 1.5; cx.stroke();
    text(cx, String(i + 1), x, g.T - 4, { px: 11, bold: true, color: st.active === i ? INK : "#fff" });
  });
  if (st.focus) { cx.strokeStyle = "#17607c"; cx.lineWidth = 2; cx.strokeRect(1, 1, W - 2, H - 2); }
}

// ---------- the graph builder ----------
// Fixed ranges per graph, so the corner (0, 0) is always on the page and a line "through the corner" can be seen.
export const AXES = {
  F: { xmax: 0.7, xstep: 0.1, ymax: 0.7, ystep: 0.1, dx: 1 },
  m: { xmax: 1.75, xstep: 0.25, ymax: 1.0, ystep: 0.2, dx: 2 },
  invm: { xmax: 2.5, xstep: 0.5, ymax: 1.0, ystep: 0.2, dx: 1 }
};
export const BUILDER = { W: 520, H: 330, L: 62, R: 20, T: 18, B: 50 };
export const builderGeom = () => { const g = BUILDER; return { ...g, pw: g.W - g.L - g.R, ph: g.H - g.T - g.B }; };
export function paintBuilder(cx, st) {
  const g = builderGeom(), A = AXES[st.x], { W, H } = g; cx.clearRect(0, 0, W, H); cx.fillStyle = "#fff"; cx.fillRect(0, 0, W, H);
  const px = (v) => g.L + (v / A.xmax) * g.pw, py = (v) => g.T + g.ph - (v / A.ymax) * g.ph;
  for (let v = 0; v <= A.xmax + 1e-9; v += A.xstep) { cx.strokeStyle = GRID; cx.lineWidth = 1; cx.beginPath(); cx.moveTo(px(v), g.T); cx.lineTo(px(v), g.T + g.ph); cx.stroke(); text(cx, +v.toFixed(2) + "", px(v), g.T + g.ph + 16, { px: 11 }); }
  for (let v = 0; v <= A.ymax + 1e-9; v += A.ystep) { cx.strokeStyle = GRID; cx.beginPath(); cx.moveTo(g.L, py(v)); cx.lineTo(g.L + g.pw, py(v)); cx.stroke(); text(cx, +v.toFixed(2) + "", g.L - 7, py(v) + 4, { px: 11, align: "right" }); }
  cx.strokeStyle = AXIS; cx.lineWidth = 1.5; cx.beginPath(); cx.moveTo(g.L, g.T); cx.lineTo(g.L, g.T + g.ph); cx.lineTo(g.L + g.pw, g.T + g.ph); cx.stroke();
  text(cx, st.xLabel, g.L + g.pw / 2, H - 8, { px: 12, bold: true }); cx.save(); cx.translate(14, g.T + g.ph / 2); cx.rotate(-Math.PI / 2); text(cx, st.yLabel, 0, 0, { px: 12, bold: true }); cx.restore();
  const pts = st.dots;
  if (st.line === "guide" && st.fit) { const y0 = st.fit.intercept, y1 = st.fit.intercept + st.fit.slope * A.xmax; cx.save(); cx.beginPath(); cx.rect(g.L, g.T, g.pw, g.ph); cx.clip(); cx.strokeStyle = ROSE; cx.lineWidth = 2.5; cx.beginPath(); cx.moveTo(px(0), py(y0)); cx.lineTo(px(A.xmax), py(y1)); cx.stroke(); cx.restore(); }
  if (st.line === "connect" && pts.length > 1) { cx.strokeStyle = ROSE; cx.lineWidth = 2.5; cx.beginPath(); pts.forEach((p, i) => (i ? cx.lineTo(px(p.x), py(p.y)) : cx.moveTo(px(p.x), py(p.y)))); cx.stroke(); }
  for (const p of pts) { cx.fillStyle = BLUE; cx.beginPath(); cx.arc(px(p.x), py(p.y), 5, 0, 7); cx.fill(); cx.strokeStyle = "#fff"; cx.lineWidth = 1.5; cx.stroke(); }
  if (st.extra) { cx.strokeStyle = ROSE; cx.lineWidth = 2.5; cx.beginPath(); cx.arc(px(st.extra.x), py(st.extra.y), 8, 0, 7); cx.stroke(); }
  if (!pts.length) text(cx, st.labels.empty, g.L + g.pw / 2, g.T + g.ph / 2, { px: 13, color: "#566170" });
  cx.lineWidth = 1;
}
// where a dot sits in the canvas (for the tutorial arrow)
export function builderXY(x, vx, vy) { const g = builderGeom(), A = AXES[x]; return [g.L + (vx / A.xmax) * g.pw, g.T + g.ph - (vy / A.ymax) * g.ph]; }
