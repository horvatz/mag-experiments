# P03 – Zapis preverjanja

Datum: 2026-10-10. Vsa preverjanja so bila izvedena v tem okolju z
nameščenim Chromiumom prek `wsEndpoint` iz `task/browser.json`.

## Izvedeni ukazi in rezultati

| Ukaz | Rezultat |
| --- | --- |
| `npm run typecheck` (`tsc --noEmit`) | uspešno, brez napak |
| `npm run lint` (`eslint .`) | uspešno, brez opozoril |
| `npx playwright test --project=development-desktop --project=development-mobile` | 8/8 razvojnih preverjanj P03 uspešnih |
| `npx playwright test --project=agent` | 10/10 lastnih agentnih preverjanj uspešnih |
| `npm run check` (lint + build + vsi testi) | 56/56 preverjanj uspešnih (izhodišče + razvojni P03 + agentni) |

Dokaz: dnevnik zagona `npm run check`, zaključek `56 passed (19.9s)`.

## Sledljivost zahtev R01–R12

| Zahteva | Test/scenarij | Dejanski izid |
| --- | --- | --- |
| R01 | D01; A01; A08 | uspešno: ob nalaganju vsa opravila v izvornem vrstnem redu, prazni filtri |
| R02 | A01 (`ČAS`, `cas`, `ŽIVA`); D01 (`CAS`) | uspešno: NFD normalizacija, `č`=`c`, neobčutljivo na velikost |
| R03 | A02 (`vsebine pregled`, `pregled vsebine`, `(a1)`, `web.0`, beline) | uspešno: besede v poljubnem vrstnem redu, ločila dobesedna, prazen vnos ne omejuje |
| R04 | D02; A04 (iskanje + stanje + oseba, neujemanje osebe) | uspešno: logični IN, natančna primerjava osebe |
| R05 | A05 (skrita imena, prazno ime, enkratnost); A09 | uspešno: možnost `all` + vsako različno neprazno ime enkrat |
| R06 | D02; A06 (isti ID-ji, stolpci le svojega stanja, filtriranje ob preklopu) | uspešno |
| R07 | A09 (filtriranje pred menjavo projekta) | uspešno: ob menjavi `q=''`, `s=all`, `a=all` |
| R08 | A08 (osvežitev, hash, `localStorage`/`sessionStorage` prazna) | uspešno |
| R09 | D04 (`Prikazano: 4 od 8.`); A04/A06 (povzetek in števci stolpcev) | uspešno |
| R10 | D03; A07 (sporočilo v obeh pogledih, prazen projekt `0 od 0.`) | uspešno |
| R11 | D03; A03 (`Počisti filtre`, privzetki, izvorni vrstni red) | uspešno |
| R12 | D04 in A10 (`readonly` brez zapisov, navigacija, podrobnosti, širina 390 px); baseline desktop/mobile | uspešno |

## Lastna preverjanja (tests/agent/P03-agent.spec.ts)

- A01 privzetki in normalizacija č/c/velikost črk.
- A02 besedni podnizi, vrstni red, dobesedna ločila, prazna belina.
- A03 počistitev filtrov in izvorni vrstni red.
- A04 logični IN, natančna oseba, `Prikazano: N od M.`, povzetek stanj.
- A05 popoln in enkraten izbirnik oseb ne glede na druge pogoje.
- A06 enaki filtrirani ID-ji v preglednici in tabli, števci stolpcev.
- A07 stanje `Ni zadetkov.` v obeh pogledih; prazen projekt `0 od 0.`.
- A08 osvežitev/URL/shramba ne ohranijo filtrov.
- A09 menjava projekta ponastavi filtre in ne pomeša podatkov.
- A10 filtriranje ne piše na strežnik, navigacija/podrobnosti delujejo,
  pri širini 390 px se stran ne razširi (notranji drsnik preglednice/tabele).

## Omejitve in nepreverjeni deli

- Skriti končni testi izvajalca niso dostopni; niso bili izvedeni in niso
  navedeni kot uspešni.
- Preverjanje je poteklo na razvojnih podatkih in dodatnih agentnih primerih;
  končni primeri lahko uporabijo drugačne podatke znotraj opisane domene.
- Niso preverjeni: sočasne spremembe podatkov brez osvežitve, navigacija med
  nezaključenim nalaganjem (obstoječe regresije) in vedenje ob napakah
  filtriranja, ker teh zahtev ni.
- Iskanje združuje polja z ločilom presledek; beseda, ki bi nastala šele na
  stiku dveh polj, se ne šteje za zadetek (zapisano v specifikaciji).
