Korak `$speckit-specify` je opravljen.

**Izvedeno**
- `.specify/feature.json` → `{"feature_directory": "docs/agent/P07"}` (pot je bila vnaprej določena, brez vprašanja).
- `docs/agent/P07/spec.md` — specifikacija po skupni predlogi P07 za vse R01–R12.

**Vsebina specifikacije**
- **Problem in kontekst** — namen (označevanje, filtriranje, trajnost), izhodišče Folio in trije uporabniški scenariji brez novih zahtev.
- **Vhodi, dejanja in izidi** — podatki (`task.id`, `folio:favorites:v1`), dejanja z izidi (preklop, filter, odstranitev projekta, menjava projekta, osvežitev, `storage`, napaka) in dogovor o vmesniku (gumbi z `aria-pressed`, checkbox, števec `role=status`, opozorilo `role=alert`, 390 px, `data-task-id`).
- **Zahteve in pravila** — simboli P/F/L/f/X/M, splošna pravila sprememb stanja **P1–P7** (preklop `F △ {id}`, zapis `sortUTF16(unique(F))`, normalizacija z veljavnostjo, prikaz `f ? [t∈P : t.id∈F] : P`, odstranitev projekta, dogodek `storage` brez povratnega zapisa, napaka shrambe) ter tabela R01–R12 s sprejemnimi pogoji in načinom preverjanja.
- **Izvedba in sledljivost** — tabela R01–R12 → pogoj P1–P7 → predviden test; izidi pošteno označeni kot „ni izvedeno (faza specifikacije)“, povezava na `plan.md`/`tasks.md`.
- **Odprta vprašanja in omejitve** — nepredpisana razporeditev/besedilo, izvzeti scenariji, nedostopni končni testi, brez zunanjih meritev.

Dodatnih funkcionalnih zahtev ali meritev nisem uvajal; `src/`, `tests/agent/` in ostale datoteke ostajajo nedotaknjene. Časovni ostanek: 932 s.
