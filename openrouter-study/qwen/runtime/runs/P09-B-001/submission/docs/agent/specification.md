# Specifikacija: Pregled stanj opravila
## Problem in kontekst

Ustvarja se nov pogled v povezavi za obstojece projekte/opravila, ki omogoca filter za iskanje po q, stanje (status) in vrstni red (order). Stanje se shrani z zgodovinskim zapisom in omogoca navigacijo. Postopek predaj. Ne spremeni API-ja.

## Vhodi, dejanja in izidi

### Vhodi

- URL fragment: "?q= fraza&status=vrednost&order=vrednost&view=board|list"
  - q: NDF-normalizirana iskalna fraza
  - status: all|todo|in_progress|done
  - order: original|title-asc|title-desc
  - view: board|list
- Osnutek: trije inputi za q, status, order

### Dejanja

- Odprtje povezave
- Spreminjanje osnutka (neavtomatsko)
- Potrditev pogleda (Uporabi pogled)
- Ponastava (Ponastavi pogled)
- Navigacija (Nazaj/Naprej, osvežitev)
- Klik na projektne elemente

### Izidi

- Prikaz filtriranega seznama opravil
- Zgodovinski zapis potrjenih stanj
- Aktualiziran URL ob potrditvi

## Zahteve in pravila

| Zahteva | Pravilo oziroma sprejemni pogoj | Način preverjanja |
| --- | --- | --- |
| R01 | Stanje se določi iz q, status, order v URL za projekt. Privzeto: q="", status=all, order=original. Odprtje avtomatsko uporabi stanje. | Prikaz filtriranja ob odprtju. |
| R02 | q se trimuje, NDF, odstranijo U+0300-U+036F in male črke. Primerjavo z title, description, assignee ali id brez regex-a; mora biti podniz. | Vsebinsko preskuša iskalnik. |
| R03 | status podpira all/todo/in_progress/done skupaj z q (IN). order podpira original/title-asc/title-desc, UTF-16+ normalizacija ob ohranjanju izvornega reda. | Preverjanje filtriranja in urejanja. |
| R04 | Neznani status/order pomeni privzeto. Ponovni parameter velja prvi. Neznani parametri ne vplivajo. Razčlenjevanje ne spremeni URL dokler se ne potrdi. | Preznavljanje URL in preskus. |
| R05 | Spreminjanje osnutka ne spremeni prikaza ali URL. Gumb Uporabi pogled potrjuje vse tri vrednosti hkrati in ustvari novo zgodovinsko stanje ob spremembi. | Preskusa pred in po potrditvi. |
| R06 | Potrditev: q se obreže, privzeti parametri izpustijo, URL pravilno kodira. Neznani parametri odstranijo. Ponovitev enakega stanja ne doda zgodovine. | URL preverjanje. |
| R07 | Nazaj/Naprej obnovita potrjene filtre, prikaz in osnutek. Osvežitev ohrani potrjeno stanje iz URL. | Navigacija med pogledi. |
| R08 | Preglednica/Tabla ohranita parametre; nepotrjeni osnutek se zavrže ob navigaciji. | Pregledtaba/Lista skener. |
| R09 | Podrobnosti/zapiranje obdržita filtre in način pogleda. Povezava pravilno ID deluje. | Preskusa ID v pogledu. |
| R10 | Drugi projekt začne privzet pregled; neposredna povezava s parametri upošteva in ohrani način pogleda. | Sprememba projekta. |
| R11 | Ponastava čist filterje in osnutek, zgodovina posodobi po pravilu kot potrditev; način pogleda ostane. Rezultat: Ni zadetkov, Prikazano: N od M. | Preverjanje reset. |
| R12 | Nobeno dejanje ne spremeni podatkov ali pošlje na API. Stanje ni v localStorage. Delujejo: neznani pot, nalaganje, podrobnosti. | Delovanje API. |
