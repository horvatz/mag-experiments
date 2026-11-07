**Implementacija**
- Dodana sta shramba in React hook v `src/favorites.ts:1`.
- Priljubljena, filter, odstranjevanje, števec in opozorila so povezani v `src/App.tsx:10`.
- Tabla je dopolnjena z neodvisnimi gumbi in števci v `src/TaskBoard.tsx:14`.
- Folio styling je razširjen v `src/styles.css:51`.
- Dodani lastni testi: `tests/agent/P07.storage.spec.ts:1`, `tests/agent/P07.ui.spec.ts:1`, `tests/agent/P07.events.spec.ts:1`.

**Preverjanja**
- `npm run check`: 58/58 uspešno — 14 API, 24 osnovnih, 8 razvojnih in 12 lastnih testov.
- Gradnja in tipovna kontrola uspešna.
- Sledljivost R01–R12 je posodobljena v `docs/agent/P07/spec.md:82`.
- Zadnji zapis preverjanj je v `docs/agent/P07/verification.md:1`.
- Vse naloge `T001`–`T013` so označene kot opravljene v `docs/agent/P07/tasks.md:1`.
- Omejitve: števec ni prikazan med začetnim nalaganjem opravil; napake shrambe so preverjene z simulirano izjemo.
