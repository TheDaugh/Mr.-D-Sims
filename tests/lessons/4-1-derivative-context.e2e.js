/* Per-lesson overrides for 4.1 Derivatives in Context. Run with
     TZ=America/New_York TEMPLATE=calc PAGE=calculus/unit-4-contextual-applications/4-1-derivative-context.html node tests/template.e2e.js */
const assert = require('assert');
module.exports = require('./_unit4.js')('4-1-derivative-context', null, {
  X1: [['s', 0, 4], ['c'], ['s', 0, 12], ['c'], ['s', 0, 16], ['c']],
  X2: [['ok'], ['ok'], ['ok']],
  X3: [['s', 0, 5], ['c'], ['s', 0, 30], ['c'], ['ok']],
  X4: [['b', 'increasing'], ['b', 'decreasing'], ['b', 'not changing at that moment'], ['b', 'decreasing'], ['b', 'increasing']]
}, async (H, page) => {
  const x1 = page.locator('.card .q[data-qid="X1"]'); await x1.getByRole('button', { name: /^Check/ }).click(); await H.tick(page, 300);
  assert.ok(/gallons per minute here/.test(await x1.locator('.fb').innerText()), 'station 1 miss gives the rate it found');
});
