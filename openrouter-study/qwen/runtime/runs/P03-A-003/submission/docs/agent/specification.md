# Izvorna razvozna specifikacija: Iskanje in sestavljeni filtri

Lastnik: pilot P03
Datum: 2026-11-01

## Problem in kontekst

**Cilj:** Dopolniti obstoječi Folio uporabniški vmesnik z funkcijami iskanja in filtriranja opravil na ravni projekta.

**Začetno delovanje:** Uporabnik izbira projekt in vidi opravila v preglednici ali tabli brez kakršnih koli filtrov. Vsi podatki se prikazujejo v izvornem vrstnem redu vračila API-ja.

**Predvidena sprememba:** Dodati uporabniški vmesnik z iskalnim vnosom, izbiralnikoma za filter stanja in filter odgovorne osebe, gumb za čiščenje filtrov. Filtri bodo uporabili logični IN za omejitve prikaza opravil.

## Vhodi, dejanja in izidi

**Podatkovni vhodi:**
- searchInput (string): Iskalni vnos, deljen po belinah v besede.
- statusFilter (string): Vrednost all, todo, in_progress ali done.
- assigneeFilter (string): Vrednost all ali točno ime odgovorne osebe.
- projectId (string): Identifikator trenutnega projekta.

**Dovoljena dejanja:**
- Vnos ali brisanje v iskalnem polju (tekstuaren input, type=search).
- Izbor vrednosti iz select elementov (kombobox).
- Klik na gumb "Počisti filtre" (<button role="status">).
- Preklop med pogledi "Preglednica" in "Tabla" (ne spremeni filtrov).
- Premik med projekti v navigaciji (ponastavi vsa filtra).

**Pričakovano stanje:**
- Ustrezna opravila se izdajo v obeh pogledih preglednica in tabla.
- Indikator "Prikazano: X od Y" prikazuje število filtriranih (X) in celotnih (Y) opravil trenutnega projekta.
- Če nobeno opravilo ne ustreza, se prikaže sporočilo "Ni zadetkov.".

## Zahteve in pravila

| Zahteva | Pravilo oziroma sprejemni pogoj | Način preverjanja |
| --- | --- | --- |
| R01 | Privzeto iskanje in filtra sta prazni; prikažejo se vsa opravila trenutnega projekta v izvornem vrstnem redu API-ja. | 1. Odpreti stran projekta brez vnosov. 2. Preveriti odsotnost POST ali PATCH zahtev na /api/tasks. 3. Preveriti prisotnost vseh opravil na strani. |
| R02 | Iskanje normalizira naslov, opis in ime odgovorne osebe: Unicode NFD → odstranitev kombinacijskih znakov U+0300–U+036F → male črke. | çaŠ in ca ujameta enake zadetke; test z različicami č/c in velikosti. |
| R03 | Iskalni vnos se razdeli na neprazne besede; vse morajo biti podnizi združenih polj (title + description + assignee). Vrstni red besed ni pomemben. | Iskanje "ana" ujame opravila z Ana Novak in "ana" v naslovu; iskanje "novak an" ujame enake opravila. |
| R04 | Filter stanja in odgovorne osebe delujeta skupaj z iskanjem po logičnem IN. Za privzeto vrednost filtra se predpostavi "vsi/neskrito". | Filter "done" + "Ana Novak" ujame le opravila v stanju done in z odgovorjo Ano Novak. |
| R05 | Izborica vsebuje all in natanko enkrat vsako različno neprazno ime odgovorne osebe iz trenutnega projekta, tudi če so trenutno skrite zaradi drugih pogojev. | Preveriti izbiro "all", nato izbrati vsako ime; preveriti odsotnost ponovitev imen. |
| R06 | Preglednica in tabla prikazujeta iste ustrezne ID-je; preklop pogleda ohrani filtre. Stolpci tabe vsebujejo samo opravila odgovarjajočega stanja. | Izbira filtra, preveritev preglednice; klik na "Tabla", preveritev enakih ID-jev. |
| R07 | Preklop projekta ponastavi iskanje in oba filtra na privzete vrednosti; filtra se ne nanašata na podatke drugega projekta. | Preklop iz "web" v "launch": iskalno polje in štiri zahtevji se očistita. |
| R08 | Osvežišitev strani začne s privzetimi filtri; filtra se ne shranjujeta v URL ali trajno shrambo. | Odprtje po osvežitvi: filtra sta prazna; URL ne vsebuje filtra parametra. |
| R09 | Indikator "Prikazano: N od M" prikaže pravilno. Pregled stanj in stolpci v tabli sumirajo pravilne podskupine prikazanih rezultatov. | Šteje ravno vsa opravila v preglednici, stolpci tabe pravilno vrsto števce. |
| R10 | če nobeno opravilo ne ustreza v nepraznem projektu, se prikaže "Ni zadetkov.". Obe pogledi sta uporabna. Prazen projekt ohrani običajno prazno stanje. | Iskanje z neobstoječim vnosom: "Ni zadetkov." vidno; kliki na pogleda preusmerita na prazne kontejnerje. |
| R11 | Gumb "Počisti filtre" vrne iskanje, filter stanja in filter odgovorne osebe na privzete vrednosti in prikaže vsa opravila. | Klik na "Počisti filtre": vsi trije kontrole se ponastavijo; vsa opravila so vidna. |
| R12 | Obstojča navigacija in bralne podrobnosti delujeta. API opravlja samo GET. Ohranjen Folio branding in ozka podoba. | Bralna podrobnost je prisotna; preverjanje POST naslovov za zahteve za /api/tasks/. |

## Izvedba in sledljivost

| Zahteva | Pogoj | Test ali scenarij | Datoteka in del kode | Izid ter dokaz |
| --- | --- | --- | --- | --- |
| R01 | Privzeto iskanje in filtra sta prazni; vsa opravila so prikazana | D01 | src/features/filter.tsx, src/App.tsx | Iskanje filtrira na prazen vnos; vsa opravila so vidna |
| R02 | Iskanje normalizira s Unicode NFD, odstraniji kombinacijskih znakov in pretvori v male črke | Začetno testno okolje, D01 | src/features/filter.tsx | črke č in C se ujemajo z c in C (malo/veliko črke ne ujemajo) |
| R03 | Iskanje razdeli po belinah in izvede iskanje vsake besede kot podniza | D01, D02 | src/features/filter.tsx | Iskanje "ana" ujame Ana Novak; "novak an" ujame enake |
| R04 | Filter stanja in odgovorne osebe delujeta skupaj (IN) z iskanjem | D02 | src/features/filter.tsx | Filtri so oblikovani skupaj; prikaže se le resnično ustrezna opravila |
| R05 | Izborica vsebuje "all" in vsako ime natanko enkrat | D02 | src/features/filter.tsx | Izbirnik prikaše "all" in vsako ime; brez ponovitev |
| R06 | Preglednica in tabla prikazujeta enaka ID-je; tabla razdeli po stanjih | D02 | src/features/filter.tsx | Preglednica in tabla imata iste ID-je; stolpci so pravilni |
| R07 | Preklop projekta ponastavi filtre | D03 | src/App.tsx, src/features/filter.tsx | Preklop na drugi projekt očisti filtre; nastavi na default |
| R08 | Osvežišitev začne s privzetimi filtri; filtra se ne shranjujeta | R08 | src/features/filter.tsx | Odpiranje po osvežitvi začne s privzetimi filtri; URL ne vsebuje filtra |
| R09 | Števil "Prikazano: N od M" sovpadajo | D04 | src/features/filter.tsx | Indikator kaže natavno pravilo vsa |
| R10 | "Ni zadetkov." se prikaže pri praznem rezultatu v nepraznem projektu | D03 | src/features/filter.tsx | Iskanje z neobstoječim vnosom vidi "Ni zadetkov." |
| R11 | Gumb "Počisti filtre" očisti vse kontrole | D03 | src/features/filter.tsx | Klik na "Počisti filtre" vrne vse kontrole na privzete |
| R12 | Bralni podrobnosti, API zahtevji in styling ohranjeni | D04 | src/App.tsx, src/components.tsx | Bralne podrobnosti delujejo; API zahtevji so samo GET |

## Odprta vprašanja in omejitve

**Ključn implementacijski odločitvi:**
1. Iskanje bo normaliziralo vse polje (title, description, assignee) v eni funkciji normalizeSearchTerm().
2. Filter odgovorne osebe bo za all vrnitev funkcijo, ki vrne vse različne odgovorne osebe.
3. Izbirka bo dinamično generirana iz rezultatov API-ja, ker API vrača samo podatke za trenutni projekt, vendar so imena lahko drugačna v drugih projektih.
4. Filtri bo izračunanih v memi FilteredTask[] na osnovi trenutnih podatkov, ne bomo uporabili oddaljene filtracije.
5. Omejen časovni okvir (20 minut): prikažni testi morda ne zajemajo vseh robnih primerov (na primer meje števila rezultatov, prazni projekti).

**Omejitve okolja:**
- Brez Git zgodovine (svež izvoz).
- Testi ne morejo preveriti vseh kombinacij filtrov v enem skoku.
- Ne moremo testirati realnega API-ja brez steka strežerka (uporabljamo __test/ kontrole).

**Nepreverjene robne primere:**
- Enako ime odgovorne osebe v različnih projektih (ne pomembno, saj se izbor odraža samo v projekt).
- Prazni opis ali naslov (tako je predvideno).
- Pričakujemo, da je API za vraĎil rezultatov stabilen in vrnene vse podatke.
