Korak `$speckit-specify` je opravljen.

**Opravljeno**
- Prebral `.agents/skills/speckit-specify/SKILL.md`; vprašanje o poti je izpuščeno, ker je pot že določena (`docs/agent/P09`).
- `.specify/feature.json` → `{"feature_directory": "docs/agent/P09"}`.
- `docs/agent/P09/spec.md` (141 vrstic, v0.1, datum 2026-11-02), po skupni predlogi:
  - Problem in kontekst, vhodi/dejanja/izidi (podatki, kontrole z dogovorjenimi oznakami, navigacije).
  - Simboli in predpostavke: `norm` (NFD, U+0300–U+036F, male črke), `P(t)` (ena fraza kot podniz polj title/description/assignee/id), `F(t)` (q IN status), urejanje `R` po `order` z izvornim vrstnim redom ob izenačenju.
  - 6 pravil sprememb stanja: razčlenitev URL (prva pojava, privzete/neznane vrednosti, brez prepisa), osnutek, atomska potrditev z enim `push` samo ob spremembi, ponastavitev, navigacije, menjava projekta.
  - Sprejemni pogoji za vseh R01–R12 + sledljivostna tabela z izidi "ni še izvedeno (faza specifikacije)" — brez lažnih dokazov.
  - Omejitve: končni testi nedostopni, nalaganje/sočasne spremembe niso v obsegu, stanje lokalno projektu, brez `localStorage`.

Ni novih funkcionalnih zahtev ali zunanjih meritev. Preostanek proračuna ~975 s od 1113 s. Naslednji korak (`$speckit-plan`) sproži izvajalnik.
