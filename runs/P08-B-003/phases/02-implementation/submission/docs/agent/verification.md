# P08 – implementacija in preverjanje

Začetni zapis implementerja, 2026-09-25. Prebrani so `PROJECT_RULES.md`, izvirne zahteve, predloga in predana specifikacija v1.0. Zahteve R01–R12 ostajajo obvezne. Specifikacija in dokumenti drugih vlog ostanejo nespremenjeni.

**Končna predaja implementacije:** R01–R12 implementirane, znanih odprtih napak ni. Končni `npm run check` se je zaključil s kodo 0: lint, tipi, produkcijska gradnja in **53 uspešnih testov** (38 osnovnih + 8 razvojnih + 7 lastnih). Brskalniški testi so trajali 25,9 s. Dokaz: [check.log](check.log). Ob zadnjem preverjanju časa pred zapisom predaje je bilo do roka faze še 214 s in do skupnega roka 574 s; zapis zaključujem več kot minuto pred rokom. Delo je pripravljeno za pregledovalca.

## Načrt in začetno stanje

- Dodati čisto koledarsko razvrščanje, projektno stanje datuma in filtra ter pet števcev; uporabiti iste filtrirane podatke za preglednico in tablo.
- Ohraniti Folio, obstoječa bralna polja, API in dostopna imena; prilagoditi nove kontrole mobilnemu zaslonu.
- Dodati lastne teste za meje datumov, skupine, prazen vnos, ponastavitve, prazne projekte in skladnost pogledov.
- Izvesti `npm run check` ter po možnosti pregled namiznega in mobilnega prikaza z nameščenim Chromiumom prek `chromium.connect(wsEndpoint)` iz `task/browser.json`.

Vsa zgornja preverjanja so ob nastanku zapisa **še neizvedena**. Dejanske rezultate, sledljivost in omejitve bom dopolnil pred predajo pregledovalcu.

## Izvedene spremembe in sprotni rezultati

- `src/deadlines.ts`: prednost končanih opravil, razvrščanje po razliki koledarskih dni, pet projektnih števcev, validacija referenčnega datuma. Datume računamo kot UTC polnoč; razlika ni odvisna od pasu ali DST, tudi pri prestopu meje leta ne sestavljamo neveljavnega datuma.
- `src/App.tsx`: lokalna trojica stanja (vnos, zadnji veljavni datum, filter), dostopne kontrole in števci, opozorilo, prazna skupina ter enako filtrirano zaporedje za preglednico/tablo. Obstoječi `key={project.id}` ponastavi lokalno stanje. API in bralne podrobnosti so nespremenjeni.
- `src/styles.css`: nove kontrole in števci sledijo obstoječim barvam, robovom in tipografiji; na ozkem zaslonu se prelomijo.
- `tests/agent/deadlines.spec.ts`: dodanih sedem testov (A01–A04 in A05 v treh časovnih pasovih), ki dopolnjujejo obstoječe teste. Vključujejo trinajst opravil, podvojene naslove, Unicode in ID z `/`, mejne datume, praznine, projektne ponastavitve, nespremenljive števce, mobilno širino in bralno uporabo API-ja.
- Prvi `npm run check`: lint, preverjanje tipov in produkcijska gradnja uspešni; 50 testov uspešnih, trije A05 neuspešni zaradi priprave lastnega testa. Ponovni `page.goto` istega URL-ja zamenjanih testnih podatkov ni ponovno naložil; naslednji koledarski primer je uporabljal opravila prejšnjega. Popravek: vsak koledarski primer dobi novo stran v istem izbranem časovnem pasu. Produkcijska koda se zaradi tega ni spreminjala. Prvotni dnevnik je ohranjen v `docs/agent/check-initial.log`.
- Drugi `npm run check` je uspešen: vseh 53 testov, lint, tipi in gradnja; izhodna koda 0. Dnevnik: [check.log](check.log). Po tem zagonu produkcijska koda in testi niso bili več spremenjeni.
- Vizualno pregledani posnetki: namizna preglednica pri širini 1280 px ter preglednica in tabla pri 390 px. Folio, obstoječe komponente in prelom novih kontrol so ohranjeni; vodoravno se pomikata notranja prikaza. Posnetki so v `test-results/agent-desktop.png`, `test-results/agent-mobile-table.png` in `test-results/agent-mobile-board.png`. Obnovljeni namizni posnetek je pri vrhu strani. Ob pregledu prvotnega posnetka je bil viden tudi obstoječi fokus povezave opravila; formalni pregled dostopnosti ni izveden.
- `git diff --stat && git diff --check` ni bilo mogoče izvesti: sistemski Git se ustavi z `xcrun: error: invalid active developer path`, manjka CommandLineTools. Orodij ali infrastrukture ne spreminjam.

## Sledljivost zahtev in dejanski dokazi

Spodnji testi so dejansko uspešni v končnem [dnevniku](check.log). A01–A05 so v [deadlines.spec.ts](../../tests/agent/deadlines.spec.ts); D01–D04 so nespremenjeni razvojni testi, izvedeni na namizju in telefonu. Oznaka A05 pomeni tri teste, enega na časovni pas, vsak s sedmimi koledarskimi primeri.

| Zahteva | Pogoj in koda | Uspešno preverjanje |
| --- | --- | --- |
| R01 | `INITIAL_REFERENCE_DATE` v `src/deadlines.ts`; začetna stanja v `src/App.tsx:ProjectView`: datum 2026-09-21, filter all. | D01; A03 nastavi uro na leto 2034, preveri fiksni datum in začetni filter. |
| R02 | `deadlineGroup` vrne done pred izračunom razlike datumov. | A01 preveri done v preteklosti, na referenčni datum in v prihodnosti; D04. |
| R03 | `deadlineGroup`: Δ < 0 → overdue, Δ = 0 → today. | A01 preveri oba odprta statusa in točne ID-je; D01 in D03. |
| R04 | `deadlineGroup`: 0 < Δ ≤ 7 → week, Δ > 7 → later. | A01 ima +1, +7 in +8 ter vseh 13 ID-jev; števci [2,1,4,3,3] tvorijo particijo. D02. |
| R05 | `calendarDay` računa UTC polnoč v dnevih; Δ je razlika dveh koledarskih ordinalov. | A05: mesec, novo leto, 29. februar, pomladni in jesenski DST za Evropo/ZDA; vsakokrat +1/+7 vključena, +8 izključena, v UTC, Europe/Ljubljana in America/New_York. |
| R06 | `deadlineCounts(tasks, referenceDate)` dobi celoten projekt pred filtriranjem. | A01 pri vsaki izbrani skupini potrdi istih pet števcev. A04 preveri ničle. |
| R07 | `visibleTasks` je stabilni `filter` originalnega zaporedja; HTML select ima vseh šest vrednosti. | A01 vseh šest izbir, 13 zapisov, podvojeni naslovi, posebni ID-ji, vrnitev na all, brez zapisov. |
| R08 | `dateInput` je ločen od `referenceDate`; veljaven vnos posodobi oba, neveljaven le vnos; dostopno opozorilo. | A02 preveri veljaven → prazen → veljaven vnos, števce, ID-je, ohranitev filtra in odstranjeno opozorilo; D03. |
| R09 | Oba prikaza dobita `visibleTasks`; preklop pogleda ne odstrani `ProjectView`. | A01 primerja ID-je vseh skupin ter stabilni vrstni red stolpcev; A02 ohrani prazen vnos, zadnji izračun in filter med preklopi. |
| R10 | `key={project.id}` ponastavi stanje; ni nove trajne shrambe ali parametrov poti. | A03 preveri menjavo projekta in vrnitev, reload v obeh pogledih, nespremenjen localStorage/sessionStorage ter URL. |
| R11 | `deadlineCounts([])` daje ničle; `deadline-empty` prikaže predpisano sporočilo; tabla vedno ohrani stolpce. | A04: en zapis, prazna skupina v obeh pogledih, obnovitev z all, prazen drugi projekt, pet ničel in tri prazne kolone. Osnovni testi praznega projekta in table. |
| R12 | Novi pregled nima API-zapisov; nespremenjeni `TaskDetails`, `TaskBoard`, `api`, skupni tipi in obstoječi prikaz datumov. Novi slogi uporabljajo Folio. | A01: brez zapisov in UI-klicev testnih kontrol, Unicode/navadno besedilo, ID z `/`, bralne podrobnosti; A04: širina 390 px; A05: prestopni datum; D04 in vseh 38 osnovnih testov. Vizualni posnetki opisani zgoraj. |

Izvedeni predikat razvrščanja uporablja Δ = `calendarDay(task.dueDate) - calendarDay(referenceDate)`. Če je status done, velja G = done. Sicer so štirje pogoji Δ < 0, Δ = 0, 0 < Δ ≤ 7 in Δ > 7 disjunktni in za veljavne koledarske datume popolni. Števci uporabljajo celotno T, filtrirano zaporedje pa V = T.filter(G = f) oziroma T za all; datumi in statusi se nikjer ne spreminjajo.

## Predaja pregledovalcu

Spremenjene oziroma dodane implementacijske datoteke so samo `src/App.tsx`, `src/styles.css`, `src/deadlines.ts` in `tests/agent/deadlines.spec.ts`; lastna dokumentacija je ta zapis ter oba dnevnika preverjanja. Specifikacija, zgodovina specifikacije, dokumenti pregledovalca, skupni testi, strežnik, tipi, odvisnosti in nastavitve niso bili spreminjani. V predani specifikaciji ni bilo ugotovljene napake ali izpuščene izvirne zahteve.

Pregledovalec lahko začne s sledljivostjo zgoraj in končnim dnevnikom; prvi dnevnik pojasnjuje popravljeno pripravo lastnih testov. Nedostopni končni testi, drugi brskalniški pogoni in formalna revizija dostopnosti ostajajo nepreverjeni. Ročni strežnik na 5193/3123 ni bil potreben: vizualni dokazi so nastali v brskalniških testih na predpisanem testnem strežniku 5174/3102, z obstoječim `connectOptions.wsEndpoint`. Dodatnih agentov ali zunanjih storitev nisem zaganjal.

## Omejitve

Spreminjam le `src/`, `tests/agent/` in svoje zapise v `docs/agent/`. Infrastruktura, odvisnosti, skupni testi ter navodila so samo berljivi. Javni internet je blokiran; dovoljene so lokalne storitve te naloge. `chromium.launch()` ni podprt. Končni nedostopni testi niso izvedeni. Rok faze je 2026-09-25T16:45:51.055Z; zadnja minuta je namenjena predaji.
