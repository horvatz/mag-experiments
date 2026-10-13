# P05 — zapiski izvajalca (verification.md)

Vloga: implementer. Vir zahtev: `docs/agent/specification.md` (R01–R12) in `task/instructions.md`.
Stanje: v teku; načrt je zapisan pred izvedbo.

## Načrt preverjanja (ustvarjeno na začetku, še neizvedeno)

| # | Preverjanje | Zahteve | Način | Stanje |
| --- | --- | --- | --- | --- |
| V1 | Privzetki all/all, vsi ID-ji v vrstnem redu API | R01 | lastni test + D01/D04 | načrtovano |
| V2 | Odseki 2/5/10: unija = F, brez podvajanj, zadnja stran krajša | R02 | lastni test (N=8, meje) | načrtovano |
| V3 | Navigacija in onemogočeni robovi (prva/zadnja/prazno) | R03 | lastni test + D02 | načrtovano |
| V4 | Menjava velikosti vrne na prvo stran; all = ena stran | R04 | lastni test + D04 | načrtovano |
| V5 | Filter pred straničenjem, vrne na prvo stran, vrstni red P | R05 | lastni test + D03 | načrtovano |
| V6 | Preglednica in tabla ista množica ID-jev trenutne strani | R06 | lastni test | načrtovano |
| V7 | Preklop pogleda in podrobnosti ohranijo stanje | R07 | lastni test | načrtovano |
| V8 | Menjava projekta in osvežitev ponastavita stanje | R08 | lastni test | načrtovano |
| V9 | Točno besedilo statusa za N>0 | R09 | lastni test + D02 | načrtovano |
| V10 | Prazen rezultat: Stran 0 od 0, gumbi onemogočeni, ponovni filter | R10 | lastni test | načrtovano |
| V11 | Summary iz P, števci stolpcev iz V | R11 | lastni test | načrtovano |
| V12 | Brez zapisov, regresije (povezave, ID-ji, podrobnosti), 390 px | R12 | lastni test + baseline + D04 | načrtovano |

## Spremembe

- `src/pagination.ts` (nov): čiste pomožne funkcije `filterTasks`, `countByStatus`, `pageCount`, `pageSlice`, `pageStatusText`.
- `src/App.tsx`: stanje `size`/`filter`/`page` v `ProjectView`, kontrole straničenja (selecta, štirje gumbi, `role=status` z imenom `Stanje straničenja`), stranjen odsek `visibleTasks` za preglednico in tablo, ohranjeni summary/števci.
- `src/styles.css`: razporeditev `.pagination-bar` z prelomom vrstic in prilagoditvijo pod 760 px.
- `tests/agent/p05.spec.ts` (nov): lastni testi A01–A05.

## Dejanski rezultati

(se vpišejo po izvedbi)

## Omejitve

- Lastni testi tečejo v projektu `agent`; končnih (skritih) testov ni mogoče izvesti.
