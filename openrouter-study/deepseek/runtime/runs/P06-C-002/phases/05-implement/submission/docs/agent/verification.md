# P06: Preverjanje in sledljivost

> Dokazila so zapisana po dejanski izvedbi. Vsi navedeni izidi izhajajo iz zagonov v tem koraku; končni skriti testi niso dostopni in niso navedeni kot izvedeni.

## Zagnani ukazi in izidi

- [x] `npm run typecheck` — uspešno (tsc --noEmit, brez napak).
- [x] `npm run lint` — uspešno (eslint ., brez opozoril).
- [x] `npx playwright test --project=agent` — 10 passed (lastni testi, ~4,8 s).
- [x] `npx playwright test --project=development-desktop --project=development-mobile` — 8 passed (D01–D04 na dveh širinah).
- [x] `npm run check` — uspešno: lint + build + 56 passed (skupni 38, razvojni 8, lastni 10), 21,8 s.

## Sledljivost zahtev

| Zahteva | Pogoj (povzetek) | Test ali scenarij | Datoteka in del kode | Izid in dokaz |
| --- | --- | --- | --- | --- |
| R01 | privzeti izvoz v izvornem vrstnem redu, vse kolone, `;` | `P06 R01/R05/R07` (test 47) | `src/csvExport.ts` (`serializeCsv`, `filterRows`), `src/App.tsx` (`handleExport`) | uspešno |
| R02 | kanonični vrstni red neodvisen od klikov | `P06 R02/R06` (test 49) | `src/csvExport.ts` (`EXPORT_COLUMNS`) | uspešno |
| R03 | onemogočen izvoz pri praznem izboru, ponovno omogočen | `P06 R03/R04` (test 50) | `src/App.tsx` (`exportEnabled`) | uspešno |
| R04 | filter omeji samo izvoz; prazen rezultat onemogoči | `P06 R03/R04`, `P06 R04` (testi 50–52) | `src/csvExport.ts` (`filterRows`), `src/App.tsx` | uspešno |
| R05 | `folio-<projectId>.csv`, BOM, brez nove strani/strežnika | `P06 R01/R05/R07`, D04 | `src/App.tsx` (`handleExport`), `readonly` pomočnik | uspešno |
| R06 | ločilo `;`/`,`, narekovanje in podvojeni narekovaji | `P06 R06/R08/R09`, D02/D03 | `src/csvExport.ts` (`quoteField`) | uspešno |
| R07 | CRLF tudi na koncu; prelomi/ločila znotraj vrednosti | `P06 R01/R05/R07`, D01 | `src/csvExport.ts` (`serializeCsv`) | uspešno |
| R08 | nevtralizacija formul po začetnih presledkih/tabu/CR/LF | `P06 R06/R08/R09`, D03 | `src/csvExport.ts` (`neutralizeFormula`) | uspešno |
| R09 | šumniki, Unicode, status in datum ohranjeni | `P06 R06/R08/R09` | `src/csvExport.ts` (`serializeCsv`) | uspešno |
| R10 | preklop pogleda ohrani nastavitve in bajte | `P06 R10`, D04 | `src/App.tsx` (stanje v `ProjectView`) | uspešno |
| R11 | menjava projekta/osvežitev ponastavita nastavitve | `P06 R11` (test 54) | `src/App.tsx` (`key={project.id}`) | uspešno |
| R12 | brez sprememb podatkov, brez zapisov na API, 390 pik | `P06 R12` (testi 55–56), D04 | `src/App.tsx`, `src/styles.css` | uspešno |

## Omejitve

- Končni skriti testi niso dostopni; preverjanje se opira na skupne (38), razvojne (8) in lastne (10) teste.
- Pri 390 piks je preverjeno, da se stran ne razširi vodoravno; notranje drsenje preglednice in table ostaja dovoljeno in je pokrito s skupnimi mobilnimi testi.
- Ročni ogled v brskalniku ni bil izveden; uporabljeni so bili testni projekti Playwright.
