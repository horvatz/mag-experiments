# Razvojna specifikacija — P10: Lokalni vrstni red z razveljavitvami

Različica: 1.0 (izdelek vloge avtorja specifikacije), 2026-10-09.
Vir zahtev: `task/instructions.md`, zahteve R01–R12; predloga: `task/specification-template.md`.
Izvirne zahteve ostajajo obvezne tudi, če bi jih ta dokument kje skrajšal.

## Problem in kontekst

Uporabnik v aplikaciji Folio pregleduje opravila enega projekta in želi vrstni
red opravil začasno prilagoditi ter spremembe razveljavljati in ponavljati.
Zdaj aplikacija bere opravila prek `GET /api/projects/:id/tasks` in jih prikaže
v nespremenjenem vrstnem redu: v preglednici kot vrstice, na tabli pa v treh
stalnih stolpcih stanj (`todo`, `in_progress`, `done`).

Predvidena sprememba je lokalna permutacija ID-jev opravil aktivnega projekta:
premiki gor/dol po globalnem sosedu, razveljavitev, ponovitev in vrnitev na
začetni vrstni red. Aplikacija ostane bralna: nobenega zapisa prek `/api/`,
nobene trajne shrambe, brez posegov v strežnik, skupne tipe, odvisnosti in
skupne teste. Stanje nove funkcionalnosti je vezano na trenutni projekt in se
ob menjavi projekta ali osvežitvi ponastavi.

## Vhodi, dejanja in izidi

### Relevantna podatkovna polja (iz `shared/types.ts`, nespremenjena)

| Tip | Polja | Uporaba v nalogi |
| --- | --- | --- |
| `Project` | `id`, `name` | izbira aktivnega projekta prek `GET /api/projects` |
| `Task` | `id`, `projectId`, `title`, `description`, `status`, `assignee`, `dueDate` | `id` določa identiteto in vrstni red; ostala polja se pri premikih ne spreminjajo |
| `status` | `'todo' \| 'in_progress' \| 'done'` | določa stolpec table in števce stanj |
| `dueDate` | veljaven koledarski datum (niz) | prikaz nespremenjen |

Testni podatki so lahko poljubni: 0, 1 ali več opravil, enkratni ID-ji,
enaki naslovi (ki se ne povezujejo), različen vrstni red, Unicode in ločila.

### Simboli stanja (za predikate)

- `I` — izvorna permutacija ID-jev aktivnega projekta: vrstni red, kot ga vrne
  `GET /api/projects/:id/tasks`.
- `P` — trenutna permutacija ID-jev aktivnega projekta (`|P| = N`).
- `pos(id)` — 1-indeksirano mesto ID-ja v `P` (1 … N).
- `U` — sklad prejšnjih permutacij za razveljavitev; vrh je zadnja prejšnja
  permutacija. `U = []` na začetku.
- `R` — sklad razveljavljenih permutacij za ponovitev; vrh je zadnja
  razveljavljena permutacija. `R = []` na začetku.
- `push(S, x)` — doda `x` na vrh sklada `S`; če bi `|U|` presegel 20, se
  najstarejši element (`U[0]`) zavrže (velja za vsak push v `U`).
- `swap(P, i, j)` — zamenja elementa na mestih `i` in `j`.
- `filter(P, status)` — ohrani vrstni red `P` in vrne samo opravila s tem
  stanjem (relativni vrstni red stolpca table).

### Dovoljena dejanja in prehodi stanja

| Dejanje | Predpogoj | Sprememba stanja | Izid |
| --- | --- | --- | --- |
| Premakni `<id>` gor | `pos(id) > 1` | `U' = push(U, P)`; `P' = swap(P, pos, pos-1)`; `R' = []` | opravilo zamenja globalnega predhodnika; polja in stanja nespremenjena |
| Premakni `<id>` dol | `pos(id) < N` | `U' = push(U, P)`; `P' = swap(P, pos, pos+1)`; `R' = []` | opravilo zamenja globalnega naslednika |
| Razveljavi premik | `|U| > 0` | `R' = push(R, P)`; `P' = pop(U)` | obnovljena zadnja prejšnja permutacija; trenutna shranjena za ponovitev |
| Ponovi premik | `|R| > 0` | `U' = push(U, P)`; `P' = pop(R)` | obnovljena zadnja razveljavljena permutacija |
| Začetni vrstni red | `P ≠ I` | `U' = push(U, P)`; `P' = I`; `R' = []` | vrnitev na `I` kot eno novo razveljavljivo dejanje |
| Preklop pogleda / odpri-zapri podrobnosti | — | `P`, `U`, `R` nespremenjeni | vrstni red in obe zgodovini ostaneta |
| Menjava projekta / osvežitev strani | — | `P = I(projekt)`, `U = []`, `R = []` | ponastavitev na izhodišče tega projekta |

Neveljavno dejanje (premik prvega gor / zadnjega dol, dejanje ob ničelnem
skladu, ponovni klik na onemogočen gumb) ne spremeni `P`, `U` ali `R` in ne
doda zgodovine. Napake branja podatkov ohranijo obstoječe `LoadError` vedenje.

### Zahtevani vmesnik (dogovor iz navodil)

- Ob vsaki vrstici/kartici: gumba `Premakni <id> gor` in `Premakni <id> dol`,
  ločena od povezave opravila (zunaj elementa `<a>`).
- Element `aria-label="Mesto opravila <id>"` z besedilom globalne številke
  `pos(id)`.
- Gumbi `Razveljavi premik`, `Ponovi premik`, `Začetni vrstni red`.
- Element `role=status` z `aria-label="Zgodovina vrstnega reda"` in točnim
  besedilom `Razveljavitve: U. Ponovitve: R.`, kjer sta `U` in `R` velikosti
  skladov.
- Ohranjeni: `data-task-id` na vrsticah in karticah, dostopna imena obstoječih
  pogledov in stolpcev, `aria-label="Pregled stanj opravil"`.
- Pri širini 390 pik se stran ne razširi; notranje drsenje preglednice in
  table je dovoljeno. Fokus tipkovnice ostane viden.

## Zahteve in pravila

Splošno pravilo velja za vsak `P`; posamezni testni primer je le ena
instanca. Predikati uporabljajo simbole iz prejšnjega razdelka. ID-ji v `P` so
vedno natanko ID-ji opravil aktivnega projekta, vsak točno enkrat.

| Zahteva | Pravilo oziroma sprejemni pogoj | Način preverjanja |
| --- | --- | --- |
| R01 | `P = I` pred prvim dejanjem. `∀ id: text(aria-label="Mesto opravila <id>") = pos(id)`. Enaki naslovi se ne povezujejo: identiteta je izključno `id`. | D01 (`expectIds` vrne začetni vrstni red); lastni test z enakimi naslovi in različnimi ID-ji. |
| R02 | Veljaven premik: `P' = swap(P, pos(id), pos(id)±1)`; za vsa polja `f ∈ {projectId,title,description,status,assignee,dueDate}` velja `f' = f`. | D01; lastni test primerja `data-task-id` vrstni red in nespremenjene števce ter podrobnosti. |
| R03 | Gumb gor je onemogočen pri `pos(id)=1`, gumb dol pri `pos(id)=N`. Neveljavno dejanje: `P'=P`, `U'=U`, `R'=R`. | D01 (gumb `Premakni web-01 gor` je `disabled`); lastni test prvega/zadnjega in števca zgodovine. |
| R04 | Vsak veljaven premik: `U' = push(U,P)`, `R' = []`. Razveljavitev: `|U|>0 → R' = push(R,P); P' = pop(U)`. | D02 (razveljavitev vrne `webIds()`); lastni test vsebine skladov prek števca in vrstnega reda. |
| R05 | Ponovitev: `|R|>0 → U' = push(U,P); P' = pop(R)`. Zaporedje več razveljavitev/ponovitev ohrani `P` kot permutacijo brez izgube/podvajanja ID-jev. | D02 (`Mesto opravila web-02` = 1 po ponovitvi); lastni test zaporedja U/ponovi/U/ponovi z `expectIds`. |
| R06 | Veljaven premik po razveljavitvi: `R' = []`. Neveljaven robni premik: `R' = R` (in `U' = U`, `P' = P`). | D03 (gumb `Ponovi premik` onemogočen, `Razveljavitve: 1. Ponovitve: 0.`); lastni test robnega premika po razveljavitvi. |
| R07 | Po vsakem dejanju `|U| ≤ 20`; ob 21. veljavnem premiku `push` zavrže `U[0]`. Ponovitev je mogoča za vse trenutno razveljavljene korake (`|R|` korakov). | Lastni test: 21 premikov → 20 razveljavitev, nato ponovitev vseh 20; robna razveljavitev/ponovitev onemogočena. |
| R08 | `P ≠ I → U' = push(U,P); P' = I; R' = []`. `P = I` → gumb onemogočen, brez sprememb `U` in `R`. | D04 (`Začetni vrstni red` vrne mesto 2); lastni test: ponovitev ni mogoča po ponastavitvi, razveljavitev ponastavitve vrne prejšnji `P`. |
| R09 | Preglednica prikazuje vrstice v vrstnem redu `P`; tabla prikazuje `filter(P,status)` znotraj stalnih stolpcev. Premik na tabli uporabi globalnega soseda v `P` in ne spremeni `status`. | D04 (na tabli po premiku `Mesto opravila web-02` = 1); lastni test: relativni vrstni red vsakega stolpca in nespremenjeni števci stanj. |
| R10 | Preklop pogleda in odpiranje/zapiranje podrobnosti ne spremenijo `P`, `U`, `R`. Menjava projekta in osvežitev: `P = I(projekt)`, `U = []`, `R = []`. Ni trajne shrambe (`localStorage` ipd.). | Lastni test: premik → tabla/preglednica → podrobnosti → nazaj; nato projekt `launch` in nazaj ter `page.reload()`; vsakič začetni vrstni red in števca 0/0. |
| R11 | Besedilo statusa je točno `Razveljavitve: U. Ponovitve: R.`; `Razveljavi premik` je onemogočen pri `|U|=0`, `Ponovi premik` pri `|R|=0`. `N=0` in `N=1` ostaneta uporabna: brez dovoljenih premikov, brez napak, zgodovina prazna. | D03 (točno besedilo); lastni test z `records=[]` in z enim opravilom. |
| R12 | Za vsak `P`: multiset ID-jev `P` = multiset ID-jev `I`; ni zahtev `PATCH/POST/PUT/DELETE` na `/api/` (`saveRequests = 0`); polja in števci stanj nespremenjeni; podrobnosti pravilne; Folio brez vodoravnega prelivanja pri 390 pik. | D04 (`readonly`); obstoječi skupni testi; lastni test podrobnosti in števcev `[aria-label="Pregled stanj opravil"]`. |

## Izvedba in sledljivost

Predvideni nosilci kode (implementer jih potrdi ali zamenja z enakovrednimi;
specifikacija ne predpisuje imen datotek): stanje in skladi v `src/App.tsx`
(`ProjectView`) ali v novem modulu/hooku, ki ga uporabi `ProjectView`;
prikaz in gumbi v `src/TaskBoard.tsx` in preglednici znotraj `src/App.tsx`;
slovenske oznake in stili v `src/styles.css`. `src/api.ts` ostane bralni;
`shared/`, `server/`, `tests/baseline.spec.ts`, `tests/api.spec.ts` in
`tests/development/` se ne spreminjajo.

| Zahteva | Pogoj | Test ali scenarij | Datoteka in del kode | Izid ter dokaz |
| --- | --- | --- | --- | --- |
| R01 | začetni `P=I`, prikazana globalna mesta | D01; lastni test enakih naslovov | izpolni implementer | izpolni implementer po izvedbi |
| R02 | zamenjava globalnih sosedov, polja nespremenjena | D01; lastni test | izpolni implementer | izpolni implementer po izvedbi |
| R03 | onemogočeni robni gumbi, brez zgodovine | D01; lastni test | izpolni implementer | izpolni implementer po izvedbi |
| R04 | push `P` v `U`, razveljavitev obnovi in shrani v `R` | D02; lastni test | izpolni implementer | izpolni implementer po izvedbi |
| R05 | ponovitev iz `R`, brez izgube ID-jev | D02; lastni test zaporedja | izpolni implementer | izpolni implementer po izvedbi |
| R06 | nov premik po razveljavitvi izprazni `R`; robni ne | D03; lastni test | izpolni implementer | izpolni implementer po izvedbi |
| R07 | `|U| ≤ 20`, zavržen najstarejši; ponovitev vseh razveljavljenih | lastni test 21 premikov | izpolni implementer | izpolni implementer po izvedbi |
| R08 | ponastavitev kot eno dejanje, izprazni `R`; pri `I` onemogočena | D04; lastni test | izpolni implementer | izpolni implementer po izvedbi |
| R09 | globalni vrstni red v preglednici, relativni po stolpcih table | D04; lastni test stolpcev | izpolni implementer | izpolni implementer po izvedbi |
| R10 | pogled/podrobnosti ohranijo stanje; projekt/osvežitev ponastavita | lastni test poti in `reload` | izpolni implementer | izpolni implementer po izvedbi |
| R11 | točno besedilo statusa in onemogočeni gumbi; 0/1 opravilo | D03; lastni test 0 in 1 opravila | izpolni implementer | izpolni implementer po izvedbi |
| R12 | ista množica ID-jev, ni zapisov, nespremenjeni števci in videz | D04 `readonly`; lastni test 390 pik | izpolni implementer | izpolni implementer po izvedbi |

Vloga avtorja specifikacije ne zaganja aplikacije ali testov; polji
»Datoteka in del kode« ter »Izid ter dokaz« izpolni implementer z dejansko
izvedenimi preverjanji. Noben izid tukaj ni označen kot uspešen.

## Odprta vprašanja in omejitve

- Predpostavka R07: omejitev 20 velja za sklad `U`; ker `R` nastane le iz
  razveljavitev, je `|U| + |R|` posledično omejen s  prvotno zgodovino.
  Implementer mora ohraniti `|U| ≤ 20` ob vsakem pushu, tudi pri ponovitvi.
- Predpostavka R08: ponastavitev se šteje kot veljaven premik, zato jo je
  mogoče razveljaviti; pri že izvornem vrstnem redu je gumb onemogočen in ne
  doda zgodovine.
- Predpostavka R03/R06: klik na onemogočen gumb v brskalniku ne sproži
  dejanja; če koda dejanje vseeno pokliče, mora biti to neopazna operacija
  brez sprememb `P`, `U`, `R`.
- Nejasnosti iz navodil, ki jih ta specifikacija ne širi: sočasne spremembe
  podatkov brez osvežitve in navigacija med nalaganjem ostaneta v okviru
  obstoječih regresijskih zahtev.
- Omejitve okolja: uporabljajo se samo lokalne storitve te naloge; `/__test/`
  uporablja izključno testni program, UI bere samo `/api/`.
- Nepreverjeno v tej vlogi: vsi scenariji (D01–D04, lastni in skupni testi) so
  predvideni, ne izvedeni. Morebitna odstopanja se zabeležijo v
  `docs/agent/specification-history.md` in v pregledu.
