# Naloge P07 — Priljubljena opravila in trajna shramba

Zaporedje je odvisnostno: jedro → hook → vmesnik → testi → preverjanje → dokazi.
Vsaka naloga ima oznako, cilj in datoteko; kode ne opisujeta podrobneje od `plan.md`.

## Faza 1: Priprava

- [x] T001 Potrdi obseg in meje: samo `src/`, `tests/agent/`, `docs/agent/`; brez sprememb strežnika, tipov, odvisnosti in nastavitev (`spec.md`, `plan.md`, `.specify/memory/constitution.md`).
- [x] T002 Izhodiščno preverjanje: ločen predhodni zagon ni bil izveden; izhodišče je potrjeno s končnim zagonom `npm run check` (62 uspelih) — omejitev zapisana v `verification.md`.

## Faza 2: Jedro in stanje

- [x] T003 Ustvari `src/favorites.ts`: ključ `folio:favorites:v1`, `parseFavorites`, `normalizeFavorites` (enkratne vrednosti, razvrstitev UTF-16), `serializeFavorites` (R02–R04).
- [x] T004 Ustvari `src/useFavorites.ts`: stanje `{ids, storageError}`, lenobno branje brez prepisa, zapis v `try/catch`, `toggle`, `removeForProject`, poslušalec `storage` brez povratnega zapisa (R02–R04, R11).

## Faza 3: Uporabniške zgodbe

- [x] T005 (US1, R01, R07) V `src/App.tsx` vključi hook in v vsako vrstico preglednice dodaj gumb `Priljubljeno opravilo <id>` z `aria-pressed` zunaj povezave opravila; stanje deli s tablo.
- [x] T006 (US1, R07) V `src/TaskBoard.tsx` dodaj gumb na vsako kartico (zunaj povezave) in števce stolpcev iz vidnih opravil.
- [x] T007 (US2, R02–R04, R08) V `src/App.tsx` in `src/useFavorites.ts` zagotovi obnovo ob osvežitvi, obravnavo neveljavnih zapisov in ponastavitev filtra ob menjavi projekta.
- [x] T008 (US3, R05, R06, R09, R10) V `src/App.tsx` dodaj checkbox `Prikaži le priljubljena`, gumb `Odstrani priljubljene tega projekta` (onemogočen brez priljubljenih), element `Priljubljeno: X od M.` in prazno stanje `Ni priljubljenih opravil.`.
- [x] T009 (US4, R11) V `src/App.tsx`/`src/useFavorites.ts` prikaži opozorilo `role=alert` z besedo `shramba` ob napaki in ohrani uporabnost v pomnilniku.
- [x] T010 (R12) V `src/styles.css` dodaj sloge novih kontrol z obstoječimi spremenljivkami Folio; preveri, da se pri 390 px stran ne razširi.

## Faza 4: Lastni testi

- [x] T011 Ustvari `tests/agent/favorites.spec.ts` z lastnim `mount` (nadzorovani GET odgovori) in scenariji za R01–R05, R07 (gumbi, `aria-pressed`, enaki naslovi, zapis `{version:1, ids}` razvrščen, obnova, neveljavni zapisi, filter).
- [x] T012 V istem testu dodaj scenarije za R06, R08–R10 (odstranitev pod filtrom, prazno stanje, menjava projekta/osvežitev, odstranitev projekta z ohranitvijo tujih/neznanih ID-jev, števci X/M in stolpcev).
- [x] T013 V istem testu dodaj scenarije za R11 in R12 (`StorageEvent` za pravi/drugi ključ, izjema shrambe prek `addInitScript`, brez API zapisov, ozek pogled 390 px).

## Faza 5: Preverjanje in dokazi

- [x] T014 Zaženi `npm run typecheck`, `npm run lint` in `npm run build`; odpravi napake v `src/`.
- [x] T015 Zaženi `npx playwright test --project=agent` (lastni testi R01–R12).
- [x] T016 Zaženi `npx playwright test --project=api --project=desktop --project=mobile` (skupni testi; regresije).
- [x] T017 V `docs/agent/P07/spec.md` vpiši dejanske izide v tabelo sledljivosti (pogoj → test → datoteka → izid/dokaz); neizvedeno označi kot neizvedeno in zapiši omejitve.
- [x] T018 Predaja: kratek povzetek sprememb, preverjanj in omejitev; brez vej/commitov.
