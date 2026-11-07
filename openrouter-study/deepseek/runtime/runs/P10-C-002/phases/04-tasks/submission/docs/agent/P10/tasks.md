# Naloge izvedbe P10 — Lokalni vrstni red z razveljavitvami

**Funkcijska mapa**: `docs/agent/P10` | **Datum**: 2026-11-01
**Vira**: `spec.md` (R01–R12, scenariji P1–P3), `plan.md`, ustava projekta

Vsaka naloga ima oznako T### in pot datoteke. Naloge se izvajajo po vrsti; koda se
spreminja samo v `src/`, testi v `tests/agent/`, dokumenti v `docs/agent/`.

## Faza 1 — Priprava

- [ ] T001 Preveri izhodišče: `npx playwright test tests/baseline.spec.ts tests/api.spec.ts tests/development/P10.spec.ts` in zabeleži izid (pričakovano: D01–D04 padajo, ker funkcija še ne obstaja).
- [ ] T002 Preberi obstoječe vedenje `ProjectView` (`src/App.tsx`), `TaskBoard` (`src/TaskBoard.tsx`) in slogovne spremenljivke (`src/styles.css`); potrdi, da se `server/`, `shared/` in skupni testi ne spreminjajo.

## Faza 2 — Temelj (skupna logika)

- [ ] T003 Ustvari `src/taskOrder.ts`: tip `OrderState = { order: string[]; undo: string[][]; redo: string[][] }`, `initOrder`, `moveUp`, `moveDown`, `undo`, `redo`, `resetOrder`, `push20` (|U| ≤ 20), `canMoveUp/canMoveDown/canUndo/canRedo`, `canReset` (P ≠ P0).
- [ ] T004 V `src/taskOrder.ts` dodaj `useTaskOrder(ids)` z `useState`/`useMemo`; stanje se ponastavi ob spremembi množice/ure ID-jev (menjava projekta in osvežitev), preklop pogleda pa ga ne remounta.

## Faza 3 — Uporabniška zgodba P1: premiki in meje (R01–R03, R09, R11)

- [ ] T005 `src/App.tsx`: `ProjectView` uporabi `useTaskOrder`; vrstica dobi `aria-label="Mesto opravila <id>"` z globalnim mestom ter gumba `Premakni <id> gor`/`Premakni <id> dol` zunaj `.task-link`, onemogočena na robu.
- [ ] T006 `src/TaskBoard.tsx`: prejme urejen seznam in callbacke; kartica dobi rank oznako in gumba zunaj `.board-card`; filtriranje po statusu ohrani relativni vrstni red v stolpcu, statusi se ne spreminjajo.
- [ ] T007 `src/styles.css`: slogi novih kontrol (`.order-controls`, `.task-rank`, `.task-actions`) v Folio gradnikih; na 390 px brez vodoravnega prelivanja strani (notranje drsenje `.table-scroll`/`.board-scroll` ostane).
- [ ] T008 `tests/agent/P10.spec.ts`: testi R01–R03, R09, R11 (globalna mesta, enaki naslovi, robna onemogočitev, prazni in enojni projekt, tabla z globalnimi premiki) z javnim pripomočkom `tests/development/helpers.ts`.

## Faza 4 — Uporabniška zgodba P2: razveljavitev in ponovitev (R04–R07)

- [ ] T009 `src/App.tsx`: kontrole `Razveljavi premik`, `Ponovi premik`, `Začetni vrstni red` in element `role="status"` (`aria-label="Zgodovina vrstnega reda"`, besedilo `Razveljavitve: U. Ponovitve: R.`), usklajene z `canUndo/canRedo/canReset`.
- [ ] T010 `tests/agent/P10.spec.ts`: testi R04–R07 (zaporedji U/R, več razveljavitev in ponovitev brez izgub/podvajanj, nov premik zavrže R, neveljaven robni premik ne, 21 premikov in meja 20).

## Faza 5 — Uporabniška zgodba P3: začetni vrstni red in lokalnost (R08, R10, R12)

- [ ] T011 `src/App.tsx`: `Začetni vrstni red` vrne P0 kot eno dejanje in počisti R; pri P = P0 je gumb onemogočen.
- [ ] T012 `tests/agent/P10.spec.ts`: testi R08, R10, R12 (reset in ponovitve, preklop pogleda/podrobnosti ohrani stanje, menjava projekta in osvežitev ponastavita, ni ne-GET klicev, `saveRequests = 0`, ista množica ID-jev, polja in števci stanj nespremenjeni).

## Faza 6 — Preverjanje in oddaja

- [ ] T013 Zaženi `npm run lint` in `npm run build` (`tsc --noEmit` + Vite); odpravi napake v dovoljenih datotekah.
- [ ] T014 Zaženi celotno preverjanje: `npx playwright test` (agent, development, baseline desktop/mobile, api); zabeleži izide in morebitne neizvedene dele.
- [ ] T015 Dopolni tabelo sledljivosti v `docs/agent/P10/spec.md`: za vsako zahtevo R01–R12 pogoj, test/scenarij, datoteka in del kode ter dejanski izid z dokazom (ime testa, dnevnik); neizvedenih testov ne označi kot uspešnih.
- [ ] T016 Preveri skladnost z ustavo in `PROJECT_RULES.md` (spremenjene samo dovoljene datoteke, Folio ohranjen, brez novih odvisnosti in zapisov na API); zapiši omejitve in nepreverjene scenarije v `spec.md`.
