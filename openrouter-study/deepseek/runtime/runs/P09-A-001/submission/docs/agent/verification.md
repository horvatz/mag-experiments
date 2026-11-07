# P09 – Poročilo o dejansko izvedenih preverjanjih

Okolje: Node 24.11.1, Playwright 1.63.0, Chromium iz `task/browser.json`
(`chromium.connect`), Vite dev strežnik na 5174/3102 (testi) in 5193/3123
(ročni pregled). Datum zagona: 2026-10-31.

## Izvedeni ukazi in rezultati

| Ukaz | Obseg | Rezultat |
| --- | --- | --- |
| `npm run lint` | ESLint nad `src/`, `tests/` | uspešno, brez opozoril |
| `npm run typecheck` | `tsc --noEmit` | uspešno |
| `npm run check` | lint + build + vsi testi | **64 preverjanj, vse uspešno (23,0 s)** |
| `npx playwright test --project=agent` | lastni testi A01–A18 | 18/18 uspešno |
| znotraj `npm run check` | izhodišče (desktop/mobile/api) | 38/38 uspešno |
| znotraj `npm run check` | `development-desktop` + `development-mobile` (D01–D04) | 8/8 uspešno |

Dnevnik celotnega zagona je bil shranjen v `.tmp/check.txt` (delovna mapa, ni
del oddaje). Vsi testi so bili zagnani v tem zagonu; noben izid ni naveden kot
uspešen brez izvedbe.

## Sledljivost zahtev

| Zahteva | Pogoj (kaj je bilo preverjeno) | Test / scenarij | Datoteka in del kode | Izid in dokaz |
| --- | --- | --- | --- | --- |
| R01 | neposredni URL uporabi `q/status/order` brez klika, na poti projekta in opravila | A01, A02, D01 | `src/navigation.ts` (`useRoute`), `src/viewState.ts` (`parseViewState`) | uspešno; A01/A02 v `--project=agent`, D01 v obeh razvojnih projektih |
| R02 | fraza po title/description/assignee/id, trim + NFD + brez ločilnih znamenj + male črke, dobesedno | A03, A04, A18, D01 | `src/viewState.ts` (`normalizeText`, `filterTasks`) | uspešno; A18 preveri še oklepaje, narekovaje in `=SUM(` |
| R03 | `status` po enakosti, vez z `q` po IN, `order` po normaliziranem naslovu v UTF-16 s stabilnostjo | A03, A05 | `src/viewState.ts` (`filterTasks`) | uspešno; A05 potrjuje `web-07` (`=SUM(A1)`) prvega pri `title-asc` in izenačenje `web-02` pred `web-03` |
| R04 | neznane vrednosti ⇒ privzeto, prva pojava parametra, neznani parametri ne vplivajo, branje ne prepiše URL-ja | A06, A07 | `src/navigation.ts` (`parseViewState`, `splitHash`) | uspešno; A06 preveri, da `nonsense=1` ostane v URL-ju |
| R05 | osnutek ne spremeni prikaza/URL-ja; potrditev uveljavi vse tri vrednosti z največ enim novim stanjem | A08, D02 | `src/App.tsx` (`ViewFilters`, `commit`) | uspešno; A08 primerja `history.length` pred/po in po `goBack` |
| R06 | obrezan `q`, izpuščeni privzeti parametri, URL-kodiranje, ohranjen `view=board`, odstranjeni neznani parametri, ponovitev brez novega stanja | A08, A09, D02 | `src/viewState.ts` (`buildViewQuery`), `src/App.tsx` (`commit`) | uspešno; A09 preveri `q=pregled`, odsotnost `nonsense` in nespremenjeno dolžino zgodovine |
| R07 | nazaj/naprej obnovita filtre, prikaz in osnutek; osvežitev ohrani URL | A10, D03 | `src/App.tsx` (izpeljani osnutek iz `routeKey`), `src/navigation.ts` (`navSequence`) | uspešno; A10 preveri nazaj in naprej, D03 osvežitev v obeh razvojnih projektih |
| R08 | preklop Preglednica/Tabla ohrani parametre in iste ID-je, osnutek se zavrže | A11, D03 | `src/App.tsx` (`openView`), `src/TaskBoard.tsx` | uspešno; A11 preveri `view=board`, `status=done`, `order=title-desc` in prazen osnutek |
| R09 | podrobnosti in zapiranje (gumb, Escape) ohranijo parametre in pogled, povezava cilja pravi ID | A02, A12, A13 | `src/App.tsx` (`taskUrl`), `src/TaskDetails.tsx`, `src/TaskBoard.tsx` | uspešno; A13 odpre `web-03` in `web-02` z enakim naslovom in preveri različna stanja |
| R10 | klik na drug projekt = privzeti pregled in ohranjen pogled; neposredna povezava s parametri jih upošteva | A14 | `src/App.tsx` (stranska navigacija `projectUrl`) | uspešno; A14 preveri prazen `q`, `all`, `original` in `q=drugi&status=done` |
| R11 | Ponastavi počisti tri filtre in osnutek, ohrani pogled, posodobi zgodovino; `Ni zadetkov.`; števec `Prikazano: N od M.` | A15, A16, D04 | `src/App.tsx` (`ViewFilters`, `commit(DEFAULT_VIEW_STATE)`), `src/styles.css` | uspešno; A15 preveri tudi `goBack` na filtrirano stanje, A16 števce `0 od 8`, `2 od 8`, `0 od 0` |
| R12 | brez zapisov in brez `/__test/`, brez `localStorage`, obstoječi pogledi delujejo, brez vodoravnega presega na 390 pik | A17, D04 (`readonly`), izhodiščni testi | `src/App.tsx`, `src/api.ts` (nespremenjeno) | uspešno; A17 preveri `writes == []`, `saveRequests == 0`, prazen `localStorage` in `scrollWidth <= innerWidth` pri 390 px |

Opomba: D01–D04 so skupni razvojni testi in so bili izvedeni v obeh projektih
(`development-desktop`, `development-mobile`); vsi lastni testi A01–A18 so bili
izvedeni v projektu `agent` (Desktop Chrome) v istem zagonskem strežniku.

## Odstopanja, nepreverjeni deli in omejitve

- Končni (skriti) testi te naloge niso dostopni; navedeni so samo izvedeni testi
  izhodišča, razvojni testi in lastni testi.
- Zaslonskih bralnikov in pravih mobilnih naprav nismo preizkusili; dostopnost
  je preverjena posredno prek dostopnostnih imen (Playwright role/name) in
  meritve širine na 390 px (A17) ter razvojnega projekta `development-mobile`.
- Odzivnost na počasno omrežje in sočasne spremembe podatkov med nalaganjem
  niso del obsega P09 (preverjeno le posredno z izhodiščnim testom nalaganja).
- Izpis fraze s presledki v URL uporablja `+` (URLSearchParams); branje z
  `URLSearchParams` je združljivo, dobesedna primerjava niza bi se razlikovala.
- Besedilo `Ni zadetkov.` je izpisano s končno piko, ker ga tako navaja zahteva
  R11; števec je točno `Prikazano: N od M.`.
- Okoljska omejitev: pisanje datotek prek here-dokumenta v lupini ni delovalo
  (`can't create temp file for here document`, prepovedan `TMPDIR`), zato so
  bile datoteke zapisane prek cevi v lupini; vsebina je bila po vsakem koraku
  preverjena z branjem in `npm run check`.
- Prva različica osnutka se je ob hitrem zaporedju potrditve in spremembe
  kontrole izgubila; popravek je opisan v `specification.md` (zgodovina 1.1) in
  potrjen z A08–A11, A15.
