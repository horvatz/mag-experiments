# P10 Načrt: Lokalni vrstni red z razveljavitvami

## Tehnični kontekst

Aplikacija je React 19 + TypeScript + Vite. Projekte in opravila beremo z obstoječim `useResource` prek javnega API-ja `/api`; shranjevalnih klicev za P10 ni. Pogleda `table` in `board` sta v isti komponenti `ProjectView`, podrobnosti pa v `TaskDetails`. Slog je v `src/styles.css` po potrjenem dizajnu Folio. Ne spreminjamo strežnika, skupnih tipov, odvisnosti, nastavitve testov ali skupne infrastrukture.

## Odločitve

- Vrstni red, zgodovini razveljavitev in ponovitev hranimo izključno v lokalnem stanju trenutnega `ProjectView`, ne v URL-u, `localStorage` ali API-ju.
- Osnovna enota zgodovine je celoten zaporedje ID-jev. Vsak dovoljen vnos (veljaven premik, reset, razveljavitev ali ponovitev) prestavi trenutno permutacijo v nasprotni sklad in vzame vrh ustreznega sklada.
- `undoStack` omejimo na 20 z odstranitvijo najstarejšega vnosa. `redoStack` ne omejujemo, ker pokriva vse trenutno razveljavljene korake.
- Ob prejemu novega ali ponovno naloženega polja `Task[]` ponastavimo izhodiščni in trenutni vrstni red ter obe zgodovini. Pri spremembi pogleda ali podrobnosti stanje ostane, ker ostane ista instanca `ProjectView`.
- Za delo s stanjem dodamo majhen vtičnik `src/useTaskOrder.ts`. UI postavimo z obstoječimi razredi in splošnimi razredi za male gumbi, brez oblikovne preureditve Folio.

## Datoteke in spremembe

1. `src/useTaskOrder.ts`
   - Sprejme `Task[]` in vrne `orderedTasks`, `move`, `undo`, `redo`, `reset`, `canUndo`, `canRedo`, `canReset`, `undoCount` in `redoCount`.
   - Implementira pravila sprememb stanja iz `spec.md`, vključno z mejo 20 in pogoji za onemogočena dejanja.
2. `src/App.tsx`
   - Uporabi vtičnik v `ProjectView`.
   - Doda vrstnico `Razveljavitve: U. Ponovitve: R.` z `role="status"` in `aria-label="Zgodovina vrstnega reda"`.
   - Doda gumba `Razveljavi premik` in `Ponovi premik` ter `Začetni vrstni red`.
   - Preglednico izriše po `orderedTasks`, ne po surovem API polju.
3. `src/TaskBoard.tsx`
   - Sprejme urejena opravila in znotraj obstoječih stolpcev stanj ohrani relativni vrstni red.
   - Na kartico doda globalno mesto in gumba za premik gor/dol zunaj obstoječe povezave.
4. `src/App.tsx` (preglednica)
   - Na vsako vrstico doda globalno mesto z `aria-label="Mesto opravila <id>"` in gumba za premik gor/dol zunaj povezave na podrobnosti.
5. `src/styles.css`
   - Doda minimalne razrede za akcije ob vrstici/kartici, glavne akcije in status zgodovine ter poskrbi za ozko postavitev in vidno tipkovnično fokuso.
6. `tests/agent/p10.spec.ts`
   - Playwright testi pokrijejo osnovni vrstni red, veljavne in robne premike, undo/redo zaporedja, mejo 20, reset, oba pogleda, podrobnosti, prazen/enoopravilni projekt, števce in odsotnost PATCH klicev.

## Preverjanje

- Izvedemo `npm run lint`, `npm run build` in agentne ter skupne teste z `npm test`; v dokumentaciji zabeležimo le dejansko izvedene teste.
- Preverimo, da obstoječa dostopna imena, `data-task-id`, preglednica in tabla ostanejo nespremenjena, ter da stran pri širini 390 px nima vodoravnega širjenja dokumenta.
