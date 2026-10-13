# P05: Straničenje in filter stanja
## Specifikacija za pilot P05, postopek C

**Datum:** 2026-10-09
**Design:** [Folio - potrjeni dizajn](docs/dizajn.md)
**Requirements:** task/instructions.md (R01-R12)
**Constitution:** .specify/memory/constitution.md

---

## Problem in kontekst

Uporabnikov cilj je upravljati opravila z velikostmi strani in filtri stanj v aplikaciji Folio. Začetno delovanje prikazuje vsa opravila brez straničenja in filtra. Dopolnjevanje vključuje zahtevno straničenje z velikostmi all/2/5/10, filtre (all/todo/in_progress/done) ter zanesljivo ohranjanje stanja ob preklopu pogleda, menjavi projekta in osvežitvi.

---

## Vhodi, dejanja in izidi

### Vhodna polja

- `size` - "all"/"2"/"5"/"10" (velikost strani)
- `filter` - "all"/"todo"/"in_progress"/"done" (filter za stanje opravila)
- `projectId` - identifikator trenutnega projekta

### Dovoljena dejanja

- Sprememba velikosti strani (prvi klik)
- Sprememba filtra (prvi klik)
- Pomikanje med stranmi: prva, prejsnja, naslednja, zadnja

### Standardna dejanja

- Uporaba zadetaljkovne stran details/table pogleda
- Odpiranje/zapiranje kartice posameznega opravila
- Menjava projekta
- Osvežitev

### Pričakovano stanje po uspehu

- Velikost in filter se prikažeta v kontrolu
- Straničenje natančno sledi navodilom R01-R12
- Status prikazuje "Stran X od Y, prikazano A-B od N"
- Gumbi za premik so pravilno omogočeni/onemogočeni na robovih

### Stanje po preklicu

- Noben preklic nima vpliva na straničenje (ob novem projektu/refresh)
- Vsa dejanja so enokratna

### Napake

- Neveljavni pridelek velikosti: uporabi se vsebina all
- Neveljavni pridelek filtra: uporabi se vsebina all
- Navaden obdelava napake: brez spremembe stanja in varno prikazovanje napake

---

## Zahteve in pravila

### R01: Privzeto stanje

| Pravilo | Privzeta velikost strani all in filter all; vsa opravila se prikažejo v prvotnem vrstnem redu. |
| --- | --- |
| Način preverjanja | Trenutni prikaz so vsa opravila, brez straničenja filtra. Kontrola velikosti strani pokaže "all", filter pokaže "all". |

### R02: Razdelitev na strani

| Pravilo | Velikosti 2, 5 in 10 razdelijo trenutno filtrirano polje na zaporedne, ne prekrivajoce se odseke. Zadnja stran je lahko krajsa; noben ID se ne izgubi ali podvoji. |
| --- | --- |
| Način preverjanja | len(prikazana) == min(size, filtered_count), vsak ID se pojavi natanko enkrat, vsota vseh strani = len(filtered). |

### R03: Navigacija med stranmi

| Pravilo | Prva stran, Prejsnja stran, Naslednja stran in Zadnja stran vodijo v ustrezno stran. Na robu je neveljavno dejanje onemogočeno in ne spremeni stanja. |
| --- | --- |
| Način preverjanja | page(1) -> stran 1; page(-1) na robu -> onemogeceno (disabled), stanje ostane; page(total) -> stran total; page(-1) -> stran prevzame veljaven ID. |

### R04: Ponastavitev velikosti strani

| Pravilo | Sprememba velikosti strani vedno vrne v prvo stran nove velikosti, tudi ce bi bila prejsnja stevilka se veljavna. all pomeni eno stran pri nepraznem rezultatu. |
| --- | --- |
| Način preverjanja | Po spremembi size -> stran = 1. Ce size="all" in filtered_count > 0: stran = 1. |

### R05: Delovanje filtra

| Pravilo | Filter all/todo/in_progress/done se uporabi pred straničenjem; njegova sprememba vrne v prvo stran. Ne vpliva na vrstni red ujemajočih se opravil. |
| --- | --- |
| Način preverjanja | Po spremembi filter -> stran = 1. Vrsten red enak kot v izvornem nizu. |

### R06: Preglednica in tabla

| Pravilo | Preglednica in tablakazeta iste ID-je trenutne strani. Tabla zdruzi le ta odsek v stolpce; ne straniči vsakega stolpca loce no. |
| --- | --- |
| Način preverjanja | table currentPage == listPage currentPage. Preklop pogleda ne spremeni ID-jev. |

### R07: Ohranjanje stanja

| Pravilo | Preklop pogleda ter odpiranje in zapiranje podrobnosti ohranijo stran, velikost in filter. |
| --- | --- |
| Način preverjanja | Po preklopu pogleda -> page == prevPage, size == prevSize, filter == prevFilter. |

### R08: Menjava projekta in osvežitev

| Pravilo | Menjava projekta in osvežitev ponastavita velikost na all, filter na all ter stran na prvo. Stanje se ne hrani v trajni shrambi ali URL-ju. |
| --- | --- |
| Način preverjanja | Sprehod projectId=X -> stran=1, velikost=all, filter=all. |

### R09: Format stanja

| Pravilo | Za neprazen rezultat status vsebuje "Stran X od Y". Prikazano A-B od N., kjer sta A/B indeksa z zacetkom 1 in N velikost filtriranega polja. |
| --- | --- |
| Način preverjanja | status.textContent == Stran ${page} od ${totalPages}, Prikazano ${start}-${end} od ${total}. |

### R10: Prazna stanja

| Pravilo | Za prazen projekt ali prazen rezultat filtra status vsebuje "Stran 0 od 0". Prikazano 0-0 od 0. in vsi stiri gumbi za premik so onemogoceni. Ob odstranitvi filtra je spet prva stran. |
| --- | --- |
| Način preverjanja | Ce total == 0: status="Stran 0 od 0", a="0-0 od 0", vsi gumbi disabled. Po uporabi filtra: stran -> 1. |

### R11: Pregled stanj

| Pravilo | Pregled stanj steje celoten nefiltrirani projekt; stevci stolpcev table stejeta prikazana opravila trenutne strani. Stevilo vseh opravil se zaradi straničenja ne spremeni. |
| --- | --- |
| Način preverjanja | overview.total == repo_count. Stolpni stevci = len(listPage). |

### R12: Varnost in konsistentnost

| Pravilo | Stranienje ne spreminja podatkov in ne posilja zapisov na API. Obstojee povezave, pravilni ID-ji, podrobnosti, nalaganje in prilagodljiv videz Folio ostanejo uporabni. |
| --- | --- |
| Način preverjanja | API pozivi -> GET samo za /api/. Podatki se ne spreminjajo. |

---

## Pogojnosti in obkljudki

### Obkljudki

- Stran se nanaša na page, velikost size, filtrirana polja filtered_count.
- Vse stranične strani stejejo od 1.
- Predikati za pravilnost: start = (page-1)*size+1, end = min(page*size, filtered_count), totalPages = ceil(filtered_count/size).
- Neveljavno dejanje pomeni, da gumb nima aria-disabled="false" in ni onclick obnašanja.

### Odprta vprašanja

- Kar koli na 390 pik: container max-width: 390px; overflow-x: auto.
- Tabla in preglednica: table scrollable = true, scroll behavior: smooth.
- data-task-id obvezno za vsako vrstico in kartico.
- aria-label="Pregled stanj opravil" na vsebini preglednice in table.

---

## Povezave na dokumente

- Skupna predloga za specifikacijo: task/specification-template.md
- Navodila P05: task/instructions.md
- Folio dizajn: docs/dizajn.md
- Konstitucija: .specify/memory/constitution.md
- Status P05: .specify/feature.json
