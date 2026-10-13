# Naloge za implementacijo P03

## Setup

- [ ] T1: Pripraviti mapo `src/components/` za nove komponente.
- [ ] T2: Ustvariti testno datoteko `tests/agent/P03.spec.ts` z osnovno strukturo.

## Foundational

- [ ] T3: Ustvariti `src/components/SearchFilter.tsx` z iskalnim inputom type=search in dvema select elementi za status in assignee.
- [ ] T4: Ustvariti `src/hooks/useSearchFilter.ts` custom hook z logiko filtriranja in Unicode NFD normalizacijo.
- [ ] T5: Implementirati funkcijo `filterTasks()` s logiko za iskanje (besede), status in assignee filter.

## User Stories

- [ ] T6: [R01] Ob nalaganju prikazati vsa opravila brez filtrov v izvornem vrstnem redu.
- [ ] T7: [R02] Implementirati Unicode NFD pretvorbo in odstranitev kombinacijskih znamenj za iskanje.
- [ ] T8: [R03] Razdeliti iskalni vnos na besede in preveriti dobesedne podnize združenih polj.
- [ ] T9: [R04] Implementirati logični IN za iskanje in filtre.
- [ ] T10: [R05] Naložiti vsebino osebam iz projekta v izbirnik (vključno z "all").
- [ ] T11: [R06] Zagotavljati, da tabela in tabla prikazujeta iste rezultate z ohranjenimi filtri.
- [ ] T12: [R07] Resetiranje iskanja in filtrov ob preklopu projekta.
- [ ] T13: [R08] Zagotavljati, da se filtri ne shranjujejo v URL.
- [ ] T14: [R09] Implementirati števec "Prikazano: N od M" v UI.
- [ ] T15: [R10] Prikazati sporočilo "Ni zadetkov." ob praznih rezultatih.
- [ ] T16: [R11] Ustvariti gumb za počistitev filtrov s prevzemi privzetih vrednosti.

## Polish

- [ ] T17: [R12] Preveriti ozko širino in bralne podrobnosti.
- [ ] T18: Ustvariti minimalni styling za filter kontrole v src/styles.css.
- [ ] T19: Testi proti baseline za regresijo.
- [ ] T20: Končni pregled in preverjanje vseh zahtev.
