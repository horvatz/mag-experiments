# Preverjanje P02 — postopek A

Datum: 2026-09-21 (Europe/Ljubljana). Delo je izvedel en agent. Specifikacija
je bila zapisana pred implementacijo; njen popravek je zabeležen v
[zgodovini specifikacije](specification.md). Spremenjene so samo datoteke v
`src/`, `tests/agent/` in `docs/agent/`. Orodja so ustvarila običajne izhodne
artefakte gradnje in testov v za to dovoljenih mapah.

## Rezultat in izvedba

Implementirane so zahteve R01–R12. Izbor uporablja ID-je in je skupen
preglednici ter tabli. `useBulkTaskUpdate` zajame cilj/naslove/ID-je, pošlje
posamezne javne PATCH zahteve, potrjene statuse objavi sproti in ohrani
kumulativno množico uspešnih ID-jev. Ponovi samo preostale napake. Sinhrona
varovalka prepreči dvojno proženje pred ponovnim izrisom onemogočenih kontrol.

`useResource.updateData` in `ProjectView` posodobita samo status ustreznega
ID-ja; oba pogleda in števci zato kažejo iste potrjene podatke. Podrobnosti
ob odprtju še naprej berejo javni API. Ključ komponente projekta ponastavi
začasno stanje ob navigaciji. API, strežnik, skupni tipi in skupni testi so
ostali nespremenjeni (v `src/api.ts` je popravljen le opisni komentar).

## Dejanski zagoni

| Ukaz / pregled | Dejanski rezultat | Dokaz |
| --- | --- | --- |
| Prvi `npm run check` po implementaciji | Lint, TypeScript in produkcijska gradnja uspešni; vseh 46 takrat dostopnih testov uspešnih (16,9 s). | [check-initial.log](check-initial.log) |
| `npm run check` z A01–A05 | 54 uspešnih, 2 neuspešna testa A03 zaradi napačno pričakovanega besedila napake. Aplikacija je prikazala pravi razlog `Shranjevanje ni uspelo. Poskusi znova.`; popravljeno testno pričakovanje. | [check-with-agent.log](check-with-agent.log) |
| `npm run check` s popravljenim pričakovanjem in A06 | Lint, tipi, gradnja uspešni; 58/58 testov uspešnih (27,2 s). | [check-before-visual-fix.log](check-before-visual-fix.log) |
| Zadnji celotni `npm run check`, po popravku prednosti sloga glavnega gumba | Lint, tipi, gradnja uspešni; **58/58** testov uspešnih (27,7 s): 38 izhodiščnih, 8 razvojnih P02 in 12 lastnih. | [check-final.log](check-final.log) |
| `npx playwright test --project=agent`, po dodanem zajemu končnih posnetkov v A01/A03 | 12/12 lastnih testov uspešnih; uporablja sveži strežnik na 5174/3102. | [check-screenshots.log](check-screenshots.log) |
| `npm run lint` in `npm run typecheck` po dopolnitvi zajema posnetkov | Oba ukaza uspešna. | [check-static-final.log](check-static-final.log) |
| `WEB_PORT=5193 API_PORT=3123 npm run dev` in `node tests/agent/visual-review.mjs` | Lokalni pregled obeh pogledov v delnem neuspehu pri 320, 390, 760, 1440 px: vseh 8 meritev brez širjenja strani; brez dogodkov `pageerror`. | [visual-review.log](visual-review.log), [skript](../../tests/agent/visual-review.mjs) |

Testi uporabljajo že nameščeni ločeni Chromium. Lastni skript bere
`task/browser.json` in uporablja `chromium.connect(wsEndpoint)`.
Noben pregled ni potreboval javnega interneta, novih odvisnosti ali drugega agenta.

## Sledljivost zahtev

Vsi spodaj navedeni avtomatizirani scenariji so uspešni v zadnjem celotnem
zagonu. A01–A06 so v [lastnih testih](../../tests/agent/P02.spec.ts), vsak pri
1440 × 960 in 320 × 740 pik. D01–D04 so v nespremenjenih razvojnih testih,
vsak v namiznem in mobilnem projektu. Imena v dnevnikih so določljivi dokazi.

| Zahteva | Preverjeni pogoj | Test / scenarij | Koda | Izid in dokaz |
| --- | --- | --- | --- | --- |
| R01 | Začetni prazen izbor, enaka naslova se izbirata neodvisno, checkbox ne odpre podrobnosti, klik/Space v obeh pogledih. | A01 | [TaskSelection](../../src/BulkTaskControls.tsx), [ProjectView](../../src/App.tsx), [TaskBoard](../../src/TaskBoard.tsx) | Uspešno; A01 v check-final.log. |
| R02 | Izberi vse/nič, pravo `indeterminate`, števec; prazen projekt je neoznačen in zaklenjen. | A01, A02, A06 | BulkTaskControls; `toggleAll` v [hooku](../../src/useBulkTaskUpdate.ts) | Uspešno; tudi prazen projekt v obeh pogledih. |
| R03 | Preklop ohrani izbor, cilj, uspehe/napake; projekt in reload ponastavita začasno stanje ter ohranita shranjene podatke. | A01, A03, A04 | ProjectView s ključem projekta; hook; obstoječa navigacija | Uspešno; preverjeni začetni izbor, delni neuspeh in končni uspeh. |
| R04 | Začetni cilj prazen; uporaba zahteva oba vhoda; urejanje izbora/cilja ne pošilja zahtev in ne spremeni prikazov. | D01, A01, A02 | BulkTaskControls; `changeTarget`, `apply` | Uspešno; nič zahtev in enak celoten strežniški posnetek pred/po izboru. |
| R05 | Natanko ena zahteva na izbrani ID na poskus; telo ima samo izvirni naslov in cilj; tudi že doseženo stanje. | D02, A03, A05, A06 | `apply` / `run` in [updateTask](../../src/api.ts) | Uspešno; preverjena telesa in množice vseh poslanih ID-jev, tudi web-03 že v done. |
| R06 | Uspeh je viden pred koncem drugih zahtev; oba pogleda, števci, podrobnosti, reload in navigacija vidijo potrjene statuse. | A03, A05, A06 | `run` → `onSaved`; [updateData](../../src/useResource.ts); ProjectView; obstoječi TaskDetails | Uspešno; zadržane zahteve ne povzročijo optimističnih sprememb. |
| R07 | Delne in popolne zavrnitve; drugi ID-ji se obdelajo; alert vsebuje ID, naslov in pravi razlog; zavrnitve ne zapisujejo. | D03, A03–A06 | `run` / posamezni catch; BulkTaskControls | Uspešno; tudi zgodnja zavrnitev in pozni uspeh ter obratni vrstni red. |
| R08 | Izbor po koncu vsebuje samo neuspele; isti cilj in ponovne zahteve samo za preostale napake. | D03, A03, A04 | `operation.remaining`, `retry` | Uspešno; A03 zaporedje povzetkov 1/2 → 2/1 → 3/0 in natanko 6 zahtev. |
| R09 | Kumulativni uspehi brez podvajanja; konec odstrani napake, izbor, cilj, ponavljanje. | A03–A06 | množica `successful`, finalizacija v `run` | Uspešno; že uspešni ID-ji niso poslani ponovno. |
| R10 | Vse operacijske kontrole med zahtevami zaklenjene, napredek viden; hitri kliki/Enter in ponavljanje ne podvojijo zahtev; po napaki le ponovi/počisti. | D04, A03, A05, A06 | `busy`, `locked`, disabled kontrolniki | Uspešno; A05 proži več dogodkov v isti brskalniški nalogi ter Enter, tudi večkratni klik ponovitve. |
| R11 | Čiščenje izbriše vse začasno stanje brez zapisov in brez razveljavitve; nova operacija ima lasten števec. | D01, A04 | `clear`, nova množica v `apply` | Uspešno; 1/1 → čiščenje → nova operacija 1/0, strežniški podatki ohranjeni. |
| R12 | Razen dovoljenih statusov ostanejo vsa polja vseh opravil enaka; drugi projekt nespremenjen; bralni vmesnik deluje. | D02/D03, A03–A06, 38 izhodiščnih preverjanj | `run`, ProjectView; obstoječe bralne komponente | Uspešno; globoka primerjava celotnih seznamov in spremenjeni/enaki naslovi v obeh projektih. |

## Predikati in dokazni scenariji

Uporabljeni simboli so opredeljeni v [specifikaciji](specification.md).
Testni `onlyStatuses` primerja celotno polje vseh opravil s pričakovanim
`D0.map(t => U.has(t.id) ? {...t, status: c} : t)`. Zato za vsako polje poleg
statusa preverja enakost, za neizbrane in za druge projekte pa enakost celotnega
opravila. Ni omejen samo na prikazane statuse ali naslove.

A03 začne z `I = {web-01, web-02, web-03}` in `c = done`. Po prvem poskusu
sta `U = {web-03}`, `F = {web-01, web-02}`; po drugem
`U = {web-03, web-01}`, `F = {web-02}`; po tretjem `U = I`, `F = ∅`.
Zahteve so po ID-jih porazdeljene 2, 3 in 1, uspehi pa šteti 1, 2 in 3.
To preveri unijo uspehov in dejstvo, da ponovitev zajame samo prejšnji `F`.

A05 zadrži zavrnitev web-01 in najprej potrdi web-02. Pred zaključkom vseh
zahtev sta oba pogleda in števec že usklajena s potrjenim `D[web-02]`,
`D[web-01] = D0[web-01]`. A06 preveri drugi projekt, drugačna naslova z
Unicode znaki, cilj todo ter pozni uspeh po zgodnji zavrnitvi. A04 preveri
`clear(D) = D` in neodvisnost nove množice `U` po čiščenju.

## Vizualni pregled

Posnetki končne kode se zajamejo v svežem avtomatiziranem brskalniškem
kontekstu med A01/A03. Ročno pregledani so postavitev, čitljivost, ločitev
checkboxa od povezave, sporočila napak in notranje drsenje:

- [Preglednica, 1440 px](table-desktop.png)
- [Tabla, 1440 px](board-desktop.png)
- [Preglednica z napakami, 320 px](table-mobile-error.png)
- [Tabla z napakami, 320 px](board-mobile-error.png)

## Neuspešni koraki in omejitve

- Prvi vizualni skript je dvakrat obstal pri preveč specifičnem
  `getByLabel('Novo stanje', {exact: true})` v ročni seji. Uporabljen je bil
  dogovorjeni dostopni selektor `getByRole('combobox', {name: 'Novo stanje',
  exact: true})`; naslednji zagoni so uspeli. Prvi dnevnik je ohranjen v
  [visual-review-initial.log](visual-review-initial.log). Končna koda ima
  eksplicitno povezavo oznake in izbirnika prek `htmlFor`/`id`.
- Poskus ustavitve ročnega razvojnega strežnika (SIGTERM PID 65668) je okolje
  zavrnilo z `operation not permitted`; ponoven zagon na istih vratih je vrnil
  `EADDRINUSE` za 3123. Nadaljevan je bil pregled prek že zagnane lokalne
  storitve, končni posnetki pa so zajeti prek dovoljenega testnega zagona s
  svežim strežnikom. Infrastruktura ni bila spremenjena.
- npm opozarja na okoljsko nastavitev `http-proxy`, Node pa na kombinacijo
  `NO_COLOR`/`FORCE_COLOR`; preverjanja so kljub opozorilom uspešna.
- Preverjen je Chromium, ne drugi brskalniki ali dejanski bralnik zaslona.
  Dostopna imena, vloge, lastnost indeterminate, osnovna tipkovnica in
  onemogočene kontrole so avtomatizirano preverjeni.
- Po navodilih niso preverjani navigacija/osvežitev med shranjevanjem,
  sočasno urejanje drugih uporabnikov in negotov izid izgubljene povezave.
  Skriti ocenjevalni testi niso dostopni. Uspeh testov je dokaz navedenih
  scenarijev, ne izčrpen dokaz vseh možnih vhodov.
- **Ni znanih neizpolnjenih zahtev R01–R12.**
