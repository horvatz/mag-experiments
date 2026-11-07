Korak `$speckit-specify` je opravljen.

**Rezultat**
- `docs/agent/P03/spec.md` (109 vrstic) po skupni predlogi: problem in kontekst, vhodi/dejanja/izidi z dogovorom o vmesniku in scenariji P1–P4, zahteve in pravila s simboli (`T`, `M`, `F`, `norm`, `joined`, `words`, `match`, `visible`) in tabelo R01–R12 s sprejemnimi pogoji ter načinom preverjanja.
- Pravila sprememb stanja so zajeta: privzeto stanje, ponastavitev ob preklopu projekta/osvežitvi, počistitev filtrov, ohranitev filtrov ob preklopu pogleda.
- Tabela izvedbe in sledljivosti je pripravljena z načrtovanimi scenariji; izidi so označeni kot „ni še izvedeno“ in se vpišejo šele po dejanskem preverjanju.
- `.specify/feature.json` je nastavljen na `{"feature_directory": "docs/agent/P03"}` (pot je bila podana vnaprej, zato vprašanje ni bilo potrebno).
- Brez novih funkcionalnih zahtev ali zunanjih meritev; brez posegov v kodo, teste in infrastrukturo.
