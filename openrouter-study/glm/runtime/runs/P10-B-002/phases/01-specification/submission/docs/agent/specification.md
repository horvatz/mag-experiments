# Specifikacija: Lokalni vrstni red z razveljavitvami

## Problem in kontekst

Folio prikazuje opravila izbranega projekta v preglednici in na tabi. Uporabnik mora lahko spreminja globalni vrstni red opravil, neodvisno od statusov, spremembe razveljavljati in ponavljati. Vrstni red, obe zgodovini in vsa druga stanja so le lokalna trenutnemu projektu; aplikacija jih ne shrani trajno.

Obstoječi dizajn, navigacija, statusni stolpci, podrobnosti in dostopna imena ostanejo. Nova dejanja se vključijo v obstoječega Folia, ne pa v testne kontrole `/__test/` ali lokalne kopice podatkov.

## Vhodi, dejanja in izidi

- Projekti imajo `id` in `name`; opravila imajo `id`, `projectId`, `title`, `description`, `status` (`todo`, `in_progress`, `done`), `assignee` in `dueDate`. ID-ji opravil so enkratni, število opravil pa je poljubno, vključno z 0, 1 in več kot 10.
- Podatki se berejo iz obstoječih javnih GET-rut `/api/projects`, `/api/projects/<projectId>/tasks` in, pri podrobnostih, `/api/tasks/<taskId>`. Nova funkcionalnost ne sme dodati zapisovalnih klicev niti uporabiti `localStorage`.
- Za vsak projekt je izvorna permutacija `initialOrder = ids(prejeti niz opravil)`; enaki naslovi se nikoli ne uporabljata kot identiteta. Trenutna permutacija `order` vsebuje natanko iste ID-je v enkratnem zaporedju.
- Dejanja ob opravilu sta `Premakni <id> gor` in `Premakni <id> dol`. Globalni dejanji sta `Razveljavi premik` in `Ponovi premik`; posebno dejanje je `Začetni vrstni red`.
- Vsaka vrstica in kartica ohrani `data-task-id="<id>"`. Element z `aria-label="Mesto opravila <id>"` prikazuje globalno mesto `1 + index(id, order)`; gumba sta zunaj povezave do podrobnosti.
- Živo stanje ima `role="status"`, `aria-label="Zgodovina vrstnega reda"` in točno besedilo `Razveljavitve: U. Ponovitve: R.`.

## Zahteve in pravila

| Zahteva | Pravilo oziroma sprejemni pogoj | Način preverjanja |
| --- | --- | --- |
| R01 | Po uspešnem nalaganju je `order = initialOrder`. Preglednica in tabla prikazujeta globalno mesto vsakega ID-ja od 1 do N; iskanje po naslovu se ne uporablja. | Kontroliran GET z več opravili, enakimi naslovi, Unicode in nenavedenim zaporedjem; preveri vsa mesta in `data-task-id`. |
| R02 | `up(id)` zamenja `order[i]` in `order[i-1]`; `down(id)` zamenja `order[i]` in `order[i+1]`, pri čemer je `i = index(id, order)`. Polja `Task` in statusi ostanejo nespremenjeni. | Premakni notranje opravilo gor in dol v obeh pogledih; preveri novo zaporedje ID-jev, polja in status. |
| R03 | `up` je onemogočen za `i = 0`, `down` za `i = N-1`. Klik na onemogočen gumb ali ponovljeno robno dejanje ne spremeni `order`, `undo` ali `redo`. | Preveri `disabled` na robovih, sproži robno dejanje in primerjaj stanje pred/po. |
| R04 | Veljaven premik shrani trenutno permutacijo na sklad `undo`, nastavi novo `order` in počisti `redo`. `undo` vzame zadnji `undo`, trenutni `order` doda na sklad `redo` in obnovi vzeti permutacijo. `redo` je simetrično: trenutni `order` doda na `undo` in obnovi zadnji `redo`. | Izvedi premik, undo in redo; po vsakem koraku preveri ID-je in števca. |
| R05 | `undo` in `redo` smeta le dokler pripadajoči sklad ni prazen; noben korak se ne izgubi in noben ID se ne podvoji. | Vsaj trije različni premiki, nato večkratna zamenjava smeri undo/redo s preverjanjem vmesnih stanj. |
| R06 | Nov veljaven premik pri nepraznem `redo` počisti `redo` in doda prejšnje stanje v `undo`. Neveljavno dejanje ne spreminja zgodovin. | `undo`, poskusi robni premik in preveri `redo`; nato veljaven premik preveri prazen `redo`. |
| R07 | Veljavni premiki in reseti dodajajo največ 20 prejšnjih permutacij; ob 21. dodajanju se odstrani najstarejša. `redo` pokriva vse trenutno razveljavljene korake. | Izvedi 21 veljavnih premikov, preveri `U=20`, nato večkrat undo/redo. |
| R08 | `reset` je omogočen samo kadar `order != initialOrder`. Veljaven reset shrani trenutni `order` v `undo`, nastavi `initialOrder` in počisti `redo`; naslednji undo obnovi stanje pred resetom. Na izvornem redu je gumb onemogočen in ne doda zgodovine. | Spremeni red, resetiraj in undo; nato preveri onemogočen reset v izvornem stanju. |
| R09 | Preglednica prikazuje globalno mesto. Taba ohrani nespremenjene statusne stolpce, znotraj vsakega prikazuje relativno mesto po `order`, gumba pa uporabljata globalnega soseda in prikazujeta globalno mesto. | Isti ID premakni v obeh pogledih; preveri soseda, globalno mesto, relativno mesto, stolpec in status. |
| R10 | Preklop pogleda ter odpiranje/zapiranje podrobnosti ohranita `order`, `undo` in `redo`. Menjava projekta ali osvežitev ponastavita na izhodišče projekta. Stanje se ne shranjuje trajno. | Ustvari zgodovino, preklopi poglede in podrobnosti; menjaj projekt ali reload in preveri ponastavitev. |
| R11 | Status točno kaže `Razveljavitve: U. Ponovitve: R.`; undo/redo sta onemogočeni natanko pri 0. Projekta z 0 in 1 opravilom ostaneta uporabna brez veljavnih premikov. | Preveri tri ločene projekte z 0, 1 in več opravili, števce, onemogočenost in poglede. |
| R12 | Vsak prehod je permutacija iste množice ID-jev; ni API-zapisov, sprememb polj/statusov, testnih kontrol ali trajnega shranjevanja. Števci in podrobnosti ostanejo enaki, pri širini 390 px pa stran ni razširjena. | Spremljaj ne-GET zahteve in lokalno shrambo; na 390 px preveri `scrollWidth <= innerWidth`, poglede in podrobnosti. |

## Izvedba in sledljivost

| Zahteva | Pogoj | Test ali scenarij | Datoteka in del kode | Izid ter dokaz |
| --- | --- | --- | --- | --- |
| R01 | Začetni vrstni red je prejeti niz ID-jev. | Kontroliran GET z več opravili in enakimi naslovi. | Nalaganje v `src/App.tsx`; prikaz v `src/App.tsx` in `src/TaskBoard.tsx`. | Ni izvedeno v fazi specifikacije; implementer mora zapisati testni izid. |
| R02-R04 | Zamenjava globalnih sosedov ter skladova undo/redo. | Premik, undo, redo s preverjanjem ID-jev in števcev. | Predvidena nova logika v `src/App.tsx`; komponente v `src/TaskBoard.tsx`. | Ni izvedeno v fazi specifikacije. |
| R05-R07 | Dvostranska zgodovina, omejitev 20 in brisanje redo po novem premiku. | Trije premiki, več undo/redo, robni poskus in 21. veljaven premik. | Stanja `order`, `undo`, `redo` v `src/App.tsx`. | Ni izvedeno v fazi specifikacije. |
| R08 | Reset kot veljavno razveljavljivo dejanje. | Sprememba, reset, undo; reset na izvornem stanju. | Dejanja v `src/App.tsx`. | Ni izvedeno v fazi specifikacije. |
| R09 | Globalni red v obeh pogledih; relativni red na tabi. | Ista dejanja v preglednici in na tabi. | `src/App.tsx:42-55`; `src/TaskBoard.tsx:7-42`. | Ni izvedeno v fazi specifikacije. |
| R10 | Stanje je lokalno projektno in ne preživi menjave ali osvežitve. | Preklop, podrobnosti, menjava projekta, reload. | `src/App.tsx:10-59`, `src/navigation.ts`, obstoječi `ProjectView key={project.id}`. | Ni izvedeno v fazi specifikacije. |
| R11 | Števci in onemogočenost za 0, 1 in N opravil. | Trije projekti z različnim številom opravil. | Predvideni status v `src/App.tsx`. | Ni izvedeno v fazi specifikacije. |
| R12 | Le permutacije ID-jev; brez zapisov, trajne shrambe ali razširitve ozke strani. | Spremljanje ne-GET zahtev in širine 390 px. | Bralni `src/api.ts`; obstoječe GET-rute v `server/http.ts:30-34`. | Ni izvedeno v fazi specifikacije. |

Implementer naj spremembe preveri s skupnimi razvojnimi testi in doda lastne testne primere v `tests/agent/`, ki pokrijejo tudi obseg izven `tests/development/P10.spec.ts`. Zahteve R01-R12 morajo ostati povezane z dejanskimi testi in morebitnimi popravki.

## Odprta vprašanja in omejitve

- Ni odprtih zahtevnih nejasnosti: vsa imena, označena v navodilih, so obvezna dobesedno; besedila in razporeditve zunaj tega nista predpisana.
- Obstoječe obnašanje ob napakah in nezaključenem nalaganju ostaja; vrstni-redna dejanja so uporabna šele po uspešno naloženem nizu opravil.
- Ta dokument ne določa končnega izgleda, temveč ohranja potrjen Folio iz `docs/dizajn.md`.
