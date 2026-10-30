# P06 – razvojna specifikacija: nastavljiv izvoz CSV

## Problem in kontekst

Uporabnik v Folio pregleduje opravila enega projekta v pogledu Preglednica ali
Tabla. Namen dodatka je, da lahko izvozi opravila trenutnega projekta v CSV z
izbiro kolon, filtra stanja in ločila. Izhodišče te funkcije ne vsebuje;
obstoječi pogledi, branje podatkov prek javnega API-ja `/api/` in videz Folio
ostanejo nespremenjeni.

## Vhodi, dejanja in izidi

Vhodi: seznam opravil trenutnega projekta iz `GET /api/projects/<id>/tasks`
(v izvornem vrstnem redu), izbor kolon, ločilo in filter v novem orodju.
Dejanja: potrditev/odvzem kolone, izbira ločila, izbira filtra, klik na
`Izvozi CSV`, preklop pogleda, menjava projekta, osvežitev strani.

Izidi:

- Uspeh: brskalnik prenese `folio-<projectId>.csv` z UTF-8 BOM, glavo in
  vrsticami po spodnjih pravilih. Nobeno opravilo se ne spremeni in noben
  zapis se ne pošlje na strežnik.
- Preklic/nezmožnost: če ni izbrane nobene kolone ali je rezultat filtra
  (oz. projekt) prazen, je gumb `Izvozi CSV` onemogočen in prenosa ni.
- Napaka: če opravil ni mogoče naložiti, se izvoz ne prikaže (obstoječi
  pogled napake ostane).

Stanje nastavitev je lokalno trenutnemu projektu; menjava projekta in
osvežitev strani ga ponastavita na privzete vrednosti.

## Zahteve in pravila

Simboli in predpostavke:

- `C = (id, projectId, title, status, assignee, dueDate, description)` je
  nespremenljiv kanonični vrstni red kolon.
- `S ⊆ C` izbrane kolone, `sep ∈ {";", ","}`, `f ∈ {all, todo, in_progress, done}`.
- `T` opravila trenutnega projekta v vrstnem redu API-ja; `rows(f) = T`, če
  `f = all`, sicer `[t ∈ T : t.status = f]`.
- `quote(x) = '"' + x.replaceAll('"', '""') + '"'`.
- `neutral(x) = "'" + x`, če `x` ustreza `^[ \t\r\n]*[=+\-@]`, sicer `x`.
- `csv(T, S, sep) = BOM + header + CRLF + (vrstice, ločene s CRLF) + CRLF`,
  `header = sep-join(quote(c) za c ∈ C ∩ S v kanoničnem vrstnem redu)`.
- `enabled ⇔ S ≠ ∅ ∧ rows(f) ≠ ∅` (izvoz je mogoč).
- `P.id` je ID trenutnega projekta.

| Zahteva | Pravilo oziroma sprejemni pogoj | Način preverjanja |
| --- | --- | --- |
| R01 | Začetno stanje: `S = C`, `sep = ";"`, `f = all`; izvoz je natanko `csv(T, C, ";")`, vrstice ohranijo vrstni red `T`. | Razvojni D01, lastni T01/T02 |
| R02 | `header` in celice sledijo vrstnemu redu `C` ne glede na vrstni red klikov; vsaka kolona ima checkbox z imenom `Stolpec <ime>`. | Razvojni D02, lastni T03 |
| R03 | `S = ∅ ⇒ ¬enabled` in klik ne ustvari prenosa; ponovna izbira kolone pri `rows(f) ≠ ∅` spet omogoči izvoz. | Lastni T03/T04 |
| R04 | Izvožene so natanko vrstice `rows(f)`; vmesnik še vedno prikazuje vse `T`; `T = ∅ ∨ rows(f) = ∅ ⇒ ¬enabled`. | Razvojni D02, lastni T05/T06 |
| R05 | Prenos ima ime `folio-<P.id>.csv`, vsebina se začne z BOM U+FEFF; prenos se zgodi z `download`, brez nove strani in brez pošiljanja vsebine na strežnik. | Razvojni D01, lastni T01/T09 |
| R06 | `sep` je `;` ali `,`; vsaka glava in vsaka vrednost je `quote(...)`; notranji `"` je podvojen. | Razvojni D02/D03, lastni T07 |
| R07 | Vrstice so ločene s CRLF in tudi zadnja vrstica se konča s CRLF; `sep` in prelomi v vrednostih ostanejo znotraj navedenega polja. | Razvojni D01/D03, lastni T07 |
| R08 | Za vse podatkovne kolone velja `cell = quote(neutral(v))`; glava se ne nevtralizira; drugi nizi ostanejo nespremenjeni. | Razvojni D03, lastni T08 |
| R09 | Unicode, presledki in opisi se ohranijo; `status` je interna vrednost (`todo/in_progress/done`), `dueDate` izvirni `YYYY-MM-DD`. | Razvojni D03, lastni T07/T08 |
| R10 | Preklop Preglednica/Tabla ohrani `S`, `sep` in `f`; isti nastavitvi v obeh pogledih dasta enake bajte. | Razvojni D04, lastni T09 |
| R11 | Menjava projekta ali osvežitev ponastavi `S = C`, `sep = ";"`, `f = all`; zaporedna izvoza vedno uporabita trenutne nastavitve. | Lastni T07/T10 |
| R12 | Izvoz in kontrole ne spreminjajo opravil, ne pošiljajo zapisov na API, ne uporabljajo `/__test/`; videz ostane odziven (brez vodoravnega prelivanja pri 390 px). | Razvojni D04, lastni T09/T11 |

## Izvedba in sledljivost

| Zahteva | Pogoj | Test ali scenarij | Datoteka in del kode | Izid ter dokaz |
| --- | --- | --- | --- | --- |
| R01 | privzeti izvoz | razvojni D01; lastni T01, T02 | `src/csv.ts` (`COLUMNS`, `buildCsv`), `src/ExportPanel.tsx` (začetno stanje) | glej `verification.md` |
| R02 | kanonični vrstni red | razvojni D02; lastni T03 | `src/csv.ts` `buildCsv`, `src/ExportPanel.tsx` checkboxi | glej `verification.md` |
| R03 | onemogočen izvoz | lastni T03, T04 | `src/ExportPanel.tsx` `canExport` | glej `verification.md` |
| R04 | filter omeji vrstice | razvojni D02; lastni T05, T06 | `src/ExportPanel.tsx` `rows` | glej `verification.md` |
| R05 | ime, BOM, prenos | razvojni D01; lastni T01, T09 | `src/ExportPanel.tsx` `downloadFile` | glej `verification.md` |
| R06 | narekovaji in ločilo | razvojni D02, D03; lastni T07 | `src/csv.ts` `quote` | glej `verification.md` |
| R07 | CRLF in prelomi | razvojni D01, D03; lastni T07 | `src/csv.ts` `buildCsv` | glej `verification.md` |
| R08 | nevtralizacija formul | razvojni D03; lastni T08 | `src/csv.ts` `neutralizeFormula` | glej `verification.md` |
| R09 | ohranjene vrednosti | razvojni D03; lastni T07, T08 | `src/csv.ts` `buildCsv` | glej `verification.md` |
| R10 | ohranitev nastavitev | razvojni D04; lastni T09 | `src/ExportPanel.tsx` stanje zunaj pogleda | glej `verification.md` |
| R11 | ponastavitev | lastni T10 | `src/App.tsx` `key={project.id}` | glej `verification.md` |
| R12 | brez zapisov | razvojni D04; lastni T09, T11 | `src/ExportPanel.tsx` (samo branje), `src/styles.css` | glej `verification.md` |

Rezultati in dokazi so v `docs/agent/verification.md` (imena testov, ukaz,
dnevnik). Noben izid ni označen kot uspešen brez dejanske izvedbe.

## Odprta vprašanja in omejitve

- Razporeditev novih kontrol ni predpisana; izbrana je vrstica pod naslovom
  razdelka, vidna v obeh pogledih.
- Končnih (skritih) testov ni mogoče zagnati; preverjeni so le izhodiščni,
  razvojni in lastni testi.
- Vrednosti v testnih podatkih so nizi; nevtralizacija se uporabi na vseh
  podatkovnih kolonah, tudi na `description`.
- Shramba nastavitev med osvežitvijo ni zahtevana; stanje je lokalno
  trenutnemu projektu.

## Zgodovina sprememb specifikacije

- 2026-10-30: prva različica (R01–R12, načrt preverjanja).
