**Rezultat**

Pilotna naloga P07 je izvedena v celoti po postopku A (en agent). Vse zahteve R01–R12 so implementirane in preverjene.

**Spremembe**
- `src/favorites.ts` (nov): validacija/zapis `folio:favorites:v1` (unikaten, sortiran UTF-16), hook `useFavorites` z `storage` dogodki in odpornostjo na izjeme.
- `src/FavoriteButton.tsx` (nov): gumb `Priljubljeno opravilo <id>` z `aria-pressed`, ločen od povezave opravila.
- `src/App.tsx`: filter `Prikaži le priljubljena`, gumb `Odstrani priljubljene tega projekta`, števec `Priljubljeno: X od M.`, prazno stanje in opozorilo `role=alert` (»shramba«).
- `src/TaskBoard.tsx`, `src/styles.css`: tabla z gumbi in vidnimi števci stolpcev; Folio videz ohranjen.
- `tests/agent/` (nov): 12 lastnih testov A01–A12 + pomožna datoteka.
- `docs/agent/specification.md` (v1.1 s popravkom) in `docs/agent/verification.md` (dejanski ukazi, sledljivost R01–R12, omejitve).

**Preverjanje**
- `npm run check`: **58 passed** (lint + build + 38 izhodiščnih/API, 8 razvojnih P07, 12 lastnih), brez napak.
- Med izvedbo odkrit in odpravljen hrošč: tabela je prikazovala vsa opravila namesto filtriranih; popravek zabeležen v `docs/agent/verification.md`.

**Omejitve**
- Končni ocenjevalni testi niso dostopni in niso bili izvedeni.
- `storage` dogodek je preverjen sintetično (ne z dvema resničnima zavihkoma); izjema shrambe je simulirana prek `Storage.prototype`.
- Skupni povzetek stanj ostaja vezan na vsa opravila projekta; R10 določa le števce stolpcev table.

Nezaključenih zahtev ni.
