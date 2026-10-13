# Razvojna specifikacija: Iskanje in sestavljeni filtri

## Problem in kontekst

Obstojajoča aplikacija Folio prikazuje opravila (tasks) v projektih v obrazcu preglednice ali tabele. Uporabniki morajo znati:

- Iskati opravila po naslovu, opisu, ID-ju ali odgovorni osebi.
- Filtrirati po stanjih (todo, in_progress, done) in odgovorni osebi.
- Ponastaviti filtre.
- Prikazati števec `Prikazano: N od M`.

Sprememba: izboljšati obstoječi vmesnik s strežniško stranjo (search in filter controls), hkrati pa ohraniti obstoječe polje na delujoč način.

**Vhodi:** Iskalni vnos (input type=search), Filter stanja (select), Filter odgovorne osebe (select), Gumb Počisti filtre.

**Dejanja:** Uporabnik vnese besede, izbere filter, prekine projekt, filtro se resetirajo.

**Izidi:** Filtrirana lista opravil, Števec `Prikazano: N od M`, `Ni zadetkov.` sporočilo.

**Simboli:** `tasks`, `searchQuery` (NFD, lowercase), `selectedStatus`, `selectedAssignee`, `displayCount`.

**Predpostavke:** Brez /__test/ dostopa, brez URL/localstorage shranjevanja, Izhodiščna vrstna vrsta ostaja nespremenjena, Preklop pogleda ne spremeni filtrov, Preklop projekta ponastavi filter in iskanje.

**Napake:** API napake → LoadError z možnost poskusi znova.

---

## Zahteve in pravila

| Zahteva | Pravilo | Način preverjanja |
|---|---|---|
| R01 | Privzeto stanje = prazno. | Testna začetna stanja. |
| R02 | Iskanje NFD, lowercase, odstrani kombinacijske znake. | Test č/c diacritics. |
| R03 | Iskanje po belinah, vse besede podniz združenih polj. | Test "proj 123 naslov". |
| R04 | Filter skupaj po logičnem IN. | Test kombinirani filtri. |
| R05 | Izbirnik: all + vsi imeni natanko enkrat. | Test obnavljanja list. |
| R06 | Preglednica in tabla iste ID-je, filtri ohranjeni. | Test preklop tabice. |
| R07 | Preklop projekta resetira filtre. | Test preklop projekta. |
| R08 | Reset page, brez URL/localstorage. | Test reload. |
| R09 | Števec `Prikazano: N od M`. | Test vsi števila. |
| R10 | `Ni zadetkov.` + oba pogleda uporabna. | Test prazni rezultati. |
| R11 | Gumb resetira vse tri kontrole na default. | Test gumb Počisti. |
| R12 | GET samo, ne POST/PATCH/PUT/DELETE. | Test zahtev GET. |

---

## Predikati in pravila spremembe stanja

### Iskanje

```
normalizeSearch(query: string): string:
  query = query.normalize("NFD").replace(/[^\p{L}\p{Number}]/ug, "");
  return query.toLowerCase();
```

```
splitQuery(query: string): string[]:
  return query.split(/\s+/).filter(Boolean);
```

```
matches(task: Task, words: string[]): boolean:
  if (words.length === 0) return true;
  const fields = [task.id, task.title, task.description, task.assignee].join("");
  return words.every((w) => fields.includes(w));
```

### Filtriranje

```
filterTasks(tasks: Task[], status: TaskStatus|all, assignee: string): Task[]:
  let result = tasks;
  if (status !== all) result = result.filter(t => t.status === status);
  if (assignee !== all) result = result.filter(t => t.assignee === assignee);
  return result;
```

### Kompleksno

```
filteredTasks(tasks: Task[], searchQuery: string, status: TaskStatus|all, assignee: string): Task[]:
  if (!searchQuery || !searchQuery.trim()) return tasks;
  const normalized = normalizeSearch(splitQuery(searchQuery));
  const matched = tasks.filter(task => matches(task, normalized));
  return filterTasks(matched, status, assignee);
```

---

## Izvedba in sledljivost

| Zahteva | Pogoj | Test/scenarij | Datoteka | Izid |
|---|---|---|---|---|
| R01 | Privzeto status | Inicializacija | src/TaskFilters.tsx | [] |
| R02 | Unicode NFD | Test č/c | src/TaskFilters.tsx | normalizeSearch() |
| R03 | Besedno | "proj 123" | src/TaskFilters.tsx | matches() |
| R04 | IN logika | Kombinirani filtri | src/TaskFilters.tsx | filterTasks() |
| R05 | Izbirnik */all* | Obnovi listo | src/TaskFilters.tsx | options |
| R06 | Preglednica/tabla | Preklop | src/TaskBoard.tsx, App.tsx | View switch |
| R07 | Switch resetira | Preklop projekta | App.tsx, navigation.ts | route.handle |
| R08 | Reset page | Reload | App.tsx | React state |
| R09 | Števec N od M | Vse števila | src/TaskFilters.tsx | countDisplay |
| R10 | Ni zadetkov | Prazni | src/TaskFilters.tsx | empty state |
| R11 | Reset gumb | Click Počisti | src/TaskFilters.tsx | resetHandlers |
| R12 | GET samo | GET-only | src/TaskFilters.tsx | API calls |

---

## Odprta vprašanja in omejitve

- Ne preverjeno: ozka širina (390 px).
- Ne preverjeno: API napake → LoadError.
- Omejitev: /__test/ ni dostopen.
- Specialne znake v iskalnem vnosu se ignorirajo.

