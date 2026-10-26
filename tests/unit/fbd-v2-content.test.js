const test = require('node:test'), assert = require('node:assert'), C = require('../../physics/lessons/content/fbd-net-force.v2.content.js'), g = 9.8;
/* independent check: solve Newton's equations as a linear system, never reuse the closed forms */
function solve(A, b) { const n = b.length; A = A.map((r, i) => r.concat(b[i])); for (let i = 0; i < n; i++) { let p = i; for (let k = i + 1; k < n; k++) if (Math.abs(A[k][i]) > Math.abs(A[p][i])) p = k; [A[i], A[p]] = [A[p], A[i]]; for (let k = 0; k < n; k++) if (k !== i) { const m = A[k][i] / A[i][i]; for (let j = i; j <= n; j++) A[k][j] -= m * A[i][j]; } } return A.map((r, i) => r[n] / r[i]); }
const num = s => (s.match(/-?\d+(?:\.\d+)?/g) || []).map(Number);
const near = (a, b, m) => assert.ok(Math.abs(a - b) <= 0.011 + 0.002 * Math.abs(b), m + ': ' + a + ' vs ' + b);
test('models: numeric answers recomputed', () => {
  const M = Object.fromEntries(C.MODELS.map(m => [m.id, m]));
  near(M.M1.answer, 2 * g); near(M.M2.answer, (80 - 50) / 12); near(M.M3.answer, 60 * (g + 1.5)); near(M.M3.youDoAnswer, 60 * (g - 1.5));
  const [T, a] = solve([[1, -4], [1, 2]], [0, 2 * g]); /* unknowns T, a: T - 4a = 0 ; T + 2a = 2g */ near(M.M4.answer, a); near(M.M4.answer2, T);
  const [a5, c] = solve([[8, 0], [0, 1]], [24, 0]); near(M.M5.answer, 5 * a5);
});
test('six bands, four generators each, 300 seeds finite and positive', () => {
  for (let b = 1; b <= 6; b++) { assert.strictEqual(C.LADDER[b].length, 4); for (let s = 1; s <= 300; s++) C.LADDER[b].forEach(gen => { const q = gen(C.mk(s)); assert.ok(q.prompt && q.worked.length && q.misc, q.id); if (q.type !== 'choice') { assert.ok(Number.isFinite(q.answer) && q.answer > 0, q.id + ' ' + s + ' ' + q.answer); } }); }
});
test('independent recomputation from the prompt numbers', () => {
  for (let s = 1; s <= 300; s++) {
    let q = C.LADDER[3][0](C.mk(s)), n = num(q.prompt); /* m1, mu, m2 */ { const [m1, , mu, m2] = [n[0], 0, n[1], n[2]]; const [T, a] = solve([[1, -m1], [1, m2]], [mu * m1 * g, m2 * g]); near(q.answer, a, 'l3-pulley ' + s); }
    q = C.LADDER[3][2](C.mk(s)); n = num(q.prompt); { const F = n[0], m1 = n[1], m2 = n[2]; /* unknowns C,a: F - C = m1 a ; C = m2 a */ const [cc, aa] = solve([[1, m1], [1, -m2]], [F, 0]); near(q.answer, cc, 'l3-contact'); }
    q = C.LADDER[4][0](C.mk(s)); n = num(q.prompt); { const m1 = n[0], m2 = n[1]; const [T, a] = solve([[1, m1], [1, -m2]], [m1 * g, m2 * g]); /* m1: m1 g - T = m1 a  -> T + m1 a = m1 g ; m2: T - m2 g = m2 a -> T - m2 a = m2 g */ near(q.answer, T, 'l4-atwood'); }
    q = C.LADDER[4][1](C.mk(s)); n = num(q.prompt); { const m1 = n[0], m2 = n[1], mu = n[2], F = n[3]; /* unknowns T,a: F - T - mu m1 g = m1 a ; T - mu m2 g = m2 a */ const [T, a] = solve([[1, m1], [-1, m2]], [F - mu * m1 * g, -mu * m2 * g]); assert.ok(a > 0); near(q.answer, T, 'l4-rough'); }
    q = C.LADDER[4][3](C.mk(s)); n = num(q.prompt); { const m2 = n[0], m1 = n[1], a = n[2]; /* T1 - (m1+m2)g = (m1+m2)a, T2 - m2 g = m2 a */ near(q.answer, (m1 + m2) * (g + a), 'T1'); near(q.answer2, m2 * (g + a), 'T2'); }
    q = C.LADDER[5][1](C.mk(s)); n = num(q.prompt); { const [a, b, c, F] = [n[0], n[1], n[2], n[3]]; /* unknowns T12,T23,acc: F - T12 = a acc ; T12 - T23 = b acc ; T23 = c acc */ const [T12, T23, acc] = solve([[1, 0, a], [-1, 1, b], [0, -1, c]].map((r, i) => i === 0 ? r : r), [F, 0, 0]); near(q.answer, T23, 'chain'); }
    q = C.LADDER[5][2](C.mk(s)); n = num(q.prompt); { const M = n[0], m = n[1], a = n[2]; /* 2T - (M+m)g = (M+m)a ; N + T - M g = M a */ const T = ((M + m) * (g + a)) / 2; near(q.answer, M * a + M * g - T, 'bucket'); assert.ok(q.answer > 0); }
    q = C.LADDER[6][0](C.mk(s)); n = num(q.prompt); { const b = n[0], m = n[1], t = n[2]; let v = 0; const N = 20000, dt = t / N; for (let i = 0; i < N; i++) v += (b * (i + 0.5) * dt / m) * dt; near(q.answer, v, 'ramp'); }
    q = C.LADDER[6][1](C.mk(s)); n = num(q.prompt); { const Ln = n[0], y = n[1]; near(q.answer, g * y / Ln, 'chain-edge'); }
    q = C.LADDER[6][2](C.mk(s)); n = num(q.prompt); { const m1 = n[0], m2 = n[1]; const [T] = solve([[1, m1], [1, -m2]], [m1 * g, m2 * g]); near(q.answer, 2 * T, 'scale'); assert.ok(q.answer < (m1 + m2) * g); }
    q = C.LADDER[6][3](C.mk(s)); n = num(q.prompt); { const F = n[0], mr = n[1], M = n[2]; near(q.answer, M * F / (M + mr), 'rope-block'); }
    q = C.LADDER[5][0](C.mk(s)); n = num(q.prompt); { const M = n[0], L = n[1], F = n[2], d = n[3]; const a = (F - M * g) / M; near(q.answer, M * (1 - d / L) * (g + a), 'rope'); }
    q = C.LADDER[4][2](C.mk(s)); n = num(q.prompt); { const m = n[0], Mm = n[1], mu = n[2]; near(q.answer, (m + Mm) * mu * g, 'stack'); }
    q = C.LADDER[3][3](C.mk(s)); n = num(q.prompt); { const m = n[0], ms = n[1], P = n[2]; assert.ok(P < ms * m * g, 'static push must be below the limit'); assert.strictEqual(q.answer, P); }
  }
});
test('limit-case choice item: only option 1 passes both limits', () => {
  const f = [(m1, m2) => m2 * g / (m1 + m2), (m1, m2) => m2 * g / m1, (m1, m2) => (m1 + m2) * g / m2, (m1, m2) => (m2 - m1) * g / (m1 + m2)];
  const ok = f.map(fn => Math.abs(fn(1e-9, 1) - g) < 1e-3 && Math.abs(fn(1, 1e-9)) < 1e-3);
  assert.deepStrictEqual(ok, [true, false, false, false]); assert.strictEqual(C.LADDER[5][3](C.mk(1)).answer, 0);
});
test('sims cover every band and have a task per listed band', () => { const bands = new Set(); C.SIMS.forEach(s => s.bands.forEach(b => { bands.add(b); assert.ok(s.task[b], s.id + ' band ' + b); })); assert.deepStrictEqual([...bands].sort(), [1, 2, 3, 4, 5, 6]); });
