# Preverjanje P05

## Stanje

- Datum: 2026-10-30.
- Vse naloge T001–T007 iz `docs/agent/P05/tasks.md` so opravljene.

## Izvedena preverjanja

- `npm run lint`: uspešno.
- `npm run build` (vključno z `tsc --noEmit`): uspešno.
- `npx playwright test tests/agent/p05.spec.ts --project=agent`: 5 opravljenih, 0 neuspešnih.
- `npm run check`: 51 opravljenih, 0 neuspešnih — 14 API, 24 osnovnih, 8 razvojnih P05 in 5 lastnih P05 preverjanj.

## Sledljivost zahtev

| Zahteva | Dokaz |
| --- | --- |
| R01 | `R01, R02, R03 and R09: defaults, complete pages, navigation and status` preveri privzeti vrstni red. |
| R02 | isti test preveri vseh šest strani pri velikosti 2 brez izgub in podvajanj. |
| R03 | isti test preveri premike ter onemogočena robna dejanja. |
| R04 | `R02, R04, R05, R06 and R11: sizes, filtering, views and counters` preveri ponastavitev ob spremembi velikosti. |
| R05 | isti test preveri filter pred straničenjem in ohranjanje vrstnega reda. |
| R06 | isti test primerja preglednico in tablo ter števce stolpcev trenutne strani. |
| R07 | `R07 and R08: view, details, project and refresh preserve the agreed state` preveri ohranjanje stanja ob pogledu in podrobnosti. |
| R08 | isti test preveri ponastavitev ob menjavi projekta in osvežitvi. |
| R09 | prvi test preveri natančno besedilo statusa na več straneh. |
| R10 | `R10 and R12: empty results disable navigation and remain readonly` preveri prazen rezultat in vse štiri onemogočene gumbe. |
| R11 | drugi test preveri celoten pregled stanj in števce trenutne strani. |
| R12 | drugi, četrti in peti test preverjajo ID-je, podrobnosti, povezave, odsotnost zapisov in širino 390 pik; skupni testi preverjajo obstoječe delovanje. |

## Omejitve

- Ročni predogled ni izveden; vedenje je preverjeno z avtomatiziranimi namenskimi in skupnimi testi.
- Zunanjih končnih testov ni na voljo in niso zapisani kot izvedeni.
