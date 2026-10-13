// Microscope window: a fixed zoomed-in picture of ONE container, drawn from the engine's real state.
const W = 320, H = 180, FLOOR = H - 10, SURFACE = 34;

export function createMicroView(canvas, legendBox) {
  canvas.width = W * 3; canvas.height = H * 3;
  const ctx = canvas.getContext("2d"); ctx.setTransform(3, 0, 0, 3, 0, 0);
  let parts = [], water = [], bubbles = [], model = null, getModel = null, title = "", raf = 0, last = 0, modelAt = 0, running = false;
  const rnd = (a, b) => a + Math.random() * (b - a);
  const R = (x, y, w, hh, c) => { ctx.fillStyle = c; ctx.fillRect(Math.round(x), Math.round(y), w, hh); };
  const dot = (x, y, r, c) => { ctx.fillStyle = c; ctx.beginPath(); ctx.arc(Math.round(x), Math.round(y), r, 0, 7); ctx.fill(); };

  function sync() {
    const want = {};
    for (const d of model.dissolved) want[d.label] = d;
    for (const key of Object.keys(want)) {
      const d = want[key], have = parts.filter((p) => p.key === key);
      for (let i = have.length; i < d.count; i++) parts.push({ key, shape: d.shape, color: d.color, label: d.label, x: rnd(14, W - 14), y: rnd(SURFACE + 8, FLOOR - 14), a: rnd(0, 6.3), ang: rnd(0, 6.3) });
      have.slice(d.count).forEach((p) => parts.splice(parts.indexOf(p), 1));
    }
    parts = parts.filter((p) => want[p.key]);
    const nw = model.water ? 46 : 0;
    while (water.length < nw) water.push({ x: rnd(8, W - 8), y: rnd(SURFACE + 4, FLOOR - 4), a: rnd(0, 6.3) });
    water.length = Math.min(water.length, nw);
  }
  function move(p, dt, speed, inLiquid) {
    p.a += rnd(-1.4, 1.4) * dt * 3; p.x += Math.cos(p.a) * speed * dt; p.y += Math.sin(p.a) * speed * dt; p.ang += dt * 2;
    const top = inLiquid ? SURFACE + 5 : 6;
    if (p.x < 8) { p.x = 8; p.a = Math.PI - p.a; } if (p.x > W - 8) { p.x = W - 8; p.a = Math.PI - p.a; }
    if (p.y < top) { p.y = top; p.a = -p.a; } if (p.y > FLOOR - 6) { p.y = FLOOR - 6; p.a = -p.a; }
  }
  function drawLattice(l, x0, jit) {
    const n = l.size, cols = n + 2, cell = 6;
    for (let r = 0; r < n; r++) for (let c = 0; c < cols; c++) {
      const x = x0 + c * cell + (Math.random() - 0.5) * jit, y = FLOOR - (r + 1) * cell + (Math.random() - 0.5) * jit;
      if (l.kind === "ionic") { dot(x + 3, y + 3, 2.6, l.ions[(r + c) % 2].color); }
      else if (l.kind === "polymer") { ctx.strokeStyle = l.color; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(x, y + 3); ctx.quadraticCurveTo(x + 3, y + (c % 2 ? -1 : 7), x + 6, y + 3); ctx.stroke(); }
      else { dot(x + 3, y + 3, 2.4, l.color); dot(x + 5, y + 4, 1.4, l.color); }
    }
    return cols * cell + 10;
  }
  function drawPart(p) {
    if (p.shape === "ion") { dot(p.x, p.y, 3.4, p.color); ctx.fillStyle = "#fff"; ctx.font = "bold 4px monospace"; ctx.textAlign = "center"; ctx.fillText(/⁺/.test(p.label) || p.label[0] === "+" ? "+" : "−", Math.round(p.x), Math.round(p.y) + 1.5); }
    else if (p.shape === "chain") { ctx.strokeStyle = p.color; ctx.lineWidth = 1.8; ctx.beginPath(); for (let i = 0; i < 6; i++) { const x = p.x - 7 + i * 3, y = p.y + Math.sin(p.ang + i) * 2; i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.stroke(); }
    else { dot(p.x, p.y, 2.4, p.color); dot(p.x + Math.cos(p.ang) * 3.4, p.y + Math.sin(p.ang) * 3.4, 1.6, p.color); dot(p.x + Math.cos(p.ang + 2.3) * 3.4, p.y + Math.sin(p.ang + 2.3) * 3.4, 1.6, p.color); }
  }
  // Phase view for the heating lab: solid particles jiggle in place, liquid ones slide in a pool, gas ones fly free.
  let pp = null;
  function drawPhase(dt) {
    const { fm, fv } = model.phase, k = Math.sqrt((model.T + 273) / 300), n = 60;
    if (!pp) pp = Array.from({ length: n }, (_, i) => ({ r: Math.random(), hx: 40 + (i % 12) * 20, hy: FLOOR - 12 - Math.floor(i / 12) * 15, x: 0, y: 0, a: rnd(0, 6.3), m: 0, ph: rnd(0, 6.3), w: rnd(4, 8) }));
    R(0, 0, W, H, "#10202e"); R(6, 14, 2, FLOOR - 4, "#9db6c7"); R(W - 8, 14, 2, FLOOR - 4, "#9db6c7"); R(6, FLOOR + 2, W - 12, 3, "#9db6c7");
    const t = performance.now() / 1000;
    for (const p of pp) {
      const mode = p.r < fv ? 2 : p.r < fm ? 1 : 0;
      if (mode === 0) { const A = 0.7 + 1.5 * k; p.x = p.hx + A * Math.sin(t * p.w + p.ph); p.y = p.hy + A * Math.cos(t * p.w * 0.9 + p.ph); }
      else {
        if (p.m !== mode) { if (p.m === 0) { p.x = p.hx; p.y = p.hy; } p.m = mode; }
        p.a += rnd(-1.4, 1.4) * dt * 3; const v = (mode === 1 ? 16 : 60) * k; p.x += Math.cos(p.a) * v * dt; p.y += Math.sin(p.a) * v * dt;
        const top = mode === 1 ? FLOOR - 75 : 8;
        if (p.x < 12) { p.x = 12; p.a = Math.PI - p.a; } if (p.x > W - 12) { p.x = W - 12; p.a = Math.PI - p.a; } if (p.y < top) { p.y = top; p.a = -p.a; } if (p.y > FLOOR - 6) { p.y = FLOOR - 6; p.a = -p.a; }
      }
      dot(p.x, p.y, 3.2, mode === 2 ? "#ffc16b" : mode === 1 ? "#7fb3ff" : "#b9c8ff"); dot(p.x + 1, p.y - 1, 1, "rgba(255,255,255,.55)");
    }
    ctx.fillStyle = "#cfe3f2"; ctx.font = "bold 6px monospace"; ctx.textAlign = "left"; ctx.fillText(`${title}  ·  zoom about 100,000,000×  ·  only a few of the billions of particles`, 10, 9);
  }
  function frame(now) {
    if (!running) return;
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    if (now - modelAt > 250 || !model) { model = getModel(); modelAt = now; sync(); legendBox(model); }
    if (model.phase) { drawPhase(dt); raf = requestAnimationFrame(frame); return; }
    const speed = 14 * Math.sqrt((model.T + 273) / 295), jit = Math.min(1.6, Math.max(0.15, (model.T - 20) / 60));
    R(0, 0, W, H, "#10202e");
    if (model.water) { R(8, SURFACE, W - 16, FLOOR - SURFACE, "rgba(120,185,235,.22)"); R(8, SURFACE, W - 16, 1, "rgba(255,255,255,.5)"); }
    R(6, 14, 2, FLOOR - 4, "#9db6c7"); R(W - 8, 14, 2, FLOOR - 4, "#9db6c7"); R(6, FLOOR + 2, W - 12, 3, "#9db6c7");
    for (const w of water) { move(w, dt, speed * 0.9, true); R(w.x, w.y, 1, 1, "#a9d6f5"); R(w.x + 1, w.y + 1, 1, 1, "#78b9eb"); R(w.x - 1, w.y + 1, 1, 1, "#78b9eb"); }
    let x0 = 14; for (const l of model.lattice) x0 += drawLattice(l, x0, jit);
    for (const p of parts) { move(p, dt, speed, model.water); drawPart(p); }
    const want = model.gas.length ? model.gas[0].count : 0;
    if (bubbles.length < want * 2 && Math.random() < 0.5) bubbles.push({ x: rnd(20, W - 20), y: FLOOR - 8, v: rnd(18, 36) });
    bubbles = bubbles.filter((b) => b.y > -4);
    for (const b of bubbles) { b.y -= b.v * dt; b.x += Math.sin(b.y / 6) * 0.3; dot(b.x - 3, b.y, 1.6, "#d86a6a"); dot(b.x, b.y, 1.8, "#555b66"); dot(b.x + 3, b.y, 1.6, "#d86a6a"); }
    if (!model.water && !model.lattice.length) { ctx.fillStyle = "#9fb3c4"; ctx.font = "bold 7px monospace"; ctx.textAlign = "center"; ctx.fillText("Empty container: only air", W / 2, H / 2); }
    ctx.fillStyle = "#cfe3f2"; ctx.font = "bold 6px monospace"; ctx.textAlign = "left"; ctx.fillText(`${title}  ·  zoom about 100,000,000×  ·  not to scale`, 10, 9);
    raf = requestAnimationFrame(frame);
  }
  return {
    open(getter, name) { getModel = getter; title = name; parts = []; water = []; bubbles = []; model = null; pp = null; running = true; last = performance.now(); cancelAnimationFrame(raf); raf = requestAnimationFrame(frame); },
    close() { running = false; cancelAnimationFrame(raf); }
  };
}
