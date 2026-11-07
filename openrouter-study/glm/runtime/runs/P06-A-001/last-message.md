**Rezultat**
- Dodan nastavljiv izvoz CSV s stolpci, filtrom, ločilom, citiranjem, BOM, CRLF in zaščito pred formulami: `src/csvExport.ts:1`, `src/App.tsx:22`, `src/styles.css:66`.
- Specifikacija s prediki, sledljivostjo R01–R12 in zgodovino popravkov: `docs/agent/specification.md:1`.
- Lastni testi pokrivajo celoten obseg, prazen projekt in vse formule: `tests/agent/p06.spec.ts:18`, `tests/agent/p06.spec.ts:117`, `tests/agent/p06.spec.ts:128`.
- Zapisnik dejanskih preverjanj: `docs/agent/verification.md:1`.

**Preverjanje**
- `npm run typecheck` – uspešno.
- `npm run lint` – uspešno.
- Razvojni testi P06 – 8/8 uspešni.
- `npm run check` – uspešno: izgradnja in 49/49 testov.

Neizpolnjenih zahtev ni. Omejitev: preverjeno samo v lokalnem Chromiumu.
