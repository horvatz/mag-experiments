# Preverjanje P05

2026-09-23 · izvedba v teku. Zahteve: [specifikacija](P05/spec.md), [načrt](P05/plan.md), [naloge](P05/tasks.md).

Dovoljene spremembe: src/, tests/agent/, docs/agent/ in izrecno dovoljeni procesni datoteki Spec Kit. Infrastruktura in odvisnosti ostanejo nespremenjene.

Načrtovana ukaza: `npm test -- --project=agent`, nato `npm run check`. Testi še niso izvedeni. Končni skriti testi niso dostopni.

Dokazila in končna sledljivost bodo zbrani v tem dokumentu (po aktualnih navodilih namesto ločenega P05/validation.md).

- T001: pregledani izhodiščna koda, konfiguracija in časovni proračun; brez namestitev.

- T002–T005: implementirano stanje, kontrole in skupni odsek obeh pogledov; dodani S01–S03, še neizvedeni. Skupni števci ostanejo vezani na celoten projekt.

- T006–T007: dodani S04–S06 in slogi kontrol Folio. Dodana S07–S08; testi in vizualni pregled še čakajo na zagon.

- Prvi `npm test -- --project=agent`: izhod 1; 11 uspešnih, S08 ni potrdil izbire po sami tipki ArrowDown. Ohranjen [dnevnik](P05/agent-tests-initial.log). Test je dopolnjen z odpiranjem selektorja in potrditvijo Enter; preverjanje se ponavlja.
- `npm run lint`: izhod 0; [dnevnik](P05/lint.log).
- Ponovitev S08 z odpiranjem/potrditvijo nativnega menija: izhod 1, vrednost ostala `all`; [dnevnik](P05/keyboard-retest.log). V povezanem Chromiumu avtomatizacija nativnega menija s tem zaporedjem ni potrjena. S08 zato nastavi velikost z uradnim `selectOption`, tipkovniško preveri premik fokusa med selektorjema in aktivacijo gumba z Enter; omejitev nativnega menija ostaja izrecno zabeležena. Aplikacija uporablja običajni HTML select brez lastnih tipkovničnih prestrezanj.

- Končni `npm test -- --project=agent`: izhod 0, 12/12 uspešnih (12,2 s); [dnevnik](P05/agent-tests.log).
- T008: vizualno pregledana [preglednica](P05/mobile-table.png) in [tabla](P05/mobile-board.png) pri 390 pik. Folio, notranje drsenje, prelom kontrol in vidni fokus so ohranjeni; širina dokumenta je avtomatizirano preverjena.

## Končni rezultati

| Ukaz | Izhod | Rezultat | Dokaz |
| --- | --- | --- | --- |
| `npm run lint` | 0 | Uspešno | [lint.log](P05/lint.log) |
| `npm test -- --project=agent` (končni zagon) | 0 | 12/12 uspešnih, 12,2 s | [agent-tests.log](P05/agent-tests.log) |
| `npm run check` | 0 | Lint, TypeScript, produkcijska gradnja in 58/58 testov; testi 27,4 s | [check.log](P05/check.log) |

Celotna zbirka vsebuje 38 osnovnih preverjanj (API in obstoječi vmesnik na namizju/mobilno), 8 razvojnih preverjanj P05 (D01–D04 na obeh napravah) in 12 lastnih preverjanj. Noben končni skriti test ni bil izveden. Po uspešnem celotnem preverjanju je bila posodobljena samo dokumentacija.

## Sledljivost R01–R12

Pogoji in predikati so v [specifikaciji](P05/spec.md#zahteve-in-pravila). S01–S08 označujejo dejanska imena v [lastnih testih](../../tests/agent/P05.spec.ts), D01–D04 pa imena v [razvojnih testih](../../tests/development/P05.spec.ts). Vse spodnje vrstice so uspešno preverjene v [celotnem dnevniku](P05/check.log); omejitev nativnega menija je opisana spodaj.

| Zahteva | Pogoj | Izvedeni testi | Koda |
| --- | --- | --- | --- |
| R01 | Privzeto all/all, vsa opravila v izvornem vrstnem redu | S01 (1 in 17 opravil), S05 | `src/App.tsx:15`, `:18`, `:77` |
| R02 | Zaporedni neprekrivajoči odseki brez izgub ID-jev | S02 (2, 5, 10), S03; D01, D02 | `src/App.tsx:18–24` |
| R03 | Prvi/prejšnji/naslednji/zadnji premik in onemogočeni robovi | S02, S06; D01, D02 | `src/App.tsx:88–93` |
| R04 | Sprememba velikosti vedno vrne prvo stran, tudi s še veljavne stare strani | S03; D04 | `src/App.tsx:57` |
| R05 | Filter pred razrezom, ohranjen vrstni red in reset | S03; D03 | `src/App.tsx:18`, `:22`, `:65` |
| R06 | Isti globalni odsek za oba pogleda, nato združevanje table | S04; D03 | `src/App.tsx:73`, `:77`; `src/TaskBoard.tsx:17` |
| R07 | Ohranjene nastavitve pri preklopu pogleda, odpiranju in obeh načinih zapiranja podrobnosti | S04; osnovne regresije podrobnosti | `src/App.tsx:15–17`, `:50–52`, `:98`; `src/TaskDetails.tsx` |
| R08 | Reset ob menjavi/vrnitvi projekta in reloadu; brez shrambe/URL nastavitev | S05 | `src/App.tsx:15–17`, `:126` |
| R09 | Natančno besedilo in indeksi nepraznega rezultata | S01, S02, S03; D02 | `src/App.tsx:19–24`, `:87` |
| R10 | Prazna projekta in prazen filter, ničelni status, štirje onemogočeni gumbi, odstranitev filtra | S06 (oba primera); osnovna prazna preglednica/tabla | `src/App.tsx:20`, `:23`, `:65`, `:73`, `:87–92` |
| R11 | Pregled in skupno število iz celotnega projekta; stolpci iz trenutnega odseka | S04, S06 | `src/App.tsx:25–28`, `:37–40`, `:49`, `:73`, `:95`; `src/TaskBoard.tsx:17–22` |
| R12 | Brez zapisov/sprememb podatkov, pravilni ID-ji in podrobnosti, regresije, Folio pri 390 pik | S04, S07, S08; D04; vseh 38 osnovnih preverjanj | `src/App.tsx`, `src/styles.css:66–72`; obstoječi API, navigacija, nalaganje in podrobnosti |

## Spremembe, pregled in omejitve

- Aplikacijska sprememba je omejena na [App.tsx](../../src/App.tsx) in [styles.css](../../src/styles.css). Dodani so lokalno stanje, filter pred razrezom, skupni odsek obeh pogledov, natančen status, prazna stanja in prelom kontrol po Folio. Izvirni podatki, skupni števci, povezave in infrastruktura ostajajo skladni z zahtevami.
- Lastni testi uporabljajo 17 opravil v preurejenem vrstnem redu, drugačne ID-je z Unicode in `/`, podvojene naslove, besedilo z ločili, enojni in prazni projekt. GET prestrezanje je samo v testih. Statični pregled `src/` ni našel uporabe testnih kontrol, testnih pripomočkov ali trajne shrambe.
- Pregledana sta posnetka [mobilne preglednice](P05/mobile-table.png) in [mobilne table](P05/mobile-board.png). Preverjeni so širina dokumenta, meje gumbov, prehod fokusa s Tab, aktivacija premika z Enter in vidna obroba fokusa. Nova dejanja niso v povezavah opravil.
- Dva začetna poskusa avtomatizacije izbire v nativnem HTML select samo s tipkami nista potrdila spremembe vrednosti. Vzrok tega vedenja povezanega brskalnika ni raziskan; izbor se v končnem testu preverja z `selectOption`. Tipkovnični Tab in Enter na gumbu sta uspešno preverjena. To je omejitev dokazil, ne trditev o potrjeni izbiri z vsemi tipkovničnimi zaporedji. Oba neuspešna dnevnika sta ohranjena zgoraj.
- Ni ugotovljene neizpolnjene funkcionalne zahteve R01–R12. Skriti končni testi niso dostopni. Navigacije med nalaganjem in sočasnih sprememb podatkov nismo širili prek osnovnih regresij.
- Odstopanje od prvotnih dokumentov: poročilo je po izrecnem navodilu implementacijskega koraka zbrano v `docs/agent/verification.md`, namesto v `docs/agent/P05/validation.md`; dokument ni podvojen.
