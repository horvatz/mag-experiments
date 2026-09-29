# Implementacija in preverjanje

## Začetni zapis

Vloga: implementer za P06, postopek B. Izvorne zahteve R01–R12 iz `task/instructions.md` ostajajo zavezujoče; predana `docs/agent/specification.md` je načrt in sledljivost, ne nadomestilo za te zahteve.

### Načrt preverjanja (še neizvedeno)

- Pregledati obstoječi UI/API tok in razvojne teste P06, da se spremembe vključijo v obstoječi Folio brez posega v infrastrukturo.
- Dodati ciljane lastne teste v `tests/agent/` za CSV serializacijo, stanje kontrol, BOM, ubežanje, nevtralizacijo formul in nastavitve ob menjavi pogleda/projekta.
- Zagnati `npm run check` (slog, tipi, gradnja, osnovni, razvojni in lastni testi); rezultate zapisati z izhodno kodo in povzetkom.
- Če je mogoče, preveriti odzivni prikaz pri 390 px in/ali relevantne pogoje ločeno; nedostopne ali neizvedene dele navesti izrecno.

### Okolje in omejitve

- Chromium in odvisnosti so po navodilih nameščeni; lastni Playwright skripti morajo uporabiti `wsEndpoint` iz `task/browser.json` prek `chromium.connect(wsEndpoint)`.
- Javni internet je blokiran. Strežnik za ročni ogled: `WEB_PORT=5193 API_PORT=3123 npm run dev`.
- Dovoljene spremembe so omejene na `src/`, `tests/agent/` in lastne zapise v `docs/agent/`; infrastruktura, odvisnosti, skupni testi in navodila so samo za branje.

## Dnevnik dela

| Čas / korak | Sprememba ali preverjanje | Zahteve | Rezultat |
| --- | --- | --- | --- |
| Začetek | Prebrana so projektna pravila, izvirna navodila, predloga in predana specifikacija. | R01–R12 | Izvedeno; implementacija in preverjanja še čakajo. |

## Zaključek implementacije in dokazila

### Izvedba

- `src/csv.ts` določa kanoničen vrstni red sedmih dovoljenih kolon, stabilno projekcijo iz `Task`, ubežanje dvojnih narekovajev, nevtralizacijo formul in serializacijo z BOM ter zaključkom CRLF.
- `src/App.tsx` dodaja dostopne kontrolnike za izbor kolon, ločilo in filter; gumb je omogočen samo, kadar sta izbrana vsaj en stolpec in vsaj ena izvozna vrstica. Prenos ustvari lokalni CSV z imenom `folio-<projectId>.csv`.
- Nastavitve so lokalna stanja `ProjectView`: preklop pogleda jih ohrani, ključ `project.id` jih ob menjavi projekta ponastavi, polno ponovno nalaganje jih začne s privzetimi vrednostmi.
- `src/styles.css` oblikuje kontrole z obstoječimi Folio barvami, robovi in odzivnim prelomom.
- `tests/agent/export.spec.ts` doda pet scenarijev za ubežanje in Unicode, formule z vodilnimi presledkom/tabulatorjem/CR/LF, CRLF v podatkih, prazen izbor/projekt/filtriran rezultat, vrstni red izbranih kolon, nastavitev statusa/datuma, nespremenjen prikaz, enak izvoz v obeh pogledih, ponastavitve in prenos brez navigacije.

### Sledljivost R01–R12

| Zahteva | Koda / pogoj | Preverjanje in izid |
| --- | --- | --- |
| R01 | `src/App.tsx`: privzeti `all`, `;` in `csvColumns`; `src/csv.ts`: virni vrstni red opravil. | P06 D01/D04 ter polni check; uspešno. |
| R02 | `src/csv.ts`: glava in vrednosti sledijo `csvColumns.filter(...)`; kontrole z imenom `Stolpec <ključ>` v `src/App.tsx`. | P06 D02 in agentni scenarij izbire v obratnem vrstnem redu; uspešno. |
| R03 | `exportEnabled = selectedColumns.length > 0 && exportTasks.length > 0`; onemogočen gumb ne pokliče prenosa. | Agentni test praznega izbora in ponovne izbire; uspešno. |
| R04 | `exportTasks` filtrira samo vrstice CSV, prikaz uporablja nespremenjeni `tasks`. | P06 D02 ter agentna testa praznega projekta in praznega filtriranega rezultata; uspešno. |
| R05 | `downloadCSV()` ustvari lokalni `Blob`, BOM doda serializator, ime je `folio-${project.id}.csv`. | P06 D01 preveri ime/BOM/zaključek; agentni test preveri, da URL in število strani ostaneta enaka; uspešno. |
| R06 | `quote()` obdaja vsako polje z narekovaji in podvoji notranje narekovaje; ločilo je `;` ali `,`. | P06 D02/D03 in agentni test z obema ločiloma, vejico ter narekovaji; uspešno. |
| R07 | `serializeTasks()` združuje zapise s CRLF in ga doda tudi na koncu; vsebinski prelomi ostanejo v polju. | P06 D01/D03 ter agentni test z notranjim CRLF; uspešno. |
| R08 | `formulaPrefix = /^[ \t\r\n]*[=+@-]/`; apostrof se doda na začetek izvirne podatkovne vrednosti, pred narekovanjem. | P06 D03 in agentni primeri `=`, `+`, `-`, `@` z začetnim whitespace; uspešno. |
| R09 | `task[column]` se neposredno serializira, brez oblikovanja statusa/datuma ali trimanja besedila. | P06 D03 Unicode/opis; agentni primer preveri interno stanje in datum `YYYY-MM-DD`; uspešno. |
| R10 | Vse tri nastavitve so v `ProjectView`, ki ob menjavi samo `view` ostane ista instanca. | P06 D04 in agentni test enakosti imena in vsebine prenosa po preklopu; uspešno. |
| R11 | `ProjectView key={project.id}` ponastavi lokalno stanje ob menjavi projekta; osvežitev ustvari privzeto stanje. | Agentni test najprej spremeni stolpec, filter in ločilo ter potrdi ponastavitev po navigaciji in osvežitvi; uspešno. |
| R12 | Izvoz bere samo `tasks`; brez novih zapisovalnih klicev ali sprememb obstoječega prikaza. Stara tabela/tabla, `data-task-id` in `aria-label` ostanejo. | P06 D04 preveri zapisovalne zahteve in širino strani; agentni testi preverijo nespremenjen pogled ter brez navigacije; osnovni testi potrjeni na desktop/mobile; uspešno. |

### Preverjanja in omejitve

- Zadnji `npm run check`: uspešno. ESLint, TypeScript, Vite produkcijska gradnja in Playwright so zaključili brez napak. Skupaj `51 passed`: 38 osnovnih, 8 razvojnih P06 in 5 agentnih. Playwright je uporabil konfigurirani `chromium.connect(wsEndpoint)`; razvojni nabor je tekel v desktop in mobile projektih.
- Razvojni D04 in preverjanje ozkega prikaza potrjujeta, da izvozna kontrola ne razširi strani; uporabljena je mobilna konfiguracija projekta Playwright. Ročni vizualni ogled ni bil izveden.
- Javni internet je blokiran po navodilih; ni bil potreben. V okolju se pojavljajo npm opozorila za neznan `http-proxy` config in barvne spremenljivke; niso vplivala na rezultate.
- `git diff --check` ni mogel steči: okoljski ukaz `git` je vrnil napako `xcrun: invalid active developer path` zaradi manjkajočega `/Library/Developer/CommandLineTools`. Zato git status/diff ni bil potrjen; seznam sprememb je preverjen neposredno prek dovoljenih datotek. Nobena skupna infrastruktura, odvisnost, skupni test ali navodilo ni bila spreminjana.
- V predani specifikaciji ali izvirnih zahtevah nisem ugotovil napake; nepreverjen ostaja samo ročni vizualni ogled. Končni Playwright suite preveri funkcionalni prikaz na namizni in mobilni konfiguraciji.

| Korak | Zahteve | Rezultat |
| --- | --- | --- |
| Implementacija in testni scenariji | R01–R12 | Zaključeno v dovoljenih mapah. |
| Končni `npm run check` | Slog, tipi, gradnja, osnovni/P06/lastni testi | 51/51 uspešno. |
| Predaja pregledovalcu | Poročilo in dokazila | Zapis zaključen pred rokom faze. |
