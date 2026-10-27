/* The Orbital Filler's rules and picture (chemistry/shared/energy-ladder.js), checked against the Day Card's own model. */
const test = require('node:test'), assert = require('node:assert');
const EL = require('../../chemistry/shared/energy-ladder.js');
const C = require('../../chemistry/unit-3-atoms-ions/day-cards/slot-09.content.js');

/* fill a run the way a careful student does: lowest subshell, first open box (singles first) */
function carefulFill(Z) {
  const run = EL.newRun(Z);
  while (!EL.full(run)) {
    const sub = EL.ORDER.find(s => run.boxes[s].some(n => n < 2)), arr = run.boxes[sub];
    let k = arr.findIndex(n => n === 0); if (k < 0) k = arr.findIndex(n => n === 1);
    assert.ok(EL.place(run, sub, k).ok);
  }
  return run;
}
test('a careful fill gives the card configuration for Z = 1..36 (Cr and Cu follow the card: simple order)', () => {
  for (let Z = 1; Z <= 36; Z++) { const r = carefulFill(Z); assert.strictEqual(EL.config(r), C.cfg(Z), 'Z=' + Z); assert.deepStrictEqual(EL.occupancy(r), C.occupancy(Z), 'occupancy Z=' + Z); }
});
test('Aufbau rejects a higher subshell while a lower one has room, with the card wording', () => {
  const r = EL.newRun(3); const res = EL.place(r, '2p', 0);
  assert.deepStrictEqual([res.ok, res.rule, res.reason], [false, 'aufbau', 'A lower subshell still has room.']);
  assert.strictEqual(EL.left(r), 3); assert.strictEqual(r.rej.aufbau, 1);
});
test('Pauli rejects a third electron in a box', () => {
  const r = EL.newRun(5); EL.place(r, '1s', 0); EL.place(r, '1s', 0);
  const res = EL.place(r, '1s', 0); assert.deepStrictEqual([res.ok, res.rule, res.reason], [false, 'pauli', 'A box holds 2 electrons, spins opposite.']);
});
test('Hund rejects pairing while another box of the subshell is empty', () => {
  const r = EL.newRun(7); [['1s', 0], ['1s', 0], ['2s', 0], ['2s', 0], ['2p', 0]].forEach(p => assert.ok(EL.place(r, p[0], p[1]).ok));
  const res = EL.place(r, '2p', 0); assert.deepStrictEqual([res.ok, res.rule, res.reason], [false, 'hund', 'Another box in this subshell is empty. Fill it first.']);
  assert.ok(EL.place(r, '2p', 1).ok);
});
test('3d is refused while 4s has room (the slot-9 misconception)', () => {
  const r = EL.newRun(26); [['1s', 2], ['2s', 2], ['2p', 6], ['3s', 2], ['3p', 6]].forEach(([s, n]) => { for (let i = 0; i < n; i++) { const k = r.boxes[s].findIndex(x => x === 0) >= 0 ? r.boxes[s].findIndex(x => x === 0) : r.boxes[s].findIndex(x => x === 1); EL.place(r, s, k); } });
  assert.strictEqual(EL.place(r, '3d', 0).rule, 'aufbau');
});
test('no electron past Z, and the filling order is the ladder order', () => {
  const r = carefulFill(15); assert.strictEqual(EL.place(r, '4p', 0).ok, false); assert.deepStrictEqual(EL.fillOrder(r), ['1s', '2s', '2p', '3s', '3p']);
});
test('the picture draws every box, hides a row on request, and is not interactive for the board', () => {
  const s = EL.svg({ occupancy: C.occupancy(15) }); assert.strictEqual((s.match(/class="cl-box/g) || []).length, 18);
  assert.ok(!/tabindex/.test(s)); assert.ok(/tabindex/.test(EL.svg({ interactive: true })));
  const h = EL.svg({ occupancy: C.occupancy(26), hideRow: '3d' }); assert.strictEqual((h.match(/>\?</g) || []).length, 5); assert.ok(!/3d 6/.test(h));
});
