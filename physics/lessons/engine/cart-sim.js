/* Fan Cart Lab: a cart on a track, pushed by a fan or pulled by a hanging mass.
   The scene shows the cart, a motion map (a dot every 0.5 s), a live free-body diagram and a velocity graph.
   Physics is analytic (constant force, so constant acceleration); the animation only plays it back.

     CartSim.create(host)   -> { run(p), idle(p, msg), stop() }
     CartSim.solve(p)       -> { a, Fnet, Fapp, f, tension, mtot, vEnd, xEnd, stuck, ... }
     CartSim.plot(host, o)  -> { draw(points, line) }   a small scatter plot for the students' own data

   p = { m: cart mass (kg), F: fan force (N), mh: hanging mass (kg, replaces the fan), mu: friction coefficient (0 = smooth),
         T: run time (s, default 4), v0: starting speed (default 0), xmax / vmax: fixed axes so runs can be compared } */
(function () {
  'use strict';
  var G = 9.8;

  function solve(p) {
    var mu = p.mu || 0, T = p.T || 4, v0 = p.v0 || 0, mh = p.mh || 0, m = p.m;
    var Fapp = mh ? mh * G : (p.F || 0), mt = m + mh, fmax = mu * m * G, net = Fapp - fmax;
    var o = { mtot: mt, Fapp: Fapp, T: T, fmax: fmax, hang: mh > 0, mh: mh, m: m, v0: v0 };
    if (v0 === 0 && net <= 0) { o.stuck = true; o.a = 0; o.f = Math.min(Fapp, fmax); o.Fnet = 0; o.Fsys = 0; }
    else { o.stuck = false; o.a = net / mt; o.f = fmax; o.Fsys = net; o.Fnet = m * o.a; }
    o.tension = mh ? mh * (G - o.a) : 0;
    o.vEnd = v0 + o.a * T; o.xEnd = v0 * T + 0.5 * o.a * T * T;
    return o;
  }
  function niceStep(span, n) {
    var raw = span / n, steps = [0.01, 0.02, 0.05, 0.1, 0.2, 0.5, 1, 2, 5, 10, 20, 50, 100, 200, 500, 1000];
    for (var i = 0; i < steps.length; i++) if (steps[i] >= raw) return steps[i];
    return 2000;
  }
  function cssv(n, fb) { var v = getComputedStyle(document.documentElement).getPropertyValue(n).trim(); return v || fb; }
  function reduced() { try { return window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { return false; } }
  function colors() { return { ink: getComputedStyle(document.body).color, line: cssv('--line', '#cbd6e0'), muted: cssv('--muted', '#566878'), accent: cssv('--accent', '#2b4fd9'), good: cssv('--good', '#1c7d4a'), warn: cssv('--warn', '#b3412e'), gold: cssv('--gold', '#b7791f'), surface: cssv('--surface', '#fff') }; }
  function arrow(ctx, x1, y1, x2, y2, col, w, dash) {
    var dx = x2 - x1, dy = y2 - y1, L = Math.hypot(dx, dy); if (L < 1) return;
    ctx.save(); ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = w || 2.4; if (dash) ctx.setLineDash(dash);
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); ctx.setLineDash([]);
    var hl = Math.min(9, L * 0.5), ang = Math.atan2(dy, dx);
    ctx.beginPath(); ctx.moveTo(x2, y2); ctx.lineTo(x2 - hl * Math.cos(ang - 0.45), y2 - hl * Math.sin(ang - 0.45)); ctx.lineTo(x2 - hl * Math.cos(ang + 0.45), y2 - hl * Math.sin(ang + 0.45)); ctx.closePath(); ctx.fill(); ctx.restore();
  }

  function create(host) {
    var box = document.createElement('div'); box.className = 'simbox'; host.appendChild(box);
    var cv = document.createElement('canvas'); cv.width = 900; cv.height = 280; cv.setAttribute('role', 'img'); cv.setAttribute('aria-label', 'Fan cart simulation'); box.appendChild(cv);
    var gv = document.createElement('canvas'); gv.width = 900; gv.height = 170; gv.setAttribute('role', 'img'); gv.setAttribute('aria-label', 'Velocity versus time graph'); box.appendChild(gv);
    var c = cv.getContext('2d'), g = gv.getContext('2d'), raf = 0, token = 0;
    var PAD = 46, L = 610, GY = 160;

    function surfColor(mu) { return mu <= 0 ? '#eef3f7' : (mu < 0.18 ? '#dccfa9' : '#c9a66b'); }

    function drawGraph(pts, tmax, vmax, cur) {
      var C = colors(), W = gv.width, H = gv.height, l = 70, r = 16, tp = 22, b = 34;
      g.clearRect(0, 0, W, H); g.font = '13px sans-serif'; g.fillStyle = C.muted; g.strokeStyle = C.line; g.lineWidth = 1;
      g.fillText('velocity vs time', l, 14);
      var pw = W - l - r, ph = H - tp - b;
      var sx = function (t) { return l + t / tmax * pw; }, sy = function (v) { return tp + ph - v / vmax * ph; };
      var vs = niceStep(vmax, 4), ts = niceStep(tmax, 8);
      for (var v = 0; v <= vmax + 1e-9; v += vs) { g.beginPath(); g.moveTo(l, sy(v)); g.lineTo(W - r, sy(v)); g.stroke(); g.fillStyle = C.muted; g.textAlign = 'right'; g.fillText(String(+v.toFixed(2)), l - 8, sy(v) + 4); g.textAlign = 'left'; }
      for (var t = 0; t <= tmax + 1e-9; t += ts) { g.beginPath(); g.moveTo(sx(t), tp); g.lineTo(sx(t), tp + ph); g.stroke(); g.fillStyle = C.muted; g.fillText(String(+t.toFixed(2)), sx(t) - 8, H - 18); }
      g.fillStyle = C.muted; g.fillText('time (s)', W - r - 50, H - 4); g.save(); g.translate(13, tp + ph / 2 + 22); g.rotate(-Math.PI / 2); g.fillText('v (m/s)', 0, 0); g.restore();
      if (pts.length > 1) { g.strokeStyle = C.accent; g.lineWidth = 2.6; g.beginPath(); pts.forEach(function (q, i) { if (i) g.lineTo(sx(q[0]), sy(q[1])); else g.moveTo(sx(q[0]), sy(q[1])); }); g.stroke(); }
      if (cur) { g.fillStyle = C.accent; g.beginPath(); g.arc(sx(cur[0]), sy(cur[1]), 5, 0, 6.2832); g.fill(); }
    }

    function drawScene(p, s, t, st, xmax, msg, moved) {
      var C = colors(), W = cv.width, H = cv.height, mu = p.mu || 0, hang = s.hang, pulX = PAD + L + 36, tableEnd = hang ? pulX - 4 : W, cl = hang ? 1 : 1.1;
      c.clearRect(0, 0, W, H);
      var thick = hang ? 14 : H - GY;
      c.fillStyle = surfColor(mu); c.fillRect(0, GY, tableEnd, thick);
      if (mu > 0) { c.fillStyle = 'rgba(60,50,40,.35)'; var n = Math.round(mu * 600); for (var i = 0; i < n; i++) { var rx = Math.abs((Math.sin(i * 91.7) * 43758.5453) % 1), ry = Math.abs((Math.sin(i * 12.9 + 4.1) * 24634.6345) % 1); c.fillRect(rx * tableEnd, GY + 2 + ry * (thick - 4), 2, 2); } }
      c.strokeStyle = C.ink; c.lineWidth = 1.2; c.beginPath(); c.moveTo(0, GY); c.lineTo(tableEnd, GY); c.stroke();
      // axis
      var step = niceStep(xmax, 6); c.font = '12px sans-serif'; c.fillStyle = C.ink; c.strokeStyle = C.ink;
      for (var m = 0; m <= xmax + 1e-9; m += step) { var X = PAD + m / xmax * L; c.beginPath(); c.moveTo(X, GY); c.lineTo(X, GY + 6); c.stroke(); c.fillText(String(+m.toFixed(2)) + ' m', X - 12, GY + (hang ? 30 : 22)); }
      // motion map dots, one every 0.5 s
      if (moved) for (var k = 0; k * 0.5 <= t + 1e-9; k++) { var tk = k * 0.5, xk = (s.v0 || 0) * tk + 0.5 * s.a * tk * tk, Xk = PAD + Math.min(xk / xmax, cl) * L; c.fillStyle = C.accent; c.strokeStyle = '#fff'; c.lineWidth = 1.2; c.beginPath(); c.arc(Xk, GY + 9, 3.6, 0, 6.2832); c.fill(); c.stroke(); }
      var px = PAD + Math.min(st.x / xmax, cl) * L;
      // mass blocks (one per 0.5 kg)
      var nb = Math.max(1, Math.min(8, Math.round(p.m / 0.5)));
      for (var b = 0; b < nb; b++) { c.fillStyle = b % 2 ? '#6b7f94' : '#7d91a6'; c.fillRect(px - 15, GY - 22 - (b + 1) * 6, 30, 6); c.strokeStyle = 'rgba(0,0,0,.35)'; c.lineWidth = 1; c.strokeRect(px - 15, GY - 22 - (b + 1) * 6, 30, 6); }
      // cart
      c.fillStyle = '#243447'; c.fillRect(px - 20, GY - 22, 40, 14); c.fillStyle = '#e6edf3'; c.fillRect(px - 20, GY - 22, 40, 3);
      c.fillStyle = '#10161d'; c.beginPath(); c.arc(px - 11, GY - 4, 4.5, 0, 6.2832); c.arc(px + 11, GY - 4, 4.5, 0, 6.2832); c.fill();
      if (!hang) { // fan on the back, air streaming left
        c.fillStyle = '#7a8a99'; c.fillRect(px - 32, GY - 21, 11, 12); c.strokeStyle = '#243447'; c.lineWidth = 1.6; c.beginPath(); c.moveTo(px - 26, GY - 20); c.lineTo(px - 26, GY - 10); c.moveTo(px - 30, GY - 15); c.lineTo(px - 22, GY - 15); c.stroke();
        var F = p.F || 0, nl = F > 0 ? Math.min(6, Math.max(1, Math.ceil(F * 1.2))) : 0; c.strokeStyle = C.accent; c.lineWidth = 1.6; c.globalAlpha = .55;
        for (var q = 0; q < nl; q++) { var yy = GY - 22 + q * 3.4; c.beginPath(); c.moveTo(px - 35, yy); c.lineTo(px - 35 - (12 + (q % 2) * 7), yy); c.stroke(); } c.globalAlpha = 1;
      } else { // string, pulley, hanging block
        var drop = Math.min(70, st.x / xmax * 70), top = GY + 20 + drop;
        c.strokeStyle = C.ink; c.lineWidth = 1.4; c.beginPath(); c.moveTo(px + 20, GY - 14); c.lineTo(pulX, GY - 14); c.moveTo(pulX + 8, GY - 6); c.lineTo(pulX + 8, top); c.stroke();
        c.fillStyle = '#9aa7b4'; c.beginPath(); c.arc(pulX, GY - 6, 8, 0, 6.2832); c.fill(); c.stroke();
        c.fillStyle = '#7a4b2a'; c.fillRect(pulX - 5, top, 26, 20); c.fillStyle = C.ink; c.font = '12px sans-serif'; c.fillText(s.mh.toFixed(2) + ' kg', pulX + 26, top + 14);
      }
      // velocity arrow and labels
      c.font = '13px sans-serif'; c.fillStyle = C.ink; c.fillText('cart mass m = ' + (+p.m.toFixed(3)) + ' kg' + (hang ? ' · hanging mass = ' + s.mh.toFixed(2) + ' kg' : ' · fan force = ' + (+(p.F || 0).toFixed(3)) + ' N') + (mu > 0 ? ' · μ = ' + mu : ' · smooth track'), PAD, 22);
      if (msg) { c.fillStyle = C.muted; c.fillText(msg, PAD, 44); }
      if (st.v > 0.01) { var vl = Math.min(90, 14 + st.v * 6); arrow(c, px, GY - 92, px + vl, GY - 92, C.good, 2.6); c.fillStyle = C.good; c.font = '12px sans-serif'; c.fillText('v = ' + st.v.toFixed(2) + ' m/s', px + 2, GY - 98); }
      else if (moved) { c.fillStyle = C.muted; c.font = '12px sans-serif'; c.fillText('not moving', px - 24, GY - 92); }
      // free-body diagram inset
      var bx = W - 152, by = 8, bw = 144, bh = 190, cx = bx + bw / 2, cy = by + 62;
      c.strokeStyle = C.line; c.lineWidth = 1; c.strokeRect(bx, by, bw, bh); c.fillStyle = C.muted; c.font = '11px sans-serif'; c.fillText('forces on the cart', bx + 6, by + 14);
      var Wt = p.m * G, kv = 32 / Wt, pushF = hang ? s.tension : (p.F || 0);
      var running = moved && (st.v > 0.01 || s.stuck), fr = running ? s.f : 0;
      var big = Math.max(pushF, fr, 0.01), kh = 40 / big;
      c.fillStyle = C.ink; c.fillRect(cx - 7, cy - 5, 14, 10);
      arrow(c, cx, cy + 6, cx, cy + 6 + Wt * kv, C.ink, 2.4); arrow(c, cx, cy - 6, cx, cy - 6 - Wt * kv, C.ink, 2.4);
      c.fillStyle = C.ink; c.font = '11px sans-serif'; c.fillText('W ' + Wt.toFixed(1), cx + 6, cy + 6 + Wt * kv); c.fillText('N ' + Wt.toFixed(1), cx + 6, cy - 8 - Wt * kv);
      if (pushF > 0) { arrow(c, cx + 8, cy, cx + 8 + Math.max(3, pushF * kh), cy, C.accent, 2.8); c.fillStyle = C.accent; c.fillText((hang ? 'T ' : 'F ') + pushF.toFixed(2), cx + 8, cy - 9); }
      if (fr > 0) { arrow(c, cx - 8, cy, cx - 8 - Math.max(3, fr * kh), cy, C.warn, 2.8); c.fillStyle = C.warn; c.fillText('f ' + fr.toFixed(2), bx + 6, cy - 9); }
      var net = moved ? s.Fnet : 0; c.fillStyle = C.ink; c.font = '12px sans-serif'; c.fillText('net force: ' + net.toFixed(2) + ' N', bx + 8, by + 140);
      if (Math.abs(net) > 0.004) arrow(c, bx + 12, by + 154, bx + 12 + Math.max(4, net * kh), by + 154, C.gold, 3, [5, 3]);
      c.fillStyle = C.muted; c.fillText('a = ' + (moved ? s.a.toFixed(2) : '0.00') + ' m/s²', bx + 8, by + 180);
      c.font = '10px sans-serif'; c.fillText('vertical, horizontal: own scales', bx + 8, by + bh - 3);
    }

    function pre(p) { var s = solve(p), T = s.T; return { s: s, T: T, xmax: p.xmax || Math.max(s.xEnd * 1.08, 0.5), vmax: p.vmax || Math.max(Math.abs(s.vEnd), 0.2) * 1.12 }; }

    function run(p) {
      cancelAnimationFrame(raf); var my = ++token, r = pre(p), s = r.s, dur = reduced() ? 250 : 3600, t0 = performance.now();
      return new Promise(function (resolve) {
        function frame(now) {
          if (my !== token) { resolve(null); return; }
          var pr = Math.min(1, (now - t0) / dur), t = pr * r.T, st = { x: (s.v0) * t + 0.5 * s.a * t * t, v: s.v0 + s.a * t };
          var pts = []; for (var i = 0; i <= 50; i++) { var tt = t * i / 50; pts.push([tt, s.v0 + s.a * tt]); }
          drawScene(p, s, t, st, r.xmax, '', true); drawGraph(pts, r.T, r.vmax, [t, st.v]);
          if (pr < 1) raf = requestAnimationFrame(frame);
          else resolve({ a: s.a, vEnd: s.vEnd, xEnd: s.xEnd, Fnet: s.Fnet, Fapp: s.Fapp, f: s.f, fmax: s.fmax, stuck: s.stuck, tension: s.tension, mtot: s.mtot, T: r.T });
        }
        raf = requestAnimationFrame(frame);
      });
    }
    function idle(p, msg) {
      cancelAnimationFrame(raf); token++;
      var r = pre(p); drawScene(p, r.s, 0, { x: 0, v: 0 }, p.xmax || 5, msg || 'Choose settings, then press Run.', false); drawGraph([], r.T, p.vmax || Math.max(Math.abs(r.s.vEnd), 0.5) * 1.12, null);
    }
    return { run: run, idle: idle, stop: function () { cancelAnimationFrame(raf); token++; } };
  }

  /* A small scatter plot for the students' own data. o = { title, xlab, ylab, xmax, ymax } */
  function plot(host, o) {
    var box = document.createElement('div'); box.className = 'simbox'; host.appendChild(box);
    var cv = document.createElement('canvas'); cv.width = 760; cv.height = 300; cv.setAttribute('role', 'img'); cv.setAttribute('aria-label', o.title || 'Graph of your data'); box.appendChild(cv);
    cv.style.maxWidth = '720px';
    var g = cv.getContext('2d');
    function draw(pts, line) {
      var C = colors(), W = cv.width, H = cv.height, l = 70, r = 22, tp = 28, b = 48;
      g.clearRect(0, 0, W, H); g.font = '13px sans-serif'; g.fillStyle = C.ink; g.fillText(o.title || '', l, 16);
      var xs = pts.map(function (q) { return q[0]; }), ys = pts.map(function (q) { return q[1]; });
      var xmax = o.xmax || Math.max(1, Math.max.apply(null, xs.concat([0.001])) * 1.12), ymax = o.ymax || Math.max(1, Math.max.apply(null, ys.concat([0.001])) * 1.12);
      var pw = W - l - r, ph = H - tp - b, sx = function (x) { return l + x / xmax * pw; }, sy = function (y) { return tp + ph - y / ymax * ph; };
      g.strokeStyle = C.line; g.lineWidth = 1; g.fillStyle = C.muted;
      var xs2 = niceStep(xmax, 6), ys2 = niceStep(ymax, 5);
      for (var y = 0; y <= ymax + 1e-9; y += ys2) { g.beginPath(); g.moveTo(l, sy(y)); g.lineTo(W - r, sy(y)); g.stroke(); g.textAlign = 'right'; g.fillText(String(+y.toFixed(3)), l - 8, sy(y) + 4); g.textAlign = 'left'; }
      for (var x = 0; x <= xmax + 1e-9; x += xs2) { g.beginPath(); g.moveTo(sx(x), tp); g.lineTo(sx(x), tp + ph); g.stroke(); g.fillText(String(+x.toFixed(3)), sx(x) - 8, tp + ph + 16); }
      g.strokeStyle = C.ink; g.lineWidth = 1.4; g.beginPath(); g.moveTo(l, tp); g.lineTo(l, tp + ph); g.lineTo(W - r, tp + ph); g.stroke();
      g.fillStyle = C.muted; g.fillText(o.xlab || '', l + pw / 2 - 40, H - 8); g.save(); g.translate(14, tp + ph / 2 + 30); g.rotate(-Math.PI / 2); g.fillText(o.ylab || '', 0, 0); g.restore();
      if (line) { g.strokeStyle = C.gold; g.lineWidth = 2; g.setLineDash([6, 4]); g.beginPath(); var y0 = line.b + line.m * 0, y1 = line.b + line.m * xmax; g.moveTo(sx(0), sy(Math.max(0, y0))); g.lineTo(sx(xmax), sy(Math.min(ymax, y1))); g.stroke(); g.setLineDash([]); }
      g.fillStyle = C.accent; pts.forEach(function (q) { g.beginPath(); g.arc(sx(q[0]), sy(q[1]), 5.5, 0, 6.2832); g.fill(); });
      if (!pts.length) { g.fillStyle = C.muted; g.fillText('Your points appear here as you run the cart.', l + 14, tp + 26); }
    }
    draw([], null);
    return { draw: draw };
  }

  window.CartSim = { create: create, solve: solve, plot: plot, G: G };
})();
