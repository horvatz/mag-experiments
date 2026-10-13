# Preverjanje P06

**Datum**: 2026-10-09

## Dnevnik izvedbe

- T001: pregledane obstoječe integracijske točke v App.tsx in useResource.ts.
- T002–T005: implementirana CSV-obdelava, kontrole izvoza, prenos datoteke in Folio postavitev.
- T006–T010: dodani lastni Playwright testi v tests/agent/p06-export.spec.ts.
- T011–T012: izveden celoten pregled in posodobljena sledljivost R01–R12.

## Izvedena preverjanja

- npm run typecheck: uspešno.
- npm test -- --project=agent: 3/3 uspešno.
- npm run check: uspešno; vključuje lint, typecheck, gradnjo in 49/49 testov.
- Preverjeni so tudi razvojni primeri P06 na namizju in mobilnem pogledu (8/8) ter osnovni projekti (38/38).
- Lastni testi pokrivajo privzeti izvoz, nevtralizacijo formul, filter, preklop pogleda, ponastavitev, onemogočen izvoz, ozko širino in odsotnost zapisov na API.

## Omejitve

- Zunanja ali končna testna okolja niso bila na voljo in niso bila izvedena.
- Strežnik, skupni tipi, odvisnosti, nastavitve in skupni testi niso spremenjeni.
