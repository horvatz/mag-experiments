# Specifikacija P06: nastavljiv izvoz CSV

## Problem in kontekst

Folio trenutno prikazuje opravila izbranega projekta v preglednici in tabli. Uporabnik potrebuje izvoz teh opravil v CSV z nadzorom nad stolpci, ločilom in filtrom, ne da bi pri tem spreminjal podatke ali odpiral novo stran.

## Vhodi, dejanja in izidi

- Vhodi so obstoječi odgovori `/api/projects/:id/tasks` s polji `id`, `projectId`, `title`, `status`, `assignee`, `dueDate`, `description`.
- Nova nastavitvena stanja so trenutna za izbrani projekt: izbrana množica stolpcev, ločilo `;` ali `,` ter filter `all`, `todo`, `in_progress` ali `done`.
- Dejanji sta prilagajanje nastavitev in izvoz s klikom na `Izvozi CSV`.
- Uspešen izvoz prenese datoteko `folio-<projectId>.csv` z UTF-8 BOM in ne spremeni podatkov.
- Izvoz je onemogočen, kadar ni izbran noben stolpec ali ni vrstic po filtru.

## Zahteve in pravila

| Zahteva | Pravilo oziroma sprejemni pogoj | Način preverjanja |
| --- | --- | --- |
| R01 | Za projekt `p` velja `exportTasks(tasks,p) = filterStatus(tasks,filter) ∧ izbor stolpcev ⊆ dovoljeni stolpci ∧ separator = ;` ob privzeti nastavitvi. | Playwright preveri privzeti imenik datoteke, glavo in vse vrstice v izvornem vrstnem redu. |
| R02 | Dovoljeni stolpci so urejena množica `[id, projectId, title, status, assignee, dueDate, description]`; izvoz vedno uporabi ta vrstni red. | Lastni test izklobi in vklopi stolpce v naključnem zaporedju ter primerja celoten CSV. |
| R03 | `canExport ⇔ selectedColumns ≠ ∅ ∧ filteredTasks ≠ []`; izklopljen gumb ne sproži prenosa. | Lastni test izklopi vse stolpce, preveri `disabled`, ponovno izbere enega in preveri prenos. |
| R04 | `filteredTasks = {t ∈ tasks : filter = all ∨ t.status = filter}`; vmesnik ostane nepopoln, gumb pa je onemogočen pri praznem rezultatu. | Razvojni in lastni testi preverijo `done`, `in_progress`, prazen projekt in prazen filter. |
| R05 | Prenešen je `folio-<projectId>.csv`, vsebina se začne z `U+FEFF`, izvoz poteka lokalno v brskalniku brez navigacije in brez POST/PUT/PATCH/DELETE. | Playwright `download` ter opazovalec zahtevkov preverita ime, BOM in odsotnost zapisov. |
| R06 | Vsak glavi in vrednost: `csvCell = "\"" + value.replaceAll("\"","\"\"") + "\""`, pri ločilu `sep` je neodvisna od njegove vrednosti. | Lastni test z narekovaji, vejico in podpičjem preveri obe ločili. |
| R07 | `csv = BOM + header + CRLF + Σ(row + CRLF)`; nove vrstice ostanejo znotraj navedenih vrednosti. | Razvojni test D01/D03 in lastna Playwright preverjanja A01/A02. |
| R08 | Za vsako vrednost podatkovnega stolpca velja: `if raw ~ /^[\\t\\r\\n ]*[-+=@]/ then raw = "'" + raw`; glave se ne nevtralizirajo. | Lastna Playwright preverjanja A01/A02 pokrijeta predpone s presledki, tabulatorji in prelomi. |
| R09 | Izvoz uporabi izvirni Unicode, interno vrednost `status` in izvirni `YYYY-MM-DD`; ne uporablja prikazanih formatov. | Lastni test s šumniki, CRLF, vezajem, presledki in datumom. |
| R10 | Preklop `table ↔ board` ne spreminja nastavitev; ob enakih nastavitvah sta izvoza po bajtih enaka. | Lastni Playwright test izveže pred in po preklopu ter primerja tekst; razvojni D04. |
| R11 | Sprememba `projectId` ali osvežitev ponastavi izbor vseh stolpcev, `;` in `all`; zaporedna izvoza odražata trenutne nastavitve. | Lastni test spremeni nastavitve, preklopi projekt in primerja privzeti CSV ter zaporedna izvoza. |
| R12 | Izvoz ne pokliče zapisovalnih API-jev, ne spreminja opravil, obstoječih bralnih poti, pogledov, stolpcev ali oznake `Pregled stanj opravil`. | Playwright opazovalec zahtevkov in regresijski/build preverjanja. |

## Izvedba in sledljivost

| Zahteva | Pogoj | Test ali scenarij | Datoteka in del kode | Izid ter dokaz |
| --- | --- | --- | --- | --- |
| R01–R12 | Zgornja pravila | `npm run check`, skupni razvojni testi P06 in lastni testi | `src/csvExport.ts`, `src/App.tsx`, `tests/agent/P06-agent.spec.ts` | Zapis dejanskih rezultatov bo v `docs/agent/verification.md`. |

## Odprta vprašanja in omejitve

- Stanje nastavitev ni trajno shranjeno; to ustreza navodilu, da je stanje lokalno trenutnemu projektu.
- Neprijavljena napaka brskalnika pri ustvarjanju prenašanja ni zajeta s sprejemnimi pogoji.

## Zgodovina popravkov

- 2026-10-30: Lastno preverjanje A02 je odkrilo, da izvoz sledi vrstnemu redu klikov. Implementacija sedaj izbrane stolpce preslika prek nespremenljivega seznama `exportColumns`; sprejemni pogoj R02 se ni spremenil.
