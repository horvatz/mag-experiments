# P01 — zapis izvedenega preverjanja

## Rezultat

Implementirano je urejanje naslova in stanja v obstoječih podrobnostih opravila.
Obrazec loči začasni vnos od potrjenih podatkov, preverja naslov, omogoča preklic,
zaklene oddajo med čakanjem in ohrani vnos ob zavrnitvi. Potrjeni odgovor API-ja
posodobi opravilo po ID ter vse pripadajoče prikaze in števce.

Končni `npm run check`: **uspešno, 60/60 testov**, brez preskočenih testov ali
ponovitev zaradi neuspeha. To je 38 preverjanj izhodišča, 8 razvojnih preverjanj
P01 in 14 lastnih preverjanj. Nobena zahteva R01–R10 ni ostala ugotovljeno
neizpolnjena. Uspeh testov velja za spodaj navedene scenarije in okolje.

Specifikacija je nastala pred implementacijo; njeni popravki so zapisani v
[zgodovini specifikacije](specification.md#zgodovina-sprememb).
Izvedba je potekala samostojno, z enim agentom, od 22:28:59 UTC 15. 9. 2026,
in se je zaključila v manj kot 20 minutah.

## Dejanski zagoni

| Preverjanje / ukaz | Dejanski rezultat | Dokaz |
| --- | --- | --- |
| `npm run lint && npm run build && npx playwright test --project=development-desktop --project=development-mobile` | ESLint, TypeScript in Vite uspešni; 8/8 razvojnih testov, 4,4 s testnega zagona. | Prvi terminalski zagon; iste teste dodatno vsebuje končni dnevnik. |
| Prvi `npm run check` | Lint, gradnja in 59/59 testov uspešni; testi 28,9 s. Tedaj 13 lastnih testov. | [check-initial.log](check-initial.log) |
| `WEB_PORT=5193 API_PORT=3123 npm run dev` in `node tests/agent/inspect-ui.mjs` | Lokalni ogled in preverjanje tipkovnice pri 1440×960, 390×844, 320×720; brez vodoravnega preliva in brez dogodkov `pageerror`. | [Skripta](../../tests/agent/inspect-ui.mjs), [visual-check.log](visual-check.log), spodnji posnetki |
| Končni `npm run check` po izboljšavi sporočila povezave, uporabi Map in dodatku A07 | ESLint brez napak, `tsc --noEmit` uspešen, Vite gradnja uspešna; **60/60 testov**, 29,5 s. Izhodna koda 0. | [check.log](check.log), [poročilo Playwright](../../playwright-report/html/index.html) |
| Končni pregled lokalnih povezav in spremenjenih komponent z Node | Vseh 36 povezav obeh dokumentov kaže na obstoječe datoteke; v treh spremenjenih komponentah ni `/__test/` ali `localStorage`. | Terminalski izpis: 19 povezav v specifikaciji, 17 v zapisu preverjanj, brez napak. |

Dnevniki `check*.log` so nastali z `set -o pipefail && npm run check 2>&1 | tee …`,
zato napaka preverjanja ne bi bila skrita z uspehom ukaza `tee`.
Testni strežnik je uporabil vrata 5174/3102, ogled 5193/3123.
Vsi brskalniški zagoni so uporabili nameščeni Chromium prek povezave
`chromium.connect(wsEndpoint)` iz `task/browser.json` oziroma iste obstoječe
nastavitve Playwright. `chromium.launch()` ni bil uporabljen.

## Sledljivost zahtev in dokazov

Testi A01–A07 so v [tests/agent/P01.spec.ts](../../tests/agent/P01.spec.ts).
A01 ima dva pogleda pri dveh širinah (4 testi); A02–A05 po dve širini (8 testov);
A06 in A07 po en test (2 testa). D01–D04 so skupni razvojni testi na namizju
in mobilnem profilu. Vsi spodaj navedeni avtomatizirani scenariji so uspeli
v končnem [dnevniku](check.log).

| Zahteva | Izveden dokaz | Odgovorna koda |
| --- | --- | --- |
| R01 | D01 in A01: začetni naslov/stanje drugega opravila istega naslova; A04: prehod na drugo opravilo. Izbira ter PATCH po ID. | [TaskDetails](../../src/TaskDetails.tsx): izbira `task`; [TaskEditForm](../../src/TaskEditForm.tsx): začetna lokalna stanja. |
| R02 | D03, A01: vnos ne spremeni API posnetka, naslova v seznamu in števcev. A03: zadržana zahteva še ne premakne kartice ali spremeni shranjenih podatkov. | TaskEditForm: ločen `title`/`status`; [App](../../src/App.tsx): le potrjeni odgovori v `savedTasks`. |
| R03 | D04 in A02: prazen naslov ter mešanica presledkov, tabulatorjev, CR/LF ne sprožita PATCH; napaka je povezana s poljem, fokus ostane v njem, veljaven popravek odstrani napako. Preverjeno dejansko telo PATCH za obrezovanje robov, dvojne notranje presledke, notranji tabulator/prelom, NBSP na robovih in samostojen NBSP ter U+2003. | TaskEditForm: `cleanTitle`, `submit`, onChange, `aria-invalid`, `aria-describedby`. |
| R04 | A05: vseh šest usmerjenih prehodov med različnimi stanji in vsi trije prehodi v isto stanje; možnosti select so natanko tri predpisane oznake. | TaskEditForm: HTML select. |
| R05 | D02, A01: oba podatka se shranita skupaj, obrazec izgine, podrobnosti, preglednica, tabla in števci se uskladijo; zapis ostane po reload in menjavi projekta. A05 preveri tudi števce stolpcev pri vseh prehodih. A06 zadrži star začetni odgovor seznama do potrditve spremembe in preveri, da je ne prepiše. | TaskEditForm: `await updateTask`; App: `taskSaved`, `tasks`, `counts`; TaskDetails: `savedTask`. |
| R06 | D03, A04: preklic vnosa, vnosne napake in strežniške napake; ponovno odprtje pokaže shranjene podatke brez starih napak. Preklic ne poveča števila zahtev. | TaskDetails: odstranitev TaskEditForm; TaskEditForm: gumb Prekliči. |
| R07 | A01 in A05 primerjata celotne zapise vseh šestih opravil v obeh projektih; spremenita se samo naslov/stanje izbranega ID. A01 preveri točno pot PATCH in telo brez drugih polj. | TaskEditForm: `updateTask(task.id, { title, status })`; App: Map po ID; ostala polja samo za branje. |
| R08 | A03: zadržana zavrnitev ohrani neobrezani uporabnikov vnos in izbrano stanje, prikaže alert, ponovni poskus uspe; A04 prekliče zavrnjeni vnos. A07 dodatno prekine povezavo pred zapisom in preveri uspešno ponovitev. | TaskEditForm: catch in `saveError`; potrjevanje samo v uspešni veji. |
| R09 | A03: trije hitri kliki in dve dodatni oddaji istega obrazca sprožijo le eno zahtevo; med čakanjem so obe polji in oba gumba disabled ter prikazan role=status. Po zavrnitvi se odklenejo; naslednji zadržani poskus se uspešno zaključi. | TaskEditForm: sinhroni `pending` ref, `saving`, finally, disabled in status. |
| R10 | Skupni testi ter A01/A04/A05: menjava projekta, pogledov in opravila po urejanju; čisto ponovno odprtje in ohranitev drugih opravil. A01 preveri tudi vrnjen fokus na Uredi. | App: obstoječa navigacija in ključi projekta/opravila; TaskDetails: `editing` in fokus. |

## Ogled in dostopnost

Skripta za ogled je preverila vrstni red fokusa Naslov → Stanje → Shrani →
Prekliči, vrnitev fokusa na Uredi po preklicu, prikaz validacije in širino dialoga.
Posnetki kažejo obstoječi stranski dialog Folio, modro glavno dejanje, vidni
fokus in napako ob naslovu. Pri 320 px je spodnji del podrobnosti dosegljiv z
navpičnim pomikom; obrazec ne potrebuje vodoravnega pomika.
Vizualno sem pregledal `form-1440.png`, `form-390.png` in `validation-320.png`;
vseh šest posnetkov je nastalo z isto skripto.

| Širina | Obrazec | Vnosna napaka |
| --- | --- | --- |
| 1440 px | [form-1440.png](form-1440.png) | [validation-1440.png](validation-1440.png) |
| 390 px | [form-390.png](form-390.png) | [validation-390.png](validation-390.png) |
| 320 px | [form-320.png](form-320.png) | [validation-320.png](validation-320.png) |

## Omejitve in obseg

- Preverjeno v Chromiumu; drugih brskalnikov, dejanske mobilne tipkovnice in
  bralnika zaslona nisem preverjal. Mobilni skupni testi uporabljajo pripravljeni
  mobilni profil Chromium, lastni testi in ogled pa določene širine zaslona.
- Osvežitev strani preverja ohranitev podatkov v istem zagonu pripravljene
  storitve. Trajnost po ponovnem zagonu strežnika ni obljubljena s tem izhodiščem.
- Sočasne spremembe drugih uporabnikov ter zapuščanje strani ali navigacija
  med odprtim urejanjem so zunaj naloge. Med urejanjem sta načina zaključka
  Shrani in Prekliči; X je onemogočen, Escape ne zavrže vnosa. Običajno zapiranje
  podrobnosti po urejanju ostaja in je zajeto v testih izhodišča.
- Skupni podatki, API, tipi, odvisnosti, nastavitve in skupni testi niso bili
  urejani. Testne kontrole `/__test/` uporablja samo testni program; koda v
  `src/` bere in shranjuje prek javnega `/api/`, brez localStorage.
- Noben korak ni bil blokiran z omejitvami okolja. Uporabljene so bile le
  lokalne storitve. npm je izpisal opozorilo obstoječe nastavitve `http-proxy`,
  Node pa opozorilo `NO_COLOR`/`FORCE_COLOR`; zagoni so se uspešno zaključili.
- Neizpolnjene zahteve: **ni ugotovljenih**. Skriti končni testi niso dostopni
  in niso navedeni kot izvedeni.
