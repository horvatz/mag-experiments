# P03 — dejansko preverjanje

Datum: 2026-09-23. Postopek A, en agent. Začetek ob 19:33:52 UTC; izvedba, testi in dokumentacija so zaključeni znotraj omejitve 20 minut. Znane neizpolnjene zahteve: **nobena**. Nedostopni končni testi niso bili izvedeni.

## Končna izvedba

- [filterTasks.ts](../../src/filterTasks.ts): normalizacija NFD, odstranitev samo U+0300–U+036F, male črke, dobesedni podnizi vseh besed in sestavljanje pogojev z IN. Brez mutiranja ali razvrščanja vhodnih podatkov.
- [TaskFilters.tsx](../../src/TaskFilters.tsx): označen iskalnik, dva HTML selecta, izvorni nabor različnih oseb, enoten reset in dostopni števec rezultatov.
- [App.tsx](../../src/App.tsx): lokalno stanje znotraj komponente s ključem projekta; isti filtrirani seznam za preglednico, tablo, pregled stanj in števce; ločitev praznega projekta od praznega rezultata.
- [styles.css](../../src/styles.css): kontrole uporabljajo obstoječe Folio barve, robove in fokus; pri ozki širini se razporedijo v več vrstic.
- [P03.spec.ts](../../tests/agent/P03.spec.ts): sedem dodatnih vedenjskih testov. [visual-check.mjs](../../tests/agent/visual-check.mjs): ponovljiv zajem prikaza prek že nameščenega Chromiuma.

Obstoječi `TaskBoard`, `TaskDetails`, javni API, skupni tipi, infrastruktura in skupni testi niso spremenjeni. V uporabniški kodi ni testnih kontrol ali nove trajne shrambe. Obstoječa neuporabljena funkcija `updateTask` v `src/api.ts` ostaja del izhodišča; filtriranje je ne kliče.

## Izvedeni zagoni

| Ukaz / pregled | Dejanski rezultat | Dokaz |
| --- | --- | --- |
| Prvi `npm run check`, po implementaciji in pred dodatnimi testi | Lint, TypeScript, Vite build in vseh 46 skupnih testov uspešnih (16,8 s za teste). | [check-initial.log](check-initial.log) |
| `npm run check` z začetno različico dodatnih testov | Lint in build uspešna; 52 testov uspešnih, A06 neuspešen zaradi napačne predpostavke o številu GET v StrictMode. | [check-test-correction.log](check-test-correction.log) |
| Končni `npm run check`, po popravku A06 | **Izhod 0. Lint, preverjanje tipov in produkcijska gradnja uspešni; 53/53 testov uspešnih (21,8 s za teste), brez preskočenih testov.** | [check.log](check.log) |
| `WEB_PORT=5193 API_PORT=3123 npm run dev` in `node tests/agent/visual-check.mjs` | Lokalni ogled obeh pogledov pri 1440 × 960 in 390 × 844; brez pageerror; širina dokumenta natanko 1440 oziroma 390; šest posnetkov, preverjanje brez zadetkov in čiščenja uspešno. | [visual-check.log](visual-check.log), [manual-server.log](manual-server.log) |
| Branje kode in `rg` za shrambe, testne kontrole ter zapisovalne metode v `src/` | Filtri ne uporabljajo URL/shramb/testnih kontrol/zapisovalnega API-ja; edini zadetek je nespremenjeni izhodiščni `updateTask`, ki ga filtriranje ne uvaža. | `src/filterTasks.ts`, `src/TaskFilters.tsx`, `src/App.tsx`; A04, A06 |

Končnih 53 testov sestavlja 38 preverjanj izhodišča (14 API, 12 namiznih in 12 mobilnih), 8 razvojnih preverjanj P03 (D01–D04 na dveh prikazih) ter 7 lastnih testov A01–A07.

Popravek A06: ob odpiranju podrobnosti v obeh pogledih so bile opažene štiri bralne zahteve namesto pričakovanih dveh. Izhodišče uporablja React StrictMode, ki v razvoju ponovno izvede učinke. Popravljen test preveri, da je edina uporabljena API-pot `/api/tasks/omega`, da ni uporabniških zahtev na `/__test/`, da ni nobenih zapisovalnih zahtev in da se strežniško stanje ni spremenilo. Implementacija zaradi te napake testa ni bila spremenjena. Dnevnik prvotnega neuspeha je ohranjen.

## Sledljivost zahtev in rezultatov

Predikati in sprejemni pogoji so v [specification.md](specification.md). Imena A01–A07 in D01–D04 v spodnji tabeli so neposredno prepoznavna v [končnem dnevniku](check.log).

| Zahteva | Dejansko preverjen pogoj / scenarij | Koda | Izid |
| --- | --- | --- | --- |
| R01 | D01 in A01: prazne kontrole, vseh 13 opravil z nestandardnimi ID-ji v izvornem nerazvrščenem vrstnem redu; A05: eno opravilo. | `App.tsx` ProjectView, `filterTasks.ts` defaultTaskFilters | Uspešno. |
| R02 | D01, A01: naslov, ID, opis in oseba; velike črke; sestavljeni in razstavljeni č/ž; kombinacijsko znamenje U+1AB0 se ne odstrani; ß se ne prečrkuje. | `filterTasks.ts` normalizeSearch, sestavljanje besedila | Uspešno. |
| R03 | A01: 17 primerov, vse besede čez več polj, obrnjen vrstni red, prazno in beline; `[a+b]`, `.*`, `(pregled)?` dobesedno; manjka ena beseda ⇒ nič zadetkov. | `filterTasks.ts` split/every/includes | Uspešno. |
| R04 | D02, A02: hkratno iskanje in oba filtra, vsa tri stanja; točno razlikovanje Živa Kovač / Ziva Kovac / razstavljeni Ž ter Ana / ANA. | `filterTasks.ts` pogoji; `TaskFilters.tsx` selecta | Uspešno. |
| R05 | A02: vsak izvorni naziv osebe enkrat, tudi pri nič zadetkih; A04: drug projekt ima samo `all` in svojo osebo, izbor se počisti. | `TaskFilters.tsx` assignees; `App.tsx` projektni ključ | Uspešno. |
| R06 | D02, A03: enaka množica ID-jev v obeh pogledih, ohranjene tri kontrole; natančni ID-ji in izvorni vrstni red v vsakem stolpcu. | `App.tsx` visibleTasks; obstoječi `TaskBoard.tsx` | Uspešno. |
| R07 | A04: reset pri preklopu in vrnitvi z zgodovino v obeh pogledih; regresija »switching project during loading…« na namizju in mobilno. | `App.tsx` ProjectView key, obstoječi `useResource.ts` | Uspešno. |
| R08 | A04: osvežitev ponastavi vse tri vrednosti v preglednici in tabli; filtriranje ne spremeni URL-ja, localStorage ali sessionStorage. | `App.tsx` lokalni useState | Uspešno. |
| R09 | D04, A01, A03, A05: točno besedilo N od M in dostopno ime statusa; pregled stanj in stolpci štejejo samo vidna opravila, tudi nič. | `TaskFilters.tsx` filter-results; `App.tsx` counts; `TaskBoard.tsx` | Uspešno. |
| R10 | D03, A05: sporočilo brez zadetkov v obeh pogledih, čiščenje in preklop delujeta; oba projekta prazna ⇒ običajno prazno stanje, tri prazni stolpci in 0 od 0. | `App.tsx` filter-empty/prazno stanje; `TaskBoard.tsx` | Uspešno. |
| R11 | D03, A02: en klik počisti vse kontrole in vrne izvorne ID-je; A06: polja vrstic, popolni opis izbranega opravila in strežniško stanje ostanejo nespremenjeni. | `TaskFilters.tsx` reset; `filterTasks.ts` nemutirajoči filter | Uspešno. |
| R12 | Vseh 38 izhodiščnih preverjanj, D04, A06, A07: navigacija, ID podrobnosti enakih naslovov, tipkovnica in vrnitev fokusa, brez API-zapisov; 390 px tudi z dolgim imenom/naslovom; vizualni ogled Folio. | `TaskFilters.tsx`, `App.tsx`, `styles.css`; obstoječa navigacija/TaskDetails | Uspešno v navedenem obsegu. |

## Vizualni pregled

Posnetki izvirajo iz lokalne aplikacije z izhodiščnimi podatki. Osebno pregledani so namizna in mobilna preglednica, namizna in mobilna filtrirana tabla ter mobilna tabla brez zadetkov. Ohranjeni so logotip, bočni oziroma zgornji meni, barve, kartice, slovenske oznake ter viden fokus. Kontrole ne segajo izven zaslona; tabela in tabla se pomikata znotraj svojega vsebnika.

- [Preglednica, 1440 px](folio-1440-table.png)
- [Preglednica, 390 px](folio-390-table.png)
- [Filtrirana tabla, 1440 px](folio-1440-board.png)
- [Filtrirana tabla, 390 px](folio-390-board.png)
- [Brez zadetkov, 390 px](folio-390-empty.png)
- [Dodatni zajem brez zadetkov, 1440 px](folio-1440-empty.png)

## Omejitve in nepreverjeni deli

- Skriti končni testi niso dostopni in niso navedeni kot uspešni.
- Preverjeno v nameščenem Chromiumu; skupni mobilni testi uporabljajo emulacijo iPhone 13 na Chromiumu. Dejanske naprave, Safari, Firefox in uporabniški bralnik zaslona niso bili preverjeni. Dostopna imena, semantika kontrol, tipkovnica in fokus so preverjeni v Playwrightu.
- Ni meritev zmogljivosti pri zelo velikih seznamih; podatkovni primeri pokrivajo 0, 1, 3, 8 in 13 opravil. Filtriranje nima omejitve števila in ne dodaja straničenja.
- Dodatne sočasne spremembe brez osvežitve in navigacijske tekme izven obstoječih regresij niso del obsega naloge.
- Okolje ni blokiralo nobenega potrebnega koraka. Uporabljen je `chromium.connect(wsEndpoint)` iz `task/browser.json`, brez `chromium.launch()`, interneta, drugih projektov ali agentov. Dnevniki vsebujejo nenevarna opozorila okolja npm `http-proxy` in `NO_COLOR`/`FORCE_COLOR`; zaključni status je 0.
- Izvorne spremembe so omejene na `src/`, lastne teste v `tests/agent/` in dokumente/dokaze v `docs/agent/`. Zahtevani build in testi so ustvarili svoje običajne generirane izhode (`dist/`, `test-results/`, `playwright-report/`); infrastruktura ni bila urejana.
