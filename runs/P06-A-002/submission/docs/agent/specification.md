# P06 – specifikacija nastavljivega izvoza CSV

## Problem in kontekst

Uporabnik želi opravila trenutnega projekta prenesti v CSV z izbranimi kolonami,
ločilom in stanjem opravil. Izhodiščni Folio bere projekte in opravila prek
`/api/`, prikazuje preglednico, tablo in podrobnosti. Dodamo lokalni izvoz
ob nespremenjenem prikazu vseh opravil in obstoječem slovenskem videzu Folio.
Postopek A: en agent; dovoljena koda v `src/`, testi v `tests/agent/`, dokumenti
v `docs/agent/`. Specifikacija je zapisana pred implementacijo.

## Vhodi, dejanja in izidi

- Vhod je urejeno polje opravil trenutnega projekta iz javnega API-ja. Vsa
  podatkovna polja so nizi; `status` je `todo`, `in_progress` ali `done`,
  `dueDate` je veljaven izvirni `YYYY-MM-DD`. Naslovi niso identifikatorji.
- Uporabnik izbira checkboxe z imeni `Stolpec <ime>`, HTML select `Ločilo CSV`
  (`;`, `,`), HTML select `Filter izvoza` (`all`, `todo`, `in_progress`, `done`)
  ter gumb `Izvozi CSV`. Vsa dejanja so zunaj povezav opravil.
- Uspeh: lokalni prenos `folio-<projectId>.csv`, brez navigacije ali zapisov na
  API. Nastavitve in podatki ostanejo nespremenjeni, ponovni izvoz uporablja
  aktualne nastavitve.
- Brez izbranih kolon ali brez ustreznih vrstic je gumb onemogočen. Razlog je
  viden v vmesniku. Med nalaganjem ali napako podatkov izvoz ni na voljo;
  obstoječa obravnava napak in ponovni poskus ostaneta enaka.
- Preklic prenosa v brskalniku nima vpliva na aplikacijo. Ni dodatnega dialoga,
  strežniške obdelave ali trajnega shranjevanja nastavitev.

## Zahteve in pravila

Naj bo `T` izvorno urejeno polje opravil, `K = [id, projectId, title, status,
assignee, dueDate, description]`, `S` množica izbranih kolon, `f` filter in `d`
ločilo. `C = [k ∈ K | k ∈ S]`, `E = [t ∈ T | f = all ∨ t.status = f]`.
Filtriranje ohranja vrstni red. Izvoz je omogočen natanko kadar
`|C| > 0 ∧ |E| > 0`. Nastavitve privzeto: `(S, f, d) = (K, all, ;)`.

Za podatkovni niz `x` velja `N(x) = "'" + x`, če se `x` ujema z
`^[ \t\r\n]*[=+\-@]`, sicer `N(x) = x`. Upoštevamo samo naštete začetne
presledne znake, brez krajšanja, Unicode normalizacije ali spremembe prelomov.
`Q(x)` doda zunanja dvojna narekovaja in vsak notranji `"` nadomesti z `""`.
Glavo sestavljajo `Q(k)`, podatkovne celice `Q(N(t[k]))`. Celice poveže `d`,
vrstice `CRLF`. Datoteka je `UTF-8(BOM + glava + CRLF + podatkovne vrstice)`,
vsaka podatkovna vrstica ima končni `CRLF`.

| Zahteva | Pravilo oziroma sprejemni pogoj | Način preverjanja |
| --- | --- | --- |
| R01 | Izvoz uporablja `E` v izvornem vrstnem redu; privzete nastavitve zgoraj. | D01, A01: privzete kontrole, več kot deset nesortiranih opravil. |
| R02 | Dovoljene so natanko kolone `K`; izvoz uporabi `C`, ne vrstnega reda klikov. | D02, A02: izbor v obratnem vrstnem redu in natančni bajti. |
| R03 | `C = []` pomeni onemogočen izvoz brez prenosa; ponovni izbor obnovi možnost ob `E ≠ []`. | A03: nobena kolona, poskus aktivacije, ponovni izbor. |
| R04 | Filter vpliva samo na `E`; `T` in prikaz vseh opravil ostaneta ista. `E = []` onemogoči izvoz. | A04: vsi filtri, prazna projekta, prazni rezultati, oba pogleda. |
| R05 | Ime datoteke uporablja trenutni ID projekta; prvi bajti so EF BB BF; ni nove strani ali pošiljanja vsebine. | D01, A01, A05, A06: bajti, ime, navigacija, opazovanje zahtev. |
| R06 | Vsaka celica in glava uporablja `Q`, ločilo je izključno izbrani `d`. | D02–D03, A02, A07: obe ločili, prazne celice in narekovaji. |
| R07 | Vrstice in zadnja vrstica imajo CRLF; notranji CR, LF, CRLF in ločila ostanejo ohranjeni. | D01, D03, A07: natančno pričakovani nizi in dejanski prenos. |
| R08 | Vsa podatkovna polja uporabljajo `N` pred `Q`; glave samo `Q`. | D03, A07–A08: štirje operatorji, mešani začetni presledki, negativni primeri. |
| R09 | Polja ostanejo izvirni nizi, razen `N`; status ni preveden, datum ni preoblikovan. | A01, A07–A08: Unicode, presledki, surovi statusi in datumi. |
| R10 | Sprememba pogleda ne spremeni `(S, f, d)`; pri istih vhodih so bajti enaki. | D04, A05: neprivzete nastavitve, tabla, preglednica. |
| R11 | Menjava projekta ali osvežitev obnovi privzete nastavitve; vsak klik uporabi trenutno stanje. | A02, A05–A06: zaporedni izvozi, menjava in vrnitev, osvežitev. |
| R12 | `T_po = T_pred`; ni zapisovalnih API zahtev, obstoječe branje in dostopna imena ostanejo, stran pri 390 px ne preseže zaslona. | Regresijski testi, D04, A04–A08, A09: podatki, omrežje, podrobnosti, mobilni prikaz. |

## Izvedba in sledljivost

Izvedba: čisti sestavljalnik CSV v [csv.ts](../../src/csv.ts), kontrole in lokalni
prenos v [CsvExport.tsx](../../src/CsvExport.tsx), vključitev pred preglednico/tablo
v [App.tsx](../../src/App.tsx), slogi v [styles.css](../../src/styles.css).
Obstoječi `ProjectView` ima ključ `project.id`, zato
lokalno stanje otroka ohrani preklop pogleda in se ponastavi ob menjavi projekta.

Oznake A01–A09 so testi v [p06.spec.ts](../../tests/agent/p06.spec.ts); A07 se
izvede za obe ločili, skupaj je 10 dodatnih testov. D01–D04 so skupni razvojni
testi, izvedeni na namiznem in mobilnem projektu. Dokaz vseh spodnjih izidov je
[končni dnevnik npm run check](check.log), podrobnosti pa [zapis preverjanj](verification.md).

| Zahteva | Pogoj | Test ali scenarij | Datoteka in del kode | Izid ter dokaz |
| --- | --- | --- | --- | --- |
| R01 | Privzeto vse vrstice in kolone, `;` | D01, A01 | `CsvExport.tsx`: začetno stanje; `csv.ts`: `createCsv` | Uspešno; A01 preveri vseh 14 nesortiranih vrstic bajtno. |
| R02 | Fiksni vrstni red `C` | D02, A02 | `csv.ts`: `CSV_COLUMNS.filter` | Uspešno; izbor description → title → id izvozi id → title → description. |
| R03 | `C = []` onemogoči izvoz | A03 | `CsvExport.tsx`: `disabled`, `download` | Uspešno; brez kolon 0 prenosov, po izboru 1 prenos. |
| R04 | Filter samo za izvoz, prazne vrstice | A04 | `CsvExport.tsx`: `rows`; `App.tsx`: izvirni `tasks` za prikaz | Uspešno; vsi filtri, nespremenjen prikaz in števci, prazen rezultat in oba prazna projekta. |
| R05 | Lokalna datoteka, ime, BOM | D01, A01, A06 | `csv.ts`: BOM; `CsvExport.tsx`: Blob in download | Uspešno; EF BB BF, ime po ID, ista stran, brez novih zahtev ob prenosu. |
| R06 | Navedba in ločilo | D02–D03, A02, A07 | `csv.ts`: `quote`, `join(separator)` | Uspešno; natančni bajti za obe ločili, prazne vrednosti in notranje narekovaje. |
| R07 | CRLF in ohranitev vsebine | D01, D03, A07 | `csv.ts`: `lines.join` in zaključni CRLF | Uspešno; notranji CR, LF in CRLF ohranjeni, vključno z zadnjim CRLF. |
| R08 | Natančno pravilo `N` | D03, A07–A08 | `csv.ts`: `quoteValue` | Uspešno; 24 kombinacij prefiksa/operatorja in 11 negativnih primerov; veljavni ID-ji z začetnim minusom. |
| R09 | Izvirne vrednosti | A01, A07–A08 | `csv.ts`: `task[column]` | Uspešno; čšž, 李, emoji, presledki, interni statusi, datum 2028-02-29. |
| R10 | Enako stanje in bajti med pogledoma | D04, A05 | `App.tsx`: stalni položaj `CsvExport` | Uspešno; neprivzete nastavitve in bajti ostanejo med preglednico, tablo in podrobnostmi. |
| R11 | Ponastavitve in aktualno stanje | A02, A06 | `App.tsx`: ključ projekta; `CsvExport.tsx`: lokalno stanje | Uspešno; drugi projekt, vrnitev, osvežitev ter dva izvoza po spremembi nastavitev. |
| R12 | Brez mutacij in regresij, odziven videz | 38 izhodiščnih testov, D04, A04–A09 | `csv.ts`: čisto branje; `CsvExport.tsx`: lokalni prenos; `styles.css`: prelamljanje kontrol | Uspešno; zamrznjeni vhodi, nič zapisov, podrobnosti po ID, 390 px, vidni fokus. |

## Odprta vprašanja in omejitve

Zahteve so dovolj določene. Napak samega shranjevanja na disk v upravljalniku
prenosov aplikacija ne more zaznati; to ostane odgovornost brskalnika. Novi
sočasni popravki podatkov brez osvežitve in širjenje navigacije med nalaganjem
niso v obsegu. Končni skriti testi niso dostopni in jih ne bomo označili kot
izvedene. Dejanski zagoni, dokazila in omejitve so v [verification.md](verification.md).

## Zgodovina sprememb specifikacije

- 2026-09-25 UTC, v1: začetna specifikacija pred implementacijo;
  preverjanja so načrtovana in še niso izvedena.
- 2026-09-25 UTC, v1.1: po implementaciji posodobljena sledljivost na dejansko
  kodo, imena testov in uspešni končni zagon. Pravila in sprejemni pogoji niso
  spremenjeni. A07 je parametriziran za obe ločili. Popravek testnega pripomočka
  in oba celotna zagona sta ohranjena v zapisu preverjanj.
