Korak `$speckit-plan` je opravljen.

**Izdelek**
- `docs/agent/P07/plan.md` (66 vrstic) — jedrnat Lean načrt:
  - **Tehnični kontekst**: React 19 + TS + Vite, obstoječi API, Playwright projekt `agent` za `tests/agent/**`, brez novih odvisnosti.
  - **Odločitve**: čisto jedro `src/favorites.ts` (ključ `folio:favorites:v1`, validacija/normalizacija/serijalizacija), hook `src/useFavorites.ts` z `useSyncExternalStore` (lenobno branje brez prepisa, `try/catch`, poslušalec `storage` brez povratnega zapisa, napake v pomnilniku + `role=alert`), enotno stanje za oba pogleda, filter v `ProjectView` z `key={project.id}` (menjava projekta/osvežitev ⇒ `false`), vmesniške kontrole po dogovoru, gumbi zunaj povezav, števci stolpcev iz vidnih opravil, brez API zapisov.
  - **Datoteke**: nove `src/favorites.ts`, `src/useFavorites.ts`, `tests/agent/favorites.spec.ts`; spremembe v `src/App.tsx`, `src/TaskBoard.tsx`, `src/styles.css`; vpis dokazov v `spec.md`.
  - **Faze**: jedro+hook → UI → lastni testi → skupni testi → dokazi in predaja.
  - **Tveganja**: simulacija `StorageEvent`, izjema shrambe prek `addInitScript`, ozek pogled 390 px.

**Opombe**
- Upoštevana ustava (meje sprememb, API, Folio, dokazila); brez podvajanja specifikacije — načrt se nanjo sklicuje.
- Proračun: porabljenih ~40 s v tem koraku, skupno ostaja 896 s.
