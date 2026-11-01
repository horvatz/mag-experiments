# Specifikacija: Iskanje in sestavljeni filtri (P03)

## Problem in kontekst

Folio prikazuje opravila izbranega projekta v preglednici in tabi. Uporabnik želi z iskanjem po besedah ter filtroma stanja in odgovorne osebe zožiti prikaz, pri tem pa ohraniti obstoječo navigacijo, podrobnosti, števce, Folio videz in napake nalaganja.

Podatkovni model je iz `shared/types.ts`: `Task` ima `id`, `projectId`, `title`, `description`, `status` (`todo` | `in_progress` | `done`), `assignee` in `dueDate`; `Project` ima `id` in `name`. Obstoječi `ProjectView` v `src/App.tsx` bere opravila prek `GET /api/projects/{id}/tasks` in je že pripet na `project.id`, zato naj se novo stanje filtrov shrani znotraj te komponente. Tako preklop projekta samodejno ponastavi stanje, ne da bi se uporabilo za podatke drugega projekta.

## Vhodi, dejanja in izidi

- Vhodi: iskalni niz, vrednost filtra stanja, vrednost filtra odgovorne osebe, izbrani projekt in obstoječi pogled (`table` ali `board`).
- Kontrolna imena: iskalni `input type="search"` z dostopnim imenom `Išči opravila`, `<select>` `Filter stanja` z vrednostmi `all`/`todo`/`in_progress`/`done`, `<select>` `Filter odgovorne osebe`, gumb `Počisti filtre` in `role="status"` z `aria-label="Rezultati filtriranja"`.
- Privzete vrednosti ob uspešno naloženem projektu: prazen iskalni niz, `all` za stanje in `all` za odgovorno osebo.
- Dejanja: vnašanje oz. brisanje iskanja, izbira obeh filtrov, preklop pogleda, preklop projekta in klik na `Počisti filtre`.
- Uspeh: oba pogleda prikazujeta enake ustrezne ID-je v izvornem vrstnem redu, števci in sporočila se ujemajo, vsa tri kontrolna stanja ostanejo uporabna.
- Napaka nalaganja: ohrani obstoječi prikaz `LoadError` in možnost ponovnega poskusa; ne prikaži delnih ali namišljenih rezultatov.
- Filtriranje je izključno odjemalsko in bralno: ne dodajaj testnih kontrol, lokalne kopije podatkov, `localStorage` ali parametrov filtrov v URL.

## Zahteve in pravila

| Zahteva | Pravilo oziroma sprejemni pogoj | Način preverjanja |
| --- | --- | --- |
| R01 | Za vsak novo naložen projekt velja `search = ''`, `status = 'all'`, `assignee = 'all'`; prikazani so vsi `tasks.filter(task.projectId === project.id)` v API-jevem vrstnem redu. | Naloži oba projekta in primerjaj ID-je z izvornim seznamom. |
| R02 | Normalizacija za iskanje je `s.normalize('NFD').replace(/[\u0300-\u036F]/g, '').toLowerCase()` na iskalni strani in na združenem nizu `id title description assignee` opravila. | Poišči `CAS`, `č` oz. `c`, `Ž` oz. `ž` in kombinirana znamenja; preveri enake zadetke. |
| R03 | Prazen iskalni niz ne omejuje. Neprazen niz se razdeli po belinah, prazni deli se izpustijo; ustrezno opravilo mora po normalizaciji vsebovati vsak iskalni del kot dobesedni podniz. Vrstni red delov ni pomemben, ločila niso regularni izrazi. | Išči `naslov rok`, `rok naslov`, `=SUM(` in več besed; preveri le dobesedne zadetke. |
| R04 | Konjunkcija: `searchMatches(task) && statusMatches(task) && assigneeMatches(task)`. `all` pomeni brez omejitve; konkretno stanje zahteva `task.status === status`; konkretna oseba zahteva `task.assignee === assignee` brez normalizacije. | Nastavi iskanje, stanje in osebo skupaj ter preveri presek, ne unijo. |
| R05 | Možnosti oseb izhajajo iz celotnega nabora opravil trenutnega projekta, tudi če so zaradi iskanja ali stanja skrite. Vsebujejo natanko eno vrednost `all` in vsako neprazno različno `task.assignee` natanko enkrat. Ob preklopu projekta se stara izbira ne ohrani. | Preveri vrednosti in ponovitve v `<select>` ob različnih filtrih in preklopih projekta. |
| R06 | Preglednica in tabla prejmeta isti filtrirani seznam. Preklop `table`/`board` ohrani vsa tri kontrolna stanja. Stolpci table vsebujejo le filtrirana opravila svojega `status`. | Primerjaj vidne ID-je v obeh pogledih in ID-je po stolpcih. |
| R07 | Menjava projekta ponastavi iskanje in oba filtra, preden se uporabita na novih podatkih. Filtri nikoli ne vplivajo na opravila z drugim `projectId`. | Filtriraj prvi projekt, preklopi na drugega in preveri privzete kontrole ter celoten seznam. |
| R08 | Osvežitev strani vrne privzete filtre. Filtri se ne zapisujejo v URL, `localStorage`, `sessionStorage` ali drugo trajno shrambo. Obstoječi parameter `view` ostane dovoljen. | Nastavi filtre, osveži in preveri privzete vrednosti; lahko tudi preveri odsotnost shrambe. |
| R09 | `Prikazano: N od M.` ima `N = filteredTasks.length` in `M = tasks.length` trenutnega projekta. Pregled stanj in števci stolpcev štejejo filtrirana opravila, ne vse projekte ali neodvisne kopije. | Spreminjaj vse tri pogoje in preveri status, tri števce stanj in števce treh stolpcev. |
| R10 | Če je `M > 0` in `N = 0`, se izpiše točno `Ni zadetkov.` v odprtem pogledu, kontrole pa ostanejo vidne in uporabne. Če je `M = 0`, ostane obstoječe prazno stanje projekta in `Prikazano: 0 od 0.` | Ustvari neprazni nabor brez zadetkov ter prazen projekt; preveri obe stanji v obeh pogledih. |
| R11 | `Počisti filtre` v enem dejanju nastavi prazno iskanje in `all`/`all` ter prikaže vsa opravila trenutnega projekta v izvornem vrstnem redu. Filtriranje ne sortira in ne spreminja nobenega polja. | Filtriraj in počisti; primerjaj kontrolne vrednosti, ID-je in preostale vsebine celic. |
| R12 | Obstoječa navigacija projektov in podrobnosti ostane delujoča. Filtriranje ne sproži `POST`, `PATCH`, `PUT` ali `DELETE` na `/api/` in ne uporablja `/__test/`. Ohrani dostopna imena, `data-task-id`, `aria-label="Pregled stanj opravil"` in Folio pri 390 px brez razširitve celotne strani; notranje drsenje je dovoljeno. | Registriraj pisne zahteve in testno stanje med filtri; preveri podrobnosti, navigacijo ter `document.documentElement.scrollWidth <= innerWidth` pri 390 px. |

## Izvedba in sledljivost

| Zahteva | Pogoj | Test ali scenarij | Datoteka in del kode | Izid ter dokaz |
| --- | --- | --- | --- | --- |
| R01 | Privzeti prikaz celotnega projekta | D01 in nov agent test za oba projekta | `src/App.tsx`: stanje in filtriranje v `ProjectView` | Ni še izveden; implementer naj zapiše rezultat. |
| R02 | Normalizirano iskanje po vseh iskalnih poljih | Agent test z `č/c`, velikimi črkami in NFD | `src/App.tsx`: normalizacijska in `matches` funkcija | Ni še izveden. |
| R03 | Vse neprazne besede so dobesedni podnizi | Agent test z več besedami, drugačnim vrstnim redom in ločili | `src/App.tsx`: deljenje iskanja | Ni še izveden. |
| R04 | Iskanje IN stanje IN oseba | D02 in dodatni agent primer s tremi pogoji | `src/App.tsx`: sestavljena logika | Ni še izveden. |
| R05 | Vse različne osebe celotnega projekta | Agent test s skritimi osebami in preklopom projekta | `src/App.tsx`: izbira opcij | Ni še izveden. |
| R06 | Enaki rezultati v obeh pogledih | D02 in primerjava ID-jev po pogledih | `src/App.tsx`; `src/TaskBoard.tsx` | Ni še izveden. |
| R07 | Ponastavitev ob menjavi projekta | Agent test preklopa med `web` in `launch` | `src/App.tsx`: `key={project.id}` in stanje filtrov | Ni še izveden. |
| R08 | Brez trajnega ali URL stanja filtrov | Test osvežitve po nastavitvi filtrov | `src/App.tsx`: lokalni `useState` | Ni še izveden. |
| R09 | `N od M` ter filtrirani števci | D04 in primerjava s števci | `src/App.tsx`: `counts`; `src/TaskBoard.tsx`: števci stolpcev | Ni še izveden. |
| R10 | Nezadetki in prazen projekt | D03 ter agent test za prazen projekt | `src/App.tsx`: prazna stanja | Ni še izveden. |
| R11 | Počiščenje vseh treh kontrol | Test trije pogoji → počisti → privzeti stanji | `src/App.tsx`: gumb `Počisti filtre` | Ni še izveden. |
| R12 | Ohranjena branja, navigacija in ozka širina | Test pisnih zahtev, podrobnosti, navigacije in 390 px | `src/App.tsx`; `src/navigation.ts`; `src/TaskDetails.tsx` | Ni še izveden. |

## Odprta vprašanja in omejitve

Ni znanih nejasnosti. Specifikacija zajema izvorne zahteve R01–R12 in domeno podatkov, vključno s praznimi projekti, enoličnimi ID-ji, Unicode besedilom in poljubnim številom opravil. Izvajanje testov in pregled videza pripadata implementerju. V tej fazi testi niso izvedeni, zato zgornji `Izid` izrecno ostaja nezapolnjen. Ne širimo sočasnih sprememb podatkov, nalaganja med prekopi ali novih pisnih API-jev.
