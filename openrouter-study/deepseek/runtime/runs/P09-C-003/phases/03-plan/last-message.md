Korak `$speckit-plan` je opravljen.

**Opravljeno**
- Naložil kontekst: `.specify/feature.json` → `docs/agent/P09`, ustava, `spec.md`; pregledal obstoječo kodo (`navigation.ts` hash-routing prek `useSyncExternalStore`, `App.tsx`, `TaskBoard`, `TaskDetails`, `useResource`, testni pomočnik `tests/development/helpers.ts`).
- Zapisal `docs/agent/P09/plan.md` (88 vrstic, v0.1, 2026-11-02):
  - **Tehnični kontekst**: React 19/TS 6/Vite 8 brez usmerjevalnika, Playwright 1.63 s projektom `agent`, samo bralni `/api/`, brez novih odvisnosti in `localStorage`.
  - **Odločitve**: nova čista logika `src/viewState.ts` (`parseViewParams`, `normalize`, `matchesQuery`, `filterTasks`, `buildHash`); dopolnjen `navigation.ts` (`useRoute` s `params`, `navigate()` z `pushState` + ročni `hashchange`, ker `pushState` sam ne sproži dogodka); `ViewControls.tsx` z osnutkom in gumbi Uporabi/Ponastavi; integracija v `App.tsx`; prenos parametrov v povezave in `TaskDetails` (R09); slog v `styles.css`; testi `tests/agent/p09.spec.ts` (po potrebi `p09-mobile.spec.ts`).
  - **Datoteke, preverjanje, tveganja**: seznam spremenjenih/novih datotek, koraki `typecheck`/`lint`/`npx playwright test tests/agent`/`tests/development/P09.spec.ts`/`npm test`, omejitve iz specifikacije.

Ni sprememb infrastrukture, odvisnosti ali dizajna. Preostanek proračuna ~900 s od 966 s. Naslednji korak (`$speckit-tasks`) sproži izvajalnik.
