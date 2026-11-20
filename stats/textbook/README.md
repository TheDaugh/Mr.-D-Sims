# Stats textbook

`Unit4_Two-Variable_Data.pdf` is Chapter 4 (sections 4.1 to 4.6), in an FHSST-style layout (margin icons, gray definitions, step-by-step worked examples) adapted for this class: a picture first in every section, the same stories as the class notes, worked examples that fade, a Say it frame and a Watch out box per section, exercises from easy to the test's form, an "On the site" pointer to the practice checker, and answers at the back.

Rebuild: `cd src && python3 build.py` (needs pdflatex with tcolorbox; figures are in `src/fig/`, made with the class notes). Every number is asserted in `build.py` and `sections.py`. Copy the PDF up one folder after building.

`Unit3_The_Normal_Distribution.pdf` is Chapter 3 (sections 3.1 to 3.6), built the same way: `cd src3 && python3 book3.py` (the layout preamble is `pre.tex`, taken from Chapter 4's `src/build.py`). Its figures are the Unit 3 notes figures.
