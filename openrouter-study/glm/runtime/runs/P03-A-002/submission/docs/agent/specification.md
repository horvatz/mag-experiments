# Specifikacija P03: Iskanje in sestavljeni filtri

## Problem in kontekst

Folio trenutno prikaže vsa opravila izbranega projekta v tabeli ali tabli. Uporabnik potrebuje hitro iskanje in kombinirano filtriranje po stanju ter odgovorni osebi, brez spreminjanja podatkov in brez razširjanja obstoječe navigacije ali dizajna.

## Vhodi, dejanja in izidi

- Vnosi so projektni seznam in opravila prek javnega API `/api/projects` in `/api/projects/{projectId}/tasks`. Polja za iskanje so `id`, `title`, `description` in `assignee`.
- Dejanja: vnos v iskalno polje, izbira filtra stanja (`all`, `todo`, `in_progress`, `done`), izbira odgovorne osebe (`all` ali natančno ime), preklop pogleda, preklop projekta, odprtje podrobnosti in počistitev filtrov.
- Izid je isti urejen seznam ustrezajočih opravil v preglednici in tabli, posodobljeni števci ter sporočilo `Ni zadetkov.` ob nepraznem projektu brez zadetkov.
- Napaka nalaganja ohrani obstoječe obnašanje; kontrole niso uporabne brez naloženih opravil. Filtri ne kličejo pisalnih API-jev.

## Zahteve in pravila

Simboli: `N` je število prikazanih opravil, `M` število vseh opravil trenutnega projekta, `join(t)` je `t.id + " " + t.title + " " + t.description + " " + t.assignee`. Normalizacija `norm(x)` je `x.normalize("NFD").replace(/[\\u0300-\\u036F]/g, "").toLowerCase()`.

| Zahteva | Pravilo oziroma sprejemni pogoj | Način preverjanja |
| --- | --- | --- |
| R01 | `search="" ∧ status="all" ∧ assignee="all" ⇒ visibleTasks = tasks` v izvornem vrstnem redu. | Nalaganje brez prejšnjega stanja in pregled ID-jev. |
| R02 | Zadetek je dobeseden podniz v `norm(join(t))`; `norm` odstrani kombinacijska znamenja U+0300–U+036F in ne razlikuje velikih ter malih črk. | Lastni test z `č`, `c`, velikimi in malimi črkami. |
| R03 | `words = norm(search).split(/\\s+/) \\ {""} ∧ visibleTasks = {t | ∀w ∈ words: norm(join(t)).includes(w)}`; vrstni red besed ni pomemben, ločila niso regularni izrazi. | Lastni testi z več besedami, presledki, ločili in znakom za regularni izraz. |
| R04 | `visibleTasks = searchMatches(t) ∧ (status="all" ∨ t.status=status) ∧ (assignee="all" ∨ t.assignee=assignee)`. Oseba se primerja natančno brez normalizacije. | Lastni in skupni razvojni testi. |
| R05 | Izbirnik vsebuje `all` in vsako različno neprazno `assignee` iz celotnega trenutnega projekta natanko enkrat; preklop projekta izbere `all`. | Lastni test z osebo, ki je izključena zaradi filtra, in preklopom projektov. |
| R06 | Tabela in tabla uporabljata isti seznam; preklop pogleda ohrani vse tri kontrole; stolpci vsebujejo samo ustrezna opravila svojega stanja. | Lastni test preklopov in stolpcev. |
| R07 | Sprememba trenutnega projekta ponastavi vse tri kontrole; izračun in izbirnik oseb uporabljata izključno naložena opravila trenutnega projekta. | Lastni test preklopa projektov z različnimi osebami. |
| R08 | Po osvežitvi strani so vse tri kontrole privzete; stanje se ne zapisuje v URL, `localStorage` ali `sessionStorage`. | Lastni test osvežitve in odsotnosti trajnih ključev. |
| R09 | `Prikazano: N od M.`; vsi števci stanj štejejo samo `visibleTasks`. | Lastni in skupni testi. |
| R10 | `M > 0 ∧ N=0 ⇒ Ni zadetkov.` in oba pogleda ostanejo uporabna; `M=0` ohrani običajno prazno stanje in `Prikazano: 0 od 0.` | Lastni testi praznega projekta, praznega zadetka in preklopa pogleda. |
| R11 | Gumb `Počisti filtre` nastavi `search=""`, `status="all"` in `assignee="all"`; vrstni red ter vsebnost polj ostanejo nespremenjeni. | Lastni test počiščenja. |
| R12 | Obstojeca navigacija in podrobnosti delujeta; filtriranje ne povzroči POST/PATCH/PUT/DELETE na `/api/`; ozka stran se ne razširi čez viewport. | Skupni in lastni testi. |

## Izvedba in sledljivost

| Zahteva | Pogoj | Test ali scenarij | Datoteka in del kode | Izid ter dokaz |
| --- | --- | --- | --- | --- |
| R01 | Privzeti prikaz vseh opravil v izvornem vrstnem redu. | A01 | `src/App.tsx` – stanje filtrov in `visibleTasks` | A01 je uspešno izveden. |
| R02 | Normalizacija NFD, odstranitev U+0300–U+036F in male črke. | A01, D01 | `src/App.tsx` – `normalizeSearch` | A01 in D01 sta uspešno izvedena. |
| R03 | Vse neprazne besede so dobesedni podnizi združenih polj. | A01 | `src/App.tsx` – `searchTerms` in `visibleTasks` | A01 je uspešno izveden. |
| R04 | Iskanje, stanje in oseba se kombinirajo z logičnim IN. | A01, D02 | `src/App.tsx` – `visibleTasks` | A01 in D02 sta uspešno izvedena. |
| R05 | Seznam oseb vsebuje `all` in vse različne neprazne osebe projekta. | A02 | `src/App.tsx` – `assignees` in izbirnik | A02 je uspešno izveden. |
| R06 | Tabela in tabla uporabljata isti filtriran seznam. | A03, D02 | `src/App.tsx`, `src/TaskBoard.tsx` | A03 in D02 sta uspešno izvedena. |
| R07 | Preklop projekta ponastavi vse tri kontrole. | A02 | `src/App.tsx` – `ProjectView key={project.id}` | A02 je uspešno izveden. |
| R08 | Osvežitev začne s privzetimi filtri brez shrambe. | A06 | `src/App.tsx` – lokalno stanje komponente | A06 je uspešno izveden. |
| R09 | Števci in sporočilo štejejo prikazane rezultate. | A04, D04 | `src/App.tsx` – `counts` in `filter-summary` | A04 in D04 sta uspešno izvedena. |
| R10 | Prazni zadetki in prazen projekt imata ločena stanja. | A04, D03 | `src/App.tsx` – pogojna prikaza | A04 in D03 sta uspešno izvedena. |
| R11 | En dejanje počisti vse tri kontrole. | A05, D03 | `src/App.tsx` – gumb `Počisti filtre` | A05 in D03 sta uspešno izvedena. |
| R12 | Navigacija, podrobnosti, varnost in ozka širina delujejo. | A07, izhodiščni testi | `src/App.tsx`, `src/filters.css` | A07 in izhodiščni testi so uspešno izvedeni. |

## Odprta vprašanja in omejitve

- Ni odprtih vprašanj; zahteve iz navodil so dokončne.
- Nepreverjeno ostaja sočasno spreminjanje podatkov brez osvežitve in navigacija med nezaključenim nalaganjem, ker nista del zahtev.

## Zgodovina popravkov

- 2026-10-10: Ustvarjena začetna specifikacija.
- 2026-10-10: Dopolnjena sledljivost po izvedbi in preverjanju.
