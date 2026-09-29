# P06 — Nastavljiv izvoz CSV

## Problem in kontekst

Folio trenutno bere projekte in njihova opravila prek javnega API-ja ter jih
prikaže v preglednici ali na tabli. Uporabnik želi izvoziti opravila trenutno
izbranega projekta z nastavljivim naborom kolon, ločilom in filtrom stanja.
Izvoz mora biti lokalno sestavljen iz že naloženih podatkov, brez spreminjanja
opravil ali dodatnega API-ja. Obstoječi pogled in navigacija ostaneta
uporabna, nastavitve pa veljajo za trenutni projektni prikaz.

## Vhodi, dejanja in izidi

- Vhod so projekti in opravila, prebrana prek `/api/`; projektna opravila so
  prikazana v izvornem vrstnem redu API odgovora.
- Dovoljene kolone v stalnem vrstnem redu so `id`, `projectId`, `title`,
  `status`, `assignee`, `dueDate`, `description`. Privzeto so vse izbrane.
- Uporabnik lahko preklopi posamezne kolone, izbere `;` ali `,` in filter
  `all`, `todo`, `in_progress` ali `done`. Preglednica/tabla ne spreminja teh
  nastavitev.
- Gumb je omogočen natanko tedaj, ko so podatki naloženi, je izbrana vsaj ena
  kolona in filtrirani nabor vsebuje vsaj eno opravilo. Sicer prenosa ni.
- Uspešen izvoz sproži prenos `folio-<projectId>.csv`; vsebina je UTF-8 z
  BOM-om, vedno citiranim CSV in CRLF zaključkom vsake vrstice. Izvoz nima
  strežniškega zapisa. Napaka nalaganja sledi obstoječemu prikazu napake.
- Menjava projekta ustvari privzete nastavitve za novi projekt; osvežitev
  strani prav tako začne s privzetimi nastavitvami.

## Zahteve in pravila

Naj bo `T` seznam opravil trenutnega projekta iz API-ja, `S` množica izbranih
kolon, `F` filter stanja, `D = T`, kadar je `F = all`, sicer `D = [t ∈ T |
t.status = F]`, `C = [c ∈ O | c ∈ S]`, kjer je
`O = [id, projectId, title, status, assignee, dueDate, description]`.
`ready = loaded ∧ |S| > 0 ∧ |D| > 0`. CSV ima glavo `C`, nato vrstice
`D` v istem vrstnem redu kot `T`. Vsako celico `v` serializiramo kot
`"` + `v.replaceAll("\"", "\"\"")` + `"`; podatkovni niz pred
citiranjem dobi apostrof na samem začetku, če `/^[ \t\r\n]*[=+\-@]/`
ujema. Glave niso nevtralizirane. Vrstice povezuje `\r\n`, za zadnjo vrstico
je `\r\n`, datoteka pa se začne z `\uFEFF`.

| Zahteva | Pravilo oziroma sprejemni pogoj | Način preverjanja |
| --- | --- | --- |
| R01 | Začetno `F=all`, `S=O`, ločilo `;`; vrstice sledijo `T`. | D01 in agentna »CSV keeps canonical columns and task order« ter »CSV exports every record…«. |
| R02 | `C` izhaja iz `O`, ne iz zaporedja klikanja. | Agentna »CSV keeps canonical columns and task order«: title/id/description izbrani v drugem vrstnem redu. |
| R03 | `ready` zahteva `|S|>0`; prazen izbor onemogoči, ponovni izbor omogoči prenos. | Agentna »CSV keeps canonical columns and task order« preveri disabled in omogočeno stanje. |
| R04 | `D` omeji samo CSV, prikaz uporablja `T`. Prazen `D` onemogoči izvoz. | D02; agentni filtri, prazen statusni rezultat in prazen projekt. |
| R05 | Ime `folio-${project.id}.csv`; BOM; brez navigacije ali API zapisa. | D01; agentni kanonični prenos preveri ime, BOM, URL in zapisovalne zahteve. |
| R06 | Ločilo `;` ali `,`; vse celice citirane, `"` podvojen. | D02, D03 in agentni natančni CSV. |
| R07 | CRLF med vrsticami in za zadnjo; notranji CR/LF ostane citiran. | Agentni natančni CSV z večvrstičnim opisom. |
| R08 | `/^[ \t\r\n]*[=+\-@]/` na izvornem nizu pomeni apostrof pred nizom. | D03 in agentni natančni CSV preverita štiri znake in začetne presledke. |
| R09 | Vrednosti niso formatirane ali trimane; status je interni, datum `YYYY-MM-DD`. | Agentni natančni CSV preveri Unicode, status, datum, presledke in opis. |
| R10 | Nastavitve veljajo čez preklop pogledov. | D04 in agentna primerjava CSV v tabeli/na tabli ter nazaj. |
| R11 | Projekt/reload ponastavita; vsak izvoz bere aktualno stanje. | Agentna sekvenčna izvoza, menjava projekta in reload. |
| R12 | Serializacija ne zapisuje, kontrole so odzivne. | D04; agentni `readonly` in pogled pri 390 px. |

## Izvedba in sledljivost

Izvedba: lokalno stanje in uporabniški vmesnik v
[`src/App.tsx`](../../src/App.tsx) (`CsvExportControls`), čista serializacija
in prenos v [`src/csvExport.ts`](../../src/csvExport.ts)
(`CSV_COLUMNS`, `createCsv`, `downloadCsv`), slogi kontrol v
[`src/styles.css`](../../src/styles.css); preverjanja v
`tests/agent/` ter dokumentirani izidi v
[`docs/agent/verification.md`](verification.md).

| Zahteva | Pogoj | Test ali scenarij | Datoteka in del kode | Izid ter dokaz |
| --- | --- | --- | --- | --- |
| R01 | `F=all`, `S=O`, `;`, vrstni red `T`. | D01; agentni kanonični vrstni red in 13 opravil. | `src/App.tsx` začetne vrednosti; `src/csvExport.ts` filter kolone in vrstice. | Uspešno; `npm run check`, 53/53; podrobnosti v [`verification.md`](verification.md). |
| R02 | Izbrane kolone sledijo `O`. | Agentni kanonični vrstni red po klikih title/id/description. | `src/csvExport.ts` `CSV_COLUMNS.filter`. | Uspešno; glej poročilo. |
| R03 | Prazen izbor onemogoči gumb; ponovni izbor ob vrsticah omogoči prenos. | Agentni kanonični vrstni red. | `src/App.tsx` `canExport`, onemogočen gumb. | Uspešno; glej poročilo. |
| R04 | Filter vpliva na CSV, prazen rezultat onemogoči izvoz, UI ohrani vsa opravila. | D02; agentna filtracija, prazen filter in prazen projekt. | `src/App.tsx` `exportTasks`; prikaza še uporabljata `tasks`. | Uspešno; glej poročilo. |
| R05 | Ime, BOM, isti URL, brez zapisovanja. | D01; agentni kanonični prenos in `readonly`. | `src/csvExport.ts` `downloadCsv` in `createCsv`. | Uspešno; glej poročilo. |
| R06 | Ločili ;/, citati in podvojeni narekovaji. | D02, D03; agentni natančni CSV. | `src/csvExport.ts` `quoteCsv`, `createCsv`. | Uspešno; glej poročilo. |
| R07 | Natančni CRLF; notranji prelomi ohranjeni. | Agentni natančni CSV z večvrstičnim opisom. | `src/csvExport.ts` `createCsv`. | Uspešno; glej poročilo. |
| R08 | Nevtralizacija po začetnih presledkih/tabulatorjih/CR/LF. | D03; agentni natančni CSV. | `src/csvExport.ts` `quoteCsv`. | Uspešno; glej poročilo. |
| R09 | Vrednosti ostanejo izvorne, razen formul. | Agentni natančni CSV; D03. | `src/csvExport.ts` uporabi `task[key]`. | Uspešno; glej poročilo. |
| R10 | Nastavitve ostanejo enake v tabeli in tabli. | D04; agentna primerjava ob preklopu v obe smeri. | `src/App.tsx` `CsvExportControls` ostane v `ProjectView`. | Uspešno; glej poročilo. |
| R11 | Projekt/reload resetira; izvoz bere aktualne vrednosti. | Agentna zaporedna izvoza, navigacija in reload. | `src/App.tsx` privzeti `useState`; `key={project.id}`. | Uspešno; glej poročilo. |
| R12 | Brez zapisov, odzivne kontrole. | D04; agentni API zapis in širina 390 px. | `src/csvExport.ts` lokalni Blob; `src/styles.css` kontrole. | Uspešno; glej poročilo. |

### Kratek zapis popravkov specifikacije

- 2026-09-27: zapis vzorca formule je popravljen, da prikazuje dejanske
  enojne ubežne znake `\t`, `\r` in `\n`; začasna tabela sledljivosti je
  zamenjana s povezavo vsake zahteve na kodo in preverjanja. Zahteve se niso
  spremenile.

## Odprta vprašanja in omejitve

Specifikacija sledi izrecno določenemu CSV okviru in obsegu podatkov v nalogi.
Prazno polje se izvozi kot `""`; notranji prelomi se ohranijo znotraj
narekovajev. Prenos se sproži prek brskalniškega `Blob` in začasne povezave.
Ni zahteve po trajni shrambi nastavitev, zato se te ne shranjujejo v URL ali
brskalnik. Končnih zasebnih testov ni mogoče predvideti; robne primere iz
opisanega podatkovnega obsega je treba preveriti z lastnimi podatki.
