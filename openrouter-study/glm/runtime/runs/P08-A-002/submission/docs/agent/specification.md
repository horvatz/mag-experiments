# P08 — Koledarski pregled rokov

## Problem in kontekst

Folio trenutno prikazuje stanja opravil, vendar ne omogoča pregleda rokov glede na referenčni datum. Pilot dodaja koledarski filter rokov v vsakem projektu, hkrati pa ohranja obstoječo tabelo, tablo, podrobnosti, navigacijo in dostopna imena.

## Vhodi, dejanja in izidi

Podatki so `Project` in `Task` iz `shared/types.ts`, pridobljeni izključno z bralnimi GET zahtevami na `/api/`. Uporabnik vpiše referenčni datum (`YYYY-MM-DD`) in izbere skupino `all`, `overdue`, `today`, `week`, `later` ali `done`.

- Ob začetku projekta veljata `referenceDate = 2026-09-21` in `dueFilter = all`.
- Neveljaven oziroma prazen vnos pokaže opozorilo in ohrani zadnji veljavni referenčni datum.
- Veljaven datum takoj spremeni klasifikacijo in vidne vrstice, ne glede na trenutni pogled ali filter.
- Projekti se lahko razlikujejo; vsak projekt ima svoj trenutni prikaz, shranjen le v pomiku.

## Zahteve in pravila

| Zahteva | Pravilo oziroma sprejemni pogoj | Način preverjanja |
| --- | --- | --- |
| R01 | Ob vsaki pripravi pogleda projekta je `referenceDate=2026-09-21`, `dueFilter=all`; ne uporabi se ura naprave. | UI preizkus vstopa, preklopa projekta in osvežitve. |
| R02 | `status(task)=done ⇒ group(task)=done` za vsak `dueDate`. | UI test z zaključenim opravilom pred in po referenčnim datumom. |
| R03 | `open(task) ∧ due(task)<reference ⇒ overdue`; `open(task) ∧ due(task)=reference ⇒ today`. | UI test datumskih meja. |
| R04 | `open(task) ∧ reference<due≤reference+7 dni ⇒ week`; `open(task) ∧ due>reference+7 dni ⇒ later`. Skupine so disjunktne, skupaj pokrivajo vsa opravila. | UI test vključno z mejo sedmega dne in poznejšim datumom. |
| R05 | Datumni račun uporablja koledarski `YYYY-MM-DD` v UTC, brez lokalnega časovnega pasu; seštevanje dni deluje čez meje meseca, leta in prestopni februar. | Lastni UI test meje 2026-02-27/28, 2026-12-31 in 2024-02-28. |
| R06 | Števci so `|{task ∈ project : group(task)=g}|` za `g∈{overdue,today,week,later,done}` in se ne spreminjajo z aktivnim filtrom. | UI test števil v vseh skupinah pred in po spremembi filtra. |
| R07 | `visible=all(tasks)`; za `g≠all`, `visible={task∈tasks:group(task)=g}` v izvornem vrstnem redu. Izbor ne spreminja podatkov. | UI test ID-jev v tabeli in tabli ter preverjanje odsotnosti pisanja na API. |
| R08 | Prazno polje postavi opozorilo, ohrani zadnji veljavni `referenceDate` in filter; veljaven vnos odstrani opozorilo ter takoj preračuna. | UI test praznega vnosa, ohranjanja prikaza in novega veljavnega datuma. |
| R09 | Tabela in tabla uporabljata isti `visible`. Preklop ohrani referenčni datum, besedilo polja in filter. | UI test istih ID-jev ter vrednosti obeh kontrol po preklopu. |
| R10 | Sprememba projekta ali osvežitev ponastavita datum in filter na začetni vrednosti; filter ni v trajni shrambi ali URL-ju. | UI test preklopa projekta, osvežitve in pregleda shrambe/URL. |
| R11 | Če je `tasks=[]`, so vsi števci 0. Če je izbrana prazna skupina v nepraznem projektu, se prikaže natančno sporočilo `Ni opravil v izbrani skupini.` | UI test praznega projekta in prazne skupine. |
| R12 | Pregled je izključno bralen, ohranja `data-task-id`, dostopna imena in prilagodljiv Folio; stranska širina pri 390 px ni večja od zaslona. | UI test pisanja na API, stanja strežnika in širine dokumenta. |

## Izvedba in sledljivost

| Zahteva | Pogoj | Test ali scenarij | Datoteka in del kode | Izid ter dokaz |
| --- | --- | --- | --- | --- |
| R01–R12 | Glej zahteve zgoraj. | Razvojni testi `tests/development/P08.spec.ts` in lastni testi `tests/agent/P08.spec.ts`. | `src/App.tsx`, `src/TaskBoard.tsx`, `src/due.ts` | Zabeležen v `docs/agent/verification.md` po dejanskem zagonu. |

## Odprta vprašanja in omejitve

