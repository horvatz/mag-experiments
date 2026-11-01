Korak `$speckit-specify` je opravljen.

**Ustvarjeno**
- `docs/agent/P03/spec.md` — specifikacija po skupni predlogi: problem in kontekst, vhodi/dejanja/izidi (polja `Task`/`Project`, stanje filtrov `s`, `f_status`, `f_assignee`, `view`), zahteve in pravila, izvedba s sledljivostjo, odprta vprašanja in omejitve.
- `.specify/feature.json` — `{ "feature_directory": "docs/agent/P03" }` (pot je bila podana, dodatnega vprašanja ni bilo).

**Vsebina**
- Vseh 12 zahtev R01–R12 je zajetih dvakrat: v preglednici pravil s sprejemnimi pogoji in v preglednici sledljivosti (pogoj, test/scenarij, predvidena datoteka, izid).
- Izbrane zahteve so izražene s predikati: `norm` (NFD, odstranjeni U+0300–U+036F, male črke), `W(s)` (neprazne besede po belinah), `zadene(t, s)` (konjunkcija dobesednih podnizov), `V`/`N`/`M` (logični IN iskanja, stanja in osebe), `ni zadetkov` ⇔ `M > 0 ∧ N = 0`.
- Dogovor o vmesniku je povzet (`input type=search`, `select` filtra, gumb `Počisti filtre`, `role=status` z `Prikazano: N od M.`, ohranjeni `data-task-id` in `aria-label`).
- Izidi v tabeli sledljivosti so označeni kot "ni izvedeno (pred izvedbo)" — ni izmišljenih dokazov; brez novih funkcionalnih zahtev in brez zunanjih meritev.

Preostanek faze: 1084 s. Naslednji korak lahko nadaljuje z načrtom.
