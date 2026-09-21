# Neodvisni pregled P05

Pregled je zaključen. Primerjal sem izvirne R01–R12, predano specifikacijo, implementacijo, razvojne in lastne teste ter `verification.md`. Konkretnih odstopanj, ki bi zahtevala spremembo specifikacije ali kode, nisem ugotovil.

## Presoja zahtev

| Zahteva | Neodvisno pregledana izvedba | Predano testno dokazilo |
| --- | --- | --- |
| R01 | `src/App.tsx:15`: začetno all/all/1; filter in slice ohranita vrstni red. | S01, privzete vrednosti in 13 izvornih ID-jev. |
| R02 | `src/App.tsx:18`: odsek filtriranega polja ima pravilni meji za 2/5/10. | S01, vse strani in združitev brez izgube ali podvojitve ID-jev; D01. |
| R03 | `src/App.tsx:25` in `:81`: štirje premiki ter onemogočanje na obeh robovih. | S01, vsi premiki in poskus klika onemogočenih gumbov; D02. |
| R04 | `src/App.tsx:58`: sprememba velikosti nastavi stran 1; all uporabi celotno filtrirano polje. | S01, ponastavitev tudi ob še veljavni prejšnji strani; S02 in D04. |
| R05 | `src/App.tsx:18` in `:61`: stabilen filter pred odsekom; sprememba filtra ponastavi stran. | S02, vsi filtri z vnaprej določenimi ujemanji; D03. |
| R06 | `src/App.tsx:65` in `:69`: oba pogleda dobita visibleTasks; `TaskBoard.tsx:17` združi samo prejete elemente. | S02, mešana stran, enaki ID-ji in zaporedja stolpcev; D03. |
| R07 | `src/App.tsx:90` in `:118`: pogled in podrobnosti ne zamenjajo instance ProjectView. | S03, filtrirana druga stran, oba pogleda, zapiranje z gumbom in Escape. |
| R08 | `src/App.tsx:118`: ključ projekta povzroči novo lokalno stanje; v navigaciji ni novega stanja straničenja. | S03, A–B–A, osvežitev v obeh pogledih, pregled URL-ja in shrambe. |
| R09 | `src/App.tsx:79`: natančen status, filtrirani N, indeksa od 1 in U+2013. | S01/S02, prve, vmesne in krajše zadnje strani; D02. |
| R10 | `src/App.tsx:21`, `:25` in `:79`: pri praznem rezultatu ničelni status in vsi premiki onemogočeni. | S04/S05, prazna projekta, prazen filter in odstranitev filtra. |
| R11 | `src/App.tsx:27`, `:51` in `:87`: projektni števci iz vseh opravil; `TaskBoard.tsx:24`: števec iz trenutnega odseka. | S02/S04/S05, nespremenjeni projektni števci in števci prikazanih kartic. |
| R12 | Prehodi uporabljajo le lokalne setterje ter nemutirajoča filter/slice; povezave kodirajo ID-je. Nalaganje in podrobnosti uporabljajo obstoječe komponente. Kontrole uporabljajo slog Folio in mobilni prelom. | S01–S05, nič zapisov in omejitev širine; osnovni testi povezav, nalaganja, napak in podrobnosti; predana posnetka. |

Specifikacija zajema vseh dvanajst izvirnih zahtev, predikate T/F/V ter sprejemne pogoje. Njena tabela jasno označuje stanje pred implementacijo; dejansko sledljivost z rezultati dopolnjuje `verification.md`. Med dokumentoma in pregledano kodo ni ugotovljenega vsebinskega nasprotja.

## Izvor in meje dokazov

Sam sem pregledal kodo, vsebino testov, končni dnevnik `docs/agent/check.log`, podatke `visual-check.json` in namizni ter mobilni posnetek. Posnetka sledita potrjenemu dizajnu Folio; mobilna tabla se pomika znotraj svojega prikaza.

Končni dnevnik implementerja izkazuje uspešen ESLint, TypeScript, gradnjo ter 56/56 testov v 27,4 s: 38 osnovnih, 8 razvojnih in 10 lastnih. **To so predani rezultati implementerja, ne moj ponovni zagon.** Ker statični pregled in dokazila niso pokazali konkretnega razloga za ponovitev, testov nisem ponovno izvajal. Tudi meritev v živem brskalniku nisem ponavljal.

Skriti končni testi niso dostopni. Javni internet je blokiran; po navodilih je Chromium na voljo prek `task/browser.json` in `chromium.connect`, neposredni launch ni podprt. Drugih brskalnikov in bralnikov zaslona nisem preverjal. Omejitev Git/xcrun je navedena v implementerjevi predaji; sam je nisem ponovno preverjal. Spreminjal sem samo `review.json` in `review.md`.
