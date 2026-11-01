# P03 – Naloge izvedbe

Vrstni red je odvisnostni: vsaka naloga predpostavlja prejšnje. Vsaka naloga
navaja datoteko; oznake zahtev so iz `docs/agent/P03/spec.md`.

## Faza 1: Priprava

- [x] T001 Preveri izhodišče: `npm run typecheck` in branje obstoječih pogledov v `src/App.tsx` ter `src/TaskBoard.tsx` (brez sprememb).

## Faza 2: Temelj

- [x] T002 Ustvari `src/filters.ts`: `normalize` (NFD, odstranjeni U+0300–U+036F, male črke), `splitWords`, `matchesQuery` (konjunkcija dobesednih podnizov), `filterTasks` (IN iskanja, stanja, osebe), `assigneeOptions` (`all` + različna neprazna imena) – R02, R03, R04, R05.

## Faza 3: Vmesnik

- [x] T003 V `src/App.tsx` dodaj lokalno stanje filtrov (iskalni niz, stanje, oseba), privzete vrednosti, ponastavitev ob menjavi projekta prek `key={project.id}` in gumb `Počisti filtre` – R01, R07, R08, R11.
- [x] T004 V `src/App.tsx` dodaj vrstico kontrol: `input type=search` (Išči opravila), `select` Filter stanja, `select` Filter odgovorne osebe ter `role=status` z `aria-label="Rezultati filtriranja"` in besedilom `Prikazano: N od M.` – R01, R04, R05, R09.
- [x] T005 V `src/App.tsx` poveži prikaz s filtriranim seznamom: povzetek stanj iz prikazanih opravil, prazni stanji `Ni zadetkov.` in `0 od 0`, ohranjeni `data-task-id` in obstoječa prazna stanja – R06, R09, R10, R12.
- [x] T006 V `src/TaskBoard.tsx` prejmi filtrirana opravila in števce stolpcev računaj iz prejetega seznama (stolpci ohranijo prazna besedila) – R06, R09, R10.
- [x] T007 V `src/styles.css` dodaj razrede za vrstico kontrol in prelom pri ozki širini, brez vodoravnega razširjanja strani – R12.

## Faza 4: Testi in dokazi

- [x] T008 Napiši lastne teste v `tests/agent/p03-filters.spec.ts` (projekt `agent`): privzeto stanje, normalizacija `č`/`c` in velikost črk, besede in ločila, kombinacije filtrov, možnosti oseb in menjava projekta, enaki ID-ji v obeh pogledih, osvežitev, števci, `Ni zadetkov.`, čiščenje filtrov, brez pisanja na `/api/` – R01–R12.
- [x] T009 Zaženi `npm run typecheck`, `npm run lint` in `npm run build`; popravi morebitne napake v `src/`.
- [x] T010 Zaženi regresijo (`npx playwright test tests/baseline.spec.ts tests/api.spec.ts`) in lastne teste (`npx playwright test --project=agent`); zabeleži imena in izide.
- [x] T011 Vnesi dokaze v tabelo Izvedba in sledljivost v `docs/agent/P03/spec.md`, označi neizvedene dele in omejitve; ne navajaj nepreverjenih izidov kot uspešnih.

## Faza 5: Zaključek

- [x] T012 Ponovi hitro preverjanje po popravkih (T009–T011) in zaključi kratko poročilo o spremembah, preverjanjih in omejitvah v `docs/agent/P03/`.

Opombe po izvedbi: T006 ni zahteval spremembe kode, ker `src/TaskBoard.tsx` stolpce in števce že izpelje iz prejetega seznama. Dokazi in izidi: `docs/agent/verification.md`.
