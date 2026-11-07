# Preverjanje P03

## Izvedena preverjanja

- `npm run check` (končni zagon 2026-11-01): ESLint uspešen, `tsc --noEmit` uspešen, Vite build uspešen.
- Playwright v okviru `npm run check`: 51/51 testiranj uspešnih.
- Izhodna in API preverjanja: 38/38 uspešnih.
- Razvojna preverjanja P03: 8/8 uspešnih (`D01`–`D04` v projektnih `development-desktop` in `development-mobile`).
- Lastna agentna preverjanja: 5/5 uspešnih (`A01`–`A05`).

## Sledljivost zahtev

| Zahteva | Dejanski scenarij in izid |
| --- | --- |
| R01 | `A01` potrdi privzeti prikaz vseh nalog v izvornem vrstnem redu; opravljeno. |
| R02 | `D01` in `A01` preverita iskanje `CAS` oz. `ČRT` z odstranitvijo diakritike in malimi črkami; opravljeno. |
| R03 | `A01` preveri večbesedno iskanje z neodvisnim vrstnim redom besed; `D03` preveri negativni zadetek; opravljeno. |
| R04 | `D02` in `A01` preverita kombinacijo iskanja, stanja in odgovorne osebe z logičnim IN; opravljeno. |
| R05 | `A02` preveri izbirnik `all` in unikatne osebe trenutnega projekta; opravljeno. |
| R06 | `D02` in `A01` preverita enake ID-je v preglednici in tabli ter ohranitev filtrov; opravljeno. |
| R07 | `A02` preveri ponastavitev iskanja in obeh filtrov ob preklopu projekta; opravljeno. |
| R08 | `A03` preveri privzete vrednosti po osvežitvi brez URL/trajne shrambe; opravljeno. |
| R09 | `D04` in `A01` preverita besedilo `Prikazano: N od M.` in števce stanjev po filtriranju; opravljeno. |
| R10 | `D03` in `A04` preverita sporočilo `Ni zadetkov.` v obeh pogledih ter prazno stanje `0 od 0`; opravljeno. |
| R11 | `D03` in `A01` preverita enkratno čiščenje vseh treh kontrol in ponovni prikaz vseh nalog; opravljeno. |
| R12 | Izhodni testi, `D04` in `A05` preverijo navigacijo, podrobnosti, odsotnost pisalnih zahtev in ozko postavitev; opravljeno. |

## Omejitve

- Končnih testov izven tega okolja nismo izvajali; veljajo zgoraj navedeni lokalni izidi.
- Ni znatih neizpolnjenih zahtev R01–R12.
