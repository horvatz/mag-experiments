# Preverjanje P07

2026-09-25. Implementacija zaključena in preverjena. Merilo: [izvirne zahteve](../../task/instructions.md), [specifikacija](P07/spec.md), [načrt](P07/plan.md), [naloge](P07/tasks.md).

## Dnevnik

- Začetek: pregledani projektna pravila, skupna predloga, specifikacija, načrt in naloge. Implementacijski testi še niso izvedeni. Končni testi niso dostopni.

## Rezultati in omejitve

Končni rezultat: vsa spodaj navedena preverjanja so uspešna. Začetni vpisi spodaj ohranjajo potek dela.

- T001–T005: implementirani hook, skupni gumbi, globalna množica, projektni filter, kontrole in slogi. Pregledana ločitev zapisov od inicializacije/storage dogodkov; funkcionalna preverjanja sledijo.

- Predhodni `npm run lint`: uspešno (exit 0), pred dodajanjem lastnih testov. T006–T007: dodanih 20 vedenjskih testov A01–A08 z matrikami neveljavnih zapisov in izjem; izvajanje sledi.

- Celoten `npm run check`: **uspešno, exit 0**. Lint, TypeScript in produkcijska gradnja uspešni; **66/66 testov** v 27,2 s: 14 API + 24 baseline (38 osnovnih), 8 razvojnih P07 in 20 lastnih. Dnevnik: [check.log](P07/check.log).
- Vizualno pregledani vsi štirje posnetki iz A05: [namizna preglednica](P07/desktop-table.png), [namizna tabla](P07/desktop-board.png), [preglednica 390 px](P07/mobile-table.png), [tabla 390 px](P07/mobile-board.png). Ohranjeni Folio, navigacija, nevtralne površine, modri poudarki in vsebina kartic; gumbi ne prekrivajo besedila. Pri 390 px se kontrole prelomijo in pomika se notranjost preglednice/table, ne cela stran. A05 dodatno preveri širino dokumenta in preklop s tipkovnico.

## Sledljivost zahtev

Predikati, vhodna domena in sprejemni pogoji so v [specifikaciji](P07/spec.md#zahteve-in-pravila). Spodnja tabela je izvedbeni del skupne predloge. Vsi navedeni testi so dejansko izvedeni in uspešni v [dnevniku](P07/check.log); A-oznake so enolične predpone imen v [lastnih testih](../../tests/agent/P07.spec.ts), D-oznake pa v [razvojnih testih](../../tests/development/P07.spec.ts).

| Zahteva | Pogoj | Test ali scenarij | Datoteka in del kode | Izid ter dokaz |
| --- | --- | --- | --- | --- |
| R01 | Preklop samo izbranega ID-ja; gumb zunaj povezave, aria-pressed, brez dialoga | S01; A01, A05, D01, D04 | [FavoriteButton](../../src/FavoriteButton.tsx), [App](../../src/App.tsx) vrstica, [TaskBoard](../../src/TaskBoard.tsx) kartica, [useFavorites](../../src/useFavorites.ts) toggle | Uspešno; A01/A05 in D01/D04 v check.log. |
| R02 | Samo različica in enkratni nizi, sortirani po UTF-16 | S02; A02, D03 | [useFavorites](../../src/useFavorites.ts) update, vrstica 47 | Uspešno; A02 primerja celoten JSON, vključno z praznim nizom, emoji in visokim BMP znakom. |
| R03 | Obnova brez podvajanja; neznani ID-ji ostanejo brez lažnih opravil | S03; A02, A03, D03 | [useFavorites](../../src/useFavorites.ts) decodeFavorites/readFavorites; App šteje le opravila API-ja | Uspešno; obnova po dejanski osvežitvi, brez ponovnega sejanja podatkov. |
| R04 | Neveljaven ali odsoten zapis pomeni prazno množico brez začetnega zapisa | S04; A06.0–A06.10 | [useFavorites](../../src/useFavorites.ts) decodeFavorites/readFavorites | Uspešno; 11 vhodov, nespremenjen izvirni zapis, nič setItem ob nalaganju. |
| R05 | Privzeti false; stabilen seznam samo lokalnih priljubljenih | S05; A01, A02, A03, D02 | [App](../../src/App.tsx) ProjectView: onlyFavorites/visibleTasks | Uspešno; 13 opravil z drugačnimi ID-ji, dva enaka naslova, izvorno zaporedje v obeh pogledih. |
| R06 | Odstranitev takoj skrije opravilo; prazno sporočilo in dosegljiv filter | S06; A01, A04, D02 | [App](../../src/App.tsx) favorites-controls in prazno filtrirano stanje | Uspešno; odstranitev zadnjega v obeh pogledih, prazna projekta, ponovni izklop filtra. |
| R07 | Enotna F/q med pogledoma, podrobnosti po ID-ju | S07; A01, D04, baseline podrobnosti/table | [App](../../src/App.tsx) App/ProjectView props; [TaskBoard](../../src/TaskBoard.tsx); obstoječi TaskDetails | Uspešno; preklopi, podrobnosti, Escape in ohranitev filtra. |
| R08 | F globalna, q false ob projektu in osvežitvi | S08; A02, A03, A08 | [App](../../src/App.tsx) hook v App in key projekta za ProjectView | Uspešno; dva projekta, povratek, osvežitev in nadaljevanje v pomnilniku. |
| R09 | F brez ID-jev celotnega projekta; tuji/neznani ohranjeni; pravilen disabled | S09; A03, A04, A08 | [useFavorites](../../src/useFavorites.ts) remove; [App](../../src/App.tsx) gumb z vsemi tasks ID-ji | Uspešno; aktivni filter, oba projekta, 0 opravil in neznani ID-ji. |
| R10 | Števec X/M za celoten projekt, števci stolpcev za vidna opravila | S10; A01, A03, A04 | [App](../../src/App.tsx) favoriteCount/status; [TaskBoard](../../src/TaskBoard.tsx) entries/column-count | Uspešno; 2 od 13 ob filtru, ničelni stolpci in 0 od 0. |
| R11 | Storage validacija brez povratnega zapisa; null in drug ključ; izjeme ohranijo uporabnost in alert | S11; A07, A08.read/write/access | [useFavorites](../../src/useFavorites.ts) receive/readFavorites/update; [App](../../src/App.tsx) storage-warning | Uspešno; celotna matrika dogodkov, nič povratnih zapisov, tri vrste izjem in nadaljnji izbor/odstranjevanje. |
| R12 | Noben zapis na API ali sprememba opravil, ohranjen Folio/nalaganje/navigacija/390 px | S12; A01, A05, A08, D04, vseh 38 osnovnih testov | [App](../../src/App.tsx), [TaskBoard](../../src/TaskBoard.tsx), [styles](../../src/styles.css) dodatki favorites; API, navigacija in nalaganje nespremenjeni | Uspešno; nadzor zahtevkov, primerjava strežniških podatkov pred/po, regresije in štirje vizualno pregledani posnetki. |

## Končno stanje in omejitve

- Implementirane so vse R01–R12; za opisane scenarije ni znanih neizpolnjenih obveznih zahtev. T001–T009 so zaključene.
- Spremenjene aplikacijske datoteke: `src/App.tsx`, `src/TaskBoard.tsx`, `src/styles.css`; dodani `src/useFavorites.ts`, `src/FavoriteButton.tsx` in `tests/agent/P07.spec.ts`. Postopkovni dokumenti so v dovoljenih poteh. Infrastruktura, odvisnosti, skupni tipi in testi niso spremenjeni.
- Storage sinhronizacija je preverjena z dogodki `StorageEvent`, ki jih sproži testni program. Ločen fizičen uporabniški profil/več procesov brskalnika ni preverjen; lastnosti obdelovalca, validacija in odsotnost povratnih zapisov so preverjene.
- Končni testi niso dostopni in niso izvedeni. Testni primeri ne pomenijo izčrpnega pregleda vseh podatkov opisane domene.
- Opozorili okolja o npm `http-proxy` ter NO_COLOR/FORCE_COLOR nista povzročili napake preverjanja. Noben neuspešen funkcionalni zagon ni bil prikrit.
