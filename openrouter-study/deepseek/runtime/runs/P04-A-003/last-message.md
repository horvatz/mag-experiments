Everything is complete and verified. Final state:

**Rezultat**
- Vse zahteve R01–R12 so implementirane v `src/sorting.ts` (čisto razvrščanje s predikati), `src/SortControls.tsx` (štiri kontrole + gumb), `src/App.tsx` (stanje v `ProjectView`, projekcija, tabla/preglednica) in `src/styles.css` (odziven razpored).
- Specifikacija: `docs/agent/specification.md` (v1.1 z zapisom popravka povezav na A11/A12).
- Lastni testi: `tests/agent/sorting.spec.ts` (A01–A12).
- Dokazila: `docs/agent/verification.md`.

**Preverjanja (dejansko izvedena)**
- `npm run check` — izhod 0, **58/58**: 38 izhodiščnih, 8 razvojnih P04 (D01–D04 × namizje/mobilno), 12 agentnih (A01–A12); lint in build uspešna.
- Agentni testi pokrijejo normalizacijo NFD/UTF-16, stabilnost pri `desc`, neodvisno sekundarno smer, `original`, stalne stolpce table, ohranjanje nastavitev pri pogledu/podrobnostih, ponastavitev ob projektu/osvežitvi, prazen in enojni projekt, prepoved zapisov ter 390 pik brez prelivanja.

**Neizpolnjeno / omejitve**
- Skritih končnih testov ni mogoče zagnati; njihov izid ni znan.
- Preverjen je samo priloženi Chromium (namizje in 390 pik); Safari/Firefox/fizični telefon in ročni ogled z `npm run dev` niso bili izvedeni (zapisano v `verification.md`).
- Neveljavni datumi niso obravnavani, ker jih obseg naloge izključuje.
