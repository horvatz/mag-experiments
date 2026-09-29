# Razvojna specifikacija: straničenje in filter stanja

## Problem in kontekst

Folio prikazuje opravila izbranega projekta v preglednici ali tabli. Dodati je treba lokalno straničenje po velikostih 2, 5 ali 10 in filter stanja, ob ohranitvi obstoječega izbora projekta, podrobnosti, javnega API-ja in potrjenega videza. Filtriranje ohrani vrstni red opravljenih opravil; šele nato se izračuna odsek za oba pogleda.

## Vhodi, dejanja in izidi

`shared/types.ts` določa `Project {id, name}`, `Task {id, projectId, title, description, status, assignee, dueDate}` in `TaskStatus = todo | in_progress | done`. `ProjectView` v `src/App.tsx` prek `useResource<Task[]>` bere `/api/projects/{id}/tasks`. Seznam `T` je v API-vrstnem redu; ID-ji so enkratni in vsako opravilo pripada svojemu projektu.

Kontrole nastavijo velikost `s ∈ {all,2,5,10}`, filter `f ∈ {all,todo,in_progress,done}` ali stran `p`. Filter je stabilen: `F = T`, če `f=all`, sicer `F=[t∈T | t.status=f]`. Naj bo `n=|F|`. Število strani `Y=0` pri `n=0`, `Y=1` pri `n>0,s=all`, sicer `Y=ceil(n/s)`. Trenutni izsek `I=F`, če je `s=all`, sicer `I=F[(p−1)s : min(ps,n)]`. Pri praznem `F` je `p=0`; sicer je `1≤p≤Y`. Sprememba velikosti ali filtra nastavi `p=1`, če `n>0`, sicer `p=0`. Stran prikazuje indekse od 1: `A=(p−1)s+1`, `B=min(ps,n)`; pri `all` sta `A=1`, `B=n`.

Prva/zadnja stran nastavi `p=1/Y`, prejšnja/naslednja pa `p−1/p+1` le, če je ta stran znotraj `1..Y`; neveljaven robni premik je onemogočen in ne spremeni stanja. Pri `all` je edina stran prva in zadnja. Menjava projekta ter osvežitev začneta z `s=all`, `f=all`; prazen rezultat je prikazan kot `p=0,Y=0`. Te izbire ostanejo v pomnilniku pogleda, niso v URL-ju ali trajni shrambi. Menjava pogleda in odpiranje/zapiranje podrobnosti ohranijo `p,s,f`.

Podatki ostanejo samo brani za to funkcionalnost. UI uporablja obstoječi `/api/`; ne bere ali spreminja `/__test/`, ne shranjuje kopije v `localStorage` in ne pošilja zapisov. Nalaganje, napake, povezave v podrobnosti in obstoječe ravnanje z ID-ji ostanejo uporabni.

## Zahteve in pravila

| Zahteva | Pravilo oziroma sprejemni pogoj | Način preverjanja |
| --- | --- | --- |
| R01 | Začetno `s=all,f=all`; tabela vsebuje vse ID-je iz `T` v izvornem vrstnem redu. | Začetni projekt s poljubno dolžino preveri po `data-task-id`. |
| R02 | Pri `s=2,5,10` so zaporedni odseki `F`; njihova združitev vsebuje vsak ID iz `F` natanko enkrat. Zadnji odsek je lahko krajši. | Preglej strani in robove pri n < s, n = s, n > s ter nepolnem zadnjem odseku. |
| R03 | Gumbi **Prva stran**, **Prejšnja stran**, **Naslednja stran**, **Zadnja stran** izberejo ustrezno stran. Prva/prejšnja sta onemogočena na prvi, naslednja/zadnja na zadnji strani; prazen izid onemogoči vse. Onemogočena dejanja ne spremenijo `p`. | Preveri začetno, vmesno in zadnjo stran, tudi enostranski rezultat. |
| R04 | Vsaka sprememba velikosti ponastavi `p` na prvo stran, tudi če bi bilo staro `p` še veljavno. `all` pomeni eno stran za `n>0`. | Iz zadnje strani preklopi na drugo velikost, nato na `all`. |
| R05 | Filter `all/todo/in_progress/done` deluje pred straničenjem, ohrani vrstni red ujemajočih se ID-jev in ponastavi `p`. | Uporabi mešane statuse in spremeni filter z zadnje strani. |
| R06 | Tabela in tabla prikažeta isti `I`. Tabla združi šele ta izsek po stanjih; ID se ne izgubi, podvoji ali prerazvrsti znotraj stolpca. | Primerjaj `data-task-id` v obeh pogledih in zaporedje kartic v stolpcu. |
| R07 | Preklop pogleda ter odpiranje in zapiranje podrobnosti ohranijo `p,s,f`. | Pred/po spremembi hash poti primerjaj kontrolne vrednosti in ID-je. |
| R08 | Menjava projekta in osvežitev ponastavita `s=all,f=all` ter prvo stran (prazno stanje ima `p=0`); stanje ni zapisano v URL ali trajno shrambo. | Preveri po izbiri projekta in ponovnem nalaganju strani. |
| R09 | Neprazen rezultat ima `role=status`, `aria-label="Stanje straničenja"` ter besedilo `Stran X od Y. Prikazano A–B od N.`; A/B sta 1-indeksirana indeksa izseka, N=`n`. | Preveri točno besedilo za prvo, vmesno/zadnjo in `all` stran. |
| R10 | Prazen projekt ali prazen filter ima besedilo `Stran 0 od 0. Prikazano 0–0 od 0.`; vsi štirje premiki so onemogočeni. Odstranitev filtra pokaže prvo stran nepraznega `T`. | Preveri API z nič opravili, neujemajoč filter in vrnitev filtra na `all`. |
| R11 | Pregled stanj `aria-label="Pregled stanj opravil"` šteje ves nefiltrirani `T`. Števci stolpcev table štejejo le opravila `I`; skupno število projekta ostane `|T|`. | Primerjaj agregate celotnega projekta s filtrirano stranjo table. |
| R12 | Straničenje ne mutira opravil in ne pošilja zapisov API-ju. Ostanejo uporabni obstoječi URL-ji, `data-task-id`, pravilni ID-ji, podrobnosti, nalaganje in odzivni videz Folio. | Preveri zahteve API, klike/URL-je, nalaganje in širino 390 px; stran nima vodoravnega preliva, tabela/tabla se smeta drseti znotraj. |

Dogovor vmesnika: `select` **Velikost strani** z vrednostmi `all/2/5/10`; `select` **Filter strani** z `all/todo/in_progress/done`; štirje zgoraj navedeni gumbi; statusni element z navedeno vlogo in oznako. Ohraniti je treba dostopna imena obstoječih pogledov in stolpcev ter `aria-label="Pregled stanj opravil"`. Nova dejanja opravila morajo biti zunaj njegove povezave.

Predpostavke iz naloge: API lahko vrne nič, eno ali več kot deset opravil, poljubne enkratne ID-je, enake naslove in poljuben vrstni red; statusi in datumi so veljavni, besedilna polja lahko vsebujejo Unicode in ločila. Projekti so lahko prazni. Preizkusni GET-pripomoček je izključno mehanizem testov in ni vir podatkov aplikacije.

## Izvedba in sledljivost

Začetna sledljivost iz pregledanega izhodišča (ne ciljna implementacija): `src/App.tsx::ProjectView` pridobi projektni seznam, računa celotne `counts`, izriše preglednico s `data-task-id` in preda opravila `TaskBoard`; `src/TaskBoard.tsx::TaskBoard` jih razvršča v stolpce in šteje kartice; `src/navigation.ts::useRoute` hrani pogled/podrobnost v hash URL-ju, `TaskDetails` zapira podrobnost prek projekta in pogleda; `src/useResource.ts` uporablja obstoječi API odjemalec; tipi so v `shared/types.ts`. Sprememb kode/testov v tej vlogi ni bilo.

| Zahteva | Pogoj | Test ali scenarij | Datoteka in del kode | Izid ter dokaz |
| --- | --- | --- | --- | --- |
| R01 | Začetni `all/all`, izvornovrstni seznam. | Začetni prikaz z vsemi ID-ji. | Cilj: `src/App.tsx::ProjectView`. | Ni izvedeno; preveriti ob implementaciji. |
| R02–R03 | Razrez brez izgub; veljavna navigacija in onemogočeni robovi. | D01: velikost 2/naslednja; D02: zadnja stran. Dodatno vmesna/prva. | Cilj: izračun izseka in gumbi v `ProjectView`. | `tests/development/P05.spec.ts` prebran, D01/D02 nista zagnana. |
| R04, R12 | Ponastavitev velikosti, brez zapisov. | D04: zadnja stran → velikost 5; `readonly` preverba. | Cilj: izbor velikosti in zgolj bralni `/api/`. | D04 ni zagnan; brez izida. |
| R05–R06 | Filter pred globalnim odsekom, isti ID-ji v tabli. | D03: filter todo in tabla. | Cilj: filter/izsek v `ProjectView`, izsek v `TaskBoard`. | D03 ni zagnan; brez izida. |
| R07–R08 | Pogled/podrobnost ohranita stanje; projekt/osvežitev ga ponastavita. | Spremeni hash, odpri/zapri podrobnosti, izberi drug projekt, osveži. | `src/navigation.ts`, `src/TaskDetails.tsx`, lokalno stanje v `ProjectView`. | Ni izvedeno. |
| R09–R10 | Natančen statusni obseg; prazen rezultat 0/0 in onemogočena navigacija. | Status na zadnji strani (D02); prazen projekt/filter. | Cilj: status in pogoji gumbov v `ProjectView`. | D02 ni zagnan; prazni primer ni preverjen. |
| R11 | Povzetek celotnega projekta; števci table trenutnega izseka; skupni števec nespremenjen. | Filtrirana stran z mešanimi statusi. | `src/App.tsx::counts`/`summary-grid`; `src/TaskBoard.tsx::column-count`. | Ni izvedeno. |
| Vmesnik/R12 | Dogovorjena dostopnost, ID-ji, povezave, odzivnost 390 px. | Dostopnost in mobilni pregled z daljšimi seznami. | `src/App.tsx`, `src/TaskBoard.tsx`, `src/styles.css`. | Ni izvedeno; videz preveri implementer. |

## Odprta vprašanja in omejitve

Naloga ne predpisuje besedila kontrol razen navedenih dostopnih imen/statusa, njihove razporeditve ali prikaza filtra, ki ne vrne rezultatov; sprejemni pogoj za prazno stanje je naveden v R10. `tests/development/P05.spec.ts` ima štiri scenarije, ki ne pokrijejo vseh zahtev ali robnih vhodov. Vloga specifikacije ni zagnala aplikacije, testov ali vizualnega pregleda; končni pogoji potrebujejo dejanske izide implementerja/reviewerja, ne domnevnih uspehov.
