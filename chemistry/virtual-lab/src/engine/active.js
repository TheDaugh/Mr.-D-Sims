// Active lab time: counts only while the page is visible and the student did something in the last IDLE seconds.
export const IDLE = 45;
export function createActive(start = 0) {
  let sec = start, lastAct = -1e9, prev = null;
  return {
    poke(now) { lastAct = now; },
    // now in seconds; visible = page visible; counting = lab stage; busy = the sim itself is running a measurement
    tick(now, visible, counting, busy = false) {
      if (prev !== null && visible && counting && (busy || now - lastAct <= IDLE)) sec += Math.min(now - prev, 1);
      prev = now;
      return sec;
    },
    last() { return lastAct; }, get sec() { return sec; }, set(v) { sec = v; }
  };
}
