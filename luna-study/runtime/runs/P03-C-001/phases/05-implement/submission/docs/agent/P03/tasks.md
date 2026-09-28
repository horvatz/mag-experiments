# P03: izvedbene naloge

## Setup

Odvisnosti in Playwright nastavitev so že na voljo; setup ne spreminja konfiguracij ali skupnih testov.

## Temeljne naloge

- [x] [T001] Dodaj čiste funkcije v `src/taskFilters.ts` za NFD normalizacijo, iskanje po vseh besedah in dobesednih podnizih, sestavo pogojev stanja/osebe z logičnim IN ter enolična neprazna imena oseb iz celotnega seznama projekta (R02–R05).

## Uporabniške zgodbe (po vrsti)

- [x] [T002] Dodaj v `src/App.tsx` lokalno stanje iskanja in obeh filtrov ter zahtevane kontrole; obdrži filtre pri menjavi pogleda, ponastavi jih pri menjavi projekta in ob dejanju »Počisti filtre« ter jih ne zapisuj v URL ali trajno shrambo (R01, R05, R07, R08, R11).
- [x] [T003] V `src/App.tsx` izračunaj zadetke enkrat iz nefiltriranih opravil projekta in jih uporabi za preglednico, povzetek stanj ter števec rezultatov; posreduj isti seznam v `src/TaskBoard.tsx`, kjer stolpci in števci ostanejo omejeni na zadetke. Loči prazen projekt od projekta brez zadetkov, ne spreminjaj vira ali vrstnega reda (R01, R06, R09–R11).
- [x] [T004] Dopolni `src/App.tsx` in `src/styles.css` z določenimi dostopnimi imeni, `role="status"`, `aria-label`, `data-task-id` ter videzom Folio; ohrani viden fokus in prepreči vodoravno širjenje strani pri 390 px (R09, R12).

## Dodelava in preverjanje

- [x] [T005] Dodaj lastne scenarije v `tests/agent/P03.spec.ts` z obstoječim testnim pripomočkom samo iz testov: pokrij iskanje po vseh poljih, normalizacijo in dobesedne večbesedne poizvedbe; celoten nabor oseb in ponastavitev projekta; enake ID-je/filtre v obeh pogledih in števce stolpcev; osvežitev; prazen projekt proti nič zadetkom; čiščenje kontrol; navigacijo/podrobnosti, zahteve brez zapisov in širino 390 px (dopolnitev R01–R12; obstoječe razvojne teste D01–D04 pusti nespremenjene).
- [ ] [T006] Zaženi `npm run check` in z dejanskimi rezultati posodobi tabelo izvedbe ter dokaze za R01–R12 v `docs/agent/P03/spec.md`; posebej označi vsak neizveden ali neuspešen test, ne spreminjaj skupnih testov ali infrastrukture.
