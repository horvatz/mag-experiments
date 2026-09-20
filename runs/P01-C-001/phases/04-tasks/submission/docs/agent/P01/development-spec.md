# P01 — skupna razvojna specifikacija

## Problem in kontekst

Folio že prikazuje projekte, preglednico, tablo, števce in podrobnosti opravila.
V podrobnostih ni urejanja. Cilj je urejanje samo naslova in stanja z možnostjo
shranjevanja ali preklica. Uporabniški scenariji in merila so v [spec.md](spec.md).
Merilo ostajajo [izvirna navodila](../../../task/instructions.md).

## Vhodi, dejanja in izidi

Naj bo D preslikava identifikatorjev v shranjena opravila, i izbrani identifikator,
d = (naslov, stanje) začasni vnos, q faza (ogled, urejanje, čakanje), e napaka.
S = {todo, in_progress, done}. Funkcija N odstrani maksimalni začetni in končni
niz znakov iz W = {U+0020, U+0009, U+000A, U+000D}; vse drugo ohrani.
Veljaven(d) pomeni N(d.naslov) ≠ prazen niz in d.stanje ∈ S.
Vsi prikazi in števci so projekcije D; števec stanja s je število opravil trenutnega
projekta s stanjem s. D′ označuje stanje po dejanju; n število čakajočih shranjevanj.

- Odpri(i): q′ = urejanje, d′ = (D[i].naslov, D[i].stanje), e′ = prazno, D′ = D.
- Spremeni(d): v urejanju se spremeni le d; D′ = D. Veljaven popravek naslova
  odstrani napako naslova.
- Shrani z neveljavnim naslovom: q′ = urejanje, D′ = D, n′ = 0, vidna napaka polja.
- Shrani z veljavnim d: q′ = čakanje, n′ = 1, D′ = D do odgovora; poslani naslov
  je N(d.naslov). V čakanju dodatni pritiski ne povečajo n.
- Uspeh: D′[i] je D[i] z naslovom N(d.naslov) in stanjem d.stanje, skupaj;
  za vsak j ≠ i velja D′[j] = D[j]. Ostala polja D[i] ostanejo ista.
  q′ = ogled, e′ = prazno, n′ = 0; prikazi izhajajo iz D′, enako po osvežitvi.
- Zavrnitev: D′ = D, d′ = d, q′ = urejanje, n′ = 0; vidna napaka shranjevanja.
- Prekliči v urejanju: D′ = D, q′ = ogled; osnutek in napake so zavrženi,
  število novih shranjevanj je 0.

To so splošna pravila, ne omejitve na konkretne podatke. Predpostavke so v spec.md.

Obvezni dogovor iz navodil: besedilno polje »Naslov«, HTML `select` »Stanje«;
gumbi »Uredi«, »Shrani«, »Prekliči«. Napaka vnosa je povezana z `aria-describedby`,
ob napaki ima polje `aria-invalid="true"`; napake imajo `role="alert"`, čakanje
`role="status"`. Ohranijo se `data-task-id` na vrsticah in karticah, poimenovani
stolpci in `aria-label="Pregled stanj opravil"`. Uporablja se javni `/api/`;
`/__test/` uporablja samo testni program. Brez lokalnega nadomestka podatkov.

## Zahteve in pravila

| Zahteva | Pravilo oziroma sprejemni pogoj | Način preverjanja |
| --- | --- | --- |
| R01 | Odpri(i) prenese shranjeni vrednosti po identifikatorju. | S01, tudi enaki naslovi. |
| R02 | D in njegove projekcije do uspeha ostanejo iste. | S02, primerjava pred urejanjem in med njim. |
| R03 | N odstrani samo W na robovih; prazen rezultat prepove zapis. | S03a/b: prazen, mešan W, notranji presledki, U+00A0. |
| R04 | Dovoljeni so vsi pari iz S × S. | S04: šest različnih prehodov in ohranitev stanja. |
| R05 | Uspeh skupaj zapiše dve polji; prikazi izhajajo iz D′. | S05: pogledi, stolpec, števci, osvežitev. |
| R06 | Prekliči ne zapiše; novo odprtje ne vsebuje osnutka ali napak. | S06: preklic sprememb in napake, ponovno odprtje. |
| R07 | Za j ≠ i D′[j] = D[j]; druga polja D[i] so ista. | S07: primerjava vseh opravil, dvojniki in drugi projekt. |
| R08 | Zavrnitev ohrani D in d; ponovitev lahko uspe. | S08a/b: zavrnitev, ohranjen vnos, ponovni uspeh. |
| R09 | V čakanju n ≤ 1, štiri kontrole so onemogočene. | S09: zakasnitev, hitri pritiski, zavrnitev in odklep. |
| R10 | Po zaključku deluje navigacija in nov osnutek izhaja iz D. | S10: projekt, oba pogleda, drugo opravilo. |

## Izvedba in sledljivost

| Zahteva | Pogoj | Test ali scenarij | Datoteka in del kode | Izid ter dokaz |
| --- | --- | --- | --- | --- |
| R01 | Odpri(i) | S01 | Določi faza načrta/izvedbe. | Ni izvedeno. |
| R02 | Nespremenjen D pred uspehom | S02 | Določi faza načrta/izvedbe. | Ni izvedeno. |
| R03 | N in veljavnost | S03a/b | Določi faza načrta/izvedbe. | Ni izvedeno. |
| R04 | S × S | S04 | Določi faza načrta/izvedbe. | Ni izvedeno. |
| R05 | Skupni zapis, usklajeni prikazi | S05 | Določi faza načrta/izvedbe. | Ni izvedeno. |
| R06 | Preklic in ponovna inicializacija | S06 | Določi faza načrta/izvedbe. | Ni izvedeno. |
| R07 | Izolacija po i in poljih | S07 | Določi faza načrta/izvedbe. | Ni izvedeno. |
| R08 | Zavrnitev in ponovitev | S08a/b | Določi faza načrta/izvedbe. | Ni izvedeno. |
| R09 | Ena zahteva in onemogočene kontrole | S09 | Določi faza načrta/izvedbe. | Ni izvedeno. |
| R10 | Navigacija in čist osnutek | S10 | Določi faza načrta/izvedbe. | Ni izvedeno. |

Po izvedbi je treba navesti dejanska imena testov, datoteke kode in dnevnik rezultatov.
Scenariji tu so sprejemni pogoji, ne trditev o opravljenih aplikacijskih preverjanjih.

## Odprta vprašanja in omejitve

Bistvenih nejasnosti ni; vsa pojasnila izhajajo iz navodil 0.2. Izključitve so v
spec.md. Vsi aplikacijski scenariji so še nepreverjeni. Potrjeni Folio ostane obvezen;
spremembe infrastrukture, odvisnosti ali skupnih testov niso dovoljene.

Zgodovina: 2026-09-20, različica specifikacije 1 — začetni zapis R01–R10, pravil
prehodov in sledljivosti v koraku speckit-specify; brez implementacije.
