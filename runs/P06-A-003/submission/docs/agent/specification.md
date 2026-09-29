# P06 – Specifikacija nastavljivega izvoza CSV

Različica 1.1, 23. 9. 2026. Postopek A, en agent. Začetna specifikacija v1 je bila pripravljena pred implementacijo; v1.1 dopolnjuje sledljivost z dejanskimi rezultati.

## Problem in kontekst

Folio že bere projekte in opravila prek javnega `/api/`, prikazuje preglednico, tablo in podrobnosti. Uporabnik želi opravila trenutnega projekta prenesti kot nastavljiv CSV. Dodamo lokalne kontrole nad obstoječim prikazom ter ustvarjanje datoteke v brskalniku. Ohranimo slovenska poimenovanja, dostopnost in oblikovne spremenljivke iz `docs/dizajn.md`.

## Vhodi, dejanja in izidi

- Vhod je izvorno zaporedje opravil iz `GET /api/projects/<id>/tasks`; vsako vsebuje nizovna polja `id`, `projectId`, `title`, `status`, `assignee`, `dueDate`, `description`. Stanje je `todo`, `in_progress` ali `done`, datum je veljaven `YYYY-MM-DD`. Naslovi niso identifikatorji.
- Uporabnik izbira poljubno podmnožico sedmih kolon, ločilo `;` ali `,`, ter filter `all`, `todo`, `in_progress` ali `done`. Vse kontrole so lokalne trenutnemu projektu, ne spreminjajo URL-ja ali podatkov.
- Privzeto so izbrane vse kolone, ločilo `;`, filter `all`. Kontrole so na voljo po uspešnem nalaganju, tudi za prazen projekt. Med nalaganjem ali napako obstoječi prikaz nalaganja/ponovitve ostane nespremenjen.
- Uspeh ustvari prenos `folio-<projectId>.csv`, brez nove strani ali omrežnega zapisa. Zaporedni prenosi uporabijo trenutno stanje. Preklic prenosa v brskalniku ne spreminja nastavitev ali opravil. Sinhrona napaka priprave prenosa se prikaže uporabniku in dopušča ponovni poskus; uspešnega shranjevanja na disk aplikacija ne more potrditi.
- Brez kolon ali brez ustreznih vrstic je gumb onemogočen in naveden je razlog; obrambni pogoj v dejanju prav tako prepreči prenos.

## Zahteve in pravila

Oznake: `T` je izvorno zaporedje opravil trenutnega projekta; `K = [id, projectId, title, status, assignee, dueDate, description]`; `S ⊆ K` je izbor; `f` je filter; `d` je ločilo. `C = [k ∈ K | k ∈ S]` in `E = [t ∈ T | f = all ∨ t.status = f]` ohranita izvorni vrstni red.

Predikati in prehodi:

1. `enabled ⇔ |C| > 0 ∧ |E| > 0`. Če predikat ne velja, dejanje ne ustvari niti povezave za prenos.
2. `N(v) = "'" + v`, kadar se `v` ujema z `^[ \t\r\n]*[=+@-]`; sicer `N(v) = v`. To je natančen nabor začetnih preslednih znakov, ne splošni Unicode whitespace. Apostrof se doda pred celoten izvorni niz.
3. `Q(v) = '"' + v.replaceAll('"', '""') + '"'`. Glava uporablja `Q(k)`, podatki `Q(N(t[k]))` za vsako izbrano kolono.
4. `CSV = U+FEFF + join(C.map(Q), d) + CRLF + concat(E.map(t => join(C.map(k => Q(N(t[k]))), d) + CRLF))`. Pretvorba je UTF-8 in ne normalizira notranjih prelomov vrstic.
5. Preklop pogleda ohrani `(S,d,f)`. Menjava projekta ali ponovno nalaganje strani nastavi `(K, ';', 'all')`. Izvorno `T` po kateremkoli dejanju ostane enako.

| Zahteva | Pravilo oziroma sprejemni pogoj | Način preverjanja |
| --- | --- | --- |
| R01 | Izvorni vrstni red, samo trenutni projekt, vse kolone/`;`/`all` privzeto. | D01 ter A01, A04, A07. |
| R02 | Sedem checkboxov z imeni `Stolpec <ime>`; `C` vedno sledi `K`. | D02 ter A01, A04. |
| R03 | `S = ∅` prepreči prenos; ponoven izbor ga omogoči le pri nepraznem `E`. | A05. |
| R04 | `E` omejuje samo izvoz; prazna projekta in vsi prazni filtri onemogočijo izvoz. | A04, A05, A06, A07. |
| R05 | UTF-8 BOM, pravilno ime, lokalni prenos brez navigacije. | D01 ter A04, A07, A08. |
| R06 | Obe ločili; vedno navedene glave in celice, notranji narekovaji podvojeni. | D02, D03 ter A01, A04. |
| R07 | CRLF tudi na koncu, notranji CR/LF/CRLF in ločila ohranjeni. | D01, D03 ter A01, A04. |
| R08 | `N` pred `Q` za vse podatkovne kolone, ne za glavo. | D03 ter A02 (matrika predpon in kolon), A04. |
| R09 | Unicode, opisi, presledki, interni status in izvorni datum ohranjeni. | D03 ter A01, A02, A04. |
| R10 | Menjava pogleda ohrani vse nastavitve in bajte prenosa. | D04 ter A08. |
| R11 | Nov projekt/vrnitev/osvežitev ponastavijo stanje; ponovni izvoz uporablja nove nastavitve. | A04, A07, A08. |
| R12 | Brez mutacij ali zapisov na API, ohranjeni prikazi/povezave/povzetki, širina 390 px brez prelivanja strani. | Izhodiščni testi, D04 ter A03, A04, A08, A09. |

## Izvedba in sledljivost

Implementirane datoteke: [src/csv.ts](../../src/csv.ts) za čisto serializacijo, [src/CsvExport.tsx](../../src/CsvExport.tsx) za lokalno stanje in prenos, vključitev v [src/App.tsx](../../src/App.tsx), prilagodljivi slogi v [src/styles.css](../../src/styles.css). Lastni testi so v [tests/agent/csv.spec.ts](../../tests/agent/csv.spec.ts). Končne rezultate, omejitve in povezave na dnevnike vsebuje [verification.md](verification.md). Spodaj navedeni uspehi se nanašajo na dejanski končni zagon [check-final.log](check-final.log), 56/56 uspešnih preverjanj.

| Zahteva | Pogoj | Test ali scenarij | Datoteka in del kode | Izid ter dokaz |
| --- | --- | --- | --- | --- |
| R01 | Privzeto in izvorno zaporedje | D01, A01/A04/A07 | `csv.ts`: `serializeTasksCsv`; `CsvExport.tsx`: začetna stanja | Uspešno: preverjen tudi nesortiran seznam 13 opravil in poljubni ID-ji projektov. |
| R02 | Fiksni vrstni red kolon | D02, A01/A04 | `csv.ts`: `CSV_COLUMNS.filter`; `CsvExport.tsx`: checkboxi | Uspešno: obraten izbor ter kliki description → title → id. |
| R03 | Onemogočanje in ponovni izbor | A05 | `CsvExport.tsx`: `disabled`, začetni pogoj v `download` | Uspešno: brez prenosa pri nič kolonah, ponovna omogočitev ob ustreznih vrsticah. |
| R04 | Samo izvozni filter, prazni rezultati | A04/A05/A06/A07 | `CsvExport.tsx`: `rows`; `App.tsx`: nespremenjen vhod prikazom | Uspešno: vsi filtri, prazna projekta, nespremenjeni ID-ji in povzetki. |
| R05 | Prenos, BOM in ime | D01, A04/A07/A08 | `csv.ts`: U+FEFF; `CsvExport.tsx`: `download`, Blob | Uspešno: dejanski bajti EF BB BF, obe imeni projektov, brez nove strani/zahtev med izvozom. |
| R06 | Ločili, navajanje | D02/D03, A01/A04 | `csv.ts`: `quote`, `join(delimiter)` | Uspešno: obe ločili in podvojeni narekovaji v primerjavi celotnih bajtov. |
| R07 | Zaključki in notranji prelomi | D01/D03, A01/A04 | `csv.ts`: `rows.join`, zaključni CRLF; Blob `endings: transparent` | Uspešno: neodvisni bralnik CSV preveri vse zunanje zaključke in notranje CR/LF/CRLF. |
| R08 | Nevtralizacija formule | D03, A02/A04 | `csv.ts`: `quoteData` | Uspešno: matrika 238 primerov, vseh sedem kolon; negativni Unicode whitespace primeri ostanejo nespremenjeni. |
| R09 | Ohranjena vsebina | D03, A01/A02/A04 | `csv.ts`: neposredni `task[column]` brez lokalizacije | Uspešno: Unicode, presledki, prazen opis, prestopni datum in notranji statusi. |
| R10 | Enakost pogledov | D04, A08 | `App.tsx`: `CsvExport` zunaj vejitve pogleda | Uspešno: vsi trije parametri in celotni bajti ostanejo enaki tudi ob podrobnostih. |
| R11 | Življenjski cikel nastavitev | A04/A07/A08 | `App.tsx`: `ProjectView key={project.id}`; `CsvExport.tsx`: `useState` | Uspešno: drug projekt, vrnitev nazaj, osvežitev, zaporedni prenosi po spremembah. |
| R12 | Nemutiranje in prilagodljivost | Izhodišče, D04, A03/A04/A08/A09 | `csv.ts`: čiste preslikave; `CsvExport.tsx`: lokalne kontrole; `styles.css`: `.csv-*` | Uspešno: zamrznjeni vhodi, brez zapisov, regresije, tipkovnica, 390 px; tudi [vizualno preverjanje](visual-check.log). |

Dodatni A10 uspešno preveri lokalno napako priprave prenosa in ponovni poskus brez izgube nastavitev. Ta scenarij konkretizira že opisano obravnavo napake, ne spreminja zahtev R01–R12.

## Odprta vprašanja in omejitve

- Zahteve so dovolj določene; dodatna uporabniška pojasnila niso potrebna.
- Brskalniški preklic prenosa in napake zapisa na uporabnikov disk ne ponujajo povratnega signala tej aplikaciji.
- Navigacija med nezaključenim nalaganjem in sočasne spremembe brez osvežitve ostanejo v obsegu obstoječih regresijskih zahtev.
- Končni, nedostopni testi niso del preverjanja. Dejanski obseg in omejitve so zapisani v [verification.md](verification.md).

## Zgodovina sprememb

- v1: začetna specifikacija pred implementacijo; preverjanja so zgolj načrtovana.
- v1.1: po izvedbi dodane končne povezave in dejanski izidi za R01–R12 ter dodatni scenarij A10. Sprejemni pogoji ostajajo enaki. Pri vizualnem pregledu popravljena prednost CSS za moder izvozni gumb; po popravku ponovno uspešno celotno preverjanje.
