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
        title: "Counting Particles: Atoms, Ions, Isotopes",
        type: "lesson",
        day: 4,
        icon: "🔢",
        href: "unit-3-atoms-ions/counting-particles.html",
        blurb: "Read a symbol and count its protons, neutrons and electrons. Build particles, decode symbols, write them from counts, and untangle the three classic mix-ups.",
        tags: ["atomic number", "mass number", "ions", "isotopes"],
        teacher: [{ label: "Teacher key (#key)", href: "unit-3-atoms-ions/counting-particles.html#key" }, { label: "Projector page", href: "unit-3-atoms-ions/counting-particles-board.html" }, { label: "Teacher page", href: "teacher.html" }]
      }
    ]
  }
];
