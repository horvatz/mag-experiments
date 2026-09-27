# Implementacija in preverjanje

## Začetni zapis

- Vloga: implementer za P05, postopek B. Specifikacija `docs/agent/specification.md` je predana in velja skupaj z izvornimi zahtevami R01–R12.
- Obseg sprememb: samo `src/`, lastni testi `tests/agent/` in ta zapis v `docs/agent/`.
- Načrt preverjanja: najprej pregledati tok projekta/pogleda/navigacije in razvojne teste; nato implementirati; zagnati zahtevani `npm run check` in po potrebi namenski razvojni Playwright projekti; dodati ciljne lastne teste, če ostane čas.
- Stanje ob začetku: vsa preverjanja so načrtovana in še niso izvedena. Zabeležiti bo treba dejanski ukaz, rezultat in omejitve.
- Omejitve okolja: ne spreminjam skupnih testov, pravil, infrastrukture, odvisnosti ali strežnika. Javni internet je v navodilih označen kot blokiran; naloga uporablja lokalni API. Chromium in odvisnosti naj bi bili nameščeni. Za ročne skripte je predpisan `chromium.connect(wsEndpoint)` iz `task/browser.json`, ne `launch()`.

## Dnevnik sprememb in preverjanj

| Čas | Sprememba ali preverjanje | Povezane zahteve | Rezultat / omejitev |
| --- | --- | --- | --- |
| Začetek | Prebrana projektna pravila, navodila, predloga in predana specifikacija; ustvarjen začetni zapis. | R01–R12 | Preverjanja še niso izvedena. |
| Implementacija | V `src/App.tsx` dodani lokalni izbirnik velikosti/filter, izračun filtriranega odseka, krmarjenje in status; tabela in tabla prejmeta isti `visibleTasks`. Povzetki ostanejo vezani na celoten seznam projekta. V `src/styles.css` dodani zložljivi kontrolniki, ki uporabijo Folio barve in obrobe. | R01–R12 | Projektni `key` ponastavi lokalni izbor ob menjavi; hash vsebuje samo obstoječo pot/pogled/podrobnost. |
| Lastni testi | Dodan `tests/agent/pagination.spec.ts`: začetno stanje in filter v pogledih, prazen rezultat/robni gumbi, ohranitev izbire na drugi strani pri pogledu/podrobnostih ter ponastavitev ob menjavi projekta in osvežitvi. | R01, R03–R11 | V prvem zagonu sta se izkazali za napačni dve pričakovanji testa (primer ima štiri opravila todo; tabla razvrsti po stolpcih); popravljena sta bila testa. Koda se ni spreminjala zaradi teh napak. |
| Končni preveritveni zagon | `npm run check` (lint, typecheck, Vite build, vsi Playwright projekti). | R01–R12 | Uspeh, izhodna koda 0; 49/49 testov v 18,7 s. Vključeno 38 osnovnih, 8 razvojnih P05 (namizje in mobilno) ter 3 lastni testi. |

## Sledljivost po izvedbi

| Zahteva | Implementacija / pogoj | Dejanski dokaz |
| --- | --- | --- |
| R01, R02 | `src/App.tsx`: začetni `pageSize='all'`, `filter='all'`; filtrirani API vrstni red ohrani, `slice` uporablja samo izbrane velikosti. | Razvojni D01/D02 ter `pagination defaults...`; potrjeno tudi 0/1/8 zapisov v baznih in lastnih scenarijih. |
| R03 | Gumbi premaknejo `page` na prvo/prejšnjo/naslednjo/zadnjo stran; stanje roba izključi neveljaven premik. | Razvojni D02 potrdi onemogočen Naslednja na zadnji; lastni prazen filter potrdi onemogočene vse štiri. |
| R04, R05 | Sprememba velikosti ali filtra nastavi stran 1; najprej se sestavi `filteredTasks`, nato izračuna odsek. | Razvojni D03/D04; lastni filter na strani >1 in prikaz `1–2 od 4`. |
| R06 | Tabela uporablja `visibleTasks`; `TaskBoard` prejme isti seznam, nato ga združi po stanju. | Razvojni D03; lastni preklop pogleda primerja enake ID-je na mešanem odseku. |
| R07 | Stanje je v `ProjectView`; sprememba view/detail hash poti ohrani montirano komponento za isti projekt. | Lastni test preklopi pogled in odpre/zapre podrobnosti na strani 2; preveri ID-je, status, velikost in filter. |
| R08 | `ProjectView key={project.id}` ponastavi state pri projektu; ob polnem osveževanju se state inicializira. Pagination se ne doda v hash ali trajno shrambo. | Lastni test po izbiri velikosti/strani potrdi ponastavitev ob `page.reload()` in menjavi projekta. |
| R09, R10 | Status formatira stran, skupno število rezultatov in vključujoči indeksni razpon; prazen rezultat prikaže 0/0 in 0–0. | Razvojni D02 in lastni prazni filter ter začetni primer. |
| R11 | Značka, footer in `counts` berejo celoten `tasks`; stolpci table štejejo `visibleTasks`. | Lastni test potrdi nespremenjene povzetke po filtriranju/strani; razvojni D03 preveri tablo. |
| R12 | Odsek je samo lokalno izračunan iz GET-podatkov; novi API zapisi niso dodani. Tabela/tabla imata obstoječe ID-je in notranji overflow. | Razvojni D04 kliče `readonly` (zapisov ni, dokumentna širina ne preseže okna) na namizju in mobilno; vsi bazni testi podrobnosti/API so uspešni. |

Nobenega odstopanja oziroma napake predane specifikacije nisem zaznal; `all` je obravnavan kot celoten odsek po pravilu iz specifikacije.

## Omejitve in opozorila

- Javni internet je blokiran; preverjanje je uporabljalo lokalni API in nameščene odvisnosti/Chromium prek Playwright konfiguracije in `task/browser.json`.
- `git status` ni bil dostopen: ukaz vrne `xcrun: error: invalid active developer path ... missing xcrun`. Spremenjene datoteke so pregledane prek neposrednih izpisov; git diff/status zato ni del dokazov.
- npm je izpisal opozorilo za neznano `http-proxy` konfiguracijo, Playwright pa opozorila `NO_COLOR`/`FORCE_COLOR`; niso vplivala na uspešen zagon.
- Končni neobjavljeni scenariji vključujejo vse poljubne testne podatke, neposredno osvežitev z izbranim stanjem in vse štiri robne gumbe pri vseh velikostih; obstoječi testi pokrijejo predstavljene primere, logika robov pa je preverljiva v `src/App.tsx`.
