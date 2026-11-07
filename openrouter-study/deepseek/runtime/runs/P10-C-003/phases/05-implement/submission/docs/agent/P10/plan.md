# Načrt izvedbe: P10 – Lokalni vrstni red z razveljavitvami

**Datum**: 2026-10-13 | **Spec**: `docs/agent/P10/spec.md` | **Konstitucija**: `.specify/memory/constitution.md`

## Povzetek

V obstoječo React/TypeScript/Vite aplikacijo Folio dodamo lokalno permutacijo
vrstnega reda opravil s premiki gor/dol, zgodovino razveljavitev (največ 20),
ponovitvami in vrnitvijo na začetni vrstni red. Podatki se berejo samo prek
obstoječega javnega API-ja; stanje je lokalno trenutnemu projektu, brez zapisov
in brez trajne shrambe. Brez novih odvisnosti in brez sprememb infrastrukture.

## Tehnični kontekst

- **Jezik**: TypeScript 6.0, React 19.3, Vite 8.3, lucide-react 1.46 (obstoječe).
- **Testi**: Playwright 1.63 (`npm test`), projekta `agent` in obstoječi
  `development-*`/`desktop`/`mobile`; brez novih orodij.
- **Podatki**: `GET /api/projects`, `GET /api/projects/:id/tasks` prek
  `useResource`/`request`; polja `Task`/`Project` iz `shared/types.ts`.
- **Obseg**: `src/`, `tests/agent/`, `docs/agent/P10/`; `server/`, `shared/`,
  skupni testi, `playwright.config.ts` in odvisnosti nespremenjeni.

## Preverjanje konstitucije

I. Spremembe le v dovoljenih mapah; II. branje izključno `/api/`, brez
`/__test/` v UI; III. ohranjeni Folio, slovenska imena in dostopnost; IV.
sledljivost R01–R12 s predikati in dokazi; V. skupni testi + lastni v `tests/agent/`.
Načrt ne uvaja novih zahtev, odvisnosti ali arhitekturnih preureditev.

## Odločitve

1. **Čisto jedro zgodovine** v novem `src/taskOrder.ts`: funkcije
   `moveUp/moveDown/undo/redo/reset` nad stanjem `{order, initial, undo, redo}`,
   brez Reacta. Pravila: veljaven premik `undo := undo + [pred]` (rezano na 20)
   in `redo := []`; robni premik je no-op; razveljavitev/ponovitev prenašata
   permutaciji med skladoma; `reset` doda eno dejanje in počisti ponovitve.
2. **Hook `useTaskOrder(tasks)`** v `src/taskOrder.ts`: ob prvem uspešnem
   nalaganju nastavi `order := tasks.map(id)`; stanje živi v `ProjectView`, ki se
   ob menjavi projekta remountira (`key={project.id}`), zato menjava projekta in
   osvežitev ponastavita, preklop pogleda/podrobnosti (samo hash) pa ne.
3. **Nove kontrole** v `src/OrderControls.tsx`: `MoveButtons` (gumba
   `Premakni <id> gor/dol`, `disabled` na robu, zunaj povezave opravila) in
   `HistoryControls` (gumbi `Razveljavi premik`, `Ponovi premik`,
   `Začetni vrstni red` + `role=status` z `aria-label="Zgodovina vrstnega reda"`
   in besedilom `Razveljavitve: U. Ponovitve: R.`).
4. **Prikaz mesta**: element z `aria-label="Mesto opravila <id>"` in besedilom
   globalne številke v vrstici preglednice in na kartici table; ohranjeni
   `data-task-id`, obstoječa dostopna imena in `aria-label="Pregled stanj opravil"`.
5. **Preglednica**: `tasks` se pred prikazom uredi po `order`; vsaka vrstica dobi
   mesto in `MoveButtons`. **Tabla**: `TaskBoard` prejme globalno urejena opravila
   in preslikavo mest; stolpci filtrirajo po statusu (relativni vrstni red), premik
   pa uporablja globalnega soseda in ne spremeni statusa.
6. **Slog**: dodatki v `src/styles.css` z obstoječimi gradniki in
   spremenljivkami; dejanja v vrstici so ločena od povezave, fokus ostane viden,
   pri 390 px se stran ne razširi (drsenje znotraj preglednice/table ostane).

## Struktura datotek

```text
docs/agent/P10/  spec.md, plan.md, tasks.md
src/             taskOrder.ts (novo), OrderControls.tsx (novo),
                 App.tsx, TaskBoard.tsx, styles.css
tests/agent/     order.spec.ts, history.spec.ts, state.spec.ts (novi)
```

## Preverjanje

1. `npm run typecheck` in `npm run lint`.
2. `npx playwright test --project=agent` za R01–R12 (vključno z razvojnimi
   primeri `tests/development/P10.spec.ts`, ki tečejo v projektu `development-*`).
3. Celoten `npm test` (api, baseline, development, agent) kot končni dokaz;
   rezultati se vpišejo v `docs/agent/P10/spec.md` (razdelek sledljivosti).

## Tveganja in omejitve

- Natančna ujemanja dostopnih imen in besedila števca so pogodbena; preverijo se
  z `getByRole`/`getByLabel` (glej `tests/development/helpers.ts`).
- Ponovno nalaganje podatkov ne sme ponastaviti vrstnega reda; `retry` velja kot
  osvežitev (ponastavitev je dopustna).
- Tabla prikazuje relativni vrstni red, zato se globalni red preverja prek
  `Mesto opravila <id>`; zaporedje DOM je merodajno le v preglednici.
- Brez trajne shrambe in URL stanja vrstnega reda; brez novih zapisovalnih API-jev.
