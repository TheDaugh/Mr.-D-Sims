import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { parseRoom, tileAt, step, reachable, facingTile } from "../src/engine/room.js";

const room = parseRoom(JSON.parse(readFileSync(new URL("../content/rooms/main-lab.json", import.meta.url))));
const none = {}, geared = { goggles: true, apron: true };
const objects = [];
room.rows.forEach((r, y) => [...r].forEach((ch, x) => { const t = room.legend[ch]; if (t.id && t.type !== "door") objects.push({ t, x, y }); }));

test("room parses, start is walkable and outside the lab", () => {
  assert.ok(room.w > 0 && room.doorRow > 0);
  assert.ok(!tileAt(room, room.start.x, room.start.y).solid);
  assert.ok(room.start.y > room.doorRow);
});
test("the door stops a student without goggles and apron", () => {
  const door = room.rows[room.doorRow].indexOf("D");
  const p = { x: door, y: room.doorRow + 1, face: "u" };
  assert.deepEqual(step(room, p, 0, -1, none), { moved: false, blocked: "no_ppe" });
  assert.deepEqual(step(room, p, 0, -1, { goggles: true }), { moved: false, blocked: "no_ppe" });
  assert.equal(step(room, p, 0, -1, geared).moved, true);
  assert.equal(p.y, room.doorRow);
});
test("lab objects are unreachable without PPE and reachable with it", () => {
  const inLab = objects.filter((o) => o.y < room.doorRow);
  assert.ok(inLab.length >= 8);
  for (const o of inLab) {
    assert.equal(reachable(room, room.start, o, none), false, o.t.id);
    assert.equal(reachable(room, room.start, o, geared), true, o.t.id);
  }
});
test("gear is reachable without PPE (you must be able to suit up)", () => {
  for (const o of objects.filter((o) => o.t.type === "locker" || o.t.type === "rack")) assert.equal(reachable(room, room.start, o, none), true, o.t.id);
});
test("shelves cover the three jar groups the bench uses", () => {
  const groups = objects.filter((o) => o.t.type === "shelf").map((o) => o.t.group).sort();
  assert.deepEqual(groups, ["Known samples", "Liquids", "Unknown samples"]);
  assert.equal(objects.filter((o) => o.t.type === "station").length > 0, true);
});
test("walls block and facing finds the object", () => {
  const p = { x: 1, y: 7, face: "l" };
  assert.equal(step(room, p, -1, 0, geared).moved, false);
  assert.equal(facingTile(room, p).tile.type, "wall");
  const q = { x: 1, y: 8, face: "u" };
  assert.equal(facingTile(room, q).tile.id, "locker");
});
