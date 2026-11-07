# Zgodovina specifikacije P03

- 2026-10-09, v1 (osnutek 1, agent-specifikator): uvodno branje `PROJECT_RULES.md`,
  `task/instructions.md`, `task/specification-template.md`, `shared/types.ts`,
  `src/App.tsx`, `src/api.ts`, `docs/dizajn.md`. Zapisani kontekst, predikati
  (normalizacija NFD, `ujemanje`/`stanje`/`oseba`/`viden`), R01–R12 s sprejemnimi
  pogoji, dogovor o vmesniku in sledljivost z neizvedenimi izidi.
- 2026-10-09, v1 (dopolnitev): pregled `src/TaskBoard.tsx` in `src/components.tsx`
  potrdil `data-task-id` na karticah, števce stolpcev z `aria-label="N opravil"`,
  `role="region"`/`aria-label="Tabla opravil"` in obstoječi `role="status"` pri nalaganju;
  v omejitve dodana zahteva, da je novi status določljiv po `aria-label="Rezultati filtriranja"`.
