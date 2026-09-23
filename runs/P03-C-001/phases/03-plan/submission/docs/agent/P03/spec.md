# P03 — Iskanje in sestavljeni filtri

Različica 1.0 · 2026-09-24 · stanje: specificirano, še ne implementirano.

Viri: [izvirne zahteve](../../../task/instructions.md), [projektna pravila](../../../PROJECT_RULES.md), [skupna predloga](../../../task/specification-template.md), [načela](../../../.specify/memory/constitution.md), [Folio](../../dizajn.md). Izvirne zahteve R01–R12 veljajo tudi ob morebitni opustitvi v tem dokumentu. Naslednji razdelki izpolnjujejo skupno predlogo.

## Problem in kontekst

Uporabnik želi med opravili trenutnega projekta poiskati besede ter hkrati omejiti stanje in odgovorno osebo. Začetni Folio že bere projekte in opravila, prikazuje preglednico, tablo s tremi stanji ter bralne podrobnosti. Iskanja in filtrov še nima. Dopolnitev doda začasne projektne filtre in usklajene števce ob ohranitvi dizajna, navigacije in javnega API-ja.

Uspeh pomeni izpolnitev vseh spodnjih sprejemnih pogojev za opisano podatkovno domeno, brez sprememb infrastrukture ali zapisovanja podatkov. Število opravil ali začetna imena niso omejitev rešitve.

## Vhodi, dejanja in izidi

Vhod je urejen seznam `Task` trenutnega projekta iz `/api/projects/:id/tasks`. Relevantna polja so `id`, `projectId`, `title`, `description`, `assignee`, `status` in obstoječi `dueDate`. ID-ji so enkratni; naslovi so lahko enaki. Število opravil je poljubno, tudi nič, eno ali več kot deset, vrstni red polj in veljavni koledarski datumi pa niso vezani na začetne primere. Besedila lahko vsebujejo Unicode in ločila. Imena oseb so v opisani domeni neprazna in različna od rezerviranega `all`; izbirnik vseeno izloči prazna imena. Projekta sta lahko prazna.

Uporabnik lahko vnese iskalni niz, izbere stanje ali osebo, počisti filtre, zamenja pogled ali projekt, osveži stran ter odpre in zapre obstoječe bralne podrobnosti. Filtri začnejo učinkovati ob spremembi kontrole, brez ločenega potrjevanja. Rezultat so ustrezna opravila, števci in primerno prazno stanje. Sprememba filtriranja ne spreminja nalog in nima strežniške operacije, ki bi jo bilo treba preklicati. Vrnitev na privzeti prikaz je dejanje »Počisti filtre«; zapiranje podrobnosti ostane obstoječe dejanje navigacije.

Ob nalaganju in napaki pridobivanja podatkov ostaneta obstoječi prikaz nalaganja oziroma napaka z možnostjo ponovitve. Napake ne obravnavamo kot prazen projekt ali kot »Ni zadetkov.«. Ne dodajamo novih pravil za navigacijo med nezaključenim nalaganjem ali sočasne spremembe podatkov brez osvežitve.

### Dogovor o vmesniku

- `input type="search"` z dostopnim imenom **Išči opravila**.
- HTML `select` z imenom **Filter stanja**, vrednosti `all`, `todo`, `in_progress`, `done`.
- HTML `select` z imenom **Filter odgovorne osebe**, vrednost `all` ali točno ime osebe.
- Gumb **Počisti filtre**.
- Element `role="status"`, `aria-label="Rezultati filtriranja"`, besedilo **Prikazano: N od M.** z eno končno piko.
- Ohranijo se `data-task-id` na vrsticah in karticah, dostopna imena pogledov in stolpcev ter `aria-label="Pregled stanj opravil"`. Morebitna nova dejanja ob opravilu morajo biti zunaj njegove povezave.
- Razporeditev novih kontrol uporablja obstoječe sloge Folia in viden fokus. Pri širini 390 pik stran ne preseže širine zaslona; notranje drsenje preglednice in table je dovoljeno. Navigacija pri širini do 760 pik ostane nad vsebino.

## Zahteve in pravila

### Predikati in spremembe stanja

Naj bo `T(p)` urejen izvorni seznam opravil trenutnega projekta `p`, `q` iskalni niz, `s` izbrano stanje, `a` izbrana oseba in `v` pogled. Privzeti filtri so `F₀ = ("", all, all)`.

`norm(x) = lowercase(remove[U+0300–U+036F](NFD(x)))`.

`H(t) = norm(join(" ", [t.id, t.title, t.description, t.assignee]))`.

`W(q)` so neprazne besede iz `norm(q)`, razdeljenega po belinah. `search(t,q) ⇔ ∀w ∈ W(q): H(t).includes(w)`. Uporablja se dobesedni podniz, brez interpretacije regularnih izrazov; pri praznem `W(q)` je predikat resničen. Besede lahko zadenejo različna polja, njihov vrstni red ni pomemben.

`match(t,q,s,a) ⇔ search(t,q) ∧ (s = all ∨ t.status = s) ∧ (a = all ∨ t.assignee = a)`.

Primerjava osebe je natančna in ne uporablja `norm`. `V = filter(T(p), match)` ohrani relativni vrstni red ter vsa polja. Možnosti oseb so `A(p) = {all} ∪ distinct({t.assignee | t ∈ T(p), t.assignee ≠ ""})`, neodvisno od `V`. Vrstni red imen ni predpisan.

`M = |T(p)|`, `N = |V|`, `C(k) = |{t ∈ V : t.status = k}|`. Preglednica kaže `V`; stolpec table za `k` kaže urejeno podzaporedje `V` s stanjem `k`. Množici ID-jev obeh pogledov sta enaki; globalni vrstni red table je posledica obstoječih stolpcev, znotraj stolpca pa ostane izvorni vrstni red.

| Dogodek | Pravilo spremembe stanja |
| --- | --- |
| Prvi prikaz ali osvežitev strani | `F := F₀`; po uspešnem GET velja `V = T(p)`. |
| Sprememba kontrole | Spremeni se samo ustrezni del `(q,s,a)`; `V`, `N` in `C` se ponovno izračunajo. |
| Menjava pogleda | `v := novi pogled`; `(p,q,s,a)` ostanejo enaki. |
| Menjava projekta `p → p'` | `F := F₀`; seznam in možnosti oseb izvirajo samo iz `T(p')`. Stari filtri ali podatki se ne uporabijo za drug projekt. |
| Počisti filtre | V enem dejanju `F := F₀`, `V = T(p)`. |
| Odpri/zapri podrobnosti | Obstoječa navigacija in branje po ID-ju ostaneta delujoča; podatki se ne spreminjajo. |

Za vsa dejanja filtriranja velja `T_after = T_before` (polja in zaporedje), brez `POST/PATCH/PUT/DELETE` na `/api/`. Filtri niso kodirani v URL, `localStorage` ali drugi trajni shrambi brskalnika. Obstoječi URL za projekt, pogled in podrobnosti ostaja dovoljen.

### Sprejemni pogoji

| Zahteva | Pravilo oziroma sprejemni pogoj | Način preverjanja |
| --- | --- | --- |
| R01 | Ob nalaganju `F₀`; vsa opravila trenutnega projekta, preglednica v izvornem vrstnem redu. | D01 in S01: vrednosti kontrol in zaporedje ID-jev pri 0, 1 in več kot 10 opravilih. |
| R02 | `norm` obeh strani in `H` vključujeta vsa štiri polja, tudi ID in opis. | D01 in S02: velike/male črke, sestavljeni in razstavljeni diakritični znaki, zadetek v vsakem polju. |
| R03 | Vse neprazne besede morajo biti dobesedni podnizi; beline, prazni nizi in vrstni red besed ne povzročajo dodatnih omejitev. | S02: več besed v različnih poljih, obrnjeni vrstni red, presledki/tabulatorji, ločila kot `.*`, `[`, `+`. |
| R04 | Iskanje, stanje in oseba delujejo z IN; dovoljene vrednosti stanja in natančna primerjava osebe. | D02 in S03: vsi trije pogoji hkrati, vsako stanje, podobna imena z razliko v velikosti ali diakritiki. |
| R05 | Možnosti oseb so `A(p)` brez duplikatov in niso skrčene zaradi filtrov; nov projekt ne ohrani stare osebe. | S03 in S04: skrite osebe ostanejo v selectu, ponovljena imena le enkrat, zamenjava projekta. |
| R06 | Enaki ID-ji v preglednici in tabli; sprememba pogleda ohrani vse tri kontrole; stolpci vsebujejo samo svoje stanje. | D02 in S05: primerjava množic ID-jev in zaporedij znotraj stolpcev. |
| R07 | Prehod med projektoma ponastavi vse tri kontrole; ni uporabe filtrov ali podatkov drugega projekta. | S04: oba projekta, različne osebe in ID-ji, vrnitev v prvi projekt. |
| R08 | Osvežitev začne s `F₀`; ni zapisovanja filtrov v URL ali trajno shrambo. | S04: reload po kombinaciji filtrov, pregled URL-ja in shrambe. |
| R09 | Status je natančno `Prikazano: N od M.`; pregled stanj in števci stolpcev so `C(k)`. | D04 in S05: števci pri zadetkih, brez zadetkov in praznem projektu. |
| R10 | Za `M > 0 ∧ N = 0` je vidno `Ni zadetkov.` in pogleda ostaneta uporabna; za `M = 0` običajno prazno stanje, `0 od 0`. | D03 in S06: oba pogleda, prazen projekt in neprazen projekt brez zadetkov. |
| R11 | En klik »Počisti filtre« ponastavi vse kontrole; nobeno filtriranje ne mutira podatkov ali njihovega vrstnega reda. | D03 in S07: počisti kombinacijo vseh filtrov; primerjaj začetne in končne ID-je, polja in vrstni red. |
| R12 | Delujeta navigacija in branje podrobnosti; brez zapisovalnih API zahtev; dizajn Folio in širina 390 pik ostaneta ustrezna. | D04, skupni testi in S08: nadzor zahtev, podrobnosti po ID, pogled na širokem/ozkem zaslonu in širina dokumenta. |

### Uporabniški scenariji

Oznake S01–S08 označujejo načrtovane scenarije, ne že izvedenih testov.

- **S01 — začetni podatki:** odpri projekte z nič, enim in več kot deset opravili ter z enakimi naslovi in drugačnim vrstnim redom; preveri privzete kontrole in ID-je.
- **S02 — iskanje:** išči po vseh poljih z Unicode, več besedami in dobesednimi ločili; preveri tudi prazen vnos in vnos iz samih belin.
- **S03 — presek:** sestavi iskanje, stanje in osebo; preveri natančnost imena in nespremenjene možnosti oseb iz celotnega projekta.
- **S04 — življenjska doba:** z aktivnimi filtri zamenjaj projekt, se vrni in osveži stran; preveri ponastavitve, podatke projekta ter odsotnost trajnega zapisa filtrov.
- **S05 — pogledi in števci:** preklapljaj preglednico/tablo; primerjaj kontrole, ID-je, stanja, relativni vrstni red in vse števce.
- **S06 — praznine:** razlikuj neprazen projekt brez zadetkov od praznega projekta v obeh pogledih; kontrole in preklop pogleda ostanejo uporabni.
- **S07 — ponastavitev in podatki:** po več spremembah počisti vse filtre z enim klikom in preveri izvorne podatke in zaporedje.
- **S08 — regresija:** po filtriranju odpri in zapri podrobnosti, preklopi projekt, preveri odsotnost zapisovalnih zahtev, Folio in delovanje pri 390 pikah.

## Izvedba in sledljivost

Ta tabela bo dopolnjena z dejanskimi imeni testov, deli kode in dnevniki po implementaciji. Navedene obstoječe lokacije so orientacija za naslednji korak, ne dokaz izvedene funkcionalnosti. D01–D04 so obstoječi testi v `tests/development/P03.spec.ts`; S01–S08 so zgoraj opredeljeni dodatni scenariji.

| Zahteva | Pogoj | Test ali scenarij | Datoteka in del kode | Izid ter dokaz |
| --- | --- | --- | --- | --- |
| R01 | `F₀`, `V = T(p)` | D01, S01 | `src/App.tsx`, ProjectView — dopolnitev načrtovana | Ni izvedeno. |
| R02 | `norm`, `H` | D01, S02 | Iskalna logika v `src/` — lokacija bo določena v načrtu | Ni izvedeno. |
| R03 | `W`, `search` | S02 | Iskalna logika v `src/` — lokacija bo določena v načrtu | Ni izvedeno. |
| R04 | `match` | D02, S03 | `src/App.tsx`, ProjectView in filtriranje — načrtovano | Ni izvedeno. |
| R05 | `A(p)` | S03, S04 | `src/App.tsx`, ProjectView — načrtovano | Ni izvedeno. |
| R06 | isti ID-ji, ohranjen `F` | D02, S05 | `src/App.tsx`, ProjectView; `src/TaskBoard.tsx` — priklop rezultatov načrtovan | Ni izvedeno. |
| R07 | projekt → `F₀` | S04 | `src/App.tsx`, ProjectView z obstoječim `key={project.id}` | Ni izvedeno. |
| R08 | reload → `F₀` | S04 | `src/App.tsx`, projektno stanje — načrtovano | Ni izvedeno. |
| R09 | `N`, `M`, `C(k)` | D04, S05 | `src/App.tsx`, pregled stanj in status; `src/TaskBoard.tsx`, števci | Ni izvedeno. |
| R10 | `M > 0 ∧ N = 0` / `M = 0` | D03, S06 | `src/App.tsx`, prazna stanja; `src/TaskBoard.tsx`, prazni stolpci | Ni izvedeno. |
| R11 | počisti → `F₀`; nespremenjeni podatki | D03, S07 | `src/App.tsx`, ponastavitev in filtriranje — načrtovano | Ni izvedeno. |
| R12 | branje, navigacija, Folio, 390 pik | D04, S08, skupni testi | `src/App.tsx`, `src/TaskDetails.tsx`, `src/styles.css` | Ni izvedeno. |

## Odprta vprašanja in omejitve

Bistvenih odprtih vprašanj ni. Imena kontrol, vrednosti in osnovno obnašanje določajo izvirna navodila. Nepredpisan vrstni red oseb in razporeditev kontrol se izbereta skladno z obstoječim Folio brez novih zahtev. Prazen projekt ohrani obstoječe prazno stanje izbranega pogleda (preglednica: »V tem projektu še ni opravil«; tabla: prazni stolpci), dodatno dobi rezultat `0 od 0`.

V tej fazi ni implementacije in ni izvedenih testov. Lokalni razvojni primeri niso celoten obseg; končni testi niso dostopni. API, strežnik, skupni tipi/testi, nastavitve, odvisnosti in uradne predloge ostanejo samo berljivi. Aplikacija ne uvaža testnih pripomočkov ali `/__test/`. Obseg ne vključuje urejanja opravil ali novih API-jev.

## Zgodovina sprememb

- 2026-09-24, 1.0: začetna specifikacija vseh R01–R12, predikati, prehodi stanja, scenariji in začetna sledljivost. Testi še niso izvedeni.
