# Preverjanje rešitve — P05: Straničenje in filter stanja

Datum: 2026-10-08. Okolje: macOS, Node 24.11.1, Playwright 1.63.0 z
nameščenim Chromiumom iz `task/browser.json` (povezava prek `wsEndpoint`).
Vsi ukazi so bili izvedeni v korenu aplikacije.

## Dejansko izvedena preverjanja

| Ukaz | Rezultat |
| --- | --- |
| `npm run typecheck` (`tsc --noEmit`) | uspešno, brez napak |
| `npm run lint` (`eslint .`) | uspešno, brez opozoril |
| `npm run build` (typecheck + `vite build`) | uspešno |
| `npx playwright test --project=development-desktop --project=development-mobile` | 8/8 uspešno (D01–D04 na obeh širinah) |
| `npx playwright test --project=agent` | 10/10 uspešno (A01–A10) |
| `npm run check` (lint + build + vsi testi) | 56 uspešno, 0 neuspešno, 21,0 s: 38 izhodiščnih/API, 8 razvojnih P05, 10 lastnih |

Testi uporabljajo lastni strežnik na vratih 5174/3102 (`reuseExistingServer:
false`), skupni testi so bili izvedeni nespremenjeni. Skupni razvojni testi
podatke podajajo prek testnega prijema `page.route` v `tests/development/helpers.ts`;
lastni testi uporabljajo isti pripomoček `mount`.

## Sledljivost zahtev R01–R12

| Zahteva | Dejansko preverjeno | Rezultat in dokaz |
| --- | --- | --- |
| R01 | A01: privzeti `all`/`all`, 8 ID-jev v izvornem vrstnem redu, status `Stran 1 od 1. Prikazano 1–8 od 8.` | uspešno (`[agent] A01`); D01/D03 potrjujeta enako na skupnih podatkih |
| R02 | A02: strani 1–4 pri velikosti 2 (`web-01/02`, `web-03/04`, `web-07/08`), A03: velikost 5 → `web-01…05`, velikost 10 → vseh 8; D01/D02 | uspešno; odseki so `slice` filtriranega polja, zato se noben ID ne izgubi ali podvoji |
| R03 | A02: Prva/Prejšnja onemogočena na strani 1, Naslednja/Zadnja onemogočena na strani 4; A05: vsi štirje onemogočeni pri praznem rezultatu; D02 | uspešno; onemogočeni gumbi ne spremenijo stanja |
| R04 | A03: velikost 2 → Zadnja stran → velikost 5 vrne na `Stran 1 od 2`; velikost `all` → `Stran 1 od 1`; D04 | uspešno |
| R05 | A04: filter `todo` iz strani 2 vrne na stran 1 (`web-02, web-04, web-07, web-08`), `in_progress` → `web-01, web-05`, `done` → `web-03, web-06`; D03 | uspešno; filter se uporabi pred straničenjem, vrstni red ostane izvorni |
| R06 | A07: stran 2 pri velikosti 5 v tabli da iste ID-je `web-06/07/08` kot preglednica; D03 | uspešno; tabla združi odsek v stolpce (DOM vrstni red po stolpcih, množica ID-jev enaka) |
| R07 | A08: velikost 2 + stran 2, preklop na tablo, odprtje in zaprtje podrobnosti `web-03` → še vedno `Stran 2 od 4. Prikazano 3–4 od 8.` | uspešno |
| R08 | A08: prehod web → launch → web ponastavi na `all`/`all`/stran 1; A09: `page.reload()` prav tako; hash ostane `#/projects/web`, `localStorage` in `sessionStorage` prazna | uspešno |
| R09 | A01/A02/A03/A04/A06/A08/A09: natančno besedilo z pomišljajem U+2013; D02: `Stran 2 od 2. Prikazano 6–8 od 8.` | uspešno |
| R10 | A05: prazen projekt → `Stran 0 od 0. Prikazano 0–0 od 0.` + vsi gumbi onemogočeni; A06: prazen rezultat filtra, vrnitev filtra na `all` → `Stran 1 od 2` in prva stran | uspešno |
| R11 | A07: ob strani 2 velikosti 5 so števci stolpcev `2/0/1`, pregled stanj ostane `4/2/2`, značka ob naslovu `8`, noga `2 / 8 končanih` | uspešno |
| R12 | A09: `readonly` (nič ne-GET zahtev na `/api/`, `saveRequests = 0`), povezave in podrobnosti delujejo (A08), A10 pri 390 px `scrollWidth <= innerWidth` pred in po premiku; D04 prav tako preveri odsotnost zapisov | uspešno |

## Popravki med preverjanjem

- Prvi zagon lastnih testov: A07 in A08 sta padla, ker sta pričakovala
  izvorni vrstni red ID-jev tudi v tabli, tabla pa elemente združuje po
  stolpcih (R06). Implementacija je bila skladna z zahtevo; popravljeni so
  bili testi (primerjava množice namesto vrstnega reda). Vsebina
  specifikacije se ni spremenila, zato je v njej zabeležena le različica
  v1.1 z dokazi.

## Omejitve in neizvedeno

- Končnih ocenjevalnih testov naloge ni mogoče zagnati; niso navedeni kot
  opravljeni. Preverjeni so vsi dostopni skupni testi (izhodišče, API,
  razvojni P05) in lastni testi.
- Ročni vizualni pregled v brskalniku ni bil izveden; videz in odsotnost
  vodoravnega prelivanja sta preverjena strojno (A10, `readonly` v D04 in
  izhodiščni testi), ne z oceno posnetka.
- Vzorčni podatki testov pokrivajo 0, 1, 3 in 8 opravil; splošna pravila
  (poljubno število, enaki naslovi, unicode) so zajeta v izračunu
  `paginate`, posamezne kombinacije (npr. >10 opravil, več strani pri
  velikosti 10) niso bile neposredno izvedene.
- Vzporedne spremembe podatkov med prikazom strani in vedenje ob napaki
  strežnika med straničenjem niso bili testirani; naloga tega ne zahteva.
