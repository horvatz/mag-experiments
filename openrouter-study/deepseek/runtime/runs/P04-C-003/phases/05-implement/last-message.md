Izvedba je končana in preverjena.

**Rezultat**
- `npm run check` uspešno: slog, tipi, gradnja in **60/60 preverjanj** (api 14, osnovni desktop 12, mobile 12, razvojna P04 8, lastni agent testi 14).
- Vseh 10 nalog v `docs/agent/P04/tasks.md` je označenih `[x]`; med izvedbo je bil en neuspeh lastnega testa R05 (napačno pričakovano zaporedje `dva`/`ena`), pričakovanje je bilo popravljeno in ponovni zagon je uspel.

**Spremembe**
- `src/sorting.ts` (novo): `norm`, `compareKey`, `sortTasks`, tipi in `DEFAULT_SORT`; stabilnost, `original` vrne izvorni vrstni red, smer obrne le izbrani ključ.
- `src/SortControls.tsx` (novo): štirje označeni selecti in gumb `Izvorni vrstni red`; `src/App.tsx`: stanje, projekcija `sortedTasks`, tabela in tabla; `src/styles.css`: Folio slogi kontrol z notranjim drsenjem pri 390 pikah.
- `tests/agent/p04-sort.spec.ts` (novo): 14 testov za R01–R12; `docs/agent/verification.md` (novo) s povzetkom in sledljivostjo; `docs/agent/P04/spec.md` z izidi v preglednici sledljivosti.

**Omejitve**
- Skritih končnih testov izvajalca ni bilo mogoče pognati; niso navedeni kot izvedeni.
- Strežnik, `shared/`, skupni testi, odvisnosti in nastavitve niso bili spremenjeni; vej in commitov ni.
