Implementacija je zaključena in preverjena; rezultati so shranjeni v `docs/agent/verification.md`.

**Spremembe**
- Nova logika stanja pogleda: `src/viewState.ts` (normalizacija, razčlenjevanje, gradnja query dela, filtriranje, stabilno urejanje) in kontrole `src/ViewFilters.tsx` (osnutek, Uporabi/Ponastavi pogled, `role=status`).
- `src/navigation.ts` bere/pisuje `q/status/order` in ohrani `view=board`; `src/App.tsx`, `src/TaskBoard.tsx`, `src/TaskDetails.tsx` ohranijo potrjeno stanje ob preklopu pogleda, podrobnostih in zapiranju; slog v `src/styles.css` (tudi 390 px).
- Lastni testi: `tests/agent/view-state.spec.ts` + `tests/agent/helpers.ts` (R01–R12).

**Preverjanje**
- `npm run check` (slog, tipi, gradnja, vsi testi): **58 uspešnih, 0 neuspešnih** — 38 osnovnih, 8 razvojnih D01–D04 (desktop + mobile) in 12 lastnih agentnih.
- Med izvajanjem so bili popravljeni le trije napačni pričakovani rezultati v mojih testih (izenačeni naslovi pri `title-desc`, osnutek po Naprej, vrstni red na tabli), ne koda.

**Omejitve (zapisane tudi v dnevniku)**: končni skriti testi niso dostopni; pri praznem rezultatu se v obeh načinih pokaže `Ni zadetkov.`, pri praznem projektu ostane izhodiščno stanje; tabla ohranja združevanje po stolpcih. Specifikacije in review datotek nisem spreminjal. Predajam pregledovalcu.
