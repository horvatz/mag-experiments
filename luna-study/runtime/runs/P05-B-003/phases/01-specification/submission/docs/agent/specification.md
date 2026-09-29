# Specifikacija: straničenje in filter stanja

## Problem in kontekst

Folio za izbrani projekt bere opravila prek `/api/projects/{id}/tasks` in jih trenutno prikazuje v preglednici ali tabli. Dodati je treba lokalni filter stanja in straničenje, brez spreminjanja API-ja, podatkov opravila ali potrjenega videza Folio. Izhodiščni prikaz je v `src/App.tsx`; tablo po statusu razvrsti `src/TaskBoard.tsx`.

## Vhodi, dejanja in izidi

V `shared/types.ts` je `Project` določen z `id` in `name`; `Task` vsebuje `id`, `projectId`, `title`, `description`, `status`, `assignee` in `dueDate`. `TaskStatus` je `todo | in_progress | done`. Aplikacija projekt in opravila pridobi z javnim GET prek `useResource`/`request` (`src/App.tsx`, `src/useResource.ts`, `src/api.ts`). Filter in stran posegata samo v prikazano polje; ne smeta pošiljati zapisov ali biti shranjena v URL/trajni shrambi. Obstoječe nalaganje, napaka in ponovni poskus ostanejo uporabni.

Kontrole: select **Velikost strani** z vrednostmi `all/2/5/10`, select **Filter strani** z `all/todo/in_progress/done` ter gumbi **Prva stran**, **Prejšnja stran**, **Naslednja stran**, **Zadnja stran**. Povzetek mora biti element `role="status"`, `aria-label="Stanje straničenja"`. Oznaki pogleda **Preglednica** in **Tabla**, poimenovanja stolpcev, projektna navigacija in povezave do podrobnosti ohranijo obstoječe dostopno ime ter pomen.

Velja za nič, eno ali poljubno več kot deset opravil, poljubne enkratne ID-je, enake naslove, poljubno izvorno zaporedje in veljavne datume. Projekti so lahko prazni. Besedilo naslovov, opisov in imen je lahko Unicode z ločili; ne sklepaj po naslovu namesto po ID-ju. Naloga pripada svojemu projektu. Imena oseb so neprazna in niso `all`.

## Zahteve in pravila

Naj bo `T` urejeno polje vseh opravil izbranega projekta, `f` filter, `S = T`, če je `f=all`, sicer `S = [t ∈ T | t.status=f]`, `N=|S|`, `s` velikost strani, `p` pa 1-indeksirana stran. Število strani `Y` je `0`, ko `N=0`; `1`, ko `N>0` in `s=all`; sicer `ceil(N/s)`. Pri nepraznem izidu je `p ∈ [1,Y]`; pri praznem izidu je notranja stran `1`. Vidno polje `V` je prazno, če je `N=0`, celoten `S`, če je `s=all`, sicer `S[(p-1)*s : min(p*s,N)]`. Filtriranje ohrani vrstni red `T`; enakost/razdelitev presojaj po ID-jih, ne po naslovih.

| Zahteva | Pravilo oziroma sprejemni pogoj | Način preverjanja |
| --- | --- | --- |
| R01 | Začetno stanje `(s,f,p)=(all,all,1)`; `V=T`, z vsemi ID-ji v izvornem vrstnem redu. | Začetno stanje; primerjava zaporedja ID-jev z API odgovorom. |
| R02 | Pri `s∈{2,5,10}` zaporedni odseki `V` razdelijo `S`: brez izgube ali podvojitve ID-ja, zadnji odsek je lahko krajši. | Prelistati vse strani pri vsaki velikosti ter primerjati združene ID-je s `S`. |
| R03 | Prva/zadnja nastavita `p=1/Y`, prejšnja/naslednja `p-1/p+1`. Na robu ustrezni gumb je onemogočen in `p` se ne spremeni; ob `N=0` so onemogočeni vsi štirje. | Preveriti robove in vmesno stran; poskus dejanja na robu. |
| R04 | Sprememba `s` vedno nastavi `p=1`, čeprav bi bila prejšnja številka še veljavna. `all` je ena stran samo pri `N>0`. | Spremeniti velikost z druge veljavne strani; preveriti `all` in prazen rezultat. |
| R05 | Filter `all/todo/in_progress/done` se uporabi pred straničenjem; ob spremembi `f` je `p=1`; ujemanja ostanejo v vrstnem redu `T`. | Primerjati ID-je filtrov in njihovih strani z API vrstnim redom. |
| R06 | Preglednica in tabla kažeta enake ID-je `V`. Tabla šele po straničenju razvrsti `V` med statuse; ne straniči stolpcev posebej. | Z enakim `(s,f,p)` primerjati ID-je vrstic in kartic/stolpcev. |
| R07 | Menjava pogleda in odprtje/zaprtje podrobnosti ohranijo `(p,s,f)`. | Na strani za `p>1` nastaviti filter, zamenjati pogled in odpreti/zapreti opravilo. |
| R08 | Menjava projekta in osvežitev ponastavita `(p,s,f)` na `(1,all,all)`. Filter, velikost in stran niso v URL-ju ali trajni shrambi. | Preklop projekta/osvežitev; pregled URL-ja in `localStorage`/`sessionStorage`. |
| R09 | Za `N>0` statusno besedilo je `Stran {p} od {Y}. Prikazano {A}–{B} od {N}.`. Pri omejeni velikosti `A=(p-1)*s+1`, `B=min(p*s,N)`; pri `all` sta `A=1`, `B=N`. | Preveriti točno besedilo na prvi, vmesni, zadnji in `all` strani. |
| R10 | Za `N=0` (prazen projekt ali filter) statusno besedilo je `Stran 0 od 0. Prikazano 0–0 od 0.`; vsi gumbi so onemogočeni. Sprememba/odstranitev filtra začne pri `p=1`. | Preveriti prazen projekt, prazen filter in vrnitev na `all`. |
| R11 | Pregled `aria-label="Pregled stanj opravil"` šteje celoten `T`; obstoječe skupno število opravil je `|T|`; števci stolpcev table so števila opravil trenutnega `V` v vsakem statusu. | Primerjati povzetek pred/po straničenju in vsoto števcev stolpcev z `|V|`. |
| R12 | Straničenje/filter ne spreminjata opravila in ne pošiljata zapisov API-ju. Ohraniti `data-task-id` na vrsticah/karticah, obstoječa dostopna imena pogledov/stolpcev, ID-je, povezave, podrobnosti, nalaganje/napake in uporabnost pri širini 390 px. Nova kontrola ne sme biti znotraj povezave opravila; drsenje tabele/table je lahko notranje. | Pregled zahtevkov/klikov; preveriti ID-je in dostopna imena; regresijski scenariji in pogled pri 390 px. |

Kontrolne spremembe stanja: `change(s') → (s',f,1)` in `change(f') → (s,f',1)`. Gumbi na robu ne spreminjajo stanja; preostali gumbi nastavijo zgornje ciljne strani. Menjava projekta pomeni novo stanje projekta. Pogled je obstoječe stanje v hash URL-ju (`src/navigation.ts`); to ne dovoljuje shranjevanja filtra ali strani v URL.

## Izvedba in sledljivost

Spodnje datoteke so izhodiščne točke za implementacijo in regresijo; v tej vlogi nisem spreminjal izvorne kode ali zagnal aplikacije/testov. Vrstice in ID-ji scenarijev so merila za predajo, ne trditev o že izvedenem testu.

| Zahteva | Pogoj | Test ali scenarij za implementerja | Datoteka in del kode | Izid ter dokaz |
| --- | --- | --- | --- | --- |
| R01 | začetni `(all,all,1)` in `V=T` | prazen filter/velikost ob vstopu, vrstni red ID-jev | `src/App.tsx` `ProjectView`, query/render vrstic | Ni izvedeno v specifikacijski fazi. |
| R02 | odseki `S` brez vrzeli/prekrivanja | prelistati 2/5/10 z zadnjo kratko stranjo | `src/App.tsx` tabela; `src/TaskBoard.tsx` `tasks` | Ni izvedeno v specifikacijski fazi. |
| R03 | ciljne strani in onemogočeni robovi | prvi, vmesni, zadnji, prazen izid | `src/App.tsx` nova navigacijska kontrola | Ni izvedeno v specifikacijski fazi. |
| R04 | velikost vedno ponastavi stran | sprememba velikosti s `p>1`, nato `all` | `src/App.tsx` stanje strani/velikosti | Ni izvedeno v specifikacijski fazi. |
| R05 | filter pred slice, reset strani | vsi trije statusi in `all` | `src/App.tsx`; polje `Task.status` v `shared/types.ts` | Ni izvedeno v specifikacijski fazi. |
| R06 | ista stran v obeh pogledih | primerjava `data-task-id` | `src/App.tsx` `tbody`; `src/TaskBoard.tsx` statusni `entries` | Ni izvedeno v specifikacijski fazi. |
| R07 | ohranjen `(p,s,f)` | preklop table/board in details route | `src/navigation.ts`; `src/App.tsx` `ProjectView`; `src/TaskDetails.tsx` | Ni izvedeno v specifikacijski fazi. |
| R08 | projekt/osvežitev → privzeto stanje | menjava projekta, reload, preverba URL/shrambe | `src/App.tsx` `key={project.id}`; `src/navigation.ts` | Ni izvedeno v specifikacijski fazi. |
| R09 | točen status in obseg | točna besedila za first/middle/last/all | nova statusna kontrola v `src/App.tsx` | Ni izvedeno v specifikacijski fazi. |
| R10 | prazen status/gumbi/reset | projekt brez nalog; statusni filter brez zadetkov | `src/App.tsx` nova statusna kontrola | Ni izvedeno v specifikacijski fazi. |
| R11 | polni povzetek, števec table iz `V` | primerjati `counts`, skupno število in stolpce | `src/App.tsx` vrstice s `counts`/`summary-grid`; `src/TaskBoard.tsx` `column-count` | Ni izvedeno v specifikacijski fazi. |
| R12 | samo prikazno stanje; regresije ostanejo | brez write zahtevkov; task povezave, prazno/nalaganje/napaka, 390 px | `src/api.ts` (GET `request`, write helper); `src/TaskDetails.tsx`; `src/styles.css` `.table-scroll`/`.board-scroll` | Ni izvedeno v specifikacijski fazi. |

Za podatke uporabljaj samo javni `/api/`; kontrol `/__test/` pripada testnemu programu in jih UI ne uvaža ali kliče. `src/api.ts` ima pripravljeno funkcijo za zapis, toda ta naloga ne dodaja zapisovalnih dejanj. Ne spreminjaj `shared/`, strežnika, odvisnosti ali skupnih testov. Skupni in namenski testi ostanejo obveznost implementerja; končni testi tukaj niso dostopni in niso prikazani kot opravljeni.

## Odprta vprašanja in omejitve

Ni znanih nejasnosti v obsegu. Predpostavke iz navodil: API vrne veljavna polja tipa `Task[]`; imena statusov in polj so enaka tipu `Task`; paginacija ni strežniška. Navigacija med nezaključenim nalaganjem in sočasne spremembe podatkov brez osvežitve so izrecno zunaj dodatnega obsega. Ohraniti je treba obstoječe potrjene Folio sloge iz `docs/dizajn.md`.
