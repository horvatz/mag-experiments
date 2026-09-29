# P04 – stabilno razvrščanje z dvema ključema

Status: pripravljeno za predajo implementerju, različica 1.0. Izvirne zahteve v `task/instructions.md` ostajajo obvezne. Pregledani so tipi, relevantna koda, opis dizajna in razvojni testi; aplikacija in testi v tej fazi niso bili zagnani.

## Problem in kontekst

Folio trenutno izpiše prejeto polje opravil v preglednici, tabla pa ga filtrira po statusih. Dodamo stabilno razvrščanje po dveh ključih, skupno obema pogledoma. Ohraniti je treba slovenski vmesnik, potrjeni dizajn iz `docs/dizajn.md` in obstoječe bralne funkcije. Razvrščanje je lokalna projekcija podatkov iz javnega `/api/`, brez spremembe opravil ali zapisov na API.

## Vhodi, dejanja in izidi

`shared/types.ts` določa `Project { id, name }` in `Task { id, projectId, title, description, status, assignee, dueDate }`. Vsa polja so nizi; `status` je `todo | in_progress | done`, `dueDate` veljaven koledarski datum `YYYY-MM-DD`. Imena in naslovi so navadno besedilo z Unicode znaki in ločili. Vsako opravilo pripada svojemu projektu, ID-ji so enkratni. Polje ima poljubno dolžino (tudi 0, 1 ali več kot 10), poljubne ID-je in vrstni red; naslovi se lahko ponavljajo. Oba projekta sta lahko prazna.

Obstoječi viri: `GET /api/projects`, `GET /api/projects/:id/tasks`, `GET /api/tasks/:id`; parametri so kodirani ID-ji. Izvorni vrstni red pomeni vrstni red prejetega polja trenutnega projekta, ne vrstnega reda po ID-ju ali po prejšnjem razvrščanju.

Štiri HTML kontrole `select` morajo imeti natančna dostopna imena in vrednosti:

| Dostopno ime | Vrednosti možnosti | Privzeto |
| --- | --- | --- |
| Primarni ključ | `original`, `title`, `assignee`, `status`, `dueDate` | `original` |
| Primarna smer | `asc`, `desc` | `asc` |
| Sekundarni ključ | `none`, `title`, `assignee`, `status`, `dueDate` | `none` |
| Sekundarna smer | `asc`, `desc` | `asc` |

Sprememba kontrole takoj preračuna prikaz, brez potrjevanja ali shranjevanja; ostale kontrole ohranijo vrednosti. Gumb `Izvorni vrstni red` povrne vse štiri privzete vrednosti. Kontrole so uporabne tudi pri uspešno naloženem praznem projektu. Razporeditev in besedila možnosti niso predpisani, uporabijo naj slovenski slog aplikacije.

Preklop pogleda ter odpiranje/zapiranje podrobnosti (gumb, Escape, obstoječa navigacija nazaj) ohranijo nastavitve. Menjava projekta, tudi vrnitev na prejšnjega, in osvežitev začnejo s privzetimi vrednostmi. Nastavitve niso v URL-ju ali trajni shrambi; obstoječi URL pogleda in podrobnosti ostane veljaven. Ob napaki GET ostaneta obstoječa prikaz napake in ponovni poskus; pri nalaganju ostane obstoječe stanje nalaganja. Razvrščanje nima novega postopka preklica ali zapisovalne napake.

## Zahteve in pravila

Naj bo `A = [a₀, …, aₙ₋₁]` prejeto polje, `i(a)` izvorni indeks, `S = (p, dp, q, dq)` stanje kontrol in `S₀ = (original, asc, none, asc)`. `B(A,S)` je razvrščena projekcija.

- `N(x) = x.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()`; vrstni red teh operacij je obvezen. Primerjava `L(x,y)` je `-1`, če `x < y`, `1`, če `x > y`, sicer `0`, z običajno primerjavo nizov JavaScript po UTF-16. Brez `localeCompare`, `Intl.Collator`, numeričnega razvrščanja, odstranjevanja ločil ali presledkov.
- `c_title(a,b) = L(N(a.title), N(b.title))`, enako za `assignee`. Za status uporabimo rang `todo=0, in_progress=1, done=2`; `c_dueDate` primerja izvorna datumska niza. Pri zagotovljenem formatu `YYYY-MM-DD` je to kronološko; ne primerjamo oblikovanega prikaza datuma. `c_none = 0`.
- `d(asc)=1`, `d(desc)=-1`. Če `p=original`, je `B=A` po zaporedju, ne glede na ostale tri vrednosti. Sicer primerjalnik vrne prvi neničelni rezultat iz `[d(dp)·c_p(a,b), d(dq)·c_q(a,b), i(a)-i(b)]`, oziroma `0`, če so vsi nič. Zadnjega člena nobena smer ne obrača. Isto pravilo dopušča `p=q`, tudi pri nasprotnih smereh.
- Projekcija je permutacija: `length(B)=length(A)` in za vsak vhodni ID `count(B,id)=1`; vrednosti vseh polj in izvorno zaporedje `A` ostanejo nespremenjeni. Za status `s` je zaporedje kartic `B.filter(t => t.status === s)`; zaporedje stolpcev je vedno `todo, in_progress, done`.
- Prehodi stanja: `reset(S)=S₀`, `changeProject(S)=S₀`, `reload(S)=S₀`, `switchView(S)=S`, `open/closeDetails(S)=S`. Sama sprememba razvrščanja ne spremeni URL-ja in povzroči nič zapisovalnih zahtev API.

| Zahteva | Pravilo oziroma sprejemni pogoj | Način preverjanja |
| --- | --- | --- |
| R01 | Privzeto `(original, asc, none, asc)`; prikaz sledi prejetemu polju. | Vrednosti kontrol in zaporedje ID-jev. |
| R02 | `title/assignee` uporabita natanko `N` in `L` zgoraj, tako kot primarni kot sekundarni ključ. | Unicode, sestavljeni/razstavljeni diakritični znaki, velikost črk, ločila, `Alfa 10` pred `alfa 2` v asc. |
| R03 | Status `todo < in_progress < done`; veljavni datumi kronološko. | Vsi statusi in datumi prek mesecev/let. |
| R04 | Smer obrne le rezultat primerjave ključa; ohrani stabilnost. Končno polje se ne obrača. | Izenačeni elementi pri `desc`, nato povratek na asc. |
| R05 | Sekundarni ključ deluje le ob primarni enakosti in ima neodvisno smer. | Dve skupini s primarno enakostjo in nasprotni smeri. |
| R06 | Ob dvojni enakosti izvorni vrstni red; isti ključ je dovoljen; `original` prezre druge kontrole. | Dvojne enakosti, isti ključ, `original` z drugačnimi kontrolami. |
| R07 | Stolpci table ostanejo stalni; vrstni red kartic je filtriran vrstni red istega razvrščenega polja. | Primerjava ID-jev preglednice in vsakega stolpca. |
| R08 | Preklop pogleda in odpiranje/zapiranje podrobnosti ohranita nastavitve in vrstni red. | Prehodi ob nestandardnih vrednostih vseh štirih kontrol. |
| R09 | Menjava projekta in osvežitev ponastavita vse kontrole; brez trajne shrambe ali URL-ja. | Prehod med projektoma, vrnitev, osvežitev. |
| R10 | Gumb ponastavi vse štiri kontrole; nič ali eno opravilo deluje pri vseh ključih in smereh. | Ponastavitev in prazni/enoelementni podatki. |
| R11 | Brez mutacije izvornega polja, opravil, pripadnosti, skupnega števila ali števil po statusih; nič zapisov API. | Primerjava vhodov, povzetkov, pripadnosti stolpcem in omrežnih zahtev pred/po razvrščanju. |
| R12 | Vsak ID natanko enkrat v aktivnem pogledu; povezave in podrobnosti temeljijo na ID-ju. Ostanejo `data-task-id`, dostopna imena pogledov/stolpcev in `aria-label="Pregled stanj opravil"`. | Podvojeni naslovi, poljubni ID-ji, bralne regresije in pregled Folio na namizju/390 px. |

Pri R12: ohranijo se imena `Preglednica`, `Tabla`, regija `Tabla opravil` in stolpci `Pripravljeno`, `V delu`, `Končano`. Morebitna nova dejanja ob opravilu morajo biti zunaj povezave opravila. Pri 390 px velja `document.documentElement.scrollWidth <= document.documentElement.clientWidth`; notranje drsenje preglednice in table je dovoljeno. Nove kontrole se prilagodijo širini in imajo viden fokus. Ohranijo se barve, tipografija, stranski meni in mobilna navigacija iz potrjenega dizajna.

## Izvedba in sledljivost

Pregled kode potrjuje naslednja mesta za dopolnitev: `src/App.tsx::ProjectView` bere opravila in izrisuje preglednico, `App` ga že veže na `key={project.id}`. Lokalno stanje v `ProjectView` zato podpira ponastavitev ob menjavi projekta, brez ponastavitve ob spremembi pogleda ali podrobnosti. Izračunajte eno projekcijo za `tbody` in vhod `TaskBoard`; ne sortirajte vhodnega polja na mestu. Čisti primerjalnik lahko dobi lastno datoteko v `src/` (predlog `src/sortTasks.ts`).

`src/TaskBoard.tsx::columns` že določa stalne stolpce, `entries = tasks.filter(...)` pa ohranja relativni vrstni red. `src/TaskDetails.tsx` bere podrobnosti po ID-ju. `src/navigation.ts` upravlja obstoječi hash; nastavitev razvrščanja vanj ne dodajajte. `src/styles.css` že ima `.table-scroll`, `.board-scroll`, `.workspace { min-width: 0 }` in mobilni prelom pri 760 px; nove kontrole naj se vključijo brez širjenja strani.

V spodnji tabeli so D01–D04 dejanska imena testov v `tests/development/P04.spec.ts`; S01–S06 so predlagani dodatni scenariji za implementerjeve teste v `tests/agent/`, ne že obstoječi ali izvedeni testi. Stolpec kode označuje pregledana mesta oziroma predlagano novo kodo, ne dokončane implementacije.

| Zahteva | Pogoj | Test ali scenarij | Datoteka in del kode | Izid ter dokaz |
| --- | --- | --- | --- | --- |
| R01 | `S=S₀`, zaporedje `B=A` | D01; S01 preveri tudi vse štiri vrednosti kontrol | `src/App.tsx::ProjectView`, začetno stanje | Ni izvedeno; pregled izhodišča |
| R02 | Normalizacija `N` in primerjava `L` | D01 delno; S01 Unicode in leksikografski primeri za oba besedilna ključa | Predlagani `src/sortTasks.ts`, primerjalnik nizov | Ni izvedeno |
| R03 | Rang statusov in kronologija datumov | D02, D03 delno; S01 vsi statusi in datumi prek leta, tudi 29. februar | Primerjalnik statusa/datuma; `ProjectView` | Ni izvedeno |
| R04 | Smer brez obračanja enakih elementov | S02 primarni desc z enakimi vrednostmi, vse štiri kombinacije smeri | Primerjalnik, končni izvorni indeks | Ni izvedeno |
| R05 | Sekundarni ključ le pri primarni enakosti | D02; S02 vsak sekundarni ključ, vključno z none, v ločenih primarnih skupinah | Primerjalnik, sekundarna veja; kontrole v `ProjectView` | Ni izvedeno |
| R06 | Dvojna enakost, isti ključ in prevlada original | S02 dvojne normalizirane enakosti; isti ključ/nasprotni smeri; original ob poljubnih drugih nastavitvah | Primerjalnik in veja original | Ni izvedeno |
| R07 | Za vsak status natanko filtrirana projekcija | D03 delno; S03 primerjaj vse tri stolpce s preglednico, tudi desc in prazne stolpce | `ProjectView` oba izrisa; `TaskBoard::columns/entries` | Ni izvedeno |
| R08 | Prehodi znotraj projekta ohranijo `S` | S03 preglednica → tabla → preglednica ter odpiranje/zapiranje podrobnosti v obeh pogledih | `ProjectView` stanje; `TaskDetails`, `navigation.ts` | Ni izvedeno |
| R09 | Menjava projekta in reload vrneta `S₀` | S04 projekt A → B → A, osvežitev v obeh pogledih; preveri kontrole in vrstni red | `App` ključ projekta; lokalno stanje `ProjectView` | Ni izvedeno |
| R10 | Reset vseh kontrol, dolžini 0 in 1 | D04 delno; S04 reset po spremembi vseh kontrol; S05 vse kombinacije ključev/smeri na praznem in enoelementnem projektu | Kontrole in reset v `ProjectView`, prazni pogledi | Ni izvedeno |
| R11 | Permutacija brez mutacije ali zapisov | D04 delno; S06 nespremenjen zamrznjen vhod, polja, povzetki in števila; spremljanje zapisov pri vseh dejanjih razvrščanja | Projekcija; `ProjectView::counts`; `api.ts` brez novih klicev zapisovanja | Ni izvedeno |
| R12 | Enkratni ID-ji, pravilne podrobnosti in Folio | S06 premešanih >10 opravil s poljubnimi ID-ji in enakimi naslovi; skupni bralni testi; namizje/390 px | Ključi/povezave v `App.tsx`, `TaskBoard.tsx`; `TaskDetails.tsx`; `styles.css` | Ni izvedeno; vizualni pregled ni opravljen |

Implementer naj izvede skupne teste (`tests/baseline.spec.ts`, `tests/api.spec.ts`), razvojne P04 in smiselne dodatne teste ter lint/build po obstoječih nastavitvah. Dejanske ukaze, rezultate, imena novih testov in povezave na končno kodo za R01–R12 zapiše v svojo dokumentacijo v `docs/agent/`. Skupnih testov se ne spreminja. Testi lahko uporabljajo `tests/development/helpers.ts` in testne kontrole; produkcijska koda jih ne sme uvažati ali klicati. Ta specifikacija ostaja v lasti njenega avtorja.

## Odprta vprašanja in omejitve

Ni odprtih vprašanj, ki bi blokirala implementacijo. Podpora manjkajočim/neveljavnim datumom ni zahtevana. Navigacije med nalaganjem in novih sočasnih sprememb brez osvežitve ne širimo preko obstoječih regresij. Nastavitve pogleda v obstoječem URL-ju niso nastavitve razvrščanja in se ohranijo.

Strežnik, začetni podatki, infrastruktura, odvisnosti, skupni tipi, skupni testi in navodila so samo za branje. Implementer spreminja le svoje dovoljene datoteke (`src/`, `tests/agent/`, lastne implementacijske zapiske). UI ne uporablja `/__test/`, testnih pripomočkov, lokalne kopije podatkov ali `localStorage` namesto API-ja. Ne dodajamo novih zapisovalnih API-jev. Uporabljata se le izvoz in lokalne storitve te naloge, brez drugih projektov ali oddaljenih virov.

V tej fazi so bila opravljena le branja in pisanje specifikacije. Vsa runtime, regresijska in vizualna preverjanja iz tabele še čakajo implementerja; končni testi niso dostopni in niso označeni kot opravljeni. D01–D04 sami ne dokazujejo vseh R01–R12.
