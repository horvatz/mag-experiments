# P03 — Načrt izvedbe

## Tehnični kontekst

Aplikacija je React 19 + TypeScript + Vite. Obstoječi ključni deli so:

- `src/App.tsx`: izbira projekta, pogled, pregled stanj in tabela.
- `src/TaskBoard.tsx`: tabla s tremi stolpci.
- `src/TaskDetails.tsx`: bralne podrobnosti.
- `src/api.ts` in `src/useResource.ts`: javni API prek `fetch`.
- `src/navigation.ts`: obstoječe URL hash poti in pogled.
- `src/styles.css`: potrjeni dizajn Folio.

Skupni tipi so v `shared/types.ts`. Odvisnosti, strežnik, infrastruktura, skupni testi in javni API ostanejo nespremenjeni.

## Odločitve

1. **Čisto filtriranje v samostojnem modulu.** V `src/taskFilters.ts` dodamo čiste funkcije za normalizacijo, iskanje po besedah, sestavljeni filter in izbor različnih odgovornih oseb. Funkcije ne dostopajo do omrežja ali shrambe.
2. **Stanje filtrov je lokalno v `ProjectView`.** Iskanje, filter stanja in filter odgovorne osebe hranimo v `ProjectView`. Ker je komponenta pripeta z `key={project.id}`, menjava projekta ponastavi vse tri vrednosti. Osvežitev strani začne z privzetimi vrednostmi; filtri se ne zapisujejo v URL ali trajno shrambo.
3. **Kontrole so nova ozka vrstica.** V `src/App.tsx` dodamo iskalni input `type=search`, oba `select`-a in gumb `Počisti filtre` z besedili iz specifikacije. Uporabimo obstoječe gradnike Folio; dodatne stile dodamo v `src/styles.css`.
4. **Pregled dobi filtrirane podatke.** Iz celotnega `tasks` izračunamo `filteredTasks` ter ga uporabimo v tabeli, tabli, števcih, pregledu stanj in sporočilu `Prikazano: N od M.`. Celoten `tasks` ostane vir za `M` in možnosti izbirnika oseb.
5. **Izbirnik oseb ostane neodvisen od filtrov.** Možnosti izračunamo iz celotnega `tasks` trenutnega projekta z `Set`; `all` je vedno prva možnost, vsako neprazno ime pa natanko enkrat v vrstnem redu prvega pojavljanja.
6. **Prazno stanje ločimo od `Ni zadetih.`** Če projekt nima opravil, ohranimo obstoječe prazno stanje. Če projekt ima opravila, nobeno pa ne ustreza, v obeh pogledih prikažemo `Ni zadetih.` ter ohranimo delujoče kontrole in navigacijo.
7. **Obstoječa potovanja ostanejo nespremenjena.** Povezave na opravila in podrobnosti pustimo na obstoječih mestih. Filtriranje ne sproži pisalnih zahtev na `/api/`, preklop pogleda pa ohrani hash pogled in vse tri vrednosti filtrov.

## Datoteke

- `src/taskFilters.ts`: nova čista logika normalizacije, iskanja, filtrov in možnosti oseb.
- `src/App.tsx`: stanje filtrov, kontrolna vrstica, filtrirani števci, tabela in sporočila.
- `src/TaskBoard.tsx`: nadaljnje uporaba `tasks` propa, ki bo že filtriran; brez spremembe javnega vmesnika komponente.
- `src/styles.css`: minimalni dodatni stili za kontrolno vrstico in sporočilo.
- `tests/agent/P03.spec.ts`: lastni Playwright testi za R01–R12 z nadzorovanimi GET odgovori.

## Preverjanje

1. `npm run lint`
2. `npm run typecheck`
3. `npm run build`
4. `npx playwright test --project=agent`
5. Obstoječi skupni projekti, še posebej `desktop` in `mobile`, za ohranjenost izhodišča in dizajna.

Lastni testi pokrijejo privzeto stanje, normalizacijo in več besed, kombinacijo filtrov, izbirnik oseb, oba pogleda, menjavo projekta, osvežitev, števce, prazen in neujemajoč projekt, čiščenje filtrov ter odsotnost pisalnih zahtev.
