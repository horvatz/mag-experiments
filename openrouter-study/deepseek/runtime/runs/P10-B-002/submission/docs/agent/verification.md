# Poročilo implementerja (P10-B-002)

Vloga: implementer. Predana specifikacija: docs/agent/specification.md (v1.0).
Obseg: R01–R12 iz task/instructions.md. Spremenjeni so le `src/`,
`tests/agent/p10-order.spec.ts` in ta dokument.

## Izvedene spremembe

- `src/orderHistory.ts` (nov): čiste prehodne funkcije stanja vrstnega reda –
  `initialOrder`, `moveTask` (globalni sosed, `redo = []`), `undoMove`,
  `redoMove`, `resetOrder`; `capUndo` hrani največ 20 prejšnjih permutacij.
- `src/App.tsx` (`ProjectView`): lokalno stanje `(P, U, R)` za trenutni
  projekt; ob nalaganju/napaki/retryju se stanje ponastavi na prejeto polje;
  orodna vrstica z gumbi `Razveljavi premik`, `Ponovi premik`,
  `Začetni vrstni red` in elementom `role=status`
  `aria-label="Zgodovina vrstnega reda"`; v preglednici stolpec s
  `Premakni <id> gor/dol` in `aria-label="Mesto opravila <id>"`.
- `src/TaskBoard.tsx`: kartice prikazujejo globalno mesto, gumba za premik
  uporabljata globalnega soseda in ne spreminjata statusa; stolpci ostajajo
  `Pripravljeno`, `V delu`, `Končano`.
- `src/styles.css`: slog orodne vrstice, značk mesta in gumbov za premik;
  brez sprememb obstoječih gradnikov in barv Folio.
- `tests/agent/p10-order.spec.ts` (nov): 6 lastnih testov za R01–R12.

## Izvedena preverjanja

| # | Ukaz | Rezultat |
| --- | --- | --- |
| V01 | `npm run lint`, `npm run typecheck` | uspešno (brez izpisa napak) |
| V02 | `npx playwright test --project=development-desktop --project=development-mobile` | 8/8 uspešno (D01–D04 ×2) |
| V03 | `npx playwright test --project=desktop --project=mobile --project=api` | 38/38 uspešno |
| V04 | `npx playwright test --project=agent` | 6/6 uspešno |
| V05 | `npm run check` (lint + build + vsi testi) | 52/52 uspešno, gradnja uspešna |

Zadnji dokaz je izpis `npm run check`: `52 passed (23.6s)`; vključuje
38 osnovnih/API, 8 razvojnih P10 in 6 lastnih testov. Vsi testi so bili
izvedeni dejansko; nič ni označeno kot uspešno brez zagona.

## Sledljivost zahtev

| Zahteva | Pogoj | Test/dejstvo | Koda |
| --- | --- | --- | --- |
| R01 | začetni `P = P0`, mesta 1..n, enaki naslovi ločeni | lastni R01/R11 + D01; enaka naslova `web-02`/`web-03` z različnima mestoma | App.tsx, TaskBoard.tsx |
| R02 | zamenjava globalnega soseda, polja/status nespremenjeni | lastni R02/R03/R12 + D01; preverjeni status, oseba, vsota 4/2/2 | App.tsx, TaskBoard.tsx |
| R03 | robova onemogočena, brez vpisa v zgodovino | lastni R02/R03/R12 (web-02 gor, web-08 dol onemogočena, zgodovina 2/0) + D01 | App.tsx |
| R04 | `U.push(P)`, `R = []` ob premiku, undo obnovi | lastni R04/R05/R06 + D02 (zaporedje 2/0 → 1/1 → 0/2) | App.tsx, orderHistory.ts |
| R05 | redo obnovi in doda v `U`, več ciklov brez izgub | lastni R04/R05/R06 (več undo/redo, `expectIds` polna permutacija) + D02 | App.tsx, orderHistory.ts |
| R06 | nov premik zavrže `R`, robni ne | lastni R04/R05/R06 (po undo nov premik → Ponovi onemogočen, 1/0) + D03 | orderHistory.ts |
| R07 | največ 20 v `U`, 21. premik zavrže najstarejšo | lastni R07: 21 premikov → 20/0; po 20 razveljavitvah 0/20 in vrstni red po 1. premiku | orderHistory.ts |
| R08 | reset kot eno novo dejanje, sicer onemogočen | lastni R08/R09/R10 (reset → 4/0, nato undo vrne prejšnji red) + D04 | App.tsx, orderHistory.ts |
| R09 | tabla: globalni sosed, relativni red v stolpcih, statusi | lastni R08/R09/R10: `web-04 gor` zamenja `web-01` (globalno), stolpca nespremenjena + D04 | TaskBoard.tsx |
| R10 | pogled/podrobnosti ohranijo stanje; projekt/osvežitev resetirata | lastni R08/R09/R10 (tabla ↔ preglednica, dialog, menjava projekta, `reload`) | App.tsx |
| R11 | točno besedilo števca, usklajena gumba, n=0 in n=1 | lastni R01/R11 (prazen in enojni projekt: 0/0, gumbi onemogočeni) + R11/R12 + D03 | App.tsx |
| R12 | lokalne permutacije, brez zapisov, polja/števci, 390 px | lastni R02/R03/R12 in R11/R12: `readonly` (0 zapisov, `saveRequests = 0`), 390 px `scrollWidth <= innerWidth` + D04 | App.tsx, TaskBoard.tsx, styles.css |

Invariante iz specifikacije (I1–I5) so preverjene posredno: vsak lastni test
primerja celotno permutacijo ID-jev, D03/D04 in `readonly` potrjujejo nič
zapisov, testi R02/R09 pa nespremenjena polja in statuse.

## Omejitve in opombe

- Končni (skriti) testi niso dostopni; preverjeno je z razvojnimi D01–D04 in
  lastnimi testi. Zunanji javni internet je blokiran; aplikacija ne uporablja
  zunanjih virov. Brskalnik se poveže prek `wsEndpoint` iz
  `task/browser.json` (konfiguracija Playwright), `chromium.launch()` ni
  uporabljen. Strežnik teče na 5174/3102 iz `playwright.config.ts`.
- Napake specifikacije med implementacijo niso bile najdene; edina
  pojasnitev: `Začetni vrstni red` doda eno dejanje v `U` in ne počisti
  prejšnjih razveljavitev (R08 tega ne zahteva), zato števec po resetu
  naraste (npr. 3 → 4), gumb pa je ob izvornem redu onemogočen.
- Neveljavnega roba ni mogoče klikniti (gumbi so onemogočeni); funkcije
  `moveTask`/`undoMove`/`redoMove` ob neveljavnem klicu vrnejo isto stanje,
  zato tudi programski klic ne doda zgodovine (R03/R06).
- Vrstni red je lokalno stanje komponente; ob menjavi projekta
  (`key={project.id}`) ali osvežitvi se ponovno vzpostavi iz API-ja.
  `localStorage`/URL stanje se ne uporabljata, novih zapisovalnih klicev ni.

## Predaja pregledovalcu

Implementacija je zaključena, `npm run check` je zelen (52/52). Za pregled so
ključni `src/orderHistory.ts`, `src/App.tsx` (`ProjectView`),
`src/TaskBoard.tsx` in `tests/agent/p10-order.spec.ts`.
