# Poročilo implementacije in preverjanja (P03)

Različica 0.1 (začetni zapis, 2026-10-11). Vloga: implementer. Vir zahtev:
`task/instructions.md` R01–R12 in predana `docs/agent/specification.md`.
Specifikacije, zgodovine in `review.md`/`review.json` ne spreminjam.

## Načrt preverjanja (še neizvedeno)

| Zahteva | Načrtovano preverjanje | Status |
| --- | --- | --- |
| R01 | privzeti seznam in vrednosti kontrol ob nalaganju; razvojni D01 | neizvedeno |
| R02 | iskanje brez diakritike/velikosti črk (`CAS`, `c`, `č`); D01 | neizvedeno |
| R03 | več besed v poljubnem vrstnem redu, dobesedna ločila (`=SUM(A1)`, `"citat"`) | neizvedeno |
| R04 | IN kombinacija iskanja, stanja in osebe; D02 | neizvedeno |
| R05 | možnosti oseb iz celotnega projekta tudi pri filtriranih opravilih; reset ob menjavi | neizvedeno |
| R06 | isti ID-ji v obeh pogledih, ohranjeni filtri ob preklopu; D02 | neizvedeno |
| R07 | menjava projekta ponastavi filtre in uporabi le nove podatke | neizvedeno |
| R08 | osvežitev strani ponastavi; brez URL/`localStorage`/`sessionStorage` | neizvedeno |
| R09 | `Prikazano: N od M.`, pregled stanj in števci stolpcev štejejo prikazane; D04 | neizvedeno |
| R10 | `Ni zadetkov.` pri N=0<M, prazna projekta; oba pogleda uporabna | neizvedeno |
| R11 | `Počisti filtre` ponastavi vse tri kontrole; podatki nespremenjeni | neizvedeno |
| R12 | navigacija in podrobnosti, ni zapisovalnih klicev, 390 px brez prelivanja; D04 | neizvedeno |

## Izvedene spremembe

- `src/filterTasks.ts` (novo): normalizacija NFD/U+0300–U+036F/male črke,
  `searchWords`, `matchesSearch`, `filterTasks` (IN, natančna oseba),
  `assigneeNames`, `statusCounts`.
- `src/App.tsx`: stanje filtrov v `ProjectView` (`key={project.id}` reset ob
  menjavi projekta), vnos, oba izbirnika, `Počisti filtre`, `role=status`
  `Prikazano: N od M.`, prikaz/števci iz `visibleTasks`, `Ni zadetkov.` pri
  `M>0 ∧ N=0`, prazno stanje pri `M=0`.
- `src/styles.css`: `.filter-bar`, `.search-field`, `.filter-field`,
  `.filter-summary`, `.no-results` in ozki zaslon.
- `tests/agent/P03-implementation.spec.ts` (novo): 11 lastnih testov R01–R12.

## Dejanski rezultati

- `npm run typecheck` in `npm run lint`: uspešno.
- Razvojni testi obeh projektov: 8/8 uspešnih (D01–D04).
- Lastni testi `--project=agent`: 11/11 uspešnih (R01–R12).
- `npm run check` (gradnja + osnovni testi) zaradi roka ni bil izveden.

## Omejitve in odprta vprašanja

- Končni testi naloge v tem okolju niso dostopni; preverjam z razvojnimi in lastnimi testi.
