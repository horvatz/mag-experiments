**Rezultat**
- Specifikacija R01–R12 je pripravljena v `docs/agent/specification.md:1`.
- Implementirano je parsiranje hash URL-ja, normalizacija iskanja, filtriranje, urejanje, osnutek kontrol in zgodovina v `src/navigation.ts:23` ter `src/App.tsx:11`.
- Povezave na tabli in podrobnosti ohranjajo potrjen pogled v `src/TaskBoard.tsx:26` in `src/TaskDetails.tsx:12`; Folio slog je dopolnjen v `src/styles.css:56`.
- Dodani so lastni testi `tests/agent/P09-agent.spec.ts:11`.

**Preverjanje**
- `npm run check`: 50/50 uspešno (14 API, 24 izhodiščnih namiznih/mobilnih, 8 razvojnih P09, 4 lastni).
- Razvojni testi: 8/8 uspešno; lastni testi: 4/4 uspešno.
- Dejanski pregledi, sledljivost in omejitve so zapisani v `docs/agent/verification.md:1`.
- Neizpolnjenih zahtev ni.
