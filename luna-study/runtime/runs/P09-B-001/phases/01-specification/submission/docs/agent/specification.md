# Specifikacija: stanje pregleda v povezavi in zgodovini

## Problem in kontekst

Folio prikazuje projekte in njihove naloge v pogledih Preglednica in Tabla ter omogoča odpiranje podrobnosti naloge. Uporabnik naj filtrira in razvršča naloge, deli ta pogled prek URL-ja ter se vrača med potrjenimi pogledi z gumboma brskalnika. Sprememba mora ohraniti potrjeni videz in poimenovanja Folio, obstoječe nalaganje, podrobnosti in neznano pot. Zahteve naloge veljajo tudi, če jih ta specifikacija ne bi povzela.

## Vhodi, dejanja in izidi

- Vir so `Project {id,name}` ter `Task {id,projectId,title,description,status,assignee,dueDate}` iz `shared/types.ts`; `status` je `todo | in_progress | done`, ID-ji so nizi. Podatke beri prek obstoječih GET poti `/api/projects`, `/api/projects/:id/tasks` in `/api/tasks/:id`. Uporaba ne spreminja podatkov, ne kliče zapisovalnega API-ja in ne shranjuje pogleda v `localStorage`.
- Za obstoječo pot projekta ali naloge (`#/projects/:id` oziroma `#/projects/:id/tasks/:taskId`) so potrjeni filtri `q`, `status` (`all`, `todo`, `in_progress`, `done`) in `order` (`original`, `title-asc`, `title-desc`) v query delu fragmenta. Privzeta trojica je `('', 'all', 'original')`; `view=board` pomeni tablo, sicer velja obstoječi privzeti pogled. Napačen parameter ne prepreči nalaganja poti.
- Kontrole urejajo osnutek. Uporabi potrdi vse tri filtre z eno spremembo zgodovine; Ponastavi potrdi privzeto trojico. Vsaka navigacija zavrže osnutek. API napaka in nalaganje ohranita obstoječa prikaza, ponovni poskus ter upravljanje preklicane zahteve.

## Zahteve in pravila

Naj bo `N(s) = lower(remove[U+0300..U+036F](NFD(s)))`, `q* = N(trim(q))`. Za nalogo `t` je `match(t,q*)` resničen, če je `q*` prazen ali dobesedni podniz `N(t.title)`, `N(t.description)`, `N(t.assignee)` ali `N(t.id)`. Zunanje beline obreži pri q; podatkovnih polj ne obreži. Iskanje je po celi frazi in poljih; ne razčleni besed in ne izvaja regularnega izraza. `statusMatch` je vedno resničen pri `all`, sicer `t.status === status`. Prikazane naloge so tiste, za katere `match ∧ statusMatch` velja. Razvrščanje naslova uporablja `N(title)` in UTF-16; pri enakem naslovu ohrani izvorni vrstni red. `original` vedno ohrani vrstni red API-ja.

| Zahteva | Pravilo oziroma sprejemni pogoj | Način preverjanja |
| --- | --- | --- |
| R01 | Stanje se razbere iz `#/projects/:id?...` oziroma `#/projects/:id/tasks/:taskId?...`; privzete vrednosti veljajo tudi ob neposrednem odprtju brez dodatnega klika. | D01 pokriva projektni deep link; dodati neposredno odprtje poti opravila in privzete vrednosti. |
| R02 | Uporabi `N`; `q*` je en dobesedni podniz kateregakoli od štirih polj. | Unicode/diakritika, ločila, večbesedna fraza in regex metaznak; noben zadetek na deljenih besedah. |
| R03 | Status in q se združita z IN. Dovoljene so samo tri vrednosti statusa in tri vrstnega reda iz navodil; naslov primerja po `N`, stabilno ob izenačenju. | Vsak status z iskanjem; naraščajoče/padajoče in enaka naslova. |
| R04 | Za ponovljen parameter vzemi prvo vrednost; neveljaven `status`/`order` postane privzeti; ostale ključe prezri. Samo razčlenitev ne prepiše URL-ja. | URL s podvojenimi, neveljavnimi in tujimi parametri ob začetnem prikazu. |
| R05 | Sprememba kontrole spremeni samo osnutek. Uporabi potrdi trojico atomarno ter doda eno zgodovinsko stanje le, če se trojica razlikuje. | D02 preverja odloženo uporabo; preveriti še skupno spremembo q/status/order ter podvojeno potrditev. |
| R06 | Pri potrditvi obreži q; izpusti privzete ključe, pravilno kodiraj preostale; ohrani `view=board`, odstrani neznane parametre. Identična potrditev ne doda zgodovine. | Preveriti serializacijo, board in enako drugo potrditev. |
| R07 | Brskalnikova navigacija nazaj/naprej obnovi potrjene vrednosti, seznam in osnutek. Osvežitev ponovno razbere URL. | D03 preverja reload; preveriti še Back/Forward po dveh različnih potrditvah. |
| R08 | Preglednica/Tabla ohrani filtre in ID-je. Vsaka navigacija zavrže nepotrjen osnutek. | Preklop ob aktivnem filtru ter preklop z neuporabljenim osnutkom. |
| R09 | Odpri/zapri podrobnosti z gumbom ali Escape brez izgube potrjenih parametrov in načina pogleda; povezavo/izbiro vodi enolični ID, ne naslov. | Obstoječi `details()` pokriva Escape; baseline preverja gumb. Preveriti oba z aktivnimi parametri in podvojenimi naslovi. |
| R10 | Klik na drug projekt začne privzete filtre in ohrani način pogleda; neposredno odprt URL drugega projekta razbere podane parametre. | Klik med projekti v board/table in ločen deep link. |
| R11 | Ponastavi osnutek in potrjeno stanje po pravilih R05–R06 ter ohrani pogled. Prazno: `Ni zadetkov.`; status števec: `Prikazano: N od M.` | Ponastavitev z aktivnimi/privzetimi filtri; nič zadetkov in števec po filtru. |
| R12 | Uporabi samo GET/obstoječi javni API in obstoječo lokalno logiko; ohrani unknown route, load/detail, Folio in odziven prikaz brez širine strani nad 390 px. | `readonly()` v razvojnih pomočnikih preveri zapise in širino; izvajalec naj preveri še unknown route, nalaganje/napako in pogled pri 390 px. |

Dogovorjeni elementi: `input[type=search]` z oznako `Iskanje v povezavi`; selecta `Stanje v povezavi` in `Vrstni red v povezavi` z navedenimi vrednostmi; gumb `Uporabi pogled`, gumb `Ponastavi pogled`; `role=status`, `aria-label="Rezultati povezave"`, besedilo števca kot zgoraj, kjer je `N` število zadetkov po filtru, `M` pa število vseh nalog v projektu pred filtrom. Ohraniti `data-task-id`, dostopna imena obstoječih pogledov/stolpcev in `aria-label="Pregled stanj opravil"`; nova dejanja ob nalogi so zunaj njene povezave. Notranje drsenje vsebine je sprejemljivo pri širini 390 px. Vrstni red URL parametrov ni določen.

## Izvedba in sledljivost

| Zahteva | Pogoj | Test ali scenarij | Datoteka in del kode | Izid ter dokaz |
| --- | --- | --- | --- | --- |
| R01 | Neposredni fragment vzpostavi pogled. | Razširiti P09 D01. | `src/navigation.ts`: `useRoute`; `src/App.tsx`: `App`, `ProjectView`. | Ni preverjeno; D01 ni bil pognan. |
| R02–R04 | `N`, dobesedno iskanje, filter IN, stabilen vrstni red in tolerantno razčlenjevanje/serijska pravila. | D01 je delno; dodati scenarije iz tabele zahtev. | `src/navigation.ts`: razčlenitev query-ja; `src/App.tsx`: podatkovni seznam in kontrole. | Ni preverjeno; razvojni primeri niso celoten obseg. |
| R05–R07 | Ločen osnutek, ena potrditev in obnova iz zgodovine/URL-ja. | P09 D02, D03 ter dodatni Back/Forward scenarij. | `src/App.tsx`: stanje kontrol; `src/navigation.ts`: fragment in naročanje na hash navigacijo. | Ni preverjeno; D02/D03 nista bila pognana. |
| R08–R10 | Preklop pogleda ohrani filtre; drugi projekt začne privzeto; podrobnosti ciljajo ID in se vračajo v isti pogled. | `tests/baseline.spec.ts` pokriva osnovni view/detail/project tok; dodati scenarije s filtri. | `src/App.tsx`: stikala/povezave projekta in vrstice; `src/TaskBoard.tsx`: kartice; `src/TaskDetails.tsx`: close/Escape; `src/navigation.ts`: `projectUrl`, `taskUrl`. | Ni preverjeno; obstoječi baseline tu ni bil pognan. |
| R11 | Ponastavitev uporablja enaka pravila potrditve; stanje brez zadetkov in števec sta točna. | P09 D04 delno; dodati točna besedila in štetje. | `src/App.tsx`: seznam, števec in prazno stanje. | Ni preverjeno; D04 ni bil pognan. |
| R12 | Branje-only, obstoječe poti napak/neznane poti ter odziven Folio ostanejo. | `tests/baseline.spec.ts`, `tests/api.spec.ts`, P09 D04 in pregled 390 px. | `src/useResource.ts`, `src/api.ts`, `src/App.tsx`, `src/styles.css` (`.table-scroll`, `.board-scroll`). | Ni preverjeno; testi/videz sodijo v implementacijsko fazo. |

Podatki lahko obsegajo 0, 1 ali več kot 10 nalog, poljubne enkratne ID-je, podvojene naslove, drugačen vrstni red, veljavne datume, Unicode in poljubna besedilna ločila; projekta sta lahko prazna. Imena odgovorne osebe, kjer so na voljo, so neprazna in niso rezervirana vrednost `all`. Vsaka naloga pripada projektu. Testni GET-mehanizem v `tests/development/helpers.ts` je samo za razvojne teste; UI ga ne uvaža in ne bere `/__test/`.

## Odprta vprašanja in omejitve

- Ni novih razširitev obnašanja med nedokončanim nalaganjem ali ob sočasni spremembi podatkov brez osvežitve. Novo stanje ostane lokalno trenutnemu projektu, razen potrjenih parametrov URL-ja.
- Pregled izhodišča: `src/navigation.ts` razdeli fragment na pot/query in prepozna `view=board`; URL-gradniki trenutno sestavijo le projekt/pogled oziroma ID naloge. `src/App.tsx` naloge pridobi po projektu, prikaže vse vrstice in povezuje poglede; `src/TaskBoard.tsx` razvrsti naloge v statusne stolpce; `src/TaskDetails.tsx` naloži podrobnost po ID-ju in zapre dialog nazaj na projekt. `src/useResource.ts`/`src/api.ts` izvajata branje in napake. To so integracijske točke, ne dokaz izvedbe zahtev.
- Izhodiščni skupni testi potrjujejo še recoverable unknown route/task ID, ponovni poskus, podrobnosti in dostopna imena pogledov/stolpcev; ohrani jih. CSS že uporablja notranje vodoravno drsenje `.table-scroll`/`.board-scroll` in odzivni prelom pri 760 px.
- Specifikacija je edina izvedena aktivnost te faze; aplikacija, testi in vizualni pregled niso zagnani. Implementer po izvedbi dopolni sledi dejanske kode in dejanske rezultate testov; nedostopnih končnih testov ne označi kot opravljenih.
