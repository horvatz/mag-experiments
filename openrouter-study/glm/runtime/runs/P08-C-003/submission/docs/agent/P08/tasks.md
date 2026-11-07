# Naloge implementacije: Koledarski pregled rokov

## Osnova

- [x] [T001] Dodaj čisto koledarsko logiko za veljavne datume, seštevanje dni in skupine rokov v `src/due.ts`.

## Uporabniški vmesnik

- [x] [T002] V `src/App.tsx` dodaj lokalno stanje P08, kontrole `Referenčni datum` in `Pogled rokov`, pet števcev, opozorilo za prazen datum in enoten filtriran seznam za R01–R11.
- [x] [T003] V `src/TaskBoard.tsx` prikaži isti filtriran seznam brez sprememb podatkov, dostopnega imenovanja, `data-task-id` ali izvornega zaporedja.
- [x] [T004] Dopolni obstoječe Folio stile v `src/styles.css` za kontrole, števce, opozorilo in ozke zaslone; ne spreminjaj infrastrukture ali odvisnosti.

## Preverjanje

- [x] [T005] Dodaj lastne Playwright teste v `tests/agent/p08.spec.ts` za R01–R12, vključno s praznim projektom, prazno skupino, mejnimi datumi, prestopnimi datumi, preklopi pogledov, osvežitvijo in odsotnostjo zapisovalnih klicev.
- [x] [T006] Zaženi usmerjene teste iz `tests/agent/p08.spec.ts`, nato obstoječe preverbe, ki so smiselne za spremembo; zabeleži samo dejanske izide in morebitne neizpolnjene zahteve.

## Predaja

- [x] [T007] Posodobi sledljivost v `docs/agent/P08/spec.md` z dejanskimi testi, deli kode, izidi in omejitvami po zaključenem preverjanju.
