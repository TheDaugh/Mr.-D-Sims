// A scripted walkthrough that plays on the real room and bench, then puts everything back.
// Nothing here is logged or kept: the app freezes the student's state first and restores it after.
const path = (s) => [...s].map((c) => ({ U: [0, -1], D: [0, 1], L: [-1, 0], R: [1, 0] })[c]);

export async function runDemo(api) {
  if (api.demo.running) return;
  const snap = api.freeze();
  let stopped = false; api.demo.stop = () => { stopped = true; wake(); };
  let wake = () => {};
  const SLOW = 0.6; const wait = (ms) => new Promise((r) => { const t = setTimeout(r, ms * SLOW); wake = () => { clearTimeout(t); r(); }; });
  const live = () => { if (stopped) throw new Error("stop"); };
  const say = async (n, text, ms = 2600) => { live(); api.caption(n, text); await wait(ms); live(); };
  const walk = async (route) => { for (const d of path(route)) { live(); api.walk(d); await wait(230); } };
  const total = 9;
  try {
    if (api.scat) await scatScript({ say, walk, wait, live, api }); else if (api.kind) await api.kind.demo({ say, walk, wait, live, api }); else if (api.heat) await heatScript({ say, walk, wait, live, api }); else {
    await say(1, "Welcome. This tour shows every control. None of it counts toward your lab.", 2800);
    await say(2, "Walk with the arrow keys or WASD. The blue locker holds your goggles and apron.", 1400); await walk("ULLUL");
    await say(2, "Press E to use what you are facing. Put on goggles and an apron.", 1500); api.interact(); await wait(900); api.togglePPE("goggles"); await wait(700); api.togglePPE("apron"); await say(2, "Both are on. Now the door light is green.", 1800); api.closePanel();
    await say(3, "Walk through the door into the lab.", 800); await walk("DRRUUU");
    await say(4, "Jars sit on shelves. Face one, press E, and choose Take. You can carry ten; use Take all.", 1200); await walk("ULLUUURRRU"); api.interact(); await wait(1000); api.take("water"); await wait(900); api.addPractice(); await say(4, "Your jars show up under Carrying. This tour gives you a practice jar of salt.", 2600); api.closePanel();
    await say(5, "Face the long bench and press E to step up to it.", 900); await walk("LLLDDDRRRU"); api.interact(); await wait(1200);
    await say(6, "Move the beaker to the balance, press Tare, pick the jar, choose grams and press Add.", 1800); api.act.moveTo("balance"); await wait(900); api.act.tare(); await wait(900); api.act.pick("practice", 2); api.act.add(); await say(6, "The balance now reads the mass. Solids are always weighed on the balance.", 2600);
    await say(7, "Move it back to the bench, add 20 mL of water, then stir. Watch the log at the bottom.", 1800); api.act.moveTo("bench"); await wait(700); api.act.pick("water", 20); api.act.add(); await wait(900); api.act.stir(); await wait(2200);
    await say(8, "Test conductivity. A bulb that glows means ions are carrying current.", 1200); api.act.conduct(); await wait(2600);
    await say(8, "Click the beaker again, or press M, to zoom in on the particles.", 1200); api.openMicro(); await wait(5500); api.closeMicro();
    await say(9, "Open the notebook with N. Write only what you observed, never what you expect.", 1200); api.openNotebook(); await wait(3200); api.closeNotebook();
    await say(9, "That is the tour. In the lab, yellow arrows will walk you through your first sample.", 3200);
    }
  } catch (e) { if (e.message !== "stop") console.error(e); }
  finally { api.thaw(snap); }
}

// The heating-lab tour: same room, same bench, a practice tube, a short run, a few rows, a few dots.
async function heatScript({ say, walk, wait, live, api }) {
  await say(1, "Welcome. This tour shows every control. None of it counts toward your lab.", 2800);
  await say(2, "The blue locker holds your goggles and apron. Walk with the arrow keys or WASD, then press E.", 1400); await walk("ULLUL");
  api.interact(); await wait(900); api.togglePPE("goggles"); await wait(600); api.togglePPE("apron"); await say(2, "Both are on. The tongs rack is next to the locker: hot glass needs tongs.", 2200); api.closePanel();
  api.walk([1, 0]); api.interact(); await wait(900); api.togglePPE("tongs"); await say(2, "Pick up the tongs. You only need them to move something hot.", 2200); api.closePanel();
  await say(3, "Walk through the door into the lab.", 800); await walk("DRRUUU");
  await say(4, "Your sample tubes are on the UNKNOWNS shelf. Face it, press E, and choose Take.", 1200); await walk("ULLUUU"); api.interact(); await wait(1000); api.take("sX"); await wait(900); api.addPractice();
  await say(4, "Your tubes show up under Carrying. This tour gives you a practice tube.", 2600); api.closePanel();
  await say(5, "Face the long bench and press E to step up to it.", 900); await walk("DDDRRRU"); api.interact(); await wait(1200);
  await say(6, "Move the beaker to the balance, press Tare, choose the tube, enter 10 grams and press Add.", 1800); api.act.moveTo("balance"); await wait(900); api.act.tare(); await wait(900); api.act.pick("practice", 10); api.act.add(); await say(6, "In the real lab, weigh 10.0 g. A different mass changes how long the plateaus last.", 3200);
  await say(7, "Move the beaker to the hot plate and turn the plate on. The heater runs at a steady rate.", 1800); api.act.moveTo("hotplate"); await wait(900); api.act.plate(true); await wait(1500);
  await say(7, "Look at the beaker, and click it twice (or press M) to see the particles.", 1400); api.openMicro(); await wait(4500); api.closeMicro();
  await say(8, "Advance one step moves the clock exactly one step, then pauses. Watch the thermometer.", 1800); api.act.advance(); await wait(2200); live();
  await say(8, "Open the notebook (N). The clock pauses while it is open. Type the time, temperature and state yourself. Here they are filled in for you.", 2200); api.openNotebook(); await wait(900); api.act.row(); await wait(1500);
  api.closeNotebook(); await wait(500); api.act.advance(); await wait(2200); api.openNotebook(); await wait(700); api.act.row(); await wait(1000); api.closeNotebook(); await wait(500); api.act.advance(); await wait(2200); api.openNotebook(); await wait(700); api.act.row(); await wait(1000);
  await say(9, "The temperature stopped rising while the heater kept running. That flat piece is a plateau: energy is breaking attractions, not speeding up particles.", 5200);
  await say(9, "Now the graph. It starts blank. You place every point yourself and draw the lines yourself.", 2600); api.act.graph(); await wait(900); api.act.plot(); await wait(2000);
  await say(10, "Name the graph and label both axes with units. When you are done with both samples, write your CER.", 3800);
  await say(10, "That is the tour. In the lab, yellow arrows will walk you through your first sample.", 3200);
}

// The scattering-lab tour: the curtain, the apparatus, both runs, the atom microscope, the tally, the rebuild.
async function scatScript({ say, walk, wait, live, api }) {
  const D = api.scat.demo;
  await say(1, "Welcome. This tour shows every control of the gold-foil lab. None of it counts toward your lab.", 2800);
  await say(2, "Walk with the arrow keys or WASD. Go through the dark-room curtain.", 1200); await walk("UUUUUU");
  await say(3, "Face the foil apparatus and press E to step up to it.", 1200); api.interact(); await wait(1400); D.top();
  await say(4, "Plum pudding first. Fire sends alpha particles at the model. The picture shows each flight; the histogram counts the hits by angle.", 1800); D.go("plum"); await wait(4200); D.stop(); live();
  await say(5, "Almost everything goes straight through, as a plum-pudding atom predicts. Now the real gold foil unlocks.", 3400); D.go("real"); await wait(4600); D.stop(); live();
  await say(6, "Some alphas land at big angles, and a few come straight back. The histogram is on a log scale so the rare hits stay visible.", 4200);
  await say(7, "The atom microscope zooms into one atom. Click the field to fire at that height. Watch the forces on the alpha particle.", 1600); D.scroll("scope"); await wait(900); api.scope.aim(0.45); await wait(1600); api.scope.aim(0.04); await wait(2600); live();
  await say(7, "Try a head-on shot. Close to the center line it bounces right back. That needs a tiny, dense, positive nucleus.", 3400); api.scope.aim(0.005); await wait(2800);
  await say(8, "The detector table counts every hit by group. Tally the straight, deflected and rebounding hits, then match each result to what it showed.", 1400); D.scroll("table"); await wait(2200); D.scroll("tally"); await wait(2200); D.scroll("match"); await wait(2200);
  await say(8, "Then you rebuild the atom: size a nucleus until your model matches the real foil. The challenge changes the metal, the energy and the foil thickness.", 1400); D.scroll("rebuild"); await wait(2400); D.scroll("challenge"); await wait(2600);
  await say(9, "Last, write a Claim, Evidence, Reasoning that cites your own counts. That is the tour. In the lab, yellow arrows walk you through each step.", 3600);
}
