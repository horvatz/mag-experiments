Zapisana je specifikacija v `docs/agent/specification.md` (80 vrstic) z:

- **Problem in kontekst**: Jasno opisano, da naloga omejuje le odzivno uporabo brez spremembe modela podatkov.
- **Vhodi, dejanja in izidi**: URL struktura, parametri (q, status, order, view) in pričakovani API oblike.
- **Zahteve R01–R12**: Detajlno pravilo in način preverjanja za vsako zahtevo.
- **Izvedba in sledljivost**: 12 vrstic tabelarnih povezav zahtev s kodo in testi.
- **Odprta vprašanja in omejitve**: 10 točk o testih, modelu podatkov, obnašanju praznih rezultatov itd.

Dizajn ohranja obstoječe komponente (`src/navigation.ts`, `src/useResource.ts`, `src/api.ts`) in doda samo funkcionalnost filtriranja v povezavi.

**Načrt za implementerja**: Dodati `normalizeQuery()` funkcijo v `useResource.ts` za obravnavo q-parametra, `applyView()` za potrjevanje filtrov z zgodovinskim zapisom, in gumba "Uporabi pogled"/"Ponastavi pogled" s pravo obravnavo parametra `q`.

Specifikacija je pripravljena za prenos implementerju.
