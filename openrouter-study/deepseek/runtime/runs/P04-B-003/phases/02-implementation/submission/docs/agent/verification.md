# Poročilo implementerja — P04 (vloga: implementer)

Različica 1.0, 10. oktober 2026. Status: načrt preverjanj; rezultati se
dopolnjujejo sproti. Povezave na zahteve R01–R12 iz task/instructions.md in
docs/agent/specification.md.

## Spremembe (sprotni zapis)

- Načrt: nov modul `src/sortTasks.ts` (normalizacija, primerjava, stabilno
  urejanje), štiri kontrole in gumb v `src/App.tsx`, `src/TaskBoard.tsx`
  prejme že razvrščeno polje, slog v `src/styles.css`, lastni testi v
  `tests/agent/`.

## Načrtovana preverjanja (še neizvedeno)

| Zahteva | Preverjanje | Načrtovani dokaz | Izid |
| --- | --- | --- | --- |
| R01 | privzete vrednosti, vrstni red T | D01, lastni test privzetkov | ni izvedeno |
| R02 | NFD + odstranitev diakritike + male črke + UTF-16 | D01, lastni test Unicode | ni izvedeno |
| R03 | rang stanj, kronologija datumov | D02, D03, lastni test | ni izvedeno |
| R04 | smer obrne le izbrani ključ | D02, D04, lastni test | ni izvedeno |
| R05 | sekundarni ključ le ob enakosti, neodvisna smer | D02, lastni test | ni izvedeno |
| R06 | stabilnost, enak sekundarni/primarni, original | D01, D04, lastni test | ni izvedeno |
| R07 | trije stolpci, relativni vrstni red | D03, lastni test table | ni izvedeno |
| R08 | preklop pogleda in podrobnosti ohranita nastavitve | lastni test | ni izvedeno |
| R09 | menjava projekta in osvežitev ponastavita | lastni test | ni izvedeno |
| R10 | gumb ponastavi; prazno/enopomensko | D04, lastni test | ni izvedeno |
| R11 | projekcija brez zapisov, nespremenjena polja | D04 readonly, lastni test | ni izvedeno |
| R12 | ID-ji enkrat, podrobnosti, 390 px, a11y imena | baseline/api, lastni test | ni izvedeno |

## Omejitve okolja

- Končni testi niso dostopni; preverjam z razvojnimi testi D01–D04 in lastnimi
  testi. Javni internet je blokiran; Chromium je nameščen, povezujem se prek
  `chromium.connect(wsEndpoint)` iz `task/browser.json`.
- Neveljavni/manjkajoči datumi niso v obsegu (specifikacija).
