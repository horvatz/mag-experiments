# P01 — vodnik preverjanja

Predpogoji: obstoječi Node 24.11.x, nameščene odvisnosti in pripravljeni Chromium.
Ukaze izvedi v korenu aplikacije; ničesar ne nameščaj ali spreminjaj v konfiguraciji.

## Statična in skupna preverjanja

~~~sh
npm run lint
npm run build
npm test
~~~

npm test uporablja pripravljeni Playwright, sam zažene strežnik s testnimi kontrolami
in poveže brskalnik. Vključuje API, namizno/mobilno izhodišče, razvojne D01–D04 in
lastne teste. Pričakovan rezultat je brez napak; ta vodnik ni dokaz izvedenih testov.

## Dodatni scenariji

Po izdelavi tests/agent/P01.spec.ts se lahko ločeno izvede:

~~~sh
npx playwright test --project=agent
~~~

Podlage: [pogodba](contracts/api.md), [model](data-model.md), [scenariji](spec.md),
[sledljivost](development-spec.md).

1. S01/S07: isti naslovi, izbira po id; po uspehu primerjaj vsa opravila in neurejana
   polja, tudi v drugem projektu.
2. S02/S05: osnutek ne spreminja prikazov; po uspehu preveri podrobnosti, vrstico,
   stolpec kartice, števce in osvežitev.
3. S03: prazen naslov in mešani štirje beli znaki ne sprožijo shranjevanja;
   veljaven popravek umakne napako. Preveri robni W, notranje znake in U+00A0.
4. S04: šest različnih prehodov med stanji in shranjevanje istega stanja.
5. S06/S10: preklic po spremembi in napaki, ponovno odprtje, drugo opravilo brez
   starih vrednosti/napak; preklop projekta in obeh pogledov po zaključku.
6. S08/S09: testni program zadrži shranjevanje; preveri štiri disabled kontrole,
   status, nespremenjene podatke/prikaze in eno zahtevo ob hitrih pritiskih. Sprosti
   z reject, preveri vnos in napako, nato uspešno ponovi.
7. Mobilna širina, viden fokus in ohranitev Folio.

Dnevnike shrani v docs/agent/P01/. Playwright poročila ostanejo v obstoječih
playwright-report/html in test-results/run. V sledljivost zapiši dejanska imena
testov, mesta kode in izide. Neizvedene scenarije izrecno označi.
