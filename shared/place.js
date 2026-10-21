/* MrD.place: level placement for the warm-up. Pure logic, unit-tested in node.

   The ladder starts at the most basic band and climbs.
     - a first-try right answer moves up one band
     - a wrong answer is asked once more at the same band (a fresh item); two misses at a band stop the ladder
     - at most 8 items; clearing the top band ends it too
     - the placed band is the highest band cleared (a band is cleared by a first-try right, or a right after one miss)
   MrD.place.start({ maxBand, seedBand, maxItems })  seedBand is last time's band from MrD.profile: start one below it, never above
   MrD.place.next(state, correct)                    returns a new state: { band, misses, asked, cleared, done, placed, log }
   state.band is the band of the next item to ask. */
(function () {
  "use strict";
  var root = typeof window !== "undefined" ? window : globalThis;
  var MrD = (root.MrD = root.MrD || {});

  function start(o) {
    o = o || {};
    var max = o.maxBand || 4, seed = o.seedBand ? Math.min(max, Math.max(1, o.seedBand - 1)) : 1;
    return { band: seed, misses: 0, asked: 0, cleared: 0, done: false, placed: seed, maxBand: max, maxItems: o.maxItems || 8, log: [] };
  }
  function next(s, correct) {
    var n = JSON.parse(JSON.stringify(s));
    if (n.done) return n;
    n.asked++; n.log.push({ band: n.band, ok: !!correct });
    if (correct) {
      n.cleared = Math.max(n.cleared, n.band); n.misses = 0;
      if (n.band >= n.maxBand) n.done = true; else n.band++;
    } else {
      n.misses++;
      if (n.misses >= 2) n.done = true;
    }
    if (n.asked >= n.maxItems) n.done = true;
    n.placed = Math.max(1, n.cleared);
    return n;
  }
  MrD.place = { start: start, next: next };
  if (typeof module !== "undefined" && module.exports) module.exports = MrD.place;
})();
