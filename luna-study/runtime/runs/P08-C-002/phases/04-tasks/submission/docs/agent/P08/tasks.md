# P08: Koledarski pregled rokov — naloge

## Setup

- [ ] [T001] V `tests/agent/P08.spec.ts` pripravi Playwright testne podatke z nadzorovanimi odzivi javnega GET API-ja ter scenarije mejnih datumov, statusa `done`, prestopnega datuma in različnih ID-jev/vrstnih redov (R01–R05).

## Foundational

- [ ] [T002] V `src/deadlines.ts` dodaj čisti koledarski izračun skupine in števcev: status `done` preveri prvi, primerjaj veljavne datume brez lokalnega časovnega pasu in sedem dni prištej koledarsko (R02–R05).

## User stories (po prednosti)

- [ ] [T003] V `src/App.tsx` dodaj projektno lokalni referenčni datum `2026-09-21`, začetno skupino `all`, kontroli datuma in skupine, nefiltrirane števce ter prazno-datumsko opozorilo, ki ohranja zadnji veljavni izračun; filter ostane brez trajne shrambe in URL-ja (R01, R06, R08, R10).
- [ ] [T004] Uporabi eno filtrirano množico opravil za preglednico in `src/TaskBoard.tsx`; ohrani izvorni vrstni red seznama, `data-task-id`, iste filtrirane ID-je v obeh pogledih in prazno stanje z besedilom `Ni opravil v izbrani skupini.` (R07, R09, R11).

## Polish

- [ ] [T005] V `src/styles.css` in `src/App.tsx` uredi odzivne kontrole, zahtevana dostopna imena, številske števce in opozorilo; ohrani potrjeni Folio ter notranje drsenje pri širini 390 px (R12).
- [ ] [T006] Razširi `tests/agent/P08.spec.ts` s preverjanji vseh skupin in števcev, veljavnega/praznega datuma in opozorila, vrstnega reda ter enakih ID-jev v pogledih, menjave projekta/osvežitve in URL-ja/shrambe filtra, praznih odzivov, odsotnosti API zapisov, nespremenjenih opravil in širine 390 px (R06–R12).
- [ ] [T007] Zaženi `npm run check` in namensko P08 Playwright zbirko; v `docs/agent/P08/spec.md` zapiši dejansko izvedene teste, rezultate, lokacije kode in morebitne nepreverjene zahteve.
