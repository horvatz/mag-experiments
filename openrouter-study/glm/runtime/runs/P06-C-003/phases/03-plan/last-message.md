Načrt P06 je pripravljen v `docs/agent/P06/plan.md:1`.

- Vsebuje tehnični kontekst, arhitekturo, relevantne datoteke, korake izvedbe in mejnike.
- Načrtuje čisto izvozno logiko v `src/export.ts`, kontrole v `src/CsvExportControls.tsx`, integracijo v `src/App.tsx` ter Folio stile v `src/styles.css`.
- Predvideva agentove Playwright teste v `tests/agent/P06/export-csv.spec.ts` za R01–R12.
- Ne dodaja odvisnosti in ne spreminja strežnika, tipov, infrastrukture ali obstoječih testov.
- Testov nisem zaganjal, ker ta korak spreminja samo načrt.
- Preostanek proračuna: `792 s`.
