# P05 — naloge izvedbe

## Osnova

- [ ] [T001] Dodaj čist izračun filtra, števila strani in trenutnega odseka v `src/pagination.ts`.

## Uporabniški vmesnik

- [ ] [T002] Dodaj lokalno stanje velikosti, filtra in strani ter kontrole z natančnim statusom v `src/App.tsx`.
- [ ] [T003] Poveži preglednico in tablo na isti trenuten odsek ter ohrani podrobnosti, povezave in preklop prikaza v `src/App.tsx`.
- [ ] [T004] Dopolni obstoječo glavo s Folio slogi za nove kontrole in ohrani ozko postavitev v `src/styles.css`.

## Preverjanje in dokazila

- [ ] [T005] Dodaj lastne Playwrightove preiskave R01–R12, vključno s praznim projektom, filtrom brez zadetkov, zadnjo krajšo stranjo in preklopom prikaza, v `tests/agent/p05.spec.ts`.
- [ ] [T006] Zaženi lastne teste (`npm test -- tests/agent/p05.spec.ts`) in typecheck/build (`npm run typecheck && npm run build`); popravi morebitne napake v `src/` ali `tests/agent/`.
- [ ] [T007] Zaženi skupne regresijske preiske (`npm test`) in zapiši dejanske izide ter dokaze v `docs/agent/P05/spec.md`.
