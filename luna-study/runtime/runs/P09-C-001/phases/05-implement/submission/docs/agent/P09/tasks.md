# P09 implementation tasks

Specifikacija: [`spec.md`](./spec.md) · načrt: [`plan.md`](./plan.md)

## Setup

- [ ] [T001] V `tests/agent/P09.spec.ts` pripravi agentno Playwright ogrodje in ponovno uporabne testne GET podatke/odgovore prek obstoječih testnih kontrol; konfiguracije Playwrighta ne spreminjaj.

## Foundational

- [ ] [T002] V `src/navigation.ts` uvedi tip filtrskega stanja ter razčlenitev in kanonično sestavljanje parametrov `q/status/order`; pokrij privzete vrednosti, prvo ponovitev, neznane parametre, `view=board` in URL brez samodejnega prepisovanja (R01, R04, R06) v `tests/agent/P09.spec.ts`.
- [ ] [T003] V `src/` dodaj ozko usmerjen pripomoček za literalno iskanje, statusni pogoj in stabilno razvrščanje; uporabi NFD, odstrani samo U+0300–U+036F, pretvori v male črke, primerjaj naslove po UTF-16 in ohrani izvorni vrstni red pri izenačenju. Preveri Unicode, ločila, vsa štiri polja, IN-pogoj in ponovitve naslovov v `tests/agent/P09.spec.ts` (R02–R03).

## User stories — po toku glavne uporabe

- [ ] [T004] V `src/App.tsx` dodaj tri dostopno označene kontrole z ločenim osnutkom, gumba »Uporabi pogled« in »Ponastavi pogled«, atomsko potrditev, pravilo ene/no nove zgodovinske postavke ter števec in prazno stanje; preveri potrjevanje, kanonični URL, reset in zgodovino v `tests/agent/P09.spec.ts` (R05–R06, R11).
- [ ] [T005] Poveži potrjeno stanje z neposrednim vstopom, Nazaj/Naprej in osvežitvijo; prilagodi gradnike URL-ja v `src/navigation.ts`, navigacijo ter rezultate v `src/App.tsx`, `src/TaskBoard.tsx` in `src/TaskDetails.tsx`. Preveri ohranitev filtrov pri preklopu pogleda/podrobnosti, ponastavitev osnutka ob navigaciji, ID-je podvojenih naslovov in ponastavitev filtrov pri kliku drugega projekta v `tests/agent/P09.spec.ts` (R01, R07–R10).

## Polish

- [ ] [T006] Uredi kontrolnike in stanja v `src/styles.css` ter pripadajočih komponentah po potrjenem dizajnu Folio; ohrani slovenska imena, zahtevane ARIA oznake, `data-task-id`, vidni fokus in brez vodoravnega razširitvenega preliva strani pri 390 px. V `tests/agent/P09.spec.ts` preveri mobilni prikaz, prazen projekt/rezultate, nalaganje, neznano pot in da dejanja ne pošljejo zapisov na API ali uporabljajo `localStorage` (R11–R12).
- [ ] [T007] Zaženi agentne in skupne preveritve (`npm run check`), odpravi regresije znotraj dovoljenih datotek ter dopolni tabelo sledljivosti v `docs/agent/P09/spec.md` z dejanskimi testnimi imeni, izidi in nepreverjenimi omejitvami; ne spreminjaj konfiguracije, skupnih testov ali strežnika (R01–R12).
