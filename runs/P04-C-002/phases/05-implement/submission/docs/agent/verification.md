# P04 — Preverjanje izvedbe

2026-09-25. Merilo: [izvirne zahteve](../../task/instructions.md), [specifikacija](P04/spec.md) in [načrt](P04/plan.md).

## Dnevnik

- Začetek implementacije: 641 sekund faze, 761 sekund skupnega proračuna. Pregledane obstoječe skripte in Playwrightovi projekti; konfiguracija ostane nespremenjena. Preverjanja še niso izvedena.
- Dokazila se zbirajo tukaj po izrecnem navodilu koraka; `P04/validation.md` je povezava na ta zapis brez podvajanja.

## Omejitve

Končni testi niso dostopni in niso izvedeni. Ostale rezultate in sledljivost dopolnimo po dejanskih preverjanjih.

- T001–T004: pripravljen dnevnik, čista projekcija in neposredni testi; štiri kontrole in skupna projekcija so povezani v ProjectView. Testi še niso zagnani.

- T005–T006: dodani brskalniški scenariji, vse kombinacije pri nič/enem opravilu, odzivni slogi in zajem obeh pogledov pri 1440/390 pikah. Začenja se skupni zagon preverjanj.

- `npm run check`: izhod 0; lint, TypeScript in produkcijska gradnja uspešni; 59/59 testov uspešnih (22,3 s): 38 osnovnih, 8 razvojnih in 13 lastnih. Celoten izhod: [check.log](P04/check.log); izseki: [lint](P04/lint.log), [build](P04/build.log), [test](P04/test.log). Ni neuspešnih preverjanj ali ponovitev.
- Vizualno pregledani štirje posnetki A07: meni Folio, barve, povzetki, kartice in preglednica so ohranjeni; pri 390 pikah sta dve kontroli v vrstici in gumb pod njima, prikaza se pomikata znotraj vsebine. Fokus je viden; meritev širine strani je uspešna.
- Dodatni ročni ogled na `WEB_PORT=5193 API_PORT=3123 npm run dev`, priklop z `chromium.connect(wsEndpoint)` iz `task/browser.json`: pri 390 pikah je izbrani `dueDate` vidno označen z »Rok«, kontrole in notranje drsenje so pravilno postavljeni. [Posnetek](P04/folio-390-manual.png). Začasni strežnik je ustavljen.

## Sledljivost R01–R12

Sprejemni pogoji in predikati so v [specifikaciji](P04/spec.md#zahteve-in-pravila). A01–A07 so dejansko izvedeni testi v [tests/agent/P04.spec.ts](../../tests/agent/P04.spec.ts); A01 ima dve, A03 štiri, A06 dve in A07 dve izvedbi. D01–D04 so [razvojni testi](../../tests/development/P04.spec.ts), vsak izveden na namizju in mobilno. Vsi spodaj navedeni rezultati so uspešni v istem [zagonu 59 testov](P04/test.log).

| Zahteva | Pogoj | Test ali scenarij | Datoteka in del kode | Izid ter dokaz |
| --- | --- | --- | --- | --- |
| R01 | Privzete štiri vrednosti in izvorno zaporedje | D01, A04, A05 | [taskSorting.ts](../../src/taskSorting.ts), `defaultSortSettings` in veja `original`; [App.tsx](../../src/App.tsx), `ProjectView` | Uspešno; [test.log](P04/test.log) |
| R02 | NFD, samo U+0300–U+036F, male črke in UTF-16 za naslov/osebo | A01 title in assignee; D01 | [taskSorting.ts](../../src/taskSorting.ts), `normalize`, `compare`, `compareKey` | Uspešno; vključeni naglasi, številčni deli, ločila, U+1AB0 in znaki zunaj BMP; [test.log](P04/test.log) |
| R03 | Statusi po domeni in kronološki veljavni datumi | A02, A03 status/dueDate, D02/D03 | [taskSorting.ts](../../src/taskSorting.ts), `statusOrder`, `compareKey` | Uspešno, vključno s prestopnim dnevom in prehodom let; [test.log](P04/test.log) |
| R04 | Desc obrne kriterij, ohrani izenačenja | A01–A04 | [taskSorting.ts](../../src/taskSorting.ts), `direction`, `sortTasks` | Uspešno v obeh smereh; [test.log](P04/test.log) |
| R05 | Drugi ključ samo ob primarni enakosti, samostojna smer | A03 za vse štiri ključe in kombinacije smeri, D02 | [taskSorting.ts](../../src/taskSorting.ts), veja `first`/`second`; [App.tsx](../../src/App.tsx), sekundarni kontroli | Uspešno; [test.log](P04/test.log) |
| R06 | Stabilnost, isti ključ, original ne glede na druge kontrole | A03/A04, A05 original z desc/title/desc | [taskSorting.ts](../../src/taskSorting.ts), zgodnji `original` in zadnji izvorni indeks | Uspešno; [test.log](P04/test.log) |
| R07 | Stalni stolpci in relativni vrstni red skupne projekcije | A05 vsi trije stolpci, D03 | [App.tsx](../../src/App.tsx), `sortedTasks`; [TaskBoard.tsx](../../src/TaskBoard.tsx), obstoječi `columns` in `filter` | Uspešno; [test.log](P04/test.log) |
| R08 | Vsi štirje izbori preživijo pogled in podrobnosti | A05 | [App.tsx](../../src/App.tsx), `ProjectView` lokalni `useState` in izris podrobnosti | Uspešno; [test.log](P04/test.log) |
| R09 | Projekt in osvežitev vrneta privzete vrednosti; brez shrambe/URL-ja | A05 projekt/vrnitev/osvežitev, primerjava localStorage/sessionStorage in URL-ja | [App.tsx](../../src/App.tsx), `key={project.id}` in začetno stanje | Uspešno; [test.log](P04/test.log) |
| R10 | Gumb resetira vse; nič/eno opravilo pri vseh ključih in smereh | A04 in A06 vseh 100 kombinacij za vsak robni vhod, A05, D04 | [App.tsx](../../src/App.tsx), gumb in kontrole tudi pri praznem polju; [taskSorting.ts](../../src/taskSorting.ts), projekcija | Uspešno, tudi brskalniška matrika 200 kombinacij; [test.log](P04/test.log) |
| R11 | Vhod, polja, pripadnost, števila ostanejo enaki; ni zapisov | A04 zamrznjen vhod/identiteta objektov, A05 povzetek 4/4/4 in omrežje, A06, D04 | [taskSorting.ts](../../src/taskSorting.ts), urejanje novega pomožnega polja; [App.tsx](../../src/App.tsx), števila iz `tasks` | Uspešno; [test.log](P04/test.log) |
| R12 | Enkratni ID-ji, prave podrobnosti, obstoječe branje in odzivni Folio | A04/A05 z 12 drugimi ID-ji in enakimi naslovi, A07, vseh 38 osnovnih testov | [App.tsx](../../src/App.tsx), ID-ji/povezave; obstoječa [TaskBoard.tsx](../../src/TaskBoard.tsx) in [TaskDetails.tsx](../../src/TaskDetails.tsx); [styles.css](../../src/styles.css), `.sort-controls` | Uspešno; [test.log](P04/test.log) in pregled posnetkov spodaj |

## Vizualna dokazila in obseg

Pregledana sta [preglednica 1440](P04/folio-1440-table.png) in [tabla 1440](P04/folio-1440-board.png) ter [preglednica 390](P04/folio-390-table.png) in [tabla 390](P04/folio-390-board.png). Preverjanje A07 potrdi odsotnost raztezanja cele strani in vidni fokus. Ročni posnetek zgoraj dodatno prikazuje običajni mobilni prikaz brez fokusa na izbirniku. Ohranjen je [potrjeni dizajn Folio](../dizajn.md); osnovni gradniki niso preoblikovani.

Implementacija spreminja samo `src/App.tsx`, `src/styles.css` in novo `src/taskSorting.ts`; lastni testi so v `tests/agent/P04.spec.ts`. Procesni dokumenti so v dovoljenih `docs/agent/` in že pripravljenih datotekah Spec Kit. Obstoječi API, strežnik, tipi, skupni/razvojni testi, nastavitve in odvisnosti ostajajo nespremenjeni. Aplikacija ne uporablja testnih poti ali testnih pripomočkov.

## Končni rezultat in meje preverjanja

Vse naloge T001–T008 so opravljene. V lokalno dostopnih preverjanjih ni ugotovljenih neizpolnjenih zahtev R01–R12. Ni razširitve zahtev na manjkajoče datume ali nove sočasne spremembe; veljajo omejitve izvirne naloge. Nedostopni končni testi niso izvedeni. Opozorila izvajalnega okolja o `http-proxy` ter `NO_COLOR`/`FORCE_COLOR` niso povzročila neuspešnega preverjanja.
