# Naloge izvedbe P09

## Temelj

- [ ] [T001] Razširi razčlenjevanje hash poti in sestavljanje URL-jev za `q`, `status`, `order`, `view` in pot opravila v `src/navigation.ts`.
- [ ] [T002] Dodaj čiste funkcije za normalizacijo, iskanje po štirih poljih, filtriranje po stanju in urejanje naslovov v `src/viewState.ts`.

## Uporabniška funkcionalnost

- [ ] [T003] V `src/App.tsx` integriraj potrjeno stanje iz URL-ja, osnutek treh kontrol, atomarno potrditev, ponastavitev, števec `Prikazano: N od M.` in prazen prikaz `Ni zadetkov.`.
- [ ] [T004] Ohrani potrjene parametre in način pogleda pri preklopu preglednica/tabla, navigaciji med projekti, odpiranju podrobnosti ter zapiranju z gumbom ali `Escape` v `src/App.tsx`, `src/TaskBoard.tsx` in `src/TaskDetails.tsx`.
- [ ] [T005] Dopolni minimalne Folio sloge za novo vrstico kontrol, števec in prazen rezultat ter ohrani dostopnost in ozko drsenje v `src/styles.css`.

## Preverjanje in dokončanje

- [ ] [T006] Dodaj lastne Playwright teste za R01–R12, vključno z neposrednimi URL-ji, osnutkom, zgodovino, resetom, Unicode primeri, podvojenimi/neveljavnimi parametri, praznim rezultatom in odsotnostjo zapisov v `tests/agent/P09.spec.ts`.
- [ ] [T007] Izvedi lastne teste, razvojne teste P09, `npm run typecheck`, `npm run lint` in `npm run build`; nato posodobi sledljivost in omejitve v `docs/agent/P09/spec.md`.
