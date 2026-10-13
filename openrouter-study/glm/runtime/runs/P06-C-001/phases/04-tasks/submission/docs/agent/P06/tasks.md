# Naloge P06: Nastavljiv izvoz CSV

## Priprava

- [ ] [T001] Preveri obstoječe integracijske točke projektnega pogleda, bralnega vira in javnega API-ja v `src/App.tsx` in `src/useResource.ts`.

## Temeljne spremembe

- [ ] [T002] Dodaj čisto CSV-obdelavo z vrstnim redom kolon, statusnim filtrom, navedbo, nevtralizacijo formul, CRLF, UTF-8 BOM in imenom datoteke v `src/csv.ts`.
- [ ] [T003] Dopolni `ProjectView` s stanjem izvoza, kontrolami kolon, ločila in filtra ter pogojem za omogočen gumb v `src/App.tsx`.
- [ ] [T004] Izvedi prenos `folio-<projectId>.csv` z `Blob` in začasnim `objectURL`, brez pošiljanja vsebine na strežnik, v `src/App.tsx`.
- [ ] [T005] Dopolni postavitev novih kontrol po dizajnu Folio in ohrani ozko postavitev v `src/styles.css`.

## Uporabniške zgodbe po prioriteti

- [ ] [T006] Preveri privzeti izvoz vseh opravil trenutnega projekta, nespremenljivi vrstni red kolon in ohranjenost Unicode vrednosti v `tests/agent/p06-export.spec.ts`.
- [ ] [T007] Preveri onemogočen izvoz ob praznem izboru kolon, praznem projektu ali praznem filtriranem rezultatu ter ponovno omogočenje v `tests/agent/p06-export.spec.ts`.
- [ ] [T008] Preveri ime datoteke, UTF-8 BOM, ločilo, navedbo, podvojene narekovaje, CRLF in nevtralizacijo formul v `tests/agent/p06-export.spec.ts`.
- [ ] [T009] Preveri ohranitev nastavitev pri preklopu Preglednica/Tabla ter ponastavitev ob menjavi projekta ali osvežitvi v `tests/agent/p06-export.spec.ts`.
- [ ] [T010] Preveri, da filter ne spremeni vidnega projekta in da izvoz ne spremeni podatkov, polj ali bralnih funkcij ter ne pošlje zapisov na API v `tests/agent/p06-export.spec.ts`.

## Zaključek

- [ ] [T011] Izvedi `npm run typecheck`, `npm run lint`, `npm run build` in `npm test`; zapiši dejanske izide in morebitne neizpolnjene zahteve.
- [ ] [T012] Posodobi sledljivost R01–R12 z dejanskimi testi, rezultati in omejitvami v `docs/agent/P06/spec.md`.
