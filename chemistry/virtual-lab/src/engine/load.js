// Node-side loader for the content files (the browser build will fetch the same JSON).
import { readFileSync } from "node:fs";
import { buildWorld } from "./sim.js";

const read = (p) => JSON.parse(readFileSync(new URL(p, import.meta.url), "utf8"));
export const speciesData = read("../../content/species.json");
export const reactionData = read("../../content/reactions.json");
export const pairReview = read("../../content/pair-review.json");
export const world = buildWorld(speciesData, reactionData);
