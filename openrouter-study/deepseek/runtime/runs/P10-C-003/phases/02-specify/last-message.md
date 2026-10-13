Specifikacija je pripravljena.

**Opravljeno**
- `.specify/feature.json` → `{"feature_directory":"docs/agent/P10"}`.
- `docs/agent/P10/spec.md` ustvarjen po skupni predlogi:
  - Problem in kontekst, vhodi (polja `Task`/`Project` iz `/api/`), dejanja in izidi.
  - Pravila sprememb stanja s predikati: `P`, `P0`, `U` (največ 20), `R`, `index(t)`; veljavni/neveljavni premiki, razveljavitev, ponovitev, začetni vrstni red, prazna sklada in števca.
  - Uporabniški scenariji P1–P4 in tabela zahtev R01–R12 s sprejemnimi pogoji.
  - Dogovor o vmesniku (`Premakni <id> gor/dol`, `Mesto opravila <id>`, `Razveljavi premik`, `Ponovi premik`, `Začetni vrstni red`, `Zgodovina vrstnega reda`, ohranjeni `data-task-id` in `aria-label`).
  - Sledljivost: načrtovani lastni testi `order.spec.ts`, `history.spec.ts`, `state.spec.ts`; izidi označeni kot še neizvedeni.
  - Odprta vprašanja in omejitve (razporeditev kontrol, navigacija med nalaganjem, brez zunanjih meritev).

Čas: 807 s do roka faze; v tem koraku ni bilo odloženih ne-governančnih namer. Naslednji korak je `$speckit-plan`.
