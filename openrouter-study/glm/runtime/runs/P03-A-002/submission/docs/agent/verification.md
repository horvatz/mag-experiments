# Preverjanje P03

## Izvedena preverjanja

| Preverjanje | Ukaz ali scenarij | Rezultat |
| --- | --- | --- |
| Tipizacija | `npm run typecheck` | Uspešno. |
| Lint | `npm run lint` | Uspešno. |
| Lastni testi | `npx playwright test --project=agent` | 7 od 7 uspešno. |
| Skupni razvojni testi | `npx playwright test --project=development-desktop --project=development-mobile` | 8 od 8 uspešno. |
| Popolno preverjanje | `npm run check` | 53 od 53 uspešno. |

Lastna preverjanja pokrivajo privzeti prikaz, normalizirano iskanje po več besedah, ločila, kombinirane filtre, možnosti oseb, preklop projekta, oba pogleda, števce, prazne zadetke, prazen projekt, počiščenje filtrov, osvežitev, trajno shrambo, navigacijo, podrobnosti, pisanje po API in širino 390 px.

## Sledljivost zahtev

| Zahteva | Preverjanje |
| --- | --- |
| R01 | A01. |
| R02 | A01, D01. |
| R03 | A01. |
| R04 | A01, D02. |
| R05 | A02. |
| R06 | A03, D02. |
| R07 | A02. |
| R08 | A06. |
| R09 | A04, D04. |
| R10 | A03, A04, D03. |
| R11 | A05, D03. |
| R12 | A07 in izhodiščni testi v `npm run check`. |

## Rezultati

- `npm run check` je uspešno izvedel lint, build, tipizacijo, 38 izhodiščnih preverjanj, 8 razvojnih preverjanj P03 in 7 lastnih preverjanj.
- Med prvim zagonom lastnih testov sta bila neuspešna A01 in A04. A01 je imel napačen testni iskalni niz, A04 pa je potreboval osvežitev po spremembi preslikanega odgovora. Po popravku testov sta oba uspešna; produkcijske kode ni bilo treba spreminjati.
- Nobena zahteva R01–R12 ni neizpolnjena.

## Omejitve

- Sočasnega spreminjanja podatkov brez osvežitve in navigacije med nezaključenim nalaganjem nisem preverjal, ker navodila ti dve scenariji izrecno ne zajevata.
- Preverjanja so potekala v lokalnem Playwright/Chromium okolju z nadzorovanimi API odgovori; javni internet ni bil potreben.

## Spremembe

- `src/App.tsx` – iskanje, filtri, števci in rezultati.
- `src/filters.css` – slogi kontrol in ozka širina.
- `tests/agent/P03.spec.ts` – lastna preverjanja A01–A07.
- `docs/agent/specification.md` – specifikacija, predikati in sledljivost.
