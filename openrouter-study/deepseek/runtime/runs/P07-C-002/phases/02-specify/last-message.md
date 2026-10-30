Korak `$speckit-specify` je opravljen.

**Ustvarjeno**
- `.specify/feature.json` → `{ "feature_directory": "docs/agent/P07" }` (pot je bila določena, dodatno vprašanje ni potrebno).
- `docs/agent/P07/spec.md` (104 vrstice) po skupni predlogi `task/specification-template.md`:
  - Problem in kontekst, vhodi/dejanja/izidi (podatki, shramba `folio:favorites:v1`, dogodki `storage`).
  - Splošna pravila sprememb stanja P1–P8 s predikati (npr. `F := F \ ids(P)`, `V = [t ∈ P : t.id ∈ F]`), ločena od posameznih testnih primerov.
  - Razpredelnica R01–R12 s pravilom/sprejemnim pogojem in načinom preverjanja; dogovor o vmesniku (gumbi z `aria-pressed`, `role=status`, `role=alert`, `data-task-id`, širina 390 pik).
  - Sledljivost: razpredelnica R01–R12 z izidom "ni izvedeno; vpiše se med izvedbo" (brez lažnih uspehov).
  - Odprta vprašanja in omejitve (izvorni vrstni red, nepredpisana razporeditev, meje preverjanja).

**Omejitve**
- Nobenih novih funkcionalnih zahtev ali zunanjih meritev; izvirne zahteve ostajajo merilo.
- Drugih datotek nisem spreminjal; veje ali commiti niso ustvarjeni.

Preostanek proračuna: ~1079 s.
