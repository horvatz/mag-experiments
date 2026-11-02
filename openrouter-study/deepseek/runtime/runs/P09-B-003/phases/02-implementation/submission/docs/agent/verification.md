# P09 — dnevnik preverjanja (izvajalec)

Faza: implementacija (agent-izvajalec). Vir zahtev: `docs/agent/specification.md`
(R01–R12) in `task/instructions.md`. Vse spodaj je sprva načrt; izidi se vpišejo
po dejanskem izvajanju. Statusi: [ ] ni izvedeno, [x] izvedeno, [!] napaka/odstop.

## Načrtovan obseg

- Enotna logika stanja pogleda: `src/viewState.ts` (normiranje, razčlenjevanje,
  gradnja query dela, filtriranje in stabilno urejanje).
- Branje/pisanje fragmenta: `src/navigation.ts` (`useRoute`, `projectUrl`,
  `taskUrl`).
- Kontrole pogleda: `src/ViewFilters.tsx` (osnutek proti potrjenemu stanju).
- Povezava v `src/App.tsx`, `src/TaskBoard.tsx`, `src/TaskDetails.tsx`; slogi v
  `src/styles.css`.
- Lastni testi v `tests/agent/` (scenariji R01–R12 z nadzorovanimi podatki).
- Skupni testi: `npm run check` (slog, tipi, gradnja, osnovni + razvojni +
  lastni testi) in ločeno `npx playwright test --project=development-desktop
  --project=development-mobile`.

## Načrtovana preverjanja po zahtevah (pred izvedbo)

Opomba: statusi v spodnji načrtovalski tabeli so ostali na [ ] iz faze načrta;
dejanski izidi so v razdelku »Sledljivost zahtev (dejanski dokazi)«.

| Zahteva | Scenarij | Status |
| --- | --- | --- |
| R01 | Neposredna povezava `#/projects/web?q=...&status=...&order=...`; kontrole in seznam takoj ustrezajo. | [ ] |
| R02 | Normalizacija (NFD, šumniki, velikost), podniz po title/description/assignee/id, dobesedna fraza, brez regexa. | [ ] |
| R03 | q IN status; title-asc/desc z enakimi naslovi ohrani izvorni vrstni red. | [ ] |
| R04 | Neznan status/order → privzeto; prva ponovitev parametra; neznani parametri ne vplivajo in URL se ob odprtju ne prepiše. | [ ] |
| R05 | Osnutek ne spremeni prikaza/URL-ja; Uporabi pogled potrdi vse tri in doda največ eno stanje. | [ ] |
| R06 | Obrezovanje q, izpuščanje privzetih, kodiranje, ohranitev `view=board`, odstranitev neznanih; ponovitev ne doda stanja. | [ ] |
| R07 | Nazaj/Naprej in osvežitev obnovijo potrjeno stanje, prikaz in osnutek. | [ ] |
| R08 | Preklop pogleda ohrani parametre in iste ID-je; osnutek se zavrže ob navigaciji. | [ ] |
| R09 | Podrobnosti in zapiranje (gumb, Escape) ohranijo parametre in način; povezava po `id` pri enakih naslovih. | [ ] |
| R10 | Klik na drugi projekt → privzeti pregled z ohranjenim table/board; neposredna povezava s parametri jih upošteva. | [ ] |
| R11 | Ponastavi pogled počisti filtre in osnutek, ohrani način, po istem pravilu zgodovine; `Ni zadetkov.`; `Prikazano: N od M.`. | [ ] |
| R12 | Samo GET/HEAD/OPTIONS; brez `localStorage`; regresije izhodišča. | [ ] |

## Omejitve in zaznamki okolja

- Javni internet je blokiran; uporabljeni so le lokalni strežnik in Playwright.
- Chromium je prednameščen; testi uporabljajo `connectOptions.wsEndpoint` iz
  `task/browser.json` (nastavljeno v `playwright.config.ts`); `chromium.launch()`
  se ne uporablja.
- Skupni testi in infrastruktura ostajajo nespremenjeni; lastni testi so v
  `tests/agent/`.

## Dnevnik izvedbe

- [x] Slog (`npm run lint`) — uspešno.
- [x] Tipi (`npm run typecheck`) — uspešno.
- [x] Gradnja (`npm run build`) — uspešno.
- [x] Osnovni + razvojni + lastni testi (`npm run check`) — 58 uspešnih,
  0 neuspešnih (38 osnovnih + 8 razvojnih D01–D04 + 12 lastnih), 21,7 s.
- [x] Razvojni testi ločeno (desktop + mobile) — zajeti v `npm run check`,
  vsi D01–D04 zeleni na obeh projektih.

## Spremembe (izvajalec)

- `src/viewState.ts` (nov): `normalize`, `parseViewState`, `buildViewQuery`,
  `matchesQuery`, `selectVisibleTasks`, privzeto stanje.
- `src/navigation.ts`: `useRoute` bere tudi `q/status/order` in vrne `state` ter
  `hash`; `projectUrl`/`taskUrl` sprejmeta stanje in ohranita `view=board`.
- `src/ViewFilters.tsx` (nov): osnutek kontrol (Iskanje/Stanje/Vrstni red),
  gumba Uporabi pogled in Ponastavi pogled, `role=status`
  `aria-label="Rezultati povezave"`.
- `src/App.tsx`: filtriranje/urejanje seznama, potrditev v zgodovino, preklop
  pogleda s parametri, `Ni zadetkov.` ob praznem rezultatu.
- `src/TaskBoard.tsx`, `src/TaskDetails.tsx`: povezave in zapiranje ohranijo
  potrjeno stanje.
- `src/styles.css`: slog filtrov, vključno z ozkim zaslonom (390 px).
- `tests/agent/helpers.ts`, `tests/agent/view-state.spec.ts` (novi lastni testi).

## Sledljivost zahtev (dejanski dokazi)

| Zahteva | Test (vse `tests/agent/view-state.spec.ts`) | Izid |
| --- | --- | --- |
| R01 | `R01: direct link applies committed filters without extra clicks` | [x] |
| R02 | `R02: q is one literal normalized phrase over title, description, assignee and id` | [x] |
| R03 | `R03: status and q combine by AND; ordering is stable for equal titles` | [x] |
| R04 | `R04: unknown values fall back to defaults, first repeated parameter wins and the URL is not rewritten` | [x] |
| R05 | `R05/R06: draft stays local; apply commits one canonical history state` | [x] |
| R06 | isti test + `R06: apply encodes q, drops defaults and unknown parameters but keeps view=board` | [x] |
| R07 | `R07: back, forward and reload restore committed state and the control draft` | [x] |
| R08 | `R08: view switch keeps committed filters and IDs and discards the draft` | [x] |
| R09 | `R09: details keep filters and view; equal titles open by id and close with button or Escape` | [x] |
| R10 | `R10: project switch starts defaults while keeping the view; direct link keeps parameters` | [x] |
| R11 | `R11: reset clears filters and draft, keeps view and follows the history rule` | [x] |
| R12 | `R12: only read requests, no localStorage, baseline states and narrow layout keep working` + osnovni testi | [x] |

Razvojna testa D02 in D04 dodatno potrjujeta R05/R06/R11/R12, D01 in D03 pa
R01/R07/R08. Prvi zagon lastnih testov je razkril tri napačne pričakovane
vrednosti v mojih testih (ne v kodi): (a) pri izenačenih naslovih ostane izvorni
vrstni red tudi pri `title-desc`, (b) osnutek po Naprej vsebuje tudi potrjeni
`q`, (c) tabla razvršča po stolpcih, zato je primerjava ID-jev neurejena. Po
popravkih testov je vseh 12 zelenih.

## Dejanske omejitve in pojasnila

- [x] Javni internet je blokiran; uporabljeni so le lokalni strežnik (5174/3102)
  in Playwright prek `wsEndpoint` iz `task/browser.json`; `chromium.launch()` ni
  uporabljen.
- [!] Končni (skriti) testi naloge niso dostopni, zato R01–R12 niso preverjeni
  z njimi; preverjeni so z razvojnimi D01–D04 in lastnimi testi.
- [!] Interpretacija R11: pri praznem rezultatu (M > 0, N = 0) se v obeh načinih
  prikaže `Ni zadetkov.`; pri praznem projektu (M = 0) ostane izhodiščni
  `V tem projektu še ni opravil`.
- [!] Vrstni red v tabeli je urejen po R03; tabla ohrani združevanje po stolpcih
  (obstoječi dizajn), zato je tam mogoče primerjati le množico ID-jev.
- [!] Klik na povezavo istega projekta v stranski navigaciji prav tako začne
  privzeti pregled (stanje je vezano na URL); R10 izrecno določa le drugi
  projekt.
- [!] `URLSearchParams` presledek v fragmentu zapiše kot `+`; branje ga dekodira
  nazaj v presledek, tako da je krog skladen z R06.
- [x] Obstoječi dizajn Folio, slovenska poimenovanja in `data-task-id` so
  ohranjeni; stran se pri 390 px ne razširi (lastni test R12).
