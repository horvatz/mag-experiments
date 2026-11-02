Korak `$speckit-plan` je zaključen.

**Izdelek**
- `docs/agent/P10/plan.md` (88 vrstic) po Lean navodilu: tehnični kontekst, odločitve, datoteke in zaporedje dela.
- Ključne odločitve:
  - Čista logika vrstnega reda v novem `src/taskOrder.ts` (`OrderState { order, undo, redo }`, `moveUp/moveDown/undo/redo/resetOrder`, `push20`, meje) + `useTaskOrder`; enotna pravila za preglednico in tablo.
  - Stanje hrani ID-je (permutacija iste množice, R12); `ProjectView` je že keyed s `project.id`, zato menjava projekta/osvežitev ponastavita, preklop pogleda/podrobnosti pa ne (R10).
  - Preglednica v `src/App.tsx` in kartice v `src/TaskBoard.tsx` dobijo `Mesto opravila <id>` ter gumba `Premakni <id> gor/dol` zunaj povezav; kontrole zgodovine in `role=status` števec v `ProjectView`; slogi v `src/styles.css` (Folio, prelom pri ozkem zaslonu).
  - Brez novih odvisnosti, brez pisanja na API, `updateTask` ostane neuporabljen.
  - Preverjanje: `tests/agent/P10.spec.ts` z javnim razvojnim pripomočkom (`tests/development/helpers.ts`), robovi 0/1/>10 opravil, 21 premikov, pogled/podrobnosti/projekt/osvežitev; nato `lint`, `build`, `npm test` in vpis izidov v tabelo sledljivosti.

Nespremenjeno: `package.json`, konfiguracije, `server/`, `shared/`, skupni in razvojni testi, predloge in veščine. Preostanek proračuna: 963 s.
