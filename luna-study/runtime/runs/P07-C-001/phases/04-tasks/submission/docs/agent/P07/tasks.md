# P07 izvedbene naloge

## Setup

- [ ] [T001] Dodaj `tests/agent/favorites.spec.ts` s scenariji za R01–R12: preklop in enake naslove v obeh pogledih, kanoničen zapis/obnova/neveljavni podatki, filter/prazno stanje/števci/menjava projekta, dogodki `storage` in izjeme, brez API zapisov ter širina 390 px. Testne odzive pripravi samo prek obstoječega testnega programa.

## Foundational

- [ ] [T002] Dodaj `src/useFavorites.ts` za branje, validacijo in zapis `folio:favorites:v1`, deduplikacijo in UTF-16 razvrščanje ID-jev, globalno stanje, dogodke `storage` brez povratnega zapisa ter uporabno delovanje in opozorilo ob izjemi.

## User stories

- [ ] [T003] Posodobi `src/App.tsx` in `src/TaskBoard.tsx`, da preglednica in tabla uporabljata isto stanje ter imata ločene dostopne gumbe priljubljenih po ID-ju, brez odpiranja povezave do podrobnosti (R01, R07, R12).
- [ ] [T004] V `src/App.tsx` dodaj filter trenutnega projekta, prazno filtrirano stanje, odstranitev priljubljenih tega projekta ter predpisana števila; ohrani množico ob menjavi projekta, filter pa ponastavi ob menjavi projekta in osvežitvi (R05–R10).

## Polish

- [ ] [T005] Dopolni `src/styles.css` za nove kontrole, fokus in prazno stanje; ohrani potrjeni Folio dizajn, obstoječe dostopne oznake in širino strani 390 px z dovoljenim notranjim drsenjem (R12).
- [ ] [T006] Zaženi `npm run lint`, `npm run build` in `npm test`; preveri lastne scenarije ter regresije izhodišča. Posodobi matriko izvedbe v `docs/agent/P07/spec.md` z dejanskimi datotekami, imeni testov, rezultati in neizvedenimi preverjanji; uspeha ne zabeleži brez dokaza.
