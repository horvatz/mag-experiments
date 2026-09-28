# P03 — Iskanje in sestavljeni filtri

**Različica:** 1.0  
**Stanje:** specifikacija pred izvedbo  
**Vir zahtev:** [`task/instructions.md`](../../../task/instructions.md)  
**Meje dela:** [`PROJECT_RULES.md`](../../../PROJECT_RULES.md) in [potrjeni dizajn Folio](../../dizajn.md)

## Problem in kontekst

Folio uporabniku omogoča izbiro projekta, pregled njegovih opravil v preglednici ali na tabli ter odpiranje bralnih podrobnosti. Pri več opravilih želi uporabnik najti opravila z besedilnim iskanjem in sestavljenima filtroma za stanje ter odgovorno osebo. Sprememba omeji prikaz na opravila izbranega projekta, ne spreminja njihovih podatkov in ohrani potrjeni videz Folio, slovenska poimenovanja, navigacijo ter prikaz na ozkem zaslonu.

## Vhodi, dejanja in izidi

### Podatki in vhodi

- Izbrani projekt je določen z `Project.id`; opravila se preberejo za ta projekt prek javnega `/api/` vmesnika. Rezultati ohranijo vrstni red prejetih opravil.
- Za iskanje se uporabljajo `Task.id`, `title`, `description` in `assignee`; filter stanja uporablja `status`, filter osebe pa `assignee`.
- Uporabnik vnese poizvedbo ter izbere stanje (`all`, `todo`, `in_progress`, `done`) in osebo (`all` ali eno od imen trenutnega projekta).
- Privzeto stanje filtrov je prazna poizvedba, stanje `all` in oseba `all`.

### Dejanja in izidi

Vnos poizvedbe ali sprememba enega filtra takoj preračuna prikazana opravila za trenutni projekt. Gumb **Počisti filtre** v enem dejanju vrne vse tri kontrole na privzeto stanje. Preklop med preglednico in tablo ohrani filtre. Menjava projekta jih ponastavi ter omeji filtriranje na opravila novega projekta. Osvežitev strani začne s privzetimi filtri.

Filtriranje izpelje prikaz iz prebranih podatkov: ne spreminja vrstnega reda ali polj opravil in ne pošilja zahtev `POST`, `PATCH`, `PUT` ali `DELETE` na `/api/`. Novega dejanja preklica ni. Ob napaki pri branju ostane veljavno obstoječe stanje nalaganja, napake in ponovnega poskusa; ta specifikacija mu ne dodaja novega obnašanja.

### Pravila izpeljave stanja

Naj bo `P` trenutni projekt in `T(P)` urejen seznam njegovih opravil, prebran iz `/api/`. Stanje kontrol je `F = (q, s, a)`: poizvedba `q`, stanje `s` in oseba `a`. Ob začetku strani ali izbiri drugega projekta je `F = ("", all, all)`. Filtri so začasno stanje trenutnega projekta in se ne zapišejo v URL ali trajno shrambo brskalnika.

Naj bo `N(x) = lowercase(removeMarks(UnicodeNFD(x)))`, kjer `removeMarks` odstrani samo kombinacijske znake U+0300–U+036F. Iskalno besedilo opravila `t` je `searchableText(t) = N(t.id + " " + t.title + " " + t.description + " " + t.assignee)`. `W(q)` je seznam nepraznih besed, dobljen z razdelitvijo `q` po belinah; vsako besedo normaliziramo z `N`. Opravilo ustreza, če velja:

```text
match(t, q, s, a) =
  (s = all OR t.status = s)
  AND (a = all OR t.assignee = a)
  AND FOR EVERY w IN W(q): w is a literal substring of searchableText(t)
```

Primeren seznam rezultatov je `R(P,F) = filter(T(P), match)`. Prazen `W(q)` ne omejuje rezultatov. `all` pri osebi ne omejuje rezultatov; primerjava imen oseb je natančna. Filtriranje ohranja vrstni red `T(P)`. V nadaljevanju predikat za prikazani rezultat pomeni `t ∈ R(P,F)`.

Prehodi stanja:

| Dogodek | Sprememba stanja | Pričakovani izid |
| --- | --- | --- |
| Začetni prikaz ali osvežitev | `F ← ("", all, all)` | Prikaži vsa opravila `T(P)` v izvornem vrstnem redu. |
| Vnos ali sprememba filtra | Spremeni le pripadajočo komponento `F` | Izračunaj `R(P,F)` iz `T(P)`; brez zapisovanja filtra ali podatkov opravila. |
| Preklop pogleda | Spremeni samo pogled | Preglednica in tabla uporabita isti `R(P,F)`; `F` ostane enak. |
| Izbira projekta `P'` | `P ← P'`, `F ← ("", all, all)` | Opravila in možnosti oseb izhajajo samo iz `T(P')`. |
| Počisti filtre | `F ← ("", all, all)` | Prikaži vsa opravila `T(P)` v izvornem vrstnem redu. |

## Zahteve in pravila

| Zahteva | Pravilo oziroma sprejemni pogoj | Način preverjanja |
| --- | --- | --- |
| R01 | Ob nalaganju so `q=""`, `s=all`, `a=all`; prikazani ID-ji so vsi ID-ji iz `T(P)` in v enakem vrstnem redu. | Začetni prikaz za projekt z več opravili preveri vrednosti treh kontrol in zaporedje ID-jev. |
| R02 | Iskalno besedilo je omejeno na `id`, `title`, `description`, `assignee`. Za primerjavo obeh strani se uporabi Unicode NFD, odstranijo se znaki U+0300–U+036F in pretvori v male črke. Zato `č` in `c` ter razlike v velikosti črk ne spremenijo zadetka. | Iskanje po vsakem od štirih polj in pari z/ brez diakritičnega znamenja ter z različnimi velikostmi črk. |
| R03 | Poizvedba se razdeli po belinah v neprazne besede. `t` ustreza, če je vsaka normalizirana beseda dobesedni podniz združenih polj; vrstni red besed ni pomemben. Ločila so navadno besedilo, ne regularni izrazi. Prazna poizvedba ali poizvedba, sestavljena samo iz belin, ne omejuje. | Preveri več besed v obeh vrstnih redih, neujemajočo se besedo, ločila kot dobesedne znake ter prazno poizvedbo. |
| R04 | Rezultat mora hkrati izpolnjevati iskanje, filter stanja in filter osebe (logični IN). `s` je ena od vrednosti `all`, `todo`, `in_progress`, `done`; `a=all` pomeni brez omejitve, sicer mora biti `t.assignee === a` brez normalizacije. | Izberi vsak filter posamično in skupaj; preveri natanko primerjavo oseb, tudi pri razlikah v velikosti črk ali diakritiki. |
| R05 | Izbirnik vsebuje `all` ter vsako različno neprazno ime iz celotnega `T(P)` natanko enkrat; nabor ni odvisen od trenutnih zadetkov. Ob menjavi projekta ne ostane izbrano staro ime. | Skrij opravilo z drugim filtrom in preveri, da njegovo ime ostane v možnostih; preveri unikatnost in nabor po menjavi projekta. |
| R06 | Preglednica in tabla prikazujeta iste rezultate po ID-jih. Preklop pogleda ohrani `F`. Vsak stolpec table vsebuje samo prikazane rezultate svojega stanja. | Z več kombinacijami filtrov primerjaj ID-je v obeh pogledih, filtre pred in po preklopu ter stanje vsake kartice s stolpcem. |
| R07 | Menjava projekta ponastavi `q`, `s`, `a` na privzete vrednosti. Filtriranje novega projekta se izvaja samo nad njegovim `T(P')`. | Z aktivnimi filtri preklopi na drug projekt; preveri kontrole, projektne ID-je ter izbirnik oseb. |
| R08 | Osvežitev začne s privzetimi filtri. Njihove vrednosti se ne shranijo v URL ali trajno shrambo brskalnika. | Zapiši filtre, osveži in preveri privzete vrednosti ter da URL in trajna shramba ne vsebujeta teh filtrov. |
| R09 | Dostopen števec rezultatov prikazuje natančno `Prikazano: N od M.`, kjer `N=|R(P,F)|` in `M=|T(P)|`. Povzetek stanj in števci stolpcev štejejo samo opravila v `R(P,F)`. | Preveri število rezultatov za prazen in omejujoč filter ter števce stanj/stolpcev glede na prikazane ID-je. |
| R10 | Če je `|T(P)|>0` in `|R(P,F)|=0`, je prikazano `Ni zadetkov.`; preglednica in tabla ostaneta uporabni. Če je `|T(P)|=0`, ostane običajno prazno stanje projekta in števec je `Prikazano: 0 od 0.` | Ločeno preveri neprazen projekt brez zadetkov v obeh pogledih ter prazen projekt. |
| R11 | **Počisti filtre** v enem dejanju nastavi `q=""`, `s=all`, `a=all` in prikaže vse `T(P)`. Uporaba filtrov ne spremeni vrstnega reda ali polj podatkov. | Počisti tri aktivne filtre; preveri vse vrednosti, vrstni red in nespremenjena polja. |
| R12 | Obstoječa navigacija in bralne podrobnosti delujejo. Filtriranje ne pošlje `POST`/`PATCH`/`PUT`/`DELETE` na `/api/`. Potrjeni Folio in prikaz pri širini 390 pik ostaneta ohranjena. | Preveri navigacijo, odpiranje podrobnosti, omrežne metode pri filtriranju in stran pri 390 pikah; notranje drsenje preglednice ali table je dovoljeno. |

### Dogovor o vmesniku in dostopnosti

- Iskalno polje je `input type="search"` z oznako **Išči opravila**.
- Filtra sta HTML `select` z oznakama **Filter stanja** in **Filter odgovorne osebe**; vrednosti stanja so `all`, `todo`, `in_progress`, `done`.
- Gumb za ponastavitev je **Počisti filtre**. Rezultatni števec ima `role="status"`, `aria-label="Rezultati filtriranja"` in besedilo iz R09.
- Ohrani `data-task-id` na vrsticah in karticah, obstoječa dostopna imena pogledov in stolpcev ter `aria-label="Pregled stanj opravil"`. Morebitna nova dejanja ob opravilu so zunaj njegove povezave.
- Pri 390 pikah se širina celotne strani ne poveča; dovoljeno je notranje drsenje preglednice in table. Natančno besedilo, ki ni določeno v zahtevah, in razporeditev kontrol nista predpisana.

### Predpostavke in podatkovni obseg

Uporabljajo se obstoječi tipi in javni API. Testni podatki lahko vsebujejo nič, eno ali poljubno več opravil, različne enkratne ID-je, enake naslove, različen izvorni vrstni red, veljavne datume, Unicode znake in ločila; projekti so lahko prazni. Imena, kadar se uporabljajo za izbiro osebe, so neprazna in različna od rezervirane vrednosti `all`. Vsako opravilo pripada svojemu projektu. Nobena vrednost ni določena s posameznim primerom razvojnega testa.

Uporabniški vmesnik bere podatke samo prek `/api/`; ne uporablja testnih kontrol `/__test/`. Strežnik, infrastruktura, odvisnosti, skupni tipi in skupni testi ostanejo nespremenjeni. Podrobnosti o dovoljenem obsegu in potrjenem videzu so v [projektnih pravilih](../../../PROJECT_RULES.md) in [dizajnu Folio](../../dizajn.md).

## Scenariji uporabnika

1. **Najdem opravilo:** odprem projekt in vidim vsa njegova opravila; vnesem eno ali več besed ter po potrebi omejim stanje in osebo. Rezultati izpolnjujejo vse uporabljene pogoje, števec pa odraža rezultate in velikost projekta.
2. **Preverim drug pogled:** pri aktivnih filtrih preklopim med preglednico in tablo; isti ID-ji ostanejo prikazani, razporejeni po stanju samo na tabli.
3. **Zamenjam projekt ali ponastavim iskanje:** preklop projekta ali gumb **Počisti filtre** povrne privzete kontrole in uporabi samo opravila trenutnega projekta.
4. **Obravnavam prazen rezultat:** razlikujem projekt brez opravil od projekta, v katerem filtri ne vrnejo zadetkov; obe vrsti prikaza omogočata nadaljnjo uporabo pogledov in filtrov.
5. **Nadaljujem obstoječe delo:** odprem opravilo prek obstoječe navigacije, preberem podrobnosti in uporabljam vmesnik pri ozkem zaslonu.

## Merila uspeha

- Vse zahteve R01–R12 izpolnjujejo sprejemne pogoje v zgornji tabeli.
- Primerjava rezultatov je določena s predikatom `match`, uporabljena samo nad opravili trenutnega projekta in ohranja njihov izvorni vrstni red.
- Kontrole, prazna stanja, števci, dostopna imena, odzivna širina in bralne poti ostanejo preverljive po zgornjih scenarijih.
- Uporabniški vmesnik pri filtriranju ne spreminja podatkov in ne pošilja zapisovalnih zahtev na `/api/`.

## Izvedba in sledljivost

Sprejemni pogoji in predvideni scenariji so določeni po ID-jih v [tabeli R01–R12](#zahteve-in-pravila); spodaj je sledljivost do izvedbe. Datoteke in deli kode bodo določeni v načrtu oziroma ob izvedbi; ta specifikacija jih ne ugiba. P03 koda in testi še niso bili izvedeni, zato ni nobenega izida, označenega kot uspešnega. Po izvedbi je treba za vsako zahtevo povezati dejanski test/scenarij, datoteko in del kode ter dokaz zagona.

| Zahteva | Pogoj | Test ali scenarij | Datoteka in del kode | Izid ter dokaz |
| --- | --- | --- | --- | --- |
| R01 | Pogoj R01 v zgornji tabeli | Predvideni scenarij R01 zgoraj; ni izveden | Določiti v načrtu/izvedbi | Ni še izvedeno; dokaz ne obstaja |
| R02 | Pogoj R02 v zgornji tabeli | Predvideni scenarij R02 zgoraj; ni izveden | Določiti v načrtu/izvedbi | Ni še izvedeno; dokaz ne obstaja |
| R03 | Pogoj R03 v zgornji tabeli | Predvideni scenarij R03 zgoraj; ni izveden | Določiti v načrtu/izvedbi | Ni še izvedeno; dokaz ne obstaja |
| R04 | Pogoj R04 v zgornji tabeli | Predvideni scenarij R04 zgoraj; ni izveden | Določiti v načrtu/izvedbi | Ni še izvedeno; dokaz ne obstaja |
| R05 | Pogoj R05 v zgornji tabeli | Predvideni scenarij R05 zgoraj; ni izveden | Določiti v načrtu/izvedbi | Ni še izvedeno; dokaz ne obstaja |
| R06 | Pogoj R06 v zgornji tabeli | Predvideni scenarij R06 zgoraj; ni izveden | Določiti v načrtu/izvedbi | Ni še izvedeno; dokaz ne obstaja |
| R07 | Pogoj R07 v zgornji tabeli | Predvideni scenarij R07 zgoraj; ni izveden | Določiti v načrtu/izvedbi | Ni še izvedeno; dokaz ne obstaja |
| R08 | Pogoj R08 v zgornji tabeli | Predvideni scenarij R08 zgoraj; ni izveden | Določiti v načrtu/izvedbi | Ni še izvedeno; dokaz ne obstaja |
| R09 | Pogoj R09 v zgornji tabeli | Predvideni scenarij R09 zgoraj; ni izveden | Določiti v načrtu/izvedbi | Ni še izvedeno; dokaz ne obstaja |
| R10 | Pogoj R10 v zgornji tabeli | Predvideni scenarij R10 zgoraj; ni izveden | Določiti v načrtu/izvedbi | Ni še izvedeno; dokaz ne obstaja |
| R11 | Pogoj R11 v zgornji tabeli | Predvideni scenarij R11 zgoraj; ni izveden | Določiti v načrtu/izvedbi | Ni še izvedeno; dokaz ne obstaja |
| R12 | Pogoj R12 v zgornji tabeli | Predvideni scenarij R12 zgoraj; ni izveden | Določiti v načrtu/izvedbi | Ni še izvedeno; dokaz ne obstaja |

## Odprta vprašanja in omejitve

Za izdelavo specifikacije ni ostalo odprtih vprašanj: uporabniško vidne vrednosti in filtri so določeni v navodilih. Obnašanja med dodatnimi sočasnimi spremembami podatkov in navigacijo med nezaključenim nalaganjem ne širimo prek obstoječih regresijskih zahtev. Končni ločeni testi niso dokaz izvedbe; izvesti jih je treba v poznejšem preverjanju, če bodo dostopni. Nedoločena ostajata samo razporeditev novih kontrol in besedilo, ki ni izrecno določeno v navodilih.
