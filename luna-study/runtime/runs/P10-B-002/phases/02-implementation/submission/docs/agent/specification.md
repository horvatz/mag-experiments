# Specifikacija: Lokalni vrstni red z razveljavitvami

## Problem in kontekst
Folio za izbrani projekt prikazuje opravila v preglednici ali na tabli. Dodati je treba lokalno preurejanje po ID-ju, z razveljavitvijo, ponovno izvedbo in vrnitvijo na začetni vrstni red. Začetni seznam je vrstni red javnega API-ja. Sprememba velja do menjave projekta ali osvežitve; opravila in njihova polja se ne spreminjajo, podatki se ne shranjujejo trajno. Ohranjamo slovenski vmesnik in potrjeni videz Folio.

## Vhodi, dejanja in izidi
Vhod je opravljen seznam trenutnega projekta z enkratnimi ID-ji. Dejanja: premik gor/dol po ID-ju, undo, redo, začetni vrstni red, preklop pogleda, odpiranje/zapiranje podrobnosti in menjava projekta. Veljaven premik zamenja neposredna soseda; meje/ prazna zgodovina blokirajo ustrezno dejanje brez stranskih učinkov. Menjava projekta in osvežitev naložita nov začetni vrstni red in ponastavita zgodovini.

## Zahteve in pravila
Naj bodo `I` začetni seznam ID-jev, `O` trenutni seznam, `U` sklad prejšnjih permutacij za undo in `R` sklad za redo. Veljaven premik na indeksu `i` v smeri `d∈{-1,+1}) shrani `O` v `U`, ohrani največ zadnjih 20 stanj, nato zamenja soseda in izprazni `R`. Undo shrani `O` v `R` in obnovi vrh `U`; redo shrani `O` v `U` (z omejitvijo 20) in obnovi vrh `R`. Reset, kadar `O≠I`, shrani `O` v `U`, nastavi `O=I` in izprazni `R`.

| Zahteva | Pravilo oziroma sprejemni pogoj | Način preverjanja |
| --- | --- | --- |
| R01 | Začetno `O=I`; mesto je `indexOf(O,id)+1`, neodvisno od naslova. | Začetni API vrstni red in enaki naslovi. |
| R02 | Premik po ID-ju zamenja neposrednega globalnega soseda; ostala polja ostanejo enaka. | Gor/dol in primerjava polj. |
| R03 | Prvi gor in zadnji dol sta onemogočena; neveljaven/ponovljen robni ukaz ne spremeni `O,U,R`. | Oba roba in nespremenjena zgodovina. |
| R04 | Undo obnovi prejšnji `O` in v `R` shrani trenutno permutacijo. | En premik, undo in preverba obeh skladov. |
| R05 | Redo obnovi zadnjo razveljavljeno permutacijo; nizi undo/redo ohranijo vse ID-je brez duplikatov. | Več zaporednih premikov, undo in redo. |
| R06 | Veljaven nov premik po undo počisti `R`; zavrnjen robni premik ga ohrani. | Undo, veljaven/neveljaven premik in redo. |
| R07 | `0≤|U|≤20`; 21. veljavno dejanje odstrani najstarejše stanje. | Več kot 20 premikov in undo/redo. |
| R08 | Reset pri `O≠I` je eno undo dejanje, počisti redo; pri `O=I` je onemogočen in brez spremembe zgodovine. | Reset spremenjenega in začetnega vrstnega reda. |
| R09 | Preglednica kaže globalna mesta; tabla ohranja stolpce stanj in relativni vrstni red znotraj stanja. Premik na tabli uporablja globalnega soseda/mesto in ne spremeni statusa. | Oba pogleda, tudi premik čez status. |
| R10 | Pogled/podrobnosti ohranijo `O,U,R`; menjava projekta/osvežitev uporabita projektov `I` in počistita zgodovini; brez trajne shrambe. | Preklop, podrobnosti, menjava, refresh. |
| R11 | Statusno besedilo je `Razveljavitve: U. Ponovitve: R.`; undo/redo sta disabled pri ničli. Prazen in enojni seznam sta uporabna. | Števci in gumbi pri praznem, enojnem in daljšem seznamu. |
| R12 | Ohrani se ista množica ID-jev in celotna opravila; ni API zapisov ali sprememb polj. Statusni števci/podrobnosti in prilagodljiv Folio ostanejo pravilni. | Objektna primerjava, omrežni zapisi, podrobnosti in 390 px. |

## Izvedba in sledljivost
Ta specifikacija je pred implementacijo. Kodo, teste in izide bo treba dopolniti po pregledu oziroma pri nadaljevanju izvajalca. V tej vlogi testov ne izvajam.

| Zahteva | Pogoj | Test ali scenarij | Datoteka in del kode | Izid ter dokaz |
| --- | --- | --- | --- | --- |
| R01–R12 | Zgoraj navedeni pogoji. | Ustrezni skupni/razvojni scenariji. | Pregled še sledi. | Testi niso izvedeni. |

## Odprta vprašanja in omejitve
To je začetni osnutek pred pregledom obstoječih tipov, kode in dizajna. Preveriti je treba, kako se opravila razvrščajo, filtrirajo po projektu in prikazujejo v pogledih. Posebni končni testi niso dostopni avtorju specifikacije in se ne štejejo za izvedene.


## Pregled izhodiščne kode in dogovor za implementacijo

Pregledano 2026-09-29: shared/types.ts definira Task s polji id, projectId, title, description, status (todo, in_progress ali done), assignee in dueDate; identifikatorji so nizi. App.tsx oziroma ProjectView bere GET /api/projects/{id}/tasks; zneski stanj se izračunajo iz seznama, tabela pa ga neposredno mapira. TaskBoard.tsx filtrira seznam v stalne stolpce todo, in_progress in done ter znotraj vsakega ohrani relativni vrstni red vhodnega seznama. TaskDetails.tsx posebej bere GET /api/tasks/{id}, dialog pa se zapre na projektno pot z ohranjenim pogledom. ProjectView ima ključ ID-ja projekta. Navigation določa table/board prek URL-ja. api.ts ima PATCH pripomoček za drugo rabo, vendar vrstni red ne sme opraviti zapisa. Dizajn v docs/dizajn.md določa obstoječe Folio površine in notranje drsenje prikazov pri ozkem zaslonu.

Vrstni red vodi ID-je v istem zaporedju kot API, začetni seznam pa velja samo za trenutni projekt. Nobeno polje Task ni spremenjeno. Za tabelo in kartice ohrani data-task-id. Globalno mesto mora biti dostopno kot element z aria-label »Mesto opravila {id}« in besedilom številke. Imeni kontrol sta »Premakni {id} gor« in »Premakni {id} dol«; kontrolniki so zunaj povezave. Zgodovinski gumbi se imenujejo »Razveljavi premik«, »Ponovi premik« in »Začetni vrstni red«. Števec je role=status, aria-label »Zgodovina vrstnega reda«, natančno besedilo »Razveljavitve: U. Ponovitve: R.«, kjer U in R predstavljata dolžini skladov. Ohraniti je treba aria-label Pregled stanj opravil, dostopni imeni prikazov in table ter imena obstoječih stolpcev.

## Podrobna sledljivost

Spodnja sledljivost konkretizira pogoje zgoraj. Datoteke so mesta izhodiščne kode za implementacijo; pilotna koda še ne obstaja v tej fazi.

| Zahteva | Pogoj za sprejem | Scenarij | Izhodiščna lokacija | Dokaz |
| --- | --- | --- | --- | --- |
| R01 | Začetni seznam je enak vrstnemu redu GET odgovora; globalno mesto temelji na ID-ju, tudi ob enakih naslovih. | Poljubno preurejen odziv in podvojeni naslovi. | App.tsx: ProjectView in izris; TaskBoard.tsx: filtriranje. | Neizvedeno; samo pregled kode. |
| R02 | Premik zamenja le izbrani ID in neposrednega soseda; opravilni objekti/polja ostanejo enaki. | Veljaven premik gor in dol; primerjati Task. | App.tsx in TaskBoard.tsx. | Neizvedeno. |
| R03 | Prvi gor/zadnji dol sta disabled; zavrnjeni klic ohranja O,U,R. | Robova in poskus sprožitve roba. | Kontrolniki ob vrstici/kartici v App.tsx/TaskBoard.tsx. | Neizvedeno. |
| R04 | Undo obnovi vrhnjo prejšnjo permutacijo in trenutno permutacijo shrani v redo. | D02, več premikov + undo. | Stanje in kontrolniki v App.tsx. | Neizvedeno. |
| R05 | Redo obnovi vrhnjo razveljavljeno permutacijo; ID-ji se ne izgubijo/podvojijo. | D02, večkorakni undo/redo. | Stanje v App.tsx. | Neizvedeno. |
| R06 | Veljaven premik počisti redo; zavrnjen robni premik ga ohrani. | D03 in dodatni rob po undo. | Handler premika v App.tsx/TaskBoard.tsx. | Neizvedeno. |
| R07 | Undo vsebuje največ zadnjih 20 stanj; redo deluje za vse trenutno razveljavljene korake. | 21 ali več premikov in undo/redo. | Omejitev sklada v App.tsx. | Neizvedeno; D01-D04 tega ne pokrijejo. |
| R08 | Reset je ena undo sprememba pri O != I; pri O = I je disabled in brez učinka. | D04 ter ponovni reset na začetku. | Kontrolnik in reset v App.tsx. | Neizvedeno. |
| R09 | Tabela in tabla pokažeta globalno mesto; vrstni red znotraj stolpca sledi globalnemu, premik lahko prečka stolpec brez spremembe statusa. | D04 in premik čezstatusnega soseda na tabli. | App.tsx, TaskBoard.tsx. | Neizvedeno. |
| R10 | Pogled in dialog ohranita O,U,R; menjava projekta/osvežitev vzpostavita I in prazni zgodovini. | Preklop, dialog odprt/zaprt, projekt, polna osvežitev. | App.tsx, TaskDetails.tsx, navigation.ts. | Neizvedeno. |
| R11 | Točno določeno statusno besedilo; disabled undo/redo pri praznem skladu; prazen/enojni seznam ne sesuje prikaza. | D03; dodati prazen in enojni seznam. | App.tsx. | Neizvedeno. |
| R12 | Ista množica ID-jev, Task polja/statusi/podrobnosti nespremenjeni, brez API zapisov, brez vodoravnega pomika cele strani pri 390 px. | D04; primerjava statusnih števcev in podrobnosti. | App.tsx, TaskBoard.tsx, TaskDetails.tsx in slogi. | Neizvedeno. |

Pregledana razvojna datoteka tests/development/P10.spec.ts vsebuje D01 rob/premik, D02 undo/redo, D03 redo clearing/števec ter D04 globalno mesto na tabli/reset/brez API zapisov in preverbo širine strani. To so scenariji v datoteki, ne izvedeni testi. Za R07 in R10 ter prazne/enojne sezname, enake naslove, čezstatusni premik in vsebinsko pravilnost podrobnosti ostaja potrebna preverba. Avtor specifikacije po vlogi ni zagnal aplikacije, testov ali vizualnega pregleda. Zgornja začetna opomba, da pregled kode šele sledi, je s tem pregledom zaključena.
