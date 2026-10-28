// The global huddle clock for every virtual lab. It runs on the school bell (MrD.bell), not on when a student opened the page,
// so every student is pulled to huddle 1 at minute 3 and huddle 2 at minute 25 of the period, whatever time they started.
// A lab may move a time later in its own content (`clock.huddle1AtMin`, `clock.huddle2AtMin`); lab days that need the data first do.
export const HUDDLE_AT = { h1: 3, h2: 25 };

export const huddleTimes = (lab) => ({ h1: (lab.clock && lab.clock.huddle1AtMin) ?? HUDDLE_AT.h1, h2: (lab.clock && lab.clock.huddle2AtMin) ?? HUDDLE_AT.h2 });

// What is due right now? Returns 1, 2 or null. Pure: the caller keeps `forced` so each huddle is called once.
//   minutesIn  minutes since the bell (null or undefined outside a class period: nothing is ever due)
//   stage      the lab's stage: intro, prelab, huddle1, lab, ...
//   done       { 1: bool, 2: bool }   the student already entered that code
//   forced     { 1: bool, 2: bool }   that huddle was already called by the clock
//   at         { h1, h2 }             minutes after the bell
export function huddleDue({ minutesIn, stage, done, forced, at }) {
  if (minutesIn == null || !(minutesIn >= 0)) return null;
  if (minutesIn >= at.h1 && !done[1] && !forced[1] && (stage === "prelab" || stage === "huddle1")) return 1;
  if (minutesIn >= at.h2 && !done[2] && !forced[2] && stage === "lab") return 2;
  return null;
}
