# P09 — implementacija in preverjanje

## Začetni zapis

Prebrani so `PROJECT_RULES.md`, `task/instructions.md`, predloga in predana specifikacija. Izvirne R01–R12 ostajajo merilo. Vloga spreminja le `src/`, `tests/agent/` in svoje zapise. Specifikacija in pregledovalčevi dokumenti ostajajo nespremenjeni.

Načrt: razširiti razčlenjevanje in gradnjo fragmentnih URL-jev, dodati ločena potrjeno stanje/osnutek kontrol, skupno filtriranje in stabilno urejanje, ohraniti filtre pri pogledih in podrobnostih ter ponastaviti ob kliku drugega projekta. Ohraniti Folio in regresije.

## Začetni načrt preverjanj (ob ustvarjanju še neizveden)

- R01/R04/R06/R07: neposredni URL, podvojene in neveljavne vrednosti, kodiranje, zgodovina in osvežitev.
- R02/R03: Unicode, dobesedna fraza v vseh štirih poljih, IN status, stabilno UTF-16 urejanje.
- R05/R08/R09/R10/R11: osnutek, atomarna uporaba, reset, preklop pogleda/projekta, podrobnosti po ID in prazni rezultati.
- R12: regresije, samo branje API, odsotnost shrambe, širina 390 px in ohranjen videz.
- `npm run check`: slog, tipi, gradnja, osnovni, razvojni in lastni testi; izid še ni znan.

## Omejitve okolja

Javni internet je blokiran. Na voljo so le izvoženi projekt in njegove lokalne storitve. Infrastruktura, odvisnosti, skupni testi in navodila so samo berljivi. Ročni brskalnik mora uporabiti `chromium.connect(wsEndpoint)` iz `task/browser.json`; `chromium.launch()` ni na voljo. Nedostopni končni testi ne bodo navedeni kot opravljeni. Rok faze: 2026-09-26T10:38:46.865Z; zadnja minuta je namenjena predaji.

## Izvedene spremembe

- `src/viewState.ts`: razčlenjevanje privzetih/neveljavnih filtrov, normalizacija fraze in polj, IN s statusom, stabilna primerjava naslovov po UTF-16 brez spreminjanja vhodnega seznama.
- `src/navigation.ts`: filtri v fragmentu obeh poti, prva pojavitev parametra, kanonična gradnja povezav, en nov zgodovinski vnos ob spremembi; enako stanje le zamenja nekanonični URL. Samo branje URL-ja ga ne spreminja.
- `src/ViewControls.tsx`: ločen osnutek, atomarna uporaba in ponastavitev. Ključ kontrol je trenutni fragment, zato navigacija obnovi osnutek iz potrjenega URL-ja brez ponovnega priklopa seznama opravil.
- `src/App.tsx`, `src/TaskBoard.tsx`, `src/TaskDetails.tsx`: skupni filtrirani rezultat, ohranitev filtrov pri pogledih in podrobnostih, privzeti filtri ob projektnih povezavah, števec in prazno stanje. Ohranjeni so projektni povzetki, identiteta po ID-ju in fokus povezave po zapiranju podrobnosti.
- `src/styles.css`: prilagodljive kontrole z obstoječimi barvami, robovi in pisavo Folio.
- `tests/agent/P09.spec.ts`: A01–A08 za vrzeli razvojnih testov, vključno s 13 opravili, Unicode, stabilnimi izenačenji, zgodovino, enakimi naslovi, praznim projektom in širino 390 px.

## Končni rezultati preverjanja

Prvi `npm run check` je uspešen: lint, tipi, produkcijska gradnja in **46/46 testov** (38 osnovnih + 8 razvojnih). Dokaz: `docs/agent/check-initial.log`. Ta zagon še ni vseboval novih lastnih testov.

Končni `npm run check` je zaključen z izhodno kodo 0: **lint uspešen, TypeScript uspešen, produkcijska gradnja uspešna, 54/54 testov uspešnih v 22,2 s**. Zajeti so vsi 38 osnovni, 8 razvojnih (D01–D04 na namizju in mobilno) ter 8 lastnih testov A01–A08. Dokaz: `docs/agent/check-final.log`; podrobno poročilo je v `playwright-report/html/index.html`. Po tem zagonu ni bilo sprememb izvorne kode ali testov.

Pregled `src/` potrjuje odsotnost `localStorage` in `/__test/`. Edini obstoječi zapisovalni pripomoček je neuporabljeni `updateTask` v nespremenjenem `src/api.ts`; novi UI ga ne kliče.

`git diff` v okolju ne deluje: sistemski git zahteva manjkajoči `/Library/Developer/CommandLineTools/usr/bin/xcrun`. Infrastruktura ni bila popravljana. Pregled sprememb temelji na neposrednem branju datotek in izvedenih preverjanjih.

## Sledljivost zahtev in dokazov

Vsi spodnji testi so dejansko uspešno izvedeni v končnem zagonu. A01–A08 so v `tests/agent/P09.spec.ts`; D01–D04 v `tests/development/P09.spec.ts`. Izvirna merila in predikati so v nespremenjeni predani specifikaciji.

| Zahteva | Pogoj in koda | Izvedeni dokaz |
| --- | --- | --- |
| R01 | `navigation.ts/useRoute`, `readFilters`: fragment določa filtre; `App.tsx` takoj izpelje seznam | D01, A06: neposredni projektni in podrobnostni URL, tudi opravilo zunaj rezultatov |
| R02 | `viewState.ts/normalizeText, visibleTasks`: fraza je podniz enega normaliziranega polja | A01: vsa štiri polja, NFD, velike črke, zunanje beline, ločeni besedi in polji ne zadeneta, `.* & + # ?` ostane dobesedno |
| R03 | `visibleTasks`: status IN fraza, stabilno urejanje kopije rezultata po UTF-16 | A01, A02, A08: vsi statusi, vsi redi, 13 opravil, `Alfa 10/alfa 2`, normalizirano enaki naslovi, emoji proti U+E000, tabla |
| R04 | `readFilters` uporablja `URLSearchParams.get`; `useRoute` samo bere | A03: prazni prvi q, neveljavni prvi status/order pred veljavnimi ponovitvami, neznan parameter, surovi URL ostane ob odprtju |
| R05 | `ViewControls` hrani D ločeno; `commitUrl` potrdi enkrat | D02, A04: vse tri kontrole ne vplivajo do uporabe; A03 preveri točno en dodan vnos |
| R06 | `viewQuery`, `sameFilters`, `commitUrl`: obrezovanje, kodiranje, izpuščanje privzetih, zamenjava pri enakem C | A01/A03: posebni znaki, ohranjena tabla, neznani parametri izginejo šele ob uporabi, ponovitev ne doda zgodovine |
| R07 | `useRoute` posluša `hashchange`; ključ `ViewControls` obnovi D | A04: Nazaj/Naprej obnovita C/D/F, nepotrjen osnutek izgine, osvežitev; D03 in A06 dodatno osvežitev |
| R08 | `App.tsx` obema pogledoma poda isti F; povezave uporabijo C | D03, A02/A05: enaki ID-ji, urejen stolpec, zavržen osnutek ob preklopu |
| R09 | `taskUrl`, povezave vrstic/kartic, `TaskDetails.close` uporabljajo C in ID | A05/A06: podvojena naslova, oba načina zapiranja, tabela/tabla, povrnitev fokusa, neposredna povezava in osvežitev |
| R10 | Projektna navigacija uporablja privzeti `projectUrl` z ohranjenim V | A05: drug projekt začne privzeto tablo; neposredni filtrirani URL drugega projekta upošteva parametre; osnovni test preveri preklop med nalaganjem |
| R11 | `ViewControls` ponastavi C/D; `App.tsx` izpiše N/M in Ni zadetkov. | D04, A04/A07: samo osnutek, ponovitev in zgodovina ponastavitve; 0/0, 1/1, 0/1; tabla obdrži tri stolpce |
| R12 | Podatkovni tok ostane GET prek `useResource`; obstoječi Folio dopolnjen s prilagodljivimi kontrolami | 38 osnovnih regresij, D04, A05/A07: brez zapisov API, prazna localStorage, širina 390 px; pregled kode in vizualni pregled spodaj |

## Vizualni pregled

Ročni lokalni strežnik je bil zagnan z `WEB_PORT=5193 API_PORT=3123 npm run dev`. Skripta je prebrala `task/browser.json` in se povezala z `chromium.connect(wsEndpoint)`. Vizualno so pregledani `desktop-table.png` (1440 × 960), `mobile-table.png` (390 × 844) in testni `mobile-board.png` (390 × 844), vsi v `docs/agent/`.

Kontrole sledijo barvam, sistemski pisavi, robovom in zaobljenosti Folio; na ozkem zaslonu se zložijo v stolpec. Preglednica in tabla ohranita notranje drsenje. Izmerjena širina dokumenta je enaka širini okna: 1440 in 390 pik; dokaz je `docs/agent/visual-observations.json`. A07 dodatno preveri širino table pri 390 pikah.

## Predaja pregledovalcu

Implementacija R01–R12 je pripravljena za neodvisni pregled. Znane napake ali neizpolnjene zahteve niso ugotovljene. Predana specifikacija ne vsebuje ugotovljenega nasprotja z izvirnimi zahtevami; ni bila spreminjana. Uporabljeno je njeno pojasnilo, da enaka potrditev lahko kanonizira URL z zamenjavo trenutnega vnosa, projektni povzetek pa ohrani projektne vsote.

Nedostopni končni testi niso izvedeni. Lastni A01–A08 tečejo v Chromiumu na namiznem projektu, A07 izrecno uporabi 390 px; skupne razvojne in osnovne regresije tečejo tudi v mobilnem projektu. Drugi pogoni brskalnikov niso preverjeni. Izven dogovorjenega obsega ostajajo nove sočasne spremembe podatkov brez osvežitve. Pregledovalec naj uporabi predvsem končni dnevnik, sledljivost zgoraj in izvorno kodo. Noben drug agent ni bil zagnan; infrastruktura, skupni testi, navodila, specifikacija in pregledovalčevi dokumenti niso bili spreminjani.
