# P10 preverjanje

**Datum:** 2026-10-09

## Izvedba

- Čista logika permutacij, premikov, razveljavitev, ponovitev in meje 20 je v `src/ordering.ts`.
- Lokalno stanje, zgodovinske kontrole, globalna mesta in vrstične akcije so v `src/App.tsx`.
- Tabla ohranja relativni red statusnih stolpcev, globalna mesta in globalne sosede v `src/TaskBoard.tsx`.
- Folio stile za akcije in zgodovino dopolnjuje `src/styles.css`.
- Lastni testi so v `tests/agent/P10.spec.ts` in `tests/agent/helpers.ts`.

## Izvedena preverjanja

| Preverjanje | Ukaz | Izid | Opombe |
| --- | --- | --- | --- |
| Tipi | `npm run typecheck` | Uspešno | Brez tipovnih napak. |
| Lastni testi P10 | `npx playwright test tests/agent/P10.spec.ts --project=agent` | Uspešno: 10/10 | Pokrivajo R01–R12, vključno s širino 390 px. |
| Slog | `npm run lint` | Uspešno | ESLint brez opozoril. |
| Celotno preverjanje | `npm run check` | Uspešno: 56/56 | Vključuje lint, tipe, gradnjo, 38 osnovnih, 8 razvojnih P10 in 10 lastnih preverjanj. |

## Sledljivost

- R01–R12 so povezani s pogoji, kodo in testi v `docs/agent/P10/spec.md`.
- Zgodovina razveljavitev se omeji na 20; ponovitve so preverjene za vsa trenutna razveljavljena dejanja.
- Vmesnik ne doda zapisovalnega API-ja, `localStorage`, nove odvisnosti ali spremembe skupne infrastrukture.

## Omejitve

- Končni zasebni testi niso dostopni in niso izvedeni.
- Novi vizualni detajli so preverjeni z obstoječimi in lastnimi brskalnimi testi, ne z ločenim dizajnerskim pregledom.
