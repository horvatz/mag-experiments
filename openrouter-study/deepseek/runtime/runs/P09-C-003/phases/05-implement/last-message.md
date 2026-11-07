Korak `$speckit-implement` je opravljen.

**Izvedba**
- `src/viewState.ts` (novo): `parseViewParams` (prva pojava, neznano → privzeto), `normalize` (NFD, U+0300–U+036F, male črke, trim), `matchesQuery`, `filterTasks` (q IN status, stabilno urejanje z izvornim vrstnim redom ob izenačenju), `buildHash` (privzete izpusti, `view=board` ohrani, neznane odstrani, URL-kodira).
- `src/navigation.ts`: `useRoute` s `params`, `projectUrl`/`taskUrl` s parametri, `navigate` (`pushState` + `hashchange`) za natanko eno zgodovinsko stanje.
- `src/ViewControls.tsx` (novo): oznake "Iskanje v povezavi", "Stanje v povezavi", "Vrstni red v povezavi", gumba Uporabi/Ponastavi pogled, števec `role=status` `aria-label="Rezultati povezave"`.
- `src/App.tsx`, `TaskBoard.tsx`, `TaskDetails.tsx`: filtriran prikaz, "Ni zadetkov.", prenos parametrov v povezave/podrobnosti, ohranjen Folio videz in `data-task-id`.
- `src/styles.css`: vrstica kontrol v duhu Folio, prelom pri ozkih zaslonih.

**Preverjanje** (`docs/agent/verification.md`)
- `npm run check` → **57 uspelih, 0 neuspelih**: lint, typecheck, build, 38 osnovnih, 8 razvojnih P09 (D01–D04 × desktop/mobile) in **11 lastnih testov** `tests/agent/p09.spec.ts` za R01–R12 (vključno z 390 px, brez zapisov in `localStorage`).
- Sprva so 3 lastni testi padli; vzroka sta bila napačna pričakovanja (q "pregled" ujame tudi "Čas za pregled") in osvežitev podatkov pri navigaciji samo po fragmentu — testi popravljeni, vsi uspejo.
- `docs/agent/P09/tasks.md`: vseh 24 nalog označenih `[x]`; sledljivost v `spec.md` dopolnjena z dejanskimi izidi.

**Omejitve**: končni zunanji testi niso dostopni in niso bili izvedeni; navigacije med nalaganjem in sočasne spremembe podatkov ostajajo izven obsega. Infrastruktura, odvisnosti, strežnik in skupni testi so nespremenjeni.

Preostanek proračuna ~420 s od 742 s. Naslednji korak (`$speckit-converge`) sproži izvajalnik.
