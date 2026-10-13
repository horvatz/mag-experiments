Implementacija in preverjanje sta zaključena; čas prevzame pregledovalec.

**Opravljeno**
- `src/App.tsx`: iskanje (NFD normalizacija č/š/ž, dobesedni podnizi, vse besede), filtra stanja in osebe z logiko IN, izbirnik oseb iz celega projekta, `Počisti filtre`, `Prikazano: N od M.`, `Ni zadetkov.`, privzetki in ponastavitev ob menjavi projekta, brez URL/shrambe; pregled stanj, značka, noga in oba pogleda štejejo vidne zadetke.
- `src/styles.css`: filtrna vrstica z ovijanjem, prilagoditve za 390 px.
- `tests/agent/filters.spec.ts`: 9 lastnih testov za R01–R12.
- `docs/agent/verification.md`: načrt, povezave zahtev s kodo/testi, dejanski rezultati, omejitve.

**Rezultati**
- `npm run typecheck`, `npm run lint`, `npm run build`: uspešno.
- Razvojni testi 8/8, lastni 9/9 (17/17 v 7,3 s).
- Osnovni testi 38/38 (12,9 s); skupno 55/55.
- V `src/` ni testnih kontrol, zapisovalnih klicev ali trajne shrambe; napak v specifikaciji nisem našel.
