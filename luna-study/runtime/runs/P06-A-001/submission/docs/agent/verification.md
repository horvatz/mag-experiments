# P06 — preverjanje

Preverjeno 27. 9. 2026 z `npm run check` po zadnji spremembi kode in testov.
Ukaz je uspešno končal lint, TypeScript preverjanje, produkcijsko gradnjo in
vseh 53 Playwright preverjanj.

## Rezultati

| Skupina | Rezultat | Obseg |
| --- | --- | --- |
| Lint | Uspešno | `npm run lint` v okviru `npm run check`. |
| Tipi in gradnja | Uspešno | `tsc --noEmit`, Vite produkcijska gradnja. |
| Izhodiščni testi | 38/38 | 14 API, 12 desktop in 12 mobile. |
| P06 razvojni testi | 8/8 | D01–D04 v desktop in mobile projektu. |
| Agentni testi | 7/7 | `tests/agent/csv-export.spec.ts`. |
| Skupaj | **53/53 uspešno** | `npm run check`; Chromium. |

Med tekom so npm in Node izpisali opozorila o nastavitvi `http-proxy` in
`NO_COLOR`; niso vplivala na uspeh ukaza.

## Sledljivost zahtev

| Zahteva | Izveden scenarij in dokaz | Rezultat |
| --- | --- | --- |
| R01 | D01 preveri privzeto glavo, ločilo, BOM, zaključni CRLF in ime. Agentna »CSV keeps canonical columns and task order« preveri vrstni red API opravil; »CSV exports every record when a project has more than ten tasks« preveri 13 zapisov. | Uspešno. |
| R02 | Agentna kanonična glava izbere `title`, nato `id`, nato `description` in preveri vrstni red izhoda. | Uspešno. |
| R03 | Agentna kanonična glava odkljuka vse kolone, preveri onemogočen gumb, nato izbere tri kolone in prenese CSV. | Uspešno. |
| R04 | D02 in agentni »filter only changes the export…« preverita filtrirane vrstice in nespremenjen prikaz osmih opravil. »Project navigation and reload…« preveri prazen filter statusa, »empty projects…« prazen projekt. | Uspešno. |
| R05 | D01 preveri `folio-web.csv` in BOM. Agentna kanonična glava preveri, da se URL ne spremeni; `readonly` v tej in D04 preveri, da ni zapisovalnih zahtev. | Uspešno. |
| R06 | D02 preveri vejico kot ločilo; D03 in agentni natančni CSV preverita citiranje ter podvojene narekovaje. | Uspešno. |
| R07 | Agentni natančni CSV primerja celotno datoteko z vgrajenima CR in LF ter končnimi CRLF. | Uspešno. |
| R08 | D03 preveri nevtralizacijo formule. Agentni natančni CSV preveri `=`, `+`, `-`, `@` z začetnimi presledki, tabulatorjem, CR in LF; formula v testu nastopa v naslovu, odgovorni osebi in opisu. | Uspešno. |
| R09 | Agentni natančni CSV primerja neobdelan Unicode, presledek, interno stanje `todo`, datum `YYYY-MM-DD`, ločila in opis. | Uspešno. |
| R10 | D04 primerja prenos v preglednici in na tabli. Agentni »filter only changes the export…« primerja iste prenose po preklopu v tablo in nazaj. | Uspešno. |
| R11 | Agentni »filter only changes the export…« opravi zaporedne izvoze po spremembi filtra/ločila. »Project navigation and reload…« preveri privzete vrednosti po menjavi projekta in osvežitvi. | Uspešno. |
| R12 | D04 in agentni scenarij preverita odsotnost zapisov; agentna kanonična glava preveri isti URL. »Controls fit a narrow screen…« preveri širino dokumenta pri 390 px. | Uspešno. |

Razvojni scenariji so v
[`tests/development/P06.spec.ts`](../../tests/development/P06.spec.ts), agentni
pa v [`tests/agent/csv-export.spec.ts`](../../tests/agent/csv-export.spec.ts).
Izvedba je v [`src/App.tsx`](../../src/App.tsx),
[`src/csvExport.ts`](../../src/csvExport.ts) in
[`src/styles.css`](../../src/styles.css).

## Omejitve

- Na voljo so bili Chromium, lokalni API in pripravljeni razvojni testi;
  zasebni končni testi niso bili dostopni. Firefox in Safari nista bila
  preverjena.
- Odzivnost je avtomatizirano preverjena pri 390 px; ročni pregled drugih
  velikosti ni bil izveden.
- Formula je preverjena v naslovu, imenu odgovorne osebe in opisu. Ostala
  podatkovna polja gredo skozi isti `quoteCsv` pri serializaciji, niso pa bila
  ločeno nastavljena na zlonamerne nize v agentnem testu.
- Med razvojem sta bila odpravljena dva neuspeha v agentnih preverjanjih:
  popravljena je bila napačna pričakovana vrednost opisa, nato pa je bil
  scenarij praznega projekta ločen, ker je Playwrightov pomočnik pri večkratni
  namestitvi na isti strani ohranil predhodni API prestreznik. Končni ukaz
  `npm run check` je nato opravil vseh 53 preverjanj.
