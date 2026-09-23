# Preverjanje P08

Datum: 2026-09-23. Postopek A, en agent. Začetek dela približno 18:15 UTC; naloga je zaključena pred 20-minutno omejitvijo. Specifikacija 1.0 je bila zapisana pred implementacijo, popravek 1.1 pa dopolnjuje dokaze brez spremembe sprejemnih pogojev.

## Rezultat izvedbe

Implementirane so zahteve R01–R12: koledarsko razvrščanje, pet števcev projekta, izbira skupine, spreminjanje referenčnega datuma z zadržanjem zadnjega veljavnega preračuna, skupni filter preglednice in table, ponastavitev ob menjavi projekta/osvežitvi ter prazni prikazi. Novi podatki se ne zapisujejo. Ni znanih neizpolnjenih zahtev.

Spremenjeni izvorni datoteki sta `src/App.tsx` in `src/styles.css`; dodani sta `src/deadlines.ts` in `src/DeadlineControls.tsx`. Lastni testi in skripta za lokalni ogled so v `tests/agent/`, dokumentacija in dokazi v `docs/agent/`. Strežnik, skupni tipi, razvojni/izhodiščni testi, odvisnosti in infrastruktura niso bili urejani. Uporabljene so bile samo lokalne storitve naloge in nameščeni Chromium, brez drugih agentov.

## Dejansko izvedeni ukazi

| Preverjanje | Dejanski rezultat | Dokaz |
| --- | --- | --- |
| `npm run check` | Izhod 0. ESLint uspešen; TypeScript uspešen; Vite gradnja uspešna; **54/54 testov uspešnih**, 24,1 s za teste. | [check.log](check.log) |
| Izhodišče znotraj `check` | 38/38: 14 API, 12 namiznih in 12 mobilnih regresijskih preverjanj. | Projekti `api`, `desktop`, `mobile` v `check.log`. |
| Skupni razvojni testi znotraj `check` | 8/8: D01–D04 na namizju in mobilni napravi. Ločeni ukaz za razvojne teste ni bil potreben. | Projekta `development-desktop`, `development-mobile` v `check.log`. |
| Lastni testi znotraj `check` | 8/8: A01–A05 po enkrat in A06 v treh časovnih pasovih. | Projekt `agent` v `check.log`; [deadlines.spec.ts](../../tests/agent/deadlines.spec.ts). |
| `WEB_PORT=5193 API_PORT=3123 npm run dev`, nato `node tests/agent/manual-review.mjs` | Lokalni strežnik deluje; skripta se poveže z `chromium.connect(wsEndpoint)` iz `task/browser.json`, izhod 0. Štirje zajeti prikazi, nič napak JS in nič zapisovalnih zahtev na API. | [manual-review.json](manual-review.json), [skripta](../../tests/agent/manual-review.mjs), spodnji posnetki. |
| `npm run lint` po dodatku skripte za ogled | Izhod 0; brez napak. Po uspešnem `check` je bila dodana le skripta za ogled in dopolnjena dokumentacija, aplikacijska koda in testni scenariji se niso spreminjali. | [final-lint.log](final-lint.log). |

Med preverjanjem ni bilo neuspešnih korakov ali zavrnitev okolja. Opozorili okolja o `http-proxy` in `NO_COLOR` nista preprečili preverjanja. Ni bilo uporabljeno `chromium.launch()`.

## Pokritost zahtev in dokazi

| Zahteva | Izvedeni testi in preverjeni izidi | Koda |
| --- | --- | --- |
| R01 | D01 in A02 potrdita `2026-09-21` in `all`, A02 ob uri naprave v letu 2042; A05 ponovne začetke projekta. | [deadlines.ts](../../src/deadlines.ts), konstanta; [App.tsx](../../src/App.tsx), začetno stanje. |
| R02 | D04, A01, A02: zaključena opravila z zapadlim, današnjim, tedenskim in poznejšim rokom so izključno `done`. | `groupDeadlines`, prva veja po statusu. |
| R03 | D01/D03 in A01/A02: točni ID-ji pred datumom in na datum. A03 spremeni preračun. | `groupDeadlines`, razlika dni. |
| R04 | D02, A01/A02: prvi/sedmi/osmi dan, vsaka naloga natanko v eni skupini, vsota dolžin skupin je število opravil. | `groupDeadlines`, meje skupin. |
| R05 | A01: meje meseca/leta, 29. februar, neprestopno 1900, prestopno 2000 in prehod 0099→0100. A06: šest koledarskih primerov v Los Angelesu, Ljubljani in Kiritimatiju, vključno s pomladnim/jesenskim premikom ure, februarjem in novim letom. | `calendarDay`, izrecni UTC in celoštevilski dnevi. |
| R06 | A02 preveri vseh pet števil pri vsakem filtru na obeh prikazih; A03 nov datum in zadržanje števil pri praznem polju; A04 pet ničel za vsak prazen projekt. Ohranjen je tudi izhodiščni povzetek stanj. | `deadlineCounts` iz celotnih podatkov; [DeadlineControls.tsx](../../src/DeadlineControls.tsx), pet označenih števil. |
| R07 | A02: 15 zapisov z enakim Unicode naslovom, drugačnimi ID-ji, mešanimi statusi in nesortiranim zaporedjem. Vsak filter vrne pričakovane ID-je v izvornem vrstnem redu; `all` vrne vse; datumi prikazanih opravil ostanejo nespremenjeni. | `visibleTasks`; skupine se polnijo brez razvrščanja ali spreminjanja opravil. |
| R08 | D03, A03: veljavni novi datum spremeni vrstice in števce; prazen vnos ohrani zadnji preračun, pokaže točno opozorilo in `aria-invalid`; popravljen datum opozorilo odstrani in ohrani filter. | `dateInput`, `referenceDate`, `changeReferenceDate`, opozorilo in povezava `aria-describedby`. |
| R09 | D04, A02: vse skupine imajo enake množice ID-jev v obeh pogledih, na tabli je preverjen tudi vrstni red znotraj stolpcev. A03 ohrani prazno polje in zadnji veljavni preračun skozi oba preklopa; A05 ohrani spremenjeni veljavni datum pri preklopu na tablo. | Stanje v `ProjectView`; obema prikazoma je posredovan `visibleTasks`. |
| R10 | A05: menjava projekta v obe smeri in osvežitev po praznem vnosu ponastavita datum/filter ter odstranita opozorilo; URL se zaradi filtra ne spremeni; localStorage in sessionStorage sta nespremenjena. Pregled kode potrjuje izključno lokalno React stanje. | `ProjectView key={project.id}`; obstoječi URL spreminja samo pogled in navigacijo. |
| R11 | A04: oba projekta brez opravil, vseh šest filtrov in pet ničel; ohranjeni prazni stolpci table. Projekt z enim končanim opravilom ima prazne odprte skupine, zahtevano sporočilo in delujoč preklop na `done`/`all` v obeh prikazih. | Prazni prikazi v `App.tsx`, nespremenjena `TaskBoard`. |
| R12 | 38 regresijskih preverjanj, D04, A02–A06. A02 odpre Unicode ID s podvojenim naslovom prek tipkovnice, preveri navadno besedilo opisa, osebo in rok ter vrnitev fokusa. Testi beležijo zapisovalne zahteve in strežniški števec: nič zapisov uporabniškega vmesnika. Preverjeno prelivanje pri 390 px. Lokalni ogled: nič napak JS/zapisov. | Branje ostaja prek obstoječega API-ja; ni uvozov testnih kontrol v aplikaciji; [styles.css](../../src/styles.css), odzivna postavitev. |

Izidi vseh navedenih avtomatiziranih scenarijev so razvidni iz imen v `check.log`. Celotna pravila in predikati so v [specifikaciji](specification.md).

## Lokalni vizualni ogled

Zajeti so bili posnetki iz dejanske lokalne aplikacije z izhodiščnimi podatki. Vizualno pregledani so bili namizna preglednica, mobilna preglednica in mobilna tabla s praznim datumom. Kontrole in opozorilo so berljivi, fokus je viden, slog sledi obstoječim barvam, robovom in pisavi Folio. Projektna navigacija ostane dostopna. Preglednica in tabla se pomikata znotraj svojega prikaza.

- [Namizna preglednica, 1440 × 960](desktop-table.png).
- [Mobilna preglednica, 390 × 844](mobile-table.png).
- [Mobilna tabla, 390 × 844](mobile-board.png) — zajet dokaz; mobilna tabla je bila vizualno pregledana na naslednjem posnetku z opozorilom.
- [Mobilna tabla s praznim datumom](mobile-invalid-date.png).

Meritve [manual-review.json](manual-review.json): širina dokumenta je pri vseh treh mobilnih prikazih natančno 390 px, pri namiznem 1440 px. Prazno polje ob filtru `week` še vedno prikazuje `web-02`, razvrščen glede na zadnji veljavni datum.

## Omejitve in nepreverjeni deli

- Nedostopni končni testi niso bili izvedeni in niso vključeni v 54 uspešnih preverjanj.
- Preverjen je nameščeni Chromium z namiznimi/mobilnimi nastavitvami; Firefox, WebKit, fizične mobilne naprave in bralniki zaslona niso bili preverjeni.
- Koledarski primeri vključujejo kritične meje in tri časovne pasove, ne vseh možnih datumov ali vseh časovnih pasov. Neveljavni datumi API niso del vhodne domene; neveljavnost referenčnega vnosa je preverjena, nepopoln vnos pa brskalnik lahko izpostavi kot prazno vrednost.
- Novih sočasnih sprememb podatkov brez osvežitve ne obravnavamo, skladno z obsegom naloge. Obstoječi regresijski scenarij preklopa projekta med nalaganjem je uspešen.
- Ni znanih neizpolnjenih zahtev R01–R12; uspešni testi niso trditev o izvedbi nedostopnih končnih preverjanj.
