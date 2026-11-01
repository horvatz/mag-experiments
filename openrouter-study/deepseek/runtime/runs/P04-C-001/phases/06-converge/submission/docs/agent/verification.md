# Preverjanje P04 (verification.md)

- Datum: 2026-11-01; spec: `docs/agent/P04/spec.md`, načrt: `docs/agent/P04/plan.md`.
- Namen: dokazi o izvedbi in sledljivost zahtev R01–R12.

## Izvedeno

- T002–T006: `src/sorting.ts` (novo), `src/SortControls.tsx` (novo), `src/App.tsx` (stanje σ, razvrščeno polje), `src/styles.css` (orodna vrstica). `src/TaskBoard.tsx` ni potreboval spremembe: prejme že razvrščeno polje, `filter` ohrani vrstni red stolpcev.
- T007–T010: lastni testi v `tests/agent/` (`helpers.ts`, `sort-table.spec.ts`, `sort-board.spec.ts`, `sort-state.spec.ts`, `sort-projection.spec.ts`), 22 testov.
- T011–T012: `npm run check` (lint, typecheck, build, vsi testi) — uspešno.

## Ukaz in izid

- `npm run check` dne 2026-11-01: 68 testov uspešno (14 `api` + 12 `desktop` + 12 `mobile` = 38 osnovnih, 8 razvojnih `development-desktop`/`development-mobile`, 22 lastnih `agent`), brez napak lint in typecheck.
- Prejšnji vmesni zagon `npx playwright test --project=agent`: 22 uspešno.

## Sledljivost

| Zahteva | Test | Izid |
| --- | --- | --- |
| R01 | `sort-table.spec.ts` (privzete nastavitve, izvorni red) | uspešno |
| R02 | `sort-table.spec.ts` (normalizirani nizi, NFD, velike črke, ločila) | uspešno |
| R03 | `sort-table.spec.ts` (stanje, rok) | uspešno |
| R04 | `sort-table.spec.ts` (smer obrne le primerjavo) | uspešno |
| R05 | `sort-table.spec.ts`, `sort-board.spec.ts` (sekundarni ključ in smer) | uspešno |
| R06 | `sort-table.spec.ts` (stabilnost, enak ključ, original) | uspešno |
| R07 | `sort-board.spec.ts` (stolpci, relativni red) | uspešno |
| R08 | `sort-board.spec.ts`, `sort-state.spec.ts` (pogled, podrobnosti) | uspešno |
| R09 | `sort-state.spec.ts` (projekt, osvežitev, URL) | uspešno |
| R10 | `sort-table.spec.ts`, `sort-state.spec.ts` (gumb, prazno, eno opravilo) | uspešno |
| R11 | `sort-projection.spec.ts` (brez zapisov, nespremenjeni podatki) | uspešno |
| R12 | `sort-projection.spec.ts`, `baseline.spec.ts` (ID-ji, podrobnosti, 390 pik) | uspešno |

## Omejitve

- Končni ocenjevalni testi niso dostopni v tem okolju; tu navedeni izidi veljajo za skupne, razvojne in lastne teste.
- Ročni ogled (`WEB_PORT=5193 API_PORT=3123 npm run dev`) ni bil izveden; preverjanje je potekalo prek testov.
