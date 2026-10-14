import test from "node:test";
import assert from "node:assert/strict";
import { createActive, IDLE } from "../src/engine/active.js";
import { checkCode } from "../src/engine/integrity.js";
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
