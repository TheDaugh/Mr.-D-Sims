import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { deflection, thetaFromB, closestApproach, wavelengthFm, ELEMENTS } from "../src/engine/coulomb.js";
import * as FM from "../src/engine/foil.js";
import { parseRoom, step, reachable, tileAt } from "../../../shared/virtual-lab/room.js";

test("integrated Coulomb trajectories match Rutherford's formula", () => {
  for (const [Z, E, b] of [[79, 5, 5], [79, 5, 45], [79, 5, 200], [13, 5, 10], [79, 10, 30], [47, 3, 60]]) {
    const sim = deflection(Z, E, b), formula = (thetaFromB(b, Z, E) * 180) / Math.PI;
    assert.ok(Math.abs(sim - formula) < 0.05 * Math.max(formula, 1), `${Z} ${E} ${b}: ${sim} vs ${formula}`);
  }
});
test("a plum-pudding atom barely bends an alpha particle", () => assert.ok(deflection(79, 5, 5e4, "plum", 1e5) < 0.05));
test("more protons or less energy means a closer approach and bigger deflections", () => {
  assert.ok(closestApproach(79, 5) > closestApproach(13, 5)); assert.ok(closestApproach(79, 3) > closestApproach(79, 10));
  assert.ok(Math.abs(closestApproach(79, 5) - 45.5) < 0.1);
  assert.ok(wavelengthFm(5) < 7);   // smaller than a gold nucleus: the particle picture holds
});
test("detector scaling follows Z², density, thickness and 1/E²", () => {
  const A = (t, th, E) => FM.A(t, th, E), A0 = A("Au", 1, 5);
  assert.ok(Math.abs(A("Au", 2, 5) / A0 - 2) < 1e-9); assert.ok(Math.abs(A("Au", 1, 2.5) / A0 - 4) < 1e-9);
  assert.ok(A("Al", 1, 5) < A0 / 20); assert.ok(A("Pt", 1, 5) / A0 > 0.9 && A("Pt", 1, 5) / A0 < 1.2);
  for (const e of ELEMENTS) assert.ok(FM.TARGETS[e.sym] && FM.TARGETS[e.sym].Z === e.Z, e.sym);
});
const room = parseRoom(JSON.parse(readFileSync(new URL("../content/rooms/manchester-lab.json", import.meta.url))));
test("Manchester room: curtain always opens, every object is reachable, apparatus is a station", () => {
  const none = {}, door = room.rows[room.doorRow].indexOf("D");
  assert.equal(step(room, { x: door, y: room.doorRow + 1, face: "u" }, 0, -1, { goggles: true, apron: true }).moved, true);
  const objs = []; room.rows.forEach((r, y) => [...r].forEach((ch, x) => { const t = room.legend[ch]; if (t.id && t.type !== "door") objs.push({ t, x, y }); }));
  for (const o of objs) assert.equal(reachable(room, room.start, o, { goggles: true, apron: true }), true, o.t.id);
  assert.ok(objs.some((o) => o.t.type === "station" && o.t.id === "foil_rig")); assert.ok(!tileAt(room, room.start.x, room.start.y).solid);
});
