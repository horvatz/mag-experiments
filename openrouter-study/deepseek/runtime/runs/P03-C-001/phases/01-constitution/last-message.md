Korak `$speckit-constitution` je opravljen.

**Rezultat**
- Napisana je ustava projekta v `.specify/memory/constitution.md` (69 vrstic), v celoti izpeljana iz `PROJECT_RULES.md`, `task/instructions.md` in skupne predloge.
- Šest načel: nespremenjeno izhodišče, podatki samo prek `/api/`, zavezujoč dizajn Folio, preverjanje z dejanskimi dokazi, izvirne zahteve kot merilo, jedrnata sledljivost dokumentov; plus dodatne omejitve (brez novih odvisnosti, vej/commitov, trajne shrambe filtrov) in upravljanje.
- Datum sprejetja: **2026-10-13** (datum pilota), različica 1.0.0.
- Nobenih novih zahtev, odvisnosti ali arhitekturnih preureditev; brez `Next Actions`, ker vhod ni vseboval neupravljavskih namer.
- Druge datoteke niso spremenjene; `.specify/feature.json` ostaja nedotaknjen (ni del tega koraka). Opomba: okolje nima ukaza `apply_patch`, zato je bila datoteka zapisana neposredno prek lupine.
