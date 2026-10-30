# Načrt izvedbe P05: Straničenje in filter stanja

**Feature directory**: `docs/agent/P05` | **Datum**: 2026-10-30 | **Specifikacija**: `docs/agent/P05/spec.md` | **Ustava**: `.specify/memory/constitution.md`

## Tehnični kontekst

- Aplikacija: obstoječa React 19.3 + TypeScript 6 + Vite 8 (Folio); odvisnosti so nameščene (`lucide-react`, `@playwright/test` 1.63).
- Zagon in preverjanje: `npm run dev` (Vite + strežnik), `npm run typecheck`, `npm run lint`, `npm test` (Playwright: projekti api, desktop, mobile, development-*, agent).
- Podatki: javni `/api/` (samo branje); hash usmerjanje v `src/navigation.ts`; `useResource` za nalaganje; `ProjectView` v `src/App.tsx`; obstoječa `TaskBoard` in `TaskDetails`.
- Meje: brez novih odvisnosti; brez sprememb `server/`, `shared/`, skupnih testov, nastavitev in predlog; potrjeni videz Folio ostane.

## Odločitve

1. **Čista logika v `src/pagination.ts`**: konstante `PAGE_SIZES = [all, 2, 5, 10]` in `STATUS_FILTERS = [all, todo, in_progress, done]`, funkcije `filterTasks(tasks, filter)`, `paginate(tasks, size, page)` (vrne odsek, številko strani, število strani, A, B, N) in `statusText(...)` z natančnim besedilom iz R09/R10. Logika je ločena od pogleda in pokrita prek UI scenarijev.
2. **Stanje v `ProjectView`** (`useState` za velikost strani, filter in stran): lokalno trenutnemu projektu. `key={project.id}` povzroči ponovno postavitev ob menjavi projekta, osvežitev pa stanje ponastavi (R08). Preklop pogleda in podrobnosti spreminjata le hash, zato `ProjectView` ostane in stanje se ohrani (R07). Nič se ne shranjuje v URL ali trajno shrambo.
3. **Ločena komponenta `src/PaginationControls.tsx`** z dostopnimi imeni točno: select `Velikost strani`, select `Filter strani`, gumbi `Prva stran`, `Prejšnja stran`, `Naslednja stran`, `Zadnja stran` in element `role=status` z `aria-label="Stanje straničenja"`.
4. **Odsek `S` napaja preglednico in tablo** (R06). `TaskBoard` ostane nespremenjen, ker števce stolpcev izračuna iz prejetih opravil, to pa je odsek.
5. **Pregled stanj ostane nad celotnim seznamom** `tasks` (R11); značka ob naslovu in noga sekcije prikazujeta skupno število opravil, nespremenjeno s straničenjem.
6. **Robovi in prazno**: gumbi onemogočeni po predikatih iz specifikacije; pri `N = 0` besedilo `Stran 0 od 0. Prikazano 0–0 od 0.` in vsi štirje gumbi onemogočeni (R10).
7. **Brez zapisov**: brez klicev `updateTask`; straničenje je čisto odjemalsko in ne pošilja zapisov na API (R12).
8. **Slog**: minimalni dodatki v `src/styles.css` z obstoječimi spremenljivkami; kontrole se pri ozkem zaslonu prelomijo, notranje drsenje preglednice in table ostane.

## Datoteke

| Datoteka | Vrsta | Vsebina |
| --- | --- | --- |
| `src/pagination.ts` | nova | tipi, konstante in čiste funkcije filtriranja, straničenja in besedila statusa |
| `src/PaginationControls.tsx` | nova | selecta, štirje gumbi in `role=status` |
| `src/App.tsx` | sprememba | stanje, izračun `F`/`Y`/`S`, prikaz odseka, vključitev kontrol |
| `src/styles.css` | sprememba | razporeditev in videz kontrol v slogu Folio |
| `tests/agent/p05.spec.ts` | nova | lastni testi R01–R12 (Playwright projekt `agent`) |
| `docs/agent/P05/spec.md`, `docs/agent/P05/plan.md` | dokumentacija | vpis dokazil po zagonih, posodobitev sledljivosti |

Nespremenjeni naj ostanejo: `src/TaskBoard.tsx`, `src/TaskDetails.tsx`, `src/navigation.ts`, `src/api.ts`, `src/useResource.ts`, `src/components.tsx`. Morebitna nujna manjša prilagoditev ostane znotraj `src/`.

## Izvedbeni koraki

1. `src/pagination.ts` s čistimi funkcijami in besedilom statusa.
2. `src/PaginationControls.tsx` z dostopnimi imeni in onemogočenimi gumbi.
3. `src/App.tsx`: stanje, napajanje preglednice in table z odsekom; ohranjeni `data-task-id`, povezave in `aria-label` oznake.
4. `src/styles.css`: razporeditev kontrol.
5. `tests/agent/p05.spec.ts`: scenariji R01–R12 z nadzorovanimi podatki (pomožne funkcije iz `tests/development/helpers.ts`: `mount`, `expectIds`, `select`, `click`, `board`, `summary`, `readonly`).
6. Zagoni, vpis dokazil v `spec.md` in posodobitev tega načrta.

## Preverjanje

| Ukaz | Namen |
| --- | --- |
| `npm run typecheck` | preverjanje tipov |
| `npm run lint` | slog in pravila ESLint |
| `npx playwright test tests/development/P05.spec.ts` | razvojni primeri D01–D04 |
| `npx playwright test tests/agent/` | lastni testi R01–R12 |
| `npx playwright test tests/baseline.spec.ts tests/api.spec.ts` | regresija izhodišča |

## Sledljivost (zahteva -> koda in test)

| Zahteva | Koda | Načrtovan test |
| --- | --- | --- |
| R01 | `src/App.tsx` (privzeto stanje), `src/pagination.ts` | agent: "privzeto stanje in vrstni red" |
| R02 | `src/pagination.ts` (`paginate`) | agent: "straničenje 2/5/10" |
| R03 | `src/PaginationControls.tsx`, `src/App.tsx` | agent: "navigacija in robovi" |
| R04 | `src/App.tsx` (sprememba velikosti) | agent: "sprememba velikosti strani" |
| R05 | `src/pagination.ts` (`filterTasks`), `src/App.tsx` | agent: "filter pred straničenjem" |
| R06 | `src/App.tsx` (odsek v oba pogleda), `src/TaskBoard.tsx` | agent: "isti id-ji v obeh pogledih" |
| R07 | stanje v `ProjectView` | agent: "ohranitev s, f, p" |
| R08 | `key={project.id}`, privzeto stanje | agent: "menjava projekta in osvežitev" |
| R09 | `src/pagination.ts` (`statusText`) | agent: "besedilo statusa, neprazen rezultat" |
| R10 | `src/pagination.ts`, `src/PaginationControls.tsx` | agent: "prazen rezultat in odstranitev filtra" |
| R11 | `src/App.tsx` (pregled nad `tasks`), `src/TaskBoard.tsx` | agent: "števci ob straničenju" |
| R12 | brez sprememb `src/api.ts`; obstoječe povezave | agent: "brez zapisov" (`readonly`) |

## Skladnost z ustavo

- Načelo I: spremembe le v `src/`, `tests/agent/` in `docs/agent/`; infrastruktura nedotaknjena.
- Načelo II: branje iz `/api/`; UI ne uporablja `/__test/`; brez trajne shrambe in URL-ja.
- Načelo III: slog Folio in dostopna imena ostanejo.
- Načelo IV: sledljivost se vodi v `spec.md` in tem načrtu.
- Načelo V: izidi se vpišejo po dejanskih zagonih; neizvedeno se izrecno navede.

## Tveganja in odprte točke

- Razvojni testi pričakujejo točna imena kontrol in natančno besedilo statusa; odstopanja bodo razkrita pri D01–D04.
- Med nezaključenim nalaganjem stanje ni določeno; veljajo obstoječe regresijske zahteve, brez novih pravil.
- Repo nima ločenega tekača enotnih testov; čiste funkcije se preverjajo prek UI scenarijev v Playwrightu.
