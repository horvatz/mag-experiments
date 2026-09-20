# P01 — Zapis izvedbe in preverjanj

2026-09-20. Viri: [izvirne zahteve](../../task/instructions.md), [specifikacija](P01/spec.md), [načrt](P01/plan.md), [naloge](P01/tasks.md). Merilo ostaja vseh R01–R10 in dogovor o vmesniku.

## Potek

- T001: pregledani viri in meje dovoljenih sprememb; čas preverjen z `node task/time-budget.mjs`. Zapis je po izrecnem navodilu implementacije v `docs/agent/verification.md` (popravek načrtovane poti, brez podvajanja).
- Načrtovano: `npm run check` (lint, tipi, build, 38 osnovnih, 8 razvojnih in lastni testi) ter ogled obrazca pri ozki širini. Stanje: neizvedeno.

## Omejitve

Nedostopni končni testi niso izvedeni. Ob začetku izvedbe ni bilo potrjenih testnih rezultatov; končni rezultati so spodaj. Spremembe so omejene na dovoljeno aplikacijsko kodo, lastne teste in dokumentacijo; strežnik, skupni testi in infrastruktura ostajajo nespremenjeni.

- T002–T005: implementirani normalizacija, ločen osnutek, validacija/preklic, shranjevanje z zaklepom, uskladitev potrjenih podatkov in slogi Folio. Testi še niso izvedeni. Za dokumentne posodobitve uporabljen Node; sistemski Python ni na voljo zaradi manjkajočih CommandLineTools, brez vpliva na aplikacijo.

- `npm run typecheck`: uspešno (izhod 0) po implementaciji. T006–T007: dodanih 14 agentnih primerov za S1–S7; izvajanje celotnega preverjanja sledi.

- Prvi `npm run check`: lint uspešen, typecheck ustavljen zaradi razširjenega tipa `status` v agentnem testu (TS2345); testi se niso zagnali. Dokaz: [check-initial.log](P01/check-initial.log). Popravljeno z eksplicitnim `Task[]` v pričakovanem posnetku; sledi ponovitev.

## Končni rezultati

- `npm run check`: **uspešno, izhod 0**. Lint, TypeScript in produkcijska gradnja uspešni; **60/60 testov** v 25,0 s: 38 osnovnih, 8 razvojnih P01 in 14 lastnih. Dokaz: [celoten dnevnik](P01/check.log). Začetna tipska napaka je opisana zgoraj in odpravljena; aplikacijski testi niso odpovedali.
- A07 je zajel [mobilni obrazec pri 390 × 844](P01/mobile-edit.png). Posnetek je bil tudi vizualno pregledan: oznake, polji, oba gumba in podatki opravila so berljivi, kontrole ne segajo iz zaslona; ohranjeni so sistemska pisava, nevtralne površine in moder glavni gumb Folio.
- Pregled kode: shranjevanje uporablja samo obstoječi `updateTask` in javni `/api/`; ni uporabe testnih kontrol v `src/`, novih odvisnosti ali sprememb infrastrukture. `TaskBoard` ter izračuni števcev še naprej uporabljajo potrjen seznam.

## Sledljivost

Pravila in simboli so v [specifikaciji](P01/spec.md#zahteve-in-pravila). Vsi spodnji izidi se nanašajo na dejansko izvedene navedene scenarije, ne na nedostopne končne teste. Agentni testi so v [P01.spec.ts](../../tests/agent/P01.spec.ts); D01–D04 so nespremenjeni skupni razvojni testi. Dokaz vseh testnih izidov je [check.log](P01/check.log).

| Zahteva | Pogoj | Test ali scenarij | Datoteka in del kode | Izid ter dokaz |
| --- | --- | --- | --- | --- |
| R01 | Pravilna identiteta in predizpolnitev | S1/S5; D01, A02, A04, A05 | [TaskDetails](../../src/TaskDetails.tsx): `beginEdit`, `task.id`; `App` uporablja `key={taskId}` | Uspešno; odpiranje enakih naslovov po ID in shranjenih stanj, dnevnik D01/A02/A04/A05. |
| R02 | Osnutek ne spreminja potrjenih podatkov | S2/S6; A02, A05, D03 | [TaskDetails](../../src/TaskDetails.tsx): `draft`, `save`; [App](../../src/App.tsx): `onSaved` | Uspešno v preglednici in tabli, vključno z zadržano zahtevo in števci. |
| R03 | Natančni robni znaki, brez praznih zapisov, umik napake | S3; A01, A02, A03, D04 | [taskEditing](../../src/taskEditing.ts): `normalizeTitle`; `TaskDetails`: `save`, `onChange`, `aria-describedby` | Uspešno za prazno, TAB/CR/LF/presledek, notranje znake in NBSP; preverjen tudi dejanski payload. |
| R04 | Vsa tri stanja in vsi prehodi | S4; šest primerov A04 | [TaskDetails](../../src/TaskDetails.tsx): `select#task-status`, `save` | Uspešno vseh šest usmerjenih prehodov; A03 tudi nespremenjeno stanje ob spremembi naslova. |
| R05 | Skupni zapis, uskladitev in trajnost | S4; D02, A04, A05 | `TaskDetails.save`; [useResource](../../src/useResource.ts): `updateData`; `App.onSaved`, obstoječi [TaskBoard](../../src/TaskBoard.tsx) | Uspešno: podrobnosti, vrstica, stolpec, števci, ponoven prikaz po osvežitvi in API. |
| R06 | Preklic brez zapisa in brez stare napake | S2/S3; D03, A02, A06 | `TaskDetails.finishEdit`, `beginEdit`, gumb »Prekliči« | Uspešno po osnutku, validacijski in strežniški napaki; število zahtev ostane pričakovano. |
| R07 | Druga opravila in neurejena polja ostanejo enaka | S5; A04, A05 | `TaskDetails.save` pošlje samo `title/status`; [api](../../src/api.ts): `updateTask`; `App.onSaved` primerja `id` | Uspešno: celoten posnetek vseh šestih opravil v obeh projektih, vključno z enakimi naslovi. |
| R08 | Zavrnitev ohrani vnos in podatke, ponovitev uspe | S6; A05 v obeh pogledih, A06 | `TaskDetails.save`: `catch/finally`, `saveError`, `finishEdit` | Uspešno: zavrnitev brez zapisa, ohranjen surov vnos in stanje, ponovni uspeh odstrani napako. |
| R09 | Zaklep kontrol in največ ena sočasna zahteva | S6; A05 v obeh pogledih | `TaskDetails`: `saveLock`, `saving`, `disabled`, `role="status"` | Uspešno: pet hitrih oddaj sproži eno zahtevo, štiri kontrole onemogočene; po zavrnitvi omogočene. |
| R10 | Navigacija in svež naslednji obrazec | S7; A04, A05, A06, osnovni testi, A07 | `TaskDetails.finishEdit/beginEdit`; [App](../../src/App.tsx): identiteta komponent; obstoječa navigacija | Uspešno po uspehu in preklicu: oba pogleda, drug projekt in drugo opravilo brez prenosa vnosa/napake. |

## Zaključek in omejitve

T001–T009 so opravljene. Zapis preverjanj je na poti, zahtevani v koraku implementacije; specifikacija povezuje to matriko, da dokazov ne podvaja. Merila R01–R10 ostajajo nespremenjena.

Ni znane neizpolnjene obvezne zahteve. Nedostopni končni testi niso bili izvedeni; uspeh navedenih preverjanj ni trditev o vseh možnih podatkih in zaporedjih. Sočasno urejanje drugih uporabnikov, navigacija med odprtim urejanjem in druga izrecno izključena dejanja niso razširjena v nove zahteve. Vizualni pregled je bil opravljen na navedenem mobilnem posnetku; namizni in mobilni funkcionalni testi so uspešni.
