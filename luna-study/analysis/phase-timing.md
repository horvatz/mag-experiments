# Čas arhiviranih faz

Naknadna opisna analiza arhivskih faz, dodana po 29 arhivih L/1.0; ni nov potrditveni kontrast ali vzročna analiza. Mediane uporabljajo samo znane čase in navajajo imenovalec. Vključeni so tudi časovno prekinjeni in neuspešni koraki.

Posnetek 2026-09-29T19:54:58.948Z; 144/144 skupnih arhivov. Obe zbirki zaključeni.

Čas faze vključuje vse njene modelske korake. A je ena seja in je iz dnevnika ne razdeljujemo na navidezno primerljive vloge. Faze B/C imajo različne vsebine in omejitve. Mediana faz ni mediana celotnega postopka; vsota časov faz lahko zaradi prehodov odstopa od časa izvedbe. Kratka napaka dostopa ni hitro rešena naloga.

Vključene so izvorno zabeležene faze iz execution.json. Izpeljane vrstice handoffs-and-orchestration iz starega izvoza M/1.0 niso dodatne modelske faze in tu niso vključene. Ena seja A je poimenovana single-session (v starem izvozu combined-agent-work).

| Model | Pristop | Faza | Znani časi / zabeležene faze | Mediana znanih (s) | Statusi |
| --- | --- | --- | --- | --- | --- |
| astra | A | single-session | 24/24 | 639,62 | completed: 19; execution_failed: 5 |
| astra | B | implementation | 20/20 | 426,34 | completed: 20 |
| astra | B | implementation-repair | 1/1 | 119,19 | completed: 1 |
| astra | B | review | 20/20 | 236,15 | completed: 20 |
| astra | B | specification | 24/24 | 260,97 | completed: 19; phase_time_limit: 1; execution_failed: 4 |
| astra | B | specification-repair | 1/1 | 90,05 | phase_time_limit: 1 |
| astra | C | constitution | 24/24 | 86,83 | completed: 20; execution_failed: 4 |
| astra | C | converge | 19/19 | 97,55 | completed: 19 |
| astra | C | implement | 19/20 | 470,15 | completed: 19; infrastructure_interrupted: 1 |
| astra | C | plan | 20/20 | 106,50 | completed: 20 |
| astra | C | specify | 20/20 | 163,19 | completed: 20 |
| astra | C | tasks | 20/20 | 70,63 | completed: 20 |
| luna | A | single-session | 24/24 | 700,49 | completed: 21; execution_failed: 1; time_limit: 2 |
| luna | B | implementation | 24/24 | 484,45 | completed: 21; phase_time_limit: 3 |
| luna | B | implementation-repair | 9/9 | 117,58 | completed: 8; time_limit: 1 |
| luna | B | review | 24/24 | 195,36 | completed: 23; phase_time_limit: 1 |
| luna | B | specification | 24/24 | 271,20 | completed: 22; phase_time_limit: 2 |
| luna | B | specification-repair | 1/1 | 90,04 | phase_time_limit: 1 |
| luna | C | constitution | 24/24 | 100,78 | completed: 24 |
| luna | C | converge | 2/2 | 100,70 | completed: 2 |
| luna | C | implement | 19/19 | 343,99 | phase_time_limit: 17; completed: 2 |
| luna | C | plan | 24/24 | 148,95 | completed: 24 |
| luna | C | specify | 24/24 | 359,21 | completed: 24 |
| luna | C | tasks | 24/24 | 113,44 | completed: 20; time_limit: 4 |

## Priprava pri C

Za vsako izvedbo C seštejemo zabeležene constitution, specify, plan in tasks. Vključimo tudi delno zaključeno pripravo, če se je postopek končal pred implementacijo. Če kateri od teh zabeleženih časov manjka, je vsota neznana. Nezačete faze se ne predstavljajo kot izmerjene ničle. Zato to ni primerjava samo uspešno pripravljenih izvedb niti ocena časa uspešne rešitve.

| Model | Arhivi C | Znane vsote priprave | Mediana priprave (s) | Implement začet | Začetni implement completed | Converge začet |
| --- | --- | --- | --- | --- | --- | --- |
| astra | 24 | 24/24 | 427,27 | 20/24 | 19/24 | 19/24 |
| luna | 24 | 24/24 | 772,02 | 19/24 | 2/24 | 2/24 |

Vsi začetni implement koraki so šteti ne glede na funkcionalni rezultat oddaje. Iz časovne razčlenitve same ne sklepamo, kaj bi model dosegel z drugačnim razporedom časa. Medzbirčna primerjava vključuje razliko modela, CLI in obdobja.

Posamezne vrstice, izvorne datoteke in njihovi SHA-256 so v [phase-timing.json](phase-timing.json). Formalne predaje in popravki so ločeno v [process-summary.md](process-summary.md).
