// Lab 6's room: every object can be reached, the door needs no goggles, the bench is three tiles wide, the renderer draws it with this
// folder's art, and the lab file and the host register the lab, its kind, its room, locked mode, 25 minutes and the three checks.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { parseRoom, reachable, tileAt } from "../../../shared/virtual-lab/room.js";
import { createRoomRenderer } from "../../../shared/virtual-lab/roomview.js";
import { art, icons } from "../src/ui/art.js";

const J = (f) => JSON.parse(readFileSync(new URL("../content/" + f, import.meta.url), "utf8"));
const def = J("rooms/physics-scales.json"), lab = J("labs/06-spring-scales.json"), room = parseRoom(def), PPE = { goggles: true, apron: true };

test("every object can be used from the start, and the bench is three tiles wide", () => {
  const spots = []; room.rows.forEach((r, y) => [...r].forEach((ch, x) => { const t = room.legend[ch]; if (t.id) spots.push({ id: t.id, x, y }); }));
  assert.deepEqual([...new Set(spots.map((s) => s.id))].sort(), ["door", "notice", "scale_rig", "stepcard"]);
  for (const s of spots) assert.ok(reachable(room, room.start, s, PPE), s.id);
  assert.equal(spots.filter((s) => s.id === "scale_rig").length, 3); assert.equal(tileAt(room, def.start.x, def.start.y).type, "floor");
});
test("the renderer draws the bench with this folder's art, and the bench has a hover picture", () => {
  let n = 0; const ctx = new Proxy({}, { get: (o, k) => (k in o ? o[k] : typeof k === "string" && /fill|stroke|arc|lineTo|moveTo|rect|beginPath|closePath|save|restore|translate|scale|setTransform|fillText|measureText|drawImage|createLinearGradient|createRadialGradient|clip|quadraticCurveTo|ellipse/.test(k) ? (...a) => { n++; return k === "measureText" ? { width: 10 } : k.startsWith("create") ? { addColorStop() {} } : undefined; } : undefined), set: (o, k, v) => { o[k] = v; return true; } });
  const e = createRoomRenderer({ width: 0, height: 0, getContext: () => ctx }, room, art); e.draw({ x: 4, y: 4, face: "u" }, {}, false, { tile: room.legend.S, x: 4, y: 3 }, 1);
  assert.ok(n > 100); assert.equal(typeof icons.scale_rig, "function");
});
test("the lab file and the host register lab 6: kind, room, locked mode, 25 minutes, three checks, no goggles", () => {
  assert.equal(lab.kind, "scales"); assert.equal(lab.roomFile, "physics-scales"); assert.equal(lab.lock, true); assert.equal(lab.noPPE, true); assert.equal(def.noPPE, true);
  assert.equal(lab.lengthMin, 25); assert.deepEqual(lab.checkpoints, ["spring", "string", "hang"]); assert.ok(lab.minActiveMin < lab.lengthMin);
  const host = readFileSync(new URL("../src/host.js", import.meta.url), "utf8"); assert.match(host, /"06-spring-scales": "06-spring-scales\.json"/); assert.match(host, /kinds: \{ fancart, scales \}/);
  assert.match(readFileSync(new URL("../src/ui/scales.js", import.meta.url), "utf8"), /import \* as CK from "..\/..\/..\/..\/shared\/virtual-lab\/checkpoint\.js"/);
});
