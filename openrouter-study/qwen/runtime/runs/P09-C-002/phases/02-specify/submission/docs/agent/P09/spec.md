# Specifikacija - Stanje pogleda v povezavi in zgodovini (P09)

## Problem in kontekst

Uporabniki želijo prilagodljiv pregled opravil z možnostmi iskanja, filtriranja po statusu (
all/todo/in_progress/done) in vrstnega reda (original/title-asc/title-desc). Funkcionalnost mora
delovati v brskalniku prek obstoječega vmesnika Folio. Odprtje povezave z URL-parametri
neposredno uporabi stanje pogleda; spremembe hranijo zgodovino, ne prikazov. Aplikacija
bere podatke iz obstoječega javnega API-ja /api/ in ne sme brati testnih kontrol
/__test/ ali posredovati podatke na API.

## Vhodi, dejanja in izidi

| Parameter | Opis | Privzeta vrednost | Dovoljena vrednosti |
| --- | --- | --- | --- |
| q | Iskalna fraza (dobesedna) | "" | Več kot prazno, poenostavljeno z trim in NFD |
| status | Filter po statusu | all | all/todo/in_progress/done |
| order | Vrstni red | original | original/title-asc/title-desc |
| view | Način prikaza | board (obhranjen pri potrditvi) | table/board |

Dejanja:
- Odprtje povezave: uporabi parametre iz URL (privzete, če manjkajo).
- Priprava osnutka: spremembe v kontrolah ne spremenijo prikaza ali URL-ja.
- Potrditev: zapiše novo zgodovinsko stanje in URI.
- Odpiranje podrobnosti/zapiranje: ohrani filtri in način pogleda.
- Navigacija med projekti: novi projekt dobi privzet pregled, način pogleda ohrani.

Izid: uspešen prikaz zadetkov s števcem Prikazano: N od M..; pripravljenih je enostavno
ponastavljanje vseh filtrov in obnavljanje zgodovine.

## Zahteve in pravila

| Zahteva | Pravilo oziroma sprejemni pogoj | Način preverjanja |
| --- | --- | --- |
| R01 | Stanje pregleda je določeno s parametri q, status, order v query delu URL fragmenta za obstoječo pot projekta ali opravila. Privzeto je q="", status=all, order=original. Ob neposrednem odprtju povezave se stanje uporabi. | Odprtje povezave z `#/projects/web` uporabi stanje; brez parametrov so privzete vrednosti |
| R02 | `q` je ena dobesedna fraza: trim zunanjih belin, NFD, odstranitev U+0300–U+036F in male črke za iskanje po title, description, assignee ali id. Fraza mora biti podniz vsaj enega polja; ni regularni izraz in se ne razdeli v besede. | Iskanje "IZGUBA" vrne opravila z "izguba" v poljih; presledki, črke in diakritiki se normalizirajo |
| R03 | `status` podpira all/todo/in_progress/done in deluje skupaj z `q` po IN. `order` je original/title-asc/title-desc; naslovi se primerjajo po isti normalizaciji in UTF-16, ob izenačenju ostane izvorni vrstni red. | Filtriranje po IN: "test" vrne vsa opravila s statusom todo, ki vsebujejo "test"; naslovi se primerjajo sorazmerno in UTF-16 |
| R04 | Neznana vrednost status/order pomeni privzeto vrednost. Pri ponovljenem parametru velja prva pojavitev. Neznani parametri ne vplivajo na prikaz. Razčlenjevanje ne povzroči samodejnega prepisovanja URL-ja. | `status=foo` in `order=bar` se ignorirata; neznani parametri se odpravijo |
| R05 | Spreminjanje treh kontrol ureja osnutek in še ne spremeni prikaza ali URL-ja. Gumb Uporabi pogled potrdi vse tri vrednosti hkrati in ustvari eno novo zgodovinsko stanje, če se potrjeno stanje spremeni. | Spremenjaj kontrole: URL ostane enak; klik na potrditev zapiše zgodovinsko stanje |
| R06 | Pri potrditvi se q obreže, privzeti parametri izpustijo, preostali pravilno URL-kodirajo. Obstoječi view=board se ohrani, neznani parametri se odstranijo. Ponovitev enake potrditve ne doda novega zgodovinskega stanja. | Potrditev zapiše q="test" in status="todo", ne dodaja novih parametrov |
| R07 | Nazaj in Naprej v brskalniku obnovita potrjene filtre, prikaz in osnutek kontrol. Osvežitev ohrani potrjeno stanje iz URL-ja. | Navigacija nazaj-naprej in osvežitev ohranita filtre |
| R08 | Preklop Preglednica/Tabla ohrani potrjene parametre in prikaže iste ID-je. Nepotrjen osnutek se ob vsaki navigaciji zavrže. | Preklop ohrani filtri in prikazuje iste ID-je; osnutke se zavrne |
| R09 | Odpiranje podrobnosti in zapiranje z gumbom ali Escape ohranita potrjene parametre in način pogleda. Povezava do pravilnega ID-ja deluje tudi pri enakih naslovih. | Pregled in zapiranje ohranita parametre |
| R10 | Klik na drugi projekt začne njegov privzeti pregled (q prazen, status all, order original) in ohrani table/board. Neposredna povezava do drugega projekta s parametri pa jih upošteva. | Klik na drug projekt resetira filtre; direktna povezava upošteva parametre |
| R11 | Gumb Ponastavi pogled počisti tri filtre in osnutek ter posodobi zgodovino po istem pravilu kot potrditev; obdrži trenutni način pogleda. Prazen rezultat pokaže Ni zadetkov.; števec kaže Prikazano: N od M.. | Gumb očisti vrstice; prikaže "Ni zadetkov" in števec 0 od M |
| R12 | Nobeno dejanje ne spremeni podatkov ali pošlje zapisov na API. Stanje ni v localStorage. Delujejo obstoječa neznana pot, nalaganje, podrobnosti in prilagodljiv videz Folio. | Nobena akcija ne pošilja na /api/ ali /__test/; stanje je lokalno |
