# Specifikacija P08: Koledarski pregled rokov

## Problem in kontekst

Folio omogoča pregled opravil projekta v preglednici in tabli. Uporabnik želi
roke razvrstiti glede na izrecen koledarski referenčni datum in izbrati eno od
skupin, ne da bi pri tem spreminjal podatke ali uporabljal sistemski čas.

## Vhodi, dejanja in izidi

- Vhod: referenčni datum `YYYY-MM-DD`, skupina `all|overdue|today|week|later|done`, seznam opravil projekta iz `/api`.
- Dejanji: vnos ali izbris referenčnega datuma ter izbor skupine v Pogledu rokov.
- Uspeh: števci in oba prikaza temeljita na istem razvrščanju; izbor prikaže izvorno zaporedje ustreznih ID-jev.
- Preklic ali napaka: prazen ali neveljaven vnos prikaže opozorilo, obdrži zadnji veljavni izračun in skupino.

## Zahteve in pravila

Za veljavna datuma `D` in `R` definirajmo `day7(R) = R + 7 dni` po koledarskih
dneh v UTC. Za opravilo `T` z `status != done` velja:

- `overdue(T) = T.dueDate < R`
- `today(T) = T.dueDate = R`
- `week(T) = R < T.dueDate <= day7(R)`
- `later(T) = T.dueDate > day7(R)`

Za `status = done` vedno velja `done(T)` in ne velja noben predikat odprtih
skupin. Predikati so paroma disjunktni in pokrivajo vsa veljavna opravila.
Razvrščanje uporablja `Date.UTC` in `setUTCDate`, zato je neodvisno od
časovnega pasu in prehoda na poletni čas.

| Zahteva | Pravilo oziroma sprejemni pogoj | Način preverjanja |
| --- | --- | --- |
| R01 | Začetni `R = 2026-09-21`, začetna skupina `all`; vrednost ni odvisna od ure naprave | Lastni test odpre aplikacijo in preveri vrednosti |
| R02 | `done(T)` ima prednost pred vsemi roki | Lastni test z dnevnim in kasnejšim končanim opravilom |
| R03 | `overdue` je strogo pred `R`, `today` je enak `R` | Lastni test z mejnima `R-1` in `R` |
| R04 | `week` vsebuje `R+1..R+7`, `later` nadaljevanje; skupine so popolne in disjunktne | Lastni test s seznamom, ki pokriva vse skupine |
| R05 | Datumski račun deluje v UTC čez meje meseca, leta in prestopni februar | Lastni test `2024-02-28 + 7` |
| R06 | Pet števcev šteje ves trenutni projekt, ne glede na izbrano skupino | Lastni test primerja vse števce pred in po izboru |
| R07 | Izbor prikaže ustrezno podmnožico v izvornem zaporedju | Skupni razvojni test in lastni test za tabelo in tablo |
| R08 | Veljaven datum takoj posodobi izračun in skupino; prazen prikaže opozorilo ter obdrži zadnji veljaven izračun | Skupni razvojni test D03 in lastni test |
| R09 | Tabela in tabla imata enake filtrirane ID-je; preklop ohrani datum, besedilo in skupino | Lastni test preklaplja med pogledoma |
| R10 | Nova projekta ali osvežitev ponastavita datum in skupino; brez trajne shrambe ali URL | Lastni test menjave projekta in osvežitve |
| R11 | Prazen projekt ima pet ničel; prazna skupina prikaže sporočilo in omogoča preklop | Lastna testiranja s pripravljenimi podatki |
| R12 | Pregled je samo branje prek `/api`, polja in podrobnosti ostanejo nespremenjeni | Skupni testi in lastna preverjanja pisanja |

## Izvedba in sledljivost

| Zahteva | Pogoj | Test ali scenarij | Datoteka in del kode | Izid ter dokaz |
| --- | --- | --- | --- | --- |
| R01–R04, R06–R09 | Razvrščanje in skupna stanja | `tests/agent/P08.spec.ts: A01–A03` | `src/deadlines.ts`, `src/App.tsx`, `src/TaskBoard.tsx` | Uspešno; dokaz v `docs/agent/verification.md` |
| R05 | Koledarsko seštevanje dni | `tests/agent/P08.spec.ts: A01` | `src/deadlines.ts` | Uspešno; dokaz v `docs/agent/verification.md` |
| R10–R12 | Ponastavitev, prazne skupine, samo branje, videz | `tests/agent/P08.spec.ts: A04–A7` | `src/App.tsx`, `src/styles.css` | Uspešno; dokaz v `docs/agent/verification.md` |

## Zgodovina popravkov

- 2026-10-13: Prva specifikacija za različico 1.0.
- 2026-10-13: Implementiral lokalni referenčni datum in Pogled rokov v `src/App.tsx`, čisto UTC datumsko logiko v `src/deadlines.ts`, pet števcev ter enoten filter za preglednico in tablo. Sledljivost posodobljena na lastne teste A01–A07.

## Odprta vprašanja in omejitve

- Ni odprtih vprašanj. Končni primeri niso dostopni; obseg preverjam z razvojnimi testi in lastnimi testi nad domeno iz zahtev.