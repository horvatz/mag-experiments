# Ustava projekta P06: Nastavljiv izvoz CSV

**Sprejeta:** 2026-10-10

## Naslov in kontekst

Pilot P06 dopolnjuje obstoječega Folio vmesnika s funkcijo izvoza CSV s prilagodljivimi kolumnami, ločili in filterji. Vmesnik ostaja na stranski strani brez komunikacije s strežnikom.

## Glavna načela

- **Minimalna poseganja**: dopolnjujemo obstoječo infrastrukturo.
- **Slovenščina kot izhodišče**: ohranjamo lokalizirana poimenovanja.
- **Iskanje po ID**: podatke beremo prek /api/.
- **Javni vmesnik**: izvoz CSV deluje lokalno, brez strežnika.

## Pravila

- Eden Agent, ohranjena zgodovina.
- Spremembe samo v src/, tests/agent/, docs/agent/.
- Izvoz ne spreminja opravil, šele testni programeri dostopajo do /__test/.
- Ne odpiramo oken, ne ustvarjamo API-jev za zapisovanje.
- Uporabimo dizajn Folio.
