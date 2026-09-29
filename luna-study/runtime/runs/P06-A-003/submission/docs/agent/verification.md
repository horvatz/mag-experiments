# Preverjanje P06

Datum: 2026-09-27.

## Izvedeni ukazi in rezultati

Končni `npm run check` je uspel (izhodna koda 0): ESLint, `tsc --noEmit`, Vite production build ter vseh 49 Playwright preverjanj. Razčlenitev: 14 API, 12 osnovnih namiznih, 12 osnovnih mobilnih, 4 razvojna namizna, 4 razvojna mobilna in 3 agentna preverjanja.

Vrstice P06 iz razvojnih testov so v `tests/development/P06.spec.ts`:

- D01 preveri privzeto ime, glavo, BOM in zaključni CRLF.
- D02 preveri izbor stolpcev, filter in ločilo vejica.
- D03 preveri ubežanje narekovajev, nevtralizacijo formule ter večvrstično Unicode vsebino.
- D04 preveri enak prenos med pogledi in nespremenjenost podatkov.

Lastni testi v [P06.spec.ts](../../tests/agent/P06.spec.ts) preverijo natančne prenesene vsebine, vrstni red opravil, kanonični vrstni red stolpcev po klikanju v drugem vrstnem redu, prazno izbiro, prazen filtrirani rezultat in projekt, isto vsebino po menjavi pogleda, ponastavitve projekta in osvežitve, odsotnost API zapisov ter širino dokumenta na mobilnem prikazu.

## Sledljivost zahtev

| Zahteva | Izvedeni scenarij in dokaz | Rezultat |
| --- | --- | --- |
| R01 | D01; agentni test »CSV ohrani polja, Unicode, izvorni vrstni red ter zaščiti formule in prelome«; natančna primerjava privzetega CSV | Uspešno |
| R02 | D02; agentni test »filtri omejijo samo CSV …« izbere `title` pred `id`, nato preveri glavo in vrednosti v vrstnem redu `id,title` | Uspešno |
| R03 | Agentni test »filtri omejijo samo CSV …« odznači vse kolone, preveri onemogočen gumb in nato njegovo ponovno omogočenje | Uspešno |
| R04 | Agentna testa »filtri omejijo samo CSV …« in »menjava projekta in osvežitev …« preverita, da ostanejo vse vrstice/cards prikazane, ter onemogočen izvoz pri filtru brez ujemanj in v praznem projektu | Uspešno |
| R05 | D01 in agentni test prvega prenosa preverita `folio-web.csv`, BOM na začetku ter nespremenjen hash URL po prenosu | Uspešno |
| R06 | D02–D03 in agentni test prvega prenosa preverijo obe ločili, narekovanje vsake vrednosti in podvojene notranje narekovaje | Uspešno |
| R07 | D03 in natančna primerjava prvega agentnega prenosa preverita notranji CRLF v citirani vsebini in končni CRLF | Uspešno |
| R08 | D03 preveri začetni `=`; agentni test preveri `=` po presledku/tabulatorju in `+` po CRLF. `src/csv.ts` uporablja skupni regex za vsako podatkovno kolono | Uspešno za preizkušene primere |
| R09 | Agentni test prvega prenosa preveri šumnike, Unicode pomišljaj, izvorni status in datum `YYYY-MM-DD` | Uspešno |
| R10 | D04 in agentni test »filtri omejijo samo CSV …« primerjata bajte pred in po preklopu Preglednica/Tabla | Uspešno |
| R11 | Agentni test »menjava projekta in osvežitev …« po spremembi stanja preveri privzete vrednosti pri drugem projektu in po `reload` | Uspešno |
| R12 | D04 in agentni testi ne zaznajo API zapisov; D04 in agentni mobilni preizkusi preverijo, da se dokument ne razširi čez širino zaslona. Osnovni testi še vedno preverjajo navigacijo in prikaz po ID | Uspešno |

## Popravki med preverjanjem

Prvi celoten tek je pokazal, da ponovni izbor kolone lahko spremeni vrstni red CSV; implementacija je bila popravljena tako, da serializer razvrsti izbor po stalnem seznamu kolon. Naslednji tek je našel napačno predpostavko v lastnem testu (ena kolona je ostala izbrana); test je bil popravljen. Zadnji celoten tek po popravkih je uspel: 49/49.

## Omejitve in nepreverjeni primeri

- Preverjanje uporablja reprezentativne API fixture podatke, ne vseh možnih končnih podatkov ali nedostopnih končnih testov. Znaki `-` in `@` kot začetek formule niso posebej navedeni v Playwright fixture, čeprav skupni sanitizator v [csv.ts](../../src/csv.ts) zajame oba po predpisanem pravilu.
- Mobilna avtomatizacija preveri odsotnost vodoravnega prelivanja pri testnem vidnem polju 390 px; ločen ročni pregled vseh velikosti zaslona in pripomočkov za dostopnost ni bil izveden.
- Poskus `git status --short --branch` ni uspel, ker je sistemski `xcrun` kazal na manjkajoče `/Library/Developer/CommandLineTools`; izvoz je po navodilih brez zgodovine Git. To ne vpliva na lint, build ali teste.
- Okolje med npm ukazi izpiše opozorilo za zastarelo konfiguracijo `http-proxy` in opozorila Node za `NO_COLOR`/`FORCE_COLOR`; vsi preverjevalni ukazi so kljub temu uspešno zaključeni.
