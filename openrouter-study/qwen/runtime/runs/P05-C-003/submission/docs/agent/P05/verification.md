# Verifikacija P05: Stranicenje i filter stanja

## Splosne informacije

- Naloga: Dopolnite stranjenje in filtriranje opravil po statusu
- Datoteka specifikacije: docs/agent/P05/spec.md
- Datoteka nacerta: docs/agent/P05/plan.md  
- Datoteka nalog: docs/agent/P05/tasks.md
- Testi: tests/agent/P05/pagination.spec.ts, tests/agent/P05/api.spec.ts

## Pokritost zahtev

| Zastava | Status | Testi | Datoteka in del kode |
| --- | --- | --- | --- |
| R01 | | | src/usePaginatedTasks.ts, src/App.tsx |
| R02 | | | src/usePaginatedTasks.ts |
| R03 | | | src/PaginationControls.tsx |
| R04 | | | src/usePaginatedTasks.ts, src/App.tsx |
| R05 | | | src/usePaginatedTasks.ts, src/PaginationControls.tsx |
| R06 | | | src/App.tsx, src/TaskBoard.tsx |
| R07 | | | src/App.tsx, src/TaskDetails.tsx |
| R08 | | | src/App.tsx, src/navigation.ts |
| R09 | | | src/usePaginatedTasks.ts |
| R10 | | | src/usePaginatedTasks.ts, src/App.tsx |
| R11 | | | src/App.tsx |
| R12 | | | src/useResource.ts |

## Meje in omejitve

- Ne ureja /__test/ kontrol
- Ne spremeni skupne infrastrukture
- Testi uporablja chromium connect preko websocket
- State se shrani lokalno, ne v URL trajno

## Datum

2026-10-30

