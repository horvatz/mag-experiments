# P04 Tasks - Stable Sort with Dual Keys

**Datum:** 1. novembra 2026
**Projekat:** Folio vmesnik (Mag Admin Console)

Ta dokument predstavlja implementacijski seznam nalog za funkcionalnost razvrščanja opravil z dvema ključema. Naloge so organizirane po fazah in odvisnosti.

## Priprava

### T001 - Ustvari osnovno strukturo za sortiranje
- `src/utils/sorting/index.ts` - Ustvari glavno datoteko za sortiranje
- `src/utils/sorting/types.ts` - Ustveri tipe za sort konfiguracijo
- Prednost: T002, T003
- Test: `tests/agent/P04/sort.spec.ts` (unit tests)

### T002 - Ustvari pomožno naloge
- `src/utils/strings/normalize.ts` - Unix normalization (NFD, odstranite poudarja, male črke)
- `src/utils/strings/parseDate.ts` - Datum parsing (YYYY-MM-DD)
- `src/utils/sorting/comparators.ts` - Primerjalne funkcije za vsako polje
- Prednost: T001, T004
- Test: `tests/agent/P04/sort.spec.ts` (pomožne funkcije)

### T003 - Implementiraj sortiralski algoritem
- `src/utils/sorting/stableSort.ts` - Stabilni sort algoritem s stabilnostjo
- Podpira: R01 (default), R02 (normalizacija), R03 (prednostni vrstni red), R04 (smer), R05 (sekundarni ključ), R06 (stabilnost)
- Prednost: T004, T006
- Test: `tests/agent/P04/sort.spec.ts` (algoritem)

### T004 - Ustvari sortiralski hook
- `src/hooks/useTaskSort.ts` - Hooks za sort stanje in logiko
- Obvladuje: primarni ključ, smer, sekundarni ključ, smer
- Uporab: `sortTasks(data)` funkcija
- Test: `tests/agent/P04/sort.spec.ts` (hook test)

## Uporabniki

### T005 - Ustvari SortControls komponento
- `src/components/SortControls/SortControls.tsx` - Spadajoče izbrane za ključ/smer
- Izhodni vrstni red gumb (reset na default)
- Obvezno stanje: primaryKey, primaryDirection, secondaryKey, secondaryDirection
- Prednost: T007
- Test: `tests/agent/P04/page.spec.ts` (UI komponente)

### T006 - Implementiraj sort filtrirno pas
- `src/components/SortFilter/SortFilter.tsx` - Vizualna prikaz aktivnih nastavitev
- Prikaže: aktivni ključ + smer + sekundarni (če se uporabi)
- Test: `tests/agent/P04/page.spec.ts` (filtrirna pas)

### T007 - Integracija v FolioView
- `src/components/FolioView/FolioView.tsx` - Extend obstoječa komponenta
- Prejmi: `useTaskSort()` hook
- Prikaže: sortirana opravila
- Prejme: prop `tasks` (obstojen)
- Ohrani: obstoječe `aria-label="Pregled stanj opravil"`, `data-task-id`
- Prednost: T008
- Test: `tests/agent/P04/page.spec.ts` (celotna integracija)

### T008 - Seznam/Pregledni prikaz
- `src/components/TaskList/TaskList.tsx` - Extend obstojn seznam komponenta
- Prikaže: sortirana opravila
- Prejme: prop `tasks` (obstojen)
- Test: `tests/agent/P04/page.spec.ts` (seznam)

### T009 - Pregledni prikaz
- `src/components/Table/Table.tsx` - Extend obstojen tabelo komponenta
- Uporabi: sortirane opravila
- Test: `tests/agent/P04/page.spec.ts` (tabela)

### T010 - Preklopi pogled
- `src/components/FolioView/FolioView.tsx` - Predloge ToggleView
- Stanje: ni resetiranja sortiranega stanja
- Test: `tests/agent/P04/page.spec.ts` (toggle)

## Poliranje

### T011 - Reset gumb
- `src/components/SortControls/SortControls.tsx` - Reset gumb logika
- Reset: [original, asc, none, asc]
- Uporabi: `resetSort()` funkcija
- Test: `tests/agent/P04/page.spec.ts` (reset test)

### T012 - Prizori praznega stanja
- `src/components/FolioView/FolioView.tsx` - Prazni stanje
- 0 opravil: prikaz praznih stanja (brez napake)
- 1 opravilo: normalno delovanje z vsemi nastavitvami
- Test: `tests/agent/P04/page.spec.ts` (empty/single)

### T013 - Unicode normalizacija
- `src/utils/strings/normalize.ts` - NFD normalizacija
- Test z karakterji: č, š, ž, ć, đ, štedilnik
- Test: `tests/agent/P04/sort.spec.ts` (Unicode test)

### T014 - Datumi YYYY-MM-DD
- `src/utils/strings/parseDate.ts` - Datumi validacija
- Test z: veljavni in invalidni datumi
- Test: `tests/agent/P04/sort.spec.ts` (datum test)

### T015 - Projekta reset
- `src/hooks/useTaskSort.ts` - Projekti reset na default
- Preveri: nov projekt resetuje vse
- Test: `tests/agent/P04/page.spec.ts` (projekti reset test)

## Skupni zahtevi (baseline)

### T016 - Baseline testi
- `tests/baseline.spec.ts` - Preverite da se spremembe ne dotaknejo obstoječih funkcionalnosti
- Pokrije: osnovni prehod med projekti, osnovni pregled
- Test: `npm test -- tests/baseline.spec.ts`

### T017 - Navodila za razširitev
- `docs/agent/P04/README.md` - Uvod v koncept
- `docs/agent/P04/usage.md` - Navodila za uporabo
- Test: dokumentacija obstoji

## Odvisnosti

| Naloge | Dependancy | Prednost |
|--------|------------|----------|
| T001 | None | High |
| T002 | T001 | High |
| T003 | T002 | High |
| T004 | T003 | High |
| T005 | T004 | High |
| T006 | T005 | Medium |
| T007 | T006 | High |
| T008 | T007 | Medium |
| T011 | T005 | High |
| T012 | T007, T011 | Medium |
| T013 | T002 | Medium |
| T014 | T002 | Medium |
| T015 | T004 | Medium |
| T016 | None | Low |
| T017 | T016 | Low |

## Končno preverjanje

Po vseh nalogah je treba:
- `npm test` - Vse preizkuse preverite
- `npm run check` - Linting, tip-checking
- `npm run build` - Gradite aplikacijo

## Revizija

Revizija specifikacije: `docs/agent/P04/spec.md`
Revizija načrta: `docs/agent/P04/plan.md`
Revizija Constitution: `.specify/memory/constitution.md`

