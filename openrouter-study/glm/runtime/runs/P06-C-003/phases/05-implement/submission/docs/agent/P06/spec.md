# P06 — Nastavljiv izvoz CSV

## Problem in kontekst

Folio že prikazuje projekte in njihova opravila v preglednici ali tabi ter podrobnosti posameznega opravila. Uporabnik potrebuje izvoz opravil trenutnega projekta v CSV z izbiro kolon, ločila in statusnega filtra. Izvoz ne spreminja podatkov na strežniku in ostaja zvest potrjenemu videzu Folio.

## Vhodi, dejanja in izidi

- Podatkovni vir sta obstoječi odgovora `GET /api/projects` in `GET /api/projects/:id/tasks`; projekt se izbere po `id`.
- Izvozne kolone so `id`, `projectId`, `title`, `status`, `assignee`, `dueDate` in `description`. Vsaka ima checkbox z dostopnim imenom `Stolpec <ime>`.
- Ločilo se izbere s selectom `Ločilo CSV` med `;` in `,`. Filter se izbere s selectom `Filter izvoza` med `all`, `todo`, `in_progress` in `done`.
- Gumb `Izvozi CSV` je omogočen samo, ko je izbrana vsaj ena kolona in obstaja vsaj ena vrstica po filtru.
- Uspešno dejanje prenese datoteko `folio-<projectId>.csv` z vsebino iz spodnjih pravil. Izid je enak v pogledih Preglednica in Tabla.
- Napaka nalaganja opravil pusti obstoječe obvestilo in ponovni poskus. Izvoz takrat ni na voljo.

## Pravila sprememb stanja

### Privzeto stanje

Za trenutni projekt `p` ob prvem prikazu in po osvežitvi strani:

- `S(p) = [id, projectId, title, status, assignee, dueDate, description]`
- `D(p) = ;`
- `F(p) = all`
- `T(p) = tasks(GET /api/projects/p.id/tasks)`

Menjava projekta ali osvežitev ponastavi `S`, `D` in `F` na privzete vrednosti. Stanje je lokalno za trenutni projekt in se ne shranjuje v URL, `localStorage` ali na strežnik.

### Prehodi

- Sprememba checkboxa spremeni le `S`. Vrstni red izvoznih kolon ostane nespremenljiv.
- Sprememba selecta spremeni le `D` oziroma `F`.
- Preklop med Preglednica in Tabla ter odpiranje in zapiranje podrobnosti ne spremenita `S`, `D` ali `F`.
- Izvoz spremeni le preneseno datoteko. Ne spremeni `T`, `S`, `D`, `F`, opravil, izvornih polj, obstoječih bralnih funkcij ali prikaza celotnega projekta.

### Pogoji

- `rows(T,F)` so opravila iz `T`, katerih `status` je enak `F`; za filter `all` so to vsa opravila v izvornem vrstnem redu.
- `exportEnabled = S ≠ ∅ ∧ rows(T,F) ≠ ∅`.
- `C = [id, projectId, title, status, assignee, dueDate, description]`.
- `selectedColumns` so elementi `C ∩ S` v vrstnem redu `C`, ne glede na vrstni red klikov.

## Kodiranje CSV

1. Datoteka se začne z UTF-8 BOM `U+FEFF`.
2. Glava vsebuje imena `selectedColumns` v nespremenljivem vrstnem redu. Vsako ime je med dvojnimi narekovaji.
3. Vrstice so `rows(T,F)` v izvornem vrstnem redu.
4. Vrednosti so izvorne vrednosti opravila: `status` kot interna vrednost in `dueDate` kot izvirni `YYYY-MM-DD`.
5. Pred navedbo podatkovne vrednosti velja nevtralizacija formule: `sanitize(v)` doda apostrof na sam začetek izvirnega niza natanko tedaj, ko `v` ustreza `^[ \t\r\n]*[=+\-@]`; sicer je `sanitize(v)` enak `v`.
6. Apostrof se doda pred CSV navedbo in pravilo ne velja za glavo.
7. CSV navedba podvoji vsak notranji dvojni narekovaj ter obdaja rezultat z dvojnim narekovajem.
8. Vrstice loči `CRLF`. Tudi zadnja vrstica se konča s `CRLF`. Ločila, tabulatorji in prelomi vrstic v vrednostih ostanejo znotraj pravilno navedenih polj.
9. Vsebina je UTF-8. Šumniki, drugi Unicode znaki, presledki, ločila in vsebina opisov ostanejo ohranjeni, razen izrecne nevtralizacije formul.
10. Prenos ne odpre nove strani in ne pošlje vsebine na strežnik.

## Zahteve in pravila

| Zahteva | Pravilo oziroma sprejemni pogoj | Način preverjanja |
| --- | --- | --- |
| R01 | Izvorni vrstni red in privzete vrednosti | A01: default export uses source order, BOM and CRLF | `src/export.ts`: `filterTasks`, `buildCsv`; `src/App.tsx`: `ProjectView` | Pass — `npm test`: 54/54 |
| R02 | Nespremenljiv vrstni red izbranih kolon | A02: column order is fixed and empty selection disables export | `src/export.ts`: `EXPORT_COLUMNS`, `selectedExportColumns`; `src/CsvExportControls.tsx` | Pass — `npm test`: 54/54 |
| R03 | Onemogočen izvoz brez izbranih kolon in ponovna omogočitev | A02: column order is fixed and empty selection disables export | `src/CsvExportControls.tsx`: `exportDisabled`, `toggleColumn` | Pass — `npm test`: 54/54 |
| R04 | Filter omejuje izvožene vrstice; prazen rezultat onemogoči izvoz | A03: filters limit rows while the full project stays visible; A03b: an empty filtered result disables export | `src/export.ts`: `filterTasks`; `src/CsvExportControls.tsx`: `exportDisabled` | Pass — `npm test`: 54/54 |
| R05 | Ime datoteke, UTF-8 BOM, lokalni prenos in brez strežniške vsebine | A01 in A07 | `src/export.ts`: `BOM`, `downloadCsv`; `src/CsvExportControls.tsx` | Pass — `npm test`: 54/54 |
| R06 | Nastavljivo ločilo in CSV navedba z dvojnimi narekovaji | A04: separators, quotes, formulas and Unicode are encoded | `src/export.ts`: `quoteCsvValue`; `src/CsvExportControls.tsx`: delimiter select | Pass — `npm test`: 54/54 |
| R07 | CRLF med vrsticami, vključno z zadnjo, in ohranjeni prelomi v vrednostih | A01 in A04 | `src/export.ts`: `LINE_ENDING`, `buildCsv` | Pass — `npm test`: 54/54 |
| R08 | Nevtralizacija formul v podatkovnih vrednostih | A04: separators, quotes, formulas and Unicode are encoded | `src/export.ts`: `FORMULA_PREFIX`, `neutralizeFormula` | Pass — `npm test`: 54/54 |
| R09 | Ohranitev Unicode, interne vrednosti statusa in izvirnega datuma | A01 in A04 | `src/export.ts`: `buildCsv`; `tests/agent/P06/export-csv.spec.ts` | Pass — `npm test`: 54/54 |
| R10 | Preklop pogleda ohrani nastavitve in ustvari enake bajte | A05: view switch preserves settings and produces identical bytes | `src/App.tsx`: `ProjectView` state; `src/CsvExportControls.tsx` | Pass — `npm test`: 54/54 |
| R11 | Menjava projekta ponastavi nastavitve; zaporedni izvozi odražajo trenutne | A06: project change resets defaults and later exports reflect settings | `src/App.tsx`: `<ProjectView key={project.id}>`, export state | Pass — `npm test`: 54/54 |
| R12 | Brez stranskih učinkov na opravila, polja, bralne poti in obstoječe oznake | A07: export remains read-only and preserves interface hooks | `src/App.tsx`; `src/CsvExportControls.tsx`; `tests/agent/P06/export-csv.spec.ts` | Pass — `npm test`: 54/54 |

## Izvedba in sledljivost

| Zahteva | Pogoj | Test ali scenarij | Datoteka in del kode | Izid ter dokaz |
| --- | --- | --- | --- | --- |
| R01 | Izvorni vrstni red in privzete vrednosti | A01: default export uses source order, BOM and CRLF | `src/export.ts`: `filterTasks`, `buildCsv`; `src/App.tsx`: `ProjectView` | Pass — `npm test`: 54/54 |
| R02 | Nespremenljiv vrstni red izbranih kolon | A02: column order is fixed and empty selection disables export | `src/export.ts`: `EXPORT_COLUMNS`, `selectedExportColumns`; `src/CsvExportControls.tsx` | Pass — `npm test`: 54/54 |
| R03 | Onemogočen izvoz brez izbranih kolon in ponovna omogočitev | A02: column order is fixed and empty selection disables export | `src/CsvExportControls.tsx`: `exportDisabled`, `toggleColumn` | Pass — `npm test`: 54/54 |
| R04 | Filter omejuje izvožene vrstice; prazen rezultat onemogoči izvoz | A03: filters limit rows while the full project stays visible; A03b: an empty filtered result disables export | `src/export.ts`: `filterTasks`; `src/CsvExportControls.tsx`: `exportDisabled` | Pass — `npm test`: 54/54 |
| R05 | Ime datoteke, UTF-8 BOM, lokalni prenos in brez strežniške vsebine | A01 in A07 | `src/export.ts`: `BOM`, `downloadCsv`; `src/CsvExportControls.tsx` | Pass — `npm test`: 54/54 |
| R06 | Nastavljivo ločilo in CSV navedba z dvojnimi narekovaji | A04: separators, quotes, formulas and Unicode are encoded | `src/export.ts`: `quoteCsvValue`; `src/CsvExportControls.tsx`: delimiter select | Pass — `npm test`: 54/54 |
| R07 | CRLF med vrsticami, vključno z zadnjo, in ohranjeni prelomi v vrednostih | A01 in A04 | `src/export.ts`: `LINE_ENDING`, `buildCsv` | Pass — `npm test`: 54/54 |
| R08 | Nevtralizacija formul v podatkovnih vrednostih | A04: separators, quotes, formulas and Unicode are encoded | `src/export.ts`: `FORMULA_PREFIX`, `neutralizeFormula` | Pass — `npm test`: 54/54 |
| R09 | Ohranitev Unicode, interne vrednosti statusa in izvirnega datuma | A01 in A04 | `src/export.ts`: `buildCsv`; `tests/agent/P06/export-csv.spec.ts` | Pass — `npm test`: 54/54 |
| R10 | Preklop pogleda ohrani nastavitve in ustvari enake bajte | A05: view switch preserves settings and produces identical bytes | `src/App.tsx`: `ProjectView` state; `src/CsvExportControls.tsx` | Pass — `npm test`: 54/54 |
| R11 | Menjava projekta ponastavi nastavitve; zaporedni izvozi odražajo trenutne | A06: project change resets defaults and later exports reflect settings | `src/App.tsx`: `<ProjectView key={project.id}>`, export state | Pass — `npm test`: 54/54 |
| R12 | Brez stranskih učinkov na opravila, polja, bralne poti in obstoječe oznake | A07: export remains read-only and preserves interface hooks | `src/App.tsx`; `src/CsvExportControls.tsx`; `tests/agent/P06/export-csv.spec.ts` | Pass — `npm test`: 54/54 |

Dokazi so zapisani pri posamičnih zahtevah zgoraj in v `docs/agent/verification.md`. Izidi so veljavni za zagon `npm test`, pri katerem je uspelo 54 od 54 testov.

## Odprta vprašanja in omejitve

- Bistvena nejasnost ni odkrita. Podrobnosti, ki jih izvirne zahteve ne določajo, kot sta natančna postavitev novih kontrol in besedilo ob njih, ostajajo v okviru potrjenega dizajna Folio.
- Sočasne spremembe podatkov med nezaključenim nalaganjem niso razširjene prek obstoječih regresijskih zahtev, ker jih izvirna naloga izrecno ne širi.
- Ne dodajamo novih odvisnosti, zapisovalnih API-jev, strežniških sprememb, trajne shrambe ali zunanjih meritev.
