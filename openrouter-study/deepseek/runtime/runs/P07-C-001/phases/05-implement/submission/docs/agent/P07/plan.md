# Načrt izvedbe P07 — Priljubljena opravila in trajna shramba

Povezave: `spec.md` (zahteve R01–R12), `.specify/memory/constitution.md`, `docs/dizajn.md`.
Razvojni primeri `tests/development/P07.spec.ts` so samo referenca; lastni testi so v `tests/agent/`.

## Tehnični kontekst

- React 19.3 + TypeScript + Vite; Node 24.11.1; Playwright 1.63 (projekt `agent` pokriva `tests/agent/**/*.spec.ts`).
- Podatki izključno prek obstoječega javnega API-ja (`src/api.ts`, `src/useResource.ts`); brez novih odvisnosti,
  sprememb strežnika, skupnih tipov, nastavitev in skupnih testov.
- Obstoječa koda: `src/App.tsx` (preglednica in kontrole), `src/TaskBoard.tsx` (tabla), `src/TaskDetails.tsx`,
  `src/navigation.ts` (hash usmerjanje), `src/styles.css` (potrjeni videz Folio).
- Stanje priljubljenih je lokalno (localStorage), filter je lokalno stanje pogleda; strežnik se ne spreminja.

## Odločitve

1. **Čisto jedro** `src/favorites.ts`: ključ `folio:favorites:v1`, `parseFavorites(raw)` (veljavno ⇔ JSON,
   `version === 1`, `ids` polje nizov; vrne `norm(ids)`, sicer `[]`), `normalizeFavorites(ids)` (enkratne
   vrednosti, razvrščene po UTF-16 — privzeti `Array.prototype.sort`), `serializeFavorites(ids)`.
2. **Hook** `src/useFavorites.ts` z `useSyncExternalStore`: skupno stanje `{ids, storageError}` za vse poglede;
   lenobno branje ob prvem prikazu (brez prepisa ob nalaganju), zapis ob vsaki spremembi v `try/catch`;
   poslušalec `storage` filtrira `e.key === 'folio:favorites:v1'`, `e.newValue === null` ⇒ `∅`, uskladi po
   pravilih R03/R04 in ne sproži povratnega zapisa; napake branja/zapisa ⇒ stanje ostane v pomnilniku,
   `storageError = true`.
3. **Eno stanje za preglednico in tablo**: hook se kliče enkrat (`ProjectView`), rezultat se preda tabeli in
   tabli; preklop pogleda ne vpliva na `F`/`f` (R07).
4. **Filter**: `useState(false)` v `ProjectView`, ki je vezan na `key={project.id}` — menjava projekta in
   osvežitev samodejno vrneta `false` (R08). Vidna opravila `V_p` se izračunajo iz izvornega vrstnega reda (R05).
5. **Vmesnik**: kontrole v vrstici ob naslovu `Opravila` — checkbox `Prikaži le priljubljena`, gumb
   `Odstrani priljubljene tega projekta` (onemogočen brez priljubljenih trenutnega projekta), element
   `role=status` z `aria-label="Število priljubljenih"` in besedilom `Priljubljeno: X od M.` (X/M za cel
   projekt, neodvisno od filtra). Prazno stanje pod filtrom: `Ni priljubljenih opravil.` z možnostjo izklopa.
   Opozorilo shrambe: `role=alert` z besedo `shramba`.
6. **Gumbi priljubljenih**: v preglednici v ločeni celici, na tabli kot element v `li` ob povezavi kartice
   (nikoli znotraj povezave); `aria-pressed` in dostopno ime `Priljubljeno opravilo <id>`; `data-task-id` ostane.
7. **Števci**: stolpci table štejejo vidna opravila (že zdaj iz filtriranega seznama); obstoječi `count-badge`
   ob naslovu ostane celoten (`tasks.length`).
8. **Brez API zapisov** (R12): uporabljajo se samo obstoječe GET poti; polja opravil se ne spreminjajo.
9. **Slog**: novi razredi v `src/styles.css` z obstoječimi spremenljivkami; pri 390 px stran se ne razširi,
   notranje drsenje `.table-scroll`/`.board-scroll` ostane (R12).

## Datoteke

- `src/favorites.ts` (novo) — validacija, normalizacija, serijalizacija.
- `src/useFavorites.ts` (novo) — stanje, `toggle(id)`, `removeForProject(taskIds)`, sinhronizacija `storage`, napake.
- `src/App.tsx` — kontrole, števec, filter, prazno stanje, gumbi v vrsticah preglednice.
- `src/TaskBoard.tsx` — gumbi na karticah, števci stolpcev iz vidnih opravil.
- `src/styles.css` — slogi novih kontrol.
- `tests/agent/favorites.spec.ts` (novo) — scenariji R01–R12 (vključno z dogodkom `storage`, izjemo shrambe in
  ozkim pogledom 390 px).
- `docs/agent/P07/spec.md` — vpis dejanskih izidov v tabelo sledljivosti po zagonih.

## Faze

1. Jedro in hook; `npm run typecheck`.
2. UI integracija; `npm run lint`, `npm run build`.
3. Lastni testi; `npx playwright test --project=agent`.
4. Skupni testi; `npx playwright test --project=api --project=desktop --project=mobile`.
5. Dokazi in predaja: posodobljena tabela sledljivosti v `spec.md`, povzetek z omejitvami.

## Tveganja in omejitve

- Dogodek `storage` se v istem zavihku ne sproži sam; test ga simulira z `StorageEvent`.
- Izjema shrambe se testira z nadzorovanim nadomestkom (`addInitScript`, npr. `Storage.prototype.setItem`);
  če nadzor v okolju ni mogoč, se to navede kot nepreverjeno.
- Pri 390 px je treba preveriti, da novi gumbi ne razširijo strani; notranje drsenje je dovoljeno.
