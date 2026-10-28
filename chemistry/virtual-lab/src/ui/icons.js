// Small pixel pictures (24x24) for hover tooltips. Drawn in code; no image files.
const ICONS = {
  balance: (R) => { R(3, 14, 18, 6, "#58606b"); R(3, 14, 18, 1, "#7b8592"); R(5, 11, 14, 3, "#c9ced6"); R(6, 16, 12, 3, "#27341f"); R(8, 17, 5, 1, "#9fe870"); },
  hotplate: (R) => { R(3, 15, 18, 5, "#3a4049"); R(4, 12, 16, 3, "#e0472c"); R(6, 11, 12, 1, "#ff9b6b"); R(16, 17, 2, 2, "#d5dae1"); },
  tester: (R) => { R(11, 10, 2, 11, "#6b7480"); R(6, 19, 12, 2, "#58606b"); R(9, 3, 6, 6, "#fff35c"); R(8, 4, 8, 4, "#fff35c"); R(10, 9, 4, 2, "#2b2f36"); R(5, 12, 1, 6, "#c0392b"); R(18, 12, 1, 6, "#2c5aa0"); },
  beaker: (R) => { R(5, 4, 2, 16, "#9db6c7"); R(17, 4, 2, 16, "#9db6c7"); R(5, 18, 14, 2, "#6f8a9d"); R(7, 11, 10, 7, "rgba(120,185,235,.8)"); R(4, 4, 3, 1, "#6f8a9d"); R(8, 7, 2, 1, "#9db6c7"); R(8, 9, 3, 1, "#9db6c7"); },
  watch: (R) => { R(3, 14, 18, 2, "#9db6c7"); R(5, 16, 14, 1, "#6f8a9d"); R(2, 13, 2, 2, "#9db6c7"); R(20, 13, 2, 2, "#9db6c7"); },
  jar: (R, c) => { R(6, 6, 12, 14, "#9db6c7"); R(7, 7, 10, 12, "#6f8a9d"); R(7, 11, 10, 8, c || "#f4f4f0"); R(5, 3, 14, 3, "#5b6470"); R(8, 12, 8, 5, "#f8f8f4"); },
  tongs: (R) => { R(6, 3, 2, 17, "#c9ced6"); R(16, 3, 2, 17, "#c9ced6"); R(6, 3, 12, 2, "#9aa4ae"); R(7, 18, 3, 3, "#c9ced6"); R(14, 18, 3, 3, "#c9ced6"); },
  goggles: (R) => { R(2, 9, 20, 3, "#2b2f36"); R(3, 8, 8, 8, "#78c8ff"); R(13, 8, 8, 8, "#78c8ff"); R(4, 9, 3, 2, "#d9f1ff"); R(14, 9, 3, 2, "#d9f1ff"); },
  apron: (R) => { R(8, 3, 8, 3, "#b9a45c"); R(6, 6, 12, 15, "#e8d9a0"); R(8, 11, 8, 4, "#d6c47e"); R(5, 6, 2, 6, "#e8d9a0"); R(17, 6, 2, 6, "#e8d9a0"); },
  locker: (R) => { R(4, 2, 16, 20, "#5f7f9f"); R(11, 2, 2, 20, "#3f5a75"); for (let i = 0; i < 3; i++) { R(6, 5 + i * 2, 4, 1, "#3f5a75"); R(14, 5 + i * 2, 4, 1, "#3f5a75"); } R(9, 12, 1, 3, "#d9dee4"); R(14, 12, 1, 3, "#d9dee4"); },
  shelf: (R, c) => { R(3, 3, 18, 18, "#8a6a47"); R(4, 4, 16, 16, "#6d5236"); R(4, 11, 16, 1, "#8a6a47"); for (let i = 0; i < 3; i++) for (let r = 0; r < 2; r++) R(6 + i * 5, 5 + r * 8, 3, 5, c || "#f4f4f0"); },
  firstaid: (R) => { R(3, 6, 18, 13, "#f4f4f0"); R(3, 6, 18, 1, "#c9c9c0"); R(11, 8, 2, 9, "#c0392b"); R(8, 11, 8, 3, "#c0392b"); },
  sink: (R) => { R(3, 10, 18, 10, "#9aa4ae"); R(5, 12, 14, 6, "#58606b"); R(5, 12, 14, 2, "#78b9eb"); R(11, 3, 2, 8, "#6b7480"); R(11, 3, 6, 2, "#6b7480"); },
  hood: (R) => { R(3, 2, 18, 20, "#a8b0b8"); R(5, 5, 14, 11, "#9db6c7"); R(5, 5, 14, 1, "#58606b"); R(5, 18, 14, 2, "#58606b"); },
  eyewash: (R) => { R(3, 3, 18, 9, "#2f9e5a"); R(11, 4, 2, 7, "#fff"); R(8, 6, 8, 2, "#fff"); R(7, 13, 4, 8, "#c9ced6"); R(13, 13, 4, 8, "#c9ced6"); },
  waste: (R) => { R(3, 6, 8, 15, "#d9822b"); R(13, 6, 8, 15, "#2c5aa0"); R(3, 6, 8, 2, "#f0a85a"); R(13, 6, 8, 2, "#5f86c7"); },
  extinguisher: (R) => { R(8, 6, 8, 15, "#c0392b"); R(10, 2, 4, 4, "#2b2f36"); R(14, 3, 5, 2, "#2b2f36"); R(8, 12, 8, 3, "#f4f4f0"); },
  door: (R) => { R(5, 2, 14, 20, "#a3804c"); R(7, 4, 10, 16, "#c9a066"); R(15, 12, 2, 2, "#3a3a3a"); R(10, 5, 4, 3, "#3ecf6a"); },
  bench: (R) => { R(2, 10, 20, 4, "#c99c6d"); R(2, 14, 20, 6, "#97704a"); R(4, 5, 5, 5, "#58606b"); R(13, 4, 4, 6, "#9db6c7"); R(18, 8, 3, 2, "#e0472c"); }
};
if (typeof window !== "undefined" && window.VLAB_HOST && window.VLAB_HOST.icons) Object.assign(ICONS, window.VLAB_HOST.icons);   // a lab from another folder adds its own pictures
const ALIAS = { tongs_rack: "tongs", first_aid: "firstaid", shelf_unknown: "shelf", shelf_liquids: "shelf", shelf_known: "shelf" };
const SHELF_COLOR = { shelf_liquids: "#78b9eb", shelf_known: "#e8e0c8", shelf_unknown: "#f4f4f0" };

export function drawIcon(canvas, id, color) {
  canvas.width = 48; canvas.height = 48;
  const ctx = canvas.getContext("2d"); ctx.setTransform(2, 0, 0, 2, 0, 0); ctx.clearRect(0, 0, 24, 24);
  const R = (x, y, w, h, c) => { ctx.fillStyle = c; ctx.fillRect(x, y, w, h); };
  const key = ALIAS[id] || id, fn = ICONS[key] || ICONS.beaker;
  fn(R, color || SHELF_COLOR[id]);
}
