/* The list of guided lessons that have huddle codes, for the teacher dashboard (teacher/index.html)
   and the course teacher pages. When you build a new guided lesson, add one line here.
     course   physics | chem | calc | stats
     id       the lesson's id, the same string the lesson uses when it asks MrD.codes.gate(id, key)
     href     path from the repo root
     gates    the huddles, in order: key "h1", "h2", ...
     live     true when the lesson reports to the live view
     spec     (optional) path to the lesson's spec file; lessons made with tools/new-lesson.mjs have one, and the hub links their key PDFs
   Later this is also where the review portal learns which lessons feed which standards (portal/standards.json). */
window.MrD = window.MrD || {};
window.MrD.lessons = [
  { course: "physics", id: "newtons-first-law", title: "Newton's First Law", unit: "Lessons",
    href: "physics/lessons/newtons-first-law.html", teacher: "physics/lessons/teacher.html",
    gates: [{ key: "h1", label: "Huddle 1" }, { key: "h2", label: "Huddle 2" }], live: true },
  { course: "physics", id: "newtons-second-law", title: "Newton's Second Law", unit: "Lessons",
    href: "physics/lessons/newtons-second-law.html", teacher: "physics/lessons/teacher.html",
    gates: [{ key: "h1", label: "Huddle 1" }, { key: "h2", label: "Huddle 2" }], live: true },
  { course: "chem", id: "atom-discovery", title: "Atom Discovery: Democritus to Dalton", unit: "Unit 3 · Atoms and Ions",
    href: "chemistry/unit-3-atoms-ions/atom-discovery.html", teacher: "chemistry/teacher.html",
    gates: [{ key: "h1", label: "Huddle 1" }, { key: "h2", label: "Huddle 2" }], live: true },
  { course: "chem", id: "rutherford-gold-foil", title: "Rutherford's Gold Foil", unit: "Unit 3 · Atoms and Ions",
    href: "chemistry/unit-3-atoms-ions/rutherford-gold-foil.html", teacher: "chemistry/teacher.html",
    gates: [{ key: "h1", label: "Huddle 1" }], live: true },
  { course: "chem", id: "counting-particles", title: "Counting Particles: Atoms, Ions, Isotopes", unit: "Unit 3 · Atoms and Ions",
    href: "chemistry/unit-3-atoms-ions/counting-particles.html", teacher: "chemistry/teacher.html",
    gates: [{ key: "h1", label: "Huddle 1" }], live: true },
  { course: "chem", id: "coulombs-law", title: "Coulomb's Law and the Shell Model", unit: "Unit 3 · Atoms and Ions",
    href: "chemistry/unit-3-atoms-ions/coulombs-law.html", teacher: "chemistry/teacher.html",
    gates: [{ key: "h1", label: "Huddle (class split)" }], live: true },
  { course: "calc", id: "product-rule-v2", title: "2.7 The Product Rule", unit: "Unit 2 · Differentiation",
    href: "calculus/unit-2-differentiation/2-7-product-rule.html", teacher: "calculus/unit-2-differentiation/2-7-product-rule-teacher.html",
    gates: [{ key: "h1", label: "Huddle" }], live: true },
{ course: "physics", id: "tpl-physics", title: "Template: Net Force and Acceleration", unit: "Templates",
    href: "templates/physics/lesson.html", teacher: "physics/lessons/teacher.html", spec: "templates/physics/spec.js",
    gates: [{ key: "h1", label: "Huddle" }], live: true },
  { course: "chem", id: "tpl-chem", title: "Template: Counting Particles", unit: "Templates",
    href: "templates/chem/lesson.html", teacher: "chemistry/teacher.html", spec: "templates/chem/spec.js",
    gates: [{ key: "h1", label: "Huddle" }], live: true },
  { course: "calc", id: "tpl-calc", title: "Template: The Power Rule", unit: "Templates",
    href: "templates/calc/lesson.html", teacher: "calculus/unit-2-differentiation/2-7-product-rule-teacher.html", spec: "templates/calc/spec.js",
    gates: [{ key: "h1", label: "Huddle" }], live: true },
  { course: "stats", id: "tpl-stats", title: "Template: z-Scores", unit: "Templates",
    href: "templates/stats/lesson.html", spec: "templates/stats/spec.js",
    gates: [{ key: "h1", label: "Huddle" }], live: true },
  { course: "calc", id: "2-6-exp-log", title: "2.6 Derivatives of eˣ and ln x", unit: "unit-2-differentiation",
    href: "calculus/unit-2-differentiation/2-6-exp-log.html", spec: "calculus/unit-2-differentiation/2-6-exp-log.spec.js",
    gates: [{ key: "h1", label: "Huddle" }], live: true },
  { course: "calc", id: "2-8-quotient-rule", title: "2.8 The Quotient Rule", unit: "unit-2-differentiation",
    href: "calculus/unit-2-differentiation/2-8-quotient-rule.html", spec: "calculus/unit-2-differentiation/2-8-quotient-rule.spec.js",
      gates: [{ key: "h1", label: "Huddle" }], live: true },
  { course: "physics", id: "fbd-net-force", title: "Free-Body Diagrams and Net Force", unit: "Forces and Newton’s Laws",
    href: "physics/lessons/fbd-net-force.html", teacher: "physics/lessons/teacher.html",
    spec: "physics/lessons/content/fbd-net-force.spec.js",
    gates: [{ key: "h1", label: "Huddle" }], live: true }
];
