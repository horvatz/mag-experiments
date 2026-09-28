# P03: Iskanje in sestavljeni filtri

## Problem in kontekst

Folio uporabniku omogoča izbiro projekta ter pregled njegovih opravil v preglednici ali na tabli. Trenutno sta prikazana vsa opravila, zato je pri iskanju med njimi treba pregledovati celoten seznam. Ta dopolnitev doda iskanje in sestavljene filtre, pri čemer obstoječa navigacija, bralne podrobnosti in potrjeni videz Folio ostanejo uporabni.

Podatki se pridobijo za izbrani projekt prek obstoječega javnega API-ja. Filtriranje je samo za prikaz: ne spreminja podatkov opravil in ne dodaja API zapisov. Začetno vedenje in meje sprememb določata `PROJECT_RULES.md`; potrjeni videz določa `docs/dizajn.md`.

## Vhodi, dejanja in izidi

Za vsako opravilo so za iskanje uporabljena polja `id`, `title`, `description` in `assignee`; filtra uporabita `status` in `assignee`. `projectId` določa trenutno zbirko, `id` pa ostane identiteta opravila. Testni podatki lahko vsebujejo nič, eno ali več kot deset opravil, različne enolične ID-je, podvojene naslove in drugačen vrstni red; projekt je lahko prazen. Tipi in polja ostanejo enaki izhodišču, datumi so veljavni, besedilna polja pa lahko vsebujejo Unicode in ločila. Vsako opravilo pripada svojemu projektu. Možnosti oseb vsebujejo neprazna imena, različna od rezervirane vrednosti `all`.

### Dogovor o vmesniku

- Iskalni vnos je `input type="search"` z dostopnim imenom `Išči opravila`.
- Izbirnika sta HTML `select` z dostopnima imenoma `Filter stanja` in `Filter odgovorne osebe`; vrednosti stanja so `all`, `todo`, `in_progress`, `done`, pri osebah pa `all` ali točno ime.
- Gumb ima besedilo `Počisti filtre`.
- Rezultatski števec je `role="status"`, `aria-label="Rezultati filtriranja"` in prikazuje `Prikazano: N od M.`.
- Ohranijo se `data-task-id` na vrsticah in karticah, dostopna imena obstoječih pogledov in stolpcev ter `aria-label="Pregled stanj opravil"`. Nova dejanja ob opravilu so zunaj njegove povezave.

| Dejanje oziroma izid | Vedenje |
| --- | --- |
| Uspešen prikaz opravila projekta | Iskalni vnos je prazen, filtra sta `all`; prikažejo se ustrezna opravila projekta. |
| Vnos iskanja ali izbira filtra | Rezultati se takoj izračunajo iz trenutno naloženih opravil; kontrola ne sproži zapisovanja na API. |
| Menjava preglednice in table | Spremeni se pogled, filtri ostanejo enaki. |
| Menjava projekta | Iskalni vnos in oba filtra se ponastavijo, rezultati pa izhajajo samo iz novega projekta. |
| Počisti filtre | Iskalni vnos postane prazen in filtra `all`; prikažejo se vsa opravila projekta. |
| Osvežitev | Začne se s privzetimi filtri; filtrske vrednosti se ne obnovijo iz URL-ja ali trajne shrambe. |
| Nalaganje ali napaka API-ja | Obstoječi prikaz nalaganja, napake in ponovnega poskusa ostane v veljavi; rezultati se ne izračunajo iz podatkov drugega projekta. Filtri nimajo ločene operacije shranjevanja, preklica ali napake. |

## Zahteve in pravila

### Formalna pravila

Naj bo `P(p)` seznam opravil trenutnega projekta `p`, kakor ga vrne API, v izvornem vrstnem redu. Naj bo `q` iskalni vnos, `s ∈ {all, todo, in_progress, done}` izbrano stanje in `a` izbrana oseba (`all` ali točno ime). Normalizacija je:

`norm(x) = lowercase(x.normalize('NFD') z odstranjenimi znaki U+0300–U+036F)`.

`W(q)` so neprazne besede, dobljene z razdelitvijo `q` po belinah. Za opravilo `t` je `text(t) = norm(t.id + ' ' + t.title + ' ' + t.description + ' ' + t.assignee)`. Besedilni pogoj velja, če je `W(q)` prazna ali če za vsako `w ∈ W(q)` velja `text(t)` vsebuje `norm(w)` kot dobesedni podniz. Ločila so navadni znaki; vrstni red besed ne vpliva.

Ustrezna opravila so stabilni podseznam `P(p)`:

`F(p,q,s,a) = [t ∈ P(p) | besedilni_pogoj(t,q) ∧ (s = all ∨ t.status = s) ∧ (a = all ∨ t.assignee = a)]`.

Zato je vrstni red elementov v `F` enak njihovemu vrstnemu redu v `P`. `N = |F|`, `M = |P|`. Možnosti filtra oseb so `all` in vsako različno neprazno ime `assignee` iz `P(p)` natanko enkrat, ne glede na trenutne rezultate. Preglednica in tabla prikažeta enak nabor ID-jev iz `F`; vsak stolpec table vsebuje samo elemente iz `F`, katerih stanje je stanje stolpca. Števci rezultatov, pregleda stanj in stolpcev table se izračunajo iz `F`.

### Sprejemni pogoji in preverjanje

| Zahteva | Pravilo oziroma sprejemni pogoj | Način preverjanja |
| --- | --- | --- |
| R01 | Ob prvem prikazu `q = ""`, `s = all`, `a = all`; prikazani ID-ji so `P(p)` v izvornem vrstnem redu. | Naloži projekt in preveri privzete vrednosti ter urejen seznam ID-jev. |
| R02 | Iskanje uporabi združena polja `id`, `title`, `description`, `assignee` in na obeh straneh izvede NFD, odstrani U+0300–U+036F ter pretvori v male črke. | Preveri ujemanje razlik v velikosti črk in diakritiki, tudi `č`/`c`, v vsakem polju. |
| R03 | Iskalni vnos se razdeli po belinah; vse neprazne besede morajo biti dobesedni podnizi. Vrstni red ni pomemben, ločila niso vzorci regularnih izrazov, prazen vnos ne filtrira. | Preveri več besed v obeh vrstnih redih, presledke, ločila in dobesedni znak `.` ali `*`. |
| R04 | Rezultat ustreza hkrati iskanju, statusu (`all`, `todo`, `in_progress`, `done`) in osebi (`all` ali natančno ime); pogoji se povezujejo z IN. Ime osebe se ne normalizira. | Kombiniraj vse tri kontrole; preveri različna stanja in imena, ki se razlikujejo po črkah ali diakritiki. |
| R05 | Izbirnik oseb vsebuje `all` in vsa različna neprazna imena iz celotnega `P(p)` natanko enkrat, tudi če jih drugi filtri skrijejo. Po menjavi projekta stara izbira ni ohranjena. | Izberi pogoj, ki skrije osebo, preveri možnosti; nato zamenjaj projekt in preveri ponastavitev. |
| R06 | Tabela in tabla imata isti množici ID-jev `F`; preklop pogleda ohrani `q`, `s`, `a`; stolpci table razvrstijo samo ustrezna opravila po njihovem stanju. | Z istim filtrom zabeleži ID-je v obeh pogledih, preklopi pogled in preveri ID-je ter vsebino stolpcev. |
| R07 | Ob menjavi projekta se `q`, `s`, `a` ponastavijo na privzete; `F` se računa samo iz `P(p)` trenutno izbranega projekta. | Nastavi filtre in zamenjaj projekt; preveri kontrole, rezultate ter odsotnost ID-jev prejšnjega projekta. |
| R08 | Osvežitev začne s privzetimi filtri; iskanje in filtra niso zapisani v URL ali trajno shrambo brskalnika. | Nastavi filtre in osveži; preveri privzete vrednosti in URL/shrambo. |
| R09 | Statusno sporočilo ima `role="status"`, `aria-label="Rezultati filtriranja"` in besedilo `Prikazano: N od M.`; pregled stanj in števci stolpcev štejejo `F`. | Primerjaj N, M, statuse in števce stolpcev z neodvisnim izračunom iz podatkov scenarija. |
| R10 | Če `|P| > 0` in `|F| = 0`, se prikaže `Ni zadetkov.` v obeh uporabnih pogledih; če `|P| = 0`, ostane običajno prazno stanje in `Prikazano: 0 od 0.` | Preveri neprazen projekt brez zadetkov v obeh pogledih in ločeno prazen projekt. |
| R11 | Gumb `Počisti filtre` z enim dejanjem nastavi `q = ""`, `s = all`, `a = all` in prikaže `P(p)`; filtriranje ne spremeni vrstnega reda ali polj opravil. | Nastavi vse filtre, počisti in primerjaj ID-je, vrstni red ter polja z začetnim odgovorom API-ja. |
| R12 | Navigacija in bralne podrobnosti ostanejo delujoče; filtriranje ne pošlje `POST`, `PATCH`, `PUT` ali `DELETE` na `/api/`. Ohraniti je treba potrjeni Folio, kontrolni dogovor iz zgornjega razdelka, obstoječa dostopna imena pogledov in stolpcev, `data-task-id` ter `aria-label="Pregled stanj opravil"`. Nova dejanja pri opravilu ostanejo zunaj njegove povezave. Pri širini 390 px se stran ne razširi; notranje drsenje preglednice in table je dovoljeno. | Regresijsko preveri navigacijo in podrobnosti, metode omrežnih zahtev med filtriranjem, semantiko/dostopna imena in prikaz pri 390 px. |

## Uporabniški scenariji

1. **Najdem opravilo po besedilu.** Uporabnik odpre projekt, vnese eno ali več besed in vidi samo opravila, ki vsebujejo vse iskane besede po določeni normalizaciji. Rezultati ostanejo v izvornem vrstnem redu.
2. **Združim kriterije.** Uporabnik poleg iskanja izbere stanje in odgovorno osebo; rezultat ustreza vsem izbranim pogojem. Seznam oseb še vedno odraža celoten projekt.
3. **Primerjam pogleda.** Uporabnik preklopi med preglednico in tablo; isti ustrezni ID-ji ostanejo prikazani, na tabli po stolpcih svojega stanja.
4. **Ponastavim ali zamenjam projekt.** Uporabnik z enim dejanjem počisti vse filtre ali izbere drug projekt; vidi vsa opravila novega oziroma trenutnega projekta s privzetimi filtri.
5. **Obravnavam prazen rezultat.** Uporabnik vidi `Ni zadetkov.` za neujemajoč se filter ali običajno prazno stanje za prazen projekt; števci pravilno odražajo prikaz.
6. **Nadaljujem obstoječe delo.** Uporabnik ohrani dostop do navigacije in bralnih podrobnosti; uporaba filtrov ne spreminja opravil.

## Uspešna merila

- Vseh pogojev R01–R12 je mogoče preveriti s scenariji v zgornji tabeli.
- Filtrirana množica in njeni števci ustrezajo formalnim pravilom, brez spremembe podatkov ali API zapisov.
- Obstoječi Folio, navigacija in bralne podrobnosti ostanejo uporabni, vključno pri širini 390 px.

## Izvedba in sledljivost

Spodaj so povezave do zahtev in kandidatnih obstoječih mest kode, ki jih bo treba ob izvedbi potrditi ali posodobiti. To so načrtovani scenariji preverjanja, ne trditev, da so testi že ustvarjeni ali izvedeni.

| Zahteva | Pogoj | Test ali scenarij | Datoteka in del kode | Izid ter dokaz |
| --- | --- | --- | --- | --- |
| R01 | Glej sprejemni pogoj R01. | Začetno stanje in vrstni red ID-jev. | `src/App.tsx` — ProjectView, kandidatno mesto za kontrole in seznam. | V tej fazi nepreverjeno; izvedeni test in dokaz še nista na voljo. |
| R02 | Glej sprejemni pogoj R02. | Normalizacija vseh štirih polj, velikost črk in diakritika. | `src/App.tsx` — izračun rezultatov, kandidatno mesto. | V tej fazi nepreverjeno; izvedeni test in dokaz še nista na voljo. |
| R03 | Glej sprejemni pogoj R03. | Več besed, vrstni red, presledki in dobesedna ločila. | `src/App.tsx` — razčlenitev iskalnega vnosa in predikat, kandidatni mesti. | V tej fazi nepreverjeno; izvedeni test in dokaz še nista na voljo. |
| R04 | Glej sprejemni pogoj R04. | Kombinacija iskanja, stanja in osebe. | `src/App.tsx` — sestavljeni predikat, kandidatno mesto. | V tej fazi nepreverjeno; izvedeni test in dokaz še nista na voljo. |
| R05 | Glej sprejemni pogoj R05. | Možnosti oseb iz celotnega projekta in menjava projekta. | `src/App.tsx` — možnosti filtra, kandidatno mesto. | V tej fazi nepreverjeno; izvedeni test in dokaz še nista na voljo. |
| R06 | Glej sprejemni pogoj R06. | Primerjava ID-jev v obeh pogledih in obstojnost filtrov. | `src/App.tsx`, `src/TaskBoard.tsx` — tabela, predaja rezultatov tabli in stolpci. | V tej fazi nepreverjeno; izvedeni test in dokaz še nista na voljo. |
| R07 | Glej sprejemni pogoj R07. | Ponastavitev ob menjavi projekta in ločitev podatkov. | `src/App.tsx`, `src/navigation.ts` — izbrani projekt in stanje pogleda. | V tej fazi nepreverjeno; izvedeni test in dokaz še nista na voljo. |
| R08 | Glej sprejemni pogoj R08. | Osvežitev, URL in trajna shramba. | `src/App.tsx`, `src/navigation.ts` — lokalno stanje filtrov in obstoječa pot. | V tej fazi nepreverjeno; izvedeni test in dokaz še nista na voljo. |
| R09 | Glej sprejemni pogoj R09. | N/M, pregled stanj in števci table. | `src/App.tsx`, `src/TaskBoard.tsx` — status in števci. | V tej fazi nepreverjeno; izvedeni test in dokaz še nista na voljo. |
| R10 | Glej sprejemni pogoj R10. | Ni zadetkov in prazen projekt v obeh pogledih. | `src/App.tsx`, `src/TaskBoard.tsx` — prazna stanja. | V tej fazi nepreverjeno; izvedeni test in dokaz še nista na voljo. |
| R11 | Glej sprejemni pogoj R11. | Enkratno čiščenje in nespremenjeni podatki. | `src/App.tsx` — kontrola in stanje filtrov, kandidatni mesti. | V tej fazi nepreverjeno; izvedeni test in dokaz še nista na voljo. |
| R12 | Glej sprejemni pogoj R12. | Regresija navigacije/podrobnosti, omrežje in 390 px. | `src/App.tsx`, `src/TaskBoard.tsx`, `src/TaskDetails.tsx`, `src/navigation.ts`, `src/styles.css` — obstoječi pogledi in prikaz. | V tej fazi nepreverjeno; izvedeni test in dokaz še nista na voljo. |

Testni primeri so v tej specifikaciji sprejemni scenariji. Izvedene teste, njihove izide in določljive dnevnike je treba dodati ob dejanskem preverjanju; nedostopnih končnih testov se ne označi kot opravljenih.

## Odprta vprašanja in omejitve

Zahteve določajo polja, normalizacijo, kontrolne vrednosti, besedila in meje prikaza, zato dodatno pojasnilo uporabnika ni potrebno. Zaporedje možnosti oseb ni določeno in specifikacija ga ne predpisuje. Obstoječe stanje nalaganja/napak API-ja, navigacija in prikaz podrobnosti ostanejo v veljavi; navigacija med nezaključenim nalaganjem ter nove sočasne spremembe podatkov brez osvežitve niso razširjene. V fazi specifikacije ni bila izvedena implementacija ali testiranje; preverjanje in dokazila ostajajo odprta.
