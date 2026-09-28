# P03: Iskanje in sestavljeni filtri

Različica specifikacije: 1.0.0  
Funkcionalna mapa: `docs/agent/P03`  
Viri: [izvirne zahteve](../../../task/instructions.md), [skupna predloga](../../../task/specification-template.md), [projektna pravila](../../../PROJECT_RULES.md) in [potrjeni dizajn Folio](../../dizajn.md).

## Problem in kontekst

Folio prikaže opravila trenutno izbranega projekta v preglednici ali na tabli ter omogoča navigacijo do njihovih bralnih podrobnosti. Trenutni vmesnik pokaže vsa opravila, ne omogoča pa iskanja in sestavljenih filtrov. Uporabnik mora lahko poiskati opravila po besedilu, omejiti rezultate po stanju in odgovorni osebi ter rezultate primerjati v obeh pogledih. Sprememba ohrani potrjeni videz Folio, slovenska poimenovanja, obstoječo navigacijo in branje prek javnega API-ja.

## Vhodi, dejanja in izidi

### Podatki

- Trenutni projekt in opravila prihajajo iz obstoječega API-ja. Izhodiščni pogled nalaga opravila projekta prek `GET /api/projects/{projectId}/tasks`; bralne podrobnosti opravila ostanejo prek obstoječe poti `/api/`.
- Za iskanje so pomembna polja opravila `id`, `title`, `description` in `assignee`; filtra uporabljata `status` in natančno ime `assignee`. Identiteta opravila je `id`; opravilo pripada enemu projektu.
- Naloge lahko vsebujejo nič, eno ali poljubno več opravil, unikatne poljubne ID-je, podvojene naslove, različen vrstni red, Unicode in ločila. Projekt je lahko prazen. Datumi so veljavni.
- Obseg aplikacijskih sprememb je `src/`, lastni testi v `tests/agent/` in dokumenti v `docs/agent/`. Strežnik, skupni tipi in testi, začetni podatki, odvisnosti ter nastavitve ostanejo nespremenjeni.

### Stanje filtrov in pravila sprememb

Za izbrani projekt `p` je stanje filtrov `Fₚ = (q, s, a)`: iskalni niz `q` je privzeto prazen, stanje `s` je privzeto `all`, odgovorna oseba `a` pa privzeto `all`. Pogled `v` je obstoječi pogled preglednice ali table. `Tₚ` je seznam opravil trenutnega projekta v vrstnem redu API-ja.

Ob nalaganju ali osvežitvi se začne z `Fₚ = ("", all, all)` in prikaže vsa opravila `Tₚ`. Vnos iskanja spremeni samo `q`; izbira stanja spremeni samo `s`; izbira osebe spremeni samo `a`. Vsaka taka sprememba izračuna prikazani seznam na novo iz `Tₚ`. Menjava pogleda spremeni samo `v` in ohrani `Fₚ`. Menjava projekta nastavi filtre novega projekta na privzete vrednosti in uporablja samo `Tₚ` novega projekta. Dejanje »Počisti filtre« v eni spremembi nastavi `Fₚ` na `("", all, all)`. Filtri niso del URL-ja ali trajne shrambe brskalnika.

Filtriranje je lokalno, izpeljano stanje: ne spreminja `Tₚ`, vrstnega reda ali polj opravil in ne pošilja zapisovalnih zahtev. Obstoječa izbira projekta, pogleda in branje podrobnosti ostanejo uporabna. Filtriranje ne uvaja novega postopka preklica. Če branje podatkov odpove, ostane obstoječe stanje napake in ponovnega poskusa; lokalnih nadomestnih podatkov ni.

## Zahteve in pravila

Naj bo `fold(x)` pretvorba niza v Unicode NFD, odstranitev znakov U+0300–U+036F in pretvorba v male črke. Naj bo `W(q)` seznam nepraznih besed, dobljen z razdelitvijo po belinah. Iskalni zapis opravila je `S(t) = fold(t.id + " " + t.title + " " + t.description + " " + t.assignee)`. Ujemanje `M(t,q,s,a)` velja natanko tedaj, ko velja vse naslednje:

1. Za vsako besedo `w ∈ W(q)` je `fold(w)` dobesedni podniz `S(t)`; če je `W(q)` prazen, ta pogoj velja.
2. `s = all` ali `t.status = s`.
3. `a = all` ali `t.assignee = a` z natančno, nenormalizirano primerjavo.

Prikazani seznam je stabilni filter `Rₚ = [t ∈ Tₚ | M(t,q,s,a)]`; zato se ohrani izvorni vrstni red. `Mcount = |Tₚ|` je število vseh opravil projekta, `N = |Rₚ|` pa število prikazanih opravil.

| Zahteva | Pravilo oziroma sprejemni pogoj | Način preverjanja |
| --- | --- | --- |
| R01 | Ob začetku so `q=""`, `s=all`, `a=all`; preglednica in tabla vsebujeta vse ID-je iz `Tₚ` v istem izvornem vrstnem redu. | Svež obisk projekta s kontroliranim GET odgovorom; preveri privzete kontrole, ID-je in vrstni red. |
| R02 | Iskalni zapis združi `id`, `title`, `description`, `assignee`; tako zapis iskalnega vnosa kot polja sledi `fold`. `č` in `c` ter velikost črk ne vplivajo na zadetek. | Primerjaj zadetke za različno velikost črk in zapis z/ brez diakritičnih znamenj v vseh štirih poljih. |
| R03 | `W(q)` vsebuje neprazne besede, ujemanje zahteva vse besede kot dobesedne podnize ne glede na njihov vrstni red. Ločila so navadni znaki, ne vzorci; prazen niz ne omejuje. | Preuredi iskalne besede; preveri večbesedne zadetke, ločila in prazen vnos. |
| R04 | Stanje `s` je eno od `all`, `todo`, `in_progress`, `done`; oseba `a` je `all` ali točno ime. Iskanje in oba filtra se sestavijo z logičnim IN po `M`. | Uporabi vsak filter samostojno in v kombinaciji; preveri izključujoče se pogoje ter natančno primerjavo imen. |
| R05 | Izbirnik oseb ima `all` in vsako različno neprazno ime iz celotnega `Tₚ` natanko enkrat, ne glede na trenutni `Rₚ`. Po menjavi projekta ni na voljo oseba prejšnjega projekta. | Skrij osebo z drugim filtrom, preveri še vedno prisotno enolično možnost; preklopi projekt in preveri nove možnosti. |
| R06 | Množica ID-jev v preglednici in tabli je enaka `Rₚ`. Menjava pogleda ohrani `(q,s,a)`. Vsak stolpec table vsebuje samo opravila `Rₚ` svojega stanja. | Z istimi filtri zabeleži ID-je v obeh pogledih, preklopi pogled in preveri stanje kontrol ter članstvo stolpcev. |
| R07 | Menjava projekta nastavi `q=""`, `s=all`, `a=all` in filtrira samo opravila novega projekta. | Izberi filtre, zamenjaj projekt ter preveri privzete kontrole, možnosti oseb in ID-je novega projekta. |
| R08 | Osvežitev začne s privzetimi filtri. `q`, `s` in `a` se ne zapišejo v URL, `localStorage` ali drugo trajno shrambo brskalnika. | Nastavi filtre in osveži; preveri privzeto stanje. Preglej URL in trajno shrambo po uporabi filtrov. |
| R09 | Statusno sporočilo ima `role="status"`, `aria-label="Rezultati filtriranja"` in besedilo `Prikazano: N od M.`. Pregled stanj in števci stolpcev table štejejo opravila v `Rₚ`. | Preveri točno besedilo in atribute pri filtriranih ter nefiltriranih rezultatih; primerjaj števce z ID-ji. |
| R10 | Če `Mcount > 0` in `N = 0`, se prikaže `Ni zadetkov.`; preglednica in tabla ter njuni filtri/preklop ostanejo uporabni. Če `Mcount = 0`, ostaneta običajno prazno stanje in števec `Prikazano: 0 od 0.`. | Ločeno preveri neprazen projekt brez zadetkov in prazen projekt v obeh pogledih. |
| R11 | Gumb `Počisti filtre` v enem dejanju nastavi `(q,s,a)` na `("",all,all)` in pokaže vsa opravila. Filtriranje ne spremeni vrstnega reda ali podatkov `Tₚ`. | Počisti kombinirane filtre in preveri kontrole, ID-je, njihov vrstni red ter nespremenjene vrednosti opravila. |
| R12 | Obstoječa navigacija projektov in bralne podrobnosti delujejo. Filtriranje ne pošlje `POST`, `PATCH`, `PUT` ali `DELETE` na `/api/`. Ohranita se potrjeni Folio in prikaz pri širini 390 px; dovoljena sta notranje drsenje preglednice in table. | Odpri podrobnost in uporabi navigacijo; zabeleži metode zahtev med filtriranjem; preveri Folio in širino 390 px, vključno z notranjima prikazoma. |

### Dogovor o vmesniku

- Iskalno polje ima `type="search"` in `placeholder="Išči opravila"`.
- HTML `select` za stanje ima dostopno ime `Filter stanja` in vrednosti `all`, `todo`, `in_progress`, `done`. Izbirnik oseb ima dostopno ime `Filter odgovorne osebe`, možnost `all` in točna imena oseb.
- Gumb se imenuje `Počisti filtre`. Rezultat je element `role="status"`, `aria-label="Rezultati filtriranja"` z besedilom `Prikazano: N od M.`.
- Vrstice preglednice in kartice ohranijo `data-task-id`; ohranijo se dostopna imena obstoječih pogledov in stolpcev ter `aria-label="Pregled stanj opravil"`. Nova dejanja ob opravilu so zunaj njegove povezave.
- Ohranita se potrjeni Folio in vidni fokus tipkovnice. Pri širini 390 px se stran kot celota ne razširi vodoravno; preglednica in tabla se smeta pomikati znotraj svojega prikaza.

### Scenariji uporabnika

1. **Iskanje in zoženje rezultatov:** uporabnik vnese več besed, izbere stanje in osebo; vidi samo opravila, ki ustrezajo vsem pogojem, z ustreznimi števci.
2. **Primerjava pogledov:** uporabnik preklaplja med preglednico in tablo; isti filtri in ID-ji ostanejo aktivni.
3. **Prehod med projekti ali ponastavitev:** uporabnik zamenja projekt ali uporabi »Počisti filtre«; vidi vsa opravila ustreznega projekta s privzetimi filtri in osebami.
4. **Brez rezultatov in brez opravil:** uporabnik razlikuje projekt brez zadetkov od projekta brez opravil; oba pogleda ostaneta dostopna.
5. **Branje podrobnosti:** obstoječa povezava do opravila, zapiranje podrobnosti in navigacija še naprej delujejo brez zapisovalnih zahtev zaradi filtriranja.

## Izvedba in sledljivost

Spodnje oznake `P03-Rxx` so načrtovani scenariji preverjanja, ne imena že izvedenih testov. Preverjanja se izvedejo po implementaciji z ločenimi testi naloge in po potrebi z lastnimi testi v `tests/agent/`. Podatke je treba podajati prek testnega mehanizma nadzorovanih GET odgovorov; aplikacija testnih kontrol `/__test/` ne uvaža in jih ne kliče. Koda za nove kontrole in filtre še ni določena; izhodiščni pogled je v `src/App.tsx`, tabla v `src/TaskBoard.tsx`.

| Zahteva | Pogoj | Test ali scenarij | Datoteka in del kode | Izid ter dokaz |
| --- | --- | --- | --- | --- |
| R01 | Glej R01 zgoraj. | P03-R01: svež projekt, privzete kontrole in vrstni red. | Še ni določeno; določita načrt in izvedba. | Ni izvedeno; ta korak je pripravil specifikacijo. |
| R02 | Glej R02 zgoraj. | P03-R02: NFD, diakritika, velikost črk in vsa iskalna polja. | Še ni določeno; določita načrt in izvedba. | Ni izvedeno; ta korak je pripravil specifikacijo. |
| R03 | Glej R03 zgoraj. | P03-R03: vse besede, drugačen vrstni red, ločila in prazen niz. | Še ni določeno; določita načrt in izvedba. | Ni izvedeno; ta korak je pripravil specifikacijo. |
| R04 | Glej R04 zgoraj. | P03-R04: samostojni in sestavljeni filtri, natančna oseba. | Še ni določeno; določita načrt in izvedba. | Ni izvedeno; ta korak je pripravil specifikacijo. |
| R05 | Glej R05 zgoraj. | P03-R05: osebe iz celotnega projekta in menjava projekta. | Še ni določeno; določita načrt in izvedba. | Ni izvedeno; ta korak je pripravil specifikacijo. |
| R06 | Glej R06 zgoraj. | P03-R06: isti ID-ji, ohranjeni filtri, ustrezni stolpci table. | Še ni določeno; določita načrt in izvedba. | Ni izvedeno; ta korak je pripravil specifikacijo. |
| R07 | Glej R07 zgoraj. | P03-R07: ponastavitev filtrov in podatki novega projekta. | Še ni določeno; določita načrt in izvedba. | Ni izvedeno; ta korak je pripravil specifikacijo. |
| R08 | Glej R08 zgoraj. | P03-R08: osvežitev, URL in trajna shramba. | Še ni določeno; določita načrt in izvedba. | Ni izvedeno; ta korak je pripravil specifikacijo. |
| R09 | Glej R09 zgoraj. | P03-R09: dostopno statusno sporočilo in števci. | Še ni določeno; določita načrt in izvedba. | Ni izvedeno; ta korak je pripravil specifikacijo. |
| R10 | Glej R10 zgoraj. | P03-R10: ločena scenarija za brez zadetkov in prazen projekt. | Še ni določeno; določita načrt in izvedba. | Ni izvedeno; ta korak je pripravil specifikacijo. |
| R11 | Glej R11 zgoraj. | P03-R11: enodejna ponastavitev in nespremenjeni podatki. | Še ni določeno; določita načrt in izvedba. | Ni izvedeno; ta korak je pripravil specifikacijo. |
| R12 | Glej R12 zgoraj. | P03-R12: navigacija, podrobnosti, metode zahtev in širina 390 px. | Še ni določeno; določita načrt in izvedba. | Ni izvedeno; ta korak je pripravil specifikacijo. |

Uspeh je potrjen šele, ko je vsak pogoj R01–R12 preverjen in je rezultat zabeležen v dokumentaciji izvedbe. Ta specifikacija ne trdi, da so testi ali implementacija že opravljeni.

## Odprta vprašanja in omejitve

Za določeno vedenje odprtih vprašanj ni. Ne določamo razporeditve novih kontrol ali besedila, ki ni izrecno določeno v zahtevah; ti podrobnosti morata ohraniti Folio in dostopnost. Zahteve ne širijo obnašanja pri navigaciji med nalaganjem ali sočasnih spremembah podatkov brez osvežitve prek obstoječih regresijskih zahtev. Implementacija, testi in njihove omejitve v tem koraku še niso preverjeni.
