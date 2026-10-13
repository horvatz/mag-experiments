# Preverjanje P04 — dejansko izvedena preverjanja

Datum: 2026-10-11. Postopek A, en agent. Okolje: macOS (Apple Silicon),
Node.js 24.11.1, React 19.3.0, Vite 8.3.0, Playwright 1.63.0 z ločenim
Chromiumom (`task/browser.json`, `chromium.connect`). Omrežje je blokirano;
uporabljene so samo lokalne storitve naloge. Končnih (skritih) testov ni bilo
mogoče zagnati.

## Izvedeni ukazi in rezultati

| Ukaz | Obseg | Izid |
| --- | --- | --- |
| `npm run lint` | ESLint po celotnem repozitoriju | uspešno, brez napak |
| `npm run build` | `tsc --noEmit` in `vite build` | uspešno |
| `npx playwright test --project=development-desktop --project=development-mobile` | 8 razvojnih preverjanj P04 (D01–D04 × 2 pogleda) | 8/8 uspešno (3,5 s) |
| `npx playwright test --project=agent` | 12 lastnih agentnih preverjanj (A01–A12) | 12/12 uspešno (5,3 s) |
| `npm run check` | lint + build + vsi testi | izhod 0, **58/58 uspešno** (38 izhodišče + 8 razvojni P04 + 12 agentni), testi 20,6 s |

Prvi zagon agentnih testov je imel 3 neuspehe, ki so bili posledica napačno
zapisanih pričakovanj v mojih testih (ne kode aplikacije): A02 je pozabil, da
je sekundarna smer še vedno `desc`; A08 ni imel izenačenega naslova, zato se
sekundarni ključ ni uporabil; A07 je večkrat klical `mount` na isti URL.
Testi so bili popravljeni (A07 razdeljen na A07/A11/A12), aplikacijska koda pa
se ni spreminjala. Popravljen zagon: vsi uspešni; ponovljeno v `npm run check`.

Dokaz izvora: dnevnik zgoraj navedenih zagonov; imena preverjanj so navedena v
`tests/development/P04.spec.ts` in `tests/agent/sorting.spec.ts`. Vsak test
izpiše ✓ v zagonskem dnevniku; poročilo HTML je v `playwright-report/html/`.

## Sledljivost po zahtevah

| Zahteva | Preverjanje (dejansko izvedeno) | Koda | Izid |
| --- | --- | --- | --- |
| R01 | D01 (privzeti vrstni red), A04/A06 (privzete vrednosti po projektu in osvežitvi) | `defaultSortState`, `sortTasks` v `src/sorting.ts`; `useState` v `src/App.tsx` | uspešno |
| R02 | A01 (NFD, šumniki, male črke, `Alfa 10` pred `alfa 2`), D01 | `normalizeText`, `compareByKey` | uspešno |
| R03 | A02 (status `todo→in_progress→done`, sekundarni `dueDate`), D02, D03 | `statusRank`, veja `dueDate` | uspešno |
| R04 | A02 (neodvisni smeri), A03 (`desc` ne obrne izenačenih), D02 | `directed` + stabilno `Array.sort` | uspešno |
| R05 | A02 (sekundar šele ob enakosti; enak primarni in sekundarni ključ) | pogoj `primaryResult !== 0` | uspešno |
| R06 | A03, A04 (original vedno izvorni vrstni red), A02 (enak ključ) | zgodnji `return [...tasks]`, stabilnost | uspešno |
| R07 | A05 (stalni stolpci, relativni vrstni red), D03 | `TaskBoard` filtrira že razvrščeno polje | uspešno |
| R08 | A06 (tabla→preglednica→podrobnosti ohranijo vse štiri nastavitve), A05 | stanje v `ProjectView`, ne v pogledu | uspešno |
| R09 | A06 (menjava projekta in `reload` vrneta privzete vrednosti; prazna `localStorage`/`sessionStorage`, URL brez `sort`) | `key={project.id}`, `useState` | uspešno |
| R10 | A07 (gumb ponastavi vse štiri), A11 (prazen projekt, vsi ključi in smeri), A12 (enojni projekt), D04 | `SortControls`, `onReset` | uspešno |
| R11 | A08 (polja in števci nespremenjeni, izvorni vrstni red po ponastavitvi, ni zapisov, `saveRequests=0`), D04 | `sortTasks` vrača kopijo; ni pisanja v API | uspešno |
| R12 | A09 (vsak ID enkrat, enaki naslovi odpirajo prave podrobnosti), A10 (390 pik brez prelivanja), 38 osnovnih preverjanj (pogledi, stolpci, `aria-label`, fokus) | `src/App.tsx`, `src/TaskBoard.tsx`, `src/styles.css` | uspešno |

Meja med splošnim pravilom in posameznim primerom: zgornja preverjanja so
vzorčenje pravil iz `docs/agent/specification.md`; niso popoln dokaz za
poljubne podatke, zato so pravila zapisana kot predikati in implementirana
neodvisno od konkretnih primerov.

## Odstopanja in omejitve

- Končnih (skritih) ocenjevalnih testov v tem okolju ni; njihov izid ni
  znan in ga ne navajam kot uspešnega.
- Preverjeno je samo okolje Chromium (namizje 1440 × 960 in 390 pik v A10);
  Safari, Firefox in fizični telefon niso bili preverjeni.
- Ročni ogled z `WEB_PORT=5193 API_PORT=3123 npm run dev` ni bil izveden;
  vedenje je preverjeno avtomatizirano, videz pa se naslanja na obstoječe
  slogovne gradnike Folio (`src/styles.css`).
- Testi uporabljajo testne kontrole `/__test/` in `page.route`; aplikacija
  sama bere samo `/api/` in testnih kontrol ne uporablja (A08 preveri tudi
  `saveRequests=0`).
- Razvrščanje velja le v trenutni seji in projektu; trajna shramba ni del
  zahtev in je ni.
- Neveljavni ali manjkajoči datumi niso bili preverjeni, ker jih naloga
  izključuje (podatki so veljavni `YYYY-MM-DD`).
