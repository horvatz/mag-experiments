Korak `$speckit-constitution` je opravljen.

**Izvedeno**
- Prebral: `PROJECT_RULES.md`, `task/instructions.md`, `task/specification-template.md`, `.agents/skills/speckit-constitution/SKILL.md`, obstoječo predlogo konstitucije in `docs/dizajn.md`.
- Zapisal `.specify/memory/constitution.md` kot konstitucijo Folio, različica 1.0.0, sprejeto 2026-10-30 (datum pilota).

**Vsebina** (samo projektna pravila, brez novih zahtev, odvisnosti ali arhitekturnih sprememb)
- I. Meje obsega — dovoljene spremembe le `src/`, `tests/agent/`, `docs/agent/`; strežnik, skupni tipi, skupni testi, odvisnosti in nastavitve nespremenjeni.
- II. Javni vmesnik — branje/zapis prek `/api/` in izbira po `id`; brez novih zapisovalnih API-jev; `/__test/` samo za testni program; brez nadomeščanja strežnika.
- III. Potrjeni videz Folio — slovenska poimenovanja, dizajn iz `docs/dizajn.md`, obstoječi gradniki, dostopnost s tipkovnico.
- IV. Preverjanje in dokazila — skupni testi in lastna preverjanja, izvirne zahteve kot merilo, pošteno poročanje izidov.
- Upravljanje — veljavnost za celoten pilot P07, dokumentirane spremembe, sklic na `PROJECT_RULES.md` in `docs/dizajn.md`.

Nobenih negovernančnih namer v argumentih ni bilo, zato razdelka Next Actions ni; aplikacijska koda in ostale datoteke niso bile spremenjene. Časovni ostanek: 1128 s.
