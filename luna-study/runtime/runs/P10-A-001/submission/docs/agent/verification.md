# Preverjanje P10

## Izvedeni ukazi

| Ukaz | Rezultat | Dokaz |
| --- | --- | --- |
| `npm run check` | Uspešno: lint, TypeScript preverjanje, Vite build in 54/54 Playwright testov. | Izhod vsebuje 14 API testov, 12 desktop in 12 mobile regresijskih testov, 4 razvojne P10 teste na desktopu, 4 na mobile ter 8 agentnih P10 testov; `54 passed (23.2s)`. |
| `npx playwright test --project=agent` | Uspešno: 8/8 agentnih P10 testov. | `8 passed (6.2s)` po zadnji spremembi asercij v agentnem testu. |
| `git diff --check` | Orodje se ni zagnalo. | Ukaz `git` je odpovedal z `xcrun: invalid active developer path`; nadomestni `rg -n '[\t ]+$' ...` nad spremenjenimi datotekami ni našel zaključnih presledkov. |

Oba Playwright zagona sta uporabila lokalni testni strežnik in vnaprej nastavljeni Chromium. `npm` je izpisal opozorilo za neznano konfiguracijo `http-proxy`, Node pa opozorilo `NO_COLOR`/`FORCE_COLOR`; ukazi so kljub temu uspešno zaključili. Nobene nastavitve ali infrastrukture nisem spreminjal.

## Sledljivost zahtev

| Zahteva | Preverjanje in rezultat | Implementacija |
| --- | --- | --- |
| R01 | Agentni testi preverijo izvorni vrstni red, oznake mest ter 12 različnih ID-jev z enakimi naslovi; mesto zadnjega je 12. Uspešno. | `src/App.tsx`: začetno stanje in globalni `orderedTasks`; `src/OrderControls.tsx`: oznaka mesta. |
| R02 | D01 in agentni testi preverijo premik za eno globalno mesto v tabeli in tabli. ID opravila s statusom `done` ohrani prikazan status; counts ostanejo `[4,2,2]`. Uspešno. | `src/App.tsx`: `move`; `src/TaskBoard.tsx`: kartice sledijo globalno urejenemu seznamu. |
| R03 | D01 in agentni testi preverijo onemogočena robna dejanja ter enojni seznam. Po undo ostane redo zgodovina nedotaknjena, kadar je robni gumb onemogočen. Funkcija `move` ima še varovalo za neveljaven indeks. Uspešno. | `src/App.tsx`: varovalo v `move`; `src/OrderControls.tsx`: `disabled` na prvem/zadnjem mestu. |
| R04 | D02 ter agentni zaporedji premik/undo/reset-undo obnovijo točne permutacije in števec. Uspešno. | `src/App.tsx`: `move`, `undo`, `reset`. |
| R05 | D02 in 20-korakni agentni cikel preverita redo zaporedja in števce do končnega vrstnega reda. Uspešno. | `src/App.tsx`: `redo`. |
| R06 | D03 preveri, da nov veljaven premik počisti redo; agentni primer preveri, da je robni premik onemogočen in redo števec ostane 1. Uspešno. | `src/App.tsx`: `move` počisti `redo` samo po veljavnem premiku. |
| R07 | Agentni primer opravi 22 veljavnih izmeničnih premikov, nato 20 undo in 20 redo. Števci in obnovljeni vrstni red so pravilni. Uspešno. | `src/App.tsx`: `addUndo(...).slice(-20)`. |
| R08 | D04 ter agentni test preverita reset kot eno zgodovinsko dejanje, undo/redo reset ter onemogočen gumb, ko je vrstni red že izvoren. Uspešno. | `src/App.tsx`: `reset` in pogoj gumba `Začetni vrstni red`. |
| R09 | D04 in agentni premik `web-02` prek globalnega soseda v drugem statusnem stolpcu preverita rank ter število kartic. Statusni pregled ostane nespremenjen. Uspešno. | `src/TaskBoard.tsx`: fiksni stolpci in globalni indeks; `src/OrderControls.tsx`. |
| R10 | Agentni test preklopi projekt, osveži stran, preklopi pogled in odpre/zapre podrobnosti. Projekt/osvežitev začneta iz API vrstnega reda; pogled/podrobnosti ohranijo premik in zgodovino. Uspešno. | `src/App.tsx`: lokalni `TaskWorkspace`, ključ projekta in modal znotraj workspacea. |
| R11 | D02, D03, agentni prazni/enojni primer in 20-korakni cikel preverijo točno besedilo števcev ter disabled stanje pri ničli. Uspešno. | `src/App.tsx`: `role=status`, besedilo in disabled pogoji. |
| R12 | D04 ter agentni testi preverijo odsotnost zapisnih API zahtev, nespremenjene counts/status in pri širini 390 px brez širjenja strani z notranjim drsenjem tabele/table. Uspešno. | `src/App.tsx`, `src/TaskBoard.tsx`, `src/styles.css`. |

## Omejitve

- Preverjeni so skupni izhodiščni in razvojni testi ter 8 lastnih scenarijev; morebitnih ločeno pripravljenih končnih skritih testov nisem prejel in jih ne navajam kot izvedene.
- Obnašanje je preverjeno s podatki z 0, 1, 8 in 12 opravili, vključno z enakimi naslovi. Vseh možnih vrednosti za zelo dolge sezname ali vsako kombinacijo unicode znakov v ID-jih nisem posebej generiral.
- Začetni agentni zagon je vseboval neuspešen test, ker je dvakrat uporabil helper, ki doda prestrezno pot na isto Playwright stran. Scenarij sem ločil v samostojen test s svežo stranjo; končni agentski zagon (8/8) in celotni `npm run check` (54/54) sta uspela.
- `git status --short` je iz istega razloga nedostopen; seznam datotek sem preveril neposredno. Delo je omejeno na `src/`, `tests/agent/` in `docs/agent/`; `dist/` in `test-results/` sta v `.gitignore` in sta ustvarjena kot preverjevalna izhoda.
