# Poročilo implementacije in preverjanja (P06)

Vloga: implementer. Začetek: 2026-10-09 (faza B).
Podlaga: `docs/agent/specification.md` (v1.0), `task/instructions.md`, `PROJECT_RULES.md`.

## Načrt preverjanj (na začetku, neizvedeno)

| Zahteva | Preverjanje | Status |
| --- | --- | --- |
| R01 | D01 (privzetki, vrstni red, BOM, CRLF) | načrtovano |
| R02 | D02 + lastni test obratnega vrstnega reda klikov | načrtovano |
| R03 | lastni test: odklop vseh kolon -> gumb onemogočen; ponovni izbor omogoči | načrtovano |
| R04 | D02/D04 + lastni test praznega filtriranega rezultata | načrtovano |
| R05 | D01/D04: ime `folio-web.csv`, BOM, brez pisnih zahtev | načrtovano |
| R06 | D02/D03: ločilo, narekovanje, podvojeni narekovaji | načrtovano |
| R07 | D01/D03: CRLF tudi na koncu, večvrstična vrednost | načrtovano |
| R08 | D03 + lastni robni testovi (`=`,`+`,`-`,`@`, vodilni presledek/tab) | načrtovano |
| R09 | D03: Unicode, opis, status, datum | načrtovano |
| R10 | D04: enaki bajti pred/po preklopu pogleda | načrtovano |
| R11 | lastni test: menjava projekta/osvežitev ponastavi nastavitve | načrtovano |
| R12 | D04: `readonly` (brez pisnih zahtev, saveRequests 0, brez prelivanja) | načrtovano |
| vse | `npm run check` (slog, tipi, gradnja, 38+8+lastni testi) | načrtovano |

## Spremembe

- `src/csv.ts` (nov): `CSV_COLUMNS` (nespremenljiv vrstni red), `filterTasks`,
  `quoteCsv` (vedno narekovano, podvojeni notranji narekovaji), `neutralizeFormula`
  (apostrof pred `=`,`+`,`-`,`@` tudi za vodilnimi ` \t\r\n`), `buildCsv`
  (U+FEFF, CRLF tudi za zadnjo vrstico, izbira kolon vedno v vrstnem redu `C`)
  in `downloadCsv` (Blob + `download=folio-<projectId>.csv`, brez omrežja).
- `src/App.tsx`: `ProjectView` dobi stanje `columns`/`separator`/`filter`; kontrole
  Stolpci (checkboxi `Stolpec <ime>`), `Ločilo CSV`, `Filter izvoza`, gumb
  `Izvozi CSV` z `disabled`, ko ni kolon ali je filtrirani rezultat prazen.
  Stanje živi v `ProjectView` (preživi preklop pogleda) in se ponastavi ob
  menjavi projekta (`key={project.id}` v `App`) in osvežitvi.
- `src/styles.css`: prilagodljiva vrstica kontrol (`.export-*`), na ozkih
  zaslonih se prelomi; obstoječi videz in razporeditev ostalih elementov nespremenjena.
- `tests/agent/export.spec.ts` (nov): A01–A05 lastna preverjanja.

## Dejanski rezultati

- `npm run check` (2026-10-09): **51 passed, 0 failed** (18.9 s) – vključuje
  `eslint`, `tsc --noEmit`, `vite build`, 38 osnovnih testov (desktop+mobile+api),
  8 razvojnih P06 in 5 lastnih.
- Razvojni `tests/development/P06.spec.ts` D01–D04: uspešno na
  `development-desktop` in `development-mobile`.
- Lastni `tests/agent/export.spec.ts`:
  - A01 (R03): odklop vseh 7 kolon onemogoči gumb, ponovni izbor ga omogoči.
  - A02 (R04): filter `in_progress` v projektu launch (brez ujemajočih vrstic)
    onemogoči izvoz, `todo` ga omogoči; prikaz se ne filtrira.
  - A03 (R02): kliki v obratnem vrstnem redu dajo glavo v vrstnem redu `C`.
  - A04 (R08): `+plus`, `-minus`, `@at`, ` =eq`, `\t+tab` dobijo apostrof;
    glava in `navaden` ostaneta nespremenjena.
  - A05 (R11): menjava projekta in `page.reload()` ponastavita `S = C`,
    `sep = ';'`, `f = all`; izvoz po menjavi uporabi privzetke.
- R05/R06/R07/R09/R10/R12: dokazani z D01–D04 (BOM in ime, narekovanje in
  podvojeni narekovaji, CRLF na koncu, Unicode/večvrstični opis, enaki bajti
  pred/po preklopu pogleda, `readonly`: brez pisnih zahtev, `saveRequests = 0`,
  `scrollWidth <= innerWidth` na mobilnem profilu).
- Preslikava R01–R12: R01→D01+A03, R02→D02+A03, R03→A01, R04→D02+A02,
  R05→D01/D04, R06→D02/D03, R07→D01/D03, R08→D03+A04, R09→D03,
  R10→D04, R11→A05, R12→D04+`readonly`.

## Omejitve in odprta vprašanja

- R12 ni preverjen z ročnim ogledom v brskalniku; preverjen je z avtomatiziranim
  `readonly` na mobilnem profilu (390 px) in desktop profilu.
- Neuspeh samega prenosa (npr. blokiranje s strani brskalnika) ni scenarij v
  obsegu; koda ob napaki ne spreminja stanja, prenosa napake v vmesnik ni.
- Sočasne spremembe podatkov med nalaganjem in trajna shramba nastavitev niso
  del obsega (skladno s specifikacijo).
- Specifikacija ni bila spremenjena; med implementacijo nisem našel napake v
  specifikaciji. Opomba: R08 zahteva nevtralizacijo tudi za `@`; prva različica
  lastnega testa je to napačno pričakovala, implementacija je bila pravilna.
- Okolje: heredoc v lupini občasno ni na voljo (sandbox), zato so datoteke
  zapisane z `apply_patch`; to ne vpliva na izdelek. Javni internet je blokiran,
  uporabljene so samo lokalne storitve in `chromium.connect` prek `task/browser.json`.
