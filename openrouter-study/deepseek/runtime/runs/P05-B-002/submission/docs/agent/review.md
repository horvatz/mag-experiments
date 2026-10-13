# Pregled P05, postopek B (reviewer)

Pregledani: `docs/agent/specification.md` (+zgodovina), `docs/agent/verification.md`, `src/` (App.tsx, TaskBoard.tsx, navigation.ts, api.ts, styles.css), `tests/agent/pagination.spec.ts`, berljivi `tests/development/P05.spec.ts` in `helpers.ts` ter zahteve R01–R12.

## Metoda

- Statična primerjava vsake zahteve s specifikacijo, kodo in testi.
- Samostojen zagon `npm run check` (lint + tsc + gradnja + vsi testi): 60 uspešnih, 0 neuspešnih (23,3 s) – 38 osnovnih/API, 8 razvojnih (D01–D04 desktop+mobile), 14 lastnih; ujema se z `verification.md`.
- Preverjeni pomišljaj U+2013 v statusu in odsotnost trajne shrambe/parametrov strani v URL-ju.

## Ugotovitve po zahtevah

| Zahteva | Dokaz | Ocena |
| --- | --- | --- |
| R01 | privzetka `all/all`, `visible=filtered`; lastni test R01 | ustreza |
| R02 | `filtered.slice` po straneh; testa R02 in R02/R04 (11 opravil) | ustreza |
| R03 | `disabled` po `atFirst/atLast`; test R03 (tudi vsiljen klik) | ustreza |
| R04 | `setSize` + `setPage(1)`; `pageCount=1` pri `all`, `n>0`; R04 + D04 | ustreza |
| R05 | filter pred `slice`, sprememba filtra `setPage(1)`; R05 + D03 | ustreza |
| R06 | `TaskBoard` prejme `visible`; R06 (stolpci [1,0,1]) + D03 | ustreza |
| R07 | `ProjectView` se ne remounta ob pogledu/podrobnostih; R07 | ustreza |
| R08 | `key={project.id}`, le `useState`, brez shrambe/parametrov; R08 | ustreza |
| R09 | točno besedilo z U+2013; R09, R01, D02 | ustreza |
| R10 | `n=0` → `Stran 0 od 0. Prikazano 0–0 od 0.`, vsi gumbi disabled; R10 | ustreza |
| R11 | pregled šteje nefiltrirane `tasks`, stolpci le `visible`; R11 | ustreza |
| R12 | le GET v `src/`, povezave/`data-task-id` ohranjeni; R12 + D04 | ustreza |

Specifikacija zajema vseh dvanajst zahtev s predikati; predpostavke (značka = filtrirani `n`, noga = celoten projekt) so zapisane v odprtih vprašanjih in izvedene skladno z njimi.

## Omejitve pregleda

- Skriti končni testi niso dostopni; preverjeni so vsi dostopni testi.
- Ročni ogled prek `WEB_PORT=5193 API_PORT=3123 npm run dev` ni bil izveden; videz/mobilna širina sta preverjena avtomatizirano (390 px + baseline mobile).
- Dodatne podatkovne množice onkraj dostopnih testov (npr. točno 1 opravilo) niso bile ločeno izvedene; logika filter/slice je splošna.

Konkretnih odstopanj od R01–R12 ni bilo najdenih, zato so ugotovitve prazne.
