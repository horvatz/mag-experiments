# P05 — razvojna specifikacija: straničenje in filter stanja

Status: osnutek za implementerja in pregledovalca; rezultati preverjanj se vpišejo po izvedbi. Zgodovina: `docs/agent/specification-history.md`.

## Problem in kontekst

- Uporabnik v Folio odpre projekt in želi obvladovati daljše sezname opravil.
- Izhodišče: `ProjectView` prebere vsa opravila projekta prek `GET /api/projects/:id/tasks` in jih v celoti prikaže v preglednici ali tabli; pregled stanj (`aria-label="Pregled stanj opravil"`) šteje po statusih; `data-task-id` je na vrsticah in karticah.
- Sprememba: dodati izbiro velikosti strani in filtra stanja ter navigacijo po straneh, tako da oba pogleda prikazujeta isti odsek filtriranega polja, stanje straničenja pa je lokalno trenutnemu projektu in se ne shranjuje (niti v URL niti v trajno shrambo).
- Ohraniti: slovenske oznake, videz Folio (`docs/dizajn.md`), obstoječe povezave in podrobnosti, branje izključno prek `/api/`.

## Vhodi, dejanja in izidi

### Podatki

- `Task` iz `shared/types.ts`: `id: string`, `projectId: string`, `title`, `description`, `status: todo|in_progress|done`, `assignee`, `dueDate`; `Project: { id, name }`.
- Vir: obstoječi javni API. UI uporablja le `GET /api/projects`, `GET /api/projects/:id/tasks`, `GET /api/tasks/:id`. Ne uporablja `/__test/`, ne uvaža testnih pripomočkov, ne bere `localStorage`/`sessionStorage` za podatke ali stanje straničenja.
- Vrstni red opravil je vrstni red, kot ga vrne API (`P`), brez dodatnega razvrščanja.
- Predpostavke iz navodil: poljubno število opravil (0, 1, >10), enkratni ID-ji znotraj projekta, enaki naslovi možni, poljubno zaporedje, veljavni datumi, Unicode in ločila; vsako opravilo pripada svojemu projektu; projekti so lahko prazni.

### Dejanja in stanje

Lokalno stanje `ProjectView`: `size ∈ {all,2,5,10}`, `filter ∈ {all,todo,in_progress,done}`, `page ∈ ℕ0`.

- Izhodiščne vrednosti ob prikazu projekta in ob vsaki osvežitvi: `size=all`, `filter=all`, `page=1` (ali `0`, če je rezultat prazen).
- Dejanja: izbira velikosti strani (select z dostopnim imenom `Velikost strani`), izbira filtra (select `Filter strani`), gumbi `Prva stran`, `Prejšnja stran`, `Naslednja stran`, `Zadnja stran`, preklop pogleda (`Preglednica`/`Tabla`), odpiranje/zapiranje podrobnosti.

### Izidi

- Preglednica in tabla prikazujeta natanko `V` (`data-task-id`), status pa natančno besedilo iz R09/R10.
- Gumbi so onemogočeni na robovih.
- Napake branja: obstoječe `LoadError`/ponovni poskus se ohranita; stanje straničenja ne sme skriti napake nalaganja.

## Zahteve in pravila

Simboli:

- `P` = opravila izbranega projekta v vrstnem redu API.
- `F = P`, če `filter=all`, sicer `{t ∈ P : t.status = filter}`; vrstni red `P` ohranjen.
- `N = |F|`.
- `S = size`, pri `size=all` velja `S = N` (ena stran pri `N>0`).
- `Y = 0`, če `N=0`; sicer `Y = ceil(N/S)` (`1` pri `all`).
- `X = page`; velja `X=0` pri `N=0`, sicer `1 ≤ X ≤ Y`.
- `A = (X−1)·S+1`, `B = min(X·S, N)` (1-indeksirano, vključno).
- `V = F[A−1 .. B]` (odsek trenutne strani).

Predikati:

- `empty ⇔ N=0`.
- `statusText = "Stran 0 od 0. Prikazano 0–0 od 0."`, če `empty`; sicer `"Stran X od Y. Prikazano A–B od N."` (pomišljaj U+2013; pike so del besedila).
- `prevDisabled ⇔ empty ∨ X=1`; `nextDisabled ⇔ empty ∨ X=Y`; `firstDisabled = prevDisabled`; `lastDisabled = nextDisabled`.
- `visibleIds(view) = [t.id : t ∈ V]`; oba pogleda imata enako množico; vrstni red v preglednici je vrstni red `V`, v tabli je razvrščen po stolpcih (znotraj stolpca ohranjen vrstni red `V`).
- `summaryCounts(s) = |{t ∈ P : t.status=s}|` (nefiltrirano, neodvisno od `X` in `S`).
- `columnCounts(s) = |{t ∈ V : t.status=s}|` (samo trenutna stran).
- `writes = 0`: nobena zahteva ne pošlje metode, ki ni GET/HEAD/OPTIONS.

| Zahteva | Pravilo oziroma sprejemni pogoj | Način preverjanja |
| --- | --- | --- |
| R01 | Ob vstopu v projekt: `size=all`, `filter=all`, `page=1`, `V=F=P`, ID-ji v vrstnem redu API. | Razvojni D01/D04; lastni test: privzeti vrednosti selectov `all`/`all` in vsi ID-ji v izvornem vrstnem redu. |
| R02 | Za `size ∈ {2,5,10}` so strani zaporedni odseki `F` brez prekrivanja: unija `V` je `F`, vsak ID natanko enkrat; zadnja stran ima `B−A+1 ≤ S`; `X→X+1` premakne `A` na `B+1`. | Razvojni D01/D02; lastni test za 2/5/10 in `N` izven večkratnikov. |
| R03 | Klik na Prva/Prejšnja/Naslednja/Zadnja nastavi `X` na `1`/`max(1,X−1)`/`min(Y,X+1)`/`Y`. Če je gumb `disabled`, klik ne spremeni `X`, `V` ali statusa. | Razvojni D02/D04; lastni test robov `X=1`, `X=Y` in praznega rezultata. |
| R04 | `selectSize(s)`: `size=s`, `page=1` pri `N>0` oziroma `0` pri praznem, ne glede na prejšnji `X`. Pri `all` in `N>0` velja `Y=1`, `V=F`. | Razvojni D04 (2 → Zadnja → 5 vrne na stran 1); lastni test `all` in meja. |
| R05 | Filter se uporabi pred straničenjem (`F`); `selectFilter(f)`: `filter=f`, `page=1` oziroma `0`, vrstni red `F` ostane vrstni red `P`. | Razvojni D03; lastni test vseh štirih vrednosti in vrnitve na `all`. |
| R06 | `visibleIds(table) = visibleIds(board) = [id ∈ V]` kot množica; tabla razdeli `V` v tri stolpce po statusu (ne straniči vsakega stolpca posebej). | Razvojni D03 (tabla po filtriranju); lastni test primerjave obeh pogledov na isti strani. |
| R07 | Preklop `Preglednica`↔`Tabla` in odpiranje/zapiranje podrobnosti ne spremenijo `size`, `filter`, `page`; po zaprtju je `V` nespremenjen. | Razvojni D03 (delno); lastni test: 2/todo/2. stran → tabla → podrobnosti → zapri → isto stanje. |
| R08 | Ob menjavi projekta ali osvežitvi: `size=all`, `filter=all`, `page=1` oziroma `0`. Stanje ni v URL-ju, `localStorage`, `sessionStorage` ali piškotkih; osvežitev ne obnovi prejšnjega stanja. | Lastni test: spremeni stanje, osveži in zamenjaj projekt; URL ne vsebuje parametrov straničenja. |
| R09 | Če `N>0`, ima status (`role=status`, dostopno ime `Stanje straničenja`) točno `Stran X od Y. Prikazano A–B od N.`; `A,B` sta 1-indeksirana, `N=|F|`. | Razvojni D02; lastni test za prvo/srednjo/zadnjo stran in filter. |
| R10 | Če `N=0`, je status točno `Stran 0 od 0. Prikazano 0–0 od 0.`, vsi štirje navigacijski gumbi so `disabled`; ko filter spet vrne `N>0`, je `page=1` (ne ostanek 0). | Lastni test: projekt brez opravil in filter brez zadetkov; nato filter `all`. |
| R11 | `summaryCounts` se računajo iz `P` (nefiltrirano) in se ob straničenju/filtriranju ne spremenijo; `columnCounts` se računajo iz `V`; skupno število opravil se ne spremeni. | Razvojni testi za summary; lastni test: summary enak pri `all` in pri filtru, števci stolpcev padajo z velikostjo strani. |
| R12 | Straničenje ne sproži pisne zahteve na API (`writes=0`, `saveRequests=0`) in ne spremeni podatkov; obstoječe povezave `task-link`/`board-card`, `data-task-id`, podrobnosti, `Nalaganje …` in videz Folio ostanejo delujoči; pri širini 390 px velja `document.scrollWidth ≤ innerWidth` (notranje drsenje preglednice/table dovoljeno). | Razvojni D04 (`readonly`); lastni test: klikanje po straneh in filtrih, odprte podrobnosti, `writes`, 390 px. |

## Dogovor o vmesniku (dostopnost in selektorji)

- `combobox` z imenom `Velikost strani`: vrednosti `all`, `2`, `5`, `10`; privzeto `all`.
- `combobox` z imenom `Filter strani`: vrednosti `all`, `todo`, `in_progress`, `done`; privzeto `all`.
- Gumbi z natančnimi imeni `Prva stran`, `Prejšnja stran`, `Naslednja stran`, `Zadnja stran`; na robu `disabled`.
- Element `role="status"` z `aria-label="Stanje straničenja"`; besedilo točno po R09/R10 (pomišljaj `–`).
- Ohraniti: `data-task-id` na vrsticah in karticah; `aria-label="Pregled stanj opravil"`; dostopna imena `Preglednica`/`Tabla` z `aria-pressed`; `Tabla opravil` in stolpce `Pripravljeno`/`V delu`/`Končano`; dialog podrobnosti.
- Nova dejanja ob posameznem opravilu (če bi nastala) morajo biti zunaj njegove povezave.
- Besedilo in razporeditev novih kontrol nista predpisana; uporabi obstoječe gradnike in slogovne spremenljivke.

## Izvedba in sledljivost

Predvideni nosilci spremembe (implementer jih potrdi/posodobi): `src/App.tsx` (stanje in status), `src/TaskBoard.tsx` (stranjeni odsek), `src/styles.css` (razporeditev kontrol, 390 px), po potrebi nova pomožna datoteka v `src/`. Skupni testi in `tests/development/` so samo za branje.

| Zahteva | Pogoj | Test ali scenarij | Datoteka in del kode | Izid ter dokaz |
| --- | --- | --- | --- | --- |
| R01 | privzeto all/all, izvorni vrstni red | lastni test privzetkov; D01/D04 | App.tsx | ni izvedeno (faza specifikacije) |
| R02 | odseki 2/5/10 brez izgub | D01, D02 + lastni test meja | App.tsx | ni izvedeno |
| R03 | navigacija in onemogočeni robovi | D02/D04 + lastni test | App.tsx | ni izvedeno |
| R04 | menjava velikosti → prva stran | D04 + lastni test | App.tsx | ni izvedeno |
| R05 | filter pred straničenjem | D03 + lastni test | App.tsx | ni izvedeno |
| R06 | ista množica ID-jev obeh pogledov | D03 + lastni test | App.tsx, TaskBoard.tsx | ni izvedeno |
| R07 | pogled/podrobnosti ohranijo stanje | lastni test | App.tsx, TaskDetails.tsx | ni izvedeno |
| R08 | projekt/osvežitev → all/all/prva | lastni test | App.tsx | ni izvedeno |
| R09 | točno besedilo statusa | D02 + lastni test | App.tsx | ni izvedeno |
| R10 | prazen rezultat in ponovni filter | lastni test | App.tsx | ni izvedeno |
| R11 | summary celoten P, stolpci V | D02 + lastni test | App.tsx, TaskBoard.tsx | ni izvedeno |
| R12 | brez zapisov, regresije, 390 px | D04 (`readonly`) + baseline | App.tsx, TaskBoard.tsx, styles.css | ni izvedeno |

Dejanski izidi se vpišejo po izvedbi (implementer v svojih zapiskih, pregledovalec v `review.md`); te tabele niso označene kot uspešne brez dokaza.

## Odprta vprašanja in omejitve

- Faza specifikacije: noben test še ni izveden; vrstice izida so namenoma "ni izvedeno".
- Ni določeno, ali se ob odprtih podrobnostih sme spreminjati filter/stran; R07 zahteva le ohranitev ob preklopu pogleda in zaprtju podrobnosti. Implementer naj ne uvaja novih vedenj onkraj R01–R12.
- Ob nezaključenem nalaganju in sočasnih spremembah podatkov se obseg ne širi prek obstoječih regresijskih zahtev (npr. menjava projekta med nalaganjem).
- Če posamezna zahteva ne določa trajne shrambe ali URL-ja, ostane stanje lokalno trenutnemu projektu; novih zapisovalnih API-jev ni.
- Razvojni primeri (D01–D04) niso celoten obseg; končni testi lahko uporabijo drugačne podatke iz opisane domene.
