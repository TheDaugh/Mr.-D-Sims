// The physics room: every object can be reached from the start, the door needs no goggles, and the room renderer (the chemistry one, given this
// folder's art) can draw every tile type, including the new track, balance and bar shelf.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { parseRoom, reachable, step, facingTile, tileAt } from "../../../shared/virtual-lab/room.js";
import { createRoomRenderer } from "../../../shared/virtual-lab/roomview.js";
import { art, icons } from "../src/ui/art.js";

const J = (f) => JSON.parse(readFileSync(new URL("../content/" + f, import.meta.url), "utf8"));
const def = J("rooms/physics-lab.json"), L = J("slot-07-lab-content.json"), lab = J("labs/05-fan-cart.json"), room = parseRoom(def);
const PPE = { goggles: true, apron: true };   // the lab sets noPPE: the app walks with this

test("the room file is the room block of the sheet's lab-content file, unchanged", () => { assert.deepEqual(def, L.room); });
test("every object can be used: each interactive tile touches a floor tile the student can walk to from the start", () => {
  const spots = []; room.rows.forEach((r, y) => [...r].forEach((ch, x) => { const t = room.legend[ch]; if (t.id) spots.push({ id: t.id, x, y }); }));
  assert.deepEqual(spots.map((s) => s.id).filter((v, i, a) => a.indexOf(v) === i).sort(), ["balance", "bar_shelf", "door", "notice", "stepcard", "track"]);
  for (const s of spots) assert.ok(reachable(room, room.start, s, PPE), s.id + " at " + s.x + "," + s.y);
});
test("the track is four tiles wide, and the other objects are one tile", () => {
  const n = (id) => room.rows.join("").split("").filter((c) => room.legend[c].id === id).length;
  assert.equal(n("track"), 4); for (const id of ["balance", "bar_shelf", "door", "notice", "stepcard"]) assert.equal(n(id), 1, id);
});
test("noPPE: the lab door opens with no goggles and no apron (the app passes noPPE walkers a ready pair)", () => {
  assert.equal(def.noPPE, true); assert.equal(lab.noPPE, true);
  const p = { x: 4, y: 7, face: "u" }; assert.equal(step(room, p, 0, -1, PPE).moved, true); assert.equal(p.y, 6, "on the door tile");
  assert.equal(tileAt(room, 4, 6).type, "door");
});
test("the start tile is floor and faces up", () => { assert.equal(tileAt(room, def.start.x, def.start.y).type, "floor"); assert.equal(def.start.face, "u"); const f = facingTile(room, { ...def.start }); assert.equal(f.tile.type, "floor"); });
test("the lab file registers kind fancart with the physics room, locked mode, a tutorial and the step card, and keeps the demo", () => {
  assert.equal(lab.kind, "fancart"); assert.equal(lab.roomFile, "physics-lab"); assert.equal(lab.noPPE, true); assert.equal(lab.lock, true); assert.ok(lab.tutorial);
  assert.deepEqual(lab.stepCard, L.stepCard); assert.ok(!("noDemo" in lab) || lab.noDemo === false, "no noDemo");
  assert.equal(lab.carry, 4, "four bars fit in the hands");
});

// a canvas that accepts anything and counts how many shapes were filled, so the renderer can run in Node
const counter = () => { let n = 0; const f = () => p; const p = new Proxy(f, { get: (t, k) => { if (k === "fill") return () => { n++; }; return k === Symbol.toPrimitive ? () => 0 : p; }, set: () => true, apply: () => p }); return { ctx: p, count: () => n }; };
const fills = (extra, tiles) => { const c = counter(), canvas = { width: 0, height: 0, getContext: () => c.ctx }, r = createRoomRenderer(canvas, room, extra); r.draw({ x: 6, y: 8, face: "u" }, {}, true, tiles || { tile: room.legend["."], x: 6, y: 7 }, 0); return c.count(); };
test("the room renderer draws every tile of the room with this folder's art, and the new art adds to what the chemistry renderer would draw", () => {
  assert.ok(fills(art) > 100);
  assert.ok(fills(art) > fills(undefined), "the track, balance and bar shelf draw more shapes than the chemistry station and shelf they replace");
  const e = createRoomRenderer({ width: 0, height: 0, getContext: () => counter().ctx }, room, art); e.draw({ x: 5, y: 4, face: "l" }, {}, false, { tile: room.legend.T, x: 5, y: 3 }, 1);
  assert.deepEqual(Object.keys(art({ box() {}, fl() {}, poly() {}, P() {}, tileAt, room })).sort(), ["balance", "bar_shelf", "track"], "keyed by tile id");
});
test("each new object has a picture for hover tips, the shelf screen and the carrying row", () => {
  for (const id of ["bar", "cart", "bar_shelf", "track", "stepcard", "notice"]) assert.equal(typeof icons[id], "function", id);
  for (const k of Object.keys(icons)) icons[k]((x, y, w, h, c) => { assert.ok(x >= 0 && y >= 0 && x + w <= 24 && y + h <= 24, k + " stays inside 24x24: " + [x, y, w, h]); assert.match(c, /^#|^rgba?/); });
});
