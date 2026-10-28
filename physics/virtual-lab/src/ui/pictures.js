// Small SVG pictures for the pre-lab and the Checks tab. Drawn in code, no images.
import { h } from "../../../../shared/virtual-lab/dom.js";

export const svg = (inner, w = 320, hgt = 150, label = "") => { const d = h("div", { class: "pic" }); d.innerHTML = `<svg viewBox="0 0 ${w} ${hgt}" width="${w}" role="img" aria-label="${label}" style="max-width:100%;height:auto">${inner}</svg>`; return d; };
const T = (s, x, y, a = "middle", sz = 12) => `<text x="${x}" y="${y}" text-anchor="${a}" font-size="${sz}" font-family="system-ui,sans-serif" fill="currentColor">${s}</text>`;
const arrow = (x1, x2, y, c) => { const d = x2 > x1 ? 1 : -1; return `<line x1="${x1}" y1="${y}" x2="${x2 - 8 * d}" y2="${y}" stroke="${c}" stroke-width="5"/><polygon points="${x2},${y} ${x2 - 12 * d},${y - 8} ${x2 - 12 * d},${y + 8}" fill="${c}"/>`; };
const cart = (x) => `<rect x="${x}" y="70" width="90" height="26" fill="#5aa0d8"/><circle cx="${x + 20}" cy="102" r="8" fill="#2b2f36"/><circle cx="${x + 70}" cy="102" r="8" fill="#2b2f36"/>`;

// the three warm-up pictures (ids w1, w2, w3 from the sheet's pre-lab)
export const PRELAB = {
  w1: () => svg(`<rect x="10" y="112" width="300" height="6" fill="#9aa4ae"/>${cart(115)}${arrow(205, 305, 83, "#b3412e")}${arrow(115, 70, 83, "#2f6fb3")}`, 320, 130, "A cart with a long arrow pointing right and a short arrow pointing left"),
  w2: () => svg(`<line x1="40" y1="120" x2="40" y2="14" stroke="currentColor" stroke-width="2"/><line x1="40" y1="120" x2="300" y2="120" stroke="currentColor" stroke-width="2"/>${T("time (s)", 170, 144)}<g transform="translate(14 68) rotate(-90)">${T("speed (m/s)", 0, 0)}</g><line x1="40" y1="120" x2="280" y2="26" stroke="#b3412e" stroke-width="4"/><line x1="40" y1="120" x2="280" y2="84" stroke="#2f6fb3" stroke-width="4"/>${T("A", 288, 30, "start", 14)}${T("B", 288, 88, "start", 14)}`, 320, 150, "Two straight lines from zero: line A climbs steeply, line B climbs gently"),
  w3: () => svg(`<rect x="10" y="112" width="300" height="6" fill="#9aa4ae"/>${cart(115)}${arrow(160, 100, 56, "#b3412e")}${arrow(160, 220, 56, "#2f6fb3")}`, 320, 130, "A cart with two equal arrows pointing opposite ways")
};

// Checks tab, item b1-1: two straight lines, A and B (points come from the item)
export function speedLines(fig) {
  const W = 320, H = 190, L = 44, B = 36, pw = W - L - 16, ph = H - B - 14, tmax = 2, vmax = Math.max(...fig.lines.flatMap((l) => l.points.map((p) => p[1]))) * 1.15;
  const X = (t) => L + (t / tmax) * pw, Y = (v) => 14 + ph - (v / vmax) * ph, col = ["#b3412e", "#2f6fb3"];
  let s = `<line x1="${L}" y1="14" x2="${L}" y2="${14 + ph}" stroke="currentColor" stroke-width="2"/><line x1="${L}" y1="${14 + ph}" x2="${L + pw}" y2="${14 + ph}" stroke="currentColor" stroke-width="2"/>`;
  for (const t of [0, 0.5, 1, 1.5, 2]) s += T(t.toFixed(1), X(t), 14 + ph + 15, "middle", 11);
  for (let v = 0.2; v < vmax; v += 0.2) s += T(v.toFixed(1), L - 6, Y(v) + 4, "end", 11) + `<line x1="${L - 3}" y1="${Y(v)}" x2="${L}" y2="${Y(v)}" stroke="currentColor"/>`;
  s += T(fig.axes.x, L + pw / 2, H - 4, "middle", 12);
  s += `<g transform="translate(11 ${14 + ph / 2}) rotate(-90)">${T(fig.axes.y, 0, 0, "middle", 12)}</g>`;
  fig.lines.forEach((l, i) => { const [a, b] = l.points; s += `<line x1="${X(a[0])}" y1="${Y(a[1])}" x2="${X(b[0])}" y2="${Y(b[1])}" stroke="${col[i]}" stroke-width="4"/><circle cx="${X(b[0])}" cy="${Y(b[1])}" r="4" fill="${col[i]}"/>` + T(l.id, X(b[0]) + 8, Y(b[1]) + 4, "start", 14); });
  return svg(s, W, H, "Two straight lines, A and B, from the same start");
}

// Checks tab, items b2-3 and b2-4: the shape of the data, as a small picture on a pair of axes
const SHAPES = {
  "rise-line": (X, Y) => `<line x1="${X(0.04)}" y1="${Y(0.04)}" x2="${X(0.95)}" y2="${Y(0.92)}" stroke="#b3412e" stroke-width="4"/>`,
  "fall-curve": (X, Y) => `<path d="M ${X(0.04)} ${Y(0.95)} Q ${X(0.2)} ${Y(0.25)} ${X(0.95)} ${Y(0.1)}" fill="none" stroke="#b3412e" stroke-width="4"/>`,
  flat: (X, Y) => `<line x1="${X(0.04)}" y1="${Y(0.5)}" x2="${X(0.95)}" y2="${Y(0.5)}" stroke="#b3412e" stroke-width="4"/>`,
  "fall-line": (X, Y) => `<line x1="${X(0.04)}" y1="${Y(0.92)}" x2="${X(0.95)}" y2="${Y(0.08)}" stroke="#b3412e" stroke-width="4"/>`
};
export function shapePic(id) {
  const X = (u) => 12 + u * 96, Y = (u) => 100 - u * 88;
  return svg(`<line x1="12" y1="12" x2="12" y2="100" stroke="currentColor" stroke-width="2"/><line x1="12" y1="100" x2="112" y2="100" stroke="currentColor" stroke-width="2"/>${SHAPES[id](X, Y)}`, 124, 112, id);
}
