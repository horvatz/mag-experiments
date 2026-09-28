# P09: Stanje pogleda v povezavi in zgodovini

Spec Kit feature: `docs/agent/P09`  
Viri zahtev: [`../../../task/instructions.md`](../../../task/instructions.md), skupna predloga [`../../../task/specification-template.md`](../../../task/specification-template.md).  
Izhodiščni videz: [`../../dizajn.md`](../../dizajn.md).

## Problem in kontekst

Folio trenutno bere projekte in opravila prek javnega `/api/`, v URL fragmentu pa prepozna projekt, opravilo in način prikaza `table` ali `board`. Seznam je prikazan v preglednici ali tabli, podrobnost opravila se odpre kot pogovorno okno. P09 doda iskanje, filter stanja in vrstni red, določene s povezavo, ter potrjevanje filtra z zgodovino brskalnika.

Uporabnik lahko odpre ali deli povezavo z določenim pogledom in se z gumboma Nazaj/Naprej vrne med potrjenimi pogledi. Osnutek v kontrolah se ne uveljavi, dokler ga uporabnik ne potrdi. Dopolnitev ohrani slovenska poimenovanja, potrjeni odzivni dizajn Folio ter obstoječe nalaganje, podrobnosti in neznano-potno vedenje.

## Vhodi, dejanja in izidi

Vhodni podatki ostanejo obstoječi objekti `Project { id, name }` in `Task { id, projectId, title, description, status, assignee, dueDate }`, prebrani iz javnega API-ja. `status` opravila je `todo`, `in_progress` ali `done`; vsako opravilo pripada svojemu projektu. Razvojni/končni testi lahko vrnejo prazen seznam, poljubno število opravil, enkratne ID-je, enake naslove in poljubno izvorno zaporedje. Naslovi, opisi in imena so navadno besedilo z Unicode znaki in ločili; datumi so veljavni. Projekti so lahko prazni. Kadar testni podatki vsebujejo izbiro odgovorne osebe, so imena neprazna in različna od rezervirane vrednosti `all`.

Pogled projekta ali opravila uporablja parametre fragmenta `q`, `status`, `order`; `view=board` izbere tablo, sicer ostane obstoječi privzeti pregled `table`. Filtri so: `q` (ena fraza), `status` (`all`, `todo`, `in_progress`, `done`) in `order` (`original`, `title-asc`, `title-desc`). Kontrole so označene »Iskanje v povezavi«, »Stanje v povezavi« in »Vrstni red v povezavi«; dejanja sta »Uporabi pogled« in »Ponastavi pogled«.

- **Uspešna pot:** neposredna povezava ali potrditev določi potrjene filtre; enaki filtri se uporabijo v preglednici in tabli. Potrditev spremembe doda eno zgodovinsko stanje brskalnika.
- **Brez potrditve / navigacija:** sprememba kontrol ostane osnutek. Ob navigaciji se osnutek zavrže in kontrole se uskladijo s potrjenimi filtri ciljne povezave. Nazaj/Naprej obnovita stanje iz zgodovine.
- **Prazni rezultati:** prikaže se »Ni zadetkov.« ter števec »Prikazano: N od M.«, kjer je `N` število prikazanih, `M` pa število vseh opravil trenutnega projekta pred filtriranjem.
- **Nalaganje ali napaka:** ohranijo se obstoječa stanja nalaganja, napake in ponovnega poskusa; iz te funkcionalnosti ne nastanejo zapisi na API.

## Zahteve in pravila

### Model in predikati

`F=(q,s,o)` je potrjeno stanje filtrov, `D` pa osnutek kontrol. Privzeto je `F₀=("", all, original)`. `V` je način pogleda (`table` ali `board`), `P` trenutni projekt, `T` opravila projekta v vrstnem redu iz odgovora API-ja, `M=|T|` in `N` velikost filtriranega seznama.

`norm(x)` pretvori niz v NFD, odstrani znake U+0300–U+036F in ga pretvori v male črke. Pri iskalni frazi se najprej odstrani zunanje beline; polja se ne obrezujejo. Normalizacija je:

```text
norm(x) = lowercase(remove U+0300–U+036F from NFD(x))
match(t,q) = norm(trim(q)) is substring of norm(t.title) OR
             norm(trim(q)) is substring of norm(t.description) OR
             norm(trim(q)) is substring of norm(t.assignee) OR
             norm(trim(q)) is substring of norm(t.id)
```

Za prazen `q` je `match(t,q)=true`. Iskanje je dobesedno in ne deli fraze na besede. Statusni pogoj `statusMatch(t,s)` je `true` pri `s=all`, sicer `t.status=s`. Rezultat pred razvrščanjem je `[t ∈ T | match(t,q) AND statusMatch(t,s)]`. `original` ohrani izvorni vrstni red. `title-asc`/`title-desc` primerjata `norm(title)` po UTF-16; pri enakem naslovu se ohrani izvorni vrstni red.

URL-razčlenjevalnik uporabi prvo pojavitev ponovljenega parametra. Neznan `status` ali `order` se v učinkovitem stanju spremeni v privzeto vrednost; neznani parametri ne vplivajo na rezultate. Razčlenitev sama URL-ja ne spreminja; `q` je v učinkovitem stanju obrezan tudi, če izvorni URL vsebuje zunanje beline. Kanonični zapis ob potrditvi obreže `q`, izpusti prazni `q`, `status=all` in `order=original`, preostalo kodira kot URL-parametre, ohrani `view=board` ter odstrani neznane parametre. Vrstni red parametrov ni predpisan.

### Pravila sprememb stanja

| Dogodek | Predpogoj | Prehod in URL / izid |
| --- | --- | --- |
| Neposreden vstop na projekt ali opravilo | Pot obstoječega projekta/opravila | `F := parse(hash)`, `D := F`; uporabi `F` brez dodatnega klika. URL se pri razčlenitvi ne prepiše. |
| Urejanje ene ali več kontrol | Kontrole so prikazane | Spremeni se samo `D`; `F`, prikaz rezultatov in URL ostanejo nespremenjeni. |
| Uporabi pogled | `D` vsebuje izbrane vrednosti | `F' := (trim(D.q), D.status, D.order)`. Vse tri vrednosti se potrdijo skupaj. Če `F' ≠ F`, zapiši eno novo zgodovinsko stanje; sicer ne dodajaj zgodovinskega stanja. URL zapiši v kanonični obliki, brez neznanih parametrov; če je efektivni `F` isti, kanonizacija ne sme ustvariti novega stanja. Nato `F := F'`, `D := F'`. |
| Ponastavi pogled | Kontrole so prikazane | Nastavi `D := F₀` in potrdi enako kot »Uporabi pogled«; ohrani `V`. |
| Preklop `table`/`board` | Projekt je odprt | Spremeni `V`, ohrani `F`, ponovno prikaži iste ID-je `N` rezultatov; zavrzi morebitni osnutek (`D := F`). |
| Odpri podrobnost / zapri z gumbom ali Escape | Projekt je odprt; izbrani ID pripada projektu | Ohranita se `F` in `V`; povezava do opravila temelji na ID-ju. Ob zaprtju se vrne na projektni pogled z istim stanjem. Osnutek se zavrže. |
| Klik drugega projekta v navigaciji | Izbran je drug projekt | Začni z `F₀`, ohrani `V`, zavrzi osnutek. Neposreden vstop na URL drugega projekta uporabi njegove parametre. |
| Nazaj/Naprej ali osvežitev | URL vsebuje ciljno stanje | Znova razčleni potrjeno stanje, nastavi `D := F` in prikaže ustrezne rezultate/pogled; osvežitev ohrani filtre iz URL-ja. |

V vseh prehodih izpis filtrov ne spreminja `Project` ali `Task`, ne kliče API-ja z zapisovalno metodo in ne uporablja `localStorage`. Navigacije med nedokončanim nalaganjem in sočasne spremembe podatkov so zunaj dodatnega obsega P09, razen obstoječih regresijskih pravil.

### Funkcionalne zahteve in preverjanje

| Zahteva | Pravilo oziroma sprejemni pogoj | Način preverjanja po implementaciji |
| --- | --- | --- |
| R01 | Na obstoječi projektni in opravilski poti se iz fragmentnega query dela uporabijo `q`, `status`, `order`; privzete vrednosti so `""`, `all`, `original`. Neposredni vstop prikaže rezultat brez klika. | Neposredno odpreti projekt in opravilo z vsakim filtrom ter brez parametrov; primerjati kontrolne vrednosti in izpis rezultatov. |
| R02 | `q` je ena dobesedna, obrezana fraza; normalizacija in polja so podani v predikatih. Zadetek je podniz v vsaj enem od `title`, `description`, `assignee`, `id`; ni regex ali razdelitve na besede. | Preveriti presledke, ločila/regex znake, kombinirane in razstavljene naglasne znake, male/velike črke ter zadetek v vsakem od štirih polj. |
| R03 | Statusi so `all/todo/in_progress/done`; status in iskanje se združita z IN. Vrstni red je `original/title-asc/title-desc`; naslov sledi isti normalizaciji in UTF-16, enaki naslovi ohranijo izvorni vrstni red. | Preveriti vsako stanje skupaj z iskanjem, oba vrstna reda na Unicode naslovih, enake naslove in ohranitev API-vrstnega reda pri izenačenju/`original`. |
| R04 | Neznan `status`/`order` postane privzet; prva pojavitev ponovljenega parametra velja; neznani parametri ne vplivajo na prikaz; začetno razčlenjevanje ne spremeni URL-ja. | Odpreti URL-je z neznanimi, podvojenimi in dodatnimi parametri; preveriti kontrolnike/izpis in nespremenjen fragment pred potrditvijo. |
| R05 | Urejanje kontrol spremeni le `D`. »Uporabi pogled« uveljavi vse tri vrednosti hkrati in ob spremembi potrjenega `F` doda natanko eno zgodovinsko stanje. | Urediti več kontrol brez potrditve; preveriti nespremenjen prikaz/URL; potrditi in zabeležiti eno spremembo zgodovine. |
| R06 | Ob potrditvi je `q` obrezan, privzeti parametri izpuščeni in drugi kodirani; `view=board` se ohrani, neznani parametri odstranijo. Enaka ponovna potrditev ne doda zgodovinskega stanja. | Potrditi frazo z robnimi presledki in rezerviranimi znaki v obeh pogledih; preveriti kanonični URL, ohranjen board in odstranitev neznanih parametrov; potrditi še enkrat ter preveriti zgodovino. |
| R07 | Nazaj/Naprej obnovita potrjene filtre, rezultate in osnutek kontrol iz ciljne zgodovine; osvežitev uporabi filtre iz fragmenta. | Ustvariti več potrjenih stanj, urediti neoddani osnutek, uporabiti Nazaj/Naprej in osvežitev; primerjati URL, kontrole in rezultate po vsakem prehodu. |
| R08 | Preklop »Preglednica«/»Tabla« ohrani `F` in iste ID-je, zavrže `D`. | S filtri izločiti del opravil, urediti osnutek, preklopiti v obe smeri; primerjati množico in identiteto ID-jev ter URL. |
| R09 | Odpiranje podrobnosti in zapiranje z gumbom/Escape ohranita filtre in način. Cilj izbranega opravila je ID, tudi pri enakih naslovih. | Odpreti opravila z enakim naslovom, preveriti URL in vsebino po ID-ju, zapreti na oba načina ter preveriti obnovljeni pogled. |
| R10 | Klik na drug projekt uporabi `F₀` in ohrani `V`; neposreden URL projekta uporabi podane parametre. | Preklopiti projekt iz filtriranega board/table pogleda in neposredno odpreti drugi projekt s filtri; preveriti oba različna izida. |
| R11 | »Ponastavi pogled« izprazni `q`, nastavi `all/original`, počisti osnutek in uporabi isto pravilo zgodovine kot potrditev; ohrani `V`. Ni zadetkov pokaže »Ni zadetkov.«; števec je »Prikazano: N od M.« | Ponastaviti iz spremenjenega in že privzetega stanja v obeh načinih; preveriti URL, zgodovino, osnutek, prazen rezultat ter `N`/`M` pri praznem in nepraznem seznamu. |
| R12 | Filtri ne spreminjajo podatkov, ne pošiljajo zapisov, ne uporabljajo `localStorage` ali testnih kontrol. Obstoječe neznane poti, nalaganje, podrobnosti in prilagodljiv Folio ostanejo delujoči. | Pregledati omrežne metode in shrambo med vsemi dejanji; regresijsko preveriti API, napake/nalaganje, neznano pot, podrobnosti ter širino 390 px. |

### Dogovor o vmesniku in omejitve

Obvezna so kontrola `input type="search"` z oznako »Iskanje v povezavi«, izbor »Stanje v povezavi« z vrednostmi `all/todo/in_progress/done`, izbor »Vrstni red v povezavi« z vrednostmi `original/title-asc/title-desc`, gumb »Uporabi pogled« in gumb »Ponastavi pogled«. Števec ima `role="status"` in `aria-label="Rezultati povezave"`. Obstoječa imena pogledov in stolpcev, `data-task-id` na vrsticah/karticah ter `aria-label="Pregled stanj opravil"` se ohranijo. Nova dejanja pri opravilu so zunaj njegove povezave.

Cela stran na širini 390 px se ne razširi vodoravno; notranje drsenje preglednice in table je dovoljeno. Ohranijo se potrjeni Folio gradniki, slogi in slovenska poimenovanja iz [`docs/dizajn.md`](../../dizajn.md). Vsebina ali razporeditev kontrol, ki ni izrecno določena, ostane izvedbena odločitev znotraj tega dizajna.

Uporabniški vmesnik bere samo obstoječi `/api/`. Ne uvaža ali kliče testnih kontrol `/__test/`, ne nadomešča strežnika/lokalnih podatkov in ne uporablja `localStorage` za stanje. Ne spreminjajo se `server/`, `shared/`, začetni podatki, skupna testa, odvisnosti ali nastavitve. Aplikacijske spremembe sodijo v `src/`; lastni dodatni testi v `tests/agent/`; dokumenti v `docs/agent/`.

## Uporabniški scenariji

1. Uporabnik odpre ali deli povezavo do projekta z iskalno frazo, statusom in vrstnim redom; rezultat je takoj viden v izbranem načinu.
2. Uporabnik pripravi filter, ga potrdi in se z brskalniško zgodovino vrne na prejšnji potrjeni prikaz.
3. Uporabnik zamenja preglednico in tablo, odpre opravilo, ga zapre ali izbere drug projekt; pravila ohranijo ali ponastavijo filtre glede na vrsto navigacije.
4. Uporabnik ponastavi filter ali dobi prazen rezultat; kontrolniki, URL in števec odražajo potrjeno stanje.

## Merila uspeha

- Vsak R01–R12 izpolnjuje ustrezni preverljivi pogoj v zgornji tabeli.
- Neposreden vstop, potrjevanje, ponastavitev, sprememba pogleda/projekta/podrobnosti in Nazaj/Naprej dajejo predpisano stanje `F`, `D` in `V`.
- Preglednica in tabla kažeta iste filtrirane ID-je; iskanje, status in stabilno razvrščanje ustrezajo predikatom.
- Obvezna slovenska imena, dostopne oznake, prazen rezultat in števec so prisotni; stran ostane prilagodljiva pri 390 px.
- Nobeno dejanje filtra ne povzroči zapisovalnega API-klica ali odvisnosti od `localStorage`/`/__test/`; obstoječa regresijska vedenja ostanejo.

## Izvedba in sledljivost

Spodnja področja kode so predvidene točke integracije, določene z branjem izhodišča; niso dokaz implementacije. Scenariji so načrt preverjanja po izvedbi. V fazi specifikacije implementacija in testi niso bili izvedeni, zato je vsak izid **še nepreverjen**. Po izvedbi tabelo dopolni z dejanskimi testnimi imeni, rezultati in določljivim dokazom.

| Zahteva | Pogoj | Test ali scenarij | Predvidena datoteka in del kode | Izid ter dokaz |
| --- | --- | --- | --- | --- |
| R01 | Parametri fragmenta določijo filtre ob vstopu. | Neposredna povezava za projekt/opravilo. | `src/navigation.ts` razčlenitev; `src/App.tsx` izbira prikaza. | Še nepreverjeno; test ni izveden. |
| R02 | Dobesedni normalizirani podniz v enem od štirih polj. | Unicode, ločila in zadetek po poljih. | `src/App.tsx` filtriranje ali namenski pripomoček v `src/`. | Še nepreverjeno; test ni izveden. |
| R03 | IN-status, trije vrstni redi, stabilne vezi. | Status + fraza; naslovi in izvorni vrstni red. | `src/App.tsx`; isti seznam za `src/TaskBoard.tsx`. | Še nepreverjeno; test ni izveden. |
| R04 | Varno razčlenjevanje in brez samodejnega prepisovanja. | Neznani/podvojeni parametri. | `src/navigation.ts`. | Še nepreverjeno; test ni izveden. |
| R05 | Osnutek je ločen; potrditev doda največ eno stanje. | Urejanje brez potrditve, nato Apply. | `src/App.tsx`, `src/navigation.ts`. | Še nepreverjeno; test ni izveden. |
| R06 | Kanonični URL, ohranjen board, brez podvojenega stanja. | Potrditev z znaki, privzetimi in neznanimi parametri. | `src/navigation.ts`; kontrole v `src/App.tsx`. | Še nepreverjeno; test ni izveden. |
| R07 | Zgodovina in osvežitev povrneta `F`, prikaz in `D`. | Nazaj/Naprej, reload po več potrditvah. | `src/navigation.ts`, `src/App.tsx`. | Še nepreverjeno; test ni izveden. |
| R08 | Pogleda ohranita filtre/ID-je, navigacija zavrže osnutek. | Preklop v obe smeri z osnutkom. | `src/App.tsx`, `src/navigation.ts`, `src/TaskBoard.tsx`. | Še nepreverjeno; test ni izveden. |
| R09 | Podrobnost ohrani potrjene filtre in način. | Enaki naslovi; zaprtje gumb/Escape. | `src/TaskDetails.tsx`, `src/navigation.ts`, povezave v `src/App.tsx`/`src/TaskBoard.tsx`. | Še nepreverjeno; test ni izveden. |
| R10 | Klik projekta ponastavi filtre, neposredna povezava jih upošteva. | Preklop projekta v obeh pogledih. | Povezave in izbira poti v `src/App.tsx`, `src/navigation.ts`. | Še nepreverjeno; test ni izveden. |
| R11 | Reset potrdi privzete vrednosti; števec in prazno stanje sta pravilna. | Reset pri spremembi in brez spremembe; prazni seznami. | `src/App.tsx`, `src/styles.css`. | Še nepreverjeno; test ni izveden. |
| R12 | Samo branje, brez lokalne/testne shrambe; regresije ostanejo. | Pregled omrežja/shrambe, obstoječi in agentni UI testi. | `src/App.tsx`, `src/api.ts`, `src/TaskDetails.tsx`, `src/styles.css`. | Še nepreverjeno; testi niso izvedeni. |

## Odprta vprašanja in omejitve

Vsebinska vprašanja, potrebna za izdelavo specifikacije, so določena v zahtevah in skupnih pravilih; dodatne funkcionalnosti niso predpostavljene. Besedilo kontrol in način pogleda, ki sta določena v zahtevah, sta obvezna; druge razporeditvene podrobnosti ostajajo oblikovalska odločitev znotraj Folio. Prva pojavitev podvojenega filtra velja; začetno razčlenjevanje ohrani izvirni URL. Če je efektivno potrjeno stanje enako, kanonizacija ne ustvari novega zgodovinskega stanja.

Končni razvojni testi niso vključeni v to fazo in v tem koraku niso bili zagnani. Po implementaciji je treba preveriti R01–R12 z agentnimi scenariji ter obstoječimi skupnimi preverjanji, rezultate pa zabeležiti brez označevanja neizvedenih testov kot uspešnih. Testi, ki spreminjajo podatke med nedokončanim nalaganjem ali brez osvežitve, ostajajo izrecno zunaj dodatnega obsega.
