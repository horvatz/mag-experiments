**Specifikacija ustvarjena**

- `.specify/feature.json`: `{"feature_directory": "docs/agent/P06"}` (pot določena vnaprej, brez vprašanja).
- `docs/agent/P06/spec.md` (121 vrstic): problem in kontekst, vhodi/dejanja/izidi s simboli (T, T_F, S, D, F, K), pravila sprememb stanja, 7 uporabniških scenarijev, tabela R01–R12 s sprejemnimi pogoji in načinom preverjanja, dogovor o vmesniku ter tabela sledljivosti za izpolnitev med izvedbo.
- Izidov testov ne označujem kot uspešne; vrstice sledljivosti so pripravljene za dokazila iz faze izvedbe.
- Odprta vprašanja in omejitve zapisane (nedostopni končni testi, lokalno stanje nastavitev, obseg navigacije).
- Preostanek časa: ~663 s.

Naslednji korak (sproži izvajalnik): `$speckit-plan` za `docs/agent/P06`.
