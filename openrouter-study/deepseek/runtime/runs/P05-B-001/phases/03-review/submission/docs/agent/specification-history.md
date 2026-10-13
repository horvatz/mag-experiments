# Zgodovina specifikacije P05

## 2026-10-08 — seja 1 (avtor specifikacije, postopek B)

1. Prebrani: `PROJECT_RULES.md`, `task/instructions.md`, `task/specification-template.md`, `docs/dizajn.md`.
2. Pregledani izhodiščni viri: `src/App.tsx`, `src/TaskBoard.tsx`, `src/TaskDetails.tsx`, `src/api.ts`, `src/navigation.ts`, `src/useResource.ts`, `shared/types.ts`, `server/http.ts`, `tests/development/P05.spec.ts`, `tests/development/helpers.ts`, `tests/baseline.spec.ts`.
3. Ugotovitve, ki so oblikovale specifikacijo:
   - `ProjectView` je remountan ob menjavi projekta (`key={project.id}`), zato se lokalno stanje ob menjavi projekta samodejno ponastavi; preklop pogleda in odpiranje podrobnosti ne remountata `ProjectView`, zato je mogoče stanje ohraniti brez trajne shrambe.
   - API ponuja samo branje seznama in podrobnosti ter `PATCH /api/tasks/:id` (obstoječi, za straničenje prepovedan); pot pisanja se sme uporabiti le za obstoječe funkcije nalog, straničenje pa ne sme pisati.
   - Razvojni testi pričakujejo selecte `Velikost strani`/`Filter strani`, gumbe `Prva/Prejšnja/Naslednja/Zadnja stran` in `role=status` z imenom `Stanje straničenja`; primeri D01–D04 služijo kot delna preveritev, ne kot celoten obseg.
4. Zapisana različica 1 `docs/agent/specification.md` z modelom stanja, predikati in sledljivostjo R01–R12.
5. Odprto za implementerja: vnesti dejanske izide testov in morebiti dopolniti seznam datotek. Popravke specifikacije izvaja prvotni avtor v nadaljevani seji.
