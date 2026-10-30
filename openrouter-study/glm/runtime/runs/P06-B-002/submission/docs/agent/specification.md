# Specifikacija: nastavljiv izvoz CSV

## Problem in kontekst

Folio prikazuje opravila izbranega projekta v pogledih Preglednica in Tabla. Uporabnik potrebuje izvoz teh opravil v CSV, z nadzorom nad kolonami, ločilom in statusnim filtrom. Izvoz je lokalno dejanje v uporabniškem vmesniku: ne spreminja podatkov, ne dodaja zapisovalnega API-ja in ne pošilja vsebine na strežnik.

Obstoječi javni tipi ostanejo nespremenjeni:

- `TaskStatus = 'todo' | 'in_progress' | 'done'`
- `Task = { id, projectId, title, description, status, assignee, dueDate }`; vsa polja so nizi, `status` je `TaskStatus`, `dueDate` pa veljavni `YYYY-MM-DD`.
- `Project = { id, name }`.

## Vhodi, dejanja in izidi

- Podatkovni vir je obstoječi javni API `/api/`; uporabniški vmesnik ne sme brati `/__test/`.
- Izvoz zajema samo opravila trenutno izbranega projekta v izvornem vrstnem redu.
- Kontrole so: dostopno ime `Stolpec <ime>` za vsako dovoljeno kolono, `Ločilo CSV` z vrednostma `;` in `,`, `Filter izvoza` z vrednostmi `all`, `todo`, `in_progress`, `done`, ter gumb `Izvozi CSV`.
- Dovoljene kolone v nespremenljivem vrstnem redu so: `id`, `projectId`, `title`, `status`, `assignee`, `dueDate`, `description`.
- Privzeto stanje za projekt je: izbrane vse kolone, ločilo `;`, filter `all`.
- Gumb izvoza je onemogočen, kadar podatki še nalagajo ali nalaganje ni uspelo, kadar trenutni projekt ali statusno filtriran rezultat nima opravil, ali kadar ni izbrana nobena kolona.
- Uspeh ustvari prenos datoteke `folio-<projectId>.csv`, kodirane v UTF-8 z BOM `U+FEFF`.
- Sprememba nastavitev takoj vpliva na naslednji izvoz; ni posebnega potrditvenega ali preklicnega dejanja. Ob napaki izvoza podatki in nastavitve ostanejo nespremenjeni.
- Ohranijo se obstoječi `data-task-id`, dostopna imena pogledov in stolpcev ter `aria-label="Pregled stanj opravil"`; nova dejanja ostanejo izven obstoječih povezav opravil.
- Na širini 390 px se stran ne razširi; notranje drsenje obstoječe preglednice in table je dovoljeno.

### Formalne definicije

- `tasks = await GET /api/projects/<projectId>/tasks`
- `selectedColumns ⊆ {id, projectId, title, status, assignee, dueDate, description}`
- `exportOrder = [id, projectId, title, status, assignee, dueDate, description] ∩ selectedColumns`
- `filteredTasks = filter === 'all' ? tasks : tasks.filter(task => task.status === filter)`
- `canExport = selectedColumns.length > 0 ∧ filteredTasks.length > 0`
- `CSV = UTF8_BOM + (exportOrder.map(header) ++ filteredTasks.map(task => exportOrder.map(column => task[column])))` s CRLF med vrsticami in na koncu.
- Formula se nevtralizira samo v podatkovnih vrednostih: če `value` po nič ali več začetnih znakih iz `{space, tab, CR, LF}` začne z `=`, `+`, `-` ali `@`, se pred izvirni niz doda `'`.
- Vsako glavo in vsako (morebiti nevtralizirano) vrednost se obda z `"`, notranji `"` pa podvoji.

## Zahteve in pravila

| Zahteva | Pravilo oziroma sprejemni pogoj | Način preverjanja |
| --- | --- | --- |
| R01 | Za trenutni projekt velja `filteredTasks ⊆ tasks`, vrstni red pa je enak vrstnemu redu iz `GET /api/projects/<projectId>/tasks`. Privzeto sta `filter = 'all'` in `selectedColumns = exportOrder`, ločilo pa `';'`. | Funkcijski test z več opravili v znanem vrstnem redu. |
| R02 | Izvoz zajema natanko `selectedColumns`; glava in vrednosti sledijo `exportOrder`, ne glede na vrstni red klikov. | Test z izbiro v naključnem vrstnem redu in primerjavami glave ter vrstic. |
| R03 | `canExport` je `false`, če je `selectedColumns.length = 0`, in takrat klik ne ustvari prenosa. Izbor vsaj ene kolone ob nepraznem `filteredTasks` ponovno omogoči gumb. | UI test izpada, ponovne omogočitve in odšteje prenose. |
| R04 | `filteredTasks` vsebuje samo opravila z `task.status = filter`; pri `all` pa vsa opravila projekta. Vmesnik še vedno prikazuje celoten `tasks`. | Test z vsaj enim opravilom vsakega statusa in filtriranimi bajti. |
| R05 | Prenese `folio-<projectId>.csv`; prvi trije bajti so `EF BB BF`. Ne spremeni `window.location` in ne pošlje vsebine na strežnik. | Playwright preveri prenos, bajte in odsotnost ustreznega omrežnega zahtevka. |
| R06 | Ločilo je `;` ali `,`; vsaka glava in vsaka vrednost sta obdani z `"`, notranji `"` pa podvojeni. | Enotski test izvozne funkcije ali UI test z vrednostmi, ki vsebujejo narekovaje. |
| R07 | Vrstice so ločene s CRLF in zadnja vrstica se konča s CRLF. `,`, `;` ter CRLF znotraj vrednosti ostanejo ohranjeni. | Test z vrednostmi, ki vsebujejo `,`, `;` in `\r\n`. |
| R08 | Za vsak podatkovni niz `value` velja: `value = /^(?:[ \t\r\n]*)([=+\-@])/` povzroči `' + value`; drugi nizi ostanejo nespremenjeni. Glava se ne nevtralizira. | Test z vrednostmi `=x`, ` +x`, `\t-x`, `\r\n@x` in odsotnostjo spremembe drugih nizov. |
| R09 | Vrednosti se izvozijo izvirno, razen apostrofa iz R08. `status` je `"todo"`, `"in_progress"` ali `"done"`; `dueDate` je izvirni `YYYY-MM-DD`. | Test s šumniki, drugimi Unicode znaki, presledki, statusi in datumi. |
| R10 | Preklop med `table` in `board` ne spremeni `selectedColumns`, ločila ali filtra. Enake nastavitve in enak `tasks` ustvarita enake bajte. | Test izvoza v obeh pogledih z enakimi nastavitvami. |
| R11 | Menjava `project.id` ali osvežitev strani ponastavi nastavitve na privzete vrednosti. Zaporedna izvoza vedno uporabita trenutne nastavitve. | Test menjave projekta, osvežitve in dveh zaporednih izvozov. |
| R12 | Izvoz ne spremeni nobenega `Task`, polja v `shared/types.ts` ali obstoječih bralnih funkcij, ne ustvari zapisovalnega API-ja in ne pošlje nobenega ne-GET zahtevka. | Regresijski test obstoječih bralnih funkcij, obstoječih API testov in primerjava podatkov pred/za izvozom. |

## Izvedba in sledljivost

Implementacija naj doda lokalni izvozni pripomoček v `src/` in ga poveže z obstoječim uporabniškim vmesnikom trenutnega projekta. Stanje naj bo lokalno trenutnemu projektu; brez izrecne zahteve ni trajne shrambe ali URL-ja. Priporočena izvedena preverjanja so UI testi v `tests/agent/` in skupni testi; v tej fazi specifikacije preverjanja še niso izvedena.

| Zahteva | Pogoj | Test ali scenarij | Datoteka in del kode | Izid ter dokaz |
| --- | --- | --- | --- | --- |
| R01–R12 | Specifikacija pokriva vse zahteve, predikate in omejitve. | Za izvedbo določi smiselne teste za vsako zahtevo. | Še ni izvedeno. | Ni izvedeno v tej fazi. |

## Odprta vprašanja in omejitve

- Ni odprtih vprašanj iz izhodišča. Strežnik, skupni tipi, infrastruktura in odvisnosti ostanejo nespremenjeni.
- Specifikacija ne predpisuje besedila ali razporeditve novih kontrol, razen dostopnih imen, vrednosti in imena datoteke.
- Nova dejanja ne smejo razširiti celotne strani na širini 390 px.
- Nalaganje med menjavo projekta in sočasne spremembe brez osvežitve niso v obsegu obstoječih regresij.
