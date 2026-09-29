# P08 – implementacija in preverjanje

Začetni zapis implementerja, 2026-09-23. Prebrani so PROJECT_RULES.md, task/instructions.md, task/specification-template.md in predana docs/agent/specification.md. Izvirne zahteve R01–R12 ostajajo merilo. Specifikacije in pregledovalčevih dokumentov ne spreminjam.

**Končno stanje: izvedeno in pripravljeno za pregled.** Zadnji `npm run check` je končal z izhodno kodo 0: lint, preverjanje tipov, produkcijska gradnja in **52/52 testov uspešnih** (38 osnovnih, 8 razvojnih P08, 6 lastnih). Spodnji začetni načrt in vmesni zapisi so ohranjena zgodovina; končni rezultati in sledljivost so na koncu dokumenta.

## Načrt in trenutno stanje

- Izvedba še ni opravljena: lokalni referenčni datum in filter projekta, koledarska razvrstitev, pet neodvisnih števcev, skupne filtrirane vrstice preglednice in table ter prazna stanja.
- Načrtovano, še neizvedeno: pregled obstoječega dizajna in kode; lastni testi mej datumov, prednosti done, celovitosti skupin, stanja filtrov in praznih projektov.
- Načrtovano, še neizvedeno: `npm run check` (slog, tipi, gradnja, osnovni, razvojni in lastni testi); preverjanje 390 px in bralnosti prek brskalniških testov.
- Načrtovano: dopolnitev sledljivosti R01–R12 z dejanskimi rezultati in predaja vsaj minuto pred rokom faze 18:58:43.827 UTC.

## Omejitve

Dovoljeni so samo ta izvoz in njegove lokalne storitve. Infrastruktura, odvisnosti, skupni testi in tipi so samo berljivi. Brskalnik v lastnih skriptah zahteva `chromium.connect` na wsEndpoint iz task/browser.json; `chromium.launch()` ni dovoljena delujoča pot. Končni testi niso dostopni. Ob začetnem zapisu še ni bil izveden noben test.

## Izvedene spremembe in vmesni rezultat

- `src/deadlines.ts`: začetni datum, imena skupin, preverjanje koledarskega vnosa in disjunktna razvrstitev z UTC-dnevi, prednost `done` (R01–R05).
- `src/App.tsx`, `ProjectView`: ločeno besedilo polja in zadnji veljavni datum, projektno lokalni filter, neodvisni števci, skupen stabilni seznam za preglednico in tablo, opozorilo in prazna skupina (R06–R11). Obstoječi ključ projekta zagotavlja ponastavitev; brez novih URL-parametrov ali shrambe.
- `src/styles.css`: kontrola datuma, select in pet števcev v obstoječih barvah ter prilagodljivi mreži Folio (R12). Obstoječa tabla, API in podrobnosti niso spremenjeni.
- `tests/agent/deadlines.spec.ts`: šest dodatnih testov S1, S3, S4/S5 in S2 v treh časovnih pasovih. Pokrivajo 12 premešanih opravil, enake naslove/Unicode, vrstni red in ID-je, 0/1 opravil, prazno polje, preklapljanje prikazov, reset, shrambo, bralnost, podrobnosti in širino 390 px. S2 preverja osem konkretnih koledarskih mej v vsakem časovnem pasu.
- `npm run check` je zagnan; rezultat še ni znan. Dnevnik: `docs/agent/check.log`.
- `git status --short` ni uspel: okolje nima veljavnega `/Library/Developer/CommandLineTools` oziroma `xcrun`. Infrastrukture ne popravljam. Ni bilo potiska ali oddaljenih operacij.
- Pri primerjavi predane specifikacije z izvornimi zahtevami ni bila ugotovljena napaka specifikacije.

## Zgodovina preverjanja in popravkov

1. Prvi `npm run check`: lint, tipi in gradnja uspešni; 38 osnovnih in 8 razvojnih testov uspešnih, šest lastnih testov neuspešnih. Celoten ohranjen dnevnik je `check.log`.
2. Natančni `getByLabel` pri ovitem selectu je zajel tudi besedilo možnosti; kontrolama sem dal ločeni eksplicitni oznaki `label htmlFor`. Dostopno ime izbirnika ostaja Pogled rokov. Test tipkovnice upošteva več notranjih korakov datumskega polja Chromium.
3. Koledarski test je pri ponovnem obisku istega fragmenta ohranil prejšnje naložene testne podatke. Priprava vsakega koledarskega primera zdaj najprej odpre prazno stran in odstrani prejšnje prestrezanje GET. Produkcijsko razvrščanje ni bilo spremenjeno zaradi te testne napake.
4. Po popravkih je ponovno zagnan celoten `npm run check`; rezultat bo spodaj, dnevnik `check-final.log`.
5. Ročni vizualni pregled prek povezave `chromium.connect` na lokalni storitvi 5193/3123: posnetka `desktop.png` (1440 px) in `mobile.png` (390 px) pregledana, ohranjeni Folio, navigacija, trije statusni števci in preglednica. Pri 390 px izmerjeno `scrollWidth = innerWidth = 390`. Pripravljen tudi `mobile-board.png`.

## Končni rezultati in sledljivost

Dokaz zagona: [check-final.log](check-final.log), zaključek `52 passed (25.8s)`; izhodna koda 0. HTML poročilo je v `playwright-report/html/index.html`. Pregledan je tudi [posnetek mobilne table](mobile-board.png); tabla se pomika znotraj svojega prikaza, stran ne presega širine. Lokalni strežnik ročnega pregleda 5193/3123 je po pregledu ustavljen, testni zagon je zaključen.

Povezave testov: [S1](../../tests/agent/deadlines.spec.ts#L24), [S3](../../tests/agent/deadlines.spec.ts#L66), [S4/S5](../../tests/agent/deadlines.spec.ts#L119), [S2 v treh časovnih pasovih](../../tests/agent/deadlines.spec.ts#L166), [D01–D04](../../tests/development/P08.spec.ts). Vsi spodaj navedeni testi so dejansko uspešno izvedeni v zadnjem celotnem zagonu.

| Zahteva | Izvedeni pogoj in koda | Dejansko preverjanje in izid |
| --- | --- | --- |
| R01 | `deadlines.ts:3`, `App.tsx:14`: začetni datum 2026-09-21, filter all | D01 namizno/mobilno; S3 s sistemsko uro leta 2037: uspešno |
| R02 | `deadlines.ts:28`: done ima prednost pred datumom | S1: done s preteklim, današnjim, tedenskim in prihodnjim rokom; D04: uspešno |
| R03 | `deadlines.ts:30`: negativna razlika overdue, nič today | D01/D03; S1 vse skupine; S3 prerazvrstitev: uspešno |
| R04 | `deadlines.ts:32`: odprta +1 do +7 week, od +8 later | D02; S1 +1/+7/+8, disjunktna in popolna razdelitev 12 ID-jev: uspešno |
| R05 | `deadlines.ts:17`: UTC-polnoči izražene v celih dnevih | S2: 8 mej × 3 časovni pasovi, mesec/leto, prestopni in neprestopni februar ter evropski/ameriški DST: uspešno |
| R06 | `App.tsx:18`: štetje vsakega opravila pred pogojem filtra | S1 isti števci pri vseh filtrih; S3 sprememba datuma in prazen vnos; S4 ničle: uspešno |
| R07 | `App.tsx:19`, `App.tsx:61`: stabilen filter, vseh šest možnosti | S1 preveri točno zaporedje ID-jev vseh skupin ter all, podvojene naslove in datumska polja: uspešno |
| R08 | `App.tsx:14`, `App.tsx:56`: ločena draft in veljavni datum, opozorilo | D03; S3 veljaven → prazen → veljaven, ohranitev števcev/filter/ID-jev: uspešno |
| R09 | `App.tsx:72`, `App.tsx:76`: isti visibleTasks za oba prikaza | S1 vse skupine in vrstni red znotraj stolpcev; S3 oba preklopa s praznim datumom; D04: uspešno |
| R10 | `App.tsx:116`: projektni key in lokalni useState brez shrambe | S3 menjava in vrnitev projekta, osvežitev, opozorilo, nespremenjeni localStorage/sessionStorage in URL: uspešno; statični pregled src ne najde nove trajne shrambe |
| R11 | `App.tsx:18`, `App.tsx:71`: ničelni števci in sporočilo prazne skupine | S4 oba prazna projekta, en zapis, prazna skupina, all in today v obeh pogledih; osnovni testi prazne table: uspešno |
| R12 | `App.tsx:13`, nespremenjena TaskBoard/TaskDetails/API; `styles.css:66` | S1 podatki in podrobnosti Unicode/ID, tipkovnica in brez zapisov; S4/S5 dolga besedila/390 px; D04 in vseh 38 osnovnih; vizualni pregled namizno/mobilno: uspešno |

## Predaja pregledovalcu

Spremenjena produkcijska koda: `src/App.tsx`, novi `src/deadlines.ts`, dopolnjen `src/styles.css`. Lastni testi: `tests/agent/deadlines.spec.ts`. Dokumenti implementerja: ta zapis, oba dnevnika preverjanja ter trije posnetki. Specifikacija, njena zgodovina, reviewerjevi dokumenti, skupni testi, infrastruktura, odvisnosti, tipi in strežnik niso bili spreminjani. Ni bilo uporabe drugih projektov, povezovalnikov, oddaljenih repozitorijev ali dodatnih agentov.

Ni znanih neizpolnjenih zahtev ali napake specifikacije. Končni skriti testi niso dostopni in niso bili izvedeni. Preverjanje brskalnikov je omejeno na nameščeni Chromium; Firefox, WebKit in dejanske mobilne naprave niso bili preverjeni. Izvajanje Git je blokirano z manjkajočim xcrun, zato git diff/status ni na voljo; izpis te omejitve je naveden zgoraj. Opozorila npm o http-proxy ter NO_COLOR/FORCE_COLOR niso preprečila preverjanja.

Zapis predaje je zaključen več kot 60 sekund pred rokom faze. Ob zadnjem preverjanju časa pred sestavo predaje je ostalo 185 sekund faze in 544 sekund skupnega časa; nadaljnji čas je na voljo pregledovalcu in morebitnim popravkom prvotnega avtorja.
