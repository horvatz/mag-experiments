# Verifikacija P10

## Izvedena preverjanja

- `npm run build`: tipčna kontrola in produkcijska izgradnja sta uspešni.
- `npx playwright test --project=development-desktop --project=development-mobile`: 8/8 skupnih razvojnih preverjanj P10 uspešnih.
- `npx playwright test --project=agent`: 5/5 lastnih preverjanj uspešnih.
- `npm run check`: ESLint, TypeScript, Vite build in vsi Playwright projekti uspešni; 51/51 testov uspešnih (14 API, 24 izhodiščnih namiznih/mobilnih, 8 razvojnih, 5 lastnih).

## Sledljivost zahtev

| Zahteva | Dejansko preverjanje | Izid |
| --- | --- | --- |
| R01 | `D01`, lastni test 1 preverja izvorno zaporedje, mesta in enkratne ID-je. | Uspešno. |
| R02 | Lastni test 1 preverja premik, mesto, naslov, stanje, osebo in rok po premiku. | Uspešno. |
| R03 | `D01` in lastni test 1 preverjata onemogočena robna gumba ter ohranitev zgodovine pri neveljavnem dejanju. | Uspešno. |
| R04 | `D02`, lastna testa 1 in 3 preverjata vstavljanje prejšnje permutacije in eno razveljavitev. | Uspešno. |
| R05 | Lastni test 3 izvede 20 razveljavitev in nato 20 ponovitev brez izgube ali podvajanja ID-jev. | Uspešno. |
| R06 | `D03` preverja čiščenje ponovitev pri novem premiku; lastni test 1 preverja ohranitev pri robnem dejanju. | Uspešno. |
| R07 | Lastni test 3 izvede 21 veljavnih premikov, potrdi mejo 20 in vse ponovitve. | Uspešno. |
| R08 | `D04` in lastni test 4 preverjata reset, novo razveljavljivo dejanje ter onemogočenost v izvornem stanju. | Uspešno. |
| R09 | `D04` in lastni test 2 preverjata globalna mesta in relativni vrstni red znotraj treh stolpcev na tabli. | Uspešno. |
| R10 | Lastna testa 2 in 4 preverjata preklop pogleda, podrobnosti, menjava projekta in osvežitev. | Uspešno. |
| R11 | Lastni testi 1, 4 in 5 preverjajo števce, onemogočenost pri ničli, prazen projekt in projekt z enim opravilom. | Uspešno. |
| R12 | Lastni testi 1, 4 in 5 ter `D04` preverjajo nespremenjena polja, odsotnost zapisov na API in širino 390 px. | Uspešno. |

## Omejitve

- Preverjanja so izvedena na lokalnem testnem strežniku z nadzorovanimi GET odgovori in nameščenim Chromiumom.
- Ni izvedenega javnega produkcijskega namestitvenega preverjanja, ker je v nalogi dostop do javnega interneta blokiran.
- Vrstni red ni trajno shranjen; to je skladno z zahtevo R10 in R12.
