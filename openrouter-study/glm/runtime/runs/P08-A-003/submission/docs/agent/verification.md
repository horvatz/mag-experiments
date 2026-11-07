# Preverjanje P08

## Izvedena preverjanja

| Zahteva | Preverjanje | Rezultat |
| --- | --- | --- |
| R01, R03–R05 | `A01: fixed reference date and inclusive calendar boundaries` preveri fiksni datum, stroge/mejne skupine in UTC seštevanje čez mesec, leto ter prestopni februar. | Uspelo |
| R02, R06–R09 | `A02: counts are project-wide and filtering preserves source order` preveri prednost `done`, pet števcev, izvorno zaporedje, takojšen preračun ter enake ID-je v tabeli in tabli. | Uspelo |
| R08 | `A03: empty draft retains the last valid calculation and active group` preveri opozorilo, ohranjen izračun in odstranitev opozorila. | Uspelo |
| R10, R12 | `A04: project switch and refresh reset local deadline state` preveri ponastavitev, odsotnost lokalne shrambe in filtra v URL ter nič pisanj prek API. | Uspelo |
| R11 | `A05: empty project remains usable` in `A06: an empty selected group remains switchable` preverita pet ničel, sporočili in preklop nazaj. | Uspelo |
| R07, R12 | `A7: mobile layout does not expand the page` preveri dostopnost kontrol in širino 390 px brez razširitve strani. | Uspelo |
| R01–R04, R07, R12 | Skupni testi `D01–D04` na namizju in mobilni širini preverijo fiksni datum, skupine, tablo, meje in brez pisanj. | Uspelo |

## Ukazi in rezultati

- `npm run typecheck`: uspešno, brez tipovnih napak.
- `npm run lint`: uspešno, brez opozoril ESLint.
- `npx playwright test tests/agent/P08.spec.ts --project=agent`: 7 od 7 uspešnih.
- `npx playwright test --project=development-desktop --project=development-mobile`: 8 od 8 uspešnih.
- `npm run check`: uspešno; vseboval ESLint, `tsc --noEmit`, produkcijsko izgradnjo Vite ter 53 od 53 Playwright preverjanj (14 API, 12 namiznih, 12 mobilnih, 8 razvojnih, 7 lastnih).

## Omejitve

- Končni (zunanji) primeri niso bili dostopni; preverjanje je zajeto z dostopnimi izhodiščnimi, razvojnimi in lastnimi testi nad zahtevano domeno.
