# P03 – Iskanje in sestavljeni filtri (načrt)

Izhodišče: `docs/agent/P03/spec.md` (R01–R12), ustava
`.specify/memory/constitution.md`, `PROJECT_RULES.md`. Pot: `docs/agent/P03`.

## Tehnični kontekst

- React 19 + TypeScript + Vite, `lucide-react`; brez novih odvisnosti.
- Podatki se berejo samo prek `GET /api/projects` in
  `GET /api/projects/{id}/tasks`; filtriranje ne piše na strežnik.
- Testi: Playwright (`playwright.config.ts`); projekt `agent` zajema
  `tests/agent/**/*.spec.ts`, projekt `development` `tests/development/`.
- Obstoječe točke: `src/App.tsx` (`ProjectView`: povzetek stanj, preklop
  pogleda, preglednica, prazno stanje), `src/TaskBoard.tsx` (stolpci in
  kartice), `src/components.tsx`, `src/styles.css`, `src/navigation.ts`
  (hash usmerjevalnik, `view`).

## Odločitve

- D1 – Ločena čista logika: nova datoteka `src/filters.ts` z `normalize`,
  `splitWords`, `matchesQuery`, `filterTasks`, `assigneeOptions`; brez stanja
  in omrežja, zato preverljiva neposredno in uporabljena v obeh pogledih.
- D2 – Stanje filtrov živi v `ProjectView` (`useState` za iskalni niz, stanje
  in osebo). Menjava projekta ponastavi stanje prek `key={project.id}`;
  `view` ostane v usmerjevalniku (R06, R07, R08).
- D3 – Filtriranje je odjemalsko nad že naloženim seznamom (`useMemo`), brez
  ponovnih klicev API-ja in brez zapisovalnih zahtev (R03, R12).
- D4 – En vir resnice za prikaz: `visible = filterTasks(tasks, ...)`,
  `M = tasks.length` (celoten projekt), `N = visible.length`; povzetek stanj in
  števci stolpcev se računajo iz `visible`, `TaskBoard` prejme `visible` (R06,
  R09).
- D5 – Prazna stanja: `M > 0 ∧ N = 0` → sporočilo `Ni zadetkov.` v območju
  seznama, tabla ostane s stolpci in svojim praznim besedilom; `M = 0` ohrani
  obstoječe prazno stanje s števcem `0 od 0` (R10).
- D6 – Vmesnik z obstoječimi gradniki: vrstica kontrol nad seznamom z
  `input type=search` (Išči opravila), `select` Filter stanja, `select` Filter
  odgovorne osebe, gumb Počisti filtre in `role=status` z
  `aria-label="Rezultati filtriranja"` ter besedilom `Prikazano: N od M.`
  (R01–R05, R09, R11). Nove razrede dodamo v `src/styles.css` z obstoječimi
  spremenljivkami; pri ozki širini se vrstica prelomi, brez vodoravnega
  razširjanja strani (R12).
- D7 – Možnosti oseb: `all` in vsako različno neprazno ime iz celotnega
  projekta, vsako natanko enkrat; vrednost ostane natanko ime, primerjava brez
  normalizacije (R04, R05). Vrstni red možnosti ni predpisan; uporabimo
  abecednega za predvidljivost.

## Datoteke

| Datoteka | Sprememba |
| --- | --- |
| `src/filters.ts` | novo: normalizacija (NFD, odstranjeni U+0300–U+036F, male črke), besede, ujemanje, filtriranje, možnosti oseb |
| `src/App.tsx` | stanje filtrov, vrstica kontrol, `role=status`, povzetek iz `visible`, `key` projekta, `Ni zadetkov.` |
| `src/TaskBoard.tsx` | prejme filtrirana opravila; števci stolpcev iz prejetega seznama |
| `src/styles.css` | razredi za vrstico kontrol in ozko širino |
| `tests/agent/p03-filters.spec.ts` | lastni testi R01–R12 (Playwright, projekt `agent`) |
| `docs/agent/P03/spec.md` | vnos dokazov v tabelo Izvedba in sledljivost |

## Preverjanje

- `npm run typecheck`, `npm run lint`, `npm run build`.
- Regresija: `npx playwright test tests/baseline.spec.ts tests/api.spec.ts`
  (R12) ter skupni `npm test`.
- Lastni testi: `npx playwright test --project=agent`; za nadzorovane GET
  odgovore uporabimo javni pomočnik `tests/development/helpers.ts` (samo branje)
  in lastne zapise opravil za robne primere (R02, R03, R05, R10).
- Dokazi: imena testov in povzetek zagona v tabeli sledljivosti v
  `docs/agent/P03/spec.md`; neizvedeni testi so označeni kot neizvedeni.

## Tveganja in omejitve

- Skupni helper in skupni testi so samo za branje; lastni testi jih uvažajo, ne
  spreminjajo.
- Playwright zažene strežnik sam (`webServer`, `reuseExistingServer: false`).
- Brez novih odvisnosti, brez sprememb strežnika, skupnih tipov, nastavitev in
  skupnih testov; brez trajne shrambe ali URL-parametrov filtrov.
