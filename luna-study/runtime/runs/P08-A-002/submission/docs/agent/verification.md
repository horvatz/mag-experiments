# P08 — zapis preverjanja

## Končni rezultat

Končni zagon `npm run check` je 2026-09-27 uspešno zaključil lint, TypeScript preverjanje, produkcijski build in vseh **54 testov**. Rezultat Playwrighta: **54 passed (19.8s)**.

| Skupina v `npm run check` | Izid |
| --- | --- |
| ESLint (`npm run lint`) | Uspešno |
| TypeScript (`tsc --noEmit`) | Uspešno |
| Vite produkcijski build | Uspešno |
| API izhodišče | 14/14 uspešnih |
| Desktop izhodišče | 12/12 uspešnih |
| Mobile izhodišče | 12/12 uspešnih |
| P08 razvojni testi, desktop in mobile | 8/8 uspešnih |
| Lastni testi `tests/agent/P08.spec.ts` | 8/8 uspešnih |

Ločeni zagon `npx playwright test --project=agent` je prav tako zaključil **8/8**. Končni celotni zagon je bil izveden po zadnji spremembi testov.

V zgodnejših vmesnih zagonih sta TypeScript preverjanje ovirali tipizacija ključa števca in tip inferiranih testnih podatkov; popravljena sta bila pred končnim zagonom. V eni vmesni izvedbi lastnih testov so bili napačno nastavljeni statusi testnih rokov; popravljene testne priprave so nato uspešno prestale samostojni in celotni zagon.

## Povezava zahtev z dokazi

| Zahteve | Dejanski dokaz | Rezultat |
| --- | --- | --- |
| R01 | Razvojni `D01`; agentni `project navigation and reload reset local date and deadline selection` preveri fiksni začetni datum, filter `all`, reload in menjavo projekta. | Uspešno |
| R02–R04 | Razvojni `D01`, `D02`, `D04`; agentna `calendar groups include both week boundaries, leap day and done regardless of due date` preveri zgodnji rok za `done`, pred/dan referenčnega datuma, +7/+8, števce in ID-je. | Uspešno |
| R04–R05 | Agentna `calendar difference crosses the year boundary by one to seven full days` preveri `2024-12-31` proti `2025-01-01`, `2025-01-07` in `2025-01-08`. Prejšnji agentni test preveri prestopni dan `2024-02-29` in prehod februar–marec. | Uspešno |
| R06 | Agentni koledarski test preveri vseh pet števil in potrdi, da ostanejo enaka po izbiri filtrov; `empty projects have five zero counters and an empty state` preveri ničle. | Uspešno |
| R07 | Razvojni `D01`–`D04` in agentna koledarska testa preverijo filtrirane ID-je in vrstni red v preglednici; primerjava preglednice in table preveri enak nabor ID-jev. | Uspešno |
| R08–R09 | Razvojni `D03` preveri prazen osnutek, opozorilo, ohranjen izračun in novo veljavno vrednost; agentni `reference draft, selected group and filtered IDs survive switching views` preveri osnutek, filter in ID-je ob preklopu table/table. | Uspešno |
| R10 | Agentni projektni test preveri ponastavitev ob reloadu in menjavi projekta ter odsotnost datuma/skupine v hash in `localStorage`. | Uspešno |
| R11 | Agentna `empty groups in non-empty project keep recovery controls available` in `empty projects have five zero counters and an empty state`. | Uspešno |
| R12 | Razvojni `D04` in agentni `deadline review and details stay read only with original calendar dates and text` preverita nič zapisov, izviren datum in opis. Agentni mobilni test pri 390 px preveri širino strani ter notranje drsenje preglednice in table. | Uspešno |

Podrobna povezava zahtev, pravil in lokacij kode je v [specifikaciji](specification.md). Preverjanje širine 390 px je izvedeno v Chromiu prek Playwrighta; ročni vizualni pregled ni bil izveden.

## Omejitve in nepreverjeno

- Koledarska aritmetika v `src/deadlines.ts` uporablja UTC-koledarski ordinal, zato ne sešteva lokalnih časovnih obdobij in je v kodi neodvisna od poletnega časa. Testov nismo zagnali v več različnih časovnih pasovih.
- Vmesnik `input[type=date]` uporabniku ne omogoča nepraznega neveljavnega datuma; preverjen je prazen vnos in več veljavnih, tudi prestopnih datumov.
- Končni skriti testi niso bili na voljo. Testna pokritost ne izčrpa vseh mogočih velikosti seznamov in Unicode nizov, čeprav implementacija filtrira poljubno dolg API seznam po ID-jih in ne preoblikuje vsebine opravil.
- `git status --short` ni bil na voljo v okolju: `xcrun` je sporočil neveljavno pot do Command Line Tools. To ni preprečilo builda ali testov; spremembe, ki sem jih pripravil, so v `src/`, `tests/agent/` in `docs/agent/`.
