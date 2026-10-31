# Zgodovina specifikacije

## P09-B-001 (agent priprave specifikacije)

### Ustvarjena specifikacija

- **Datoteka**: `docs/agent/specifikacijo.md`
- **Vnos**: Prvi začetni zapis s ključnimi zahtevami R01–R12

### Povečana specifikacija

| Zahteva | Vsebina |
| --- | --- |
| R01–R05 | URI razčlenjevanje, normalizacija, osnutek, potrjeni parametri in zgodovina |
| R06–R12 | Uporaba, odprava, pogled, navigacija, drugi projekt, resetovanje in API |

### Podatki in tipi

- `normalizeSearch()` – trim, NDF, odstraniti dijakriko
- `filterTasks()` – filtrirajte po `q` in `status` (IN)
- `compareTasks()` – vrstni red `original/title-asc/title-desc`
- `ViewHistory` – shranjevanje potrjenih parametров brez localStorage

### Izvedba

- Podatki iz `/api/`, stanje ni v `/__test/`
- Testi v `tests/agent/` (pripraviti implementerju)
- UI komponente so ohranjene iz Folio dizajna

### Omejitve

- Vrstni red enakih naslovov ohrani izvorni vrstni red
- Neznani parametri se ignorirajo ob razčlenjevanju URL
