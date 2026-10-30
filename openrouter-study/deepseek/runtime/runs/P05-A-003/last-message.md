Naloga P05 je zaključena. Vse zahteve R01–R12 so implementirane in preverjene.

**Rezultat**
- `npm run check` uspešen: lint, typecheck, build in **57/57 testov** (38 izhodiščnih + 8 razvojnih P05 + 11 lastnih).
- Straničenje all/2/5/10 in filter all/todo/in_progress/done v `src/App.tsx`, z resetom na prvo stran ob spremembi, točnim statusom (`Stran X od Y. Prikazano A–B od N.`, pri praznem `Stran 0 od 0. Prikazano 0–0 od 0.`), onemogočenimi gumbi na robu in brez zapisov na API.
- Tabla prikazuje isti odsek kot preglednica; povzetek stanj šteje celoten projekt, števci stolpcev le trenutno stran.
- Slogi za nove kontrolnike v `src/styles.css` (zavijanje na ozkih zaslonih, brez vodoravnega drsenja pri 390 px).

**Datoteke**
- `docs/agent/specification.md` – specifikacija po predlogi s predikati za R01–R12.
- `docs/agent/verification.md` – dejansko izvedeni ukazi, povezava zahtev z dokazi, omejitve.
- `tests/agent/p05.spec.ts` – 11 lastnih testov A01–A11 (vključno s praznim projektom, filtrom brez zadetkov, 1 in 10 opravili, ohranitvijo stanja, ponastavitvami, brez zapisov).

**Omejitve**
- Skriti končni testi niso bili dostopni; preverjanje temelji na razvojnih, izhodiščnih in lastnih testih.
- Ročni vizualni pregled ni bil izveden; videz je preverjen posredno skozi obstoječe teste in gradnike.
- Spremenjene so samo dovoljene poti (`src/`, `tests/agent/`, `docs/agent/`); specifikacija po preverjanju ni bila spremenjena (le popravek tipa v lastnem testu A02).
