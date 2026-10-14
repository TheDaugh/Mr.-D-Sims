// Isometric pixel room. Draws map + player from state; knows no chemistry.
// Grid x runs down-right on screen, grid y runs down-left. Arrow keys move along the grid axes.
import { tileAt } from "../engine/room.js";

const OX = 156, OY = 22, TX = 12, TY = 6, ZS = 1.5;   // tile half-width, half-height, height scale
const HEIGHT = { shelf: 14, locker: 18, rack: 15, first_aid: 13, sink: 8, hood: 18, eyewash: 14, waste: 9, extinguisher: 13, station: 10, door: 14 };

function shade(c, f) {
  const n = c.replace("#", ""), v = [0, 2, 4].map((i) => Math.min(255, Math.round(parseInt(n.slice(i, i + 2), 16) * f)));
  return `rgb(${v[0]},${v[1]},${v[2]})`;
}

export function createRoomRenderer(canvas, room) {
  canvas.width = 640; canvas.height = 360;
  const ctx = canvas.getContext("2d"); ctx.setTransform(2, 0, 0, 2, 0, 0);
  const P = (gx, gy, z = 0) => [Math.round(OX + (gx - gy) * TX), Math.round(OY + (gx + gy) * TY - z * ZS)];
  const R = (x, y, w, h, c) => { ctx.fillStyle = c; ctx.fillRect(Math.round(x), Math.round(y), w, h); };
  const poly = (pts, fill) => { ctx.fillStyle = fill; ctx.beginPath(); pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.closePath(); ctx.fill(); };
  const T = (s, x, y, c = "#fff") => {
    ctx.font = "bold 5px monospace"; ctx.textAlign = "center"; ctx.textBaseline = "alphabetic";
    ctx.fillStyle = "#1e2630"; ctx.fillText(s, Math.round(x) + 1, Math.round(y) + 1); ctx.fillStyle = c; ctx.fillText(s, Math.round(x), Math.round(y));
  };
  // box with top (light), +y face (mid), +x face (dark)
  function box(x, y, w, d, h, c, z = 0) {
    poly([P(x, y, z + h), P(x + w, y, z + h), P(x + w, y + d, z + h), P(x, y + d, z + h)], shade(c, 1.15));
    poly([P(x, y + d, z + h), P(x + w, y + d, z + h), P(x + w, y + d, z), P(x, y + d, z)], shade(c, 0.9));
    poly([P(x + w, y, z + h), P(x + w, y + d, z + h), P(x + w, y + d, z), P(x + w, y, z)], shade(c, 0.68));
  }
  const fl = (x0, yf, u0, u1, z0, z1, c) => poly([P(x0 + u0, yf, z1), P(x0 + u1, yf, z1), P(x0 + u1, yf, z0), P(x0 + u0, yf, z0)], c);   // patch on a +y face

  const ART = {
    wall: (x, y) => box(x, y, 1, 1, y === room.doorRow && x !== 0 ? 6 : x === 0 || y === 0 ? 18 : 2, "#7d8b99"),
    door: (x, y, s) => { box(x, y, 0.12, 1, 14, "#a3804c"); box(x + 0.88, y, 0.12, 1, 14, "#a3804c"); box(x + 0.88, y + 0.4, 0.12, 0.2, 3, s.ready ? "#3ecf6a" : "#e0472c", 14); },
    locker: (x, y) => { box(x + 0.05, y + 0.05, 0.9, 0.9, 18, "#5f7f9f"); for (let i = 0; i < 3; i++) { fl(x + 0.05, y + 0.95, 0.12, 0.38, 12 + i * 2, 13 + i * 2, "#3f5a75"); fl(x + 0.05, y + 0.95, 0.55, 0.8, 12 + i * 2, 13 + i * 2, "#3f5a75"); } fl(x + 0.05, y + 0.95, 0.42, 0.46, 6, 9, "#d9dee4"); },
    rack: (x, y, s) => { box(x + 0.1, y, 0.8, 0.2, 12, "#a07c55", 3); if (!s.tongs) for (const u of [0.25, 0.55]) { fl(x + 0.1, y + 0.2, u, u + 0.06, 5, 13, "#c9ced6"); fl(x + 0.1, y + 0.2, u + 0.12, u + 0.18, 5, 13, "#c9ced6"); } },
    first_aid: (x, y) => { box(x + 0.2, y, 0.6, 0.15, 8, "#f4f4f0", 5); fl(x + 0.2, y + 0.15, 0.27, 0.33, 6, 12, "#c0392b"); fl(x + 0.2, y + 0.15, 0.18, 0.42, 8, 10, "#c0392b"); },
    shelf: (x, y, s, t) => {
      box(x + 0.05, y, 0.9, 0.6, 14, "#8a6a47");
      const cols = t.group === "Liquids" ? ["#78b9eb", "#e6c27a", "#b5651d"] : t.group === "Known samples" ? ["#f4f4f0", "#e8e0c8", "#f0f0f0"] : ["#f4f4f0", "#f4f4f0", "#f4f4f0"];
      for (let r = 0; r < 2; r++) for (let j = 0; j < 3; j++) { fl(x + 0.05, y + 0.6, 0.12 + j * 0.28, 0.12 + j * 0.28 + 0.16, 2 + r * 6, 6 + r * 6, cols[(j + r) % 3]); fl(x + 0.05, y + 0.6, 0.12 + j * 0.28, 0.12 + j * 0.28 + 0.16, 6 + r * 6, 7 + r * 6, "#5b6470"); }
    },
    sink: (x, y) => { box(x, y, 1, 0.8, 8, "#9aa4ae"); poly([P(x + 0.15, y + 0.15, 8), P(x + 0.85, y + 0.15, 8), P(x + 0.85, y + 0.65, 8), P(x + 0.15, y + 0.65, 8)], "#58606b"); poly([P(x + 0.25, y + 0.25, 8), P(x + 0.75, y + 0.25, 8), P(x + 0.75, y + 0.55, 8), P(x + 0.25, y + 0.55, 8)], "#78b9eb"); box(x + 0.45, y + 0.05, 0.1, 0.1, 6, "#6b7480", 8); },
    hood: (x, y) => { box(x, y, 1, 0.9, 18, "#a8b0b8"); fl(x, y + 0.9, 0.1, 0.9, 6, 14, "#9db6c7"); },
    eyewash: (x, y) => { box(x + 0.35, y + 0.35, 0.3, 0.3, 8, "#c9ced6"); box(x + 0.15, y + 0.1, 0.7, 0.1, 8, "#2f9e5a", 8); fl(x + 0.15, y + 0.2, 0.4, 0.46, 9, 15, "#fff"); fl(x + 0.15, y + 0.2, 0.3, 0.56, 11, 13, "#fff"); },
    waste: (x, y) => { box(x + 0.05, y + 0.2, 0.4, 0.6, 9, "#d9822b"); box(x + 0.5, y + 0.2, 0.45, 0.6, 9, "#2c5aa0"); },
    extinguisher: (x, y) => { box(x + 0.3, y + 0.3, 0.4, 0.4, 10, "#c0392b"); box(x + 0.4, y + 0.4, 0.2, 0.2, 3, "#2b2f36", 10); },
    station: (x, y) => {
      box(x, y, 1, 1, 8, "#b98b5e");
      let i = 0; while (tileAt(room, x - 1 - i, y)?.id === "bench") i++;
      if (i === 0) { box(x + 0.1, y + 0.2, 0.8, 0.6, 2, "#58606b", 8); fl(x + 0.1, y + 0.8, 0.2, 0.7, 8.5, 9.5, "#27341f"); }
      if (i === 2 || i === 3) box(x + 0.3, y + 0.3, 0.4, 0.4, 6, "#9db6c7", 8);
      if (i === 5) { box(x + 0.1, y + 0.1, 0.8, 0.8, 2, "#3a4049", 8); poly([P(x + 0.2, y + 0.2, 10), P(x + 0.8, y + 0.2, 10), P(x + 0.8, y + 0.8, 10), P(x + 0.2, y + 0.8, 10)], "#e0472c"); }
    }
  };
  const artKey = (t) => (t.type === "info" ? t.id : t.type);

  let ax = room.start.x, ay = room.start.y, lastT = 0;
  function player(p, ppe) {
    const [cx, cy] = P(ax + 0.5, ay + 0.5), fr = p.face === "d" || p.face === "r", bx = 0, by = 0;
    ctx.save(); ctx.translate(cx, cy); ctx.scale(1.25, 1.25);
    R(bx - 4, by - 1, 8, 2, "rgba(0,0,0,.2)");
    R(bx - 2, by - 4, 2, 4, "#2b3a55"); R(bx, by - 4, 2, 4, "#2b3a55");
    R(bx - 3, by - 10, 6, 6, "#f4f4f0");
    if (ppe.apron) { R(bx - 2, by - 9, 4, 5, "#e8d9a0"); R(bx - 2, by - 9, 4, 1, "#b9a45c"); }
    R(bx - 2, by - 15, 4, 5, "#e2b48c");
    R(bx - 2, by - 15, 4, fr ? 2 : 4, "#4a3020");
    if (fr) { R(bx - 1, by - 12, 1, 1, "#1e2630"); R(bx + 1, by - 12, 1, 1, "#1e2630"); }
    if (ppe.goggles && fr) R(bx - 2, by - 13, 4, 2, "rgba(120,200,255,.8)");
    if (ppe.tongs) R(bx + (p.face === "l" || p.face === "u" ? -4 : 3), by - 9, 1, 6, "#c9ced6");
    ctx.restore();
  }

  return {
    screen: (gx, gy, z = 0) => P(gx, gy, z),
    draw(p, ppe, ready, facing, t) {
      const dt = Math.min(0.1, t - lastT); lastT = t;
      const k = Math.min(1, dt * 16); ax += (p.x - ax) * k; ay += (p.y - ay) * k;
      R(0, 0, 320, 180, "#2b3440");
      for (let y = 0; y < room.h; y++) for (let x = 0; x < room.w; x++) {
        const lab = y < room.doorRow, thresh = tileAt(room, x, y).type === "door";
        poly([P(x, y), P(x + 1, y), P(x + 1, y + 1), P(x, y + 1)], thresh ? "#c9a066" : ((x + y) & 1) ? (lab ? "#dfe6ea" : "#e6dfd0") : (lab ? "#d3dce2" : "#ddd5c3"));
      }
      const s = { ready, tongs: ppe.tongs }, pd = Math.round(ax + ay);
      let drawn = false;
      for (let d = 0; d <= room.w + room.h - 2; d++) {
        for (let x = 0; x < room.w; x++) {
          const y = d - x; if (y < 0 || y >= room.h) continue;
          const tile = tileAt(room, x, y);
          if (tile.type !== "floor") ART[tile.type === "info" ? artKey(tile) : tile.type](x, y, s, tile);
        }
        if (d === pd) { player(p, ppe); drawn = true; }
      }
      if (!drawn) player(p, ppe);
      for (let y = 0; y < room.h; y++) for (let x = 0; x < room.w; x++) {
        const tile = tileAt(room, x, y);
        if (!tile.label || (tile.type === "station" && tileAt(room, x - 1, y)?.id === tile.id)) continue;
        const [lx, ly] = P(x + 0.5, y + 0.5, (HEIGHT[artKey(tile)] || 8) + 4);
        T(tile.label, lx, ly);
      }
      if (facing && facing.tile && facing.tile.id) {
        const [bx, by] = P(facing.x + 0.5, facing.y + 0.5, (HEIGHT[artKey(facing.tile)] || 8) + 12);
        R(bx - 5, by - 9, 10, 9, "#ffd23f"); R(bx - 1, by, 2, 2, "#ffd23f"); T("E", bx, by - 2, "#1e2630");
      }
    },
    // Screen point (logical 320x180) -> grid tile. Tall objects are found by looking down from their height.
    tileFromPoint(px, py) {
      for (const z of [18, 12, 6, 0]) {
        const u = (px - OX) / TX, v = (py + z * ZS - OY) / TY, x = Math.floor((u + v) / 2), y = Math.floor((v - u) / 2), t = tileAt(room, x, y);
        if (t && t.id && (HEIGHT[artKey(t)] || 0) >= z) return { x, y };
      }
      const u = (px - OX) / TX, v = (py - OY) / TY;
      return { x: Math.floor((u + v) / 2), y: Math.floor((v - u) / 2) };
    }
  };
}
