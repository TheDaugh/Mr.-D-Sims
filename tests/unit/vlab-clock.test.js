import { test } from "node:test";
import assert from "node:assert/strict";
import { huddleDue, huddleTimes, HUDDLE_AT } from "../../shared/virtual-lab/clock.js";

const base = { done: { 1: false, 2: false }, forced: { 1: false, 2: false }, at: HUDDLE_AT };
test("the global huddle clock is minute 3 and minute 25 of the period", () => assert.deepEqual(HUDDLE_AT, { h1: 3, h2: 25 }));
test("a lab can move a time later in its content; with no clock it gets the global times", () => {
  assert.deepEqual(huddleTimes({}), { h1: 3, h2: 25 }); assert.deepEqual(huddleTimes({ clock: { huddle2AtMin: 33 } }), { h1: 3, h2: 33 });
});
test("huddle 1 is called at minute 3 for a student still in the pre-lab or waiting at the gate, once", () => {
  assert.equal(huddleDue({ ...base, minutesIn: 2.9, stage: "prelab" }), null);
  assert.equal(huddleDue({ ...base, minutesIn: 3, stage: "prelab" }), 1); assert.equal(huddleDue({ ...base, minutesIn: 3.2, stage: "huddle1" }), 1);
  assert.equal(huddleDue({ ...base, minutesIn: 9, stage: "prelab", forced: { 1: true, 2: false } }), null);
  assert.equal(huddleDue({ ...base, minutesIn: 9, stage: "prelab", done: { 1: true, 2: false } }), null);
  assert.equal(huddleDue({ ...base, minutesIn: 9, stage: "intro" }), null);   // no name yet: not in the lab
});
test("huddle 2 is called at minute 25 for a student in the lab, once, whenever they started", () => {
  assert.equal(huddleDue({ ...base, minutesIn: 24.9, stage: "lab" }), null);
  assert.equal(huddleDue({ ...base, minutesIn: 25, stage: "lab" }), 2);
  assert.equal(huddleDue({ ...base, minutesIn: 31, stage: "lab", forced: { 1: false, 2: true } }), null);
  assert.equal(huddleDue({ ...base, minutesIn: 40, stage: "lab", done: { 1: true, 2: true } }), null);
});
test("outside a class period nothing is ever due (home mode: a huddle is a note, never a stop)", () => {
  assert.equal(huddleDue({ ...base, minutesIn: null, stage: "lab" }), null); assert.equal(huddleDue({ ...base, minutesIn: undefined, stage: "prelab" }), null);
});
