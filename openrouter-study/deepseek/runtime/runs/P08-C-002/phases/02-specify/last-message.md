Korak `$speckit-specify` je opravljen.

**Opravljeno**
- `.specify/feature.json` nastavljen na `{ "feature_directory": "docs/agent/P08" }`.
- Ustvarjen `docs/agent/P08/spec.md` (191 vrstic) po skupni predlogi:
  - Problem in kontekst, uporabniške zgodbe US1–US5, vhodi/dejanja/izidi (polja `Task`/`Project`, javni API, napake, prazna skupina, prazen projekt).
  - Simboli in predpostavke (`T`, `ref`, `d(t)`, `D(t)`, `g(t)`, `C[k]`, `visible`).
  - Pravila sprememb stanja S1–S6 (začetek/ponastavitev, veljaven vnos datuma, prazen/neveljaven vnos, izbira filtra, preklop pogleda, nalaganje brez zapisov).
  - Razvrstitev: `done` po statusu; odprta opravila po `D(t)`: `<0` → overdue, `=0` → today, `1–7` → week, `≥8` → later; disjunktnost in unija.
  - Dogovor o vmesniku (Referenčni datum, Pogled rokov, `Število rokov <ključ>`, `role=alert`, imena skupin, ohranjeni `data-task-id`/`aria-label`, 390 pik).
  - Tabela R01–R12 s pravili, sprejemnimi pogoji in načini preverjanja; sledljivost iz skupne predloge z izidi »ni izvedeno ob specifikaciji« (brez lažnih uspehov).
  - Odprta vprašanja/omejitve in zgodovina sprememb 1.0.
- Nobenih dodatnih funkcionalnih zahtev ali zunanjih meritev; potrjeni Folio in meje sprememb so upoštevani.

**Opomba o okolju**
V tem turnu sta heredoc in `apply_patch` v lupini nedostopna (zsh ne more ustvariti temp datoteke za heredoc, `apply_patch` ni v `PATH`). Datoteke sem zato zapisal z `printf` preusmeritvijo v dovoljene poti; vsebina je preverjena.

Preostanek proračuna: ~196 s. Pripravljen na `$speckit-plan`.
