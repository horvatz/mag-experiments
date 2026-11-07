# P04 — Dnevnik preverjanj

**Status**: Opravljeno | **Datum**: 2026-10-13

## Izvedena preverjanja

- `npm run typecheck` — uspešno po `T001` (`src/sorting.ts`).
- `npm run typecheck` — uspešno po `T002` (`src/App.tsx`).
- `npm run typecheck` — uspešno po `T003` (`src/App.tsx`, `src/styles.css`).
- `npm run typecheck` — uspešno po `T004` in `T005` (`tests/agent/p04.spec.ts`).
- `npm run lint` — uspešno.
- `npx playwright test tests/agent/p04.spec.ts --project=agent` — uspešno, 14/14.
- `npm run check` — uspešno: ESLint, tipi, gradnja Vite in Playwright 60/60 (14 API, 24 osnovnih, 8 razvojnih P04, 14 lastnih P04).
- Artefakti Spec Kit so prebrani; implementacija se izvaja po nalogah `T001`–`T008`.

## Rezultati po zahtevah

| Zahteva | Izid | Dokaz |
| --- | --- | --- |
| R01 | Uspešno. | `R01: default controls preserve received order`; `npm run check` 60/60. |
| R02 | Uspešno. | `R02: normalized title and assignee comparison uses UTF-16`; `npm run check` 60/60. |
| R03 | Uspešno. | `R03: status and valid dates use domain order`; `npm run check` 60/60. |
| R04 | Uspešno. | `R04: direction changes comparison result, not the whole projection`; `npm run check` 60/60. |
| R05 | Uspešno. | `R05: secondary key applies only on primary equality with its own direction`; `npm run check` 60/60. |
| R06 | Uspešno. | `R06: equal keys stay stable and original ignores all controls`; `npm run check` 60/60. |
| R07 | Uspešno. | `R07: board columns are fixed and preserve relative sorted order`; `npm run check` 60/60. |
| R08 | Uspešno. | `R08: view switch and details preserve all four controls`; `npm run check` 60/60. |
| R09 | Uspešno. | `R09: project switch and refresh reset without persistence`; `npm run check` 60/60. |
| R10 | Uspešno. | Trije testi `R10` za ponastavitev, prazen in enoopravilen projekt; `npm run check` 60/60. |
| R11 | Uspešno. | `R11: sorting is a read-only projection`; `npm run check` 60/60. |
| R12 | Uspešno. | `R12: IDs remain unique and open the correct details at 390 pixels`; `npm run check` 60/60. |

## Omejitve

- Končni testi niso na voljo; zato niso navedeni kot izvedeni.
- Spremembe so omejene na `src/`, `tests/agent/` in dokumente v `docs/agent/`; infrastruktura, strežnik, skupni tipi in odvisnosti niso spremenjeni.
