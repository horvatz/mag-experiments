# Naloge P05: Straničenje in filter stanja

## Fazne naloge

### Nastavitev in infrastruktura

- [ ] T001: Ustani lokalni React stan za straničenje in filtriranje (usePagination hook) v src/hooks/
- [ ] T002: Ustani tipote v src/types.ts za PageState (page, pageSize, filter)

### Podlagne sestavinke

- [ ] T003: Ustani sestavine za izbiro velikosti strani v src/components/ (PageSizeSelect)
- [ ] T004: Ustani sestavine za izbiro filtra v src/components/ (StatusFilterSelect)
- [ ] T005: Ustani sestavine za navdajanje (PaginationButtons z FirstPrevNextLast gumbi)
- [ ] T006: Ustani sestavino za stanje straničenja (PageStatusBadge za aria-label="Stanje straničenja")

### Razširitev obstoječih vmesnikov

- [ ] T007: Pripravi TaskTableView kot podlago za straničenje v tabelarnem prikazu
- [ ] T008: Pripravi TaskBoardView kot podlago za straničenje v tabla prikazu
- [ ] T009: Ustani PaginationContainer sestavino (glavni vodja vseh sestavin projekta)
- [ ] T010: Ustani ProjectPaginationView (prenosni pogled s strani po projektu)

### Integracija

- [ ] T011: Ustani usePagination.hook in implementacijo stanja z uporabo React useLayoutEffect
- [ ] T012: Ustani useTasks hook za osvežitev podatkov na spremembo straničenja in filtra
- [ ] T013: Ustani TaskPaginationView in priključi TaskTableView/TaskBoardView
- [ ] T014: Priključi gume premika in izbire v ProjectView v App.tsx

### Preverjanja - skupni standardi

- [ ] T015: Prilagoditev standardnih testov (tests/baseline.spec.ts) za straničenje in filtriranje
- [ ] T016: Preverjanje obstoječih integracij (tests/api.spec.ts) - kompatibilnost s straničenjem

### Lastna preverjanja P05

- [ ] T017: Test R01 - Privzeto stanje (pageSize=all, filter=all)
- [ ] T018: Test R02 - Straničenje deli podatke na enake, neprekrivajoče se odseke
- [ ] T019: Test R03 - Prva, Prejšnja, Naslednja, Zadnja stran - robni primeri in onemogočeni gumbi
- [ ] T020: Test R04 - Sprememba pageSize vrne na prvo stran
- [ ] T021: Test R05 - Filter prim pred straničenjem in vrne na prvo stran
- [ ] T022: Test R06 - Preglednica in tabla kažeta iste ID-je v trenutni strani
- [ ] T023: Test R07 - Preklop pogleda ohrani page, pageSize, filter
- [ ] T024: Test R08 - Menjava projekta ponastavi stanje na privzete vrednosti
- [ ] T025: Test R09 - aria-label="Stanje straničenja" vsebuje pravilno besedilo
- [ ] T026: Test R10 - Prazen rezultat ali projekta - "Stran 0 od 0", "0-0 od 0"
- [ ] T027: Test R11 - Pregled stanj šteje ceoten nefiltriran projekt; stolpci štejeta trenutno
- [ ] T028: Test R12 - Straničenje ne pošilja zahtev na API

### Dokončanje in poliranje

- [ ] T029: Preveri doslednost z 390px širino (notranje skrolanje, brez raztezanja strani)
- [ ] T030: Preveri ohranitve med preklopom pogledov v App.tsx
- [ ] T031: Optimizacija renderov in izboljšanje dostopnosti (aria-pressed, role=group)
- [ ] T032: Preverjanje naslovov in opomb pogledov (Opravila, Pripravljeno, V delu, Končano)

