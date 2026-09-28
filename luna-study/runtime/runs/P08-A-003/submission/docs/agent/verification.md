# Preverjanje P08

## Končni zagon

`npm run check` je bil zagnan po zadnji spremembi kode in agentnih testov.
Ukaz je uspešno končal vse korake:

- ESLint: uspešno.
- `tsc --noEmit`: uspešno.
- Vite produkcijska gradnja: uspešno.
- Playwright: **53/53 uspešno**, brez preskočenih testov.

Razčlenitev Playwright zagona:

| Skupina | Izvedeno | Rezultat |
| --- | ---: | --- |
| API in izhodiščni testi | 38 (14 API, 12 namiznih, 12 mobilnih) | 38 uspešnih |
| Razvojni testi P08 | 8 (4 namizni, 4 mobilni) | 8 uspešnih |
| Lastni `tests/agent/P08.spec.ts` | 7 | 7 uspešnih |
| Skupaj | 53 | 53 uspešnih |

## Zahteve in dejanski dokaz

Podrobna povezava med pogoji, deli kode in testnimi imeni je v
[specifikaciji](specification.md#izvedba-in-sledljivost). Končni zagon je
potrdil naslednje scenarije:

| Zahteve | Izvedeni testi in rezultat |
| --- | --- |
| R01, R03 | `D01: fixed anchor and overdue tasks`; regresijski prikaz projekta; uspešno. |
| R02, R03, R04, R05, R06, R07, R09, R12 | `P08 calendar groups include their boundaries, done tasks, and leap day`; uspešno. Vključuje done opravili s preteklim/prihodnjim rokom, mejo +7/+8, prestopni dan, vrstni red vrstice, isti nabor table, prestopni `datetime` v podrobnostih in preverjanje brez zapisov API. |
| R04, R05 | `P08 calendar arithmetic crosses a year boundary`; uspešno. |
| R04, R06, R07 | `D02: inclusive week boundary`; uspešno. |
| R08, R09 | `D03: empty draft retains last valid classification`; `P08 empty reference date preserves the last calculation and filter`; uspešno. Preverjeno je tudi ohranjanje praznega polja in opozorila pri preklopu pogleda. |
| R02, R07, R09, R12 | `D04: done group, board and no writes`; uspešno na namizju in mobilnem projektu. |
| R10 | `P08 project changes and reload reset the local filter state`; uspešno. Preveri datum/skupino, URL ter local/session storage. |
| R11 | `P08 empty groups and empty projects keep their controls and all five counts`; `P08 empty projects show zero counters`; uspešno. |
| R12 | `P08 remains read-only and fits a 390 pixel viewport`; izhodiščni testi podrobnosti in odzivnosti; uspešno. |

## Omejitve in opombe

- Razvrščanje čez februar/marec in december/januar je bilo preizkušeno v
  Chromiumu; test ni bil ponovljen v več različnih časovnih pasovih. Izračun
  `calendarDay` uporablja samo UTC operacije, brez lokalnega časa ali
  milisekundnih odmikov zaradi DST.
- Navodila zagotavljajo veljavne datume API. Neveljavni nizi datumov iz API
  zato niso bili generirani; prazno uporabniško polje pa je preverjeno.
- Skriti končni testi niso bili dostopni.
- Prvi poskus agentnih testov je vseboval dve napaki v testni postavitvi
  (ponovni `mount` na isti hash poti in pričakovanje table pri prazni skupini).
  Postavitev testov je bila popravljena, nato je celotni `npm run check`
  uspešno opravil vseh 53 testov.
- `git status --short` ni deloval: sistemski `xcrun` javlja neveljavno pot do
  Command Line Tools (`/Library/Developer/CommandLineTools`). Naloga je svež
  izvoz brez Git zgodovine; implementacija in dokumentacija sta bili omejeni
  na `src/`, `tests/agent/` in `docs/agent/`.
