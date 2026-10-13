# Razvojna specifikacija: Koledarski pregled rokov

## Problem in kontekst

Aplikacija Folio prikazuje opravila v projektih z pregledom v preglednici ali tabli. Za nalogo P08 dodajemo referenčni datum in koledarske skupine: overdue, today, week, later, done.

Referenčni datum je izrecno `2026-09-21` za vse scenarije. Uporabnik lahko izbere pogled (all ali kategorijo). Statuti: todo, in_progress (odprta) in done (zaključeno).

## Dejanja

| Dejanje | Opis |
|---------|------|
| referencni_datum | Input type=date z oznako "Referenčni datum" |
| pogled_rok | Select z možnostmi: all, overdue, today, week, later, done |
| preglez_tabla | Table ali board; ne spremeni podatkov |
| menjava_projekta | Klik na drug projekt |

## Izidi - Števci

| Skupina | Izračun | Prvič |
|---------|---------|-------|
| overdue | dueDate < referenca (status != done) | 5.9.2026 |
| today | dueDate == referenca (status != done) | 21.9.2026 |
| week | dueDate od ref+1 do ref+7 | 22.-28.9.2026 |
| later | dueDate > ref+7 (status != done) | 30.9.2026 |
| done | status == done | Vse done opravila |

## Zahteve R01-R12

| Zahteva | Pravilo |
|---------|---------|
| R01 | Referenčni datum 2026-09-21; prvi pogled all |
| R02 | Done opravila vedno v skupini done |
| R03 | Odprto: due < ref -> overdue; due == ref -> today |
| R04 | due v [ref+1, ref+7] -> week; due > ref+7 -> later |
| R05 | Koledarsko seštevanje dni (date-fns) |
| R06 | Pet števc: overdue/today/week/later/done; filter ne vpliva |
| R07 | Select z 6 možnostmi |
| R08 | Datum spreminja -> preračun; prazen -> alert |
| R09 | Table/tabla imata iste ID-je; ohranijo datum |
|R10 | Menjava projekta -> reset |
|R11 | Prazen projekt -> 5x0; prazna skupina -> poročilo |
|R12 | YYYY-MM-DD; samo branje; ne pošilja API |

## Predikati

```typescript
const group: TaskGroup = dueDate < refDate ? overdue :
    dueDate > addDays(refDate, 7) ? later :
    dueDate > refDate ? week : today;
// skupina done preveri status != done
```
