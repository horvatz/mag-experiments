# Preverjanje P06

Datum izvedbe: 9. oktober 2026.

## Izvedena preverjanja

| Preverjanje | Ukaz | Rezultat |
| --- | --- | --- |
| Tipi | `npm run typecheck` | Uspešno. |
| Stil in sintaksa | `npm run lint` | Uspešno. |
| Lastni testi | `npx playwright test --project=agent` | 3/3 uspešni. |
| Razvojni testi P06 | `npx playwright test --project=development-desktop --project=development-mobile` | 8/8 uspešni. |
| Celotna kontrola | `npm run check` | Uspešno: lint, produkcijska izgradnja in 49/49 testov. |

## Pokritje zahtev

| Zahteva | Preverjanje |
| --- | --- |
| R01–R12 | `P06 agent export covers all requirements` preveri privzete vrednosti, izvorni vrstni red, stolpce, izbore, filtre, ime datoteke, BOM, narekovaje, ločila, CRLF, Unicode, ohranjanje med pogledoma, menjavo projekta, osvežitev, zaporedne izvoze, odsotnost zapisovalnih zahtevkov, odsotnost odpiranja nove strani in ohranjanje obstoječih oznak. |
| R03, R04, R12 | `P06 agent empty project stays readable and export stays disabled` preveri prazen projekt, onemogočen izvoz in širino 390 pik brez vodoravne širitve strani. |
| R08 | `P06 agent formula neutralization covers every prefix and data column` preveri `=`, `+`, `-`, `@` ter presledke, tabulator, CR in LF pred prefiksom v vseh sedmih podatkovnih stolpcih. |
| R01, R02, R03, R06, R07, R08, R10, R12 | Skupni razvojni testi `D01: default file framing`, `D02: selected fields and separator`, `D03: escaped quotes and neutralized formula` in `D04: view parity and no writes` so uspešni na namiznem in mobilnem Chromiumu. |
| Izhodišče in API | `npm run check` poteče tudi vseh 38 izhodiščnih preverjanj brez sprememb obstoječega obnašanja. |

## Omejitve

- Preverjanja so izvedena samo v lokalnem Chromiumu, ki ga zagotavlja okolje naloge.
- Javni internet ni bil uporabljen; aplikacija bere samo lokalni `/api/`.
- Nerešenih zahtev ni. Preskoki osvežitve med nezaključenim nalaganjem niso v obsegu naloge in niso preverjeni.
