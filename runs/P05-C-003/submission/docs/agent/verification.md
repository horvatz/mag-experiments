# P05 — preverjanje in sledljivost

2026-09-25 · postopek C · [Specifikacija](P05/spec.md) · [Načrt](P05/plan.md) · [Naloge](P05/tasks.md)

## Potek

- T001: pregledani izvirna navodila, skupna predloga, projektna načela ter lokalna koda in testni pripomočki. Potrjeno: ProjectView je vezan na ID projekta, tabla že združuje prejeto polje, obstoječi slogi omogočajo notranje drsenje.
- Dokazila tega koraka so po izrecnem navodilu izvajalnika zbrana v tej datoteki; dnevniki in posnetki bodo v `docs/agent/P05/`.
- Pred spremembami implementacija in testi P05 še niso izvedeni. Končni testi niso dostopni in ne bodo navedeni kot opravljeni.

## Rezultati

Preverjanje zaključeno: končni `npm run check` je uspešen, 53/53 testov. Podrobnosti, začetni testni napaki in popravki so spodaj.

- T002–T005: dodani lokalno stanje, filter pred rezom, skupni odsek obeh pogledov, kontrole/status in omejeni slogi Folio. Globalni števci ostajajo vezani na celoten projekt; key projekta in dialog sta ohranjena. Funkcionalna preverjanja sledijo.

- T006: pripremljenih 7 lastnih testov A01–A05 v `tests/agent/P05.spec.ts`, vključno s štirimi posnetki obeh pogledov pri 1440 in 390 pikah. Zagon še sledi.
- T007: `npm run lint` uspešen (0). Prvi `npm run build` neuspešen (2): lastni test je uporabil nepodprto možnost `disabled` v Playwright matcherju. Popravljena je samo testna trditev na `toBeDisabled`/`toBeEnabled`; sledi ponovitev preverjanj. Dokaz: `P05/build.log`.

- T007 dokončan: ponovljeni lint, TypeScript in produkcijska gradnja uspešni v `npm run check`. T008: poteka vseh 53 testov (38 osnovnih, 8 razvojnih, 7 lastnih); dokaz `P05/check.log`.
- Prvi celotni `npm run check`: lint/tipi/gradnja uspešni, 52/53 testov uspešnih (vseh 38 osnovnih in 8 razvojnih ter 6/7 lastnih). A02 je ob naslednji iteraciji poskušal klikniti pravilno onemogočen gumb Zadnja stran; test popravljen, da premik izvede le, če še ni na zadnji strani. Aplikacija ni potrebovala popravka. Dokaz: `P05/check.log` (izhod 1). Sledi ponovitev celotnega ukaza po popravku testa.
- T008 dokončan: končni `npm run check` uspešen (izhod 0), **53/53 testov** v 23,2 s. Lint, TypeScript in produkcijska gradnja uspešni. [Celoten končni dnevnik](P05/check-final.log).
- Vizualno pregledani štirje posnetki: ohranjeni navigacija Folio, barve, kartice/preglednica in vidni fokus; novi kontroli in gumbi se prelamljajo pri 390 pikah. Celotna stran se ne razširi; tabla in preglednica se pomikata znotraj prikaza. Mobilni posnetek table je notranje pomaknjen do kartice, ki je po zaprtju podrobnosti ponovno fokusirana.

## Končni rezultati ukazov

| Preverjanje | Izid | Dokaz |
| --- | --- | --- |
| Prvi `npm run lint` | Uspešno, 0 | [lint.log](P05/lint.log) |
| Prvi `npm run build` | Neuspešno, 2; nepodprt argument v lastnem testu, popravljen | [build.log](P05/build.log) |
| Prvi `npm run check` | 52/53; napačen testni klik na onemogočen gumb, popravljen | [check.log](P05/check.log) |
| Končni `npm run check` | Uspešno, 0: lint, tipi, gradnja, 53/53 | [check-final.log](P05/check-final.log) |
| Osnovni testi v končnem zagonu | 38/38: API 14, namizje 12, mobilno 12 | Isti končni dnevnik, projekti api/desktop/mobile |
| Razvojni P05 v končnem zagonu | 8/8: D01–D04 na namizju in mobilno | Isti končni dnevnik, development-desktop/mobile |
| Lastni P05 v končnem zagonu | 7/7: A01, A02, A03, dva A04, dva A05 | Isti končni dnevnik, projekt agent |

Testi so uporabili obstoječo konfiguracijo in vrata 5174/3102 ter povezavo Chromium iz `task/browser.json`. Ločen ročni strežnik ni bil potreben. Npm/Node opozorili o okoljski nastavitvi proxyja in barvah nista preprečili preverjanj; nastavitev nismo spreminjali.

## Sledljivost zahtev

Sprejemni pogoji in predikati ostajajo v [specifikaciji](P05/spec.md#zahteve-in-pravila). Vsi spodaj navedeni testi so dejansko uspešno izvedeni v [končnem dnevniku](P05/check-final.log). [Lastni testi A01–A05](../../tests/agent/P05.spec.ts) preverjajo vidne ID-je, besedila, kontrole, zahteve in postavitev.

| Zahteva | Preverjeni pogoj | Test ali scenarij | Datoteka in del kode | Izid ter dokaz |
| --- | --- | --- | --- | --- |
| R01 | `all/all/1`, izvorni vrstni red | A01, A03 | [App.tsx](../../src/App.tsx#L16): začetno stanje in filteredTasks | Uspešno, končni dnevnik A01/A03. |
| R02 | Vse velikosti, neprekrivajoči se odseki, brez izgubljenih/podvojenih ID-jev | A01: 13 zapisov, 2/5/10; D01/D02 | [App.tsx](../../src/App.tsx#L19): filter, offset in slice | Uspešno, A01 in D01/D02 na obeh širinah. |
| R03 | Vse štiri smeri, veljavni robovi in nedejavnost onemogočenih gumbov | A01, oba A04 | [App.tsx](../../src/App.tsx#L24): pogoji; vrstice 67–71: gumbi in varovani prehodi | Uspešno, A01/A04. |
| R04 | Ponastavitev ob spremembi velikosti tudi s še veljavne strani; all je ena stran | A01, D04 | [App.tsx](../../src/App.tsx#L26): changePageSize | Uspešno, A01/D04. |
| R05 | Vsi filtri pred rezom, stabilni vrstni red, ponastavitev | A02, D03 | [App.tsx](../../src/App.tsx#L19): filteredTasks; vrstica 27: changePageFilter | Uspešno, A02/D03. |
| R06 | Enaki ID-ji obeh pogledov, združevanje po skupnem rezu | A02, A05, D03 | [App.tsx](../../src/App.tsx#L75): visibleTasks za oba pogleda; [TaskBoard.tsx](../../src/TaskBoard.tsx#L17): entries | Uspešno, A02/A05/D03. |
| R07 | Stran, velikost in filter se ohranijo ob pogledu/podrobnostih | A03: oba pogleda, gumb in Escape | [App.tsx](../../src/App.tsx#L14): projektno lokalno stanje in TaskDetails; [TaskDetails.tsx](../../src/TaskDetails.tsx#L11): close | Uspešno, A03; osnovna regresija dialogov. |
| R08 | Menjava/vrnitev in reload ponastavijo stanje; URL/shramba se ne dopolnjujeta | A03 | [App.tsx](../../src/App.tsx#L119): key projekta; začetni useState | Uspešno, A03 in pregled kode: ni shrambe/URL za novo stanje. |
| R09 | Točni status, število strani in indeksi za all, odseke in filter | A01, A02, A03, A04, D02 | [App.tsx](../../src/App.tsx#L74): pagination-status | Uspešno, navedeni testi primerjajo natančno besedilo. |
| R10 | Prazna projekta/filter, ničelni status, štirje onemogočeni gumbi, odstranitev filtra | Oba A04 | [App.tsx](../../src/App.tsx#L21): pageCount/pogoji; vrstice 74–75: ničelni in prazni prikaz | Uspešno, oba A04; osnovni testi praznih pogledov. |
| R11 | Globalni števci ostanejo celotni, stolpci štejejo samo stran | A02, A04 | [App.tsx](../../src/App.tsx#L28): counts in tasks.length; [TaskBoard.tsx](../../src/TaskBoard.tsx#L22): entries.length | Uspešno, A02/A04. |
| R12 | Ni zapisov, ID-ji/Unicode/enaki naslovi, podrobnosti, nalaganje, Folio/390 px | A01–A05, D04, vseh 38 osnovnih testov; vizualni pregled | [App.tsx](../../src/App.tsx#L15): javni API in nemutirajoči izračuni; [styles.css](../../src/styles.css#L66): novi slogi | Uspešno; nič zapisov in UI zahtevkov /__test/, regresija in spodnji posnetki. |

## Vizualna dokazila

- [Preglednica 1440 px](P05/folio-1440-table.png), [tabla 1440 px](P05/folio-1440-board.png).
- [Preglednica 390 px](P05/folio-390-table.png), [tabla 390 px](P05/folio-390-board.png).

## Obseg, omejitve in predaja

Aplikacijski spremembi sta omejeni na `src/App.tsx` in `src/styles.css`; lastni testi so v `tests/agent/P05.spec.ts`. Spremenjena dokumentacija je v `docs/agent/`; predhodna procesna koraka sta posodobila dovoljeni datoteki `.specify/memory/constitution.md` in `.specify/feature.json`. Strežnik, skupni tipi/testi, odvisnosti, konfiguracija in veščine niso bili spremenjeni. Build/test sta ustvarila običajne izhodne artefakte v dovoljenih mapah.

Vse R01–R12 imajo izvedbo in uspešna lokalna dokazila; znanih neizpolnjenih obveznih zahtev ni. Končni testi niso dostopni in niso izvedeni. Generirani primeri (0, 1, 13 zapisov ter razvojni podatki) ne predstavljajo izčrpnega preverjanja vseh možnih podatkov. Navigacija med nalaganjem je preverjena v okviru obstoječe regresije; novih sočasnih sprememb brez osvežitve ne uvajamo. Naslednji korak converge sproži izvajalnik.

- T009 dokončan: preverjenih vseh 12 vrstic sledljivosti in veljavnost lokalnih povezav; naloge T001–T009 zaključene. Pregled časov sprememb zaščitenih poti (server, shared, osnovni testi, odvisnosti in Playwright konfiguracija) ni pokazal sprememb po začetku pilota.
