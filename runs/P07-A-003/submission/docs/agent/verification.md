# P07 — izvedena preverjanja

Naloga je izvedena po postopku A z enim agentom. Specifikacija je bila zapisana
pred spremembami kode. Delo in preverjanje sta potekala 2026-09-25 od 19:09 UTC
do približno 19:19 UTC, znotraj 20-minutne omejitve. Znane neizpolnjene zahteve:
nobena. Nedostopni končni testi niso bili izvedeni.

## Končni rezultat preverjanj

`npm run check` je bil izveden dvakrat. Prvi zagon je uspel z 67 testi
([prvi dnevnik](check-initial.log), 27,7 s za teste). Po pregledu kode je bilo
popravljeno trajanje opozorila shrambe in okrepljen A06; celoten ukaz je bil
zato ponovljen. Končni zagon je zaključil z izhodno kodo 0:

| Preverjanje | Dejanski izid | Dokaz |
| --- | --- | --- |
| ESLint (`npm run lint`) | Uspešno, brez napak | [Končni dnevnik](check.log) |
| TypeScript (`npm run typecheck`, del gradnje) | Uspešno, brez napak | [Končni dnevnik](check.log) |
| Produkcijska gradnja Vite (`npm run build`) | Uspešno | [Končni dnevnik](check.log) |
| Izhodišče: API + desktop + mobile | 38/38 uspešnih | [Končni dnevnik](check.log), testi 1–38 |
| Skupni razvojni testi P07, desktop + mobile | 8/8 uspešnih | [Končni dnevnik](check.log), testi 39–46 |
| Lastni testi `tests/agent/favorites.spec.ts` | 21/21 uspešnih | [Končni dnevnik](check.log), testi 47–67 |
| Skupaj Playwright | **67/67 uspešnih, 27,8 s** | Zadnja vrstica [dnevnika](check.log) |

Opozorili npm o obstoječem `http-proxy` in Node o `NO_COLOR`/`FORCE_COLOR`
nista preprečili izvajanja. Noben korak ni bil blokiran zaradi okolja.
Testi so uporabili nespremenjeno konfiguracijo in ločeni Chromium prek
`connectOptions`; testna strežnika sta tekla na vratih 5174/3102.

## Sledljivost zahtev

Pogoji in predikati so opredeljeni v [specifikaciji](specification.md).
Oznake A01–A08 so imena scenarijev v
[lastnih testih](../../tests/agent/favorites.spec.ts); A02 ima 12 primerov,
A06 pa 3. D01–D04 so [skupni razvojni testi](../../tests/development/P07.spec.ts).
Vsi spodaj navedeni testi so bili dejansko izvedeni in so uspešni v
[končnem dnevniku](check.log).

| Zahteva | Preverjeni pogoj | Test ali scenarij | Datoteka in del kode | Izid ter dokaz |
| --- | --- | --- | --- | --- |
| R01 | Gumb je zunaj povezave, preklaplja samo ID, ima pravilen `aria-pressed`, ne odpre podrobnosti; enaki naslovi ostanejo neodvisni. | D01, A01, A08 (Space v obeh pogledih) | [FavoriteButton.tsx](../../src/FavoriteButton.tsx), `FavoriteButton`; [App.tsx](../../src/App.tsx), vrstica; [TaskBoard.tsx](../../src/TaskBoard.tsx), kartica | Uspešno; D01 desktop/mobile, A01, A08 v dnevniku. |
| R02 | V shrambi so samo `version` in enkratni ID-ji, urejeni po UTF-16, tudi z znaki zunaj BMP. | D03, A01 (primerjava celotnega objekta), A03 | [useFavorites.ts](../../src/useFavorites.ts), `save`, `toggle`, `removeProject` | Uspešno; D03, A01, A03. |
| R03 | Obnova po osvežitvi, združitev podvojenih, ohranitev neznanih in ID-jev drugega projekta brez izmišljenih vrstic. | A01 (13 opravil), A03, A07 | [useFavorites.ts](../../src/useFavorites.ts), `parseFavorites`, `readFavorites`; [App.tsx](../../src/App.tsx), `visibleTasks` | Uspešno; A01, A03, A07. |
| R04 | Manjkajoč ključ, napačen JSON, null, napačna/nenumerična različica, manjkajoči/napačni ids, mešani nenizi, polje ali primitiv dajo prazno množico brez zapisa ob nalaganju. | A02, 12 parametriziranih primerov; opazovanje `Storage.setItem` in izvorne vrednosti | [useFavorites.ts](../../src/useFavorites.ts), `parseFavorites`, `readFavorites` | Uspešno; vseh 12 A02. |
| R05 | Filter je sprva false in ohrani vrstni red API-ja; deluje pri več kot desetih opravilih. | D02, A01, A03 | [App.tsx](../../src/App.tsx), `onlyFavorites`, `visibleTasks`, checkbox | Uspešno; D02, A01, A03. |
| R06 | Odstranitev takoj izloči zadetek; prazno sporočilo in izklop filtra sta dosegljiva v obeh pogledih. | D02, A03 (preglednica), A07 (tabla, prazno in eno opravilo), vizualni pregled | [App.tsx](../../src/App.tsx), `favorites-empty`, orodna vrstica | Uspešno; D02, A03, A07; [mobilno prazno stanje](mobile-empty.png). |
| R07 | Tabla in preglednica delita množico ter filter, podrobnosti ciljajo pravi ID. | D04, A01 (ID z `/`), A03, izhodiščna navigacija | [App.tsx](../../src/App.tsx), globalni `useFavorites`, `ProjectView`; [TaskBoard.tsx](../../src/TaskBoard.tsx), props in povezave | Uspešno; D04, A01, A03 ter izhodiščni testi. |
| R08 | Menjava projekta ohrani priljubljene in resetira filter; osvežitev obnovi množico in resetira filter. | A01, A03, A06 (pomnilnik ob napaki) | [App.tsx](../../src/App.tsx), `ProjectView key={project.id}`, lokalni `useState(false)`; [useFavorites.ts](../../src/useFavorites.ts), začetno branje | Uspešno; A01, A03, A06. |
| R09 | Skupinska odstranitev uporabi vse ID-je trenutnega projekta, ohrani druge/neznane, gumb je onemogočen pri nič priljubljenih ali praznem projektu. | A03, A06, A07 | [App.tsx](../../src/App.tsx), `tasks.map` in `disabled`; [useFavorites.ts](../../src/useFavorites.ts), `removeProject` | Uspešno; A03, A06, A07. |
| R10 | Status šteje celoten projekt tudi pod filtrom; stolpci štejejo le vidne kartice, vključno z nič. | A01, A03, A07 | [App.tsx](../../src/App.tsx), `favoriteCount`, status; [TaskBoard.tsx](../../src/TaskBoard.tsx), `entries.length` | Uspešno; A01, A03, A07. |
| R11 | Dogodki pravega ključa zamenjajo množico, null jo izprazni, drug ključ je ignoriran; brez povratnega zapisa; napake branja, pisanja in samega dostopa do shrambe pustijo uporaben pomnilnik z opozorilom. | A04 (veljavne in vseh 12 neveljavnih oblik), A05 (dva dejanska zavihka), A06 (tri izjeme, opozorilo tudi po naslednjem dejanju) | [useFavorites.ts](../../src/useFavorites.ts), `receive`, `readFavorites`, `save`; [App.tsx](../../src/App.tsx), `storage-warning` | Uspešno; A04–A06 v končnem dnevniku. |
| R12 | Ni zapisovalnih API zahtev ali sprememb opravil; Folio, navigacija, nalaganje, imena in širina strani so ohranjeni. | D04, A03 (primerjava strežniškega stanja), A01/A03/A06/A08 (omrežje), A08 (390 px), 38 izhodiščnih testov, vizualni pregled | [App.tsx](../../src/App.tsx), [TaskBoard.tsx](../../src/TaskBoard.tsx), [styles.css](../../src/styles.css), izolirani [useFavorites.ts](../../src/useFavorites.ts) | Uspešno; navedeni testi, [vizualni zapis](visual-check.json) in spodnji posnetki. |

## Vizualni in statični pregled

Za lokalni pregled je bil zagnan predpisani ukaz
`WEB_PORT=5193 API_PORT=3123 npm run dev`. Lastna skripta je prebrala
`task/browser.json`, uporabila `chromium.connect(wsEndpoint)` in obiskovala
samo `http://127.0.0.1:5193/`. `chromium.launch()` ni bil uporabljen.

Dejansko pregledani posnetki:

- [Preglednica pri 1440 px](desktop-table.png) in [tabla pri 1440 px](desktop-board.png):
  ohranjeni Folio, levi meni, tipografija, kartice in modri poudarki; ločene zvezdice.
- [Preglednica pri 390 px](mobile-table.png) in [tabla pri 390 px](mobile-board.png):
  novi kontrolniki so dosegljivi, pogled se pomika znotraj svoje površine.
- [Prazen filter pri 390 px](mobile-empty.png): sporočilo, checkbox za vrnitev,
  onemogočena skupinska odstranitev in ničelni števci stolpcev.

Skriptno izmerjena širina dokumenta je bila 390 pri viewportu 390, zabeleženih
izjem `pageerror` ni bilo; [izmerjeni rezultat](visual-check.json). Posnetki so
bili narejeni pred popravkom trajanja opozorila; ta ni spreminjal videza običajnih
stanj. Končna različica je po tem opravila celoten avtomatizirani pregled.

Pregled izvorne kode z `rg` je potrdil, da `src/` ne vsebuje `/__test/` in da
novo branje/pisanje `localStorage` obstaja samo v `useFavorites.ts`. Obstoječi
`updateTask` v `api.ts` je ostal nespremenjen in ga nova funkcija ne kliče.
Testne kontrole uporablja samo testna koda. Lastni testi uporabljajo obstoječi
javni razvojni pripomoček za nadzorovane GET odgovore.

## Omejitve in neizvedeni deli

- Končni skriti testi niso dostopni in niso navedeni kot opravljeni.
- Izvedeno je preverjanje v nameščenem Chromiumu; Firefox, WebKit, fizični
  telefon in dejanski bralnik zaslona niso bili preizkušeni.
- Napake shrambe so bile sprožene z nadzorovanimi izjemami `SecurityError` in
  `QuotaExceededError`, ne s polnjenjem dejanske diskovne kvote.
- Sinhronizacija zavihkov je preverjena z zaporednimi dejanji in dejanskimi
  dogodki. Atomsko združevanje dveh istočasnih zapisov ni zahtevano in ni dodano.
- Ne izvaja se samodejno popravljanje neveljavnega zapisa; naslednje uporabnikovo
  dejanje ga nadomesti z veljavnim zapisom. Opozorilo po zaznani napaki ostane do
  osvežitve, ko se dostop ponovno preveri.

Spremenjene so samo datoteke v `src/`, `tests/agent/` in `docs/agent/`.
Standardni preverjevalni ukazi so ustvarili običajne generirane rezultate
v `dist/`, `playwright-report/`, `test-results/` in predpomnilniku Vite;
infrastruktura, skupni testi, odvisnosti, strežnik in skupni tipi niso bili urejani.
