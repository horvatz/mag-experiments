# Razvojna specifikacija: lokalni vrstni red z razveljavitvami

## Problem in kontekst

Aplikacija Folio prikazuje opravila iz izbranega projekta v preglednici ali tabli. Uporabnik mora začasno preurediti opravila, razveljaviti in ponoviti premike ter se vrniti na vrstni red, prejet za projekt. Vrstni red je lokalno stanje trenutnega projekta; API in polja opravil se ne spreminjajo. Obstoječi slovenski vmesnik in videz Folio ostaneta podlaga.

## Vhodi, dejanja in izidi

Tip `Project` v `shared/types.ts` ima `id` in `name`; `Task` ima `id`, `projectId`, `title`, `description`, `status` (`todo | in_progress | done`), `assignee` in `dueDate`. Seznam za projekt trenutno bere `ProjectView` v `src/App.tsx` prek `GET /api/projects/{id}/tasks`; podrobnosti bere `TaskDetails` prek `GET /api/tasks/{id}`. Identiteta je enkratni `id`; vrstni red je permutacija ID-jev iz izhodiščnega polja. Premik izbere opravilo in globalnega soseda, ne glede na pogled ali status. Dodatna dejanja so razveljavitev, ponovitev in povrnitev izhodiščnega vrstnega reda. Preklop pogleda in podrobnosti ohranita stanje; menjava projekta in osvežitev ga ponastavita. Neuspešna oziroma nedovoljena robna dejanja ne spremenijo vrstnega reda ali zgodovine.

Obseg podatkov: API lahko vrne 0, 1 ali poljubno več kot 10 opravil, z različnimi enkratnimi ID-ji, vrstnim redom in enakimi naslovi. Imena, naslovi in opisi so navadno besedilo, lahko vsebujejo Unicode in ločila; datumi so veljavni koledarski datumi. Imena odgovornih oseb so neprazna in niso `all`; opravilo pripada projektu iz svojega `projectId`. V UI uporabljati samo `/api/` in GET-e; ne uporabljati `/__test/`, `localStorage` ali zapisovalnega API-ja. Skupne tipe, strežnik, odvisnosti, infrastrukturo in razvojne teste pustiti nespremenjene.

Za vse vrstice izvorne zahteve R01–R12 velja: sprejemni pogoj je naveden spodaj, začetno preverjanje so razvojni testi/specifikacija; izvajalec naj v sledljivost dopolni dejansko ime izvedenega testa, kodo in izid. Do izvedbe so preverjanja neizvedena.

## Zahteve in pravila

Oznake: `O` je izvorna permutacija ID-jev za trenutni projekt; `C` trenutna permutacija; `U` sklad prejšnjih permutacij za razveljavitev (največ 20); `R` sklad razveljavljenih permutacij za ponovitev. `|X|` je dolžina sklada, `last20(X)` pa zadnjih največ 20 stanj. Invarianta je `C` permutacija `O`, brez manjkajočih ali ponovljenih ID-jev. Za premik ID-ja na indeksu `i` je `j=i−1` (gor) ali `j=i+1` (dol). Če `0≤j<|C|`, zamenjaj `C[i]` in `C[j]`, nastavi `U'=last20(U ⧺ [C])`, `R'=[]`; sicer vse ostane nespremenjeno. Razveljavi, kadar `U≠[]`: `C'=last(U)`, `U'=init(U)`, `R'=R ⧺ [C]`. Ponovi, kadar `R≠[]`: `C'=last(R)`, `R'=init(R)`, `U'=last20(U ⧺ [C])`. Povrnitev, kadar `C≠O`, uporabi `C'=O`, `U'=last20(U ⧺ [C])`, `R'=[]`. Neomenjene sklade in permutacije akcija pusti nespremenjene.

| Zahteva | Pravilo oziroma sprejemni pogoj | Način preverjanja |
| --- | --- | --- |
| R01 | Začetno `C = O`; vsako opravilo dobi globalno mesto `index(C,id)+1` z `aria-label="Mesto opravila <id>"`. Enaki naslovi se ločijo po `id`. | Različen vrstni red ID-jev z enakima naslovoma; preveriti mesto v tabeli in tabli. |
| R02 | Veljaven gor/dol izvede opisano sosednjo zamenjavo; vsa polja Task, tudi `status`, ostanejo enaka. Gumba `Premakni <id> gor` in `Premakni <id> dol` sta ločena od povezave opravila. | Preveriti oba smera, soseda in polja po ID-ju. |
| R03 | Gor pri `i=0` in dol pri `i=|C|−1` sta onemogočena; neveljaven/stalen ali ponovljen robni poskus ne spremeni `C`, `U` ali `R`. | Preveriti oba roba in enak števec zgodovine pred/po. |
| R04 | Veljaven premik doda prejšnji `C` v `U`; razveljavitev uporabi zgornjo prehodno funkcijo. | Primerjati permutacije pred/po premiku in razveljavitvi. |
| R05 | Ponovitev uporabi zgornjo prehodno funkcijo; večstopenjske operacije ohranijo `set(C)=set(O)` brez podvajanj. | Več razveljavitev, nato enako število ponovitev. |
| R06 | Nov veljaven premik izprazni `R`; nedovoljen premik ga ne izprazni. | Po razveljavitvi preveriti veljaven premik in robni poskus. |
| R07 | `|U|≤20`; pri 21. veljavnem premiku odstraniti najstarejši element. Veljavni razveljavljeni koraki ostanejo ponovljivi. | 21+ premikov, nato razveljavi/ponovi razpoložljive korake. |
| R08 | Povrnitev na `O` je eno razveljavljivo dejanje in izprazni `R`; če `C = O`, je gumb onemogočen in oba sklada ostaneta ista. | Preveriti povrnitev z `C≠O` ter stanje `C=O` z zgodovino. |
| R09 | Preglednica kaže globalni vrstni red; tabla filtrira `C` v stalne stolpce `todo`, `in_progress`, `done`, zato ohrani relativni vrstni red. Premik tudi na tabli uporabi globalnega soseda in ne spremeni statusa. | Enaka zaporedja v obeh pogledih; premik čez stolpca. |
| R10 | Pogled in odprtje/zaprtje podrobnosti ne spremenijo `C`, `U`, `R`. Menjava projekta in osvežitev nastavita stanje na `O` projekta. Brez trajne shrambe. | Preklop pogleda, odpri/zapri podrobnosti, drug projekt in osvežitev. |
| R11 | `role=status`, `aria-label="Zgodovina vrstnega reda"` kaže `Razveljavitve: |U|. Ponovitve: |R|.`; gumba Razveljavi/Ponovi sta onemogočena pri ničli. Prazen/enoelementni projekt nima dovoljenega premika. | Preveriti besedilo, atribute in `n=0,1`. |
| R12 | Vedno velja permutacija ID-jev `O`; noben API zapis ali sprememba polj. Števci stanj in podrobnosti ostanejo pravilni. Pri 390 px se stran ne razširi; notranje drsenje preglednice/table je dovoljeno. | Pred/po primerjati API, polja, števce in podrobnosti; pregled pri 390 px. |

## Izvedba in sledljivost

| Zahteva | Pogoj | Test ali scenarij | Datoteka in del kode | Izid ter dokaz |
| --- | --- | --- | --- | --- |
| R01 | Začetna `C=O`; globalno mesto po `id`. | Začetno nalaganje s poljubnim vrstnim redom/enakima naslovoma. | Podatki: `src/App.tsx::ProjectView`; vrste: `shared/types.ts::Task`. | Izvor prebran; sprememba in test še nista izvedena. |
| R02–R08, R11 | Zamenjave in skladovne prehode po zgornjih predikatih; statusni gumbi/števci. | Robovi, 0/1, večstopenjska zgodovina, meja 20, nov premik in povrnitev. | Cilj: `src/App.tsx::ProjectView`; vrstica/kartica: `src/App.tsx`, `src/TaskBoard.tsx`. | Izvorna struktura prebrana; implementacija/test neizvedena. |
| R09 | Globalni C, tablo filtrirati brez preurejanja znotraj posameznega stanja. | Isti C v preglednici/tabli; soseda v drugem stanju. | `src/App.tsx` (tabela), `src/TaskBoard.tsx` (`columns.map`, filtriranje po statusu). | Izvor prebran; test neizveden. |
| R10 | Stanje živi ob izbranem projektu; navigacija pogleda/podrobnosti ga ohrani. | Preklop pogleda, dialog, menjava projekta, osvežitev. | `src/App.tsx` (`key={project.id}`), `src/navigation.ts`, `src/TaskDetails.tsx`. | Izvor prebran; test neizveden. |
| R12 | Polja/GET podatki nespremenjeni, 390 px brez razširitve strani. | API brez zapisov, števci/podrobnosti, odzivni pregled. | `shared/types.ts::Task`, `src/App.tsx` (števci), `src/styles.css` (notranji drsniki in prelom pri 760 px). | Izvor prebran; test neizveden. |

## Odprta vprašanja in omejitve

Ta vloga ne izvaja aplikacije ali testov; vsi izidi zgoraj so zato neizvedeni. Med začetnim nalaganjem/napako ohrani obstoječa stanja nalaganja in ponovnega poskusa. Ne širi navigacije med nalaganjem ali sočasnih sprememb brez osvežitve prek obstoječih regresijskih zahtev. Pred implementacijo je treba ohraniti obstoječa dostopna imena pogledov in stolpcev ter `aria-label="Pregled stanj opravil"`. Kontroli premika naj imata imeni `Premakni <id> gor/dol` in sta zunaj povezave; mesto naj ima `aria-label="Mesto opravila <id>"` ter globalno število. Vmesnik zgodovine ima `role="status"`, `aria-label="Zgodovina vrstnega reda"`. Tabla ima obstoječi `role="region"`, `aria-label="Tabla opravil"`; vrstice in kartice ohranijo `data-task-id`. Specifikacija ne predpisuje notranje predstavitve skladov ali postavitve kontrol. Končni testi niso bili zagnani v vlogi avtorja.
