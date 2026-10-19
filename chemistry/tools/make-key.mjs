// Writes the teacher key page for a chemistry lesson, next to the lesson.
//   node chemistry/tools/make-key.mjs chemistry/unit-3-atoms-ions/atom-discovery.html
// The key page is the same file with the key view switched on, so it cannot drift from the lesson.
// Re-run it after every edit to the lesson. The student page ignores #key.
import fs from "node:fs";

const src = process.argv[2];
if (!src || !/\.html$/.test(src)) {
  console.error("usage: node chemistry/tools/make-key.mjs path/to/lesson.html");
  process.exit(1);
}
const html = fs.readFileSync(src, "utf8");
if (!html.includes("window.__KEY__")) {
  console.error("This lesson does not read window.__KEY__, so it has no separate key view.");
  process.exit(1);
}
const out = src.replace(/\.html$/, "-key.html");
const key = html
  .replace("<head>", '<head>\n<meta name="robots" content="noindex">\n<script>window.__KEY__=true;</script>')
  .replace(/<title>(.*?)<\/title>/, "<title>Teacher key: $1</title>");
fs.writeFileSync(out, key);
console.log("wrote " + out);
