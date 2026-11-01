# P04: Stabilno razvršéanje z dvema ključema

**Datum:** 1. novembra 2026
**Projekt:** Folio vmesnik (Mag Admin Console)
**Verzija:** 1.0 (Pilot P04)

## Problem in kontekst

Folio vmesnik omogoča pregled opravil v obliki tabele ali table. Prilagodljivo razvrščanje po primarnem in sekundarnem ključu kljubuje odzivnosti, medtem ko ohranja stabilnost vrstnega reda in ohranja vsaj enkratno prikazovanje vseh identifikatorjev opravil.

Začetna aplikacija omogoča preproste filtri po stanju in rok, vendar ne podpira naprednega razvrščanja po več ključih. Ta funkcionalnost naj bi uporabnikom omogočila logičnejši pregled opravil ohranjanje vrstnega reda enakovrednih elementov.

## Vhodi, dejanja in izidi

### Podatkovna polja

| Polje | Vrsta | Opis |
| --- | --- | --- |
| id | nizek | Edinstven identifikator opravila |
| title | string | Naslov opravila |
| assignee | string | Imenovalna oseba (lahko "all") |
| status | string | Stanje: todo, in_progress, done |
| dueDate | datum (YYYY-MM-DD) | Rok opravila |
| originalIndex | število | Izvirni vrstni red v polju opravil |

### Dovoljena dejanja

- Sprememba primarnega ključa: Izbirno izmed original, title, assignee, status, dueDate
- Sprememba smeri primarnega ključa: asc/desc
- Sprememba sekundarnega ključa: Izbirno izmed none, title, assignee, status, dueDate  
- Sprememba smeri sekundarnega ključa: asc/desc
- Gumb Izvorni vrstni red: Ponastavi vse štiri nastavitve hkrati
- Pregled tabele/podrobnosti: Odpiranje in zapiranje ne vpliva na razvrščanje
- Prehod med projekti: Vrste se ponastavijo na privzeto [original, asc, none, asc]

### Pričakovano stanje po uspehu

- Vse vrstice vidne hkrati (ni izgube ID-jev)
- Razvrščeno po primarnem ključu, nato po sekundarnem ključu
- Za enake kombinacije ključev ohranjen izvirni vrstni red
- Vsi ID-ji prikazani natanko enkrat
- Odpiranje podrobnosti ne vpliva na razvrščanje

## Odprta vprašanja in omejitve

- Implementacija še ni preverjena s testi
- Datumi so mehana YYYY-MM-DD; testni primeri ne zahtevajo morebitnih datuma
- Unicode normalizacija z NFD za primarne ključe title/assignee
