/* The ramp-and-pulley checkpoint questions (physics/sandbox/ramp-pulley-checkpoints.js): the key is recomputed from the same forces() the sim runs on,
   questions never repeat in a row, no question is a coin flip, every verdict and every world is covered, and no hint gives the answer. */
const test = require('node:test'), assert = require('node:assert'), path = require('path');
const M = require(path.resolve(__dirname, '../../physics/sandbox/ramp-pulley-model.js'));
global.RampModel = M;
const C = require(path.resolve(__dirname, '../../physics/sandbox/ramp-pulley-checkpoints.js'));
const WHO = ['65J-7TGT', 'K7Q-4M2', 'someone', 'key'];

test('cp1: the stated truth is the physics, with a safe margin, and every verdict is asked in any 3 in a row', () => {
  for (const who of WHO) { const seen = [];
    for (let n = 0; n < 120; n++) {
      const q = C.gen('cp1', who, n), p = q.rig, f = M.forces(p), m = Math.abs(f.Fd) / f.fmax;
      assert.strictEqual(M.verdict(p), q.truth); assert.strictEqual(q.answer.verdict, q.truth); assert.strictEqual(q.answer.reason, q.truth);
      assert.ok(q.truth === 'rest' ? m <= 0.8 : m >= 1.3, 'margin ' + m + ' for ' + q.truth);
      assert.strictEqual(q.reasons.length, 4); assert.ok(q.reasons.some(r => r.id === 'decoy1'));
      seen.push(q.truth);
    }
    for (let i = 0; i + 2 < seen.length; i++) assert.strictEqual(new Set(seen.slice(i, i + 3)).size, 3, 'three in a row cover all three verdicts');
  }
});

test('cp2: the key is atan(mu_s), the sim agrees within the tolerance, and the answer is not the same twice in a row', () => {
  for (const who of WHO) { let prev = null;
    for (let n = 0; n < 80; n++) {
      const q = C.gen('cp2', who, n); near(q.answer, Math.atan(q.mus) * 180 / Math.PI);
      const lo = Math.floor(q.answer), p = { theta: 0, m1: q.m1, m2: 0, mus: q.mus, muk: Math.min(0.15, q.mus), g: 9.8, aE: 0, rain: false };
      assert.strictEqual(M.verdict(Object.assign({}, p, { theta: Math.floor(q.answer - 0.01) })), 'rest', 'holds just below the key');
      assert.strictEqual(M.verdict(Object.assign({}, p, { theta: Math.ceil(q.answer + 0.01) })), 'down', 'slides just above the key');
      assert.ok(Math.abs(Math.ceil(q.answer + 0.01) - q.answer) <= q.tol && Math.abs(lo - q.answer) <= q.tol, 'a whole-degree answer from the sim is inside the tolerance');
      assert.notStrictEqual(q.mus + ':' + q.m1, prev); prev = q.mus + ':' + q.m1;
    }
  }
  function near(a, b) { assert.ok(Math.abs(a - b) < 1e-9); }
});

test('cp3: g and the elevator never change the verdict; rain does; any 3 in a row hold a rain question and a no-change question', () => {
  for (const who of WHO) { const worlds = [];
    for (let n = 0; n < 96; n++) {
      const q = C.gen('cp3', who, n), test = Object.assign({}, q.rig, C.WORLD_SET[q.world]);
      assert.strictEqual(M.verdict(q.rig), q.earth); assert.strictEqual(M.verdict(test), q.truth); assert.strictEqual(q.answer.verdict, q.truth);
      if (q.world === 'rain') { assert.notStrictEqual(q.truth, q.earth, 'rain must flip the verdict'); assert.strictEqual(q.answer.reason, 'wet'); }
      else { assert.strictEqual(q.truth, q.earth, q.world + ' must not flip the verdict'); assert.strictEqual(q.answer.reason, 'g'); }
      const f = M.forces(q.rig); assert.ok(f.fmax > 0);
      worlds.push(q.world);
    }
    for (let i = 0; i < worlds.length; i++) { const t = [worlds[i], worlds[(i + 1) % worlds.length], worlds[(i + 2) % worlds.length]]; assert.ok(t.includes('rain') && t.some(x => x !== 'rain'), t.join()); }
    assert.deepStrictEqual([...new Set(worlds)].sort(), ['elevDown', 'elevUp', 'jupiter', 'mars', 'moon', 'rain']);
  }
});

test('grading: the right answer passes; a wrong verdict, a wrong reason, or both miss with the matching code', () => {
  const q = C.gen('cp1', 'x', 0), wrongV = Object.keys(C.WORD).find(k => k !== q.truth), wrongR = q.reasons.find(r => r.id !== q.truth).id;
  assert.strictEqual(C.grade(q, q.answer).ok, true);
  assert.strictEqual(C.grade(q, { verdict: wrongV, reason: q.truth }).code, 'V');
  assert.strictEqual(C.grade(q, { verdict: q.truth, reason: wrongR }).code, 'R');
  assert.strictEqual(C.grade(q, { verdict: wrongV, reason: wrongR }).code, 'VR');
  assert.strictEqual(C.grade(q, null).ok, false);
  const a = C.gen('cp2', 'x', 0);
  assert.strictEqual(C.grade(a, Math.round(a.answer)).ok, true); assert.strictEqual(C.grade(a, a.answer + 3).ok, false); assert.strictEqual(C.grade(a, a.mus).code, 'UNIT'); assert.strictEqual(C.grade(a, '').code, 'EMPTY');
});

test('no hint gives the answer: no hint names the correct call or the correct angle', () => {
  for (let n = 0; n < 60; n++) for (const t of ['cp1', 'cp3']) {
    const q = C.gen(t, 'h', n), bad = Object.keys(C.WORD).find(k => k !== q.truth), g = C.grade(q, { verdict: bad, reason: 'decoy1' });
    assert.ok(g.hint.length > 20); assert.ok(!Object.values(C.WORD).some(w => g.hint.includes('“' + w + '”') && w === C.WORD[q.truth]), 'hint must not name the right call');
    assert.ok(!g.hint.includes(C.REASON[q.answer.reason]));
  }
  for (let n = 0; n < 40; n++) { const q = C.gen('cp2', 'h', n), g = C.grade(q, Math.round(q.answer) + 7); assert.ok(!g.hint.includes(String(Math.round(q.answer)))); }
});

test('questions are seeded: same student and number give the same question, different students differ, and a retry differs', () => {
  assert.deepStrictEqual(C.gen('cp1', 'a', 3), C.gen('cp1', 'a', 3));
  let diff = 0; for (let n = 0; n < 30; n++) if (JSON.stringify(C.gen('cp1', 'a', n).rig) !== JSON.stringify(C.gen('cp1', 'b', n).rig)) diff++;
  assert.ok(diff > 24, 'students get different questions');
  for (const t of C.TYPES) for (let n = 0; n < 40; n++) assert.notStrictEqual(JSON.stringify(C.gen(t, 'a', n)), JSON.stringify(C.gen(t, 'a', n + 1)));
});
