\documentclass[a4paper,12pt]{scrartcl}
%die naechste zeile ist fuer lhs2TeX noetig
%include polycode.fmt

\usepackage{hyperref}
\usepackage{url}
\usepackage[utf8x]{inputenc}
\usepackage{marvosym}

\newcommand{\authormod}[2]{#1\\{\small#2}}

\begin{document}

\author{
	\authormod{Bong Min Kim}{e0327177\MVAt student.tuwien.ac.at} \and
	\authormod{Christoph Sp\"ork}{christoph.spoerk\MVAt inode.at} \and
	\authormod{Florian Hassanen}{florian.hassanen\MVAt googlemail.com } \and
	\authormod{Bernhard Urban}{lewurm\MVAt gmail.com}
}

\subject{Haskell Live}

\title{[01] Eine Einf\"uhrung in Hugs}
\date{8. Oktober 2010}

\maketitle

\section*{Hinweise}
Diese Datei kann als sogenanntes ``Literate Haskell Skript'' von \texttt{hugs}
geladen werden, als auch per
\texttt{lhs2TeX}\footnote{\url{http://people.cs.uu.nl/andres/lhs2tex}} und
\LaTeX\ in ein Dokument umgewandelt werden.

\section*{Kurzeinf\"uhing in \texttt{hugs}}
\texttt{hugs}\footnote{Haskell User's Gofer System} ist ein Interpreter f\"ur die
funktionale Programmiersprache Haskell. Abh\"angig vom Betriebssystem wird der
Interpreter entsprechend gestartet, unter GNU/Linux beispielsweise mit dem
Befehl \texttt{hugs}. Tabelle \ref{tab:hugscmds} zeigt eine \"Ubersicht der
wichtigsten Befehle in \texttt{hugs}.

\begin{table}[ht!]
	\begin{tabular}{llp{9cm}}
	Befehl & Kurzbefehl & Beschreibung\\
	\hline
	\texttt{:edit name.hs} & \texttt{:e name.hs} & \"offnet den Editor der in
	\texttt{\$EDITOR} (Unix) bzw. in WinHugs in den Optionen definiert ist, mit
	der Datei \texttt{name.hs}\\

	\texttt{:load name.hs} & \texttt{:l name.hs} & ladet das Skript
	\texttt{name.hs}\\

	\texttt{:edit} & \texttt{:e} & \"offnet den Editor mit der zuletzt
	ge\"offneten Datei\\

	\texttt{:reload} & \texttt{:r} & erneuertes Laden des zuletzt geladenen
	Skripts\\

	\texttt{:type \textit{Expr}} & \texttt{:t \textit{Expr}} & Typ von
	\texttt{\textit{Expr}} anzeigen\\

	\texttt{:info \textit{Name}} & & Informationen zu \texttt{\textit{Name}}
	anzeigen. \texttt{\textit{Name}} kann z.B. ein Datentyp, Klasse oder Typ sein\\

	\texttt{:cd dir} & & Verzeichnis wechseln\\

	\texttt{:quit} & \texttt{:q} & \texttt{hugs} beenden\\
	\end{tabular}
\centering
\caption{Einige Befehle in \texttt{hugs}}
\label{tab:hugscmds}
\end{table}

\section*{Pr\"asentiertes Skript}
\begin{code}
eins :: Integer
eins = 1

addiere :: Integer -> Integer -> Integer
addiere x y = x + y
\end{code}

\begin{code}
addiere_fuenf :: Integer -> Integer
addiere_fuenf x = addiere 5 x
\end{code}

\begin{code}
ist1 :: Integer -> Bool
ist1 1 = True -- Reihenfolge beachten! (Pattern Matching)
ist1 x = False
\end{code}

Listen k\"onnen einfach erzeugt werden, zum Beispiel erzeugt der
Ausdruck \texttt{[1,2,3,4]} eine Liste von gleicher Darstellung.
In Tabelle \ref{tab:listop} sind einfache Beispiele angef\"uhrt.
\begin{table}[h!]
	\begin{tabular}{lp{3.3cm}p{7.1cm}}
	Ausdruck & Ergebnis & Beschreibung\\
	\hline
	\texttt{[1..5]} & \texttt{[1,2,3,4,5]} & Erzeugt eine Liste mit den Elemente 1 bis 5\\

	\texttt{[1,4..13]} & \texttt{[1,4,7,10,13]} & Siehe n\"achstes Beispiel\\

	\texttt{[$a$,$b$..$x$]} & \texttt{[$a$,$b$,$b+(a-b)$,$b+2*(a-b)$..$x$]} & Es
	wird ein Offset (Differenz von $a$ und $b$) ermittelt. Sei $b$ die Basis, so
	wird bis zum Wert $x$ jeder Wert der die Summe der Basis plus einem
	Vielfachen des Offsets entspricht, der Liste hinzugef\"ugt\\

	\texttt{[]} & \texttt{[]} & Leere Liste aka. ``nil''\\

	\texttt{1:(2:(3:(4:[])))} & \texttt{[1,2,3,4]} & \texttt{(:)} aka. ``cons''\\
	\texttt{1:2:3:4:[]} & \texttt{[1,2,3,4]} & ``cons'' ist rechts-assoziativ \\

	\texttt{"{asdf}"} & \texttt{"{asdf}"} & Liste von \texttt{Char}. Beachte,
	dass der Typ \texttt{String} dem Typen \texttt{[Char]} entspricht.
	\end{tabular}
\centering
\caption{Einfache Beispiele f\"ur Listen}
\label{tab:listop}
\end{table}

\begin{code}
my_head :: [Integer] -> Integer
my_head [] = 0
my_head (x:xs) = x -- Reihenfolge beachten! (Pattern Matching)
my_head (x:[]) = x + 1
\end{code}

\begin{code}
laf1 :: [Integer] -> [Integer] -- \textbf{l}ist\_\textbf{a}ddiere\_\textbf{f}uenf
laf1 [] = []
laf1 (x:xs) = (addiere_fuenf x):(laf1 xs)
\end{code}

\begin{code}
laf2 :: [Integer] -> [Integer]
laf2 l = [ addiere_fuenf x | x<-l, x > 10] -- list comprehension
\end{code}

\begin{code}
laf3 :: [Integer] -> [Integer]
laf3 l = map (addiere_fuenf) l -- map power
\end{code}

\section*{Dokumentation}
\begin{itemize}
\item Prelude: \url{http://www.google.at/search?q=haskell+prelude+documentation}
\item Interaktive Einf\"uhrung in Haskell: \url{http://tryhaskell.org}
\end{itemize}
\end{document}
