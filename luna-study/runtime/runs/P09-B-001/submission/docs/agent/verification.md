# Implementacija in preverjanje

## Izvedba

Dodano je stanje pregleda v fragmentu URL-ja. `src/navigation.ts` razčleni prvi pojav parametrov `q`, `status`, `order` in `view`, uporabi varne privzete vrednosti ter sestavi kanonične povezave. `src/App.tsx` ima ločen osnutek kontrol, dobesedno normalizirano iskanje, filter IN, stabilno razvrščanje naslovov, števec in prazno stanje. Potrjevanje spremeni zgodovino le ob spremembi filtrov; enaka potrditev po potrebi zamenja nekanočno trenutno povezavo brez nove zgodovinske postavke. Preklop pogleda, projektna in podrobnostna navigacija so povezani prek `src/App.tsx`, `src/TaskBoard.tsx` in `src/TaskDetails.tsx`. Nove kontrole so oblikovane v `src/styles.css` po obstoječem Folio videzu.

UI še naprej bere samo obstoječe `/api/` GET poti; ne uporablja `/__test/`, zapisovalnega API-ja ali `localStorage`. Vrstice in kartice ohranijo `data-task-id`; izbira podrobnosti ostane vezana na ID.

## Sledljivost zahtev

| Zahteva | Implementacija | Preverjanje in rezultat |
| --- | --- | --- |
| R01 | `filtersFromHash`, `viewFromHash`, `useRoute` v `src/navigation.ts` | P09 D01 ter lastni neposredni URL: uspešno. |
| R02 | `normalize` in `includes` nad naslovom, opisom, odgovorno osebo ali ID v `src/App.tsx` | Lastni Unicode/diakritični frazni scenarij: uspešno. |
| R03 | Združeni pogoji v `src/App.tsx`; primerjava normaliziranega naslova in izvornega indeksa za stabilnost | Lastni osnutek s stanjem in padajočim naslovom: uspešno; predani P09 scenariji uspešni. |
| R04 | Prvi pojav prek `URLSearchParams.get`, whitelisting statusa/vrstnega reda; parse ne spreminja URL-ja | Lastni primer podvojenega neveljavnega statusa in tujega parametra potrdi privzeto stanje ter nespremenjen URL. |
| R05 | `draft` v `App`; `confirm` potrjuje trojico atomarno | Lastni scenarij potrdi filtre skupaj in preveri prikaz pred potrditvijo: uspešno. |
| R06 | `fragment` izpusti privzete vrednosti, kodira s `URLSearchParams`; `confirm` obreže q in prepreči podvojeno zgodovinsko stanje | Potrditev, ponastavitev in ohranitev `view=board` v lastnem testu: uspešno. Ločeno število zgodovinskih postavk pri istovetni potrditvi ni neposredno asertirano. |
| R07 | `useRoute` posluša `hashchange`; osnutek se obnovi iz URL-ja | Lastni Back/Forward scenarij in razvojni reload D03: uspešno. |
| R08 | Stikala pogleda kličejo `projectUrl` s potrjenimi filtri; navigacija resetira osnutek | Razvojni D03 in lastni preklop pogleda/projekta: uspešno. |
| R09 | Tabela in tabla zgradita povezavo opravila z ID-jem; `TaskDetails` zapre na potrjeni projektni URL | Izhodiščni testi podrobnosti ter lastni Escape scenarij s filtrom in tablo: uspešno. |
| R10 | Projektna navigacija drugemu ID-ju poda privzete filtre in ohrani pogled | Lastni preklop `web` → `launch`: uspešno; neposredni deep link je zajet z R01. |
| R11 | Ponastavitev uporabi isto potrditev; števec in `Ni zadetkov.` v `src/App.tsx` | Razvojni D04 ponastavi pogled brez zapisov; števec preverjen v lastnem testu. Prazno besedilo za filter brez zadetkov ni bilo ločeno asertirano. |
| R12 | Implementacija uporablja `/api/` GET; ohranjena obstoječa komponentna stanja in odzivni notranji pomik | Celotni osnovni testi, razvojni `readonly()` scenariji in lastno preverjanje brez zapisov: uspešno. |

Lastni testi so v `tests/agent/p09-views.spec.ts`. Predane specifikacije nisem spreminjal. Pri pregledu nisem našel napake specifikacije, ki bi zahtevala odmik od R01–R12.

## Preverjanja

- `npm run lint`: uspešno.
- `npm run typecheck`: uspešno.
- `npm run build`: uspešno.
- `npm run check`: po prvotni implementaciji uspešno 49/49 testov; po popravku R11 uspešno 50/50 Playwright testov: 14 API, 12 namiznih izhodiščnih, 12 mobilnih izhodiščnih, 8 razvojnih P09 in 4 lastni. Lint, tipi in gradnja so prav tako uspešni.
- Razvojni testi delujejo z nameščenim Playwright brskalnikom prek prednastavljenega `wsEndpoint`; Chromium ni bil zagnan neposredno.

## Omejitve

- Končnih oziroma zasebnih preverjanj ni v tem okolju; niso navedena kot izvedena. Ročni vizualni pregled ni bil izveden.
- `git status` ni bil dostopen: nameščena orodja sistema Apple Command Line Tools nimajo veljavne poti `xcrun`. To ne vpliva na zagon aplikacije ali preverjanj.
- npm izpiše opozorili za konfiguracijo `http-proxy` in barvne spremenljivke okolja; preverjanja vseeno uspejo.

## Nadaljevanje po pregledu

- Pregledovalec označil R11 kot odstopanje: projekt z `M=0` ni prikazal `Ni zadetkov.` v tabeli ali tabli. Ugotovitev je utemeljena, ker navodila ne izvzemajo praznega projekta; dodatna obstoječa razlaga praznega projekta lahko ostane.
- Ugotovitev sprejeta in odpravljena v `src/App.tsx`: za `M=0` tabela prikaže `Ni zadetkov.` ter ohrani pojasnilo praznega projekta; tabla prikaže `Ni zadetkov.` nad praznimi stolpci.
- Dodan `an empty project reports no results in the table and board` v `tests/agent/p09-views.spec.ts`; preveri tudi `Prikazano: 0 od 0.` in noben zapis.
- Ponovni `npm run check`: uspešno, 50/50. Pregled `review.json` ni zahteval spremembe specifikacije ali nadaljnjega popravka.
