Korak `$speckit-tasks` je zaključen.

**Ustvarjeno** — `docs/agent/P08/tasks.md`: 14 odvisnostno urejenih nalog v 5 fazah, vsaka v obliki `- [ ] Txxx …` z navedeno datoteko.

- **Faza 1**: T001 pregled specifikacije, načrta in pomožnih funkcij.
- **Faza 2 (temelj)**: T002 `src/dueDates.ts` (čisti predikati, `Date.UTC`), T003 enotski testi mej in prestopnega leta, T004 zagon teh testov.
- **Faza 3 (UI)**: T005 stanje in kontrole v `src/App.tsx`, T006 pet števcev z `aria-label="Število rokov <ključ>"`, T007 filtriranje preglednice in table z „Ni opravil v izbrani skupini.“, T008 ponastavitev ob menjavi projekta/osvežitvi, T009 slogi in odzivnost.
- **Faza 4 (lastni testi)**: T010 `tests/agent/dueView.spec.ts` (scenariji R01–R12), T011 zagon lastnih in razvojnih testov.
- **Faza 5 (dokazila)**: T012 `typecheck`/`lint`, T013 skupni testi, T014 dopolnitev tabele sledljivosti z dejanskimi izidi — brez označevanja neizvedenega kot uspešno.

Čas: ~614 s od skupne omejitve še na voljo.
