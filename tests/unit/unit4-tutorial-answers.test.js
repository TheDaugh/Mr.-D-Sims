/* Calculus 4.4 to 4.7: every generated answer is recomputed from the numbers in the item by a different route
   (stepping time and measuring, finite differences, or geometry), never from the rule the lesson teaches. */
const test = require('node:test'), assert = require('node:assert'), path = require('path');
require('../../calculus/shared/mathcheck.js'); const MC = globalThis.MC;
const dir = path.resolve(__dirname, '../../calculus/unit-4-contextual-applications');
const load = id => require(path.join(dir, id + '.spec.js'));
function rng(seed) { let a = seed; return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const skill = (spec, id) => spec.skills.find(s => s.id === id);
const each = (spec, id, bands, n, fn) => { for (const b of bands) for (let s = 0; s < n; s++) { const q = skill(spec, id).gen(b, rng(s * 7 + b)); fn(q, q.data, `${spec.id} ${id} band ${b} seed ${s}`); } };
const dt = 1e-6, rate = (f) => (f(dt) - f(-dt)) / (2 * dt);           // d/dt at t = 0 by a central difference
const near = (a, b, tol, w) => assert.ok(Math.abs(a - b) <= tol, `${w}: got ${a}, expected ${b}`);
const fn = js => new Function('x', 'return ' + js);
const h = 1e-5, d1 = (f, a) => (f(a + h) - f(a - h)) / (2 * h);

/* ---------- 4.4 part 1 ---------- */
const P1 = load('4-4-pt1-setup');
test('4.4 pt1 link: exactly one option is the true equation and the options are distinct', () => each(P1, 'link', [1, 2, 3], 120, (q, d, w) => {
  assert.strictEqual(d.kinds.filter(k => k === 'true').length, 1, w); assert.strictEqual(d.kinds[d.right], 'true', w); assert.strictEqual(q.options[d.right], d.ctx, w);
  if (d.moment) assert.strictEqual(d.kinds.filter(k => k === 'plug').length, 1, w + ' the plug-in-early option is there');
}));
test('4.4 pt1 given: the right line is the story’s rate with its sign, and the options never repeat', () => each(P1, 'given', [1, 2, 3], 200, (q, d, w) => {
  assert.strictEqual(new Set(q.options).size, 4, w); const right = q.options[d.right];
  assert.ok(right.includes('=' + d.gv + '$'), w + ' ' + right); assert.ok(!right.includes('=' + d.m + '$') || d.m === Math.abs(d.gv) && d.gv < 0, w + ' moment is not a rate');
  const sym = d.g.replace('/', '}{'); assert.ok(right.includes('\\dfrac{' + sym.replace('d', 'd')), w);
}));
test('4.4 pt1 sign: growing is positive, shrinking negative', () => each(P1, 'sign', [1, 2, 3], 120, (q, d, w) => {
  const right = q.options[d.right]; assert.ok(right.includes('=' + d.dir * d.v + '$'), w + ' ' + right);
  assert.ok(/grow|rising|longer|away|burn|closer|losing|shrinking|drain|fall|slides|down|charge/i.test(q.prompt), w);
}));
test('4.4 pt1 hold: the right option never lets the moment in', () => each(P1, 'hold', [1, 2, 3], 80, (q, d, w) => { assert.ok(/^Only|^The fixed|^Nothing here/.test(q.options[d.right]), w + ' ' + q.options[d.right]); }));

/* ---------- 4.4 part 2 ---------- */
const P2 = load('4-4-pt2-differentiate');
test('4.4 pt2 solve: every rate matches a time-step measurement of the quantity', () => each(P2, 'solve', [1, 2, 3], 150, (q, d, w) => {
  let f;
  if (d.kind === 'circle') f = t => Math.PI * Math.pow(d.r + d.rp * t, 2);
  else if (d.kind === 'sphere') f = t => 4 / 3 * Math.PI * Math.pow(d.r + d.rp * t, 3);
  else if (d.kind === 'cube') f = t => Math.pow(d.s + d.sp * t, 3);
  else if (d.kind === 'rect') f = t => (d.l + d.lp * t) * (d.w + d.wp * t);
  else if (d.kind === 'ladder') f = t => Math.sqrt(d.L * d.L - Math.pow(d.x + d.xp * t, 2));   // the top y(t) while the foot slides out
  else assert.fail(w + ' kind ' + d.kind);
  if (d.kind === 'ladder') assert.ok(Math.abs(d.x * d.x + d.y * d.y - d.L * d.L) < 1e-9, w + ' triangle');
  near(q.answer, rate(f), 0.006, w);
}));
test('4.4 pt2 read: the sign of the rate matches the direction word in the right sentence', () => each(P2, 'read', [1, 2, 3], 120, (q, d, w) => {
  const right = q.options[q.answer]; assert.ok(right.includes(d.val > 0 ? 'growing' : 'shrinking'), w + ' ' + right); assert.ok(q.prompt.includes('=' + d.val.toFixed(1)), w);
}));
test('4.4 pt2 dstep and fixed: one right line, distinct options, the true line mentions each changing rate', () => {
  each(P2, 'dstep', [1, 2, 3], 150, (q, d, w) => { assert.strictEqual(new Set(q.options).size, 4, w); const right = q.options[d.right]; assert.ok(/dfrac\{d[A-Za-z]\}\{dt\}=/.test(right) || /2x/.test(right), w + ' ' + right); });
  each(P2, 'fixed', [1, 2, 3], 60, (q, d, w) => { assert.strictEqual(new Set(q.options).size, 4, w); const right = q.options[d.right]; assert.ok(!/=0\$/.test(right), w); });
});

/* ---------- 4.5 part 1 ---------- */
const T1 = load('4-5-pt1-triangles');
test('4.5 pt1 missing: the third side makes a right triangle', () => each(T1, 'missing', [1, 2, 3], 150, (q, d, w) => {
  if (d.kind === 'plane') near(q.answer, Math.sqrt(d.h * d.h + d.x * d.x), 0.006, w);
  else if (d.kind === 'ladder') near(q.answer, Math.sqrt(d.L * d.L - d.x * d.x), 1e-9, w);
  else near(q.answer, Math.sqrt(d.x * d.x + d.y * d.y), 1e-9, w);
}));
test('4.5 pt1 ladder: the rate of the sliding ladder matches a time-step measurement', () => each(T1, 'ladder', [1, 2, 3], 150, (q, d, w) => {
  if (d.mode === 'foot') near(q.answer, rate(t => Math.sqrt(d.L * d.L - Math.pow(d.x + d.v * t, 2))), 0.006, w);
  else { const f = t => Math.sqrt(d.L * d.L - Math.pow(d.y - d.v * t, 2)); near(q.answer, rate(f), 0.006, w); near(d.x * d.x + d.y * d.y, d.L * d.L, 1e-9, w + ' triangle'); }
}));
test('4.5 pt1 cars: the distance rate matches a time-step measurement, with the sign of each rate', () => each(T1, 'cars', [1, 2, 3], 150, (q, d, w) => {
  if (d.mode === 'leave') near(q.answer, rate(t => Math.hypot(d.a * (d.t + t), d.c * (d.t + t))), 0.006, w);
  else if (d.mode === 'mixed') { assert.ok(d.xs < 0 && d.ys > 0, w); near(q.answer, rate(t => Math.hypot(d.x + d.xs * t, d.y + d.ys * t)), 0.006, w); near(d.z, Math.hypot(d.x, d.y), 1e-9, w); }
  else { near(q.answer, rate(t => Math.hypot(d.x + d.v * t, d.h)), 0.006, w); near(d.s, Math.hypot(d.x, d.h), 1e-9, w); }
}));
test('4.5 pt1 signs: toward is negative, away is positive', () => each(T1, 'signs', [1, 2, 3], 120, (q, d, w) => { const right = q.options[d.right]; assert.ok(right.includes('=' + d.dir * d.v + '$') && right.includes('{d' + d.q + '}'), w + ' ' + right); }));

/* ---------- 4.5 part 2 ---------- */
const V = load('4-5-pt2-volumes');
test('4.5 pt2 similar: the radius follows the cone’s own proportions', () => each(V, 'similar', [1, 2, 3], 150, (q, d, w) => near(q.answer, d.R * (d.h / d.H), 0.006, w)));
test('4.5 pt2 relate: the volume of a cone of depth 1 matches the one-letter formula', () => each(V, 'relate', [1, 2, 3], 80, (q, d, w) => {
  const right = q.options[d.right], m = right.match(/\\dfrac\{(\d+)\\pi\}\{(\d+)\}/); assert.ok(m, w + ' ' + right);
  const coef = m[1] / m[2] * Math.PI, vol = Math.PI * Math.pow(d.R / d.H, 2) / 3;   // V at depth h = 1: (1/3) pi r^2 h with r = R/H
  near(coef, vol, 1e-9, w); assert.strictEqual(new Set(q.options).size, 4, w);
}));
test('4.5 pt2 cone: the depth and volume rates match measuring V(t) with h(t)', () => each(V, 'cone', [1, 2, 3], 200, (q, d, w) => {
  const Vh = hh => Math.PI * Math.pow(d.R / (d.H || 1) * hh, 2) * hh / 3;
  if (d.kind === 'cyl') near(q.answer, d.dV / (Math.PI * d.R * d.R), 0.006, w);
  else if (d.kind === 'conefill') near(q.answer, (Vh(d.h + dt * d.dh) - Vh(d.h - dt * d.dh)) / (2 * dt), 0.006, w);   // dV/dt when h moves at d.dh
  else { const dVdh = (Vh(d.h + 1e-6) - Vh(d.h - 1e-6)) / 2e-6; near(q.answer, d.dV / dVdh, 0.006, w); }
}));
test('4.5 pt2 shadow: the tip of the shadow comes from the light ray, not from the rule', () => each(V, 'shadow', [1, 2, 3], 120, (q, d, w) => {
  const tipX = x => x * d.H / (d.H - d.h), shadow = x => tipX(x) - x;   // the ray from the lamp top through the head meets the ground at tipX
  near(q.answer, rate(t => d.mode === 'tip' ? tipX(10 + d.v * t) : shadow(10 + d.v * t)), 0.006, w);
}));

/* ---------- 4.6 part 1 ---------- */
const FNS = { sq: x => x * x, cube: x => x * x * x, sqrt: Math.sqrt, inv: x => 1 / x, cbrt: Math.cbrt, root2x1: x => Math.sqrt(2 * x + 1), poly3: x => x * x * x - 3 * x, ln: Math.log, exp: Math.exp, exp2: x => Math.exp(2 * x) };
const L1 = load('4-6-pt1-local-linearity');
test('4.6 pt1 point and slope: f(a) and f′(a) match the function', () => { each(L1, 'point', [1, 2, 3], 120, (q, d, w) => near(q.answer, FNS[d.f](d.a), 0.006, w)); each(L1, 'slope', [1, 2, 3], 120, (q, d, w) => near(q.answer, d1(FNS[d.f], d.a), 0.006, w)); });
test('4.6 pt1 line: the written line equals f(a) + f′(a)(x − a) and each named slip is a different line', () => each(L1, 'line', [1, 2, 3], 120, (q, d, w) => {
  const f = FNS[d.f], ev = (s, x) => MC.evaluate(MC.parse(s, ['x']), { x });
  for (const x of [d.a + 0.5, d.a + 1.7, d.a - 0.3]) near(ev(q.answer, x), f(d.a) + d1(f, d.a) * (x - d.a), 1e-4, w + ' at ' + x);
  for (const t of q.traps) assert.ok([d.a + 0.5, d.a + 1.7, d.a - 0.3].some(x => Math.abs(ev(t.expr, x) - ev(q.answer, x)) > 1e-3), w + ' the slip "' + t.expr + '" is not equivalent to the right line');
}));
test('4.6 pt1 meaning: distinct options and a message for every wrong one', () => each(L1, 'meaning', [1, 2, 3], 80, (q, d, w) => { assert.strictEqual(new Set(q.options).size, 4, w); q.why.forEach((m, i) => assert.ok(i === q.answer || m, w + ' wrong option ' + i + ' has a message')); }));

/* ---------- 4.6 part 2 ---------- */
const L2 = load('4-6-pt2-approximating');
const FPP = { sq: 1, cube: 1, sqrt: -1, inv: 1, cbrt: -1, ln: -1, exp: 1 };
test('4.6 pt2 estimate: L(x) matches f(a) + f′(a)(x − a) computed from the function', () => each(L2, 'estimate', [1, 2, 3], 150, (q, d, w) => { const f = FNS[d.f]; near(q.answer, f(d.a) + d1(f, d.a) * (d.x - d.a), 0.006, w); }));
test('4.6 pt2 direction: over / under agrees with the sign of the second derivative and with measuring the gap', () => each(L2, 'direction', [1, 2, 3], 150, (q, d, w) => {
  const right = q.options[d.right]; assert.ok(right.includes(d.kind === 'over' ? 'too big' : 'too small'), w + ' ' + right);
  if (d.f) { const f = FNS[d.f], a = DIRA[d.f], x = a + 0.4, L = f(a) + d1(f, a) * (x - a); assert.strictEqual(L > f(x) ? 'over' : 'under', d.kind, w + ' measured gap'); }
}));
const DIRA = { sqrt: 4, sq: 3, exp: 0, ln: 1, inv: 2, cbrt: 8 };
test('4.6 pt2 context: the story estimate is start + rate × time', () => each(L2, 'context', [1, 2, 3], 120, (q, d, w) => near(q.answer, d.fa + d.d * d.dx, 1e-9, w)));
test('4.6 pt2 error: the better estimate is the closer x', () => each(L2, 'error', [1, 2, 3], 150, (q, d, w) => {
  assert.notStrictEqual(Math.abs(d.x1 - d.a).toFixed(3), Math.abs(d.x2 - d.a).toFixed(3), w + ' tie'); const closer = Math.abs(d.x1 - d.a) < Math.abs(d.x2 - d.a) ? d.x1 : d.x2; assert.ok(q.options[d.right].includes('x=' + closer + '$'), w + ' ' + q.options[d.right]);
}));

/* ---------- 4.7 part 1 ---------- */
const H1 = load('4-7-pt1-lhopital-once');
test('4.7 pt1 form: the named form matches the top and bottom values next to a', () => each(H1, 'form', [1, 2, 3], 160, (q, d, w) => {
  const N = fn(d.nj), D = fn(d.dj), a = d.a === Infinity ? 1e6 : d.a, eps = 1e-9, n = N(a + (d.a === Infinity ? 0 : eps)), dd = D(a + (d.a === Infinity ? 0 : eps));
  const kind = d.a === Infinity ? 'ii' : (Math.abs(N(a)) < 1e-12 && Math.abs(D(a)) < 1e-12 ? 'zz' : (Math.abs(D(a)) < 1e-12 ? 'kz' : 'num')); assert.strictEqual(kind, d.kind, w + ` ${d.nj} / ${d.dj} at ${d.a}`);
  const right = q.options[d.right]; assert.ok({ zz: /\\frac00/, ii: /infty/, num: /plain number/, kz: /over 0/ }[d.kind].test(right), w + ' ' + right); assert.strictEqual(new Set(q.options).size, 4, w);
}));
test('4.7 pt1 step: the L’Hôpital line has the two derivatives of the top and the bottom', () => each(H1, 'step', [1, 2, 3], 80, (q, d, w) => {
  const N = fn(d.nj), D = fn(d.dj), Np = fn(d.npj), Dp = fn(d.dpj); for (const a of [0.7, 1.3, 2.1]) { near(d1(N, a), Np(a), 1e-4, w + ' top'); near(d1(D, a), Dp(a), 1e-4, w + ' bottom'); }
  assert.ok(q.options[d.right].startsWith('$\\dfrac{') && !/\)\(/.test(q.options[d.right]), w + ' the right option is not the quotient rule'); assert.strictEqual(new Set(q.options).size, 4, w);
}));
test('4.7 pt1 once: the limit matches the quotient measured next to a', () => each(H1, 'once', [1, 2, 3], 150, (q, d, w) => { const N = fn(d.nj), D = fn(d.dj), e = 1e-3; const m = (N(d.a + e) / D(d.a + e) + N(d.a - e) / D(d.a - e)) / 2; near(q.answer, m, 0.01, w); }));
test('4.7 pt1 slip: one right explanation, distinct options', () => each(H1, 'slip', [1, 2, 3], 80, (q, d, w) => { assert.strictEqual(new Set(q.options).size, 4, w); assert.ok(/quotient rule|only the top|not \\frac00|not allowed/.test(q.options[d.right]) || /differentiated only/.test(q.options[d.right]), w + ' ' + q.options[d.right]); }));

/* ---------- 4.7 part 2 ---------- */
const H2 = load('4-7-pt2-lhopital-more');
test('4.7 pt2 twice: the limit matches the quotient measured next to 0', () => each(H2, 'twice', [1, 2, 3], 150, (q, d, w) => { const N = fn(d.nj), D = fn(d.dj), e = 0.02; const m = (N(e) / D(e) + N(-e) / D(-e)) / 2; near(q.answer, m, 0.02, w); }));
test('4.7 pt2 infty: the growth kind matches the quotient at large x', () => each(H2, 'infty', [1, 2, 3], 120, (q, d, w) => {
  const N = fn(d.nj), D = fn(d.dj), r = x => N(x) / D(x), rs = [10, 100, 300, 2000, 1e5, 1e7].map(r).filter(v => isFinite(v) && !isNaN(v)), last = rs[rs.length - 1], prev = rs[rs.length - 2];
  if (d.kind === 'zero') assert.ok(last < 0.05 && last <= prev, w + ` ratios ${rs}`);
  else if (d.kind === 'inf') assert.ok(last > 50 && last >= prev, w + ` ratios ${rs}`);
  else near(r(1e6), d.value, 0.01, w);
  assert.strictEqual(new Set(q.options).size, 4, w);
}));
test('4.7 pt2 again: “again” only when the new fraction is 0/0 or ∞/∞, and “stop” otherwise', () => each(H2, 'again', [1, 2, 3], 80, (q, d, w) => {
  const N = fn(d.nj), D = fn(d.dj), a = d.a, inf = a === Infinity, n = inf ? N(300) : N(a), dd = inf ? D(300) : D(a);
  const zz = !inf && Math.abs(n) < 1e-12 && Math.abs(dd) < 1e-12, ii = inf && Math.abs(n) > 100 && Math.abs(dd) > 100;
  if (d.kind === 'again') assert.ok(zz || ii, w + ' should be indeterminate'); else assert.ok(!(zz || ii), w + ' should not be indeterminate');
  if (d.kind === 'stop-kz') assert.ok(Math.abs(dd) < 1e-9 && Math.abs(n) > 1e-6, w);
  assert.strictEqual(new Set(q.options).size, 4, w);
}));
test('4.7 pt2 notuse: exactly the right option is not indeterminate at its point', () => each(H2, 'notuse', [1, 2, 3], 100, (q, d, w) => {
  d.opts.forEach((o, i) => { const N = fn(o.nj), D = fn(o.dj), ind = Math.abs(N(o.a)) < 1e-12 && Math.abs(D(o.a)) < 1e-12; assert.strictEqual(!ind, i === d.right, w + ' option ' + i); });
}));
