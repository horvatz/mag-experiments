# P05: Straničenje in filter stanja — razvojna specifikacija

Verzija 1.0, avtor: pilot P05B (speks), datum: 2026-10-08.

## Problem in kontekst

Aplikacija **Folio** omogoča pregled opravil v projektih z dvema pogledoma: **Preglednica** (seznamno ogledalo) in **Tabla** (kanban s stolpci). Trenutno vmesnik prikazuje vsa opravila na eni strani brez nadzora števila.

Naloga je dodati **straničenje** in **filter stanj** v tabelarnem pogledu.

## Vhodi, dejanja in izidi

### Podatkovni vhodi
- `taskId` (string) — ID trenutnega opravila
- `view` (`table` | `board`) — Tekoči pogled
- `pageSize` (`all` | 2 | 5 | 10) — Izbirna velikost strani
- `filter` (`all` | `todo` | `in_progress` | `done`) — Filtrirno stanje
- `page` (number) — Številka trenutne strani

### Podatkovni izhodi
- `tasks` (`Task[]`) — Masiv opravil za trenutno stran
- `status` (string) — Stanje stranjenica: `Stran X od Y`
- `counts` ({todo/in_progress/done: number}) — Števila stanj (nefiltrirano)

## Zahteve in pravila

| Zahteva | Pravilo oziroma sprejemni pogoj |
| --- | --- |
| R01 | Privzeto `pageSize="all"` in `filter="all"`; vsa opravila v prvotnem vrstnem redu. |
| R02 | Velikosti 2, 5, 10 razdelijo opravila v zaporedne, neprekrivajoče se odseke; noben ID se ne izgubi. |
| R03 | Gumbi za straničenje vodijo na ustrezno stran; na robu je ustrezni gumb onemogočen. |
| R04 | Sprememba `pageSize` vrne na stran 1; `all` pomeni ena stran pri nepraznem rezultatu. |
| R05 | Filter se uporabi pred straničenjem; sprememba filtra vrne na stran 1. |
| R06 | Preglednica inabela kažeta iste taskID-i na tekoči strani. |
| R07 | Podrobnosti, preklop pogleda ohranita stran, velikost in filter. |
| R08 | Menjava projekta in reload ponastavita stran=1, pageSize=all, filter=all. |
| R09 | Neprazen rezultat: `Stran X od Y`; prikaz: `A–B od N` (indeksi začnejo s 1). |
| R10 | Prazen rezultat: `Stran 0 od 0`; prikaz: `0–0 od 0`; gumbi onemogočeni. |
| R11 | Števci stanj štejejo vse opravila; tabela/kanban štejejo prikazana opravila. |
| R12 | Straničenje ne pošilja zapisa na API; povezave in ID-ji ostanejo pravilni. |

## Dogovor o vmesniku

- `select`: `all/2/5/10` (Velikost strani)
- `input`: `all/todo/in_progress/done` (Filter stanj)
- Gumbi: Prva, Prejšnja, Naslednja, Zadnja stran
- Element: `role="status"` z `aria-label="Stanje straničenja"`

## Podatki

- API: `/api/projects/{id}/tasks` vrne `Task[]`
- Tipi: `Project`, `Task`, `TaskStatus` (`todo`|`in_progress`|`done`)
- Testna podlaga: poljubno število opravil (0, 1, 10+)
- Prazni podatki: R10 se uporabi

## Odprta vprašanja in omejitve

- Brskalnikovo sortiranje upoštevamo iz podatkov (array order)
- Obnašanje na ozkem zaslonu: 390px, notranje drsenje dovoljeno
- Testi: končni testi bodo izdelani po implementaciji
