# Razvojna specifikacija: koledarski pregled rokov

## Problem in kontekst

Uporabnik potrebuje pregled rokov opravil v izbranem projektu. Začetni Folio že prikazuje opravila v preglednici in tabli; sprememba doda koledarsko razvrstitev in filtre ob ohranitvi potrjenega videza Folio, slovenskih poimenovanj ter obstoječega API-ja. Projekt in podatki o opravilih se še naprej izbirajo iz aplikacije. Začetni pogled rokov je `all`, referenčni datum pa je ob vsakem začetku projekta določen kot `2026-09-21`.

## Vhodi, dejanja in izidi

- Podatki: `Project { id: string, name: string }` in `Task { id: string, projectId: string, title: string, description: string, status: 'todo' | 'in_progress' | 'done', assignee: string, dueDate: string }` iz `shared/types.ts`. `dueDate` je obvezno polje, podatki naloge pa določajo veljavno obliko `YYYY-MM-DD`; ID je identiteta opravila in naslovi niso nujno enolični.
- `ProjectView` v `src/App.tsx` naloži opravila trenutnega projekta prek `useResource` in javnega GET `/api/projects/:id/tasks`. `TaskBoard` že razporedi opravila po stanju; preglednica in kartice že ohranjajo `data-task-id`. Obstoječi `ProjectView key={project.id}` ponastavi njegovo lokalno stanje ob menjavi projekta. Pregled rokov naj izhaja iz istega niza `tasks`.
- Kontrole: datum z oznako `Referenčni datum` (`input type=date`) ter seznam `Pogled rokov` (`all`, `overdue`, `today`, `week`, `later`, `done`).
- Datum se sprejme le, če je veljaven koledarski datum `YYYY-MM-DD`. Prazen vnos pokaže opozorilo in ohrani zadnji veljavni izračun. Nov veljaven datum takoj posodobi skupine; pogled ostane izbran.
- Preklop med preglednico in tablo ohrani datum v polju in filter. Menjava projekta in osvežitev vrneta datum ter filter na začetni vrednosti. Filter se ne zapisuje trajno ali v URL.
- Pregled je samo bralen: ne spreminja opravil, ne pošilja zapisov na API in ne uporablja testnih kontrol.

## Zahteve in pravila

Naj bo `D` referenčni koledarski datum, `due(t)` niz `t.dueDate`, `done(t)` pa resničen natanko kadar je `t.status === 'done'`. Veljavni `YYYY-MM-DD` nizi so koledarsko urejeni; `D + n` pomeni koledarski zamik za `n` dni, brez odvisnosti od ure ali časovnega pasu. Skupine so:

```text
group(t, D) = done                         če done(t)
              overdue                     če !done(t) in due(t) < D
              today                       če !done(t) in due(t) = D
              week                        če !done(t) in D < due(t) <= D + 7
              later                       če !done(t) in due(t) > D + 7
```

Rok je veljaven datum za vsako opravilo; pravila mejnikov vključujejo mesec, leto in prestopni februar. `all` vključuje vsako opravilo enkrat. Izbirnik skupine filtrira samo prikaz; ne spremeni vira ali skupin. Preglednica ohrani vrstni red odgovora API, tabla pa ga ohrani znotraj obstoječih statusnih stolpcev.

| Zahteva | Pravilo oziroma sprejemni pogoj | Način preverjanja |
| --- | --- | --- |
| R01 | Ob začetku projekta `D = 2026-09-21`; izbrani filter je `all`, ne trenutni datum sistema. | Odpri/ponovno naloži projekt ter preveri datum in filter. |
| R02 | `done(t)` pomeni, da je `group(t,D)=done`, ne glede na rok; zaključeno opravilo ne pripada nobeni odprti skupini. | Opravilo `done` z rokom pred, na in po `D`. |
| R03 | Za odprto opravilo: `due(t)<D` pomeni `overdue`; `due(t)=D` pomeni `today`. | Preveri oba robna datuma. |
| R04 | Za odprto opravilo: `D<due(t)<=D+7` pomeni `week`; `due(t)>D+7` pomeni `later`. Vsako opravilo je v natanko eni skupini. | Preveri `D+1`, `D+7`, `D+8` ter popolno, disjunktno razdelitev. |
| R05 | Datumska primerjava in prištevanje dni uporabljata koledarske `YYYY-MM-DD`, ne časovnega pasu ali DST. | Preveri prehode meseca, leta in prestopnega februarja. |
| R06 | Pet števcev `overdue/today/week/later/done` šteje celoten trenutni projekt in se ne spreminja ob izbiri filtra. Vsak ima `aria-label="Število rokov <ključ>"` in samo številsko vrednost. | Primerjaj števce z opravili vsake skupine pred in po filtru; razvojni D02 preveri števec `week`. |
| R07 | `all/overdue/today/week/later/done` prikaže ustrezen podnabor v izvornem vrstnem redu; izbor ne spreminja datumov ali statusov. | Preveri vse vrednosti, zaporedje in nespremenjene podatke. |
| R08 | Veljaven `D` takoj preračuna števce in vrstice ob ohranitvi izbranega filtra. Prazno polje prikaže `role="alert"` z besedilom `Vnesi veljaven referenčni datum.`, vendar obdrži zadnji veljavni prikaz. Naslednji veljavni datum odstrani opozorilo. | Vnesi veljaven, prazen in nato veljaven datum. |
| R09 | Preglednica in tabla kažeta ista filtrirana opravila, določena po ID-jih. Preklop pogleda ohrani izbrani `D`, trenutno besedilo datuma in filter. | Primerjaj ID-je v obeh pogledih; razvojni D04 preverja filter `done` na tabli. |
| R10 | Menjava projekta in osvežitev ponastavita `D` na `2026-09-21` ter filter na `all`. Datum/filter nista v trajni shrambi ali URL-ju. | Zamenjaj projekt, osveži in preveri URL/shrambo. |
| R11 | Prazen projekt ima pet ničel. Če projekt ni prazen, a izbrana skupina nima opravil, se pokaže `Ni opravil v izbrani skupini.`; uporabnik lahko izbere drugo skupino ali `all`. | Preveri prazen projekt in prazno filtrirano skupino. |
| R12 | Datumi so veljavni koledarski `YYYY-MM-DD`, tudi prestopni. Pregled je samo bralen: ne pošilja zapisov na API in ne spremeni polj ali bralnih podrobnosti. Folio ostane prilagodljiv; pri širini 390 px stran ne sme imeti vodoravnega razširitvenega preliva, notranje drsenje vsebin je dovoljeno. | Preveri koledarske robove, odsotnost zapisovalnih zahtev/stanja, obstoječe poglede in širino 390 px; razvojni D04 preverja odsotnost zapisov. |

Imena skupin za prikaz so `Zapadlo`, `Danes`, `Naslednjih 7 dni`, `Pozneje` in `Končano`. Obdrži `data-task-id` na vrsticah in karticah, obstoječa dostopna imena pogledov in stolpcev ter `aria-label="Pregled stanj opravil"`. Novi kontrolniki opravila, če bi bili potrebni, morajo biti zunaj povezave opravila; sam pregled rokov ne uvaja zapisovalnih dejanj.

## Izvedba in sledljivost

Izhodišče: `shared/types.ts` določa zgornja polja; `src/App.tsx` vsebuje `ProjectView`, GET nalaganje, preklop pogledov, tabelo in `data-task-id`; `src/TaskBoard.tsx` vsebuje stolpce table in kartice; `src/navigation.ts` hrani samo pot/projekt/pogled v hash-u; `src/formatDate.ts` že formatira datume v UTC; `src/styles.css` že omogoča notranje drsenje `.table-scroll` in `.board-scroll` ter premik navigacije pri 760 px. Predvidena razširitev je v uporabniškem vmesniku `src/`, brez spremembe skupnih tipov, API-ja ali infrastrukture.

Razvojni `tests/development/P08.spec.ts` vsebuje D01 (fiksni datum/overdue), D02 (vključno `D+7`), D03 (prazen vnos in ohranitev izračuna) ter D04 (done, tabla, brez zapisov). To so razpoložljivi scenariji, ne rezultati tega pregleda. Ostali robni pogoji v spodnji tabeli so sprejemni scenariji za implementerja.

| Zahteva | Pogoj | Test ali scenarij | Datoteka in del kode | Izid ter dokaz |
| --- | --- | --- | --- | --- |
| R01 | Začetni lokalni datum/filter. | D01; ponovni zagon projekta. | `src/App.tsx` `ProjectView`; `src/navigation.ts` | Test ni izveden v vlogi avtorja. |
| R02 | Zaključeno opravilo vedno `done`. | D04; zaključeno opravilo z roki na obeh straneh `D`. | `src/App.tsx`; `src/TaskBoard.tsx`; klasifikacija v `src/` | Test ni izveden. |
| R03 | Odprto `<D` je overdue, `=D` today. | D01; primerjaj `D-1`, `D`. | Klasifikacija v `src/`; `src/App.tsx` | Test ni izveden. |
| R04 | Odprto `(D,D+7]` week; `>D+7` later; particija je popolna in disjunktna. | D02; `D+1`, `D+7`, `D+8`; števec week. | Klasifikacija v `src/`; `src/App.tsx` | Test ni izveden. |
| R05 | Koledarska aritmetika neodvisna od pasu/DST. | Prehodi meseca, leta in 29. februar. | Klasifikacija v `src/`; `src/formatDate.ts` je le prikaz | Test ni izveden. |
| R06 | Števci so za celoten projekt in dostopno poimenovani. | D02; filtriraj in primerjaj vseh pet števcev. | `src/App.tsx` `summary-grid` | Test ni izveden. |
| R07 | Filter ohrani vrstni red vira in ne spreminja opravil. | D01/D04; vse možnosti filtra; primerjaj podatke. | `src/App.tsx`; `src/TaskBoard.tsx` | Test ni izveden. |
| R08 | Veljaven datum preračuna, prazen ohrani zadnji izračun in pokaže opozorilo. | D03; po izpraznitvi vnesi nov veljaven datum. | `src/App.tsx`; klasifikacija v `src/` | Test ni izveden. |
| R09 | Enaki ID-ji v pogledih; preklop ohrani datum/filter. | D04; primerjaj tabelo in tablo ob preklopu. | `src/App.tsx` `view-switch`; `src/TaskBoard.tsx` | Test ni izveden. |
| R10 | Menjava projekta/osvežitev povrneta privzeti datum/filter; brez trajne shrambe/URL-ja. | Menjaj projekt, osveži, preglej URL in shrambo. | `src/App.tsx` `key={project.id}`; `src/navigation.ts` | Test ni izveden. |
| R11 | Prazen projekt: pet ničel; prazna izbrana skupina ima točno določeno sporočilo. | Podatkovni nizi `[]` ter neprazen projekt z eno prazno skupino. | `src/App.tsx`; `src/TaskBoard.tsx` | Test ni izveden. |
| R12 | Veljavni datumi; bralno vedenje, ohranjen Folio in odzivnost 390 px. | D04; API zapisovalne zahteve, podrobnosti, ozka širina. | `src/App.tsx`; `src/TaskBoard.tsx`; `src/styles.css`; `src/TaskDetails.tsx` | Test ni izveden. |

## Odprta vprašanja in omejitve

- Sprejeti tipi predpostavljajo veljaven koledarski `dueDate`; obravnava manjkajočih/neveljavnih datumov v odzivih API ni določena z domeno naloge. Ne zamenjaj veljavnosti s samo regex obliko: 29. februar je odvisen od leta.
- V tej vlogi se aplikacije in testov ne zaganja, zato ni dokazov o implementaciji ali končnih regresijskih testih. Razvojni/končni API odgovori lahko vsebujejo nič, eno ali poljubno mnogo opravil, poljubne enkratne ID-je in enake naslove; uporabi pripadnost skupini in ID-je, ne naslovov ali fiksnega števila vrstic. Tabla naravno razvršča kartice po statusnih stolpcih; v vsakem stolpcu naj ostane vrstni red iz odgovora.
