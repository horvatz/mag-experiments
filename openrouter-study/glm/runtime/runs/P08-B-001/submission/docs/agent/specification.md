# Specifikacija: koledarski pregled rokov (P08)

## Problem in kontekst

Projektni pogled prikazuje opravila izbranega projekta v preglednici ali tabli. Uporabnik potrebuje koledarski pregled rokov glede na izrecen referenčni datum in enoten izbor skupine rokov.

Referenčni datum pri vsakem začetku projekta je `2026-09-21`, neodvisno od sistemske ure. Začetna skupina je `all`. Stanje sta lokalni trenutni projektni podatki, brez trajne shrambe in brez URL-ja.

## Vhodi, dejanja in izidi

Podatki so projekti in opravila iz javnega API-ja `/api/`. Vsako opravilo ima polja `id`, `projectId`, `title`, `description`, `status`, `assignee` in `dueDate`. Vmesnik doda vnos referenčnega datuma ter izbirnik `Pogled rokov` z vrednostmi `all/overdue/today/week/later/done`.

Referenčni datum se obravnava kot koledarski `YYYY-MM-DD`. Veljavna sprememba takoj preračuna skupine in prikaz, ne spreminja pa opravil ali izbranega filtra. Neveljaven ali prazen vnos prikaže opozorilo `Vnesi veljaven referenčni datum.` in ohrani zadnji uspešno preračunan prikaz. Menjava projekta ali osvežitev ponastavi datum na `2026-09-21` in skupino na `all`.

Stanje naj bo lokalno v trenutnem projektnem pogledu:

```text
referenceDateInput: string
referenceDate: string
selectedBucket: 'all' | 'overdue' | 'today' | 'week' | 'later' | 'done'
```

`referenceDateInput` je trenutno besedilo polja, `referenceDate` pa zadnji veljavni datum za preračun. Projekt naj se inicializira z `2026-09-21` in `all`; filter ne sme biti v `localStorage`, drugi trajni shrambi ali URL-ju.

## Zahteve in pravila

Za vsako opravilo definiraj skupino `group(task, refDate)`:

- če je `task.status = done`, je skupina `done`;
- sicer, če je `task.dueDate < refDate`, je skupina `overdue`;
- sicer, če je `task.dueDate = refDate`, je skupina `today`;
- sicer, če je `task.dueDate` v zaprtih dnevih `refDate + 1` do `refDate + 7`, je skupina `week`;
- sicer je skupina `later`.

Skupine so paroma izključujoče in pokrivajo vsa veljavna opravila. `all` vsebuje vsa opravila trenutnega projekta v izvornem vrstnem redu.

Datumski pripomoček naj bo čist; delovanje ne sme uporabljati trenutne ure, časovnega pasu ali DST. Uporabi številke leta, meseca in dneva, primerjaj celotni datum ter seštevaj koledarske dnege. Predvidena lokacija je `src/dueDates.ts`; preveri tudi prestopni februar in meje meseca ter leta.

| Zahteva | Pravilo oziroma sprejemni pogoj | Način preverjanja |
| --- | --- | --- |
| R01 | Ob inicializaciji projekta velja `refDate = 2026-09-21` in `bucket = all`. Vrednosti nista odvisni od trenutne ure. | Preveri začetni prikaz; pripomoček ali komponenta ne sme brati sistemske ure. |
| R02 | Za vsak `task` velja `task.status = done ⟺ group = done`; zaključena opravila ne padejo v `overdue/today/week/later`. | Enotski test klasifikacije, posebej datum za, na in po referenčnem datumu. |
| R03 | Za odprto opravilo velja `dueDate < refDate ⟹ group = overdue` in `dueDate = refDate ⟹ group = today`. | Enotski testi z dnevi pred referenco in z referenco. |
| R04 | Za odprto opravilo velja `refDate < dueDate ≤ refDate + 7 ⟹ group = week`, sicer `dueDate > refDate + 7 ⟹ group = later`. | Testi naslednji dan, 7. dan, 8. dan, meje meseca, leta in prestopni februar. |
| R05 | Primerjava in seštevanje datumov potekata po koledarskih dnevih `YYYY-MM-DD`, brez časovnih pasov in poletnega časa. | Izolirani testi datumskih mej in pripravljeni testni datumi čez meje. |
| R06 | Števci računajo iz celotnega trenutnega projekta; izbor skupine ne spremeni nobenega števca. | Spremeni izbirnik in primerjaj vseh pet številcev pred in po. |
| R07 | Izbor `all/overdue/today/week/later/done` prikaže samo pripadajoča opravila v izvornem vrstnem redu, brez sprememb datumov ali statusov. | Preklopi med vsemi vrednostmi in preveri ID-je, datume ter statuse. |
| R08 | Veljavna sprememba datuma takoj posodobi skupine in vidne vrstice ter ohrani izbrani filter. Prazna vrednost pokaže alert in ohrani zadnji veljavni preračun; naslednja veljavna vrednost skrije opozorilo. | UI test: sprememba datuma, prazna vrednost, spet veljavna vrednost. |
| R09 | Preglednica in tabla prikažeta isti filtriran niz ID-jev; preklop ohrani referenčni datum, trenutno besedilo v datumskem polju in izbrano skupino. | Preklopi pogled v več skupinah in primerjaj vse tri stanjne vrednosti. |
| R10 | Menjava projekta ali osvežitev inicializirata `refDate = 2026-09-21`, `bucket = all`; filter ni v trajni shrambi ali URL-ju. | Preklopi projekt, osveži stran in preveri shrambo/URL. |
| R11 | Prazen projekt ima pet ničel; prazna izbrana skupina v nepraznem projektu prikaže `Ni opravil v izbrani skupini.` in omogoča preklop. | API testi s praznim projektom in s skupino brez zadetkov. |
| R12 | Vnos sprejema obstoječe veljavne koledarske datume, pregled ne pošilja zapisov na API, polja in bralne podrobnosti ostanejo nespremenjeni, Folio pa ostane prilagodljiv širini 390 px. | Regresijski test bralnih pogledov in omejitve širine strani; spremljaj omrežne zahteve. |

Pet številcev ima vidna imena `Zapadlo`, `Danes`, `Naslednjih 7 dni`, `Pozneje` in `Končano`. Element z `aria-label="Število rokov <ključ>"` vsebuje samo številko, skupna regija pa ohrani `aria-label="Pregled stanj opravil"`.

Preglednica in tabla morata pokazati isti filtriran niz ID-jev. V nepraznem projektu prazna izbrana skupina prikaže `Ni opravil v izbrani skupini.` in izbirnik ostane uporaben. Ohrani `data-task-id` na vrsticah in karticah, dostopna imena obstoječih pogledov in stolpcev; morebitna nova dejanja ob opravilu morajo biti zunaj povezave opravila. Pri širini 390 px se cela stran ne sme razširiti; notranje drsenje preglednice in table je dovoljeno.

## Izvedba in sledljivost

| Zahteva | Pogoj | Test ali scenarij | Datoteka in del kode | Izid ter dokaz |
| --- | --- | --- | --- | --- |
| R01–R05 | Predikati klasifikacije in koledarsko seštevanje dni. | Enotski testi klasifikacije in datumskih mej; skupni testi D01–D04 po implementaciji. | Predviden `src/dueDates.ts`, `src/App.tsx`. | Ni izvedeno; specifikacija je predana implementerju. |
| R06–R11 | Števci, izbirnik, ohranjanje stanja, reset projekta in prazni prikazi. | UI testi z nadzorovanimi GET odgovori, preklopi pogledov in projektov. | Predviden `src/App.tsx`, `src/TaskBoard.tsx`. | Ni izvedeno; specifikacija je predana implementerju. |
| R12 | Brez zapisovalnih API-jev, ohranjena dostopnost in omejena širina. | Bralni regresijski test, spremljanje omrežnih zahtev in širina 390 px. | Predviden `src/App.tsx`, `src/TaskBoard.tsx`, `src/styles.css`. | Ni izvedeno; specifikacija je predana implementerju. |

## Odprta vprašanja in omejitve

Ni znatnih nejasnosti. Specifikacija ne spreminja strežnika, skupnih tipov, odvisnosti, infrastrukture ali skupnih testov. Vmesnik ne sme brati ali uporabljati testnih kontrol `/__test/`, ne sme dodati zapisovalnega API-ja in ne sme strežniških podatkov nadomestiti z lokalno kopijo. Ohrani potrjen Folio videz iz `docs/dizajn.md`.
