// The atom microscope: real Coulomb forces on alpha particles, drawn the way PhET draws them (black field, dashed electron levels, magenta traces).
// Everything is computed, not scripted: each alpha is pushed by 2Z·1.44 MeV·fm / r² from the nucleus (or by the pudding's harmonic force), and
// the angle you see is the angle the integrator produced. engine/coulomb.js checks that against Rutherford's formula.
import { h } from "./dom.js";
import { ELEMENTS, closestApproach, nuclearRadius, thetaFromB, speed, wavelengthFm, accel, stepAlpha, forceMeVFm, MEV_FM_TO_N } from "../engine/coulomb.js";

export const newScope = () => ({ model: "nuc", scale: "nuclear", Z: 79, N: 118, E: 5, traces: true, forces: true });
const W = 640, H = 400, ATOMIC_W = 6e5, R_ATOM = 1.0e5;
const sci = (v) => { if (!(v > 0)) return "0"; const e = Math.floor(Math.log10(v)); return e >= -1 && e <= 3 ? (v >= 100 ? v.toFixed(0) : v.toFixed(1)) : `${(v / Math.pow(10, e)).toFixed(1)}×10^${e}`; };

export function createAtomScope({ state, onShot }) {
  const st = () => state(), canvas = h("canvas", { width: W * 1, height: H, style: `width:${W}px;height:${H}px;background:#000;border-radius:8px;cursor:crosshair`, "aria-label": "Atom microscope: click to fire an alpha particle at that height" });
  const g = canvas.getContext("2d"); let alphas = [], beamOn = false, beamT = 0, last = null, readT = 0, seq = 0;
  const geom = () => {
    const s = st(), Wfm = s.scale === "atomic" || s.model === "plum" ? ATOMIC_W : Math.max(14 * closestApproach(s.Z, s.E), 60), Hfm = (Wfm * H) / W, A = s.Z + s.N, R = nuclearRadius(A);
    const atomic = s.scale === "atomic" || s.model === "plum";
    const nuclei = atomic ? [[0.25, 0.28], [0.75, 0.28], [0.25, 0.78], [0.75, 0.78]].map(([a, b]) => ({ x: a * Wfm, y: b * Hfm })) : [{ x: Wfm / 2, y: Hfm / 2 }];
    return { s, Wfm, Hfm, R, atomic, nuclei, k: W / Wfm };
  };
  function fire(yfm) {
    const { s, Wfm, Hfm, nuclei, atomic } = geom(), v = Math.sqrt(2 * s.E), a = { id: ++seq, x: -40 * Wfm, y: yfm, vx: v, vy: 0, trail: [], t: 0, b: 0, done: false, rmin: 1e12 };
    // Pre-roll from far away so the path arrives with the right curvature, then show it from the left edge.
    const Rm = s.model === "plum" ? R_ATOM : 0;
    for (let i = 0; i < 20000 && a.x < 0; i++) stepAlpha(a, s.model, s.Z, nuclei, Rm, 40 * Wfm);
    const near = nuclei.reduce((m, n) => (Math.abs(n.y - yfm) < Math.abs(m.y - yfm) ? n : m), nuclei[0]); a.b = Math.abs(near.y - yfm); a.near = near;
    a.trail.push([a.x, a.y]); alphas.push(a); if (alphas.length > 60) alphas.shift();
    return a;
  }
  const rand = () => { const { Hfm, atomic, s, nuclei } = geom(); if (atomic) { return Math.random() * Hfm; } const d0 = closestApproach(s.Z, s.E); return nuclei[0].y + (Math.random() * 2 - 1) * 3.5 * d0; };
  function finish(a, gm) {
    a.done = true; const th = Math.abs((Math.atan2(a.vy, a.vx) * 180) / Math.PI), pred = gm.s.model === "nuc" && !gm.atomic ? (thetaFromB(a.b, gm.s.Z, gm.s.E) * 180) / Math.PI : null;
    last = { b: a.b, theta: th, pred, rmin: a.rmin, rebound: th > 90 }; onShot({ model: gm.s.model, scale: gm.atomic ? "atomic" : "nuclear", Z: gm.s.Z, N: gm.s.N, E: gm.s.E, b: +a.b.toFixed(2), theta: +th.toFixed(2), rebound: th > 90 }); renderRead(true);
  }
  function tick(dt) {
    const gm = geom(), { s, Wfm, Hfm, nuclei } = gm;
    if (beamOn) { beamT += dt; if (beamT > 0.28) { beamT = 0; fire(rand()); } }
    const tscale = Wfm / (Math.sqrt(2 * s.E) * 2.4), Rm = s.model === "plum" ? R_ATOM : 0;
    for (const a of alphas) {
      if (a.done) continue; let rem = dt * tscale, guard = 0;
      while (rem > 1e-12 && guard++ < 4000) {
        const o = stepAlpha(a, s.model, s.Z, nuclei, Rm, rem); rem -= o.dt; a.rmin = Math.min(a.rmin, o.rmin); a.F = o.F;
        const lp = a.trail[a.trail.length - 1]; if (Math.hypot(a.x - lp[0], a.y - lp[1]) * gm.k > 0.8) a.trail.push([a.x, a.y]);
        if (a.x > Wfm * 1.02 || a.x < -Wfm * 0.02 - 0 && a.vx < 0 || a.y < -Wfm * 0.2 || a.y > Hfm + Wfm * 0.2) { finish(a, gm); break; }
      }
      if (a.x > Wfm * 1.02 && !a.done) finish(a, gm);
    }
    alphas = alphas.filter((a) => !a.done || s.traces);
  }
  function draw() {
    if (!canvas.isConnected || !canvas.closest("dialog") || !canvas.closest("dialog").open) return;
    const gm = geom(), { s, k, Wfm, Hfm, R, atomic, nuclei } = gm, X = (x) => x * k, Y = (y) => y * k;
    g.fillStyle = "#000"; g.fillRect(0, 0, W, H);
    // atoms
    for (const n of nuclei) {
      if (atomic) {
        if (s.model === "plum") { g.fillStyle = "rgba(217,106,120,.28)"; g.beginPath(); g.arc(X(n.x), Y(n.y), R_ATOM * k, 0, 7); g.fill(); g.strokeStyle = "#a9858b"; g.stroke(); for (let i = 0; i < Math.min(s.Z, 12); i++) { const an = i * 2.4, rr = R_ATOM * k * (0.2 + 0.7 * ((i * 0.37) % 1)); g.fillStyle = "#4a7bd0"; g.beginPath(); g.arc(X(n.x) + rr * Math.cos(an), Y(n.y) + rr * Math.sin(an), 2.5, 0, 7); g.fill(); } }
        else { g.setLineDash([4, 3]); g.strokeStyle = "#888"; for (const f of [0.2, 0.45, 0.62, 0.78, 0.9, 1]) { g.beginPath(); g.arc(X(n.x), Y(n.y), R_ATOM * k * f, 0, 7); g.stroke(); } g.setLineDash([]); g.fillStyle = "#dfe86a"; g.beginPath(); g.arc(X(n.x), Y(n.y), 2, 0, 7); g.fill(); }
      } else {
        const rp = Math.max(R * k, 6), A = s.Z + s.N; g.setLineDash([3, 4]); g.strokeStyle = "#555"; g.beginPath(); g.arc(X(n.x), Y(n.y), rp + 26, 0, 7); g.stroke(); g.setLineDash([]);
        const dots = Math.min(A, 90); for (let i = 0; i < dots; i++) { const rr = rp * 0.9 * Math.sqrt((i + 0.5) / dots), an = i * 2.39996, pr = i % Math.round(A / Math.max(1, s.Z)) === 0; g.fillStyle = pr ? "#f0603c" : "#b8b8b8"; g.beginPath(); g.arc(X(n.x) + rr * Math.cos(an), Y(n.y) + rr * Math.sin(an), Math.max(1.6, rp * 0.14), 0, 7); g.fill(); }
        g.strokeStyle = "rgba(240,96,60,.5)"; g.beginPath(); g.arc(X(n.x), Y(n.y), rp, 0, 7); g.stroke();
      }
    }
    // traces and alphas
    for (const a of alphas) {
      if (s.traces || !a.done) { g.strokeStyle = a.done ? "rgba(214,58,214,.55)" : "#d63ad6"; g.lineWidth = 1.5; g.beginPath(); const tr = s.traces ? a.trail : a.trail.slice(-8); tr.forEach(([x, y], i) => (i ? g.lineTo(X(x), Y(y)) : g.moveTo(X(x), Y(y)))); g.stroke(); }
      if (!a.done) {
        g.fillStyle = "#7fd6ff"; g.beginPath(); g.arc(X(a.x), Y(a.y), 5, 0, 7); g.fill(); g.fillStyle = "#001"; g.font = "bold 8px sans-serif"; g.textAlign = "center"; g.fillText("α", X(a.x), Y(a.y) + 3);
        if (s.forces && a.F) { const nn = nuclei.reduce((m, n) => (Math.hypot(a.x - n.x, a.y - n.y) < Math.hypot(a.x - m.x, a.y - m.y) ? n : m), nuclei[0]), dx = a.x - nn.x, dy = a.y - nn.y, r = Math.hypot(dx, dy) || 1, F = s.model === "plum" ? a.F : forceMeVFm(s.Z, r), L = Math.min(80, 16 * Math.log10(1 + F / forceMeVFm(s.Z, Wfm)));
          if (L > 2) { arrow(X(a.x), Y(a.y), X(a.x) + (dx / r) * L, Y(a.y) + (dy / r) * L, "#ff5a5a"); if (!atomic) arrow(X(nn.x), Y(nn.y), X(nn.x) - (dx / r) * L * 0.8, Y(nn.y) - (dy / r) * L * 0.8, "#6aa8ff"); } }
      }
    }
    // scale bar
    g.strokeStyle = "#ddd"; g.fillStyle = "#ddd"; g.font = "12px sans-serif"; g.textAlign = "center";
    const bar = atomic ? [2e5, "0.2 nm (200,000 fm)"] : [Math.pow(10, Math.floor(Math.log10(Wfm / 3))), ""]; if (!atomic) bar[1] = `${bar[0]} fm`;
    g.beginPath(); g.moveTo(12, H - 18); g.lineTo(12 + bar[0] * k, H - 18); g.moveTo(12, H - 22); g.lineTo(12, H - 14); g.moveTo(12 + bar[0] * k, H - 22); g.lineTo(12 + bar[0] * k, H - 14); g.stroke(); g.fillText(bar[1], 12 + (bar[0] * k) / 2, H - 26);
    g.textAlign = "right"; g.fillStyle = "#9aa"; g.fillText(atomic ? `view: ${sci(Wfm)} fm across (the nucleus is a dot)` : `view: ${sci(Wfm)} fm across`, W - 10, H - 10);
    readT += 1; if (readT % 6 === 0) renderRead(false);
  }
  function arrow(x0, y0, x1, y1, c) { g.strokeStyle = c; g.fillStyle = c; g.lineWidth = 2; g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke(); const an = Math.atan2(y1 - y0, x1 - x0); g.beginPath(); g.moveTo(x1, y1); g.lineTo(x1 - 7 * Math.cos(an - 0.45), y1 - 7 * Math.sin(an - 0.45)); g.lineTo(x1 - 7 * Math.cos(an + 0.45), y1 - 7 * Math.sin(an + 0.45)); g.closePath(); g.fill(); g.lineWidth = 1; }

  canvas.addEventListener("click", (ev) => { const r = canvas.getBoundingClientRect(), gm = geom(), py = ((ev.clientY - r.top) * H) / r.height; fire(py / gm.k); });

  // ---- controls ----
  const read = h("div", { class: "hint", style: "line-height:1.5" }), lastBox = h("div", { style: "margin-top:6px;line-height:1.5" });
  function renderRead(force) {
    const s = st(), d0 = closestApproach(s.Z, s.E), v = speed(s.E), el = ELEMENTS.find((e) => e.Z === s.Z);
    read.innerHTML = `<b>Alpha:</b> ${s.E.toFixed(1)} MeV, ${(v / 1000).toLocaleString("en-US", { maximumFractionDigits: 0 })} km/s (${(v / 2.998e8 * 100).toFixed(1)}% of light speed), wavelength ${wavelengthFm(s.E).toFixed(2)} fm<br><b>Atom:</b> Z = ${s.Z}${el ? " (" + el.name + ")" : ""}, nucleus radius ${nuclearRadius(s.Z + s.N).toFixed(1)} fm<br><b>Closest approach, head-on:</b> ${d0.toFixed(1)} fm (${(d0 / nuclearRadius(s.Z + s.N)).toFixed(1)} nucleus radii)`;
    if (last) lastBox.innerHTML = `<b>Last alpha:</b> aimed ${sci(last.b)} fm from the nucleus's line, bent ${last.theta < 0.1 ? last.theta.toExponential(1) : last.theta.toFixed(1)}°${last.pred != null ? ` (Rutherford's formula: ${last.pred.toFixed(1)}°)` : ""}${last.rebound ? " <b>bounced back</b>" : ""}.`;
    else lastBox.textContent = "Click the field to fire an alpha at that height, or use the buttons.";
  }
  const ctl = (label, ...kids) => h("div", { style: "margin:6px 0" }, h("div", { style: "font-weight:700;color:#e8d98a" }, label), ...kids);
  const num = (key, lo, hi, dflt) => { const inp = h("input", { type: "range", min: lo, max: hi, step: 1, value: st()[key], "aria-label": key, style: "width:100%", oninput: () => { st()[key] = +inp.value; out.textContent = inp.value; changed(); } }), out = h("b", {}, String(st()[key])); return { inp, out, row: h("div", {}, h("div", { style: "display:flex;gap:6px;align-items:center" }, h("button", { onclick: () => { inp.value = Math.max(lo, +inp.value - 1); inp.dispatchEvent(new Event("input")); } }, "◀"), out, h("button", { onclick: () => { inp.value = Math.min(hi, +inp.value + 1); inp.dispatchEvent(new Event("input")); } }, "▶")), inp) }; };
  const pZ = num("Z", 13, 92), pN = num("N", 14, 150);
  const eIn = h("input", { type: "range", min: 3, max: 10, step: 0.5, value: st().E, "aria-label": "Alpha energy", style: "width:100%", oninput: () => { st().E = +eIn.value; eOut.textContent = (+eIn.value).toFixed(1) + " MeV"; changed(); } }), eOut = h("b", {}, st().E.toFixed(1) + " MeV");
  const mNuc = h("input", { type: "radio", name: "scm", checked: "", onchange: () => { st().model = "nuc"; changed(); } }), mPlum = h("input", { type: "radio", name: "scm", onchange: () => { st().model = "plum"; changed(); } });
  const sNuc = h("input", { type: "radio", name: "scs", checked: "", onchange: () => { st().scale = "nuclear"; changed(); } }), sAt = h("input", { type: "radio", name: "scs", onchange: () => { st().scale = "atomic"; changed(); } });
  const cTr = h("input", { type: "checkbox", checked: "", onchange: () => { st().traces = cTr.checked; } }), cFo = h("input", { type: "checkbox", checked: "", onchange: () => { st().forces = cFo.checked; } });
  const beamBtn = h("button", { onclick: () => { beamOn = !beamOn; beamBtn.textContent = beamOn ? "Stop beam" : "Fire a beam"; } }, "Fire a beam");
  function changed() { alphas = []; last = null; if (st().model === "plum") { sAt.checked = true; } sNuc.disabled = st().model === "plum"; renderRead(true); }
  const panel = h("div", { style: "min-width:250px;max-width:270px;background:#10161e;color:#e6edf3;border-radius:8px;padding:8px 12px;font-size:13px" },
    ctl("Model", h("label", { class: "ck" }, mNuc, "Nuclear atom (positive charge in a nucleus)"), h("label", { class: "ck" }, mPlum, "Plum pudding (charge spread through the atom)")),
    ctl("Scale", h("label", { class: "ck" }, sNuc, "Nuclear (about 600 fm across)"), h("label", { class: "ck" }, sAt, "Atomic (0.6 nm across)")),
    ctl("Alpha energy ", eOut, eIn), ctl("Protons (Z)", pZ.row), ctl("Neutrons", pN.row),
    h("label", { class: "ck" }, cTr, "Traces"), h("label", { class: "ck" }, cFo, "Forces: red on the alpha, blue on the nucleus"),
    h("div", { class: "controls", style: "margin-top:6px" }, h("button", { class: "primary", onclick: () => fire(rand()) }, "Fire one"), beamBtn, h("button", { onclick: () => { alphas = []; } }, "Clear")));
  function sync(cfg) { const s = st(); Object.assign(s, cfg); pZ.inp.value = s.Z; pZ.out.textContent = s.Z; pN.inp.value = s.N; pN.out.textContent = s.N; eIn.value = s.E; eOut.textContent = s.E.toFixed(1) + " MeV"; (s.model === "plum" ? mPlum : mNuc).checked = true; (s.scale === "atomic" ? sAt : sNuc).checked = true; cTr.checked = s.traces; cFo.checked = s.forces; changed(); }
  const el = h("div", { style: "display:flex;gap:12px;flex-wrap:wrap;align-items:flex-start" }, h("div", {}, canvas, read, lastBox), panel);
  renderRead(true);
  return { el, tick, draw, sync, stop() { beamOn = false; beamBtn.textContent = "Fire a beam"; }, fire, setScale(sc) { st().scale = sc; sync(st()); } };
}
