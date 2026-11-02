**Rezultat**
- Implementiral sem lokalni vrstni red, razveljavitve, ponovitve in reset v `src/App.tsx:12`.
- Dodal sem globalna mesta in gumba za premik v `src/TaskOrderControls.tsx:15`, vključno z besedilnim statusom in onemogočenimi robnimi dejanji.
- Tabla ohranja stalne stolpce stanj, prikazuje globalna mesta in uporablja globalnega soseda v `src/TaskBoard.tsx:31`.
- Slog sem dopolnil v `src/styles.css:66`.
- Specifikacija: `docs/agent/specification.md:1`; poročilo o preverjanju: `docs/agent/verification.md:1`.
- Lastni testi pokrivajo vrstni red, zgodovino, reset, tablo, podrobnosti, menjava projekta, osvežitev ter prazen/enoopravilni projekt: `tests/agent/p10-order.spec.ts:3`.

**Preverjanje**
- `npx playwright test --project=agent`: 9/9 uspešno.
- Skupni razvojni testi: 8/8 uspešno.
- `npm run check`: 55/55 uspešno.
- Neizpolnjenih zahtev R01–R12 ni.
