# P09 — Naloge izvedbe

Vir: `spec.md`, `plan.md`, `.specify/memory/constitution.md`. Naloge so majhne, odvisnostno urejene in preverljive; izvajajo se po vrsti.

## Faza 1: Temelj

- [x] T001 V `src/viewState.ts` dodaj normalizacijo P(x) (obrez belin, NFD, odstranitev U+0300–U+036F, male črke) in tipe stanja (R02, R03).
- [x] T002 V `src/viewState.ts` dodaj `parseViewState` (prva pojava parametra, neznane vrednosti → privzete, neznani parametri se ignorirajo) in `buildHash` (privzeti izpuščeni, URL-kodiranje, `view=board` ohranjen, neznani odstranjeni) (R01, R04, R06).
- [x] T003 V `src/viewState.ts` dodaj `matches`, `compareTasks` (stabilno po P v UTF-16) in `sameState` (R02, R03, R05, R11).
- [x] T004 V `src/navigation.ts` razširi `useRoute` na S in dodaj S v `projectUrl`/`taskUrl` (ohranitev parametrov v povezavah) (R07, R09).

## Faza 2: Uporabniška zgodba 1 — stanje iz URL-ja (P1)

- [x] T005 V `src/App.tsx` beri S iz `useRoute`, filtriraj in uredi opravila; privzete vrednosti in neznani parametri ne vplivajo, URL se ne prepiše sam (R01–R04).

## Faza 3: Uporabniška zgodba 2 — osnutek, potrditev, ponastavitev (P1)

- [x] T006 V `src/App.tsx` dodaj kontrole (search "Iskanje v povezavi", selecta "Stanje v povezavi" in "Vrstni red v povezavi") z lokalnim osnutkom (R05).
- [x] T007 V `src/styles.css` dodaj slog kontrol v okviru Folio, brez sprememb obstoječega videza.
- [x] T008 V `src/App.tsx` dodaj "Uporabi pogled" in "Ponastavi pogled": ciljni hash, natanko eno novo zgodovinsko stanje le ob spremembi, brez podvajanja (R05, R06, R11).
- [x] T009 V `src/App.tsx` dodaj števec (`role=status`, `aria-label="Rezultati povezave"`, "Prikazano: N od M.") in "Ni zadetkov." ob praznem rezultatu (R11).

## Faza 4: Uporabniška zgodba 3 — zgodovina in navigacija (P2)

- [x] T010 Ob spremembi poti ponastavi osnutek na S (Nazaj/Naprej, osvežitev, vse navigacije) (R07, R08).
- [x] T011 Preklop Preglednica/Tabla ohrani S; klik na drug projekt začne privzeto stanje in ohrani table/board (R08, R10).
- [x] T012 V `src/TaskBoard.tsx` in `src/TaskDetails.tsx` prenesi S za povezave in zapiranje podrobnosti (R09).

## Faza 5: Preverjanje

- [x] T013 V `tests/agent/helpers.ts` in `tests/agent/p09.spec.ts` zapiši lastne teste za R01–R12 (neposredna povezava, osnutek, potrditev, zgodovina, ponastavitev, enaki naslovi, ozek zaslon, brez zapisov, brez localStorage).
- [x] T014 Zaženi `npx playwright test --project=agent` in zabeleži dejanski rezultat.
- [x] T015 Zaženi skupne teste `npx playwright test --project=api --project=desktop --project=mobile` in zabeleži dejanski rezultat.
- [x] T016 V `docs/agent/P09/spec.md` izpolni sledljivost R01–R12 z datotekami, testi in izidi; neizvedeno izrecno navedi.

## Faza 6: Zaključek

- [x] T017 Preveri omejitve (samo `src/`, `tests/agent/`, `docs/agent/`; strežnik, odvisnosti in skupni tipi nespremenjeni; Folio ohranjen) in pripravi končno poročilo.
