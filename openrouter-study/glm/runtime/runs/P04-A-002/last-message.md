**Rezultat**
- Implementiral sem stabilno dvoključno razvrščanje z normalizacijo NFD/diakritike, statusnim in datumskim vrstnim redom v `src/sorting.ts:19` in `src/sorting.ts:48`.
- Dodal sem štiri kontrole, gumb za ponastavitev in projekcijo razvrščenega polja v `src/App.tsx:13` ter `src/App.tsx:49`.
- Tabla ohranja stalne stolpce in relativni vrstni red v `src/TaskBoard.tsx:13`; prilagodljiv videz je v `src/styles.css:66`.
- Specifikacija je v `docs/agent/specification.md:1`, dejanski preverjanji pa v `docs/agent/verification.md:1`.
- Lastna preverjanja: `tests/agent/sorting.spec.ts:16` in `tests/agent/P04.spec.ts:57`.

**Preverjanje**
- `npm run check`: uspešno, 49/49 testov.
- Razvojni testi P04: uspešno, 8/8.
- Neizpolnjenih zahtev ni. Končnih/zaključnih testov v tem okolju ni bilo na voljo in niso navajani kot izvedeni.
