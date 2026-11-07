Načrt je zapisan v `docs/agent/P04/plan.md`.

**Ključno**
- Tehnični kontekst: obstoječi React 19 + TS + Vite, samo branje prek `/api/`, Playwright s projektom `agent`; brez novih odvisnosti in sprememb infrastrukture.
- Odločitve: čista logika v `src/sorting.ts` (normalizacija NFD → odstranitev U+0300–U+036F → male črke, primerjava z `<`/`>`, stabilno urejanje, smer obrne le izid primerjave), kontrole v `src/SortControls.tsx` z dostopnimi imeni `Primarni ključ`, `Primarna smer`, `Sekundarni ključ`, `Sekundarna smer` in gumbom `Izvorni vrstni red`, stanje σ v `ProjectView` (obstoječi `key={project.id}` samodejno pokrije R09).
- Datoteke: `src/sorting.ts` (novo), `src/SortControls.tsx` (novo), `src/App.tsx`, `src/TaskBoard.tsx`, `src/styles.css`, lastni testi v `tests/agent/`.
- Preverjanje: `lint`, `build`, `npm test`; izidi se vpišejo v sledljivost `spec.md` šele po dejanskem zagonu.

Razvojni primeri potrjujejo pričakovane vrstne rede (npr. `alfa 10` pred `alfa 2`, `Čas …` → `cas …`) — uporabljeni so le kot referenca. Preostanek: ~1030 s.
