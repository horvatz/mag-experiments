**Rezultat**
- Specifikacija za R01–R12 je v `docs/agent/specification.md:1`.
- Koledarski filter, pet števcev, preračun datumov in ohranjanje stanja sta implementirani v `src/App.tsx:14` in `src/due.ts:16`.
- Folio slog kontrol je dodan v `src/styles.css:50`.
- Lastno Playwright pokritje meja, števcev, ponastavitve, bralnosti in širine 390 px je v `tests/agent/P08.spec.ts:53`.

**Preverjanje**
- `npm run check` je uspešno končal z **47/47 preverjanji**.
- Dejanski potek, rezultati, sledljivost R01–R12 in omejitve so zapisani v `docs/agent/verification.md:1`.
- Neizpolnjenih zahtev ni.
