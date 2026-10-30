# Folo — Načrt: Priljubljena opravila in trajna shramba

**Priredba:** P07.1.0. Glej specifikacijo v *`docs/agent/P07/spec.md`*.

## Tehnološki kontekst

- **Slika:** React 19.3.0, TypeScript, Vite
- **Odvisnosti:** `lucide-react` za ikone
- **API:** preprost `fetch` prek `src/api.ts`; `/api/projects`, `/api/projects/{id}/tasks`, `/api/tasks/{id}`
- **Navigacija:** URI z `useSyncExternalStore` in `useRoute()`; `projectUrl()`, `taskUrl()`
- **Shranjevanje:** `localStorage` z edinstvenim ključem, ne API
- **Dizajn:** `src/styles.css` iz `docs/dizajn.md` (Folio); barve `#2f6dcc`, `#1d1d1f`, kartice bele

### Struktura vira

```
src/
  App.tsx                 # glavna aplikacija
  components.tsx          # helper komponente (StatusBadge, Avatar, Loading, LoadError)
  api.ts                  # API kliki (request, updateTask)
  navigation.ts           # useRoute, useSyncExternalStore
  useResource.ts          # custom hook za API vire (loading, error, retry)
  TaskBoard.tsx           # kwargs pogled (tabla)
  TaskDetails.tsx         # podrobnosti opravila
  TaskRow.tsx             # vrstica/rtič (predlagana nova komponenta za gumb)
  hooks/favorites.ts      # custom hook za priljubljene ID-je
  tasks/P07-spec.md       # specifikacija
  tasks/P07-plan.md       # ta načrt
  tests/agent/P07.spec.ts # lastni testi
```

## Tehnične odločitve

### 1. State management

- **Kontejner:** `localStorage` z edinstvenim ključem `folio:favorites:v1`
- **Shema:** `{ version: 1, ids: ["task-1", "task-2"] }`
- **Validacija:** pri naložbi preverjam ključ, verzijo in `ids`; napačna oblika → prazna množica
- **Hook:** `useFavorites()` (novo v `src/hooks/favorites.ts`)
  - `favorites()` → get shranjenih iz `localStorage`
  - `toggleFavorite(taskId: string)` → vklop/izklop
  - `removeFavoritesForProject(projectId: string)` → čiščenje za projekt
  - Uporablja `useEffect` za `storage` dogodek

### 2. UI komponente

- **Gumb `FavoriteButton`** (nova komponenta)
  - `aria-pressed` → stanje priljubljenega
  - Pomembno: postavljen ločeno od naslova opravila
- **Checkbox `ShowFavoritesOnly`**
  - Privzeta vrednost `false`
  - Filter samo priljubljenih za trenutni projekt
- **Element `FavoritesCount`**
  - `role="status"`, `aria-label="Priljubljeno: X od M."`
  - Števec priljubljenih za celoten projekt
- **Gumb `RemoveProjectFavorites`**
  - Brez priljubljenih → `disabled`
  - Odstrani samo ID-je tega projekta

### 3. Množice in filter

- **Globus:** enkratni ID-ji, sortiran po UTF-16, samo nizi
- **Filter:** uporabi `favorites.filter(id => tasks.some(t => t.id === id))` za trenutni projekt
- **Preglednica in tabla:** isto množico; preklop pogleda ne izgubi sprememb
- **Pravilni ID-ji:** ne ustvarjamo izmišljenih opravil; neznani ID-ji se ignorirajo

### 4. Shrambi in dogodki

- **Ključ:** `folio:favorites:v1`, `null` → izprazni množico
- **Validacija:** obravnavaj podvokane, neznane ID-je; ne ustvari novih opravil
- **Stanja napake:** izjeme pri branju/zapisu → UI ostane delno dostopen z napotitvijo

### 5. Dostopnost

- **ARIA:** `aria-pressed`, `role="status"`, `aria-label` za števec
- **Fokus:** pri uporabi tipkovnice fokus je viden
- **Ikone:** `aria-hidden="true"` za dekorativne elemente

## Ustrezne datoteke

| Datoteka | Namembnost |
| --- | --- |
| `src/hooks/favorites.ts` | custom hook za `localStorage` z validacijo, toggle, cleanup |
| `src/components.tsx` | nove komponente `FavoriteButton`, `FavoritesCount`, `RemoveProjectFavorites` |
| `src/App.tsx` | integracija: `FavoritesCount` v `project-overview`, `FavoriteButton` pri `TaskRow` |
| `src/navigation.ts` | ohranjeno; navigacija ne vpliva |
| `src/useResource.ts` | ohranjeno; API vire za podatke opravil |
| `tests/agent/P07.spec.ts` | lastni testi za funkcionalnost priljubljenih (Playwright) |
| `docs/agent/P07/tasks.md` | naloge iz specifikacije |

## Stopnje implementacije

### 1. Infrastruktura in hook (P1)

- Ustvari `src/hooks/favorites.ts` z `useFavorites()`
  - `favorites`, `toggle`, `removeMany` funkcije
  - `useEffect` za `storage` dogodek
  - Validacija JSON in oblike

### 2. Komponente (P2)

- Ustvari `FavoriteButton` v `components.tsx`
  - `onClick` → `toggle(taskId)`, `aria-pressed`
- Ustvari `FavoritesCount` v `components.tsx`
  - `role="status"`, `aria-label="Priljubljeno: X od M."`
- Ustvari `RemoveProjectFavorites` v `components.tsx`
  - `onClick` → `removeMany(projectId)`, `disabled` brez priljubljenih

### 3. Integracija v App (P3)

- V `App.tsx` dodaj `FavoritesCount` v `project-overview`
  - `data-task-id={project.id}` za povezavo
- V `TaskBoard.tsx` dodaj `FavoriteButton` pri vsakem opravilu
- V `TaskBoard.tsx` dodaj `ShowFavoritesOnly` checkbox
- Spremeni `src/App.tsx` da prikaže sporočilo `Ni priljubljenih opravil.` ko filter prazne

### 4. Testiranje (P4)

- Ustvari `tests/agent/P07.spec.ts` z `npx playwright test`
  - R01: `aria-pressed` gumb na vsakem opravilu
  - R02: `localStorage.getItem("folio:favorites:v1")` vrne JSON
  - R03: osvežitev obnovi ID-je
  - R04: neveljaven JSON → prazna množica
  - R05: checkbox privzeta vrednost `false`
  - R06: odstranitev priljubljenega med filtrom
  - R07: preglednica in tabla isto množico
  - R08: menjava projekta filter resetira
  - R09: odstranjevanje priljubljenih tega projekta
  - R10: števec prikazuje pravilno število
  - R11: `storage` dogodek uskladi množico
  - R12: ni zapisov na API

## Odprta vprašanja

- **Strogi testni scenariji:** `/__test/` za razvojne teste so uporabi samo testni program; uporabniški vmesnik jim ne dostopa (R12)
- **Neznani ID-ji:** ne ustavljamo izmišljenih opravil; se obravnavajo kot prazna množica
- **Projekti s praznimi priljubljenimi:** gumb odstranjen priljubljenih je `disabled`

---

*Ta načrt temelji na specifikaciji `docs/agent/P07/spec.md` in ohranja Folio dizajn.*

