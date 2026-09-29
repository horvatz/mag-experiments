# P10: Lokalni vrstni red z razveljavitvami

## Problem in kontekst

Folio trenutno prebere opravila izbranega projekta prek javnega API-ja in jih pokaže v preglednici ali na tabli s stalnimi stolpci stanj. Uporabnik lahko odpre podrobnosti opravila, ne more pa spremeniti vrstnega reda. P10 omogoča začasno razvrščanje opravil znotraj projekta ter razveljavitev in ponovno izvedbo teh premikov. Vrstni red je odjemalsko stanje; podatki, stanja in potrjeni prilagodljivi dizajn Folio ostanejo nespremenjeni.

## Vhodi, dejanja in izidi

Vhod je seznam opravil iz `GET /api/projects/:id/tasks` v prejetem zaporedju. Opravilo ima izhodiščna polja `id`, `projectId`, `title`, `description`, `status`, `assignee` in `dueDate`; vsako opravilo pripada svojemu projektu. Identiteta in vrstni red temeljita na `id`, ne na naslovu. Veljavni podatki lahko vsebujejo nič, eno ali poljubno več kot deset opravil, različne enkratne ID-je ter enake naslove. Naslovi, opisi in imena so navadno besedilo, tudi Unicode znaki in ločila; imena odgovornih oseb so neprazna in različna od rezervirane vrednosti `all`.

Uporabnik lahko premakne opravilo za eno mesto gor ali dol, razveljavi premik, ga ponovi, vrne začetni vrstni red, zamenja pogled, odpre ali zapre podrobnosti ter izbere drug projekt. Premik velja le, če ima opravilo globalnega soseda v zahtevani smeri. Veljavna dejanja spremenijo lokalno permutacijo ID-jev in ustrezni zgodovini; nedovoljena robna dejanja so brez učinka. Zamenjava pogleda in odpiranje ali zapiranje podrobnosti ohranijo trenutno permutacijo in obe zgodovini. Menjava projekta in osvežitev naložita začetni vrstni red izbranega projekta in začneta prazni zgodovini.

Premiki ne zapisujejo prek API-ja, ne spreminjajo nobenega polja opravila in se ne shranijo trajno. Obstoječi prikazi nalaganja, napake, praznega projekta in podrobnosti ostanejo uporabni. Ob napaki pri branju ostane v veljavi obstoječe sporočilo in možnost ponovnega poskusa; brez naloženega seznama se ne izvede permutacija.

## Zahteve in pravila

### Model in pravila sprememb stanja

Naj bo `T` seznam naloženih opravil, `I₀ = [t.id for t in T]` izvorna permutacija, `O` trenutna permutacija ID-jev, `H` zgodovina za razveljavitev in `P` zgodovina za ponovitev. V `H` in `P` so celotne permutacije; najstarejši element je levo, zadnji element je vrh zgodovine. `trim20(A)` obdrži zadnjih največ 20 elementov. Vsak ID je enkraten.

Invariant velja ves čas: `O` je permutacija `I₀`; torej `|O| = |I₀|` in `set(O) = set(I₀)`. Ob nalaganju novega projekta ali osvežitvi se določi `O = I₀`, `H = []`, `P = []`. Podatkovni objekt za vsak ID ostane nespremenjen.

- **Premik:** za ID na indeksu `i` je smer gor `d = -1`, dol `d = +1`, cilj pa `j = i + d`. Če ID obstaja in `0 ≤ j < |O|`, je `O' = swap(O, i, j)`, `H' = trim20(H + [O])`, `P' = []`. V nasprotnem primeru se `O`, `H` in `P` ne spremenijo.
- **Razveljavitev:** če `H` ni prazen, je `O' = last(H)`, `H' = init(H)`, `P' = P + [O]`. Če je `H` prazen, je dejanje onemogočeno in stanje ostane enako.
- **Ponovitev:** če `P` ni prazen, je `O' = last(P)`, `P' = init(P)`, `H' = trim20(H + [O])`. Če je `P` prazen, je dejanje onemogočeno in stanje ostane enako.
- **Začetni vrstni red:** če `O ≠ I₀`, je `O' = I₀`, `H' = trim20(H + [O])`, `P' = []`. Če `O = I₀`, se nič ne spremeni in kontrola je onemogočena.
- **Pogled in podrobnosti:** spremeni se lahko pot oziroma prikaz, toda `O`, `H` in `P` ostanejo enaki.
- **Projekt in osvežitev:** za na novo naloženi seznam se zgornje stanje inicializira z njegovim `I₀`; predhodni lokalni zgodovini se zavržeta.

Števili v vmesniku sta `U = |H|` in `R = |P|`. Položaj opravila je `indexOf(O, id) + 1`. Globalni sosed pomeni soseda v `O`, tudi kadar sta opravili v različnih stolpcih table.

| Zahteva | Pravilo oziroma sprejemni pogoj | Način preverjanja |
| --- | --- | --- |
| R01 | Po nalaganju je `O = I₀`; vsako opravilo ima mesto `indexOf(O, id) + 1` od 1 do N, vezano na ID tudi pri enakih naslovih. | Naloži poljubno zaporedje z enakima naslovoma; preveri zaporedje, vsa mesta in pripadajoče ID-je. |
| R02 | Veljaven premik gor/dol premakne izbrani ID za natanko eno globalno mesto s sosedom; vsa polja opravila, vključno s `status`, ostanejo enaka. | Premakni notranje opravilo v obe smeri; primerjaj permutacijo in vsa polja pred/po. |
| R03 | Gor za prvo in dol za zadnje opravilo sta onemogočena. Neveljavno ali ponovljeno robno dejanje ohrani `O`, `H` in `P`. | Preveri obe meji, nato poskusi sprožiti robno dejanje; permutacija in števci zgodovine se ne spremenijo. |
| R04 | Veljaven premik shrani prejšnji `O` v `H`. Razveljavitev obnovi zadnji element `H` in trenutno `O` doda v `P`. | Izvedi premik in razveljavitev; preveri celotni zaporedji in števec obeh zgodovin. |
| R05 | Ponavljanje obnovi zadnjo permutacijo iz `P`; zaporedne razveljavitve in ponovitve ne izgubijo ali podvojijo ID-jev. | Izvedi več premikov, več razveljavitev ter ponovitev; po vsakem dejanju preveri `O` in invariant permutacije. |
| R06 | Veljaven premik po razveljavitvi izprazni `P`; neveljaven robni premik ga ohrani. | Razveljavi premik, preveri `P`, nato preizkusi veljavno in robno dejanje v ločenih zaporedjih. |
| R07 | `H` hrani največ 20 prejšnjih permutacij; 21. veljaven premik odstrani najstarejšo. Vse trenutno razveljavljene korake je mogoče ponoviti. | Naredi vsaj 21 premikov, razveljavi in nato ponovi vseh 20 dosegljivih korakov; preveri permutacije in števce. |
| R08 | Če `O ≠ I₀`, vrnitev začetnega vrstnega reda shrani trenutno `O` kot eno razveljavljivo dejanje in izprazni `P`. Če `O = I₀`, je gumb onemogočen in zgodovina ostane enaka. | Preveri vrnitev po premiku ter neaktivno vrnitev pri začetnem vrstnem redu, tudi po razveljavitvi. |
| R09 | Preglednica sledi `O`; tabla v vsakem nespremenljivem stolpcu ohranja vrstni red, induciran z `O`. Premiki na tabli uporabljajo globalnega soseda, pokažejo novo globalno mesto in ne spreminjajo stanja. | Primerjaj oboje pri opravilih različnih stanj, zlasti pri globalno sosednjih karticah v različnih stolpcih. |
| R10 | Menjava pogleda in odpiranje/zapiranje podrobnosti ohranita `O`, `H`, `P`. Menjava projekta in osvežitev vzpostavita izvorno permutacijo in prazni zgodovini; trajne shrambe ni. | Premakni in razveljavi, preklopi poglede ter podrobnosti; nato zamenjaj projekt in osveži, preveri začetna stanja. |
| R11 | Status zgodovine ima `role="status"`, `aria-label="Zgodovina vrstnega reda"` in besedilo `Razveljavitve: U. Ponovitve: R.`; gumbi so onemogočeni pri ničelnem ustreznem številu. Prazen projekt in projekt z enim opravilom sta uporabna. | Preveri dostopna imena, besedilo in onemogočenost pri različnih številih ter pri 0 in 1 opravilu. |
| R12 | Vsako dejanje ohranja isto množico ID-jev in vsa polja, ne pošilja zapisov API-ju; števci stanj in podrobnosti ostanejo pravilni, Folio pa prilagodljiv. | Primerjaj API-jev nabor in število zapisov, polja/stanja, števce in podrobnosti pred/po dejanjih; preveri širino 390 px. |

### Vmesnik in podatkovni obseg

- Ob vsaki vrstici in kartici sta gumba z dostopnimi imeni `Premakni <id> gor` in `Premakni <id> dol`; sta zunaj povezave opravila. Prikazan element mesta ima `aria-label="Mesto opravila <id>"` in globalno številko.
- Skupni gumbi so `Razveljavi premik`, `Ponovi premik` in `Začetni vrstni red`. Števci so v elementu `role="status"` z `aria-label="Zgodovina vrstnega reda"`.
- Ohranijo se `data-task-id` na vrsticah in karticah, dostopna imena obstoječih pogledov in stolpcev ter `aria-label="Pregled stanj opravil"`.
- Aplikacija uporablja obstoječi javni `/api/`. Ne bere `/__test/`, ne uvaža testnega pripomočka, ne dodaja zapisovalnih API-jev in ne uporablja `localStorage` za vrstni red.
- Obseg vhodov vključuje poljubno število opravil (tudi 0, 1 in več kot 10), poljubne enkratne ID-je, enake naslove, različna začetna zaporedja in veljavne koledarske datume. Naslovi, opisi in imena so navadno besedilo, tudi Unicode in ločila; prazna projekta sta veljavna. Tipi in polja ostanejo enaki izhodišču.
- Pri širini 390 px se širina celotne strani ne poveča; notranje drsenje preglednice in table je dovoljeno. Ohranijo se potrjeni Folio, sistemska pisava, obstoječi gradniki in vidni fokus.

## Uporabniški scenariji

1. **Razvrsti opravila:** uporabnik odpre projekt, vidi prejete vrstni red in mesta, premakne opravilo gor ali dol ter vidi neposredno sosednjo zamenjavo. Na robu je ustrezni gumb onemogočen.
2. **Vrni ali ponovi spremembo:** po več premikih uporabnik razveljavi enega ali več korakov in jih nato ponovi. Vrstni red ob vsakem koraku ostane permutacija istih ID-jev; števci ustrezajo gumbom.
3. **Začni novo vejo ali ponastavi vrstni red:** uporabnik po razveljavitvi izvede veljaven premik in izgubi možnost ponovitve. Vrnitev začetnega vrstnega reda je eno razveljavljivo dejanje; pri že izvornem vrstnem redu je neaktivna.
4. **Uporabi pogled in podrobnosti:** med preglednico in tablo ter med odprtimi in zaprtimi podrobnostmi uporabnik ohrani vrstni red in obe zgodovini. Na tabli se sosedstvo in mesto še vedno računata globalno.
5. **Zamenjaj projekt ali ponovno naloži stran:** lokalni vrstni red in zgodovini se zavržejo; po branju API-ja se pokaže izhodiščno zaporedje projekta. Prazna projekta ter projekt z enim opravilom ne povzročita nedovoljenega premika.

## Merila uspeha

- Za vsak naložen projekt je začetni in prikazani vrstni red skladen z `I₀` oziroma trenutnim `O`; mesta so enolično vezana na ID.
- Premiki, razveljavitve, ponovitve in ponastavitev izpolnjujejo zgornja pravila za `O`, `H` in `P`, vključno z omejitvijo 20.
- Preglednica in tabla kažeta isto globalno permutacijo, tabela table pa njene stabilne filtre po stanju.
- Navigacija pogleda in podrobnosti ohrani lokalno stanje; projektna menjava in osvežitev ga ponastavita. Ni trajnega shranjevanja ali API zapisov.
- Zahtevana dostopna imena, števci, obstoječi podatki in prilagodljiv Folio ostanejo pravilni za robna števila opravil.

## Izvedba in sledljivost

Izhodiščne lokacije v tabeli so obstoječe komponente, ki jih bo treba pregledati ob izvedbi; ne predpisujejo razdelitve nove implementacije. Testni scenariji so predlogi za `tests/agent/`; še niso ustvarjeni ali izvedeni.

| Zahteva | Pogoj | Test ali scenarij | Izhodiščna datoteka in del kode | Izid ter dokaz |
| --- | --- | --- | --- | --- |
| R01 | R01 v tabeli »Zahteve in pravila«. | Scenarij 1: začetno zaporedje in enaki naslovi. | `src/App.tsx` — `ProjectView`; `src/TaskBoard.tsx` — `TaskBoard`. | Ni še preverjeno; implementacija in test še nista izvedena. |
| R02 | R02 v tabeli »Zahteve in pravila«. | Scenarij 1: premik v obe smeri in nespremenjena polja. | `src/App.tsx` — prikaz vrstic v `ProjectView`; `src/TaskBoard.tsx` — kartice v `TaskBoard`. | Ni še preverjeno; implementacija in test še nista izvedena. |
| R03 | R03 v tabeli »Zahteve in pravila«. | Scenarij 1: obe robni mesti in ponovljen poskus. | `src/App.tsx` — vrstični prikaz; `src/TaskBoard.tsx` — kartice. | Ni še preverjeno; implementacija in test še nista izvedena. |
| R04 | R04 v tabeli »Zahteve in pravila«. | Scenarij 2: premik, razveljavitev in oba števca. | `src/App.tsx` — `ProjectView` in lokalno stanje projekta. | Ni še preverjeno; implementacija in test še nista izvedena. |
| R05 | R05 v tabeli »Zahteve in pravila«. | Scenarij 2: več zaporednih razveljavitev in ponovitev. | `src/App.tsx` — `ProjectView` in lokalno stanje projekta. | Ni še preverjeno; implementacija in test še nista izvedena. |
| R06 | R06 v tabeli »Zahteve in pravila«. | Scenarij 3: veljaven premik po razveljavitvi in nedovoljen robni premik. | `src/App.tsx` — `ProjectView` in lokalno stanje projekta. | Ni še preverjeno; implementacija in test še nista izvedena. |
| R07 | R07 v tabeli »Zahteve in pravila«. | Scenarij 2: 21 premikov, 20 razveljavitev in ponovitev. | `src/App.tsx` — `ProjectView` in lokalno stanje projekta. | Ni še preverjeno; implementacija in test še nista izvedena. |
| R08 | R08 v tabeli »Zahteve in pravila«. | Scenarij 3: ponastavitev, razveljavitev ponastavitve in onemogočeno stanje. | `src/App.tsx` — `ProjectView` in lokalno stanje projekta. | Ni še preverjeno; implementacija in test še nista izvedena. |
| R09 | R09 v tabeli »Zahteve in pravila«. | Scenarij 4: vrstni red po globalnem sosedu v različnih stanjih. | `src/App.tsx` — preglednica; `src/TaskBoard.tsx` — stabilno filtriranje po stolpcih. | Ni še preverjeno; implementacija in test še nista izvedena. |
| R10 | R10 v tabeli »Zahteve in pravila«. | Scenarij 4–5: pogled, podrobnosti, menjava projekta in osvežitev. | `src/navigation.ts` — `useRoute`; `src/App.tsx` — `ProjectView`; `src/TaskDetails.tsx` — odpiranje in zapiranje. | Ni še preverjeno; implementacija in test še nista izvedena. |
| R11 | R11 v tabeli »Zahteve in pravila«. | Scenarij 2 in 5: dostopna imena, števci, nič in eno opravilo. | `src/App.tsx` — kontrola pogleda v `ProjectView`; nova zgodovinska kontrola še ne obstaja. | Ni še preverjeno; implementacija in test še nista izvedena. |
| R12 | R12 v tabeli »Zahteve in pravila«. | Scenarij 1–5: API brez zapisov, enaka polja in števci, širina 390 px. | `src/api.ts` — `request`/`updateTask`; `src/App.tsx` — števci; `src/TaskDetails.tsx`; `src/styles.css`. | Ni še preverjeno; implementacija in test še nista izvedena. |

## Odprta vprašanja in omejitve

Zahteve določajo obnašanje vrstnega reda in uporabniški dogovor. Besedilo ter razporeditev novih kontrol nista predpisana, zato specifikacija zapiše le zahtevana dostopna imena in vedenje. Med nezaključenim nalaganjem in ob novih sočasnih spremembah podatkov brez osvežitve se funkcionalnost ne širi prek obstoječih regresijskih zahtev. Končni testi niso dostopni v tem koraku; navedeni scenariji so merila za poznejše preverjanje, ne rezultati izvedenih testov.
