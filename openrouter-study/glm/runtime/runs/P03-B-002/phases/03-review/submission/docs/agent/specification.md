# Specifikacija: Iskanje in sestavljeni filtri

## Problem in kontekst

Folio trenutno prikaže vsa opravila izbranega projekta. Uporabnik potrebuje hitro, predvidljivo ožanje seznama po besedah, stanju in odgovorni osebi, brez spremembe vrstnega reda, navigacije ali obstoječega dizajna.

Specifikacija zajema iskalni vnos, dva filtra, gumb za čiščenje, števec rezultatov, preglednico in tablo ter ohranja obstoječe bralne podrobnosti. Stanje filtriranja je trenutno stanje vmesnika; ni shranjeno v URL-ju ali brskalnikovi trajni shrambi.

## Vhodi, dejanja in izidi

- Seznam projektov se bere z `GET /api/projects`; opravila trenutnega projekta pa z `GET /api/projects/{projectId}/tasks`, kjer se `projectId` URL-kodira. Podatkovna tipa sta `Project` in `Task` iz `shared/types.ts`.
- `Task` vsebuje `id`, `projectId`, `title`, `description`, `status`, `assignee` in `dueDate`; `status` je `todo`, `in_progress` ali `done`. `dueDate` se v filtriranju ne upošteva.
- Uporabniška dejanja so vnos iskalnega besedila, izbira stanja, izbira odgovorne osebe, preklop med preglednico in tablo ter počiščenje filtrov. Vsa dejanja so bralna.
- Kontrolni vmesnik je: iskalni `input type="search"` z dostopnim imenom `Išči opravila`, `select` `Filter stanja`, `select` `Filter odgovorne osebe`, gumb `Počisti filtre` in status `Rezultati filtriranja`.
- Izid je enoten niz ustrezajočih opravil za oba pogleda, pri čemer ostane izvorno zaporedje iz API odgovora nespremenjeno. Kontrola stanja je `all`, `todo`, `in_progress` ali `done`; kontrola osebe je `all` ali točno ime obstoječe osebe.
- Po uspešnem vnosu se takoj posodobi prikaz in števci. Preklic vnosa ali zapora podrobnosti ne spremeni filtriranega stanja; gumb `Počisti filtre` ga ponastavi.
- Napake nalaganja in obstoječa bralna napaka ostanejo v sedanji obliki; filtri ne skrivajo nadzora za ponovni poskus nalaganja.

## Zahteve in pravila

Za iskanje definiraj `searchText` kot uporabniško besedilo, `joined(task) = [task.id, task.title, task.description, task.assignee].join(" ")`, `normalize(text)` kot Unicode NFD, odstranitev znakov `U+0300`–`U+036F` in pretvorbo v male črke. Iskalne besede so neprazni členi `searchText.split(/\s+/)`. Rezultat ustreza iskanju, če je `normalize(searchTerm)` prazen ali če za vsako besedo velja, da je dobesedni podniz niza `normalize(joined(task))`.

Sprejemni predikat za eno opravilo je:

```text
searchMatches(task, search) = terms(normalize(search)) = ∅
  ∨ ∀ term ∈ terms(normalize(search)):
      normalize(joined(task)) contains term
statusMatches(task, status) = status = "all" ∨ task.status = status
assigneeMatches(task, assignee) =
  assignee = "all" ∨ task.assignee = assignee
taskMatches(task) = searchMatches ∧ statusMatches ∧ assigneeMatches
```

Seznam `visibleTasks` je zaporedje `tasks.filter(taskMatches)` in ne sme razvrstiti ali kopirati podatkov. Seznam oseb je sestavljen iz vseh `task.assignee` vrednosti trenutnega projekta: `all` plus vsaka različna neprazna vrednost natanko enkrat. Podvojeni vnosi se razveljavijo po točni vrednosti; `all` je rezervirana vrednost, ne pa tudi dejansko ime osebe.

| Zahteva | Pravilo oziroma sprejemni pogoj | Način preverjanja |
| --- | --- | --- |
| R01 | Nov `ProjectView` ima prazen `search`, `status = "all"` in `assignee = "all"`, `visibleTasks = tasks` pa ohrani izvorno zaporedje. | Test naloži projekt in primerja `data-task-id` z zaporedjem iz `GET /api/projects/{id}/tasks`. |
| R02 | Iskanje primerja normalizirane združene vrednosti `id`, `title`, `description` in `assignee`; normalizacija odpravi razlike med `č` in `c` ter med velikimi in malimi črkami. | Testi z Unicode, velikimi črkami, imeni, ID-ji, opisi in odgovornimi osebami. |
| R03 | Vse neprazne iskalne besede morajo biti dobesedni podnizi združenega polja; vrstni red besed ni pomemben in ločila niso regularni izrazi. Prazen vnos ne filtrira. | Testi z več besedami v drugem vrstnem redu, presledki, ločili in praznim vnosom. |
| R04 | Iskanje, stanje (`all`, `todo`, `in_progress`, `done`) in odgovorna oseba se združijo z logičnim IN; oseba se primerja natančno in brez normalizacije. | Testi za vsak filter posebej in za vse kombinacije, vključno z istim imenom v različnih zapisih. |
| R05 | Seznam oseb vsebuje `all` in vsako različno neprazno ime celotnega trenutnega projekta natanko enkrat, ne glede na trenutne filtre. Menjava projekta ponastavi izbiro na `all`. | Test preveri možnosti selecta pred in po iskanju ter po preklopu projekta. |
| R06 | Preglednica in tabla prejeta isti `visibleTasks`. Preklop `view` ohrani `search`, `status` in `assignee`. Stolpci table vsebujejo samo `visibleTasks` svojega stanja. | Test nastavi vse tri kontrole, preklopi tabla/preglednica in primerja ID-je po stolpcih. |
| R07 | Menjava projekta ponastavi iskanje in oba filtra; filtri se izvrednotijo samo nad opravili novega projekta. | Test z različnimi filtri v dveh projektih in primerjava ID-jev. |
| R08 | Osvežitev strani vrne privzete filtre; vnosov ni v URL-ju, `localStorage` ali drugi trajni shrambi. | Test osvežitve in preverjanje ohranjenosti URL-ja ter shrambe. |
| R09 | Element `role="status"`, `aria-label="Rezultati filtriranja"` ima točno `Prikazano: {visibleTasks.length} od {tasks.length}.`; pregled stanj, števec razdelka in števci stolpcev štejejo `visibleTasks`. | Testi z delnim, popolnim, ničelnim in praznim nizom rezultatov. |
| R10 | Če je `tasks.length > 0` in `visibleTasks.length = 0`, se v `Ni zadetkov.` sporoči v obeh pogledih, preklopa pogleda pa ostaneta delujoča. Če je `tasks.length = 0`, ostane obstoječe prazno stanje projekta in status `Prikazano: 0 od 0.`. | Testa za neprazen projekt brez zadetkov in za prazen projekt. |
| R11 | `Počisti filtre` v enem dejanju nastavi prazen iskalni vnos ter `all` za oba filtra in prikaže vsa opravila; vrstni red in podatki ostanejo nespremenjeni. | Test s tremi aktivnimi filtri in primerjava izvornega vrstnega reda. |
| R12 | Ohranjena sta obstoječa navigacija in bralne podrobnosti, vključno s `data-task-id`, dostopnimi imeni pogledov, `aria-label="Pregled stanj opravil"` in povezavami zunaj novih dejanj. Dejanja filtriranja ne povzročijo `POST`, `PATCH`, `PUT` ali `DELETE` na `/api/`; Folio in 390 px ostanejo ohranjeni. | Regresijski testi obstoječih poti, nadzor omrežnih zahtevkov in preverjanje širine dokumenta. |

## Izvedba in sledljivost

| Zahteva | Pogoj | Test ali scenarij | Datoteka in del kode | Izid ter dokaz |
| --- | --- | --- | --- | --- |
| R01 | Privzeti trije vnosi in izvorno zaporedje. | Naloži projekt in primerja ID-je. | `src/App.tsx` — stanje v `ProjectView`, izpeljava `visibleTasks`. | Ni izvedeno; implementer bo zagnal teste. |
| R02 | Normalizacija z NFD, odstranitvijo diakritičnih znakov in malimi črkami nad združenim nizom. | Išči `č`/`c`, velike/male črke, ID, opis in osebo. | `src/App.tsx` — funkciji `normalize` in `searchMatches`. | Ni izvedeno. |
| R03 | Vse besede so dobesedni podnizi; prazen vnos ne omejuje. | Išči dve besedi v obratnem vrstnem redu, ločilo in presledke. | `src/App.tsx` — razčlenjevane iskalnih besed. | Ni izvedeno. |
| R04 | Združevanje vseh treh pogojev z IN. | Kombiniraj iskanje, stanje in osebo. | `src/App.tsx` — funkcija `taskMatches`. | Ni izvedeno. |
| R05 | Seznam oseb iz celotnega projekta, enkrat. | Preveri možnosti selecta z več enakimi imeni in skritimi zadetki. | `src/App.tsx` — izpeljava `assignees`. | Ni izvedeno. |
| R06 | Enaki vidni ID-ji v obeh pogledih. | Nastavi tri kontrole, preklopi tabla/preglednica. | `src/App.tsx` in `src/TaskBoard.tsx`. | Ni izvedeno. |
| R07 | Ponastavitev ob projektni zamenjavi in ločen obseg. | Nastavi filtre, preklopi projekt in primerjaj ID-je. | `src/App.tsx` — `ProjectView` s `key={project.id}`. | Ni izvedeno. |
| R08 | Stanje ni trajno ali v URL-ju. | Osveži stran po filtrih in preveri URL/shrambo. | `src/App.tsx` — lokalna stanja `useState`. | Ni izvedeno. |
| R09 | Števci se izpeljujejo iz `visibleTasks`. | Preveri status, povzetek, razdelek in stolpce. | `src/App.tsx` in `src/TaskBoard.tsx`. | Ni izvedeno. |
| R10 | Ločeno prazno stanje od stanja brez zadetkov. | Uporabi neprazen in prazen projekta. | `src/App.tsx` — pogojno sporočilo. | Ni izvedeno. |
| R11 | En sam gumb počisti vse tri kontrole. | Nastavi vse tri filtre in klikni gumb. | `src/App.tsx` — novi kontrolni elementi in `reset`. | Ni izvedeno. |
| R12 | Obstojeca bralna navigacija in ozki zaslon. | Regresija obstoječih testov, odpiranje podrobnosti, nadzor zapisov, 390 px. | `src/App.tsx`, `src/TaskBoard.tsx`, `src/TaskDetails.tsx`, `src/styles.css`. | Ni izvedeno. |

Priporočeni lastni testi so v `tests/agent/` in smejo uporabiti obstoječi razvojni pripomoček `tests/development/helpers.ts` le v testih. Uporabniški vmesnik ne sme uvažati ali klicati testnih kontrol `/__test/`.

## Sprejemni scenariji

- **D01 privzeti prikaz:** naloži `web`; pričakuj vseh ID-jev projekta v API zaporedju.
- **D02 sestavljeni filtri:** izberi `done` in `Ana Novak`; pričakuj enega zadetka v obeh pogledih.
- **D03 brez zadetkov in počiščenje:** išči besedilo brez zadetkov, pričakuj `Ni zadetkov.`, po gumbu pa vse ID-je.
- **D04 števci in bralnost:** izberi `todo`; pričakuj `Prikazano: 4 od 8.`, nobenega zapisovalnega zahtevka in širino brez prekoračitve.
- **Dodatni scenariji:** več besed v drugem zaporedju, normalizacija č/Č, prazen projekt, eno opravilo, več kot deset opravil, osebe skrite zaradi filtrov in preklop projekta.

## Odprta vprašanja in omejitve

- Ni odprtih vprašanj za implementacijo.
- Ne spreminjaj strežnika, `shared/types.ts`, skupnih testov, odvisnosti, nastavitev ali testnih kontrol.
- Specifikacija ne predpisuje novega zapisovalnega API-ja, storitve, trajne shrambe, URL parametrov filtrov ali razvrščanja rezultatov. Notranje drsenje preglednice in table je dovoljeno; zunanja širina dokumenta na 390 px ne sme narasti.
- Testni izidi v tej fazi niso izvedeni; implementer jih mora zabeležiti z dejanskimi imeni testov in dnevnikom zagona.
