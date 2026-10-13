// A scripted walkthrough that plays on the real room and bench, then puts everything back.
// Nothing here is logged or kept: the app freezes the student's state first and restores it after.
const path = (s) => [...s].map((c) => ({ U: [0, -1], D: [0, 1], L: [-1, 0], R: [1, 0] })[c]);

export async function runDemo(api) {
  if (api.demo.running) return;
  const snap = api.freeze();
  let stopped = false; api.demo.stop = () => { stopped = true; wake(); };
  let wake = () => {};
  const wait = (ms) => new Promise((r) => { const t = setTimeout(r, ms); wake = () => { clearTimeout(t); r(); }; });
  const live = () => { if (stopped) throw new Error("stop"); };
  const say = async (n, text, ms = 2600) => { live(); api.caption(n, text); await wait(ms); live(); };
  const walk = async (route) => { for (const d of path(route)) { live(); api.walk(d); await wait(230); } };
  const total = 9;
  try {
    await say(1, "Welcome. This tour shows every control. None of it counts toward your lab.", 2800);
    await say(2, "Walk with the arrow keys or WASD. The blue locker holds your goggles and apron.", 1400); await walk("ULLUL");
    await say(2, "Press E to use what you are facing. Put on goggles and an apron.", 1500); api.interact(); await wait(900); api.togglePPE("goggles"); await wait(700); api.togglePPE("apron"); await say(2, "Both are on. Now the door light is green.", 1800); api.closePanel();
    await say(3, "Walk through the door into the lab.", 800); await walk("DRRUUU");
    await say(4, "Jars sit on shelves. Face one, press E, and choose Take. You can carry six.", 1200); await walk("ULLUUURRRU"); api.interact(); await wait(1000); api.take("water"); await wait(900); api.addPractice(); await say(4, "Your jars show up under Carrying. This tour gives you a practice jar of salt.", 2600); api.closePanel();
    await say(5, "Face the long bench and press E to step up to it.", 900); await walk("LLLDDDRRRU"); api.interact(); await wait(1200);
    await say(6, "Move the beaker to the balance, press Tare, pick the jar, choose grams and press Add.", 1800); api.act.moveTo("balance"); await wait(900); api.act.tare(); await wait(900); api.act.pick("practice", 2); api.act.add(); await say(6, "The balance now reads the mass. Solids are always weighed on the balance.", 2600);
    await say(7, "Move it back to the bench, add 20 mL of water, then stir. Watch the log at the bottom.", 1800); api.act.moveTo("bench"); await wait(700); api.act.pick("water", 20); api.act.add(); await wait(900); api.act.stir(); await wait(2200);
    await say(8, "Test conductivity. A bulb that glows means ions are carrying current.", 1200); api.act.conduct(); await wait(2600);
    await say(8, "Click the beaker again, or press M, to zoom in on the particles.", 1200); api.openMicro(); await wait(5500); api.closeMicro();
    await say(9, "Open the notebook with N. Write only what you observed, never what you expect.", 1200); api.openNotebook(); await wait(3200); api.closeNotebook();
    await say(9, "That is the whole tour. Now do the pre-lab, then the real thing. Press Esc any time to stop.", 3200);
  } catch (e) { if (e.message !== "stop") console.error(e); }
  finally { api.thaw(snap); }
}
