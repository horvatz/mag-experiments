# Verifikacijski nacrt - Stanje pogleda v povezavi in zgodovina

## Nacrtovani pogojis in se neizvedena preverjanja

### R01: Zacetno stanje brez filterjev
  - Pogoj: q="", status="all", order="original" privzeto
  - Implementacija: navigation.ts - useRoute() z privzetimi vrednostmi
  - Testi: baseline test

### R02: Normalizacija iskalne frquze
  - Pogoj: trim, NFD, odstranjevanje diarez, male crke
  - Implementacija: novo normalizeQuery() utility
  - Testi: tests/agent/R02-normalization.spec.ts

### R03: Filter q in status po IN, order z izenačenjem
  - Pogoj: status filter, order primerjava
  - Implementacija: useResource.ts - filtriranje
  - Testi: tests/agent/R03-filtering.spec.ts

### R04: Neznani parametri
  - Pogoj: neznani status/order -> privzeto
  - Implementacija: navigation.ts
  - Testi: tests/agent/R04-unknown-params.spec.ts
### R05: Kontrolne spremembe
  - Pogoj: draft state, zgodovinske zapise
  - Implementacija: useResource.ts - draftState, pushToHistory
  - Testi: tests/agent/R05-draft-history.spec.ts

### R06: Potrditev
  - Pogoj: q obreze, prazni param. odstranijo
  - Implementacija: applyView() funkcija
  - Testi: tests/agent/R06-apply-view.spec.ts

### R07: Navigacija
  - Pogoj: syncExternalStore, hashchange
  - Implementacija: navigation.ts
  - Testi: tests/agent/R07-navigation.spec.ts

### R08: Toggle pogled
  - Pogoj: view=board ohranja filtre
  - Implementacija: useResource.ts
  - Testi: tests/agent/R08-view-toggle.spec.ts

### R09: Podrobnosti
  - Pogoj: taskId navigacija
  - Implementacija: TaskDetails.tsx
  - Testi: tests/agent/R09-details.spec.ts

### R10: Novi projekt
  - Pogoj: novi projekt, q="", all, original
  - Implementacija: navigation.ts
  - Testi: tests/agent/R10-project-switch.spec.ts

### R11: Ponastavi
  - Pogoj: vsi filterji, draft, zgodovina
  - Implementacija: resetView() funkcija
  - Testi: tests/agent/R11-reset.spec.ts

### R12: Brez zapisovanja
  - Pogoj: samo GET za podatke
  - Implementacija: api.ts, useResource.ts
  - Testi: tests/agent/R12-isolation.spec.ts

## Status
| Zahteva | Status |
|---------|--------|
| R01 | 🟡 |
| R02 | 🔴 |
| R03 | 🔴 |
| R04 | 🔴 |
| R05 | 🔴 |
| R06 | 🔴 |
| R07 | 🟡 |
| R08 | 🔴 |
| R09 | 🔴 |
| R10 | 🔴 |
| R11 | 🔴 |
| R12 | 🟡 |

## Omejitve okolja
- Shramba: Noben zapis v localStorage
- API: Samo GET za odcitavanje podatkov
- Chromium: Lokalne ws povezave, brez interneta
