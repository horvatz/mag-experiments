Zdaj pa, ko imamo sliko o obstoječi strukturi in zahtevah, bom ustvaril kratko in preverljivo razvojno specifikacijo.

---

# Predlog specifikacije: Iskanje in filtri opravil

## Problem in kontekst
Aplikacija za sledenje opravil omogoča vpogled v opravila specifičnega projekta. Trenutni vmesnik prikazuje vsa opravila. Novost: iskalni vnos in filterji za stanje in odgovorno osebo za hiter vpogled v podskupino opravil brez polnega nalaganja (client-side filtriranje).

## Vhodi, dejanja in izidi
- **Iskalni vnos (`search`)**: tip `search`, `placeholder="Išči opravila"`, ločilo `value` razdruženo po belinah → neprazne besede.
- **Filter stanja (`statusFilter`)**: `<select>` z možnostmi `all`, `todo`, `in_progress`, `done`. Slabeš slovenske oznake za UI: celotno se ne nanaša na API, vrednosti ostajajo angl.
- **Filter odgovorne osebe (`assigneeFilter`)**: `<select>` s prvo opcijo `all` in seboj preostale vsakokrat različne neprazne `assignee` vrednosti iz `tasks[].assignee`. Uporabnik izbere točno ime.
- **Gumb Počisti filtre (`clearFilters`)**: ko ga uporabnik pritisne, vsa tri kontrola (`search`, `statusFilter`, `assigneeFilter`) se pričnejo vrniti v privzeto stanje.

**Pričakovano stanje po uspehu**:  
Količina prikazanih opravil (brez stranirov) se izračuna kot rezultat:

```
const filtered = tasks.filter(
  t =>
    (!search || text.toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g,"")
      .includes(word.normalize("NFD").replace(/[\u0300-\u036f]/g,"")))
    && (!statusFilter || t.status === statusFilter)
    && (!assigneeFilter || t.assignee === assigneeFilter)
)
```

kjer je `text = \`${t.title} ${t.description} ${t.assignee}\``.

**Napake**: če API vrne 5xx ali 4xx, odziva se `error` v `useResource` in se prikaz sporočila "Podatkov ni mogoče pridobiti. Poskusi znova.".

## Zahteve in pravila

| Zahteva | Pravilo oziroma sprejemni pogoj | Način preverjanja |
| --- | --- | --- |
| R01 | Pri praznem iskalnem vnosu in izbranem `statusFilter = all` ter `assigneeFilter = all` morajo biti prikazana vse opravila trenutnega projekta v izvornem vrstnem redu. | Preveriti, da filter nikoli ne spremeni vrstnega reda podatkov. |
| R02 | Izraz mora biti normaliziran z NFD, odstranjeni vsi kombinacijski znaki U+0300–U+036F in pretvorjeni v mali zapis. Zato `č` in `c` ter različno velikost črk ne vplivata na zadetek. | Simulirati API odgovor z Unicode znaki ter preveriti, da filterji in iskanje ne ločijo č in c. |
| R03 | Iskalni vnos se razdeli na besede (po belinah) in vsaka beseda mora biti dobesedni podnad iz vseh zlatih polj v obravnavanem opravilu. Vrstni red besed ni pomemben. Prazen vnos ne narekuje niti filterja. | Izračun vsakim opravilu, ki ustreza ključem `searchWords`, pri čemer preverimo, da se vsaka beseda `searchWords` pojavlja vsaj enkrat v obravnavani opravilski teksti. |
| R04 | Filter stanja in filter odgovorne osebe delujeta skupaj z iskanjem po logičnem AND. Stanje ima vrednosti `all`, `todo`, `in_progress`, `done`. Odgovorna oseba se primerja točno, brez normalizacije. | Preveriti, da `any(T => (searchMatch && statusMatch && assigneeMatch))` vodi do pravilnega rezultata. |
| R05 | Izbirnik oseb vsebuje možnost `all` in vsako različno neprazno ime iz celotnega trenutnega projekta natanko enkrat, tudi če je trenutno skrito zaradi drugih pogojev. Preklop projekta ponastavi seznam oseb. | Preveriti, da se ko vrnem nazaj na glavni pogled in spremenim projekt, ponastavi `assigneeFilter` na `all`. |
| R06 | Preglednica in tabla kažeta iste ustrezne ID-je; preklop pogleda ohrani vse filtre. Stolpci table vsebujejo samo ustrezna opravila svojega stanja. | Preveriti, da `taskCard` in `taskTable` uporabljajo iste podatke iz `useResource` s podatki. |
| R07 | Menjava projekta ponastavi iskanje in oba filtra. Filtri se nikoli ne uporabijo na podatkih drugega projekta. | Preveriti, da `projectId` sprememba resetira `search`, `statusFilter`, `assigneeFilter` na privzete vrednosti. |
| R08 | Osvežitev strani začne s privzetimi filtri. Filtri se ne shranjujejo v URL ali trajno shrambo brskalnika. | Preveriti, da po refreshu vsi filtri dobijo privzete vrednosti. |
| R09 | `Prikazano: N od M`, kjer `M` je velikost celotnega trenutnega projekta. Pregled stanj in števci stolpcev štejejo prikazane rezultate. | Preveriti, da `total` ali `totalTasks` vmesnik predstavlja celotno število opravil v projektu. |
| R10 | Če v nepraznem projektu nobeno opravilo ne ustreza, je prikazano sporočilo "Ni zadetkov." in oba pogleda ostaneta uporabna. Prazen projekt ohrani običajno prazno stanje in števec 0 od 0. | Preveriti, da je `result?.data?.tasks` košarica (`tasks: []`), če vsi filtri ne ujemajo nobenega opravila. |
| R11 | Počisti filtre v enem dejanju vrne vse tri kontrole na privzete vrednosti in prikaže vsa opravila. Uporaba filtrov ne spremeni izvornega vrstnega reda ali polj podatkov. | Po kliku na "Počisti filtre" so `search = "", statusFilter = "all", assigneeFilter = "all"`. |
| R12 | Obstoječa navigacija in bralne podrobnosti delujejo. Nobeno dejanje filtriranja ne pošlje POST/PATCH/PUT/DELETE na `/api/`. Ohranjen je Folio in prikaz pri ozki širini. | Preveriti, da se uporabi `request` samo z `GET` za iskanje in filterje. |

**Simboli in predpostavke**
- `text` → dolga vrstica, vsebuje `title`, `description`, `assignee`.
- `word` → neprazna beseda v iskalnem vnosu.
- `searchMatch` → vsi `word` v `search` so podnizi `text`.
- `statusMatch` → `statusFilter === 'all' || t.status === statusFilter`.
- `assigneeMatch` → `assigneeFilter === 'all' || t.assignee === assigneeFilter`.
- "Prazan projekt" → `tasks` seznam je prazen (`length === 0`).

## Izvedba in sledljivost

| Zahteva | Pogoj | Test ali scenarij | Datoteka in del kode | Izid ter dokaz |
| --- | --- | --- | --- | --- |
| R01 | `[all, all, ""]` → `tasks` | `tests/agent/search-and-filters.spec.ts` | `src/App.tsx` (ali drugje) | Preverimo, `tasks` ujema celotno množico. |
| R02 | NFD, kombinacijski znaki, majčne | `search: "či"`, `tasks: [{title: "Čiščenje"}]` | `src/App.tsx` | `task` z naslovom `Čiščenje` zadane. |
| R03 | Ločilo po belinah, vse besede | `search: "priprava oblik"` → `title="Priprava oblikovnih smernic"` | `src/App.tsx` | `task` se ujema. |
| R04 | `AND` kombinacija | `search="ana"`, `statusFilter="todo"`, `assigneeFilter="Ana Novak"` | `src/App.tsx` | Samo opravila, ki ustrezajo vsem podatkom, se prikažejo. |
| R05 | vsi `assignee` iz projekta | `assigneeFilter` vsebuje `all` in vsaka različna `assignee` | `src/App.tsx` | `assigneeFilter` se ponastavi po preklopu projekta. |
| R06 | Prikaz in tabela istih ID-jev | `data-task-id` na vrsticah in karticah | `src/App.tsx` | Enakih ID-jev v obema pogleda. |
| R07 | Reset med projektom | `projectId` spremeni | `src/App.tsx` | `search`, `statusFilter`, `assigneeFilter` se resetirajo. |
| R08 | Privzeti filtri ob refreshu | `navigate("/projects/123")` → `reload()` | `src/App.tsx` | Filtri se vzamejo na privzete. |
| R09 | `Prikazano: N od M` | `tasks.length === 5` → `M=5` | `src/App.tsx` | Štec razkriva pravilno število. |
| R10 | "Ni zadetkov." za neustrezne filtre | `tasks: [{status="done", title="X"}]` → `search="y"` | `src/App.tsx` | Prikaz "Ni zadetkov." in oba pogleda ostaneta uporabna. |
| R11 | Počisti → `all, all, ""` | `clearFilters` klik | `src/App.tsx` | Vse kontrole se resetirajo, `tasks` se prikazuje. |
| R12 | Brez `POST`/`PATCH` na `/api/` | `search`, `statusFilter`, `assigneeFilter` | `src/App.tsx` | HTTP `request` vsebuje samo `GET`. |

## Odprta vprašanja in omejitve

- Za sedaj predpostavimo, da `useResource` upravlja `GET` za iskanje in filterje v enakem URL-ju kot za vse podatke, vendar z GET samo. To je treba potrditi z API dokumentacijo, čeprav ta ne navaja posebnih meja.
- Če obstajajo dodatne možnosti za filter, so trenutno neznane. Če pride do spremembe, je treba novih filtrov dodati v `shared/types.ts` in API.
- Filtri so privzeto "zaprti" (ni shranjeno v URL ali shrambo). Če bi se hitrejši filterji zahtevali, bi bilo treba razmisliti o shranjevanju v shrambi ali URL parametr.

---

Zgodovina dokumentacije (`docs/agent/specification-history.md`) pričakuje zapis o tem, ko specifikacija nastali in kdaj bo podvržena spremembam.

Če želiš, lahko zapišem tudi skripto, ki bo `docs/agent/specification-history.md` nadgrajena z nastopajočim zapisom s časstempelom o vašem delu.

Tudi preverile lahko API endpointe API za izvedbe in preveri, kako je mogoče dodati nove polja ali status v `shared/types.ts`.
