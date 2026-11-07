Pilot P10 je izveden v celoti. Povzetek:

**Rezultat**
- Vse zahteve R01–R12 so implementirane v `src/`: novo jedro `src/order.ts` (permutacije, sklad razveljavitev z omejitvijo 20, ponovitve, ponastavitev), integracija v `src/App.tsx` (orodna vrstica, stolpec Mesto, gumbi ob vrstici), `src/TaskBoard.tsx` (mesta in gumbi ob kartici) ter `src/styles.css`.
- Dejanja so lokalna permutacija ID-jev: nobenih zapisov na API, polja in stanja ostanejo nespremenjena, stanje ni trajno.
- Specifikacija: `docs/agent/specification.md`; lastni testi: `tests/agent/p10.spec.ts` (12 scenarijev); zapis preverjanj: `docs/agent/verification.md`.

**Preverjanja (dejansko izvedena)**
- `npm run check` (lint + typecheck + build + vsi testi): **58/58 uspešno** — 14 API, 24 izhodiščnih, 8 razvojnih D01–D04, 12 lastnih.
- Razvojna D01–D04 uspešna na `development-desktop` in `development-mobile`.

**Omejitve**
- Skritih končnih testov ni bilo mogoče zagnati; ročni vizualni pregled ni bil opravljen (videz pokrit posredno z izhodiščnimi testi in preverjanjem širine 390 px).
- Scenariji med nedokončanim nalaganjem/sočasnimi spremembami podatkov niso del obsega.

Med preverjanjem je bila odkrita in odpravljena tekma pri sinhronizaciji stanja (klik pred učinkom `sync`); podrobnosti so v `docs/agent/verification.md` pod “Popravki med preverjanjem”.
