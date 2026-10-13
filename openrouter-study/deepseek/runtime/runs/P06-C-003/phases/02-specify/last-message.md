Specifikacija je zapisana v `docs/agent/P06/spec.md`, pot pa v `.specify/feature.json`.

**Opravljeno**
- `.specify/feature.json` → `{ "feature_directory": "docs/agent/P06" }` (pot že določena, brez dodatnega vprašanja).
- `docs/agent/P06/spec.md` po skupni predlogi: problem in kontekst, vhodi/dejanja/izidi s simboli C, S, F in scenariji, pravila P1–P7 (omogočenost, vsebina, navedba, nevtralizacija formul, CRLF, prenos, brez stranskih učinkov).
- Tabela zahtev R01–R12 s sprejemnimi pogoji in načinom preverjanja; dogovor o vmesniku (dostopna imena, `data-task-id`, 390 px) povzet brez novih zahtev.
- Tabela sledljivosti R01–R12: pogoj, scenarij, predvidena lokacija v `src/` (natančno določi `plan.md`) in pošteno označeni izidi "Ni izvedeno" — implementacija še sledi.
- Omejitve zapisane (skriti testi nedostopni, stanje lokalno projektu, brez novih zapisovalnih API-jev).

**Preostanek**: 685 s do roka faze; korak končan v ~3 minutah. Naslednji korak je lahko `$speckit-plan`.
