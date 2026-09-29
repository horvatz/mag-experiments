# P05 — Implementacija in preverjanje

## Začetni zapis

Vloga: implementer. Prebrani so `PROJECT_RULES.md`, `task/instructions.md`, predloga in predana `specification.md`. Izvirne R01–R12 ostajajo obvezne. Specifikacija opisuje lokalni filter pred skupnim straničenjem obeh pogledov; začetno ni ugotovljenih odstopanj od zahtev.

Načrt sprememb: lokalno stanje v ProjectView, skupni filtrirani odsek za preglednico in tablo, dostopne kontrole in točen status; projektni števci ostanejo vezani na celotni seznam. Ohranjen bo obstoječi dizajn Folio.

## Začetni načrt preverjanj (ob nastanku še niso bila izvedena)

- Statični pregled obstoječe kode, dizajna in razvojnih testov.
- Lastni testi v `tests/agent/`: velikosti 2/5/10/all in vsi premiki pri več kot deset opravilih; stabilen filter; enaki ID-ji obeh pogledov in števci; ohranitev pri podrobnostih; ponastavitve projekta/osvežitve; prazni rezultati in en sam element; brez zapisov API; širina 390 pik.
- `npm run check`: slog, tipi, gradnja, 38 osnovnih in 8 razvojnih testov ter lastni testi.
- Vizualni pregled, če ga dopušča čas, prek obstoječega Chromium wsEndpoint. Dejanske rezultate in omejitve dopolnim pred predajo.

## Omejitve in predaja

Javni internet je blokiran. Chromium je na voljo prek `task/browser.json` in `chromium.connect`; `chromium.launch()` ni podprt. Spreminjajo se samo `src/`, `tests/agent/` in lastni zapiski. Specifikacija, njena zgodovina, pregled, infrastruktura in skupni testi ostajajo v lasti drugih vlog oziroma samo berljivi. Končni skriti testi niso dostopni. Rok implementacije je 2026-09-21T22:03:27.600Z; zadnja minuta je namenjena predaji.

## Vmesni rezultati

- Implementacija je v `src/App.tsx` (lokalna trojica velikost/filter/stran, stabilni filter, en odsek, kontrole, status in prazni rezultati) ter `src/styles.css` (kontrole v slogu Folio, prelom pri mobilni širini).
- Dodan `tests/agent/pagination.spec.ts`: S01–S05 vsak pri 1440 in 390 pikah. Podatki imajo 13 opravil, mešana stanja, neurejene ID-je, poseben ID `naloga/ž? 42`, enake naslove z Unicode/HTML podobnim navadnim besedilom in veljaven prestopni datum. Dodatna scenarija imata 0 in 1 opravilo.
- Prvi `npm run check`: lint, tipi in gradnja uspešni; 54/56 testov uspešnih (vseh 38 osnovnih, vseh 8 razvojnih, 8/10 lastnih). Dve ponovitvi S05 sta padli pri napačni testni predpostavki, da End izbere zadnjo možnost izvornega selecta. Ročni preizkus prek Chromium povezave je pokazal: End/puščice niso spremenile izbire, tipka `k` pa izbere Končano. Test je prilagojen preverjenemu vnosu `k` in Enter; produkcijska koda ni potrebovala spremembe. Prvi dnevnik je `check-initial.log`.
- Ročni pregled `http://127.0.0.1:5193/` prek `chromium.connect` pri 1440×960 (preglednica) in 390×844 (tabla): status `Stran 1 od 2. Prikazano 1–2 od 3.`, brez raztezanja dokumenta; shranjena `desktop.png` in `mobile.png`. Nova kontrolna vrstica uporablja obstoječe barve, robove in tipografijo; mobilni gumbi se razporedijo v dve vrstici.
- Okoljska omejitev: `git status` ni izvedljiv zaradi manjkajočega sistemskega xcrun/CommandLineTools. Git/vej/push ni bilo mogoče niti potrebno uporabiti. Npm opozarja na obstoječi http-proxy in NO_COLOR/FORCE_COLOR; to ni ustavilo preverjanja.
- Po popravku lastnega testa je bil izveden končni ponovni `npm run check`; izid sledi spodaj.

## Končni izid in dokazila

**Implementacija je pripravljena za pregled.** `npm run check` se je končal z izhodno kodo 0: ESLint uspešen, TypeScript uspešen, produkcijska gradnja uspešna, **56/56 testov uspešnih v 27,4 s** (38 osnovnih, 8 razvojnih, 10 lastnih). Po tem zagonu produkcijska koda in testi niso bili več spremenjeni. Končni dnevnik: [check.log](check.log); prvi zagon s pojasnjenima napakama lastnega testa: [check-initial.log](check-initial.log). HTML poročilo je v `playwright-report/html/index.html`.

Spremenjeni produkcijski datoteki sta samo [App.tsx](../../src/App.tsx) in [styles.css](../../src/styles.css). Lastni testi so v [pagination.spec.ts](../../tests/agent/pagination.spec.ts). Obstoječi `TaskBoard`, podrobnosti, API, navigacija in nalaganje ostajajo uporabljeni brez sprememb. Testni pripomočki iz `tests/development/helpers.ts` so uvoženi samo v lastnih testih, nikoli v aplikaciji.

Statični pregled potrjuje predikate predane specifikacije: `F = filter(T)`, `V = slice(F)`, oba pogleda prejmeta V; pri praznem F je prikaz X/Y/A/B/N ničeln. Sprememba velikosti ali filtra nastavi stran 1; `ProjectView key={project.id}` ponastavi celotno lokalno stanje ob menjavi projekta. Novih zapisov API, URL parametrov ali trajne shrambe ni.

### Dejanska sledljivost R01–R12

Vsi navedeni S01–S05 so bili uspešno izvedeni pri širinah 1440 in 390 pik. Njihova polna imena so v testni datoteki in končnem dnevniku. D01–D04 so uspešni v projektih development-desktop in development-mobile.

| Zahteva | Izvedeni pogoj in koda | Dejanski test/scenarij | Izid in dokaz |
| --- | --- | --- | --- |
| R01 | `App.tsx:15`: all/all/1; stabilen vrstni red API. | S01: privzete vrednosti, vseh 13 ID-jev v izvornem vrstnem redu. | Uspešno, check.log S01 ×2. |
| R02 | `App.tsx:18`: filtriranje in skupni odsek `visibleTasks`. | S01: vse strani pri 2/5/10; združeni ID-ji enaki izvoru, brez dvojnikov, krajše zadnje strani. D01. | Uspešno, check.log S01 ×2 in D01 ×2. |
| R03 | `App.tsx:25`, `App.tsx:80`: robna pogoja in štirje onemogočljivi gumbi. | S01: vsi štirje premiki in robovi; DOM click na onemogočenem zadnjem/naslednjem gumbu ne spremeni ID-jev. S04/S05: prazna/edina stran. D02. | Uspešno, check.log S01/S04/S05 in D02. |
| R04 | `App.tsx:58`: velikost hkrati ponastavi stran; all vrne celotni F. | S01: druga stran velikosti 2 → prva velikosti 5, tudi če je druga še veljavna; prehod all. S02: filter se ohrani. D04. | Uspešno, check.log S01/S02 in D04. |
| R05 | `App.tsx:18`, `App.tsx:61`: filter pred odsekom, stran 1 ob spremembi. | S02: vsi štirje filtri iz zadnje strani; vnaprej določeni indeksi ujemanj; velikost ostane 2. D03. | Uspešno, check.log S02 in D03. |
| R06 | `App.tsx:65`, `App.tsx:69`: tabla in preglednica dobita isti V; `TaskBoard.tsx:17` stabilno združi odsek. | S02: mešana druga stran velikosti 5; enaka množica ID-jev, vrstni red vsakega stolpca. D03. | Uspešno, check.log S02 in D03. |
| R07 | `App.tsx:15`, `App.tsx:90`, `App.tsx:118`: stanje ostane v isti instanci projekta. | S03: druga filtrirana stran; oba pogleda; pravilen poseben ID ob enakih naslovih; zapiranje z gumbom/Escape in vrnitev fokusa. | Uspešno, check.log S03 ×2. |
| R08 | `App.tsx:118`: ključ projekta; brez shrambe novega stanja. | S03: A → B → A, reload v obeh pogledih; all/all/prva stran, URL vsebuje le obstoječi view, localStorage/sessionStorage sta prazna. | Uspešno, check.log S03 ×2 in statični pregled. |
| R09 | `App.tsx:79`: točen status z U+2013 ter 1-based indeksoma. | S01: vsaka stran pri 2/5/10/all; S02: filtrirane strani, tudi `6–6 od 6`. D02. | Uspešno, check.log S01/S02 in D02. |
| R10 | `App.tsx:21`, `App.tsx:25`, `App.tsx:79`: ničelni prikaz in vsi premiki onemogočeni. | S04: oba projekta prazna, vse velikosti, oba pogleda; S05: prazen filter in odstranitev filtra. | Uspešno, check.log S04/S05 ×2. |
| R11 | `App.tsx:27`, `App.tsx:51`, `App.tsx:87`: projektni števci iz T; `TaskBoard.tsx:24`: števec iz V. | S02: 6/4/3 in 13 vseh ostanejo enaki, stolpci mešane strani štejejo 2/2/1; S04/S05: prazni stolpci in nespremenjen projektni števec. | Uspešno, check.log S02/S04/S05. |
| R12 | `App.tsx`: samo lokalni prehodi, obstoječe povezave po ID; `styles.css:113`, `styles.css:180`: prilagodljive kontrole. | S01–S05 spremljajo zapisovalne zahteve: 0; S03/S05 tipkovnica in navadno Unicode besedilo; osnovni testi nalaganja/napak/navigacije/podrobnosti; mobilne meritve in vizualni pregled. | Uspešno, vseh 56 testov; desktop.png, mobile.png, visual-check.json. |

### Vizualni pregled in meje dokazov

Pregledana sta [namizni posnetek](desktop.png) in [mobilni posnetek](mobile.png); meritve so v [visual-check.json](visual-check.json). Folio ohranja stransko oziroma zgornjo navigacijo, obstoječo tipografijo, barve, preglednico in stolpce table. Notranje vodoravno drsenje table je ohranjeno; dokument pri 390 pikah ne presega širine zaslona. Oba posnetka uporabljata velikost 2 in filter all nad začetnimi tremi opravili.

V predani specifikaciji ni bila ugotovljena napaka ali izpuščena izvirna zahteva. Znane neizpolnjene zahteve: nobena. To ni trditev o nedostopnih končnih testih; ti niso bili izvedeni. Preverjen je nameščeni oddaljeni Chromium, ne drugi brskalniki ali bralniki zaslona. Novih sočasnih sprememb podatkov brez osvežitve nismo razširjali zunaj obstoječih regresijskih zahtev.

## Predaja pregledovalcu

Pregled naj začne s končnim dnevnikom, tabelo sledljivosti in dvema produkcijskima datotekama. Infrastruktura, skupni testi, tipi, odvisnosti, specifikacija/njena zgodovina ter review.md/review.json niso bili spreminjani. Za ponovitev uporabite `npm run check`. Preverjanje je zaključeno pred zadnjo minuto faze; preostali čas se predaja pregledovalcu.

Ročni strežnik na 5193/3123 je po pregledu ustavljen. Za ponovni vizualni ogled uporabite `WEB_PORT=5193 API_PORT=3123 npm run dev`; Chromium povezava ostaja tista iz `task/browser.json`.
