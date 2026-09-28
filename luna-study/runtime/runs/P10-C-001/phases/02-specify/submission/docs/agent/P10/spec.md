# P10: Lokalni vrstni red z razveljavitvami

## Problem in kontekst

Folio prikaže opravila izbranega projekta v preglednici ali na tabli s stalnimi
stolpci stanj. Uporabnik želi lokalno urediti njihov vrstni red, razveljaviti
ali ponoviti premike ter se vrniti na vrstni red, ki ga je vrnil API. Vrstni
red velja samo do menjave projekta ali osvežitve; obstoječi Folio, njegova
slovenska poimenovanja in potrjeni odzivni dizajn ostanejo izhodišče.

Ta dokument zajame vseh R01–R12 iz [`task/instructions.md`](../../../task/instructions.md)
in izpolni skupno razvojno predlogo [`task/specification-template.md`](../../../task/specification-template.md).

## Vhodi, dejanja in izidi

- Vhod je seznam opravil izbranega projekta, prebran prek obstoječega javnega
  `/api/`. ID-ji opravil znotraj projekta so enolični. Naslovi so lahko enaki;
  vrstni red se nikoli ne določa po naslovu. Testni podatki lahko vsebujejo
  poljubno število opravil (tudi 0, 1 in več kot 10), različno zaporedje,
  veljavne datume ter navadno besedilo z Unicode znaki in ločili; vsako
  opravilo pripada svojemu projektu. Imena odgovornih oseb so neprazna in
  različna od rezervirane vrednosti `all`.
- Za izbrani projekt je začetna permutacija `O = [id₁, …, idₙ]` enaka
  vrstnemu redu iz API-ja. `C` je trenutna permutacija teh ID-jev, `U` sklad
  permutacij za razveljavitev, `R` sklad permutacij za ponovitev. Sklad je
  zapisan od najstarejšega proti najnovejšemu; vrh je zadnji element.
- Opravilo v globalnem vrstnem redu `C` na indeksu `i` (indeksiranje od 0) ima
  mesto `i + 1`. Tabla iz `C` ohrani relativni vrstni red znotraj vsakega
  nespremenljivega stolpca stanja.
- Dovoljena dejanja so premik opravila za eno mesto gor/dol, razveljavitev,
  ponovitev in vrnitev na `O`. Preklop pogleda ter odpiranje in zapiranje
  podrobnosti sta navigacijski dejanji, ki ne spreminjata `C`, `U` ali `R`.
- Uspešno dejanje spremeni samo permutacijo ID-jev in ustrezni skladi. Polja
  opravila, statusi ter podatki API-ja ostanejo nespremenjeni. Neveljavno ali
  robno dejanje je brez učinka.

### Pravila prehodov stanja

Za `C` velja `set(C) = set(O)` in `|C| = |O|`; ID se ne izgubi ali podvoji.
Veljaven premik zamenja opravilo samo z neposrednim globalnim sosedom:

1. Če je `i > 0`, premik gor nastavi `U := tail20(U + [C])`, `C := swap(C, i,
   i-1)` in `R := []`.
2. Če je `i < |C|-1`, premik dol nastavi `U := tail20(U + [C])`, `C :=
   swap(C, i, i+1)` in `R := []`.
3. `tail20` obdrži največ 20 najnovejših permutacij. Če pogoj za soseda ni
   izpolnjen ali je opravilo/indeks neveljaven, se `C`, `U` in `R` ne
   spremenijo.
4. Če `U` ni prazen, razveljavitev shrani trenutno `C` na `R`, nato obnovi in
   odstrani vrh `U`. Če je `R` neprazen, ponovitev shrani trenutno `C` na
   `U`, nato obnovi in odstrani vrh `R`. Če je ustrezni sklad prazen, je
   dejanje onemogočeno in brez učinka. Veljaven nov premik ali vrnitev na
   začetni vrstni red po razveljavitvi počisti `R`.
5. Če `C != O`, vrnitev na začetni vrstni red shrani prejšnji `C` na `U`
   (z omejitvijo `tail20`), nastavi `C := O` in `R := []`. Če `C = O`, je
   dejanje onemogočeno in brez učinka.
6. Preklop pogleda in podrobnosti ohrani vse tri vrednosti. Menjava projekta
   ali osvežitev naloži njegov API-vrstni red kot nov `O` in `C` ter izprazni
   `U` in `R`; lokalni vrstni red se ne shrani trajno.

## Scenariji uporabnika

1. **Uredi opravila:** uporabnik vidi mesta 1…N. Premik gor/dol zamenja
   izbrano opravilo z globalnim sosedom, tudi če je sosed na tabli v drugem
   stolpcu. Posodobita se vrstni red in prikazana mesta, statusi ostanejo isti.
2. **Popravi ali ponovi spremembo:** uporabnik izvede več premikov, jih
   razveljavi in nato ponovi. Vsak korak obnovi pravilno prejšnjo/naslednjo
   permutacijo. Nov veljaven premik po razveljavitvi opusti redo-vejo.
3. **Začni znova:** uporabnik se vrne na `O` kot z enim dejanjem razveljavljivo
   spremembo. Če je že na `O`, kontrola ni na voljo in zgodovina ostane enaka.
4. **Nadaljuj pregled:** uporabnik preklopi preglednico/tablo ali odpre in
   zapre podrobnosti; vrstni red in obe zgodovini ostanejo. Z izbiro drugega
   projekta ali osvežitvijo se pokaže njegov začetni vrstni red brez lokalne
   zgodovine.
5. **Uporabi prazen ali majhen projekt:** za nič ali eno opravilo so prikaz,
   kontrolniki zgodovine in števec uporabni, premik gor/dol pa ni dovoljen.

## Zahteve in pravila

| Zahteva | Pravilo oziroma sprejemni pogoj | Način preverjanja |
| --- | --- | --- |
| R01 | Ob nalaganju `C = O`; vsako opravilo ima `aria-label="Mesto opravila {id}"` in globalno številko od 1 do N. Enaki naslovi ostanejo ločena opravila po ID-ju. | Naloži poljubno permutacijo z enakima naslovoma; preveri ID-je, mesta in začetni vrstni red. |
| R02 | `Premakni {id} gor/dol` zamenja ID z neposrednim globalnim sosedom. Vsa polja opravila, vključno s statusom, ostanejo enaka. | Premakni opravilo v obe smeri; primerjaj permutacijo in vsa polja pred/po. |
| R03 | Premik gor na prvem in dol na zadnjem mestu je onemogočen. Tudi neposredno sproženo neveljavno ali ponovljeno robno dejanje ohrani `C`, `U`, `R`. | Preveri onemogočena gumba in sproži robno dejanje; primerjaj stanje zgodovine in vrstni red. |
| R04 | Veljaven premik doda prejšnji celotni `C` v `U`. `Razveljavi premik` obnovi vrh `U` in shrani prejšnji trenutni `C` na `R`. | Naredi premik in razveljavi; preveri obe permutaciji ter možnost ponovitve. |
| R05 | `Ponovi premik` obnovi vrh `R`, pri tem shrani trenutno permutacijo na `U`. Več zaporednih undo/redo dejanj ohrani zaporedje in enolične ID-je. | Izvedi vsaj dva premika, več razveljavitev in ponovitev; primerjaj pričakovane permutacije po vsakem koraku. |
| R06 | Veljaven premik po razveljavitvi izprazni `R`. Neveljaven premik na robu ne izprazni `R` in ne spremeni zgodovine. | Po undo preveri robno dejanje in redo; nato veljaven premik in odsotnost stare redo-veje. |
| R07 | `U` hrani največ 20 predhodnih permutacij; 21. veljaven premik odstrani najstarejšo. Vse razveljavljene korake v `R` je mogoče ponoviti. | Naredi 21 premikov; po 20 razveljavitvah mora biti dosegljivo stanje po prvem premiku (začetno stanje ne več), nato preveri vse ponovitve. |
| R08 | `Začetni vrstni red` ob `C != O` ustvari en undo-korak do `O` in počisti `R`. Ob `C = O` je onemogočen ter ne spremeni `U` ali `R`. | Vrnitev po premikih (tudi po undo) in preverjanje undo/redo; preverjanje onemogočenega gumba na `O`. |
| R09 | Preglednica sledi `C`; tabla razvrsti znotraj stalnih stolpcev stanj po relativnem vrstnem redu `C`. Premiki na tabli uporabljajo globalnega soseda, prikažejo globalno mesto in ne spremenijo statusa. | Premakni opravilo čez mejo statusnih stolpcev; primerjaj globalna mesta, vrstni red v stolpcih in statuse. |
| R10 | Pogled in podrobnosti ohranijo `C`, `U`, `R`. Menjava projekta/refresh naloži nov začetni red in izprazni zgodovini. Vrstni red ni trajen. | Preklapljaj poglede in podrobnosti; nato zamenjaj projekt in osveži; preveri naloženi API-vrstni red ter prazna sklada. |
| R11 | Statusno območje ima `role="status"`, `aria-label="Zgodovina vrstnega reda"` in besedilo `Razveljavitve: {U}. Ponovitve: {R}.`; števec ustreza številu razpoložljivih undo/redo korakov. Gumba sta onemogočena pri ničli. Projekta z 0 ali 1 opravilom sta uporabna. | Preveri dostopne lastnosti, števec po vsakem dejanju, onemogočanje pri ničli ter prazne/enojne podatke. |
| R12 | Vsak prikaz je permutacija iste množice ID-jev; aplikacija ne zapisuje na API in ne spreminja nobenega polja. Števci stanj ter podrobnosti ostanejo pravilni. Folio ostane prilagodljiv pri širini 390 px; dovoljeno je notranje drsenje prikazov. | Primerjaj ID-je/polja/števce/podrobnosti pred in po; preveri odsotnost zapisov; pri 390 px preveri, da se stran ne razširi. |

## Merila uspeha

- Vseh R01–R12 je mogoče preveriti z navedenimi pogoji; vrstni red, zgodovina,
  števci in prikaz ostanejo skladni po vsakem dejanju.
- Deluje za poljubno število opravil (tudi 0, 1 in več kot 10), enolične
  različne ID-je, ponovljene naslove ter besedilo z Unicode znaki in ločili.
- Aplikacija še naprej bere prek `/api/`; kontrole `/__test/` so samo za testni
  program. Niso dodani zapisovalni API, trajna shramba, odvisnost ali
  infrastrukturna sprememba.
- Dogovorjene dostopne oznake, ločitev dejanj od povezave opravila,
  obstoječa imena pogledov/stolpcev, `data-task-id` in
  `aria-label="Pregled stanj opravil"` so ohranjeni. Na ozkem zaslonu ostane
  potrjeni dizajn Folio uporaben.

## Izvedba in sledljivost

Specifikacija je načrt, ne dokaz implementacije. Izvedba in preverjanje še
nista opravljena; v tej fazi ni bilo zagona testov. Naslednji korak mora tabelo
dopolniti z dejanskimi datotekami/kodo, imeni testov, izidi in določljivimi
dokazi. Trenutnih izidov zato ne označujemo kot uspešnih.

| Zahteva | Pogoj | Test ali scenarij | Datoteka in del kode | Izid ter dokaz |
| --- | --- | --- | --- | --- |
| R01 | Začetni `C = O`, mesta po ID | Scenarij 1; R01 sprejemni pogoj zgoraj | Po implementaciji | Ni izvedeno; specify faza |
| R02 | Globalna soseda zamenjana, polja enaka | Scenarij 1; R02 sprejemni pogoj zgoraj | Po implementaciji | Ni izvedeno; specify faza |
| R03 | Robni/no-op premik ne spremeni skladov | Scenarij 1; R03 sprejemni pogoj zgoraj | Po implementaciji | Ni izvedeno; specify faza |
| R04 | Undo shrani/obnovi celotno permutacijo | Scenarij 2; R04 sprejemni pogoj zgoraj | Po implementaciji | Ni izvedeno; specify faza |
| R05 | Več undo/redo obnovi pravilna stanja | Scenarij 2; R05 sprejemni pogoj zgoraj | Po implementaciji | Ni izvedeno; specify faza |
| R06 | Nov veljaven premik zavrže redo; robni ne | Scenarij 2; R06 sprejemni pogoj zgoraj | Po implementaciji | Ni izvedeno; specify faza |
| R07 | Omejitev `U` na 20 | R07 sprejemni pogoj zgoraj | Po implementaciji | Ni izvedeno; specify faza |
| R08 | Začetni red je eno undo-dejanje | Scenarij 3; R08 sprejemni pogoj zgoraj | Po implementaciji | Ni izvedeno; specify faza |
| R09 | Globalni vrstni red in stolpci stanj | Scenarij 1; R09 sprejemni pogoj zgoraj | Po implementaciji | Ni izvedeno; specify faza |
| R10 | Pogled/podrobnosti ohranijo stanje; projekt/refresh ga ponastavita | Scenarij 4; R10 sprejemni pogoj zgoraj | Po implementaciji | Ni izvedeno; specify faza |
| R11 | Dostopen števec in uporabna 0/1 opravila | Scenarij 5; R11 sprejemni pogoj zgoraj | Po implementaciji | Ni izvedeno; specify faza |
| R12 | Lokalna permutacija brez spremembe podatkov | Vsi scenariji; R12 sprejemni pogoj zgoraj | Po implementaciji | Ni izvedeno; specify faza |

## Odprta vprašanja in omejitve

Funkcionalne nejasnosti, ki bi preprečevale specifikacijo, v navodilih niso
ostale; privzete vrednosti so določene z zahtevami in pravili prehodov zgoraj.
Končni razvojni in skriti testi v tej fazi niso bili izvedeni. Specifikacija ne
določa razporeditve novih kontrol ali besedila zunaj izrecno določenih imen.
