# P05: Podnaloge za implementacijo

**Datum:** 2026-10-09
**Specifikacija:** [spec.md](spec.md)
**Načrt:** [plan.md](plan.md)

---

## Podnaloge

### 1. src/pagination.ts

**Namen:** Logika za izračun straničene in veljavnost navigacije.

- Implementaj `getPaginationStats(filteredCount: number, pageSize: number, currentPage: number): { total: number; totalPages: number; start: number; end: number; }`
- Implementaj `isValidPageBoundary(targetPage: number, totalPages: number): boolean`
- Implementaj `getLastPage(validatedPageSize: number, filteredCount: number): number`

**Test:** Manj kot `100` vrstic, le izračuni.

### 2. src/usePagination.ts

**Namen:** React zaResource za `page`, `size`, `filter`.

- Hook `usePagination(pageSize: number | \"all\", filter: number | \"all\")`
- Internal state: `page`, `filteredData`, `totalPages`
- Effect: `useResource(\"/api/tasks\")`
- Reset `page=1` ob spremembi `pageSize` ali `filter`

**Test:** Manualno testiranje v krogu.

### 3. src/StatusBadge.tsx

**Namen:** Prikaz stanja straničenja z aria-label.

- `aria-label=\"Stanje straničenja\"`
- Tekst: `\"Stran X od Y\"`, `\"Prikazano A–B od N\"`
- `disabled` na robu

**Test:** Manualno v preglednici.

### 4. src/TaskPaginationControls.tsx

**Namen:** Gumbi za navigacijo med stranmi.

- Gumbi: `Prva stran`, `Prejšnja stran`, `Naslednja stran`, `Zadnja stran`
- `disabled` ko neveljavno
- Event handler `handlePageChange(page)`

**Test:** Manualno v preglednici.

### 5. src/TaskList.tsx

**Namen:** Tabela z `data-task-id` in `aria-label`.

- Stolpci: naslov, stanje, rok, oseba
- `data-task-id` za vsako vrstico
- `aria-label=\"Pregled stanj opravil\"`

**Test:** `npm test`

### 6. src/App.tsx

**Namen:** Integracija v glavno komponento.

- Uporabi `usePagination` hook
- Prikazuje `StatusBadge` in `TaskPaginationControls`
- Preklop `table/board`
- Menjava projekta → reset

**Test:** `npm test`

### 7. tests/agent/pagination.spec.ts

**Namen:** Testi za vse zahteve R01–R12.

- Test `R01` privzeto stanje
- Test `R02` na strane
- Test `R03` na navigacijo
- Test `R04` na spremembo `size`
- Test `R05` na spremembo `filter`
- Test `R06` na table/board
- Test `R07` na ohranjanje stanja
- Test `R08` na spremembo projekta
- Test `R09` na format stanja
- Test `R10` na prazna stanja
- Test `R11` na pregled stanj
- Test `R12` na varnost

**Test:** `npm test`

---

## Zapisano

Ustvarjeno: 2026-10-09
