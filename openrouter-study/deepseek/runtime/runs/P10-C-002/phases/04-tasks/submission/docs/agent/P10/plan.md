# Načrt izvedbe P10 — Lokalni vrstni red z razveljavitvami

**Funkcijska mapa**: `docs/agent/P10` | **Datum**: 2026-11-01 | **Spec**: `spec.md`
**Kontekst**: `task/instructions.md` (R01–R12), `PROJECT_RULES.md`,
[`.specify/memory/constitution.md`](../../../.specify/memory/constitution.md)

## Tehnični kontekst

- React 19 + TypeScript + Vite 8, ikone `lucide-react`, sistemska pisava in obstoječe
  slogovne spremenljivke v `src/styles.css` (potrjeni Folio, `docs/dizajn.md`).
- Brez novih odvisnosti in brez sprememb `package.json`, `vite.config.ts`,
  `playwright.config.ts`, `index.html`, `server/`, `shared/` ter skupnih testov.
- Podatki: obstoječi `useResource` bere `GET /api/projects` in
  `GET /api/projects/:id/tasks`; vrstni red odgovora je P0. Pisanja na API ni;
  `updateTask` ostane neuporabljen, `localStorage` in URL se ne uporabljata.
- Testi: Playwright projekti `agent` (`tests/agent/**/*.spec.ts`), `development-*`
  (`tests/development/P10.spec.ts`), `desktop/mobile` (`tests/baseline.spec.ts`) in `api`.

## Arhitektura in odločitve

1. **Ločena logika vrstnega reda** v `src/taskOrder.ts`: čisti model in reducer
   `OrderState = { order: string[]; undo: string[][]; redo: string[][] }` s funkcijami
   `initOrder(ids)`, `moveUp`, `moveDown`, `undo`, `redo`, `resetOrder` ter pomožnimi
   `canMoveUp/canMoveDown/canUndo/canRedo`. `push20` skrbi za `|U| ≤ 20`, neveljavna
   dejanja vrnejo isto stanje (R03, R06, R07). Razlog: enotna pravila za preglednico in
   tablo ter preprosto preverjanje mej brez podvajanja.
2. **React vez `useTaskOrder(ids)`** (v isti datoteki): `useState` + `useMemo`; uporablja
   jo `ProjectView` v `src/App.tsx`. Hrani ID-je, ne objektov Task, zato ostane permutacija
   iste množice (R12); prikazani seznam je `order.map((id) => tasksById.get(id))`.
   `ProjectView` je že keyed s `project.id`: menjava projekta in osvežitev remountata
   (ponastavitev na P0 z praznima U/R), preklop pogleda in podrobnosti pa ne (R10).
3. **Preglednica** (`src/App.tsx`): vsaka vrstica dobi element
   `aria-label="Mesto opravila <id>"` z globalnim mestom ter gumba
   `Premakni <id> gor` in `Premakni <id> dol` zunaj `.task-link`; gumba sta onemogočena
   na robu (`canMoveUp/canMoveDown`). Polja opravil se ne spreminjajo (R02).
4. **Tabla** (`src/TaskBoard.tsx`): prejme urejen seznam in callbacke; kartice filtrira po
   statusu, zato je relativni vrstni red znotraj stolpca ohranjen, premiki pa uporabljajo
   globalnega soseda in prikažejo globalno mesto (R09). Rank oznaka in gumba sta zunaj
   `.board-card`; statusi se ne spreminjajo.
5. **Kontrole zgodovine** v `ProjectView`: gumbi `Razveljavi premik`, `Ponovi premik`,
   `Začetni vrstni red` in element `role="status"` z
   `aria-label="Zgodovina vrstnega reda"` ter besedilom `Razveljavitve: U. Ponovitve: R.`;
   onemogočeni pri praznih skladih (R11) oziroma pri P = P0 (R08).
6. **Slog** (`src/styles.css`): novi razredi (npr. `.order-controls`, `.task-rank`,
   `.task-actions`) v obstoječih gradnikih in barvah; na ozkem zaslonu se kontrole
   prelomijo, `.table-scroll`/`.board-scroll` ostaneta za notranje drsenje (SC-003).
7. **Preverjanje**: `tests/agent/P10.spec.ts` uporabi javni razvojni pripomoček
   `tests/development/helpers.ts` (`mount` s poljubnimi zapisi, `click`, `expectIds`,
   `board`, `readonly`); pokriti R01–R12 in robove (0, 1, >10 opravil, enaki naslovi,
   Unicode, 21 premikov, pogled/podrobnosti/projekt/osvežitev). Zapisov na API ne sme biti
   (`writes`, `saveRequests`).

## Datoteke

| Datoteka | Sprememba |
| --- | --- |
| `src/taskOrder.ts` | novo: model, reducer in `useTaskOrder` |
| `src/App.tsx` | `ProjectView`: stanje vrstnega reda, kontrole zgodovine, vrstica z rankom in gumbi |
| `src/TaskBoard.tsx` | kartice: rank in gumba; sprejem urejenega seznama ter callbackov |
| `src/styles.css` | slogi novih kontrol v Folio gradnikih |
| `tests/agent/P10.spec.ts` | novi testi za R01–R12 |
| `docs/agent/P10/spec.md` | po izvedbi dopolnjena tabela sledljivosti z izidi |

Nespremenjeno: `package.json`, `vite.config.ts`, `playwright.config.ts`, `index.html`,
`server/`, `shared/`, `tests/baseline.spec.ts`, `tests/api.spec.ts`, `tests/development/*`,
`.specify/templates/*`, `.agents/skills/*`.

## Zaporedje dela

1. `src/taskOrder.ts`: model in reducer (premiki, meje, U/R, cap 20, reset) + hook.
2. `src/App.tsx`: vključitev stanja, urejena preglednica, rank in gumba, kontrole zgodovine
   s števcem.
3. `src/TaskBoard.tsx`: rank in gumba na karticah, ohranjena razdelitev po statusih.
4. `src/styles.css`: slogi in prelom na ozkem zaslonu.
5. `tests/agent/P10.spec.ts`: testi R01–R12 + robovi; zagon `npx playwright test
   tests/agent tests/development/P10.spec.ts` in skupnih testov.
6. Preverjanje celote (`npm run lint`, `npm run build`, `npm test`) in vpis izidov v
   tabelo sledljivosti v `spec.md`.

## Tveganja in omejitve

- `|R| ≤ 20` je izvedeno iz omejitve U (R07); če testi pokažejo drugače, se pravilo
  popravi v `src/taskOrder.ts` in zapiše v spec.
- Neveljaven robni premik ne sme počistiti R (R06); preverja se v testih.
- Brez trajne shrambe: osvežitev in menjava projekta ponastavita (R10).
- Razvojni pripomoček je samo berljiv; če se njegov vmesnik spremeni, testi v
  `tests/agent/` dobijo lasten pripomoček znotraj dovoljenih map.
- Nobenih vej ali commitov; delo ostane v delovnem drevesu.
