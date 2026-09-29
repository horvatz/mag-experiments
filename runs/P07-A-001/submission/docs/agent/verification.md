# P07 – poročilo preverjanja

Naloga je bila izvedena samostojno po postopku A z enim agentom, 2026-09-25. Specifikacija je bila zapisana pred implementacijo in nato dopolnjena z rezultati; zgodovina popravka je v [specification.md](specification.md). Spremenjena izvorna koda je omejena na `src/`, lastni testi na `tests/agent/` in dokumentacija na `docs/agent/`. Strežnik, skupni tipi, konfiguracija, odvisnosti in skupni testi niso bili spreminjani. Uporabljene so bile samo lokalne storitve naloge.

## Rezultat

Implementirane so R01–R12: globalna množica priljubljenih z validacijo in trajnim zapisom, gumbi v obeh pogledih, projektni filter, odstranitev priljubljenih trenutnega projekta, števci, sinhronizacija prek `storage` ter opozorilo in nadaljevanje dela v pomnilniku ob napaki shrambe. Ni ugotovljenih neizpolnjenih zahtev.

## Dejansko izvedeni zagoni

| Preverjanje | Ukaz / način | Dejanski izid | Dokaz |
| --- | --- | --- | --- |
| Prva celotna regresija po implementaciji | `npm run check > docs/agent/check-initial.log 2>&1` | Izhod 0; ESLint, TypeScript in produkcijska gradnja uspešni; **46/46 testov**, 17,1 s za teste. | [check-initial.log](check-initial.log) |
| Končno preverjanje z lastnimi testi | `npm run check > docs/agent/check-final.log 2>&1` | Izhod 0; ESLint, TypeScript in Vite uspešni; **69/69 testov**, 28,0 s za teste; brez preskočenih ali neuspelih testov. | [check-final.log](check-final.log) |
| Lokalni pregled v brskalniku | `WEB_PORT=5193 API_PORT=3123 npm run dev`; Node skripta s `chromium.connect(wsEndpoint)` iz `task/browser.json` | Oba pogleda prikazana pri 1440×960 in 390×844; pri 390 px je `document.documentElement.scrollWidth` enak 390 v obeh pogledih. Space preklopi izbrani ID brez podrobnosti. Ni dogodkov `pageerror`. | [manual-review.log](manual-review.log), posnetki spodaj |
| Vizualni pregled posnetkov | Ogled petih lokalnih slik | Folio ohranja navigacijo, barve in gradnike; zvezdice so ločene od povezav; kontrole se na 390 px prelomijo in ne razširijo strani; fokus je viden. | [Preglednica](desktop-table.png), [tabla](desktop-board.png), [ozka preglednica](mobile-table.png), [ozka tabla](mobile-board.png), [fokus](mobile-focus.png) |
| Pregled uporabe shrambe/API-ja v kodi | `rg -n '__test|localStorage|favorites|Favorite' src` in pregled spremenjenih komponent | Nova funkcionalnost uporablja samo localStorage; v `src/` ni uporabe `/__test/`. UI še vedno bere opravila prek obstoječega `/api/`. | [useFavorites.ts](../../src/useFavorites.ts), [App.tsx](../../src/App.tsx) |

Končnih 69 testov sestavlja 38 izhodiščnih (14 API + 12 desktop + 12 mobile), 8 razvojnih P07 (D01–D04 na desktop in mobile) ter 23 lastnih preverjanj v [favorites.spec.ts](../../tests/agent/favorites.spec.ts). Testni strežnik je uporabljal predpisani vrati 5174/3102 in že nastavljen ločen Chromium. Ročni pregled je uporabljal vrati 5193/3123.

## Povezava zahtev z dokazi

Vsi spodnji avtomatizirani scenariji so bili dejansko izvedeni in so uspeli v končnem zagonu. V dnevniku so navedeni po imenih D01–D04 oziroma A01–A09.

| Zahteva | Kaj je bilo preverjeno | Test / dokaz | Koda |
| --- | --- | --- | --- |
| R01 | Neodvisnost enakih naslovov, aria-pressed, preklop s Space brez odpiranja podrobnosti, dejanje zunaj povezave, odstranitev na tabli. | D01, A03, A05, ročni fokus | [FavoriteButton.tsx](../../src/FavoriteButton.tsx); vključitev v App/TaskBoard |
| R02 | Natančen ključ in JSON oblika; podvojitve; vrstni red UTF-16 z velikimi/malimi črkami, črko ž, emojijem, znakom U+E000 in praznim nizom; brez polj opravil. | D03, A01 | [useFavorites.ts](../../src/useFavorites.ts) – commit |
| R03 | Obnova po osvežitvi, podvojitve štejejo enkrat; neznani ID-ji ostanejo shranjeni in ne ustvarijo opravil. | D03, A01, A04 | useFavorites – readFavorites/parseFavorites |
| R04 | 12 začetnih zapisov: odsoten ključ, pokvarjen JSON, napačna/nenumerična verzija, odsoten/nepoljski ids, nenizi v ids (število, null, objekt) ter null/polje/boolean v korenu. Vsi dajo prazno množico brez samodejnega zapisa; naslednje dejanje deluje. | A02 (12 testov); spremljanje vseh poskusov setItem | useFavorites – readFavorites/parseFavorites |
| R05 | Začetni filter false, stabilen izvorni vrstni red pri 13 opravilih z neabecednimi ID-ji; prikaže samo priljubljene projekta. | D02, A01, A03, A04 | [App.tsx](../../src/App.tsx) – onlyFavorites/visibleTasks |
| R06 | Takojšnja odstranitev iz filtriranega prikaza, sporočilo o praznem rezultatu, izklop filtra v obeh pogledih; podatkovni množici z 0 in 1 opravilom. | D02, A04, A05 (2 testa); [prazna tabla](mobile-0-board.png), [prazna preglednica](mobile-0-table.png) | App – prazno stanje in kontrole |
| R07 | Ohranitev množice in filtra med preglednico/tablo ter po podrobnostih. Pravilen ID s presledki, Unicode, poševnico, narekovajem, # in ?; besedilo ostane navadno besedilo; pravilen prestopni datum. | D04, A03; regresije podrobnosti | App, [TaskBoard.tsx](../../src/TaskBoard.tsx) – povezave z taskUrl |
| R08 | Menjava projekta ponastavi filter in ohrani globalne ID-je; osvežitev obnovi ID-je in nastavi filter false. Tudi pomnilniško stanje preživi menjavo projekta ob izjemi shrambe. | A01, A04, A08 | App – useFavorites in ProjectView s ključem projekta |
| R09 | Odstranitev vseh priljubljenih trenutnega projekta ob aktivnem filtru; ohranitev dveh ID-jev drugega projekta in neznanega ID-ja; onemogočen gumb pri X=0, tudi v praznem projektu. | A04, A05 | App – tasks.map; useFavorites – remove |
| R10 | Točno besedilo in dostopno ime statusa; imenovalec 13 tudi pri filtru, pravilni X po preklopih/dogodkih; vidni števci stolpcev 2/0/1 in prazni 0/0/0. Obstoječi povzetek stanj ohrani celoten projekt. | A03–A06 | App – favoriteCount; TaskBoard – entries.length |
| R11 | Dogodki z drugim ključem se ignorirajo; novi veljavni/neveljavni zapisi in null zamenjajo stanje; ni povratnega setItem. Dejanska komunikacija dveh zavihkov, tudi removeItem. Ločeno simulirane izjeme getItem, setItem (kvota) in getterja localStorage; opozorilo role=alert in nadaljevanje preklopa, filtriranja, navigacije ter odstranitve. | A06, A07, A08 (3 testi) | useFavorites – receive/try-catch; App – storage-warning |
| R12 | Spremljanje vseh zapisovalnih zahtev; stanje resničnega lokalnega API-ja po vseh dejanjih povsem enako začetnemu. Obstoječe nalaganje, napake/retry, navigacija in podrobnosti prestanejo regresije; širina 390 px in notranje drsenje preverjena v obeh pogledih. | D04, A03–A05, A08, A09; 38 izhodiščnih testov; ročni pregled | App, TaskBoard, [styles.css](../../src/styles.css); API ostaja nespremenjen |

## Omejitve in nepreverjeni deli

- Nedostopni končni testi niso bili izvedeni in niso vključeni v rezultat 69/69.
- Preverjanje je teklo v nameščenem Chromiumu; drugih brskalnikov, dejanskih mobilnih naprav in bralnikov zaslona nisem preverjal. Dostopna imena, vloge, aria-pressed in tipkovnica so bili preverjeni s Playwrightom ter vizualnim pregledom fokusa.
- Napake shrambe so bile nadzorovano simulirane s pravimi izjemami DOMException; fizično poln disk oziroma izčrpanje kvote brskalnika nista bila povzročena.
- Zahteva določa zamenjavo množice ob dogodku; združevanje hkratnih zapisov več zavihkov in nove sočasne spremembe podatkov API-ja niso del razširjenega obsega. Ob napaki shrambe je stanje ohranjeno v pomnilniku do osvežitve, opozorilo ostane v trenutni seji.
- Okolje ni preprečilo nobenega koraka. Opozorili npm o `http-proxy` ter Node o `NO_COLOR`/`FORCE_COLOR` sta bili informativni in nista vplivali na uspešen izhod ukazov. Infrastruktura ni bila prilagajana.

Po uspešnem končnem zagonu se izvorna koda in testi niso več spreminjali; dopolnjena sta bila samo specifikacija in to poročilo ter dodani dokazi vizualnega pregleda.
