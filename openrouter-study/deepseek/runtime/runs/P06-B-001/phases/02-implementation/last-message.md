**Izvedeno**

- `src/csv.ts` (nov): čista gradnja CSV – nespremenljiv vrstni red kolon, vedno narekovane glave/vrednosti, podvojeni `"`, U+FEFF, CRLF tudi za zadnjo vrstico, nevtralizacija formul `= + - @` (tudi za vodilnimi ` \t\r\n`), prenos `folio-<projectId>.csv` prek Blob URL brez omrežja.
- `src/App.tsx`: kontrole v `ProjectView` (`Stolpec <ime>`, `Ločilo CSV`, `Filter izvoza`, gumb `Izvozi CSV`); gumb onemogočen ob praznem izboru kolon ali praznem filtriranem rezultatu; stanje preživi preklop pogleda in se ponastavi ob menjavi projekta/osvežitvi; prikaz ostane nefiltriran.
- `src/styles.css`: prilagodljiva vrstica kontrol brez prelivanja na 390 px.
- `tests/agent/export.spec.ts` (nov): A01–A05 za R02–R04, R08, R11.
- `docs/agent/verification.md`: načrt, spremembe, dejanski rezultati, preslikava R01–R12, omejitve.

**Preverjanje**

- `npm run check`: **51 passed, 0 failed** (eslint, tsc, vite build, 38 osnovnih, 8 razvojnih D01–D04, 5 lastnih A01–A05).
- R05–R07, R09, R10, R12 dokazani z D01–D04 (vključno z `readonly`: brez pisnih zahtev, `saveRequests = 0`, brez prelivanja).
- Napak v specifikaciji nisem našel; specifikacije in review datotek nisem spreminjal.

**Omejitve**

- R12 ni bil ročno pregledan v brskalniku, le avtomatizirano.
- Neuspeh samega prenosa in sočasne spremembe podatkov niso v obsegu; trajne shrambe nastavitev ni.

Čas prevzame pregledovalec.
