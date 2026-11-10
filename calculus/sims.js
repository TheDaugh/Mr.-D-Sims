// The hub reads this list. To add a sim: build the page in its unit folder,
// then add one entry below. Nothing else needs to change.
window.UNITS = [
  {
    id: "unit-2",
    title: "Unit 2 · Differentiation",
    blurb: "Guided online lessons. Each one opens with a prediction, a sim with a job, and questions that adjust to your work.",
    entries: [
      {
        type: "lesson",
        icon: "〰️",
        title: "2.5 Derivatives of Sine and Cosine",
        href: "unit-2-differentiation/2-5-sine-cosine.html",
        blurb: "A guided lesson that adjusts to each student. Slide a tangent along sine and cosine, let the measured slopes draw a new curve, zoom in on secants to see why, then build the two rules and show you own them. Notes print as a PDF.",
        tags: ["sine and cosine", "adaptive", "online notes + PDF"],
        teacher: [
          { label: "Teacher page + key", href: "unit-2-differentiation/2-5-sine-cosine-teacher.html" },
          { label: "Teacher view (#key)", href: "unit-2-differentiation/2-5-sine-cosine.html#key" },
          { label: "Outline", href: "unit-2-differentiation/2-5-sine-cosine-outline.md" }
        ]
      },
      {
        type: "lesson",
        icon: "📈",
        title: "2.6 Derivatives of eˣ and ln x",
        href: "unit-2-differentiation/2-6-exp-log.html",
        blurb: "Slide a point along eˣ and ln x and compare slope with height, then build both rules and show you own them.",
        tags: ["e^x", "ln x", "adaptive", "online notes + PDF"],
        teacher: [
          { label: "Teacher key (#key)", href: "unit-2-differentiation/2-6-exp-log.html#key" },
          { label: "Teacher key PDF", href: "../keys/calc/2-6-exp-log-teacher.pdf" },
          { label: "Make-up notes PDF", href: "../keys/calc/2-6-exp-log-makeup.pdf" }
        ]
      },
      {
        type: "lesson",
        icon: "📐",
        title: "2.7 The Product Rule",
        href: "unit-2-differentiation/2-7-product-rule.html",
        blurb: "A guided lesson that adjusts to each student. Predict, run a rectangle experiment where you compute first and the sim reveals second, build the rule, then show you own it. Notes print as a PDF.",
        tags: ["product rule", "adaptive", "online notes + PDF", "hints at every step"],
        teacher: [
          { label: "Teacher key (#key)", href: "unit-2-differentiation/2-7-product-rule.html#key" },
          { label: "Teacher page", href: "unit-2-differentiation/2-7-product-rule-teacher.html" },
          { label: "Outline", href: "unit-2-differentiation/2-7-product-rule-outline.md" }
        ]
      },
      {
        type: "lesson",
        icon: "➗",
        title: "2.8 The Quotient Rule",
        href: "unit-2-differentiation/2-8-quotient-rule.html",
        blurb: "Test a tempting guess against the true tangent, then build the quotient rule and show you own it.",
        tags: ["quotient rule", "adaptive", "online notes + PDF"],
        teacher: [
          { label: "Teacher key (#key)", href: "unit-2-differentiation/2-8-quotient-rule.html#key" },
          { label: "Teacher key PDF", href: "../keys/calc/2-8-quotient-rule-teacher.pdf" },
          { label: "Make-up notes PDF", href: "../keys/calc/2-8-quotient-rule-makeup.pdf" }
        ]
      }
    ]
  },
  {
    id: "unit-3",
    title: "Unit 3 · Composite, Implicit and Inverse Functions",
    blurb: "Differentiating functions of functions, curves that are not functions, and inverses.",
    entries: [
      {
        type: "lesson",
        icon: "⛓️",
        title: "3.1 The Chain Rule",
        href: "unit-3-composite-implicit-inverse/3-1-chain-rule.html",
        blurb: "Slide a point along a curve built from two functions, see the slope split into two links, then build the chain rule and show you own it.",
        tags: ["chain rule", "adaptive", "online notes + PDF"],
        teacher: [
          { label: "Teacher key (#key)", href: "unit-3-composite-implicit-inverse/3-1-chain-rule.html#key" },
          { label: "Teacher key PDF", href: "../keys/calc/3-1-chain-rule-teacher.pdf" },
          { label: "Make-up notes PDF", href: "../keys/calc/3-1-chain-rule-makeup.pdf" }
        ]
      },
      {
        type: "lesson",
        icon: "⭕",
        title: "3.2 Implicit Differentiation",
        href: "unit-3-composite-implicit-inverse/3-2-implicit.html",
        blurb: "Two points on a circle share one x but not one slope. See why, then build implicit differentiation and show you own it.",
        tags: ["implicit differentiation", "adaptive", "online notes + PDF"],
        teacher: [
          { label: "Teacher key (#key)", href: "unit-3-composite-implicit-inverse/3-2-implicit.html#key" },
          { label: "Teacher key PDF", href: "../keys/calc/3-2-implicit-teacher.pdf" },
          { label: "Make-up notes PDF", href: "../keys/calc/3-2-implicit-makeup.pdf" }
        ]
      },
      {
        type: "lesson",
        icon: "🪞",
        title: "3.3 Derivatives of Inverse Functions",
        href: "unit-3-composite-implicit-inverse/3-3-inverse.html",
        blurb: "Mirror a curve across y = x and watch its slope flip. Four hands-on stations, then problems. Go at your own pace; your work saves so you can finish tomorrow.",
        tags: ["inverse functions", "self-paced", "interactive", "online notes + PDF"],
        teacher: [
          { label: "Teacher key (#key)", href: "unit-3-composite-implicit-inverse/3-3-inverse.html#key" },
          { label: "Teacher key PDF", href: "../keys/calc/3-3-inverse-teacher.pdf" },
          { label: "Make-up notes PDF", href: "../keys/calc/3-3-inverse-makeup.pdf" }
        ]
      },
      {
        type: "lesson",
        icon: "📐",
        title: "3.4 Derivatives of Inverse Trigonometric Functions",
        href: "unit-3-composite-implicit-inverse/3-4-inverse-trig.html",
        blurb: "Build the triangle behind arcsin, then see how steep arcsin and arctan really are. Four hands-on stations, then problems. Go at your own pace; your work saves so you can finish tomorrow.",
        tags: ["inverse trig", "self-paced", "interactive", "online notes + PDF"],
        teacher: [
          { label: "Teacher key (#key)", href: "unit-3-composite-implicit-inverse/3-4-inverse-trig.html#key" },
          { label: "Teacher key PDF", href: "../keys/calc/3-4-inverse-trig-teacher.pdf" },
          { label: "Make-up notes PDF", href: "../keys/calc/3-4-inverse-trig-makeup.pdf" }
        ]
      },
      {
        type: "lesson",
        icon: "🔁",
        title: "3.5 Higher-Order Derivatives",
        href: "unit-3-composite-implicit-inverse/3-5-higher-order.html",
        blurb: "Take the derivative of a derivative and see how f, f′ and f″ connect. Four hands-on stations, then problems. Go at your own pace; your work saves so you can finish tomorrow.",
        tags: ["second derivative", "self-paced", "interactive", "online notes + PDF"],
        teacher: [
          { label: "Teacher key (#key)", href: "unit-3-composite-implicit-inverse/3-5-higher-order.html#key" },
          { label: "Teacher key PDF", href: "../keys/calc/3-5-higher-order-teacher.pdf" },
          { label: "Make-up notes PDF", href: "../keys/calc/3-5-higher-order-makeup.pdf" }
        ]
      },
      {
        type: "lesson",
        icon: "✅",
        title: "Review + Quiz: 3.1 to 3.3",
        href: "unit-3-composite-implicit-inverse/unit-3-quiz.html",
        blurb: "Review the chain rule, implicit differentiation and inverse functions with hints, then take a 15-question quiz: one try each, no hints. You need 85% to go on to 3.4. If you miss it, redo the lessons you missed and retake with new questions.",
        tags: ["review", "quiz", "85% to move on", "self-paced"],
        teacher: [
          { label: "Teacher view (#key)", href: "unit-3-composite-implicit-inverse/unit-3-quiz.html#key" }
        ]
      },
      {
        type: "lesson",
        icon: "🏁",
        title: "Review + Test: Unit 3",
        href: "unit-3-composite-implicit-inverse/unit-3-test.html",
        blurb: "Review all of Unit 3 with hints, then take a 20-question test: one try each, no hints. You need 85% to go on to Unit 4. If you miss it, redo the lessons you missed and retake with new questions.",
        tags: ["review", "test", "85% to move on", "self-paced"],
        teacher: [
          { label: "Teacher view (#key)", href: "unit-3-composite-implicit-inverse/unit-3-test.html#key" }
        ]
      }
    ]
  },
  {
    id: "unit-4",
    title: "Unit 4 · Contextual Applications of Differentiation",
    blurb: "A derivative is a rate: say what it means with units, follow a moving particle, and compare rates in other settings.",
    entries: [
      {
        type: "lesson",
        icon: "📈",
        title: "4.1 Interpreting Derivatives in Context",
        href: "unit-4-contextual-applications/4-1-derivative-context.html",
        blurb: "Read a derivative as a rate, say it in a sentence with units, and use it to estimate. Four hands-on stations, then problems. Go at your own pace; your work saves so you can finish tomorrow.",
        tags: ["rate", "units", "self-paced", "interactive", "online notes + PDF"],
        teacher: [
          { label: "Teacher key (#key)", href: "unit-4-contextual-applications/4-1-derivative-context.html#key" },
          { label: "Teacher key PDF", href: "../keys/calc/4-1-derivative-context-teacher.pdf" },
          { label: "Make-up notes PDF", href: "../keys/calc/4-1-derivative-context-makeup.pdf" }
        ]
      },
      {
        type: "lesson",
        icon: "🏃",
        title: "4.2 Position, Velocity and Acceleration",
        href: "unit-4-contextual-applications/4-2-motion.html",
        blurb: "Watch a particle and read velocity and acceleration off it: direction, speeding up and slowing down. Four hands-on stations, then problems. Go at your own pace; your work saves so you can finish tomorrow.",
        tags: ["velocity", "acceleration", "self-paced", "interactive", "online notes + PDF"],
        teacher: [
          { label: "Teacher key (#key)", href: "unit-4-contextual-applications/4-2-motion.html#key" },
          { label: "Teacher key PDF", href: "../keys/calc/4-2-motion-teacher.pdf" },
          { label: "Make-up notes PDF", href: "../keys/calc/4-2-motion-makeup.pdf" }
        ]
      },
      {
        type: "lesson",
        icon: "🧫",
        title: "4.3 Rates of Change in Other Contexts",
        href: "unit-4-contextual-applications/4-3-rates-other.html",
        blurb: "Compare an average rate with the rate right now, in growth, money and water stories. Four hands-on stations, then problems. Go at your own pace; your work saves so you can finish tomorrow.",
        tags: ["average rate", "instantaneous rate", "self-paced", "interactive", "online notes + PDF"],
        teacher: [
          { label: "Teacher key (#key)", href: "unit-4-contextual-applications/4-3-rates-other.html#key" },
          { label: "Teacher key PDF", href: "../keys/calc/4-3-rates-other-teacher.pdf" },
          { label: "Make-up notes PDF", href: "../keys/calc/4-3-rates-other-makeup.pdf" }
        ]
      }
    ]
  },
  {
    id: "unit-6",
    title: "Unit 6 · Integration and Accumulation of Change",
    blurb: "Area as accumulated change, and how a Riemann sum closes in on the exact value.",
    entries: [
      {
        type: "sim",
        icon: "∫",
        title: "Accumulation Lab",
        href: "unit-6-integration/accumulation-lab.html",
        blurb: "Two sims in one page. Drag x and watch g(x) = ∫f build up while its slope matches the height of f. Then compare left, right, midpoint and trapezoid sums as n grows.",
        tags: ["g′ = f", "Riemann sums", "over/underestimate", "error vs n"]
      }
    ]
  }
];
