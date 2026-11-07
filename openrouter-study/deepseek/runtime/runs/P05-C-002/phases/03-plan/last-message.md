**Korak zaključen: načrt P05**

- `docs/agent/P05/plan.md` ustvarjen (37 vrstic, Lean): tehnični kontekst, odločitve, datoteke in preverjanje.
- Ključne odločitve: lokalno stanje v `ProjectView` (stran/velikost/filter, brez trajne shrambe in URL-ja), čiste funkcije v novem `src/pagination.ts`, `TaskBoard` prejme odsek trenutne strani, povzetek stanj ostane nad celotnim projektom, status z natančnim besedilom in onemogočenimi gumbi na robu.
- Obseg: samo `src/`, `tests/agent/`, `docs/agent/P05`; brez novih odvisnosti, klicev API-ja ali infrastrukturnih sprememb; Folio gradniki se ohranijo.
- Preverjanje: `lint`/`typecheck`, skupna testa, lastni testi `tests/agent/p05-pagination.spec.ts`, celoten `npm test`, ročni pregled pri 390 pik; izidi se vpišejo v specifikacijo.

Preostanek proračuna: ~975 s.
