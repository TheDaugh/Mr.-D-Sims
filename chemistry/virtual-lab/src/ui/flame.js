// Lab 4 UI: the flame bench, the notebook (results table, spectroscope, practice), the two tutorials, the pre-lab and the huddle gates.
// All student-facing wording is in content/labs/04-flame-tests.json (lab.ui) or the sheet's own content files. No chemistry facts here.
import { h, mulberry32 } from "../../../../shared/virtual-lab/dom.js";
import * as F from "../engine/flame.js";

export const newFlame = () => ({ rows: {}, unk: {}, splint: null, splintN: 0, last: null, tut2: false, items: { band: 1, done: [], res: {}, text: {} }, huddle1: false, huddle2: false, cerDone: false, salt: null, specSeen: false });
export function fixFlame(f) { const d = newFlame(); for (const k in d) if (f[k] === undefined) f[k] = d[k]; f.hold = null; return f; }

const SW = "#e8e4d6";   // jar color for unknown bottles
const svg = (inner, w = 320, hgt = 170) => { const d = h("div", { class: "pic" }); d.innerHTML = `<svg viewBox="0 0 ${w} ${hgt}" width="${w}" role="img" style="max-width:100%;height:auto">${inner}</svg>`; return d; };

export function createFlame(ctx) {
  const { lab, data, items, content, S, log, say, canvas, onChange } = ctx, U = lab.ui, ord = lab.brightnessOrder, G = () => S.flame;
  const cx = canvas.getContext("2d"), W = 924, HT = 520;
  canvas.width = W; canvas.height = HT;
  const named = (id) => F.byId(data)[id];
  const colorOpts = content.tests.find((t) => t.key === "flame").options, brightOpts = F.brightnessWords(data).sort((a, b) => ord.indexOf(a) - ord.indexOf(b));
  const swatchFor = (colorGroup) => F.swatchOf(data, colorGroup);
  let hits = [], t0 = 0, timeS = 0;

  // ---------- unknown bottles ----------
  const keyOf = () => ctx.studentKey();
  function labelsOpen() { const out = []; for (let n = 0; ; n++) { const l = F.unknownLabel(n); if (n >= 2 && !F.unknownAnswered(G().unk[F.unknownLabel(n - 1)])) break; out.push(l); if (n > 40) break; } return out; }
  function ensureUnknowns() {
    const f = G(), a = F.assignUnknowns(data, keyOf());
    labelsOpen().forEach((l, n) => { if (!f.unk[l]) f.unk[l] = { sample: n === 0 ? a.A : n === 1 ? a.B : F.extraSample(data, keyOf(), n - 2), color: "", brightness: "", tested: 0, flagged: false, lines: "", identity: "" }; });
  }
  const unlocked = () => (ctx.isKey && ctx.isKey()) || F.unknownsOpen(data, G().rows);
  const bottles = () => (unlocked() ? (ensureUnknowns(), labelsOpen()) : []).map((l, i) => ({ key: "u" + l, id: l, label: U.unknownWord + " " + l, short: l, group: "Unknown samples", phase: "s", shelf: 0, idx: i, color: SW }));
  function syncSources(sources) { sources.length = 0; sources.push(...bottles()); }

  // ---------- the splint, the burn ----------
  const saltList = () => [...F.benchIds(data).map((id) => ({ id, label: named(id).formula, kind: "salt" })), ...ctx.carried().filter((k) => /^u[A-Z]$/.test(k)).map((k) => ({ id: k, label: U.unknownWord + " " + k.slice(1), kind: "unknown" }))];
  function fresh() {
    const f = G(); if (!ctx.canAct()) return; if (f.hold) return say(U.holdingNow, "warn");
    f.splint = F.newSplint(++f.splintN); log.add("splint", { id: f.splint.id }); say(U.freshSay); refresh();
  }
  function dipIn(id) {
    const f = G(); if (!ctx.canAct()) return;
    if (f.hold) return say(U.holdingNow, "warn");
    if (!f.splint) return say(U.noSplint, "warn");
    const l = saltList().find((s) => s.id === id); if (!l) return say(U.notCarrying, "warn");
    if (l.kind === "unknown" && !unlocked()) return say(U.locked, "warn");
    const reused = F.dip(f.splint, id); f.salt = id;
    log.add("dip", { splint: f.splint.id, bottle: id, reused }); say(U.dipSay.replace("{salt}", l.label)); refresh();
  }
  function holdStart() {
    const f = G(); if (!ctx.canAct()) return;
    if (f.hold) return;
    if (!f.splint || !f.splint.dipped) return say(f.splint ? U.notDipped : U.noSplint, "warn");
    const id = f.splint.dipped, isU = /^u[A-Z]$/.test(id), sample = isU ? f.unk[id.slice(1)].sample : id;
    f.hold = { t: 0, id, sample, reused: F.isReused(f.splint), burn: F.burn(data, sample, F.isReused(f.splint)) };
    log.add("hold_start", { splint: f.splint.id, bottle: id }); say(U.holdSay); refresh();
  }
  function pullAway() {
    const f = G(); if (!f.hold) return;
    f.splint.used = true; f.hold = null; log.add("hold_cancel", {}); say(U.pullSay, "warn"); refresh();
  }
  function finishHold() {
    const f = G(), hd = f.hold, isU = /^u[A-Z]$/.test(hd.id), label = isU ? hd.id.slice(1) : null;
    f.splint.used = true; f.hold = null;
    const target = isU ? f.unk[label] : (f.rows[hd.id] ||= { color: "", brightness: "", tested: 0, flagged: false });
    target.tested = (target.tested || 0) + 1; target.flagged = !!hd.reused;
    f.last = { id: hd.id, sample: hd.sample, label, burn: hd.burn, reused: hd.reused, at: Math.round(timeS) };
    log.add("flame_test", isU ? { sample: label, kind: "unknown", reused: hd.reused, seconds: F.HOLD_S } : { sample: hd.id, kind: named(hd.id).role, reused: hd.reused, seconds: F.HOLD_S });
    say(hd.reused ? U.reusedSay : U.doneSay, hd.reused ? "warn" : "obs"); refresh(); onChange();
  }
  const holding = () => !!G().hold;

  // ---------- the bench picture ----------
  const phaseNow = () => { const f = G(); return f.hold ? F.phaseAt(f.hold.burn, f.hold.t) : null; };
  function drawFlame(x, base, t) {
    const ph = phaseNow(), f = G(), idle = !ph, lvl = ph ? Math.max(0, ord.indexOf(ph.brightness)) : 0, sc = idle ? 0.55 : 0.75 + 0.12 * lvl, col = idle ? "#4d8fe8" : ph.swatch;
    const flick = Math.sin(t * 17) * 3 + Math.sin(t * 9.3) * 2, hgt = 120 * sc + flick, wid = 34 * sc + 4;
    if (!idle) { const g = cx.createRadialGradient(x, base - hgt / 2, 6, x, base - hgt / 2, 60 + 24 * lvl); g.addColorStop(0, col + "99"); g.addColorStop(1, col + "00"); cx.fillStyle = g; cx.fillRect(x - 130, base - hgt - 90, 260, hgt + 140); }
    cx.fillStyle = col; cx.beginPath(); cx.moveTo(x, base - hgt); cx.bezierCurveTo(x + wid * 1.2, base - hgt * 0.45, x + wid, base, x, base); cx.bezierCurveTo(x - wid, base, x - wid * 1.2, base - hgt * 0.45, x, base - hgt); cx.fill();
    cx.fillStyle = idle ? "#cfe3ff" : "rgba(255,255,255,.55)"; cx.beginPath(); cx.ellipse(x, base - hgt * 0.22, wid * 0.38, hgt * 0.24, 0, 0, 7); cx.fill();
  }
  const jar = (x, y, w, hh, color, label, sel) => { cx.fillStyle = "rgba(0,0,0,.18)"; cx.fillRect(x + 4, y + hh - 2, w, 6); cx.fillStyle = color; cx.fillRect(x, y + 12, w, hh - 12); cx.fillStyle = "#c9ced6"; cx.fillRect(x + 6, y, w - 12, 14); cx.strokeStyle = sel ? "#ffd23f" : "#4a4f58"; cx.lineWidth = sel ? 4 : 2; cx.strokeRect(x, y + 12, w, hh - 12); cx.fillStyle = "#fff"; cx.fillRect(x + 4, y + hh * 0.42, w - 8, 24); cx.fillStyle = "#1e2630"; cx.font = "bold 14px system-ui,sans-serif"; cx.textAlign = "center"; cx.fillText(label, x + w / 2, y + hh * 0.42 + 17); };
  function draw(now) {
    timeS = now; const f = G();
    cx.fillStyle = "#3a4049"; cx.fillRect(0, 0, W, HT); cx.fillStyle = "#2b3037"; cx.fillRect(0, 330, W, 6); cx.fillStyle = "#b98b5e"; cx.fillRect(0, 336, W, HT - 336);
    hits = [];
    const bx = 457, baseY = 410;
    cx.fillStyle = "#6b7078"; cx.fillRect(bx - 34, baseY, 68, 22); cx.fillRect(bx - 9, baseY - 46, 18, 48); cx.fillStyle = "#8a909a"; cx.fillRect(bx - 12, baseY - 50, 24, 8);
    hits.push({ r: [bx - 60, 250, 120, 190], k: "burner" });
    drawFlame(bx, baseY - 50, now);
    if (f.hold) {
      const p = Math.min(1, f.hold.t / F.HOLD_S); cx.lineWidth = 9; cx.strokeStyle = "rgba(255,255,255,.18)"; cx.beginPath(); cx.arc(bx, 215, 40, 0, 7); cx.stroke();
      cx.strokeStyle = "#ffd23f"; cx.beginPath(); cx.arc(bx, 215, 40, -Math.PI / 2, -Math.PI / 2 + p * 2 * Math.PI); cx.stroke();
      cx.fillStyle = "#fff"; cx.font = "bold 24px system-ui,sans-serif"; cx.textAlign = "center"; cx.fillText(String(Math.max(0, Math.ceil(F.HOLD_S - f.hold.t))), bx, 224);
      cx.strokeStyle = "#e8c98a"; cx.lineWidth = 6; cx.beginPath(); cx.moveTo(bx + 14, 330); cx.lineTo(bx + 96, 392); cx.stroke(); cx.fillStyle = "#7a5a2b"; cx.fillRect(bx + 6, 322, 14, 14);
    }
    // splint box, spectroscope
    cx.fillStyle = "#8a6a47"; cx.fillRect(110, 372, 120, 48); cx.fillStyle = "#e8c98a"; for (let i = 0; i < 9; i++) cx.fillRect(118 + i * 12, 360 - (i % 3) * 3, 5, 26);
    cx.fillStyle = "#fff"; cx.font = "bold 13px system-ui,sans-serif"; cx.textAlign = "center"; cx.fillText(U.splintBox, 170, 412); hits.push({ r: [100, 350, 140, 76], k: "box" });
    cx.fillStyle = "#2b3a4f"; cx.fillRect(700, 376, 130, 36); cx.fillStyle = "#6f87a8"; cx.fillRect(826, 384, 28, 20); cx.fillStyle = "#fff"; cx.fillText(U.spectroscopeTitle, 765, 400); hits.push({ r: [700, 370, 160, 50], k: "spec" });
    // splint in hand
    if (f.splint && !f.hold) { const tip = f.splint.dipped ? (f.splint.used || f.splint.dips > 1 ? "#d8d2c0" : "#f4f4f0") : "#e8c98a"; cx.strokeStyle = "#e8c98a"; cx.lineWidth = 6; cx.beginPath(); cx.moveTo(250, 330); cx.lineTo(330, 392); cx.stroke(); cx.fillStyle = tip; cx.fillRect(322, 384, 14, 14); cx.fillStyle = "#fff"; cx.font = "12px system-ui,sans-serif"; cx.textAlign = "left"; cx.fillText(f.splint.used ? U.splintUsed : f.splint.dipped ? U.splintDipped : U.splintFresh, 252, 322); }
    // bottles
    F.benchIds(data).forEach((id, i) => { const x = 28 + i * 78, s = named(id); jar(x, 438, 58, 70, s.role === "control" ? "#d9dde3" : "#f4f4f0", s.formula, f.salt === id); hits.push({ r: [x, 438, 58, 70], k: "salt", id }); });
    ctx.carried().filter((k) => /^u[A-Z]$/.test(k)).forEach((k, i) => { const x = 596 + i * 52; jar(x, 452, 44, 56, SW, k.slice(1), f.salt === k); hits.push({ r: [x, 452, 44, 56], k: "salt", id: k }); });
    cx.fillStyle = "rgba(255,255,255,.8)"; cx.font = "12px system-ui,sans-serif"; cx.textAlign = "left"; cx.fillText(U.benchSalts, 28, 432);
  }
  function step(dt) {
    const f = G(); if (!f.hold || !ctx.running()) return;
    f.hold.t += dt;
    if (f.hold.t >= F.HOLD_S) finishHold();
  }
  canvas.addEventListener("click", (ev) => {
    const r = canvas.getBoundingClientRect(), x = (ev.clientX - r.left) * (W / r.width), y = (ev.clientY - r.top) * (HT / r.height);
    const hit = hits.find((q) => x >= q.r[0] && x <= q.r[0] + q.r[2] && y >= q.r[1] && y <= q.r[1] + q.r[3]); if (!hit) return;
    if (hit.k === "box") fresh(); else if (hit.k === "salt") { G().salt = hit.id; if (G().splint && !G().hold) dipIn(hit.id); else if (!G().splint) say(U.noSplint, "warn"); refresh(); }
    else if (hit.k === "burner") holdStart(); else if (hit.k === "spec") ctx.openSpectroscope();
  });
  canvas.addEventListener("mousemove", (ev) => {
    const r = canvas.getBoundingClientRect(), x = (ev.clientX - r.left) * (W / r.width), y = (ev.clientY - r.top) * (HT / r.height), hit = hits.find((q) => x >= q.r[0] && x <= q.r[0] + q.r[2] && y >= q.r[1] && y <= q.r[1] + q.r[3]);
    const info = !hit ? null : hit.k === "box" ? { name: U.splintBox, blurb: U.tipBox, icon: "jar", color: "#e8c98a" } : hit.k === "burner" ? { name: U.burnerName, blurb: U.tipBurner, icon: "hotplate" } : hit.k === "spec" ? { name: U.spectroscopeTitle, blurb: U.tipSpec, icon: "tester" } : { name: (saltList().find((s) => s.id === hit.id) || {}).label, blurb: U.tipBottle, icon: "jar", color: hit.id[0] === "u" && hit.id.length === 2 ? SW : "#f4f4f0" };
    ctx.tip(ev, info);
  });
  canvas.addEventListener("mouseleave", () => ctx.tip(null, null));

  // ---------- side controls ----------
  const saltSel = h("select", { id: "flSalt", "aria-label": U.saltLabel, onchange: (e) => { G().salt = e.target.value; refresh(); } });
  const status = h("p", { id: "flStatus", class: "note", role: "status" });
  const lastBox = h("div", { id: "flLast", class: "flast" });
  const controls = h("div", { id: "flControls" },
    status,
    h("div", { class: "controls" }, h("button", { id: "flFresh", class: "primary", onclick: fresh }, U.btnFresh)),
    h("div", { class: "controls" }, h("label", {}, saltSel), h("button", { id: "flDip", onclick: () => dipIn(saltSel.value) }, U.btnDip)),
    h("div", { class: "controls" }, h("button", { id: "flHold", class: "primary", onclick: holdStart }, U.btnHold), h("button", { id: "flAway", onclick: pullAway, hidden: true }, U.btnAway)),
    lastBox,
    h("div", { class: "controls" }, h("button", { id: "flNb", onclick: () => ctx.openNotebook("table") }, U.btnNotebook), h("button", { id: "flSpec", onclick: () => ctx.openSpectroscope() }, U.btnSpectroscope)));
  let sig1 = "", sig2 = "";
  function refresh() {
    const f = G(), opts = saltList(), osig = opts.map((o) => o.id).join();
    if (osig !== sig1) { sig1 = osig; saltSel.replaceChildren(...opts.map((o) => h("option", { value: o.id }, o.label))); }
    if (!(f.salt && opts.some((o) => o.id === f.salt))) f.salt = (opts.find((o) => o.id === lab.firstSample) || opts[0] || {}).id || null;
    if (f.salt) saltSel.value = f.salt;
    const sp = f.splint, name = sp && sp.dipped ? (opts.find((o) => o.id === sp.dipped) || {}).label : "";
    status.textContent = f.hold ? U.holdingStatus.replace("{n}", Math.max(0, Math.ceil(F.HOLD_S - f.hold.t))) : !sp ? U.statusNone : sp.used ? U.statusUsed : sp.dipped ? U.statusDipped.replace("{salt}", name) : U.statusFresh;
    $id("flAway").hidden = !f.hold; $id("flHold").disabled = !!f.hold; $id("flFresh").disabled = !!f.hold; $id("flDip").disabled = !!f.hold;
    const l = f.last, lsig = l ? l.id + l.at + l.reused : "";
    if (lsig !== sig2) { sig2 = lsig; lastBox.replaceChildren(...(l ? [h("span", { class: "sw", style: `background:${F.phaseAt(l.burn, F.HOLD_S).swatch}` }), h("span", {}, U.lastFlame.replace("{what}", l.label ? U.unknownWord + " " + l.label : named(l.sample).formula) + (l.reused ? " · " + U.flagWord : ""))] : [])); }
  }
  const $id = (i) => controls.querySelector("#" + i);

  // ---------- the notebook ----------
  const sheet = h("div", { id: "flSheet" });
  let tab = "table";
  const tabBtn = (k, label) => h("button", { class: tab === k ? "on" : "", "data-tab": k, onclick: () => (k === "spec" ? ctx.openSpectroscope() : ctx.openNotebook(k)) }, label);
  const colorSel = (cur, on, dis) => { const sw = h("span", { class: "sw", style: `background:${cur ? swatchFor(cur) : "transparent"}` }), s = h("select", { disabled: dis, "aria-label": U.colorHead, onchange: (e) => { on(e.target.value); } }, h("option", { value: "" }, "—"), colorOpts.map(([v, l]) => h("option", { value: v }, l))); s.value = cur || ""; return h("span", { class: "cs" }, sw, s); };
  const brightSel = (cur, on, dis) => { const s = h("select", { disabled: dis, "aria-label": U.brightHead, onchange: (e) => on(e.target.value) }, h("option", { value: "" }, "—"), brightOpts.map((v) => h("option", { value: v }, v))); s.value = cur || ""; return s; };
  function tableView() {
    const f = G(), rowFor = (id) => { const r = (f.rows[id] ||= { color: "", brightness: "", tested: 0, flagged: false }), dis = !r.tested; const save = () => { log.add("flame_record", { sample: id, color: r.color, brightness: r.brightness }); onChange(); view(); };
      return h("tr", { "data-sample": id }, h("th", { scope: "row" }, named(id).formula, named(id).role === "control" ? h("small", {}, " " + U.controlWord) : null), h("td", {}, colorSel(r.color, (v) => { r.color = v; save(); }, dis)), h("td", {}, brightSel(r.brightness, (v) => { r.brightness = v; save(); }, dis)), h("td", {}, r.flagged ? h("span", { class: "flag" }, "⚑ " + U.flagWord) : dis ? h("span", { class: "hint" }, U.testFirst) : null)); };
    const known = h("table", { class: "ftab" }, h("thead", {}, h("tr", {}, [U.saltHead, U.colorHead, U.brightHead, ""].map((x) => h("th", {}, x)))), h("tbody", {}, F.benchIds(data).map(rowFor)));
    const labels = unlocked() ? (ensureUnknowns(), labelsOpen()) : [];
    const rowU = (l) => { const u = f.unk[l], dis = !u.tested, save = () => { log.add("flame_record", { sample: l, color: u.color, brightness: u.brightness }); onChange(); view(); };
      return h("tr", { "data-unknown": l }, h("th", { scope: "row" }, U.unknownWord + " " + l), h("td", {}, colorSel(u.color, (v) => { u.color = v; save(); }, dis)), h("td", {}, brightSel(u.brightness, (v) => { u.brightness = v; save(); }, dis)),
        h("td", {}, h("input", { type: "text", "aria-label": U.linesHead, placeholder: U.linesHint, value: u.lines, disabled: !(u.color), style: "width:9em", onchange: (e) => { u.lines = e.target.value.trim(); log.add("spec_note", { sample: l, lines: u.lines }); onChange(); } })),
        h("td", {}, (() => { const s = h("select", { "aria-label": U.identHead + " " + l, disabled: !u.color, onchange: (e) => { u.identity = e.target.value; log.add("identify", { sample: l, identity: u.identity }); onChange(); view(); } }, h("option", { value: "" }, "—"), F.metals(data).map((m) => h("option", { value: m }, m)), h("option", { value: "cannot" }, U.cannotTell)); s.value = u.identity || ""; return s; })()), h("td", {}, u.flagged ? h("span", { class: "flag" }, "⚑ " + U.flagWord) : null)); };
    const unk = labels.length ? h("table", { class: "ftab" }, h("thead", {}, h("tr", {}, [U.unknownWord, U.colorHead, U.brightHead, U.linesHead, U.identHead, ""].map((x) => h("th", {}, x)))), h("tbody", {}, labels.map(rowU))) : h("p", { class: "hint" }, U.unknownsLocked);
    return [h("h3", {}, U.knownsHead), h("p", { class: "hint" }, U.tableHint), h("div", { class: "scrollx" }, known), h("h3", {}, U.unknownsHead), h("div", { class: "scrollx" }, unk)];
  }
  function specView() {
    const l = G().last; if (!l) return [h("p", {}, U.specNeedTest)];
    const rows = [{ label: l.label ? "?" : named(l.sample).formula, metal: named(l.sample).metal }, ...F.metals(data).map((m) => ({ label: m, metal: m }))];
    const d = h("div", { class: "pic" }); d.innerHTML = F.spectrumSvg(data, rows, { id: "nbsp", label: U.specLabel });
    return [h("p", {}, U.specLooking.replace("{what}", l.label ? U.unknownWord + " " + l.label : named(l.sample).formula)), d, h("details", {}, h("summary", {}, h("b", {}, U.specGuideTitle)), h("p", {}, lab.specGuide)), h("div", { class: "controls" }, h("button", { onclick: () => tutorial2() }, U.specAgain))];
  }
  // practice items: hints cost a fresh attempt, the band stays hidden
  function practiceView() {
    const st = G().items, it = F.nextItem(items, st);
    if (!F.knownsRecorded(data, G().rows)) return [h("p", {}, U.practiceLocked)];
    if (!it) return [h("p", {}, U.practiceDone)];
    const res = st.res[it.id] || { tries: 0, hints: 0 }, fb = h("div", { class: "fb", role: "status" }), box = h("div", { class: "pq" }), shown = [];
    for (let k = 0; k < res.hints; k++) shown.push(h("p", { class: "hintline" }, h("b", {}, U.hintWord + " " + (k + 1) + ". "), it.hints[k]));
    const pic = it.type === "pick-swatch" ? h("div", { class: "swrow" }, h("span", { class: "sw big", style: `background:${swatchFor(it.swatchGroup)}` }), h("span", {}, it.swatchGroup)) : it.type === "spectrum-read" ? (() => { const d = h("div", { class: "pic" }); d.innerHTML = F.spectrumSvg(data, [{ label: "?", lines: it.lines }, ...F.metals(data).map((m) => ({ label: m, metal: m }))], { id: "pr" + it.id, label: U.specLabel }); return d; })() : null;
    const submit = (choice) => {
      const r = F.answerItem(items, st, it, choice); log.add("item", { id: it.id, tries: r.tries, hints: r.hints, state: r.state });
      if (r.state === "right") { fb.className = "fb show ok"; fb.textContent = U.itemRight; } else if (r.state === "closed") { fb.className = "fb show no"; fb.textContent = U.itemClosed; } onChange(); setTimeout(() => ctx.openNotebook("practice"), r.state === "hint" ? 0 : 900);
    };
    if (it.type === "explain") {
      const ta = h("textarea", { rows: 2, style: "width:100%", "aria-label": it.prompt }); ta.value = st.text[it.id] || "";
      box.append(h("p", {}, it.prompt), ta, h("div", { class: "controls" }, h("button", { class: "primary", onclick: () => { st.text[it.id] = ta.value.trim(); F.answerItem(items, st, { ...it, answer: undefined }, ""); log.add("item", { id: it.id, text: st.text[it.id], state: "saved" }); onChange(); ctx.openNotebook("practice"); } }, U.saveWord)), ...shown);
    } else box.append(h("p", {}, it.prompt), pic, h("div", { class: "opts" }, it.options.map((o) => h("button", { class: "opt", onclick: () => submit(o) }, o))), fb, ...shown, res.hints ? h("p", { class: "hint" }, res.hints < F.HINTS_MAX ? U.hintNext : U.hintLast) : null);
    return [h("h3", {}, U.practiceHead), box];
  }
  function view() {
    sheet.replaceChildren(h("button", { class: "x", "data-close": "" , onclick: (e) => e.target.closest("dialog").close() }, U.closeWord), h("h2", {}, U.notebookTitle),
      h("div", { class: "tabs" }, tabBtn("table", U.tabTable), tabBtn("spec", U.tabSpec), F.knownsRecorded(data, G().rows) ? tabBtn("practice", U.tabPractice) : null),
      ...(tab === "table" ? tableView() : tab === "spec" ? specView() : practiceView()));
  }
  function showTab(k) { tab = k; view(); }
  // ---------- tutorial 2: four frames, opens the first time the spectroscope is used ----------
  const frames = () => {
    const sl = `<rect x="150" y="30" width="6" height="40" fill="#222"/><rect x="150" y="90" width="6" height="40" fill="#222"/><ellipse cx="60" cy="80" rx="22" ry="40" fill="#ffb000"/><path d="M158 80 L250 40 M158 80 L250 80 M158 80 L250 120" stroke="#bbb" stroke-width="2" stroke-dasharray="4 3"/>`;
    const sp = (rows, o = {}) => { const d = h("div", { class: "pic" }); d.innerHTML = F.spectrumSvg(data, rows, { width: 560, id: "t2" + (o.id || 0), label: U.specLabel, ...o }); return d; };
    const bl = F.metals(data).find((m) => data.spectra[m].lines.some((l) => l.nm > 450 && l.nm < 470)), nl = F.metals(data).find((m) => !data.spectra[m].lines.some((l) => l.nm >= 400 && l.nm <= 500) && (data.spectra[m].lines.some((l) => l.nm > 600 && l.nm < 700))), blueLine = data.spectra[bl].lines.find((l) => l.nm > 450 && l.nm < 470).nm;
    const yel = F.metals(data).find((m) => data.spectra[m].lines.every((l) => l.nm > 580 && l.nm < 600)), cu = F.metals(data).find((m) => m !== bl && m !== nl && m !== yel && data.spectra[m].bands);
    return [svg(sl, 300, 160), sp([{ label: yel, metal: yel }], { id: 2 }), sp([{ label: nl, metal: nl }, { label: bl, metal: bl }], { id: 3, circle: [{ row: 1, nm: blueLine, r: 14 }] }), sp([{ label: "?", metal: cu }, ...F.metals(data).map((m) => ({ label: m, metal: m }))], { id: 4 })];
  };
  function tutorial2() { const fr = frames(); ctx.showTutorial2(lab.tutorial2.map((t, i) => ({ text: t, pic: fr[i] }))); }

  // ---------- hint pictures for the first five quests (Tutorial 1) ----------
  function hintPicture(id) {
    const P = {
      gear: svg(`<rect x="30" y="20" width="70" height="130" fill="#5f7f9f"/><rect x="40" y="30" width="50" height="8" fill="#3f5a75"/><circle cx="170" cy="60" r="22" fill="none" stroke="#5aa8e8" stroke-width="6"/><rect x="150" y="90" width="44" height="52" fill="#e8d9a0" stroke="#b9a45c"/>`),
      door: svg(`<rect x="90" y="14" width="120" height="140" fill="#a3804c"/><circle cx="198" cy="84" r="9" fill="#3ecf6a"/><rect x="100" y="24" width="100" height="120" fill="#8a6a3c"/>`),
      flamebench: svg(`<rect x="10" y="110" width="300" height="40" fill="#b98b5e"/><rect x="150" y="66" width="20" height="46" fill="#6b7078"/><ellipse cx="160" cy="50" rx="14" ry="26" fill="#4d8fe8"/><rect x="28" y="84" width="22" height="26" fill="#f4f4f0" stroke="#4a4f58"/><rect x="56" y="84" width="22" height="26" fill="#f4f4f0" stroke="#4a4f58"/><rect x="250" y="90" width="44" height="20" fill="#8a6a47"/><path d="M256 90 l4 -16 M264 90 l2 -18 M272 90 l-2 -16" stroke="#e8c98a" stroke-width="3"/>`),
      firsttest: svg(`<ellipse cx="140" cy="84" rx="16" ry="36" fill="#ffb000"/><line x1="156" y1="100" x2="230" y2="40" stroke="#e8c98a" stroke-width="5"/><circle cx="250" cy="70" r="30" fill="none" stroke="#ccc" stroke-width="7"/><path d="M250 40 A30 30 0 1 1 220 70" fill="none" stroke="#ffd23f" stroke-width="7"/><text x="250" y="78" text-anchor="middle" font-size="22" font-family="system-ui,sans-serif" fill="currentColor">10</text>`),
      record: svg(`<rect x="20" y="40" width="280" height="60" fill="none" stroke="currentColor"/><line x1="100" y1="40" x2="100" y2="100" stroke="currentColor"/><line x1="200" y1="40" x2="200" y2="100" stroke="currentColor"/><text x="60" y="76" text-anchor="middle" font-size="18" font-family="system-ui,sans-serif" fill="currentColor">${named(lab.firstSample).formula}</text><rect x="110" y="56" width="26" height="26" fill="${named(lab.firstSample).flame.swatch}"/><text x="170" y="75" text-anchor="middle" font-size="13" font-family="system-ui,sans-serif" fill="currentColor">${named(lab.firstSample).flame.colorGroup}</text><text x="250" y="76" text-anchor="middle" font-size="13" font-family="system-ui,sans-serif" fill="currentColor">${named(lab.firstSample).flame.brightness}</text>`)
    };
    return P[id] || null;
  }

  // ---------- pre-lab: three pictures and a one-try prediction ----------
  const preSvg = {
    w1: () => svg(`<circle cx="90" cy="80" r="26" fill="#d96a78"/><text x="90" y="92" text-anchor="middle" font-size="34" font-family="system-ui,sans-serif" fill="#fff">+</text><circle cx="230" cy="80" r="26" fill="#5a8fd8"/><text x="230" y="90" text-anchor="middle" font-size="34" font-family="system-ui,sans-serif" fill="#fff">−</text>`),
    w2: () => svg(`<circle cx="160" cy="80" r="10" fill="#d96a78"/><circle cx="160" cy="80" r="30" fill="none" stroke="#999" stroke-dasharray="3 3"/><circle cx="160" cy="80" r="62" fill="none" stroke="#999" stroke-dasharray="3 3"/><circle cx="130" cy="80" r="6" fill="#5a8fd8"/><circle cx="222" cy="80" r="6" fill="#5a8fd8"/><text x="130" y="60" text-anchor="middle" font-size="11" font-family="system-ui,sans-serif" fill="currentColor">1</text><text x="222" y="60" text-anchor="middle" font-size="11" font-family="system-ui,sans-serif" fill="currentColor">3</text>`),
    w3: () => svg(`<circle cx="50" cy="40" r="12" fill="#d96a78"/><circle cx="100" cy="40" r="12" fill="#5a8fd8"/><text x="75" y="64" text-anchor="middle" font-size="11" font-family="system-ui,sans-serif" fill="currentColor">1</text><circle cx="180" cy="120" r="12" fill="#d96a78"/><circle cx="280" cy="120" r="12" fill="#5a8fd8"/><text x="230" y="144" text-anchor="middle" font-size="11" font-family="system-ui,sans-serif" fill="currentColor">2</text>`)
  };
  function renderPrelab(box, c) {
    const pre = content.prelab, qs = pre.questions, P = S.prelab, btn = h("button", { class: "primary", disabled: true, onclick: () => c.onPrelabDone() }, U.enterLab), progress = h("p", { class: "hint", role: "status" });
    const upd = () => { const done = Object.keys(P.answers).length, pr = P.predicted !== undefined; progress.textContent = U.preProgress.replace("{n}", done).replace("{t}", qs.length).replace("{p}", pr ? U.preDone : U.preNot); btn.disabled = !(done === qs.length && pr); };
    const qEls = qs.map((q, qi) => {
      const rng = mulberry32(c.seed * 31 + qi + 1), order = q.options.map((_, i) => i).sort(() => rng() - 0.5), fb = h("div", { class: "fb", role: "status" }), opts = h("div", { class: "opts" });
      const lock = (picked) => { opts.querySelectorAll("button").forEach((b) => { b.disabled = true; if (+b.dataset.i === q.correct) b.classList.add("right"); else if (+b.dataset.i === picked) b.classList.add("wrong"); }); fb.className = "fb show " + (picked === q.correct ? "ok" : "no"); fb.textContent = (picked === q.correct ? U.right + " " : U.notQuite + " ") + q.explain; };
      for (const i of order) opts.append(h("button", { "data-i": i, onclick: () => { P.answers[q.id] = i; c.onAnswer(q.id, i, i === q.correct); lock(i); upd(); } }, q.options[i]));
      if (q.id in P.answers) lock(P.answers[q.id]);
      return h("div", { class: "pq" }, h("p", {}, h("b", {}, `${qi + 1}. `), q.q), preSvg[q.id](), opts, fb);
    });
    const pd = pre.prediction, pfb = h("div", { class: "fb", role: "status" }), popts = h("div", { class: "opts" });
    const lockP = (picked) => { popts.querySelectorAll("button").forEach((b) => { b.disabled = true; if (+b.dataset.i === picked) b.classList.add("picked"); }); pfb.className = "fb show ok"; pfb.textContent = pd.afterTry; };
    pd.options.forEach((o, i) => popts.append(h("button", { "data-i": i, onclick: () => { P.predicted = i; P.prediction = pd.options[i]; c.onAnswer("prediction", i, null); lockP(i); upd(); } }, o)));
    if (P.predicted !== undefined) lockP(P.predicted);
    box.replaceChildren(h("h2", {}, U.preTitle), h("p", { class: "hint" }, U.preHint), h("h3", {}, U.preQuestions), ...qEls, h("h3", {}, U.prePrediction), h("div", { class: "pq" }, h("p", {}, pd.q), popts, pfb), progress, h("div", { class: "controls foot" }, btn));
    upd();
  }

  // ---------- state the app needs ----------
  function questState(events) {
    const f = G(), taken = [...new Set(events.filter((e) => e.type === "take" && /^u[A-Z]$/.test(e.jar)).map((e) => e.jar.slice(1)))];
    const q = F.questRules(data, { ...f, taken }, events, ctx.ppeOn(), lab.firstSample);
    return { ...q, _knowns: F.benchIds(data).filter((id) => F.rowRecorded(f.rows[id])).length };
  }
  const recordComplete = () => F.recordComplete(data, G().rows, G().unk);
  const answered = () => Object.entries(G().unk).filter(([, u]) => u.identity).map(([l]) => l);
  function evidence(l) {
    const f = G(), u = f.unk[l], out = [];
    if (u && u.color) out.push(`${U.unknownWord} ${l}, flame test: ${u.color}, ${u.brightness || "—"}`);
    if (u && u.lines) out.push(`${U.unknownWord} ${l}, spectroscope: ${u.lines}`);
    for (const id of F.benchIds(data)) { const r = f.rows[id]; if (F.rowRecorded(r)) out.push(`${named(id).formula}: ${r.color}, ${r.brightness}`); }
    return out;
  }
  return { answered, evidence, draw, step, refresh, controls, sheet, view, showTab, hintPicture, renderPrelab, questState, recordComplete, bottles, syncSources, holding, unlocked, tutorial2, ensureUnknowns, colorOpts, brightOpts, pullAway, fresh, dipIn, holdStart, get tab() { return tab; } };
}
