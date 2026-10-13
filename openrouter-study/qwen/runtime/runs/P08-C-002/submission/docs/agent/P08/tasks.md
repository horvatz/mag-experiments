# P08: Naloge implementacije

**Datum:** 2026-10-13  
**Vezava:** spec.md, plan.md

---
## 1. Setup (T001-T004)

- [ ] **T001** Ustvari `useDateLogic.ts` za datumski izračun kategorij opravil glede na referenčni datum
- [ ] **T002** Ustvari `calendarHeader.tsx` z `input type=date` (Referenčni datum) in `select` (Pogled rokov)
- [ ] **T003** Dodaj `role="alert"` ko je datum prazen z besedilom "Vnesi veljaven referenčni datum"
- [ ] **T004** Ustvari `taskCounters.tsx` z petimi števciki (Število rokov Zapadlo, Danes, Naslednjih 7 dni, Pozneje, Končano)
- [ ] **T005** Integriraj date picker in filter dropdown v App.tsx (R01, R07, R08)
- [ ] **T006** Ustvari custom hook useDeadlineView za upravljanje stanjem in filtriranjem
- [ ] **T007** Implementiraj referenčni datum preracun glede na YYYY-MM-DD format (R05)
- [ ] **T008** Dodaj "Ni opravil v izbrani skupini" opozorilo za prazne rezultate (R11)
- [ ] **T009** Implementiraj prikaz v preglednici in tabli z istim nastavitvami (R09)

## 2. Tests

- [ ] **T010** Testiranim R01: Preverjanje default statusa ob zagonu
- [ ] **T011** Testiranim R03-R04: Datumske kategorizacijske logike z razlicnimi testi
- [ ] **T012** Testiranim R06: Preverjanje petih stevcev (overdue/today/week/later/done)
- [ ] **T013** Testiranim R08-R09: Preverjanje UI sprememb in ohranitve stanja

## 3. Verification

- [ ] **T014** Preverjanje skladnosti s potrdjenim Folio dizajnom

