# P06 – Razvojna specifikacija: Nastavljiv izvoz CSV

## Problem in kontekst

Uporabnik v pregledu projekta Folio želi izvoziti opravila trenutnega projekta v
CSV datoteko, ki jo lahko odpre v preglednici, pri tem pa sam izbere stolpce,
filtriranje po stanju in ločilo. Izhodiščna aplikacija tega ne ponuja: prikazuje
projekt, povzetek stanj, preglednico/tablo in podrobnosti opravila, bere pa samo
`/api/projects`, `/api/projects/:id/tasks` in `/api/tasks/:id`. Izvoz se doda kot
nov, izključno bralni del uporabniškega vmesnika, brez novih API klicev in brez
sprememb obstoječih pogledov.

## Vhodi, dejanja in izidi

Vhodi: seznam opravil trenutnega projekta iz obstoječega javnega API-ja (v
vrstnem redu, kot ga vrne strežnik), polja `id`, `projectId`, `title`, `status`,
`assignee`, `dueDate`, `description`; uporabnikove nastavitve izvoza.

Dejanja: izbira/praznjenje potrditvenih polj `Stolpec <ime>`; izbira v
`Filter izvoza` (`all`, `todo`, `in_progress`, `done`); izbira v `Ločilo CSV`
(`;`, `,`); klik na `Izvozi CSV`; preklop pogleda Preglednica/Tabla; menjava
projekta; osvežitev strani.

Izidi ob uspehu: brskalnik prenese datoteko `folio-<projectId>.csv` z UTF-8 BOM,
vsebino po pravilih R01–R09 in brez stranskih učinkov na podatke (R12). Ob
praznem izboru stolpcev ali praznem filtriranem rezultatu je gumb onemogočen in
prenosa ni (R03, R04). Preklic: uporabnik ne klikne gumba, stanje nastavitev
ostane nespremenjeno. Napaka pri branju opravil je že obstoječe stanje
`LoadError`; izvoz se v tem primeru ne prikaže.

## Zahteve in pravila

Simbologi: `T` = opravila trenutnega projekta v vrstnem redu API; `S ⊆ K` izbrani
stolpci iz `K = [id, projectId, title, status, assignee, dueDate, description]`;
`sep ∈ {";", ","}`; `F ∈ {all, todo, in_progress, done}`; `rows(F) = T` če
`F = all`, sicer `{t ∈ T : t.status = F}`. `q(x) = '"' + x.replace(/"/g, '""') +
'"'`. `n(x)`: če velja `x ∈ {presledek, tab, CR, LF}* · {=, +, -, @} · Σ*`, je
`n(x) = "'" + x`, sicer `n(x) = x`. `csv = U+FEFF + Σ_{r ∈ [glava, ...rows(F)]}
(Σ_{c ∈ S} q(v(r,c)) z ločilom sep) + CRLF`, kjer je `v(glava,c) = c` (brez
nevtralizacije) in `v(opravilo,c) = n(String(t[c]))`. Izvoz je dovoljen natanko
tedaj, ko velja `S ≠ ∅ ∧ rows(F) ≠ ∅` (za prazen projekt torej ni dovoljen).

Splošna pravila (veljajo za vsak projekt in vsak nabor podatkov):

| Zahteva | Pravilo oziroma sprejemni pogoj | Način preverjanja |
| --- | --- | --- |
| R01 | `rows(F)` v izvornem vrstnem redu API; privzeto `S = K`, `F = all`, `sep = ";"`. | Razvojni D01; agentni test privzetih vrednosti in vrstnega reda. |
| R02 | Stolpce je mogoče vključiti/izključiti; glava in vrednosti so vedno v vrstnem redu `K`, neodvisno od vrstnega reda klikov. | Razvojni D02; agentni test klikov v obratnem vrstnem redu. |
| R03 | `S = ∅ ⇒` gumb onemogočen, brez prenosa; ponovni izbor stolpca gumb omogoči, ko `rows(F) ≠ ∅`. | Agentni test. |
| R04 | Filter omeji samo vrstice izvoza, ne prikaza; `rows(F) = ∅` ali prazen projekt onemogoči gumb. | Agentni test (prazen projekt, filter brez zadetkov, prikaz nespremenjen). |
| R05 | Prenos datoteke `folio-<projectId>.csv`, ki se začne z U+FEFF; brez navigacije in brez pošiljanja vsebine na strežnik. | Razvojni D01/D04; agentni test imena, BOM in odsotnosti zapisov. |
| R06 | `sep` nastavljiv; vsaka glava in vrednost sta `q(...)`; notranji `"` se podvoji. | Razvojni D02/D03; agentni test obeh ločil. |
| R07 | Vrstice ločene s CRLF, tudi zadnja; ločila/prelomi v vrednostih ostanejo znotraj navedene vrednosti. | Razvojni D01/D03; agentni test CRLF in večvrstičnega opisa. |
| R08 | Za vse podatkovne stolpce velja `n(x)`; glava se ne nevtralizira. | Razvojni D03; agentni test vseh štirih predznakov, tudi za začetnim presledkom/tab/CR/LF. |
| R09 | Šumniki, Unicode, presledki in opisi ostanejo; `status` je interna vrednost, `dueDate` izvirni `YYYY-MM-DD`. | Razvojni D03; agentni test z Unicode in neformatiranim datumom. |
| R10 | Preklop pogleda ohrani `S`, `sep`, `F`; isti nastavitvi dasta iste bajte. | Razvojni D04; agentni test obeh smeri preklopa. |
| R11 | Menjava projekta in osvežitev ponastavita `S`, `sep`, `F` na privzete; vsak izvoz odraža trenutne nastavitve. | Agentni test. |
| R12 | Izvoz ne spreminja opravil, izvornih polj in bralnih funkcij; nobenih zapisov na API; videz Folio ostane; pri 390 px ni vodoravnega prelivanja strani. | Razvojni D04 (`readonly`); agentni test mobilne širine in stanja strežnika. |

Posamezni testni primeri so instance teh pravil; razvojni primeri D01–D04 niso
celoten obseg (npr. ne pokrijejo R03, R04 s praznim rezultatom, R11 in vseh
predznakov R08).

## Izvedba in sledljivost

| Zahteva | Pogoj | Test ali scenarij | Datoteka in del kode | Izid ter dokaz |
| --- | --- | --- | --- | --- |
| R01 | privzeti `S`, `F`, `sep`, vrstni red | D01; A01 | `src/CsvExport.tsx` (stanje), `src/csv.ts` (buildCsv) | glej `docs/agent/verification.md` |
| R02 | fiksni vrstni red | D02; A02 | `src/csv.ts` (`CSV_COLUMNS`), `src/CsvExport.tsx` | glej verification |
| R03 | onemogočen izvoz | A03 | `src/CsvExport.tsx` (`canExport`) | glej verification |
| R04 | filter omeji vrstice | A04 | `src/csv.ts` (`selectRows`) | glej verification |
| R05 | BOM, ime, brez navigacije | D01; A05 | `src/csv.ts`, `src/CsvExport.tsx` (`downloadCsv`) | glej verification |
| R06 | citiranje in ločilo | D02; A06 | `src/csv.ts` (`quote`) | glej verification |
| R07 | CRLF | D01; A07 | `src/csv.ts` | glej verification |
| R08 | nevtralizacija formul | D03; A08 | `src/csv.ts` (`neutralizeFormula`) | glej verification |
| R09 | ohranjeni znaki | D03; A09 | `src/csv.ts` | glej verification |
| R10 | ohranitev nastavitev ob preklopu | D04; A10 | `src/App.tsx` (ProjectView ni ponovno postavljen) | glej verification |
| R11 | ponastavitev ob projektu/osvežitvi | A11 | `src/App.tsx` (`key={project.id}`), `src/CsvExport.tsx` | glej verification |
| R12 | brez zapisov, videz, 390 px | D04; A12 | `src/CsvExport.tsx`, `src/styles.css` | glej verification |

## Odprta vprašanja in omejitve

- Razvojni testi tečejo na vratih 5174/3102 in Chromium prek `wsEndpoint`;
  končni ocenjevalni testi niso dostopni, zato so navedeni le lastni in razvojni
  rezultati.
- Stanje nastavitev je lokalno trenutnemu projektu (brez trajne shrambe in brez
  URL-ja), skladno z navodili; zato osvežitev in menjava projekta ponastavita.
- Nevtralizacija velja za celoten niz, tudi če je prazen ali samo presledki
  (takrat se ne spremeni, ker ni predznaka).
- Razporeditev in besedila kontrol niso predpisana; uporabljeni so obstoječi
  gradniki in slogovne spremenljivke Folio.

## Zgodovina sprememb specifikacije

- 2026-10-09: prva različica (R01–R12, predikati, načrt preverjanja).
