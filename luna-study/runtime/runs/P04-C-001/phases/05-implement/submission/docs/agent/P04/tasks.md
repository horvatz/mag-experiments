# Naloge P04: Stabilno razvrščanje z dvema ključema

Specifikacija: [spec.md](./spec.md) · Načrt: [plan.md](./plan.md)

## Setup

- [ ] [T001] Dodaj agentne Playwright primere za primerjalna pravila R01–R06 (privzeti vrstni red, NFD/UTF-16, stanja/datume, neodvisne smeri, stabilne vezi in enaka ključa) v `tests/agent/P04.spec.ts`.

## Foundational

- [ ] [T002] V `src/taskSorting.ts` dodaj tipe nastavitev in čist razvrščevalnik, ki vrne novo polje, upošteva pravila R01–R06 ter ne spreminja vhodnih opravil.

## User stories

- [ ] [T003] V `src/App.tsx` dodaj štiri dostopne izbirne kontrole in gumb **Izvorni vrstni red**; nastavitve naj se posodabljajo neodvisno, ob menjavi projekta ponastavijo, ob menjavi pogleda in podrobnostih pa ohranijo (R01, R05, R08–R10).
- [ ] [T004] Uporabi urejeno projekcijo za vrstni red vrstic in kartic v `src/App.tsx` ter `src/TaskBoard.tsx`; ohrani fiksni red stolpcev, seštevke in ID-je, uporabljaj samo `/api/` ter ne pošiljaj zapisov (R07, R11, R12).
- [ ] [T005] V `src/styles.css` oblikuj kontrole z obstoječimi Folio slogi; zagotovi prelom pri ozkem prikazu, vidni fokus in brez razširitve strani pri širini 390 px (R12).
- [ ] [T006] Razširi `tests/agent/P04.spec.ts` z brskalniškimi primeri za preglednico/tabla, podvojene naslove in ID-podrobnosti, preklop pogleda, odpiranje/zapiranje podrobnosti, menjavo projekta, osvežitev, ponastavitev ter prazno in enoelementno polje pri vseh ključih in smereh (R07–R12); ne spreminjaj razvojnih ali skupnih testov.

## Polish

- [ ] [T007] Zaženi `npm run check`; odpravi ugotovljene napake v dovoljenih datotekah in v `docs/agent/P04/spec.md` dopolni sledljivost R01–R12 z dejanskimi datotekami, testi, izidi in omejitvami.
