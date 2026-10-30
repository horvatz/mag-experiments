**Rezultat**
- Implementiral sem nastavljiv izvoz CSV za R01–R12: nespremenljivi vrstni red stolpcev, filtri, ločila, UTF-8 BOM, CRLF, zaščita formul in lokalni prenos (`src/csvExport.ts:3`, `src/App.tsx:12`, `src/App.tsx:64`).
- Vmesnik ohranja obstoječe poglede in bralne API-je; nova postavitev sledi Folio dizajnu (`src/styles.css:66`).
- Dodal sem 5 lastnih Playwright preverjanj (`tests/agent/P06-agent.spec.ts:27`), vključno z odkrito in odpravljeno napako vrstnega reda stolpcev.
- Pripravil sem specifikacijo z zgodovino popravka (`docs/agent/specification.md:1`) in zapis dejanskih preverjanj (`docs/agent/verification.md:1`).
- `npm run check` je uspešen: ESLint, produkcijska gradnja in 51/51 Playwright testov.
- Neizpolnjenih zahtev ni. Omejitve so zapisane v `docs/agent/verification.md:29`.
