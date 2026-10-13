# Navodilo: Koledarski pregled rokov (P08)

## Problem in kontekst

Uporabnik izbere projekt in na vidnem delu projekta pojavi **Koledarski pregled rokov**, ki skupine rokov:
- Zapadlo (pred referencnim datumom),
- Danes (enak referencnemu datumu),
- Naslednjih 7 dni (od +1 do +7 dni),
- Pozneje (od +8 dni naprej),
- Koncano (status `done`).

Uporabnik vnesel datum, izbral pogled in videl filtrirane opravila; koncni pogled ni stalni zapis.

## Vhodi, dejanja in izidi

- **Vhod**: referencni datum (`YYYY-MM-DD`, `input type="date"`), izbrana skupina (`all` / `overdue` / `today` / `week` / `later` / `done`), opravila iz projekta (branje preko `/api/projects/<id>/tasks`).
- **Dejanja**: spreminjanje referencnega datuma, izbirnik pogleda, preklop preglednice/plate.
- **Izid**: pet stevcev za vsako skupino, vidno opravilo po izbiri pogleda (ena ali vise vrstic), obvestilo pri praznem datumu ali prazni skupini.

### Predikati (pogojevali vidne opravila v seznamu)

Naj bo `rd` referencni datum, `task.dueDate` datum roka, `task.status` status opravila.

| Skupina | Pogoj (odprijo) |
| --- | --- |
| overdue | `task.status !== "done"` in `task.dueDate < rd` |
| today | `task.status !== "done"` in `task.dueDate === rd` |
| week | `task.status !== "done"` in `rd + 1 dni <= task.dueDate <= rd + 7 dni` |
| later | `task.status !== "done"` in `task.dueDate > rd + 7 dni` |
| done | `task.status === "done"` (vse take opravila, ne glede na datum) |

### Stevec predvsem celotnega projekta (brez filtra)

```
overdue_count  = vsota(task.status !== "done" && task.dueDate < rd)
today_count    = vsota(task.status !== "done" && task.dueDate === rd)
week_count     = vsota(task.status !== "done" && rd+1 <= task.dueDate <= rd+7)
later_count    = vsota(task.status !== "done" && task.dueDate > rd+7)
done_count     = vsota(task.status === "done")
```

### Vidne opravila v izbrani skupini

```
if view === "all"     -> vse opravila projekta
if view === "overdue" -> opravila iz skupine overdue
if view === "today"   -> opravila iz skupine today
if view === "week"    -> opravila iz skupine week
if view === "later"   -> opravila iz skupine later
if view === "done"    -> opravila iz skupine done
```

## Zahteve in pravila

| ID | Pravilo oziroma sprejemni pogoj |
| --- | --- |
| R01 | Referencni datum je ob začetku projekta izrecno 2026-09-21; pogled po začetku `all`. |
| R02 | `done` opravila se ne stejejo v `overdue/today/week/later`. |
| R03 | `overdue` = `dueDate < rd`; `today` = `dueDate === rd` (ob predpostavki odprtega opravila). |
| R04 | `week` = `dueDate in [rd+1, rd+7]`, `later` = `dueDate > rd+7` (odpri obravnava). |
| R05 | Datumi so YYYY-MM-DD brez casovnega pasu; `Date` objekt se obravnava le na dnevno tocno. |
| R06 | Pet stevovz prikazuje celoten projekt, filtriranje ne vpliva na stevec. |
| R07 | Izbirnik izpolni vse `all|overdue|today|week|later|done` v vrsnem redu, s spremembo samo vidnega seznama opravil. |
| R08 | Sprememba datuma takoj preraacun skupine in vidno opravilo; prazno vnosno obvestilo `role=alert` z besedilom `Vnesi veljaven referencni datum`. |
| R09 | Preglednica in tabla prikazujeta iste filtrirane opravila; preklop pogleda ohrani referencni datum, besedilo polja in izbrano skupino. |
| R10 | Menjava projekta ponastavi datum na 2026-09-21, skupino na `all`. Noben podatek o filtru se ne hrani v URL ali shrambi. |
| R11 | Prazen projekt izda `0,0,0,0,0` v stevec in sporocilo `Ni opravil v izbrani skupini.` pri prazni skupini; omogoca preklop pogleda. |
| R12 | Vsi datumi podatkov so veljavni `YYYY-MM-DD` (vkljucno prestopni); pregled ne posilja opravil na API; prilagodljivost projekta ohranja. |

## Izvedba in sledljivost

| Zahteva | Pogoj | Test ali scenarij | Datoteka in del kode | Izid ter dokaz |
| --- | --- | --- | --- | --- |
| R01 | Referencni datum=2026-09-21, pogled=all pri začetku projekta. | Prvic odpreti projekt. | `ProjectView` komponenta in zgodovinske vrednosti. | `dueDate=2026-09-21` in pogled `all`. |
| R02 | `done` opravila se ne stejejo v `overdue/today/week/later`. | V projektu 3 `done`, 2 odprta. | Filtiranje opravil po statusu. | Stevci 0/2/0/0/3 brez `done` v `overdue`, `today`. |
| R03 | `overdue` = `dueDate < rd`; `today` = `dueDate === rd`. | Vsak datum in opravilo z dnevnim datumom. | Primer 1: 2026-09-20 -> `overdue`. Primer 2: 2026-09-21 -> `today`. | Vrata opravila; tocen pogoj. |
| R04 | `week` = `dueDate in [rd+1, rd+7]`; `later` = `dueDate > rd+7`. | Vsak datum in opravilo izven `overdue`/`today`. | Primer 1: 2026-09-22-2026-09-28 -> `week`. Primer 2: 2026-09-29+ -> `later`. | Vrata opravila; tocen pogoj. |
| R05 | Datumi so YYYY-MM-DD brez casovnega pasu/prekomajstranja. | Preverjamo datum v februarju prestopnega leta. | Uporaba `Date` objekta brez `getTimezoneOffset()`. | Seestenje dni. |
| R06 | Stevec prikazuje vsa opravila projekta, ne filtrirano. | Vsi 10 opravil v projektu, razlicni pogledi. | Filtiranje opravil in vsota. | 10/10/10/10/10 v celotni projekti. |
| R07 | Izbirnik prikazuje vsa `all|overdue|today|week|later|done` v vrsnem redu. | Preklop med vrednostmi izbire. | Izbira pogleda. | Vidna opravila se spremenijo. |
| R08 | Sprememba datuma preraacun; prazen datum -> `role=alert`. | Spreminjanje vnosnega polja. | Vnos in prazno. | `role=alert` z besedilom "Vnesi veljaven referencni datum." |
| R09 | Preglednica in tabela prikazujeta isto opravilo. | Preklop vsih pogledov. | Preglednica/Table funkcionalnost. | Vidna opravila sta enaka. |
| R10 | Spreminjanje projekta ponastavi datum in pogled; noben podatek ni shranjen. | Spreminjanj projekta. | Pogled URL. | Praznost in datum ponastavljen. |
| R11 | Prazan projekt -> 0/0/0/0/0; prazna skupina -> sporoclje. | Prazen projekt. | Prazno opravilo. | 0/0/0/0/0 in "Ni opravil v izbrani skupini." |
| R12 | Veljavni datumi, ne posiljanja opravil na API. | Pregled brez zapisovanja. | API klicanje. | Brez zapisovanja. |
