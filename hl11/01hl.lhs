\documentclass[a4paper,12pt]{scrartcl}
%die naechste zeile ist fuer lhs2TeX noetig
%include lhs2TeX.fmt

\usepackage{hyperref}
\usepackage{url}
\usepackage[utf8x]{inputenc}
\usepackage{marvosym}
\usepackage{float}
\usepackage{verbatim}

\newcommand{\authormod}[2]{#1\\{\small#2}}

\begin{document}

\begin{comment}

> import Debug.Trace

\end{comment}

\author{
	\authormod{Bong Min Kim}{bmktuwien\MVAt gmail.com} \and
	\authormod{Christoph Sp\"ork}{christoph.spoerk\MVAt gmail.com} \and
	\authormod{Florian Hassanen}{florian.hassanen\MVAt gmail.com } \and
	\authormod{Bernhard Urban}{lewurm\MVAt gmail.com}
}

\subject{Haskell Live}

\title{[01] Eine Einf\"uhrung in Hugs}
\date{14. Oktober 2011}

\maketitle


\section*{Hinweise}

Diese Datei kann als sogenanntes ``Literate Haskell Skript'' von \texttt{hugs}
geladen werden, als auch per
\texttt{lhs2TeX}\footnote{\url{http://people.cs.uu.nl/andres/lhs2tex}} und
\LaTeX\ in ein Dokument umgewandelt werden.


\section*{Kurzeinf\"uhrung in \texttt{hugs}}

\texttt{hugs}\footnote{Haskell User's Gofer System} ist ein Interpreter f\"ur die
funktionale Programmiersprache Haskell. Abh\"angig vom Betriebssystem wird der
Interpreter entsprechend gestartet, unter GNU/Linux beispielsweise mit dem
Befehl \texttt{hugs}. Tabelle \ref{tab:hugscmds} zeigt eine \"Ubersicht der
wichtigsten Befehle in \texttt{hugs}.

\begin{table}[H]
	\begin{tabular}{llp{9cm}}
	Befehl & Kurzbefehl & Beschreibung\\
	\hline
	\texttt{:edit name.hs} & \texttt{:e name.hs} & \"offnet die Datei \texttt{name.hs} in dem Editor, der in
	\texttt{\$EDITOR} (Unix) bzw. in WinHugs in den Optionen definiert ist\\
	
	\texttt{:load name.hs} & \texttt{:l name.hs} & l\"adt das Skript \texttt{name.hs}. Man kann fortan die einzelnen Funktionen aus dem Script im \texttt{hugs} auszuf\"uhren.\\

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
	\texttt{\textit{Expr}} & & Wertet \texttt{\textit{Expr}} aus (wobei f\"ur diese Auswertung das momentan geladene Skript herangezogen wird; siehe \texttt{:load}) \\
	\end{tabular}
\centering
\caption{Einige Befehle in \texttt{hugs}}
\label{tab:hugscmds}
\end{table}

\section*{Primitiver Haskell Code}

> eins :: Integer
> eins = 1

\smallskip

> addiere :: Integer -> Integer -> Integer
> addiere x y = x + y

\smallskip

> addiereFuenf :: Integer -> Integer
> addiereFuenf x = addiere 5 x

\smallskip

> istGleichEins :: Integer -> Bool
> istGleichEins 1 = True -- Reihenfolge beachten. Spezielle Patterns zuerst!
> istGleichEins x = False

\smallskip

\section*{Listen notieren}

Listen k\"onnen einfach notiert werden: Zum Beispiel erzeugt der
Ausdruck \texttt{[1,2,3,4]} eine Liste von gleicher Darstellung.
In Tabelle \ref{tab:listop} sind einfache Beispiele angef\"uhrt.
\begin{table}[H]
	\begin{tabular}{lp{3.3cm}p{7.1cm}}
	Ausdruck & Ergebnis & Beschreibung\\
	\hline
	\texttt{[1,2,3,4,5]} & \texttt{[1,2,3,4,5]} & Erzeugt eine Liste mit den Elemente 1 bis 5\\
	\texttt{[1..5]} & \texttt{[1,2,3,4,5]} & Erzeugt eine Liste mit den Elemente 1 bis 5\\

	\texttt{[1,4..14]} & \texttt{[1,4,7,10,13]} & Siehe n\"achstes Beispiel\\

	\texttt{[$a$,$b$..$x$]} & \vtop{ \hbox{\strut \texttt{[} $a$,$\ b=a+d$,} 
	                                 \hbox{\strut $a+2d$,$\ a+3d$,$\ $\texttt{...},}
									 \hbox{$x - d < a+nd \leq x $ \texttt{]}} } & Es
	wird ein Offset $d$ (Differenz von $a$ und $b$) ermittelt. Zu der Basis $a$, wird bis zum Wert $x$, jede Summe der Basis plus einem
	Vielfachen des Offsets, der Liste hinzugef\"ugt\\

	\texttt{[]} & \texttt{[]} & Leere Liste aka. ``nil''\\

	\texttt{1:(2:(3:(4:[])))} & \texttt{[1,2,3,4]} & \texttt{(:)} aka. ``cons''\\
	\texttt{1:2:3:4:[]} & \texttt{[1,2,3,4]} & ``cons'' ist rechts-assoziativ \\

	\texttt{"{asdf}"} & \texttt{"{asdf}"} & Liste von \texttt{Char}. \\
	\texttt{\char"0D a\char"0D:\char"0D s\char"0D:\char"0D d\char"0D:\char"0D f\char"0D:[]} & \texttt{"{asdf}"} & Beachte,
	dass der Typ \texttt{String} dem Typen \texttt{[Char]} entspricht. \\
	\end{tabular}
\centering
\caption{Einfache Beispiele f\"ur Listen}
\label{tab:listop}
\end{table}

\section*{Listen verarbeiten}

> my_head :: [Integer] -> Integer
> my_head [] = -1
> my_head (x:xs) = x -- Reihenfolge beachten! (Pattern Matching)
> my_head (x:[]) = x + 1

\smallskip

> laf1 :: [Integer] -> [Integer] -- \textbf{l}ist\_\textbf{a}ddiere\_\textbf{f}uenf
> laf1 [] = []
> laf1 (x:xs) = (addiereFuenf x):(laf1 xs)

\smallskip

> laf2 :: [Integer] -> [Integer]
> laf2 l = [ addiereFuenf x | x <- l, x > 10] -- list comprehension

\smallskip

> laf3 :: [Integer] -> [Integer]
> laf3 l = map (addiereFuenf) l -- map magic

\section*{Integer VS. Int}

> grosserInteger :: Integer
> grosserInteger = 1000 * 1000 * 1000 * 1000 * 1000 * 1000 * 1000

\smallskip

> grosserInt :: Int
> grosserInt = 1000 * 1000 * 1000 * 1000 * 1000 * 1000 * 1000

\smallskip

> gibNimmInteger :: Integer -> Integer
> gibNimmInteger i = i

\smallskip

> gibNimmInt :: Int -> Int
> gibNimmInt i = i

\smallskip

Besonders nervig, wenn man einen \texttt{Int} hat aber einen \texttt{Integer} br\"auchte (oder vice versa).
In so einem Fall k\"onnte man die betroffene Funktion nochmals manuell implementieren:

> myLength :: [Integer] -> Integer
> myLength []     = 0
> myLength (x:xs) = 1 + (myLength xs)

\smallskip

Oder man verwendet \texttt{fromIntegral}:

> passendIntInteger :: Int -> Integer
> -- \texttt{fromIntegral} in \texttt{Prelude} 
> passendIntInteger i = gibNimmInteger (fromIntegral (gibNimmInt i)) 

\smallskip

> passendIntegerInt :: Integer -> Int
> -- funktioniert in beide Richtungen
> -- mit \texttt{\$} kann man Klammern sparen!
> passendIntegerInt i = gibNimmInt $ fromIntegral $ gibNimmInteger i 

\section*{Rudiment\"ares Debugging}

Use \texttt{trace} from \texttt{Debug.Trace}:

< import Debug.Trace

\smallskip

> lafDebug :: [Integer] -> [Integer]
> lafDebug []     = trace "Liste zu Ende" []
> lafDebug (x:xs) = trace debugMessage    ( neuesX:(lafDebug xs) )
>                   where 
>                     neuesX       = addiereFuenf x
>                     debugMessage = "Berechne: addiereFuenf " ++ (show x) ++ " = " ++ (show neuesX)

\section*{Dokumentation}

\begin{itemize}
\item Prelude: \url{http://www.google.at/search?q=haskell+prelude+documentation}
\item Interaktive Einf\"uhrung in Haskell: \url{http://tryhaskell.org}
\end{itemize}
\end{document}
