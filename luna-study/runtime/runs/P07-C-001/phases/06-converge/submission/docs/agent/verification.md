# P07 preverjanje

## Napredek

- T001: dodan `tests/agent/favorites.spec.ts` s scenariji za ID gumbe, localStorage validacijo/obnovo, filter, navigacijo, `storage` dogodke, shrambo z izjemami, API nepisanje in 390 px. `npm run typecheck` je uspel; brskalniški testi še čakajo na integracijo.
- T002: dodan `src/useFavorites.ts` za validacijo, kanonično shranjevanje, globalno stanje, dogodke in napake shrambe. `npm run typecheck` je uspel.
- T003–T005: povezana gumba v preglednici/tabli, projektni filter, števec, prazno stanje, odstranitev projekta ter Folio slogi v `src/App.tsx`, `src/TaskBoard.tsx` in `src/styles.css`. Tipi so uspešno preverjeni skupaj s T001–T002.
- Ponovni `npm run check`: uspešni lint, preverjanje tipov in gradnja; Playwright 54/54 (38 osnovnih, 8 razvojnih P07, 8 lastnih). Prvi zagon je imel en neuspešen, na velikost črk občutljiv agentni matcher; matcher je popravljen in končni zagon je zelen.

## Sledljivost zahtev

| Zahteve | Izvedba | Preverjanje in izid |
| --- | --- | --- |
| R01, R07 | `src/App.tsx`, `src/TaskBoard.tsx` | `favorite buttons are independent by ID in both views and do not write tasks`; regresijski ID-podrobnosti; uspešno. |
| R02–R04 | `src/useFavorites.ts` | `restores valid IDs and ignores invalid storage without rewriting it on load`; uspešno. |
| R05, R08, R09, R10 | `src/App.tsx`, `src/useFavorites.ts`, `src/TaskBoard.tsx` | `filter and counters stay consistent across views and project navigation`; uspešno. |
| R06 | `src/App.tsx`, `src/styles.css` | `removing the last filtered favorite shows the empty state and leaves filter controls usable`; uspešno. |
| R11 | `src/useFavorites.ts`, `src/App.tsx` | `storage events synchronize without echo writes and unrelated keys are ignored`; testi napake branja in zapisa; uspešno. |
| R12 | `src/App.tsx`, `src/TaskBoard.tsx`, `src/styles.css` | `page remains within a 390px viewport`, test brez API zapisov ter baseline regresije; uspešno. |

Celoten izpis zadnjega zagona je ustvarilo `npm run check`; Playwright poročilo je v `playwright-report/`. Končni testi zunaj lokalnega okolja niso bili dostopni in niso navedeni kot izvedeni.

Rezultate in sledljivost R01–R12 bom dodajal po korakih; neizvedenih preverjanj ne bom označil kot uspešnih.
