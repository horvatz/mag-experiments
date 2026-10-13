# Preverjanje P06

Datum: 2026-10-09. Okolje: obstoječe odvisnosti, Chromium; testi prek Playwright (projekt agent), ročni ogled `WEB_PORT=5193 API_PORT=3123 npm run dev`.
Rezultati se sproti dopolnjujejo; neizvedeni koraki so označeni kot nepreverjeni.

## Stanje izvedbe

- [ ] `npm run typecheck`
- [ ] `npm run lint`
- [ ] lastni testi (`npx playwright test --project=agent`)
- [ ] skupni testi (`npx playwright test`)

## Sledljivost zahtev

| Zahteva | Preverjanje | Izid in dokaz |
| --- | --- | --- |
| R01 | privzete vrednosti in izvorni vrstni red | v izvajanju |
| R02 | nespremenljiv vrstni red kolon | v izvajanju |
| R03 | onemogočen izvoz brez kolon | v izvajanju |
| R04 | filter in prazni rezultati | v izvajanju |
| R05 | ime datoteke, BOM, brez strežnika | v izvajanju |
| R06 | ločilo in narekovanje | v izvajanju |
| R07 | CRLF in ohranjene vrednosti | v izvajanju |
| R08 | nevtralizacija formul | v izvajanju |
| R09 | Unicode, status, datum | v izvajanju |
| R10 | preklop pogleda | v izvajanju |
| R11 | ponastavitve | v izvajanju |
| R12 | brez sprememb podatkov | v izvajanju |

## Omejitve

- Končni ocenjevalni testi niso dostopni; navajajo se le dejansko izvedena preverjanja.
