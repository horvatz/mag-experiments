Korak je opravljen.

**Izdano**
- `.specify/feature.json` → `{"feature_directory": "docs/agent/P05"}` (pot je bila vnaprej določena, zato vprašanje ni bilo potrebno).
- `docs/agent/P05/spec.md` — specifikacija po skupni predlogi, z:
  - problemom/kontekstom, vhodi (podatki, stanje `f`/`s`/`p`), dejanji in izidi (tabela učinkov, 7 scenarijev, merila uspeha);
  - pravili sprememb stanja s predikati (`Y`, `A`, `B`, `S(i)`) in tabelo R01–R12 s sprejemnimi pogoji ter načinom preverjanja;
  - dogovorom o vmesniku (selecti all/2/5/10 in all/todo/in_progress/done, štirje gumbi, `role=status` z `aria-label="Stanje straničenja"`, ohranjeni `data-task-id` in dostopna imena);
  - tabelo sledljivosti za R01–R12 (koda/testi še ne obstajajo, izidi pošteno označeni kot „ni še izvedeno“);
  - omejitvami (nepredpisana ločila statusa, nerazširjen obseg čez obstoječe regresijske zahteve, nedostopni končni testi).

Povezave na `task/instructions.md`, `task/specification-template.md`, `docs/dizajn.md` in ustavo so vključene; nobenih dodatnih funkcionalnih zahtev ali zunanjih meritev ni bilo dodanih. Naslednji korak je `$speckit-plan`, ki ga sproži izvajalnik.
