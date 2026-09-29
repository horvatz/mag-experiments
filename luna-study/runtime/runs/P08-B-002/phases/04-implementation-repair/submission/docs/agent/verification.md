# Implementacija in preverjanje P08

## Nadaljevanje po pregledu

- Začetni pregled `review.json`: R01–R12 pregledani; ena ugotovitev, `codeChangesRequired: true`, glede manjkajočega testa R11 za neprazen projekt s prazno skupino. Ugotovitev sprejemam: obstoječa koda ima sporočilo, vendar dosedanji testi tega stanja dejansko niso preverili.
- Dodal sem ločen agentni scenarij z nepraznim projektom, izbral `done` brez zadetkov, preveril točno sporočilo in preklop na `all` z vidnim ID-jem. Ciljni zagon `npx playwright test --project=agent tests/agent/P08.spec.ts`: 4/4 uspešni.
- Celoten `npm run check` po popravku: uspešno, 50/50 Playwright testov ter lint, tipi in gradnja.
- Ugotovitev R11 je odpravljena s testnim dokazom; specifikacije in pregleda nisem spreminjal. Preostale ugotovitve v `review.json` ni.

## Začetni načrt (2026-09-27)

- Pregledati obstoječi `src/` in razvojne P08 scenarije; poseg omejiti na uporabniški vmesnik in lastne teste.
- Implementirati razvrščanje po veljavnih koledarskih datumih, projektno lokalni referenčni datum/filter ter skupinske števce in sporočilo za prazno skupino.
- Ohranjati izbrane pogoje R01–R12 povezane z datotekami in dejanskimi preverjanji.
- Zagnati zahtevani `npm run check` ter ločene razvojne P08 teste, če čas in lokalno okolje to dopuščata; preveriti še razlike med ID-ji obeh pogledov in odzivno širino.
- Zabeležiti vsak izveden ukaz, rezultat ter omejitve okolja; nedostopnih testov ne označiti kot uspešnih.

## Izvedba in sledljivost

Implementacija uporablja `src/deadlines.ts` za koledarsko validacijo,
seštevanje dni prek UTC koledarskih komponent in razvrščanje po skupinah.
`src/App.tsx` hrani datum, besedilo polja, opozorilo in filter kot stanje
projektnega pogleda; iz njega izračuna vseh pet števcev ter poda filtriran
seznam isti tabeli ali tabli. `src/styles.css` doda Folio kontrolnike in
prilagodljivo postavitev. `tests/agent/P08.spec.ts` vsebuje štiri dodatne
scenarije.

| Zahteva | Koda | Preverjanje in dejanski izid |
| --- | --- | --- |
| R01 | `src/App.tsx` `INITIAL_REFERENCE_DATE`, stanje `deadlineFilter` | D01 in celoten `npm run check`: začetni datum `2026-09-21`, skupina `all`; uspešno. |
| R02 | `src/deadlines.ts` `getDeadlineGroup` najprej obravnava `done` | D04 in agentni mejni scenarij z opravili `done` in roki pred/na referenčni datum; uspešno. |
| R03 | `src/deadlines.ts` primerjava koledarskih nizov | D01 preveri overdue; agentni scenarij preveri predhodni datum in datum danes; uspešno. |
| R04 | `src/deadlines.ts` meja `referenceDate + 7`; filter v `src/App.tsx` | D02 preveri vključujoči `D+7`; agentni scenarij preveri `D+7`, `D+8`, vse filtre in razdelitev; uspešno. |
| R05 | `src/deadlines.ts` `isCalendarDate` in `addCalendarDays` | Agentni scenarij teče v `Pacific/Kiritimati` in preveri prehod 2026–2027 ter `2024-02-29`; uspešno. Izračun ne uporablja lokalnega časa. |
| R06 | `src/App.tsx` `deadlineCounts` / `.deadline-summary` | D02 preveri `week`; agentni scenarij preveri vseh pet števcev in njihovo nespremenjenost ob vsakem filtru; uspešno. |
| R07 | `src/App.tsx` `visibleTasks` | D01/D02/D04 in agentni scenarij preverijo skupine, izbrane ID-je in vrstni red izvornih podatkov; uspešno. |
| R08 | `src/App.tsx` `updateReferenceDate` | D03 preveri prazno polje, opozorilo, ohranjen izračun in naslednji veljaven datum; uspešno. |
| R09 | `src/App.tsx` skupni `visibleTasks` ter obstoječi `TaskBoard` | D04 preveri tablo; agentni scenarij primerja ID-je po preklopu in ohranitev datumskega besedila ter filtra; uspešno. |
| R10 | `ProjectView key={project.id}` in samo lokalno stanje | Agentni scenarij menja projekt, osveži stran in preveri privzete vrednosti, URL ter `localStorage`; uspešno. |
| R11 | `src/App.tsx` prazen prikaz in `.deadline-empty` | Agentni scenarij »neprazen projekt v prazni skupini pokaže sporočilo in omogoča vrnitev na vse« preveri točno sporočilo, nič vidnih ID-jev in vrnitev na `all`; uspešno. |
| R12 | `src/App.tsx`, `src/TaskBoard.tsx`, `src/styles.css` | D04 preveri bralno uporabo in odsotnost zapisov; agentni scenarij preveri 390 px brez širjenja strani in API zapise; osnovni testi ohranitev Folio/podrobnosti. Uspešno. |

### Rezultati zagonov

- `npm run typecheck` — uspešno.
- `npm run lint` — uspešno.
- `npx playwright test --project=development-desktop --project=development-mobile tests/development/P08.spec.ts tests/agent/P08.spec.ts` — 8/8 razvojnih P08 testov uspešnih na obeh prikazih. Ta ukaz ni zagnal agentnega projekta; lastni testi so bili posebej zagnani spodaj in vključeni v celoten pregled.
- `npx playwright test --project=agent tests/agent/P08.spec.ts` — 4/4 lastni scenariji uspešni, vključno s popravljeno pokritostjo R11.
- Končni `npm run check` po pregledu — uspešno: lint, tipi, gradnja in 50/50 Playwright testov (14 API, 12 desktop osnovnih, 12 mobile osnovnih, 8 razvojnih P08, 4 agentni).
- Med pripravo testov je začetna agentna različica imela napačno pričakovanje števila overdue opravil; preveril sem fixture in popravil pričakovanje. Končna agentna in celotna preverjanja so zelena.

Specifikacijske napake, ki bi preprečevala izvedbo, nisem zaznal. Vhodni API datumi so po domeni veljavni; UI za neveljavne vrednosti ohrani zadnji izračun in opozori.

### Omejitve okolja

- `git status --short --branch` ni uspel; sistemski `xcrun` sporoča, da manjka `/Library/Developer/CommandLineTools`. Zato v tem okolju nisem mogel potrditi git statusa ali imena veje. Implementacijski posegi so bili omejeni na `src/`, `tests/agent/` in ta dokument; orodja so ustvarila tudi običajne izhode gradnje/testov.
- npm izpiše opozorilo `Unknown env config "http-proxy"`, Playwright pa opozorila glede `NO_COLOR`/`FORCE_COLOR`; ta opozorila niso preprečila preverjanj.
- Začetni preostanek ob branju pravil: 581 sekund faze in 941 sekund skupnega časa (`node task/time-budget.mjs`).
