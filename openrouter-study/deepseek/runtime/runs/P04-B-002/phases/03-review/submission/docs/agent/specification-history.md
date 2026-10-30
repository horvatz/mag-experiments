# Zgodovina specifikacije P04

## 1. osnutek (snovalec specifikacije, postopek B)

- Zapisana struktura po `task/specification-template.md`: problem in
  kontekst, vhodi/dejanja/izidi, zahteve R01–R12, sledljivost, odprta
  vprašanja.
- Pregledani `PROJECT_RULES.md`, `task/instructions.md`,
  `task/specification-template.md`, `docs/dizajn.md`, `shared/types.ts`,
  `src/App.tsx`, `src/TaskBoard.tsx`, `src/TaskDetails.tsx`,
  `src/navigation.ts`, `src/api.ts`, `src/useResource.ts`,
  `tests/development/helpers.ts` in `tests/development/P04.spec.ts`.
- Določeni simboli `T`, `K1/D1/K2/D2`, `norm`, `rank`, `cmp`, `dir` in
  predikat `sort`; vsaka zahteva R01–R12 ima sprejemni pogoj in način
  preverjanja.

## 2. dopolnitev (snovalec specifikacije)

- Dodani predikati P1–P11 za izbrane zahteve (R01–R12).
- Dodane opombe za izvedbo: ponastavitev ob menjavi projekta prek
  `key={project.id}`, ohranitev vseh štirih kontrol, vrednosti `option`
  zaradi `selectOption`, popolna ureditev z `idx`.
- Preverjeno ujemanje pravil z razvojnimi primeri D01–D04 (naslov UTF-16
  `=SUM(A1)`, `Alfa 10` pred `alfa 2`; `status` + `dueDate desc`; `dueDate`
  v stolpcu Pripravljeno; ponastavitev in odsotnost zapisov).
- Sledljivost je označena kot načrt: implementer in preverjanje še nista
  izvedena, zato noben izid ni označen kot uspešen.
