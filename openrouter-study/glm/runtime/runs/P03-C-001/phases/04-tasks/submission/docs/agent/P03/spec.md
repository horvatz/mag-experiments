# P03 — Specifikacija: Iskanje in sestavljeni filtri

Status: specifikacija 1.0. Vir zahtev je [`task/instructions.md`](../../../task/instructions.md); merila projekta so v [`PROJECT_RULES.md`](../../../PROJECT_RULES.md), projektne meje pa v [`.specify/memory/constitution.md`](../../../.specify/memory/constitution.md).

## Problem in kontekst

Folio omogoča izbiro projekta, pregled opravil v preglednici ali tabli ter odpiranje bralnih podrobnosti. Uporabnik potrebuje hitro zožitev seznama z besedilnim iskanjem in filtri, pri čemer morajo obstoječe poteze, dostopnost, potrjen Folio dizajn in javni API `/api/` ostati nespremenjeni.

Ta dokument opisuje samo funkcionalnost P03. Ne dodaja novih API-jev, odvisnosti, zunanjih meritev, trajne shrambe ali sprememb skupne infrastrukture.

## Vhodi, dejanja in izidi

### Podatki

Podatke pridobi obstoječi odjemalec z:

- `GET /api/projects` za projekte;
- `GET /api/projects/:id/tasks` za vsa opravila trenutnega projekta;
- `GET /api/tasks/:id` za obstoječe bralne podrobnosti.

Relevantna polja opravila so `id`, `title`, `description`, `status`, `assignee` in `dueDate`. Vrstni red je vrstni red elementov v odgovoru in se ohrani. Projekti so lahko prazni. Iskanje in filtri so izključno odjemalec: ne pošiljejo novih zahtev in ne spreminjajo podatkov.

### Kontrol

- Iskalni vnos je `input type="search"` z dostopnim imenom `Išči opravila.`
- Filter stanja je HTML `select` z vrednostmi `all`, `todo`, `in_progress` in `done` ter dostopnim imenom `Filter stanja`.
- Filter odgovorne osebe je HTML `select` z vrednostjo `all` in točno eno možnost za vsako različno neprazno ime v trenutnem projektu; dostopno ime je `Filter odgovorne osebe`.
- Gumb `Počisti filtre` v en dejanju ponastavi vse tri kontrole.
- Stanje rezultatov ima `role="status"`, `aria-label="Rezultati filtriranja"` in besedilo `Prikazano: N od M.`

### Stanje in pravila

Privzeto stanje filtrov za vsak projekt je:

```text
query = ""
statusFilter = "all"
assigneeFilter = "all"
```

Normalizacija za iskanje je:

```text
normalize(value) =
  value.normalize("NFD")
        .replace(/[\u0300-\u036F]/g, "")
        .toLowerCase()

searchTerms(query) =
  query.trim().split(/\\s+/)
      .filter(term => term !== "")
      .map(normalize)

searchableFields(task) =
  [task.id, task.title, task.description, task.assignee]

matchesSearch(task, terms) =
  terms.every(term =>
    searchableFields(task)
      .some(field => normalize(field).includes(term)))
```

Iskanje zajame vsa štiri polja; besede so dobesedni podnizi, ne vzorce regularnih izrazov. Vrstni red besed ni pomemben. Prazen iskalni vnos ne omejuje.

Preostali pravili:

```text
matchesStatus(task, statusFilter) =
  statusFilter === "all" || task.status === statusFilter

matchesAssignee(task, assigneeFilter) =
  assigneeFilter === "all" || task.assignee === assigneeFilter
```

Odgovorna oseba se primerja natančno, brez normalizacije. Končni seznam je:

```text
visibleTasks = sourceTasks.filter(task =>
  matchesSearch(task, searchTerms(query)) &&
  matchesStatus(task, statusFilter) &&
  matchesAssignee(task, assigneeFilter))
```

N je število `visibleTasks`, M pa število vseh opravil trenutnega projekta. Seznam ohrani izvorni vrstni red in ne spremeni polj opravil.

### Spremembe stanja

| Dogodek | Spremeni | Ohrani | Pričakovani izid |
| --- | --- | --- | --- |
| Nalaganje ali osvežitev | filtre na privzete vrednosti | izbrani pogled iz poti | Prikazana so vsa opravila trenutnega projekta. |
| Vnos ali brisanje iskalnega besedila | samo `query` | status, osebo in pogled | Seznam se takoj prefiltrira brez nove zahteve. |
| Sprememba filtra stanja | samo `statusFilter` | iskanje, osebo in pogled | Rezultati se prefiltrirajo po logičnem IN. |
| Sprememba filtra osebe | samo `assigneeFilter` | iskanje, status in pogled | Rezultati se prefiltrirajo po logičnem IN. |
| Preklop preglednica/tabla | samo pogled | vsa tri stanja filtrov | Pogleda prikažeta iste ustrezne ID-je. |
| Menjava projekta | projekt in vse tri filtre | pogled | Filtri se ne uporabijo na podatkih drugega projekta. |
| `Počisti filtre` | vse tri filtre na privzeto | pogled | Prikazana so vsa opravila trenutnega projekta. |
| Odpiranje ali zapiranje podrobnosti | nobenega filtra | filtre in pogled | Obstoječa navigacija in bralne podrobnosti delujejo. |
| Napaka pri nalaganju | nobenega veljavnega seznama | obstoječe prikazano stanje napake | Uporabi se obstoječe sporočilo in ponovni poskus; filtri ne prikazujejo izmišljenih rezultatov. |

Filtri se ne zapisujejo v URL, `localStorage`, `sessionStorage` ali drugo trajno shrambo. Testnih kontrol `/__test/` uporabniški vmesnik ne bere in ne uporablja.

## Zahteve in sprejemni pogoji

| Zahteva | Pravilo oziroma sprejemni pogoj | Način preverjanja |
| --- | --- | --- |
| R01 | Ob nalaganju je `query=""`, status `all`, oseba `all`; prikazani so vsi ID-ji trenutnega projekta v izvornem vrstnem redu. | Za vsaj dva projekta naloži pot in preveri kontrol ter zaporedje ID-jev. |
| R02 | Iskanje primerja `id`, `title`, `description` in `assignee`; obe strani normalizira z NFD, odstrani kombinacijska znamenja `U+0300`–`U+036F` in pretvori v male črke. | Primeri z `č`/`c`, velikimi/malimi črkami, diakritiki in zadetki v vsakem polju. |
| R03 | Vnos razdeli po belinah na neprazne besede; opravilo ustreza, če je vsaka beseda dobesedni podnizi vsaj enega iskanega polja. Vrstni red besed ni pomemben; prazen vnos ne omejuje. | Večbesedni iskalni vnosi v različnem vrstnem redu, ločila in regularni izrazi kot navadno besedilo. |
| R04 | `matchesSearch && matchesStatus && matchesAssignee`; status je ena od `all`, `todo`, `in_progress`, `done`; oseba se primerja natančno. | Kombinacije iskanja, statusa in osebe ter osebe z istim normaliziranim, a različnim izvornim zapisom. |
| R05 | Izbirnik oseb vsebuje `all` in vsako različno neprazno ime celotnega trenutnega projekta natanko enkrat, tudi če trenutni filtri zadetek skrijejo. Menjava projekta resetira osebo na `all`. | Preveri možnosti pred in po filtrih ter ob preklopu na projekt z drugačnimi imeni. |
| R06 | Preglednica in tabla uporabita isti `visibleTasks`; preklop pogleda ohrani vsa tri stanja filtrov. Vsak stolpec table vsebuje samo opravila svojega statusa. | Primerjaj `data-task-id` v obeh pogledih in karte po stolpcih pred/po preklopu. |
| R07 | Menjava projekta nastavi `query=""`, `statusFilter="all"` in `assigneeFilter="all"`; stara izbira se ne uporabi na novem projektu. | Nastavi neprivzete filtre, preklopi projekt in preveri privzeto stanje ter rezultate. |
| R08 | Osvežitev ponastavi filtre; URL in trajna shramba brskalnika ne vsebujeta filtrirnega stanja. | Nastavi filtre, osveži in preveri DOM, URL ter shrambo. |
| R09 | Status ima točno `Prikazano: N od M.`; M je velikost celotnega trenutnega projekta. Pregled stanj in števci stolpcev štejejo prikazane rezultate. | Preveri sporočilo, tri vsote po statusih in števce stolpcev za delne in prazne rezultate. |
| R10 | V nepraznem projektu z `N=0` je vidno `Ni zadetkov.`; oba pogleda in kontrole ostaneta uporabna. Prazen projekt ohrani obstoječe prazno stanje in `Prikazano: 0 od 0.` | Poglej oba pogleda pri zadetku brez zadetkov ter prazen in neprazen projekt. |
| R11 | `Počisti filtre` v en dejanju ponastavi iskanje, status in osebo ter prikaže vsa opravila. Vrstni red in polja ostanejo enaki. | Spremeni vse tri kontrole, počisti in primerjaj ID-je, vrstni red ter podatke. |
| R12 | Obstoječa navigacija in podrobnosti delujejo; nobeno dejanje filtriranja ne pošlje `POST`, `PATCH`, `PUT` ali `DELETE` na `/api/`. Folio in prikaz na širini 390 px sta ohranjena. | Regresijski testi navigacije, sledenje omrežnim zahtevam pri filtriranju in vizualna preverba ozke širine. |

Dodatne ohranitve:

- `data-task-id` ostane na vrsticah preglednice in karticah table.
- Dostopna imena obstoječih pogledov in stolpcev ter `aria-label="Pregled stanj opravil"` se ohranijo.
- Nova dejanja ob opravilu morajo biti zunaj njegove povezave.
- Na širini 390 px se cela stran ne razširi; dovoljeno je notranje drsenje preglednice in table.
- Ohranijo se slovenska poimenovanja in potrjeni Folio iz [`docs/dizajn.md`](../../dizajn.md).

## Izvedba in sledljivost

Načrtovana osrednja izvedba je `src/App.tsx` za kontrol in stanje ter `src/TaskBoard.tsx` za stolpce table. Podrobnosti lahko zahtevajo manjše dopolnitve obstoječih komponent, vendar brez sprememb strežnika, skupnih tipov, odvisnosti ali infrastrukture.

Razvojno preverjanje bo dodano v `tests/agent/p03.spec.ts` in bo pokrilo vsaj privzeti prikaz, normalizacijo, večbesedno iskanje, kombinirane filtre, možnosti oseb, oba pogleda, preklop projekta, osvežitev, števce, prazne zadetke, čiščenje, navigacijo, omrežne zahteve in ozko širino. Skupni testi ostanejo [`tests/baseline.spec.ts`](../../../tests/baseline.spec.ts) in [`tests/api.spec.ts`](../../../tests/api.spec.ts).

| Zahteva | Pogoj | Test ali scenarij | Datoteka in del kode | Izid ter dokaz |
| --- | --- | --- | --- | --- |
| R01 | Privzete kontrole in izvorni vrstni red | Nalaganje projekta in primerjava ID-jev | `src/App.tsx`; `tests/agent/p03.spec.ts` | Ni izvedeno v fazi specifikacije. |
| R02 | Normalizacija obeh strani | Zadetki po poljih, č/c, velikost, diakritiki | `src/App.tsx`; `tests/agent/p03.spec.ts` | Ni izvedeno v fazi specifikacije. |
| R03 | Več besed po logičnem IN | Večbesedni vnosi v različnem vrstnem redu | `src/App.tsx`; `tests/agent/p03.spec.ts` | Ni izvedeno v fazi specifikacije. |
| R04 | Iskanje IN status IN oseba | Matrika kombinacij filtra | `src/App.tsx`; `tests/agent/p03.spec.ts` | Ni izvedeno v fazi specifikacije. |
| R05 | `all` + vsa različna imena natanko enkrat | Neprazni projekti, več enakih imen, preklop projekta | `src/App.tsx`; `tests/agent/p03.spec.ts` | Ni izvedeno v fazi specifikacije. |
| R06 | Enaki ID-ji v obeh pogledih | Preklop pogleda s ohranjenimi filtri | `src/App.tsx`, `src/TaskBoard.tsx`; `tests/agent/p03.spec.ts` | Ni izvedeno v fazi specifikacije. |
| R07 | Reset ob preklopu projekta | Neprivzeti filtri, nato preklop projekta | `src/App.tsx`; `tests/agent/p03.spec.ts` | Ni izvedeno v fazi specifikacije. |
| R08 | Brez URL ali trajne shrambe | Osvežitev, URL in shramba brskalnika | `src/App.tsx`, `src/navigation.ts`; `tests/agent/p03.spec.ts` | Ni izvedeno v fazi specifikacije. |
| R09 | `Prikazano: N od M.` in števci | Delni in prazni rezultati | `src/App.tsx`, `src/TaskBoard.tsx`; `tests/agent/p03.spec.ts` | Ni izvedeno v fazi specifikacije. |
| R10 | `Ni zadetkov.` in uporabna pogleda | Neprazen projekt brez zadetkov; prazen projekt | `src/App.tsx`, `src/TaskBoard.tsx`; `tests/agent/p03.spec.ts` | Ni izvedeno v fazi specifikacije. |
| R11 | Eno dejanje počisti vse | Spremeni vse tri kontrole, nato počisti | `src/App.tsx`; `tests/agent/p03.spec.ts` | Ni izvedeno v fazi specifikacije. |
| R12 | Navigacija, brez pisanja, Folio, 390 px | Regresija navigacije, sledenje zahtev, ozka širina | `src/App.tsx`, `src/TaskBoard.tsx`, `src/styles.css`; `tests/agent/p03.spec.ts` | Ni izvedeno v fazi specifikacije. |

Po implementaciji se stolpec z izidom dopolni z imenom testa, ukazom in dejanskim dnevnikom. Neizvedenih ali nedostopnih preverjanj ne smemo označiti kot uspešnih.

## Odprta vprašanja in omejitve

- Ni odprtega vprašanja, ki bi blokiralo specifikacijo ali implementacijo.
- Predpostavka iz naloge: imena odgovornih oseb so neprazna in različna od rezervirane vrednosti `all`; naslovi, opisi in imena so navadno besedilo.
- Sočasnih sprememb podatkov med nalaganjem in navigacij med nezaključenim nalaganjem ne širimo prek obstoječih regresijskih zahtev, skladno z [`task/instructions.md`](../../../task/instructions.md).
- Končni skriti testi niso dostopni; veljajo le dejansko izvedena razvojna in skupna preverjanja.
- Ta faza ne vkljuuje implementacije, zato izidov testov še ni in jih specifikacija ne izmišljuje.
