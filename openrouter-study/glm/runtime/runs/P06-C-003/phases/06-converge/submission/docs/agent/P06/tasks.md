# P06 — Naloge izvedbe

## Osnova

- [x] [T001] Dodaj čisto izvozno logiko, nespremenljivi vrstni red kolon, filtriranje, sanitizacijo formul, CSV navedbo, BOM in CRLF v `src/export.ts`.
- [x] [T002] Dodaj dostopne checkboxe, selecta in gumb z zagotavljanjem podatkov in pogoja za izvoz v `src/CsvExportControls.tsx`.
- [x] [T003] Poveži kontrole s stanjem trenutnega projekta, resetiranjem ob menjavi projekta in ohranjanjem prek Preglednica/Tabla v `src/App.tsx`.
- [x] [T004] Dodaj kompaktne Folio stile in ohrani 390-pikselno širino okna v `src/styles.css`.

## Preverjanje

- [x] [T005] Dodaj teste za privzete vrednosti, izvorni vrstni red, izbiro kolon in onemogočen izvoz brez kolon v `tests/agent/P06/export-csv.spec.ts`.
- [x] [T006] Dodaj teste za statusne filtre, prazne projekte, ime datoteke, BOM in odsotnost strežniške vsebine v `tests/agent/P06/export-csv.spec.ts`.
- [x] [T007] Dodaj teste za navedbe, obe ločili, CRLF, nevtralizacijo formul, Unicode, datume in enake bajte v obeh pogledih v `tests/agent/P06/export-csv.spec.ts`.
- [x] [T008] Dodaj teste za resetiranje po menjavi projekta ali osvežitvi, odsotnost zapisovalnih zahtev in ohranitev obstoječih oznak v `tests/agent/P06/export-csv.spec.ts`.
- [x] [T009] Zaženi `npm run lint`, `npm run build` in `npm test`; zapiši dejanske izide, nepreverjene dele in omejitve v `docs/agent/P06/spec.md`.

## Dokumentacija

- [x] [T010] Posodobi sledljivost R01–R12 z dejanskimi testi, kodnimi mesti, izidi in dokazi v `docs/agent/P06/spec.md`.
