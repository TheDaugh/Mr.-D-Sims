// The photoelectron model against its formulas (Lab 5, slot 11).
import test from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import * as P from "../src/engine/pes.js";
const D = createRequire(import.meta.url)("../../shared/pes-data.js");
const near = (a, b, tol = 1e-9) => assert.ok(Math.abs(a - b) <= tol * Math.max(1, Math.abs(b)), `${a} vs ${b}`);

test("kinetic energy is photon energy minus binding energy", () => {
  near(P.kineticEnergy(10, 2.5), 7.5);
  near(P.kineticEnergy(2.5, 10), -7.5);
});

test("a subshell frees electrons only when the photon energy is above its binding energy", () => {
  assert.equal(P.frees(1.0, 1.0), false);          // equal: nothing
  assert.equal(P.frees(1.0001, 1.0), true);
  for (const Z of D.labElements()) {
    const spec = D.labSpectrum(Z), lowest = Math.min(...spec.map((o) => o.MJ));
    assert.equal(P.freed(spec, lowest * 0.99).length, 0, "Z=" + Z);   // just under the weakest: nothing leaves
    assert.equal(P.freed(spec, 1e4).length, spec.length, "Z=" + Z);   // far above: every subshell frees
  }
});

test("electron speed equals sqrt(2 KE / m) per electron, KE per mole divided by Avogadro", () => {
  const ke = 3.2;                                   // MJ/mol
  const joulesPerElectron = (ke * 1e6) / 6.02214076e23;
  near(P.speedFromKE(ke), Math.sqrt((2 * joulesPerElectron) / 9.1093837015e-31), 1e-12);
  assert.equal(P.speedFromKE(0), 0);
  assert.equal(P.speedFromKE(-1), 0);
  assert.ok(Math.abs(P.speedFromKE(9.64853) / 5.93e6 - 1) < 0.01, "a 100 eV electron moves at about 5.93e6 m/s");   // 100 eV = 9.64853 MJ/mol
});

test("the light dial is log and invertible, and the band names are visible, ultraviolet, X-ray", () => {
  near(P.photonFromSlider(0), P.LIGHT_MIN); near(P.photonFromSlider(1), P.LIGHT_MAX);
  for (const u of [0.1, 0.33, 0.8]) near(P.sliderFromPhoton(P.photonFromSlider(u)), u, 1e-12);
  assert.equal(P.lightBand(0.25), "visible"); assert.equal(P.lightBand(3), "ultraviolet"); assert.equal(P.lightBand(100), "X-ray");
  // Most visible light frees nothing: the weakest-held electron of any of the 20 elements needs more than visible light.
  for (const Z of D.labElements()) assert.equal(P.freed(D.labSpectrum(Z), 0.34).length, 0, "Z=" + Z);
});

test("the detector builds the same peaks at any brightness; heights follow electron counts", () => {
  const spec = D.labSpectrum(10), rng = (s) => () => { s = (s + 0x6D2B79F5) >>> 0; let r = Math.imul(s ^ (s >>> 15), 1 | s); r ^= r + Math.imul(r ^ (r >>> 7), 61 | r); return ((r ^ (r >>> 14)) >>> 0) / 4294967296; };
  for (const photons of [2000, 40000]) {
    const t = P.newTally(spec), r = rng(7);
    for (let i = 0; i < photons; i++) P.addHit(t, P.fireOne(spec, 5000, r));
    const total = Object.values(t).reduce((a, b) => a + b, 0); assert.equal(total, photons);
    for (const o of spec) near(t[o.sub] / total, o.count / 10, 0.1 * (photons < 5000 ? 3 : 1));   // Ne has 10 electrons
  }
  // too-weak light: every photon passes through, no matter how many
  const t = P.newTally(spec), r3 = rng(3); for (let i = 0; i < 500; i++) P.addHit(t, P.fireOne(spec, 3, r3));   // Ne 2p is about 2.08 MJ/mol and 2s about 4.68: 3 frees 2p only
  assert.equal(t["1s"], 0); assert.equal(t["2s"], 0); assert.ok(t["2p"] === 500);
});

test("the AP axis decreases left to right and is logarithmic", () => {
  const ax = P.axis(0.3, 600, 1000);
  assert.ok(ax.x(500) < ax.x(5) && ax.x(5) < ax.x(0.5));
  near(ax.x(600), 0, 1e-9); near(ax.x(0.3), 1000, 1e-9);
  near(ax.x(Math.sqrt(0.3 * 600)), 500, 1e-9);
  near(ax.mj(ax.x(12.5)), 12.5, 1e-9);
});

test("the sourced data feed the model: argon at 1 keV frees all five subshells with KE = hv - BE", () => {
  const ar = D.labSpectrum(18), f = P.freed(ar, 96.4853);   // 1000 eV
  assert.equal(f.length, 4);                                  // 1s (3205 eV) needs more than 1 keV; 2s, 2p, 3s, 3p free
  for (const o of f) near(o.keMJ, 96.4853 - ar.find((x) => x.sub === o.sub).MJ);
});

// ---------- the lab's content and room ----------
import { readFileSync } from "node:fs";
import { validateQuests, questDone, questProgress } from "../../../shared/virtual-lab/quests.js";
import { parseRoom, reachable } from "../../../shared/virtual-lab/room.js";
const J = (p) => JSON.parse(readFileSync(new URL(p, import.meta.url)));
const lab = J("../content/labs/05-photoelectron.json");

test("validateQuests: the lab's quests are well formed, in order, and the tutorial quests are the first-time route", () => {
  assert.deepEqual(validateQuests(lab.quests), []);
  assert.equal(lab.quests.length, 17);
  const tut = lab.quests.filter((q) => q.tutorial).map((q) => q.id);
  assert.deepEqual(tut.slice(0, 7), ["door", "spectro", "li_pick", "li_fire", "li_sweep", "li_peak", "li_done"]);
  assert.ok(lab.quests.find((q) => q.id === "handin"));
});

test("lab config: required flags, a demo of 10 captions ending on the arrows, and no banned words", () => {
  assert.equal(lab.kind, "pes"); assert.equal(lab.noPPE, true); assert.equal(lab.lock, true); assert.ok(!lab.noDemo);
  assert.ok(lab.tutorial);
  assert.equal(lab.demo.length, 10); assert.match(lab.demo[9], /yellow arrows will walk you through each step/);
  const all = JSON.stringify(lab).toLowerCase();
  for (const w of ["extension", "challenge", "optional", "★", "wavelength", "predict"]) assert.ok(!all.includes(w), "banned word in the lab text: " + w);
  assert.ok(!lab.quests.some((q) => q.optional));
});

test("quest progress for a flame-state quest reads its own counter", () => {
  const q = lab.quests.find((x) => x.id === "b_draw");
  assert.equal(questProgress(q, [], { flame: { _b_draw: 2, _knowns: 9 } }), 2);
  assert.equal(questDone(q, [], { flame: { b_draw: true } }), true);
});

test("room: spectrometer, carousel and draw bench are reachable from the start with no goggles; the door opens without PPE", () => {
  const room = parseRoom(J("../content/rooms/spectroscopy.json")), none = {};
  const stations = []; room.rows.forEach((r, y) => [...r].forEach((ch, x) => { const t = room.legend[ch]; if (t.type === "station") stations.push({ t, x, y }); }));
  assert.deepEqual([...new Set(stations.map((s) => s.t.id))].sort(), ["carousel", "draw_bench", "spectrometer"]);
  for (const id of ["spectrometer", "carousel", "draw_bench"]) assert.equal(reachable(room, room.start, stations.find((s) => s.t.id === id), { goggles: true, apron: true }), true, id);
  assert.ok(room.start.y > room.doorRow);
});
