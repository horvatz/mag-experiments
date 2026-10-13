Načrt je zapisan v `docs/agent/P06/plan.md`.

**Opravljeno**
- Tehnični kontekst: React 19.3 + TS 6 + Vite 8, obstoječe odvisnosti, API prek `useResource`, brez novih odvisnosti.
- Odločitve: čista logika v `src/csv.ts` (fiksni vrstni red kolon, nevtralizacija formul, navedba, BOM + CRLF, prenos prek Blob/object URL), kontrolniki v `src/ExportControls.tsx`, vgradnja v `src/App.tsx`, minimalni slogi v `src/styles.css`.
- Stanje izvoza z `key={project.id}`: preklop pogleda ga ohrani (R10), menjava projekta/osvežitev ponastavi (R11), filtriranje vpliva le na izvoz (R04).
- Testi: `tests/agent/export.spec.ts` z referenčnimi pomožnimi funkcijami iz `tests/development/helpers.ts` (samo branje); dokazi se vpisujejo v `spec.md`.
- Seznam datotek, preverjanje (`typecheck`, `lint`, `build`, lastni in skupni testi) ter tveganja.

**Preostanek**: 555 s do roka faze; korak končan v ~1,5 minute. Naslednji korak je lahko `$speckit-tasks`.
