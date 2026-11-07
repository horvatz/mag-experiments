Korak `$speckit-plan` je opravljen.

**Opravljeno**
- Preveril `.specify/feature.json` (`docs/agent/P06`), ustavo in spec; pregledal dejansko kodo (`src/App.tsx`, `src/api.ts`, `src/useResource.ts`, `TaskBoard`, `styles.css`) ter razvojne primere `tests/development/P06.spec.ts` in pomočnik `helpers.ts`.
- Zapisal `docs/agent/P06/plan.md` (58 vrstic): tehnični kontekst (React 19 + TS 6 + Vite 8, Playwright projekti, Folio slog), skladnost z ustavo, ključne odločitve, tabele datotek, preverjanje in tveganja.

**Ključne odločitve**
- Čista serijalizacija v novi `src/csvExport.ts` (kanonične kolone, `filterRows`, `neutralizeFormula`, `serializeCsv` z BOM in CRLF tudi na koncu).
- Stanje izvoza v `ProjectView` (remount ob menjavi projekta ponastavi nastavitve), kontrole v skupni vrstici za oba pogleda (R10), gumb onemogočen, ko ni kolon ali ni filtriranih vrstic.
- Prenos prek Blob + `a[download="folio-<projectId>.csv"]`; brez `window.open` in brez zapisov na API.
- Lastni testi `tests/agent/p06-export.spec.ts` prek javnega pomočnika; preverjanje s `typecheck`, `lint`, projekti `agent`, `development-*`, `desktop/mobile/api`.

**Preverjanje**
- Struktura plana pregledana (`grep` naslovov); ne spreminjam infrastrukture ali obstoječih testov.
- `node task/time-budget.mjs`: 929 s preostanka v fazi.
