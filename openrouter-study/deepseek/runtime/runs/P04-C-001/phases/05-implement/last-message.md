Implementacija je končana in preverjena — vseh 14 nalog iz `tasks.md` je označenih `[x]`.

**Spremembe**
- `src/sorting.ts` (novo): normalizacija (NFD → U+0300–U+036F → male črke), primerjave (UTF-16, rang stanj, datumi), stabilno urejanje s smerjo, ki obrne le izid primerjave; `original` vrne izvorni red.
- `src/SortControls.tsx` (novo): štiri izbire (`Primarni ključ`, `Primarna smer`, `Sekundarni ključ`, `Sekundarna smer`) in gumb `Izvorni vrstni red`.
- `src/App.tsx`: stanje σ, razvrščeno polje za preglednico in tablo; `key={project.id}` poskrbi za ponastavitev ob menjavi projekta.
- `src/styles.css`: orodna vrstica v slogu Folio (tudi na 390 pik). `src/TaskBoard.tsx` ni potreboval spremembe.

**Preverjanje**
- `npm run check` (lint, typecheck, build, vsi testi): **68 testov uspešno** — 38 osnovnih, 8 razvojnih P04, 22 lastnih (`tests/agent/sort-table|sort-board|sort-state|sort-projection.spec.ts` + `helpers.ts`).
- Dokazi in sledljivost R01–R12: `docs/agent/verification.md` in posodobljen `docs/agent/P04/spec.md` (različica 1.1).

**Omejitve**
- Končni ocenjevalni testi niso dostopni; ročni ogled prek `npm run dev` ni bil izveden (preverjeno prek testov).
- Infrastruktura, skupni testi in odvisnosti nespremenjeni; brez vej in commitov. Preostanek: ~560 s.
