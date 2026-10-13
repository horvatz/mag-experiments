**Rezultat**
Naloga P06 je izvedena po postopku A (en agent). Vse zahteve R01–R12 so implementirane in preverjene.

**Spremembe**
- `src/csv.ts` – čista logika: fiksni vrstni red stolpcev, filter, narekovanje, podvajanje `"`, CRLF, nevtralizacija formul `= + - @` za začetnimi presledki/tab/CR/LF.
- `src/CsvExport.tsx` – kontrole `Stolpec <ime>`, `Filter izvoza`, `Ločilo CSV`, gumb `Izvozi CSV`; prenos prek Blob URL z BOM in imenom `folio-<projectId>.csv`, brez zapisov na API.
- `src/App.tsx` – kontrola vgrajena v `ProjectView` (`key={project.id}` poskrbi za ponastavitev ob menjavi projekta); `src/styles.css` – Folio-skladni slogi z ovijanjem na 390 px.
- `docs/agent/specification.md`, `docs/agent/verification.md` – specifikacija in dejansko izvedena preverjanja.
- `tests/agent/csv-export.spec.ts` – 12 lastnih testov (A01–A10 + čisti testi).

**Preverjanje**
- `npm run check`: **58/58 uspešno** (lint + build + izhodiščni, 8 razvojnih in 12 lastnih testov).
- Samo razvojni: 8/8; samo lastni: 12/12; `tsc --noEmit` brez napak.
- Pokrite so tudi zahteve, ki jih razvojni testi ne zajamejo: fiksni vrstni red ob poljubnih klikih, onemogočen izvoz brez prenosa, prazen projekt/filtrirani rezultat, ponastavitev ob menjavi projekta in osvežitvi, nevtralizacija vseh variant formul, odsotnost zapisov in prelivanja pri 390 px.

**Omejitve**
Skriti končni testi niso dostopni in niso navedeni kot opravljeni; ročni pregled prek `npm run dev` ni bil izveden (prilagodljivost preverjena avtomatsko). Podrobnosti so v `docs/agent/verification.md`.
