**Specifikacija pripravljena**

- `docs/agent/specification.md` — osnutek po skupni predlogi: kontekst, vhodi/dejanja/izidi, definirani predikati (`valid`, `parse`, `norm`, `visible`, `X`/`M`), sprejemni pogoji za R01–R12 in sledljivostna tabela s predvidenimi datotekami ter scenariji (D01–D04 + lastni testi).
- `docs/agent/specification-history.md` — zapis verzije 1.
- Preverjeni viri: `shared/types.ts`, `src/api.ts`, `src/App.tsx`, `src/TaskBoard.tsx`, `src/components.tsx`, `tests/development/P07.spec.ts`, `tests/development/helpers.ts`, `docs/dizajn.md`.

Ključne odločitve: identiteta je izključno `id`; zapis `{version:1, ids}` z enkratnimi nizi, urejenimi po UTF-16; neveljavni zapisi → prazna množica brez prepisa; filter privzeto `false` in se ne ohrani; števec `Priljubljeno: X od M.` vedno za celoten projekt; dogodek `storage` brez povratnega zapisa; napaka shrambe → opozorilo `role=alert` z »shramba«. Izidi so označeni kot »ni izvedeno« — testov v tej vlogi nisem izvajal. Ostaja zapisana nejasnost glede povzetka `Pregled stanj opravil` (vsa ali vidna opravila); predlagano je ohranjanje obstoječega vedenja.
