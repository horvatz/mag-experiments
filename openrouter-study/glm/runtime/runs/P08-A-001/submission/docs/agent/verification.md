# Preverjanje P08

## Izvedena preverjanja

| Preverjanje | Zahteve | Rezultat |
| --- | --- | --- |
| `npm run typecheck` | Tipizacija izvedbe | Uspešno. |
| `npm run lint` | Slog in statične napake | Uspešno. |
| `npm run build` | Produkcijska izgradnja | Uspešno. |
| `npx playwright test --project=agent` | R01–R12 prek lastnih testov | 7/7 uspešno. |
| `npx playwright test --project=development-desktop --project=development-mobile` | Skupne razvojne zahteve P08 | 8/8 uspešno. |
| `npm run check` | Celotna dostopna koda, izgradnja in testi | 53/53 uspešno. |

Prvi celoten `npm run check` je odkril regresijo izhodišča: prazen projekt v pogledu `all` ni več prikazal obstoječega sporočila `V tem projektu še ni opravil`. Vrsta je bila takoj odpravljena; končni `npm run check` je 53/53 uspešen.

## Sledljivost zahtev

| Zahteva | Dejanski scenarij in dokaz | Koda |
| --- | --- | --- |
| R01 | `P08 classification, counters and calendar boundaries` preveri začetni `2026-09-21` in `all`. | `src/App.tsx`, `src/dateGroups.ts` |
| R02 | Isti test vsebuje končana opravila pred referenčnim dnem, na njem in za njim; vsa so samo v `done`. | `src/dateGroups.ts` |
| R03 | Isti test preveri meji `overdue` in `today`. | `src/dateGroups.ts` |
| R04 | Isti test preveri 1. in 7. dan v `week` ter kasnejše v `later`; skupine so disjunktne. | `src/dateGroups.ts` |
| R05 | Isti test preveri prehod februar–marec v prestopnem letu in prehod december–januar. | `src/dateGroups.ts` |
| R06 | Isti test primerja vseh pet števcev pred in po spremembi filtra. | `src/App.tsx` |
| R07 | Isti test preveri izvorni vrstni red v preglednici; `P08 view switch preserves date and selected group` preveri enake ID-je v tabeli in tabli. | `src/App.tsx`, `src/TaskBoard.tsx` |
| R08 | `P08 invalid draft preserves last valid state` preveri prazen osnutek, opozorilo, ohranjen preračun in takojšen nov preračun. | `src/App.tsx` |
| R09 | `P08 view switch preserves date and selected group` preveri ohranitev datuma, besedila polja in skupine pri preklopu. | `src/App.tsx` |
| R10 | `P08 project change and refresh reset local state` preveri reset, `localStorage` in URL. | `src/App.tsx` |
| R11 | `P08 empty project` in `P08 selected empty group in non-empty project` preverita obe sporočili in preklop. | `src/App.tsx` |
| R12 | `P08 readonly behavior, details and 390 px layout` preveri bralnost, podrobnosti, odsotnost zapisov in širino 390 px. | `src/App.tsx`, `src/styles.css` |

## Omejitve

- Nepreverjeno ostane obnašanje izven dane domene veljavnih koledarskih datumov in veljavnih tipov, ki ga naloga izrecno izključuje.
- Tabla ohranja obstoječe tri stolpce po stanju; vsak stolpec ohranja izvorni vrstni red, globalni DOM vrstni red pa slediti obstoječi strukturi tabele.
- Namestitveni ukazi so zagnani v danem lokalnem okolju; ločenega produkcijskega strežnika nismo odpirali, ker naloga tega ne zahteva.
