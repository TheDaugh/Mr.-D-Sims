// The hub reads this list. To add something: build the page in its unit folder,
// then add one entry below. Nothing else needs to change.
//   type:  "lesson" (a guided lesson), "lab" (a virtual lab) or "sim" (free-play simulation)
//   day:   lesson number inside the unit (lessons only)
//   teacher: optional links shown under the card, e.g. [{label:"Teacher key (#key)", href:"..."}]
window.UNITS = [
  {
    id: "unit-2",
    title: "Unit 2 · Properties of Matter",
    blurb: "Temperature, heat, and what happens to particles when matter changes phase.",
    entries: [
      {
        title: "Heating Curve of Water",
        type: "lab",
        icon: "🧊",
        href: "unit-2-properties-of-matter/heating-curve.html",
        blurb: "Heat ice at a steady rate and watch the temperature, the particles, and the energy at the same time. Find out why the thermometer stops moving.",
        tags: ["phase changes", "temperature", "latent heat"]
      },
      {
        title: "Specific Heat Calorimetry",
        type: "lab",
        icon: "🔩",
        href: "unit-2-properties-of-matter/specific-heat.html",
        blurb: "Drop a hot mystery metal into cool water, read the final temperature, and work out which metal it is.",
        tags: ["specific heat", "q = mcΔT", "calorimetry"]
      },
      {
        title: "Virtual Lab: Unknown White Solids (BETA)",
        type: "lab",
        icon: "🥽",
        href: "virtual-lab/index.html",
        blurb: "Walk the lab, suit up, carry jars to your bench, and run five tests to identify four unknown solids. Beta: keyboard and a laptop screen work best. Tell Mr. D what breaks.",
        tags: ["beta", "lab safety", "properties of matter"]
      },
      {
        title: "Virtual Lab: Heating Curves of Unknown Solids (BETA)",
        type: "lab",
        icon: "🌡️",
        href: "virtual-lab/index.html?lab=heating",
        blurb: "Heat two unknown samples, pause to record readings, plot the curves by hand, and use the plateaus to name each substance. Pre-lab and a written CER are required.",
        tags: ["beta", "phase changes", "CER"]
      }
    ]
  },
  {
    id: "unit-3",
    title: "Unit 3 · Atoms and Ions",
    blurb: "How we know atoms exist, and what is inside them.",
    entries: [
      {
        title: "Atom Discovery: Democritus to Dalton",
        type: "lesson",
        day: 1,
        icon: "⚛️",
        href: "unit-3-atoms-ions/atom-discovery.html",
        blurb: "Cut gold in half until you run out of room, burn hydrogen in oxygen, and weigh your way to Dalton's atomic theory. Your own notes build as you go and print at the end.",
        tags: ["atomic theory", "Dalton", "conservation of mass", "definite proportions"],
        teacher: [{ label: "Teacher key (#key)", href: "unit-3-atoms-ions/atom-discovery.html#key" }, { label: "Teacher page", href: "teacher.html" }]
      },
      {
        title: "Rutherford's Gold Foil",
        type: "lesson",
        day: 2,
        icon: "☢️",
        href: "unit-3-atoms-ions/rutherford-gold-foil.html",
        blurb: "Predict where alpha particles will land, fire them at a gold foil, count the angles, and rewrite the plum-pudding atom with your own numbers.",
        tags: ["Rutherford", "nuclear atom", "claim-evidence-reasoning"],
        teacher: [{ label: "Teacher key (#key)", href: "unit-3-atoms-ions/rutherford-gold-foil.html#key" }]
      },
      {
        title: "Virtual Lab: Rutherford's Gold Foil (BETA)",
        type: "lab",
        icon: "🥽",
        href: "virtual-lab/index.html?lab=rutherford",
        blurb: "Suit up, walk to the bench, and fire alpha particles at the plum-pudding atom and at real gold foil. Tally the counts by angle, match each result to what it showed, rebuild the atom with a nucleus, and write a CER that cites your own numbers.",
        tags: ["beta", "Rutherford", "nuclear atom", "CER"]
      },
      {
        title: "Virtual Lab: Flame Tests (BETA)",
        type: "lab",
        icon: "🔥",
        href: "virtual-lab/index.html?lab=flame",
        blurb: "Test seven salts in a flame, record the colors, then name two unknown salts. Use the spectroscope when two colors match.",
        tags: ["beta", "flame test", "spectroscope", "CER"],
        teacher: [{ label: "Paper version (print)", href: "virtual-lab/flame-explore.html" }]
      },
      {
        title: "Virtual Lab: Photoelectron Spectroscopy (BETA)",
        type: "lab",
        day: 11,
        icon: "⚛️",
        href: "virtual-lab/index.html?lab=pes",
        blurb: "Shine light on a gas of atoms and catch the electrons that fly out. Read each peak as how hard some electrons are held, match spectra to elements, and draw the spectrum for a configuration. Three checkpoints; written work goes on the paper worksheet.",
        tags: ["beta", "photoelectron spectroscopy", "binding energy", "subshells"],
        teacher: [{ label: "Teacher key (#key)", href: "virtual-lab/index.html?lab=pes#key" }, { label: "Teacher page (records, unlock PIN)", href: "virtual-lab/teacher.html" }]
      },
      {
        title: "Counting Particles: Atoms, Ions, Isotopes",
        type: "lesson",
        day: 4,
        icon: "🔢",
        href: "unit-3-atoms-ions/counting-particles.html",
        blurb: "Read a symbol and count its protons, neutrons and electrons. Build particles, decode symbols, write them from counts, and untangle the three classic mix-ups.",
        tags: ["atomic number", "mass number", "ions", "isotopes"],
        teacher: [{ label: "Teacher key (#key)", href: "unit-3-atoms-ions/counting-particles.html#key" }, { label: "Projector page", href: "unit-3-atoms-ions/counting-particles-board.html" }, { label: "Teacher page", href: "teacher.html" }]
      },
      {
        title: "Coulomb's Law and the Shell Model",
        type: "lesson",
        day: 7,
        icon: "🧲",
        href: "unit-3-atoms-ions/coulombs-law.html",
        blurb: "Predict, then change charges and distances in a sim and fill ratio tables. Use the two proportions to explain why an electron near the nucleus is held harder than one far away.",
        tags: ["Coulomb's law", "proportional reasoning", "shell model", "HS-PS1-1", "HS-PS1-2"],
        teacher: [{ label: "Teacher key (#key)", href: "unit-3-atoms-ions/coulombs-law.html#key" }, { label: "Projector page", href: "unit-3-atoms-ions/coulombs-law-board.html" }, { label: "Teacher page", href: "teacher.html" }]
      },
      {
        title: "Electron Configurations I",
        type: "lesson",
        day: 9,
        icon: "⚛️",
        href: "unit-3-atoms-ions/electron-config-1.html",
        blurb: "Drag electrons into an energy ladder, watch the filling rules say no, then write full configurations and draw the boxes through Z = 36.",
        tags: ["electron configuration", "Aufbau", "Hund's rule", "orbital diagrams"],
        teacher: [{ label: "Teacher key (#key)", href: "unit-3-atoms-ions/electron-config-1.html#key" }, { label: "Board page", href: "unit-3-atoms-ions/electron-config-1-board.html" }, { label: "Teacher page", href: "teacher.html" }]
      },
      {
        title: "Virtual Lab: The Pull Bench (Effective Nuclear Charge)",
        type: "lab",
        day: 15,
        icon: "🧲",
        href: "virtual-lab/index.html?lab=zeff",
        blurb: "Measure how hard each atom holds its outer electron, from lithium to calcium. Explore any atoms in any order, predict sodium against magnesium, name a mystery atom, and copy the board at the one huddle. Short and open: Mr. D sets the length.",
        tags: ["Z_eff", "shielding", "core electrons", "virtual lab"],
        teacher: [{ label: "Teacher key (#key)", href: "virtual-lab/index.html?lab=zeff#key" }, { label: "Lesson board (huddle notes)", href: "whiteboard/index.html#lesson=zeff" }, { label: "Teacher page", href: "teacher.html" }]
      },
      {
        title: "Photoelectron Spectroscopy",
        type: "lesson",
        day: 11,
        icon: "📊",
        href: "unit-3-atoms-ions/photoelectron-spectroscopy.html",
        blurb: "Shine light on an atom and read the electrons that come out. Peak position shows how hard each subshell is held; peak height shows how many electrons it has. Match spectra to elements for Z = 1 to 20 (six of them in this lesson).",
        tags: ["photoelectron spectroscopy", "binding energy", "subshells", "electron count"],
        teacher: [{ label: "Teacher key (#key)", href: "unit-3-atoms-ions/photoelectron-spectroscopy.html#key" }, { label: "Teacher page", href: "teacher.html" }]
      }
    ]
  }
];
