# Specifikacija: Straničenje in filter stanja

## Problem in kontekst

Uporabnik gleda opravila projekta v preglednici. Trenutno so vsa opravila prikazana enkrat.
Razširimo zmožnosti: straničenje (pagination) in filter po stanju. To omogoča pregled
večjih količin naloga brez dolge liste.

## Vhodi, dejanja in izidi

### Prikazno stanje
Koordinata `{size: "all"|"2"|"5"|"10", filter: "all"|"todo"|"in_progress"|"done", page: number}`

### Dejanja
- Sprememba Velikosti strani (select): all/2/5/10
- Sprememba Filter strani (select dropdown): all/todo/in_progress/done
- Klik na gumbe premika: Prva stran, Prejšnja stran, Naslednja stran, Zadnja stran

### Pričakovano stanje
Stran, filter in velikost se uporabniško nadzorirajo. Podatki pridobimo iz API `/api/projects/{id}/tasks`.
Stalni API ne more zahtevati straničenja ali filtra - vsebina se spremeni v preglednico.

## Zaprte zahteve in pravila

| Zahteva | Pravilo oziroma sprejemni pogoj | Način preverjanja |
| --- | --- | --- |
| R01 | Privzeto `size=all` in `filter=all`, prikazana so vsa opravila v izvornem vrstnem redu. | Po nalaganju pred delovanjem uporabnika, vse opravila na prvi strani. |
| R02 | `size=2/5/10` razdelijo filtrirano polje na neprekrivajoče se sekvence. Zadnja stran lahko krajša. | Izračun: `Math.ceil(filteredCount / size)`. |
| R03 | Gumbi vodijo na ustrezno stran. Na robu je neveljavno dejanje onemogočeno (disabled). | `page=1` in `page=last+1` disabled, ostale omogočene. |
| R04 | Sprememba velikosti vrne na prvo stran. `all` pomeni `page=1` pri nepraznem rezultatu. | URL/hash: `page=1` po spremembi `size`. |
| R05 | Filter se uporabi pred straničenjem. Sprememba filtra vrne na prvo stran. | `filteredTasks = tasks.filter(...)`. |
| R06 | Preglednica in tabla prikazujeta enake ID-je trenutne strani. | ID-ji na strani enak za obe prikaza. |
| R07 | Mengla pogledov in podrobnosti ohranijo stran, velikost in filter. | Gumbi pogledov ne spremenijo koordinato. |
| R08 | Menjava projekta in osvežitev ponastavita `size=all`, `filter=all`, `page=1`. | Po prehod projekta se koordinata ponastavi. |
| R09 | Neprazen rezultat: status `Stran X od Y`. Prikazano `A–B od N.`. | `X/totalPages`, `A/B` se v računu odšteje od 1. |
| R10 | Prazen projekt/filter: status `Stran 0 od 0`. Prikazano `0–0 od 0.`. Vsi gumbi disabled. | `tasks.length===0` → `page=0, pageSize=0`. |
| R11 | Pregled stanj šteje celoten nefiltrirani projekt; stolpci tabele štejeta prikazana opravila. | `counts` neodvisen od straničenja. |
| R12 | Straničenje ne spreminja podatkov, ne pošilja API. | Samo GET `/api/projects/{id}/tasks`. |
