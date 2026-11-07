# Zgodovina specifikacije P06

- 2026-10-30, v0.1 (osnutek): prva struktura po skupni predlogi (problem in kontekst, vhodi/dejanja/izidi, simboli, ogrodje zahtev R01–R12).
- 2026-10-30, v1.0 (predaja implementerju): dopolnjeni pogoji R01–R12 s predikati in sprejemnimi pogoji, tabela sledljivosti z načrtom preverjanja ter izrecno oznako, da izidi še niso izvedeni; dodana odprta vprašanja in omejitve.
  - Viri: `task/instructions.md`, `PROJECT_RULES.md`, `task/specification-template.md`, `shared/types.ts`, `src/App.tsx`, `src/TaskBoard.tsx`, `src/components.tsx`, `src/api.ts`, `tests/development/P06.spec.ts`, `tests/development/helpers.ts`.
  - Odločitve: predikat `neutralize` velja za vse podatkovne kolone, ne za glave; filter vpliva le na izvoz; stanje nastavitev je lokalno projektu in se ob menjavi projekta/osvežitvi ponastavi.
  - Predaja: implementer doda kodo in teste v `tests/agent/` ter zabeleži dejanske izide; reviewer preveri v `docs/agent/review.md`. Nadaljnje spremembe specifikacije se vpišejo tukaj.
