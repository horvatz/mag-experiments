# Naloge za P05

## Izvedba in preverjanje

- [ ] T001 V `src/App.tsx` dodaj lokalno stanje za velikost strani, filter in številko strani ter izpeljavo filtriranega polja, števila strani, obsega prikaza in trenutnega odseka.
- [ ] T002 V `src/App.tsx` dodaj dostopna izbiralnika `Velikost strani` in `Filter strani` ter gumbe `Prva stran`, `Prejšnja stran`, `Naslednja stran` in `Zadnja stran`; sprememba velikosti ali filtra vedno vrne na prvo stran, robna dejanja pa so onemogočena.
- [ ] T003 V `src/App.tsx` in po potrebi `src/TaskBoard.tsx` uporabi isti trenutni odsek v preglednici in tabli, ohrani pregled stanj nad celotnim projektom, števce stolpcev nad trenutno stranjo ter obstoječe povezave, ID-je in podrobnosti.
- [ ] T004 V `src/App.tsx` dodaj status `role="status"` z `aria-label="Stanje straničenja"` in zahtevanim besedilom za neprazne in prazne rezultate.
- [ ] T005 V `src/styles.css` umesti nove kontrole in status v potrjeni Folio videz ter preveri širino 390 pik brez razširjanja celotne strani.
- [ ] T006 V `tests/agent/p05.spec.ts` dodaj Playwright teste, ki pokrijejo R01–R12: privzete vrednosti, vse velikosti strani, vse filtre, premike in robove, oba pogleda, podrobnosti, ponastavitev ob menjavi projekta ali osvežitvi, status, števce, prazne rezultate in odsotnost zapisov na API.
- [ ] T007 Po implementaciji izvedi `npm run lint`, `npm run build`, ciljne teste P05 in smiselne skupne teste izhodišča; zapiši dejanske izide ter morebitne neizpolnjene zahteve.
