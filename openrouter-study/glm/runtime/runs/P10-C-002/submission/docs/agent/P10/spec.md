+# P10 Specifikacija: Lokalni vrstni red z razveljavitvami
+
+## Problem in kontekst
+
+Uporabnik želi v obstoječi aplikaciji Folio preurejati opravila izbranega projekta z gumbi za premik gor in dol, spremembe razveljavljati ter ponavljati. Vrstni red je funkcionalnost trenutnega pogleda: ob vklopu aplikacije ali izbiri projekta izhaja iz vrstnega reda opravil, ki ga vrne javni API `/api/`. Podatki o vrstnem redu se ne shranjujejo trajno, zato menjava projekta ali osvežitev ponastavi stanje na izhodišče.
+
+## Vhodi, dejanja in izidi
+
+Relevantna polja so obstoječa polja opravila iz skupnih tipov; identifikator `id` je edini ključ za izbiro opravila, naslovi pa se ne uporabljajo za povezovanje. Stanje funkcionalnosti za trenuten projekt je:
+
+- `initialOrder`: permutacija opravil, prejetih iz API-ja.
+- `currentOrder`: trenutna permutacija istih ID-jev.
+- `undoStack`: največ 20 prejšnjih celotnih permutacij; najnovejša je na vrhu.
+- `redoStack`: permutacije, ki so bile razveljavljene in jih je mogoče ponoviti; najnovejša je na vrhu.
+
+Dovoljena dejanja so `Premakni <id> gor`, `Premakni <id> dol`, `Razveljavi premik`, `Ponovi premik` in `Začetni vrstni red`. Uspeh je dosledna permutacija iste množice ID-jev ter usklajena prikazana mesta, števca in stanja gumbov. Preklic ali neveljavno robno dejanje ne spremeni vrstnega reda in ne doda zgodovine. Napake branja API-ja sledijo obstoječemu obnašanju aplikacije; nova funkcionalnost ne dodaja zapisovalnega API-ja.
+
+## Zahteve in pravila
+
+Simboli: `N` je število opravil, `i` globalna mesta (`1..N`), `id` enkratni identifikator opravila, `pred(id)` neposredni globalni predhodnik in `nasl(id)` neposredni globalni naslednik. Vsa pravila veljajo za permutacije celotnega seznama; enaki naslovi se ne povezujejo.
+
+| Zahteva | Pravilo oziroma sprejemni pogoj | Način preverjanja |
+| --- | --- | --- |
+| R01 | Ob nalaganju projekta je `currentOrder = initialOrder`. Vsak `id` prikazuje globalno mesto `i` od `1` do `N`; enaki naslovi nimajo vpliva. | Naloži podatke z različnim zaporedjem in enakimi naslovi ter preveri mesta po ID-jih. |
+| R02 | Veljaven premik gor zamenja položaj `id` s `pred(id)`; premik dol ga zamenja z `nasl(id)`. Vsa ostala polja opravil in statusi ostanejo nespremenjeni. | Sproži premike in primerjaj celoten seznam po ID-jih ter vsa polja/status. |
+| R03 | Gumb za premik gor je onemogočen za `i=1`, gumb za premik dol za `i=N`. Onemogočeno, neveljavno ali ponovljeno robno dejanje ne spremeni vrstnega reda, `undoStack` in `redoStack`. | Preveri `disabled`, klik robnega gumba in stanja pred/po; tudi pri `N=0` in `N=1`. |
+| R04 | Vsak veljaven premik najprej shrani celoten prejšnji `currentOrder` na `undoStack`, nato spremeni `currentOrder`. `Razveljavi premik` prestavi `currentOrder` na `redoStack`, vzame vrh `undoStack` in ga nastavi kot novi `currentOrder`. | Izvedi zaporedje premikov, razveljavitev in ponovitev ter preveri celotne permutacije. |
+| R05 | `Ponovi premik` je onemogočen pri praznem `redoStack`. Ob veljavnem kliku prestavi `currentOrder` na `undoStack` (z omejitvijo 20), vzame vrh `redoStack` in ga nastavi kot novi `currentOrder`. Zaporedji `undoStack` in `redoStack` ohranita LIFO vrstni red brez izgube ali podvajanja ID-jev. | Izvedi več razveljavitev in ponovitev v različnih zaporedjih ter preveri mesta, števce in vse ID-je. |
+| R06 | Vsak nov veljaven premik po razveljavitvi počisti celoten `redoStack`. Neveljavno ali onemogočeno robno dejanje ne počisti `redoStack` in ne spremeni vrstnega reda. | Po razveljavitvi poskusi neveljavno robno dejanje, nato veljaven premik; preveri, da se zgodovina ponovitev zavrže šele pri veljavnem premiku. |
+| R07 | `undoStack` ima največ 20 elementov. Ob 21. veljavnem premiku se najstarejša permutacija zavrže, vsa preostala in nova pa ohranijo vrstni red. `redoStack` ni omejen z novo zahtevo in pokriva vse trenutno razveljavljene korake. | Izvedi 21 premikov, nato 20 razveljavitev in preveri mejo, zaporedje in stanje gumba za razveljavitev. |
+| R08 | `Začetni vrstni red` je onemogočen, kadar je `currentOrder = initialOrder`; klik takrat ne spremeni zgodovine. Sicer shrani trenutni `currentOrder` na `undoStack`, nastavi `currentOrder = initialOrder` in počisti `redoStack`. Ena razveljavitev vrne stanje pred klikom. | Preveri onemogočen gumb v izhodišču, reset po premiku ter razveljavitev reseta. |
+| R09 | Preglednica prikazuje globalni vrstni red. Tabla ohrani obstoječe stalne stolpce stanj in znotraj njih prikazuje relativni vrstni red, vsak premik pa uporabi globalnega soseda in prikaže globalno mesto. Statusi se med premiki ne spreminjajo. | Premakni opravila v obeh pogledih, vključno z opravili v sosednjih stolpcih stanj, in primerjaj globalne sosede, mesta in statuse. |
+| R10 | Preklop pogleda ter odpiranje in zapiranje podrobnosti ohranita `currentOrder`, `undoStack` in `redoStack`. Menjava projekta ali osvežitev ponastavita vsa štiri stanja na nove prejete podatke. Ne uporabi se `localStorage` ali druga trajna shramba. | Spremeni stanje, preklopi pogled/podrobnosti, nato zamenjaj projekt ali osveži in preveri ponastavitev. |
+| R11 | Element `role=status` z `aria-label="Zgodovina vrstnega reda"` prikazuje `Razveljavitve: U. Ponovitve: R.`, kjer sta `U` in `R` velikosti skladov. Gumba za razveljavitev in ponovitev sta onemogočena pri ničli. Projekta z nič ali enim opravilom ostaneta uporabna brez veljavnega premika. | Preveri besedilo in onemogočeno stanje po vsakem dejanju ter uporabnost praznega in enoopravilnega projekta. |
+| R12 | Vsak uspešen premik, reset, razveljavitev ali ponovitev spremeni le zaporedje celotnih objektov/ID-jev. Ne uporabi se API za pisanje, spremeni se nobeno polje opravila, števca stanj niti pravilne podrobnosti. Ohranita se dostopna imena in prilagodljivost Folio. | Primerjaj vse podatke pred/po, spremljaj zahteve API-ja in preveri obstoječe dostopne imena ter ozko postavitev. |
+
+### Pravila sprememb stanja
+
+1. Veljaven premik (`move(id, direction)`): če `id` obstaja in sosed v smeri obstaja, najprej počisti `redoStack`, nato dodaj kopijo `currentOrder` na `undoStack`. Če ima `undoStack` 20 elementov, odstrani najstarejšega. Nazadnje zamenjaj izbrani `id` z globalnim sosedom v `currentOrder`. Robni ali neveljaven klic je brez učinka.
+2. Razveljavi (`undo`): če `undoStack` ni prazen, dodaj kopijo `currentOrder` na `redoStack`, odstrani vrh `undoStack` in ga nastavi kot `currentOrder`. Sicer dejanje ni dovoljeno.
+3. Ponovi (`redo`): če `redoStack` ni prazen, dodaj kopijo `currentOrder` na `undoStack` (z enako omejitvijo 20), odstrani vrh `redoStack` in ga nastavi kot `currentOrder`. Sicer dejanje ni dovoljeno.
+4. Začetni vrstni red (`reset`): če `currentOrder` ni enak `initialOrder`, dodaj kopijo `currentOrder` na `undoStack` (z omejitvijo 20), nastavi `currentOrder = initialOrder` in počisti `redoStack`. Sicer dejanje ni dovoljeno.
+5. Ponastavitev projekta ali osvežitev: nastavi `initialOrder` in `currentOrder` na novo prejeto polje ter počisti obe zgodovini.
+
+## Izvedba in sledljivost
+
+Ta faza pripravi specifikacijo; implementacija, testi in dokazi še niso izvedeni. Načrtovana sledljivost je:
+
+| Zahteva | Pogoj | Test ali scenarij | Datoteka in del kode | Izid ter dokaz |
+| --- | --- | --- | --- | --- |
+| R01–R12 | Pogoji iz tabele zgoraj | Agentni Playwright testi v `tests/agent/`, skupaj z obstoječimi skupnimi testi, kjer pokrivajo regresijo | `src/` za UI in stanje; konkretne vrstice bodo dodane v implementacijski dokumentaciji | Ni izvedeno v tej fazi; rezultat bo zabeležen po zagonu testov. |
+
+## Odprta vprašanja in omejitve
+
+- Ni odprtih vprašanj: vsa opustitev je razrešena iz `task/instructions.md`.
+- Specifikacija ne dodaja novih odvisnosti, zunanjih meritev, trajne shrambe ali sprememb strežnika in javnega API-ja.
+- Nedostopni končni testi niso merilo za trditve o uspehu; dokazila se bodo zapisala le po dejanskem zagonu testov.
