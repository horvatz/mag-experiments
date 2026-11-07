# Preverjanje P06

Datum preverjanja: 30. oktober 2026.

## Izvedena preverjanja

- `npm run typecheck`: uspešno, brez tipovskih napak.
- `npx playwright test --project=development-desktop --project=development-mobile`: 8/8 uspešno.
- `npx playwright test --project=agent`: 5/5 uspešno.
- `npm run check`: ESLint uspešen, produkcijska gradnja uspešna, Playwright 51/51 uspešno.

## Sledljivost zahtev

| Zahteva | Dejanski test in izid |
| --- | --- |
| R01 | D01 (namen datoteke, BOM, končni CRLF, izvorni vrstni red), A01: uspešno. |
| R02 | D02, A02 (izbor v drugačnem vrstnem redu, izhod v nespremenljivem vrstnem redu): uspešno. Lastni test je najprej odkril napako; po preslikavi prek `exportColumns` je uspešen. |
| R03 | A02: onemogočen izvoz brez stolpcev in ponovna omogočitev: uspešno. |
| R04 | D02, A02 in A03: filter `done`, prazen filter `in_progress` in prazen projekt: uspešno. |
| R05 | D01, D04, A01: ime datoteke, BOM, prenos prek Playwright download in brez zapisovalnih zahtevkov: uspešno. |
| R06 | D03, A01 in A02: navedba narekovajev pri obeh ločilih: uspešno. |
| R07 | D01, D03, A01: CRLF, zadnja vrstica in prelomi v vrednostih: uspešno. |
| R08 | D03, A01, A02: nevtralizacija `=`, `+`, `-` in `@` tudi po presledkih, tabulatorju ali CR/LF: uspešno. |
| R09 | A01: šumniki, presledki, `status`, `dueDate` in opis: uspešno. |
| R10 | D04, A04: enaka nastavitev in enaka datoteka po preklopu pogledov: uspešno. |
| R11 | A05: ponastavitev po osvežitvi in menjavi projekta ter zaporedna izvoza: uspešno. |
| R12 | D04, A01 ter vsi izhodiščni in razvojni testi v `npm run check`: brez zapisovalnih zahtevkov ali regresij obstoječih funkcij: uspešno. |

## Omejitve

- Preverjanja potekajo v lokalnem testnem okolju s Chromiumom; druge brskalnike ali zunanje končne uporabnike nismo dostopali.
- Nepričakovane napake `URL.createObjectURL` ali brskalnikovega prenosa niso dodatno simulirane.
