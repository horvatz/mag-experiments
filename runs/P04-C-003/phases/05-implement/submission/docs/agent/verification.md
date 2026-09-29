# P04 — izvedba in preverjanje

2026-09-23. Postopek C, isti agent. Specifikacija: [P04/spec.md](P04/spec.md); načrt: [P04/plan.md](P04/plan.md); naloge: [P04/tasks.md](P04/tasks.md).

## Sprotni zapis

- Začetek implementacije: prebrani lokalna veščina, izvorne zahteve, skupna predloga, načela, specifikacija, načrt in naloge. Obstoječi ProjectView ima ključ project.id; konfiguracija že vključuje lastne teste in povezavo s Chromiumom. Koda in testi na začetku še niso spremenjeni; preverjanja še niso izvedena.
- Dokazila bodo shranjena v P04/check.log in tem dokumentu. Nedostopni končni testi niso izvedeni. Infrastruktura in odvisnosti ostanejo obstoječe.

- T002–T006: dodana čista stabilna projekcija, testi primerjalnika, štiri označene kontrole in Folio slogi. Stanje je v ProjectView, ki se ob menjavi project.id ponovno ustvari; oba pogleda prejmeta isto projekcijo. Podrobnosti, navigacija, API in infrastruktura niso spremenjeni. Testi še niso zagnani.

- T007: dodani integracijski testi U01–U04, vključno z 13 drugimi ID-ji, podvojenimi naslovi, 100 kombinacijami pri 0/1 opravilu in posnetki pri 390/1440 px. Sledi prvi celotni zagon preverjanj.

- Pregled src/: brez /__test/, testnih uvozov ali localStorage/sessionStorage; razvrščanje uporablja samo izpeljano polje.
- Celotni zagon `npm run check`: **izhodni status 0**; lint, TypeScript in produkcijska gradnja uspešni. Playwright: **60 uspešnih testov v 48,6 s** (38 osnovnih, 8 razvojnih P04, 14 lastnih). Celoten izhod: [P04/check.log](P04/check.log). Ponovni zagon ni bil potreben.
- Vizualno pregledani vsi štirje posnetki: [preglednica 390](P04/folio-table-390.png), [tabla 390](P04/folio-board-390.png), [preglednica 1440](P04/folio-table-1440.png), [tabla 1440](P04/folio-board-1440.png). Kontrole se na telefonu zložijo v dve koloni, gumb pod njimi; Folio, navigacija in povzetki so ohranjeni. Fokus je viden. Preglednica in tabla se pomikata notranje; širina strani se ne razširi.

## Spremembe

Dodani sta [čista projekcija](../../src/taskSorting.ts) in [komponenta kontrol](../../src/SortControls.tsx). [App.tsx](../../src/App.tsx) hrani nastavitve lokalno v projektu in posreduje isto projekcijo obema pogledoma; [styles.css](../../src/styles.css) vsebuje samo dopolnitev za kontrole. Podrobnosti, navigacija, strežnik, podatki, skupni tipi/testi in konfiguracija niso bili spremenjeni. Lastni testi so v [P04.sorting.spec.ts](../../tests/agent/P04.sorting.spec.ts) in [P04.ui.spec.ts](../../tests/agent/P04.ui.spec.ts).

## Sledljivost R01–R12

Vsi spodnji izidi so iz dejanskega istega celotnega zagona v [check.log](P04/check.log). A01–A05 označujejo natančne predpone imen v lastnih testih primerjalnika; U01–U04 predpone v lastnih UI testih. D01–D04 so priloženi razvojni testi, izvedeni na namizni in mobilni velikosti. Predikati in definicije S/S0/P so v [specifikaciji](P04/spec.md#predikati-razvrščanja).

| Zahteva | Pogoj | Izvedeni test/scenarij | Datoteka in del kode | Izid in dokaz |
| --- | --- | --- | --- | --- |
| R01 | `S=S0`; izvorni ID-ji v prejetem vrstnem redu | U01 defaults; A05 original; D01 | [taskSorting.ts](../../src/taskSorting.ts): defaultSortSettings, sortTasks; [App.tsx](../../src/App.tsx): ProjectView useState | Uspešno, check.log testi 39/43, 55/56. |
| R02 | NFD → odstranitev U+0300–U+036F → male črke → UTF-16 | A01 title in assignee: NFD, UTF-16, punctuation and lexical numbers; D01 | [taskSorting.ts](../../src/taskSorting.ts): normalize, compare, compareKey | Uspešno, check.log 47/48; vključeni sestavljeni znaki, kombinirajoči znak zunaj intervala, ločila, številke in surrogate pair. |
| R03 | statusni rangi in kronologija | A02 status ranks and dates across years, leap day and ties; D02/D03 | [taskSorting.ts](../../src/taskSorting.ts): statusRank, compareKey | Uspešno, check.log 49; obe smeri in enaki datumi. |
| R04 | smer obrača samo izid ključa; izenačenja ostanejo stabilna | A01, A02, A03, A04, A05 | [taskSorting.ts](../../src/taskSorting.ts): compareKey in končni a.index − b.index | Uspešno, check.log 47–55. |
| R05 | sekundarni ključ le ob enakosti; neodvisna smer | A03 secondary title/assignee/status/dueDate; U01; D02 | [taskSorting.ts](../../src/taskSorting.ts): sortTasks; [SortControls.tsx](../../src/SortControls.tsx): sekundarni izbiri | Uspešno, check.log 50–53/56; vsi sekundarni ključi, none in štiri kombinacije smeri. |
| R06 | oba ključa enaka → izvorni indeks; isti ključ dovoljen; original prevlada | A04 identical keys do not reverse ties or primary direction; A05; U01 | [taskSorting.ts](../../src/taskSorting.ts): zgodnji original, primerjave, izvorni indeks; [SortControls.tsx](../../src/SortControls.tsx): vse možnosti | Uspešno, check.log 54–56. |
| R07 | vsak stolpec je filter iste projekcije, stolpci stalni | U01 shared projection; D03 | [App.tsx](../../src/App.tsx): sortedTasks za tabelo in tablo; [TaskBoard.tsx](../../src/TaskBoard.tsx): columns, entries | Uspešno, check.log 41/45/56; vsi trije stolpci v obeh sekundarnih smereh. |
| R08 | sprememba pogleda/podrobnosti ohrani S | U01 duplicate details; U03 matrika obeh pogledov | [App.tsx](../../src/App.tsx): stanje ProjectView; [TaskDetails.tsx](../../src/TaskDetails.tsx): obstoječi close | Uspešno, check.log 56/58/59; vseh 13 podrobnosti iz preglednice, dve iz table, gumb in Escape. |
| R09 | drug projekt ali osvežitev → S0; brez shrambe/URL | U02 project changes and refresh reset all settings without storage; U01 URL/storage | [App.tsx](../../src/App.tsx): key=project.id, useState; pregled src za odsotnost shrambe | Uspešno, check.log 56/57; A → B → A in osvežitev. |
| R10 | reset vseh štirih vrednosti; 0/1 pri vseh nastavitvah | U01 reset; U03 0 tasks in U03 1 tasks; A05; D04 | [SortControls.tsx](../../src/SortControls.tsx): gumb; [App.tsx](../../src/App.tsx): onReset, kontrole pri praznem polju | Uspešno, check.log 55/56/58/59; vseh 100 kombinacij za vsako robno velikost in oba pogleda. |
| R11 | nespremenjeni podatki/ID-ji/števila/vhod; 0 zapisov | A05 frozen inputs and immutable IDs; U01 summary and no writes; U02–U04 readonly; D04 | [taskSorting.ts](../../src/taskSorting.ts): kopija in pomožno polje; [App.tsx](../../src/App.tsx): counts iz tasks | Uspešno, check.log 55–60; zamrznjeni podatki, izvorni vrstni red, reference opravil, povzetki in zajem zahtevkov. |
| R12 | vsak ID enkrat, prave podrobnosti, Folio in bralne funkcije | A05, U01 13 enakih naslovov z različnimi ID-ji, U04 Folio/fokus/390 px; vseh 38 osnovnih testov | [App.tsx](../../src/App.tsx): ID-ji/povezave; [TaskBoard.tsx](../../src/TaskBoard.tsx), [TaskDetails.tsx](../../src/TaskDetails.tsx): obstoječa identiteta; [styles.css](../../src/styles.css): sort-controls | Uspešno, check.log in štirje pregledani posnetki zgoraj. |

## Omejitve in predaja

V obsegu izvornih R01–R12 ni znane neizpolnjene zahteve. Preverjanje zajema opisane scenarije in domenske robove, ne vseh možnih vhodnih nizov ali velikosti. Nedostopni končni testi **niso bili izvedeni**. Neveljavni/manjkajoči datumi in razširjena sočasna navigacija ostajajo zunaj zahtevanega obsega. Testni podatki so bili uporabljeni izključno prek testnih GET prestrezanj; aplikacija uporablja javni API.

T001–T009 so opravljene. Kontrolni seznam kakovosti zahtev ni bil spreminjan. Naslednji korak `speckit-converge` sproži izvajalnik.
