Korak `$speckit-specify` je končan.

**Rezultat**
- `.specify/feature.json` nastavljen na `{ "feature_directory": "docs/agent/P03" }`.
- `docs/agent/P03/spec.md` (v1.0, 2026-10-09) izdelan po skupni predlogi P03: problem in kontekst, vhodi/dejanja/izidi, zahteve in pravila s simboli ter predikati, pravila sprememb stanja, dogovor o vmesniku, izvedba in sledljivost ter odprta vprašanja in omejitve.
- Vseh 12 zahtev R01–R12 je zajetih v obeh tabelah (sprejemni pogoji + načrtovana sledljivost); dokazi so označeni kot načrtovani, ne kot uspešni, saj v tej fazi ni izvedenih testov.

**Preverjanje**
- `grep` potrdi 24 vrstic zahtev in vse ID-je R01–R12; `node task/time-budget.mjs` kaže 384 s preostanka.
- Ni novih zahtev, odvisnosti ali infrastrukturnih sprememb; brez veje in commita.

Naslednji korak: `$speckit-plan` — načrt v `docs/agent/P03/plan.md`.
