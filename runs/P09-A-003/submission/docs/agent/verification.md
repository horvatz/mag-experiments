# P09 — izvedena preverjanja

## Rezultat in obseg

Implementirane so R01–R12. Potrjeno stanje prihaja iz fragmenta URL-ja; osnutek
kontrol je ločen. Potrditev/reset ustvarita zgodovinski vnos le ob spremembi
stanja, navigacija obnovi filtre in zavrže osnutek. Oba prikaza uporabljata isto
filtrirano zaporedje; povezave podrobnosti uporabljajo ID. Podatki ostanejo na
obstoječem API-ju, brez nove shrambe ali zapisovalnih klicev.

Delo je opravil en agent. Specifikacija je bila ustvarjena pred spremembami kode.
Spremenjene izvorne datoteke so samo v `src/`, lastni testi v `tests/agent/`,
dokumentacija in dokazi v `docs/agent/`. Skupni testi, strežnik, tipi in odvisnosti
niso bili spremenjeni. Orodja so ustvarila običajne rezultate gradnje/testov v
že dovoljenih izhodnih mapah.

## Dejanski zagoni

1. `npm run check` po prvi implementaciji: uspešni ESLint, TypeScript, Vite in
   vseh **46** dostopnih izhodiščnih/razvojnih preverjanj (17,4 s za teste).
   Dokaz: [check-initial.log](check-initial.log).
2. Po dodanih lastnih testih `npm run check`: **57 uspešnih testov** (23,4 s).
3. Po majhnem popravku CSS-specifičnosti glavnega gumba ponovno
   `npm run check`: uspešni ESLint, TypeScript in produkcijska gradnja ter
   **57/57 testov** (23,3 s): 38 izhodiščnih, 8 razvojnih P09 in 11 lastnih.
   Končni izhodni status ukaza je 0. Dokaz: [check-final.log](check-final.log).

Opozorili npm o nastavitvi `http-proxy` in Node o `NO_COLOR`/`FORCE_COLOR` nista
prekinili preverjanja. Noben test ni bil preskočen ali označen kot uspešen brez
zagona. Nedostopni končni testi niso bili izvedeni.

## Sledljivost zahtev

Polna imena testov so v [lastnih testih](../../tests/agent/P09.spec.ts) in
[končnem dnevniku](check-final.log). Vsi navedeni testi so uspešni.

| Zahteva | Dejansko preverjen pogoj | Testi / dokaz | Koda |
| --- | --- | --- | --- |
| R01 | Neposredni projektni/opravilski URL uporabi filtre, tudi pri drugem projektu. | D01, A03, A07, A08 | [readRoute](../../src/navigation.ts), [readViewState](../../src/viewState.ts) |
| R02 | Zunanji presledki, NFD in diakritika, velikost črk; naslov, opis, oseba in ID; fraza ostane skupaj; regex-ločila so dobesedna; U+1AB0 ostane. | A01; kodirana ločila v A05 | [normalizeSearch in visibleTasks](../../src/viewState.ts) |
| R03 | Vsi statusi skupaj s frazo po IN; oba vrstna reda, UTF-16 (tudi ß, 中, emoji), enaki normalizirani naslovi in vrnitev na API-vrstni red. | A02, A10 | [visibleTasks](../../src/viewState.ts) |
| R04 | Prva pojavitev zmaga, tudi prazna; neznani enum privzet; neznani parametri ne vplivajo; neposredni URL in osvežitev ga ne prepišeta. | A03 | [readRoute](../../src/navigation.ts), [readViewState](../../src/viewState.ts) |
| R05 | Urejanje vseh treh kontrol ne spremeni prikaza, URL-ja ali history.length; potrditev jih spremeni skupaj in doda natanko en vnos. | D02, A04 | [ViewControls](../../src/ViewControls.tsx), [apply](../../src/App.tsx), [navigate](../../src/navigation.ts) |
| R06 | Obrezana fraza, izpuščene privzete vrednosti, kodiranje &, +, /, ?, #, =, % in Unicode, ohranitev board; odstranjevanje neznanih in podvojenih parametrov brez nove zgodovine pri enakem stanju. | A03, A04, A05 | [viewQuery in navigate](../../src/navigation.ts), [sameViewState](../../src/viewState.ts) |
| R07 | Nazaj/Naprej obnovita vsa tri polja in ID-je ter zavržeta osnutek; osvežitev ohrani potrjeno stanje in podrobnosti. | D03, A04, A05, A08 | [subscribeNavigation in useRoute](../../src/navigation.ts), [ViewControls](../../src/ViewControls.tsx) |
| R08 | Preglednica/tabla ohranita nabor ID-jev in vrstni red znotraj stolpca; osnutek se zavrže tudi ob kliku že aktivnega pogleda. | D03, A02, A06 | [App](../../src/App.tsx), [TaskBoard](../../src/TaskBoard.tsx) |
| R09 | Enaka naslova odpreta pravilna različna ID-ja; Escape in gumb ohranita filtre/view; kodiran ID in neposredni detajl delujeta tudi ob praznem filtriranem pregledu. | A05, A06, A07; izhodiščni testi podrobnosti in vračanja fokusa | [taskUrl](../../src/navigation.ts), [TaskDetails](../../src/TaskDetails.tsx), [TaskBoard](../../src/TaskBoard.tsx) |
| R10 | Klik drugega projekta ponastavi filtre in ohrani board; neposredna povezava upošteva svoje parametre; Nazaj obnovi prejšnji projekt. | A08 | [projektne povezave](../../src/App.tsx), [readRoute](../../src/navigation.ts) |
| R11 | Reset ima enako zgodovinsko pravilo, počisti osnutek in ohrani board; prazen rezultat/projekt ima Ni zadetkov. in pravilen status N od M. | D04, A01, A04, A07, A09 | [ViewControls](../../src/ViewControls.tsx), [rezultati](../../src/App.tsx) |
| R12 | Brez zapisovalnih API-zahtev in strežniških zapisov; dostop do localStorage v A11 vrže napako, a scenarij ostane brez napak. Ohranjene napake, retry, nalaganje, neznane poti in fokus; širina 390 pik ostane 390. | D04, A11, vseh 38 regresijskih preverjanj, posnetki | [slogi](../../src/styles.css), nespremenjena [api.ts](../../src/api.ts) in [useResource](../../src/useResource.ts) |

Lastni podatkovni primeri vključujejo 0, 1, 8, 9 in 15 opravil, oba prazna
projekta, podvojene naslove, drugačne in kodirane ID-je, Unicode, ločila, dolge
naslove/osebe ter več statusov. Brskalniški testi uporabljajo obstoječo povezavo
na ločeni Chromium in testni strežnik 5174/3102. Samo testni program uporablja
javni testni pripomoček; aplikacija ne bere `/__test/`.

## Vizualno preverjanje

Ročni strežnik: `WEB_PORT=5193 API_PORT=3123 npm run dev`. Lastna skripta je
prebrala `wsEndpoint` iz `task/browser.json` in uporabila
`chromium.connect(wsEndpoint)`, brez `chromium.launch()`.

- Namizje 1440 × 960: preglednica, vse kontrole, slovenske oznake, števec 3 od 3.
- Telefon 390 × 844: tabla s potrjenim `q=pregled`, števec 2 od 3, kontrole v
  enem stolpcu, tabla se pomika znotraj prikaza.
- Vizualno pregledana posnetka: [namizje](desktop.png), [telefon](mobile.png).
  Meritve: [visual-check.json](visual-check.json); širina dokumenta je 1440
  oziroma 390 pik, enaka širini okna.

Med ogledom je že zagnani Vite še stregel predhodno različico CSS po popravku
specifičnosti. Okolje je zavrnilo `kill -TERM` z napako `operation not permitted`,
zato prvi poskus ponovnega zagona ni uspel (`EADDRINUSE`). Ustavitev prek odprte
orodne seje s Ctrl+C je uspela. Nato je bil ročni strežnik ponovno zagnan in
posnetki obnovljeni; infrastruktura ni bila spremenjena. Končni avtomatski
zagon je že uporabljal sveže zagnan strežnik.

## Omejitve in neizpolnjene zahteve

Znane neizpolnjene zahteve: **nobena**. Preverjen je razpoložljivi Chromium;
drugih brskalnikov, podpornih tehnologij in nedostopnih končnih testov nismo
preverjali. Testni primeri niso izčrpen dokaz za vse mogoče nize ali števila
opravil. Sočasnih sprememb podatkov brez osvežitve in dodatnih tekmovanj med
nalaganjem ne širimo prek zahtevanih izhodiščnih regresij.
