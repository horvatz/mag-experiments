Korak `$speckit-specify` je opravljen.

**Opravljeno**
- `.specify/feature.json` → `{"feature_directory": "docs/agent/P06"}` (pot je bila že določena, vprašanje ni bilo potrebno).
- `docs/agent/P06/spec.md` (110 vrstic) po skupni predlogi: problem in kontekst s scenariji in kriteriji uspešnosti; vhodi/dejanja/izidi s simboli, pravili sprememb stanja in kanonično serijalizacijo CSV; tabela R01–R12 s pravili in načinom preverjanja; prazna tabela sledljivosti za dokaze med izvedbo; omejitve in zgodovina sprememb.
- Izraženi predikati: `enabled ≡ C ≠ ∅ ∧ R(P,F) ≠ ∅`, `R(P,F)`, nevtralizacija formul `U+0027 + s` pod pogoji, CRLF tudi za zadnjo vrstico, BOM U+FEFF, kanonični vrstni red `K` neodvisen od klikov.

**Preverjanje**
- Struktura in vsebina pregledani (`grep`, `tail`), popravljena ena escape napaka v pravilu odizbora kolone.
- Brez novih funkcionalnih zahtev ali zunanjih meritev; dokazi med izvedbo se vpišejo v tabelo sledljivosti (prazna polja niso označena kot uspešna).
- `node task/time-budget.mjs`: 1003 s preostanka v fazi.
