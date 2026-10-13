Perfect! The specification document has been successfully created and logged. Here is my final summary:

✅ **Faza #1 (specifikacija) zaključena — 47 sekund ostaja do obveznega časa**

## Delo, ki ga je opravljen:

**Dokumentacija:**
- [`docs/agent/specification.md`](docs/agent/specification.md) — specifikacija za CSV izvoz z vsemi ključnimi zahtevami R01–R12
- [`docs/agent/specification-history.md`](docs/agent/specification-history.md) — zgodovinsko branje in končno stanje

## Ključne točke specifikacije:

| Zahteva | Opis |
| --- | --- |
| R01–R02 | Prikaži trenutna opravila s pravo vrstnim redom |
| R03 | Onemogočitev brez izbranih kolon; omogočitev ob izbiri |
| R04 | Filter `all/todo/in_progress/done` omeji vrstice |
| R05 | Dodeli `folio-{projectId}.csv` z UTF-8 BOM-om |
| R06 | Dovoljen ločilo `;` ali `,`; vse zveze z dvema narekovajema |
| R07 | Vrstne oznake s CRLF (`\r\n`), tudi zadnja vrstica |
| R08 | Nevtralizacija formul z adding apostrofa za `=`, `+`, `-`, `@` |
| R09 | Unicode in datum YYYY-MM-DD |
| R10 | Preglednica/tabla ohranimi nastavitve |
| R11 | Ponastavitev ko se spremeni projekt ali osvežite |
| R12 | Brez sprememb in API klic |

## Odprta vprašanja:
- Implementacija je mogoča zdaj
- Testi v `tests/development/P06.spec.ts` D01-D04 pravilno določajo zahteve

## Naslednji koraki:
- Implementer ustvari CSV izvozno funkcijo v src/
- Testiranje preko `tests/development/P06.spec.ts`
