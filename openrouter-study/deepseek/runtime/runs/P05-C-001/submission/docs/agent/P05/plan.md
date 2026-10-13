# P05: Straničenje in filter stanja — načrt izvedbe

## Tehnični kontekst

- React 19 + TypeScript 6 + Vite 8; vse odvisnosti so nameščene, novih ni.
- Podatki: obstoječi `useResource`/`request` bere samo `/api/` z GET; brez zapisov.
- Testi: Playwright; projekt `agent` bere `tests/agent/**/*.spec.ts` (Desktop Chrome). Razvojni pomočnik `tests/development/helpers.ts` (nadzorovani GET odgovori, `mount`, `expectIds`, `select`, `click`, `board`, `readonly`) je berljiv in se uporabi v lastnih testih.
- Stanje straničenja je lokalno stanju pogleda projekta; brez trajne shrambe in brez zapisa v URL.

## Odločitve

1. **Stanje**: `useState` v `ProjectView` (`src/App.tsx`) za `pageSize` (all | 2 | 5 | 10), `filter` (all | todo | in_progress | done) in `page` (1-indeksirana).
2. **Ponastavitev ob menjavi projekta**: `App` izriše `<ProjectView key={project.id} …>`; remount ponastavi stanje na all/all/1 (R08). Osvežitev strani prav tako remounta; ponovno nalaganje po napaki stanja ne shranjuje.
3. **Izpeljane vrednosti** (izračun v `App.tsx`): `filtered` (filter pred straničenjem, izvorni vrstni red), `N`, `Y` (0, če `N = 0`; 1, če `pageSize = all`; sicer `ceil(N / size)`), `currentPage = Y === 0 ? 0 : min(page, Y)`, `A`/`B` po predikatih iz specifikacije, `pageTasks` (odsek trenutne strani oz. vse pri `all`).
4. **Dejanja**: izbira velikosti ali filtra nastavi `page := 1`; Prva/Prejšnja/Naslednja/Zadnja nastavijo `page` le ob veljavnem cilju, sicer je gumb onemogočen (R03, R04, R05).
5. **Prikaz kontrole**: nova komponenta `src/Pagination.tsx` — selecta z labelama `Velikost strani` in `Filter strani`, štirje gumbi z besedili, element `role=status` z `aria-label="Stanje straničenja"` in besedilom `Stran X od Y. Prikazano A–B od N.` (pomišljaj –); pri `N = 0` `Stran 0 od 0. Prikazano 0–0 od 0.` in vsi gumbi onemogočeni (R09, R10).
6. **En odsek za oba pogleda**: `pageTasks` se poda preglednici in `TaskBoard`; tabla že združuje prejete naloge v stolpce, zato števci stolpcev štejejo trenutno stran (R06, R11). Povzetek stanj in skupni badge ostaneta nad celotnim `tasks` (R11).
7. **Slog**: razred `.pagination` v `src/styles.css` z obstoječimi spremenljivkami in gradniki Folio; pri širini 390 pik se kontrole prelomijo, preglednica in tabla ohranita notranje drsenje (R12).
8. **Brez sprememb infrastrukture**: `server/`, `shared/`, `tests/baseline.spec.ts`, `tests/api.spec.ts`, `playwright.config.ts`, `package.json` in `src/api.ts` ostanejo nedotaknjeni; `src/navigation.ts` se ne spreminja (stanje ni v URL-ju).

## Datoteke

- `src/App.tsx` — stanje, izračun odseka, uporaba `Pagination`, `pageTasks` v oba pogleda.
- `src/Pagination.tsx` (novo) — kontrole in status straničenja.
- `src/styles.css` — slog kontrol.
- `src/TaskBoard.tsx` — nespremenjen; prejme `pageTasks`.
- `tests/agent/p05-pagination.spec.ts` (novo) — lastni testi R01–R12 prek `../development/helpers.ts`.
- `docs/agent/P05/spec.md` — po izvedbi se izpolni tabela sledljivosti (izid in dokaz); vsebine se ne podvaja.

## Preverjanje

- Lastni testi: `npx playwright test --project=agent`.
- Kakovost: `npm run lint` in `npm run typecheck`.
- Skupni testi: `npx playwright test tests/baseline.spec.ts` (samo zagon, brez sprememb).
- Dokazi (ime testa, izid, dnevnik) se sproti vpišejo v `spec.md`; neizvedeni deli se označijo kot neizvedeni.

## Skladnost z ustavo

Zaprt obseg sprememb (`src/`, `tests/agent/`, `docs/agent/`), samo GET `/api/`, ohranjen videz Folio in dostopnostna pogodba, zahteve R01–R12 ostajajo merilo, brez trajne shrambe, novih odvisnosti in arhitekturnih preureditev.
