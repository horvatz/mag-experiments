# Verification: Iskanje in sestavljeni filtri

## Status preverjanj

### R01 - Prazni vnos in filtri prikazujejo vsa opravila
- Status: Načrtovano
- Opis: Ob nalaganju so iskalni vnos in filtri prazni/na vse; prikazana vsa opravila trenutnega projekta v izvornem vrstnem redu

### R02 - Iskanje z Unicode NFD normalizacijo
- Status: Načrtovano  
- Opis: Iskanje pregleduje združene id, title, description, assignee; NFD -> odstrani kombinacijska znamenja U+0300-U+036F -> male črke

### R03 - Iskalni vnos razdeli po belinah, dobesedno ujemanje
- Status: Načrtovano
- Opis: Vse besede iz vnosa so dobesedni podnisi združenih polj; vrstni red ni pomemben; pražen vnos ne omejuje

### R04 - Filtriranje z logičnim IN
- Status: Načrtovano
- Opis: Stanje (all/todo/in_progress/done) in assignee (all/točno ime) delujeta skupaj; oba morata biti izpolnjena; status vrednosti exaktne

### R05 - Izbirnik oseb vsebuje all in vsa imena iz projekta
- Status: Načrtovano
- Opis: Preklop projekta ponastavi osebe; imena prikazana natanko enkrat tudi če so skrita zaradi pogojev

### R06 - Tabla in tabla kažeta iste rezultate, ohranijo filtre
- Status: Načrtovano
- Opis: Stolpci table vsebujejo samo opravila svojega stanja; preklop pogleda ohrani filtre

### R07 - Menjava projekta ponastavi iskanje in filtre
- Status: Načrtovano
- Opis: Filtri se nikoli ne uporabijo na podatkih drugega projekta

### R08 - Osvežitev začne z privzetimi filtri
- Status: Načrtovano
- Opis: Filtri se ne shranjujejo v URL ali shrambo

### R09 - Število rezultatov "Prikazano: N od M"
- Status: Načrtovano  
- Opis: N = prikazana, M = vse v trenutnem projektu; števec stolpcev sešteje prikazane

### R10 - Ni zadetkov za prazne rezultate
- Status: Načrtovano
- Opis: 0 od X za prazne rezultate; obe strani uporabni

### R11 - Počisti filtre v enem dejanju
- Status: Načrtovano
- Opis: Vrne vse tri kontrole na privzete; prikaže vsa opravila

### R12 - Obstoječa navigacija in bralne podrobnosti
- Status: Načrtovano
- Opis: Nobeno dejanje ne pošlje POST/PATCH/PUT/DELETE na /api/; ohranjeno na širini 390px

## Omejitve okolja
- Chromium samo z WebSocket endpoint iz task/browser.json
- Javni internet blokiran

