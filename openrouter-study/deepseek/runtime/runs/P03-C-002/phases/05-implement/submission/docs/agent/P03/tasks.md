# P03 — Naloge izvedbe

Zaporedje po `docs/agent/P03/plan.md`; dokazi se vpisujejo v tabelo
sledljivosti `docs/agent/P03/spec.md`. Oznake R01–R12 so zahteve iz
`task/instructions.md`. Brez implementacije infrastrukture.

## Setup

- [ ] T001 Preberi `src/App.tsx`, `src/TaskBoard.tsx`, `src/components.tsx`, `src/styles.css` in potrdi meje sprememb (samo `src/`, `tests/agent/`, `docs/agent/`).
- [ ] T002 Ustvari `src/filters.ts` s čistimi funkcijami `norm`, `words`, `matchTask`, `filterTasks`, `assigneeOptions` po odločitvah 4–5 iz `plan.md` (R02, R03, R05).

## Temelj (Foundational)

- [ ] T003 V `src/App.tsx` dodaj stanje `(q, s, a)` v `ProjectView` in izračun `S`/`N` z `filterTasks`; ohrani `key={project.id}` za ponastavitev (R01, R04, R07, R08).
- [ ] T004 V `src/App.tsx` dodaj kontrolno vrstico: `input type=search` (Išči opravila), izbora `Filter stanja` in `Filter odgovorne osebe` z možnostmi iz `assigneeOptions`, gumb `Počisti filtre` (R05, R11, R12).
- [ ] T005 V `src/App.tsx` dodaj element `role=status` z `aria-label="Rezultati filtriranja"` in besedilom `Prikazano: N od M.`; ob `M > 0 ∧ N = 0` sporočilo `Ni zadetkov.`; ob `M = 0` ohrani prazno stanje in `0 od 0` (R09, R10).

## Zgodbe (po prioriteti)

- [ ] T006 Preglednica: filtriraj vrstice in vsebino tabele na `S`; ohrani `data-task-id`, vrstni red in obstoječe stolpce (R01, R06, R11).
- [ ] T007 Pregled stanj (`aria-label="Pregled stanj opravil"`) naj šteje `S` po stanjih (R09).
- [ ] T008 `src/TaskBoard.tsx`: posreduj `S`; stolpci in števci stolpcev naj štejejo `{ t ∈ S : t.status = c }`; oba pogleda ostaneta uporabna (R06, R09, R10).
- [ ] T009 `src/styles.css`: slog kontrolne vrstice po Folio gradnikih; pri 390 px brez prelivanja strani, notranje drsenje preglednice/table in viden fokus (R12).

## Preverjanje

- [ ] T010 Napiši `tests/agent/P03.spec.ts` (projekt `agent`) s scenariji R01–R12 prek `tests/development/helpers.ts`: začetno stanje, normalizacija `č`/`c`, besede in ločila, IN-filtri, možnosti oseb, oba pogleda, menjava projekta, osvežitev, števci, brez zadetkov, čiščenje, odsotnost zapisovalnih klicev.
- [ ] T011 Poženi `npm run typecheck` in `npm run build`; zabeleži izid.
- [ ] T012 Poženi `npm test` (skupni in razvojni testi) in `npx playwright test tests/agent/P03.spec.ts --project=agent`; zabeleži izide in morebitne neuspehe (brez navajanja neizvedenih testov kot uspešnih).
- [ ] T013 Ročno preveri Folio videz, 390 px in omrežni dnevnik med filtriranjem; zabeleži ugotovitve.

## Zaključek (Polish)

- [ ] T014 V `docs/agent/P03/spec.md` vpiši dokaze v tabelo sledljivosti (pogoj, test, datoteka, izid) in navedi nepreverjene dele ter omejitve.
- [ ] T015 Preveri meje: brez sprememb `server/`, `shared/`, skupnih testov, `navigation.ts`, `playwright.config.ts`, odvisnosti in nastavitev; brez veje ali commita.
