# P08 — Naloge izvedbe

Status: naloge so pripravljene pred implementacijo. Vrstni red je urejen po odvisnostih in zajema tudi preverjanja iz skupne predloge.

## Priprava

- [ ] [T001] Dodaj čisti modul za koledarsko razvrščanje rokov s konstantama `DEFAULT_DUE_DATE` in privzeti pogled `all` ter funkcijama `addCalendarDays` in `getDueDateGroup` v `src/dueDates.ts`.

## Temeljne spremembe

- [ ] [T002] V `src/App.tsx` dodaj lokalno stanje `ProjectView` za referenčni datum, izbrano skupino, besedilo polja in opozorilo; vnesi kontrole `Referenčni datum` in `Pogled rokov` ter pet števcev z zahtevanimi `aria-label`.
- [ ] [T003] V `src/App.tsx` izpelji števce celotnega trenutnega projekta in skupni filtriran seznam v izvornem vrstnem redu API-ja; uporabi ga v preglednici in tabli ter uredi prazna stanja projekta in izbrane skupine.
- [ ] [T004] V `src/TaskBoard.tsx` sprejmi filtriran seznam kot obstoječi prop, ohrani tri obstoječe stolpce ter `data-task-id` na karticah.
- [ ] [T005] V `src/styles.css` dopolni obstoječe Folio razrede za nove kontrole in števce; zagotovi viden fokus ter notranje drsenje preglednice in table na širini 390 px.

## Uporabniški scenariji in preverjanja

- [ ] [T006] V `tests/agent/P08.spec.ts` dodaj Playwright teste za R01–R12: datumske meje in prednost `done`, števce pri filtriranju, vseh šest izborov, opozorilo ob praznem datumu, preklop preglednica/tabla, ponastavitev ob menjavi projekta/osvežitvi, prazen projekt/skupino, odsotnost zapisovalnih zahtev in širino 390 px.
- [ ] [T007] Izvedi `npm run lint`, `npm run build` in `npm test -- tests/agent/P08.spec.ts`; po potrebi odpravi odkrite napake in v `docs/agent/P08/spec.md` zapiši dejanske izide z imenom ukaza ali testa.

## Zaključek

- [ ] [T008] Preveri ohranjene dostopnostne lastnosti, obstoječe poti, Folio dizajn in sledljivost vseh zahtev R01–R12; zapiši nepreverjene scenarije ali omejitve.

**Sledljivost:** `docs/agent/P08/spec.md`, `docs/agent/P08/plan.md`, `task/instructions.md`, `PROJECT_RULES.md`.
