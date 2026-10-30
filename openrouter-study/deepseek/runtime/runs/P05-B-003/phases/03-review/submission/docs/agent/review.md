# Pregled — P05 (reviewer)

Neodvisno preverjanje R01–R12: statična analiza `src/App.tsx`, `src/pagination.ts`,
`src/TaskBoard.tsx`, `src/styles.css`, `tests/agent/pagination.spec.ts`,
`tests/development/P05.spec.ts`, `docs/agent/specification.md` in `verification.md`,
ter ponovni zagon celotnega preverjanja.

## Dokaz

- `npm run check` (lint + typecheck + build + vsi testi): izhod 0, **57 uspešnih**
  (38 osnovnih, 8 razvojnih P05, 11 agentnih), 21,8 s. Ujema se z navedbami v
  `verification.md`.
- `src/` ne uporablja `/__test/`, `localStorage`/`sessionStorage`, ne piše stanja v URL;
  `updateTask` (PATCH) je obstoječa neuporabljena priprava izhodišča.

## Po zahtevah

- R01–R02: privzeto all/all/P=1; `filterTasks` → `pageCount`/`pageSlice` dajo zaporedne,
  neprekrivajoče odseke 2/5/10; dokaz V3, V4, V4b, V5, D01–D02, D04.
- R03–R04: meje `page<=1` / `page>=pages` (tudi Y=0 → vsi štirje onemogočeni);
  `changeSize` vedno P=1; dokaz V3, V4, V4c, V5, D04.
- R05–R06: filter pred straničenjem, `changeFilter` → P=1, vrstni red ohranjen;
  oba pogleda dobita isti odsek, tabla ga združi po stolpcih; dokaz V6, V7, V10, D03.
- R07–R08: `ProjectView` je vezan na `project.id` (ne na view/taskId), zato preklop
  pogleda in podrobnosti ohranita stanje, menjava projekta/osi vežitev pa ponastavita
  na all/all/1; stanje je le v `useState`; dokaz V7, V8, V4b.
- R09–R10: `pageStatus` vrača natančno besedilo z `–`; N=0 → `Stran 0 od 0. Prikazano 0–0 od 0.`;
  dokaz V3–V6, V9, V9b, V4b, D02.
- R11: pregled stanj šteje nefiltrirani T, stolpci table odsek, značka `tasks.length`;
  dokaz V10/V11.
- R12: `writes=[]` in `saveRequests=0`, baseline desktop+mobile, povezave/podrobnosti/
  nalaganje napake, 390 px brez prelivanja; dokaz V3, V10/V11, baseline 1–38.

## Ugotovitve

Konkretnih napak glede zahtev R01–R12 nisem našel. Obe zastavici sta `false`, `findings` je prazen.

Omejitve: skriti končni testi niso dostopni; vizualni pregled je posreden (avtomatski testi,
390 px), preverjanje le v Chromiumu; nalaganje/sočasne spremembe podatkov so izven obsega.
