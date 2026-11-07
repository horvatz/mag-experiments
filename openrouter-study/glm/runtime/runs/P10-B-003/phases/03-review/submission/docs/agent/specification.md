# Specifikacija: P10 lokalni vrstni red z razveljavitvami

## Problem in kontekst

Uporabnik želi v obstoječem Folio vmesniku preurediti globalni vrstni red opravil, brez spreminjanja njihovih podatkov ali stanj. Naša sprememba je lokalna: vrstni red, zgodovina razveljavitev in zgodovina ponovitev obstojata le za trenutno naložen projekt in se ne shranjujeta trajno.

Izhodišče naloge je trenutna aplikacija: `ProjectView` v `src/App.tsx` naloži opravila projekta, tabela v istem bloku izriše prejeti zaporedji, tabla v `src/TaskBoard.tsx` pa opravila razvrsti v stalne stolpce po statusu. Ohraniti je treba slovenska poimenovanja, dostopna imena, obstoječi API, tipi in potrjeni Folio videz.

## Vhodi, dejanja in izidi

### Podatkovni vhodi

- `Project` ima `id` in `name`; `Task` ima `id`, `projectId`, `title`, `description`, `status`, `assignee` in `dueDate`.
- Aplikacija bere samo javni API: `/api/projects`, `/api/projects/{projectId}/tasks` in `/api/tasks/{taskId}` za obstoječe podrobnosti.
- Testni podatki lahko vsebujejo 0, 1, več kot 10 opravil, različne enkratne ID-je, enake naslove, različna zaporedja, veljavne koledarske datume in besedilo z Unicode znaki.
- ID-ji opravil v enem projektu so enkratni; vsako opravilo pripada svojemu projektu. Imena odgovornih oseb so neprazna in razlikovana od vrednosti `all`, kadar je izbira prisotna.

### Stanje

Naj bo `A` prejeto polje opravil projekta in `O0 = [A[0].id, …, A[n-1].id]` izvorna permutacija ID-jev. Trenutno permutacijo imenujmo `C`, sklad razveljavitev `U` in sklad ponovitev `R`. Vsi trije vsebujejo izključno celotne permutacije istih ID-jev. Stanje se inicializira ob uspešno naloženih opravilih, ne pa ob napaki ali med nalaganjem.

### Dejanja

- `Premakni {id} gor` oziroma `Premakni {id} dol` zamenjata opravilo z neposrednim globalnim sosedom v `C`.
- `Razveljavi premik` obnovi zadnjo permutacijo iz `U` in trenutno shrani v `R`.
- `Ponovi premik` obnovi zadnjo permutacijo iz `R` in trenutno shrani v `U`.
- `Začetni vrstni red` nastavi `C = O0` kot eno novo razveljavljivo dejanje.
- Preklop med preglednico in tabo ter odpiranje in zapiranje podrobnosti ne spremenita `C`, `U` niti `R`. Menjava projekta ali osvežitev ju ponastavita na izhodišče projekta.

### Izidi

- Uspešno dejanje spremeni le vrstni red prikaza ter števca zgodovine; vsa polja opravil, statusi, števci stanj, podrobnosti in poti ostanejo nespremenjeni.
- Neveljavno ali robno dejanje ne spremeni `C`, `U` niti `R`, relevanten gumb pa je onemogočen.
- Napaka nalaganja ohrani obstoječe obnašanje s sporočilom in gumbom za ponovni poskus; dejanja vrstnega reda niso na voljo, dokler podatki niso uspešno naloženi.
- Ni novih API-jev, zapisov na API, uporabe `localStorage`, branja ali pisanja testnih kontrol `/__test/`.

## Zahteve in pravila

### Predikati

- `pos(C, id)` je globalno mesto `id` v permutaciji `C`, torej `1 ≤ pos(C, id) ≤ n`.
- `veljavniPremik(id, s)` pomeni, da `s = -1` in `pos(C, id) > 1`, ali `s = 1` in `pos(C, id) < n`.
- `zamenjajSoseda(C, id, s)` zamenja `C[pos(C, id)]` z `C[pos(C, id)+s]`; vse ostale vrednosti ohrani.
- `potisniU(C, U)` doda `C` na konec `U`, nato ohrani zadnjih 20 vrednosti.
- `veljavenPremik(id, s)`: potisne trenutni `C` v `U`, nastavi `C = zamenjajSoseda(C, id, s)` in nastavi `R = []`.
- `razveljavi()`, kadar `U` ni prazen: vzame zadnji `P` iz `U`, doda trenutni `C` na konec `R` in nastavi `C = P`.
- `ponovi()`, kadar `R` ni prazen: vzame zadnji `P` iz `R`, doda trenutni `C` v `U` in nastavi `C = P`.
- `začetni()`: če `C = O0`, dejanje ni na voljo in ne spremeni stanja; sicer potisne trenutni `C` v `U`, nastavi `C = O0` in `R = []`.

| Zahteva | Pravilo oziroma sprejemni pogoj | Način preverjanja |
| --- | --- | --- |
| R01 | Ob uspešnem nalaganju je `C = O0` natanko v zaporedju prejetega polja. Vsak prikazan element ima globalno mesto `pos(C, id)`, enake naslovi pa se ne povežejo po besedilu. | Test naloži več opravil z različnimi ID-ji, enakimi naslovi in različnim zaporedjem ter preveri mesta in `data-task-id`. |
| R02 | Veljaven premik v smeri `s` zamenja samo tista dva sosedna elementa v `C`; vsi `Task` objekti, njihova polja in statusi ostanejo enaki. | Test primerja celoten zaporedni `data-task-id` pred in po dejanju ter preveri vsa polja/status iz izvora. |
| R03 | `veljavniPremik(id, -1)` je lažniv za prvi element in `veljavniPremik(id, 1)` za zadnjega. Ti gumbi sta onemogočena; klik ne spremeni `C`, `U` niti `R`. | Preveri onemogočenost, poskus klik po umetni prisili in primerja tri stanja. |
| R04 | Vsak veljaven premik najprej celotnega trenutnega `C` doda v `U`. Razveljavitev iz `U` obnovi zadnjo prejšnjo permutacijo in shrani trenutno v `R`. | Izvedi zaporedne premike, preveri `data-task-id`, števca in ponovno izvedbo. |
| R05 | `R` vrača zadnje razveljavljeno permutacijo. Poljubno zaporedje razveljavitev in ponovitev ohrani vse ID-je natanko enkrat in ne spremeni `O0`. | Preveri več kot dvokoračno zgodovino v obeh smereh, vključno z vmesno menjavo smeri. |
| R06 | Vsak nov veljaven premik po razveljavitvi nastavi `R = []`. Neveljaven premik na robu `R` ne spremeni. | Po razveljavitvi izvedi veljaven premik in preveri ponovitve; nato poskusi robno dejanje z nepraznim `R`. |
| R07 | `U` hrani največ 20 prejšnjih permutacij; ob 21. veljavnem premiku se najstarejša zavrže. `R` pokriva vse trenutno razveljavljene korake. | Test naredi 21 veljavnih premikov, 20 razveljavi in preveri mejo ter ponovitve brez podvajanj. |
| R08 | `Začetni vrstni red` nastavi `C = O0`, doda prejšnji `C` v `U` in počisti `R`. Če je `C = O0`, je gumb onemogočen in stanje ostane nespremenjeno. | Test preveri reset po premiku ter onemogočen reset v izhodišču; preveri tudi razveljavitev reseta. |
| R09 | Preglednica izriše `C`, tabla pa ohranja relativni vrstni red znotraj vsakega obstoječega statusa. Sosed iz premika je globalni sosed, ne sosed v istem stolpcu; status se ne spremeni. | Premakni opravilo na tabli, preveri stolpce po statusu in globalno mesto, nato preveri identično stanje v preglednici. |
| R10 | Preklop pogleda, odpiranje in zapiranje podrobnosti ohranita `C`, `U` in `R`. Menjava projekta ali osvežitev ju ponastavita na novo izhodišče. | Izvedi premik, preklopi oba pogleda, odpri in zapri podrobnosti, nato zamenjaj projekt in osveži. |
| R11 | Element `role=status` z imenom `Zgodovina vrstni red` izpiše natanko `Razveljavitve: {len(U)}. Ponovitve: {len(R)}.` Gumba za zgodovino sta onemogočena pri 0. Prazni in enoopravilni projekt sta uporabna brez premikov. | Test z več, enim in nič opravili preveri besedilo, onemogočenost in odsotnost napak pri klikih, kjer so možni. |
| R12 | `C` je vedno permutacija `O0`: ista množica ID-jev brez izgube in podvajanj. Ni omrežnih zapisov, sprememb polj, statusov, števcov ali podrobnosti; pri širini 390 pik se stran ne razširi. | Test zajame omrežne zahteve, primerja podatkovne objekte in stanja ter preveri `document.documentElement.scrollWidth <= innerWidth`. |

### Dostopnostna pogodba

- Ob vsaki vrstici ali kartici sta ločena gumba `Premakni {id} gor` in `Premakni {id} dol`, zunaj povezave na opravilo.
- Element vsakega opravila ima `data-task-id={id}` in dostopno ime `Mesto opravila {id}` ter besedilno ali skrito vrednost globalnega mesta.
- Zgornja orodna vrstica vsebuje gumba `Razveljavi premik` in `Ponovi premik` ter gumb `Začetni vrstni red`.
- Zgodovina ima `role=status`, `aria-label="Zgodovina vrstnega reda"` in natanko besedilo `Razveljavitve: U. Ponovitve: R.`
- Ohranjena so obstoječa dostopna imena pogledov in stolpcev ter `aria-label="Pregled stanj opravil"`; tabela in tabla smeta drsati notranje, zunanjih prelomov pri 390 pik pa ne.

## Izvedba in sledljivost

| Zahteva | Pogoj | Test ali scenarij | Datoteka in del kode | Izid ter dokaz |
| --- | --- | --- | --- | --- |
| R01 | Izvorno zaporedje iz API-ja in globalna mesta | Slučajni večopravilni podatki | `src/App.tsx:10`, `src/App.tsx:46`, `src/TaskBoard.tsx:13` | Ni izvedeno v fazi specifikacije. |
| R02 | Zamenjava globalnega soseda in nespremenjena polja | Premik sredinskega in robnega opravila | `src/App.tsx:10`, `src/TaskBoard.tsx:13`, načrtovan pripomoček za permutacije | Ni izvedeno v fazi specifikacije. |
| R03 | Onemogočeni robni premiki | Klik na prvega in zadnjega | `src/App.tsx:42`, `src/TaskBoard.tsx:25` | Ni izvedeno v fazi specifikacije. |
| R04 | Ustreza predikatom `veljavenPremik` in `razveljavi` | Premik, razveljavitev in ponovitev | `src/App.tsx:10`, načrtovan test `tests/agent/P10.spec.ts` | Ni izvedeno v fazi specifikacije. |
| R05 | Ohranjeno zaporedje `U` in `R` | Več razveljavitev in ponovitev | `src/App.tsx:10`, načrtovan test `tests/agent/P10.spec.ts` | Ni izvedeno v fazi specifikacije. |
| R06 | Veljaven premik počisti `R`, robni pa ne | Razveljavi, robni poskus, nov premik | `src/App.tsx:10`, načrtovan test `tests/agent/P10.spec.ts` | Ni izvedeno v fazi specifikacije. |
| R07 | Največ 20 razveljavitev | 21 premikov in 20 razveljavitev | `src/App.tsx:10`, načrtovan test `tests/agent/P10.spec.ts` | Ni izvedeno v fazi specifikacije. |
| R08 | Reset kot novo dejanje | Reset po premiku in v izhodišču | `src/App.tsx:34`, načrtovan test `tests/agent/P10.spec.ts` | Ni izvedeno v fazi specifikacije. |
| R09 | Globalni vrstni red in tabla po statusih | Premik na tabli in preverba stolpcev | `src/TaskBoard.tsx:13`, `src/TaskBoard.tsx:17` | Ni izvedeno v fazi specifikacije. |
| R10 | Lokalno stanje živi v `ProjectView` | Preklop pogleda, podrobnosti, projekti in osvežitev | `src/App.tsx:10`, `src/App.tsx:58`, `src/App.tsx:86`, `src/TaskDetails.tsx:9` | Ni izvedeno v fazi specifikacije. |
| R11 | Natančna števca in onemogočenost | Nič, eno in več opravil | `src/App.tsx:34`, načrtovan test `tests/agent/P10.spec.ts` | Ni izvedeno v fazi specifikacije. |
| R12 | Permutacija istih ID-jev, brez zapisov in preloma | Primerjava omrežja, podatkov in širine 390 | `src/App.tsx:11`, `src/api.ts:3`, `src/TaskBoard.tsx:14`, načrtovan test `tests/agent/P10.spec.ts` | Ni izvedeno v fazi specifikacije. |

## Odprta vprašanja in omejitve

- Zahteve R01–R12 so pokrite; ni znanih odprtih vprašanj, ki bi lahko spreminjala sprejemne pogoje.
- Specifikacija ne pomeni izvedene kode ali opravljenega preverjanja. Implementer mora spremeniti le `src/`, lastne teste v `tests/agent/` in morebitne lastne zapiske v `docs/agent/`.
- Uporabniški vmesnik ne sme uporabljati razvojnih testnih kontrol `/__test/`, `localStorage`, novih zapisovalnih API-jev ali trajne shrambe.
- Niso pokrite nove sočasne spremembe podatkov brez osvežitve, navigacija med nezaključenim nalaganjem ali spreminjanje skupne infrastrukture, odvisnosti in tipov.
- Neznani del je morebiten nov pripomoček v `src/`; zato sledljivost navaja obstoječe lastnike stanja ter načrtovano mesto testov.
