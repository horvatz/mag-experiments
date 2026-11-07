# P05: Straničenje in filter stanja — naloge

Zaporedni seznam; vsaka naloga navaja ciljno datoteko. Izvedba ne sme posegati v `server/`, `shared/`, skupne teste, odvisnosti in nastavitve.

## Priprava

- [x] T001 Potrdi kontekst: `.specify/feature.json` kaže na `docs/agent/P05`; preberi `docs/agent/P05/spec.md` in `docs/agent/P05/plan.md`; brez sprememb infrastrukture.

## Temelj

- [x] T002 V `src/App.tsx` dodaj stanje `pageSize`/`filter`/`page` v `ProjectView` in remount z `key={project.id}` v `App`.
- [x] T003 V `src/App.tsx` izračunaj `filtered`, `N`, `Y`, `currentPage`, `A`, `B` in `pageTasks` po predikatih iz specifikacije.

## Zgodba 1: straničenje, filter in status (R01–R05, R09, R10)

- [x] T004 Ustvari `src/Pagination.tsx`: selecta `Velikost strani` in `Filter strani`, gumbi Prva/Prejšnja/Naslednja/Zadnja stran, status `role=status` z `aria-label="Stanje straničenja"` in predpisanim besedilom (tudi `Stran 0 od 0. Prikazano 0–0 od 0.`).
- [x] T005 V `src/App.tsx` poveži kontrole: izbira velikosti/filtra nastavi `page := 1`; gumbi so onemogočeni na robovih in ne spremenijo stanja.
- [x] T006 V `src/App.tsx` izriši `pageTasks` v preglednico; prazen rezultat uporabi obstoječi prazni prikaz, status pa iz T004.
- [x] T007 V `src/styles.css` dodaj razred `.pagination` z obstoječimi spremenljivkami Folio; pri 390 pik se kontrole prelomijo, drsenje preglednice/tabe ostane notranje.

## Zgodba 2: usklajena pogleda (R06, R07, R11)

- [x] T008 V `src/App.tsx` podaj `pageTasks` v `TaskBoard`; preveri, da preklop pogleda ter odprtje/zaprtje podrobnosti ohranijo `pageSize`, `filter` in `page`.
- [x] T009 Preveri, da tabla združuje samo `pageTasks` (števci stolpcev štejejo trenutno stran), povzetek stanj in skupni badge pa ostaneta nad celotnim `tasks`.

## Zgodba 3: ponastavitve in regresije (R08, R12)

- [x] T010 Preveri ponastavitev na all/all/1 ob menjavi projekta in osvežitvi; stanje se ne zapiše v `localStorage`, `sessionStorage` ali URL.
- [x] T011 Preveri, da straničenje uporablja samo GET `/api/` in ne pošilja zapisov, ter da povezave, `id`, `data-task-id`, podrobnosti, nalaganje in videz Folio ostanejo uporabni; nova dejanja ob opravilu so zunaj povezave.

## Lastni testi in preverjanja

- [x] T012 Napiši `tests/agent/p05-pagination.spec.ts` z razvojnim pomočnikom `../development/helpers.ts` za R01–R12: privzeto stanje, particija pri 2/5/10, robovi gumbov, menjava velikosti, filtri, isti ID-ji v obeh pogledih, ohranitev stanja, menjava projekta, besedila statusa, prazen rezultat, števci, `readonly`, širina 390 pik.
- [x] T013 Zaženi `npx playwright test --project=agent` in zabeleži izide.
- [x] T014 Zaženi `npm run lint` in `npm run typecheck`.
- [x] T015 Zaženi skupne teste `npx playwright test tests/baseline.spec.ts` (brez sprememb datotek).
- [x] T016 Izpolni tabelo sledljivosti v `docs/agent/P05/spec.md` z dejanskimi izidi in dokazi; neizvedene dele označi kot neizvedene.

## Zaključek

- [x] T017 Preglej, da ni podvojenih dokumentov in da so spremembe le v `src/`, `tests/agent/` in `docs/agent/`; v `spec.md` dopolni zgodovino sprememb.

## Izid

Vse naloge T001–T017 opravljene 2026-10-09. `npm run check` uspešno: lint in build uspešna, 59 testov uspešnih (skupni 38, razvojni P05 8, lastni agent 13). Dokazi in omejitve: `docs/agent/verification.md`.
