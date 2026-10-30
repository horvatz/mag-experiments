# Plan: P05 - Straničenje i filter stanja

## Tehnički kontekst

### Tehnologija
- **Stack:** React 18, TypeScript, Vite
- **Vrhunske datoteke:** lucide-react za ikone
- **Custom hook:** `useResource.ts` za API pozive
- **Javni API:** `/api/projects`, `/api/projects/{id}/tasks`

### Obstoječi podatkovni tipi
- `Project`: { id, name }
- `Task`: { id, projectId, title, description, status (todo/in_progress/done), assignee, dueDate }

### Ključne datoteke
| Datoteka | Vlogo |
| --- | --- |
| `src/App.tsx` | Glavna komponenta, prikaz projektov |
| `src/useResource.ts` | Custom hook za async podatke |
| `src/navigation.ts` | URL rute in hash branje |
| `src/api.ts` | API komunikacija |
| `src/TaskBoard.tsx` | Tabla z opravili (card view) |
| `src/TaskBoard.tsx` (table) | Preglednica (table view) v `App.tsx` |

## Arhitekturne odločitve

### Stanje straničenja in filtra
- **Lokalno stanje:** V `App.tsx` dodamo `useMemo` stanje, da ohranimo trenutno stran, velikost in filter za projekt.
- **Ne deli URL-ja:** Stanje se ne shrani v URL (po navodilih).
- **Reset ob spremembi:** Sprememba projekta, velikosti strani ali filtra vrne na stran 1, filter all.

### Stroj za straničenje
- State: `{ page, pageSize, filter }`
- Computed: Filtrirani niza in izračun stranih
- Pages: `(filteredLength + pageSize - 1) | 0` (cepljenje stranih)
- Indexi: `(page - 1) * pageSize` do `Math.min(page * pageSize, filteredLength)`

### Filter logika
- Filter se aplikira pred straničenjem: `tasks.filter(t => !filter || t.status === filter)`
- `filter === all` pomeni brez filtriranja

### Preglednica in tabla
- **Isti ID-ji:** Objekti `data-task-id={task.id}` so isti v preglednici in tabli.
- **Tabla:** Treba združiti v stolpce v trenutni strani brez dodatnega straničenja.

## Strategija implementacije

### 1. Dodajanje stanja (App.tsx)
- `page`, `pageSize`, `filter` stanje s `useReducer` ali `useState`
- `useMemo` za filtriranje in straničenje

### 2. Custom hook `usePaginatedTasks`
- Enoten dostop do izračunanih stranih
- `tasks[page]` - opravila na strani
- `pageInfo` - Stran
X
od
Y, Prikazano
A–B
od
N.

### 3. UI komponente
- PaginationHeader: status in navigacijski gumbi
- Update TabView: `filter` dropdown, `pageSize` select

### 4. Testiranje
- Enotasti testi za pagination logiko
- Eno integration za API interakcije

## Struktura datotek

### Glavne datoteke za spremembe
| Datoteka | Spremembe |
| --- | --- |
| `src/App.tsx` | Dodaj stanje za page/filter |
| `src/usePaginatedTasks.ts` | Novi custom hook (nov) |
| `src/PaginationControls.tsx` | UI za pagination (nov) |
| `src/styles.css` | Dopolnjeno stiliziranje |

### Testni dodatki
| Datoteka | Namenc |
| --- | --- |
| `tests/agent/P05/pagination.spec.ts` | Integritasni testi za strane, filter, status |

## Implementacijske korake

### Korak 1: `usePaginatedTasks` hook
```
- Sprejme tasks, page, pageSize, filter
- Vrne filteredTasks, paginatedTasks, pageInfo
- Uporabi useMemo in memo za učinkovitost
- `pageInfo: { currentPage, totalPages, from, to, total }
```

### Korak 2: `PaginationControls` komponenta
```
- Dropdown za velikost: all/2/5/10
- Dropdown za filter: all/todo/in_progress/done
- Gumbi: Prev, Sledi, Prv, Zad
- Role=status, aria-label="Stanje straničenja"
- `onPageChange`, `onFilterChange`, `onPageSizeChange`
```

### Korak 3: App.tsx integracija
```
- State initialization (page, pageSize, filter)
- usePaginatedTasks hook call
- Render table z filterjem
- Render PaginationControls
- Reset stanja ob spremeni projekta
```

### Korak 4: Table view update
```
- Izbira current page tasks namesto vseh
- Zapisani in skupni stolpci ohranjeni
- colspan/styling prilagoditev, če primanjkuje prostora
```

### Korak 5: Board view update
```
- Filter znotraj stolpca
- Page znotraj stolpca vs. skupaj (koliko stranih po statusu)
- Razlage zahteve R06: tabla združuje trenutni odeljek
```

### Korak 6: Testi
```
- Prilagodljivi scenariji za vsako zahtevo R01–R12
- Prazna stanja, robni primeri, megle
- Integration za UI in API
```

## Simbolika in prepoznavnost

- "all" = neskončna ali celotna lista (brez limitacije)
- Statusi: todo, in_progress, done
- "Stran X od Y" = trenutna X od celotno X
- A–B od N = indeks od indeks od celotno (1-based)

## Omejitve

- Ne dostopa /__test/ kontrol
- Ne spremeni URL parametrim za stanje
- Ne dodaja trajne shrambe
- Običajni red osnova API-ja
- Ne širi v drugih projektih ali odvisnostih
- Ne spreminja skupne infrastrukture ali starih testov

