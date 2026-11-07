Pilot P06 je zaključen. Povzetek:

**Rezultat**
- Specifikacija: `docs/agent/specification.md` (R01–R12 s predikati, pogoji in sledljivostjo).
- Izvedba: `src/csv.ts` (kanonične kolone, nevtralizacija formul, BOM/CRLF/narekovaji), `src/ExportPanel.tsx` (checkboxes `Stolpec <ime>`, `Ločilo CSV`, `Filter izvoza`, gumb `Izvozi CSV`, prenos prek Blob + `a[download]`), vključitev v `src/App.tsx`, slogi v `src/styles.css`.
- Lastni testi: `tests/agent/P06.spec.ts` (T01–T11) in `tests/agent/P06-mobile.spec.ts` (T12).

**Preverjanje** (`docs/agent/verification.md`)
- `npm run check` → **58 uspešnih, 0 neuspešnih**: 38 izhodiščnih, 8 razvojnih P06 (D01–D04), 12 lastnih (T01–T12), vključno z lint, typecheck in build.
- Prvi zagon je imel 1 neuspeh v lastnem testu T09 (napačna pričakovana vrednost `\t` v testu); popravljen je bil test, koda izdelka je bila že pravilna. Zabeleženo v verification.md.
- Preverjeno tudi: brez zapisov na API, brez uporabe `/__test/` v UI, brez nove strani ob prenosu, brez vodoravnega prelivanja pri 390 px, ponastavitev nastavitev ob menjavi projekta/osvežitvi.

**Omejitve**
- Skritih končnih testov ni bilo mogoče zagnati; niso navedeni kot opravljeni.
- Preverjanje le v priloženem Chromiumu; robni primeri R02/R03/R08/R11 so pokriti le z lastnimi testi.
- Spremenjene so samo dovoljene poti (`src/`, `tests/agent/`, `docs/agent/`).
