# P03 — izvedba in preverjanje

Stanje: implementacija je zaključena; po popravku dveh agentnih pričakovanj teče ponovljeno skupno preverjanje.

## Izvedba

- Dodan `src/taskFilters.ts` za NFD-normalizacijo, dobesedno ujemanje vseh besed, sestavljene filtre in seznam oseb.
- V `src/App.tsx` dodani lokalni filtri, skupen rezultatni seznam, števci, rezultatni status in stanje brez zadetkov. `src/TaskBoard.tsx` že je sprejemal seznam opravil in jih razvrščal po stanju; uporabljen je brez sprememb.
- Dodani Folio slogi v `src/styles.css` in agentni Playwright scenariji v `tests/agent/P03.spec.ts`.

## Preverjanja

| Preverjanje | Izid |
| --- | --- |
| Prvi `npm run check` | Lint, tipizacija in gradnja so uspeli; 49/51 testov je uspelo. Dva nova scenarija sta pokazala, da se vse besede iščejo prek združenih polj in da Playwright rute ostanejo registrirane ob ponovni montaži. Popravil sem pričakovani zadetek in ločil prazen projekt v svoj scenarij. |
| Ponovljeni `npm run check` | V teku |

Preverjanja po R01–R12 so opredeljena v `tests/agent/P03.spec.ts`; po zagonu bodo spodaj navedeni dejanski izidi in morebitne omejitve.

## Dokazi

Rezultate lint/typecheck/build/test bom dodal sproti, z izidi po zahtevi R01–R12. Nedostopnih končnih testov ne bom navajal kot izvedenih.

## Omejitve

Za ročni brskalniški ogled je predviden `WEB_PORT=5193 API_PORT=3123 npm run dev`; preverjevalni Chromium se povezuje prek `task/browser.json` in `chromium.connect(wsEndpoint)`.
