# Implementacija in preverjanje

## Začetni načrt

- Pregledati izvirne zahteve R01–R12, predano specifikacijo, Folio dizajn in razvojne scenarije.
- Implementirati lokalno filtriranje za trenutni projekt, ohraniti obstoječi API in poglede.
- Zagnati `npm run check`, ki vključuje slog, tipe, gradnjo, osnovne in razvojne teste; dodati robna preverjanja v `tests/agent/`.
- Zabeležiti izide, nepreverjena področja in okoljske omejitve.

## Izvedba

- V `src/App.tsx` so dodani lokalni kontrolniki za iskanje/stanje/osebo, NFD normalizacija, dobesedni AND-predikat ter skupen filtriran seznam za oba pogleda. Kontrolniki so vezani na `ProjectView`, ki se pri menjavi projekta ponovno ustvari. Števci, prikaz nič zadetkov in čiščenje filtrov uporabljajo isti seznam.
- V `src/styles.css` so dodani slog kontrolnikov in odzivna razporeditev; obstoječi Folio barvni sistem in notranje drsenje pogledov ostajata v veljavi.
- V `tests/agent/filters.spec.ts` so dodani robni primeri za Unicode/večbesedno in dobesedno iskanje, sestavljene filtre, seznam oseb, menjavo projekta, prazne rezultate, števce in osvežitev.

## Sledljivost zahtev

| Zahteva | Pogoj in implementacija | Dejanski preizkus in izid |
| --- | --- | --- |
| R01 | `query=''`, `status='all'`, `assignee='all'`; `ProjectView` filtrira urejeni API `Task[]` brez razvrščanja (`src/App.tsx:17–29, 118`). | D01 preveri privzete ID-je v desktop in mobile projektu; uspelo. |
| R02 | `normalizeSearch` uporabi NFD, odstrani U+0300–U+036F in male črke (`src/App.tsx:13–15, 23–26`). | D01 preveri `CAS`; lastni test preveri `Čas`/`cas` in besedilo iz različnih polj; uspelo. |
| R03 | Besede se razdelijo po belinah; `every/includes` pomeni dobesedne podnize neodvisno od vrstnega reda (`src/App.tsx:23–26`). | Lastni test išče obrnjeni vrstni red `vsebina cas` ter literalni `.*`; uspelo. |
| R04 | Predikat je konjunkcija iskalnih besed, izbranega stanja in natančnega imena (`src/App.tsx:24–29`). | D02 preveri kombinacijo stanja/osebe in menjavo pogleda; lastni test preveri osebi, različni le po velikosti črk; uspelo. |
| R05 | Možnosti oseb se izračunajo iz celotnega `tasks`, deduplicirano, ne iz rezultatov (`src/App.tsx:22, 65–67`). | Lastni test preveri ime skrito z izbranim stanjem in ponastavitev osebe po menjavi projekta; uspelo. |
| R06 | Preglednica in `TaskBoard` prejmeta isti `filteredTasks`; stolpci se delijo po stanju v `TaskBoard` (`src/App.tsx:71–74, 78`; `src/TaskBoard.tsx`). | D02 preveri iste ID-je po menjavi pogleda; lastni test preveri nič zadetkov in čiščenje na tabli; uspelo. |
| R07 | `ProjectView key={project.id}` ponastavi stanje; API pot uporablja trenutni ID projekta (`src/App.tsx:18, 118`). | Lastni test filtrira web, preklopi na launch in preveri privzete kontrole ter samo ID drugega projekta; uspelo. |
| R08 | Filtri živijo samo v `useState`; URL še vedno kodira samo pogled prek obstoječe navigacije (`src/App.tsx:19–21, 55–57`). | Lastni test osveži tablo: filtri so privzeti, URL ohrani `?view=board`, vsi ID-ji se vrnejo; uspelo. |
| R09 | Statusni element izpiše `Prikazano: N od M.`; pregled stanj, značka naslova in tabla štejejo rezultate (`src/App.tsx:30–34, 42–46, 54, 70`; `src/TaskBoard.tsx`). | D04 preveri N/M; lastni testi preverijo pregled stanj in števce stolpcev; uspelo. |
| R10 | Pri neujemanjih v nepraznem projektu se pokaže `Ni zadetkov.` v obeh pogledih; prazen projekt ohrani staro prazno stanje (`src/App.tsx:71–74`). | D03 preveri seznam in čiščenje; lastni test preveri tabelo, tablo ter prazen projekt 0/0; uspelo. |
| R11 | En gumb povrne vse tri kontrolnike na privzeto vrednost; filtriranje je ne-mutirajoči `filter` (`src/App.tsx:24–29, 68`). | D03 in lastni test preverita obnovljene ID-je; uspelo. |
| R12 | Ohranjene so povezave, ID-ji, imena pogledov in table stanj; filtri ne kličejo zapisovalnega API-ja. Kontrolniki se pri ozki širini prelomijo (`src/App.tsx:42, 55–57, 61–74, 78–90`; `src/styles.css:62–70` in mobilni media query). | Vseh 38 osnovnih API/desktop/mobile regresijskih testov je uspelo; D04 na mobile preveri širino dokumenta in odsotnost pisalnih klicev. Bralne podrobnosti preverjajo osnovni testi. |

## Rezultati preverjanja

- Končni `npm run check`: uspeh — ESLint, TypeScript, Vite production build in vseh 51 Playwright testov (14 API, 12 desktop osnovnih, 12 mobile osnovnih, 4 razvojni desktop, 4 razvojni mobile, 5 lastnih agentnih).
- Lastne agentne teste je preveril tudi ciljni zagon `npx playwright test --project=agent`: 4/4 uspešno pred dodanim preverjanjem števcev; končni `npm run check` je nato uspešno zagnal vseh 5/5.
- Začetna testna iteracija je odkrila dve napačni pričakovanji oziroma pripravi v testih (ujemanje fixture besed in ponovno nalaganje iste hash strani); fixture in scenarij sta bila popravljena. Končni zagon je zelen.
- Omejitve: `git status`/veje ni bilo mogoče preveriti, ker lokalni `git` izpisuje napako `xcrun: invalid active developer path` zaradi manjkajočih Command Line Tools. Zato zaključek temelji na neposrednem pregledu urejenih dovoljenih datotek; skupne teste, infrastrukturo in odvisnosti sem pustil nedotaknjene. Npm izpisuje tudi opozorilo za okoljsko konfiguracijo `http-proxy`; preverjanja ni ustavilo.
- Razvojni strežnik in Chromium sta bila dosežena prek Playwright konfiguracije (`task/browser.json`); preverjanje je uporabljalo lokalne API-je, javni internet ni bil uporabljen. Ročni vizualni ogled ni bil izveden.

## Odstopanja in nepreverjeno

- V predani specifikaciji nisem našel napake glede izvirnih zahtev; vseh R01–R12 je povezanih z implementacijo in dejanskim preverjanjem zgoraj.
- Posebnega merjenja zaslona na točno 390 px nisem dodal; mobilni razvojni testi delujejo pri 390 px in `readonly()` preveri, da dokument ne preseže širine zaslona. Vizualna presoja videza je omejena na testno preverjanje DOM-a.
