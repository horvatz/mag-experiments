# Pilot P07: Specifikacija

## Problem in kontekst
Folio aplikacija omogoča upravljanje opravil v projektnem okolju. Dodana funkcionalnost "Priljubljena opravila" omogoča uporabnikom izbire ključnih opravil in njihov filter v različnih pogledih preglednice in tabele.

## Izvedena sprememba

### Datoteke obdelanih v P07

- src/useFavorites.ts - nov hook za upravljanje priljubljenih opravil
- src/TaskBoard.tsx - dodane kontrole in logika za priljubljena opravila

### Uporaba hooka v TaskBoard

- useFavorites - vrnje favorites, store, removeProject
- Priljubljeni opravili filtrirani in prikazani v obeh pogledih
- Checkbox "Prikaži le priljubljena" s prilagoditvijo stanja
- Gumb "Odstrani priljubljene tega projekta"
- State status z aria-label="Število priljubljenih"

### UI prilagoditve

- Heart icon z aria-pressed za vsako opravilo
- Checkbox z aria-label "Prikaži le priljubljena"
- Odstranitev priljubljenih (gumb le v tabli)
- Prilagoditev vrstnega reda za RTL
- Izid: test D01: PR 4 ✅ , D02: PR 4 ⏳



## Implementacija

### Slika 1: Ustvarjanje useFavorites hooka

- isFavorite(id) - preverje ali je opravilo priljubljeno
- toggleFavorite(id) - preklopi stanje priljubljeno/nepriprazno
- store(list) - shrani v localStorage
- clearProject(projectId) - izbriše priljubljenja opravil določenega projekta
- getFilteredTasks(tasks) - vrne le priljubljena opravila

### Slika 2: Dodavanje kontrole v TaskBoard

- Checkbox "Prikaži le priljubljena" - status=checkbox, aria-label="Prikaži le priljubljena"
- Za vsako opravilo je dodan gumb "Priljubljeno opravilo {id}" z aria-pressed
- Štejec "Priljubljeno: X od M." z role=status in aria-label

### Slika 3: Logika filtra

- Če je checkbox za črpanje "Prikaži le priljubljena":
  - Prikaz le opravil z isFavorite=true
  - Gumb "Odstrani priljubljene tega projekta" je omogočen
- Če ni priljubljenih opravil:
  - Prikajo se sporočilo "Ni priljubljenih opravil."
  - Gumb "Odstrani priljubljene tega projekta" je onemogočen

## Testiranje

### Testi v test/agent/P07.spec.ts

- D01: neodvisno iskanje priljubljenih opravil
- D02: filter in odstranjevanje priljubljenih opravil
- D03: shramba in osvežitev
- D04: enotna logika za preglednico in tabelo brez writes do API
- D05: odpravljanje shrambe

### Testni rezultati

- D01: PR 4 ✅
- D02: PR 4 ⏳
- D03: PR 4 ⏳
- D04: PR 4 ✅
- D05: PR 4 ⏳

## Omejitve

- Testi D02, D03, D05 še niso popolnoma končani
- D05: test za odstranitev priljubljenih opravil

