# P10 — izvedbene naloge

## Setup

- [x] [T001] V tests/agent/P10.spec.ts pripravi Playwright sprejemni testni okvir z obstoječim helperjem za nadzorovane GET odgovore; najprej preveri začetni vrstni red po ID-jih, podvojene naslove in globalna mesta (R01). Skupnega helperja ne spreminjaj.

## Foundational

- [x] [T002] V src/taskOrder.ts dodaj tip stanja in čiste prehode za sosednji premik, razveljavitev, ponovitev in začetni vrstni red; zagotovi invariant permutacije ID-jev, no-op na robovih, omejitev U na 20 ter izpraznitev R samo po veljavnem novem dejanju (R02–R08).

## User stories

- [x] [T003] V src/App.tsx inicializiraj model, ko so opravila projekta naložena, in iz ID-jev izpelji prikazani seznam brez mutiranja Task objektov; ohrani stanje ob menjavi pogleda/podrobnosti, ponastavi ob menjavi projekta in osvežitvi (R01, R02, R10, R12).
- [x] [T004] V preglednici v src/App.tsx prikaži globalno mesto po ID-ju in dodaj gumba Premakni <id> gor/dol zunaj povezave opravila; robni gumb onemogoči in ohrani data-task-id (R01–R03).
- [x] [T005] V src/TaskBoard.tsx prikaži filtriran relativni vrstni red z globalnimi mesti in enakima kontrolama; premik naj uporabi globalnega soseda brez spremembe statusa, ob ohranitvi stolpcev in dostopnih imen (R02, R09, R12).
- [x] [T006] V kontrolni skupini v src/App.tsx dodaj Razveljavi premik, Ponovi premik, Začetni vrstni red in števec z zahtevanim role, aria-label, besedilom ter onemogočanjem glede na U/R in začetni vrstni red (R04–R08, R11).

## Polish in preverjanje

- [x] [T007] V src/styles.css oblikuj nove kontrole z obstoječimi Folio slogi; ohrani viden fokus ter preveri, da pri 390 px stran nima vodoravnega preliva, drsenje pa ostane znotraj preglednice/table (R12).
- [ ] [T008] Razširi tests/agent/P10.spec.ts za razveljavitve/ponovitve in mejo 20, reset/no-op, globalnega soseda na tabli, navigacijo/podrobnosti/projekte/osvežitev, prazen/enojni in večji seznam, nespremenjena polja/statusne števce/podrobnosti ter nič API zapisov (R02–R12).
- [x] [T009] Zaženi npm run check (lint, build, regresijske, razvojne in agentne teste); za R01–R12 zapiši dejanske teste, rezultate, povezave na kodo in omejitve v docs/agent/P10/spec.md. Ne označi neizvedenih končnih testov kot uspešnih.
