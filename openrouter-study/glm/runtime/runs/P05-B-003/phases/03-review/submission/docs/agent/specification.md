# Specifikacija P05: Straničenje in filter stanja

## Problem in kontekst

Folio prikazuje opravila izbranega projekta v preglednici ali tabeli. Uporabnik mora lahko velika polja brskati po straneh in po stanju, ne da bi se spremenili vrstni red, podatki ali obstoječi pogledi. Nova funkcionalnost je izključno odjemalec: stanje straničenja in filtra je trenutno, se ne shranjuje trajno in se ne prenaša v URL.

## Vhodi, dejanja in izidi

API vrne obstoječi `Project[]` in `Task[]`; `Project` ima `id` in `name`, `Task` pa `id`, `projectId`, `title`, `description`, `status`, `assignee` in `dueDate`. Veljavne vrednosti velikosti strani so `all`, `2`, `5` in `10`; veljavni filtri stanja so `all` ter vsa obstoječa `TaskStatus` (`todo`, `in_progress`, `done`). Projekta sta lahko prazna ali poljubno velika, opravila pa imajo lahko enake naslove, Unicode besedilo in poljubne veljavne koledarske datume.

HTML `select` sta dostopni kot `Velikost strani` in `Filter strani`. Gumbi imena so `Prva stran`, `Prejšnja stran`, `Naslednja stran` in `Zadnja stran`; nova dejanja so zunaj obstoječih povezav opravil.

Naj bosta `tasks` polje v izvornem vrstnem redu in `filteredTasks` rezultat:

- `filter = all`: `tasks`;
- `filter = s`: `tasks.filter(task => task.status === s)`.

Za `N = filteredTasks.length` je število strani `Y = 0`, če je `N = 0`; sicer je `Y = 1` za `size = all` ali `Y = ceil(N / size)` za velikosti 2, 5 in 10. Pri nepraznem rezultatu je stran `X` število med `1` in `Y`. Za številsko velikost sta `A = (X - 1) * size + 1` in `B = min(A + size - 1, N)`, vidni odsek pa je `filteredTasks.slice(A - 1, B)`; za `all` sta `A = 1`, `B = N` in odsek celoten. Za prazen rezultat sta `X = 0` in vidni odsek prazen.

Uspeh pomeni, da sta preglednica in tabla izriščena iz istega vidnega odseka, vsi števci in statusi ustrezajo zgoraj, podrobnosti, povezave, nalaganje, dostopna imena in prilagodljiv videz pa ostanejo delujoči. Napake API-ja ostanejo obravnavane po obstoječem dizajnu; straničenje ne sme ustvariti dodatnih omrežnih zahtev ali zapisov.

## Zahteve in pravila

| Zahteva | Pravilo oziroma sprejemni pogoj | Način preverjanja |
| --- | --- | --- |
| R01 | Privzeto sta `size = all` in `filter = all`; preglednica vsebuje vse ID-je v izvornem vrstnem redu, status pa `Stran 1 od 1. Prikazano 1–N od N.` pri nepraznem projektu. | UI test brez dejanj preveri vrstni red `data-task-id` in privzeti status. |
| R02 | Za `size ∈ {2, 5, 10}` strani predstavljajo zaporedne, neprekrivajoče odseke `filteredTasks`; zadnja stran je lahko krajša, skupna preslikava pa je popolna in brez podvojenih ID-jev. | Preveri vse strani vsake velikosti ter združitev in razliko ID-jev. |
| R03 | Gumba `Prva stran` in `Prejšnja stran` sta onemogočena, če je `N = 0` ali `X ≤ 1`; gumba `Naslednja stran` in `Zadnja stran`, če je `N = 0` ali `X ≥ Y`. Veljavni kliki nastavijo `X` na 1, `X - 1`, `X + 1` ali `Y`; onemogočeni kliki ne spremenijo stanja. | Preveri vsak veljavni premik ter vse robne in prazne primere. |
| R04 | Vsaka sprememba velikosti nastavi `X = 1`, tudi če bi prejšnji `X` ostal veljaven; `all` ima eno stran, kadar je `N > 0`. | Po zadnji strani izberi vsako velikost in preveri odsek ter status. |
| R05 | Filter se uporabi pred rezanjem na stran; njegova sprememba nastavi `X = 1` in ne spremeni izvornega vrstnega reda ujemajočih se opravil. | Za vsak filter primerjaj `data-task-id` z neodvisno preslikavo po vrstnem redu. |
| R06 | Preglednica izriše vidni odsek kot vrstice; tabla dobi isti odsek in ga šele nato razdeli v obstoječe stolpce po stanju. | Preveri enake ID-je obeh pogledov in števce stolpcev na več stranih. |
| R07 | Preklop med preglednico in tabelo ter odpiranje in zapiranje podrobnosti ohranita `size`, `filter` in `X`. | Spremeni pogled in podrobnosti na srednji strani ter preveri isti odsek in status. |
| R08 | Menjava projekta in osvežitev ponastavita `size = all`, `filter = all` in `X = 1`; stanje se ne zapisuje v `localStorage`, drugo trajno shrambo ali URL. | Preveri oba projekta, osvežitev, URL ter odsotnost shrambe po meri. |
| R09 | Za `N > 0` ima element z `role="status"` in `aria-label="Stanje straničenja"` natanko besedilo `Stran X od Y. Prikazano A–B od N.` | Preberi status na začetku, sredini in zadnji strani ter za `size = all`. |
| R10 | Za prazen projekt ali prazen rezultat filtra je status natanko `Stran 0 od 0. Prikazano 0–0 od 0.` in vsi štirje gumbi so onemogočeni; vrnitev na `all` pokaže prvo veljavno stran. | Uporabi prazen projekt, prazen filter vsakega stanja in odstranitev filtra. |
| R11 | `Pregled stanj opravil`, `count-badge` in števci v nogi preglednice štejejo celoten nefiltriran `tasks`; števci stolpcev table štejejo vidni odsek; skupno število opravil in ID-ji se zaradi straničenja ne spremenijo. | Primerjaj števce ter ID-je pred premikom, na srednji strani in po zadnji strani. |
| R12 | Funkcionalnost uporablja samo obstoječe GET branje iz `/api/`, ne uporablja `/__test/` in ne sproži zapisovalnih metod; ohrani `data-task-id`, dostopna imena, podrobnosti, nalaganje in videz Folio. | Z nadzorovanimi odgovori preveri omrežne zahteve, povezave, podrobnosti in širino 390 px. |

## Izvedba in sledljivost

| Zahteva | Pogoj | Test ali scenarij | Datoteka in del kode | Izid ter dokaz |
| --- | --- | --- | --- | --- |
| R01–R05, R07–R10 | Stanje velikosti, filtra in strani ter nove kontrole. | Lastni Playwright UI testi za privzete vrednosti, vse velikosti, vse filtre, premike, reset, status, podrobnosti, projekta in omrežne zahteve. | `src/App.tsx` v `ProjectView`; nove kontrole lahko dobijo lastno komponento v `src/`. | Za izvesti; rezultata še ni. |
| R06, R11 | Skupni vidni odsek in pravilni števci. | Testi primerjajo vrstice preglednice, stolpce table in števce na več straneh. | `src/App.tsx` in `src/TaskBoard.tsx`. | Za izvesti; rezultata še ni. |
| R12 | Ohranitev obstoječih poti, API-ja in dostopnosti. | Skupni regresijski testi skupaj z lastnim testom, ki zavrača zapisovalne zahteve in `/__test/`. | `src/navigation.ts`, `src/useResource.ts`, `src/api.ts` in novi UI. | Za izvesti; rezultata še ni. |

## Odprta vprašanja in omejitve

Ni odprtih vprašanj. Dejanske teste, izvajanje aplikacije in pregled videza izvede implementer. Strežnik, skupni tipi, infrastruktura, odvisnosti in skupni razvojni testi ostanejo nespremenjeni.
