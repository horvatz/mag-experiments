# Implementacija in preverjanje P07

## Začetni zapis

Vloga: implementer. Specifikacija `docs/agent/specification.md` opredeljuje R01–R12; izvirne zahteve v `task/instructions.md` ostajajo merodajne. Dovoljene spremembe so `src/`, `tests/agent/` in ta implementacijski zapis. Ne spreminjam specifikacije, njene zgodovine, skupnih testov ali infrastrukture.

## Izvedba in sledljivost

Implementacija je v `src/useFavorites.ts` (branje, validacija, zapis, zunanji dogodki in izjeme), `src/App.tsx` (stanje projektnega filtra, kontrole, števec in filtriranje vrstice) ter `src/TaskBoard.tsx` (iste priljubljene in filtrirane naloge na tabli). Gumb je v `src/components.tsx`, odzivni slogi/opozorilo v `src/styles.css`. Dodatni scenariji so v `tests/agent/favorites.spec.ts`.

| Zahteva | Povezava s pogojem | Test in dejanski dokaz |
| --- | --- | --- |
| R01 | Članstvo se preklopi po ID-ju; gumb je ločen od povezave. | D01 prestane v `npm run check`; test neveljavnih/veljavnih ID-jev in osvežitve v `tests/agent/favorites.spec.ts` prestane. |
| R02 | Shrani samo unikatne ID-je po privzetem JS vrstnem redu pod `folio:favorites:v1`. | D03 in agentni test obnove/kanonizacije prestaneta; preverita JSON po zapisu. |
| R03 | Obnova v `Set` deduplicira in obdrži neznane ID-je. | Agentni test obnove `future-task` in dvojnega `web-02` prestane. |
| R04 | Neveljaven zapis pomeni prazen nabor in se pri nalaganju ne prepiše. | Agentni test pokrije neveljaven JSON, napačno različico, manjkajoče `ids`, neniz in manjkajoč ključ; 5 primerov prestane. |
| R05 | `visibleTasks = tasks.filter(...)` ob vključenem filtru, sicer API vrstni red; filter se zažene izključen. | D02 prestane; projektni agentni test preveri filtriranje. |
| R06 | Odstranitev posodobi isti nabor; prazen aktiven filter izpiše določeno besedilo. | D02 prestane v `npm run check`. |
| R07 | Preglednica in tabla dobita isti `visibleTasks` in `favorites`; povezave še naprej uporabljajo ID. | D01, D04 in regresijski baseline za podrobnosti po ID-ju prestanejo v `npm run check`. |
| R08 | `favorites` je v `App`; ključ `ProjectView` ponastavi filter ob menjavi projekta. | Agentni projektni test potrdi ponastavitev filtra; D03 potrdi obnovo po osvežitvi. |
| R09 | Brisanje filtrira globalni nabor po vseh `tasks` trenutnega projekta. | Agentni projektni test preveri ohranitev `foreign-task` in onemogočen gumb po brisanju. |
| R10 | Statusno besedilo šteje `projectFavoriteIds` proti vsem `tasks`; stolpci table preštejejo prej filtrirane vnose. | Razvojni D04 ter mobilni/namizni baseline prestanejo; natančni dodatni robni števci niso bili posebej preverjeni. |
| R11 | Listener preverja ključ; `null` razčleni kot prazno; sinhronizacija ne kliče zapisovalne poti. Izjeme branja/zapisa so ujete in opozorjene. | Agentni testi za dogodke, napako branja in napako zapisa prestanejo; brez API zapisov. |
| R12 | Spremembe delujejo v React/localStorage brez API pozivov ali sprememb `Task`. | `readonly` v D04 preveri nič API zapisov in `scrollWidth <= innerWidth`; prestanejo namizni in mobilni testi. |

Pred iztekom faze je `npm run check` prestal lint, TypeScript, gradnjo in vseh 49 takratnih testov (14 API, 24 baseline, 8 P07 razvojnih, 3 agentni). Po razširitvi agentne pokritosti je `npx playwright test --project=agent` prestal vseh 5 agentnih testov. NPM je med zagoni izpisal opozorilo o neznani `http-proxy` nastavitvi; ni vplivalo na rezultate.

## Spremembe in dokazi

Predaja pregledovalcu: testna koda je bila spremenjena po celotnem `npm run check`, zato je zadnji končni zagon pokrival popravljeno agentno zbirko, ne pa ponovnega polnega 51-testnega zagona. Končnih skritih testov ni mogoče preveriti. Omejitve okolja: `git diff` ni deloval, ker sistemski `xcrun` javlja neveljavno Command Line Tools pot; splet ni potreben in ni bil uporabljen.

Pregled specifikacije: ne vidim napake, ki bi preprečevala izvedbo. Specifikacija pravilno opozarja, da statusi v števcih table sledijo vidnim opravilom; preostali nepreverjeni robni primeri vključujejo poljubne Unicode ID-je v sortirnem vrstnem redu ter napake branja/zapisa v vseh brskalnikih.
