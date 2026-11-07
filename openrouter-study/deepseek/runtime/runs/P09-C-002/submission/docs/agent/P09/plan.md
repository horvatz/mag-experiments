# Načrt P09: Stanje pogleda v povezavi in zgodovini

Podlaga: `docs/agent/P09/spec.md`, `.specify/memory/constitution.md`,
`PROJECT_RULES.md`. Obseg sprememb ostaja `src/`, `tests/agent/`,
`docs/agent/`; infrastruktura, odvisnosti in skupni tipi so nespremenjeni.

## Tehnični kontekst

React 19 + TypeScript 6 + Vite 8; usmerjanje je ročno prek URL fragmenta
(`src/navigation.ts`, `useSyncExternalStore` na `hashchange`). Podatki se
berejo z `useResource` prek javnega API-ja `/api/`; stanje ni v
`localStorage`, pisnih klicev ne dodajamo. Preverjanje: Playwright
(`api`, `desktop`, `mobile`, `development-*`, `agent`), `npm run typecheck`,
`npm run lint`, `npm run build`.

## Arhitektura in odločitve

1. **URL je edini vir resnice za potrjeno stanje.** `navigation.ts` dobi
   razširjen `useRoute()`: poleg `projectId`, `taskId`, `view` vrne
   `filters = {q, status, order}` po pravilih R01/R04 (privzeto
   `""`/`all`/`original`, prva pojava parametra, neznane vrednosti →
   privzeto, neznani parametri se ignorirajo, brez samodejnega prepisa).
   `buildHash(projectId, {view, taskId, filters})` sestavi URL: obreže `q`,
   izpusti privzete parametre, ohrani `view=board`, odstrani neznane
   parametre in URL-kodira vrednosti.
2. **Čista logika v `src/viewState.ts`** (novo): `normalizeText` (trim, NFD,
   odstranitev U+0300–U+036F, male črke), `matchesPhrase`, `filterTasks`,
   `orderTasks` (stabilno po UTF-16), `DEFAULT_FILTERS`, `sameFilters`.
   Uporablja jo prikaz; ni odvisna od Reacta.
3. **Osnutek je lokalno stanje `ProjectView`.** `useState` z vrednostmi
   kontrol; `useEffect` ob vsaki spremembi potrjenega stanja ali poti
   (`projectId`, `taskId`, `view`, `filters`) nastavi `draft := confirmed`
   (R07, R08, R10). Uporabi pogled: `Q = trim(q_d)`, cilj
   `(Q, status_d, order_d)`; če je enak potrjenemu, ni spremembe in ni novega
   zgodovinskega stanja, sicer `window.location.hash = buildHash(...)` (eno
   novo stanje). Ponastavi pogled uporabi isti postopek s privzetimi
   filtri (R11) in obdrži `view`.
4. **Prikaz.** `T` so opravila projekta; `V = orderTasks(filterTasks(T, C))`.
   Preglednica in tabla prejmeta `V`; tabla združuje po stanju v izvornem
   relativnem vrstnem redu. Števec `role=status` z
   `aria-label="Rezultati povezave"` kaže `Prikazano: N od M.`; pri `N = 0`
   in `M > 0` se pokaže `Ni zadetkov.`, pri `M = 0` obstoječe sporočilo
   praznega projekta. Kontrole so nad seznamom opravil: `input type=search`
   (Iskanje v povezavi), dva `select` (Stanje v povezavi, Vrstni red v
   povezavi), gumba Uporabi pogled in Ponastavi pogled.
5. **Ohranitev stanja ob navigaciji.** Preklop Preglednica/Tabla,
   odpiranje/zapiranje podrobnosti (gumb, Escape) in povezave opravil
   uporabijo `buildHash` s trenutnimi `filters` (R08, R09). Klik na projekt v
   stranskem meniju uporabi privzete filtre in ohrani `view` (R10);
   neposredna povezava s parametri jih upošteva. `TaskDetails` dobi
   `filters`, da `close()` ne izgubi parametrov.
6. **Dizajn in ozek zaslon.** Nove kontrole uporabijo obstoječe gradnike in
   spremenljivke Folio (`src/styles.css`), brez preoblikovanja; na 390 pik se
   vrstica kontrol prelomi (`flex-wrap`, `min-width: 0`), stran se ne širi,
   notranje drsenje preglednice/table ostane.
7. **Brez pisanja.** Nobeno dejanje ne kliče `updateTask`, ne uporablja
   `/__test/` in ne shranjuje stanja v `localStorage` (R12).

## Datoteke

| Datoteka | Sprememba |
| --- | --- |
| `src/navigation.ts` | razširjen `useRoute` (filtri), `buildHash`, ohranjena `projectUrl`/`taskUrl` za združljivost |
| `src/viewState.ts` | novo: normalizacija, ujemanje, filtriranje, urejanje, privzete vrednosti |
| `src/App.tsx` | kontrole, osnutek, potrditev/ponastavitev, števec, prikaz `V`, povezave s parametri |
| `src/TaskBoard.tsx` | sprejme filtrirana opravila in `filters` za povezave kartic |
| `src/TaskDetails.tsx` | `close()` z ohranjenimi `filters` |
| `src/styles.css` | slog vrstice kontrol v duhu Folio, odzivnost 390 pik |
| `tests/agent/P09.spec.ts` | lastna preverjanja R01–R12 prek UI (in brez pisanja) |
| `docs/agent/P09/spec.md` | vpis dejanskih izidov v tabelo sledljivosti |

## Preverjanje

1. `npm run typecheck`, `npm run lint`, `npm run build`.
2. Razvojni primeri: `npx playwright test tests/development/P09.spec.ts`.
3. Skupni testi: `npx playwright test tests/baseline.spec.ts tests/api.spec.ts`
   (projekti `desktop`, `mobile`, `api`).
4. Lastni testi: `npx playwright test tests/agent/P09.spec.ts`.
5. Izidi (ime testa, dnevnik) se vpišejo v `spec.md`; neizvedeni testi se
   navedejo kot neizvedeni.

## Skladnost z ustavo

Načelo I (obseg): spremembe le v `src/`, `tests/agent/`, `docs/agent/`.
Načelo II: obstoječi gradniki in spremenljivke Folio. Načelo III: branje le
prek `/api/`, brez `/__test/` in `localStorage`. Načeli IV in V: vsaka
zahteva dobi pogoj, kodo in dejansko izveden dokaz.
