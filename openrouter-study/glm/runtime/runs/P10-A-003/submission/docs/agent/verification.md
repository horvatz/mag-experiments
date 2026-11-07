# Preverjanje rešitve P10

## Izvedena preverjanja

| Zahteva | Preverjanje | Izid |
| --- | --- | --- |
| R01 | `D01` preveri začetni vrstni red in en premik; lastni test `R01–R06` preveri mesta in enolične ID-je. | Uspešno. |
| R02 | `D01` in lastni test `R01–R06` preverita zamenjavo globalnih sosedov. | Uspešno. |
| R03 | `D01` in lastni test `R03, R06 and R07` preverita onemogočena robova. | Uspešno. |
| R04 | `D02` in lastni test `R01–R06` preverita razveljavitev premika. | Uspešno. |
| R05 | Lastni test `R01–R06` preveri več razveljavitev in ponovitev brez izgube ali podvajanja. | Uspešno. |
| R06 | `D03` preveri čiščenje ponovitev; lastna testa `R03, R06 and R07` in `R06` preverita tudi varnost roba. | Uspešno. |
| R07 | Lastni test `R03, R06 and R07` izvede 21 veljavnih premikov in preveri mejo 20. | Uspešno. |
| R08 | `D04` in lastni test `R08` preverita povratek na izhodišče kot razveljavljivo dejanje. | Uspešno. |
| R09 | `D01`, `D04` in lastni test `R09 and R10` preverijo globalna mesta ter premik globalnega soseda na tabli. | Uspešno. |
| R10 | Lastni test `R09 and R10` preveri preklop pogleda, podrobnosti, menjavo projekta in osvežitev. | Uspešno. |
| R11 | Lastna testa `R11` in `R11 and R12` preverita števce, prazen projekt in projekt z enim opravilom. | Uspešno. |
| R12 | `D04` in lastni test `R11 and R12` preverita odsotnost zapisov, nespremenjena polja, statuse, podrobnosti in širino 390 px. | Uspešno. |

## Dejanski rezultati

- `npm run typecheck`: uspešno, brez tipovnih napak.
- `npx playwright test tests/agent/P10.spec.ts --project=agent`: 7 od 7 testov uspešnih.
- `npx playwright test --project=development-desktop --project=development-mobile`: 8 od 8 testov uspešnih.
- `npm run check`: `eslint` uspešen, produkcijska izgradnja uspešna, Playwright 53 od 53 testov uspešnih.

## Omejitve

- Preverjanja so izvedena samo v lokalnem okolju z namenskim Chromiumom; ni preverjeno v drugih brskalnikih.
- Javni internet ni uporabljen in ni bil na voljo.
- Lokalni vrstni red ni trajno shranjen, kar ustreza zahtevam R10; zato osvežitev namenoma ponastavi stanje.
