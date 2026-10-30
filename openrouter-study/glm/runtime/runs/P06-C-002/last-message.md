Opravljeno: implementiral sem nastavljiv izvoz CSV za P06.

- Izvoz, filtri, kolone, ločila, UTF-8 BOM in nevtralizacija formul: `src/csvExport.ts:1`
- Kontrole in stanje izvoza v obstoječem vmesniku: `src/App.tsx:21`
- Folio slog in ozka postavitev: `src/styles.css:114`
- Lastni testi za R01–R12: `tests/agent/csv-export.spec.ts:1`
- Sledljivost zahtev: `docs/agent/P06/spec.md:72`
- Preverjanja in izidi: `docs/agent/P06/verification.md:1`
- Vse naloge T001–T009 so opravljene: `docs/agent/P06/tasks.md:5`

Preverjanja:
- `npm test -- tests/agent/csv-export.spec.ts`: 9/9 uspešnih.
- `npm run check`: lint, typecheck, build in Playwright 55/55 uspešnih.

Preostanek skupnega časa: `394` sekund.
