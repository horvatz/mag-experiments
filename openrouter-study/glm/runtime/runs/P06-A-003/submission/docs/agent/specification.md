# Specifikacija P06: nastavljiv izvoz CSV

## Problem in kontekst

Folio prikazuje opravila izbranega projekta v preglednici ali tabli. Uporabnik potrebuje ponovljiv, varn izvoz teh opravil v CSV brez spreminjanja podatkov ali celotnega vmesnika.

## Vhodi, dejanja in izidi

- Vhod so obstoječi podatki `Task` iz `/api/projects/:id/tasks` v izvornem vrstnem redu.
- Nova stanja so: izbrane kolone (`id`, `projectId`, `title`, `status`, `assignee`, `dueDate`, `description`), ločilo (`;` ali `,`) in filter (`all`, `todo`, `in_progress`, `done`).
- Dejanje `Izvozi CSV` ustvari datoteko `folio-<projectId>.csv` z UTF-8 BOM in prenese jo v trenutnem zavihku.
- Brez izbrane kolone ali brez vrstic po filtru je izvoz onemogočen in ne ustvari prenosa.

## Zahteve in pravila

| Zahteva | Pravilo oziroma sprejemni pogoj | Način preverjanja |
| --- | --- | --- |
| R01 | `rows = tasks ∧ filter = all ∧ selected = all ∧ separator = ";"`; vrstice in kolone sledijo nespremenljivemu vrstnem redu. | Test privzetega izvoza in zapisov. |
| R02 | `∀ selected ⊆ C: header = [c ∈ C : c ∈ selected]` in vrednosti sledijo `C = [id, projectId, title, status, assignee, dueDate, description]`. | Test izbiranja v obratnem zaporedju. |
| R03 | `selected = ∅ ∨ filteredRows = ∅ ⇒ button.disabled ∧ no download`. | Test onemogočenja in ponovne omogočitve. |
| R04 | `filter = all ∨ status` omeji samo `rows`; prikaz `tasks` ostane nespremenjen; prazen rezultat onemogoči izvoz. | Test filtra in štetja prikazanih opravil. |
| R05 | Ime datoteke je `folio-<projectId>.csv`; začetek je U+FEFF; izvoz ne odpre strani in ne pošlje zahteve na strežnik. | Test prenosa, BOM in odsotnosti API zapisov. |
| R06 | `separator ∈ {";", ","}`; vsaka glava in vrednost je v narekovajih; `"` v vrednosti se zapiše kot `""`. | Enotski test generatorja in prebrališčni test. |
| R07 | Zapisi se ločijo s CRLF, tudi zadnji; CRLF v vrednostih ostane znotraj navedenega vrednosti. | Enotski test generatorja. |
| R08 | Za podatkovne vrednosti velja `^[ \t\r\n]*[=+\-@].* ⇒ "'" + original`; glava se ne nevtralizira. | Enotski test generatorja. |
| R09 | Izvoz uporabi izvirne Unicode nize, interno `status` in izvirni `dueDate`; brez lokalizacije ali spreminjanja vsebine. | Enotski test generatorja in prebrališčni test. |
| R10 | `view ∈ {table, board}` ne vpliva na nastavitve izvoza; enake nastavitve ustvarijo enake bajte. | Test enakosti izvoza v obeh pogledih. |
| R11 | Sprememba projekta ali osvežitev nastavi `selected = C`, `separator = ";"`, `filter = "all"`. | Test projekta in ponovnega nalaganja. |
| R12 | Izvoz ne kliče zapisovalnega API-ja in ne spreminja opravil, izvornih polj ali bralnih funkcij. | Test odsotnosti zapisov ter obstoječih razvojnih preverjanj. |

## Izvedba in sledljivost

| Zahteva | Pogoj | Test ali scenarij | Datoteka in del kode | Izid ter dokaz |
| --- | --- | --- | --- | --- |
| R01–R09 | Natančna oblika CSV | `tests/agent/csv.spec.ts` (enotski testi) | `src/csv.ts` | Uspešno: 3/3 enotski testi so uspešno izvedeni. |
| R01–R05, R10–R12 | Vmesnik, prenosi, stanje, bralnost | `tests/agent/ui.spec.ts` | `src/App.tsx`, `src/styles.css` | Uspešno: 5/5 prebrališčni testi so uspešno izvedeni. |

## Odprta vprašanja in omejitve

- Trajne shrambe ali URL-parametrov za izvozne nastavitve niso zahtevani.
- Končni testi lahko uporabijo poljubne veljavne podatke znotraj opisane domene; lastni testi pokrijo reprezentativen neodvisen del.
- Rezultati preverjanj so zapisani v `docs/agent/verification.md`.

## Zgodovina sprememb

- 2026-10-10: Prva različica specifikacije za R01–R12.
- 2026-10-10: Dopolnjena sledljivost z dejanskimi izidi lastnih testov.
