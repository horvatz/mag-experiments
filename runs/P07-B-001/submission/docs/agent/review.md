# Neodvisni pregled P07

Pregledovalec je primerjal izvirne R01–R12, predlogo, specifikacijo v1, končno kodo, razvojne in lastne teste ter implementation.md, verification.md in check.log. V prvi primerjavi ni konkretnih neskladij. Koda in specifikacija nista bili spreminjani.

| Zahteva | Neodvisno pregledani dokazi in sklep |
| --- | --- |
| R01 | FavoriteButton uporablja ID in aria-pressed; v App in TaskBoard je zunaj povezave. S01 za oba pogleda preverja enake naslove, poseben ID, Space, pravilen dialog in fokus; D01 preverja neodvisnost. Brez ugotovitve. |
| R02 | useFavorites.save zapisuje samo version:1 in [...Set].sort(), torej enkratne nize v vrstnem redu UTF-16. S02 preverja točen JSON, vključno z emoji in U+E000. Brez ugotovitve. |
| R03 | Parser ustvari Set brez odstranjevanja neznanih ID-jev; prikaz nastane samo iz API tasks. S02 preverja dvojnike, neznane in osvežitev. Brez ugotovitve. |
| R04 | Parser preveri objekt, verzijo, polje in vsak element; inicializacija ne zapisuje. Deset primerov S03 pokriva neveljavne oblike in odsotnost prepisovanja. Brez ugotovitve. |
| R05 | ProjectView začne s false in filtrira tasks brez razvrščanja; tabla dodatno filtrira po stanju. S04/S06 preverja 13 opravil in vrstni red, S06/S08 nič in eno. Brez ugotovitve. |
| R06 | Vidni seznam je izpeljan iz množice; prazno sporočilo in kontrole ostanejo. D02 in S04/S06 preverjata takojšnjo odstranitev in izklop praznega filtra. Brez ugotovitve. |
| R07 | App drži množico, ProjectView skupni filter obeh pogledov. taskUrl kodira ID; TaskDetails nalaga po istem ID-ju. S01 in S04/S06 pokrivata preklop in podrobnosti. Brez ugotovitve. |
| R08 | ProjectView ima key={project.id}; menjava projekta ponastavi filter, globalni hook ostane. S02 in S05 pokrivata osvežitev in dva projekta. Brez ugotovitve. |
| R09 | remove prejme tasks.map(id), ne vidnega seznama; briše le podano množico. Gumb temelji na favoriteCount celotnega projekta. S05 preverja tuje/neznane ID-je in disabled. Brez ugotovitve. |
| R10 | Status ima predpisano vlogo, ime in besedilo; X/M uporabljata celoten tasks. Stolpci štejejo vidne entries. S04/S06 in S06/S08 preverjata filtre in prazna stanja. Brez ugotovitve. |
| R11 | Listener preveri ključ, uporabi isti parser in samo setState. Branje/zapis sta v try/catch; napaka ne zavrže lokalne spremembe in App pokaže alert z besedo shramba. S07 preverja dogodke in tri vrste izjem. Brez ugotovitve. |
| R12 | Nova dejanja spreminjajo samo kopijo Set; ne kličejo updateTask in ne spreminjajo Task. Pregledani so API podatkovni tok, CSS, navigacija, testni readonly in regresijski rezultati. Brez ugotovitve. |

Specifikacija ima vse dele predloge, predikate P1–P5 in vseh dvanajst zahtev. Rezultate svoje faze pravilno označuje kot neizvedene, za končno sledljivost pa napoti na implementerjev dokument.

## Izvor rezultatov in omejitve

Implementerjev check.log izkazuje uspešen lint, preverjanje tipov, gradnjo in 67 testov (38 osnovnih, 8 razvojnih, 21 lastnih; 26,6 s). Pregledovalec je dnevnik in vsebino testov prebral, tega zagona pa ni izvedel sam. Brez konkretnega razloga celotnega preverjanja ne ponavlja. Začetni prekinjeni zagon je v verification.md jasno ločen od končnega uspešnega.

Skriti končni testi niso dostopni. Uporablja se samo lokalni izvoz; javni internet je blokiran. Za morebitno neposredno preverjanje brskalnika je dovoljen chromium.connect z wsEndpoint iz task/browser.json. Implementerjevi omejitvi Git/Python sta povzeti iz verification.md in nista neodvisno preverjeni.

## Neposredno preverjanje pregledovalca

Po shranitvi prve primerjave vseh R01–R12 je pregledovalec zagnal lokalni strežnik z `WEB_PORT=5193 API_PORT=3123 npm run dev` in izvedel omejen brskalniški scenarij z `node --input-type=module`, `chromium.connect(wsEndpoint)` ter dvema stranema istega novega konteksta pri 390 × 844. Razlog: S07 še ni preverjal dejanskega medzavihkovnega dogodka storage. Scenarij je končal z izhodom 0 in rezultatom PASS.

Neposredno potrjeno: klik priljubljenega v prvem zavihku uskladi drugi zavihek; veljaven zapis z dvojniki in neznanim ID-jem zamenja množico; aktiven filter in tabla se uskladita; števci stolpcev so 0/0/1; drug ključ ne spremeni prikaza; mešanica niza in null zavrne celoten zapis; removeItem povzroči prazno množico; prejemnik izvede nič povratnih setItem. Pri obeh pogledih velja scrollWidth <= innerWidth. Opazovanih zapisovalnih zahtev API ni bilo, projektna opravila pred scenarijem in po njem so globoko enaka.

Izpis neposrednega preverjanja:

```json
{"result":"PASS","realStorageBetweenTwoPages":true,"validReplacementDuplicatesUnknown":true,"invalidRecordEmpties":true,"nullEmpties":true,"unrelatedIgnored":true,"echoWrites":0,"boardCounts":true,"mobile390TableAndBoardFit":true,"apiWrites":0,"taskFieldsUnchanged":true}
```

Pregledovalec je sam vizualno pregledal predana desktop-table.png in mobile-board.png: postavitev, paleta, navigacija in nove kontrole sledijo dokumentu docs/dizajn.md. To sta implementerjeva posnetka, ne nova zajema pregledovalca.

## Končni sklep

Vseh R01–R12 je pregledanih. Konkretnih napak specifikacije ali implementacije ni bilo ugotovljenih; obe zastavici sprememb sta false in findings je prazen. Celotni npm run check in simulacije izjem shrambe niso bili ponovno zagnani; zanje je dokaz pregledani implementerjev dnevnik ter neodvisni pregled kode/testov. Neposredni dodatni scenarij je omejen na Chromium. Skriti testi niso dostopni. Končna strojno berljiva predaja je review.json.
