Specifikacija je zaključena in shranjena. Povzetek:

**Izdelki**
- `docs/agent/specification.md` – celotna specifikacija po skupni predlogi: problem in kontekst, podatki/simboli (`F`, `φ`, `visible`, `parse`, `sort16`, `persist`), dejanja z izidi in napakami, pravila R01–R12 s predikati, dogovor o vmesniku ter načrt izvedbe in sledljivosti po datotekah.
- `docs/agent/specification-history.md` – dnevnik nastanka in popravkov (vsebina, viri, pojasnilo, da dokazi pripadajo izvajalcu).

**Ključne opredelitve**
- `parse(raw)`: `version:1`, `ids` kot polje nizov → množica (podvojeni strnjeni, neznani ohranjeni); sicer `∅`; ob nalaganju brez povratnega zapisa.
- `persist(F)`: `{version:1, ids:sort16([...F])}` pod `folio:favorites:v1`; brez polj opravil.
- Filter privzeto `false`, ob menjavi projekta in osvežitvi ponastavljen; `F` globalna.
- Točna besedila in ARIA: `Priljubljeno opravilo <id>` + `aria-pressed`, `Prikaži le priljubljena`, `Odstrani priljubljene tega projekta`, `Priljubljeno: X od M.` (`role=status`), opozorilo `role=alert` z besedo `shramba`, `Ni priljubljenih opravil.`

**Omejitve faze**: testi in zagon aplikacije v tej vlogi niso bili izvedeni; razdelek sledljivosti je zato označen kot načrt, ki ga dokaze dopolni izvajalec. Pisal sem samo v `docs/agent/specification.md` in `docs/agent/specification-history.md`.
