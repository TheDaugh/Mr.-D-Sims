import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import * as F from "../src/engine/flame.js";

const J = (p) => JSON.parse(readFileSync(new URL(p, import.meta.url)));
const data = J("../content/flame-data.json"), items = J("../content/flame-items.json"), lab = J("../content/labs/04-flame-tests.json");

test("the data and item files are the sheet's, byte for byte (hash recorded at build time)", () => {
  const h = (p) => F.hash(readFileSync(new URL(p, import.meta.url), "utf8"));
  assert.equal(h("../content/flame-data.json"), lab.sourceHashes.data);
  assert.equal(h("../content/flame-items.json"), lab.sourceHashes.items);
  assert.equal(h("../content/flame-lab-content.json"), lab.sourceHashes.content);
});

test("burn: a fresh splint shows the salt; K flashes the masking agent first; a reused splint flashes it for any salt", () => {
  const li = F.burn(data, "LiCl"); assert.equal(li.phases.length, 1); assert.equal(li.phases[0].swatch, "#D2193C");
  const k = F.burn(data, "KCl"); assert.equal(k.phases.length, 2); assert.equal(k.phases[0].swatch, "#FFB000"); assert.equal(k.phases[0].to, 2); assert.equal(k.phases[1].name, "lilac");
  const r = F.burn(data, "SrCl2", true); assert.equal(r.phases[0].flash, true); assert.equal(r.reused, true); assert.equal(r.phases[1].swatch, "#D2193C");
  const na = F.burn(data, "NaCl", true); assert.equal(na.phases.length, 1);          // sodium on a sodium splint looks the same; the run is still flagged
  assert.equal(F.phaseAt(r, 1).flash, true); assert.equal(F.phaseAt(r, 5).flash, undefined);
});

test("splint: used after a hold, and a second dip is a reuse", () => {
  const s = F.newSplint(1); assert.equal(F.dip(s, "LiCl"), false); assert.equal(F.dip(s, "NaCl"), true);
  const u = F.newSplint(2); u.used = true; assert.equal(F.dip(u, "KCl"), true);
});

test("unknowns: A from the Na/K pool, B from the Li/Sr pool, same student same bottles, extras always come from the extra pool", () => {
  const seen = new Set();
  for (let i = 0; i < 60; i++) { const a = F.assignUnknowns(data, "K7Q-" + i); assert.ok(data.unknowns.A.pool.includes(a.A) && data.unknowns.B.pool.includes(a.B)); seen.add(a.A + a.B); assert.deepEqual(a, F.assignUnknowns(data, "K7Q-" + i)); }
  assert.ok(seen.size >= 3, "neighbors differ");
  for (let n = 0; n < 40; n++) assert.ok(data.unknowns.extra.pool.includes(F.extraSample(data, "x", n)));
  assert.equal(F.unknownLabel(0), "A"); assert.equal(F.unknownLabel(2), "C");
});

test("record: unknowns stay locked until all seven bench salts have a color and a brightness", () => {
  const rows = {}; for (const id of F.benchIds(data)) rows[id] = { color: "x", brightness: "y" };
  assert.equal(F.benchIds(data).length, 7); assert.equal(F.knownsRecorded(data, rows), true);
  delete rows.NaNO3.brightness; assert.equal(F.knownsRecorded(data, rows), false);
  rows.NaNO3.brightness = "y"; delete rows.LiCl; assert.equal(F.unknownsOpen(data, rows), false);
});
test("code 2 gate: seven recorded and both unknowns answered", () => {
  const rows = {}; for (const id of F.benchIds(data)) rows[id] = { color: "x", brightness: "y" };
  assert.equal(F.recordComplete(data, rows, { A: { identity: "Na" } }), false);
  assert.equal(F.recordComplete(data, rows, { A: { identity: "Na" }, B: { identity: "cannot" } }), true);
});
test("the second tool is needed exactly when an unknown shows a color two knowns share", () => {
  assert.deepEqual(F.ambiguousGroups(data), ["crimson"]);
  assert.equal(F.needsSecondTool(data, { A: { sample: "NaCl", color: "yellow-orange" }, B: { sample: "SrCl2", color: "crimson" } }), true);
  assert.equal(F.needsSecondTool(data, { A: { sample: "NaCl", color: "yellow-orange" } }), false);
});

test("spectrum picture is drawn from the data: Sr has a blue line, Li none; bands sit behind Sr and Cu; Na's pair is one line", () => {
  const svg = (m) => F.spectrumSvg(data, [{ label: m, metal: m }]), nms = (s) => [...s.matchAll(/class="ln" data-nm="([\d.]+)"/g)].map((x) => +x[1]);
  assert.ok(nms(svg("Sr")).some((n) => n > 450 && n < 470)); assert.ok(!nms(svg("Li")).some((n) => n >= 400 && n <= 500));
  assert.equal(nms(svg("Na")).length, 1); assert.ok(Math.abs(nms(svg("Na"))[0] - 589.2) < 0.5);
  assert.match(svg("Sr"), /class="band"[^>]*data-from="600" data-to="700"/); assert.match(svg("Cu"), /data-from="500" data-to="550"/); assert.doesNotMatch(svg("Li"), /class="band"/);
  assert.equal(nms(svg("Cu")).length, 3);
  assert.match(F.spectrumSvg(data, [{ label: "?", lines: [460.7] }]), /data-nm="460.7"/);
});
test("line height ranks lines within one metal only", () => {
  const sr = F.spectrumSvg(data, [{ label: "Sr", metal: "Sr" }]), hts = [...sr.matchAll(/data-nm="([\d.]+)" x1="[\d.]+" x2="[\d.]+" y1="([\d.]+)" y2="([\d.]+)"/g)].map((m) => [+m[1], +m[2] - +m[3]]);
  const h = (nm) => hts.find((x) => Math.abs(x[0] - nm) < 1)[1]; assert.ok(h(460.7) > h(640.8) && h(640.8) > h(650.4));
});

test("items: every checkable answer derived from the data equals items.json", () => {
  for (const it of items.items) {
    if (!it.check) continue;
    const d = F.deriveAnswer(data, it);
    if (it.check.kind === "sameColorDifferentAnion") assert.equal(d, "same");
    else if (it.check.kind === "ambiguousPair") assert.ok(/Li and Sr/.test(d) && /Li( and | or )Sr/.test(it.answer));
    else assert.ok(d && it.answer.startsWith(d), it.id + " derived " + d);
  }
});
test("items: hints never give the answer, and each hint costs a fresh attempt", () => {
  const it = items.items.find((i) => i.id === "b1-1"), st = { band: 1, done: [], res: {} };
  let r = F.answerItem(items, st, it, "Li"); assert.equal(r.state, "hint"); assert.equal(r.hint, it.hints[0]);
  r = F.answerItem(items, st, it, "K"); assert.equal(r.hint, it.hints[1]);
  r = F.answerItem(items, st, it, "Cu"); assert.equal(r.hint, it.hints[2]);
  r = F.answerItem(items, st, it, "Sr"); assert.equal(r.state, "closed"); assert.equal(st.band, 1); assert.deepEqual(st.done, ["b1-1"]);
});
test("items: band rises only on a first-try right answer, never falls, caps at the top band", () => {
  const st = { band: 1, done: [], res: {} };
  F.answerItem(items, st, items.items[0], "Na"); assert.equal(st.band, 2);
  F.answerItem(items, st, items.items[1], "Li"); F.answerItem(items, st, items.items[1], "Ca"); assert.equal(st.band, 2);   // right after a hint: stays
  for (const i of items.items.slice(2)) { st.band = 3; F.answerItem(items, st, i, i.answer); assert.equal(st.band, 3); }
});
test("items: next item prefers the current band, then lower, then whatever is left", () => {
  const st = { band: 2, done: [] }; assert.equal(F.nextItem(items, st).band, 2);
  st.done = items.items.filter((i) => i.band === 2).map((i) => i.id); assert.equal(F.nextItem(items, st).band, 1);
  st.done = items.items.filter((i) => i.band < 3).map((i) => i.id); assert.equal(F.nextItem(items, st).band, 3);
  st.done = items.items.map((i) => i.id); assert.equal(F.nextItem(items, st), null);
});
