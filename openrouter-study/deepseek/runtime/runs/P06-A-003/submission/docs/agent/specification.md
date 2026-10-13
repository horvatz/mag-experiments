# P06: Nastavljiv izvoz CSV – specifikacija

## Problem in kontekst

Uporabnik v projektu Folio želi opravila trenutnega projekta izvoziti v CSV
datoteko ter pri tem izbrati stolpce, filter stanja in ločilo. Izhodiščna
aplikacija prikazuje projekte, preglednico in tablo, vendar izvoza ne ponuja.
Sprememba doda samo odjemalske kontrole in prenos datoteke; podatke bere
obstoječi javni API `/api/` (beri po `id`), vseh zapisovalnih poti ne uvaja.
Izvoz je vezan na trenutni projekt in se ob menjavi projekta ali osvežitvi
ponastavi.

## Vhodi, dejanja in izidi

- Vhod: `Task[]` trenutnega projekta iz `GET /api/projects/:id/tasks`, v
  izvornem vrstnem redu strežnika. Polja: `id`, `projectId`, `title`, `status`
  (`todo | in_progress | done`), `assignee`, `dueDate` (`YYYY-MM-DD`),
  `description`.
- Dejanja: potrditev/odklop checkboxa `Stolpec <ime>`; izbira `Ločilo CSV`
  (`;` ali `,`); izbira `Filter izvoza` (`all`, `todo`, `in_progress`, `done`);
  klik na `Izvozi CSV`; preklop pogleda Preglednica/Tabla; menjava projekta;
  osvežitev strani.
- Uspeh: brskalnik prenese `folio-<projectId>.csv` z UTF-8 BOM, izbranimi
  stolpci v nespremenljivem vrstnem redu in filtriranimi vrsticami. Nobena
  zahteva se ne pošlje na strežnik (razen obstoječih branj GET), nobeno opravilo
  se ne spremeni.
- Preklic/neuspeh: če ni izbranih stolpcev ali ni ustreznih vrstic (prazen
  projekt oz. prazen filtrirani rezultat), je gumb `Izvozi CSV` onemogočen in
  prenosa ni. Napake branja ostanejo v obstoječem `LoadError` toku.

## Zahteve in pravila

Simbologi: `T` = opravila trenutnega projekta v izvornem vrstnem redu,
`C ⊆ {id, projectId, title, status, assignee, dueDate, description}` izbrani
stolpci, `ord` = fiksni vrstni red iz R02, `F` = filter, `S ∈ {;,}` ločilo,
`rows = (F = all ? T : [t ∈ T | t.status = F])`, `q(v)` = navedena in
formulno nevtralizirana vrednost. Predpostavke: polja so vedno prisotna in
tipizirana; `projectId` vsebuje le črke, številke in vezaje.

- R01: ob prvem prikazu je `C = vse`, `F = all`, `S = ;`, izvoz zajame `T` v
  izvornem vrstnem redu.
- R02: `C` je izbira med sedmimi dovoljenimi stolpci; glava in vrednosti
  sledijo `ord`, neodvisno od vrstnega reda klikov.
- R03: `enabled ⇔ |C| > 0 ∧ |rows| > 0`; onemogočen gumb ne ustvari prenosa,
  ponoven izbor stolpca ga ob ustreznih vrsticah spet omogoči.
- R04: `F` vpliva samo na `rows`, prikaz projekta ostane `T`; `|rows| = 0`
  onemogoči izvoz.
- R05: ime datoteke `folio-<projectId>.csv`, vsebina se začne z U+FEFF, prenos
  poteka prek odjemalca (Blob URL), brez nove strani in brez pošiljanja vsebine.
- R06: `S` je `;` ali `,`; vsaka glava in vsaka vrednost je obdana z `"`;
  notranji `"` se podvoji (`""`).
- R07: vrstice so ločene s CRLF in tudi zadnja se konča s CRLF; `S`, CR in LF
  znotraj vrednosti ostanejo v navedeni vrednosti.
- R08: če se izvirni niz po poljubnih začetnih znakih `[ \t\r\n]` začne z
  `=`, `+`, `-` ali `@`, se na sam začetek izvirnega niza doda `'`; drugače se
  niz ne spremeni. Pravilo velja za vrednosti vseh podatkovnih stolpcev, ne za
  glavo.
- R09: vrednosti se izvozijo nespremenjene (Unicode, presledki, opisi, ločila),
  razen R08; `status` je interna vrednost, `dueDate` izvirni `YYYY-MM-DD`.
- R10: preklop pogleda ohrani `C`, `S`, `F`; isti `C`, `S`, `F` in `T` dajo v
  obeh pogledih enake bajte.
- R11: menjava projekta in osvežitev ponastavita `C`, `S`, `F` na privzete
  vrednosti; vsak naslednji izvoz odraža trenutne nastavitve.
- R12: izvoz in kontrole ne spreminjajo opravil, izvornih polj ali bralnih
  funkcij; ni zapisovalnih klicev API; videz Folio ostane prilagodljiv
  (na 390 px ni vodoravnega prelivanja strani, notranji drsniki ostanejo).

| Zahteva | Pravilo oziroma sprejemni pogoj | Način preverjanja |
| --- | --- | --- |
| R01 | privzete vrednosti in izvorni vrstni red | D01 + A01 |
| R02 | fiksni `ord` neodvisno od klikov | A02 |
| R03 | `enabled ⇔ |C| > 0 ∧ |rows| > 0`, brez prenosa | A03 |
| R04 | filter omeji le `rows`, prikaz nespremenjen, prazen rezultat onemogoči | D02, A04 |
| R05 | ime, BOM, prenos brez strežnika | D01, A05 |
| R06 | ločilo in podvajanje narekovajev | D02, A06 |
| R07 | CRLF tudi na koncu, vsebina vrednosti ohranjena | D01, A06 |
| R08 | nevtralizacija formul na začetku po presledkih | D03, A07 |
| R09 | Unicode in izvorne vrednosti | D03, A06 |
| R10 | ohranjene nastavitve in enaki bajti med pogledoma | D04, A08 |
| R11 | ponastavitev ob projektu/osvežitvi | A09 |
| R12 | brez zapisov in prelivanja | D04, A05, A10 |

## Izvedba in sledljivost

| Zahteva | Pogoj | Test ali scenarij | Datoteka in del kode | Izid ter dokaz |
| --- | --- | --- | --- | --- |
| R01 | privzetki | D01, A01 | `src/CsvExport.tsx` (začetno stanje) | glej `docs/agent/verification.md` |
| R02 | `ord` | A02 | `src/csv.ts` (`exportColumns`, `buildCsv`) | glej `verification.md` |
| R03 | onemogočen gumb | A03 | `src/CsvExport.tsx` (`enabled`) | glej `verification.md` |
| R04 | filter | D02, A04 | `src/csv.ts` (`filterTasks`), `src/CsvExport.tsx` | glej `verification.md` |
| R05 | prenos | D01, A05 | `src/CsvExport.tsx` (`download`) | glej `verification.md` |
| R06 | narekovaji | D02, A06 | `src/csv.ts` (`quoteValue`) | glej `verification.md` |
| R07 | CRLF | D01, A06 | `src/csv.ts` (`buildCsv`) | glej `verification.md` |
| R08 | nevtralizacija | D03, A07 | `src/csv.ts` (`neutralizeFormula`) | glej `verification.md` |
| R09 | Unicode | D03, A06 | `src/csv.ts` (`buildCsv`) | glej `verification.md` |
| R10 | pogleda | D04, A08 | `src/CsvExport.tsx` (stanje v `ProjectView`) | glej `verification.md` |
| R11 | ponastavitev | A09 | `key={project.id}` v `src/App.tsx` | glej `verification.md` |
| R12 | brez zapisov | D04, A05, A10 | `src/CsvExport.tsx` (brez API klicev) | glej `verification.md` |

## Odprta vprašanja in omejitve

- Razporeditev novih kontrol in besedila, ki niso določena, so izbrana prosto
  (skupina `Izvoz CSV` nad preglednico/table).
- Končni zunanji testi niso dostopni; preverjanje temelji na skupnih razvojnih
  testih in lastnih testih v `tests/agent/`. Neizvedeni testi niso označeni kot
  uspešni.
- Testne kontrole `/__test/` uporabljajo samo testi; aplikacija bere izključno
  `/api/`.

## Zgodovina sprememb specifikacije

- 2026-10-10: prva različica pred implementacijo.
