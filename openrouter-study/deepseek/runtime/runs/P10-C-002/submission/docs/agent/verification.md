# P10 — dnevnik preverjanja

**Datum**: 2026-11-01 | **Funkcijska mapa**: `docs/agent/P10`
**Viri**: `task/instructions.md` (R01–R12), `PROJECT_RULES.md`, `spec.md`, `plan.md`, `tasks.md`

## Kako se preverja

- `npm run check` = `eslint .` + `tsc --noEmit` + `vite build` + `playwright test` (projekti
  `agent`, `development-desktop`, `development-mobile`, `desktop`, `mobile`, `api`).
- Testi uporabljajo strežnik na `5174` in API na `3102` (nastavljeno v
  `playwright.config.ts`); brskalnik se poveže prek `wsEndpoint` iz `task/browser.json`.
- Lastni testi so v `tests/agent/P10.spec.ts` in uporabljajo javni pripomoček
  `tests/development/helpers.ts` (nadzorovani GET odgovori, štetje zapisov).
- Ročni ogled: `WEB_PORT=5193 API_PORT=3123 npm run dev`.

## Izidi po korakih

| Korak | Ukaz | Izid |
| --- | --- | --- |
| T013 slog in gradnja | `npm run lint`, `npm run typecheck` (`tsc --noEmit`) | uspešno; med izvedbo popravljena ena tipizacija v lastnem testu (`(await ids(page)) as string[]`) |
| T014 celota | `npm run check` (eslint + tsc + vite build + playwright test) | **59 uspešnih, 0 neuspešnih**: 38 osnovnih (api 14, baseline desktop 12, baseline mobile 12), 8 razvojnih (D01–D04 × desktop/mobile) in 13 lastnih (`tests/agent/P10.spec.ts`) |
| T001 izhodišče | — | ni izvedeno pred spremembami; skupni testi so bili izvedeni po izvedbi (T014) in vsi uspejo |

## Sledljivost zahtev (izvleček iz `spec.md`)

Podrobna tabela R01–R12 je v `docs/agent/P10/spec.md`; spodaj so dejanski izidi
posameznih preverjanj, ko so na voljo.

| Zahteva | Preverjanje (ime testa) | Izid |
| --- | --- | --- |
| R01 | `R01: prejeti vrstni red in globalna mesta` + D01 | uspešno |
| R02 | `R02: premik zamenja z globalnim sosedom in ohrani polja` + D01 | uspešno |
| R03 | `R03: robna premika sta onemogočena in ne spreminjata stanja` + D01 | uspešno |
| R04, R05 | `R04/R05: razveljavitev in ponovitev obnovita permutaciji` + D02 | uspešno |
| R06 | `R06: nov premik zavrže ponovitve, robni premik jih ohrani` + D03 | uspešno |
| R07 | `R07: zgodovina razveljavitev je omejena na 20` | uspešno |
| R08 | `R08: začetni vrstni red je eno dejanje in počisti ponovitve` + D04 | uspešno |
| R09 | `R09: tabla ohrani relativni vrstni red in uporablja globalne premike` + D04 | uspešno |
| R10 | `R10: pogled in podrobnosti ohranita stanje, projekt in osvežitev ponastavita` + D04 | uspešno |
| R11 | `R11: števec je usklajen z gumbi`, `R11: prazen projekt ostane uporaben`, `R11: projekt z enim opravilom ostane uporaben` + D03 | uspešno |
| R12 | `R12: lokalne permutacije, brez zapisov in nespremenjena polja` + D04 (`readonly`) + skupni testi | uspešno; `saveRequests = 0`, ni ne-GET klicev na `/api/`, pri 390 px `scrollWidth <= clientWidth` |

Skupni testi izhodišča (`tests/baseline.spec.ts` desktop/mobile in `tests/api.spec.ts`)
ostajajo uspešni, zato je potrjen videz Folio in nespremenjeno vedenje API-ja.

## Omejitve

- Končni (skriti) testi naloge niso dostopni; preverjanje se opira na skupne teste izhodišča,
  razvojne primere D01–D04 in lastne teste.
- Zagon izhodišča pred spremembami (T001) ni bil izveden; izhodiščno stanje je dokumentirano
  v opisu naloge (funkcija vrstnega reda še ne obstaja).
- Testi se izvajajo prek Playwrighta; čistih enotnih testov za `src/taskOrder.ts` ni, zato se
  pravila preverjajo prek uporabniškega vmesnika (vključno z mejo 20 in robovi).
