Korak `$speckit-implement` je zaključen. Vsa dela so v delovnem drevesu, brez vej in commitov.

**Izvedba**
- `src/taskOrder.ts` (nov): model `OrderState`, `moveUp/moveDown/undo/redo/resetOrder`, `pushLimited` (|U| ≤ 20), `can*` predikati in `useTaskOrder(tasks)`; stanje hrani ID-je (permutacija iste množice).
- `src/App.tsx`: nova `TaskSection` (ključ po ID-jih iz podatkov → menjava projekta/osvežitev ponastavita, pogled/podrobnosti ne), vrstica z `Mesto opravila <id>` in gumboma zunaj povezave, kontrole `Razveljavi premik`/`Ponovi premik`/`Začetni vrstni red` ter `role=status` števec `Razveljavitve: U. Ponovitve: R.`.
- `src/TaskBoard.tsx`: rank oznaka in gumba na karticah (zunaj `.board-card`), globalni premiki, ohranjen relativni vrstni red v stolpcih.
- `src/styles.css`: slogi novih kontrol v Folio gradnikih, prelom na ozkem zaslonu.
- `tests/agent/P10.spec.ts`: 13 lastnih testov za R01–R12 (tudi 21 premikov/meja 20, 0/1 opravil, enaki naslovi, pogled/projekt/osvežitev, `readonly` pri 390 px).

**Preverjanje** (`npm run check`, dvakrat)
- `eslint` + `tsc --noEmit` + `vite build` uspešno; **59/59 testov uspešnih**: 38 osnovnih (api 14, baseline desktop 12, mobile 12), 8 razvojnih D01–D04 in 13 lastnih.
- Dokazi: `docs/agent/verification.md` (izidi po korakih in po zahtevah), tabela sledljivosti v `docs/agent/P10/spec.md` (R01–R12: pogoj → test → koda → izid), dnevnik v `test-results/run/`.

**Naloge**: T002–T016 opravljene in označene v `docs/agent/P10/tasks.md`. T001 (zagon izhodišča *pred* spremembami) ni bil izveden in je zato ostal neoznačen z zapisom v `tasks.md` in `verification.md`; skupni testi so bili izvedeni po izvedbi in vsi uspejo.

**Omejitve**: končni skriti testi niso dostopni; pravila se preverjajo prek UI (ni ločenih enotskih testov za `taskOrder.ts`). Spremenjene so samo dovoljene datoteke; `server/`, `shared/`, odvisnosti in skupni testi niso bili spremenjeni.
