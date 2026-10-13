# Načrt izvedbe: P10 — Lokalni vrstni red z razveljavitvami

Specifikacija: `docs/agent/P10/spec.md`. Ustava: `.specify/memory/constitution.md`.
Zahteve R01–R12 iz `task/instructions.md`; obseg sprememb ostaja `src/`,
`tests/agent/`, `docs/agent/`.

## Tehnični kontekst

- React 19 + TypeScript 6 + Vite 8, ikone `lucide-react`, obstoječi
  `src/styles.css` in potrjeni videz Folio; brez novih odvisnosti.
- Podatki iz javnega API-ja prek `useResource`/`request`; stanje je lokalno v
  pomnilniku strani, brez `localStorage` in brez zapisov na strežnik.
- Testiranje: Playwright 1.63 (`tests/baseline.spec.ts`, `tests/api.spec.ts`,
  lastni testi v `tests/agent/`). `/__test/` uporablja samo testni program.

## Odločitve

1. **Stanje vrstnega reda v `ProjectView`** (`src/App.tsx`): `order: string[]`
   (ID-ji), `undo: string[][]`, `redo: string[][]`. Ob nalaganju se `order`
   nastavi na vrstni red iz API-ja; neznani ID-ji se pri morebitni spremembi
   podatkov dodajo na konec, znani ohranijo relativni vrstni red.
   `ProjectView` je že vezan na `key={project.id}`, zato menjava projekta
   ponastavi stanje; osvežitev strani prav tako (R10).
2. **Čista prehodna logika v `src/order.ts`**: funkcije `move(order, id, dir)`,
   `undoStep(state)`, `redoStep(state)`, `resetStep(state, initial)` z mejami
   (rob = neveljavno, brez spremembe zgodovine), skladom `undo` omejenim na 20
   in čiščenjem `redo` ob novem premiku (R02–R08). Ločena čista funkcija je
   neposredno preverljiva in preprečuje podvajanje med pogledi.
3. **Nadzor zgodovine v `src/OrderControls.tsx`**: gumbi `Razveljavi premik`,
   `Ponovi premik`, `Začetni vrstni red` (onemogočeni pri ničli oz. v izvoru)
   in element `role=status` z besedilom `Razveljavitve: U. Ponovitve: R.` ter
   `aria-label="Zgodovina vrstnega reda"` (R11).
4. **Preglednica** (`src/App.tsx`): vrstice se izrišejo po `order`; vsaka ima
   element `aria-label="Mesto opravila <id>"` s `poz(id)` in gumba
   `Premakni <id> gor/dol` zunaj povezave opravila; ohranjeni `data-task-id`
   in obstoječa dostopna imena (R01, R02, R12).
5. **Tabla** (`src/TaskBoard.tsx`): stolpci stanj ostanejo stalni; vsak stolpec
   filtrira `order` (relativni vrstni red). Premiki na kartici uporabljajo
   globalnega soseda prek istih funkcij in ne spreminjajo statusa (R09).
6. **Slogi** (`src/styles.css`): majhni gumbi/oznake mest po obstoječih
   spremenljivkah; pri 390 px se stran ne razširi, notranje drsenje ostane.
7. **Lastni testi** (`tests/agent/P10.spec.ts`): ločen Playwright test z
   lastnim pomožnim modulom `tests/agent/helpers.ts` po vzoru
   `tests/development/helpers.ts` (nadzorovani GET odgovori, nadzor zapisov).
   Pokrijejo R01–R12: začetni vrstni red in mesta, premike in robove, undo/redo
   zaporedja, mejo 20, izvor, oba pogleda, števce in odsotnost zapisov.

## Datoteke

| Datoteka | Sprememba |
| --- | --- |
| `src/order.ts` | novo: čiste prehodne funkcije in meje skladov |
| `src/OrderControls.tsx` | novo: gumbi zgodovine in `role=status` |
| `src/App.tsx` | stanje vrstnega reda, preglednica z mesti in gumbi |
| `src/TaskBoard.tsx` | relativni vrstni red, mesta in premiki na karticah |
| `src/styles.css` | slogi novih kontrol znotraj obstoječih gradnikov |
| `tests/agent/P10.spec.ts`, `tests/agent/helpers.ts` | novo: lastna preverjanja |
| `docs/agent/P10/spec.md` | dopolnjena sledljivost z dejanskimi dokazi |
| `docs/agent/P10/tasks.md`, `docs/agent/P10/delivery.md` | opravila in predaja |

## Preverjanje

1. `npm run typecheck` in `npm run lint`.
2. `npx playwright test --project=agent` (lastni testi) ter skupna
   `tests/baseline.spec.ts` in `tests/api.spec.ts` (regresija).
3. Ročni pregled obeh pogledov pri 390 px in 1440 px; brez zapisovalnih
   klicev (`readonly` nadzor v testih).
4. Dokazi (ime testa, rezultat) se vpišejo v `spec.md`; neizvedeno se označi
   kot neizvedeno.

## Tveganja in omejitve

- Ne spreminjamo strežnika, skupnih tipov, odvisnosti ali konfiguracije; če bi
  zahteva to potrebovala, se ustavi in navede omejitev.
- Končni ocenjevalni testi niso dostopni; preverjanje temelji na lastnih in
  skupnih testih ter ročnem pregledu.
