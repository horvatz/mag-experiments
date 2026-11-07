Korak `$speckit-implement` je opravljen — vse naloge T001–T015 so izvedene in označene.

**Implementacija**
- `src/csvExport.ts` (novo): kanonične kolone `EXPORT_COLUMNS`, `filterRows`, `neutralizeFormula`, `serializeCsv` (BOM U+FEFF, narekovanje s podvajanjem, CRLF tudi na koncu).
- `src/App.tsx`: stanje izvoza v `ProjectView` (privzeto vse kolone, `all`, `;`), kontrole (`Stolpec <ime>`, `Ločilo CSV`, `Filter izvoza`, gumb `Izvozi CSV` z `enabled`), prenos `folio-<projectId>.csv` prek Blob + `a[download]`; brez `window.open` in brez zapisov na API.
- `src/styles.css`: vrstica kontrol po Folio gradnikih, brez prelivanja pri 390 pik.
- `tests/agent/p06-export.spec.ts` (novo): 10 lastnih testov za R01–R12.

**Preverjanje (dejansko izvedeno)**
- `npm run typecheck`, `npm run lint`: uspešno.
- `--project=agent`: 10 passed; `development-desktop/mobile` (D01–D04): 8 passed.
- `npm run check`: lint + build + **56 passed** (38 skupnih, 8 razvojnih, 10 lastnih) v 21,8 s.
- Dokazi v `docs/agent/verification.md`; tabela sledljivosti v `docs/agent/P06/spec.md` izpolnjena z izidi in povezavami na test 47–56 ter D01–D04; `tasks.md` vse `[x]`.

**Omejitve**
- Končni skriti testi niso dostopni in niso navedeni kot izvedeni; ročni ogled v brskalniku ni bil izveden (uporabljeni testni projekti Playwright).
- `node task/time-budget.mjs`: 325 s preostanka v fazi; naslednji korak (converge) vodi izvajalnik.
