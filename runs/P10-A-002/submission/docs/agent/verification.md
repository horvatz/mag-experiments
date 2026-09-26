# P10 — izvedba in preverjanje

Postopek A, en agent, 2026-09-26. Specifikacija je bila zapisana pred
spremembami kode. Izvedba in preverjanje sta zaključena znotraj 20 minut
od začetka ob približno 09:38 UTC. Drugih agentov, oddaljenih repozitorijev,
konektorjev, dodatnih odvisnosti ali javnega interneta ni bilo uporabljenih.

## Rezultat izvedbe

- [taskOrder.ts](../../src/taskOrder.ts): lokalne permutacije ID-jev,
  preverjanje robov, razveljavitve, ponovitve, omejitev 20 in razveljavljiv reset.
- [ProjectTasks.tsx](../../src/ProjectTasks.tsx): skupno stanje za oba pogleda,
  preslikava ID-jev v izvorna opravila in globalna mesta. Stanje nastane šele
  po nalaganju opravil. [App.tsx](../../src/App.tsx) veže življenjsko dobo na projekt.
- [TaskOrderControls.tsx](../../src/TaskOrderControls.tsx): dostopni gumbi,
  mesta in usklajen status zgodovine; robni gumbi so onemogočeni.
- [TaskBoard.tsx](../../src/TaskBoard.tsx): stalni stolpci, relativni vrstni
  red globalne permutacije in premiki zunaj povezav. Dostopno ime povezave
  podpira tudi presledke in ločila v ID-ju.
- [styles.css](../../src/styles.css): nove kontrole uporabljajo Folio barve,
  robove, ikone in prilagodljivo prelamljanje orodne vrstice.

Ročne spremembe so samo v `src/`, `tests/agent/` in `docs/agent/`.
Standardni ukazi preverjanja ustvarijo običajne izhodne artefakte v `dist/`,
`test-results/` in `playwright-report/`; infrastruktura in skupni testi niso spremenjeni.

## Dejanski zagoni in dokazi

| Preverjanje | Rezultat | Dokaz |
| --- | --- | --- |
| `npm run lint && npm run typecheck` po vključitvi novega seznama | Uspešno, izhod 0 | Rezultat orodja; ponovno vključeno v celoten check. |
| `npx playwright test --project=development-desktop --project=development-mobile` | **8/8 uspešnih**, 4,1 s | [development.log](development.log). |
| `npm run check` na končni programski kodi in dodatnih testih | **Uspešno, izhod 0**: ESLint, TypeScript, produkcijska gradnja, **55/55 testov**, testi 29,0 s | [check.log](check.log). |
| Pregled prek lokalnega strežnika `WEB_PORT=5193 API_PORT=3123 npm run dev` | Uspešno; Chromium povezan prek `chromium.connect(wsEndpoint)` iz `task/browser.json` | [visual.log](visual.log) in spodnji posnetki. |
| Pregled kode in iskanje `__test`, `localStorage`, `sessionStorage`, `updateTask`, `fetch` v `src/` | Nova funkcionalnost ne uporablja testnih kontrol, trajne shrambe ali zapisovanja | `rg -n` in pregled navedenih datotek; stara funkcija `updateTask` v api.ts ostaja neuporabljena. |

55 testov sestavlja 38 izhodiščnih (14 API, 12 namiznih in 12 mobilnih),
8 razvojnih P10 (D01–D04 na obeh širinah) ter 9 dodatnih A01–A09 iz
[order.spec.ts](../../tests/agent/order.spec.ts). Noben test ni preskočen.
Po tem zagonu so bile dopolnjene samo dokumentacijske datoteke.

Pri dodatnem ogledu so bile izvedene naslednje operacije: nalaganje
izhodiščnega projekta, fokus gumba `Premakni web-01 dol`, Enter, preverjanje
mesta 2 in ohranitve fokusa; preklop na tablo; sprememba širine na 390 px;
preklop obeh pogledov in meritev širine dokumenta. V obeh pogledih sta
širina dokumenta in zaslona **390 px**, notranji vsebnik pa **350 px**.
Ni bilo napak `pageerror` ali zapisovalnih zahtev na API.

Vizualno pregledani posnetki:

- [Preglednica, 1440 px](desktop-table.png): viden fokus, mesta, puščice in zgodovina.
- [Tabla, 1440 px](desktop-board.png): stalni stolpci in ločene kontrole pod povezavami.
- [Preglednica, 390 px](mobile-table.png): notranje vodoravno drsenje, prelomljena orodna vrstica.
- [Tabla, 390 px](mobile-board.png): notranje drsenje table, navigacija in kontrole znotraj strani.

## Sledljivost zahtev

Vse navedene avtomatizirane rezultate je mogoče po ID-ju testa najti v
[check.log](check.log). Pravila in predikati so v [specification.md](specification.md).

| Zahteva | Preverjeni pogoj | Koda | Dejanski scenarij in rezultat |
| --- | --- | --- | --- |
| R01 | Izvorno polje in mesta 1..N po ID-ju | `createTaskOrder`; `ProjectTasks` preslikava `positions` | A01: 13 neurejenih ID-jev, Unicode, presledek, poševnica in narekovaj; isti naslovi. Vrstni red in vsa mesta pravilni. |
| R02 | Sosednja globalna zamenjava; nespremenjena polja | `taskOrderReducer/move`; `byId` | A01/A03/A06: gor/dol, različna stanja, pravilna oseba, datum, opis in stanje v podrobnostih. Uspešno. |
| R03 | Robovi in neveljavna dejanja brez zgodovine | `move` pred kopiranjem; `TaskMoveControls/disabled` | D01, A02/A03/A08: oba robova, neznan ID, ponovljen robni premik; ohranjena referenca celotnega stanja oziroma UI števci. Uspešno. |
| R04 | Undo obnovi celo zadnjo permutacijo in shrani trenutno v redo | `commit`, veja `undo` | D02, A03/A05: tri različne zamenjave, natančen red po vsakem undo in števci. Uspešno. |
| R05 | Redo zaporedno obnovi razveljavljene permutacije brez izgube ID-jev | veja `redo` | D02, A03/A04: natančne permutacije po ponovitvah; A09: invarianta pri 500 mešanih dejanjih. Uspešno. |
| R06 | Novo veljavno dejanje počisti redo; neveljavno ga ohrani | `move` preverjanje meja; `commit` | D03, A02/A03: razvejitev po dveh undo; oba onemogočena robna gumba ob treh redo; redo še deluje. Uspešno. |
| R07 | Hrani se zadnjih 20 prejšnjih permutacij | `commit/redo` omejita sklad z `slice(-20)` | A04: 22 opravil, prvo premaknjeno 21 mest dol; 20 undo obstane po prvem premiku, 20 redo obnovi konec. A09 preverja mejo pri vsakem koraku. Uspešno. |
| R08 | Reset je eno novo dejanje, počisti redo; izvorni red je brez učinka | `reset`, `isInitialOrder` | D04, A05: reset ob nepraznem redo, undo/redo reseta; izvorni red z dvema redo ostane brez spremembe. A02 preveri tudi neposredni no-op. Uspešno. |
| R09 | Tabla filtrira globalni red po nespremenljivih stanjih | `orderedTasks`; `TaskBoard/entries`, `positions` | D04, A06: premik čez drugo stanje spremeni mesti, nato premik znotraj istega stanja spremeni red kartic. Stalni vrstni red stolpcev in preglednica pravilna. Uspešno pri 390 px. |
| R10 | Pogledi/podrobnosti ohranijo stanje; projekt/osvežitev ga ponastavita | `ProjectTasks/useReducer`; `App/ProjectView key` | A07: undo=1 in redo=1 preživita oba pogleda, podrobnosti in oba načina zapiranja; menjava projektov in vrnitev ponastavita; osvežitev odprtih podrobnosti na tabli vrne začetni red. Regresijska navigacija prav tako uspešna. |
| R11 | Točen status, stanje gumbov ter uporabnost 0/1 opravil | `OrderHistoryControls`; `TaskMoveControls`; prazni prikazi | A03–A08 preverjajo status in gumbe; A08 preveri oba prazna projekta, tri prazne stolpce ter eno opravilo v obeh pogledih s podrobnostmi. Uspešno. |
| R12 | Ista množica ID-jev in polja, brez zapisovanja; števci in Folio | reduktor hrani le ID-je; izvorni objekti v `byId`; slogi | A09: 500 prehodov, invarianta vseh shranjenih permutacij in nespremenjenost vseh predhodnih posnetkov. A01/A06/A07/A08 in D04: brez API zapisov, pravilni podatki/stanja. A06: strežniško stanje ostane enako. Vizualni pregled in mobilni testi uspešni. |

## Neuspešni vmesni koraki in omejitve

- Začasni poskus urejanja `App.tsx` s `python3` ni deloval: okolje je
  izpisalo `xcrun: error: invalid active developer path ... missing xcrun`.
  Datoteka ni bila spremenjena; posledični vmesni TypeScript pregled je
  pravilno javil manjkajoča nova parametra starega klica `TaskBoard`.
  Urejanje je bilo izvedeno z razpoložljivim Node.js, nato sta lint in
  TypeScript ter poznejši celoten `npm run check` uspela.
- Opozorili npm o okoljski nastavitvi `http-proxy` in Node o `NO_COLOR`
  nista preprečili preverjanj. Okoljskih nastavitev nismo spreminjali.
- Skriti končni testi niso dostopni in niso navedeni kot opravljeni.
  Preizkušen je Chromium, ne drugi brskalniki ali dejanski bralnik zaslona.
  Dostopna imena, onemogočenost gumbov in fokus so preverjeni programsko;
  videz je pregledan na shranjenih posnetkih.
- A09 je deterministično preverjanje 500 prehodov, ne formalni dokaz vseh
  možnih zaporedij. Predpostavljamo veljavne enkratne ID-je in polja iz domene.
  Zunanje sočasne spremembe brez osvežitve ostajajo zunaj dogovorjenega obsega.
- **Znanih neizpolnjenih zahtev R01–R12 ni.**
