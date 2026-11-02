# P09 — Preverjanje izvedbe

Datum: 2026-11-02. Izvor zahtev: `docs/agent/P09/spec.md`, načrt: `docs/agent/P09/plan.md`,
naloge: `docs/agent/P09/tasks.md`. Končni zunanji testi niso bili dostopni in niso izvedeni.

## Pregled

| Preverjanje | Ukaz | Izid |
| --- | --- | --- |
| Tipi | `npm run typecheck` | uspelo (0 napak) |
| Slog | `npm run lint` | uspelo (0 napak) |
| Gradnja | `npm run build` (znotraj `npm run check`) | uspelo |
| Ciljni lastni testi | `npx playwright test tests/agent` | 11 uspelih |
| Razvojni primeri P09 | `npx playwright test tests/development/P09.spec.ts` | 8 uspelih (D01–D04 × desktop/mobile) |
| Skupno | `npm run check` | 57 uspelih, 0 neuspelih |

## Sledljivost zahtev

| Zahteva | Dokaz (test v `tests/agent/p09.spec.ts`) | Izid |
| --- | --- | --- |
| R01 | R01/R04: neposredne povezave s parametri in brez njih | uspelo |
| R02 | R02: ena fraza, NFD/Unicode, ločila, trim | uspelo |
| R03 | R03: q IN status, naslov naraščajoče/padajoče, izenačenja | uspelo |
| R04 | R01/R04: neznani in ponovljeni parametri, brez prepisa URL-ja | uspelo |
| R05 | R05/R06: osnutek ne spremeni prikaza; ena vstopnica ob potrditvi | uspelo |
| R06 | R05/R06: obrezovanje, izpust privzetih, ohranjen `view=board`, brez podvojenih vstopnic | uspelo |
| R07 | R07/R08: Nazaj/Naprej/osvežitev obnovijo potrjeno stanje | uspelo |
| R08 | R07/R08 in R09: preklop pogleda ohrani ID-je; osnutek se zavrže | uspelo |
| R09 | R09: podrobnosti in Escape ohranijo parametre; enaki naslovi po ID-ju | uspelo |
| R10 | R10: menjava projekta privzeto; neposredna povezava s parametri | uspelo |
| R11 | R11 (2 testa): ponastavitev, "Ni zadetkov.", števec, prazni podatki | uspelo |
| R12 | R12 in mobile: brez zapisov, brez `localStorage`, 390 px, neznana pot | uspelo |

Dokaz: celoten izpis `npm run check` z dne 2026-11-02 — 57 uspelih, 0 neuspelih
(api + 38 osnovnih + 8 razvojnih + 11 lastnih).

## Spremembe

- Novo: `src/viewState.ts` (razčlenitev/normalizacija/filtriranje/sestavljanje URL-ja),
  `src/ViewControls.tsx`, `tests/agent/p09.spec.ts`.
- Spremenjeno: `src/navigation.ts`, `src/App.tsx`, `src/TaskBoard.tsx`,
  `src/TaskDetails.tsx`, `src/styles.css`.
- Dokumenti: `docs/agent/verification.md` (ta datoteka), sledljivost v `spec.md`,
  označene naloge v `tasks.md`.
- Infrastruktura, odvisnosti, strežnik in skupni testi ostajajo nespremenjeni.

## Omejitve in nepreverjeni deli

- Končni zunanji testi niso dostopni; navedeni dokazi so lokalni (`npm run check`).
- Navigacije med nezaključenim nalaganjem in sočasne spremembe podatkov brez osvežitve
  niso bile preverjene (izven obsega zahtev).
- Preverjanje je bilo izvedeno v Chromiumu prek `chromium.connect` iz `task/browser.json`.
