**Implementacija**
- Dodan lokalni vrstni red, razveljavitve, ponovitve in reset v `src/App.tsx:13`.
- Preglednica in tabla uporabljata globalni sosede; tabla ohranja stolpce po statusih v `src/TaskBoard.tsx:14`.
- Dostopnost in prilagodljivi Folio slog dopolnjena v `src/styles.css:66`.
- Dodani lastni testi za R01–R12 v `tests/agent/P10.spec.ts:9`.

**Preverjanje**
- `npm run check` je uspešno potekel: gradnja in 51 testov (14 API, 24 osnovnih, 8 razvojnih, 5 lastnih).
- Rezultati, sledljivost in omejitve okolja so zapisani v `docs/agent/verification.md:1`.
- Napake v predani specifikaciji nisem odkril.

Čas prevzame pregledovalec.
