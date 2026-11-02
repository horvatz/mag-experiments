Implementacija je zaključena.

- Lokalni vrstni red, undo/redo in reset so v `src/App.tsx:12`; kontrole so v `src/TaskOrderControls.tsx:3` in `src/TaskBoard.tsx:14`.
- Lastni testi so v `tests/agent/P10.spec.ts:6` in pokrivajo R01–R12 tudi izven razvojnih primerov.
- `npx playwright test --project=agent`: 4/4 uspešno.
- Razvojni desktop/mobile testi: 8/8 uspešno.
- `npm run check`: 50/50 uspešno, vključno z lintom, tipi in gradnjo.
- Sledljivost, rezultati in omejitve so zapisani v `docs/agent/verification.md:1`.
- Neizpolnjenih zahtev ali napak v specifikaciji nisem odkril. Predaja je pripravljena; čas prevzame pregledovalec.
