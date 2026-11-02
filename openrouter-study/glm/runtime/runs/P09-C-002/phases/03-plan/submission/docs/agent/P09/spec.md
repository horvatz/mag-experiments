# P09: Stanje pogleda v povezavi in zgodovini

## Problem in kontekst

Folio trenutno omogoča pregled opravil projekta v preglednici ali tabli, odpiranje podrobnosti in nalaganje podatkov prek javnega API-ja. Uporabnik še ne more shraniti filtrov v povezavo, jih deliti, uporabiti brskalnikove zgodovine ali ohranjati potrjenega stanja pri navigaciji.

Funkcija P09 doda tri kontrole za povezavo (`q`, `status`, `order`), osnutek, ki se potrdi kot enota, ter dosledno uporabo parametrov v URL-fragmentu za projektno pot in pot opravila. Ohranja se potrjen dizajn Folio, slovenska poimenovanja, dostopnost, obstoječi API in obstoječe obnašanje nalaganja, neznane poti in podrobnosti.

## Vhodi, dejanja in izidi

Relevantni vnosi so:

- `q`: ena dobesedna fraza za iskanje po `title`, `description`, `assignee` ali `id`.
- `status`: `all`, `todo`, `in_progress` ali `done`; privzeto `all`.
- `order`: `original`, `title-asc` ali `title-desc`; privzeto `original`.
- `view`: obstoječa vrednost `table` ali `board`; privzeto `table`.
- `taskId`: obstoječi identifikator opravila v poti opravila.

Dejanja:

- Spremeni katero koli od treh kontrol za povezavo; to spremeni samo osnutek.
- Klikni `Uporabi pogled`; to atomarno potrdi `q`, `status` in `order`.
- Klikni `Ponastavi pogled`; to potrdi prazno iskanje ter privzeti stanje in vrstni red.
- Uporabi preklop `Preglednica`/`Tabla`, linke projektov, linke opravil, gumb za zapiranje podrobnosti ali tipko `Escape`.
- Uporabi Nazaj/Naprej ali osvežitev brskalnika.

Uspešno stanje: URL v query delu fragmenta vsebuje le relevantne, veljavne in potrjene parametre; prikaz, osnutek kontrol, števec in morebitna podrobnost se ujemajo s tem URL-jem. Prazen rezultat prikaže `Ni zadetkov.` in števec `Prikazano: N od M.`

Preklic ali napaka: sprememba kontrol pred potrditvijo ne spremeni prikaza ali URL-ja. API-napaka ohrani obstoječe prikazovanje napake in ponovni poskus; ne ustvari prikazov iz lokalnega stanja. Nobeno dejanje ne spremeni podatkov, ne pošlje zapisovalnega zahtevka in ne shranjuje stanja v `localStorage`.

## Zahteve in pravila

Simboli:

- `normalize(x)` pomeni `x.trim()`, razstavitev NFD, odstranitev znakov `U+0300` do `U+036F` in pretvorbo v male črke.
- `query` pomeni potrjen `q` po `normalize`.
- `matches(task)` pomeni, da je `query` podniz vsaj enega izmed normaliziranih polj `title`, `description`, `assignee`, `id`.
- `statusMatches(task)` pomeni `status = all` ali `status = task.status`.
- `compareTitle(a, b)` primerja normalizirana naslova po UTF-16; pri izenačenju velja izvorno zaporedje.
- `confirmed` je stanje razčlenjeno iz URL-ja; `draft` so trenutne vrednosti treh kontrol.
- `visible` so opravila trenutnega projekta po `matches ∧ statusMatches`, nato urejena po `order`.

| Zahteva | Pravilo oziroma sprejemni pogoj | Način preverjanja |
| --- | --- | --- |
| R01 | Za pot projekta ali opravila velja `confirmed = {q, status, order}` iz query dela URL-fragmenta. Privzete vrednosti so `q = ""`, `status = all`, `order = original`. Ob inicializaciji in vsaki spremembi URL-ja se `visible`, prikaz in `draft` takoj uskladijo s `confirmed`, brez dodatnega klika. | Neposredno odpri povezavo s parametri v obeh poteh in preveri prikaz, kontrole in števec. |
| R02 | `q` se ne razdeli na besede in se ne obravnava kot regularni izraz. Velja `query = normalize(q)`; kontrola lahko prikaže izvorno vrednost, iskanje pa uporabi `query`. `matches(task)` je dovolj, če fraza zadeti katero koli od štirih polj. | Preveri frazo z presledki in ločili, Unicode in ločilniki, opisom, odgovorno osebo, ID-jem ter vrednostjo, ki bi bila kot regularni izraz drugačna. |
| R03 | `status` ima domeno `all|todo|in_progress|done`; `order` ima domeno `original|title-asc|title-desc`. Filtri se združijo po `matches ∧ statusMatches`. Urejanje uporabi `compareTitle`; ob izenačenju ostane izvorno zaporedje. | Preveri veljavne kombinacije z reprezentativnimi nabori, vključno z enakimi naslovi in Unicode. |
| R04 | Pri ponovljenem parametru velja prva vrednost. Neznana vrednost `status` ali `order` ter neznani parametri ne vplivajo na prikaz. Samo razčlenjevanje URL-ja ne povzroči prepisovanja URL-ja. | Preveri podvojene, neveljavne in dodatne parametre ter stabilnost URL-ja po nalaganju. |
| R05 | Sprememba vsake kontrole nastavi samo `draft`; `confirmed`, `visible` in URL se ne spremenijo. `Uporabi pogled` potrdi vse tri vrednosti hkrati. Nov zgodovinski vnos nastane samo, če se `confirmed` spremeni. | Spremeni več kontrol in preveri prikaz in URL pred potrditvijo, izid po potrditvi ter zgodovino. |
| R06 | Ob potrditvi se `q` obreže. Parametri s privzeto vrednostjo se izpustijo; preostali se URL-kodirajo. Obstojeci `view=board` se ohrani, neznani parametri se odstranijo. Enaka potrditev ne doda novega zgodovinskega vnosa. | Preveri kodirane vrednosti, izpust privzetih, ohranitev `view`, odstranjevanje dodatkov in dolžino zgodovine. |
| R07 | Brskalnikova Nazaj/Naprej povrne prejšnji `confirmed`, ustrezni `visible` in `draft`. Osvežitev ponovno razčleni trenutni URL in ohrani potrjeno stanje, tudi v načinu `board`. | Preveri zaporedje potrditev, navigacijo po zgodovini in osvežitev v obeh pogledih. |
| R08 | Preklop `Preglednica`/`Tabla` ohrani veljavne parametre `q`, `status`, `order` in prikaže iste ID-je v isti izbiri. Vsaka navigacija zavže nepotrjen `draft` in ga uskladi z URL-jem. | Spremeni osnutek, preklopi pogled in preveri URL, prikaz, kontrole in ID-je. |
| R09 | Povezava na opravilo ohrani `view` ter veljavne parametre `q`, `status`, `order`. Odpiranje, zapiranje z gumbom ali `Escape` ne spremeni teh parametrov niti izbire ID-ja. Enaki naslovi ne povzročijo napačne izbire. | Preveri podrobnosti v filtrirani preglednici in tabi, zapiranje z gumbom ali Escape ter opravili z enakim naslovom. |
| R10 | Klik na projekt v navigaciji začne njegov privzeti pogled (`q = ""`, `status = all`, `order = original`) in ohrani trenutni `table`/`board`. Neposredna povezava do projekta s parametri jih upošteva. | Preveri preklop iz filtriranega projekta v oba načina in neposredno povezavo s parametri. |
| R11 | `Ponastavi pogled` nastavi `q = ""`, `status = all`, `order = original`, zavže osnutek in posodobi zgodovino po enakem pravilu kot potrditev; ohrani trenutni `view`. Če je `visible` prazen, se prikaže `Ni zadetkov.` Števec prikaže `Prikazano: N od M.`, kjer je `N = |visible|` in `M` število vseh opravil trenutnega projekta. | Preveri reset iz filtriranega stanja, prazen rezultat, števec za 0, 1 in več opravil ter zgodovino. |
| R12 | Nobeno dejanje ne pošlje zapisovalnega zahtevka na `/api/`, ne spremeni strežniških podatkov in ne uporabi `localStorage` ali `/__test/`. Obstoječa neznana pot, nalaganje, napaka, ponovni poskus, podrobnosti in Folio prilagodljivost ostanejo delovati. | Preveri odsotnost zapisov in testnih klicev, ohranitev obstoječih stanj ter obnašanje na širini 390 px. |

Pravila spremembe stanja:

1. Ob inicializaciji ali `hashchange` razčleni trenutni fragment v pot in potrjene parametre; nastavi `draft = confirmed`; nepotrjen osnutek iz prejšnjega prikaza se zavže.
2. Vnos v kontrolo spremeni samo `draft`.
3. `Uporabi pogled` tvori nov URL iz poti, ohranjenega `view`, očiščenega `q` in veljavnih neprivzetih `status`/`order`. Če se URL spremeni, ustvari en nov zgodovinski vnos; sicer zgodovine ne spremeni.
4. `Ponastavi pogled` uporabi enako pravilo s privzetimi vrednostmi filtrov in ohranjenim `view`.
5. Prikaz se vedno izračuna iz `confirmed`, nikoli iz `draft`; `draft` se uporabi šele po potrditvi ali ob uskladitvi z novim URL-jem.

## Izvedba in sledljivost

Načrtovana izvedbeni prostor sta razčlenjevanje in sestavljanje URL-jev v `src/navigation.ts` ter potrditev filtrov, izračun prikaza, kontrole in navigacijska integracija v `src/App.tsx`. Če izvedba utegne boljšo ločitev, se lahko stanje prestavi v novo datoteko v `src/`; to ne pomeni nove funkcionalne zahteve.

| Zahteva | Pogoj | Test ali scenarij | Datoteka in del kode | Izid ter dokaz |
| --- | --- | --- | --- | --- |
| R01–R12 | Vsi sprejemni pogoji iz tabele zgoraj | Lastni Playwright-scenariji v `tests/agent/P09.spec.ts` skupaj z obstoječimi testi izhodišča | `src/navigation.ts`, `src/App.tsx` in morebitne pomožne datoteke v `src/` | V tej fazi specifikacije še ni spremembe kode niti izvedenega testa; izida ne smemo označiti za uspešnega. |

## Odprta vprašanja in omejitve

Ni znanih nepogodljivih nejasnosti. Izvirne zahteve iz `task/instructions.md` so merilo. Predpostavke so: iskalni niz se v kontroli lahko prikaže neobrezan, dokler ga uporabnik ne potrdi; števec šteje opravila trenutnega projekta; in URL-fragment ohranja obstoječo obliko poti. Nerešenih podatkov ni treba izmisliti.

Nepreverjeno v tej fazi: izvedba, tipična preverjanja, lint, build in Playwright-testi. Testne kontrole `/__test/` so izključno namenjene testom; uporabniški vmesnik jih ne sme uvoziti ali klicati.
