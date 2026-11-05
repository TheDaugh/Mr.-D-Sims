// Usage: node tools/pes-pin.mjs <pin>
// Sets the Mr. D unlock PIN for the photoelectron lab. Writes only a hash (pesPinHash) into content/config.json, safe to commit.
// The teacher page (PIN card) prints the same line for a PIN you type there.
import { readFileSync, writeFileSync } from "node:fs";
import { sha256Hex } from "../../../shared/virtual-lab/mode.js";
const pin = process.argv[2];
if (!/^\d{4,8}$/.test(pin || "")) { console.error("Give a PIN of 4 to 8 digits: node tools/pes-pin.mjs 4821"); process.exit(1); }
const f = new URL("../content/config.json", import.meta.url), cfg = JSON.parse(readFileSync(f, "utf8"));
cfg.pesPinHash = await sha256Hex("pes-pin:" + pin);
writeFileSync(f, JSON.stringify(cfg, null, 2) + "\n");
console.log("pesPinHash written to content/config.json");
