Korak `$speckit-implement` je opravljen.

**Izvedba (R01–R12)**
- Novo: `src/favorites.ts` (validacija P2, serializacija z enkratnimi nizi po UTF-16, `storage` brez povratnega zapisa), `src/useFavorites.ts` (stanje, `toggle`, `removeForProject`, izjema → opozorilo v pomnilniku).
- Spremenjeno: `src/components.tsx` (`FavoriteButton` z `aria-pressed`, zunaj povezave), `src/App.tsx` (globalno stanje, filter, števec `Priljubljeno: X od M.`, gumb za projekt, opozorilo `role=alert`), `src/TaskBoard.tsx` (gumbi na karticah, isti filter, števci vidnih), `src/styles.css` (Folio gradniki).
- Testi: `tests/agent/helpers.ts`, `tests/agent/p07-favorites.spec.ts` (13 testov za R01–R12, vključno z neveljavno shrambo, dogodki `storage`, tujim ključem, nedostopno shrambo, brez zapisov na API in 390 px).

**Preverjanje**
- `npm run check`: **59 uspešnih, 0 padlih** — 38 osnovnih (api + baseline desktop/mobile), 8 razvojnih P07, 13 lastnih (projekt `agent`); lint in build zelena.
- Rezultati in sledljivost: `docs/agent/verification.md`; tabela v `docs/agent/P07/spec.md` posodobljena z dejanskimi dokazi; `tasks.md` ima označenih 13 nalog (T002–T014).

**Omejitve**
- T001 (začetni posnetek pred spremembami) ni bil zajet, zato je v `tasks.md` ostal neoznačen; po spremembah vsi osnovni in razvojni testi uspejo, izhodiščno vedenje je ohranjeno.
- Ročni pregled v brskalniku ni bil izveden; preverjanje je avtomatizirano. Končni ocenjevalni testi niso dostopni in niso navedeni kot izvedeni.

Preostanek proračuna: ~599 s (faza do 09:02:36Z).
