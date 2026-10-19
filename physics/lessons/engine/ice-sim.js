/* Ice Lab: a sliding puck with a live free-body diagram and velocity graph.
   Side view for friction and push runs. Top view for balancing several forces.
   Physics is analytic (constant force, so constant acceleration); the animation only plays it back. */
(function () {
  'use strict';
  var G = 9.8;
  var SURF = [
    { id: 'sand', name: 'Sandpaper', mu: 0.50, col: '#c9a66b' },
    { id: 'wood', name: 'Wood table', mu: 0.30, col: '#b98b5a' },
    { id: 'wax', name: 'Waxed floor', mu: 0.15, col: '#d8cfa8' },
    { id: 'ice', name: 'Ice', mu: 0.03, col: '#cfe8f5' },
    { id: 'air', name: 'Air-hockey table', mu: 0.005, col: '#e6eef4' },
    { id: 'zero', name: 'Ideal (no friction)', mu: 0, col: '#f4f7fa' }
  ];

  function solve(p) {
    var TW = p.TW || 20, a = (p.F || 0) / p.m - p.mu * G, o = { a: a, f: p.mu * p.m * G };
    if (a < 0) { o.stops = true; o.tStop = p.v0 / -a; o.dist = p.v0 * p.v0 / (2 * -a); o.tEnd = p.TW ? Math.min(o.tStop, p.TW) : o.tStop; }
    else { o.stops = false; o.tEnd = TW; o.dist = p.v0 * TW + 0.5 * a * TW * TW; }
    o.vEnd = (o.stops && o.tEnd >= o.tStop) ? 0 : p.v0 + a * o.tEnd;
    return o;
  }
  function stateAt(p, s, t) {
    var tt = Math.min(t, s.tEnd), x = p.v0 * tt + 0.5 * s.a * tt * tt, v = p.v0 + s.a * tt;
    if (s.stops && t >= s.tStop) { x = s.dist; v = 0; }
    return { x: x, v: Math.max(0, v) };
  }
  function niceStep(span, n) {
    var raw = span / n, steps = [0.01, 0.02, 0.05, 0.1, 0.2, 0.5, 1, 2, 5, 10, 20, 50, 100, 200, 500];
    for (var i = 0; i < steps.length; i++) if (steps[i] >= raw) return steps[i];
    return 1000;
  }
  function cssv(n, fb) { var v = getComputedStyle(document.documentElement).getPropertyValue(n).trim(); return v || fb; }
  function reduced() { try { return window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { return false; } }

  function create(host, opts) {
    opts = opts || {};
    var box = document.createElement('div'); box.className = 'simbox'; host.appendChild(box);
    var cv = document.createElement('canvas'); cv.width = 900; cv.height = 230; cv.setAttribute('role', 'img'); cv.setAttribute('aria-label', 'Puck simulation'); box.appendChild(cv);
    var gv = document.createElement('canvas'); gv.width = 900; gv.height = 170; gv.setAttribute('role', 'img'); gv.setAttribute('aria-label', 'Velocity versus time graph'); box.appendChild(gv);
    var c = cv.getContext('2d'), g = gv.getContext('2d'), raf = 0, token = 0;

    function colors() { return { ink: getComputedStyle(document.body).color, line: cssv('--line', '#cbd6e0'), muted: cssv('--muted', '#566878'), accent: cssv('--accent', '#2b4fd9'), good: cssv('--good', '#1c7d4a'), warn: cssv('--warn', '#b3412e'), surface: cssv('--surface', '#fff') }; }
    function arrow(ctx, x1, y1, x2, y2, col, w, dash) {
      var dx = x2 - x1, dy = y2 - y1, L = Math.hypot(dx, dy); if (L < 1) return;
      ctx.save(); ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = w || 2.4; if (dash) ctx.setLineDash(dash);
      ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); ctx.setLineDash([]);
      var hl = Math.min(9, L * 0.5), ang = Math.atan2(dy, dx);
      ctx.beginPath(); ctx.moveTo(x2, y2); ctx.lineTo(x2 - hl * Math.cos(ang - 0.45), y2 - hl * Math.sin(ang - 0.45)); ctx.lineTo(x2 - hl * Math.cos(ang + 0.45), y2 - hl * Math.sin(ang + 0.45)); ctx.closePath(); ctx.fill(); ctx.restore();
    }
    function surfColor(mu) {
      var best = SURF[0]; SURF.forEach(function (s) { if (Math.abs(s.mu - mu) < Math.abs(best.mu - mu)) best = s; }); return best.col;
    }

    /* ----- graph (any list of [t, v] points) ----- */
    function drawGraph(pts, tmax, vmax, label, cur) {
      var C = colors(), W = gv.width, H = gv.height, l = 70, r = 16, tp = 22, b = 34;
      g.clearRect(0, 0, W, H); g.font = '13px sans-serif'; g.fillStyle = C.muted; g.strokeStyle = C.line; g.lineWidth = 1;
      g.fillText(label, l, 14);
      var pw = W - l - r, ph = H - tp - b;
      var sx = function (t) { return l + t / tmax * pw; }, sy = function (v) { return tp + ph - v / vmax * ph; };
      var vs = niceStep(vmax, 4), ts = niceStep(tmax, 6);
      for (var v = 0; v <= vmax + 1e-9; v += vs) { g.beginPath(); g.moveTo(l, sy(v)); g.lineTo(W - r, sy(v)); g.stroke(); g.fillStyle = C.muted; g.textAlign = 'right'; g.fillText(String(+v.toFixed(2)), l - 8, sy(v) + 4); g.textAlign = 'left'; }
      for (var t = 0; t <= tmax + 1e-9; t += ts) { g.beginPath(); g.moveTo(sx(t), tp); g.lineTo(sx(t), tp + ph); g.stroke(); g.fillStyle = C.muted; g.fillText(String(+t.toFixed(2)), sx(t) - 8, H - 18); }
      g.fillStyle = C.muted; g.fillText('time (s)', W - r - 50, H - 4); g.save(); g.translate(13, tp + ph / 2 + 22); g.rotate(-Math.PI / 2); g.fillText('v (m/s)', 0, 0); g.restore();
      if (pts.length > 1) { g.strokeStyle = C.accent; g.lineWidth = 2.6; g.beginPath(); pts.forEach(function (q, i) { if (i) g.lineTo(sx(q[0]), sy(q[1])); else g.moveTo(sx(q[0]), sy(q[1])); }); g.stroke(); }
      if (cur) { g.fillStyle = C.accent; g.beginPath(); g.arc(sx(cur[0]), sy(cur[1]), 5, 0, 6.2832); g.fill(); }
    }

    /* ----- side view ----- */
    function drawTrack(p, s, t, st, xmax, labels) {
      var C = colors(), W = cv.width, H = cv.height, pad = 46, L = W - 2 * pad - 130, gy = 186;
      c.clearRect(0, 0, W, H);
      c.fillStyle = surfColor(p.mu); c.fillRect(0, gy, W, H - gy);
      c.fillStyle = 'rgba(60,50,40,.35)';
      var n = Math.round(p.mu * 700);
      for (var i = 0; i < n; i++) { var rx = (Math.sin(i * 91.7) * 43758.5453) % 1, ry = (Math.sin(i * 12.9 + 4.1) * 24634.6345) % 1; c.fillRect(Math.abs(rx) * W, gy + 2 + Math.abs(ry) * (H - gy - 4), 2, 2); }
      c.strokeStyle = C.ink; c.lineWidth = 1.2; c.beginPath(); c.moveTo(0, gy); c.lineTo(W, gy); c.stroke();
      var step = niceStep(xmax, 6);
      c.font = '12px sans-serif'; c.fillStyle = C.ink;
      for (var m = 0; m <= xmax + 1e-9; m += step) { var X = pad + m / xmax * L; c.beginPath(); c.moveTo(X, gy); c.lineTo(X, gy + 6); c.stroke(); c.fillText(String(+m.toFixed(2)) + ' m', X - 14, gy + 20); }
      var px = pad + st.x / xmax * L;
      c.fillStyle = '#243447'; c.fillRect(px - 17, gy - 18, 34, 18); c.fillStyle = '#e6edf3'; c.fillRect(px - 17, gy - 18, 34, 3);
      if (st.v > 0.02) { var vl = Math.min(70, 14 + st.v * 10); arrow(c, px, gy - 30, px + vl, gy - 30, C.good, 2.6); c.fillStyle = C.good; c.fillText('v = ' + st.v.toFixed(2) + ' m/s', px + 2, gy - 38); }
      else { c.fillStyle = C.muted; c.fillText(t > 0 ? 'at rest' : '', px - 14, gy - 26); }
      // FBD inset
      var bx = W - 150, by = 8, bw = 142, bh = 140, cx = bx + bw / 2, cy = by + bh / 2 + 6;
      c.strokeStyle = C.line; c.lineWidth = 1; c.strokeRect(bx, by, bw, bh); c.fillStyle = C.muted; c.font = '11px sans-serif'; c.fillText('forces on the puck', bx + 6, by + 14);
      var Wt = p.m * G, mv = st.v > 0.02 || t === 0, fr = mv ? s.f : 0, F = p.F || 0, mx = Math.max(Wt, fr, F, 0.01), k = 38 / mx;
      c.fillStyle = C.ink; c.fillRect(cx - 7, cy - 5, 14, 10);
      arrow(c, cx, cy + 6, cx, cy + 6 + Wt * k, C.ink, 2.4); arrow(c, cx, cy - 6, cx, cy - 6 - Wt * k, C.ink, 2.4);
      c.fillStyle = C.ink; c.font = '11px sans-serif'; c.fillText('W ' + Wt.toFixed(2) + ' N', cx + 6, cy + 6 + Wt * k);
      c.fillText('N ' + Wt.toFixed(2) + ' N', cx + 6, cy - 8 - Wt * k);
      if (fr > 0) { arrow(c, cx - 8, cy, cx - 8 - Math.max(2, fr * k), cy, C.warn, 2.6); c.fillStyle = C.warn; c.fillText('f ' + fr.toFixed(2), bx + 4, cy - 8); }
      if (F > 0) { arrow(c, cx + 8, cy, cx + 8 + Math.max(2, F * k), cy, C.accent, 2.6); c.fillStyle = C.accent; c.fillText('F ' + F.toFixed(2), bx + bw - 54, cy - 8); }
      if (labels) { c.fillStyle = C.ink; c.font = '13px sans-serif'; c.fillText(labels, pad, 24); }
    }

    function run(p) {
      cancelAnimationFrame(raf); var my = ++token;
      var s = solve(p), end = stateAt(p, s, s.tEnd), xmax = Math.max(end.x * 1.05, 1), vmax = Math.max(p.v0, end.v) * 1.1;
      var dur = reduced() ? 250 : 3600, t0 = performance.now();
      return new Promise(function (resolve) {
        function frame(now) {
          if (my !== token) { resolve(null); return; }
          var pr = Math.min(1, (now - t0) / dur), t = pr * s.tEnd, st = stateAt(p, s, t);
          var pts = []; for (var i = 0; i <= 60; i++) { var tt = t * i / 60, q = stateAt(p, s, tt); pts.push([tt, q.v]); }
          drawTrack(p, s, t, st, xmax, s.stops ? '' : 'Time-lapse: first ' + s.tEnd + ' s');
          drawGraph(pts, s.tEnd, vmax, 'velocity vs time', [t, st.v]);
          if (opts.onFrame) opts.onFrame(t, st, s);
          if (pr < 1) raf = requestAnimationFrame(frame);
          else resolve({ stops: s.stops, tStop: s.tStop, dist: s.dist, a: s.a, f: s.f, vEnd: s.vEnd, tEnd: s.tEnd, xEnd: end.x });
        }
        raf = requestAnimationFrame(frame);
      });
    }

    function idle(p, msg) {
      cancelAnimationFrame(raf); token++;
      var s = solve(p), C = colors();
      drawTrack(p, s, 0, { x: 0, v: 0 }, 5, '');
      c.fillStyle = C.muted; c.font = '14px sans-serif'; c.fillText(msg || 'Choose settings, then press Run.', 46, 60);
      drawGraph([], 5, Math.max(p.v0, 1) * 1.1, 'velocity vs time', null);
    }

    /* ----- top view: several forces on a puck that starts at constant velocity along +x ----- */
    function topResult(p) {
      var fx = 0, fy = 0; (p.forces || []).forEach(function (f) { var a = f.ang * Math.PI / 180; fx += f.F * Math.cos(a); fy += f.F * Math.sin(a); });
      return { fx: fx, fy: fy, net: Math.hypot(fx, fy) };
    }
    function topPos(p, r, t) { var ax = r.fx / p.m, ay = r.fy / p.m; return { x: p.v0 * t + 0.5 * ax * t * t, y: 0.5 * ay * t * t, vx: p.v0 + ax * t, vy: ay * t }; }
    function drawTop(p, r, t, pathMax) {
      var C = colors(), W = cv.width, H = cv.height, T = p.T || 5;
      c.clearRect(0, 0, W, H);
      var P = topPos(p, r, T), minx = Math.min(0, P.x, topPos(p, r, T / 2).x), maxx = Math.max(p.v0 * T, P.x, 1), miny = Math.min(0, P.y, topPos(p, r, T / 2).y) - 0.3, maxy = Math.max(0, P.y, topPos(p, r, T / 2).y) + 0.3;
      var spanx = Math.max(maxx - minx, 1) * 1.15, spany = Math.max(maxy - miny, 0.6);
      var sc = Math.min((W - 220) / spanx, (H - 40) / spany), ox = 70 - minx * sc, oy = H / 2 + (maxy + miny) / 2 * sc;
      var X = function (x) { return ox + x * sc; }, Y = function (y) { return oy - y * sc; };
      c.strokeStyle = C.line; c.lineWidth = 1; c.setLineDash([5, 5]); c.beginPath(); c.moveTo(X(0), Y(0)); c.lineTo(X(p.v0 * T), Y(0)); c.stroke(); c.setLineDash([]);
      c.fillStyle = C.muted; c.font = '12px sans-serif'; c.fillText('dashed: path with no net force', X(0) + 4, Y(0) + 16);
      c.strokeStyle = C.accent; c.lineWidth = 2.6; c.beginPath();
      for (var i = 0; i <= 80; i++) { var tt = t * i / 80, q = topPos(p, r, tt); if (i) c.lineTo(X(q.x), Y(q.y)); else c.moveTo(X(q.x), Y(q.y)); } c.stroke();
      var cur = topPos(p, r, t); c.fillStyle = '#243447'; c.beginPath(); c.arc(X(cur.x), Y(cur.y), 9, 0, 6.2832); c.fill();
      var mx = 0; (p.forces || []).forEach(function (f) { mx = Math.max(mx, f.F); }); mx = Math.max(mx, r.net, 1);
      var k = 62 / mx, cx0 = X(cur.x), cy0 = Y(cur.y);
      (p.forces || []).forEach(function (f, i2) { var a = f.ang * Math.PI / 180; arrow(c, cx0, cy0, cx0 + f.F * k * Math.cos(a), cy0 - f.F * k * Math.sin(a), i2 === 0 ? C.warn : (i2 === 1 ? C.good : C.ink), 2.4); });
      if (r.net > 0.02) arrow(c, cx0, cy0, cx0 + r.fx * k, cy0 - r.fy * k, C.accent, 3, [5, 3]);
      var bx = W - 190; c.strokeStyle = C.line; c.strokeRect(bx, 8, 182, 96); c.fillStyle = C.ink; c.font = '12px sans-serif';
      c.fillText('net force: ' + r.net.toFixed(2) + ' N', bx + 8, 28); c.fillText('ΣFx = ' + r.fx.toFixed(2) + ' N', bx + 8, 48); c.fillText('ΣFy = ' + r.fy.toFixed(2) + ' N', bx + 8, 66);
      c.fillStyle = C.muted; c.fillText('speed: ' + Math.hypot(cur.vx, cur.vy).toFixed(2) + ' m/s', bx + 8, 90);
    }
    function runTop(p) {
      cancelAnimationFrame(raf); var my = ++token; var r = topResult(p), T = p.T || 5, dur = reduced() ? 250 : 3600, t0 = performance.now();
      var vmaxs = 0; for (var i = 0; i <= 40; i++) { var q = topPos(p, r, T * i / 40); vmaxs = Math.max(vmaxs, Math.hypot(q.vx, q.vy)); }
      return new Promise(function (resolve) {
        function frame(now) {
          if (my !== token) { resolve(null); return; }
          var pr = Math.min(1, (now - t0) / dur), t = pr * T; drawTop(p, r, t);
          var pts = []; for (var j = 0; j <= 50; j++) { var tt = t * j / 50, qq = topPos(p, r, tt); pts.push([tt, Math.hypot(qq.vx, qq.vy)]); }
          var cu = topPos(p, r, t); drawGraph(pts, T, Math.max(vmaxs, p.v0) * 1.2, 'speed vs time', [t, Math.hypot(cu.vx, cu.vy)]);
          if (pr < 1) raf = requestAnimationFrame(frame);
          else { var E = topPos(p, r, T); resolve({ fx: r.fx, fy: r.fy, net: r.net, vx: E.vx, vy: E.vy, speed: Math.hypot(E.vx, E.vy), sideways: Math.abs(E.y) }); }
        }
        raf = requestAnimationFrame(frame);
      });
    }
    function idleTop(p) { cancelAnimationFrame(raf); token++; var r = topResult(p); drawTop(p, r, 0); drawGraph([], p.T || 5, Math.max(p.v0, 1) * 1.4, 'speed vs time', null); }

    return { run: run, idle: idle, runTop: runTop, idleTop: idleTop, stop: function () { cancelAnimationFrame(raf); token++; } };
  }

  window.IceSim = { create: create, solve: solve, topResult: function (p) { var fx = 0, fy = 0; (p.forces || []).forEach(function (f) { var a = f.ang * Math.PI / 180; fx += f.F * Math.cos(a); fy += f.F * Math.sin(a); }); return { fx: fx, fy: fy, net: Math.hypot(fx, fy) }; }, SURF: SURF, G: G };
})();
