/* Ladder: the hidden difficulty ladder for guided lessons. Plain state, so a lesson can save it in its lock snapshot.
     var s = Ladder.init(2)            start at band 2 (bands 1 to 4)
     Ladder.record(s, firstTry)        two first-try answers in a row climb a band; two misses in a row drop one. Returns the new band.
   Nothing here draws anything. The student is never shown a band. */
(function (root) {
  'use strict';
  var MIN = 1, MAX = 4;
  function init(start) { return { band: Math.max(MIN, Math.min(MAX, start | 0 || MIN)), up: 0, down: 0, n: 0, hist: [] }; }
  function record(s, firstTry) {
    s.n++; s.hist.push({ band: s.band, first: !!firstTry });
    if (firstTry) { s.up++; s.down = 0; if (s.up >= 2 && s.band < MAX) { s.band++; s.up = 0; } }
    else { s.down++; s.up = 0; if (s.down >= 2 && s.band > MIN) { s.band--; s.down = 0; } }
    return s.band;
  }
  root.Ladder = { init: init, record: record };
  if (typeof module !== 'undefined' && module.exports) module.exports = root.Ladder;
})(typeof window !== 'undefined' ? window : globalThis);
