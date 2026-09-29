# Izvedbene naloge P07

Podlaga: [specifikacija in scenariji S01–S12](spec.md), [načrt](plan.md), [izvirne zahteve](../../../task/instructions.md). Datum: 2026-09-25. Vse naloge so ob pripravi neizvedene. Izvaja jih isti agent zaporedno, brez delegiranja; vsaka naslednja naloga temelji na prejšnjih. Oznako dokončanja posodobi po dejanski izvedbi.

## Priprava

- [x] T001 Preveri dovoljeni obseg in izhodišče v `src/App.tsx`, `src/TaskBoard.tsx`, `src/styles.css` ter obstoječo konfiguracijo/testne pomočnike samo preberi; pripravi `docs/agent/verification.md` za sprotna dokazila in omejitve brez trditev o neizvedenih testih. Preveri čas z `node task/time-budget.mjs`.

## Temelji

- [x] T002 Dodaj `src/useFavorites.ts`: validacijo `D`, leno branje brez zapisovanja, `Set<string>`, kanoničen zapis ključa `folio:favorites:v1`, preklop in odstranitev podane množice ID-jev, poslušalec `storage` brez odmeva ter pomnilniško delovanje ob izjemah z opozorilnim stanjem. Neznane ID-je ohrani; zapisuj samo ob uporabniških spremembah, zunaj React posodobitvenih funkcij. Pokrije R02–R04, R08–R09, R11–R12.

## Uporabniška zgodba 1 — označevanje in trajnost

- [x] T003 Dodaj `src/FavoriteButton.tsx` in poveži hook v `src/App.tsx`: točno dostopno ime po ID-ju, `aria-pressed`, dekorativna ikona, gumb ob povezavi vsake vrstice; globalna množica ostane v `App`, napaka shrambe se prikaže z `role=alert` in besedo `shramba`. Opravila in API ostanejo nespremenjeni. Pokrije R01–R04, R08, R11–R12.

## Uporabniška zgodba 2 — filtriranje in upravljanje projekta

- [x] T004 V `src/App.tsx` dodaj lokalni filter `ProjectView`, stabilni `visibleTasks`, checkbox, projektno odstranitev iz vseh ID-jev projekta, onemogočenost gumba, status `Priljubljeno: X od M.` in prazno sporočilo. Ohranita se projektni ključ za ponastavitev filtra in globalna množica; kontrole ostanejo dosegljive pri praznem rezultatu/projektu. Pokrije R05–R10.

## Uporabniška zgodba 3 — enakovredna tabla in Folio

- [x] T005 Dopolni `src/TaskBoard.tsx` in `src/App.tsx` za isti izbor in filter v obeh pogledih, gumb zunaj povezave kartice, vidne stolpčne števce in prazno filtrirano tablo z vsemi stolpci. V `src/styles.css` dodaj minimalne sloge za nove kontrole in kartični gumb: Folio spremenljivke, vidni fokus, prelom pri ozkem prikazu, brez prekrivanja. Ohranijo se `data-task-id`, oznake pogledov/stolpcev, povzetek stanj in podrobnosti po ID-ju. Pokrije R01, R05–R07, R10, R12.

## Preverjanje in zaključek

- [x] T006 V `tests/agent/P07.spec.ts` dodaj vedenjske teste shrambe S02–S04/S08–S11: kanoničen UTF-16 zapis, podvojeni/neznani ID-ji, obnova, vse kategorije neveljavnih vhodov brez začetnega prepisovanja, menjava projekta in odstranitev samo njegovih ID-jev, pravi/drugi ključ in `null`, odsotnost povratnega zapisa, ločeni izjemi branja/zapisa z nadaljnjo uporabo. Uporabi obstoječi testni pomočnik samo v testih.

- [x] T007 V `tests/agent/P07.spec.ts` dodaj vedenjske teste S01/S05–S10/S12 za neodvisne enake naslove, vrstni red, nič/eno/več kot deset opravil, prazne projekte, skupno stanje pogledov, odstranitev zadnjega priljubljenega, pravilne podrobnosti in števce. Preveri nespremenjena polja opravil in odsotnost zapisov na API. Za oba pogleda pri 390 px preveri širino dokumenta, uporabnost kontrol in shrani posnetke v `docs/agent/P07/` za vizualni pregled.

- [x] T008 Izvedi `npm run lint`, `npm run build` in `npm test` z nespremenjeno konfiguracijo; dnevnike shrani v `docs/agent/P07/`. Preglej tudi posnetke Folio iz T007. Ugotovljene napake popravi samo v dovoljenih `src/` oziroma `tests/agent/`, ponovi relevantna preverjanja in v `docs/agent/verification.md` zabeleži dejanske ukaze, izide ter določljiva dokazila. Pokrije R01–R12 in skupne regresije; nedostopnih končnih testov ne označi kot uspešnih.

- [x] T009 Dopolni vseh dvanajst vrstic sledljivosti v `docs/agent/P07/spec.md` s konkretnimi deli kode, imeni izvedenih testov in povezavami na dokaze iz `docs/agent/verification.md`; ohrani zgodovino specifikacije. Posodobi ta `docs/agent/P07/tasks.md`, navedi neizvedene scenarije/omejitve in pripravi kratko predajo. Zadnjo minuto skupnega roka nameni predaji.
