# P03 — Naloge

Status: naloge 1.0. Urejata jih [`docs/agent/P03/spec.md`](./spec.md) in [`docs/agent/P03/plan.md`](./plan.md). Naloge so odvisnostno zaporedne; implementacija v tej fazi ni dovoljena.

## Priprava

- [ ] [T001] Pripravi testno ogrodje z nadzorovanimi GET odgovori in sledenjem morebitnim pisanjem na `/api/` v `tests/agent/P03.spec.ts`.

## Temelj

- [ ] [T002] Dodaj čiste pomožne funkcije za normalizacijo NFD, iskalne besede in dobesedno ujemanje po poljih `id`, `title`, `description` in `assignee` v `src/App.tsx`.
- [ ] [T003] Dodaj lokalno stanje iskanja, statusa in odgovorne osebe ter kontrole `Išči opravila.`, `Filter stanja`, `Filter odgovorne osebe` in `Počisti filtre` v `src/App.tsx`.

## Uporabniške zgodbe po prednosti

- [ ] [T004] Izračunaj `visibleTasks` z logičnim IN, možnosti oseb iz celotnega projekta ter števce iz prikazanih rezultatov v `src/App.tsx`.
- [ ] [T005] Poveži preglednico in tablo na isti `visibleTasks`, ohrani `data-task-id`, vrstni red, števce stolpcev in preklop pogleda v `src/App.tsx` ter `src/TaskBoard.tsx`.
- [ ] [T006] Zagotovi reset vseh filtrov ob menjavi projekta in osvežitvi, brez URL-ja ali trajne shrambe, v `src/App.tsx`.
- [ ] [T007] Upravljaj prazen projekt, `Ni zadetkov.` v obeh pogledih in čiščenje z enim dejanjem vseh treh kontrol v `src/App.tsx` ter `src/TaskBoard.tsx`.
- [ ] [T008] Ohrani obstoječo navigacijo, bralne podrobnosti in dostopnost ter preveri, da filtriranje ne povzroči pisanja na `/api/` v `src/App.tsx` ter `src/TaskDetails.tsx`.

## Dovršitev

- [ ] [T009] Dopolni Folio slog za iskanje, filtre, število rezultatov in ozki zaslon ter ohrani vidni fokus v `src/styles.css`.

## Preverjanje

- [ ] [T010] Dopolni lastne Playwright teste za R01–R12, vključno z normalizacijo, večbesednim iskanjem, kombiniranimi filtri, preklopi, števci, praznimi zadetki, čiščenjem, navigacijo in 390 px, v `tests/agent/P03.spec.ts`.
- [ ] [T011] Izvedi `npm run typecheck`, `npm run lint`, `npm test -- --project=agent`, `npm test -- --project=desktop` in `npm test -- --project=mobile`; zapiši dejanske izide v `docs/agent/P03/spec.md`.

Preostale neizvedene preveritve izrecno ne označi kot uspešne. Končnih skritih testov ni na voljo, zato veljajo samo dejansko izvedena lastna in skupna preverjanja.
