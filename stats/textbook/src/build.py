"""Stats textbook, Unit 4 chapter: section 4.1 draft in an FHSST-style layout. One source, numbers checked."""
import subprocess, re
from sections import SECTIONS, ANSWERS
from lib import table, YEL, BLU, GRY
T = {('Senior','Job'):24, ('Senior','No job'):16, ('Junior','Job'):18, ('Junior','No job'):42}
D = {('House','Dog'):30, ('House','No dog'):20, ('Apartment','Dog'):6, ('Apartment','No dog'):24}
pct = lambda p, o: round(100*p/o)
assert (24+16, 18+42, 24+18, 16+42) == (40, 60, 42, 58)
assert pct(24,40)==60 and pct(18,60)==30 and pct(24,42)==57 and pct(24,100)==24 and pct(42,100)==42
assert pct(30,50)==60 and pct(6,30)==20 and pct(36,80)==45 and pct(30,80)==38 and pct(30,36)==83 and round(0.4*50)==20
JOB = lambda **k: table(T, ['Senior','Junior'], ['Job','No job'], 'Grade', **k)

PRE = r"""\documentclass[11pt]{article}
\usepackage[left=1.55in,right=0.8in,top=0.8in,bottom=0.8in,headheight=14pt]{geometry}
\usepackage[scaled]{helvet}\renewcommand{\familydefault}{\sfdefault}
\usepackage[table]{xcolor}\usepackage{amsmath,graphicx,tikz,array,enumitem,fancyhdr,titlesec}
\usepackage[most]{tcolorbox}
\definecolor{gbox}{HTML}{E4E4E4}\definecolor{ink}{HTML}{1A1A1A}\definecolor{teal}{HTML}{17777A}
\setlength{\parindent}{0pt}\setlength{\parskip}{6pt}
\pagestyle{fancy}\fancyhf{}\fancyhead[L]{\small\itshape CHAPTER 4. TWO-VARIABLE DATA}\fancyhead[R]{\small\itshape\leftmark}\fancyfoot[C]{\small\thepage}
\renewcommand{\headrulewidth}{0.4pt}
\titleformat{\section}{\Large\bfseries}{\thesection}{1em}{}\titleformat{\subsection}{\large\bfseries}{\thesubsection}{1em}{}
\setcounter{section}{0}\renewcommand{\thesection}{4.\arabic{section}}
% margin icons, drawn so nothing depends on an icon font; each box draws its icon beside its top-left corner
\newsavebox\IFlag\newsavebox\IPencil\newsavebox\IQ\newsavebox\IBang\newsavebox\ISay\newsavebox\ISim
\newcommand{\mk}[2]{\sbox#1{\begin{tikzpicture}[scale=0.5,line width=1.2pt]#2\end{tikzpicture}}}
\AtBeginDocument{%
\mk\IFlag{\draw (0,0)--(0,2);\fill[ink] (0,2)--(1.3,1.7)--(0.9,1.45)--(1.4,1.15)--(0,1.25)--cycle;}%
\mk\IPencil{\draw[rotate=-45] (0,0) rectangle (0.45,2.2);\fill[ink,rotate=-45] (0,0)--(0.45,0)--(0.225,-0.5)--cycle;}%
\mk\IQ{\node[font=\fontsize{40}{40}\selectfont\bfseries] {?};}%
\mk\IBang{\draw[line join=round] (0,0)--(1.8,0)--(0.9,1.6)--cycle;\node at (0.9,0.55) {\bfseries\Large !};}%
\mk\ISay{\draw[rounded corners=4pt] (0,0.4) rectangle (2,1.7);\draw (0.4,0.4)--(0.2,0)--(0.8,0.4);}%
\mk\ISim{\draw[rounded corners=2pt] (0,0.3) rectangle (2,1.6);\draw (0.8,0)--(1.2,0);\draw (1,0)--(1,0.3);\fill[teal] (0.6,0.6) circle (0.12) (1,1) circle (0.12) (1.4,1.25) circle (0.12);}}
\tcbset{ico/.style={overlay unbroken and first={\node[anchor=north east,inner sep=0pt] at ([xshift=-0.28in]frame.north west) {\usebox{#1}};}}}
\newtcolorbox{defbox}[1]{enhanced,ico=\IFlag,colback=gbox,colframe=gbox,arc=0pt,boxrule=0pt,left=6pt,right=6pt,before upper={\textbf{Definition: #1}\par}}
\newtcolorbox{wexbox}[1]{enhanced,ico=\IPencil,colback=white,colframe=ink,arc=0pt,boxrule=0.6pt,left=8pt,right=8pt,breakable,before upper={\textbf{Worked Example #1}\par\medskip}}
\newtcolorbox{exbox}[1]{enhanced,ico=\IQ,colback=white,colframe=ink,arc=0pt,boxrule=0pt,toprule=0.6pt,bottomrule=0.6pt,left=4pt,right=4pt,breakable,before upper={\textbf{Exercise: #1}\par}}
\newtcolorbox{saybox}{enhanced,ico=\ISay,colback=teal!8,colframe=teal,arc=2pt,boxrule=0.8pt,left=8pt,right=8pt,before upper={\textbf{Say it}\par}}
\newtcolorbox{watchbox}{enhanced,ico=\IBang,colback=yellow!14,colframe=ink,arc=0pt,boxrule=0.6pt,left=8pt,right=8pt,before upper={\textbf{Watch out}\par}}
\newtcolorbox{simbox}{enhanced,ico=\ISim,colback=white,colframe=teal,arc=2pt,boxrule=0.6pt,left=8pt,right=8pt,before upper={\textbf{On the site}\par}}
\newcommand{\step}[2]{\par\textbf{Step #1 :} \textbf{#2}\par}
\newcommand{\blank}[1][3.5em]{\underline{\makebox[#1]{}}}
\newcommand{\reading}[1]{\par{\small\color{black!70}\textit{Reading the picture.} #1}\par}
\begin{document}
"""
def swatch(c): return r'\colorbox[HTML]{%s}{\rule{0pt}{0.6em}\hspace{0.6em}}' % c
def mini(hl, title, name):
    return (r'\begin{minipage}[t]{0.31\linewidth}\centering\textbf{\small %s}\\[2pt]\resizebox{\linewidth}{!}{' % title
            + table(T, ['Senior','Junior'], ['Job','No job'], 'Grade', hl=hl, size=r'\footnotesize', pad='1.15') + r'}\\[2pt]\small\emph{%s}\end{minipage}' % name)

BODY = r"""
{\Huge\bfseries Chapter 4}\par\medskip{\huge\bfseries Two-Variable Data}\par\bigskip
So far every question was about one variable: one list of numbers, one bar graph. Now we ask about \emph{two} at once. Do seniors have jobs more often than juniors? Do students who work more hours score lower? This chapter follows the six lessons of Unit 4. Each section uses the same story as its lesson in class, so you can reread the day slowly.

\section{Two-way tables}

\subsection{Counting two ways at once}
One hundred students answered two questions: \emph{What grade are you in?} and \emph{Do you have a job?} A list of 100 answers would be hard to read. A two-way table sorts them both ways at once.

\begin{center}""" + JOB(hl={('Senior','Job'):YEL,('Senior','No job'):YEL,('Junior','Job'):YEL,('Junior','No job'):YEL,('Senior','Total'):BLU,('Junior','Total'):BLU,('Total','Job'):BLU,('Total','No job'):BLU,('Total','Total'):GRY}) + r"""\end{center}
\reading{Each row is a group: seniors, juniors. Each column is an answer: job, no job. The """ + swatch(YEL) + r""" cells count students who fit one row \emph{and} one column. The """ + swatch(BLU) + r""" totals add up a whole row or column. The """ + swatch(GRY) + r""" grand total is everyone.}

\begin{defbox}{Two-way table}
A table that counts the same individuals by two categorical variables at once: one in the rows, one in the columns. Every row and every column adds up to its total.
\end{defbox}

\begin{wexbox}{1: Reading a count}
\textbf{Question:} How many seniors have a job?\par\medskip
\textbf{Answer}
\step{1}{Find the row.} Seniors are in the Senior row.
\step{2}{Find the column.} Having a job is the Job column.
\step{3}{Read where they meet.} The Senior row and the Job column meet at \textbf{24}. Check: $24 + 16 = 40$, the senior total.
\end{wexbox}

\subsection{Every percent is out of some group}
Is 24 a lot? It depends what it is out of. Out of all 100 students, 24 is not many. Out of just the 40 seniors, it is more than half. A two-way table has several groups to choose from, so before any percent, pick the group: the \textbf{out-of}.

\begin{defbox}{Out-of}
The group a percent is taken from. In a question it is the group right after ``Of the''. ``Of all'' means the grand total.
\[ \text{percent} = \text{part} \div \text{out-of} \times 100 \]
\end{defbox}

\begin{wexbox}{2: A percent within a group}
\textbf{Question:} Of the seniors, what percent have a job?\par\medskip
\textbf{Answer}
\step{1}{Pick the out-of.} ``Of the seniors'': the out-of is the senior total, 40.
\step{2}{Find the part.} Seniors with a job: 24.
\step{3}{Divide, then times 100.} $24 \div 40 = 0.6$, \ $0.6 \times 100 = 60\%$.
\step{4}{Say it.} Of the seniors, 60\% have a job.
\end{wexbox}

\begin{wexbox}{3: Your turn to finish}
\textbf{Question:} Of the juniors, what percent have a job?\par\medskip
\step{1}{Pick the out-of.} ``Of the juniors'': 60.
\step{2}{Find the part.} Juniors with a job: 18.
\step{3}{Divide, then times 100.} $18 \div 60 = $ \blank \ $\to$ \blank\,\%
\step{4}{Say it.} Of the juniors, \blank\,\% have a job.
\end{wexbox}

\begin{wexbox}{4: The out-of is a column}
\textbf{Question:} Of the students \emph{with a job}, what percent are seniors?\par\medskip
\step{1}{Pick the out-of.} ``Of the students with a job'': the Job column total, 42.
\step{2}{Find the part.} \blank
\step{3}{Divide, then times 100.} \blank \ $\div$ \blank \ $\to$ \blank\,\%
\end{wexbox}

\begin{watchbox}
\textbf{Same 24, three answers.} \ 24 out of 100 is 24\%. \ 24 out of 40 is 60\%. \ 24 out of 42 is 57\%. None of them is wrong; each answers a different question. The mistake is using an out-of that does not match the question's group.
\end{watchbox}

\subsection{Three kinds of questions}
Every percent question about a two-way table is one of three kinds. In each picture, """ + swatch(BLU) + r""" is the out-of and """ + swatch(YEL) + r""" is the part.

\begin{center}""" + mini({('Senior','Job'):YEL,('Total','Total'):BLU}, 'All students, one cell', 'joint') + r'\hfill' + mini({('Total','Job'):YEL,('Total','Total'):BLU}, 'All students, a total', 'marginal') + r'\hfill' + mini({('Senior','Job'):YEL,('Senior','Total'):BLU}, 'One group', 'conditional') + r"""\end{center}

\begin{defbox}{Joint, marginal and conditional}
\textbf{Joint:} one cell out of everyone. Seniors with a job: $24 \div 100 = 24\%$.\par
\textbf{Marginal:} a total out of everyone. Students with a job: $42 \div 100 = 42\%$.\par
\textbf{Conditional:} out of just one row or column. Of the seniors, with a job: $24 \div 40 = 60\%$.
\end{defbox}
You do not need the three names to answer a question. You do need the out-of, and the picture shows where it is.

\begin{saybox}
Of the \blank[5em], \blank[3em]\% \blank[6em].\par\smallskip
\emph{Of the seniors, 60\% have a job.} \quad The sentence names the out-of, so a reader knows which question you answered.
\end{saybox}

\begin{exbox}{Two-way tables}
80 students were asked where they live and whether they have a dog.
\begin{center}""" + table(D, ['House','Apartment'], ['Dog','No dog'], 'Lives in') + r"""\end{center}
\begin{enumerate}[leftmargin=*,itemsep=4pt]
\item How many students who live in a house have a dog?
\item How many students live in an apartment?
\item Of the students who live in a house, what percent have a dog?
\item What percent of all the students have a dog?
\item What percent of all the students live in a house and have a dog?
\item Write your answer to question 3 as a sentence.
\item Of the students who have a dog, what percent live in a house?
\item Of the 50 students in a house, 40\% have no dog. How many students is that? Check your answer in the table.
\end{enumerate}
\end{exbox}

\begin{simbox}
Practice 4.1 \& 4.2 concept checker, parts 1 to 3: Read the table, Pick the out-of, Percent from a table.
\end{simbox}

\subsection*{Summary}
\begin{itemize}[itemsep=2pt]
\item A two-way table counts the same people by two categorical variables. Find the row, find the column, read where they meet.
\item Every percent is out of some group. The out-of is the group right after ``Of the''; ``of all'' means the grand total.
\item percent $=$ part $\div$ out-of $\times$ 100. Say it: Of the \blank, \blank\% \blank.
\end{itemize}

""" + SECTIONS + r"""
\newpage
\markboth{Answers}{Answers}
\section*{Answers}
\subsection*{4.1}
\textbf{Worked Example 3.} $18 \div 60 = 0.3 \to 30\%$. Of the juniors, 30\% have a job.\par
\textbf{Worked Example 4.} Part: 24 seniors with a job. $24 \div 42 \approx 0.57 \to 57\%$.\par
\textbf{Exercise.}
\begin{enumerate}[itemsep=2pt]
\item 30
\item 30
\item $30 \div 50 = 0.6 \to 60\%$
\item $36 \div 80 = 0.45 \to 45\%$
\item $30 \div 80 \approx 0.38 \to 38\%$
\item Of the students who live in a house, 60\% have a dog.
\item Out-of: the 36 with a dog. $30 \div 36 \approx 0.83 \to 83\%$.
\item $40 \div 100 = 0.4$, \ $0.4 \times 50 = 20$ students. The table shows 20.
\end{enumerate}
""" + ANSWERS + r"""\end{document}
"""
open('Unit4_Chapter.tex','w').write(PRE + BODY)
for _ in range(2): r = subprocess.run(['pdflatex','-interaction=nonstopmode','Unit4_Chapter.tex'],capture_output=True,text=True)
log=open('Unit4_Chapter.log').read()
print('errors' if '! ' in log else 'built', re.findall(r'^! .*', log, re.M)[:3])
