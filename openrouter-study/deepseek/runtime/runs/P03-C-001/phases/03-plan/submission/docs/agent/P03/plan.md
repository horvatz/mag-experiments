# P03 — Iskanje in sestavljeni filtri (načrt)

Povezave: `docs/agent/P03/spec.md`, `.specify/memory/constitution.md`,
`task/instructions.md`, `docs/dizajn.md`. Izvirne zahteve R01–R12 ostajajo merilo.

## Tehnični kontekst

- React 19.3 + TypeScript 6 + Vite 8 z obstoječimi odvisnostmi; brez novih.
- Podatki: `GET /api/projects/{id}/tasks` prek `useResource`; filtriranje ne
  piše in ne uporablja `/__test/`.
- Preverjanje: Playwright 1.63 (`testDir: tests/`), skupna testa
  `tests/baseline.spec.ts` in `tests/api.spec.ts`, lastni testi v
  `tests/agent/`. Ukazi: `npm run typecheck`, `npm run lint`, `npm test`.

## Struktura in odločitve

- `src/taskFilters.ts` (nov): čisti pomožniki `normalizeForSearch` (NFD,
  odstranitev U+0300–U+036F, male črke), `searchWords`, `matchesQuery`,
  `visibleTasks(tasks, q, s, a)`, `assigneeOptions(tasks)`. Ločena čista
  logika omogoča preverjanje pravil R02–R05 brez UI.
- `src/App.tsx`: stanje filtrov (q, s, a) v `ProjectView` prek `useState`;
  `ProjectView` je že vezan na `key={project.id}`, zato se ob preklopu
  projekta stanje ponastavi (R07). Iz `tasks` se izračuna `visible`; kontrole
  (search, izbirnik stanja, izbirnik osebe, gumb Počisti filtre) in
  `role=status` z besedilom Prikazano: N od M. (R01–R11). Pregled stanj in
  števci uporabijo `visible`; `TaskBoard` prejme `visible`.
- `src/TaskBoard.tsx`: stolpci in njihovi števci uporabijo prikazana opravila
  (R06, R09); pogled se ohrani pri preklopu.
- `src/styles.css`: vrstica kontrol z obstoječimi slogovnimi spremenljivkami;
  ozka širina in notranje drsenje ostaneta (R12).
- Brez shranjevanja filtrov v URL ali trajno shrambo; brez novih
  zapisovalnih klicev (R08, R12).

## Zaporedje dela

1. `src/taskFilters.ts` in `npm run typecheck`.
2. `src/App.tsx`: kontrole, izpeljani seznam, sporočilo Ni zadetkov. (R10).
3. `src/TaskBoard.tsx` in `src/styles.css`.
4. Lastni Playwright testi `tests/agent/p03.spec.ts` za R01–R12.
5. `npm run typecheck`, `npm run lint`, `npm test`; izidi in dokazi se
   vpišejo v tabelo Izvedba in sledljivost v `spec.md`.

## Tveganja in omejitve

- Skupni testi ne pokrivajo R01–R12; zato so potrebni lastni testi.
- Oseba se primerja natančno, normalizacija velja le za iskanje.
- Strežnik, skupni tipi, odvisnosti in nastavitve ostanejo nespremenjeni.
