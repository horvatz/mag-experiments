# Preverjanje P08 — postopek C

2026-09-25. Izvedba po [specifikaciji](P08/spec.md), [načrtu](P08/plan.md), [nalogah](P08/tasks.md) in izvirnih R01–R12. Ta dokument je po navodilu izvajalnika osrednji zapis preverjanj; nadomešča prvotno predvideni `P08/verification.md`.

## Izvedba in rezultati

- T001: ob začetku prebrani lokalna veščina, projektna pravila in dokumenti; preverjen čas in potrjene meje sprememb. Preverjanja takrat še niso bila izvedena.
- T002–T005: dodani `src/deadlines.ts`, lokalno stanje in prikaz v `src/App.tsx` ter dopolnilni slogi v `src/styles.css`. Klasifikacija uporablja koledarske dneve v UTC; oba pogleda dobita isto filtrirano zaporedje. Prazno polje ohrani zadnji veljavni datum, menjava projekta pa ponastavi lokalno stanje.
- T006: dodanih 7 lastnih testov v [tests/agent/P08.spec.ts](../../tests/agent/P08.spec.ts). Pričakovani koledarski izidi in ID-ji so izrecno določeni v testih.
- T007: `npm run check`, izhodna koda **0**. Lint, preverjanje tipov in produkcijska gradnja uspešni; **53/53 Playwright testov uspešnih** v 20,5 s: 38 osnovnih (14 API + 12 namiznih + 12 mobilnih), 8 razvojnih P08 in 7 lastnih. Celotni [dnevnik zagona](P08/check.log) vsebuje ukaz, rezultate in `EXIT_CODE=0`. Popravki po tem zagonu so samo dokumentacijski; ponovitev ni bila potrebna.
- T008: vseh R01–R12 povezanih s pogoji, kodo in dejanskimi testi v [tabeli sledljivosti](P08/spec.md#izvedba-in-sledljivost). Naloge označene po dejanski izvedbi.

## Lastna preverjanja

| Test | Dejansko preverjeno | Zahteve |
| --- | --- | --- |
| A01: calendar boundaries, done priority and complete immutable partition | Prednost done; meje −1/0/1/7/8; mesec/leto; 2028 in stoletni leti 2000/2100; leto 0099; popolna disjunktna razdelitev in nespremenjeni objekti | R02–R07, R12 |
| A02: fixed start, every filter, global counters and identical board IDs | Ura naprave 2040; začetni datum 2026-09-21; 13 opravil s podvojenimi naslovi in različnimi ID-ji; vseh šest filtrov; števci celotnega projekta; isti ID-ji v obeh pogledih in vrstni red po stolpcih; brez zapisov | R01–R04, R06–R07, R09, R12 |
| A03: draft state across views, recovery, project switch and reload | Veljaven/prazen/veljaven datum, opozorilo, ohranjen izračun in filter pri preklopu, menjava projekta/vrnitev/osvežitev, nespremenjena localStorage/sessionStorage/piškotki in URL brez filtra | R08–R10, R12 |
| A04: both empty projects retain zero counters and usable views | Dva prazna projekta, pet ničel, oba pogleda in dosegljivi filtri | R11 |
| A05: one task, empty group recovery, read-only details and mobile Folio | Eno opravilo, prazna skupina in vrnitev na all, podatki in podrobnosti po ID-ju v obeh pogledih, Unicode/navadno besedilo, datum 2028-02-29, vidni fokus in širina 390, brez zapisov | R07, R09, R11–R12 |
| A06: browser calendar boundaries across DST and leap day (2 zagona) | Europe/Ljubljana in America/New_York; spomladanski in jesenski prehodi poletnega časa, prestopni februar in prehod leta prek dejanskega datumskega vnosa | R05, R08, R12 |

Razvojni D01–D04 so uspešni na namizju in mobilni napravi. Skupni testi dodatno potrjujejo obstoječe bralne podrobnosti, navigacijo, nalaganje, napake in prazne prikaze.

## Vizualni pregled

Zagon za ogled: `WEB_PORT=5193 API_PORT=3123 npm run dev`. Lokalna skripta `node --input-type=module` je prebrala `wsEndpoint` iz `task/browser.json`, uporabila `chromium.connect(wsEndpoint)` in zajela oba pogleda pri 1440 in 390 pikah. Uporabljeni so podatki javnega API-ja tega strežnika.

Pregledani so [namizna preglednica](P08/folio-1440-table.png), [namizna tabla](P08/folio-1440-board.png), [mobilna preglednica](P08/folio-390-table.png) in [mobilna tabla](P08/folio-390-board.png). Folio ohranja navigacijo, barve, tipografijo, kartice in obstoječe števce stanj. Kontrole in pet novih števcev se prelomijo znotraj strani; notranje drsenje obeh pogledov ostaja. [Meritve](P08/visual-check.json): širina dokumenta je 1440 oziroma 390 pik v obeh pogledih, vsak prikazuje iste tri ID-je začetnega projekta (samodejni testi primerjajo dejanske ID-je pri drugih podatkih).

## Omejitve in predaja

Vseh osem izvedbenih nalog je opravljenih. Pri izvedenih preverjanjih ni ugotovljene neizpolnjene zahteve R01–R12. Testi pokrivajo izbrane robne primere opisane domene, ne vsake mogoče kombinacije podatkov. Neveljavni datumi podatkov ter nova pravila sočasnih sprememb so zunaj podanega obsega. Končni testi niso dostopni in niso navedeni kot opravljeni. Infrastruktura, odvisnosti, skupni tipi in skupni testi niso spremenjeni.

Zaključni dokumentacijski pregled: potrjenih 12 sprejemnih pogojev in 12 vrstic sledljivosti, 8 dokončanih nalog, veljavne lokalne povezave ter odsotnost `__test`, `localStorage` in `sessionStorage` v `src/`. Strežnik za ročni ogled na 5193/3123 je po pregledu ustavljen. Zaključni korak converge vodi izvajalnik.
