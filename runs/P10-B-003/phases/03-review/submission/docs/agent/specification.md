# Specifikacija P10: Lokalni vrstni red z razveljavitvami

## Problem in kontekst

Uporabnik lokalno preureja opravila trenutnega projekta in premike razveljavlja oziroma ponavlja. Izhodišče prikazuje prejeto polje v preglednici, tabla ga filtrira po stanjih, podrobnosti pa bere ločeno po ID-ju. Nova funkcionalnost ohrani podatke, navigacijo in potrjeni Folio iz `docs/dizajn.md`. Izvirne zahteve `task/instructions.md` veljajo tudi ob morebitni opustitvi v tem dokumentu.

Status: dopolnjena specifikacija po statičnem branju kode in razvojnih testov; implementacija, testi in vizualni pregled še niso izvedeni. Zgodovina zapisa je v [specification-history.md](specification-history.md).

## Vhodi, dejanja in izidi

- Tipi v `shared/types.ts`: `Project { id, name }`; `Task { id, projectId, title, description, status, assignee, dueDate }`, vsa polja so nizi, `status` je `todo | in_progress | done`. Vsa polja opravila ostanejo nespremenjena.
- Obstoječi GET viri: `/api/projects`, `/api/projects/{encodeURIComponent(projectId)}/tasks` in `/api/tasks/{encodeURIComponent(taskId)}`. Izvorni vrstni red določa prejeto polje opravil, brez razvrščanja po naslovu, ID-ju ali datumu.
- Domena: poljubno število opravil, tudi 0, 1 in več kot 10; enkratni poljubni ID-ji, lahko enaki naslovi, veljavni datumi, besedilo z Unicode in ločili. Opravilo pripada svojemu projektu; tudi oba projekta sta lahko prazna. Izbira in povezovanje potekata po ID-ju.
- Dejanja: gor/dol za določen ID, razveljavitev, ponovitev, vrnitev na začetni vrstni red. Uspeh spremeni samo lokalno stanje vrstnega reda in zgodovine. Robno, neznano ali trenutno nedovoljeno dejanje je brez učinka na vse tri dele stanja. Premiki so neposredni, brez potrditvenega dialoga; preklic podrobnosti (Escape/zapri) ne spreminja zgodovine.
- Obstoječa nalaganje in napaka GET s ponovnim poskusom ostaneta uporabna. Pred uspešnim prejemom opravil ni veljavnega premika; po uspešnem prvem nalaganju nastane začetno stanje. Napaka nalaganja podrobnosti ne spreminja reda ali zgodovine projekta.

Dogovor vmesnika velja v obeh pogledih: ob vsakem opravilu sta ločena gumba z dostopnima imenoma `Premakni <id> gor` in `Premakni <id> dol`, zunaj povezave na podrobnosti. Element `aria-label="Mesto opravila <id>"` vsebuje samo globalno številko mesta. Na voljo so `Razveljavi premik`, `Ponovi premik`, `Začetni vrstni red` ter element `role="status"`, `aria-label="Zgodovina vrstnega reda"` z natančnim besedilom `Razveljavitve: U. Ponovitve: R.` (U/R sta števili). Ohranijo se `data-task-id` na vrsticah/karticah, imena pogledov in stolpcev ter `aria-label="Pregled stanj opravil"`. Lokacija kontrol ni predpisana.

## Zahteve in pravila

Naj bo `T` prejeto polje, `I = T.map(t => t.id)` izvorna permutacija, `P` trenutna permutacija, `U` sklad razveljavitev in `R` sklad ponovitev. Vrh sklada je na desni; `S + [p]` doda posnetek, `last(S)` vrne vrh, `pop(S)` sklad brez vrha in `tail20(S)` zadnjih največ 20 posnetkov. Enakost permutacij pomeni enakost vseh ID-jev na istih mestih. Posnetki so neodvisni: kasnejše dejanje jih ne sme mutirati; ponovljena enaka permutacija je lahko drug zgodovinski korak in se ne združuje.

Pravila spremembe stanja:

1. Začetek projekta oziroma osvežitev: `(P,U,R) = (I,[],[])`. Invarianta po vsakem dejanju: `|P| = |I|`, `set(P) = set(I)`, `|set(P)| = |P|`, `|U| ≤ 20`; vsak posnetek v U/R je prav tako permutacija I. Podatki `T` se ne spreminjajo.
2. Za ID `x` in smer `d ∈ {-1,+1}` naj bo `i = indexOf(P,x)`. Premik je veljaven natanko, ko `i ≥ 0` in `0 ≤ i+d < |P|`. Tedaj `Q = swap(P,i,i+d)` in `(P,U,R) ← (Q,tail20(U+[P]),[])`. Sicer se stanje v celoti ohrani, tudi R.
3. Razveljavitev pri `|U| > 0`: `(P,U,R) ← (last(U),pop(U),R+[P])`. Ponovitev pri `|R| > 0`: `(P,U,R) ← (last(R),tail20(U+[P]),pop(R))`. Pri praznem ustreznem skladu je dejanje brez učinka.
4. Začetni vrstni red pri `P ≠ I`: `(P,U,R) ← (I,tail20(U+[P]),[])`. Pri `P = I` je dejanje onemogočeno in ne spreminja nobenega sklada, tudi če zgodovina ni prazna.
5. Globalno mesto `rank(x) = indexOf(P,x)+1`. Preglednica sledi P; stolpec stanja s sledi podsekvenci `[x ∈ P | T[x].status = s]`, kjer `T[x]` pomeni iskanje po ID-ju. Globalni red ni vrstni red vseh kartic, združenih po DOM stolpcih.

| Zahteva | Pravilo oziroma sprejemni pogoj | Način preverjanja |
| --- | --- | --- |
| R01 | Začetni P je natančno I, vsako mesto je 1–N po ID-ju; enaki naslovi ostanejo neodvisni. | S1: drugačen vhodni red, poljubni ID-ji, enaki naslovi, >10 opravil; primerjava vseh ID-jev in mest. |
| R02 | Pravilo 2 zamenja neposredna globalna soseda; nobeno polje ali status se ne spremeni. | D01 + S1/S5: obe smeri, primerjava celotnih podatkov pred/po. |
| R03 | Gor je onemogočen natanko pri mestu 1, dol pri mestu N. Neveljavno ali ponovljeno robno dejanje ničesar ne spremeni. | D01 + S3: oba robova; po doseženem robu preveriti red in oba sklada. |
| R04 | Vsak veljaven premik doda celotni prejšnji P; razveljavitev deluje po pravilu 3. | D02 + S2: več različnih premikov, preverjanje vseh vmesnih permutacij in števcev. |
| R05 | Ponovitev deluje po pravilu 3; več undo/redo korakov ne izgubi ali podvoji ID-jev. | D02 + S2: celotna veriga nazaj/naprej, prazna sklada in invarianta pri vsakem koraku. |
| R06 | Nov veljaven premik počisti celotni R; neveljavno dejanje R ohrani. | D03 + S3: veja po več razveljavitvah ter neveljaven premik ob nepraznem R. |
| R07 | U hrani največ 20 prejšnjih permutacij; 21. veljavno dejanje odstrani najstarejšo. Ponoviti je mogoče vse trenutno razveljavljene korake. | S4: 21 premikov, 20 razveljavitev do stanja po prvem premiku, 20 ponovitev do končnega stanja. |
| R08 | Pravilo 4; vrnitev na I je natanko en korak v U in počisti R. Pri P=I je gumb onemogočen, zgodovina ostane. | D04 + S3/S4: reset po delnem undo, undo/redo reseta in reset ob polnem U. |
| R09 | Preglednica in stalni stolpci Pripravljeno/V delu/Končano sledijo pravilu 5. Premik na tabli uporablja globalnega soseda tudi v drugem stolpcu; status ostane. | D04 + S5: soseda različnih stanj, preverjanje globalnih mest in vsake podsekvence stolpca. |
| R10 | Preklop pogledov ter odpiranje/zapiranje podrobnosti ohranita P/U/R. Menjava projekta, tudi vrnitev na prejšnjega, in osvežitev inicializirajo izhodišče z U=R=[]. | S6: ohranitev nepraznih obeh skladov skozi navigacijo; projekt A→B→A in osvežitev v obeh pogledih. |
| R11 | Status prikazuje dolžini skladov U in R; gumba undo/redo sta onemogočena natanko pri praznem ustreznem skladu. Pri 0/1 opravil ni dovoljenega premika, zgodovini sta prazni; navigacija in pogleda delujeta. | D03 + S2/S7: števci po vseh dejanjih, oba prazna projekta, enojni projekt in oba pogleda. |
| R12 | Samo lokalne permutacije; noben zapis API, trajna shramba ali mutacija podatkov. Števci stanj, podrobnosti po ID-ju in prilagodljivi Folio ostanejo pravilni. | D04 + S8 in izhodiščne regresije: nadzor zapisov, podatkov, tipkovnice ter širine 390 pik. |

Scenariji S1–S8 so načrt za implementerjeve teste v `tests/agent/`, ne že obstoječi testi. D01–D04 so dejanska imena primerov v `tests/development/P10.spec.ts`.

Konkretni dodatni primeri (splošna pravila zgoraj veljajo za vse dovoljene podatke):

- **S2:** pri I=[a,b,c,d] premik b gor da [b,a,c,d], d gor da [b,a,d,c]. Dve razveljavitvi dasta [b,a,c,d] in I; dve ponovitvi obnovita obe stanji. Števci so 1/0, 2/0, 1/1, 0/2, 1/1, 2/0.
- **S3:** po premiku b gor in razveljavitvi je P=I in R neprazen. Nedovoljeni a gor, zadnji dol in onemogočeni reset ohranijo R; veljaven c gor ga počisti. Posebej reset iz spremenjenega reda z nepraznim R doda natanko en korak; undo obnovi prejšnji red, redo I.
- **S4:** po 21 veljavnih premikih je U=20. Dvajset undo doseže P po prvem premiku, ne stanje pred njim; naslednji undo je onemogočen. Dvajset redo doseže zadnje stanje. Dovoljeno je večkrat zamenjati isti par; ponavljajoči posnetki se ne združujejo.
- **S5:** I=[a(todo),b(done),c(todo)]. b gor da [b,a,c]; vrstni red v vsakem stolpcu lahko ostane isti, mesta pa so b=1,a=2,c=3. c gor nato da [b,c,a] in v stolpcu todo [c,a]. Statusi in števci se ne spremenijo.
- **S6/S8:** pred preklopom pogleda in obiskom podrobnosti ustvariti neprazna U in R; preveriti obe zgodovini tudi z nadaljnjim undo/redo. Odpreti pravi ID pri enakih naslovih; zapreti z gumbom in Escape. Pri 390 pikah velja `document.documentElement.scrollWidth <= window.innerWidth`; notranje drsenje je dovoljeno, kontrola premika ne odpira podrobnosti, fokus je viden.

## Izvedba in sledljivost

Predlagano mesto lastništva P/U/R je `ProjectView` v `src/App.tsx` oziroma njegov lokalni hook/reducer v `src/`. `App` že uporablja `key={project.id}`: menjava projekta odstrani staro stanje, sprememba `view`/`taskId` ga ohrani. Stanja ne vezati samo na vejo preglednice/table ali na podrobnosti, ker se te veje odklapljajo. Inicializacija mora upoštevati, da `useResource` najprej vrne `null`, nato polje, vključno s praznim poljem. `TaskBoard` naj prejme urejena opravila, globalna mesta in skupna dejanja; indeksi filtriranega stolpca niso globalni indeksi.

| Zahteva | Pogoj | Test ali scenarij | Datoteka in del kode | Izid ter dokaz |
| --- | --- | --- | --- | --- |
| R01 | I iz prejetega polja; rank po ID-ju | S1 | `src/App.tsx`: ProjectView, nalaganje in tbody; `src/TaskBoard.tsx`: kartice | Statično pregledano; test ni izveden. |
| R02 | Globalna soseda, nespremenjen Task | D01, S1/S5 | `src/App.tsx`: novo skupno stanje/dejanja; `src/TaskBoard.tsx`: kontrola premika | Predlagano; test ni izveden. |
| R03 | Robovi in nedejavna zgodovina | D01, S3 | Ista dejanja in disabled stanja kontrol v obeh pogledih | Predlagano; test ni izveden. |
| R04 | Posnetek P in undo | D02, S2 | `src/App.tsx`: nova zgodovina projekta oziroma lokalni hook | Predlagano; test ni izveden. |
| R05 | Redo in permutacijske invariante | D02, S2 | Isto skupno stanje projekta | Predlagano; test ni izveden. |
| R06 | R se počisti le pri veljavnem novem dejanju | D03, S3 | Skupna obdelava premika, validacija pred spremembo skladov | Predlagano; test ni izveden. |
| R07 | tail20 in celotna veriga redo | S4 | Skupno stanje: dodajanje posnetkov v U | Predlagano; test ni izveden. |
| R08 | Razveljavljiv reset, preverjanje P=I | D04, S3/S4 | Skupno stanje in nove kontrole v ProjectView | Predlagano; test ni izveden. |
| R09 | Filtrirana globalna permutacija | D04, S5 | `src/TaskBoard.tsx`: columns, entries, globalna mesta; `src/App.tsx`: tbody | Izhodišče statično pregledano; test ni izveden. |
| R10 | Življenjska doba projekta | S6; regresije navigacije | `src/App.tsx`: ProjectView key; `src/navigation.ts`; `src/TaskDetails.tsx`: close/onCancel | Izhodišče statično pregledano; test ni izveden. |
| R11 | Števci, disabled in prazni podatki | D03, S2/S7 | `src/App.tsx`: skupne kontrole in prazno stanje; `src/TaskBoard.tsx`: prazni stolpci | Predlagano; test ni izveden. |
| R12 | Brez zapisov, nespremenjen Folio | D04, S8; baseline/API regresije | `src/api.ts`, `src/useResource.ts`, ProjectView counts, TaskDetails, `src/styles.css` | Izhodišče statično pregledano; test in vizualni pregled nista izvedena. |

Implementer naj uporabi obstoječe preverjanje `npm run check` (lint, build/typecheck, Playwright), razvojna projekta `development-desktop`/`development-mobile` in lastne smiselne scenarije S1–S8. `playwright.config.ts` že vključuje `tests/agent/**/*.spec.ts`; konfiguracije ne spreminja. Dejanske datoteke, imena testov, rezultate in dnevnike naj zapiše v lastne dokumente v `docs/agent/`, povezane z R01–R12. Ta specifikacija ostaja v lastništvu prvotnega avtorja; njene popravke opravi avtor v nadaljevani seji.

## Odprta vprašanja in omejitve

Ni odprtega vprašanja, ki bi blokiralo implementacijo. Predpostavka za »osvežitev« je ponovni zagon strani, ki znova prebere aktualno polje API-ja; za povratek na projekt se prav tako uporabi novo prejeto izhodišče. Novo stanje se ne zapisuje v URL, localStorage ali drugo trajno shrambo. Sočasnih sprememb podatkov brez osvežitve in navigacije med nalaganjem ne širimo prek obstoječih regresijskih zahtev.

V tej vlogi niso bili zagnani aplikacija, testi ali pregled videza; vsi rezultati vedenjskih preverjanj so odprti za implementerja in reviewerja. Končni testi niso dostopni; D01–D04 ne pokrivajo vseh zahtev. API ima pripravljen `updateTask` za starejšo nalogo, vendar ga P10 ne sme klicati. Testni pripomočki in `/__test/` so dovoljeni le testnemu programu, nikoli aplikaciji. Strežnik, skupni tipi/testi, infrastruktura, odvisnosti, navodila ter drugi projekti so zunaj dovoljenih sprememb. Nova postavitev mora uporabiti obstoječe Folio gradnike, ohraniti mobilno navigacijo, barve in tipografijo; preglednica in tabla se lahko pomikata znotraj lastnega prikaza.
