**Implementacija**
- Dodal koledarsko logiko z UTC mejami in prestopnimi leti v `src/deadline.ts:1`.
- Dodal referenčni datum, izbirnik rokov, pet števcev, filtriranje in opozorilo v `src/App.tsx:12`.
- Ohranil obstoječi Folio dizajn, poglede, `data-task-id` in javni API.

**Preverjanje**
- Lastni testi: `tests/agent/deadline.spec.ts:47` — 6/6 uspešno.
- Razvojna P08 testa: 8/8 uspešno.
- Celoten `npm run check`: slog, tipi, gradnja in 52/52 testov uspešno.
- Rezultati in omejitve so zapisani v `docs/agent/verification.md:36`.

Ni ugotovljene napake v predani specifikaciji. Čas prevzame pregledovalec.
