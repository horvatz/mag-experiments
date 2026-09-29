# Specifikacija: iskanje in sestavljeni filtri

## Problem in kontekst

Folio trenutno prikaže opravila iz izbranega projekta brez iskanja ali filtrov.
Uporabnik želi rezultate zožiti z iskalnim nizom, stanjem in odgovorno osebo,
pri tem pa uporabljati obstoječo preglednico, tablo, navigacijo in podrobnosti.
Opravila se pridobijo prek javnega API-ja; filtriranje je prikazna funkcija
trenutnega projekta in ne spreminja podatkov.

## Vhodi, dejanja in izidi

Model `Task` v `shared/types.ts` vsebuje `id`, `projectId`, `title`,
`description`, `status`, `assignee` in `dueDate`; `TaskStatus` je unija
`todo | in_progress | done`. `ProjectView` v `src/App.tsx` pridobi opravila
iz `/api/projects/{id}/tasks`, medtem ko so povezave in izbira pogleda v
`src/navigation.ts`. Filtri delujejo samo nad podatki tega API-klica.

Začetne vrednosti so iskalni niz `""`, stanje `all` in oseba `all`. Uporabnik
lahko te kontrole spreminja, zamenja projekt ali klikne »Počisti filtre«.
Sprememba projekta in osvežitev strani ponastavita filtre. Filtriranje ne
spreminja opravil, vrstnega reda izvirnih podatkov, URL-ja ali trajne shrambe.
Če API sporoči napako, obstoječe stanje napake in ponovnega poskusa ostane
uporabno.

## Zahteve in pravila

Naj bo `T` seznam opravil trenutnega projekta v vrstnem redu API-ja, `q`
vsebina iskanja, `s` filter stanja in `a` filter osebe. Definiraj
`norm(x) = lowercase(stripU+0300–U+036F(NFD(x)))` in
`text(t) = norm(t.id + " " + t.title + " " + t.description + " " + t.assignee)`.
`W(q)` so neprazni kosi `q`, razdeljeni po beli presledkih in normalizirani.
Opravilo ustreza, če za vsak `w ∈ W(q)` velja `text(t)` vsebuje `norm(w)` kot
doboleden podniz, poleg tega pa `(s = all ∨ t.status = s)` in
`(a = all ∨ t.assignee = a)`. Pri praznem `q` je iskalni pogoj resničen.
Vidni seznam `V` je filtrirani `T` brez razvrščanja. Ujemanje je dobesedno,
zato znaki, kot so `.*`, niso vzorci. Vrednost osebe se primerja natančno.

| Zahteva | Pravilo oziroma sprejemni pogoj | Način preverjanja |
| --- | --- | --- |
| R01 | Ob začetku so `q=""`, `s=all`, `a=all`; `V=T` in ohrani vrstni red API-ja. | Začetni prikaz in zaporedje `data-task-id`; preveri privzete kontrole. |
| R02 | Iskalna polja so združeni `id`, `title`, `description`, `assignee`; primerjaj po `norm`. `č` in `c` ter velike in male črke se ujemajo. | Išči z in brez diakritike, z različnimi velikostmi črk, v vsakem polju. |
| R03 | Vsaka neprazna beseda `W(q)` se mora pojaviti dobesedno v združenem besedilu; vse besede so pogoj AND, vrstni red ni pomemben. Prazno/beli presledki ne omejijo rezultatov. | Večbesedno iskanje v obratnem vrstnem redu in iskanje ločil/regex metaznakov. |
| R04 | `s` je `all`, `todo`, `in_progress` ali `done`; filter `a` se ujema z natančnim nepraznim imenom. Oba se z iskanjem sestavita z AND. | Kombiniraj vse tri pogoje; preveri tudi vsako vrednost stanja in razliko v zapisu imena. |
| R05 | Možnosti oseb so `all` in vsako različno neprazno `assignee` iz celotnega `T`, tudi če je opravilo filtrirano skrito. Po menjavi projekta v možnostih ni imen prejšnjega projekta. | Preveri podvojeno ime, osebo brez trenutnih zadetkov ter seznam po menjavi projekta. |
| R06 | Preglednica in tabla vsebujeta iste ID-je `V`; preklop pogleda ohrani `q,s,a`. Tabla razvrsti samo `V` v stolpce po `status`. | Nastavi filtre, preklopi v obe smeri in primerjaj ID-je; preveri stolpce po stanju. |
| R07 | Menjava projekta nastavi `q=""`, `s=all`, `a=all`; `V` izhaja samo iz `T` novega projekta. | Izberi filtre, zamenjaj projekt z različnim naborom ID-jev in preveri stanje ter rezultate. |
| R08 | Osvežitev začne s privzetimi filtri; nove kontrole ne dodajo filtra v hash/URL ali `localStorage`/drugo trajno shrambo. | Filtriraj, osveži in preveri kontrole ter rezultate; preglej URL in zapisovalne klice shrambe. |
| R09 | Statusno sporočilo ima `aria-label="Rezultati filtriranja"` in natanko `Prikazano: |V| od |T|.`. Povzetek stanj in števci stolpcev štejejo samo `V`. | Preveri besedilo/oznako, povzetek in stolpce pri filtriranem naboru. |
| R10 | Če `|T|>0` in `|V|=0`, pokaži `Ni zadetkov.` v preglednici in tabli; oba pogleda ostaneta uporabna. Če `|T|=0`, ohrani običajno prazno stanje in `Prikazano: 0 od 0.` | Ločeno preveri prazen projekt in neprazen projekt brez zadetkov v obeh pogledih. |
| R11 | »Počisti filtre« z enim dejanjem nastavi `q=""`, `s=all`, `a=all`; rezultat je `V=T` v prvotnem vrstnem redu, zapisi `T` ostanejo nespremenjeni. | Po kombiniranem filtru počisti in primerjaj kontrole, ID-je in prikazana polja. |
| R12 | Obstoječi projektni meni, pogleda in bralne podrobnosti delujejo. Filtriranje ne pošlje `POST/PATCH/PUT/DELETE` na `/api/`. Ohranita se Folio in odzivni videz: pri širini 390 px zunanja stran nima vodoravnega preliva; dovoljena sta notranja drsnika preglednice in table. Nova dejanja ob opravilu so zunaj njegove povezave. Ohranijo se `data-task-id`, dostopna imena pogledov in stolpcev ter `aria-label="Pregled stanj opravil"`. | Preveri navigacijo/podrobnosti, spremljaj API metode, preglej Folio pri 390 px in fokus/dostopna imena. |

Dogovorjeni kontrolniki: `input[type=search]` z imenom »Išči opravila«; izbirnika
»Filter stanja« in »Filter odgovorne osebe«; gumb »Počisti filtre«; statusna
regija z zgornjim imenom in besedilom. Ohraniti je treba `data-task-id`, imena
obstoječih pogledov in stolpcev ter `aria-label="Pregled stanj opravil"`.
Kontrole naj uporabljajo slovenska poimenovanja. Dizajn določa
`docs/dizajn.md`; relevantni slogi in notranje drsenje so v `src/styles.css`.

## Izvedba in sledljivost

Specifikacija usmerja implementacijo. Naslednje povezave določajo izhodiščna
mesta za spremembo, ne trdijo, da je funkcionalnost že implementirana.
Razvojna zbirka `tests/development/P03.spec.ts` ima scenarije D01 (privzeti
seznam in iskanje), D02 (sestavljeni filtri in preklop pogleda), D03 (brez
zadetkov in čiščenje) in D04 (števec in samo-bralno vedenje). Ti ne pokrivajo
vseh mejnih pogojev zgornje tabele; dodatni scenariji so določeni tam. Testov
v tej specifikacijski vlogi nisem zagnal.

| Zahteva | Pogoj | Test ali scenarij | Datoteka in del kode | Izid ter dokaz |
| --- | --- | --- | --- | --- |
| R01–R03 | Privzete vrednosti, normalizacija in predikat besed. | D01; dopolniti z večbesednimi, večpoljnimi in ločilnimi primeri. | `src/App.tsx` — `ProjectView`; `shared/types.ts` — model `Task`. | Ni izvedeno; implementacija predana naprej. |
| R04–R05 | Filtri AND; možnosti iz celotnega trenutnega projekta. | D02; dopolniti z meniji oseb pri filtriranih zadetkih in menjavi projekta. | `src/App.tsx` — `ProjectView`; API rezultat v `useResource`. | Ni izvedeno; implementacija predana naprej. |
| R06 | Isti `V` v obeh prikazih in ohranjeni filtri. | D02. | `src/App.tsx` — izbor pogleda; `src/TaskBoard.tsx` — stolpci. | Ni izvedeno; implementacija predana naprej. |
| R07–R08 | Projektno lokalno stanje; ponastavitev ob projektu/osvežitvi. | Dopolniti D02 z menjavo projekta in ponovnim nalaganjem. | `src/App.tsx` — `ProjectView` z `key={project.id}`; `src/navigation.ts` — URL za pogled. | Ni izvedeno; implementacija predana naprej. |
| R09–R10 | Števci nad `V`; ločiti prazno `T` od praznega `V`. | D03, D04; dopolniti z obema pogledoma in statusnimi števci. | `src/App.tsx` — povzetek, prazen prikaz in footer; `src/TaskBoard.tsx` — števci stolpcev. | Ni izvedeno; implementacija predana naprej. |
| R11 | Enkratno čiščenje brez spreminjanja opravil. | D03; preveriti prvotni vrstni red in polja. | `src/App.tsx` — kontrolniki in izračun `V`. | Ni izvedeno; implementacija predana naprej. |
| R12 | Navigacija, branje, brez API zapisov, širina in obstoječi dostopni ključi; nova dejanja ob opravilu so zunaj njegove povezave. | D04; dodatno preveriti podrobnosti, 390 px, poglede in imena. | `src/App.tsx`, `src/TaskBoard.tsx`, `src/TaskDetails.tsx`, `src/styles.css`, `src/api.ts`. | Ni izvedeno; implementacija predana naprej. |

## Odprta vprašanja in omejitve

Uporabljena so pojasnila izvirnih navodil: vsa testna opravila pripadajo
projektu; imena v nalogah izbire osebe so neprazna in ne `all`; prazne
projekte je treba podpreti; podatkovni model ostane nespremenjen. Razvojni
primeri niso celoten obseg. Končni testi niso dostopni kot potrjen rezultat in
tu niso bili zagnani. Implementer mora povezave do dejansko spremenjene kode,
izide lastnih preverjanj in omejitve po izvedbi dopolniti.
