# P10: izvedbene naloge

Naloge sledijo [specifikaciji](spec.md) in [načrtu](plan.md). Vrstni red določa odvisnosti; nove aplikacijske in testne datoteke ostanejo v dovoljenih mapah.

## Setup

- [ ] [T001] V `tests/agent/P10.spec.ts` pripravi P10 Playwright datoteko in začetne sprejemne primere za prejeti vrstni red, ID-je z enakimi naslovi ter robna dejanja (R01–R03); obstoječe pripomočke iz `tests/development/helpers.ts` samo uporabi, ne spreminjaj.

## Foundational

- [ ] [T002] V `src/taskOrder.ts` uvedi čiste tipizirane prehode stanja za nalaganje izvorne permutacije, premik soseda, razveljavitev, ponovitev in vrnitev na začetek; uveljavi invariant ID-jev, ničelne robne učinke, čiščenje ponovitev in omejitev 20 (R02–R08).

## User stories

- [ ] [T003] V `src/App.tsx` poveži stanje z naloženim projektom ter prikaži vrstni red po ID-ju in globalna mesta v preglednici; dodaj gumba za premik ob vrstici, z onemogočenima robnima smerema, zunaj povezave opravila (R01–R03).
- [ ] [T004] V `src/App.tsx` dodaj kontrole Razveljavi premik, Ponovi premik in Začetni vrstni red ter status s točnim besedilom in števci iz zgodovin; uskladi onemogočenost, vejo ponovitve, ponastavitev in večkratne razveljavitve/ponovitve (R04–R08, R11).
- [ ] [T005] V `src/TaskBoard.tsx` prikaži globalna mesta in premike ob karticah, pri čemer se sosedstvo določi po globalnem seznamu, stolpci stanj ostanejo fiksni, vrstni red kartic pa stabilen; dejanja naj bodo zunaj povezave (R09).
- [ ] [T006] V `src/App.tsx` in `src/TaskBoard.tsx` ohrani isto množico ID-jev in nespremenjena opravila, števce stanj, podrobnosti ter obstoječa dostopna imena; zagotovi ohranitev lokalnega stanja ob menjavi pogleda/podrobnosti in ponastavitev ob menjavi projekta ali osvežitvi (R10, R12).

## Polish

- [ ] [T007] V `src/styles.css` vključi nove kontrole v potrjeni Folio videz, ohrani vidni fokus in preveri, da pri širini 390 px drsita le preglednica ali tabla, ne cela stran (R12).
- [ ] [T008] Dopolni `tests/agent/P10.spec.ts` s scenariji za razveljavitev/ponovitev in kapaciteto 20, novo vejo, ponastavitev, oba pogleda, podrobnosti/projekte/osvežitev, prazne/enojne sezname, dostopnost, nespremenjena polja in odsotnost API zapisov (R04–R12); nato izvedi `npm run check` ter v `docs/agent/P10/spec.md` zapiši povezave R01–R12 do kode, testov, dejanskih rezultatov in nepreverjenih omejitev.
