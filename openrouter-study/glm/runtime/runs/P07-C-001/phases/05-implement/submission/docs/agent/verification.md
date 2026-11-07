# Preverjanje P07

## Opravljene naloge

- [x] T001 `src/useFavorites.ts`: validacija, kanonični zapis, dogodek `storage` in obravnava izjem.
- [x] T002 `src/App.tsx`: globalne priljubljene, filter, števec, kontrole in gumbi v preglednici.
- [x] T003 `src/TaskBoard.tsx`: gumbi priljubljenih na karticah in števci vidnih opravil.
- [x] T004 `src/styles.css`: Folio styling, viden fokus, opozorilo in ozki prikaz.
- [x] T005 `tests/agent/P07/favorites.spec.ts`: 18 lastnih Playwright testov za R01–R12.
- [x] T006 Celotno preverjanje je izvedeno; napake so bile odpravljene.
- [x] T007 Sledljivost R01–R12 je posodobljena v `docs/agent/P07/spec.md`.

## Izvedena preverjanja

- `npm run typecheck`: uspešno.
- `npm run lint`: uspešno.
- `npm run build`: uspešno.
- `npx playwright test tests/agent/P07/favorites.spec.ts --project=agent`: 18/18 uspešno.
- `npm run check`: uspešno; 64/64 testov, vključno z javnimi API/osnovnimi/razvojnimi P07 in lastnimi testi.

## Omejitve

- Končni testi P07 niso dostopni in niso izvedeni; zato niso navajani kot uspešni.
- Spremenjene so le dovoljene poti `src/`, `tests/agent/` in `docs/agent/`.
