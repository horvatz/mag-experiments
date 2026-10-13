**Rezultat**
- Implementiral stabilno razvrščanje z dvema neodvisnima ključema in smernima kontrolama: `src/sorting.ts:1`, `src/App.tsx:14`.
- Preglednica in tabla uporabljata isto razvrščeno projekcijo; stanje se ohrani med pogledi in podrobnostmi, ne pa med projekti ali osvežitvami.
- Dodal odzivne Folio kontrole: `src/styles.css:180`.
- Pripravil specifikacijo in sledljivost R01–R12: `docs/agent/specification.md:1`.
- Dodal 6 lastnih testov: `tests/agent/P04-agent.spec.ts:22`.
- Zapisal dejansna preverjanja in omejitve: `docs/agent/verification.md:1`.

**Preverjanja**
- `npx playwright test --project=agent`: 6/6 uspešno.
- Skupni P04 namizni in mobilni testi: 8/8 uspešno.
- `npm run check`: lint, build in 52/52 testov uspešno.

Ni znanih neizpolnjenih zahtev R01–R12.
