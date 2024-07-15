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

\title{[02] Licht, mehr Licht}
\date{15. Oktober 2010}

\maketitle

\section*{Hinweise}
Diese Datei kann als sogenanntes ``Literate Haskell Skript'' von \texttt{hugs}
geladen werden, als auch per
\texttt{lhs2TeX}\footnote{\url{http://people.cs.uu.nl/andres/lhs2tex}} und
\LaTeX\ in ein Dokument umgewandelt werden.

\section*{Tips \& Tricks}
\subsection*{let \& where}
\begin{code}
import Data.Char

l1 :: Integer -> Integer
l1 x = 	let
		f :: Integer -> Integer
		f y = y + 3 + x -- 'x' auch hier verwendbar
		g :: Integer
		g = 1337
		in 
		f (g+x)

w1 :: Integer -> Integer
w1 x = f (g+x)
	where
	f :: Integer -> Integer
	f y = y + 3 + x -- 'x' auch hier verwendbar
	g :: Integer
	g = 1337
\end{code}

\subsection*{Listen Funktionen}
\begin{itemize}
\item \texttt{:} -- ``cons''
\item \texttt{!!} -- Zugriff per Index
\item \texttt{++} -- Verkettung
\item \texttt{length} -- L\"ange der Liste
\item \texttt{head / last} -- Erstes bzw. letztes Element
\item \texttt{tail / init} -- Alles au\ss{}er dem ersten bzw. letzten Element
\item \texttt{take / drop} -- Die ersten Elemente nehmen bzw. l\"oschen
\item \texttt{reverse} -- Liste reversieren
\end{itemize}

\subsection*{Guards \& if/else}
\begin{code}
g1 :: Integer -> String
g1 x = 	if x < 0 then
			"negativ"
		else
			if x < 10 then
				"kleiner zehn"
			else
				"groesser gleich zehn"
\end{code}

\begin{code}
g2 :: Integer -> String
g2 777 = "777"
g2 x -- auch hier wieder Achtung! Reihenfolge beachten
	| x < 0 = "negativ"
	| x < 10 = "kleiner zehn"
	| otherwise = "groesser gleich zehn"
\end{code}

\subsection*{Tupeln}
\begin{code}
t1 :: (Integer,Integer) -> Integer
t1 x = (fst x) + (snd x)

t2 :: (Integer,Integer) -> Integer
t2 (x,y) = x + y
\end{code}

\subsection*{quot, rem, div \& mod}
... sind unterschiedlich fuer negative Zahlen definiert (Details hier nachzulesen:
\url{http://www.haskell.org/onlinereport/basic.html#sect6.4.2}).

Der Unterschied ist f\"ur die \"Ubungsbeispiele nicht relevant, da hier nur
postive Zahlen verwendet werden. Man kann daher \texttt{quot} \& \texttt{rem}
als auch \texttt{div} \& \texttt{mod} verwenden.

\subsection*{Integer und Int...}
F\"ur das zweite Aufgabenblatt ist je nach L\"oesungsweg eventuell die Funktion
\texttt{chr} aus der Library \texttt{Data.Char} mit dem Typen \texttt{Int ->
Char} n\"otig. Die Aufgabenblatt verlangt aber einen \texttt{Integer}, deswegen
ist eine Typumwandlung n\"otig.
\begin{code}
mychr :: Integer -> Char
mychr x = chr (fromInteger x)
\end{code}

\section*{Licht, mehr Licht!}
\begin{code}
type Lampe = Bool

durchschalten :: Lampe -> [Bool] -> Lampe
durchschalten akt [] = akt
durchschalten akt (x:xs)
	| x = durchschalten (not akt) xs
	| otherwise = durchschalten akt xs

switch :: Integer -> Lampe
switch n = head (reverse (switch' 1))
	where
	switch' :: Integer -> [Lampe]
	switch' pos
		| (pos-1) == n = []
		| otherwise = lampe_pos:(switch' (pos+1))
		where
		lampe_pos :: Lampe
		lampe_pos = durchschalten False durchgaenge
		durchgaenge :: [Bool]
		durchgaenge = [pos `mod` i == 0 | i <- [1..n]]
\end{code}

K\"urzere Variante:
\begin{code}
licht :: Integer -> String

licht n
	| t = "aus"
	| otherwise = "an"
	where t = ((length [x | x <- [1..n], n `mod` x == 0]) `mod` 2) == 0
\end{code}
\end{document}
