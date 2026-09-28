# Preverjanje P09

## Izvedeni zagoni

| Ukaz | Rezultat | Dokaz |
| --- | --- | --- |
| `npm run check` po končnih spremembah | Uspeh: ESLint, `tsc --noEmit`, Vite build in 53/53 Playwright testov. Testi: 14 API, 24 izhodiščnih desktop/mobile, 8 razvojnih desktop/mobile in 7 agentnih. | Končni izhod `npm run check` v tej seji; Playwright poroča `53 passed (19.6s)`. |
| `npx playwright test --project=agent` | Uspeh: 7/7 agentnih brskalniških testov. | `tests/agent/P09.spec.ts`; ciljni zagon pred končnim polnim zagonom. |

## Sledljivost zahtev

| Zahteva | Pogoj | Test/scenarij | Koda | Izid |
| --- | --- | --- | --- | --- |
| R01 | Pot in query takoj nastavita filtre, tudi na task/board poteh. | Razvojni D01; agentna neposredna projektna in task povezava s parametri; D03 ob osvežitvi. | `src/navigation.ts` `readRoute`; `src/App.tsx` | Uspešno: končni `npm run check`, 53/53. |
| R02 | Normaliziran dobesedni podniz polj title, description, assignee ali id. | Agentni test »literal Unicode search combines fields and status with AND«; preveri diakritiko, naslov, ID, odgovorno osebo in literalni `^=SUM`. | `src/navigation.ts` `normalizeSearch`; `src/App.tsx` `selectTasks` | Uspešno: končni `npm run check`, 53/53. |
| R03 | Status in fraza delujeta po IN; asc/desc uporabljata normaliziran naslov in ohranita izvorni vrstni red ob izenačitvi. | Agentna testa iskanja in »title sorting is normalized, stable…«; status `done`, asc in desc, podvojena naslova. | `src/App.tsx` `selectTasks` | Uspešno: končni `npm run check`, 53/53. |
| R04 | Prva podvojena vrednost zmaga, neveljavne vrednosti privzamejo začetne; parse ne spreminja URL-ja. | Agentni test »duplicate and unknown parameters…« preveri začetni URL pred potrditvijo. | `src/navigation.ts` `readRoute` | Uspešno: končni `npm run check`, 53/53. |
| R05 | Osnutek ne filtrira; Uporabi potrdi skupno, nespremenjena ponovitev ne ustvari vnosa zgodovine. | Razvojni D02; agentni test »draft is not applied…« preverja rezultate in `history.length`. | `src/App.tsx` `ProjectView.commit` | Uspešno: končni `npm run check`, 53/53. |
| R06 | Potrditev obreže q, izpusti privzete vrednosti, kodira query, ohrani board, odstrani neznane parametre. | Agentna testa podvojenih/neznanih parametrov ter ponastavitve. | `src/navigation.ts` `queryFor`, `projectUrl`; `src/App.tsx` `commit` | Uspešno: končni `npm run check`, 53/53. |
| R07 | Back/forward in reload obnovijo filtre, rezultat ter osnutek kontrol. | Agentni test »browser back and forward…«; razvojni D03 (board in reload). | `src/navigation.ts` `subscribe`, `useRoute`; `src/App.tsx` | Uspešno: končni `npm run check`, 53/53. |
| R08 | Pogled ohranja potrjeno stanje in nabor ID-jev; navigacija zavrže osnutek. | Agentna testa draft/view in podrobnosti/projekt; razvojni D03. | `src/App.tsx`; `src/TaskBoard.tsx`; `src/navigation.ts` URL gradniki | Uspešno: končni `npm run check`, 53/53. |
| R09 | Podrobnosti izberejo ID; zapiranje z gumbom/Escape ohrani query in način. | Agentno odpiranje neposredne task povezave s parametri, zaprtje z gumbom/Escape; izhodiščni test podvojenih naslovov. | `src/navigation.ts` `taskUrl`, `projectUrl`; `src/TaskDetails.tsx` | Uspešno: končni `npm run check`, 53/53. |
| R10 | Klik drugega projekta ponastavi filtre in ohrani način; neposredna povezava uporabi filtre. | Agentni test projekta: klik iz boarda in neposreden `#/projects/launch?status=done`. | `src/App.tsx` projektna navigacija; `src/navigation.ts` | Uspešno: končni `npm run check`, 53/53. |
| R11 | Reset upošteva pravila zgodovine, obdrži board, pokaže prazen rezultat in števec. | Agentni reset preveri `Ni zadetkov.`, `Prikazano: 0 od 8.`, čiščenje filtrov in `view=board`; razvojni D04 preveri reset in odsotnost zapisov. | `src/App.tsx`, `src/styles.css` | Uspešno: končni `npm run check`, 53/53. |
| R12 | UI samo bere `/api/`, brez localStorage/testnih kontrol/zapisovalnega API-ja; regresije in mobilna širina delujejo. | Pregled kode; razvojni D04 `readonly`; 38 izhodiščnih testov; agentni viewport 390 px. | Vse spremembe v `src/` | Uspešno: končni `npm run check`, 53/53. |

## Omejitve in opombe

- Testi uporabljajo nameščeni Chromium prek Playwright projekta. Ročni pregled v brskalniku ni bil izveden.
- P09 testi UI-ja uporabljajo nadzorovane podatke iz testnega helperja; UI ga ne uvaža in ne kliče testnih kontrol.
- Prvi shell here-doc poskus ustvarjanja specifikacije je zavrnil začasno datoteko. Datoteki sta bili nato ustvarjeni z dovoljenim patch postopkom.
- `git status --short` ni uspel zaradi okoljske napake `xcrun: invalid active developer path` (manjkajoča pot Command Line Tools). Izvoz je bil podan kot svež brez Git zgodovine; Git stanje ni bilo potrebno za implementacijo ali preverjanje.
- Prvi polni zagon je zaznal tri napačna pričakovanja v novih testih glede vrstnega reda kartic in naslovov. Testna pričakovanja so bila popravljena; končni ciljni in celotni zagon sta uspela.
