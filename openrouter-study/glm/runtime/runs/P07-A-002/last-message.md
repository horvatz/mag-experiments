**Rezultat**
- Implementiral zahteve R01–R12: priljubljene, trajna shramba, filter, števci, dogodki `storage`, obravnava napak in ohranjanje stanja med pogledoma.
- Specifikacija: `docs/agent/specification.md:1`
- Implementacija: `src/useFavorites.ts:1`, `src/App.tsx:29`, `src/TaskBoard.tsx:13`, `src/styles.css:181`
- Lastni testi: `tests/agent/P07-favorites.spec.ts:1`
- Preverjanja in sledljivost: `docs/agent/verification.md:1`

**Preverjanje**
- `npm run check`: uspešno, 58/58 testov.
- `npm run lint`: uspešno.
- Neizpolnjenih zahtev ni; strežnik, skupni testi, odvisnosti in infrastruktura ostajajo nespremenjeni.
