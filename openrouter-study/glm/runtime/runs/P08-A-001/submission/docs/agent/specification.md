# Specifikacija P08: Koledarski pregled rokov

## Problem in kontekst

Folio prikazuje projekte in opravila prek javnega API-ja. Uporabnik potrebuje pregled rokov glede na koledarski referenčni datum, ki ni vezan na uro naprave. Izhodiščni vmesnik razvršča opravila samo po stanju, zato ga dopolnimo s petimi skupinami rokov in enotnim filtrom za preglednico in tablo.

## Vhodi, dejanja in izidi

- Vhod: `Project[]`, `Task[]` iz `/api/projects` in `/api/projects/:id/tasks`; polji `Task.status` ter `Task.dueDate` v obliki `YYYY-MM-DD`.
- Dejanja: izbira `Referenčni datum`, izbira `Pogled rokov`, preklop med preglednico in tablo, navigacija med projekti ter osvežitev.
- Uspeh: pet števcev prikazuje celoten trenutni projekt; izbrana skupina se prikaže v izvornem vrstnem redu v obeh prikazih.
- Neveljaven ali prazen referenčni datum: prikaže se opozorilo, zadnji veljavni preračun in izbrana skupina ostanejo nespremenjena.
- Napaka nalaganja: obstoječe prikazovanje napake in ponovni poskus ostanejo nespremenjeni.

## Zahteve in pravila

Predpostavki: `REF_DATE = 2026-09-21`, `ALL = {overdue, today, week, later, done}`. Za `d` kot dan 1 in dan 2 datumov velja razlika `days(d2) - days(d1)` po gregorijanskem koledarju, brez vpliva ure ali časovnega pasu.

| Zahteva | Pravilo oziroma sprejemni pogoj | Način preverjanja |
| --- | --- | --- |
| R01 | Na prvi prikazani stanji projekta velja `date = 2026-09-21 ∧ group = all`. | Lastni Playwright test za začetni vrednosti. |
| R02 | `status = done → group = done`; opravilo ne pripada nobeni odprti skupini. | Lastna testna primera z done na starejšem, enakem in prihodnjem datumu. |
| R03 | `status ≠ done ∧ date(dueDate) < date(ref) → group = overdue`; `status ≠ done ∧ dueDate = ref → group = today`. | Lastni testi z mejo meseca in dneva. |
| R04 | Za odprto opravilo z `days(dueDate) - days(ref) ∈ [1,7]` velja `group = week`; sicer `group = later`. Vsako opravilo pade natanko v eno skupino iz `ALL`. | Lastni testi vključno z 7. dnem in 8. dnem. |
| R05 | Datumski račun uporablja koledarsko aritmetiko `YYYY-MM-DD`; razlike delujejo čez mesec, leto in prestopni februar. | Lastni testi z nadzorovanimi datumi. |
| R06 | `count(group) = |{task ∈ currentProjectTasks : group(task) = group}|` neodvisno od izbranega filtra. | Lastni test številcev pred in po spremembi filtra. |
| R07 | `selected ≠ all → visible = tasks.filter(group = selected)` v izvornem vrstnem redu; izbira ne spremeni podatkov. | Lastna testna primera za preglednico in tablo. |
| R08 | `date = ∅ → alert ∧ state(date, group, inputText) = zadnje veljavno stanje`; naslednji veljaven datum izbriše opozorilo in takoj preračuna. | Lastni test praznega osnutka in ponovnega vnosa. |
| R09 | Preglednica in tabla prikazujeta isti filtriran niz ID-jev; preklop ohrani referenčni datum, besedilo polja in izbrano skupino. | Lastni test obeh prikazov. |
| R10 | Sprememba projekta ali osvežitev postavi `date = 2026-09-21 ∧ group = all`. Filtrirno stanje ni v `localStorage` ali URL. | Lastni test navigacije, osvežitve in odsotnosti trajne shrambe. |
| R11 | `tasks = ∅ → ∀count = 0`; prazna izbrana skupina v nepraznem projektu prikaže `Ni opravil v izbrani skupini.` in omogoča preklop. | Lastna testa za prazen in neprazen projekt. |
| R12 | Pregled povzroča samo bralne API-je; ohrani `data-task-id`, dostopna imena, bralne podrobnosti in Folio ter ne razširi strani na širini 390 px. | Lastni test sledenja API, preklopa prikaza, podrobnosti in `scrollWidth`. |

## Izvedba in sledljivost

| Zahteva | Pogoj | Test ali scenarij | Datoteka in del kode | Izid ter dokaz |
| --- | --- | --- | --- | --- |
| R01–R12 | Glej zgornjo tabelo. | `tests/agent/p08.spec.ts` | `src/App.tsx`, `src/TaskBoard.tsx`, `src/dateGroups.ts`, `src/styles.css` | Zapisano po dejanskem zagonu v `verification.md`. |

## Odprta vprašanja in omejitve

- Ni odprtih vprašanj. Nepreverjeno ostaja izključno obnašanje zunaj dane domene podatkov (npr. neveljavni datumi iz API-ja), ki ga naloga izrecno izključuje.

## Zgodovina popravkov specifikacije

- 2026-10-09: Prva različica, pripravljena pred implementacijo.
- 2026-10-09: Po implementaciji usklajena sledljivost; ohranjeno je izhodiščno sporočilo za prazen projekt, izbrana prazna skupina v nepraznem projektu pa prikaže lastno sporočilo.
