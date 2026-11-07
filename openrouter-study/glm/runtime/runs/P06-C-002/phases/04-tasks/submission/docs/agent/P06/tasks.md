# P06 — Naloge izvedbe

## Priprava

- [ ] [T001] Določi izvozno mejo modula, nespremenljivi vrstni red kolon ter tipe `ExportColumn` in `ExportFilter` v `src/csvExport.ts`.

## Temelj

- [ ] [T002] Izvedi čisto pretvorbo CSV s filtrom, nespremenljivim vrstnim redom, navedbo, podvajanjem narekovajev, nevtralizacijo formul in CRLF v `src/csvExport.ts`. (odvisno od T001)
- [ ] [T003] Izvedi lokalni prenos z imenom `folio-{projectId}.csv`, UTF-8 BOM, čiščenjem URL in brez pošiljanja na strežnik v `src/csvExport.ts`. (odvisno od T002)

## Uporabniške zgodbe

- [ ] [T004] Dodaj kontrole izvoza, privzete vrednosti, ohranitev med preklopom pogleda ter ponastavitev ob menjavi projekta ali osvežitvi v `src/App.tsx`. (odvisno od T003)
- [ ] [T005] Zagotovi onemogočen izvoz brez kolon, ob napaki, ob praznem projektu ali praznem filtriranem rezultatu v `src/App.tsx`. (odvisno od T004)
- [ ] [T006] Oblikuj kompakten in dostopen sklop kontrol v slogu Folio brez razširjanja celotne strani v `src/styles.css`. (odvisno od T005)

## Preverjanje in poliranje

- [ ] [T007] Dodaj lastne Playwright preizkuse za R01–R12, vključno z izvornim vrstnim redom, posebnimi znaki, bajti prenosa, obema pogledoma in bralnim delovanjem v `tests/agent/csv-export.spec.ts`. (odvisno od T006)
- [ ] [T008] Izvedi `npm test -- tests/agent/csv-export.spec.ts`, odpravi morebitne napake in zapiši dejanske izide v `docs/agent/P06/spec.md`. (odvisno od T007)
- [ ] [T009] Izvedi `npm run check`, preveri regresije in dokončaj sledljivost brez navajanja neizvedenih preverjanj kot uspešnih v `docs/agent/P06/spec.md`. (odvisno od T008)

**Verzija nalog:** 1.0 · **Datum:** 2026-10-30
