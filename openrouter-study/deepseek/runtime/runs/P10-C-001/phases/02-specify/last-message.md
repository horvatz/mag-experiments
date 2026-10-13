Korak `$speckit-specify` je opravljen.

**Opravljeno**
- `.specify/feature.json` → `{ "feature_directory": "docs/agent/P10" }` (pot je bila podana; vprašanja nisem postavljal).
- `docs/agent/P10/spec.md` ustvarjen po skupni predlogi P10, v slovenščini, s sklici na `task/instructions.md`, `task/specification-template.md` in ustavo.

**Vsebina specifikacije**
- Problem in kontekst, vhodi/dejanja/izidi (uspeh, preklic, napaka) ter dogovor o vmesniku (gumbi, `aria-label`, `role=status`, `data-task-id`, 390 px).
- Simboli `T`, `T0`, `U`, `R` ter pravila sprememb stanja; vseh dvanajst zahtev R01–R12 je izraženih s predikati in sprejemnimi pogoji (npr. `poz(id)`, `pred(id)`, `nasl(id)`, meja 20, `R' = []` po novem premiku).
- Sledljivost R01–R12 → pogoj/test/koda/dokaz; izidi so izrecno označeni kot neizvedeni do dejanske izvedbe.
- Odprta vprašanja in omejitve: brez trajne shrambe/URL stanja, končni testi niso dostopni, razporeditev kontrol ni predpisana.

Časovni ostanek: ~1004 s. Naslednji korak lahko teče brez dodatnih pojasnil.
