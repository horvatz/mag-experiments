Korak `$speckit-plan` je opravljen.

**Izdelek**
- `docs/agent/P05/plan.md` (84 vrstic) po Lean veščini: tehnični kontekst, odločitve, datoteke, izvedbeni koraki, preverjanje, sledljivost R01–R12 ter skladnost z ustavo.

**Ključne odločitve**
- Čista logika v novem `src/pagination.ts` (`PAGE_SIZES`, `STATUS_FILTERS`, `filterTasks`, `paginate`, `statusText`); stanje (velikost, filter, stran) v `ProjectView`, torej lokalno in brez URL-ja/trajne shrambe — `key={project.id}` in osvežitev ponastavita (R08), preklop pogleda/podrobnosti ohrani stanje (R07).
- Nova `src/PaginationControls.tsx` z dostopnimi imeni točno po dogovoru (selecta `Velikost strani`/`Filter strani`, štirje gumbi, `role=status` z `aria-label="Stanje straničenja"`).
- Odsek `S` napaja preglednico in tablo; `TaskBoard` ostane nespremenjen (števci stolpcev iz prejetega odseka); pregled stanj in skupno število ostaneta nad celotnim seznamom (R11).
- Minimalni slogovni dodatki v `src/styles.css`; brez novih odvisnosti in brez sprememb infrastrukture.

**Preverjanje (načrtovano)**
- `npm run typecheck`, `npm run lint`, razvojni testi `tests/development/P05.spec.ts` (D01–D04), lastni testi `tests/agent/p05.spec.ts`, regresija `tests/baseline.spec.ts` + `tests/api.spec.ts`.
- Dokazila se vpišejo v `spec.md` šele po dejanskih zagonih.

**Opombe**
- Preostanek proračuna: ~1012 s. Naslednji korak (`$speckit-tasks`) lahko nadaljuje.
