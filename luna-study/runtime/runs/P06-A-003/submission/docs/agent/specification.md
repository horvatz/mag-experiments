# Specifikacija P06: nastavljiv izvoz CSV

## Problem in kontekst

Folio prikazuje opravila trenutno izbranega projekta kot preglednico ali tablo in jih bere prek javnega API-ja. Uporabnik potrebuje lokalni prenos teh opravil kot CSV, pri katerem lahko določi nabor stolpcev, ločilo in statusni filter. Izvoz ne sme spreminjati opravil ali pošiljati njihovih podatkov na strežnik. Obstoječi projekt, vrstni red opravil, pogled in potrjeni videz Folio ostanejo merodajni.

## Vhodi, dejanja in izidi

Vhod so projekti in opravila iz obstoječega `/api/` ter identiteta trenutno izbranega projekta. Za CSV so na voljo `id`, `projectId`, `title`, `status`, `assignee`, `dueDate`, `description` v tem stalnem vrstnem redu. Lokalna kontrolna stanja so izbrane kolone, ločilo `;` ali `,` in filter `all`, `todo`, `in_progress` ali `done`.

Ob začetku projekta in po menjavi projekta so izbrane vse kolone, ločilo `;` in filter `all`. Osvežitev ponovno zažene aplikacijo s temi privzetimi vrednostmi. Preklop pogleda ohrani nastavitve. Prenos je dovoljen natanko tedaj, ko je izbrana vsaj ena kolona in je po filtru vsaj ena vrstica. Uspeh ustvari prenos `folio-<projectId>.csv` z UTF-8 BOM, ne odpre nove strani in ne kliče zapisovalnega API-ja. Brez vrstic ali stolpcev se prenos ne začne. Napake pri branju sledijo obstoječemu ravnanju aplikacije; lokalne nastavitve same ne spreminjajo podatkov.

## Zahteve in pravila

Naj bo `T` seznam opravil izbranega projekta v vrstnem redu API-ja, `C` izbrane kolone po kanoničnem vrstnem redu, `f` filter, `D` ločilo in `T_f = T`, če je `f=all`, sicer stabilni podseznam `T`, katerega status je `f`. Izvoz je omogočen iff `|C| > 0 ∧ |T_f| > 0`. CSV matrika je glava `C` in za vsako opravilo iz `T_f` projekcija vrednosti v `C`. Vsako polje je narekovano; notranji `"` se podvoji; podatkovno vrednost, ki po začetnih presledkih/tabulatorjih/CR/LF začne z `=`, `+`, `-` ali `@`, se pred narekovanjem prefiksira z apostrofom. Vrstice se združijo z `\r\n` in tudi za zadnjo se doda `\r\n`. Prenesena vsebina je `\uFEFF + CSV`. Predpostavka: začetno zaporedje je vrstni red, ki ga obstoječi API-odgovor poda komponenti; status se zapiše kot interna vrednost, datum kot izvorni niz.

| Zahteva | Pravilo oziroma sprejemni pogoj | Način preverjanja |
| --- | --- | --- |
| R01 | Privzeto `f=all`, `D=;`, `C` so vse dovoljene kolone; `T_f` ohranja vrstni red `T`. | UI ter vsebina prenosa z več opravili. |
| R02 | Kolone so izbirne; izvoz sledi kanoničnemu vrstnemu redu ne glede na vrstni red klikanja. | Izbor stolpcev in primerjava glave/vrednosti. |
| R03 | `|C|=0 ⇒ disabled ∧ brez prenosa`; ponovna izbira omogoči prenos, če `|T_f|>0`. | Onemogočen gumb in prenos po ponovni izbiri. |
| R04 | Filter spreminja samo `T_f`; vse `T` ostane vidno. `|T_f|=0 ⇒ disabled`. | Primeri filtrov, prazen projekt in prazen rezultat. |
| R05 | Ime `folio-<projectId>.csv`; bajti se začnejo z U+FEFF; prenos brez navigacije in oddaje vsebine. | Playwright download, ime, bajti in URL. |
| R06 | `D∈{;,}`; vsa polja so obdana z `"`; notranji narekovaji postanejo `""`. | Prenos z obema ločiloma in ubežnimi znaki. |
| R07 | CRLF med vsemi zapisi in po zadnjem; CR/LF in ločila v vrednostih ostanejo znotraj navedbe. | Natančna primerjava prenesene vsebine. |
| R08 | Samo podatkovni niz z začetnimi `[ \t\r\n]*` in nato `[=+\-@]` dobi apostrof na prvem znaku. | Nevarne in običajne začetne vrednosti. |
| R09 | Unicode, presledki in opis se ohranijo; status je interni enum, datum izvorni `YYYY-MM-DD`. | Preverjanje vsebine prenosa. |
| R10 | Sprememba pogleda ne spreminja `(C,D,f)`; ob enakih podatkih in nastavitvah so bajti enaki. | Nastavitve v obeh pogledih, ponovljena vsebina. |
| R11 | Menjava projekta ponastavi `(C,D,f)` na privzeto; zaporedni prenosi odražajo trenutno stanje. | Menjava projekta in več zaporednih izvozov. |
| R12 | Kontrole so samo lokalno stanje; izvoz ne spreminja nobenega opravila, ne kliče zapisovalnega API-ja in ohranja prilagodljiv Folio videz. | Primerjava opravila pred/po, API sledi, odzivni pregled in regresijski testi. |

## Izvedba in sledljivost

Dejanski rezultati končnega preverjanja so v [verification.md](./verification.md).

| Zahteva | Pogoj | Test ali scenarij | Datoteka in del kode | Izid ter dokaz |
| --- | --- | --- | --- | --- |
| R01 | Privzeti `all`, vse kolone in `;`; stabilen vrstni red `T` | D01, agentni test »CSV ohrani polja …« | `src/App.tsx:14-18`, `src/csv.ts:12-18` | Potrjeno v končnem `npm run check`; natančna vsebina izhoda |
| R02 | Izbor se v CSV vedno uredi po `csvColumns` | D02, agentni test »filtri omejijo samo CSV …« | `src/App.tsx:72-75`, `src/csv.ts:12-16` | Potrjeno; klik `title` pred `id` je dal glavo `id,title` |
| R03 | `|C|>0` in obstaja vrstica | Agentni test »filtri omejijo samo CSV …« | `src/App.tsx:18,93` | Potrjeno; gumb onemogočen brez kolone in spet omogočen po izboru |
| R04 | Filter ustvari stabilni podseznam, pogled še kaže `T`; `|T_f|>0` | D02, oba agenta, »menjava projekta …« | `src/App.tsx:17-18,96-109` | Potrjeno; preverjeni so vsi prikazani taski, prazen statusni rezultat in prazen projekt |
| R05 | `folio-<projectId>.csv`, BOM, prenos brez navigacije | D01, agentni test »CSV ohrani polja …« | `src/App.tsx:26-36`, `src/csv.ts:18` | Potrjeno; ime in BOM sta preverjena, hash ostane isti |
| R06 | Vrednosti so narekovane, `"` se podvoji; izbirni ločili | D02–D03, agenta | `src/csv.ts:7-16`, `src/App.tsx:78-83` | Potrjeno z `;`, `,`, citatom in ločilom v vsebini |
| R07 | CRLF med zapisi in po zadnjem; prelomi ostanejo v polju | D03, agentni test »CSV ohrani polja …« | `src/csv.ts:14-18` | Potrjeno z natančno primerjavo vsebine, vključno z notranjim CRLF |
| R08 | Začetni `[ \t\r\n]*[=+\-@]` dobi apostrof | D03, agentni test »CSV ohrani polja …« | `src/csv.ts:7-9` | Potrjeno za `=` po presledku/tabulatorju in `+` po CRLF; sanitizer se uporabi za vsako podatkovno polje |
| R09 | Izvorne vrednosti, Unicode, status in datum ostanejo nespremenjeni | D03, agentni test »CSV ohrani polja …« | `src/csv.ts:7-18` | Potrjeno z Unicode, opisom, internim statusom in datumom `YYYY-MM-DD` |
| R10 | Pogled ne spremeni `(C,D,f)` | D04, agentni test »filtri omejijo samo CSV …« | `src/App.tsx:14-16,63-66` | Potrjeno; primerjava obeh prenosov je enaka |
| R11 | Ključ projekta ponastavi lokalne privzete vrednosti; refresh začne novo stanje | Agentni test »menjava projekta in osvežitev …« | `src/App.tsx:14-16` in `ProjectView key={project.id}` | Potrjeno; po menjavi projekta in osvežitvi se vrnejo privzete vrednosti |
| R12 | Prenos ostane samo bralno dejanje, pogled se prilagodi telefonu | D04, agentni testi, osnovni in mobilni testi | `src/App.tsx:26-36,59-112`, `src/styles.css:60-71,181-185` | Potrjeno; brez zapisov API in brez vodoravnega širjenja dokumenta pri mobilnem naboru |

## Odprta vprašanja in omejitve

Zahteve določajo format prenosa in lokalni obseg stanja; vrstni red projektnih opravil sledi prejetemu API-podatku. Posebno ravnanje pri napaki prenosa brskalnika ni predpisano. Razvojni testi in osnovni testi ne predstavljajo vseh možnih končnih podatkov; dodatni robni primeri so vključeni v lastne teste, preostale omejitve pa so zapisane v `verification.md`.

### Zapis dopolnitev

- 2026-09-27: po preizkusu, ki je odkril vpliv vrstnega reda ponovnega klika, serializer vedno razvrsti izbrane kolone po kanoničnem seznamu. Zahteve niso bile spremenjene.
- 2026-09-27: sledljivost in izidi dopolnjeni po uspešnem celotnem preverjanju; za povzetek dokazov glej `verification.md`.
