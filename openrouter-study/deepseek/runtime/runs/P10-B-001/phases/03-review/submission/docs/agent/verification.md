# Poročilo implementerja in preverjanj — P10

Vloga: implementer. Datum: 2026-10-09.
Vir zahtev: `task/instructions.md` R01–R12 in predana `docs/agent/specification.md` (v1.0).
Ta dokument se sproti dopolnjuje; na začetku so zapisani samo načrtovani koraki.

## Načrtovana preverjanja (pred izvedbo)

- [ ] P1: `npm run lint`, `npm run build` (slog, tipi, gradnja).
- [ ] P2: razvojni testi `npx playwright test --project=development-desktop --project=development-mobile` (D01–D04).
- [ ] P3: lastni testi v `tests/agent/` za R01–R12 (enaki naslovi, zaporedja U/R, 21 premikov, robna dejanja, 0/1 opravilo, stolpci table, pogledi/podrobnosti, menjava projekta, osvežitev, 390 pik, brez zapisov).
- [ ] P4: `npm run check` (38 osnovnih + 8 razvojnih + lastni).
- [ ] P5: zapis dejanskih rezultatov, povezav na kodo in omejitev v ta dokument.

## Načrtovane datoteke sprememb

- `src/useTaskOrder.ts` (nov): stanje P, sklada U in R, omejitev 20, dejanja premik/razveljavi/ponovi/začetni vrstni red.
- `src/App.tsx`: uporaba hooka, orodna vrstica, globalna mesta, gumbi v vrsticah.
- `src/TaskBoard.tsx`: globalna mesta in gumbi na karticah (zunaj povezave).
- `src/styles.css`: slog orodne vrstice in novih kontrol, 390 pik brez prelivanja strani.
- `tests/agent/P10.spec.ts`: lastni testi.
- `docs/agent/verification.md`: to poročilo.

## Dejanski rezultati

(izpolnjeno sproti med izvedbo)
