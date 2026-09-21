# P05 — Dokazi izvedbe in sledljivost

2026-09-22 · postopek C · izvedeno z enim agentom.

Viri: [specifikacija](P05/spec.md), [načrt](P05/plan.md), [naloge](P05/tasks.md). Po navodilu koraka implementacije so rezultati zbrani tukaj namesto v načrtovanem `P05/validation.md`.

## Spremembe

V `src/App.tsx` so dodani lokalni velikost, filter in stran, stabilno filtriranje pred rezom, enoten odsek za preglednico in tablo ter dostopne kontrole in status. Povzetek še vedno šteje celoten projekt. Obstoječi ključ projekta zagotavlja ponastavitev ob menjavi projekta; pogled in podrobnosti istega projekta ohranijo stanje. V `src/styles.css` so dodani samo slogi novih kontrol z obstoječimi spremenljivkami Folio. `TaskBoard`, podrobnosti, javni API in infrastruktura niso spremenjeni.

## Potek in dejanski zagoni

- T001: ob začetku ustvarjen ta zapis; vsa preverjanja so bila označena kot neizvedena. Predviden je bil `npm run check` z obstoječim projektom `agent`.
- T002–T004: izvedena koda in slogi. T005–T007: napisanih deset namenskih testov v [tests/agent/P05.spec.ts](../../tests/agent/P05.spec.ts), z 0/1/13 opravili, nesortiranimi ID-ji, ponovljenimi naslovi in Unicode besedilom.
- Prvi `npm run check`: **lint, typecheck in build uspešni; 54 testov uspešnih, 2 neuspešna; izhod 1**. Uspelo je vseh 38 osnovnih in 8 razvojnih preverjanj ter 8 lastnih. Dve napaki sta bili v lastnem testnem zaporedju: P01 za velikost 10 je po vrnitvi na prvo stran kliknil pravilno onemogočeno Prvo stran; P02 je na že zadnji strani kliknil pravilno onemogočeno Zadnjo stran. [Celoten izvirni dnevnik](P05/check.log).
- Popravek je spremenil samo dva koraka v lastnih testih: premik na prvo stran je potreben, kadar prejšnji premik še ni dosegel prve; na zadnjo se klikne, kadar je gumb omogočen. Preverjanja robov, ciljnih ID-jev in izidov so ohranjena. Aplikacijska koda po prvem zagonu ni bila spremenjena.
- Nato `npm run lint && npm run typecheck && npm test -- --project=agent`: **uspeh, izhod 0, vseh 10 lastnih testov uspešnih (7,2 s)**. [Dnevnik ponovnega preverjanja](P05/agent-recheck.log).

Končno je uspešnih vseh **56 različnih testnih primerov**: 38 osnovnih + 8 razvojnih + 10 lastnih. Celotni `npm run check` ni bil ponovno zagnan; njegovo začetno neuspešno stanje ostaja dokumentirano. Po popravku samo testov so bili ponovno preverjeni slog, tipi in vsi lastni testi; gradnja in nespremenjeni skupni/razvojni testi so uspešni iz prvega zagona.

## Sledljivost R01–R12

Pogoji in predikati so določeni v [specifikaciji](P05/spec.md#zahteve-in-pravila). Oznake P01–P05 so začetki dejanskih imen lastnih testov, navedenih v obeh dnevnikih; D01–D04 so nespremenjeni razvojni testi. »Uspeh« spodaj pomeni opazovane navedene scenarije in pregled kode, ne izvedbe skritih testov.

| Zahteva | Pogoj | Test ali scenarij | Datoteka in del kode | Izid ter dokaz |
| --- | --- | --- | --- | --- |
| R01 | Začetni all/all in izvorni red vseh ID-jev | P01: ordered pages… (2/5/10) | [App.tsx](../../src/App.tsx#L15): začetno stanje, filteredTasks | Uspeh, [ponovitev](P05/agent-recheck.log). |
| R02 | Zaporedni odseki brez izgube ali podvajanja | P01: ordered pages… (2/5/10), D01 | [App.tsx](../../src/App.tsx#L18): filter, start, visibleTasks | Uspeh, [ponovitev](P05/agent-recheck.log), [razvojni testi](P05/check.log). |
| R03 | Vsi cilji in onemogočeni robovi | P01: ordered pages…; P04 praznine | [App.tsx](../../src/App.tsx#L75): štirje gumbi | Uspeh, [ponovitev](P05/agent-recheck.log); test preveri tudi nespremenjeno stanje po native click na onemogočenem gumbu. |
| R04 | Sprememba velikosti vrne prvo stran tudi, ko bi druga ostala veljavna | P01: changing size resets a still-valid second page; D04 | [App.tsx](../../src/App.tsx#L25): changePageSize | Uspeh, [ponovitev](P05/agent-recheck.log). |
| R05 | Filter pred rezom, stabilni vrstni red in ponastavitev | P02: filters precede paging…; P04 nonmatching; D03 | [App.tsx](../../src/App.tsx#L18): filteredTasks; changeFilter | Uspeh, [ponovitev](P05/agent-recheck.log), vsi trije statusi in all. |
| R06 | Preglednica in tabla imata iste ID-je globalnega odseka | P02: filters precede paging…; P05 mobile; D03 | [App.tsx](../../src/App.tsx#L82): podajanje visibleTasks in preslikava vrstic; [TaskBoard.tsx](../../src/TaskBoard.tsx#L17): filtriranje podanega odseka | Uspeh, [ponovitev](P05/agent-recheck.log), tudi mešan nefiltriran odsek. |
| R07 | Pogled in podrobnosti ohranijo stran/velikost/filter | P02: filters precede paging… | [App.tsx](../../src/App.tsx#L13): stanje ProjectView, povezavi pogledov in TaskDetails | Uspeh, [ponovitev](P05/agent-recheck.log), oba pogleda, oba načina zaprtja in vrnitev fokusa. |
| R08 | Projekt/osvežitev ponastavita; brez novega URL-ja ali shrambe | P03: project changes and reload…; pregled kode | [App.tsx](../../src/App.tsx#L126): key projekta in useState | Uspeh, [ponovitev](P05/agent-recheck.log), [pregled obsega](P05/scope-check.json). |
| R09 | Natančen status in indeksi filtriranega polja | P01: ordered pages…; P04 singleton; D02 | [App.tsx](../../src/App.tsx#L20): pageCount, indeksi; status pri vrstici 73 | Uspeh, [ponovitev](P05/agent-recheck.log), all, srednja in krajša zadnja stran. |
| R10 | Praznina ima ničelni status in štiri onemogočene gumbe; odstranitev filtra vrne prvo stran | P04: empty and singleton… (0/1); P04: a nonmatching filter… | [App.tsx](../../src/App.tsx#L73): status/gumbi in prazen prikaz | Uspeh, [ponovitev](P05/agent-recheck.log), prazna oba projekta in prazen filter. |
| R11 | Povzetek šteje T, stolpci štejejo V, skupno število se ne spremeni | P02: filters precede paging… | [App.tsx](../../src/App.tsx#L33): counts, count-badge; [TaskBoard.tsx](../../src/TaskBoard.tsx#L23): column-count | Uspeh, [ponovitev](P05/agent-recheck.log), filtrirani in mešani odsek. |
| R12 | Brez mutacij/zapisov, ohranjene povezave, nalaganje in odzivni Folio | P05: mobile controls…; P02; vsi baseline/api; D04 | [App.tsx](../../src/App.tsx#L14): javni GET in lokalni izračun; [styles.css](../../src/styles.css#L66): kontrole | Uspeh, [oba zagona](P05/check.log), [lastna ponovitev](P05/agent-recheck.log), spodnji vizualni pregled. |

## Videz in meje sprememb

Vizualno pregledana lokalna posnetka [preglednice pri 390 pikah](P05/mobile-table.png) in [table pri 390 pikah](P05/mobile-board.png). Kontrole se prelomijo znotraj vsebine; status je čitljiv, fokus naslednje strani viden. Folio ohrani modri znak, navigacijo nad vsebino, povzetek, sistemsko pisavo in obstoječe kartice. Širina dokumenta ne presega okna v obeh pogledih (P05); preglednica in tabla imata notranje drsenje.

[Pregled obsega](P05/scope-check.json) primerja vsebino 64 zaščitenih datotek s [posnetkom pred implementacijo](P05/protected-files.json): nobena ni spremenjena. Zajeti so strežnik, skupni tipi in testi, razvojni testi/pripomočki, task, veščine, preostali Spec Kit in korenske nastavitve. V `src/` ni sklicev na `localStorage`, `sessionStorage`, `/__test/` ali testne pripomočke. P05 dodatno preveri nič zapisovalnih zahtev, nespremenjene strežniške podatke in nespremenjen GET rezultat. Testne kontrole uporablja le testni program.

## Omejitve in predaja

Vse naloge T001–T009 so dokončane. Ni znane neizpolnjene obvezne zahteve. Skriti končni testi niso dostopni in niso bili izvedeni; deset lastnih primerov ne izčrpa vseh možnih podatkov dovoljene domene. Navigacija med nezaključenim nalaganjem je preverjena le v obstoječem regresijskem obsegu; novih scenarijev sočasnih sprememb ne uvajamo.

Izvajalnik sproži naslednji korak `converge`. Kontrolni seznam kakovosti zahtev v tem koraku ni bil spreminjan; označene so le izvedbene naloge v `P05/tasks.md`.
