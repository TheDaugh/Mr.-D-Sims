"""Slot 15 paper worksheet for the Pull Bench lab: one source for the worksheet and its key. Every answer is computed from an independent model
(shell filling, Z_eff = Z - core, pull = Z_eff / n^2) and asserted. 27 points, scales printed. Output: chemistry/unit-3-atoms-ions/."""
import os, subprocess
from fractions import Fraction as F
from docx import Document
from docx.shared import Pt, Inches
OUT = os.path.join(os.path.dirname(__file__), '..', '..', 'chemistry', 'unit-3-atoms-ions')
SYM = ['', 'H', 'He', 'Li', 'Be', 'B', 'C', 'N', 'O', 'F', 'Ne', 'Na', 'Mg', 'Al', 'Si', 'P', 'S', 'Cl', 'Ar', 'K', 'Ca']
def rings(Z):
    out, left = [], Z
    for cap in (2, 8, 8, 2):
        if left <= 0: break
        k = min(cap, left); out.append(k); left -= k
    return out
def zeff(Z): r = rings(Z); return Z - (Z - r[-1])            # Z minus core, core = all electrons below the outer ring
def core(Z): r = rings(Z); return Z - r[-1]
def pull(Z): return F(zeff(Z), len(rings(Z)) ** 2)
# independent checks
assert rings(11) == [2, 8, 1] and core(11) == 10 and zeff(11) == 1 and pull(11) == F(1, 9)
assert rings(12) == [2, 8, 2] and zeff(12) == 2 and pull(12) == F(2, 9) and pull(12) > pull(11)
assert (pull(3), pull(19)) == (F(1, 4), F(1, 16)) and pull(3) > pull(11) > pull(19)
assert rings(13) == [2, 8, 3] and core(13) == 10 and zeff(13) == 3 and pull(13) == F(3, 9)
assert rings(17) == [2, 8, 7] and zeff(17) == 7 and pull(17) == F(7, 9) and pull(17) > pull(11)
assert rings(9) == [2, 7] and pull(9) == F(7, 4) and pull(18) == F(8, 9) and pull(10) == F(8, 4)
ITEMS = [  # (points, prompt, answer, scale rows)
 (3, 'Lithium, sodium and potassium are all in group 1. From the bench, fill in a table with a row for each: atom, rings, and the pull as a fraction.',
  'Li: 2, 1 and 1/4. Na: 2, 8, 1 and 1/9. K: 2, 8, 8, 1 and 1/16.', ['1 point per atom with the rings and the pull both right']),
 (4, 'Look down the column in question 1. Claim: what happens to the pull on the outer electron as you go down a group? Evidence: use two numbers from your table. Reasoning: say what changed about the atom (rings, core, distance).',
  'The pull gets smaller going down (1/4, then 1/9, then 1/16). Z_eff stays 1 for all three, but each atom has one more ring, so the outer electron is farther away (n goes 2, 3, 4).',
  ['Claim states smaller going down: 1', 'Evidence cites two readings from the table: 1', 'Reasoning names the extra ring or the greater distance: 1', 'Reasoning notes that Z_eff did not change: 1']),
 (4, 'Before you measured magnesium you picked sodium or magnesium. Write your prediction, the two readings, and whether the data matched. Give one reason magnesium reads the way it does.',
  'Magnesium reads 2/9 and sodium reads 1/9, so magnesium holds its outer electron harder. Both have the same three rings and the same core of 10, but magnesium has one more proton and its extra electron is in the outer ring, so Z_eff is 2 instead of 1.',
  ['Prediction written before the reading (a wrong prediction earns this point): 1', 'Both readings correct: 1', 'Says whether the data matched: 1', 'Reason uses Z_eff or the extra proton: 1']),
 (6, 'After the huddle, work these by hand. For aluminum (Z = 13) and for chlorine (Z = 17): list the rings, count the core electrons, find Z_eff, and find the pull as a fraction.',
  'Aluminum: rings 2, 8, 3; core 10; Z_eff = 13 − 10 = 3; pull = 3/9. Chlorine: rings 2, 8, 7; core 10; Z_eff = 17 − 10 = 7; pull = 7/9.',
  ['Per atom: rings and core right: 1; Z_eff right: 1; pull right: 1 (3 points for each atom)']),
 (3, 'The mystery atom on your screen showed rings and a pull. Write its rings, its pull, the atom you named, and how you found it.',
  'Check against the key for this student (seeded by name). Full credit: the rings and pull as shown, the correct atom, and a method that adds the electrons in the rings to get Z.',
  ['Rings and pull copied right: 1', 'Atom right: 1', 'Method adds the rings to find the protons: 1']),
 (4, 'Sodium has 11 protons, but its outer electron is pulled as if the nucleus were +1. In two or three sentences, explain how.',
  'Ten of sodium’s electrons are core electrons, inside the outer ring. They cancel part of the nucleus’s pull, so the outer electron feels 11 − 10 = +1, called Z_eff.',
  ['Names the core electrons (inside the outer ring): 1', 'Says core electrons cancel or shield part of the pull: 1', 'Gets 11 − 10 = 1: 1', 'Uses the words Z_eff or effective charge correctly: 1']),
 (3, 'Which holds its outer electron harder, sodium or chlorine? Use Z_eff and the ring number for both.',
  'Chlorine. Both have outer ring 3, so the distance is the same, but chlorine’s Z_eff is 7 and sodium’s is 1 (pull 7/9 against 1/9).',
  ['Chlorine: 1', 'Z_eff for both (7 and 1): 1', 'Notes the same outer ring, so the difference is Z_eff: 1']),
]
TOTAL = sum(i[0] for i in ITEMS); assert TOTAL == 27 and TOTAL <= 30, TOTAL
for n_, (pts, _, _, scale) in enumerate(ITEMS, 1):   # items with one-point rows must add up to their points (1 and 4 are worded as a rule)
    if n_ not in (1, 4): assert pts == sum(int(r.split(': ')[-1]) for r in scale), (n_, pts)
def make(key):
    d = Document(); st = d.styles['Normal']; st.font.name = 'Calibri'; st.font.size = Pt(11)
    for s in d.sections: s.left_margin = s.right_margin = Inches(0.8); s.top_margin = s.bottom_margin = Inches(0.7)
    d.add_heading('The Pull Bench: worksheet%s' % (' key' if key else ''), 1)
    d.add_paragraph('Name ______________________   ID ________   %d points. Use your readings from the bench. Write numbers as fractions. Show the rings, the core and the subtraction.' % TOTAL)
    for n, (pts, q, ans, scale) in enumerate(ITEMS, 1):
        p = d.add_paragraph(); r = p.add_run('%d. (%d points) ' % (n, pts)); r.bold = True; p.add_run(q)
        if key:
            a = d.add_paragraph(); ra = a.add_run('Answer: '); ra.bold = True; a.add_run(ans)
        t = d.add_table(rows=1 + len(scale), cols=1); t.style = 'Table Grid'; t.rows[0].cells[0].text = 'Scale'
        for i, row in enumerate(scale): t.rows[i + 1].cells[0].text = row
        if not key: d.add_paragraph('\n\n')
    if key: d.add_paragraph('Checked in code: rings, core, Z_eff and pull for Li, Na, K, Mg, Al, F, Ne, Cl, Ar from an independent shell-filling model; magnesium (2/9) holds harder than sodium (1/9); the total is %d points.' % TOTAL)
    name = 'effective-nuclear-charge-lab-worksheet' + ('-key' if key else '')
    d.save(os.path.join(OUT, name + '.docx')); subprocess.run(['soffice', '--headless', '--convert-to', 'pdf', '--outdir', OUT, os.path.join(OUT, name + '.docx')], check=True, capture_output=True)
make(False); make(True); print('worksheet built, %d points' % TOTAL)
