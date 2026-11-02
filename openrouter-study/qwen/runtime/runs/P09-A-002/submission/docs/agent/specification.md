# Specifikacija P09: Stanje pogleda v povezavi in zgodovini

## Problem in kontekst

Uporabnik potrebuje funkcionalnost za sledenje stanju projekta in opravil skozi povezave. Trenutno delovanje Folio aplikacije omogoča pregled opravil, a ni podpira naprednega filtriranja in sledenja zgodovini stanja pogleda. Pričakovana sprememba vključuje dodajanje kontrol za iskanje (q), status in vrstni red, ter sledenje sprememb stanja pogleda v zgodovino.

## Vhodi, dejanja in izidi

### Podatkovna polja
| Polje | Vrsta | Možne vrednosti |
| --- | --- | --- |
| q | string | Dobesedna fraza (normalizirana za iskanje) |
| status | string | all/todo/in_progress/done |
| order | string | original/title-asc/title-desc |
| view | string | board/list (obstojen parameter) |
| project_id | string/number | ID projekta |

### Dejanja
1. Odpiranje povezave z parametri (URL-fragment)
2. Spreminjanje v kontrolah (osnutek)
3. Potrditev pogleda (Uporabi pogled)
4. Ponastava pogleda (Ponastavi pogled)
5. Navigacija v brskalniku (Nazaj/Naprej)
6. Sprememba načina pogleda (Preglednica/Tabla)
7. Odpiranje podrobnosti opravila

### Pričakovano stanje po uspehu
- Stanje pogleda shranjeno v lokalno memo (ne localStorage)
- URL odraža aktivne parametre
- Osnutek upošteva spremembe pred potrditvijo
- Zgodovina sledi potrditvam pogledov

### Pričakovano stanje pri preklicu
- Preklic preglednice vrne v prejšnje stanje pogleda
- Preklic podrobnosti shrani parametre

### Pričakovano stanje pri napaki
- Neznani status/order pomeni privzeto vrednost
- Neznani parametri ne vplivajo na prikaz
- Prazen iskalni vprašalk vrne vse rezultate

## Zahteve in pravila

| Zahteva | Pravilo oziroma sprejemni pogoj | Način preverjanja |
| --- | --- | --- |
| R01 | Stanje pregleda določeno s parametri q, status, order v query delu URL fragmenta za obstoječo pot projekta. Privzeto je q prazen, status all, order original. | Testiranje ob odprtju povezave brez parametrov in z različnimi parametri |
| R02 | q je ena dobesedna fraza: trim zunanjih belin, NFD, odstranitev U+0300–U+036F in male črke za iskanje po title, description, assignee ali id. Fraza mora biti podniz vsaj enega polja. | Testiranje normalizacije z different Unicode kodi in specialnimi znaki |
| R03 | status podpira all/todo/in_progress/done in deluje skupaj z q po IN. order je original/title-asc/title-desc; naslov se primerja po isti normalizaciji in UTF-16, ob izenačenju ostane izvorni vrstni red. | Testiranje kombiniranih filtrov in vrstnega reda |
| R04 | Neznana vrednost status/order pomeni privzeto vrednost. Pri ponovljenem parametru velja prva pojavitev. Neznani parametri ne vplivajo na prikaz. Razčlenjevanje ne povzroči samodejnega prepisovanja URL-ja. | Testiranje neveljavnih vrednosti in večkratnih parametrov |
| R05 | Spreminjanje treh kontrol ureja osnutek in še ne spremeni prikaza或直接ne URL-ja. Gumb Uporabi pogled potrdi vse tri vrednosti hkrati in ustvari eno novo zgodovinsko stanje, če se potrjeno stanje spremeni. | Testiranje sprememb kontrol brez potrditve in s potrditvijo |
| R06 | Pri potrditvi se q obreže, privzeti parametri izpustijo, preostali pravilno URL-kodirajo. Obstoječi view=board se ohrani, neznani parametri se odstranijo. Ponovitev enake potrditve ne doda novega zgodovinskega stanja. | Testiranje URL konstrukcijo po potrditvi in enkratnosti zapisov v zgodovini |
| R07 | Nazaj in Naprej v brskalniku obnovita potrjene filtre, prikaz in osnutek kontrol. Osvežitev ohrani potrjeno stanje iz URL-ja. | Testiranje browser history API in refresh |
| R08 | Preklop Preglednica/Tabla ohrani potrjene parametre in prikaže iste ID-je. Nepotrjen osnutek se ob vsaki navigaciji zavrže. | Testiranje preklopa pogledov z aktivnimi filtri |
| R09 | Odpiranje podrobnosti in zapiranje z gumbom ali Escape ohranita potrjene parametre in način pogleda. Povezava do pravilnega ID-ja deluje tudi pri enakih naslovih. | Testiranje navigacije v podrobnosti in nazaj |
| R10 | Klik na drugi projekt začne njegov privzeti pregled (q prazen, status all, order original) in ohrani table/board. Neposredna povezava do drugega projekta s parametri pa jih upošteva. | Testiranje klika na drug projekt in neposrednih povezav |
| R11 | Gumb Ponastavi pogled počisti tri filtre in osnutek ter posodobi zgodovino po istem pravilu kot potrditev; obdrži trenutni način pogleda. Prazen rezultat pokaže Ni zadetkov.; števec kaže Prikazano: N od M.. | Testiranje ponastave in obdelave praznih rezultatov |
| R12 | Nobeno dejanje ne spremeni podatkov ali pošlje zapisov na API. Stanje ni v localStorage. Delujejo obstoječa neznana pot, nalaganje, podrobnosti in prilagodljiv videz Folio. | Testiranje izolovanosti stanja in združljivosti obstoječe funkcionalnosti |

## Izvedba in sledljivost

| Zahteva | Pogoj | Test ali scenarij | Datoteka in del kode | Izid ter dokaz |
| --- | --- | --- | --- | --- |
| R01 | Stanje se naloži iz URL parametrov ob odprtju | Odprtje različnih povezav | src/components/View*.tsx | URL se naloži v stanje komponente |
| R02 | Normalizacija iskalne fraze | Unicode črke z različnim kodifikacijo in beline | tests/agent/ | q vsebuje samo črke in števila |
| R03 | Filteri delujejo skupaj in pravilno po vrstnem redu | Comboc filtrov | tests/agent/ | Rezultati ustrezajo pogojem |
| R04 | Neznani parametri ignorirani, ponovljeni zavrnejo | Neveljavni vstavljeni v URL | tests/agent/ | Privzete vrednosti se uporabijo |
| R05 | Spreminjanje kontrol ne spremeni URL, update spremenite stanje | Input event | tests/agent/ | URL ostane enak |
| R06 | Potrditev pravilno kodira samo aktivne parametre | Click Uspešnem pogledu | tests/agent/ | URL upravičen |
| R07 | Browser history API deluje za navigacijo | Back/Forward/Refresh | tests/agent/ | Stanje se obišče iz zgodovine |
| R08 | Preklop pogledov ohrani parametre | Toggle View | tests/agent/ | Eni ID-ji prikazani |
| R09 | Navigacija v podrobnosti ohrani stano | Detail modal | tests/agent/ | Parametri ostanejo ohranjeni |
| R10 | Klek na projekt resetira parametre | Project item click | tests/agent/ | Privzeti parametri se naložijo |
| R11 | Resetna tlačno gumba očisti filters | Click Reset View | tests/agent/ | Vsi filtri so počiščeni |
| R12 | Stanje v memo, ne localStorage | State checking | tests/agent/ | localStorage čist, memo vsebuje |

## Odprta vprašanja in omejitve

| Omejitev | Razlaga |
| --- | --- |
| Neznana pot | Preveriti delovanje z nizkim ID-jev in praznimi rezultati |
| Performance | Testirati z več kot 100 opravil |
| Specialni znaki | Testirati z različnimi Unicode znaki |
| View param | Prepričati se o ohranitvi view parametra ob potrditvi |

## Kratk pregled popravkov

- Dodajte state management za pogled z memo (src/store/view.js)
- Dodajte filter komponente za q, status, order
- Dodajte zgodovino pogledov z enotnim zapisom
- Dodajte potrditvene gumbe z ustrezno logiko
- Dodajte navigacijo v zgodovini
- Dodajte reset funkcionalnost
