// Flame-test logic for lab 4. Pure functions, no DOM. Every chemistry fact (colors, swatches, brightness, masking, lines,
// which salts are known, which pools the unknowns come from) is read from content/flame-data.json; none lives here.

const fnv = (s) => { let x = 2166136261; for (let i = 0; i < s.length; i++) { x ^= s.charCodeAt(i); x = Math.imul(x, 16777619) >>> 0; } return x >>> 0; };
export const hash = fnv;
const mix = (s) => { let x = fnv(s); x ^= x >>> 16; x = Math.imul(x, 0x85ebca6b) >>> 0; x ^= x >>> 13; x = Math.imul(x, 0xc2b2ae35) >>> 0; return (x ^ (x >>> 16)) >>> 0; };

export const byId = (data) => Object.fromEntries(data.samples.map((s) => [s.id, s]));
export const knownIds = (data) => data.samples.filter((s) => s.role === "known").map((s) => s.id);
export const controlIds = (data) => data.samples.filter((s) => s.role === "control").map((s) => s.id);
export const benchIds = (data) => [...knownIds(data), ...controlIds(data)];   // the seven bottles that stay on the bench
export const metals = (data) => Object.keys(data.spectra);

// ---------- color groups, brightness, swatches ----------
export const colorGroups = (data) => [...new Set(data.samples.filter((s) => s.role === "known").map((s) => s.flame.colorGroup))];
export const brightnessWords = (data) => [...new Set(data.samples.map((s) => s.flame.brightness))];
export const swatchOf = (data, group) => (data.samples.find((s) => s.flame.colorGroup === group) || { flame: {} }).flame.swatch || "#999";
export const knownsInGroup = (data, group) => data.samples.filter((s) => s.role === "known" && s.flame.colorGroup === group).map((s) => s.metal);
export const ambiguousGroups = (data) => colorGroups(data).filter((g) => knownsInGroup(data, g).length > 1);

// ---------- one burn: what the flame looks like second by second ----------
// A fresh splint shows the salt. A reused splint, and a salt whose data carries a masking effect, show the agent's color first.
export function flashSeconds(data) {
  const m = data.samples.map((s) => s.masking).find(Boolean), r = m && /first (\d+(?:\.\d+)?) seconds?/.exec(m.effect);
  return r ? +r[1] : 0;
}
export const maskingAgent = (data) => { const m = data.samples.map((s) => s.masking).find(Boolean); return m ? m.agent : null; };
export function agentSwatch(data) { const a = maskingAgent(data), s = data.samples.find((x) => x.metal === a && x.role === "known"); return s ? s.flame : null; }
export function burn(data, sampleId, reused = false) {
  const s = byId(data)[sampleId]; if (!s) throw new Error("unknown sample " + sampleId);
  const phases = [], fl = flashSeconds(data), ag = agentSwatch(data), own = { swatch: s.flame.swatch, brightness: s.flame.brightness, name: s.flame.colorGroup };
  const flash = (reused || s.masking) && ag && fl > 0 && s.metal !== maskingAgent(data);
  if (flash) phases.push({ from: 0, to: fl, swatch: ag.swatch, brightness: ag.brightness, name: ag.colorGroup, flash: true });
  phases.push({ from: flash ? fl : 0, to: HOLD_S, ...own });
  return { sample: sampleId, reused: !!reused, phases };
}
export const HOLD_S = 10;   // the sheet's 10-second hold
export const phaseAt = (b, t) => b.phases.find((p) => t >= p.from && t < p.to) || b.phases[b.phases.length - 1];

// ---------- the splint ----------
export const newSplint = (id) => ({ id, dips: 0, dipped: null, used: false });
export function dip(sp, sampleId) { sp.dips++; sp.dipped = sampleId; return isReused(sp); }
export const isReused = (sp) => sp.used || sp.dips > 1;

// ---------- unknowns ----------
export function assignUnknowns(data, key) {
  const a = data.unknowns.A.pool, b = data.unknowns.B.pool, k = String(key);
  return { A: a[mix("A|" + k) % a.length], B: b[mix("B|" + k) % b.length] };
}
export const unknownLabel = (n) => String.fromCharCode(65 + n);            // 0 = A, 1 = B, 2 = C ...
export function extraSample(data, key, n) {                                  // n-th extra bottle (n = 0 is label C)
  const p = data.unknowns.extra.pool; return p[mix("x" + n + "|" + key) % p.length];
}

// ---------- the record ----------
// rows: { [sampleId]: { color, brightness, tested, flagged } } for the bench salts; unk: { [label]: { sample, color, brightness, tested, flagged, lines, identity } }
export const rowRecorded = (r) => !!(r && r.color && r.brightness);
export const knownsRecorded = (data, rows) => benchIds(data).every((id) => rowRecorded(rows[id]));
export const unknownsOpen = knownsRecorded;
export const unknownAnswered = (u) => !!(u && u.identity);
export function recordComplete(data, rows, unk) {
  return knownsRecorded(data, rows) && ["A", "B"].every((l) => unknownAnswered(unk[l]));
}
export const needsSecondTool = (data, unk) => Object.values(unk).some((u) => u.sample && u.color && ambiguousGroups(data).includes(u.color));

// ---------- quests: which of the sheet's eleven are done ----------
export function questRules(data, F, events, ppeOn, first) {
  const ev = (type, where = {}) => events.some((e) => e.type === type && Object.entries(where).every(([k, v]) => e[k] === v));
  const u = F.unk || {};
  return {
    gear: !!ppeOn,
    door: events.some((e) => e.type === "door" && String(e.outcome).startsWith("entered")),
    flamebench: ev("visit", { object: "bench" }),
    firsttest: events.some((e) => e.type === "flame_test" && e.sample === first),
    record: rowRecorded(F.rows[first]),
    knowns: knownsRecorded(data, F.rows),
    unknowns: !!(u.A && u.B && F.taken && F.taken.includes("A") && F.taken.includes("B")),
    "unknown-tests": ["A", "B"].every((l) => u[l] && rowRecorded(u[l])),
    "second-test": ev("spec_open") || !needsSecondTool(data, u),
    identify: ["A", "B"].every((l) => unknownAnswered(u[l])),
    cer: !!F.cerDone
  };
}

// ---------- spectroscope picture, drawn from the data ----------
export const NM_MIN = 380, NM_MAX = 780;
export function wavelengthRGB(nm) {                                             // display only: the usual visible-light ramp
  let r = 0, g = 0, b = 0;
  if (nm >= 380 && nm < 440) { r = -(nm - 440) / 60; b = 1; } else if (nm < 490) { g = (nm - 440) / 50; b = 1; } else if (nm < 510) { g = 1; b = -(nm - 510) / 20; }
  else if (nm < 580) { r = (nm - 510) / 70; g = 1; } else if (nm < 645) { r = 1; g = -(nm - 645) / 65; } else if (nm <= 780) { r = 1; }
  const f = nm < 420 ? 0.3 + 0.7 * (nm - 380) / 40 : nm > 700 ? 0.3 + 0.7 * (780 - nm) / 80 : 1, c = (v) => Math.round(255 * Math.pow(Math.max(0, v * f), 0.8));
  return `rgb(${c(r)},${c(g)},${c(b)})`;
}
export function mergeLines(lines, tol = 1) {                                    // a hand spectroscope shows lines this close as one
  const out = [];
  for (const l of lines.slice().sort((a, b) => a.nm - b.nm)) {
    const last = out[out.length - 1];
    if (last && l.nm - last.nm <= tol) { last.nm = (last.nm * last.w + l.nm) / (last.w + 1); last.w++; last.rel = Math.max(last.rel, l.rel); } else out.push({ nm: l.nm, rel: l.rel, w: 1 });
  }
  return out.map(({ nm, rel }) => ({ nm: Math.round(nm * 10) / 10, rel }));
}
// Rows: [{ label, metal }] or [{ label, lines:[nm...] }]. Heights rank lines within one metal only.
export function spectrumSvg(data, rows, opts = {}) {
  const W = opts.width || 640, PAD = 52, RW = W - PAD - 8, RH = opts.rowH || 30, TOP = 26, x = (nm) => PAD + (nm - NM_MIN) / (NM_MAX - NM_MIN) * RW;
  const H = TOP + rows.length * (RH + 6) + 24, parts = [`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" role="img" aria-label="${opts.label || "Spectroscope view"}" style="max-width:100%;height:auto">`];
  const stops = []; for (let nm = NM_MIN; nm <= NM_MAX; nm += 10) stops.push(`<stop offset="${((nm - NM_MIN) / (NM_MAX - NM_MIN) * 100).toFixed(1)}%" stop-color="${wavelengthRGB(nm)}"/>`);
  parts.push(`<defs><linearGradient id="${opts.id || "sp"}g">${stops.join("")}</linearGradient></defs>`, `<rect x="${PAD}" y="2" width="${RW}" height="14" fill="url(#${opts.id || "sp"}g)"/>`);
  let y = TOP;
  for (const [ri, r] of rows.entries()) {
    const sp = r.metal ? data.spectra[r.metal] : null, lines = r.lines ? r.lines.map((nm) => ({ nm, rel: 1000 })) : mergeLines(sp.lines), mx = Math.max(...lines.map((l) => l.rel));
    parts.push(`<rect x="${PAD}" y="${y}" width="${RW}" height="${RH}" fill="#000" data-row="${r.label}"/>`);
    for (const b of (sp && sp.bands) || []) parts.push(`<rect class="band" x="${x(b.fromNm).toFixed(1)}" y="${y}" width="${(x(b.toNm) - x(b.fromNm)).toFixed(1)}" height="${RH}" fill="${wavelengthRGB((b.fromNm + b.toNm) / 2)}" opacity=".22" data-from="${b.fromNm}" data-to="${b.toNm}"/>`);
    for (const l of lines) { const hgt = r.lines ? RH - 4 : (0.2 + 0.8 * Math.sqrt(l.rel / mx)) * (RH - 4); parts.push(`<line class="ln" data-nm="${l.nm}" x1="${x(l.nm).toFixed(1)}" x2="${x(l.nm).toFixed(1)}" y1="${(y + RH - 2).toFixed(1)}" y2="${(y + RH - 2 - hgt).toFixed(1)}" stroke="${wavelengthRGB(l.nm)}" stroke-width="2.6"/>`); }
    parts.push(`<text x="${PAD - 6}" y="${y + RH / 2 + 5}" text-anchor="end" font-size="14" font-family="system-ui,sans-serif" fill="currentColor">${r.label}</text>`);
    for (const c of (opts.circle || []).filter((c) => c.row === ri)) parts.push(`<circle class="ring" cx="${x(c.nm).toFixed(1)}" cy="${y + RH / 2}" r="${c.r || 16}" fill="none" stroke="#ffd23f" stroke-width="2.5"/>`);
    for (const c of (opts.circle || []).filter((c) => c.row === ri)) parts.push(`<circle class="ring" cx="${x(c.nm).toFixed(1)}" cy="${y + RH / 2}" r="${c.r || 16}" fill="none" stroke="#ffd23f" stroke-width="2.5"/>`);
    y += RH + 6;
  }
  for (const nm of [400, 500, 600, 700]) parts.push(`<text x="${x(nm).toFixed(1)}" y="${H - 6}" text-anchor="middle" font-size="12" font-family="system-ui,sans-serif" fill="currentColor">${nm}</text>`);
  parts.push(`<text x="${W - 8}" y="${H - 6}" text-anchor="end" font-size="12" font-family="system-ui,sans-serif" fill="currentColor">nm</text></svg>`);
  return parts.join("");
}

// ---------- practice items (items.json) ----------
export const bandOf = (items, id) => items.items.find((i) => i.id === id).band;
export function nextItem(items, st) {                                           // st: { band, done: [ids] }
  const left = items.items.filter((i) => !st.done.includes(i.id));
  return left.find((i) => i.band === st.band) || left.filter((i) => i.band < st.band).sort((a, b) => b.band - a.band)[0] || left.sort((a, b) => a.band - b.band)[0] || null;
}
export const HINTS_MAX = 3;
// One answer. Hint k opens only after the k-th wrong attempt, so each hint costs a fresh attempt. The answer is never shown.
// After the last hint and one more miss the item closes as missed. The band moves up only on a right answer given first time.
export function answerItem(items, st, item, choice) {
  const s = (st.res[item.id] ||= { tries: 0, hints: 0, ok: false, closed: false, firstTry: false }), right = item.answer === undefined ? true : choice === item.answer;
  if (s.ok || s.closed) return { ...s, state: s.ok ? "right" : "closed" };
  if (right) { s.ok = true; s.firstTry = s.tries === 0; if (s.firstTry) st.band = Math.min(items.bands, st.band + 1); st.done.push(item.id); return { ...s, state: "right" }; }
  s.tries++;
  if (s.hints < HINTS_MAX) { s.hints++; return { ...s, state: "hint", hint: item.hints[s.hints - 1] }; }
  s.closed = true; st.done.push(item.id); return { ...s, state: "closed" };
}
// The answer each check kind implies, from the data. Tests compare it with items.json; students are graded against items.json.
export function deriveAnswer(data, item) {
  const c = item.check, b = byId(data), ms = metals(data);
  if (c.kind === "match") { const m = knownsInGroup(data, c.group); return m.length === 1 ? m[0] : null; }
  if (c.kind === "sameColorDifferentAnion") return b[c.a].flame.colorGroup === b[c.b].flame.colorGroup && b[c.a].anion !== b[c.b].anion ? "same" : null;
  if (c.kind === "masking") return b[c.metal + "Cl"].masking && b[c.metal + "Cl"].masking.agent === c.agent ? c.metal : null;
  if (c.kind === "ambiguousPair") return ambiguousGroups(data).map((g) => knownsInGroup(data, g).join(" and ")).join(";") || null;
  if (c.kind === "spectrumMatch") { const m = ms.filter((x) => c.linesNm.every((nm) => data.spectra[x].lines.some((l) => Math.abs(l.nm - nm) <= 0.5))); return m.length === 1 ? m[0] : null; }
  return null;
}
