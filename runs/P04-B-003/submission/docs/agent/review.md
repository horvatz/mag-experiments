# Neodvisni pregled P04

Pregled je končan. Primerjava izvirnih zahtev R01–R12 s specifikacijo, končno kodo, testi in `verification.md` ni pokazala konkretne napake. Spremembe specifikacije ali implementacije niso zahtevane.

Pregledovalec je sam prebral navodila in predlogo, specifikacijo ter njeno zgodovino, relevantno kodo `src/`, oba lastna testa, razvojne teste s pripomočki, dnevnik `check.log`, meritve `visual-results.json` ter opis potrjenega dizajna. Vizualno je pregledal vse štiri predane posnetke preglednice in table pri 1440 in 390 pikah. Pisal je samo `review.json` in ta dokument. Drugi agenti niso bili zagnani.

## Primerjava zahtev

Spodaj je neodvisna ocena kode in dokazil. Navedeni uspešni zagoni testov pripadajo implementerju, ne pregledovalcu.

| Zahteva | Neodvisno pregledano pravilo in koda | Pregledana testna dokazila | Ugotovitev |
| --- | --- | --- | --- |
| R01 | `defaultTaskSort` določa original/asc/none/asc; `sortTasks` za original vrne kopijo vhodnega zaporedja. | D01 in S03/S04/S06 preverita zaporedje ter štiri kontrole. | Brez odstopanja. |
| R02 | `normalize` zaporedno izvede NFD, odstrani samo U+0300–U+036F in pretvori v male črke; `compare` uporablja `<` in `>`. | S01 za naslov in osebo vključuje Unicode, številke v besedilu, ločila, ohranitev U+1AB0 in UTF-16. | Brez odstopanja. |
| R03 | Rang statusov je todo/in_progress/done. Leksikografska primerjava zagotovljenih datumov YYYY-MM-DD je kronološka. | S01 statusi, prehod leta in prestopni dan; D02/D03. | Brez odstopanja. |
| R04 | Smer množi samo izid posamezne primerjave; končni izvorni indeks se ne obrača. | S01 desc in S02 vse štiri kombinacije smeri z enakostmi. | Brez odstopanja. |
| R05 | Sekundarna veja se izvede šele po primarni enakosti; none vrne nič; smer je ločena. Kontrole vključujejo vse zahtevane možnosti. | Pet S02 scenarijev za vse sekundarne ključe ter D02. | Brez odstopanja. |
| R06 | Dvojna enakost se razreši po izvornem indeksu. Isti ključ je dovoljen. Zgodnja veja original prezre ostale kontrole. | S02 isti ključ, nasprotni smeri, dvojne enakosti in original; S05/S06 kombinacije. | Brez odstopanja. |
| R07 | `ProjectView` uporablja isto `sortedTasks` za preglednico in tablo; `TaskBoard` filtrira po treh stalnih stolpcih. | D03 in S03/S04/S06 za vse stolpce in njihovo zaporedje. | Brez odstopanja. |
| R08 | Stanje je v `ProjectView`; pogled in podrobnosti spremenijo njegove lastnosti, ne identitete komponente. | S03/S04/S06 preklopi oba pogleda, odpira enako naslovljena opravila ter zapira z gumbom in Escape. | Brez odstopanja. |
| R09 | `key={project.id}` ponastavi stanje ob menjavi projekta; nov zagon uporabi privzete vrednosti. Razvrščanje ne uporablja URL-ja ali shrambe. | S03/S04/S06 menjava in vrnitev projekta, osvežitev obeh pogledov ter nespremenjen URL in shramba. | Brez odstopanja. |
| R10 | Gumb poda kopijo vseh štirih privzetih vrednosti. Kontrole so prikazane tudi za prazno polje; projekcija podpira 0/1 elementov. | D04, S05 UI in S05/S06 vseh 100 kombinacij čiste funkcije za 0/1 opravil. | Brez odstopanja. |
| R11 | Sortira se novo polje parov opravilo/indeks; objekti ostanejo isti. Povzetki izhajajo iz vhodnih opravil. Sprememba kontrol kliče samo `setSort`. | Zamrznjeni vhodi 0/1/17, ohranitev ID-jev in referenc; UI spremlja zapise, števila in pripadnost stolpcem. | Brez odstopanja. |
| R12 | React ključi, `data-task-id`, povezave in GET podrobnosti temeljijo na ID-jih. Imena pogledov/stolpcev ter ARIA povzetek ostajajo. Slogi uporabljajo Folio spremenljivke in notranje drsenje. | S03/S04/S06 s 14 enakimi naslovi in različnimi ID-ji, osnovni regresijski testi, štirje posnetki ter meritve širine. | Brez odstopanja. |

Specifikacija pokrije vseh dvanajst izvirnih zahtev, dogovor o kontrolah, domeno podatkov in omejitve obsega. Njeni predikati primerjalnika, stabilnosti, projekcije in prehodov stanja so skladni z zahtevami. Jasno ločuje predlagane teste od izvedenih. Končno sledljivost na implementacijo in izvedene teste dopolnjuje implementerjev `verification.md`, kot dopušča skupna predloga.

## Dokazila in omejitve

Pregledani `docs/agent/check.log` navaja uspešne ESLint, TypeScript, gradnjo Vite in 59/59 testov (38 osnovnih, 8 razvojnih P04 in 13 lastnih). Imena testov se ujemajo s testnimi viri in matriko v `verification.md`. Pregledovalec teh ukazov ni ponovno zagnal: pregled ni odkril konkretnega razloga za ponovitev. Uspeh zagona je zato pripisan predanim dokazilom implementerja.

Pregledovalec je sam vizualno pregledal `visual-1440-table.png`, `visual-1440-board.png`, `visual-390-table.png` in `visual-390-board.png`. Posnetki kažejo ohranjen Folio dizajn, berljive kontrole in primerno zlaganje na ozkem zaslonu. Predane meritve navajajo širini dokumenta/zaslona 1440/1440 in 390/390 ter nič napak JavaScript. Zajema, meritev in interakcij v živem brskalniku pregledovalec ni ponovil.

Skriti končni testi niso dostopni. Drugi brskalniki niso preverjeni. Javni internet je po navodilih blokiran; pregled je uporabil samo lokalni izvoz naloge. Okolje za lastne skripte zahteva `chromium.connect(wsEndpoint)` namesto `chromium.launch()`; pregledovalec brskalnika ni zaganjal. Implementerjevi poročani omejitvi sistemskega Git in python3 nista bili ponovno preverjeni in nista ovirali tega pregleda. Izven dogovorjene domene ostajajo manjkajoči ali neveljavni datumi ter razširitve sočasnih sprememb/navigacije, ki jih zahteve izključujejo.

Začetni `review.json` je bil shranjen pred branjem implementacije, seznam pregledanih zahtev pa dopolnjen pred pregledom dodatnih dokazil. Končna predaja je shranjena več kot minuto pred rokom faze.
