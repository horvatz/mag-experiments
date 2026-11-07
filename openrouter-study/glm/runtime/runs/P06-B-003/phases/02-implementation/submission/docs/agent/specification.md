# Specifikacija: nastavljiv izvoz CSV

## Problem in kontekst

Folio prikazuje opravila izbranega projekta v pogledih Preglednica in Tabla. Uporabnik potrebuje bralni izvoz teh opravil v CSV, pri čemer izbere kolone, filter in ločilo. Pogled na projekt, obstoječa navigacija, podrobnosti opravil in poteka nalaganja/napak morajo ostati nespremenjeni. Izvoz izvede izključno v bralniku; ne dodaja zapisovalnih API-jev in ne shranjuje nastavitev.

## Vhodi, dejanja in izidi

- Vhod so podatki obstoječega GET `/api/projects/<projectId>/tasks` v tipu `Task`: `id`, `projectId`, `title`, `description`, `status`, `assignee`, `dueDate`. Status je `todo`, `in_progress` ali `done`; datum je izvirni `YYYY-MM-DD`.
- Novo stanje je vezano na nabor opravil trenutnega projekta: izbrane kolone, filter izvoza in ločilo. Privzeto so izbrane vse kolone, filter je `all`, ločilo je `;`.
- Dovoljena dejanja: izbira ali izključitev kolon, izbira filtra `all/todo/in_progress/done`, izbira ločila `;`/`,`, preklop obstoječih pogledov in izvoz. Imena kontrol so `Stolpec <ime>`, `Filter izvoza`, `Ločilo CSV` in gumb `Izvozi CSV`.
- Uspešni izvoz preda datoteko `folio-<projectId>.csv`; vsebina se začne z U+FEFF, vsaka vrstica se konča s CRLF, polja so navedena in formule so nevtralizirane. Ne sme odpreti nove strani.
- Izvoz je omogočen samo, ko so opravila uspešno naložena in izpolnjen predikat `selectedColumns.length > 0 && filteredTasks.length > 0`. Če predikat ni izpolnjen, je gumb onemogočen in ne ustvari prenosa.
- Menjava projekta ali osvežitev ponastavita nastavitve na privzete vrednosti. Preklop Preglednica/Tabla ne spremeni nastavitev. Nastavitve se ne dodajo v URL, lokalno shrambo ali API.
- Obstoječe obnašanje API napak in nalaganja ostane nespremenjeno; izvozne kontrole ne ponujajo reševanja napak in ne kličejo testnih kontrol `/__test/`.
- Obstoječe `data-task-id`, dostopna imena pogledov in stolpcev, `aria-label="Pregled stanj opravil"` ter povezave do opravil ostanejo nespremenjeni. Izvozne kontrole niso dejanja znotraj povezave posameznega opravila.

## Zahteve in pravila

| Zahteva | Pravilo oziroma sprejemni pogoj | Način preverjanja |
| --- | --- | --- |
| R01 | Za trenutni projekt `P` izvoz uporabi `filteredTasks = tasks.filter(task => task.projectId === P && (filter === 'all' || task.status === filter))` v izvornem zaporedju API-jevega odgovora. Privzeti izbor in filter sta navedena zgoraj. | Sprejemni testi z več zapisi, mešanimi statusi, enakimi naslovi in nestandardnim zaporedjem; primerjaj ID-je v vrsticah. |
| R02 | Konstanta kolon je natanko `id, projectId, title, status, assignee, dueDate, description`. Glava in vsaka podatkovna vrstica uporabita to zaporedje, ne glede na vrstni red klikov. | Enoten ali bralni test z izbiro v obratnem vrstnem redu in primerjava glave/vrednosti. |
| R03 | Izvoz je omogočen samo, kadar je izbrana vsaj ena kolona in obstaja vsaj ena izvozna vrstica. Ob ponovni izbiri kolone z ustreznimi vrsticami se izvoz ponovno omogoči. | Testi: izklop vseh kolon, prazen projekt, filter brez zadetkov, ponovna izbira; preveri `disabled` in odsotnost prenosnega dogodka. |
| R04 | Filter vpliva samo na `filteredTasks` za izvoz; pregled, števci in `data-task-id` ostanejo za ves projekt. Prazen projekt ali prazen rezultat onemogoči izvoz, ne pa pogledov. | UI test vsakega filtra s preverjanjem vidnih ID-jev, izvoznih ID-jev in povzetka stanj. |
| R05 | Prenos se imenuje `folio-<projectId>.csv`; prvi znak vsebine je U+FEFF. Izvedba ne uporablja `window.open` ali navigacije in ne pošlje CSV vsebine na strežnik. Dovoljena je lokalna `Blob`/object URL izvedba, ki se po zagonu prenosa počisti. | Sprejemni test prestreže download in API klice; potrdi samo GET odgovore in odsotnost zapisov. |
| R06 | `separator ∈ {';', ','}`. Vsaka glava in vsaka vrednost je obdana z `"`; interni `"` se podvoji (`""`). Ločilo znotraj vrednosti ne razbije polja. | Testi z naslovi/opisi, ki vsebujejo obe ločili, narekovaj in kombinacije. |
| R07 | Vsaka vrstica, vključno z zadnjo, se konča s CRLF (`\r\n`). Vrednostni CR, LF in CRLF ostanejo znotraj navedenega polja in se ne pretvorijo v konec CSV vrstice. | Binarna ali besedilna primerjava celotnega niza, vključno s končnimi bajti. |
| R08 | Za vsako podatkovno vrednost velja `needsFormulaNeutralization(value) = /^[ \t\r\n]*[=+\-@]/.test(value)`. Če velja, se izvirnemu nizu pred navedbo doda `'` na samem začetku, sicer se vrednost ne spreminja. Pravilo ne velja za glavo. | Testi za `=`, `+`, `-`, `@`, brez začetnih presledkov in z zaporedjem presledek/tabulator/CR/LF; negativni primeri npr. `#`, `a=b`. |
| R09 | Vsi izvozni podatkovni nizi ohranijo Unicode, presledke in drugo izvirno vsebino, razen predpone iz R08. `status` se izvozi kot `todo`/`in_progress`/`done`; `dueDate` kot izvirni niz, brez formatiranja. | Testi s šumniki, drugimi Unicode znaki, presledki in dolgimi opisi. |
| R10 | Preklop pogleda ne spreminja `selectedColumns`, `filter` ali `separator`. Za isti nabor podatkov in nastavitev oba pogleda generirata enake bajte datoteke. | UI test nastavi stanje, preklopi oba pogleda in primerja prenosa; preveri tudi obstoječi `data-task-id`. |
| R11 | Sprememba `projectId` ali osvežitev ponastavi izbor na vseh sedem kolon, filter na `all` in ločilo na `;`. Dva izvoza po poljubni spremembi nastavitev vedno odražata trenutno stanje. | UI test menjave projektov, `reload`, spremembe nastavitev in zaporednih izvozov. |
| R12 | Izvozna logika je nova, čista in bralna; sprejme obstoječi `Project`, `Task[]` in nastavitve ter vrne CSV niz ali sproži prenos. Ne spreminja `tasks`, polj posameznih opravil, obstoječih komponent, URL logike ali API odjemalca. Uporabniški vmesnik kliče samo obstoječi javni GET; ne kliče `/__test/` in ne pošlje PATCH/POST/PUT/DELETE. | Pregled kode, skupni regresijski testi in agent UI test z odsotnostjo zapisovalnih klicev. |

Predlagana razporeditev: izvozni tipi, encoder in prenos postavitev v ločene izvozne module v `src/`, kontrole pa v `ProjectView` v obstoječem slogu. Implementer sme izbrati datotečna imena, če so pogoji, tipi in sledljivost enakovredni.

## Izvedba in sledljivost

| Zahteva | Pogoj | Test ali scenarij | Datoteka in del kode | Izid ter dokaz |
| --- | --- | --- | --- | --- |
| R01–R12 | Vsa pravila zgoraj | Načrtovani lastni agent UI testi v `tests/agent/` z nadzorovanimi javnimi `/api/` GET odgovori | Še ni implementirano | Ni preverjeno; specifikacijski agent ni zaganjal aplikacije ali testov. |

Obvezni skupni testi `tests/baseline.spec.ts` in `tests/api.spec.ts` morajo ostati uspešni, ker potrjujejo obstoječo navigacijo, poglede, števce, povezave, `data-task-id`, dialoge in odsotnost zapisov. Razvojni primera `tests/development/P06.spec.ts` D01 ter D02 smeta biti uporabljena kot delni povzetek, ne kot nadomestilo za vse pogoje.

## Odprta vprašanja in omejitve

- Ni odprtih vsebinskih vprašanj. Predpostavke izhajajo iz navodil ter iz `shared/types.ts`, `src/App.tsx`, `src/useResource.ts`, `src/navigation.ts` in `src/TaskBoard.tsx`.
- Končni primeri lahko uporabijo 0, 1 ali več kot 10 opravil, druge ID-je, enake naslove, drugačno zaporedje in veljavne datume. Projekta sta lahko prazna.
- Navigacije med nezaključenim nalaganjem ter sočasne spremembe podatkov brez osvežitve niso v obsegu.
- Specifikacija ne predpisuje besedila razen kontrol iz dogovora in ne omejuje razporeditve novih kontrol, razen zahtev o ohranitvi Folio videza in širine 390 pik.
