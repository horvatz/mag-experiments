# Neodvisni pregled P08

Pregledovalec je prebral izvirne zahteve, projektna pravila, predlogo, specifikacijo in njeno zgodovino, implementacijo, razvojne in lastne teste ter `verification.md` in končni `check.log`. Začetni osnutek `review.json` je bil shranjen pred pregledom in nato dopolnjen za R01–R12. Pregled je končan. Konkretnih neskladij ni; spremembe specifikacije ali implementacije niso zahtevane.

| Zahteva | Neodvisno pregledani dokazi |
| --- | --- |
| R01 | Konstanta `INITIAL_REFERENCE_DATE = '2026-09-21'` in tri začetna stanja v `ProjectView`; A03 simulira leto 2034. |
| R02 | `deadlineGroup` vrne `done` pred obravnavo datuma; A01 vključuje tri končana opravila z različnimi roki. |
| R03 | Razlika koledarskih dni določa `< 0` in `=== 0`; A01 preverja točne ID-je in oba odprta statusa. |
| R04 | Po predhodnih vejah pogoj `days <= 7` vključuje +1 do +7; ostalo je `later`. A01 preverja +1/+7/+8 in particijo 13 zapisov. |
| R05 | `calendarDay` uporablja izrecni UTC, brez lokalnih ur; A05 zajema mesec, leto, prestopni februar in DST v treh pasovih. |
| R06 | `deadlineCounts` vedno prejme celoten `tasks`; A01 potrjuje enake števce pri vsaki skupini. |
| R07 | Stabilni `Array.filter`, šest možnosti HTML select in izvorni ID-ji; A01 preverja vse skupine, podvojene naslove in vrnitev na all. |
| R08 | `dateInput` in `referenceDate` sta ločena; neveljaven vnos ne zamenja zadnjega veljavnega datuma. A02 ter D03 pokrivata opozorilo in obnovitev. |
| R09 | Preglednica in tabla prejmeta isti `visibleTasks`; sprememba `view` ohrani komponento. A01/A02 preverjata ID-je, vrstni red stolpcev in prazen vnos. |
| R10 | `key={project.id}` ponastavi komponento ob menjavi projekta; stanje je lokalno. A03 preverja menjavo, reload, shrambo in URL. |
| R11 | Inicializacija petih števcev z ničlami; ločen prikaz praznega projekta in prazne skupine s točnim besedilom. A04 preverja preklop, eno opravilo in prazni projekt. |
| R12 | Pregled nima zapisovalnih klicev, uporablja javni API in obstoječe bralne podrobnosti. Slogi novih kontrol uporabljajo obstoječe spremenljivke ter mobilni prelom; A01/A04/A05 in osnovne regresije pokrivajo podatke ter širino. |

Specifikacija vključuje vseh dvanajst izvirnih zahtev, predikate, prehode stanja, omejitve in ločeno označuje neizvedene scenarije. Dejanska sledljivost izvedbe je v implementerjevem `verification.md`, kar specifikacija izrecno dovoljuje.

## Izvor rezultatov in omejitve

- `docs/agent/check.log` vsebuje uspešen lint, preverjanje tipov, gradnjo in 53 uspešnih testov (38 osnovnih, 8 razvojnih, 7 lastnih). To je implementerjev zagon; pregledovalec ga ni ponovil. Pregledana so tudi testna preverjanja in pripomočki, ne zgolj trditev o uspehu.
- Pregledovalec je sam izvedel dodaten preizkus z `node --input-type=module`, neposrednim uvozom `src/deadlines.ts` in `node:assert/strict`. Neodvisna referenčna funkcija je premikala koledarske komponente po gregorijanskih pravilih brez uporabe `Date`. Uspešnih je bilo 324 referenčnih primerov in 7743 razvrstitev za oba odprta statusa ter done, z odmiki −9/−1/0/+1/+6/+7/+8/+9 dni. Izbrana leta: 0001, 0004, 0099, 0100, 0399, 0400, 1600, 1899, 1900, 1999, 2000, 2026, 2028, 2099, 2100, 2399, 2400, 9999; meseci januar, februar, marec, oktober, november, december. Pri vsakem primeru so preverjeni tudi števci. Uspešna sta bila zavrnitev šestih neveljavnih vnosov in prazen seznam s petimi ničlami. Ukaz je končal s kodo 0; izpis: `{"result":"passed","anchors":324,"classifications":7743}`. To dopolnjuje stoletne in zgodnje koledarske meje, ki jih A05 ne zajema. Ni šlo za ponovitev brskalniških testov ali spremembo testnih datotek.
- Pregledovalec je sam odprl in vizualno pregledal obstoječe `test-results/agent-desktop.png`, `agent-mobile-table.png` in `agent-mobile-board.png`. Posnetki kažejo ohranjen Folio, berljive kontrole, mobilni prelom in notranje omejena prikaza preglednice/table pri 390 px. Nastanek posnetkov pripada implementerjevemu zagonu; novega živega brskalniškega pregleda ni bilo.
- Pregled kode je potrdil, da novi pregled ne kliče pripravljene funkcije `updateTask`, ne uporablja trajne shrambe ali `/__test/` ter ne dodaja filtrov v URL. Klasifikacija ne spreminja vhodnih objektov.
- Končni nedostopni testi, drugi brskalniški pogoni in formalna revizija dostopnosti niso preverjeni.
- Okolje dovoljuje samo lokalne storitve naloge; javni internet je blokiran. Chromium se povezuje prek `task/browser.json`; `chromium.launch()` ni podprt. Implementer poroča o nedelujočem sistemskem Gitu zaradi manjkajočih CommandLineTools; pregledovalec tega ni ponavljal.
- Mape `predogled/`, ki jo omenja dokument dizajna, v izvozu ni. Na voljo so `docs/dizajn.md`, slogi in implementerjevi posnetki v `test-results/`.

Celotnega preverjanja ni bilo treba ponavljati: prebrani dnevnik, pregled testov in kode ne kažejo konkretnega razloga za ponovni zagon že uspešnih preverjanj. Nobena izvorna datoteka, specifikacija, test ali infrastruktura ni bila spremenjena v tej vlogi; zapisana sta le pregledovalčeva `review.json` in `review.md`.
