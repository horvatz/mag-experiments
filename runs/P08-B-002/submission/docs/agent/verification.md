# P08 — Implementacija in preverjanje

Začetni zapis: 2026-09-25. Vloga: implementer. Prebrani so `PROJECT_RULES.md`, `task/instructions.md`, `task/specification-template.md` in predana `specification.md`. Izvirne zahteve R01–R12 ostajajo obvezne. Specifikacije in datotek pregledovalca ne spreminjam.

## Začetni načrt (ob nastanku zapisa še neizvedeno)

- Pregledati obstoječe komponente, potrjeni dizajn in testno infrastrukturo.
- Dodati koledarsko klasifikacijo in lokalno stanje referenčnega datuma/filtra, pet števcev ter skupen filtriran seznam za oba prikaza (R01–R11).
- Ohraniti bralni API, podrobnosti in prilagodljiv Folio (R12).
- Dodati smiselne teste v `tests/agent/` za mejne datume, identiteto/vrstni red, ponastavitve, praznine in stanje neveljavnega vnosa.
- Pred daljšim preverjanjem preveriti čas. Izvesti `npm run check` (slog, tipi, gradnja, osnovni, razvojni in lastni testi) ter zapisati dejanske rezultate.
- Pred rokom dopolniti sledljivost R01–R12 in omejitve ter predati pregledovalcu.

## Izvedene spremembe

- `src/deadlines.ts`: fiksen začetni datum, imena skupin, validacija datuma in razvrščanje z UTC koledarskimi dnevi; status `done` ima prednost (R01–R05).
- `src/App.tsx`: projektno lokalno stanje vnosa, zadnjega veljavnega datuma in filtra; opozorilo ob praznem vnosu; pet števcev celotnega projekta; isti stabilno filtriran seznam za preglednico in tablo; prazna skupina z uporabnimi kontrolami (R06–R11). Obstoječi ključ projekta zagotavlja ponastavitev; navigacija in shramba nista spremenjeni.
- `src/styles.css`: nove kontrole in števci uporabljajo obstoječe površine, obrobe, poudarke in prilagodljivo razporeditev Folio (R12).
- `tests/agent/deadlines.spec.ts`: osem lastnih testov S01/S03, trije S02 po časovnih pasovih ter S04–S07.

## Končni izid in dokazila

`npm run check` je končan z izhodno kodo **0**. ESLint, TypeScript in produkcijska gradnja so uspešni; **54 testov je uspešnih (27,8 s)**: 14 API, 24 osnovnih brskalniških, 8 razvojnih P08 in 8 lastnih. Celoten dnevnik: [check.log](check.log). Nobenega popravka po tem uspešnem zagonu v kodi ali testih ni bilo.

Vsi lastni testi so v [deadlines.spec.ts](../../tests/agent/deadlines.spec.ts). S02 preveri osem koledarskih primerov v vsakem od treh pasov (UTC, Europe/Ljubljana, America/Los_Angeles), vključno z mesecem, letom, prestopnim februarjem, običajnim februarjem in obema prehodoma DST. S01/S03 uporablja 12 opravil, podvojene Unicode naslove, drugačne ID-je in premešano zaporedje. S07 preverja 390 px, dolga besedila, vidni fokus, opozorilo in nič zapisov API.

Ročni vizualni pregled je izveden prek `chromium.connect(wsEndpoint)` na lokalnem strežniku `WEB_PORT=5193 API_PORT=3123 npm run dev`. Pregledani so vsi štirje shranjeni posnetki: [namizje/preglednica](desktop-table.png), [namizje/tabla](desktop-board.png), [telefon/preglednica](mobile-table.png), [telefon/tabla z opozorilom](mobile-board.png). Primerjava z `docs/dizajn.md` in izhodiščnim `docs/predogled/telefon.png` potrjuje ohranjene barve, tipografijo, navigacijo, kartice in preglednico. Nove kontrole se prilagodijo širini; stran se ne razširi (izmerjeno `scrollWidth=clientWidth=1440` oziroma `390`). Tabla in preglednica ohranita notranje vodoravno drsenje.

## Sledljivost R01–R12

V spodnji tabeli »uspešno« pomeni dejansko opravljen test v dnevniku `check.log`; D01–D04 so razvojni testi, S01–S07 lastni testi. Predikati in splošna pravila ostajajo v predani specifikaciji.

| Zahteva | Izveden pogoj in koda | Dejanski test/scenarij | Izid |
| --- | --- | --- | --- |
| R01 | `deadlines.ts:3`, `App.tsx:14`: začetno stanje `(2026-09-21,2026-09-21,all)`. | D01; S01/S03 z uro naprave v letu 2037. | Uspešno. |
| R02 | `deadlines.ts:26`: `status=done` ima prednost pred rokom. | S01/S03: done na datumih pred, na in po referenci, vključno z mejama tedna; D04. | Uspešno. |
| R03 | `deadlines.ts:28`: negativna razlika → overdue; nič → today. | S01/S03: odprta opravila na r−1 in r; D01/D03. | Uspešno. |
| R04 | `deadlines.ts:30`: razlika 1–7 → week, več → later. | S01/S03: r+1, r+7, r+8; števci (1,1,3,2,5), skupaj 12; D02. | Uspešno. |
| R05 | `deadlines.ts:15`: ordinal UTC koledarskega dne, brez lokalnega časa. | Trije S02: 24 koledarskih scenarijev; prestopni dan tudi kot today. | Uspešno. |
| R06 | `App.tsx:18`, `App.tsx:69`: števci iz celotnega T, elementi imajo predpisane oznake in številčno vsebino. | S01/S03 preveri vseh pet števcev pri vseh šestih filtrih v obeh prikazih; D02. | Uspešno. |
| R07 | `App.tsx:19`, `App.tsx:78`: stabilni filter in izris po ID, brez mutacij T. | S01/S03: vsi filtri, zaporedje preglednice in posameznih stolpcev, drugi ID-ji, podvojeni naslovi; nič zapisov. | Uspešno. |
| R08 | `App.tsx:54`, `App.tsx:68`: prazen vnos spremeni le osnutek; veljaven spremeni referenco; filter ostane. | S04: veljaven → prazen → veljaven vnos, opozorilo, isti števci in izbor; D03. | Uspešno. |
| R09 | `App.tsx:74`, `App.tsx:78`: oba prikaza dobita `visibleTasks`; stanje je v ProjectView. | S01/S03: isti ID-ji; S04: prazen osnutek in filter preživita oba preklopa; D04. | Uspešno. |
| R10 | `App.tsx`, obstoječi `key={project.id}` ter lokalni `useState`; brez sprememb URL/shrambe. | S05: menjava, vrnitev, osvežitev v obeh pogledih, prazen datum, brez novih URL-parametrov ali local/sessionStorage; pregled kode. | Uspešno. |
| R11 | `App.tsx:69`, `App.tsx:73`: prazna množica → ničle; prazen filter → predpisano sporočilo in uporabne kontrole. | S06: prazen projekt, eno opravilo, prazen filter in vrnitev na all v obeh pogledih; osnovna testa prazne preglednice/table. | Uspešno. |
| R12 | `App.tsx:13` ostane GET; podrobnosti, API, data-task-id in imena pogledov niso spremenjeni; `styles.css:66` in `:181`. | S01/S03: podrobnosti in nič zapisov; S07: 390 px in fokus; vsi osnovni/API testi; vizualni pregled. | Uspešno. |

## Predaja pregledovalcu

Implementacija in preverjanje sta zaključena pred zadnjo minuto faze. Spremenjena izvorna koda: `src/App.tsx`, `src/deadlines.ts`, `src/styles.css`; lastni testi: `tests/agent/deadlines.spec.ts`; dokazila so v tem dokumentu, dnevniku in štirih posnetkih. Specifikacija, njena zgodovina, datoteke pregledovalca, skupni testi, infrastruktura, odvisnosti in strežnik niso bili spremenjeni.

Napake ali izpuščene obvezne zahteve v predani specifikaciji niso bile odkrite. Znane neizpolnjene zahteve: **ni**. Pregledovalec naj uporabi shranjena dokazila in opravi neodvisni pregled; nedostopni končni testi ostajajo nepreverjeni.

## Omejitve okolja

Javni internet je blokiran; uporabljam samo izvoz in lokalne storitve. Infrastruktura, odvisnosti, skupni tipi/testi ter navodila ostajajo samo za branje. Za lastne brskalniške skripte je dovoljen priklop `chromium.connect(wsEndpoint)` iz `task/browser.json`; lokalni `chromium.launch()` ni na voljo. Nedostopni končni testi ne bodo navedeni kot izvedeni.

`git status --short` ni uspel: sistemski `xcrun` poroča o manjkajoči poti `/Library/Developer/CommandLineTools`. Vej ali oddaljenih repozitorijev nisem spreminjal. To ne preprečuje lokalne gradnje in testiranja.
