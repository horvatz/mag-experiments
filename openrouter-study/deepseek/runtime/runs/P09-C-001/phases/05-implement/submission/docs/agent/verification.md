# P09 — Preverjanje in sledljivost

Postopek: Spec Kit (predloga Lean 1.0.0), korak `$speckit-implement`. Vir zahtev: `task/instructions.md`; specifikacija: `docs/agent/P09/spec.md`; načrt: `docs/agent/P09/plan.md`.

## Rezultati preverjanj

- `npm run check` (eslint, tsc, vite build, playwright), 2026-10-31: uspešno, **60/60** (`60 passed`).
  - Osnovni testi izhodišča: 38/38 (14 api, 12 desktop, 12 mobile).
  - Razvojni testi P09: 8/8 (`tests/development/P09.spec.ts`, desktop in mobile).
  - Lastni testi naloge: 14/14 (`tests/agent/p09.spec.ts`, projekt `agent`).
- Prvi zagon lastnih testov je odkril dve napaki v pričakovanjih testov (t-03 je `in_progress`, ne `todo`); po popravku testov so vsi zeleni. Koda ni bila spremenjena.
- Ročni ogled: ni bil izveden (ni potreben za dokazila; na voljo `WEB_PORT=5193 API_PORT=3123 npm run dev`).

## Sledljivost R01–R12

| Zahteva | Koda | Dejansko izvedeni testi | Izid |
| --- | --- | --- | --- |
| R01 | `src/viewState.ts` (`parseViewState`), `src/navigation.ts` (`useRoute`), `src/App.tsx` | A01, D01 | uspešno |
| R02 | `src/viewState.ts` (`normalize`, `matchesQuery`) | A04 | uspešno |
| R03 | `src/viewState.ts` (`visibleTasks`) | A01, A05 | uspešno |
| R04 | `src/viewState.ts` (`parseViewState`), `src/navigation.ts` | A02, A03 | uspešno |
| R05 | `src/App.tsx` (osnutek, `commit`) | A06 | uspešno |
| R06 | `src/viewState.ts` (`buildHash`), `src/App.tsx` (`commit`) | A06, A07, D02 | uspešno |
| R07 | `src/navigation.ts`, `src/App.tsx` (ponastavitev osnutka ob spremembi poti) | A08, D03 | uspešno |
| R08 | `src/App.tsx` (preklop pogleda), `src/navigation.ts` | A09 | uspešno |
| R09 | `src/navigation.ts` (`taskUrl`), `src/TaskDetails.tsx`, `src/App.tsx` | A10 | uspešno |
| R10 | `src/App.tsx` (navigacija po projektih) | A11 | uspešno |
| R11 | `src/App.tsx` (`commit(defaultViewState)`, števec, "Ni zadetkov.") | A12, D04 | uspešno |
| R12 | `src/App.tsx`, `src/TaskBoard.tsx`, obstoječi pogledi | A13, A14, osnovni testi 38/38 | uspešno |

## Omejitve in neizvedeno

- Končni ocenjevalni testi naloge v tem okolju niso bili na voljo; navedeni so le dejansko izvedeni testi (skupni, razvojni in lastni).
- Stanje nove funkcionalnosti je lokalno trenutnemu projektu; brez trajne shrambe in brez novih zapisovalnih API-jev (R12).
- Navigacije med nezaključenim nalaganjem in sočasnih sprememb podatkov brez osvežitve niso bile dodatno preverjene (izven obsega R01–R12).
