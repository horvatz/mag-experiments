# P08 — Zapis dejanskega preverjanja

Datum: 2026-10-09. Postopek A (en agent). Okolje: macOS (Apple Silicon),
Node.js 24.11.1, Playwright 1.63.0 z ločenim Chromiumom prek
`task/browser.json`, strežnik `npm run dev` na 5174/3102.

## Izvedeni ukazi in rezultati

| Ukaz | Obseg | Rezultat |
| --- | --- | --- |
| `npx tsc --noEmit` | tipi celotnega repozitorija | uspešno, brez napak |
| `npx eslint src tests/agent` | slog spremenjenih datotek | uspešno, brez opozoril |
| `npx playwright test --project=agent --project=development-desktop --project=development-mobile` | lastni testi + razvojni P08 | 20/20 uspešnih (12 lastnih, 8 razvojnih) |
| `npm run check` | lint + build + vsi testi | 58/58 uspešnih: 38 izhodiščnih (14 API, 12 desktop, 12 mobile), 8 razvojnih P08, 12 lastnih |

Lastni testi so v `tests/agent/P08.spec.ts`; uporabljajo javni pomočnik
razvojnih testov (`tests/development/helpers.ts`) in nadzorovane GET odgovore.
Aplikacija testnih kontrol `/__test/` ne uporablja.

## Povezava zahtev z dokazi

| Zahteva | Preverjen pogoj | Dokaz (test) | Izid |
| --- | --- | --- | --- |
| R01 | Začetni datum `2026-09-21` in skupina `all` tudi ob uri naprave 2031; vseh 8 opravil vidnih | agent › R01 (z `page.clock.setFixedTime`); D01 | uspešno |
| R02 | Dve `done` opravili (2020, 2030) štejeta le v `done`; odprto preteklo v `overdue` | agent › R02; D04 | uspešno |
| R03 | `dueDate` dan pred ref → `overdue`, enak → `today` | agent › R03/R04; D01; D03 (`2026-09-20` → le `web-01`) | uspešno |
| R04 | +1 in +7 → `week`, +8 → `later`; skupine disjunktne, unija = vsa opravila | agent › R03/R04; D02 (week = `web-02`, `web-04`) | uspešno |
| R05 | `2024-02-28 +1 = 2024-02-29`, `+7 = 2024-03-06`, `+8 = 2024-03-07`; `2025-12-31 +1 = 2026-01-01`; prestop leta 2024 | agent › R05 | uspešno |
| R06 | Pet števcev z `aria-label="Število rokov <ključ>"`, samo številska vrednost; po izbiri skupine nespremenjeni | agent › R06; D02 (`week` = 2) | uspešno |
| R07 | Vseh šest vrednosti v izbirniku; izbrana skupina v izvornem vrstnem redu; brez zapisov na API | agent › R07; D01, D02, D04 | uspešno |
| R08 | Prazen datum → `role=alert` `Vnesi veljaven referenčni datum.` ob nespremenjenem izračunu; nov veljaven datum odstrani opozorilo in ohrani filter | agent › R08; D03 | uspešno |
| R09 | Za vsako skupino enaki filtrirani ID-ji v preglednici in tabli; datum, besedilo polja in skupina preživijo preklop pogleda | agent › R09 | uspešno |
| R10 | Osvežitev in menjava projekta vrneta `2026-09-21`/`all`; filter ni v URL-ju ne v `localStorage` | agent › R10 | uspešno |
| R11 | Prazen projekt → pet ničel; prazna skupina v nepraznem projektu → `Ni opravil v izbrani skupini.` ob omogočenem izbirniku | agent › R11 (dva testa) | uspešno |
| R12 | Samo GET `/api/`; `saveRequests = 0`; `data-task-id` na vrsticah in karticah; pri 390 px brez prelivanja strani; obstoječi `aria-label="Pregled stanj opravil"` in imena pogledov/stolpcev ohranjeni | agent › R07, R12; D04 `readonly`; baseline desktop+mobile | uspešno |

## Spremenjene datoteke

- `src/dueGroups.ts` — čista koledarska logika skupin (`isCalendarDate`, `addDays`, `dueGroup`, `countDueGroups`, `filterTasks`).
- `src/App.tsx` — stanje referenčnega datuma in skupine, orodna vrstica, pet števcev, filtriranje preglednice in table.
- `src/styles.css` — petstolpčni povzetek, orodna vrstica, odzivne prilagoditve.
- `tests/agent/P08.spec.ts` — lastna preverjanja R01–R12.
- `docs/agent/specification.md`, `docs/agent/verification.md`.

Spremembe specifikacije med izvedbo: zahtev ni bilo treba spreminjati
(zapis v `specification.md` › Spremembe specifikacije).

## Omejitve in nepreverjeni deli

- Končni skriti testi niso dostopni; povezava zahtev z dokazi temelji na
  razvojnih testih P08, izhodiščnih testih in lastnih testih.
- Chromiumov vtičnik `input type=date` ne omogoča tipkanja delno neveljavnih
  nizov; neveljaven vnos je preverjen prek praznega polja (D03, agent R08),
  medtem ko logika `isCalendarDate` pokriva tudi napačne formate.
- V tabeli prazna skupina pokaže sporočilo `Ni opravil v izbrani skupini.`
  namesto prazne tabele; v tabli se pri prazni skupini prav tako pokaže to
  sporočilo (namesto praznih stolpcev), pri popolnoma praznem projektu pa se
  ohrani izhodiščno vedenje (stolpci oz. `V tem projektu še ni opravil`).
- Ročni ogled z `WEB_PORT=5193 API_PORT=3123 npm run dev` ni bil izveden;
  videz in odzivnost sta preverjena strojno v Chromiumu (390 px in namizje),
  brez fizične naprave.
