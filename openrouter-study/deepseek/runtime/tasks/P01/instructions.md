# P01: Urejanje opravila

Različica navodil: 0.2, izhodišče za preverjanje reference. Ista navodila prejmejo vsi trije postopki.

## Naloga

V pripravljeni aplikaciji omogoči urejanje naslova in stanja obstoječega
opravila. Uporabnik v podrobnostih izbere »Uredi«, spremeni podatke in se
odloči za »Shrani« ali »Prekliči«. Uporabi obstoječe gradnike in podatkovni
vmesnik. Opis, odgovorna oseba, rok ter pripadnost projektu se pri tej nalogi
ne urejajo. Postavitev naj sledi pripravljenemu videzu aplikacije.

## Zahteve

| ID | Pričakovano delovanje |
| --- | --- |
| R01 | »Uredi« odpre obrazec za trenutno izbrano opravilo. Naslov in stanje sta izpolnjena z njegovimi shranjenimi vrednostmi. Opravila razlikuj po identifikatorju, tudi ko imajo enak naslov. |
| R02 | Spremembe v obrazcu do uspešnega shranjevanja ne spremenijo shranjenih podatkov ali vrednosti v preglednici, na tabli in v števcih stanj. |
| R03 | Naslov je obvezen. Pred preverjanjem in shranjevanjem odstrani začetne in končne presledke, tabulatorje in prelome vrstic; notranje presledke ohrani. Prazen naslov ali naslov samo iz teh belih znakov prikaže napako ob polju in se ne pošlje v shranjevanje. Napaka se ob veljavnem popravku umakne. |
| R04 | Uporabnik lahko izbere eno od stanj: Pripravljeno (`todo`), V delu (`in_progress`) ali Končano (`done`). Dovoljena je sprememba med katerimakoli od teh stanj. |
| R05 | Ob uspešnem shranjevanju se naslov in stanje izbranega opravila posodobita skupaj. Obrazec se zapre; preglednica, tabla in podrobnosti pokažejo shranjene vrednosti. Kartica je v stolpcu shranjenega stanja, števci stanj so usklajeni. Vrednosti se ohranijo tudi po osvežitvi strani. |
| R06 | »Prekliči« zapre obrazec, zavrže začasne spremembe in ne pošlje zahteve za shranjevanje. Ponovno odprtje pokaže shranjene vrednosti, brez prejšnjih napak obrazca. |
| R07 | Sprememba ne sme vplivati na druga opravila ali na preostala polja urejanega opravila. To velja tudi za opravila z enakim naslovom in za druge projekte. |
| R08 | Če strežnik zavrne shranjevanje, shranjeni podatki ostanejo nespremenjeni. Obrazec ostane odprt z uporabnikovim vnosom in vidnim sporočilom o neuspehu. Uporabnik lahko poskusi znova; ob uspehu se sporočilo umakne in velja R05. |
| R09 | Med čakanjem na odgovor je prikazano stanje shranjevanja. Polji, »Shrani« in »Prekliči« so onemogočeni. Več hitrih pritiskov ne sme sprožiti sočasnih zahtev; po zavrnitvi je urejanje spet omogočeno. |
| R10 | Izbira projekta, preklop med preglednico in tablo ter odpiranje podrobnosti po koncu urejanja še vedno delujejo. Pri naslednjem opravilu se ne sme prikazati vnos ali napaka prejšnjega obrazca. |

Med urejanjem ni sočasnih sprememb drugih uporabnikov. Shranjevanje prek
pripravljenega vmesnika je bodisi uspešno bodisi zavrnjeno brez zapisa podatkov.
Zapiranje z Escape, klik izven obrazca, navigacija med odprtim urejanjem,
opozorilo ob zapustitvi strani ter prijava uporabnika niso predmet te naloge.
Za zaključek urejanja sta zahtevana le gumba »Shrani« in »Prekliči«.

Besedilo sporočil ni predpisano dobesedno, vendar mora jasno izražati razlog
napake. Polji in gumbi naj imajo razumljiva imena za uporabnika in testno orodje.
Končni testi bodo preverjali navedene zahteve tudi z drugačnimi veljavnimi
podatki in zaporedji dejanj. Ne bodo uvajali novih zahtev.

## Razvojni izdelki

### Skupni dogovor o uporabniškem vmesniku

Za enotno preverjanje v pilotu ima besedilno polje oznako »Naslov«, izbirni
seznam HTML `select` pa oznako »Stanje«. Uporabimo gumbe »Uredi«, »Shrani« in
»Prekliči«. Napaka vnosa je povezana s poljem prek `aria-describedby`, polje
ima ob napaki `aria-invalid="true"`; sporočila napak imajo `role="alert"`.
Med čakanjem je viden prikaz z `role="status"`. Besedilo sporočil ostane prosto.

Ohranijo se obstoječe oznake `data-task-id` na vrsticah in karticah, poimenovani
stolpci table ter oznaka pregleda števcev `aria-label="Pregled stanj opravil"`.
Pri odstranjevanju robnih belih znakov R03 mislimo samo U+0020, U+0009,
U+000A in U+000D. Drugih znakov, tudi nedeljivega presledka, ne odstranjujemo.

### Dokumenti in preverjanja

Pripravi razvojno specifikacijo po priloženi predlogi, implementacijo in
zapis preverjanj. Poveži zahteve s pravili, testi in spremembami kode.
Skupnih testov, podatkovne storitve in meril ne spreminjaj. Dodatne teste lahko
napišeš sam. Ne sklepaj, da uspeh razvojnih testov zagotavlja izpolnitev vseh
zahtev. Specifikacija mora slediti opisu naloge tudi po morebitnih popravkih.
