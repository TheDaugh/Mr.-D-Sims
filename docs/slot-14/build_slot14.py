#!/usr/bin/env python3
"""Slot 14 (Honors Chemistry Unit 3): The table as a map of configurations. Direct instruction day.
One source for the typed notes, the board script, the problem sheet and key, and the exit slips.
Every number is computed here from an independent shell-filling model and asserted.
Run from this folder:  python3 build_slot14.py   (needs pdflatex, xelatex, matplotlib, python-docx, soffice)."""
import os, re, subprocess, sys, shutil
HERE = os.path.dirname(os.path.abspath(__file__)); os.chdir(HERE)
OUT = os.path.join(HERE, 'out'); os.makedirs(OUT, exist_ok=True)

# ---------------------------------------------------------------- model (independent of any page code)
SYM = ['', 'H','He','Li','Be','B','C','N','O','F','Ne','Na','Mg','Al','Si','P','S','Cl','Ar','K','Ca','Sc','Ti','V','Cr','Mn','Fe','Co','Ni','Cu','Zn','Ga','Ge','As','Se','Br','Kr']
NAME = ['', 'hydrogen','helium','lithium','beryllium','boron','carbon','nitrogen','oxygen','fluorine','neon','sodium','magnesium','aluminum','silicon','phosphorus','sulfur','chlorine','argon','potassium','calcium','scandium','titanium','vanadium','chromium','manganese','iron','cobalt','nickel','copper','zinc','gallium','germanium','arsenic','selenium','bromine','krypton']
ORDER = [(1,'s',2),(2,'s',2),(2,'p',6),(3,'s',2),(3,'p',6),(4,'s',2),(3,'d',10),(4,'p',6)]   # filling order through Z = 36
def config(Z):
    left, out = Z, []
    for n, l, cap in ORDER:
        if left <= 0: break
        k = min(cap, left); out.append((n, l, k)); left -= k
    assert left == 0
    return out
def position(Z):
    c = config(Z); n, l, k = c[-1]
    period = max(x[0] for x in c)
    if l == 's': group = 18 if Z == 2 else k
    elif l == 'p': group = 12 + k
    else: group = 2 + k
    return dict(Z=Z, sym=SYM[Z], name=NAME[Z], period=period, block=l, group=group, last=(n, l, k))
POS = {Z: position(Z) for Z in range(1, 37)}
def sup(k): return '^{%d}' % k
def tex_cfg(parts): return ''.join('%d%s^{%d}' % (n, l, k) for n, l, k in parts)
def valence_cfg(Z):
    """valence configuration of a main-group atom from the model (outer shell only); He is 1s2"""
    c = config(Z); n = max(x[0] for x in c); return [x for x in c if x[0] == n]
def vcount(Z): return sum(k for _, _, k in valence_cfg(Z))
def from_position(period, group):
    """the rule taught today: main-group valence configuration from period and group only"""
    if group == 1: return [(period, 's', 1)]
    if group == 2: return [(period, 's', 2)]
    assert 13 <= group <= 18
    if period == 1: return [(1, 's', 2)]
    return [(period, 's', 2), (period, 'p', group - 12)]
def at(period, group):
    m = [z for z in POS if POS[z]['period'] == period and POS[z]['group'] == group]; assert len(m) == 1, (period, group, m); return m[0]

# --- model checks: the table as drawn
COLS = {1: [1, 18], 2: [1, 2] + list(range(13, 19)), 3: [1, 2] + list(range(13, 19)), 4: list(range(1, 19))}
for p in COLS:
    got = sorted(POS[z]['group'] for z in POS if POS[z]['period'] == p)
    assert got == sorted(COLS[p]), (p, got)
assert [len(COLS[p]) for p in (1, 2, 3, 4)] == [2, 8, 8, 18]
assert sum(len(COLS[p]) for p in COLS) == 36
for z in range(1, 37):                        # the rule from position reproduces the model for every main-group atom
    P = POS[z]
    if P['block'] in 'sp' and not (z in (2,)) :
        assert from_position(P['period'], P['group']) == valence_cfg(z), z
assert valence_cfg(2) == [(1, 's', 2)] and vcount(2) == 2          # He is the group 18 exception
assert vcount(18) == 8 and vcount(10) == 8
for z in range(1, 37):
    P = POS[z]
    if P['block'] == 's' and z != 2: assert vcount(z) == P['group']
    if P['block'] == 'p': assert vcount(z) == P['group'] - 10
assert POS[28]['block'] == 'd' and POS[28]['period'] == 4 and POS[28]['group'] == 10 and sum(k for *_, k in config(28)) == 28
assert tex_cfg(config(16)) == '1s^{2}2s^{2}2p^{6}3s^{2}3p^{4}'

# ---------------------------------------------------------------- the clock (assert it sums to the period)
CLOCK = [('Launcher', 6), ('Story and goal', 3), ('Presentation', 10), ('Guidance', 7), ('Practice', 15), ('Feedback', 4), ('Exit slip', 3), ('Up Next', 2)]
assert sum(m for _, m in CLOCK) == 50
START, t = {}, 0
for name, m in CLOCK: START[name] = t; t += m
def mmss(m): return '%d:%02d' % (m, 0)
def span(name): return '%s--%s' % (mmss(START[name]), mmss(START[name] + dict(CLOCK)[name]))

# ---------------------------------------------------------------- keepers, live questions, examples
KEEP = [
 'Period = row = the outer shell number. Rows hold 2, 8, 8, 18.',
 'Block = the subshell filling last: $s$ is groups 1--2, $p$ is groups 13--18, $d$ is groups 3--12.',
 'The $d$ subshell is one shell behind its period: $3d$ sits in period 4.',
 'Group 1: $ns^{1}$. Group 2: $ns^{2}$.',
 'Groups 13--18: $ns^{2}np^{\\,g-12}$, where $g$ is the group number.',
 'Valence electrons: groups 1--2 equal $g$; groups 13--18 equal $g-10$.',
 'Helium is in group 18 but is $1s^{2}$: 2 valence electrons.',
 'Sulfur: period 3, group 16 gives $3s^{2}3p^{4}$ (6 valence).',
 'Gallium: period 4, group 13 gives $4s^{2}4p^{1}$ (3 valence).']
assert len(KEEP) == 9
S = at(3, 16); G = at(4, 13)
assert SYM[S] == 'S' and tex_cfg(from_position(3, 16)) == '3s^{2}3p^{4}' and vcount(S) == 6
assert SYM[G] == 'Ga' and tex_cfg(from_position(4, 13)) == '4s^{2}4p^{1}' and vcount(G) == 3
LIVE = ['Period 3 has 8 elements and period 4 has 18. What does period 4 have that period 3 does not?',
        'Which block are potassium, iron and gallium in?',
        'Chlorine is in group 17. Write its valence configuration and count its valence electrons.']
assert len(LIVE) <= 3
assert POS[19]['block'] == 's' and POS[26]['block'] == 'd' and POS[31]['block'] == 'p'
assert tex_cfg(from_position(3, 17)) == '3s^{2}3p^{5}' and vcount(17) == 7
EXIT_POS = (3, 14); EXIT_Z = at(*EXIT_POS); assert SYM[EXIT_Z] == 'Si' and tex_cfg(from_position(*EXIT_POS)) == '3s^{2}3p^{2}' and vcount(EXIT_Z) == 4

# ---------------------------------------------------------------- problem sheet (core of about 8 items fits 15 minutes)
def cfgtxt(parts): return ''.join('%d%s$^{%d}$' % (n, l, k) for n, l, k in parts)
def cfgtex(parts): return '$' + tex_cfg(parts) + '$'
def ans_pos(z): P = POS[z]; return '%s block, period %d, group %d' % (P['block'], P['period'], P['group'])
# Modules: Review (L), Concept (C), Practice (P), Challenge (H). (id, spice, minutes, prompt, answer, watch, hints)
cfg = lambda z: tex_cfg(config(z))
# --- Review (launcher): done as they sit down, notes face down
assert cfg(3) == '1s^{2}2s^{1}' and cfg(11) == '1s^{2}2s^{2}2p^{6}3s^{1}' and POS[19]['period'] == 4
LAUNCH = [
 ('L1', 'Write the full configuration of lithium (Z = 3).', '$1s^{2}2s^{1}$.'),
 ('L2', 'Write the full configuration of sodium (Z = 11).', '$1s^{2}2s^{2}2p^{6}3s^{1}$.'),
 ('L3', 'Lithium and sodium are in the same group. What do the last pieces of their configurations have in common?', 'Both end in $s^{1}$: one electron in the outer shell. This is the slot 13 pattern (group 1) showing up as a configuration.'),
 ('L4', 'Guess, no penalty: how many elements are in the fourth row of the periodic table?', 'The answer is 18. Do not say so yet. Come back to the guess at 13:00 (live C1) and ask who was close.')]
# --- Concept: C1 to C3 are the three live questions (whiteboards); C4 to C6 are words-only sheet items
c1 = 'Period 3 has 8 elements and period 4 has 18. What does period 4 have that period 3 does not?'
assert c1 == LIVE[0] and LIVE[1].startswith('Which block') and LIVE[2].startswith('Chlorine')
RK = {'A': 17, 'B': 12, 'C': 13, 'D': 18}   # Cl, Mg, Al, Ar
assert [SYM[z] for z in RK.values()] == ['Cl', 'Mg', 'Al', 'Ar']
rank = sorted(RK, key=lambda k: vcount(RK[k])); assert rank == ['B', 'C', 'A', 'D'] and len({vcount(z) for z in RK.values()}) == 4
assert (vcount(2), vcount(10), vcount(18), vcount(36)) == (2, 8, 8, 8) and config(2) == [(1, 's', 2)]
CONC = [
 ('C1', 2, None, c1, 'The $3d$ subshell: ten more boxes between $4s$ and $4p$. Check the L4 guess (18).', 'Period 4 has 8 elements like the others.', None),
 ('C2', 1, None, LIVE[1], 'K is $s$, Fe is $d$, Ga is $p$.', 'The $d$ block starts at shell 3.', None),
 ('C3', 2, None, LIVE[2], '$3s^{2}3p^{5}$, 7 valence electrons.', None, None),
 ('C4', 2, 1.5, 'Think and rank. Without looking at the table, rank these atoms from the fewest valence electrons to the most: (A) chlorine, (B) magnesium, (C) aluminum, (D) argon. Then check on the table.',
  'B, C, A, D: magnesium 2, aluminum 3, chlorine 7, argon 8.', 'Ranking by atomic number (12, 13, 17, 18) happens to give the same order here. Ask: would it for sodium and neon? No: neon (8) has more valence electrons than sodium (1) but a lower Z than sodium.', None),
 ('C5', 2, 1.5, 'A student says: ``Every atom in group 18 has 8 valence electrons.\'\' When is that true, and when is it not?',
  'True for neon, argon and krypton ($g-10=8$). Not true for helium: it has only the $1s$ subshell, so 2 valence electrons.', 'Group 18 means 8 for helium. It has only the 1s subshell.', None),
 ('C6', 2, 1.5, 'A student writes: ``Arsenic is in period 4, group 15, so it is $4s^{2}3d^{3}$.\'\' Find the error and fix it.',
  'Group 15 is in the $p$ block (groups 13--18), not the $d$ block (groups 3--12). Arsenic is $4s^{2}4p^{3}$, with 5 valence electrons.', 'The d block is groups 3--12 only.', None)]
assert SYM[at(4, 15)] == 'As' and from_position(4, 15) == [(4, 's', 2), (4, 'p', 3)] and vcount(at(4, 15)) == 5
# --- Practice: P1 to P5 are the core (with C4 to C6); P6 to P9 are the bank
a, b, c = at(3, 2), at(3, 17), at(4, 8)
assert (SYM[a], SYM[b], SYM[c]) == ('Mg', 'Cl', 'Fe')
assert SYM[at(3, 13)] == 'Al' and SYM[at(3, 15)] == 'P' and SYM[at(2, 2)] == 'Be'
assert SYM[at(3, 1)] == 'Na' and SYM[at(4, 14)] == 'Ge' and from_position(4, 14) == [(4, 's', 2), (4, 'p', 2)]
assert cfg(28) == '1s^{2}2s^{2}2p^{6}3s^{2}3p^{6}4s^{2}3d^{8}'
PRAC = [
 ('P1', 1, 2.5, 'On the table above, shade the $s$ block, the $p$ block and the $d$ block with three different patterns. Write the period number beside each row. Mark with an arrow where the $f$ block would sit.',
  'Groups 1--2 shaded $s$ (He also sits in group 18 but is an $s$-element); groups 13--18 shaded $p$; groups 3--12 shaded $d$ (period 4 only). Periods 1 to 4 down the side. The $f$ block is named only: it sits below the table.', None, None),
 ('P2', 1, 1.5, 'Give the block, period and group of (a) magnesium (Z = 12), (b) chlorine (Z = 17), (c) iron (Z = 26). Read them off the table.',
  '(a) %s. (b) %s. (c) %s.' % (ans_pos(a), ans_pos(b), ans_pos(c)), None, None),
 ('P3', 1, 2.0, 'Write the valence configuration, with no full configuration, for the element in (a) period 2, group 2; (b) period 3, group 13; (c) period 3, group 15.',
  '(a) %s. (b) %s. (c) %s.' % (cfgtex(from_position(2, 2)), cfgtex(from_position(3, 13)), cfgtex(from_position(3, 15))), None, None),
 ('P4', 2, 1.5, 'Which element has the valence configuration (a) $3s^{1}$? (b) $4s^{2}4p^{2}$? Give its period and group.',
  '(a) Na, period 3, group 1. (b) Ge, period 4, group 14.', None, None),
 ('P5', 2, 2.0, 'An atom\'s full configuration is $1s^{2}2s^{2}2p^{6}3s^{2}3p^{6}4s^{2}3d^{8}$. Add up the electrons to find Z, then give the element, block, period and group.',
  '$2+2+6+2+6+2+8 = 28$: nickel, d block, period 4, group 10. The last subshell filled is $3d$, so it is a $d$-block atom, and its period is the highest shell, 4.',
  'Students stop at 3d and call nickel period 3. The period is the highest shell number (4), not 3. ASK: what is the highest shell number?', None),
 ('P6', 2, None, 'Give the block, period and group of (a) potassium (Z = 19), (b) gallium (Z = 31), (c) krypton (Z = 36). Then write the valence configuration of (b) and (c).',
  '(a) %s. (b) %s; valence %s. (c) %s; valence %s, 8 valence electrons.' % (ans_pos(19), ans_pos(31), cfgtex(valence_cfg(31)), ans_pos(36), cfgtex(valence_cfg(36))),
  'Gallium has 3d10 filled, but 3d is not in the outer shell. Valence means the outer shell: 4s and 4p only.', None),
 ('P7', 1, None, 'Which element has the valence configuration (a) $2s^{2}2p^{4}$? (b) $4s^{2}4p^{5}$? How many valence electrons does each have?', '(a) O, 6. (b) Br, 7.', None, None),
 ('P8', 2, None, 'An element is in period 4, the $d$ block, group 7. Name it and give its atomic number.',
  'Manganese, Z = 25. Its full configuration ends $4s^{2}3d^{5}$.', 'Period 4, not period 3: the 3d subshell fills after 4s.', None),
 ('P9', 2, None, 'Which element in period 3 has 3 valence electrons? Which has 5? Which has 7?', 'Al, P and Cl.', None, None)]
assert vcount(36) == 8 and vcount(31) == 3 and SYM[at(2, 16)] == 'O' and SYM[at(4, 17)] == 'Br' and vcount(8) == 6 and vcount(35) == 7
assert SYM[at(4, 7)] == 'Mn' and POS[25]['block'] == 'd' and tex_cfg(config(25)).endswith('4s^{2}3d^{5}')
assert (SYM[at(3, 13)], SYM[at(3, 15)], SYM[at(3, 17)]) == ('Al', 'P', 'Cl')
CORE_IDS = ['C4', 'C5', 'C6', 'P1', 'P2', 'P3', 'P4', 'P5']
ITEM = {x[0]: x for x in CONC + PRAC}
CORE_MIN = sum(ITEM[i][2] for i in CORE_IDS); assert len(CORE_IDS) == 8 and CORE_MIN <= dict(CLOCK)['Practice'], CORE_MIN
# --- Challenge (spice 3 or 4; hints in the key only)
VAL = {z: vcount(z) for z in range(3, 19)}
assert [z for z in VAL if VAL[z] == 8] == [10, 18] and [z for z in VAL if VAL[z] == 1] == [3, 11] and VAL[2 + 1] == 1
assert POS[19]['group'] == 1 and POS[19]['period'] == 4 and SYM[19] == 'K'
W = at(4, 16); assert W == 34 and SYM[W] == 'Se' and tex_cfg(config(34)) == '1s^{2}2s^{2}2p^{6}3s^{2}3p^{6}4s^{2}3d^{10}4p^{4}' and vcount(34) == 6
ALT = [(1, 's', 2), (2, 's', 2), (2, 'p', 6), (3, 's', 2), (3, 'p', 6), (3, 'd', 10), (4, 's', 2), (4, 'p', 6)]
cap = lambda sub: dict(s=2, p=6, d=10)[sub]; rows = {}
for n_, l_, k_ in ALT: rows[n_] = rows.get(n_, 0) + k_
assert [rows[i] for i in (1, 2, 3, 4)] == [2, 8, 18, 8] and sum(rows.values()) == 36
def valplot():
    bars = ''.join('\\fill[red!70!black] (%d,0) rectangle (%d.8,%.1f);' % (z - 3, z - 3, VAL[z] * 0.28) for z in VAL)
    ticks = ''.join('\\node[font=\\scriptsize,below] at (%d.4,0){%d};' % (z - 3, z) for z in VAL)
    ys = ''.join('\\node[font=\\scriptsize,left] at (0,%.2f){%d};' % (v * 0.28, v) for v in (0, 2, 4, 6, 8))
    return '\\begin{center}\\begin{tikzpicture}[x=0.36cm]' + bars + '\\draw (0,0)--(16.2,0);\\draw (0,0)--(0,2.4);' + ticks + ys + \
           '\\node[font=\\scriptsize] at (8,-0.8){atomic number $Z$};\\node[font=\\scriptsize,rotate=90] at (-1.2,1.2){valence electrons};\\end{tikzpicture}\\end{center}'
HARD = [
 ('H1', 3, None, 'The graph shows the number of valence electrons for every atom from $Z=3$ to $Z=18$.\\par\\medskip\n' + valplot() +
  '(a) At which $Z$ does the graph reach 8, each time? (b) At which $Z$ does it fall back to 1? (c) How many elements are between those two falls? Say what that number means about the shell. (d) Predict the next $Z$ where the graph would show 1, and name the element.',
  '(a) $Z=10$ and $Z=18$ (neon and argon). (b) $Z=3$ and $Z=11$ (lithium and sodium). (c) 8 elements, $Z=3$ to $10$: that is the $s$ and $p$ boxes of one shell (2 + 6). (d) $Z=19$, potassium: period 4, group 1, $4s^{1}$.',
  'Students say the next 1 is at $Z=19$ and stop. Ask: what else fills before the next $p$ block? (the 3d, ten more elements, but they are not on this graph).',
  ['Look at the heights first. Which $Z$ values reach the tallest bar, and which sit at the shortest?', 'Each fall back to 1 starts a new row of the table. Count the bars from one fall to the next.', 'The two falls are at $Z=3$ and $Z=11$. The gap between them is $11-3=$ ?. Then add that gap to 11 and check against the ladder.']),
 ('H2', 3, None, 'An atom has 34 electrons. Use the filling order to write its full configuration, then give its period, block, group, valence configuration and number of valence electrons.',
  'Full: $%s$. The last subshell filled is $4p$, so $p$ block, period 4, group $4p^{4}\\to 12+4=16$. Selenium (Se), valence $4s^{2}4p^{4}$, 6 valence electrons. Check: $16-10=6$.' % tex_cfg(config(34)),
  'Counting $3d^{10}$ as valence (16 valence electrons), or calling it period 3.',
  ['Fill the subshells in the ladder order and keep a running total of electrons.', 'Stop at 34 total. The last subshell you filled names the block, and the highest shell number is the period.', 'Running total: $1s$ 2, $2s$ 4, $2p$ 10, $3s$ 12, $3p$ 18, $4s$ 20, $3d$ 30. Four electrons are left for $4p$.']),
 ('H3', 3, None, 'A student says: ``Chlorine is in group 17, so it has 17 valence electrons.\'\' Write a reply, in two or three sentences, that corrects the claim and tells the student how to get the right number from the table.',
  'Group 17 is the 17th column, not the electron count. Chlorine is in period 3, the $p$ block; its valence configuration is $3s^{2}3p^{5}$, so it has 7 valence electrons ($g-10=7$). The first ten columns are not counted because the $d$ block (groups 3--12) sits between group 2 and group 13.',
  'Reply says only ``it is 7\'\' with no reason. A full reply gives the number and the rule.',
  ['Where does the student get the number 17? What does that number actually count?', 'Which block is group 17 in, and which subshells does it fill in its own shell?', 'Write the valence configuration of chlorine, count the electrons, then say why the group number and the electron count differ by 10.']),
 ('H4', 4, None, 'Suppose the filling order were $1s,\\ 2s,\\ 2p,\\ 3s,\\ 3p,\\ 3d,\\ 4s,\\ 4p$ (the $3d$ before $4s$). Start a new row each time the outer shell number goes up. How many elements would each of the four rows hold? Explain in one sentence why the real table has rows of 2, 8, 8 and 18 instead.',
  'Rows of 2, 8, 18 and 8. Real order: $4s$ fills before $3d$, so the $3d$ boxes land in shell 4. Because the row number is the highest shell filled, those ten boxes go in period 4.',
  'Students rebuild the real order and answer 2, 8, 8, 18. Ask: which subshell did you put third in the list?',
  ['Count boxes in each subshell: $s$ is 2 electrons, $p$ is 6, $d$ is 10. Then list which subshells belong to which shell number.', 'In the new order, shell 3 owns $3s$, $3p$ and $3d$ before shell 4 starts. Add them up.', 'Row 1: $2$. Row 2: $2+6=8$. Row 3: $2+6+10=$ ? Row 4: $2+6=$ ?. The total must be 36. Then compare with the real rows, 2, 8, 8, 18.'])]
BANK_IDS = ['P6', 'P7', 'P8', 'P9']
assert len(LIVE) <= 3 and all(h[1] >= 3 for h in HARD) and [x[0] for x in CONC][:3] == ['C1', 'C2', 'C3']

# ---------------------------------------------------------------- the table figure (TikZ), shared by notes, script and sheet
COLOR = {'s': 'blue!14', 'p': 'green!16', 'd': 'orange!22'}
def table_tikz(symbols=True, shade=True, scale=0.34, marks=None):
    s = ['\\begin{tikzpicture}[x=%.2fin,y=-%.2fin,every node/.style={font=\\scriptsize\\sffamily}]' % (scale, scale)]
    for g in range(1, 19): s.append('\\node[font=\\tiny\\sffamily] at (%.2f,-0.35) {%d};' % (g - .5, g))
    for p in range(1, 5): s.append('\\node[font=\\tiny\\sffamily] at (-0.4,%.2f) {%d};' % (p - .5, p))
    for z in range(1, 37):
        P = POS[z]; x, y = P['group'] - 1, P['period'] - 1
        fill = ('\\fill[%s] (%d,%d) rectangle (%d,%d);' % (COLOR[P['block']], x, y, x + 1, y + 1)) if shade else ''
        s.append(fill + '\\draw[gray!70,line width=0.3pt] (%d,%d) rectangle (%d,%d);' % (x, y, x + 1, y + 1))
        if symbols: s.append('\\node at (%.2f,%.2f) {%s};' % (x + .5, y + .5, P['sym']))
    s.append('\\node[font=\\tiny\\sffamily,anchor=west] at (0,4.45) {group number across the top, period number down the side. The $f$ block (not drawn) sits below the table.};')
    if shade:
        for i, (b, lab) in enumerate([('s', '$s$ block'), ('p', '$p$ block'), ('d', '$d$ block')]):
            s.append('\\fill[%s] (%d,4.8) rectangle (%.1f,5.3);\\draw[gray!70,line width=0.3pt] (%d,4.8) rectangle (%.1f,5.3);\\node[anchor=west,font=\\tiny\\sffamily] at (%.1f,5.05) {%s};' % (COLOR[b], 1 + i * 4, 1.5 + i * 4, 1 + i * 4, 1.5 + i * 4, 1.6 + i * 4, lab))
    s.append('\\end{tikzpicture}')
    return '\n'.join(s)
RING_ROWS = [(1, '$1s$', 2), (2, '$2s\\;2p$', 8), (3, '$3s\\;3p$', 8), (4, '$4s\\;3d\\;4p$', 18)]
for p, _, cap in RING_ROWS: assert cap == len(COLS[p])
assert [2, 2 + 6, 2 + 6, 2 + 10 + 6] == [r[2] for r in RING_ROWS]
FILL_TABLE = '\\begin{tabular}{@{}clc@{}}\\toprule Period (outer shell) & Subshells that fill, in order & Elements\\\\\\midrule\n' + \
    '\\\\\n'.join('%d & %s & %d' % r for r in RING_ROWS) + '\\\\\\bottomrule\\end{tabular}'

# ---------------------------------------------------------------- shared rows: (id, left TeX (shared word for word), notes-only extra, script margin)
BIGQ = 'If I tell you only where an element sits on the table, what can you say about its electrons?'
ROWS = [
 ('story',
  '\\sect{The table was a map before anyone could read it}\n'
  'In 1869 Mendeleev set the elements in rows by mass and by how they behaved, and left gaps for elements nobody had found. It worked, and nobody knew why. Around 1913 Moseley showed that the true order was by atomic number. Within about fifteen years the shell model gave the reason: the rows are shells filling and the columns are the electrons left over in the outer shell. Today we draw the table from the configurations we wrote in slots 9 and 10, and then read it backwards.',
  '', ['SAY 6:00--9:00', 'Ninety seconds, no more. Mendeleev placed elements without a reason; we can say why. Hedge the dates: ``around 1913,\'\' ``within about fifteen years.\'\'', 'EXPERT: Mendeleev ordered by mass and swapped Te and I to keep the chemistry right. The atomic number explained the swaps.']),
 ('bigq', '', '', ['SAY 8:00', 'Write the big question on the board, in the box. Return to it at the keepers and at the end.']),
 ('chunkA',
  '\\sect{A. Build the table from the ladder}\n'
  'Fill the subshells in the order from slot 9: $1s,\\ 2s,\\ 2p,\\ 3s,\\ 3p,\\ 4s,\\ 3d,\\ 4p$. Start a new row each time the outer shell number goes up. That gives four rows.\\par\\medskip\n'
  '\\begin{center}' + FILL_TABLE + '\\end{center}\n'
  '\\begin{description}[leftmargin=1.2em,itemsep=2pt]\n'
  '\\item[Period] A row. Its number is the outer shell number, so period 3 means the outer electrons are in shell 3.\n'
  '\\item[Block] The subshell that fills last. The $s$ block is groups 1 and 2. The $p$ block is groups 13 to 18. The $d$ block is groups 3 to 12.\n'
  '\\end{description}\\par\n'
  '\\textbf{The $d$ subshell is one shell behind its period.} The $3d$ boxes fill after $4s$, so they sit in period 4.',
  '\\begin{remark}[Going deeper]The $f$ block works the same way: $4f$ fills after $6s$, so those 14 columns sit under the table. We only name it today.\\end{remark}\n',
  ['SAY 9:00--14:00', 'Slow. Fill the ladder on the board in the slot 9 order and put the cut after 1s, after 2p, after 3p, after 4p. Row sizes come out 2, 8, 8, 18 by counting boxes. Do not tell them the rows; let them count. EXCALIDRAW: use the energy-ladder stencil, then the blank-table stencil.',
   'COPY 1, COPY 2, COPY 3', 'ASK 13:00 (whiteboards, sample two): sheet C1. ' + LIVE[0] + '  Check the L4 guess.' + ' Answer: the $3d$ subshell, ten more boxes. ' ,
   'WATCH FOR: ``Period 4 has 8 elements like the others.\'\' Ask: where did the 3d electrons go?', 'WATCH FOR: ``The d block starts at shell 3.\'\' 3d is in period 4. Point at the ladder.',
   'EXPERT: the $4s$-before-$3d$ order is a good approximation, not a law. Cr and Cu break it. Not taught; do not volunteer.']),
 ('figure',
  '\\begin{center}\\resizebox{\\linewidth}{!}{%\n' + table_tikz(True, True) + '}\n\\end{center}\n',
  '', ['SAY', 'The table through krypton (Z = 36). Students sketch a copy in the notebook, symbols for the first two rows only, blocks shaded. The full table with symbols is on the sheet.']),
 ('chunkB',
  '\\sect{B. Valence configuration from position}\n'
  '\\begin{method*}\n'
  '1.\\ Find the period $n$ and the group $g$.\\par\n'
  '2.\\ Name the block: groups 1 and 2 are $s$, groups 13 to 18 are $p$.\\par\n'
  '3.\\ Group 1 gives $ns^{1}$. Group 2 gives $ns^{2}$. Groups 13 to 18 give $ns^{2}np^{\\,g-12}$.\\par\n'
  '4.\\ Valence electrons: $g$ for groups 1 and 2, and $g-10$ for groups 13 to 18.\n'
  '\\end{method*}\n'
  '\\textbf{One exception.} Helium is in group 18 but it is $1s^{2}$, with only 2 valence electrons, because there is no $1p$ subshell.',
  '\\begin{remark}[Common mistake]In period 4, the valence configuration of a $p$-block atom is $4s$ and $4p$ only. The $3d^{10}$ is full and is not counted. Slot 10 said valence means the outer shell.\\end{remark}\n',
  ['SAY 14:00--19:00', 'Mr. D derives it on the board once, with Cl: period 3, group 17, so $3s^{2}3p^{5}$ and 7 valence. Then the pattern for every group.',
   'COPY 4, COPY 5, COPY 6', 'ASK 17:00 (whiteboards, sample two): sheet C2. ' + LIVE[1] + ' Answer: s, d, p.',
   'COPY 7', 'WATCH FOR: ``Helium has 8 valence electrons, it is a noble gas.\'\' Ask: how many boxes does shell 1 have?',
   'ASK 18:30 (whiteboards): sheet C3. ' + LIVE[2] + ' Answer: $3s^{2}3p^{5}$, 7. This is the last live question; everything else is on the sheet.']),
 ('guidance',
  '\\sect{Worked together}\n'
  '\\begin{example}[Sulfur, together]Sulfur is in period 3, group 16. Group 16 is in the $p$ block, so the valence configuration is $ns^{2}np^{\\,g-12}=3s^{2}3p^{4}$. Valence electrons: $16-10=6$.\\end{example}\n'
  '\\begin{example}[Gallium, first step done]Gallium is in period 4, group 13. It is in the $p$ block. Finish it: $4s^{2}4p^{1}$, with $13-10=3$ valence electrons.\\end{example}',
  '',
  ['SAY 19:00--26:00', 'Sulfur with the class, every step spoken. Then gallium: the first step (the $p$ block) is on the board; students finish alone on whiteboards, then compare with a neighbor.',
   'COPY 8, COPY 9', 'APPLY: both answers are on the board for the whole practice block so students can check themselves.']),
 ('upnext',
  '\\sect{Up next}\n'
  'Lithium and sodium both end in $s^{1}$, and both react the same way. But sodium gives up its outer electron more easily. Why is sodium\'s outer electron easier to remove than lithium\'s?',
  '', ['UP NEXT 48:00--50:00', 'Ask it, do not answer it. Slot 15 is the sim that answers it. Collect the exit slips at the door.']),
]

# ---------------------------------------------------------------- LaTeX documents
def sub_flags(s, script): return s
PRE_COMMON = r'''
\usepackage[utf8]{inputenc}\usepackage[T1]{fontenc}
\usepackage{amsmath,amsthm,amssymb,enumitem,booktabs,xcolor,tikz,longtable,array,needspace,graphicx}
\usepackage{geometry}
\newcommand{\sect}[1]{\par\medskip\noindent\textbf{\large #1}\par\smallskip}
\theoremstyle{definition}\newtheorem*{example}{Example}\newtheorem*{method*}{Method}
\theoremstyle{remark}\newtheorem*{remark}{Remark}
'''
def keepers_tex(): return '\\begin{enumerate}[label=\\textbf{Copy \\arabic*.},leftmargin=4.2em,itemsep=2pt]\n' + '\n'.join('\\item ' + k for k in KEEP) + '\n\\end{enumerate}'
def bigq_box(): return '\\noindent\\fbox{\\parbox{\\dimexpr\\linewidth-2\\fboxsep-2\\fboxrule}{\\textbf{Big question.} ' + BIGQ + '}}\\par\\medskip\n'

def notes_doc():
    body = ['\\documentclass[11pt]{article}', PRE_COMMON, '\\geometry{letterpaper,margin=1in}', '\\setlength{\\parindent}{0pt}\\setlength{\\parskip}{0.5em}',
            '\\newcommand{\\mk}[1]{}', '\\begin{document}',
            '{\\Large\\textbf{The table as a map of configurations}}\\\\ Honors Chemistry $\\cdot$ Unit 3 $\\cdot$ Slot 14 $\\cdot$ typed notes\\par\\medskip']
    body.append(bigq_box())
    for rid, left, extra, _ in ROWS:
        if rid in ('bigq', 'upnext'): continue
        body.append(left); body.append(extra)
    body.append('\\sect{What to copy}\n' + keepers_tex())
    body.append('\\bigskip\\noindent\\textbf{Back to the big question.} Position on the table gives the period (the outer shell), the block (the subshell filling last) and, in the main groups, the valence configuration. The table is the configuration pattern drawn on a page.')
    body.append([r for r in ROWS if r[0] == 'upnext'][0][1])
    body.append('\\end{document}')
    return '\n'.join(body)

def script_doc():
    pre = PRE_COMMON + r'''
\usepackage{fontspec}\newfontfamily\hand{TeX Gyre Chorus}[Ligatures=TeX]
\usetikzlibrary{calc,arrows.meta,tikzmark}
\geometry{letterpaper,left=0.5in,right=0.5in,top=0.55in,bottom=0.55in}
\definecolor{pen}{HTML}{C2261B}
\newcommand{\mk}[1]{\tikz[remember picture,baseline=0.6ex]\node[inner sep=0pt](m#1){};}
\newcommand{\rem}[2]{{\hand\color{pen}\tikz[remember picture,overlay]\draw[pen,-{Stealth[length=2mm]},thick](-0.04in,0.8ex) -- ([xshift=4.64in,yshift=0.8ex]m#1.east);\ #2}}
\setlength{\parindent}{0pt}\setlength{\parskip}{0.3em}
'''
    rows, n = [], 0
    def row(left, margin_items):
        nonlocal n
        n += 1
        right = '\\par '.join(margin_items)
        rows.append('\\mk{%d}%s & \\rem{%d}{%s}\\tabularnewline[0.4em]' % (n, left, n, right))
    # the launcher (script only)
    launcher = ('\\sect{Review, sheet L1 to L4 (on the board as they arrive)}\n' + '\\quad '.join('%s.\\ %s' % (i, q) for i, q, _ in LAUNCH))
    row(launcher, ['SAY 0:00--6:00', 'They work alone, notes face down. Answers: L1 $1s^{2}2s^{1}$, L2 $1s^{2}2s^{2}2p^{6}3s^{1}$, L3 both end in $s^{1}$: one electron in the outer shell (the slot 13 pattern, group 1). Take two answers aloud.',
                    'L4 is a guess, no penalty. Do not answer it. Return to it at 13:00 (live C1): the answer is 18.',
                    'APPLY: this is where the slot 10 shorthand ($[\\mathrm{He}]2s^{1}$, $[\\mathrm{Ne}]3s^{1}$) pays off: the ends match.'])
    for rid, left, extra, margin in ROWS:
        if rid == 'upnext': continue
        if rid == 'bigq': left = bigq_box()
        row(left, margin)
    row('\\sect{What to copy}\n' + keepers_tex(), ['COPY', 'Nine keepers, spoken as they come up. Everything else is spoken. Notes face down for the practice sheet.',
                                                     'SHEET 26:00--41:00: the sheet has four modules: Review L1 to L4 (done), Concept C1 to C6 (C1 to C3 were live), Practice P1 to P9, Challenge H1 to H4 (spice 3 and 4). Core is C4 to C6 and P1 to P5 (about %.0f minutes); P6 to P9 is the bank; Challenge is for finishers. Answers in the notebook, numbered, one under another. On a 3 or 4 chili problem they write what they tried before you give a nudge (key has the hint ladders).' % CORE_MIN,
                                                     'WATCH FOR (sheet P5): students stop at 3d and call nickel period 3. ASK: what is the highest shell number?',
                                                     'SIM: if the room is behind, swap Gallium for Aluminum in guidance (period 3, group 13: $3s^{2}3p^{1}$).'])
    row('\\textbf{Feedback, 41:00--45:00.} Go through C4, P2 and P5 on the board; then the one error most common on the sheet. \\textbf{Exit slip, 45:00--48:00.} Handed out face down; students draw on paper.',
        ['SAY 41:00--45:00', 'Answers: the key. Spend the time on the common block error (call a $d$-block atom a $p$-block atom, or the other way).', 'EXIT 45:00--48:00: a drawing. They sketch the table frame (they know it now), mark the position, shade the block, and write the valence configuration. Scale on the key.'])
    _u = [r for r in ROWS if r[0] == 'upnext'][0]; row(_u[1], _u[3])
    hdr = ('\\documentclass[10pt]{article}' + pre + '\\begin{document}\n'
           '{\\Large\\textbf{Slot 14 board script: the table as a map of configurations}}\\par\n'
           '\\textit{Clock: ' + ', '.join('%s %s' % (nm, span(nm).replace('--', '-')) for nm, _ in CLOCK) + '. Excalidraw stencils to open: the blank table, the energy ladder.}\\par\\medskip\n'
           '\\begin{longtable}{@{}p{4.55in}@{\\hspace{0.35in}}p{2.55in}@{}}\n')
    return hdr + '\n'.join(rows) + '\n\\end{longtable}\n\\end{document}\n'

CHILI = r"""
\newcommand{\chili}{\tikz[baseline=-0.25ex,scale=0.5]{\fill[red!80!black](0,0.12)..controls(0.3,0.16)and(0.55,0.0)..(0.66,-0.22)..controls(0.42,-0.07)and(0.2,-0.04)..(0,-0.1)--cycle;\fill[green!45!black](-0.04,-0.02)rectangle(0.04,0.16);}}
\newcommand{\spice}[1]{\foreach\i in {1,...,#1}{\chili\,}}
"""
def item_tex(it, key, hints=False):
    i, sp, mins, q, ans = it[0], it[1], it[2], it[3], it[4]; watch = it[5] if len(it) > 5 else None
    t = '\\needspace{4\\baselineskip}\\noindent\\hangindent=7em\\hangafter=1\\makebox[7em][l]{\\textbf{%s}\\ \\spice{%d}}%s\\par' % (i, sp, q)
    if key:
        t += '\\noindent\\hangindent=7em\\hangafter=0\\hspace{7em}\\textbf{Answer.} %s\\par' % ans
        if watch: t += '\\noindent\\hspace{7em}\\textit{Likely error: %s}\\par' % watch
    return t + '\\medskip'
def sheet_doc(key):
    pre = PRE_COMMON + CHILI + '\\geometry{letterpaper,margin=0.8in}\\setlength{\\parindent}{0pt}\\setlength{\\parskip}{0.3em}'
    b = ['\\documentclass[10.5pt]{article}' + pre, '\\begin{document}',
         '{\\Large\\textbf{Slot 14 %s: the table as a map of configurations}}\\par' % ('key' if key else 'problem sheet')]
    if key:
        b.append('\\sect{When each module is used}\\begin{itemize}[itemsep=1pt,leftmargin=1.4em]\n'
                 '\\item \\textbf{Review (L1 to L4), 0:00--6:00.} On the board as students sit down; they work alone, notes face down.\n'
                 '\\item \\textbf{Concept C1 to C3} are the three live questions (whiteboards, sample two): C1 at 13:00, C2 at 17:00, C3 at 18:30. C4 to C6 are on the sheet.\n'
                 '\\item \\textbf{Practice, 26:00--41:00.} The core is C4 to C6 and P1 to P5 (%.1f minutes). P6 to P9 are the bank: finishers or homework.\n'
                 '\\item \\textbf{Challenge H1 to H4} are for students who finish the core; students write what they tried before asking for a nudge.\n'
                 '\\end{itemize}' % CORE_MIN)
    else:
        b.append('\\textit{Work in your notebook, numbered, one answer under another. No answer space here. Predict in words before you calculate. On a 3 or 4 chili problem, write what you tried first; then you may ask for a nudge.}\\par')
    b.append('\\textit{Spice: \\spice{1} one step, \\spice{2} two steps or an explanation, \\spice{3} a graph, two steps or an argument, \\spice{4} a hidden quantity.}\\par')
    b.append('\\begin{center}\n' + table_tikz(True, key) + '\n\\end{center}')
    b.append('\\sect{Review (L1 to L4)}')
    for i, q, ans in LAUNCH:
        b.append('\\noindent\\hangindent=7em\\hangafter=1\\makebox[7em][l]{\\textbf{%s}}%s\\par' % (i, q) + ('\\noindent\\hspace{7em}\\textbf{Answer.} %s\\par' % ans if key else '') + '\\smallskip')
    b.append('\\sect{Conceptual questions}')
    if not key: b.append('\\textit{C1 to C3 we do together at the board. Do C4 to C6 on your own.}\\par')
    for it in CONC: b.append(item_tex(it, key))
    b.append('\\sect{Practice}' + ('' if key else '\\textit{Core: C4 to C6 and P1 to P5. Then the rest.}\\par'))
    for it in PRAC: b.append(item_tex(it, key))
    b.append('\\sect{Challenge}')
    for it in HARD: b.append(item_tex(it, key))
    if key:
        b.append('\\sect{Hint ladders (spice 3 and 4, one rung at a time, after the student shows what was tried)}\\begin{description}[leftmargin=2.2em,itemsep=2pt]')
        for it in HARD:
            b.append('\\item[%s] (1) %s\\ (2) %s\\ (3) %s' % ((it[0],) + tuple(it[6])))
        b.append('\\end{description}')
        b.append('\\sect{Exit slip scale (3 points)}\\begin{tabular}{@{}lc@{}}\\toprule Row & Points\\\\\\midrule\n'
                 'Position marked at the right period and group & 1\\\\\nThe right block shaded & 1\\\\\nValence configuration and valence count written, matching the position & 1\\\\\\bottomrule\\end{tabular}\\par\n'
                 'Answer for the slip: period %d, group %d is %s, $p$ block, %s, %d valence electrons.' % (EXIT_POS[0], EXIT_POS[1], NAME[EXIT_Z], cfgtex(from_position(*EXIT_POS)), vcount(EXIT_Z)))
        b.append('\\sect{Sim swap-in}No sim replaces this day: the table is the object. (Checked in code: every configuration, position, valence count, the C4 ranking, the H1 graph values and the H4 row sizes; the clock sums to 50; the core is %.1f of 15 minutes.)' % CORE_MIN)
    b.append('\\par\\smallskip{\\footnotesize Problems are original, modeled on the style of Hewitt\'s Conceptual Physics Think and Rank and standard chemistry textbook practice sets.}')
    b.append('\\end{document}')
    return '\n\n'.join(b)

def run(cmd, d=OUT):
    r = subprocess.run(cmd, cwd=d, capture_output=True, text=True)
    if r.returncode != 0: print(r.stdout[-1800:], r.stderr[-600:]); sys.exit('FAILED: ' + ' '.join(cmd))
def build(name, tex, engine):
    open(os.path.join(OUT, name + '.tex'), 'w').write(tex)
    for _ in range(2): run([engine, '-interaction=nonstopmode', '-halt-on-error', name + '.tex'])

# ---------------------------------------------------------------- exit slips (docx, six per page, exact row heights)
def exit_slips():
    import matplotlib; matplotlib.use('Agg'); import matplotlib.pyplot as plt
    from matplotlib.patches import Rectangle
    fig, ax = plt.subplots(figsize=(3.3, 0.95)); ax.set_xlim(-0.8, 18.2); ax.set_ylim(4.2, -0.9); ax.axis('off')
    for g in range(1, 19): ax.text(g - .5, -0.35, str(g), ha='center', va='center', fontsize=5)
    for p in range(1, 5): ax.text(-0.45, p - .5, str(p), ha='center', va='center', fontsize=5)
    for z in range(1, 37):
        P = POS[z]; ax.add_patch(Rectangle((P['group'] - 1, P['period'] - 1), 1, 1, fill=False, lw=0.4, ec='0.35'))
    fig.subplots_adjust(0, 0, 1, 1); png = os.path.join(OUT, 'exit-grid.png'); fig.savefig(png, dpi=300); plt.close(fig)
    from docx import Document
    from docx.shared import Inches, Pt
    from docx.enum.table import WD_ROW_HEIGHT_RULE
    d = Document(); s = d.sections[0]; s.left_margin = s.right_margin = Inches(0.5); s.top_margin = s.bottom_margin = Inches(0.5)
    s.page_width, s.page_height = Inches(8.5), Inches(11)
    d.styles['Normal'].font.name = 'Calibri'; d.styles['Normal'].font.size = Pt(9)
    t = d.add_table(rows=3, cols=2); t.style = 'Table Grid'; t.autofit = False
    for r in t.rows: r.height = Inches(3.3); r.height_rule = WD_ROW_HEIGHT_RULE.EXACTLY
    for r in t.rows:
        for c in r.cells: c.width = Inches(3.75)
    for r in t.rows:
        for c in r.cells:
            c.paragraphs[0].text = ''; p0 = c.paragraphs[0]; p0.paragraph_format.space_after = Pt(2)
            rn = p0.add_run('Slot 14 exit slip   Name ____________  ID ______'); rn.bold = True; rn.font.size = Pt(8.5)
            q = c.add_paragraph(); q.paragraph_format.space_after = Pt(2)
            q.add_run('An element is in period %d, group %d. On the grid, mark its box with an X and shade its whole block. Then write its valence configuration and how many valence electrons it has.' % EXIT_POS).font.size = Pt(9)
            pic = c.add_paragraph(); pic.paragraph_format.space_after = Pt(2); pic.add_run().add_picture(png, width=Inches(3.4))
            w = c.add_paragraph(); w.add_run('Valence configuration: ______________________').font.size = Pt(9)
            w2 = c.add_paragraph(); w2.add_run('Valence electrons: ______').font.size = Pt(9)
    d.save(os.path.join(OUT, 'slot-14-exit-slips.docx'))
    run(['soffice', '--headless', '--convert-to', 'pdf', 'slot-14-exit-slips.docx'])
    n = int(re.search(r'Pages:\s+(\d+)', subprocess.run(['pdfinfo', os.path.join(OUT, 'slot-14-exit-slips.pdf')], capture_output=True, text=True).stdout).group(1))
    assert n == 1, 'exit slips spill to %d pages' % n

if __name__ == '__main__':
    build('slot-14-notes', notes_doc(), 'pdflatex')
    build('slot-14-script', script_doc(), 'xelatex')
    build('slot-14-sheet', sheet_doc(False), 'pdflatex')
    build('slot-14-key', sheet_doc(True), 'pdflatex')
    exit_slips()
    print('built; core minutes %.1f of %d; keepers %d; live questions %d' % (CORE_MIN, dict(CLOCK)['Practice'], len(KEEP), len(LIVE)))
