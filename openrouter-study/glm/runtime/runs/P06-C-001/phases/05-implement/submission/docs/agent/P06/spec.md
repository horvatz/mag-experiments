# Specifikacija P06: Nastavljiv izvoz CSV

**Različica**: 1.0.0 | **Status**: Specifikacija | **Datum**: 2026-10-09

## Problem in kontekst

Folio omogoča pregled opravil trenutnega projekta v Preglednici in Tabli. Uporabnik potrebuje možnost, da izvoz izključno te opravile prilagodi po kolonah, statusnem filtru in ločilu ter prejme datoteko CSV, ne da bi pri tem spremenil prikaz ali podatke v aplikaciji.

Izhodišče:

- Podatki se berejo prek obstoječega javnega API-ja `/api/projects/:projectId/tasks`.
- Uporabniški vmesnik ohranja potrjen dizajn Folio in obstoječe dostopnostne dogovore.
- Specifikacija ne dodaja novih API-jev, odvisnosti, shrambe ali zunanjih meritev.
- Izvirne zahteve ostajajo merilo; ta dokument jih razlaga, ne nadomešča.

Relevantni dokumenti: [projektna pravila](../../../PROJECT_RULES.md), [izvirne zahteve](../../../task/instructions.md), [skupna predloga](../../../task/specification-template.md), [potrjen dizajn](../../../docs/dizajn.md).

## Vhodi, dejanja in izidi

### Vhodna stanja

- Trenuten projekt `P` z identifikatorjem `projectId`.
- Opravila `T` trenutnega projekta v izvornem vrstnem redu.
- Izbrane kolone `C` kot neurejen podmnožica dovoljenih kolon.
- Ločilo `d` iz množice `{; ,}`.
- Filter `f` iz množice `{all, todo, in_progress, done}`.
- Pogled `v` iz množice `{table, board}`.

### Dovoljena dejanja

- Uporabnik izbere ali odizbere eno ali več kolon.
- Uporabnik izbere ločilo `;` ali `,`.
- Uporabnik izbere filter `all`, `todo`, `in_progress` ali `done`.
- Uporabnik preklopi med Preglednico in Tablo.
- Uporabnik zamenja projekt ali osveži stran.
- Uporabnik klikne gumb `Izvozi CSV`, kadar je omogočen.

### Izidi

- CSV se prenosí kot datoteka `folio-<projectId>.csv`.
- Izvoz vsebuje UTF-8 BOM `U+FEFF` na začetku.
- Izvoz ne spremeni trenutnega prikaza, stanja opravil ali podatkov na strežniku.
- Izvoz ne odpre nove strani.

## Pravila sprememb stanja

Dovoljene kolone imajo nespremenljivi vrstni red:

`id, projectId, title, status, assignee, dueDate, description`

1. **Začetno stanje projekta**: `C = vse dovoljene kolone`, `d = ;`, `f = all`.
2. **Sprememba kolon**: klik na posamezno kolono doda ali odstrani le to kolono iz `C`. Vrstni red izvoza ostane nespremenjen.
3. **Sprememba ločila ali filtra**: takoj posodobi `d` oziroma `f`, ne da bi spremenila `C`.
4. **Preklop Preglednica/Tabla**: ohrani `C`, `d` in `f` nespremenjene.
5. **Sprememba projekta ali osvežitev**: ponastavi `C`, `d` in `f` na privzete vrednosti.
6. **Pogoj za omogočen izvoz**: gumb `Izvozi CSV` je omogočen samo, kadar `C` ni prazna in je filtriran rezultat `T` neprazen.
7. **Dejanje izvoza**: tvori in prenosí CSV na podlagi trenutnih `P`, `T`, `C`, `d` in `f`, ne da bi spremenilo `P`, `T`, `C`, `d`, `f` ali obstoječe bralne funkcije.
8. **Filter in prikaz**: filter vpliva samo na izvožene vrstice, ne na vidne vrstice v trenutnem pogledu.

## Zahteve in pravila

| Zahteva | Pravilo oziroma sprejemni pogoj | Način preverjanja |
| --- | --- | --- |
| R01 | Izvoz zajame le opravila trenutnega projekta v izvornem vrstnem redu. Privzeto so vse kolone izbrane, filter je `all`, ločilo pa `;`. | Uspešno: lastni test “P06 default export preserves order, Unicode, quoting, CRLF and BOM”; npm run check 49/49. |
| R02 | Uporabnik lahko izbere kolone `id`, `projectId`, `title`, `status`, `assignee`, `dueDate`, `description`. Glava in vrednosti vedno sledijo temu vrstnemu redu, neodvisno od zaporedja klikov. | Uspešno: lastni test “P06 export settings filter bytes, survive view switch, reset on project change and stay read-only”; npm run check 49/49. |
| R03 | Če `C` je prazna, je gumb onemogočen in izvoz ne ustvari prenosa. Ponovni izbor vsaj ene kolone ga omogoči, če obstaja ustrezna vrstica. | Uspešno: lastni test “P06 export settings filter bytes, survive view switch, reset on project change and stay read-only”; npm run check 49/49. |
| R04 | Filter `f` omeji le izvožene vrstice, ne pa vidnega projekta. Prazen projekt ali prazen filtriran rezultat onemogoči izvoz. | Uspešno: lastni test “P06 export settings filter bytes, survive view switch, reset on project change and stay read-only”; npm run check 49/49. |
| R05 | Izvoz prenosí datoteko `folio-<projectId>.csv`, ki se začne z UTF-8 BOM `U+FEFF`. Izvoz ne odpre nove strani in ne pošlje vsebine na strežnik. | Uspešno: lastni test “P06 default export preserves order, Unicode, quoting, CRLF and BOM”; npm run check 49/49. |
| R06 | Ločilo je `;` ali `,`. Vsaka glava in vsaka vrednost je obdana z dvojnimi narekovaji; vsak notranji dvojni narekovaj je podvojen. | Uspešno: lastna testa “P06 default export preserves order, Unicode, quoting, CRLF and BOM” ter “P06 export settings …”; npm run check 49/49. |
| R07 | Vrstice so ločene s CRLF, tudi zadnja. Ločila in prelomi vrstic v vrednostih ostanejo znotraj pravilno navedenih vrednosti. | Uspešno: lastni test “P06 default export preserves order, Unicode, quoting, CRLF and BOM”; npm run check 49/49. |
| R08 | Pred navedbo vrednosti se nevtralizira formula: če se izvirni niz po poljubnih začetnih presledkih, tabulatorjih, CR ali LF začne z `=`, `+`, `-` ali `@`, se na sam začetek izvirnega niza doda apostrof. Glava se ne spreminja. | Uspešno: lastni test “P06 formula neutralization covers every textual data column”; npm run check 49/49. |
| R09 | Šumniki, drugi Unicode znaki, presledki in opisi ostanejo nespremenjeni, razen izrecne nevtralizacije formul. `status` se izvozi kot interna vrednost, `dueDate` pa kot izvirni `YYYY-MM-DD`. | Uspešno: lastni test “P06 default export preserves order, Unicode, quoting, CRLF and BOM”; npm run check 49/49. |
| R10 | Preklop Preglednica/Tabla ohrani izbor kolon, ločilo in filter. Enake nastavitve v obeh pogledih ustvarijo enake bajte datoteke. | Uspešno: lastni test “P06 export settings filter bytes, survive view switch, reset on project change and stay read-only”; npm run check 49/49. |
| R11 | Sprememba projekta ali osvežitev ponastavi izbor kolon, ločilo in filter na privzete vrednosti. Zaporedna izvoza vedno odražata trenutne nastavitve. | Uspešno: lastni test “P06 export settings filter bytes, survive view switch, reset on project change and stay read-only”; npm run check 49/49. |
| R12 | Izvoz in njegove kontrole ne spremenijo nobenega opravila, izvornega polja ali obstoječih bralnih funkcij. Ne pošljejo zapisov na API. | Uspešno: lastni test “P06 export settings filter bytes, survive view switch, reset on project change and stay read-only”; brez zapisov na API; npm run check 49/49. |

## Izvedba in sledljivost

Plan implementacije:

- Logika izvoza CSV: `src/csv.ts`
- Integracija v projektni pogled: `src/App.tsx`
- Slogovna dopolnitev po Folio: `src/styles.css`
- Agentovi testi: `tests/agent/p06-export.spec.ts`

| Zahteva | Pogoj | Test ali scenarij | Datoteka in del kode | Izid ter dokaz |
| --- | --- | --- | --- | --- |
| R01 | Privzeti izvoz zajame vse opravila trenutnega projekta v izvornem vrstnem redu. | Agentov test privzetega izvoza. | `src/csv.ts`, `src/App.tsx`, `tests/agent/p06-export.spec.ts` | Uspešno: lastni test “P06 default export preserves order, Unicode, quoting, CRLF and BOM”; npm run check 49/49. |
| R02 | Izbor kolon v poljubnem zaporedju ohrani nespremenljivo zaporedje glave in vrednosti. | Agentov test zaporedja izbora. | `src/csv.ts`, `src/App.tsx`, `tests/agent/p06-export.spec.ts` | Uspešno: lastni test “P06 export settings filter bytes, survive view switch, reset on project change and stay read-only”; npm run check 49/49. |
| R03 | Prazen izbor kolon onemogoči izvoz, ponovna izbrana kolona pa ga po potrebi omogoči. | Agentov test stanja gumba. | `src/App.tsx`, `tests/agent/p06-export.spec.ts` | Uspešno: lastni test “P06 export settings filter bytes, survive view switch, reset on project change and stay read-only”; npm run check 49/49. |
| R04 | Filter omeji izvožene vrstice, ne pa vidnega projekta; prazen rezultat onemogoči izvoz. | Agentov test filtra in vidnega prikaza. | `src/App.tsx`, `src/csv.ts`, `tests/agent/p06-export.spec.ts` | Uspešno: lastni test “P06 export settings filter bytes, survive view switch, reset on project change and stay read-only”; npm run check 49/49. |
| R05 | Izvoz ustvari pravilno poimenovano datoteko z UTF-8 BOM brez nove strani ali pošiljanja na strežnik. | Agentov test prenosa in omrežja. | `src/csv.ts`, `src/App.tsx`, `tests/agent/p06-export.spec.ts` | Uspešno: lastni test “P06 default export preserves order, Unicode, quoting, CRLF and BOM”; npm run check 49/49. |
| R06 | Izvoz pravilno uporabi izbrano ločilo in navede vsako polje ter podvoji notranje narekovaje. | Agentov test ločil in ubežnih znakov. | `src/csv.ts`, `tests/agent/p06-export.spec.ts` | Uspešno: lastna testa “P06 default export preserves order, Unicode, quoting, CRLF and BOM” ter “P06 export settings …”; npm run check 49/49. |
| R07 | Izvoz uporabi CRLF med vrsticami in na koncu ter ohrani vrednosti z ločili ali prelomi. | Agentov test bajtov izvoza. | `src/csv.ts`, `tests/agent/p06-export.spec.ts` | Uspešno: lastni test “P06 default export preserves order, Unicode, quoting, CRLF and BOM”; npm run check 49/49. |
| R08 | Izvoz nevtralizira formulo v podatkovnih vrednostih in ne spreminja glave. | Agentov test nevtralizacije formul. | `src/csv.ts`, `tests/agent/p06-export.spec.ts` | Uspešno: lastni test “P06 formula neutralization covers every textual data column”; npm run check 49/49. |
| R09 | Izvoz ohrani Unicode, opise, interne statuse in izvirne datume. | Agentov test ohranjanja vrednosti. | `src/csv.ts`, `tests/agent/p06-export.spec.ts` | Uspešno: lastni test “P06 default export preserves order, Unicode, quoting, CRLF and BOM”; npm run check 49/49. |
| R10 | Preklop pogleda ohrani nastavitve in ustvari enake bajte. | Agentov test preklopa in primerjave izvoza. | `src/App.tsx`, `src/csv.ts`, `tests/agent/p06-export.spec.ts` | Uspešno: lastni test “P06 export settings filter bytes, survive view switch, reset on project change and stay read-only”; npm run check 49/49. |
| R11 | Menjava projekta in osvežitev ponastavita nastavitve; zaporedna izvoza odražata trenutne nastavitve. | Agentov test ponastavitve in zaporednega izvoza. | `src/App.tsx`, `tests/agent/p06-export.spec.ts` | Uspešno: lastni test “P06 export settings filter bytes, survive view switch, reset on project change and stay read-only”; npm run check 49/49. |
| R12 | Izvoz ne spremeni podatkov, polj ali bralnih funkcij in ne pošlje zapisov na API. | Agentov test neželenih sprememb in omrežja. | `src/App.tsx`, `tests/agent/p06-export.spec.ts` | Uspešno: lastni test “P06 export settings filter bytes, survive view switch, reset on project change and stay read-only”; brez zapisov na API; npm run check 49/49. |

## Odprta vprašanja in omejitve

- Ni odprtih bistvenih vprašanj; izvirne zahteve določajo vse potrebne funkcionalne lastnosti.
- Ta faza ne vsebuje implementacije, izvedenih testov ali zunanjih meritev.
- Besedila, ki niso izrecno določena, in razporeditev novih kontrol niso predpisane; implementacija mora uporabiti obstoječe gradnike in slogovne spremenljivke Folio.
- Filtriran izvoz ne sme spremeniti vidnega prikaza celotnega projekta.
- Aplikacija ne sme uporabiti testnih kontrol `/__test/`.
