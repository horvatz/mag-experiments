# P03: Iskanje in sestavljeni filtri

Različica 1.0, glavna naloga. Vsi postopki prejmejo iste zahteve, izhodišče in razvojne teste. Začetni Folio ne vsebuje rešitve pilotov ali drugih glavnih nalog.

## Zahteve

| ID | Pričakovano delovanje |
| --- | --- |
| R01 | Ob nalaganju so iskalni vnos in filtra prazni oziroma nastavljeni na vse; prikazana so vsa opravila trenutnega projekta v izvornem vrstnem redu. |
| R02 | Iskanje pregleduje združene id, title, description in assignee. Obe strani pretvori z Unicode NFD, odstrani kombinacijska znamenja U+0300–U+036F in pretvori v male črke; zato crka č in c ter velikost črk ne razlikujeta zadetkov. |
| R03 | Iskalni vnos razdeli po belinah v neprazne besede; opravilo ustreza, če so vse besede dobesedni podnizi združenih polj. Vrstni red besed ni pomemben, ločila niso regularni izrazi. Prazen vnos ne omejuje. |
| R04 | Filter stanja in filter odgovorne osebe delujeta skupaj z iskanjem po logičnem IN. Stanje ima vrednosti all, todo, in_progress, done; odgovorna oseba se primerja natančno, brez normalizacije. |
| R05 | Izbirnik oseb vsebuje možnost all in vsako različno neprazno ime iz celotnega trenutnega projekta natanko enkrat, tudi če je trenutno skrito zaradi drugih pogojev. Preklop projekta ne ohrani stare osebe. |
| R06 | Preglednica in tabla kažeta iste ustrezne ID-je; preklop pogleda ohrani vse filtre. Stolpci table vsebujejo samo ustrezna opravila svojega stanja. |
| R07 | Menjava projekta ponastavi iskanje in oba filtra. Filtri se nikoli ne uporabijo na podatkih drugega projekta. |
| R08 | Osvežitev strani začne s privzetimi filtri. Filtri se ne shranjujejo v URL ali trajno shrambo brskalnika. |
| R09 | Število rezultatov je Prikazano: N od M., kjer je M velikost celotnega trenutnega projekta. Pregled stanj in števci stolpcev štejejo prikazane rezultate. |
| R10 | Če v nepraznem projektu nobeno opravilo ne ustreza, je prikazano sporočilo Ni zadetkov. in oba pogleda ostaneta uporabna. Prazen projekt ohrani običajno prazno stanje in števec 0 od 0. |
| R11 | Počisti filtre v enem dejanju vrne vse tri kontrole na privzete vrednosti in prikaže vsa opravila. Uporaba filtrov ne spremeni izvornega vrstnega reda ali polj podatkov. |
| R12 | Obstoječa navigacija in bralne podrobnosti delujejo. Nobeno dejanje filtriranja ne pošlje POST/PATCH/PUT/DELETE na /api/. Ohranjen je Folio in prikaz pri ozki širini. |

## Dogovor o vmesniku

- Iskalni input type=search: Išči opravila.
- HTML select: Filter stanja (all/todo/in_progress/done) in Filter odgovorne osebe (all ali točno ime).
- Gumb Počisti filtre. Element role=status, aria-label=Rezultati filtriranja, besedilo Prikazano: N od M..

Ohrani `data-task-id` na vrsticah in karticah, dostopna imena obstoječih pogledov in stolpcev ter `aria-label="Pregled stanj opravil"`. Nova dejanja ob opravilu morajo biti zunaj njegove povezave. Na širini 390 pik se cela stran ne razširi; notranje drsenje preglednice in table je dovoljeno. Besedilo, ki ni izrecno določeno zgoraj, in razporeditev novih kontrol nista predpisana.

## Podatki, obseg in preverjanje

Podatke preberi iz obstoječega javnega API-ja. Testi lahko vrnejo poljubno število opravil (tudi nič, eno in več kot deset), drugačne enkratne ID-je, enake naslove, različno zaporedje in veljavne koledarske datume. Tipi in polja so enaki izhodišču. Projekta sta lahko prazna. Naslovi, opisi in imena so navadno besedilo, tudi z Unicode znaki in ločili. V nalogah z izbiro odgovorne osebe so imena neprazna in različna od rezervirane vrednosti `all`. Vsako opravilo pripada svojemu projektu.

Javni pripomoček razvojnih testov podaja dodatne podatke z nadzorovanimi GET odgovori. To je testni mehanizem, ki ga uporabniški vmesnik ne sme uvažati ali uporabljati. Aplikacija bere samo `/api/`; ne bere testnih kontrol `/__test/`. Strežnika, infrastrukture, odvisnosti in skupnih tipov ne spreminjaj. Razvojni primeri niso celoten obseg zahtev; končni primeri lahko uporabijo drugačne podatke iz opisane domene.

Navigacije med nezaključenim nalaganjem in novih sočasnih sprememb podatkov brez osvežitve ne širimo prek obstoječih regresijskih zahtev. Če posamezna zahteva ne določa trajne shrambe ali URL-ja, je stanje nove funkcionalnosti lokalno trenutnemu projektu. Ne dodajaj novih zapisovalnih API-jev.

## Oddaja

Spreminjaj samo `src/`, lastne teste v `tests/agent/` in dokumente v `docs/agent/`. Veljajo projektna pravila; omembe pilotov v dokumentih izhodišča so zgodovinske. Pripravi specifikacijo po skupni predlogi in poveži vseh R01–R12 s pogoji, kodo in dejansko izvedenimi testi. Izbrane pogoje opredeli tudi s predikati. Zapiši nepreverjene dele in omejitve; nedostopnih končnih testov ne navajaj kot opravljenih.
