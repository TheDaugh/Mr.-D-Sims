// Usage: node tools/links.js <teacher-code> [base-url]
// Writes content/config.json (hashes only, safe to commit) and prints one link per mode.
import { writeFileSync } from "node:fs";
import { makeSig, sha256Hex } from "../src/mode.js";
const [code, base = "https://thedaugh.github.io/Mr.-D-Sims/chemistry/virtual-lab/index.html"] = process.argv.slice(2);
if (!code) { console.error("Give a teacher code: node tools/links.js <code>"); process.exit(1); }
const verifiers = {}, links = { guided: base };
for (const mode of ["consequences", "sandbox"]) {
  const sig = await makeSig(code, mode);
  verifiers[mode] = await sha256Hex(sig);
  links[mode] = `${base}?mode=${mode}&sig=${sig}`;
}
writeFileSync(new URL("../content/config.json", import.meta.url), JSON.stringify({ modeVerifiers: verifiers }, null, 2) + "\n");
for (const m in links) console.log(`${m}:\n  ${links[m]}\n`);
