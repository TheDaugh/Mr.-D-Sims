/* Small helpers shared by the stats checker engine and its day files: a seeded random stream, and the pictures
   (two-way table, segmented bars, scatterplot, residual plot) drawn as plain SVG so they print and scale. */
import { h } from "../../../shared/virtual-lab/dom.js";
export { h };

let seed = Date.now() % 100000;
export const rnd = () => { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };
export const ri = (a, b) => a + Math.floor(rnd() * (b - a + 1));
export const pick = (a) => a[Math.floor(rnd() * a.length)];
export const shuffle = (a) => a.map(x => [rnd(), x]).sort((p, q) => p[0] - q[0]).map(p => p[1]);
export const pct = (p, o) => Math.round(100 * p / o);
export const round = (x, d = 0) => { const k = 10 ** d; return Math.round(x * k) / k; };
const gauss = () => { let u = 0, v = 0; while (!u) u = rnd(); while (!v) v = rnd(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); };
export { gauss };
export const svg = (s) => { const d = document.createElement("div"); d.innerHTML = s; return d.firstChild; };

/* correlation and least-squares line of points [[x,y],...] */
export function corr(P) {
  const n = P.length, mx = P.reduce((a, p) => a + p[0], 0) / n, my = P.reduce((a, p) => a + p[1], 0) / n;
  let sxy = 0, sxx = 0, syy = 0; P.forEach(([x, y]) => { sxy += (x - mx) * (y - my); sxx += (x - mx) ** 2; syy += (y - my) ** 2; });
  return { r: sxy / Math.sqrt(sxx * syy), b: sxy / sxx, a: my - (sxy / sxx) * mx, mx, my };
}
/* n points with correlation close to r (within tol), x spread over [x0,x1], y centred at ym with spread ys */
export function cloud(n, r, x0, x1, ym, ys, tol = 0.04) {
  let best = null, bd = 9;
  for (let k = 0; k < 600; k++) {
    const P = [];
    for (let i = 0; i < n; i++) { const z1 = gauss(), z2 = gauss(), x = (x0 + x1) / 2 + (x1 - x0) / 4 * z1; P.push([x, ym + ys * (r * z1 + Math.sqrt(Math.max(0, 1 - r * r)) * z2)]); }
    const Q = P.map(([x, y]) => [round(x, 1), round(y, 1)]), d = Math.abs(corr(Q).r - r);
    if (d <= tol) return Q;
    if (d < bd) { bd = d; best = Q; }
  }
  return best;   // closest found; callers compute r from the dots, never assume it
}

/* ---------- pictures ---------- */
export function tableEl(t) {
  const c = t.c;
  return h("table", { class: "tw" },
    h("tr", {}, h("th", {}, c.head), h("th", {}, c.cols[0]), h("th", {}, c.cols[1]), h("th", { class: "tot" }, "Total")),
    ...[0, 1].map(r => h("tr", {}, h("th", {}, c.lab[r]), h("td", {}, String(t.n[r][0])), h("td", {}, String(t.n[r][1])), h("td", { class: "tot" }, String(t.R[r])))),
    h("tr", {}, h("th", { class: "tot" }, "Total"), h("td", { class: "tot" }, String(t.C[0])), h("td", { class: "tot" }, String(t.C[1])), h("td", { class: "tot" }, String(t.N))));
}
export function barsSvg(c, P, opt = {}) {
  const W = 520, H = 300, L = 54, B = 250, T = 20, bw = 110, xs = [L + 70, L + 260];
  const y = (p) => B - (B - T) * p / 100;
  const s = [`<svg class="bars" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Segmented bar graph">`];
  for (let p = 0; p <= 100; p += 10) s.push(`<line x1="${L}" x2="${W - 20}" y1="${y(p)}" y2="${y(p)}" stroke="#ddd"/><text x="${L - 8}" y="${y(p) + 5}" text-anchor="end" font-size="13">${p}</text>`);
  s.push(`<text x="14" y="${(B + T) / 2}" font-size="13" transform="rotate(-90 14 ${(B + T) / 2})" text-anchor="middle">percent</text>`);
  [0, 1].forEach(i => {
    const x = xs[i] - bw / 2, p = P[i];
    if (p != null) s.push(`<rect x="${x}" y="${y(p)}" width="${bw}" height="${B - y(p)}" fill="#F6E7A8" stroke="#222" stroke-width="2"/>`);
    s.push(`<rect x="${x}" y="${T}" width="${bw}" height="${B - T}" fill="none" stroke="#222" stroke-width="2"/>`);
    if (p != null) s.push(`<line x1="${x}" x2="${x + bw}" y1="${y(p)}" y2="${y(p)}" stroke="#222" stroke-width="3"/>`);
    if (opt.labels && p != null) s.push(`<text x="${xs[i]}" y="${(y(p) + B) / 2 + 6}" text-anchor="middle" font-weight="bold">${p}%</text><text x="${xs[i]}" y="${(y(p) + T) / 2 + 6}" text-anchor="middle" font-weight="bold">${100 - p}%</text>`);
    s.push(`<text x="${xs[i]}" y="${B + 24}" text-anchor="middle" font-size="16" font-weight="bold">${c.lab[i]}</text>`);
  });
  s.push(`<rect x="${W - 140}" y="${T}" width="16" height="14" fill="#F6E7A8" stroke="#222"/><text x="${W - 118}" y="${T + 12}" font-size="14">${c.cols[0]}</text>`);
  s.push(`<rect x="${W - 140}" y="${T + 22}" width="16" height="14" fill="#fff" stroke="#222"/><text x="${W - 118}" y="${T + 34}" font-size="14">${c.cols[1]}</text></svg>`);
  return svg(s.join(""));
}
const niceStep = (span) => { const raw = span / 8, p = 10 ** Math.floor(Math.log10(raw)); return [1, 2, 5, 10].map(k => k * p).find(k => k >= raw); };
/* scatterplot. opt: xlab, ylab, xr:[a,b], yr:[a,b], line:{a,b}, labels:{index:"A"}, hi:index (highlight red), grid:true */
export function scatterSvg(P, opt = {}) {
  const W = 560, H = 360, L = 64, R = 20, T = 16, B = 300;
  const xs = P.map(p => p[0]), ys = P.map(p => p[1]);
  const xr = opt.xr || [Math.min(...xs), Math.max(...xs)], yr = opt.yr || [Math.min(...ys), Math.max(...ys)];
  const sx = niceStep(xr[1] - xr[0] || 1), sy = niceStep(yr[1] - yr[0] || 1);
  const x0 = Math.floor(xr[0] / sx) * sx, x1 = Math.ceil(xr[1] / sx) * sx, y0 = Math.floor(yr[0] / sy) * sy, y1 = Math.ceil(yr[1] / sy) * sy;
  const X = (x) => L + (W - L - R) * (x - x0) / (x1 - x0), Y = (y) => B - (B - T) * (y - y0) / (y1 - y0);
  const s = [`<svg class="bars" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Scatterplot">`];
  for (let x = x0; x <= x1 + 1e-9; x += sx) s.push(`<line x1="${X(x)}" x2="${X(x)}" y1="${T}" y2="${B}" stroke="#e3e3e3"/><text x="${X(x)}" y="${B + 18}" text-anchor="middle" font-size="13">${round(x, 3)}</text>`);
  for (let y = y0; y <= y1 + 1e-9; y += sy) s.push(`<line x1="${L}" x2="${W - R}" y1="${Y(y)}" y2="${Y(y)}" stroke="#e3e3e3"/><text x="${L - 6}" y="${Y(y) + 4}" text-anchor="end" font-size="13">${round(y, 3)}</text>`);
  s.push(`<line x1="${L}" x2="${W - R}" y1="${B}" y2="${B}" stroke="#222" stroke-width="2"/><line x1="${L}" x2="${L}" y1="${T}" y2="${B}" stroke="#222" stroke-width="2"/>`);
  if (opt.line) {
    const a = opt.line.a, b = opt.line.b, cid = "c" + Math.floor(Math.random() * 1e9);
    s.push(`<clipPath id="${cid}"><rect x="${L}" y="${T}" width="${W - R - L}" height="${B - T}"/></clipPath><g clip-path="url(#${cid})">`);
    if (opt.resid) P.forEach(p => s.push(`<line x1="${X(p[0])}" x2="${X(p[0])}" y1="${Y(p[1])}" y2="${Y(a + b * p[0])}" stroke="#C0392B" stroke-width="3"/>`));
    s.push(`<line x1="${X(x0)}" x2="${X(x1)}" y1="${Y(a + b * x0)}" y2="${Y(a + b * x1)}" stroke="#2b6cb0" stroke-width="3"/></g>`);
  }
  P.forEach((p, i) => s.push(`<circle cx="${X(p[0])}" cy="${Y(p[1])}" r="6" fill="${opt.hi === i ? "#C0392B" : "#2AACAF"}" stroke="#1A1A1A" stroke-width="1.5"/>` + (opt.labels && opt.labels[i] ? `<text x="${X(p[0]) + 9}" y="${Y(p[1]) - 7}" font-weight="bold" font-size="15">${opt.labels[i]}</text>` : "")));
  if (opt.xlab) s.push(`<text x="${(L + W - R) / 2}" y="${H - 8}" text-anchor="middle" font-size="15" font-weight="bold">${opt.xlab}</text>`);
  if (opt.ylab) s.push(`<text x="16" y="${(T + B) / 2}" font-size="15" font-weight="bold" transform="rotate(-90 16 ${(T + B) / 2})" text-anchor="middle">${opt.ylab}</text>`);
  s.push(`</svg>`);
  return svg(s.join(""));
}
/* residual plot: points [[x,res]] with a zero line */
export function residSvg(R, opt = {}) {
  const m = Math.max(...R.map(p => Math.abs(p[1]))) * 1.2 || 1;
  return scatterSvg(R, Object.assign({ yr: [-m, m], xlab: opt.xlab, ylab: "Residual", line: { a: 0, b: 0 } }, opt));
}

/* dotplot of whole-number values; opt: lo, hi, step, hl (values <= hl drawn orange), xlab */
export function dotplotSvg(vals, opt = {}) {
  const W = 560, H = 190, L = 24, R = 24, B = 140;
  const lo = opt.lo != null ? opt.lo : Math.min(...vals) - 1, hi = opt.hi != null ? opt.hi : Math.max(...vals) + 1, step = opt.step || 1;
  const X = (v) => L + (W - L - R) * (v - lo) / (hi - lo), cnt = {};
  const s = [`<svg class="bars" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Dotplot">`, `<line x1="${L}" x2="${W - R}" y1="${B}" y2="${B}" stroke="#222" stroke-width="2"/>`];
  for (let v = lo; v <= hi + 1e-9; v += step) s.push(`<line x1="${X(v)}" x2="${X(v)}" y1="${B}" y2="${B + 6}" stroke="#222"/><text x="${X(v)}" y="${B + 22}" text-anchor="middle" font-size="14">${round(v, 2)}</text>`);
  vals.slice().sort((a, b) => a - b).forEach(v => { cnt[v] = (cnt[v] || 0) + 1; s.push(`<circle cx="${X(v)}" cy="${B - 10 - (cnt[v] - 1) * 17}" r="7" fill="${opt.hl != null && v <= opt.hl ? "#E8833A" : "#2AACAF"}" stroke="#1A1A1A" stroke-width="1.5"/>`); });
  if (opt.xlab) s.push(`<text x="${W / 2}" y="${H - 4}" text-anchor="middle" font-size="15" font-weight="bold">${opt.xlab}</text>`);
  s.push("</svg>"); return svg(s.join(""));
}
/* number line of hops: mean, SD, k = how many SDs each side; opt.mark = value to draw as an orange dot */
export function hopsSvg(mean, sd, opt = {}) {
  const k = opt.k || 3, W = 560, H = 120, L = 30, R = 30, Y = 70, lo = mean - k * sd, hi = mean + k * sd;
  const X = (v) => L + (W - L - R) * (v - lo) / (hi - lo);
  const s = [`<svg class="bars" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Number line in standard deviations">`, `<line x1="${L - 10}" x2="${W - R + 10}" y1="${Y}" y2="${Y}" stroke="#222" stroke-width="2"/>`];
  for (let i = -k; i <= k; i++) { const v = mean + i * sd; s.push(`<line x1="${X(v)}" x2="${X(v)}" y1="${Y - 8}" y2="${Y + 8}" stroke="#222" stroke-width="2"/><text x="${X(v)}" y="${Y + 28}" text-anchor="middle" font-size="14">${round(v, 2)}</text><text x="${X(v)}" y="${Y - 16}" text-anchor="middle" font-size="13" fill="#17777A" font-weight="bold">z = ${i}</text>`); }
  if (opt.mark != null) s.push(`<circle cx="${X(Math.max(lo, Math.min(hi, opt.mark)))}" cy="${Y}" r="9" fill="#E8833A" stroke="#1A1A1A" stroke-width="1.5"/>`);
  s.push("</svg>"); return svg(s.join(""));
}

/* ---------- the normal distribution ---------- */
/* Phi(z): Abramowitz-Stegun 7.1.26 erf, error below 1.5e-7, good to the tenth of a percent students are asked for */
export function phi(z) {
  const t = 1 / (1 + 0.3275911 * Math.abs(z) / Math.SQRT2);
  const y = 1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-z * z / 2);
  return z >= 0 ? (1 + y) / 2 : (1 - y) / 2;
}
export const normalcdf = (lo, hi, mu, sd) => phi((hi - mu) / sd) - phi((lo - mu) / sd);
export function invNorm(p, mu = 0, sd = 1) { let a = -10, b = 10; for (let i = 0; i < 80; i++) { const m = (a + b) / 2; if (phi(m) < p) a = m; else b = m; } return mu + sd * (a + b) / 2; }
/* a normal curve with hops on the axis. opt: shade [[lo, hi], ...], color, labels (false hides numbers), xlab, mark (a value with a line) */
export function normalSvg(mu, sd, opt = {}) {
  const W = 560, H = 190, L = 20, R = 20, B = 140, T = 14, x0 = mu - 3.6 * sd, x1 = mu + 3.6 * sd;
  const X = (v) => L + (W - L - R) * (v - x0) / (x1 - x0), Y = (v) => B - (B - T) * Math.exp(-(((v - mu) / sd) ** 2) / 2);
  const pts = (a, b) => { const out = []; for (let i = 0; i <= 120; i++) { const v = a + (b - a) * i / 120; out.push(`${X(v).toFixed(1)},${Y(v).toFixed(1)}`); } return out; };
  const s = [`<svg class="bars" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Normal curve">`];
  (opt.shade || []).forEach(([a, b]) => { a = Math.max(a, x0); b = Math.min(b, x1); if (b > a) s.push(`<polygon points="${X(a)},${B} ${pts(a, b).join(" ")} ${X(b)},${B}" fill="${opt.color || "#F4C7A1"}"/>`); });
  s.push(`<polyline points="${pts(x0, x1).join(" ")}" fill="none" stroke="#1A1A1A" stroke-width="2.5"/>`, `<line x1="${L}" x2="${W - R}" y1="${B}" y2="${B}" stroke="#222" stroke-width="2"/>`);
  for (let k = -3; k <= 3; k++) { const v = mu + k * sd; s.push(`<line x1="${X(v)}" x2="${X(v)}" y1="${B}" y2="${B + 6}" stroke="#222"/>` + (opt.labels === false ? "" : `<text x="${X(v)}" y="${B + 22}" text-anchor="middle" font-size="14">${round(v, 2)}</text>`)); }
  if (opt.mark != null) s.push(`<line x1="${X(opt.mark)}" x2="${X(opt.mark)}" y1="${T}" y2="${B}" stroke="#C0392B" stroke-width="2.5"/>`);
  if (opt.xlab) s.push(`<text x="${W / 2}" y="${H - 4}" text-anchor="middle" font-size="15" font-weight="bold">${opt.xlab}</text>`);
  s.push("</svg>"); return svg(s.join(""));
}
/* a flat density curve from a to b; opt.shade [lo, hi] */
export function uniformSvg(a, b, opt = {}) {
  const W = 560, H = 170, L = 50, R = 20, B = 120, T = 30, x0 = a - (b - a) * 0.15, x1 = b + (b - a) * 0.15, X = (v) => L + (W - L - R) * (v - x0) / (x1 - x0);
  const s = [`<svg class="bars" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Flat density curve">`, `<rect x="${X(a)}" y="${T}" width="${X(b) - X(a)}" height="${B - T}" fill="#BCD3EE" stroke="#1A1A1A" stroke-width="2"/>`];
  if (opt.shade) s.push(`<rect x="${X(opt.shade[0])}" y="${T}" width="${X(opt.shade[1]) - X(opt.shade[0])}" height="${B - T}" fill="#F4C7A1" stroke="#1A1A1A" stroke-width="1.5"/>`);
  s.push(`<line x1="${L}" x2="${W - R}" y1="${B}" y2="${B}" stroke="#222" stroke-width="2"/><text x="${L - 6}" y="${T + 5}" text-anchor="end" font-size="14">1/${b - a}</text>`);
  const step = (b - a) / 4; for (let v = a; v <= b + 1e-9; v += step) s.push(`<line x1="${X(v)}" x2="${X(v)}" y1="${B}" y2="${B + 6}" stroke="#222"/><text x="${X(v)}" y="${B + 22}" text-anchor="middle" font-size="14">${round(v, 2)}</text>`);
  if (opt.shade) opt.shade.forEach(v => { if (Math.abs(((v - a) / step) % 1) > 1e-9) s.push(`<text x="${X(v)}" y="${B + 22}" text-anchor="middle" font-size="14" fill="#A4510F">${v}</text>`); });
  if (opt.xlab) s.push(`<text x="${W / 2}" y="${H - 4}" text-anchor="middle" font-size="15" font-weight="bold">${opt.xlab}</text>`);
  s.push("</svg>"); return svg(s.join(""));
}
