# Specifikacija P05: Straničenje in filter stanja

## Problem in kontekst

Folio trenutno naloži vsa opravila projekta ter jih brez straničenja pokaže v
preglednici ali na tabli. Uporabnik želi omejiti prikazan odsek in poiskati
opravila po stanju, pri čemer mora vsak pogled prikazovati isti odsek. Podatki
se še naprej berejo iz javnega API-ja; stanje kontrol velja samo za trenutno
prikazani projekt in se ob menjavi projekta ponastavi.

## Vhodi, dejanja in izidi

Vhod je urejeno polje `T` opravil trenutnega projekta, prebrano iz
`/api/projects/{id}/tasks`; status opravila je `todo`, `in_progress` ali
`done`. Kontrole nastavijo velikost `s ∈ {all, 2, 5, 10}` ter filter
`f ∈ {all, todo, in_progress, done}`. Štirje gumbi spreminjajo trenutno
stran `p`. Filtriranje ohrani izvorni vrstni red. Sprememba filtra ali
velikosti nastavi `p=1`; preklop pogleda ali odprtje/zaprtje podrobnosti ne
spremeni `s`, `f` ali `p`. Menjava projekta ustvari privzeto stanje.

## Zahteve in pravila

Naj bo `F = T`, če je `f=all`, sicer `F` vsebuje natanko opravila, katerih
status je `f`. Naj bo `k=|F|`, `q=∞`, če je `s=all`, sicer `q=s`, in
`pages=0`, če je `k=0`, sicer `ceil(k/q)` za končno `q` oziroma `1` za
`q=∞`. Za neprazen rezultat je `p ∈ [1,pages]`, `S=F`, če je `q=∞`, sicer
`S=F[(p-1)q : pq]`. Za prazen rezultat je `S=[]`, `p=0` za prikaz. Prazno
stanje onemogoči vso navigacijo. Za neprazen `S` je prikazani obseg
`A=(p-1)q+1`, `B=min(pq,k)` pri končnem `q`, oziroma `A=1, B=k` pri `all`.
Če `k=0`, sta `A=B=0`. Stanje se hrani samo v Reactu, ne v URL-ju ali shrambi.

| Zahteva | Pravilo oziroma sprejemni pogoj | Način preverjanja |
| --- | --- | --- |
| R01 | Začetna kontrola `s=f=all`, `p=1`; seznam je `T` v vrstnem redu API-ja. | D razvojni test in začetni primer agenta. |
| R02 | Pri `s∈{2,5,10}` so strani zaporedni odseki `F`; skupaj se ID-ji pojavijo natanko enkrat. | D testi in preskus zadnje krajše strani. |
| R03 | Navigacija nastavi `p` na ustrezno mejo ali soseda; na robu je gumb onemogočen. | D testi in preverjanje robnih gumbov. |
| R04 | Vsaka sprememba `s` nastavi `p=1`; `all` ima za `k>0` eno stran. | D04 in agentni preskus spremembe velikosti. |
| R05 | `f` filtrira po statusu pred straničenjem; sprememba nastavi `p=1`. | D03 in agentni preskus vseh statusov. |
| R06 | Preglednica in tabla upodobita isti `S`; tabla nato `S` razdeli po statusu. | D03 in agentni preskus preklopa. |
| R07 | Pogled in podrobnosti ne spreminjajo `(s,f,p)`. | Agentni preskusi odpiranja/zapiranja in preklopa. |
| R08 | Menjava projekta ponastavi `(s,f,p)`; URL ne nosi teh vrednosti. | Agentni preskus projekta in URL. |
| R09 | Za `k>0` status točno sledi predpisanemu `p/pages` in `A–B od k`. | D02 ter agentni preskus. |
| R10 | Za `k=0` status je `Stran 0 od 0. Prikazano 0–0 od 0.`; navigacija onemogočena. | Agentni preskus praznega projekta in filtra. |
| R11 | Povzetek in števec vseh opravil uporabljata `T`; stolpci table štejejo kartice iz `S`. | D03 in agentni preskus števcev. |
| R12 | Straničenje je samo prikazno: brez zapisov API-ju; obstoječi ID-ji, povezave, podrobnosti in odzivno drsenje ostanejo uporabni. | `readonly` razvojni preverjanja, izhodišče in agentni preskusi. |

## Izvedba in sledljivost

Pred izvedbo: pričetek 2026-09-28, zahteve zabeležene iz `task/instructions.md`
različica 1.0; sprejemni pogoji v zgornji tabeli še niso bili preverjeni.

| Zahteva | Pogoj | Test ali scenarij | Datoteka in del kode | Izid ter dokaz |
| --- | --- | --- | --- | --- |
| R01 | Začetni `s=f=all`, `p=1`; prikaz `T` v API vrstnem redu. | Agent: »R01–R04: default order…« | `src/App.tsx:16`, `src/App.tsx:19`, `src/App.tsx:25`, `src/App.tsx:29`. | Uspešno v končnem `npm run check`; 53/53. |
| R02 | Odseki 2/5/10 brez izgube ali podvojitve; zadnji odsek je lahko krajši. | D01; agent: »R01–R04…«, »R02 and R12…«, »R02 and R04…«. | `src/App.tsx:29`, `src/App.tsx:63`, `src/TaskBoard.tsx:16`. | Uspešno; preverjeni 2-, 5- in 10-elementni odseki, vključno z 11 opravili. |
| R03 | Prva/prejšnja/naslednja/zadnja nastavijo ciljno stran; robna dejanja so onemogočena. | Agent: »R01–R04…«. | `src/App.tsx:69`, `src/App.tsx:70`, `src/App.tsx:73`. | Uspešno; preizkušeni vsi štirje gumbi ter robova. |
| R04 | Sprememba velikosti nastavi `p=1`; sprememba z veljavne strani 2 na velikost 5 pokaže prvih pet ID-jev. | D04; agent: »R01–R04…«, »R02 and R04…«. | `src/App.tsx:35`, `src/App.tsx:63`. | Uspešno; stara stran 2 je bila pri novi velikosti še veljavna, vendar je prikaz začel pri ID 1. |
| R05 | Filter stanja pred razrezom, ohrani vrstni red in ob spremembi vrne na prvo stran. | D03; agent: »R05–R06 and R11…«, »R10: empty filter…«. | `src/App.tsx:25`, `src/App.tsx:36`, `src/App.tsx:66`. | Uspešno; preverjena stanja todo, in_progress, done brez zadetkov in odstranitev filtra. |
| R06 | Preglednica in tabla dobita isti odsek `S`; tabla nato razvrsti samo `S` po stanju. | D03; agent: »R05–R06 and R11…«. | `src/App.tsx:79`, `src/App.tsx:83`, `src/TaskBoard.tsx:13`, `src/TaskBoard.tsx:17`. | Uspešno; enaki ID-ji po preklopih tabela/tabla. |
| R07 | Pogled in podrobnosti ne spremenijo `(s,f,p)`. | Agent: »R07–R08: view and details preserve state…«. | `src/App.tsx:57`, `src/App.tsx:95`; projektna komponenta ostane ista ob spremembi pogleda. | Uspešno; stran 2, velikost 2 in filter todo so ostali po odprtju/zaprtju podrobnosti in menjavi pogleda. |
| R08 | Menjava projekta ponastavi `(s,f,p)`; stanje ni kodirano v URL. | Agent: »R07–R08…«. | `src/App.tsx:123`; `project.id` je ključ komponente. | Uspešno; po menjavi projekta sta kontroli `all`, prikazana prva stran in URL nima parametrov straničenja. |
| R09 | Status izpiše številko strani ter indeksni obseg `A–B od k`. | D02; agent: »R01–R04…«, »R02 and R04…«. | `src/App.tsx:27`, `src/App.tsx:32`, `src/App.tsx:75`. | Uspešno; potrjeni `Stran 2 od 2. Prikazano 6–8 od 8.` in obseg 11–11 od 11. |
| R10 | Pri `k=0` je status `Stran 0 od 0. Prikazano 0–0 od 0.` in navigacija onemogočena. | Agent: »R10: empty project…« in »R10: empty filter…«. | `src/App.tsx:27`, `src/App.tsx:28`, `src/App.tsx:69`, `src/App.tsx:75`. | Uspešno; prazen projekt in prazen filter, po odstranitvi filtra se vrne prva stran. |
| R11 | Povzetek, značka in noga štejejo cel `T`; števci table štejejo samo kartice v `S`. | Agent: »R05–R06 and R11…«; začetni regresijski testi. | `src/App.tsx:20`, `src/App.tsx:44`, `src/App.tsx:56`, `src/App.tsx:92`; `src/TaskBoard.tsx:17`, `src/TaskBoard.tsx:22`. | Uspešno; povzetek ostal 4/2/2 pri prikazu dveh opravil, števci table 2/0/0. |
| R12 | Straničenje ne zapisuje na API; ID/podrobnosti in notranje drsenje ostanejo uporabni. | D04; agent: »R02 and R12…«; regresijski testi podrobnosti. | `src/App.tsx:15`, `src/App.tsx:84`, `src/TaskBoard.tsx:25`, `src/styles.css:66`, `src/styles.css:73`. | Uspešno; ni bilo API zapisov; pri širini 390 px `scrollWidth ≤ innerWidth` za oba pogleda. |

### Zapis popravkov specifikacije

- Začetna različica pred implementacijo.
- 2026-09-28: po izvedbi dopolnjena sledljivost z mesti kode in rezultati
  zagonov; sprejemni pogoji R01–R12 niso bili spremenjeni.

## Odprta vprašanja in omejitve

Noben pogoj naloge ne določa besedila za prazen rezultat filtrov ali videza
novih kontrol; privzeto se uporabi nevtralen slovenski opis in obstoječi slog
Folio. Predpostavljena je veljavna vrednost statusa in vsako opravilo pripada
prikazanemu projektu, kot določajo navodila. Končni neobjavljeni primeri niso
dostopni; preveriti jih je mogoče le prek opisanih splošnih pogojev.
