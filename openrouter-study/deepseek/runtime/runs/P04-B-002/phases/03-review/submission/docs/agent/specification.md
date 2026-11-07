# Razvojna specifikacija P04: Stabilno razvrščanje z dvema ključema

Avtor: snovalec specifikacije (postopek B). Predmet: zahteve R01–R12 iz
`task/instructions.md`. Izhodišče: Folio, kot je opisan v `docs/dizajn.md`.

## Problem in kontekst

Uporabnik želi na seznamu opravil projekta nadzorovati vrstni red: izbrati
primarni in sekundarni ključ (naslov, odgovorna oseba, stanje, rok) ter njuni
neodvisni smeri, ob tem pa ohraniti izvorni vrstni red kot izhodišče in
ponastavitev. Začetna aplikacija (`src/App.tsx`, `src/TaskBoard.tsx`) prikaže
opravila v vrstnem redu prejetega polja; kontrol za razvrščanje še ni.
Sprememba je projekcija obstoječih podatkov: bere se prek javnega API-ja
`/api/`, nič se ne zapisuje in nič ne spreminja v podatkih opravil.

## Vhodi, dejanja in izidi

Podatkovna polja (`shared/types.ts`, nespremenjena): `Task = { id: string,
projectId: string, title: string, description: string, status: 'todo' |
'in_progress' | 'done', assignee: string, dueDate: string }`, `Project = {
id: string, name: string }`. Opravila se berejo z
`GET /api/projects/{projectId}/tasks`, projekti z `GET /api/projects`;
podrobnosti opravila z `GET /api/tasks/{id}`.

Dejanja in pričakovano stanje:

- Izbira primarnega ključa, primarne smeri, sekundarnega ključa in sekundarne
  smeri takoj prerazporedi prikaz opravil (preglednica in tabla).
- `Izvorni vrstni red` ponastavi vse štiri nastavitve na privzete vrednosti.
- Preklop pogleda Preglednica/Tabla, odpiranje/zapiranje podrobnosti in
  osvežitev ne spremenijo nastavitev; menjava projekta jih ponastavi.
- Napake branja ostanejo enake kot v izhodišču (`LoadError` z gumbom za
  ponovni poskus); razvrščanje na napako nima vpliva.

## Zahteve in pravila

Simbole in predpostavke (veljajo za vse pogoje):

- `T = [t0, t1, …, tn-1]` so opravila projekta v vrstnem redu prejetega
  odgovora `GET /api/projects/{id}/tasks`; `idx(t)` je indeks v `T`.
- `K1 ∈ {original, title, assignee, status, dueDate}`, `D1 ∈ {asc, desc}`,
  `K2 ∈ {none, title, assignee, status, dueDate}`, `D2 ∈ {asc, desc}`.
  Privzeto: `K1 = original, D1 = asc, K2 = none, D2 = asc`.
- `norm(s) = s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()`
  (NFD, odstranjeni U+0300–U+036F, male črke); primerjava `norm` je
  leksikografska po enotah UTF-16 (`<`, `>`), brez jezikovnega ali
  številskega prilagajanja.
- `rank(status)`: `todo = 0`, `in_progress = 1`, `done = 2`.
- `cmp(K, a, b)` je primerjava ključa: `title`/`assignee` po `norm`,
  `status` po `rank`, `dueDate` kronološko po veljavnih `YYYY-MM-DD`.
- `dir(D, c) = c` za `asc`, `-c` za `desc`.
- `sort(T, K1, D1, K2, D2)` je stabilna projekcija `T`: primerjalnik za par
  `(a, b)` vrne `dir(D1, cmp(K1, a, b))`, če je ta vrednost različna od 0;
  sicer `dir(D2, cmp(K2, a, b))`, če je `K2 ≠ none` in je vrednost različna
  od 0; sicer `idx(a) − idx(b)`.

Splošno pravilo (velja za vse zahteve): razvrščanje spreminja samo vrstni red
prikaza; polja opravil, `projectId`, skupna števila po stanjih in prejeto
polje ostanejo nespremenjeni, sprememba vrstnega reda pa ne sproži nobene
pisne zahteve na `/api/`.

| Zahteva | Pravilo oziroma sprejemni pogoj | Način preverjanja |
| --- | --- | --- |
| R01 | Ob prvem prikazu je `K1 = original, D1 = asc, K2 = none, D2 = asc`; za `K1 = original` je prikaz natanko `T`. | Preberi vrednosti štirih kontrol ob nalaganju; `data-task-id` vrstic je enako `T`. |
| R02 | Za `K1 ∈ {title, assignee}`: `sort` uporabi `norm` in primerjavo UTF-16 (`Čas` → `cas`, `Alfa 10` pred `alfa 2`). | Izbira ključa; pričakovano zaporedje izračunamo iz podatkov, ne iz vgrajenega `localeCompare`. |
| R03 | Za `K1 = status` je vrstni red `todo < in_progress < done`; za `K1 = dueDate` veljavni datumi naraščajo kronološko. | Izbira ključa; zaporedje se ujema z `rank` oziroma s primerjavo datumov. |
| R04 | `dir` obrne samo predznak `cmp(K1, a, b)`; izenačeni elementi ostanejo v `idx` vrstnem redu, končno polje se ne obrne kot celota. | Za `K1 = assignee` primerjaj `desc` z obrnjenim `asc` po skupinah enakih vrednosti; stabilnost preveri `status` z enakimi stanji. |
| R05 | `K2` se uporabi le, ko je `cmp(K1, a, b) = 0`, in ima svojo smer `D2`; `D1` in `D2` sta neodvisna. | `K1 = status, K2 = dueDate, D2 = desc` in obratni `D2`; primerjaj z ročno izračunanim `sort`. |
| R06 | Ob enakosti obeh ključev (ali `K2 = none`) velja `idx`; `K1 = K2` je dovoljen in ne doda obrata: `sort(T, k, d1, k, d2) = sort(T, k, d1, none, asc)`; `K1 = original` vrne `T` ne glede na `D1, K2, D2`. | `K1 = K2 = title` z različnima smerema; `K1 = original` z `D1 = desc` in `K2 = dueDate`; primerjava z `T`. |
| R07 | Stolpci table imajo stalni vrstni red `todo, in_progress, done`; stolpec `s` vsebuje natanko `filter(sort(T, …), status = s)` v tem vrstnem redu. | Tabla z izbranim ključem; `data-task-id` po stolpcih se ujema z `filter(sort(T, …))`. |
| R08 | Preklop Preglednica/Tabla in odprtje/zaprtje podrobnosti ohranita vse štiri nastavitve. | Nastavi ključe, preklopi pogled in odpri/zapri podrobnosti; kontrole in vrstni red ostanejo. |
| R09 | Menjava projekta in osvežitev strani začneta s privzetimi vrednostmi; nastavitve niso v `localStorage`/`sessionStorage` niti v URL-ju. | Nastavi ključe, zamenjaj projekt oziroma ponovno naloži stran; kontrole so privzete; v URL-ju ni parametrov razvrščanja. |
| R10 | Gumb `Izvorni vrstni red` nastavi `(original, asc, none, asc)`; prazen projekt in projekt z enim opravilom delujeta pri vseh `K1/D1/K2/D2`. | Klik na gumb po spremembah; ločena scenarija s `[]` in `[t]` za vse kombinacije ključev in smeri. |
| R11 | Razvrščanje ne spremeni polj opravil, pripadnosti, skupnih števil po stanjih ali prejetega polja; noben `PATCH/POST/PUT/DELETE` na `/api/` se ne sproži. | Primerjaj opravila in `Pregled stanj opravil` pred/po; opazuj omrežne zahteve in `saveRequests` v `/__test/state`. |
| R12 | Vsak `id` je v aktivnem pogledu prikazan natanko enkrat (`[data-task-id=id]`), tudi pri enakih naslovih, in odpre podrobnosti prav tega opravila; ohranijo se bralne funkcije (opis, oseba, rok, skupna števila) in videz Folio; pri širini 390 pik se stran ne razširi. | Preštej elemente `[data-task-id]` za vsak `id`, odpri podrobnosti dveh opravil z enakim naslovom, preveri `scrollWidth <= innerWidth`. |

Dogovor o vmesniku (nespremenjen iz naloge): štirje `select` elementi z
dostopnimi imeni `Primarni ključ`, `Primarna smer`, `Sekundarni ključ`,
`Sekundarna smer` in vrednostmi `original/title/assignee/status/dueDate`,
`asc/desc`, `none/…`; gumb `Izvorni vrstni red`. Ohranijo se `data-task-id` na
vrsticah in karticah, dostopna imena obstoječih pogledov in stolpcev ter
`aria-label="Pregled stanj opravil"`. Nova dejanja ob opravilu so zunaj
njegove povezave.

Predikati (konkretni izpeljani pogoji, zapisani neodvisno od izvedbe):

- P1 (R01): `controls = (original, asc, none, asc) ⇒ ids(page) = ids(T)`.
- P2 (R02): `ids = [x0…xn-1]`, kjer `∀ i<j: norm(x_i.key) ≤ norm(x_j.key)` in
  `norm(x_i.key) = norm(x_j.key) ⇒ idx(x_i) < idx(x_j)`; `norm` je enak
  normalizaciji iz R02 (npr. `Čas za pregled` → `cas za pregled`,
  `Alfa 10` pred `alfa 2`, ker `'1' < '2'`).
- P3 (R03): pri `K1 = status` velja `rank(x_i) ≤ rank(x_j)`; pri
  `K1 = dueDate` velja `x_i.dueDate ≤ x_j.dueDate` (kronološko).
- P4 (R04, R06): `sort(T, K, desc, K2, D2) = reverseGroups(sort(T, K, asc,
  K2, D2))`, kjer `reverseGroups` obrne le zaporedje znotraj skupin z
  enakim `cmp(K, ·, ·) = 0`; enakost ključa se nikoli ne zlomi z obratom.
- P5 (R06): `sort(T, k, d1, k, d2) = sort(T, k, d1, none, asc)` za vsak
  `k ∈ {title, assignee, status, dueDate}` in vsak `d1, d2`.
- P6 (R07): `ids(stolpec s) = ids(filter(sort(T, K1, D1, K2, D2),
  status = s))` za `s ∈ {todo, in_progress, done}`.
- P7 (R08): `controls` in `ids` sta enaka pred in po preklopu pogleda ter
  pred in po odprtju/zaprtju podrobnosti.
- P8 (R09): po menjavi projekta ali `page.reload()` velja
  `controls = (original, asc, none, asc)`; v `location.hash` ni parametrov
  razvrščanja (dovoljen je obstoječi `view=board`).
- P9 (R10): klik na `Izvorni vrstni red` ⇒ `controls = defaults ∧ ids = ids(T)`;
  za `T = []` je prikaz prazen, za `|T| = 1` je prikaz enega opravila; oboje
  velja za vse kombinacije `K1/D1/K2/D2`.
- P10 (R11): `fields(t)` in `projectId(t)` so po razvrščanju enaki kot pred
  njim, `counts` (Pripravljeno/V delu/Končano) nespremenjeni, `T` nespremenjen,
  `writes = []` in `saveRequests = 0`.
- P11 (R12): `∀ t ∈ T: |{element : element.dataset.taskId = t.id}| = 1` v
  aktivnem pogledu; klik na ta element odpre pogovorno okno z `t.id`; pri
  širini 390 pik velja `document.documentElement.scrollWidth ≤ innerWidth`.

Opombe za izvedbo (ne predpisujejo strukture, le omejitve):

- Nastavitve razvrščanja so stanje trenutnega projekta v pomnilniku; ker
  `ProjectView` v `src/App.tsx` že ima `key={project.id}`, se ob menjavi
  projekta komponenta ponovno ustvari in s tem ponastavi (R09), medtem ko
  odpiranje podrobnosti (sprememba hasha, `TaskDetails`) je ne ustvari znova
  (R08). Druga enakovredna rešitev je dovoljena, če P7–P9 veljajo.
- Vse štiri kontrole morajo obstajati ves čas, tudi ko je `K2 = none`
  (R08/R09 zahtevata, da se ohranijo vse štiri vrednosti).
- Vrednosti `option` elementov so natanko `original`, `title`, `assignee`,
  `status`, `dueDate`, `none`, `asc`, `desc`, ker razvojni pomočnik izbira
  po vrednosti (`selectOption`).
- Primerjalnik mora biti popolna ureditev: izenačitev se zaključi z `idx`
  (R06), da je rezultat neodvisen od stabilnosti vgrajenega `sort`.

## Izvedba in sledljivost

Stanje: izvedba in preverjanje še nista opravljena; spodnje povezave so
načrt. Rezultatov brez dejanskega zagona testov ne označujemo kot uspešnih.
Izpolni jih implementer (datoteke v `src/`, testi v `tests/agent/`).

| Zahteva | Pogoj | Test ali scenarij | Datoteka in del kode | Izid ter dokaz |
| --- | --- | --- | --- | --- |
| R01 | privzete vrednosti; `original` = `T` | `tests/agent/*` + `tests/development/P04.spec.ts` D01 | `src/App.tsx` (stanje nastavitev), `src/sorting.ts` (načrt) | ni izvedeno |
| R02 | `norm` + UTF-16 | test velikih črk in šumnikov (npr. `web-04` pred `web-05`) | `src/sorting.ts` | ni izvedeno |
| R03 | `rank`, datum | `status`, `dueDate` | `src/sorting.ts` | ni izvedeno |
| R04 | smer le v `cmp` | `desc` pri `assignee`, stabilnost pri `status` | `src/sorting.ts` | ni izvedeno |
| R05 | `K2` ob enakosti | D02 (`status` + `dueDate` `desc`) | `src/sorting.ts` | ni izvedeno |
| R06 | `idx` kot izenačitev; `K1 = K2`; `original` | `K1 = K2`, `original` z drugimi kontrolami | `src/sorting.ts` | ni izvedeno |
| R07 | stolpci `todo, in_progress, done`; relativni vrstni red | D03 | `src/TaskBoard.tsx` | ni izvedeno |
| R08 | preklop in podrobnosti ohranijo nastavitve | scenarij pogled/podrobnosti | `src/App.tsx`, `src/TaskDetails.tsx` | ni izvedeno |
| R09 | reset ob projektu in osvežitvi | menjava projekta, `page.reload()` | `src/App.tsx` | ni izvedeno |
| R10 | gumb in robna projekta | D04, scenariji `[]`/`[t]` | `src/App.tsx` | ni izvedeno |
| R11 | projekcija, nič zapisov | D04 (`readonly`) | `src/App.tsx` | ni izvedeno |
| R12 | enkratni `id`, prave podrobnosti, videz | štetje `[data-task-id]`, enaki naslovi, 390 px | `src/App.tsx`, `src/TaskBoard.tsx`, `src/styles.css` | ni izvedeno |

## Odprta vprašanja in omejitve

- Predpostavke iz naloge: `dueDate` je veljaven `YYYY-MM-DD`, `assignee` je
  neprazno in različno od `all`; manjkajočih datumov ni treba podpirati.
- Testni mehanizem `/__test/` uporablja samo testni program; UI bere izključno
  `/api/` in ne uvaža pripomočkov razvojnih testov.
- Razvrščanje je lokalno trenutnemu projektu; brez trajne shrambe, brez novih
  parametrov URL-ja in brez novih zapisovalnih API-jev.
- Navigacija med nalaganjem in sočasne spremembe podatkov brez osvežitve niso
  razširjeni prek obstoječih regresijskih zahtev.
- Končni testi naloge niso dostopni; razvojni primeri `tests/development/`
  niso celoten obseg zahtev. Zaporedja v D01–D04 veljajo le za primere
  `examples` iz `tests/development/helpers.ts`.
