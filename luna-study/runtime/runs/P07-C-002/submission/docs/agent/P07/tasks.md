# Naloge izvedbe P07

## Priprava

- [ ] [T001] V `tests/agent/favorites.spec.ts` pripravi Playwright testne podatke z nadzorovanimi odgovori javnega `/api/` in beleženjem zapisovalnih zahtev; ne spreminjaj testne infrastrukture ali skupnih testov.

## Osnova

- [ ] [T002] V `src/useFavorites.ts` dodaj globalno stanje priljubljenih: validacijo ključa in oblike `{version:1,ids:[...]}`, združevanje nizov, ohranitev neznanih ID-jev, UTF-16 razvrščen zapis brez polj opravil ter varno začetno branje brez prepisa neveljavnih podatkov (R02–R04).

## Uporabniške zgodbe po vrstnem redu

- [ ] [T003] V `src/App.tsx` poveži `useFavorites` nad projektno označenim `ProjectView`; dodaj checkbox s privzetim `false`, projektni filter v izvornem vrstnem redu, status `role="status"` z `aria-label="Število priljubljenih"` in besedilom `Priljubljeno: X od M.`, ter gumb za odstranitev samo ID-jev trenutnega projekta, onemogočen kadar ni priljubljenih. Menjava projekta naj filter ponastavi, globalna množica pa ostane (R05, R08–R10).
- [ ] [T004] V `src/App.tsx` dodaj v preglednico za vsako opravilo ločen gumb `Priljubljeno opravilo <id>` z `aria-pressed`, zunaj povezave; naj preklaplja samo ID in ohrani navigacijo po ID-ju. Uporabi isti seznam vidnih opravil za prazno stanje aktivnega filtra `Ni priljubljenih opravil.` (R01, R05–R07).
- [ ] [T005] V `src/TaskBoard.tsx` dodaj enaka dejanja ob karticah zunaj povezav; uporabi isti filter in priljubljeno množico kot preglednica, prazno stanje ob aktivnem filtru ter števce stolpcev iz vidnih opravil. Ohraniti `data-task-id`, dostopna imena stolpcev in preglednice ter `aria-label="Pregled stanj opravil"` (R01, R06–R07, R10).
- [ ] [T006] V `src/App.tsx` in `src/useFavorites.ts` uskladi `storage` dogodke: pravi ključ sprejmi po enakih pravilih validacije, `null` izprazni množico, drug ključ ignoriraj in ne zapisuj nazaj. Ob izjemi pri branju ali pisanju ohrani uporabo v pomnilniku in prikaži opozorilo `role="alert"` z besedo `shramba` (R11).

## Dopolnitev in preverjanje

- [ ] [T007] V `src/styles.css` oblikuj nove kontrole, status, prazno stanje in opozorilo z obstoječimi Folio slogi; pri 390 px ohrani širino strani, vidni fokus in dovoljeno notranje drsenje preglednice/table (R12).
- [ ] [T008] V `tests/agent/favorites.spec.ts` dodaj brskalniške scenarije za R01–R12: enake naslove in podvojene shranjene ID-je, zapis in obnovo, vse neveljavne oblike brez prepisa, neznane ID-je, filter in prazno stanje v obeh pogledih, menjavo projekta/pogleda, projektno brisanje, števce, `storage` dogodke in izjeme, brez zapisov na API ali sprememb polj opravil ter prikaz pri 390 px.
- [ ] [T009] Zaženi `npx playwright test tests/agent/favorites.spec.ts` in `npm run check` (lint, build, skupne API in brskalniške regresije); odpravi napake samo v dovoljenih datotekah in posreduj dejanske rezultate za dokumentacijo. Ne označi neizvedenih preverjanj kot uspešnih.
- [ ] [T010] V `docs/agent/P07/spec.md` posodobi sledljivost R01–R12 z dejanskimi testi, končnimi mesti kode, izidi in omejitvami; skupnih testov, nastavitev, strežnika, odvisnosti in specifikacijskih predlog ne spreminjaj.
