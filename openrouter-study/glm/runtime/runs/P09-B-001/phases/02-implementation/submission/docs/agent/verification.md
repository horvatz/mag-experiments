# Implementacijsko poročilo P09

## Načrt preverjanja

- Pregled predane specifikacije, izvirnih zahtev in obstoječe implementacije.
- Implementacija razčlenjevanja hash URL, normalizacije iskanja, filtriranja, urejanja, osnutka kontrol in povezav.
- Dodanje lastnih testov v `tests/agent/` za normalizacijo/URL, zgodovino, navigacijo, prazen zadetek, števec in ohranjanje pogojev.
- Zagon razvojnih testov P09, nato `npm run check`, če čas dovoljuje.

## Zapis sprememb

- Začetek: specifikacija in izvirne zahteve prebrane; implementacija še ni spremenjena.

## Rezultati

- Ni še izvedenih preverjanj.

## Omejitve

- Infrastruktura, odvisnosti, strežnik, `shared/` in skupni testi ostajajo nespremenjeni.
- Javni internet ni na voljo; Chromium se po navodilih poveže prek `task/browser.json`.
