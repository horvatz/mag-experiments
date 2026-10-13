Korak `$speckit-tasks` je opravljen.

**Izdano: `docs/agent/P05/tasks.md`** — 17 zaporednih nalog T001–T017 v formatu `- [ ] [TaskID] opis (datoteka)`:
- **Priprava/Temelj (T001–T003):** potrditev konteksta, stanje `pageSize`/`filter`/`page` v `src/App.tsx` z remountom prek `key`, izračun odseka po predikatih.
- **Zgodba 1 (T004–T007):** `src/Pagination.tsx` s kontrolami in statusom, povezava dejanj v `App.tsx`, prikaz `pageTasks`, `.pagination` v `styles.css`.
- **Zgodba 2 (T008–T009):** `pageTasks` v tablo, ohranitev stanja ob preklopu/podrobnostih, števci stolpcev in povzetek.
- **Zgodba 3 (T010–T011):** ponastavitve brez trajne shrambe/URL, samo GET `/api/` in ohranjene povezave/dostopnost.
- **Testi in preverjanja (T012–T016):** lastni `tests/agent/p05-pagination.spec.ts` za R01–R12 prek `../development/helpers.ts`, zagon agentnih testov, lint + typecheck, skupni baseline testi, izpolnitev sledljivosti v `spec.md` z dejanskimi izidi.
- **Zaključek (T017):** pregled obsega in zgodovina sprememb.

Kode še nisem implementiral, kot zahteva korak. Naslednji korak je `$speckit-implement`, ki ga sproži izvajalnik.
