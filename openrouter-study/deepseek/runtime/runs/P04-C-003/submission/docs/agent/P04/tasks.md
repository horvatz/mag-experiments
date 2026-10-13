# P04 — Naloge izvedbe

Specifikacija: `docs/agent/P04/spec.md`; načrt: `docs/agent/P04/plan.md`.
Vsaka naloga je majhna in zaporedna; potrditev opravi naslednji korak.

## Faza 1: Temelj

- [x] T001 V `src/sorting.ts` dodaj tipe `SortKey`, `SecondaryKey`, `SortDirection`, `SortSettings`, konstanto `DEFAULT_SORT` (original/asc/none/asc) in `norm` (NFD, odstranitev U+0300–U+036F, male črke, primerjava po UTF-16).
- [x] T002 V `src/sorting.ts` dodaj `compareByKey` (title/assignee z `norm`; status todo < in_progress < done; dueDate kronološko) in `sortTasks`, ki ob izenačenosti vrne 0 in ohrani izvorni vrstni red; `original` kot primarni ključ vrne vhodno polje nespremenjeno ne glede na smer in sekundarni ključ (R01–R06, R11).

## Faza 2: Vmesnik

- [x] T003 V `src/SortControls.tsx` dodaj štiri označene selecte (Primarni ključ, Primarna smer, Sekundarni ključ, Sekundarna smer) in gumb Izvorni vrstni red, ki vrne `DEFAULT_SORT` (R01, R10).
- [x] T004 V `src/App.tsx` v `ProjectView` vodi stanje `useState(DEFAULT_SORT)`, vključi `SortControls` in uporabi `useMemo` projekcijo `sortedTasks`; preglednica uporabi `sortedTasks`, števci pa izvorne `tasks` (R04–R06, R11).
- [x] T005 V `src/TaskBoard.tsx` prejme razvrščeno polje in filtrira po statusu v nespremenjenem vrstnem redu stolpcev todo, in_progress, done (R07).
- [x] T006 V `src/styles.css` oblikuj kontrole z obstoječimi spremenljivkami Folio; pri širini 390 pik ohrani notranje drsenje in prepreči vodoravno prelivanje (R12).

## Faza 3: Preverjanje

- [x] T007 V `tests/agent/p04-sort.spec.ts` dodaj lastne Playwright teste z nadzorovanimi podatki: privzeti četverec in izvorni vrstni red (R01), `norm`/UTF-16 z Unicode in ločili (R02), status in datumi (R03), asc/desc le izbranega ključa (R04), neodvisna sekundarna smer (R05), stabilnost in original ob nastavljenem sekundarnem ključu (R06).
- [x] T008 V istem testu dodaj scenarije za tablo in relativni vrstni red stolpcev (R07), ohranitev nastavitev ob preklopu pogleda in podrobnostih (R08), ponastavitev ob menjavi projekta in osvežitvi ter odsotnost nastavitev v URL-ju (R09), gumb in prazni/enoopravilni projekt (R10), nespremenjena polja in samo bralne klice (R11) ter enkratne ID-je in podrobnosti ob enakih naslovih (R12).
- [x] T009 Poženi `npm run check` (slog, tipi, gradnja, skupni testi) in `npx playwright test --project=agent`; neuspelih testov ne označi kot uspešnih.
- [x] T010 V `docs/agent/P04/spec.md` izpolni preglednico sledljivosti z dejanskimi izidi in dokazi (ime testa, dnevnik) ter zapiši neizvedene dele in omejitve.

## Opombe

- Odvisnosti: T002 po T001, T004 po T003, T005 po T004, testi po T005/T006, T010 po T009.
- Nobena naloga ne spreminja strežnika, `shared/`, skupnih testov, odvisnosti ali nastavitev.
