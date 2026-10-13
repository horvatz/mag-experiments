**Rezultat**
- Specifikacijo s predikati in sledljivostjo R01–R12 pripravil v `docs/agent/specification.md:1`.
- Dodal fiksni referenčni datum, UTC koledarsko logiko, šest skupin, pet števcev, opozorilo za prazen datum in enoten filter v `src/App.tsx:21` ter `src/deadlines.ts:3`.
- Prilagodil Folio postavitev in preveril širino 390 px v `src/styles.css:51`.
- Dodal 7 lastnih preverjanj v `tests/agent/P08.spec.ts:5`.

**Preverjanje**
- `npm run check`: uspešno, 53/53 Playwright preverjanj.
- `npm run lint`: uspešno; produkcijska izgradnja uspešna.
- Dejanske rezultate in omejitve zapisal v `docs/agent/verification.md:1`.
- Neizpolnjenih zahtev ni; končni zunanji primeri niso bili dostopni.
