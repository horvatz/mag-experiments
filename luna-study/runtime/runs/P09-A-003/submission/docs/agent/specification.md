# Specifikacija P09: stanje pogleda v povezavi in zgodovini

## Problem in kontekst

Folio trenutno kaže vsa opravila izbranega projekta v preglednici ali tabli. Hash določa projekt, opravilo in način prikaza, vendar filtri še niso del povezave. Uporabnik potrebuje deljiv, neposredno odpirljiv pogled, pri katerem se potrjeni filtri obnašajo kot navigacijsko stanje brskalnika. Podatki ostanejo iz javnega API-ja; sprememba pogleda ne zapisuje podatkov.

## Vhodi, dejanja in izidi

Vhod so opravila javnega API-ja (`id`, `projectId`, `title`, `description`, `assignee`, `status`, `dueDate`) ter hash oblike `#/projects/:projectId[/tasks/:taskId]?view=board&q=...&status=...&order=...`. Filtri so `q` (fraza), `status` (`all`, `todo`, `in_progress`, `done`) in `order` (`original`, `title-asc`, `title-desc`). Manjkajoče ali neveljavne vrednosti pomenijo privzeto stanje.

Kontrole uredijo lokalni osnutek. »Uporabi pogled« potrdi osnutek v enem navigacijskem stanju; »Ponastavi pogled« potrdi privzete vrednosti. Navigacija na projekt, opravilo ali drug način prikaza zavrže osnutek. Potrditev spremeni samo URL in prikazane zapise. Napake in nalaganje še naprej upravlja obstoječi `useResource`; brez podatkov ni mogoče izvesti filtriranja.

## Zahteve in pravila

Za predikate naj bo `T` izvorni seznam opravil iz API-ja, `N(s)` normalizacija `trim → NFD → odstranitev U+0300–U+036F → lowercase`, `F` potrjeni filtri in `V` potrjeni način pogleda. `q(F)` je `N(F.q)`. `M = |T|`. Rezultati `R(T,F)` so zapisi iz `T`, katerih stanje ustreza `F.status` (ali vsem, če `all`) in katerih `N(q)` je podniz vsaj enega od `N(title, description, assignee, id)` (ali vsi, če je fraza prazna). `order=original` ohrani vrstni red `T`; naslovna vrstna reda primerjata normalizirana naslova po UTF-16, pri enakosti ohranita izvorni indeks.

| Zahteva | Pravilo oziroma sprejemni pogoj | Način preverjanja |
| --- | --- | --- |
| R01 | `F` se razbere iz query dela obstoječe projektne/podrobnostne poti; začetna oziroma manjkajoča vrednost je `('', all, original)` in se uporabi brez klika. | Neposredni URL z vsemi filtri in privzeti URL. |
| R02 | Iskanje je ena dobesedna normalizirana fraza; `q` se ne deli in se ne razume kot regex. Ujemanje je podniz enega od štirih polj. | Poudarki, presledki, ločila, regex znaki, posamezna polja. |
| R03 | Filtriranje je presek statusa in iskanja. Razvrstitev naslovov uporablja `N(title)`; enaki naslovi so stabilni. | Kombinacija filtrov in asc/desc/stabilnost. |
| R04 | Query razčleni prvo pojavitev; neznani status/order postaneta privzeta, drugi parametri se prezrejo. Samo branje poti URL-ja ne prepiše. | Podvojeni/neveljavni parametri in začetno stanje URL-ja. |
| R05 | Osnutek `D` se spreminja neodvisno. Potrditev ustvari največ eno zgodovinsko stanje in samo, če `D` po normalizaciji privzetih vrednosti ni enak `F`. | Spreminjanje brez prikaza/URL-ja, nato skupna potrditev. |
| R06 | Potrditev zapiše obrezan `q`, izpusti prazne/privzete filtre, kodira preostalo, ohrani `view=board`, odstrani druge parametre; enaka potrditev ne doda zapisa zgodovine. | URL po potrditvi, ponovljena potrditev, `history.length`. |
| R07 | `popstate`/`hashchange` obnovi `F`, rezultat in osnutek; osvežitev ponovno razbere `F` iz URL-ja. | Nazaj/Naprej in reload z neposredno povezavo. |
| R08 | Preklop pogleda ohrani `F` in iste ID-je; navigacija zavrže `D`. | Tabla ↔ preglednica po filtru in z neuporabljenim osnutkom. |
| R09 | Povezava opravila vsebuje `F` in `V`; zaprtje/Escape odstrani pot opravila ter ohrani `F`/`V`. Cilj je določen z ID-jem. | Enaka naslova, podrobnosti na obeh pogledih, zapiranje in Escape. |
| R10 | Klik na drug projekt odstrani filtre in uporabi privzeto `F`, pri čemer ohrani `V`; neposredni URL drugega projekta filtre razbere. | Klik projekta in neposredna navigacija. |
| R11 | Ponastavitev nastavi `D=F=('',all,original)` po pravilu R06. Rezultat ima števec `Prikazano: |R| od M.`; prazen `R` prikaže `Ni zadetkov.` | Ponastavitev, prazen rezultat in števec. |
| R12 | Vse operacije so GET-branje in lokalno računanje; ne uporabljajo localStorage, testnih kontrol ali zapisovalnih API-jev. Obstoječe neznane poti, nalaganje, podrobnosti, dostopnost in odzivni videz ostanejo delujoči. | Omrežne zahteve, regresijski testi in pregled širine 390 px. |

Osrednja lastnost filtra: `R(T,F) = [t ∈ T | (F.status=all ∨ t.status=F.status) ∧ (q(F)="" ∨ ∃x∈{title,description,assignee,id}: q(F) ⊆ N(t.x))]`. Osrednja lastnost URL-ja: `parse(serialize(F,V)) = (F,V)`, kjer `serialize` izpusti `q=""`, `status=all`, `order=original` in doda samo `view=board` za tablo. Zgodovina dobi novo stanje samo, ko se kanonični hash razlikuje od trenutnega.

## Izvedba in sledljivost

Izvedeni pogoji in dokazi so podrobneje zbrani tudi v [verification.md](verification.md). Končni `npm run check` je uspel; agentni scenariji so bili po zadnjih dopolnitvah ponovno izvedeni.

| Zahteva | Pogoj | Test ali scenarij | Datoteka in del kode | Izid ter dokaz |
| --- | --- | --- | --- | --- |
| R01 | Parse začetnih in neposrednih vrednosti | D01: neposredni URL; P09: fraza in filtri na drugem projektu | `src/navigation.ts`, `src/App.tsx` | Uspelo: končni `npm run check`, 53/53; agentni projekt 7/7 |
| R02 | Normalizirano dobesedno podnizno ujemanje | P09: Unicode, vsa štiri polja, večbesedna fraza in regex znaki | `src/taskFilterUtils.ts` (`normalizeSearch`, `filterTasks`) | Uspelo: isti zagon, 7 agentnih primerov uspešnih |
| R03 | Presek filtrov, stabilno UTF-16 razvrščanje | D02: status; P09: status + fraza, naraščajoče/padajoče, enaki naslovi | `src/taskFilterUtils.ts` (`filterTasks`) | Uspelo: isti zagon, 7 agentnih primerov uspešnih |
| R04 | Prva vrednost, privzete neveljavne, brez prepisovanja | P09: podvojena status/order, neznan ključ, hash ostane enak | `src/navigation.ts` | Uspelo: isti zagon, 7 agentnih primerov uspešnih |
| R05 | Ločena osnutek in potrditev | D02: osnutek; P09: osnutek zavržen ob navigaciji | `src/taskFilters.tsx`, `src/App.tsx` | Uspelo: končni zagon 53/53 |
| R06 | Kanoničen URL in idempotentna potrditev | P09: privzeti/unknown ključi odstranjeni, q obrezan, zgodovina izmerjena | `src/navigation.ts`, `src/taskFilters.tsx` | Uspelo: agentni projekt 7/7 |
| R07 | Obnova ob navigaciji zgodovine | D03: reload; P09: Nazaj/Naprej obnovita stanje | `src/navigation.ts`, `src/App.tsx` | Uspelo: končni zagon 53/53 |
| R08 | Ohranitev filtrov pri pogledu, zavrženje osnutka | D03: tabla in reload; P09: filter ob zgodovinski navigaciji | `src/navigation.ts`, `src/App.tsx`, `src/TaskBoard.tsx` | Uspelo: končni zagon 53/53 |
| R09 | ID cilj in ohranitev `F,V` | Izhodišče: podvojeni naslovi/Escape; P09: tabla, filter in gumb zapri | `src/navigation.ts`, `src/TaskBoard.tsx`, `src/TaskDetails.tsx` | Uspelo: končni zagon 53/53 |
| R10 | Projektna povezava počisti filtre | P09: klik drugega projekta ohrani tablo in počisti filtre; neposredni URL uporabi status | `src/navigation.ts`, `src/App.tsx` | Uspelo: agentni projekt 7/7 |
| R11 | Ponastavitev, sporočilo in števec | D04: reset; P09: števec, `Ni zadetkov.`, reset ohrani tablo; izhodišče: prazen projekt | `src/App.tsx`, `src/taskFilters.tsx`, `src/styles.css` | Uspelo: končni zagon 53/53 |
| R12 | Samo GET, regresija in ozki zaslon | P09/D04: brez zapisov; baseline: napake, prazno, podrobnosti; agent: 390 px; pregled virov | `src/App.tsx`, `src/styles.css`, `src/useResource.ts` | Uspelo: končni zagon 53/53; brez localStorage/testnih API-jev v `src/` |

## Zapis sprememb specifikacije

- Začetna različica: pogoji izpeljani neposredno iz P09 1.0 in skupne predloge; pred implementacijo.
- Popravek pred preverjanjem: funkciji za filtriranje in normalizacijo sta v `src/taskFilterUtils.ts`; UI kontrole so v `src/taskFilters.tsx`.

## Odprta vprašanja in omejitve

- Zahteve ne določajo, ali se števec povzetka stanj spreminja s filtrom; ohranjen bo za vsa opravila projekta, števec rezultatov pa bo izrecno pokazal filtrirani in skupni obseg.
- Stabilno razvrščanje bo vezano na izvorni vrstni red odgovorov API-ja.
- Dejanski obseg preverjanj in morebitne omejitve okolja bodo zapisani v `verification.md`.
