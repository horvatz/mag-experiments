# P03 — Preverjanje izvedbe

Status: zaključen. Vsa izvedena preverjanja so lokalna; končnih skritih testov ni na voljo.

## Izvedeni ukazi

| Ukaz | Izid | Opomba |
| --- | --- | --- |
| `npm run typecheck` | Uspešno | Prva izvedba je odkrila napako v tipih testnega primera R02; po popravku prehaja. |
| `npm run lint` | Uspešno | Prva izvedba je odkrila odvisnost React hooka in sintaksno napako testa; po popravku prehaja. |
| `npm test -- --project=agent` | Uspešno | Prvi zagon: 9/12. Po popravku testnih pričakovanj in mobilnega sloga: 12/12. |
| `npm run check` | Uspešno | ESLint, TypeScript, produkcijska gradnja in 58 Playwright preverjanj. |

## Rezultati `npm run check`

- ESLint: brez napak.
- TypeScript: brez napak.
- Vite build: uspešen.
- Playwright: 58/58 uspešnih.
  - API: 14/14.
  - Osnovni namizni in mobilni testi: 24/24.
  - Razvojna preverjanja P03: 8/8.
  - Lastna agent preverjanja P03: 12/12.

## Sledljivost zahtev

| Zahteva | Lastno preverjanje | Izid |
| --- | --- | --- |
| R01 | `R01: default controls show all tasks in source order` | Uspešno |
| R02 | `R02: normalized search covers all fields` | Uspešno |
| R03 | `R03: every literal term matches in any order` | Uspešno |
| R04 | `R04: search, status and assignee combine with exact assignee matching` | Uspešno |
| R05 | `R05: assignee options come from the whole project and reset on project change` | Uspešno |
| R06 | `R06: table and board show the same filtered IDs` | Uspešno |
| R07 | `R07: changing project resets all filters and never filters another project` | Uspešno |
| R08 | `R08: refresh resets filters without URL or browser storage` | Uspešno |
| R09 | `R09: counts reflect displayed results` | Uspešno |
| R10 | `R10: no matches and empty project states remain usable` | Uspešno |
| R11 | `R11: clearing filters resets all controls and order` | Uspešno |
| R12 | `R12: navigation and details work without writes at 390 pixels` | Uspešno |

## Omejitve

- Končnih skritih testov ni na voljo, zato niso izvedeni in niso označeni kot uspešni.
- Zunanji internet, druge projekti ali oddaljeni repozitoriji niso uporabljeni.
- Ročni ogled ni izveden; mobilno obnašanje pri 390 px je pokrito z avtomatiziranim testom R12.
- Sočasne spremembe podatkov med nalaganjem niso dodatno širjene, kot določa naloga.
