# Naloge izvedbe P09

## Priprava

- [ ] [T001] Dodaj agentne Playwright scenarije v `tests/agent/P09.spec.ts`; za nadzorovane GET odzive ponovno uporabi `tests/development/helpers.ts` brez spreminjanja skupnih testov ali helperja. Pokrij poljubne ID-je, enake naslove, Unicode in prazne podatke.

## Osnovne zmogljivosti

- [ ] [T002] Razširi razčlenitev hash poti in pripomočke URL v `src/navigation.ts` za privzete filtre/pogled, prvo ponovljeno vrednost, neveljavne in neznane parametre ter serializacijo brez prepisa ob samem branju (R01, R04, R06); dodaj ustrezne scenarije v `tests/agent/P09.spec.ts`.
- [ ] [T003] Dodaj čist pripomoček za normalizacijo, dobesedno iskanje po štirih poljih, kombiniranje statusa po IN in stabilno razvrščanje v `src/taskView.ts`; preveri NFD, odstranjevanje U+0300–U+036F, UTF-16 in vrstni red izenačenih naslovov v `tests/agent/P09.spec.ts` (R02–R03).

## Uporabniške zgodbe — potrdi in uredi pogled

- [ ] [T004] V `src/App.tsx` poveži kontrole za osnutek, **Uporabi pogled**, kanonični URL in **Ponastavi pogled**; prikaži isti filtrirani seznam v obeh pogledih ter zahtevani prazen rezultat in števec (R05–R06, R11). Pokrij, da osnutek ne spremeni rezultatov pred potrditvijo in enaka potrditev ne doda zgodovine, v `tests/agent/P09.spec.ts`.

## Uporabniške zgodbe — navigacija in zgodovina

- [ ] [T005] Ohranitev potrjenih parametrov ter zavrženje osnutka poveži s preklopom pogleda, Nazaj/Naprej, osvežitvijo, podrobnostmi in menjavo projekta v `src/App.tsx`, `src/TaskBoard.tsx` in `src/TaskDetails.tsx` (R07–R10); v `tests/agent/P09.spec.ts` preveri ID-je pri enakih naslovih ter projektni privzeti pogled.

## Dodelava in preverjanje

- [ ] [T006] Dopolni `src/styles.css` in povezane dele `src/App.tsx`, da ohranijo odobreni Folio, zahtevana dostopna imena, `data-task-id`, obstoječa stanja nalaganja/napak/neznane poti in širino 390 px brez širjenja strani; v `tests/agent/P09.spec.ts` preveri odzivnost ter da ni zapisov API in `localStorage` (R12).
- [ ] [T007] Izvedi `npm run lint`, `npm run build` in `npm test`; v `docs/agent/P09/spec.md` dopolni sledljivost R01–R12 z dejanskimi datotekami, scenariji, izidi in dokazili ter zapiši nepreverjene zahteve.
