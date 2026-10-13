Korak `$speckit-constitution` je zaključen.

**Ustava** — zapisana v `.specify/memory/constitution.md` (različica 1.0.0, sprejeto in zadnja sprememba 2026-10-09), izpeljana iz `PROJECT_RULES.md` in skupne predloge:

- **I. Potrjeni videz Folio (neločljivo)** — ohranjen dizajn iz `docs/dizajn.md`, obstoječi gradniki in slogovne spremenljivke, slovensko poimenovanje.
- **II. Omejen obseg sprememb (neločljivo)** — samo `src/`, `tests/agent/`, `docs/agent/`; strežnik, skupni tipi, skupni testi, odvisnosti in nastavitve ostanejo enaki.
- **III. Javni vmesnik `/api/` (neločljivo)** — branje/pisanje le prek `/api/` in po `id`; brez `/__test/`, brez lokalne kopije podatkov ali `localStorage`.
- **IV. Zahteve kot merilo in sledljivost** — R01–R12 obvezne; vsaka povezana s pravilom/predikatom, kodo in dejansko izvedenim testom; neizvedenih testov ni dovoljeno navajati kot uspešnih.
- **V. Preverjanje na resničnih izvedbah** — skupni testi plus lastna preverjanja v `tests/agent/`.

Upravljanje določa nadrejenost ustave, dokumentiranje sprememb, reševanje odprtih vprašanj iz obstoječih zahtev ter prepoved izmišljanja uporabnikovih odgovorov. Drugih artefaktov Spec Kit ni bilo treba posodabljati (predhodna specifikacija/načrt še ne obstajata), zato `Next Actions` ni. Čas: ~1076 s od skupne omejitve še na voljo.
