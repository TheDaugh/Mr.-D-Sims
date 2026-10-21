/* The list of guided lessons that have huddle codes, for the teacher dashboard (teacher/index.html)
   and the course teacher pages. When you build a new guided lesson, add one line here.
     course   physics | chem | calc
     id       the lesson's id, the same string the lesson uses when it asks MrD.codes.gate(id, key)
     href     path from the repo root
     gates    the huddles, in order: key "h1", "h2", ...
     live     true when the lesson reports to the live view
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
  { course: "calc", id: "product-rule-v2", title: "2.7 The Product Rule", unit: "Unit 2 · Differentiation",
    href: "calculus/unit-2-differentiation/2-7-product-rule.html", teacher: "calculus/unit-2-differentiation/2-7-product-rule-teacher.html",
    gates: [{ key: "h1", label: "Huddle" }], live: true }
];
