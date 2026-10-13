Specifikacija je izdelana v `docs/agent/P04/spec.md`, pot pa je zapisana v `.specify/feature.json` (`{"feature_directory": "docs/agent/P04"}`).

**Vsebina specifikacije**
- Problem in kontekst, vhodi (polja izhodišča, branje prek `/api/`, izbira po `id`), dejanja in pričakovani izidi po uspehu, preklicu in napaki.
- Simboli in predpostavke (`S`, `Kp/Dp`, `Ks/Ds`, `norm`, `rang`) ter pravila sprememb stanja za vseh dvanajst zahtev R01–R12, vključno z: stabilnostjo, neodvisnima smerema, dobesedno razlago R06 (`original` vedno vrne `S`), stolpci table in ponastavitvami ob menjavi projekta/osvežitvi.
- Preglednica zahtev: R… → pravilo/sprejemni pogoj → način preverjanja; dogovor o vmesniku z obstoječimi gradniki (`data-task-id`, dostopna imena, `aria-label`, širina 390 pik).
- Preglednica sledljivosti s povezavami na `plan.md` in `tasks.md`; izidi so označeni kot „Ni izvedeno (pred izvedbo)“, dokler testi niso dejansko izvedeni.
- Odprta vprašanja in omejitve: razlaga R06, izven obsega ostajata navigacija med nalaganjem in manjkajoči datumi, skritih končnih testov ni mogoče izvesti.

Spremenjena je bila samo procesna datoteka `.specify/feature.json` in nova `docs/agent/P04/spec.md`; brez vej, commitov in dodatnih zahtev.
