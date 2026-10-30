Specifikacija je zaključena in shranjena.

**Predaja**
- `docs/agent/specification.md`: kontekst, vhodi/dejanja/izidi, pogoji R01–R12 s predikati (F, fav(i), f, visible(t)), dogovor o vmesniku, razširjena sledljivostna tabela po posameznih zahtevah in omejitve.
- `docs/agent/specification-history.md`: zapis v1 z obsegom sprememb.
- Ključne ugotovitve za implementerja: F mora živeti izven `ProjectView` (key po projektu ponastavi f, kar ustreza R08), filter mora biti neodvisen od pogleda (R07), shramba se ob nalaganju ne sme prepisovati (R04), neznani ID-ji se ohranjajo (R03/R09).
- Preverjanje: D01–D04 iz `tests/development/` pokrivajo R01/R02/R03/R05/R06/R07/R12 delno; R04, R08–R11 in celoten R12 so predvideni za lastne teste v `tests/agent/`. Izidi so označeni kot neizvedeni, dokaze ob zagonu vpiše implementer.

Nobena datoteka izven `docs/agent/specification*.md` ni bila spremenjena; aplikacije in testov v tej vlogi nisem zagnal.
