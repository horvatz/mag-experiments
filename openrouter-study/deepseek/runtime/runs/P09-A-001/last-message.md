Rešitev je zaključena in preverjena.

**Rezultat**
- Specifikacija: `docs/agent/specification.md` (v1.0 + zabeležen popravek v1.1), poročilo: `docs/agent/verification.md`.
- Koda: novo `src/viewState.ts` (normalizacija, razčlenjevanje, filtriranje/urejanje), posodobljeni `src/navigation.ts` (q/status/order v fragmentu za pot projekta in opravila, ohranjen `view`), `src/App.tsx` (kontrola osnutka, `Uporabi pogled`, `Ponastavi pogled`, števec `Prikazano: N od M.`, `Ni zadetkov.`), `src/TaskBoard.tsx`, `src/TaskDetails.tsx`, `src/styles.css` (filtri, brez presega na 390 px).
- Lastni testi: `tests/agent/p09.spec.ts` (A01–A18, pokrivajo R01–R12).

**Preverjanja (dejansko izvedena)**
- `npm run check` → lint + typecheck/build + **64/64 uspešno** (38 izhodiščnih, 8 razvojnih D01–D04 v desktop in mobile, 18 lastnih).
- Odkrit in odpravljen race: ob hitrem zaporedju potrditve in spremembe kontrole se je osnutek izgubil, vračanje nazaj na že obiskan fragment pa je kazalo zastarel osnutek; osnutek je zdaj vezan na par (zaporedna navigacija, fragment) z oznako `syncedHash` za lastno potrditev (zapis v zgodovini specifikacije).

**Omejitve**
- Skriti končni testi niso dostopni; navedeni so le izvedeni testi.
- Zaslonski bralniki/prave naprave niso preizkušeni (posredno prek role/name in meritve 390 px).
- Okoljska omejitev: here-dokumenti v lupini niso delovali (`TMPDIR` prepovedan), zato so bile datoteke zapisane prek cevi; vsebina je bila preverjena z branjem in celotnim `npm run check`.
