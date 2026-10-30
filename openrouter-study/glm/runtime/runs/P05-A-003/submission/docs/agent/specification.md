# Specifikacija P05: Straničenje in filter stanja

## Problem in kontekst

Folio trenutno prikaže vsa opravila izbranega projekta. Uporabnik potrebuje preglednejši prikaz z zaporednimi odseki in filtrom stanja v tako preglednici kot tabli. Nova stanja so prehodna za trenutni projekt: niso shranjena v URL ali trajni shrambi in se ponastavijo ob menjavi projekta ali osvežitvi.

## Vhodi, dejanja in izidi

- Vhod so obstoječi `GET /api/projects/:id/tasks` in polja `id`, `projectId`, `title`, `description`, `status`, `assignee`, `dueDate` iz `shared/types.ts`.
- Velikost strani: `all | 2 | 5 | 10`.
- Filter stanja: `all | todo | in_progress | done`.
- Dejanja: izbira velikosti, izbira filtra, `Prva stran`, `Prejšnja stran`, `Naslednja stran`, `Zadnja stran`.
- Izid sta `filteredTasks` in `pageTasks`: filter najprej ohrani izvorni vrstni red, nato straničenje izreže neprekrivajoč se odsek.

## Zahteve in pravila

| Zahteva | Pravilo oziroma sprejemni pogoj | Način preverjanja |
| --- | --- | --- |
| R01 | `pageSize = all ∧ statusFilter = all ⇒ page = 1 ∧ pageTasks = tasks` | Razvojni in lastni test nad izvornim vrstnim redom. |
| R02 | `pageSize ∈ {2,5,10} ⇒ pageTasks = filteredTasks[(page−1)·pageSize … min(page·pageSize, N))` brez izgube ali podvojitve ID | Lastni test preveri vse odseke za velikosti 2, 5 in 10. |
| R03 | `go(page′)` velja samo za `1 ≤ page′ ≤ pageCount`; sicer dejanje ne spremeni stanja | Lastni test preveri robne gumbe in onemogočene klike. |
| R04 | `setPageSize(size) ⇒ page = 1` | Lastna testna zaporedja iz sredine strani. |
| R05 | `filteredTasks = tasks.filter(task => filter = all ∨ task.status = filter)`; `setStatusFilter(_) ⇒ page = 1` | Lastni test s filtrom in zaporedjem. |
| R06 | Preglednica in tabla izrišeta isti nabor ID-jev iz `pageTasks`; stolpci table štejejo le ta odsek | Lastni test primerja ID-je obeh pogledov. |
| R07 | Preklop pogleda in odpiranje/zapiranje podrobnosti ne spreminjata stanja straničenja | Lastni test ohrani velikost, filter in stran. |
| R08 | Menjava projekta ali osvežitev ponastavita `all/all/page 1`; stanja ni v URL ali trajni shrambi | Lasten test menjave projekta in osvežitve. |
| R09 | `N > 0 ⇒ status = Stran P od C. Prikazano A–B od N.` | Lastni test preveri indeksa in enojni pomišljaj. |
| R10 | `N = 0 ⇒ status = Stran 0 od 0. Prikazano 0–0 od 0.`; vsi štirje gumbi so onemogočeni | Lastna testa za prazen projekt in prazen filter. |
| R11 | Pregled stanj šteje nefiltrirane `tasks`; števci stolpcev štejejo `pageTasks` | Lastni test primerja globalne in stolpčne števce. |
| R12 | Straničenje ne sproži zapisovalnih zahtev na API; obstoječe povezave, ID-ji, podrobnosti in videz Folio ostanejo | Skupni razvojni test `readonly` in lastni test brez zapisov. |

## Izvedba in sledljivost

| Zahteva | Pogoj | Test ali scenarij | Datoteka in del kode | Izid ter dokaz |
| --- | --- | --- | --- | --- |
| R01–R12 | Zgornja pravila | `npm run check` ter skupni razvojni testi P05 | `src/App.tsx`, `src/TaskBoard.tsx`, `src/styles.css` | Zapisano v `docs/agent/verification.md`. |

## Odprta vprašanja in omejitve

Ni odprtih vprašanj. Podrobnosti in morebitne nepreverjene scenarije bodo zapisane v `docs/agent/verification.md`.
