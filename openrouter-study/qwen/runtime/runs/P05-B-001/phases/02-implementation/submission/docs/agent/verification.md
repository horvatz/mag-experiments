# P05: Verifikacija straničenja in filtra stanj

## Stanje preverjanja

- **Zaceto:** 2026-10-08
- **Status:** Zacetna analiza specifikacije, nacrt preverjanja pripravlen

## Obvezne zahteve

| Zahteva | Pogoj | Test | Status |
| --- | --- | --- | --- |
| R01 | Privzeto all/all, vsa opravila | R01-table-default | Neizveden |
| R02 | Stranice 2/5/10, brez izgube ID-jev | R02-pagination-sizes | Neizveden |
| R03 | Gumbi z onemogocenimi robovi | R03-pagination-buttons | Neizveden |
| R04 | Page size sprememba na stran 1 | R04-size-back-to-one | Neizveden |
| R05 | Filter reset na stran 1 | R05-filter-reset | Neizveden |
| R06 | Preglednica/tabla ista stran | R06-view-consistency | Neizveden |
| R07 | Preklop pogleda ohrani stran | R07-view-toggle-preserve | Neizveden |
| R08 | Projektna menjava resetira vse | R08-project-switch-reset | Neizveden |
| R09 | Status format neprazen rezultat | R09-status-format | Neizveden |
| R10 | Status prikaz prazen rezultat | R10-empty-result | Neizveden |
| R11 | Statusceji celotni projekt | R11-status-counts | Neizveden |
| R12 | Ne spremena API  podatkov | R12-no-api-side-effects | Neizveden |

## Obvezne razvojne preverjave

- 38 testnih primerov osnovnih funkcionalnosti
- 8 razvojnih testov P05 (Playwright)
- Slogovno preverjanje z `npm run check`

## Omejitve okolja

- Chromium.connect() zahteva wsEndpoint iz `task/browser.json`
- chromium.launch() ni na dosegu (javni internet blokiran)
- Testni steznik 5174/3102
- Prazni projekti in razlita sttevila opravil mozni
