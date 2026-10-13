# Straničenje in filter stanja - Razvojna specifikacija P05

## Problem in kontekst

Aplikacija prikazuje opravila projekta. Trenutna verzija prva. Dodajmo straničenje in filtriranje po statusu opravil.

## Vhodi, dejanja in izidi

### Spremenljivke

- currentPage: 1, 2, 3... (default: 1)
- pageSize: all | 2 | 5 | 10 (default: all)
- filter: all | todo | in_progress | done (default: all)
- tasks: Array<Task> (iz API-ja)

### Dejanja

1. Stran: Page navigation buttons
2. Velikost: All/2/5/10 selection
3. Filter: Status filtering
4. View switch: Table/board toggle
5. Project switch: Reset state

---
