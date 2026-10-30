# P06 — Nastavljiv izvoz CSV

**Različica:** 1.0 · **Datum specifikacije:** 2026-10-30

## Problem in kontekst

Folio danes prikazuje opravila izbranega projekta v preglednici in tabli ter podatke bere prek javnega API-ja. Uporabnik potrebuje izvoz teh opravil v CSV, ki spoštuje trenutni projekt, izvor in vrstni red ter omogoča izbor kolon, ločila in statusnega filtra.

Izvoz je izključno bralna funkcionalnost uporabniškega vmesnika. Ne spreminja opravil, ne dodaja zapisovalnih API-jev in ne uvaja nove odvisnosti ali infrastrukture.

## Vhodi, dejanja in izidi

- Podatkovni vir je obstoječi `/api/projects/{projectId}/tasks`. Uporabljena so polja `id`, `projectId`, `title`, `status`, `assignee`, `dueDate` in `description`; vsa so nizi.
- Dovoljene kolone so v nespremenljivem vrstnem redu: `id`, `projectId`, `title`, `status`, `assignee`, `dueDate`, `description`.
- Privzeto stanje ob izbiri projekta ali osvežitvi podatkov: izbrane vse kolone, ločilo `;`, filter `all`.
- Uporabnik lahko preklaplja kolone, izbere ločilo `;` ali `,` ter filter `all`, `todo`, `in_progress` ali `done`.
- Izvoz je omogočen natanko tedaj, ko je izbrana vsaj ena kolona in obstaja vsaj eno opravilo, ki ustreza filteru. Med nalaganjem ali napako API-ja izvoz ni na voljo.
- Uspešno dejanje ustvari lokalni prenos z imenom `folio-{projectId}.csv` in bajti UTF-8 z BOM `U+FEFF`. Vsebina se ne pošlje na strežnik in ne odpre nove strani.
- Preklic ali sprememba nastavitev ne ustvari dela datoteke; vsak klik na izvoz uporabi trenutne nastavitve.

### Pravila spremembe stanja

| Začetno stanje | Dogodek | Pričakovano stanje |
| --- | --- | --- |
| Projekte ali opravila se nalagajo | Nalaganje se zaključi | Privzete vrednosti za trenutni projekt; izvoz omogočen le, če obstajajo ustrezne vrstice |
| Nastavitve izvoza | Uporabnik spremeni kolone, ločilo ali filter | Nastavitve se takoj odrazijo v omogočenosti gumba in prihodnji vsebini |
| Nastavitve izvoza | Preklop med Preglednico in Tablo | Kolone, ločilo in filter se ohranijo |
| Nastavitve izvoza | Menjava projekta ali osvežitev podatkov | Vrnitev na privzete vrednosti |
| Veljavne nastavitve | Klik na Izvozi CSV | Ustvari se prenos; nastavitve in opravila ostanejo nespremenjena |

## Uporabniški scenariji

1. Uporabnik izbere projekt in brez sprememb izvozi CSV: prejme vse kolone v nespremenljivem vrstnem redu, vsa opravila v izvornem vrstnem redu ter privzeto ločilo `;`.
2. Uporabnik odstrne vse kolone: gumb je onemogočen in klik ne ustvari prenosa. Po ponovni izbiri kolone se izvoz znova omogoči, če filtrirani rezultat ni prazen.
3. Uporabnik izbere filter brez ujemanj: vmesnik še vedno prikazuje celoten projekt, izvoz pa je onemogočen.
4. Uporabnik izvozi naslove, opise ali odgovorne osebe z ločili, novo vrstico, narekovaji, šumniki ali začetkom formule: vrednosti ostanejo ohranjene, pravilno navedene in po potrebi nevtralizirane.
5. Uporabnik preklopi pogled ali zamenja projekt: pogled ne spremeni nastavitev, menjava projekta pa jih ponastavi.

## Zahteve in pravila

Splošni predikati:

- `selectedColumns ⊆ allowedColumns`
- `filteredTasks = Filter(tasks, filter)`
- `canExport = selectedColumns ≠ ∅ ∧ filteredTasks ≠ ∅`
- `csvValue(value) = Quote(FormulaNeutral(value))` za podatkovne vrednosti.
- `FormulaNeutral(value)` doda uvodni apostrof na začetek originalnega niza, če se niz po nič ali več začetnih znakih iz množice `{presledek, tabulator, CR, LF}` začne z `=`, `+`, `-` ali `@`; drugače vrednost vrne nespremenjeno.
- `Quote(value)` obda vrednost z dvojnimi narekovaji in podvoji vsak notranji dvojni narekovaj.
- Glava je sestavljena iz imen izbranih kolon v vrstnem redu `allowedColumns`; podatkovne vrstice sledijo vrstnemu redu `filteredTasks`, njihove vrednosti pa vrstnemu redu izbranih kolon.

| Zahteva | Pravilo oziroma sprejemni pogoj | Način preverjanja |
| --- | --- | --- |
| R01 | Trenutni projekt, izvorni vrstni red in privzete nastavitve | `R01 in R02: default export keeps source order and fixed column order` | `tests/agent/csv-export.spec.ts`, `src/csvExport.ts`, `src/App.tsx` | Uspešno: ciljni niz 9/9; celotni `npm run check` 55/55 |
| R02 | Nespremenljivi vrstni red kolon | `R01 in R02: default export keeps source order and fixed column order` | `tests/agent/csv-export.spec.ts`, `src/csvExport.ts`, `src/App.tsx` | Uspešno: ciljni niz 9/9; celotni `npm run check` 55/55 |
| R03 | Onemogočen izvoz brez kolon | `R03: export is disabled without selected columns and recovers` | `tests/agent/csv-export.spec.ts`, `src/App.tsx` | Uspešno: ciljni niz 9/9; celotni `npm run check` 55/55 |
| R04 | Filtriranje in prazen rezultat | `R04: filters export only while UI keeps the whole project`; `R04: empty project disables export` | `tests/agent/csv-export.spec.ts`, `src/csvExport.ts`, `src/App.tsx` | Uspešno: ciljni niz 9/9; celotni `npm run check` 55/55 |
| R05 | Ime, BOM in lokalni prenos | `R05 in R12: download is local, framed, and read-only` | `tests/agent/csv-export.spec.ts`, `src/csvExport.ts` | Uspešno: ciljni niz 9/9; celotni `npm run check` 55/55 |
| R06 | Ločilo, navedba in podvajanje | `R06 do R09: quoting, CRLF, formulas, and Unicode survive` | `tests/agent/csv-export.spec.ts`, `src/csvExport.ts` | Uspešno: ciljni niz 9/9; celotni `npm run check` 55/55 |
| R07 | CRLF in ohranjene vrednosti | `R06 do R09: quoting, CRLF, formulas, and Unicode survive` | `tests/agent/csv-export.spec.ts`, `src/csvExport.ts` | Uspešno: ciljni niz 9/9; celotni `npm run check` 55/55 |
| R08 | Nevtralizacija podatkovnih formul | `R06 do R09: quoting, CRLF, formulas, and Unicode survive` | `tests/agent/csv-export.spec.ts`, `src/csvExport.ts` | Uspešno: ciljni niz 9/9; celotni `npm run check` 55/55 |
| R09 | Unicode, status in datum | `R06 do R09: quoting, CRLF, formulas, and Unicode survive` | `tests/agent/csv-export.spec.ts`, `src/csvExport.ts` | Uspešno: ciljni niz 9/9; celotni `npm run check` 55/55 |
| R10 | Ohranitev nastavitev med pogledi | `R10: both views create identical bytes for the same settings` | `tests/agent/csv-export.spec.ts`, `src/App.tsx` | Uspešno: ciljni niz 9/9; celotni `npm run check` 55/55 |
| R11 | Ponastavitev ob menjavi ali osvežitvi | `R11: project change and refresh reset export settings` | `tests/agent/csv-export.spec.ts`, `src/App.tsx` | Uspešno: ciljni niz 9/9; celotni `npm run check` 55/55 |
| R12 | Brez sprememb podatkov in API-jev | `R05 in R12: download is local, framed, and read-only`; `R12: existing reading contracts remain on a 390px layout` | `tests/agent/csv-export.spec.ts`, `src/App.tsx`, `src/styles.css` | Uspešno: ciljni niz 9/9; celotni `npm run check` 55/55 |

## Izvedba in sledljivost

Izvedba je v `src/App.tsx`, `src/csvExport.ts` in `src/styles.css`. Lastni scenariji bodo v `tests/agent/csv-export.spec.ts`; skupne regresijske teste je treba pognati po implementaciji.

| Zahteva | Pogoj | Test ali scenarij | Datoteka in del kode | Izid ter dokaz |
| --- | --- | --- | --- | --- |
| R01 | Trenutni projekt, izvorni vrstni red in privzete nastavitve | `R01 in R02: default export keeps source order and fixed column order` | `tests/agent/csv-export.spec.ts`, `src/csvExport.ts`, `src/App.tsx` | Uspešno: ciljni niz 9/9; celotni `npm run check` 55/55 |
| R02 | Nespremenljivi vrstni red kolon | `R01 in R02: default export keeps source order and fixed column order` | `tests/agent/csv-export.spec.ts`, `src/csvExport.ts`, `src/App.tsx` | Uspešno: ciljni niz 9/9; celotni `npm run check` 55/55 |
| R03 | Onemogočen izvoz brez kolon | `R03: export is disabled without selected columns and recovers` | `tests/agent/csv-export.spec.ts`, `src/App.tsx` | Uspešno: ciljni niz 9/9; celotni `npm run check` 55/55 |
| R04 | Filtriranje in prazen rezultat | `R04: filters export only while UI keeps the whole project`; `R04: empty project disables export` | `tests/agent/csv-export.spec.ts`, `src/csvExport.ts`, `src/App.tsx` | Uspešno: ciljni niz 9/9; celotni `npm run check` 55/55 |
| R05 | Ime, BOM in lokalni prenos | `R05 in R12: download is local, framed, and read-only` | `tests/agent/csv-export.spec.ts`, `src/csvExport.ts` | Uspešno: ciljni niz 9/9; celotni `npm run check` 55/55 |
| R06 | Ločilo, navedba in podvajanje | `R06 do R09: quoting, CRLF, formulas, and Unicode survive` | `tests/agent/csv-export.spec.ts`, `src/csvExport.ts` | Uspešno: ciljni niz 9/9; celotni `npm run check` 55/55 |
| R07 | CRLF in ohranjene vrednosti | `R06 do R09: quoting, CRLF, formulas, and Unicode survive` | `tests/agent/csv-export.spec.ts`, `src/csvExport.ts` | Uspešno: ciljni niz 9/9; celotni `npm run check` 55/55 |
| R08 | Nevtralizacija podatkovnih formul | `R06 do R09: quoting, CRLF, formulas, and Unicode survive` | `tests/agent/csv-export.spec.ts`, `src/csvExport.ts` | Uspešno: ciljni niz 9/9; celotni `npm run check` 55/55 |
| R09 | Unicode, status in datum | `R06 do R09: quoting, CRLF, formulas, and Unicode survive` | `tests/agent/csv-export.spec.ts`, `src/csvExport.ts` | Uspešno: ciljni niz 9/9; celotni `npm run check` 55/55 |
| R10 | Ohranitev nastavitev med pogledi | `R10: both views create identical bytes for the same settings` | `tests/agent/csv-export.spec.ts`, `src/App.tsx` | Uspešno: ciljni niz 9/9; celotni `npm run check` 55/55 |
| R11 | Ponastavitev ob menjavi ali osvežitvi | `R11: project change and refresh reset export settings` | `tests/agent/csv-export.spec.ts`, `src/App.tsx` | Uspešno: ciljni niz 9/9; celotni `npm run check` 55/55 |
| R12 | Brez sprememb podatkov in API-jev | `R05 in R12: download is local, framed, and read-only`; `R12: existing reading contracts remain on a 390px layout` | `tests/agent/csv-export.spec.ts`, `src/App.tsx`, `src/styles.css` | Uspešno: ciljni niz 9/9; celotni `npm run check` 55/55 |

## Sprejemni pogoji

- Vsi testi, ki pokrivajo R01–R12, so dejansko izvedeni in uspešni.
- Skupni testi izhodišča ostanejo uspešni.
- Nobena zahteva iz `task/instructions.md` ni izpuščena ali razširjena z novimi zunanjimi merljivimi cilji.

## Odprta vprašanja in omejitve

- Bistvenih odprtih vprašanj ni. Nedoločena razporeditev novih kontrol in nepredpisano besedilo ostajata prosto oblikovni odločitvi v okviru Folia.
- Stanje izvoza ni shranjeno v URL ali trajno shrambo; velja za trenutni projekt in se ponastavi ob menjavi projekta ali osvežitvi podatkov.
- Sočasna spreminjanja podatkov brez osvežitve niso del obstoječih regresijskih zahtev in niso razširjena.
- Testi so izvedeni 2026-10-30; rezultati so zapisani v `docs/agent/P06/verification.md`.