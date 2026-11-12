// The checkpoint rule (shared/virtual-lab/STANDARD.md, "Checkpoints"): every virtual lab that asks questions uses shared/virtual-lab/checkpoint.js
// (3 right in a row, generated questions, 3 misses lock, today's unlock code opens it). A lab JSON must say which: a list of question types,
// "legacy" (not yet converted; keep this list short and shrink it), or "none" with a "checkpointsWhy".
const { test } = require("node:test"), assert = require("node:assert/strict"), fs = require("node:fs"), path = require("node:path");
const root = path.join(__dirname, "..", "..");
const labs = [];
for (const dir of ["chemistry/virtual-lab", "physics/virtual-lab"]) for (const f of fs.readdirSync(path.join(root, dir, "content/labs"))) if (f.endsWith(".json")) labs.push({ dir, f, lab: JSON.parse(fs.readFileSync(path.join(root, dir, "content/labs", f), "utf8")) });
test("every lab declares its checkpoints", () => { for (const { f, lab } of labs) assert.ok(lab.checkpoints !== undefined, f + " needs a checkpoints field"); });
test("a lab with checkpoint types uses the shared module and shows the unlock code in its key", () => {
  for (const { dir, f, lab } of labs) {
    if (!Array.isArray(lab.checkpoints)) { assert.ok(lab.checkpoints === "legacy" || (lab.checkpoints === "none" && lab.checkpointsWhy), f + ": checkpoints is a list, \"legacy\" or \"none\" with checkpointsWhy"); continue; }
    assert.ok(lab.checkpoints.length > 0, f);
    const src = fs.readFileSync(path.join(root, dir, "src/ui", lab.kind + ".js"), "utf8");
    assert.match(src, /shared\/virtual-lab\/checkpoint\.js/, f + " must import shared/virtual-lab/checkpoint.js");
    for (const k of ["lockHead", "lockMiss", "lockHelp", "lockBody", "unlockWord", "pinWrong"]) assert.ok(lab.ui && lab.ui[k], f + " needs ui." + k);
    assert.match(src, /Unlock code/, f + ": the teacher key must show the unlock code");
  }
});
test("legacy labs are a short, named list", () => { const l = labs.filter((x) => x.lab.checkpoints === "legacy").map((x) => x.f); assert.ok(l.length <= 5, "legacy: " + l.join(", ")); });
