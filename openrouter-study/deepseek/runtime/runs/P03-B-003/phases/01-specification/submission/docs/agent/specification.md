# P03 — Razvojna specifikacija: iskanje in sestavljeni filtri

Različica 1.0. Avtor: vloga za specifikacijo. Podlaga: `task/instructions.md`,
`task/specification-template.md`, `PROJECT_RULES.md`, `shared/types.ts`,
`src/App.tsx`, `src/TaskBoard.tsx`, razvojni testi `tests/development/`.

## Problem in kontekst

Uporabnik v aplikaciji Folio pregleduje opravila enega projekta v preglednici
ali na tabli. Začetno stanje (`src/App.tsx`, `ProjectView`) prebere vsa
opravila prek `GET /api/projects/:id/tasks` in jih prikaže v izvornem vrstnem
redu, brez iskanja in filtrov. Cilj je dodati iskalni vnos, filter stanja,
filter odgovorne osebe, gumb za ponastavitev in povratni števec rezultatov,
ne da bi spremenili podatke, navigacijo, podrobnosti ali potrjeni videz Folio
(`docs/dizajn.md`). Filtriranje je povsem lokalno nad že prebranim seznamom;
nobeno filtrirno dejanje ne piše na strežnik.

## Vhodi, dejanja in izidi

Podatkovna polja (nespremenjena, `shared/types.ts`):

- `Task`: `id: string`, `projectId: string`, `title: string`,
  `description: string`, `status: todo | in_progress | done`,
  `assignee: string`, `dueDate: string` (veljavni koledarski datum).
- `Project`: `id: string`, `name: string`.

Vhodi in dejanja uporabnika:

- iskalni niz `q` prek `input type="search"` z dostopnim imenom
  `Išči opravila` (ob nalaganju prazen);
- stanje `s` prek `select` z imenom `Filter stanja`, vrednosti
  `all`, `todo`, `in_progress`, `done` (ob nalaganju `all`);
- odgovorna oseba `a` prek `select` z imenom `Filter odgovorne osebe`,
  vrednost `all` ali točno ime (ob nalaganju `all`);
- gumb `Počisti filtre`;
- preklop pogleda `Preglednica` / `Tabla`, izbira projekta, osvežitev strani.

Branje in pisanje: `GET /api/projects` in
`GET /api/projects/:id/tasks`. Filtriranje ne kliče `PATCH` in ne uporablja
`updateTask`. Stanje filtrov je lokalno stanje trenutnega projekta; ob uspehu
se prikažejo samo ustrezna opravila, ob napaki branja ostane obstoječi
`LoadError` z ponovitvijo, ob praznem zadetku sporočilo iz R10.

## Zahteve in pravila

Simboli in predpostavke:

- `P` je trenutni projekt, `tasks(P)` opravila, kot jih vrne API v izvornem
  vrstnem redu (tudi prazen seznam); `M = |tasks(P)|`.
- `norm(x)` = `x` pretvori v Unicode NFD, odstrani znake U+0300–U+036F in
  pretvori v male črke.
- `tok(q)` = neprazne besede niza `q`, razdeljene po belinah (`/\s+/`).
- `polja(t) = t.id + " " + t.title + " " + t.description + " " + t.assignee`.
- `match(t, q)` = za vsak `w ∈ tok(q)` velja `norm(w) ⊆ norm(polja(t))`;
  pri `q` brez besed je `match` resničen.
- `shown(P, q, s, a)` = `[t ∈ tasks(P) : match(t, q) ∧ (s = all ∨ t.status = s)
  ∧ (a = all ∨ t.assignee = a)]`, v izvornem vrstnem redu; `N = |shown|`.
- Rezervirana vrednost `all` ni veljavno ime osebe; imena so neprazna.

| Zahteva | Pravilo oziroma sprejemni pogoj | Način preverjanja |
| --- | --- | --- |
| R01 | Ob inicializaciji: `q = ""`, `s = all`, `a = all`; `ids(shown) = ids(tasks(P))` v izvornem vrstnem redu. | D01; lastni agentni test privzetega stanja |
| R02 | Iskanje primerja `norm(w)` z `norm(polja(t))`; zato sta `č`/`c` in velikost črk enakovredna. | D01 (`CAS`); lastni test z `č` in `Č` |
| R03 | `tok(q)` razdeli po belinah; ujemanje zahteva vse besede kot dobesedne podnize; vrstni red ni pomemben; ločila se obravnavajo dobesedno (brez regularnih izrazov); `tok(q) = []` ne omejuje. | D01; lastni testi vrstnega reda in ločil |
| R04 | Pogoji se vežejo z logičnim IN: `t ∈ shown ⇔ match(t, q) ∧ (s = all ∨ t.status = s) ∧ (a = all ∨ t.assignee = a)`. `s` ima samo `all/todo/in_progress/done`; `a` se primerja natančno, brez normalizacije. | D02; lastni test kombinacije in natančnega imena |
| R05 | Možnosti `a` = `all` + vsako različno neprazno ime iz `tasks(P)` natanko enkrat, izračunano iz celotnega projekta ne glede na `q` in `s`. Ob menjavi projekta se `a` ne ohrani. | D02; lastni test skritih oseb in menjave projekta |
| R06 | `ids(shown)` je enak v obeh pogledih; preklop pogleda ohrani `q`, `s`, `a`. Stolpec/oddelek stanja vsebuje natanko tista `t ∈ shown` z ustreznim `t.status`. | D02; lastni test enakih ID-jev obeh pogledov |
| R07 | Ob menjavi projekta se `q`, `s`, `a` nastavijo na privzete vrednosti in `shown` se izračuna samo iz `tasks(novi P)`. | lastni agentni test; preverjanje brez mešanja projektov |
| R08 | Osvežitev strani začne s privzetimi filtri; `q`, `s`, `a` se ne zapišejo v URL, `localStorage` ali drugo trajno shrambo. | lastni test osvežitve in pregled URL-ja |
| R09 | Besedilo `role="status"` z `aria-label="Rezultati filtriranja"` je natanko `Prikazano: N od M.`; povzetek stanj in števci stolpcev štejejo samo `shown`. | D04; lastni test števcev |
| R10 | Če `M > 0 ∧ N = 0`, je vidno sporočilo `Ni zadetkov.` in oba pogleda ostaneta uporabna (preklop in čiščenje delujeta). Če `M = 0`, ostane običajno prazno stanje in števec `0 od 0`. | D03; lastni test praznega projekta |
| R11 | `Počisti filtre` nastavi `q = ""`, `s = all`, `a = all` v enem dejanju; `ids(shown) = ids(tasks(P))`; vrstni red in vrednosti polj `tasks(P)` se ne spremenijo. | D03; lastni test nespremenjenih podatkov |
| R12 | Navigacija po projektih in podrobnosti opravila delujeta; filtriranje ne pošlje nobenega `POST/PATCH/PUT/DELETE` na `/api/`; ohranjeni so Folio, `aria-label="Pregled stanj opravil"`, `data-task-id` na vrsticah in karticah ter prikaz pri 390 px (notranje drsenje dovoljeno). | D04 (`readonly`); `tests/baseline.spec.ts`, `tests/api.spec.ts`; lastni test ozke širine |

Dogovor o vmesniku (dostopna imena): `Išči opravila`, `Filter stanja`,
`Filter odgovorna osebe`, `Počisti filtre`, `Preglednica`, `Tabla`,
`Rezultati filtriranja`. Nova dejanja ob opravilu morajo biti zunaj njegove
povezave. Besedilo, ki ni določeno zgoraj, in razporeditev kontrol nista
predpisana.

## Izvedba in sledljivost

Predvidene točke: `src/App.tsx` (`ProjectView` — stanje filtrov, izračun
`shown`, povzetek, števec, sporočilo), `src/TaskBoard.tsx` (stolpci iz
`shown`), po potrebi nova pomožna datoteka v `src/` za `norm`, `tok` in
`match`. Spodnja tabela je načrt; izidov ne označujem kot uspešnih, ker jih v
vlogi specifikacije nisem izvajal. Implementer in reviewer vpišeta dejanske
rezultate.

| Zahteva | Pogoj | Test ali scenarij | Datoteka in del kode | Izid ter dokaz |
| --- | --- | --- | --- | --- |
| R01 | privzeto stanje in vsa opravila | D01 + agentni test | `src/App.tsx` | ni izvedeno |
| R02 | NFD, odstranitev U+0300–U+036F, male črke | D01 + agentni test | `src/` iskalna normalizacija | ni izvedeno |
| R03 | vse besede kot podnizi, vrstni red in ločila | D01 + agentni test | `src/` razčlenitev `q` | ni izvedeno |
| R04 | IN med iskanjem, stanjem in osebo | D02 + agentni test | `src/App.tsx` izračun `shown` | ni izvedeno |
| R05 | možnosti oseb iz celega projekta, brez ohranitve | agentni test | `src/App.tsx` možnosti `select` | ni izvedeno |
| R06 | isti ID-ji v obeh pogledih, ohranjeni filtri | D02 + agentni test | `src/App.tsx`, `src/TaskBoard.tsx` | ni izvedeno |
| R07 | menjava projekta ponastavi filtre | agentni test | `src/App.tsx` | ni izvedeno |
| R08 | osvežitev brez trajne shrambe in URL-ja | agentni test | `src/App.tsx` | ni izvedeno |
| R09 | `Prikazano: N od M.` in števci `shown` | D04 + agentni test | `src/App.tsx`, `src/TaskBoard.tsx` | ni izvedeno |
| R10 | `Ni zadetkov.`; prazen projekt `0 od 0` | D03 + agentni test | `src/App.tsx` | ni izvedeno |
| R11 | eno dejanje počisti vse tri kontrole | D03 + agentni test | `src/App.tsx` | ni izvedeno |
| R12 | brez zapisov, navigacija, ozka širina | D04 (`readonly`), baseline, agentni test | `src/App.tsx`, `src/TaskBoard.tsx`, `src/styles.css` | ni izvedeno |

## Odprta vprašanja in omejitve

- Razvojni testi D01–D04 so primeri, ne celoten obseg; končni testi lahko
  uporabijo drugačne podatke (tudi 0, 1 ali >10 opravil, enake naslove,
  različno zaporedje). Zato pravila veljajo splošno, ne le za primere.
- Predpostavka: `polja(t)` so združena z enojnim presledkom; iskanje teče po
  celotnem seznamu projekta, preden se uporabijo filtri.
- Ne širimo se na navigacijo med nalaganjem, sočasne spremembe podatkov brez
  osvežitve, trajno shrambo filtrov ali nove zapisovalne API-je.
- Testne kontrole `/__test/` so samo za teste; UI jih ne sme brati.
- V vlogi specifikacije nisem zagnal aplikacije, testov ali pregleda videza;
  to opravita implementer in reviewer ter vpišeta dokaze.
