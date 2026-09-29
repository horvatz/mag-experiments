# Stabilno razvrščanje opravil z dvema ključema

## Problem in kontekst

Projektni pogled Folio že prikazuje `Task[]` v vrstnem redu, ki ga vrne API, v preglednici ali na tabli. Dodamo lokalno nastavitev razvrščanja, ki isti seznam dosledno prikaže v obeh pogledih. Izhodiščni dizajn, slovensko besedilo in obstoječa bralna dejanja ostanejo del sprejemnih pogojev.

## Vhodi, dejanja in izidi

Vhodi so projekti in opravila iz obstoječih GET klicev `/api/projects` ter `/api/projects/:id/tasks`; tip `Task` v `shared/types.ts` določa `id`, `projectId`, `title`, `description`, `status: 'todo' | 'in_progress' | 'done'`, `assignee` in `dueDate`. Polje izbranega projekta je izvorni vrstni red. Uporabnik nastavi Primarni ključ in smer ter Sekundarni ključ in smer, zamenja pogled, odpre/zapre podrobnosti ali uporabi Izvorni vrstni red.

Začetno in ponastavljeno stanje je `(original, asc, none, asc)`. Nastavitve veljajo do zamenjave projekta oziroma osvežitve; preklop pogleda in podrobnosti jih ohranita. API napake in nalaganje še naprej upravlja obstoječi prikaz stanja. Razvrstitev ne ustvarja napak ali zapisov; ob praznem seznamu sta prikaza prazna brez izjeme, pri enem opravilu pa vrneta ta ID.

### Primerjalni predikat

Za vhodno polje `T`, indeks `i(t)` in nastavitve `(p, dp, s, ds)` definiraj `norm(x) = lowercase(remove U+0300–U+036F from NFD(x))`. Besedilni primerjalnik vrne `-1/0/1` z `a < b`, `a > b` nad nizoma (primerjava UTF-16); ne kliče `localeCompare` in ne uporablja številskega razvrščanja. Stanje primerja po rangu `todo < in_progress < done`. Veljaven `YYYY-MM-DD` ključ primerja leksikografsko, kar za ta format ustreza kronologiji. `dir(c,d)` je `c` za `asc`, `-c` za `desc`.

Za različna opravila `a,b`: če je `p=original`, velja `a ≺ b` natanko tedaj, ko `i(a)<i(b)`, ne glede na `s,ds`. Sicer primerjaj `dir(cmp_p(a,b),dp)`; ob ničli, če `s≠none`, primerjaj `dir(cmp_s(a,b),ds)`; ob končni ničli razvrsti po naraščajočem izvoru indeksu. Tako se obrne samo posamezna primerjava ključa; stabilnost se ne doseže z obračanjem končnega polja. Enak primarni/sekundarni ključ ne doda tretjega obrata. Sortirana projekcija ne mutira `T` ali njegovih objektov.

## Zahteve in pravila

| Zahteva | Pravilo oziroma sprejemni pogoj | Način preverjanja |
| --- | --- | --- |
| R01 | Začetne kontrole so `original/asc/none/asc`; prikaz vseh ID-jev je enak vrstnemu redu `T`. | D01; obremenitveni preizkus s poljubnim vrstnim redom API-ja. |
| R02 | Ključa `title` in `assignee` uporabita zgornji `norm` in UTF-16 `<`/`>` primerjavo; brez locale ali numeric primerjanja. | D01 za naslov; dodatni Unicode scenarij z diakritiko, NFD/NFC in ločili za oba ključa. |
| R03 | `status` uporablja rang `todo`, `in_progress`, `done`; veljaven datum `dueDate` primerja kronološko. | D02 in D03; dodatne meje koledarskega datuma. |
| R04 | Asc/desc spremeni predznak samo primerjave izbranega ključa. Ne obrača polja ali vrstnega reda izenačenih zapisov. | D02; skupine izenačenih vrednosti v obeh smereh. |
| R05 | Sekundarni ključ `none/title/assignee/status/dueDate` se bere samo ob izenačenju primarnega in uporablja lastno smer. | D02; primeri z obema smerema neodvisno nastavljeni. |
| R06 | Izenačeni primarni in sekundarni ključi ohranijo izvorni indeks. `original` primarni ohrani ga ne glede na druge tri kontrole. | D01 in D04; izenačene skupine, isti ključ izbran dvakrat in primarni `original` z drugimi nastavitvami. |
| R07 | Tri stanja table ostanejo po vrsti Pripravljeno, V delu, Končano; filtriranje vsakega stanja ohrani relativni vrstni red razvrščenega polja. | D03; primerjaj tabelo in ID-je znotraj vseh treh stolpcev. |
| R08 | Pogled in odpiranje/zapiranje podrobnosti ne spreminjata štirih nastavitev ali vrstnega reda. | Preklop v oba pogleda ter odpiranje/zapiranje iz vrstice in kartice. |
| R09 | Zamenjava projekta in ponovni zagon/osvežitev začneta z `(original, asc, none, asc)`; kontrol ni v URL-ju ali trajni shrambi. | Preklop projekta po nastavitvi in osvežitev; pregled poti in shrambe. |
| R10 | Gumb **Izvorni vrstni red** ponastavi vse štiri kontrole. Pri 0 ali 1 opravilu vsaka kombinacija ključev/smeri varno prikaže 0 oziroma 1 ID. | D04; prazni in enočlenski podatkovni nizi ter ponastavitev po različnih kombinacijah. |
| R11 | Sprememba vrstnega reda je čista projekcija: `T` in polja ostanejo enaka, pripadnost projektu in vsote stanj so nespremenjene, API ne prejme zapisovalnega klica. | D04; primerjava vhodnih zapisov/števil in spremljanje metod API. |
| R12 | Vsak ID je v aktivnem pogledu prikazan natanko enkrat; povezava odpre podrobnosti istega ID tudi pri enakih naslovih. Obdržati obstoječe bralne funkcije, `data-task-id`, imena pogledov/stolpcev, `aria-label="Pregled stanj opravil"` in Folio postavitev. Pri 390 px ni vodoravnega razširjanja strani; notranje drsenje preglednice/table je dovoljeno. | Preveri enoličnost ID-jev in ciljne podrobnosti; regresijski scenariji za bralna dejanja ter pregled pri 390 px. |

Dogovorjeni kontrolniki so HTML select z vrednostmi `original/title/assignee/status/dueDate`, `asc/desc`, `none/title/assignee/status/dueDate`, `asc/desc`, in gumb `Izvorni vrstni red`. Vzorci testov lahko vsebujejo nič, eno ali več kot deset opravil, enake naslove, enkratne ID-je, Unicode besedilo in poljubno zaporedje. Vsako opravilo pripada izbranemu projektu; imena in naslovi so nizi, datumi veljavni. UI uporablja samo `/api/`, nikoli `/__test/` ali `localStorage` za podatke. Razporeditev novih kontrol ni predpisana; ohrani se Folio dizajn iz `docs/dizajn.md`, z notranjim drsenjem tabel in table ter vidnim fokusom.

## Izvedba in sledljivost

Spodaj so integracijska mesta v trenutno pregledani kodi, ne trditev, da je funkcionalnost že implementirana. Razvojni testi so bili samo prebrani; v vlogi avtorja specifikacije aplikacije in testov nisem zagnal. D01–D04 so edini identificirani skupni P04 scenariji in ne pokrijejo vseh zgornjih robnih pogojev.

| Zahteva | Pogoj | Test ali scenarij | Datoteka in del kode | Izid ter dokaz |
| --- | --- | --- | --- | --- |
| R01 | Privzete štiri vrednosti in identiteta vrstnega reda `T`. | `D01: default and title order`. | `src/App.tsx` — `ProjectView`; inicializacija lokalnih kontrol in `<tbody>`. | Odprto; test ni zagnan. |
| R02 | Normaliziran UTF-16 comparator za oba besedilna ključa. | `D01` naslov; dodatni Unicode test potreben. | `src/App.tsx` — razvrščevalni comparator ob `ProjectView`. | Odprto; test ni zagnan. |
| R03 | Rang stanj in primerjava ISO datuma. | `D02: state and independent secondary direction`; `D03: board preserves relative sorted order`. | `src/App.tsx` comparator; `src/TaskBoard.tsx` `columns`. | Odprto; testi niso zagnani. |
| R04 | Smer se uporabi samo na comparatorju pripadajočega ključa. | `D02`; dodatne skupine izenačenj. | `src/App.tsx` — comparator. | Odprto; test ni zagnan. |
| R05 | Sekundarni comparator šele ob primarnem izenačenju, z lastno smerjo. | `D02`. | `src/App.tsx` — štiri kontrole in comparator. | Odprto; test ni zagnan. |
| R06 | Izvorni indeks je končni stabilni kriterij; `original` prezre ostale ključe. | `D01`, `D04`; dodatni testi enakih ključev. | `src/App.tsx` — comparator na indeksiranih kopijah seznama. | Odprto; testi niso zagnani. |
| R07 | Tabla porabi isto urejeno polje kot tabela. | `D03`. | `src/App.tsx` — `TaskBoard tasks={...}`; `src/TaskBoard.tsx` — filtriranje stolpcev. | Odprto; test ni zagnan. |
| R08 | Stanje sort ne resetira ob spremembi `view` ali `taskId`. | Pogled table↔board in podrobnosti open/close. | `src/App.tsx` — `ProjectView`; `src/navigation.ts` — `view`; `src/TaskDetails.tsx` — zapiranje. | Odprto; test ni zagnan. |
| R09 | Projektna menjava/remount in refresh ponastavita; brez persistence. | Menjava projekta in osvežitev po spremembi nastavitev. | `src/App.tsx` — `ProjectView key={project.id}`; `src/navigation.ts` — samo `view` v hash poti. | Odprto; test ni zagnan. |
| R10 | Reset štirih stanj; prazno in eno opravilo sta veljavna. | `D04: reset and no writes`; prazen in enočlenski niz. | `src/App.tsx` — reset gumb in oba pogleda. | Odprto; test ni zagnan. |
| R11 | Nespremenjen vir/projekcija, števila iz izvornih podatkov in brez mutacij API. | `D04`; preveri identiteto vhodnih zapisov in vsote. | `src/App.tsx` — `counts`, GET prek `useResource`, projekcija; `src/api.ts`. | Odprto; test ni zagnan. |
| R12 | Enolični prikaz/povezave ID, dostopnost in širina 390 px. | Enaki naslovi, klik vsake vrstice/kartice, regresija in mobilni pregled. | `src/App.tsx` — vrstice, `src/TaskBoard.tsx` — kartice, `src/TaskDetails.tsx`, `src/styles.css`. | Odprto; test in vizualni pregled nista izvedena. |

## Odprta vprašanja in omejitve

Ni odprte domenske dvoumnosti glede primerjalnih ključev: fiksni format datumov omogoča leksikografsko primerjavo. Dodatni Unicode, stabilnost, reset/persistence, prazen/enojni niz in širina 390 px niso zajeti v štirih prebranih razvojnih scenarijih; implementer naj jih preveri in v predaji navede dejanske izide. Končnih testov iz naloge v tej fazi nisem zagnal.
