# P09 — Načrt izvedbe

Povezave: `docs/agent/P09/spec.md` (zahteve R01–R12), `.specify/memory/constitution.md`,
`task/instructions.md`. Skupna predloga: `task/specification-template.md` (povezovanje brez
podvajanja).

## Tehnični kontekst

- React 19.3 + TypeScript 6 + Vite 8; brez usmerjevalnika: `src/navigation.ts` bere
  `window.location.hash` prek `useSyncExternalStore` in posluša `hashchange`.
- Testi: Playwright 1.63; projekt `agent` (`tests/agent/**/*.spec.ts`), skupna
  `tests/baseline.spec.ts` in `tests/api.spec.ts`; razvojni pripomoček
  `tests/development/helpers.ts` ponuja `mount` z nadzorovanimi GET odgovori.
- API: samo branje `/api/` (`src/api.ts`, `src/useResource.ts`); brez novih odvisnosti,
  brez `localStorage`, brez zapisov.
- Cilj: q/status/order iz query dela fragmenta; potrditev z gumbom; zgodovina in
  osvežitev ohranita potrjeno stanje.

## Arhitektura in odločitve

1. **Čista logika — nov `src/viewState.ts`.** Tipi `ViewStatus` (all/todo/in_progress/done),
   `ViewOrder` (original/title-asc/title-desc), `ViewParams`. Funkcije:
   `parseViewParams(search)` (prva pojava parametra, neznane vrednosti → privzeto, brez
   prepisa URL-ja), `normalize(text)` (trim za q, NFD, odstranitev U+0300–U+036F, male
   črke), `matchesQuery(task, q)`, `filterTasks(tasks, params)` (IN q+status, urejanje po
   `order` s stabilnim izvornim vrstnim redom ob izenačenju), `buildHash(path, view, params)`
   (izpusti privzete vrednosti, ohrani `view=board`, odstrani neznane parametre, URL-kodira).
2. **Navigacija — dopolnjen `src/navigation.ts`.** `useRoute()` vrne tudi `params`;
   `projectUrl`/`taskUrl` sprejmeta `params` in ju vključita (uporaba pri odpiranju/zapiranju
   podrobnosti in preklopu pogleda). Nova pomožna funkcija `navigate(hash, { replace })`
   kliče `history.pushState`/`replaceState` in nato sproži `hashchange`, ker `pushState` sam
   dogodka ne sproži; tako React ponovno izriše in nastane natanko eno zgodovinsko stanje
   (R05, R06).
3. **Kontrole — nov `src/ViewControls.tsx`.** Lokalni osnutek `(qd, statusd, orderd)`; ob
   spremembi potrjenih parametrov se osnutek sinhronizira (nepotrjen se zavrže, R08).
   Gumb "Uporabi pogled": če se obrezani osnutek razlikuje od potrjenega,
   `navigate(buildHash(...), push)`, sicer brez spremembe. Gumb "Ponastavi pogled": privzete
   vrednosti po istem pravilu. Kontrole: `input type="search"` "Iskanje v povezavi",
   `select` "Stanje v povezavi", `select` "Vrstni red v povezavi"; števec `role="status"`,
   `aria-label="Rezultati povezave"`, besedilo "Prikazano: N od M.".
4. **Vključitev v `src/App.tsx`.** `visible = filterTasks(tasks, params)`; kontrole in
   števec v razdelku "Opravila"; tabela in tabla prejmeta `visible` (iste ID-je v obeh
   pogledih, R08); ob praznem `visible` pri nepraznih `tasks` se prikaže "Ni zadetkov.",
   ob praznem projektu obstoječe sporočilo; povzetek stanj in `aria-label="Pregled stanj
   opravil"` ostaneta nespremenjena (nefiltirana, ker R11 določa le števec rezultatov).
5. **Povezave in podrobnosti.** `TaskBoard` in tabela prejmeta `params`, da vrstice in
   kartice tvorijo `taskUrl(projectId, id, view, params)`; `TaskDetails.close()` vrne na
   `projectUrl(project.id, view, params)`, zato gumb in Escape ohranita filtre (R09). Klik
   na projekt ostane `projectUrl(id, view)` brez parametrov (privzeti pregled, R10);
   neposredna povezava s parametri se upošteva že pri razčlenitvi.
6. **Slog — `src/styles.css`.** Vrstica kontrol v duhu Folio (svetla podlaga, nežni modri
   poudarki, tanke ikone); pri 390 px se kontrole prelomijo v več vrstic, stran se ne
   razširi; notranje drsenje tabele/table ostane.
7. **Testi — nov `tests/agent/p09.spec.ts`** (po potrebi `tests/agent/p09-mobile.spec.ts`).
   Uporabijo `tests/development/helpers.ts` (`mount`, `expectIds`, `select`, `click`,
   `readonly`, ...) in pokrijejo R01–R12: neznani in ponovljeni parametri, normalizacija
   ter Unicode, enaki naslovi, stabilno urejanje, osnutek in ena vstopnica, back/forward in
   osvežitev, zavržen osnutek ob navigaciji, podrobnosti in Escape, menjava projekta,
   ponastavitev, prazni rezultati, brez zapisov in brez `localStorage`, 390 px.

## Datoteke

- Spremenjeno: `src/navigation.ts`, `src/App.tsx`, `src/TaskBoard.tsx`,
  `src/TaskDetails.tsx`, `src/styles.css`.
- Novo: `src/viewState.ts`, `src/ViewControls.tsx`, `tests/agent/p09.spec.ts`
  (po potrebi `tests/agent/p09-mobile.spec.ts`).
- Dokumenti: ta `plan.md`; med izvedbo se dopolni sledljivost v `spec.md`; `tasks.md`
  nastane v naslednjem koraku.
- Nedotaknjeno: `server/`, `shared/`, `tests/baseline.spec.ts`, `tests/api.spec.ts`,
  `tests/development/`, odvisnosti in nastavitve.

## Preverjanje

1. `npm run typecheck` in `npm run lint`.
2. Ciljno: `npx playwright test tests/agent` (projekt agent).
3. Razvojni primeri: `npx playwright test tests/development/P09.spec.ts`.
4. Ob koncu skupni `npm test` (baseline + api + agent); rezultati se sproti zabeležijo v
   sledljivostno tabelo `spec.md`; neizvedenih testov ne označujemo kot uspešnih.

## Tveganja in omejitve

- `pushState` ne sproži `hashchange`; rešitev je `navigate` z ročnim dogodkom.
- Playwright `webServer` teče na 5174/3102; konfiguracije testov ne spreminjamo.
- Končni zunanji testi niso dostopni; razvojni primeri niso celoten obseg zahtev.
- Navigacije med nalaganjem in sočasne spremembe podatkov brez osvežitve niso v obsegu
  (kot v `spec.md`).

Zgodovina: 2026-11-02 — v0.1 načrta.
