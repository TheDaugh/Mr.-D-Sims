// Top-down pixel room. Draws map + player from state; knows no chemistry.
import { tileAt } from "../engine/room.js";
export const TILE = 16, OY = 2;

export function createRoomRenderer(canvas, room) {
  canvas.width = 640; canvas.height = 360;
  const ctx = canvas.getContext("2d"); ctx.setTransform(2, 0, 0, 2, 0, 0);
  const R = (x, y, w, h, c) => { ctx.fillStyle = c; ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); };
  const T = (s, x, y, c, align = "center") => {
    ctx.font = "bold 5px monospace"; ctx.textAlign = align; ctx.textBaseline = "alphabetic";
    ctx.fillStyle = "#1e2630"; ctx.fillText(s, Math.round(x) + 1, Math.round(y) + 1);
    ctx.fillStyle = c; ctx.fillText(s, Math.round(x), Math.round(y));
  };
  let ax = room.start.x, ay = room.start.y, lastT = 0;

  const ART = {
    wall: (x, y, px, py) => { R(px, py, 16, 16, "#7d8b99"); R(px, py, 16, 2, "#9aa8b5"); R(px, py + 8, 16, 1, "#6a7784"); R(px + (y % 2 ? 4 : 12), py, 1, 8, "#6a7784"); R(px + (y % 2 ? 12 : 4), py + 9, 1, 7, "#6a7784"); },
    door: (x, y, px, py, s) => { R(px, py, 16, 16, "#6a7784"); R(px + 2, py, 12, 16, "#c9a066"); R(px + 2, py, 12, 2, "#a3804c"); R(px + 11, py + 8, 2, 2, "#3a3a3a"); R(px + 6, py + 3, 4, 4, s.ready ? "#3ecf6a" : "#e0472c"); },
    locker: (x, y, px, py) => { R(px, py, 16, 16, "#5f7f9f"); R(px, py, 16, 2, "#7d9bb8"); R(px + 7, py, 2, 16, "#3f5a75"); for (let i = 0; i < 3; i++) { R(px + 2, py + 3 + i * 2, 4, 1, "#3f5a75"); R(px + 10, py + 3 + i * 2, 4, 1, "#3f5a75"); } R(px + 5, py + 9, 1, 2, "#d9dee4"); R(px + 10, py + 9, 1, 2, "#d9dee4"); },
    rack: (x, y, px, py, s) => { R(px, py, 16, 16, "#8a6a47"); R(px + 1, py + 1, 14, 14, "#a07c55"); if (!s.tongs) for (const dx of [4, 9]) { R(px + dx, py + 3, 1, 9, "#c9ced6"); R(px + dx + 2, py + 3, 1, 9, "#c9ced6"); R(px + dx, py + 3, 3, 1, "#c9ced6"); } },
    info: (x, y, px, py, s, t) => ARTINFO[t.id](px, py),
    shelf: (x, y, px, py, s, t) => { R(px, py, 16, 16, "#8a6a47"); R(px + 1, py + 1, 14, 14, "#6d5236"); const cols = t.group === "Liquids" ? ["#78b9eb", "#e6c27a", "#b5651d"] : t.group === "Known samples" ? ["#f4f4f0", "#e8e0c8", "#f0f0f0"] : ["#f4f4f0", "#f4f4f0", "#f4f4f0"]; for (let r = 0; r < 2; r++) { R(px + 1, py + 7 + r * 7, 14, 1, "#8a6a47"); for (let i = 0; i < 3; i++) { R(px + 2 + i * 4, py + 2 + r * 7, 3, 5, cols[(i + r) % 3]); R(px + 2 + i * 4, py + 1 + r * 7, 3, 1, "#5b6470"); } } if (t.group === "Unknown samples") T("?", px + 8, py + 13, "#ffd23f"); },
    station: (x, y, px, py) => {
      R(px, py + 4, 16, 12, "#b98b5e"); R(px, py + 4, 16, 2, "#c99c6d"); R(px, py + 13, 16, 3, "#97704a");
      if (x === 5) { R(px + 2, py + 1, 12, 4, "#58606b"); R(px + 4, py, 8, 1, "#c9ced6"); }
      if (x === 7 || x === 8) { R(px + 4, py - 3, 8, 7, "rgba(157,182,199,.85)"); R(px + 4, py + 2, 8, 2, "#78b9eb"); }
      if (x === 10) { R(px + 2, py + 2, 12, 2, "#e0472c"); R(px + 1, py + 4, 14, 1, "#3a4049"); }
    },
    floor: (x, y, px, py) => { const lab = y < room.doorRow; R(px, py, 16, 16, ((x + y) & 1) ? (lab ? "#dfe6ea" : "#e6dfd0") : (lab ? "#d3dce2" : "#ddd5c3")); }
  };
  const ARTINFO = {
    first_aid: (px, py) => { R(px + 2, py + 3, 12, 10, "#f4f4f0"); R(px + 7, py + 5, 2, 6, "#c0392b"); R(px + 5, py + 7, 6, 2, "#c0392b"); },
    sink: (px, py) => { R(px, py + 5, 16, 11, "#9aa4ae"); R(px + 2, py + 7, 12, 6, "#58606b"); R(px + 2, py + 7, 12, 2, "#78b9eb"); R(px + 7, py + 1, 2, 5, "#6b7480"); R(px + 7, py + 1, 5, 1, "#6b7480"); },
    hood: (px, py) => { R(px, py, 16, 16, "#a8b0b8"); R(px + 2, py + 3, 12, 8, "rgba(157,182,199,.9)"); R(px + 2, py + 3, 12, 1, "#58606b"); R(px + 2, py + 12, 12, 2, "#58606b"); },
    eyewash: (px, py) => { R(px + 1, py + 1, 14, 8, "#2f9e5a"); R(px + 7, py + 2, 2, 6, "#fff"); R(px + 5, py + 4, 6, 2, "#fff"); R(px + 4, py + 9, 3, 6, "#c9ced6"); R(px + 9, py + 9, 3, 6, "#c9ced6"); },
    waste: (px, py) => { R(px + 1, py + 3, 6, 12, "#d9822b"); R(px + 8, py + 3, 7, 12, "#2c5aa0"); R(px + 1, py + 3, 6, 2, "#f0a85a"); R(px + 8, py + 3, 7, 2, "#5f86c7"); },
    extinguisher: (px, py) => { R(px + 5, py + 3, 6, 12, "#c0392b"); R(px + 6, py, 4, 3, "#2b2f36"); R(px + 10, py + 1, 3, 1, "#2b2f36"); R(px + 5, py + 8, 6, 2, "#f4f4f0"); }
  };

  function player(px, py, p, ppe) {
    R(px + 4, py + 14, 8, 2, "rgba(0,0,0,.18)");
    R(px + 5, py + 11, 2, 4, "#2b3a55"); R(px + 9, py + 11, 2, 4, "#2b3a55");
    R(px + 4, py + 5, 8, 7, "#f4f4f0");                       // lab coat
    if (ppe.apron) { R(px + 5, py + 6, 6, 6, "#e8d9a0"); R(px + 5, py + 6, 6, 1, "#b9a45c"); }
    R(px + 3, py + 6, 1, 4, "#f4f4f0"); R(px + 12, py + 6, 1, 4, "#f4f4f0");
    R(px + 5, py + 0, 6, 6, "#e2b48c");                       // head
    if (p.face === "u") R(px + 5, py, 6, 4, "#4a3020"); else { R(px + 5, py, 6, 2, "#4a3020"); if (p.face === "d") { R(px + 6, py + 3, 1, 1, "#1e2630"); R(px + 9, py + 3, 1, 1, "#1e2630"); } else R(px + (p.face === "l" ? 6 : 9), py + 3, 1, 1, "#1e2630"); }
    if (ppe.goggles && p.face !== "u") R(px + 5, py + 2, 6, 3, "rgba(120,200,255,.75)");
    if (ppe.tongs) R(px + (p.face === "l" ? 1 : 13), py + 7, 1, 6, "#c9ced6");
  }

  return {
    draw(p, ppe, ready, facing, t) {
      const dt = Math.min(0.1, t - lastT); lastT = t;
      const k = Math.min(1, dt * 16); ax += (p.x - ax) * k; ay += (p.y - ay) * k;
      R(0, 0, 320, 180, "#2b3440");
      const s = { ready, tongs: ppe.tongs };
      for (let y = 0; y < room.h; y++) for (let x = 0; x < room.w; x++) {
        const tile = tileAt(room, x, y), px = x * TILE, py = y * TILE + OY;
        ART.floor(x, y, px, py);
        if (tile.type !== "floor") ART[tile.type](x, y, px, py, s, tile);
      }
      for (let y = 0; y < room.h; y++) for (let x = 0; x < room.w; x++) {
        const tile = tileAt(room, x, y);
        if (tile.label && !(tile.type === "station" && tileAt(room, x - 1, y)?.id === tile.id)) T(tile.label, x * TILE + (tile.type === "station" ? 0 : 8), y * TILE + OY + (tile.type === "shelf" || tile.type === "info" && y === 1 ? -3 : tile.type === "station" ? 3 : -2), "#ffffff", tile.type === "station" ? "left" : "center");
      }
      player(Math.round(ax * TILE), Math.round(ay * TILE) + OY - 2, p, ppe);
      if (facing && facing.tile && facing.tile.id) {
        const bx = facing.x * TILE + 8, by = facing.y * TILE + OY + 2;
        R(bx - 5, by - 12, 10, 9, "#ffd23f"); R(bx - 1, by - 3, 2, 2, "#ffd23f"); T("E", bx, by - 5, "#1e2630");
      }
    },
    tileFromPoint(px, py) { return { x: Math.floor(px / TILE), y: Math.floor((py - OY) / TILE) }; }
  };
}
