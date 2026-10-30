Korak `$speckit-constitution` je opravljen.

**Izdelek**
- `.specify/memory/constitution.md` — Folio (P05) Constitution, v1.0.0, ratificirana 2026-10-30 (datum pilota).
- Pet kratkih načel, izpeljanih iz `PROJECT_RULES.md`, skupne predloge in navodil naloge:
  1. Meje dovoljenih sprememb (samo `src/`, `tests/agent/`, `docs/agent/`; procesna izjema `.specify/memory/constitution.md` in `.specify/feature.json`; infrastruktura nespremenljiva).
  2. Javni API `/api/` kot edini vir podatkov; brez `/__test/` v UI, brez `localStorage`/lokalne kopije, brez novih zapisovalnih API-jev.
  3. Potrjeni dizajn Folio in slovenski vmesnik z ohranjenimi dostopnimi imeni in `data-task-id`.
  4. Specifikacija po skupni predlogi `task/specification-template.md` s sledljivostjo R01–R12 (povezave namesto podvajanja).
  5. Pošteno preverjanje: brez označevanja neizvedenih testov kot uspešnih.
- Governance: ustava prevlada, spremembe dokumentirane z zgodovino.

**Opombe**
- Obseg ni razširjen: nobenih novih zahtev, odvisnosti ali arhitekturnih preureditev; samo projektna pravila.
- V argumentih ni bilo ne-upravljavskih namer, zato razdelek `Next Actions` ni potreben.
- Aplikacijska koda se v tem koraku ni dotaknila; časa je ostalo ~1153 s od 1199 s.
