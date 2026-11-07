# Razvojna specifikacija: Straničenje in filter stanja

## Problem in kontekst

Folio trenutno prikaže vsa opravila izbranega projekta brez straničenja in filtra stanja. Uporabnik mora lahko omeji prikaz po statusu, nato gleda zaporedne odseke filtriranih opravil v preglednici in tabli, ne da bi podvajal ali izgubil zapise. Obstoječa navigacija, povezave, podrobnosti, nalaganje in prilagodljiv Folio dizajn ostanejo nespremenjeni.

## Vhodi, dejanja in izidi

- Podatkovni vir ostane javni API `/api/`; izbiranje je vedno po `id`. Nova funkcionalnost ne dodaja zapisovalnih klicev in ne uporablja testnih kontrol `/__test/`, trajne shrambe ali URL-ja.
- Vhodna polja so obstoječa opravila izbranega projekta. Vsako opravilo ima veljavna polja iz skupnega tipa, enkraten `id`, veljaven status in pripada izključno izbranemu projektu. Za vrstni red je merilo zaporedje, ki ga vrne API.
- Lokalni vmesniki so velikost strani `all | 2 | 5 | 10`, filter `all | todo | in_progress | done` ter gumbi `Prva stran`, `Prejšnja stran`, `Naslednja stran` in `Zadnja stran`.
- Vsi štirje gumbi so `type="button"`. Selektorja imata dostopni imeni `Velikost strani` in `Filter strani`; statusni element ima `role="status"`, `aria-label="Stanje straničenja"` in natančno besedilo iz zahteve.
- Uspeh pomeni, da sta preglednica in tabla usklajeno na istem trenutnem odseku in da status točenje opisuje trenutni strani. Napaka nalaganja ali shranjevanja ostane pod nadzorom obstoječih API in vmesnikov; straničenje samo ne povzroča novih napak.

### Oznake in predikati

- `T` je nefiltrirano polje opravil izbranega projekta v izvornem vrstnem redu.
- `filter` je izbrani filter. `F = T` za `all`, sicer `F = [t ∈ T | t.status === filter]` v nespremenjenem vrstnem redu.
- `size` je izbrana velikost strani. `n = |F|` za `all`, sicer številčna vrednost izbire.
- `N = |F|`. Če je `N = 0`, je `page = 0` in `totalPages = 0`; sicer je `page ∈ [1, totalPages]`, `totalPages = 1` za `all`, in `totalPages = ceil(N / n)` za številske velikosti.
- Trenutni odsek je `S = []`, če je `N = 0`; za `all` je `S = F`; sicer je `S = F[(page - 1)n ... min(pagen, N) - 1]` z upoštevanjem ničelnega indeksiranja. Prihodnji odseki morajo biti zaporedni, neprekrivajoči in pokrivati celoten `F`.
- Statusni indeksi sta `A = 0` in `B = 0` pri praznem rezultatu, sicer `A = (page - 1)n + 1` in `B = min(pagen, N)`; za `all` je torej `A = 1` in `B = N`.

## Zahteve in sprejemni pogoji

| Zahteva | Sprejemni pogoj | Način preverjanja |
| --- | --- | --- |
| R01 | Privzeto velja `size = all`, `filter = all`, `page = 1` za neprazen projekt in `S = T` v izvornem vrstnem redu; za prazen projekt je `page = 0`. | Preveri začetni prikaz projekta z različnimi števili opravil in zaporedjem ID-jev. |
| R02 | Za velikosti 2, 5 in 10 velja `totalPages = ceil(|F|/n)`, kjer je `n` izbrana številska velikost; strani `1..totalPages` zaporedno pokrijejo celoten `F` brez ponovitev ali izgube `id`, zadnja stran pa je lahko krajša. | Primerjaj ID-je po straneh s pričakovanim izvornim seznamom za 0, 1, 2, več kot 10 in nepolne strani. |
| R03 | `Prva stran`, `Prejšnja stran`, `Naslednja stran` in `Zadnja stran` ustrezno nastavijo `page`; gumb je onemogočen na robu ali pri praznem rezultatu in klik ne spremeni `size`, `filter`, `page` ali prikaza. | Preveri vse gume na prvi, srednji, zadnji in edini strani ter praznem rezultatu, tudi s ponovljenim klikom onemogočenega gumba. |
| R04 | Sprememba `size` nastavi `page = 1`, če rezultat ni prazen, sicer `page = 0`; `all` pomeni eno stran za `N > 0`, tudi kadar bi prejšnja številka ostala veljavna. | Spremeni velikost z več strani in preveri ponastavitev strani, vključno z `all` po višji številki strani. |
| R05 | `filter` se uporabi pred straničenjem in ohrani vrstni red ujemajočih se opravil; sprememba filtra nastavi prvo stran, prazen rezultat pa stran 0. | Preveri vsak filter nad istim podatkom in ohranjanje vrstnega reda ID-jev. |
| R06 | Preglednica in tabela prikažeta natanko `S`; tabela združuje samo `S` po stolpcih in ne straniči stolpcev ločeno. | Primerjaj vidne `data-task-id` v obeh pogledih ter število in ID-je v tabeli za vsak pogled. |
| R07 | Preklop pogleda ter odpiranje in zapiranje podrobnosti ohranijo `size`, `filter` in `page`; po zaprtju je prikazan isti `S`. | Izvedi vsako dejanje s prilagojenim filtrom, velikostjo in stranjo in preveri enak odsek. |
| R08 | Menjava projekta ali osvežitev ponastavita `size = all`, `filter = all` in `page` na privzeto vrednost; stanje ni shranjeno v trajni shrambi ali URL-ju. | Nastavi stanje, zamenjaj projekt ali osveži in preveri privzeti prikaz ter odsotnost shrambe/URL parametra. |
| R09 | Za `N > 0` status vsebuje natančno `Stran X od Y`, kjer je `X = page` in `Y = totalPages`, ter `Prikazano A–B od N.`; priporočena celotna oblika je `Stran X od Y. Prikazano A–B od N.` | Preveri besedilo statusa na prvi, srednji, zadnji, edini strani in vseh velikosti. |
| R10 | Za prazen projekt ali prazen filter je status enak `Stran 0 od 0. Prikazano 0–0 od 0.`; vsi štirje gumbi so onemogočeni. Po odstranitvi filtra je spet prva stran. | Preveri oba prazna primera in prehod nazaj na `all`. |
| R11 | Pregled stanj in obstoječe projektne števce vseh opravil temeljijo na `T`; števci stolpcev table štejejo samo `S` glede na `task.status`. Število vseh opravil se zaradi filtra ali straničenja ne spremeni. | Primerjaj števce z ločenimi izračuni nad `T` in `S`, tudi pri filtrovanih in skrajšanih straneh. |
| R12 | Straničenje in filter ne spremenita podatkov, ne pošljeta zapisov na API in ne pokvarita obstoječih povezav, pravilnih `id`, podrobnosti ali nalaganja. `data-task-id`, dostopna imena pogledov, stolpcev in `Pregled stanj opravil` ostanejo; nova dejanja niso znotraj povezave opravila. Pri širini 390 px celotna stran ne širí čez okno, notranje drsenje preglednice in table pa je dovoljeno. | Izvedi obstoječe in razvojne preverjanje ter preveri omrežne zahteve, dostopnost obstoječih elementov in `document.documentElement.scrollWidth <= innerWidth` pri 390 px. |

## Izvedba in sledljivost

| Zahteva | Pogoj | Test ali scenarij | Datoteka in del kode | Izid ter dokaz |
| --- | --- | --- | --- | --- |
| R01–R05, R08–R11 | Stanje straničenja, izračun `F`, `S` in projektne ponastavitve | Razvojni testi `tests/development/P05.spec.ts`, morebitni implementerjevi testi v `tests/agent/` in ročni scenarij menjave projekta. | Glavna logika v `ProjectView` v `src/App.tsx`; projekt je že ločen s `key={project.id}`, kar lahko uporabi za ponastavitev. | Ni še izvedeno; implementer zapiše dejanske izide. |
| R06–R07, R12 | Enoten odsek v obstoječih pogledih, podrobnostih, povezavah in odzivnem videzu | Preveri ID-je preglednice in table ter obstoječe regresijske scenarije v `tests/baseline.spec.ts`. | `src/App.tsx` za preglednico in preklop pogleda; `src/TaskBoard.tsx` za tabelo in števce; `src/TaskDetails.tsx` za podrobnosti; `src/styles.css` za odzivno postavitev. | Ni še izvedeno; implementer zapiše dejanske izide. |
| R12 | Brez zapisov in testnih kontrol | Preveri omrežne zahteve; dovoljen je samo obstoječi javni bralni API in obstoječe dejanje posodobitve, ki ga straničenje ne sproži. | `src/api.ts` in `src/useResource.ts` za javni `/api/`; testni pripomoček `/__test/` je izključno v `tests/development/helpers.ts`. | Ni še izvedeno; implementer zapiše dejanske izide. |

## Odprta vprašanja in omejitve

- Navigacija med nezaključenim nalaganjem in sočasne spremembe podatkov brez osvežitve niso v obsegu naloge; obnašanje ostane pod nadzorom obstoječih regresijskih testov.
- Končni skriti testi niso dostopni, zato uspešnost zanje ne sme biti zapisana. Razvojni primeri morajo biti dopolnjeni z mejnimi primeri iz definicije.
- Specifikacija predpostavlja, da API vrne zaporedje, ki je izvorni vrstni red za to nalogo, in da so vsi statusi, ID-ji in projektni podatki veljavni.
