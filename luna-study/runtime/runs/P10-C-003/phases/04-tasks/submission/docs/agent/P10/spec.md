# P10: Lokalni vrstni red z razveljavitvami

**Različica:** 1.0  
**Viri:** [task/instructions.md](../../../task/instructions.md), R01–R12; [skupna predloga](../../../task/specification-template.md); [PROJECT_RULES.md](../../../PROJECT_RULES.md); potrjeni [dizajn Folio](../../dizajn.md).

## Problem in kontekst

Folio prikazuje opravila izbranega projekta v preglednici ali na tabli s stalnimi stolpci Pripravljeno, V delu in Končano. Vrstni red določa prejeto polje iz javnega API-ja; uporabnik ga še ne more spreminjati. P10 doda začasno preurejanje, razveljavitev, ponovitev in vrnitev na začetni vrstni red. Sprememba velja samo v uporabniškem vmesniku trenutnega projekta; ne spreminja opravil ali strežnika. Ohranijo se potrjeni prilagodljivi dizajn, slovenska poimenovanja in obstoječi dostopni dogovori.

## Vhodi, dejanja in izidi

Vhod je seznam opravil trenutnega projekta, prebran prek javnega API-ja. Njihov ID je enoličen; naslov ni ključ. Polja in statusi so nespremenljivi. Veljaven premik zamenja cilj in neposrednega globalnega soseda ter shrani prejšnjo permutacijo. Razveljavitev obnovi zadnjo shranjeno permutacijo, ponovitev pa zadnjo razveljavljeno. Vrnitev na začetni vrstni red šteje kot eno razveljavljivo dejanje. Dejanja brez soseda ali brez ustrezne zgodovine ne spremenijo stanja. Preklop pogleda in prikaz/skritje podrobnosti ohranita vrstni red in zgodovini; menjava projekta in osvežitev jih ponastavita na podatke iz API-ja. Stanje se ne shranjuje trajno.

Obstoječe napake in nalaganje API-ja ostanejo nespremenjeni. Urejanje ne zapisuje na API, ne bere/nastavlja testnih poti /__test/ in ne nadomešča strežniških podatkov z localStorage.

### Model in predikati prehodov

Za izbrani projekt naj bo I prejeto polje opravil, O₀ = ids(I) njegov izvorni vrstni red ID-jev, O trenutni vrstni red, U sklad za razveljavitev in R sklad za ponovitev. Sklada sta zapisana od najstarejšega do najnovejšega. Veljavna permutacija vsebuje vsak ID iz O₀ natanko enkrat. Položaj je globalen in 1-osnovan: mesto ID-ja je njegov indeks v O plus 1. Funkcija take20(X) obdrži največ zadnjih 20 elementov, swap(O,i,j) pa zamenja elementa na indeksih i in j.

Začetek nalaganja: O=O₀, U=[], R=[]. Premik ID-ja na indeksu i gor izbere j=i−1, dol pa j=i+1. Če je j veljaven indeks: O'=swap(O,i,j), U'=take20(U+[O]), R'=[]. Sicer je (O',U',R')=(O,U,R).

Če U ni prazen, razveljavitev nastavi O'=last(U), U'=init(U), R'=R+[O]. Če U je prazen, ni spremembe. Če R ni prazen, ponovitev nastavi O'=last(R), R'=init(R), U'=take20(U+[O]); sicer ni spremembe.

Če O≠O₀, vrnitev na začetek nastavi O'=O₀, U'=take20(U+[O]), R'=[]. Če O=O₀, je kontrola onemogočena in ni spremembe. Menjava projekta/ponovno nalaganje vzpostavi stanje ciljnega/naloženega projekta; preklop pogleda in podrobnosti ohrani (O,U,R).

## Uporabniški scenariji

1. Uporabnik premakne opravilo gor ali dol in preveri globalno mesto v preglednici ali na tabli; na tabli se cilj določi po celotnem vrstnem redu (R01–R03, R09).
2. Uporabnik razveljavi in ponovi več dejanj, naredi nov premik po razveljavitvi ali vrne seznam na izhodišče; števci in gumbi odražajo zgodovini (R04–R08, R11).
3. Uporabnik preklopi pogled ali odpre/zapre podrobnosti, nato zamenja projekt ali osveži stran; stanje se ohrani ali ponastavi skladno z R10.
4. Uporabnik uporablja prazen, enojni ali večji seznam na ozkem zaslonu; vsebina, statusi in podrobnosti ostanejo pravilni in uporabni (R11–R12).

## Zahteve in pravila

| Zahteva | Pravilo oziroma sprejemni pogoj | Način preverjanja |
| --- | --- | --- |
| R01 | Ob začetku O=O₀. Vsako opravilo ima prikazano globalno mesto po ID-ju; enaki naslovi se ne združujejo. | S1: prvotni vrstni red in mesta pri podvojenem naslovu. |
| R02 | Premakni &lt;id&gt; gor/dol zamenja cilj z neposrednim globalnim sosedom. Polja in status ostanejo enaki. | S2: obe smeri; primerjaj zaporedje ID-jev in polja. |
| R03 | Prvi element ne more gor, zadnji ne dol; robno/neveljavno dejanje ohrani O,U,R. | S3: oba roba, tudi ponovljeni poskus. |
| R04 | Veljaven premik shrani prejšnji O v U. Razveljavitev obnovi zadnji U in shrani trenutni O v R. | S4: premik, razveljavitev in možnost ponovitve. |
| R05 | Ponovitev obnovi zadnji R; zaporedne razveljavitve/ponovitve ohranijo permutacije brez ID-jev, ki manjkajo ali se podvajajo. | S5: več prehodov; po vsakem preveri permutacijo. |
| R06 | Veljaven premik po razveljavitvi izprazni R; neveljaven robni premik ga ohrani. | S6: primerjaj zgodovino po veljavnem in robnem premiku. |
| R07 | U vsebuje največ 20 prejšnjih permutacij; pri 21. veljavnem premiku se najstarejša zavrže. Ponoviti je mogoče vse trenutno razveljavljene korake. | S7: 21 premikov, razveljavitev in ponovitev razpoložljivih korakov. |
| R08 | Če O≠O₀, Začetni vrstni red vrne O₀ kot eno dejanje in počisti R; če O=O₀, je onemogočen brez spremembe zgodovine. | S8: ponastavitev, njena razveljavitev/ponovitev in začetni no-op. |
| R09 | Preglednica kaže globalni O; tabla njegov vrstni red filtrira znotraj stalnih stolpcev stanj. Premik na tabli uporablja globalnega soseda in ne spremeni statusa. | S9: položaji v obeh pogledih ter premik čez mejo statusov. |
| R10 | Menjava pogleda in odpiranje/zapiranje podrobnosti ohranita O,U,R. Menjava projekta in osvežitev ponastavita na prejeto izhodišče; vrstni red ni trajen. | S10: navigacija po preureditvi, nato menjava projekta in osvežitev. |
| R11 | role=status, aria-label="Zgodovina vrstnega reda" kaže "Razveljavitve: U. Ponovitve: R.". Gumba za prazni zgodovini sta onemogočena. Projekta z 0 ali 1 opravilom ostaneta uporabna. | S11: števec, stanja gumbov ter prazen/enojni seznam. |
| R12 | Vrstni red je permutacija iste množice ID-jev; brez API zapisov in sprememb polj/statusov. Števci stanj in podrobnosti ostanejo pravilni. Pri 390 px se stran ne razširi; notranje drsenje je dovoljeno. | S12: primerjaj API, polja, statuse, števce in podrobnosti; preveri mobilno širino. |

### Dogovor o vmesniku

- Ob vrstici/kartici sta ločena gumba Premakni &lt;id&gt; gor/dol, zunaj povezave opravila. Ustrezni robni gumb je onemogočen.
- Vrstice in kartice ohranijo data-task-id. Element aria-label="Mesto opravila &lt;id&gt;" prikazuje globalno mesto.
- Gumbi se imenujejo Razveljavi premik, Ponovi premik in Začetni vrstni red. Števec ima role=status, aria-label="Zgodovina vrstnega reda" in zahtevano besedilo.
- Ohrani obstoječa dostopna imena pogledov in stolpcev ter aria-label="Pregled stanj opravil"; tabla obdrži stalne stolpce Pripravljeno, V delu in Končano.
- Pri širini 390 px stran nima vodoravnega preliva; preglednica in tabla se lahko pomikata znotraj svojega prikaza. Ohranita se potrjeni dizajn in viden fokus tipkovnice.

S1–S12 so sprejemni scenariji. Vhodi vključujejo poljubno število opravil (tudi 0, 1 in več kot 10), različen vrstni red, enolične ID-je, enake naslove, veljavne datume ter Unicode besedilo; projekt je lahko prazen. To so podatki domene iz navodil, ne dodatne zahteve. Uspeh pomeni, da so izpolnjeni pogoji R01–R12 ter da vsak prehod ohrani invariant permutacije in nespremenjenost podatkovnih polj.

## Izvedba in sledljivost

| Zahteva | Pogoj | Test ali scenarij | Datoteka in del kode | Izid ter dokaz |
| --- | --- | --- | --- | --- |
| R01 | Začetni vrstni red, globalno mesto po ID | S1 | Določi po implementaciji v src/ | Implementacija in test še niso izvedeni. |
| R02 | Globalna sosednja zamenjava, polja nespremenjena | S2 | Določi po implementaciji v src/ | Implementacija in test še niso izvedeni. |
| R03 | Meje onemogočene, neveljavno dejanje brez spremembe | S3 | Določi po implementaciji v src/ | Implementacija in test še niso izvedeni. |
| R04 | Sklad razveljavitev in obnovitev | S4 | Določi po implementaciji v src/ | Implementacija in test še niso izvedeni. |
| R05 | Sklad ponovitev in veljavne permutacije | S5 | Določi po implementaciji v src/ | Implementacija in test še niso izvedeni. |
| R06 | Razveljavitev zgodovine ponovitev samo po veljavnem premiku | S6 | Določi po implementaciji v src/ | Implementacija in test še niso izvedeni. |
| R07 | Omejitev 20 prejšnjih permutacij | S7 | Določi po implementaciji v src/ | Implementacija in test še niso izvedeni. |
| R08 | Začetni vrstni red kot eno dejanje ali onemogočen no-op | S8 | Določi po implementaciji v src/ | Implementacija in test še niso izvedeni. |
| R09 | Globalna preglednica in tabla filtrirana po stanjih | S9 | Določi po implementaciji v src/ | Implementacija in test še niso izvedeni. |
| R10 | Ohranitev ob navigaciji, reset projekta/osvežitve | S10 | Določi po implementaciji v src/ | Implementacija in test še niso izvedeni. |
| R11 | Števec, stanja gumbov, prazen/enojni projekt | S11 | Določi po implementaciji v src/ | Implementacija in test še niso izvedeni. |
| R12 | Invariant ID/podatkov, brez zapisov, Folio/mobilni prikaz | S12 | Določi po implementaciji v src/ | Implementacija in test še niso izvedeni. |

## Odprta vprašanja in omejitve

Bistvenega odprtega vprašanja ni. Razvojni in končni testi niso bili izvedeni v tem koraku. Specifikacija ne zatrjuje rezultatov izvedbe; dejanske datoteke kode, testi in dokazila se povežejo po implementaciji. Strežnik, infrastruktura, odvisnosti, skupni tipi in skupni testi so zunaj dovoljenega obsega sprememb.
