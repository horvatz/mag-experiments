# Specifikacija P06: Nastavljiv izvoz CSV (Folio)

Različica 1.0, faza specifikacije. Avtor: agent-specifikator, 2026-10-09.
Podlaga: `task/instructions.md`, `PROJECT_RULES.md`, `task/specification-template.md`,
`shared/types.ts`, `src/App.tsx`, `src/TaskBoard.tsx`, `src/navigation.ts`,
`src/useResource.ts`, `tests/development/helpers.ts`, `tests/development/P06.spec.ts`.
Izvirne zahteve R01–R12 veljajo tudi, če bi jih ta dokument izpustil.

## Problem in kontekst

Uporabnik želi opravila trenutnega projekta izvoziti v CSV ter pri tem nadzorovati
izbrane kolone, filter po stanju in ločilo. Začetni Folio bere `GET /api/projects`
in `GET /api/projects/{id}/tasks`; prikaz ima pogleda Preglednica in Tabla
(hash `#/projects/<id>[?view=board]`), vrstice in kartice nosijo `data-task-id`,
povzetek pa `aria-label="Pregled stanj opravil"`. Dodatek je samostojen kontrolnik
izvoza v `ProjectView`, viden v obeh pogledih, brez sprememb strežnika, skupnih
tipov ali obstoječih bralnih funkcij.

## Vhodi, dejanja in izidi

**Podatki.** `Task = { id, projectId, title, description, status: 'todo'|'in_progress'|'done', assignee, dueDate }`,
`Project = { id, name }` (`shared/types.ts`). Vir je izključno javni `/api/` (GET);
`/__test/`, `localStorage` in lokalne kopije podatkov so prepovedani. `status` je
interna vrednost, `dueDate` izvirni `YYYY-MM-DD`, ostala polja so nizi.

**Dejanja.** Potrditev/odklop poljubnega podmnožja kolon `id, projectId, title,
status, assignee, dueDate, description`; izbira ločila `;` ali `,`; izbira filtra
`all`/`todo`/`in_progress`/`done`; klik gumba `Izvozi CSV`; preklop pogleda
Preglednica/Tabla; menjava projekta; osvežitev strani.

**Stanje po uspehu.** Brskalnik prenese datoteko `folio-<projectId>.csv` z vsebino
po pravilih spodaj; vmesnik in podatki na strežniku se ne spremenijo.

**Preklic in napake.** Neizbran noben stolpec ali prazen filtrirani rezultat: gumb
je onemogočen in prenosa ni (brez napake). Napake branja ostanejo obstoječi
`LoadError` z `retry`. Izvoz sam ne poroča napak v vmesnik; neuspeh prenosa pusti
stanje nespremenjeno.

## Zahteve in pravila

**Simboli.** `C = ⟨id, projectId, title, status, assignee, dueDate, description⟩`
(7 dovoljenih kolon v tem nespremenljivem vrstnem redu). `T` = opravila trenutnega
projekta v vrstnem redu odgovora `GET /api/projects/{id}/tasks`. `S ⊆ C` = izbrane
kolone, `f ∈ {all, todo, in_progress, done}` filter, `sep ∈ {';', ','}` ločilo.
`R(f) = T`, če `f = all`, sicer `[t ∈ T : t.status = f]`.
`q(x) = '"' + x.replaceAll('"', '""') + '"'` (vedno narekovana vrednost).
`n(x) = "'" + x`, če `/^[ \t\r\n]*[=+\-@]/` ujame `x`, sicer `x` (apostrof na sam
začetek izvirnega niza, pred morebitnimi vodilnimi presledki).
`Vsebina = U+FEFF + q(glava_1) sep … sep q(glava_k) + CRLF + Σ_{r∈R(f)} [ q(n(r[c_1])) sep … sep q(n(r[c_k])) + CRLF ]`,
kjer so `c_1…c_k` kolone iz `S` v vrstnem redu `C`. `Ime = "folio-" + projectId + ".csv"`.
`Omogočeno(S, f) ⟺ S ≠ ∅ ∧ |R(f)| > 0`. Privzeto: `S = C`, `f = all`, `sep = ';'`.

| Zahteva | Pravilo oziroma sprejemni pogoj | Način preverjanja |
| --- | --- | --- |
| R01 | Izvoz uporabi `T` v izvornem vrstnem redu; privzeto `f = all`, `S = C`, `sep = ';'`. | Prenos ob prvem obisku; glava in vrstni red ID-jev `T`; D01. |
| R02 | Ponujene in izvedene so natanko kolone `C`; glava in vrednosti sledijo vrstnemu redu `C` ne glede na vrstni red klikov. | Odklop/ponoven izbor v obratnem vrstnem redu; primerjava glave in vrstic; D02. |
| R03 | `S = ∅ ⇒ gumb onemogočen ∧ ni prenosa`; ponovni izbor vrne `Omogočeno`, ko `|R(f)| > 0`. | Odklop vseh 7 polj; klik; nato izbor enega polja; D02 (delno). |
| R04 | Filter omeji samo `R(f)`; prikaz še vedno kaže ves `T`; `|R(f)| = 0 ⇒` izvoz onemogočen. | Filtriranje `done`; preverjanje števila vrstic v prikazu in datoteki; D02, D04. |
| R05 | Prenos `Ime` z začetnim U+FEFF; brez nove strani in brez pošiljanja vsebine na strežnik (noben ne-GET `/api/`). | Branje prenesenih bajtov; `readonly`; D01, D04. |
| R06 | `sep` je `;` ali `,`; vsaka glava in vrednost je `q(·)`; notranji `"` podvojen. | Preklop ločila; vrednost z `"citat"`; D02, D03. |
| R07 | Vrstice ločene s CRLF, tudi zadnja; ločila/prelomi znotraj vrednosti ostanejo v narekovanem polju. | Preverjanje `\r\n` na koncu in vsebine z `\n` ter `;`; D01, D03. |
| R08 | Za vsako podatkovno vrednost: `n(x)` nevtralizira `= + - @` za poljubnimi vodilnimi ` \t\r\n`; glava se ne nevtralizira; drugi nizi nespremenjeni. | Vrstica z `=SUM(A1)`; robni nizi brez predpone; D03. |
| R09 | Šumniki/Unicode/presledki/opisi ohranjeni (razen `n`); `status` interno, `dueDate` izviren. | Vsebina z `čšž` in prelomom; D03. |
| R10 | Preklop pogleda ohrani `S`, `sep`, `f`; isti nastavitvi dasta enake bajte. | Prenos pred/po `Tabla`; primerjava bajtov; D04. |
| R11 | Menjava projekta in osvežitev ponastavita `S = C`, `sep = ';'`, `f = all`; zaporedna izvoza vedno odražata trenutne nastavitve. | Nastavi `done` in `,`, zamenjaj projekt/`reload`, izvozi; nato ponovni izvoz po spremembi. |
| R12 | Izvoz in kontrole ne spreminjajo opravil, izvornih polj ali bralnih funkcij; nobenega pisanja na API; videz Folio ostane prilagodljiv (na 390 px brez vodoravnega prelivanja strani, notranje drsenje dovoljeno). | `readonly` (seznam pisnih zahtev + `saveRequests = 0` + `scrollWidth`); D04. |

**Vmesnik (dogovorjeno).** Checkbox za vsako kolono z dostopnim imenom
`Stolpec <ime>`; select `Ločilo CSV` z vrednostma `;` in `,`; select `Filter izvoza`
z `all`/`todo`/`in_progress`/`done`; gumb `Izvozi CSV`. Obstoječe ostanejo
`data-task-id` na vrsticah in karticah, dostopna imena pogledov in stolpcev ter
`aria-label="Pregled stanj opravil"`. Nova dejanja ob opravilu morajo biti zunaj
njegove povezave. Besedilo in razporeditev novih kontrol razen zgoraj nista predpisana.

## Izvedba in sledljivost

Predvideni nosilci: stanje in kontrole v `src/App.tsx` (`ProjectView`; stanje mora
preživeti preklop pogleda, ponastaviti pa se ob menjavi projekta), čista gradnja
vsebine v novem `src/csv.ts`, slogi v `src/styles.css`. Vrstni red implementacije
in imena znotraj `src/` izbere implementer. Spodnji izidi so v fazi specifikacije
**nepreverjeni**; dokaz vpiše implementer po dejanskem zagonu (ime testa in dnevnik).
Skupni testi `tests/development/P06.spec.ts` (D01–D04) so bralni in se lahko
zaženejo; lastni testi sodijo v `tests/agent/`.

| Zahteva | Pogoj | Test ali scenarij | Datoteka in del kode | Izid ter dokaz |
| --- | --- | --- | --- | --- |
| R01 | `f = all ∧ S = C ∧ sep = ';'`; vrstni red `T` | D01; lastni test privzetkov | `src/App.tsx`, `src/csv.ts` | Ni izvedeno v fazi specifikacije |
| R02 | glava in vrstice v vrstnem redu `C` | D02 + obraten vrstni red klikov | `src/csv.ts`, `src/App.tsx` | Ni izvedeno v fazi specifikacije |
| R03 | `S = ∅` onemogoči; ponovni izbor omogoči | D02 (odklop vseh polj) + lastni test | `src/App.tsx` | Ni izvedeno v fazi specifikacije |
| R04 | `R(f)` v datoteki, `T` v prikazu | D02, D04; lastni test praznega rezultata | `src/App.tsx`, `src/csv.ts` | Ni izvedeno v fazi specifikacije |
| R05 | U+FEFF na začetku, ime `folio-web.csv`, brez zapisov | D01, D04 | `src/csv.ts`, `src/App.tsx` | Ni izvedeno v fazi specifikacije |
| R06 | `q(·)` povsod; `""` za notranji narekovaj | D02, D03 | `src/csv.ts` | Ni izvedeno v fazi specifikacije |
| R07 | CRLF tudi za zadnjo vrstico; ohranjena vsebina | D01, D03 | `src/csv.ts` | Ni izvedeno v fazi specifikacije |
| R08 | `n(x)` za podatke, ne za glavo | D03 + lastni robni testovi (`+`, `-`, `@`, vodilni presledek) | `src/csv.ts` | Ni izvedeno v fazi specifikacije |
| R09 | Unicode in polja nespremenjena; `status`/`dueDate` izvirna | D03 | `src/csv.ts` | Ni izvedeno v fazi specifikacije |
| R10 | enaki bajti pred/po preklopu pogleda | D04 | `src/App.tsx` | Ni izvedeno v fazi specifikacije |
| R11 | ponastavitev ob projektu/osvežitvi; tekoče nastavitve pri izvozu | lastni test (menjava projekta, `reload`) | `src/App.tsx` | Ni izvedeno v fazi specifikacije |
| R12 | ni pisnih zahtev, `saveRequests = 0`, brez prelivanja na 390 px | D04 + `readonly` | `src/App.tsx`, `src/styles.css` | Ni izvedeno v fazi specifikacije |

## Odprta vprašanja in omejitve

- Vsebina izvoza se gradi iz `T`, ki ga vrne `useResource`; sočasne spremembe
  podatkov brez osvežitve in stanja med nedokončanim nalaganjem niso del obsega.
- Stanje novih nastavitev je lokalno trenutnemu projektu, brez trajne shrambe in
  brez zapisa v URL (razen obstoječega `?view=board`).
- Predpostavka: „izvorni vrstni red“ pomeni vrstni red odgovora API, brez
  dodatnega urejanja v odjemalcu; prazni projekt oz. prazen `R(f)` onemogočita izvoz.
- Predpostavka: osvežitev pomeni ponovno nalaganje strani; menjava projekta
  povzroči ponovno vzpostavitev stanja (npr. `key={project.id}` ali enakovredno).
- Razporeditev in besedilo kontrol (razen predpisanih imen in vrednosti) sta
  prosti; pri 390 px se stran ne sme prelivati, notranje drsenje preglednice in
  table je dovoljeno.
- V tej fazi nisem zagnal aplikacije ali testov; vsi izidi so nepreverjeni,
  dokaze vpiše implementer po dejanskem zagonu.
