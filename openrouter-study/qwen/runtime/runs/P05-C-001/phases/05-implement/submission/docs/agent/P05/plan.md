# P05: Straničenje in filter stanja

## Implementacijski načrt (Lean)

**Datum:** 2026-10-09
**Specifikacija:** [docs/agent/P05/spec.md](docs/agent/P05/spec.md)
**Design:** [docs/dizajn.md](docs/dizajn.md)

---

## Tehnični kontekst

### Stack

- **React** 19.3.0, **TypeScript** 6.0.3
- **Vite** 8.3.0 za build/dev
- **Playwright** za teste
- Host: `server/dev.ts`, API: `/api/`

### Struktura aplikacije

- `src/` — uporabniški vmesnik in pomožni hooki
- `tests/agent/` — lastni testi naloge
- `docs/agent/` — dokumentacija in specifikacija
- Infrastruktura (`server/`, `shared/`, skupni testi): **ne spremeni**

### Obstojee mape

- `src/App.tsx` — glavna komponenta
- `src/TaskBoard.tsx` — tabla
- `src/TaskDetails.tsx` — podrobnosti
- `src/api.ts` — API (GET samo)
- `src/useResource.ts` — hook zaResource
- `src/navigation.ts` — rutiranje prek URL

---

## Arhitektura in odločitve

### Obnašalni model

- **Stran** — razdeli `filtered_count` v strani po `size` (all/2/5/10)
- **Filter** — URI le `all/todo/in_progress/done`
- **Stanje** — `page`, `size`, `filter` → reaktiven prikaz
- **View** — `table | board`, preklop ohranja stran/filter/size

### Razporeditev podatkov

- API le GET `/api/` — dostop do `tasks` za projekt
- `useResource(/api/tasks)` — osnova dobivanka podatkov
- Local state: `page`, `size`, `filter`, `tasks`, `view`

### Stanje in navigacija

- Privzet: `page=1`, `size=all`, `filter=all`
- Sprememba `size/filter` → `resetPage()`
- Menjava projekta/osvežitev → vsi resetirajo se
- URL ni del stanja (R08), stanje je lokalno

### Prikaz stanja

- `aria-label="Stanje straničenja"` — element `status`
- Besedilo: "Stran X od Y, Prikazano A–B od N"
- Neveljavni gumbi so `disabled`

### Vsebine in datoteke

#### `docs/agent/P05/`

- `spec.md` — specifikacija (ustvarjeno)
- `plan.md` — načrt (ta datoteka)
- `tasks.md` — podnaloge

#### `src/`

- `src/pagination.ts` — logika straničenja in filtranja
- `src/usePagination.ts` — custom hook za `page/size/filter`
- `src/TaskPaginationControls.tsx` — gumbi za navigacijo
- `src/StatusBadge.tsx` — prikaz stanja straničenja
- `src/TaskList.tsx` — podrobna listovna komponenta (R06)
- `src/TaskBoard.tsx` — original, združuje se s straničenjem
- `src/App.tsx` — integracija v glavno komponento
- `src/navigation.ts` — dodatek za `page`, `size`, `filter` query params (rj)

#### `tests/agent/`

- `pagination.spec.ts` — končni testi za P05

---

## Načrt datotek

| Datoteka | Namen |
| --- | --- |
| `src/pagination.ts` | izračuni totalPage, start, end, disabled nav |
| `src/usePagination.ts` | hook za `pageSize`, `filter`, `page` |
| `src/StatusBadge.tsx` | prikaz "Stran X od Y, Prikazano A-B od N" |
| `src/TaskPaginationControls.tsx` | gumbi za prvi, prejsnji, naslednji, zadnji str |
| `src/TaskList.tsx` | tabela/list z `data-task-id`, `aria-label` |
| `src/App.tsx` | integracija pagination, filter, view |
| `src/navigation.ts` | urjenje `page`, `size`, `filter` v query params (rj) |
| `tests/agent/pagination.spec.ts` | testni primeri za vse zahteve |

---

## Zaporedje del

1. **`src/pagination.ts`**
   - Funkcije: `getPaginationStats(count, pageSize, currentPage)`
   - Funkcije: `isValidNavigation(pageBoundary, total, direction)`
   - Logika: `lastPage = ceil(count/scale)`

2. **`src/navigation.ts`**
   - Dodajamo `page`, `size`, `filter` v query params (rj)
   - Če ni določenih, uporabljamo default

3. **`src/usePagination.ts`**
   - `usePagination(pageSize, filter)`
   - Intern: `page`, `total`, `pageSize`, `filter`
   - API: `data = useResource(\`/api/tasks\`)`
   - Update: ob spremembi `pageSize` ali `filter` resetPage()

4. **`src/StatusBadge.tsx`**
   - Aria-label: "Stanje straničenja"
   - Tekst: "Stran X od Y, Prikazano A–B od N"
   - Onemogočeni gumbi: prikaz `aria-disabled="true"`

5. **`src/TaskPaginationControls.tsx`**
   - Gumbi: prva, prejsnja, naslednja, zadnja
   - `disabled` na robovih, ne spremeni stanja

6. **`src/TaskList.tsx`**
   - Tabela s stolpci, `data-task-id`, `aria-label="Pregled stanj opravil"`
   - Ista stran kot `TaskBoard` za trenutno

7. **`docs/agent/P05/tasks.md`**
   - Podnaloge po zaporedju odvisnosti

8. **`tests/agent/pagination.spec.ts`**
   - Testi za vsako zahtevo R01–R12

---

## Preverjanje in prijava

- Testi: `npm test` Playwright
- Vsebina: `test-results/`
- Ne velja: skupni testi, `tests/baseline.spec.ts` le branje

---

## Omejitev in področje

- Nobena infrastruktura, odvisnosti, skupni tipi niso spremenjeni
- `server/dev.ts` ostaja nedejavn
- Postopek C: spremenjeno le `src/`, `tests/agent/`, `docs/agent/`
- Folio dizajn ohranjen
