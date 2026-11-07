# P08 — Naloge izvedbe

Spec: `docs/agent/P08/spec.md`, načrt: `docs/agent/P08/plan.md`, ustava:
`.specify/memory/constitution.md`. Vsaka naloga navaja datoteko; vrstni red
je odvisnostni. Brez implementacije v tem koraku.

## Faza 1 — Priprava

- [ ] T001 Preberi specifikacijo, načrt in pomožne funkcije (`docs/agent/P08/spec.md`, `docs/agent/P08/plan.md`, `tests/development/helpers.ts`) ter potrdi predikate in začetne vrednosti.

## Faza 2 — Temelj (čista logika)

- [ ] T002 Ustvari `src/dueDates.ts` s tipi `DueGroup`/`DueFilter` in funkcijami `isValidDate`, `diffDays` (aritmetika `Date.UTC`), `dueGroup`, `dueCounts`, `visibleTasks` po predikatih iz specifikacije.
- [ ] T003 Zapiši enotske teste `tests/agent/dueDates.spec.ts`: R02 done prednost, R03 meji REF−1/REF, R04 REF+1/REF+7/REF+8 in disjunktnost, R05 prestopni februar in menjava leta.
- [ ] T004 Zaženi `npx playwright test tests/agent/dueDates.spec.ts` in popravi logiko do zelenih rezultatov.

## Faza 3 — Uporabniški scenariji (UI)

- [ ] T005 V `src/App.tsx` (`ProjectView`) dodaj stanje `refDate`/`refInput` (2026-09-21) in `dueFilter` (`all`), kontroli `input type=date` (Referenčni datum) in `select` (Pogled rokov) ter `role=alert` za prazen/neveljaven vnos (R01, R07, R08, R10).
- [ ] T006 V `src/App.tsx` prikaži pet števcev z `aria-label="Število rokov <ključ>"` znotraj `[aria-label="Pregled stanj opravil"]`; števci neodvisni od filtra (R06, R11).
- [ ] T007 V `src/App.tsx` filtriraj opravila z `visibleTasks` za preglednico in `TaskBoard`; ob prazni skupini prikaži „Ni opravil v izbrani skupini.“; ohrani `data-task-id`, dostopna imena in podrobnosti (R04, R07, R09, R12).
- [ ] T008 Poskrbi za ponastavitev ob menjavi projekta in osvežitvi (`key={project.id}`) brez shrambe v `localStorage` ali URL-ju (R10).
- [ ] T009 V `src/styles.css` razširi `.summary-grid` na pet stolpcev in oblikuj kontroli z obstoječimi spremenljivkami; preveri odzivnost 760/390 pik (R12).

## Faza 4 — Lastni testi P08

- [ ] T010 Zapiši `tests/agent/dueView.spec.ts`: začetno stanje, števci, opozorilo in ponovni preračun, preklop skupine/pogleda/projekta, prazen projekt, prepoved zapisov (`readonly`).
- [ ] T011 Zaženi `npx playwright test tests/agent/ tests/development/` in odpravi odstopanja.

## Faza 5 — Zaključek in dokazila

- [ ] T012 Zaženi `npm run typecheck` in `npm run lint`; popravi najdene težave.
- [ ] T013 Zaženi skupne teste `npx playwright test tests/baseline.spec.ts tests/api.spec.ts` in po potrebi celoten `npm test`.
- [ ] T014 V `docs/agent/P08/spec.md` dopolni tabelo sledljivosti z dejanskimi izidi, povezavami na kodo in testi; zapiši nepreverjene dele in omejitve (brez označevanja neizvedenega kot uspešno).
