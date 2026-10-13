# Specifikacija P03: Iskanje in sestavljeni filtri

Podobna dokumentacija: [task/instructions.md](task/instructions.md), [task/specification-template.md](task/specification-template.md)

## Problem in kontekst

Uporabniki želijo bolje najti in filtrirati opravila v Folio projektu. Trenutni vmesnik prikaže vse opravila projekta brez možnosti iskanja ali filtriranja. Pri vecjih projektih bi bile te funkcije kljudne za produktivnost.

Dodajamo:
- Iskalni vnos za preverjanje vsebine opravil (title, description, assignee)
- Filter stanja (all, todo, in_progress, done)
- Filter odgovorne osebe (all ali izbiri seznam imen)
- Gumb za brisanje vseh filtrov

Funkcionalnost ne vpliva na obstojeci pogled (seznam/table) ali podrobnosti opravil. Filtri delujejo na podlagi READ-only/API-citanje.

## Vhodi, dejanja in izidi

| Polje | Vrsta | Opis |
| --- | --- | --- |
| `searchQuery` | vnos | Iskalni vnos (razdeli po belinah, podprta je Unicode normalizacija). |
| `statusFilter` | izbirni seznam | Vrednost: `all`, `todo`, `in_progress` ali `done`. |
| `assigneeFilter` | izbirni seznam | Vrednost: `all` ali ime iz projekta. |
| `clearFilters` | klik | Brisanje vseh filtrov in ponovni prikaz vseh opravil. |
| **Izis:** filtrirani nabor opravil, stevilo prikazanih (N), skupno (M), sporoce "Ni zadetkov", ce rezultat nima. |

## Pravila spremembe stanja

1. **Privzeta stanje**: Iskalni vnos in oba filtra sta prazni (oziroma nastavljena na vse); prikazana so vsa opravila v izvornem vrstnem redu.
2. **Iskanje**: Pregleduje zdruzene id, title, description in assignee. Obe strani pretvori z Unicode NFD, odstrani kombinacijska znamenja U+0300-U+036F in pretvori v male crke; zato c in c ter velikost crk ne razlikujeta zadetkov.
3. **Brez iskanje**: Iskalni vnos se razdeli po belinah v neprazne besede; opravilo ustreza, ce so vse besede dobesedni podnizi zdruzenih polj. Vrstni red besed ni pomemben, locila niso regularni izrazi.ozen vnos ne omejuje.
4. **Filter**: Filter stanja in filter odgovorne osebe delujeta skupaj z iskanjem po logicnem IN. Stanje ima vrednosti all, todo, in_progress, done; odgovorna oseba se primerja natančno, brez normalizacije.
5. **Osobe**: Izbirnik oseb vsebuje moznost all in vsako razlicno neprazno ime iz celotnega trenutnega projekta natanko enkrat.
6. **Prikaz**: Preglednica in tabla kazeta iste ustrezne ID-je; preklop pogleda ohrani vse filtre.
7. **Projekt**: Menjava projekta ponastavi iskanje in oba filtra. Filtri se nikoli ne uporabijo na podatkih drugega projekta.
8. **Osvežitev**: Osvežitev stran začne s privzetimi filtri. Filtri se ne shranjujejo v URL ali trajno shrambo brskalnika.
9. **Sterec**: Stevilo rezultatov je "Prikazano: N od M", kjer je M velivost celotnega trenutnega projekta. Pregled stanj in stevec stolpcev stejejo prikazane rezultate.
10. **Ni zadetkov**: Ce v nepraznem projektu nobeno opravilo ne ustreza, je prikazano sporoce "Ni zadetkov." in oba pogleda ostaneta uporabna. Prazen projekt ohrani obicajno prazno stanje in stevec 0 od 0.
11. **Ujednodelno dejanje**: Pocisti filtre v enem dejanju vrne vse tri kontrole na privzete vrednosti in prikaze vsa opravila. Uporaba filtrov ne spremeni izvornega vrstnega reda ali polj podatkov.
12. **Navigacija**: Obstojeca navigacija in bralne podrobnosti delujejo. Nobeno dejanje filtriranja ne poslje POST/PATCH/PUT/DELETE na /api/. Ohranjen je Folio in prikaz pri ozki sirini.

## Zahteve in pravila

| Zahteva | Pravilo oziroma sprejemni pogoj | Sinon preverjanja |
| --- | --- | --- |
| R01 | Ob nalaganju so iskalni vnos in filtri prazni oziroma nastavljeni na vse; prikazana so vsa opravila trenutnega projekta v izvornem vrstnem redu. | Prenos brez filtrov; kontrola privzete vrednosti. |
| R02 | Iskanje pregleduje združene id, title, description in assignee. Obe strani pretvori z Unicode NFD, odstrani kombinacijska znamenja U+0300-U+036F in pretvori v male črke; zato crka č in c ter velikost črk ne razlikujeta zadetkov. | Iskanje z unicode znaki; preverjanje nima razlikovanja č/c in velikosti. |
| R03 | Iskalni vnos razdeli po belinah v neprazne besede; opravilo ustreza, če so vse besede dobesedni podnizi združenih polj. Vrstni red besed ni pomemben, ločila niso regularni izrazi. Prazen vnos ne omejuje. | Iskanje po več besedah; preverjanje vrstne vrsti besed. |
| R04 | Filter stanja in filter odgovorne osebe delujeta skupaj z iskanjem po logičnem IN. Stanje ima vrednosti all, todo, in_progress, done; odgovorna oseba se primerja natančno, brez normalizacije. | Kombiniranje iskanja in filtriranja; preverjanje IN logike. |
| R05 | Izbirnik oseb vsebuje možnost all in vsako različno neprazno ime iz celotnega trenutnega projekta natanko enkrat, tudi če je trenutno skrito zaradi drugih pogojev. Preklop projekta ne ohrani stare osebe. | Preverjanje celotnega seznama oseb; preverjanje preklopa projekta. |
| R06 | Preglednica in tabla kažeta iste ustrezne ID-je; preklop pogleda ohrani vse filtre. Stolpci tabel vsebujejo samo ustrezna opravila svojega stanja. | Preklop pogleda; preverjanje konsistence filtrov. |
| R07 | Menjava projekta ponastavi iskanje in oba filtra. Filtri se nikoli ne uporabijo na podatkih drugega projekta. | Preklop projekta; preverjanje ponastavitve filtrov. |
| R08 | Osvežitev strani začne s privzetimi filtri. Filtri se ne shranjujejo v URL ali trajno shrambo brskalnika. | Prenos; preverjanje odsotnosti filtrov v URL. |
| R09 | Število rezultatov je ""Prikazano: N od M"", kjer je M velikost celotnega trenutnega projekta. Pregled stanj in števec stolpcev štejejo prikazane rezultate. | Prenos; preverjanje števcov. |
| R10 | Če v nepraznem projektu nobeno opravilo ne ustreza, je prikazano sporočilo ""Ni zadetkov."" in oba pogleda ostaneta uporabna. Prazen projekt ohrani običajno prazno stanje in števec 0 od 0. | Iskanje brez zadetkov; preverjanje sporočila. |
| R11 | Počisti filtre v enem dejanju vrne vse tri kontrole na privzete vrednosti in prikaže vsa opravila. Uporaba filtrov ne spremeni izvornega vrstnega reda ali polj podatkov. | Klik gumba; preverjanje ponastavitve. |
| R12 | Obstoječa navigacija in bralne podrobnosti delujejo. Nobeno dejanje filtriranja ne pošlje POST/PATCH/PUT/DELETE na /api/. Ohranjen je Folio in prikaz pri ozki širini. | Preverjanje HTTP metod; preverjanje ozke širine. |

## Odprta vprašanja in omejitve

- Implementacija filtra oseb še ni preverjena v obstoječih testih (tests/agent/)
- Natančni URI-ji za API začetno še ni določen (preslikava do /api/projects/*/tasks)
- Styling za novo izbrani vmesnik še ni dodan v src/styles.css

**Omejitve**:
- Ne ustvarjamo zapisovalnih zmožnosti; le preberemo iz obstoječega API-ja
- Ne dodajamo novih URL-jev ali API endpoint-ov
- Vrhovni navigacijski elementi ostajajo nespremenjeni

## Izvedba in sledljivost

| Zahteva | Pogoj | Test ali scenarij | Datoteka in del kode | Izid ter dokaz |
| --- | --- | --- | --- | --- |
| R01 | Privzeta stanja | Test: prenosi stran brez filtrov | src/App.tsx: dodaja iskanje in filtri | Prenos prikaže vsa opravila brez omejitev. |
| R02 | Unicode NFD in pretvorba v male črke | Test: iskanje z "č" najde "Č" in "č" | src/components/SearchFilter.tsx | Izid vključuje pravilno pretvorbo, podvrti se z NFD. |
| R03 | Iskanje po več besedah | Test: iskanje "Ana Novak" najde opravila z tem besedama | src/components/SearchFilter.tsx | Vse besede so podnizi združenih polj. |
| R04 | Logicni IN za filtre | Test: kombinirano iskanje + status + oseba | src/components/SearchFilter.tsx | Prvo opravilo ustreza vsem pogojem. |
| R05 | Seznam oseb v izbirniku | Test: vsa imena iz projekta so na voljo | tests/agent/P03.spec.ts | Seznam vsebuje all in vsa imena natanko enkrat. |
| R06 | Preglednica in tabla ohranjata filtre | Test: preklop pogleda ohranja stanje filtrov | src/components/ViewSwitch.tsx | Preklop ne spremeni filtrov. |
| R07 | Ponastavitev filtra po prehodu na projekt | Test: prehod na projekt vrnih privzete vrednosti | src/App.tsx: ruter navigacije | Filtri so prazni po prehodu. |
| R08 | Filtri se ne shranijo v URL | Test: prenosi stran brez filtrov v adresi | src/components/SearchFilter.tsx | URL brez parametrjev filtrov. |
| R09 | Prava številčkanje | Test: preverjaštevci "Prikazano: N od M" | tests/agent/P03.spec.ts | Števci natančno ustrezajo. |
| R10 | Sporočilo "Ni zadetkov" | Test: iskanje brez rezultatov | tests/agent/P03.spec.ts | Prikazano "Ni zadetkov." |
| R11 | Cisčenje filtrov v enem dejanju | Test: klika gumb ocisti vse | tests/agent/P03.spec.ts | Vrne privzete vrednosti. |
| R12 | HTTP GET le, ni POST/PATCH/PUT/DELETE | Test: preverja HTTP metode zahtev | tests/agent/P03.spec.ts | Samo GET zahteve do /api/. |

## Povezave na dokumente Spec Kit

- Skupna predloga: [task/specification-template.md](task/specification-template.md)
- Navodila funkcionalnosti: [task/instructions.md](task/instructions.md)
- Projektna načela: [.specify/memory/constitution.md](.specify/memory/constitution.md)
