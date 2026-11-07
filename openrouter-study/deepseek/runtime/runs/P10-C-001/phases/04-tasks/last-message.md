Korak `$speckit-tasks` je opravljen.

**Opravljeno**
- Prebrani `docs/agent/P10/spec.md` in `plan.md` (kontekst naložen že v prejšnjih korakih).
- `docs/agent/P10/tasks.md` ustvarjen s 14 zaporednimi nalogami v formatu `- [ ] TNNN` po fazah:
  - **Setup**: T001 začetno preverjanje izhodišča.
  - **Foundational**: T002 `src/order.ts`, T003 `src/OrderControls.tsx`.
  - **User stories**: T004–T008 stanje/preglednica/tabla/undo-redo/izvor/slogi.
  - **Tests**: T009 `tests/agent/helpers.ts`, T010 `tests/agent/P10.spec.ts` (R01–R12).
  - **Polish**: T011 agent testi, T012 regresija + lint + build, T013 dokazi v `spec.md`, T014 predaja v `delivery.md`.
- Vsaka naloga navaja ciljno datoteko in vezane zahteve; kode še nisem implementiral.

Opomba o orodju: v tem turnu sta heredoc in `apply_patch` v lupini nedosegljiva (sandbox), zato sem popravek uveljavil prek začasne patch datoteke in `awk`; končna vsebina je preverjena in čista. Časovni ostanek: ~762 s.
