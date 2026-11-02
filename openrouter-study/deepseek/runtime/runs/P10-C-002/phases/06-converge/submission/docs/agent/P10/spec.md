# Specifikacija P10 — Lokalni vrstni red z razveljavitvami

**Funkcijska mapa**: `docs/agent/P10` | **Datum**: 2026-11-01 | **Status**: izvedeno in preverjeno
**Vir zahtev**: `task/instructions.md` (R01–R12), `PROJECT_RULES.md`, ustava projekta

Povezave: [`task/instructions.md`](../../../task/instructions.md) ·
[`PROJECT_RULES.md`](../../../PROJECT_RULES.md) ·
[`docs/dizajn.md`](../../dizajn.md) ·
[`.specify/memory/constitution.md`](../../../.specify/memory/constitution.md) ·
[`task/specification-template.md`](../../../task/specification-template.md)

## Problem in kontekst

Uporabnik želi v aplikaciji Folio lokalno preurediti vrstni red opravil znotraj
trenutnega projekta ter premike razveljaviti in ponoviti. Začetno stanje prikazuje opravila
v vrstnem redu, kot ga vrne strežnik (`GET /api/projects/:id/tasks`); urejanja vrstnega
reda in zgodovine dejanj še ni. Predvidena sprememba je lokalna permutacija iste množice
ID-jev v pomnilniku seje: gumbi za premik ob vsakem opravilu, gumbi za razveljavitev,
ponovitev in vrnitev začetnega vrstnega reda ter števec zgodovine. Polja opravil, statusi
in strežniški podatki ostanejo nespremenjeni, zato funkcionalnost ne piše na API in se ne
shranjuje trajno. Sprememba ostane v obstoječem potrjenem videzu Folio
(`docs/dizajn.md`) in v mejah dovoljenih sprememb (`PROJECT_RULES.md`, ustava).

## Scenariji in merila uspeha

### Scenariji uporabe

**P1 — Premikanje opravil in meje (R01–R03, R09, R11)**

- Given projekt s prejetim vrstnim redom; When uporabnik klikne `Premakni <id> gor` pri
  drugem opravilu; Then opravilo zamenja mesto z globalnim predhodnikom, polja in statusi
  ostanejo enaki, globalna mesta se posodobijo.
- Given prvo oziroma zadnje opravilo; When gumb za premik prek roba; Then je gumb
  onemogočen in vrstni red, zgodovini ter števci ostanejo nespremenjeni.
- Given prazen projekt oziroma projekt z enim opravilom; Then je stran uporabna, dovoljenih
  premikov pa ni.
- **Neodvisen test**: razvojni D01 in lastni testi R01–R03, R09, R11 v `tests/agent/`.

**P2 — Razveljavitev in ponovitev (R04–R07)**

- Given opravljen veljaven premik; When `Razveljavi premik`; Then obnovi se prejšnja
  permutacija, trenutna se shrani za ponovitev; `Ponovi premik` jo obnovi.
- Given razveljavljeni koraki; When nov veljaven premik; Then zgodovina ponovitev se
  zavrže; neveljaven robni premik je ne zavrže.
- Given 21 zaporednih veljavnih premikov; Then zgodovina razveljavitev vsebuje največ 20
  najnovejših prejšnjih permutacij.
- **Neodvisen test**: razvojna D02, D03 in lastni testi R04–R07 v `tests/agent/`.

**P3 — Začetni vrstni red, obstojnost in lokalnost (R08, R10, R12)**

- Given spremenjen vrstni red in obe zgodovini; When `Začetni vrstni red`; Then vrne se
  izvorna permutacija kot eno novo razveljavljivo dejanje, ponovitve se počistijo; če je
  vrstni red že izvoren, je gumb onemogočen.
- Given spremenjen vrstni red; When preklop pogleda ali odpiranje/zapiranje podrobnosti;
  Then vrstni red in obe zgodovini ostaneta; When menjava projekta ali osvežitev; Then
  vrstni red se ponastavi na izhodišče projekta, zgodovini se izpraznita.
- Given katerokoli dejanje; Then nobene zahteve za pisanje na API, nobenih sprememb polj,
  ista množica ID-jev, Folio in števci stanj nespremenjeni.
- **Neodvisen test**: razvojna D04 in lastni testi R08, R10, R12 v `tests/agent/`.

### Merila uspeha (merljiva, tehnološko nevtralna)

- **SC-001**: Vseh 12 zahtev R01–R12 ima dejansko izveden test in zabeležen izid (12/12,
  dnevnik zagona v `test-results/run/`).
- **SC-002**: Med scenariji ni nobene ne-GET zahteve na `/api/`; `saveRequests` v testnem
  stanju ostane 0.
- **SC-003**: Ob širini 390 px velja `document.documentElement.scrollWidth <=
  clientWidth`; notranje drsenje preglednice/table je dovoljeno.
- **SC-004**: Skupni testi izhodišča (`tests/baseline.spec.ts`, `tests/api.spec.ts`)
  ostanejo uspešni.
- **SC-005**: Po vsakem dejanju je prikazani seznam permutacija iste množice ID-jev
  (množica pred = množica po; brez izgub in podvajanj).

## Vhodi, dejanja in izidi

### Podatkovna polja in viri

- `Task`: `id`, `projectId`, `title`, `description`, `status` (`todo` | `in_progress` |
  `done`), `assignee`, `dueDate` — enaka kot v izhodišču (`shared/types.ts`).
- `Project`: `id`, `name`.
- Viri: `GET /api/projects`, `GET /api/projects/:id/tasks` (vrstni red odgovora je
  izhodiščna permutacija P0), `GET /api/tasks/:id` za podrobnosti. Razvojni pripomoček
  (`tests/development/helpers.ts`) lahko poda poljubne podatke z nadzorovanimi GET
  odgovori; uporabniški vmesnik ga ne uvaža in ne uporablja.
- Vhodna domena: projekt je lahko prazen; opravil je lahko 0, 1 ali več kot 10; ID-ji so
  enkratni; naslovi se lahko ponavljajo; besedilo je navadno, tudi z Unicode znaki in
  ločili; datumi so veljavni koledarski datumi.

### Dovoljena dejanja

| Dejanje | Kontrola | Predpogoj | Izid |
| --- | --- | --- | --- |
| Premakni `<id>` gor | gumb ob vrstici/kartici, zunaj povezave opravila | `pos(id) > 1` | zamenjava z globalnim predhodnikom; prejšnja permutacija v U; R se počisti |
| Premakni `<id>` dol | gumb ob vrstici/kartici, zunaj povezave opravila | `pos(id) < n` | zamenjava z globalnim naslednikom; kot zgoraj |
| Razveljavi premik | gumb | `U ≠ ∅` | P := zadnja prejšnja permutacija; trenutna v R |
| Ponovi premik | gumb | `R ≠ ∅` | P := zadnja razveljavljena permutacija; trenutna v U |
| Začetni vrstni red | gumb | `P ≠ P0` | P := P0 kot eno dejanje; R se počisti |
| Preklop pogleda / podrobnosti | obstoječe kontrole | — | P, U in R nespremenjeni |
| Menjava projekta / osvežitev | obstoječa navigacija | — | ponastavitev na P0 novega projekta; U = R = ∅ |

### Pričakovano stanje po uspehu, klicu in napaki

- **Uspeh**: nova permutacija P' iste množice ID-jev, posodobljena U/R, usklajena števca
  in gumbi; polja opravil, statusi in števci stanj nespremenjeni.
- **Neveljavno ali ponovljeno robno dejanje** (premik prek roba, razveljavitev/ponovitev
  pri prazni zgodovini, začetni vrstni red pri P = P0): P, U in R se ne spremenijo; gumb
  je onemogočen, kjer to določajo R03, R08 in R11.
- **Napaka nalaganja**: nespremenjen obstoječi prikaz napake s ponovnim poskusom; brez
  novih zahtev.
- **Trajna shramba**: je ni; osvežitev ali odhod iz projekta izgubi spremembe (R10).

## Zahteve in pravila

### Simboli in predpostavke

- `P = (t1, …, tn)` — trenutna permutacija ID-jev opravil trenutnega projekta; `P0` — P ob
  nalaganju (vrstni red odgovora API-ja).
- `n = |P|`; `pos(id) = i`, kjer je `ti = id` (globalno mesto, 1-osnovano, od 1 do n).
- `U` — zgodovina razveljavitev (sklad prejšnjih permutacij, največ 20); `R` — zgodovina
  ponovitev (sklad razveljavljenih permutacij, največ 20).
- `swap(P, i, j)` — zamenjava elementov; `push20(X, p)` — dodaj `p` na konec X; če
  `|X| > 20`, odstrani najstarejši element; `pop` odstrani in vrne zadnji element.
- Predpostavke: ID-ji opravil so v projektu enkratni; vrstni red je lokalno stanje seje
  trenutnega projekta; UI bere samo javni `/api/` in ne uvaža testnih kontrol.

### Pravila sprememb stanja

1. **Premik gor**: `valid_up(id) ⇔ pos(id) > 1`. Če `valid_up`: `P' = swap(P, pos(id)−1,
   pos(id))`, `U' = push20(U, P)`, `R' = []`. Sicer `P' = P`, `U' = U`, `R' = R`.
2. **Premik dol**: `valid_down(id) ⇔ pos(id) < n`. Če `valid_down`: `P' = swap(P, pos(id),
   pos(id)+1)`, `U' = push20(U, P)`, `R' = []`. Sicer brez sprememb.
3. **Razveljavitev**: če `U ≠ ∅`: `P' = pop(U)`, `R' = push(R, P)`. Sicer brez sprememb.
4. **Ponovitev**: če `R ≠ ∅`: `P' = pop(R)`, `U' = push20(U, P)`. Sicer brez sprememb.
5. **Začetni vrstni red**: če `P ≠ P0`: `U' = push20(U, P)`, `R' = []`, `P' = P0`. Sicer
   brez sprememb.
6. **Prepoved**: premik na robu ne spremeni P, U ali R; ne počisti R (R06).
7. **Lokalnost**: dejanja ne kličejo API-ja in ne spreminjajo polj opravil; P in P0 imata
   isto množico ID-jev (permutacija); števci stanj se ne spremenijo.

### Tabela zahtev

| Zahteva | Pravilo oziroma sprejemni pogoj | Način preverjanja |
| --- | --- | --- |
| R01 | P0 = prejeti vrstni red; vsako opravilo prikazuje `pos(id) ∈ [1..n]`; opravila se razlikujejo po `id` tudi pri enakih naslovih. | lastni test (mesta, enaki naslovi) + D01–D04 |
| R02 | `Premakni <id> gor/dol` zamenja z globalnim sosedom; polja in statusi nespremenjeni. | lastni test (permutacija, nespremenjena polja) + D01 |
| R03 | `pos(id)=1` → gor onemogočen; `pos(id)=n` → dol onemogočen; neveljavno dejanje ne spremeni P/U/R. | lastni test (onemogočena gumba, nespremenjeno stanje) + D01 |
| R04 | Vsak veljaven premik: `U' = push20(U, P)`; razveljavitev: `P' = pop(U)`, `R' = push(R, P)`. | lastni test (zaporedji U/R) + D02 |
| R05 | Ponovitev: `P' = pop(R)`, `U' = push20(U, P)`; zaporedji brez izgube ali podvajanja ID-jev. | lastni test (več razveljavitev in ponovitev) + D02 |
| R06 | Nov veljaven premik → `R' = []`; neveljaven robni premik → R nespremenjen. | lastni test (ponovitev onemogočena po novem premiku; R ohranjen ob robu) + D03 |
| R07 | `|U| ≤ 20`; ob 21. veljavnem premiku se zavrže najstarejša prejšnja permutacija; razveljavitev deluje za vse trenutno razveljavljene korake. | lastni test (21 premikov, meje) |
| R08 | `P ≠ P0` → `P' = P0` kot eno dejanje (`U' = push20(U, P)`, `R' = []`); `P = P0` → gumb onemogočen, zgodovini nespremenjeni. | lastni test (reset, ponovitve) + D04 |
| R09 | Tabla prikazuje relativni vrstni red znotraj stolpcev; premiki uporabijo globalnega soseda in prikažejo globalno mesto; statusi nespremenjeni. | lastni test (tabla, globalna mesta) + D04 |
| R10 | Preklop pogleda in podrobnosti ohranita P, U, R; menjava projekta in osvežitev ponastavita na P0 z `U = R = ∅`; brez trajne shrambe. | lastni test (pogled, podrobnosti, projekt, osvežitev) + D04 |
| R11 | Števec `Razveljavitve: U. Ponovitve: R.` usklajen z gumbi (onemogočena pri 0); prazen projekt in projekt z 1 opravilom ostaneta uporabna brez dovoljenega premika. | lastni test (števec, onemogočena gumba, 0/1 opravil) + D03 |
| R12 | P in P0 ista množica ID-jev; nobenih ne-GET klicev na `/api/`; polja, statusi in števci stanj nespremenjeni; Folio ohranjen. | lastni test + D04 (`readonly`) + baseline (Folio) |

### Dogovor o vmesniku

- Ob vrstici/kartici: gumba `Premakni <id> gor` in `Premakni <id> dol`, ločena od povezave
  opravila; element `aria-label="Mesto opravila <id>"` z globalno številko.
- Gumbi: `Razveljavi premik`, `Ponovi premik`, `Začetni vrstni red`.
- Element `role="status"`, `aria-label="Zgodovina vrstnega reda"`, besedilo
  `Razveljavitve: U. Ponovitve: R.`.
- Ohraniti `data-task-id` na vrsticah in karticah, dostopna imena obstoječih pogledov in
  stolpcev ter `aria-label="Pregled stanj opravil"`.
- Nova dejanja ob opravilu so zunaj njegove povezave; pri 390 px se cela stran ne razširi
  (notranje drsenje preglednice in table je dovoljeno).
- Besedilo, ki ni določeno zgoraj, in razporeditev novih kontrol nista predpisana.

## Izvedba in sledljivost

Rezultati so izvedeni 2026-11-01 z `npm run check` (eslint + `tsc --noEmit` + `vite build` +
`playwright test`): **59 uspešnih preverjanj, 0 neuspešnih** — 38 osnovnih (api + baseline
desktop/mobile), 8 razvojnih (D01–D04 × desktop/mobile) in 13 lastnih (`tests/agent/`).
Povzetek je v `docs/agent/verification.md`, dnevnik zagona v `test-results/run/`.

| Zahteva | Pogoj | Test ali scenarij | Datoteka in del kode | Izid ter dokaz |
| --- | --- | --- | --- | --- |
| R01 | Prejeti vrstni red, globalna mesta | lastni test R01 + D01 | `src/taskOrder.ts` (`initOrder`, `useTaskOrder`); `src/App.tsx`, `src/TaskBoard.tsx` (`task-rank`) | uspešno (`npm run check`) |
| R02 | Zamenjava z globalnim sosedom, polja nespremenjena | lastni test R02 + D01 | `src/taskOrder.ts` (`moveUp`, `moveDown`, `swap`) | uspešno |
| R03 | Robna onemogočitev | lastni test R03 + D01 | `src/taskOrder.ts` (`canMoveUp`, `canMoveDown`); `src/App.tsx`, `src/TaskBoard.tsx` (disabled) | uspešno |
| R04 | U in R po premiku/razveljavitvi | lastni test R04/R05 + D02 | `src/taskOrder.ts` (`undo`) | uspešno |
| R05 | Ponovitev obnovi permutacijo | lastni test R04/R05 + D02 | `src/taskOrder.ts` (`redo`) | uspešno |
| R06 | Nov premik zavrže R, robni ne | lastni test R06 + D03 | `src/taskOrder.ts` (`swap` počisti `redo`) | uspešno |
| R07 | Največ 20 v U | lastni test R07 | `src/taskOrder.ts` (`pushLimited`) | uspešno |
| R08 | Začetni vrstni red kot eno dejanje | lastni test R08 + D04 | `src/taskOrder.ts` (`resetOrder`, `canReset`) | uspešno |
| R09 | Tabla in globalni premiki | lastni test R09 + D04 | `src/TaskBoard.tsx` (rank, gumbi), `src/App.tsx` | uspešno |
| R10 | Pogled/podrobnosti/projekt/osvežitev | lastni test R10 + D04 | `src/App.tsx` (`TaskSection` key, `useTaskOrder`) | uspešno |
| R11 | Števec in prazni primeri | lastni testi R11 (3) + D03 | `src/App.tsx` (`order-status`, onemogočeni gumbi) | uspešno |
| R12 | Brez zapisov, ista množica ID-jev | lastni test R12 + D04 (`readonly`) + skupni testi | `src/taskOrder.ts` (lokalne permutacije), `src/App.tsx` | uspešno — `saveRequests = 0`, ni ne-GET klicev, 390 px brez prelivanja |

## Odprta vprašanja in omejitve

- Zgornja meja zgodovine ponovitev ni izrecno določena; uporabljeno pravilo je `|R| ≤ 20`,
  ker razveljavitev doda največ toliko elementov, kolikor jih `U` lahko vsebuje (R07).
- Besedo "onemogočen" pri R03, R08 in R11 razumemo kot `disabled` (razvojni D01 to
  potrjuje).
- Obseg ne vključuje navigacije med nezakučenim nalaganjem in sočasnih sprememb podatkov
  brez osvežitve (omejitve naloge).
- Vrstni red se ne shranjuje trajno in ni zapisan v URL-ju; stanje je lokalno trenutnemu
  projektu (R10).
- Končni (skriti) testi lahko uporabijo drugačne podatke iz opisane domene; razvojni
  D01–D04 so primeri in ne celoten obseg zahtev.
- Obstoječi `updateTask` v `src/api.ts` ostane priprava za P01; ta funkcionalnost ga ne
  uporablja in ne dodaja novih zapisovalnih klicev (R12).
- Zagon izhodišča pred spremembami (T001) ni bil izveden; skupni testi so bili izvedeni po
  izvedbi in vsi uspejo, zato je nespremenjeno vedenje potrjeno posredno.

### Zgodovina sprememb

- 2026-11-01, v1: prva različica specifikacije za R01–R12 (korak specify); tabela
  sledljivosti odprta do izvedbe.
- 2026-11-01, v1.1: izvedba (`src/taskOrder.ts`, `src/App.tsx`, `src/TaskBoard.tsx`,
  `src/styles.css`, `tests/agent/P10.spec.ts`); tabela sledljivosti dopolnjena z izidi
  `npm run check` (59/59 uspešnih).
