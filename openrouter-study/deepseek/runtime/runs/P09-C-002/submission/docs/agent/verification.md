# Preverjanje P09

Datum: 2026-11-01. Okolje: Node 24.11.1, Chromium prek Playwright
(`task/browser.json`, `chromium.connect`). Porti: 5174 (aplikacija) in 3102
(API). Lastni testi: `tests/agent/P09.spec.ts`. Sledljivost R01–R12 je v
`docs/agent/P09/spec.md`.

## Potek preverjanja

1. `npm run typecheck` – rezultat: se zabeleži ob izvedbi.
2. `npm run lint` – rezultat: se zabeleži ob izvedbi.
3. `npm run build` – rezultat: se zabeleži ob izvedbi.
4. Razvojni primeri P09 (`development-desktop`, `development-mobile`) –
   rezultat: se zabeleži ob izvedbi.
5. Skupni testi (`api`, `desktop`, `mobile`) – rezultat: se zabeleži ob
   izvedbi.
6. Lastni testi (`agent`) – rezultat: se zabeleži ob izvedbi.

## Rezultati

| Preverjanje | Ukaz | Izid |
| --- | --- | --- |
| Tipi | `npm run typecheck` | uspešno (brez napak) |
| Slog | `npm run lint` | uspešno (brez opozoril) |
| Gradnja | `npm run build` | uspešno |
| Razvojni P09 | `npx playwright test tests/development/P09.spec.ts` | 8 uspešnih (D01–D04 na `development-desktop` in `development-mobile`) |
| Skupni | `npx playwright test tests/baseline.spec.ts tests/api.spec.ts` | 38 uspešnih (`api`, `desktop`, `mobile`) |
| Lastni | `npx playwright test tests/agent/P09.spec.ts` | 15 uspešnih (`agent`) |
| Skupaj | `npm run check` | 61 uspešnih, 0 neuspešnih |

Prvi celotni zagon je odkril regresijo: prazen projekt v pogledu Tabla je
namesto treh stolpcev prikazal sporočilo praznega projekta (skupna testa
`baseline`). Popravljeno v `src/App.tsx` (tabla se izriše tudi pri nič
opravilih); končni zagon je v celoti uspešen.

## Omejitve

- Končni zunanji testi niso dostopni; niso izvedeni in se ne navajajo kot
  uspešni.
- Navigacije med nezaključenim nalaganjem in sočasne spremembe podatkov brez
  osvežitve niso del obsega P09.
- Dokazila so imena testov in dnevnik zagona; posnetki se hranijo v
  `test-results/`.
