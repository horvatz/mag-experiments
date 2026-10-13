# Načrt P05: Straničenje in filter stanja

Specifikacija: `docs/agent/P05/spec.md` (R01–R12). Ustava: `.specify/memory/constitution.md`. Dizajn: `docs/dizajn.md`. Načrt ne dodaja zahtev, odvisnosti ali infrastrukturnih sprememb.

## Tehnični kontekst

- Aplikacija: React 19 + TypeScript + Vite 8, nameščene odvisnosti (brez novih).
- Podatki: obstoječi javni API `GET /api/projects/{id}/tasks` prek `src/api.ts` in `src/useResource.ts`; brez novih klicev in brez zapisov.
- Stanje: lokalno stanje komponente `ProjectView` v `src/App.tsx`; brez trajne shrambe in brez URL-ja za stran/velikost/filter (obstoječi hash ostane le za pogled in podrobnosti).
- Testi: Playwright 1.63; skupna testa `tests/baseline.spec.ts` in `tests/api.spec.ts` sta samo berljiva; lastni testi v `tests/agent/`.

## Odločitve

- V `src/pagination.ts` dodaj čiste funkcije (brez Reacta): `filterTasks(tasks, f)`, `pageCount(n, s)`, `pageSlice(T, s, p)`, `pageBounds(n, s, p)`, `statusText(n, s, p)` in `clampPage(p, Y)`. Ustrezajo predikatom iz specifikacije in so neposredno preverljive.
- V `ProjectView` dodaj tri kose stanja: `pageSize` (`all/2/5/10`), `statusFilter` (`all/todo/in_progress/done`), `page` (1-osnovna). Filtrirana polja in odsek se izračunajo med izrisom (`useMemo`).
- Menjava velikosti strani ali filtra nastavi `page = 1` (R04, R05). Gumbi uporabijo `clampPage`; na robu so `disabled` (R03). Osvežitev in menjava projekta se ponastavita že zaradi obstoječega `key={project.id}`; `s`/`f` se ob ponovnem izrisu inicializirata na `all` (R08).
- Preglednica izriše `odsek`; `TaskBoard` prejme isti `odsek` in ga združi v stolpce, zato števci stolpcev štejejo le trenutno stran (R06, R11). Povzetek stanj ostane izračunan iz celotnega `tasks` (R11).
- Nove kontrole (dva `select` z `aria-label`, štirje gumbi Prva/Prejšnja/Naslednja/Zadnja stran, `role=status` z `aria-label="Stanje straničenja"`) se dodajo v `section-heading`; razporeditev sledi Folio gradnikom, gumbi so zunaj povezav opravil.
- Besedilo statusa je natanko `Stran p od Y. Prikazano A–B od n.`; pri `n = 0` je `Stran 0 od 0. Prikazano 0–0 od 0.` in vsi štirje gumbi so onemogočeni (R09, R10). Obstoječe sporočilo praznega projekta ostane.
- Obstoječe `data-task-id`, dostopna imena, povezave, podrobnosti in `aria-label="Pregled stanj opravil"` se ohranijo (R12); slog dopolnitve v `src/styles.css` uporablja obstoječe spremenljivke; na 390 pik se stran ne razširi, notranje drsenje ostane.

## Datoteke

- `src/pagination.ts` — novo: čisti predikati in besedilo statusa.
- `src/App.tsx` — stanje, kontrole, odsek, status; ohrani povzetek in poglede.
- `src/TaskBoard.tsx` — prejme odsek (brez spremembe logike združevanja).
- `src/styles.css` — slog orodne vrstice in statusa v duhu Folio.
- `tests/agent/p05-pagination.spec.ts` — lastni Playwright testi za R01–R12 (razvojni pripomoček podaja nadzorovane podatke; UI ga ne uvaža).
- `docs/agent/P05/spec.md` — po izvedbi se vpišejo izidi in dokazila (tabela sledljivosti).

## Preverjanje

- `npm run lint`, `npm run typecheck`.
- Skupna testa: `npx playwright test tests/baseline.spec.ts tests/api.spec.ts`.
- Lastni testi: `npx playwright test tests/agent/p05-pagination.spec.ts`; nato celoten `npm test`.
- Ročni pregled 390 pik (brez vodoravnega razširjanja strani) in skladnosti s Folio.
- Izidi se zabeležijo v specifikacijo; neizvedeno ostane označeno kot neizvedeno.
