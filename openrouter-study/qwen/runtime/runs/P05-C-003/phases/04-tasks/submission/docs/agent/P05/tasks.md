# Naloge za P05: Straničenje i filter stanja

Ta seznam predstavlja celotno implementacijsko pot za zahteve R01–R12. Naloge so razvrščene po fazah z odvisnostmi.

## Faza 1: Nastavitev (osnova)

- [ ] T001 Dodaj usePaginatedTasks custom hook v src/usePaginatedTasks.ts
  - Pregledno stanje za stran, velikost strani in filter
  - Filter vseh opravil pred straničenjem
  - Priznanje stranih, odsekov in indeksov za prikaz

- [ ] T002 Dodaj PaginationControls komponento v src/PaginationControls.tsx
  - Dropdown za velikost strani: all/2/5/10
  - Dropdown za filter: all/todo/in_progress/done
  - Navigacijski gumbi: Prva stran, Prejšnja, Naslednja, Zadnja
  - Element role="status" z aria-label="Stanje straničenja"
  - Obdelovalci spremembe: onPageChange, onFilterChange, onPageSizeChange

- [ ] T003 Posodobi App.tsx za integracijo pagination stanja
  - Dodaj state initialization za page, pageSize, filter
  - Klic se usePaginatedTasks hook namesto useResource
  - Render PaginatedTasks namesto tasks
  - Render PaginationControls pod pogledom opravil
  - Reset stanja na stran 1 ob spremembi projekta

## Faza 2: UI spremembe (osnovne funkcije)

- [ ] T004 Posodobi preglednico (table view) App.tsx za straničenje
  - Prikaza current page tasks namesto vseh
  - Ohrani data-task-id, stolpce naslov, stanje, oseba, rok
  - Podrobnosti (ArrowUpRight) vodijo do TaskDetails
  - Pregledni footer z ukazom vseh opravil projekta

- [ ] T005 Posodobi tablo (board view) TaskBoard.tsx za straničenje
  - Filtrar opravila znotraj stolpcev po trenutni strani
  - Izračunaj taskCount namesto vseh opravil v stolpcu
  - Data-task-id ostaja enak za ista opravila
  - Karte pogledajo current page tasks namesto vsega projekta

## Faza 3: Pregled stanj (status bar)

- [ ] T006 Dodaj status bar za straničenje z aria-label=Stanje straničenja
  - Pokaže "Stran X od Y" kjer je X trenutna stran, Y skupno stranih
  - Na praznih stanjih pokaže "Stran 0 od 0"
  - Pripeta pod ali nad preglednico/tablo

- [ ] T007 Posodobi pregled delovanja projekt (counts todo/in_progress/done)
  - Prepovej celoten nefiltriran projek
  - Ne spremeni zaradi straničenja ali filtriranja
  - Pokaže "Pripravljeno: X", "V delu: Y", "Končano: Z"

## Faza 4: Robni primeri in stanja

- [ ] T008 Obdelaj prazen projekt (null tasks)
  - Pokaže state-message brez opravil
  - Navigacijski gumbi naembraju onemogočeni
  - Status "Stran 0 od 0"
  - Indexi "0–0 od 0."

- [ ] T009 Obdelaj prazni filter rezultat (0 opravil po filterju)
  - Svojni gumbi onemogočeni
  - Status na "Stran 0 od 0"
  - Indexi "0–0 od 0."
  - Ob izklopu filtro vrne prvotno stanje strani

- [ ] T010 Obdelaj robne strani (prevište ali precej majhne strani)
  - Zadnja stran: le zadnji odsek prikaza
  - Neaktivni gumbi na robih (None Prev, Next)
  - Zadnja stran: Next onemogočena
  - Prva stran: Prev onemogočena

## Faza 5: Uradni zahtevi in pravila

- [ ] T011 Test R01: Default stanje all/all
  - Vključitev aplikacije: stran 1, velikost all, filter all
  - Vidna vsa opravila brez straničenja
  - Status prikaz: "Stran 1 od Y" (ko ima opravila)

- [ ] T012 Test R02: Veličine stranice 2, 5, 10
  - Vsaka veličina enakomerno deli filtrirano polje
  - Noben ID ne izgubljen ali podvojen
  - Zadnja stran lahko krajša

- [ ] T013 Test R03: Navigacijski gumbi
  - Prva stran: vrne na stran 1
  - Prejšnja: -1 stran (onemogočena na robu)
  - Naslednja: +1 stran (onemogočena na robu)
  - Zadnja stran: na zadnjo stran

- [ ] T014 Test R04: Reset ob spremembi veličine
  - Sprememba veličine: stranic na 1
  - Če bi prejšnja stran še veljala: reset
  - Navesti: all = stran 1 pri nepraznem rezultatu

- [ ] T015 Test R05: Filter aplikira pred straničenjem
  - Sprememba filtera: vrni na stran 1
  - Redosled znotraj filtroa: ohranjen
  - Filtrirane opravila prikaža pred straničenjem

- [ ] T016 Test R06: Preglednica in tabla prikazujeta iste ID-je
  - Preklop pogled: stran, velikost, filter ostane
  - Tabla združi opravila trenutne strani v stolpce
  - Data-task-id enak za oba pogleda

- [ ] T017 Test R07: Preklop pogleda ohrani stanje
  - Ob odpiranju/zapiranju TaskDetails: stran ohranjena
  - Veličina in filter: ne spremeni
  - API pozivi: ne praznijo se

- [ ] T018 Test R08: Promena projekta resetira vse
  - Novi projekt: stran = 1, page size = all, filter = all
  - Stanje se ne shrani v trajno shrambo
  - Stanje se ne shrani v URL

- [ ] T019 Test R09: Status za nefiltrirane rezultate
  - Stran X od Y (trenutna od skupno)
  - Prikazano A–B od N. (od indeks do indeks do celotno)
  - 1-based indeksi

- [ ] T020 Test R10: Prazni projekat/veznik
  - Projekat brez opravil: status "Stran 0 od 0"
  - Filter brez ujemajočih: status "Stran 0 od 0"
  - Svojni gumbi onemogočeni
  - 0–0 od 0. v indeksih

- [ ] T021 Test R11: Pregled stanj šteje nefiltriran projek
  - Ukaz vseh opravil: enak ne glede na straničenje/filter
  - Kolonski brojači: aktualni prikaz na strani
  - Redosled znotraj pregleda: vztrajen

- [ ] T022 Test R12: Straničenje ne spremeni podatkov
  - Podatki nedotaknjeni
  - Povezanost ostala: pravilno data-task-id
  - Podrobnosti, učitavanje, dizajn: ostali funkcionalnost

## Lastni testi (tests/agent/P05)

- [ ] T023 Dodaj pagination.spec.ts za osnovne teste
  - Test no tasks: empty state
  - Test 1 task: single task
  - Test paginate tasks: multiple pages
  - Test filter apply: filter tasks only

- [ ] T024 Dodaj pagination.spec.ts za robne primere
  - Test page boundary: last page buttons disabled
  - Test size change reset: always page 1
  - Test filter reset: always page 1

- [ ] T025 Dodaj pagination.spec.ts za UI kontrol
  - Test navigation: all buttons work
  - Test aria-labels: role status present
  - Test data-task-id: consistent across views

- [ ] T026 Dodaj pagination.spec.ts za integracije
  - Test project switch: reset state
  - Test view switch: state preserved
  - Test details toggle: state unchanged

## Dokumentacija

- [ ] T027 Dodaj changelog/notes v docs/agent/P05/changelog.md
  - Podatki o forzi
  - Povezave na zahteve
  - Pokritost zahtev: R01-R12
  - Meje in nepreverjeni primeri

- [ ] T028 Uredi docs/dizajn.md za straničenje/filter
  - Dodaj vizualno specifikacijo za pagination
  - Dodaj gumb oblikovanje
  - Dodaj state bar styling

## Konvergencija

- [ ] T029 Preveri pokritost R01-R12 v spec.md
  - vsaka zahteva: pogoji, koda, testi, izid
  - nepreverjeni deli: navajeni v odprta vprašanja

- [ ] T030 Verifikacija konvergence
  - Povezava spec <-> plan <-> tests
  - Pokrita zahteva: vsi R v spec.md
  - Testi: vsi R testirani

