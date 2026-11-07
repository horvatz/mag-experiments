**Implementacija**
- Dodan lokalni globalni vrstni red, meja 20 razveljavitev, ponovitve in ponastavitev: `src/App.tsx:21`
- Preglednica in tabla ohranjata obstoječi dizajn z globalnimi mesti in premiki: `src/TaskBoard.tsx:13`, `src/App.tsx:132`
- Dodane prilagodljive Folio kontrole: `src/styles.css:112`

**Preverjanje**
- Lastni testi: 7/7 uspešni (`tests/agent/P10-order.spec.ts:6`).
- Razvojni P10 testi: 8/8 uspešni.
- `npm run check`: uspešen — 53/53 testov, vključno z lintom, tipi in gradnjo.
- Rezultati in sledljivost R01–R12 so zapisani v `docs/agent/verification.md:33`.
- Napake v specifikaciji nisem zaznal; omejitve okolja so dokumentirane.

Implementacija je zaključena; čas prevzame pregledovalec.
