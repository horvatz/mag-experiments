# P09: zapis preverjanja

Datum: 2026-11-01. Okolje: lokalni Chromium prek `task/browser.json`
(`chromium.connect`), strežnik Playwright na 5174/3102, `MOCK_CONTROL=1`.

## Izvedena preverjanja

1. `npm run typecheck` (del `npm run check`) — uspešno, brez napak.
2. `npm run lint` (ESLint, del `npm run check`) — uspešno, brez opozoril.
3. `npm run build` (Vite, del `npm run check`) — uspešno.
4. `npm run check` (lint + build + vsi testi) — **57 preverjanj uspešnih**:
   - 14 API (`tests/api.spec.ts`), 24 baseline (desktop + mobile),
   - 8 razvojnih P09 (`tests/development/P09.spec.ts`, D01–D04 × 2 projekta),
   - 11 lastnih (`tests/agent/P09.spec.ts`, A01–A11).
5. Ločeno pred tem: `npx playwright test --project=development-desktop
   --project=development-mobile` (8/8) in `npx playwright test --project=agent`
   (11/11).

## Sledljivost zahtev

| Zahteva | Dokaz | Izid |
| --- | --- | --- |
| R01 | D01, A01, A08, A10 | uspešno |
| R02 | A02 (case/NFD, fraza kot podniz), A03 (description, assignee, id) | uspešno |
| R03 | D01, A04 (title-asc/desc, stabilna izenačenja), A07 (status IN q) | uspešno |
| R04 | A01 (neznane/ponovljene vrednosti, neznani parametri, URL nespremenjen) | uspešno |
| R05 | D02, A05 (osnutek šele ob potrditvi) | uspešno |
| R06 | A05 (brez dvojnega stanja), A06 (view=board, odstranitev `foo`) | uspešno |
| R07 | D03, A07 (Nazaj/Naprej + osnutek), A08 (osvežitev) | uspešno |
| R08 | A08 (preklop zavrže osnutek in obdrži potrjeno), D03 | uspešno |
| R09 | A09 (Escape in gumb ohranita parametre, ID pri enakih naslovih), baseline 24/50 | uspešno |
| R10 | A10 (privzeti pregled ob klika, neposredna povezava s parametri) | uspešno |
| R11 | D04, A11 (ponastavitev, `Prikazano: N od M.`, `Ni zadetkov.`) | uspešno |
| R12 | D04 + A11 (`readonly`, `saveRequests=0`, prazno `localStorage`), baseline 38/38 | uspešno |

## Dokazi iz dnevnikov

- `npm run check`: `57 passed (20.8s)`; med njimi D01–D04 dvakrat (desktop in
  mobile) ter A01–A11 v projektu `agent`.
- Osvežitev D03 preveri `status=done` po `page.reload()`; A07 preveri oba
  smeri brskalnika; A09 preveri `status` in `order` v URL-ju po zaprtju.
- D04 in A11 uporabita `readonly`, ki preveri nič zapisov, `saveRequests: 0`
  in da širina dokumenta ne presega okna (tudi na mobilnem profilu v D04).

## Omejitve in nepreverjeni deli

- Skritih končnih testov naloge ni bilo mogoče zagnati; zato so bili poleg
  razvojnih testov dodani lastni testi A01–A11 za robne primere R01–R12.
- Sočasnih sprememb podatkov med nalaganjem in prekinjenih navigacij nismo
  širili (skladno z navodili).
- Prazno opravilo brez aktivnih filtrov ohrani izhodiščni prikaz; preverjeno
  posredno z baseline testoma 22 in 38, ne z lastnim testom.
- Normalizacija je preverjena s primeri `Živa`/`ziva` in frazo z več besedami;
  nista preverjena vsak posamezen znak U+0300–U+036F niti Unicode primeri
  zunaj uporabljenih vzorcev.
- Neposredna povezava na opravilo s parametri (`#/projects/web/tasks/web-06?status=done`)
  ni bila ločeno testirana; pokrite so neposredna povezava brez parametrov
  (baseline 17) in odpiranje/zapiranje iz filtriranega seznama (A09).

## Zgodovina sprememb specifikacije

- 2026-11-01: prva različica; po prvem zagonu razvojnih testov ni bilo
  potrebnih sprememb specifikacije. Razlaga praznega stanja je bila v
  specifikacijo dodana že pred implementacijo (ohranjen izhodiščni prikaz
  praznega projekta zaradi regresijskih zahtev).
