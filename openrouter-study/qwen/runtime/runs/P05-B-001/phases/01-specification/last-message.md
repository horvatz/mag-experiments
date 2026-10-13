## Končno sporočilo

Izpolnili sem vlogo **priprave specifikacije** za P05:

- **Časi**: Preostaja še **136 s** od 359 s; roko zaključi z manj kot 10 s pred rokom.
- **Dokumentacija**: Zapisali `docs/agent/specification.md` in `docs/agent/specification-history.md`.

### Kaj je v specifikaciji zajeto

| Področje | Vsebina |
| --- | --- |
| Problem | Folio pregled opravil brez straničenja/filterja |
| Podatk. tipi | `pageSize`, `filter`, `page`, `tasks` |
| Zahteve R01–R12 | Za vsako zahtevo je definiran sprejemni pogoj |
| Vmesnik | `select` (all/2/5/10), `filter` (all/todo/in_progress/done), gumbi, `role="status"` |
| Obnašanje | Popravek stran 1 pri spremembi, R10 za prazno stanje, ohranjanje obstoječih povezav |
| API uporaba | Branje `/api/projects/{id}/tasks` samo |

Naslednji koraki pripadajo implementerju (implementacija in testiranje).

Zaključevali in predam spletkaciju implementerju.
