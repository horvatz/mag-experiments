# Specifikacija P03: Iskanje in sestavljeni filtri

## Problem in kontekst

Folio trenutno prikaže vsa opravila izbranega projekta v izvornem vrstnem redu. Uporabnik potrebuje branje po ključnih besedah, po stanju in po odgovorni osebi ter hiter povratek na nesfiltriran pogled. Filtriranje je stanje trenutnega projekta in ne sme spreminjati podatkov, URL-ja ali trajne shrambe.

## Vhodi, dejanja in izidi

Podatkovni vir je obstojeji GET `/api/projects/{projectId}/tasks`. Vhodna polja so `id`, `title`, `description`, `status` in `assignee`; vpisu dodamo še iskalni niz, filter stanja `all | todo | in_progress | done` in filter osebe `all` ali ime. Dejanja so vpis, izbira filtrov, preklop med preglednico in tablo, preklop projekta in »Počisti filtre«. Uspeh pomeni enake ID-je v obeh pogledih, števce prikazanih zadetkov in ohranjen izvorni vrstni red. Napaka nalaganja ostaja v obstoječem prikazu s ponovnim poskusom.

## Zahteve in pravila

| Zahteva | Pravilo oziroma sprejemni pogoj | Način preverjanja |
| --- | --- | --- |
| R01 | Pri nalaganju `query = "" ∧ status = "all" ∧ assignee = "all"`, prikazani so vsi `task ∈ project.tasks` v zaporedju odgovora. | Razvojni test D01 in lastni test A02. |
| R02 | `normalize(x) = lower(removeMarks(NFD(x)))`; `matchesSearch(task, query) ⇔ normalize([id,title,description,assignee]).join(" ")` vsebuje normalizirane besede. | Lastna unit preverjanja normalizacije in razvojni test D01. |
| R03 | `words(query) = nonempty(splitWhitespace(query)); matches ⇔ ∀w ∈ words(query): isSubstring(normalize(w), haystack)`; ločila so dobesedna, vrstni red ni pomemben. | Lastni unit test A01. |
| R04 | `visible(task) = search(task) ∧ statusFilter(task) ∧ assigneeFilter(task)`; oseba se primerja z `===`, brez normalizacije. | Razvojni test D02 in lastni test A02. |
| R05 | Množica vrednosti izbirnika je `{ "all" } ∪ distinct(nonempty(tasks.map(assignee)))` za celoten trenutni projekt. | Lastni brskalniški test A02. |
| R06 | ID-ji preglednice in table so enaki `visible.map(id)`; preklop pogleda ne spremeni filtrov. | Razvojni test D02 in lastni test A02. |
| R07 | Sprememba `projectId` ponastavi vse tri kontrole in ne uporabi starih filtrov na novih podatkih. | Lastni brskalniški test A02. |
| R08 | Po osvežitvi so privzete vrednosti; v URL-ju ali lokalni shrambi ni filtrov. | Lastni brskalniški test A02. |
| R09 | Status ima besedilo `Prikazano: |visible| od |project.tasks|.`; pregled stanj in števci stolpcev štejejo `visible`. | Razvojni test D04 ter lastna testa A02 in A03. |
| R10 | Če `project.tasks ≠ [] ∧ visible = []`, je viden natančno `Ni zadetkov.`; prazen projekt ima števec `Prikazano: 0 od 0.` in običajno prazno stanje. | Lastna testa A03 in A04. |
| R11 | `clear() ⇒ query="" ∧ status="all" ∧ assignee="all"`; vrstni red in vsebina polj se ne spremenijo. | Lastna testa A02 in A03. |
| R12 | Filtriranje ne sproži nobenega pisanja na `/api/`; obstoječa navigacija in podrobnosti ostanejo delujoči, ozka širina ne povzroči horizontalnega razširjanja strani. | Razvojni test D04 in lastni test A03. |

## Izvedba in sledljivost

| Zahteva | Pogoj | Test ali scenarij | Datoteka in del kode | Izid ter dokaz |
| --- | --- | --- | --- | --- |
| R01–R12 | Glej zgornje sprejemne pogoje | `npm run check` vključuje lint, build, izhodiščne, razvojne in lastne Playwright teste. | `src/App.tsx`, `src/filters.ts`, `tests/agent/P03.spec.ts` | Izidi so zapisani v `docs/agent/verification.md`. |

## Odprta vprašanja in omejitve

Ni odprtih vprašanj. Osveževanje podatkov med nalaganjem in napake strežnika niso del te naloge; ne spreminjamo novih testnih API-jev, strežnika ali skupne infrastrukture.

## Zgodovina popravkov specifikacije

- V1.0: začetna specifikacija pred implementacijo.
- V1.1: po statični preverbi je implementacija `projectTasks` stabilizirala z `useMemo`; sprejemni pogoji ostajajo nespremenjeni.
- V1.2: popravljena sledljivost testov na dejansko izvedene A01–A04.
