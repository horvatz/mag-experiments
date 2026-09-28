# P03 — izvedbene naloge

## Setup

- [ ] [T001] V `tests/agent/P03.spec.ts` pripravi Playwright sprejemne scenarije za R01–R12 z nadzorovanimi GET podatki; pokrij Unicode in dobesedno večbesedno iskanje, kombinacije filtrov, oba pogleda, prazna stanja, ponastavitve, števce, navigacijo, zapisovalne zahteve in širino 390 px. Obstoječih testov in nastavitev ne spreminjaj.

## Foundational

- [ ] [T002] V `src/taskFilters.ts` implementiraj čiste funkcije za zahtevano NFD-normalizacijo, ujemanje vseh iskalnih besed, sestavljeno logiko statusa in natančnega assigneeja ter unikatne neprazne osebe iz vseh opravil projekta; ohrani vrstni red vhodnih opravil.

## User stories — iskanje in izbira filtrov (R01–R05, R07–R08, R11)

- [ ] [T003] V `src/App.tsx` dodaj lokalne kontrole z dogovorjenimi oznakami, privzete vrednosti in gumb za ponastavitev; sprememba projekta naj jih ponastavi, preklop pogleda naj jih ohrani, osvežitev pa naj začne brez shranjenih filtrov.

## User stories — skladni rezultati in prazna stanja (R06, R09–R10, R12)

- [ ] [T004] V `src/App.tsx` izpelji en filtriran seznam za preglednico in tablo, preračunaj povzetek stanj ter števec `Prikazano: N od M.`, loči prazen projekt od projekta brez zadetkov in ohrani navigacijo ter bralne podrobnosti.
- [ ] [T005] V `src/TaskBoard.tsx` prikaži samo prejete filtrirane naloge v stolpcih ustreznega stanja ter ohrani ID-je, obstoječa dostopna imena in števce prikazanih kartic.

## Polish

- [ ] [T006] V `src/styles.css` oblikuj kontrole in stanje `Ni zadetkov.` z obstoječimi Folio slogi; pri 390 px prepreči širjenje strani in ohrani notranje drsenje pogledov.
- [ ] [T007] Zaženi lastne Playwright scenarije ter obstoječe razvojne in izhodiščne teste, nato `npm run check`; v `docs/agent/P03/spec.md` poveži R01–R12 z dejanskimi datotekami, scenariji, rezultati in dokazili ter zabeleži neuspešne ali neizvedene preglede.
