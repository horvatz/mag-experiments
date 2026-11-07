# Specifikacija P06: nastavljiv izvoz CSV

## Problem in kontekst

Folio trenutno prikazuje opravila izbranega projekta v preglednici in tabi, vendar jih ne more izvoziti. Uporabnik potrebuje ponovljiv, varen CSV izvoz trenutnega projekta z nadzorom nad stolpci, filtrom in ločilom ter ohranjanjem obstoječih bralnih funkcij in videza Folio.

## Vhodi, dejanja in izidi

- Vhodi so opravila projekta iz `GET /api/projects/<projectId>/tasks` z enkratnimi `id`, projektno pripadnostjo, naslovom, stanjem, osebo, rokom in opisom.
- Dejanja: izbor podmnožice stolpcev; izbor filtra `all | todo | in_progress | done`; izbor ločila `; | ,`; prenos z gumbom `Izvozi CSV`; preklop med preglednico in tabo.
- Uspeh: datoteka `folio-<projectId>.csv` vsebuje UTF-8 BOM, izbrane stolpce v nespremenljivem vrstnem redu, filtrirane vrstice v izvornem vrstnem redu, vedno citirane vrednosti, CRLF zaključek vsake vrstice in nevtralizirane formule.
- Onemogočenje: prazen projekt, prazen filtrirani rezultat ali prazen nabor stolpcev onemogoči gumb; prenosa ni.
- Preklic/napaka: kontrole ne spreminjajo podatkov in ne pošiljajo zapisov na API. Napaka nalaganja opravil pusti obstoječe bralno obnašanje nespremenjeno; izvoz ostane nedostopen.
- Projekt, osvežitev strani in navigacija: izbor stolpcev, filter in ločilo so lokalno stanje trenutnega projekta; menjava projekta ali osvežitev ju ponastavi na privzete vrednosti.

## Zahteve in pravila

Simboli: `T` je zaporedje opravil projekta v odzivu; `selected` je neprazna podmnožica `COLUMNS`; `separator ∈ {";", ","}`; `filter ∈ {"all","todo","in_progress","done"}`; `csv(v)` pomeni dvojni narekovaj okoli vrednosti s podvojitvijo notranjih narekovajev; `safe(v)` doda `'` pred `v`, če `v` po nič ali več začetnih znakih presledek, tabulator, CR ali LF začne z `=`, `+`, `-` ali `@`.

| Zahteva | Pravilo oziroma sprejemni pogoj | Način preverjanja |
| --- | --- | --- |
| R01 | Privzeto `selected = COLUMNS`, `filter = "all"`, `separator = ";"`; izvožene vrstice so `T` v enakem zaporedju. | Lastni test privzetih nastavitev in vrstnega reda. |
| R02 | `COLUMNS = [id, projectId, title, status, assignee, dueDate, description]`; glava in vrednosti uporabljajo ta vrstni red ne glede na zaporedje klikov. | Lastni test izbire v obratnem vrstnem redu. |
| R03 | Gumb je onemogočen natanko tedaj, ko je `selected = ∅` ali `filtered(T) = ∅`; ob izboru novega stolpca ob nepraznem rezultatu ponovno deluje. | Lastni test praznega izbora in ponovne izbire. |
| R04 | `filtered(T) = T` za `all`, sicer `{task ∈ T : task.status = filter}`; UI v obeh pogledih še vedno prikazuje celoten `T`; prazen projekt ali prazen filter onemogoči izvoz. | Lastni test za vsak filter in prikaz celotnega projekta. |
| R05 | Ustvari se lokalni download `folio-<projectId>.csv`, začne z U+FEFF, brez dodatnega strežniškega zahtevka in brez nove strani. | Lastni test imena, BOM in zahtevkov; brskalnikov download preverijo razvojni testi. |
| R06 | Vsaka glava in vsaka vrednost sta obdani z `"`; notranji `"` se podvoji; separator je izbrani `;` ali `,`. | Lastni test narekovajev, separatorjev in vrednosti z ločili. |
| R07 | Zapisi vrstic so CRLF in zadnja vrstica se konča s CRLF; presledki, tabulatorji in CR/LF znotraj vrednosti ostanejo citirani. | Lastni test multinančne vrednosti in binarne zaključke. |
| R08 | `safe` velja za vse izvožene podatkovne vrednosti, ne za glavo; prepozna formule tudi po presledku, tabulatorju, CR ali LF. | Lastni test vseh prefiksov in vodilnih presledkov. |
| R09 | Unicode, šumniki, presledki in opisi ostanejo enaki; `status` ostane interna vrednost in `dueDate` ostane YYYY-MM-DD. | Lastni test posebnih znakov, opisa, stanja in datuma. |
| R10 | Preklop pogleda ohrani nastavitve; izvoz v obeh pogledih ustvari enake bajte. | Lastni test nastavitev in enakosti obeh prenosov. |
| R11 | Komponenta projekta se ponastavi ob menjavi projekta in osvežitvi; dva zaporedna izvoza odražata trenutne nastavitve. | Lastni test menjave projekta in zaporednih izvozov. |
| R12 | Izvoz bere izključno javni API, ne pošilja zapisov na API, ne spreminja opravil, obstoječih bralnih funkcij ali testnih kontrol, in sledi potrjenemu videzu. | Lastni test samo-branja, obstoječih oznak, ID-jev vrstic in širine 390 px. |

## Izvedba in sledljivost

| Zahteva | Pogoj | Test ali scenarij | Datoteka in del kode | Izid ter dokaz |
| --- | --- | --- | --- | --- |
| R01 | Privzete nastavitve in zaporedje | `P06 agent export covers all requirements` | `src/csvExport.ts`, `src/App.tsx`, `tests/agent/p06.spec.ts` | Uspešno – lastni test in `npm run check` 49/49. |
| R02 | Nespremenljivi vrstni red stolpcev | `P06 agent export covers all requirements` | `src/csvExport.ts`, `src/App.tsx`, `tests/agent/p06.spec.ts` | Uspešno – lastni test in `npm run check` 49/49. |
| R03 | Prazna izbira in ponovna izbira | `P06 agent export covers all requirements` | `src/App.tsx`, `tests/agent/p06.spec.ts` | Uspešno – lastni test in `npm run check` 49/49. |
| R04 | Filtri in prikaz celotnega projekta | `P06 agent export covers all requirements`; `P06 agent empty project stays readable and export stays disabled` | `src/App.tsx`, `tests/agent/p06.spec.ts` | Uspešno – lastna testa in `npm run check` 49/49. |
| R05 | Lokalni download in BOM | `P06 agent export covers all requirements` | `src/App.tsx`, `src/csvExport.ts`, `tests/agent/p06.spec.ts` | Uspešno – lastni test in `npm run check` 49/49. |
| R06 | Citiranje in ločila | `P06 agent export covers all requirements` | `src/csvExport.ts`, `tests/agent/p06.spec.ts` | Uspešno – lastni test in `npm run check` 49/49. |
| R07 | CRLF in vgrajeni prelomi | `P06 agent export covers all requirements` | `src/csvExport.ts`, `tests/agent/p06.spec.ts` | Uspešno – lastni test in `npm run check` 49/49. |
| R08 | Nevtralizacija formul | `P06 agent export covers all requirements`; `P06 agent formula neutralization covers every prefix and data column` | `src/csvExport.ts`, `tests/agent/p06.spec.ts` | Uspešno – lastna testa in `npm run check` 49/49. |
| R09 | Unicode, interna stanja, izvorni datum | `P06 agent export covers all requirements` | `src/csvExport.ts`, `tests/agent/p06.spec.ts` | Uspešno – lastni test in `npm run check` 49/49. |
| R10 | Ohranjanje nastavitev med pogledoma | `P06 agent export covers all requirements` | `src/App.tsx`, `tests/agent/p06.spec.ts` | Uspešno – lastni test in `npm run check` 49/49. |
| R11 | Ponastavitev in zaporedni izvozi | `P06 agent export covers all requirements` | `src/App.tsx`, `tests/agent/p06.spec.ts` | Uspešno – lastni test in `npm run check` 49/49. |
| R12 | Zaščita podatkov in obstoječi UI | `P06 agent export covers all requirements`; `P06 agent empty project stays readable and export stays disabled` | `src/App.tsx`, `src/csvExport.ts`, `tests/agent/p06.spec.ts` | Uspešno – lastna testa in `npm run check` 49/49. |

## Odprta vprašanja in omejitve

Ni odprtih vprašanj. Nepreverjeno ostaja izvedba v drugih brskalnikih kot lokalni Chromium; preskoki osvežitve med nezaključenim nalaganjem niso v obsegu naloge.

## Zgodovina popravkov

- 9. 10. 2026: ustvarjena začetna specifikacija pred implementacijo.
- 9. 10. 2026: dopolnjeni izidi dejanskih preverjanj in dodan neposredni test vseh predpon formul; sprejemni pogoji ostajajo nespremenjeni.
