# P05 — izvedbene naloge

2026-09-25 · [Specifikacija](spec.md) · [Načrt](plan.md)

Izvaja en agent zaporedno: T001 → T002 → … → T009. Vsaka naloga je odvisna od predhodne. Izvirne zahteve `task/instructions.md` ostajajo merilo; brez novih odvisnosti, sprememb infrastrukture, vej ali commitov. Oznako dokončanja dodamo šele po dejanski izvedbi. T001–T009 so izvedene; dokazila in popravljeni testni napaki so v `docs/agent/verification.md`.

## Priprava

- [x] [T001] Pred posegom potrdi izhodišče `src/App.tsx`, `src/TaskBoard.tsx`, `src/styles.css` in `tests/development/helpers.ts` glede na `spec.md`/`plan.md`; v `docs/agent/verification.md` odpri kratek zapis izvedbe in omejitev. Preveri čas z `node task/time-budget.mjs`.

## Osnova

- [x] [T002] V `src/App.tsx` v ProjectView dodaj tipizirano lokalno stanje `(all, all, 1)`, stabilno filtriranje pred rezanjem in izpeljane podatke za trenutno stran/status po predikatih v `spec.md`. Menjava velikosti ali filtra vrne stran na 1; izvorni podatki ostanejo nespremenjeni. Pokrije R01, R02, R04, R05, R09, R10.

## Uporabniška zgodba 1 — izbira in premikanje po straneh

- [x] [T003] V `src/App.tsx` dodaj oba predpisana HTML selecta, štiri navigacijske gumbe z veljavnimi prehodi in onemogočenimi robovi ter natančni `role=status`/`aria-label=Stanje straničenja`. Kontrole ohrani tudi pri praznem projektu/filtru; preglednica razlikuje oba prazna izida. Pokrije R03–R05, R09, R10.

## Uporabniška zgodba 2 — skupni prikaz, števci in ohranitev stanja

- [x] [T004] V `src/App.tsx` poveži isti odsek z vrsticami preglednice in propom `TaskBoard.tasks`; globalne števce pusti vezane na celoten projekt. Ohrani projektni key, obstoječe povezave, `data-task-id`, imena in poti dialoga, tako da preklop pogleda/podrobnosti ohrani stanje, menjava projekta in reload pa ga ponastavita. Preveri pogodbi `src/TaskBoard.tsx` in `src/TaskDetails.tsx` brez nepotrebnih posegov. Pokrije R06–R08, R11, R12.

## Dodelava in preverjanje

- [x] [T005] V `src/styles.css` oblikuj nove kontrole in status z obstoječimi spremenljivkami Folio, vidnim fokusom in prelamljanjem. Ohrani notranje drsenje preglednice/table in prepreči prelivanje cele strani pri 390 pikah; ne spreminjaj osnovne postavitve. Pokrije R12.

- [x] [T006] V `tests/agent/P05.spec.ts` pripravi A01–A05 iz `plan.md`: vse velikosti in štiri smeri na 13 opravilih, veljavna poznejša stran ob spremembi velikosti, vsi filtri, enakost ID-jev pogledov in števci, ohranitev ob dialogu ter ponastavitve, prazni projekti/filtri in eno opravilo, drugačni ID-ji/enaki naslovi/Unicode, nič zapisov ter širina 390 pik. Preveri natančni status, URL/shrambo in vrnitev na vse podatke. Uporabi obstoječe testne GET pripomočke samo iz testov; skupnih testov ne spreminjaj. Pokrije R01–R12.

- [x] [T007] Izvedi `npm run lint` in `npm run build`; shrani izhode in izhodne kode v `docs/agent/P05/` ter povzetek v `docs/agent/verification.md`. Morebitne napake popravi samo v dovoljenih datotekah in ponovi prizadeto preverjanje.

- [x] [T008] Izvedi `npm test` z obstoječo konfiguracijo: skupni API/regresijski testi, razvojni P05 na namizju/mobilno in lastni testi. Shrani določljiva dokazila v `docs/agent/P05/`; preveri posnetke preglednice in table pri običajni širini ter 390 pikah. V `docs/agent/verification.md` zapiši dejanske uspehe, napake, ponovitve in vizualne ugotovitve. Neizvedenih ali nedostopnih končnih testov ne označi kot uspešnih.

- [x] [T009] V `docs/agent/P05/spec.md` dopolni vseh 12 vrstic sledljivosti s končnimi deli kode, dejanskimi testi in povezavami na dokazila; posodobi zgodovino sprememb ter omejitve. Uskladi `docs/agent/P05/tasks.md` in `docs/agent/verification.md`, preveri dovoljeni obseg sprememb in pripravi jedrnato predajo. Zadnjo minuto skupnega roka nameni tej nalogi.
