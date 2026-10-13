import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { makeSig, sha256Hex, resolveMode } from "../src/mode.js";
import { validateHazards } from "../src/engine/hazards.js";

const J = (p) => JSON.parse(readFileSync(new URL(p, import.meta.url)));
test("hazard data is complete and every treatment station exists in the room", () => {
  const room = J("../content/rooms/main-lab.json");
  const ids = Object.values(room.legend).map((t) => t.id).filter(Boolean);
  assert.deepEqual(validateHazards(J("../content/hazards.json"), ids), []);
});
test("validator catches a missing station and a bad quiz", () => {
  const bad = validateHazards({ hazards: [{ id: "x", title: "t", guided: "g", happened: "h", why: "w", points: 5, needs: "moat", quiz: { options: [["a", true], ["b", true], ["c", false]] } }] }, ["sink"]);
  assert.equal(bad.length, 3);
});
test("modes: default guided, valid signature unlocks, anything else falls back", async () => {
  const sig = await makeSig("secret", "consequences");
  const config = { modeVerifiers: { consequences: await sha256Hex(sig) } };
  const P = (q) => new URLSearchParams(q);
  assert.equal((await resolveMode(P(""), config)).mode, "guided");
  assert.equal((await resolveMode(P(`mode=consequences&sig=${sig}`), config)).mode, "consequences");
  assert.deepEqual(await resolveMode(P("mode=consequences"), config), { mode: "guided", rejected: "consequences" });
  assert.equal((await resolveMode(P("mode=consequences&sig=guess"), config)).mode, "guided");
  assert.equal((await resolveMode(P(`mode=sandbox&sig=${sig}`), config)).mode, "guided");
});
