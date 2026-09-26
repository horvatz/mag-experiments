# P10: Lokalni vrstni red z razveljavitvami

## Problem in kontekst

Uporabnik preureja opravila trenutnega projekta, razveljavlja in ponavlja spremembe ter obnovi začetni vrstni red. Obvezna podlaga so vse zahteve R01–R12 in dogovor o vmesniku iz `task/instructions.md`; ta specifikacija jih ne zožuje. Ohraniti je treba slovenski Folio po `docs/dizajn.md`.

Izhodišče: `src/App.tsx`, komponenta `ProjectView`, pridobi polje opravil, iz njega izračuna števce in izriše preglednico oziroma `TaskBoard`. Tabla že filtrira prejeto polje v tri stalne stolpce. `ProjectView` ima `key={project.id}`; pogled in odprte podrobnosti sta njegova parametra. `TaskDetails` podrobnosti pridobi po ID-ju. Funkcionalnost preurejanja in zgodovini še nista implementirani.

## Vhodi, dejanja in izidi

- `shared/types.ts`: `Project` vsebuje `id`, `name`; `Task` vsebuje nize `id`, `projectId`, `title`, `description`, `assignee`, `dueDate` in `status: 'todo' | 'in_progress' | 'done'`. Nobenega polja se ne spreminja. Datumi so veljavni koledarski datumi; naslovi, opisi in imena so navadno besedilo z morebitnim Unicode in ločili.
- Obstoječi GET `/api/projects`, `/api/projects/:projectId/tasks` in `/api/tasks/:taskId` ostanejo vir podatkov. ID-ji se v URL-jih kodirajo z obstoječimi pripomočki. `src/api.ts` sicer vsebuje `updateTask`, vendar ga ta funkcija ne sme klicati.
- Polje vsebuje poljubno število opravil, tudi 0, 1 ali več kot 10. ID-ji so enkratni, niso omejeni na začetne primere; enaki naslovi ne pomenijo istega opravila. Vsako opravilo pripada svojemu projektu; prazna sta lahko oba projekta.
- Po uspešnem nalaganju se vzpostavijo izvorni red, trenutni red in prazni zgodovini. Veljavna dejanja spreminjajo samo lokalni red in zgodovini. Neveljavna dejanja so brez učinka. Zapiranje podrobnosti, tudi z Escape, ni sprememba reda.
- Med nalaganjem ali napako brez podatkov ni dovoljenega premika. Ohranijo se obstoječa stanja nalaganja, napak in ponovnega poskusa; uspešen ponovni poskus začetnega nalaganja vzpostavi izhodišče iz prejetega polja. Lokalna dejanja nimajo strežniškega shranjevanja ali novega potrditvenega dialoga.

Dogovor o vmesniku v obeh pogledih:

- Vsaka vrstica/kartica ohrani `data-task-id`. Gumba imata dostopni imeni `Premakni <id> gor` in `Premakni <id> dol`; sta zunaj povezave opravila in ne odpirata podrobnosti. Element `aria-label="Mesto opravila <id>"` prikazuje samo globalno številko mesta.
- Projekt ima gumbe `Razveljavi premik`, `Ponovi premik`, `Začetni vrstni red` ter element `role="status"`, `aria-label="Zgodovina vrstnega reda"`, z natančnim besedilom `Razveljavitve: U. Ponovitve: R.` (U in R sta števili).
- Ohranijo se dostopna imena `Preglednica`, `Tabla`, `Tabla opravil`, stolpcev `Pripravljeno`, `V delu`, `Končano` in `aria-label="Pregled stanj opravil"`. Nove kontrole morajo biti uporabne s tipkovnico in imeti viden fokus. Razporeditev kontrol ni predpisana.

## Zahteve in pravila

Naj bo `T` prejeto polje opravil, `O = T.map(t => t.id)` izvorni red, `P` trenutni red, `H` sklad razveljavitev, `F` sklad ponovitev in `N = O.length`. Sklada hranita neodvisne posnetke celotnih permutacij; vrh je na koncu. `append(S, x)` doda posnetek x na konec, `tail20(S)` obdrži zadnjih največ 20 elementov, `last`/`init` vrneta zadnji element/vse razen zadnjega. Enakost redov je enakost po elementih in njihovih mestih.

Invarianta: vsak `Q` iz `{O, P}` ter iz skladov H in F ima dolžino N, brez ponovljenih ID-jev in `set(Q) = set(O)`. Za vsak ID ostanejo vsa polja T enaka. `rank(id) = indexOf(P, id) + 1`; mesta so točno 1–N.

Prehodi spodaj so atomski in uporabljajo stanje neposredno pred dejanjem:

- Inicializacija: `(P, H, F) := (O, [], [])`.
- Premik ID-ja v smeri `d ∈ {-1, +1}` je veljaven samo, če `i = indexOf(P, id) ≥ 0` in `0 ≤ i+d < N`. Tedaj je `Q = swap(P, i, i+d)` in `(P, H, F) := (Q, tail20(append(H, P)), [])`. Sicer ostanejo vse tri vrednosti enake.
- Razveljavitev ob nepraznem H: `(P, H, F) := (last(H), init(H), append(F, P))`. Ob praznem H ni učinka.
- Ponovitev ob nepraznem F: `(P, H, F) := (last(F), tail20(append(H, P)), init(F))`. Ob praznem F ni učinka. Razveljavitve in ponovitve ne ustvarjajo novih vej zgodovine.
- Obnova izhodišča ob `P ≠ O`: `(P, H, F) := (O, tail20(append(H, P)), [])`. Ob `P = O` je brez učinka, tudi če F ni prazen.

| Zahteva | Pravilo oziroma sprejemni pogoj | Način preverjanja |
| --- | --- | --- |
| R01 | Inicializacija ohrani vrstni red GET polja; vidna mesta so rank(id). ID, ne naslov ali številčni del ID-ja, določa identiteto. | S1: drugačen red in poljubni ID-ji, podvojeni naslovi, N > 10. |
| R02 | Veljaven premik zamenja natanko globalna soseda po zgornjem prehodu; vsa polja in status ostanejo enaki. | D01, S1, S4; primerjaj celotni red pred/po. |
| R03 | Gor je onemogočen pri rank=1, dol pri rank=N; neveljavno ali ponovljeno robno dejanje ne spremeni P, H ali F. | D01 delno; S2 tudi ob nepraznem F in po prihodu na rob. |
| R04 | Vsak veljaven premik shrani prejšnji celotni P. Razveljavitev uporabi vrh H in sedanji P shrani v F. | D02 in S2; preveri red in oba števca po vsakem dejanju. |
| R05 | Ponovitev uporabi vrh F in obnovi celotno permutacijo; več razveljavitev in ponovitev ohrani pravilno zaporedje in invarianto. | S2 z vsaj tremi različnimi koraki, celotnim povratkom ter mešanjem undo/redo. |
| R06 | Nov veljaven premik po razveljavitvi izprazni ves F; neveljaven premik ga ne spremeni. | D03 za prvo vejo, S2 za obe in več kot eno ponovitev. |
| R07 | Vedno 0 ≤ H.length ≤ 20. Po 21 veljavnih premikih je najstarejši posnetek odstranjen; obnoviti je mogoče vseh 20 ohranjenih korakov. | S3: 21+ premikov, 20 razveljavitev do reda po prvem premiku, nato 20 ponovitev do zadnjega reda. |
| R08 | Obnova izhodišča je natanko eno razveljavljivo dejanje, počisti F in upošteva omejitev H; gumb je onemogočen natanko pri P=O. Takrat zgodovini ostaneta enaki. | D04 delno; S2: obnova, undo/redo obnove in obnova brez učinka pri nepraznem F. |
| R09 | Preglednica izriše P. Stolpci table ostanejo v vrstnem redu todo, in_progress, done; za stanje s prikažejo P, filtriran po statusu s. Mesta in premiki so globalni. | S4: zamenjava med različnima statusoma lahko spremeni samo mesti, ne reda kartic znotraj stolpca; primerjaj s preglednico. |
| R10 | Preklop pogleda in odpiranje/zapiranje podrobnosti ohranita (P,H,F). Menjava projekta, tudi vrnitev v prejšnji projekt, in osvežitev vzpostavijo (O,[],[]) iz podatkov tega projekta. | S5 ob hkrati nepraznih H in F; preveri nadaljnjo razveljavitev in ponovitev ter oba projekta in reload. |
| R11 | Status kaže U=H.length in R=F.length; undo je onemogočen natanko pri U=0, redo pri R=0. Pri N=0 ali N=1 so zgodovini prazni in vsi premiki ter obnova onemogočeni; navigacija in pogleda ostanejo uporabni. | S6 za oba prazna projekta in eno opravilo; števce preverjaj tudi v S2/S3. |
| R12 | Vse spremembe so lokalne permutacije iste množice ID-jev; ni sprememb polj, zapisovalnih zahtev na API ali trajne shrambe. Števci stanj in podrobnosti po ID-ju ostanejo pravilni. Folio ohrani prilagodljivost. | S1/S4/S6: primerjaj polja, števce, podrobnosti in omrežje; pri 390 px velja document.documentElement.scrollWidth ≤ innerWidth. |

## Izvedba in sledljivost

Spodnja mesta so preverjene navezave v izhodiščni kodi in predlagana mesta sprememb, ne trditev o dokončani implementaciji. Stanje reda in zgodovini naj živijo na ravni `ProjectView` oziroma v njegovem lokalnem hooku, zunaj vej preglednice/table in podrobnosti. Obstoječi ključ projekta omogoča ponastavitev pri menjavi projekta. Novi posnetki se ne smejo pozneje spreminjati prek deljenih mutabilnih polj. Tabla potrebuje globalna mesta in dejanja iz istega stanja kot preglednica.

D01–D04 so obstoječi testi v `tests/development/P10.spec.ts`. S1–S6 so predlagani dodatni scenariji v `tests/agent/`, ki še niso napisani ali izvedeni:

- **S1:** različni ID-ji in vrstni red, >10 opravil, enaki naslovi ter Unicode/ločila; globalna mesta, invariantna množica ID-jev, polja in pravilne podrobnosti po premikih.
- **S2:** vsaj trije premiki, več undo/redo, nova veja, neveljaven rob ob nepraznem F, obnova in undo/redo obnove. Posebej po undo v izhodišče preveri onemogočeno obnovo, ki ohrani F.
- **S3:** shrani pričakovani red po vsakem od 21 veljavnih premikov; preveri limit 20, celotno izčrpanje H in F, onemogočenost ter števce. Dodatno obnova pri polnem H prav tako zavrže najstarejši posnetek.
- **S4:** npr. O=[a(todo), b(done), c(todo)]. Na tabli premik c gor da P=[a,c,b], rank(c)=2 in rank(b)=3; stolpec todo ostane [a,c], done [b]. Nato premik c gor da P=[c,a,b] in todo [c,a]. Statusi in števci so ves čas enaki.
- **S5:** ustvari oba neprazna sklada, zamenjaj pogled, odpri pravilne podrobnosti in zapri z gumbom ter Escape; nadaljuj zgodovino. Prehod v drug projekt in nazaj ter reload ponastavijo red in oba sklada.
- **S6:** N=0 in N=1 v obeh pogledih, oba projekta prazna; uporabna navigacija, stolpci, pravilni onemogočeni gumbi in status. Pri širini 390 px preveri obe postavitvi, dolga besedila, viden fokus in dejanja zunaj povezav. Spremljaj odsotnost zapisov na API skozi dejanja.

| Zahteva | Pogoj | Test ali scenarij | Datoteka in del kode | Izid ter dokaz |
| --- | --- | --- | --- | --- |
| R01 | O, rank, invarianta | S1 | `src/App.tsx`: nalaganje in izris vrstic; `src/TaskBoard.tsx`: kartice | Statično prebrano; izvedbeni test ni izveden. |
| R02 | Globalni swap | D01, S1, S4 | `src/App.tsx`: novo lokalno stanje in dejanja; `src/TaskBoard.tsx`: klic dejanja | Ni izvedeno. |
| R03 | Robni no-op | D01, S2 | Isti prehod ter disabled gumbov v obeh pogledih | Ni izvedeno. |
| R04 | Push/pop H | D02, S2 | `src/App.tsx`: lokalna zgodovina in kontrola undo | Ni izvedeno. |
| R05 | Push/pop F | D02, S2 | `src/App.tsx`: lokalna zgodovina in kontrola redo | Ni izvedeno. |
| R06 | Razvejanje | D03, S2 | Prehod za veljaven/neveljaven premik | Ni izvedeno. |
| R07 | tail20 | S3 | Prehodi zgodovine pri premiku, obnovi in ponovitvi | Ni izvedeno. |
| R08 | Obnova/no-op | D04, S2, S3 | `src/App.tsx`: kontrola in prehod obnove | Ni izvedeno. |
| R09 | Filter P po statusu | D04 delno, S4 | `src/TaskBoard.tsx`: columns, entries, globalna mesta/dejanja | Izhodiščna filtracija prebrana; test ni izveden. |
| R10 | Življenjska doba stanja | S5, regresijski testi navigacije | `src/App.tsx`: ProjectView/key; `src/navigation.ts`; `src/TaskDetails.tsx`: close | Izhodiščna navigacija prebrana; test ni izveden. |
| R11 | Števci/disabled, N≤1 | D03 delno, S2, S3, S6 | `src/App.tsx`: kontrole/status/prazen prikaz; `src/TaskBoard.tsx`: prazni stolpci | Ni izvedeno. |
| R12 | Polja, brez zapisov, Folio | D04 delno, S1, S4, S6; skupni regresijski testi | `src/api.ts`, `src/App.tsx`: counts; `src/TaskDetails.tsx`; `src/styles.css`: drsenje, odzivne postavitve | Koda in dizajn prebrana; omrežje in videz nista preverjena. |

Implementer naj opravi `npm run lint`, `npm run build` in `npm test` (skupni API/regresijski testi, razvojni testi za namizni in mobilni prikaz ter lastni testi), v svojih izvedbenih zapiskih pa navede dejanske datoteke/funkcije, imena testov, rezultate in poti do dnevnikov oziroma dokazov ter jih poveže z R01–R12. Ne spreminja te specifikacije, ki je last avtorja; popravke specifikacije opravi prvotni avtor v nadaljevani seji. Uspešni skupni testi sami ne dokazujejo vseh zahtev P10.

## Odprta vprašanja in omejitve

Ni blokirajočih nejasnosti. Izraz »izhodišče projekta« pomeni red trenutnega GET odgovora po vstopu/osvežitvi, ne vnaprej vgrajenega seznama. Obnova reda, ki je že izvoren, ohrani tudi obstoječo zgodovino ponovitev. Vrstni red DOM kartic po vseh stolpcih skupaj ni globalni red; ta se preverja z mesti in relativnim redom posameznega stolpca.

Avtor specifikacije je samo prebral navodila, tipe, kodo in javne razvojne teste ter shranil dokumentacijo. Aplikacija ni bila zagnana, testi in vizualni pregled niso bili izvedeni; pripadajo implementerju. Končni testi niso dostopni. Navigacije med nedokončanim nalaganjem ne širimo prek obstoječih regresijskih zahtev; nove sočasne spremembe podatkov brez osvežitve so zunaj obsega.

Strežnik, skupni tipi, infrastruktura, odvisnosti, navodila in skupni testi so samo za branje. Uporabniški vmesnik uporablja samo javni `/api/`, ne `/__test/`, testnih pripomočkov, `localStorage` ali druge trajne shrambe za novi red. Testni program lahko uporablja obstoječe testne kontrole. Dovoljeni so samo izvoženi projekt in njegove lokalne storitve; drugih agentov se ne zaganja.
