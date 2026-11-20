"""One source -> notes, board script, reference, practice, key, exit slips for Intro Stats 4.1."""
import subprocess, re

# ---------- shared pieces ----------
YEL, BLU, GRY = 'F6E7A8', 'BCD3EE', 'E9ECEF'
def table(data, rows, cols, rowname, hl=None, total=True, missing=(), size=r'\normalsize', pad='1.25'):
    """two-way table; hl maps (r,c) -> hex colour; r/c may be 'Total'."""
    hl = hl or {}
    rt = {r: sum(data[(r,c)] for c in cols) for r in rows}
    ct = {c: sum(data[(r,c)] for r in rows) for c in cols}
    def cell(r, c):
        v = data[(r,c)] if (r,c) in data else rt[r] if c=='Total' and r!='Total' else ct[c] if r=='Total' and c!='Total' else sum(rt.values())
        s = r'\rule{0pt}{1.2em}\phantom{00}' if (r,c) in missing else str(v)
        if (r,c) in missing: s = r'\framebox[2.2em]{\rule{0pt}{0.9em}}'
        col_ = hl.get((r,c))
        return (r'\cellcolor[HTML]{%s}' % col_ if col_ else '') + s
    allc = list(cols) + (['Total'] if total else [])
    allr = list(rows) + (['Total'] if total else [])
    out = [r'{%s\renewcommand{\arraystretch}{%s}\begin{tabular}{|l|%s|}\hline' % (size, pad, '|'.join('c'*len(allc)))]
    out.append(r'\textbf{%s} & ' % rowname + ' & '.join(r'\textbf{%s}' % c for c in allc) + r'\\\hline')
    for r in allr:
        out.append(r'\textbf{%s} & ' % r + ' & '.join(cell(r,c) for c in allc) + r'\\\hline')
    out.append(r'\end{tabular}}')
    return '\n'.join(out)

PRE_COMMON = r"""
\usepackage[table]{xcolor}\usepackage{amsmath,graphicx,tikz,array,tabularx,enumitem,multicol}
\usetikzlibrary{arrows.meta,positioning}
\definecolor{ans}{HTML}{C00000}
\setlength{\parindent}{0pt}\setlength{\parskip}{4pt}
\newcommand{\sect}[1]{\par\vspace{5pt}\noindent\colorbox{black!85}{\parbox{\dimexpr\linewidth-2\fboxsep}{\color{white}\bfseries\large #1}}\par\vspace{2pt}}
\newcommand{\keep}[2]{\par\noindent\fcolorbox{black}{yellow!18}{\parbox{\dimexpr\linewidth-2\fboxsep-2\fboxrule}{\small\textbf{KEEP}\ \ #1}}\par}
\newcommand{\bq}[1]{\par\noindent\framebox{\parbox{\dimexpr\linewidth-2\fboxsep}{#1}}\par}
"""
def ans_macros(student):
    if student:
        return r"""\newcommand{\ans}[2][3em]{\underline{\makebox[#1]{}}}
\newcommand{\pick}[2]{#1}
\newcommand{\fig}[1]{\includegraphics[width=\linewidth]{#1_s.pdf}}
\newcommand{\only}[1]{}"""
    return r"""\newcommand{\ans}[2][3em]{\textcolor{ans}{\textbf{#2}}}
\newcommand{\pick}[2]{#1\ \ \textcolor{ans}{$\Rightarrow$ \textbf{#2}}}
\newcommand{\fig}[1]{\includegraphics[width=\linewidth]{#1_a.pdf}}
\newcommand{\only}[1]{#1}"""

def swatch(c): return r'\colorbox[HTML]{%s}{\rule{0pt}{0.6em}\hspace{0.6em}}' % c


def undo(op1, op2, out):
    return (r"""\begin{center}\begin{tikzpicture}[b/.style={draw,thick,minimum width=1.4cm,minimum height=0.6cm,font=\large}]
\node[b] (a) {}; \node[b,right=2.4cm of a] (m) {}; \node[b,right=2.4cm of m] (z) {%s};
\draw[-{Stealth},thick] (a) -- node[above]{%s} (m); \draw[-{Stealth},thick] (m) -- node[above]{%s} (z);
\draw[{Stealth}-,dashed,gray] ([yshift=-0.6cm]a.east) -- node[below]{undo} ([yshift=-0.6cm]m.west);
\draw[{Stealth}-,dashed,gray] ([yshift=-0.6cm]m.east) -- node[below]{undo} ([yshift=-0.6cm]z.west);
\end{tikzpicture}\end{center}""" % (out, op1, op2))

def pdf(name, tex, engine='pdflatex'):
    open(name + '.tex', 'w').write(tex)
    for _ in range(2):
        r = subprocess.run([engine, '-interaction=nonstopmode', name + '.tex'], capture_output=True, text=True)
    if r.returncode or '! ' in open(name+'.log').read(): print(r.stdout[-2500:]); raise SystemExit(name)

DOC = lambda student, content, size='10pt': (r"\documentclass[%s]{article}\usepackage[margin=0.6in]{geometry}\usepackage[scaled]{helvet}\renewcommand{\familydefault}{\sfdefault}" % size
       + PRE_COMMON + ans_macros(student) + r"\pagestyle{empty}\begin{document}" + content + r"\end{document}")

def body(S):
    out = []
    for title, rows in S:
        if title: out.append(r'\sect{%s}' % title)
        for tex, _ in rows: out.append(tex + r'\par')
    return '\n'.join(out)

def script(S, title, intro, clock_list, tail):
    clock = r'\begin{tabular}{lr}\hline ' + ''.join(r'%s & %d min\\' % (a, m) for a, m in clock_list) + r' \hline\textbf{Total} & \textbf{%d min}\\ \hline\end{tabular}' % sum(m for _, m in clock_list)
    rows = []
    for t, rs in S:
        if t: rows.append(r'\multicolumn{2}{p{0.97\linewidth}}{\sect{%s}}\\*' % t)
        for tex, rem in rs:
            rem = re.sub(r'(?<!\\)%', r'\\%', rem)
            rows.append(r'\begin{minipage}[t]{\linewidth}%s\end{minipage} & \textcolor{ans}{\small %s}\\[6pt]' % (tex, rem))
    return (r"\documentclass[10pt]{article}\usepackage[margin=0.5in]{geometry}\usepackage{fontspec}\setmainfont{TeX Gyre Heros}\usepackage{longtable}"
            + PRE_COMMON + ans_macros(False) + r"\pagestyle{empty}\begin{document}"
            + r"{\Large\bfseries %s \textemdash\ Board script}\par %s\par\medskip" % (title, intro) + clock
            + r"\par\medskip\begin{longtable}{p{0.66\linewidth}p{0.29\linewidth}}" + '\n'.join(rows) + r"\end{longtable}" + tail + r"\end{document}")
