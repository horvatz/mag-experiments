# P03 — Naloge izvedbe

Vir: `docs/agent/P03/spec.md`, `docs/agent/P03/plan.md`,
`.specify/memory/constitution.md`. Vsaka naloga je majhen korak; koda se
spreminja le v `src/`, testi v `tests/agent/`, dokumenti v `docs/agent/`.

## Osnova

- [ ] T001 Ustvari `src/taskFilters.ts` s čistimi pomožniki `normalizeForSearch` (NFD, odstranitev U+0300–U+036F, male črke), `searchWords`, `matchesQuery`, `visibleTasks`, `assigneeOptions` (R02–R05).
- [ ] T002 V `src/App.tsx` dodaj stanje filtrov (q, s, a) v `ProjectView` in kontrole: iskalni input type=search, izbirnik stanja all/todo/in_progress/done, izbirnik osebe all/ime, gumb Počisti filtre; `role=status` z aria-label Rezultati filtriranja in besedilom Prikazano: N od M. (R01, R04, R05, R09, R11).
- [ ] T003 V `src/App.tsx` izpelji `visible` iz `tasks` in uskladi pregled stanj, števce, sporočilo Ni zadetkov. ob praznih zadetkih ter ohrani prazno stanje 0 od 0 (R01, R06, R09, R10).
- [ ] T004 V `src/TaskBoard.tsx` veži stolpce in njihove števce na prikazana opravila; preklop pogleda ohrani filtre in iste ID-je (R06, R09).
- [ ] T005 V `src/styles.css` oblikuj vrstico kontrol z obstoječimi slogovnimi spremenljivkami; ohrani Folio, ozko širino 390 px in notranje drsenje (R12).

## Lastni testi in preverjanje

- [ ] T006 V `tests/agent/p03.spec.ts` dodaj Playwright preverjanja za R01–R05: privzeto stanje, normalizacija č/Č in velikosti črk, večbesedni vnos in ločila, logični IN, možnosti oseb iz celotnega projekta.
- [ ] T007 V `tests/agent/p03.spec.ts` dodaj preverjanja za R06–R12: enaki ID-ji pogledov, ponastavitev ob preklopu projekta, osvežitev brez URL-ja/shrambe, števci N od M., Ni zadetkov., počistitev filtrov, regresija navigacije in odsotnost POST/PATCH/PUT/DELETE na /api/.
- [ ] T008 Zaženi `npm run typecheck`, `npm run lint` in `npm test`; zabeleži izide in neuspehe.
- [ ] T009 Vpiši rezultate in dokaze (ime testa, dnevnik zagona) v tabelo Izvedba in sledljivost v `docs/agent/P03/spec.md`; jasno navedi nepreverjene dele in omejitve.
