// Hazard data checks. The UI decides what a hazard does per mode; this file keeps the data honest.
export const indexHazards = (data) => Object.fromEntries(data.hazards.map((h) => [h.id, h]));
export const losePoints = (points, amount) => Math.max(0, points - amount);

// Returns a list of problems (empty means fine). roomIds are the ids of objects a student can walk to.
export function validateHazards(data, roomIds) {
  const bad = [], seen = new Set();
  for (const h of data.hazards) {
    if (seen.has(h.id)) bad.push(`duplicate id ${h.id}`); seen.add(h.id);
    for (const k of ["title", "guided", "happened", "why"]) if (!h[k]) bad.push(`${h.id}: missing ${k}`);
    if (!(h.points > 0)) bad.push(`${h.id}: points must be positive`);
    if (h.needs) { if (!roomIds.includes(h.needs)) bad.push(`${h.id}: needs '${h.needs}' which is not in the room`); if (!h.treat) bad.push(`${h.id}: needs a treat line`); }
    const opts = h.quiz && h.quiz.options || [];
    if (opts.length < 3 || opts.filter((o) => o[1]).length !== 1) bad.push(`${h.id}: quiz needs 3+ options with exactly one correct`);
  }
  return bad;
}
