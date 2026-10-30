# P07 — preverjanje in dokazi

Korak: implementacija (30. 10. 2026). Okolje: `npm run check` (eslint, tsc + vite
build, Playwright; strežnik 5174/3102, Chromium prek `wsEndpoint` iz `task/browser.json`).
Nedostopnih končnih testov ne navajamo kot izvedenih.

## Izvedena preverjanja

- `npm run lint` — uspešno (brez opozoril).
- `npm run typecheck` — uspešno.
- `npx playwright test tests/agent/p07-favorites.spec.ts --project=agent` — prvi zagon
  12/13; napaka je bila v predpostavki testa P07-R11 (sintetični dogodek `storage` sam ne
  spremeni shrambe), test popravljen, aplikacijska koda nespremenjena; drugi zagon 13/13.
- `npm run check` — 59 uspešnih, 0 padlih (24,3 s): 38 osnovnih (api + baseline desktop in
  mobile), 8 razvojnih P07 (desktop in mobile) ter 13 lastnih (projekt `agent`).

## Sledljivost zahtev

| Test | Zahteve | Izid |
| --- | --- | --- |
| P07-R01 | R01 | uspešno |
| P07-R02 | R02 | uspešno |
| P07-R03 | R03 | uspešno |
| P07-R04 | R04 | uspešno |
| P07-R05 | R05 | uspešno |
| P07-R06 | R06 | uspešno |
| P07-R07 | R07 | uspešno |
| P07-R08 | R08 | uspešno |
| P07-R09 | R09 | uspešno |
| P07-R10 | R10 | uspešno |
| P07-R11, P07-R11b | R11 | uspešno |
| P07-R12 + skupni testi | R12 | uspešno |

Podrobna tabela pogojev, kode in dokazov je v `docs/agent/P07/spec.md` (Izvedba in
sledljivost). Datoteke: `src/favorites.ts`, `src/useFavorites.ts`, `src/App.tsx`,
`src/TaskBoard.tsx`, `src/components.tsx`, `src/styles.css`; testi v
`tests/agent/p07-favorites.spec.ts` in `tests/agent/helpers.ts`.

## Omejitve

- T001 (začetni posnetek pred spremembami) ni bil zajet; po spremembah so vsi osnovni in
  razvojni testi uspešni, torej izhodiščno vedenje ostaja nespremenjeno.
- Ročni pregled v brskalniku (WEB_PORT=5193 API_PORT=3123) ni bil izveden; preverjanje je
  potekalo z avtomatiziranimi testi (Desktop Chrome, ozki prikaz 390 pik v P07-R12).
- Končni ocenjevalni testi niso dostopni; navedeni so le dejansko izvedeni testi.
- Aplikacija ne uporablja testnih kontrol `/__test/` (preverjeno v P07-R12).
