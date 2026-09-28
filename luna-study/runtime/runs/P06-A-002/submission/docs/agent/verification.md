# P06 — preverjanje

## Izvedeni ukazi in rezultati

- `npm run check` — uspešno na 2026-09-28: ESLint, TypeScript `--noEmit`,
  Vite produkcijska gradnja in vseh 52 Playwright preverjanj.
- Razčlenitev Playwright: 14 API, 12 namiznih izhodiščnih, 12 mobilnih
  izhodiščnih, 4 namizna razvojna P06, 4 mobilna razvojna P06 ter 6 agentnih
  preverjanj; vsa so prestala.
- Med razvojem je prvi test praznega projekta delil isto stran z drugim
  prestreznikom API-ja in ni bil izoliran. Scenarij sem ločil v samostojen
  test; končni `npm run check` nato uspešno zaključil vseh 52 preverjanj.

## Povezava z zahtevami

| Zahteve | Dejanski dokaz v končnem zagonu | Rezultat |
| --- | --- | --- |
| R01 | Razvojni D01 privzeto ime/okvir/BOM; agentni »selected columns follow the fixed field order…« preveri vrstni red. | Uspešno |
| R02 | Agentni »selected columns follow the fixed field order, not the click order«. | Uspešno |
| R03 | Agentna »empty selection and empty result…« ter »an empty project…«. | Uspešno |
| R04 | Razvojni D02 in agentni »status filter changes exported rows but leaves the table intact«. | Uspešno |
| R05 | Razvojni D01 prenese pričakovano datoteko; agentni test formule preveri, da ostane ena stran. | Uspešno |
| R06 | Razvojna D02/D03; agentno preverjanje urejenega izbora in narekovajev. | Uspešno |
| R07 | Razvojni D01/D03 ter agentni opis s CR/LF, ločili in narekovaji. | Uspešno |
| R08 | Razvojni D03 ter agentni formule z `=`, `+`, `-`, `@` in začetnimi presledki/krmilnimi znaki. | Uspešno |
| R09 | Razvojni D03 in agentni preveri šumnike, surovi status, datum `2026-09-21` ter večvrstični opis. | Uspešno |
| R10 | Razvojni D04 primerja prenosa po preklopu table/preglednice ter preveri odsotnost zapisov; teče namizno in mobilno. | Uspešno |
| R11 | Agentni »project change and document refresh restore default export settings«. | Uspešno |
| R12 | D04 in `readonly` preverita brez zapisov ter brez prelivanja širine; osnovni namizni/mobilni testi so prestali. | Uspešno |

## Omejitve

- Zagon uporablja lokalni Chromium in pripravljene lokalne API odgovore;
  združljivost prenosa z zunanjimi preglednicami ni bila ročno preverjena.
- Preverjeni so reprezentativni robni podatki iz specifikacije (prazen
  projekt, več vrstic, podvojeni naslovi, Unicode, formule in prelomi vrstic),
  ne pa vsaka možna dolžina ali vsebina. Skriti končni testi niso bili na
  voljo in jih ne štejem kot izvedene.
- Sprejemni pogoji se po začetni specifikaciji niso spremenili; zato ni
  popravkov zahtev za beleženje.
