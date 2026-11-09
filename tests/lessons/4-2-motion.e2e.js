/* Per-lesson overrides for 4.2 Motion Along a Line. Run with
     TZ=America/New_York TEMPLATE=calc PAGE=calculus/unit-4-contextual-applications/4-2-motion.html node tests/template.e2e.js */
const assert = require('assert');
module.exports = require('./_unit4.js')('4-2-motion', null, {
  X1: [['s', 0, 5], ['c'], ['s', 0, 20], ['c'], ['s', 0, 10], ['c']],
  X2: [['b', 'slowing down'], ['b', 'speeding up'], ['b', 'slowing down'], ['b', 'speeding up'], ['ok']],
  X3: [['m', 'mot-x3']],
  X4: [['ok'], ['ok'], ['ok']]
}, async (H, page) => {
  const x1 = page.locator('.card .q[data-qid="X1"]'); await x1.getByRole('button', { name: /^Check/ }).click(); await H.tick(page, 300);
  assert.ok(/The velocity is/.test(await x1.locator('.fb').innerText()), 'station 1 miss names the velocity');
});
