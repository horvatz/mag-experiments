# P05 — implementacija in preverjanje

Začetni zapis implementerja, 23. 9. 2026. Prebrani so PROJECT_RULES.md, task/instructions.md, task/specification-template.md in predana specification.md. Izvirne zahteve R01–R12 ostajajo merilo. Specifikacije, njene zgodovine in pregledovalčevih dokumentov ne spreminjam.

## Začetni načrt (ob začetku še neizveden)

- Dodati lokalno stanje velikosti, filtra in strani v ProjectView; stabilno filtriranje pred skupnim rezanjem za preglednico in tablo (R01–R08).
- Dodati dostopne kontrole, natančen status in prazne rezultate; ohraniti projektne števce ter obstoječi videz (R03, R09–R12).
- Dodati lastne teste za več kot 10 opravil, vse velikosti/filtre, prazne rezultate, ohranitev/ponastavitve in števce v tests/agent/.
- Izvesti npm run check (slog, tipi, gradnja, osnovni, razvojni in lastni testi); pregledati videz na namizju in 390 px z nameščenim Chromiumom.
- Pred predajo dopolniti sledljivost R01–R12 z dejanskimi rezultati in omejitvami. Končni nedostopni testi niso del zatrjevanih rezultatov.

## Trenutni rezultati in omejitve

- Implementiran je prvi prehod v `src/App.tsx`: lokalno stanje v ProjectView, stabilen filter, skupen odsek za oba pogleda, ponastavitev ob spremembi velikosti/filtra, štirje omejeni premiki, natančen status in različni prazni stanji. Projektni števci ostajajo vezani na celoten seznam; TaskBoard prejme le trenutni odsek. API in navigacija ostajata obstoječa.
- `src/styles.css` dodaja prelomljive kontrole z obstoječimi barvami, robovi in vidnim fokusom. Končni rezultati preverjanja izvajanja in videza so spodaj.
- Pri pregledu specifikacije ni bila ugotovljena napaka ali izpuščena izvirna zahteva.
- Prvi `npm run check` je odkril napačen argument lastnega testnega matcherja `toBeDisabled`; popravljen na ločeni preverjanji enabled/disabled. Dnevnik: `check-initial.log`.
- Naslednji celotni zagon: lint, tipi in gradnja uspešni, 53/54 testov uspešnih. Neuspešen je bil samo A07 zaradi predpostavke o upravljanju izvornega selecta s puščico v nameščenem Chromiumu. Ločen preizkus je pokazal, da tipka `2` + Enter uspešno izbere velikost 2; lastni test je popravljen, produkcijska koda ni potrebovala popravka. Dnevnik tega zagona: `check-keyboard.log`; končni ponovni zagon je uspešen.
- Z lokalnim strežnikom 5193/3123 in `chromium.connect` so bili zajeti in vizualno pregledani oba pogleda pri 1440 in 390 px. Kontrole se prelomijo, celotna stran ostane znotraj zaslona; preglednica in tabla se pomikata znotraj prikaza. Dokazi: `table-1440.png`, `board-1440.png`, `table-390.png`, `board-390.png`, meritve v `visual-check.json`. Zajem počaka na izbran pogled in vidno preglednico oziroma tablo.
- `git status --short` ni mogoče izvesti: sistemski git odpove zaradi manjkajočega Xcode CommandLineTools/xcrun. Ukaz ni spreminjal datotek. Omejitve ne odpravljam s spremembami infrastrukture.
- Dovoljeni so le lokalni viri in storitve te naloge. Za lastne brskalniške skripte je obvezna povezava chromium.connect na wsEndpoint iz task/browser.json; chromium.launch ni na voljo.

## Končni rezultati

`npm run check` je končan z izhodno kodo **0**. ESLint, TypeScript in produkcijska gradnja Vite so uspešni. Playwright: **54 uspešnih testov v 24,1 s** — 38 osnovnih (14 API + 12 namiznih + 12 mobilnih), 8 razvojnih P05 ter 8 lastnih. Celotni končni dnevnik: [check.log](check.log). Poročilo Playwright: [index.html](../../playwright-report/html/index.html).

Lastni testi so v [pagination.spec.ts](../../tests/agent/pagination.spec.ts). A01 uporablja 13 opravil s premešanimi Unicode ID-ji in enakimi naslovi ter preveri vse velikosti 2/5/10 pri vseh štirih filtrih. A02 preveri natančno deljiv N=10 in prehode. A03 preveri obe predstavitvi in osnove števcev. A04 preveri podrobnosti s tipkovnico, zapiranje z gumbom, Escape in zgodovino brskalnika. A05 se izvede posebej za preglednico in tablo. A06 preveri oba prazna projekta. A07 preveri posamezno opravilo, prazen filter, tipkovnico in širino 390 px.

## Sledljivost R01–R12

Vse spodnje oznake A pomenijo dejansko izvedene teste v `tests/agent/pagination.spec.ts`; D pomeni `tests/development/P05.spec.ts` na namizju in mobilnem prikazu. Dokaz izidov je `check.log`; splošni predikati in simboli T/F/V so določeni v nespremenjeni [specifikaciji](specification.md).

| Zahteva | Pogoj in izvedba | Dejanski test ali pregled | Izid |
| --- | --- | --- | --- |
| R01 | `src/App.tsx:15`: privzeto all/all/1; stabilen vrstni red T | A01, A07: 13 oziroma 1 opravilo, vsebina/status/privzete vrednosti | Uspešno |
| R02 | `src/App.tsx:18`: F pred rezanjem; `visibleTasks = F.slice(start,end)` | A01: konkatenacija vseh strani = F, brez podvojenih ID; A02: N=10; D01 | Uspešno |
| R03 | `src/App.tsx:68`: robovi in štirje omejeni obravnavalniki | A01: omogočenost na vseh straneh; A02: vsi premiki; A06/A07: onemogočenje pri praznem/edinem rezultatu | Uspešno |
| R04 | `src/App.tsx:61`: sprememba velikosti vedno `setPage(1)` | A02: 2 → 5 tudi ob še veljavni prejšnji strani, aktivni filter, 10/all; D04 | Uspešno |
| R05 | `src/App.tsx:18`, select filtra: stabilen filter pred odsekom in ponastavitev strani | A01: vsi filtri/velikosti; A02: prehod z višje strani; A07: odstranitev praznega filtra; D03 | Uspešno |
| R06 | `src/App.tsx:77` in `:81`: isti V za tablo in vrstice; obstoječi `TaskBoard` združi V | A03: tri strani z mešanimi stanji, enaki ID in vrstni red v stolpcih; A04; D03 | Uspešno |
| R07 | `src/App.tsx:13`: stanje v ProjectView preživi spremembe view/taskId | A04: druga filtrirana stran, oba pogleda, ID podrobnosti in tri poti zapiranja; osnovne regresije podrobnosti | Uspešno |
| R08 | `src/App.tsx:121`: ključ project.id in začetno stanje; brez nove shrambe ali URL parametrov | A05 table/board: menjava projekta, vrnitev, reload, nespremenjen URL ter prazna localStorage/sessionStorage; statični pregled src | Uspešno |
| R09 | `src/App.tsx:19` in `:75`: X/Y/A/B/N iz F in velikosti; točni ločili in pomišljaj | A01: status vsake strani/vsak filter/velikost, tudi 11–13 od 13; A02/A05/A07; D02 | Uspešno |
| R10 | `src/App.tsx:21`, `:75`, `:77`: 0/0, 0–0, dostopne kontrole in prazno stanje | A06: oba projekta, vse velikosti, oba pogleda; A07: prazen filter in odstranitev | Uspešno |
| R11 | `src/App.tsx:28`, naslov in noga iz T; `TaskBoard` entries.length iz V | A03: pregled 7/3/3 in vseh 13 opravil ostaneta, stolpci štejejo posamezni odsek in ničle | Uspešno |
| R12 | Lokalno stanje, filter/slice brez mutacij ali klicev za zapis; obstoječa navigacija/API; `src/styles.css:66` | A01/A04/A07 in D04: brez zapisov; vseh 38 osnovnih regresij; vizualni pregled obeh pogledov 1440/390 px; A07 tipkovnica | Uspešno |

## Predaja pregledovalcu

Produkcijski spremembi sta samo `src/App.tsx` in `src/styles.css`; dodan je `tests/agent/pagination.spec.ts` ter ti implementerjevi zapisi in dokazi. Specifikacija, njena zgodovina, pregledovalčeve datoteke, infrastruktura, odvisnosti, strežnik, skupni tipi in skupni testi niso bili spreminjani. Napaka ali izpuščena izvirna zahteva v specifikaciji ni bila ugotovljena. Znane neizpolnjene zahteve: **ni**.

Videz je bil pregledan na posnetkih [preglednica 1440](table-1440.png), [tabla 1440](board-1440.png), [preglednica 390](table-390.png) in [tabla 390](board-390.png). [Meritve](visual-check.json) potrjujejo `scrollWidth <= innerWidth` v vseh štirih kombinacijah. Pregled uporablja podatke lokalnega API-ja; večji in prazni seznami so preverjeni z nadzorovanimi odgovori samo v testnem programu.

Omejitve: končni testi niso dostopni in niso bili izvedeni; drugi brskalniki in ročni pregled z bralnikom zaslona niso preverjeni. Sistemski git zaradi manjkajočega xcrun ni omogočil prikaza diff/status, zato ni bilo ustvarjanja vej, potiskanja ali PR. npm izpiše neblokirajoča opozorila okolja za http-proxy ter NO_COLOR/FORCE_COLOR. Javni internet ni bil uporabljen. Za lastne brskalniške skripte je bil uporabljen zahtevani `chromium.connect`; zagon Chromiuma ni bil poskušen. Vsi obvezni dostopni testi so uspešni; nedostopnih preizkusov ne štejem kot opravljenih.
