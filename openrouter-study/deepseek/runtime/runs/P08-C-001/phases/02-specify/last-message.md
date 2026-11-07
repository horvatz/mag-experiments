Korak `$speckit-specify` je zaključen.

**Ustvarjeno**
- `docs/agent/P08/spec.md` (v1.0, 2026-10-09) po skupni predlogi P08: problem in kontekst, vhodi/dejanja/izidi, zahteve s predikati, scenariji z merili uspeha, sledljivost, omejitve, zgodovina sprememb.
- `.specify/feature.json` → `{ "feature_directory": "docs/agent/P08" }` (pot je bila podana izrecno, zato vprašanja ni bilo).

**Vsebina specifikacije**
- Predikati: `D(t)`, `REF`, `diff(t)` na koledarskih dnevih; `done(t)`; `group(t)` s pravili done → overdue → today → week (1–7) → later (≥8); `count(g)` neodvisen od filtra; stanje pregleda `S = (REF, f, view, text)`.
- Pravila sprememb stanja: `init`, `setRef(veljaven/prazen)`, `setFilter`, `setView`, `switchProject`/`refresh` — z ohranjanjem/ponastavitvijo `REF`, `f`, `text` in opozorilom „Vnesi veljaven referenčni datum.“.
- Tabela R01–R12 z mejnimi primeri (REF−1/REF/REF+1/REF+7/REF+8, prestopni februar, menjava leta) in načinom preverjanja; dogovor o vmesniku (oznake, `aria-label`, `data-task-id`, 390 pik).
- Sledljivost in izidi so označeni kot „ni še izvedeno“ — nobenega testa ne navajam kot uspešnega.

Čas: ~922 s od skupne omejitve še na voljo.
