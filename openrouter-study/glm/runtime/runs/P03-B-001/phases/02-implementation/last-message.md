**Implementacija**
- Dodano normalizirano, dobesedno večbesedno iskanje ter kombinirani filtra stanja in osebe: `src/App.tsx:13`, `src/App.tsx:36`.
- Oba pogleda uporabljata isti filtrirani seznam; dodan je status rezultatov, sporočili brez zadetkov in ponastavitev filtrov: `src/App.tsx:76`.
- Sledi obstoječemu Folio dizajnu, vključno z ozkoširinsko različico: `src/styles.css:66`.

**Preverjanje**
- Dodani 4 lastni testi za robne primere: `tests/agent/P03.spec.ts:3`.
- Razvojna testiranja: 8/8 uspešnih.
- `npm run check`: ESLint, tipi, gradnja in 50/50 testov uspešno.
- Zapisnik s sledljivostjo R01–R12 in omejitvami je v `docs/agent/verification.md:18`.

Specifikacijskih napak ali neizpolnjenih zahtev nisem opazil. Čas prevzame pregledovalec.
