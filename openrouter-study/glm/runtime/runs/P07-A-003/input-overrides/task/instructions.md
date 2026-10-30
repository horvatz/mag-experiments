# P07: Priljubljena opravila in trajna shramba

Različica 1.0, glavna naloga. Vsi postopki prejmejo iste zahteve, izhodišče in razvojne teste. Začetni Folio ne vsebuje rešitve pilotov ali drugih glavnih nalog.

## Zahteve

| ID | Pričakovano delovanje |
| --- | --- |
| R01 | Vsako opravilo v preglednici in na tabli ima ločen gumb Priljubljeno opravilo <id> z aria-pressed. Klik preklopi samo ta ID in ne odpre podrobnosti; enaki naslovi ostanejo neodvisni. |
| R02 | Priljubljene hrani v localStorage pod ključem folio:favorites:v1 kot JSON {version:1,ids:[...]}. Ob zapisu so ID-ji enkratni nizi in razvrščeni po UTF-16. Polja opravil se ne zapisujejo v shrambo. |
| R03 | Osvežitev obnovi shranjene ID-je. Veljaven zapis lahko vsebuje podvojene ali trenutno neznane ID-je: podvojene obravnava kot enega, neznane ohrani za druge projekte, vendar ne ustvarja izmišljenih opravil. |
| R04 | Manjkajoč ključ, neveljaven JSON, napačna version, manjkajoči ids ali katerikoli neniz v ids pomenijo prazno začetno množico. Aplikacija ne odpove in ob nalaganju sama ne prepisuje shrambe. |
| R05 | Checkbox Prikaži le priljubljena omeji prikaz na priljubljene trenutnega projekta, v izvornem vrstnem redu. Njegova privzeta vrednost je false. |
| R06 | Odstranitev priljubljenega med aktivnim filtrom ga takoj odstrani iz prikaza. Ko ni rezultatov, se pokaže Ni priljubljenih opravil. in kontrole omogočajo izklop filtra. |
| R07 | Preglednica in tabla uporabljata isto množico in filter; preklop pogleda ne izgubi sprememb. Podrobnosti ostanejo dostopne po pravilnem ID-ju. |
| R08 | Menjava projekta ohrani globalno množico priljubljenih, filter pa ponastavi na false. Osvežitev obnovi množico, filter pa je prav tako false. |
| R09 | Gumb Odstrani priljubljene tega projekta odstrani samo ID-je opravil celotnega trenutnega projekta. ID-ji drugih projektov in neznani ID-ji ostanejo. Brez priljubljenih tega projekta je gumb onemogočen. |
| R10 | Element števca vedno kaže Priljubljeno: X od M., kjer se X/M nanašata na celoten trenutni projekt, tudi ko je filter aktiven. Števci stolpcev table štejejo vidna opravila. |
| R11 | Dogodek storage za pravi ključ takoj uskladi množico z novo vrednostjo po istih pravilih validacije; null jo izprazni. Drug ključ se ignorira. Dogodek ne sproži povratnega zapisa. Če branje ali zapis shrambe vrže izjemo, aplikacija ostane uporabna v pomnilniku in prikaže opozorilo o nedostopni shrambi. |
| R12 | Vse spremembe priljubljenih so lokalne: ni zapisov na API in nobeno polje opravila se ne spremeni. Ohranjen je Folio, nalaganje, navigacija in ozki prikaz. |

## Dogovor o vmesniku

- Gumbi Priljubljeno opravilo <id> z aria-pressed=true/false, postavljeni ločeno od povezave opravila.
- Checkbox Prikaži le priljubljena; gumb Odstrani priljubljene tega projekta.
- Element role=status, aria-label=Število priljubljenih, besedilo Priljubljeno: X od M.. Napaka shrambe ima role=alert in vsebuje besedo shramba.

Ohrani `data-task-id` na vrsticah in karticah, dostopna imena obstoječih pogledov in stolpcev ter `aria-label="Pregled stanj opravil"`. Nova dejanja ob opravilu morajo biti zunaj njegove povezave. Na širini 390 pik se cela stran ne razširi; notranje drsenje preglednice in table je dovoljeno. Besedilo, ki ni izrecno določeno zgoraj, in razporeditev novih kontrol nista predpisana.

## Podatki, obseg in preverjanje

Podatke preberi iz obstoječega javnega API-ja. Testi lahko vrnejo poljubno število opravil (tudi nič, eno in več kot deset), drugačne enkratne ID-je, enake naslove, različno zaporedje in veljavne koledarske datume. Tipi in polja so enaki izhodišču. Projekta sta lahko prazna. Naslovi, opisi in imena so navadno besedilo, tudi z Unicode znaki in ločili. V nalogah z izbiro odgovorne osebe so imena neprazna in različna od rezervirane vrednosti `all`. Vsako opravilo pripada svojemu projektu.

Javni pripomoček razvojnih testov podaja dodatne podatke z nadzorovanimi GET odgovori. To je testni mehanizem, ki ga uporabniški vmesnik ne sme uvažati ali uporabljati. Aplikacija bere samo `/api/`; ne bere testnih kontrol `/__test/`. Strežnika, infrastrukture, odvisnosti in skupnih tipov ne spreminjaj. Razvojni primeri niso celoten obseg zahtev; končni primeri lahko uporabijo drugačne podatke iz opisane domene.

Navigacije med nezaključenim nalaganjem in novih sočasnih sprememb podatkov brez osvežitve ne širimo prek obstoječih regresijskih zahtev. Če posamezna zahteva ne določa trajne shrambe ali URL-ja, je stanje nove funkcionalnosti lokalno trenutnemu projektu. Ne dodajaj novih zapisovalnih API-jev.

## Oddaja

Spreminjaj samo `src/`, lastne teste v `tests/agent/` in dokumente v `docs/agent/`. Veljajo projektna pravila; omembe pilotov v dokumentih izhodišča so zgodovinske. Pripravi specifikacijo po skupni predlogi in poveži vseh R01–R12 s pogoji, kodo in dejansko izvedenimi testi. Izbrane pogoje opredeli tudi s predikati. Zapiši nepreverjene dele in omejitve; nedostopnih končnih testov ne navajaj kot opravljenih.
