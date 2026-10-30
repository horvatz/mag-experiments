Korak `$speckit-specify` je opravljen.

**Izdelki**
- `.specify/feature.json` — `{"feature_directory": "docs/agent/P07"}`
- `docs/agent/P07/spec.md` (87 vrstic) — specifikacija po skupni predlogi:
  - **Problem in kontekst**, **Vhodi, dejanja in izidi** (polja iz `shared/types.ts`, nova stanja `F`/`f`, dejanja, izidi, napake).
  - **Zahteve in pravila**: simboli (`F`, `f`, `T_p`, `V_p`, `norm`, `△`) in tabela R01–R12 s predikati/ pravili sprememb stanja ter načinom preverjanja (npr. `F := F △ {t.id}`, zapis `{version:1, ids: norm(F)}`, neveljavni zapisi ⇒ `F := ∅`, `X = |{t ∈ T_p : t.id ∈ F}|`, `M = |T_p|`).
  - **Dogovor o vmesniku** povzet iz `task/instructions.md` (aria-pressed, checkbox, gumb, `role=status`/`role=alert`, `data-task-id`, 390 px).
  - **Izvedba in sledljivost**: tabela R01–R12 → pogoj, načrtovani test `tests/agent/favorites.spec.ts`, koda v `src/`, izid označen kot „ni izvedeno" (brez lažnih uspehov); podrobnosti bodo v `plan.md`/`tasks.md`.
  - **Odprta vprašanja in omejitve**: nedoločeno besedilo/razporeditev, nedostopni končni testi, izvenobsegovne interakcije, obnašanje ob nedosegljivi shrambi.

**Opombe**
- Nobenih novih funkcionalnih zahtev ali zunanjih meritev; povezave na `docs/dizajn.md` in ustavo, brez podvajanja.
- Proračun: porabljenih ~95 s v tem koraku, skupno ostaja 962 s.
