Korak `$speckit-specify` je opravljen.

**Izdelki**
- `docs/agent/P05/spec.md` — specifikacija P05 po skupni predlogi (79 vrstic): problem in kontekst, vhodi/dejanja/izidi z robnimi primeri, pravila R01–R12 s predikati (simboli `T`, `F`, `N`, `s`, `p`, `Y`, `S`, `A`, `B`) in tabela sledljivosti (načrtovani scenariji, dokazi označeni kot „v pripravi“ — brez lažnih rezultatov).
- `.specify/feature.json` — `{ "feature_directory": "docs/agent/P05" }`.

**Zajeto**
- Vse R01–R12 s sprejemnimi pogoji in načinom preverjanja; dogovor o vmesniku (selecti, gumbi, `role=status`, `aria-label="Stanje straničenja"`, ohranjeni `data-task-id` in Folio).
- Pravila sprememb stanja: velikost/filter → `p := 1`; navigacija na robu ne spremeni stanja; `all` = ena stran; pri `N = 0` natančno besedilo `Stran 0 od 0. Prikazano 0–0 od 0.` in vsi gumbi onemogočeni; stanje lokalno, brez trajne shrambe/URL-ja.
- Omejitve: delo med nezaključenim nalaganjem ostane po obstoječih regresijskih zahtevah; razporeditev novih kontrol ni predpisana; poljuben `N` (0, 1, > 10).

**Opombe**
- Nobenih dodatnih funkcionalnih zahtev ali zunanjih meritev; obseg in infrastruktura nespremenjena.
- Preostanek proračuna: ~1077 s. Naslednji korak (`$speckit-plan`) lahko nadaljuje z isto zgodovino.
