# P10 naloge

## Setup

- [x] [T001] Izdelaj čiste pripomočke za vrstni red in zgodovino v `src/ordering.ts`, vključno z omejitvijo na 20 razveljavitev.
- [x] [T002] Pripravi lastno testno pomoč s nadzorovanimi GET odgovori in sledenjem zapisovalnim zahtevam v `tests/agent/helpers.ts`.

## Foundational

- [x] [T003] Vključi lokalni vrstni red, obe zgodovini in zgodovinske kontrole v `src/App.tsx`; ohrani obstoječe števce in dostopna imena.
- [x] [T004] Dodaj globalna mesta in gube premika v `src/TaskBoard.tsx`, pri čemer kartice ostanejo v relativnem redu svojega statusnega stolpca.
- [x] [T005] Dopolni obstoječe Folio stile za akcije ob vrsticah/karticah in zgodovinske kontrole v `src/styles.css`.

## User stories in zahteve

- [x] [T006] Napiši lastne Playwright teste za R01–R03 v `tests/agent/P10.spec.ts`: začetni vrstni red, veljavne premike in onemogočene robne akcije.
- [x] [T007] Razširi teste za R04–R08 v `tests/agent/P10.spec.ts`: razveljavitve, ponovitve, brisanje ponovitev, meja 20 in vrnitev na začetni vrstni red.
- [x] [T008] Razširi teste za R09–R12 v `tests/agent/P10.spec.ts`: tabela z globalnim sosedom, ohranjanje stanja pri preklopih in podrobnostih, ponastavitev projekta, števci in prepoved zapisov.

## Verification in polish

- [x] [T009] Zaženi usmerjene P10 teste v `tests/agent/P10.spec.ts` in odpravi ugotovljene napake, ne da bi spremenil skupno testno infrastrukturo.
- [x] [T010] Zaženi `npm run lint`, `npm run build` in `npm run check`; zapiši dejanske izide in morebitne omejitve v dokumentacijo.
- [x] [T011] Posodobi sledljivost R01–R12 z dejanskimi datotekami, testi in izidi v `docs/agent/P10/spec.md`.
- [x] [T012] Opravi končni pregled obsega v `docs/agent/P10/`: preveri dizajn Folio, nespremenjenost API-ja, odvisnosti, skupne teste in omejitve.
