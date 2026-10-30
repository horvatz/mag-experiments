# P07 — naloge izvedbe

Podlaga: `docs/agent/P07/spec.md` in `docs/agent/P07/plan.md`. Oznake `[ ]` pomenijo
nedokončano nalogo; naloge se izvajajo po vrstnem redu. Obseg ostaja znotraj `src/`,
`tests/agent/`, `docs/agent/`.

## Priprava

- [ ] T001 Preveri izhodišče in zabeleži začetno stanje: `npm run typecheck` in `npm test` (brez sprememb datotek).

## Temelj

- [ ] T002 Ustvari `src/favorites.ts`: `parseFavorites` (validacija P2), `serializeFavorites` (enkratni nizi, razvrščeni po UTF-16), `readFavorites`/`writeFavorites` z `try/catch` in naročnina na `storage` (pravi ključ, `null` prazni, brez povratnega zapisa) — R02, R03, R04, R11.
- [ ] T003 Ustvari `src/useFavorites.ts`: stanje `Set`, `toggle`, `removeForProject`, `storageError`, leno branje brez prepisa shrambe — R01, R08, R09, R11.

## Uporabniške zgodbe

- [ ] T004 Dodaj `FavoriteButton` v `src/components.tsx`: gumb `Priljubljeno opravilo <id>` z `aria-pressed`, ločen od povezave — R01.
- [ ] T005 V `src/App.tsx` vključi globalno stanje priljubljenih, filter `showOnly`, števec `Priljubljeno: X od M.` (`role=status`, `aria-label=Število priljubljenih`) in opozorilo shrambe (`role=alert`, vsebuje `shramba`) — R05, R08, R10, R11.
- [ ] T006 V `src/App.tsx` dopolni tabelo: gumb v ločeni celici, filtriranje v izvornem vrstnem redu, prazno stanje `Ni priljubljenih opravil.`, gumb `Odstrani priljubljene tega projekta` (onemogočen brez priljubljenih v projektu) — R01, R05, R06, R09.
- [ ] T007 V `src/TaskBoard.tsx` dodaj gumb zunaj povezave kartice, uporabi isti filter in števce stolpcev za vidna opravila — R01, R07, R10.
- [ ] T008 V `src/styles.css` dopolni sloge novih kontrol z obstoječimi gradniki; brez razširitve strani pri 390 pik — R12.

## Lastni testi

- [ ] T009 Ustvari `tests/agent/helpers.ts`: nadzorovani GET odgovori (različno število opravil, enaki naslovi, Unicode) in spremljanje zapisov na API — podpora R01–R12.
- [ ] T010 Ustvari `tests/agent/p07-favorites.spec.ts`: scenariji R01–R06 (preklop brez odpiranja podrobnosti, shramba in neveljavni zapisi, filter, prazno stanje).
- [ ] T011 V `tests/agent/p07-favorites.spec.ts` dodaj scenarije R07–R12 (skupno stanje pogledov, menjava projekta, števci, dogodki `storage`, izjema shrambe, brez zapisov na API, 390 pik).

## Preverjanje in sledljivost

- [ ] T012 Poženi `npm run typecheck`, `npm run lint` in `npm run build`; zabeleži izide.
- [ ] T013 Poženi `npx playwright test tests/agent/p07-favorites.spec.ts` in `npm test`; zabeleži izide skupnih regresijskih testov.
- [ ] T014 V `docs/agent/P07/spec.md` vpiši dejanske dokaze v tabelo sledljivosti R01–R12, neizvedene dele in omejitve (brez lažnih uspehov).
