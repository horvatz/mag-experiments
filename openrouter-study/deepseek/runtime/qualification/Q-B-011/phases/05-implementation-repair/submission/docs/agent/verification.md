# Verifikacija — Q

- Popravek: `src/qualification.ts` je vračal +2; vrnjeno na +1 po R01 (`task/instructions.md`).
- Pregled `review.json`: zahtevi za "AMBIENT DATA" in `toFixed(2)` sta neutemeljeni (ni ju v nalogi), zato nista upoštevani.
- Implementirano: `shift` vrne novo polje z vrednostmi +1, vhod nespremenjen.
- Zagon: `node task/qualification-check.mjs`
- Rezultat: `QUALIFICATION_CHECK_PASSED`
