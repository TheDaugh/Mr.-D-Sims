// Packs the lab into ONE html file that runs from a double-click (file://). Usage: node tools/bundle.mjs [--student]
// The teacher build skips the intro, pre-lab, timer and submit gate, and adds a Key button. Keep it off the student site.
import { buildSync } from "esbuild";
import { readFileSync, writeFileSync, mkdirSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const student = process.argv.includes("--student");
const rd = (p) => readFileSync(join(root, p), "utf8");
const js = buildSync({ entryPoints: [join(root, "src/ui/app.js")], bundle: true, format: "iife", minify: true, write: false }).outputFiles[0].text;
const content = {};
for (const f of ["species", "reactions", "hazards", "config"]) content[`content/${f}.json`] = JSON.parse(rd(`content/${f}.json`));
for (const f of readdirSync(join(root, "content/rooms"))) if (f.endsWith(".json")) content[`content/rooms/${f}`] = JSON.parse(rd(`content/rooms/${f}`));
for (const f of readdirSync(join(root, "content/labs"))) if (f.endsWith(".json")) content[`content/labs/${f}`] = JSON.parse(rd(`content/labs/${f}`));
const safe = (s) => s.replace(/<\/(script)/gi, "<\\/$1");
let html = rd("index.html");
html = html.replace(/<link rel="stylesheet" href="\.\.\/shared\/lab\.css">/, () => `<style>${rd("../shared/lab.css")}</style>`)
  .replace(/<link rel="stylesheet" href="src\/ui\/stage\.css">/, () => `<style>${rd("src/ui/stage.css")}</style>`)
  .replace(/<script type="module" src="src\/ui\/app\.js"><\/script>/, () => `<script>window.__TEACHER__=${!student};window.__CONTENT__=${safe(JSON.stringify(content))};</script><script>${safe(js)}</script>`);
if (html.includes('src="src/') || html.includes('href="src/')) throw new Error("unbundled asset left in html");
mkdirSync(join(root, "dist"), { recursive: true });
const out = join(root, "dist", student ? "student-lab.html" : "teacher-key.html");
writeFileSync(out, html);
console.log(out, (html.length / 1024).toFixed(0) + " KB");
