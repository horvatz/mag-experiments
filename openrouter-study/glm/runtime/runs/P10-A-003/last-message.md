**Rezultat**
- Implementiran je globalni lokalni vrstni red z razveljavitvami, ponovitvami, mejo 20 korakov in povratkom na izhodišče: `src/App.tsx:19`, `src/App.tsx:35`, `src/App.tsx:95`.
- Preglednica prikazuje globalna mesta, tabla pa globalne premike zunaj povezave kartice: `src/TaskBoard.tsx:13`, `src/TaskBoard.tsx:26`.
- Dodan je prilagodjeni Folio slog: `src/styles.css:65`.
- Lastni testi pokrivajo zgodovino, robne primere, prazen/enoopravilen projekt, preklope, osvežitev, odsotnost zapisov in širino 390 px: `tests/agent/P10.spec.ts:1`.
- Specifikacija s sledljivostjo R01–R12: `docs/agent/specification.md:1`.
- Dejanska preverjanja in omejitve: `docs/agent/verification.md:1`.

**Preverjanje**
- `npm run check`: uspešno; lint, build/typecheck in Playwright.
- Playwright: 53/53 uspešnih (14 API, 24 izhodiščnih, 8 razvojnih, 7 lastnih).
- Neizpolnjenih zahtev ni. Preverjanje je omejeno na lokalni namenski Chromium.
