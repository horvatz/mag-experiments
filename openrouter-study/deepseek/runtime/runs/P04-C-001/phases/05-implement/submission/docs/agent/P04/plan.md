# Načrt izvedbe P04: stabilno razvrščanje z dvema ključema

- Različica: 1.0, datum: 2026-11-01
- Povezave: `docs/agent/P04/spec.md`, `.specify/memory/constitution.md`, `PROJECT_RULES.md`

## Tehnični kontekst

- React 19 + TypeScript + Vite z obstoječimi odvisnostmi (`lucide-react`); novih paketov ni.
- Podatki: branje `GET /api/projects` in `GET /api/projects/:id/tasks`; pisanje ni potrebno.
- Testiranje: Playwright (konfigurirani projekti `desktop`, `mobile`, `agent`, `development-*`); Chromium je nameščen; lastni testi v `tests/agent/`.
- Stanje razvrščanja je lokalno v React komponentah; brez trajne shrambe, URL-ja in novih API-jev.
- Razvojni primeri `tests/development/P04.spec.ts` in `helpers.ts` določajo pričakovana dostopna imena in vrstne rede; uporabniški vmesnik jih ne uvaža.

## Odločitve

1. Čista logika v novi datoteki `src/sorting.ts`: `normaliziraj`, `primerjaj`, `sortTasks`, tipi `SortKey`, `SortDirection`, `SortSettings` in privzete nastavitve. Ločena od Reacta, da je preverljiva neposredno.
2. Razvrščanje je projekcija: `sortTasks` vrne novo polje in vhoda ne spreminja; preglednica in tabla uporabita isto razvrščeno polje (R07, R11).
3. `original` kot primarni ključ: `sortTasks` vrne vhodni vrstni red ne glede na smer in druge kontrole (R01, R06).
4. Smer obrne samo izid primerjave (množenje z −1); izenačeni elementi ohranijo izvorni relativni red (stabilno urejanje, R04, R06).
5. Enak primarni in sekundarni ključ je dovoljen: ob enakosti primarnega vrne sekundarna primerjava 0, zato dodatnega obrata ni (R06).
6. Stanje σ = (primarniKljuč, primarnaSmer, sekundarniKljuč, sekundarnaSmer) je React state v `ProjectView`; ker ima komponenta `key={project.id}`, menjava projekta samodejno ponastavi σ0, osvežitev pa tudi (R08, R09).
7. Nove kontrole v `src/SortControls.tsx` so vidne v obeh pogledih z dostopnimi imeni `Primarni ključ`, `Primarna smer`, `Sekundarni ključ`, `Sekundarna smer` in gumbom `Izvorni vrstni red`; vrednosti izbir so `original`/`title`/`assignee`/`status`/`dueDate`, `none`, `asc`/`desc`.
8. Stil orodne vrstice uporabi obstoječe gradnike in spremenljivke Folio (`src/styles.css`); potrjeni videz in postavitve se ne spreminjajo.
9. Nespremenjeni ostanejo `server/`, `shared/`, `tests/baseline.spec.ts`, `tests/api.spec.ts`, `playwright.config.ts`, `package.json` in skupni tipi.

## Datoteke

| Datoteka | Sprememba |
| --- | --- |
| `src/sorting.ts` | novo: normalizacija, primerjave, stabilno urejanje, privzete nastavitve |
| `src/SortControls.tsx` | novo: štiri označene izbire in gumb za ponastavitev |
| `src/App.tsx` | stanje σ, izračun razvrščenega polja, posredovanje v prikaz |
| `src/TaskBoard.tsx` | minimalno: prejme že razvrščeno polje |
| `src/styles.css` | orodna vrstica v skladu z dizajnom Folio |
| `tests/agent/*.spec.ts` | lastni testi za R01–R12 |
| `docs/agent/P04/*` | `spec.md`, `plan.md`, `tasks.md`, dokazila |

## Pravila izvedbe

- Normalizacija v vrstnem redu: NFD, odstranitev U+0300–U+036F, male črke; primerjava normaliziranih nizov z `<` in `>` (UTF-16), brez `localeCompare` in brez številskega razvrščanja.
- `status`: todo = 0, in_progress = 1, done = 2; `dueDate`: veljavni `YYYY-MM-DD` se primerjajo kot nizi (kronološko).
- Brez zapisov na API, brez trajne shrambe in brez novih odvisnosti; `data-task-id`, dostopna imena in `aria-label="Pregled stanj opravil"` ostanejo.

## Preverjanje

- `npm run lint`, `npm run build` (typecheck) in `npm test` (skupni, razvojni in lastni testi).
- Lastni testi v `tests/agent/` pokrijejo R01–R12; razvojni primeri se uporabijo kot referenca in se ne spreminjajo.
- Izidi se po dejanskem zagonu vpišejo v razdelek Izvedba in sledljivost v `spec.md`.

## Odprta vprašanja

- Blokirajočih vprašanj ni; razporeditev in besedilo novih kontrol nista predpisana, zato se uporabijo obstoječi gradniki.
