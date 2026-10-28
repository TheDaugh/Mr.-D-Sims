// Wiring: the sheet's files are copied unchanged, the lab file says what the prompt says, every UI string key exists and is used,
// the hub lists the lab, the page loads the host before the shared app, and no physics file sits in the chemistry folder.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import vm from "node:vm";

const root = new URL("../../../", import.meta.url).pathname, rd = (p) => readFileSync(root + p, "utf8"), J = (p) => JSON.parse(rd(p));
const lab = J("physics/virtual-lab/content/labs/05-fan-cart.json"), L = J("physics/virtual-lab/content/slot-07-lab-content.json");

test("the sheet's files are in docs/slot-07 and copied unchanged into the lab folder; the content test differs only in its three file paths", () => {
  for (const f of ["slot-07-data.json", "slot-07-items.json", "slot-07-lab-content.json"]) assert.equal(rd("physics/virtual-lab/content/" + f), rd("docs/slot-07/" + f), f);
  const a = rd("docs/slot-07/slot-07-content.test.cjs").split("\n"), b = rd("physics/virtual-lab/test/slot-07-content.test.cjs").split("\n");
  assert.equal(a.length, b.length); const diff = a.map((x, i) => (x === b[i] ? null : i + 1)).filter(Boolean); assert.deepEqual(diff, [5], "only the line that names the three files");
  assert.match(b[4], /\.\.\/content\/slot-07-data\.json.*\.\.\/content\/slot-07-items\.json.*\.\.\/content\/slot-07-lab-content\.json/);
  assert.ok(existsSync(root + "docs/slot-07/slot-07.sheet.tex"));
});
test("the lab file points at the three content files and at the room, and its ui covers what the code asks for", () => {
  for (const k of ["data", "items", "content"]) assert.ok(existsSync(root + "physics/virtual-lab/" + lab.files[k]), k);
  assert.ok(existsSync(root + "physics/virtual-lab/content/rooms/" + lab.roomFile + ".json"));
  const own = rd("physics/virtual-lab/src/ui/fancart.js"), app = rd("chemistry/virtual-lab/src/ui/app.js");   // the shared app asks for this lab's strings only through fl.text("key")
  const used = new Set([...own.matchAll(/\bU\.([A-Za-z0-9]+)/g)].map((m) => m[1]).concat([...own.matchAll(/lab\.ui\.([A-Za-z0-9]+)/g)].map((m) => m[1]), [...app.matchAll(/fl\.text\("([A-Za-z0-9]+)"\)/g)].map((m) => m[1]), ["coachHuddle1", "doneInfo", "exitHead"].filter((k) => app.includes("lab.ui." + k))));
  assert.deepEqual([...used].filter((k) => !(k in lab.ui)), [], "keys the code uses but the lab file lacks");
  assert.deepEqual(Object.keys(lab.ui).filter((k) => !used.has(k)), [], "strings nobody shows");
});
test("the physics lab is on the physics hub, with its teacher links, and the pages it links to exist", () => {
  const win = {}; vm.runInNewContext(rd("physics/sims.js"), { window: win });
  const e = win.UNITS.flatMap((u) => u.entries).find((x) => /lab=05-fan-cart/.test(x.href)); assert.ok(e, "hub entry"); assert.equal(e.type, "lab");
  assert.ok(existsSync(root + "physics/" + e.href.split("?")[0])); for (const t of e.teacher) assert.ok(existsSync(root + "physics/" + t.href.split(/[?#]/)[0]), t.href);
});
test("the page loads the host before the shared app, with the clock, codes, lock and profile scripts", () => {
  const h = rd("physics/virtual-lab/index.html"), at = (s) => h.indexOf(s);
  for (const s of ["../../shared/bell.js", "../../shared/codes.js", "../../shared/lock.js", "../../shared/profile.js", "src/host.js", "../../chemistry/virtual-lab/src/ui/app.js"]) assert.ok(at(s) > 0, s);
  assert.ok(at("src/host.js") < at("chemistry/virtual-lab/src/ui/app.js")); assert.ok(at("bell.js") < at("codes.js"));
  assert.ok(!/goggles|apron|microscope(?!.*hidden)/i.test(h.replace(/<dialog class="dlg" id="dlgMicro">.*?<\/dialog>/s, "")), "no chemistry words on the page");
});
test("no physics file sits in the chemistry folder; the chemistry files this lab touches are the five hook files", () => {
  const found = []; const walk = (d) => { for (const f of readdirSync(root + d)) { const p = d + "/" + f; if (statSync(root + p).isDirectory()) { if (f !== "node_modules") walk(p); } else if (/fancart|fan-cart|physics-lab|slot-07/i.test(f)) found.push(p); } };
  walk("chemistry"); assert.deepEqual(found, []);
  const host = rd("chemistry/virtual-lab/src/ui/app.js"); assert.match(host, /window\.VLAB_HOST/); assert.ok(!/fancart/i.test(host + rd("shared/virtual-lab/roomview.js") + rd("chemistry/virtual-lab/src/ui/demo.js") + rd("shared/virtual-lab/icons.js") + rd("shared/virtual-lab/quests.js")), "the hooks name no physics lab");
});
test("the three bands and the day rules are in the content: two codes, clock at 3 and 28, no stamp, no report code", () => {
  assert.equal(L.clock.huddle1AtMin, 3); assert.equal(L.clock.huddle2AtMin, 28); assert.equal(J("physics/virtual-lab/content/slot-07-items.json").bands, 3);
  const src = rd("physics/virtual-lab/src/ui/fancart.js"); assert.ok(!/stamp|reportCode|checkCode|badge/i.test(src), "no end-of-lesson stamp or report code"); assert.match(src, /MrD\.profile\.record/);
  assert.match(rd("chemistry/virtual-lab/src/ui/app.js"), /gateV3\(lab\.id, "h" \+ n\)/);
});
