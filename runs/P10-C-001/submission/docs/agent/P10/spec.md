# P10 — Lokalni vrstni red z razveljavitvami

Različica 1.1 · 2026-09-22 · Stanje: implementirano in lokalno preverjeno; 58/58 testov uspešnih.

## Problem in kontekst

Folio prikazuje opravila projekta v preglednici ali tabli ter odpira njihove podrobnosti. Izhodišče uporablja vrstni red polja javnega API-ja brez lokalnih premikov. Uporabnik želi opravila premikati po globalnem vrstnem redu, dejanja razveljaviti oziroma ponoviti in obnoviti začetni vrstni red, ne da bi spreminjal podatke opravil.

Merilo so [izvirne zahteve R01–R12](../../../task/instructions.md), [projektna pravila](../../../PROJECT_RULES.md) in [ustava](../../../.specify/memory/constitution.md). Ta dokument izpolnjuje [skupno predlogo](../../../task/specification-template.md). Ohrani se [potrjeni Folio](../../dizajn.md), obstoječa navigacija, stanja nalaganja/napak/praznine in dostopnost.

## Vhodi, dejanja in izidi

Vhod je polje opravil trenutnega projekta iz obstoječega `/api/`. Opravilo ima `id`, `projectId`, `title`, `description`, `status`, `assignee`, `dueDate`; projekt ima `id` in `name`. Enkratni ID je identiteta. Statusi ostajajo `todo`, `in_progress`, `done`. Število opravil je poljubno, vključno z 0, 1 in več kot 10; oba projekta sta lahko prazna. Besedilna polja lahko vsebujejo Unicode, ločila in enake naslove, datumi so veljavni. Podatkov ne prilagajamo začetnim primerom.

Po uspešnem branju nastane izvorni vrstni red in prazni zgodovini. Dovoljena dejanja so premik gor/dol, razveljavitev, ponovitev, začetni vrstni red ter obstoječa navigacija. Lokalno dejanje je takojšnja sprememba vrstnega reda; ne kliče zapisovalnega API-ja in nima dodatne potrditve ali preklica. Neveljavno/onemogočeno dejanje ne spremeni ničesar. Napake branja in ponovni poskus ohranijo obstoječe obnašanje; ni nove poti za napake shranjevanja, ker shranjevanja ni.

### Model in pravila spremembe stanja

Naj bo `T` prejeta zbirka opravil, `I = T.map(id)` izvorna permutacija, `O` trenutna permutacija, `U` sklad prejšnjih permutacij in `R` sklad ponovitev. Sklada sta zaporedji s krajiščem na desni; `A ⧺ [x]` doda posnetek, `last(A)` vrne zadnjega, `init(A)` vse razen zadnjega. `cap(A)` obdrži zadnjih največ 20 posnetkov. Enakost permutacij pomeni enake ID-je na vseh mestih, ne le enake množice. Prikaz podatkov se vedno razreši po ID-ju v `T`.

- **P1 — začetno stanje:** `(O,U,R) = (I,[],[])`. Globalno mesto ID-ja `x` je `indexOf(O,x)+1`.
- **P2 — invariant:** `length(O)=length(I)` in vsak ID iz `I` nastopa v `O` natanko enkrat. Enako velja za vsak posnetek v `U` in `R`. Vsa polja vsakega opravila ostanejo enaka prejetim. `0 ≤ length(U) ≤ 20`.
- **P3 — premik:** za smer `d ∈ {-1,+1}` in indeks `i=indexOf(O,x)` je dejanje veljavno natanko tedaj, ko `i≥0` in `0≤i+d<length(O)`. Tedaj `O'=swap(O,i,i+d)`, `U'=cap(U ⧺ [O])`, `R'=[]`. Sicer `(O',U',R')=(O,U,R)`, tudi če `R` ni prazen. Menjava je vedno z globalnim sosedom, ne s sosedom istega statusa.
- **P4 — razveljavitev:** če `U` ni prazen, `(O',U',R')=(last(U),init(U),R ⧺ [O])`; sicer stanje ostane enako.
- **P5 — ponovitev:** če `R` ni prazen, `(O',U',R')=(last(R),cap(U ⧺ [O]),init(R))`; sicer stanje ostane enako. Vsi trenutno razveljavljeni koraki so dosegljivi v pravilnem vrstnem redu.
- **P6 — začetni vrstni red:** če `O≠I`, `(O',U',R')=(I,cap(U ⧺ [O]),[])`. To je eno novo razveljavljivo dejanje. Če `O=I`, je celotno stanje nespremenjeno, tudi morebitne ponovitve.
- **P7 — projekciji:** preglednica prikazuje `O`; stolpec table za status `s` prikazuje `filter(O, id => T[id].status=s)`. Stolpci ostajajo Pripravljeno, V delu, Končano. Mesto na obeh pogledih je globalno po P1.
- **P8 — življenjska doba:** preklop pogleda in odpiranje/zapiranje podrobnosti ne spremenita `(O,U,R)`. Menjava projekta, vključno z vrnitvijo na prejšnjega, in osvežitev vzpostavita P1 iz njegovega prejetega polja. Nova zgodovina in vrstni red se ne zapisujeta v trajno shrambo ali URL.

### Dogovor o vmesniku

Ob vsaki vrstici/kartici sta gumba z dostopnima imenoma `Premakni <id> gor` in `Premakni <id> dol`, zunaj povezave opravila. Prvi je onemogočen pri globalnem mestu 1, drugi pri mestu N. Element `aria-label="Mesto opravila <id>"` vsebuje samo globalno številko. Ohranijo se `data-task-id` na vrsticah/karticah, dostopna imena pogledov in stolpcev ter `aria-label="Pregled stanj opravil"`.

Skupni gumbi so `Razveljavi premik`, `Ponovi premik`, `Začetni vrstni red`. Prva dva sta onemogočena natanko pri praznem pripadajočem skladu; zadnji pri `O=I`. Element `role="status"`, `aria-label="Zgodovina vrstnega reda"` kaže `Razveljavitve: U. Ponovitve: R.`, kjer sta U in R dolžini skladov. Pri praznem projektu ostanejo skupne kontrole in števec uporabni, pri enem opravilu sta oba premika onemogočena.

Razporeditev novih kontrol uporablja obstoječi slog Folio. Pri širini 390 pik se cela stran ne razširi; preglednica in tabla se lahko pomikata znotraj svojega območja. Vidni fokus in obstoječa tipkovnična navigacija se ohranita.

## Zahteve in pravila

| Zahteva | Pravilo oziroma sprejemni pogoj | Način preverjanja |
| --- | --- | --- |
| R01 | P1: izvorno zaporedje API-ja, globalna mesta 1…N po ID, enaki naslovi ne povezujejo opravil. | S1: drugačen vrstni red, poljubni ID-ji, podvojeni naslovi. |
| R02 | P2/P3: zamenjava neposrednih globalnih sosedov v obeh smereh, nespremenjena polja/status. | S1/S4: oba pogleda, premik prek različnih statusov. |
| R03 | P3: robna gumba onemogočena; neveljaven ali ponovljen robni korak ne spremeni nobenega sklada. | S2: rob pred in po razveljavitvi ter ponovljeno dejanje. |
| R04 | P3/P4: vsak veljaven premik shrani celotno prejšnjo permutacijo; undo jo obnovi in shrani trenutno v R. | S2: primerjava vseh ID-jev in števcev po več korakih. |
| R05 | P2/P5: redo obnovi zadnji razveljavljen posnetek; zaporedji ostaneta pravilni, brez izgubljenih/podvojenih ID-jev. | S2/S3: več undo/redo, primerjava z modelom. |
| R06 | P3: nov veljaven premik počisti celoten R; neveljaven ga ohrani. | S2: razvejitev zgodovine in robni korak z nepraznim R. |
| R07 | P2/P3/P5: največ 20 prejšnjih posnetkov; 21. izrine najstarejšega, vse aktualne razveljavitve je mogoče ponoviti. | S3: več kot 20 premikov, popoln undo in redo. |
| R08 | P6: začetni vrstni red je eno razveljavljivo dejanje s praznim R; pri že izvornem vrstnem redu ničesar ne spremeni. | S3: reset, undo, redo; onemogočen reset ob nepraznem R. |
| R09 | P7: tabela je globalna, tabla ohrani relativni vrstni red po stalnih statusih; premiki/mesta so globalni. | S4: soseda različnih statusov, preverjanje zaporedij stolpcev in mest. |
| R10 | P8: pogled in podrobnosti ohranijo obe zgodovini; projekt in osvežitev vse ponastavita. | S5: navigacija z nepraznima skladoma, povratek v projekt, osvežitev. |
| R11 | Števec je usklajen s skladoma; gumba sta onemogočena pri ničli; N=0 in N=1 brez dovoljenega premika. | S2/S6: točno besedilo, omogočenost vseh kontrol, prazna projekta in eno opravilo. |
| R12 | P2, P7 in vmesnik: samo lokalne permutacije; nič zapisov na API, nespremenjeni podatki, števci/podrobnosti, prilagodljiv Folio. | S4/S6: spremljanje zahtev in vsebine, podrobnosti po ID-ju, širina 390 pik, regresijski testi. |

### Uporabniški scenariji in merila uspeha

S1: uporabnik odpre projekt z enakimi naslovi in poljubnim začetnim zaporedjem ter premika izbrani ID gor in dol. S2: opravi več premikov, razveljavi, poskusi robno dejanje, ponovi in po ponovni razveljavitvi ustvari novo vejo. S3: opravi vsaj 21 veljavnih premikov, izčrpa razveljavitve/ponovitve ter obnovi in razveljavi začetni vrstni red. S4: na tabli premakne opravilo prek globalnega soseda drugega statusa, preveri mesta, stolpce, polja in podrobnosti. S5: z nepraznima skladoma menja pogled, odpre/zapre podrobnosti, menja projekta in osveži. S6: uporablja prazen projekt ter projekt z enim opravilom in oba pogleda na širini 390 pik.

Uspeh pomeni izpolnjene vse sprejemne pogoje R01–R12 in ohranjeno obstoječe delovanje. Razvojni D01–D04 pokrivajo le del zahtev; potrebna so dodatna preverjanja scenarijev in skupni regresijski testi. Scenariji so primeri preverjanja splošnih pravil, ne omejitev domene.

## Izvedba in sledljivost

Osrednja [tabela sledljivosti R01–R12 in dokazila](../verification.md#izvedba-in-sledljivost-r01r12) povezuje vsak pogoj s končno datoteko/simbolom, imeni dejansko izvedenih testov in izidi. S tem razdelkom je pokrit istoimenski razdelek skupne predloge brez podvajanja tabele. [Naloge](tasks.md) so zaključene; [načrt](plan.md) opisuje uporabljeno zasnovo.

Končni `npm run check` je uspešen: lint, tipi/build in 58 testov (38 osnovnih, 8 razvojnih in 12 lastnih). Podrobnosti, prejšnja neuspešna zagona zaradi napak v lastnih testih, popravki in vizualni pregled so v [dnevniku](../verification.md).

## Odprta vprašanja in omejitve

Ni bistvenih odprtih vprašanj: pot funkcionalnosti in pravila so podani. Razporeditev novih kontrol ni predpisana in sledi Foliu. Navigacije med nezaključenim nalaganjem in novih sočasnih sprememb brez osvežitve ne širimo prek obstoječih regresijskih zahtev. Testni pripomočki in `/__test/` so namenjeni samo testom. Aplikacija jih ne uvaža ali uporablja.

Implementacija in lokalno preverjanje sta zaključena; končni skriti testi niso dostopni in niso izvedeni. Omejitve dokazil so navedene v [predaji](../verification.md#omejitve-in-predaja). Odvisnosti, strežnik, skupni tipi/testi, nastavitve in uradne predloge ostanejo nespremenjeni; dovoljena območja določa ustava in uporabnikova izrecna dopolnitev. Specifikacija ne zahteva novih meritev, trajne shrambe ali infrastrukturnih posegov.

## Zgodovina sprememb

- 2026-09-22, 1.0: začetna specifikacija R01–R12, formalna pravila P1–P8, scenariji S1–S6 in izrecno neizvedena sledljivost.

- 2026-09-22, 1.1: izvedeni T001–T009; sledljivost preseljena v osrednji `docs/agent/verification.md` po navodilu koraka implement; dodani dejanski rezultati in omejitve. Funkcionalna pravila ostajajo enaka.
