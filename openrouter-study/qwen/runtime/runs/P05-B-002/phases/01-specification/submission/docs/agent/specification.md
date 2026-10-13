# StraniČenje in filter stanja – specifikacija

## Problem in kontekst

Uporabnik pregleduje opravila projekta s preglednico ali tablo. Brez straniČenja so vidna vsa opravila. Z uporabo straniČenja in filtra stanja mora uporabnik lahko preverja del nabrega opravil na preverjen način, s tem ko filtrira po vseh opravilih ali po stanju (pripravljeno, v delu, KonČano) in obseg prikazanih opravil na strani prilagodi na 2, 5 ali 10 opravil.

## Vhodi, dejanja in izidi

### Podatkovna polja

- `pageSize` – vrednost: "all" | "2" | "5" | "10" (HTML select)
- `filter` – vrednost: "all" | "todo" | "in_progress" | "done" (HTML select)
- `page_num` – trenutna številka strani (številko se začne z 1)

### Dovoljena dejanja

- Sprememba velikosti strani (select)
- Sprememba filtra (select)
- Spremiki strani: Prva stran, Prejšnja stran, Naslednja stran, Zadnja stran

### Pogoji uporabe

- Podatki se berejo preko /api/projects/{id}/tasks
- Stran prvega odseka (page_num = 1)
- Prva stran je vedno namešana na stran 1 po spremembi velikosti strani ali filtra
- Filtriranje se upošteva pred straničenjem
- Prihaja vsaka stran se vrne na stran 1 velja za vse spremembe velikosti strani in filtra

### Pričakovano stanje po uspehu

- Prikaže se vsa opravila trenutne strani (po straničenju) in filtru
- Uporabnik lahko preveri in navigira
- Število strani se izračuna glede na število filtrovanih opravil

