# P06: Nastavljiv izvoz CSV

Različica 1.0, glavna naloga. Vsi postopki prejmejo iste zahteve, izhodišče in razvojne teste. Začetni Folio ne vsebuje rešitve pilotov ali drugih glavnih nalog.

## Zahteve

| ID | Pričakovano delovanje |
| --- | --- |
| R01 | Izvoz zajame opravila trenutnega projekta v izvornem vrstnem redu. Privzeti filter je all, izbrane so vse dovoljene kolone, ločilo je podpičje. |
| R02 | Izbrati je mogoče kolone id, projectId, title, status, assignee, dueDate, description. Glava in vrednosti sledijo temu nespremenljivemu vrstnemu redu ne glede na vrstni red klikov. |
| R03 | Če nobena kolona ni izbrana, je izvoz onemogočen in ne ustvari prenosa. Ponovni izbor kolone izvoz omogoči, če obstajajo ustrezne vrstice. |
| R04 | Filter all/todo/in_progress/done omeji samo izvožene vrstice. Vmesnik še prikazuje celoten projekt. Prazen projekt ali prazen filtrirani rezultat onemogoči izvoz. |
| R05 | Izvoz prenese datoteko folio-<projectId>.csv z UTF-8 BOM U+FEFF na začetku. Ne odpre nove strani in ne pošlje vsebine na strežnik. |
| R06 | Ločilo je nastavljivo na ; ali ,. Vsaka glava in vsaka vrednost sta vedno obdani z dvojnimi narekovaji. Vsak notranji dvojni narekovaj je podvojen. |
| R07 | Vrstice CSV so ločene s CRLF; tudi zadnja vrstica se konča s CRLF. Ločila in prelomi vrstic v vrednostih ostanejo znotraj pravilno navedene vrednosti in se ne izgubijo. |
| R08 | Pred navedbo vrednosti nevtraliziraj formulo: če se izvirni niz po poljubnih začetnih znakih presledek, tabulator, CR ali LF začne z =, +, - ali @, dodaj apostrof na sam začetek izvirnega niza. Drugih nizov ne spreminjaj. Pravilo velja za vse podatkovne kolone, ne za glavo. |
| R09 | Šumniki, drugi Unicode znaki, presledki in vsebina opisov ostanejo ohranjeni, razen izrecne nevtralizacije formul. status se izvozi kot interna vrednost, datum kot izvirni YYYY-MM-DD. |
| R10 | Preklop Preglednica/Tabla ohrani izbor kolon, ločilo in filter; isti nastavitvi v obeh pogledih ustvarita iste bajte datoteke. |
| R11 | Menjava projekta ter osvežitev ponastavita izbrane kolone, ločilo in filter na privzete vrednosti. Zaporedna izvoza po spremembi nastavitev vedno odražata trenutne nastavitve. |
| R12 | Izvoz in njegove kontrole ne spreminjajo nobenega opravila, izvornega polja ali obstoječih bralnih funkcij. Ne pošiljajo zapisov na API. Videz Folio ostane prilagodljiv. |

## Dogovor o vmesniku

- Checkbox za vsako kolono ima dostopno ime Stolpec <ime>, npr. Stolpec title.
- HTML select Ločilo CSV z vrednostma ; in ,; HTML select Filter izvoza z vrednostmi all/todo/in_progress/done.
- Gumb Izvozi CSV. Imena projektov oziroma ID-ji v obsegu imajo črke, številke in vezaje.

Ohrani `data-task-id` na vrsticah in karticah, dostopna imena obstoječih pogledov in stolpcev ter `aria-label="Pregled stanj opravil"`. Nova dejanja ob opravilu morajo biti zunaj njegove povezave. Na širini 390 pik se cela stran ne razširi; notranje drsenje preglednice in table je dovoljeno. Besedilo, ki ni izrecno določeno zgoraj, in razporeditev novih kontrol nista predpisana.

## Podatki, obseg in preverjanje

Podatke preberi iz obstoječega javnega API-ja. Testi lahko vrnejo poljubno število opravil (tudi nič, eno in več kot deset), drugačne enkratne ID-je, enake naslove, različno zaporedje in veljavne koledarske datume. Tipi in polja so enaki izhodišču. Projekta sta lahko prazna. Naslovi, opisi in imena so navadno besedilo, tudi z Unicode znaki in ločili. V nalogah z izbiro odgovorne osebe so imena neprazna in različna od rezervirane vrednosti `all`. Vsako opravilo pripada svojemu projektu.

Javni pripomoček razvojnih testov podaja dodatne podatke z nadzorovanimi GET odgovori. To je testni mehanizem, ki ga uporabniški vmesnik ne sme uvažati ali uporabljati. Aplikacija bere samo `/api/`; ne bere testnih kontrol `/__test/`. Strežnika, infrastrukture, odvisnosti in skupnih tipov ne spreminjaj. Razvojni primeri niso celoten obseg zahtev; končni primeri lahko uporabijo drugačne podatke iz opisane domene.

Navigacije med nezaključenim nalaganjem in novih sočasnih sprememb podatkov brez osvežitve ne širimo prek obstoječih regresijskih zahtev. Če posamezna zahteva ne določa trajne shrambe ali URL-ja, je stanje nove funkcionalnosti lokalno trenutnemu projektu. Ne dodajaj novih zapisovalnih API-jev.

## Oddaja

Spreminjaj samo `src/`, lastne teste v `tests/agent/` in dokumente v `docs/agent/`. Veljajo projektna pravila; omembe pilotov v dokumentih izhodišča so zgodovinske. Pripravi specifikacijo po skupni predlogi in poveži vseh R01–R12 s pogoji, kodo in dejansko izvedenimi testi. Izbrane pogoje opredeli tudi s predikati. Zapiši nepreverjene dele in omejitve; nedostopnih končnih testov ne navajaj kot opravljenih.
