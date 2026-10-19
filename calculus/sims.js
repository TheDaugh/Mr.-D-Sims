// The hub reads this list. To add a sim: build the page in its unit folder,
// then add one entry below. Nothing else needs to change.
window.UNITS = [
  {
    id: "unit-2",
    title: "Unit 2 · Differentiation",
    blurb: "Guided online lessons. Each one opens with a prediction, a sim with a job, and questions that adjust to your work.",
    sims: [
      {
        title: "2.7 The Product Rule",
        href: "unit-2-differentiation/2-7-product-rule.html",
        blurb: "Grow rectangles and watch the area change in two strips and a vanishing corner. Then build (f·g)′ = f′g + fg′ one step at a time. Add #key to the address for the teacher key.",
        tags: ["product rule", "area model", "guided lesson", "~42 min"]
      }
    ]
  },
  {
    id: "unit-6",
    title: "Unit 6 · Integration and Accumulation of Change",
    blurb: "Area as accumulated change, and how a Riemann sum closes in on the exact value.",
    sims: [
      {
        title: "Accumulation Lab",
        href: "unit-6-integration/accumulation-lab.html",
        blurb: "Two sims in one page. Drag x and watch g(x) = ∫f build up while its slope matches the height of f. Then compare left, right, midpoint and trapezoid sums as n grows.",
        tags: ["g′ = f", "Riemann sums", "over/underestimate", "error vs n"]
      }
    ]
  }
];
