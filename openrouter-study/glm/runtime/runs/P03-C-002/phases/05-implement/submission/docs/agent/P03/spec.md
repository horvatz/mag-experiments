# P03 — Iskanje in sestavljeni filtri

Specifikacija pokriva celotno zahtevano funkcionalnost P03 v aplikaciji Folio.
Izvirne zahteve so v [`task/instructions.md`](../../../task/instructions.md),
skupna predloga pa v [`task/specification-template.md`](../../../task/specification-template.md).

## Problem in kontekst

Uporabnik potrebuje iskanje po opravilih trenutnega projekta ter dva filtra:
po stanju in odgovorni osebi. Oba obstoječa pregleda (preglednica in tabla)
morata prikazovati enake ID-je, obstoječa navigacija in bralne podrobnosti pa
morata ostati uporabni. Dizajn Folio, slovenska poimenovanja in obnašanje ob
ozki širini se ohranijo.

Podatki se berejo iz obstoječega javnega API-ja `/api/` po projektu oziroma
identifikatorju opravila. Nova zapisovalna API-ja niso dovoljena. Testne
kontrole `/__test/` so zgolj testni mehanizem in jih uporabniški vmesnik ne sme
uporabiti.

## Vhodi, dejanja in izidi

### Vhodna stanja in kontrola

| Simbol ali kontrola | Pomen |
| --- | --- |
| `selectedProjectId` | Trenutno izbrani projekt; izbira je po `id`. |
| `search` | Niz vnosnega polja `type=search`, `Išči opravila`. |
| `statusFilter` | Ena od vrednosti `all`, `todo`, `in_progress`, `done`. |
| `assigneeFilter` | Vrednost `all` ali natančno ime obstoječe odgovorne osebe. |
| `view` | Obstoječa izbira med preglednico in tablo. |
| `projectTasks` | Vsa opravila trenutnega projekta v izvornem vrstnem redu. |

Privzete vrednosti ob nalaganju strani so `search = ""`,
`statusFilter = "all"` in `assigneeFilter = "all"`. Pogled ohrani obstoječe
obnašanje izhodišča.

### Normalizacija iskanja

Za vsako opravilo se oblikuje združeno polje iz nizov `id`, `title`,
`description` in `assignee`. Iskalna vrednost in vsaka vrednost opravila se
normalizirajo z Unicode NFD, odstranitvijo kombinacijskih znamenj
`U+0300`–`U+036F` in pretvorbo v male črke. Iskanje je zato neobčutno na
dvočrkovne predstavitve črk ter velikost črk.

Neprazen iskalni vnos se razdeli po belinah na neprazne besede. Opravilo
ustreza iskanju, če je vsaka iskalna beseda dobesedni podnizi normaliziranega
združenega polja. Vrstni red besed ni pomemben, ločila se ne tolmačijo kot
regularni izrazi, prazen vnos pa ne omejuje rezultatov.

### Pravila sprememb stanja

| Dejanje | Pravilo |
| --- | --- |
| Vnos ali sprememba iskanja | Posodobi `search`; izračunaj rezultat iz `projectTasks` trenutnega projekta. |
| Izbira stanja | Posodobi `statusFilter`; pogoj se združuje po logičnem AND z iskanjem in filtrom osebe. |
| Izbira odgovorne osebe | Posodobi `assigneeFilter`; primerjava imena je natančna, brez normalizacije. |
| Preklop pogleda | Ohrani `selectedProjectId`, `search`, `statusFilter` in `assigneeFilter`; spremeni le pogled. |
| Menjava projekta | Ponastavi iskanje in oba filtra na privzete vrednosti pred uporabo podatkov novega projekta. Stare osebe ne ostanejo v izbirniku. |
| Osvežitev strani | Začne s privzetimi filtri; filtri se ne shranjujejo v URL ali trajno shrambo brskalnika. |
| Počisti filtre | V enem dejanju nastavi `search = ""`, `statusFilter = "all"`, `assigneeFilter = "all"` in prikaže vsa opravila. |

Izbirnik odgovorne osebe vedno ponudi `all` ter vsako različno neprazno ime iz
celotnega trenutnega projekta natanko enkrat, ne glede na trenutne iskalne
besede ali druge filtre. Preklop projekta ne ohrani starih oseb.

## Izračun rezultatov

`result` je vsako opravilo `task` iz `projectTasks`, za katerega velja:

1. če je `search` neprazen, vsaka normalizirana iskalna beseda obstaja kot
   podniz normaliziranega združenega polja opravila;
2. če je `statusFilter = "all"`, stanje ni dodatno omejeno, sicer je
   `task.status = statusFilter`;
3. če je `assigneeFilter = "all"`, odgovorna oseba ni dodatno omejena, sicer je
   `task.assignee = assigneeFilter` po natančni primerjavi.

Vsi trije pogoji se združujejo z logičnim AND. Rezultat ohranja izvorni vrstni
red `projectTasks` ter vse izvirne vrednosti polj. `M` v števcu je število vseh
opravil trenutnega projekta, `N` pa število ustreznih rezultatov.

Preglednica in tabela prikažeta ista ID-je. Stolpci table vsebujejo samo ustrezna
opravila svojega stanja. Pregled stanj in števci stolpcev štejejo prikazane
rezultate. Element z `role="status"` in `aria-label="Rezultati filtriranja"`
vsebuje `Prikazano: N od M.`.

## Zahteve in pravila

| Zahteva | Pravilo oziroma sprejemni pogoj | Način preverjanja |
| --- | --- | --- |
| R01 | Ob nalaganju so vse tri kontrole na privzeti vrednosti in so prikazana vsa opravila trenutnega projekta v izvornem vrstnem redu. | Naloži stran s poljubno množico opravil; preveri kontrolne vrednosti, celoten seznam in vrstni red ID-jev. |
| R02 | Iskanje pregleduje `id`, `title`, `description` in `assignee`; obe strani sta normalizirani z NFD, brez `U+0300`–`U+036F` in z malimi črkami. | Preveri zadetke po vseh štirih poljih ter pare, ki se razlikujejo zgolj v sestavljenih črkah ali velikosti. |
| R03 | Iskalni niz se razdeli po belinah; vsaka neprazna beseda je dobesedni podnizi normaliziranega združenega polja. Prazen niz ne filtrira. | Preveri več besed v različnem zaporedju, ločila, prazen niz in besede, ki niso podnizi. |
| R04 | Stanje in odgovorna oseba se filtrirata skupaj z iskanjem po AND; stanje je omejeno na `all`, `todo`, `in_progress`, `done`, oseba pa na natančno primerjavo. | Za vse kombinacije preveri presek rezultatov in občutljivost na natančno ime. |
| R05 | Izbirnik oseb vsebuje `all` in vsako različno neprazno ime celotnega trenutnega projekta natanko enkrat, tudi če je zaradi drugih pogojev skrito. | Preveri izbiro oseb pri različnih iskalnih vrednostih, filtrih in preklopih projekta. |
| R06 | Preglednica in tabela kažeta iste ustrezne ID-je; preklop pogleda ohrani vse tri filtre; stolpci table vsebujejo samo ustrezna opravila svojega stanja. | V obeh pogledih primerjaj ID-je, stanja in filtre pred ter po preklopu. |
| R07 | Menjava projekta ponastavi iskanje in oba filtra pred uporabo podatkov novega projekta. | Preveri vrednosti kontrol in rezultate pred ter po menjavi projekta. |
| R08 | Osvežitev začne s privzetimi filtri; URL in trajna shramba brskalnika se ne uporabljata. | Osveži stran po spremembi filtrov in preveri neodvisno stanje shrambe ter URL. |
| R09 | Prikazano je `Prikazano: N od M.`, kjer je `M` velikost celotnega trenutnega projekta; pregled stanj in števci stolpcev štejejo prikazane rezultate. | Primerjaj sporočilo, števce pogledov in dejanske množice za več filtrov. |
| R10 | V nepraznem projektu brez ujema je prikazano `Ni zadetih.`; oba pogleda ostaneta uporabna. V praznem projektu velja običajno prazno stanje in `Prikazano: 0 od 0.` | Preveri oba pogoja in možnost odprave podrobnosti ali menjave filtrov v vsakem pogledu. |
| R11 | Gumb `Počisti filtre` v enem dejanju povrne vse tri kontrole na privzete vrednosti in prikaže vsa opravila brez spremembe vrstnega reda ali polj. | Spremeni vse filtre, počisti jih in primerjaj stanje, vrstni red ter polja opravil. |
| R12 | Obstoječa navigacija in bralne podrobnosti delujejo; nobeno dejanje filtriranja ne pošlje `POST`, `PATCH`, `PUT` ali `DELETE` na `/api/`; Folio in ozki prikaz sta ohranjena. | Uporabi obstoječe teste izhodišča, lastne teste P03 ter omrežne zahteve med vsemi dejanji filtriranja. |

## Uporabniški scenariji

1. Uporabnik naloži stran, vpiše več iskalnih besed z ločili in šumniki,
   izbere stanje ter osebo; tabela in preglednica prikazujeta enake ustrezne
   ID-je, števec pa pravilno šteje rezultate.
2. Uporabnik preklopi pogled in nato počisti filtre; vsa opravila se vrnejo v
   izvornem vrstnem redu, podrobnosti in navigacija pa ostanejo delujoči.
3. Uporabnik zamenja projekt; iskanje in oba filtra se ponastavita, izbirnik
   oseb pa vsebuje le osebe novega projekta.
4. Iskanje ali kombinacija filtrov ne najde nobenega opravila v nepraznem
   projektu; prikaz se sporočilo `Ni zadetih.`, obe pogleda pa ostadata uporabni.
5. Projekt je prazen; prikaz se običajno prazno stanje in števec
   `Prikazano: 0 od 0.`.

## Sprejemni pogoj in sledljivost

Funkcionalnost je sprejeta, če so izpolnjene vse zahteve R01–R12, skupni testi
izhodišča ostanejo uspešni, lastni testi P03 pokrijejo vsaj vsako zahtevo iz
tabelarnega pregleda, spremembe pa ne segajo izven dovoljenih poti. Vsak
rezultat testa se zapiše z imenom testa in virom zagona. Neizvedenih testov
ne navajamo kot opravljenih.

## Odprta vprašanja in omejitve

Ni odprtih vprašanj: vsa podrobnja pravila izhajajo iz izvirnih zahtev.
Specifikacija dodaja zgolj privzete predpostavke za nedoločene podrobnosti:
lokalno trenutno stanje filtrov, izvorni vrstni red in obstoječo izbiro pogleda.
Ne preverja zunanjih meritev ali scenarijev sočasnih sprememb podatkov, ker jih
izvirne zahteve izrecno ne zahtevajo.
