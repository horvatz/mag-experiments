# Preverjanje P07

2026-09-25. Implementacija R01–R12 je dokončana; vsa razpoložljiva izvedena preverjanja so uspešna. Podlaga: [specifikacija](P07/spec.md), [načrt](P07/plan.md), [naloge](P07/tasks.md), [izvirne zahteve](../../task/instructions.md).

## Spremembe in izidi

Dodani so dostopni gumbi priljubljenih v preglednici in na tabli, skupna globalna množica ID-jev, trajna shramba z validacijo in sinhronizacijo, lokalni projektni filter, odstranitev priljubljenih projekta, števci in opozorilo ob nedostopni shrambi. Opravila ostanejo podatki javnega API-ja, spremembe priljubljenih so lokalne. Folio, navigacija, podrobnosti in infrastruktura so ohranjeni.

| Zagon | Izid | Dokaz |
| --- | --- | --- |
| Prvi `npm run check` | Lint uspešen; TypeScript TS2684 v novem testnem prestrezanju Storage. Gradnja in testi se niso izvedli. Popravljeno z `Reflect.apply`. | [check.log](P07/check.log) |
| Drugi `npm run check` | Izhod 0: lint, tipi, produkcijska gradnja in **69/69 testov** uspešni; 38 osnovnih, 8 razvojnih P07, 23 lastnih. Playwright 28,7 s. | [check-2.log](P07/check-2.log) |
| `npm test -- --project=agent` po izboljšavi zajema posnetkov | Izhod 0: **23/23 lastnih testov** uspešnih, 12,1 s. Produkcijska koda od celotnega uspešnega preverjanja ni bila spremenjena. | [agent-final.log](P07/agent-final.log) |
| Vizualni pregled obeh pogledov pri 390 in 1440 px | Folio barve, navigacija, gradniki in razporeditev ohranjeni; ločeni gumbi brez prekrivanja podatkov. Pri 390 px se vsebina pomika znotraj preglednice/table; celotna stran se ne razširi. | [preglednica 390](P07/table-390.png), [tabla 390](P07/board-390.png), [preglednica 1440](P07/table-1440.png), [tabla 1440](P07/board-1440.png) |

Prvotna ozka posnetka sta bila zajeta po samodejnem drsenju do tipkovniškega fokusa in sta prikazovala lepljivo navigacijo na zavajajočem mestu v celostranskem posnetku. Testni zajem zdaj pred sliko ponastavi drsenje na vrh/začetek; končna posnetka sta ponovno pregledana. Tipkovniški preklop ostaja preverjen.

## Sledljivost R01–R12

Pogoji in formalni predikati so v [specifikaciji](P07/spec.md#zahteve-in-pravila). Testne oznake spodaj so dejanski začetki imen testov v [lastnih testih](../../tests/agent/P07.spec.ts), zapisani tudi v obeh uspešnih dnevnikih. Vsaka vrstica ima uspešen izid v [celotnem zagonu](P07/check-2.log) in [končnem lastnem zagonu](P07/agent-final.log); skupne regresije so v celotnem zagonu.

| Zahteva | Pogoj | Test ali scenarij | Datoteka in del kode | Izid ter dokaz |
| --- | --- | --- | --- | --- |
| R01 | Izbor po ID-ju, ločen gumb, aria-pressed, brez odpiranja podrobnosti | `S01 S05 S06 S07 S10 S12` — oba pogleda pri 390/1440 px; razvojni D01 | [FavoriteButton](../../src/FavoriteButton.tsx), [App](../../src/App.tsx) vrstica opravila, [TaskBoard](../../src/TaskBoard.tsx) kartica | Uspešno; oba dnevnika |
| R02 | Kanoničen zapis enkratnih nizov po UTF-16 brez polj opravil | `S02 S03: canonical UTF-16 storage, duplicates, unknown IDs and refresh` (13 opravil, Unicode) | [useFavorites](../../src/useFavorites.ts) `commit` | Uspešno; oba dnevnika |
| R03 | Obnova, deduplikacija in ohranitev neznanih ID-jev | `S02 S03`, `S08 S09` | [useFavorites](../../src/useFavorites.ts) `decodeFavorites`, `readFavorites`, `remove` | Uspešno; oba dnevnika |
| R04 | Neveljaven/manjkajoč zapis pomeni prazno množico brez začetnega prepisa | `S04: invalid or missing storage` — 12 razredov vhodov; veljaven podvojen vhod v `S02 S03` | [useFavorites](../../src/useFavorites.ts) validacija in lena inicializacija | Uspešno; oba dnevnika |
| R05 | Privzeto false, filter samo trenutnega projekta v izvornem vrstnem redu | `S01 S05 S06 S07 S10 S12` z obrnjenim vrstnim redom, `S05 S06 S09 S10` za nič/eno opravilo | [App](../../src/App.tsx) `onlyFavorites`, `visibleTasks` | Uspešno; oba dnevnika |
| R06 | Takojšnja odstranitev iz filtra, prazno sporočilo in dosegljive kontrole | `S01 S05 S06 S07 S10 S12`, `S05 S06 S09 S10`; razvojni D02 | [App](../../src/App.tsx) toolbar/prazno stanje, [TaskBoard](../../src/TaskBoard.tsx) prazni stolpci | Uspešno; oba dnevnika |
| R07 | Skupno stanje pogledov in podrobnosti pravega ID-ja | `S01 S05 S06 S07 S10 S12`; razvojni D04 in skupne navigacijske regresije | [App](../../src/App.tsx) skupne lastnosti pogledov, [TaskBoard](../../src/TaskBoard.tsx) povezava po ID-ju | Uspešno; oba dnevnika in osnovni testi |
| R08 | Globalna množica, ponastavitev filtra ob projektu/osvežitvi | `S08 S09: project reset, global IDs and removal of entire project`, `S02 S03` | [App](../../src/App.tsx) hook v `App`, `ProjectView key={project.id}` | Uspešno; oba dnevnika |
| R09 | Odstranitev samo vseh ID-jev trenutnega projekta; pravilno disabled | `S08 S09`, `S05 S06 S09 S10` | [App](../../src/App.tsx) `favoriteCount`, projektni gumb; [useFavorites](../../src/useFavorites.ts) `remove` | Uspešno; oba dnevnika |
| R10 | Celotni projektni X/M in vidni stolpčni števci | `S01 S05 S06 S07 S10 S12`, `S05 S06 S09 S10`, `S08 S09` | [App](../../src/App.tsx) `favoriteCount`/status, [TaskBoard](../../src/TaskBoard.tsx) `entries.length` | Uspešno; oba dnevnika |
| R11 | Dogodki istega ključa brez odmeva, validacija/null, pomnilniško delovanje ob izjemi | `S11: storage events validate, replace, ignore other keys and never echo`; ločena `getItem failure` in `setItem failure` | [useFavorites](../../src/useFavorites.ts) `synchronize`, `readFavorites`, `commit`; [App](../../src/App.tsx) opozorilo | Uspešno; oba dnevnika |
| R12 | Brez zapisov na API/sprememb opravil, ohranjen Folio in ozki prikaz | `S01 S05 S06 S07 S10 S12` primerja podatke pred/po, omrežje in širino; 38 osnovnih + 8 razvojnih; vizualni pregled | [App](../../src/App.tsx), [TaskBoard](../../src/TaskBoard.tsx), [styles.css](../../src/styles.css) nove kontrole; hook nima API-ja | Uspešno; dnevniki in štirje posnetki |

## Omejitve in predaja

- Nedostopni končni testi niso izvedeni. Razpoložljivi testi ne pomenijo izčrpnega dokazila za vse mogoče nize in kombinacije dogodkov; zajeti so vsi R01–R12 in izbrane robne kategorije.
- Dogodki `storage` so v lastnem testu sproženi nadzorovano; ločenega ročnega preverjanja z dvema dejanskima zavihkoma ni bilo.
- Ni znanih neizpolnjenih obveznih zahtev. Opozorilo o shrambi po prvi izjemi ostane do osvežitve, kot določa načrt.
- Spremenjene aplikacijske datoteke: `src/App.tsx`, `src/TaskBoard.tsx`, `src/styles.css`; novi `src/useFavorites.ts`, `src/FavoriteButton.tsx`. Novi testi: `tests/agent/P07.spec.ts`. Brez sprememb strežnika, odvisnosti, konfiguracije ali skupnih testov.
- Ta dokument skladno z navodilom izvajalnika nadomešča prvotno predvideni `P07/validation.md`; dokumentacija ni podvojena. T001–T009 so izvedene; zaključni korak `converge` sproži izvajalnik.

Končna kontrola pred predajo: `npm run typecheck` po zadnji spremembi testnega zajema je uspešen (izhod 0; [typecheck-final.log](P07/typecheck-final.log)). Preverjene so tudi lokalne dokumentacijske povezave, devet opravljenih nalog in dvanajst vrstic sledljivosti.
