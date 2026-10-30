# P07 — Naloge izvedbe: Priljubljena opravila in trajna shramba

**Funkcijska mapa**: `docs/agent/P07` · **Datum**: 2026-10-30 · **Spec**: `spec.md` · **Načrt**: `plan.md`

## Faza 1 — Priprava

- [ ] T001 Preveri izhodišče z `npm run typecheck`, `npm run lint` in `npm test` (skupni `tests/baseline.spec.ts`, `tests/api.spec.ts`); zabeleži izide.

## Faza 2 — Temelj (shramba)

- [ ] T002 Ustvari `src/favorites.ts`: ključ `folio:favorites:v1`, `parseFavorites` (P3 validacija), `readFavorites` brez prepisa ob nalaganju (R04), `writeFavorites` z enkratnimi nizi, razvrščenimi po UTF-16 (P2), `toggleFavorite` (P1) in `removeProjectFavorites` (P5) z zapisom ob spremembi; izjeme shrambe ne sesujejo aplikacije (P7).
- [ ] T003 V `src/favorites.ts` dodaj hook `useFavorites` (`useSyncExternalStore`) in poslušalec `storage`: pravi ključ uskladi množico, `null` izprazni, drug ključ se ignorira, brez povratnega zapisa (P6).

## Faza 3 — Zgodba 1: označevanje in shramba (R01–R04)

- [ ] T004 Ustvari `src/FavoriteButton.tsx`: gumb `Priljubljeno opravilo <id>` z `aria-pressed` (R01).
- [ ] T005 Vstavi gumb v `src/App.tsx` (preglednica, ločeno od povezave opravila) in `src/TaskBoard.tsx` (zunaj povezave kartice) (R01, R07).
- [ ] T006 Napiši agentne teste `tests/agent/p07.spec.ts` za R01–R04: preklop brez odpiranja podrobnosti, enaki naslovi, zapis `{version:1,ids}`, obnova po osvežitvi, podvojeni/neznani ID-ji, neveljavni zapisi brez odpovedi in brez prepisa.

## Faza 4 — Zgodba 2: filter in števci (R05–R08, R10)

- [ ] T007 V `src/App.tsx` dodaj checkbox `Prikaži le priljubljena` (privzeto false, ponastavitev ob menjavi projekta), filtriranje skupno za tabelo in tablo, števec `role=status` z `Priljubljeno: X od M.` in prazno stanje `Ni priljubljenih opravil.` (R05–R08, R10).
- [ ] T008 Posodobi `src/TaskBoard.tsx` za filtrirana opravila (števci stolpcev štejejo vidna) in preveri R05–R08, R10 z agentnimi testi v `tests/agent/p07.spec.ts`.

## Faza 5 — Zgodba 3: vzdrževanje in odpornost (R09, R11, R12)

- [ ] T009 V `src/App.tsx` dodaj gumb `Odstrani priljubljene tega projekta` (onemogočen brez priljubljenih projekta) (R09).
- [ ] T010 V `src/App.tsx`/`src/favorites.ts` dodaj opozorilo `role=alert` z besedo `shramba` ob napaki branja/zapisa; slogi novih kontrol v `src/styles.css` (P7, R11, R12, Folio).
- [ ] T011 Preveri R09, R11 in R12 z agentnimi testi v `tests/agent/p07.spec.ts`: odstranitev projekta, dogodek `storage`, izjema shrambe, brez zapisov na API, nespremenjena polja, ozek prikaz 390 px.

## Faza 6 — Zaključek

- [ ] T012 Zaženi celotno preverjanje: `npm run typecheck`, `npm run lint`, `npm test` in `npx playwright test tests/development/P07.spec.ts` (D01–D04).
- [ ] T013 Vpiši dejanske izide in dokaze v `spec.md` (razdelek Izvedba in sledljivost), navedi neizvedene dele in omejitve ter pripravi končno poročilo.
