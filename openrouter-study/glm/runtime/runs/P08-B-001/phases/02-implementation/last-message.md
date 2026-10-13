**Implementacija zaključena**
- Dodan čist koledarski pripomoček za R01–R05: `src/dueDates.ts:3`.
- Dodani referenčni datum, pet števcev, filtri in prazna stanja: `src/App.tsx:14`.
- Ohranjena sta obstoječi Folio zasnova in bralni API; prilagojen je tudi prikaz: `src/styles.css:51`.
- Lastni testi pokrivajo datum meje, klasifikacijo, števce, filtre, reset, bralnost in širino 390 px: `tests/agent/P08.spec.ts:4`.
- `npm run check`: uspešno — 51/51 testov.
- `npx playwright test --project=development-desktop --project=development-mobile`: 8/8 uspešno.
- Ni zaznane napake v specifikaciji; nedostopnih končnih testov ni navajanih kot uspešnih.
- Celotna evidence je v `docs/agent/verification.md:1`.

Čas prevzame pregledovalec.
