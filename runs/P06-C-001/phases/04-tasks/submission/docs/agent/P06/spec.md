# P06 — Nastavljiv izvoz CSV

Datum: 2026-09-22. Stanje: specifikacija pred implementacijo, različica 1.0.

Merilo so [izvirne zahteve](../../../task/instructions.md), [projektna pravila](../../../PROJECT_RULES.md), [ustava](../../../.specify/memory/constitution.md) in [potrjeni dizajn Folio](../../dizajn.md). Dokument izpolnjuje [skupno predlogo](../../../task/specification-template.md). Izpust v tem dokumentu ne razveljavi izvirne zahteve.

## Problem in kontekst

Uporabnik želi izvoziti opravila trenutnega projekta ter izbrati kolone, ločilo in status izvoženih vrstic. Obstoječi Folio bere projekte in opravila iz javnega API-ja, prikazuje preglednico, tablo, povzetek stanj in podrobnosti; izvoza CSV še nima. Dopolnitev omogoči prenos lokalno ustvarjene datoteke ob ohranitvi obstoječega prikaza, podatkov in navigacije.

Izhodišče je pregledano v `src/App.tsx` (`ProjectView`, `App`) in `shared/types.ts` (`Task`, `Project`). Spremembe infrastrukture, odvisnosti, strežnika, skupnih tipov ali skupnih testov niso del naloge. Procesni dokumenti so v `docs/agent/P06`.

## Vhodi, dejanja in izidi

Vhod je urejeno zaporedje opravil trenutnega projekta, prebrano iz obstoječega `/api/projects/<projectId>/tasks`, in projekt, izbran po `id`. Opravilo vsebuje nize `id`, `projectId`, `title`, `status`, `assignee`, `dueDate`, `description`; status je `todo`, `in_progress` ali `done`, datum je veljavni izvorni `YYYY-MM-DD`. Število opravil je poljubno, vključno z nič, enim in več kot desetimi. ID-ji so enkratni, naslovi se lahko ponavljajo; zaporedje in besedila se lahko razlikujejo od razvojnih podatkov. Besedila so navadno besedilo z Unicode znaki, ločili in prelomi vrstic. Vsako opravilo pripada svojemu projektu. Imena projektov oziroma njihovi ID-ji v obsegu vsebujejo črke, številke in vezaje.

Kontrole:

- Sedem checkboxov z dostopnim imenom `Stolpec <ime>` za vsako dovoljeno kolono.
- HTML select `Ločilo CSV` z vrednostma `;` in `,`.
- HTML select `Filter izvoza` z vrednostmi `all`, `todo`, `in_progress`, `done`.
- Gumb `Izvozi CSV`, omogočen samo ob vsaj eni izbrani koloni in vsaj eni ustrezni vrstici.

Uporabnik spreminja nastavitve, preklaplja Preglednica/Tabla, menja projekt, osveži stran in sproži ponovljive prenose. Uspešen izvoz prenese `folio-<projectId>.csv`; nastavitve in izvorni podatki ostanejo enaki. Onemogočeno dejanje ne sproži prenosa. Obstoječe nalaganje, prikaz napak in ponovni poskus ostanejo; brez naloženih opravil ni podatkov za izvoz. Poseben aplikacijski preklic ni zahtevan. Morebitna odpoved shranjevanja v brskalniku ne spremeni opravil ali nastavitev; aplikacija ne obljublja zaznave uspešnega zapisa na disk. Novo ravnanje za napake brskalnikovega prenosa ni predpisano.

## Zahteve in pravila

### Simboli in predikati

`P` je ID trenutnega projekta, `T` njegovo izvorno urejeno zaporedje opravil. `K = [id, projectId, title, status, assignee, dueDate, description]` je stalni vrstni red dovoljenih kolon. `C ⊆ K` je izbor kolon, `d ∈ {;, ,}` ločilo, `f ∈ {all, todo, in_progress, done}` filter in `v ∈ {table, board}` pogled. Zapis `C ⊆ K` obravnava elemente seznama K kot množico.

- Privzeto stanje `D = (C = vse K, d = ;, f = all)`.
- Izvozne kolone `H = [k ∈ K, kjer k ∈ C]`: izbor ne spreminja vrstnega reda K.
- Izvozne vrstice `E = [t ∈ T, kjer f = all ali t.status = f]`: stabilni filter ohranja izvorni vrstni red T.
- `canExport ⇔ |H| > 0 ∧ |E| > 0` za naložene podatke. Če predikat ne velja, ni prenosa.
- Nevtralizacija `N(s)`: če niz ustreza regularnemu izrazu `/^[ \t\r\n]*[=+\-@]/`, je rezultat apostrof, ki mu sledi celoten izvirni `s`; sicer rezultat ostane `s`. Samo presledek, tabulator, CR in LF štejejo za začetne znake tega pravila. Niz se ne obreže; apostrof je na indeksu 0.
- Navedba `Q(s)` je dvojni narekovaj + `s` z vsakim notranjim dvojnim narekovajem zamenjanim z dvema + dvojni narekovaj.
- Glava je `join(d, H.map(Q))`. Podatkovna vrstica za `t` je `join(d, H.map(k => Q(N(t[k]))))`. Nevtralizacija ne velja za glavo.
- Besedilo datoteke je `U+FEFF + glava + CRLF + concat(podatkovnaVrstica(t) + CRLF za t v E)`, kodirano UTF-8. Prvi trije bajti so `EF BB BF`. Tudi zadnja vrstica ima CRLF. Prelomi znotraj vrednosti se ohranijo in se ne pretvarjajo v druge prelome.

### Spremembe stanja

| Dejanje | Pravilo spremembe |
| --- | --- |
| Izbor ali odznačitev kolone k | Spremeni samo članstvo k v C; H se ponovno izpelje iz K. |
| Izbira ločila ali filtra | Spremeni samo d ali f; filter ne spreminja T, opravil v prikazu ali povzetka stanj. |
| Preklop Preglednica/Tabla | Spremeni samo v; C, d, f se ohranijo. Pri enakih P, T, C, d, f so izvoženi bajti enaki. |
| Menjava projekta, tudi vrnitev na prejšnjega | P postane novi ID, podatki sledijo obstoječemu nalaganju; nastavitve postanejo D. |
| Osvežitev strani | Nastavitve postanejo D; ni trajne shrambe nastavitev. |
| Izvoz | Če canExport, uporabi trenutne P, T, C, d, f in sproži prenos; sicer ne sproži prenosa. Podatki in nastavitve se ne spremenijo. |

Za vsako dejanje izvoza in njegovih kontrol velja invariant: vrednosti opravil in vrstni red izvornega T po dejanju so enaki kot pred njim, zapisovalnih zahtev na API ni. Pravila za preklop veljajo pri istih podatkih; nove sočasne spremembe brez osvežitve in navigacija med nedokončanim nalaganjem ne širijo obstoječih regresijskih zahtev.

### Sprejemni pogoji

| Zahteva | Pravilo oziroma sprejemni pogoj | Način preverjanja |
| --- | --- | --- |
| R01 | Izvoz vsebuje samo opravila P v vrstnem redu T; začetno stanje je D. | S01: preveri privzete kontrole, glavo, ID-je in vrstni red prenosa pri obeh projektih. |
| R02 | Dovoljene so točno kolone K; glava in vrednosti sledijo H ne glede na vrstni red klikov. | S02: odznači vse, izberi description pred id in primerjaj glavo ter pripadajoče vrednosti. |
| R03 | Pri praznem C je gumb onemogočen in ni prenosa; ponovni izbor ga omogoči natanko ob nepraznem E. | S02, S03: kombinacije praznega/nepraznega izbora in rezultata. |
| R04 | all/todo/in_progress/done filtrira samo E; prikaz še vsebuje celoten projekt. Prazen T ali E onemogoči izvoz. | S03: vsi filtri, oba pogleda, prazna projekta in manjkajoč status; primerjava vidnih ID-jev in povzetka. |
| R05 | Prenos ima ime folio-P.csv, UTF-8 BOM na začetku; ne odpre nove strani in ne pošlje vsebine na strežnik. | S01, S06: ime, surovi bajti BOM, ista stran in nadzor omrežnih zahtev. |
| R06 | Obe ločili delujeta; vsaka glava in vrednost je navedena s Q, vsak notranji narekovaj je podvojen. | S04: natančna primerjava bajtov za obe ločili, prazne vrednosti in notranje narekovaje. |
| R07 | Med vrsticami in za zadnjo vrstico je CRLF; ločila in notranji CR, LF ali CRLF se ohranijo znotraj navedene vrednosti. | S04: pričakovani surovi bajti, tudi večvrstični opisi z obema ločiloma. |
| R08 | N se uporabi pred Q pri vseh podatkovnih kolonah, nikoli pri glavi; vsi ostali nizi ostanejo nespremenjeni. | S04: vsi štirje sprožilci, kombinacije dovoljenih začetnih znakov, apostrof na indeksu 0 ter negativni primeri; vse kolone v okviru dovoljene domene. |
| R09 | Šumniki, Unicode, presledki in opisi ostanejo ohranjeni razen N; status ostane interna vrednost, datum izvirni YYYY-MM-DD. | S04: primerjava bajtov Unicode, robnih presledkov, internih statusov in različnih veljavnih datumov. |
| R10 | Preklop pogleda ohrani C, d in f; pri istih podatkih ustvari enake bajte. | S05: nastavi podmnožico, vejico in status, izvozi v obeh pogledih ter primerjaj datoteki. |
| R11 | Menjava projekta in osvežitev ponastavita D; vsak zaporedni izvoz odraža trenutne nastavitve. | S05: sprememba nastavitev med prenosi, menjava in vrnitev projekta, osvežitev. |
| R12 | Ni mutacij podatkov ali zapisov na API; obstoječe bralne funkcije, dizajn in prilagodljivost ostanejo. | S06, S07: primerjava podatkov pred/po, nadzor omrežja, skupne regresije in mobilni prikaz. |

## Uporabniški scenariji in merilo uspeha

Scenariji so načrt preverjanja, ne trditev o opravljenih testih:

- **S01 — Privzeti izvoz:** uporabnik odpre projekt in izvozi brez sprememb; preveri se celotna datoteka, ime, BOM ter pripadnost in vrstni red opravil. Podatkovni primeri zajamejo en element, več kot deset elementov, drugačne ID-je in enake naslove.
- **S02 — Izbor kolon:** uporabnik odznači vse kolone in jih ponovno izbira v drugačnem vrstnem redu; preveri se dovoljenost prenosa ter vrstni red glave in podatkov.
- **S03 — Filter in praznine:** uporabnik izbere vsak filter, vključno s filtrom brez zadetkov; preveri se prenos in nespremenjen celoten prikaz. Oba projekta sta lahko prazna.
- **S04 — Točni bajti CSV:** podatki vsebujejo narekovaje, oba separatorja, CR/LF/CRLF, Unicode, robne presledke, formule in nize brez formul. Pri obeh ločilih se preverijo navedba, N, ohranjena vsebina in zadnji CRLF. Pravilo N zajema vse kolone, vendar integracijski podatki spoštujejo domeno ID-jev, statusov in datumov.
- **S05 — Življenjski cikel nastavitev:** isti projekt v obeh pogledih vrne iste bajte, sprememba nastavitev vpliva na naslednji prenos, menjava projekta in osvežitev povrneta D.
- **S06 — Brez stranskih učinkov:** izvozne kontrole ne spreminjajo izvornega polja ali opravil, ne pošiljajo zapisov, ne odpirajo nove strani in ne uporabljajo testnih kontrol. Obstoječa navigacija, prikazi, podrobnosti in branje API-ja se preverijo tudi s skupnimi testi.
- **S07 — Dostopnost in Folio:** dostopna imena kontrol ustrezajo dogovoru; ohranjeni so `data-task-id` na vrsticah in karticah, obstoječa imena pogledov/stolpcev ter `aria-label="Pregled stanj opravil"`. Morebitna nova dejanja ob opravilu so zunaj povezave. Pri 390 pikah se stran ne razširi; notranje drsenje je dovoljeno. Ohranijo se potrjeni gradniki, barve, odzivna navigacija in viden fokus.

Uspeh pomeni izpolnjene vse R01–R12 in dogovor o vmesniku, potrjene z dejanskimi preverjanji iz opisane domene ter brez regresij obstoječega delovanja. Razvojni primeri so del dokazov in ne omejujejo splošnih pravil.

## Izvedba in sledljivost

Pogoji se sklicujejo na zgornjo tabelo in formalna pravila. Koda in dokazi se dopolnijo po implementaciji; začetno stanje spodaj ne pomeni uspeha.

| Zahteva | Pogoj | Test ali scenarij | Datoteka in del kode | Izid ter dokaz |
| --- | --- | --- | --- | --- |
| R01 | R01, D, E | S01 | Še ni implementirano | Ni izvedeno. |
| R02 | R02, K, H | S02 | Še ni implementirano | Ni izvedeno. |
| R03 | R03, canExport | S02, S03 | Še ni implementirano | Ni izvedeno. |
| R04 | R04, E | S03 | Še ni implementirano | Ni izvedeno. |
| R05 | R05, datoteka | S01, S06 | Še ni implementirano | Ni izvedeno. |
| R06 | R06, Q | S04 | Še ni implementirano | Ni izvedeno. |
| R07 | R07, CRLF | S04 | Še ni implementirano | Ni izvedeno. |
| R08 | R08, N | S04 | Še ni implementirano | Ni izvedeno. |
| R09 | R09, ohranitev nizov | S04 | Še ni implementirano | Ni izvedeno. |
| R10 | R10, preklop v | S05 | Še ni implementirano | Ni izvedeno. |
| R11 | R11, ponastavitev D | S05 | Še ni implementirano | Ni izvedeno. |
| R12 | R12, invariant | S06, S07 | Še ni implementirano | Ni izvedeno. |

## Odprta vprašanja in omejitve

Bistvenih odprtih vprašanj po izvirnih navodilih ni. Razporeditev kontrol in nepredpisano besedilo se prilagodita obstoječemu Foliu; novih funkcionalnih zahtev to ne uvaja. Podatki se ne shranjujejo v lokalno nadomestilo strežnika. Testni program lahko uporablja priložene nadzorovane GET odgovore, aplikacija samo javni `/api/`.

V tem koraku ni implementacije ali izvedenih funkcionalnih testov. Končni skriti testi niso dostopni in ne bodo navedeni kot opravljeni. Omejitve po preverjanju bodo zapisane ob dokazih; ni dodanih zunanjih meritev ali novih obveznosti infrastrukture.

## Zgodovina sprememb

- 2026-09-22, 1.0: začetna specifikacija po izvirnih R01–R12, skupni predlogi in lokalnem pregledu izhodišča; sledljivost pripravljena za dejanske rezultate naslednjih korakov.
