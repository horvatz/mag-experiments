Korak `$speckit-tasks` je opravljen.

**Opravljeno**
- Naložil kontekst (`.specify/feature.json` → `docs/agent/P09`, ustava, `spec.md`, `plan.md`).
- Zapisal `docs/agent/P09/tasks.md` (52 vrstic, v0.1, 2026-11-02) s 24 nalogami `T001`–`T024` v formatu `- [ ] [TaskID] opis — pot datoteke`, po fazah:
  - **Priprava** (T001–T002): omejitve in pregled obstoječega usmerjanja/pomočnika.
  - **Temelj** (T003–T006): `src/viewState.ts` (parse/normalize/filter/buildHash) in `src/navigation.ts` (`params`, `navigate`).
  - **Zgodba 1** (T007–T009): filtriran prikaz, "Ni zadetkov."/števec, prvi lastni testi — R01–R04, R11.
  - **Zgodba 2** (T010–T013): `ViewControls.tsx`, osnutek/potrditev, slog, testi — R05, R06, R08.
  - **Zgodba 3** (T014–T017): povezave, back/forward, menjava projekta, testi — R07–R10.
  - **Zgodba 4** (T018–T019): ponastavitev, testi omejitev in 390 px — R11, R12.
  - **Zaključek** (T020–T024): typecheck/lint, ciljni in skupni testi, posodobitev sledljivosti in predaja.
- Vsaka naloga nosi povezavo na zahteve R01–R12 in ciljne datoteke; koda ni bila implementirana.

Preostanek proračuna ~870 s od 895 s. Naslednji korak (`$speckit-implement`) sproži izvajalnik.
