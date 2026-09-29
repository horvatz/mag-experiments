# P03 — preverjanje

Izvor meril: `task/instructions.md`, R01–R12. Izvajanje 2026-09-27.

| Zahteva | Preverjanje | Rezultat in dokaz |
| --- | --- | --- |
| R01 | Začetne vrednosti, vrstni red in števec; `P03 defaults, Unicode normalization, all words and literal punctuation`. | Uspešno; `tests/agent/P03.spec.ts`. |
| R02–R03 | NFD/črke, več besed in dobesedni `*`; isti P03 test. | Uspešno; `tests/agent/P03.spec.ts`. |
| R04–R06 | Sestavljeni filtri, celoten seznam oseb, ID-ji v tabeli in tabli; `P03 combined filters, project-wide people, counts and both views`. | Uspešno; `tests/agent/P03.spec.ts`. |
| R07–R08 | Menjava projekta in osvežitev privzetega stanja; `P03 clears filters, resets on project switch and refreshes without persistence or writes`. | Uspešno; `tests/agent/P03.spec.ts`. URL/shramba nista bila posebej pregledana; stanje po osvežitvi je bilo. |
| R09 | N/M in števec po kombiniranem filtru; zgornji P03 scenariji. | Uspešno; `tests/agent/P03.spec.ts`. |
| R10 | Ni zadetkov v obeh pogledih in prazen projekt; `P03 distinguishes no matches from empty projects and preserves read details at mobile width`. | Uspešno; `tests/agent/P03.spec.ts`. |
| R11 | Gumb počisti vse filtre; `P03 clears filters, resets on project switch and refreshes without persistence or writes`. | Uspešno; `tests/agent/P03.spec.ts`. |
| R12 | Bralne podrobnosti, brez zapisov filtriranja, širina 390 px; zadnji P03 scenarij. Osnovna navigacija/podrobnosti preverjene tudi v baseline testih. | Uspešno v razpoložljivih preverjanjih; glej spodaj. |

`npm run check` je uspel: ESLint, `tsc --noEmit`, Vite build in **50 Playwright testov** (14 API, 24 baseline, 8 razvojnih P03, 4 lastni; 50/50 uspešnih). Prvi zagon je imel napako v lastnem regresijskem scenariju, ker je po praznem rezultatu pričakoval vrstico brez čiščenja filtra; scenarij je popravljen in celoten ponovni zagon je uspel. Dnevnik ukaza je bil v terminalskem izhodu tega izvajanja; artefakti Playwright so v `test-results/run/`.

Končni zasebni testi niso bili dostopni in niso navedeni kot izvedeni. Vizualni ročni pregled ni bil izveden.
