"""Sections 4.2 to 4.6 of the Unit 4 chapter, and their answers. Same stories as the class notes; every number is checked."""
from lib import table
pct = lambda p, o: round(100 * p / o)
y = lambda x: 100 - 8 * x
# 4.2
assert pct(24, 40) == 60 and pct(18, 60) == 30 and pct(16, 40) == 40 and pct(42, 60) == 70 and pct(20, 40) == 50 and pct(30, 60) == 50
assert pct(10, 40) == 25 and pct(15, 60) == 25 and pct(12, 20) == 60 and pct(9, 30) == 30 and round(0.35 * 40) == 14
# 4.5 / 4.6
assert y(2) == 84 and y(4) == 68 and y(7) == 44 and y(5) == 60 and 55 - y(5) == -5 and 80 - y(3) == 4 and y(9) == 28 and 32 - y(9) == 4
assert 30 + 5 * 4 == 50 and 72 - 50 == 22 and 15 - 3 * 2 == 9 and 10 - 9 == 1 and y(15) == -20 and y(6) == 52 and y(2) + 6 == 90
assert -50 + 4 * 75 == 250 and -50 + 4 * 20 == 30 and -50 + 4 * 80 == 270 and 270 - 15 == 255

def fig(name, w=r"0.75\linewidth"): return r"\begin{center}\includegraphics[width=%s]{fig/%s.pdf}\end{center}" % (w, name)
T = {('Senior', 'Job'): 24, ('Senior', 'No job'): 16, ('Junior', 'Job'): 18, ('Junior', 'No job'): 42}
PET = {('Senior', 'Pet'): 20, ('Senior', 'No pet'): 20, ('Junior', 'Pet'): 30, ('Junior', 'No pet'): 30}
SPORT = {('Senior', 'Sport'): 12, ('Senior', 'No sport'): 8, ('Junior', 'Sport'): 9, ('Junior', 'No sport'): 21}

S42 = r"""
\newpage
\section{Is there an association?}

\subsection{Compare percents, not counts}
Section 4.1 ended with two percents: of the seniors, 60\% have a job; of the juniors, only 30\%. That looks like a real difference. But how do we decide, and why not just compare the counts, 24 seniors against 18 juniors?

The groups are different sizes: 40 seniors and 60 juniors. A bigger group will usually have bigger counts, whether or not anything is going on. Turning each group into a percent of its own group puts both on the same scale: out of 100.

\begin{center}""" + table(T, ['Senior', 'Junior'], ['Job', 'No job'], 'Grade') + r"""\end{center}

\begin{defbox}{Association}
Two variables are \textbf{associated} when knowing one changes the percent for the other. If the percents for each group are clearly different, the variables are associated. If they are about the same, they are not.
\end{defbox}

\begin{wexbox}{5: Deciding with percents}
\textbf{Question:} Are grade and having a job associated?\par\medskip
\textbf{Answer}
\step{1}{Make each group a percent of itself.} Seniors: $24 \div 40 = 60\%$. Juniors: $18 \div 60 = 30\%$.
\step{2}{Compare.} 60\% and 30\% are clearly different.
\step{3}{Decide.} Grade and having a job \textbf{are associated}.
\end{wexbox}

\begin{wexbox}{6: When counts lie}
\textbf{Question:} The same 100 students were asked if they have a pet. 20 of the 40 seniors do, and 30 of the 60 juniors do. Are grade and having a pet associated?\par\medskip
\step{1}{Make each group a percent of itself.} Seniors: $20 \div 40 = 50\%$. Juniors: $30 \div 60 = $ \blank\,\%
\step{2}{Compare.} \blank[5em]
\step{3}{Decide.} \blank[7em]
\end{wexbox}

\begin{watchbox}
More juniors have pets than seniors, 30 against 20. That does not mean juniors are more likely to have one: there are more juniors. Bigger count is not bigger percent.
\end{watchbox}

\subsection{Segmented bar graphs}
A \textbf{segmented bar graph} draws the same comparison. Each group gets one bar, stretched to 100\%. The line inside the bar splits it into the percents.
""" + fig("jobpet_a", r"0.92\linewidth") + r"""
\reading{The left graph is grade and job; the right is grade and pet. The shaded bottom of each bar is the ``yes'' part. Look first at the heights of the lines inside the bars.}

\begin{defbox}{Reading a segmented bar graph}
Each bar is one group out of 100, and adds to 100. Lines at different heights: the variables are associated. Lines level with each other: not associated.
\end{defbox}

\begin{wexbox}{7: Reading the graph}
\textbf{Question:} Use the job graph. What percent of juniors have no job?\par\medskip
\step{1}{Find the juniors' bar and its line.} The line is at 30.
\step{2}{Read the part asked for.} No job is the top part: $100 - 30 = $ \blank\,\%
\end{wexbox}

\begin{saybox}
There is an association. Of the \blank[4em], \blank[2em]\% \blank[4em], but of the \blank[4em], only \blank[2em]\%.\par\smallskip
\emph{There is an association. Of the seniors, 60\% have a job, but of the juniors, only 30\%.} \ A yes or no is not enough; the two percents are the reason.
\end{saybox}

\begin{exbox}{Association}
\begin{enumerate}[leftmargin=*,itemsep=4pt]
\item 50 students were asked if they play a sport. Of the 20 seniors, 12 do. Of the 30 juniors, 9 do. What percent of each group plays a sport?
\item Are grade and playing a sport associated? Explain with both percents.
\item 10 of 40 seniors bring lunch, and 15 of 60 juniors do. Kim says juniors are more likely to bring lunch because 15 is more than 10. What did Kim do wrong, and what is the right answer?
\item Use the graph below. What percent of seniors have a sibling at the school? What percent of juniors?
\item Are grade and having a sibling at the school associated? Write the sentence.
\item A segmented bar shows that 35\% of the 40 seniors walk to school. How many seniors walk?
\end{enumerate}
""" + fig("sib_nolab", r"0.42\linewidth") + r"""
\end{exbox}

\begin{simbox}
Practice 4.1 \& 4.2 concept checker: Build the bars, Is there an association?, Read a segmented bar graph.
\end{simbox}

\subsection*{Summary}
\begin{itemize}[itemsep=2pt]
\item Compare percents, not counts, because the groups are different sizes.
\item Percents clearly different: associated. About the same: not associated.
\item A segmented bar graph gives each group one bar out of 100; lines at different heights mean an association.
\end{itemize}
"""
A42 = r"""\subsection*{4.2}
\textbf{Worked Example 6.} $30 \div 60 = 50\%$. The same. Not associated.\quad \textbf{Worked Example 7.} 70\%.\par
\textbf{Exercise.} 1. Seniors $12 \div 20 = 60\%$; juniors $9 \div 30 = 30\%$. \ 2. Yes. There is an association. Of the seniors, 60\% play a sport, but of the juniors, only 30\%. \ 3. Kim compared counts. $10 \div 40 = 25\%$ and $15 \div 60 = 25\%$: the same, so not associated. \ 4. Seniors 30\%, juniors 55\%. \ 5. There is an association. Of the juniors, 55\% have a sibling at the school, but of the seniors, only 30\%. \ 6. $35 \div 100 = 0.35$, $0.35 \times 40 = 14$ seniors.
"""

S43 = r"""
\newpage
\section{Scatterplots}

\subsection{Two number variables}
Grade and job are categories. Some questions pair two \emph{numbers}: hours worked each week and test score, for example. A table of counts no longer works. Instead, we put one dot on a graph for each person.
""" + fig("main_a", r"0.66\linewidth") + r"""
\reading{Each dot is one of 12 students. Across is hours worked per week; up is test score. Find student A: 0 hours across, 94 points up. Look first at the general path the dots follow.}

\begin{defbox}{Scatterplot}
A graph with one dot for each individual, at (across, up). The \textbf{explanatory variable} ($x$) goes across: it is the one that might explain the other. The \textbf{response variable} ($y$) goes up: it responds.
\end{defbox}

\begin{wexbox}{8: Reading a dot}
\textbf{Question:} Student E worked 8 hours a week. What did E score?\par\medskip
\step{1}{Go across first.} Find 8 on the $x$-axis.
\step{2}{Go up to the dot.} The dot above 8 is labeled E.
\step{3}{Read across to the $y$-axis.} E scored 80.
\end{wexbox}

\subsection{Four words to describe a scatterplot}
Every scatterplot is described with the same four words.
""" + fig("kinds", r"0.7\linewidth") + r"""
\begin{defbox}{Direction, strength, form, outliers}
\textbf{Direction:} positive goes up left to right; negative goes down; none has no trend.\par
\textbf{Strength:} how tightly the dots hug one path: strong, moderate or weak.\par
\textbf{Form:} does the path look like a line or a curve?\par
\textbf{Outlier:} a dot far from the rest.
\end{defbox}

\begin{wexbox}{9: Describing the hours-worked plot}
\textbf{Question:} Describe the scatterplot of hours worked and test score.\par\medskip
\step{1}{Direction.} Scores go down as hours go up: negative.
\step{2}{Strength.} Without student C, the dots hug a path tightly: strong.
\step{3}{Form.} A ruler could cover the path: line.
\step{4}{Outliers.} Student C, at 3 hours and 58 points, is far below the rest.
\end{wexbox}

\begin{wexbox}{10: Your turn}
\textbf{Question:} Describe plot C below (speed and stopping distance).\par\medskip
\step{1}{Direction.} \blank[5em] \quad \textbf{Step 2 : Strength.} \blank[5em] \quad \textbf{Step 3 : Form.} \blank[4em] \quad \textbf{Step 4 : Outliers.} \blank[4em]
\end{wexbox}
""" + fig("three", r"0.92\linewidth") + r"""
\begin{watchbox}
Direction is the trend from left to right, not whether the numbers are big. Strength is how tightly the dots follow the path, not how steep the path is.
\end{watchbox}

\begin{saybox}
There is a \blank[4em] (strength), \blank[4em] (direction), \blank[3em] (form) relationship between $x$ and $y$. Outliers: \blank[3em].\par\smallskip
\emph{There is a strong, negative, linear relationship between hours worked and test score. Outliers: student C.}
\end{saybox}

\begin{exbox}{Scatterplots}
The graph shows hours studied and quiz score for 10 students.
""" + fig("prac_a", r"0.45\linewidth") + r"""
\begin{enumerate}[leftmargin=*,itemsep=4pt]
\item Which is the explanatory variable? Which is the response?
\item One student studied 6 hours. What was their quiz score?
\item Give the direction, strength, form and outliers.
\item Write the sentence describing the relationship.
\item Ray says the hours-worked plot is ``strong and positive because the scores are high.'' What is wrong?
\item Describe plot A and plot B above in sentences.
\end{enumerate}
\end{exbox}

\begin{simbox}
Practice 4.3 \& 4.4 concept checker, parts 1 to 3: Read a point, Explanatory or response, Describe the scatterplot.
\end{simbox}

\subsection*{Summary}
\begin{itemize}[itemsep=2pt]
\item A scatterplot has one dot per individual: explanatory across, response up.
\item Describe it with four words: direction, strength, form, outliers.
\end{itemize}
"""
A43 = r"""\subsection*{4.3}
\textbf{Worked Example 10.} Positive, strong, curve, none.\par
\textbf{Exercise.} 1. Explanatory: hours studied; response: quiz score. \ 2. 80. \ 3. Positive, strong, line, no outliers. \ 4. There is a strong, positive, linear relationship between hours studied and quiz score. No outliers. \ 5. Direction is the trend, not the size of the numbers; scores go down as hours go up, so it is negative. \ 6. A: There is a strong, positive, linear relationship between hours studied and quiz score. B: There is a moderate, negative, linear relationship between phone hours and sleep score. No outliers in either.
"""

S44 = r"""
\newpage
\section{Correlation}

\subsection{One number for strength}
Strong, moderate and weak are judgment calls. The \textbf{correlation}, $r$, puts a number on a linear relationship.
""" + fig("rline", r"0.8\linewidth") + r"""
\reading{The number line runs from $-1$ to $1$. The left half is negative relationships, the right half positive. Read how far from 0 a value sits: the ends are strong, the middle is weak.}

\begin{defbox}{Correlation, $r$}
A number from $-1$ to $1$ that describes a \emph{linear} relationship. Its \textbf{sign} gives the direction. Its \textbf{size}, how close it is to $1$ or $-1$, gives the strength: about 0.8 or more is strong, 0.5 to 0.8 moderate, below 0.5 weak.
\end{defbox}

\begin{wexbox}{11: Reading r}
\textbf{Question:} Describe $r = -0.65$.\par\medskip
\step{1}{Sign.} Negative, so the dots go down.
\step{2}{Size.} 0.65 is between 0.5 and 0.8: moderate.
\step{3}{Say it.} A moderate, negative, linear relationship.
\end{wexbox}

\begin{wexbox}{12: Matching r to a plot}
\textbf{Question:} Match each plot to $-0.95$, $-0.5$, $0.1$ or $0.85$.
""" + fig("match", r"0.9\linewidth") + r"""
\step{1}{Sort by direction.} P goes up; Q and S go down; R has no trend.
\step{2}{Then by tightness.} P is fairly tight: 0.85. Q is very tight: \blank. S is looser: \blank. R: \blank.
\end{wexbox}

\subsection{One dot can change r}
The hours-worked plot has outlier C. With C, $r = -0.66$. Without C, $r = -0.98$.
""" + fig("c_with", r"0.36\linewidth").replace(r"\end{center}", "") + r"\includegraphics[width=0.36\linewidth]{fig/c_without.pdf}\end{center}" + r"""
An outlier that breaks the pattern pulls $r$ toward 0. Removing it makes the relationship look stronger.

\subsection{Correlation is not causation}
A strong $r$ means two variables move together. It does not prove that one causes the other.

\begin{defbox}{Lurking variable}
A third variable that drives both of the variables you measured, so they move together even though neither causes the other.
\end{defbox}

\begin{wexbox}{13: Fire trucks and fires}
\textbf{Question:} Cities with more fire trucks have more fires, $r = 0.9$. Do fire trucks cause fires?\par\medskip
\step{1}{Ask if the cause makes sense.} No: fire trucks put fires out.
\step{2}{Look for a third thing that drives both.} City size: big cities have more trucks and more fires.
\end{wexbox}

\begin{watchbox}
The sign of $r$ is direction, not strength. $r = -0.9$ is \emph{stronger} than $r = 0.7$, because it is closer to an end of the number line.
\end{watchbox}

\begin{saybox}
$r = $ \blank[2.5em] shows a \blank[4em], \blank[4em], linear relationship between $x$ and $y$.\par\smallskip
\emph{$r = 0.7$ shows a moderate, positive, linear relationship between shoe size and reading score.} \ Then name a lurking variable: age.
\end{saybox}

\begin{exbox}{Correlation}
\begin{enumerate}[leftmargin=*,itemsep=4pt]
\item Describe $r = -0.82$ and $r = 0.45$.
\item Which is stronger, $r = -0.9$ or $r = 0.7$?
\item Match each plot to $-0.8$, $-0.3$ or $0.9$.\par
\includegraphics[width=0.25\linewidth]{fig/pr1.pdf}\ A \hfill \includegraphics[width=0.25\linewidth]{fig/pr2.pdf}\ B \hfill \includegraphics[width=0.25\linewidth]{fig/pr3.pdf}\ C
\item Ice cream sales and sunburns have $r = 0.8$. Name a lurking variable.
\item In 30 towns, coffee shops and dentists have $r = 0.85$. Write the $r$ sentence and name a lurking variable.
\item A plot with $r = 0.6$ has one point far below the pattern. If you remove it, will $r$ move closer to 1 or closer to 0?
\end{enumerate}
\end{exbox}

\begin{simbox}
Practice 4.3 \& 4.4 concept checker: Make the scatterplot, Estimate $r$, Correlation is not causation.
\end{simbox}

\subsection*{Summary}
\begin{itemize}[itemsep=2pt]
\item $r$ runs from $-1$ to $1$. Sign is direction; closeness to $\pm1$ is strength.
\item An outlier off the pattern pulls $r$ toward 0.
\item Correlation is not causation: look for a lurking variable.
\end{itemize}
"""
A44 = r"""\subsection*{4.4}
\textbf{Worked Example 12.} Q: $-0.95$. S: $-0.5$. R: $0.1$.\par
\textbf{Exercise.} 1. Strong, negative; weak, positive. \ 2. $-0.9$. \ 3. A: 0.9, B: $-0.3$, C: $-0.8$. \ 4. Hot, sunny weather. \ 5. $r = 0.85$ shows a strong, positive, linear relationship between coffee shops and dentists. Lurking variable: town population. \ 6. Closer to 1: the point breaks the pattern, so the rest fit more tightly without it.
"""

S45 = r"""
\newpage
\section{Regression lines}

\subsection{A line that predicts}
A phone's battery was checked every hour after a full charge. The dots fall in a strong, negative, linear pattern, so a line fits them well. The \textbf{regression line} is the line that fits best: $\hat{y} = 100 - 8x$.
""" + fig("batt", r"0.62\linewidth") + r"""
\reading{Across is hours since a full charge; up is battery percent. The blue line is the regression line. Put a finger on an hour, go up to the line, then across to read the prediction.}

\begin{defbox}{Regression line and $\hat{y}$}
A line $\hat{y} = a + bx$ that fits a linear scatterplot. $\hat{y}$ (``y-hat'') is the \textbf{predicted} $y$, not the actual one. $b$ is the \textbf{slope}, the number with $x$; $a$ is the \textbf{y-intercept}, the number alone.
\end{defbox}

\begin{wexbox}{14: Predicting}
\textbf{Question:} Predict the battery at 2 hours.\par\medskip
\step{1}{Put $x$ into the line.} $\hat{y} = 100 - 8(2)$.
\step{2}{Multiply first, then subtract.} $100 - 16 = 84\%$.
\end{wexbox}

\begin{wexbox}{15: Your turn}
\textbf{Question:} Predict the battery at 4 hours, then at 7 hours.\par\medskip
\step{1}{4 hours.} $100 - 8(4) = $ \blank\,\%
\step{2}{7 hours.} \blank[6em] $= $ \blank\,\%
\end{wexbox}

\subsection{Residuals}
The line predicts, but real phones are not exactly on it.
""" + fig("battres", r"0.62\linewidth") + r"""
\begin{defbox}{Residual}
How far the actual value is from the prediction: \ residual $=$ actual $-$ predicted. Positive: the dot is above the line, more than predicted. Negative: below the line, less than predicted.
\end{defbox}

\begin{wexbox}{16: Finding a residual}
\textbf{Question:} At 5 hours the actual battery was 55\%. Find the residual.\par\medskip
\step{1}{Predict.} $100 - 8(5) = 60\%$.
\step{2}{Actual minus predicted.} $55 - 60 = -5$.
\step{3}{Say what it means.} The battery was 5 points less than predicted; the dot is below the line.
\end{wexbox}

\begin{wexbox}{17: Your turn}
\textbf{Question:} At 9 hours the actual battery was 32\%. Find the residual.\par\medskip
\step{1}{Predict.} \blank[8em]
\step{2}{Actual minus predicted.} \blank[8em]
\end{wexbox}

\subsection{What the slope and intercept mean}
\begin{saybox}
\textbf{Slope:} For each additional \blank[3em], the predicted \blank[3em] goes up/down by \blank[3em].\par
\textbf{Intercept:} When $x$ is 0, the predicted $y$ is \blank[3em].\par\smallskip
\emph{For each additional hour, the predicted battery goes down by 8 percentage points. At 0 hours, the predicted battery is 100\%.}
\end{saybox}

\begin{watchbox}
Actual minus predicted, never the other way round: $60 - 55 = 5$ has the wrong sign. And always say \emph{predicted} in the slope sentence; the line does not know the actual values.
\end{watchbox}

\begin{exbox}{Regression lines}
A coach models free throws made ($y$) from minutes of practice ($x$): $\hat{y} = 30 + 5x$.
\begin{enumerate}[leftmargin=*,itemsep=4pt]
\item Predict free throws for 4 minutes of practice.
\item A player practiced 4 minutes and made 72. Find the residual. Was it more or less than predicted?
\item Write the slope sentence.
\item What does the 30 mean?
\item Gas left (gallons) after $x$ hundred miles: $\hat{y} = 15 - 3x$. Predict at 2 hundred miles. The actual was 10 gallons: find the residual.
\item For the battery line, a phone's residual at 2 hours is $+6$. What was its actual battery?
\end{enumerate}
\end{exbox}

\begin{simbox}
Practice 4.5 \& 4.6 concept checker, parts 1 to 5: Predict, Find the residual, Above or below the line, Fit the line, Say the slope.
\end{simbox}

\subsection*{Summary}
\begin{itemize}[itemsep=2pt]
\item $\hat{y} = a + bx$ predicts $y$. Put $x$ in.
\item residual $=$ actual $-$ predicted; actual $=$ predicted $+$ residual.
\item Slope: change in predicted $y$ for each additional $x$. Intercept: predicted $y$ when $x = 0$.
\end{itemize}
"""
A45 = r"""\subsection*{4.5}
\textbf{Worked Example 15.} 68\%; $100 - 8(7) = 44\%$. \quad \textbf{Worked Example 17.} $100 - 8(9) = 28\%$; $32 - 28 = 4$.\par
\textbf{Exercise.} 1. $30 + 5(4) = 50$. \ 2. $72 - 50 = 22$: more than predicted. \ 3. For each additional minute of practice, the predicted free throws go up by 5. \ 4. With 0 minutes of practice, the predicted free throws are 30. \ 5. $15 - 3(2) = 9$ gallons; residual $10 - 9 = 1$. \ 6. Predicted 84\%; actual $84 + 6 = 90\%$.
"""

S46 = r"""
\newpage
\section{Is the model good?}

\subsection{Extrapolation}
The battery line came from data between 0 and 10 hours. What does it say at 15 hours? $100 - 8(15) = -20\%$, which is impossible.

\begin{defbox}{Extrapolation}
Using a regression line to predict at an $x$ outside the range of the data. The pattern might not continue there, so the prediction is not reliable.
\end{defbox}

\begin{wexbox}{18: Inside or outside?}
\textbf{Question:} Can we trust the battery line at 6 hours? At 30 hours?\par\medskip
\step{1}{Find the data's range.} 0 to 10 hours.
\step{2}{6 hours.} Inside the range: trust $100 - 8(6) = 52\%$.
\step{3}{30 hours.} Outside the range: \blank[7em].
\end{wexbox}

\subsection{Residual plots}
A line can also be the wrong shape for the data. A \textbf{residual plot} shows each dot's residual; the middle line is residual 0, the regression line laid flat.

\begin{center}\includegraphics[width=0.48\linewidth]{fig/rp_line.pdf}\hfill\includegraphics[width=0.48\linewidth]{fig/rp_curve.pdf}\end{center}
\reading{Each pair shows the data with its line, then the residual plot. On the left the residuals are scattered at random. On the right they make a U: the data bend, and the line misses that.}

\begin{defbox}{Reading a residual plot}
Random scatter around 0: the line is a good model. A clear pattern, like a curve: the line misses the pattern and is not a good model.
\end{defbox}

\begin{wexbox}{19: Which model?}
\textbf{Question:} Which residual plot shows a good linear model?
\begin{center}\includegraphics[width=0.22\linewidth]{fig/r1.pdf}\ 1\hfill\includegraphics[width=0.22\linewidth]{fig/r2.pdf}\ 2\hfill\includegraphics[width=0.22\linewidth]{fig/r3.pdf}\ 3\hfill\includegraphics[width=0.22\linewidth]{fig/r4.pdf}\ 4\end{center}
\step{1}{Plot 1.} The dots make a U: not a good model.
\step{2}{Plots 2, 3 and 4.} 2: \blank[4em] \quad 3: \blank[4em] \quad 4: \blank[4em]
\end{wexbox}

\begin{watchbox}
Dots above and below 0 are normal in every residual plot. Only a \emph{pattern} means the line is a bad model.
\end{watchbox}

\begin{saybox}
\textbf{Extrapolation:} No. \blank[2em] is outside the data's range of \blank[2em] to \blank[2em], so the prediction is extrapolation and not reliable.\par
\textbf{Model:} The line is / is not a good model because the residual plot shows random scatter / a curve.
\end{saybox}

\begin{exbox}{Is the model good?}
A store models ice cream sales from temperature, using days from 60$^\circ$F to 90$^\circ$F: $\hat{y} = -50 + 4x$.
\begin{enumerate}[leftmargin=*,itemsep=4pt]
\item Predict sales at 75$^\circ$F. Should you trust it?
\item Predict sales at 20$^\circ$F. Should you trust it? Write the sentence.
\item At 80$^\circ$F the residual is $-15$. What were the actual sales?
\item The store's residual plot makes a U. Is the line a good model? Why?
\item Lia says, ``The residual plot has dots above and below 0, so the line is bad.'' What is wrong?
\end{enumerate}
\end{exbox}

\begin{simbox}
Practice 4.5 \& 4.6 concept checker: Can you trust it?, and the star tabs.
\end{simbox}

\subsection*{Summary}
\begin{itemize}[itemsep=2pt]
\item Predict only inside the data's range; outside is extrapolation.
\item Residual plot: random scatter means a good line; a curve means the line misses the pattern.
\end{itemize}
"""
A46 = r"""\subsection*{4.6}
\textbf{Worked Example 18.} Extrapolation; do not trust it. \quad \textbf{Worked Example 19.} 2: good. 3: good. 4: not good (a curve).\par
\textbf{Exercise.} 1. $-50 + 4(75) = 250$; yes, 75 is inside 60 to 90. \ 2. $-50 + 4(20) = 30$; no. 20 is outside the data's range of 60 to 90, so the prediction is extrapolation and not reliable. \ 3. Predicted 270; actual $270 + (-15) = 255$. \ 4. No: the residuals make a curve, so the line misses the pattern. \ 5. Dots on both sides are normal; only a pattern means the line is bad.
"""
SECTIONS = S42 + S43 + S44 + S45 + S46
ANSWERS = A42 + A43 + A44 + A45 + A46
