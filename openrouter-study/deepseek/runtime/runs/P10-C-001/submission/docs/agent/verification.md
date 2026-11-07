# Preverjanje: P10 — Lokalni vrstni red z razveljavitvami

Rezultati dejansko izvedenih preverjanj koraka implement (2026-10-09).

## Izvedena preverjanja

| Ukaz | Obseg | Rezultat |
| --- | --- | --- |
| `npm run typecheck` | TypeScript 6, vsa koda | uspešno (brez napak) |
| `npm run lint` | ESLint nad `src/`, `tests/` | uspešno (brez opozoril) |
| `npm test` | Playwright: api, baseline desktop+mobile, development desktop+mobile, agent | 58 uspešnih, 0 neuspešnih (24,3 s) |

Lastni testi `tests/agent/P10.spec.ts` (A01–A12) so vsi zeleni; skupni
`tests/development/P10.spec.ts` (D01–D04) prav tako. `npm run build` v tem
koraku ni bil ponovno zagnan (gradnja je vključena v `npm run check`), zato
tega ne navajam kot izvedenega.

## Sledljivost zahtev R01–R12

| Zahteva | Dokaz (test) | Rezultat |
| --- | --- | --- |
| R01 | A01 (začetni vrstni red, mesta 1/8, enaki naslovi ločeni) | uspešno |
| R02 | A02 (zamenjava s sosedom, polja/status nespremenjeni), D01 | uspešno |
| R03 | A03 (robna gumba onemogočena, zgodovina prazna), D01 | uspešno |
| R04 | A04 (razveljavitev vrne prejšnjo permutacijo), D02 | uspešno |
| R05 | A04 (dve razveljavitvi in ponovitvi zaporedoma), D02 | uspešno |
| R06 | A05 (nov premik počisti ponovitve; rob ne) | uspešno |
| R07 | A07 (21 premikov → meja 20; 20 razveljavitev in ponovitev) | uspešno |
| R08 | A06 (izvor kot eno razveljavljivo dejanje, gumb onemogočen v izvoru), D04 | uspešno |
| R09 | A08 (stalni stolpci, relativni vrstni red, globalni sosed, status nespremenjen), D04 | uspešno |
| R10 | A09 (preklop pogleda in podrobnosti ohranita stanje), A10 (menjava projekta in osvežitev) | uspešno |
| R11 | A11 (števci in onemogočeni gumbi; prazen in enoopravilni projekt), A03 | uspešno |
| R12 | A12 (brez zapisov na API, brez klicev `/__test/`, 390 px brez prelivanja), D04 | uspešno |

## Omejitve

- Končni ocenjevalni testi niso dostopni; preverjanje temelji na skupnih in
  lastnih testih ter ročnem pregledu (glej tudi `spec.md`).
- `npm run build` ni bil ponovno zagnan v tem koraku; prvi zagon je del
  `npm run check` v naslednji fazi.
- Meritve zmogljivosti in trajna shramba niso del obsega zahtev.
