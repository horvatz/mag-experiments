# P05: Podnaloge za implementacijo (Txxx)

**Datum:** 2026-10-09
**Specifikacija:** [spec.md](spec.md)
**Načrt:** [plan.md](plan.md)

---

## Faza 1: Setup

- [ ] T001 Ustvari datoteko `src/pagination.ts` z izračuni straničenja
- [ ] T002 Ustvari datoteko `src/navigation.ts` z podporo za query params

## Faza 2: Foundation

- [ ] T003 Ustvari hook `src/usePagination.ts` za `page/size/filter`
- [ ] T004 Ustvari komponento `src/StatusBadge.tsx` za prikaz stanja

## Faza 3: User stories (R01–R12)

- [ ] T005 Ustvari `TaskPaginationControls.tsx` s štirimi gumbi
- [ ] T006 Posodobi `TaskList.tsx` z tabela z `data-task-id`
- [ ] T007 Integriraj pagination v `App.tsx`
- [ ] T008 Poveži R01: privzeto stanje (all, all, stran 1)
- [ ] T009 Poveži R02: razdelitev na strani po določenem `size`
- [ ] T010 Poveži R03: navigacijo med stranmi z `disabled` na robovih
- [ ] T011 Poveži R04: ponastavitev strani na 1 ob spremembi `size`
- [ ] T012 Poveži R05: delovanje filtra s ponastavitev strani na 1
- [ ] T013 Poveži R06: tabela in tabla kažejo iste ID-je
- [ ] T014 Poveži R07: ohranjanje stran/filter ob preklopu pogleda
- [ ] T015 Poveži R08: reset pri menjavi projekta/osvežitvi
- [ ] T016 Poveži R09: format stanja "Stran X od Y"
- [ ] T017 Poveži R10: prazna stanja "Stran 0 od 0"
- [ ] T018 Poveži R11: pregled stanj za celoten projekt
- [ ] T019 Poveži R12: varnost in API GET le

## Faza 4: Polish

- [ ] T020 Dodaj `tests/agent/pagination.spec.ts` za končne teste

---

## Izvedeno

Dokumentirano: 2026-10-09
