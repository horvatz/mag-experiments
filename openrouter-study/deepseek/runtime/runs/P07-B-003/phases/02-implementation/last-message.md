Implementacija in preverjanje sta zaključena; čas predajam pregledovalcu.

**Kaj je narejeno**
- `src/favorites.ts` (nov): validacija/obnova shrambe `folio:favorites:v1`, zapis `{version:1,ids}` z enkratnimi nizi in `sort()`, hook `useFavorites` z dogodkom `storage`, brez povratnega zapisa in brez prepisa ob nalaganju, pomnilniška množica ob izjemi.
- `src/App.tsx`, `src/TaskBoard.tsx`, `src/components.tsx`, `src/styles.css`: gumbi `Priljubljeno opravilo <id>` z `aria-pressed` zunaj povezav, checkbox `Prikaži le priljubljena`, gumb `Odstrani priljubljene tega projekta`, števec `Priljubljeno: X od M.`, filtriranje obeh pogledov, opozorilo `role=alert` z besedo "shramba", odzivnost na 390 px.
- `tests/agent/favorites.spec.ts` (nov): 14 lastnih testov L01–L12 (vključno z R04, R09, R10, R11 z izjemami shrambe).

**Rezultati preverjanja**
- Razvojni testi D01–D04 (desktop + mobile): 8 passed.
- Lastni testi: 14 passed.
- `npm run check` (lint, tipi, gradnja, vsi testi): 60 passed, brez napak.

**Omejitve**
- Skriti končni testi niso dostopni; ročni vizualni pregled ni bil izveden (preliv na 390 px je preverjen avtomatsko).
- `git` v peskovniku ni izvedljiv, zato stanja veje nisem mogel preveriti; spremenjeni so le `src/`, `tests/agent/` in `docs/agent/verification.md`.
- Napak v predani specifikaciji nisem našel.

Podrobnosti, sledljivost R01–R12 in dokazi so v `docs/agent/verification.md`. Pripravljeno za pregled.
