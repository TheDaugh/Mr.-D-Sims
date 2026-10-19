/* Concept key for calculus: one list of what has been learned so far in the course, shown by every guided lesson
   under the "Concept key" button.  Plain data, so adding a lesson's ideas means adding objects here.

     unit   heading it appears under (entries are grouped in the order listed)
     title  the short name
     body   the content; $...$ is math
     after  optional: the id of a lesson idea the student must reach first (the lesson decides when it is unlocked),
            so the key never gives away what the lesson is about to teach.

   Unit 2 entries below are written from the standard AP Calculus content; edit any wording to match your own notes. */
(function (root) {
  root.CONCEPTS = [
    { unit: 'Unit 2 · Differentiation', title: 'The derivative as a slope',
      body: 'The derivative $f\'(a)$ is the slope of the tangent line to $y=f(x)$ at $x=a$, and the instantaneous rate of change of $f$ there.\n\n$$f\'(a)=\\lim_{h\\to 0}\\frac{f(a+h)-f(a)}{h}$$' },
    { unit: 'Unit 2 · Differentiation', title: 'Constant and power rules',
      body: '$\\dfrac{d}{dx}[c]=0$ and $\\dfrac{d}{dx}[x^n]=nx^{n-1}$ for any number $n$.\n\nExample: $\\dfrac{d}{dx}[x^5]=5x^4$, and $\\dfrac{d}{dx}[\\sqrt{x}]=\\dfrac{1}{2\\sqrt{x}}$.' },
    { unit: 'Unit 2 · Differentiation', title: 'Constant multiple and sum rules',
      body: '$\\dfrac{d}{dx}[c\\,f(x)]=c\\,f\'(x)$ and $\\dfrac{d}{dx}[f(x)\\pm g(x)]=f\'(x)\\pm g\'(x)$.\n\nDifferentiate a sum one term at a time.' },
    { unit: 'Unit 2 · Differentiation', title: 'Derivatives of $e^x$, $\\ln x$, $\\sin x$, $\\cos x$',
      body: '$\\dfrac{d}{dx}[e^x]=e^x$\n\n$\\dfrac{d}{dx}[\\ln x]=\\dfrac1x$\n\n$\\dfrac{d}{dx}[\\sin x]=\\cos x$\n\n$\\dfrac{d}{dx}[\\cos x]=-\\sin x$' },
    { unit: 'Unit 2 · Differentiation', title: 'Evaluating a derivative at a point',
      body: 'Differentiate first, then substitute. To find $f\'(2)$ for $f(x)=x^3$: $f\'(x)=3x^2$, so $f\'(2)=12$.' },
    { unit: 'Unit 2 · Differentiation', title: 'The derivative of a product is not the product of derivatives', after: 'product-rule',
      body: '$(fg)\'\\ne f\'g\'$. For $f=x^2$ and $g=x^3$ at $x=1$ the true value is $5$, but $f\'g\'=6$.' },
    { unit: 'Unit 2 · Differentiation', title: 'The product rule', after: 'product-rule',
      body: '$$\\frac{d}{dx}[f(x)g(x)]=f\'(x)g(x)+f(x)g\'(x)$$\n\nName $f$ and $g$, differentiate each, then assemble $f\'g+fg\'$. Each term has one derivative and one original function. In the rectangle, the two strips are the two terms and the corner is too small to matter.' }
  ];
})(window);
