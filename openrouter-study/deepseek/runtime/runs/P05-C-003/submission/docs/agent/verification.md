# Preverjanje P05

Izvedeno 2026-10-30 v tem repozitoriju. Vsa navedena preverjanja so bila dejansko izvedena; končni (skriti) testi izvajalca niso bili na voljo.

## Okolje

- Aplikacija Folio: React 19.3, TypeScript 6, Vite 8; brez novih odvisnosti.
- Playwright 1.63 prek obstoječega brskalnika (`task/browser.json`, `chromium.connect`); strežnik `npm run dev` na 5174/3102.
- Spremenjene datoteke: `src/pagination.ts` (nova), `src/PaginationControls.tsx` (nova), `src/App.tsx`, `src/styles.css`, `tests/agent/p05.spec.ts` (nova), dokumenti v `docs/agent/`.

## Rezultati

| Korak | Ukaz | Izid |
| --- | --- | --- |
| Slog | `npm run lint` | uspešno, brez opozoril |
| Tipi | `npm run typecheck` | uspešno |
| Osnovni in API testi | `npx playwright test tests/baseline.spec.ts tests/api.spec.ts` | 38/38 uspešno (desktop, mobile, api) |
| Razvojni P05 | `npx playwright test tests/development/P05.spec.ts` | 8/8 uspešno (D01–D04, desktop in mobile) |
| Lastni testi | `npx playwright test tests/agent/` | 13/13 uspešno (R01–R12) |
| Skupno | `npm run check` | uspešno: lint, typecheck, build in 59/59 testov |

## Sledljivost zahtev

| Zahteva | Test (`tests/agent/p05.spec.ts`) | Izid |
| --- | --- | --- |
| R01 | R01: privzeto stanje all/all in izvorni vrstni red | uspešno |
| R02 | R02: strani 2/5/10 so zaporedni odseki brez izgube ali podvajanja ID-jev | uspešno |
| R03 | R03: navigacija in robovi | uspešno |
| R04 | R04: sprememba velikosti vedno vrne na prvo stran | uspešno |
| R05 | R05: filter pred straničenjem in vrnitev na prvo stran | uspešno |
| R06 | R06: preglednica in tabla kažeta isti odsek | uspešno |
| R07 | R07: preklop pogleda in podrobnosti ohranijo stanje | uspešno |
| R08 | R08: menjava projekta in osvežitev ponastavita stanje | uspešno |
| R09 | R09: besedilo statusa pri nepraznem rezultatu | uspešno |
| R10 | R10a: prazen projekt; R10b: prazen rezultat filtra in odstranitev filtra | uspešno |
| R11 | R11: pregled stanj in števci stolpcev | uspešno |
| R12 | R12: brez zapisov, povezave in podrobnosti ostanejo, 390 px | uspešno |

## Omejitve

- Končni testi izvajalca niso bili dostopni; tu so navedeni le dejansko izvedeni testi.
- Med nezaključenim nalaganjem in ob sočasnih spremembah podatkov veljajo obstoječe regresijske zahteve; novih pravil ni bilo dodanih.
- Repo nima ločenega tekača enotnih testov; čista logika `src/pagination.ts` je preverjena posredno prek UI scenarijev v Playwrightu.
