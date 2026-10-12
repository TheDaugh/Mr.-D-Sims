// The hub reads this list. To add a lab: build the page in its unit folder,
// then add one entry below. Nothing else needs to change.
window.UNITS = [
  {
    id: "unit-2",
    title: "Unit 2 · Properties of Matter",
    blurb: "Temperature, heat, and what happens to particles when matter changes phase.",
    labs: [
      {
        title: "Heating Curve of Water",
        icon: "🧊",
        href: "unit-2-properties-of-matter/heating-curve.html",
        blurb: "Heat ice at a steady rate and watch the temperature, the particles, and the energy at the same time. Find out why the thermometer stops moving.",
        tags: ["phase changes", "temperature", "latent heat"]
      },
      {
        title: "Specific Heat Calorimetry",
        icon: "🔩",
        href: "unit-2-properties-of-matter/specific-heat.html",
        blurb: "Drop a hot mystery metal into cool water, read the final temperature, and work out which metal it is.",
        tags: ["specific heat", "q = mcΔT", "calorimetry"]
      }
    ]
  }
];
