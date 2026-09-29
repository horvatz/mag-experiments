# P09 — naloge izvedbe

## Priprava

- [ ] [T001] V `tests/agent/P09.spec.ts` pripravi Playwright ogrodje in po potrebi GET prestreznike za testne nabore; testi naj ne spreminjajo aplikacijskih podatkov.

## Temelj

- [ ] [T002] V `src/navigation.ts` razširi razčlenjevanje fragmenta za `q`, `status`, `order` in `view`: podpri privzete/veljavne vrednosti, prvo ponovljeno pojavitev in nespremenjen URL ob samem branju.
- [ ] [T003] V `src/navigation.ts` dopolni gradnjo projektnih in opravilnih URL-jev ter potrditev zgodovine: kodiraj vrednosti, izpusti privzete filtre, ohrani `view=board`, odstrani neznane parametre pri potrditvi in ne dodajaj vnosa pri enakem stanju.

## Uporabniške zgodbe

- [ ] [T004] V `src/App.tsx` dodaj tri zahtevane kontrole in loči njihov osnutek od potrjenih filtrov; poveži gumba »Uporabi pogled« in »Ponastavi pogled« s pravili URL-ja in zgodovine iz R05, R06 in R11.
- [ ] [T005] V `src/App.tsx` filtriraj opravila po normalizirani dobesedni frazi ter statusu IN; stabilno razvrsti naslove po UTF-16 in izriši prazen rezultat ter števec `N` od `M` (R02, R03, R11).
- [ ] [T006] V `src/App.tsx`, `src/TaskBoard.tsx` in `src/TaskDetails.tsx` ohrani potrjene filtre ob preklopu pogleda in odpiranju/zapiranju podrobnosti; navigacijske osnutke zavrzi, projektni klik naj uporabi privzete filtre, neposredna povezava pa svoje (R07–R10).

## Izpopolnitev

- [ ] [T007] V `src/App.tsx` in `src/styles.css` ohrani zahtevana dostopna imena, `data-task-id`, dejanja zunaj povezav opravil, potrjeni videz Folio in odzivnost pri 390 px.
- [ ] [T008] V `tests/agent/P09.spec.ts` dodaj Playwright preverjanja za R01–R12: neposredni URL-ji in osvežitev; normalizacija Unicode/ločil, vsa iskalna polja, stanja, stabilni enaki naslovi; neveljavni in ponovljeni parametri; osnutek, potrditev, ponastavitev in zgodovina; oba pogleda, podrobnosti po ID-ju, menjava projekta, nič zadetkov, brez zapisov ter širina 390 px. Različne nabore podatkov pripravi s testnimi prestrezniki GET.
- [ ] [T009] Po izvedbi poženi agentne in skupne preveritve, vključno z `npm run check`; v `docs/agent/P09/spec.md` posodobi sledljivost z dejanskimi testi, izidi in določljivimi dokazili ter zapiši nepreverjene končne teste/omejitve.
