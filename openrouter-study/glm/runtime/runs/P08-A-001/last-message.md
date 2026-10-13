**Rezultat**
- Implementiral koledarski pregled rokov R01–R12: čista koledarska aritmetika je v `src/dateGroups.ts:3`, stanje, števci, filtri in opozorila pa v `src/App.tsx:29`.
- Folio postavitev je prilagojena v `src/styles.css:51`.
- Specifikacija: `docs/agent/specification.md:1`; dejansko preverjanje: `docs/agent/verification.md:1`.
- Lastni testi: `tests/agent/p08.spec.ts:19`.

**Preverjanje**
- Končni `npm run check`: **53/53 uspešno** (38 izhodiščnih, 8 razvojnih P08, 7 lastnih).
- Ni neizpolnjenih zahtev. Neveljavni API datumi zunaj dane domene niso preverjeni in so dokumentirani kot omejitev.
- `apply_patch` v tem okolju ni bil dostopen, zato so bile spremembe zapisane neposredno v dovoljenih mapah.
