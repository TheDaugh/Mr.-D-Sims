"""Stats textbook, Chapter 3: The Normal Distribution (sections 3.1 to 3.6). Same stories and figures as the Unit 3 notes packs.
Every number is checked here before it is printed."""
import subprocess, re, statistics as st
from scipy.stats import norm
PU = [11, 13, 13, 14, 15, 15, 17, 18, 19, 19, 19, 19, 21, 21, 22, 26, 29, 29, 30, 30]
assert st.mean(PU) == 20 and round(st.stdev(PU), 1) == 6.0 and st.median(PU) == 19 and max(PU) - min(PU) == 19
c = lambda v: sum(x <= v for x in PU)
assert (c(26), c(14), c(29), c(20)) == (16, 4, 18, 12)
assert (26 - 20) / 6 == 1 and (14 - 20) / 6 == -1 and (29 - 20) / 6 == 1.5 and 20 + 2 * 6 == 32 and 20 - 0.5 * 6 == 17 and (85 - 75) / 5 == 2
R = [12, 18, 22, 25, 28, 30, 33, 35, 40, 47]; assert sum(x <= 30 for x in R) == 6
assert round((84 - 70) / 8, 2) == 1.75 and round((58 - 70) / 8, 2) == -1.5 and 70 + 0.5 * 8 == 74
assert (round(100 * 1.15, 2), round(18 * 1.15, 2)) == (115, 20.7) and (40 * 1.5, 8 * 1.5) == (60, 12) and 41 * 1.5 == 61.5 and 32 * 1.5 == 48
assert (35 - 20) / 40 == 0.375 and (30 - 10) / 40 == 0.5 and (50 - 40) / 40 == 0.25 and (45 - 15) / 40 == 0.75 and 6 / 20 == 0.3 and 5 / 20 == 0.25
assert norm.cdf(8, 7.2, .8) - norm.cdf(7, 7.2, .8) > norm.cdf(9, 7.2, .8) - norm.cdf(8, 7.2, .8)
assert round((100 - 99.7) / 2, 2) == 0.15 and 34 + 47.5 == 81.5 and [round(9.2 + k * 0.6, 1) for k in range(-3, 4)] == [7.4, 8.0, 8.6, 9.2, 9.8, 10.4, 11.0]
p = lambda x: round(100 * x, 1)
assert p(norm.cdf(25, 30, 4)) == 10.6 and p(norm.sf(36, 30, 4)) == 6.7 and p(norm.cdf(33, 30, 4) - norm.cdf(27, 30, 4)) == 54.7 and p(norm.cdf(-1.4)) == 8.1
assert p(norm.cdf(6, 7.5, 1)) == 6.7 and p(norm.sf(10, 7.5, 1)) == 0.6 and p(norm.cdf(9, 7.5, 1) - norm.cdf(6.5, 7.5, 1)) == 77.5 and p(norm.sf(9, 7.5, 1)) == 6.7
r2 = lambda x: round(x, 2)
assert r2(norm.ppf(.9, 30, 4)) == 35.13 and r2(norm.ppf(.25, 30, 4)) == 27.3 and r2(norm.ppf(.1, 30, 4)) == 24.87 and round(norm.ppf(.3, 7.5, 1), 3) == 6.976
assert r2(norm.ppf(.95, 7.5, 1)) == 9.14 and r2(norm.ppf(.1, 7.5, 1)) == 6.22 and r2(norm.ppf(.8, 50, 5)) == 54.21 and round(195 - norm.ppf(.4) * 25, 1) == 201.3

F = lambda n, w="0.7": r"\begin{center}\includegraphics[width=%s\linewidth]{fig/%s.pdf}\end{center}" % (w, n)
TB = lambda rows: (r"\begin{center}\renewcommand{\arraystretch}{1.3}\begin{tabular}{|l|c|c|c|c|}\hline & \textbf{Mean} & \textbf{Median} & \textbf{SD} & \textbf{Range}\\\hline " + "".join(r"%s & %s & %s & %s & %s\\\hline " % r for r in rows) + r"\end{tabular}\end{center}")

BODY = r"""
{\Huge\bfseries Chapter 3}\par\medskip{\huge\bfseries The Normal Distribution}\par\bigskip
Chapter 2 described one list of numbers with a center and a spread. This chapter asks where a single value \emph{stands} in its list, what happens to a list when every value changes, and how one smooth curve, the normal curve, can answer questions about thousands of values at once. Each section follows one lesson of Unit 3 and uses the same story as class.

\section{Percentiles and z-scores}
\subsection{Where does one value stand?}
Twenty students did as many push-ups as they could. Sam did 26. Is that good? It depends on everyone else. This section gives two ways to say where one value stands.
""" + F("pu", "0.75") + r"""
\reading{Each dot is one student. The axis is push-ups. Look first at where most dots pile up (around 19), then find 26.}

\begin{defbox}{Percentile}
The percent of values \emph{less than or equal to} a given value.
\end{defbox}

\begin{wexbox}{1: Finding a percentile}
\textbf{Question:} What percentile is Sam's 26 push-ups?\par\medskip
\textbf{Answer}
\step{1}{Count the values at or below 26.} 16 of the 20 dots (orange below).
\step{2}{Divide by how many, times 100.} $16 \div 20 = 0.8 \to$ the 80th percentile.
\step{3}{Say it.} 80\% of the class did 26 push-ups or fewer.
""" + F("pu26", "0.7") + r"""
\end{wexbox}

\begin{wexbox}{2: Your turn}
\textbf{Question:} Ana did 29 push-ups. What percentile is that?\par\medskip
\step{1}{Count.} \blank \ of 20.
\step{2}{Divide, times 100.} \blank th percentile.
\end{wexbox}

\subsection{Counting standard deviations}
The class mean is 20 push-ups and the SD is 6. A z-score counts how many SDs a value is from the mean: how many hops.
""" + F("hops", "0.75") + r"""
\begin{defbox}{z-score}
\[ z = \frac{\text{value} - \text{mean}}{\text{SD}} \]
Positive $z$ is above the mean; negative $z$ is below. To go backward: value $=$ mean $+\ z \times$ SD.
\end{defbox}

\begin{wexbox}{3: Finding a z-score}
\textbf{Question:} Find $z$ for Lee's 14 push-ups.\par\medskip
\step{1}{Subtract the mean.} $14 - 20 = -6$.
\step{2}{Divide by the SD.} $-6 \div 6 = -1$.
\step{3}{Say it.} Lee's 14 push-ups is 1 standard deviation below the mean.
\end{wexbox}

\begin{wexbox}{4: Your turn}
\textbf{Question:} Find $z$ for Ana's 29 push-ups, and which push-up count has $z = -0.5$.\par\medskip
\step{1}{Ana.} (\blank $-$ \blank) $\div$ \blank $=$ \blank
\step{2}{Backward.} $20 + (-0.5)(6) = $ \blank
\end{wexbox}

\begin{watchbox}
Subtract first, then divide: $26 - 20 \div 6$ is not the same as $(26 - 20) \div 6$. A negative $z$ is not wrong; it means below the mean.
\end{watchbox}

\begin{saybox}
\blank[3em]\% of \blank[5em] had \blank[3em] or fewer. \qquad \blank[5em] is \blank[2em] standard deviations above/below the mean.\par\smallskip
\emph{Ana's 29 push-ups is 1.5 standard deviations above the mean.}
\end{saybox}

\begin{exbox}{Percentiles and z-scores}
Ten students reported minutes spent reading yesterday.
""" + F("read", "0.6") + r"""
\begin{enumerate}[leftmargin=*,itemsep=4pt]
\item What percentile is 30 minutes? Say it in a sentence.
\item Test scores have mean 70 and SD 8. Find and say $z$ for 84 and for 58.
\item Which score has $z = 0.5$?
\item Kai wrote $z = 84 - 70 \div 8$. What went wrong?
\item Ana did 29 push-ups ($z = 1.5$). Ben scored 85 on a quiz with mean 75 and SD 5. Who stands out more in their own group?
\end{enumerate}
\end{exbox}

\begin{simbox}
Practice 3.1 \& 3.2 concept checker, parts 1 to 4: Percentile from a dotplot, Find the z-score, Say the z-score, Hop to the value.
\end{simbox}

\subsection*{Summary}
\begin{itemize}[itemsep=2pt]
\item Percentile: count at or below, divide by $n$, times 100.
\item $z = (\text{value} - \text{mean}) \div \text{SD}$; value $=$ mean $+\ z \times$ SD. The bigger $|z|$, the more unusual.
\end{itemize}

\newpage
\section{Changing every value}
\subsection{Adding moves, multiplying stretches}
The coach gives every student 5 bonus push-ups. Another day, every count is doubled. What happens to the center, the spread and the shape?
""" + F("trans", "0.8") + r"""
\reading{Three dotplots on one axis: the original class, every student $+5$, and every student $\times 2$. Compare where each pile sits and how far apart the dots are.}

\begin{defbox}{Center, spread, shape}
\textbf{Center:} the mean and median. \textbf{Spread:} the SD and range. \textbf{Shape:} what the dotplot looks like.
\end{defbox}

\begin{wexbox}{5: Adding 5 to every value}
\step{1}{Center.} Every value moves 5, so the mean and median move 5: 25 and 24.
\step{2}{Spread.} The dots are no farther apart: SD 6, range 19.
\step{3}{Shape.} Unchanged: the whole picture slides right.
""" + TB([("Original", "20", "19", "6", "19"), (r"$+5$", "25", "24", "6", "19")]) + r"""
\end{wexbox}

\begin{wexbox}{6: Doubling every value}
\step{1}{Center.} Mean $2 \times 20 = 40$, median $2 \times 19 = 38$.
\step{2}{Spread.} SD $2 \times 6 = $ \blank, range $2 \times 19 = $ \blank.
\step{3}{Shape.} \blank[6em]
\end{wexbox}

\begin{defbox}{The two rules}
Adding or subtracting a constant moves the center by that amount; the spread and shape stay the same. Multiplying or dividing multiplies the center and the spread by that number; the shape stays the same.
\end{defbox}

\begin{wexbox}{7: Two price plans}
\textbf{Question:} Electricity bills have mean \$100 and SD \$18. Plan A adds \$15 to every bill. Plan B multiplies every bill by 1.15. Which spreads the bills out more?\par\medskip
\step{1}{Plan A.} Mean $100 + 15 = \$115$; SD stays \$18.
\step{2}{Plan B.} Mean $1.15 \times 100 = \$115$; SD $1.15 \times 18 = \$20.70$.
\step{3}{Compare.} Plan B: multiplying stretches the spread; adding does not.
\end{wexbox}

\subsection{z-scores for everyone}
Turning every value into a z-score is two moves: subtract the mean (the mean becomes 0, the SD stays), then divide by the SD (the mean stays 0, the SD becomes 1). So the z-scores of any data set have mean 0 and SD 1, and the same shape as before.

\begin{watchbox}
Adding never changes the SD or the range. ``Adding 10 makes the SD 10 bigger'' is the most common mistake in this section.
\end{watchbox}

\begin{saybox}
Adding \blank[2em] moves the center by \blank[2em] and does not change the spread or the shape.\par
Multiplying by \blank[2em] multiplies the center and the spread by \blank[2em]. The shape does not change.
\end{saybox}

\begin{exbox}{Changing every value}
A class's test scores have mean 40, median 41, SD 8 and range 32.
\begin{enumerate}[leftmargin=*,itemsep=4pt]
\item The teacher adds 10 to every score. Find the new mean, median, SD and range.
\item Instead, every score is multiplied by 1.5. Find the new mean, median, SD and range.
\item Does either change the shape?
\item Drive times have mean 32.5 minutes and SD 6.8. Traffic adds 5 minutes to every trip. New mean and SD?
\item Every GPA in a school, $N(2.8, 0.4)$, is turned into a z-score. New mean and SD?
\end{enumerate}
\end{exbox}

\begin{simbox}
Practice 3.1 \& 3.2 concept checker, parts 5 and 6: Add or subtract a constant, Multiply every value.
\end{simbox}

\subsection*{Summary}
\begin{itemize}[itemsep=2pt]
\item Add: the center moves, the spread and shape stay. Multiply: the center and spread both scale, the shape stays.
\item z-scores of any data set: mean 0, SD 1.
\end{itemize}

\newpage
\section{Density curves}
\subsection{Area is proportion}
In one building, an elevator ride takes anywhere from 10 to 50 seconds, every time equally likely. Instead of a dotplot of thousands of rides, a smooth curve can stand in for all of them.
""" + F("unif", "0.6") + r"""
\reading{The blue rectangle runs from 10 to 50 seconds and is $\tfrac{1}{40}$ tall. The orange part is rides from 20 to 35 seconds.}

\begin{defbox}{Density curve}
A curve on or above the axis with total area exactly 1. The area over an interval is the proportion of values in that interval.
\end{defbox}

\begin{wexbox}{8: Area on a flat curve}
\textbf{Question:} What proportion of rides take 20 to 35 seconds?\par\medskip
\step{1}{Width.} $35 - 20 = 15$.
\step{2}{Height.} $\tfrac{1}{40}$, so the total area is $40 \times \tfrac{1}{40} = 1$.
\step{3}{Area.} $15 \times \tfrac{1}{40} = 0.375$.
\end{wexbox}

\begin{wexbox}{9: Your turn}
\textbf{Question:} Rides over 40 seconds? Rides from 15 to 45 seconds?\par\medskip
\step{1}{Over 40.} Width \blank, area \blank.
\step{2}{15 to 45.} Area \blank.
\end{wexbox}

\subsection{Shape and center}
""" + F("shapes", "0.95") + r"""
In a symmetric curve the mean and median are equal. A long tail pulls the mean toward it.

\subsection{The normal curve as a model}
Many data sets are bell-shaped. A \textbf{normal curve} models them: symmetric, with one peak at the mean. The area between two values is the approximate proportion of the data there. A model is not the data: no single value sits ``on'' the curve.

\begin{wexbox}{10: Near the peak}
\textbf{Question:} Avocados weigh about $N(7.2, 0.8)$ ounces. Are there more between 7 and 8 oz or between 8 and 9 oz?
""" + F("avo", "0.55") + r"""
\step{1}{Compare the widths.} Both are 1 oz wide.
\step{2}{Find the peak.} The curve is tallest at the mean, 7.2, inside the 7 to 8 interval.
\step{3}{Decide.} More area, so more avocados, between 7 and 8 oz.
\end{wexbox}

\begin{watchbox}
Use the width (right end $-$ left end), not an endpoint: rides from 8 to 14 on a 0-to-20 curve is $6 \times \tfrac{1}{20}$, not $14 \times \tfrac{1}{20}$.
\end{watchbox}

\begin{exbox}{Density curves}
A bus arrives any time from 0 to 20 minutes after you reach the stop, every time equally likely.
\begin{enumerate}[leftmargin=*,itemsep=4pt]
\item How tall is the density curve?
\item Proportion of waits under 5 minutes? Between 8 and 14? Over 15?
\item A curve has a long tail to the right. Which is bigger, the mean or the median?
\item A fair die is rolled many times. Compare the mean and median.
\item Heights are about normal. Is the proportion within 1 inch of the mean bigger or smaller than the proportion 3 to 4 inches above it? Why?
\end{enumerate}
\end{exbox}

\begin{simbox}
Practice 3.3 \& 3.4 concept checker, parts 1 and 2, and the Near the peak star tab.
\end{simbox}

\subsection*{Summary}
\begin{itemize}[itemsep=2pt]
\item A density curve has total area 1; area over an interval is a proportion. Flat curve: area $=$ width $\times$ height.
\item A long tail pulls the mean. A normal curve is a model: area between two values $\approx$ proportion of data.
\end{itemize}

\newpage
\section{The empirical rule}
\subsection{Name it and draw it}
Bus rides to school are approximately normal with mean 30 minutes and SD 4 minutes. We write that as $N(30, 4)$.
""" + F("bus_axis", "0.6") + r"""
\reading{The mean, 30, is in the middle. Each tick is one more hop of 4 minutes: 26, 22, 18 to the left and 34, 38, 42 to the right.}

\begin{defbox}{Notation and the empirical rule}
$N(\text{mean}, \text{SD})$ names a normal distribution. In any normal distribution about 68\% of values are within 1 SD of the mean, 95\% within 2 SDs and 99.7\% within 3 SDs.
\end{defbox}

\begin{wexbox}{11: A middle}
\textbf{Question:} What percent of rides take 26 to 34 minutes?
""" + F("bus68", "0.5") + r"""
\step{1}{Count the hops.} 26 and 34 are 1 SD each side of 30.
\step{2}{Use the rule.} 68\%.
\end{wexbox}

\subsection{Tails}
What is not in the middle splits evenly into the two tails: \quad tail $=$ (100 $-$ middle) $\div$ 2.

\begin{wexbox}{12: A tail}
\textbf{Question:} What percent of rides take over 34 minutes?
""" + F("bustail", "0.5") + r"""
\step{1}{The middle.} 26 to 34 is 68\%.
\step{2}{One tail.} $(100 - 68) \div 2 = 16\%$.
\end{wexbox}

\begin{wexbox}{13: Your turn}
\textbf{Question:} Rides from 22 to 38? Under 22? From 26 to 38?\par\medskip
\step{1}{22 to 38.} \blank\,\%
\step{2}{Under 22.} $(100 - $\blank$) \div 2 = $ \blank\,\%
\step{3}{26 to 38.} Half of 68 plus half of 95: \blank\,\%
\end{wexbox}

\begin{watchbox}
Split what is left over between \emph{both} tails: under 22 is 2.5\%, not 5\%. And the rule only works at whole hops; for 25 minutes, use Section 3.5.
\end{watchbox}

\begin{exbox}{The empirical rule}
Adult sleep is about $N(7.5, 1)$ hours.
\begin{enumerate}[leftmargin=*,itemsep=4pt]
\item Label the axis from 3 SDs below to 3 SDs above the mean.
\item Percent between 6.5 and 8.5 hours? Between 5.5 and 9.5?
\item Percent over 8.5 hours? Under 5.5?
\item Percent between 6.5 and 9.5 hours?
\item Rolls are $N(9.2, 0.6)$ cm. Label the axis and find the percent between 8.6 and 9.8 cm.
\end{enumerate}
\end{exbox}

\begin{simbox}
Practice 3.3 \& 3.4 concept checker, parts 3 to 6: Label the axis, Shade the area, 68-95-99.7, Tails.
\end{simbox}

\subsection*{Summary}
\begin{itemize}[itemsep=2pt]
\item $N(\text{mean}, \text{SD})$: mean in the middle, one SD per hop.
\item 68, 95, 99.7\% within 1, 2, 3 SDs. Tail $=$ (100 $-$ middle) $\div$ 2.
\end{itemize}

\newpage
\section{Area under a normal curve}
\subsection{Values that are not whole hops}
What percent of bus rides take under 25 minutes? 25 is $1.25$ SDs below the mean, not a whole hop, so the empirical rule cannot answer it. The calculator can.
""" + F("busL", "0.5") + r"""
\reading{The shaded area is every ride under 25 minutes: the left tail up to 25.}

\begin{defbox}{normalcdf}
\texttt{normalcdf(lower, upper, mean, SD)} gives the area between two values. For ``under'', the lower end is \texttt{-1E99}; for ``over'', the upper end is \texttt{1E99}. The answer is a proportion; times 100 for a percent. (The z-table gives the same areas, as a back-up.)
\end{defbox}

\begin{wexbox}{14: Under a value}
\textbf{Question:} What percent of rides take under 25 minutes?\par\medskip
\step{1}{Sketch and shade.} The left tail, up to 25.
\step{2}{Type it.} \texttt{normalcdf(-1E99, 25, 30, 4)} $= 0.106$.
\step{3}{Say it.} About 10.6\% of bus rides take under 25 minutes.
\end{wexbox}

\begin{wexbox}{15: Over and between}
\textbf{Question:} Rides over 36 minutes? Rides between 27 and 33?
""" + r"\begin{center}\includegraphics[width=0.45\linewidth]{fig/busR.pdf}\hfill\includegraphics[width=0.45\linewidth]{fig/busB.pdf}\end{center}" + r"""
\step{1}{Over 36.} \texttt{normalcdf(36, 1E99, 30, 4)} $= 0.067 \to 6.7\%$.
\step{2}{Between 27 and 33.} \texttt{normalcdf(}\blank[2em], \blank[2em], 30, 4\texttt{)} $=$ \blank\,\%
\end{wexbox}

\subsection{From a z-score}
A z-score lives on $N(0, 1)$, so use mean 0 and SD 1.

\begin{wexbox}{16: From a z-score}
\textbf{Question:} Kelly's roll has $z = -1.4$. What percent of rolls are this size or smaller?
""" + F("zL", "0.45") + r"""
\step{1}{Type it.} \texttt{normalcdf(-1E99, -1.4, 0, 1)} $= 0.081 \to 8.1\%$.
\end{wexbox}

\begin{watchbox}
Shade first so you know which end is $\pm$1E99. For ``over 9 hours'' of sleep, \texttt{normalcdf(-1E99, 9, 7.5, 1)} gives 93.3\%: that is the area \emph{under} 9. Over 9 is \texttt{normalcdf(9, 1E99, 7.5, 1)} $= 6.7\%$.
\end{watchbox}

\begin{saybox}
About \blank[2em]\% of \blank[5em] are under / over / between \blank[5em].\par\smallskip
\emph{About 10.6\% of bus rides take under 25 minutes.}
\end{saybox}

\begin{exbox}{Area under a normal curve}
Adult sleep is $N(7.5, 1)$ hours.
\begin{enumerate}[leftmargin=*,itemsep=4pt]
\item Percent sleeping under 6 hours?
\item Percent sleeping 10 hours or more?
\item Percent between 6.5 and 9 hours? Say it in a sentence.
\item Avocados are $N(7.2, 0.8)$ oz. Proportion between 8 and 9 oz?
\item Percent of values above $z = 1.2$?
\end{enumerate}
\end{exbox}

\begin{simbox}
Practice 3.5 \& 3.6 concept checker, parts 1 to 3: Area to the left, Area to the right, Area between, and the From a z-score star tab.
\end{simbox}

\subsection*{Summary}
\begin{itemize}[itemsep=2pt]
\item \texttt{normalcdf(lower, upper, mean, SD)}: a value in, an area out. Under: $-$1E99; over: 1E99.
\item For a z-score, use mean 0 and SD 1.
\end{itemize}

\newpage
\section{Boundary values}
\subsection{Running it backward}
The school wants to flag the longest 10\% of bus rides. This time the area is known and the value is not: run \texttt{normalcdf} backward with \texttt{invNorm}.
""" + F("bus90", "0.5") + r"""
\reading{The shaded part is the 90\% of rides to the left of the line. The line itself is the value we want.}

\begin{defbox}{invNorm}
\texttt{invNorm(area to the left, mean, SD)} gives the value with that much area to its left. A percentile $p$ goes in as a decimal. invNorm always wants the area to the \emph{left}.
\end{defbox}

\begin{wexbox}{17: A percentile}
\textbf{Question:} Find the 90th percentile of bus rides.\par\medskip
\step{1}{The area to the left.} 0.90.
\step{2}{Type it.} \texttt{invNorm(0.90, 30, 4)} $= 35.13$ minutes.
\step{3}{Say it.} 90\% of rides take 35.13 minutes or less.
\end{wexbox}

\begin{wexbox}{18: A top percent}
\textbf{Question:} Where does the top 5\% of sleep begin, if sleep is $N(7.5, 1)$?
""" + F("bustop10", "0.45") + r"""
\step{1}{The area to the left.} The top 5\% has \blank\,\% to its left.
\step{2}{Type it.} \texttt{invNorm(}\blank[2em], 7.5, 1\texttt{)} $=$ \blank hours.
\end{wexbox}

\subsection{Finding the mean}
Sometimes a value and its percentile are known but the mean is not. Get $z$ from invNorm with mean 0 and SD 1, then undo the z-score.

\begin{wexbox}{19: An unknown mean}
\textbf{Question:} Cholesterol levels have SD 25 mg/dL, and 40\% are below 195. What is the mean?\par\medskip
\step{1}{Find $z$.} \texttt{invNorm(0.40, 0, 1)} $= -0.253$.
\step{2}{Undo it.} $195 = \text{mean} + (-0.253)(25)$, so mean $= 195 + 6.33 = 201.3$ mg/dL.
\end{wexbox}

\begin{watchbox}
Top $p\%$: put in $1 - p$. Typing \texttt{invNorm(0.05, 7.5, 1)} for the top 5\% gives the \emph{bottom} 5\%. And remember the two tools: normalcdf takes a value and gives an area; invNorm takes an area and gives a value.
\end{watchbox}

\begin{exbox}{Boundary values}
Adult sleep is $N(7.5, 1)$ hours.
\begin{enumerate}[leftmargin=*,itemsep=4pt]
\item Find the 30th percentile.
\item Where do the bottom 10\% end?
\item Where does the top 5\% begin? Say it in a sentence.
\item Scores are $N(50, 5)$. Find the 80th percentile.
\item 85\% of rides are under 40 minutes, and the SD is 4. Find the mean.
\end{enumerate}
\end{exbox}

\begin{simbox}
Practice 3.5 \& 3.6 concept checker, parts 4 to 6: Find the cutoff, Percentile to value, Top and bottom percents, and the Find the mean star tab.
\end{simbox}

\subsection*{Summary}
\begin{itemize}[itemsep=2pt]
\item \texttt{invNorm(area to the left, mean, SD)}: an area in, a value out.
\item Top $p\%$: put in $1 - p$. Unknown mean: $z$ from invNorm(area, 0, 1), then mean $=$ value $-\ z \times$ SD.
\end{itemize}

\newpage
\markboth{Answers}{Answers}
\section*{Answers}
\subsection*{3.1}
\textbf{Worked Example 2.} 18 of 20: 90th. \quad \textbf{Worked Example 4.} $(29 - 20) \div 6 = 1.5$; 17.\par
\textbf{Exercise.} 1. 6 of 10: 60th. 60\% of the students read 30 minutes or fewer. \ 2. $z = 1.75$: 84 is 1.75 SDs above the mean. $z = -1.5$: 58 is 1.5 SDs below the mean. \ 3. $70 + 0.5 \times 8 = 74$. \ 4. He divided before subtracting: $(84 - 70) \div 8 = 1.75$. \ 5. Ben, $z = 2$, against Ana's 1.5.
\subsection*{3.2}
\textbf{Worked Example 6.} SD 12, range 38; the shape is unchanged.\par
\textbf{Exercise.} 1. Mean 50, median 51, SD 8, range 32. \ 2. Mean 60, median 61.5, SD 12, range 48. \ 3. No. \ 4. Mean 37.5, SD 6.8. \ 5. Mean 0, SD 1.
\subsection*{3.3}
\textbf{Worked Example 9.} Width 10, area 0.25; area 0.75.\par
\textbf{Exercise.} 1. $\tfrac{1}{20}$. \ 2. 0.25; 0.3; 0.25. \ 3. The mean. \ 4. About equal (the distribution is symmetric). \ 5. Bigger: the interval near the mean holds the peak, where the curve is tallest.
\subsection*{3.4}
\textbf{Worked Example 13.} 95\%; 2.5\%; 81.5\%.\par
\textbf{Exercise.} 1. 4.5, 5.5, 6.5, 7.5, 8.5, 9.5, 10.5. \ 2. 68\%; 95\%. \ 3. 16\%; 2.5\%. \ 4. $34 + 47.5 = 81.5\%$. \ 5. 7.4, 8.0, 8.6, 9.2, 9.8, 10.4, 11.0; 68\%.
\subsection*{3.5}
\textbf{Worked Example 15.} \texttt{normalcdf(27, 33, 30, 4)} $= 54.7\%$.\par
\textbf{Exercise.} 1. 6.7\%. \ 2. 0.6\%. \ 3. 77.5\%. About 77.5\% of adults sleep between 6.5 and 9 hours. \ 4. 0.146. \ 5. 11.5\%.
\subsection*{3.6}
\textbf{Worked Example 18.} 95\%; \texttt{invNorm(0.95, 7.5, 1)} $= 9.14$ hours.\par
\textbf{Exercise.} 1. 6.976 hours. \ 2. 6.22 hours. \ 3. 9.14 hours. Adults who sleep more than 9.14 hours are in the top 5\%. \ 4. 54.21. \ 5. $z = 1.04$; mean $= 40 - 1.04 \times 4 = 35.84$ minutes.
\end{document}
"""
assert round(100 * norm.sf(1.2), 1) == 11.5 and round(norm.cdf(9, 7.2, .8) - norm.cdf(8, 7.2, .8), 3) == 0.146 and round(40 - 1.04 * 4, 2) == 35.84
open('Unit3_Chapter.tex', 'w').write(open('pre.tex').read() + BODY)
for _ in range(2): r = subprocess.run(['pdflatex', '-interaction=nonstopmode', 'Unit3_Chapter.tex'], capture_output=True, text=True)
log = open('Unit3_Chapter.log').read()
print('errors' if '! ' in log else 'built', re.findall(r'^! .*', log, re.M)[:3])
