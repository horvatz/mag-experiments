# Specifikacija naloge P06: Nastavljiv izvoz CSV
# Datum: 2026-10-30

## Problem in kontekst

Folio omogoča pregled in ureditev opravil (tasks) v preglednicah ali tabeli.
Uporabniki lahko eksportirajo opravila trenutnega projekta v CSV datoteko za
shranjevanje zunaj aplikacije. Začetna aplikacija še nima izvozne funkcije.

Cilj naloge: Dopolniti obstoječi vmesnik s funkcijo izvoza CSV, ki omogoča
nastavitev kolon (checkboxi), ločila (;/,) in filtra (all/todo/in_progress/done).
Izvoz se izvaja lokalno brez pošiljanja podatkov na strežnik.

## Vhodi, dejanja in izidi

### Podatkovni vhodi
- Projektni podatki: seznam opravil z ID-ji, naslovi, statusi, assigneeji, roki, opisi
- Javni API: `/api/` za branje opravil po `projectId`

### Dovoljena dejanja
1. klik na checkbox pri koloni – v/izberi kolono za izvoz
2. izbiro ločila (; ali ,) v HTML select
3. izbiro filtra (all/todo/in_progress/done) v HTML select
4. klik na gumb "Izvozi CSV"

### Pričakovani izvid
- CSV datoteka `folio-{projectId}.csv` z ustrezno vsebino
- Datoteka prenesena z UTF-8 BOM (U+FEFF)
- Izvoženih je samo opravil, ki ujemajo se s trenutnim filtrom
- Vse glave in vrednosti v ustrezni CSV formatti

## Zahteve in pravila

| Zahteva | Pravilo oziroma sprejemni pogoj | Način preverjanja |
| --- | --- | --- |
| R01 | Izvoz zajame opravila trenutnega projekta v izvornem vrstnem redu. Privzeti filter je all, izbrane so vse dovoljene kolone, ločilo je podpičje. | Defaultno stanje UI; po kliku "Izvozi CSV". |
| R02 | Izbrati je mogoče 7 kolon: id, projectId, title, status, assignee, dueDate, description. Vrstni red glav in vrednosti je fiksen. | Preverjanje vrstnega reda glav in celic v CSV. |
| R03 | Če nobena kolona ni izbrana, je izvoz onemogočen, gumb je onemogočen. Ponovni izbor omogoči izvoz. | Preizkus s praznimi checkboxi. |
| R04 | Filter (all/todo/in_progress/done) omeji samo izvožene vrstice. Vmesnik prikazuje celoten projekt. Prazen projekt ali prazen filtrirani rezultat onemogoči izvoz. | Comparing UI prikaz (vsi) in CSV (filtrirani). |
| R05 | Izvoz prenese `folio-{projectId}.csv` z UTF-8 BOM (U+FEFF). Ne odpre nove strani, ne pošiljajo podatkov na strežnik. | Preverjanje MIME type, prvi bajti (EF BB BF), no navigation. |
| R06 | Ločilo nastavljivo: `;` ali `,`. Vsaka glava/vrednost obdana z dvojnimi narekovaji. Notranji dvojni narekovaji podvojeni. | CSV parsing in re-parsing test. |
| R07 | Vrstice CSV ločene z CRLF; zadnja vrstica se konča z CRLF. Ločila/prelomki v vrednostih ostanejo. | Preverjanje line endings (hex: 0D 0A). |
| R08 | Formula nevtralizacija: če vrednost začne z =,+,-,@ (po presledkih), dodaj apostrof. Drugih nizov ne spreminjaš. | Test z vrednostmi, ki začenjajo z =,+,-,@. |
| R09 | Šumniki, Unicode, presledki in opisi ohranjeni. Status kot internal vrednost, datumi YYYY-MM-DD. | Preverjanje UTF-8 in datume. |
| R10 | Preklop Preglednica/Tabla ohrani izbor kolon, ločilo, filter. Isti nastavitvi ustvarita iste bajte. | Preizkus preklopa pogledov z ohranjenimi settings. |
| R11 | Menjava projekta in osvežitev ponastavita kolone, ločilo, filter na privzete. Zaporedni izvozi odražajo trenutne nastavitve. | Test s prehodom med projekti. |
| R12 | Izvoz ne spreminja opravil ne obstojeчих bralnih funkcij. Ne pošilja zapisov na API. Videz prilagodljiv. | Baseline regression testi. |

## Izvedba in sledljivost

| Zahteva | Pogoj | Test | Datoteka | Izid |
| --- | --- | --- | --- | --- |
| R01 | Default filter=all, vse koloni izbrane, ločilo `;` | `e2e-spec/export-default.spec.ts` | `src/export/ExportTaskColumn.ts` | First export |
| R02 | 7 kolon, fiksni vrstni red | `e2e-spec/export-columns.spec.ts` | `src/export/CsvConstants.ts` | Header order check |
| R03 | Prazne checkboxi → disabled gumb, no download | `e2e-spec/export-empty.spec.ts` | `src/export/ExportTaskColumn.ts` | No download action |
| R04 | Filter omeji vrstice, UI prikazuje vse | `e2e-spec/export-filter.spec.ts` | `src/filter/TaskFilter.ts` | CSV length vs UI |
| R05 | UTF-8 BOM, lokalni download, no nav | `e2e-spec/export-bom.spec.ts` | `src/export/ExportTaskColumn.ts` | Bytes EF BB BF |
| R06 | Double quotes, escaped quotes | `e2e-spec/export-format.spec.ts` | `src/export/EscapeHelper.ts` | Parse re-parse check |
| R07 | CRLF line endings | `e2e-spec/export-endings.spec.ts` | `src/export/ExportTaskColumn.ts` | hex: 0D 0A |
| R08 | Escape =,+,-,@ | `e2e-spec/export-formula.spec.ts` | `src/export/EscapeHelper.ts` | Leading apostrophe |
| R09 | Unicode and dates | `e2e-spec/export-chars.spec.ts` | `src/export/ExportTaskColumn.ts` | UTF-8 check |
| R10 | Settings persist across views | `e2e-spec/export-views.spec.ts` | `src/export/ExportSettings.ts` | State invariant |
| R11 | New project resets settings | `e2e-spec/export-project.spec.ts` | `src/export/ExportSettings.ts` | Reset check |
| R12 | No mutations | baseline tests | all tests | Pass all 30+ |

## Odprta vprašanja in omejitve

- Ne moremo testirati dejanskega prenosa CSV zaradi sandbox omejitev (predloga uporabe URL.createObjectURL ali simulacije).
- Domneva: Javni API `/api/` vrača pravilno urejen seznam opravljanj.
- Ne obravnavamo napake pri pisanju CSV na sistemsko disko (uporabnik odgovoren za pot).

