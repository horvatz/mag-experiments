# Preverjanje P04

Datum: 30. 10. 2026

## Izvedena preverjanja

| Zahteve | Preverjanje | Rezultat |
| --- | --- | --- |
| R01–R06 | `npm run lint`, `npm run typecheck` ter lastni unit test `tests/agent/sorting.spec.ts:16` (`sorting rules are stable and normalized`), ki pokriva privzeto zaporedje, normalizacijo NFD/diakritike/male črke, UTF-16 primerjavo, status, datume, obe smeri, sekundarni ključ, stabilnost izenačenih elementov, enak ključ in `original`. | Uspešno. |
| R01, R04–R12 | Lastni UI test `tests/agent/P04.spec.ts:57` (`sorting state works in both views, details and projects`) preveri privzete vrednosti, razvrščanje po naslovu in odgovorni osebi, tablo po stolpcih, preklop pogleda, podrobnosti z enakimi naslovi, reset, menjava projekta, osvežitev, URL/trajno shrambo, pomanjšanje na 390 px in odsotnost API zapisov. | Uspešno. |
| R03, R07, R10 | Lastni UI test `tests/agent/P04.spec.ts:123` (`empty and single-task projects support every key and direction`) preveri prazen projekt in projekt z enim opravilom pri vseh ključih in smereh. | Uspešno. |
| R01–R12 | `npx playwright test --project=development-desktop --project=development-mobile` izvede vseh 8 razvojnih preverjanj P04. | Uspešno: 8/8. |
| R01–R12 in obstoječe funkcije | `npm run check` izvede `eslint .`, `tsc --noEmit`, produkcijsko izgradnjo Vite ter vse Playwright projekte. | Uspešno: 49/49 preizkusov. |

## Sledljivost kode

- `src/sorting.ts:1` določi vrste kontrol, privzete vrednosti, normalizacijo, primerjave statusa in datumov, obrat smeri, sekundarno primerjavo, stabilno razvrščanje in posebno pot `original`.
- `src/App.tsx:13` hrani lokalno stanje štirih kontrol, izračuna razvrščeno projekcijo, prikaže štiri izbire in gumb za ponastavitev ter preglednici poda razvrščeno polje.
- `src/TaskBoard.tsx:15` ohrani stalne tri stolpce in znotraj stolpcev uporabi razvrščeno polje.
- `src/styles.css:66` uredi novo območje kontrol tako, da se prilagodi ozkim zaslonom; notranje drsenje obstoječih pogledov ostane.

## Rezultati

- `npm run lint`: uspešno.
- `npm run typecheck`: uspešno.
- `npm run build` (znotraj `npm run check`): uspešno.
- `npx playwright test --project=agent`: 3/3 uspešno.
- `npx playwright test --project=development-desktop --project=development-mobile`: 8/8 uspešno.
- `npm run check`: 49/49 uspešno (14 API, 24 izhodiščnih namiznih/mobilnih, 8 razvojnih P04 in 3 lastni).

## Omejitve

- Končni oz. zaključni testi niso na voljo v tem okolju; niso navajani kot izvedeni.
- Javni internet ni uporabljen. Preverjanja potekajo proti lokalnemu testnemu strežniku na vratih 5174/3102.
- Niso preverjane sočasne spremembe podatkov brez osvežitve, ker naloga te situacije ne razširi prek obstoječih regresij.
- Naložbe niso dodane, strežnik, skupni tipi, infrastruktura in skupni testi so nespremenjeni.
