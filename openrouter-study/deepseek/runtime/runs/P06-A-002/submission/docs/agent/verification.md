# P06 – zapis preverjanja

## Izvedeni ukazi in rezultati

1. `npx playwright test --project=development-desktop --project=development-mobile --project=agent`
   (30. 10. 2026, ~20:07): 19 uspešnih, 1 neuspešen test. Neuspeh je bil v
   lastnem testu T09: pričakovani niz je uporabil literalni `\t` namesto
   tabulatorja; izdelek je vrnil pravilen tabulator. Popravljena je bila samo
   pričakovana vrednost v `tests/agent/P06.spec.ts`.
2. `npm run check` (isti dan, ~20:09): uspešno – `eslint`, `tsc --noEmit`,
   `vite build` in vsi testi; skupaj **58 uspešnih, 0 neuspešnih**:
   - 38 izhodiščnih preverjanj (26 baseline desktop/mobile + 12 api),
   - 8 razvojnih preverjanj P06 (D01–D04 × desktop/mobile),
   - 12 lastnih preverjanj (T01–T12, projekt `agent`).

Dnevnik zadnjega zagona (izrezek): `58 passed (22.6s)`.

## Povezave zahtev z dokazi

| Zahteva | Testi | Rezultat |
| --- | --- | --- |
| R01 | D01 (razvojni), T01, T02 | uspešno: privzeti izvoz ima glavo v kanoničnem vrstnem redu, vse kolone, vrstni red opravil projekta; T02: izvoz drugega projekta (`folio-launch.csv`) ne vsebuje opravil projekta web |
| R02 | D02, T03 | uspešno: izbor v obratnem vrstnem redu klikov da glavo `"id";"title"`; checkboxi imajo imena `Stolpec <ime>` |
| R03 | T03, T04 | uspešno: brez izbranih kolon je gumb onemogočen in `dispatchEvent('click')` ne sproži prenosa; ponovni izbor kolone gumb omogoči |
| R04 | D02, T05, T06, T07 | uspešno: filter `done` izvozi samo `web-03` in `web-06`, tabela še vedno prikaže 8 vrstic; prazen projekt in prazen filtrirani rezultat onemogočita gumb |
| R05 | D01, T01, T02, T10 | uspešno: ime `folio-web.csv` / `folio-launch.csv`, BOM U+FEFF na začetku, prenos prek dogodka `download`, brez nove strani (T10 preveri število strani brskalnika) |
| R06 | D02, D03, T08 | uspešno: ločili `;` in `,`, vsaka glava/vrednost v narekovajih, `"Zapis, ""citat"""` |
| R07 | D01, D03, T08 | uspešno: vsebina se konča s CRLF, opis `Prva vrstica\nDruga vrstica; čšž` ostane znotraj navedenega polja |
| R08 | D03, T09 | uspešno: `'=SUM(A1)`, `'+opis`, `'  =z amik`, `'\t+tab`, `'\r\n-lf`, `'@at`, `'-minus`; `"normal =x"`, `" a=b"` in `"   "` ostanejo nespremenjeni; glava ni nevtralizirana |
| R09 | D03, T01, T09 | uspešno: `in_progress` kot interna vrednost, `2026-09-18` kot izvirni datum, šumniki in Unicode ohranjeni |
| R10 | D04, T10 | uspešno: preklop Tabla ohrani izbor kolon, ločilo in filter; drugi izvoz je bajtno enak prvemu |
| R11 | T08, T11 | uspešno: zaporedna izvoza z `;` in `,` se razlikujeta po trenutnih nastavitvah; menjava projekta in `page.reload()` ponastavita na vse kolone, `;`, `all` |
| R12 | D04, T10, T12 | uspešno: `readonly` potrdi 0 zapisov na `/api/` in 0 v `/__test/state`; pri 390 px `scrollWidth <= innerWidth` v obeh pogledih; aplikacija ne uporablja `/__test/` |

Lastni testi so v `tests/agent/P06.spec.ts` (T01–T11) in
`tests/agent/P06-mobile.spec.ts` (T12); uporabljajo javne pomočnike razvojnih
testov (`tests/development/helpers.ts`), ne spreminjajo pa jih.

## Spremembe izdelka

- `src/csv.ts`: kanonične kolone, `neutralizeFormula`, `buildCsv` (BOM, CRLF, narekovaji).
- `src/ExportPanel.tsx`: kontrole izvoza in stanje (kolone, ločilo, filter), prenos prek Blob + `a[download]`.
- `src/App.tsx`: vključitev `ExportPanel` v razdelek opravil (skupen obema pogledoma).
- `src/styles.css`: slog `.export-*` z zavijanjem vrstic in prilagoditvijo pod 760 px.

## Omejitve in nepreverjeni deli

- Končnih (skritih) preverjanj naloge ni bilo mogoče zagnati; niso navedena
  kot opravljena.
- Razvojni testi pokrivajo D01–D04; zahteve R02, R03, R08 (robni primeri), R11
  so dodatno pokrite le z lastnimi testi.
- Preverjanje je bilo izvedeno v Chromiumu prek priloženega `wsEndpoint`;
  druge brskalnike ali naprave nisem preverjal.
- Stanje nastavitev se med osvežitvijo ne ohrani (skladno z R11) in ni
  shranjeno v URL; to ni zahteva in ni bilo preverjeno.
