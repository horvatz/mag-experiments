# Project Constitution: Skupna pravila dela v aplikaciji

## Derived from PROJECT_RULES.md, task/instructions.md, docs/dizajn.md

**Adopted:** 2026-10-09 | Pilot P05, procedure C (Spec Kit 1.0.8, Lean preset 1.0.0)

---

## Guiding Principles

1. **Stupeno sprememb** — Koda v `src/`, dodatni testi v `tests/agent/` in dokumentacija v `docs/agent/`. Infrastruktura (`server/`, `shared/`, skupni testi in nastavitev) ostane nedotaknjena.

2. **Ohranjanje dizajna** — Vzdrževati potrjeni Folio videz (sistemska pisava, modra `#2f6dcc`, bel kartice, `#fbfbfd` ozadje, levni meni 224px).

3. **Prijem prek API-ja** — Vse podatke brati/s hraniti preko `/api/`. Ne直接接触 `/__test/`. Ne nadomeščati strežnika.

4. **Sledi specifikaciji** — Zahteve R01–R12 strogo slediti in dokazati z testi (brez lažnih pozitivnih).

5. **Edini vir resnice** — Končni testi morajo uporabljati lastne podatke; razvojni testi niso izčrpen obseg zahtev.

---

## Non-Negotiable Rules

- **Nobene širše infrastrukturne spremembe** — Odvisnosti, strežnik, skupni tipi, startne/zagonske datoteke, skupni testi: samo branje.
- **Samo dovoljene mape** — Pisati smeš samo v `src/`, `tests/agent/`, `docs/agent/`, `.specify/memory/constitution.md`, `.specify/feature.json`.
- **Folio kot zahtevek** — Brez dodajanja kontrol, ki niso navedene v navodilih.
- **Nikjer testne kontrole** — `user-interface` ne sme brati/smanjševati stanja `/__test/`.

---

## Next Actions

1. `$speckit-specify` — Oblikovati specifikacijo povezano s krajem `docs/agent/P05/`.
2. `$speckit-plan` — Razviti načrt izvedbe.
3. `$speckit-tasks` — Definirati podnaloge za implementacijo.
4. `$speckit-implement` — Izvesti implementacijo.
5. `$speckit-converge` — Preveriti in pridružiti preostanka dela.
