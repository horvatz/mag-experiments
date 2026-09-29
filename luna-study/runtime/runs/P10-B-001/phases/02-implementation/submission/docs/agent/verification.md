# Implementacija in preverjanje

## Začetni zapis

Vloga: implementer za P10-B-001. Upoštevam izvorne R01–R12 iz `task/instructions.md` in predano `docs/agent/specification.md`; dovoljene spremembe so `src/`, `tests/agent/` in ta zapis. Ne spreminjam specifikacije, skupnih testov, infrastrukture ali odvisnosti.

## Izvedba

- `src/App.tsx`: `ProjectView` zabeleži izvorno permutacijo ob prvem GET-u; hrani trenutni vrstni red in sklada, premika ID-je z globalno sosednjo zamenjavo, omeji razveljavitve na 20 ter izvaja undo, redo in reset. Ključ projekta povzroči ponastavitev ob menjavi projekta; navigacija pogleda in podrobnosti ne razmontira `ProjectView`.
- `src/App.tsx` in `src/TaskBoard.tsx`: tabela in tabla dobita enako urejeno zaporedje. Statusi, vsebina opravil, števci, GET podrobnosti in API ostanejo nedotaknjeni. Dostopno mesto je izračunano iz globalnega zaporedja; kontrole premika so zunaj povezav.
- `src/styles.css`: dodan slog zgodovine in premikov, vsebnik preglednice/table ohranja notranje vodoravno drsenje.
- `tests/agent/P10.history.spec.ts`: dodani so scenariji za 21 premikov in mejo 20, reset kot razveljavljivo dejanje, prazno/enoelementno zbirko ter ID-je z ločili, podvojene naslove in premik med stanji.

## Sledljivost zahtev

| Zahteva | Implementacija | Izvedeni dokaz |
| --- | --- | --- |
| R01 | `ProjectView` vzpostavi `original/current`; vrstica/kartica kaže `index+1` po ID-ju. | `[agent] board keeps arbitrary IDs…`; preveri začetno mesto, podvojena naslova in nestandardne ID-je. |
| R02 | `move` zamenja le sosednja ID-ja; gumbi so izven povezave. | `[development-desktop/mobile] D01`; `[agent] board keeps arbitrary IDs…`. |
| R03 | Robni gumbi imajo `disabled`; `move` preveri trenutni indeks in soseda še v posodobitvi stanja. | `[development-desktop/mobile] D01`; `[agent] one task project…`. |
| R04 | `remember` shrani predhodno permutacijo; `undo` obnovi zadnji element sklada. | `[development-desktop/mobile] D02`; `[agent] history is capped…` (razveljavitev/reset). |
| R05 | Undo/redo premeščata cele ID permutacije in ohranjata enoličnost. | `[development-desktop/mobile] D02`; `[agent] history is capped…` (20× redo/undo). |
| R06 | Veljaven `move` nastavi `redo: []`; neveljaven prehod vrne isto stanje. | `[development-desktop/mobile] D03` (veljaven premik zavrže redo). Robni poskus ob neničelnem redo ni posebej izveden. |
| R07 | `remember(...).slice(-20)` ohrani zadnjih 20 stanj. | `[agent] history is capped…`: 21 premikov, števec 20 ter 20 undo/redo. |
| R08 | `resetOrder` ničesar ne naredi, če je vrstni red že izvoren; sicer shrani trenutno stanje in izprazni redo. | `[development-desktop/mobile] D04`; `[agent] history is capped…` (reset, disabled, undo). |
| R09 | Tabla filtrira že urejeni globalni seznam po stalnih stolpcih; status ni del operacije premika. | `[development-desktop/mobile] D04`; `[agent] board keeps arbitrary IDs…` preveri globalno mesto in ostanek kartic v stolpcih. |
| R10 | Stanje je v `ProjectView` in `key={project.id}`; ne zapisuje se trajno. | Baseline testi `board navigation preserves…`, `direct task links survive refresh…`; obnovitev lokalnega reda po osvežitvi/projektni menjavi ni neposredno zajeta v lastnem testu. |
| R11 | Živ statusni element prikazuje dolžine skladov; gumbi undo/redo/reset sledijo stanju. | `[development-desktop/mobile] D02–D04`; `[agent] empty project…`, `[agent] one task project…`. |
| R12 | Vrstni red je lokalni seznam ID-jev; counts izvirajo iz nespremenjenih taskov; API klicev za zapis ni. | `[development-desktop/mobile] D04` preveri brez zapisov in brez horizontalnega razširitve strani; `[agent] board keeps arbitrary IDs…` preveri ID-je/status stolpce. |

## Rezultati preverjanja

- `npx playwright test --project=agent`: uspešno, 4/4 (vključno z 21 premiki, praznim in enoelementnim projektom, posebnimi ID-ji).
- `npm run check`: uspešno, lint, typecheck, Vite build in 50/50 testov (14 API, 24 baseline za namizje/mobilno, 8 razvojnih za namizje/mobilno, 4 lastni agentovi). Build je ustvaril CSS/JS snop brez napak.
- Razvojni testi preverjajo mobilno širino naprave (390 px) in odsotnost horizontalnega razširitve celotne strani. Ročni vizualni pregled ni izveden.
- Omejitve okolja: Playwright uporablja Chromium prek `task/browser.json` in nastavljenega `wsEndpoint`; `chromium.launch()` ni bil klican. npm je izpisal opozorilo o neznani nastavitvi `http-proxy`, procesi Node pa opozorila `NO_COLOR`/`FORCE_COLOR`; preverjanja so se kljub temu uspešno zaključila. Poskus `git status` ni deloval, ker je okolje javilo manjkajočo aktivno pot `xcrun` (`/Library/Developer/CommandLineTools`); status repozitorija zato ni potrjen.

## Dnevnik sprememb in rezultati

- 2026-09-27: začetni zapis shranjen pred implementacijo. Pregledani `ProjectView`, `TaskBoard`, `TaskDetails`, `useResource`, obstoječi CSS in štirje razvojni scenariji.
- 2026-09-27: dodana lokalna zgodovina permutacij, dostopne kontrole in lastni testi.
- Prvi poskus lastnih testov je odkril napaki v testnem scenariju (drugo dejanje je bilo robno/neveljavno; dve različni podatkovni fixture sta bila zaporedno naložena v istem testu). Testi so bili popravljeni in `--project=agent` je uspešno opravil 4/4.
- Končni `npm run check` po popravkih: 50/50 uspešno; predaja pregledovalcu.
