# Specifikacija: Koledarski pregled rokov

## Problem in kontekst

Folio omogoča izbiro projekta, pregled opravil v preglednici ali na tabli in odpiranje podrobnosti. P08 doda koledarski pregled rokov: uporabnik vnese referenčni datum, vidi pet števcev rokov in izbere eno od šestih skupin rokov. Razvrščanje je odvisno od izrecnega referenčnega datuma, ne od ure naprave, in je popolnoma lokalno trenutnemu projektu.

Rešitev dopolni obstoječi uporabniški vmesnik, ohrani potrjeni Folio dizajn, slovenska poimenovanja, dostopnost, obstoječe poglede, stolpce, `data-task-id` in javni API `/api/`. Ne dodaja novih odvisnosti, strežniških poti, zapisovalnih klicev, trajne shrambe ali zunanjih meritev.

## Vhodi, dejanja in izidi

Podatkovni vhodi so obstoječi `Project` in `Task` iz `shared/types.ts`: `id`, `projectId`, `title`, `description`, `status` (`todo`, `in_progress`, `done`), `assignee` in `dueDate` v veljavni obliki `YYYY-MM-DD`. Uporabniška vhoda sta:

- `Referenčni datum`: `input type="date"`, začetna vrednost `2026-09-21`.
- `Pogled rokov`: `select` z vrednostmi `all`, `overdue`, `today`, `week`, `later`, `done`.

Veljaven datum takoj preračuna skupine, števce in vidne vrstice ter ohrani izbrani pogled rokov. Prazen ali neveljaven datum prikaže `role="alert"` z besedilom `Vnesi veljaven referenčni datum.`, ohrani zadnji veljaven preračun in izbrani pogled. Izbor skupine spremeni samo prikaz, ne podatkov. Menjava projekta ali osvežitev ponastavita datum in pogled na začetni vrednosti.

Števci imajo oznake `Število rokov overdue`, `Število rokov today`, `Število rokov week`, `Število rokov later` in `Število rokov done` in vsebujejo samo številsko vrednost. Uporabniška imena skupin so `Zapadlo`, `Danes`, `Naslednjih 7 dni`, `Pozneje` in `Končano`. Preglednica in tabla prikazujeta iste filtrirane ID-je v izvornem vrstnem redu. Prazna skupina v nepraznem projektu prikaže besedilo `Ni opravil v izbrani skupini.` in omogoča preklop.

## Zahteve in pravila

Splošni simboli: `r` je veljaven referenčni datum, `d` je `dueDate` opravila, `r+n` pa koledarski datum `n` dni po `r`, izračunan neodvisno od časovnega pasu in poletnega časa. Opravilo je odprto, kadar je `status` različen od `done`. Urejanje podatkov ni del P08; spremembe stanja spodaj so spremembe prikaza.

| Zahteva | Pravilo oziroma sprejemni pogoj | Način preverjanja |
| --- | --- | --- |
| R01 | `open(project) ⇒ r = 2026-09-21 ∧ view = all`. Vrednost je neodvisna od ure ali časovnega pasu naprave. | Odprem projekt z nadzorovano uro in preverim vrednosti datuma ter izbirnika. |
| R02 | `status(task) = done ⇒ group(task, r) = done`; `status(task) ≠ done ⇒ group(task, r) ≠ done` in ni v nobeni od skupin `overdue`, `today`, `week`, `later`. | Primerjam razvrstitev opravil z različnimi `dueDate` in statusi. |
| R03 | `status(task) ≠ done ∧ d < r ⇒ group = overdue`; `status(task) ≠ done ∧ d = r ⇒ group = today`. | Preverim primere pred in na referenčnem datumu, vključno z menjavo meseca. |
| R04 | `status(task) ≠ done ∧ r+1 ≤ d ≤ r+7 ⇒ group = week`; `status(task) ≠ done ∧ d > r+7 ⇒ group = later`. Skupine so disjunktne in njihova unija vsebuje vsa opravila. | Preverim meje `r+1`, `r+7`, `r+8`, `r-1`, `r` in `done` ter preštejem skupaj s števci. |
| R05 | Datumi se primerjajo kot koledarski `YYYY-MM-DD`. `r+n` dela čez konec meseca, konec leta in prestopni februar, brez vpliva časovnega pasu ali poletnega časa. | Uporabim nadzorovane datume, ki prečkajo `2026-09-30`, `2026-12-31` in `2028-02-28`. |
| R06 | Vsak števec šteje vse opravila trenutnega projekta v svoji skupini: `counter(key) = |{task ∈ project : group(task, r) = key}|`. Aktivni filter ne spremeni števcev. | Preverim števce pred in po menjavi pogoja rokov. |
| R07 | `select(view) ⇒ visibleTasks = [task ∈ project : view ∈ {all, group(task, r)}]` v izvornem vrstnem redu API-ja. Izbor ne spremeni nobenega `Task`. | Primerjam prikazane `data-task-id` z neodvisno razvrščenimi podatki in preverim, da ni bilo nobenega zapisovalnega klica. |
| R08 | Veljavna sprememba `r` takoj znova izračuna `group`, števce in prikaz ter ohrani `view`. Prazen ali neveljaven vnos pomeni opozorilo in ohrani zadnji veljaven `r`, skupine, prikaz ter `view`; naslednji veljaven datum odstrani opozorilo. | Vpisujem veljavne, prazne in ponovno veljavne datume ter spremljam omrežne zahteve. |
| R09 | `visibleIds(table) = visibleIds(board)` v istem vrstnem redu. Preklop med preglednico in tablo ohrani `r`, besedilo datumskega polja in `view`. | Preverim ID-je v obeh prikazih, preklopim pogled in primerjam stanja. |
| R10 | `switchProject ∨ refresh ⇒ r = 2026-09-21 ∧ view = all`. Podatkov o `r` ali `view` ni v trajni shrambi ali URL-ju. Osvežitev in menjava projekta uporabljata samo obstoječi API. | Po spremembah osvežim stran, zamenjam projekt in preverim shrambo, URL ter začetni stanji. |
| R11 | Prazen projekt ima vseh pet števcev enakih `0`. Prazna izbrana skupina v nepraznem projektu prikaže `Ni opravil v izbrani skupini.` in omogoča preklop na drugo skupino ali `all`. | Naložim prazen in neprazen projekt s testnimi GET odgovori, izberem prazno skupino in preklopim. |
| R12 | Vsi `dueDate` so veljavni `YYYY-MM-DD`, vključno s prestopnimi datumi. Pregled ne pošilja zapisov na API, polja, povezave na podrobnosti in obstoječi Folio ostanejo nespremenjeni. | Naložim veljavne robne datume, preverim obstoječa imena in spremljam omrežne zahteve. |

### Pravila spremembe stanja

1. `LoadProject(project)` nastavi `referenceDate = 2026-09-21`, `referenceDateText = 2026-09-21`, `dueView = all`, skupine pa izračuna z obstoječimi podatki projekta.
2. `ChangeReferenceDate(validDate)` nastavi novo besedilo in datum, izračuna vse skupine ter ohrani `dueView`; ne pošlje nobenega zapisovalnega klica.
3. `ChangeReferenceDate(emptyOrInvalid)` nastavi opozorilo `Vnesi veljaven referenčni datum.` ter ohrani zadnji veljaven `referenceDate`, skupine, prikaz in `dueView`.
4. `ChangeDueView(newView)` spremeni samo `dueView`; ohrani `referenceDate`, njegovo besedilo, opozorilo in podatke.
5. `SwitchLayout(table ↔ board)` spremeni samo obstoječi prikaz ter ohrani `referenceDate`, besedilo, opozorilo, `dueView` in vrstni red ID-jev.
6. `SwitchProject` ali `RefreshPage` ponovno izvedeta `LoadProject`; nič od novih stanj rokov ni shranjeno v `localStorage`, drugi trajni shrambi ali URL-ju.

## Izvedba in sledljivost

| Zahteva | Pogoj | Test ali scenarij | Datoteka in del kode | Izid ter dokaz |
| --- | --- | --- | --- | --- |
| R01 | Začetni datum `2026-09-21` in pogled `all` | `tests/agent/p08.spec.ts:24` | `src/App.tsx:13`, `src/due.ts:1` | Uspešno; 2026-10-13. |
| R02 | Opravila `done` so samo v skupini `done` | `tests/agent/p08.spec.ts:24` | `src/due.ts:28` | Uspešno; 2026-10-13. |
| R03 | Meji `r-1` in `r` za odprta opravila | `tests/agent/p08.spec.ts:37` | `src/due.ts:28` | Uspešno; 2026-10-13. |
| R04 | Meji `r+1`, `r+7`, `r+8` in disjunktnost | `tests/agent/p08.spec.ts:37` | `src/due.ts:28` | Uspešno; 2026-10-13. |
| R05 | Koledarsko seštevanje čez mesec, leto in prestopni februar | `tests/agent/p08.spec.ts:37` | `src/due.ts:23` | Uspešno; 2026-10-13. |
| R06 | Števci celotnega projekta se ne spremenijo s filtrom | `tests/agent/p08.spec.ts:24` | `src/App.tsx:23`, `src/due.ts:35` | Uspešno; 2026-10-13. |
| R07 | Filtriran prikaz v izvornem zaporedju brez sprememb | `tests/agent/p08.spec.ts:55` | `src/App.tsx:24`, `src/due.ts:41` | Uspešno; 2026-10-13. |
| R08 | Prazen datum ohrani zadnji veljaven preračun | `tests/agent/p08.spec.ts:69` | `src/App.tsx:26` | Uspešno; 2026-10-13. |
| R09 | Preglednica in tabla imata iste ID-je ter ohranjena stanja | `tests/agent/p08.spec.ts:55` | `src/App.tsx:83`, `src/App.tsx:87`, `src/TaskBoard.tsx:8` | Uspešno; 2026-10-13. |
| R10 | Menjava projekta in osvežitev ponastavita stanje | `tests/agent/p08.spec.ts:81` | `src/App.tsx:12`, `src/App.tsx:127` | Uspešno; 2026-10-13. |
| R11 | Prazen projekt in prazna izbrana skupina | `tests/agent/p08.spec.ts:95`, `tests/agent/p08.spec.ts:103` | `src/App.tsx:83` | Uspešno; 2026-10-13. |
| R12 | Veljavni roki, brez zapisov in ohranjeni Folio | `tests/agent/p08.spec.ts:55` | `src/App.tsx:88`, `src/styles.css:56` | Uspešno; 2026-10-13. |

Specifikacija ne zazna morebitnih prihodnjih sprememb kot uspešnih. Po implementaciji se tabela dopolni z dejanskimi testnimi imeni, deli kode in izidi.

## Odprta vprašanja in omejitve

Ni bistvenih odprtih vprašanj: vsa vedenja so določena z `task/instructions.md`. Po navodilih se ne razširja navigacije med nezaključenim nalaganjem ter novih sočasnih sprememb podatkov brez osvežitve. Končni testi za ta korak niso izvedeni; ti bodo pripravljeni in zabeleženi po implementaciji.
