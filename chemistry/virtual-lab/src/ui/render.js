// Pixel-art bench. The canvas is 320x180 "pixels" and is scaled up with image-rendering: pixelated.
// This file only draws a view model; it knows no chemistry.
export const W = 320, H = 180;

const COL = {
  wall: "#cfd9e1", wallLine: "#b9c6d1", shelf: "#8a6a47", shelfDark: "#6d5236",
  bench: "#b98b5e", benchDark: "#97704a", benchLight: "#c99c6d",
  glass: "#9db6c7", glassDark: "#6f8a9d", steel: "#58606b", steelDark: "#3a4049", lid: "#5b6470",
  label: "#f8f8f4", ink: "#1e2630", sel: "#ffd23f", lcd: "#27341f", lcdText: "#9fe870"
};

export const SLOTS = {
  balance: { x: 44, y: 154 },
  hotplate: { x: 233, y: 157 },
  bench: [{ x: 100, y: 166 }, { x: 135, y: 166 }, { x: 170, y: 166 }]
};
const JAR_X = (i) => 12 + i * 43;
const SHELF_BASE = [34, 72];

export function createRenderer(canvas) {
  canvas.width = W * 2; canvas.height = H * 2;   // 2x backing store: crisp text, blocky shapes
  const ctx = canvas.getContext("2d");
  ctx.setTransform(2, 0, 0, 2, 0, 0);
  let regions = [];

  const R = (x, y, w, h, c) => { ctx.fillStyle = c; ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); };
  const T = (s, x, y, c, size = 5, align = "left") => {
    ctx.fillStyle = c; ctx.font = `bold ${size}px monospace`; ctx.textAlign = align; ctx.textBaseline = "alphabetic";
    ctx.fillText(s, Math.round(x), Math.round(y));
  };
  const disc = (cx, cy, r, c) => {
    ctx.fillStyle = c;
    for (let dy = -r; dy <= r; dy++) { const dx = Math.floor(Math.sqrt(r * r - dy * dy)); ctx.fillRect(cx - dx, cy + dy, dx * 2 + 1, 1); }
  };

  function room() {
    R(0, 0, W, 100, COL.wall);
    for (let y = 8; y < 100; y += 16) R(0, y, W, 1, COL.wallLine);
    R(0, 100, W, 80, COL.bench); R(0, 100, W, 2, COL.benchLight); R(0, 170, W, 10, COL.benchDark);
    for (let x = 0; x < W; x += 40) R(x, 102, 1, 68, COL.benchDark);
  }

  function shelves(view) {
    SHELF_BASE.forEach((b) => { R(4, b, W - 8, 3, COL.shelf); R(4, b + 3, W - 8, 1, COL.shelfDark); });
    for (const s of view.sources) {
      const x = JAR_X(s.idx), base = SHELF_BASE[s.shelf];
      R(x, base - 22, 20, 22, COL.glass);
      R(x + 1, base - 21, 18, 20, COL.glassDark);
      const fillTop = s.phase === "l" ? base - 19 : base - 14;
      R(x + 2, fillTop, 16, base - 2 - fillTop, s.color);
      R(x - 1, base - 26, 22, 4, COL.lid);
      R(x + 3, base - 15, 14, 9, COL.label);
      if (s.short.length === 1) T(s.short, x + 10, base - 8, COL.ink, 8, "center");
      else R(x + 5, base - 12, 10, 3, s.color === "#f4f4f0" ? "#c9c9c0" : s.color);
      T(s.short, x + 10, base + 10, "#33414d", 6, "center");
      if (view.selectedSource === s.key) {
        R(x - 3, base - 29, 26, 1, COL.sel); R(x - 3, base + 1, 26, 1, COL.sel);
        R(x - 3, base - 29, 1, 30, COL.sel); R(x + 22, base - 29, 1, 30, COL.sel);
      }
      regions.push({ type: "source", key: s.key, x: x - 3, y: base - 29, w: 26, h: 31 });
    }
  }

  function stations(view, t) {
    // balance
    R(10, 160, 68, 10, COL.steel); R(10, 160, 68, 1, "#7b8592"); R(20, 155, 48, 3, "#c9ced6");
    R(24, 162, 40, 6, COL.lcd); T(view.balanceText, 44, 167, COL.lcdText, 5, "center");
    // hot plate
    R(198, 160, 70, 10, COL.steelDark);
    R(204, 157, 58, 3, view.plateOn ? "#e0472c" : "#565c66");
    if (view.plateOn) { R(206, 156, 54, 1, "#ff9b6b"); }
    T(view.plateOn ? `${view.plateC}°C` : "OFF", 233, 168, "#d5dae1", 5, "center");
    // conductivity tester
    R(295, 146, 3, 24, "#6b7480"); R(288, 168, 17, 3, COL.steel);
    const glow = view.bulb === "bright" ? "#fff35c" : view.bulb === "dim" ? "#b9a24e" : "#4d535c";
    if (view.bulb === "bright") { disc(296, 134, 10, "rgba(255,243,92,.25)"); }
    disc(296, 134, 6, glow);
    R(293, 141, 7, 3, "#2b2f36");
    R(288, 146, 1, 8, "#c0392b"); R(304, 146, 1, 8, "#2c5aa0");
    T("TESTER", 296, 178, "#4a3624", 5, "center");
    T("BALANCE", 44, 178, "#4a3624", 5, "center");
    T("HOT PLATE", 233, 178, "#4a3624", 5, "center");
  }

  function pile(cx, base, c) {
    if (!c.pile) return;
    const { h, color } = c.pile;
    R(cx - 7, base - h, 14, h, color);
    if (h > 2) R(cx - 4, base - h - 1, 8, 1, color);
  }

  function beaker(c, t) {
    const x0 = c.x - 13, top = c.y - 32, base = c.y;
    const lh = c.liquidMl > 0 ? Math.round(3 + 22 * Math.sqrt(Math.min(1, c.liquidMl / c.cap))) : 0;
    if (lh) { R(x0 + 2, base - 2 - lh, 22, lh, c.liquidColor); R(x0 + 2, base - 2 - lh, 22, 1, "rgba(255,255,255,.55)"); }
    pile(c.x, base - 2, c);
    R(x0, top, 2, 32, COL.glass); R(x0 + 24, top, 2, 32, COL.glass); R(x0, base - 2, 26, 2, COL.glassDark);
    R(x0 - 1, top, 3, 1, COL.glassDark); R(x0 + 24, top, 3, 1, COL.glassDark);
    if (c.fizz > 0.02 && lh) {
      const n = Math.ceil(c.fizz * 10);
      for (let i = 0; i < n; i++) {
        const bx = x0 + 3 + ((i * 7 + Math.floor(t * 9) * 3) % 20);
        const by = base - 3 - ((t * 28 + i * 11) % (lh + 6));
        R(bx, by, 1, 1, "#ffffff"); if (i % 3 === 0) R(bx + 1, by, 1, 1, "#ffffff");
      }
    }
    if (c.steam) for (let i = 0; i < 5; i++) R(x0 + 4 + i * 4, top - 3 - ((t * 10 + i * 5) % 8), 2, 2, "rgba(255,255,255,.8)");
    return { x: x0 - 2, y: top - 8, w: 30, h: 42 };
  }

  function watch(c) {
    const x0 = c.x - 16, base = c.y;
    pile(c.x, base - 2, c);
    R(x0 + 2, base - 2, 28, 2, COL.glassDark); R(x0, base - 4, 3, 2, COL.glass); R(x0 + 29, base - 4, 3, 2, COL.glass);
    R(x0 + 3, base - 3, 26, 1, COL.glass);
    return { x: x0 - 2, y: base - 20, w: 36, h: 24 };
  }

  function containers(view, t) {
    for (const c of view.containers) {
      const box = c.kind === "beaker" ? beaker(c, t) : watch(c);
      T(c.label, box.x + 3, box.y + 6, COL.ink, 5);
      if (c.T > 35) T(`${Math.round(c.T)}°`, box.x + box.w - 2, box.y + 6, c.T > 60 ? "#b3261e" : COL.ink, 5, "right");
      if (c.selected) {
        const { x, y, w, h } = box;
        R(x, y, w, 1, COL.sel); R(x, y + h, w, 1, COL.sel); R(x, y, 1, h, COL.sel); R(x + w - 1, y, 1, h, COL.sel);
      }
      regions.push({ type: "container", key: c.key, ...box });
    }
  }

  return {
    draw(view, t) {
      regions = [];
      room(); shelves(view); stations(view, t); containers(view, t);
    },
    hit(px, py) {
      for (let i = regions.length - 1; i >= 0; i--) {
        const r = regions[i];
        if (px >= r.x && px <= r.x + r.w && py >= r.y && py <= r.y + r.h) return r;
      }
      return null;
    }
  };
}
