# Opravila: P10 — Lokalni vrstni red z razveljavitvami

Zaporedje po `docs/agent/P10/plan.md` in pogojih `docs/agent/P10/spec.md`
(R01–R12). Vsaka naloga se zaključi z dejansko izvedbo; rezultati se vpišejo
v sledljivost specifikacije.

## Setup

- [ ] T001 Preveri izhodišče: `npm run typecheck` in obstoječi `npm test` (baseline) — zabeleži začetno stanje; ne spreminjaj infrastrukture.

## Foundational

- [ ] T002 V `src/order.ts` dodaj čiste funkcije: `move(order, id, dir)` z robnimi pogoji, `undoStep`/`redoStep`/`resetStep` s skladoma `undo` (meja 20) in `redo` (R02–R08).
- [ ] T003 V `src/OrderControls.tsx` dodaj gumbi `Razveljavi premik`, `Ponovi premik`, `Začetni vrstni red` in `role=status` z `aria-label="Zgodovina vrstnega reda"` (R11).

## User stories

- [ ] T004 V `src/App.tsx` uvedi stanje `order`/`undo`/`redo`, inicializacijo iz API-ja ter ponastavitev ob menjavi projekta in osvežitvi (R01, R10).
- [ ] T005 V `src/App.tsx` izriši preglednico po `order`, dodaj `aria-label="Mesto opravila <id>"` in gumba `Premakni <id> gor/dol` zunaj povezave (R01–R03, R12).
- [ ] T006 V `src/TaskBoard.tsx` ohrani stalne stolpce, filtriraj po `order` in dodaj mesta ter premike z globalnim sosedom brez spremembe statusa (R09).
- [ ] T007 Poveži undo/redo/izvor s preglednico in tablo; nov veljaven premik počisti ponovitve, robni ne (R04–R08).
- [ ] T008 V `src/styles.css` uredi nove kontrole po obstoječih spremenljivkah Folio; preveri 390 px brez razširitve strani (R12).

## Tests

- [ ] T009 V `tests/agent/helpers.ts` pripravi nadzorovane GET odgovore in nadzor zapisovalnih klicev po vzoru `tests/development/helpers.ts`.
- [ ] T010 V `tests/agent/P10.spec.ts` pokrij R01–R12: začetni vrstni red in mesta, premike in robove, undo/redo zaporedja, mejo 20, izvor, oba pogleda, števce, prazna projekta, odsotnost zapisov.

## Polish

- [ ] T011 Zaženi `npx playwright test --project=agent`; popravi najdene napake in ponovi do zelenega izida.
- [ ] T012 Zaženi regresijo `tests/baseline.spec.ts` in `tests/api.spec.ts` (desktop in mobile) ter `npm run lint` in `npm run build`.
- [ ] T013 V `docs/agent/P10/spec.md` vpiši dejanske dokaze (ime testa, izid) po R01–R12; neizvedeno označi kot neizvedeno.
- [ ] T014 V `docs/agent/P10/delivery.md` povzemi spremembe, preverjanja, rezultate in omejitve za predajo.
