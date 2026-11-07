**Rezultat**
- Implementiral sem strničenje `all/2/5/10` in filter `all/todo/in_progress/done` v `src/App.tsx:28`.
- Preglednica in tabla uporabljata isti trenutni odsek: `src/App.tsx:94` in `src/TaskBoard.tsx:13`.
- Novi kontrolniki in prilagodljiv slog so v `src/styles.css:139`.
- Specifikacija, zgodovina popravkov in sledljivost R01–R12 so v `docs/agent/specification.md:1`, `docs/agent/specification-history.md:1` in `docs/agent/verification.md:1`.
- Lastni testi so v `tests/agent/P05.spec.ts:6`.

**Preverjanje**
- `npm run check`: **55/55 uspešno** — 38 izhodiščnih, 8 razvojnih P05 in 9 lastnih preverjanj.
- `npx playwright test --project=development-desktop --project=development-mobile`: **8/8 uspešno**.
- Ni znanih neizpolnjenih zahtev.
- Opomba: `apply_patch` v tem okolju ni bil na voljo; spremembe so zapisane neposredno v dovoljene mape.
