# P05 – izvedena preverjanja

Naloga je izvedena po postopku A z enim agentom. Specifikacija je bila zapisana
pred spremembami kode. Zahteve, predikati, povezave na kodo in zgodovina popravkov
so v [specification.md](specification.md).

## Končni rezultat

`npm run check` je po zadnjem popravku uspešno zaključil ESLint, TypeScript,
produkcijsko gradnjo Vite in **56 testov** brez ponovitev ali preskočenih primerov:

- 14 API-testov izhodišča;
- 24 preverjanj izhodiščnega vmesnika (12 namiznih + 12 mobilnih);
- 8 razvojnih preverjanj P05 (4 namizna + 4 mobilna);
- 10 lastnih preverjanj (A01–A08, A02 ima tri velikosti).

Celoten izpis zadnjega zagona: [check.log](check.log), zaključek
`56 passed (24.1s)`, izhodna koda 0. Skupaj je tako opravljenih vseh 38
izhodiščnih in vseh 8 razvojnih preverjanj ter dodatni testi.

## Dejanski zagoni in ugotovitve

| Korak | Ukaz oziroma dejanje | Dejanski izid |
| --- | --- | --- |
| 1 | `npm run check` po osnovni implementaciji, pred lastnimi testi | ESLint, TypeScript, gradnja in 46/46 skupnih testov uspešni (17,0 s za teste); izpis v seji. |
| 2 | `npm run check > docs/agent/check.log 2>&1` po dodatku A01–A08 | 56/56 uspešnih (24,3 s); začetna različica A08 je imela ID z Unicode in ločili brez presledka. Dnevnik je pozneje nadomestil končni zagon. |
| 3 | `npx playwright test --project=agent -g 'A08'` po razširitvi ID-ja s presledkom | 1 neuspešen test: dostopno ime kartice ni več vsebovalo samo naslova in ID-ja. Dokaz: [id-accessibility-before.log](id-accessibility-before.log). |
| 4 | Popravek `TaskBoard`: neposredni `aria-label` z naslovom in ID-jem, odstranitev odvisnosti imena od DOM-identifikatorjev | Izvorni `data-task-id`, ključi in URL-kodirane povezave ostanejo nespremenjeni. |
| 5 | Ponovni `npm run check > docs/agent/check.log 2>&1` po popravku | ESLint, TypeScript, gradnja in 56/56 testov uspešni; vključena razširjena A08 s presledkom v ID-ju. |
| 6 | Pregled izvorne kode | Filter pred `slice`; oba pogleda dobita `visibleTasks`; projektni povzetek uporablja celotne `tasks`; stanje je samo v `useState`, življenjska doba je vezana na `key={project.id}`. Nova funkcionalnost ne uporablja shrambe, URL-parametrov ali API-zapisov. |

Testi uporabljajo svoj predpisani strežnik 5174/3102 in povezavo na nameščeni
Chromium. Nobena infrastruktura, skupni test, skupni tip ali odvisnost ni spremenjena.
Opozorili okolja o `http-proxy` in `NO_COLOR` nista povzročili napak. Noben
potreben korak ni bil blokiran zaradi okolja; `chromium.launch()` ni bil uporabljen.

## Povezava testov z zahtevami

Lastni testi so v [tests/agent/P05.spec.ts](../../tests/agent/P05.spec.ts).
Uporabljajo 13 izrecno neurejenih enkratnih ID-jev, enake naslove, vsa tri stanja,
Unicode, presledek in rezervirane URL-znake v ID-ju, navadno besedilo z znaki
`<span>` ter veljavni prestopni datum `2028-02-29`. Primeri so deterministični.
Pomočnik razvojnih testov se uvozi samo iz testov; vmesnik bere javni `/api/`.

| Test | Preverjeno vedenje | Zahteve | Končni izid |
| --- | --- | --- | --- |
| A01 | Začetni all/all, natančen izvorni vrstni red, možnosti select, status, števci in brez zapisov | R01, R09, R11, R12 | Uspešno |
| A02 × 3 | Velikosti 2, 5, 10; vse strani s kratkim zadnjim odsekom; brez izgubljenih/podvojenih ID-jev; vsi štirje premiki in poskus DOM-klika na onemogočene gumbe | R02, R03, R09, R12 | 3 uspešni |
| A03 | Ponastavitev tudi pri še veljavni prejšnji strani; prehodi 2→5, 5→2, 10→all | R04, R09 | Uspešno |
| A04 | Vsako stanje, filter pred razrezom in ponastavitev; all pokaže celoten filtrirani niz; povzetek in skupno število ostajata 13 | R02, R05, R09, R11, R12 | Uspešno |
| A05 | Mešana druga stran 5 opravil v tabli; pravilni ID-ji in števci po stolpcih; stran 2 filtra todo preživi oba pogleda, Enter/Escape, gumb za zaprtje in zgodovino nazaj; povrnjen fokus | R06, R07, R09, R11, R12 | Uspešno |
| A06 | Oba prazna projekta, prazni stolpci, nič zadetkov filtra, eno opravilo, odstranitev filtra, status 0/0 in vsi onemogočeni premiki | R03, R10 | Uspešno |
| A07 | Menjava in vrnitev projekta ter osvežitev table; ponastavitev vseh vrednosti, nespremenjena lokalna/sejna shramba in URL brez straničenja | R08 | Uspešno |
| A08 | Širina 390 px v obeh pogledih; vsi gumbi znotraj širine; ID `č /2?x=#%`, pravilno kodirana povezava in dostopno ime; pravilne podrobnosti, datum in besedilo; premikanje brez API-zapisov | R06, R07, R12 | Uspešno po popravku |
| D01–D04 × 2 | Začetni odseki, zadnja stran/status, filter pred tablo, ponastavitev velikosti in brez zapisov | R02, R04–R06, R09, R12 | 8 uspešnih |
| Izhodišče | API, povezave po ID, podrobnosti, fokus, zgodovina, nalaganje, napake in ponovitev, menjava med nalaganjem, prazni projekti in oba pogleda na namizni/mobilni širini | R12 in regresije | 38 uspešnih |

Nadzor API-zapisov prestreže metode na `/api/` in preveri nič zapisov v testnem
stanju. Pregled kode potrdi, da `filter` in `slice` ne spreminjata vhodnega polja.
`/__test/` se uporablja samo v testnem programu.

## Vizualni pregled

Zagnan je bil `WEB_PORT=5193 API_PORT=3123 npm run dev`. Lokalna skripta je
prebrala `wsEndpoint` iz `task/browser.json`, uporabila `chromium.connect`,
odprla nov kontekst in stran `http://127.0.0.1:5193/`, izbrala velikost 2 ter
zajela spodnje posnetke. Vsi trije posnetki so bili tudi vizualno pregledani.

- [Namizna preglednica, 1440 × 960](desktop-table.png): ohranjeni meni,
  tipografija in barve Folio; kontrole, status in vrstice so jasno ločeni.
- [Mobilna preglednica, širina 390](mobile-table.png): izbiri sta v dveh
  stolpcih, navigacijski gumbi v mreži 2 × 2; preglednica se pomika znotraj okvirja.
- [Mobilna tabla, širina 390](mobile-board.png): skupne kontrole ostanejo nad
  tablo, stolpci se pomikajo znotraj table; njihov števec ustreza trenutni strani.

Skripta ni zaznala nobene napake `pageerror`. Izmerjeno po preklopu na tablo:
`document.documentElement.scrollWidth = 390`, `innerWidth = 390`.
Posnetki so nastali pred popravkom dostopnega imena kartice; ta ne spreminja
vidnega prikaza. Končni popravek je preverjen z A08 in celotnim ponovnim zagonom.

## Omejitve in neizpolnjene zahteve

Ni znanih neizpolnjenih zahtev R01–R12. Testi pokrivajo navedene konkretne
primere, ne vseh možnih podatkovnih polj. Splošna pravila so dodatno preverjena
s pregledom izračuna in prehodov stanja v kodi.

- Nedostopni končni oziroma skriti testi niso bili izvedeni in niso navedeni kot uspešni.
- Preverjanje brskalnika je omejeno na nameščeni Chromium; drugi brskalniki in
  dejanska uporaba bralnika zaslona niso bili preizkušeni. Dostopna imena, vloge,
  onemogočeni gumbi, tipkovnica in fokus so preverjeni v brskalniških testih.
- Sočasne spremembe podatkov brez osvežitve niso del naloge. Obstoječe zahteve
  za navigacijo med nalaganjem so prestale skupne regresijske teste.
- Zmogljivost pri zelo velikih poljih ni bila merjena; API tako kot izhodišče
  vrne celoten projekt, obdelava pa je lokalna in linearna glede na število opravil.
