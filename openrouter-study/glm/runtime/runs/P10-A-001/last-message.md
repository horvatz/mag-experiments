**Rezultat**
- Implementiral sem lokalni vrstni red z gumbi za premik, razveljavitev, ponovitev in reset v `src/taskOrder.ts:21`, `src/App.tsx:13` in `src/TaskBoard.tsx:9`.
- Dodal sem globalna mesta, števce zgodovine in prilagodljive Folio stile v `src/styles.css:61`.
- Specifikacija R01–R12 je v `docs/agent/specification.md:1`, s kratko zgodovino popravkov.
- Lastni testi pokrivajo zgodovine, mejo 20, tablo, podrobnosti, preklop projekta, osvežitev, robne primere in širino 390 px: `tests/agent/P10-agent.spec.ts:58`.
- Dejanski rezultati so zapisani v `docs/agent/verification.md:3`.
- Končni `npm run check` je uspešen: ESLint, TypeScript, Vite build in 51/51 Playwright testov.
- Ni znanih neizpolnjenih zahtev. Preverjanje je omejeno na lokalni testni strežnik in nameščen Chromium, kar je skladno z omejitvami naloge.
