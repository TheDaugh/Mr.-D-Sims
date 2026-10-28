// Room logic: map parsing, walking, the PPE gate, what you are facing. No drawing here.
export function parseRoom(def) {
  const rows = def.rows, h = rows.length, w = rows[0].length;
  for (const r of rows) if (r.length !== w) throw new Error("Room rows are not all the same width");
  for (const ch of new Set(rows.join(""))) if (!def.legend[ch]) throw new Error(`No legend entry for '${ch}'`);
  const doorRow = rows.findIndex((r) => r.includes("D"));
  return { w, h, rows, legend: def.legend, start: def.start, doorRow, theme: def.theme || null };
}
export function tileAt(room, x, y) {
  return x < 0 || y < 0 || x >= room.w || y >= room.h ? null : room.legend[room.rows[y][x]];
}
const DIR = { l: [-1, 0], r: [1, 0], u: [0, -1], d: [0, 1] };
export const hasPPE = (ppe) => !!(ppe.goggles && ppe.apron);

// Move the player one tile. Returns { moved, blocked?, tile? }. The lab door needs goggles + apron.
export function step(room, p, dx, dy, ppe) {
  p.face = dx < 0 ? "l" : dx > 0 ? "r" : dy < 0 ? "u" : "d";
  const t = tileAt(room, p.x + dx, p.y + dy);
  if (!t || t.solid) return { moved: false };
  if (t.type === "door" && !hasPPE(ppe)) return { moved: false, blocked: "no_ppe" };
  p.x += dx; p.y += dy;
  return { moved: true, tile: t };
}
export function facingTile(room, p) {
  const [dx, dy] = DIR[p.face];
  return { tile: tileAt(room, p.x + dx, p.y + dy), x: p.x + dx, y: p.y + dy };
}
// Can the player reach a tile that touches (x,y)? Used by tests to prove every object can be used.
export function reachable(room, from, target, ppe) {
  const seen = new Set([from.x + "," + from.y]), q = [[from.x, from.y]];
  while (q.length) {
    const [x, y] = q.shift();
    for (const [dx, dy] of Object.values(DIR)) {
      if (x + dx === target.x && y + dy === target.y) return true;
      const p = { x, y, face: "u" }, key = (x + dx) + "," + (y + dy);
      if (seen.has(key)) continue;
      if (step(room, p, dx, dy, ppe).moved) { seen.add(key); q.push([p.x, p.y]); }
    }
  }
  return false;
}
