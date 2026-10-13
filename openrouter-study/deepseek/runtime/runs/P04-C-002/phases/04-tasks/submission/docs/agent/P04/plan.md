# P04 — Načrt izvedbe

Specifikacija: `spec.md`. Ustava: `.specify/memory/constitution.md`. Ciljna mapa: `docs/agent/P04`.

## Tehnični kontekst

- React + TypeScript + Vite z obstoječimi odvisnostmi; brez novih paketov in brez sprememb
  `server/`, `shared/`, skupnih testov, `playwright.config`, `package.json`.
- Podatki se berejo izključno prek javnega API-ja `/api/` (`useResource`); zapisi ostanejo nespremenjeni.
- Testiranje: Playwright; lastni testi v `tests/agent/`, skupni testi so samo berljivi.

## Odločitve

1. **Čista logika razvrščanja** v novem modulu `src/sortTasks.ts`: tipi `SortKey`
   (`original/title/assignee/status/dueDate`), `Direction` (`asc/desc`), `SortState`
   (`k1, d1, k2, d2`); `normalize` (NFD, odstranitev U+0300–U+036F, male črke),
   primerjava nizov po UTF-16, `rank(status)` (todo 0, in_progress 1, done 2),
   kronološka primerjava `YYYY-MM-DD`, stabilno urejanje z eksplicitnim izvornim
   indeksom kot zadnjo vezjo (izenačeni ohranijo vrstni red polja).
2. **Stanje kontrol v `ProjectView`** (`src/App.tsx`) z `useState`; privzeto
   `original/asc/none/asc`. Ponastavitev ob menjavi projekta prek remonta
   (`key={project.id}`) ali učinka na `project.id`; osvežitev ponastavi sama, ker
   ni trajne shrambe ali URL-ja. Preklop pogleda in podrobnosti ne remontirata
   `ProjectView`, zato `S` ostane.
3. **Projekcija**: `useMemo` iz `tasks` in `S` vrne razvrščeno polje; izvorni
   `tasks` in polja opravil se ne spreminjajo, API ne prejme zapisov. Isto polje
   prejmeta preglednica in `TaskBoard`.
4. **Tabla**: `TaskBoard` filtrira razvrščeno polje po statusu, zato je relativni
   vrstni red v stolpcu enak preglednici; stolpci ostanejo fiksni
   todo/in_progress/done. Sprememba le, če trenutna izvedba tega ne omogoča.
5. **Kontrole**: štirje native `select` z `label` (dostopna imena natanko
   Primarni ključ, Primarna smer, Sekundarni ključ, Sekundarna smer) in gumb
   Izvorni vrstni red; možnosti `original/title/assignee/status/dueDate` in
   `none/...`, smeri `asc/desc`. Umeščene ob preklop pogleda v `.section-heading`;
   razporeditev v `src/styles.css` z obstoječimi spremenljivkami, brez spremembe
   palete in brez vodoravnega prelivanja pri 390 pik.
6. **Ohranitev Folio**: `data-task-id`, `aria-label="Pregled stanj opravil"`,
   `aria-pressed` pogledov, dostopna imena stolpcev, viden fokus, notranje drsenje.

## Datoteke

- `src/sortTasks.ts` — novo: čista logika in tipi (R01–R06, R11).
- `src/App.tsx` — stanje, kontrole, memo projekcija, ponastavitve (R01, R04–R12).
- `src/TaskBoard.tsx` — prejem razvrščenega polja; po potrebi manjša prilagoditev (R07).
- `src/styles.css` — razporeditev novih kontrol in odzivnost (R12).
- `tests/agent/p04.spec.ts` — lastni scenariji A–L (vsi R).
- `docs/agent/P04/tasks.md` — razčlenitev in dokazi.

## Preverjanje

1. Lastni testi: `npx playwright test tests/agent/p04.spec.ts --reporter=line`
   (scenariji A–L; podatki prek javnega testnega pripomočka z nadzorovanimi GET
   odgovori, brez uvažanja v aplikacijo).
2. Skupni testi nespremenjeni: `npx playwright test tests/baseline.spec.ts tests/api.spec.ts`.
3. Referenčni razvojni primeri D01–D04 (`tests/development/`) se lahko zaženejo kot
   dodatno preverjanje; niso nadomestilo za lastne teste.
4. Dokazi (izid, ime testa, dnevnik) se vpišejo v `spec.md` (razdelek Izvedba in
   sledljivost) in `tasks.md`; neizvedeno ostane označeno kot neizvedeno.

## Tveganja in omejitve

- Stabilnost: `Array.prototype.sort` je stabilen, a eksplicitni indeks odstrani
  odvisnost od izvajalnika.
- Smer `desc` se uporabi samo na primerjavi ključa, nikoli na celotnem polju.
- Brez navigacije med nalaganjem in brez sočasnih sprememb podatkov v obsegu.
