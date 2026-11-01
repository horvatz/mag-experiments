Korak `$speckit-implement` je opravljen — vseh 12 nalog je izvedenih, rešitev je preverjena.

**Spremembe kode**
- `src/filters.ts` (novo): `normalize` (NFD, U+0300–U+036F, male črke), `splitWords`, `matchesQuery`, `filterTasks` (IN iskanja/stanja/osebe), `assigneeOptions` (`all` + različna neprazna imena).
- `src/App.tsx`: lokalno stanje filtrov, vrstica kontrol (`type=search`, dva `select`, gumb `Počisti filtre`), `role=status` z `Prikazano: N od M.`, povzetek in števci iz prikazanih opravil, `Ni zadetkov.`, ponastavitev prek `key={project.id}`.
- `src/styles.css`: `.filter-bar`, `.filter-field`, `.filter-search`, `.filter-status`, `.no-matches`, prelom pri ozki širini.
- `src/TaskBoard.tsx`: brez spremembe — stolpci in števci že izhajajo iz prejetega seznama, zato prejme filtrirana opravila.

**Preverjanja (dejanski zagoni)**
- `npm run typecheck`, `npm run lint`, `npm run build` — uspešno.
- `npm test` — **55 uspešnih**: 38 osnovnih (api/desktop/mobile), 8 razvojnih P03, 9 lastnih (`tests/agent/p03-filters.spec.ts`, R01–R12).
- Dokazi in sledljivost: `docs/agent/verification.md`; `docs/agent/P03/spec.md` kaže na dokaze, `tasks.md` ima označene vse naloge T001–T012.

**Omejitve**
- Končni skriti testi niso dostopni; preverjanje temelji na skupnih, razvojnih in lastnih testih.
- Vrstni red možnosti oseb je abeceden (ni predpisan); testi tečejo samo v Chromiumu; sočasne spremembe podatkov med nalaganjem niso del obsega.

Nobena obvezna zahteva ni neizpolnjena. Preostanek faze: ~600 s.
