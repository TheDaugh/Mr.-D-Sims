// The physics hub reads this list. To add a sim: build the page in its folder,
// then add one entry below. Nothing else needs to change.
window.UNITS = [
  {
    id: "newtons-laws",
    title: "Newton’s Laws",
    blurb: "Guided online lessons: predict, investigate with a job, name the rule, then try questions that adjust to each student. Students build their own printable notes as they work.",
    entries: [
      { type: "lesson", icon: "🧊", title: "Newton’s First Law", href: "lessons/newtons-first-law.html", blurb: "Six surfaces, a mass test, a cruising task and a force-balancing task, with four hidden difficulty levels from middle school to first-year college. Practice keeps going until the end of class.", tags: ["Newton’s First Law", "guided lesson", "adaptive"],
        teacher: [{ label: "Teacher key (#key)", href: "lessons/newtons-first-law.html#key" }, { label: "Teacher page", href: "lessons/teacher.html" }] },
      { type: "lesson", icon: "🛒", title: "Newton’s Second Law", href: "lessons/newtons-second-law.html", blurb: "A fan cart on a track: push harder, load it up, fight friction, hang a mass over a pulley. Four hidden difficulty levels, notes that build as students work, and practice that continues until the end of class.", tags: ["Newton’s Second Law", "guided lesson", "adaptive"],
        teacher: [{ label: "Teacher key (#key)", href: "lessons/newtons-second-law.html#key" }, { label: "Teacher page", href: "lessons/teacher.html" }] }
    ]
  },
  {
    id: "motion-and-graphs",
    title: "Motion and graphs",
    blurb: "Position, velocity and acceleration, read from tapes, graphs and a car on a hill.",
    entries: [
      { title: "Reading Motion Graphs", href: "motion-and-graphs/graphs.html", blurb: "Read velocity–time and displacement–time graphs to find velocity, acceleration and distance.", tags: ["slope", "area under graph"], from: "Graphs.exe" },
      { title: "Bouncing Graphs", href: "motion-and-graphs/bouncing-graphs.html", blurb: "Displacement, velocity and acceleration graphs of a bouncing ball, drawn live.", tags: ["free fall", "graphs"], from: "Bouncing Graphs.exe" },
      { title: "Ticker Timer", href: "motion-and-graphs/ticker-timer.html", blurb: "Read paper-tape dots to work out how a trolley moved, then stack the strips into a velocity graph.", tags: ["dot spacing", "acceleration"], from: "Ticker Timer.exe" },
      { title: "Motion Graphs on a Hill", href: "motion-and-graphs/motion-graphs.html", blurb: "Drive a car over hills and watch position, velocity and acceleration graphs build.", tags: ["slope", "kinematics"], from: "Motion Graphs.exe" }
    ]
  },
  {
    id: "free-fall",
    title: "Free fall",
    blurb: "Gravity, air resistance, and measuring g.",
    entries: [
      { title: "Measuring g", href: "free-fall/gravity.html", blurb: "Two light gates and a falling sphere. Plot s against t² and find g from the gradient.", tags: ["g", "linear fit"], from: "Gravity.exe" },
      { title: "Terminal Velocity", href: "free-fall/terminal-velocity.html", blurb: "Drop a parcel from a helicopter, open the parachute, and watch drag balance weight.", tags: ["drag", "terminal velocity"], from: "Terminal Velocity.exe" },
      { title: "Bounce Meter", href: "free-fall/bounce-meter.html", blurb: "Estimate a ball’s drop height from the sound of its bounces. Uses the microphone, or a simulated ball.", tags: ["elasticity", "sound"], from: "Bounce Meter.exe" }
    ]
  },
  {
    id: "projectiles",
    title: "Projectiles",
    blurb: "Horizontal and vertical motion treated separately.",
    entries: [
      { title: "Projectiles", href: "projectiles/projectiles.html", blurb: "Launch at any speed, angle and height. Predict the landing spot and hit a target.", tags: ["range", "components"], from: "Projectiles.exe" },
      { title: "Falling Target", href: "projectiles/falling-target.html", blurb: "Aim at a target that drops the instant you fire. Where should you aim?", tags: ["free fall", "relative motion"], from: "Falling Target.exe" },
      { title: "Ballistic Trolley", href: "projectiles/ballistic-trolley.html", blurb: "A trolley fires a ball straight up while moving. Where does it land?", tags: ["constant velocity", "drag"], from: "Ballistic Trolley.exe" },
      { title: "Projectile Motion Concept Checker", href: "projectiles/projectile-concept-checker.html", blurb: "A student worksheet in one page: predict, launch, answer. Nine parts, from the core ideas through monkey and hunter, other planets and air resistance. Add #key to the address for the teacher key.", tags: ["concept checker", "predict first"] }
    ]
  },
  {
    id: "predict-first",
    title: "Predict first",
    blurb: "Commit to a prediction, run the simulation, then check it against the equation.",
    entries: [
      { title: "Two Carts", href: "predict-first/predict-first.html#collisions", blurb: "Momentum in collisions. Predict both velocities after the hit.", tags: ["momentum", "collisions"] },
      { title: "Hill Roll", href: "predict-first/predict-first.html#energy", blurb: "Energy on a ramp and a hill. Predict the speed and whether the ball clears the hill.", tags: ["energy", "friction"] },
      { title: "Cut the String", href: "predict-first/predict-first.html#release", blurb: "Circular motion. Predict where the ball goes when the string is cut.", tags: ["circular motion", "Newton's first law"] }
    ]
  },
  {
    id: "challenge-problems",
    title: "Hard problems",
    blurb: "Hard problems with a sim to test the answer. Solve on paper first.",
    entries: [
      { title: "Exploding Projectile", href: "challenge-problems/exploding-projectile.html", blurb: "A shell bursts mid-air. One piece lands at the gun. Find the height of the burst.", tags: ["centre of mass", "projectiles"] },
      { title: "Ball and Bullet", href: "challenge-problems/ball-and-bullet.html", blurb: "Drop a ball, fire at it from the side. When must the gun fire?", tags: ["free fall", "timing"] },
      { title: "Rolling Disc", href: "challenge-problems/rolling-disc.html", blurb: "Two points on a rolling disc. When do their speeds first match?", tags: ["rolling", "instantaneous axis"] }
    ]
  }
];
