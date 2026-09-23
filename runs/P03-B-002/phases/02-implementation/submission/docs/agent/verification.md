# P03 — implementacija in preverjanje

Začetni zapis implementerja, 2026-09-23. Prebrani so PROJECT_RULES.md, task/instructions.md, task/specification-template.md in predana specifikacija. Obvezne ostajajo vse zahteve R01–R12. Specifikacije in datotek drugih vlog ne spreminjam.

## Načrt in začetno stanje

- R01–R08, R11: lokalni filtri v ProjectView; normalizirano iskanje vseh štirih polj, dobesedne besede po IN, natančna oseba iz celotnega projekta, stabilen podseznam za oba pogleda, ponastavitev po projektu in osvežitvi.
- R09–R10: števec N/M, pregled stanj in tabla iz istega podseznama; ločeno prazno stanje projekta in brez zadetkov.
- R12: ohraniti Folio, navigacijo, podrobnosti, dostopnost in širino 390 px; brez zapisovalnih API klicev.
- Načrtovano, še NEIZVEDENO: pregled obstoječe kode/dizajna, implementacija, razvojni testi, lastni robni scenariji v tests/agent/, npm run check in pregled ozkega prikaza.
- Začetno ni izveden noben test. Rezultate in sledljivost dopolnim po dejanskem zagonu.

## Omejitve

Javni internet je blokiran; uporabljam samo lokalni API in izvoz naloge. Infrastruktura, odvisnosti, skupni testi, tipi in navodila ostanejo samo berljivi. Chromium je na voljo prek wsEndpoint v task/browser.json; lastne skripte morajo uporabiti chromium.connect. Končni testi niso dostopni. Faza se konča do 19:15:34.881Z, zadnja minuta je namenjena predaji.

## Izvedene spremembe

- `src/App.tsx`: ProjectView ima tri lokalna stanja in normalizacijo NFD; vse besede preverja z includes nad id/title/description/assignee. Filter stanja in natančne osebe sestavi z IN. Možnosti oseb so deduplicirane iz celotnega projekta. Ne mutira vhodnih podatkov.
- Isti filtrirani seznam napaja preglednico, tablo, pregled stanj, značko in nogo. Dodane so zahtevane dostopne kontrole, status N/M, čiščenje in ločeno sporočilo brez zadetkov.
- Obstoječi ključ ProjectView po project.id ponastavi filtre ob menjavi projekta. Pogledi ohranijo isto komponento; ni shranjevanja filtrov v URL ali brskalnik.
- `src/styles.css`: nove kontrole uporabljajo obstoječe barve, robove in pisavo; mreža se prelomi na dva in nato en stolpec.
- `tests/agent/filtering.spec.ts`: sedem testov pokriva S01–S07 iz specifikacije, vključno z 0/1/12 opravili, različnimi ID-ji, enakimi naslovi, diakritiko v obeh zapisih, ločili, natančnimi imeni in širino 390 px.

## Končni rezultati preverjanja

`npm run check` je zaključen z izhodno kodo **0**. Lint, TypeScript in produkcijska gradnja so uspešni. Playwright: **53 passed (20.6s)** — 38 osnovnih/API, 8 razvojnih P03 in 7 lastnih testov. Celoten dnevnik: [check.log](check.log). Ni bilo neuspešnega testa ali ponovnega zagona, potrebnega zaradi popravka.

Lastni testi in njihova imena so v [filtering.spec.ts](../../tests/agent/filtering.spec.ts); S01/S06, S02, S03/S05, S04, dva primera S01/S05 za velikosti 0 in 1 ter S07. Dnevnik navaja datoteko, vrstico, polno ime in rezultat vsakega testa. Razvojni testi D01–D04 so bili dejansko izvedeni na namizju in mobilno v okviru celotnega ukaza; ločen podvojen zagon ni bil potreben.

Vizualni pregled je uporabil lokalni `WEB_PORT=5193 API_PORT=3123 npm run dev` in `chromium.connect(wsEndpoint)` iz task/browser.json. Pregledana sta posnetka [namizne preglednice](desktop-table.png) in [mobilne table](mobile-board.png); shranjena je tudi [mobilna preglednica](mobile-table.png). Ohranjen je videz Folio: stranski oziroma zgornji meni, barve, pisava, kartice in preklop pogledov. Nove kontrole so berljive in se pri 390 px postavijo v en stolpec. Preglednica in tabla ohranita notranje drsenje. Meritve v [visual-check.json](visual-check.json): širina dokumenta je 1440 pri namizju ter 390 pri obeh mobilnih pogledih. Lastni S07 dodatno potrjuje meje kontrol, viden fokus in širino pri dolgih imenih/naslovih.

## Sledljivost zahtev

Vsi spodnji izidi pomenijo uspeh dejansko izvedenih navedenih scenarijev, ne trditve o nedostopnih končnih testih. Dokaz je check.log.

| Zahteva | Implementacija in pogoj | Izvedeni scenariji | Izid |
| --- | --- | --- | --- |
| R01 | App.tsx:17–19 privzeto lokalno stanje, stabilen filter; prvotni vrstni red. | D01; S01/S06 z 12 opravili; S01/S05 z 0 in 1 ter neposrednim vstopom v tablo. | Uspešno. |
| R02 | App.tsx:11 normalizeSearch in :22 združena štiri polja; NFD, U+0300–036F, male črke. | D01; S02 posebej ID, naslov, opis, oseba in sestavljeni/razstavljeni naglasi. | Uspešno. |
| R03 | App.tsx:20 delitev po belinah in :23 every/includes; dobesedne besede. | S02 beline, premešan vrstni red, manjkajoča beseda, `.*`, `[`, `=SUM(A1)`. | Uspešno. |
| R04 | App.tsx:23–25 trojni IN; izvirna natančna oseba. | D02; S03/S05 s Črt, Crt in črt ter izločitvami zaradi vsakega pogoja. | Uspešno. |
| R05 | App.tsx:27 Set iz celotnega T, brez praznih imen; :68–69 možnosti. | S03/S05 deduplikacija in nespremenjene možnosti ob nič zadetkih; S04 drug projekt. | Uspešno. |
| R06 | App.tsx:75 in :79 isti F za oba pogleda; nespremenjeni TaskBoard deli po stanju. | D02; S03/S05 ohranitev vseh kontrol in istih ID-jev; S01/S06 vrstni red po stolpcih. | Uspešno. |
| R07 | App.tsx:119 ključ project.id; obstoječi useResource preklic in ključ podatkov sta ohranjena. | S04 menjava in vrnitev; osnovni test switching project during loading na obeh širinah. | Uspešno. |
| R08 | App.tsx:17–19 lokalni useState, brez dodatnega zapisa v URL/shrambo. | S04 URL in localStorage/sessionStorage pred/po filtriranju ter reload table s filtri; statični pregled. | Uspešno. |
| R09 | App.tsx:33 counts iz F; :73 N/M; TaskBoard šteje prejeti F. | D04; S03/S05 števec, pregled stanj in vsi stolpci; S01/S05 0/0 in 0/1. | Uspešno. |
| R10 | App.tsx:74 M > 0 in N = 0; :75 običajni prazen projekt; tabla ohrani stolpce. | D03; S03/S05 nič zadetkov v obeh pogledih; S01/S05 prazna oba projekta; osnovni prazni pogledi. | Uspešno. |
| R11 | App.tsx:28–31 skupna ponastavitev; filter brez mutacij. | D03; S01/S06 vrnitev 12 ID-jev v vrstnem redu, podrobnosti po ID in nespremenjen GET; S03/S05 vse tri kontrole. | Uspešno. |
| R12 | App.tsx ohrani navigacijo in podrobnosti, ne doda zapisov API; styles.css prilagodi nove kontrole. | 38 osnovnih/API testov; D04 obeh širin; S01/S06 in S04/S07 omrežje; S07 390 px, dolga besedila, tipkovnica, podrobnosti; vizualni pregled. | Uspešno. |

## Predaja pregledovalcu

Implementacija je zaključena; znanih neizpolnjenih zahtev ni. Pri pregledu predane specifikacije ni bila ugotovljena napaka ali izpuščena obvezna zahteva. Spremenjeni implementacijski datoteki sta samo `src/App.tsx` in `src/styles.css`; dodani so lastni testi in tukaj navedeni dokazi. Specifikacija, njena zgodovina, review.md/review.json, skupni testi, strežnik, tipi, odvisnosti in infrastruktura niso bili urejani.

Omejitve dejanskega preverjanja: končni testi niso dostopni; vizualni pregled in avtomatski testi so izvedeni v nameščenem Chromiumu, brez ročnega preizkusa bralnika zaslona. `git diff --stat` ni bil izvedljiv: sistemski Git javi manjkajoč xcrun (`invalid active developer path /Library/Developer/CommandLineTools`), zato Gitovega povzetka sprememb ni. To ni oviralo lint/typecheck/build/test ali pregledovanja datotek. Npm izpisuje opozorilo o nastavitvi http-proxy in Playwright opozorilo NO_COLOR/FORCE_COLOR; preverjanje se kljub temu uspešno zaključi. Infrastruktura zaradi teh opozoril ni bila spreminjana.

Predaja je shranjena več kot 60 sekund pred rokom faze; preostanek časa je na voljo pregledovalcu in morebitnim zahtevanim popravkom prvotnega avtorja.
