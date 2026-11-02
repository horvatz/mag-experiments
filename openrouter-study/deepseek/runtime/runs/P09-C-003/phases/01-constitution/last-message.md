Korak `$speckit-constitution` je opravljen.

**Opravljeno**
- Prebral `.agents/skills/speckit-constitution/SKILL.md`, `PROJECT_RULES.md` in skupno predlogo (`task/specification-template.md`).
- Zapisan `.specify/memory/constitution.md` (različica 1.0.0, sprejeto 2026-11-02) s petimi kratkimi načeli, izpeljanimi izključno iz obstoječih pravil:
  - I. Meje obsega (`src/`, `tests/agent/`, `docs/agent/`; infrastruktura nespremenjena)
  - II. Javni vmesnik in podatki (samo `/api/`, brez `/__test/` in `localStorage`)
  - III. Potrjeni videz Folio in slovenska poimenovanja
  - IV. Specifikacija in sledljivost po skupni predlogi (R01–R12)
  - V. Resnično preverjanje (brez neizvedenih testov kot uspešnih)
- Dodane le omejitve, ki že izhajajo iz navodil; brez novih zahtev, odvisnosti ali arhitekturnih preureditev.

**Preverjanje**: vsebina pregledana (`wc -l` = 56 vrstic, ni preostalih predlog), preostali proračun ~1120 s od 1199 s. Opomba: `apply_patch` v peskovniku ni na voljo, zato je bila datoteka zapisana s `printf`; spremenjena je bila samo dovoljena procesna datoteka.

Ni neupravljavskih namer, zato razdelek `Next Actions` izpuščen; naslednji korak (`$speckit-specify`) sproži izvajalnik.
