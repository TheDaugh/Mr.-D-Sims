import test from "node:test";
import assert from "node:assert/strict";
import { createActive, IDLE } from "../../../shared/virtual-lab/active.js";
import { checkCode } from "../../../shared/virtual-lab/integrity.js";
test("active clock counts only while recent activity, visible and in a lab stage", () => {
  const a = createActive(); a.poke(0);
  for (let t = 0; t <= 30; t += 0.5) a.tick(t, true, true);
  assert.ok(a.sec > 29 && a.sec <= 30.1);
  const b = a.sec; for (let t = 31; t < 31 + IDLE + 20; t += 0.5) a.tick(t, true, true);
  assert.ok(a.sec - b < IDLE + 1, "stops after the idle window");
  const c = a.sec; a.poke(200); for (let t = 200; t < 210; t += 0.5) a.tick(t, false, true); assert.equal(a.sec, c, "hidden tab does not count");
  for (let t = 210; t < 220; t += 0.5) a.tick(t, true, false); assert.equal(a.sec, c, "non-lab stage does not count");
  for (let t = 400; t < 410; t += 0.5) a.tick(t, true, true, true); assert.ok(a.sec > c + 9, "a running measurement counts");
});
test("check code depends on the facts it covers", () => {
  const r = { student: "A", lab: "x", seed: 5, activeSec: 1300, events: 200, cerDone: true };
  assert.equal(checkCode(r), checkCode({ ...r }));
  assert.notEqual(checkCode(r), checkCode({ ...r, activeSec: 1200 }));
  assert.match(checkCode(r), /^VL-[0-9A-F]{8}$/);
});
import { stageScale } from "../../../shared/virtual-lab/fit.js";
test("browser zoom changes the stage size instead of cancelling out", () => {
  const at100 = stageScale(1280, 720, 1, 1) * 1 * 1;      // fits exactly
  const at200 = stageScale(640, 360, 2, 1);                // window in CSS px halves when zoomed to 200%
  const at50 = stageScale(2560, 1440, 0.5, 1);
  assert.ok(Math.abs(at100 - 1) < 1e-9 && Math.abs(at200 - 1) < 1e-9, "CSS scale x dpr doubles");
  assert.ok(at200 * 2 > at100 * 1 * 1.9, "physical size doubles at 200%");
  assert.ok(at50 * 0.5 < at100 * 0.6, "physical size halves at 50%");
});
