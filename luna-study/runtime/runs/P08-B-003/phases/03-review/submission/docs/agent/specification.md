# Koledarski pregled rokov — specifikacija

## Problem in kontekst

Začetni Folio omogoča izbiro projekta, iskanje in preklop med tabelo ter tablo. Dodati je treba lokalni pregled opravil izbranega projekta po roku, s fiksnim začetnim referenčnim datumom 2026-09-21. Projektni podatki ostanejo vir resnice prek obstoječega `/api/`; obstoječi slovenski vmesnik, pogledi in odzivnost se ohranijo.

## Vhodi, dejanja in izidi

Uporabijo se opravila trenutnega projekta iz `/api/projects/{id}/tasks` s polji `id`, `projectId`, `title`, `description`, `status`, `assignee`, `dueDate` iz `shared/types.ts`; `status` je `todo | in_progress | done`, `dueDate` pa veljaven `YYYY-MM-DD`. Izbor in nalaganje projekta sledita obstoječemu vmesniku. Lokalna kontrola `input[type=date]` (»Referenčni datum«) sprejme veljaven koledarski datum. `select` (»Pogled rokov«) izbira `all`, `overdue`, `today`, `week`, `later` ali `done`. Kontrole zgolj filtrirajo prikaz in ne spreminjajo opravil. Prazen datum opozori, zadnji veljavni izračun pa ohrani. Menjava projekta in ponovni začetek strani vrneta datum na 2026-09-21 ter izbor na `all`.

## Zahteve in pravila

Naj bo `D` veljaven referenčni datum, `due(t)` veljaven koledarski rok opravila, `status(t)` njegovo stanje, `P` opravila trenutnega projekta v izvornem vrstnem redu. Koledarski izračuni uporabljajo datumske komponente, ne lokalnega časa. Za odprta opravila so skupine:

* `overdue`: `status(t) != done && due(t) < D`
* `today`: `status(t) != done && due(t) = D`
* `week`: `status(t) != done && D < due(t) <= D + 7 koledarskih dni`
* `later`: `status(t) != done && due(t) > D + 7 koledarskih dni`
* `done`: `status(t) = done`, ne glede na rok.

Iti čez dneve pomeni koledarski dodatek, vključno z mesec/leto in prestopnim letom. Skupine so disjunktne in pokrivajo `P`. `all` prikaže vse; sicer izbrana skupina prikaže svoje opravila v izvornem vrstnem redu. Števci se vedno izračunajo iz celotnega `P`, ne iz filtriranega seznama. Isti filtrirani ID-ji se uporabijo v tabeli in tabli. Stanje filtra/datuma ni v URL-ju ali trajni shrambi.

| Zahteva | Pravilo oziroma sprejemni pogoj | Način preverjanja |
| --- | --- | --- |
| R01 | Ob začetku projekta je datum izrecno `2026-09-21`, skupina `all`; ne uporabi se sistemska ura. | Pregled inicializacije; test začetnih vrednosti |
| R02 | Vsako opravilo s `status=done` je samo v `done`, ne v odprtih skupinah. | Predikat zgoraj; opravljeno opravilo z rokom pred/sedaj/po `D` |
| R03 | Odprto opravilo z rokom `< D` je `overdue`, z rokom `= D` pa `today`. | Mejni datumi pred in na `D` |
| R04 | Za odprto opravilo je `week` pogoj `D < due <= D+7`; `later` je `due > D+7`. Skupine so disjunktne in pokrijejo vsa opravila. | Preveriti `D+1`, `D+7`, `D+8` in pripadnost vsakega ID-ja natanko eni skupini |
| R05 | Datum je `YYYY-MM-DD`; primerjave in dodajanje dni so koledarski, neodvisni od časovnega pasu/DST ter pravilni čez mesece, leta in prestopni februar. | Datumi na mejah in pregled metode za datum brez zamika časovnega pasu |
| R06 | Števci `overdue/today/week/later/done` so velikosti skupin iz celotnega `P`, tudi ko je aktiven ožji filter. | Primerjava vseh petih števil in filtrov |
| R07 | Izbirnik `all/overdue/today/week/later/done` prikaže ustrezno skupino v izvornem vrstnem redu; ne zapiše datuma ali statusa opravila. | Izbor vsake možnosti, vrstni red ID-jev ter preverba brez zapisovalnega API-ja |
| R08 | Veljavni vnos takoj preračuna števce in vrstice ter ohrani skupino. Prazen vnos pokaže `role=alert` »Vnesi veljaven referenčni datum.« in ohrani zadnji veljavni izračun; veljaven vnos alert odstrani. | Sprememba datuma pri ožjem filtru; prazen in nato veljaven vnos |
| R09 | Tabela in tabla kažeta isti seznam ID-jev; preklop ohrani veljavni referenčni datum, trenutno besedilo datuma in skupino. | Preklop pogledov pred/po urejanju datuma |
| R10 | Menjava projekta in osvežitev ponastavita datum/skupino na R01. Filter nima trajne ali URL-shrambe. | Menjava projekta, osvežitev, pregled URL/shrambe |
| R11 | Prazen `P` da pet ničel. Prazen izbran pogled pri nepraznem `P` prikaže »Ni opravil v izbrani skupini.« in omogoči izbiro druge skupine ali `all`. | Prazen projekt ter prazna skupina z možnostjo okrevanja |
| R12 | Podatki imajo veljavne koledarske `YYYY-MM-DD` datume (vključno s prestopnimi). Pregled ne kliče zapisov API; obstoječa polja in bralne podrobnosti ostanejo, Folio odzivnost se ohrani. | Pregled tipov/API-klicev; testi brez sprememb zapisa; pregled pri širini 390 px |

Skupni dostopnostni pogoji: pet števcev ima `aria-label="Število rokov <ključ>"` in samo številsko vrednost; imena skupin so »Zapadlo«, »Danes«, »Naslednjih 7 dni«, »Pozneje«, »Končano«. Ohranijo se `data-task-id`, obstoječa dostopna imena pogledov in stolpcev ter `aria-label="Pregled stanj opravil"`. Morebitna nova dejanja so zunaj povezave opravila. Pri širini 390 px se stran kot celota ne razširi; tabela/tabla smeta notranje drseti.

## Izvedba in sledljivost

Obstoječe vstopne točke so `src/App.tsx` (nalaganje prek `useResource`, števec stanj, vrstična preglednica, hash preklop pogledov in ključ `project.id`), `src/TaskBoard.tsx` (kartice, stolpci in `data-task-id`), `src/navigation.ts` (hash vsebuje samo projekt/opravilo/pogled), `src/formatDate.ts` (prikaz že uporablja UTC), `src/styles.css` (Folio in notranje drsenje) ter tipi `shared/types.ts`. Sprememba naj ostane v dovoljenih UI-datotekah; tipi/API se ne spreminjajo.

| Zahteva | Pogoj | Test ali scenarij | Datoteka in del kode | Izid ter dokaz |
| --- | --- | --- | --- | --- |
| R01 | Fiksno začetno stanje `2026-09-21` / `all`; brez sistemske ure. | D01 preverja začetni datum; preveriti tudi skupino in ponastavitev. | `App.tsx`: projektni lokalni filter; `useResource.ts`: ponovni nalag | D01 delni; ta faza ni izvajala testov |
| R02 | `done` ne glede na rok; nikjer drugje. | D04 preverja skupino done; dodati roke pred/na/po D. | `App.tsx`: razvrstitev opravil | D04 delni; testov ni poganjal avtor specifikacije |
| R03 | Odprto `<D` → `overdue`; `=D` → `today`. | D01; dodati rok točno `D`. | `App.tsx`: razvrstitev | D01 preverja `overdue`; `today` še nepreverjen |
| R04 | `D<due<=D+7` → `week`; `>D+7` → `later`; popolna disjunktna particija. | D02 preverja rob `D+7`; dodati `D+1`, `D+8`, izključnost in pokritost. | `App.tsx`: koledarska aritmetika/filtriranje | D02 delni; ostalo nepreverjeno |
| R05 | `D+7` je koledarski dodatek, tudi ob prehodih meseca, leta in prestopnega februarja; primerjava validnih ISO datumov. | Testi prehodov meseca/leap-year; pregled algoritma. | `App.tsx`/namenski datumski pripomoček; `formatDate.ts` je samo prikaz | Ni zajeto z D01–D04; ni izvedeno |
| R06 | Števci so vsi iz celotnega `P`, ne iz vidnega filtra. | D02 preverja le `week`; dodati pet skupin in filtre. | `App.tsx`: števec `aria-label="Pregled stanj opravil"` | D02 delni; ni izvedeno |
| R07 | Izbor skupine ohrani vrstni red in ne spreminja podatkov. | D01–D04 pokrijejo nekaj izbir; preveriti vse možnosti/vrstni red in brez zapisov. | `App.tsx`: `select` in skupni filtrirani `tasks` | Delno posredno; brez zagona |
| R08 | Veljaven vnos takoj prerazvrsti, filter ostane; prazen vnos alert in zadnji veljavni rezultat; veljaven vnos alert odstrani. | D03 preverja prazno in naslednji veljaven datum pri filtru overdue. | `App.tsx`: ločeno besedilo vnosa/veljavni datum | D03 pokriva osnovni primer; brez zagona |
| R09 | Ista filtrirana ID-zbirka v obeh pogledih; preklop ohrani datum, draft in skupino. | D04 preklopi na tablo; dodati povratni preklop po urejanju. | `App.tsx`, `TaskBoard.tsx`, `navigation.ts` | D04 delni; ohranitev stanja nepreverjena |
| R10 | Menjava projekta ali reload nastavi R01; filter ni v shrambi/URL. | Preklop projekta, `page.reload()`, pregled URL/shrambe. | `App.tsx`: `key={project.id}`; `navigation.ts` | Ni med D01–D04; ni izvedeno |
| R11 | Prazen `P`: pet ničel; prazna skupina: zahtevano sporočilo in delujoč izbor. | Prazen projekt ter neprazen projekt s prazno skupino. | `App.tsx`: prazni stanji | Ni med D01–D04; ni izvedeno |
| R12 | Veljavni podatkovni datumi; brez API zapisov; polja/podrobnosti ostanejo; odzivnost Folio. | D04 prek `readonly` preveri zapise in širino strani; dodati/pregledati preostale scenarije. | `shared/types.ts`, `App.tsx`, `TaskBoard.tsx`, `TaskDetails.tsx`, `styles.css` | D04 delno; ni zagnano; druga polja/podrobnosti niso preverjene |

`tests/development/P08.spec.ts` vsebuje imenovane primere D01–D04; `tests/development/helpers.ts` določa testne GET odgovore in `readonly` kontrolo. Navedbe zgoraj opisujejo obstoječe primere, ne dokaz uspeha: avtor specifikacije aplikacije ni zagnal, končni testi niso dostopni. Implementer naj izvede dosegljive skupne in razvojne teste ter doda lastne teste v `tests/agent/`; nedostopnih končnih primerov naj ne označi kot opravljenih.

## Odprta vprašanja in omejitve

Nove domenske predpostavke niso potrebne. Vsi podatkovni datumi so po zahtevah veljavni in kanonično zapisani, zato se validirani `YYYY-MM-DD` lahko primerjajo koledarsko; vsako stanje razen `done` je odprto. `formatDate.ts` že formatira datum s časovnim pasom UTC, vendar samo to še ne dokaže pravilne aritmetike rokov. Razvojni testi so podmnožica; mejne koledarske datume, prazne podatke, ohranitev obeh stanj ob preklopu in ponastavitve je treba dodatno preveriti. Končni testi te naloge v tej fazi niso dostopni ali izvedeni.
